// Casino: Kluiskraker v3 — cluster-slot met vermenigvuldigvakjes, geluid en vloeiende tumbles.
// Engine: js/slot.js · iconen: js/icons.js · geluid: js/sfx.js
const KK_BETS=[10,20,30,40,50,100,150,200,250,300,400,500,750,1000,1500,2000,3000,5000,7500,10000];
window.kk={bi:4,busy:false,turbo:false,confirm:false,grid:null,spots:null,msg:'Kies je inzet en draai',stepWin:0,fs:null,lastWin:0,shown:0};
const kkBet=()=>KK_BETS[kk.bi];
const kkFast=()=>kk.turbo||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const KK_T=()=>kkFast()?{base:140,per:16,col:22,hold:380,pop:180}:{base:230,per:34,col:42,hold:640,pop:250};
function kkDemoGrid(){const g=[];for(let c=0;c<SLOT.COLS;c++){g.push([]);for(let r=0;r<SLOT.ROWS;r++)g[c].push({s:(c*2+r*3)%SLOT.SYMS.length})}return g}
// anim: 'none' (statisch), 'all' (nieuwe spin: alles valt), 'tumble' (alleen cellen met fall>0)
function kkCell(x,c,r,anim){
  const T=KK_T();let f=0,delay=0;
  if(anim==='all'){f=SLOT.ROWS;delay=c*T.col+(SLOT.ROWS-1-r)*8}
  else if(anim==='tumble'&&x.fall){f=x.fall;delay=c*Math.round(T.col/2)}
  const st=f?`style="--f:${f};--d:${delay}ms;--t:${T.base+f*T.per}ms"`:'';
  const cls='kk-cell'+(f?' fall':'')+(x.sc?' sc':'')+(x.w?' wild':'')+(x.bar?' gbar':'');
  const icon=x.bar?kkSvg('baar'):x.sc?kkSvg('kluis'):x.w?kkSvg('sleutel'):kkSvg(SLOT.SYMS[x.s].id);
  return `<div class="${cls}" data-k="${c*SLOT.ROWS+r}" ${st}>${icon}${x.w?'<span class="wl">Loper</span>':''}</div>`;
}
function kkCellsHtml(g,anim){let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++)h+=kkCell(g[c][r],c,r,anim);return h}
function kkSpotsHtml(sp,prev){let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++){const v=sp?sp[c][r]:0;
  const lv=v>=2?Math.min(10,Math.log2(v)):0;const nw=prev&&prev[c][r]!==v;
  h+=`<div class="kk-spot${v===1?' mk':''}${v>=2?' mx lv'+lv:''}${nw?' bump':''}">${v>=2?'<b>x'+v+'</b>':''}</div>`}return h}
function kkInfo(){const fs=kk.fs;const pend=window.slotPending||0;
  return `<div class="kk-bal"><span class="label">Saldo</span><b id="kkBal">${fmt(S.cash-pend+(kk.shown||0))}</b></div>
   <div class="kk-stat"><span class="label">Inzet</span><b>${fmt(kkBet())}</b></div>
   <div class="kk-stat"><span class="label">Deze spin</span><b id="kkStep" class="acc">${fmt(kk.stepWin)}</b></div>
   <div class="kk-stat"><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="kkLast" class="grn">${fmt(fs?fs.total:kk.lastWin)}</b></div>
   ${fs?`<div class="kk-stat fsb"><span class="label">Free spins</span><b id="kkMsg">${fs.at} / ${fs.of}</b></div>`:`<div class="kk-stat"><span class="label">Status</span><b id="kkMsg" class="sm">${kk.msg}</b></div>`}`}
function kkView(){
 const b=kkBet(),fs=kk.fs,g=kk.grid||kkDemoGrid();
 const sizes=[5,6,8,10,12,15];
 return `<div class="kk ${fs?'is-fs':''} ${fs&&fs.kind==='super'?'is-super':''}">
 <aside class="kk-info" id="kkInfo">${kkInfo()}</aside>
 <div class="kk-stage" id="kkStage">
  <div class="kk-head"><div class="kk-title">Kluis<span>kraker</span></div>
   <div class="kk-sub">${fs?(fs.kind==='super'?`<span class="vip gold">Superbonus</span> Veel meer lopers · Gouden baar = max win`:`<span class="vip">Bonus</span> Vakjes blijven staan`):`${isVip()?'<span class="vip gold">VIP</span> bonus iets vaker · ':''}RTP ±96% · bonus kopen 95% · max ${SLOT.MAX_WIN.toLocaleString('nl-NL')}×`}
    <button class="kk-snd" onclick="SFX.toggle();render()" aria-label="Geluid aan of uit">${SFX.on?'🔊':'🔇'}</button></div></div>
  <div class="kk-board" id="kkBoard">
   <div class="kk-layer kk-spots" id="kkSpots">${kkSpotsHtml(kk.spots)}</div>
   <div class="kk-layer kk-cells" id="kkCells">${kkCellsHtml(g,'none')}</div>
   <div class="kk-layer kk-fx" id="kkFx"></div>
   <div id="kkBanner"></div>
   ${kk.paused?`<div class="kk-banner pause"><div><b>Gepauzeerd</b><span>${kk.fs?'Free spin '+kk.fs.at+' van '+kk.fs.of+' · '+fmt(kk.fs.total)+' gewonnen':'Je bonus staat klaar'}</span><button class="btn kk-go" style="margin-top:18px" onclick="kkResume()">Bonus verder afspelen</button></div></div>`:''}
  </div>
  <div class="kk-ctl-mob">${kkControls()}</div>
 </div>
 <div class="kk-side">
  <div class="card kk-ctl-side">${kkControls()}</div>
  <div class="card kk-pay"><div class="label" style="margin-bottom:6px">Cluster bij ${fmt(b)} inzet</div>
   <div class="kk-ptab"><span></span>${sizes.map(n=>`<span class="label">${n}${n===15?'+':''}</span>`).join('')}
   ${SLOT.SYMS.slice().reverse().map(s=>`<span>${kkSvg(s.id)}</span>${sizes.map(n=>`<span>${fmt(s.pay[Math.min(n,15)-SLOT.MIN_CLUSTER]*b)}</span>`).join('')}`).join('')}</div>
   <div class="kk-rules">
    <div><span>${kkSvg('sleutel')}</span><p><b>Loper</b> telt mee voor elk symbool en verbindt groepjes. In de bonus valt hij vaker.</p></div>
    <div><span class="kk-mini mk"></span><p><b>Vakje</b> raakt gemarkeerd waar een winst verdwijnt. Opnieuw raak: x2, dan x4, x8 … tot x${SLOT.MAX_SPOT}.</p></div>
    <div><span>${kkSvg('kluis')}</span><p><b>4 kluizen</b> = ${SLOT.FS_BY_SC[4]} free spins, <b>5 kluizen</b> = ${SLOT.FS_BY_SC[5]}. In de bonus blijven vakjes staan; 2 kluizen = +${SLOT.FS_RETRIG[2]}, 3 = +${SLOT.FS_RETRIG[3]}, 4 = +${SLOT.FS_RETRIG[4]}, 5+ = +${SLOT.FS_RETRIG[5]} spins.</p></div>
    <div><span>${kkSvg('baar')}</span><p><b>6+ kluizen = superbonus</b>: ${SLOT.SUPER_SPINS} spins met bijna twee keer zoveel lopers. Landt de <b>Gouden baar</b>, dan win je direct de max win van ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× je inzet. Niet te koop, alleen in te spinnen.</p></div>
   </div>
  </div>
 </div></div>`;
}
function kkControls(){const b=kkBet(),buy=b*SLOT.BUY_COST;return `<div class="label">Inzet per spin</div>
   <div class="kk-bet"><button onclick="kkStepBet(-1)" ${kk.busy?'disabled':''} aria-label="Lagere inzet">−</button><b>${fmt(b)}</b><button onclick="kkStepBet(1)" ${kk.busy?'disabled':''} aria-label="Hogere inzet">+</button></div>
   <button class="btn kk-go" onclick="act.kkSpin(false)" ${kk.busy||inJail()?'disabled':''}>${kk.busy?'Bezig…':'Draaien'}</button>
   <div class="flex" style="margin-top:8px">
    <button class="btn ghost sm kk-turbo ${kk.turbo?'on':''}" onclick="kkTurbo()" aria-pressed="${kk.turbo}">${kk.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="btn ghost sm" onclick="kk.confirm=true;render()" ${kk.busy||inJail()?'disabled':''}>Bonus kopen</button>
   </div>
   ${kk.confirm&&!kk.busy?`<div class="kk-confirm"><div style="font-weight:600;margin-bottom:4px">Bonus kopen voor ${fmt(buy)}?</div>
    <div style="color:var(--mute);font-size:13px;margin-bottom:10px">Dat is ${SLOT.BUY_COST}× je inzet van ${fmt(b)}. Je krijgt direct ${SLOT.FS_BY_SC[4]} free spins waarin de vakjes blijven staan (de superbonus is niet te koop). Gemiddeld levert een bonus iets minder op dan hij kost, maar de uitschieters zijn groot.</div>
    <div class="flex"><button class="btn sm" onclick="act.kkSpin(true)" ${S.cash<buy?'disabled':''}>${S.cash<buy?'Te weinig geld':'Kopen'}</button><button class="btn ghost sm" onclick="kk.confirm=false;render()">Annuleren</button></div></div>`:''}`}
// Snelheid mag ook tijdens een spin of bonus om: de volgende val/tumble gebruikt meteen het nieuwe tempo.
function kkTurbo(){kk.turbo=!kk.turbo;SFX.click();document.querySelectorAll('.kk-turbo').forEach(b=>{b.textContent=kk.turbo?'Snel: aan':'Snel: uit';b.classList.toggle('on',kk.turbo);b.setAttribute('aria-pressed',kk.turbo)})}
function kkStepBet(d){if(kk.busy)return;kk.bi=Math.max(0,Math.min(KK_BETS.length-1,kk.bi+d));kk.confirm=false;SFX.chip();render()}
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
function kkFallTime(g,anim){const T=KK_T();let m=0;g.forEach((col,c)=>col.forEach((x,r)=>{const f=anim==='all'?SLOT.ROWS:(x.fall||0);if(f){const d=anim==='all'?c*T.col+(SLOT.ROWS-1-r)*8:c*Math.round(T.col/2);m=Math.max(m,d+T.base+f*T.per)}}));return m}
function kkLandSounds(g,anim){const T=KK_T();for(let c=0;c<SLOT.COLS;c++){const moved=anim==='all'||g[c].some(x=>x.fall);if(!moved)continue;
  const d=(anim==='all'?c*T.col:c*Math.round(T.col/2))+T.base+(anim==='all'?SLOT.ROWS:Math.max(...g[c].map(x=>x.fall||0)))*T.per;
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
  let sc=0;st.grid.forEach(col=>col.forEach(x=>{if(x.sc)sc++}));for(let k=kkScSeen;k<sc;k++)SFX.scatter(k);kkScSeen=Math.max(kkScSeen,sc);
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
 if(!isBuy){kkText('kkMsg','Draait…');kkShowSpots(SLOT.newSpots());await kkAnimateSpin(round.base,bet,false,null)}
 else{kkText('kkMsg','Bonus gekocht');kkShowSpots(SLOT.newSpots());kkShow(round.base.steps[0].grid,'all');kkLandSounds(round.base.steps[0].grid,'all');
   await kkWait(kkFallTime(round.base.steps[0].grid,'all')+300);for(let k=0;k<4;k++)setTimeout(()=>SFX.scatter(k),k*160);await kkWait(700)}
 const baseWin=round.base.win*bet;
 if(!isBuy&&baseWin>0){kk.lastWin=baseWin;kkText('kkLast',fmt(baseWin))}
 if(round.fs){
  kk.inBonus=true;
  const sc=isBuy?4:round.base.scatters,sup=round.kind==='super';
  const stage=kkEl('kkStage');if(stage)stage.classList.add('vault-open');
  SFX.bonus();if(sup){SFX.big();await kkBanner('Superbonus','6 kluizen! '+round.fsStart+' spins met extra lopers · zoek de Gouden baar',3000,'fsin super')}
  else await kkBanner(round.fsStart+' free spins',sc+' kluizen gekraakt · vakjes blijven de hele bonus staan',2200,'fsin');
  let of=round.fsStart;kk.fs={at:0,of,total:0,kind:round.fs.kind};kk.spots=SLOT.newSpots();render();
  for(let i=0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];
   kk.fs.at=i+1;kk.fs.of=Math.max(of,i+1+s.left);kkText('kkMsg',kk.fs.at+' / '+kk.fs.of);
   kk.stepWin=0;kkText('kkStep',fmt(0));kkScSeen=0;SFX.spin();
   const before=kk.fs.total;
   await kkAnimateSpin(s,bet,true,before);
   kk.fs.total=Math.min(SLOT.MAX_WIN,s.total)*bet;kkText('kkLast',fmt(kk.fs.total));
   if(s.bar){const cells=kkEl('kkCells');if(cells)cells.querySelectorAll('.kk-cell.gbar').forEach(el=>el.classList.add('win'));SFX.big();await kkBanner('Gouden baar','Max win · '+SLOT.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3200,'big gold');break}
   if(round.fs.maxHit&&s.total>=SLOT.MAX_WIN){SFX.big();await kkBanner('Max win',SLOT.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   if(s.extra){SFX.bonus();await kkBanner('+'+s.extra+' spins',s.scatters+' kluizen tijdens de bonus',1400,'fsin');of+=s.extra}
   await kkWait(kkFast()?120:280);
  }
  const x=round.fs.total;
  if(x>=20)SFX.big();
  await kkBanner(fmt(x*bet),(x>=SLOT.MAX_WIN?'Max win · ':x>=200?'Episch · ':x>=100?'Megawinst · ':x>=40?'Grote winst · ':'Bonus voorbij · ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2600,x>=40?'big':'');
  kk.fs=null;kk.spots=null;kk.inBonus=false;
 }else{
  const x=round.total;
  if(x>=20){SFX.big();await kkBanner(fmt(x*bet),(x>=100?'Megawinst':'Grote winst')+' · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2000,'big')}
  else if(x===0)SFX.lose();
 }
}
Object.assign(act,{
 async kkSpin(isBuy){
  if(kk.busy||inJail())return;const bet=kkBet(),cost=isBuy?bet*SLOT.BUY_COST:bet;
  if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  kk.busy=true;kk.confirm=false;kk.inBonus=!!isBuy;kk.paused=false;SFX.spin();
  const round=SLOT.playRound(Math.random,{buy:isBuy,vip:isVip()});
  const pay=Math.floor(round.total*bet*100)/100;
  // Uitkomst staat vast en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
  S.cash+=pay-cost;window.slotPending=pay;
  if(pay>cost)S.stats.won+=pay-cost;else S.stats.lost+=cost-pay;
  casinoRound(cost,pay,'kluis');
  save();render();
  try{await kkPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;kk.busy=false;kk.inBonus=false;kk.paused=false;kk.lastWin=pay;kk.stepWin=0;
  kk.msg=pay>0?(Math.round(round.total*100)/100).toLocaleString('nl-NL')+'× inzet':'Geen winst';
  if(pay>=bet*20||isBuy)log('Kluiskraker: '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Grote winst: '+fmt(pay)+'!','lvl');
  save();render();
 }
});
