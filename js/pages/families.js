// Tab: Families
V.fam=()=>`<h1>Families</h1><p class="sub">Straatcredit verdien je met elke geslaagde misdaad of gestolen auto. Met genoeg rang en credit word je toegelaten tot een familie.</p>
 <div class="grid2">${FAMILIES.map(f=>{const okR=rankIdx(S.xp)>=f.r,okC=S.cred>=f.cred,mine=S.family===f.id;
  return `<div class="card fam ${mine?'on':''}"><h3 style="color:${f.col}">${f.n}</h3><div style="color:var(--mute)">${f.d}</div>
  <div class="meta"><span class="tag gr">+${f.chance}% slaagkans</span>${f.loot?`<span class="tag g">+${f.loot}% buit</span>`:''}${f.jail?`<span class="tag c">-${f.jail}% straf</span>`:''}</div>
  <div class="row"><span>Rang: ${RANKS[f.r][0]}</span><b style="color:${okR?'var(--green)':'var(--red)'}">${okR?'✓':'✗'}</b></div>
  <div class="row"><span>Straatcredit: ${S.cred} / ${f.cred}</span><b style="color:${okC?'var(--green)':'var(--red)'}">${okC?'✓':'✗'}</b></div>
  <div class="bar" style="margin-bottom:12px"><i style="width:${Math.min(100,S.cred/f.cred*100)}%;background:${f.col}"></i></div>
  ${mine?`<button class="btn red" onclick="act.leave()">Familie verlaten</button>`:`<button class="btn" onclick="act.join('${f.id}')" ${okR&&okC&&!inJail()?'':'disabled'}>${okR&&okC?'Aansluiten':'Nog niet toegelaten'}</button>`}</div>`}).join('')}</div>`;
