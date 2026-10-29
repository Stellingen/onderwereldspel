// Casino: Hoogvlieger — een vliegtuigje vliegt over zee en pakt multipliers (+1, +2, +5, +10, ×2 … ×5) of bommen (÷2, en hij zakt).
// Aan het eind moet hij landen op een plateau (een vliegdekschip). Tussen de plateaus zit water. Raakt hij het dek, dan rolt hij nog door:
// blijft hij op het dek staan, dan win je inzet × multiplier; rolt hij eraf of valt hij in het water, dan ben je je inzet kwijt.
// Pakt hij een multiplier, dan stuitert hij omhoog (grote multipliers flink); een bom halveert je multiplier en duwt hem omlaag.
// De vluchtduur is echt willekeurig: meestal 10 tot 35 seconden, soms een minuut of langer (tot ±1,5 minuut).
// Schepen liggen ver en onregelmatig uit elkaar. VIP: dekken 12% langer, ±12% vaker landen.
// De vlucht ligt vast zodra je opstijgt (verversen verandert niets).
// Doorgerekend (avsim, 600.000 vluchten): normaal RTP ±87% en landt ±19%; VIP RTP ±97,5% en landt ±21%.
const AV_ITEMS=[['bom',.68],['+1',.30],['+2',.14],['+5',.05],['+10',.012],['x2',.07],['x3',.02],['x4',.006],['x5',.003]];
// gap = afstand tussen items, medN/sigN = vluchtlengte (mediaan aantal items, spreiding), bounce/drop = stoot omhoog bij een
// multiplier / omlaag bij een bom, max = hoogstens zoveel items (±1,5 minuut). L = lengte van een schip, G = water tussen twee schepen (onregelmatig en ver).
const AVC={gap:[70,110],medN:32,sigN:.55,drop:[6,11],bounce:[4,8],top:100,max:170,cap:250,L:[170,260],G:[260,1150],R:[25,75],margin:6,vipL:1.12,speed:165,slope:14/90};
// hoe sterk hij omhoog stuitert per soort multiplier (grote multipliers = flinke opwaartse stoot, dus soms een hele lange vlucht)
const AV_LIFT={'+1':1,'+2':1.2,'+5':1.7,'+10':2.4,x2:1.6,x3:2,x4:2.5,x5:3};
const AV_BETS=[10,25,50,100,250,500,1000,2500,5000,10000,25000,50000];
const avBets=()=>isHighRoller()?AV_BETS.concat([100000,250000,500000]):AV_BETS;
window.av=window.av||{bi:3,flying:false,plan:null,t0:0,raf:null,res:null,shake:0};
const avBet=()=>{const B=avBets();if(av.bi>=B.length)av.bi=B.length-1;return B[av.bi]};
const avR=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const avX=v=>'×'+v.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
function avPlan(vip,rng){rng=rng||avR;const tot=AV_ITEMS.reduce((a,b)=>a+b[1],0),U=(a)=>a[0]+rng()*(a[1]-a[0]);let m=1,x=0,bump=0;const path=[[0,100]],ev=[];
 // Vluchtduur: echt willekeurig (lognormaal): meestal 10-35 s, soms een minuut of langer. N = aantal items onderweg.
 const z=Math.sqrt(-2*Math.log(1-rng()))*Math.cos(2*Math.PI*rng());const N=Math.max(6,Math.min(AVC.max,Math.round(Math.exp(Math.log(AVC.medN)+AVC.sigN*z))));
 for(let n=1;n<=N;n++){x+=U(AVC.gap);
  let q=rng()*tot,it='bom';for(const [k,p] of AV_ITEMS){q-=p;if(q<=0){it=k;break}}
  // hoogte: zakt geleidelijk naar de zee; multiplier = stoot omhoog, bom = duw omlaag (ebt weer weg)
  const base=100*Math.pow(1-n/(N+1),.85);const alt=Math.max(5,Math.min(AVC.top,base+bump));path.push([x,alt]);
  if(it==='bom'){m=m/2;ev.push({x,alt,it,m});bump=bump*.7-U(AVC.drop)}
  else{if(it[0]==='+')m+=+it.slice(1);else m*=+it.slice(1);m=Math.min(AVC.cap,m);ev.push({x,alt,it,m});bump=bump*.7+U(AVC.bounce)*(AV_LIFT[it]||1)}
  const nb=100*Math.pow(1-(n+.35)/(N+1),.85);path.push([x+30,Math.max(4,Math.min(AVC.top,nb+bump*.85))])}
 const last=path[path.length-1],touch=last[0]+Math.max(0,last[1])/AVC.slope;path.push([touch,0]);
 // landen: dek (lengte L, VIP iets langer) en water (G) liggen willekeurig onder het landingspunt; R = hoe ver hij nog doorrolt
 const L=U(AVC.L)*(vip?AVC.vipL:1),G=U(AVC.G),pos=rng()*(L+G),R=U(AVC.R),on=pos<L,ok=on&&pos+R<=L-AVC.margin;
 let plats=[];
 if(on)plats.push([touch-pos,touch-pos+L,1]);
 else{const e0=touch-(pos-L);plats.push([e0-U(AVC.L),e0,0]);plats.push([e0+G,e0+G+U(AVC.L),0])}
 // schepen over de hele route, ver en onregelmatig uit elkaar
 while(plats[0][0]>60){const g=U(AVC.G),l=U(AVC.L),e=plats[0][0]-g;if(e-l<20)break;plats.unshift([e-l,e,0])}
 for(let k=0;k<5;k++){const last=plats[plats.length-1],g=U(AVC.G),l=U(AVC.L);plats.push([last[1]+g,last[1]+g+l,0])}
 const pl=on?plats.find(p=>touch>=p[0]&&touch<=p[1]):null;
 return {path,ev,touch,R,on,ok,m:Math.round(m*100)/100,plat:pl,plats,start:-170}}
function avAltAt(P,x){const p=P.path;if(x<=0)return 100;for(let i=1;i<p.length;i++){if(x<=p[i][0]){const [x0,y0]=p[i-1],[x1,y1]=p[i];return y0+(y1-y0)*((x-x0)/Math.max(1e-6,x1-x0))}}return 0}
function aviaView(){const h=S.avHist||[],bet=avBet(),f=av.flying,res=av.res;setTimeout(avMount,0);
 return `<div class="avx">
 <section class="av-stage card ${res&&!f?(res.ok?'won':'lost'):''}">
  <canvas id="avCanvas" aria-label="Hoogvlieger"></canvas>
  <div class="av-hud"><div><span class="label">Multiplier</span><b id="avMult">${avX(f&&av.cur!=null?av.cur:res?res.m:1)}</b></div><div><span class="label">Bij landing</span><b id="avPay">${fmt(bet*(f&&av.cur!=null?av.cur:res?res.m:1))}</b></div></div>
  <div class="av-msg" id="avMsg">${f?'':res?(res.ok?`<b class="w">Geland! ${avX(res.m)}</b><span>Je krijgt ${fmt(res.pay)}</span>`:`<b class="l">${res.on?'Van het dek gerold':'In het water'}</b><span>${fmt(res.bet)} kwijt${res.m>1?' · hij had '+avX(res.m):''}</span>`):'<b>Klaar voor de start</b><span>Pak multipliers, ontwijk bommen en land op een dek</span>'}</div>
 </section>
 <section class="av-panel card">
  <div class="label">Inzet</div>
  <div class="kk-bet"><button onclick="av.bi=Math.max(0,av.bi-1);SFX.chip();render()" ${f?'disabled':''} aria-label="Lagere inzet">−</button><b>${fmt(bet)}</b><button onclick="av.bi=Math.min(avBets().length-1,av.bi+1);SFX.chip();render()" ${f?'disabled':''} aria-label="Hogere inzet">+</button></div>
  <div class="cf-quick">${avBets().map((v,i)=>`<button class="${av.bi===i?'on':''}" onclick="av.bi=${i};SFX.chip();render()" ${f?'disabled':''}>${v>=1000?v/1000+'K':v}</button>`).join('')}</div>
  <button class="btn gold xl av-go" onclick="act.avFly()" ${f||inJail()||S.cash<bet?'disabled':''}>${f?'Vliegt…':S.cash<bet?'Te weinig geld':'Opstijgen · '+fmt(bet)}</button>
  <button class="btn ghost sm av-fast ${av.fast?'on':''}" onclick="av.fast=!av.fast;SFX.click();this.classList.toggle('on',av.fast);this.textContent=av.fast?'Sneller vliegen: aan':'Sneller vliegen: uit'" aria-pressed="${!!av.fast}">${av.fast?'Sneller vliegen: aan':'Sneller vliegen: uit'}</button>
  <div class="av-legend">
   <div><i class="add">+1</i><span>+1 tot +10 · hij stuitert omhoog</span></div><div><i class="mul">×2</i><span>×2 tot ×5 · hij stuitert omhoog</span></div>
   <div><i class="bom">÷2</i><span>Bom: halveert en duwt hem omlaag</span></div><div><i class="deck"></i><span>Land op een dek en blijf staan</span></div></div>
  <div class="label" style="margin-top:4px">Laatste vluchten</div>
  <div class="av-hist">${h.length?h.map(x=>`<i class="${x.ok?'w':'l'}" title="${x.ok?'Geland':'Niet geland'}">${x.ok?avX(x.m):'✕'}</i>`).join(''):'<span class="label">Nog niet gevlogen</span>'}</div>
  <p class="cf-fine">Een vlucht duurt meestal 10 tot 35 seconden, soms een minuut of langer. Doorgerekend: ${isVip()?'als VIP landt ±1 op 5 vluchten (dekken iets langer), RTP ±97,5%':'ongeveer 1 op de 5 vluchten landt, RTP ±87% (VIP: langere dekken, ±12% vaker landen, RTP ±97,5%)'}. Max ${AVC.cap}× je inzet. De vlucht ligt vast zodra je opstijgt.</p>
 </section></div>`}
/* ---------- Tekenen ---------- */
function avSize(cv){const dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return [x,W,H]}
function avPlane(x,px,py,ang,sc){x.save();x.translate(px,py);x.rotate(ang);x.scale(sc,sc);
 x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(2,10,24,4,0,0,7);x.fill();
 x.fillStyle='#e9e4d8';x.beginPath();x.moveTo(-28,-2);x.quadraticCurveTo(-10,-10,18,-6);x.quadraticCurveTo(30,-4,30,0);x.quadraticCurveTo(30,4,18,6);x.quadraticCurveTo(-10,8,-28,3);x.closePath();x.fill();
 x.fillStyle='#ff7a1a';x.fillRect(-20,-2,38,3);
 x.fillStyle='#c94f08';x.beginPath();x.moveTo(-24,-2);x.lineTo(-34,-16);x.lineTo(-27,-16);x.lineTo(-14,-3);x.closePath();x.fill();
 x.fillStyle='#ff7a1a';x.beginPath();x.moveTo(-4,0);x.lineTo(-14,14);x.lineTo(-4,14);x.lineTo(10,1);x.closePath();x.fill();
 x.fillStyle='#4d9dff';x.beginPath();x.ellipse(12,-4,6,3.2,0,0,7);x.fill();
 x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(32,0,2.5,13*(.6+.4*Math.abs(Math.sin(performance.now()/30))),0,0,7);x.fill();
 x.restore()}
function avDraw(P,planeX,planeAlt,ang,extra){const cv=document.getElementById('avCanvas');if(!cv)return;const [x,W,H]=avSize(cv),t=performance.now()/1000;
 const s=Math.max(.6,Math.min(1.4,W/760)),view=W/s,cam=planeX-view*.3,sea=H*.8,deck=sea-12,top=H*.12,yA=a=>deck-a/100*(deck-top),X=wx=>(wx-cam)*s;
 const sh=av.shake>0?(Math.random()-.5)*av.shake:0;x.save();x.translate(sh,sh*.6);
 let g=x.createLinearGradient(0,0,0,sea);g.addColorStop(0,'#0e2a4a');g.addColorStop(.6,'#2c5f8a');g.addColorStop(1,'#f2a65a');x.fillStyle=g;x.fillRect(-10,-10,W+20,sea+10);
 x.fillStyle='rgba(255,236,190,.9)';x.beginPath();x.arc(W*.82,sea-H*.06,H*.07,0,7);x.fill();
 for(let i=0;i<14;i++){const cx=((i*173.3-cam*.25*s)%(W+300)+W+300)%(W+300)-150,cy=top*0.6+((i*57)%5)*H*.07;x.fillStyle=`rgba(255,255,255,${.08+(i%3)*.04})`;
  x.beginPath();x.ellipse(cx,cy,60+(i%4)*18,14+(i%3)*5,0,0,7);x.ellipse(cx+30,cy-8,40,12,0,0,7);x.fill()}
 g=x.createLinearGradient(0,sea,0,H);g.addColorStop(0,'#155a7a');g.addColorStop(1,'#06212f');x.fillStyle=g;x.fillRect(-10,sea,W+20,H-sea+10);
 x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=1.5;for(let k=0;k<5;k++){x.beginPath();const yy=sea+8+k*((H-sea)/5);for(let px=-20;px<=W+20;px+=20){const wv=Math.sin(px*.04+t*2+k+cam*.02)*2;px===-20?x.moveTo(px,yy+wv):x.lineTo(px,yy+wv)}x.stroke()}
 // startdek en landingsdekken
 const dk=(a,b,hl)=>{const xa=X(a),xb=X(b);if(xb<-40||xa>W+40)return;x.fillStyle='#3a3f47';x.beginPath();x.moveTo(xa-8,deck);x.lineTo(xb+8,deck);x.lineTo(xb-6,sea+18);x.lineTo(xa+6,sea+18);x.closePath();x.fill();
  x.fillStyle=hl?'#5d636d':'#4a4f58';x.fillRect(xa,deck-4,xb-xa,6);x.strokeStyle='rgba(255,255,255,.6)';x.setLineDash([10,8]);x.beginPath();x.moveTo(xa+6,deck-1);x.lineTo(xb-6,deck-1);x.stroke();x.setLineDash([]);
  x.fillStyle='#2a2e35';x.fillRect(xb-26,deck-22,14,18);x.fillStyle='#ffd35a';x.fillRect(xb-23,deck-18,3,3)};
 dk(P?P.start:-170,P?P.start+150:-20,0);if(P)P.plats.forEach(p=>dk(p[0],p[1],p[2]));
 // items
 if(P)P.ev.forEach(e=>{const ex=X(e.x),ey=yA(e.alt);if(ex<-30||ex>W+30)return;const got=planeX>=e.x;if(got&&(planeX-e.x)>60)return;
  const a=got?Math.max(0,1-(planeX-e.x)/60):1,r=18*(got?1+(1-a):1);x.globalAlpha=a;
  if(e.it==='bom'){x.fillStyle='rgba(255,61,82,.25)';x.beginPath();x.arc(ex,ey,r+8,0,7);x.fill();x.fillStyle='#16181d';x.beginPath();x.arc(ex,ey,r,0,7);x.fill();x.strokeStyle='#ff3d52';x.lineWidth=2;x.stroke();
   x.fillStyle='#ff6b7c';x.font='800 12px "Big Shoulders Text",sans-serif';x.textAlign='center';x.fillText('÷2',ex,ey+4)}
  else{const mul=e.it[0]==='x',c=mul?'#f2c230':'#3fe395';x.fillStyle=mul?'rgba(242,194,48,.25)':'rgba(63,227,149,.22)';x.beginPath();x.arc(ex,ey,r+7,0,7);x.fill();
   x.fillStyle='#0b1a12';x.beginPath();x.roundRect(ex-r-4,ey-r+3,(r+4)*2,(r-3)*2,8);x.fill();x.strokeStyle=c;x.lineWidth=2;x.stroke();
   x.fillStyle=c;x.font='900 15px "Big Shoulders Display",sans-serif';x.textAlign='center';x.fillText(mul?'×'+e.it.slice(1):e.it,ex,ey+5)}
  x.globalAlpha=1});
 // vliegtuig
 const py=planeAlt==null?deck-8:yA(Math.max(0,planeAlt))+(planeAlt<0?-planeAlt*2.2:0)-8;avPlane(x,X(planeX),py,ang||0,s*1.35);
 if(extra&&extra.splash){const sx=X(extra.splash.x),k=extra.splash.k;for(let i=0;i<14;i++){const a=-Math.PI*(i/13),d=10+k*40;x.fillStyle=`rgba(220,240,255,${1-k})`;x.beginPath();x.arc(sx+Math.cos(a)*d,sea-Math.abs(Math.sin(a))*d*1.4+k*30,3,0,7);x.fill()}}
 x.restore()}
function avMount(){if(av.flying)return;const P=av.plan&&av.res?av.plan:null;
 if(P){const endX=av.res.endX!=null?av.res.endX:P.touch;avDraw(P,endX,av.res.endAlt!=null?av.res.endAlt:0,av.res.endAng||0)}else avDraw(null,-110,null,0)}
window.addEventListener('resize',()=>{if(page==='casino'&&casinoTab==='avia'&&!av.flying)avMount()});
Object.assign(act,{
 avFly(){if(av.flying||inJail())return;const bet=avBet();if(S.cash<bet){toast('Niet genoeg contant geld','bad');return}
  const P=avPlan(isVip()),pay=P.ok?Math.floor(bet*P.m):0;
  // uitkomst staat vast en wordt meteen verrekend
  S.cash+=pay-bet;window.slotPending=pay;if(pay>bet)S.stats.won+=pay-bet;else S.stats.lost+=bet-pay;casinoRound(bet,pay,'avia');
  S.avHist=[{m:P.m,ok:P.ok}].concat(S.avHist||[]).slice(0,14);save();
  log('Hoogvlieger: '+(P.ok?'geland op '+avX(P.m)+', '+fmt(pay):'niet geland ('+fmt(bet)+' kwijt)'),P.ok?'ok':'bad');
  av.plan=P;av.res=null;av.flying=true;av.cur=1;av.shake=0;render();SFX.spin();
  let T0=performance.now(),tt=0,lastNow=T0;const flyT=P.touch/AVC.speed*1000,rollT=1300,fallT=1100,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;let seen=0,splash=null,endX=P.touch,endAlt=0,endAng=0;
  const hud=()=>{const m=document.getElementById('avMult'),p=document.getElementById('avPay');if(m)m.textContent=avX(av.cur);if(p)p.textContent=fmt(bet*av.cur)};
  const step=now=>{if(!document.getElementById('avCanvas')&&page!=='casino'){finish();return}
   tt+=(now-lastNow)*(av.fast&&tt<flyT?3:1);lastNow=now;let t=tt;if(reduce)t=Math.max(t,flyT);let px,pa,ang=0,ex=null;
   if(t<flyT){px=t/1000*AVC.speed;pa=avAltAt(P,px);const pa2=avAltAt(P,px+6);ang=Math.atan2(pa-pa2,6*1.2)*.6;
    while(seen<P.ev.length&&px>=P.ev[seen].x){const e=P.ev[seen++];av.cur=e.m;hud();if(e.it==='bom'){SFX.lose();av.shake=10}else SFX.win(e.it[0]==='x'?4:2)}}
   else{const rt=t-flyT;
    if(!P.on){px=P.touch;pa=-Math.min(1,rt/500)*14;ang=.5;if(!splash)SFX.lose();splash={x:P.touch,k:Math.min(1,rt/fallT)};ex={splash};if(rt>fallT){endX=px;endAlt=-14;endAng=.5;return finish()}}
    else{const edge=P.plat[1]-P.touch,dist=P.ok?P.R:edge+10,dur=P.ok?rollT:rollT*Math.min(1,(edge+10)/P.R);const k=Math.min(1,rt/dur);px=P.touch+dist*(1-Math.pow(1-k,2));pa=0;
     if(!P.ok&&k>=1){const ft=rt-dur;pa=-Math.min(1,ft/400)*14;ang=Math.min(.9,ft/400);px=P.touch+dist+ft/1000*40;splash={x:P.plat[1]+14,k:Math.min(1,ft/fallT)};ex={splash};if(ft<30)SFX.lose();if(ft>fallT){endX=px;endAlt=pa;endAng=ang;return finish()}}
     else if(P.ok&&rt>dur+350){endX=px;return finish()}}}
   av.shake=Math.max(0,av.shake*.88-.2);avDraw(P,px,pa,ang,ex);av.raf=requestAnimationFrame(step)};
  const finish=()=>{cancelAnimationFrame(av.raf);av.flying=false;window.slotPending=0;av.res={ok:P.ok,on:P.on,m:P.m,pay,bet,endX,endAlt,endAng};
   if(P.ok){(P.m>=10?SFX.big():SFX.win(5));toast('Geland! '+avX(P.m)+' · je krijgt '+fmt(pay),P.m>=10?'lvl':'ok')}else toast(P.on?'Van het dek gerold. '+fmt(bet)+' kwijt':'In het water. '+fmt(bet)+' kwijt','bad');
   save();if(page==='casino'&&casinoTab==='avia')render();else renderTop()};
  av.raf=requestAnimationFrame(step)}});
