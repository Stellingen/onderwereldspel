// Tab: Wapens
V.shop=()=>`<h1>Wapens & uitrusting</h1><p class="sub">Elk item verhoogt permanent je slaagkans bij misdaden.</p>
 <div class="grid">${GEAR.map(g=>`<div class="card"><h3>${g.n}</h3><div class="meta"><span class="tag gr">+${g.bonus}% slaagkans</span></div>
  <button class="btn gold" onclick="act.buyGear('${g.id}')" ${S.gear[g.id]||S.cash<g.p?'disabled':''}>${S.gear[g.id]?'In bezit':'Koop · '+fmt(g.p)}</button></div>`).join('')}</div>`;
