// Tab: Training — blijvende skills (sessies met tijdslot) en ontspanning (tijdelijke effecten)
const trs={tab:'train'};
const trRing=(l,col)=>{const r=18,c=2*Math.PI*r,p=Math.min(1,l/TRAIN_MAX);
 return `<svg class="tr-ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="${r}" class="bg"/><circle cx="22" cy="22" r="${r}" class="fg" style="stroke:${col};stroke-dasharray:${(c*p).toFixed(1)} ${c.toFixed(1)}"/></svg>`};
const trMins=m=>{const v=m*waitK();return v>=60&&v%60===0?v/60+' uur':v>=90?(v/60).toLocaleString('nl-NL',{maximumFractionDigits:1})+' uur':Math.round(v)+' min'};
const trGo=id=>`trs.tab='train';render();setTimeout(()=>{const e=document.getElementById('tr-${id}');if(e)e.scrollIntoView({behavior:'smooth',block:'center'})},30)`;
// alles wat een ontspanning doet, als korte labels
function rxFx(r){const o=[];if(r.hp)o.push(['hp',r.hp>=100?'Gezondheid vol':'+'+r.hp+'% gezondheid']);if(r.energy)o.push(['en',r.energy>=999?'Energie vol':'+'+r.energy+' energie']);
 if(r.focus)o.push(['fo','Slaagkans +'+r.focus+'% · '+r.mins+' min']);if(r.loot)o.push(['lo','Buit +'+r.loot+'% · '+r.mins+' min']);
 if(r.heat)o.push(['he','Hitte −'+r.heat+'%']);if(r.clearWanted)o.push(['wa','Van de gezochtlijst']);return o}
V.skills=()=>{
 const ri=rankIdx(S.xp),lv=rankLevel(S.xp);
 const pips=(l,col)=>`<div class="lvbar" style="--c:${col}"><i style="width:${l/TRAIN_MAX*100}%"></i>${TRAIN_MILES.slice(0,-1).map(m=>`<b class="${l>=m?'on':''}" style="left:${m/TRAIN_MAX*100}%"></b>`).join('')}</div>`;
 const btnLabel=(left,cost,extra)=>inJail()?'Je zit vast':left?'Weer over '+fmtClock(left):S.cash<cost?'Te weinig contant · '+fmt(cost):extra+' · '+fmt(cost);
 const st=t=>{const l=S.skills[t.id]||0,lock=ri<(t.r||0),max=l>=TRAIN_MAX,cost=trainCost(t,l),left=cdLeft('tr_'+t.id);
  return {l,lock,max,cost,left,ready:!lock&&!max&&!left&&!inJail()&&S.cash>=cost}};
 const trainCard=t=>{const {l,lock,max,cost,left,ready}=st(t),next=TRAIN_MILES.find(m=>m>l),a=t.eff(l),b=t.eff(Math.min(TRAIN_MAX,l+1));
  return `<article class="tr-card ${lock?'lock':''} ${ready?'ready':''}" id="tr-${t.id}" style="--c:${t.col}">
   <header><div class="act-ic">${svg(t.ic)}</div><div class="tr-t"><span class="label">${t.place}</span><h3>${t.n}</h3></div><div class="tr-lv"><b>${l}</b><span>/${TRAIN_MAX}</span></div></header>
   <p class="tr-d">${t.d}</p>
   ${pips(l,t.col)}
   <div class="tr-eff">${a.map((e,i)=>`<div><span>${e[0]}</span><b>${e[1]}</b>${max?'':`<em>→ ${b[i][1]}</em>`}</div>`).join('')}</div>
   <div class="tr-foot"><button class="btn act-btn" onclick="act.trainSession('${t.id}')" ${max||lock||inJail()||left||S.cash<cost?'disabled':''}>${lock?'Vanaf '+RANKS[t.r][0]:max?'Maximaal level':btnLabel(left,cost,'Trainen')}</button>
    <div class="tr-meta">${lock?'Nog op slot':max?'Klaar':`Elke ${trMins(t.cd)} · daarna ${fmt(trainCost(t,l+1))}${next&&next!==l+1?' · mijlpaal '+next:''}`}</div></div>
   ${left?`<div class="act-cd"><i style="width:${left/(t.cd*60000*waitK())*100}%"></i></div>`:''}</article>`};
 const relaxCard=r=>{const lock=ri<(r.r||0),cost=relaxCost(r,ri,lv),left=cdLeft('rx_'+r.id),ready=!lock&&!left&&!inJail()&&S.cash>=cost;
  return `<article class="tr-card rx ${lock?'lock':''} ${ready?'ready':''}" id="rx-${r.id}" style="--c:${r.col}">
   <header><div class="act-ic">${svg(r.ic)}</div><div class="tr-t"><span class="label">${r.place}</span><h3>${r.n}</h3></div><div class="rx-cd"><span class="label">Wachttijd</span><b>${trMins(r.cd)}</b></div></header>
   <p class="tr-d">${r.d}</p>
   <div class="rx-fx">${rxFx(r).map(([k,t])=>`<span class="${k}">${t}</span>`).join('')}</div>
   <div class="tr-foot"><button class="btn act-btn" onclick="act.relax('${r.id}')" ${lock||inJail()||left||S.cash<cost?'disabled':''}>${lock?'Vanaf '+RANKS[r.r][0]:btnLabel(left,cost,'Doen')}</button></div>
   ${left?`<div class="act-cd"><i style="width:${left/(r.cd*60000*waitK())*100}%"></i></div>`:''}</article>`};
 const tot=TRAININGS.reduce((a,t)=>a+(S.skills[t.id]||0),0),readyT=TRAININGS.filter(t=>st(t).ready).length,
  readyR=RELAX.filter(r=>ri>=(r.r||0)&&!cdLeft('rx_'+r.id)&&!inJail()&&S.cash>=relaxCost(r,ri,lv)).length;
 const tiles=TRAININGS.map(t=>{const {l,lock,max,cost,left,ready}=st(t);
  const s=lock?'Vanaf '+RANKS[t.r][0]:max?'Max':left?fmtClock(left):ready?'Klaar':fmt(cost);
  return `<button class="tr-tile ${lock?'lock':''} ${ready?'ready':''}" style="--c:${t.col}" onclick="${trGo(t.id)}" title="${t.n}: level ${l}">
   <div class="tr-tile-r">${trRing(l,t.col)}<b>${l}</b></div><span>${t.n}</span><em>${s}</em></button>`}).join('');
 const buffs=[];
 if(buffFocus())buffs.push(`<span style="--c:#ff3d52">Slaagkans +${buffFocus()}% · ${fmtClock(S.buffs.focus.until-now())}</span>`);
 if(buffLoot())buffs.push(`<span style="--c:var(--green)">Buit +${buffLoot()}% · ${fmtClock(S.buffs.loot.until-now())}</span>`);
 if(furnFx('focus'))buffs.push(`<span style="--c:var(--violet)">Inrichting: slaagkans +${furnFx('focus')}%</span>`);
 const relax=trs.tab==='relax';
 const modes=`<div class="tr-modes">
  <button class="tr-mode m-train ${relax?'':'on'}" onclick="trs.tab='train';render()"><i>${svg('skills')}</i><div><b>Trainen</b><span>Blijvend beter worden · elke sessie een level, tot ${TRAIN_MAX}</span></div><em class="${readyT?'go':''}">${readyT?readyT+' klaar':'niets klaar'}</em></button>
  <button class="tr-mode m-relax ${relax?'on':''}" onclick="trs.tab='relax';render()"><i>${svg('spa')}</i><div><b>Ontspannen</b><span>Tijdelijk voordeel · energie, gezondheid, focus, minder hitte</span></div><em class="${readyR?'go':''}">${readyR?readyR+' klaar':'niets klaar'}</em></button></div>`;
 const rxTiles=RELAX.map(r=>{const lock=ri<(r.r||0),left=cdLeft('rx_'+r.id),cost=relaxCost(r,ri,lv),ready=!lock&&!left&&!inJail()&&S.cash>=cost;
  const s=lock?'Vanaf '+RANKS[r.r][0]:left?fmtClock(left):ready?'Klaar':fmt(cost);
  return `<button class="tr-tile ${lock?'lock':''} ${ready?'ready':''}" style="--c:${r.col}" onclick="document.getElementById('rx-${r.id}').scrollIntoView({behavior:'smooth',block:'center'})" title="${r.n}">
   <div class="tr-tile-r rx-ic">${svg(r.ic)}</div><span>${r.n}</span><em>${s}</em></button>`}).join('');
 const now_=[['Energie',Math.floor(S.energy)+'/'+EN_MAX,S.energy/EN_MAX,'var(--ice)'],['Gezondheid',S.hp+'%',S.hp/100,'var(--green)'],['Hitte',S.heat+'%',S.heat/100,S.heat>60?'var(--red)':'var(--acc)']];
 const hero=relax?`<section class="card hud tr-hero">
   <div class="tr-h-l"><span class="label">Hoe sta je ervoor</span>
    <div class="rx-now">${now_.map(([l,v,p,c])=>`<div><span>${l}</span><b style="color:${c}">${v}</b><div class="bar"><i style="width:${Math.min(100,p*100)}%;background:${c}"></i></div></div>`).join('')}</div>
    <p>${buffs.length?'Actief:':'Geen tijdelijk voordeel actief.'}${S.wanted?' <b style="color:var(--red)">Je staat op de gezochtlijst.</b>':''}</p>${buffs.length?`<div class="tr-buffs">${buffs.join('')}</div>`:''}</div>
   <div class="tr-tiles">${rxTiles}</div></section>`
  :`<section class="card hud tr-hero">
   <div class="tr-h-l"><span class="label">Jouw skills</span><div class="tr-h-big"><b>${tot}</b><span>/ ${TRAININGS.length*TRAIN_MAX} levels</span></div>
    <div class="bar"><i style="width:${tot/(TRAININGS.length*TRAIN_MAX)*100}%;background:var(--mc)"></i></div>
    <p>${readyT?`<b class="up">${readyT} plek${readyT>1?'ken':''}</b> klaar om te trainen`:'Geen training klaar'}${isVip()?` · ${lidName()}: wachttijden ${Math.round(waitK()*100)}%`:''}</p></div>
   <div class="tr-tiles">${tiles}</div></section>`;
 return `<div class="tr-page ${relax?'m-relax':'m-train'}"><h1>Training & ontspanning</h1>
 ${modes}
 ${hero}
 ${!relax?`<div class="tr-band"><b>Trainen</b><span>Elke sessie is één level erbij, tot level ${TRAIN_MAX}. Elke plek heeft een eigen wachttijd en elk level is duurder dan het vorige. Nieuwe plekken gaan open als je hoger in rang komt.</span></div>
  <div class="tr-grid">${TRAININGS.map(trainCard).join('')}</div>`
 :`<div class="tr-band"><b>Ontspannen</b><span>Tijdelijke voordelen. Hoe beter de ontspanning, hoe duurder en hoe langer je daarna moet wachten. De prijs stijgt met je rang en je level in die rang.</span></div>
  ${RELAX_TIERS.map((n,i)=>`<div class="tierhead"><h2>${n}</h2><span>${['Kort en goedkoop','Sterker, langer wachten','Vanaf een hoge rang · alles tegelijk'][i]}</span></div><div class="tr-grid">${RELAX.filter(r=>r.tier===i).map(relaxCard).join('')}</div>`).join('')}`}</div>`;
};
