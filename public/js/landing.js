// Website van Onderwereld. Eén pagina met een eigen adres per onderwerp (History API):
//   /  ·  /misdaden  ·  /casino  ·  /casino/<spel>  ·  /families  ·  /families/<id>  ·  /rangen  ·  /training
// De server stuurt de bekende adressen (/, /misdaden, /casino/<spel> enz.) naar index.html met de juiste titel; onbekende adressen krijgen een 404 met dezelfde pagina ("Doodlopende steeg").
// Alle cijfers komen uit de echte speldata: RANKS, CRIMES, FAMILIES, FAM_RANKS, FAM_HEISTS, BIZ, TRAININGS, RELAX, GEAR, HOMES
// (data.js), FAM_LORE en RANK_LORE (lore.js) en de slotsymbolen (icons.js). slot.js en vis.js laden pas op de casinopagina's.
(function(){
'use strict';
const q=(s,r)=>(r||document).querySelector(s), qa=(s,r)=>[...(r||document).querySelectorAll(s)];
const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const canHover=!!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nl=(n,d)=>(+n).toLocaleString('nl-NL',{maximumFractionDigits:d||0,minimumFractionDigits:0});
const eur=n=>'€'+nl(Math.round(n));
const eurS=n=>n>=1e6?'€'+nl(n/1e6,n>=1e7?0:1)+' mln':n>=1e4?'€'+nl(Math.round(n/1000))+'k':eur(n);
const pct=n=>nl(n,1)+'%';
const dur=s=>{s=Math.round(s);if(s<60)return s+' s';const m=Math.floor(s/60),r=s%60;return r?m+' min '+r+' s':m+' min'};
const mins=m=>m<60?m+' min':m%60?Math.floor(m/60)+' u '+(m%60)+' min':(m/60)+' uur';
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, pick=a=>a[Math.floor(Math.random()*a.length)];
// merknaam en genre uit brand.json (de server zet ze in window.BRAND)
const BR=(window.BRAND&&window.BRAND.name)||'Onderwereld',GENRE=(window.BRAND&&window.BRAND.genre)||'Nederlandstalige maffia-browsergame';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const getToken=()=>{try{return localStorage.getItem('ow_token')}catch(e){return null}};
const setToken=t=>{try{t?localStorage.setItem('ow_token',t):localStorage.removeItem('ow_token')}catch(e){}};
const RN=RANKS.map(r=>r[0]);
const rk=i=>RN[clamp(i,0,RN.length-1)];
const lootK=ri=>1+ri*(typeof RANK_LOOT==='number'?RANK_LOOT:.06);
const famLore=id=>(typeof FAM_LORE!=='undefined'&&FAM_LORE[id])||null;
const rankLore=n=>(typeof RANK_LORE!=='undefined'&&RANK_LORE[n])||'';
const famRankLore=n=>(typeof FAMRANK_LORE!=='undefined'&&FAMRANK_LORE[n])||'';
const heavyR=typeof HEAVY_R==='number'?HEAVY_R:5;
// Onderdelen die op een rang opengaan, maar niet in de lijsten hierboven staan
const SPECIAL=[
 {r:0,t:'Auto\'s stelen',d:'Zoek de straat af en kraak het slot.'},
 {r:4,t:'Carjacken',d:'Een auto die stopt voor rood, is van jou als je snel genoeg bent.'},
 {r:heavyR,t:'Zware klussen',d:'Klussen waarvoor je een wapen en lef nodig hebt.'},
 {r:7,t:'Huurmoorden',d:'Een envelop met een naam, een adres en een bedrag.'}];
const RANK_REWARD=ri=>{if(!ri||typeof RANK_CODES==='undefined')return 0;return RANK_CODES[rk(ri).toLowerCase()]||0};

// Lijniconen (zelfde stijl als in het spel)
const IC={
 crimes:'<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>',
 casino:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
 fam:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5"/>',
 rank:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 6h3v2a3 3 0 01-3 3M7 6H4v2a3 3 0 003 3"/>',
 skills:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 biz:'<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>',
 cars:'<path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/>',
 hits:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/>',
 house:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
 shop:'<path d="M4 7h16l-1.5 12h-13zM9 7V5a3 3 0 016 0v2"/>',
 gym:'<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 013 0V11M11 10V4.5a1.5 1.5 0 013 0V11M14 10.5V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6.5 7S5 17.5 4 15l-1.5-3.5a1.5 1.5 0 012.6-1.4L8 13"/>',
 run:'<circle cx="14" cy="4" r="2"/><path d="M6 21l3-6 3 2 2 5M9 15l1-5 4 1 3 3M10 10l-4 1"/>',
 wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 11.2L3.5 10M14.4 11.2l6.1-1.2"/>',
 mask:'<path d="M4 5h16v6a8 8 0 01-16 0z"/><path d="M8.5 10h1M14.5 10h1M9 15c1.8 1.3 4.2 1.3 6 0"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
 chip:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
 brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18M11 12v2.5h2V12"/>',
 scale:'<path d="M12 3v17M7 21h10M4 7h16M6.5 7L3 14a3.5 3.5 0 007 0zM17.5 7L14 14a3.5 3.5 0 007 0z"/>',
 cup:'<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 11h2a2 2 0 010 4h-2M8 3v3M12 3v3"/>',
 snack:'<path d="M5.5 10h13l-1.6 11H7.1zM8 10L6.8 3.5M11 10V3M14 10l1-6.5M17 10l2.2-5.5"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 8.2L20 20M8.2 15.8L20 4"/>',
 steam:'<path d="M4 20h16M7 16c0-2 2-2 2-4s-2-2-2-4M12 16c0-2 2-2 2-4s-2-2-2-4M17 16c0-2 2-2 2-4s-2-2-2-4"/>',
 glass:'<path d="M5 4h14l-7 8zM12 12v7M8 20h8"/>',
 spa:'<path d="M12 21c-4.5 0-8.5-3.2-8.5-8.5 3.4 0 6.6 1.7 8.5 4.4 1.9-2.7 5.1-4.4 8.5-4.4 0 5.3-4 8.5-8.5 8.5z"/><path d="M12 17c-1.7-2.2-2.3-4.6-2.3-7.4C10.9 8.5 11.6 7.7 12 7c.4.7 1.1 1.5 2.3 2.6 0 2.8-.6 5.2-2.3 7.4z"/>',
 yacht:'<path d="M2.5 16.5h19L18.8 21H5.2zM12 2.5v12M12 3.5l7 11h-7M10 6.5L4.5 14.5H10"/>',
 plane:'<path d="M21.5 2.5L2.5 10l7.5 3 3 8z"/><path d="M10 13l11.5-10.5"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7a4 4 0 018 0v4"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
 play:'<path d="M7 4.5v15l12-7.5z"/>',
 pause:'<path d="M7 4.5v15M17 4.5v15"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 jail:'<path d="M5 3v18M10 3v18M15 3v18M20 3v18M3 3h19M3 21h19"/>',
 xp:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
 cred:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/>'};
const ic=(k,c)=>`<svg class="ic${c?' '+c:''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]||''}</svg>`;
const crest=(f,c)=>`<span class="crest${c?' '+c:''}" style="--fc:${f.col}">${esc(f.m)}</span>`;

/* ---------- Toestand ---------- */
let loggedIn=false,userName='';
const app=q('#app');
let leave=[],renderId=0,curPath=null;               // opruimen bij het verlaten van een pagina (animaties, timers, observers)
const onLeave=fn=>leave.push(fn);
const every=(fn,ms)=>{const t=setInterval(fn,ms);onLeave(()=>clearInterval(t))};
const later=(fn,ms)=>{const t=setTimeout(fn,ms);onLeave(()=>clearTimeout(t));return t};

/* ---------- Script pas laden als het nodig is (slot.js, vis.js) ---------- */
const loaded={};
function need(src){if(loaded[src])return loaded[src];
  loaded[src]=new Promise(res=>{const s=document.createElement('script');s.src=src;s.onload=()=>res(true);s.onerror=()=>res(false);document.head.appendChild(s)});
  return loaded[src]}

/* ---------- Kop, menu en navigatie ---------- */
const top=q('#mast');
const onScroll=()=>top.classList.toggle('solid',true);
addEventListener('scroll',onScroll,{passive:true});
const burger=q('#burger'),mnav=q('#mnav');
function menu(open){const was=!mnav.hidden;mnav.hidden=!open;burger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);if(open){const a=q('a',mnav);a&&a.focus({preventScroll:true})}else if(was)burger.focus({preventScroll:true})}
burger.addEventListener('click',()=>menu(mnav.hidden));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mnav.hidden)menu(false)});
function setActive(path){const seg=path.split('/')[1]||'';
  qa('[data-nav]').forEach(a=>{const on=a.dataset.nav===seg;a.classList.toggle('on',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')})}

/* ---------- Router ---------- */
const ROUTES=[];
const route=(re,fn)=>ROUTES.push([re,fn]);
function render(path,opt){opt=opt||{};renderId++;curPath=path;
  leave.forEach(fn=>{try{fn()}catch(e){}});leave=[];
  let out=null;for(const [re,fn] of ROUTES){const m=path.match(re);if(m){out=fn(...m.slice(1));if(out)break}}
  if(!out)out=notFound();
  app.className='app '+(out.cls||'');app.innerHTML=out.html;
  document.title=out.title||BR;
  const md=q('meta[name="description"]');if(md&&out.desc)md.setAttribute('content',out.desc);
  {const site=((window.BRAND&&window.BRAND.url)||location.origin).replace(/\/+$/,''),url=site+(path==='/'?'/':path),set=(sel,v)=>{const m=q(sel);if(m&&v)m.setAttribute(sel.startsWith('link')?'href':'content',v)};
   set('link[rel="canonical"]',url);set('meta[property="og:url"]',url);set('meta[property="og:title"]',document.title);set('meta[name="twitter:title"]',document.title);
   if(out.desc){set('meta[property="og:description"]',out.desc);set('meta[name="twitter:description"]',out.desc)}
   const rb=q('meta[name="robots"]');if(rb)rb.setAttribute('content',out.cls==='pg-404'?'noindex,nofollow':'index,follow')}
  setActive(path);onScroll();
  if(opt.pop)scrollTo(0,opt.y||0);else if(!opt.keep)scrollTo(0,0);
  if(out.after)out.after();
  if(!opt.first&&!opt.pop){app.focus({preventScroll:true})}
}
const cleanPath=p=>(p.replace(/\/+$/,'')||'/').toLowerCase();
function go(href){const u=new URL(href,location.href);if(u.origin!==location.origin){location.href=href;return}
  const p=cleanPath(u.pathname);
  if(p==='/'||p==='/start'||p==='/lidmaatschap'){location.href=u.pathname+u.search+u.hash;return}   // de voorpagina komt kant-en-klaar van de server
  try{history.replaceState(Object.assign({},history.state,{y:scrollY}),'')}catch(e){}
  if(p===cleanPath(location.pathname)&&!u.hash){scrollTo({top:0,behavior:reduce?'auto':'smooth'});return}
  history.pushState({y:0},'',p+u.hash);menu(false);render(p);
  if(u.hash){const t=q(u.hash);t&&t.scrollIntoView()}}
if('scrollRestoration' in history)history.scrollRestoration='manual';
document.addEventListener('click',e=>{const h=e.target.closest('a[href^="#"]');if(h&&h.getAttribute('href').length>1){const t=q(h.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})}return}
  const a=e.target.closest('a[data-link]');if(!a)return;
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target==='_blank')return;
  e.preventDefault();go(a.getAttribute('href'))});
addEventListener('popstate',e=>{const p=cleanPath(location.pathname);if(p===curPath)return;menu(false);render(p,{pop:true,y:(e.state&&e.state.y)||0})});

function notFound(){return{title:'Niet gevonden · '+BR,cls:'pg-404',html:`<section class="ph"><div class="wrap"><div class="kick"><span class="dot"></span>Doodlopende steeg</div>
  <h1 class="ph-t">Hier is<br><em>niks.</em></h1><p class="ph-lede">Deze straat staat op geen enkele kaart. Misschien een typfout, misschien heeft iemand het bord weggehaald.</p>
  <div class="hero-cta"><a class="btn xl" href="/" data-link>Terug naar de stad</a></div></div></section>`}}

// Kop van een onderpagina: kicker, grote titel, korte tekst en kerncijfers
function pageHead(o){return `<section class="ph${o.cls?' '+o.cls:''}"><div class="wrap ph-in">
  <div class="ph-copy">${o.back?`<a class="ph-back" href="${o.back[0]}" data-link>${ic('back')}${esc(o.back[1])}</a>`:''}
   <div class="kick"><span class="dot"></span>${o.kick}</div><h1 class="ph-t">${o.title}</h1>${o.lede?`<p class="ph-lede">${o.lede}</p>`:''}</div>
  ${o.stats?`<dl class="ph-stats">${o.stats.map(s=>`<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('')}</dl>`:''}
 </div>${o.art?`<div class="ph-art" aria-hidden="true">${o.art}</div>`:''}</section>`}
// Verder kijken: links naar de andere onderdelen onderaan elke pagina
const PAGES=[['misdaden','Misdaden',()=>CRIMES.length+' klussen'],['casino','Casino',()=>GAMES.length+' spellen'],['families','Families',()=>FAMILIES.length+' families'],['rangen','Rangen',()=>RANKS.length+' rangen'],['training','Training',()=>TRAININGS.length+' plekken']];
function moreHtml(skip){return `<section class="more-blk wrap rv"><div class="label">Verder kijken</div><nav class="more">${PAGES.filter(p=>p[0]!==skip).map(p=>`<a href="/${p[0]}" data-link><b>${p[1]}</b><span>${p[2]()}</span>${ic('arrow')}</a>`).join('')}</nav></section>`}
function ctaHtml(t1,t2,lead){return `<section class="final wrap rv"><h2 class="mega small"><span>${t1}</span><span><em>${t2}</em></span></h2><p class="lede">${lead}</p>
  <div class="hero-cta">${loggedIn?'<a class="btn xl" href="/game">Verder spelen</a>':'<a class="btn xl" href="/start" data-auth="register">Speel gratis</a><a class="btn ghost xl" href="/?login=1" data-auth="login">Inloggen</a>'}</div></section>`}

/* ================= Casino: de spellen en hun illustraties staan in covers.js ================= */
const {GAMES,gameBy,SUIT,pcard,chip,RL_ORDER,RL_RED,arcSeg,wheelSvg,coverSvg}=COV;
/* ================= Voorpagina: komt van de server (lp-views.js) en wordt bediend door lp-home.js ================= */
/* ---------- Casino-kaarten en de voedselketen (casino- en familiepagina's) ---------- */
function coverCard(g,i,uid){return `<a class="cov rv" href="/casino/${g.slug}" data-link style="--c:${g.col};--d:${i*50}ms"><div class="cov-art"><div class="cov-in">${coverSvg(g.id,(uid||'h')+g.id)}<i class="cov-glare"></i></div></div>
 <div class="cov-txt"><span class="cov-k">${g.kind}</span><b>${g.n}</b><span class="cov-tags">${g.tags.map(t=>`<em>${t}</em>`).join('')}</span></div></a>`}
const chainSorted=()=>FAMILIES.slice().sort((a,b)=>a.r-b.r||a.cred-b.cred);
/* ================= Misdaden: alle klussen, met een kaart van kans tegen buit ================= */
const kansIn=c=>Math.min(95,Math.max(5,c.base+c.r*2));   // kans op de rang waarop de klus opengaat, zonder spullen of training
const kansAt=(c,ri)=>Math.min(95,Math.max(5,c.base+ri*2)); // zelfde rekensom op een gekozen rang (in het spel: chanceRaw in state.js)
const avgLoot=c=>(c.min+c.max)/2;
const fleeTxt=c=>{const f=typeof FLEE_LEVELS!=='undefined'&&FLEE_LEVELS[c.flee];return f?f.label:'—'};
const fleeWhere=c=>{const f=typeof FLEE_LEVELS!=='undefined'&&FLEE_LEVELS[c.flee];return f?f.where:''};
const CX_SORT=[['rang','Op rang'],['buit','Meeste buit'],['kans','Hoogste kans'],['xp','Meeste XP per energie'],['straf','Kortste straf']];
function crimesPage(){
 const maxL=Math.max(...CRIMES.map(c=>c.max)),maxJ=Math.max(...CRIMES.map(c=>c.jail)),heavy=CRIMES.filter(c=>c.r>=heavyR).length;
 return {title:'Misdaden · '+BR,cls:'pg-crimes',desc:'Alle '+CRIMES.length+' klussen van '+BR+': buit, kans, energie en straf per rang.',
 html:pageHead({kick:'Misdaden',title:`${CRIMES.length} klussen.<br><em>Kies je risico.</em>`,
   lede:'Van een bekertje bij Centraal tot de goudreserve van een land. Elke klus kost energie en heeft een slaagkans. Gaat het mis, dan kun je nog vluchten: op straat lukt dat makkelijker dan in een afgesloten gebouw.',
   stats:[['Klussen',CRIMES.length],['Zwaar',heavy+' vanaf '+rk(heavyR)],['Hoogste buit',eurS(maxL)],['Langste straf',dur(maxJ)]]})
 +`<section class="wrap cx">
   <div class="cx-bar rv"><div class="cx-ranks" role="group" aria-label="Filter op rang"><button class="on" data-r="-1">Alle</button>${RN.map((n,i)=>`<button data-r="${i}">${n}</button>`).join('')}</div>
    <label class="cx-sort"><span class="label">Sorteer</span><select id="cxSort">${CX_SORT.map(s=>`<option value="${s[0]}">${s[1]}</option>`).join('')}</select></label></div>
   <figure class="cx-chart rv"><figcaption><b>Kans tegen buit</b><span class="cx-leg"><i class="a"></i><em id="cxLegA">Alle klussen</em><i class="b" id="cxLegB" hidden></i><em id="cxLegC" hidden>Overige</em></span></figcaption>
    <div class="cx-plot" id="cxPlot"><svg id="cxSvg" role="img" aria-label="Spreidingsdiagram: slaagkans tegen gemiddelde buit van alle klussen"></svg><div class="cx-tip" id="cxTip" hidden></div></div>
    <p class="cx-note">Horizontaal de kans op de rang waarop de klus opengaat, zonder training, spullen of familie. Verticaal de gemiddelde buit, zonder rangbonus (+${Math.round((lootK(1)-1)*100)}% per rang). Tik op een stip voor de klus.</p></figure>
   <div class="cx-list" id="cxList"></div></section>`+moreHtml('misdaden')+ctaHtml('Eerste klus','vandaag nog.','Bedelen bij Centraal is pas het begin.'),
 after(){initCrimes()}}}
route(/^\/misdaden$/,crimesPage);

function crimeRow(c){const k=kansIn(c);
 return `<article class="cr" id="cr-${c.id}" data-id="${c.id}"><div class="cr-main"><span class="cr-rank">${rk(c.r)}${c.r>=heavyR?' · zwaar':''}</span><h3>${esc(c.n)}</h3><p>${esc(c.d)}</p></div>
  <dl class="cr-kv"><div class="w"><dt>Buit</dt><dd>${eur(c.min)} – ${eur(c.max)}</dd></div>
   <div class="w" title="Kans op ${rk(c.r)}: basiskans ${c.base}% plus ${c.r*2} rangbonus, zonder training, spullen of familie"><dt>Kans op rang</dt><dd><b>${k}%</b><span class="cr-m"><i style="width:${k}%"></i></span>${k!==c.base?`<small class="cr-base">basis ${c.base}% + ${k-c.base}% rangbonus</small>`:''}</dd></div>
   <div><dt>Energie</dt><dd>${c.en}</dd></div><div><dt>XP</dt><dd>${c.xp}</dd></div><div><dt>Cred</dt><dd>${c.cr}</dd></div>
   <div><dt>Wachttijd</dt><dd>${dur(c.cd)}</dd></div><div><dt>Celstraf</dt><dd>${dur(c.jail)}</dd></div><div title="${esc(fleeWhere(c))}"><dt>Vluchten</dt><dd>${fleeTxt(c)}</dd></div></dl></article>`}
function initCrimes(){const list=q('#cxList'),svg=q('#cxSvg'),plot=q('#cxPlot'),tip=q('#cxTip'),sortSel=q('#cxSort');
 let rf=-1,sort='rang',sel=null;
 function rows(){let a=CRIMES.filter(c=>rf<0||c.r===rf);
  const by={rang:(x,y)=>x.r-y.r||x.min-y.min,buit:(x,y)=>avgLoot(y)-avgLoot(x),kans:(x,y)=>kansIn(y)-kansIn(x),xp:(x,y)=>y.xp/y.en-x.xp/x.en,straf:(x,y)=>x.jail-y.jail}[sort];
  a=a.slice().sort(by);
  if(sort==='rang'){let h='',cur=-1;a.forEach(c=>{if(c.r!==cur){cur=c.r;h+=`<div class="cr-h"><b>${rk(cur)}</b><span>${nl(RANKS[cur][1])} XP</span><em>${esc(rankLore(rk(cur)))}</em></div>`}h+=crimeRow(c)});return h}
  return a.map(crimeRow).join('')}
 function drawList(){list.innerHTML=rows()}
 // spreidingsdiagram
 const X0=15,X1=100,Y0=1,Y1=Math.log10(Math.max(...CRIMES.map(avgLoot))*1.5);
 let pts=[];
 function draw(){const w=plot.clientWidth,h=w<560?260:340,m={l:w<560?44:56,r:16,t:14,b:30};svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
  const sx=v=>m.l+(v-X0)/(X1-X0)*(w-m.l-m.r),sy=v=>h-m.b-(Math.log10(v)-Y0)/(Y1-Y0)*(h-m.t-m.b);
  let s='';[10,100,1000,10000,100000].forEach(v=>{if(Math.log10(v)>Y1)return;const y=sy(v);s+=`<line x1="${m.l}" x2="${w-m.r}" y1="${y}" y2="${y}" class="gl"/><text x="${m.l-8}" y="${y+3.5}" text-anchor="end" class="ax">${v>=1000?'€'+nl(v/1000)+'k':'€'+v}</text>`});
  [20,40,60,80,100].forEach(v=>{const x=sx(v);s+=`<line x1="${x}" x2="${x}" y1="${m.t}" y2="${h-m.b}" class="gl"/><text x="${x}" y="${h-m.b+18}" text-anchor="${v===100?'end':'middle'}" class="ax">${v===100?'100% kans':v+'%'}</text>`});
  pts=CRIMES.map(c=>({c,x:sx(kansIn(c)),y:sy(avgLoot(c))}));
  const on=p=>rf<0||p.c.r===rf;
  pts.filter(p=>!on(p)).forEach(p=>{s+=`<circle cx="${p.x}" cy="${p.y}" r="4.5" class="dt off"/>`});
  pts.filter(on).forEach(p=>{s+=`<circle cx="${p.x}" cy="${p.y}" r="5" class="dt${sel===p.c.id?' sel':''}"/>`});
  // alleen het begin en de top krijgen een label
  const lab=[CRIMES[0],CRIMES.reduce((a,c)=>avgLoot(c)>avgLoot(a)?c:a)];
  lab.forEach(c=>{const p=pts.find(v=>v.c===c);if(!p)return;const left=p.x>w*.6;s+=`<text x="${p.x+(left?-10:10)}" y="${p.y-9}" text-anchor="${left?'end':'start'}" class="dl">${esc(c.n)}</text>`});
  if(sel){const p=pts.find(v=>v.c.id===sel);if(p)s+=`<circle cx="${p.x}" cy="${p.y}" r="9" class="ring"/>`}
  s+=`<text x="${m.l-8}" y="${m.t-2}" text-anchor="end" class="ax t">buit</text>`;
  svg.innerHTML=s}
 function near(ev){const r=svg.getBoundingClientRect(),x=ev.clientX-r.left,y=ev.clientY-r.top;let best=null,bd=22*22;
  pts.forEach(p=>{const d=(p.x-x)**2+(p.y-y)**2;if(d<bd&&(rf<0||p.c.r===rf||d<64)){bd=d;best=p}});return best}
 function showTip(p){if(!p){tip.hidden=true;return}const c=p.c;tip.hidden=false;
  tip.innerHTML=`<b>${esc(c.n)}</b><span>${rk(c.r)} · kans ${kansIn(c)}%</span><span>${eur(c.min)} – ${eur(c.max)} · ${c.en} energie</span>`;
  const w=plot.clientWidth,tw=tip.offsetWidth;tip.style.left=clamp(p.x-tw/2,4,w-tw-4)+'px';tip.style.top=Math.max(4,p.y-tip.offsetHeight-14)+'px'}
 svg.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;const p=near(e);showTip(p);svg.style.cursor=p?'pointer':'default'});
 svg.addEventListener('pointerleave',()=>{tip.hidden=true});
 svg.addEventListener('click',e=>{const p=near(e);if(!p)return;sel=p.c.id;draw();showTip(pts.find(v=>v.c.id===sel));
  if(rf>=0&&p.c.r!==rf){rf=-1;qa('.cx-ranks button').forEach(b=>b.classList.toggle('on',b.dataset.r==='-1'));q('#cxLegA').textContent='Alle klussen';q('#cxLegB').hidden=q('#cxLegC').hidden=true;drawList()}
  const row=q('#cr-'+p.c.id);if(row){qa('.cr.flash').forEach(x=>x.classList.remove('flash'));row.classList.add('flash');row.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})}});
 q('.cx-ranks').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;rf=+b.dataset.r;sel=null;tip.hidden=true;
  qa('.cx-ranks button').forEach(x=>x.classList.toggle('on',x===b));q('#cxLegA').textContent=rf<0?'Alle klussen':'Klussen voor '+rk(rf);q('#cxLegB').hidden=q('#cxLegC').hidden=rf<0;
  b.scrollIntoView({behavior:reduce?'auto':'smooth',block:'nearest',inline:'center'});draw();drawList()});
 sortSel.addEventListener('change',()=>{sort=sortSel.value;drawList()});
 list.addEventListener('click',e=>{const r=e.target.closest('.cr');if(!r)return;sel=r.dataset.id;draw();const p=pts.find(v=>v.c.id===sel);showTip(p)});
 let rt;const onR=()=>{clearTimeout(rt);rt=setTimeout(draw,100)};addEventListener('resize',onR);onLeave(()=>removeEventListener('resize',onR));
 draw();drawList()}

/* ================= Casino ================= */
const flo=v=>'€'+Math.floor(v).toLocaleString('nl-NL');   // zelfde afronding als in het spel
const rules=a=>`<ul class="rules">${a.map(r=>`<li>${r}</li>`).join('')}</ul>`;
const payRows=(t,rows)=>`<div class="pay"><h3>${t}</h3><dl>${rows.map(r=>`<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('')}</dl></div>`;
function casinoPage(){
 return {title:'Casino · '+BR,cls:'pg-casino',desc:"Kluiskraker, Visdief, Mines, Hoogvlieger, Blackjack, Three Card Poker, Texas Hold'em, Roulette en Dubbel of niks.",
 html:pageHead({kick:'Casino',title:'Tien spellen.<br><em>Eén huis.</em>',lede:'Drie eigen slots, een vliegtuigje boven zee, een veld vol bommen en de klassiekers aan tafel. Echte regels, doorgerekende kansen. Het huis heeft een klein voordeel, net als in elk casino.',
   stats:[['Spellen',GAMES.length],['Eigen slots',GAMES.filter(g=>/slot/i.test(g.kind)).length],['Hoogste win','10.000×'],['Uitkomst','vast bij je klik']]})
 +`<section class="wrap"><div class="covers big">${GAMES.map((g,i)=>coverCard(g,i,'p')).join('')}</div></section>
  <section class="wrap facts-blk rv"><div class="facts"><div><h3>Geen voorproefje</h3><p>De uitkomst ligt vast op het moment dat je klikt en staat in je opslag. Verversen of weggaan verandert niets, en het spel laat niets zien voordat de animatie klaar is.</p></div>
   <div><h3>Doorgerekend</h3><p>Elke slot is miljoenen keren gesimuleerd. De terugbetaling blijft onder de 100%, dus op lange termijn wint het huis. Dubbel of niks is de enige zonder huisvoordeel.</p></div>
   <div><h3>VIP en High roller</h3><p>Met een lidmaatschap kom je vaker in de bonus en krijg je cashback op elke inzet. Het basisspel betaalt dan net iets minder, zodat het eerlijk blijft.</p></div>
   <div><h3>Alleen spelgeld · 18+</h3><p>Je speelt met virtueel geld uit het spel. Je kunt geen echt geld inzetten, winnen of uitbetalen. Het casino is bedoeld voor spelers van 18 jaar en ouder.</p></div></div></section>`
 +moreHtml('casino')+ctaHtml('Fiches','klaar?','Je eerste inzet staat al op tafel.'),
}}
route(/^\/casino$/,casinoPage);

const GD={
 kluis:{stats:S=>[['Raster','10 × 10'],['Max win',nl(S?S.MAX_WIN:5000)+'×'],['RTP','±92,5%'],['Bonus kopen',(S?S.BUY_COST:100)+'×']],
  rules:S=>{const fs=(S&&S.FS_BY_SC)||{3:10,4:12,5:14},sup=(S&&S.SUPER_SC)||6,ss=(S&&S.SUPER_SPINS)||8,mx=(S&&S.MAX_SPOT)||4096,need=(S&&S.BAR&&S.BAR.need)||3;
   return [`Vijf of meer gelijke symbolen die horizontaal of verticaal aan elkaar grenzen, vormen een cluster en betalen uit.`,
   `De winnende symbolen ontploffen en er vallen nieuwe in. Zolang er winst valt, tumbelt het door.`,
   `Waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt daar weer een winst, dan wordt het x2, daarna x4, x8, tot x${nl(mx)}. De vakjes in een cluster tellen bij elkaar op.`,
   `De Loper telt mee voor elk symbool en kan twee groepjes aan elkaar knopen.`,
   `Drie kluizen geven ${fs[3]} free spins, vier ${fs[4]} en vijf ${fs[5]}. De vakjes uit die spin gaan mee de bonus in en waar een kluis ligt begint het vakje op x2. In de bonus blijven de vakjes de hele tijd staan. ${sup} kluizen of meer: de superbonus van ${ss} spins.`,
   `De kluizen betalen zelf ook: drie ${(S&&S.SCATTER_PAY&&S.SCATTER_PAY[3])||5}×, vier ${(S&&S.SCATTER_PAY&&S.SCATTER_PAY[4])||10}×, vijf ${(S&&S.SCATTER_PAY&&S.SCATTER_PAY[5])||25}× en zes of meer ${(S&&S.SCATTER_PAY&&S.SCATTER_PAY[6])||100}× je inzet, ook als je de bonus koopt.`,
   `Een Gouden baar blijft de hele bonus op zijn plek liggen en telt als Loper. ${need} baren is meteen de max win.`,
   `Bonus kopen kost ${(S&&S.BUY_COST)||100}× je inzet.${S&&S.BUY_SPOTS?' Er beginnen dan '+S.BUY_SPOTS+' vakjes op x2'+(S.BUY_FLOOR?' en je krijgt minstens '+S.BUY_FLOOR+'× terug':'')+'.':''}`]},
  src:'/js/slot.js'},
 vis:{stats:V=>[['Rollen','5 × 4'],['Lijnen','20'],['Max win',nl(V?V.MAX_WIN:10000)+'×'],['Bonus kopen',(V?V.BUY_COST:66)+'×']],
  rules:V=>{const fs=(V&&V.FS_BY_SC)||{3:10,4:12,5:15},m=(V&&V.MULTS)||[1,2,3,10],p=(V&&V.PER_LEVEL)||4;
   return [`Vijf rollen, vier rijen en twintig vaste lijnen. Drie, vier of vijf dezelfde van links naar rechts is winst.`,
   `Drie boeien geven ${fs[3]} free spins, vier geven er ${fs[4]} en een volle rij van vijf geeft er ${fs[5]}.`,
   `In de free spins heeft elke vis een prijskaartje. Valt de Visdief op het scherm, dan pakt hij alle vissen. Twee Visdieven pakken alles twee keer.`,
   `Vang je ${p} Visdieven, dan begint ronde 2 en telt alles ×${m[1]}. Bij ${p*2} ronde 3 (×${m[2]}), bij ${p*3} ronde 4 (×${m[3]}).`,
   `Hoge volatiliteit: de meeste bonussen zijn klein, maar heel soms vang je een reus van 1.000× je inzet.`,
   `Bonus kopen kost ${(V&&V.BUY_COST)||66}× je inzet en geeft altijd drie boeien.`]},
  src:'/js/vis.js'},
 zoet:{stats:Z=>[['Raster','6 × 5'],['Winst','8+ overal'],['Max win',nl(Z?Z.MAX_WIN:5000)+'×'],['Bonus kopen',(Z?Z.BUY_COST:100)+'×']],
  rules:Z=>{const sp=(Z&&Z.SC_PAY)||{4:3,5:5,6:100};return [`Zes rollen, vijf rijen en geen lijnen: acht of meer van hetzelfde snoepje, waar ze ook liggen, is winst. Meer van hetzelfde betaalt meer.`,
   `De winnende snoepjes knallen weg, de rest valt naar beneden en er vallen nieuwe in. Zolang er winst valt, gaat het door.`,
   `Vier lolly's geven ${(Z&&Z.FS_START)||10} free spins. Ze betalen zelf ook: vier ${sp[4]}×, vijf ${sp[5]}× en zes of meer ${sp[6]}× je inzet.`,
   `In de bonus vallen kauwgomballen van ×2 tot ×1.000. Valt er in een spin winst, dan tellen alle ballen op het bord bij elkaar op en gaat de winst van die spin keer het totaal.`,
   `Drie lolly's in de bonus geven ${(Z&&Z.FS_RETRIG)||5} extra spins. De max win is ${nl((Z&&Z.MAX_WIN)||5000)}× je inzet per ronde.`,
   `Bonus kopen kost ${(Z&&Z.BUY_COST)||100}× je inzet en geeft altijd vier lolly's.`]},
  src:'/js/zoet.js'},
 draak:{stats:D=>[['Rollen','5 × 3'],['Lijnen','20'],['Max win',nl(D?D.MAX_WIN:5000)+'×'],['Bonus kopen',(D?D.FS_BUY:57)+'× / '+(D?D.HS_BUY:40)+'×']],
  rules:D=>{const J=(D&&D.JP)||{mini:10,minor:25,major:100};return [`Vijf rollen, drie rijen en twintig vaste lijnen. Drie, vier of vijf dezelfde van links naar rechts is winst. De drakenparel is wild op rol 2, 3 en 4.`,
   `Drie gongs geven ${(D&&D.FS_START)||10} free spins met de Reuzendraak: rol 2, 3 en 4 worden één groot symbool. Eén gelijk symbool op rol 1 is dan al vier op een lijn.`,
   `Een gong op rol 1, een reuzengong in het midden en een gong op rol 5 geven ${(D&&D.FS_RETRIG)||3} spins extra.`,
   `Zes of meer gouden munten geven de Muntenbonus op het hele bord van 15 vakjes. De munten blijven staan, je hebt 3 spins en elke nieuwe munt zet je weer op 3.`,
   `Jackpots: Mini ${J.mini}×, Minor ${J.minor}×, Major ${J.major}×. Alle 15 vakjes vol is de Mega: ${nl((D&&D.MAX_WIN)||5000)}× je inzet.`,
   `Bonus kopen: free spins ${(D&&D.FS_BUY)||57}× of de Muntenbonus met zes munten ${(D&&D.HS_BUY)||40}× je inzet.`]},
  src:'/js/draak.js'},
 mines:{stats:()=>[['Veld','5 × 5'],['Bommen','1 tot 24'],['RTP','95,5 – 99,2%'],['Max win','10.000×']],
  rules:()=>[`Kies hoeveel bommen er in het veld liggen, van 1 tot 24. Meer bommen is spannender en betaalt meer per vakje.`,
   `Klik vakjes open. Elk veilig vakje verhoogt je multiplier. Raak je een bom, dan ben je je inzet kwijt.`,
   `Stop wanneer je wilt en pak inzet × multiplier.`,
   `De multiplier is de omgekeerde kans dat al je vakjes veilig zijn, keer de RTP. Die stijgt met elke bom en elk extra vakje, maar blijft altijd onder 100%.`,
   `De bommen liggen vast zodra je begint. Verversen verandert niets.`]},
 avia:{stats:()=>[['Vlucht','meestal 12 – 55 s'],['Items','9 soorten'],['RTP','±87%'],['VIP','±98%']],
  rules:()=>[`Een vliegtuigje vliegt op eigen kracht boven zee. Overal in de lucht hangen items.`,
   `Plusjes (+1 tot +10) duwen hem omhoog. ×2 tot ×5 houden hem even op hoogte. Een bom (÷2) ontploft en hij zakt.`,
   `Er is geen vaste baan: wat hij raakt, hangt af van waar hij vliegt. Zonder items glijdt hij langzaam naar de zee.`,
   `Op zee liggen vliegdekschepen met water ertussen. Blijft hij op een dek staan, dan win je je inzet × de multiplier. Rolt hij eraf of valt hij in het water, dan ben je je inzet kwijt.`,
   `De vlucht wordt bij het opstijgen in één keer doorgerekend. VIP-dekken zijn 12% langer.`]},
 bj:{stats:()=>[['Blackjack','3 : 2'],['Dealer','pakt tot 17'],['Inzet','€50 – €50.000'],['Side bets','vanaf €10']],
  rules:()=>[`Kom zo dicht mogelijk bij 21 zonder eroverheen te gaan. Plaatjes tellen 10, een aas 1 of 11.`,
   `Een aas met een tien of een plaatje als eerste twee kaarten is blackjack en betaalt 3 tot 2.`,
   `Kaart, passen of verdubbelen. De dealer pakt tot 17.`,
   `Twee side bets: Perfect Pairs op je eerste twee kaarten, en 21 + 3 op je twee kaarten met de open kaart van de dealer.`],
  extra:()=>`<div class="pays">${payRows('Perfect Pairs',[['Perfect pair (zelfde kleur en teken)','25 : 1'],['Gekleurd paar','12 : 1'],['Gemengd paar','6 : 1']])}${payRows('21 + 3',[['Suited trips','100 : 1'],['Straight flush','40 : 1'],['Drie gelijke','30 : 1'],['Straat','10 : 1'],['Flush','5 : 1']])}</div>`},
 tcp:{stats:()=>[['Pair Plus','tot 40 : 1'],['Ante-bonus','tot 5 : 1'],['6-Card Bonus','tot 1.000 : 1'],['Dealer speelt','vanaf vrouw-hoog']],
  rules:()=>[`Je zet een ante in en krijgt drie kaarten. Speel je door, dan zet je hetzelfde bedrag nog een keer in. Anders gooi je weg.`,
   `De dealer speelt vanaf vrouw-hoog. Speelt hij niet, dan krijg je 1 : 1 op je ante en je play-inzet terug.`,
   `Met een straat, drie gelijke of een straight flush krijg je altijd een ante-bonus, wat de dealer ook heeft.`,
   `Pair Plus telt alleen je eigen drie kaarten. De 6-Card Bonus pakt de beste vijf uit jouw drie en die van de dealer.`],
  extra:()=>`<div class="pays">${payRows('Ante-bonus',[['Straight flush','5 : 1'],['Drie gelijke','4 : 1'],['Straat','1 : 1']])}${payRows('Pair Plus',[['Straight flush','40 : 1'],['Drie gelijke','30 : 1'],['Straat','6 : 1'],['Flush','3 : 1'],['Paar','1 : 1']])}${payRows('6-Card Bonus',[['Royal flush','1000 : 1'],['Straight flush','200 : 1'],['Carré','50 : 1'],['Full house','25 : 1'],['Flush','20 : 1'],['Straat','10 : 1'],['Drie gelijke','5 : 1']])}</div>`},
 th:{stats:()=>[['Call','2× je ante'],['Dealer speelt','vanaf paar vieren'],['Ante','tot 100 : 1'],['AA Bonus','tot 200 : 1']],
  rules:()=>[`Je zet een ante in. Jij en de dealer krijgen twee kaarten en de flop (drie kaarten) ligt open op tafel.`,
   `Speel je mee, dan zet je 2× je ante in als call. Anders pas je en ben je je ante kwijt.`,
   `Daarna komen de turn en de river. Jouw beste vijf uit zeven tegen die van de dealer. De dealer speelt vanaf een paar vieren.`,
   `Speelt de dealer niet, dan betaalt je ante volgens de tabel en krijg je je call terug. Wint de dealer, dan ben je beide kwijt.`],
  extra:()=>`<div class="pays">${payRows('Ante',[['Royal flush','100 : 1'],['Straight flush','20 : 1'],['Carré','10 : 1'],['Full house','3 : 1'],['Flush','2 : 1'],['Straat of lager','1 : 1']])}${payRows('AA Bonus',[['Royal flush','200 : 1'],['Straight flush','60 : 1'],['Carré','40 : 1'],['Full house','8 : 1'],['Flush','6 : 1'],['Straat','4 : 1'],['Drie gelijke','2 : 1']])}</div>`},
 roulette:{stats:()=>[['Wiel','Europees'],['Nul','één'],['Huisvoordeel','2,7%'],['Getal','35 : 1']],
  rules:()=>[`Zet fiches op getallen, rijen, kolommen of kansen. Daarna draait het wiel en rolt de bal.`,
   `Elke inzet is een set getallen. Valt de bal op een daarvan, dan krijg je inzet × 36 gedeeld door het aantal getallen terug.`,
   `Eén nul, dus een huisvoordeel van 2,7%. Valt de bal op 0, dan verliezen alle buiten-inzetten.`,
   `Hoe hoger je rang, hoe meer je per vak mag inzetten.`],
  extra:()=>`<div class="pays">${payRows('Uitbetaling',[['Eén getal','35 : 1'],['Split (2)','17 : 1'],['Rij (3)','11 : 1'],['Hoek (4)','8 : 1'],['Zes getallen','5 : 1'],['Kolom of dozijn','2 : 1'],['Rood, zwart, even, oneven, 1–18, 19–36','1 : 1']])}</div>`},
 coin:{stats:()=>[['Kans','50%'],['Huisvoordeel','0%'],['Doorgooien','tot 10 keer'],['Max','×1.024']],
  rules:()=>[`Een echte munt, kop of munt. Precies vijftig procent kans, zonder huisvoordeel.`,
   `Win je, dan kies je: je pot pakken, of nog een keer gooien voor het dubbele.`,
   `Je kunt tot tien keer achter elkaar doorgooien. Tien keer goed is ×1.024.`,
   `De lopende pot staat in je opslag. Weggaan of verversen verandert niets aan de uitkomst.`]}};

function gamePage(slug){const g=gameBy(slug);if(!g)return null;const D=GD[g.id],i=GAMES.indexOf(g),prev=GAMES[(i+GAMES.length-1)%GAMES.length],next=GAMES[(i+1)%GAMES.length];
 const play=loggedIn?'<a class="btn xl" href="/game.html">Speel in het casino</a>':'<button class="btn xl" data-auth="register">Maak een account en speel</button>';
 return {title:g.n+' · Casino · '+BR,cls:'pg-game',desc:g.n+': '+g.short,
 html:`<section class="gh" style="--c:${g.col}"><div class="wrap gh-in">
   <div class="gh-copy"><a class="ph-back" href="/casino" data-link>${ic('back')}Casino</a><div class="kick"><span class="dot"></span>${g.kind}</div>
    <h1 class="ph-t">${g.n}</h1><p class="ph-lede">${g.short}</p>
    <dl class="ph-stats" id="gStats">${D.stats(null).map(s=>`<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('')}</dl><div class="hero-cta">${play}</div></div>
   <div class="gh-art"><div class="cov solo" aria-hidden="true"><div class="cov-art"><div class="cov-in">${coverSvg(g.id,'d'+g.id)}<i class="cov-glare"></i></div></div></div></div></div></section>
  <section class="wrap gd" style="--c:${g.col}"><div class="gd-rules rv"><h2>Zo werkt het</h2><div id="gRules">${rules(D.rules(null))}</div></div>
   <div class="gd-side rv">${demoHtml(g.id)}</div></section>
  ${D.extra?`<section class="wrap rv">${D.extra()}</section>`:''}
  <nav class="gn wrap" aria-label="Andere spellen"><a href="/casino/${prev.slug}" data-link>${ic('back')}<span><small>Vorige</small><b>${prev.n}</b></span></a><a href="/casino/${next.slug}" data-link><span><small>Volgende</small><b>${next.n}</b></span>${ic('arrow')}</a></nav>`
  +moreHtml('casino'),
 after(){const my=renderId;if(D.src)need(D.src).then(()=>{if(my!==renderId)return;const API=g.id==='kluis'?window.SLOT:g.id==='zoet'?window.ZOET:g.id==='draak'?window.DRAAK:window.VISD;if(!API)return;
   const st=q('#gStats'),ru=q('#gRules');if(st)st.innerHTML=D.stats(API).map(s=>`<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('');if(ru)ru.innerHTML=rules(D.rules(API));demoReady(g.id)});
  demoInit(g.id)}}}
route(/^\/casino\/([a-z0-9-]+)$/,gamePage);

/* ---------- Demo's en tabellen per spel ---------- */
function demoHtml(id){
 if(id==='kluis')return `<div class="demo"><div class="demo-h"><b>Zo valt het</b><span>Een voorbeeld op een kleiner veld.</span></div><div class="minislot" id="minislot" aria-hidden="true"></div></div>
  <div class="demo"><div class="demo-h"><b>Uitbetaling per cluster</b><span>Basisspel, gewoon lidmaatschap. In de bonus blijven de vakjes staan.</span></div>
   <div class="seg-s" id="kkBet" role="group" aria-label="Inzet">${[10,100,1000].map((b,i)=>`<button data-b="${b}" class="${i?'':'on'}">${eur(b)} inzet</button>`).join('')}</div><div id="kkPay" class="pt-w"><p class="muted">Tabel laden…</p></div><p class="pt-hint">Veeg opzij voor grotere clusters →</p></div>`;
 if(id==='zoet')return `<div class="demo"><div class="demo-h"><b>Uitbetaling per snoepje</b><span>8 of meer, waar ze ook liggen. Gewoon lidmaatschap.</span></div>
  <div class="seg-s" id="zbBet" role="group" aria-label="Inzet">${[10,100,1000].map((b,i)=>`<button data-b="${b}" class="${i?'':'on'}">${eur(b)} inzet</button>`).join('')}</div><div id="zbPay" class="pt-w"><p class="muted">Tabel laden…</p></div><p class="pt-hint">Veeg opzij voor 12+ en 15+ →</p>
  <div class="vd-fish" id="zbBalls"></div></div>`;
 if(id==='vis')return `<div class="demo"><div class="demo-h"><b>Lijnwinst</b><span>Per lijn, bij de gekozen inzet. Gewoon lidmaatschap.</span></div>
  <div class="seg-s" id="vdBet" role="group" aria-label="Inzet">${[10,100,1000].map((b,i)=>`<button data-b="${b}" class="${i?'':'on'}">${eur(b)} inzet</button>`).join('')}</div><div id="vdPay" class="pt-w"><p class="muted">Tabel laden…</p></div><p class="pt-hint">Veeg opzij voor 4 en 5 op een lijn →</p>
  <div class="vd-fish" id="vdFish"></div></div>`;
 if(id==='mines')return `<div class="demo"><div class="demo-h"><b>Oefenen</b><span>Zonder geld. Kies je bommen en klik een vakje open.</span></div>
  <div class="seg-s" id="mnM" role="group" aria-label="Aantal bommen">${[3,5,10,20].map(m=>`<button data-m="${m}" class="${m===5?'on':''}">${m} bommen</button>`).join('')}</div>
  <div class="mn-grid" id="mnGrid">${Array.from({length:25},(_,i)=>`<button data-i="${i}" aria-label="Vakje ${i+1}"></button>`).join('')}</div>
  <div class="mn-foot"><div><span class="label">Nu</span><b id="mnX">×1,00</b></div><div><span class="label">Volgend vakje</span><b id="mnN">—</b></div><button class="btn sm" id="mnGo" type="button">Stoppen</button></div><p class="demo-msg" id="mnMsg">&nbsp;</p></div>`;
 if(id==='roulette')return `<div class="demo"><div class="demo-h"><b>Draai zelf</b><span>Kies een kleur en laat het wiel draaien. Zonder geld.</span></div>
  <div class="rl-demo"><svg viewBox="0 0 240 240" class="rl-svg" aria-hidden="true"><g id="rlW">${wheelSvg(120,120,112,'rd',false)}</g><g id="rlB"><circle cx="120" cy="14.5" r="5.6" fill="#fbfaf6" stroke="#9aa1ab" stroke-width=".6"/></g><path d="M120 0l-6-9h12z" fill="#ff7a1a" transform="translate(0 4)"/></svg></div>
  <div class="seg-s" id="rlPick" role="group" aria-label="Inzet">${[['red','Rood'],['black','Zwart'],['even','Even'],['odd','Oneven'],['zero','Nul']].map((b,i)=>`<button data-k="${b[0]}" class="${i?'':'on'}">${b[1]}</button>`).join('')}</div>
  <div class="demo-row"><button class="btn sm" id="rlGo" type="button">Draaien</button><p class="demo-msg" id="rlMsg">&nbsp;</p></div></div>`;
 if(id==='coin')return `<div class="demo"><div class="demo-h"><b>Gooi zelf</b><span>Een oefenpot van €10. Zonder geld.</span></div>
  <div class="coin-stage"><div class="coin-arc" id="coinArc"><div class="coin3d" id="coin"><div class="cf kop">${coinFace('kop')}</div><div class="cf munt">${coinFace('munt')}</div></div></div></div>
  <div class="seg-s" id="cfSide" role="group" aria-label="Kies kant"><button data-s="kop" class="on">Kop</button><button data-s="munt">Munt</button></div>
  <div class="cf-row"><div><span class="label">Pot</span><b id="cfPot">€10</b></div><div><span class="label">Op rij</span><b id="cfRun">0 / 10</b></div></div>
  <div class="demo-row"><button class="btn sm" id="cfGo" type="button">Gooien</button><button class="btn ghost sm" id="cfTake" type="button" disabled>Pak je pot</button></div><p class="demo-msg" id="cfMsg">&nbsp;</p></div>`;
 if(id==='bj')return `<div class="demo"><div class="demo-h"><b>Een voorbeeldhand</b><span>Blackjack betaalt 3 tot 2.</span></div><svg viewBox="0 0 320 200" class="demo-cards" aria-hidden="true">${pcard(110,96,-9,'A','s')}${pcard(170,92,7,'K','h')}<g transform="translate(262 52)"><circle r="24" fill="#1fd17a"/><text y="9" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="28" fill="#07170f">21</text></g></svg>
  <p class="demo-msg">Inzet €100 · blackjack · <b>+€150</b></p></div>`;
 if(id==='th')return `<div class="demo"><div class="demo-h"><b>De beste hand</b><span>Royal flush op je ante: 100 tot 1.</span></div><svg viewBox="0 0 320 200" class="demo-cards" aria-hidden="true">${['A','K','Q'].map((r,i)=>`<g transform="translate(${70+i*50} 60) scale(.62)">${pcard(0,0,0,r,'h')}</g>`).join('')}${pcard(140,140,-8,'J','h')}${pcard(190,136,8,'10','h')}</svg>
  <p class="demo-msg">Ante €50 · royal flush · <b>+€5.000</b></p></div>`;
 if(id==='tcp')return `<div class="demo"><div class="demo-h"><b>De beste hand</b><span>Straight flush in Pair Plus: 40 tot 1.</span></div><svg viewBox="0 0 320 200" class="demo-cards" aria-hidden="true">${pcard(110,106,-14,'Q','d')}${pcard(160,96,0,'K','d')}${pcard(210,106,14,'A','d')}</svg>
  <p class="demo-msg">Pair Plus €25 · straight flush · <b>+€1.000</b></p></div>`;
 if(id==='avia')return `<div class="demo"><div class="demo-h"><b>De items</b><span>Wat hij onderweg kan raken.</span></div>
  <ul class="av-items"><li><b class="g">+1 … +10</b><span>duwt hem omhoog</span></li><li><b class="y">×2 … ×5</b><span>houdt hem even op hoogte en vermenigvuldigt</span></li><li><b class="r">÷2</b><span>een bom: hij ontploft en zakt</span></li><li><b class="i">dek</b><span>blijft hij staan, dan win je</span></li></ul></div>`;
 return ''}
function coinFace(id){return id==='kop'?`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#7a5506" stroke-width="1.5" stroke-dasharray="2 3"/><path d="M30 58L26 36 38 46 50 30 62 46 74 36 70 58Z" fill="#7a5506"/><rect x="29" y="60" width="42" height="7" rx="2" fill="#7a5506"/><text x="50" y="82" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="13" letter-spacing="2" fill="#7a5506">KOP</text></svg>`
 :`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#7a5506" stroke-width="1.5" stroke-dasharray="2 3"/><text x="50" y="62" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="38" fill="#7a5506">€</text><text x="50" y="82" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="13" letter-spacing="2" fill="#7a5506">MUNT</text></svg>`}
const segOn=(wrap,btn)=>qa('button',wrap).forEach(b=>b.classList.toggle('on',b===btn));
function demoReady(id){
 if(id==='kluis'){const box=q('#kkPay'),seg=q('#kkBet');if(!box||!window.SLOT)return;const S=window.SLOT;
  const tab=bet=>{const k=S.BASE_K*((S.VIP_KT&&S.VIP_KT[0])||1),sizes=[5,6,7,8,10,12,15,S.MAX_SIZE].filter((v,i,a)=>a.indexOf(v)===i);
   return `<div class="pt" style="grid-template-columns:minmax(118px,1.4fr) repeat(${sizes.length},minmax(60px,1fr))"><span class="pt-c">Symbool</span>${sizes.map(n=>`<span class="pt-h">${n}${n===S.MAX_SIZE?'+':''}</span>`).join('')}
    ${S.SYMS.slice().reverse().map(s=>`<span class="pt-s">${kkSvg(s.id)}<em>${esc(s.n)}</em></span>${sizes.map(n=>`<span>${flo(s.pay[Math.min(n,S.MAX_SIZE)-S.MIN_CLUSTER]*k*bet)}</span>`).join('')}`).join('')}</div>`};
  box.innerHTML=tab(10);seg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;segOn(seg,b);box.innerHTML=tab(+b.dataset.b)})}
 if(id==='zoet'){const box=q('#zbPay'),seg=q('#zbBet'),Z=window.ZOET;if(!box||!Z)return;
  const tab=bet=>{const k=Z.PAYK*((Z.VIP_KT&&Z.VIP_KT[0])||1)*bet;
   return `<div class="pt" style="grid-template-columns:minmax(118px,1.4fr) repeat(4,minmax(60px,1fr))"><span class="pt-c">Snoepje</span>${['8–9','10–11','12–14','15+'].map(b=>`<span class="pt-h">${b}</span>`).join('')}
    ${Z.SYMS.slice().reverse().map(s=>`<span class="pt-s">${window.ZBA?ZBA.svg(s.id):''}<em>${esc(s.n)}</em></span>${s.p.map(p=>`<span>${flo(p*k)}</span>`).join('')}`).join('')}</div>`};
  box.innerHTML=tab(10);seg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;segOn(seg,b);box.innerHTML=tab(+b.dataset.b)});
  const f=q('#zbBalls');if(f&&Z.BOMB)f.innerHTML=`<span class="label">Kauwgomballen in de bonus</span><div class="fish-row">${Z.BOMB.vals.map(x=>`<em class="${x[0]>=100?'big':''}">×${nl(x[0])}</em>`).join('')}</div>`}
 if(id==='vis'){const box=q('#vdPay'),seg=q('#vdBet'),V=window.VISD;if(!box||!V)return;
  const tab=bet=>{const k=V.PAYK/V.LINES.length*((V.VIP_KT&&V.VIP_KT[0])||1)*bet;
   return `<div class="pt" style="grid-template-columns:minmax(118px,1.4fr) repeat(3,minmax(60px,1fr))"><span class="pt-c">Symbool</span><span class="pt-h">3</span><span class="pt-h">4</span><span class="pt-h">5</span>
    ${V.SYMS.slice().reverse().map(s=>`<span class="pt-s"><em>${esc(s.n)}</em></span>${s.pay.map(p=>`<span>${flo(p*k)}</span>`).join('')}`).join('')}</div>`};
  box.innerHTML=tab(10);seg.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;segOn(seg,b);box.innerHTML=tab(+b.dataset.b)});
  const f=q('#vdFish');if(f&&V.FISH)f.innerHTML=`<span class="label">Prijskaartjes in de bonus (× je inzet)</span><div class="fish-row">${V.FISH.map(x=>`<em class="${x[0]>=100?'big':''}">${nl(x[0],1)}×</em>`).join('')}</div>`}}
function demoInit(id){
 if(id==='kluis'){const ms=q('#minislot');if(!ms)return;const SY=['munt','dobbel','fiche','sleutel','horloge','ring','diamant','goud'];let cells=[],alive=true;onLeave(()=>{alive=false});
  const fillAll=()=>{for(let i=0;i<49;i++)cells[i]={s:Math.random()<.04?'kluis':pick(SY),nw:1}};
  const drawS=()=>{ms.innerHTML=cells.map(c=>`<div class="c${c.nw?' nw':''}${c.st?' '+c.st:''}">${kkSvg(c.s)}</div>`).join('');cells.forEach(c=>{c.nw=0})};
  const wait=t=>new Promise(r=>setTimeout(r,t));
  (async()=>{fillAll();drawS();if(reduce)return;
   while(alive){await wait(1500);if(!alive)return;const sym=pick(SY.slice(2)),start=R(0,48),set=new Set([start]);
    while(set.size<R(6,9)){const a=[...set],c=pick(a),nb=[c-7,c+7,c%7?c-1:-1,c%7<6?c+1:-1].filter(v=>v>=0&&v<49);set.add(pick(nb))}
    const idx=[...set];idx.forEach(i=>{cells[i]={s:sym}});drawS();await wait(500);if(!alive)return;
    idx.forEach(i=>{cells[i].st='win'});drawS();const tag=document.createElement('div');tag.className='tag-win';tag.textContent=pick(['x2','x4','x8','x16','x32']);ms.appendChild(tag);
    await wait(900);if(!alive)return;idx.forEach(i=>{cells[i].st='gone'});drawS();await wait(260);if(!alive)return;
    idx.forEach(i=>{cells[i]=null});const grid=[];for(let c=0;c<7;c++){const col=[];for(let r=0;r<7;r++)col.push(cells[r*7+c]);const keep=col.filter(Boolean);grid.push(Array.from({length:7-keep.length},()=>({s:pick(SY),nw:1})).concat(keep))}
    for(let c=0;c<7;c++)for(let r=0;r<7;r++)cells[r*7+c]=grid[c][r];drawS();await wait(1200);if(Math.random()<.5&&alive){fillAll();drawS()}}})()}
 if(id==='mines'){const grid=q('#mnGrid'),segM=q('#mnM'),xEl=q('#mnX'),nEl=q('#mnN'),go=q('#mnGo'),msg=q('#mnMsg');let m=5,bombs=null,open=0,over=false;
  const rtp=k=>Math.min(.992,.955+.0015*m+.004*Math.max(0,k-1));
  const mult=k=>{if(!k)return 1;let x=rtp(k);for(let i=0;i<k;i++)x*=(25-i)/(25-m-i);return Math.min(10000,Math.floor(x*100)/100)};
  const fx=v=>'×'+(+v).toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
  function reset(){bombs=new Set();const a=[...Array(25).keys()];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}a.slice(0,m).forEach(v=>bombs.add(v));
   open=0;over=false;qa('button',grid).forEach(b=>{b.className='';b.disabled=false;b.innerHTML=''});xEl.textContent=fx(1);nEl.textContent=fx(mult(1));go.textContent='Stoppen';go.disabled=true;msg.innerHTML='&nbsp;'}
  const gem='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9l4-5h8l4 5-8 11z" fill="#3fe395"/><path d="M4 9h16M8 4l4 5 4-5" stroke="#0a2a1a" stroke-width="1" fill="none"/></svg>';
  const bomb='<svg viewBox="0 0 24 24" aria-hidden="true"><g stroke="#ff3d52" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M12 3v18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></g><circle cx="12" cy="12" r="6" fill="#16181d" stroke="#ff3d52" stroke-width="1.5"/></svg>';
  function end(won){over=true;qa('button',grid).forEach((b,i)=>{b.disabled=true;if(bombs.has(i)&&!b.classList.contains('hit')){b.classList.add('bomb','ghost');b.innerHTML=bomb}});
   go.textContent='Opnieuw';go.disabled=false;msg.innerHTML=won?`Gestopt op <b>${fx(mult(open))}</b>. Bij €100 inzet: <b>${flo(100*mult(open))}</b>.`:'Boem. Bij een echte inzet was je die nu kwijt.'}
  grid.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||over||b.classList.contains('safe'))return;const i=+b.dataset.i;
   if(bombs.has(i)){b.classList.add('bomb','hit');b.innerHTML=bomb;end(false);return}
   open++;b.classList.add('safe');b.innerHTML=gem;b.disabled=true;xEl.textContent=fx(mult(open));nEl.textContent=open<25-m?fx(mult(open+1)):'—';go.disabled=false;
   if(open>=25-m)end(true)});
  go.addEventListener('click',()=>{if(over){reset();return}if(open)end(true)});
  segM.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;segOn(segM,b);m=+b.dataset.m;reset()});
  reset()}
 if(id==='roulette'){const W=q('#rlW'),B=q('#rlB'),pickW=q('#rlPick'),go=q('#rlGo'),msg=q('#rlMsg');let bet='red',ang=0,busy=false,raf=0;onLeave(()=>cancelAnimationFrame(raf));
  pickW.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||busy)return;segOn(pickW,b);bet=b.dataset.k});
  go.addEventListener('click',()=>{if(busy)return;busy=true;go.disabled=true;msg.innerHTML='&nbsp;';
   const r=crypto.getRandomValues(new Uint32Array(1))[0]%37,idx=RL_ORDER.indexOf(r),step=360/37;
   const target=-idx*step-360*(4+Math.floor(Math.random()*2)),from=ang%360,dur=reduce?300:4200,t0=performance.now(),b0=0,bTurns=-(360*5+180);
   const ease=t=>1-Math.pow(1-t,3.2);
   const tick=t=>{const p=Math.min(1,(t-t0)/dur),e=ease(p);ang=from+(target-from)*e;W.setAttribute('transform',`rotate(${ang.toFixed(2)} 120 120)`);
    const bp=Math.min(1,p*1.08),be=1-Math.pow(1-bp,2.4),rr=Math.pow(be,6)*19.5;B.setAttribute('transform',`rotate(${(bTurns*(1-be)).toFixed(2)} 120 120) translate(0 ${rr.toFixed(2)})`);
    if(p<1){raf=requestAnimationFrame(tick);return}
    const red=RL_RED.has(r),col=r===0?'groen':red?'rood':'zwart',win=bet==='zero'?r===0:r===0?false:bet==='red'?red:bet==='black'?!red:bet==='even'?r%2===0:r%2===1;
    msg.innerHTML=`<b class="rl-n ${r===0?'g':red?'r':'k'}">${r}</b> ${col}. ${win?(bet==='zero'?'Raak: 35 tot 1.':'Raak: 1 tot 1.'):'Mis.'}`;busy=false;go.disabled=false};
   raf=requestAnimationFrame(tick)})}
 if(id==='coin'){const coin=q('#coin'),side=q('#cfSide'),go=q('#cfGo'),take=q('#cfTake'),pot=q('#cfPot'),run=q('#cfRun'),msg=q('#cfMsg');let pick2='kop',p=10,n=0,busy=false,rot=0;
  const upd=()=>{pot.textContent=eur(p);run.textContent=n+' / 10'};
  side.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||busy)return;segOn(side,b);pick2=b.dataset.s});
  go.addEventListener('click',()=>{if(busy)return;if(n>=10){p=10;n=0;upd()}busy=true;go.disabled=true;take.disabled=true;msg.innerHTML='&nbsp;';
   const res=(crypto.getRandomValues(new Uint8Array(1))[0]&1)?'kop':'munt';rot+=1440+((res==='munt')!==((rot/180)%2===1)?180:0);
   const arc=q('#coinArc');arc.classList.remove('toss');void arc.offsetWidth;arc.classList.add('toss');coin.style.transform=`rotateX(${rot}deg)`;
   later(()=>{busy=false;go.disabled=false;if(res===pick2){n++;p*=2;msg.innerHTML=`${res==='kop'?'Kop':'Munt'}. <b>Goed.</b> ${n<10?'Pak je pot of gooi door voor het dubbele.':'Tien keer goed: ×1.024.'}`;take.disabled=false;if(n>=10){go.textContent='Opnieuw';take.disabled=true}else go.textContent='Gooi door'}
    else{msg.innerHTML=`${res==='kop'?'Kop':'Munt'}. Mis, de pot is weg.`;p=10;n=0;go.textContent='Gooien'}upd()},reduce?250:1500)});
  take.addEventListener('click',()=>{msg.innerHTML=`Je pakt <b>${eur(p)}</b>. Dat is ${eur(p-10)} winst op je €10.`;p=10;n=0;go.textContent='Gooien';take.disabled=true;upd()});upd()}
}

/* ================= Families ================= */
const famNeedFor=(i,T)=>Math.round(FAM_RANKS[i][1]*(1+T*.5));
const famPromo=(i,T)=>Math.round(5000*Math.pow(2,T)*i);
const gearName=id=>{const g=GEAR.find(x=>x.id===id);return g?g.n:id};
const bonusTxt=(f,k)=>[f.chance?'kans +'+nl(f.chance*k,1)+'%':'',f.loot?'buit +'+nl(f.loot*k,1)+'%':'',f.jail?'straf −'+nl(f.jail*k,1)+'%':''].filter(Boolean).join(' · ');
function famsPage(){const F=chainSorted(),top=F.slice().reverse(),rs=FAMILIES.map(f=>f.r);
 return {title:'Families · '+BR,cls:'pg-fams',desc:'De '+FAMILIES.length+' families van '+BR+': wie ze zijn, wie ze binnenlaten en hoe je bij ze opklimt.',
 html:pageHead({kick:'Families',title:`${FAMILIES.length} families.<br><em>De voedselketen.</em>`,
   lede:'Je hoort bij één familie tegelijk. Elke familie heeft een eigen voordeel, een eigen grote klus en een ladder waarop je klimt, van aspirant tot de mensen die aan het hoofd van de tafel zitten.',
   stats:[['Families',FAMILIES.length],['Eerste deur',rk(Math.min(...rs))],['Zwaarste deur',rk(Math.max(...rs))],['Rangen per familie',FAM_RANKS.length]]})
 +`<section class="wrap pw rv" id="power" hidden><div class="sec-head"><div><div class="kick"><span class="dot"></span>Nu aan de macht</div><h2>Wie de stad<br><em>nu in handen heeft.</em></h2></div><p id="pwTxt"></p></div><ol class="pw-list" id="pwList"></ol></section>
  <section class="wrap fl"><div class="fl-end top"><span class="label">De top van de stad</span></div>
   ${top.map((f,i)=>{const L=famLore(f.id);return `<a class="fr rv" href="/families/${f.id}" data-link style="--fc:${f.col};--d:${i*30}ms">
    <span class="fr-node">${crest(f,'lg')}</span>
    <div class="fr-main"><h3>${esc(f.n)}</h3><p>${esc(f.d)}</p>${L&&L.motto?`<em class="fr-motto">${esc(L.motto)}</em>`:''}</div>
    <dl class="fr-kv"><div><dt>Binnen vanaf</dt><dd>${rk(f.r)}</dd></div><div><dt>Straatcredit</dt><dd>${nl(f.cred)}</dd></div>${f.hits?`<div><dt>Huurmoorden</dt><dd>${f.hits}</dd></div>`:''}<div class="w"><dt>Voordeel</dt><dd>${esc(f.perk.n)}</dd></div></dl>
    <span class="fr-go">${ic('arrow')}</span></a>`}).join('')}
   <div class="fl-end bot"><span class="label">Hier begin je</span></div></section>`+moreHtml('families')
  +ctaHtml('Kies je','kant.','Je kunt maar bij één familie horen. Kies goed.'),
 after(){const my=renderId;power().then(P=>{if(!P||my!==renderId)return;const box=q('#power');if(!box)return;
   q('#pwTxt').textContent=P.txt;q('#pwList').innerHTML=P.rows.map(r=>{const d=r.prev-r.pos;return `<li><a href="/families/${r.f.id}" data-link style="--fc:${r.f.col}" class="${r.pos===1?'first':''}">
    <span class="pw-pos">${r.pos}</span>${crest(r.f,'sm')}<b>${esc(r.f.n)}</b><span class="pw-bar"><i style="width:${Math.round(r.pct*100)}%"></i></span>
    <em class="${d>0?'up':d<0?'dn':''}" title="${d?'Vorige ronde plek '+r.prev:'Gelijk gebleven'}">${d>0?'▲ '+d:d<0?'▼ '+(-d):'–'}</em></a></li>`}).join('');box.hidden=false})}}}
// De machtsstrijd van nu: zelfde berekening als in het spel (famwar.js), voor iedereen gelijk per ronde van vijf speldagen
let powerP=null;
function power(){if(powerP)return powerP.then(fresh);window.act=window.act||{};
 powerP=need('/js/pages/famwar.js').then(ok=>ok&&typeof fwTable==='function');return powerP.then(fresh)}
function fresh(ok){if(!ok)return null;try{const T=fwTable(),P=fwPer(),start=fwStartT(P),t=now()-start,day=Math.min(FW_DAYS,Math.floor(t/DAY_MS)+1),war=t>=FW_WAR,
  end=fwStartT(P+1)-now(),reign=typeof fwReign==='function'?fwReign():1,top=T[0].f.n;
  const txt=`${top} heerst over de stad${reign>1?', al '+reign+' rondes op rij':''}. Een ronde duurt ${FW_DAYS} speldagen. ${war?'De bendeoorlog loopt: nog '+fwDur(end)+' tot de nieuwe telling.':'Dag '+day+' van '+FW_DAYS+'. Over '+fwDur(start+FW_WAR-now())+' begint de bendeoorlog.'} De sterkste families nemen de macht vaak vanzelf, maar elke slag telt.`;
  return {rows:T,txt}}catch(e){return null}}
route(/^\/families$/,famsPage);

function famPage(id){const f=FAMILIES.find(x=>x.id===id);if(!f)return null;
 const L=famLore(id)||{},T=FAMILIES.indexOf(f),F=chainSorted(),pos=F.indexOf(f),above=F.length-1-pos;
 const heist=typeof FAM_HEISTS!=='undefined'?FAM_HEISTS[T]:null,i2=F.indexOf(f),prev=i2>0?F[i2-1]:null,next=i2<F.length-1?F[i2+1]:null;
 const story=(L.story&&L.story.length?L.story:[f.d]);
 const FT=FAM_RANKS.findIndex(r=>r[2])>0?FAM_RANKS.findIndex(r=>r[2])-1:FAM_RANKS.length-1;
 const ladder=FAM_RANKS.map((r,i)=>({n:r[0],need:famNeedFor(i,T),pay:i?famPromo(Math.min(i,FT+1),T):0,lore:famRankLore(r[0]),ch:r[2]||0}));
 const topR=FAM_RANKS[FAM_RANKS.length-1][0],hasLead=FT<FAM_RANKS.length-1;
 return {title:f.n+' · Families · '+BR,cls:'pg-fam',desc:f.n+': '+f.d,
 html:`<section class="fh" style="--fc:${f.col}"><div class="wrap fh-in">
   <div class="fh-copy"><a class="ph-back" href="/families" data-link>${ic('back')}Families</a><div class="kick"><span class="dot"></span>${esc(L.wijk||'Familie')}</div>
    <h1 class="ph-t">${esc(f.n)}</h1>${L.motto?`<p class="fh-motto">${esc(L.motto)}</p>`:''}
    <dl class="fh-meta">${L.baas?`<div><dt>Aan het hoofd</dt><dd>${esc(L.baas)}</dd></div>`:''}${L.sinds?`<div><dt>Sinds</dt><dd>${esc(L.sinds)}</dd></div>`:''}<div><dt>Binnen vanaf</dt><dd>${rk(f.r)} · ${nl(f.cred)} cred${f.hits?' · '+f.hits+' huurmoorden':''}</dd></div></dl></div>
   <div class="fh-crest" aria-hidden="true">${crest(f,'xl')}<span class="fh-ring"></span></div></div></section>
  <section class="wrap fd" style="--fc:${f.col}">
   <article class="fd-story rv"><h2>Het verhaal</h2>${story.map(p=>`<p>${esc(p)}</p>`).join('')}</article>
   <aside class="fd-side rv">
    <div class="fd-box"><div class="label">Plek in de voedselketen</div>
     <ol class="mini-chain">${F.slice().reverse().map(x=>`<li><a href="/families/${x.id}" data-link class="${x===f?'me':''}" style="--fc:${x.col}"><i></i><span>${esc(x.n)}</span><em>${rk(x.r)}</em></a></li>`).join('')}</ol>
     <p>${pos===F.length-1?'Niemand staat hoger. Dit is de top van de stad.':pos===0?'De eerste familie die je binnenlaat. Iedereen begint ergens.':above+' famil'+(above>1?'ies staan':'ie staat')+' hoger, '+pos+' lager.'}</p><p class="fd-pow" id="fdPow" hidden></p></div>
    <div class="fd-box"><div class="label">Wat het je oplevert</div>
     <dl class="fd-kv"><div><dt>Als ${esc(FAM_RANKS[0][0].toLowerCase())}</dt><dd>${bonusTxt(f,.5)}</dd></div><div><dt>Als ${esc(FAM_RANKS[Math.min(5,FT)][0].toLowerCase())}</dt><dd>${bonusTxt(f,1)}</dd></div>${hasLead?`<div><dt>Als ${esc(topR.toLowerCase())}</dt><dd>${bonusTxt(f,1.25)}</dd></div>`:''}</dl>
     <p class="fd-perk"><b>${esc(f.perk.n)}</b> ${esc(f.perk.d)}.</p></div>
   </aside></section>
  <section class="wrap fclimb rv" style="--fc:${f.col}"><div class="sec-head"><div><div class="kick"><span class="dot"></span>Zo klim je op</div><h2>Van ${esc(ladder[0].n.toLowerCase())}<br><em>tot ${esc(ladder[ladder.length-1].n.toLowerCase())}.</em></h2></div>
    <p>Eer verdien je met klussen, met auto's voor de familie en met de dagelijkse missies. Elke promotie betaalt uit, en je familiebonus groeit mee.${hasLead?' Boven '+esc(FAM_RANKS[FT][0].toLowerCase())+' kom je alleen met lef: win slagen in de bendeoorlog en daag daarna de baas uit.':''}</p></div>
   <ol class="ladder">${ladder.map((r,i)=>({r,i})).reverse().map(({r,i})=>`<li class="${i===ladder.length-1?'top':''}"><span class="lad-rung"></span><div class="lad-main"><b>${esc(r.n)}</b>${r.lore?`<span>${esc(r.lore)}</span>`:''}</div>
     <dl><div><dt>${r.ch===2?'Uitdaging':'Eer'}</dt><dd>${r.ch===2?'duel met de baas':i?nl(r.need)+(r.ch===1?' + 3 slagen':''):'start'}</dd></div><div><dt>Promotie</dt><dd>${r.pay?eurS(r.pay):'—'}</dd></div></dl></li>`).join('')}</ol></section>
  ${heist?`<section class="wrap fheist-blk rv" style="--fc:${f.col}"><div class="fheist"><div class="label">De grote klus van de familie</div><h3>${esc(heist.n)}</h3><p>${esc(heist.d)}</p>
   <dl class="fd-kv row"><div><dt>Buit</dt><dd>${eurS(heist.loot[0])} – ${eurS(heist.loot[1])}</dd></div><div><dt>Energie</dt><dd>${heist.en}</dd></div><div><dt>Straf als het misgaat</dt><dd>${dur(heist.jail)}</dd></div><div><dt>Nodig</dt><dd>${heist.need.length?heist.need.map(gearName).map(esc).join(', '):'Alleen lef'}</dd></div></dl></div></section>`:''}
  <nav class="gn wrap" aria-label="Andere families">${prev?`<a href="/families/${prev.id}" data-link>${ic('back')}<span><small>Een trede lager</small><b>${esc(prev.n)}</b></span></a>`:'<span></span>'}${next?`<a href="/families/${next.id}" data-link><span><small>Een trede hoger</small><b>${esc(next.n)}</b></span>${ic('arrow')}</a>`:''}</nav>`
  +moreHtml('families'),
 after(){const my=renderId;power().then(P=>{if(!P||my!==renderId)return;const r=P.rows.find(x=>x.f.id===id),el=q('#fdPow');if(r&&el){el.innerHTML=`Nu op plek <b>${r.pos}</b> van ${P.rows.length} in de machtsstrijd${r.pos===1?': deze familie heerst over de stad.':'.'}`;el.hidden=false}})}}}
route(/^\/families\/([a-z0-9-]+)$/,famPage);

/* ================= Rangen: de meetlat ================= */
function rankInfo(i){const name=rk(i),k=lootK(i),rew=RANK_REWARD(i);
 const cr=CRIMES.filter(c=>c.r===i),fm=FAMILIES.filter(f=>f.r===i),bz=BIZ.filter(b=>b.r===i),tr=TRAININGS.filter(t=>(t.r||0)===i),rx=RELAX.filter(x=>(x.r||0)===i),
  gr=GEAR.filter(g=>g.r===i),hm=typeof HOMES!=='undefined'?HOMES.filter(h=>(h.r||0)===i):[],sp=SPECIAL.filter(s=>s.r===i);
 const grp=(t,items)=>items.length?`<div class="ri-g"><h4>${t}<span>${items.length}</span></h4><ul>${items.join('')}</ul></div>`:'';
 const li=(a,b)=>`<li><b>${esc(a)}</b>${b?`<span>${b}</span>`:''}</li>`;
 const body=grp('Speciaal',sp.map(s=>li(s.t,esc(s.d))))+grp('Klussen',cr.map(c=>li(c.n,eur(c.min*k)+' – '+eur(c.max*k))))+grp('Families',fm.map(f=>`<li><a href="/families/${f.id}" data-link>${crest(f,'xs')}<b>${esc(f.n)}</b><span>${nl(f.cred)} cred${f.hits?' · '+f.hits+' huurmoorden':''}</span></a></li>`))
  +grp('Woning',hm.map(h=>li(h.n,esc(h.place||''))))+grp('Zaken',bz.map(b=>li(b.n,eur(b.p))))+grp('Training',tr.map(t=>li(t.n,esc(t.place))))+grp('Ontspannen',rx.map(x=>li(x.n,esc(x.place))))+grp('Te koop',gr.map(g=>li(g.n,eur(g.p))));
 return `<div class="label">Rang ${i+1} van ${RN.length}</div><h2 class="ri-name">${name}</h2><p class="ri-lore">${esc(rankLore(name))}</p>
  <dl class="ri-kv"><div><dt>XP nodig</dt><dd>${nl(RANKS[i][1])}</dd></div><div><dt>Buitbonus</dt><dd>+${Math.round((k-1)*100)}%</dd></div><div><dt>Kansbonus</dt><dd>+${i*2}%</dd></div><div><dt>Beloning</dt><dd>${rew?eurS(rew):'—'}</dd></div></dl>
  ${body||'<p class="ri-none">Hier ga je met lege handen in. Je begint met €250, 100 energie en een stad vol kansen.</p>'}`}
function ranksPage(){const top=RANKS[RANKS.length-1][1];
 return {title:'Rangen · '+BR,cls:'pg-ranks',desc:'De '+RANKS.length+' rangen van '+BR+', van Rookie tot Peetvader, en wat elke rang opent.',
 html:pageHead({kick:'Rangen',title:`${RANKS.length} rangen.<br><em>Iedereen begint onderaan.</em>`,lede:'Je klimt met XP. Elke rang opent nieuwe klussen, families, zaken en plekken om te trainen, en geeft je buit en je kans een zetje.',
   stats:[['Start','0 XP'],['Top',nl(top)+' XP'],['Buitbonus top','+'+Math.round((lootK(RANKS.length-1)-1)*100)+'%'],['Kansbonus top','+'+(RANKS.length-1)*2+'%']]})
 +`<section class="wrap rk"><div class="rk-wall rv" id="rkWall" role="listbox" aria-label="Rangen" tabindex="0">
   ${RANKS.map((r,i)=>i).reverse().map(i=>`<button class="wl" role="option" data-i="${i}" aria-selected="false"><span class="wl-xp">${nl(RANKS[i][1])}</span><span class="wl-r">${RN[i]}</span><span class="wl-u">${CRIMES.filter(c=>c.r===i).length} klussen${FAMILIES.some(f=>f.r===i)?' · familie':''}</span></button>`).join('')}
  </div><aside class="rk-info" id="rkInfo" aria-live="polite"></aside></section>`+moreHtml('rangen')+ctaHtml('Begin','onderaan.','Rookie is de enige rang die je krijgt zonder er iets voor te doen.'),
 after(){const wall=q('#rkWall'),info=q('#rkInfo');let cur=-1;
  const pickR=(i,focus)=>{i=clamp(i,0,RN.length-1);if(i===cur)return;cur=i;qa('.wl',wall).forEach(b=>{const on=+b.dataset.i===i;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});info.innerHTML=rankInfo(i);
   if(focus){const b=q(`.wl[data-i="${i}"]`,wall);b&&b.scrollIntoView({block:'nearest',behavior:reduce?'auto':'smooth'})}
   if(matchMedia('(max-width:900px)').matches&&focus===2)info.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})};
  wall.addEventListener('click',e=>{const b=e.target.closest('.wl');if(b)pickR(+b.dataset.i,2)});
  if(canHover)wall.addEventListener('mouseover',e=>{const b=e.target.closest('.wl');if(b)pickR(+b.dataset.i)});
  wall.addEventListener('keydown',e=>{if(e.key==='ArrowUp'){e.preventDefault();pickR(cur+1,1)}else if(e.key==='ArrowDown'){e.preventDefault();pickR(cur-1,1)}});
  pickR(0)}}}
route(/^\/rangen$/,ranksPage);

/* ================= Training en ontspannen ================= */
function trCard(t,l){let sum=0;for(let i=0;i<l;i++)sum+=trainCost(t,i);
 return `<article class="tc" style="--tc:${t.col}"><header><span class="tc-ic">${ic(t.ic in IC?t.ic:'skills')}</span><div><span class="tc-place">${esc(t.place)}</span><h3>${esc(t.n)}</h3></div>${t.r?`<span class="tc-lock">${ic('lock')}${rk(t.r)}</span>`:''}</header>
  <p>${esc(t.d)}</p>
  <dl class="tc-fx">${t.eff(l).map(([a,b])=>`<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl>
  <div class="tc-bar" aria-hidden="true"><i style="width:${l/TRAIN_MAX*100}%"></i>${(typeof TRAIN_MILES!=='undefined'?TRAIN_MILES:[]).map(m=>`<em style="left:${m/TRAIN_MAX*100}%"></em>`).join('')}</div>
  <div class="tc-foot"><div><span class="label">Volgende sessie</span><b>${l<TRAIN_MAX?eur(trainCost(t,l)):'klaar'}</b></div><div><span class="label">Tot hier betaald</span><b>${eurS(sum)}</b></div><div><span class="label">Tijdslot</span><b>${mins(t.cd)}</b></div></div></article>`}
function rxFx(x){const o=[];if(x.energy)o.push(x.energy>=999?'Energie helemaal vol':'+'+x.energy+' energie');if(x.hp)o.push(x.hp>=999?'Gezondheid helemaal hersteld':'+'+x.hp+'% gezondheid');
 if(x.heat)o.push('−'+x.heat+'% hitte');if(x.clearWanted)o.push('Van de gezochtlijst');if(x.focus)o.push('+'+x.focus+'% slaagkans'+(x.mins?' voor '+x.mins+' min':''));if(x.loot)o.push('+'+x.loot+'% buit'+(x.mins?' voor '+x.mins+' min':''));return o}
function rxCard(x){const ri=x.r||0,price=typeof relaxCost==='function'?relaxCost(x,ri,1):x.base;
 return `<article class="rc" style="--tc:${x.col}"><span class="tc-ic">${ic(x.ic in IC?x.ic:'spa')}</span><div class="rc-main"><span class="tc-place">${esc(x.place)}</span><h3>${esc(x.n)}</h3><p>${esc(x.d)}</p>
  <ul class="rc-fx">${rxFx(x).map(v=>`<li>${v}</li>`).join('')}</ul></div>
  <div class="rc-side"><b>${eur(price)}</b><span>${ri?'vanaf '+rk(ri):'meteen'}</span><span>${mins(x.cd)} wachten</span></div></article>`}
function trainPage(){const L0=10;
 return {title:'Training · '+BR,cls:'pg-train',desc:'Negen plekken om te trainen en negen manieren om bij te komen in '+BR+'.',
 html:pageHead({kick:'Training',title:'Word blijvend<br><em>beter.</em>',lede:'Van de sportschool tot een avondstudie rechten. Elke sessie maakt je voor altijd sterker, maar elke plek heeft een tijdslot. Ontspannen geeft je tijdelijk extra.',
   stats:[['Plekken',TRAININGS.length],['Max niveau',TRAIN_MAX],['Mijlpalen',(typeof TRAIN_MILES!=='undefined'?TRAIN_MILES:[]).join(' · ')||'—'],['Ontspannen',RELAX.length+' manieren']]})
 +`<section class="wrap tr"><div class="tr-ctl rv"><label for="trLv"><span class="label">Niveau</span><b id="trLvV">${L0}</b></label>
   <input type="range" id="trLv" min="0" max="${TRAIN_MAX}" value="${L0}" step="1" aria-describedby="trHint"><span class="tr-hint" id="trHint">Sleep en zie wat elke training op dat niveau doet en kost.</span></div>
   <div class="tr-grid" id="trGrid">${TRAININGS.map(t=>trCard(t,L0)).join('')}</div></section>
  <section class="wrap rx"><div class="sec-head rv"><div><div class="kick"><span class="dot"></span>Ontspannen</div><h2>Even bijkomen.<br><em>Of een weekend Ibiza.</em></h2></div>
   <p>Energie bijvullen, gezondheid herstellen, je hitte laten zakken of van de gezochtlijst af. De prijs groeit mee met je rang.</p></div>
   ${(typeof RELAX_TIERS!=='undefined'?RELAX_TIERS:['Ontspannen']).map((tn,ti)=>`<div class="rx-tier rv"><h3 class="rx-h">${esc(tn)}</h3><div class="rx-grid">${RELAX.filter(x=>(x.tier||0)===ti).map(rxCard).join('')}</div></div>`).join('')}</section>`
  +moreHtml('training')+ctaHtml('Eerste sessie','staat klaar.','De sportschool is open. De rest van de stad nog niet.'),
 after(){const r=q('#trLv'),v=q('#trLvV'),grid=q('#trGrid');let raf=0;
  const upd=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{const l=+r.value;v.textContent=l;grid.innerHTML=TRAININGS.map(t=>trCard(t,l)).join('');r.style.setProperty('--p',(l/TRAIN_MAX*100)+'%')})};
  r.addEventListener('input',upd);r.style.setProperty('--p',(L0/TRAIN_MAX*100)+'%');onLeave(()=>cancelAnimationFrame(raf))}}}
route(/^\/training$/,trainPage);

/* ================= Account: kop, inloggen en account aanmaken ================= */
// Het venster (registreren met 16+-vinkje, inloggen) staat in lp-auth.js en wordt pas bij de eerste klik geladen.
function updateAuthUI(){const n=esc(userName);
 q('#topAuth').innerHTML=loggedIn?`<span class="whoami">${n?'Ingelogd als <b>'+n+'</b>':'Ingelogd'}</span><button class="tlink" type="button" data-logout>Uitloggen</button><a class="btn sm" href="/game"><span class="lg">Verder spelen</span><span class="sm-t">Spelen</span></a>`
  :'<a class="tlink" href="/?login=1" data-auth="login">Inloggen</a><a class="btn sm" href="/start" data-auth="register"><span class="lg">Speel gratis</span><span class="sm-t">Speel gratis</span></a>';
 q('#mnavAuth').innerHTML=loggedIn?`<a class="btn xl" href="/game">Verder spelen</a><button class="btn ghost xl" type="button" data-logout>Uitloggen${n?' ('+n+')':''}</button>`
  :'<a class="btn xl" href="/start" data-auth="register">Speel gratis</a><a class="btn ghost xl" href="/?login=1" data-auth="login">Inloggen</a><p class="mnav-klein">16+ · Alleen spelgeld</p>';
 qa('[data-play]').forEach(a=>a.setAttribute('href',loggedIn?'/game':'/start'))}
document.addEventListener('click',e=>{if(!e.target.closest('[data-logout]'))return;setToken(null);try{localStorage.removeItem('ow_lpname')}catch(x){}
 loggedIn=false;userName='';menu(false);updateAuthUI();render(curPath||'/',{keep:true})});
function initSession(){const t=getToken();
 if(t){loggedIn=true;try{userName=localStorage.getItem('ow_lpname')||''}catch(e){}}
 updateAuthUI();render(cleanPath(location.pathname),{first:true});
 if(!t)return Promise.resolve();
 return fetch('/api/me',{headers:{Authorization:'Bearer '+t}}).then(r=>{
  if(r.ok)return r.json().then(j=>{const nm=String(j.username||'');userName=nm;loggedIn=true;try{localStorage.setItem('ow_lpname',nm)}catch(e){}updateAuthUI()});
  if(r.status===401)setToken(null);
  loggedIn=false;userName='';updateAuthUI();render(curPath,{keep:true})}).catch(()=>{})}
function openAuth(m,from,msg){menu(false);
 need('/js/lp-auth.js?v='+((q('script[src*="landing.js"]')||{}).src||'').split('?v=')[1]).then(ok=>{if(ok&&window.LPAuth)LPAuth.open(m,from,{startCash:typeof GAME_CONST!=='undefined'?GAME_CONST.startCash:0,first:RN[0],msg});else location.href=m==='login'?'/?login=1':'/start'})}
document.addEventListener('click',e=>{const a=e.target.closest('[data-auth]');if(!a||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();
 if(loggedIn){location.href='/game';return}openAuth(a.dataset.auth,a)});

/* ================= Start ================= */
initSession().then(()=>{const s=location.search;if(loggedIn)return;
 if(/[?&]verlopen=1/.test(s))openAuth('login',null,'Je bent uitgelogd. Log opnieuw in.');
 else if(/[?&]register=1/.test(s))openAuth('register',null,/[?&]banned=1/.test(s)?'Je vorige profiel is verbannen. Maak hier een nieuw profiel aan en begin opnieuw.':'');
 else if(/[?&]login=1/.test(s))openAuth('login')});
})();
