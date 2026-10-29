// Navigatie, iconen en de statusbalk bovenaan
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICONS={
 profiel:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
 gym:'<path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12"/>',
 hand:'<path d="M8 13V5.5a1.5 1.5 0 013 0V11M11 10V4.5a1.5 1.5 0 013 0V11M14 10.5V6a1.5 1.5 0 013 0v7c0 4-2.5 7-6.5 7S5 17.5 4 15l-1.5-3.5a1.5 1.5 0 012.6-1.4L8 13"/>',
 run:'<circle cx="14" cy="4" r="2"/><path d="M6 21l3-6 3 2 2 5M9 15l1-5 4 1 3 3M10 10l-4 1"/>',
 wheel:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 14.5V21M9.6 11.2L3.5 10M14.4 11.2l6.1-1.2"/>',
 mask:'<path d="M4 5h16v6a8 8 0 01-16 0z"/><path d="M8.5 10h1M14.5 10h1M9 15c1.8 1.3 4.2 1.3 6 0"/>',
 glass:'<path d="M5 4h14l-7 8zM12 12v7M8 20h8"/>',
 steam:'<path d="M4 20h16M7 16c0-2 2-2 2-4s-2-2-2-4M12 16c0-2 2-2 2-4s-2-2-2-4M17 16c0-2 2-2 2-4s-2-2-2-4"/>',
 cup:'<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 11h2a2 2 0 010 4h-2M8 3v3M12 3v3"/>',
 house:'<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
 logout:'<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
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
const PAGES=[['dash','Dashboard'],['crimes','Misdaden'],['cars','Auto\'s'],['casino','Casino'],['biz','Bezit'],['shop','Wapens'],['skills','Training'],['bank','Bank'],['fam','Families'],['jail','Bajes'],['rank','Ranglijst'],['profiel','Profiel']];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
let page=(location.hash||'#dash').slice(1);if(!PAGES.find(p=>p[0]===page))page='dash';
let casinoTab='kluis',rankTab='xp',slotState=['7','7','7'],spinning=false;

// Elke sectie heeft een eigen kleur, zodat je ziet waar je bent
const NAV_GROUPS=[['Straat',['dash','crimes','cars'],'#ff7a1a','255,122,26'],['Geld',['casino','biz','bank'],'#3fe395','63,227,149'],['Macht',['shop','skills','fam'],'#b8a1ff','184,161,255'],['Overig',['jail','rank','profiel'],'#a9dcff','169,220,255']];
const groupOf=k=>NAV_GROUPS.find(g=>g[1].includes(k))||NAV_GROUPS[0];
function applySection(){document.body.classList.toggle('wide-page',page==='casino');const g=groupOf(page),r=document.documentElement.style;r.setProperty('--sec',g[2]);r.setProperty('--sec-rgb',g[3])}
function crumbHtml(){const g=groupOf(page);return `<div class="crumb"><i></i><span>${g[0]}</span>/ ${PAGES.find(p=>p[0]===page)[1]}</div>`}
function renderNav(){
  const name=k=>PAGES.find(p=>p[0]===k)[1];
  const link=k=>`<a class="navlink ${k===page?'on':''}" href="#${k}">${svg(k)}<span>${name(k)}</span>${k==='jail'&&inJail()?'<span class="badge">!</span>':''}${k==='crimes'&&!inJail()&&S.energy>=EN_MAX?'<span class="badge ok">●</span>':''}</a>`;
  $('#nav').innerHTML=`<a class="brand" href="/" style="text-decoration:none;color:inherit"><span class="mark">O</span><span><b>Onderwereld</b><small>${window.__USER__?esc(window.__USER__):'Offline modus'}</small></span></a>`
   +NAV_GROUPS.map(([g,ks,col,rgb])=>`<div class="navgroup" style="--g:${col};--g-rgb:${rgb}"><div class="navlabel">${g}</div>${ks.map(link).join('')}</div>`).join('')
   +(window.__TOKEN__?`<div class="navspace"></div><button class="navlink logout" onclick="logout()">${svg('logout')}<span>Uitloggen</span></button>`:'');
}
// Rechter zijbalk op brede schermen: dossier, snelle klus, logboek, top 5
function bestCrime(){const ri=rankIdx(S.xp);return CRIMES.filter(c=>c.r<=ri).map(c=>({c,ev:chance(c)/100*(c.min+c.max)/2/c.en})).sort((a,b)=>b.ev-a.ev)[0].c}
function renderRail(){
  const el=$('#rail');if(!el||getComputedStyle(el).display==='none')return;
  const ri=rankIdx(S.xp),nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
  const bc=bestCrime(),left=cdLeft(bc.id),ok=!inJail()&&!left&&S.energy>=bc.en;
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const all=[...S.npcs.map(n=>({n:n.n,xp:n.xp})),...(window.__LB__||[]).filter(p=>!window.__USER__||p.name.toLowerCase()!==window.__USER__.toLowerCase()).map(p=>({n:esc(p.name),xp:+p.xp})),{n:'★ '+esc(S.name),xp:S.xp,me:1}].sort((a,b)=>b.xp-a.xp);
  const pos=all.findIndex(x=>x.me)+1;
  el.innerHTML=`
   <section class="rcard hud"><div class="label">Dossier · <a href="#profiel" style="color:var(--acc)">profiel</a></div>
    <a class="rname" href="#profiel" style="display:block;color:inherit;text-decoration:none">${esc(S.name)}</a>
    <div class="rrank"><b>${RANKS[ri][0]}</b><span>${nxt?Math.floor(S.xp).toLocaleString('nl-NL')+' / '+nxt[1].toLocaleString('nl-NL')+' XP':'Top bereikt'}</span></div>
    <div class="bar"><i style="width:${pct}%;background:var(--acc)"></i></div>
    <div class="rgrid">
     <div><span class="label">Energie</span><b style="color:var(--ice)">${Math.floor(S.energy)}</b><small>${full?'vol over '+full+' min':'vol'}</small></div>
     <div><span class="label">Familie</span><b style="color:${S.family?fam().col:'var(--faint)'}">${S.family?fam().m:'—'}</b><small>${S.family?fam().n:'geen'}</small></div>
     <div><span class="label">Positie</span><b>#${pos}</b><small>van ${all.length}</small></div>
    </div></section>
   <section class="rcard"><div class="label">Snelle klus</div>
    <div class="rq"><div><b>${bc.n}</b><small>${chance(bc)}% kans · ${bc.en} energie · ${fmt(bc.min)}–${fmt(bc.max)}</small></div></div>
    <button class="btn" onclick="act.crime('${bc.id}')" ${ok?'':'disabled'}>${inJail()?'Je zit vast':left?'Wacht '+Math.ceil(left/1000)+'s':S.energy<bc.en?'Te moe':'Uitvoeren'}</button></section>
   <section class="rcard grow"><div class="label">Logboek</div><div class="log">${S.log.length?S.log.slice(0,14).map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd.</div>'}</div></section>
   <section class="rcard"><div class="label">Top 5 · <a href="#rank" style="color:var(--acc)">ranglijst</a></div>
    <ol class="rtop">${all.slice(0,5).map((p,i)=>`<li class="${p.me?'me':''}"><span>${i+1}</span><b>${p.n}</b><em>${RANKS[rankIdx(p.xp)][0]}</em></li>`).join('')}</ol></section>`;
}

function renderTop(){
  const ri=rankIdx(S.xp);const jt=Math.ceil((S.jailUntil-now())/1000);const pend=window.slotPending||0;
  const nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
  $('#topbar').innerHTML=`
   <div class="chip rank"><small>Rang</small><b>${RANKS[ri][0]}</b><div class="mini"><i style="width:${pct}%;background:var(--acc)"></i></div></div>
   <div class="chip cash"><small>Contant</small><b>${fmt(S.cash-pend)}</b></div>
   <div class="chip"><small>Bank</small><b>${fmt(S.bank)}</b></div>
   <div class="chip"><small>Energie</small><b style="color:var(--ice)">${Math.floor(S.energy)}/${EN_MAX}</b><div class="mini"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div></div>
   <div class="chip"><small>Cred</small><b style="color:var(--violet)">${S.cred}</b></div>
   <div class="chip"><small>Gezondheid</small><b style="color:${S.hp>50?'var(--green)':'var(--red)'}">${S.hp}%</b></div>
   ${focusPct()?`<div class="chip"><small>Focus</small><b style="color:#ff6b7c">+${focusPct()}% · ${fmtClock(S.buffs.focus.until-now())}</b></div>`:''}
   <div class="chip"><small>Hitte</small><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}">${S.heat}%</b></div>
   <div class="status ${inJail()?'jail':S.wanted?'wanted':'free'}">${inJail()?'■ CEL · '+fmtTime(jt):S.wanted?'▲ GEZOCHT':'● VRIJ'}</div>`;
}


function cdLeft(id){return Math.max(0,(S.cd[id]||0)-now())}
const V={};
