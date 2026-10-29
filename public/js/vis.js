// Visdief: 5 rollen × 4 rijen, 20 vaste lijnen. Pure functies, zodat de RTP in Node te simuleren is (sim: visim.js).
// - Basisspel: lijnwinst van links naar rechts (3, 4 of 5 dezelfde). De vis is ook een gewoon lijnsymbool.
// - Boei = scatter (max één per rol). 3 boeien = 10 free spins, elke extra boei +2 (4 = 12), een volle rij van 5 = 15.
// - Free spins: elke vis heeft een geldwaarde (× inzet). Valt er een Visdief (wild) op het scherm, dan pakt hij alle vissen.
//   Twee Visdieven pakken alles twee keer.
// - Rondes: een ronde speelt altijd helemaal uit. Heb je aan het eind 4 Visdieven (ronde 1), dan begint ronde 2 met 10 spins
//   en telt alles ×2; bij 8 in totaal ronde 3 (×3), bij 12 ronde 4 (×10). Extra Visdieven tellen door voor de volgende ronde.
//   Elke volgende 4 zijn lastiger te vangen, en in hogere rondes zwemmen er vaker grote vissen (zo blijft de max win haalbaar).
// - Hoge volatiliteit: de bonus is lastig te halen en de meeste bonussen zijn klein, maar heel soms vang je een reus.
// - Max win 10.000× de inzet (€20 kan €200.000 worden). In ronde 4 (×10) zwemt de 1.000×-vis vaker: dat is de max win.
// - Lidmaatschap (0 gewoon, 1 VIP, 2 High roller): VIP ±15% en High roller ±40% vaker in de bonus en iets vaker een Visdief.
//   Om onder 100% RTP te blijven betaalt lijnwinst in hun basisspel minder (VIP_KT). De bonus zelf is voor iedereen gelijk.
// - Bonus kopen (66×): altijd 3 boeien, op de andere rollen kan er vanzelf nog een vallen (iets vaker voor VIP/High roller).
// - Doorgerekend (visim.js 2 mln. spins, vbuy.js): normaal RTP ±92%, VIP ±97% + 0,5% cashback, bonus kopen ±96,5% (VIP ±97,5%).
//   Bonus van 10 spins: ronde 2 ±1 op 10, ronde 3 ±1 op 65, ronde 4 ±1 op 430, max win ±1 op 11.000 (20 spins: ±1 op 1.100).
(function(root){
const REELS=5,ROWS=4,MAX_WIN=10000;
const LINES=[[1,1,1,1,1],[2,2,2,2,2],[0,0,0,0,0],[3,3,3,3,3],[0,1,2,1,0],[3,2,1,2,3],[1,2,3,2,1],[2,1,0,1,2],[0,1,1,1,0],[3,2,2,2,3],
 [1,0,0,0,1],[2,3,3,3,2],[1,2,2,2,1],[2,1,1,1,2],[0,0,1,2,3],[3,3,2,1,0],[1,1,0,1,1],[2,2,3,2,2],[0,1,0,1,0],[3,2,3,2,3]];
// pay = uitbetaling in lijninzet (= inzet/20) voor 3, 4, 5 op een lijn
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
let PAYK=4.05;
// geldwaarde van een vis (× inzet) en hoe vaak hij voorkomt
// waarde × inzet en gewicht. Veel kleine vissen (een halve inzet tot 5×), af en toe een grote, heel zelden een reus.
const FISH=[[.5,300],[1,260],[2,200],[3,140],[5,110],[10,70],[15,40],[25,22],[50,10],[100,3],[250,.6],[500,.15],[1000,.04]];
// grote vissen zwemmen in hogere rondes vaker: factor op het gewicht per ronde (1, 2, 3, 4). De 500×-vis is in ronde 4 (×10) de max win.
let BIG={100:[1,1.5,2.5,5],250:[1,1.8,3,8],500:[1,2,4,30],1000:[1,2,5,200]};
// fsVis = extra visgewicht in de bonus, wild = Visdief-gewicht in de bonus
// lvlW = hoe vaak de Visdief valt per level: de eerste 4 zijn haalbaar, elke volgende 4 lastiger
const FS={vis:50,wild:1.88,wildT:[1,1.02,1.04],lvlW:[1,.95,.85,.72]};
// kans per rol op een boei (normaal / VIP); buy = altijd 3 boeien
const SC={p:.083,t:[.083,.087,.0935],buy:.083,buyT:[.083,.084,.085]}; // t = per lidmaatschap; buyT = kans per overige rol bij een gekochte bonus
const FS_BY_SC={3:10,4:12,5:15},RETRIG=10,MULTS=[1,2,3,10],PER_LEVEL=4;
let BUY_COST=66;
const SYM_TOT=fs=>SYMS.reduce((a,s,i)=>a+(i===VIS&&fs?FS.vis:s.w),0);
function fishVal(rng,rd){const W=f=>BIG[f[0]]?f[1]*BIG[f[0]][rd||0]:f[1];const t=FISH.reduce((a,f)=>a+W(f),0);let r=rng()*t;for(const f of FISH){r-=W(f);if(r<=0)return f[0]}return FISH[0][0]}
function pick(rng,fs,vip,lvl,rd){const ww=fs?FS.wild*FS.lvlW[lvl||0]*(FS.wildT[vip|0]||1):0,tot=SYM_TOT(fs)+ww;let r=rng()*tot;
 for(let i=0;i<SYMS.length;i++){r-=(i===VIS&&fs?FS.vis:SYMS[i].w);if(r<=0)return i===VIS?{s:i,v:fishVal(rng,rd)}:{s:i}}
 return {w:1}}
// raster g[rol][rij]; boeien: per rol hoogstens één
function fill(rng,fs,vip,forceSc,lvl,rd){const g=[];
 for(let c=0;c<REELS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(pick(rng,fs,vip,lvl,rd))}
 // gekochte bonus: 3 gegarandeerde boeien, en op de andere rollen kan er vanzelf nog een vallen (4 of zelfs 5)
 if(!fs){let cols=[];if(forceSc){cols=[...Array(REELS).keys()].sort(()=>rng()-.5).slice(0,forceSc);for(let c=0;c<REELS;c++)if(!cols.includes(c)&&rng()<(SC.buyT[vip|0]||SC.buy))cols.push(c)}else{for(let c=0;c<REELS;c++)if(rng()<(SC.t[vip|0]||SC.p))cols.push(c)}
  cols.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1}})}
 return g}
// lijnwinst (× inzet). Visdief (wild) vervangt alles behalve de boei.
// VIP_KT: lijnwinst in het basisspel per lidmaatschap (VIP komt veel vaker in de bonus; zo blijft VIP onder 100% RTP)
let VIP_KT=[1,.94,.833];
function lineWins(g,k){k=k||1;const out=[];
 LINES.forEach((L,li)=>{let sym=null,n=0;
  for(let c=0;c<REELS;c++){const x=g[c][L[c]];if(x.sc)break;if(x.w){n++;continue}if(sym==null){sym=x.s;n++;continue}if(x.s===sym){n++;continue}break}
  if(sym==null&&n>=3)sym=SYMS.length-2; // alleen wilds: betaal als het hoogste gewone symbool (hengel)
  if(sym!=null&&n>=3){const pay=SYMS[sym].pay[n-3]*PAYK/LINES.length*k;out.push({line:li,sym,n,pay,cells:L.slice(0,n).map((r,c)=>[c,r])})}});
 return out}
function scCount(g){let n=0;g.forEach(col=>col.forEach(x=>{if(x.sc)n++}));return n}
// één spin in het basisspel
function spin(rng,opts){opts=opts||{};const t=+opts.vip||0,g=fill(rng,false,t,opts.forceSc||0);const wins=opts.forceSc?[]:lineWins(g,VIP_KT[t]||1);
 const win=wins.reduce((a,w)=>a+w.pay,0),sc=scCount(g);return {grid:g,wins,win,sc,trigger:sc>=3}}
// bonus: rondes van spins. lvl = huidige ronde (0 = ronde 1). Visdief-kans hangt af van hoeveel je er al hebt (elke 4 lastiger).
function freeSpins(rng,start,vip){let left=start,total=0,caught=0,lvl=0,maxHit=false;const spins=[];let newRound=0;
 while(spins.length<300){
  if(left<=0){if(lvl<MULTS.length-1&&caught>=(lvl+1)*PER_LEVEL){lvl++;left=RETRIG;newRound=lvl+1}else break}
  left--;const wl=Math.min(MULTS.length-1,Math.floor(caught/PER_LEVEL)),mult=MULTS[lvl];
  const g=fill(rng,true,vip,0,wl,lvl);const wins=lineWins(g);const lw=wins.reduce((a,w)=>a+w.pay,0)*mult;
  let nw=0,fishSum=0;const fish=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(x.w)nw++;if(x.v){fishSum+=x.v;fish.push([c,r,x.v])}}));
  const col=nw&&fishSum?nw*fishSum*mult:0;
  total+=lw+col;caught+=nw;
  if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
  const next=lvl<MULTS.length-1?(lvl+1)*PER_LEVEL:null;
  spins.push({grid:g,wins,lineWin:lw,collect:col,fish,wilds:nw,mult,caught,lvl,round:lvl+1,newRound,left:maxHit?0:left,total,secured:next!=null&&caught>=next});
  newRound=0;if(maxHit)break}
 return {spins,total:Math.min(total,MAX_WIN),maxHit,lvl,caught}}
function playRound(rng,opts){opts=opts||{};
 // gekochte bonus: voor iedereen gelijk (het VIP-voordeel zit in vaker de bonus halen en meer Visdieven in gewonnen bonussen)
 if(opts.buy){const s=spin(rng,{forceSc:3,vip:opts.vip});const n=FS_BY_SC[Math.min(5,s.sc)];const fs=freeSpins(rng,n,false);return {base:s,fs,fsStart:n,total:Math.min(MAX_WIN,fs.total),cost:BUY_COST}}
 const s=spin(rng,{vip:opts.vip});let tot=s.win,fs=null,n=0;
 if(s.trigger){n=FS_BY_SC[Math.min(5,s.sc)];fs=freeSpins(rng,n,+opts.vip||0);tot+=fs.total}
 return {base:s,fs,fsStart:n,total:Math.min(MAX_WIN,tot),cost:1}}
const tune=o=>{if(o.payk!=null)PAYK=o.payk;if(o.p!=null)SC.p=o.p;if(o.scT)SC.t=o.scT;if(o.buyT)SC.buyT=o.buyT;if(o.wildT)FS.wildT=o.wildT;if(o.vipKT)VIP_KT=o.vipKT;if(o.pBuy!=null)SC.buy=o.pBuy;if(o.fsVis!=null)FS.vis=o.fsVis;if(o.wild!=null)FS.wild=o.wild;if(o.lvlW)FS.lvlW=o.lvlW;if(o.big)BIG=o.big;
 if(o.fish)o.fish.forEach((w,i)=>{if(FISH[i])FISH[i][1]=w});if(o.buyCost!=null)BUY_COST=o.buyCost};
const API={REELS,ROWS,LINES,SYMS,FISH,FS,SC,FS_BY_SC,RETRIG,MULTS,PER_LEVEL,MAX_WIN,get BUY_COST(){return BUY_COST},get PAYK(){return PAYK},get VIP_KT(){return VIP_KT},VIS,tune,spin,freeSpins,playRound,lineWins,fill};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VISD=API;
})(typeof window!=='undefined'?window:globalThis);
