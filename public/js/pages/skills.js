// Tab: Skills
V.skills=()=>`<h1>Skills</h1><p class="sub">Train je vaardigheden met contant geld. Elke skill gaat tot level 10 en werkt permanent.</p>
 <div class="grid2">${SKILLS.map(s=>{const l=S.skills[s.id],c=skillCost(s),max=l>=10;
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><h3 style="color:${s.col}">${s.n}</h3><span class="big" style="font-size:20px">${l}<span style="color:var(--mute);font-size:13px">/10</span></span></div>
  <div style="color:var(--mute);min-height:44px">${s.d}</div>
  <div class="pips">${Array.from({length:10},(_,i)=>`<i style="${i<l?'background:'+s.col+';box-shadow:0 0 10px '+s.col:''}"></i>`).join('')}</div>
  <button class="btn gold" onclick="act.train('${s.id}')" ${max||S.cash<c?'disabled':''}>${max?'Maximaal level':'Trainen · '+fmt(c)}</button></div>`}).join('')}</div>
 <div class="card" style="margin-top:14px"><h3>Huidige effecten</h3>
  <div class="row"><span>Zakkenrollen slaagkans</span><b style="color:var(--green)">${chance(CRIMES[0])}%</b></div>
  <div class="row"><span>Bonus autodiefstal</span><b>+${S.skills.cars*3}% kans · +${S.skills.cars*4}% waarde</b></div>
  <div class="row"><span>Kans om je eruit te praten</span><b>${talkChance()}% (bij politiecontrole ${Math.round(talkChance()/2)}%)</b></div>
  <div class="row"><span>Kortere wachttijden</span><b>-${S.skills.speed*5}%</b></div></div>`;
