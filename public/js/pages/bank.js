// Tab: Bank — spaarrekening, deposito's en beleggen (koersen: market.js)
// Spaarrekening: veilig en vrij opneembaar, lage rente. Deposito: vaste tijd, vaste rente, kan niet zakken.
// Beleggen: uitkering per uur (rente, huur, dividend, staking) plus een koers die kan stijgen én dalen.
// Alles bij de bank ben je niet kwijt als je gepakt wordt. Maximaal bedrag per deposito groeit met je rang; beleggen heeft een totaalplafond per lidmaatschap.
const SAV_RATE=.001; // per uur; rente per lidmaatschap ×BANK_T (gewoon 0,10%, VIP 0,12%, High roller 0,15% per uur), kosten −15% / −40%
// Per lidmaatschap: aantal depositoplekken (2 / 5 / 10) en hoeveel je in totaal kunt beleggen (€10.000 / €30.000 / €100.000)
const BANK_T=[1,1.2,1.5],DEP_SLOTS_T=[2,5,10],INV_CAP_T=[10000,30000,100000],LID_N=['Gewoon','VIP','High roller'];
// Deposito's: 2 / 4 / 8 / 12 uur. Rente per looptijd voor gewoon / VIP / High roller (VIP ±15%, High roller ±32% beter).
// Langer vast = iets meer rente per uur (0,15% tot 0,18% per uur bij gewoon, spaarrekening 0,10%), maar nooit zo veel
// dat deposito's grinden loont: twee keer 12 uur per dag is gewoon ±4,4% per dag, VIP ±5%, High roller ±5,9%.
const DEP_TERMS=[
 {id:'2u',h:2,r:[.003,.0035,.004],n:'2 uur',tag:'Even parkeren'},
 {id:'4u',h:4,r:[.0065,.0075,.0085],n:'4 uur',tag:'Middagje'},
 {id:'8u',h:8,r:[.014,.016,.0185],n:'8 uur',tag:'Een nacht'},
 {id:'12u',h:12,r:[.022,.025,.029],n:'12 uur',tag:'Meeste rente'}];
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
const invCap=()=>INV_CAP_T[tier()]||INV_CAP_T[0];
// een rijtje per lidmaatschap, met het jouwe gemarkeerd
const bkTiers=(f,suf)=>`<div class="bk-tiers">${LID_N.map((n,i)=>`<span class="${i===tier()?'on':''}"><i>${n}</i><b>${f(i)}</b>${suf?`<em>${suf}</em>`:''}</span>`).join('')}</div>`;
const invFee=f=>f.fee*(1-tierK())*(1-sk('handel')*SK.handel.fee/100);
const fundOf=id=>MK.FUNDS.find(f=>f.id===id);
const invPos=id=>(S.inv||{})[id];
const invVal=id=>{const p=invPos(id);return p&&p.u>0?p.u*MK.price(id,now()):0};
const invTotal=()=>MK.FUNDS.reduce((a,f)=>a+invVal(f.id),0);
const invCost=()=>MK.FUNDS.reduce((a,f)=>a+((invPos(f.id)||{}).c||0),0);
const depTotal=()=>(S.dep||[]).reduce((a,d)=>a+d.a,0);
const bankNet=()=>S.bank+depTotal()+invTotal();
const nl=(v,d)=>v.toLocaleString('nl-NL',{minimumFractionDigits:d,maximumFractionDigits:d});
const pctNl=(v,d=1)=>(v>=0?'+':'−')+nl(Math.abs(v*100),d)+'%';
const fmtPx=v=>'€'+nl(v,v<10?3:2);
const bkDur=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'u '+String(m).padStart(2,'0')+'m':m+'m '+String(s%60).padStart(2,'0')+'s'};
// wanneer iets klaar is: "om 16:42", "morgen 09:10" of "za 14:05"
const bkAt=t=>{const d=new Date(t),n=new Date(now()),hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 if(d.toDateString()===n.toDateString())return 'om '+hm;const m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1);
 return d.toDateString()===m.toDateString()?'morgen '+hm:d.toLocaleDateString('nl-NL',{weekday:'short'}).replace('.','')+' '+hm};
const BK_ARROWS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h15l-4-4M20 16H5l4 4"/></svg>';
// kans op verlies na 24 uur en na 7 dagen (doorgerekend met de echte koersen, inclusief kosten)
const FUND_RISK={oblig:[0,0],vast:[13,0],haven:[30,1],coin:[37,9]};
const DAYMS=864e5;

// elke minuut: spaarrente, uitkering op beleggingen en deposito's die klaar zijn
function bankTick(mins){if(!S.dep)S.dep=[];if(!S.inv)S.inv={};depFix();
 S.bank*=Math.pow(1+savRate(),mins/60);
 const t=now();MK.FUNDS.forEach(f=>{const p=S.inv[f.id];if(p&&p.u>0){const g=Math.exp(f.y*mins/60)-1;p.paid=(p.paid||0)+p.u*g*MK.price(f,t);p.u*=1+g}});
 const done=S.dep.filter(d=>d.t1<=t);
 if(done.length){S.dep=S.dep.filter(d=>d.t1>t);done.forEach(d=>{const pay=Math.round(d.a*(1+d.r));S.bank+=pay;log('Deposito '+d.n+' uitbetaald: '+fmt(pay),'ok');toast('Deposito klaar: '+fmt(pay)+' staat op je spaarrekening','ok')})}}

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
   <div class="atm-opts two"><button onclick="atmGo('${d.k}')">Nog een keer</button><button onclick="atmGo(null)">Terug naar het menu</button></div>`}
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
 return `<div class="atm-pad" aria-label="Toetsen">${[1,2,3].map(n=>k(n,`atmKey('${n}')`,'',!on)).join('')}${k('Stop<small>terug</small>','atmGo(null)','stop',!atm.mode&&!atm.done)}
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
 if(k==='opnem'){S.bank-=a;S.cash+=a;log(fmt(a)+' opgenomen bij de pinautomaat','info')}else{spendWit(a);S.bank+=a;log(fmt(a)+' gestort bij de pinautomaat','info')}
 try{SFX.win(2)}catch(e){}atm.done={k,a};atm.amt='';save();render();const sl=document.querySelector('.atm-slot');if(sl){sl.classList.remove('go');void sl.offsetWidth;sl.classList.add('go',k==='opnem'?'out':'in')}}
// toetsenbord: cijfers, Backspace, Enter en Escape als de automaat open staat (niet als je in een ander veld typt)
document.addEventListener('keydown',e=>{if(typeof page==='undefined'||page!=='bank'||!atm.mode||atm.done)return;const t=e.target;if(t&&t.id!=='atmIn'&&/INPUT|TEXTAREA|SELECT/.test(t.tagName))return;if(t&&t.id==='atmIn'&&e.key!=='Escape')return;
 if(/^[0-9]$/.test(e.key)){e.preventDefault();atmKey(e.key)}else if(e.key==='Backspace'){e.preventDefault();atmKey('back')}else if(e.key==='Enter'){e.preventDefault();atmOk()}else if(e.key==='Escape'){e.preventDefault();atmGo(null)}});
window.addEventListener('hashchange',()=>{if(location.hash!=='#bank'){atm.mode=null;atm.amt='';atm.done=null}});
const bk={tab:'rek',amt:'',src:'bank',term:'8u',fund:'coin',rng:'24u',brk:null};
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

function bkSpark(f){const s=MK.series(f,now(),DAYMS,48),mn=Math.min(...s),mx=Math.max(...s),k=mx-mn||1,up=s[s.length-1]>=s[0];
 const d=s.map((v,i)=>(i?'L':'M')+(i/(s.length-1)*100).toFixed(2)+','+(28-(v-mn)/k*26).toFixed(2)).join('');
 return `<svg class="bk-spark ${up?'up':'dn'}" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d="${d}L100,30L0,30Z" class="a"/><path d="${d}" class="l"/></svg>`}
const BK_RNG={'1u':[36e5,72,'1 uur'],'24u':[DAYMS,96,'24 uur'],'7d':[7*DAYMS,112,'7 dagen'],'30d':[30*DAYMS,120,'30 dagen']};
function bkChart(f){const [span,n,lab]=BK_RNG[bk.rng],t=now(),s=MK.series(f,t,span,n),p=invPos(f.id);
 let mn=Math.min(...s),mx=Math.max(...s);if(p&&p.bp){mn=Math.min(mn,p.bp);mx=Math.max(mx,p.bp)}const pad=(mx-mn)*.08||mx*.01;mn-=pad;mx+=pad;
 const y=v=>(1-(v-mn)/(mx-mn))*100,d=s.map((v,i)=>(i?'L':'M')+(i/(s.length-1)*100).toFixed(2)+','+y(v).toFixed(2)).join('');
 const ch=s[s.length-1]/s[0]-1,hi=Math.max(...s),lo=Math.min(...s),last=s[s.length-1];
 return `<div class="bk-chart" style="--fc:${f.col}">
  <div class="bk-ch-top"><div><span class="label">Koers ${f.s}</span><b>${fmtPx(last)}</b><em class="${ch>=0?'up':'dn'}">${pctNl(ch,2)} <small>in ${lab}</small></em></div>
   <div class="bk-rng">${Object.keys(BK_RNG).map(k=>`<button class="${bk.rng===k?'on':''}" onclick="bk.rng='${k}';render()">${k}</button>`).join('')}</div></div>
  <div class="bk-plot"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Koersverloop ${f.n}"><defs><linearGradient id="bkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${f.col}" stop-opacity=".32"/><stop offset="1" stop-color="${f.col}" stop-opacity="0"/></linearGradient></defs>
   ${[25,50,75].map(g=>`<line x1="0" x2="100" y1="${g}" y2="${g}" class="g"/>`).join('')}
   <path d="${d}L100,100L0,100Z" fill="url(#bkg)"/><path d="${d}" class="l"/>${p&&p.bp?`<line x1="0" x2="100" y1="${y(p.bp)}" y2="${y(p.bp)}" class="bp"/>`:''}</svg>
   <i class="bk-dot" style="top:${y(last)}%"></i>
   <span class="bk-yl" style="top:${y(hi)}%">${fmtPx(hi)}</span><span class="bk-yl" style="top:${y(lo)}%">${fmtPx(lo)}</span>
   ${p&&p.bp?`<span class="bk-bpl" style="top:${y(p.bp)}%">jouw aankoop ${fmtPx(p.bp)}</span>`:''}</div>
  <div class="bk-xl"><span>${lab} geleden</span><span>nu</span></div></div>`}
const riskPips=r=>`<span class="bk-risk" title="Risico ${r} van 5">${[1,2,3,4,5].map(i=>`<i class="${i<=r?'on':''}"></i>`).join('')}</span>`;

function bkRek(){const r=savRate();
 return `<div class="bk-grid one">
  <section class="card bk-box"><h3>Spaarrekening</h3><p class="sub">Vrij opneembaar, elke minuut rente. Ook offline (tot 12 uur).</p>
   <div class="bk-rate"><b>${nl(r*100,2)}%</b><span>per uur · ±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag${isVip()?' · '+lidName():''}</span></div>
   ${bkTiers(i=>nl(SAV_RATE*BANK_T[i]*100,2)+'%','per uur')}
   <div class="bk-rows"><div><span>Nu per uur</span><b class="up">+${fmt(S.bank*r)}</b></div><div><span>Na 24 uur</span><b>${fmt(S.bank*Math.pow(1+r,24))}</b></div></div>
   <div class="bk-cmp"><span class="label">Vergelijk</span>
    <div><span>Spaarrekening</span><em>±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag</em><i>vrij opneembaar</i></div>
    <div><span>Deposito 12 uur</span><em>${pctR(depRate(DEP_TERMS[3]))}</em><i>vast, kan niet zakken</i></div>
    <div><span>Beleggen</span><em>±5% tot 15% per dag</em><i>kan ook flink dalen</i></div></div></section></div>`}

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
     <p class="bk-note">Een deposito open je met geld van je spaarrekening. Contant? Stort het eerst bij de pinautomaat hierboven.</p></div></div>
   <div>${bkInput(max)}
    <div class="bk-rcpt" data-bk-live>${a?'':`<p>Voorbeeld met ${fmt(v)}</p>`}
     <div><span>Inleg</span><b>${fmt(v)}</b></div><div><span>Rente ${ti?`<s>${pctR(r0)}</s> `:''}${pctR(r)}${ti?' '+(ti>1?'High roller':'VIP'):''}</span><b class="up">+${fmt(Math.round(v*r))}</b></div>
     ${ti?`<div><span>waarvan ${ti>1?'High roller':'VIP'}-voordeel</span><b class="up">+${fmt(Math.round(v*(r-r0)))}</b></div>`:''}
     <div class="tot"><span>Je krijgt terug</span><b>${fmt(Math.round(v*(1+r)))}</b></div><div><span>Klaar</span><b>${bkAt(now()+t.h*36e5)}</b></div></div>
    <button class="btn" data-bk-btn onclick="act.depOpen()" ${why?'disabled':''}>${why||'Zet '+fmt(a)+' vast voor '+t.n}</button>
    <div class="bk-mini"><span>Max per deposito <b>${fmt(cap)}</b> (groeit met je rang)</span></div></div>
  </div></section>`}

function bkInvTab(){const f=fundOf(bk.fund),t=now(),p=invPos(f.id),px=MK.price(f,t),a=bkAmt(),src=bkSrcBal(),cap=invCap(),room=Math.max(0,cap-invCost()),fee=invFee(f);
 const tv=invTotal(),tc=invCost(),pl=tv-tc;
 const cards=MK.FUNDS.map(x=>{const s0=MK.price(x,t-DAYMS),s1=MK.price(x,t),ch=s1/s0-1,v=invVal(x.id);
  return `<button class="bk-fund ${bk.fund===x.id?'on':''}" style="--fc:${x.col}" onclick="bk.fund='${x.id}';render()">
   <div class="bk-f-h"><b>${x.n}</b><span>${x.s}</span></div>${bkSpark(x)}
   <div class="bk-f-v"><span>${fmtPx(s1)}</span><em class="${ch>=0?'up':'dn'}">${pctNl(ch)}</em></div>
   <div class="bk-f-m">${riskPips(x.risk)}<span>${x.kind} ±${nl((Math.exp(24*x.y)-1)*100,1)}%/dag</span></div>
   ${v?`<div class="bk-f-own">Jij: <b>${fmt(v)}</b></div>`:''}</button>`}).join('');
 const pv=p?p.u*px:0,ppl=p?pv-p.c:0;
 const why=!a?'Vul een bedrag in':a<INV_MIN?'Minimaal '+fmt(INV_MIN):a>room?(room?'Je kunt nog '+fmt(room)+' inleggen':'Je zit aan het maximum van '+fmt(cap)+' ('+LID_N[tier()]+')'):a>src?'Niet genoeg op je '+(bk.src==='bank'?'spaarrekening':'contant'):null;
 const rk=FUND_RISK[f.id];
 return `${tc?`<div class="bk-port"><div><span class="label">Jouw portefeuille</span><b>${fmt(tv)}</b></div><div><span class="label">Ingelegd</span><b>${fmt(tc)}</b></div><div><span class="label">Winst / verlies</span><b class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))} <small>${pctNl(pl/tc)}</small></b></div></div>`:''}
 <div class="bk-funds">${cards}</div>
 <div class="bk-inv">
  <section class="card bk-box"><div class="bk-f-title"><div><h3>${f.n}</h3><p class="sub">${f.d}</p></div>${riskPips(f.risk)}</div>
   ${bkChart(f)}
   <div class="bk-facts"><div><span>${f.kind}</span><b>±${nl((Math.exp(24*f.y)-1)*100,1)}% per dag</b><i>bovenop de koers, ook offline (tot 12 uur)</i></div>
    <div><span>Kans op verlies</span><b>${rk[0]}% na 24 uur</b><i>${rk[1]}% na 7 dagen</i></div>
    <div><span>Kosten</span><b>${nl(fee*100,2)}% bij kopen en verkopen</b><i>${isVip()?lidName()+': '+Math.round(tierK()*100)+'% minder kosten':'VIP −15%, High roller −40%'}</i></div></div></section>
  <section class="card bk-box"><h3>Jouw positie</h3>
   ${p?`<div class="bk-rows"><div><span>Waarde</span><b>${fmt(pv)}</b></div><div><span>Ingelegd</span><b>${fmt(p.c)}</b></div>
    <div><span>Winst / verlies</span><b class="${ppl>=0?'up':'dn'}">${ppl>=0?'+':'−'}${fmt(Math.abs(ppl))} (${pctNl(ppl/p.c)})</b></div><div><span>Ontvangen ${f.kind.toLowerCase()}</span><b class="up">+${fmt(p.paid||0)}</b></div></div>
    <div class="bk-sell">${[[.25,'25%'],[.5,'50%'],[1,'Alles']].map(([q,l])=>`<button class="btn sm ${q===1?'':'ghost'}" onclick="act.invSell(${q})">Verkoop ${l} <small>${fmt(pv*q*(1-fee))}</small></button>`).join('')}</div>`
    :'<p class="sub">Je hebt nog niets in dit fonds. Wat je koopt groeit met de uitkering mee, maar de koers kan ook zakken.</p>'}
   <div class="bk-buy">${bkSrc()}${bkInput(Math.min(src,room),'Kopen voor')}
    <div class="bk-sum" data-bk-live>${a?`Je krijgt ${nl(a*(1-fee)/px,px<10?2:4)} stukken à ${fmtPx(px)} (kosten ${fmt(a*fee)}).`:`Nog in te leggen: <b>${fmt(room)}</b> van ${fmt(cap)} in totaal (gewoon €10.000, VIP €30.000, High roller €100.000).`}</div>
    <button class="btn" data-bk-btn onclick="act.invBuy()" ${why?'disabled':''}>${why||'Koop '+f.s+' voor '+fmt(a)}</button></div>
   <p class="bk-note">Verkopen gaat naar je spaarrekening. Koersen zijn voor iedereen hetzelfde en lopen door als je offline bent.</p></section></div>`}

V.bank=()=>{if(!S.dep)S.dep=[];if(!S.inv)S.inv={};const sv=S.bank,dp=depTotal(),iv=invTotal(),tot=sv+dp+iv||1,tc=invCost(),pl=iv-tc,nx=S.dep.slice().sort((x,y)=>x.t1-y.t1)[0],cash=Math.floor(S.cash);
 // de drie potjes zijn ook knoppen naar hun tabblad
 const k=(id,cls,lab,val,sub)=>`<button class="bk-k ${cls} ${bk.tab===id?'on':''}" onclick="act.bkTab('${id}')"><span class="label">${lab}</span><b>${val}</b><em>${sub}</em></button>`;
  const MI={rek:'<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',dep:'<rect x="3.5" y="4" width="17" height="15" rx="1.5"/><circle cx="12" cy="11.5" r="4"/><path d="M12 9.5v2l1.4 1.2M6 19v2M18 19v2"/>',inv:'<path d="M3 3v18h18"/><path d="M6.5 15.5l4-4.5 3 3L20 6.5"/><path d="M15.5 6.5H20V11"/>'};
 const menu=(id,col,lab,val,sub)=>`<button class="bk-mi ${bk.tab===id?'on':''}" style="--c:${col}" onclick="act.bkTab('${id}')" aria-pressed="${bk.tab===id}"><span class="bk-mi-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${MI[id]}</svg></span><span class="bk-mi-t"><span class="label">${lab}</span><b>${val}</b><em>${sub}</em></span></button>`;
 return `<h1>Bank</h1>
 <section class="bk-atm">
  <div class="atm" aria-label="Pinautomaat">
   <div class="atm-top"><span class="atm-logo">ONDER<b>BANK</b></span><span class="atm-led"></span></div>
   <div class="atm-screen ${atm.mode&&!atm.done?'in':''}" id="atmScr">${atmScreen(sv,dp,iv,tot)}</div>
   ${atmPad()}
   <div class="atm-slot" aria-hidden="true"><i></i><span class="atm-bills"><i></i><i></i><i></i></span></div>
  </div>
  <div class="bk-menu">
   ${menu('rek','#a9dcff','Rekening',fmt(sv),sv>=1?'+'+fmt(sv*savRate())+' rente per uur · storten en opnemen':nl(savRate()*100,2)+'% rente per uur')}
   ${menu('dep','#b8a1ff',"Deposito's",fmt(dp),nx?S.dep.length+'/'+depSlots()+' plekken · eerste over '+bkDur(nx.t1-now()):'0/'+depSlots()+' plekken · vaste rente')}
   ${menu('inv','#ff7a1a','Beleggen',fmt(iv),tc?`<span class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))}</span> sinds aankoop`:'koersen die stijgen en dalen')}
  </div>
 </section>
 ${bk.tab==='dep'?bkDepTab():bk.tab==='inv'?bkInvTab():bkRek()}`};

Object.assign(act,{
 bkSet(v){bk.amt=v>0?String(Math.floor(v)):'';render()},
 bkTab(t){bk.tab=t;bk.brk=null;if(t!=='rek'&&bk.src==='bank'&&S.bank<1&&S.cash>=1)bk.src='cash';render()},
 bkDep(){const a=Math.min(bkAmt(),Math.floor(wit()));if(a<=0){toast(zwart()>=1?'De bank neemt geen zwart geld aan. Was het eerst wit (Witwassen).':'Geen contant geld om te storten','bad');return}spendWit(a);S.bank+=a;toast(fmt(a)+' gestort');bk.amt='';save();render()},
 // in één klik al je contante geld veilig op de spaarrekening
 bkAll(){const a=Math.floor(wit());if(a<=0){toast(zwart()>=1?'De bank neemt geen zwart geld aan. Was het eerst wit (Witwassen).':'Geen contant geld om te storten','bad');return}spendWit(a);S.bank+=a;toast(fmt(a)+' gestort op je spaarrekening','ok');bk.amt='';save();render()},
 // naar het formulier voor een nieuw deposito en meteen in het bedrag
 bkNew(){const el=document.getElementById('bkNew');if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{const i=el.querySelector('input');if(i)i.focus({preventScroll:true})},380)},
 bkQuick(v){bk.amt=String(Math.floor(v));act.bkWd()},
 bkWd(){const a=Math.min(bkAmt(),Math.floor(S.bank));if(a<=0){toast('Er staat niets op je spaarrekening','bad');return}S.bank-=a;S.cash+=a;toast(fmt(a)+' opgenomen');bk.amt='';save();render()},
 depOpen(){const t=DEP_TERMS.find(x=>x.id===bk.term),a=bkAmt();if(!t||S.dep.length>=depSlots()||a<DEP_MIN||a>bankCap()||a>Math.floor(S.bank))return;
  S.bank-=a;const r=depRate(t),id=now();
  S.dep.push({id,n:t.n,h:t.h,a,r,t0:id,t1:id+t.h*36e5,v:2});toast(fmt(a)+' vastgezet voor '+t.n+': je krijgt '+fmt(Math.round(a*(1+r))),'ok');log('Deposito '+t.n+': '+fmt(a)+' tegen '+pctR(r),'info');bk.amt='';save();render()},
 depBreak(id){const d=S.dep.find(x=>x.id===id);if(!d)return;const back=Math.floor(d.a*(1-DEP_EARLY));S.dep=S.dep.filter(x=>x.id!==id);S.bank+=back;bk.brk=null;
  toast('Deposito opgezegd: '+fmt(back)+' terug op je spaarrekening','bad');log('Deposito opgezegd: '+fmt(back)+' terug','info');save();render()},
 invBuy(){const f=fundOf(bk.fund),a=bkAmt();if(!f)return;const p=S.inv[f.id]||{u:0,c:0,paid:0,bp:0},room=invCap()-invCost();
  if(a<INV_MIN||a>room||a>bkSrcBal())return;const px=MK.price(f,now()),u=a*(1-invFee(f))/px;
  if(bk.src==='bank')S.bank-=a;else spendWit(a);p.bp=(p.bp*p.u+px*u)/(p.u+u);p.u+=u;p.c+=a;S.inv[f.id]=p;
  toast('Gekocht: '+f.s+' voor '+fmt(a),'ok');log(f.n+' gekocht voor '+fmt(a)+' à '+fmtPx(px),'info');bk.amt='';save();render()},
 invSell(q){const f=fundOf(bk.fund),p=f&&S.inv[f.id];if(!p||p.u<=0)return;q=Math.min(1,Math.max(0,q));const px=MK.price(f,now()),u=p.u*q,got=u*px*(1-invFee(f)),cost=p.c*q,res=got-cost;
  p.u-=u;p.c-=cost;p.paid=(p.paid||0)*(1-q);if(q>=1||p.u<=1e-9)delete S.inv[f.id];S.bank+=got;
  toast(f.s+' verkocht: '+fmt(got)+' ('+(res>=0?'+':'−')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');log(f.n+' verkocht voor '+fmt(got)+' ('+(res>=0?'winst ':'verlies ')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');save();render()}
});
