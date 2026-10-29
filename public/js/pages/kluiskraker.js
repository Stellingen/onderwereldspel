// Casino: Kluiskraker — tumble-slot (engine in js/slot.js)
const KK_BETS=[10,20,50,100,200,500,1000,2000,5000,10000];
window.kk={bi:2,busy:false,turbo:false,confirm:false,grid:null,msg:'Kies je inzet en draai',stepWin:0,fs:null,lastWin:0};
const kkBet=()=>KK_BETS[kk.bi];
function kkCellHtml(x){
 if(!x)return '<div class="kk-cell"></div>';
 if(x.m)return `<div class="kk-cell${x.nw?' nw':''}"><div class="mx">x${x.m}</div></div>`;
 if(x.sc)return `<div class="kk-cell sc${x.nw?' nw':''}">${kkSvg('kluis')}</div>`;
 return `<div class="kk-cell${x.nw?' nw':''}" data-s="${x.s}">${kkSvg(SLOT.SYMS[x.s].id)}</div>`;
}
function kkGridHtml(g){
 if(!g){g=[];for(let c=0;c<SLOT.COLS;c++){g.push([]);for(let r=0;r<SLOT.ROWS;r++)g[c].push({s:(c*3+r*5)%SLOT.SYMS.length})}}
 return g.map(col=>`<div class="kk-col">${col.map(kkCellHtml).join('')}</div>`).join('');
}
function kkView(){
 const b=kkBet(),buy=b*SLOT.BUY_COST,fs=kk.fs;
 return `<div class="kk">
 <div class="kk-stage ${fs?'fs':''}" id="kkStage">
  <div class="kk-head"><div class="kk-title">Kluis<span>kraker</span></div>
   <div class="label" style="text-align:right">RTP 94,6% · bonus kopen 96,3%<br>Max. winst ${SLOT.MAX_WIN.toLocaleString('nl-NL')}× inzet</div></div>
  <div class="kk-grid" id="kkGrid">${kkGridHtml(kk.grid)}</div>
  <div class="kk-strip">
   <div><span class="label">${fs?'Free spin':'Status'}</span><b id="kkMsg" style="font-size:13px;font-family:var(--f-body)">${fs?fs.at+' / '+fs.of:kk.msg}</b></div>
   <div><span class="label">${fs?'Totaalmultiplier':'Deze spin'}</span><b id="kkStep" style="color:var(--acc)">${fs?'x'+Math.max(1,fs.run):fmt(kk.stepWin)}</b></div>
   <div><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="kkLast" style="color:var(--green)">${fmt(fs?fs.total:kk.lastWin)}</b></div>
  </div>
  <div id="kkBanner"></div>
 </div>
 <div class="kk-side">
  <div class="card">
   <div class="label">Inzet per spin</div>
   <div class="kk-bet"><button onclick="kkStepBet(-1)" ${kk.busy?'disabled':''} aria-label="Lagere inzet">−</button><b>${fmt(b)}</b><button onclick="kkStepBet(1)" ${kk.busy?'disabled':''} aria-label="Hogere inzet">+</button></div>
   <button class="btn" style="font-size:18px;padding:15px" onclick="act.kkSpin(false)" ${kk.busy||inJail()?'disabled':''}>${kk.busy?'Bezig…':'Draaien'}</button>
   <div class="flex" style="margin-top:8px">
    <button class="btn ghost sm" onclick="kk.turbo=!kk.turbo;render()" ${kk.busy?'disabled':''}>${kk.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="btn ghost sm" onclick="kk.confirm=true;render()" ${kk.busy||inJail()?'disabled':''}>Bonus kopen</button>
   </div>
   ${kk.confirm&&!kk.busy?`<div class="kk-confirm"><div style="font-weight:600;margin-bottom:4px">Bonus kopen voor ${fmt(buy)}?</div>
    <div style="color:var(--mute);font-size:13px;margin-bottom:10px">Dat is ${SLOT.BUY_COST}× je inzet. Je krijgt direct ${SLOT.FS_START} free spins met multipliers. Een bonus levert gemiddeld iets minder op dan hij kost.</div>
    <div class="flex"><button class="btn sm" onclick="act.kkSpin(true)" ${S.cash<buy?'disabled':''}>${S.cash<buy?'Te weinig geld':'Kopen'}</button><button class="btn ghost sm" onclick="kk.confirm=false;render()">Annuleren</button></div></div>`:''}
  </div>
  <div class="card kk-pay"><div class="label" style="margin-bottom:6px">Uitbetaling bij ${fmt(b)} inzet</div>
   <div class="row"><span class="label">Symbool</span><span class="label">8-9 · 10-11 · 12+</span></div>
   ${SLOT.SYMS.slice().reverse().map(s=>`<div class="row"><span>${kkSvg(s.id)}</span><span>${s.pay.map(p=>fmt(p*b)).join(' · ')}</span></div>`).join('')}
   <div class="row"><span>${kkSvg('kluis')}4+ kluizen</span><span style="color:var(--acc)">${SLOT.FS_START} free spins</span></div>
   <p style="color:var(--mute);font-family:var(--f-body);font-size:12.5px;margin:10px 0 0;line-height:1.5">Winnende symbolen verdwijnen en nieuwe vallen erin, zolang er gewonnen wordt. In de free spins tellen alle multipliers op tot één totaalmultiplier voor de rest van de bonus. 3 kluizen tijdens de bonus geven +${SLOT.FS_RETRIGGER} spins.</p>
  </div>
 </div></div>`;
}
function kkStepBet(d){if(kk.busy)return;kk.bi=Math.max(0,Math.min(KK_BETS.length-1,kk.bi+d));kk.confirm=false;render()}
const kkWait=ms=>new Promise(r=>setTimeout(r,(page==='casino'&&casinoTab==='kluis')?ms*(kk.turbo?.45:1):0));
const kkEl=id=>document.getElementById(id);
function kkSetGrid(g,first){kk.grid=g;const el=kkEl('kkGrid');if(!el)return;
 el.innerHTML=g.map(col=>`<div class="kk-col">${col.map(x=>kkCellHtml(first?Object.assign({},x,{nw:1}):x)).join('')}</div>`).join('')}
function kkMark(wins,cls){const el=kkEl('kkGrid');if(!el)return;const set=new Set(wins.map(w=>w.sym));
 el.querySelectorAll('.kk-cell[data-s]').forEach(c=>{if(set.has(+c.dataset.s))c.classList.add(cls)})}
function kkText(id,v){const el=kkEl(id);if(el)el.textContent=v}
function kkBanner(big,small,ms){const el=kkEl('kkBanner');if(el)el.innerHTML=`<div class="kk-banner"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return kkWait(ms||1400).then(()=>{const e=kkEl('kkBanner');if(e)e.innerHTML=''})}
// Speelt de stappen van één spin af; geeft niets terug (uitkomst stond al vast)
async function kkAnimateSpin(sp,bet,fsCtx){
 for(let i=0;i<sp.steps.length;i++){
  const st=sp.steps[i];kkSetGrid(st.grid,i===0);await kkWait(i===0?420:340);
  if(!st.wins.length)break;
  kkMark(st.wins,'win');
  const sofar=sp.steps.slice(0,i+1).reduce((a,s)=>a+s.wins.reduce((x,w)=>x+w.pay,0),0)*bet;
  kk.stepWin=sofar;if(!fsCtx)kkText('kkStep',fmt(sofar));
  await kkWait(520);kkMark(st.wins,'gone');await kkWait(240);
 }
}
async function kkPlay(round,bet,isBuy){
 const base=round.base;
 if(!isBuy){kk.stepWin=0;kkText('kkStep',fmt(0));kkText('kkMsg','Draait…');await kkAnimateSpin(base,bet,null)}
 else{kkText('kkMsg','Bonus gekocht');kkSetGrid(base.steps[0].grid,true);await kkWait(500)}
 if(round.fs){
  const sc=isBuy?4:base.scatters;
  await kkBanner(SLOT.FS_START+' free spins',sc+' kluizen gekraakt'+((SLOT.SCATTER_PAY[Math.min(6,sc)]||0)?' · +'+fmt((SLOT.SCATTER_PAY[Math.min(6,sc)]||0)*bet):''),1700);
  const spins=round.fs.spins;let of=SLOT.FS_START;
  kk.fs={at:0,of,run:0,total:0};render();
  for(let i=0;i<spins.length;i++){const s=spins[i];
   kk.fs.at=i+1;kk.fs.of=Math.max(of,i+1+s.left);kkText('kkMsg',kk.fs.at+' / '+kk.fs.of);
   await kkAnimateSpin(s,bet,kk.fs);
   if(s.base>0&&s.multSum>0){kk.fs.run=s.run;kkText('kkStep','x'+s.run);await kkBanner('x'+s.multSum,'Totaalmultiplier nu x'+s.run,900)}
   kk.fs.total=Math.min(SLOT.MAX_WIN,s.total)*bet;kkText('kkLast',fmt(kk.fs.total));
   if(s.retrigger){await kkBanner('+'+SLOT.FS_RETRIGGER+' spins','Kluizen tijdens de bonus',1100);of+=SLOT.FS_RETRIGGER}
   await kkWait(260);
  }
  const x=round.total;
  await kkBanner(fmt(x*bet),'Bonus voorbij · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2200);
  kk.fs=null;
 }
}
Object.assign(act,{
 async kkSpin(isBuy){
  if(kk.busy||inJail())return;const bet=kkBet(),cost=isBuy?bet*SLOT.BUY_COST:bet;
  if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  kk.busy=true;kk.confirm=false;
  const round=SLOT.playRound(Math.random,{buy:isBuy});
  const pay=Math.floor(round.total*bet*100)/100;
  // Uitkomst staat vast en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
  S.cash+=pay-cost;window.slotPending=pay;
  if(pay>cost)S.stats.won+=pay-cost;else S.stats.lost+=cost-pay;
  save();render();
  try{await kkPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;kk.busy=false;kk.lastWin=pay;kk.msg=pay>0?(Math.round(round.total*100)/100).toLocaleString('nl-NL')+'× inzet':'Geen winst';
  if(pay>=bet*20||isBuy)log('Kluiskraker: '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Grote winst: '+fmt(pay)+'!','lvl');
  save();render();
 }
});
