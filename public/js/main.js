// Renderen, nieuwsticker, tijd/inkomen en de spel-loop
// Bij hertekenen op dezelfde pagina blijft je scrollpositie staan (telefoon sprong anders naar boven)
function render(){const y=window.scrollY,same=render._p===page;render._p=page;applySection();renderNav();renderTop();renderRail();const vw=$('#view');vw.innerHTML=crumbHtml()+V[page]();vw._h=null;if(same&&y)window.scrollTo(0,y);if(page==='casino'&&casinoTab==='roulette')drawWheel(rl.angle)}
// Nieuwsticker met gebeurtenissen uit de onderwereld
function news(){const n=S.npcs[rnd(0,S.npcs.length-1)].n;const T=[
  ()=>n+' heeft een juwelier in Utrecht overvallen',()=>n+' is gepromoveerd tot '+RANKS[rankIdx(S.npcs.find(p=>p.n===n).xp)][0],
  ()=>n+' zit '+rnd(1,10)+' minuten vast na een mislukte klus',()=>'Politie verhoogt controles in '+['Rotterdam','Amsterdam','Den Haag','Eindhoven'][rnd(0,3)],
  ()=>n+' won '+fmt(rnd(5,90)*1000)+' aan de blackjacktafel',()=>n+' koopt een nachtclub aan de Zeedijk',()=>'Lading van 400 kilo onderschept in de haven'];
  S.news.unshift(T[rnd(0,T.length-1)]());S.news=S.news.slice(0,6);renderTicker()}
function renderTicker(){if(!S.news.length)news();const t=S.news.map(s=>`<span>◆ ${s}</span>`).join('');$('#ticker').innerHTML=`<b>LIVE</b><div class="tk"><div class="tkin">${t}${t}</div></div>`}
function tick(){
  const t=now(),dt=(t-S.last)/60000;S.last=t;const mins=Math.min(dt,720);
  if(mins>0){S.cash+=income()*mins;S._enAcc=(S._enAcc||0)+mins*60/EN_REGEN_S*(1+furnFx('enRegen'));if(S._enAcc>=1){S.energy=Math.min(EN_MAX,S.energy+Math.floor(S._enAcc));S._enAcc%=1}const hd=mins*2*(1+furnFx('heat'));S.heat=Math.max(0,S.heat-Math.floor(hd>=1?hd:Math.random()<hd?1:0));
    if(typeof hideTick==='function')hideTick(mins,mins<.2);
    if(Math.random()<mins*6*(1+furnFx('hpRegen')))S.hp=Math.min(100,S.hp+1);
    S.bank*=Math.pow(1.01,mins/10);
    S.npcs.forEach((n,i)=>{n.xp+=mins*(4+i*3)*(0.5+Math.random());n.cash+=mins*(30+i*60)*(Math.random()*2-0.3)})}
  save();
}
// offline-inkomen bij openen
(()=>{const away=(now()-S.last)/60000;if(away>1&&income()>0){const g=income()*Math.min(away,720);toast('Terwijl je weg was: +'+fmt(g)+' passief inkomen');log('Offline inkomen: '+fmt(g),'ok')}tick()})();

window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(PAGES.find(x=>x[0]===p)){page=p;render();window.scrollTo(0,0)}});
let wasJail=inJail();
setInterval(()=>{tick();renderTop();renderNav();if(!(window.kk&&kk.busy))renderRail();
  if(Math.random()<0.05)news();
  if(S.wanted&&!S.hide&&!inJail()&&$('#modal').hidden&&Math.random()<0.004){policeRaid();return}
  if(wasJail&&!inJail()){toast('Je bent vrijgelaten');wasJail=false;render()}else if(inJail())wasJail=true;
  const focusIn=document.activeElement&&document.activeElement.tagName==='INPUT';
  // pagina's met aftellers: alleen bijwerken als er iets veranderd is, en niet midden in het scrollen (telefoon)
  if(!focusIn&&!spinning&&['crimes','jail','dash','skills'].includes(page)&&!window.__chase&&!userBusy()){const y=window.scrollY;if(setHTML($('#view'),crumbHtml()+V[page]())&&y&&Math.abs(window.scrollY-y)>2)window.scrollTo(0,y)}
},1000);
render();renderTicker();
if(!inJail())setTimeout(resumePending,300);else{S.pendingArrest=null;S.pendingHeist=null}
