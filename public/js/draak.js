// Gouden Draak: 5 rollen × 3 rijen, 20 vaste lijnen. Pure functies, zodat de RTP in Node te simuleren is (sim: draaksim.js).
// - Basisspel: lijnwinst van links naar rechts (3, 4 of 5 dezelfde). De parel (wild) valt op rol 2, 3 en 4 en vervangt alles
//   behalve de gong en de munt.
// - Gong = scatter op rol 1, 3 en 5 (één per rol). 3 gongs = 10 free spins met de Reuzendraak: rol 2, 3 en 4 worden één groot
//   blok van 3×3 met één symbool. Dat telt als drie volle rollen van dat symbool, dus één gelijk symbool op rol 1 geeft al vier
//   op een lijn. Een gong op rol 1 + een reuzengong in het midden + een gong op rol 5 geeft 3 spins extra (zeldzaam).
// - Gouden munt: valt overal in het basisspel met een geldwaarde (× inzet) of een jackpot. 6 of meer munten = de
//   Muntenbonus op het hele bord (5 × 3 = 15 vakjes). De munten blijven staan, je hebt 3 spins. Valt er een munt bij, dan blijft hij
//   plakken en sta je weer op 3; valt er niets, dan gaat er één spin af. Alle 15 vakjes vol = Mega: de max win.
// - Jackpots: Mini 10×, Minor 25×, Major 100×, Mega (alle 15 vol) 5.000× je inzet (de max win).
// - Lidmaatschap (0 gewoon, 1 VIP, 2 High roller): vaker gongs en munten; lijnwinst in het basisspel is daarvoor lager (VIP_KT).
// - Bonus kopen: free spins (FS_BUY×) of de muntenbonus met 6 munten (HS_BUY×).
// - Doorgerekend (draaksim3.js, 3 mln. spins per lidmaatschap): RTP ±93,5% (VIP ±95,5%, High roller ±97%). Free spins ±1 op 240
//   (gem. ±55×), muntenbonus ±1 op 260 (gem. ±42×), bord vol ±1 op 1.700 muntenbonussen. Kopen: free spins ±96%, munten ±96%.
//   VIP en High roller: jackpotmunten 30% / 60% vaker en het laatste vakje voor de Mega 20% / 40% vaker. Kopen is voor iedereen gelijk.
//   3 spins extra: ±1 op 80 free-spinbonussen.
(function(root){
const REELS=5,ROWS=3,MAX_WIN=5000,HS_N=15,HS_SPINS=3,FS_START=10,FS_RETRIG=3,HS_TRIG=6;
const LINES=[[1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[1,0,1,2,1],
 [1,2,1,0,1],[0,1,1,1,0],[2,1,1,1,2],[0,1,0,1,0],[2,1,2,1,2],[1,1,0,1,1],[1,1,2,1,1],[0,0,2,0,0],[2,2,0,2,2],[0,2,0,2,0]];
// pay = uitbetaling in lijninzet (inzet/20) voor 3, 4 en 5 op een lijn; w = gewicht op de rollen; cw = gewicht als reuzensymbool
const SYMS=[
 {id:'koekje', n:'Gelukskoekje',w:30,cw:16,pay:[4,12,40]},
 {id:'stokjes',n:'Eetstokjes',  w:30,cw:16,pay:[4,12,40]},
 {id:'theepot',n:'Theepot',     w:27,cw:15,pay:[5,15,50]},
 {id:'jade',   n:'Jade',        w:25,cw:14,pay:[5,20,60]},
 {id:'waaier', n:'Waaier',      w:15,cw:10,pay:[10,40,120]},
 {id:'lantaarn',n:'Lantaarn',   w:12,cw:8, pay:[15,60,200]},
 {id:'kat',    n:'Gelukskat',   w:9, cw:6, pay:[20,80,300]},
 {id:'draak',  n:'Draak',       w:6, cw:4, pay:[30,150,600]}];
let PAYK=3.14,FS_K=.391;          // schaal op lijnwinst in het basisspel en in de free spins
let VIP_KT=[1,.965,.905];      // lijnwinst basisspel per lidmaatschap
const WILD={w:5,cw:2.2};    // parel op rol 2-4; cw = kans op een reuzenparel in de free spins
const GONG={cw:3};        // reuzengong in de free spins (alleen dan kan er een retrigger komen)
const SC={p:.16,t:[.16,.165,.17],fsEnd:.2};      // kans per rol (1, 3, 5) op een gong; fsEnd = in de free spins op rol 1 en 5
const COIN={q:.115,t:[.115,.117,.12],pk:[.075,.075,.075,.075,.075,.075,.075,.075,.075,.075,.075,.07,.06,.04,.005]};  // q = kans op een munt per vakje (basis); pk[n] = kans per leeg vakje per spin als er n vol zijn
// munten: waarde × inzet en gewicht. Veel kleine, af en toe een grote, heel soms een jackpot.
const JP={mini:10,minor:25,major:100};
const COINS=[[1,300],[2,240],[3,170],[4,120],[5,90],[8,55],[10,40],[15,22],[20,14],[25,9],[50,3],['mini',12],['minor',4],['major',.7]];
let FS_BUY=57,HS_BUY=43;
const coinVal=v=>typeof v==='string'?JP[v]:v;
// VIP en High roller: jackpotmunten vallen vaker (JPT) en het laatste vakje voor de Mega iets vaker (MEGT)
let JPT=[1,1.3,1.6],MEGT=[1,1.2,1.4];
function pickCoin(rng,vip){const k=JPT[vip|0]||1,W=c=>typeof c[0]==='string'?c[1]*k:c[1];const t=COINS.reduce((a,c)=>a+W(c),0);let r=rng()*t;for(const c of COINS){r-=W(c);if(r<=0)return c[0]}return COINS[0][0]}
function pickSym(rng,reel,base){const wild=reel>=1&&reel<=3;const tot=SYMS.reduce((a,s)=>a+s.w,0)+(wild?WILD.w:0);let r=rng()*tot;
 for(let i=0;i<SYMS.length;i++){r-=SYMS[i].w;if(r<=0)return {s:i}}return {w:1}}
// basisraster g[rol][rij]: munten per vakje, gongs per rol (1, 3, 5)
function fill(rng,vip,force){const g=[];const q=COIN.t[vip|0]||COIN.q;
 for(let c=0;c<REELS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(rng()<q?{m:pickCoin(rng,vip)}:pickSym(rng,c))}
 const scP=SC.t[vip|0]||SC.p;
 if(force==='fs'){[0,2,4].forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1}})}
 else{[0,2,4].forEach(c=>{if(rng()<scP)g[c][Math.floor(rng()*ROWS)]={sc:1}})}
 if(force==='hs'){let n=coinsOf(g).length;const free=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(!x.m&&!x.sc)free.push([c,r])}));
  while(n<HS_TRIG&&free.length){const i=Math.floor(rng()*free.length),[c,r]=free.splice(i,1)[0];g[c][r]={m:pickCoin(rng,vip)};n++}}
 return g}
const coinsOf=g=>{const o=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(x.m!=null)o.push([c,r,x.m])}));return o};
const scOf=g=>{let n=0;g.forEach(col=>col.forEach(x=>{if(x.sc)n++}));return n};
// lijnwinst (× inzet). Wild vervangt alles behalve gong en munt.
function lineWins(g,k){k=k||1;const out=[];
 LINES.forEach((L,li)=>{let sym=null,n=0;
  for(let c=0;c<REELS;c++){const x=g[c][L[c]];if(x.sc||x.m!=null)break;if(x.w){n++;continue}if(sym==null){sym=x.s;n++;continue}if(x.s===sym){n++;continue}break}
  if(sym==null&&n>=3)sym=SYMS.length-1;
  if(sym!=null&&n>=3){const pay=SYMS[sym].pay[n-3]*PAYK/LINES.length*k;out.push({line:li,sym,n,pay,cells:L.slice(0,n).map((r,c)=>[c,r])})}});
 return out}
function spin(rng,opts){opts=opts||{};const t=+opts.vip||0,g=fill(rng,t,opts.force);const wins=opts.force?[]:lineWins(g,VIP_KT[t]||1);
 const win=wins.reduce((a,w)=>a+w.pay,0),sc=scOf(g),coins=coinsOf(g);return {grid:g,wins,win,sc,coins,fs:sc>=3,hs:coins.length>=HS_TRIG}}
// free spins: rol 1 en 5 gewoon (3 vakjes), het midden één reuzensymbool
function pickBig(rng){const tot=SYMS.reduce((a,s)=>a+s.cw,0)+WILD.cw+GONG.cw;let r=rng()*tot;
 for(let i=0;i<SYMS.length;i++){r-=SYMS[i].cw;if(r<=0)return {s:i}}r-=WILD.cw;if(r<=0)return {w:1};return {sc:1}}
function fsGrid(rng){const big=pickBig(rng),g=[];
 for(let c=0;c<REELS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(c>=1&&c<=3?Object.assign({big:1},big):pickSym(rng,0))}
 [0,4].forEach(c=>{if(rng()<SC.fsEnd)g[c][Math.floor(rng()*ROWS)]={sc:1}});
 return {g,big}}
function freeSpins(rng){let left=FS_START,total=0,maxHit=false;const spins=[];
 while(left>0&&spins.length<200){left--;const {g,big}=fsGrid(rng);const wins=lineWins(g,FS_K);const win=wins.reduce((a,w)=>a+w.pay,0);
  const re=big.sc&&g[0].some(x=>x.sc)&&g[4].some(x=>x.sc);if(re)left+=FS_RETRIG;
  total+=win;if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
  spins.push({grid:g,big,wins,win,total,left:maxHit?0:left,extra:re?FS_RETRIG:0});if(maxHit)break}
 return {spins,total,maxHit}}
// Muntenbonus op het hele bord (5 × 3 = 15 vakjes): de munten blijven op hun plek staan. start = [[vakje, waarde]]; vakje = rol*3 + rij
function holdSpin(rng,start,vip){const cells=Array(HS_N).fill(null);start.forEach(([i,v])=>{cells[i]=v});const st=cells.slice();let left=HS_SPINS;const steps=[];
 while(left>0&&cells.some(x=>x==null)&&steps.length<300){const nw=[];
  for(let i=0;i<HS_N;i++){if(cells[i]!=null)continue;const n=cells.filter(x=>x!=null).length;const p=(COIN.pk[n]||0)*(n===HS_N-1?(MEGT[vip|0]||1):1);if(rng()<p){const v=pickCoin(rng,vip);cells[i]=v;nw.push([i,v])}}
  left=nw.length?HS_SPINS:left-1;steps.push({nw,left,filled:cells.filter(x=>x!=null).length})}
 const full=cells.every(x=>x!=null),sum=cells.reduce((a,v)=>a+(v==null?0:coinVal(v)),0);
 return {start:st,steps,cells,full,sum,total:full?MAX_WIN:Math.min(MAX_WIN,sum)}}
const hsStart=s=>s.coins.map(([c,r,v])=>[c*ROWS+r,v]);
function playRound(rng,opts){opts=opts||{};const t=+opts.vip||0;
 if(opts.buy==='fs'){const s=spin(rng,{force:'fs',vip:t});const fs=freeSpins(rng);return {base:s,fs,hs:null,total:Math.min(MAX_WIN,fs.total),buy:'fs',cost:FS_BUY}}
 if(opts.buy==='hs'){const s=spin(rng,{force:'hs',vip:0});const hs=holdSpin(rng,hsStart(s),0);return {base:s,fs:null,hs,total:hs.total,buy:'hs',cost:HS_BUY}}
 const s=spin(rng,{vip:t});let tot=s.win,fs=null,hs=null;
 if(s.fs){fs=freeSpins(rng);tot+=fs.total}
 if(s.hs&&tot<MAX_WIN){hs=holdSpin(rng,hsStart(s),t);tot+=hs.total}
 return {base:s,fs,hs,total:Math.min(MAX_WIN,tot),cost:1}}
const tune=o=>{if(o.payk!=null)PAYK=o.payk;if(o.vipKT)VIP_KT=o.vipKT;if(o.scT)SC.t=o.scT;if(o.fsEnd!=null)SC.fsEnd=o.fsEnd;if(o.q)COIN.t=o.q;if(o.pk)COIN.pk=o.pk;if(o.fsk!=null)FS_K=o.fsk;
 if(o.wild!=null)WILD.w=o.wild;if(o.cwild!=null)WILD.cw=o.cwild;if(o.gong!=null)GONG.cw=o.gong;if(o.fsBuy!=null)FS_BUY=o.fsBuy;if(o.hsBuy!=null)HS_BUY=o.hsBuy;
 if(o.jpt)JPT=o.jpt;if(o.megt)MEGT=o.megt;if(o.coins)o.coins.forEach((w,i)=>{if(COINS[i])COINS[i][1]=w});if(o.cw)o.cw.forEach((w,i)=>{if(SYMS[i])SYMS[i].cw=w})};
const API={REELS,ROWS,LINES,SYMS,COINS,JP,WILD,GONG,SC,COIN,MAX_WIN,HS_N,HS_SPINS,HS_TRIG,FS_START,FS_RETRIG,get FS_BUY(){return FS_BUY},get HS_BUY(){return HS_BUY},
 get PAYK(){return PAYK},get FS_K(){return FS_K},get VIP_KT(){return VIP_KT},coinVal,hsStart,tune,spin,fill,fsGrid,freeSpins,holdSpin,playRound,lineWins,pickCoin,pickSym};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.DRAAK=API;
})(typeof window!=='undefined'?window:globalThis);
