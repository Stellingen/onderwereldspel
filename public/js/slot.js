// Kluiskraker v2: cluster-slot op een 7x7 raster.
// - Winst: 5+ gelijke symbolen die horizontaal/verticaal aan elkaar grenzen (een cluster).
// - Loper (wild): telt mee voor elk symbool en kan zo twee groepjes verbinden.
// - Vakjes: waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt er op een
//   gemarkeerd vakje opnieuw een winst, dan wordt het x2, daarna x4, x8 ... tot x128.
//   Alle vakjes in een cluster worden opgeteld en vermenigvuldigen de clusterwinst.
// - Basisspel: vakjes worden na elke spin gewist. Free spins: vakjes blijven de hele bonus staan.
// - 3 kluizen = 10 free spins, 4 = 12, 5 = 14. Tijdens de bonus geven 2+ kluizen extra spins (2:+2, 3:+4, 4:+6, 5+:+8).
// - Kluisdeur kraakt: bij 3 tot 5 kluizen kan elk ander vakje een kluis worden. Komt er een kluis bij,
//   dan kraakt de deur opnieuw, tot er geen nieuwe meer komt of er 6 liggen.
// - 6+ kluizen = SUPERBONUS: 8 spins met meer lopers, 25% meer kans op kluizen en de meeste kans op de Gouden baar.
//   De Gouden baar = direct de max win. Hoe meer kluizen je bij de start hebt, hoe groter die kans (3 < 4 < 5 < super).
// - Bonus kopen = 60x inzet: altijd 3 kluizen, daarna kan de deur doorkraken tot 4, 5 of de superbonus.
// - Uitbetaling: basisspel BASE_K x de tabel, (super)bonus FS_K x de tabel (de vakjes blijven daar staan).
// - VIP: veel vaker kluizen (bonus ±1 op 280 i.p.v. 400) en de deur kraakt vaker (superbonus ±1 op 4.000 i.p.v. 7.600).
//   Om onder 100% RTP te blijven betalen clusters in het VIP-basisspel VIP_K (±4% minder). In de bonus zelf is alles gelijk.
// - Doorgerekend met sim6.js: normaal RTP ±92%, VIP ±98% (+0,5% cashback), bonus kopen ±96%.
// - Max win: 5000x de inzet, bij elke inzet.
// Pure functies, zodat de RTP in Node te simuleren is (zie README).
(function(root){
const COLS=7, ROWS=7, MIN_CLUSTER=5, MAX_SPOT=1024, MAX_WIN=5000;
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
const SCATTER={id:'kluis',n:'Kluis',w:5.36,fsW:6,superW:7.5,vip:1.135};
// Gouden baar: in de superbonus vaker, in de gewone bonus heel zeldzaam
// t3/t4/t5 = in de gewone bonus, afhankelijk van met hoeveel kluizen je erin kwam (meer kluizen = meer kans op de max win)
const BAR={id:'baar',n:'Gouden baar',w:.10,fsW:.0019,t3:.0019,t4:.0055,t5:.0125};let BAR_NOW=null;
// Kans per vakje op een extra kluis bij elke kraak (normaal / VIP), en de uitbetaling in het basisspel
// Kluisdeur kraakt. p/vip = per vakje vanaf 3-4 kluizen, p5/vip5 vanaf 5 kluizen. b... = hetzelfde voor een gekochte bonus.
const RESPIN={p:.0063,vip:.0069,p5:.014,vip5:.016,bp:.0044,bvip:.0046,bp5:.013,bvip5:.014};let BASE_K=1.0874,FS_K=.4,VIP_K=.957;
const FS_BY_SC={3:10,4:12,5:14};
const SUPER_SC=6,SUPER_SPINS=8;
const FS_START=10, FS_RETRIGGER=2;let BUY_COST=60;
// Extra spins tijdens de bonus: hoe meer kluizen, hoe meer spins
const FS_RETRIG={2:2,3:4,4:6,5:8};
const SCATTER_PAY={};
// basisspel: BASE_K (VIP: × VIP_K) · bonus en superbonus: FS_K
const payFor=(s,n,base,vip)=>SYMS[s].pay[Math.min(n,15)-MIN_CLUSTER]*(base?BASE_K*(vip?VIP_K:1):FS_K);

// mode: 'base' (basisspel), 'fs' (bonus), 'super' (superbonus). vip telt alleen in het basisspel.
const SYM_TOT=()=>SYMS.reduce((a,x)=>a+x.w,0);
// Kluizen vallen in het basisspel vaker links dan rechts (gemiddeld gelijk): zo is er spanning of rechts de laatste nog valt
const SC_COL=[1.45,1.3,1.15,1,.85,.7,.55];
function pick(rng,mode,vip,col){
  const ww=mode==='super'?WILD.superW:mode==='fs'?WILD.fsW:WILD.w,sw=mode==='base'?SCATTER.w*(vip?SCATTER.vip:1)*(col!=null?SC_COL[col]:1):mode==='super'?SCATTER.superW:SCATTER.fsW,bw=mode==='super'?BAR.w:mode==='fs'?(BAR_NOW!=null?BAR_NOW:BAR.fsW):0;
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
  const g=[];for(let c=0;c<COLS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(Object.assign(pick(rng,mode,vip,c),{fall:ROWS}))}
  if(forceSc){
    g.forEach(col=>col.forEach((x,i)=>{if(x.sc)col[i]={s:Math.floor(rng()*SYMS.length),fall:ROWS}}));
    const cols=[...Array(COLS).keys()].sort(()=>rng()-.5).slice(0,forceSc);
    cols.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1,fall:ROWS}});
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
function tumble(g,hit,rng,mode,vip){
  return g.map((col,c)=>{
    const keep=[];col.forEach((x,r)=>{if(!hit.has(c*ROWS+r))keep.push({x,r})});
    const add=ROWS-keep.length;const res=[];
    for(let i=0;i<add;i++)res.push(Object.assign(pick(rng,mode,vip,c),{fall:add}));
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
    const wins=opts.buy?[]:clusters(g,spots,!fs,vip);
    const step={grid:cloneG(g),wins,spots:cloneS(spots)};steps.push(step);
    if(!wins.length)break;
    win+=wins.reduce((a,w)=>a+w.pay,0);
    const hit=new Set();wins.forEach(w=>w.cells.forEach(([x,y])=>hit.add(x*ROWS+y)));
    hit.forEach(k=>{const x=Math.floor(k/ROWS),y=k%ROWS;spots[x][y]=spots[x][y]===0?1:Math.min(MAX_SPOT,spots[x][y]===1?2:spots[x][y]*2)});
    step.spotsAfter=cloneS(spots);
    g=tumble(g,hit,rng,mode,vip);
  }
  const last=steps[steps.length-1].grid;let sc=0,bar=false;last.forEach(col=>col.forEach(x=>{if(x.sc)sc++;if(x.bar)bar=true}));
  // Kluisdeur kraakt: bij 3 tot 5 kluizen kan elk ander vakje een kluis worden; komt er een bij, dan kraakt hij opnieuw
  let respin=null;
  if(!fs&&!opts.noRespin&&sc>=3&&sc<SUPER_SC){const rounds=[];let grid=cloneG(last);
    for(let k=0;k<12&&sc<SUPER_SC;k++){const P=opts.buy?(sc>=5?(vip?RESPIN.bvip5:RESPIN.bp5):(vip?RESPIN.bvip:RESPIN.bp)):sc>=5?(vip?RESPIN.vip5:RESPIN.p5):(vip?RESPIN.vip:RESPIN.p);grid=grid.map(col=>col.map(x=>{const y=Object.assign({},x);delete y.fresh;return y}));const cells=[];
      for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(!grid[c][r].sc&&rng()<P){grid[c][r]={sc:1,fall:0,fresh:1};cells.push([c,r])}
      sc+=cells.length;rounds.push({cells,grid,sc});if(!cells.length)break}
    respin={rounds,cells:rounds.flatMap(r=>r.cells),grid}}
  const extra=fs&&sc>=2?FS_RETRIG[Math.min(5,sc)]:0;
  const trig=!fs&&sc>=3?(sc>=SUPER_SC?'super':'fs'):null;
  return {steps,base:win,win,scatters:sc,scPay:0,trigger:!!trig,kind:trig,retrigger:extra>0,extra,bar,respin,spots:cloneS(spots)};
}
// Bonusronde. kind 'super' = superbonus met meer lopers en de Gouden baar (= direct max win).
function freeSpins(rng,start,kind,tier){
  const mode=kind==='super'?'super':'fs';BAR_NOW=mode==='fs'?BAR['t'+Math.max(3,Math.min(5,tier||3))]:null;
  let left=start||FS_START,total=0,maxHit=false;const spins=[];const spots=newSpots();
  while(left>0&&spins.length<200){left--;const s=spin(rng,{mode,spots});total+=s.win;if(s.extra)left+=s.extra;
    if(s.bar){total=MAX_WIN;maxHit=true}
    if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
    s.left=maxHit?0:left;s.total=total;spins.push(s);if(maxHit)break}
  BAR_NOW=null;
  return {spins,total:Math.min(total,MAX_WIN),kind:mode,maxHit};
}
function playRound(rng,opts){
  opts=opts||{};
  // Gekochte bonus: altijd 3 kluizen, daarna kan de kluisdeur kraken naar 4, 5 of 6 (superbonus). VIP kraakt iets vaker.
  if(opts.buy){const s=spin(rng,{forceSc:3,buy:true,vip:opts.vip});const sup=s.kind==='super',n=sup?SUPER_SPINS:FS_BY_SC[Math.min(5,s.scatters)];const fsr=freeSpins(rng,n,sup?'super':'fs',s.scatters);
    return {base:s,fs:fsr,fsStart:n,kind:s.kind,total:Math.min(MAX_WIN,fsr.total),cost:BUY_COST}}
  const s=spin(rng,{vip:opts.vip});let tot=s.win,fsr=null,n=0;
  if(s.kind==='super'){n=SUPER_SPINS;fsr=freeSpins(rng,n,'super');tot+=fsr.total}
  else if(s.kind==='fs'){n=FS_BY_SC[Math.min(5,Math.max(3,s.scatters))];fsr=freeSpins(rng,n,'fs',s.scatters);tot+=fsr.total}
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
const tune=o=>{if(o.payk!=null)setPay(o.payk);if(o.wild!=null)WILD.w=o.wild;if(o.wildFs!=null)WILD.fsW=o.wildFs;if(o.wildSuper!=null)WILD.superW=o.wildSuper;if(o.sc!=null)SCATTER.w=o.sc;if(o.scFs!=null)SCATTER.fsW=o.scFs;if(o.scSuper!=null)SCATTER.superW=o.scSuper;if(o.barFs!=null)BAR.fsW=o.barFs;if(o.vip!=null)SCATTER.vip=o.vip;if(o.bar!=null)BAR.w=o.bar;if(o.baseK!=null)BASE_K=o.baseK;if(o.rp!=null)RESPIN.p=o.rp;if(o.rpVip!=null)RESPIN.vip=o.rpVip;if(o.rp5!=null)RESPIN.p5=o.rp5;if(o.rpVip5!=null)RESPIN.vip5=o.rpVip5;['bp','bvip','bp5','bvip5'].forEach(k=>{if(o[k]!=null)RESPIN[k]=o[k]});if(o.buyCost!=null)BUY_COST=o.buyCost;if(o.fsK!=null)FS_K=o.fsK;if(o.vipK!=null)VIP_K=o.vipK;['t3','t4','t5'].forEach(k=>{if(o[k]!=null)BAR[k]=o[k]})};
const API={tune,RESPIN,SC_COL,get BASE_K(){return BASE_K},get FS_K(){return FS_K},get VIP_K(){return VIP_K},FS_RETRIG,COLS,ROWS,MIN_CLUSTER,MAX_SPOT,SYMS,WILD,SCATTER,BAR,SUPER_SC,SUPER_SPINS,SCATTER_PAY,FS_BY_SC,FS_START,FS_RETRIGGER,get BUY_COST(){return BUY_COST},MAX_WIN,CURVE,spin,freeSpins,playRound,clusters,newSpots,seedHash,seedRng};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SLOT=API;
})(typeof window!=='undefined'?window:globalThis);
