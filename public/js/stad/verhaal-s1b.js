// Seizoen 1 (nieuw) · hoofdstuk 6–10: Lek, Incasso, De hoek, Mijn buurt, Groen licht.
// Plus: de hoekdienst (minispel), een tram met ramen voor scènes, de vrije markeringen naar het volgende hoofdstuk.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH||!G.s1)return;
const S1=G.s1,PI=Math.PI,sin=Math.sin,cos=Math.cos;
let ST,C,B,K,L;
function reg(){ST=S1.ST;C=S1.C;B=S1.B;K=S1.K;L=S1.L;
const {F,fx,eur,meter,geld,plusF,A,W,W3,walk,P,naar,voor,tijd,Z,T_,cam,camNaar,rond,ots,verteller,titel,speel,keuze,sleep,hyp,pick,rr,clamp,
  doelNaar,fietsAf,zorgFiets,binnen,buiten,bericht,sein,mgTiming,mgHold,mgGesprek,mgMash,levend,hoofdstuk,VOLG,PL,AD,pt,adr,outfit,dag,actIn,hoek,hoekWeg,zetBuitenSahara,studio}=S1;

/* ---------- een tram met ramen (voor de scène met Giulia) ---------- */
function tramMet(){const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c}),box=(w,h,d,c,x,y,z,em)=>{const o=new TH.Mesh(new TH.BoxGeometry(w,h,d),em?new TH.MeshBasicMaterial({color:c}):m(c));o.position.set(x,y,z);g.add(o);return o};
  const Lg=26,HW=1.25;box(HW*2,.95,Lg,'#f1efe9',0,.82,0);box(HW*2+.02,.36,Lg+.02,'#c0261e',0,.72,0);box(HW*2,.5,Lg,'#f1efe9',0,3.0,0);box(HW*2-.2,.06,Lg-.2,'#8a9098',0,3.28,0);
  for(let z=-Lg/2;z<=Lg/2+.01;z+=2.6)box(HW*2+.04,1.5,.22,'#f1efe9',0,2.0,z);box(HW*2-.1,.04,Lg-.1,'#3a3d44',0,1.3,0);
  box(HW*2-.1,2.4,.3,'#e8e4da',0,2.0,-Lg/2);box(HW*2-.1,2.4,.3,'#e8e4da',0,2.0,Lg/2);box(.7,.12,.08,'#fff6c8',0,1.0,Lg/2+.16,1);
  const lamp=new TH.PointLight('#fff1c8',3,12,1.4);lamp.position.set(0,2.6,0);g.add(lamp);const lamp2=lamp.clone();lamp2.position.set(0,2.6,8);g.add(lamp2);g.lengte=Lg;return g}
S1.tramMet=tramMet;

/* ---------- het bankje op de hoek (Bilal zit erop, de hoekdienst gebruikt het; blijft staan) ---------- */
let BANKJE=null;
function bankje(){const h=PL.hoek(),bank=walk(h.x-2,h.z-3,4);
  if(!BANKJE){BANKJE=new TH.Group();BANKJE.add(K.model([[2.2,.12,.6,0,.62,0,'#6a4a2a'],[2.2,.5,.1,0,.95,-.28,'#6a4a2a'],[.1,.6,.5,-1,.3,0,'#2a2c30'],[.1,.6,.5,1,.3,0,'#2a2c30']]));BANKJE.position.set(bank.x,0,bank.z);BANKJE.rotation.y=naar(bank,h)}
  if(!BANKJE.parent)G.scene().add(BANKJE);return {g:BANKJE,x:bank.x,z:bank.z,ry:naar(bank,h)}}
S1.bankje=bankje;
/* ---------- de hoekdienst: berichten, voorraad uit de meterkast, overdracht op het bankje, patrouilles ---------- */
S1.hoekDienst=function(t,o){o=Object.assign({klanten:6,test:true,duur:240,dex:false,van:[20,0],tot:[22,50]},o||{});return new Promise(async res=>{o.duur*=(S1.testSnel||1);
  const h=PL.hoek(),bank=walk(h.x-2,h.z-3,4),kast=walk(h.x+13,h.z-9,8);let actief=true,voorraad=0,verkocht=0,klant=null,patrouille=0,veilig=false,test=null,gestart=performance.now(),verdiend=0;
  bankje();
  const kastM=K.model([[.9,1.6,.3,0,.8,0,'#5a5d63'],[.04,.2,.04,.3,.9,.17,'#c9cfd6'],[.42,.1,.02,0,1.38,.16,'#ffd35a'],[.12,.12,.02,-.25,1.1,.16,'#16171b']]);kastM.position.set(kast.x,0,kast.z);kastM.rotation.y=naar(kast,bank);G.scene().add(kastM);
  // het doel (met route en baken) wijst steeds naar waar je nu heen moet: de meterkast als je te weinig op zak hebt, anders het bankje
  let doelNu='';const doelZet=()=>{let txt,p;
    if(patrouille){txt='Politie! Ga op het bankje zitten';p=bank}
    else if(klant&&!klant.komt&&voorraad<klant.n){txt='Klant '+klant.nr+' wacht · eerst voorraad uit de meterkast';p=kast}
    else if(klant&&!klant.komt){txt='Klant '+klant.nr+' wacht bij het bankje';p=bank}
    else if(voorraad<2){txt='Voorraad halen: de meterkast (gele sticker)';p=kast}
    else{txt='Bij het bankje wachten op een bericht';p=bank}
    const k=txt+'|'+p.x;if(k!==doelNu){doelNu=k;try{ST.doel(txt,{x:p.x,z:p.z})}catch(e){}}};
  const LIJST=['07','12','19','23','31'];const hud=document.createElement('div');hud.className='s1-hud2';hud.innerHTML='<div class="k"></div><div class="z"></div><div class="v"></div><div class="l"></div><div class="m" style="max-width:260px"></div>';document.body.appendChild(hud);
  const berichten=[];const msg=(t)=>{berichten.unshift(t);berichten.length=3;bericht('Tweede telefoon',t,{kleur:'#5a5d63',t:3})};
  const totMin=(o.tot[0]*60+o.tot[1])-(o.van[0]*60+o.van[1]);
  const klok=()=>{const f=clamp((performance.now()-gestart)/1000/o.duur,0,1),m=o.van[0]*60+o.van[1]+Math.round(f*totMin);return [Math.floor(m/60)%24,m%60,f]};
  const teken=()=>{const [hh,mm]=klok();hud.querySelector('.k').textContent='De hoek · '+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
    hud.querySelector('.z').textContent='Op zak: '+voorraad+'/2 · verkocht '+verkocht+'/'+o.klanten+' · '+S1.eur(verdiend);hud.querySelector('.v').textContent=klant?('Klant '+klant.nr+' wacht: '+(klant.n===2?'twee':'één')):'Geen klant';
    hud.querySelector('.l').textContent='Lijst: '+LIJST.join(' · ');hud.querySelector('.m').textContent=berichten.filter(Boolean).join(' / ');
    hud.style.outline=patrouille?'3px solid #3a7bff':'none';doelZet()};
  const nKlant=async(nr,n,isTest)=>{const id='hk'+Math.floor(Math.random()*1e6),s=walk(bank.x+rr(-18,18),bank.z+(Math.random()<.5?-16:16),6);
    const a=C.zet(id,s.x,s.z,0,{look:C.look(pick(['klant1','klant2','klant3','klant4'])),blijf:true});klant={id,nr,n,isTest,a,t0:performance.now(),komt:true};msg(nr+': '+(n===2?'twee':'één'));
    try{await a.loop(bank.x+1.6,bank.z+.6,{t:5})}catch(e){}if(klant&&klant.id===id){klant.komt=false;a.doe('handenzij')}};
  const weg=async(k,ren)=>{if(!k)return;const a=k.a;const s=walk(a.x+rr(-20,20),a.z+20,8);try{a.loop(s.x,s.z,{t:ren?2.6:6,run:!!ren}).then(()=>C.weg(k.id))}catch(e){C.weg(k.id)}if(klant===k)klant=null};
  const spK=G.spot({story:1,k:'hoek_kast',x:kast.x,z:kast.z,r:2.2,prio:3,n:'Meterkast',sub:'Voorraad pakken (max 2)',col:'#ffd35a',h:1.8,show:()=>actief&&!C.active(),
    act:async()=>{if(voorraad>=2){sein('Nooit meer dan twee op zak','#ff9a5a');return}const r=await mgHold({kop:'Meterkast',titel:'Pak er '+(2-voorraad),uitleg:'Houd vast. Niet te lang blijven staan.',stappen:1,duur:1});if(r&&r.ok){voorraad=2;fx('grab');teken()}}});
  const spB=G.spot({story:1,k:'hoek_bank',x:bank.x,z:bank.z,r:2.6,prio:3,n:'Het bankje',sub:'Klant helpen · of gewoon zitten',col:'#3fe395',h:1.6,show:()=>actief&&!C.active(),
    act:async()=>{if(patrouille){veilig=true;sein('Je zit. Telefoon in je hand. Niks te zien.','#7fd1ff');return}
      if(!klant||klant.komt){sein('Nog geen klant bij het bankje','#c9c4b8');return}
      if(voorraad<klant.n){sein('Te weinig op zak: eerst naar de meterkast','#ff9a5a');return}
      const r=await mgHold({kop:'Overdracht',titel:'Hand, geld, weg',uitleg:'Houd vast. Kijkt iemand? Dan even niks.',stappen:1,duur:1.4,storing:Math.random()<.5,kijkTekst:'De snackbar kijkt naar buiten!',waarschuw:'Er gaat een deur open…'});
      if(!r||!r.ok||!klant)return;const k=klant;voorraad-=k.n;
      if(k.isTest){test='bediend';meter('vertrouwen',-5);weg(k);await speel(t,[{speler:false},{actor:'bilal',at:[bank.x+2.4,bank.z-2.4],ry:naar({x:bank.x+2.4,z:bank.z-2.4},bank)},{actor:'luca',at:[bank.x,bank.z],ry:naar(bank,{x:bank.x+2.4,z:bank.z-2.4})},
        rond(bank,PI*.6,3.6,1.7,1.4),Z('bilal','Ik zei: geen nieuwe nummers.'),Z('bilal','Vierenveertig was van mij. Die was een test.'),{fade:'out',t:.3}]);C.weg('bilal');C.weg('luca');return}
      verkocht++;const pr=k.n*75;verdiend+=pr;geld(pr,'de hoek');fx('cash');weg(k);teken()}});
  const iv=setInterval(teken,500);
  // planning: klanten, de test, patrouilles
  let volgende=4,nr=0,testGedaan=!o.test,volgPatr=rr(55,75);
  while(levend(t)){await sleep(500);const [hh,mm,f]=klok();try{tijd(hh,mm)}catch(e){}const sec=(performance.now()-gestart)/1000;
    if(verkocht>=o.klanten||f>=1)break;
    if(!klant&&!patrouille&&sec>=volgende){if(!testGedaan&&f>.38){testGedaan=true;nKlant('44',1,true)}else{nKlant(pick(LIJST),Math.random()<.45?2:1,false);nr++}volgende=sec+rr(14,22)}
    if(klant&&!klant.komt&&(performance.now()-klant.t0)/1000>40){const k=klant;if(k.isTest)test='genegeerd';weg(k)}
    if(!patrouille&&sec>=volgPatr){patrouille=1;veilig=false;if(o.dex){fx('whistle');sein('Dex fluit: blauw!','#7fd1ff');await sleep(2500)}
      sein('Politie! Ga op het bankje zitten, niks in je handen (E bij het bankje)','#3a7bff');fx('heart');
      const pa=S1.politieAuto(),y0=h.z+9.5,x0=h.x-60;pa.position.set(x0,0,y0);pa.rotation.y=PI/2;G.scene().add(pa);const t0=performance.now();
      await new Promise(r=>{const step=()=>{const k=(performance.now()-t0)/7000;pa.position.x=x0+k*120;if(k<1&&levend(t))requestAnimationFrame(step);else r()};step()});pa.parent&&pa.parent.remove(pa);
      if(F('kramer_kent'))sein('Kramer, door het raampje: "De Santis. Geen rode jas vandaag?"','#7fd1ff');
      // met een wapen op zak: soms stappen ze uit (niet op het bankje: vaker)
      if(S1.wapen&&S1.wapen.heeft()&&Math.random()<(veilig?.12:.5)&&S1.wapenControle){hud.style.display='none';await S1.wapenControle(t,{zit:veilig});hud.style.display='';if(!levend(t))break}
      if(!veilig&&(voorraad>0||klant)){if(voorraad>0)voorraad--;meter('vertrouwen',-2);if(klant)weg(klant,true);sein('Te laat. Eén pakketje de bosjes in.','#ff5a4a')}else if(veilig)sein('Ze rijden door.','#3fe395');
      patrouille=0;volgPatr=sec+rr(60,90)+7}}
  actief=false;clearInterval(iv);G.unspot(spK);G.unspot(spB);hud.remove();try{ST.doel(null)}catch(e){}if(klant)weg(klant);kastM.parent&&kastM.parent.remove(kastM);
  if(test==null&&o.test)test='genegeerd';res({verkocht,test,verdiend})})};

VOLG.s1_h6={tekst:'Verder: Bella Napoli, donderdagavond (Hoofdstuk 6)',p:()=>PL.napoli(),sub:'Donderdag · Lek',actie:'Naar binnen'};
/* =================== HOOFDSTUK 6 · Lek =================== */
hoofdstuk({id:'s1_h6',na:'s1_h7',vrij:true,blokken:[
 async t=>{dag(4,20,0);outfit('bezorger');await binnen('napoli');B.toon('napoli','giovanni',false);
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 6','Lek',2.6),{actor:'giovanni',at:W('napoli',...S1.NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',...S1.NAP.luca),ry:PI},actIn(['giovanni','luca']),
   cam(...W3('napoli',4.4,2.2,10.8),...W3('napoli',7.8,1.4,7.6),{fov:44}),{fade:'in',t:.6},Z('giovanni','Twee voor mevrouw Bakkal. Ze bestelt al tien jaar bij ons.'),Z('giovanni','Rapido rijdt vanavond rond met kortingsbonnen. Let niet op ze.'),{fade:'out',t:.4}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli());try{G.fiets.last(2)}catch(e){}},
 async t=>{// de rit, en halverwege staat Kenny dwars
  const a=AD.westbuurt2||AD.bakkal,p=pt(a);ST.doel('Bezorgen · '+adr(a,'Westbuurt'),p);let ok=false;const start=P();
  for(let i=0;i<4000&&levend(t);i++){await sleep(200);const d=hyp(G.P.x-p.x,G.P.z-p.z),van=hyp(G.P.x-start.x,G.P.z-start.z);if((d<75&&van>40)||d<30){if(!C.active()&&!B.waar()){ok=true;break}}}if(!ok||!levend(t))return;
  fietsAf();ST.doel(null);const l=P(),q=voor(5,0),sc=L.scooter?L.scooter('#e8c823'):null;if(sc){sc.position.set(q.x,0,q.z);sc.rotation.y=naar(q,l)+PI/2;G.scene().add(sc)}
  const m=voor(3.5,2.2),k=voor(3.4,-1.2);
  await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'kenny',at:[k.x,k.z],ry:naar(k,l),anim:'armen'},{actor:'klant4',at:[m.x,m.z],ry:naar(m,l)},
   cam(l.x-sin(l.ry)*3.4,1.4,l.z-cos(l.ry)*3.4,q.x,1.0,q.z,{fov:42}),{snd:'engineStart'},Z('kenny','Ik zei het toch, Napoli. Van je fiets.'),
   {move:'klant4',to:[l.x+.6,l.z+.6],t:.8},{anim:'klant4',a:'duw',naar:'luca'},{snd:'hit'},{fade:'out',t:.25},{anim:'luca',a:'bang'},rond(l,l.ry+PI*.6,3.8,1.5,.6),{fade:'in',t:.25},
   T_("Twee pizzadozen op de stenen."),Z('kenny','Die klanten bestellen voortaan bij ons. Zeg dat tegen die ouwe.'),{snd:'hit'},T_('Kenny trapt een doos open.'),{snd:'engineStart'},{weg:'kenny'},{weg:'klant4'},{fade:'out',t:.4}]);
  if(sc)sc.parent&&sc.parent.remove(sc);C.weg('luca');try{G.fiets.last(0)}catch(e){}F('h6_hinderlaag',1);zorgFiets()},
 async t=>{if(!await doelNaar(t,'Terug naar Bella Napoli',PL.napoli(),{actie:'Naar binnen',sub:'Bella Napoli',gebouw:'napoli'}))return;await binnen('napoli');B.toon('napoli','giovanni',false);tijd(22,30);
  await speel(t,[{speler:false},{actor:'giovanni',at:W('napoli',...S1.NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',2.2,7.4),ry:-PI/2},actIn(['giovanni','luca']),
   cam(...W3('napoli',5.2,2.0,10.4),...W3('napoli',4.0,1.4,7.0),{fov:44}),{fade:'in',t:.4},
   Z('giovanni',"Twee pizza's op straat. En mevrouw Bakkal belt voortaan Rapido."),Z('giovanni','Laat het, Luca. Hoor je me? Laat het.'),
   T_('Luca hangt de jas aan de haak. Hij trekt zijn capuchon op.'),{fn:()=>outfit('straat')},{fade:'out',t:.5}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();tijd(23,20)},
 async t=>{// de achterplaats van Pizza Rapido
  const r=PL.rapido(),ach=walk(r.x+6,r.z-22,10);if(!await doelNaar(t,'Achterplaats Pizza Rapido',ach,{actie:'Over het hek',sub:'Kenny\'s scooter'}))return;
  const sc=[],deur=walk(ach.x-6,ach.z-4,6),led=K.model([[.3,.2,.2,0,0,0,'#2a2c30'],[.06,.06,.06,0,-.06,.11,'#ff2a1a',1]]);led.position.set(deur.x,3.0,deur.z);G.scene().add(led);
  ['#e8c823','#c0261e','#e8c823'].forEach((c,i)=>{const s=L.scooter?L.scooter(c):null;if(!s)return;const q=walk(ach.x+2+i*1.6,ach.z+2,4);s.position.set(q.x,0,q.z);s.rotation.y=PI/2;G.scene().add(s);sc.push(s)});
  const kenny=sc[2]||sc[0],ks=kenny?{x:kenny.position.x,z:kenny.position.z}:ach;
  await speel(t,[{speler:false},{actor:'kok',at:[deur.x,deur.z],ry:naar(deur,ks),anim:'rook'},{actor:'luca',at:[ks.x-1.2,ks.z+1.2],ry:naar({x:ks.x-1.2,z:ks.z+1.2},ks),anim:'hurk'},
   cam(ks.x-5,3.4,ks.z+6,ks.x,1,ks.z,{fov:44}),{fade:'in',t:.5},T_('Drie scooters. De gele van Kenny achteraan. Boven de keukendeur een camera met een rood lampje.'),
   T_('De kok rookt in de deuropening. Om de paar tellen kijkt hij de plaats op.'),{fade:'out',t:.3}]);
  const g=await mgHold({kop:'Achterplaats',titel:'Twee banden',uitleg:'Houd vast (E). Kijkt de kok? Loslaten en stil zitten.',stappen:2,duur:1.6,storing:true,kijkTekst:'De kok kijkt!',waarschuw:'Hij draait zijn hoofd…',betrapt:'Hij ziet iets bewegen…'});
  const gezien=g&&g.fout>=2;if(gezien)F('camera_gezien',1);
  await speel(t,[gezien?Z('kok','Hé! Wie is daar?'):null,gezien?{snd:'scream'}:null,{actor:'luca',at:[ach.x-2,ach.z+6],ry:PI},{weg:'kok'},
   cam(ach.x-9,1.6,ach.z+12,ks.x,.5,ks.z,{fov:40}),{fade:'in',t:.4},{move:'luca',to:[ach.x-12,ach.z+14],t:2.4,anim:gezien?'run':'walk',wacht:false},
   {fn:()=>{if(kenny)kenny.position.y=-.14}},{snd:'click'},T_(gezien?'Luca rent. Achter hem zakt de gele scooter op zijn velgen.':'Luca loopt rustig weg, handen in zijn zakken. Achter hem zakt de gele scooter op zijn velgen.'),
   verteller('n14'),{fade:'out',t:.6},titel('Vrijdag','',2)]);
  C.weg('luca');sc.forEach(s=>s.parent&&s.parent.remove(s));led.parent&&led.parent.remove(led);F('banden_lek',1)}]});
VOLG.s1_h7={tekst:'Verder: Lounge Sahara, vrijdagavond (Hoofdstuk 7)',p:()=>PL.sahara(),sub:'Vrijdag · Incasso',actie:'Naar binnen'};

/* =================== HOOFDSTUK 7 · Incasso =================== */
hoofdstuk({id:'s1_h7',na:'s1_h8',vrij:true,outfit:'straat',blokken:[
 async t=>{dag(5,20,30);outfit('straat');await zetBuitenSahara();const d=PL.sahara(),l=walk(d.x+.5,d.z+2.6,3),mo={x:d.x+1.6,z:d.z+1.0};const bu=G.binnen.uitsmijterBuiten;if(bu&&bu.g)bu.g.visible=false;
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 7','Incasso',2.6),{actor:'mo',at:[mo.x,mo.z],ry:naar(mo,l),anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:naar(l,mo)},rond(mo,naar(mo,l)+1,3.4,1.8,1.5),{fade:'in',t:.5},
   Z('mo','Geen rode jas vandaag? Mooi.',{mood:'blij'}),{fade:'out',t:.4}]);C.weg('mo');C.weg('luca');if(bu&&bu.g)bu.g.visible=true;
  await binnen('sahara');
  await speel(t,[...hoek(true),{actor:'tarik',at:W('sahara',19.4,17.4),ry:PI*.85,anim:'armen'},actIn(['tarik']),cam(...W3('sahara',18.6,2.0,18.6),...W3('sahara',21.4,1.2,15.0),{fov:40}),{fade:'in',t:.5},
   Z('rafiq',"Rapido's scooter staat op zijn velgen, hoor ik. Rare week voor Rapido."),F('camera_gezien')?Z('bilal','Ze hebben iemand op de camera. Met een capuchon.'):null,
   {anim:'rafiq',a:'give',prop:'envelop'},T_('Rafiq schuift een briefje over tafel: "Vos · Oud-Zuid · €600".'),
   Z('rafiq','Meneer Vos. Zeshonderd euro, drie weken te laat. Tarik rijdt. Jij praat.'),Z('luca','Waarom ik? Tarik is twee keer zo groot.'),Z('rafiq','Omdat niemand bang is voor een jongen. Tot hij iets zegt.'),
   T_('Tarik pakt zijn autosleutels van tafel.'),{fade:'out',t:.5}]);hoekWeg()},
 async t=>{// bij Vos aan de deur (Oud-Zuid). Tarik blijft bij de auto.
  await buiten();const v=PL.rijtjeshuis(),DV=S1.deur(S1.voorDeur('rijtjeshuis',.6)||v),deur=DV.q,l=DV.l,car=S1.voorDeur('rijtjeshuis',8)||walk(v.x+6,v.z+7,6);tijd(21,5);
  const auto=S1.auto('#121316');auto.position.set(car.x,0,car.z);auto.rotation.y=PI/2;G.scene().add(auto);G.P.x=l.x;G.P.z=l.z;
  await speel(t,[{speler:false},{actor:'tarik',at:[car.x-1.2,car.z-1.4],ry:naar(car,l),anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:naar(l,deur)},
   cam(car.x+4,2.4,car.z+6,l.x,1.4,l.z,{fov:44}),{fade:'in',t:.6},{snd:'carDoor'},T_('Een rijtjeshuis in Oud-Zuid. Gordijnen dicht. Binnen staat de tv aan.'),
   rond(l,naar(l,deur)+PI*.85,3.2,1.7,1.5)]);
  let woede=0;const D=17;
  const r=await S1.inScene(t,[{actor:'vos',at:[deur.x,deur.z],ry:naar(deur,l)},DV.cam],()=>mgGesprek({kop:'Aan de deur · meneer Vos',wie:'vos',kleur:'#c09a6a',meters:{d:['DRUK',0,'#ff9a3a']},
   beurten:[
    {vraag:'De deur blijft dicht. Wat doe je?',opties:[
     {t:'Aanbellen tot hij opendoet',eff:{d:D},fn:async()=>{woede++;await mgMash({kop:'Aanbellen',titel:'Blijf bellen',uitleg:'Tik zo snel je kunt.',tijd:5,doel:22,knop:'Bel!'});fx('deurbel')},reactie:'Ja! Ja! Ik kom al!'},
     {t:'Door de brievenbus: "Meneer Vos. Ik ga niet weg."',eff:{d:D},reactie:'…'},
     {t:'Bij de buurvrouw aanbellen',eff:{d:D},fn:async()=>{await C.zeg(null,'De buurvrouw: "Hij is thuis. Hij doet nooit open."',{t:2.6})},reactie:'Wat moet je?'}]},
    m=>({vraag:'Vos op de ketting: "Wie ben jij? Ik heb niks besteld." · "Ik heb niks. Zeg dat maar tegen Rafiq."',opties:[
     {t:'"Vandaag een deel. Dan ben ik weg."',eff:{d:D},reactie:'Een deel…'},
     {t:'"Tarik wacht beneden. Hij heeft geen geduld."',eff:{d:D*2},fn:()=>{woede++},reactie:'Is dat een dreigement?'},
     {t:'"Mooie nieuwe Golf voor de deur. Ook niks?"',eff:{d:D*2},reactie:'Die is van mijn zwager.'}]}),
    m=>({vraag:'Vos haalt zes briefjes van vijftig tevoorschijn: "Driehonderd. Meer is er niet."',opties:[
     {t:'"Goed. Volgende week de rest."',id:'half',eff:{}},
     {t:'"Alles. Nu."',id:'alles',eff:{}}]})]}))||{m:{d:0},gekozen:[]};
  const druk=Math.round(r.m.d/D),keus=r.gekozen[2];
  let uit=keus==='half'?'half':(druk>=4&&woede<=2?'woorden':'tarik');F('incasso',uit);
  if(uit==='woorden')await speel(t,[T_('Vos kijkt naar Tarik bij de auto. Naar de jongen voor zijn deur.'),Z('vos','…Wacht.'),{snd:'open'},T_('Hij komt terug met een koffieblik. Zeshonderd.'),Z('luca','Fijne avond, meneer Vos.')]);
  else if(uit==='half')await speel(t,[{anim:'luca',a:'give'},T_('Driehonderd. De deur gaat dicht.')]);
  else await speel(t,[{snd:'door'},T_('Vos slaat de deur dicht.'),{move:'tarik',to:[l.x+.8,l.z+.6],t:2.2},Z('tarik','Ga maar bij de auto staan.'),
    {move:'luca',to:[car.x-1,car.z-1.6],t:2.4,wacht:false},cam(car.x-3,1.5,car.z-4,car.x,1.2,car.z,{fov:40}),{wait:1.4},{snd:'hit'},{wait:.5},{snd:'door'},
    T_('Luca kijkt naar de auto. Niet naar het huis.'),{move:'tarik',to:[car.x-1.4,car.z-1.2],t:2},Z('tarik','Zeshonderd. Stap in.')]);
  await speel(t,[{fade:'out',t:.5}]);C.weg('tarik');C.weg('luca');C.weg('vos');auto.parent&&auto.parent.remove(auto)},
 async t=>{// terug in Sahara
  await binnen('sahara');const u=F('incasso');const v=u==='woorden'?[Z('rafiq','Met woorden. Dat is duurder dan een vuist, en het houdt langer.')]:u==='half'?[Z('rafiq','Half is ook iets. Volgende week haal jij de rest.')]:[Z('rafiq','Tarik deed het werk. Jij keek. Volgende keer niet.')];
  if(u==='woorden'){meter('vertrouwen',5);meter('naam',5);F('naam_trap',Math.max(F('naam_trap')||0,1))}else if(u==='half')meter('vertrouwen',2);
  await speel(t,[...hoek(true),cam(...W3('sahara',18.6,2.0,18.6),...W3('sahara',21.4,1.2,15.0),{fov:40}),{fade:'in',t:.4},{anim:'luca',a:'give'},{snd:'cash'},...v,
   {anim:'rafiq',a:'give',prop:'geld',naar:'luca'},T_('Rafiq trekt er een briefje van honderd uit. Voor Luca.'),verteller('n15'),{fade:'out',t:.5}]);hoekWeg();geld(100,'incasso Vos')},
 async t=>{// eerste rapportage
  await studio(t,0,['n16','n17'],[{wait:.6}]);await zetBuitenSahara();
  await speel(t,[titel('Maandag','Week twee',2.4)]);sein('Vrij rondrijden. Klussen bij Bella Napoli en Sahara.','#7fd1ff')}]});
VOLG.s1_h8={tekst:'Verder: naar huis, maandagavond (Hoofdstuk 8)',p:()=>PL.thuis(),sub:'Maandag · De hoek',actie:'Naar binnen'};

/* =================== HOOFDSTUK 8 · De hoek =================== */
hoofdstuk({id:'s1_h8',na:'s1_h9',vrij:true,blokken:[
 async t=>{dag(8,19,45);outfit('straat');await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 8','De hoek',2.6),{actor:'elena',at:W('thuis',12.2,2.25),ry:PI,anim:'kok'},{actor:'luca',at:W('thuis',5.0,6.9),ry:PI*1.15},
   {actor:'marco',at:W('thuis',3.6,6.25),ry:PI,anim:'tv',sitY:-.4},actIn(['elena','luca','marco']),cam(...W3('thuis',9.4,2.55,1.8),...W3('thuis',4.8,1.9,6.2),{fov:54,strak:true}),{fade:'in',t:.6},
   Z('elena','Ga je weg? Je werkt toch niet op maandag?'),Z('luca','Bij Dex.'),Z('marco','Om tien uur thuis.'),{snd:'door'},{fade:'out',t:.4}]);['elena','luca','marco'].forEach(k=>C.weg(k));await buiten()},
 async t=>{if(!await doelNaar(t,'De hoek · Tramlaan, bij de speeltuin',PL.hoek(),{actie:'Naar Bilal',sub:'De hoek'}))return;tijd(20,0);
  const h=PL.hoek(),bk=bankje(),b={x:bk.x,z:bk.z},l=walk(h.x+.6,h.z-1,4),dx=F('dex_wil')==='erin';
  const r8=await speel(t,[{speler:false},{actor:'bilal',at:[b.x,b.z],ry:bk.ry,anim:'sit',sitY:-.2},{actor:'luca',at:[l.x,l.z],ry:naar(l,b)},dx?{actor:'dex',at:[l.x+2.2,l.z+1],ry:naar({x:l.x+2.2,z:l.z+1},b),anim:'leun'}:null,
   cam(h.x+14,5,h.z-10,h.x,1,h.z,{fov:44}),{fade:'in',t:.6},verteller('n18'),rond(b,naar(b,l)+1.2,3.4,1.6,1.2),
   Z('bilal','Dit is de hoek. Maandag tot woensdag, acht tot elf. Als je niet bij Giovanni staat.'),Z('bilal','Nooit meer dan twee op zak. De rest zit in de meterkast van de portiek.'),
   Z('bilal','Alleen nummers van de lijst. Nieuw nummer? Dan ken je niemand.'),{anim:'bilal',a:'give',prop:'sleutel',naar:'luca'},
   dx?Z('bilal','En je vriendje mag kijken. Fluiten als er blauw komt. Meer niet.'):null,
   ...(S1.wapenVanBilal?S1.wapenVanBilal():[])]);if(!levend(t))return;
  if(S1.wapenNaBilal)await S1.wapenNaBilal(t,r8==='laat'?'laat':'pak');await speel(t,[{fade:'out',t:.4}]);['bilal','luca','dex'].forEach(k=>C.weg(k));
  sein('De hoek: meterkast = voorraad · bankje = klanten · politie? Op het bankje zitten','#ffd35a');
  const r=await S1.hoekDienst(t,{klanten:6,test:true,dex:dx,duur:230});if(!levend(t))return;F('hoek_verkocht',r.verkocht);F('test44',r.test);
  if(r.test==='genegeerd'){meter('vertrouwen',5);bericht('B.','44 was van mij. Goed zo.',{kleur:'#5a5d63'})}
  meter('naam',3);F('naam_trap',Math.max(F('naam_trap')||0,1))},
 async t=>{// 22:50, de tram
  tijd(22,50);try{G.tram&&G.tram.stop(true)}catch(e){}const h=PL.hoek(),b=walk(h.x-2,h.z-3,4),zT=471.7,tram=S1.tramMet();tram.rotation.y=PI/2;tram.position.set(h.x-90,0,zT);G.scene().add(tram);
  let gx=h.x-90;const gi=C.zet('giulia_tram',gx,zT,PI,{look:S1.giuliaWerk(),blijf:true});
  const rij=(van,tot,dur)=>new Promise(r=>{const t0=performance.now();const st=()=>{const k=Math.min(1,(performance.now()-t0)/(dur*1000)),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,x=van+(tot-van)*e;tram.position.x=x;try{gi.zet(x+3,zT-.4,PI)}catch(e2){}if(k<1)requestAnimationFrame(st);else r()};st()});
  await speel(t,[{speler:false},{actor:'luca',at:[b.x+1.2,b.z+.4],ry:naar(b,{x:h.x,z:zT})},{actor:'klant2',at:[b.x+2.4,b.z+.8],ry:naar({x:b.x+2.4,z:b.z+.8},b)},
   cam(b.x-1,1.5,b.z-7,b.x+1.6,1.3,b.z+3,{fov:40}),{fade:'in',t:.5},{anim:'luca',a:'give',naar:'klant2'},{snd:'tram'},
   {fn:()=>{rij(h.x-90,h.x-6,6)}},{wait:5.6},cam(h.x+2,2.0,zT-6.5,h.x-3,2.1,zT,{fov:30}),{wait:.4},T_('Achter het raam: Giulia, in haar uniform, op weg naar haar nachtdienst. Haar hoofd tegen het glas.'),
   {wait:1.2},cam(b.x-1,1.5,b.z-7,b.x+1.6,1.3,b.z+3,{fov:40}),T_('Ze ziet het. Luca kijkt niet op.'),{fn:()=>{rij(h.x-6,h.x+110,7)}},verteller('n19'),{fade:'out',t:.6}]);
  tram.parent&&tram.parent.remove(tram);C.weg('giulia_tram');C.weg('luca');C.weg('klant2');try{G.tram&&G.tram.stop(false)}catch(e){}F('giulia_zag',1);
  await speel(t,[titel('Dinsdag','21:30',2.2)])}]});
VOLG.s1_h9={tekst:'Verder: naar huis, dinsdagavond (Hoofdstuk 9)',p:()=>PL.thuis(),sub:'Dinsdag · Mijn buurt',actie:'Naar binnen'};

/* =================== HOOFDSTUK 9 · Mijn buurt =================== */
hoofdstuk({id:'s1_h9',na:'s1_h10',vrij:true,blokken:[
 async t=>{dag(9,21,30);outfit('thuis');await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));
  const r=await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 9','Mijn buurt',2.6),
   {actor:'luca',at:W('thuis',14.2,10.6),ry:-PI/2,anim:'sit',sitY:-.42},{actor:'giulia',at:W('thuis',11.6,11.0),ry:PI/2},actIn(['luca','giulia']),
   cam(...W3('thuis',12.8,2.5,13.2),...W3('thuis',12.9,1.9,10.6),{fov:58,strak:true}),{fade:'in',t:.6},{snd:'close'},
   T_('Giulia heeft vrij genomen. Ze staat met haar rug tegen de deur.'),Z('giulia','Gisteravond. Tram zeven. Bij de speeltuin.'),Z('giulia','Je gaf iemand iets. En je pakte geld aan.'),
   cam(...W3('thuis',11.2,2.45,12.8),...W3('thuis',14.2,1.85,10.6),{fov:46,strak:true}),{wait:1.6},
   keuze('luca','',[{t:'Ontkennen',id:'ontkend'},{t:'"Het is voor ons."',id:'voor_ons'},{t:'"Bemoei je met je eigen leven."',id:'bemoei'}])]);
  if(!levend(t))return;F('giulia_ruzie',r);meter('band_giulia',-20);
  const v=r==='ontkend'?[Z('luca','Je zag iemand anders.'),Z('giulia','Ik herken jouw loopje op honderd meter, Luca.')]:r==='voor_ons'?[Z('luca',"Papa's rug. De huur. Iemand moet het doen."),Z('giulia','Niet zo. En zeker niet jij.')]
   :[Z('luca','Jij bent mijn moeder niet.'),Z('giulia','Nee. Zij zou het niet eens geloven.')];
  await speel(t,[...v,F('giulia_weet')?{anim:'giulia',a:'give'}:null,F('giulia_weet')?Z('giulia','En je honderd euro. Ik wil het niet meer.'):null,
   cam(...W3('thuis',15.0,1.2,11.6),...W3('thuis',11.6,1.6,11.0),{fov:40}),Z('giulia',"Weet je wie er 's nachts bij ons binnenkomt? Jongens van jouw leeftijd."),
   Z('giulia','Met een gat in hun been. En ik moet ze vasthouden tot de dokter er is.'),{anim:'luca',a:'idle'},{move:'luca',to:W('thuis',13.0,10.8),t:1.2},
   Z('giulia','Ik zeg niks tegen ze. Nog niet. Maar jij stopt.'),Z('luca','Ga jij maar nachtdiensten draaien voor niks. Ik doe het anders.'),
   cam(...W3('thuis',12.8,1.8,10.2),...W3('thuis',11.6,1.6,11.0),{fov:30}),{wait:1.4},T_('Giulia zegt niks. Ze stapt opzij van de deur.'),
   {fn:()=>outfit('straat')},{actor:'marco',at:W('thuis',3.6,6.25),ry:PI,anim:'slaap',sitY:-.4},{actor:'luca',at:W('thuis',5.0,8.6),ry:-PI/2},actIn(['marco','luca']),
   cam(...W3('thuis',9.4,2.45,8.75),...W3('thuis',2.4,2.0,8.9),{fov:50,strak:true}),{move:'luca',to:W('thuis',2.0,9.0),t:1.4,wacht:false},Z('elena','Luca? Waar ga je heen? Het is half tien!'),
   {snd:'door'},{anim:'marco',a:'schrik'},{fade:'out',t:.4}]);
  if(F('giulia_weet')){geld(100,'terug van Giulia')}['luca','giulia','marco'].forEach(k=>C.weg(k));await buiten();tijd(21,40)},
 async t=>{// buiten: Kenny, aan het eind van zijn dienst
  const th=PL.thuis(),l=walk(th.x,th.z+3,3),k=walk(th.x+5,th.z+4,4),sc=L.scooter?L.scooter('#e8c823'):null;if(sc){const s=walk(k.x+2,k.z+1,4);sc.position.set(s.x,0,s.z);sc.rotation.y=PI/2;G.scene().add(sc)}
  G.P.x=l.x;G.P.z=l.z;const kZij=D=>{const a=naar(l,k),mx=(l.x+k.x)/2,mz=(l.z+k.z)/2;return cam(mx+cos(a)*D,2.45,mz-sin(a)*D,mx,2.0,mz,{fov:46,strak:true})};
  await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,k)},{actor:'kenny',at:[k.x+3,k.z+2],ry:naar(k,l)},kZij(6),{fade:'in',t:.4},{snd:'tram'},
   {move:'kenny',to:[k.x,k.z],t:1.6},T_('Kenny, met een lege bezorgtas, komt uit de portiek naast die van Luca. Ze zien elkaar.'),
   F('camera_gezien')?Z('kenny','Jij. Ik heb je op de camera gezien. Mijn banden.'):Z('kenny','Ik weet dat jij het was, Napoli. Mijn banden.'),
   Z('luca','Wat doe jij in mijn straat?'),Z('kenny','Bezorgen. Je moeder had zin in pizza, misschien.'),{anim:'kenny',a:'duw',naar:'luca'},{snd:'hit'},kZij(4.6)]);
  let win=false;for(let p=0;p<2&&!win&&levend(t);p++){try{win=await G.h1.vechten({wie:'Kenny',onRaak:()=>fx('punch')})}catch(e){win=true}
   if(!win&&p===0)await speel(t,[T_('Luca ligt op de stoep. Kenny lacht.'),Z('kenny','Is dat alles?'),T_('Luca staat op.')])}
  if(!win)F('vuil_gewonnen',1);
  await speel(t,[win?null:T_('Luca grijpt een fietsslot van het rek.'),{snd:'punch'},{snd:'hit'},cam(k.x+5,1.0,k.z+3,sc?sc.position.x:k.x,1,sc?sc.position.z:k.z,{fov:36}),{wait:1},
   {actor:'kenny',at:[k.x,k.z],ry:naar(k,l),anim:'bang'},{actor:'luca',at:[k.x-.9,k.z-.4],ry:naar({x:k.x-.9,z:k.z-.4},k),anim:'hurk'},rond(k,naar(k,l)+PI*.3,3,1.5,.8)]);
  await mgHold({kop:'De portemonnee',titel:'Pak zijn bezorgportemonnee',uitleg:'Houd vast.',stappen:1,duur:1});
  await speel(t,[{snd:'cash'},T_('Vierhonderd euro. Contant geld van een avond Rapido.'),cam(k.x-.5,.6,k.z+2.0,k.x-.9,1.6,k.z-.4,{fov:50,strak:true}),
   Z('luca','Dit is mijn buurt. Ik zie je hier nooit meer.'),Z('luca','Ook niet met een bestelling. Rapido stuurt maar iemand anders.'),Z('luca','Anders kom ik jou zoeken.'),
   T_('Kenny knikt. Hij kijkt hem niet aan.'),{actor:'ans',at:[PL.ans().x,PL.ans().z],ry:naar(PL.ans(),k),y:13.6},cam(PL.ans().x+2,15.4,PL.ans().z-3,k.x,0,k.z,{fov:40}),{wait:1.6},
   T_('Op de galerij staat buurvrouw Ans, met haar boodschappentas. Ze heeft alles gezien.'),{weg:'ans'},{fade:'out',t:.4}]);
  C.weg('kenny');C.weg('luca');if(sc)sc.parent&&sc.parent.remove(sc);geld(1200,'Kenny (Rapido)');meter('naam',15);F('naam_trap',2);F('ans_zag',1);F('kenny_weg',1)},
 async t=>{const l=P();await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:PI*.5},{actor:'klant2',at:[l.x+6,l.z+3],ry:-PI/2,anim:'leun'},{actor:'klant4',at:[l.x+7,l.z+4],ry:-PI/2,anim:'armen'},
   {cam:{volg:'luca',af:[2.0,2.6,-4.0],kijk:[0,2.0,3]}},{fade:'in',t:.4},{move:'luca',to:[l.x+14,l.z+1],t:4.4,wacht:false},{wait:1.6},{anim:'klant2',a:'turn',ry:PI},{move:'klant4',to:[l.x+7,l.z+6.4],t:.8},
   T_('Twee jongens bij de snackbar gaan opzij.'),{fn:()=>{try{L.tril&&L.tril()}catch(e){}bericht('R.','Hoorde het van Rapido. Zaterdag neem ik je mee. Doe iets netjes aan.',{kleur:'#5a5d63'})}},
   verteller('n20'),{cam:null},{fade:'out',t:.5}]);['luca','klant2','klant4'].forEach(k=>C.weg(k));
  sein('De hoek is nu een klus (avond). Thuis: praten met Giulia kan.','#7fd1ff');F('hoek_klus',1)}]});
VOLG.s1_h10={tekst:'Verder: zaterdagavond, Rafiq haalt je op (Hoofdstuk 10)',p:()=>PL.thuis(),sub:'Zaterdag · Groen licht',actie:'Naar binnen'};

/* =================== HOOFDSTUK 10 · Groen licht =================== */
hoofdstuk({id:'s1_h10',na:'s1_h11',vrij:true,blokken:[
 async t=>{dag(13,18,30);await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));outfit('casual');
  const r=await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 10','Groen licht',2.6),{actor:'marco',at:W('thuis',3.9,9.1),ry:PI/2},{actor:'luca',at:W('thuis',5.6,8.25),ry:-PI/2},actIn(['marco','luca']),
   cam(...W3('thuis',9.4,2.45,8.75),...W3('thuis',4.2,2.1,9.0),{fov:48,strak:true}),{fade:'in',t:.6},Z('marco','Waar ga jij zo netjes heen?'),
   keuze('luca','',[{t:'"Verjaardag van iemand."',id:'jarig'},{t:'"Gaat je niks aan."',id:'bot'}])]);
  if(r==='bot'){meter('band_marco',-5);plusF('marco_vermoeden')}
  await speel(t,[r==='bot'?Z('marco','Zo praat je niet tegen mij.'):Z('marco','Doe hem de groeten. Wie het ook is.'),{fade:'out',t:.4}]);C.weg('marco');C.weg('luca');await buiten();
  // buiten: de zwarte auto voor de flat. De buren zien het. Aan de overkant: een telelens.
  const th=PL.thuis(),car=walk(th.x+6,th.z+6,6),l=walk(th.x+1,th.z+3,3),auto=S1.auto('#121316');auto.position.set(car.x,0,car.z);auto.rotation.y=PI/2;G.scene().add(auto);S1._rafiqAuto=auto;
  await speel(t,[{speler:false},{actor:'tarik',at:[car.x-1.2,car.z+1.4],ry:naar(car,l),anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:naar(l,car)},cam(l.x-5,2.6,l.z+6,car.x,1.2,car.z,{fov:44}),{fade:'in',t:.5},
   {snd:'carDoor'},{move:'luca',to:[car.x-1.4,car.z-.6],t:2.2},{fn:()=>{const o=document.createElement('div');o.id='s1Lens';o.style.cssText='position:fixed;inset:0;z-index:70;pointer-events:none;background:radial-gradient(circle at 50% 50%,transparent 32%,#000 34%)';document.body.appendChild(o)}},
   cam(car.x+40,3,car.z+30,car.x-1.4,1.4,car.z-.6,{fov:9}),{snd:'click'},{wait:.6},{snd:'click'},{wait:.8},{fn:()=>{const o=document.getElementById('s1Lens');if(o)o.remove()}},{fade:'out',t:.4}]);
  C.weg('tarik');C.weg('luca');auto.parent&&auto.parent.remove(auto)},
 async t=>{// de haven: parkeerplaats bij de douane, ploegwissel
  const d=PL.douane(),car=walk(d.x-26,d.z+16,8),l=walk(car.x+1.4,car.z+2,4),e=walk(car.x+14,car.z-4,8);tijd(19,0);
  const auto=S1.auto('#121316');auto.position.set(car.x,0,car.z);auto.rotation.y=0;G.scene().add(auto);G.P.x=l.x;G.P.z=l.z;
  await speel(t,[{speler:false},{actor:'tarik',at:[car.x+1.6,car.z-1],ry:-PI/2,anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:PI},{actor:'rafiq',at:[car.x+.5,car.z+.4],ry:PI/2,anim:'sit',sitY:-.5},
   cam(car.x+18,8,car.z+20,car.x,1.5,car.z,{fov:40}),{fade:'in',t:.6},verteller('n21'),cam(car.x+4.0,2.4,car.z-1.6,car.x+1.0,1.9,car.z+1.2,{fov:46,strak:true}),
   Z('rafiq','Die man met het koord om zijn nek. Edwin. Hij werkt met je vader.'),Z('rafiq','Dinsdag komt er een container koffie binnen. Edwin moet hem niet zien.'),
   Z('rafiq','Jou kent hij. Mij niet. Zo blijft het.'),{fade:'out',t:.3}]);C.weg('rafiq');
  await speel(t,[{actor:'edwin',at:[e.x,e.z],ry:naar(e,l),prop:'tas'},{actor:'luca',at:[e.x-2.2,e.z+1],ry:naar({x:e.x-2.2,z:e.z+1},e)},{actor:'tarik',at:[e.x-5,e.z+2.4],ry:naar({x:e.x-5,z:e.z+2.4},e),anim:'armen'},
   rond(e,naar(e,l)+1.2,4.2,1.8,1.5),{fade:'in',t:.4},Z('edwin','Jij bent toch de zoon van Marco? Wat doe jij hier?'),Z('luca','Even praten, Edwin. Over dinsdag.')]);
  // groen licht: HEBZUCHT tegen ANGST
  const kaart=(ronde)=>[{t:'Geld · "Tienduizend. Voor één keer niet kijken."',id:'geld',eff:{h:35},reactie:'Tienduizend. Weet je wat ik verdien?'},
    {t:'Begrip · "Ik weet van je schulden. Wij lossen ze op."',id:'begrip',eff:{h:20,a:10},reactie:'Wie heeft jou dat verteld?'},
    {t:'Dreiging · Tarik houdt een telefoon op: een schoolplein.',sub:'"Noor zit in groep zes, toch?"',id:'dreig',eff:{a:45},reactie:'Laat haar erbuiten. Ik zweer het je.'},
    ronde===0?{t:'Vader · "Mijn vader zegt dat je een goeie vent bent."',id:'vader',eff:{a:10},reactie:'Weet je vader hiervan?'}:null].filter(Boolean);
  const r=await S1.inScene(t,[rond(e,naar(e,l)+1.2,4.2,1.8,1.5)],()=>mgGesprek({kop:'Groen licht · Edwin',wie:'edwin',kleur:'#9ad0a0',meters:{h:['HEBZUCHT',30,'#d6b25a'],a:['ANGST',20,'#ff5a4a']},
   beurten:[0,1,2].map(i=>({vraag:['Edwin kijkt naar zijn auto. Naar jou.','Edwin: "En als ik nee zeg?"','Edwin draait zijn sleutels rond. Laatste kans.'][i],opties:kaart(i)}))}))||{m:{h:50,a:20},gekozen:[]};
  const ed=r.m.h>=r.m.a?'geld':'angst';F('edwin',ed);if(r.gekozen.includes('vader'))F('edwin_vader',1);
  await speel(t,[ed==='geld'?{anim:'edwin',a:'give',prop:'envelop'}:null,Z('edwin',ed==='geld'?'Eén keer. Eén.':'Ik doe het. Kom nooit meer bij mijn huis.'),
   Z('edwin','Dinsdag, drie uur tien. Rij C. Hij gaat niet langs de douane.'),Z('edwin','Elke dinsdag één. Drie weken. Daarna ben ik weg.'),
   Z('edwin','En Luca? Je vader is een goeie vent. Hij verdient dit niet.'),{fade:'out',t:.4}]);['edwin','luca','tarik'].forEach(k=>C.weg(k));
  // de onthulling bij de auto
  await speel(t,[{actor:'rafiq',at:[car.x+.5,car.z+.4],ry:PI/2,anim:'sit',sitY:-.5},{actor:'luca',at:[l.x,l.z],ry:PI},cam(car.x+4.0,2.4,car.z-1.6,car.x+1.0,1.9,car.z+1.2,{fov:46,strak:true}),{fade:'in',t:.4},
   Z('luca','Dinsdag. Drie uur tien. Niet langs de douane.'),Z('rafiq','Die container is niet van de boot. Die is van mij. Mijn eigen lijn.'),
   Z('rafiq','Ze denken dat deze hele haven van hen is. Dinsdag is één container van mij.'),cam(car.x+3.2,2.2,car.z+.9,car.x+.5,1.85,car.z+.4,{fov:40,strak:true}),
   T_('Luca legt zijn hand op het dak van de auto. Hij haalt hem weg.'),Z('rafiq','En jij hebt net de deur opengezet. Stap in.'),{snd:'carDoor'},{fade:'out',t:.5}]);
  C.weg('rafiq');C.weg('luca');auto.parent&&auto.parent.remove(auto);F('eigen_lijn',1)},
 async t=>{// langs de Containerkade: de vader achter het hek
  const c=PL.containers(),m=walk(c.x+6,c.z+8,8),v=walk(c.x+40,c.z+50,12);tijd(20,10);
  const auto=S1.auto('#121316');auto.position.set(v.x,0,v.z);auto.rotation.y=-PI/2;G.scene().add(auto);
  const r=await speel(t,[{speler:false},{actor:'marco',at:[m.x,m.z],ry:0,look:Object.assign({},C.look('marco')||{},{top:{kind:'jacket',c:'#e8742a',c2:'#f2e27a'},head:{kind:'helm',c:'#f2e27a'}})},
   {actor:'luca',at:[v.x,v.z-.6],ry:naar(v,m),anim:'sit',sitY:-.5},{actor:'rafiq',at:[v.x,v.z+.6],ry:naar(v,m),anim:'sit',sitY:-.5},
   cam(v.x-.4,1.5,v.z-1.4,m.x,1.4,m.z,{fov:30}),{fade:'in',t:.6},{move:'marco',to:[m.x+3,m.z+1],t:3,wacht:false},
   T_('Achter het hek, onder de lampen van de Containerkade, loopt zijn vader. Hand op zijn rug.'),{anim:'marco',a:'handenzij'},
   cam(v.x+Math.sin(naar(v,m))*4.2+Math.cos(naar(v,m))*1.6,2.3,v.z+Math.cos(naar(v,m))*4.2-Math.sin(naar(v,m))*1.6,v.x,1.85,v.z,{fov:44,strak:true}),Z('rafiq','Is dat je vader?'),
   keuze('luca','',[{t:'"Ja."',id:'ja'},{t:'"Nee."',id:'nee'}])]);
  F('vader_ontkend',r==='nee'?1:0);
  await speel(t,[r==='ja'?Z('rafiq','Dan weet je waarom je dit doet.'):T_('Rafiq kijkt hem aan en zegt niks.'),verteller('n22'),
   {anim:'rafiq',a:'give',prop:'envelop',naar:'luca'},T_('Bij de Boulevard zet Rafiq hem af. Een envelop: vijfduizend. Een gewone maandag.'),{fade:'out',t:.5}]);
  ['marco','luca','rafiq'].forEach(k=>C.weg(k));auto.parent&&auto.parent.remove(auto);geld(5000,'Rafiq · de haven');meter('vertrouwen',10);await zetBuitenSahara()},
 async t=>{// tweede rapportage: de streep onder Rafiq, de jongen in de rode jas
  await studio(t,1,['n23','n24'],[{snd:'click'},{wait:.4}]);await zetBuitenSahara();tijd(23,40);
  bericht('Sem','Dinsdag 03:00, hek bij rij C. Jij en ik. Als je durft.',{kleur:'#8ac0ff'});F('sq5_open',1);
  sein('Side quest: Uithalen (alleen dinsdagnacht 03:00, voor je verjaardag)','#8ac0ff')}]});
VOLG.s1_h11={tekst:'Verder: dinsdagochtend, je verjaardag (Hoofdstuk 11)',p:()=>PL.thuis(),sub:'Dinsdag · Zeventien',actie:'Naar binnen'};
}
if(S1.ST)reg();else S1.onStart.push(reg);
})();
