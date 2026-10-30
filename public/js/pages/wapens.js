// Tab: Wapens & uitrusting — 4 soorten, per soort telt je beste item
const grStats=g=>{const o=[];if(g.kans)o.push(['k','+'+g.kans+'% slaagkans']);if(g.buit)o.push(['b','+'+g.buit+'% buit']);if(g.car)o.push(['c','+'+g.car+'% tijd bij auto\'s']);
 if(g.heat)o.push(['h','−'+g.heat+'% hitte']);if(g.jail)o.push(['j','−'+g.jail+'% celstraf']);if(g.vk)o.push(['v','Vuurkracht '+g.vk]);if(g.flee)o.push(['f','+'+g.flee+'% vluchten']);return o};
// Winkelstraat: vier zaken, elk met een eigen gevel. Tik op een zaak om naar binnen te gaan.
const GR_SHOPS=[
 {id:'arsenaal',n:'Het Arsenaal',sub:'Wapens en bescherming',d:'Achter een bontwinkel, door de koelcel naar beneden. Sjaak vraagt niet waarvoor.',cats:['wapen','pantser'],col:'#ff6b6b',ic:'gun',kind:'shop'},
 {id:'bouw',n:'Bouwmarkt Hamer',sub:'Gereedschap',d:'Koevoeten, lockpicks en wat er achter de toonbank ligt als je het juiste woord zegt.',cats:['tools'],col:'#ffd166',ic:'tool',kind:'garage'},
 {id:'elek',n:'Belwinkel De Lijn',sub:'Communicatie',d:'Prepaid, scanners en telefoons die niemand kan lezen. Contant, graag.',cats:['comm'],col:'#b8a1ff',ic:'radio',kind:'shop'},
 {id:'motor',n:'Motorhuis Snel',sub:'Vervoer om te vluchten',d:'Van een opgevoerde scooter tot een piloot die geen vragen stelt.',cats:['vervoer'],col:'#7fd1c7',ic:'moto',kind:'jet'}];
window.gsel=window.gsel||{shop:null};
const grShopArt=(sh,u)=>typeof bzArt==='function'?bzArt({id:'gs_'+sh.id,col:sh.col,icp:ICONS[sh.ic],kind:sh.kind},u):'';
function grShopBanner(sh){const items=GEAR.filter(g=>sh.cats.includes(g.cat)),ri=rankIdx(S.xp),best=sh.cats.map(c=>gearBest(c)).filter(Boolean);
 const can=items.filter(g=>{const b=gearBest(g.cat);return !S.gear[g.id]&&ri>=g.r&&(!b||items.indexOf(g)>items.indexOf(b)&&g.cat===b.cat||!b)&&S.cash>=g.p}).length;
 return `<button class="bzb gsb" style="--c:${sh.col}" onclick="gsel.shop='${sh.id}';render();window.scrollTo({top:0,behavior:'smooth'})">
  <span class="bzb-art" aria-hidden="true">${grShopArt(sh,'gs'+sh.id)}</span>
  <span class="bzb-t"><span class="bzb-k">${sh.sub}</span><b>${sh.n}</b><span class="bzb-d">${sh.d}</span>
   <span class="bzb-f"><em>Uitgerust: <b>${best.length?best.map(g=>g.n).join(', '):'niets'}</b></em>${can?`<em class="up"><b>${can}</b> te koop</em>`:''}</span><span class="bzb-go">Naar binnen ›</span></span></button>`}
V.shop=()=>{const ri=rankIdx(S.xp);const SH=GR_SHOPS.find(x=>x.id===gsel.shop);
 const tot=[['Slaagkans','+'+gearBonus()+'%','k'],['Buit','+'+gearSum('buit')+'%','b'],['Autotijd','+'+gearSum('car')+'%','c'],['Hitte','−'+gearSum('heat')+'%','h'],['Celstraf','−'+gearSum('jail')+'%','j'],['Vuurkracht',gearVk(),'v'],['Vluchten','+'+gearSum('flee')+'%','f']];
 const owned=GEAR.filter(g=>S.gear[g.id]).length;
 const cat=c=>{const items=GEAR.filter(g=>g.cat===c.id),best=gearBest(c.id),bi=best?items.indexOf(best):-1;
  const card=(g,i)=>{const own=!!S.gear[g.id],isBest=best===g,lower=i<bi,lock=ri<g.r,poor=S.cash<g.p;
   const cur=best||{};
   const st=isBest?'best':lower?'old':lock?'lock':'buy';
   const btn=isBest?'<div class="gr-eq">Uitgerust</div>':lower?`<div class="gr-old">${own?'In bezit · telt niet mee':'Je hebt al beter'}</div>`
    :lock?`<button class="btn ghost" disabled>Vanaf ${RANKS[g.r][0]}</button>`
    :`<button class="btn ${poor?'ghost':'act-btn'}" onclick="act.buyGear('${g.id}')" ${poor?'disabled':''}>${poor?'Te duur · ':'Koop · '}${fmt(g.p)}</button>`;
   const up=!isBest&&!lower&&!lock&&best?['kans','buit','car','heat','jail','vk','flee'].filter(k=>g[k]).map(k=>{const d=(g[k]||0)-(cur[k]||0);return d>0?(k==='vk'?'+'+d+' vuurkracht':(['heat','jail'].includes(k)?'−':'+')+d+'% '+({kans:'kans',buit:'buit',car:'auto',heat:'hitte',jail:'cel',flee:'vluchten'})[k]):null}).filter(Boolean).join(' · '):'';
   return `<article class="gr-item ${st}"><div class="gr-tier">T${i+1}</div>
    <div class="gr-ic">${svg(g.ic)}</div><h4>${g.n}</h4><p>${g.d}</p>
    <div class="gr-st">${grStats(g).map(([k,t])=>`<span class="${k}">${t}</span>`).join('')}</div>
    ${up?`<div class="gr-up">Ten opzichte van nu: ${up}</div>`:''}
    <div class="gr-btn">${btn}</div></article>`};
  return `<section class="gr-cat" style="--c:${c.col}"><header><div class="act-ic">${svg(c.ic)}</div><div><h2>${c.n}</h2><p>${c.d}</p></div>
   <div class="gr-cur"><span class="label">Uitgerust</span><b>${best?best.n:'Niets'}</b></div></header>
   <div class="gr-ladder">${items.map(card).join('')}</div></section>`};
 if(SH)return `<div class="vb-bar"><button class="vb-back" onclick="gsel.shop=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Winkelstraat</span></button><h2>${SH.n}</h2></div>
  <section class="gs-head" style="--c:${SH.col}"><div class="gs-art" aria-hidden="true">${grShopArt(SH,'gh'+SH.id)}</div><div class="gs-ht"><span class="label">${SH.sub}</span><p>${SH.d}</p>
   <div class="gr-tot">${tot.filter(([l,v,k])=>({wapen:['k','v'],pantser:['k','j'],tools:['b','c'],comm:['h'],vervoer:['f']})[SH.cats[0]].concat(SH.cats[1]?({pantser:['j']})[SH.cats[1]]||[]:[]).includes(k)).map(([l,v,k])=>`<div class="${k}"><span class="label">${l}</span><b>${v}</b></div>`).join('')}</div></div></section>
  ${GEAR_CATS.filter(c=>SH.cats.includes(c.id)).map(cat).join('')}`;
 return `<h1>Wapens & uitrusting</h1>
 <section class="card hud gr-hero"><div class="gr-h-t"><span class="label">Jouw uitrusting · ${owned} van ${GEAR.length} items</span><p>Per soort telt je beste item. Wat je koopt, houd je; je oude spul raak je niet kwijt maar telt niet meer mee.</p></div>
  <div class="gr-tot">${tot.map(([l,v,k])=>`<div class="${k}"><span class="label">${l}</span><b>${v}</b></div>`).join('')}</div></section>
 <div class="bz-sec"><h2>De winkelstraat</h2><span>${GR_SHOPS.length} zaken</span></div>
 <div class="bzb-grid">${GR_SHOPS.map(grShopBanner).join('')}</div>`};