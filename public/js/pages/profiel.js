// Tab: Profiel — dossier, statistieken en codes inwisselen
let redeemMsg=null;
V.profiel=()=>{
 const ri=rankIdx(S.xp),nxt=RANKS[ri+1],pct=nxt?(S.xp-RANKS[ri][1])/(nxt[1]-RANKS[ri][1])*100:100;
 const since=window.__SINCE__?new Date(window.__SINCE__).toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):null;
 const used=S.redeemed||[];
 const st=S.stats;
 const tile=(l,v,c)=>`<div class="pf-tile"><span class="label">${l}</span><b style="${c?'color:'+c:''}">${v}</b></div>`;
 return `<h1>Profiel</h1>
 <div class="pf">
  <section class="card hud pf-id">
   <div class="pf-mug">${esc(S.name).slice(0,1).toUpperCase()}</div>
   <div class="pf-main"><div class="label">${window.__TOKEN__?'Account':'Offline speler'}${since?' · lid sinds '+since:''}</div>
    <div class="pf-name">${esc(S.name)}${vipTag()}</div>${isVip()?`<div class="pf-vip ${isHR()?'hr':''}">${lidName()} · ${Math.round(tierK()*100)}% meer slaagkans, straatcredit en bankrente · wachttijden ${Math.round(waitK()*100)}% · +${Math.round(tierLoot()*100)}% buit · makkelijker vluchten en ontsnappen · ${isHR()?'anderhalf keer zoveel ':''}cashback op elke casino-inzet · in de slots vaker de bonus${isHR()?' · hoge inzetten':''}</div>`:''}
    <div class="pf-rank"><b>${RANKS[ri][0]} ${rankStars(S.xp)}</b><span>${nxt?Math.floor(S.xp).toLocaleString('nl-NL')+' / '+nxt[1].toLocaleString('nl-NL')+' XP':'Hoogste rang'}</span></div>
    <div class="bar"><i style="width:${pct}%;background:var(--sec)"></i></div>
    <div class="pf-lvl">${rankLvlInfo()}</div>
    <div class="pf-fam">${S.family?`<span class="crest" style="color:${fam().col};width:34px;height:38px;font-size:14px">${fam().m}</span>${fam().n}<em>${FAM_RANKS[famRankIdx()][0]}</em>`:'Nog geen familie'}</div>
    <div class="pf-dos">
     <a href="#skills"><span class="label">Skills</span><b>${TRAININGS.reduce((a,t)=>a+(S.skills[t.id]||0),0)}</b><small>levels training</small></a>
     <a href="#shop"><span class="label">Uitrusting</span><b>+${gearBonus()}%</b><small>slaagkans · vuurkracht ${gearVk()}</small></a>
     <a href="#biz"><span class="label">Bezit</span><b>${fmt(income())}</b><small>per speldag (4 uur)</small></a>
     <a href="#bank"><span class="label">Bank</span><b>${fmt(bankNet())}</b><small>sparen, deposito's, beleggen</small></a>
     <a href="#verblijf"><span class="label">Woning</span><b>${home().n}</b><small>${home().place}</small></a>
     <a href="#crimes"><span class="label">Buit</span><b>×${lootMult().toLocaleString('nl-NL',{maximumFractionDigits:2})}</b><small>op elke klus</small></a>
    </div>
   </div>
  </section>
  <section class="card pf-redeem">
   <h3>Code inwisselen</h3>
   <p class="sub" style="margin:0 0 12px">Heb je een code gekregen? Vul hem hier in. Elke code werkt één keer per account.</p>
   <form class="pf-form" onsubmit="event.preventDefault();act.redeem(document.getElementById('codeIn').value)">
    <input id="codeIn" class="input" value="${esc(window._codeIn||'')}" oninput="window._codeIn=this.value" placeholder="Bijvoorbeeld: WELKOM" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" aria-label="Code">
    <button class="btn" type="submit" id="codeBtn">Inwisselen</button>
   </form>
   ${redeemMsg?`<div class="pf-msg ${redeemMsg.ok?'ok':'bad'}">${esc(redeemMsg.t)}</div>`:''}
   <div class="label" style="margin-top:16px">Rangbeloningen · klik om te claimen</div>
   <div class="rcodes">${RANKS.slice(1).map((r,i)=>{const k=r[0].toLowerCase(),got=used.includes(k),open=rankIdx(S.xp)>=i+1;
     return open&&!got?`<button class="rcode open" onclick="act.redeem('${k}')"><span>${r[0]}</span><b>Claim ${fmt(RANK_CODES[k])}</b></button>`
       :`<div class="rcode ${got?'got':''}"><span>${r[0]}</span><b>${got?'✓ '+fmt(RANK_CODES[k])+' geclaimd':'🔒 '+fmt(RANK_CODES[k])}</b></div>`}).join('')}</div>
   <div class="label" style="margin-top:16px">Gebruikte codes</div>
   <div class="pf-used">${used.length?used.map(c=>`<span class="chipline" style="--c:var(--green)">${esc(codeShow(c))} ✓</span>`).join(''):'<span style="color:var(--faint);font-size:13px">Nog geen codes gebruikt.</span>'}</div>
  </section>
  <section class="card pf-stats"><h3>Carrière</h3>
   <div class="pf-tiles">
    ${tile('Vermogen',fmt(S.cash+bankNet()+S.cars.reduce((a,c)=>a+c.v,0)),'var(--acc)')}
    ${tile('Geslaagde klussen',st.crimes)}
    ${tile('Mislukt',st.fails,'var(--red)')}
    ${tile('Gevlucht',st.fled||0,'var(--green)')}
    ${tile('Auto\'s gestolen',st.cars)}
    ${tile('Straatcredit',S.cred,'var(--violet)')}
    ${tile('Casino +/−',(st.won-st.lost>=0?'+':'−')+fmt(Math.abs(st.won-st.lost)),st.won-st.lost>=0?'var(--green)':'var(--red)')}
    ${tile('Politiecontroles',st.raids||0)}
   </div>
  </section>
  ${window.__TOKEN__?`<section class="card pf-priv"><h3>Zichtbaarheid</h3>
   <label class="pv-switch"><input type="checkbox" ${window.__PUB__?'checked':''} onchange="pvSetPublic(this.checked)"><i></i><span><b>${window.__PUB__?'Openbaar profiel':'Privé profiel'}</b><small>${window.__PUB__?'Andere spelers zien je vermogen, familie, outfit en wat je hebt bereikt.':'Anderen zien alleen je naam en rang op de ranglijst. Zet het aan om meer te laten zien.'}</small></span></label>
   <p class="pf-note">Beheerders kunnen elk profiel inzien, ook als het privé is.</p>
   <button class="btn ghost" onclick="pvShow(window.__USER__)">Bekijk zoals anderen het zien</button></section>`:''}
  ${window.__TOKEN__?`<section class="card pf-acc"><h3>Account</h3><p class="sub" style="margin:0 0 12px">Je voortgang wordt automatisch opgeslagen op je account.</p><button class="btn ghost" onclick="logout()">Uitloggen</button></section>`:''}
 </div>`;
};

// ---------- Profielen van andere spelers (vanuit de ranglijst) ----------
// Standaard privé. Openbaar: vermogen, familie, woning, outfit en prestaties. Beheerders zien alles, ook bij een privé profiel.
function pvClose(){const o=document.getElementById('pvOv');if(o){o.classList.add('out');setTimeout(()=>o.remove(),160)}document.removeEventListener('keydown',pvKey)}
function pvKey(e){if(e.key==='Escape')pvClose()}
function pvOpen(html){let o=document.getElementById('pvOv');if(!o){o=document.createElement('div');o.id='pvOv';o.className='pv-ov';o.addEventListener('click',e=>{if(e.target===o)pvClose()});document.body.appendChild(o);document.addEventListener('keydown',pvKey)}
 o.innerHTML=`<div class="pv-box" role="dialog" aria-modal="true" aria-labelledby="pvT"><button class="pv-x" onclick="pvClose()" aria-label="Sluiten">✕</button>${html}</div>`;const x=o.querySelector('.pv-x');if(x)x.focus({preventScroll:true})}
const pvAgo=s=>s==null?'nooit actief':s<300?'nu online':s<3600?Math.round(s/60)+' min geleden actief':s<86400?Math.round(s/3600)+' uur geleden actief':Math.round(s/86400)+' dagen geleden actief';
const pvLock=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 018 0v3M12 14.5v2.5"/></svg>`;
function pvHead(name,xp,tagH,sub,extra){const ri=rankIdx(xp);return `<div class="pv-who"><span class="label">Profiel</span><h2 id="pvT">${esc(name)}${tagH||''}</h2>
  <div class="pv-rank"><b>${RANKS[ri][0]}</b><span>lv ${rankLevel(xp)}</span><em>${Math.floor(xp).toLocaleString('nl-NL')} XP</em></div>${sub?`<p>${sub}</p>`:''}${extra||''}</div>`}
function pvNpc(i){const n=S.npcs[i];if(!n)return;pvOpen(`<div class="pv-head solo">${pvHead(n.n,n.xp,'','Rivaal uit de onderwereld')}</div><div class="pv-lock">${pvLock}<b>Dit profiel is privé</b><span>Van rivalen weet je alleen de naam en de rang.</span></div>`)}
function pvShow(name){if(!name)return;pvOpen('<div class="pv-load">Profiel laden…</div>');
 const h=window.__TOKEN__?{Authorization:'Bearer '+window.__TOKEN__}:{};
 fetch('/api/profile/'+encodeURIComponent(String(name).toLowerCase()),{headers:h}).then(r=>r.json().then(j=>({ok:r.ok,j}))).then(({ok,j})=>{
  if(!document.getElementById('pvOv'))return;if(!ok||j.error){pvOpen(`<div class="pv-load">${esc(j.error||'Kon het profiel niet laden')}</div>`);return}
  const tagH=typeof playerTags==='function'?playerTags(j.tier):'';
  if(j.private){pvOpen(`<div class="pv-head solo">${pvHead(j.name,j.xp,tagH)}</div><div class="pv-lock">${pvLock}<b>Dit profiel is privé</b><span>${esc(j.name)} laat alleen de naam en de rang zien.</span></div>`);return}
  const p=j.p||{},since=j.since?new Date(j.since).toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}):'';
  const F=p.family?FAMILIES.find(f=>f.id===p.family):null;let fr='';if(F&&typeof FAM_RANKS!=='undefined'){const t=FAMILIES.indexOf(F);let r=0;FAM_RANKS.forEach((x,i)=>{if(!x[2]&&(p.famEer||0)>=Math.round(x[1]*(1+t*.5)))r=i});const top=FAM_RANKS.findIndex(x=>x[2])-1;if(top>=0&&r>=top&&p.famLead)r=Math.min(FAM_RANKS.length-1,top+p.famLead);fr=FAM_RANKS[r][0]}
  const H=typeof HOMES!=='undefined'&&p.home?HOMES.find(x=>x.id===p.home):null,st=p.stats||{},net=(j.networth||0);
  const note=j.own?`<div class="pv-note">${j.public?'Zo zien andere spelers je profiel.':'Je profiel is privé: anderen zien alleen je naam en rang. Hieronder zie je wat ze zouden zien als je het openbaar zet.'} <button class="pv-tg" onclick="pvSetPublic(${!j.public});pvClose()">${j.public?'Zet op privé':'Zet openbaar'}</button></div>`
   :j.admin&&!j.public?`<div class="pv-note adm">Privé profiel. Je ziet het omdat je beheerder bent.</div>`:'';
  const tile=(l,v,s_,c)=>`<div class="pv-t"><span class="label">${l}</span><b${c?` style="color:${c}"`:''}>${v}</b>${s_?`<small>${s_}</small>`:''}</div>`;
  const casino=(st.won||0)-(st.lost||0);
  pvOpen(`<div class="pv-head">${typeof dollSvg==='function'?`<div class="pv-doll">${dollSvg(p.wear||{})}</div>`:''}${pvHead(j.name,j.xp,tagH,(since?'Lid sinds '+since+' · ':'')+pvAgo(j.seen_s)+(p.jail?' · <em class="bad">zit vast</em>':p.wanted?' · <em class="bad">gezocht</em>':''),note)}</div>
   <div class="pv-grid">${tile('Vermogen',fmt(net),'contant en bank','var(--acc)')}${tile('Familie',F?esc(F.n):'Geen',fr,F?F.col:'')}${tile('Woning',H?esc(H.n):'Onbekend',H&&H.place?esc(H.place):'')}
    ${tile("Auto's",p.cars||0,'in de garage')}${tile('Bedrijven',p.units||0,'vestigingen')}${tile('Straatcredit',(p.cred||0).toLocaleString('nl-NL'),'','var(--violet)')}</div>
   <div class="pv-stats"><span class="label">Prestaties</span><div>${[['Klussen gelukt',st.crimes],['Mislukt',st.fails],["Auto's gestolen",st.cars],['Carjackings',st.jacks],['Huurmoorden',st.hits]].map(([l,v])=>`<span>${l}<b>${(+v||0).toLocaleString('nl-NL')}</b></span>`).join('')}
    <span>Casino<b style="color:${casino>=0?'var(--green)':'var(--red)'}">${casino>=0?'+':'−'}${fmt(Math.abs(casino))}</b></span></div></div>`)
 }).catch(()=>pvOpen('<div class="pv-load">Geen verbinding. Probeer het zo nog eens.</div>'))}
function pvSetPublic(on){if(!window.__TOKEN__)return;fetch('/api/profile/privacy',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.__TOKEN__},body:JSON.stringify({public:!!on})})
 .then(r=>r.json()).then(j=>{if(j.error){toast(j.error,'bad');return}window.__PUB__=!!j.public;toast(j.public?'Je profiel is nu openbaar':'Je profiel is nu privé','ok');if(page==='profiel'||page==='rank')render()}).catch(()=>toast('Geen verbinding','bad'))}
