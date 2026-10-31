// Website van Onderwereld. Eén pagina met een eigen adres per onderwerp (History API):
//   /  ·  /misdaden  ·  /casino  ·  /casino/<spel>  ·  /families  ·  /families/<id>  ·  /rangen  ·  /training
// De server stuurt onbekende adressen naar index.html, dus elke link werkt ook direct of na verversen.
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

/* ---------- Verschijnen bij scrollen ---------- */
function reveal(root){const els=qa('.rv',root||app);if(reduce||!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.05});
  els.forEach(e=>io.observe(e));onLeave(()=>io.disconnect())}
// Getallen tellen op als ze in beeld komen
function countUp(root){qa('[data-count]',root||app).forEach(el=>{const to=+el.dataset.count;if(reduce||!to){el.textContent=nl(to);return}
  let t0=0;const go=t=>{if(!t0)t0=t;const p=Math.min(1,(t-t0)/900),e=1-Math.pow(1-p,3);el.textContent=nl(Math.round(to*e));if(p<1&&el.isConnected)requestAnimationFrame(go)};
  el.textContent='0';requestAnimationFrame(go)})}

/* ---------- Kop, menu en navigatie ---------- */
const top=q('#top');
const onScroll=()=>top.classList.toggle('solid',scrollY>30||!app.classList.contains('pg-home'));
addEventListener('scroll',onScroll,{passive:true});
const burger=q('#burger'),mnav=q('#mnav');
function menu(open){mnav.hidden=!open;burger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);if(open){const a=q('a',mnav);a&&a.focus({preventScroll:true})}}
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
  document.title=out.title||'Onderwereld';
  const md=q('meta[name="description"]');if(md&&out.desc)md.setAttribute('content',out.desc);
  setActive(path);onScroll();
  if(opt.pop)scrollTo(0,opt.y||0);else if(!opt.keep)scrollTo(0,0);
  if(out.after)out.after();
  reveal();countUp();
  if(!opt.first&&!opt.pop){app.focus({preventScroll:true})}
}
const cleanPath=p=>(p.replace(/\/+$/,'')||'/').toLowerCase();
function go(href){const u=new URL(href,location.href);if(u.origin!==location.origin){location.href=href;return}
  const p=cleanPath(u.pathname);
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

function notFound(){return{title:'Niet gevonden · Onderwereld',cls:'pg-404',html:`<section class="ph"><div class="wrap"><div class="kick"><span class="dot"></span>Doodlopende steeg</div>
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
  <div class="hero-cta">${loggedIn?'<a class="btn xl" href="/game.html">Ga naar mijn dashboard</a>':'<button class="btn xl" data-auth="register">Maak je account aan</button><button class="btn ghost xl" data-auth="login">Inloggen</button>'}</div></section>`}

/* ================= Casino: de spellen en hun illustraties staan in covers.js ================= */
const {GAMES,gameBy,SUIT,pcard,chip,RL_ORDER,RL_RED,arcSeg,wheelSvg,coverSvg}=COV;
/* ================= Voorpagina ================= */
const PLACES=['Damrak','Kalverstraat','Zeedijk','Rembrandtplein','Leidseplein','De Wallen','Haarlemmerdijk','Albert Cuypmarkt','Zuidas','Bijlmer','Oostelijke Handelskade','Museumplein','Vondelpark','Centraal Station','Westerpark','Nieuwmarkt','Spui','Waterlooplein','De Pijp','Jordaan'];
const TYPES=[['Zakkenrollerij',0],['Fietsendiefstal',0],['Winkeldiefstal',0],['Autokraak',0],['Overval avondwinkel',1],['Inbraak woning',0],['Verdachte situatie',0],['Achtervolging',1],['Overval juwelier',1],['Fruitautomaat opengebroken',0],['Valse tickets',0],['Telefoonfraude gemeld',0],['Geldtransport onderschept',1],['Arrestatie',0],['Carjacking bij stoplicht',1],['Schoten gehoord',1]];

function heroHtml(){const L=loggedIn;
 return `<section class="hero" id="hero">
  <canvas id="city" aria-hidden="true"></canvas>
  <div class="hero-grid wrap">
   <div class="hero-copy">
    <div class="kick" id="kick"><span class="dot"></span>${L?'Welkom terug, '+esc(userName):'Meldkamer · live'}</div>
    <h1 class="mega" id="mega">${L?'<span>De stad</span><span><em>wacht op je.</em></span>':'<span>Van rookie</span><span>tot <em>peetvader</em>.</span>'}</h1>
    <p class="lede" id="lede">${L?'Je imperium staat precies waar je het hebt achtergelaten. Je zaken hebben doorgedraaid en je rivalen hebben niet stilgezeten.':'Je begint met €250 en een open rugzak op de Dam. Hoe ver je komt, hangt af van je lef, je familie en hoe vaak je de politie te slim af bent.'}</p>
    <div class="hero-cta" id="heroCta">${L?'<a class="btn xl" href="/game.html">Ga naar mijn dashboard</a><a class="btn ghost xl" href="#loopbaan">Wat er nog te halen valt</a>':'<button class="btn xl" data-auth="register">Begin je carrière</button><button class="btn ghost xl" data-auth="login">Inloggen</button>'}</div>
   </div>
   <aside class="feed" aria-label="Meldingen uit de stad"><div class="feed-head"><span>Meldkamer</span><span id="clock">00:00:00</span></div><ol id="feed"></ol></aside>
  </div>
  <nav class="stats wrap" aria-label="Onderdelen van het spel">
   <a href="/rangen" data-link><b data-count="${RANKS.length}">${RANKS.length}</b><span>rangen</span>${ic('arrow')}</a>
   <a href="/misdaden" data-link><b data-count="${CRIMES.length}">${CRIMES.length}</b><span>misdaden</span>${ic('arrow')}</a>
   <a href="/families" data-link><b data-count="${FAMILIES.length}">${FAMILIES.length}</b><span>families</span>${ic('arrow')}</a>
   <a href="/casino" data-link><b data-count="${GAMES.length}">${GAMES.length}</b><span>casinospellen</span>${ic('arrow')}</a>
   <a href="/training" data-link><b data-count="${TRAININGS.length}">${TRAININGS.length}</b><span>trainingen</span>${ic('arrow')}</a>
  </nav>
 </section>`}

/* ---------- De stad in 3D: kaart met grachten, blokken, torens en meldingen die oplichten ---------- */
function seeded(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function initCity(){
 const cv=q('#city'),hero=q('#hero');if(!cv)return;const g=cv.getContext('2d');
 const small=matchMedia('(max-width:760px)').matches,rnd=seeded(31102026);
 const RINGS=[.3,.42,.54,.66,.78],ROAD=1.5,STREETS=[];for(let k=1;k<15;k++)STREETS.push(k/15*Math.PI);
 const AMSTEL=1.32;
 // gebouwen in stadscoördinaten: centrum (Dam) op 0,0; negatieve z = richting kijker, het IJ ligt achter het centrum
 const B=[],k=small?1.8:1,tang=a=>Math.atan2(-Math.cos(a),-Math.sin(a));
 const add=(x,z,w,d,h,rot,kind)=>{const win=[];if(h>.045)for(let i=0;i<(kind==='tower'?12:4);i++)win.push([i%4,.12+rnd()*.76,.15+rnd()*.75,rnd()]);B.push({x,z,w,d,h,rot,win,zuid:kind==='tower'})};
 const onStreet=(a,r,m)=>STREETS.some(s=>Math.abs(s-a)*r<m)||Math.abs(a-AMSTEL)*r<m*1.6;
 // grachtengordel: twee rijen smalle grachtenpanden tussen elke twee grachten
 for(let i=0;i<RINGS.length-1;i++){[RINGS[i]+.034,RINGS[i+1]-.034].forEach(rr=>{let a=.05;
   while(a<Math.PI-.05){const w=(.011+rnd()*.011)*k;a+=w/rr;if(!onStreet(a,rr,.018))add(Math.cos(a)*rr,-Math.sin(a)*rr,w,.019,.016+rnd()*.03,tang(a),'canal');a+=(w+.0035)/rr}})}
 // het centrum rond de Dam
 for(let i=0;i<(small?6:12);i++){const a=.2+rnd()*(Math.PI-.4),r=.1+rnd()*.14;add(Math.cos(a)*r,-Math.sin(a)*r,.02+rnd()*.015,.02+rnd()*.012,.02+rnd()*.03,tang(a),'block')}
 // de rest van de stad: blokken langs de straten, met torens op de Zuidas
 for(let rr=.9;rr<1.9;rr+=.085*k){if(Math.abs(rr-ROAD)<.05)continue;const step=.085*k/rr;
  for(let a=.05;a<Math.PI-.05;a+=step){if(rnd()<.26)continue;const aa=a+(rnd()-.5)*step*.3,r2=rr+(rnd()-.5)*.02;if(onStreet(aa,r2,.03))continue;
   add(Math.cos(aa)*r2,-Math.sin(aa)*r2,(.02+rnd()*.016)*k,(.02+rnd()*.016)*k,.024+rnd()*.05,tang(aa),'block')}}
 // torens aan de overkant van het IJ: de skyline rechtsboven
 for(let i=0;i<(small?7:13);i++){const x=.22+rnd()*.62,z=.48+rnd()*.42;add(x,z,.022+rnd()*.016,.022+rnd()*.016,.1+rnd()*.24,rnd()*.4,'tower')}
 // Noord, aan de overkant van het IJ: loodsen
 for(let x=-1.7;x<1.7;x+=.13*k)for(let z=.44;z<1.2;z+=.11*k){if(rnd()<.42||(x>.15&&x<.9&&z<.95))continue;add(x+(rnd()-.5)*.03,z+(rnd()-.5)*.03,.03+rnd()*.03,.018+rnd()*.012,.018+rnd()*.03,0,'block')}
 let W=0,H=0,dpr=1,F=1,yaw=0,pitch=.6,mx=null,my=null,tyaw=0,tp=0,run=true,frame=0,slow=small;
 const CAM={x:0,y:1.08,z:-.62},P={x:0,z:1.42};
 let L={x:.2,z:-.4},Lt={x:.2,z:-.4},pings=[],hot=-1,pid=0;
 function size(){dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0);
  F=Math.max(W*.86,H*.78);P.x=W>900?.62:W>600?.3:.12;P.z=W>600?1.42:1.62}
 // stad → wereld (draaien rond het centrum) → scherm
 let cy=1,sy=0,cp=1,sp=0;
 const toW=(x,z)=>[x*cy-z*sy+P.x,x*sy+z*cy+P.z];
 function prj(wx,wy,wz){const X=wx-CAM.x,Y=wy-CAM.y,Z=wz-CAM.z,dep=-Y*sp+Z*cp;if(dep<.08)return null;const k=F/dep;return [W*.5+X*k,H*.5-(Y*cp+Z*sp)*k,dep]}
 const P3=(x,y,z)=>{const w=toW(x,z);return prj(w[0],y,w[1])};
 function ground(sx,sy2){const rx=(sx-W*.5)/F,uy=-(sy2-H*.5)/F,dx=rx,dy=-sp+uy*cp,dz=cp+uy*sp;if(dy>=-.01)return null;
  const t=-CAM.y/dy,wx=CAM.x+t*dx,wz=CAM.z+t*dz,ux=wx-P.x,uz=wz-P.z;return {x:ux*cy+uz*sy,z:-ux*sy+uz*cy}}
 function poly(pts,fill,stroke){if(pts.some(p=>!p))return;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();
  if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.stroke()}}
 function band(r0,r1,a0,a1,fill,n){n=n||48;const pts=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;pts.push(P3(Math.cos(a)*r1,0,-Math.sin(a)*r1))}
  for(let i=n;i>=0;i--){const a=a0+(a1-a0)*i/n;pts.push(P3(Math.cos(a)*r0,0,-Math.sin(a)*r0))}poly(pts.filter(Boolean),fill)}
 const mix=(c,k)=>`rgb(${Math.round(c[0]+(255-c[0])*k*.55)},${Math.round(c[1]+(122-c[1])*k*.42)},${Math.round(c[2]+(26-c[2])*k*.3)})`;
 function addPing(){const a=pick(STREETS),r=.25+Math.random()*1.25,x=Math.cos(a)*r+(Math.random()-.5)*.05,z=-Math.sin(a)*r;
  const t=pick(TYPES),p=pick(PLACES),id=++pid;pings.push({x,z,t0:performance.now(),hot:t[1],id,lab:t[0]+' · '+p});pings=pings.slice(-12);
  const d=new Date(),hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0');
  const f=q('#feed');if(!f)return;const li=document.createElement('li');if(t[1])li.className='hot';li.dataset.p=id;
  li.innerHTML=`<time>${hh}:${mm}</time><b>${esc(t[0])}</b><span>${esc(p)}</span>`;f.prepend(li);while(f.children.length>7)f.lastChild.remove()}
 function draw(t){
  if(!run)return;requestAnimationFrame(draw);frame++;if(slow&&frame%2)return;
  tyaw=(mx==null?0:(mx/W-.5)*.16);tp=(my==null?0:(my/H-.5)*.05);
  yaw+=((reduce?0:Math.sin(t/9000)*.05)+tyaw-yaw)*.05;pitch+=(.6+tp-pitch)*.05;
  cy=Math.cos(yaw);sy=Math.sin(yaw);cp=Math.cos(pitch);sp=Math.sin(pitch);
  if(mx==null){Lt={x:Math.cos(t/5200)*.55,z:-.55+Math.sin(t/4100)*.35}}
  L.x+=(Lt.x-L.x)*.06;L.z+=(Lt.z-L.z)*.06;
  g.clearRect(0,0,W,H);
  // water: het IJ en de Amstel
  {const a=P3(-1.7,0,.08),b2=P3(1.9,0,.08),c2=P3(1.9,0,.32),d2=P3(-1.7,0,.32);if(a&&b2&&c2&&d2){const gr=g.createLinearGradient(a[0],0,b2[0],0);gr.addColorStop(0,'rgba(46,86,140,0)');gr.addColorStop(.35,'rgba(46,86,140,.11)');gr.addColorStop(.75,'rgba(46,86,140,.13)');gr.addColorStop(1,'rgba(46,86,140,0)');poly([a,b2,c2,d2],gr)}}
  const am=[];for(let i=0;i<=20;i++){const r=.12+i/20*1.7,a=AMSTEL+Math.sin(i/3)*.03;am.push([r,a])}
  g.lineCap='round';g.lineWidth=3;g.strokeStyle='rgba(70,130,190,.26)';g.beginPath();am.forEach(([r,a],i)=>{const p=P3(Math.cos(a)*r,0,-Math.sin(a)*r);if(p)i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();
  RINGS.forEach((r,i)=>band(r-.011,r+.011,.02,Math.PI-.02,`rgba(70,130,190,${.3-i*.03})`));
  band(ROAD-.016,ROAD+.016,.02,Math.PI-.02,'rgba(235,232,226,.05)',64);
  g.lineWidth=1;g.strokeStyle='rgba(235,232,226,.07)';
  STREETS.forEach(a=>{const p0=P3(Math.cos(a)*.14,0,-Math.sin(a)*.14),p1=P3(Math.cos(a)*1.95,0,-Math.sin(a)*1.95);if(p0&&p1){g.beginPath();g.moveTo(p0[0],p0[1]);g.lineTo(p1[0],p1[1]);g.stroke()}});
  // lichtbundel op de grond
  const lc=P3(L.x,0,L.z),lx=P3(L.x+.5,0,L.z),lz=P3(L.x,0,L.z+.5);
  if(lc&&lx&&lz){const rx=Math.max(8,Math.hypot(lx[0]-lc[0],lx[1]-lc[1])),ry=Math.max(4,Math.abs(lz[1]-lc[1]));
   g.save();g.translate(lc[0],lc[1]);g.scale(1,ry/rx);const gr=g.createRadialGradient(0,0,0,0,0,rx);gr.addColorStop(0,'rgba(255,122,26,.22)');gr.addColorStop(1,'rgba(255,122,26,0)');
   g.fillStyle=gr;g.beginPath();g.arc(0,0,rx,0,Math.PI*2);g.fill();g.restore()}
  // gebouwen van ver naar dichtbij
  const camC={x:0,z:0};{const ux=CAM.x-P.x,uz=CAM.z-P.z;camC.x=ux*cy+uz*sy;camC.z=-ux*sy+uz*cy}
  const vis=[];
  for(const b of B){const p=P3(b.x,0,b.z);if(!p||p[2]<.7)continue;if(p[0]<-120||p[0]>W+120||p[1]<-140||p[1]>H+200)continue;vis.push([p[2],b])}
  vis.sort((a,b)=>b[0]-a[0]);
  const tt=t/1000;
  for(const [dep,b] of vis){const c=Math.cos(b.rot),s=Math.sin(b.rot);
   const fp=[[-b.w,-b.d],[b.w,-b.d],[b.w,b.d],[-b.w,b.d]].map(([u,v])=>[b.x+u*c-v*s,b.z+u*s+v*c]);
   const bot=fp.map(([x,z])=>P3(x,0,z)),tp2=fp.map(([x,z])=>P3(x,b.h,z));if(bot.some(v=>!v)||tp2.some(v=>!v))continue;
   const lk=Math.max(0,1-Math.hypot(b.x-L.x,b.z-L.z)/.5),fade=Math.min(1,(dep-.7)/.45);
   g.globalAlpha=fade;
   for(let i=0;i<4;i++){const j=(i+1)%4,mxz=[(fp[i][0]+fp[j][0])/2,(fp[i][1]+fp[j][1])/2],n=[mxz[0]-b.x,mxz[1]-b.z],v=[camC.x-mxz[0],camC.z-mxz[1]];
    if(n[0]*v[0]+n[1]*v[1]<=0)continue;
    const shade=i%2?[15,17,21]:[20,23,28];poly([bot[i],bot[j],tp2[j],tp2[i]],mix(shade,lk),'rgba(235,232,226,.05)');
    for(const w of b.win)if(w[0]===i){const on=(Math.sin(tt*.7+w[3]*40)>-.6)||b.zuid;if(!on)continue;
     const bx=bot[i][0]+(bot[j][0]-bot[i][0])*w[1],by=bot[i][1]+(bot[j][1]-bot[i][1])*w[1],tx=tp2[i][0]+(tp2[j][0]-tp2[i][0])*w[1],ty=tp2[i][1]+(tp2[j][1]-tp2[i][1])*w[1];
     g.fillStyle=b.zuid?`rgba(169,220,255,${.35+lk*.4})`:`rgba(255,173,107,${.45+lk*.4})`;g.fillRect(bx+(tx-bx)*w[2]-.8,by+(ty-by)*w[2]-.8,1.7,1.7)}}
   poly(tp2,mix([30,34,41],lk),`rgba(235,232,226,${.07+lk*.12})`)}
  g.globalAlpha=1;
  // meldingen: ring op de grond, lichtzuil en een label bij de nieuwste
  const now2=performance.now();g.globalCompositeOperation='lighter';
  pings.forEach((p,idx)=>{const age=(now2-p.t0)/1000,col=p.hot?'255,61,82':'255,122,26',hi=p.id===hot;
   for(let k=0;k<2;k++){const a2=(age+k*.9)%1.8,rr=.012+a2*.05*(hi?1.6:1),pts=[];for(let i=0;i<=24;i++){const an=i/24*Math.PI*2;pts.push(P3(p.x+Math.cos(an)*rr,0,p.z+Math.sin(an)*rr))}
    if(pts.every(Boolean)){g.strokeStyle=`rgba(${col},${Math.max(0,.75-a2*.42)})`;g.lineWidth=1.4;g.beginPath();pts.forEach((v,i)=>i?g.lineTo(v[0],v[1]):g.moveTo(v[0],v[1]));g.stroke()}}
   const b0=P3(p.x,0,p.z),b1=P3(p.x,hi?.42:.28,p.z);if(!b0||!b1)return;
   const lg=g.createLinearGradient(b0[0],b0[1],b1[0],b1[1]);lg.addColorStop(0,`rgba(${col},${Math.max(.25,.9-age*.04)})`);lg.addColorStop(1,`rgba(${col},0)`);
   g.strokeStyle=lg;g.lineWidth=hi?3:2;g.beginPath();g.moveTo(b0[0],b0[1]);g.lineTo(b1[0],b1[1]);g.stroke();
   g.fillStyle=`rgba(${col},1)`;g.beginPath();g.arc(b0[0],b0[1],2.6,0,Math.PI*2);g.fill()});
  g.globalCompositeOperation='source-over';
  const last=pings[pings.length-1];
  if(last&&!small){const age=(now2-last.t0)/1000;if(age<3.2){const b1=P3(last.x,.28,last.z);if(b1){const a=age<.3?age/.3:age>2.6?(3.2-age)/.6:1;
   g.font='500 11px "JetBrains Mono",monospace';const tw=g.measureText(last.lab).width;let lx=b1[0]+8;if(lx+tw+22>W)lx=b1[0]-8-tw-14;g.globalAlpha=a;g.fillStyle='rgba(8,9,11,.85)';g.fillRect(lx,b1[1]-10,tw+14,20);
   g.fillStyle=last.hot?'#ff6b7c':'#ffad6b';g.fillText(last.lab,lx+7,b1[1]+4);g.globalAlpha=1}}}
 }
 size();for(let i=0;i<5;i++)addPing();
 const onMove=e=>{const r=cv.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;const gp=ground(mx,my);if(gp)Lt=gp};
 const onOut=()=>{mx=my=null};
 hero.addEventListener('pointermove',onMove);hero.addEventListener('pointerleave',onOut);
 const feed=q('#feed');feed.addEventListener('pointerover',e=>{const li=e.target.closest('li');hot=li?+li.dataset.p:-1});feed.addEventListener('pointerleave',()=>{hot=-1});
 let rt;const onR=()=>{clearTimeout(rt);rt=setTimeout(size,120)};addEventListener('resize',onR);
 const io='IntersectionObserver' in window?new IntersectionObserver(es=>{const v=es[0].isIntersecting;if(v&&!run){run=true;requestAnimationFrame(draw)}else if(!v)run=false}):null;
 io&&io.observe(hero);
 const onVis=()=>{if(document.hidden)run=false;else if(!run){run=true;requestAnimationFrame(draw)}};document.addEventListener('visibilitychange',onVis);
 if(reduce){run=true;draw(0);run=false}else requestAnimationFrame(draw);
 every(addPing,reduce?6000:2300);
 const clock=()=>{const d=new Date(),c=q('#clock');if(c)c.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':')};clock();every(clock,1000);
 onLeave(()=>{run=false;removeEventListener('resize',onR);document.removeEventListener('visibilitychange',onVis);io&&io.disconnect()});
}

/* ---------- Je loopbaan: de lijn van Rookie naar Peetvader met een dashboard per rang ---------- */
function careerHtml(){const n=RN.length-1;
 return `<section class="blk career" id="loopbaan">
  <div class="sec-head wrap rv"><div><div class="kick"><span class="dot"></span>Je loopbaan</div><h2>Hoe het begint.<br><em>Waar het eindigt.</em></h2></div>
   <p>Van een bekertje bij Centraal tot de goudreserve van een land. Sleep over de lijn of tik op een rang en zie wat je dan doet, waar je slaapt en wie je binnenlaat. Alles komt uit het echte spel.</p></div>
  <div class="wrap rv"><div class="line-wrap" id="lineWrap"><div class="line" id="line" role="slider" tabindex="0" aria-label="Kies een rang" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="0" aria-valuetext="${RN[0]}">
    <div class="line-track"><i class="line-fill" id="lineFill"></i></div>
    ${RN.map((nm,i)=>`<button class="stop${i%2?' alt':''}" data-i="${i}" tabindex="-1" style="--x:${(i/n*100).toFixed(3)}%"><i></i><span>${nm}</span><small>${nl(RANKS[i][1])} XP</small></button>`).join('')}
   </div></div>
   <div class="line-ctl"><button class="btn ghost sm" id="linePlay" type="button">${ic('play')}<span>Speel je carrière af</span></button>
    <button class="tlink sm" type="button" data-go="0">Het begin</button><button class="tlink sm" type="button" data-go="${n}">De top</button></div>
   <div class="board" id="board" aria-live="polite"></div></div></section>`}
function boardHtml(ri){
 const name=RN[ri],k=lootK(ri),lore=rankLore(name);
 const av=CRIMES.filter(c=>c.r<=ri),nw=CRIMES.filter(c=>c.r===ri);
 const best=av.map(c=>({c,ev:c.base/100*(c.min+c.max)/2})).sort((a,b)=>b.ev-a.ev)[0].c;
 const lo=Math.min(...av.map(c=>c.min))*k,hi=Math.max(...av.map(c=>c.max))*k;
 const fams=FAMILIES.filter(f=>f.r<=ri),nf=FAMILIES.filter(f=>f.r===ri);
 const nb=BIZ.filter(b=>b.r===ri),biz=BIZ.filter(b=>b.r<=ri);
 const home=(typeof HOMES!=='undefined'?HOMES.filter(h=>(h.r||0)<=ri).pop():null);
 const ntr=ri?TRAININGS.filter(t=>(t.r||0)===ri):TRAININGS.filter(t=>!(t.r||0));
 const nrx=RELAX.filter(x=>(x.r||0)===ri&&ri),ng=GEAR.filter(g=>g.r===ri),nsp=SPECIAL.filter(s=>s.r===ri);
 const rew=RANK_REWARD(ri);
 const maxs=RN.map((_,i)=>Math.max(...CRIMES.filter(c=>c.r<=i).map(c=>c.max))*lootK(i));
 const l0=Math.log10(maxs[0]),l1=Math.log10(maxs[maxs.length-1]);
 const chips=[...nsp.map(s=>[ic('bolt'),s.t,s.d]),...nw.map(c=>[ic('crimes'),c.n,'Klus · '+eur(c.min*k)+' tot '+eur(c.max*k)]),...nf.map(f=>[crest(f,'xs'),f.n,'Familie · vanaf '+f.cred+' cred']),
  ...nb.map(b=>[ic('biz'),b.n,'Zaak · '+eur(b.p)]),...(home&&(home.r||0)===ri&&ri?[[ic('house'),home.n,'Woning · '+esc(home.place||'')]]:[]),
  ...ntr.map(t=>[ic(t.ic in IC?t.ic:'skills'),t.n,'Training · '+t.place]),...nrx.map(x=>[ic(x.ic in IC?x.ic:'spa'),x.n,'Ontspannen · '+x.place]),...ng.map(x=>[ic('shop'),x.n,'Te koop · '+eur(x.p)])];
 return `<article class="bx b-rank"><div class="label">Rang ${ri+1} van ${RN.length}</div><h3 class="b-name">${name}</h3><p>${esc(lore)}</p>
   <div class="b-seg" aria-hidden="true">${RN.map((_,i)=>`<i class="${i<=ri?'on':''}"></i>`).join('')}</div>
   <dl class="b-kv"><div><dt>XP nodig</dt><dd>${nl(RANKS[ri][1])}</dd></div><div><dt>Buitbonus</dt><dd>+${Math.round((k-1)*100)}%</dd></div><div><dt>Beloning</dt><dd>${rew?eurS(rew):'—'}</dd></div></dl></article>
  <article class="bx b-best"><div class="label">Beste klus op deze rang</div><h4>${esc(best.n)}</h4><p>${esc(best.d)}</p>
   <dl class="b-kv"><div><dt>Buit</dt><dd>${eurS(best.min*k)} – ${eurS(best.max*k)}</dd></div><div><dt>Basiskans</dt><dd>${best.base}%</dd></div><div><dt>Energie</dt><dd>${best.en}</dd></div></dl>
   <div class="b-meter"><i style="width:${best.base}%"></i></div></article>
  <article class="bx b-home"><div class="label">Hier slaap je</div>${home?`<h4>${esc(home.n)}</h4><span class="b-place">${esc(home.place||'')}</span><p>${esc(home.d||'')}</p>`:'<h4>Op straat</h4>'}</article>
  <article class="bx b-loot"><div class="label">Buit per klus</div><div class="b-big">${eurS(lo)} <span>tot</span> ${eurS(hi)}</div>
   <div class="b-bars" role="img" aria-label="Hoogste buit per rang, van ${eurS(maxs[0])} tot ${eurS(maxs[maxs.length-1])}">${maxs.map((m,i)=>`<i class="${i<=ri?'on':''}${i===ri?' cur':''}" style="height:${(14+(Math.log10(m)-l0)/(l1-l0)*86).toFixed(1)}%" title="${RN[i]}: tot ${eurS(m)}"></i>`).join('')}</div>
   <small>${av.length} van ${CRIMES.length} klussen open · ${biz.length} van ${BIZ.length} zaken te koop</small></article>
  <article class="bx b-fam"><div class="label">Families die je binnenlaten</div><div class="b-big">${fams.length} <span>van ${FAMILIES.length}</span></div>
   <div class="b-crests">${FAMILIES.map(f=>`<a href="/families/${f.id}" data-link class="${f.r<=ri?'on':''}" title="${esc(f.n)} · vanaf ${rk(f.r)}">${crest(f,'sm')}</a>`).join('')}</div>
   <small>${fams.length?'Met genoeg straatcredit kun je kiezen.':'De eerste familie laat je toe vanaf '+rk(Math.min(...FAMILIES.map(f=>f.r)))+'.'}</small></article>
  <article class="bx b-new"><div class="label">${ri?'Nieuw vanaf '+name:'Waar je mee begint'}</div>
   ${chips.length?`<ul class="b-chips">${chips.map(c=>`<li>${c[0]}<div><b>${esc(c[1])}</b><span>${c[2]}</span></div></li>`).join('')}</ul>`:'<p class="b-none">Geen nieuwe klussen op deze rang. Alleen meer respect, een grotere buit en betere wapens.</p>'}</article>`}
function initCareer(){const line=q('#line');if(!line)return;const wrap=q('#lineWrap'),fill=q('#lineFill'),board=q('#board'),stops=qa('.stop',line),n=RN.length-1,play=q('#linePlay');
 let cur=-1,timer=null;
 function set(i,scroll){i=clamp(i,0,n);if(i===cur)return;cur=i;fill.style.width=(i/n*100)+'%';
  stops.forEach((s,k)=>{s.classList.toggle('on',k<=i);s.classList.toggle('cur',k===i)});
  line.setAttribute('aria-valuenow',i);line.setAttribute('aria-valuetext',RN[i]);board.innerHTML=boardHtml(i);
  if(scroll!==false&&wrap.scrollWidth>wrap.clientWidth){const s=stops[i];wrap.scrollTo({left:s.offsetLeft-wrap.clientWidth/2,behavior:reduce?'auto':'smooth'})}}
 const fromX=x=>{const r=q('.line-track',line).getBoundingClientRect();return Math.round(clamp((x-r.left)/r.width,0,1)*n)};
 let drag=false;
 line.addEventListener('pointerdown',e=>{if(e.button)return;stop();drag=true;line.setPointerCapture(e.pointerId);set(fromX(e.clientX),false)});
 line.addEventListener('pointermove',e=>{if(drag)set(fromX(e.clientX),false)});
 const end=()=>{if(drag){drag=false;const c=cur;cur=-1;set(c)}};line.addEventListener('pointerup',end);line.addEventListener('pointercancel',end);
 line.addEventListener('keydown',e=>{const k=e.key;let i=cur;if(k==='ArrowRight'||k==='ArrowUp')i++;else if(k==='ArrowLeft'||k==='ArrowDown')i--;else if(k==='Home')i=0;else if(k==='End')i=n;else return;e.preventDefault();stop();set(i)});
 qa('[data-go]').forEach(b=>b.addEventListener('click',()=>{stop();set(+b.dataset.go)}));
 function stop(){if(timer){clearInterval(timer);timer=null;play.innerHTML=ic('play')+'<span>Speel je carrière af</span>'}}
 play.addEventListener('click',()=>{if(timer){stop();return}if(cur>=n)set(0);play.innerHTML=ic('pause')+'<span>Pauze</span>';
  timer=setInterval(()=>{if(cur>=n){stop();return}set(cur+1)},reduce?1400:900)});
 onLeave(stop);set(0,false)}

/* ---------- Casino-strook en voedselketen op de voorpagina ---------- */
function coverCard(g,i,uid){return `<a class="cov rv" href="/casino/${g.slug}" data-link style="--c:${g.col};--d:${i*50}ms"><div class="cov-art"><div class="cov-in">${coverSvg(g.id,(uid||'h')+g.id)}<i class="cov-glare"></i></div></div>
 <div class="cov-txt"><span class="cov-k">${g.kind}</span><b>${g.n}</b><span class="cov-tags">${g.tags.map(t=>`<em>${t}</em>`).join('')}</span></div></a>`}
function initTilt(root){if(!canHover||reduce)return;qa('.cov',root||app).forEach(c=>{const inn=q('.cov-in',c);
 c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
  inn.style.transform=`rotateX(${(-y*9).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg) translateZ(0)`;inn.style.setProperty('--gx',(x*100+50)+'%');inn.style.setProperty('--gy',(y*100+50)+'%')});
 c.addEventListener('pointerleave',()=>{inn.style.transform=''})})}
const chainSorted=()=>FAMILIES.slice().sort((a,b)=>a.r-b.r||a.cred-b.cred);
function chainHtml(){const F=chainSorted(),n=F.length;
 return `<section class="blk chain-blk"><div class="sec-head wrap rv"><div><div class="kick"><span class="dot"></span>Families</div><h2>${n} families.<br><em>De voedselketen.</em></h2></div>
   <p>Van de jonge honden uit West tot de oudste familie van Europa. Hoe hoger, hoe zwaarder de deur. Tik op een familie voor haar verhaal. <a class="more-a" href="/families" data-link>Alle families ${ic('arrow')}</a></p></div>
  <div class="wrap rv"><div class="chain">${F.map((f,i)=>`<a class="ch" href="/families/${f.id}" data-link style="--fc:${f.col};--h:${(20+i/(n-1)*80).toFixed(1)}%;--i:${i}"><span class="ch-col"><span class="ch-top">${crest(f)}</span></span><b>${esc(f.n)}</b><small>${rk(f.r)}</small></a>`).join('')}</div></div></section>`}

function home(){return {title:'Onderwereld · Van rookie tot peetvader',cls:'pg-home',desc:'Begin als Rookie en werk je op tot Peetvader. '+CRIMES.length+' misdaden, '+FAMILIES.length+' families, een eigen casino en een echte ranglijst.',
 html:heroHtml()+careerHtml()+`<section class="blk cas-strip"><div class="sec-head wrap rv"><div><div class="kick"><span class="dot"></span>Casino</div><h2>Negen spellen.<br><em>Het huis wint.</em></h2></div>
   <p>Echte regels en doorgerekende kansen. Twee eigen slots, een vliegtuigje boven zee en de klassiekers aan tafel. <a class="more-a" href="/casino" data-link>Naar het casino ${ic('arrow')}</a></p></div>
  <div class="wrap"><div class="covers">${GAMES.map((g,i)=>coverCard(g,i)).join('')}</div></div></section>`+chainHtml()
  +(loggedIn?ctaHtml('Terug aan','het werk.','Je dashboard staat klaar met alles wat er is gebeurd terwijl je weg was.'):ctaHtml('De stad','wacht niet.','Terwijl jij twijfelt, klimt een rivaal een rang hoger.')),
 after(){initCity();initCareer();initTilt()}}}
route(/^\/$/,home);

/* ================= Misdaden: alle klussen, met een kaart van kans tegen buit ================= */
const kansIn=c=>Math.min(95,Math.max(5,c.base+c.r*2));   // kans op de rang waarop de klus opengaat, zonder spullen of training
const avgLoot=c=>(c.min+c.max)/2;
const fleeTxt=c=>{const f=typeof FLEE_LEVELS!=='undefined'&&FLEE_LEVELS[c.flee];return f?f.label:'—'};
const fleeWhere=c=>{const f=typeof FLEE_LEVELS!=='undefined'&&FLEE_LEVELS[c.flee];return f?f.where:''};
const CX_SORT=[['rang','Op rang'],['buit','Meeste buit'],['kans','Hoogste kans'],['xp','Meeste XP per energie'],['straf','Kortste straf']];
function crimesPage(){
 const maxL=Math.max(...CRIMES.map(c=>c.max)),maxJ=Math.max(...CRIMES.map(c=>c.jail)),heavy=CRIMES.filter(c=>c.r>=heavyR).length;
 return {title:'Misdaden · Onderwereld',cls:'pg-crimes',desc:'Alle '+CRIMES.length+' klussen van Onderwereld: buit, kans, energie en straf per rang.',
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
   <div class="w"><dt>Kans</dt><dd><b>${k}%</b><span class="cr-m"><i style="width:${k}%"></i></span></dd></div>
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
 return {title:'Casino · Onderwereld',cls:'pg-casino',desc:"Kluiskraker, Visdief, Mines, Hoogvlieger, Blackjack, Three Card Poker, Texas Hold'em, Roulette en Dubbel of niks.",
 html:pageHead({kick:'Casino',title:'Negen spellen.<br><em>Eén huis.</em>',lede:'Twee eigen slots, een vliegtuigje boven zee, een veld vol bommen en de klassiekers aan tafel. Echte regels, doorgerekende kansen. Het huis heeft een klein voordeel, net als in elk casino.',
   stats:[['Spellen',GAMES.length],['Eigen slots',2],['Hoogste win','10.000×'],['Uitkomst','vast bij je klik']]})
 +`<section class="wrap"><div class="covers big">${GAMES.map((g,i)=>coverCard(g,i,'p')).join('')}</div></section>
  <section class="wrap facts-blk rv"><div class="facts"><div><h3>Geen voorproefje</h3><p>De uitkomst ligt vast op het moment dat je klikt en staat in je opslag. Verversen of weggaan verandert niets, en het spel laat niets zien voordat de animatie klaar is.</p></div>
   <div><h3>Doorgerekend</h3><p>Elke slot is miljoenen keren gesimuleerd. De terugbetaling blijft onder de 100%, dus op lange termijn wint het huis. Dubbel of niks is de enige zonder huisvoordeel.</p></div>
   <div><h3>VIP en High roller</h3><p>Met een lidmaatschap kom je vaker in de bonus en krijg je cashback op elke inzet. Het basisspel betaalt dan net iets minder, zodat het eerlijk blijft.</p></div></div></section>`
 +moreHtml('casino')+ctaHtml('Fiches','klaar?','Je eerste inzet staat al op tafel.'),
 after(){initTilt()}}}
route(/^\/casino$/,casinoPage);

const GD={
 kluis:{stats:S=>[['Raster','10 × 10'],['Max win',nl(S?S.MAX_WIN:5000)+'×'],['RTP','±92,5%'],['Bonus kopen',(S?S.BUY_COST:100)+'×']],
  rules:S=>{const fs=(S&&S.FS_BY_SC)||{3:10,4:12,5:14},sup=(S&&S.SUPER_SC)||6,ss=(S&&S.SUPER_SPINS)||8,mx=(S&&S.MAX_SPOT)||4096,need=(S&&S.BAR&&S.BAR.need)||3;
   return [`Vijf of meer gelijke symbolen die horizontaal of verticaal aan elkaar grenzen, vormen een cluster en betalen uit.`,
   `De winnende symbolen ontploffen en er vallen nieuwe in. Zolang er winst valt, tumbelt het door.`,
   `Waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt daar weer een winst, dan wordt het x2, daarna x4, x8, tot x${nl(mx)}. De vakjes in een cluster tellen bij elkaar op.`,
   `De Loper telt mee voor elk symbool en kan twee groepjes aan elkaar knopen.`,
   `Drie kluizen geven ${fs[3]} free spins, vier ${fs[4]} en vijf ${fs[5]}. De vakjes uit die spin gaan mee de bonus in en waar een kluis ligt begint het vakje op x2. In de bonus blijven de vakjes de hele tijd staan. ${sup} kluizen of meer: de superbonus van ${ss} spins.`,
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
 th:{stats:()=>[['Call','2× je ante'],['Dealer speelt','vanaf paar vieren'],['Ante','tot 100 : 1'],['AA Bonus','tot 100 : 1']],
  rules:()=>[`Je zet een ante in. Jij en de dealer krijgen twee kaarten en de flop (drie kaarten) ligt open op tafel.`,
   `Speel je mee, dan zet je 2× je ante in als call. Anders pas je en ben je je ante kwijt.`,
   `Daarna komen de turn en de river. Jouw beste vijf uit zeven tegen die van de dealer. De dealer speelt vanaf een paar vieren.`,
   `Speelt de dealer niet, dan betaalt je ante volgens de tabel en krijg je je call terug. Wint de dealer, dan ben je beide kwijt.`],
  extra:()=>`<div class="pays">${payRows('Ante',[['Royal flush','100 : 1'],['Straight flush','20 : 1'],['Carré','10 : 1'],['Full house','3 : 1'],['Flush','2 : 1'],['Straat of lager','1 : 1']])}${payRows('AA Bonus',[['Royal flush','100 : 1'],['Straight flush','50 : 1'],['Carré','40 : 1'],['Full house','30 : 1'],['Flush','20 : 1'],['Straat, drie gelijke, twee paar, paar azen','7 : 1']])}</div>`},
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
 return {title:g.n+' · Casino · Onderwereld',cls:'pg-game',desc:g.n+': '+g.short,
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
 after(){initTilt();const my=renderId;if(D.src)need(D.src).then(()=>{if(my!==renderId)return;const API=g.id==='kluis'?window.SLOT:window.VISD;if(!API)return;
   const st=q('#gStats'),ru=q('#gRules');if(st)st.innerHTML=D.stats(API).map(s=>`<div><dt>${s[0]}</dt><dd>${s[1]}</dd></div>`).join('');if(ru)ru.innerHTML=rules(D.rules(API));demoReady(g.id)});
  demoInit(g.id)}}}
route(/^\/casino\/([a-z0-9-]+)$/,gamePage);

/* ---------- Demo's en tabellen per spel ---------- */
function demoHtml(id){
 if(id==='kluis')return `<div class="demo"><div class="demo-h"><b>Zo valt het</b><span>Een voorbeeld op een kleiner veld.</span></div><div class="minislot" id="minislot" aria-hidden="true"></div></div>
  <div class="demo"><div class="demo-h"><b>Uitbetaling per cluster</b><span>Basisspel, gewoon lidmaatschap. In de bonus blijven de vakjes staan.</span></div>
   <div class="seg-s" id="kkBet" role="group" aria-label="Inzet">${[10,100,1000].map((b,i)=>`<button data-b="${b}" class="${i?'':'on'}">${eur(b)} inzet</button>`).join('')}</div><div id="kkPay" class="pt-w"><p class="muted">Tabel laden…</p></div></div>`;
 if(id==='vis')return `<div class="demo"><div class="demo-h"><b>Lijnwinst</b><span>Per lijn, bij de gekozen inzet. Gewoon lidmaatschap.</span></div>
  <div class="seg-s" id="vdBet" role="group" aria-label="Inzet">${[10,100,1000].map((b,i)=>`<button data-b="${b}" class="${i?'':'on'}">${eur(b)} inzet</button>`).join('')}</div><div id="vdPay" class="pt-w"><p class="muted">Tabel laden…</p></div>
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
 return {title:'Families · Onderwereld',cls:'pg-fams',desc:'De '+FAMILIES.length+' families van Onderwereld: wie ze zijn, wie ze binnenlaten en hoe je bij ze opklimt.',
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
    <em class="${d>0?'up':d<0?'dn':''}" title="${d?'Vorige ronde plek '+r.prev:'Gelijk gebleven'}">${d>0?'▲ '+d:d<0?'▼ '+(-d):'–'}</em></a></li>`}).join('');box.hidden=false;reveal(box.parentNode)})}}}
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
 return {title:f.n+' · Families · Onderwereld',cls:'pg-fam',desc:f.n+': '+f.d,
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
 return {title:'Rangen · Onderwereld',cls:'pg-ranks',desc:'De '+RANKS.length+' rangen van Onderwereld, van Rookie tot Peetvader, en wat elke rang opent.',
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
 return {title:'Training · Onderwereld',cls:'pg-train',desc:'Negen plekken om te trainen en negen manieren om bij te komen in Onderwereld.',
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

/* ================= Account: kop, menu, inloggen en account aanmaken ================= */
function buildMnav(){q('#mnavLinks').innerHTML=`<a href="/" data-link data-nav=""><b>Voorpagina</b><span>Van rookie tot peetvader</span></a>`
 +PAGES.map(p=>`<a href="/${p[0]}" data-link data-nav="${p[0]}"><b>${p[1]}</b><span>${p[2]()}</span></a>`).join('')}
function updateAuthUI(){const n=esc(userName);
 q('#topAuth').innerHTML=loggedIn?`<span class="whoami">${n?'Ingelogd als <b>'+n+'</b>':'Ingelogd'}</span><button class="tlink" type="button" data-logout>Uitloggen</button><a class="btn sm" href="/game.html"><span class="lg">Mijn dashboard</span><span class="sm-t">Dashboard</span></a>`
  :'<button class="tlink" type="button" data-auth="login">Inloggen</button><button class="btn sm" type="button" data-auth="register"><span class="lg">Account aanmaken</span><span class="sm-t">Spelen</span></button>';
 q('#mnavAuth').innerHTML=loggedIn?`<a class="btn xl" href="/game.html">Naar mijn dashboard</a><button class="btn ghost xl" type="button" data-logout>Uitloggen${n?' ('+n+')':''}</button>`
  :'<button class="btn xl" type="button" data-auth="register">Account aanmaken</button><button class="btn ghost xl" type="button" data-auth="login">Inloggen</button>'}
document.addEventListener('click',e=>{if(!e.target.closest('[data-logout]'))return;setToken(null);try{localStorage.removeItem('ow_lpname')}catch(x){}
 loggedIn=false;userName='';menu(false);updateAuthUI();render(curPath||'/',{keep:true})});
function initSession(){const t=getToken();
 if(t){loggedIn=true;try{userName=localStorage.getItem('ow_lpname')||''}catch(e){}}
 updateAuthUI();render(cleanPath(location.pathname),{first:true});
 if(!t)return Promise.resolve();
 return fetch('/api/me',{headers:{Authorization:'Bearer '+t}}).then(r=>{
  if(r.ok)return r.json().then(j=>{const nm=String(j.username||'');const was=userName;userName=nm;loggedIn=true;try{localStorage.setItem('ow_lpname',nm)}catch(e){}
   updateAuthUI();if(was!==nm){const k=q('#kick');if(k&&app.classList.contains('pg-home'))k.innerHTML='<span class="dot"></span>Welkom terug'+(nm?', '+esc(nm):'')}});
  if(r.status===401)setToken(null);
  loggedIn=false;userName='';updateAuthUI();render(curPath,{keep:true})}).catch(()=>{})}

let mode='login';const auth=q('#auth'),form=q('#authForm'),err=q('#authErr');
q('#plNo').textContent='Nr. '+String(R(100000,999999));
{const d=new Date();q('#plDate').textContent=String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear()}
(function height(){let h='';for(let cm=220,i=0;cm>=120;cm-=5,i++){const maj=cm%25===0;h+=`<div class="${maj?'maj':''}" style="top:${i*(100/20)}%"><span>${maj?cm:''}</span><span>${maj?cm:''}</span></div>`}q('#height').innerHTML=h})();
function setMode(m){mode=m;const reg=m==='register';
 q('#tabLogin').classList.toggle('on',!reg);q('#tabReg').classList.toggle('on',reg);q('#tabLogin').setAttribute('aria-selected',!reg);q('#tabReg').setAttribute('aria-selected',reg);
 q('#authTitle').textContent=reg?'Nieuw dossier':'Welkom terug';
 q('#authHint').textContent=reg?'Kies een naam die de straat zal onthouden. Een e-mailadres is niet nodig.':'Log in en ga verder waar je gebleven was.';
 q('#authSubmit').textContent=reg?'Account aanmaken':'Inloggen';q('#pass2wrap').hidden=!reg;q('#meter').hidden=!reg;q('#userHint').hidden=!reg;
 q('#authPass').autocomplete=reg?'new-password':'current-password';q('#plStatus').textContent=reg?'Nieuw dossier':'Bekende';q('#plRank').textContent=reg?'Rookie':'?';
 q('#authSwap').innerHTML=reg?'Al een account? <button type="button" data-mode="login">Log in</button>':'Nog geen account? <button type="button" data-mode="register">Maak er een aan</button>';
 err.hidden=true;validate()}
function openAuth(m){menu(false);setMode(m);auth.hidden=false;document.body.style.overflow='hidden';if(matchMedia('(min-width:761px)').matches)setTimeout(()=>q('#authUser').focus(),60);auth.scrollTop=0}
function closeAuth(){auth.hidden=true;document.body.style.overflow=''}
document.addEventListener('click',e=>{const a=e.target.closest('[data-auth]');if(a){e.preventDefault();openAuth(a.dataset.auth);return}
 const m=e.target.closest('[data-mode]');if(m&&auth.contains(m))setMode(m.dataset.mode)});
q('#authClose').onclick=closeAuth;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!auth.hidden)closeAuth()});
q('#peek').onclick=()=>{const p=q('#authPass'),show=p.type==='password';p.type=show?'text':'password';q('#authPass2').type=p.type;q('#peek').textContent=show?'Verberg':'Toon'};
const okName=v=>/^[a-zA-Z0-9_]{3,20}$/.test(v);
function validate(){const u=q('#authUser').value.trim(),p=q('#authPass').value,p2=q('#authPass2').value,reg=mode==='register';
 const pl=q('#plName');pl.textContent=u?u.toUpperCase():'ONBEKEND';pl.classList.toggle('typing',document.activeElement===q('#authUser'));const uh=q('#userHint');
 if(reg){
  if(!u){uh.textContent='3 tot 20 tekens: letters, cijfers of _';uh.className='fhint';q('#authUser').className=''}
  else if(okName(u)){uh.textContent='Goede naam.';uh.className='fhint good';q('#authUser').className='good'}
  else{uh.textContent=u.length<3?'Nog '+(3-u.length)+' teken'+(3-u.length>1?'s':'')+' te gaan.':u.length>20?'Maximaal 20 tekens.':'Alleen letters, cijfers en _ zijn toegestaan.';uh.className='fhint bad';q('#authUser').className='bad'}
  let s=0;if(p.length>=6)s++;if(p.length>=10)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p)&&/[^A-Za-z0-9]/.test(p))s++;if(p.length&&p.length<6)s=0;
  const cols=['var(--red)','var(--red)','var(--acc)','var(--acc2)','var(--green)'];
  qa('#meter i').forEach((i,k)=>{i.style.background=p&&k<Math.max(1,s)?cols[s]:'var(--line2)'});
  q('#meterTxt').textContent=!p?'':p.length<6?'Te kort':['Te kort','Zwak','Redelijk','Sterk','IJzersterk'][s];
  const mh=q('#matchHint');
  if(!p2){mh.textContent='';mh.className='fhint';q('#authPass2').className=''}
  else if(p2===p){mh.textContent='Wachtwoorden komen overeen.';mh.className='fhint good';q('#authPass2').className='good'}
  else{mh.textContent='Nog niet gelijk.';mh.className='fhint bad';q('#authPass2').className='bad'}
 }else{q('#authUser').className='';q('#authPass2').className=''}}
['#authUser','#authPass','#authPass2'].forEach(s=>{q(s).addEventListener('input',validate);q(s).addEventListener('focus',validate);q(s).addEventListener('blur',validate)});
form.addEventListener('submit',async e=>{e.preventDefault();err.hidden=true;
 const username=q('#authUser').value.trim(),password=q('#authPass').value;
 const fail=m=>{err.textContent=m;err.hidden=false;const ai=q('.auth-inner');ai.classList.remove('shake');void ai.offsetWidth;ai.classList.add('shake')};
 if(!okName(username))return fail('Je gebruikersnaam moet 3 tot 20 tekens zijn: letters, cijfers of _.');
 if(password.length<6)return fail('Je wachtwoord moet minstens 6 tekens zijn.');
 if(mode==='register'&&password!==q('#authPass2').value)return fail('De twee wachtwoorden zijn niet gelijk.');
 const btn=q('#authSubmit'),label=btn.textContent;btn.disabled=true;btn.textContent=mode==='register'?'Dossier aanmaken…':'Controleren…';
 try{const r=await fetch('/api/'+(mode==='register'?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
  let j={};try{j=await r.json()}catch(x){}
  if(!r.ok){const er=new Error(j.error||'Er ging iets mis. Probeer het opnieuw.');er.banned=j.code==='banned';throw er}
  setToken(j.token);try{localStorage.setItem('ow_lpname',String(j.username||username))}catch(x){}
  q('.placard').classList.add('ok');q('#plStatus').textContent='Toegang';q('#plName').textContent=String(j.username||username).toUpperCase();
  btn.textContent=mode==='register'?'Welkom in de onderwereld':'Welkom terug';setTimeout(()=>location.href='/game.html',700)}
 catch(x){if(x.banned){setMode('register');q('#authUser').value='';q('#authPass').value=''}
  fail(x.message==='Failed to fetch'?'De server is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.':x.message);btn.disabled=false;btn.textContent=label}});

/* ================= Start ================= */
buildMnav();setMode('login');
initSession().then(()=>{const s=location.search;
 if(/[?&]register=1/.test(s)&&!loggedIn){openAuth('register');if(/[?&]banned=1/.test(s)){err.textContent='Je vorige profiel is verbannen. Maak hier een nieuw profiel aan en begin opnieuw.';err.hidden=false}}
 else if(/[?&]login=1/.test(s)&&!loggedIn)openAuth('login')});
})();
