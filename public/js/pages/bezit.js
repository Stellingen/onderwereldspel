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
 jet:'<path d="M2 14l20-8-6 14-3-6z"/><path d="M13 14l-4 6v-5"/>',
 boven:'<path d="M3 21V9l4-4 4 4v12M11 21V7l5-4 5 4v14M3 21h18"/><path d="M6 12h2M6 16h2M14 10h3M14 14h3M14 18h3"/>',
 winkelpand:'<path d="M3 10l1.5-5h15L21 10z"/><path d="M4 10v11h16V10"/><path d="M9 21v-6h6v6"/><path d="M3 10c0 1.5 1.5 2 3 2s3-.5 3-2c0 1.5 1.5 2 3 2s3-.5 3-2c0 1.5 1.5 2 3 2s3-.5 3-2"/>',
 bedrijfshal:'<path d="M2 21V10l10-6 10 6v11z"/><path d="M6 21v-7h12v7M6 17h12"/>'};
// Illustratie per zaak (gevel bij nacht) voor de banners: winkelpui, garage, toren, haven of hangar. Verlichte ramen = je vestigingen.
const BZ_KIND={autogarage:'garage',dealer:'garage',garage:'garage',bedrijfshal:'garage',hotel:'tower',vastgoed:'tower',port:'port',jet:'jet',boven:'row'};
function bzArt(b,uid){const c=b.col,k=b.kind||BZ_KIND[b.id]||'shop',n=bizUnits(b.id).length,lit=i=>i<Math.max(2,n*2),u=uid||'a'+b.id;
 const ic=(x,y,sz,col)=>`<g transform="translate(${x-sz/2} ${y-sz/2}) scale(${sz/24})" fill="none" stroke="${col||'#fff'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${BZ_IC[b.id]||b.icp||''}</g>`;
 const defs=`<defs><radialGradient id="${u}g" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${u}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${c}" stop-opacity=".35"/></linearGradient></defs>`;
 const city=`<g fill="#14171c">${[[0,70,40],[34,90,30],[260,60,36],[290,96,30]].map(([x,h,w])=>`<rect x="${x}" y="${190-h}" width="${w}" height="${h}"/>`).join('')}</g>
  <g fill="#2a2f37">${[[8,130],[16,150],[40,118],[268,140],[276,160],[298,120]].map(([x,y])=>`<rect x="${x}" y="${y}" width="5" height="6"/>`).join('')}</g>`;
 const ground=`<rect x="0" y="190" width="320" height="30" fill="#0d0f12"/><path d="M0 190H320" stroke="#262a31"/><ellipse cx="160" cy="200" rx="120" ry="10" fill="url(#${u}g)" opacity=".7"/>`;
 let body='';
 if(k==='shop'){const aw=Array.from({length:10},(_,i)=>`<path d="M${70+i*18} 92h18l-3 16h-12z" fill="${i%2?c:'#e9e5db'}" opacity="${i%2?1:.92}"/>`).join('');
  body=`<rect x="64" y="40" width="192" height="150" fill="#1d2027" stroke="#2f343c"/><rect x="64" y="40" width="192" height="10" fill="#262a31"/>
   ${[0,1,2,3].map(i=>`<rect x="${80+i*44}" y="58" width="28" height="24" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.75:1}"/>`).join('')}
   <rect x="66" y="88" width="188" height="6" fill="#111"/>${aw}
   <rect x="76" y="114" width="118" height="70" fill="#0c0e11" stroke="#3a3f47"/><rect x="76" y="114" width="118" height="70" fill="url(#${u}g)"/>
   <circle cx="135" cy="149" r="24" fill="${c}" opacity=".15"/>${ic(135,149,34,c)}
   <rect x="204" y="118" width="38" height="66" fill="#16191e" stroke="#3a3f47"/><circle cx="234" cy="152" r="2" fill="${c}"/>`}
 else if(k==='garage'){body=`<path d="M40 70h240v120H40z" fill="#1d2027" stroke="#2f343c"/><path d="M34 70h252l-10-18H44z" fill="#262a31"/>
   <rect x="120" y="54" width="80" height="12" rx="2" fill="${c}" opacity=".9"/>${ic(160,60,10,'#0b0c0e')}
   ${[0,1,2].map(i=>`<g><rect x="${56+i*72}" y="96" width="64" height="94" fill="${i===1?'#0c0e11':'#2a2e35'}" stroke="#3a3f47"/>${i===1?`<rect x="${56+i*72}" y="96" width="64" height="94" fill="url(#${u}g)"/>`:Array.from({length:8},(_,j)=>`<path d="M${56+i*72} ${104+j*11}h64" stroke="#1d2026" stroke-width="2"/>`).join('')}</g>`).join('')}
   <g transform="translate(160 172)"><path d="M-26 0v-7l5-8h26l9 8h8v7z" fill="${c}"/><circle cx="-16" cy="1" r="5" fill="#0b0c0e"/><circle cx="14" cy="1" r="5" fill="#0b0c0e"/><path d="M-18-14h9v-1h-9z" fill="#fff" opacity=".6"/></g>`}
 else if(k==='tower'){body=`<rect x="110" y="14" width="100" height="176" fill="#1d2027" stroke="#2f343c"/><rect x="104" y="10" width="112" height="8" fill="#262a31"/>
   ${Array.from({length:7},(_,r)=>Array.from({length:4},(_,q)=>{const i=r*4+q;return `<rect x="${120+q*22}" y="${28+r*20}" width="14" height="12" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.8:1}"/>`}).join('')).join('')}
   <rect x="138" y="168" width="44" height="22" fill="#0c0e11" stroke="${c}"/><rect x="124" y="160" width="72" height="6" fill="${c}" opacity=".9"/>
   <circle cx="250" cy="60" r="20" fill="${c}" opacity=".12"/>${ic(250,60,26,c)}`}
 else if(k==='row'){const H=[[44,58,'#2a2420'],[100,52,'#24272c'],[150,60,'#2b2320'],[208,54,'#23262b']];
  body=H.map(([x,w,f],h)=>{const top=48+(h%2)*14,mid=x+w/2;return `<path d="M${x} 190V${top+18}h${w*.2}v-8h${w*.15}v-8h${w*.3}v8h${w*.15}v8h${w*.2}V190z" fill="${f}" stroke="#34302c"/>
   <rect x="${mid-5}" y="${top+2}" width="10" height="8" fill="${lit(h)?c:'#111317'}" opacity="${lit(h)?.85:1}"/>
   ${[0,1,2].map(r=>[0,1].map(q=>{const i=h*6+r*2+q;return `<rect x="${x+w*.18+q*w*.38}" y="${top+30+r*28}" width="${w*.26}" height="18" fill="${lit(i)?'url(#'+u+'w)':'#111317'}" opacity="${lit(i)?.8:1}"/>`}).join('')).join('')}
   <rect x="${x+4}" y="166" width="${w-8}" height="24" fill="#0c0e11" stroke="#3a3f47"/><rect x="${x+4}" y="166" width="${w-8}" height="24" fill="url(#${u}g)" opacity=".7"/>`}).join('')+
   `<circle cx="282" cy="56" r="20" fill="${c}" opacity=".12"/>${ic(282,56,24,c)}`}
 else if(k==='port'){body=`<path d="M0 190h320" stroke="${c}" stroke-opacity=".3"/>
   <g stroke="${c}" stroke-width="5" fill="none"><path d="M70 190V40M70 40h150M70 70l40-30M200 40v40"/></g><rect x="186" y="80" width="28" height="18" fill="${c}"/>
   ${[[96,160,'#c8102e'],[146,160,c],[196,160,'#2f6fd6'],[121,134,'#e38a12'],[171,134,'#1f9d5a']].map(([x,y,f])=>`<rect x="${x}" y="${y}" width="48" height="26" fill="${f}" opacity=".9"/><path d="M${x+6} ${y+4}v18M${x+14} ${y+4}v18M${x+22} ${y+4}v18M${x+30} ${y+4}v18M${x+38} ${y+4}v18" stroke="#000" stroke-opacity=".3"/>`).join('')}`}
 else{body=`<path d="M40 190V110q120-70 240 0v80z" fill="#1d2027" stroke="#2f343c"/><path d="M90 190v-60h140v60" fill="#0c0e11" stroke="#3a3f47"/><rect x="90" y="130" width="140" height="60" fill="url(#${u}g)"/>
   <g transform="translate(160 162)"><path d="M-60 0h100c10 0 18 3 18 6s-8 6-18 6h-100l-10-6z" fill="#e9e5db"/><path d="M-10 0l-20-26h10l30 26zM-10 12l-20 22h10l30-22z" fill="${c}"/><path d="M-60 0l-10-14h8l12 14z" fill="${c}"/>${Array.from({length:6},(_,i)=>`<circle cx="${-40+i*12}" cy="5" r="1.8" fill="#2f6fd6"/>`).join('')}</g>`}
 return `<svg viewBox="0 0 320 220" role="img" aria-hidden="true">${defs}${city}${body}${ground}</svg>`}
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
  <p>Elke vestiging geeft +0,5% en elke upgrade +0,25% op al je bedrijven (samen tot +50%). Elke rang hoger geeft +3%, elk level binnen je rang +0,5%.${typeof keesFee==='function'?` <a href="#wit">Witwassen</a> via een zaak kost altijd 21% belasting; een betere zaak wast sneller. Ome Kees neemt nu ${wwPct(keesFee())}.`:''}</p></div>`}
// Wat 'upgrade alles' zou doen: steeds de goedkoopste upgrade eerst, zolang het budget het toelaat (budget=Infinity: alles naar max)
function bzPlan(ids,budget){const M=bizMult().total;let c=budget,k=0,cost=0,gain=0;const v={};ids.forEach(id=>v[id]=bizUnits(id).slice());
 for(;;){let best=null;ids.forEach(id=>{const b=BIZ.find(x=>x.id===id);v[id].forEach((l,i)=>{if(l<5){const x=bizUpCost(b,l);if(!best||x<best.x)best={id,i,x,b,l}}})});
  if(!best||best.x>c)break;c-=best.x;cost+=best.x;gain+=(bizIncRaw(best.b,best.l+1)-bizIncRaw(best.b,best.l))*M;v[best.id][best.i]++;k++}
 return {k,cost,gain}}
V.biz=()=>bz.sel&&BIZ.find(b=>b.id===bz.sel)?bzDetail(BIZ.find(b=>b.id===bz.sel)):bzOverview();
// Banner per zaak (zelfde stijl als de casino-lobby): illustratie rechts, naam, cijfers en wat je nu kunt doen
function bzBanner(b){const u=bizUnits(b.id),n=u.length,lock=bzLock(b),price=bizPrice(b,n),up=bzCanUp(b),inc=bizIncome(b.id),can=wit()>=price,job=typeof wwJob==='function'&&wwJob(b.id);
 const facts=n?`<span class="bzb-f"><em><b>${fmt(inc)}</b>/dag</em><em><b>${n}</b>/${BIZ_MAX} vestigingen</em>${up?`<em class="up"><b>${up}</b> upgrade${up>1?'s':''} klaar</em>`:''}${job?'<em class="ww">witwassen bezig</em>':''}${b.cat==='vastgoed'?'<em class="nw">huur · geen witwassen</em>':''}</span>`
  :`<span class="bzb-f"><em><b>${fmt(bizInc(b,1))}</b>/dag per vestiging</em><em>terug in ${bzDays(b.p/bizInc(b,1)).split(' (')[0]}</em>${b.cat==='vastgoed'?'<em class="nw">geen witwassen</em>':''}</span>`;
 const go=lock?`<span class="bzb-lock">Vanaf ${RANKS[b.r][0]} · ${fmt(price)}</span>`:n?`<span class="bzb-go">Openen ›</span>`:`<span class="bzb-go ${can?'':'dim'}">${can?'Kopen · '+fmt(price):fmt(price)+' wit nodig'}</span>`;
 return `<button class="bzb ${n?'own':''} ${lock?'lock':''}" style="--c:${b.col}" onclick="bz.open('${b.id}')" aria-label="${b.n}${lock?', vanaf '+RANKS[b.r][0]:''}">
  <span class="bzb-art" aria-hidden="true">${bzArt(b,'o'+b.id)}</span>
  <span class="bzb-t"><span class="bzb-k">${n?'Jouw zaak':lock?'Op slot':'Te koop'}${n?' · '+bzSlots(u):''}</span><b>${b.n}</b><span class="bzb-d">${b.d}</span>${facts}${go}</span></button>`}

// Categorieën: kleur per categorie, een tegel per eigen zaak en een sectie met banners per categorie
const BZ_CATC={dienst:'#3fe395',horeca:'#ff3d52',auto:'#ff7a1a',handel:'#38bdf8',vastgoed:'#d9b48a'};
function bzTile(b){const u=bizUnits(b.id),n=u.length,up=bzCanUp(b),avg=n?u.reduce((a,l)=>a+l,0)/n:0,job=typeof wwJob==='function'&&wwJob(b.id);
 return `<button class="bz-pt" style="--c:${b.col}" onclick="bz.open('${b.id}')">${bzIcon(b,38)}<span class="bz-pt-t"><b>${b.n}</b><small>${n}/${BIZ_MAX} · level ${avg.toFixed(1).replace('.',',')}${b.cat==='vastgoed'?' · huur':''}</small></span>
  <span class="bz-pt-v"><b>${fmt(bizIncome(b.id))}</b><small>/dag</small></span>${up?`<i class="bz-pt-up">${up}↑</i>`:''}${job?'<i class="bz-pt-ww" title="Witwassen bezig"></i>':''}</button>`}
function bzCatHtml(c){const it=BIZ.filter(b=>b.cat===c.id),own=it.filter(b=>bizUnits(b.id).length),open=it.filter(b=>!bizUnits(b.id).length&&!bzLock(b)),lock=it.filter(b=>!bizUnits(b.id).length&&bzLock(b));
 const show=own.concat(open,bz.cat?lock:lock.slice(0,1)),rest=bz.cat?[]:lock.slice(1),inc=own.reduce((a,b)=>a+bizIncome(b.id),0);
 return `<section class="bz-cat" style="--c:${BZ_CATC[c.id]}">
  <header class="bz-cat-h"><div><span class="label">Categorie</span><h2>${c.n}</h2><p>${c.d}</p></div>
   <div class="bz-cat-m"><span><b>${own.length}</b>/${it.length} in bezit</span>${inc?`<span><b>${fmt(inc)}</b>/dag</span>`:''}<em class="${c.nowash?'no':'ok'}">${c.nowash?'Geen witwassen':'Witwassen kan'}</em></div></header>
  <div class="bzb-grid">${show.map(bzBanner).join('')}</div>
  ${rest.length?`<button class="bz-more" onclick="bz.cat='${c.id}';render();window.scrollTo({top:0,behavior:'smooth'})"><span>Ook in deze categorie</span>${rest.map(b=>`<em>${b.n} <small>vanaf ${RANKS[b.r][0]}</small></em>`).join('')}<i>›</i></button>`:''}
 </section>`}
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
 ${own.length?`<div class="bz-sec"><h2>Jouw bezit</h2><span>${own.length} soort${own.length===1?'':'en'} · ${units} vestiging${units===1?'':'en'}</span></div>${(()=>{const ids=own.map(b=>b.id),c=bzPlan(ids,wit()),f=bzPlan(ids,Infinity);return f.k?`<div class="bz-upall"><div><span class="label">Wat je nu kunt betalen</span><b>${c.k?c.k+' upgrade'+(c.k>1?'s':'')+' · '+fmt(c.cost):'Nu niets betaalbaar'}</b><em>${c.k?'+'+fmt(c.gain)+'/dag extra, goedkoopste eerst':'Spaar nog even'}</em></div><div><span class="label">Alles naar max level</span><b>${f.k} upgrade${f.k>1?'s':''} · ${fmt(f.cost)}</b><em>+${fmt(f.gain)}/dag extra${f.cost>S.cash?', nog '+fmt(f.cost-S.cash)+' nodig':''}</em></div><button class="btn ${c.k?'gold':'ghost'}" onclick="act.bizUpEvery()" ${c.k?'':'disabled'}>${c.k?'Upgrade '+c.k+' · '+fmt(c.cost):'Geen upgrade betaalbaar'}</button></div>`:''})()}
  <div class="bz-port">${own.map(bzTile).join('')}</div>`
  :`<div class="bz-empty card"><b>Je hebt nog geen zaken.</b><span>${bzLock(BIZ[0])?`Je eerste zaak, een ${BIZ[0].n.toLowerCase()}, kun je kopen vanaf ${RANKS[BIZ[0].r][0]}.`:`Begin met een ${BIZ[0].n.toLowerCase()}: goedkoop, en hij verdient zichzelf in ruim drie speldagen (±13 uur) terug.`}</span></div>`}
 <nav class="bz-cats" aria-label="Categorieën">${[{id:'',n:'Alles'}].concat(BIZ_CATS).map(c=>{const it=c.id?BIZ.filter(b=>b.cat===c.id):BIZ,o=it.filter(b=>bizUnits(b.id).length).length;
  return `<button class="${(bz.cat||'')===c.id?'on':''}" style="--c:${BZ_CATC[c.id]||'#ff7a1a'}" onclick="bz.cat='${c.id}';render()" aria-pressed="${(bz.cat||'')===c.id}">${c.n}<small>${o}/${it.length}</small></button>`}).join('')}</nav>
 ${BIZ_CATS.filter(c=>!bz.cat||bz.cat===c.id).map(bzCatHtml).join('')}
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
 <header class="bz-head bzd">
  <div class="bzd-art" aria-hidden="true">${bzArt(b,'d'+b.id)}</div>
  <div class="bz-head-t">${bzIcon(b,56)}<div><h1>${b.n}</h1><p class="sub">${b.d}</p></div></div>
  <div class="bz-stats">
   <div class="bz-stat main"><span class="label">Inkomen</span><b>${fmt(inc)}<small>/dag</small></b><em>${bzPerHour(inc)}</em></div>
   <div class="bz-stat"><span class="label">Vestigingen</span><b>${n}<small>/${BIZ_MAX}</small></b><em>${full?'vol':'volgende '+fmt(price)}</em></div>
   <div class="bz-stat"><span class="label">Levels</span><b>${tot}<small>/${maxTot||50}</small></b><em>${n?Math.round(tot/(maxTot||1)*100)+'% opgewaardeerd':'nog niets'}</em></div>
  </div>
  ${n&&typeof wwDur==='function'&&wwCan(b)?`<div class="bzd-ww">${wwJob(b.id)?wwJobHtml(b.id,b):`<div><span class="label">Witwassen via deze zaak</span><b>${wwTime(wwDur(b,1))} tot ${fmt(WW_BIG)} · ${wwTime(wwDur(b))} daarboven</b><small>21% belasting · meer vestigingen en upgrades = sneller</small></div>`}<a class="btn ghost sm" href="#wit" onclick="ww.front='${b.id}'">Naar witwassen</a></div>`:''}
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
