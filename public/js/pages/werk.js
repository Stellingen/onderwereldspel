// Straat → Werk en dealen
// Klusjes: gewoon werk voor mensen in de buurt. Kost energie, levert wit geld en een beetje XP op, zonder risico.
// Dealen: je begint als loopjongen van Mo (je verkoopt zijn spul voor 30%). Met elke verkoop groeit je naam (rep):
// eigen klantjes → vaste lijn bij de groothandel → groothandel met eigen straatdealers → direct bij de leverancier →
// drugsbaron met een eigen lab. Elk niveau vraagt rep én een rang. Verkopen levert zwart geld op, hitte, en kan misgaan
// (politiecontrole: je wordt opgepakt en de politie neemt een deel van je voorraad mee).
// S.dl = {rep, stock:{id:aantal}, dealers, dp: product voor de dealers, day: laatste verwerkte speldag, lab:0/1, sold, rev}

/* ---------------- Klusjes ---------------- */
const JOBS=[
 {id:'folders',n:'Folders rondbrengen',d:'Een tas vol folders van de pizzeria, door de brievenbussen in Noord.',r:0,en:3,cd:40,p:[35,70],xp:2,ic:'mail'},
 {id:'autowas',n:'Auto\'s wassen',d:'Zaterdag bij de wasstraat aan de Ring. Sponzen, zemen, fooien.',r:0,en:4,cd:55,p:[60,110],xp:3,ic:'car'},
 {id:'verhuis',n:'Helpen met een verhuizing',d:'Drie hoog, geen lift. Een kast, een bank en veertig dozen boeken.',r:1,en:6,cd:90,p:[140,260],xp:5,ic:'box'},
 {id:'bezorg',n:'Maaltijden bezorgen',d:'Op de scooter door de regen. Hoe sneller je bent, hoe meer fooi.',r:2,en:5,cd:75,p:[180,320],xp:6,ic:'bike'},
 {id:'kraam',n:'Kraam opbouwen op de markt',d:'Om vijf uur \'s ochtends op de Albert Cuyp. De handelaar betaalt contant.',r:3,en:7,cd:110,p:[350,600],xp:9,ic:'tent'},
 {id:'portier',n:'Portier bij een club',d:'Zwart pak, oortje in. Jij bepaalt wie er binnenkomt.',r:5,en:9,cd:150,p:[900,1600],xp:16,ic:'door'},
 {id:'chauffeur',n:'Chauffeur voor een zakenman',d:'Een dag lang rijden in een Mercedes. Niets vragen, niets horen.',r:8,en:12,cd:220,p:[3000,5200],xp:30,ic:'key'},
 {id:'beveilig',n:'Beveiliging op een evenement',d:'Een gala in het Concertgebouw. Jij en twaalf collega\'s in pak.',r:11,en:15,cd:300,p:[9000,15000],xp:55,ic:'shield'},
 {id:'adviseur',n:'Adviseur voor een vastgoedbaas',d:'Hij wil weten hoe je een pand rustig leeg krijgt. Jij weet dat.',r:14,en:18,cd:420,p:[26000,42000],xp:95,ic:'brief'},
 {id:'bestuur',n:'Plekje in een raad van bestuur',d:'Drie vergaderingen per jaar, een dikke vergoeding. Iedereen weet wie je bent.',r:17,en:22,cd:600,p:[70000,110000],xp:170,ic:'crown'}];

/* ---------------- Dealen ---------------- */
// niveaus in je netwerk: rep nodig, rang nodig, korting bij het inkopen, hoeveel je per keer verkoopt, opslag, dealers
const DL_LV=[
 {n:'Loopjongen van Mo',who:'Mo van het pleintje',rep:0,r:0,disc:0,cap:8,store:0,dealers:0,d:'Mo geeft je zijn spul mee. Jij verkoopt het op straat en houdt 30%.'},
 {n:'Eigen klantjes',who:'Mo verkoopt aan jou',rep:60,r:1,disc:0,cap:12,store:300,dealers:0,d:'Je koopt in bij Mo en verkoopt aan je eigen klanten. Alles is van jou.'},
 {n:'Vaste lijn',who:'Jopie van de groothandel',rep:400,r:4,disc:.1,cap:40,store:1500,dealers:0,d:'Jopie levert grotere partijen en partydrugs, tien procent goedkoper.'},
 {n:'Groothandel',who:'De Antwerpenaar',rep:2000,r:8,disc:.2,cap:60,store:6000,dealers:3,d:'Jij levert aan andere dealers en zet straatdealers voor je aan het werk.'},
 {n:'Direct bij de bron',who:'Contact in de haven',rep:8000,r:12,disc:.35,cap:120,store:25000,dealers:6,d:'Rechtstreeks uit de containers. Veel goedkoper, en meer mensen op straat.'},
 {n:'Drugsbaron',who:'Je eigen lijn',rep:25000,r:16,disc:.45,cap:200,store:100000,dealers:12,lab:1,d:'Je eigen netwerk, je eigen lab en kilo\'s door de stad.'}];
// producten: inkoop per stuk, straatprijs, vanaf welk niveau, risico per verkoop, hitte, rep per stuk, aantal per verkoop (×cap)
const DRUGS=[
 {id:'vape',n:'Ongekeurde vapes',u:'stuk',u2:'stuks',buy:6,sell:[14,20],lv:0,risk:.02,heat:1,rep:1,k:1.5,col:'#7fd1c7',ic:'vape'},
 {id:'wiet',n:'Wiet',u:'zakje',u2:'zakjes',buy:25,sell:[45,60],lv:0,risk:.03,heat:2,rep:1,k:1,col:'#3fe395',ic:'leaf'},
 {id:'hasj',n:'Hasj',u:'blokje',u2:'blokjes',buy:30,sell:[55,75],lv:1,risk:.03,heat:2,rep:1,k:1,col:'#c9a227',ic:'block'},
 {id:'xtc',n:'XTC-pillen',u:'pil',u2:'pillen',buy:3,sell:[8,12],lv:2,risk:.05,heat:3,rep:.5,k:4,col:'#ff7ab8',ic:'pill'},
 {id:'miauw',n:'Miauw (4-MMC)',u:'gram',u2:'gram',buy:12,sell:[25,40],lv:2,risk:.05,heat:3,rep:2,k:1,col:'#b8a1ff',ic:'crystal'},
 {id:'speed',n:'Speed',u:'gram',u2:'gram',buy:6,sell:[15,22],lv:2,risk:.05,heat:3,rep:1.5,k:1.5,col:'#ffd36a',ic:'powder'},
 {id:'keta',n:'Ketamine',u:'gram',u2:'gram',buy:15,sell:[30,45],lv:3,risk:.06,heat:4,rep:2.5,k:1,col:'#a9dcff',ic:'vial'},
 {id:'coke',n:'Cocaïne',u:'gram',u2:'gram',buy:35,sell:[60,85],lv:3,risk:.07,heat:5,rep:4,k:1,col:'#f4f1ea',ic:'powder'},
 {id:'kilo',n:'Kilo coke (aan dealers)',u:'kilo',u2:'kilo',buy:21000,sell:[27000,33000],lv:5,risk:.1,heat:8,rep:60,k:.015,nodisc:1,col:'#e8b923',ic:'brick'}];
const DL_EN=8,DL_CD=45;
const dgU=(g,n)=>n===1?g.u:(g.u2||g.u+'s');
const dlS=()=>{if(!S.dl||typeof S.dl!=='object')S.dl={rep:0,stock:{},dealers:0,dp:'wiet',day:0,sold:0,rev:0};S.dl.stock=S.dl.stock||{};return S.dl};
const dlLvRaw=()=>{const D=dlS(),ri=rankIdx(S.xp);let l=0;DL_LV.forEach((x,i)=>{if(D.rep>=x.rep&&ri>=x.r)l=i});return l};
const dlLv=()=>dlLvRaw();
const dlBuy=g=>Math.max(1,Math.round(g.buy*(g.nodisc?1:1-DL_LV[dlLv()].disc)*100)/100);
const dlStockN=()=>Object.values(dlS().stock).reduce((a,b)=>a+b,0);
const dlCap=g=>Math.max(1,Math.round(DL_LV[dlLv()].cap*g.k));
const dlRisk=g=>Math.min(.45,g.risk*(1+S.heat/80)*(1-tierK()*.3)*(1-((typeof fitFx==='function'?fitFx('heat'):0)||0)));
// betaal met je contante geld, zwart eerst (drugs koop je niet met een bankpas)
function dlPay(x){const z=Math.min(zwart(),x);S.zwart=zwart()-z;S.cash-=x}
const dlXp=rev=>Math.max(1,Math.round(1.2*Math.pow(Math.max(0,rev),.55)));
// straatdealers en het lab: één keer per speldag (4 uur), ook offline ingehaald
function dlTick(){const D=dlS();const cur=dayStart(now());if(!D.day){D.day=cur;return}let n=0;
 while(D.day<cur&&n<30){D.day=dayStart(D.day+DAY_MS+5400000);n++;const L=DL_LV[dlLv()];
  if(L.lab){['xtc','speed'].forEach(id=>{const room=Math.max(0,L.store-dlStockN()),q=Math.min(room,id==='xtc'?600:250);if(q>0)D.stock[id]=(D.stock[id]||0)+q})}
  if(D.dealers>0){const g=DRUGS.find(x=>x.id===D.dp)||DRUGS[1];let have=D.stock[g.id]||0,sold=0,lostDealer=0;
   for(let i=0;i<D.dealers;i++){if(Math.random()<.04){lostDealer++;have=Math.max(0,have-Math.round(30*g.k));continue}const q=Math.min(have,Math.round(30*g.k));have-=q;sold+=q}
   D.stock[g.id]=have;const rev=Math.round(sold*(g.sell[0]+g.sell[1])/2*.75);if(rev>0){S.cash+=rev;addZwart(rev);D.rev=(D.rev||0)+rev;D.sold=(D.sold||0)+sold}
   if(lostDealer){D.dealers-=lostDealer;log(`Dealen: ${lostDealer} straatdealer${lostDealer>1?'s':''} opgepakt`,'bad')}
   if(rev>0)log(`Je straatdealers verkochten ${sold} ${dgU(g,sold)} ${g.n.toLowerCase()}: +${fmt(rev)} (na hun 25%)`,'ok')}}}
window.wk=window.wk||{view:null,amt:{}};
/* ---------------- Iconen ---------------- */
const WK_IC={mail:'<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',car:'<path d="M5 16l1.5-5h11L19 16"/><path d="M4 16h16v3H4z"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>',
 box:'<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/>',bike:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-7h5l3 7M10 10l-1-3h3"/>',
 tent:'<path d="M3 20L12 4l9 16z"/><path d="M12 4v16M9 20l3-6 3 6"/>',door:'<path d="M6 21V4h10v17"/><path d="M4 21h16"/><circle cx="13" cy="13" r="1"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 13h18"/>',crown:'<path d="M3 18h18l-2-10-5 4-2-6-2 6-5-4z"/>',
 work:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/>',deal:'<path d="M3 12l4-4 4 3 4-4 6 6"/><path d="M3 18h18"/>'};
const wkI=(k,c)=>`<svg viewBox="0 0 24 24" fill="none" stroke="${c||'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${WK_IC[k]||WK_IC.work}</svg>`;
// producticonen in kleur
function dgIc(g){const c=g.col;const I={
 vape:`<rect x="10" y="3" width="4" height="15" rx="2" fill="#2b2f37" stroke="${c}" stroke-width="1.4"/><rect x="10.6" y="5" width="2.8" height="4" rx="1" fill="${c}" opacity=".7"/><path d="M12 18v3" stroke="${c}" stroke-width="2"/><path d="M15 4c2-1 2 1 4 0M16 7c2-1 2 1 4 0" stroke="#cfd6e2" stroke-width="1" fill="none" opacity=".6"/>`,
 leaf:`<path d="M12 21v-6M12 15c-1-4-5-6-8-6 2 3 4 6 8 6zM12 15c1-4 5-6 8-6-2 3-4 6-8 6zM12 15c-2-4-2-8 0-12 2 4 2 8 0 12z" fill="${c}" stroke="#1d5a3a" stroke-width=".8"/>`,
 block:`<path d="M5 9l7-4 7 4v7l-7 4-7-4z" fill="#8a6a1e"/><path d="M5 9l7 4 7-4M12 13v7" stroke="#5b4510" stroke-width="1" fill="none"/><path d="M5 9l7-4 7 4-7 4z" fill="${c}"/>`,
 pill:`<circle cx="12" cy="12" r="7.5" fill="${c}" stroke="#7a2350" stroke-width="1"/><path d="M8 10.5l2 2 3-4 2 2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="9.5" cy="9" r="1.3" fill="#fff" opacity=".5"/>`,
 crystal:`<path d="M12 3l5 6-5 12-5-12z" fill="${c}" stroke="#5b4a9a" stroke-width="1"/><path d="M7 9h10M12 3v18" stroke="#fff" stroke-width=".7" opacity=".5"/>`,
 powder:`<path d="M6 8h12l-1 11H7z" fill="#e9eef7" stroke="#9aa6bb" stroke-width="1"/><path d="M6 8l2-3h8l2 3" fill="#cfd6e2"/><path d="M8 15c2-2 6-2 8 0v4H8z" fill="${c}" opacity=".9"/>`,
 vial:`<path d="M10 3h4v4l3 11a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3l3-11z" fill="#1b2333" stroke="${c}" stroke-width="1.2"/><path d="M8.2 14h7.6l.9 4a2 2 0 0 1-2 2h-5.4a2 2 0 0 1-2-2z" fill="${c}"/>`,
 brick:`<path d="M3 10l9-4 9 4v6l-9 4-9-4z" fill="#d9b25a" stroke="#8a6a20" stroke-width="1"/><path d="M3 10l9 4 9-4M12 14v6" stroke="#8a6a20" stroke-width="1" fill="none"/><path d="M7 9l4-2" stroke="#fff" stroke-width=".8" opacity=".6"/>`};
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${I[g.ic]||I.powder}</svg>`}
/* ---------------- Pagina ---------------- */
V.werk=()=>{if(wk.view==='jobs')return wkJobsHtml();if(wk.view==='deal')return wkDealHtml();
 const D=dlS(),L=DL_LV[dlLv()],ri=rankIdx(S.xp),open=JOBS.filter(j=>ri>=j.r),ready=open.filter(j=>!cdLeft('job_'+j.id)).length;
 return `<h1>Werk en dealen</h1><p class="sub">Op straat verdien je ook geld zonder in te breken: gewoon werken voor mensen, of dealen voor iemand tot je je eigen netwerk hebt.</p>
 <div class="wk-ban">
  <button class="wk-b jobs" onclick="wk.view='jobs';render();scrollTo(0,0)"><span class="wk-b-ic">${wkI('work')}</span><span class="wk-b-t"><span class="label">Wit geld · geen risico</span><b>Klusjes</b><span>Folders, verhuizingen, portier, chauffeur. Eerlijk werk, eerlijk loon.</span>
   <span class="wk-b-f"><em><b>${open.length}</b> van ${JOBS.length} klusjes open</em><em><b>${ready}</b> klaar</em></span><span class="wk-b-go">Aan het werk ›</span></span></button>
  <button class="wk-b deal" onclick="wk.view='deal';render();scrollTo(0,0)"><span class="wk-b-ic">${dgIc(DRUGS[1])}</span><span class="wk-b-t"><span class="label">Zwart geld · hitte · risico</span><b>Dealen</b><span>${L.d}</span>
   <span class="wk-b-f"><em>Jij: <b>${L.n}</b></em><em><b>${Math.floor(D.rep).toLocaleString('nl-NL')}</b> rep</em>${D.dealers?`<em><b>${D.dealers}</b> dealers</em>`:''}</span><span class="wk-b-go">Naar ${L.who.split(' ')[0]==='Je'?'je netwerk':L.who.toLowerCase()} ›</span></span></button>
 </div>`};
const wkBack=t=>`<div class="vb-bar"><button class="vb-back" onclick="wk.view=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Werk en dealen</span></button><h2>${t}</h2></div>`;
function wkJobsHtml(){const ri=rankIdx(S.xp);
 return `${wkBack('Klusjes')}<p class="sub">Gewoon werk: wit geld, een beetje ervaring en geen politie. Betere klussen komen met je rang.</p>
 <div class="wk-jobs">${JOBS.map(j=>{const lock=ri<j.r,left=cdLeft('job_'+j.id),tired=S.energy<j.en,jail=inJail(),ok=!lock&&!left&&!tired&&!jail;
  return `<article class="wk-job ${lock?'lock':''}"><span class="wk-j-ic">${wkI(j.ic)}</span><div class="wk-j-b"><b>${j.n}</b><p>${j.d}</p>
   <div class="wk-j-f"><em class="w">${fmt(j.p[0])}–${fmt(j.p[1])} wit</em><em>${j.en} energie</em><em>+${j.xp} XP</em><em>elke ${fmtClock(j.cd*1000)}</em></div></div>
   <button class="btn ${ok?'':'ghost'}" onclick="act.job('${j.id}')" ${ok?'':'disabled'}>${lock?'Vanaf '+RANKS[j.r][0]:jail?'Je zit vast':left?'Nog '+fmtClock(left):tired?'Te moe':'Doen'}</button></article>`}).join('')}</div>`}
function wkDealHtml(){const D=dlS(),lv=dlLv(),L=DL_LV[lv],nx=DL_LV[lv+1],ri=rankIdx(S.xp),stockN=dlStockN();
 const pct=nx?Math.min(100,(D.rep-L.rep)/Math.max(1,nx.rep-L.rep)*100):100;
 const avail=DRUGS.filter(g=>g.lv<=lv||(lv===0&&g.lv===0)),later=DRUGS.filter(g=>g.lv>lv);
 const card=g=>{const own=D.stock[g.id]||0,cap=dlCap(g),left=cdLeft('deal_'+g.id),mo=lv===0,q=mo?cap:Math.min(cap,own),pr=dlBuy(g),risk=Math.round(dlRisk(g)*100);
  const amts=[10,50,250,1000].map(x=>Math.round(x*g.k)).filter((x,i,a)=>x>=1&&a.indexOf(x)===i&&x<=Math.max(1,L.store));
  const room=Math.max(0,L.store-stockN),cash=S.cash;
  return `<article class="dg" style="--dc:${g.col}"><div class="dg-h"><span class="dg-ic">${dgIc(g)}</span><div><b>${g.n}</b><small>per ${g.u} · inkoop ${fmt(pr)} · straat ${fmt(g.sell[0])}–${fmt(g.sell[1])}</small></div>${mo?'':`<em class="dg-own"><b>${own.toLocaleString('nl-NL')}</b> ${dgU(g,own)}</em>`}</div>
   ${mo?'':`<div class="dg-buy"><span>Inkopen</span>${amts.map(a=>{const c=a*pr,ok=a<=room&&cash>=c;return `<button onclick="act.dlBuy('${g.id}',${a})" ${ok?'':'disabled'} title="${fmt(c)}">${a.toLocaleString('nl-NL')}<small>${fmt(c)}</small></button>`}).join('')}</div>`}
   <div class="dg-sell"><div><span>Verkopen op straat</span><b>${q?q.toLocaleString('nl-NL')+' '+dgU(g,q):'niets op voorraad'}</b><small>${mo?'Mo\'s spul: jij houdt 30% · ':''}${DL_EN} energie · ${risk}% kans op een controle</small></div>
    <button class="btn ${q&&!left&&!inJail()&&S.energy>=DL_EN?'':'ghost'}" onclick="act.dlSell('${g.id}')" ${q&&!left&&!inJail()&&S.energy>=DL_EN?'':'disabled'}>${inJail()?'Je zit vast':left?'Nog '+fmtClock(left):S.energy<DL_EN?'Te moe':'De straat op'}</button></div></article>`};
 const dealersHtml=L.dealers?(()=>{const g=DRUGS.find(x=>x.id===D.dp)||DRUGS[1],cost=25000*(lv-1);return `<section class="dl-crew"><div class="dl-crew-h"><span class="label">Straatdealers</span><b>${D.dealers} / ${L.dealers}</b></div>
   <p>Ze verkopen elke speldag (4 uur) ieder ±${Math.round(30*g.k)} ${dgU(g,2)} van je voorraad en houden 25%. Soms wordt er een opgepakt.</p>
   <div class="dl-crew-a"><label>Ze verkopen <select onchange="act.dlDp(this.value)">${avail.filter(x=>x.id!=='kilo').map(x=>`<option value="${x.id}" ${x.id===D.dp?'selected':''}>${x.n}</option>`).join('')}</select></label>
    <button class="btn sm" onclick="act.dlHire()" ${D.dealers<L.dealers&&S.cash>=cost?'':'disabled'}>Dealer aannemen · ${fmt(cost)}</button></div></section>`})():'';
 return `${wkBack('Dealen')}
 <section class="dl-net"><div class="dl-net-h"><div><span class="label">Jouw plek in het netwerk</span><b>${L.n}</b><em>${L.who} · ${Math.floor(D.rep).toLocaleString('nl-NL')} rep</em></div>
   <div class="dl-kpi"><div><span>Voorraad</span><b>${stockN.toLocaleString('nl-NL')}${L.store?' / '+L.store.toLocaleString('nl-NL'):''}</b></div><div><span>Korting</span><b>${Math.round(L.disc*100)}%</b></div><div><span>Verdiend</span><b>${fmt(D.rev||0)}</b></div></div></div>
  <ol class="dl-steps">${DL_LV.map((x,i)=>`<li class="${i<lv?'done':i===lv?'now':''}"><i>${i+1}</i><b>${x.n}</b><span>${x.rep.toLocaleString('nl-NL')} rep · ${RANKS[x.r][0]}</span></li>`).join('')}</ol>
  ${nx?`<div class="dl-bar"><i style="width:${pct}%"></i></div><p class="dl-next">Volgende: <b>${nx.n}</b> (${nx.who}) bij ${nx.rep.toLocaleString('nl-NL')} rep${ri<nx.r?` en vanaf <b>${RANKS[nx.r][0]}</b>`:''}. ${nx.d}</p>`:'<p class="dl-next">Je hebt alles in handen: je eigen lab maakt elke speldag pillen en speed.</p>'}
 </section>
 ${dealersHtml}
 <div class="dg-grid">${avail.map(card).join('')}</div>
 ${later.length?`<div class="tierhead"><h2>Nog niet in je netwerk</h2><span>Komt vrij met een hoger niveau</span></div><div class="dg-later">${later.map(g=>`<div class="dg-l" style="--dc:${g.col}"><span class="dg-ic">${dgIc(g)}</span><b>${g.n}</b><small>vanaf ${DL_LV[g.lv].n}</small></div>`).join('')}</div>`:''}
 <p class="fit-hint">Inkopen betaal je contant (zwart geld eerst). Wat je verkoopt is zwart geld. Hoe hoger je hitte, hoe groter de kans op een controle; bij een controle ben je die partij kwijt en neemt de politie de helft van je voorraad van dat spul mee.</p>`}
Object.assign(act,{
 job(id){const j=JOBS.find(x=>x.id===id);if(!j||inJail()||rankIdx(S.xp)<j.r||cdLeft('job_'+id))return;if(S.energy<j.en){toast('Te moe','bad');return}
  S.energy-=j.en;S.cd['job_'+id]=now()+j.cd*1000*waitK();const g=Math.round(rnd(j.p[0],j.p[1])*(1+tierK()*.5));S.cash+=g;addXp(j.xp);S.stats.jobs=(S.stats.jobs||0)+1;
  SFX.chip();toast(`${j.n}: +${fmt(g)} wit`,'ok');log(`${j.n}: ${fmt(g)} verdiend (wit)`,'ok');save();render()},
 dlBuy(id,n){const g=DRUGS.find(x=>x.id===id),L=DL_LV[dlLv()];if(!g||g.lv>dlLv()||dlLv()===0||inJail())return;n=Math.max(1,n|0);
  if(dlStockN()+n>L.store){toast('Je opslag zit vol ('+L.store.toLocaleString('nl-NL')+')','bad');return}
  const c=Math.round(n*dlBuy(g));if(S.cash<c){toast('Niet genoeg contant geld','bad');return}
  dlPay(c);const D=dlS();D.stock[id]=(D.stock[id]||0)+n;SFX.chip();toast(`${n.toLocaleString('nl-NL')} ${dgU(g,n)} ${g.n.toLowerCase()} ingekocht: ${fmt(c)}`,'ok');log(`Dealen: ${n} ${g.u} ${g.n.toLowerCase()} ingekocht (${fmt(c)})`,'info');save();render()},
 dlSell(id){const g=DRUGS.find(x=>x.id===id),D=dlS(),lv=dlLv();if(!g||inJail()||cdLeft('deal_'+id))return;if(g.lv>lv&&!(lv===0&&g.lv===0))return;
  if(S.energy<DL_EN){toast('Te moe','bad');return}const mo=lv===0,q=mo?dlCap(g):Math.min(dlCap(g),D.stock[id]||0);if(q<1)return;
  S.energy-=DL_EN;S.cd['deal_'+id]=now()+DL_CD*1000*waitK();
  if(Math.random()<dlRisk(g)){if(!mo){D.stock[id]=Math.max(0,(D.stock[id]||0)-q);D.stock[id]=Math.floor(D.stock[id]/2)}addHeat(12);D.rep=Math.max(0,D.rep-q*g.rep*.5);S.stats.fails++;save();
   arrest(60+Math.round(g.risk*1500),'Politiecontrole!',`Agenten houden je staande met ${q} ${dgU(g,q)} ${g.n.toLowerCase()} op zak.${mo?' Mo is niet blij.':' Ze nemen ook de helft van je voorraad mee.'}`,{flee:g.risk>=.06?4:3});return}
  const price=g.sell[0]+Math.random()*(g.sell[1]-g.sell[0]),rev=Math.round(q*price*(mo?.3:1)*(1+tierK()*.2));
  if(!mo)D.stock[id]-=q;S.cash+=rev;addZwart(rev);D.rep+=q*g.rep;D.sold=(D.sold||0)+q;D.rev=(D.rev||0)+rev;addHeat(g.heat);addXp(dlXp(rev));
  const lv0=lv,lv1=dlLv();SFX.win(2);toast(`${q} ${dgU(g,q)} ${g.n.toLowerCase()} verkocht: +${fmt(rev)}`+(lv1>lv0?` · je bent nu ${DL_LV[lv1].n}!`:''),lv1>lv0?'lvl':'ok');
  log(`Dealen: ${q} ${g.u} ${g.n.toLowerCase()} verkocht voor ${fmt(rev)}`+(lv1>lv0?` · nieuw niveau: ${DL_LV[lv1].n}`:''),'ok');save();render()},
 dlHire(){const D=dlS(),lv=dlLv(),L=DL_LV[lv],cost=25000*(lv-1);if(D.dealers>=L.dealers)return;if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  dlPay(cost);D.dealers++;if(!D.day)D.day=dayStart(now());SFX.chip();toast('Nieuwe straatdealer aan het werk','ok');log(`Dealen: straatdealer aangenomen (${fmt(cost)})`,'info');save();render()},
 dlDp(id){const D=dlS();if(DRUGS.find(x=>x.id===id))D.dp=id;save();render()}});
