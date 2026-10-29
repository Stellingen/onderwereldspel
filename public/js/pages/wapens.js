// Tab: Wapens & uitrusting — 4 soorten, per soort telt je beste item
const grStats=g=>{const o=[];if(g.kans)o.push(['k','+'+g.kans+'% slaagkans']);if(g.buit)o.push(['b','+'+g.buit+'% buit']);if(g.car)o.push(['c','+'+g.car+'% tijd bij auto\'s']);
 if(g.heat)o.push(['h','−'+g.heat+'% hitte']);if(g.jail)o.push(['j','−'+g.jail+'% celstraf']);if(g.vk)o.push(['v','Vuurkracht '+g.vk]);return o};
V.shop=()=>{const ri=rankIdx(S.xp);
 const tot=[['Slaagkans','+'+gearBonus()+'%','k'],['Buit','+'+gearSum('buit')+'%','b'],["Auto's",'+'+gearSum('car')+'% tijd','c'],['Hitte','−'+gearSum('heat')+'%','h'],['Celstraf','−'+gearSum('jail')+'%','j'],['Vuurkracht',gearVk(),'v']];
 const owned=GEAR.filter(g=>S.gear[g.id]).length;
 const cat=c=>{const items=GEAR.filter(g=>g.cat===c.id),best=gearBest(c.id),bi=best?items.indexOf(best):-1;
  const card=(g,i)=>{const own=!!S.gear[g.id],isBest=best===g,lower=i<bi,lock=ri<g.r,poor=S.cash<g.p;
   const cur=best||{};
   const st=isBest?'best':lower?'old':lock?'lock':'buy';
   const btn=isBest?'<div class="gr-eq">Uitgerust</div>':lower?`<div class="gr-old">${own?'In bezit · telt niet mee':'Je hebt al beter'}</div>`
    :lock?`<button class="btn ghost" disabled>Vanaf ${RANKS[g.r][0]}</button>`
    :`<button class="btn ${poor?'ghost':'act-btn'}" onclick="act.buyGear('${g.id}')" ${poor?'disabled':''}>${poor?'Te duur · ':'Koop · '}${fmt(g.p)}</button>`;
   const up=!isBest&&!lower&&!lock&&best?['kans','buit','car','heat','jail','vk'].filter(k=>g[k]).map(k=>{const d=(g[k]||0)-(cur[k]||0);return d>0?(k==='vk'?'+'+d+' vuurkracht':(['heat','jail'].includes(k)?'−':'+')+d+'% '+({kans:'kans',buit:'buit',car:'auto',heat:'hitte',jail:'cel'})[k]):null}).filter(Boolean).join(' · '):'';
   return `<article class="gr-item ${st}"><div class="gr-tier">T${i+1}</div>
    <div class="gr-ic">${svg(g.ic)}</div><h4>${g.n}</h4><p>${g.d}</p>
    <div class="gr-st">${grStats(g).map(([k,t])=>`<span class="${k}">${t}</span>`).join('')}</div>
    ${up?`<div class="gr-up">Ten opzichte van nu: ${up}</div>`:''}
    <div class="gr-btn">${btn}</div></article>`};
  return `<section class="gr-cat" style="--c:${c.col}"><header><div class="act-ic">${svg(c.ic)}</div><div><h2>${c.n}</h2><p>${c.d}</p></div>
   <div class="gr-cur"><span class="label">Uitgerust</span><b>${best?best.n:'Niets'}</b></div></header>
   <div class="gr-ladder">${items.map(card).join('')}</div></section>`};
 return `<h1>Wapens & uitrusting</h1>
 <section class="card hud gr-hero"><div class="gr-h-t"><span class="label">Jouw uitrusting · ${owned} van ${GEAR.length} items</span><p>Per soort telt je beste item. Wat je koopt, houd je; je oude spul raak je niet kwijt maar telt niet meer mee.</p></div>
  <div class="gr-tot">${tot.map(([l,v,k])=>`<div class="${k}"><span class="label">${l}</span><b>${v}</b></div>`).join('')}</div></section>
 ${GEAR_CATS.map(cat).join('')}`};
