// Seizoen 1 (nieuw) · side quests (SQ1–SQ5, SQ7) en herhaalbare klussen (Napoli-ronde, Rafiq-run, hoekavond).
// Alles hier kan alleen tussen twee hoofdstukken (vrij rondrijden) en raakt de gouden markering van het volgende hoofdstuk niet.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH||!G.s1)return;
const S1=G.s1,PI=Math.PI;
let ST,C,B,K,L;
function reg(){ST=S1.ST;C=S1.C;B=S1.B;K=S1.K;L=S1.L;
const {F,fx,eur,meter,geld,plusF,A,W,W3,walk,P,naar,voor,tijd,Z,T_,cam,rond,ots,speel,keuze,sleep,hyp,pick,rr,
  doelNaar,fietsAf,zorgFiets,binnen,buiten,bericht,sein,mgTiming,mgHold,mgGesprek,mgQuiz,mgMash,mgKies,echteRit,nepRit,levend,VOLG,PL,AD,pt,adr,outfit,actIn}=S1;

const vrij=()=>{const h=F('s1_hfd')||'';return (h.startsWith('tussen:')||h==='vrij')&&!C.active()&&!S1.bezig};
function herstelDoel(){const h=F('s1_hfd')||'';if(h.startsWith('tussen:')){const v=VOLG[h.slice(7)];if(v)ST.doel(v.tekst,typeof v.p==='function'?v.p():v.p);return}if(h==='vrij')ST.doel(null)}
// een klus of side quest draaien zonder het hoofdstuk te storen (zelfde 'leven' als de vrije rit)
async function klus(fn,kleding){if(S1.bezig||!vrij())return;S1.bezig=1;const t=S1.RUN,oud=(ST.st().outfit)||null;try{if(kleding)outfit(kleding);await fn(t)}catch(e){console.error(e)}
  S1.bezig=0;if(levend(t)){if(kleding&&oud)outfit(oud);herstelDoel()}}
S1.klus=klus;
const rAdres=(wijken,n)=>{const w=pick(wijken);return S1.adres(w,null,Math.floor(rr(0,60)))||S1.adres(null,null,Math.floor(rr(0,400)))};

/* =================== klussen =================== */
// Napoli-ronde: drie echte bestellingen (wit geld)
function napoliRonde(){return klus(async t=>{const L3=[0,1,2].map(i=>{const a=rAdres(['Westbuurt','Westbuurt','Oud-Zuid','Centrum','De Gracht']);return {adres:adr(a,'Westbuurt'),x:a.x,z:a.z,klant:pick(['student','oude_man','familie','chagrijn','feest']),pizzas:1+Math.floor(rr(0,3)),id:'nr'+i}});
  zorgFiets(PL.napoli());sein('Napoli-ronde: drie bestellingen','#3fe395');await echteRit(t,L3,{loon:4});F('napoli_rondes',(F('napoli_rondes')||0)+1)},'bezorger')}
// Rafiq-run: twee nep-adressen, licht uit, één per avond; soms een patrouille
function rafiqRun(){const dag=ST.st().avond||0;if(F('run_dag')===dag){sein('Eén run per avond. Morgen weer.','#ff9a5a');return}
  return klus(async t=>{F('run_dag',dag);const wijken=['Zuidas','Villawijk','Boulevard','Oud-Zuid'];const twee=[rAdres(wijken),rAdres(wijken)];let n=0;
   bericht('B.','Twee adressen. Licht uit. '+twee.map(a=>adr(a,'?')).join(' · '),{kleur:'#5a5d63'});zorgFiets(PL.sahara());S1.lichtKnop(true);S1.licht(true);
   for(let i=0;i<2&&levend(t);i++){const a=twee[i];const ok=await nepRit(t,{p:{x:a.x,z:a.z},tekst:'Run · '+adr(a,'adres'),sub:'Nep-bestelling (Rafiq)',scene:async()=>{
      if(Math.random()<.25){fietsAf();const l=P(),car=walk(l.x-Math.sin(l.ry)*9,l.z-Math.cos(l.ry)*9,6),pa=S1.politieAuto();pa.position.set(car.x,0,car.z);pa.rotation.y=naar(car,l);G.scene().add(pa);
       await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'agent2',at:[l.x-Math.sin(l.ry)*1.6,l.z-Math.cos(l.ry)*1.6],ry:naar({x:l.x-Math.sin(l.ry)*1.6,z:l.z-Math.cos(l.ry)*1.6},l)},rond(l,l.ry+PI*.7,4,1.8,1.4),{snd:'carDoor'},
        S1.Z('agent2','Goedenavond. Je achterlicht.')]);const u=await S1.aanhouding(t,{kort:true,wijk:'deze wijk',wie:'agent2',cam:rond(l,l.ry+PI*.7,4,1.8,1.4)});C.weg('agent2');C.weg('luca');setTimeout(()=>pa.parent&&pa.parent.remove(pa),1500)}
      fx('grab');sein('Afgegeven','#3fe395')}});if(ok)n++}
   S1.lichtKnop(false);if(!n)return;let loon=n*(F('tarief')||50);const s=F('schuld_rafiq')||0,af=Math.min(s,loon);if(af){F('schuld_rafiq',s-af);loon-=af;sein('Schuld bij Rafiq: nog '+eur(s-af),'#ff9a5a')}
   if(loon>0)geld(loon,'Rafiq-run');meter('vertrouwen',1);F('runs',(F('runs')||0)+1)},'bezorger')}
// hoekavond: verkorte hoekdienst
function hoekAvond(){const dag=ST.st().avond||0;if(F('hoek_dag')===dag){sein('Genoeg voor vanavond.','#ff9a5a');return}
  return klus(async t=>{F('hoek_dag',dag);tijd(20,0);const r=await S1.hoekDienst(t,{klanten:3,test:false,duur:120,dex:F('dex_wil')==='erin',van:[20,0],tot:[21,30]});
   if(r&&r.verkocht)bericht('B.','Opgehaald. Goed gedaan.',{kleur:'#5a5d63'})},'straat')}
let klusInit=false;
function klusSpots(){if(klusInit||!G.spot)return;klusInit=true;
  const nf=A('napoli_fietsen');G.spot({story:1,k:'klus_napoli',x:nf.x,z:nf.z,r:3.2,prio:2,n:'Bezorgfietsen Bella Napoli',sub:'Napoli-ronde (3 bestellingen)',col:'#3fe395',h:2.6,
   show:function(){return vrij()&&!B.waar()&&!!F('s1_klaar_s1_h3')},act:()=>napoliRonde()});
  G.spot({story:1,k:'klus_rafiq',x:PL.steeg().x,z:PL.steeg().z,r:3.2,prio:2,n:'Achterdeur Sahara',sub:'Run voor Rafiq (twee adressen)',col:'#ffd35a',h:2.6,
   show:function(){return vrij()&&!B.waar()&&!!F('tweede_telefoon')&&!F('rafiq_dood')},act:()=>rafiqRun()});
  G.spot({story:1,k:'klus_hoek',x:PL.hoek().x,z:PL.hoek().z,r:3.2,prio:2,n:'De hoek',sub:'Hoekavond (drie klanten)',col:'#ff9a5a',h:2.2,
   show:function(){return vrij()&&!B.waar()&&!!F('hoek_klus')&&!F('rafiq_dood')},act:()=>hoekAvond()});
  // SQ4: de lift van Ans
  G.spot({story:1,k:'sq_ans',x:PL.ans().x,z:PL.ans().z,r:2.6,prio:2,n:'Buurvrouw Ans',sub:F('sq4_klaar')?'':'De lift is kapot',col:'#ffb0d0',h:2.2,
   show:function(){if(!vrij()||B.waar()||!F('s1_klaar_s1_h3'))return false;if(F('sq4_klaar')&&(!F('ans_zag')||F('sq4b_klaar')))return false;this.sub=F('sq4_klaar')?'Ze kijkt je aan':'De lift is kapot';return true},act:()=>sq4()});
  // SQ5: uithalen (alleen de nacht voor je verjaardag)
  G.spot({story:1,k:'sq_sem',x:PL.containers().x+8,z:PL.containers().z+14,r:3,prio:3,n:'Sem',sub:'Uithalen · rij C',col:'#8ac0ff',h:2.2,
   show:function(){if(!vrij()||B.waar()||!F('sq5_open')||F('uithaal_gedaan')||F('s1_hfd')!=='tussen:s1_h11')return false;return true},act:()=>sq5()})}

/* =================== SQ1 · Het loonstrookje (papa) =================== */
S1.sq1=()=>klus(async t=>{await binnen('thuis');
  const k=await speel(t,[{speler:false},{actor:'marco',at:W('thuis',7.4,4.5),ry:0,anim:'sit',sitY:-.42},{actor:'luca',at:W('thuis',7.4,5.9),ry:PI,anim:'sit',sitY:-.42},actIn(['marco','luca']),
   S1.cam(...W3('thuis',10.2,2.0,6.8),...W3('thuis',7.4,1.1,5.2),{fov:42}),{fade:'in',t:.3},Z('marco','Laat me je loonstrook eens zien. Van Giovanni.'),
   keuze('luca','',[{t:'"Ik haal hem morgen." (eerlijk)',id:'eerlijk'},{t:'Bilal om een nepstrookje vragen',id:'nep'}])]);C.weg('marco');C.weg('luca');await buiten();
  if(k==='eerlijk'){if(!await doelNaar(t,'Bella Napoli · loonstrook',PL.napoli(),{actie:'Vragen',sub:'Giovanni'}))return;
   await speel(t,[{speler:false},T_('Giovanni print hem uit. Tweehonderdtwaalf euro, vorige maand.'),Z('giovanni','Is er iets thuis, ragazzo?'),Z('luca','Nee. Mijn vader wil het zien.')]);
   if(!await doelNaar(t,'Naar huis · papa',PL.thuis(),{actie:'Naar binnen',sub:'Papa'}))return;
   await speel(t,[{speler:false},T_('Marco leest het twee keer.'),Z('marco','Tweehonderdtwaalf. En jij geeft mij elke week geld?'),T_('Hij vouwt het op en legt het in de la.')]);plusF('marco_vermoeden');meter('band_marco',5)}
  else{bericht('Bilal','Kost je vijftig. Belwinkel aan de Boulevard.',{kleur:'#5a5d63'});const w=S1.adres('Boulevard','winkel',3,PL.sahara())||PL.sahara();
   if(!await doelNaar(t,'Belwinkel · Boulevard',w,{actie:'Ophalen',sub:'Nepstrookje'}))return;geld(-50,'nepstrookje');
   if(!await doelNaar(t,'Naar huis · papa',PL.thuis(),{actie:'Naar binnen',sub:'Papa'}))return;
   await speel(t,[{speler:false},Z('marco','Vierhonderdzestig. Giovanni betaalt beter dan ik dacht.'),T_('Hij geeft het terug. Hij glimlacht. Voor het eerst in weken.')]);meter('band_marco',15);F('vals_loonstrookje',1)}
  F('sq1_klaar',1);F('geld_terug',null);sein('Papa neemt weer geld aan.','#d6a63e')});

/* =================== SQ2 · Het oudergesprek (mama) =================== */
S1.sq2=()=>klus(async t=>{await speel(t,[{speler:false},Z('elena','Meneer Visser belde. Je slaapt in de les. Morgen gaan we samen.'),{fade:'out',t:.4}]);await buiten();outfit('school');tijd(15,30);
  if(!await doelNaar(t,'Westbuurt College · oudergesprek',A('schoolhek'),{actie:'Naar binnen',sub:'Meneer Visser',gebouw:'klas'}))return;await binnen('klas');
  await speel(t,[{speler:false},{actor:'docent',at:W('klas',7.2,3.2),ry:PI,anim:'sit',sitY:-.42},{actor:'elena',at:W('klas',6.4,5.0),ry:0,anim:'sit',sitY:-.42},{actor:'luca',at:W('klas',8.0,5.0),ry:0,anim:'sit',sitY:-.42},actIn(['docent','elena','luca']),
   S1.cam(...W3('klas',10.6,2.3,7.0),...W3('klas',7.2,1.2,4.0),{fov:44}),{fade:'in',t:.4},Z('docent','Luca slaapt in de les. Twee keer per week. Zijn cijfers zakken.')]);
  const r=await mgKies({kop:'Oudergesprek',wie:'docent',vraag:'Visser kijkt je aan. Mama ook.',opties:[{t:'"Ik werk te veel."',id:'eerlijk'},{t:'"Het wordt beter, beloofd."',id:'belofte'},{t:'"School is toch zinloos."',id:'zinloos'}]});
  meter('band_elena',r==='eerlijk'?10:r==='belofte'?5:-10);
  await speel(t,[Z('docent','Je bent slim, Luca. Dat is precies het probleem.'),r==='zinloos'?T_('Elena kijkt naar het tafelblad.'):Z('elena','Dank u, meneer Visser.'),{fade:'out',t:.4}]);
  ['docent','elena','luca'].forEach(k=>C.weg(k));await buiten();F('school_waarschuwing',1);F('sq2_klaar',1)});

/* =================== SQ3 · Giulia's herkansing =================== */
S1.sq3=()=>klus(async t=>{F('sq3_start',1);await binnen('thuis');
  await speel(t,[{speler:false},{actor:'giulia',at:W('thuis',7.4,4.5),ry:0,anim:'schrijfzit',sitY:-.42},{actor:'luca',at:W('thuis',8.6,5.6),ry:PI*.8},actIn(['giulia','luca']),
   S1.cam(...W3('thuis',10.2,2.0,6.8),...W3('thuis',7.6,1.1,5.0),{fov:42}),{fade:'in',t:.3},T_('Giulia zit met kaartjes aan tafel. Morgen herkansing.'),
   Z('luca','Ik kan je overhoren.'),Z('giulia','Niet met dat geld. Gewoon jij.'),Z('luca','Gewoon ik.')]);
  const g=await mgQuiz({kop:'Overhoren · Giulia',wie:'giulia',kleur:'#c49bff',vragen:[
   ['Hoeveel paracetamol mag een volwassene maximaal per dag?',['4 gram','10 gram','1 gram'],0,'Goed.','Nee. Vier gram.'],
   ['Normale hartslag in rust?',['60 tot 100','30 tot 50','120 tot 160'],0],
   ['Wat meet een saturatiemeter?',['Zuurstof in het bloed','Bloeddruk','Suiker'],0],
   ['Hoeveel bloed heeft een volwassene ongeveer?',['5 liter','2 liter','9 liter'],0],
   ['"Nuchter" voor een operatie betekent…',['Niets eten of drinken','Niet slapen','Alleen water na middernacht'],0]]});
  await speel(t,[Z('giulia',g>=4?'Je bent beter dan mijn studiegroep.':'Oké. Nog een keer, morgen.'),{fade:'out',t:.4}]);C.weg('giulia');C.weg('luca');await buiten();tijd(7,10);outfit('bezorger');
  if(!await doelNaar(t,'Bella Napoli · een ontbijtpizza',PL.napoli(),{actie:'Ophalen',sub:'Voor afdeling 4'}))return;sein('Ontbijtpizza mee','#3fe395');
  if(!await doelNaar(t,'Ziekenhuis · afdeling 4',PL.ziekenhuis(),{actie:'Afgeven',sub:'Giulia'}))return;const z=PL.ziekenhuis(),gp=walk(z.x+1,z.z+1.2,3),l=walk(z.x+.8,z.z+3.2,3);
  await speel(t,[{speler:false},{actor:'giulia',at:[gp.x,gp.z],ry:naar(gp,l),look:S1.giuliaWerk()},{actor:'luca',at:[l.x,l.z],ry:naar(l,gp)},rond(l,naar(l,gp)+2.2,3.4,1.8,1.5),
   {anim:'luca',a:'give',naar:'giulia'},T_('Een ontbijtpizza, voor de nachtdienst. En de uitslag van haar herkansing: een acht.'),Z('giulia','Je kunt dus ook gewoon iets goeds doen.'),{fade:'out',t:.4}]);
  C.weg('giulia');C.weg('luca');meter('band_giulia',25);F('giulia_zacht',1);F('sq3_klaar',1)},null);

/* =================== SQ4 · De lift van Ans =================== */
function sq4(){return klus(async t=>{const a=PL.ans();
  if(!F('sq4_klaar')){await speel(t,[{speler:false},{actor:'ans',at:[a.x,a.z],ry:PI,prop:'tas'},{actor:'luca',at:[a.x,a.z+1.8],ry:0},rond(a,PI*.8,3.2,1.6,1.4),{fade:'in',t:.3},
    Z('ans','Jongen. De lift. Weer. Vier tassen, achtste verdieping.'),Z('luca','Ik neem ze wel.')]);C.weg('ans');C.weg('luca');
   const ok=await mgMash({kop:'Acht trappen',titel:'Vier tassen naar boven',uitleg:'Tik zo snel je kunt.',tijd:7,doel:34,knop:'Traptree'});
   await speel(t,[{speler:false},T_(ok?'Acht trappen. Ans geeft je soep mee. En een tientje.':'Halverwege moet je even zitten. Ans lacht. Ze geeft je toch soep. En een tientje.')]);geld(10,'Ans');F('sq4_klaar',1);return}
  if(F('ans_zag')&&!F('sq4b_klaar')){const r=await speel(t,[{speler:false},{actor:'ans',at:[a.x,a.z],ry:PI},{actor:'luca',at:[a.x,a.z+1.8],ry:0},rond(a,PI*.8,3.2,1.6,1.4),{fade:'in',t:.3},
    Z('ans','Jij was dat. Met die jongen van Rapido.'),keuze('luca','',[{t:'"Hij begon."',id:'begon'},{t:'"Zeg het alsjeblieft niet tegen mijn moeder."',id:'zwijg'}])]);
   if(r==='zwijg'){F('ans_zwijgt',1);await speel(t,[Z('ans','Ik ben oud, Luca. Niet blind. …Ik zeg niks.')])}else await speel(t,[Z('ans','Dat zeggen ze allemaal.')]);
   C.weg('ans');C.weg('luca');F('sq4b_klaar',1)}})}

/* =================== SQ5 · Uithalen (met Sem, rij C) =================== */
function sq5(){return klus(async t=>{const c=PL.containers(),s=walk(c.x+8,c.z+14,6);tijd(3,0);
  await speel(t,[{speler:false},{actor:'sem',at:[s.x+1.4,s.z],ry:naar({x:s.x+1.4,z:s.z},c)},{actor:'luca',at:[s.x,s.z+.6],ry:naar(s,c)},rond(s,PI*1.2,3.6,1.8,1.5),{fade:'in',t:.3},
   Z('sem','Drie uur. Om drie uur tien gaat de poort open voor de vrijgave. Dan moeten wij weg zijn.'),Z('sem','MSKU 739104. Rij C. Zegel eraf, vier tassen, terug.')]);C.weg('sem');C.weg('luca');
  await mgHold({kop:'Het hek',titel:'Over het hek',uitleg:'Houd vast.',stappen:1,duur:2});
  const NR=['MSKU 739140','MSKU 739104','MKSU 739104','MSKU 793104','MSCU 739104','MSKU 739401'];let goed=false,pog=0;
  while(!goed&&pog<4&&levend(t)){const k=await mgKies({kop:'Rij C',wie:'sem',vraag:'Welke container? (Sem fluistert: zeven-drie-negen-één-nul-vier)',opties:NR.map(x=>({t:x,id:x}))});pog++;goed=k==='MSKU 739104';if(!goed){sein('Verkeerde. Vijf seconden kwijt.','#ff5a4a');await sleep(1200)}}
  await mgHold({kop:'Het zegel',titel:'Knippen',uitleg:'Houd vast. Komt de schijnwerper langs? Loslaten.',stappen:1,duur:2.2,storing:true,kijkTekst:'Schijnwerper!',waarschuw:'Het licht draait…'});
  const ok=await mgMash({kop:'Vier tassen',titel:'Naar het hek dragen',uitleg:'Tik zo snel je kunt.',tijd:8,doel:36,knop:'Dragen'});
  await speel(t,[{speler:false},T_(ok?'Vier tassen in Bilals busje. Drie uur negen.':'De laatste tas op het nippertje. Drie uur tien. De poort gaat open als het busje wegrijdt.'),
   {fn:()=>bericht('Sem','Nooit gebeurd. Mooi werk.',{kleur:'#8ac0ff'})}]);geld(1000,'uithalen');meter('vertrouwen',10);F('uithaal_gedaan',1)},'klus')}

/* =================== SQ7 · Edwin wil meer (na je verjaardag, als je hem betaalde) =================== */
async function sq7(){if(F('sq7_klaar')||F('edwin')!=='geld')return;F('sq7_klaar',1);await sleep(4000);if(!vrij()){F('sq7_klaar',null);return}bericht('Onbekend nummer','Nog eens tienduizend. Anders praat ik. E.',{kleur:'#34c759'});await sleep(3500);if(!vrij()){F('sq7_klaar',null);return}
  return klus(async t=>{const k=await mgKies({kop:'Eerste telefoon',wie:'luca',vraag:'"Nog eens tienduizend. Anders praat ik. E."',opties:[{t:'Aan Rafiq melden',id:'rafiq'},{t:'Zelf €2.000 betalen bij de douane',id:'betaald'},{t:'Negeren',id:'genegeerd'}]});
   F('edwin_sq',k);if(k==='rafiq'){bericht('Rafiq','Tarik regelt het.',{kleur:'#5a5d63'});meter('vertrouwen',3)}
   else if(k==='betaald'){if(!await doelNaar(t,'Douanekade · Edwin',PL.douane(),{actie:'Betalen',sub:'Edwin'}))return;const n=Math.min(2000,ST.geld());geld(-n,'Edwin');
    await speel(t,[{speler:false},T_('Edwin telt het niet. Hij steekt het weg en kijkt over je schouder.'),Z('edwin','Dit was de laatste keer.')])}})}
let sq7Iv=setInterval(()=>{try{if(!ST||!F)return;if(F('s1_hfd')==='tussen:s1_h12'&&F('edwin')==='geld'&&!F('sq7_klaar')&&!S1.bezig&&!C.active()){sq7()}}catch(e){}},3000);

setTimeout(klusSpots,800);
}
if(S1.ST)reg();else S1.onStart.push(reg);
})();
