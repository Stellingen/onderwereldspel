// Tab: Training — blijvende skills (sessies met tijdslot) en ontspanning (tijdelijke effecten)
V.skills=()=>{
 const ri=rankIdx(S.xp);
 // voortgang naar level 50, met mijlpalen per 10 levels
 const pips=(l,col)=>`<div class="lvbar" style="--c:${col}"><i style="width:${l/TRAIN_MAX*100}%"></i>${TRAIN_MILES.slice(0,-1).map(m=>`<b class="${l>=m?'on':''}" style="left:${m/TRAIN_MAX*100}%"></b>`).join('')}</div><div class="lvmiles">${[0,...TRAIN_MILES].map(m=>`<span class="${l>=m&&m?'on':''}">${m}</span>`).join('')}</div>`;
 const btnLabel=(left,cost,extra)=>inJail()?'Je zit vast':left?'Weer over '+fmtClock(left):S.cash<cost?'Te weinig geld · '+fmt(cost):extra+' · '+fmt(cost);
 const trainCard=t=>{
  const l=S.skills[t.id]||0,max=l>=TRAIN_MAX,cost=trainCost(t,l),left=cdLeft('tr_'+t.id),next=TRAIN_MILES.find(m=>m>l);
  const a=t.eff(l),b=t.eff(Math.min(TRAIN_MAX,l+1));
  return `<article class="act" style="--c:${t.col}">
   <header><div class="act-ic">${svg(t.ic)}</div><div class="act-t"><div class="label">${t.place}</div><h3>${t.n}</h3></div><div class="act-lv"><b>${l}</b><span>/${TRAIN_MAX}</span></div></header>
   <p class="act-d">${t.d}</p>
   ${pips(l,t.col)}
   ${max?'<div class="act-prog"><span>Maximaal level bereikt</span></div>':`<div class="act-prog"><span>Volgende sessie: level ${l+1}${next&&next!==l+1?' · mijlpaal '+next:''}</span></div>`}
   <div class="act-eff"><div class="eh"><span>Effect</span><span>Nu</span><span>${max?'':'Level '+(l+1)}</span></div>
    ${a.map((e,i)=>`<div class="er"><span>${e[0]}</span><b>${e[1]}</b><b class="up">${max?'—':'→ '+b[i][1]}</b></div>`).join('')}</div>
   <button class="btn act-btn" onclick="act.trainSession('${t.id}')" ${max||inJail()||left||S.cash<cost?'disabled':''}>${max?'Maximaal':btnLabel(left,cost,'Trainen')}</button>
   ${left?`<div class="act-cd"><i style="width:${left/(t.cd*60000*waitK())*100}%"></i></div>`:''}
   <div class="act-foot">1 sessie = 1 level · elke ${t.cd} min · ${max?'klaar':'daarna '+fmt(trainCost(t,l+1))}</div></article>`};
 const relaxCard=r=>{
  const cost=r.cost(ri),left=cdLeft('rx_'+r.id),rows=[];
  if(r.focus)rows.push(['Slaagkans (focus)',pctTxt(focusPct(),'+'),'+'+r.focus+'% ('+r.mins+'m)']);
  if(r.hp)rows.push(['Gezondheid',S.hp+'%',Math.min(100,S.hp+r.hp)+'%']);
  if(r.energy)rows.push(['Energie',Math.floor(S.energy)+'',Math.min(EN_MAX,Math.floor(S.energy)+r.energy)+'']);
  if(r.heat)rows.push(['Politie-hitte',S.heat+'%',Math.max(0,S.heat-r.heat)+'%']);
  if(r.clearWanted)rows.push(['Op de gezochtlijst',S.wanted?'ja':'nee','nee']);
  return `<article class="act" style="--c:${r.col}">
   <header><div class="act-ic">${svg(r.ic)}</div><div class="act-t"><div class="label">${r.place}</div><h3>${r.n}</h3></div></header>
   <p class="act-d">${r.d}</p>
   <div class="act-eff"><div class="eh"><span>Effect</span><span>Nu</span><span>Daarna</span></div>
    ${rows.map(e=>`<div class="er"><span>${e[0]}</span><b>${e[1]}</b><b class="up">→ ${e[2]}</b></div>`).join('')}</div>
   <button class="btn act-btn" onclick="act.relax('${r.id}')" ${inJail()||left||S.cash<cost?'disabled':''}>${btnLabel(left,cost,'Doen')}</button>
   ${left?`<div class="act-cd"><i style="width:${left/(r.cd*60000*waitK())*100}%"></i></div>`:''}
   <div class="act-foot">1× per ${r.cd} min</div></article>`};
 const active=[];
 if(buffFocus())active.push(`<span class="chipline" style="--c:#ff3d52">Focus +${buffFocus()}% · nog ${fmtClock(S.buffs.focus.until-now())}</span>`);
 TRAININGS.forEach(t=>{const l=cdLeft('tr_'+t.id);if(!l&&(S.skills[t.id]||0)<TRAIN_MAX)active.push(`<span class="chipline" style="--c:${t.col}">${t.place} klaar</span>`)});
 return `<h1>Training</h1><p class="sub">Trainen maakt je blijvend beter: elke sessie is één level erbij, tot level 50. Elke plek kan maar eens per zoveel minuten en elk level is duurder dan het vorige. Ontspanning geeft een tijdelijk voordeel. Bij elke knop zie je precies wat er verandert.</p>
 ${active.length?`<div class="chiprow-act">${active.join('')}</div>`:''}
 <div class="tierhead"><h2>Trainen</h2><span>Blijvend · elke sessie is een level · tot level ${TRAIN_MAX} · hoe hoger, hoe duurder</span></div>
 <div class="acts">${TRAININGS.map(trainCard).join('')}</div>
 <div class="tierhead"><h2>Ontspannen</h2><span>Tijdelijk · prijs stijgt met je rang</span></div>
 <div class="acts">${RELAX.map(relaxCard).join('')}</div>`;
};
