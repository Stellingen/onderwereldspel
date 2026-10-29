// Visdief: 5 rollen × 3 rijen, 10 vaste lijnen. Pure functies, zodat de RTP in Node te simuleren is (sim: visim.js).
// - Basisspel: lijnwinst van links naar rechts (3, 4 of 5 dezelfde). De vis is ook een gewoon lijnsymbool.
// - Boei = scatter (max één per rol). 3 boeien = 10 free spins, 4 = 15, 5 = 20.
// - Free spins: elke vis heeft een geldwaarde (× inzet). Valt er een Visdief (wild) op het scherm, dan pakt hij alle vissen.
//   Twee Visdieven pakken alles twee keer. Elke 4 Visdieven: +10 spins en een hogere multiplier (×2, ×3, ×10).
// - Max win 5.000× de inzet. VIP: per rol iets meer kans op een boei en in de bonus iets vaker een Visdief.
// - Elke volgende 4 Visdieven zijn lastiger (FS.lvlW). In een bonus van 10 spins: ×2 ±1 op 10, ×3 ±1 op 130, ×10 ±1 op 3.000.
// - Doorgerekend (visim.js): normaal RTP ±92% (bonus ±1 op 149), VIP ±97,7% (bonus ±1 op 132, ±5% vaker een Visdief), bonus kopen 44× ±96,5%.
(function(root){
const REELS=5,ROWS=3,MAX_WIN=5000;
const LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[1,0,0,0,1],[1,2,2,2,1],[0,0,1,2,2],[2,2,1,0,0],[1,2,1,0,1]];
// pay = uitbetaling in lijninzet (= inzet/10) voor 3, 4, 5 op een lijn
const SYMS=[
 {id:'dobber',n:'Dobber',  w:30,pay:[4,15,60]},
 {id:'haak',  n:'Haak',    w:30,pay:[4,15,60]},
 {id:'blik',  n:'Wormen',  w:27,pay:[5,20,80]},
 {id:'molen', n:'Molen',   w:25,pay:[5,25,100]},
 {id:'net',   n:'Visnet',  w:23,pay:[6,30,120]},
 {id:'koffer',n:'Koffer',  w:13,pay:[15,60,250]},
 {id:'boot',  n:'Speedboot',w:10,pay:[20,90,400]},
 {id:'hengel',n:'Hengel',  w:8, pay:[30,150,700]},
 {id:'vis',   n:'Vis',     w:14,pay:[10,40,150]}];
const VIS=SYMS.findIndex(s=>s.id==='vis');
let PAYK=4.31;
// geldwaarde van een vis (× inzet) en hoe vaak hij voorkomt
const FISH=[[2,320],[3,180],[5,160],[10,110],[15,60],[20,40],[25,26],[50,10],[100,3],[250,.6],[500,.12]];
// fsVis = extra visgewicht in de bonus, wild = Visdief-gewicht in de bonus
// lvlW = hoe vaak de Visdief valt per level: de eerste 4 zijn haalbaar, elke volgende 4 lastiger
const FS={vis:30,wild:2.3,vipWild:1.05,lvlW:[1,.72,.52,.4]};
// kans per rol op een boei (normaal / VIP); buy = altijd 3 boeien
const SC={p:.092,vip:.095};
const FS_BY_SC={3:10,4:15,5:20},RETRIG=10,MULTS=[1,2,3,10],PER_LEVEL=4;
let BUY_COST=44;
const SYM_TOT=fs=>SYMS.reduce((a,s,i)=>a+(i===VIS&&fs?FS.vis:s.w),0);
function fishVal(rng){const t=FISH.reduce((a,f)=>a+f[1],0);let r=rng()*t;for(const [v,w] of FISH){r-=w;if(r<=0)return v}return FISH[0][0]}
function pick(rng,fs,vip,lvl){const ww=fs?FS.wild*FS.lvlW[lvl||0]*(vip?FS.vipWild:1):0,tot=SYM_TOT(fs)+ww;let r=rng()*tot;
 for(let i=0;i<SYMS.length;i++){r-=(i===VIS&&fs?FS.vis:SYMS[i].w);if(r<=0)return i===VIS?{s:i,v:fishVal(rng)}:{s:i}}
 return {w:1}}
// raster g[rol][rij]; boeien: per rol hoogstens één
function fill(rng,fs,vip,forceSc,lvl){const g=[];
 for(let c=0;c<REELS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(pick(rng,fs,vip,lvl))}
 if(!fs){let cols=[];if(forceSc){cols=[...Array(REELS).keys()].sort(()=>rng()-.5).slice(0,forceSc)}else{for(let c=0;c<REELS;c++)if(rng()<(vip?SC.vip:SC.p))cols.push(c)}
  cols.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1}})}
 return g}
// lijnwinst (× inzet). Visdief (wild) vervangt alles behalve de boei.
function lineWins(g){const out=[];
 LINES.forEach((L,li)=>{let sym=null,n=0;
  for(let c=0;c<REELS;c++){const x=g[c][L[c]];if(x.sc)break;if(x.w){n++;continue}if(sym==null){sym=x.s;n++;continue}if(x.s===sym){n++;continue}break}
  if(sym==null&&n>=3)sym=SYMS.length-2; // alleen wilds: betaal als het hoogste gewone symbool (hengel)
  if(sym!=null&&n>=3){const pay=SYMS[sym].pay[n-3]*PAYK/10;out.push({line:li,sym,n,pay,cells:L.slice(0,n).map((r,c)=>[c,r])})}});
 return out}
function scCount(g){let n=0;g.forEach(col=>col.forEach(x=>{if(x.sc)n++}));return n}
// één spin in het basisspel
function spin(rng,opts){opts=opts||{};const g=fill(rng,false,!!opts.vip,opts.forceSc||0);const wins=opts.forceSc?[]:lineWins(g);
 const win=wins.reduce((a,w)=>a+w.pay,0),sc=scCount(g);return {grid:g,wins,win,sc,trigger:sc>=3}}
// bonusronde
function freeSpins(rng,start,vip){let left=start,total=0,caught=0,lvl=0,maxHit=false;const spins=[];
 while(left>0&&spins.length<200){left--;const g=fill(rng,true,vip,0,lvl);const wins=lineWins(g);let lw=wins.reduce((a,w)=>a+w.pay,0)*MULTS[lvl];
  let nw=0,fishSum=0;const fish=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(x.w)nw++;if(x.v){fishSum+=x.v;fish.push([c,r,x.v])}}));
  const col=nw&&fishSum?nw*fishSum*MULTS[lvl]:0,mult=MULTS[lvl];
  total+=lw+col;caught+=nw;
  let re=0;while(lvl<MULTS.length-1&&caught>=(lvl+1)*PER_LEVEL){lvl++;re+=RETRIG}left+=re;
  if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
  spins.push({grid:g,wins,lineWin:lw,collect:col,fish,wilds:nw,mult,caught,lvl,re,left:maxHit?0:left,total});
  if(maxHit)break}
 return {spins,total:Math.min(total,MAX_WIN),maxHit,lvl,caught}}
function playRound(rng,opts){opts=opts||{};
 // gekochte bonus: voor iedereen gelijk (het VIP-voordeel zit in vaker de bonus halen en meer Visdieven in gewonnen bonussen)
 if(opts.buy){const s=spin(rng,{forceSc:3});const fs=freeSpins(rng,FS_BY_SC[3],false);return {base:s,fs,fsStart:FS_BY_SC[3],total:Math.min(MAX_WIN,fs.total),cost:BUY_COST}}
 const s=spin(rng,{vip:opts.vip});let tot=s.win,fs=null,n=0;
 if(s.trigger){n=FS_BY_SC[Math.min(5,s.sc)];fs=freeSpins(rng,n,!!opts.vip);tot+=fs.total}
 return {base:s,fs,fsStart:n,total:Math.min(MAX_WIN,tot),cost:1}}
const tune=o=>{if(o.payk!=null)PAYK=o.payk;if(o.p!=null)SC.p=o.p;if(o.pVip!=null)SC.vip=o.pVip;if(o.fsVis!=null)FS.vis=o.fsVis;if(o.wild!=null)FS.wild=o.wild;if(o.vipWild!=null)FS.vipWild=o.vipWild;if(o.lvlW)FS.lvlW=o.lvlW;
 if(o.fish)o.fish.forEach((w,i)=>{if(FISH[i])FISH[i][1]=w});if(o.buyCost!=null)BUY_COST=o.buyCost};
const API={REELS,ROWS,LINES,SYMS,FISH,FS,SC,FS_BY_SC,RETRIG,MULTS,PER_LEVEL,MAX_WIN,get BUY_COST(){return BUY_COST},get PAYK(){return PAYK},VIS,tune,spin,freeSpins,playRound,lineWins,fill};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VISD=API;
})(typeof window!=='undefined'?window:globalThis);
