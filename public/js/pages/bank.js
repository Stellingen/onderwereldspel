// Tab: Bank — spaarrekening, deposito's en beleggen (koersen: market.js)
// Spaarrekening: veilig en vrij opneembaar, lage rente. Deposito: vaste tijd, vaste rente, kan niet zakken.
// Beleggen: uitkering per uur (rente, huur, dividend, staking) plus een koers die kan stijgen én dalen.
// Alles bij de bank ben je niet kwijt als je gepakt wordt. Maximaal bedrag per deposito groeit met je rang; beleggen heeft een totaalplafond per lidmaatschap.
const SAV_RATE=.001; // per uur; rente per lidmaatschap ×BANK_T (gewoon 0,10%, VIP 0,12%, High roller 0,15% per uur), kosten −15% / −40%
// Per lidmaatschap: aantal depositoplekken (2 / 5 / 10) en hoeveel je in totaal kunt beleggen: €100.000 / €300.000 / €1 mln.,
// keer (1 + je rang), dus bij een hogere rang veel meer (ook in coins)
const BANK_T=[1,1.2,1.5],DEP_SLOTS_T=[2,5,10],INV_CAP_T=[100000,300000,1000000],LID_N=['Gewoon','VIP','High roller'];
// Deposito's in speltijd (1 speldag = 4 uur): een halve speldag, 1, 2 of 3 speldagen. Rente voor gewoon / VIP / High roller
// (VIP ±20%, High roller ±45% meer). Veel beter dan de spaarrekening (0,10% per uur), maar je geld staat vast.
const DEP_TERMS=[
 {id:'2u',h:2,r:[.015,.018,.022],n:'Halve speldag',tag:'2 uur'},
 {id:'4u',h:4,r:[.03,.036,.044],n:'1 speldag',tag:'4 uur'},
 {id:'8u',h:8,r:[.055,.066,.08],n:'2 speldagen',tag:'8 uur'},
 {id:'12u',h:12,r:[.08,.096,.116],n:'3 speldagen',tag:'12 uur · meeste rente'}];
const DEP_SLOTS=3,DEP_EARLY=.02,DEP_MIN=1000,INV_MIN=100;
const bankCap=()=>250000*Math.pow(2,rankIdx(S.xp));
const savRate=()=>SAV_RATE*(BANK_T[tier()]||1);
const depRate=(t,i)=>t.r[i==null?tier():i]||t.r[0];
// rente netjes: 0,30% · 1,4% · 1,85%
const pctR=v=>{const p=Math.round(v*1e4)/100;return nl(p,p<1||Math.round(p*10)!==p*10?2:1)+'%'};
// oude deposito's (1 uur, 6 uur, 24 uur, 3 dagen) omzetten: 3 dagen wordt 8 uur en 24 uur wordt 12 uur, tegen de nieuwe rente
function depFix(){(S.dep||[]).forEach(d=>{if(d.v===2)return;const nt=d.h===72?'8u':d.h===24?'12u':null;
 if(nt){const t=DEP_TERMS.find(x=>x.id===nt);d.h=t.h;d.n=t.n;d.r=depRate(t);d.t1=d.t0+t.h*36e5}d.v=2})}
const depSlots=()=>DEP_SLOTS_T[tier()]||DEP_SLOTS_T[0];
const invCap=()=>(INV_CAP_T[tier()]||INV_CAP_T[0])*(1+rankIdx(S.xp));
// een rijtje per lidmaatschap, met het jouwe gemarkeerd
const bkTiers=(f,suf)=>`<div class="bk-tiers">${LID_N.map((n,i)=>`<span class="${i===tier()?'on':''}"><i>${n}</i><b>${f(i)}</b>${suf?`<em>${suf}</em>`:''}</span>`).join('')}</div>`;
const invFee=f=>f.fee*(1-tierK())*(1-sk('handel')*SK.handel.fee/100);
const fundOf=id=>MK.FUNDS.find(f=>f.id===id)||(id&&id[0]==='L'?MK.coin(id):null);
const invPos=id=>(S.inv||{})[id];
const invVal=id=>{const p=invPos(id);return p&&p.u>0?p.u*MK.price(id,now()):0};
const invIds=()=>Object.keys(S.inv||{});
const invTotal=()=>invIds().reduce((a,id)=>a+invVal(id),0);
const invCost=()=>invIds().reduce((a,id)=>a+((invPos(id)||{}).c||0),0);
const depTotal=()=>(S.dep||[]).reduce((a,d)=>a+d.a,0);
const bankNet=()=>S.bank+depTotal()+invTotal();
const nl=(v,d)=>v.toLocaleString('nl-NL',{minimumFractionDigits:d,maximumFractionDigits:d});
const pctNl=(v,d=1)=>(v>=0?'+':'−')+nl(Math.abs(v*100),d)+'%';
const fmtPx=v=>v>=10?'€'+nl(v,2):v>=.1?'€'+nl(v,3):v>=.001?'€'+nl(v,5):'€'+v.toLocaleString('nl-NL',{maximumSignificantDigits:3});
const bkDur=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'u '+String(m).padStart(2,'0')+'m':m+'m '+String(s%60).padStart(2,'0')+'s'};
// wanneer iets klaar is: "om 16:42", "morgen 09:10" of "za 14:05"
const bkAt=t=>{const d=new Date(t),n=new Date(now()),hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 if(d.toDateString()===n.toDateString())return 'om '+hm;const m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);
 return d.toDateString()===m.toDateString()?'morgen '+hm:d.toLocaleDateString('nl-NL',{weekday:'short'}).replace('.','')+' '+hm};
const BK_ARROWS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h15l-4-4M20 16H5l4 4"/></svg>';
// kans op verlies na 24 uur en na 7 dagen (doorgerekend met de echte koersen, inclusief kosten)
const FUND_RISK={oblig:[0,0],vast:[13,0],haven:[30,1],coin:[37,9]};
const DAYMS=864e5,L5=3e5;

// nieuwe coins die van de markt zijn: een scam is weg (inzet kwijt), een echte coin gaat naar de grote beurs (verkocht, naar je spaarrekening)
function coinTick(t){Object.keys(S.inv||{}).forEach(id=>{if(id[0]!=='L')return;const c=MK.coin(id),p=S.inv[id];if(!c||t<c.end)return;
 if(c.endKind==='scam'){delete S.inv[id];log(c.n+' ('+c.s+') was een scam: '+fmt(p.c)+' inleg kwijt','bad');toast(c.n+' was een scam. Hij is van de markt en je inleg van '+fmt(p.c)+' is weg.','bad')}
 else{const got=p.u*MK.price(id,c.end-1);delete S.inv[id];S.bank+=got;bkTx('sell',got,c.n+' · naar de grote beurs');log(c.n+' ging naar de grote beurs: '+fmt(got)+' op je spaarrekening','ok');toast(c.n+' gaat naar de grote beurs: je stukken zijn verkocht voor '+fmt(got),'ok')}});
 if(bk.fund&&bk.fund[0]==='L'){const c=MK.coin(bk.fund);if(c&&t-c.end>12*36e5)bk.fund='coin'}}
// elke minuut: spaarrente, uitkering op beleggingen en deposito's die klaar zijn
function bankTick(mins){if(!S.dep)S.dep=[];if(!S.inv)S.inv={};depFix();
 S.bank*=Math.pow(1+savRate(),mins/60);
 const t=now();MK.FUNDS.forEach(f=>{const p=S.inv[f.id];if(p&&p.u>0){const g=Math.exp(f.y*mins/60)-1;p.paid=(p.paid||0)+p.u*g*MK.price(f,t);p.u*=1+g}});
 coinTick(t);
 const done=S.dep.filter(d=>d.t1<=t);
 if(done.length){S.dep=S.dep.filter(d=>d.t1>t);done.forEach(d=>{const pay=Math.round(d.a*(1+d.r));S.bank+=pay;bkTx('depin',pay,d.n+' · '+pctR(d.r)+' rente');log('Deposito '+d.n+' uitbetaald: '+fmt(pay),'ok');toast('Deposito klaar: '+fmt(pay)+' staat op je spaarrekening','ok')})}}

// ---------- Pinautomaat ----------
// Menu: Opnemen of Storten. Daarna typ je een bedrag (toetsen op de automaat, je toetsenbord of het veld op het scherm)
// of kies je 25% / 50% / 75% / Alles. OK = bevestigen, Corr = laatste cijfer weg, Stop = terug. Daarna een bevestiging.
const atm={mode:null,amt:'',done:null};
const atmMax=()=>Math.floor(atm.mode==='opnem'?S.bank:wit());
const atmA=()=>Math.max(0,Math.floor(+atm.amt||0));
const atmWhy=()=>{const a=atmA(),m=atmMax();return !m?(atm.mode==='opnem'?'Er staat niets op je spaarrekening':zwart()>=1?'Je hebt alleen zwart geld. Was het eerst wit.':'Je hebt geen contant geld'):!a?'Toets een bedrag in':a>m?'Te veel: maximaal '+fmt(m):''};
const atmPcts=[[.25,'25%'],[.5,'50%'],[.75,'75%'],[1,'Alles']];
function atmScreen(sv,dp,iv,tot){
 if(atm.done){const d=atm.done;return `<div class="atm-hi"><span>${d.k==='opnem'?'Opnemen':'Storten'}</span><span>klaar</span></div>
   <div class="atm-ok"><i class="atm-tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i>
    <span class="atm-l">${d.k==='opnem'?'Opgenomen':'Gestort'}</span><b class="atm-tot">${fmt(d.a)}</b>
    <span class="atm-sub">${d.k==='opnem'?'Neem je geld uit. Het zit nu contant op zak.':'Staat veilig op je spaarrekening.'}</span>
    <span class="atm-sub">Spaarrekening nu <b>${fmt(S.bank)}</b> · op zak <b>${fmt(wit())}</b> wit</span></div>
   <div class="atm-opts two"><button onclick="atmGo('${d.k}')">Nog een keer</button><button onclick="atmClose()">Klaar</button></div>`}
 if(!atm.mode)return `<div class="atm-hi"><span>Welkom, ${esc(S.name)}</span><span>${new Date(now()).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</span></div>
    <span class="atm-l">Totaal bij de bank</span><b class="atm-tot">${fmt(sv+dp+iv)}</b>
    <div class="bk-dist" aria-hidden="true"><i style="width:${sv/tot*100}%;background:var(--ice)"></i><i style="width:${dp/tot*100}%;background:var(--violet)"></i><i style="width:${iv/tot*100}%;background:var(--acc)"></i></div>
    <div class="atm-rows"><span><i style="background:var(--ice)"></i>Spaarrekening <b>${fmt(sv)}</b></span><span><i style="background:var(--violet)"></i>Deposito's <b>${fmt(dp)}</b></span><span><i style="background:var(--acc)"></i>Beleggingen <b>${fmt(iv)}</b></span></div>
    <div class="atm-cash">Op zak: <b style="color:var(--wit)">${fmt(wit())} wit</b>${zwart()>=1?` · <b style="color:var(--zw)">${fmt(zwart())} zwart</b> <a href="#wit">witwassen ›</a>`:''}</div>
    <span class="atm-ask">Wat wil je doen?</span>
    <div class="atm-opts big"><button class="o-opn" onclick="atmGo('opnem')" ${S.bank>=1?'':'disabled'}><b>Opnemen</b><small>van je spaarrekening · ${fmt(S.bank)}</small></button>
     <button class="o-st" onclick="atmGo('stort')" ${wit()>=1?'':'disabled'}><b>Storten</b><small>wit geld op zak · ${fmt(wit())}</small></button></div>`;
 const op=atm.mode==='opnem',m=atmMax(),a=atmA(),why=atmWhy();
 return `<div class="atm-hi"><span>${op?'Opnemen':'Storten'}</span><span>${op?'beschikbaar':'wit op zak'} ${fmt(m)}</span></div>
   <span class="atm-l">${op?'Hoeveel wil je opnemen?':'Hoeveel wil je storten?'}</span>
   <label class="atm-amt ${a>m?'bad':''}"><i>€</i><input id="atmIn" type="text" inputmode="numeric" autocomplete="off" placeholder="0" value="${a?a.toLocaleString('nl-NL'):''}" oninput="atmType(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();atmOk()}" aria-label="Bedrag"></label>
   <div class="atm-pct">${atmPcts.map(([f,l])=>{const v=Math.floor(m*f);return `<button class="${a&&a===v?'on':''}" onclick="atmSet(${v})" ${v>=1?'':'disabled'}><b>${l}</b><small>${fmt(v)}</small></button>`}).join('')}</div>
   <div class="atm-msg ${a>m?'bad':''}" id="atmMsg">${why||(op?`Je spaarrekening wordt ${fmt(S.bank-a)}, op zak ${fmt(wit()+a)}.`:`Je spaarrekening wordt ${fmt(S.bank+a)}, op zak ${fmt(wit()-a)} wit.`)}</div>
   ${!op&&zwart()>=1?`<div class="atm-cash">De bank neemt geen zwart geld aan: ${fmt(zwart())} zwart, eerst <a href="#wit">witwassen ›</a></div>`:''}`}
function atmPad(){const on=!!atm.mode&&!atm.done,why=on?atmWhy():'x';
 const k=(l,fn,c,dis)=>`<button class="atm-p ${c||''}" onclick="${fn}" ${dis?'disabled':''}>${l}</button>`;
 return `<div class="atm-pad" id="atmPad" aria-label="Toetsen">${[1,2,3].map(n=>k(n,`atmKey('${n}')`,'',!on)).join('')}${k('Stop<small>terug</small>','atmGo(null)','stop',!atm.mode&&!atm.done)}
  ${[4,5,6].map(n=>k(n,`atmKey('${n}')`,'',!on)).join('')}${k('Corr<small>wissen</small>',"atmKey('back')",'corr',!on)}
  ${[7,8,9].map(n=>k(n,`atmKey('${n}')`,'',!on)).join('')}${k('OK<small>'+(atm.mode==='opnem'?'opnemen':atm.mode==='stort'?'storten':'bevestig')+'</small>','atmOk()','okk',!on||!!why)}
  ${k('00',"atmKey('00')",'',!on)}${k('0',"atmKey('0')",'',!on)}${k('000',"atmKey('000')",'',!on)}</div>`}
function atmRedraw(){const sc=document.getElementById('atmScr'),pd=document.getElementById('atmPad');if(!sc||!pd){render();return}
 const sv=S.bank,dp=depTotal(),iv=invTotal(),tot=sv+dp+iv||1;sc.innerHTML=atmScreen(sv,dp,iv,tot);pd.outerHTML=atmPad();const v=$('#view');if(v)v._h=null}
function atmGo(m){atm.mode=m;atm.amt='';atm.done=null;try{SFX.chip()}catch(e){}atmRedraw();if(m)setTimeout(()=>{const i=document.getElementById('atmIn');if(i&&matchMedia('(pointer:fine)').matches)i.focus({preventScroll:true})},30)}
function atmSet(v){atm.amt=String(Math.max(0,Math.floor(v)));try{SFX.tick()}catch(e){}atmRedraw()}
function atmKey(k){if(!atm.mode||atm.done)return;let t=String(atmA()||'');if(k==='back')t=t.slice(0,-1);else if(t.length<13)t=(t+k).replace(/^0+/,'');atm.amt=t;try{SFX.tick()}catch(e){}atmRedraw()}
// typen in het veld: alleen de tekst onder het bedrag en de knoppen bijwerken, zodat je cursor blijft staan
function atmType(el){const d=el.value.replace(/\D/g,'').slice(0,13);atm.amt=d;const a=atmA(),m=atmMax(),why=atmWhy(),op=atm.mode==='opnem';
 const f=a?a.toLocaleString('nl-NL'):'';if(el.value!==f){el.value=f;try{el.setSelectionRange(f.length,f.length)}catch(e){}}
 el.parentNode.classList.toggle('bad',a>m);const msg=document.getElementById('atmMsg');if(msg){msg.className='atm-msg'+(a>m?' bad':'');msg.textContent=why||(op?`Je spaarrekening wordt ${fmt(S.bank-a)}, op zak ${fmt(wit()+a)}.`:`Je spaarrekening wordt ${fmt(S.bank+a)}, op zak ${fmt(wit()-a)} wit.`)}
 document.querySelectorAll('.atm-pct button').forEach((b,i)=>b.classList.toggle('on',!!a&&a===Math.floor(m*atmPcts[i][0])));const ok=document.querySelector('.atm-p.okk');if(ok)ok.disabled=!!why}
function atmOk(){if(!atm.mode||atm.done||atmWhy())return;const a=atmA(),k=atm.mode;
 if(k==='opnem'){S.bank-=a;S.cash+=a;bkTx('out',-a);log(fmt(a)+' opgenomen bij de pinautomaat','info')}else{spendWit(a);S.bank+=a;bkTx('in',a);log(fmt(a)+' gestort bij de pinautomaat','info')}
 try{SFX.win(2)}catch(e){}atm.done={k,a};atm.amt='';save();render();atmRedraw();const sl=document.querySelector('.atm-slot');if(sl){sl.classList.remove('go');void sl.offsetWidth;sl.classList.add('go',k==='opnem'?'out':'in')}}
// toetsenbord als de automaat open staat: cijfers, Backspace, Enter; Escape = terug naar het menu en vanuit het menu sluiten
document.addEventListener('keydown',e=>{if(!atm.open)return;const t=e.target;
 if(e.key==='Escape'){e.preventDefault();if(atm.mode&&!atm.done)atmGo(null);else atmClose();return}
 if(!atm.mode||atm.done||(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName)))return;
 if(/^[0-9]$/.test(e.key)){e.preventDefault();atmKey(e.key)}else if(e.key==='Backspace'){e.preventDefault();atmKey('back')}else if(e.key==='Enter'){e.preventDefault();atmOk()}});
window.addEventListener('hashchange',()=>{if(location.hash!=='#bank'){if(atm.open)atmClose(true);atm.mode=null;atm.amt='';atm.done=null}});
const bk={tab:'home',amt:'',src:'bank',term:'8u',fund:'coin',rng:'24u',brk:null};
const bkAmt=()=>Math.max(0,Math.floor(+bk.amt||0));
const bkSrcBal=()=>Math.floor(bk.src==='bank'?S.bank:wit());
// invoer + snelknoppen. max = wat je hier maximaal kunt gebruiken
function bkInput(max,label){const a=bkAmt();
 const q=[[1e4,'10k'],[1e5,'100k'],[1e6,'1 mln'],[1e7,'10 mln']].filter(x=>x[0]<=Math.max(max,1e4)).slice(-3);
 return `<div class="bk-in"><span class="label">${label||'Bedrag'}</span>
  <div class="bk-field"><i>€</i><input class="input" type="number" inputmode="numeric" min="0" step="1" placeholder="0" value="${bk.amt}" oninput="bk.amt=this.value;bkLive()" aria-label="Bedrag"></div>
  <div class="bk-quick">${q.map(x=>`<button class="${a===x[0]?'on':''}" onclick="act.bkSet(${x[0]})">${x[1]}</button>`).join('')}
   <button onclick="act.bkSet(${Math.floor(max/4)})">25%</button><button onclick="act.bkSet(${Math.floor(max/2)})">50%</button><button class="${a&&a===Math.floor(max)?'on':''}" onclick="act.bkSet(${Math.floor(max)})">Max</button></div></div>`}
// alleen de teksten die van het bedrag afhangen bijwerken terwijl je typt (zonder het invoerveld te vervangen)
function bkLive(){if(!document.querySelector('[data-bk-live],[data-bk-btn]'))return;const v=$('#view');const tmp=document.createElement('div');tmp.innerHTML=V.bank();
 tmp.querySelectorAll('[data-bk-live]').forEach((n,i)=>{const cur=document.querySelectorAll('[data-bk-live]')[i];if(cur&&cur.innerHTML!==n.innerHTML)cur.innerHTML=n.innerHTML});
 tmp.querySelectorAll('[data-bk-btn]').forEach((n,i)=>{const cur=document.querySelectorAll('[data-bk-btn]')[i];if(cur){cur.disabled=n.disabled;cur.className=n.className;cur.innerHTML=n.innerHTML}});v._h=null}
const bkSrc=()=>`<div class="bk-src"><span class="label">Betalen van</span><div class="bk-seg"><button class="${bk.src==='bank'?'on':''}" onclick="bk.src='bank';render()" aria-pressed="${bk.src==='bank'}"><span>Spaarrekening</span><b>${fmt(S.bank)}</b></button><button class="${bk.src==='cash'?'on':''}" onclick="bk.src='cash';render()" aria-pressed="${bk.src==='cash'}"><span>Contant</span><b>${fmt(S.cash)}</b></button></div></div>`;

function bkSpark(f){const t=now(),sp=f.coin?Math.max(6e5,Math.min(DAYMS,Math.min(t,f.end)-f.t0)):DAYMS,s=MK.series(f,f.coin?Math.min(t,f.end):t,sp,48),mn=Math.min(...s),mx=Math.max(...s),k=mx-mn||1,up=s[s.length-1]>=s[0];
 const d=s.map((v,i)=>(i?'L':'M')+(i/(s.length-1)*100).toFixed(2)+','+(28-(v-mn)/k*26).toFixed(2)).join('');
 return `<svg class="bk-spark ${up?'up':'dn'}" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L100,30L0,30Z" class="a"/><path d="${d}" class="l"/></svg>`}
const BK_RNG={'1u':[36e5,72,'1 uur'],'24u':[DAYMS,96,'24 uur'],'7d':[7*DAYMS,112,'7 dagen'],'30d':[30*DAYMS,120,'30 dagen']};
function bkChart(f){let [span,n,lab]=BK_RNG[bk.rng],t=now();if(f.coin){t=Math.min(t,f.end);span=Math.max(6e5,t-f.t0);n=Math.min(160,Math.max(24,Math.round(span/L5)));lab=bkDur(span)}const s=MK.series(f,t,span,n),p=invPos(f.id);
 let mn=Math.min(...s),mx=Math.max(...s);if(p&&p.bp){mn=Math.min(mn,p.bp);mx=Math.max(mx,p.bp)}const pad=(mx-mn)*.08||mx*.01;mn-=pad;mx+=pad;
 const y=v=>(1-(v-mn)/(mx-mn))*100,d=s.map((v,i)=>(i?'L':'M')+(i/(s.length-1)*100).toFixed(2)+','+y(v).toFixed(2)).join('');
 const ch=s[s.length-1]/s[0]-1,hi=Math.max(...s),lo=Math.min(...s),last=s[s.length-1];
 return `<div class="bk-chart" style="--fc:${f.col}">
  <div class="bk-ch-top"><div><span class="label">Koers ${f.s}</span><b>${fmtPx(last)}</b><em class="${ch>=0?'up':'dn'}">${pctNl(ch,2)} <small>in ${lab}</small></em></div>
   ${f.coin?`<div class="bk-rng"><button class="on">sinds de start</button></div>`:`<div class="bk-rng">${Object.keys(BK_RNG).map(k=>`<button class="${bk.rng===k?'on':''}" onclick="bk.rng='${k}';render()">${k}</button>`).join('')}</div>`}</div>
  <div class="bk-plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Koersverloop ${f.n}"><defs><linearGradient id="bkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.col}" stop-opacity=".32"/><stop offset="1" stop-color="${f.col}" stop-opacity="0"/></linearGradient></defs>
   ${[25,50,75].map(g=>`<line x1="0" x2="100" y1="${g}" y2="${g}" class="g"/>`).join('')}
   <path d="${d}L100,100L0,100Z" fill="url(#bkg)"/><path d="${d}" class="l"/>${p&&p.bp?`<line x1="0" x2="100" y1="${y(p.bp)}" y2="${y(p.bp)}" class="bp"/>`:''}</svg>
   <i class="bk-dot" style="top:${y(last)}%"></i>
   <span class="bk-yl" style="top:${y(hi)}%">${fmtPx(hi)}</span><span class="bk-yl" style="top:${y(lo)}%">${fmtPx(lo)}</span>
   ${p&&p.bp?`<span class="bk-bpl" style="top:${y(p.bp)}%">jouw aankoop ${fmtPx(p.bp)}</span>`:''}</div>
  <div class="bk-xl"><span>${lab} geleden</span><span>nu</span></div></div>`}
const riskPips=r=>`<span class="bk-risk" title="Risico ${r} van 5">${[1,2,3,4,5].map(i=>`<i class="${i<=r?'on':''}"></i>`).join('')}</span>`;

// Deposito's: bovenaan je plekken (lopend of vrij), daaronder een nieuw deposito met een duidelijke afrekening.
// Een deposito open je alleen met geld van je spaarrekening (contant eerst storten bij de pinautomaat).
function bkDepTab(){depFix();const t=DEP_TERMS.find(x=>x.id===bk.term)||DEP_TERMS[2],a=bkAmt(),src=Math.floor(S.bank),cap=bankCap(),used=S.dep.length,slots=depSlots(),max=Math.min(src,cap),r=depRate(t),ti=tier(),r0=depRate(t,0);
 const why=used>=slots?`Alle ${slots} plekken zijn bezet`:!a?'Vul een bedrag in':a<DEP_MIN?'Minimaal '+fmt(DEP_MIN):a>cap?'Maximaal '+fmt(cap)+' per deposito':a>src?'Niet genoeg op je spaarrekening':null;
 const run=S.dep.slice().sort((x,y)=>x.t1-y.t1);
 const cards=Array.from({length:Math.max(slots,used)},(_,i)=>{const d=run[i];
  if(!d)return `<button class="bk-slot free" onclick="act.bkNew()"><span class="label">Plek ${i+1}</span><b>Vrij</b><em>Zet geld vast tegen een vaste rente</em></button>`;
  const left=d.t1-now(),pr=Math.min(1,Math.max(0,1-left/(d.t1-d.t0))),pay=Math.round(d.a*(1+d.r)),back=Math.floor(d.a*(1-DEP_EARLY));
  return `<div class="bk-slot">
   <div class="bk-slot-h"><b>${d.n}</b><span>${pctR(d.r)} rente</span></div>
   <div class="bk-slot-v"><span class="label">Je krijgt</span><b>${fmt(pay)}</b><em>${fmt(d.a)} inleg + ${fmt(pay-d.a)} rente</em></div>
   <div class="bk-slot-p" aria-hidden="true"><i style="width:${(pr*100).toFixed(1)}%"></i></div>
   <div class="bk-slot-t"><span>${left>0?'Klaar '+bkAt(d.t1):'Wordt uitbetaald'}</span><b>${left>0?bkDur(left):'nu'}</b></div>
   ${bk.brk===d.id?`<div class="bk-brk"><span>Opzeggen kost ${Math.round(DEP_EARLY*100)}% en je krijgt geen rente: je krijgt ${fmt(back)} terug.</span><button class="btn sm" onclick="act.depBreak(${d.id})">Ja, opzeggen</button><button class="btn sm ghost" onclick="bk.brk=null;render()">Laat staan</button></div>`
    :`<button class="bk-link" onclick="bk.brk=${d.id};render()">Eerder opzeggen</button>`}</div>`}).join('');
 // per looptijd: bij VIP / High roller de gewone rente doorgestreept met jouw rente ernaast
 const terms=DEP_TERMS.map((x,i)=>{const xr=depRate(x);return `<button class="bk-term t${i} ${bk.term===x.id?'on':''}" onclick="bk.term='${x.id}';render()" aria-pressed="${bk.term===x.id}">
   <span>${x.n}</span><small class="bk-t-tag">${x.tag}</small>
   <span class="bk-t-r">${ti?`<s title="Gewone rente">${pctR(depRate(x,0))}</s>`:''}<b>${pctR(xr)}</b>${ti?`<i class="bk-t-lid ${ti>1?'hr':''}">${ti>1?'High roller':'VIP'}</i>`:''}</span>
   <em>klaar ${bkAt(now()+x.h*36e5)}</em></button>`}).join('');
 const v=a||100000;
 return `<div class="bk-sec"><h2>Jouw deposito's</h2><span>${used}/${slots} plekken</span><em>Plekken: gewoon 2, VIP 5, High roller 10${ti?` · ${lidName()}: betere rente op elk deposito`:''}</em></div>
 <div class="bk-slots">${cards}</div>
 <section class="card bk-box bk-new" id="bkNew"><h3>Nieuw deposito</h3><p class="sub">Vaste tijd, vaste rente. Het kan niet zakken en gaat daarna vanzelf naar je spaarrekening.</p>
  <div class="bk-new-g">
   <div><span class="label bk-lab">Looptijd</span><div class="bk-terms">${terms}</div>
    <span class="label bk-lab">Rente ${t.n} per lidmaatschap</span>${bkTiers(i=>pctR(depRate(t,i)))}
    <div class="bk-src"><span class="label">Betalen van</span><div class="bk-from"><span>Spaarrekening</span><b>${fmt(S.bank)}</b></div>
     <p class="bk-note">Een deposito open je met geld van je spaarrekening. Contant? <button class="ba-link" onclick="atmOpen('stort')">Stort het eerst bij de pinautomaat ›</button></p></div></div>
   <div>${bkInput(max)}
    <div class="bk-rcpt" data-bk-live>${a?'':`<p>Voorbeeld met ${fmt(v)}</p>`}
     <div><span>Inleg</span><b>${fmt(v)}</b></div><div><span>Rente ${ti?`<s>${pctR(r0)}</s> `:''}${pctR(r)}${ti?' '+(ti>1?'High roller':'VIP'):''}</span><b class="up">+${fmt(Math.round(v*r))}</b></div>
     ${ti?`<div><span>waarvan ${ti>1?'High roller':'VIP'}-voordeel</span><b class="up">+${fmt(Math.round(v*(r-r0)))}</b></div>`:''}
     <div class="tot"><span>Je krijgt terug</span><b>${fmt(Math.round(v*(1+r)))}</b></div><div><span>Klaar</span><b>${bkAt(now()+t.h*36e5)}</b></div></div>
    <button class="btn" data-bk-btn onclick="act.depOpen()" ${why?'disabled':''}>${why||'Zet '+fmt(a)+' vast voor '+t.n}</button>
    <div class="bk-mini"><span>Max per deposito <b>${fmt(cap)}</b> (groeit met je rang)</span></div></div>
  </div></section>`}

function bkInvTab(){if(!fundOf(bk.fund))bk.fund='coin';const f=fundOf(bk.fund),t=now(),gone=!!(f.coin&&t>=f.end),p=invPos(f.id),px=MK.price(f,t),a=bkAmt(),src=bkSrcBal(),cap=invCap(),room=Math.max(0,cap-invCost()),fee=invFee(f);
 const tv=invTotal(),tc=invCost(),pl=tv-tc;
 const cards=MK.FUNDS.map(x=>{const s0=MK.price(x,t-DAYMS),s1=MK.price(x,t),ch=s1/s0-1,v=invVal(x.id);
  return `<button class="bk-fund ${bk.fund===x.id?'on':''}" style="--fc:${x.col}" onclick="bk.fund='${x.id}';render()">
   <div class="bk-f-h"><b>${x.n}</b><span>${x.s}</span></div>${bkSpark(x)}
   <div class="bk-f-v"><span>${fmtPx(s1)}</span><em class="${ch>=0?'up':'dn'}">${pctNl(ch)}</em></div>
   <div class="bk-f-m">${riskPips(x.risk)}<span>${x.kind} ±${nl((Math.exp(24*x.y)-1)*100,1)}%/dag</span></div>
   ${v?`<div class="bk-f-own">Jij: <b>${fmt(v)}</b></div>`:''}</button>`}).join('');
 const cs=MK.coins(t),nx=MK.nextCoin(t);
 const ccards=cs.map(x=>{const end=t>=x.end,s1=MK.price(x,t),ch=s1/x.base-1,v=invVal(x.id),age=Math.min(t,x.end)-x.t0;
  return `<button class="bk-fund bk-coin ${bk.fund===x.id?'on':''} ${end?'gone '+x.endKind:''}" style="--fc:${x.col}" onclick="bk.fund='${x.id}';render()">
   <div class="bk-f-h"><b>${x.n}</b><span>${x.s}</span></div>${bkSpark(x)}
   <div class="bk-f-v"><span>${end&&x.endKind==='scam'?'€0':fmtPx(s1)}</span><em class="${ch>=0?'up':'dn'}">${end&&x.endKind==='scam'?'−100%':pctNl(ch)}</em></div>
   <div class="bk-f-m">${end?`<i class="bk-cst ${x.endKind}">${x.endKind==='scam'?'Scam · van de markt':'Naar de grote beurs'}</i>`:`<i class="bk-cst new">${age<4*36e5?'Nieuw':'Live'}</i><span>${bkDur(age)} op de markt</span>`}</div>
   ${v?`<div class="bk-f-own">Jij: <b>${fmt(v)}</b></div>`:''}</button>`}).join('');
 const pv=p?p.u*px:0,ppl=p?pv-p.c:0;
 const why=gone?(f.endKind==='scam'?'Dit was een scam: van de markt':'Van de markt: naar de grote beurs'):!a?'Vul een bedrag in':a<INV_MIN?'Minimaal '+fmt(INV_MIN):a>room?(room?'Je kunt nog '+fmt(room)+' inleggen':'Je zit aan het maximum van '+fmt(cap)+' ('+LID_N[tier()]+')'):a>src?'Niet genoeg op je '+(bk.src==='bank'?'spaarrekening':'contant'):null;
 const rk=FUND_RISK[f.id]||[null,null];
 return `${tc?`<div class="bk-port"><div><span class="label">Jouw portefeuille</span><b>${fmt(tv)}</b></div><div><span class="label">Ingelegd</span><b>${fmt(tc)}</b></div><div><span class="label">Winst / verlies</span><b class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))} <small>${pctNl(pl/tc)}</small></b></div></div>`:''}
 <div class="bk-funds">${cards}</div>
 <div class="bk-sec bk-coins-h"><h2>Nieuwe coins</h2><span>volgende over ${bkDur(nx-t)}</span><em>Elke 4 uur komt er een nieuwe coin. Een memecoin kan 10× tot 50× stijgen, maar kan ook elk moment een scam blijken: dan is hij weg en je inleg ook. Echte coins gaan na 2 dagen naar de grote beurs.</em></div>
 ${cs.length?`<div class="bk-funds bk-coins">${ccards}</div>`:`<p class="bk-note">Er staat nu geen nieuwe coin op de markt. De volgende komt over ${bkDur(nx-t)}.</p>`}
 <div class="bk-inv">
  <section class="card bk-box"><div class="bk-f-title"><div><h3>${f.n}</h3><p class="sub">${f.d}</p></div>${riskPips(f.risk)}</div>
   ${bkChart(f)}
   ${f.coin?`<div class="bk-facts"><div><span>Uitkering</span><b>Geen</b><i>alleen de koers telt</i></div>
    <div><span>${gone?'Status':'Op de markt'}</span><b>${gone?(f.endKind==='scam'?'Scam, van de markt':'Naar de grote beurs'):bkDur(t-f.t0)}</b><i>${gone?(f.endKind==='scam'?'wie erin zat, is alles kwijt':'stukken zijn verkocht tegen de laatste koers'):'echt of meme? kijk naar de naam en de grafiek'}</i></div>
    <div><span>Kosten</span><b>${nl(fee*100,2)}% bij kopen en verkopen</b><i>${isVip()?lidName()+': '+Math.round(tierK()*100)+'% minder kosten':'VIP −15%, High roller −40%'}</i></div></div>`:`<div class="bk-facts"><div><span>${f.kind}</span><b>±${nl((Math.exp(24*f.y)-1)*100,1)}% per dag</b><i>bovenop de koers, ook offline (tot 12 uur)</i></div>
    <div><span>Kans op verlies</span><b>${rk[0]}% na 24 uur</b><i>${rk[1]}% na 7 dagen</i></div>
    <div><span>Kosten</span><b>${nl(fee*100,2)}% bij kopen en verkopen</b><i>${isVip()?lidName()+': '+Math.round(tierK()*100)+'% minder kosten':'VIP −15%, High roller −40%'}</i></div></div>`}</section>
  <section class="card bk-box"><h3>Jouw positie</h3>
   ${p?`<div class="bk-rows"><div><span>Waarde</span><b>${fmt(pv)}</b></div><div><span>Ingelegd</span><b>${fmt(p.c)}</b></div>
    <div><span>Winst / verlies</span><b class="${ppl>=0?'up':'dn'}">${ppl>=0?'+':'−'}${fmt(Math.abs(ppl))} (${pctNl(ppl/p.c)})</b></div>${f.coin?'':`<div><span>Ontvangen ${f.kind.toLowerCase()}</span><b class="up">+${fmt(p.paid||0)}</b></div>`}</div>
    <div class="bk-sell">${[[.25,'25%'],[.5,'50%'],[1,'Alles']].map(([q,l])=>`<button class="btn sm ${q===1?'':'ghost'}" onclick="act.invSell(${q})" ${gone?'disabled':''}>Verkoop ${l} <small>${fmt(pv*q*(1-fee))}</small></button>`).join('')}</div>`
    :`<p class="sub">${f.coin?(gone?(f.endKind==='scam'?'Dit was een scam. De makers zijn er met het geld vandoor en de coin is van de markt gehaald.':'Deze coin is naar de grote beurs gegaan.'):'Je hebt nog niets in deze coin. Hij kan hard stijgen, maar ook ineens naar nul gaan.'):'Je hebt nog niets in dit fonds. Wat je koopt groeit met de uitkering mee, maar de koers kan ook zakken.'}</p>`}
   <div class="bk-buy">${bkSrc()}${bkInput(Math.min(src,room),'Kopen voor')}
    <div class="bk-sum" data-bk-live>${a?`Je krijgt ${nl(a*(1-fee)/px,px<1?0:px<10?2:4)} stukken à ${fmtPx(px)} (kosten ${fmt(a*fee)}).`:`Nog in te leggen: <b>${fmt(room)}</b> van ${fmt(cap)} in totaal (groeit met je rang; VIP ×3, High roller ×10).`}</div>
    <button class="btn" data-bk-btn onclick="act.invBuy()" ${why?'disabled':''}>${why||'Koop '+f.s+' voor '+fmt(a)}</button></div>
   <p class="bk-note">Verkopen gaat naar je spaarrekening. Koersen zijn voor iedereen hetzelfde en lopen door als je offline bent.</p></section></div>`}

// ---------- Bank-app ----------
// De bank als app: bovenaan je totaal met je bankpas en snelknoppen, daaronder tabbladen (Overzicht, Rekening, Deposito's, Beleggen).
// Storten en opnemen gaan via de pinautomaat, die als venster over de app heen opent.
const BA_IC={
 home:'<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>',
 rek:'<ellipse cx="11.2" cy="12.6" rx="7.4" ry="5.6"/><path d="M18.3 10.9h2.2v3.4h-2.2"/><path d="M8.6 7.6l.9-2.8 2.6 2.2"/><path d="M7.6 17.4V20M14.8 17.4V20"/><path d="M3.9 11.4c-1.3-.1-2-1-1.7-2.1"/><path d="M9.6 9.6h3.4"/><circle cx="15.6" cy="11.4" r=".75" fill="currentColor" stroke="none"/>',
 dep:'<rect x="3.5" y="4" width="17" height="15" rx="1.5"/><circle cx="12" cy="11.5" r="4"/><path d="M12 9.5v2l1.4 1.2M6 19v2M18 19v2"/>',
 inv:'<path d="M3 3v18h18"/><path d="M6.5 15.5l4-4.5 3 3L20 6.5"/><path d="M15.5 6.5H20V11"/>',
 in:'<path d="M12 3v9.5M8 8.5l4 4 4-4"/><rect x="3" y="15.5" width="18" height="5" rx="1.5"/>',
 out:'<path d="M12 13V3.5M8 7.5l4-4 4 4"/><rect x="3" y="15.5" width="18" height="5" rx="1.5"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/><path d="M12 14.5v2.5"/>',
 unlock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 6.8-1.2"/><path d="M12 14.5v2.5"/>',
 atm:'<rect x="4" y="2.5" width="16" height="19" rx="2"/><rect x="7" y="5.5" width="10" height="6" rx="1"/><path d="M8 15h.01M12 15h.01M16 15h.01M8 18.5h8"/>',
 car:'<path d="M5 15.5l1.6-5h10.8l1.6 5"/><rect x="3.5" y="15.5" width="17" height="4" rx="1.2"/><path d="M7 19.5v1.5M17 19.5v1.5M7.5 13h.01M16.5 13h.01"/>',
 pay:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 9.5h18M7 14.5h4"/>',
 cash:'<rect x="2.5" y="6.5" width="19" height="11" rx="1.5"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>'};
const baI=id=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BA_IC[id]}</svg>`;
const BA_LOGO='<svg viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="baLg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9f0ff"/><stop offset=".55" stop-color="#a9dcff"/><stop offset="1" stop-color="#7d86ff"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#baLg)"/><circle cx="16" cy="16" r="8" fill="none" stroke="#0b1424" stroke-width="2.4"/><circle cx="16" cy="16" r="2.4" fill="#0b1424"/><path d="M16 8v3M16 21v3M8 16h3M21 16h3" stroke="#0b1424" stroke-width="2.4" stroke-linecap="round"/></svg>';
// transacties: alles wat er op je spaarrekening gebeurt (laatste 30). d = verschil op je spaarrekening, a = bedrag als het niet van je spaarrekening ging
function bkTx(k,d,n,a){if(typeof S==='undefined'||!S)return;if(!Array.isArray(S.bkTx))S.bkTx=[];const e={t:now(),k,d:Math.round(d||0)};if(n)e.n=String(n).slice(0,60);if(a)e.a=Math.round(a);S.bkTx.unshift(e);if(S.bkTx.length>30)S.bkTx.length=30}
const BK_TXK={in:['Storting','Pinautomaat','in'],out:['Opname','Pinautomaat','out'],dep:['Deposito vastgezet','','lock'],depin:['Deposito uitbetaald','','unlock'],depbrk:['Deposito opgezegd','','unlock'],
 buy:['Belegging gekocht','','inv'],sell:['Belegging verkocht','','inv'],car:['Auto verkocht','','car'],pay:['Betaling','','pay']};
const bkWhen=t=>{const d=new Date(t),n=new Date(now()),s=(now()-t)/1000,hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 if(s<60)return 'zojuist';if(s<3600)return Math.floor(s/60)+' min geleden';if(d.toDateString()===n.toDateString())return 'vandaag '+hm;
 const y=new Date(n.getFullYear(),n.getMonth(),n.getDate()-1);return d.toDateString()===y.toDateString()?'gisteren '+hm:d.toLocaleDateString('nl-NL',{day:'numeric',month:'short'})+' '+hm};
function bkTxList(n){const L=(S.bkTx||[]).slice(0,n);
 if(!L.length)return `<div class="ba-tx-none">${baI('pay')}<b>Nog geen transacties</b><span>Stort geld bij de pinautomaat, dan zie je het hier.</span></div>`;
 return `<ul class="ba-tx">${L.map(x=>{const m=BK_TXK[x.k]||['Transactie','','pay'],v=x.d||x.a||0,cl=x.d>0?'up':x.d<0?'dn':'nt';
  return `<li><span class="ba-tx-ic k-${x.k}">${baI(m[2])}</span><span class="ba-tx-t"><b>${m[0]}</b><em>${esc(x.n||m[1])}${x.n||m[1]?' · ':''}${bkWhen(x.t)}</em></span><b class="ba-tx-a ${cl}">${x.d>0?'+':x.d<0?'−':''}${fmt(Math.abs(v))}</b></li>`}).join('')}</ul>`}
// vast rekeningnummer en pasnummer per speler (afgeleid van je naam)
const bkHash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const bkIban=()=>{const h=bkHash(S.name||'x'),n=String(h%1e10).padStart(10,'0');return 'NL'+String(10+h%89)+' ONDB '+n.slice(0,4)+' '+n.slice(4,8)+' '+n.slice(8)};
// wat er per uur vanzelf bijkomt: spaarrente, uitkering op beleggingen en rente op lopende deposito's
const bkPerHour=()=>S.bank*savRate()+MK.FUNDS.reduce((a,f)=>a+invVal(f.id)*(Math.exp(f.y)-1),0)+(S.dep||[]).reduce((a,d)=>a+d.a*d.r/d.h,0);
function bkCard(){const h=bkHash((S.name||'x')+':pas'),ti=tier(),yy=String((new Date(now()).getFullYear()+3)%100).padStart(2,'0'),mm=String(1+h%12).padStart(2,'0');
 return `<div class="ba-card c${ti}" aria-hidden="true">
  <div class="ba-card-t"><span class="ba-card-b">ONDER<b>BANK</b></span><span class="ba-card-tier">${LID_N[ti]}</span></div>
  <div class="ba-card-m"><i class="ba-chip"></i><svg class="ba-nfc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M8 8.5a5 5 0 0 1 0 7M11.5 6a8.5 8.5 0 0 1 0 12M15 3.5a12 12 0 0 1 0 17"/></svg></div>
  <span class="ba-card-no">•••• •••• •••• ${String(h%1e4).padStart(4,'0')}</span>
  <div class="ba-card-f"><span><small>Naam</small><b data-fit="8">${esc(S.name)}</b></span><span><small>Geldig tot</small><b>${mm}/${yy}</b></span></div></div>`}
function bkHero(){const sv=S.bank,dp=depTotal(),iv=invTotal(),all=sv+dp+iv,tot=all||1,ph=bkPerHour(),h=new Date(now()).getHours(),gr=h<6?'Goedenacht':h<12?'Goedemorgen':h<18?'Goedemiddag':'Goedenavond';
 const qa=(ic,lab,sub,fn,c)=>`<button class="ba-qa" style="--c:${c}" onclick="${fn}"><span class="ba-qa-ic">${baI(ic)}</span><span class="ba-qa-t"><b>${lab}</b><small>${sub}</small></span></button>`;
 return `<section class="ba-hero">
  <div class="ba-hero-l">
   <div class="ba-brand"><span class="ba-logo">${BA_LOGO}</span><span class="ba-bn">Onder<b>Bank</b></span><span class="ba-hi">${gr}, <b>${esc(S.name)}</b></span></div>
   <span class="label">Totaal bij de bank</span>
   <b class="ba-total" data-fit="24">${fmt(all)}</b>
   <span class="ba-sub">${ph>=.5?`<em class="up">+${fmt(ph)}</em> per uur aan rente en uitkering`:'Zet geld op de bank: het groeit elke minuut'}</span>
   <div class="bk-dist" aria-hidden="true"><i style="width:${sv/tot*100}%;background:var(--ice)"></i><i style="width:${dp/tot*100}%;background:var(--violet)"></i><i style="width:${iv/tot*100}%;background:var(--acc)"></i></div>
   <div class="ba-leg"><span><i style="background:var(--ice)"></i>Spaar <b>${fmt(sv)}</b></span><span><i style="background:var(--violet)"></i>Deposito's <b>${fmt(dp)}</b></span><span><i style="background:var(--acc)"></i>Beleggen <b>${fmt(iv)}</b></span></div>
  </div>
  <div class="ba-hero-r">${bkCard()}</div>
  <div class="ba-qas">
   ${qa('in','Storten','wit geld op zak',"atmOpen('stort')",'#3fe395')}
   ${qa('out','Opnemen','naar contant',"atmOpen('opnem')",'#a9dcff')}
   ${qa('lock','Vastzetten','deposito',"act.bkTab('dep',1)",'#b8a1ff')}
   ${qa('inv','Beleggen','koersen',"act.bkTab('inv')",'#ff7a1a')}
  </div></section>`}
// waarde van je beleggingen over de laatste 24 uur (met je huidige stukken)
function bkPortSpark(){const own=invIds().map(fundOf).filter(f=>f&&invVal(f.id)>0);if(!own.length)return '';const n=48,t=now(),sum=new Array(n).fill(0);
 own.forEach(f=>{const s=MK.series(f,t,DAYMS,n),u=invPos(f.id).u;s.forEach((v,i)=>{sum[i]+=v*u})});
 const mn=Math.min(...sum),mx=Math.max(...sum),k=mx-mn||1,up=sum[n-1]>=sum[0],d=sum.map((v,i)=>(i?'L':'M')+(i/(n-1)*100).toFixed(2)+','+(30-(v-mn)/k*27).toFixed(2)).join('');
 return `<svg class="ba-spark ${up?'up':'dn'}" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L100,32L0,32Z" class="a"/><path d="${d}" class="l"/></svg>`}
function bkHome(){const sv=S.bank,dp=depTotal(),iv=invTotal(),tc=invCost(),pl=iv-tc,run=S.dep.slice().sort((x,y)=>x.t1-y.t1),nx=run[0],nf=invIds().filter(id=>invVal(id)>0).length;
 const pr=nx?Math.min(1,Math.max(0,(now()-nx.t0)/(nx.t1-nx.t0))):0;
 const head=(tab,ic,n,s)=>`<button class="ba-acct-h" onclick="act.bkTab('${tab}')"><span class="ba-acct-ic">${baI(ic)}</span><span class="ba-acct-n"><b>${n}</b><small>${s}</small></span><i aria-hidden="true">›</i></button>`;
 return `<div class="ba-accts">
  <article class="ba-acct" style="--c:#a9dcff">${head('rek','rek','Spaarrekening',bkIban())}
   <b class="ba-acct-v" data-fit="18">${fmt(sv)}</b>
   <span class="ba-acct-s"><em class="up">+${fmt(sv*savRate())}</em> per uur · ${nl(savRate()*100,2)}% rente per uur</span>
   <div class="ba-acct-a"><button onclick="atmOpen('stort')">${baI('in')}Storten</button><button onclick="atmOpen('opnem')">${baI('out')}Opnemen</button></div></article>
  <article class="ba-acct" style="--c:#b8a1ff">${head('dep','dep',"Deposito's",S.dep.length+' van '+depSlots()+' plekken')}
   <b class="ba-acct-v" data-fit="18">${fmt(dp)}</b>
   ${nx?`<span class="ba-acct-s">Eerste klaar ${bkAt(nx.t1)}: <em>${fmt(Math.round(nx.a*(1+nx.r)))}</em></span><div class="ba-prog" aria-hidden="true"><i style="width:${(pr*100).toFixed(1)}%"></i></div>`
    :`<span class="ba-acct-s">Vaste rente, tot ${pctR(depRate(DEP_TERMS[3]))} in 3 speldagen. Kan niet zakken.</span>`}
   <div class="ba-acct-a"><button onclick="act.bkTab('dep',1)">${baI('lock')}Nieuw deposito</button></div></article>
  <article class="ba-acct" style="--c:#ff7a1a">${head('inv','inv','Beleggen',nf?nf+(nf>1?' fondsen':' fonds'):MK.FUNDS.length+' fondsen')}
   <b class="ba-acct-v" data-fit="18">${fmt(iv)}</b>
   <span class="ba-acct-s">${tc?`<em class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))} (${pctNl(pl/tc)})</em> sinds aankoop`:'Van veilig tot wild. Koersen kunnen ook dalen.'}</span>
   ${bkPortSpark()}
   <div class="ba-acct-a"><button onclick="act.bkTab('inv')">${baI('inv')}${tc?'Naar je beleggingen':'Begin met beleggen'}</button></div></article>
 </div>
 <div class="ba-row">
  <section class="ba-panel"><div class="ba-ph"><h3>Transacties</h3>${(S.bkTx||[]).length>6?`<button class="ba-link" onclick="act.bkTab('rek')">Alles bekijken ›</button>`:''}</div>${bkTxList(6)}</section>
  <section class="ba-panel ba-cash"><div class="ba-ph"><h3>Op zak</h3><span class="ba-badge warn">Niet veilig</span></div>
   <div class="ba-cash-r"><i style="background:var(--wit)"></i><span>Wit geld</span><b>${fmt(wit())}</b></div>
   <div class="ba-cash-r"><i style="background:var(--zw)"></i><span>Zwart geld</span><b>${fmt(zwart())}</b></div>
   <p class="bk-note">Contant geld kun je kwijtraken als je gepakt wordt. Op de bank staat het veilig en krijg je elke minuut rente. De bank neemt alleen wit geld aan.</p>
   <div class="ba-cash-a"><button class="btn" onclick="atmOpen('stort')">Storten bij de pinautomaat</button>${zwart()>=1?`<a class="btn ghost" href="#wit">Zwart geld witwassen</a>`:''}</div></section>
 </div>`}
function bkRek(){const r=savRate();
 return `<div class="ba-rek">
  <section class="ba-panel ba-rek-main" style="--c:#a9dcff"><div class="ba-ph"><h3>Spaarrekening</h3><span class="ba-badge">Vrij opneembaar</span></div>
   <span class="ba-iban">${bkIban()} · ${esc(S.name)}</span>
   <b class="ba-big" data-fit="22">${fmt(S.bank)}</b>
   <div class="ba-acct-a big"><button class="in" onclick="atmOpen('stort')">${baI('in')}Storten</button><button onclick="atmOpen('opnem')">${baI('out')}Opnemen</button></div>
   <div class="bk-rate"><b>${nl(r*100,2)}%</b><span>per uur · ±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag${isVip()?' · '+lidName():''}</span></div>
   ${bkTiers(i=>nl(SAV_RATE*BANK_T[i]*100,2)+'%','per uur')}
   <div class="bk-rows"><div><span>Nu per uur</span><b class="up">+${fmt(S.bank*r)}</b></div><div><span>Na 24 uur</span><b>${fmt(S.bank*Math.pow(1+r,24))}</b></div></div>
   <div class="bk-cmp"><span class="label">Vergelijk</span>
    <div><span>Spaarrekening</span><em>±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag</em><i>vrij opneembaar</i></div>
    <div><span>Deposito 3 speldagen</span><em>${pctR(depRate(DEP_TERMS[3]))}</em><i>vast, kan niet zakken</i></div>
    <div><span>Beleggen</span><em>±5% tot 15% per dag</em><i>kan ook flink dalen</i></div></div></section>
  <section class="ba-panel"><div class="ba-ph"><h3>Transacties</h3><span class="ba-cnt">laatste ${Math.min(30,(S.bkTx||[]).length)}</span></div>${bkTxList(30)}</section>
 </div>`}
// ---------- Pinautomaat als venster ----------
function atmHtml(){const sv=S.bank,dp=depTotal(),iv=invTotal(),tot=sv+dp+iv||1;
 return `<div class="atm">
   <div class="atm-top"><span class="atm-logo">ONDER<b>BANK</b></span><span class="atm-led"></span></div>
   <div class="atm-screen ${atm.mode&&!atm.done?'in':''}" id="atmScr">${atmScreen(sv,dp,iv,tot)}</div>
   ${atmPad()}
   <div class="atm-slot" aria-hidden="true"><i></i><span class="atm-bills"><i></i><i></i><i></i></span></div></div>`}
function atmOpen(m){if(!S.dep)S.dep=[];if(!S.inv)S.inv={};let ov=document.getElementById('bkAtm');
 if(!ov){ov=document.createElement('div');ov.id='bkAtm';ov.className='ba-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Pinautomaat');document.body.appendChild(ov)}
 atm.open=true;atm.mode=m||null;atm.amt='';atm.done=null;
 ov.innerHTML=`<div class="ba-ov-bg" onclick="atmClose()"></div><div class="ba-ov-box">
  <div class="ba-ov-h"><span>${baI('atm')}Pinautomaat</span><button class="ba-x" onclick="atmClose()" aria-label="Pinautomaat sluiten">${baI('x')}</button></div>
  ${atmHtml()}<p class="ba-ov-tip">Typ met je toetsenbord of klik op de toetsen · Enter = OK · Esc = terug</p></div>`;
 document.body.classList.add('ba-lock');requestAnimationFrame(()=>{ov.classList.add('open');fitText(ov)});try{SFX.chip()}catch(e){}
 setTimeout(()=>{const i=document.getElementById('atmIn');if(i&&matchMedia('(pointer:fine)').matches)i.focus({preventScroll:true})},60)}
function atmClose(quiet){const ov=document.getElementById('bkAtm');atm.open=false;atm.mode=null;atm.amt='';atm.done=null;document.body.classList.remove('ba-lock');
 if(ov){ov.classList.remove('open');setTimeout(()=>{if(!atm.open&&ov.parentNode)ov.remove()},230)}if(!quiet&&typeof page!=='undefined'&&page==='bank')render()}

V.bank=()=>{if(!S.dep)S.dep=[];if(!S.inv)S.inv={};depFix();
 const TABS=[['home','Overzicht','home'],['rek','Rekening','rek'],['dep',"Deposito's",'dep'],['inv','Beleggen','inv']];
 return `<h1 class="sr">Bank</h1>
 <div class="ba">${bkHero()}
  <nav class="ba-tabs" role="tablist" aria-label="Bank">${TABS.map(([id,l,ic])=>`<button role="tab" aria-selected="${bk.tab===id}" class="${bk.tab===id?'on':''}" onclick="act.bkTab('${id}')">${baI(ic)}<span>${l}</span></button>`).join('')}</nav>
  <div class="ba-body t-${bk.tab}">${bk.tab==='dep'?bkDepTab():bk.tab==='inv'?bkInvTab():bk.tab==='rek'?bkRek():bkHome()}</div>
 </div>`};

Object.assign(act,{
 bkSet(v){bk.amt=v>0?String(Math.floor(v)):'';render()},
 bkTab(t,toNew){bk.tab=t;bk.brk=null;if(t!=='rek'&&bk.src==='bank'&&S.bank<1&&S.cash>=1)bk.src='cash';render();if(toNew)setTimeout(()=>act.bkNew(),30)},
 bkDep(){const a=Math.min(bkAmt(),Math.floor(wit()));if(a<=0){toast(zwart()>=1?'De bank neemt geen zwart geld aan. Was het eerst wit (Witwassen).':'Geen contant geld om te storten','bad');return}spendWit(a);S.bank+=a;bkTx('in',a);toast(fmt(a)+' gestort');bk.amt='';save();render()},
 // in één klik al je contante geld veilig op de spaarrekening
 bkAll(){const a=Math.floor(wit());if(a<=0){toast(zwart()>=1?'De bank neemt geen zwart geld aan. Was het eerst wit (Witwassen).':'Geen contant geld om te storten','bad');return}spendWit(a);S.bank+=a;bkTx('in',a);toast(fmt(a)+' gestort op je spaarrekening','ok');bk.amt='';save();render()},
 // naar het formulier voor een nieuw deposito en meteen in het bedrag
 bkNew(){const el=document.getElementById('bkNew');if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{const i=el.querySelector('input');if(i)i.focus({preventScroll:true})},380)},
 bkQuick(v){bk.amt=String(Math.floor(v));act.bkWd()},
 bkWd(){const a=Math.min(bkAmt(),Math.floor(S.bank));if(a<=0){toast('Er staat niets op je spaarrekening','bad');return}S.bank-=a;S.cash+=a;bkTx('out',-a);toast(fmt(a)+' opgenomen');bk.amt='';save();render()},
 depOpen(){const t=DEP_TERMS.find(x=>x.id===bk.term),a=bkAmt();if(!t||S.dep.length>=depSlots()||a<DEP_MIN||a>bankCap()||a>Math.floor(S.bank))return;
  S.bank-=a;const r=depRate(t),id=now();
  S.dep.push({id,n:t.n,h:t.h,a,r,t0:id,t1:id+t.h*36e5,v:2});bkTx('dep',-a,t.n+' · '+pctR(r)+' rente');toast(fmt(a)+' vastgezet voor '+t.n+': je krijgt '+fmt(Math.round(a*(1+r))),'ok');log('Deposito '+t.n+': '+fmt(a)+' tegen '+pctR(r),'info');bk.amt='';save();render()},
 depBreak(id){const d=S.dep.find(x=>x.id===id);if(!d)return;const back=Math.floor(d.a*(1-DEP_EARLY));S.dep=S.dep.filter(x=>x.id!==id);S.bank+=back;bkTx('depbrk',back,d.n+' · 2% kosten, geen rente');bk.brk=null;
  toast('Deposito opgezegd: '+fmt(back)+' terug op je spaarrekening','bad');log('Deposito opgezegd: '+fmt(back)+' terug','info');save();render()},
 invBuy(){const f=fundOf(bk.fund),a=bkAmt();if(!f||(f.coin&&now()>=f.end))return;const p=S.inv[f.id]||{u:0,c:0,paid:0,bp:0},room=invCap()-invCost();
  if(a<INV_MIN||a>room||a>bkSrcBal())return;const px=MK.price(f,now()),u=a*(1-invFee(f))/px;
  if(bk.src==='bank')S.bank-=a;else spendWit(a);p.bp=(p.bp*p.u+px*u)/(p.u+u);p.u+=u;p.c+=a;S.inv[f.id]=p;bkTx('buy',bk.src==='bank'?-a:0,f.n+(bk.src==='bank'?'':' · contant'),a);
  toast('Gekocht: '+f.s+' voor '+fmt(a),'ok');log(f.n+' gekocht voor '+fmt(a)+' à '+fmtPx(px),'info');bk.amt='';save();render()},
 invSell(q){const f=fundOf(bk.fund),p=f&&S.inv[f.id];if(!p||p.u<=0||(f.coin&&now()>=f.end))return;q=Math.min(1,Math.max(0,q));const px=MK.price(f,now()),u=p.u*q,got=u*px*(1-invFee(f)),cost=p.c*q,res=got-cost;
  p.u-=u;p.c-=cost;p.paid=(p.paid||0)*(1-q);if(q>=1||p.u<=1e-9)delete S.inv[f.id];S.bank+=got;bkTx('sell',got,f.n+' · '+(res>=0?'winst ':'verlies ')+fmt(Math.abs(res)));
  toast(f.s+' verkocht: '+fmt(got)+' ('+(res>=0?'+':'−')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');log(f.n+' verkocht voor '+fmt(got)+' ('+(res>=0?'winst ':'verlies ')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');save();render()}
});
