// Navigatie, iconen en de statusbalk bovenaan
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICONS={
 profiel:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
 verblijf:'<path d="M3 18V8M3 14h18v4M21 18v-4a3 3 0 00-3-3h-7v3"/><circle cx="7" cy="11" r="1.8"/>',
 gym:'<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 013 0V11M11 10V4.5a1.5 1.5 0 013 0V11M14 10.5V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6.5 7S5 17.5 4 15l-1.5-3.5a1.5 1.5 0 012.6-1.4L8 13"/>',
 run:'<circle cx="14" cy="4" r="2"/><path d="M6 21l3-6 3 2 2 5M9 15l1-5 4 1 3 3M10 10l-4 1"/>',
 wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 11.2L3.5 10M14.4 11.2l6.1-1.2"/>',
 mask:'<path d="M4 5h16v6a8 8 0 01-16 0z"/><path d="M8.5 10h1M14.5 10h1M9 15c1.8 1.3 4.2 1.3 6 0"/>',
 glass:'<path d="M5 4h14l-7 8zM12 12v7M8 20h8"/>',
 knife:'<path d="M3.5 20.5l6.5-6.5M10 14L19.4 4.6a2.1 2.1 0 013 3L13 17z"/><path d="M7.5 11.5l5 5"/>',
 gun:'<path d="M3 7.5h17.5v4.5h-6.5l-1.2 2.4H10L9 19H5l1.2-7H3z"/><path d="M10.5 12v2.4"/>',
 rifle:'<path d="M2 11.5h14l1.8-2h4.2v3.2h-3l-1.8 2H9.5L7.4 19H4.2l1.6-4.3H2z"/><path d="M8 11.5V9h5v2.5"/>',
 vest:'<path d="M8 3l4 2.5L16 3l4 3v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6z"/><path d="M12 5.5V21M8 13h8"/>',
 helmet:'<path d="M3.5 15.5a8.5 8.5 0 0117 0v1.5h-17z"/><path d="M12 7v5M2.5 17h19v2.5h-19z"/>',
 tool:'<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
 laptop:'<rect x="4" y="4.5" width="16" height="11" rx="1"/><path d="M2 19h20M9.5 8L7.5 10l2 2M14.5 8l2 2-2 2"/>',
 torch:'<path d="M12 21.5c3.9 0 6.8-2.9 6.8-6.8 0-3.8-2.9-5.9-3.9-9.7-1.9 1.9-2.9 3.9-2.9 5.8-1-1-1.9-2-1.9-3.9-2 2-4.9 4.8-4.9 7.8 0 3.9 2.9 6.8 6.8 6.8z"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
 radio:'<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M7 9l10-6M7 15h5M16.5 15h.01"/>',
 ear:'<path d="M6.5 9a5.5 5.5 0 1111 0c0 2.8-1.9 3.8-2.8 5.2-.9 1.5-.9 4.6-3.7 6-2.3 1.1-4-.3-4-2.2"/><path d="M10 9a2 2 0 114 0c0 1.5-2 2-2 3.2"/>',
 target:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/>',
 chip:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
 brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18M11 12v2.5h2V12"/>',
 scale:'<path d="M12 3v17M7 21h10M4 7h16M6.5 7L3 14a3.5 3.5 0 007 0zM17.5 7L14 14a3.5 3.5 0 007 0z"/>',
 snack:'<path d="M5.5 10h13l-1.6 11H7.1zM8 10L6.8 3.5M11 10V3M14 10l1-6.5M17 10l2.2-5.5"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.2 8.2L20 20M8.2 15.8L20 4"/>',
 spa:'<path d="M12 21c-4.5 0-8.5-3.2-8.5-8.5 3.4 0 6.6 1.7 8.5 4.4 1.9-2.7 5.1-4.4 8.5-4.4 0 5.3-4 8.5-8.5 8.5z"/><path d="M12 17c-1.7-2.2-2.3-4.6-2.3-7.4C10.9 8.5 11.6 7.7 12 7c.4.7 1.1 1.5 2.3 2.6 0 2.8-.6 5.2-2.3 7.4z"/>',
 yacht:'<path d="M2.5 16.5h19L18.8 21H5.2zM12 2.5v12M12 3.5l7 11h-7M10 6.5L4.5 14.5H10"/>',
 plane:'<path d="M21.5 2.5L2.5 10l7.5 3 3 8z"/><path d="M10 13l11.5-10.5"/>',
 steam:'<path d="M4 20h16M7 16c0-2 2-2 2-4s-2-2-2-4M12 16c0-2 2-2 2-4s-2-2-2-4M17 16c0-2 2-2 2-4s-2-2-2-4"/>',
 cup:'<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 11h2a2 2 0 010 4h-2M8 3v3M12 3v3"/>',
 house:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
 logout:'<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
 hits:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5"/><path d="M12 1v5M12 18v5M1 12h5M18 12h5"/>',
 beheer:'<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
 dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
 crimes:'<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>',
 cars:'<path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/>',
 casino:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
 biz:'<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>',
 shop:'<path d="M4 7h16l-1.5 12h-13zM9 7V5a3 3 0 016 0v2"/>',
 bank:'<path d="M3 10h18L12 4zM5 10v8M10 10v8M14 10v8M19 10v8M3 20h18"/>',
 jail:'<path d="M5 3v18M10 3v18M15 3v18M20 3v18M3 3h19M3 21h19"/>',
 skills:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 fam:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5"/>',
 rank:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 6h3v2a3 3 0 01-3 3M7 6H4v2a3 3 0 003 3"/>',
 wit:'<rect x="4" y="2.5" width="16" height="19" rx="2"/><circle cx="12" cy="13.5" r="4.8"/><path d="M9.5 14.5c1.2-1.4 2.6 1.2 5 0M7 6h2.5M14.5 6h2.5"/>',
 moto:'<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5L9 10h4.5l2 4h-6.5M13 10l1.5-3.5H17M15.5 14l3 2.5"/>',
 heli:'<path d="M3 4.5h18M12 4.5v3.5"/><path d="M5.5 12.5c0 2.2 2.9 3.5 6.5 3.5s6.5-1.3 6.5-3.5V11a3 3 0 00-3-3h-7a3 3 0 00-3 3z"/><path d="M18.5 11.5h3M9 16l-1 3.5M15 16l1 3.5M6 19.5h12"/>',
 look:'<path d="M9 3.5L12 6l3-2.5 5.5 3.2-2.3 4.3-2.2-1V21H8V10l-2.2 1-2.3-4.3z"/><path d="M12 6v4"/>'};
const PAGES=[['dash','Dashboard'],['verblijf','Verblijf'],['crimes','Misdaden'],['hits','Huurmoorden'],['cars','Auto\'s'],['casino','Casino'],['biz','Bezit'],['shop','Wapens'],['look','Outfit'],['skills','Training'],['bank','Bank'],['wit','Witwassen'],['fam','Families'],['jail','Bajes'],['rank','Ranglijst'],['profiel','Profiel']];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
let page=(location.hash||'#dash').slice(1);if(!PAGES.find(p=>p[0]===page))page='dash';
let casinoTab='',rankTab='xp',slotState=['7','7','7'],spinning=false;

// Elke sectie heeft een eigen kleur, zodat je ziet waar je bent
const NAV_GROUPS=[['Straat',['dash','verblijf','crimes','hits','cars'],'#ff7a1a','255,122,26'],['Geld',['casino','biz','bank','wit'],'#3fe395','63,227,149'],['Macht',['shop','look','skills','fam'],'#b8a1ff','184,161,255'],['Overig',['jail','rank','profiel'],'#a9dcff','169,220,255']];
const groupOf=k=>NAV_GROUPS.find(g=>g[1].includes(k))||NAV_GROUPS[0];
function applySection(){document.body.classList.toggle('wide-page',page==='casino');const g=groupOf(page),r=document.documentElement.style;r.setProperty('--sec',g[2]);r.setProperty('--sec-rgb',g[3])}
function crumbHtml(){const g=groupOf(page);return `<div class="crumb"><i></i><span>${g[0]}</span>/ ${PAGES.find(p=>p[0]===page)[1]}</div>`+(typeof feudBar==='function'?feudBar():'')}
function renderNav(){
  const name=k=>PAGES.find(p=>p[0]===k)[1];
  const st=navStat(),link=k=>`<a class="navlink ${k===page?'on':''}" href="#${k}">${svg(k)}<span>${name(k)}</span>${st[k]?`<em class="nst">${st[k]}</em>`:''}${k==='jail'&&inJail()?'<span class="badge">!</span>':''}${k==='crimes'&&!inJail()&&S.energy>=EN_MAX?'<span class="badge ok">●</span>':''}${k==='profiel'&&typeof RANK_CODES!=='undefined'&&RANKS.slice(1,rankIdx(S.xp)+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase()))?'<span class="badge">€</span>':''}</a>`;
  setHTML($('#nav'),`<a class="brand" href="/" style="text-decoration:none;color:inherit"><span class="mark">O</span><span><b>Onderwereld</b><small>${window.__USER__?esc(window.__USER__):'Offline modus'} ${vipTag(1)}</small></span></a>`
   +NAV_GROUPS.map(([g,ks,col,rgb])=>`<div class="navgroup" style="--g:${col};--g-rgb:${rgb}"><div class="navlabel">${g}</div>${ks.map(link).join('')}</div>`).join('')
   +(window.__TOKEN__?`<div class="navspace"></div>${window.__ADMIN__?`<a class="navlink beheer" href="/admin">${svg('beheer')}<span>Beheer</span></a>`:''}<button class="navlink logout" onclick="logout()">${svg('logout')}<span>Uitloggen</span></button>`:''));
  renderMbar();
}
// Alleen bijwerken als de inhoud echt veranderd is; scrollpositie binnen het element blijft staan.
// (Elke seconde alles opnieuw tekenen zette op de telefoon het menu en de statusbalk steeds terug naar het begin.)
function setHTML(el,h){if(!el||el._h===h)return false;const sl=el.scrollLeft,st=el.scrollTop;el.innerHTML=h;el._h=h;if(sl)el.scrollLeft=sl;if(st)el.scrollTop=st;return true}
// Is de speler net aan het scrollen of aanraken? Dan wachten we even met hertekenen.
let _touching=false,_lastScroll=0;
document.addEventListener('touchstart',()=>{_touching=true},{passive:true,capture:true});
document.addEventListener('touchend',()=>{_touching=false;_lastScroll=performance.now()},{passive:true,capture:true});
document.addEventListener('touchcancel',()=>{_touching=false},{passive:true,capture:true});
window.addEventListener('scroll',()=>{_lastScroll=performance.now()},{passive:true,capture:true});
// muisknop ingedrukt: niet hertekenen, anders valt de klik weg als de knop net vervangen wordt
let _mouse=false;document.addEventListener('mousedown',()=>{_mouse=true},true);document.addEventListener('mouseup',()=>{setTimeout(()=>{_mouse=false},0)},true);
const userBusy=()=>_touching||_mouse||performance.now()-_lastScroll<700;
// Telefoon: onderbalk met de vier meest gebruikte pagina's + "Meer" (alle pagina's per groep, met wat er speelt)
const MBAR=['dash','crimes','cars','casino'];
const MSHORT={dash:'Start',crimes:'Misdaden',cars:"Auto's",casino:'Casino'};
// Klein getal rechts in het menu (computer): waar je staat, wat er loopt
function navStat(){const o={};try{const [p]=myPos();o.rank='#'+p;if(inJail())o.jail=fmtClock(S.jailUntil-now());const h=cdLeft('hit');if(h&&rankIdx(S.xp)>=7)o.hits=fmtClock(h);
 if(typeof garageCap==='function')o.cars=S.cars.length+'/'+garageCap();if(S.family)o.fam=fam().m}catch(e){}return o}
function navBadges(){const b={};if(inJail())b.jail='!';if(!inJail()&&S.energy>=EN_MAX)b.crimes='●';
 if(typeof RANK_CODES!=='undefined'&&RANKS.slice(1,rankIdx(S.xp)+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase())))b.profiel='€';
 if(typeof isVip==='function'&&isVip()&&typeof cbAvail==='function'&&cbAvail()>=1)b.casino='€';return b}
function navHint(k){const jt=Math.ceil((S.jailUntil-now())/1000);
 return {dash:'Overzicht',verblijf:S.hide?'Ondergedoken':'Gezondheid '+S.hp+'%',crimes:Math.floor(S.energy)+' energie',hits:rankIdx(S.xp)<7?'Vanaf '+RANKS[7][0]:cdLeft('hit')?'Over '+fmtClock(cdLeft('hit')):((S.stats&&S.stats.hits)||0)+' gedaan',cars:S.cars.length+(S.cars.length===1?' auto':" auto's"),
  casino:'9 spellen',biz:typeof income==='function'?fmt(income())+'/dag':'Bedrijven',bank:fmt(typeof bankNet==='function'?bankNet():S.bank),shop:'Wapens',skills:'Trainen & ontspannen',
  fam:S.family?fam().n:'Geen familie',jail:inJail()?'Vast, '+fmtTime(jt):'Vrij',rank:'Spelers',profiel:'Codes en account',look:'Kleding en sieraden',wit:typeof zwart==='function'&&zwart()>=1?fmt(zwart())+' zwart':'Zwart geld wit maken'}[k]||''}
function renderMbar(){let bar=$('#mbar');if(!bar){bar=document.createElement('nav');bar.id='mbar';bar.className='mbar';bar.setAttribute('aria-label','Menu');document.body.appendChild(bar)}
 let sh=$('#msheet');if(!sh){sh=document.createElement('div');sh.id='msheet';sh.className='msheet';sh.setAttribute('aria-hidden','true');document.body.appendChild(sh);
  sh.addEventListener('click',e=>{const c=e.target.closest('[data-cas]');
   // zoekresultaat voor een casinospel: meteen het goede spel openen
   if(c){const k=c.dataset.cas;if(page==='casino'&&typeof casinoGo==='function')casinoGo(k);else if(typeof casinoTab!=='undefined'){casinoTab=k;window._casPick=1}}
   if(e.target===sh||e.target.closest('[data-close]'))mSheet(false)})}
 const bd=navBadges(),name=k=>PAGES.find(p=>p[0]===k)[1],inMain=MBAR.includes(page),more=Object.keys(bd).some(k=>!MBAR.includes(k));
 setHTML(bar,MBAR.map(k=>`<a class="mb ${k===page?'on':''}" href="#${k}" style="--g:${groupOf(k)[2]}">${svg(k)}<span>${MSHORT[k]}</span>${bd[k]?`<em class="${bd[k]==='●'?'ok':''}">${bd[k]}</em>`:''}</a>`).join('')
  // de vijfde knop blijft altijd "Meer": zo raak je het menu nooit kwijt, ook niet op een pagina als Verblijf
  +`<button class="mb more ${inMain?'':'on'}" onclick="mSheet(true)" aria-haspopup="dialog" aria-label="Meer: alle pagina's en zoeken" style="--g:${inMain?'#8a8f98':groupOf(page)[2]}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span>Meer</span>${more?'<em>•</em>':''}</button>`);
 msTrack();
 const ri=rankIdx(S.xp);
 // het open menu niet hertekenen terwijl je erin scrollt of zoekt; bij openen wordt het vernieuwd
 if(sh.classList.contains('open')&&!sh._fresh)return;sh._fresh=false;
 const tile=k=>`<a class="ms-tile ${k===page?'on':''}" href="#${k}" data-close data-k="${msKey(name(k)+' '+navHint(k)+' '+(MS_PAGE_K[k]||''))}">${svg(k)}<b>${name(k)}</b><small>${k===page?'Je bent hier':navHint(k)}</small>${bd[k]?`<em class="${bd[k]==='●'?'ok':''}">${bd[k]==='●'?'vol':bd[k]}</em>`:''}</a>`;
 const rec=msRecent().filter(k=>k!==page&&PAGES.some(p=>p[0]===k)).slice(0,4);
 setHTML(sh,`<div class="ms-panel" role="dialog" aria-label="Alle pagina's"><div class="ms-grab"></div>
  <div class="ms-head"><div><b>${esc(S.name)}${vipTag()}</b><span class="ms-money">${RANKS[ri][0]} · <em class="w">${fmt(witNu())} wit</em>${zwart()>=1?` · <em class="z">${fmt(zwart())} zwart</em>`:''}</span></div><button class="ms-x" data-close aria-label="Sluiten">✕</button></div>
  <label class="ms-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
   <input type="search" id="msQ" placeholder="Zoek: kliniek, trainen, roulette…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-label="Zoek in het menu" oninput="msFilter(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();msFirst()}">
   <button type="button" class="ms-clear" aria-label="Zoekveld leegmaken" onclick="const i=$('#msQ');i.value='';msFilter('');i.focus()">✕</button></label>
  ${rec.length?`<div class="ms-recent"><span>Laatst</span>${rec.map(k=>`<a href="#${k}" data-close style="--g:${groupOf(k)[2]}">${svg(k)}${name(k)}</a>`).join('')}</div>`:''}
  <div class="ms-opts" hidden><h3>Gevonden</h3>${MS_FIND.map(([t,s,h,kw])=>{const [pg,cas]=h.split(':');return `<a class="ms-opt" hidden href="#${pg}" data-close ${cas?`data-cas="${cas}"`:''} data-k="${msKey(t+' '+s+' '+kw)}" style="--g:${groupOf(pg==='trainen'||pg==='ontspannen'?'skills':pg)[2]}">${svg(pg==='trainen'||pg==='ontspannen'?'skills':pg)}<div><b>${t}</b><small>${s}</small></div><em>›</em></a>`}).join('')}</div>
  <p class="ms-none" hidden>Niets gevonden voor “<b></b>”. Probeer een ander woord, zoals geld, auto of energie.</p>
  ${NAV_GROUPS.map(([g,ks,col])=>`<div class="ms-group" style="--g:${col}"><h3>${g}</h3><div class="ms-grid">${ks.map(tile).join('')}</div></div>`).join('')}
  ${window.__ADMIN__?`<a class="btn ghost ms-out ms-admin" href="/admin">${svg('beheer')} Beheerdashboard</a>`:''}${window.__TOKEN__?`<button class="btn ghost ms-out" onclick="logout()">Uitloggen</button>`:''}</div>`)}
// Zoeken in het menu: pagina's én wat je erop kunt doen (kliniek, roulette, codes...)
const MS_PAGE_K={dash:'start overzicht home',verblijf:'woning huis rusten dokter kliniek onderduiken slapen',crimes:'klussen misdaad roven energie',hits:'huurmoord moord doelwit gezocht',
 cars:'auto garage stelen heler',casino:'gokken spellen slot',biz:'zaken bedrijven inkomen vestiging geld verdienen',bank:'sparen rente beleggen deposito geld storten opnemen wit',wit:'zwart geld witwassen',
 shop:'wapens vervoer kopen',look:'kleding outfit sieraden dobbelsteen',skills:'trainen ontspannen energie',fam:'familie maffia oorlog missies',jail:'bajes cel gevangenis borg',
 rank:'ranglijst spelers top',profiel:'account codes privacy'};
const MS_FIND=[
 ['Kliniek','Meteen weer 100% gezondheid','verblijf','dokter genezen gezondheid ziekenhuis gewond'],
 ['Rusten en slapen','Gezondheid en energie terug','verblijf','rust slapen bed energie'],
 ['Onderduiken','Hitte laten zakken','verblijf','hitte politie verstoppen ondergedoken'],
 ['Woning inrichten of verhuizen','Meubels, extra plek, betere woning','verblijf','huis meubels inrichting verhuizen appartement villa'],
 ['Omkopen','Hitte meteen naar 0%','dash','hitte politie omkopen smeergeld'],
 ['Trainen','Blijvend beter worden','trainen','skills training conditie snelheid kracht sportschool'],
 ['Ontspannen','Energie en gezondheid bijvullen','ontspannen','relax energie sauna massage spa'],
 ['Kluiskraker','Gokkast','casino:kluis','slot gokkast kluis loper bonus'],
 ['Visdief','Gokkast','casino:vis','slot gokkast vis vissen'],
 ['Roulette','Tafelspel','casino:roulette','rood zwart tafel'],
 ['Blackjack','Kaartspel','casino:bj','21 kaarten eenentwintig'],
 ['Three Card Poker','Kaartspel','casino:tcp','poker kaarten'],
 ['Texas Hold\'em','Poker tegen de dealer','casino:th','poker holdem hold em texas flop turn river kaarten'],
 ['Mines','Mijnenveld','casino:mines','mijnen bom'],
 ['Hoogvlieger','Uitbetalen voor hij neerstort','casino:avia','vliegtuig crash'],
 ['Dubbel of niks','Munt opgooien','casino:coin','munt kop munt'],
 ['VIP-cashback','Claim je cashback in het casino','casino','vip cashback terug high roller'],
 ['Sparen en beleggen','Rente, deposito en beleggingen','bank','rente spaar deposito beleggen investeren storten opnemen geld wit bank'],
 ['Zwart geld wit maken','Via je zaak, Ome Kees of het casino','wit','ome kees zwart kassa witwassen'],
 ['Zaken kopen en upgraden','Meer inkomen per dag','biz','zaak bedrijf vestiging inkomen upgrade kopen'],
 ['Garage en heler','Auto’s verkopen en bestellingen','cars','garage heler verkopen bestelling stelen'],
 ['Kleding en sieraden','Outfit met voordelen','look','kleren ketting ring horloge schoenen pet zonnebril'],
 ['Geluksdobbelsteen','Tien minuten extra geluk op de gokkasten','look','geluk dobbelsteen luck'],
 ['Vervoer om te vluchten','Scooter tot helikopter','shop','scooter helikopter boot vluchten motor'],
 ['Bendeoorlog','Strijd om de stad','fam','oorlog gang war gebied'],
 ['Familiemissies','Dagelijks voor je familie','fam','missie opdracht baas onderbaas'],
 ['Werken in de cel','Geld verdienen en eerder vrij','jail','borg ontsnappen werk cel gevangenis'],
 ['Codes inwisselen','Bonusgeld','profiel','code bonus inwisselen'],
 ['Rangbeloning claimen','Per nieuwe rang','profiel','rang beloning'],
 ['Profiel openbaar of privé','Wie je profiel kan zien','profiel','privacy prive openbaar'],
 ['Spelers bekijken','Top en profielen','rank','top spelers profiel']];
const msKey=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/<[^>]*>/g,' ').replace(/"/g,'');
function msFilter(q){const sh=$('#msheet');if(!sh)return;const w=msKey(q).trim().split(/\s+/).filter(Boolean),on=w.length>0,hit=el=>w.every(x=>(el.dataset.k||'').includes(x));let any=0;
 sh.classList.toggle('ms-q',on);
 sh.querySelectorAll('.ms-tile').forEach(t=>{const h=!on||hit(t);t.hidden=!h;if(on&&h)any++});
 sh.querySelectorAll('.ms-group').forEach(g=>{g.hidden=on&&!g.querySelector('.ms-tile:not([hidden])')});
 sh.querySelectorAll('.ms-opt').forEach(o=>{const h=on&&hit(o);o.hidden=!h;if(h)any++});
 const os=sh.querySelector('.ms-opts');if(os)os.hidden=!on||!os.querySelector('.ms-opt:not([hidden])');
 const no=sh.querySelector('.ms-none');if(no){no.hidden=!on||any>0;no.querySelector('b').textContent=q.trim()}
 const rc=sh.querySelector('.ms-recent');if(rc)rc.hidden=on}
function msFirst(){const sh=$('#msheet'),a=sh&&sh.querySelector('.ms-opt:not([hidden]),.ms-group:not([hidden]) .ms-tile:not([hidden])');if(a)a.click()}
// Laatst bezochte pagina's (alleen in deze browser, als snelle knoppen bovenin het menu)
let _msLast=null;
function msRecent(){try{return JSON.parse(localStorage.getItem('ow_recent')||'[]')}catch(e){return []}}
function msTrack(){if(_msLast===page)return;_msLast=page;if(page==='dash')return;try{const r=msRecent().filter(k=>k!==page);r.unshift(page);localStorage.setItem('ow_recent',JSON.stringify(r.slice(0,6)))}catch(e){}}
function mSheet(open){const sh=$('#msheet');if(!sh)return;if(open&&!sh.classList.contains('open')){sh._fresh=true;renderMbar();const p=sh.querySelector('.ms-panel');if(p)p.scrollTop=0}sh.classList.toggle('open',open);sh.setAttribute('aria-hidden',open?'false':'true');document.body.classList.toggle('ms-lock',open);
 if(!open){const i=sh.querySelector('#msQ');if(i&&i.value){i.value='';msFilter('')}if(document.activeElement&&sh.contains(document.activeElement))document.activeElement.blur()}
 if(open){if(typeof SFX!=='undefined')SFX.click();setTimeout(()=>{const t=sh.querySelector('.ms-tile.on')||sh.querySelector('.ms-x');t&&t.focus({preventScroll:true})},60)}}
window.addEventListener('hashchange',()=>mSheet(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('ms-lock'))mSheet(false)});
// Rechter zijbalk op brede schermen: dossier, snelle klus, logboek, top 5
function bestCrime(){const ri=rankIdx(S.xp);return CRIMES.filter(c=>c.r<=ri).map(c=>({c,ev:chance(c)/100*(c.min+c.max)/2/c.en})).sort((a,b)=>b.ev-a.ev)[0].c}
// Wat staat er klaar? Voor het dashboard en de zijbalk. h = pagina of snelkoppeling (#trainen, #ontspannen)
function todoItems(){const o=[],ri=rankIdx(S.xp);
 if(inJail())o.push({ic:'jail',t:'Je zit vast',s:'Borg betalen of ontsnappen',h:'jail',c:'var(--red)'});
 if(S.pendingArrest)o.push({ic:'jail',t:'Je wordt aangehouden',s:'Kies wat je doet',h:'dash',c:'var(--red)'});
 if(!inJail()&&S.energy>=EN_MAX)o.push({ic:'crimes',t:'Energie vol',s:'Doe een klus',h:'crimes',c:'var(--acc)'});
 const tr=TRAININGS.filter(t=>ri>=(t.r||0)&&(S.skills[t.id]||0)<TRAIN_MAX&&!cdLeft('tr_'+t.id)&&S.cash>=trainCost(t,S.skills[t.id]||0)).length;
 if(tr&&!inJail())o.push({ic:'skills',t:tr+' training'+(tr>1?'en':'')+' klaar',s:'Blijvend beter worden',h:'trainen',c:'#b8a1ff'});
 if(!inJail()&&(S.energy<EN_MAX*.4||S.hp<60)){const lv=rankLevel(S.xp),rx=RELAX.filter(r=>ri>=(r.r||0)&&!cdLeft('rx_'+r.id)&&S.cash>=relaxCost(r,ri,lv)&&(r.energy||r.hp));
  if(rx.length)o.push({ic:'spa',t:S.hp<60?'Gezondheid laag':'Energie bijvullen',s:'Ontspannen · '+rx.length+' klaar',h:'ontspannen',c:'#5ce1c4'})}
 if(S.family&&S.fm&&S.fm.fam===S.family){const d=S.fm.list.filter(m=>m.done).length;if(d<5)o.push({ic:'fam',t:'Familiemissies '+d+'/5',s:d<3?'Minimaal 3 vandaag':'Nog '+(5-d)+' voor de bonus',h:'fam',c:'var(--violet)'})}
 else if(!S.family){const can=FAMILIES.filter(f=>ri>=f.r&&S.cred>=f.cred).length;if(can)o.push({ic:'fam',t:'Sluit je aan bij een familie',s:can+' famil'+(can>1?'ies laten':'ie laat')+' je toe',h:'fam',c:'var(--violet)'})}
 if(typeof bzPlan==='function'){const ids=BIZ.filter(b=>bizUnits(b.id).length).map(b=>b.id);if(ids.length){const p=bzPlan(ids,wit());if(p.k)o.push({ic:'biz',t:p.k+' upgrade'+(p.k>1?'s':'')+' betaalbaar',s:fmt(p.cost)+' · +'+fmt(p.gain)+'/dag',h:'biz',c:'var(--green)'})}}
 if(!inJail()&&!cdLeft('car')&&typeof garageCap==='function'&&S.cars.length<garageCap()&&S.energy>=2)o.push({ic:'cars',t:'Auto zoeken',s:'Je kunt weer de straat op',h:'cars',c:'var(--acc2)'});
 if(typeof fwTodo==='function'&&!inJail()){const w=fwTodo();if(w)o.unshift(w)}
 if(S.feud)o.unshift({ic:'hits',t:'Bendegevecht',s:'De mensen van '+S.feud.t+' zoeken je',h:'hits',c:'var(--red)'});
 if(typeof carOrders==='function'&&S.cars.length){const O=carOrders(),n=O.list.filter(x=>!x.done&&S.cars.some(c=>c.id===x.id)).length;if(n)o.push({ic:'cars',t:'Bestelling voor de heler',s:n+' auto'+(n>1?"'s":'')+' uit je garage gevraagd',h:'cars',c:'var(--acc2)'})}
 if(RANKS.slice(1,ri+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase())))o.push({ic:'profiel',t:'Rangbeloning klaar',s:'Claim op je profiel',h:'profiel',c:'var(--acc)'});
 if(typeof cbAvail==='function'&&cbAvail()>=1)o.push({ic:'casino',t:'VIP-cashback '+fmt(cbAvail()),s:'Claim in het casino',h:'casino',c:'var(--acc)'});
 if(typeof zwart==='function'&&zwart()>=5000)o.push({ic:'wit',t:fmt(zwart())+' zwart geld',s:'Was het wit voor de bank of een zaak',h:'wit',c:'#9aa1ab'});
 if(typeof wit==='function'&&wit()>=25000&&wit()>S.bank*.25)o.push({ic:'bank',t:fmt(wit())+' wit op zak',s:'Zet het veilig op de bank',h:'bank',c:'var(--ice)'});
 return o}
const todoHtml=(o,max)=>o.slice(0,max||99).map(x=>`<a class="todo" href="#${x.h}" style="--c:${x.c}"><i>${svg(x.ic)}</i><div><b>${x.t}</b><span>${x.s}</span></div><em>›</em></a>`).join('');
// Rechterkolom op brede schermen: alles over jou op één plek (rang, geld, energie, gezondheid, hitte, familie),
// daaronder wat er klaarstaat, een snelle klus, het logboek en de top 5. Energie, gezondheid en hitte openen een paneel
// met wat je er nu aan kunt doen (ontspannen, rusten, onderduiken).
// Iconen voor contant (bundel biljetten met een bandje) en bank (gebouw met zuilen)
const ICO_CASH=`<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(-9 20 20)"><rect x="5" y="11" width="30" height="16" rx="1.6" fill="#1b5c3c"/><rect x="7.2" y="13.2" width="25.6" height="11.6" rx=".8" fill="none" stroke="#3fe395" stroke-opacity=".35"/></g>
 <rect x="5" y="15" width="30" height="16" rx="1.6" fill="#2a8f5c"/><rect x="5" y="15" width="30" height="5" rx="1.6" fill="#36a96d" opacity=".55"/>
 <rect x="7.4" y="17.4" width="25.2" height="11.2" rx=".8" fill="none" stroke="#b6f5d2" stroke-opacity=".55"/><circle cx="12.5" cy="23" r="2.6" fill="none" stroke="#b6f5d2" stroke-opacity=".6"/>
 <rect x="19" y="14" width="6.5" height="18" rx=".6" fill="#f2c230"/><rect x="19" y="14" width="6.5" height="3" fill="#ffe08a" opacity=".7"/><path d="M28.5 21h3.5M28.5 24h3.5" stroke="#b6f5d2" stroke-opacity=".6" stroke-width="1.2"/></svg>`;
// Zwart geld: een donkere stapel briefjes met een elastiekje; duidelijk anders dan het groene witte geld
const ICO_ZWART=`<svg viewBox="0 0 40 40" aria-hidden="true"><g transform="rotate(-9 20 20)"><rect x="5" y="11" width="30" height="16" rx="1.6" fill="#1c1e22"/><rect x="7.2" y="13.2" width="25.6" height="11.6" rx=".8" fill="none" stroke="#8a9099" stroke-opacity=".3"/></g>
 <rect x="5" y="15" width="30" height="16" rx="1.6" fill="#2c2f35"/><rect x="5" y="15" width="30" height="5" rx="1.6" fill="#3d4148" opacity=".6"/>
 <rect x="7.4" y="17.4" width="25.2" height="11.2" rx=".8" fill="none" stroke="#9aa1ab" stroke-opacity=".45"/><circle cx="12.5" cy="23" r="2.6" fill="none" stroke="#9aa1ab" stroke-opacity=".5"/>
 <rect x="19" y="14" width="6.5" height="18" rx=".6" fill="#8b2f3a"/><rect x="19" y="14" width="6.5" height="3" fill="#b9505c" opacity=".7"/><path d="M28.5 21h3.5M28.5 24h3.5" stroke="#9aa1ab" stroke-opacity=".5" stroke-width="1.2"/>
 <path d="M9 30.5c2-1 3.5.6 5.5-.2" stroke="#000" stroke-opacity=".35" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>`;
const ICO_BANK=`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M5 15.5L20 7l15 8.5z" fill="#8fb7d9"/><path d="M20 7l15 8.5H20z" fill="#6f93b3"/><circle cx="20" cy="12.6" r="1.7" fill="#f2c230"/>
 <rect x="6.5" y="15.5" width="27" height="3" fill="#5d7f9c"/><g fill="#a9dcff"><rect x="9" y="18.5" width="3.6" height="11"/><rect x="15" y="18.5" width="3.6" height="11"/><rect x="21.4" y="18.5" width="3.6" height="11"/><rect x="27.4" y="18.5" width="3.6" height="11"/></g>
 <g fill="#7fa9cc"><rect x="11.3" y="18.5" width="1.3" height="11"/><rect x="17.3" y="18.5" width="1.3" height="11"/><rect x="23.7" y="18.5" width="1.3" height="11"/><rect x="29.7" y="18.5" width="1.3" height="11"/></g>
 <rect x="6" y="29.5" width="28" height="2.6" fill="#5d7f9c"/><rect x="4" y="32.1" width="32" height="2.6" fill="#47647d"/></svg>`;
let _rpop=null;
function rPop(k){_rpop=_rpop===k?null:k;const el=$('#rail');if(el)el._h=null;renderRail()}
document.addEventListener('pointerdown',e=>{if(_rpop&&!e.target.closest('.dos'))rPop(null)},true);
function lbAll(){return [...S.npcs.map((n,i)=>({n:esc(n.n),xp:n.xp,npc:i})),...(window.__LB__||[]).filter(p=>!window.__USER__||p.name.toLowerCase()!==window.__USER__.toLowerCase()).map(p=>({n:esc(p.name)+playerTags(p.vip),xp:+p.xp,u:p.name})),{n:esc(S.name)+(window.__TOKEN__?playerTags(tier()):vipTag()),xp:S.xp,me:1}].sort((a,b)=>b.xp-a.xp)}
const myPos=()=>{const a=lbAll();return [a.findIndex(x=>x.me)+1,a.length]};
function rxRows(key){const ri=rankIdx(S.xp),lv=rankLevel(S.xp);
 const L=RELAX.filter(r=>r[key]&&ri>=(r.r||0)).sort((a,b)=>relaxCost(a,ri,lv)-relaxCost(b,ri,lv)).slice(0,4);
 return L.map(r=>{const c=relaxCost(r,ri,lv),left=cdLeft('rx_'+r.id),ok=!left&&!inJail()&&S.cash>=c,amt=key==='hp'&&r.hp>=100?'vol':'+'+r[key]+(key==='energy'?'':'%');
  return `<button class="rp-row" onclick="act.relax('${r.id}')" ${ok?'':'disabled'}><b>${r.n}</b><span>${amt} ${key==='energy'?'energie':key==='hp'?'gezondheid':'hitte'}</span><em>${left?fmtClock(left):fmt(c)}</em></button>`}).join('')}
function rPopHtml(){if(!_rpop)return '';const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
 const P={en:['Energie',S.energy>=EN_MAX?'Je energie is vol. Doe een klus.':`Vanzelf vol over ${full} min. Sneller:`,rxRows('energy'),`<a href="#ontspannen">Alles bij ontspannen ›</a><a href="#verblijf">Rusten in je woning ›</a>`],
  hp:['Gezondheid',S.hp>=100?'Je bent fit.':'Langzaam herstel vanzelf. Sneller:',(S.hp<100?`<button class="rp-row" onclick="act.heal()" ${S.cash<healCost()?'disabled':''}><b>Kliniek</b><span>meteen 100% gezondheid</span><em>${fmt(healCost())}</em></button>`:'')+rxRows('hp'),`<a href="#verblijf">Dokter of rusten ›</a>`],
  heat:['Hitte',S.heat<=0?'Niemand let op je.':`Zakt vanzelf, ongeveer 2% per minuut${S.wanted?'. Je staat ook op de gezochtlijst':''}. Sneller:`,(S.heat>0?`<button class="rp-row" onclick="act.bribe()" ${S.cash<bribeCost()?'disabled':''}><b>Omkopen</b><span>hitte meteen naar 0%</span><em>${fmt(bribeCost())}</em></button>`:'')+rxRows('heat'),`<a href="#verblijf">Onderduiken ›</a><a href="#look">Onopvallende kleding ›</a>`]}[_rpop];
 if(!P)return '';return `<div class="rpop" role="dialog" aria-label="${P[0]}"><div class="rp-h"><b>${P[0]}</b><button onclick="rPop(null)" aria-label="Sluiten">✕</button></div><p>${P[1]}</p>${(_rpop==='en'&&S.energy<EN_MAX)||(_rpop==='hp'&&S.hp<100)||(_rpop==='heat'&&S.heat>0)?P[2]:''}<div class="rp-links">${P[3]}</div></div>`}
function statusTag(){const jt=Math.ceil((S.jailUntil-now())/1000);return inJail()?`<a class="dos-st jail" href="#jail">Cel · ${fmtTime(jt)}</a>`:S.hide?'<a class="dos-st hide" href="#verblijf">Ondergedoken</a>':S.wanted?`<span class="dos-st wanted">Gezocht${typeof wantedLeft==='function'&&isFinite(wantedLeft())&&wantedLeft()>0?' · '+fmtClock(wantedLeft()):''}</span>`:'<span class="dos-st free">Vrij</span>'}
function renderRail(){
  const el=$('#rail');if(!el||getComputedStyle(el).display==='none')return;
  const ri=rankIdx(S.xp),nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100,pend=window.slotPending||0;
  const bc=bestCrime(),left=cdLeft(bc.id),ok=!inJail()&&!left&&S.energy>=bc.en;
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const all=lbAll(),pos=all.findIndex(x=>x.me)+1;
  const td=todoItems(),F=S.family?fam():null,fr=S.family&&typeof famRankIdx==='function'&&typeof FAM_RANKS!=='undefined'?FAM_RANKS[famRankIdx()]:null;
  const hc=S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--green)',pc=S.hp>50?'var(--green)':S.hp>25?'var(--acc)':'var(--red)';
  const bl=buffLoot(),fp=focusPct();
  const top=all.slice(0,5);
  setHTML(el,`
   <section class="rcard hud dos ${_rpop?'pop':''}">
    <div class="dos-top"><a class="dos-name" href="#profiel">${esc(S.name)}${vipTag()}</a>${statusTag()}</div>
    <div class="dos-rank"><b>${RANKS[ri][0]}</b><span>lv ${rankLevel(S.xp)}</span><em>${nxt?Math.floor(S.xp).toLocaleString('nl-NL')+' / '+nxt[1].toLocaleString('nl-NL')+' XP':'Top bereikt'}</em></div>
    <div class="bar"><i style="width:${pct}%;background:var(--acc)"></i></div>
    <div class="dos-money">${moneyRows(pend)}</div>
    <div class="dos-vit">
     <button class="rs ${_rpop==='en'?'on':''}" onclick="rPop('en')" aria-expanded="${_rpop==='en'}" title="Wat je nu aan je energie kunt doen"><span class="label">Energie</span><b style="color:var(--ice)">${Math.floor(S.energy)}<small>/${EN_MAX}</small></b><i class="mini"><i style="width:${Math.min(100,S.energy/EN_MAX*100)}%;background:var(--ice)"></i></i><small>${full?'vol over '+full+' min':'vol'}</small></button>
     <button class="rs ${_rpop==='hp'?'on':''}" onclick="rPop('hp')" aria-expanded="${_rpop==='hp'}" title="Wat je nu aan je gezondheid kunt doen"><span class="label">Gezondheid</span><b style="color:${pc}">${S.hp}%</b><i class="mini"><i style="width:${S.hp}%;background:${pc}"></i></i><small>${S.hp>=100?'fit':S.hp>50?'gaat wel':'oppassen'}</small></button>
     <button class="rs ${_rpop==='heat'?'on':''}" onclick="rPop('heat')" aria-expanded="${_rpop==='heat'}" title="Wat je nu aan je hitte kunt doen"><span class="label">Hitte</span><b style="color:${S.heat>30?hc:'var(--fg)'}">${S.heat}%</b><i class="mini"><i style="width:${S.heat}%;background:${hc}"></i></i><small>${S.heat>60?'politie let op':S.heat>30?'lauw':'koel'}</small></button>
     <a class="rs" href="#fam"><span class="label">Familie</span><b style="color:${F?F.col:'var(--faint)'}">${F?F.m:'—'}</b><small>${F?esc(F.n)+(fr?' · '+fr[0]:''):'geen familie'}</small></a>
    </div>
    <div class="dos-foot"><span>Cred <b style="color:var(--violet)">${S.cred}</b></span>${bl?`<span>Buit <b style="color:var(--green)">+${bl}%</b> ${fmtClock(S.buffs.loot.until-now())}</span>`:''}${fp?`<span>Focus <b style="color:#ff6b7c">+${fp}%</b>${buffFocus()?' '+fmtClock(S.buffs.focus.until-now()):''}</span>`:''}${typeof luckPct==='function'&&luckPct()?`<a href="#casino">Geluk <b style="color:#f2c230">+${Math.round(luckPct()*100)}%</b> ${fmtClock(luckLeft())}</a>`:''}</div>
    ${rPopHtml()}
   </section>
   ${td.length?`<section class="rcard"><div class="label">Klaar voor je · ${td.length}</div><div class="todos">${todoHtml(td,4)}</div>${td.length>4?`<a class="todo-more" href="#dash">Nog ${td.length-4} op het dashboard ›</a>`:''}</section>`:''}
   <section class="rcard"><div class="label">Snelle klus</div>
    <div class="rq"><div><b>${bc.n}</b><small>${chance(bc)}% kans · ${bc.en} energie · ${fmt(bc.min*lootMult())}–${fmt(bc.max*lootMult())}</small></div></div>
    <button class="btn" onclick="act.crime('${bc.id}')" ${ok?'':'disabled'}>${inJail()?'Je zit vast':left?'Wacht '+Math.ceil(left/1000)+'s':S.energy<bc.en?'Te moe':'Uitvoeren'}</button></section>
   <section class="rcard grow"><div class="label">Logboek</div><div class="log">${logShown().length?logShown().slice(0,14).map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd.</div>'}</div></section>
   <section class="rcard"><div class="label">Top 5 · <a href="#rank" style="color:var(--acc)">ranglijst</a></div>
    <ol class="rtop">${top.map((p,i)=>`<li class="${p.me?'me':''}"><span>${i+1}</span><b><button class="lb-name" onclick="${p.me?(window.__USER__?`pvShow('${window.__USER__}')`:''):p.u?`pvShow('${p.u}')`:`pvNpc(${p.npc})`}">${p.n}</button></b><em>${RANKS[rankIdx(p.xp)][0]}</em></li>`).join('')}${pos>5?`<li class="me gap"><span>${pos}</span><b>${all[pos-1].n}</b><em>${RANKS[ri][0]}</em></li>`:''}</ol></section>`);
}

// Drie soorten geld, altijd apart: wit (schoon, op zak), zwart (uit klussen, eerst witwassen) en de bank (veilig)
const witNu=(pend)=>Math.max(0,S.cash-(pend||0)-zwart());
function moneyRows(pend){const zw=zwart(),bk=typeof bankNet==='function'?bankNet():S.bank;
 return `<a class="dm cash" href="#bank" title="Wit geld: schoon, je kunt het overal aan uitgeven en op de bank zetten. Het zit wel op zak: word je gepakt, dan kun je een deel kwijtraken."><i class="dm-ic">${ICO_CASH}</i><span class="dm-t"><span class="label">Wit geld</span><small>schoon</small></span><b>${fmt(witNu(pend))}</b></a>
  <a class="dm zw ${zw<1?'nul':''}" href="#wit" title="Zwart geld: verdiend met klussen, auto's, huurmoorden en de familie. De bank en je zaken nemen het niet aan; eerst witwassen. In het casino en voor kleine uitgaven kun je het wel gebruiken."><i class="dm-ic">${ICO_ZWART}</i><span class="dm-t"><span class="label">Zwart geld</span><small>${zw>=1?'eerst witwassen ›':'niets op zak'}</small></span><b>${fmt(zw)}</b></a>
  <a class="dm bank" href="#bank" title="Op de bank staat je geld veilig: spaarrekening, deposito's en beleggingen."><i class="dm-ic">${ICO_BANK}</i><span class="dm-t"><span class="label">Bank</span><small>veilig</small></span><b>${fmt(bk)}</b></a>`}
// Statusbalk bovenaan: op de telefoon en op smallere schermen (zonder rechterkolom). In het casino: saldo en lidmaatschap.
// Ogen van de beveiliging: dicht (ze zien je niet), open (ze kijken rond) of rood (ze kijken naar jouw tafel)
const CZ_EYE_TXT=['Ogen dicht · ze zien je niet','Ze kijken rond','Ze kijken naar jouw tafel'];
function czEyesSvg(e){const one=x=>e===0?`<path d="M${x-9} 12 Q${x} 18 ${x+9} 12" stroke="#6b717b" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M${x-6} 15.5l-1.5 2.5M${x} 16.6v2.8M${x+6} 15.5l1.5 2.5" stroke="#6b717b" stroke-width="1.5" stroke-linecap="round"/>`
  :`<path d="M${x-10} 12 Q${x} 3 ${x+10} 12 Q${x} 21 ${x-10} 12Z" fill="#0d0e11" stroke="${e===2?'#ff3d52':'#c9ced6'}" stroke-width="1.6"/><circle cx="${x}" cy="12" r="4.2" fill="${e===2?'#ff3d52':'#9aa3ad'}"/><circle cx="${x}" cy="12" r="1.8" fill="#0d0e11"/><circle cx="${x+1.4}" cy="10.6" r=".9" fill="#fff" opacity=".8"/>`;
 return `<svg class="cz-eyes e${e}" viewBox="0 0 48 24" aria-hidden="true">${one(12)}${one(36)}</svg>`}
function casHudHtml(){const pend=window.slotPending||0,b=typeof bankNet==='function'?bankNet():S.bank,t=typeof tier==='function'?tier():0;
 const cb=typeof cbAvail==='function'?cbAvail():0;
 const luck=typeof luckState==='function'?luckState():null,zw=zwart(),hasLuck=!!(luck&&luck.o&&luck.o.luck);
 const sus=Math.round(czVal()),susC=sus>=70?'hot':sus>=35?'warm':'',e=czEyes(),pm=casPayMode(),wn=witNu(pend);
 const lid=['Gewoon',`VIP`,`High roller`][t];
 // Telefoon: een rij knoppen onder saldo en bank (spelen met, cashback, geluk, verdenking)
 const chips=[
  `<button class="cc cc-pay ${pm}" onclick="act.casPay('${pm==='wit'?'zwart':'wit'}')" aria-label="Wissel tussen wit en zwart geld"><span>Spelen met</span><b><i></i>${pm==='wit'?'Wit':'Zwart'} ⇄</b></button>`,
  t?`<button class="cc cc-cb ${cb>=1?'can':''}" onclick="act.claimCb()" ${cb<1?'disabled':''} aria-label="Cashback claimen"><span>${cb>=1?'Claim':'Cashback'}</span><b>${fmt(cb)}</b></button>`
   :`<a class="cc cc-up" href="#profiel"><span>Gewoon lid</span><b>VIP ›</b></a>`,
  hasLuck?(luck.ready?`<button class="cc cc-luck can" onclick="act.luckUse()"><span><i>${diceSvg(luck.o)}</i>Geluk +${Math.round(luck.o.luck*100)}%</span><b>Gebruik</b></button>`
   :`<a class="cc cc-luck ${luck.L?'on':''}" href="#look"><span><i>${diceSvg(luck.o)}</i>Geluk +${Math.round(luck.o.luck*100)}%</span><b>${luck.L?fmtClock(luck.L):bkDurL(luck.W)}</b></a>`):'',
  `<a class="cc cc-sus ${susC} e${e}" href="#wit" style="--v:${sus}%" title="${CZ_EYE_TXT[e]}"><span>${czEyesSvg(e)}</span><b>${sus}%</b></a>`].join('');
 return `<div class="chud v2">
  <div class="ch-main"><i class="dm-ic">${ICO_CASH}</i><div><span class="label">Saldo om mee te spelen</span><b id="casBal">${fmt(S.cash-pend)}</b></div></div>
  <div class="ch-pay" role="group" aria-label="Spelen met"><span class="label">Spelen met</span>
   <div class="ch-seg"><button class="w ${pm==='wit'?'on':''}" onclick="act.casPay('wit')" aria-pressed="${pm==='wit'}"><small>Wit · legaal</small><b>${fmt(wn)}</b></button><button class="z ${pm==='zwart'?'on':''}" onclick="act.casPay('zwart')" aria-pressed="${pm==='zwart'}"><small>Zwart · riskant</small><b>${fmt(zw)}</b></button></div></div>
  <a class="ch-cell ch-bank" href="#bank"><i class="dm-ic">${ICO_BANK}</i><div><span class="label">Bank</span><b>${fmt(b)}</b></div></a>
  ${t?`<div class="ch-cell ch-cb" title="${typeof CB_RATE!=='undefined'?'Cashback op elke inzet: '+Object.keys(CB_RATE).map(k=>CB_NAME[k]+' '+(CB_RATE[k]*(TIER_CB[t]||1)*100).toLocaleString('nl-NL',{maximumFractionDigits:3})+'%').join(' · '):''}"><div><span class="label">Cashback · ${lid}</span><b id="cbAmt">${fmt(cb)}</b></div><button class="btn gold sm" id="cbBtn" onclick="act.claimCb()" ${cb<1?'disabled':''}>${cb>=1?'Claimen':'Nog niks'}</button></div>`:`<a class="ch-cell ch-up" href="#profiel"><span class="label">Gewoon lid</span><b>VIP: cashback en vaker bonus</b></a>`}
  ${hasLuck?`<div class="ch-cell ch-luck ${luck.L?'on':''}"><i class="dm-ic">${diceSvg(luck.o)}</i><div><span class="label">Geluk +${Math.round(luck.o.luck*100)}%</span><b>${luck.L?'Nog '+fmtClock(luck.L):luck.W?bkDurL(luck.W):'Klaar'}</b></div>${luck.ready?`<button class="btn gold sm" onclick="act.luckUse()">Gebruiken</button>`:''}</div>`:''}
  <a class="ch-cell ch-sus ${susC} e${e}" href="#wit" title="Met zwart geld en grote inzetten loopt de verdenking op, het snelst bij de slots en als ze naar jouw tafel kijken. Op 100% word je verbannen.">${czEyesSvg(e)}<div class="ch-sus-t"><span class="label">Verdenking · ${CZ_EYE_TXT[e]}</span><div class="ch-sus-r"><b>${sus}%</b><i class="mini"><i style="width:${sus}%"></i></i></div></div></a>
  <div class="ch-cell ch-r">${statusTag()}</div>${chips?`<div class="ch-chips">${chips}</div>`:''}</div>`}
// Kleine iconen voor de statusbalk op de telefoon (energie, gezondheid, hitte, cred)
const TI={en:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2L4 13.5h6.5L9.5 22 20 9.5h-6.5z"/></svg>',
 hp:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.3-9.6C1.5 8 3.6 4.5 7.1 4.5c2.1 0 3.6 1.1 4.9 2.8 1.3-1.7 2.8-2.8 4.9-2.8 3.5 0 5.6 3.5 4.4 6.9C19.5 16.4 12 21 12 21z"/></svg>',
 heat:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 2c.6 3.6-1.8 5.3-3.4 7.4C7.6 11.3 6.5 13 6.5 15.3 6.5 19 9 22 12.3 22c3.5 0 5.9-2.7 5.9-6.4 0-2.6-1.3-4.4-2.6-5.6.1 1.6-.4 2.9-1.7 3.4.5-4-.3-8.2-1.4-11.4z"/></svg>',
 cred:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z"/></svg>'};
let _casPrev=null;
function renderTop(){
  if(page==='casino'){const v=S.cash-(window.slotPending||0),el=$('#topbar');if(setHTML(el,casHudHtml())&&_casPrev!=null&&v!==_casPrev){const b=el.querySelector('#casBal');if(b)b.classList.add(v>_casPrev?'up':'dn')}_casPrev=v;return}
  _casPrev=null;
  const ri=rankIdx(S.xp);const jt=Math.ceil((S.jailUntil-now())/1000);const pend=window.slotPending||0;
  const nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
  setHTML($('#topbar'),`
   <div class="chip rank"><small>Rang · lv ${rankLevel(S.xp)}</small><b><span class="rk-n">${RANKS[ri][0]}</span>${vipTag(1)}</b><div class="mini"><i style="width:${pct}%;background:var(--acc)"></i></div></div>
   <a class="chip cash" href="#bank" title="Wit geld: schoon, overal aan uit te geven"><small><i class="ci">${ICO_CASH}</i>Wit geld</small><b>${fmt(witNu(pend))}</b></a>
   <a class="chip zwc ${zwart()<1?'nul':''}" href="#wit" title="Zwart geld: eerst witwassen voor de bank of een zaak"><small><i class="ci">${ICO_ZWART}</i>Zwart geld</small><b>${fmt(zwart())}</b></a>
   <a class="chip bankc" href="#bank" title="Op de bank staat je geld veilig"><small><i class="ci">${ICO_BANK}</i>Bank</small><b>${fmt(typeof bankNet==='function'?bankNet():S.bank)}</b></a>
   <a class="chip sm en" href="#ontspannen" title="Energie bijvullen"><small>Energie</small><b style="color:var(--ice)"><i class="ti">${TI.en}</i>${Math.floor(S.energy)}<span class="emax">/${EN_MAX}</span></b><div class="mini"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div></a>
   <div class="chip sm cred"><small>Cred</small><b style="color:var(--violet)"><i class="ti">${TI.cred}</i>${S.cred}</b></div>
   <a class="chip sm hp" href="#verblijf" title="Dokter of rusten"><small>Gezondheid</small><b style="color:${S.hp>50?'var(--green)':'var(--red)'}"><i class="ti">${TI.hp}</i>${S.hp}%</b></a>
   ${buffLoot()?`<div class="chip sm buff"><small>Buit</small><b style="color:var(--green)">+${buffLoot()}% · ${fmtClock(S.buffs.loot.until-now())}</b></div>`:''}
   ${focusPct()?`<div class="chip sm buff"><small>Focus</small><b style="color:#ff6b7c">+${focusPct()}%${buffFocus()?' · '+fmtClock(S.buffs.focus.until-now()):''}</b></div>`:''}
   <a class="chip sm heat" href="#verblijf" title="Onderduiken laat je hitte sneller zakken"><small>Hitte</small><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}"><i class="ti">${TI.heat}</i>${S.heat}%</b></a>
   <div class="status ${inJail()?'jail':S.hide?'hide':S.wanted?'wanted':'free'}">${inJail()?'■ CEL · '+fmtTime(jt):S.hide?(page==='verblijf'?'◐ ONDERGEDOKEN':'◐ VERMOMD'):S.wanted?(typeof wantedLabel==='function'?wantedLabel():'▲ GEZOCHT'):'● VRIJ'}</div>`);
}


function cdLeft(id){return Math.max(0,(S.cd[id]||0)-now())}
const V={};
