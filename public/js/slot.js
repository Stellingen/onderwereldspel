// Kluiskraker v2: cluster-slot op een 7x7 raster.
// - Winst: 5+ gelijke symbolen die horizontaal/verticaal aan elkaar grenzen (een cluster).
// - Loper (wild): telt mee voor elk symbool en kan zo twee groepjes verbinden.
// - Vakjes: waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt er op een
//   gemarkeerd vakje opnieuw een winst, dan wordt het x2, daarna x4, x8 ... tot x128.
//   Alle vakjes in een cluster worden opgeteld en vermenigvuldigen de clusterwinst.
// - Basisspel: vakjes worden na elke spin gewist. Free spins: vakjes blijven de hele bonus staan.
// - 3 kluizen = 10 free spins, 4 = 12, 5 = 14. Tijdens de bonus geven 2+ kluizen extra spins (2:+2, 3:+4, 4:+6, 5+:+8).
// - Doortumbelen: zolang er winst valt, vallen er nieuwe symbolen in en kan er een kluis bij komen. Liggen er al 3 of meer,
//   dan valt een extra kluis makkelijker in (TUMBLE_SC, per aantal kluizen; VIP hoger). Geen winst = geen tumble = geen extra kluis.
// - Vakjes verdubbelen tot x4096. De max win is 5000x de inzet voor de hele ronde (spin + bonus samen), nooit meer.
// - Gewone bonus: Gouden baren blijven de hele bonus staan; bij 3 baren = max win. Meer kluizen = meer spins en meer kans.
// - 6+ kluizen = SUPERBONUS: 8 spins met meer lopers, één Gouden baar is daar direct de max win.
// - Bonus kopen = 100x inzet: altijd 3 kluizen bovenop wat er vanzelf valt (valt er al 1, dan heb je er 4). Valt er winst, dan
//   tumbelt hij door; bij een gekochte bonus valt een extra kluis 30% makkelijker in (TUMBLE_SC.buy). +1 free spin (BUY_EXTRA).
//   Doorgerekend (simbuy3.js, 120.000 bonussen): 3 kluizen ±57%, 4 ±29%, 5 ±10%, superbonus ±4%; RTP ±94% (VIP ±97%).
// - Uitbetaling: basisspel BASE_K x de tabel, (super)bonus FS_K x de tabel (de vakjes blijven daar staan).
// - VIP: bonus ±1 op 135 i.p.v. ±1 op 200, 4+ kluizen ±1 op 570 i.p.v. 930, superbonus ±1 op 7.000 i.p.v. ±1 op 14.500,
//   bij een gekochte bonus vaker een extra kluis (4+ ±21% i.p.v. ±19%, 6 ±1,8% i.p.v. ±1,3%) en iets meer kans op Gouden baren.
//   Om onder 100% RTP te blijven betalen clusters in het VIP-basisspel VIP_K (18% minder).
// - Doorgerekend met sim8.js (1 mln. spins, 200.000 gekochte bonussen): normaal RTP ±92,5%, VIP ±96% (+0,5% cashback),
//   (bonus kopen: zie hierboven). 3 Gouden baren: ±1 op 650 bonussen van 10 spins, ±1 op 345 bij 12, ±1 op 180 bij 14; superbonus ±1 op 20.
// - Max win: 5000× de inzet voor de hele ronde (ook bij een gekochte bonus telt de inzet, niet de prijs van de bonus).
// Pure functies, zodat de RTP in Node te simuleren is (zie README).
(function(root){
const COLS=7, ROWS=7, MIN_CLUSTER=5, MAX_SPOT=4096, MAX_WIN=5000;
// Uitbetaling (x inzet) per clustergrootte 5,6,7,8,9,10,11,12,13,14,15+
const CURVE=[1,1.4,1.9,2.6,3.5,5,6.5,9,12,16,25];
const SYMS=[
 {id:'munt',   n:'Munt',       w:205, b:0.10},
 {id:'dobbel', n:'Dobbelsteen',w:190, b:0.13},
 {id:'fiche',  n:'Fiche',      w:172, b:0.17},
 {id:'horloge',n:'Horloge',    w:150, b:0.24},
 {id:'ring',   n:'Ring',       w:128, b:0.34},
 {id:'diamant',n:'Diamant',    w:104, b:0.55},
 {id:'goud',   n:'Goudstaaf',  w:82,  b:1.00}];
let PAYK=1;
const setPay=k=>{PAYK=k;SYMS.forEach(s=>{s.pay=CURVE.map(c=>+(s.b*c*PAYK).toFixed(2))})};setPay(3.5);
const WILD={id:'sleutel',n:'Loper',w:22,fsW:50.8,superW:82};
const SCATTER={id:'kluis',n:'Kluis',w:6.85,fsW:6,superW:7.5,vip:1.13,vipBuy:1.03};
// Gouden baar: in de superbonus vaker, in de gewone bonus heel zeldzaam
// t3/t4/t5 = in de gewone bonus, afhankelijk van met hoeveel kluizen je erin kwam (meer kluizen = meer kans op de max win)
// Gewone bonus: gouden baren blijven de hele bonus staan; bij 3 baren = max win. t3/t4/t5 = kans per vakje (met 3, 4 of 5 kluizen
// begonnen), vipK = VIP iets meer kans. Superbonus: één baar is direct de max win (w).
const BAR={id:'baar',n:'Gouden baar',w:.10,fsW:.40,t3:.40,t4:.42,t5:.44,vipK:1.05,vipBuyK:1,need:3};let BAR_NOW=null;
// Kans per vakje op een extra kluis bij elke kraak (normaal / VIP), en de uitbetaling in het basisspel
// Kluisdeur kraakt. p/vip = per vakje vanaf 3-4 kluizen, p5/vip5 vanaf 5 kluizen. b... = hetzelfde voor een gekochte bonus.
// Bonus kopen kraakt met dezelfde kansen als spinnen (VIP iets hoger).
const RESPIN={p:.0057,vip:.0064,p5:.0125,vip5:.013,bp:.0057,bvip:.0058,bp5:.0125,bvip5:.0127};let BASE_K=.958,FS_K=.385,VIP_K=.82;
// Doortumbelen: vermenigvuldiger op de kluiskans bij het bijvullen, per aantal kluizen dat al ligt (0..5). n = normaal, v = VIP.
// Bij 0-2 kluizen is VIP iets hoger (makkelijker de bonus in), vanaf 3 valt een volgende kluis makkelijker in, elke volgende lastiger.
let TUMBLE_SC={n:[1,1,1,14,13,12],v:[1.15,1.15,1.25,14.5,13.5,12.5],buy:1.3}; // buy = extra bij een gekochte bonus (vanaf 3 kluizen)
const FS_BY_SC={3:10,4:12,5:14};
const SUPER_SC=6,SUPER_SPINS=8;
const FS_START=10, FS_RETRIGGER=2;let BUY_COST=100,BUY_EXTRA=1,BUY_EXTRA_SUP=1;
// Extra spins tijdens de bonus: hoe meer kluizen, hoe meer spins
const FS_RETRIG={2:2,3:4,4:6,5:8};
const SCATTER_PAY={};
// basisspel: BASE_K (VIP: × VIP_K) · bonus en superbonus: FS_K
const payFor=(s,n,base,vip)=>SYMS[s].pay[Math.min(n,15)-MIN_CLUSTER]*(base?BASE_K*(vip?VIP_K:1):FS_K);

// mode: 'base' (basisspel), 'fs' (bonus), 'super' (superbonus). vip telt alleen in het basisspel.
const SYM_TOT=()=>SYMS.reduce((a,x)=>a+x.w,0);
// Kluizen vallen in het basisspel vaker links dan rechts (gemiddeld gelijk): zo is er spanning of rechts de laatste nog valt
const SC_COL=[1.45,1.3,1.15,1,.85,.7,.55];
function pick(rng,mode,vip,col,scK){
  const ww=mode==='super'?WILD.superW:mode==='fs'?WILD.fsW:WILD.w,sw=mode==='base'?SCATTER.w*(vip?SCATTER.vip:1)*(col!=null?SC_COL[col]:1)*(scK||1):mode==='super'?SCATTER.superW:SCATTER.fsW,bw=mode==='super'?BAR.w:mode==='fs'?(BAR_NOW!=null?BAR_NOW:BAR.fsW):0;
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
  // bij een gekochte bonus valt VIP net iets vaker een kluis vanzelf (vipBuy), anders zou VIP boven 100% uitkomen
  const k0=forceSc&&vip?SCATTER.vipBuy/SCATTER.vip:1;
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
          const v=g[nx][ny];if(v.s===s||v.w){local.add(k);stack.push([nx,ny])}}}
      if(cells.length>=MIN_CLUSTER&&real>0){
        let mult=0;cells.forEach(([x,y])=>{if(spots[x][y]>=2)mult+=spots[x][y]});
        const bp=payFor(s,cells.length,base,vip);out.push({sym:s,size:cells.length,cells,base:bp,mult,pay:bp*(mult||1)});
      }
    }
  }
  return out;
}
function tumble(g,hit,rng,mode,vip,scK){
  return g.map((col,c)=>{
    const keep=[];col.forEach((x,r)=>{if(!hit.has(c*ROWS+r))keep.push({x,r})});
    const add=ROWS-keep.length;const res=[];
    for(let i=0;i<add;i++)res.push(Object.assign(pick(rng,mode,vip,c,scK),{fall:add}));
    keep.forEach((k,j)=>{const y=Object.assign({},k.x);y.fall=(add+j)-k.r;res.push(y)});
    return res;
  });
}
// Eén spin. spots wordt in-place bijgewerkt (geef in free spins steeds dezelfde mee).
function spin(rng,opts){
  opts=opts||{};const mode=opts.mode||(opts.fs?'fs':'base'),fs=mode!=='base',vip=!!opts.vip&&!fs;const spots=opts.spots||newSpots();
  let g=fill(rng,mode,opts.forceSc||0,vip);
  const steps=[];let win=0;
  for(let guard=0;guard<80;guard++){
    const wins=clusters(g,spots,!fs,vip);
    const step={grid:cloneG(g),wins,spots:cloneS(spots)};steps.push(step);
    if(!wins.length)break;
    win+=wins.reduce((a,w)=>a+w.pay,0);
    const hit=new Set();wins.forEach(w=>w.cells.forEach(([x,y])=>hit.add(x*ROWS+y)));
    hit.forEach(k=>{const x=Math.floor(k/ROWS),y=k%ROWS;spots[x][y]=spots[x][y]===0?1:Math.min(MAX_SPOT,spots[x][y]===1?2:spots[x][y]*2)});
    step.spotsAfter=cloneS(spots);
    let scK=1;if(!fs){let n=0;g.forEach((col,c)=>col.forEach((x,r)=>{if(x.sc&&!hit.has(c*ROWS+r))n++}));scK=(vip&&!opts.buy?TUMBLE_SC.v:TUMBLE_SC.n)[Math.min(5,n)]*(opts.buy&&n>=3?TUMBLE_SC.buy:1)}
    g=tumble(g,hit,rng,mode,vip,scK);
  }
  const last=steps[steps.length-1].grid;let sc=0,bar=false,barN=0;last.forEach(col=>col.forEach(x=>{if(x.sc)sc++;if(x.bar){bar=true;barN++}}));
  // extra kluizen komen alleen nog door het doortumbelen (zie TUMBLE_SC); de oude 'kluisdeur kraakt' bestaat niet meer
  const respin=null;
  const extra=fs&&sc>=2?FS_RETRIG[Math.min(5,sc)]:0;
  const trig=!fs&&sc>=3?(sc>=SUPER_SC?'super':'fs'):null;
  return {steps,base:win,win,scatters:sc,scPay:0,trigger:!!trig,kind:trig,retrigger:extra>0,extra,bar,barN,respin,spots:cloneS(spots)};
}
// Bonusronde. kind 'super' = superbonus met meer lopers (één Gouden baar = direct max win).
// Gewone bonus: elke Gouden baar blijft staan; heb je er 3, dan is het de max win.
function freeSpins(rng,start,kind,tier,vip){
  const mode=kind==='super'?'super':'fs';BAR_NOW=mode==='fs'?BAR['t'+Math.max(3,Math.min(5,tier||3))]*(vip==='buy'?BAR.vipBuyK:vip?BAR.vipK:1):null;
  let left=start||FS_START,total=0,maxHit=false,bars=0;const spins=[];const spots=newSpots();
  while(left>0&&spins.length<200){left--;const s=spin(rng,{mode,spots});total+=s.win;if(s.extra)left+=s.extra;
    // waar de nieuwe baren liggen (ze blijven de hele bonus op dat vakje staan)
    if(s.barN){const g=s.steps[s.steps.length-1].grid,pos=[];g.forEach((col,c)=>col.forEach((x,r)=>{if(x.bar)pos.push([c,r])}));s.barPos=pos}
    if(mode==='fs'){s.barNew=Math.min(BAR.need-bars,s.barN);if(s.barPos)s.barPos=s.barPos.slice(0,s.barNew);bars+=s.barNew;s.bars=bars;if(bars>=BAR.need){total=MAX_WIN;maxHit=true;s.barMax=true}}
    else if(s.bar){total=MAX_WIN;maxHit=true;s.barMax=true}
    if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
    s.left=maxHit?0:left;s.total=total;spins.push(s);if(maxHit)break}
  BAR_NOW=null;
  return {spins,total:Math.min(total,MAX_WIN),kind:mode,maxHit,bars};
}
function playRound(rng,opts){
  opts=opts||{};
  // Gekochte bonus: een spin met altijd 3 kluizen. Valt er winst, dan tumbelt hij door en kunnen er kluizen bij vallen (4, 5 of 6 = superbonus).
  // gekochte bonus (100×): extra free spins bovenop het aantal voor je kluizen
  if(opts.buy){const s=spin(rng,{forceSc:3,buy:true,vip:opts.vip});const sup=s.kind==='super',n=sup?SUPER_SPINS+BUY_EXTRA_SUP:FS_BY_SC[Math.min(5,s.scatters)]+BUY_EXTRA;const fsr=freeSpins(rng,n,sup?'super':'fs',s.scatters,opts.vip?'buy':false);
    return {base:s,fs:fsr,fsStart:n,kind:s.kind,total:Math.min(MAX_WIN,s.win+fsr.total),cost:BUY_COST}}
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
const tune=o=>{if(o.payk!=null)setPay(o.payk);if(o.wild!=null)WILD.w=o.wild;if(o.wildFs!=null)WILD.fsW=o.wildFs;if(o.wildSuper!=null)WILD.superW=o.wildSuper;if(o.sc!=null)SCATTER.w=o.sc;if(o.scFs!=null)SCATTER.fsW=o.scFs;if(o.scSuper!=null)SCATTER.superW=o.scSuper;if(o.barFs!=null)BAR.fsW=o.barFs;if(o.vip!=null)SCATTER.vip=o.vip;if(o.vipBuy!=null)SCATTER.vipBuy=o.vipBuy;if(o.bar!=null)BAR.w=o.bar;if(o.baseK!=null)BASE_K=o.baseK;if(o.rp!=null)RESPIN.p=o.rp;if(o.rpVip!=null)RESPIN.vip=o.rpVip;if(o.rp5!=null)RESPIN.p5=o.rp5;if(o.rpVip5!=null)RESPIN.vip5=o.rpVip5;['bp','bvip','bp5','bvip5'].forEach(k=>{if(o[k]!=null)RESPIN[k]=o[k]});if(o.buyCost!=null)BUY_COST=o.buyCost;if(o.buyExtra!=null)BUY_EXTRA=o.buyExtra;if(o.buyExtraSup!=null)BUY_EXTRA_SUP=o.buyExtraSup;if(o.fsK!=null)FS_K=o.fsK;if(o.vipK!=null)VIP_K=o.vipK;['t3','t4','t5'].forEach(k=>{if(o[k]!=null)BAR[k]=o[k]});if(o.barVip!=null)BAR.vipK=o.barVip;if(o.barVipBuy!=null)BAR.vipBuyK=o.barVipBuy;if(o.ts)TUMBLE_SC.n=o.ts;if(o.tsBuy!=null)TUMBLE_SC.buy=o.tsBuy;if(o.tsv)TUMBLE_SC.v=o.tsv};
const API={tune,RESPIN,get TUMBLE_SC(){return TUMBLE_SC},SC_COL,get BASE_K(){return BASE_K},get FS_K(){return FS_K},get VIP_K(){return VIP_K},FS_RETRIG,COLS,ROWS,MIN_CLUSTER,MAX_SPOT,SYMS,WILD,SCATTER,BAR,SUPER_SC,SUPER_SPINS,SCATTER_PAY,FS_BY_SC,FS_START,FS_RETRIGGER,get BUY_COST(){return BUY_COST},get BUY_EXTRA(){return BUY_EXTRA},get BUY_EXTRA_SUP(){return BUY_EXTRA_SUP},MAX_WIN,CURVE,spin,freeSpins,playRound,clusters,newSpots,seedHash,seedRng};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SLOT=API;
})(typeof window!=='undefined'?window:globalThis);
