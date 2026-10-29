// Tab: Bajes
V.jail=()=>{const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000));const bail=bailCost();const total=S.lastSentence||left;const canPay=S.cash+S.bank>=bail;
 return `<h1>Bajes</h1><p class="sub">Straffen duren minimaal 30 seconden en maximaal 10 minuten. Zit je tijd uit of betaal borg en je bent netjes vrij. Ontsnap je, dan sta je op de gezochtlijst.</p>
 <div class="card" style="max-width:560px">${inJail()?`<div class="label">Resterende straf</div><div class="big" style="color:var(--red)">${fmtTime(left)}</div>
  <div class="bar"><i style="width:${100-left/total*100}%;background:var(--red)"></i></div>
  <div class="row" style="margin-top:12px"><span>Borg (betaald van contant, daarna bank)</span><b style="color:var(--gold)">${fmt(bail)}</b></div>
  <div class="flex" style="margin-top:14px"><button class="btn gold" onclick="act.bail()" ${canPay?'':'disabled'}>${canPay?'Borg betalen':'Te weinig geld'}</button><button class="btn red" onclick="act.escape()">Ontsnappen (${Math.round(escChance()*100)}%)</button></div>
  <div class="label" style="margin-top:12px;line-height:1.6">Mislukte ontsnapping: +30s straf. Gelukt: je staat op de gezochtlijst tot de politie je vindt.</div>`
  :S.wanted?`<h3 style="color:#ff8a3d">⚠ Je bent op de vlucht</h3><div style="color:var(--mute)">Je bent niet officieel vrij. Elke actie die je doet kan een politiecontrole opleveren. Word je gepakt, dan krijg je je oude straf plus 2 minuten.</div>`
  :'<div class="empty">Je bent een vrij mens. Hou het zo.</div>'}</div>`};
