// Seizoen 1 · wapens en straatgeld (G.s1.wapen, incasso-klus, Dino van de Sloop).
// Luca begint slordig: hij weet niet hoe het werkt. Als hij grotere voorraad op zak heeft (Hoofdstuk 8, de hoek) geeft Bilal hem een
// wapen, gratis, de eerste keer. Dat raak je snel kwijt: bij een fouillering is het in beslag (boete, je naam bij de politie), en zit
// de politie achter je, dan kun je het weggooien (G of de knop). Daarna koop je zelf een nieuw bij Dino op autokerkhof De Sloop.
// Met een wapen kun je beter dreigen (incasso voor Rafiq): je hoeft dan niet eerst een straatnaam op te bouwen, maar het geeft hitte
// en soms belt een buur 112. Zonder wapen telt je straatnaam (imago): hoe bekender je bent, hoe sneller mensen betalen.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH||!G.s1)return;
const S1=G.s1,PI=Math.PI,sin=Math.sin,cos=Math.cos;
let ST,C,B,K;
const WAPENS={
  mes:{n:'Vlindermes',prijs:90,dreig:12,kans:.45,sub:'Klein. Valt minder op bij een fouillering. Maakt weinig indruk.'},
  pistool_oud:{n:'Oud pistool',prijs:1800,dreig:30,kans:.75,sub:'Gebruikt. Niemand weet waar het vandaan komt.'},
  pistool:{n:'Pistool',prijs:3900,dreig:36,kans:.7,sub:'Schoon. Geen geschiedenis. Maakt de meeste indruk.'}};
S1.WAPENS=WAPENS;

function reg(){ST=S1.ST;C=S1.C;B=S1.B;K=S1.K;
const {F,fx,eur,meter,geld,A,W,walk,P,naar,Z,T_,cam,rond,ots,speel,keuze,sleep,pick,rr,doelNaar,fietsAf,bericht,sein,mgGesprek,mgKies,levend,PL,adr,outfit}=S1;
const inv=()=>{const s=ST.st();if(!s.inv||typeof s.inv!=='object')s.inv={};return s.inv};
const bewaar=()=>{try{window.save&&window.save()}catch(e){}};

/* =================== het wapen zelf =================== */
const wapen=S1.wapen={
  heeft:()=>{const w=inv().wapen;return WAPENS[w]?w:null},
  naam:()=>{const w=wapen.heeft();return w?WAPENS[w].n:''},
  geef(id,o){o=o||{};if(!WAPENS[id])return;inv().wapen=id;F('wapens_gehad',(F('wapens_gehad')||0)+1);if(o.gratis)F('wapen_gratis',1);bewaar();chip();
    sein((o.gratis?'Gekregen: ':'Gekocht: ')+WAPENS[id].n+' · politie in de buurt? Weggooien (G)','#ff6a5a')},
  kwijt(reden){if(!wapen.heeft())return;const n=wapen.naam();inv().wapen=null;F(reden==='inbeslag'?'wapens_inbeslag':'wapens_weg',(F(reden==='inbeslag'?'wapens_inbeslag':'wapens_weg')||0)+1);bewaar();chip();
    if(reden==='weggegooid'){fx('whoosh');sein(n+' weggegooid. Weg is weg.','#c9c4b8')}},
  // fouillering: kans dat ze het vinden (per wapen; minder als het gesprek goed ging). Gevonden = in beslag, boete, hitte.
  async fouilleer(t,o){o=o||{};const w=wapen.heeft();if(!w)return false;const kans=Math.min(.95,WAPENS[w].kans*(o.factor==null?1:o.factor));
    if(Math.random()>=kans){sein('Ze vinden het niet. Je hart bonkt nog minuten na.','#3fe395');meter('hitte',2);return false}
    const n=(F('wapens_inbeslag')||0)+1,boete=Math.min(2500,600*n),wie=o.wie||'kramer';
    await speel(t,[o.cam||null,{snd:'heart'},Z(wie,'Armen omhoog. Even voelen.'),T_('Een hand langs zijn jas. Dan blijft hij stilliggen.'),Z(wie,'Kijk eens aan.',{mood:'koel'}),
      T_(WAPENS[w].n+'. In een zakje, met een nummer erop.'),Z(wie,n>1?'Alweer, De Santis. Dit gaat naar de officier van justitie.':'Dit gaat op papier. Met jouw naam erbij.'),
      T_('Boete en een proces-verbaal: '+eur(boete)+'. Je naam staat nu in een systeem dat niet vergeet.')].filter(Boolean));
    wapen.kwijt('inbeslag');geld(-boete,'boete wapenbezit');meter('hitte',12);meter('dossier',8);F('kramer_kent',1);return true}};

// een klein label onder je geld: je hebt iets op zak
let chipEl=null;
function chip(){try{const g=document.querySelector('#svHud .sv-id');if(!g)return;if(!chipEl){chipEl=document.createElement('em');chipEl.className='s1-wapenchip';g.appendChild(chipEl)}
  const w=wapen.heeft();chipEl.textContent=w?WAPENS[w].n:'';chipEl.hidden=!w}catch(e){}}
const css=document.createElement('style');css.textContent=`
.s1-wapenchip{display:block;font:700 9px 'JetBrains Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#ff6a5a;font-style:normal;margin-top:1px;white-space:nowrap}.s1-wapenchip[hidden]{display:none}
.s1-gooi{position:fixed;left:50%;bottom:calc(max(18px,env(safe-area-inset-bottom,0px)) + 96px);transform:translateX(-50%);z-index:77;display:none;align-items:center;gap:10px;
 padding:12px 18px;background:#c0261e;color:#fff;border:0;font:800 15px 'Big Shoulders Text','Space Grotesk',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;box-shadow:0 5px 0 #6a1410;touch-action:manipulation}
.s1-gooi.on{display:flex;animation:s1Gooi .9s ease-in-out infinite alternate}.s1-gooi kbd{font:700 11px monospace;background:#0004;padding:2px 6px}
@keyframes s1Gooi{to{box-shadow:0 5px 0 #6a1410,0 0 26px #ff3a2a}}`;document.head.appendChild(css);
setInterval(chip,1500);

// weggooien als de politie achter je zit: knop (telefoon) of G
const gooi=document.createElement('button');gooi.className='s1-gooi';gooi.innerHTML='Wapen weggooien'+(matchMedia('(pointer:coarse)').matches?'':' <kbd>G</kbd>');document.body.appendChild(gooi);
const gooiNu=()=>{if(!wapen.heeft())return;wapen.kwijt('weggegooid');gooi.classList.remove('on')};
gooi.onclick=gooiNu;
addEventListener('keydown',e=>{if((e.key==='g'||e.key==='G')&&gooi.classList.contains('on')&&!e.repeat){e.preventDefault();gooiNu()}});
setInterval(()=>{const on=!!(wapen.heeft()&&G.police&&G.police.active&&G.police.active()&&!(C.active&&C.active()));gooi.classList.toggle('on',on)},250);

// vluchten voor de politie (rennen, steegjes, uit het zicht). Geeft true als je ontkomt.
S1.vlucht=async function(t,o){o=o||{};if(!G.police||!G.police.flee)return false;fietsAf();
  if(wapen.heeft())setTimeout(()=>sein('Je hebt een wapen op zak. Gooi het weg voor ze je hebben (G)','#ff6a5a'),900);
  let ok=false;try{ok=await G.police.flee(o.level||2)}catch(e){console.error(e)}
  if(!levend(t))return ok;
  if(ok){meter('naam',2);sein('Je bent ze kwijt.','#3fe395');return true}
  // gepakt
  const l=P(),ag=walk(l.x+1.4,l.z+1.2,3);
  await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,ag),anim:'hurk'},{actor:'agent2',at:[ag.x,ag.z],ry:naar(ag,l)},rond(l,naar(l,ag)+PI*.7,3.4,1.8,1.4),{fade:'in',t:.3},
    Z('agent2','Liggen blijven. Waarom ren je dan?',{mood:'boos'})],{muziek:'spanning'});
  const gevonden=await wapen.fouilleer(t,{wie:'agent2',factor:1.25});
  if(!gevonden){await speel(t,[Z('agent2','Niks. Dan een bon voor wegrennen bij een controle. Honderdveertig.'),{fade:'out',t:.5}]);geld(-140,'bon (gevlucht)');meter('hitte',4)}
  else await speel(t,[{fade:'out',t:.5}]);
  C.weg('luca');C.weg('agent2');return false};

// controle op straat (de hoek): een agent stapt uit. Weggooien, blijven zitten of rennen.
S1.wapenControle=async function(t,o){o=o||{};const w=wapen.heeft();if(!w)return;const l=P(),ag=walk(l.x+2,l.z-1.5,4);
  const k=await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,ag),anim:o.zit?'sit':'idle',sitY:o.zit?-.2:0},{actor:'agent2',at:[ag.x,ag.z],ry:naar(ag,l)},
    rond(l,naar(l,ag)+PI*.75,3.8,1.9,1.5),{snd:'carDoor'},Z('agent2','Blijf even zitten. Controle.',{mood:'koel'}),
    keuze('luca','Het '+WAPENS[w].n.toLowerCase()+' zit in je jas.',[{t:'In de bosjes gooien als hij even wegkijkt',id:'gooi'},{t:'Blijven zitten. Niks doen.',id:'zit'},{t:'Rennen',id:'ren'}])],{muziek:'spanning'});
  if(!levend(t))return;
  if(k==='ren'){C.weg('luca');C.weg('agent2');await S1.vlucht(t,{level:2});return}
  if(k==='gooi'){const gezien=Math.random()<.3;wapen.kwijt('weggegooid');
    if(gezien){await speel(t,[Z('agent2','Wat gooide je daar weg?',{mood:'boos'}),T_('Hij schijnt met zijn zaklamp in de bosjes. En vindt het.'),Z('agent2','Dit is van jou. Dat gaat op papier.')]);
      const n=(F('wapens_inbeslag')||0)+1;F('wapens_inbeslag',n);geld(-Math.min(2500,600*n),'boete wapenbezit');meter('hitte',12);meter('dossier',8);F('kramer_kent',1)}
    else await speel(t,[T_('Een tik tegen de heg. Niemand kijkt.'),Z('agent2','Niks? Mooi. Doorlopen, jij.')]);
    C.weg('luca');C.weg('agent2');return}
  const gevonden=await wapen.fouilleer(t,{wie:'agent2',factor:1});if(!gevonden)await speel(t,[Z('agent2','Goed. Ik hou je in de gaten.')]);C.weg('luca');C.weg('agent2')};

/* =================== Bilal geeft er een (Hoofdstuk 8) =================== */
// wordt aangeroepen vanuit de hoek-scène van Hoofdstuk 8: geeft de stappen terug die in die scène horen
S1.wapenVanBilal=()=>[
  Z('bilal','Je loopt nu met spullen van drieduizend euro. Dat weet de halve buurt binnen een week.'),
  T_('Bilal schuift een plastic tas over het bankje. Er zit iets zwaars in.'),
  Z('bilal','Van mij. Gratis. De eerste keer.'),
  Z('bilal','Politie in de buurt? Weggooien. Een nieuwe kost geld. Een jaar binnen kost meer.'),
  Z('bilal','Wil je er zelf een, een betere? Dino. Autokerkhof De Sloop, achter de garage. Zeg dat ik je stuur.'),
  keuze('luca','',[{t:'De tas pakken',id:'pak'},{t:'Laten liggen',id:'laat'}])];
S1.wapenNaBilal=async(t,k)=>{F('wapen_dino',1);F('plek_sloop',1);
  if(k==='laat'){F('wapen_geweigerd',1);await speel(t,[Z('bilal','Zoals je wil. Dino weet je te vinden. Of andersom.')])}
  else wapen.geef('pistool_oud',{gratis:true})};
// oude tarieven (van voor het nieuwe geld) omzetten
setTimeout(()=>{try{const tf=F('tarief');if(tf===50)F('tarief',150);else if(tf===100)F('tarief',300)}catch(e){}},4000);
// voor wie Hoofdstuk 8 al voorbij was toen dit erbij kwam: Bilal stuurt een bericht en Dino staat open
setTimeout(()=>{try{if(F('s1_klaar_s1_h8')&&!F('wapen_dino')){F('wapen_dino',1);F('plek_sloop',1);
  if(!F('wapens_gehad')){wapen.geef('pistool_oud',{gratis:true});bericht('B.','Ligt in je meterkast. Van mij, de eerste keer. Politie? Weggooien. Een nieuwe: Dino, De Sloop.',{kleur:'#5a5d63'})}}}catch(e){}},5000);

/* =================== Dino, autokerkhof De Sloop: een wapen kopen =================== */
const vrij=()=>{const h=F('s1_hfd')||'';return (h.startsWith('tussen:')||h==='vrij')&&!C.active()&&!S1.bezig};
try{const CA=C.actors;if(CA&&!CA.dino)CA.dino={n:'Dino',col:'#c9a24a',rol:'Autokerkhof De Sloop',look:Object.assign({},C.look('klant4')||{},{skin:'#d9a77a',hair:'#2a2420',fh:'baard',top:{kind:'jacket',c:'#4a3a2a'}}),face:Object.assign({},C.face('klant4')||{},{skin:'#d9a77a'})}}catch(e){}
function dino(){if(!S1.klus)return;return S1.klus(async t=>{const s=A('sloop'),d=walk(s.x+2,s.z+3,6),l=walk(s.x+4,s.z+5.5,6);fietsAf();
  const eerst=!F('dino_kent');F('dino_kent',1);
  await speel(t,[{speler:false},{actor:'dino',at:[d.x,d.z],ry:naar(d,l),anim:'leun'},{actor:'luca',at:[l.x,l.z],ry:naar(l,d)},rond(d,naar(d,l)+1.0,3.6,1.8,1.5),{fade:'in',t:.4},
    eerst?Z('dino','Bilal zei al dat er een jongen zou komen. Kleiner dan ik dacht.'):Z('dino','De pizzajongen. Wat moet je?'),
    eerst?Z('dino','Regel één: je hebt mij nooit gezien. Regel twee: geen terugbetaling.'):null],{muziek:'spanning'});
  const nu=wapen.heeft();
  if(nu){await speel(t,[Z('dino','Je hebt er al een. Eén is genoeg. Twee is een aanklacht.'),{fade:'out',t:.4}]);C.weg('dino');C.weg('luca');return}
  const g=geld();
  const k=await S1.inScene(t,[rond(d,naar(d,l)+.4,3.0,1.7,1.4)],()=>mgKies({kop:'Dino · De Sloop',wie:'dino',kleur:'#c9a24a',vraag:'Uit de kofferbak van een Mercedes zonder wielen. Je hebt '+eur(g)+'.',
    opties:[...Object.keys(WAPENS).map(id=>({t:WAPENS[id].n+' · '+eur(WAPENS[id].prijs),sub:WAPENS[id].sub,id})),{t:'Niks. Ik kijk alleen.',id:'niks'}]}));
  if(!levend(t))return;
  if(!k||k==='niks'||!WAPENS[k]){await speel(t,[Z('dino','Kijken is gratis. Vandaag nog.'),{fade:'out',t:.4}])}
  else if(g<WAPENS[k].prijs){await speel(t,[Z('dino','Dat is '+eur(WAPENS[k].prijs)+'. Ik zie '+eur(g)+'. Kom terug als je kunt tellen.'),{fade:'out',t:.4}])}
  else{geld(-WAPENS[k].prijs,'Dino · '+WAPENS[k].n);await speel(t,[{snd:'cash'},Z('dino','Niet in je fietstas. Op je lijf. En niet showen.'),{fade:'out',t:.4}]);wapen.geef(k)}
  C.weg('dino');C.weg('luca')},'straat')}

/* =================== incasso voor Rafiq: dreigen met je naam, of met een wapen =================== */
const FD={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
function incasso(){const dag=ST.st().avond||0;if(F('incasso_dag')===dag){sein('Eén incasso per avond. Rafiq wil geen gezichten in dezelfde straat.','#ff9a5a');return}if(!S1.klus)return;
  return S1.klus(async t=>{F('incasso_dag',dag);
    const w=pick(['Oud-Zuid','Westbuurt','Centrum','De Gracht','Oud-Zuid']),a=S1.adres(w,null,Math.floor(rr(0,60)))||S1.adres(null,null,Math.floor(rr(0,400)));if(!a)return;
    const schuld=Math.round(rr(16,60))*50,wie=pick(['klant1','klant2','klant3','klant4']),naam=pick(['Ferry','Jordy','meneer Kok','Sandra','Mehmet','de Vries','Kevin','Bart']);
    bericht('B.','Incasso: '+naam+', '+adr(a,w)+'. '+eur(schuld)+'. Jouw deel: een kwart.',{kleur:'#5a5d63'});
    if(!await doelNaar(t,'Incasso · '+naam+' · '+adr(a,w),{x:a.x,z:a.z},{actie:'Aanbellen',sub:eur(schuld)+' voor Rafiq'}))return;
    const f=FD[a.face]||[0,1],deur={x:a.x,z:a.z},l=walk(a.x+f[0]*1.9,a.z+f[1]*1.9,3);
    const naamNu=Math.max(0,meter('naam')||0),start=Math.min(40,Math.round(naamNu*.45)),wp=wapen.heeft(),dr=wp?WAPENS[wp].dreig:0;let metWapen=false;
    await speel(t,[{speler:false},{actor:wie,at:[deur.x,deur.z],ry:naar(deur,l)},{actor:'luca',at:[l.x,l.z],ry:naar(l,deur)},rond(l,naar(l,deur)+PI*.8,3.2,1.8,1.5),{fade:'in',t:.4},{snd:'deurbel'},
      T_(naamNu>=40?'De deur gaat open. Hij weet wie je bent; dat zie je aan zijn gezicht.':naamNu>=20?'De deur gaat op een kier. Je naam doet hier al iets.':'De deur gaat op een kier. Hij kent je niet. Nog niet.')],{muziek:'spanning'});
    const r=await S1.inScene(t,[rond(l,naar(l,deur)+PI*.8,3.2,1.8,1.5)],()=>mgGesprek({kop:'Incasso · '+naam,wie,kleur:'#ff9a3a',meters:{d:['DRUK',start,'#ff9a3a']},
      beurten:[
       {vraag:'"Ja? Wat moet je?"',opties:[
         {t:'"Rafiq stuurt me. Je weet waarvoor."',eff:{d:12+Math.round(naamNu/8)},reactie:'Rafiq… ja. Ja, ik weet het.'},
         {t:'"'+eur(schuld)+'. Vandaag."',eff:{d:8},reactie:'Zo veel heb ik niet in huis.'},
         wp?{t:'Je jas een stukje openhouden. Niks zeggen.',sub:WAPENS[wp].n,eff:{d:dr},fn:()=>{metWapen=true;meter('hitte',4)},reactie:'Oké. Oké. Rustig.'}:null].filter(Boolean)},
       m=>({vraag:'"Ik heb het niet. Volgende week, echt."',opties:[
         {t:'"Ik weet waar je werkt. Je baas weet het straks ook."',eff:{d:14+Math.round(naamNu/10)},reactie:'Dat zou je niet doen.'},
         {t:'"Een deel nu. De rest vrijdag. Ik kom terug."',id:'deel',eff:{d:6},reactie:'Een deel… wacht.'},
         wp?{t:'Het wapen laten zien. Heel even.',sub:'Werkt altijd. Kost hitte; buren kijken mee.',eff:{d:dr+10},fn:()=>{metWapen=true;meter('hitte',8);meter('dossier',3)},reactie:'Doe dat weg! Ik pak het! Ik pak het!'}:null].filter(Boolean)})]}))||{m:{d:start},gekozen:[]};
    if(!levend(t))return;const d=r.m.d,deel=r.gekozen.includes('deel');
    const uit=d>=60?'alles':(d>=32||deel)?'half':'niks',binnen_=uit==='alles'?schuld:uit==='half'?Math.round(schuld/2/10)*10:0,mijn=Math.round(binnen_/4);
    await speel(t,[uit==='alles'?T_('Hij komt terug met een envelop. Alles. Hij telt niet eens mee.'):uit==='half'?T_('De helft, in briefjes van twintig. "De rest vrijdag."'):T_('De deur gaat dicht. Een slot, een tweede slot.'),
      uit!=='niks'?{snd:'cash'}:{snd:'door'},{fade:'out',t:.4}]);C.weg(wie);C.weg('luca');
    if(mijn>0){geld(mijn,'incasso '+naam);bericht('B.',eur(binnen_)+' binnen. Jouw deel ligt klaar: '+eur(mijn)+'.',{kleur:'#5a5d63'});meter('vertrouwen',uit==='alles'?2:1)}
    else bericht('B.','Niks? Dan was jij niet eng genoeg.',{kleur:'#5a5d63'});
    if(!metWapen&&uit!=='niks')meter('naam',uit==='alles'?3:2);
    // met een wapen dreigen: soms belt een buur 112
    if(metWapen&&Math.random()<.35&&levend(t)){await sleep(1400);fx('tril');sein('Een buurvrouw stond achter het gordijn. 112. Rennen!','#ff5a4a');await sleep(900);await S1.vlucht(t,{level:2})}},'straat')}

let spots=false;
function spotsInit(){if(spots||!G.spot)return;spots=true;
  const s=A('sloop');G.spot({story:1,k:'s1_dino',x:s.x+2,z:s.z+3,r:3.4,prio:2,n:'Dino',sub:'Autokerkhof De Sloop · wapens',col:'#c9a24a',h:2.4,
    show:function(){return vrij()&&!B.waar()&&!!F('wapen_dino')},act:()=>dino()});
  const st=PL.steeg();G.spot({story:1,k:'s1_incasso',x:st.x+5,z:st.z+2,r:3,prio:2,n:'Bilal',sub:'Incasso voor Rafiq (een kwart is van jou)',col:'#ff9a3a',h:2.4,
    show:function(){return vrij()&&!B.waar()&&!!F('s1_klaar_s1_h8')&&!F('rafiq_dood')},act:()=>incasso()})}
const iv=setInterval(()=>{if(!G.ready||!G.spot)return;clearInterval(iv);spotsInit();chip()},500);
Object.assign(S1,{incasso,dino});
}
if(S1.ST)reg();else S1.onStart.push(reg);
})();
