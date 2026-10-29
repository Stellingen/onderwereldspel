// Kluiskraker: tumble-slot met 6x5 raster, uitbetaling bij 8+ gelijke symbolen waar dan ook,
// free spins met multipliers en een bonusaankoop. Pure functies, zodat de RTP te simuleren is.
(function(root){
const COLS=6, ROWS=5, MAX_WIN=5000;
// Symbolen: id, naam, gewicht in basis / in free spins, uitbetaling (x inzet) bij 8-9 / 10-11 / 12+
const SYMS=[
 {id:'munt',   n:'Munt',      w:200, pay:[0.25,0.75,2]},
 {id:'dobbel', n:'Dobbelsteen',w:178,pay:[0.4,0.9,4]},
 {id:'fiche',  n:'Fiche',     w:160, pay:[0.5,1,5]},
 {id:'sleutel',n:'Sleutel',   w:146, pay:[0.8,1.2,8]},
 {id:'horloge',n:'Horloge',   w:114, pay:[1,1.5,10]},
 {id:'ring',   n:'Ring',      w:96,  pay:[1.5,2.5,12]},
 {id:'diamant',n:'Diamant',   w:76,  pay:[2,5,15]},
 {id:'goud',   n:'Goudstaaf', w:58,  pay:[5,10,25]}];
const SCATTER={id:'kluis',n:'Kluis',w:17,fsW:12};
const PAYK=1.22;SYMS.forEach(x=>x.pay=x.pay.map(v=>+(v*PAYK).toFixed(2)));
const SCATTER_PAY={4:3,5:5,6:100};
const FS_START=10, FS_RETRIGGER=5, BUY_COST=100;
const MULTS=[[2,260],[3,210],[4,170],[5,140],[6,95],[8,70],[10,52],[12,34],[15,22],[20,14],[25,9],[50,3.2],[100,1]];
const MULT_W=28; // kans (per 1000 cellen) op een multiplier in free spins

const totalW=fs=>SYMS.reduce((a,s)=>a+s.w,0)+(fs?SCATTER.fsW:SCATTER.w)+(fs?MULT_W:0);
function pickMult(rng){const t=MULTS.reduce((a,m)=>a+m[1],0);let r=rng()*t;for(const m of MULTS){r-=m[1];if(r<=0)return m[0]}return 2}
function cell(rng,fs){
  let r=rng()*totalW(fs);
  for(let i=0;i<SYMS.length;i++){r-=SYMS[i].w;if(r<=0)return {s:i}}
  r-=fs?SCATTER.fsW:SCATTER.w;if(r<=0)return {sc:1};
  return {m:pickMult(rng)};
}
function fillGrid(rng,fs,forceSc){
  const g=[];for(let c=0;c<COLS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(cell(rng,fs))}
  if(forceSc){ // bonusaankoop: precies forceSc kluizen op willekeurige kolommen
    g.forEach(col=>col.forEach((x,i)=>{if(x.sc)col[i]={s:Math.floor(rng()*SYMS.length)}}));
    const cols=[...Array(COLS).keys()].sort(()=>rng()-.5).slice(0,forceSc);
    cols.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1}});
  }
  return g;
}
const clone=g=>g.map(c=>c.map(x=>Object.assign({},x)));
function evaluate(g){
  const cnt=new Array(SYMS.length).fill(0);
  g.forEach(col=>col.forEach(x=>{if(x.s!=null)cnt[x.s]++}));
  const wins=[];
  cnt.forEach((n,i)=>{if(n>=8){const t=n>=12?2:n>=10?1:0;wins.push({sym:i,count:n,pay:SYMS[i].pay[t]})}});
  return wins;
}
function tumble(g,wins,rng,fs){
  const hit=new Set(wins.map(w=>w.sym));
  return g.map(col=>{
    const keep=col.filter(x=>!(x.s!=null&&hit.has(x.s)));
    const add=ROWS-keep.length;const fresh=[];for(let i=0;i<add;i++)fresh.push(Object.assign(cell(rng,fs),{nw:1}));
    return fresh.concat(keep.map(x=>{const y=Object.assign({},x);delete y.nw;return y}));
  });
}
// Eén spin (basis of free spin). Geeft alle tussenstappen terug voor de animatie.
function spin(rng,opts){
  opts=opts||{};const fs=!!opts.fs;
  let g=fillGrid(rng,fs,opts.forceSc||0);
  const steps=[];let win=0;
  for(let guard=0;guard<60;guard++){
    const wins=evaluate(g);
    steps.push({grid:clone(g),wins});
    if(!wins.length)break;
    win+=wins.reduce((a,w)=>a+w.pay,0);
    g=tumble(g,wins,rng,fs);
  }
  const last=steps[steps.length-1].grid;
  let sc=0,multSum=0;last.forEach(col=>col.forEach(x=>{if(x.sc)sc++;if(x.m)multSum+=x.m}));
  const base=win;
  if(fs&&win>0&&multSum>0)win*=multSum;
  const scPay=fs?0:(SCATTER_PAY[Math.min(6,sc)]||0);
  return {steps,base,multSum:fs?multSum:0,win,scatters:sc,scPay,trigger:!fs&&sc>=4,retrigger:fs&&sc>=3};
}
// Volledige free-spinsronde. Geeft elke spin terug; totaal in x inzet, met maximale winst.
function freeSpins(rng,start){
  // Totaalmultiplier: elke multiplier op een winnende spin telt op en geldt voor alle volgende winsten.
  let left=start||FS_START,total=0,run=0;const spins=[];
  while(left>0&&spins.length<200){left--;const s=spin(rng,{fs:true});
    if(s.base>0){if(s.multSum>0)run+=s.multSum;s.win=s.base*Math.max(1,run)}
    s.run=run;total+=s.win;if(s.retrigger)left+=FS_RETRIGGER;s.left=left;s.total=total;spins.push(s);
    if(total>=MAX_WIN){total=MAX_WIN;break}}
  return {spins,total:Math.min(total,MAX_WIN)};
}
// Hele ronde in x inzet: basisspin, eventueel free spins.
function playRound(rng,opts){
  opts=opts||{};
  if(opts.buy){const s=spin(rng,{forceSc:4});const fsr=freeSpins(rng,FS_START);
    const tot=Math.min(MAX_WIN,SCATTER_PAY[4]+fsr.total);return {base:s,fs:fsr,total:tot,cost:BUY_COST}}
  const s=spin(rng,{});let tot=s.win+s.scPay;let fsr=null;
  if(s.trigger){fsr=freeSpins(rng,FS_START);tot+=fsr.total}
  return {base:s,fs:fsr,total:Math.min(MAX_WIN,tot),cost:1};
}
const API={COLS,ROWS,SYMS,SCATTER,SCATTER_PAY,MULTS,FS_START,FS_RETRIGGER,BUY_COST,MAX_WIN,spin,freeSpins,playRound,evaluate};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SLOT=API;
})(typeof window!=='undefined'?window:globalThis);
