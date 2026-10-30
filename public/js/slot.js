// Kluiskraker v3: cluster-slot op een 10x10 raster met 9 symbolen (Speelkaart en Sigaar zijn de laagste).
// - Winst: 5+ gelijke symbolen die horizontaal/verticaal aan elkaar grenzen (een cluster). Uitbetaling per grootte 5 … 20+.
// - Loper (wild): telt mee voor elk symbool en kan zo twee groepjes verbinden.
// - Vakjes: waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt er op een gemarkeerd vakje opnieuw een winst,
//   dan wordt het x2, daarna x4, x8 ... tot x4096. Alle vakjes in een cluster worden opgeteld en vermenigvuldigen de clusterwinst.
// - Basisspel: vakjes worden na elke spin gewist. Free spins: vakjes blijven de hele bonus staan.
// - 3 kluizen = 10 free spins, 4 = 12, 5 = 14, 6+ = superbonus (8 spins, meer lopers, één Gouden baar = max win).
//   Tijdens de bonus geven 2+ kluizen extra spins (2:+2, 3:+4, 4:+6, 5+:+8).
// - Doortumbelen: zolang er winst valt, vallen er nieuwe symbolen in en kan er een kluis bij komen. Liggen er al 3 of meer,
//   dan valt een extra kluis makkelijker in (TUMBLE_SC, per aantal kluizen en per lidmaatschap).
// - Gewone bonus: een Gouden baar blijft de hele bonus vast op zijn vakje liggen (ook bij tumbles) en telt als loper; 3 baren = max win.
// - Bonus kopen = 100x inzet: altijd 3 kluizen bovenop wat er vanzelf valt; doortumbelen kan tot de superbonus. +2 free spins.
// - Uitbetaling: basisspel BASE_K x de tabel (VIP/High roller × VIP_KT), (super)bonus FS_K x de tabel.
// - Lidmaatschap (0 gewoon, 1 VIP, 2 High roller): bonus ±15% / ±40% vaker (SC_T), basisspel iets lager (VIP_KT).
// - Max win: 5.000× de inzet voor de hele ronde (ook bij een gekochte bonus telt de inzet, niet de prijs van de bonus).
//   3 Gouden baren (gewone bonus) of 1 baar (superbonus) is meteen de max win; dat is daarom heel zeldzaam (±1 op 1.000 gekochte bonussen).
// - Bonus kopen: 8 vakjes beginnen op x2, eigen uitbetalingsfactor per lidmaatschap (BUY_KT) en een vangnet van minstens 20×.
// - Doorgerekend: sim9.js (basisspel + bonus per lidmaatschap) en simbuy4.js (gekochte bonus); zie README voor de cijfers.
// Pure functies, zodat de RTP in Node te simuleren is (zie README).
(function(root){
const COLS=10, ROWS=10, MIN_CLUSTER=5;let MAX_SPOT=4096,MAX_WIN=5000;
// Uitbetaling (x inzet) per clustergrootte 5 … 20+ (10x10: grote clusters komen vaker voor)
const CURVE=[1,1.4,1.9,2.6,3.5,5,6.5,9,12,16,21,27,34,42,52,65];const MAX_SIZE=MIN_CLUSTER+CURVE.length-1;
const SYMS=[
 {id:'kaart',  n:'Speelkaart', w:223, b:0.06},
 {id:'sigaar', n:'Sigaar',     w:210, b:0.0818},
 {id:'munt',   n:'Munt',       w:205, b:0.1222},
 {id:'dobbel', n:'Dobbelsteen',w:190, b:0.1423},
 {id:'fiche',  n:'Fiche',      w:172, b:0.17},
 {id:'horloge',n:'Horloge',    w:150, b:0.2432},
 {id:'ring',   n:'Ring',       w:128, b:0.4047},
 {id:'diamant',n:'Diamant',    w:104, b:0.55},
 {id:'goud',   n:'Goudstaaf',  w:74,  b:1.617}];
let PAYK=1;
const setPay=k=>{PAYK=k;SYMS.forEach(s=>{s.pay=CURVE.map(c=>+(s.b*c*PAYK).toFixed(2))})};setPay(3.5);
// basisspel: loper iets zeldzamer (17,55) sinds de hogere uitbetalingen; de kluis is daarop aangepast zodat de bonus even vaak valt
const WILD={id:'sleutel',n:'Loper',w:17.55,fsW:70,superW:105};
const SCATTER={id:'kluis',n:'Kluis',w:4.8448,fsW:6,superW:7.5};
// Lidmaatschap (t): 0 = gewoon, 1 = VIP, 2 = High roller. Per lidmaatschap: kluiskans in het basisspel (SC_T), kluiskans
// bij een gekochte bonus (BUY_T), basisspel-uitbetaling (VIP_KT, lager zodat het onder 100% blijft) en kans op Gouden baren.
let SC_T=[1,1.05,1.13],BUY_T=[1,1.04,1.07],VIP_KT=[1,.99,.89],BAR_T=[1,1.02,1.05];
// Gouden baar: in de superbonus vaker, in de gewone bonus heel zeldzaam
// t3/t4/t5 = in de gewone bonus, afhankelijk van met hoeveel kluizen je erin kwam (meer kluizen = meer kans op de max win)
// Gewone bonus: gouden baren blijven de hele bonus staan; bij 3 baren = max win. t3/t4/t5 = kans per vakje (met 3, 4 of 5 kluizen
// begonnen), vipK = VIP iets meer kans. Superbonus: één baar is direct de max win (w).
const BAR={id:'baar',n:'Gouden baar',w:.012,fsW:.13,t3:.055,t4:.058,t5:.061,need:3};let BAR_NOW=null;
// Uitbetalingsfactor: basisspel (BASE_K) en bonus/superbonus (FS_K)
let BASE_K=1.43,FS_K=.775;
// gekochte bonus: eigen uitbetalingsfactor per lidmaatschap (BUY_KT, zodat bonus kopen ±95 / 95,5 / 96,5% geeft) en een paar vakjes die al x2 zijn bij de start (BUY_SPOTS)
// vangnet: een gekochte bonus geeft altijd minstens BUY_FLOOR × je inzet terug
let BUY_KT=[.6728,.6693,.6722],BUY_SPOTS=8,BUY_FLOOR=20,FS_MUL=1;
// Doortumbelen: vermenigvuldiger op de kluiskans bij het bijvullen, per aantal kluizen dat al ligt (0..5). n = normaal, v = VIP.
// Bij 0-2 kluizen is VIP iets hoger (makkelijker de bonus in), vanaf 3 valt een volgende kluis makkelijker in, elke volgende lastiger.
let TUMBLE_SC={n:[1,1,1,20,19,17.5],t:[[1,1,1,20,19,17.5],[1,1,1,20.4,19.4,17.9],[1,1,1,21.4,20.3,18.7]],buy:1.3}; // buy = extra bij een gekochte bonus (vanaf 3 kluizen)
const FS_BY_SC={3:10,4:12,5:14};
const SUPER_SC=6,SUPER_SPINS=8;
const FS_START=10, FS_RETRIGGER=2;let BUY_COST=100,BUY_EXTRA=2,BUY_EXTRA_SUP=1;
// Extra spins tijdens de bonus: hoe meer kluizen, hoe meer spins
const FS_RETRIG={2:2,3:4,4:6,5:8};
const SCATTER_PAY={};
// basisspel: BASE_K (VIP: × VIP_K) · bonus en superbonus: FS_K
const payFor=(s,n,base,t)=>SYMS[s].pay[Math.min(n,MAX_SIZE)-MIN_CLUSTER]*(base?BASE_K*(VIP_KT[t|0]||1):FS_K*FS_MUL);

// mode: 'base' (basisspel), 'fs' (bonus), 'super' (superbonus). vip telt alleen in het basisspel.
const SYM_TOT=()=>SYMS.reduce((a,x)=>a+x.w,0);
// Kluizen vallen in het basisspel vaker links dan rechts (gemiddeld gelijk): zo is er spanning of rechts de laatste nog valt
const SC_COL=[1.45,1.35,1.25,1.15,1.05,.95,.85,.75,.65,.55];
function pick(rng,mode,vip,col,scK){
  const ww=mode==='super'?WILD.superW:mode==='fs'?WILD.fsW:WILD.w,sw=mode==='base'?SCATTER.w*(SC_T[vip|0]||1)*(col!=null?SC_COL[col]:1)*(scK||1):mode==='super'?SCATTER.superW:SCATTER.fsW,bw=mode==='super'?BAR.w:mode==='fs'?(BAR_NOW!=null?BAR_NOW:BAR.fsW):0;
  let r=rng()*(SYM_TOT()+ww+sw+bw);
  for(let i=0;i<SYMS.length;i++){r-=SYMS[i].w;if(r<=0)return {s:i}}
  r-=ww;if(r<=0)return {w:1};
  r-=sw;if(r<=0)return {sc:1};
  return {bar:1};
}
const newSpots=()=>Array.from({length:COLS},()=>new Array(ROWS).fill(0));
const cloneG=g=>g.map(c=>c.map(x=>Object.assign({},x)));
const cloneS=s=>s.map(c=>c.slice());
function fill(rng,mode,forceSc,vip){
  // bij een gekochte bonus valt een VIP/High roller net iets vaker een kluis vanzelf (BUY_T), anders zou het boven 100% uitkomen
  const k0=forceSc&&vip?BUY_T[vip]/SC_T[vip]:1;
  const g=[];for(let c=0;c<COLS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(Object.assign(pick(rng,mode,vip,c,k0),{fall:ROWS}))}
  // gekochte bonus: 3 gegarandeerde kluizen bovenop wat er vanzelf al valt (valt er al 1, dan heb je er 4)
  if(forceSc){
    const free=[...Array(COLS).keys()].filter(c=>!g[c].some(x=>x.sc)).sort(()=>rng()-.5).slice(0,forceSc);
    free.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1,fall:ROWS}});
  }
  return g;
}
// Zoekt alle clusters. Een loper kan in clusters van verschillende symbolen meetellen.
function clusters(g,spots,base,vip){
  const out=[];
  for(let s=0;s<SYMS.length;s++){
    const seen=new Set();
    for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++){
      if(g[c][r].s!==s||seen.has(c*ROWS+r))continue;
      const cells=[],stack=[[c,r]],local=new Set([c*ROWS+r]);let real=0;
      while(stack.length){const [x,y]=stack.pop();cells.push([x,y]);if(g[x][y].s===s){real++;seen.add(x*ROWS+y)}
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)continue;const k=nx*ROWS+ny;if(local.has(k))continue;
          const v=g[nx][ny];if(v.s===s||v.w||v.bar){local.add(k);stack.push([nx,ny])}}}
      if(cells.length>=MIN_CLUSTER&&real>0){
        let mult=0;cells.forEach(([x,y])=>{if(spots[x][y]>=2)mult+=spots[x][y]});
        const bp=payFor(s,cells.length,base,vip);out.push({sym:s,size:cells.length,cells,base:bp,mult,pay:bp*(mult||1)});
      }
    }
  }
  return out;
}
// Bijvullen na een winst. Gouden baren liggen vast: ze vallen niet en verdwijnen niet; de rest valt eromheen.
function tumble(g,hit,rng,mode,vip,scK){
  return g.map((col,c)=>{
    const fixed=[];col.forEach((x,r)=>{if(x.bar)fixed.push(r)});
    const free=[];for(let r=0;r<ROWS;r++)if(!fixed.includes(r))free.push(r);
    const keep=[];col.forEach((x,r)=>{if(!x.bar&&!hit.has(c*ROWS+r))keep.push({x,r})});
    const add=free.length-keep.length;const res=new Array(ROWS);
    fixed.forEach(r=>{res[r]=Object.assign({},col[r],{fall:0})});
    for(let i=0;i<add;i++)res[free[i]]=Object.assign(pick(rng,mode,vip,c,scK),{fall:add});
    keep.forEach((k,j)=>{const pos=free[add+j];const y=Object.assign({},k.x);y.fall=pos-k.r;res[pos]=y});
    return res;
  });
}
// Eén spin. spots wordt in-place bijgewerkt (geef in free spins steeds dezelfde mee).
function spin(rng,opts){
  opts=opts||{};const mode=opts.mode||(opts.fs?'fs':'base'),fs=mode!=='base',vip=fs?0:(+opts.vip||0);const spots=opts.spots||newSpots();
  let g=fill(rng,mode,opts.forceSc||0,vip);
  // gewone bonus: Gouden baren uit eerdere spins liggen nog op hun vakje (en tellen als loper)
  if(opts.sticky)opts.sticky.forEach(([c,r])=>{g[c][r]={bar:1,stuck:1,fall:0}});
  const steps=[];let win=0;
  for(let guard=0;guard<80;guard++){
    const wins=clusters(g,spots,!fs,vip);
    const step={grid:cloneG(g),wins,spots:cloneS(spots)};steps.push(step);
    if(!wins.length)break;
    win+=wins.reduce((a,w)=>a+w.pay,0);
    const hit=new Set();wins.forEach(w=>w.cells.forEach(([x,y])=>{if(!g[x][y].bar)hit.add(x*ROWS+y)}));
    hit.forEach(k=>{const x=Math.floor(k/ROWS),y=k%ROWS;spots[x][y]=spots[x][y]===0?1:Math.min(MAX_SPOT,spots[x][y]===1?2:spots[x][y]*2)});
    step.spotsAfter=cloneS(spots);
    let scK=1;if(!fs){let n=0;g.forEach((col,c)=>col.forEach((x,r)=>{if(x.sc&&!hit.has(c*ROWS+r))n++}));scK=(n>=3?(opts.buy?TUMBLE_SC.n:TUMBLE_SC.t[vip])[Math.min(5,n)]:1)*(opts.buy&&n>=3?TUMBLE_SC.buy*(BUY_T[vip]||1)/(SC_T[vip]||1):1)}
    g=tumble(g,hit,rng,mode,vip,scK);
  }
  // barN = nieuwe baren in deze spin (vaste baren van eerdere spins tellen niet opnieuw)
  const last=steps[steps.length-1].grid;let sc=0,bar=false,barN=0;last.forEach(col=>col.forEach(x=>{if(x.sc)sc++;if(x.bar&&!x.stuck){bar=true;barN++}}));
  const extra=fs&&sc>=2?FS_RETRIG[Math.min(5,sc)]:0;
  const trig=!fs&&sc>=3?(sc>=SUPER_SC?'super':'fs'):null;
  return {steps,base:win,win,scatters:sc,scPay:0,trigger:!!trig,kind:trig,retrigger:extra>0,extra,bar,barN,spots:cloneS(spots)};
}
// Bonusronde. kind 'super' = superbonus met meer lopers (één Gouden baar = direct max win).
// Gewone bonus: elke Gouden baar blijft staan; heb je er 3, dan is het de max win.
function freeSpins(rng,start,kind,tier,vip,bought){
  const mode=kind==='super'?'super':'fs';FS_MUL=bought||1;BAR_NOW=mode==='fs'?BAR['t'+Math.max(3,Math.min(5,tier||3))]*(vip==='buy'?1:(BAR_T[+vip||0]||1)):null;
  let left=start||FS_START,total=0,maxHit=false,bars=0;const spins=[];const spots=newSpots();const sticky=[];
  // gekochte bonus: een paar vakjes beginnen al op x2
  if(bought&&BUY_SPOTS){let n=0;for(let g=0;g<200&&n<BUY_SPOTS;g++){const c=Math.floor(rng()*COLS),r=Math.floor(rng()*ROWS);if(!spots[c][r]){spots[c][r]=2;n++}}}
  const preSpots=bought&&BUY_SPOTS?cloneS(spots):null;
  while(left>0&&spins.length<200){left--;const s=spin(rng,{mode,spots,sticky:mode==='fs'?sticky:null});total+=s.win;if(s.extra)left+=s.extra;
    // waar de nieuwe baren liggen (ze blijven de hele bonus op dat vakje liggen)
    if(s.barN){const g=s.steps[s.steps.length-1].grid,pos=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(x.bar&&!x.stuck)pos.push([c,r])}));s.barPos=pos}
    if(mode==='fs'){s.barNew=Math.min(BAR.need-bars,s.barN);if(s.barPos)s.barPos=s.barPos.slice(0,s.barNew);if(s.barPos)s.barPos.forEach(p=>sticky.push(p));bars+=s.barNew;s.bars=bars;if(bars>=BAR.need){total=MAX_WIN;maxHit=true;s.barMax=true}}
    else if(s.bar){total=MAX_WIN;maxHit=true;s.barMax=true}
    if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
    s.left=maxHit?0:left;s.total=total;spins.push(s);if(maxHit)break}
  BAR_NOW=null;FS_MUL=1;
  return {spins,total:Math.min(total,MAX_WIN),kind:mode,maxHit,bars,preSpots};
}
function playRound(rng,opts){
  opts=opts||{};
  // Gekochte bonus: een spin met altijd 3 kluizen. Valt er winst, dan tumbelt hij door en kunnen er kluizen bij vallen (4, 5 of 6 = superbonus).
  // gekochte bonus (100×): extra free spins bovenop het aantal voor je kluizen
  if(opts.buy){const s=spin(rng,{forceSc:3,buy:true,vip:opts.vip});const sup=s.kind==='super',n=sup?SUPER_SPINS+BUY_EXTRA_SUP:FS_BY_SC[Math.min(5,s.scatters)]+BUY_EXTRA;const fsr=freeSpins(rng,n,sup?'super':'fs',s.scatters,opts.vip?'buy':false,BUY_KT[opts.vip|0]||BUY_KT[0]);
    const raw=Math.min(MAX_WIN,s.win+fsr.total),floor=raw<BUY_FLOOR?BUY_FLOOR:0;
    return {base:s,fs:fsr,fsStart:n,kind:s.kind,total:floor||raw,raw,floor,cost:BUY_COST}}
  const s=spin(rng,{vip:opts.vip});let tot=s.win,fsr=null,n=0;
  if(s.kind==='super'){n=SUPER_SPINS;fsr=freeSpins(rng,n,'super');tot+=fsr.total}
  else if(s.kind==='fs'){n=FS_BY_SC[Math.min(5,Math.max(3,s.scatters))];fsr=freeSpins(rng,n,'fs',s.scatters,opts.vip);tot+=fsr.total}
  return {base:s,fs:fsr,fsStart:n,kind:s.kind,total:Math.min(MAX_WIN,tot),cost:1};
}
// Seed: een vaste reeks uitkomsten uit een tekst (seed + spinnummer). Zelfde seed = zelfde uitkomst, andere seed = andere reeks.
// De kans per spin is bij elke seed gelijk; alleen de volgorde van geluk en pech verschilt.
function seedHash(str){let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;
  for(let i=0,k;i<str.length;i++){k=str.charCodeAt(i);h1=h2^Math.imul(h1^k,597399067);h2=h3^Math.imul(h2^k,2869860233);h3=h4^Math.imul(h3^k,951274213);h4=h1^Math.imul(h4^k,2716044179)}
  h1=Math.imul(h3^(h1>>>18),597399067);h2=Math.imul(h4^(h2>>>22),2869860233);h3=Math.imul(h1^(h3>>>17),951274213);h4=Math.imul(h2^(h4>>>19),2716044179);
  h1^=(h2^h3^h4);h2^=h1;h3^=h1;h4^=h1;return [h1>>>0,h2>>>0,h3>>>0,h4>>>0]}
function seedRng(str){let [a,b,c,d]=seedHash(str);const r=()=>{a|=0;b|=0;c|=0;d|=0;const t=(a+b|0)+d|0;d=d+1|0;a=b^b>>>9;b=c+(c<<3)|0;c=c<<21|c>>>11;c=c+t|0;return (t>>>0)/4294967296};
  for(let i=0;i<15;i++)r();return r}
const tune=o=>{if(o.payk!=null)setPay(o.payk);if(o.wild!=null)WILD.w=o.wild;if(o.wildFs!=null)WILD.fsW=o.wildFs;if(o.wildSuper!=null)WILD.superW=o.wildSuper;if(o.sc!=null)SCATTER.w=o.sc;if(o.scFs!=null)SCATTER.fsW=o.scFs;if(o.scSuper!=null)SCATTER.superW=o.scSuper;if(o.barFs!=null)BAR.fsW=o.barFs;if(o.scT)SC_T=o.scT;if(o.buyT)BUY_T=o.buyT;if(o.vipKT)VIP_KT=o.vipKT;if(o.barT)BAR_T=o.barT;if(o.tsT)TUMBLE_SC.t=o.tsT;if(o.bar!=null)BAR.w=o.bar;if(o.baseK!=null)BASE_K=o.baseK;if(o.buyCost!=null)BUY_COST=o.buyCost;if(o.buyExtra!=null)BUY_EXTRA=o.buyExtra;if(o.buyExtraSup!=null)BUY_EXTRA_SUP=o.buyExtraSup;if(o.fsK!=null)FS_K=o.fsK;['t3','t4','t5'].forEach(k=>{if(o[k]!=null)BAR[k]=o[k]});if(o.ts)TUMBLE_SC.n=o.ts;if(o.tsBuy!=null)TUMBLE_SC.buy=o.tsBuy;if(o.tsv)TUMBLE_SC.v=o.tsv;if(o.maxWin!=null)MAX_WIN=o.maxWin;if(o.maxSpot!=null)MAX_SPOT=o.maxSpot;if(o.buyKT)BUY_KT=o.buyKT;if(o.buySpots!=null)BUY_SPOTS=o.buySpots;if(o.buyFloor!=null)BUY_FLOOR=o.buyFloor;if(o.barW!=null)BAR.w=o.barW;if(o.symW)o.symW.forEach((w,i)=>{SYMS[i].w=w});if(o.symB){o.symB.forEach((b,i)=>{SYMS[i].b=b});setPay(PAYK)}};
const API={MAX_SIZE,tune,get TUMBLE_SC(){return TUMBLE_SC},SC_COL,get BASE_K(){return BASE_K},get FS_K(){return FS_K},get VIP_KT(){return VIP_KT},FS_RETRIG,COLS,ROWS,MIN_CLUSTER,MAX_SPOT,SYMS,WILD,SCATTER,BAR,SUPER_SC,SUPER_SPINS,SCATTER_PAY,FS_BY_SC,FS_START,FS_RETRIGGER,get BUY_COST(){return BUY_COST},get BUY_EXTRA(){return BUY_EXTRA},get BUY_EXTRA_SUP(){return BUY_EXTRA_SUP},get MAX_WIN(){return MAX_WIN},get BUY_KT(){return BUY_KT},get BUY_SPOTS(){return BUY_SPOTS},get BUY_FLOOR(){return BUY_FLOOR},CURVE,spin,freeSpins,playRound,clusters,newSpots,seedHash,seedRng};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SLOT=API;
})(typeof window!=='undefined'?window:globalThis);
