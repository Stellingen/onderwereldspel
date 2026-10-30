// Tab: Bajes. Een straf is nu ook een spel: werk in de bajes (wat geld, en goed gedrag haalt tijd van je straf),
// gebeurtenissen met een keuze (knokpartij, een bewaker met een deal, een tip van je celgenoot ...) en de bekende uitwegen
// (borg, ontsnappen). De vier klusjes zelf staan in jailjobs.js.
// Straflengte: jailSec (state.js) telt er 30–60 s bij op, zodat er tijd is om te werken: minimaal 1, maximaal 11 minuten.
// S.cel = {tot:{n,jobs,pay,cut}, c:{henk}, best:{was,keuken,werk,bieb}, live:{id,sent,cut,max,jobs,q,cur,res}}
// live bestaat alleen zolang je vastzit. Het HTML van de pagina verandert niet per seconde: klok, borg en wachttijden
// worden apart bijgewerkt (jjFill), zodat knoppen en het tafereel rustig blijven staan.
const CEL_CUT=.4;          // goed gedrag haalt maximaal 40% van de straf eraf
const CEL_HENK=.1;         // contact Henk de bewaker: 10% minder bij elke nieuwe straf
const CEL_MAX=660;         // langste straf (10 minuten + 1 minuut extra)
function celBase(){let c=S.cel;if(!c||typeof c!=='object')c=S.cel={};c.tot=c.tot||{n:0,jobs:0,pay:0,cut:0};c.c=c.c||{};c.best=c.best||{};return c}
function cel(){const c=celBase();
 // een straf die al liep voor deze versie (of op een ander apparaat begon): alsnog bijhouden
 if(inJail()&&!c.live){const left=Math.ceil((S.jailUntil-now())/1000);c.live=celLive(Math.max(left,S.lastSentence||left),left)}
 return c}
function celLive(sent,left){const L={id:now(),sent,cut:0,max:Math.round(sent*CEL_CUT),jobs:0,q:[],cur:null,res:null};
 const n=left>=300?2:left>=90?1:0,ids=JJ_EV.map(e=>e.id).sort(()=>Math.random()-.5);
 for(let i=0;i<n;i++){const f=n===2?(i?.58+Math.random()*.14:.18+Math.random()*.14):.25+Math.random()*.2;L.q.push({id:ids[i],at:now()+left*1000*f})}
 return L}
// nieuwe straf (aangeroepen vanuit sendToJail)
function celNew(sec){const c=celBase();c.tot.n++;let henk=0;
 if(c.c.henk){henk=Math.round(sec*CEL_HENK);S.jailUntil-=henk*1000}
 c.live=celLive(sec,sec-henk);
 if(henk){c.live.henk=henk;log('Henk de bewaker regelt '+fmtTime(henk)+' minder straf','ok');setTimeout(()=>toast('Henk de bewaker regelt het: '+fmtTime(henk)+' minder','lvl'),500)}}
// gedrag: telt mee voor het maximum (40% van de straf)
function celGood(sec){const L=cel().live;if(!L||!inJail())return 0;const s=Math.max(0,Math.min(sec,L.max-L.cut,Math.ceil((S.jailUntil-now())/1000)));
 if(s){S.jailUntil-=s*1000;L.cut+=s;S.cel.tot.cut+=s}return s}
// een deel van de resterende straf vervalt (deal, advocaat): los van het gedragsmaximum
function celCutFrac(f){const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000)),s=Math.round(left*f);if(s){S.jailUntil-=s*1000;celBase().tot.cut+=s}return s}
function celAdd(sec){const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000)),nl=Math.max(left,Math.min(CEL_MAX,left+sec));S.jailUntil=now()+nl*1000;S.lastSentence=Math.max(S.lastSentence||0,nl);
 const L=S.cel&&S.cel.live;if(L)L.sent=Math.max(L.sent,nl);return nl-left}
// betalen zoals de borg: eerst contant, daarna de bank
const celCan=c=>S.cash+S.bank>=c;
function celPay(c){if(!celCan(c))return false;const a=Math.min(S.cash,c);S.cash-=a;S.bank-=c-a;return true}
const celCred=n=>{S.cred=Math.max(0,S.cred+n)};

// Gebeurtenissen: één of twee per straf (vanaf 1,5 minuut). v = waarden die vastliggen zodra het gebeurt.
const JJ_EV=[
 {id:'vecht',where:'Luchtplaats',h:'Een vent van blok C duwt je tegen het hek',p:()=>'Iedereen kijkt. Doe je nu niks, dan weet de hele vleugel het morgen.',
  v:()=>({win:Math.max(.2,Math.min(.8,.35+sk('conditie')*.008+sk('schiet')*.004+(S.hp-50)/250))}),
  ch:[{l:'Terugslaan',s:v=>Math.round(v.win*100)+'% kans · cred, of gewond',c:'red',f:v=>{
     if(Math.random()<v.win){celCred(3);addXp(10);if(Math.random()<.35){const a=celAdd(30);return {t:`Je wint. Maar een bewaker zag het: +3 cred en ${fmtTime(a)} in de isoleer.`,c:'mix'}}return {t:'Je wint. Niemand op blok C duwt je nog. +3 cred.',c:'ok'}}
     const h=rnd(10,20);S.hp=Math.max(5,S.hp-h);const a=celAdd(30);return {t:`Hij was sterker. −${h}% gezondheid en ${fmtTime(a)} in de isoleer.`,c:'bad'}}},
   {l:'Weglopen',s:()=>'goed gedrag · −10s',f:()=>{const s=celGood(10);return {t:s?`Je loopt weg. De bewakers noteren goed gedrag: −${s}s.`:'Je loopt weg. Je gedrag staat al op het maximum.',c:'ok'}}},
   {l:'Bewaker roepen',s:()=>'−15s · −2 cred',f:()=>{const s=celGood(15);celCred(-2);return {t:`De bewaker grijpt in${s?`, −${s}s`:''}. Blok C noemt je nu een verklikker (−2 cred).`,c:'mix'}}}]},
 {id:'deal',where:'Gang van blok C',h:'Een bewaker wil een deal',p:v=>`"Voor ${fmt(v.cost)} staat de deur van de wasserij vannacht open. Of je neemt een pakketje voor me mee naar buiten."`,
  v:()=>({cost:Math.max(100,Math.round(bailCost()*.3/10)*10),smug:Math.round(jjBase()*3/5)*5,ok:celBase().c.henk?.9:.75}),
  ch:[{l:'Betalen',s:v=>fmt(v.cost)+' · '+Math.round(v.ok*100)+'% kans · helft eraf',c:'gold',cost:v=>v.cost,f:v=>{if(!celPay(v.cost))return {t:'Je hebt het geld niet.',c:'bad'};
     if(Math.random()<v.ok){const s=celCutFrac(.5),c=celBase();let t=`De deur staat open. ${fmtTime(s)} van je straf is weg.`;if(!c.c.henk){c.c.henk=1;t+=' Henk de bewaker is nu je contact: bij elke nieuwe straf 10% minder.'}return {t,c:'ok'}}
     const a=celAdd(30);return {t:`Het was een val. Je geld is weg en je krijgt ${fmtTime(a)} extra.`,c:'bad'}}},
   {l:'Pakketje meenemen',s:v=>'+'+fmt(v.smug)+' · 30% kans gepakt',f:v=>{if(Math.random()<.7){S.cash+=v.smug;return {t:`Het pakketje komt aan. De bewaker betaalt ${fmt(v.smug)}.`,c:'ok'}}
     const a=celAdd(45);return {t:`Gepakt bij de poort. De bewaker kent je ineens niet meer: +${fmtTime(a)}.`,c:'bad'}}},
   {l:'Nee bedankt',s:()=>'netjes · −5s',f:()=>{const s=celGood(5);return {t:s?`Je zegt nee. Dat valt op, op een goede manier: −${s}s.`:'Je zegt nee. De bewaker loopt door.',c:'ok'}}}]},
 {id:'tip',where:'Je cel',h:'Je celgenoot weet iets',p:()=>'"Mijn neef rijdt voor een geldtransport. Als je eruit bent, weet ik wanneer de bus stopt."',
  v:()=>({cost:jjBase()}),
  ch:[{l:'Luisteren',s:v=>fmt(v.cost)+' aan sigaretten · +10% buit',c:'gold',cost:v=>v.cost,f:v=>{if(!celPay(v.cost))return {t:'Je hebt niks om te ruilen.',c:'bad'};celTip(10);return {t:'Hij vertelt alles. Na je straf heb je 15 minuten +10% buit.',c:'ok'}}},
   {l:'Doorvragen',s:()=>'gratis · 50% kans',f:()=>{if(Math.random()<.5){celTip(15);return {t:'Hij vertrouwt je. Na je straf heb je 15 minuten +15% buit.',c:'ok'}}
     const a=celAdd(30);return {t:`Hij wil iets terug en verstopt zijn spullen onder jouw bed. De bewakers vinden ze: +${fmtTime(a)}.`,c:'bad'}}},
   {l:'Niet je zaak',s:()=>'niks',f:()=>({t:'Je draait je om en slaapt verder.',c:''})}]},
 {id:'inspectie',where:'Celinspectie',h:'Er ligt een telefoon onder jouw matras',p:()=>'Niet van jou. De bewakers staan al bij de deur.',
  v:()=>({talk:Math.min(.85,.3+sk('charisma')*.012),run:Math.min(.85,.35+sk('speed')*.01),cost:Math.max(50,Math.round(bailCost()*.12/10)*10)}),
  ch:[{l:'Het is niet van mij',s:v=>Math.round(v.talk*100)+'% · Charisma',f:v=>{if(Math.random()<v.talk){celCred(1);return {t:'Ze geloven je. De telefoon gaat mee naar je buurman. +1 cred.',c:'ok'}}const a=celAdd(45);return {t:`Ze geloven je niet: +${fmtTime(a)}.`,c:'bad'}}},
   {l:'Snel weggooien',s:v=>Math.round(v.run*100)+'% · Snelheid',f:v=>{if(Math.random()<v.run)return {t:'Weg door het luik. Niemand heeft iets gezien.',c:'ok'};const a=celAdd(60);return {t:`Ze zien het vallen: +${fmtTime(a)}.`,c:'bad'}}},
   {l:'Omkopen',s:v=>fmt(v.cost),c:'gold',cost:v=>v.cost,f:v=>{if(!celPay(v.cost))return {t:'Je hebt het geld niet.',c:'bad'};return {t:'De bewaker stopt het geld weg en loopt door.',c:'ok'}}}]},
 {id:'advocaat',where:'Bezoekuur',h:'Je advocaat ziet een fout in het dossier',p:v=>`"Een vormfout. Voor ${fmt(v.cost)} dien ik vandaag nog een verzoek in."`,
  v:()=>({cost:Math.max(80,Math.round(bailCost()*.2/10)*10),ch:Math.min(.8,.55+sk('rechten')*.006)}),
  ch:[{l:'Verzoek indienen',s:v=>fmt(v.cost)+' · '+Math.round(v.ch*100)+'% kans · −35%',c:'gold',cost:v=>v.cost,f:v=>{if(!celPay(v.cost))return {t:'Je hebt het geld niet.',c:'bad'};
     if(Math.random()<v.ch){const s=celCutFrac(.35);return {t:`Vormfout erkend. ${fmtTime(s)} van je straf vervalt.`,c:'ok'}}return {t:'De rechter wijst het af. Je advocaat heeft je geld wel.',c:'bad'}}},
   {l:'Laat maar',s:()=>'niks',f:()=>({t:'Je advocaat haalt zijn schouders op en pakt zijn tas.',c:''})}]}];
// tip van je celgenoot: buit-bonus die pas na je straf echt telt
function celTip(pct){const until=Math.max(S.jailUntil,now())+15*60000,b=S.buffs.loot;
 if(b&&b.until>now()&&b.pct>pct)b.until=Math.max(b.until,until);else S.buffs.loot={until,pct}}
function celChoose(i){const L=cel().live;if(!L||!L.cur||!inJail()||window.__chase)return;const E=JJ_EV.find(e=>e.id===L.cur.id),ch=E&&E.ch[i];if(!ch)return;
 const v=L.cur.v||{};if(ch.cost&&!celCan(ch.cost(v))){toast('Te weinig geld','bad');return}
 L.cur=null;const r=ch.f(v)||{t:'',c:''};L.res={where:E.where,h:E.h,t:r.t,c:r.c,until:now()+10000};
 log(E.where+': '+r.t,r.c==='bad'?'bad':r.c==='ok'?'ok':'info');try{r.c==='bad'?SFX.lose():SFX.click()}catch(e){}
 save();pushState();render()}

// elke 250 ms: gebeurtenissen klaarzetten of laten verlopen, vrijlating opruimen
function celStep(){if(typeof S==='undefined'||!S)return;
 if(!inJail()){if(S.cel&&S.cel.live){S.cel.live=null;save()}return}
 const L=cel().live;let ch=false;
 if(L.cur&&L.cur.exp<now()){const E=JJ_EV.find(e=>e.id===L.cur.id)||{where:'Bajes'};L.res={where:E.where,h:E.h,t:'Je liet het gaan. Het moment is voorbij.',c:'',until:now()+6000};L.cur=null;ch=true}
 if(!L.cur&&L.q.length&&L.q[0].at<=now()&&!window.__chase){const q=L.q.shift(),E=JJ_EV.find(e=>e.id===q.id);
  if(E){L.cur={id:E.id,exp:now()+60000,v:E.v?E.v():{}};ch=true;try{SFX.pop()}catch(e){}if(page!=='jail')toast(E.where+': er gebeurt iets. Kijk in de bajes.','lvl')}}
 if(L.res&&L.res.until<now()){L.res=null;ch=true}
 if(ch){save();if(page==='jail'&&!window.__chase&&!userBusy())render()}}

// klok, balk, borg en wachttijden bijwerken zonder de pagina opnieuw te tekenen
function jjFill(){const v=document.getElementById('view');if(!v||page!=='jail'||typeof S==='undefined'||!S)return;
 const left=Math.max(0,S.jailUntil-now()),L=S.cel&&S.cel.live;
 v.querySelectorAll('[data-jj]').forEach(e=>{const k=e.dataset.jj;let t=null;
  if(k==='left')t=fmtClock(left);
  else if(k==='bar'){const tot=Math.max(1,(L&&L.sent)||S.lastSentence||1),w=(Math.min(100,Math.max(0,100-left/1000/tot*100))).toFixed(1)+'%';if(e.style.width!==w)e.style.width=w;return}
  else if(k==='out')t=left>0?'vrij om '+new Date(S.jailUntil).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'}):'vrij';
  else if(k==='bail')t=fmt(bailCost());
  else if(k.startsWith('cd:'))t=fmtClock(cdLeft('jj_'+k.slice(3)));
  else if(k==='evexp')t=L&&L.cur?fmtClock(L.cur.exp-now()):'';
  if(t!=null&&e.textContent!==t)e.textContent=t})}
setInterval(()=>{try{celStep();jjFill()}catch(e){}},250);

// Tafereel: een cel achter tralies. Vast: maanlicht door het raampje, streepjes op de muur (één per straf).
// Vrij: de schuifdeur staat open en de cel is leeg.
function celScene(jail,c){const n=Math.min(30,c.tot.n),marks=[];
 for(let i=0;i<n;i++){const g=Math.floor(i/5),k=i%5,x0=318+g*30;marks.push(k<4?`<path d="M${x0+k*5} 132v26"/>`:`<path d="M${x0-3} 155l22-20"/>`)}
 const bars=[];for(let i=0;i<15;i++){const x=6+i*46,door=i>=5&&i<=8;bars.push(`<rect class="${door?'jl-door':''}" x="${x}" y="0" width="9" height="360" fill="url(#jlBar)"/>`)}
 return `<div class="jl-scene ${jail?'in':'out'}"><svg viewBox="0 0 640 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><linearGradient id="jlWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15181d"/><stop offset="1" stop-color="#0b0d10"/></linearGradient>
   <linearGradient id="jlBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9dcff" stop-opacity=".2"/><stop offset="1" stop-color="#a9dcff" stop-opacity="0"/></linearGradient>
   <linearGradient id="jlBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050607"/><stop offset=".42" stop-color="#3b414a"/><stop offset=".62" stop-color="#1f2329"/><stop offset="1" stop-color="#050607"/></linearGradient>
   <linearGradient id="jlGlow" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a" stop-opacity=".16"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></linearGradient>
   <pattern id="jlBrick" width="56" height="28" patternUnits="userSpaceOnUse"><path d="M0 .5H56M0 14.5H56M.5 0V14M28.5 14V28" stroke="#1b1f25" fill="none"/></pattern></defs>
  <rect width="640" height="360" fill="url(#jlWall)"/><rect width="640" height="286" fill="url(#jlBrick)"/>
  <rect y="286" width="640" height="74" fill="#0d0f13"/><path d="M0 286.5H640" stroke="#262a31"/>
  <g class="jl-win"><rect x="436" y="46" width="92" height="58" fill="${jail?'#122030':'#1c2a35'}"/><circle cx="508" cy="64" r="7" fill="#a9dcff" opacity="${jail?'.55':'.15'}"/>
   <path d="M459 46v58M482 46v58M505 46v58" stroke="#2f353e" stroke-width="4"/><rect x="436" y="46" width="92" height="58" fill="none" stroke="#2b3038" stroke-width="5"/></g>
  <polygon class="jl-beam" points="436,104 528,104 404,286 236,286" fill="url(#jlBeam)"/>
  <g class="jl-dust" fill="#a9dcff"><circle cx="420" cy="170" r="1.4"/><circle cx="380" cy="214" r="1"/><circle cx="452" cy="138" r="1.2"/><circle cx="336" cy="250" r="1"/><circle cx="400" cy="244" r="1.3"/></g>
  <g class="jl-bunk"><rect x="58" y="112" width="8" height="178" fill="#2b3038"/><rect x="250" y="112" width="8" height="178" fill="#2b3038"/>
   <rect x="58" y="150" width="200" height="8" fill="#2b3038"/><rect x="64" y="136" width="188" height="14" fill="#1a1e24"/><rect x="66" y="138" width="44" height="10" fill="#242932"/>
   <rect x="58" y="246" width="200" height="8" fill="#2b3038"/><rect x="64" y="228" width="188" height="18" fill="#1d2128"/>
   <rect x="72" y="231" width="46" height="12" fill="#2a2f37"/><path d="M130 229h118v16H130z" fill="${jail?'#3a2a20':'#262a31'}"/><path d="M130 236h118" stroke="#00000055"/>
   <rect x="168" y="270" width="22" height="9" fill="#1d2128"/><rect x="196" y="272" width="22" height="8" fill="#1d2128"/></g>
  <g class="jl-marks" stroke="#4a505a" stroke-width="2" stroke-linecap="round">${marks.join('')}</g>
  <text x="318" y="112" fill="#30353e" font-family="JetBrains Mono,monospace" font-size="13" letter-spacing="2">C-214</text>
  <g class="jl-wc"><rect x="548" y="196" width="46" height="10" fill="#2b3038"/><path d="M552 206h38l-6 34h-26z" fill="#22262c"/><rect x="562" y="240" width="18" height="46" fill="#1f2328"/>
   <rect x="556" y="132" width="34" height="22" fill="#1f2328"/><path d="M573 132v-10h10" stroke="#3a4049" stroke-width="3" fill="none"/></g>
  <rect y="286" width="640" height="74" fill="url(#jlGlow)" class="jl-corridor"/>
  <g class="jl-bars">${bars.join('')}<rect x="0" y="22" width="640" height="10" fill="#1a1d22"/><path d="M0 22.5H640" stroke="#3b414a"/><rect x="0" y="326" width="640" height="10" fill="#1a1d22"/><path d="M0 326.5H640" stroke="#3b414a"/></g>
 </svg><div class="jl-tag"><span>Blok C · cel 214</span>${n?`<span>${n} streep${n===1?'je':'jes'} op de muur</span>`:''}</div></div>`}

function celRecHtml(c){const T=c.tot;
 return `<div class="jl-rec"><div><span class="label">Straffen</span><b>${T.n}</b></div><div><span class="label">Klusjes</span><b>${T.jobs}</b></div>
  <div><span class="label">Verdiend</span><b>${fmt(T.pay)}</b></div><div><span class="label">Eerder vrij</span><b>${fmtTime(T.cut)}</b></div>
  <div class="${c.c.henk?'on':''}"><span class="label">Contact</span><b>${c.c.henk?'Henk de bewaker':'Geen'}</b><small>${c.c.henk?'−10% bij elke straf':'een deal met een bewaker'}</small></div></div>`}

function celEvHtml(L){
 if(L.cur){const E=JJ_EV.find(e=>e.id===L.cur.id);if(!E)return '';const v=L.cur.v||{};
  return `<section class="jl-ev" aria-live="polite"><div class="jl-ev-t"><span class="label">${E.where} · kies binnen <span data-jj="evexp"></span></span><h3>${E.h}</h3><p>${E.p(v)}</p></div>
   <div class="jl-ev-ch">${E.ch.map((ch,i)=>{const no=ch.cost&&!celCan(ch.cost(v));return `<button class="jl-ch ${ch.c||''}" onclick="celChoose(${i})" ${no?'disabled':''}><b>${ch.l}</b><small>${no?'te weinig geld':ch.s(v)}</small></button>`}).join('')}</div></section>`}
 if(L.res)return `<section class="jl-ev res ${L.res.c||''}" aria-live="polite"><div class="jl-ev-t"><span class="label">${L.res.where}${L.res.h?' · '+L.res.h:''}</span><p>${L.res.t}</p></div></section>`;
 return ''}

const CEL_LV=[['Nieuw','var(--faint)'],['Rustig','var(--ice)'],['Netjes','var(--ice)'],['Voorbeeldig','var(--green)']];
V.jail=()=>{const c=cel(),jail=inJail();queueMicrotask(jjFill);
 const head=`<h1>Bajes</h1><p class="sub">${jail?'Zit je tijd uit, werk mee voor wat geld en eerder ontslag, of koop je eruit. Ontsnappen kan ook, maar dan word je gezocht.':'Straffen duren 1 tot 11 minuten. Binnen kun je werken voor wat geld, en goed gedrag haalt tijd van je straf.'}</p>`;
 if(!jail){const W=S.wanted;
  return head+`<section class="jl-hero">${celScene(false,c)}<div class="jl-info">
   ${W?`<div class="jl-st wanted"><span class="label">Status</span><h3>Op de vlucht</h3><p>Je bent niet officieel vrij. Elke klus kan een politiecontrole opleveren, en word je gepakt, dan krijg je je oude straf plus 2 minuten. Onderduiken in je woning helpt.</p></div>`
    :`<div class="jl-st"><span class="label">Status</span><h3>Vrij</h3><p>De celdeur staat open. Hou het zo.</p></div>`}
   <ul class="jl-how"><li><b>Straf</b><span>1 tot 11 minuten. Je familie, Rechtenkennis en bescherming maken hem korter.</span></li>
    <li><b>Werk</b><span>Wasserij, keuken, werkplaats en bibliotheek. Kort klusje, klein loon.</span></li>
    <li><b>Gedrag</b><span>Goed werk haalt tijd van je straf, tot 40% eraf.</span></li>
    <li><b>Binnen</b><span>Een knokpartij, een bewaker met een deal, een tip van je celgenoot. Elke keuze heeft een prijs.</span></li>
    <li><b>Eruit</b><span>Borg betalen of ontsnappen. Ontsnap je, dan sta je op de gezochtlijst.</span></li></ul></div></section>${celRecHtml(c)}`}
 const L=c.live,canPay=S.cash+S.bank>=bailCost(),pct=L.max?L.cut/L.max:0,lv=pct>=.67?3:pct>=.34?2:pct>0?1:0,seg=Math.round(pct*10);
 return head+`${celEvHtml(L)}<section class="jl-hero">${celScene(true,c)}<div class="jl-info">
   <div class="jl-left"><span class="label">Resterende straf</span><b class="jl-clock" data-jj="left"></b><div class="jl-bar"><i data-jj="bar"></i></div>
    <small><span data-jj="out"></span> · straf ${fmtTime(L.sent)}${L.henk?' · Henk: −'+fmtTime(L.henk):''}</small></div>
   <div class="jl-ged"><div class="jl-row"><span class="label">Gedrag</span><b style="color:${CEL_LV[lv][1]}">${CEL_LV[lv][0]}</b></div>
    <div class="jl-meter" aria-hidden="true">${Array.from({length:10},(_,i)=>`<i class="${i<seg?'on':''}"></i>`).join('')}</div>
    <small>${L.cut?'−'+fmtTime(L.cut)+' verdiend':'Nog niks verdiend'} · max −${fmtTime(L.max)}</small></div>
   <div class="jl-exit"><div class="jl-row"><span>Borg <small>contant, daarna bank</small></span><b data-jj="bail"></b></div>
    <div class="jl-btns"><button class="btn gold" onclick="act.bail()" ${canPay?'':'disabled'}>${canPay?'Borg betalen':'Te weinig geld'}</button>
     <button class="btn red" onclick="act.escape()">Ontsnappen · ${Math.round(escChance()*100)}%</button></div>
    <p class="jl-note">Mislukt: +30s straf. Gelukt: je staat op de gezochtlijst tot de politie je vindt.</p></div></div></section>
  ${typeof jjJobsHtml==='function'?jjJobsHtml(L):''}${celRecHtml(c)}`};
