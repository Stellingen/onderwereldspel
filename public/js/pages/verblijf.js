// Tab: Verblijf — rusten (alleen zolang je op deze pagina blijft) en een beter onderkomen kopen
window.rest=window.rest||{on:false,t0:0,e0:0,h0:0,dur:10000,timer:null};
function restProgress(){return rest.on?Math.min(1,(performance.now()-rest.t0)/rest.dur):0}
function restApply(p){const h=home();S.energy=Math.min(EN_MAX,rest.e0+(EN_MAX-rest.e0)*p);if(h.hp)S.hp=Math.min(100,Math.round(rest.h0+Math.min(h.hp,100-rest.h0)*p))}
function restStop(reason){if(!rest.on)return;const p=restProgress();restApply(p);rest.on=false;clearInterval(rest.timer);
  const pct=Math.round(p*100);
  if(p>=1){toast('Uitgerust. Energie vol.');SFX.win(3);log('Uitgerust in '+home().n,'ok')}
  else if(reason)toast('Rust onderbroken bij '+pct+'%. Je energie staat op '+Math.floor(S.energy)+'.','bad');
  save();if(page==='verblijf')render();else{renderTop();renderNav()}}
function restStart(){if(rest.on||hide.on||inJail())return;const h=home();
  if(S.energy>=EN_MAX&&(!h.hp||S.hp>=100)){toast('Je bent al helemaal uitgerust');return}
  Object.assign(rest,{on:true,t0:performance.now(),e0:S.energy,h0:S.hp,dur:h.rest*1000});SFX.click();render();
  rest.timer=setInterval(()=>{if(page!=='verblijf'||document.hidden){restStop(true);return}
    const p=restProgress();restApply(p);
    const bar=document.getElementById('restBar'),txt=document.getElementById('restTxt'),en=document.getElementById('restEn');
    if(bar)bar.style.width=(p*100)+'%';if(txt)txt.textContent=Math.round(p*100)+'%';if(en)en.textContent=Math.floor(S.energy)+' / '+EN_MAX;
    renderTop();if(p>=1)restStop(false)},100)}
// Onderduiken: hitte zakt in 5 minuten gelijkmatig naar 0, alleen zolang je op deze pagina blijft
const HIDE_MS=5*60*1000;
window.hide=window.hide||{on:false,t0:0,h0:0,timer:null};
const hideProgress=()=>hide.on?Math.min(1,(performance.now()-hide.t0)/HIDE_MS):0;
function hideApply(p){S.heat=Math.max(0,Math.round(hide.h0*(1-p)))}
function hideStop(reason){if(!hide.on)return;const p=hideProgress();hideApply(p);hide.on=false;clearInterval(hide.timer);
  if(p>=1){if(S.wanted){S.wanted=false;toast('Ondergedoken. De politie is je kwijt en je staat niet meer op de gezochtlijst.','lvl')}else toast('Ondergedoken. Je hitte is weg.');log('Ondergedoken: hitte 0','ok');SFX.win(3)}
  else if(reason)toast('Onderduiken gestopt. Hitte nu '+S.heat+'%.','bad');
  save();if(page==='verblijf')render();else{renderTop();renderNav()}}
function hideStart(){if(hide.on||rest.on||inJail()||S.heat<=0)return;Object.assign(hide,{on:true,t0:performance.now(),h0:S.heat});SFX.click();render();
  hide.timer=setInterval(()=>{if(page!=='verblijf'||document.hidden){hideStop(true);return}const p=hideProgress();hideApply(p);
    const b=document.getElementById('hideBar'),t=document.getElementById('hideTxt'),h=document.getElementById('hideHeat');
    if(b)b.style.width=(100-p*100)+'%';if(t)t.textContent=fmtClock(HIDE_MS*(1-p));if(h)h.textContent=S.heat+'%';renderTop();if(p>=1)hideStop(false)},250)}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(rest.on)restStop(true);if(hide.on)hideStop(true)}});
window.addEventListener('hashchange',()=>{if(location.hash.slice(1)!=='verblijf'){if(rest.on)restStop(true);if(hide.on)hideStop(true)}});
V.verblijf=()=>{const h=home(),hi=HOMES.indexOf(h),ri=rankIdx(S.xp),p=restProgress();
 const perks=x=>[x.rest+'s rust',x.en?'+'+x.en+' max. energie':null,x.hp?(x.hp>=100?'volledig herstel':'+'+x.hp+' gezondheid'):null,x.heat?'-'+x.heat+' hitte per nacht':null].filter(Boolean);
 return `<h1>Verblijf</h1><p class="sub">Iedereen begint op straat. Rust hier om je energie aan te vullen, maar blijf op deze pagina: ga je weg, dan houd je alleen wat je tot dan toe hebt gerust.</p>
 <div class="home">
  <section class="card hud home-now ${rest.on?'resting':''}">
   <div class="home-scene s-${h.id}" aria-hidden="true"><i class="moon"></i><i class="z z1">z</i><i class="z z2">z</i><i class="z z3">z</i><div class="bed"></div></div>
   <div class="home-body">
    <div class="label">${h.place}</div><h2 class="home-n">${h.n}</h2><p class="home-d">${h.d}</p>
    <div class="home-meter"><div class="row"><span>Energie</span><b id="restEn">${Math.floor(S.energy)} / ${EN_MAX}</b></div>
     <div class="bar big"><i id="restBar" style="width:${p*100}%;background:var(--ice)"></i></div>
     <div class="home-hint">${rest.on?`Aan het rusten · <b id="restTxt">${Math.round(p*100)}%</b> · niet weggaan`:`Rusten duurt ${h.rest} seconden${h.hp?' en geeft ook gezondheid terug':''}.`}</div></div>
    <button class="btn kk-go" onclick="${rest.on?'restStop(true)':'restStart()'}" ${inJail()?'disabled':''}>${inJail()?'Je zit vast':rest.on?'Opstaan':'Rusten'}</button>
   </div>
  </section>
  <section class="card hidecard ${hide.on?'on':''} ${S.heat>=100?'hot':''}">
   <div><div class="label">Hitte</div><div class="big" id="hideHeat" style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}">${S.heat}%</div></div>
   <div class="hide-body"><h3>Onderduiken</h3><p>${S.heat>=100?'De hele stad zoekt je. Duik onder tot het overwaait.':'Blijf binnen, gordijnen dicht, telefoon uit.'} In 5 minuten zakt je hitte naar 0. Ga je eerder weg, dan houd je wat er tot dan toe gezakt is.${S.wanted?' Duik je de volle 5 minuten onder, dan sta je ook niet meer op de gezochtlijst.':''}</p>
    <div class="bar"><i id="hideBar" style="width:${hide.on?100-hideProgress()*100:S.heat}%;background:var(--red)"></i></div>
    ${hide.on?`<div class="home-hint">Ondergedoken · nog <b id="hideTxt">${fmtClock(HIDE_MS*(1-hideProgress()))}</b> · niet weggaan</div>`:''}</div>
   <button class="btn ${hide.on?'ghost':'red'}" onclick="${hide.on?'hideStop(true)':'hideStart()'}" ${(!hide.on&&(S.heat<=0||rest.on))||inJail()?'disabled':''}>${hide.on?'Stoppen':S.heat<=0?'Geen hitte':'Onderduiken'}</button>
  </section>
  <div class="tierhead"><h2>Verhuizen</h2><span>Een beter onderkomen rust sneller en geeft meer energie</span></div>
  <div class="homes">${HOMES.map((x,i)=>{const own=i<=hi,cur=i===hi,lock=ri<x.r,afford=S.cash>=x.p;
   return `<article class="hcard ${cur?'cur':''} ${own&&!cur?'past':''} ${lock?'locked':''}">
    <div class="label">${x.place}</div><h3>${x.n}</h3>
    <ul>${perks(x).map(t=>`<li>${t}</li>`).join('')}</ul>
    ${cur?'<div class="hstate">Hier woon je</div>':own?'<div class="hstate">Achter je gelaten</div>':
      `<button class="btn ${afford&&!lock?'':'ghost'}" onclick="act.moveHome('${x.id}')" ${lock||!afford||i!==hi+1||rest.on?'disabled':''}>${lock?'Vanaf '+RANKS[x.r][0]:i!==hi+1?'Eerst de vorige':'Verhuizen · '+fmt(x.p)}</button>`}
   </article>`}).join('')}</div>
 </div>`};
Object.assign(act,{moveHome(id){const i=HOMES.findIndex(h=>h.id===id),cur=HOMES.indexOf(home()),x=HOMES[i];
  if(i!==cur+1||rankIdx(S.xp)<x.r||S.cash<x.p||rest.on)return;S.cash-=x.p;S.home=id;if(x.heat)S.heat=Math.max(0,S.heat-x.heat);
  SFX.big();toast('Verhuisd naar '+x.n+' ('+x.place+')','lvl');log('Verhuisd naar '+x.n+', '+x.place,'ok');addXp(Math.floor(x.p/400));save();render()}});
