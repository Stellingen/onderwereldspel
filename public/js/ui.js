// Navigatie, iconen en de statusbalk bovenaan
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ICONS={
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
const PAGES=[['dash','Dashboard'],['crimes','Misdaden'],['cars','Auto\'s'],['casino','Casino'],['biz','Bezit'],['shop','Wapens'],['skills','Skills'],['bank','Bank'],['fam','Families'],['jail','Bajes'],['rank','Ranglijst']];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
let page=(location.hash||'#dash').slice(1);if(!PAGES.find(p=>p[0]===page))page='dash';
let casinoTab='bj',rankTab='xp',slotState=['7','7','7'],spinning=false;

function renderNav(){
  $('#nav').innerHTML=`<a class="brand" href="/" style="text-decoration:none;color:inherit"><span class="mark">O</span><span><b>Onderwereld</b><small>${window.__USER__?esc(window.__USER__):'Offline modus'}</small></span></a>`
   +PAGES.map(([k,n])=>`<a class="navlink ${k===page?'on':''}" href="#${k}">${svg(k)}${n}${k==='jail'&&inJail()?'<span class="badge">!</span>':''}</a>`).join('')
   +(window.__TOKEN__?`<div class="navspace"></div><button class="navlink logout" onclick="logout()">${svg('logout')}Uitloggen</button>`:'');
}
function renderTop(){
  const ri=rankIdx(S.xp);const jt=Math.ceil((S.jailUntil-now())/1000);
  $('#topbar').innerHTML=`
   <div class="chip rank"><small>Rang</small><b>${RANKS[ri][0]}</b></div>
   <div class="chip cash"><small>Contant</small><b>${fmt(S.cash)}</b></div>
   <div class="chip"><small>Bank</small><b>${fmt(S.bank)}</b></div>
   <div class="chip"><small>Straatcredit</small><b style="color:var(--violet)">${S.cred}</b></div>
   <div class="chip"><small>Gezondheid</small><b style="color:${S.hp>50?'var(--green)':'var(--red)'}">${S.hp}%</b></div>
   <div class="chip"><small>Politie-hitte</small><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--gold)':'var(--fg)'}">${S.heat}%</b></div>
   <div class="status ${inJail()?'jail':S.wanted?'wanted':'free'}">${inJail()?'IN DE BAJES · '+fmtTime(jt):S.wanted?'⚠ GEZOCHT DOOR POLITIE':'● VRIJ OP STRAAT'}</div>`;
}

function cdLeft(id){return Math.max(0,(S.cd[id]||0)-now())}
const V={};
