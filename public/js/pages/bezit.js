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
const bzCanUp=b=>bizUnits(b.id).filter(l=>l<5&&S.cash>=bizUpCost(b,l)).length;
const bzPerHour=v=>fmt(v*60)+'/uur';

V.biz=()=>bz.sel&&BIZ.find(b=>b.id===bz.sel)?bzDetail(BIZ.find(b=>b.id===bz.sel)):bzOverview();

function bzOverview(){const inc=income(),units=BIZ.reduce((a,b)=>a+bizUnits(b.id).length,0),types=BIZ.filter(b=>bizUnits(b.id).length).length;
 const lv=BIZ.reduce((a,b)=>a+bizUnits(b.id).reduce((x,l)=>x+l,0),0),maxed=BIZ.reduce((a,b)=>a+bizUnits(b.id).filter(l=>l>=5).length,0);
 const own=BIZ.filter(b=>bizUnits(b.id).length),buy=BIZ.filter(b=>!bizUnits(b.id).length&&!bzLock(b)),lock=BIZ.filter(b=>!bizUnits(b.id).length&&bzLock(b));
 const ups=own.reduce((a,b)=>a+bzCanUp(b),0);
 return `<div class="bz">
 <header class="bz-hero">
  <div><h1>Bezit</h1><p class="sub">Je bedrijven verdienen elke minuut geld, ook als je offline bent (tot 12 uur). Klik op een bedrijf om vestigingen bij te kopen of te upgraden.</p></div>
  <div class="bz-stats">
   <div class="bz-stat main"><span class="label">Inkomen</span><b>${fmt(inc)}<small>/min</small></b><em>${bzPerHour(inc)}</em></div>
   <div class="bz-stat"><span class="label">Vestigingen</span><b>${units}</b><em>${types} van ${BIZ.length} soorten</em></div>
   <div class="bz-stat"><span class="label">Upgrades</span><b>${lv-units}</b><em>${maxed} op max level</em></div>
   <div class="bz-stat"><span class="label">Nu te upgraden</span><b class="${ups?'hot':''}">${ups}</b><em>${ups?'met je contante geld':'spaar voor de volgende'}</em></div>
  </div>
 </header>
 ${own.length?`<div class="bz-sec"><h2>Jouw zaken</h2><span>${own.length}</span></div><div class="bz-grid">${own.map(bzCard).join('')}</div>`
  :`<div class="bz-empty card"><b>Je hebt nog geen bedrijven.</b><span>Begin met een wasserette: goedkoop, en hij betaalt zichzelf binnen ruim twee uur terug.</span></div>`}
 ${buy.length?`<div class="bz-sec"><h2>Te koop</h2><span>${buy.length}</span></div><div class="bz-grid">${buy.map(bzCard).join('')}</div>`:''}
 ${lock.length?`<div class="bz-sec"><h2>Nog op slot</h2><span>${lock.length}</span></div><div class="bz-grid lockd">${lock.map(bzCard).join('')}</div>`:''}
 </div>`}

function bzCard(b){const u=bizUnits(b.id),n=u.length,lock=bzLock(b),price=bizPrice(b,n),up=bzCanUp(b),inc=bizIncome(b.id);
 const avg=n?u.reduce((a,l)=>a+l,0)/n:0;
 let foot;
 if(lock)foot=`<span class="bz-lockt">Vanaf ${RANKS[b.r][0]}</span>`;
 else if(n)foot=`${up?`<span class="bz-badge up">${up} upgrade${up>1?'s':''} klaar</span>`:''}${n<BIZ_MAX?`<span class="bz-badge ${S.cash>=price?'buy':''}">Bijkopen · ${fmt(price)}</span>`:'<span class="bz-badge">Alle 10 vestigingen</span>'}`;
 else foot=`<span class="bz-badge ${S.cash>=price?'buy':''}">Eerste vestiging · ${fmt(price)}</span>`;
 return `<button class="bz-card ${n?'own':''} ${lock?'lock':''}" style="--bc:${b.col}" onclick="bz.open('${b.id}')">
  <div class="bz-top">${bzIcon(b)}<div class="bz-name"><b>${b.n}</b><span>${b.d}</span></div><i class="bz-go" aria-hidden="true">›</i></div>
  <div class="bz-mid">${n?`<div><span class="label">In bezit</span><b>${n}<small>/${BIZ_MAX}</small></b></div><div><span class="label">Gem. level</span><b>${avg.toFixed(1)}</b></div><div class="r"><span class="label">Inkomen</span><b class="g">${fmt(inc)}<small>/min</small></b></div>`
   :`<div><span class="label">Per vestiging</span><b>${fmt(b.inc)}<small>/min</small></b></div><div><span class="label">Max level</span><b>${fmt(bizInc(b,5))}<small>/min</small></b></div><div class="r"><span class="label">Terugverdiend</span><b>${Math.round(b.p/b.inc/60*10)/10} uur</b></div>`}</div>
  <div class="bz-foot">${foot}</div></button>`}

function bzDetail(b){const u=bizUnits(b.id),n=u.length,lock=bzLock(b),price=bizPrice(b,n),inc=bizIncome(b.id),full=n>=BIZ_MAX;
 const tot=u.reduce((a,l)=>a+l,0),maxTot=n*5;
 const buyBtn=lock?`<button class="btn xl" disabled>Vanaf rang ${RANKS[b.r][0]}</button>`
  :full?`<button class="btn xl" disabled>Alle ${BIZ_MAX} vestigingen in bezit</button>`
  :`<button class="btn gold xl" onclick="act.bizBuy('${b.id}')" ${S.cash<price?'disabled':''}>${S.cash<price?'Nog '+fmt(price-S.cash)+' nodig':(n?'Koop vestiging '+(n+1):'Koop je eerste '+b.n.toLowerCase())+' · '+fmt(price)}</button>`;
 const rows=u.map((l,i)=>{const max=l>=5,cost=max?0:bizUpCost(b,l),gain=max?0:bizInc(b,l+1)-bizInc(b,l),ok=!max&&S.cash>=cost;
  return `<div class="bz-unit ${bz.fx===i?'fx':''} ${max?'max':''}">
   <div class="bz-u-id"><span class="bz-num">${String(i+1).padStart(2,'0')}</span><div><b>${b.n} ${bzPlace(i)}</b><span>${bzPips(l)} ${BIZ_LVL[l-1]}</span></div></div>
   <div class="bz-u-inc"><span class="label">Inkomen</span><b>${fmt(bizInc(b,l))}<small>/min</small></b></div>
   ${max?`<div class="bz-u-max">Maximaal level</div>`
    :`<button class="btn ${ok?'':'ghost'} bz-u-btn" onclick="act.bizUp('${b.id}',${i})" ${ok?'':'disabled'}><span>${b.up[l-1]}</span><b>${fmt(cost)} · +${fmt(gain)}/min</b></button>`}
  </div>`}).join('');
 const allCost=(()=>{let c=S.cash,k=0;const v=u.slice();for(;;){let bi=-1;v.forEach((l,i)=>{if(l<5&&(bi<0||l<v[bi]))bi=i});if(bi<0)break;const x=bizUpCost(b,v[bi]);if(x>c)break;c-=x;v[bi]++;k++}return k})();
 const path=BIZ_LVL.map((nm,i)=>`<li class="${u.some(l=>l>=i+1)?'got':''}"><span class="bz-lvn">${i+1}</span><div><b>${i?b.up[i-1]:'Basis'}</b><span>${i?'Upgrade '+fmt(bizUpCost(b,i))+' · ':''}×${String(BIZ_MULT[i]).replace('.',',')}</span></div><em>${fmt(bizInc(b,i+1))}/min</em></li>`).join('');
 return `<div class="bz" style="--bc:${b.col}">
 <button class="bz-back" onclick="bz.close()">‹ Alle bedrijven</button>
 <header class="bz-head">
  <div class="bz-head-t">${bzIcon(b,56)}<div><h1>${b.n}</h1><p class="sub">${b.d}</p></div></div>
  <div class="bz-stats">
   <div class="bz-stat main"><span class="label">Inkomen</span><b>${fmt(inc)}<small>/min</small></b><em>${bzPerHour(inc)}</em></div>
   <div class="bz-stat"><span class="label">Vestigingen</span><b>${n}<small>/${BIZ_MAX}</small></b><em>${full?'vol':'volgende '+fmt(price)}</em></div>
   <div class="bz-stat"><span class="label">Levels</span><b>${tot}<small>/${maxTot||50}</small></b><em>${n?Math.round(tot/(maxTot||1)*100)+'% opgewaardeerd':'nog niets'}</em></div>
  </div>
  <div class="bz-buy">${buyBtn}<span>${lock?'Klim in rang om dit bedrijf te kunnen kopen.':full?'Upgrade je vestigingen voor meer inkomen.':`Nieuwe vestiging start op level 1 · +${fmt(b.inc)}/min · elke volgende is 25% duurder`}</span></div>
 </header>
 <div class="bz-cols">
  <section class="bz-units">
   <div class="bz-sec"><h2>Jouw vestigingen</h2><span>${n}</span>${n?`<button class="btn sm ${allCost?'':'ghost'} bz-all" onclick="act.bizUpAll('${b.id}')" ${allCost?'':'disabled'}>${allCost?'Upgrade alles wat kan ('+allCost+')':'Geen upgrade betaalbaar'}</button>`:''}</div>
   ${n?rows:`<div class="bz-empty card"><b>Nog geen ${b.n.toLowerCase()} in bezit.</b><span>${lock?'Dit bedrijf gaat open vanaf rang '+RANKS[b.r][0]+'.':'Koop je eerste vestiging hierboven. Daarna kun je hem hier upgraden.'}</span></div>`}
  </section>
  <aside class="bz-path card"><h3>Upgradepad</h3><p class="sub">Elke vestiging kan vier keer upgraden. Hoe hoger het level, hoe meer hij per minuut oplevert.</p><ol>${path}</ol></aside>
 </div></div>`}

bz.open=id=>{bz.sel=id;bz.fx=null;SFX.chip();render();window.scrollTo(0,0)};
bz.close=()=>{bz.sel=null;bz.fx=null;SFX.chip();render();window.scrollTo(0,0)};
Object.assign(act,{
 bizBuy(id){const b=BIZ.find(x=>x.id===id);if(!b||bzLock(b))return;const u=S.biz2[id]=S.biz2[id]||[];if(u.length>=BIZ_MAX){toast('Je hebt al '+BIZ_MAX+' vestigingen','bad');return}
  const p=bizPrice(b,u.length);if(S.cash<p){toast('Niet genoeg contant geld','bad');return}
  S.cash-=p;u.push(1);bz.fx=u.length-1;addXp(Math.floor(p/200));SFX.win(3);toast(b.n+' '+bzPlace(u.length-1)+' gekocht · +'+fmt(b.inc)+'/min');log(b.n+' '+bzPlace(u.length-1)+' gekocht voor '+fmt(p),'info');save();render()},
 bizUp(id,i){const b=BIZ.find(x=>x.id===id),u=bizUnits(id),l=u[i];if(!b||!l||l>=5)return;const c=bizUpCost(b,l);if(S.cash<c){toast('Niet genoeg contant geld','bad');return}
  S.cash-=c;u[i]=l+1;bz.fx=i;addXp(Math.floor(c/250));SFX.win(Math.min(6,l+2));toast(b.n+' '+bzPlace(i)+': '+b.up[l-1]+' · level '+(l+1));log(b.n+' '+bzPlace(i)+' geüpgraded naar level '+(l+1)+' voor '+fmt(c),'info');save();render()},
 // telkens de vestiging met het laagste level eerst, zolang je het kunt betalen
 bizUpAll(id){const b=BIZ.find(x=>x.id===id),u=bizUnits(id);let k=0,spent=0;
  for(;;){let bi=-1;u.forEach((l,i)=>{if(l<5&&(bi<0||l<u[bi]))bi=i});if(bi<0)break;const c=bizUpCost(b,u[bi]);if(S.cash<c)break;S.cash-=c;spent+=c;u[bi]++;k++}
  if(!k)return;bz.fx=null;addXp(Math.floor(spent/250));SFX.big();toast(k+' upgrade'+(k>1?'s':'')+' voor '+fmt(spent)+' · '+b.n+' levert nu '+fmt(bizIncome(id))+'/min');log(k+' upgrades bij '+b.n+' voor '+fmt(spent),'info');save();render()},
 buyBiz(id){act.bizBuy(id)}});
