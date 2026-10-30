// Tab: Bank — spaarrekening, deposito's en beleggen (koersen: market.js)
// Spaarrekening: veilig en vrij opneembaar, lage rente. Deposito: vaste tijd, vaste rente, kan niet zakken.
// Beleggen: uitkering per uur (rente, huur, dividend, staking) plus een koers die kan stijgen én dalen.
// Alles bij de bank ben je niet kwijt als je gepakt wordt. Maximaal bedrag per deposito groeit met je rang; beleggen heeft een totaalplafond per lidmaatschap.
const SAV_RATE=.001; // per uur; rente per lidmaatschap ×BANK_T (gewoon 0,10%, VIP 0,12%, High roller 0,15% per uur), kosten −15% / −40%
// Per lidmaatschap: aantal depositoplekken (2 / 5 / 10) en hoeveel je in totaal kunt beleggen (€10.000 / €30.000 / €100.000)
const BANK_T=[1,1.2,1.5],DEP_SLOTS_T=[2,5,10],INV_CAP_T=[10000,30000,100000],LID_N=['Gewoon','VIP','High roller'];
const DEP_TERMS=[{id:'1u',h:1,r:.0015,n:'1 uur'},{id:'6u',h:6,r:.012,n:'6 uur'},{id:'24u',h:24,r:.045,n:'24 uur'},{id:'3d',h:72,r:.15,n:'3 dagen'}];
const DEP_SLOTS=3,DEP_EARLY=.02,DEP_MIN=1000,INV_MIN=100;
const bankCap=()=>250000*Math.pow(2,rankIdx(S.xp));
const savRate=()=>SAV_RATE*(BANK_T[tier()]||1);
const depRate=t=>t.r*(BANK_T[tier()]||1);
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
function bankTick(mins){if(!S.dep)S.dep=[];if(!S.inv)S.inv={};
 S.bank*=Math.pow(1+savRate(),mins/60);
 const t=now();MK.FUNDS.forEach(f=>{const p=S.inv[f.id];if(p&&p.u>0){const g=Math.exp(f.y*mins/60)-1;p.paid=(p.paid||0)+p.u*g*MK.price(f,t);p.u*=1+g}});
 const done=S.dep.filter(d=>d.t1<=t);
 if(done.length){S.dep=S.dep.filter(d=>d.t1>t);done.forEach(d=>{const pay=Math.round(d.a*(1+d.r));S.bank+=pay;log('Deposito '+d.n+' uitbetaald: '+fmt(pay),'ok');toast('Deposito klaar: '+fmt(pay)+' staat op je spaarrekening','ok')})}}

const bk={tab:'rek',amt:'',src:'bank',term:'24u',fund:'coin',rng:'24u',brk:null};
const bkAmt=()=>Math.max(0,Math.floor(+bk.amt||0));
const bkSrcBal=()=>Math.floor(bk.src==='bank'?S.bank:S.cash);
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

function bkRek(){const max=Math.max(S.cash,S.bank),a=bkAmt(),r=savRate();
 return `<div class="bk-grid">
  <section class="card bk-box"><h3>Geld verplaatsen</h3><p class="sub">Contant geld kun je kwijtraken als je gepakt wordt. Op de bank staat het veilig.</p>
   <div class="bk-flow"><div><span class="label">Contant</span><b class="acc">${fmt(S.cash)}</b></div>${BK_ARROWS}<div><span class="label">Spaarrekening</span><b>${fmt(S.bank)}</b></div></div>
   ${bkInput(max)}
   <div class="bk-two"><button class="btn" data-bk-btn onclick="act.bkDep()" ${a&&S.cash>=1?'':'disabled'}>Storten${a?' '+fmt(Math.min(a,S.cash)):''}</button>
    <button class="btn ghost" data-bk-btn onclick="act.bkWd()" ${a&&S.bank>=1?'':'disabled'}>Opnemen${a?' '+fmt(Math.min(a,S.bank)):''}</button></div></section>
  <section class="card bk-box"><h3>Spaarrekening</h3><p class="sub">Vrij opneembaar, elke minuut rente. Ook offline (tot 12 uur).</p>
   <div class="bk-rate"><b>${nl(r*100,2)}%</b><span>per uur · ±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag${isVip()?' · '+lidName():''}</span></div>
   ${bkTiers(i=>nl(SAV_RATE*BANK_T[i]*100,2)+'%','per uur')}
   <div class="bk-rows"><div><span>Nu per uur</span><b class="up">+${fmt(S.bank*r)}</b></div><div><span>Na 24 uur</span><b>${fmt(S.bank*Math.pow(1+r,24))}</b></div></div>
   <div class="bk-cmp"><span class="label">Vergelijk</span>
    <div><span>Spaarrekening</span><em>±${nl((Math.pow(1+r,24)-1)*100,1)}% per dag</em><i>vrij opneembaar</i></div>
    <div><span>Deposito 24 uur</span><em>${nl(depRate(DEP_TERMS[2])*100,1)}%</em><i>vast, kan niet zakken</i></div>
    <div><span>Beleggen</span><em>±5% tot 15% per dag</em><i>kan ook flink dalen</i></div></div></section></div>`}

// Deposito's: bovenaan je plekken (lopend of vrij), daaronder een nieuw deposito met een duidelijke afrekening.
function bkDepTab(){const t=DEP_TERMS.find(x=>x.id===bk.term),a=bkAmt(),src=bkSrcBal(),cap=bankCap(),used=S.dep.length,slots=depSlots(),max=Math.min(src,cap),r=depRate(t);
 const why=used>=slots?`Alle ${slots} plekken zijn bezet`:!a?'Vul een bedrag in':a<DEP_MIN?'Minimaal '+fmt(DEP_MIN):a>cap?'Maximaal '+fmt(cap)+' per deposito':a>src?'Niet genoeg op je '+(bk.src==='bank'?'spaarrekening':'contant'):null;
 const run=S.dep.slice().sort((x,y)=>x.t1-y.t1);
 const cards=Array.from({length:Math.max(slots,used)},(_,i)=>{const d=run[i];
  if(!d)return `<button class="bk-slot free" onclick="act.bkNew()"><span class="label">Plek ${i+1}</span><b>Vrij</b><em>Zet geld vast tegen een vaste rente</em></button>`;
  const left=d.t1-now(),pr=Math.min(1,Math.max(0,1-left/(d.t1-d.t0))),pay=Math.round(d.a*(1+d.r)),back=Math.floor(d.a*(1-DEP_EARLY));
  return `<div class="bk-slot">
   <div class="bk-slot-h"><b>${d.n}</b><span>${nl(d.r*100,2)}% rente</span></div>
   <div class="bk-slot-v"><span class="label">Je krijgt</span><b>${fmt(pay)}</b><em>${fmt(d.a)} inleg + ${fmt(pay-d.a)} rente</em></div>
   <div class="bk-slot-p" aria-hidden="true"><i style="width:${(pr*100).toFixed(1)}%"></i></div>
   <div class="bk-slot-t"><span>${left>0?'Klaar '+bkAt(d.t1):'Wordt uitbetaald'}</span><b>${left>0?bkDur(left):'nu'}</b></div>
   ${bk.brk===d.id?`<div class="bk-brk"><span>Opzeggen kost ${Math.round(DEP_EARLY*100)}% en je krijgt geen rente: je krijgt ${fmt(back)} terug.</span><button class="btn sm" onclick="act.depBreak(${d.id})">Ja, opzeggen</button><button class="btn sm ghost" onclick="bk.brk=null;render()">Laat staan</button></div>`
    :`<button class="bk-link" onclick="bk.brk=${d.id};render()">Eerder opzeggen</button>`}</div>`}).join('');
 const terms=DEP_TERMS.map(x=>{const xr=depRate(x),perDay=Math.pow(1+xr,24/x.h)-1;return `<button class="bk-term ${bk.term===x.id?'on':''}" onclick="bk.term='${x.id}';render()" aria-pressed="${bk.term===x.id}"><span>${x.n}</span><b>${nl(xr*100,x.r<.01?2:1)}%</b><em>±${nl(perDay*100,1)}% per dag</em></button>`}).join('');
 const v=a||100000;
 return `<div class="bk-sec"><h2>Jouw deposito's</h2><span>${used}/${slots} plekken</span><em>Plekken: gewoon 2, VIP 5, High roller 10${isVip()?` · ${lidName()}: ${Math.round((BANK_T[tier()]-1)*100)}% meer rente`:''}</em></div>
 <div class="bk-slots">${cards}</div>
 <section class="card bk-box bk-new" id="bkNew"><h3>Nieuw deposito</h3><p class="sub">Vaste tijd, vaste rente. Het kan niet zakken en gaat daarna vanzelf naar je spaarrekening.</p>
  <div class="bk-new-g">
   <div><span class="label bk-lab">Looptijd</span><div class="bk-terms">${terms}</div>${bkSrc()}</div>
   <div>${bkInput(max)}
    <div class="bk-rcpt" data-bk-live>${a?'':`<p>Voorbeeld met ${fmt(v)}</p>`}
     <div><span>Inleg</span><b>${fmt(v)}</b></div><div><span>Rente ${nl(r*100,t.r<.01?2:1)}%</span><b class="up">+${fmt(Math.round(v*r))}</b></div>
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
 return `<h1>Bank</h1>
 <section class="card hud bk-hero">
  <div class="bk-h-main"><span class="label">Totaal bij de bank</span><b>${fmt(sv+dp+iv)}</b><em>Veilig als je gepakt wordt</em></div>
  <div class="bk-h-kpis">
   ${k('rek','sv','Spaarrekening',fmt(sv),sv>=1?'+'+fmt(sv*savRate())+' rente per uur':nl(savRate()*100,2)+'% rente per uur')}
   ${k('dep','dp',"Deposito's",fmt(dp),nx?S.dep.length+'/'+depSlots()+' plekken · eerste over '+bkDur(nx.t1-now()):'0/'+depSlots()+' plekken in gebruik')}
   ${k('inv','iv','Beleggingen',fmt(iv),tc?`<span class="${pl>=0?'up':'dn'}">${pl>=0?'+':'−'}${fmt(Math.abs(pl))}</span> sinds aankoop`:'nog niets belegd')}
  </div>
  <div class="bk-dist" aria-hidden="true"><i style="width:${sv/tot*100}%;background:var(--ice)"></i><i style="width:${dp/tot*100}%;background:var(--violet)"></i><i style="width:${iv/tot*100}%;background:var(--acc)"></i></div>
  <div class="bk-cash ${cash>=1?'':'none'}"><div><span class="label">Contant op zak</span><b>${fmt(cash)}</b><em>${cash>=1?'Dit ben je kwijt als je gepakt wordt.':'Je hebt niets contant op zak.'}</em></div>
   <button class="btn sm" onclick="act.bkAll()" ${cash>=1?'':'disabled'}>${cash>=1?'Alles storten':'Niets te storten'}</button></div>
 </section>
 <div class="tabs bk-tabs">${[['rek','Rekening'],['dep',`Deposito's${S.dep.length?' · '+S.dep.length:''}`],['inv','Beleggen']].map(([k,l])=>`<button class="${bk.tab===k?'on':''}" onclick="act.bkTab('${k}')">${l}</button>`).join('')}</div>
 ${bk.tab==='dep'?bkDepTab():bk.tab==='inv'?bkInvTab():bkRek()}`};

Object.assign(act,{
 bkSet(v){bk.amt=v>0?String(Math.floor(v)):'';render()},
 bkTab(t){bk.tab=t;bk.brk=null;if(t!=='rek'&&bk.src==='bank'&&S.bank<1&&S.cash>=1)bk.src='cash';render()},
 bkDep(){const a=Math.min(bkAmt(),Math.floor(S.cash));if(a<=0){toast('Geen contant geld om te storten','bad');return}S.cash-=a;S.bank+=a;toast(fmt(a)+' gestort');bk.amt='';save();render()},
 // in één klik al je contante geld veilig op de spaarrekening
 bkAll(){const a=Math.floor(S.cash);if(a<=0){toast('Geen contant geld om te storten','bad');return}S.cash-=a;S.bank+=a;toast(fmt(a)+' gestort op je spaarrekening','ok');bk.amt='';save();render()},
 // naar het formulier voor een nieuw deposito en meteen in het bedrag
 bkNew(){const el=document.getElementById('bkNew');if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{const i=el.querySelector('input');if(i)i.focus({preventScroll:true})},380)},
 bkWd(){const a=Math.min(bkAmt(),Math.floor(S.bank));if(a<=0){toast('Er staat niets op je spaarrekening','bad');return}S.bank-=a;S.cash+=a;toast(fmt(a)+' opgenomen');bk.amt='';save();render()},
 depOpen(){const t=DEP_TERMS.find(x=>x.id===bk.term),a=bkAmt();if(!t||S.dep.length>=depSlots()||a<DEP_MIN||a>bankCap()||a>bkSrcBal())return;
  if(bk.src==='bank')S.bank-=a;else S.cash-=a;const r=depRate(t),id=now();
  S.dep.push({id,n:t.n,h:t.h,a,r,t0:id,t1:id+t.h*36e5});toast(fmt(a)+' vastgezet voor '+t.n+': je krijgt '+fmt(Math.round(a*(1+r))),'ok');log('Deposito '+t.n+': '+fmt(a)+' tegen '+nl(r*100,2)+'%','info');bk.amt='';save();render()},
 depBreak(id){const d=S.dep.find(x=>x.id===id);if(!d)return;const back=Math.floor(d.a*(1-DEP_EARLY));S.dep=S.dep.filter(x=>x.id!==id);S.bank+=back;bk.brk=null;
  toast('Deposito opgezegd: '+fmt(back)+' terug op je spaarrekening','bad');log('Deposito opgezegd: '+fmt(back)+' terug','info');save();render()},
 invBuy(){const f=fundOf(bk.fund),a=bkAmt();if(!f)return;const p=S.inv[f.id]||{u:0,c:0,paid:0,bp:0},room=invCap()-invCost();
  if(a<INV_MIN||a>room||a>bkSrcBal())return;const px=MK.price(f,now()),u=a*(1-invFee(f))/px;
  if(bk.src==='bank')S.bank-=a;else S.cash-=a;p.bp=(p.bp*p.u+px*u)/(p.u+u);p.u+=u;p.c+=a;S.inv[f.id]=p;
  toast('Gekocht: '+f.s+' voor '+fmt(a),'ok');log(f.n+' gekocht voor '+fmt(a)+' à '+fmtPx(px),'info');bk.amt='';save();render()},
 invSell(q){const f=fundOf(bk.fund),p=f&&S.inv[f.id];if(!p||p.u<=0)return;q=Math.min(1,Math.max(0,q));const px=MK.price(f,now()),u=p.u*q,got=u*px*(1-invFee(f)),cost=p.c*q,res=got-cost;
  p.u-=u;p.c-=cost;p.paid=(p.paid||0)*(1-q);if(q>=1||p.u<=1e-9)delete S.inv[f.id];S.bank+=got;
  toast(f.s+' verkocht: '+fmt(got)+' ('+(res>=0?'+':'−')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');log(f.n+' verkocht voor '+fmt(got)+' ('+(res>=0?'winst ':'verlies ')+fmt(Math.abs(res))+')',res>=0?'ok':'bad');save();render()}
});
