// Kluiskraker v2: cluster-slot op een 7x7 raster.
// - Winst: 5+ gelijke symbolen die horizontaal/verticaal aan elkaar grenzen (een cluster).
// - Loper (wild): telt mee voor elk symbool en kan zo twee groepjes verbinden.
// - Vakjes: waar een winnend symbool verdwijnt, wordt het vakje gemarkeerd. Valt er op een
//   gemarkeerd vakje opnieuw een winst, dan wordt het x2, daarna x4, x8 ... tot x128.
//   Alle vakjes in een cluster worden opgeteld en vermenigvuldigen de clusterwinst.
// - Basisspel: vakjes worden na elke spin gewist. Free spins: vakjes blijven de hele bonus staan.
// - 3 kluizen = 10 free spins, 4 = 12, 5 = 14. Tijdens de bonus geven 2+ kluizen extra spins (2:+2, 3:+4, 4:+6, 5+:+8).
// - Kluisdeur kraakt: bij 3 tot 5 kluizen in het basisspel kan elk ander vakje een kluis worden. Komt er een kluis bij,
//   dan kraakt de deur opnieuw, tot er geen nieuwe meer komt of er 6 liggen.
// - 6+ kluizen = SUPERBONUS: 8 spins met meer lopers, 25% meer kans op kluizen en een grotere kans op de Gouden baar.
//   De Gouden baar = direct de max win. Hij kan ook in de gewone bonus landen, maar daar is hij heel zeldzaam.
//   De superbonus is niet te koop. Bonus kopen = 100x inzet en geeft 10 free spins.
// - Clusters in het basisspel betalen BASE_K x de tabel; in de (super)bonus de volle tabel.
// - VIP: in het basisspel iets vaker kluizen en de kluisdeur kraakt vaker (superbonus ±30% makkelijker). In de bonus zelf is alles gelijk.
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
const WILD={id:'sleutel',n:'Loper',w:22,fsW:51.2,superW:65};
const SCATTER={id:'kluis',n:'Kluis',w:5,fsW:6,superW:7.5,vip:1};
// Gouden baar: in de superbonus vaker, in de gewone bonus heel zeldzaam
const BAR={id:'baar',n:'Gouden baar',w:.14,fsW:.0015};
// Kans per vakje op een extra kluis bij elke kraak (normaal / VIP), en de uitbetaling in het basisspel
const RESPIN={p:.0064,vip:.0071,p5:.013,vip5:.0195};let BASE_K=.993;
const FS_BY_SC={3:10,4:12,5:14};
const SUPER_SC=6,SUPER_SPINS=8;
const FS_START=10, FS_RETRIGGER=2, BUY_COST=100;
// Extra spins tijdens de bonus: hoe meer kluizen, hoe meer spins
const FS_RETRIG={2:2,3:4,4:6,5:8};
const SCATTER_PAY={};
const payFor=(s,n,base)=>SYMS[s].pay[Math.min(n,15)-MIN_CLUSTER]*(base?BASE_K:1);

// mode: 'base' (basisspel), 'fs' (bonus), 'super' (superbonus). vip telt alleen in het basisspel.
const SYM_TOT=()=>SYMS.reduce((a,x)=>a+x.w,0);
function pick(rng,mode,vip){
  const ww=mode==='super'?WILD.superW:mode==='fs'?WILD.fsW:WILD.w,sw=mode==='base'?SCATTER.w*(vip?SCATTER.vip:1):mode==='super'?SCATTER.superW:SCATTER.fsW,bw=mode==='super'?BAR.w:mode==='fs'?BAR.fsW:0;
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
  const g=[];for(let c=0;c<COLS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(Object.assign(pick(rng,mode,vip),{fall:ROWS}))}
  if(forceSc){
    g.forEach(col=>col.forEach((x,i)=>{if(x.sc)col[i]={s:Math.floor(rng()*SYMS.length),fall:ROWS}}));
    const cols=[...Array(COLS).keys()].sort(()=>rng()-.5).slice(0,forceSc);
    cols.forEach(c=>{g[c][Math.floor(rng()*ROWS)]={sc:1,fall:ROWS}});
  }
  return g;
}
// Zoekt alle clusters. Een loper kan in clusters van verschillende symbolen meetellen.
function clusters(g,spots,base){
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
        const bp=payFor(s,cells.length,base);out.push({sym:s,size:cells.length,cells,base:bp,mult,pay:bp*(mult||1)});
      }
    }
  }
  return out;
}
function tumble(g,hit,rng,mode,vip){
  return g.map((col,c)=>{
    const keep=[];col.forEach((x,r)=>{if(!hit.has(c*ROWS+r))keep.push({x,r})});
    const add=ROWS-keep.length;const res=[];
    for(let i=0;i<add;i++)res.push(Object.assign(pick(rng,mode,vip),{fall:add}));
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
    const wins=clusters(g,spots,!fs);
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
    for(let k=0;k<12&&sc<SUPER_SC;k++){const P=sc>=5?(vip?RESPIN.vip5:RESPIN.p5):(vip?RESPIN.vip:RESPIN.p);grid=grid.map(col=>col.map(x=>{const y=Object.assign({},x);delete y.fresh;return y}));const cells=[];
      for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(!grid[c][r].sc&&rng()<P){grid[c][r]={sc:1,fall:0,fresh:1};cells.push([c,r])}
      sc+=cells.length;rounds.push({cells,grid,sc});if(!cells.length)break}
    respin={rounds,cells:rounds.flatMap(r=>r.cells),grid}}
  const extra=fs&&sc>=2?FS_RETRIG[Math.min(5,sc)]:0;
  const trig=!fs&&sc>=3?(sc>=SUPER_SC?'super':'fs'):null;
  return {steps,base:win,win,scatters:sc,scPay:0,trigger:!!trig,kind:trig,retrigger:extra>0,extra,bar,respin,spots:cloneS(spots)};
}
// Bonusronde. kind 'super' = superbonus met meer lopers en de Gouden baar (= direct max win).
function freeSpins(rng,start,kind){
  const mode=kind==='super'?'super':'fs';
  let left=start||FS_START,total=0,maxHit=false;const spins=[];const spots=newSpots();
  while(left>0&&spins.length<200){left--;const s=spin(rng,{mode,spots});total+=s.win;if(s.extra)left+=s.extra;
    if(s.bar){total=MAX_WIN;maxHit=true}
    if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}
    s.left=maxHit?0:left;s.total=total;spins.push(s);if(maxHit)break}
  return {spins,total:Math.min(total,MAX_WIN),kind:mode,maxHit};
}
function playRound(rng,opts){
  opts=opts||{};
  if(opts.buy){const s=spin(rng,{forceSc:3,noRespin:true});const n=FS_BY_SC[3];const fsr=freeSpins(rng,n,'fs');
    return {base:s,fs:fsr,fsStart:n,kind:'fs',total:Math.min(MAX_WIN,fsr.total),cost:BUY_COST}}
  const s=spin(rng,{vip:opts.vip});let tot=s.win,fsr=null,n=0;
  if(s.kind==='super'){n=SUPER_SPINS;fsr=freeSpins(rng,n,'super');tot+=fsr.total}
  else if(s.kind==='fs'){n=FS_BY_SC[Math.min(5,Math.max(3,s.scatters))];fsr=freeSpins(rng,n,'fs');tot+=fsr.total}
  return {base:s,fs:fsr,fsStart:n,kind:s.kind,total:Math.min(MAX_WIN,tot),cost:1};
}
const tune=o=>{if(o.payk!=null)setPay(o.payk);if(o.wild!=null)WILD.w=o.wild;if(o.wildFs!=null)WILD.fsW=o.wildFs;if(o.wildSuper!=null)WILD.superW=o.wildSuper;if(o.sc!=null)SCATTER.w=o.sc;if(o.scFs!=null)SCATTER.fsW=o.scFs;if(o.scSuper!=null)SCATTER.superW=o.scSuper;if(o.barFs!=null)BAR.fsW=o.barFs;if(o.vip!=null)SCATTER.vip=o.vip;if(o.bar!=null)BAR.w=o.bar;if(o.baseK!=null)BASE_K=o.baseK;if(o.rp!=null)RESPIN.p=o.rp;if(o.rpVip!=null)RESPIN.vip=o.rpVip;if(o.rp5!=null)RESPIN.p5=o.rp5;if(o.rpVip5!=null)RESPIN.vip5=o.rpVip5};
const API={tune,RESPIN,get BASE_K(){return BASE_K},FS_RETRIG,COLS,ROWS,MIN_CLUSTER,MAX_SPOT,SYMS,WILD,SCATTER,BAR,SUPER_SC,SUPER_SPINS,SCATTER_PAY,FS_BY_SC,FS_START,FS_RETRIGGER,BUY_COST,MAX_WIN,CURVE,spin,freeSpins,playRound,clusters,newSpots};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.SLOT=API;
})(typeof window!=='undefined'?window:globalThis);
