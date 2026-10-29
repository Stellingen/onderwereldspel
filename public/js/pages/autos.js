// Tab: Auto's
V.cars=()=>{const left=cdLeft('car');return `<h1>Auto's stelen</h1><p class="sub">Steel een willekeurige auto. Duurdere wagens zijn lastiger te jatten. Verkoop ze of houd ze voor je vermogen.</p>
 <div class="grid2"><div class="card"><h3>Op jacht</h3>
  ${CARS.map(c=>`<div class="row"><span>${c.n} ${rankIdx(S.xp)<c.r?'<span class="tag">vanaf '+RANKS[c.r][0]+'</span>':''}</span><span class="tag g">${fmt(c.v)}</span></div>`).join('')}
  <button class="btn" style="margin-top:12px" data-cd="car" onclick="act.car()" ${left||inJail()?'disabled':''}>${left?'Wacht '+Math.ceil(left/1000)+'s':inJail()?'Je zit vast':'Auto stelen'}</button>
  ${left?`<div class="cd" style="transform:scaleX(${Math.min(1,left/carCd())})"></div>`:''}</div>
 <div class="card"><h3>Jouw garage (${S.cars.length}/10)</h3>
  ${S.cars.length?S.cars.map((c,i)=>`<div class="row car"><span><b>${c.n}</b><br><span class="tag g">${fmt(c.v)}</span></span><button class="btn sm gold" onclick="act.sell(${i})">Verkoop</button></div>`).join('')+`<button class="btn gold" style="margin-top:10px" onclick="act.sellAll()">Alles verkopen · ${fmt(S.cars.reduce((a,c)=>a+c.v,0))}</button>`:'<div class="empty">Je garage is leeg.</div>'}
 </div></div>`};
