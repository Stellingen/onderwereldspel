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
 rank:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 6h3v2a3 3 0 01-3 3M7 6H4v2a3 3 0 003 3"/>'};
const PAGES=[['dash','Dashboard'],['verblijf','Verblijf'],['crimes','Misdaden'],['hits','Huurmoorden'],['cars','Auto\'s'],['casino','Casino'],['biz','Bezit'],['shop','Wapens'],['skills','Training'],['bank','Bank'],['fam','Families'],['jail','Bajes'],['rank','Ranglijst'],['profiel','Profiel']];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
let page=(location.hash||'#dash').slice(1);if(!PAGES.find(p=>p[0]===page))page='dash';
let casinoTab='kluis',rankTab='xp',slotState=['7','7','7'],spinning=false;

// Elke sectie heeft een eigen kleur, zodat je ziet waar je bent
const NAV_GROUPS=[['Straat',['dash','verblijf','crimes','hits','cars'],'#ff7a1a','255,122,26'],['Geld',['casino','biz','bank'],'#3fe395','63,227,149'],['Macht',['shop','skills','fam'],'#b8a1ff','184,161,255'],['Overig',['jail','rank','profiel'],'#a9dcff','169,220,255']];
const groupOf=k=>NAV_GROUPS.find(g=>g[1].includes(k))||NAV_GROUPS[0];
function applySection(){document.body.classList.toggle('wide-page',page==='casino');const g=groupOf(page),r=document.documentElement.style;r.setProperty('--sec',g[2]);r.setProperty('--sec-rgb',g[3])}
function crumbHtml(){const g=groupOf(page);return `<div class="crumb"><i></i><span>${g[0]}</span>/ ${PAGES.find(p=>p[0]===page)[1]}</div>`+(typeof feudBar==='function'?feudBar():'')}
function renderNav(){
  const name=k=>PAGES.find(p=>p[0]===k)[1];
  const link=k=>`<a class="navlink ${k===page?'on':''}" href="#${k}">${svg(k)}<span>${name(k)}</span>${k==='jail'&&inJail()?'<span class="badge">!</span>':''}${k==='crimes'&&!inJail()&&S.energy>=EN_MAX?'<span class="badge ok">●</span>':''}${k==='profiel'&&typeof RANK_CODES!=='undefined'&&RANKS.slice(1,rankIdx(S.xp)+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase()))?'<span class="badge">€</span>':''}</a>`;
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
function navBadges(){const b={};if(inJail())b.jail='!';if(!inJail()&&S.energy>=EN_MAX)b.crimes='●';
 if(typeof RANK_CODES!=='undefined'&&RANKS.slice(1,rankIdx(S.xp)+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase())))b.profiel='€';
 if(typeof isVip==='function'&&isVip()&&typeof cbAvail==='function'&&cbAvail()>=1)b.casino='€';return b}
function navHint(k){const jt=Math.ceil((S.jailUntil-now())/1000);
 return {dash:'Overzicht',verblijf:S.hide?'Ondergedoken':'Gezondheid '+S.hp+'%',crimes:Math.floor(S.energy)+' energie',hits:rankIdx(S.xp)<7?'Vanaf '+RANKS[7][0]:cdLeft('hit')?'Over '+fmtClock(cdLeft('hit')):((S.stats&&S.stats.hits)||0)+' gedaan',cars:S.cars.length+(S.cars.length===1?' auto':" auto's"),
  casino:'8 spellen',biz:typeof income==='function'?fmt(income())+'/dag':'Bedrijven',bank:fmt(typeof bankNet==='function'?bankNet():S.bank),shop:'Wapens',skills:'Trainen & ontspannen',
  fam:S.family?fam().n:'Geen familie',jail:inJail()?'Vast, '+fmtTime(jt):'Vrij',rank:'Spelers',profiel:'Codes en account'}[k]||''}
function renderMbar(){let bar=$('#mbar');if(!bar){bar=document.createElement('nav');bar.id='mbar';bar.className='mbar';bar.setAttribute('aria-label','Menu');document.body.appendChild(bar)}
 let sh=$('#msheet');if(!sh){sh=document.createElement('div');sh.id='msheet';sh.className='msheet';sh.setAttribute('aria-hidden','true');document.body.appendChild(sh);
  sh.addEventListener('click',e=>{if(e.target===sh||e.target.closest('[data-close]'))mSheet(false)})}
 const bd=navBadges(),name=k=>PAGES.find(p=>p[0]===k)[1],inMain=MBAR.includes(page),more=Object.keys(bd).some(k=>!MBAR.includes(k));
 setHTML(bar,MBAR.map(k=>`<a class="mb ${k===page?'on':''}" href="#${k}" style="--g:${groupOf(k)[2]}">${svg(k)}<span>${MSHORT[k]}</span>${bd[k]?`<em class="${bd[k]==='●'?'ok':''}">${bd[k]}</em>`:''}</a>`).join('')
  +`<button class="mb more ${inMain?'':'on'}" onclick="mSheet(true)" aria-haspopup="dialog" style="--g:${inMain?'#8a8f98':groupOf(page)[2]}">${inMain?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>':svg(page)}<span>${inMain?'Meer':name(page)}</span>${more?'<em>•</em>':''}</button>`);
 const ri=rankIdx(S.xp);
 // het open menu niet hertekenen terwijl je erin scrollt; bij openen wordt het vernieuwd
 if(sh.classList.contains('open')&&!sh._fresh)return;sh._fresh=false;
 setHTML(sh,`<div class="ms-panel" role="dialog" aria-label="Alle pagina's"><div class="ms-grab"></div>
  <div class="ms-head"><div><b>${esc(S.name)}${vipTag()}</b><span>${RANKS[ri][0]}, ${fmt(S.cash)} contant</span></div><button class="ms-x" data-close aria-label="Sluiten">✕</button></div>
  ${NAV_GROUPS.map(([g,ks,col])=>`<div class="ms-group" style="--g:${col}"><h3>${g}</h3><div class="ms-grid">${ks.map(k=>`<a class="ms-tile ${k===page?'on':''}" href="#${k}" data-close>${svg(k)}<b>${name(k)}</b><small>${navHint(k)}</small>${bd[k]?`<em class="${bd[k]==='●'?'ok':''}">${bd[k]==='●'?'vol':bd[k]}</em>`:''}</a>`).join('')}</div></div>`).join('')}
  ${window.__ADMIN__?`<a class="btn ghost ms-out ms-admin" href="/admin">${svg('beheer')} Beheerdashboard</a>`:''}${window.__TOKEN__?`<button class="btn ghost ms-out" onclick="logout()">Uitloggen</button>`:''}</div>`)}
function mSheet(open){const sh=$('#msheet');if(!sh)return;if(open&&!sh.classList.contains('open')){sh._fresh=true;renderMbar();const p=sh.querySelector('.ms-panel');if(p)p.scrollTop=0}sh.classList.toggle('open',open);sh.setAttribute('aria-hidden',open?'false':'true');document.body.classList.toggle('ms-lock',open);
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
 if(typeof bzPlan==='function'){const ids=BIZ.filter(b=>bizUnits(b.id).length).map(b=>b.id);if(ids.length){const p=bzPlan(ids,S.cash);if(p.k)o.push({ic:'biz',t:p.k+' upgrade'+(p.k>1?'s':'')+' betaalbaar',s:fmt(p.cost)+' · +'+fmt(p.gain)+'/dag',h:'biz',c:'var(--green)'})}}
 if(!inJail()&&!cdLeft('car')&&typeof GARAGE_MAX!=='undefined'&&S.cars.length<GARAGE_MAX&&S.energy>=2)o.push({ic:'cars',t:'Auto zoeken',s:'Je kunt weer de straat op',h:'cars',c:'var(--acc2)'});
 if(S.feud)o.unshift({ic:'hits',t:'Bendegevecht',s:'De mensen van '+S.feud.t+' zoeken je',h:'hits',c:'var(--red)'});
 if(typeof carOrders==='function'&&S.cars.length){const O=carOrders(),n=O.list.filter(x=>!x.done&&S.cars.some(c=>c.id===x.id)).length;if(n)o.push({ic:'cars',t:'Bestelling voor de heler',s:n+' auto'+(n>1?"'s":'')+' uit je garage gevraagd',h:'cars',c:'var(--acc2)'})}
 if(RANKS.slice(1,ri+1).some(r=>!(S.redeemed||[]).includes(r[0].toLowerCase())))o.push({ic:'profiel',t:'Rangbeloning klaar',s:'Claim op je profiel',h:'profiel',c:'var(--acc)'});
 if(typeof cbAvail==='function'&&cbAvail()>=1)o.push({ic:'casino',t:'VIP-cashback '+fmt(cbAvail()),s:'Claim in het casino',h:'casino',c:'var(--acc)'});
 if(S.cash>=25000&&S.cash>S.bank*.25)o.push({ic:'bank',t:fmt(S.cash)+' contant',s:'Zet het veilig op de bank',h:'bank',c:'var(--ice)'});
 return o}
const todoHtml=(o,max)=>o.slice(0,max||99).map(x=>`<a class="todo" href="#${x.h}" style="--c:${x.c}"><i>${svg(x.ic)}</i><div><b>${x.t}</b><span>${x.s}</span></div><em>›</em></a>`).join('');
function renderRail(){
  const el=$('#rail');if(!el||getComputedStyle(el).display==='none')return;
  const ri=rankIdx(S.xp),nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
  const bc=bestCrime(),left=cdLeft(bc.id),ok=!inJail()&&!left&&S.energy>=bc.en;
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const all=[...S.npcs.map(n=>({n:n.n,xp:n.xp})),...(window.__LB__||[]).filter(p=>!window.__USER__||p.name.toLowerCase()!==window.__USER__.toLowerCase()).map(p=>({n:esc(p.name)+playerTags(p.vip),xp:+p.xp})),{n:'★ '+esc(S.name)+(window.__TOKEN__?playerTags(tier()):vipTag()),xp:S.xp,me:1}].sort((a,b)=>b.xp-a.xp);
  const pos=all.findIndex(x=>x.me)+1;
  const td=todoItems();
  setHTML(el,`
   <section class="rcard hud"><div class="label">Dossier · <a href="#profiel" style="color:var(--acc)">profiel</a></div>
    <a class="rname" href="#profiel" style="display:block;color:inherit;text-decoration:none">${esc(S.name)}${vipTag()}</a>
    <div class="rrank"><b>${RANKS[ri][0]}</b><span>${nxt?Math.floor(S.xp).toLocaleString('nl-NL')+' / '+nxt[1].toLocaleString('nl-NL')+' XP':'Top bereikt'}</span></div>
    <div class="bar"><i style="width:${pct}%;background:var(--acc)"></i></div>
    <div class="rgrid">
     <div><span class="label">Energie</span><b style="color:var(--ice)">${Math.floor(S.energy)}</b><small>${full?'vol over '+full+' min':'vol'}</small></div>
     <div><span class="label">Familie</span><b style="color:${S.family?fam().col:'var(--faint)'}">${S.family?fam().m:'—'}</b><small>${S.family?fam().n:'geen'}</small></div>
     <div><span class="label">Positie</span><b>#${pos}</b><small>van ${all.length}</small></div>
    </div></section>
   ${td.length?`<section class="rcard"><div class="label">Klaar voor je · ${td.length}</div><div class="todos">${todoHtml(td,3)}</div>${td.length>3?`<a class="todo-more" href="#dash">Nog ${td.length-3} op het dashboard ›</a>`:''}</section>`:''}
   <section class="rcard"><div class="label">Snelle klus</div>
    <div class="rq"><div><b>${bc.n}</b><small>${chance(bc)}% kans · ${bc.en} energie · ${fmt(bc.min*lootMult())}–${fmt(bc.max*lootMult())}</small></div></div>
    <button class="btn" onclick="act.crime('${bc.id}')" ${ok?'':'disabled'}>${inJail()?'Je zit vast':left?'Wacht '+Math.ceil(left/1000)+'s':S.energy<bc.en?'Te moe':'Uitvoeren'}</button></section>
   <section class="rcard grow"><div class="label">Logboek</div><div class="log">${logShown().length?logShown().slice(0,14).map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd.</div>'}</div></section>
   <section class="rcard"><div class="label">Top 5 · <a href="#rank" style="color:var(--acc)">ranglijst</a></div>
    <ol class="rtop">${all.slice(0,5).map((p,i)=>`<li class="${p.me?'me':''}"><span>${i+1}</span><b>${p.n}</b><em>${RANKS[rankIdx(p.xp)][0]}</em></li>`).join('')}</ol></section>`);
}

function renderTop(){
  const ri=rankIdx(S.xp);const jt=Math.ceil((S.jailUntil-now())/1000);const pend=window.slotPending||0;
  const nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
  setHTML($('#topbar'),`
   <div class="chip rank"><small>Rang · lv ${rankLevel(S.xp)}</small><b>${RANKS[ri][0]}${vipTag(1)}</b><div class="mini"><i style="width:${pct}%;background:var(--acc)"></i></div></div>
   <div class="chip cash"><small>Contant</small><b>${fmt(S.cash-pend)}</b></div>
   <div class="chip"><small>Bank</small><b>${fmt(S.bank)}</b></div>
   <div class="chip"><small>Energie</small><b style="color:var(--ice)">${Math.floor(S.energy)}/${EN_MAX}</b><div class="mini"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div></div>
   <div class="chip"><small>Cred</small><b style="color:var(--violet)">${S.cred}</b></div>
   <div class="chip"><small>Gezondheid</small><b style="color:${S.hp>50?'var(--green)':'var(--red)'}">${S.hp}%</b></div>
   ${buffLoot()?`<div class="chip"><small>Buit</small><b style="color:var(--green)">+${buffLoot()}% · ${fmtClock(S.buffs.loot.until-now())}</b></div>`:''}
   ${focusPct()?`<div class="chip"><small>Focus</small><b style="color:#ff6b7c">+${focusPct()}%${buffFocus()?' · '+fmtClock(S.buffs.focus.until-now()):''}</b></div>`:''}
   <div class="chip"><small>Hitte</small><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}">${S.heat}%</b></div>
   <div class="status ${inJail()?'jail':S.hide?'hide':S.wanted?'wanted':'free'}">${inJail()?'■ CEL · '+fmtTime(jt):S.hide?(page==='verblijf'?'◐ ONDERGEDOKEN':'◐ VERMOMD'):S.wanted?'▲ GEZOCHT':'● VRIJ'}</div>`);
}


function cdLeft(id){return Math.max(0,(S.cd[id]||0)-now())}
const V={};
