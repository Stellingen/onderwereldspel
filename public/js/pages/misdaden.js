// Tab: Misdaden
V.crimes=()=>`<h1>Misdaden</h1><p class="sub">Hogere rang en betere wapens verhogen je slaagkans. Mislukken betekent de bajes in.</p>
 <div class="grid">${CRIMES.map(c=>{const lock=rankIdx(S.xp)<c.r;const left=cdLeft(c.id);
  return `<div class="card" style="${lock?'opacity:.5':''}"><h3>${c.n}</h3><div style="color:var(--mute)">${c.d}</div>
   <div class="meta"><span class="tag g">${fmt(c.min)}–${fmt(c.max)}</span><span class="tag c">+${c.xp} XP</span><span class="tag" style="color:var(--violet)">+${c.cr} cred</span><span class="tag r">${fmtTime(c.jail)} cel</span><span class="tag ${chance(c)>60?'gr':chance(c)>35?'g':'r'}">${chance(c)}% kans</span></div>
   <button class="btn" data-cd="${c.id}" onclick="act.crime('${c.id}')" ${lock||left||inJail()?'disabled':''}>${lock?'Vanaf '+RANKS[c.r][0]:left?'Wacht '+Math.ceil(left/1000)+'s':inJail()?'Je zit vast':'Uitvoeren'}</button>
   ${left?`<div class="cd" style="transform:scaleX(${Math.min(1,left/crimeCd(c))})"></div>`:''}</div>`}).join('')}</div>`;
