// Verhaal: de stad praat. Meer soorten mensen (scholieren, bouwvakkers, moeders, skaters, koeriers, verpleegkundigen, opa's,
// hipsters) en veel meer wat ze zeggen: tegen elkaar (korte gesprekjes die kloppen), zomaar op straat, en als Luca langskomt
// (met de rode jas, op de fiets, 's nachts, in de regen, later in het verhaal als hij bekend wordt in de buurt).
// Haakt in op stad-npc.js via G.npcGewicht (wie loopt waar), G.npcPraat (zomaar iets) en G.npcChat (gesprekjes).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP;if(!G||!M||!M.VERHAAL)return;
const pick=a=>a[Math.floor(Math.random()*a.length)],rr=(a,b)=>a+Math.random()*(b-a);
const SK=['#e9b98f','#d9a27a','#b97a52','#8d5a3a','#f1caa5','#6e4630','#c8956a'];
/* ---------- nieuwe soorten mensen (uiterlijk zoals de rest van stad-npc.js) ---------- */
const NIEUW={
 scholier:{n:'Scholier',col:'#9ad0ff',wallet:.1,tough:1,call:.3,v:[1.2,1.8],look:()=>({top:pick(['#ff7a1a','#3ad6ff','#e8584a','#3fe395','#b45cff','#2a2c30']),arm:'top',pants:pick(['#2c3a4d','#1d2531','#3a3c40']),shoe:pick(['#e8e4da','#2a2c30']),hat:Math.random()<.3?'cap':'none',hatC:pick(['#1d1d1f','#c0261e','#e8e4da'])}),
  names:['Noah','Sem','Yara','Liam','Noor','Imran','Sophie'],talk:['Hebben we morgen wiskunde?','Ik heb mijn huiswerk niet.','Wie gaat er mee naar de snackbar?']},
 bouwvakker:{n:'Bouwvakker',col:'#ff9a3a',wallet:.5,tough:4,call:.4,v:[1.0,1.3],look:()=>({top:'#ff7a1a',arm:'top',pants:'#3a3c40',shoe:'#5a3a24',hat:'cap',hatC:'#f2c230',beard:Math.random()<.5?1:0}),
  names:['Kees','Mo','Henk','Dennis','Bram'],talk:['Om zeven uur begonnen, hè.','Die steiger gaat er pas volgende maand af.','Koffie? Altijd koffie.']},
 moeder:{n:'Moeder',col:'#ffb0d0',wallet:.6,tough:1,call:.6,scream:1,v:[.9,1.2],look:()=>({top:pick(['#c87a8a','#7a9aba','#d8c090','#6a8a6a']),arm:'top',pants:pick(['#2c3a4d','#4a4a50']),shoe:'#3a2a20',hat:'none',long:1}),
  names:['Sandra','Esra','Monique','Yasmina','Ilse'],talk:['Waar is dat kind nou weer?','Nog boodschappen doen.','Om half zes eten, hè!']},
 skater:{n:'Skater',col:'#c8ff5a',wallet:.15,tough:3,call:.2,v:[1.7,2.3],look:()=>({top:pick(['#e8e4da','#2a2c30','#3fe395','#ff4fd8']),arm:'skin',pants:'#1d2531',shoe:'#2a2c30',hat:Math.random()<.5?'beanie':'cap',hatC:pick(['#1d1d1f','#3a6aff'])}),
  names:['Jayden','Milo','Sven','Kai'],talk:['Kickflip, man. Bijna.','Bij het station is een nieuwe ramp.','Die trap? Twaalf treden.']},
 koerier:{n:'Koerier',col:'#f2c230',wallet:.3,tough:2,call:.3,v:[1.6,2.1],look:()=>({top:pick(['#f2c230','#3fbf5f','#3a8ad6']),arm:'top',pants:'#1d1d1f',shoe:'#2a2c30',hat:'cap',hatC:'#1d1d1f'}),
  names:['Daan','Omar','Lisa','Tim'],talk:['Nog drie adressen.','Die app stuurt me altijd de verkeerde kant op.','Fooi? Wat is fooi?']},
 verpleeg:{n:'Verpleegkundige',col:'#7fd1c7',wallet:.4,tough:2,call:.7,v:[1.1,1.4],look:()=>({top:'#5ab8b0',arm:'top',pants:'#5ab8b0',shoe:'#e8e4da',hat:'none',long:Math.random()<.6?1:0}),
  names:['Anouk','Ricardo','Femke','Samira'],talk:['Twaalf uur dienst. Ik val om.','Nachtdienst. Weer.','Heb jij koffie bij je?']},
 opa:{n:'Opa',col:'#d8d4cc',wallet:.5,tough:0,call:.4,v:[.5,.75],look:()=>({top:pick(['#6a5a4a','#4a5a6a','#5a4a3a']),arm:'top',pants:'#4a4a50',shoe:'#2a2018',hat:Math.random()<.35?'hat':'none',hatC:'#3a3a3a',hair:'#c9c4b8',beard:Math.random()<.4?1:0}),
  names:['Opa Wim','Meneer Bakker','Joop','Ali Baba','Gerrit'],talk:['Vroeger was hier een bakker.','Mijn knie voorspelt regen.','Die jeugd van tegenwoordig.']},
 hipster:{n:'Hipster',col:'#c9a227',wallet:.7,tough:1,call:.4,v:[1.0,1.3],look:()=>({top:pick(['#5a6a4a','#7a3a2a','#3a4a5a']),arm:'top',pants:'#2a2c30',shoe:'#5a3a24',hat:Math.random()<.5?'beanie':'none',hatC:'#7a4a2c',beard:1,glasses:Math.random()<.6?1:0}),
  names:['Jasper','Fleur','Thijs','Lotte'],talk:['Deze koffie is ethisch gebrand.','Ik werk aan een podcast.','Vinyl klinkt gewoon warmer.']}};
function setup(){const A=G.npcA;if(!A)return false;Object.keys(NIEUW).forEach(k=>{if(!A[k])A[k]=NIEUW[k]});return true}
const su=setInterval(()=>{if(setup())clearInterval(su)},300);
// wie loopt waar (bovenop de gewichten van stad-npc.js)
G.npcGewicht=function(W,d,night){const u=uur();
  W.scholier=/Westbuurt|Centrum/.test(d)?(u>=8&&u<17?1.4:u<20?.6:.1):.2;
  W.bouwvakker=(u>=7&&u<17)?(/Zuidas|Haven|Bedrijven|Centrum/.test(d)?.9:.3):.03;
  W.moeder=(u>=8&&u<20)?(/Westbuurt|Oud-Zuid|Tuin/.test(d)?.9:.35):.05;
  W.skater=/Boulevard|Centrum|Westbuurt|Strand/.test(d)?(night?.35:.6):.15;
  W.koerier=.25+(u>=17&&u<22?.35:0);
  W.verpleeg=/Ziekenhuis|Oud-Zuid|Centrum/.test(d)?.5:.12;
  W.opa=(u>=8&&u<19)?(/Westbuurt|Oud-Zuid|Gracht/.test(d)?.7:.3):.05;
  W.hipster=/Centrum|Gracht|Oosterstraat|Boulevard/.test(d)?.7:.12};
/* ---------- context ---------- */
function uur(){try{const k=G.story&&G.story.klok&&G.story.klok();return k?k.uur:13}catch(e){return 13}}
function deel(){const u=uur();return u<6?'nacht':u<11.5?'ochtend':u<17?'middag':u<21.5?'avond':'nacht'}
const st=()=>{try{return G.story&&G.story.st()}catch(e){return null}};
const jas=()=>{try{return !!(G.story&&G.story.flag&&G.story.flag('jas'))&&!(G.binnen&&G.binnen.waar&&G.binnen.waar())}catch(e){return false}};
const fiets=()=>!!(G.fiets&&G.fiets.actief&&G.fiets.actief());
const ch=()=>{const s=st();return (s&&s.ch)||1};
const hitte=()=>{const s=st();return (s&&s.m&&s.m.hitte)||0};
const regen=()=>(G.rain||0)>.3;
const wijk=n=>{try{return M.districtAt(n.x,n.z)||''}catch(e){return ''}};
/* ---------- zomaar iets (per soort, per dagdeel, het weer, de wijk) ---------- */
const ZOMAAR={
 algemeen:{ochtend:['Goeiemorgen.','Ik ben al te laat.','Eerst koffie.','Weer die tram vol.','Wat is het fris, hè.'],
   middag:['Pff, druk vandaag.','Even boodschappen.','Heb je het nieuws gezien?','Wat een rij bij de bakker.','Mooi weertje.'],
   avond:['Eindelijk vrij.','Wat eten we vanavond?','Nog even naar de supermarkt.','Wat wordt het vroeg donker.','Lekker rustig zo.'],
   nacht:['Waar is mijn fiets?','Nog één biertje dan.','Ik moet echt naar huis.','Wat een stilte.','Was dat een sirene?']},
 regen:['Natuurlijk regent het.','Paraplu vergeten. Weer.','Ik ben doorweekt.','Dit is geen weer.'],
 student:['Tentamen morgen. Ik weet niks.','Zullen we pizza bestellen?','Mijn kamer is te klein.','Ik leef op noedels.'],
 toerist:['Is dit de weg naar het strand?','So beautiful!','Waar is de gracht?','Nog een foto. Nog één.'],
 zakenman:['Ik bel je terug, ik loop.','Die deal moet vandaag rond.','Zuidas, kwart over. Ja.','Mijn agenda zit vol.'],
 oma:['Vroeger kostte brood een kwartje.','Mijn kleinzoon belt nooit.','Die fietsers! Altijd zo hard.','Heeft u ook die nieuwe buren?'],
 jogger:['Nog twee kilometer…','Hijg… hijg…','Persoonlijk record!'],
 rivaal:['Wat kijk je nou?','Dit is onze straat.','Doorlopen, maat.','Ik heb niks gezien.'],
 agent:['Rustig aan, jongens.','Alles in orde hier?','Fietslicht aan, hè.','Goedenavond.'],
 burger:['Druk vandaag, hè?','Pas op je tas hier.','Weer een overval, las ik.','Waar blijft die tram?'],
 scholier:['Ik heb mijn huiswerk niet.','Gym was echt slopend.','Wie gaat er mee chillen?','Mijn moeder appt me weer.','Nog één uur… was het maar zo.'],
 bouwvakker:['Om zeven uur begonnen.','Die steiger moet eraf.','Koffie? Altijd koffie.','Wie heeft mijn hamer?'],
 moeder:['Waar is dat kind nou weer?','Om half zes eten, hè!','Nog naar de apotheek.','Niet rennen, Sem!'],
 skater:['Kickflip, bijna.','Bij het station is een ramp.','Twaalf treden, man.','Plank kapot. Weer.'],
 koerier:['Nog drie adressen.','Die app is gestoord.','Fooi? Bestaat niet.','Vierde trap vandaag.'],
 verpleeg:['Twaalf uur dienst.','Nachtdienst. Weer.','Iemand koffie?','Ik droom van mijn bed.'],
 opa:['Vroeger was hier een bakker.','Mijn knie voorspelt regen.','Die jeugd tegenwoordig.','Toen was alles beter.'],
 hipster:['Ethisch gebrande koffie.','Ik werk aan een podcast.','Vinyl klinkt warmer.','Dit buurtje wordt hip.']};
const WIJK=[[/Westbuurt/,['De Westbuurt, man.','Hier woont iedereen al jaren.','Heb je de nieuwe snackbar gezien?']],
 [/Zuidas/,['Alles is hier glas.','Een broodje van acht euro.','Hier werkt niemand na zessen.']],
 [/Boulevard|Strand/,['Ruik je de zee?','Strandtent of terras?','Wat een wind hier.']],
 [/Haven/,['Containers tot de horizon.','Die kranen staan nooit stil.','Ruikt naar diesel.']],
 [/Centrum|Gracht/,['Wat een toeristen.','Mooi, die grachten.','Zullen we een terrasje pakken?']],
 [/Oud-Zuid/,['Rustig buurtje, hè.','Iedereen heeft hier een hond.','Mooie huizen.']]];
G.npcPraat=function(n){if(Math.random()<.2&&regen())return pick(ZOMAAR.regen);
  const w=wijk(n);if(Math.random()<.22){for(const [re,L] of WIJK)if(re.test(w))return pick(L)}
  const eigen=ZOMAAR[n.arch];if(eigen&&Math.random()<.6)return pick(eigen);
  return pick(ZOMAAR.algemeen[deel()])};
/* ---------- gesprekjes tussen twee mensen (ze praten om de beurt, de zinnen horen bij elkaar) ---------- */
const GESPREK=[
 ['Hoe is het met je moeder?','Beter. Ze is weer thuis.','Gelukkig. Doe de groeten.','Zal ik doen.'],
 ['Heb je het gehoord?','Nee, vertel!','Bij de haven. Politie overal.','Echt? Weer?'],
 ['Kom je zaterdag?','Als ik niet moet werken.','Je moet altijd werken.','Ja, nou.'],
 ['Wat een weer, hè.','Zeg dat wel.','Morgen schijnt het beter.','Dat zeggen ze altijd.'],
 ['Ken jij die jongen van Bella Napoli?','Die met de rode jas?','Ja. Die is altijd druk.','Werkt hard, die jongen.'],
 ['Huur gaat weer omhoog.','Weer? Hoe dan?','Geen idee. Ik verhuis.','Waarheen dan?'],
 ['Pizza vanavond?','Bella Napoli of Rapido?','Napoli. Altijd Napoli.','Goeie keuze.'],
 ['Mijn fiets is gejat.','Alweer? Derde deze maand!','Ik koop een tweedehands.','Ook gejat, waarschijnlijk.'],
 ['Gaat Ajax winnen?','Nooit van z\'n leven.','Wedden? Tientje.','Deal.'],
 ['Zie je die auto daar?','Die zwarte? Staat er al uren.','Rare mensen in.','Niet naar kijken.'],
 ['Heb jij een baantje?','Bij de supermarkt.','Betaalt dat wat?','Genoeg voor sneakers.'],
 ['Die nieuwe buren…','Lawaai?','De hele nacht muziek.','Bel de wijkagent.']];
const LATER=[['Die jongen van de hoek…','Welke jongen?','Je weet wel. Zeventien.','Daar bemoei ik me niet mee.'],
 ['Er wordt hier gedeald.','Hou je mond, joh.','Iedereen weet het.','Niemand zegt het.']];
G.npcChat=function(n){const m=n.mate;let d=n.dlg||(m&&m.dlg);if(!d||d.i>=d.L.length){const pool=ch()>=3?GESPREK.concat(LATER):GESPREK;d={L:pick(pool),i:0};n.dlg=d;if(m)m.dlg=d}
  const zin=d.L[d.i];d.i++;return zin};
/* ---------- als Luca langskomt ---------- */
const OPLUCA={
 jas:['Hé, pizza! Is die voor mij?','Bella Napoli! Ik heb honger.','Eén margherita, graag!','Ruikt lekker, jongen.','Pizzaman!','Is dat mijn bestelling?','Snel hoor, hij wordt koud!'],
 fiets:['Ho! Fietspad!','Bel dan, joh!','Kijk uit waar je rijdt!','Rustig aan, jongen!','Wow, die is snel.','Hé, niet over de stoep!'],
 nacht:['Moet jij niet in bed liggen?','Zo laat nog op pad?','Pas op hier, \'s nachts.'],
 bekend:['Hé, ik ken jou.','Jij bent toch van die hoek?','Daar heb je hem.','Kijk, de jongen van Rafiq.'],
 heet:['Doorlopen, jij.','Ik heb jou niet gezien.','Er was net politie hier.','Ga weg, ik wil geen gedoe.'],
 jong:['Ben jij niet de zoon van Elena?','Hé jongen, alles goed?','Doe je moeder de groeten.']};
let lucaT=6;const zeiT=new WeakMap();
function langs(dt){lucaT-=dt;if(lucaT>0)return;lucaT=rr(1.5,3);
  if(!G.ready||G.paused||(G.cut&&G.cut.active&&G.cut.active())||G.talking||(G.binnen&&G.binnen.waar&&G.binnen.waar()))return;
  const P=G.P,nu=performance.now();let best=null,bd=6;
  for(const n of G.NPC||[]){if(n.st&&!['walk','wait','stand','phone','sit','idle'].includes(n.st))continue;const d=Math.hypot(n.x-P.x,n.z-P.z);if(d<bd&&d>1.2&&!(zeiT.get(n)>nu)){bd=d;best=n}}
  if(!best||Math.random()<.3)return;zeiT.set(best,nu+45000);
  let L;const f=fiets(),v=Math.hypot(P.vx||0,P.vz||0),h=hitte();
  if(h>=40&&ch()>=2&&Math.random()<.6)L=OPLUCA.heet;
  else if(ch()>=3&&Math.random()<.4)L=OPLUCA.bekend;
  else if(f&&(G.fiets.snelheid&&G.fiets.snelheid()>16||v>6)&&Math.random()<.6)L=OPLUCA.fiets;
  else if(jas()&&Math.random()<.65)L=OPLUCA.jas;
  else if(deel()==='nacht'&&Math.random()<.5)L=OPLUCA.nacht;
  else if(/Westbuurt/.test(wijk(best))&&Math.random()<.4)L=OPLUCA.jong;
  else L=null;
  const zin=L?pick(L):G.npcPraat(best);
  try{G.bubble&&G.bubble(best,zin,{col:L===OPLUCA.heet?'#ff9a9a':L===OPLUCA.jas?'#ffe9a8':'#ffffff'});if(best.st==='walk'){best.lookT=2.2}}catch(e){}}
const iv=setInterval(()=>{if(!G.ready)return;clearInterval(iv);const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);try{langs(dt)}catch(e){}}},400);
G.verhaalPraat={ZOMAAR,GESPREK,OPLUCA,NIEUW};
})();
