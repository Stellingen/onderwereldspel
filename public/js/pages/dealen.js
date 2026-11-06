// Straat → Werk en dealen → Dealen (data en straatdealers: pages/werk.js)
// Buurten: elke buurt wil iets anders (like), en de vraag schuift door de tijd (vloeiend per blok van 45 minuten, voor iedereen gelijk).
//  Per blok heeft één buurt een uitschieter (+35%). Vuurwerk loopt in december hard. Verkoop je steeds op dezelfde plek, dan zakt
//  daar de prijs even (verzadiging, trekt in ±1 uur weg). Verplaatsen kost 2 energie.
// Politie: kans per verkoop × de politie in die buurt. Beroving: kans × buurt, minder met vuurkracht (wapens).
// Afspraken: klanten bestellen een partij in een buurt voor 25-60% boven de straatprijs. Een onbekend nummer kan een tip zijn.
const DL_GO_EN=2,DL_BLOK=45*60000,DL_ROB=.035,DL_ORD_MAX=3;
const DL_BUURT=[
 {id:'centrum',n:'Centrum',s:'Centrum',pol:1.35,rob:.7,like:{wiet:1.25,vape:1.15,tas:1.25,xtc:1.05,coke:1.1,sigaret:.85,horloge:1.1}},
 {id:'pijp',n:'De Pijp',s:'Pijp',pol:1.1,rob:.8,like:{miauw:1.25,wiet:1.1,keta:1.1,vape:1.1,tas:.9}},
 {id:'west',n:'Bos en Lommer',s:'West',pol:1,rob:1,like:{hasj:1.2,sigaret:1.2,vape:1.05,speed:1.05}},
 {id:'noord',n:'Noord',s:'Noord',pol:.85,rob:1.15,like:{xtc:1.25,keta:1.2,speed:1.1,vuurwerk:1.2,coke:.9}},
 {id:'zo',n:'Zuidoost',s:'ZO',pol:.9,rob:1.35,like:{sigaret:1.25,vuurwerk:1.25,hasj:1.05,tas:1.1,coke:.9}},
 {id:'zuid',n:'Oud-Zuid',s:'Zuid',pol:1.2,rob:.55,like:{coke:1.3,kilo:1.1,horloge:1.3,tas:1.15,sigaret:.8,hasj:.85}}];
const DL_WHO=['Sanne, studente','Kees van de bouw','Een DJ uit Noord','Tante Ria','Een toerist uit Leeds','Brian van de sportschool','Een kok uit de Pijp','Ricardo met de Golf','Een advocaat van de Zuidas','Fatima van de nagelstudio'];
// vaste ruis per (sleutel, blok): -1..1
const dlHash=str=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return ((h>>>0)%20001)/10000-1};
const dlBuurt=id=>DL_BUURT.find(b=>b.id===(id||dlS().bu))||DL_BUURT[2];
const dlAvail=()=>{const lv=dlLv();return DRUGS.filter(g=>g.lv<=lv)};
const dlHot=t=>{const i=Math.floor((t||now())/DL_BLOK),b=DL_BUURT[Math.floor((dlHash('hb'+i)+1)/2*DL_BUURT.length)%DL_BUURT.length],
 av=DRUGS.filter(g=>g.id!=='kilo'),g=av[Math.floor((dlHash('hg'+i)+1)/2*av.length)%av.length];return b.id+':'+g.id};
function dlSatDecay(){const D=dlS(),t=now();if(!D.satT){D.satT=t;return}const k=Math.max(0,(t-D.satT)/600000)*.06;if(k<.001)return;D.satT=t;
 for(const x in D.sat){D.sat[x]=Math.max(0,D.sat[x]-k);if(D.sat[x]<=0)delete D.sat[x]}}
// prijsfactor voor een product in een buurt (zonder verzadiging: raw)
function dlMult(bid,g,raw){const b=dlBuurt(bid),t=now(),i=Math.floor(t/DL_BLOK),f=(t%DL_BLOK)/DL_BLOK,k=b.id+g.id;
 const drift=dlHash(k+i)*(1-f)+dlHash(k+(i+1))*f,mon=new Date(t).getMonth(),
  season=g.id==='vuurwerk'?(mon===11?1.5:mon===0?1.15:.85):1,hot=dlHot(t)===b.id+':'+g.id?1.35:1;
 let m=(b.like[g.id]||1)*(1+.2*drift)*season*hot;if(!raw)m*=1-((dlS().sat[b.id+':'+g.id])||0);return Math.max(.5,Math.min(1.9,m))}
const dlRiskAt=(g,bid)=>Math.min(.5,dlRisk(g)*dlBuurt(bid).pol);
const dlRob=(g,bid)=>Math.min(.2,DL_ROB*dlBuurt(bid).rob*(1-Math.min(.7,(typeof gearVk==='function'?gearVk():0)/14))*(g.lv>=3?1.3:1));
const dl3=n=>'●'.repeat(n)+'<u>'+'●'.repeat(3-n)+'</u>';
const dlMid=g=>(g.sell[0]+g.sell[1])/2;
const dlPct=m=>{const v=Math.round((m-1)*100);return (v>0?'+':v<0?'−':'±')+Math.abs(v)};
// afspraken: verlopen weg, nieuwe erbij (eerste keer meteen twee)
function dlOrders(){const D=dlS(),t=now();if(dlLv()<1)return [];D.or=D.or.filter(o=>o.exp>t&&DRUGS.some(g=>g.id===o.g));
 const av=dlAvail().filter(g=>g.id!=='kilo'||dlLv()>=5);let n=0;
 if(!D.orT)D.orT=t-1;
 while(D.or.length<DL_ORD_MAX&&D.orT<=t&&n<4){n++;const g=av[rnd(0,av.length-1)],unk=Math.random()<.25,b=DL_BUURT[rnd(0,DL_BUURT.length-1)];
  const q=Math.max(1,Math.round(dlCap(g)*(.6+Math.random())));
  D.or.push({id:t.toString(36)+n,who:unk?'Onbekend nummer':DL_WHO[rnd(0,DL_WHO.length-1)],unk:unk?1:0,tip:Math.random()<(unk?.45:.04)?1:0,b:b.id,g:g.id,q,k:Math.round((1.25+Math.random()*.35)*100)/100,exp:t+rnd(20,45)*60000});
  D.orT=(D.or.length<2?t:t+rnd(5,12)*60000)}
 return D.or}
// wat een afspraak oplevert
const dlOrdPay=o=>{const g=DRUGS.find(x=>x.id===o.g);return g?Math.round(o.q*dlMid(g)*dlMult(o.b,g,1)*o.k*(1+tierK()*.2)):0};
// opgepakt bij een verkoop of afspraak: partij weg, helft van de rest van dat spul mee
function dlBust(g,q,mo,title,msg){const D=dlS();if(!mo){D.stock[g.id]=Math.max(0,(D.stock[g.id]||0)-q);D.stock[g.id]=Math.floor(D.stock[g.id]/2)}
 addHeat(12);D.rep=Math.max(0,D.rep-q*g.rep*.5);S.stats.fails++;save();
 arrest(60+Math.round(g.risk*1500),title,msg+(mo?' Mo is niet blij.':' Ze nemen ook de helft van je voorraad mee.'),{flee:g.risk>=.06?4:3})}
function dlEarn(g,q,rev,repK){const D=dlS();S.cash+=rev;addZwart(rev);D.rep+=q*g.rep*(repK||1);D.sold=(D.sold||0)+q;D.rev=(D.rev||0)+rev;addHeat(g.heat);addXp(dlXp(rev))}

/* ---------------- Pagina ---------------- */
function wkDealHtml(){dlSatDecay();const D=dlS(),lv=dlLv(),L=DL_LV[lv],nx=DL_LV[lv+1],ri=rankIdx(S.xp),stockN=dlStockN(),B=dlBuurt(),mo=lv===0;
 const pct=nx?Math.min(100,(D.rep-L.rep)/Math.max(1,nx.rep-L.rep)*100):100,avail=dlAvail(),later=DRUGS.filter(g=>g.lv>lv),hot=dlHot(),orders=dlOrders();
 const busy=inJail();
 // buurten
 const buurt=b=>{const here=b.id===B.id,best=avail.filter(g=>g.id!=='kilo').map(g=>[g,dlMult(b.id,g)]).sort((x,y)=>y[1]-x[1])[0];
  return `<button class="dlb${here?' here':''}" onclick="act.dlGo('${b.id}')" ${here||busy?'disabled':''} aria-pressed="${here}">
   <b>${b.n}</b><span class="dlb-r"><i title="Politie">${dl3(b.pol<.95?1:b.pol<1.15?2:3)}</i><i class="rb" title="Beroving">${dl3(b.rob<.75?1:b.rob<1.1?2:3)}</i></span>
   ${best?`<span class="dlb-best">${dgIc(best[0])}<em>${dlPct(best[1])}%</em></span>`:''}${here?'<small>Hier</small>':`<small>${DL_GO_EN} energie</small>`}</button>`};
 // vraag-tabel
 const tb=`<div class="dlt" style="--n:${DL_BUURT.length}" role="table" aria-label="Vraag per buurt">
  <div class="dlt-r dlt-h" role="row"><span role="columnheader"></span>${DL_BUURT.map(b=>`<span role="columnheader" class="${b.id===B.id?'here':''}">${b.s}</span>`).join('')}</div>
  ${avail.map(g=>`<div class="dlt-r" role="row"><span role="rowheader" class="dlt-p" title="${g.n}">${dgIc(g)}</span>${DL_BUURT.map(b=>{const m=dlMult(b.id,g),v=Math.round((m-1)*100),h=hot===b.id+':'+g.id;
   return `<span role="cell" class="${b.id===B.id?'here ':''}${v>=8?'up':v<=-8?'dn':''}${h?' hot':''}" title="${g.n} in ${b.n}">${dlPct(m)}</span>`}).join('')}</div>`).join('')}</div>`;
 // afspraken
 const ord=o=>{const g=DRUGS.find(x=>x.id===o.g),b=dlBuurt(o.b),own=D.stock[g.id]||0,ok=own>=o.q&&S.energy>=DL_EN&&!busy,mins=Math.max(1,Math.ceil((o.exp-now())/60000));
  return `<article class="dlo${o.unk?' unk':''}" style="--dc:${g.col}"><div class="dlo-h"><span class="dg-ic">${dgIc(g)}</span><div><b>${o.q.toLocaleString('nl-NL')} ${dgU(g,o.q)}</b><small>${g.n}</small></div><em>${fmt(dlOrdPay(o))}<small>+${Math.round((o.k-1)*100)}%</small></em></div>
   <p><b>${o.who}</b> · ${b.n} · nog ${mins} min${o.unk?' · <span class="warn">kan een tip zijn</span>':''}</p>
   <div class="dlo-a"><button class="btn sm ${ok?'':'ghost'}" onclick="act.dlOrder('${o.id}')" ${ok?'':'disabled'}>${busy?'Je zit vast':own<o.q?`Je hebt ${own.toLocaleString('nl-NL')}`:S.energy<DL_EN?'Te moe':'Leveren'}</button><button class="btn sm ghost" onclick="act.dlNo('${o.id}')">Nee</button></div></article>`};
 // producten
 const card=g=>{const own=D.stock[g.id]||0,cap=dlCap(g),left=cdLeft('deal_'+g.id),q=mo?cap:Math.min(cap,own),pr=dlBuy(g),m=dlMult(B.id,g),here=Math.round(dlMid(g)*m);
  const risk=Math.round(dlRiskAt(g)*100),rob=Math.round(dlRob(g)*100);
  const amts=[10,50,250,1000].map(x=>Math.max(1,Math.round(x*g.k))).filter((x,i,a)=>a.indexOf(x)===i&&x<=Math.max(1,L.store));
  const room=Math.max(0,L.store-stockN),can=q&&!left&&!busy&&S.energy>=DL_EN;
  return `<article class="dg" style="--dc:${g.col}"><div class="dg-h"><span class="dg-ic">${dgIc(g)}</span><div><b>${g.n}</b><small>${mo?'':'in '+fmt(pr)+' · '}hier ${fmt(here)} <i class="${m>=1.08?'up':m<=.92?'dn':''}">${dlPct(m)}%</i></small></div>${mo?'':`<em class="dg-own"><b>${own.toLocaleString('nl-NL')}</b> ${dgU(g,own)}</em>`}</div>
   ${mo?'':`<div class="dg-buy"><span>Inkopen</span>${amts.map(a=>{const c=Math.round(a*pr),ok=a<=room&&S.cash>=c;return `<button onclick="act.dlBuy('${g.id}',${a})" ${ok?'':'disabled'} aria-label="${a} ${dgU(g,a)} voor ${fmt(c)}">${a.toLocaleString('nl-NL')}<small>${fmt(c)}</small></button>`}).join('')}</div>`}
   <div class="dg-sell"><div><span>Op straat in ${B.n}</span><b>${q?q.toLocaleString('nl-NL')+' '+dgU(g,q)+(mo?' van Mo':''):'Niets op voorraad'}</b><small>Politie ${risk}% · beroving ${rob}%</small></div>
    <button class="btn ${can?'':'ghost'}" onclick="act.dlSell('${g.id}')" ${can?'':'disabled'}>${busy?'Je zit vast':left?'Nog '+fmtClock(left):S.energy<DL_EN?'Te moe':'Verkopen'}</button></div></article>`};
 const dealersHtml=L.dealers?(()=>{const g=DRUGS.find(x=>x.id===D.dp)||DRUGS[1],cost=25000*(lv-1);return `<section class="dl-crew"><div class="dl-crew-h"><span class="label">Straatdealers</span><b>${D.dealers} / ${L.dealers}</b></div>
   <p>Elke speldag verkoopt ieder ±${Math.round(30*g.k)} ${dgU(g,2)} uit je voorraad en houdt 25%.</p>
   <div class="dl-crew-a"><label>Ze verkopen <select onchange="act.dlDp(this.value)">${avail.filter(x=>x.id!=='kilo').map(x=>`<option value="${x.id}" ${x.id===D.dp?'selected':''}>${x.n}</option>`).join('')}</select></label>
    <button class="btn sm" onclick="act.dlHire()" ${D.dealers<L.dealers&&S.cash>=cost?'':'disabled'}>Dealer aannemen · ${fmt(cost)}</button></div></section>`})():'';
 return `${wkBack('Dealen')}
 <section class="dl-net"><div class="dl-net-h"><div><span class="label">Jouw plek</span><b>${L.n}</b><em>${L.who} · ${Math.floor(D.rep).toLocaleString('nl-NL')} rep</em></div>
   <div class="dl-kpi"><div><span>Voorraad</span><b>${stockN.toLocaleString('nl-NL')}${L.store?' / '+L.store.toLocaleString('nl-NL'):''}</b></div><div><span>Hitte</span><b>${Math.round(S.heat)}%</b></div><div><span>Verdiend</span><b>${fmt(D.rev||0)}</b></div></div></div>
  <ol class="dl-steps">${DL_LV.map((x,i)=>`<li class="${i<lv?'done':i===lv?'now':''}"><i>${i+1}</i><b>${x.n}</b><span>${x.rep.toLocaleString('nl-NL')} rep · ${RANKS[x.r][0]}</span></li>`).join('')}</ol>
  ${nx?`<div class="dl-bar"><i style="width:${pct}%"></i></div><p class="dl-next">Volgende: <b>${nx.n}</b> bij ${nx.rep.toLocaleString('nl-NL')} rep${ri<nx.r?` en <b>${RANKS[nx.r][0]}</b>`:''}.</p>`:'<p class="dl-next">Je eigen lab maakt elke speldag pillen en speed.</p>'}
 </section>
 <div class="dl-sec"><h2>Buurt</h2><span>Politie <i class="dot"></i> · beroving <i class="dot rb"></i></span></div>
 <div class="dlb-row">${DL_BUURT.map(buurt).join('')}</div>
 <details class="dl-vraag" ${wk.vraag===false?'':'open'} ontoggle="wk.vraag=this.open"><summary><span>Vraag per buurt</span><small>schuift steeds mee · <b class="hot">●</b> uitschieter</small></summary>${tb}</details>
 ${mo?'':`<div class="dl-sec"><h2>Afspraken</h2><span>${orders.length?orders.length+' open':'Even niks. Er komt wel wat.'}</span></div>${orders.length?`<div class="dlo-row">${orders.map(ord).join('')}</div>`:''}`}
 <div class="dl-sec"><h2>Handel</h2><span>${mo?'Mo\'s spul: jij houdt 30%':'Contant inkopen, zwart verkopen'}</span></div>
 ${dealersHtml}
 <div class="dg-grid">${avail.map(card).join('')}</div>
 ${later.length?`<div class="tierhead"><h2>Nog niet in je netwerk</h2></div><div class="dg-later">${later.map(g=>`<div class="dg-l" style="--dc:${g.col}"><span class="dg-ic">${dgIc(g)}</span><b>${g.n}</b><small>${DL_LV[g.lv].n}</small></div>`).join('')}</div>`:''}
 <p class="fit-hint">Opgepakt: partij weg en de helft van dat spul. Beroofd: partij weg. Een wapen op zak scheelt.</p>`}

/* ---------------- Acties ---------------- */
Object.assign(act,{
 dlGo(id){const b=DL_BUURT.find(x=>x.id===id),D=dlS();if(!b||inJail()||D.bu===id)return;if(S.energy<DL_GO_EN){toast('Te moe','bad');return}
  S.energy-=DL_GO_EN;D.bu=id;try{SFX.click()}catch(e){}toast('Je hangt nu rond in '+b.n,'ok');save();render()},
 dlBuy(id,n){const g=DRUGS.find(x=>x.id===id),L=DL_LV[dlLv()];if(!g||g.lv>dlLv()||dlLv()===0||inJail())return;n=Math.max(1,n|0);
  if(dlStockN()+n>L.store){toast('Je opslag zit vol ('+L.store.toLocaleString('nl-NL')+')','bad');return}
  const c=Math.round(n*dlBuy(g));if(S.cash<c){toast('Niet genoeg contant geld','bad');return}
  dlPay(c);const D=dlS();D.stock[id]=(D.stock[id]||0)+n;SFX.chip();toast(`${n.toLocaleString('nl-NL')} ${dgU(g,n)} ${g.n.toLowerCase()} ingekocht: ${fmt(c)}`,'ok');log(`Dealen: ${n} ${dgU(g,n)} ${g.n.toLowerCase()} ingekocht (${fmt(c)})`,'info');save();render()},
 dlSell(id){const g=DRUGS.find(x=>x.id===id),D=dlS(),lv=dlLv(),B=dlBuurt();if(!g||inJail()||cdLeft('deal_'+id)||g.lv>lv)return;
  if(S.energy<DL_EN){toast('Te moe','bad');return}const mo=lv===0,q=mo?dlCap(g):Math.min(dlCap(g),D.stock[id]||0);if(q<1)return;
  S.energy-=DL_EN;S.cd['deal_'+id]=now()+DL_CD*1000*waitK();dlSatDecay();
  if(Math.random()<dlRiskAt(g))return dlBust(g,q,mo,'Politiecontrole!',`Agenten houden je staande in ${B.n} met ${q} ${dgU(g,q)} ${g.n.toLowerCase()} op zak.`);
  if(Math.random()<dlRob(g)){if(!mo)D.stock[id]=Math.max(0,(D.stock[id]||0)-q);else D.rep=Math.max(0,D.rep-q*g.rep);S.hp=Math.max(1,S.hp-rnd(8,20));
   try{SFX.lose()}catch(e){}toast(`Beroofd in ${B.n}. ${q} ${dgU(g,q)} ${g.n.toLowerCase()} kwijt${mo?', en Mo wil het terug':''}.`,'bad');log(`Dealen: beroofd in ${B.n}, ${q} ${dgU(g,q)} ${g.n.toLowerCase()} kwijt`,'bad');save();render();return}
  const m=dlMult(B.id,g),price=(g.sell[0]+Math.random()*(g.sell[1]-g.sell[0]))*m,rev=Math.round(q*price*(mo?.3:1)*(1+tierK()*.2));
  const sk=B.id+':'+g.id;D.sat[sk]=Math.min(.35,(D.sat[sk]||0)+.06*q/Math.max(1,dlCap(g)));
  if(!mo)D.stock[id]-=q;const lv0=lv;dlEarn(g,q,rev);const lv1=dlLv();SFX.win(2);
  toast(`${q} ${dgU(g,q)} ${g.n.toLowerCase()} verkocht in ${B.n}: +${fmt(rev)}`+(lv1>lv0?` · nu ${DL_LV[lv1].n}!`:''),lv1>lv0?'lvl':'ok');
  log(`Dealen: ${q} ${dgU(g,q)} ${g.n.toLowerCase()} verkocht in ${B.n} voor ${fmt(rev)}`+(lv1>lv0?` · nieuw niveau: ${DL_LV[lv1].n}`:''),'ok');save();render()},
 dlOrder(oid){const D=dlS(),o=D.or.find(x=>x.id===oid);if(!o||inJail()||o.exp<=now())return;const g=DRUGS.find(x=>x.id===o.g),b=dlBuurt(o.b);if(!g)return;
  if((D.stock[g.id]||0)<o.q){toast('Niet genoeg op voorraad','bad');return}if(S.energy<DL_EN){toast('Te moe','bad');return}
  S.energy-=DL_EN;D.or=D.or.filter(x=>x!==o);D.bu=b.id;
  if(o.tip||Math.random()<dlRiskAt(g,b.id)*.5)return dlBust(g,o.q,false,o.tip?'Het was een tip':'Politiecontrole!',o.tip?`${o.who} blijkt een agent in burger. Arrestatieteam in ${b.n}.`:`Agenten houden je staande op weg naar ${o.who}.`);
  const rev=dlOrdPay(o),lv0=dlLv();D.stock[g.id]-=o.q;dlEarn(g,o.q,rev,1.5);const lv1=dlLv();SFX.win(2);
  toast(`Afspraak met ${o.who}: +${fmt(rev)}`+(lv1>lv0?` · nu ${DL_LV[lv1].n}!`:''),lv1>lv0?'lvl':'ok');log(`Dealen: ${o.q} ${dgU(g,o.q)} ${g.n.toLowerCase()} geleverd aan ${o.who} in ${b.n} voor ${fmt(rev)}`,'ok');save();render()},
 dlNo(oid){const D=dlS();D.or=D.or.filter(x=>x.id!==oid);save();render()},
 dlHire(){const D=dlS(),lv=dlLv(),L=DL_LV[lv],cost=25000*(lv-1);if(D.dealers>=L.dealers)return;if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  dlPay(cost);D.dealers++;if(!D.day)D.day=dayStart(now());SFX.chip();toast('Nieuwe straatdealer aan het werk','ok');log(`Dealen: straatdealer aangenomen (${fmt(cost)})`,'info');save();render()},
 dlDp(id){const D=dlS();if(DRUGS.find(x=>x.id===id))D.dp=id;save();render()}});
