// Suikerbaron: snoepslot op een raster van 6 × 5, uitbetaling overal (geen lijnen). Pure functies, zodat de RTP in Node
// te simuleren is (zie README).
// - Winst: 8 of meer van hetzelfde snoepje, waar ze ook liggen. Uitbetaling per aantal: 8–9, 10–11, 12–14 en 15+.
// - Tumbles: winnende snoepjes knallen weg, de rest valt naar beneden en er vallen nieuwe in. Zolang er winst valt, gaat het door.
// - Lolly = scatter. 4 of meer lolly's (geteld na het doortumbelen) = 10 free spins, en de lolly's betalen zelf ook:
//   4 = 3×, 5 = 5×, 6 of meer = 100× je inzet. In de bonus geven 3 of meer lolly's 5 extra spins.
// - Kauwgombal (alleen in de bonus): draagt een vermenigvuldiger van ×2 tot ×1.000 (×250 en hoger heel zeldzaam). Hij blijft liggen tijdens het tumbelen.
//   Valt er in die spin winst, dan worden alle ballen op het scherm bij elkaar opgeteld en keer de winst van de hele spin gedaan.
// - Max win 5.000× je inzet per ronde (ook bij een gekochte bonus telt je inzet, niet de prijs van de bonus).
// - Bonus kopen: 100× je inzet, altijd 4 lolly's (er kan er vanzelf nog een bij vallen).
// - Lidmaatschap (0 gewoon, 1 VIP, 2 High roller): vaker lolly's in het basisspel (SC_T); om onder 100% te blijven betaalt het
//   basisspel iets minder (VIP_KT). Een gekochte bonus heeft een eigen factor per lidmaatschap (BUY_KT).
(function(root){
const COLS=6,ROWS=5,MIN=8;let MAX_WIN=5000;
// aantal → kolom in de tabel: 8–9, 10–11, 12–14, 15+
const BANDS=[8,10,12,15];
const band=n=>n>=15?3:n>=12?2:n>=10?1:0;
// w = gewicht per vakje, p = uitbetaling (× inzet) voor 8–9 / 10–11 / 12–14 / 15+
const SYMS=[
 {id:'drop',    n:'Drop',       w:23,  p:[.25,.6,1.5,4]},
 {id:'zuurtje', n:'Zuurtje',    w:21,  p:[.4,.8,2,5]},
 {id:'spek',    n:'Spekje',     w:19,  p:[.5,1,3,8]},
 {id:'gombeer', n:'Gombeer',    w:16,  p:[.8,1.5,4,10]},
 {id:'zuurstok',n:'Zuurstok',   w:13.5,p:[1,2,6,15]},
 {id:'bonbon',  n:'Bonbon',     w:11,  p:[1.5,3,8,20]},
 {id:'donut',   n:'Donut',      w:8.5, p:[2,5,12,30]},
 {id:'wafel',   n:'Stroopwafel',w:6.5, p:[3,8,20,50]},
 {id:'pot',     n:'Snoeppot',   w:4.5, p:[8,20,50,120]}];
let PAYK=1.8;
// Lolly (scatter): gewicht per vakje in het basisspel (× SC_T per lidmaatschap) en in de bonus
const SC={id:'lolly',n:'Lolly',w:2.1,fsW:2.4};
let SC_T=[1,1.035,1.085];
let SC_PAY={4:3,5:5,6:100};
// Kauwgombal: alleen in de bonus. [waarde, gewicht]
const BOMB={w:10,vals:[[2,300],[3,230],[4,170],[5,130],[6,90],[8,70],[10,55],[12,35],[15,25],[20,16],[25,10],[50,4],[100,1.6],[250,.6],[500,.25],[1000,.15]]};
const FS_START=10,FS_RETRIG=5,RETRIG_SC=3,TRIG=4;
let BUY_COST=100,VIP_KT=[.993,.9565,.879],FS_K=1.456,BUY_KT=[.9717,.9822,.9921];
const symTot=()=>SYMS.reduce((a,s)=>a+s.w,0);
const bombTot=()=>BOMB.vals.reduce((a,v)=>a+v[1],0);
function bombVal(rng){let r=rng()*bombTot();for(const [v,w] of BOMB.vals){r-=w;if(r<=0)return v}return 2}
// één vakje trekken: {s} snoepje, {sc} lolly, {m} kauwgombal (alleen in de bonus)
function pick(rng,fs,t){const sw=fs?SC.fsW:SC.w*(SC_T[t|0]||1),bw=fs?BOMB.w:0;let r=rng()*(symTot()+sw+bw);
 for(let i=0;i<SYMS.length;i++){r-=SYMS[i].w;if(r<=0)return {s:i}}
 r-=sw;if(r<=0)return {sc:1};
 return {m:bombVal(rng)}}
function fill(rng,fs,t,forceSc){const g=[];for(let c=0;c<COLS;c++){g.push([]);for(let r=0;r<ROWS;r++)g[c].push(Object.assign(pick(rng,fs,t),{fall:ROWS}))}
 // gekochte bonus: altijd minstens forceSc lolly's, op vakjes waar er nog geen ligt
 if(forceSc){let have=0;g.forEach(col=>col.forEach(x=>{if(x.sc)have++}));
  const free=[];for(let c=0;c<COLS;c++)for(let r=0;r<ROWS;r++)if(!g[c][r].sc)free.push([c,r]);
  for(let i=free.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[free[i],free[j]]=[free[j],free[i]]}
  free.slice(0,Math.max(0,forceSc-have)).forEach(([c,r])=>{g[c][r]={sc:1,fall:ROWS}})}
 return g}
// winst: per snoepje tellen, 8+ betaalt (k = uitbetalingsfactor)
function wins(g,k){const cells=SYMS.map(()=>[]);g.forEach((col,c)=>col.forEach((x,r)=>{if(x.s!=null)cells[x.s].push([c,r])}));
 const out=[];cells.forEach((cl,s)=>{if(cl.length>=MIN)out.push({sym:s,n:cl.length,cells:cl,pay:SYMS[s].p[band(cl.length)]*PAYK*k})});return out}
// bijvullen: wat niet won valt naar beneden (lolly's en kauwgomballen blijven liggen), nieuwe vallen van boven in
function tumble(g,hit,rng,fs,t){return g.map((col,c)=>{const keep=[];col.forEach((x,r)=>{if(!hit.has(c*ROWS+r))keep.push({x,r})});
 const add=ROWS-keep.length,res=new Array(ROWS);
 for(let i=0;i<add;i++)res[i]=Object.assign(pick(rng,fs,t),{fall:add});
 keep.forEach((o,j)=>{const pos=add+j;res[pos]=Object.assign({},o.x,{fall:pos-o.r})});return res})}
const cloneG=g=>g.map(c=>c.map(x=>Object.assign({},x)));
// Eén spin met alle tumbles. Geeft de stappen terug (voor de animatie) en de winst (× inzet).
function spin(rng,opts){opts=opts||{};const fs=!!opts.fs,t=+opts.vip||0,k=opts.k!=null?opts.k:1;
 let g=fill(rng,fs,t,opts.forceSc||0);const steps=[];let win=0;
 for(let guard=0;guard<60;guard++){const w=wins(g,k);steps.push({grid:cloneG(g),wins:w});if(!w.length)break;
  win+=w.reduce((a,x)=>a+x.pay,0);const hit=new Set();w.forEach(x=>x.cells.forEach(([c,r])=>hit.add(c*ROWS+r)));g=tumble(g,hit,rng,fs,t)}
 const last=steps[steps.length-1].grid;let sc=0,mult=0;const bombs=[];
 last.forEach((col,c)=>col.forEach((x,r)=>{if(x.sc)sc++;if(x.m){mult+=x.m;bombs.push([c,r,x.m])}}));
 const tumbleWin=win,multWin=fs&&win>0&&mult>0?win*mult:win;
 const trig=!fs&&sc>=TRIG,scPay=trig?SC_PAY[Math.min(6,sc)]||0:0;
 const extra=fs&&sc>=RETRIG_SC?FS_RETRIG:0;
 return {steps,tumbleWin,mult:fs&&win>0?mult:0,bombs,win:multWin+scPay,scPay,sc,trigger:trig,extra}}
// Bonus: n free spins; elke spin met winst telt de kauwgomballen op en vermenigvuldigt de winst van die spin.
function freeSpins(rng,n,k){let left=n,total=0,maxHit=false;const spins=[];
 while(left>0&&spins.length<300){left--;const s=spin(rng,{fs:true,k});if(s.extra)left+=s.extra;total+=s.win;
  if(total>=MAX_WIN){total=MAX_WIN;maxHit=true}s.left=maxHit?0:left;s.total=total;spins.push(s);if(maxHit)break}
 return {spins,total:Math.min(total,MAX_WIN),maxHit}}
function playRound(rng,opts){opts=opts||{};const t=+opts.vip||0;
 if(opts.buy){const s=spin(rng,{vip:t,k:VIP_KT[t]||1,forceSc:TRIG});const fs=freeSpins(rng,FS_START,FS_K*(BUY_KT[t]||1));
  return {base:s,fs,fsStart:FS_START,total:Math.min(MAX_WIN,s.win+fs.total),cost:BUY_COST}}
 const s=spin(rng,{vip:t,k:VIP_KT[t]||1});let tot=s.win,fs=null;
 if(s.trigger){fs=freeSpins(rng,FS_START,FS_K);tot+=fs.total}
 return {base:s,fs,fsStart:fs?FS_START:0,total:Math.min(MAX_WIN,tot),cost:1}}
const tune=o=>{if(o.payk!=null)PAYK=o.payk;if(o.sc!=null)SC.w=o.sc;if(o.scFs!=null)SC.fsW=o.scFs;if(o.scT)SC_T=o.scT;if(o.bomb!=null)BOMB.w=o.bomb;
 if(o.bombVals)BOMB.vals=o.bombVals;if(o.vipKT)VIP_KT=o.vipKT;if(o.fsK!=null)FS_K=o.fsK;if(o.buyKT)BUY_KT=o.buyKT;if(o.buyCost!=null)BUY_COST=o.buyCost;
 if(o.symW)o.symW.forEach((w,i)=>{SYMS[i].w=w});if(o.symP)o.symP.forEach((p,i)=>{SYMS[i].p=p});if(o.scPay)SC_PAY=o.scPay;if(o.maxWin!=null)MAX_WIN=o.maxWin};
const API={COLS,ROWS,MIN,BANDS,SYMS,SC,BOMB,FS_START,FS_RETRIG,RETRIG_SC,TRIG,get PAYK(){return PAYK},get SC_T(){return SC_T},get SC_PAY(){return SC_PAY},
 get MAX_WIN(){return MAX_WIN},get BUY_COST(){return BUY_COST},get VIP_KT(){return VIP_KT},get FS_K(){return FS_K},get BUY_KT(){return BUY_KT},
 band,tune,pick,fill,wins,spin,freeSpins,playRound};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.ZOET=API;
})(typeof window!=='undefined'?window:globalThis);
