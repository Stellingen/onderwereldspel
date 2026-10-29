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
  ${window.__TOKEN__?`<section class="card pf-acc"><h3>Account</h3><p class="sub" style="margin:0 0 12px">Je voortgang wordt automatisch opgeslagen op je account.</p><button class="btn ghost" onclick="logout()">Uitloggen</button></section>`:''}
 </div>`;
};
