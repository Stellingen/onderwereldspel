// Tab: Bezit
V.biz=()=>`<h1>Bezit</h1><p class="sub">Bedrijven leveren elke minuut geld op, ook terwijl je weg bent (max. 12 uur).</p>
 <div class="grid">${BIZ.map(b=>{const own=S.biz[b.id]||0;const price=Math.floor(b.p*Math.pow(1.25,own));const lock=rankIdx(S.xp)<b.r;
  return `<div class="card" style="${lock?'opacity:.5':''}"><h3>${b.n}</h3><div style="color:var(--mute)">${b.d}</div>
  <div class="meta"><span class="tag gr">+${fmt(b.inc)}/min</span><span class="tag c">${own} in bezit</span></div>
  <button class="btn gold" onclick="act.buyBiz('${b.id}')" ${lock||S.cash<price?'disabled':''}>${lock?'Vanaf '+RANKS[b.r][0]:'Koop · '+fmt(price)}</button></div>`}).join('')}</div>`;
