// Renderen, nieuwsticker, tijd/inkomen en de spel-loop
// Bij hertekenen op dezelfde pagina blijft je scrollpositie staan (telefoon sprong anders naar boven)
function render(){const y=window.scrollY,same=render._p===page;render._p=page;applySection();renderNav();renderTop();renderRail();const vw=$('#view');vw.innerHTML=crumbHtml()+V[page]();vw._h=null;if(same&&y)window.scrollTo(0,y);if(page==='casino'&&casinoTab==='roulette')drawWheel(rl.angle)}
// Nieuwsticker met gebeurtenissen uit de onderwereld
function news(){const n=S.npcs[rnd(0,S.npcs.length-1)].n;const T=[
  ()=>n+' heeft een juwelier in Utrecht overvallen',()=>n+' is gepromoveerd tot '+RANKS[rankIdx(S.npcs.find(p=>p.n===n).xp)][0],
  ()=>n+' zit '+rnd(1,10)+' minuten vast na een mislukte klus',()=>'Politie verhoogt controles in '+['Rotterdam','Amsterdam','Den Haag','Eindhoven'][rnd(0,3)],
  ()=>n+' won '+fmt(rnd(5,90)*1000)+' aan de blackjacktafel',()=>n+' koopt een nachtclub aan de Zeedijk',()=>'Lading van 400 kilo onderschept in de haven'];
  S.news.unshift(T[rnd(0,T.length-1)]());S.news=S.news.slice(0,6);renderTicker()}
// (de nieuwsband bovenaan is weg; het nieuws staat nog in S.news)
function renderTicker(){}
function tick(){
  const t=now(),dt=(t-S.last)/60000;S.last=t;const mins=Math.min(dt,720);
  if(mins>0){bizPayTick(mins,t);S._enAcc=(S._enAcc||0)+mins*60/EN_REGEN_S*(1+furnFx('enRegen')+fitFx('en'));if(S._enAcc>=1){S.energy=Math.min(EN_MAX,S.energy+Math.floor(S._enAcc));S._enAcc%=1}const hd=mins*2*(1+furnFx('heat'));S.heat=Math.max(0,S.heat-Math.floor(hd>=1?hd:Math.random()<hd?1:0));
    if(typeof hideTick==='function')hideTick(mins,mins<.2);
    if(Math.random()<mins*6*(1+furnFx('hpRegen')))S.hp=Math.min(100,S.hp+1);
    if(typeof bankTick==='function')bankTick(mins);
    if(typeof famDaily==='function')famDaily();
    S.npcs.forEach((n,i)=>{n.xp+=mins*(4+i*3)*(0.5+Math.random());n.cash+=mins*(30+i*60)*(Math.random()*2-0.3)})}
  save();
}
// aanpassingen door een beheerder: meldingen tonen, energie bijvullen
if(S._admin){const A=S._admin;if(A.refill){S.energy=Math.max(S.energy,EN_MAX);S.hp=100}(A.notes||[]).forEach((t,i)=>{setTimeout(()=>toast(t,'lvl'),600+i*400);log(t,'ok')});delete S._admin;save()}
// Autoclicker-signaal voor beheerders: sneller of regelmatiger klikken dan een mens kan. Alleen echte klikken tellen (geen toetsen).
(function(){const T=[];let last=0;const send=d=>{if(!window.__TOKEN__||Date.now()-last<120000)return;last=Date.now();
  fetch('/api/flag',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.__TOKEN__},body:JSON.stringify({kind:'autoclick',detail:d})}).catch(()=>{})};
 document.addEventListener('pointerdown',e=>{if(!e.isTrusted)return;const t=performance.now();T.push(t);while(T.length&&t-T[0]>10000)T.shift();
  if(T.length>=80){send(`${T.length} klikken in 10 seconden (${(T.length/10).toLocaleString('nl-NL')} per seconde, lang volgehouden)`);T.length=0;return}
  if(T.length>=30){const iv=[];for(let i=T.length-30+1;i<T.length;i++)iv.push(T[i]-T[i-1]);const m=iv.reduce((a,b)=>a+b,0)/iv.length,sd=Math.sqrt(iv.reduce((a,b)=>a+(b-m)*(b-m),0)/iv.length);
   if(m<600&&sd<4){send(`30 klikken met een machinaal vast ritme: elke ${Math.round(m)} ms (afwijking ±${sd.toFixed(1)} ms)`);T.length=0}}},true)})();
// een bonus die nog liep (verversen of ander apparaat): het geld staat al op je saldo, het spel biedt aan om hem verder af te spelen
if(S.slotRun){const n=S.slotRun.g==='vis'?'Visdief':'Kluiskraker';setTimeout(()=>toast('Je bonus in '+n+' loopt nog. Het geld staat al op je saldo; open '+n+' om hem verder af te spelen.','lvl'),900)}
if(S._gearBack){toast('Uitrusting vernieuwd: per soort telt nu je beste item. Je krijgt '+fmt(S._gearBack)+' terug voor overbodige spullen.','lvl');log('Uitrusting: '+fmt(S._gearBack)+' terug voor overbodige spullen','ok');delete S._gearBack}
// offline-inkomen bij openen
// bij openen: wat je bedrijven offline verdienden (tot 12 uur) gaat in de kas; is er intussen een speldag voorbij, dan volgt de uitbetaling
(()=>{tick()})();

// snelkoppelingen: #ontspannen en #trainen openen de trainingspagina op het juiste deel
window.addEventListener('hashchange',()=>{let p=location.hash.slice(1);if(p==='ontspannen'||p==='trainen'){if(window.trs)trs.tab=p==='ontspannen'?'relax':'train';p='skills';try{history.replaceState(null,'','#skills')}catch(e){}}if(PAGES.find(x=>x[0]===p)){
  // naar het casino vanaf een andere pagina: eerst de lobby (behalve als je via zoeken een spel koos of er nog iets loopt)
  if(p==='casino'&&page!=='casino'&&!window._casPick&&typeof casSwitchBusy==='function'&&!casSwitchBusy()&&!(window.kk&&kk.inBonus))casinoTab='';window._casPick=0;
  if(p==='verblijf'&&page!=='verblijf'&&window.vb)vb.view=null;
  if(p==='crimes'&&page!=='crimes'&&typeof crimeRank!=='undefined')crimeRank=null;
  if(p==='shop'&&page!=='shop'&&window.gsel)gsel.shop=null;
  if(p==='look'&&page!=='look'&&typeof fitUI!=='undefined')fitUI.street=null;
  page=p;render();window.scrollTo(0,0)}});
let wasJail=inJail();
setInterval(()=>{tick();renderTop();renderNav();if(!(window.kk&&kk.busy))renderRail();
  // casino: saldo van de slots live bijwerken (passief inkomen loopt door), knoppen opnieuw als je ineens wel/niet genoeg hebt
  if(page==='casino'&&!userBusy()){[['kk','kkBal',()=>SLOT.BUY_COST,()=>kkBet(),()=>kkRefreshUI()],['vd','vdBal',()=>VISD.BUY_COST,()=>vdBet(),()=>vdRefresh()]].forEach(([g,id,bc,bt,ref])=>{const st=window[g],el=document.getElementById(id);if(!st||!el||st.busy)return;
    el.textContent=fmt(S.cash);const ok=(S.cash>=bt())+'/'+(S.cash>=bt()*bc());if(st._ok!==ok){st._ok=ok;ref()}})}
  // verblijf: alleen opnieuw tekenen als je ineens wel/niet genoeg geld hebt voor inrichting of een woning (tafereel blijft rustig)
  if(page==='verblijf'&&!userBusy()&&typeof FURN!=='undefined'){const sig=FURN.map(f=>S.cash>=f.p?1:0).join('')+HOMES.map(h=>S.cash>=h.p?1:0).join('');if(window._vbSig!==sig){if(window._vbSig!=null&&!stay.kind)render();window._vbSig=sig}}
  if(Math.random()<0.05)news();
  if(S.wanted&&!S.hide&&!inJail()&&$('#modal').hidden&&Math.random()<0.004*(typeof wantedK==='function'?wantedK('tick'):1)){policeRaid();return}
  if(wasJail&&!inJail()){toast('Je bent vrijgelaten');wasJail=false;render()}else if(inJail())wasJail=true;
  const focusIn=document.activeElement&&document.activeElement.tagName==='INPUT';
  // pagina's met aftellers: alleen bijwerken als er iets veranderd is, en niet midden in het scrollen (telefoon)
  if(!focusIn&&!spinning&&['crimes','hits','jail','dash','skills','bank','biz','shop','fam','profiel'].includes(page)&&!window.__chase&&!userBusy()){const y=window.scrollY;if(setHTML($('#view'),crumbHtml()+V[page]())&&y&&Math.abs(window.scrollY-y)>2)window.scrollTo(0,y)}
},1000);
render();renderTicker();
if(!inJail())setTimeout(resumePending,300);else{S.pendingArrest=null;S.pendingHeist=null;S.pendingHit=null}
