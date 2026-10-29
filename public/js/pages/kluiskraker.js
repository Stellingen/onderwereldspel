// Casino: Kluiskraker v2 — cluster-slot met vermenigvuldigvakjes (engine in js/slot.js, iconen in js/icons.js)
const KK_BETS=[10,20,50,100,200,500,1000,2000,5000,10000];
window.kk={bi:2,busy:false,turbo:false,confirm:false,grid:null,spots:null,msg:'Kies je inzet en draai',stepWin:0,fs:null,lastWin:0};
const kkBet=()=>KK_BETS[kk.bi];
const kkFast=()=>kk.turbo||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
function kkDemoGrid(){const g=[];for(let c=0;c<SLOT.COLS;c++){g.push([]);for(let r=0;r<SLOT.ROWS;r++)g[c].push({s:(c*2+r*3)%SLOT.SYMS.length,fall:0})}return g}
function kkCell(x,c,r,initial){
  const f=x.fall||0,delay=initial?(c*45+(SLOT.ROWS-r)*12):(c*18);
  const st=f?`style="--f:${f};--d:${delay}ms;--t:${(kkFast()?150:260)+f*(kkFast()?18:38)}ms"`:'';
  const cls='kk-cell'+(f?' fall':'')+(x.sc?' sc':'')+(x.w?' wild':'');
  const icon=x.sc?kkSvg('kluis'):x.w?kkSvg('sleutel'):kkSvg(SLOT.SYMS[x.s].id);
  return `<div class="${cls}" data-k="${c*SLOT.ROWS+r}" ${st}>${icon}${x.w?'<span class="wl">Loper</span>':''}</div>`;
}
function kkCellsHtml(g,initial){let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++)h+=kkCell(g[c][r],c,r,initial);return h}
function kkSpotsHtml(sp,fresh){let h='';for(let r=0;r<SLOT.ROWS;r++)for(let c=0;c<SLOT.COLS;c++){const v=sp?sp[c][r]:0;
  const lv=v>=2?Math.min(7,Math.log2(v)):0;const nw=fresh&&fresh[c][r]!==v;
  h+=`<div class="kk-spot${v===1?' mk':''}${v>=2?' mx lv'+lv:''}${nw?' bump':''}">${v>=2?'<b>x'+v+'</b>':''}</div>`}return h}
function kkView(){
 const b=kkBet(),buy=b*SLOT.BUY_COST,fs=kk.fs,g=kk.grid||kkDemoGrid();
 const sizes=[5,6,8,10,12,15];
 return `<div class="kk">
 <div class="kk-stage ${fs?'fs':''}" id="kkStage">
  <div class="kk-head"><div class="kk-title">Kluis<span>kraker</span></div>
   <div class="kk-sub">${fs?`<span class="vip">Bonus</span> Vakjes blijven staan`:`RTP 96,0% · bonus kopen 96,4% · max ${SLOT.MAX_WIN.toLocaleString('nl-NL')}×`}</div></div>
  <div class="kk-board" id="kkBoard">
   <div class="kk-layer kk-spots" id="kkSpots">${kkSpotsHtml(kk.spots)}</div>
   <div class="kk-layer kk-cells" id="kkCells">${kkCellsHtml(g,false)}</div>
   <div class="kk-layer kk-fx" id="kkFx"></div>
   <div id="kkBanner"></div>
  </div>
  <div class="kk-ctl-mob">${kkControls()}</div>
  <div class="kk-strip">
   <div><span class="label">${fs?'Free spin':'Status'}</span><b id="kkMsg">${fs?fs.at+' / '+fs.of:kk.msg}</b></div>
   <div><span class="label">Deze spin</span><b id="kkStep" style="color:var(--acc)">${fmt(kk.stepWin)}</b></div>
   <div><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="kkLast" style="color:var(--green)">${fmt(fs?fs.total:kk.lastWin)}</b></div>
  </div>
 </div>
 <div class="kk-side">
  <div class="card kk-ctl-side">${kkControls()}</div>
  <div class="card kk-pay"><div class="label" style="margin-bottom:6px">Cluster bij ${fmt(b)} inzet</div>
   <div class="kk-ptab"><span></span>${sizes.map(n=>`<span class="label">${n}${n===15?'+':''}</span>`).join('')}
   ${SLOT.SYMS.slice().reverse().map(s=>`<span>${kkSvg(s.id)}</span>${sizes.map(n=>`<span>${fmt(s.pay[Math.min(n,15)-SLOT.MIN_CLUSTER]*b)}</span>`).join('')}`).join('')}</div>
   <div class="kk-rules">
    <div><span>${kkSvg('sleutel')}</span><p><b>Loper</b> telt mee voor elk symbool en verbindt groepjes.</p></div>
    <div><span class="kk-mini mk"></span><p><b>Vakje</b> raakt gemarkeerd waar een winst verdwijnt. Opnieuw raak: x2, dan x4, x8 tot x128.</p></div>
    <div><span>${kkSvg('kluis')}</span><p><b>4 kluizen</b> = ${SLOT.FS_BY_SC[4]} free spins (5: ${SLOT.FS_BY_SC[5]}, 6: ${SLOT.FS_BY_SC[6]}). In de bonus blijven vakjes staan. Kluizen zijn daar zeldzamer, maar 2 = +${SLOT.FS_RETRIG[2]}, 3 = +${SLOT.FS_RETRIG[3]}, 4 = +${SLOT.FS_RETRIG[4]} en 5+ = +${SLOT.FS_RETRIG[5]} spins.</p></div>
   </div>
  </div>
 </div></div>`;
}
function kkControls(){const b=kkBet(),buy=b*SLOT.BUY_COST;return `<div class="label">Inzet per spin</div>
   <div class="kk-bet"><button onclick="kkStepBet(-1)" ${kk.busy?'disabled':''} aria-label="Lagere inzet">−</button><b>${fmt(b)}</b><button onclick="kkStepBet(1)" ${kk.busy?'disabled':''} aria-label="Hogere inzet">+</button></div>
   <button class="btn kk-go" onclick="act.kkSpin(false)" ${kk.busy||inJail()?'disabled':''}>${kk.busy?'Bezig…':'Draaien'}</button>
   <div class="flex" style="margin-top:8px">
    <button class="btn ghost sm" onclick="kk.turbo=!kk.turbo;render()" ${kk.busy?'disabled':''}>${kk.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="btn ghost sm" onclick="kk.confirm=true;render()" ${kk.busy||inJail()?'disabled':''}>Bonus kopen</button>
   </div>
   ${kk.confirm&&!kk.busy?`<div class="kk-confirm"><div style="font-weight:600;margin-bottom:4px">Bonus kopen voor ${fmt(buy)}?</div>
    <div style="color:var(--mute);font-size:13px;margin-bottom:10px">Dat is ${SLOT.BUY_COST}× je inzet van ${fmt(b)}. Je krijgt direct ${SLOT.FS_BY_SC[4]} free spins waarin de vakjes blijven staan. Gemiddeld levert een bonus iets minder op dan hij kost.</div>
    <div class="flex"><button class="btn sm" onclick="act.kkSpin(true)" ${S.cash<buy?'disabled':''}>${S.cash<buy?'Te weinig geld':'Kopen'}</button><button class="btn ghost sm" onclick="kk.confirm=false;render()">Annuleren</button></div></div>`:''}`}
function kkStepBet(d){if(kk.busy)return;kk.bi=Math.max(0,Math.min(KK_BETS.length-1,kk.bi+d));kk.confirm=false;render()}
const kkOn=()=>page==='casino'&&casinoTab==='kluis'&&!!document.getElementById('kkCells');
const kkWait=ms=>new Promise(r=>setTimeout(r,kkOn()?ms*(kkFast()?.5:1):0));
const kkEl=id=>document.getElementById(id);
function kkText(id,v){const el=kkEl(id);if(el)el.textContent=v}
function kkShow(g,initial){kk.grid=g;const el=kkEl('kkCells');if(el)el.innerHTML=kkCellsHtml(g,initial)}
function kkShowSpots(sp,prev){kk.spots=sp;const el=kkEl('kkSpots');if(el)el.innerHTML=kkSpotsHtml(sp,prev)}
function kkBanner(big,small,ms){const el=kkEl('kkBanner');if(el)el.innerHTML=`<div class="kk-banner"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return kkWait(ms||1400).then(()=>{const e=kkEl('kkBanner');if(e)e.innerHTML=''})}
function kkFxLabel(w,bet){const fx=kkEl('kkFx');if(!fx)return;
 const cx=w.cells.reduce((a,[c])=>a+c,0)/w.cells.length,cy=w.cells.reduce((a,[,r])=>a+r,0)/w.cells.length;
 const d=document.createElement('div');d.className='kk-pop';d.style.left=((cx+.5)/SLOT.COLS*100)+'%';d.style.top=((cy+.5)/SLOT.ROWS*100)+'%';
 d.innerHTML=`${fmt(w.pay*bet)}${w.mult?`<small>x${w.mult}</small>`:''}`;fx.appendChild(d);setTimeout(()=>d.remove(),1400)}
function kkFallTime(g){let m=0;g.forEach((col,c)=>col.forEach((x,r)=>{if(x.fall)m=Math.max(m,(kkFast()?150:260)+x.fall*(kkFast()?18:38)+c*18)}));return m}
async function kkAnimateSpin(sp,bet,inFs){
 let sofar=0;
 for(let i=0;i<sp.steps.length;i++){
  const st=sp.steps[i];
  if(i===0&&!inFs)kkShowSpots(st.spots);
  kkShow(st.grid,i===0);
  await kkWait(i===0?kkFallTime(st.grid)+SLOT.COLS*45+120:kkFallTime(st.grid)+80);
  if(!st.wins.length)break;
  const cells=kkEl('kkCells');
  const hit=new Set();st.wins.forEach(w=>w.cells.forEach(([c,r])=>hit.add(c*SLOT.ROWS+r)));
  if(cells)cells.querySelectorAll('.kk-cell').forEach(el=>{if(hit.has(+el.dataset.k))el.classList.add('win')});
  st.wins.forEach(w=>kkFxLabel(w,bet));
  sofar+=st.wins.reduce((a,w)=>a+w.pay,0)*bet;kk.stepWin=sofar;kkText('kkStep',fmt(sofar));
  await kkWait(620);
  if(cells)cells.querySelectorAll('.kk-cell.win').forEach(el=>el.classList.add('pop'));
  await kkWait(230);
  kkShowSpots(st.spotsAfter,st.spots);
 }
}
async function kkPlay(round,bet,isBuy){
 kk.stepWin=0;kkText('kkStep',fmt(0));
 if(!isBuy){kkText('kkMsg','Draait…');kkShowSpots(SLOT.newSpots());await kkAnimateSpin(round.base,bet,false)}
 else{kkText('kkMsg','Bonus gekocht');kkShowSpots(SLOT.newSpots());kkShow(round.base.steps[0].grid,true);await kkWait(kkFallTime(round.base.steps[0].grid)+500)}
 if(round.fs){
  const sc=isBuy?4:round.base.scatters;
  await kkBanner(round.fsStart+' free spins',sc+' kluizen gekraakt · vakjes blijven staan',1800);
  let of=round.fsStart;kk.fs={at:0,of,total:0};kk.spots=SLOT.newSpots();render();
  for(let i=0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];
   kk.fs.at=i+1;kk.fs.of=Math.max(of,i+1+s.left);kkText('kkMsg',kk.fs.at+' / '+kk.fs.of);
   kk.stepWin=0;kkText('kkStep',fmt(0));
   await kkAnimateSpin(s,bet,true);
   kk.fs.total=Math.min(SLOT.MAX_WIN,s.total)*bet;kkText('kkLast',fmt(kk.fs.total));
   if(s.extra){await kkBanner('+'+s.extra+' spins',s.scatters+' kluizen tijdens de bonus',1300);of+=s.extra}
   await kkWait(300);
  }
  await kkBanner(fmt(round.fs.total*bet),'Bonus voorbij · '+(Math.round(round.fs.total*10)/10).toLocaleString('nl-NL')+'× inzet',2300);
  kk.fs=null;kk.spots=null;
 }
}
Object.assign(act,{
 async kkSpin(isBuy){
  if(kk.busy||inJail())return;const bet=kkBet(),cost=isBuy?bet*SLOT.BUY_COST:bet;
  if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  kk.busy=true;kk.confirm=false;
  const round=SLOT.playRound(Math.random,{buy:isBuy});
  const pay=Math.floor(round.total*bet*100)/100;
  // De uitkomst staat vast en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
  S.cash+=pay-cost;window.slotPending=pay;
  if(pay>cost)S.stats.won+=pay-cost;else S.stats.lost+=cost-pay;
  save();render();
  try{await kkPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;kk.busy=false;kk.lastWin=pay;kk.stepWin=0;
  kk.msg=pay>0?(Math.round(round.total*100)/100).toLocaleString('nl-NL')+'× inzet':'Geen winst';
  if(pay>=bet*20||isBuy)log('Kluiskraker: '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Grote winst: '+fmt(pay)+'!','lvl');
  save();render();
 }
});
