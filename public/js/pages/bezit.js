// Bezit: overzicht van alle bedrijven. Klik op een bedrijf voor de details:
// je vestigingen, nieuwe vestigingen kopen en elke vestiging los upgraden (level 1-5).
window.bz=window.bz||{sel:null,fx:null};
window.addEventListener('hashchange',()=>{if(location.hash!=='#biz')bz.sel=null});
const BZ_IC={
 wash:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 7h16"/><circle cx="12" cy="14" r="4"/><path d="M7 5h1M10 5h1"/>',
 snack:'<path d="M4 11a8 6 0 0 1 16 0z"/><path d="M3 14h18"/><path d="M5 17h14v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/><path d="M9 7.5h.01M12 6.5h.01M15 7.5h.01"/>',
 shop:'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2M7 5h10"/>',
 barber:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.5 7.5L20 18M8.5 16.5L20 6"/>',
 autogarage:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.5 2.5-2.8-.7-.7-2.8z"/>',
 shisha:'<path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 14a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v5H3z"/><path d="M6 19v2M18 19v2"/><path d="M10 4c0-1.5 2-1.5 2-3M14 4c0-1.5 2-1.5 2-3"/>',
 club:'<path d="M4 4h16l-8 9z"/><path d="M12 13v7M8 20h8"/><path d="M15 7l3-4"/>',
 dealer:'<path d="M3 16v-3l2-5h14l2 5v3z"/><path d="M3 13h18"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/>',
 garage:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 hotel:'<path d="M3 21V9h18v12"/><path d="M3 15h18M7 12h.01M12 12h.01M17 12h.01"/><path d="M8 9V4h8v5"/>',
 speelhal:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.4"/><circle cx="16" cy="16" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="16" cy="8" r="1.4"/><circle cx="8" cy="16" r="1.4"/>',
 port:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 11h8"/><path d="M4 14c0 4 4 7 8 7s8-3 8-7"/>',
 vastgoed:'<path d="M3 21V10l6-4v15M9 21V3l12 4v14M3 21h18"/><path d="M13 9h4M13 13h4M13 17h4"/>',
 jet:'<path d="M2 14l20-8-6 14-3-6z"/><path d="M13 14l-4 6v-5"/>'};
const bzIcon=(b,s)=>`<span class="bz-ic" style="--bc:${b.col}${s?';--s:'+s+'px':''}"><svg viewBox="0 0 24 24" aria-hidden="true">${BZ_IC[b.id]||''}</svg></span>`;
const bzPlace=i=>BIZ_PLACES[i%BIZ_PLACES.length]+(i>=BIZ_PLACES.length?' '+(Math.floor(i/BIZ_PLACES.length)+1):'');
const bzPips=l=>`<span class="bz-pips" aria-label="Level ${l} van 5">${[1,2,3,4,5].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span>`;
const bzLock=b=>rankIdx(S.xp)<b.r;
// vestigingen die je nu kunt upgraden
const bzCanUp=b=>bizUnits(b.id).filter(l=>l<5&&wit()>=bizUpCost(b,l)).length;
const bzPerHour=v=>'±'+fmt(v/4)+' per uur';
const bzDays=d=>d<1?Math.round(d*4*10)/10+' uur':(Math.round(d*10)/10).toLocaleString('nl-NL')+' dag'+(d>=1.05?'en':'')+' ('+Math.round(d*4)+' uur)';
const bzClock=()=>{const ms=nextPayout()-now(),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000);return h+'u '+String(m).padStart(2,'0')+'m'};
// tijdstip van de volgende uitbetaling (uu:mm) en hoe ver de huidige speldag al is (0-100)
const bzPayAt=()=>{const d=new Date(nextPayout());return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const bzDayPct=()=>Math.min(100,Math.max(0,(1-(nextPayout()-now())/DAY_MS)*100));
// de kas: wat er nu in zit, hoe ver de speldag is en wanneer hij uitbetaalt
const bzTill=()=>`<div class="bz-till"><div class="bz-till-t"><span class="label">In de kas</span><b>${fmt(S.kas||0)}</b></div>
  <div class="bz-till-bar" aria-hidden="true"><i style="width:${bzDayPct().toFixed(1)}%"></i></div>
  <div class="bz-till-m"><span>Uitbetaling om <b>${bzPayAt()}</b></span><span>nog ${bzClock()}</span></div></div>`;
// tien plekken voor vestigingen; elke gevulde plek laat zijn level zien (1-5)
const bzSlots=u=>`<span class="bz-slots" aria-hidden="true">${Array.from({length:BIZ_MAX},(_,i)=>{const l=u[i]||0;return `<i class="${l?'on':''}${l>=5?' max':''}" style="--l:${l}"></i>`}).join('')}</span>`;
const bzKv=(l,v,c)=>`<span class="bz-kv-r"><span class="label">${l}</span><b class="${c||''}">${v}</b></span>`;

// Bonus op al je bedrijven: basis, imperium (vestigingen + upgrades) en rang
function bzBonusHtml(){const M=bizMult(),pct=v=>'+'+Math.round(v*100)+'%';
 return `<div class="bz-bonus"><div class="bz-bonus-t"><span class="label">Bonus op al je inkomen</span><b>×${M.total.toFixed(2).replace('.',',')}</b></div>
  <div class="bz-bonus-p"><span><b>${pct(BIZ_BOOST-1)}</b> basis</span><span><b>${pct(M.imp)}</b> imperium (${M.units} vestiging${M.units===1?'':'en'}, ${M.ups} upgrade${M.ups===1?'':'s'}${M.imp>=BIZ_IMP_MAX?', maximaal':''})</span><span><b>${pct(M.rk)}</b> rang (${RANKS[rankIdx(S.xp)][0]})</span>${(()=>{const o=[];if(sk('handel'))o.push([sk('handel')*SK.handel.inc/100,'handel']);if(famPerk('inc'))o.push([famPerk('inc'),'familie']);if(fitFx('inc'))o.push([fitFx('inc'),'outfit']);return o.map(([v,l])=>`<span><b>${pct(v)}</b> ${l}</span>`).join('')})()}</div>
  <p>Elke vestiging geeft +0,5% en elke upgrade +0,25% op al je bedrijven (samen tot +50%). Elke rang hoger geeft +3%, elk level binnen je rang +0,5%.${typeof wwFee==='function'&&wwFronts().length?` Hoe groter je imperium, hoe goedkoper <a href="#wit">witwassen</a>: via je beste zaak nu ${(Math.round(Math.min(...wwFronts().map(b=>wwFee(b).fee))*1000)/10).toLocaleString('nl-NL')}% (Ome Kees ${Math.round(WW_KEES*100)}%).`:''}</p></div>`}
// Wat 'upgrade alles' zou doen: steeds de goedkoopste upgrade eerst, zolang het budget het toelaat (budget=Infinity: alles naar max)
function bzPlan(ids,budget){const M=bizMult().total;let c=budget,k=0,cost=0,gain=0;const v={};ids.forEach(id=>v[id]=bizUnits(id).slice());
 for(;;){let best=null;ids.forEach(id=>{const b=BIZ.find(x=>x.id===id);v[id].forEach((l,i)=>{if(l<5){const x=bizUpCost(b,l);if(!best||x<best.x)best={id,i,x,b,l}}})});
  if(!best||best.x>c)break;c-=best.x;cost+=best.x;gain+=(bizIncRaw(best.b,best.l+1)-bizIncRaw(best.b,best.l))*M;v[best.id][best.i]++;k++}
 return {k,cost,gain}}
V.biz=()=>bz.sel&&BIZ.find(b=>b.id===bz.sel)?bzDetail(BIZ.find(b=>b.id===bz.sel)):bzOverview();

function bzOverview(){const inc=income(),units=BIZ.reduce((a,b)=>a+bizUnits(b.id).length,0),types=BIZ.filter(b=>bizUnits(b.id).length).length;
 const lv=BIZ.reduce((a,b)=>a+bizUnits(b.id).reduce((x,l)=>x+l,0),0),maxed=BIZ.reduce((a,b)=>a+bizUnits(b.id).filter(l=>l>=5).length,0);
 const own=BIZ.filter(b=>bizUnits(b.id).length),buy=BIZ.filter(b=>!bizUnits(b.id).length&&!bzLock(b)),lock=BIZ.filter(b=>!bizUnits(b.id).length&&bzLock(b));
 const ups=own.reduce((a,b)=>a+bzCanUp(b),0);
 return `<div class="bz">
 <header class="bz-hero">
  <div class="bz-hero-t"><h1>Bezit</h1><p class="sub">Je zaken verdienen per <b>speldag van 4 uur</b>. Alles gaat eerst in de kas, die om 00:00, 04:00, 08:00, 12:00, 16:00 en 20:00 uitbetaalt. Offline verdienen ze tot 12 uur door.</p></div>
  ${bzTill()}
  <div class="bz-stats">
   <div class="bz-stat main"><span class="label">Inkomen per speldag</span><b>${fmt(inc)}<small>/dag</small></b><em>${inc?bzPerHour(inc):'nog geen inkomen'}</em></div>
   <div class="bz-stat"><span class="label">Vestigingen</span><b>${units}</b><em>${types} van ${BIZ.length} soorten</em></div>
   <div class="bz-stat"><span class="label">Upgrades</span><b>${lv-units}</b><em>${maxed} op max level</em></div>
   <div class="bz-stat"><span class="label">Nu te upgraden</span><b class="${ups?'hot':''}">${ups}</b><em>${ups?'met je contante geld':'spaar voor de volgende'}</em></div>
  </div>
  ${bzBonusHtml()}
 </header>
 ${own.length?`<div class="bz-sec"><h2>Jouw zaken</h2><span>${own.length}</span></div>${(()=>{const ids=own.map(b=>b.id),c=bzPlan(ids,wit()),f=bzPlan(ids,Infinity);return f.k?`<div class="bz-upall"><div><span class="label">Wat je nu kunt betalen</span><b>${c.k?c.k+' upgrade'+(c.k>1?'s':'')+' · '+fmt(c.cost):'Nu niets betaalbaar'}</b><em>${c.k?'+'+fmt(c.gain)+'/dag extra, goedkoopste eerst':'Spaar nog even'}</em></div><div><span class="label">Alles naar max level</span><b>${f.k} upgrade${f.k>1?'s':''} · ${fmt(f.cost)}</b><em>+${fmt(f.gain)}/dag extra${f.cost>S.cash?', nog '+fmt(f.cost-S.cash)+' nodig':''}</em></div><button class="btn ${c.k?'gold':'ghost'}" onclick="act.bizUpEvery()" ${c.k?'':'disabled'}>${c.k?'Upgrade '+c.k+' · '+fmt(c.cost):'Geen upgrade betaalbaar'}</button></div>`:''})()}<div class="bz-grid">${own.map(bzCard).join('')}</div>`
  :`<div class="bz-empty card"><b>Je hebt nog geen zaken.</b><span>${bzLock(BIZ[0])?`Je eerste zaak, een ${BIZ[0].n.toLowerCase()}, kun je kopen vanaf ${RANKS[BIZ[0].r][0]}.`:`Begin met een ${BIZ[0].n.toLowerCase()}: goedkoop, en hij verdient zichzelf in ruim drie speldagen (±13 uur) terug.`}</span></div>`}
 ${buy.length?`<div class="bz-sec"><h2>Te koop</h2><span>${buy.length}</span></div><div class="bz-grid">${buy.map(bzCard).join('')}</div>`:''}
 ${lock.length?`<div class="bz-sec"><h2>Nog op slot</h2><span>${lock.length}</span></div><div class="bz-grid lockd">${lock.map(bzCard).join('')}</div>`:''}
 </div>`}

// Kaart per bedrijf. Cijfers staan als regels (label links, bedrag rechts), zodat er bij geen enkele breedte iets over elkaar valt.
function bzCard(b){const u=bizUnits(b.id),n=u.length,lock=bzLock(b),price=bizPrice(b,n),up=bzCanUp(b),inc=bizIncome(b.id),can=wit()>=price;
 const avg=n?u.reduce((a,l)=>a+l,0)/n:0;
 let body,foot;
 if(n){
  body=`${bzSlots(u)}<span class="bz-kv">${bzKv('Inkomen',fmt(inc)+'<small>/dag</small>','g')}${bzKv('Vestigingen',n+'<small>/'+BIZ_MAX+' · gem. level '+avg.toFixed(1).replace('.',',')+'</small>')}</span>`;
  foot=`${up?`<span class="bz-badge up">${up} upgrade${up>1?'s':''} klaar</span>`:''}${n<BIZ_MAX?`<span class="bz-badge ${can?'buy':''}">${can?'Bijkopen':'Volgende vestiging'} · ${fmt(price)}</span>`:'<span class="bz-badge">Alle 10 vestigingen</span>'}`}
 else{
  body=`<span class="bz-kv">${bzKv('Per vestiging',fmt(bizInc(b,1))+'<small>/dag</small>')}${bzKv('Op max level',fmt(bizInc(b,5))+'<small>/dag</small>')}${bzKv('Terugverdiend',bzDays(b.p/bizInc(b,1)))}</span>`;
  foot=lock?`<span class="bz-lockt">Vanaf ${RANKS[b.r][0]}</span><span class="bz-short">${fmt(price)}</span>`
   :`<span class="bz-badge ${can?'buy':''}">Eerste vestiging · ${fmt(price)}</span>${can?'':`<span class="bz-short">nog ${fmt(price-S.cash)}</span>`}`}
 return `<button class="bz-card ${n?'own':''} ${lock?'lock':''}" style="--bc:${b.col}" onclick="bz.open('${b.id}')" aria-label="${b.n}${lock?', vanaf '+RANKS[b.r][0]:''}">
  <span class="bz-top">${bzIcon(b)}<span class="bz-name"><b>${b.n}</b><span>${b.d}</span></span><i class="bz-go" aria-hidden="true">›</i></span>
  ${body}
  <span class="bz-foot">${foot}</span></button>`}

function bzDetail(b){const u=bizUnits(b.id),n=u.length,lock=bzLock(b),price=bizPrice(b,n),inc=bizIncome(b.id),full=n>=BIZ_MAX;
 const tot=u.reduce((a,l)=>a+l,0),maxTot=n*5;
 const buyBtn=lock?`<button class="btn xl" disabled>Vanaf rang ${RANKS[b.r][0]}</button>`
  :full?`<button class="btn xl" disabled>Alle ${BIZ_MAX} vestigingen in bezit</button>`
  :`<button class="btn gold xl" onclick="act.bizBuy('${b.id}')" ${wit()<price?'disabled':''}>${wit()<price?(S.cash>=price?'Eerst witwassen · '+fmt(price-wit())+' wit nodig':'Nog '+fmt(price-wit())+' wit nodig'):(n?'Koop vestiging '+(n+1):'Koop je eerste '+b.n.toLowerCase())+' · '+fmt(price)}</button>`;
 const rows=u.map((l,i)=>{const max=l>=5,cost=max?0:bizUpCost(b,l),gain=max?0:bizInc(b,l+1)-bizInc(b,l),ok=!max&&wit()>=cost,done=b.up.slice(0,l-1);
  return `<div class="bz-unit ${bz.fx===i?'fx':''} ${max?'max':''}">
   <div class="bz-u-id"><span class="bz-num">${i+1}</span><div><b>${b.n} ${bzPlace(i)}</b><span>${bzPips(l)} ${BIZ_LVL[l-1]}</span>${done.length?`<small class="bz-done" title="${done.join(', ')}">${done.join(' · ')}</small>`:''}</div></div>
   <div class="bz-u-inc"><span class="label">Inkomen</span><b>${fmt(bizInc(b,l))}<small>/dag</small></b></div>
   ${max?`<div class="bz-u-max">Maximaal level</div>`
    :`<button class="bz-u-btn ${ok?'ok':''}" onclick="act.bizUp('${b.id}',${i})" ${ok?'':'disabled'} title="Terugverdiend in ${bzDays(cost/Math.max(1,gain))}"><span>${b.up[l-1]}</span><b>${fmt(cost)} · +${fmt(gain)}/dag</b>${ok?'':`<em>nog ${fmt(cost-S.cash)}</em>`}</button>`}
  </div>`}).join('');
 const can=bzPlan([b.id],wit()),full2=bzPlan([b.id],Infinity),cheap=u.filter(l=>l<BIZ_LVL.length).map(l=>bizUpCost(b,l));
 const upAll=n?`<div class="bz-upall"><div><span class="label">Upgrade alles wat je kunt betalen</span><b>${can.k?can.k+' upgrade'+(can.k>1?'s':'')+' · '+fmt(can.cost):'Nu niets betaalbaar'}</b><em>${can.k?'+'+fmt(can.gain)+'/dag extra':cheap.length?'De goedkoopste kost '+fmt(Math.min(...cheap))+', nog '+fmt(Math.max(0,Math.min(...cheap)-S.cash))+' nodig':'Alles is al maximaal'}</em></div>
   <div><span class="label">Alles naar het hoogste level</span><b>${full2.k?full2.k+' upgrades · '+fmt(full2.cost):'Klaar'}</b><em>${full2.k?'+'+fmt(full2.gain)+'/dag extra'+(full2.cost>S.cash?', nog '+fmt(full2.cost-S.cash)+' nodig':''):'Alle vestigingen zijn maximaal'}</em></div>
   <button class="btn ${can.k?'gold':'ghost'}" onclick="act.bizUpAll('${b.id}')" ${can.k?'':'disabled'}>${can.k?'Upgrade '+can.k+' · '+fmt(can.cost):'Geen upgrade betaalbaar'}</button></div>`:'';
 const path=BIZ_LVL.map((nm,i)=>`<li class="${u.some(l=>l>=i+1)?'got':''}"><span class="bz-lvn">${i+1}</span><div><b>${i?b.up[i-1]:'Basis'}</b><span>${i?'Upgrade '+fmt(bizUpCost(b,i))+' · ':''}×${String(BIZ_MULT[i]).replace('.',',')}</span></div><em>${fmt(bizInc(b,i+1))}/dag</em></li>`).join('');
 return `<div class="bz" style="--bc:${b.col}">
 <button class="bz-back" onclick="bz.close()">‹ Alle bedrijven</button>
 <header class="bz-head">
  <div class="bz-head-t">${bzIcon(b,56)}<div><h1>${b.n}</h1><p class="sub">${b.d}</p></div></div>
  <div class="bz-stats">
   <div class="bz-stat main"><span class="label">Inkomen</span><b>${fmt(inc)}<small>/dag</small></b><em>${bzPerHour(inc)}</em></div>
   <div class="bz-stat"><span class="label">Vestigingen</span><b>${n}<small>/${BIZ_MAX}</small></b><em>${full?'vol':'volgende '+fmt(price)}</em></div>
   <div class="bz-stat"><span class="label">Levels</span><b>${tot}<small>/${maxTot||50}</small></b><em>${n?Math.round(tot/(maxTot||1)*100)+'% opgewaardeerd':'nog niets'}</em></div>
  </div>
  <div class="bz-buy">${buyBtn}<span>${lock?'Klim in rang om dit bedrijf te kunnen kopen.':full?'Upgrade je vestigingen voor meer inkomen.':`Nieuwe vestiging start op level 1 · +${fmt(bizInc(b,1))}/dag · elke volgende is 25% duurder`}</span></div>
 </header>
 <div class="bz-cols">
  <section class="bz-units">
   <div class="bz-sec"><h2>Jouw vestigingen</h2><span>${n}</span></div>${upAll}
   ${n?rows:`<div class="bz-empty card"><b>Nog geen ${b.n.toLowerCase()} in bezit.</b><span>${lock?'Dit bedrijf gaat open vanaf rang '+RANKS[b.r][0]+'.':'Koop je eerste vestiging hierboven. Daarna kun je hem hier upgraden.'}</span></div>`}
  </section>
  <aside class="bz-path card"><h3>Upgradepad</h3><p class="sub">Elke vestiging kan vier keer upgraden. Hoe hoger het level, hoe meer hij per speldag oplevert.</p><ol>${path}</ol></aside>
 </div></div>`}

bz.open=id=>{bz.sel=id;bz.fx=null;SFX.chip();render();window.scrollTo(0,0)};
bz.close=()=>{bz.sel=null;bz.fx=null;SFX.chip();render();window.scrollTo(0,0)};
Object.assign(act,{
 bizBuy(id){const b=BIZ.find(x=>x.id===id);if(!b||bzLock(b))return;const u=S.biz2[id]=S.biz2[id]||[];if(u.length>=BIZ_MAX){toast('Je hebt al '+BIZ_MAX+' vestigingen','bad');return}
  const p=bizPrice(b,u.length);if(wit()<p){toast(S.cash>=p?'Een zaak koop je met wit geld. Was je zwarte geld eerst wit.':'Niet genoeg contant geld','bad');return}
  spendWit(p);u.push(1);bz.fx=u.length-1;addXp(Math.floor(Math.sqrt(p)/5));SFX.win(3);toast(b.n+' '+bzPlace(u.length-1)+' gekocht · +'+fmt(bizInc(b,1))+'/dag');log(b.n+' '+bzPlace(u.length-1)+' gekocht voor '+fmt(p),'info');save();render()},
 bizUp(id,i){const b=BIZ.find(x=>x.id===id),u=bizUnits(id),l=u[i];if(!b||!l||l>=5)return;const c=bizUpCost(b,l);if(wit()<c){toast(S.cash>=c?'Een verbouwing betaal je met wit geld. Was je zwarte geld eerst wit.':'Niet genoeg contant geld','bad');return}
  spendWit(c);u[i]=l+1;bz.fx=i;addXp(Math.floor(Math.sqrt(c)/6));SFX.win(Math.min(6,l+2));toast(b.n+' '+bzPlace(i)+': '+b.up[l-1]+' · level '+(l+1));log(b.n+' '+bzPlace(i)+' geüpgraded naar level '+(l+1)+' voor '+fmt(c),'info');save();render()},
 // telkens de vestiging met het laagste level eerst, zolang je het kunt betalen
 bizUpAll(id){act.bizUpEvery([id])},
 // telkens de goedkoopste upgrade eerst, zolang je het kunt betalen
 bizUpEvery(ids){ids=ids||BIZ.filter(b=>bizUnits(b.id).length).map(b=>b.id);let k=0,spent=0;const before=income();
  for(;;){let best=null;ids.forEach(id=>{const b=BIZ.find(x=>x.id===id);bizUnits(id).forEach((l,i)=>{if(l<5){const x=bizUpCost(b,l);if(!best||x<best.x)best={id,i,x,l}}})});
   if(!best||wit()<best.x)break;spendWit(best.x);spent+=best.x;S.biz2[best.id][best.i]++;k++}
  if(!k)return;bz.fx=null;addXp(Math.floor(Math.sqrt(spent)/6));SFX.big();toast(k+' upgrade'+(k>1?'s':'')+' voor '+fmt(spent)+' · +'+fmt(income()-before)+'/dag');log(k+' upgrades voor '+fmt(spent),'info');save();render()},
 buyBiz(id){act.bizBuy(id)}});
