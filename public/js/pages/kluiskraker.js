// Casino: Kluiskraker v3 — cluster-slot met vermenigvuldigvakjes, geluid en vloeiende tumbles.
// Engine: js/slot.js · iconen: js/icons.js · geluid: js/sfx.js
const KK_BETS_STD=[10,20,30,40,50,100,150,200,250,300,400,500,750,1000,1500,2000,3000,5000,7500,10000,15000,20000,25000,30000,40000,50000];
// Code 'trainwreck': high roller, inzet tot €500.000 per spin
const KK_HIGH=[100000,200000,250000,500000];
// hoge inzetten: High roller-lidmaatschap of de code trainwreck
const isHighRoller=()=>isHR()||!!(S&&S.redeemed&&S.redeemed.includes('trainwreck'));
const kkBets=()=>isHighRoller()?KK_BETS_STD.concat(KK_HIGH):KK_BETS_STD;
window.kk={bi:4,busy:false,turbo:false,confirm:false,grid:null,spots:null,msg:'Kies je inzet en draai',stepWin:0,fs:null,lastWin:0,shown:0};
const kkBet=()=>{const B=kkBets();if(kk.bi>=B.length)kk.bi=B.length-1;return B[kk.bi]};
const kkFast=()=>kk.turbo||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const KK_T=()=>kkFast()?{base:140,per:16,col:22,hold:380,pop:180}:{base:230,per:34,col:42,hold:640,pop:250};
function kkDemoGrid(){const g=[];for(let c=0;c<SLOT.COLS;c++){g.push([]);for(let r=0;r<SLOT.ROWS;r++)g[c].push({s:(c*2+r*3)%SLOT.SYMS.length})}return g}
// anim: 'none' (statisch), 'all' (nieuwe spin: alles valt), 'tumble' (alleen cellen met fall>0)
// Spanning: liggen er na een kolom 2+ kluizen, dan vallen de volgende kolommen trager en lichten ze op (3, dan 4, dan 5 …)
function kkPlan(g){const T=KK_T(),step=kkFast()?260:640,slow=kkFast()?1.3:1.7;let cnt=0,extra=0;const P=[];
 for(let c=0;c<SLOT.COLS;c++){const tease=cnt>=2;if(tease)extra+=step;P.push({delay:c*T.col+extra,slow:tease?slow:1,tease,cnt});cnt+=g[c].filter(x=>x.sc).length}
 return P}
function kkCell(x,c,r,anim){
  const T=KK_T();let f=0,delay=0,dur=0;
  if(anim==='all'){const pl=kk.plan&&kk.plan[c];f=SLOT.ROWS;delay=(pl?pl.delay:c*T.col)+(SLOT.ROWS-1-r)*8;dur=(T.base+f*T.per)*(pl?pl.slow:1)}
  else if(anim==='tumble'&&x.fall){f=x.fall;delay=c*Math.round(T.col/2);dur=T.base+f*T.per}
  const st=f?`style="--f:${f};--d:${Math.round(delay)}ms;--t:${Math.round(dur)}ms"`:'';
  const cls='kk-cell'+(f?' fall':'')+(x.sc?' sc':'')+(x.w?' wild':'')+(x.bar?' gbar':'')+(x.fresh?' fresh':'');
  const icon=x.bar?kkSvg('baar'):x.sc?kkSvg('kluis'):x.w?kkSvg('sleutel'):kkSvg(SLOT.SYMS[x.s].id);
  return `<div class="${cls}" data-k="${c*SLOT.ROWS+r}" ${st}>${icon}${x.w?'<span class="wl">Loper</span>':''}</div>`;
}
function kkCellsHtml(g,anim){kk.plan=anim==='all'?kkPlan(g):null;let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++)h+=kkCell(g[c][r],c,r,anim);return h}
function kkSpotsHtml(sp,prev){let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++){const v=sp?sp[c][r]:0;
  const lv=v>=2?Math.min(10,Math.log2(v)):0;const nw=prev&&prev[c][r]!==v;
  const gb=kk.fs&&kk.fs.barCells&&kk.fs.barCells.some(([x,y])=>x===c&&y===r);
  h+=`<div class="kk-spot${v===1?' mk':''}${v>=2?' mx lv'+lv:''}${nw?' bump':''}${gb?' gb':''}">${v>=2?'<b>x'+v+'</b>':''}${gb?`<i class="kk-gb">${kkSvg('baar')}</i>`:''}</div>`}return h}
function kkInfo(){const fs=kk.fs;const pend=window.slotPending||0;
  return `<div class="kk-bal"><span class="label">Saldo</span><b id="kkBal">${fmt(S.cash-pend+(kk.shown||0))}</b></div>
   <div class="kk-stat"><span class="label">Deze spin</span><b id="kkStep" class="acc">${fmt(kk.stepWin)}</b></div>
   <div class="kk-stat"><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="kkLast" class="grn">${fmt(fs?fs.total:kk.lastWin)}</b></div>
   ${fs?`<div class="kk-stat fsb"><span class="label">${fs.kind==='super'?'Superbonus':'Free spins'}</span><b id="kkMsg">${fs.at} / ${fs.of}</b></div>`:`<div class="kk-stat"><span class="label">Status</span><b id="kkMsg" class="sm">${kk.msg}</b></div>`}`}
// Gouden baren in de gewone bonus: ze blijven staan, bij 3 is het de max win
const kkBarsHtml=n=>`<span class="kk-bars" aria-label="${n} van ${SLOT.BAR.need} Gouden baren">${Array.from({length:SLOT.BAR.need},(_,i)=>`<i class="${i<n?'on':''}">${kkSvg('baar')}</i>`).join('')}</span>`;
// doorgerekend per lidmaatschap (sim9.js en simbuy4.js): bonus 1 op …, superbonus 1 op …, RTP spinnen en bonus kopen
const KK_TIER=[{b:200,sup:'15.000',rtp:'93',buy:'94,5'},{b:175,sup:'13.000',rtp:'95',buy:'95,5'},{b:145,sup:'7.500',rtp:'97',buy:'96,5'}];
const kkTierTag=()=>isHR()?'<span class="vip hr">HIGH ROLLER</span>':isVip()?'<span class="vip gold">VIP</span>':'';
function kkSubHtml(){const fs=kk.fs;return fs?(fs.kind==='super'?`<span class="vip gold">Superbonus</span><span class="kk-subtxt"> Meer lopers. Eén Gouden baar = max win</span>`:`<span class="vip">Bonus</span>${kkBarsHtml(fs.bars||0)}<span class="kk-subtxt"> 3 Gouden baren = max win</span>`)
  :`${kkTierTag()}<span class="kk-subtxt">${(I=>` bonus ±1 op ${I.b} · superbonus ±1 op ${I.sup} · RTP ±${I.rtp}% · bonus kopen ±${I.buy}%`)(KK_TIER[tier()])} · max ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× je inzet</span>`}
function kkPayTab(){const b=kkBet(),sizes=[5,6,7,8,9,10,11,12,13,14,15],k=SLOT.BASE_K*(SLOT.VIP_KT[tier()]||1),fsPct=Math.round(SLOT.FS_K/k*100);
 return `<div class="kk-pay-h"><div class="label">Uitbetaling per cluster bij ${fmt(b)} inzet (basisspel${isVip()?' als '+lidName():''} · in de bonus ${fsPct}% daarvan, maar de vakjes blijven staan)</div><span class="label">Aantal aaneengesloten symbolen</span></div>
  <div class="kk-ptab-w"><div class="kk-ptab" style="grid-template-columns:44px repeat(${sizes.length},minmax(72px,1fr))"><span></span>${sizes.map(n=>`<span class="label">${n}${n===15?'+':''}</span>`).join('')}
   ${SLOT.SYMS.slice().reverse().map(s=>`<span>${kkSvg(s.id)}</span>${sizes.map(n=>`<span>${fmt(s.pay[Math.min(n,15)-SLOT.MIN_CLUSTER]*k*b)}</span>`).join('')}`).join('')}</div></div>`}
function kkView(){
 const fs=kk.fs,g=kk.grid||kkDemoGrid();
 return `<div class="kk kk3 ${fs?'is-fs':''} ${fs&&fs.kind==='super'?'is-super':''}">
 <div class="kk-stage" id="kkStage">
  <div class="kk-head"><div class="kk-title">Kluis<span>kraker</span></div>
   <div class="kk-sub"><span id="kkSub">${kkSubHtml()}</span>
    <button class="kk-snd" id="kkSnd" onclick="SFX.toggle();this.textContent=SFX.on?'🔊':'🔇'" aria-label="Geluid aan of uit">${SFX.on?'🔊':'🔇'}</button></div></div>
  <div class="kk-board" id="kkBoard">
   <div class="kk-layer kk-spots" id="kkSpots">${kkSpotsHtml(kk.spots)}</div>
   <div class="kk-layer kk-cells" id="kkCells">${kkCellsHtml(g,'none')}</div>
   <div class="kk-layer kk-fx" id="kkFx"></div>
   <div id="kkBanner"></div>
   ${kk.paused?`<div class="kk-banner pause"><div><b>Gepauzeerd</b><span>${kk.fs?'Free spin '+kk.fs.at+' van '+kk.fs.of+' · '+fmt(kk.fs.total)+' gewonnen':'Je bonus staat klaar'}</span><button class="btn kk-go" style="margin-top:18px" onclick="kkResume()">Bonus verder afspelen</button></div></div>`:''}
  </div>
  <div class="kk-bar"><div class="kk-hud" id="kkInfo">${kkInfo()}</div><div class="kk-ctl" id="kkCtl">${kkControls()}</div></div>
  <div id="kkPickBox">${kk.pick&&!kk.busy?kkPickHtml():''}</div>
  <div id="kkConfirmBox">${kk.buyMode&&!kk.busy?kkConfirm():''}</div>
  <div id="kkSeedBox">${kkSeedHtml()}</div>
 </div>
 <section class="card kk-pay"><div id="kkPayTab">${kkPayTab()}</div>
  <div class="kk-rules">
   <div><span>${kkSvg('sleutel')}</span><p><b>Loper</b> telt mee voor elk symbool en verbindt groepjes. In de bonus valt hij vaker.</p></div>
   <div><span class="kk-mini mk"></span><p><b>Vakje</b> raakt gemarkeerd waar een winst verdwijnt. Opnieuw raak: x2, dan x4, x8 … tot x${SLOT.MAX_SPOT}. In de bonus blijven vakjes staan.</p></div>
   <div><span>${kkSvg('kluis')}</span><p><b>3 kluizen</b> = ${SLOT.FS_BY_SC[3]} free spins, <b>4</b> = ${SLOT.FS_BY_SC[4]}, <b>5</b> = ${SLOT.FS_BY_SC[5]}. Extra kluizen <b>tumbelen erin</b>: zolang er winst valt, vallen er nieuwe symbolen in en liggen er al 3 kluizen, dan valt een 4e, 5e of 6e makkelijker in. Geen winst, geen tumble. In de bonus blijft elke <b>Gouden baar</b> staan; heb je er 3, dan win je de max win. Hoe meer kluizen bij de start, hoe meer spins en hoe groter die kans. Vakjes kunnen oplopen tot x${SLOT.MAX_SPOT.toLocaleString('nl-NL')}, maar je wint nooit meer dan ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× je inzet per ronde. In de bonus: 2 kluizen = +${SLOT.FS_RETRIG[2]}, 3 = +${SLOT.FS_RETRIG[3]}, 4 = +${SLOT.FS_RETRIG[4]}, 5+ = +${SLOT.FS_RETRIG[5]} spins.</p></div>
   <div><span>${kkSvg('baar')}</span><p><b>6+ kluizen = superbonus</b>: ${SLOT.SUPER_SPINS} spins met veel meer lopers (dus veel grotere winsten), 25% meer kans op extra kluizen en hier is één <b>Gouden baar</b> al genoeg voor ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× je inzet. Ook met een gekochte bonus kun je doortumbelen tot de superbonus.</p></div>
   <div><span class="kk-mini key">␣</span><p><b>Spatiebalk</b> = draaien, ingedrukt houden blijft draaien. Klik op je inzet om meteen een bedrag te kiezen.${(I=>isVip()?` Als <b>${lidName()}</b> kom je vaker in de bonus (±1 op ${I.b} in plaats van ${KK_TIER[0].b}), tumbelt er vaker een extra kluis in (ook bij een gekochte bonus) en haal je de superbonus vaker (±1 op ${I.sup}). Daarvoor betalen clusters in het basisspel ${Math.round((1-SLOT.VIP_KT[tier()])*100)}% minder.`:` <b>VIP</b> komt ±15% vaker in de bonus (±1 op ${KK_TIER[1].b}), <b>High roller</b> ±40% (±1 op ${KK_TIER[2].b}).`)(KK_TIER[tier()])} De max win is ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× je inzet per ronde, ook bij een gekochte bonus: via de vakjes (tot x${SLOT.MAX_SPOT.toLocaleString('nl-NL')}) of met 3 Gouden baren.</p></div>
  </div>
 </section></div>`;
}
// Seed: elke spin komt uit jouw seed + spinnummer. "Nieuwe seed" geeft een nieuwe reeks uitkomsten (de kans per spin blijft gelijk).
const kkHex=n=>Array.from(crypto.getRandomValues(new Uint32Array(n)),x=>x.toString(16).padStart(8,'0')).join('');
const kkNewSd=prev=>({s:kkHex(4),c:kkHex(2),n:0,spins:0,bon:0,sup:0,buys:0,at:Date.now(),prev:prev||null});
function kkSeed(){if(!S.kkSeed||!S.kkSeed.s)S.kkSeed=kkNewSd(S.kkSeed&&S.kkSeed.prev);return S.kkSeed}
const kkSeedId=sd=>SLOT.seedHash(sd.s+sd.c).slice(0,2).map(x=>x.toString(16).padStart(8,'0')).join('').replace(/^(.{6}).*(.{4})$/,'$1…$2');
function kkSeedHtml(){const sd=kkSeed(),p=sd.prev;
 return `<div class="kk-seed"><div class="kk-seed-i"><span class="label">Seed</span><b>${kkSeedId(sd)}</b></div>
  <div class="kk-seed-i"><span class="label">Op deze seed</span><b>${sd.spins} spin${sd.spins===1?'':'s'} · ${sd.bon} bonus${sd.bon===1?'':'sen'}${sd.sup?' · '+sd.sup+' super':''}</b></div>
  ${p?`<div class="kk-seed-i prev"><span class="label">Vorige seed</span><b>${p.id} · ${p.spins} spins · ${p.bon} bonus${p.bon===1?'':'sen'}</b></div>`:''}
  <button class="btn ghost sm" onclick="act.kkNewSeed()" ${kk.busy?'disabled':''}>Nieuwe seed</button></div>`}
function kkConfirm(){const b=kkBet(),buy=b*SLOT.BUY_COST;return `<div class="kk-buyinfo"><b>Bonus kopen staat aan · ${fmt(buy)} per bonus</b><span>Elke klik op de grote knop koopt een bonus voor ${fmt(buy)} (${SLOT.BUY_COST}× je inzet van ${fmt(b)}). Je krijgt altijd 3 kluizen; valt er vanzelf al een kluis, dan heb je er meteen 4. Valt er winst, dan tumbelt hij door en kunnen er nog meer bij vallen (vaker dan bij gewoon spinnen${isVip()?', en als '+lidName()+' valt er vaker vanzelf een':''}). Een gekochte bonus geeft ${SLOT.BUY_EXTRA} extra free spin: 3 kluizen = ${SLOT.FS_BY_SC[3]+SLOT.BUY_EXTRA}, 4 = ${SLOT.FS_BY_SC[4]+SLOT.BUY_EXTRA}, 5 = ${SLOT.FS_BY_SC[5]+SLOT.BUY_EXTRA}, superbonus ${SLOT.SUPER_SPINS+SLOT.BUY_EXTRA_SUP}. Winst in die spin krijg je ook. Zet hem uit om weer gewoon te draaien.</span></div>`}
// Inzet kiezen in een pop-up (Kluiskraker en Visdief): klik op een bedrag en de pop-up gaat meteen dicht.
// game = 'kk' of 'vd'. Toont per bedrag ook wat een gekochte bonus kost.
function slotBetPop(game){const B=kkBets(),cur=game==='kk'?kk.bi:vd.bi,cost=game==='kk'?SLOT.BUY_COST:VISD.BUY_COST,buy=game==='kk'?kk.buyMode:vd.buyMode;
 const groups=[['Klein',v=>v<300],['Middel',v=>v>=300&&v<5000],['Groot',v=>v>=5000&&v<=50000],['High roller',v=>v>50000]];
 const pick=`${game==='kk'?'kkSetBet':'vdSetBet'}`;let el=document.getElementById('slotPop');if(!el){el=document.createElement('div');el.id='slotPop';document.body.appendChild(el)}
 el.innerHTML=`<div class="sp-back" onclick="slotPopClose()"></div><div class="sp-card" role="dialog" aria-label="Inzet kiezen">
  <div class="sp-h"><div><span class="label">${game==='kk'?'Kluiskraker':'Visdief'}</span><b>Kies je inzet</b></div><button class="sp-x" onclick="slotPopClose()" aria-label="Sluiten">✕</button></div>
  <div class="sp-now"><span>Contant <b>${fmt(S.cash)}</b></span><span>Nu <b>${fmt(B[cur])}</b>${buy?` · bonus ${fmt(B[cur]*cost)}`:''}</span></div>
  ${groups.map(([n,f])=>{const ix=B.map((v,i)=>[v,i]).filter(([v])=>f(v));if(!ix.length)return '';
   return `<div class="sp-g"><span class="label">${n}${n==='High roller'?' <i class="vipt">HIGH ROLLER</i>':''}</span><div class="sp-grid">${ix.map(([v,i])=>`<button class="${i===cur?'on':''} ${S.cash<(buy?v*cost:v)?'no':''}" onclick="${pick}(${i});slotPopClose()"><b>${fmt(v)}</b><small>bonus ${fmt(v*cost)}</small></button>`).join('')}</div></div>`}).join('')}
  <div class="sp-q"><button class="btn ghost sm" onclick="${pick}(0);slotPopClose()">Min · ${fmt(B[0])}</button><button class="btn ghost sm" onclick="${pick}(${B.map((v,i)=>[v,i]).filter(([v])=>v<=S.cash).pop()?.[1]??0});slotPopClose()">Wat ik kan · ${fmt((B.filter(v=>v<=S.cash).pop())||B[0])}</button><button class="btn sm" onclick="${pick}(${B.length-1});slotPopClose()">Max · ${fmt(B[B.length-1])}</button></div>
 </div>`;requestAnimationFrame(()=>el.classList.add('on'))}
function slotPopClose(){const el=document.getElementById('slotPop');if(el)el.remove()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')slotPopClose()});
window.addEventListener('hashchange',slotPopClose);
// Inzet kiezen: klik op het bedrag en kies direct, van €10 tot max €50.000
function kkPickHtml(){return `<div class="kk-pick"><div class="kk-pick-h"><b>Kies je inzet${isHighRoller()?' <i class="vipt" style="margin-left:6px">HIGH ROLLER</i>':''}</b><button class="btn ghost sm" onclick="kk.pick=false;kkRefreshUI()">Sluiten</button></div>
  <div class="kk-pick-g">${kkBets().map((v,i)=>`<button class="${i===kk.bi?'on':''} ${S.cash<v?'no':''}" onclick="kkSetBet(${i})">${fmt(v)}</button>`).join('')}</div>
  <div class="kk-pick-q"><button class="btn ghost sm" onclick="kkSetBet(0)">Min · ${fmt(kkBets()[0])}</button><button class="btn sm" onclick="kkSetBet(kkBets().length-1)">Max · ${fmt(kkBets()[kkBets().length-1])}</button></div></div>`}
function kkSetBet(i){if(kk.busy)return;kk.bi=Math.max(0,Math.min(kkBets().length-1,i));kk.pick=false;kk.confirm=false;SFX.chip();kkRefreshUI()}
function kkControls(){const b=kkBet();return `<div class="kk-betbox"><span class="label">Inzet · klik om te kiezen</span>
   <div class="kk-bet"><button onclick="kkStepBet(-1)" ${kk.busy?'disabled':''} aria-label="Lagere inzet">−</button><button class="kk-betv" onclick="slotBetPop('kk')" ${kk.busy?'disabled':''} aria-label="Inzet kiezen" title="Klik om je inzet te kiezen">${fmt(b)}</button><button onclick="kkStepBet(1)" ${kk.busy?'disabled':''} aria-label="Hogere inzet">+</button></div></div>
   ${kk.buyMode?`<button class="btn kk-go buy" onclick="act.kkSpin(true)" ${kk.busy||inJail()||S.cash<b*SLOT.BUY_COST?'disabled':''}><span class="kk-buy-l">${kk.busy?'Bezig…':S.cash<b*SLOT.BUY_COST?'Te weinig geld':'Bonus kopen'}</span><b class="kk-buy-p">${fmt(b*SLOT.BUY_COST)}</b><small>${SLOT.BUY_COST}× je inzet van ${fmt(b)}</small></button>`
    :`<button class="btn kk-go" onclick="act.kkSpin(false)" ${kk.busy||inJail()?'disabled':''}>${kk.busy?'Bezig…':'Draaien'}<small>spatie</small></button>`}
   <div class="kk-small">
    <button class="btn ghost sm kk-turbo ${kk.turbo?'on':''}" onclick="kkTurbo()" aria-pressed="${kk.turbo}">${kk.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="kk-buyt ${kk.buyMode?'on':''}" onclick="kk.buyMode=!kk.buyMode;SFX.click();kkRefreshUI()" ${kk.busy?'disabled':''} aria-pressed="${!!kk.buyMode}"><i></i><span>Bonus kopen</span><small>${kk.buyMode?'aan':'uit'}</small></button>
   </div>`}
// Alleen de onderdelen bijwerken die veranderen (geen hele pagina, dus geen sprong naar boven op de telefoon)
function kkRefreshUI(){const root=document.querySelector('.kk3');if(!root)return;const fs=kk.fs;
 root.classList.toggle('is-fs',!!fs);root.classList.toggle('is-super',!!(fs&&fs.kind==='super'));
 const set=(id,h)=>{const e=kkEl(id);if(e)e.innerHTML=h};
 set('kkSub',kkSubHtml());kkInfoRefresh();set('kkCtl',kkControls());set('kkPickBox','');set('kkConfirmBox',kk.buyMode&&!kk.busy?kkConfirm():'');set('kkSeedBox',kkSeedHtml());set('kkPayTab',kkPayTab());
 if(!kk.busy){const st=kkEl('kkStage');if(st)st.classList.remove('vault-open')}}
// Snelheid mag ook tijdens een spin of bonus om: de volgende val/tumble gebruikt meteen het nieuwe tempo.
function kkTurbo(){kk.turbo=!kk.turbo;SFX.click();document.querySelectorAll('.kk-turbo').forEach(b=>{b.textContent=kk.turbo?'Snel: aan':'Snel: uit';b.classList.toggle('on',kk.turbo);b.setAttribute('aria-pressed',kk.turbo)})}
// Kluisdeur kraakt bij 3 tot 5 kluizen: per ronde kunnen er kluizen bijkomen; komt er een bij, dan kraakt hij opnieuw
async function kkCrack(rs){const board=kkEl('kkBoard');kk.inBonus=true;if(!rs.rounds||!rs.rounds.length)return;
 const start=rs.rounds[0].sc-rs.rounds[0].cells.length;
 SFX.bonus();await kkBanner(start+' kluizen','De kluisdeur kraakt… komt er nog een kluis bij?',1500,'fsin');
 for(let i=0;i<rs.rounds.length;i++){const R=rs.rounds[i];
  if(board)board.classList.add('crack');await kkWait(kkFast()?350:900);
  kkShow(R.grid,'none');const cells=kkEl('kkCells');
  if(cells)cells.querySelectorAll('.kk-cell').forEach(el=>{if(!el.classList.contains('sc'))el.classList.add('dim')});
  R.cells.forEach((cr,j)=>setTimeout(()=>SFX.scatter(Math.min(6,R.sc-R.cells.length+j)),j*200));
  await kkWait(kkFast()?450:1000);if(board)board.classList.remove('crack');
  if(R.cells.length&&R.sc<SLOT.SUPER_SC&&i<rs.rounds.length-1)await kkBanner(R.sc+' kluizen!','De deur kraakt opnieuw…',1100,'fsin')}
 const fin=rs.rounds[rs.rounds.length-1].sc;
 if(fin<SLOT.SUPER_SC)await kkBanner(fin+' kluizen',SLOT.FS_BY_SC[Math.min(5,fin)]+' free spins',1300,'')}
// Spatiebalk = draaien (ingedrukt houden = doordraaien); tijdens een pauze speelt spatie de bonus verder af
document.addEventListener('keydown',e=>{if(e.code!=='Space'||page!=='casino'||casinoTab!=='kluis'||window.__chase)return;
 const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!$('#modal').hidden)return;
 e.preventDefault();if(document.activeElement&&document.activeElement.tagName==='BUTTON')document.activeElement.blur();
 if(kk.paused){kkResume();return}if(kk.busy)return;if(kk.buyMode){if(!e.repeat)act.kkSpin(true);return}act.kkSpin(false)});
function kkStepBet(d){if(kk.busy)return;kk.bi=Math.max(0,Math.min(kkBets().length-1,kk.bi+d));kk.confirm=false;SFX.chip();kkRefreshUI()}
const kkOn=()=>page==='casino'&&casinoTab==='kluis'&&!document.hidden&&!!document.getElementById('kkCells');
// Tijdens een bonus pauzeert de animatie als je wegklikt; terug op de slot klik je 'Bonus verder afspelen'.
function kkGate(){return new Promise(res=>{kk.paused=true;kk._resume=res;if(kkOn())render()})}
function kkResume(){if(!kk.paused)return;kk.paused=false;SFX.click();render();const r=kk._resume;kk._resume=null;if(r)setTimeout(r,60)}
const kkWait=ms=>new Promise(async r=>{if(kk.inBonus&&(!kkOn()||kk.paused))await kkGate();setTimeout(r,kkOn()?ms:0)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&kk.paused&&page==='casino'&&casinoTab==='kluis')render()});
const kkEl=id=>document.getElementById(id);
function kkText(id,v){const el=kkEl(id);if(el)el.textContent=v}
function kkInfoRefresh(){const el=kkEl('kkInfo');if(el)el.innerHTML=kkInfo()}
function kkShow(g,anim){kk.grid=g;const el=kkEl('kkCells');if(el)el.innerHTML=kkCellsHtml(g,anim)}
function kkShowSpots(sp,prev){kk.spots=sp;const el=kkEl('kkSpots');if(el)el.innerHTML=kkSpotsHtml(sp,prev)}
function kkBanner(big,small,ms,cls){const el=kkEl('kkBanner');if(el)el.innerHTML=`<div class="kk-banner ${cls||''}"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return kkWait(ms||1400).then(()=>{const e=kkEl('kkBanner');if(e)e.innerHTML=''})}
// Teller loopt soepel op naar het nieuwe bedrag
function kkCount(id,from,to,ms){const el=kkEl(id);if(!el||!kkOn()){if(el)el.textContent=fmt(to);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const step=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(step);else res()};requestAnimationFrame(step)})}
function kkFxLabel(w,bet){const fx=kkEl('kkFx');if(!fx)return;
 const cx=w.cells.reduce((a,[c])=>a+c,0)/w.cells.length,cy=w.cells.reduce((a,[,r])=>a+r,0)/w.cells.length;
 const d=document.createElement('div');d.className='kk-pop';d.style.left=((cx+.5)/SLOT.COLS*100)+'%';d.style.top=((cy+.5)/SLOT.ROWS*100)+'%';
 d.innerHTML=`${fmt(w.pay*bet)}${w.mult?`<small>x${w.mult}</small>`:''}`;fx.appendChild(d);setTimeout(()=>d.remove(),1500)}
function kkSparks(keys){const fx=kkEl('kkFx');if(!fx||kkFast())return;
 keys.forEach(k=>{const c=Math.floor(k/SLOT.ROWS),r=k%SLOT.ROWS;for(let i=0;i<3;i++){const s=document.createElement('i');s.className='kk-spark';
   s.style.left=((c+.5)/SLOT.COLS*100)+'%';s.style.top=((r+.5)/SLOT.ROWS*100)+'%';const a=Math.random()*Math.PI*2,d=24+Math.random()*30;
   s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');fx.appendChild(s);setTimeout(()=>s.remove(),600)}})}
function kkFallTime(g,anim){const T=KK_T();
 if(anim==='all'){const P=kk.plan||kkPlan(g);return Math.max(...P.map(p=>p.delay+(SLOT.ROWS-1)*8+(T.base+SLOT.ROWS*T.per)*p.slow))}
 let m=0;g.forEach((col,c)=>col.forEach((x,r)=>{const f=x.fall||0;if(f)m=Math.max(m,c*Math.round(T.col/2)+T.base+f*T.per)}));return m}
function kkLandSounds(g,anim){const T=KK_T();
 if(anim==='all'){const P=kk.plan||kkPlan(g);let n=0;
  for(let c=0;c<SLOT.COLS;c++){const p=P[c],land=p.delay+(T.base+SLOT.ROWS*T.per)*p.slow,scs=g[c].filter(x=>x.sc).length,from=n;n+=scs;
   const col=on=>{const sp=document.querySelectorAll('#kkSpots .kk-spot');for(let r=0;r<SLOT.ROWS;r++){const el=sp[r*SLOT.COLS+c];if(el)el.classList.toggle('tease',on)}};
   if(p.tease)setTimeout(()=>{if(!kkOn())return;col(true);SFX.tease(p.cnt,(land-p.delay)/1000)},Math.max(0,p.delay-30));
   setTimeout(()=>{if(!kkOn())return;SFX.land(c);for(let k=0;k<scs;k++)setTimeout(()=>SFX.scatter(from+k),k*90);
     if(p.tease)col(false)},land-20)}
  kkScSeen=n;return}
 for(let c=0;c<SLOT.COLS;c++){if(!g[c].some(x=>x.fall))continue;const d=c*Math.round(T.col/2)+T.base+Math.max(...g[c].map(x=>x.fall||0))*T.per;
  setTimeout(()=>{if(kkOn())SFX.land(c)},d-20)}}
let kkScSeen=0;
async function kkAnimateSpin(sp,bet,inFs,runTotal){
 let sofar=0;
 for(let i=0;i<sp.steps.length;i++){
  const T=KK_T(),st=sp.steps[i],anim=i===0?'all':'tumble';
  if(i===0&&!inFs)kkShowSpots(st.spots);
  kkShow(st.grid,anim);kkLandSounds(st.grid,anim);
  await kkWait(kkFallTime(st.grid,anim)+60);
  // kluizen die erbij zijn gekomen laten horen
  let sc=0;st.grid.forEach(col=>col.forEach(x=>{if(x.sc)sc++}));const scPrev=kkScSeen;for(let k=kkScSeen;k<sc;k++)SFX.scatter(k);kkScSeen=Math.max(kkScSeen,sc);
  // een kluis die erin tumbelt terwijl er al 3 of meer liggen: even laten zien
  if(!inFs&&i>0&&sc>scPrev&&sc>=4)await kkBanner(sc+' kluizen!',sc>=SLOT.SUPER_SC?'Superbonus!':'Er tumbelde een kluis bij',kkFast()?600:1000,sc>=SLOT.SUPER_SC?'fsin super':'fsin');
  if(!st.wins.length)break;
  const cells=kkEl('kkCells');
  const hit=new Set();st.wins.forEach(w=>w.cells.forEach(([c,r])=>hit.add(c*SLOT.ROWS+r)));
  if(cells)cells.querySelectorAll('.kk-cell').forEach(el=>{if(hit.has(+el.dataset.k))el.classList.add('win');else el.classList.add('dim')});
  st.wins.forEach(w=>kkFxLabel(w,bet));SFX.win(i);if(st.wins.some(w=>w.mult))setTimeout(()=>SFX.mult(Math.max(...st.wins.map(w=>w.mult))),120);
  const add=st.wins.reduce((a,w)=>a+w.pay,0)*bet;
  kkCount('kkStep',sofar,sofar+add,T.hold*.8);if(runTotal!=null)kkCount('kkLast',runTotal+sofar,runTotal+sofar+add,T.hold*.8);
  sofar+=add;kk.stepWin=sofar;
  await kkWait(T.hold);
  if(cells)cells.querySelectorAll('.kk-cell.win').forEach(el=>el.classList.add('pop'));
  SFX.pop();kkSparks([...hit]);
  await kkWait(T.pop);
  kkShowSpots(st.spotsAfter,st.spots);
 }
 return sofar;
}
async function kkPlay(round,bet,isBuy){
 kk.stepWin=0;kkText('kkStep',fmt(0));kkScSeen=0;
 if(!isBuy){kkText('kkMsg','Draait…');kkShowSpots(SLOT.newSpots());await kkAnimateSpin(round.base,bet,false,null);if(round.base.respin)await kkCrack(round.base.respin)}
 else{kkText('kkMsg','Bonus gekocht');kkShowSpots(SLOT.newSpots());await kkAnimateSpin(round.base,bet,false,null)}
 const baseWin=round.base.win*bet;
 if(baseWin>0){kk.lastWin=baseWin;kkText('kkLast',fmt(baseWin))}
 if(round.fs){
  kk.inBonus=true;
  const sc=round.base.scatters,sup=round.kind==='super';
  const stage=kkEl('kkStage');if(stage)stage.classList.add('vault-open');
  SFX.bonus();if(sup){SFX.big();await kkBanner('Superbonus',sc+' kluizen! '+round.fsStart+' spins met extra lopers · zoek de Gouden baar',3000,'fsin super')}
  else await kkBanner(round.fsStart+' free spins',sc+' kluizen · vakjes blijven de hele bonus staan',2200,'fsin');
  let of=round.fsStart;kk.fs={at:0,of,total:0,kind:round.fs.kind,bars:0,barCells:[]};kkShowSpots(SLOT.newSpots());kkRefreshUI();
  for(let i=0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];
   kk.fs.at=i+1;kk.fs.of=Math.max(of,i+1+s.left);kkText('kkMsg',kk.fs.at+' / '+kk.fs.of);
   kk.stepWin=0;kkText('kkStep',fmt(0));kkScSeen=0;SFX.spin();
   const before=kk.fs.total;
   await kkAnimateSpin(s,bet,true,before);
   kk.fs.total=Math.min(SLOT.MAX_WIN,s.total)*bet;kkText('kkLast',fmt(kk.fs.total));
   if(s.barNew){const cells=kkEl('kkCells');if(cells)cells.querySelectorAll('.kk-cell.gbar').forEach(el=>el.classList.add('win'));kk.fs.bars=s.bars;if(s.barPos){kk.fs.barCells=kk.fs.barCells.concat(s.barPos);kkShowSpots(kk.spots)}const sb=kkEl('kkSub');if(sb)sb.innerHTML=kkSubHtml();
    if(!s.barMax){SFX.bonus();await kkBanner('Gouden baar '+s.bars+'/'+SLOT.BAR.need,s.bars===SLOT.BAR.need-1?'Nog één en je hebt de max win':'Hij blijft de hele bonus staan',1800,'gold')}}
   if(s.barMax){const cells=kkEl('kkCells');if(cells)cells.querySelectorAll('.kk-cell.gbar').forEach(el=>el.classList.add('win'));SFX.big();await kkBanner(kk.fs.kind==='super'?'Gouden baar':'3 Gouden baren','Max win · '+SLOT.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3200,'big gold');break}
   if(round.fs.maxHit&&s.total>=SLOT.MAX_WIN){SFX.big();await kkBanner('Max win',SLOT.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   if(s.extra){SFX.bonus();await kkBanner('+'+s.extra+' spins',s.scatters+' kluizen tijdens de bonus',1400,'fsin');of+=s.extra}
   await kkWait(kkFast()?120:280);
  }
  const x=round.total;
  if(x>=20)SFX.big();
  await kkBanner(fmt(x*bet),(x>=SLOT.MAX_WIN?'Max win · ':x>=200?'Episch · ':x>=100?'Megawinst · ':x>=40?'Grote winst · ':'Bonus voorbij · ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2600,x>=40?'big':'');
  kk.fs=null;kkShowSpots(null);kk.inBonus=false;
 }else{
  const x=round.total;
  if(x>=20){SFX.big();await kkBanner(fmt(x*bet),(x>=100?'Megawinst':'Grote winst')+' · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2000,'big')}
  else if(x===0)SFX.lose();
 }
}
Object.assign(act,{
 kkNewSeed(){if(kk.busy)return;const o=kkSeed();S.kkSeed=kkNewSd({id:kkSeedId(o),spins:o.spins,bon:o.bon,sup:o.sup});SFX.chip();save();kkRefreshUI();toast('Nieuwe seed: '+kkSeedId(S.kkSeed))},
 async kkSpin(isBuy){
  if(kk.busy||inJail())return;const bet=kkBet(),cost=isBuy?bet*SLOT.BUY_COST:bet;
  if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  kk.busy=true;kk.confirm=false;kk.pick=false;kk.inBonus=!!isBuy;kk.paused=false;SFX.spin();
  const sd=kkSeed(),rng=SLOT.seedRng(sd.s+':'+sd.c+':'+sd.n);sd.n++;
  const round=SLOT.playRound(rng,{buy:isBuy,vip:tier()});
  if(isBuy)sd.buys++;else{sd.spins++;if(round.kind)sd.bon++;if(round.kind==='super')sd.sup++}
  const pay=Math.floor(round.total*bet*100)/100;
  // Uitkomst staat vast en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
  S.cash+=pay-cost;window.slotPending=pay;
  if(pay>cost)S.stats.won+=pay-cost;else S.stats.lost+=cost-pay;
  casinoRound(cost,pay,'kluis');
  save();renderTop();kkRefreshUI();
  try{await kkPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;kk.busy=false;kk.inBonus=false;kk.paused=false;kk.lastWin=pay;kk.stepWin=0;
  kk.msg=pay>0?(Math.round(round.total*100)/100).toLocaleString('nl-NL')+'× inzet':'Geen winst';
  if(pay>=bet*20||isBuy)log('Kluiskraker: '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Grote winst: '+fmt(pay)+'!','lvl');
  save();renderTop();kkRefreshUI();
 }
});
