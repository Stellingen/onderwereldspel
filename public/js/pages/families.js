// Tab: Families
V.fam=()=>{const ri=rankIdx(S.xp);const mine=fam();
 return `<h1>Families</h1><p class="sub">Straatcredit verdien je met elke geslaagde klus en gestolen auto. Met de juiste rang en genoeg credit word je toegelaten. Je kunt maar bij één familie tegelijk horen.</p>
 ${S.family?`<div class="card hud" style="margin-bottom:14px;border-color:var(--acc-dim)"><div class="famhead"><div class="crest" style="color:${mine.col};box-shadow:inset 0 0 0 2px ${mine.col}">${mine.m}</div>
   <div><div class="label">Jouw familie</div><h3 style="font-size:26px;margin:2px 0 0">${mine.n}</h3></div></div>
   <div class="meta" style="margin-bottom:0"><span class="tag gr">+${mine.chance}% slaagkans</span>${mine.loot?`<span class="tag g">+${mine.loot}% buit</span>`:''}${mine.jail?`<span class="tag b">-${mine.jail}% straf</span>`:''}</div></div>`:''}
 <div class="grid2">${FAMILIES.map(f=>{const okR=ri>=f.r,okC=S.cred>=f.cred,isMine=S.family===f.id;
  return `<div class="card fam ${isMine?'on':''}" style="${!okR?'opacity:.6':''}">
   <div class="famhead"><div class="crest" style="color:${f.col};background:var(--bg2)">${f.m}</div>
    <div style="min-width:0"><h3 style="margin:0">${f.n}</h3><div class="label" style="margin-top:3px">Vanaf ${RANKS[f.r][0]} · ${f.cred} cred</div></div></div>
   <div style="color:var(--mute);font-size:14px;min-height:42px">${f.d}</div>
   <div class="meta"><span class="tag gr">+${f.chance}% kans</span>${f.loot?`<span class="tag g">+${f.loot}% buit</span>`:''}${f.jail?`<span class="tag b">-${f.jail}% straf</span>`:''}</div>
   <div class="row"><span>Rang ${RANKS[f.r][0]}</span><b style="color:${okR?'var(--green)':'var(--red)'}">${okR?'✓':'✗'}</b></div>
   <div class="row"><span>Straatcredit ${S.cred} / ${f.cred}</span><b style="color:${okC?'var(--green)':'var(--red)'}">${okC?'✓':'✗'}</b></div>
   <div class="bar" style="margin:4px 0 14px"><i style="width:${Math.min(100,S.cred/f.cred*100)}%;background:${f.col}"></i></div>
   ${isMine?`<button class="btn red" onclick="act.leave()">Familie verlaten</button>`:`<button class="btn ${okR&&okC?'':'ghost'}" onclick="act.join('${f.id}')" ${okR&&okC&&!inJail()?'':'disabled'}>${okR&&okC?(S.family?'Overstappen':'Aansluiten'):'Nog niet toegelaten'}</button>`}</div>`}).join('')}</div>`};
