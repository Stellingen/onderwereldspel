// Beheerdashboard: spelers zoeken, profiel bekijken en aanpassen (geld, rang, lidmaatschap, straatcredit, hulp, blokkeren, resetten).
// Werkt met dezelfde inlog als het spel. Alles gaat via /api/admin/* en wordt op de server gelogd.
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>'€'+Math.round(+v||0).toLocaleString('nl-NL');
const nl=v=>Math.round(+v||0).toLocaleString('nl-NL');
const fmtK=v=>{v=+v||0;const a=Math.abs(v);return a>=1e9?'€'+(v/1e9).toLocaleString('nl-NL',{maximumFractionDigits:1})+' mld':a>=1e6?'€'+(v/1e6).toLocaleString('nl-NL',{maximumFractionDigits:1})+' mln':a>=1e4?'€'+Math.round(v/1000)+'k':fmt(v)};
// leeftijd in seconden komt van de database (seen_s), zodat tijdzones niet uitmaken
const ago=sec=>{if(sec==null)return 'nooit';const s=Math.max(0,+sec);return s<60?'net nu':s<3600?Math.floor(s/60)+' min geleden':s<86400?Math.floor(s/3600)+' uur geleden':Math.floor(s/86400)+' dag'+(s>=172800?'en':'')+' geleden'};
const date=d=>d?new Date(d).toLocaleString('nl-NL',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'–';
const online=sec=>sec!=null&&+sec<300;
const TIERS=[['Gewoon','Geen voordeel',''],['VIP','+15% kans · wachttijden 75%','vip'],['High roller','+40% kans · wachttijden 55% · hoge inzetten','hr']];
const TOP_STEPS=[100000,150000,225000,340000,500000],SUB=5;
const rankIdx=xp=>{let i=0;RANKS.forEach((r,k)=>{if(xp>=r[1])i=k});return i};
const rankLevel=xp=>{const i=rankIdx(xp);if(i>=RANKS.length-1){let l=0;TOP_STEPS.forEach(t=>{if(xp>=t)l++});return Math.max(1,l)}const a=RANKS[i][1],b=RANKS[i+1][1];return Math.min(SUB,1+Math.floor((xp-a)/(b-a)*SUB))};
const xpFor=(i,l)=>i>=RANKS.length-1?TOP_STEPS[l-1]:Math.ceil(RANKS[i][1]+(RANKS[i+1][1]-RANKS[i][1])*(l-1)/SUB);
const famName=id=>{const f=(typeof FAMILIES!=='undefined'?FAMILIES:[]).find(x=>x.id===id);return f?f.n:id};
// "1,5m", "250k", "1.000.000", "2 mld" → getal
function parseAmt(s){s=String(s||'').trim().toLowerCase().replace(/€|\s/g,'');if(!s)return NaN;let m=1;
 const suf=s.match(/(mld|mrd|bn|b|mln|m|k)$/);if(suf){m={mld:1e9,mrd:1e9,bn:1e9,b:1e9,mln:1e6,m:1e6,k:1e3}[suf[1]];s=s.slice(0,-suf[1].length)}
 if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s))s=s.replace(/\./g,'').replace(',','.');else s=s.replace(',','.');const v=parseFloat(s);return Number.isFinite(v)?Math.round(v*m):NaN}

let TOKEN=null;try{TOKEN=localStorage.getItem('ow_token')}catch(e){}
const A={tab:'spelers',q:'',f:'',sort:'actief',list:[],stats:null,log:null,sel:null,d:null,loading:false,me:null,
 money:{field:'cash',mode:'add',amt:''},rank:{i:null,l:1},xp:'',cred:{mode:'add',amt:''},fix:{jail:true,refill:true,heat:false},ban:''};

async function api(path,opts){
 const r=await fetch(path,Object.assign({},opts,{headers:Object.assign({'Content-Type':'application/json',Authorization:'Bearer '+TOKEN},(opts&&opts.headers)||{})}));
 if(r.status===401){gate('login');throw new Error('Niet ingelogd')}
 const j=await r.json().catch(()=>({}));
 if(r.status===403&&!path.includes('/action')){gate('noadmin');throw new Error(j.error||'Geen toegang')}
 if(!r.ok)throw new Error(j.error||('Fout '+r.status));return j}
const post=(path,body)=>api(path,{method:'POST',body:JSON.stringify(body)});

function toast(t,kind){const e=document.createElement('div');e.className='a-toast '+(kind||'');e.textContent=t;$('#toasts').appendChild(e);setTimeout(()=>e.classList.add('out'),3200);setTimeout(()=>e.remove(),3700)}

function gate(kind){$('#tabs').hidden=true;$('#me').innerHTML='';
 $('#app').innerHTML=kind==='login'?`<div class="a-gate"><span class="label">Beheer</span><h1>Log eerst in</h1><p>Log in met je beheerdersaccount op de voorpagina en kom daarna terug naar deze pagina.</p><a class="a-btn" href="/?login=1">Naar inloggen</a></div>`
 :`<div class="a-gate"><span class="label">Beheer</span><h1>Geen beheerrechten</h1><p>Je bent ingelogd als <b>${esc(A.me&&A.me.username||'')}</b>, maar dit account is geen beheerder. Een beheerder zet je gebruikersnaam in Railway bij de variabele <code>ADMIN_USERS</code>, of geeft je rechten vanuit dit dashboard.</p><a class="a-btn ghost" href="/game">Terug naar het spel</a></div>`}

// ---------- laden ----------
async function loadStats(){try{A.stats=await api('/api/admin/stats');renderStats()}catch(e){}}
let qTimer=null;
async function loadList(){A.loading=true;renderList();try{const j=await api(`/api/admin/players?q=${encodeURIComponent(A.q)}&f=${A.f}&sort=${A.sort}`);A.list=j.players||[]}catch(e){toast(e.message,'bad')}A.loading=false;renderList()}
async function loadPlayer(id,keep){A.sel=id;if(!keep){A.d=null;A.rank={i:null,l:1};A.money.amt='';A.xp='';A.cred.amt='';A.ban='';
  // telefoon: profiel schuift over de lijst; de terugknop van de telefoon sluit het weer
  if(!document.body.classList.contains('show-detail')&&matchMedia('(max-width:860px)').matches)try{history.pushState({detail:id},'')}catch(e){}
  const dt=$('#detail');if(dt)dt.scrollTop=0}document.body.classList.add('show-detail');renderList();renderDetail();
 try{A.d=await api('/api/admin/player/'+id);if(A.rank.i==null&&A.d.game){A.rank.i=rankIdx(A.d.game.xp);A.rank.l=rankLevel(A.d.game.xp)}}catch(e){toast(e.message,'bad');A.d={error:e.message}}renderDetail()}
async function loadLog(){try{A.log=(await api('/api/admin/log')).log}catch(e){A.log=[]}renderLog()}

async function act(type,body,okMsg){if(A.busy)return;A.busy=true;renderDetail();
 try{const j=await post(`/api/admin/player/${A.sel}/action`,Object.assign({type},body));toast((okMsg||'Gelukt')+(j.detail?': '+j.detail:''),'ok');
  await loadPlayer(A.sel,true);loadList();loadStats();if(A.log)loadLog()}
 catch(e){toast(e.message,'bad')}A.busy=false;renderDetail()}

// ---------- weergave ----------
function shell(){$('#tabs').hidden=false;$('#me').innerHTML=`<span class="a-dot"></span><span>${esc(A.me.username)}</span><a href="/game" class="a-btn ghost sm"><span class="lg">Naar het spel</span><span class="sm">Spel</span></a>`;
 document.querySelectorAll('#tabs button').forEach(b=>{b.onclick=()=>{A.tab=b.dataset.tab;document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x===b));layout()}});layout()}
function layout(){
 if(A.tab==='log'){document.body.classList.remove('show-detail');$('#app').innerHTML=`<section class="a-logpage"><div class="a-h"><h1>Logboek</h1><span>Alles wat beheerders hebben aangepast, nieuwste bovenaan</span></div><div id="logList" class="a-log"></div></section>`;renderLog();if(!A.log)loadLog();return}
 $('#app').innerHTML=`<section class="a-stats" id="stats"></section>
  <div class="a-split"><section class="a-listcol"><div class="a-search"><input id="q" type="search" placeholder="Zoek een speler op naam" autocomplete="off" value="${esc(A.q)}">
   <div class="a-filters" id="filters"></div></div><div id="list" class="a-list"></div></section>
   <section class="a-detail" id="detail"></section></div>`;
 const q=$('#q');q.oninput=()=>{A.q=q.value;clearTimeout(qTimer);qTimer=setTimeout(loadList,250)};
 renderStats();renderFilters();renderList();renderDetail()}
function renderStats(){const el=$('#stats');if(!el)return;const c=A.stats&&A.stats.counts;
 const t=(l,v,s,cls)=>`<div class="a-tile ${cls||''}"><span class="label">${l}</span><b>${v}</b>${s?`<small>${s}</small>`:''}</div>`;
 el.innerHTML=c?[t('Spelers',nl(c.users),`${nl(c.new24)} nieuw in 24 uur`),t('Online',nl(c.online),'laatste 15 minuten','live'),t('Actief',nl(c.active24),'laatste 24 uur'),
  t('VIP',nl(c.vip),'lidmaatschap','vip'),t('High roller',nl(c.hr),'lidmaatschap','hr'),t('Geblokkeerd',nl(c.banned),'',+c.banned?'bad':''),t('Geld in het spel',fmtK(c.money),'contant + bank')].join('')
  :Array(7).fill('<div class="a-tile sk"></div>').join('')}
function renderFilters(){const el=$('#filters');if(!el)return;
 const F=[['','Alle'],['vip','VIP'],['hr','High roller'],['banned','Geblokkeerd'],['admin','Beheerders']],SO=[['actief','Laatst actief'],['xp','Hoogste rang'],['geld','Meeste geld'],['nieuw','Nieuwste'],['naam','Naam']];
 el.innerHTML=`<div class="a-chips">${F.map(([k,l])=>`<button class="${A.f===k?'on':''}" data-f="${k}">${l}</button>`).join('')}</div>
  <label class="a-sort"><span>Sorteren</span><select id="sort">${SO.map(([k,l])=>`<option value="${k}" ${A.sort===k?'selected':''}>${l}</option>`).join('')}</select></label>`;
 el.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{A.f=b.dataset.f;renderFilters();loadList()});$('#sort').onchange=e=>{A.sort=e.target.value;loadList()}}
const tag=t=>t===2?'<i class="tg hr">HIGH ROLLER</i>':t===1?'<i class="tg vip">VIP</i>':'';
function renderList(){const el=$('#list');if(!el)return;
 if(A.loading&&!A.list.length){el.innerHTML='<div class="a-empty">Spelers laden…</div>';return}
 if(!A.list.length){el.innerHTML=`<div class="a-empty">${A.q?'Geen speler gevonden met "'+esc(A.q)+'"':'Nog geen spelers'}</div>`;return}
 el.innerHTML=A.list.map(p=>`<button class="a-row ${A.sel===p.id?'on':''} ${p.banned?'banned':''}" data-id="${p.id}">
  <span class="a-av">${esc(p.display).slice(0,1).toUpperCase()}${online(p.seen_s)?'<i class="on"></i>':''}</span>
  <span class="a-rn"><b>${esc(p.display)}${tag(p.tier)}${p.admin?'<i class="tg adm">BEHEER</i>':''}${p.banned?'<i class="tg ban">GEBLOKKEERD</i>':''}</b>
   <small>${p.rankname?esc(p.rankname)+' · '+nl(p.xp)+' XP · '+(online(p.seen_s)?'<em>online</em>':ago(p.seen_s)):'Nog niet gespeeld'}</small></span>
  <span class="a-rm">${p.networth!=null?fmtK(p.networth):'–'}</span></button>`).join('');
 el.querySelectorAll('.a-row').forEach(b=>b.onclick=()=>loadPlayer(+b.dataset.id))}

function seg(name,opts,cur){return `<div class="a-seg" data-seg="${name}">${opts.map(([v,l])=>`<button class="${cur===v?'on':''}" data-v="${v}">${l}</button>`).join('')}</div>`}
function renderDetail(){const el=$('#detail');if(!el)return;
 if(!A.sel){el.innerHTML=`<div class="a-pick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg><b>Kies een speler</b><span>Zoek links op naam of klik op een speler om zijn profiel te bekijken en aan te passen.</span></div>`;return}
 const d=A.d;if(!d){el.innerHTML='<div class="a-pick"><b>Profiel laden…</b></div>';return}
 if(d.error){el.innerHTML=`<div class="a-pick"><b>Kon niet laden</b><span>${esc(d.error)}</span><button class="a-btn ghost sm" id="back">Terug</button></div>`;$('#back').onclick=closeDetail;return}
 const p=d.player,g=d.game,s=d.s,played=!!(g&&s),busy=A.busy?'disabled':'';
 const ri=played?rankIdx(s.xp):0,jail=played&&s.jailUntil>Date.now();
 const kv=(l,v,sub,cls)=>`<div class="a-kv ${cls||''}"><span>${l}</span><b>${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
 const {mCur,mAfter,cAfter}=previews(),rXp=A.rank.i!=null?xpFor(A.rank.i,A.rank.l):null;
 el.innerHTML=`<div class="a-dhead"><button class="a-back" id="back" aria-label="Terug naar de lijst"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>Spelers</button>
  <div class="a-who"><span class="a-av big">${esc(p.display).slice(0,1).toUpperCase()}${g&&online(g.seen_s)?'<i class="on"></i>':''}</span>
   <div><h2>${esc(p.display)}${tag(p.tier)}${p.admin?'<i class="tg adm">BEHEER</i>':''}${p.banned?'<i class="tg ban">GEBLOKKEERD</i>':''}</h2>
   <p>${played?`${esc(RANKS[ri][0])} · level ${rankLevel(s.xp)}/5 · ${nl(s.xp)} XP`:g&&g.reset?'Gereset, begint opnieuw bij de volgende keer openen':'Heeft nog niet gespeeld'}</p>
   <p class="mute">Lid sinds ${date(p.created_at)} · ${g?(online(g.seen_s)?'<em>nu online</em>':'laatst actief '+ago(g.seen_s)):'nooit actief'} · id ${p.id}${g&&g.kicked?' · <span class="warn">spel moet herladen</span>':''}</p>
   ${p.banned&&p.ban_reason?`<p class="bad">Reden blokkade: ${esc(p.ban_reason)}</p>`:''}</div></div></div>
  ${played?`<div class="a-kvs">${kv('Contant',fmt(s.cash))}${kv('Spaarrekening',fmt(s.bank))}${kv('Deposito\'s en beleggen',fmt(s.bankExtra))}${kv('Straatcredit',nl(s.cred))}
   ${kv('Energie / gezondheid',nl(s.energy)+' / '+nl(s.hp)+'%')}${kv('Hitte',nl(s.heat)+'%',s.wanted?'gezocht door de politie':'',s.heat>60?'bad':'')}${kv('Cel',jail?'Zit vast':'Vrij',jail?'nog '+Math.ceil((s.jailUntil-Date.now())/60000)+' min':'',jail?'bad':'')}
   ${kv('Familie',s.family?esc(famName(s.family)):'Geen',s.family?nl(s.famEer)+' eer':'')}${kv('Bedrijven',nl(s.units)+' vestigingen',s.kas?'kas '+fmt(s.kas):'')}${kv('Casino',fmtK((s.stats&&s.stats.won)||0)+' gewonnen',fmtK((s.stats&&s.stats.lost)||0)+' verloren')}</div>`:''}
  <div class="a-cards">
  ${played?`<section class="a-card"><h3>Geld</h3>
   ${seg('mfield',[['cash','Contant'],['bank','Spaarrekening']],A.money.field)}${seg('mmode',[['add','Erbij'],['sub','Eraf'],['set','Op bedrag zetten']],A.money.mode)}
   <div class="a-amt"><span>€</span><input id="mAmt" inputmode="decimal" placeholder="bijv. 250k, 1,5m of 2.000.000" value="${esc(A.money.amt)}"></div>
   <div class="a-quick">${[[1e4,'10k'],[1e5,'100k'],[1e6,'1 mln'],[1e7,'10 mln'],[1e8,'100 mln']].map(([v,l])=>`<button data-q="${v}">${l}</button>`).join('')}</div>
   <div class="a-prev" id="mPrev">${mPrevHtml(mCur,mAfter)}</div>
   <button class="a-btn" id="mGo" ${busy} ${mAfter==null?'disabled':''}>${A.money.mode==='set'?'Saldo zetten':A.money.mode==='sub'?'Afschrijven':'Bijschrijven'}</button></section>
  <section class="a-card"><h3>Rang</h3><div class="a-ranks">${RANKS.map((r,i)=>`<button class="${A.rank.i===i?'on':''} ${i===ri?'cur':''}" data-r="${i}"><b>${esc(r[0])}</b><small>${nl(r[1])} XP</small></button>`).join('')}</div>
   <div class="a-lv"><span>Level</span>${[1,2,3,4,5].map(l=>`<button class="${A.rank.l===l?'on':''}" data-l="${l}">${l}</button>`).join('')}</div>
   <div class="a-prev">${rXp!=null?`${nl(s.xp)} XP <i>→</i> <b>${nl(rXp)} XP</b> · ${esc(RANKS[A.rank.i][0])} level ${A.rank.l}`:''}</div>
   <button class="a-btn" id="rGo" ${busy} ${rXp==null||rXp===s.xp?'disabled':''}>Rang zetten</button>
   <div class="a-inline"><input id="xpAmt" inputmode="numeric" placeholder="XP erbij, bijv. 500" value="${esc(A.xp)}"><button class="a-btn ghost" id="xpGo" ${busy} ${Number.isFinite(parseAmt(A.xp))?'':'disabled'}>XP erbij</button></div></section>`:''}
  <section class="a-card"><h3>Lidmaatschap</h3><div class="a-tiers">${TIERS.map(([n,sub,c],t)=>`<button class="${c} ${p.tier_raw!=null&&p.tier===t?'on':p.tier_raw==null&&p.tier===t?'auto':''}" data-t="${t}" ${busy}><b>${n}</b><small>${sub}</small></button>`).join('')}</div>
   <p class="a-note">${p.tier_raw==null?`Staat op automatisch: ${p.tier===1?'telt als VIP door de VIP-code':'geen VIP-code gebruikt'}.`:`Vast ingesteld door een beheerder.`} De speler ziet de wijziging na herladen (gebeurt vanzelf).${p.tier_raw!=null?' <button class="a-link" id="tAuto">Terug naar automatisch</button>':''}</p></section>
  ${played?`<section class="a-card"><h3>Straatcredit</h3>${seg('cmode',[['add','Erbij'],['sub','Eraf'],['set','Op aantal zetten']],A.cred.mode)}
   <div class="a-inline"><input id="cAmt" inputmode="numeric" placeholder="aantal" value="${esc(A.cred.amt)}"><button class="a-btn" id="cGo" ${busy} ${cAfter==null?'disabled':''}>Opslaan</button></div>
   <div class="a-prev" id="cPrev">${cPrevHtml(s.cred,cAfter)}</div></section>
  <section class="a-card"><h3>Hulp</h3><div class="a-checks">
   <label><input type="checkbox" data-fix="jail" ${A.fix.jail?'checked':''}><span><b>Uit de cel</b><small>ook niet meer gezocht</small></span></label>
   <label><input type="checkbox" data-fix="refill" ${A.fix.refill?'checked':''}><span><b>Energie en gezondheid vol</b><small>bij het volgende openen</small></span></label>
   <label><input type="checkbox" data-fix="heat" ${A.fix.heat?'checked':''}><span><b>Hitte naar 0</b><small>nu ${nl(s.heat)}%</small></span></label></div>
   <button class="a-btn" id="fGo" ${busy} ${A.fix.jail||A.fix.refill||A.fix.heat?'':'disabled'}>Uitvoeren</button></section>`:''}
  <section class="a-card"><h3>Account</h3><div class="a-acts">
   <button class="a-btn ghost" id="kGo" ${busy} ${g?'':'disabled'}><b>Spel herladen</b><small>logt de speler uit op zijn apparaat</small></button>
   <button class="a-btn ghost" id="aGo" ${busy} ${p.envAdmin||p.id===A.me.id?'disabled':''}><b>${p.admin?'Beheerrechten afnemen':'Beheerder maken'}</b><small>${p.envAdmin?'vast via ADMIN_USERS':p.id===A.me.id?'dit ben jij':'toegang tot dit dashboard'}</small></button>
   ${p.banned?`<button class="a-btn ghost" id="ubGo" ${busy}><b>Blokkade opheffen</b><small>speler kan weer inloggen</small></button>`
   :`<div class="a-ban"><input id="banR" placeholder="Reden (optioneel)" maxlength="200" value="${esc(A.ban)}"><button class="a-btn red" id="bGo" ${busy} ${p.id===A.me.id?'disabled':''}>Blokkeren</button></div>`}
   <button class="a-btn red ghost" id="xGo" ${busy}><b>Account resetten</b><small>alles terug naar het begin</small></button></div></section>
  <section class="a-card wide"><h3>Gebruikte codes <span class="mute">${d.codes.length}</span></h3>${d.codes.length?`<div class="a-codes">${d.codes.map(c=>`<span><b>${esc(c.code)}</b>${fmtK(c.amount)}</span>`).join('')}</div>`:'<p class="a-note">Nog geen codes gebruikt.</p>'}</section>
  <section class="a-card wide"><h3>Aanpassingen door beheer</h3>${d.log.length?`<div class="a-log">${d.log.map(l=>logRow(l,true)).join('')}</div>`:'<p class="a-note">Nog niets aangepast.</p>'}</section>
  </div>`;
 bindDetail()}
const ACT_NAME={money:'Geld',xp:'Rang / XP',cred:'Straatcredit',fix:'Hulp',tier:'Lidmaatschap',ban:'Blokkade',admin:'Beheer',reset:'Reset',kick:'Herladen'};
function logRow(l,mine){return `<div class="a-lrow"><span class="a-lt ${l.action}">${ACT_NAME[l.action]||esc(l.action)}</span><div><b>${mine?'':`<button class="a-link" data-open="${l.target_id}">${esc(l.target||'?')}</button> · `}${esc(l.detail||'')}</b><small>${esc(l.admin||'?')} · ${date(l.created_at)}</small></div></div>`}
function renderLog(){const el=$('#logList');if(!el)return;if(!A.log){el.innerHTML='<div class="a-empty">Laden…</div>';return}
 el.innerHTML=A.log.length?A.log.map(l=>logRow(l)).join(''):'<div class="a-empty">Nog geen aanpassingen</div>';
 el.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{A.tab='spelers';document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab==='spelers'));layout();loadPlayer(+b.dataset.open)})}

// voorbeeld "nu → straks" bij geld en straatcredit (bij typen alleen dit stukje bijwerken, zodat het toetsenbord blijft staan)
function previews(){const s=A.d&&A.d.s;if(!s)return {mCur:0,mAfter:null,cAfter:null};
 const mAmt=parseAmt(A.money.amt),mCur=+s[A.money.field]||0,mAfter=Number.isFinite(mAmt)?Math.max(0,A.money.mode==='set'?mAmt:mCur+(A.money.mode==='sub'?-1:1)*mAmt):null;
 const cAmt=parseAmt(A.cred.amt),cAfter=Number.isFinite(cAmt)?Math.max(0,A.cred.mode==='set'?cAmt:s.cred+(A.cred.mode==='sub'?-cAmt:cAmt)):null;
 return {mCur,mAfter,cAfter}}
const mPrevHtml=(cur,after)=>after!=null?`${fmt(cur)} <i>→</i> <b>${fmt(after)}</b>`:`Nu ${fmt(cur)}`;
const cPrevHtml=(cur,after)=>after!=null?`${nl(cur)} <i>→</i> <b>${nl(after)}</b>`:`Nu ${nl(cur)}`;
function refreshPrev(){const {mCur,mAfter,cAfter}=previews(),s=A.d&&A.d.s;if(!s)return;const set=(id,h)=>{const e=$('#'+id);if(e)e.innerHTML=h},dis=(id,v)=>{const e=$('#'+id);if(e)e.disabled=v||A.busy};
 set('mPrev',mPrevHtml(mCur,mAfter));dis('mGo',mAfter==null);set('cPrev',cPrevHtml(s.cred,cAfter));dis('cGo',cAfter==null);dis('xpGo',!Number.isFinite(parseAmt(A.xp)))}
function closeDetail(fromPop){if(fromPop!==true&&history.state&&history.state.detail){history.back();return}document.body.classList.remove('show-detail');A.sel=null;A.d=null;renderList();renderDetail()}
function bindDetail(){const el=$('#detail'),p=A.d&&A.d.player;const on=(id,f)=>{const e=el.querySelector('#'+id);if(e)e.onclick=f};
 on('back',closeDetail);
 el.querySelectorAll('[data-seg]').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=sg.dataset.seg,v=b.dataset.v;
  if(k==='mfield')A.money.field=v;else if(k==='mmode')A.money.mode=v;else if(k==='cmode')A.cred.mode=v;renderDetail()}));
 const live=(id,set)=>{const e=el.querySelector('#'+id);if(!e)return;e.oninput=()=>{set(e.value);refreshPrev()};e.onkeydown=k=>{if(k.key==='Enter'){const b=(e.closest('.a-inline')||e.closest('.a-card')).querySelector('.a-btn');b&&!b.disabled&&b.click()}}};
 live('mAmt',v=>A.money.amt=v);live('xpAmt',v=>A.xp=v);live('cAmt',v=>A.cred.amt=v);
 const br=el.querySelector('#banR');if(br)br.oninput=()=>{A.ban=br.value};
 el.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const cur=parseAmt(A.money.amt);A.money.amt=String((Number.isFinite(cur)&&A.money.mode!=='set'?cur:0)+(+b.dataset.q));renderDetail()});
 el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{A.rank.i=+b.dataset.r;A.rank.l=1;renderDetail()});
 el.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{A.rank.l=+b.dataset.l;renderDetail()});
 el.querySelectorAll('[data-fix]').forEach(c=>c.onchange=()=>{A.fix[c.dataset.fix]=c.checked;renderDetail()});
 on('mGo',()=>{const a=parseAmt(A.money.amt);if(!Number.isFinite(a))return;const m=A.money.mode,amt=m==='sub'?-a:a;
  const big=Math.abs(a)>=1e9;const go=()=>act('money',{field:A.money.field,mode:m==='set'?'set':'add',amount:amt},'Saldo aangepast').then(()=>{A.money.amt='';renderDetail()});
  big?confirmDlg('Groot bedrag',`Weet je zeker dat je ${fmt(a)} wilt ${m==='set'?'instellen':m==='sub'?'afschrijven':'bijschrijven'}?`,'Ja, doorgaan',go):go()});
 on('rGo',()=>act('xp',{mode:'set',amount:xpFor(A.rank.i,A.rank.l),rank:RANKS[A.rank.i][0]+' (level '+A.rank.l+')'},'Rang gezet'));
 on('xpGo',()=>{const a=parseAmt(A.xp);if(Number.isFinite(a))act('xp',{mode:'add',amount:a},'XP aangepast').then(()=>{A.xp='';A.rank.i=null;loadPlayer(A.sel,true)})});
 on('cGo',()=>{const a=parseAmt(A.cred.amt);if(!Number.isFinite(a))return;act('cred',{mode:A.cred.mode==='set'?'set':'add',amount:A.cred.mode==='sub'?-a:a},'Straatcredit aangepast').then(()=>{A.cred.amt='';renderDetail()})});
 on('fGo',()=>act('fix',A.fix,'Geholpen'));
 el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=+b.dataset.t;if(p.tier_raw!=null&&p.tier===t)return;act('tier',{tier:t},'Lidmaatschap aangepast')});
 on('tAuto',()=>act('tier',{tier:null},'Lidmaatschap'));
 on('kGo',()=>act('kick',{},'Gedaan'));
 on('aGo',()=>confirmDlg(p.admin?'Beheerrechten afnemen':'Beheerder maken',p.admin?`${p.display} kan daarna niet meer in dit dashboard.`:`${p.display} krijgt toegang tot dit dashboard en kan spelers aanpassen.`,p.admin?'Afnemen':'Beheerder maken',()=>act('admin',{on:!p.admin},'Beheer')));
 on('bGo',()=>confirmDlg('Speler blokkeren',`${p.display} wordt meteen uitgelogd, kan niet meer inloggen en verdwijnt uit de ranglijst.${A.ban?' Reden: '+A.ban:''}`,'Blokkeren',()=>act('ban',{on:true,reason:A.ban},'Geblokkeerd'),'red'));
 on('ubGo',()=>act('ban',{on:false},'Blokkade'));
 on('xGo',()=>resetDlg(p))}

// ---------- dialogen ----------
function dlg(html,bind){const d=$('#dlg');d.hidden=false;d.innerHTML=`<div class="a-dlg" role="dialog" aria-modal="true">${html}</div>`;
 const close=()=>{d.hidden=true;d.innerHTML='';document.removeEventListener('keydown',k)};const k=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',k);
 d.onclick=e=>{if(e.target===d)close()};d.querySelectorAll('[data-x]').forEach(b=>b.onclick=close);bind&&bind(d,close)}
function confirmDlg(t,m,ok,f,cls){dlg(`<h3>${esc(t)}</h3><p>${esc(m)}</p><div class="a-dlg-b"><button class="a-btn ghost" data-x>Annuleren</button><button class="a-btn ${cls||''}" id="dOk">${esc(ok)}</button></div>`,(d,close)=>{d.querySelector('#dOk').onclick=()=>{close();f()}})}
function resetDlg(p){dlg(`<h3>Account resetten</h3><p>Alles van <b>${esc(p.display)}</b> gaat terug naar het begin: geld, rang, bedrijven, uitrusting, familie en training. Dit kun je niet ongedaan maken. De speler wordt meteen uitgelogd en begint opnieuw.</p>
  <label class="a-chk"><input type="checkbox" id="rCodes"><span>Ook gebruikte codes vrijgeven (dan kan hij ze opnieuw inwisselen)</span></label>
  <label class="a-type"><span>Typ <b>${esc(p.display)}</b> om te bevestigen</span><input id="rName" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
  <div class="a-dlg-b"><button class="a-btn ghost" data-x>Annuleren</button><button class="a-btn red" id="rOk" disabled>Resetten</button></div>`,(d,close)=>{
  const n=d.querySelector('#rName'),b=d.querySelector('#rOk');n.focus();n.oninput=()=>{b.disabled=n.value.trim().toLowerCase()!==String(p.display).toLowerCase()};
  b.onclick=()=>{const codes=d.querySelector('#rCodes').checked;close();A.rank.i=null;act('reset',{codes},'Gereset')}})}

// ---------- start ----------
(async function(){
 if(!TOKEN){gate('login');return}
 try{const r=await fetch('/api/me',{headers:{Authorization:'Bearer '+TOKEN}});if(r.status===401){gate('login');return}if(r.status===403){gate('noadmin');return}
  A.me=await r.json();if(!A.me.admin){gate('noadmin');return}}catch(e){$('#app').innerHTML='<div class="a-gate"><h1>Server niet bereikbaar</h1><p>Probeer het zo nog eens.</p></div>';return}
 // eigen id: uit het token (alleen voor de knoppen; de server controleert alles zelf)
 try{A.me.id=JSON.parse(atob(TOKEN.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).id}catch(e){}
 shell();loadStats();loadList();
 setInterval(()=>{if(document.visibilityState==='visible'&&A.tab==='spelers'){loadStats()}},30000);
 window.addEventListener('popstate',()=>{if(document.body.classList.contains('show-detail'))closeDetail(true)});
})();
})();
