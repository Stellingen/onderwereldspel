// Gevolg per soort misdaad en het arrestatieverloop.
//
// A. WAT ER GEBEURT ALS EEN KLUS MISLUKT (per soort, CR_CATS):
//  - Straatwerk, klasse A (c.sev 'A': bedelen, statiegeld): boete of weggestuurd, geen cel (crimeFailMinor in actions.js).
//  - Straatwerk (rest) en Inbraak en kraken: betrapt, vluchten of het arrestatieverloop (B).
//  - Overvallen: cel ×1,75 (binnen het plafond van jailSec) en de helft van de keren een signalement als je ontkomt.
//  - Oplichting: geen arrestatie maar een aangifte. Er loopt dan een zaak (S.zaak); na 1 speldag doet de politierechter
//    uitspraak: boete of cel. Ga je intussen niet opnieuw de fout in, dan valt de straf 40% lager uit. Nieuwe aangiftes
//    voor die tijd worden bij dezelfde zaak gevoegd.
//  - Smokkel en handel: de partij is weg (boete van de helft van de gemiddelde buit) en een locatieverbod: de klussen op
//    die plek (haven, grens, wijk, jachthaven) zijn 1 speldag dicht (S.ban).
//  - Witteboord en invloed: geen cel, wel het FIOD-dossier (S.fiod, 0-100): +30 bij mislukken (een meester +15), +2 als
//    het lukt, zakt 0,5 per minuut. Vol = inval: beslag op een deel van je geld en het arrestatieverloop.
// B. HET ARRESTATIEVERLOOP (voor klussen die op een arrestatie uitlopen: straatwerk, inbraak, overvallen en de inval):
//    na "Betrapt!" en een mislukte of geweigerde vlucht: politiecel + advocaat → verhoor → beslissing van de officier van
//    justitie (sepot, strafbeschikking of voorgeleiding) → afdoening. De bewijsmeter begint per soort en zakt met je
//    professionaliteit. Alles blijft binnen de straf van nu (full = jailSec van de gewone straf); de wachttijd bij de
//    piketadvocaat telt als voorarrest. Elke keuze staat meteen in S.pendingArrest.flow; verversen = de volle straf
//    (tijdens de taakstraf: de vervangende hechtenis). "Laat de advocaat het regelen" handelt alles af met de gemiddelde
//    uitkomst (piket, zwijgen, verwachte straf).

const AR_GW=1.75,AR_GW_WANT=.5;
const AR_SM_FINE=.5,AR_BAN_MS=DAY_MS;
const AR_PLACE={smokkel:'haven',container:'haven',rotterdam:'haven',wapenlading:'grens',gokhal:'wijk',stroom:'wijk',jacht:'jachthaven'};
const AR_PLACES={haven:['de haven','Havens en terminals'],grens:['de grens','Grensovergangen en snelwegen'],wijk:['de wijk','Je eigen buurt'],jachthaven:['de jachthaven','Jachthavens en werven']};
const AR_FIOD_FAIL=30,AR_FIOD_PRO=15,AR_FIOD_OK=2,AR_FIOD_DECAY=.5,AR_FIOD_AFTER=20;
const AR_ZAAK_MS=DAY_MS,AR_ZAAK_FINE=.6,AR_ZAAK_CLEAN=.6,AR_ZAAK_MAX=8;
const AR_B0={straat:55,kraak:62,geweld:72,invloed:60},AR_PRO=30;
const AR_ADV={piket:-6,pleiter:-15,zelf:12},AR_VK=[-20,15],AR_BEK=.8,AR_SB=.5;

const arCatOf=pa=>(pa&&pa.opts&&pa.opts.cat)||'straat';
const arC=id=>CRIMES.find(x=>x.id===id);
const arDur=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'u '+String(m).padStart(2,'0')+'m':m+'m '+String(s%60).padStart(2,'0')+'s'};
const arNr=()=>'PV-'+String(now()).slice(-6);
const arAvg=c=>(c.min+c.max)/2*(typeof lootMult==='function'?lootMult():1);
const arR10=v=>Math.max(50,Math.round(v/10)*10);

// ---------- geld: eerst contant, dan de bank ----------
function arPay(x,why){x=Math.max(0,Math.round(x));const a=Math.min(x,Math.floor(S.cash)+Math.max(0,Math.floor(S.bank||0)));const c=Math.min(Math.floor(S.cash),a);S.cash-=c;
 if(a-c>0){S.bank-=a-c;if(typeof bkTx==='function')bkTx('pay',-(a-c),why||'Boete')}return a}
const arCanPay=x=>Math.floor(S.cash)+Math.max(0,Math.floor(S.bank||0))>=x;

// ---------- cel (zonder opnieuw jailSec: de tijd is al uitgerekend) ----------
function arJail(sec,why,seize){sec=Math.max(15,Math.round(sec));if(seize&&typeof seizeZwart==='function')seizeZwart(why);
 S.lastSentence=sec;S.jailUntil=now()+sec*1000;if(!S.jailIn)S.jailIn={t:now(),en:S.energy};if(typeof celNew==='function')celNew(sec);
 log(why+'. '+fmtTime(sec)+' de bajes in','bad');return sec}
function arToJail(){page='jail';try{history.replaceState(null,'','#jail')}catch(e){}render();toast('Vast: '+fmtTime(Math.ceil((S.jailUntil-now())/1000)),'bad')}

// =====================================================================================================================
// A. Gevolg per soort
// =====================================================================================================================
// heterdaad-klussen (straatwerk, inbraak, overvallen): straf en opties voor arrest()
function arHeist(c){const k=crCat(c),gw=k==='geweld',sec=Math.round(c.jail*(gw?AR_GW:1));
 const o={flow:true,id:c.id,P:typeof crP==='function'?crP(c):0};
 if(gw&&Math.random()<AR_GW_WANT)o.wanted={lv:1,t:'je overval',sec,why:'na een mislukte overval'};
 return {sec,o}}
function arFailBase(c,heat){S.stats.fails++;crxN(crCat(c));crxAdd(c,0);addXp(Math.ceil(c.xp/4));addHeat(heat)}
// fraude, smokkel en witteboord: geen arrestatie. true = afgehandeld
function arFail(c,pre){const k=crCat(c);pre=pre||'';
 if(k==='fraude'){arAangifte(c,pre);return true}
 if(k==='smokkel'){arSmokkel(c,pre);return true}
 if(k==='invloed'){arFiodFail(c,pre);return true}
 return false}
// gelukt: witteboord laat ook dan een klein spoor na
function arOk(c){if(crCat(c)==='invloed'){fiodAdd(AR_FIOD_OK);if(fiodNow()>=100){S.invalDue=c.id}}}

// ----- Oplichting: aangifte en een lopende zaak -----
function arZaakFeit(c){return {id:c.id,n:c.n,j:c.jail,b:arR10(arAvg(c)*AR_ZAAK_FINE)}}
function arAangifte(c,pre){arFailBase(c,3);const nw=!S.zaak;
 if(nw)S.zaak={nr:arNr(),t:now(),due:now()+AR_ZAAK_MS,f:[]};const Z=S.zaak;
 if(Z.f.length<AR_ZAAK_MAX)Z.f.push(arZaakFeit(c));Z.f0=S.stats.fails;S.stats.aangifte=(S.stats.aangifte||0)+1;
 log(`${c.n} mislukt: aangifte (${Z.nr}), zitting over ${arDur(Z.due-now())}`,'bad');save();pushState();render();
 showModal('Aangifte',`${pre}${c.n} ging mis. Je bent weggekomen, maar er is aangifte gedaan. ${nw?'De officier van justitie stuurt je een dagvaarding':'Het feit wordt gevoegd bij je lopende zaak'} (${Z.nr}): de politierechter doet over ${arDur(Z.due-now())} uitspraak. Ga je tot dan niet opnieuw de fout in, dan valt de straf lager uit.`,[{l:'Begrepen',c:'red',f:closeModal}])}
function arZaakEst(){const Z=S.zaak;if(!Z)return null;const clean=S.stats.fails<=(Z.f0||0),k=clean?AR_ZAAK_CLEAN:1,n=Z.f.length;
 const j=Z.f.reduce((a,f)=>a+f.j,0),b=Z.f.reduce((a,f)=>a+f.b,0);
 return {n,clean,k,pCel:Math.min(.8,(clean?.15:.4)+.12*(n-1)),cel:jailSec(j*k),boete:arR10(b*k),vh:jailSec(j*k*.5)}}
function arUitspraak(){const Z=S.zaak,E=arZaakEst();if(!Z||!E)return;S.zaak=null;const cel=Math.random()<E.pCel;let h,p,sec=0,paid=0;
 if(cel){sec=arJail(E.cel,'Uitspraak '+Z.nr+': gevangenisstraf',true);h='Gevangenisstraf';p=`De politierechter veroordeelt je tot ${fmtTime(sec)} cel. Je meldt je meteen bij de gevangenis.`}
 else if(arCanPay(E.boete)){paid=arPay(E.boete,'Boete '+Z.nr);h='Geldboete';p=`De politierechter veroordeelt je tot een boete van ${fmt(paid)}. Het CJIB heeft het bedrag al geïnd.`;log(`Uitspraak ${Z.nr}: boete van ${fmt(paid)}`,'bad')}
 else{sec=arJail(E.vh,'Uitspraak '+Z.nr+': boete niet betaald, vervangende hechtenis',false);h='Vervangende hechtenis';p=`De politierechter legt een boete op van ${fmt(E.boete)}. Die kun je niet betalen, dus zit je ${fmtTime(sec)} vervangende hechtenis uit.`}
 S.stats.zittingen=(S.stats.zittingen||0)+1;save();pushState();
 arOverlay(`<div class="ar-box ${sec?'bad':'mid'}">${arTop('Zitting · '+Z.nr,null)}<div class="ar-body">
  <div class="ar-hd">${arIc('gavel')}<div><span class="label">Uitspraak van de politierechter</span><h2 id="arT">${h}</h2></div></div>
  <p>${p}</p><dl class="ar-dl"><div><dt>Feiten</dt><dd>${E.n} × oplichting</dd></div><div><dt>Sinds de aangifte</dt><dd class="${E.clean?'ok':'bad'}">${E.clean?'schoon gebleven (−40%)':'opnieuw de fout in'}</dd></div><div><dt>Kans op cel was</dt><dd>${Math.round(E.pCel*100)}%</dd></div></dl>
  <div class="ar-acts"><button class="btn${sec?' red':''}" data-a="ok">${sec?'Naar je cel':'Begrepen'}</button></div></div></div>`,{ok:()=>{arClose();if(sec)arToJail();else render()}})}

// ----- Smokkel: partij kwijt en een locatieverbod -----
const arPlace=c=>AR_PLACE[c.id]||'haven';
const arBans=()=>{const B=S.ban&&typeof S.ban==='object'?S.ban:{};Object.keys(B).forEach(k=>{if(!(B[k]>now()))delete B[k]});return B};
function arBanLeft(c){if(crCat(c)!=='smokkel'||!S.ban)return 0;const u=S.ban[arPlace(c)];return u>now()?u-now():0}
const arBanMsg=c=>`Locatieverbod voor ${AR_PLACES[arPlace(c)][0]}: nog ${arDur(arBanLeft(c))}.`;
const arSmFine=c=>arR10(arAvg(c)*AR_SM_FINE);
function arSmokkel(c,pre){arFailBase(c,rnd(5,10));const pl=arPlace(c),P=AR_PLACES[pl],f=arSmFine(c),paid=arPay(f,'Boete '+c.n);
 if(!S.ban||typeof S.ban!=='object')S.ban={};S.ban[pl]=Math.max(S.ban[pl]||0,now()+AR_BAN_MS);S.stats.verbod=(S.stats.verbod||0)+1;
 const shut=CRIMES.filter(x=>crCat(x)==='smokkel'&&arPlace(x)===pl&&x.r<=rankIdx(S.xp)).map(x=>x.n);
 log(`${c.n} mislukt: partij in beslag, boete ${fmt(paid)}, locatieverbod ${P[0]}`,'bad');save();pushState();render();
 showModal('Partij onderschept',`${pre}${c.n} ging mis. De partij is in beslag genomen en je krijgt een boete van ${fmt(paid)}${paid<f?' (meer had je niet)':''}. Daarbij een locatieverbod: ${P[0]} is ${arDur(AR_BAN_MS)} verboden terrein${shut.length?' ('+shut.join(', ')+')':''}.`,[{l:'Begrepen',c:'red',f:closeModal}])}

// ----- Witteboord: het FIOD-dossier -----
const fiodNow=()=>{const v=+S.fiod||0;if(!v)return 0;return Math.max(0,v-(now()-(S.fiodAt||now()))/60000*AR_FIOD_DECAY)};
function fiodAdd(x){S.fiod=Math.min(100,fiodNow()+x);S.fiodAt=now()}
const arFiodGain=c=>Math.round(AR_FIOD_FAIL-AR_FIOD_PRO*(typeof crP==='function'?crP(c):0));
function arFiodFail(c,pre){arFailBase(c,2);const g=arFiodGain(c);fiodAdd(g);const v=fiodNow();S.stats.fiod=(S.stats.fiod||0)+1;
 log(`${c.n} mislukt: FIOD-dossier +${g} (${Math.floor(v)}/100)`,'bad');save();pushState();render();
 if(v>=100){arInval(c);return}
 showModal('Sporen op papier',`${pre}${c.n} ging mis. Niemand houdt je aan, maar er gaan stukken naar de FIOD: je dossier staat op ${Math.floor(v)} van de 100. Het zakt vanzelf (${String(AR_FIOD_DECAY).replace('.',',')} per minuut). Is het vol, dan volgt een inval.`,[{l:'Begrepen',c:'red',f:closeModal}])}
function arInval(c){if(!c)return;if(inJail()||S.pendingArrest||document.getElementById('arOv')){S.invalDue=c.id;save();return}delete S.invalDue;
 const z=zwart(),w=Math.max(0,S.cash-z),cap=c.max*3,zs=Math.min(Math.floor(z*.5),cap),ws=Math.min(Math.floor(w*.1),Math.max(0,cap-zs));
 if(zs>0){S.cash-=zs;S.zwart=Math.max(0,z-zs)}if(ws>0)spendWit(ws);
 S.fiod=AR_FIOD_AFTER;S.fiodAt=now();S.stats.inval=(S.stats.inval||0)+1;
 log(`Inval van de FIOD: beslag op ${fmt(zs+ws)}`,'bad');save();pushState();closeModal();
 arrest(c.jail,'Inval!',`Om zes uur 's ochtends staat de FIOD met een doorzoekingsbevel aan je deur. Je dossier is vol. Er wordt beslag gelegd op ${fmt(zs+ws)}${zs?' ('+fmt(zs)+' zwart'+(ws?', '+fmt(ws)+' wit':'')+')':ws?' wit':''}.`,
  {flee:3,mult:0,cat:'invloed',flow:true,id:c.id,P:typeof crP==='function'?crP(c):0,inval:true,wanted:{lv:2,t:'de FIOD',sec:c.jail,why:'na een inval van de FIOD'}})}

// tekst op de misdaadkaart: wat er gebeurt als het misgaat. nf = geen vlucht (tekst ernaast)
function arFailTxt(c){const k=crCat(c);
 if(c.sev==='A')return {b:'Boete of weg',nf:'geen cel'};
 if(k==='fraude')return {b:'Aangifte',nf:'zitting na '+arDur(AR_ZAAK_MS)};
 if(k==='smokkel')return {b:'Boete '+(typeof fmtK==='function'?fmtK(arSmFine(c)):fmt(arSmFine(c))),nf:'verbod '+AR_PLACES[arPlace(c)][0]};
 if(k==='invloed')return {b:'FIOD +'+arFiodGain(c),nf:'dossier '+Math.floor(fiodNow())+'/100'};
 return {b:fmtTime(jailSec(c.jail*(k==='geweld'?AR_GW:1)))+' cel'}}

// =====================================================================================================================
// B. Het arrestatieverloop
// =====================================================================================================================
function arB0(pa){const k=arCatOf(pa),P=+(pa.opts&&pa.opts.P)||0;return Math.round(Math.max(5,Math.min(95,(AR_B0[k]||60)-AR_PRO*P+((pa.flow&&pa.flow.ex||1)>1?8:0))))}
// kans per beslissing van de officier van justitie: sepot bij weinig bewijs, strafbeschikking bij lichte zaken
function arProbs(pa,B,bek){const s=bek?0:Math.max(0,Math.min(.8,(50-B)/50));let w=Math.max(.05,Math.min(.85,1.3-pa.sec/150));if(bek)w=Math.min(.9,w+.25);
 return {s,sb:(1-s)*w,vg:(1-s)*(1-w)}}
const arVA=f=>f.adv==='piket'?f.W||0:0; // voorarrest
const arVg=(f,bek)=>Math.max(15,Math.round(f.full*(bek?AR_BEK:1))-arVA(f));
const arSbSec=(f,bek)=>Math.max(15,Math.round(f.full*AR_SB*(bek?AR_BEK:1))-arVA(f));
const arBoete=sec=>arR10(sec*bailRate()*(1-(S.skills.charisma||0)*SK.charisma.bail)*.8);
const arPleiter=f=>arR10(f.full*bailRate()*.3);
const arVormfout=()=>Math.min(.3,.15+sk('rechten')*.002);
const arVkP=pa=>Math.max(.25,Math.min(.85,.35+.3*(+(pa.opts&&pa.opts.P)||0)+(S.skills.charisma||0)*.006));
const arWait=f=>Math.max(8,Math.min(25,Math.round(f.full*.1)));
// verwachte cel met de standaardroute (piket, zwijgen), vanaf het huidige punt
function arExpect(pa){const f=pa.flow;let B=f.B;const g=Object.assign({},f);if(f.st==='adv'){B+=AR_ADV.piket;g.adv=null}
 const P=arProbs(pa,B,false);return Math.round(P.vg*arVg(g,false)+P.sb*arSbSec(g,false))}
function arStart(pa,extra,why){closeModal();pa.fleeing=false;const full=jailSec(pa.sec*(extra||1));
 pa.flow={st:'adv',full,ex:extra||1,why:why||pa.title,nr:arNr(),t:now()};pa.flow.B=pa.flow.B0=arB0(pa);
 S.pendingArrest=pa;S.stats.arrests=(S.stats.arrests||0)+1;save();pushState();return pa}
// vanuit arrest(): overgeven, vlucht of praatje mislukt
function arFlow(pa,extra,why){arStart(pa,extra,why);arShow(pa)}
// verversen midden in het verloop: de volle straf (tijdens de taakstraf: de vervangende hechtenis)
function arResume(pa){const f=pa.flow;S.pendingArrest=null;
 if(f.st==='taak'){arJail(arSbSec(f,f.bek),'Taakstraf afgebroken: vervangende hechtenis',true)}
 else arJail(f.full,'Arrestatieverloop afgebroken: voorgeleid, volle straf',true);
 save();pushState();arToJail()}
// snelknop: alles in één klik, met de gemiddelde uitkomst
function arQuick(pa,extra){if(!pa.flow)arStart(pa,extra||1,pa.title);const f=pa.flow;S.stats.quickLaw=(S.stats.quickLaw||0)+1;
 if(f.st==='sb'){const b=arBoete(arSbSec(f,f.bek));if(arCanPay(b))return arSbDo(pa,'boete');return arSbDo(pa,'zit')}
 const sec=arExpect(pa);S.pendingArrest=null;arClose(true);
 if(sec<15){log('De advocaat regelt het: zaak geseponeerd','ok');save();pushState();render();toast('Je advocaat regelt het: de officier van justitie seponeert. Je bent vrij.','lvl');return}
 arJail(sec,'De advocaat regelt het (gemiddelde uitkomst)',true);save();pushState();arToJail()}
const arQuickTxt=pa=>{let f=pa.flow;if(!f){f={st:'adv',full:jailSec(pa.sec),ex:1};f.B=arB0(pa)}
 if(f.st==='sb')return 'boete of uitzitten';const s=arExpect(Object.assign({},pa,{flow:f}));return s<15?'vrij':'±'+fmtTime(s)};

// ---------- overlay ----------
const AR_I={gavel:'<path d="M14.6 3.4l6 6M12.4 5.6l6 6M13.5 4.5l-5 5 6 6 5-5M11 12.5l-7.5 7.5"/><path d="M3 21.5h9"/>',
 cell:'<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M8 3v18M12 3v18M16 3v18"/>',
 law:'<circle cx="12" cy="7" r="3.2"/><path d="M5 21v-2.5A5 5 0 0110 13.5h4a5 5 0 015 5V21"/><path d="M12 13.5l-1.2 3 1.2 4.5 1.2-4.5z"/>',
 chat:'<path d="M4 5h16v11H9l-4 4v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
 om:'<path d="M12 3v17M7 21h10M4 7h16M6.5 7L3 14a3.5 3.5 0 007 0zM17.5 7L14 14a3.5 3.5 0 007 0z"/>',
 brush:'<path d="M4 20c2.5 0 4-1.5 4-3.5S6.5 13 5 15.5"/><path d="M8 16.5L19.5 5a1.8 1.8 0 00-2.5-2.5L5.5 14"/>',
 fiod:'<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12h7M9 15.5h4"/><circle cx="15.6" cy="17.6" r="2"/>',
 ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'};
const arIc=k=>`<svg class="ar-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AR_I[k]}</svg>`;
const AR_STEPS=['Politiecel','Verhoor','Officier','Afdoening'];
function arTop(lbl,step){return `<div class="ar-top"><span class="label">${lbl}</span>${step!=null?`<ol class="ar-steps" aria-label="Stap ${step+1} van 4">${AR_STEPS.map((s,i)=>`<li class="${i<step?'done':i===step?'now':''}"${i===step?' aria-current="step"':''}>${s}</li>`).join('')}</ol>`:''}</div>`}
function arMeter(B,B2){const v=Math.round(B2==null?B:B2);return `<div class="ar-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v}" aria-label="Bewijs"><div class="ar-m-h"><span>Bewijsmeter</span><b class="${v<50?'ok':v>=75?'bad':''}">${v}</b></div>
 <div class="ar-m-bar"><i style="width:${v}%"></i><u style="left:50%"></u></div><small>${v<50?'Onder de 50: de officier kan seponeren':'Vanaf 50 is sepot uitgesloten'}</small></div>`}
function arOverlay(html,acts,key){arClose(true);const ov=document.createElement('div');ov.className='ar-ov';ov.id='arOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','arT');
 ov.innerHTML=html;document.body.appendChild(ov);window.__chase=true;document.body.classList.add('ms-lock');
 ov.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{if(b.disabled||ov._busy)return;const f=acts&&acts[b.dataset.a];if(f){try{SFX.click()}catch(e){}f(b.dataset.a)}}));
 ov._key=e=>{if(ov._busy)return;const n=+e.key;const ops=[...ov.querySelectorAll('.ar-op')];if(n>=1&&n<=ops.length){e.preventDefault();if(!ops[n-1].disabled)ops[n-1].click()}else if(e.key==='Enter'&&!ops.length){const b=ov.querySelector('.ar-acts .btn:not(:disabled)');if(b&&document.activeElement===document.body){e.preventDefault();b.click()}}if(key)key(e)};
 document.addEventListener('keydown',ov._key);setTimeout(()=>{const b=ov.querySelector('.ar-op:not(:disabled),.ar-acts .btn');b&&b.focus({preventScroll:true})},60);return ov}
function arClose(now_){const ov=document.getElementById('arOv');if(!ov)return;if(ov._key)document.removeEventListener('keydown',ov._key);if(ov._stop)ov._stop();
 if(now_){ov.remove();window.__chase=false;document.body.classList.remove('ms-lock');return}
 ov.id='';ov.classList.add('out');setTimeout(()=>{ov.remove();if(!document.getElementById('arOv')){window.__chase=false;document.body.classList.remove('ms-lock')}},200)}
const arOp=(a,t,s,tag,dis)=>`<button type="button" class="ar-op" data-a="${a}"${dis?' disabled':''}><b>${t}</b><span>${s}</span>${tag?`<em>${tag}</em>`:''}</button>`;
const arQuickBtn=pa=>`<button type="button" class="btn ghost ar-q" data-a="quick">${arIc('law')}<span>Laat de advocaat het regelen<small>${arQuickTxt(pa)}</small></span></button>`;
const arMax=f=>`<small class="ar-max">Hooguit ${fmtTime(f.full)} cel · verversen = de volle straf</small>`;
const sgn=v=>v>0?'+'+v:v<0?'−'+Math.abs(v):'±0';

function arShow(pa){const f=pa.flow;if(!f)return;const qa={quick:()=>arQuick(pa)};
 if(f.st==='adv'){const W=arWait(f),cost=arPleiter(f),vf=Math.round(arVormfout()*100);
  arOverlay(`<div class="ar-box">${arTop('Aangehouden · '+f.nr,0)}<div class="ar-body">
   <div class="ar-hd">${arIc('cell')}<div><span class="label">${esc(f.why)}</span><h2 id="arT">Politiecel</h2></div></div>
   <p>Je zit op het bureau. Voor het verhoor heb je recht op een advocaat. Je mag ook zwijgen.</p>${arMeter(f.B)}
   <div class="ar-opts">${arOp('piket','Piketadvocaat','Gratis. Wel even wachten: ±'+W+' s (telt als voorarrest).','bewijs '+sgn(AR_ADV.piket))}
    ${arOp('pleiter','Eigen strafpleiter','Kost '+fmt(cost)+'. '+vf+'% kans dat hij een vormfout vindt: dan seponeert de officier.','bewijs '+sgn(AR_ADV.pleiter),!arCanPay(cost))}
    ${arOp('zelf','Afzien van een advocaat','Meteen door. Het verhoor wordt zwaarder.','bewijs '+sgn(AR_ADV.zelf))}</div>
   <div class="ar-foot">${arQuickBtn(pa)}${arMax(f)}</div></div></div>`,Object.assign({},qa,{piket:()=>{f.adv='piket';f.W=W;f.B+=AR_ADV.piket;f.wT=now()+W*1000;f.st='piket';arSave(pa);arShow(pa)},
    pleiter:()=>{if(!arCanPay(cost))return;arPay(cost,'Strafpleiter');f.adv='pleiter';f.paid=cost;
     if(Math.random()<arVormfout()){S.pendingArrest=null;S.stats.sepot=(S.stats.sepot||0)+1;log(`Strafpleiter (${fmt(cost)}) vindt een vormfout: zaak ${f.nr} geseponeerd`,'ok');save();pushState();arEnd(pa,'vormfout');return}
     f.B+=AR_ADV.pleiter;f.st='vh';arSave(pa);arShow(pa)},
    zelf:()=>{f.adv='zelf';f.B+=AR_ADV.zelf;f.st='vh';arSave(pa);arShow(pa)}}));return}
 if(f.st==='piket'){const ov=arOverlay(`<div class="ar-box">${arTop('Aangehouden · '+f.nr,0)}<div class="ar-body">
   <div class="ar-hd">${arIc('law')}<div><span class="label">Piketadvocaat</span><h2 id="arT">De advocaat is onderweg</h2></div></div>
   <p>Je wacht in de cel. Deze tijd gaat straks van een eventuele straf af.</p>
   <div class="ar-wait"><b id="arW">${Math.max(0,Math.ceil((f.wT-now())/1000))}s</b><div class="ar-m-bar"><i id="arWb" style="width:0%"></i></div></div>
   <div class="ar-acts"><button class="btn" data-a="go" id="arGo" disabled>Naar het verhoor</button></div>
   <div class="ar-foot">${arQuickBtn(pa)}${arMax(f)}</div></div></div>`,Object.assign({},qa,{go:()=>{if(now()<f.wT)return;f.st='vh';arSave(pa);arShow(pa)}}));
  const iv=setInterval(()=>{const l=f.wT-now(),w=ov.querySelector('#arW'),b=ov.querySelector('#arWb');if(!w){clearInterval(iv);return}
   w.textContent=Math.max(0,Math.ceil(l/1000))+'s';b.style.width=Math.min(100,(1-l/(f.W*1000))*100)+'%';if(l<=0){clearInterval(iv);const g=ov.querySelector('#arGo');g.disabled=false;w.textContent='Daar is ze';g.focus({preventScroll:true})}},250);ov._stop=()=>clearInterval(iv);return}
 if(f.st==='vh'){const pv=Math.round(arVkP(pa)*100),P=Math.round((+(pa.opts&&pa.opts.P)||0)*100);
  arOverlay(`<div class="ar-box">${arTop('Verhoor · '+f.nr,1)}<div class="ar-body">
   <div class="ar-hd">${arIc('chat')}<div><span class="label">${f.adv==='zelf'?'Zonder advocaat':f.adv==='pleiter'?'Met je strafpleiter':'Met de piketadvocaat'}</span><h2 id="arT">Verhoor</h2></div></div>
   <p>Je bent niet verplicht te antwoorden. Je professionaliteit (${P}%) heeft al minder sporen achtergelaten.</p>${arMeter(f.B)}
   <div class="ar-opts">${arOp('zwijg','Zwijgen','Je beroept je op je zwijgrecht. Het bewijs blijft wat het is.','bewijs ±0')}
    ${arOp('verklaar','Een verklaring afleggen',pv+'% kans dat je verhaal klopt. Zo niet, dan wordt het erger.','bewijs '+sgn(AR_VK[0])+' of '+sgn(AR_VK[1]))}
    ${arOp('beken','Bekennen','20% minder straf en meer kans op een strafbeschikking. Sepot kan dan niet meer.','straf −20%')}</div>
   <div class="ar-foot">${arQuickBtn(pa)}${arMax(f)}</div></div></div>`,Object.assign({},qa,{
    zwijg:()=>{f.vh='zwijg';arDecide(pa)},
    verklaar:()=>{const ok=Math.random()<arVkP(pa);f.vh=ok?'ok':'nee';f.B=Math.max(0,Math.min(100,f.B+AR_VK[ok?0:1]));arDecide(pa)},
    beken:()=>{f.vh='beken';f.bek=true;f.B=100;arDecide(pa)}}));return}
 if(f.st==='sb'){const sec=arSbSec(f,f.bek),b=arBoete(sec),can=arCanPay(b);
  arOverlay(`<div class="ar-box mid">${arTop('Strafbeschikking · '+f.nr,3)}<div class="ar-body">
   <div class="ar-hd">${arIc('om')}<div><span class="label">De officier van justitie</span><h2 id="arT">Strafbeschikking</h2></div></div>
   <p>Geen rechter nodig: de officier doet het zelf af${f.bek?', met 20% korting omdat je bekende':''}. Jij kiest hoe.</p>
   <div class="ar-opts">${arOp('boete','Boete betalen','Je betaalt '+fmt(b)+' en bent meteen vrij.',fmt(b),!can)}
    ${arOp('taak','Taakstraf: graffiti weghalen','Een kort klusje van 15 seconden. Haal minstens 60% weg, anders volgt vervangende hechtenis.','15 s')}
    ${arOp('zit','Uitzitten','Vervangende hechtenis: '+fmtTime(sec)+' cel.',fmtTime(sec))}</div>
   <div class="ar-foot">${arQuickBtn(pa)}<small class="ar-max">Verversen = vervangende hechtenis</small></div></div></div>`,Object.assign({},qa,{boete:()=>arSbDo(pa,'boete'),taak:()=>arSbDo(pa,'taak'),zit:()=>arSbDo(pa,'zit')}));return}
 if(f.st==='taak'){arTaak(pa);return}}
function arSave(pa){S.pendingArrest=pa;save();pushState()}
function arDecide(pa){const f=pa.flow,P=arProbs(pa,f.B,f.bek),r=Math.random();f.pr=P;f.dec=r<P.s?'sepot':r<P.s+P.sb?'sb':'vg';
 let sec=0;
 if(f.dec==='sepot'){S.pendingArrest=null;S.stats.sepot=(S.stats.sepot||0)+1;log(`Zaak ${f.nr}: geseponeerd door de officier van justitie`,'ok')}
 else if(f.dec==='vg'){S.pendingArrest=null;sec=arJail(arVg(f,f.bek),'Voorgeleid: '+f.why,true);f.sec=sec}
 else{f.st='sb';S.pendingArrest=pa}
 save();pushState();
 const bar=(k,l)=>`<div class="ar-pr ${f.dec===k?'on':''}"><span>${l}</span><i><u style="width:${Math.round(P[k]*100)}%"></u></i><b>${Math.round(P[k]*100)}%</b></div>`;
 const vk=f.vh==='ok'?'Je verhaal klopt: het bewijs zakt.':f.vh==='nee'?'Je verhaal rammelt: het bewijs stijgt.':f.vh==='beken'?'Je bekent.':'Je zwijgt.';
 const res=f.dec==='sepot'?['Sepot','Te weinig bewijs. De officier van justitie seponeert de zaak. Je bent vrij.','ok']:f.dec==='vg'?['Voorgeleiding','De officier van justitie laat je voorgeleiden. De rechter-commissaris beveelt bewaring: '+fmtTime(sec)+' cel'+(arVA(f)?' (voorarrest al afgetrokken)':'')+'.','bad']:['Strafbeschikking','De officier van justitie doet de zaak zelf af. Kies hoe je hem afhandelt.','mid'];
 arOverlay(`<div class="ar-box ${res[2]}">${arTop('Beslissing · '+f.nr,2)}<div class="ar-body">
  <div class="ar-hd">${arIc('om')}<div><span class="label">${vk}</span><h2 id="arT">${res[0]}</h2></div></div>
  ${arMeter(f.B)}<div class="ar-prs">${bar('s','Sepot')}${bar('sb','Strafbeschikking')}${bar('vg','Voorgeleiding')}</div>
  <p>${res[1]}</p><div class="ar-acts"><button class="btn${f.dec==='vg'?' red':''}" data-a="ok">${f.dec==='sepot'?'Naar buiten':f.dec==='vg'?'Naar je cel':'Verder'}</button></div></div></div>`,
  {ok:()=>{if(f.dec==='sb'){arShow(pa);return}arClose();if(f.dec==='vg')arToJail();else{render();toast('Geseponeerd. Je bent vrij.','lvl')}}})}
function arSbDo(pa,k){const f=pa.flow,sec=arSbSec(f,f.bek);f.sbk=k;
 if(k==='boete'){const b=arBoete(sec);if(!arCanPay(b))return;arPay(b,'Strafbeschikking '+f.nr);S.pendingArrest=null;S.stats.strafb=(S.stats.strafb||0)+1;log(`Strafbeschikking ${f.nr}: boete van ${fmt(b)} betaald`,'bad');save();pushState();arEnd(pa,'boete',b);return}
 if(k==='zit'){S.pendingArrest=null;S.stats.strafb=(S.stats.strafb||0)+1;arJail(sec,'Strafbeschikking '+f.nr+': vervangende hechtenis',true);save();pushState();arClose(true);arToJail();return}
 f.st='taak';arSave(pa);arShow(pa)}
function arEnd(pa,k,x){const f=pa.flow;const T={vormfout:['Vormfout','Je strafpleiter vindt een vormfout in het proces-verbaal. De officier van justitie seponeert de zaak. Je bent vrij.'],
  boete:['Boete betaald',`Je betaalt ${fmt(x||0)}. De zaak is afgedaan.`],taak:['Taakstraf gedaan','De gemeente is tevreden. De zaak is afgedaan en je bent vrij.']}[k];
 arOverlay(`<div class="ar-box ok">${arTop('Afgedaan · '+f.nr,3)}<div class="ar-body"><div class="ar-hd">${arIc(k==='taak'?'brush':'gavel')}<div><span class="label">${esc(f.why)}</span><h2 id="arT">${T[0]}</h2></div></div>
  <p>${T[1]}</p><div class="ar-acts"><button class="btn" data-a="ok">Naar buiten</button></div></div></div>`,{ok:()=>{arClose();render()}})}

// ---------- taakstraf: graffiti weghalen (15 s, tik op de tags) ----------
const AR_TK={dur:15000,every:720,life:1550,need:.6};
function arTaak(pa){const f=pa.flow,cols=['#ff5a5f','#5ce1c4','#f2c230','#b8a1ff','#ffad6b'];
 const ov=arOverlay(`<div class="ar-box mid">${arTop('Taakstraf · '+f.nr,3)}<div class="ar-body">
  <div class="ar-hd">${arIc('brush')}<div><span class="label">Werkstraf · gemeente</span><h2 id="arT">Graffiti weghalen</h2></div></div>
  <p class="ar-tk-how">Tik op elke tag voordat hij indroogt. Toetsen 1-9 werken ook. Minstens 60% weghalen.</p>
  <div class="ar-tk-h"><span>Weg <b id="arTkOk">0</b></span><span>Ingedroogd <b id="arTkNo">0</b></span><span id="arTkT">15s</span></div>
  <div class="ar-m-bar ar-tk-bar"><i id="arTkB" style="width:100%"></i></div>
  <div class="ar-wall" id="arWall">${Array.from({length:9},(_,i)=>`<button type="button" class="ar-tile" data-i="${i}" aria-label="Muurvak ${i+1}"><kbd>${[7,8,9,4,5,6,1,2,3][i]}</kbd></button>`).join('')}</div>
  <div class="ar-acts" id="arTkA"><button class="btn" data-a="start">Begin</button></div></div></div>`,{start:()=>go()},e=>{const m={7:0,8:1,9:2,4:3,5:4,6:5,1:6,2:7,3:8}[e.key];if(m!=null&&run){e.preventDefault();hit(m)}});
 const tiles=[...ov.querySelectorAll('.ar-tile')],T=[];let run=false,t0=0,last=0,ok=0,no=0,raf=0,done=false;
 const tag=c=>`<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M6 30c6-16 10-20 14-8s8 10 12-6 10-10 12 4 6 8 10-6" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`;
 tiles.forEach((b,i)=>b.addEventListener('pointerdown',e=>{if(run){e.preventDefault();hit(i)}}));
 function hit(i){const x=T[i];if(!x||!run)return;T[i]=null;ok++;tiles[i].classList.remove('on');tiles[i].classList.add('clean');setTimeout(()=>tiles[i].classList.remove('clean'),220);ov.querySelector('#arTkOk').textContent=ok;try{SFX.tick()}catch(e){}}
 function go(){if(run||done)return;run=true;ov.querySelector('#arTkA').innerHTML='';ov.querySelector('.ar-tk-how').classList.add('dim');t0=last=performance.now();raf=requestAnimationFrame(loop)}
 function loop(t){if(!run)return;const el=t-t0;
  if(t-last>=AR_TK.every&&el<AR_TK.dur-600){last=t;const free=tiles.map((_,i)=>i).filter(i=>!T[i]);if(free.length){const i=free[Math.floor(Math.random()*free.length)];T[i]={t};tiles[i].innerHTML=tag(cols[Math.floor(Math.random()*cols.length)])+tiles[i].querySelector('kbd').outerHTML;tiles[i].classList.add('on')}}
  T.forEach((x,i)=>{if(x&&t-x.t>AR_TK.life){T[i]=null;no++;tiles[i].classList.remove('on');tiles[i].classList.add('dry');setTimeout(()=>tiles[i].classList.remove('dry'),260);ov.querySelector('#arTkNo').textContent=no}});
  ov.querySelector('#arTkB').style.width=Math.max(0,100-el/AR_TK.dur*100)+'%';ov.querySelector('#arTkT').textContent=Math.max(0,Math.ceil((AR_TK.dur-el)/1000))+'s';
  if(el>=AR_TK.dur){finish();return}raf=requestAnimationFrame(loop)}
 function finish(){run=false;done=true;cancelAnimationFrame(raf);const tot=ok+no,s=tot?ok/tot:0,pass=s>=AR_TK.need;
  f.tk=Math.round(s*100);S.pendingArrest=null;S.stats.strafb=(S.stats.strafb||0)+1;
  if(pass){S.stats.taak=(S.stats.taak||0)+1;log(`Taakstraf ${f.nr}: ${f.tk}% weggehaald, zaak afgedaan`,'ok');save();pushState();arEnd(pa,'taak');return}
  const sec=arJail(arSbSec(f,f.bek),`Taakstraf ${f.nr} niet goed gedaan (${f.tk}%): vervangende hechtenis`,true);save();pushState();
  arOverlay(`<div class="ar-box bad">${arTop('Taakstraf · '+f.nr,3)}<div class="ar-body"><div class="ar-hd">${arIc('brush')}<div><span class="label">${f.tk}% weggehaald</span><h2 id="arT">Niet goed genoeg</h2></div></div>
   <p>De werkmeester keurt het af. Je zit ${fmtTime(sec)} vervangende hechtenis uit.</p><div class="ar-acts"><button class="btn red" data-a="ok">Naar je cel</button></div></div></div>`,{ok:()=>{arClose();arToJail()}})}
 ov._stop=()=>{run=false;cancelAnimationFrame(raf)};
 ov._pl=()=>({ok,no,run,T})}

// =====================================================================================================================
// Zichtbaar: misdaadkaart, politiebureau en dashboard
// =====================================================================================================================
function arStatus(){const v=fiodNow(),Z=S.zaak,E=arZaakEst(),B=arBans(),bk=Object.keys(B);
 const fc=v>=75?'bad':v>=40?'warn':'';
 const fi=`<div class="ar-st ${fc}">${arIc('fiod')}<div><span class="label">FIOD-dossier</span><b>${Math.floor(v)}<small>/100</small></b><div class="ar-m-bar"><i style="width:${v}%"></i></div><em>${v>0?'Zakt '+String(AR_FIOD_DECAY).replace('.',',')+' per minuut · vol = inval':'Leeg. Witteboordklussen laten sporen na'}</em></div></div>`;
 const za=`<div class="ar-st ${Z?'warn':''}">${arIc('gavel')}<div><span class="label">Lopende zaak</span><b>${Z?(now()>=Z.due?'Uitspraak nu':arDur(Z.due-now())):'Geen'}</b>${Z?`<em>${Z.nr} · ${E.n} feit${E.n>1?'en':''} oplichting · ${E.clean?'schoon gebleven (−40%)':'opnieuw de fout in'} · kans op cel ${Math.round(E.pCel*100)}%</em>`:'<em>Mislukte oplichting = aangifte en een zitting na '+arDur(AR_ZAAK_MS)+'</em>'}</div></div>`;
 const ba=`<div class="ar-st ${bk.length?'warn':''}">${arIc('ban')}<div><span class="label">Locatieverbod</span><b>${bk.length?bk.map(k=>AR_PLACES[k][0]).join(', '):'Geen'}</b><em>${bk.length?bk.map(k=>AR_PLACES[k][0]+' nog '+arDur(B[k]-now())).join(' · '):'Mislukte smokkel = partij kwijt en '+arDur(AR_BAN_MS)+' verbod'}</em></div></div>`;
 return `<div class="ar-sts">${fi}${za}${ba}</div>`}
function arCrimesPanel(){const L=[['straat','Boete of weg (bagatel), anders cel'],['kraak','Cel, vluchten kan'],['geweld','Cel ×'+String(AR_GW).replace('.',',')+', kans op signalement'],['fraude','Aangifte, later een zitting'],['smokkel','Partij kwijt en locatieverbod'],['invloed','FIOD-dossier, vol = inval']];
 return `<section class="ar-gv"><div class="ar-gv-h"><h2>Als het misgaat</h2><span>Elke soort heeft een eigen gevolg. Een arrestatie gaat via politiecel, advocaat, verhoor en de officier van justitie.</span></div>
 <div class="ar-gv-l">${L.map(([k,t])=>`<span style="--c:${CR_CATS[k][1]}"><b>${CR_CATS[k][0]}</b>${t}</span>`).join('')}</div>${arStatus()}</section>`}
function arPbHtml(){return `<section class="ar-gv ar-pb"><div class="ar-gv-h"><h2>Justitie</h2><span>Lopende zaken, je FIOD-dossier en locatieverboden.</span></div>${arStatus()}</section>`}
function arDashHtml(){const v=fiodNow(),Z=S.zaak,bk=Object.keys(arBans()),o=[];
 if(Z)o.push(`Zitting over <b>${now()>=Z.due?'nu':arDur(Z.due-now())}</b> (${Z.nr}). Schoon blijven scheelt 40%.`);
 if(v>=50)o.push(`FIOD-dossier op <b>${Math.floor(v)}/100</b>. Vol = inval.`);
 if(bk.length)o.push(`Locatieverbod: <b>${bk.map(k=>AR_PLACES[k][0]).join(', ')}</b>.`);
 return o.length?`<div class="card alert ar-dash"><b>⚖ Justitie</b><span>${o.join(' ')} <a href="#politie">Bekijk ›</a></span></div>`:''}

// elke seconde: zitting op tijd, FIOD vol (na een gelukte klus)
setInterval(()=>{if(typeof S==='undefined'||!S||!S.name)return;if(window.__chase||S.pendingArrest||inJail()||($('#modal')&&!$('#modal').hidden))return;
 if(S.invalDue){const c=arC(S.invalDue);delete S.invalDue;arInval(c);return}
 if(S.zaak&&now()>=S.zaak.due){arUitspraak();return}},1000);
