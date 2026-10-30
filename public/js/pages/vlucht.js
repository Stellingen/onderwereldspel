// Casino: Hoogvlieger — een vliegtuigje vliegt op eigen kracht over zee. Overal in de lucht hangen willekeurig items:
// plusjes (+1 tot +10) duwen hem omhoog, ×2 tot ×5 houden hem even op dezelfde hoogte, een bom (÷2) ontploft en laat hem zakken.
// Wat hij raakt hangt af van waar hij vliegt: er is geen vaste baan. Zonder items glijdt hij langzaam naar de zee.
// Op zee liggen vliegdekschepen met water ertussen. Raakt hij een dek, dan rolt hij nog door: blijft hij staan, dan win je
// inzet × multiplier; rolt hij eraf of valt hij in het water, dan ben je je inzet kwijt. VIP: dekken 12% langer.
// De vlucht wordt bij het opstijgen in één keer doorgerekend (natuurkunde + willekeurige items) en ligt dan vast.
// Doorgerekend (avsim2.js, 80.000 vluchten): vlucht meestal 12 tot 55 s (mediaan ±24 s, soms 1,5 minuut of langer), hij raakt
// gemiddeld ±9 items. Normaal landt ±17% met RTP ±87%; VIP landt ±19% met RTP ±98% (+0,5% cashback).
const AV_ITEMS=[['bom',.413],['+1',.26],['+2',.13],['+5',.045],['+10',.012],['x2',.082],['x3',.026],['x4',.0085],['x5',.0037]];
// natuurkunde (hoogte 0 = zee, 100 = plafond; snelheid in hoogte-eenheden per seconde)
// g = zwaartekracht, vt = maximale daalsnelheid, v0 = klimsnelheid bij de start, hit = hoe dichtbij een item moet zijn,
// gap = horizontale afstand tussen items in de lucht, L/G = lengte van een schip / water ertussen, R = doorrollen na de landing
const AVC={free:420,a0:12,g:2.5,vt:9,v0:16,hit:7,gap:[38,95],lo:6,hi:97,hold:.9,cap:250,L:[170,260],G:[260,1150],R:[25,75],margin:6,vipLT:[1,1.065,1.11],speed:165,maxT:150};
// stoot omhoog per plusje, duw omlaag bij een bom
const AV_LIFT={'+1':7,'+2':8,'+5':10,'+10':13},AV_BOMB=7;
const AV_BETS=[10,25,50,100,250,500,1000,2500,5000,10000,25000,50000];
const avBets=()=>isHighRoller()?AV_BETS.concat([100000,250000,500000]):AV_BETS;
window.av=window.av||{bi:3,flying:false,plan:null,t0:0,raf:null,res:null,shake:0};
const avBet=()=>{const B=avBets();if(av.bi>=B.length)av.bi=B.length-1;return B[av.bi]};
const avR=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;
const avX=v=>'×'+v.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
function avPlan(vip,rng){rng=rng||avR;const tot=AV_ITEMS.reduce((a,b)=>a+b[1],0),U=a=>a[0]+rng()*(a[1]-a[0]);
 // 1) items willekeurig in de lucht
 const items=[];let ix=AVC.free;const maxX=AVC.speed*AVC.maxT+600;
 while(ix<maxX){ix+=U(AVC.gap);let q=rng()*tot,it='bom';for(const [k,p] of AV_ITEMS){q-=p;if(q<=0){it=k;break}}items.push({x:ix,alt:AVC.lo+rng()*(AVC.hi-AVC.lo),it})}
 // 2) vliegen: stap voor stap, zwaartekracht trekt hem omlaag, wat hij raakt verandert zijn koers
 const dt=1/60,dx=AVC.speed*dt;let x=-40,a=AVC.a0,v=AVC.v0,m=1,hold=0,k=0;const path=[[x,a]],ev=[];
 while(k<items.length&&items[k].x<x)k++;
 for(let n=0;n<AVC.maxT*60;n++){
  if(hold>0)hold-=dt;else v=Math.max(-AVC.vt,v-AVC.g*dt);
  const t=n*dt;if(t>AVC.maxT-20)v=Math.min(v,-AVC.vt); // na ±2 minuten gaat hij echt naar beneden
  a+=v*dt;x+=dx;if(a>100){a=100;v=Math.min(v,0)}
  while(k<items.length&&items[k].x<=x){const I=items[k++];if(Math.abs(I.alt-a)<=AVC.hit){I.hit=1;
    if(I.it==='bom'){m=m/2;v=Math.min(v,0)-AV_BOMB;hold=0}
    else if(I.it[0]==='+'){m=Math.min(AVC.cap,m+ +I.it.slice(1));v=Math.max(v,0)+AV_LIFT[I.it];hold=0}
    else{m=Math.min(AVC.cap,m*+I.it.slice(1));v=0;hold=AVC.hold}
    ev.push({x:I.x,alt:I.alt,it:I.it,m:Math.round(m*100)/100,i:k-1})}}
  if(n%3===0)path.push([x,a]);
  if(a<=0){a=0;break}}
 path.push([x,0]);const touch=x;
 // 3) schepen over de hele route, met water ertussen
 const plats=[];let px=260;while(px<touch+3000){const g=U(AVC.G),l=U(AVC.L)*(AVC.vipLT[vip|0]||1);px+=g;plats.push([px,px+l,0]);px+=l}
 const pl=plats.find(p=>touch>=p[0]&&touch<=p[1])||null;if(pl)pl[2]=1;
 const R=U(AVC.R),on=!!pl,ok=on&&touch+R<=pl[1]-AVC.margin;
 return {path,items:items.filter(I=>I.x<touch+1400),ev,touch,R,on,ok,m:Math.round(m*100)/100,plat:pl,plats,start:-190}}
function avAltAt(P,x){const p=P.path;if(x<=p[0][0])return p[0][1];let lo=0,hi=p.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(p[mid][0]<=x)lo=mid;else hi=mid}
 const [x0,y0]=p[lo],[x1,y1]=p[hi];return x>=x1?y1:y0+(y1-y0)*((x-x0)/Math.max(1e-6,x1-x0))}
function aviaView(){const h=(av.flying&&av.prevHist?av.prevHist:S.avHist)||[],bet=avBet(),f=av.flying,res=av.res;setTimeout(avMount,0);
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
  <button class="btn gold xl av-go" onclick="act.avFly()" ${f||inJail()||casCash()<bet?'disabled':''}>${f?'Vliegt…':casCash()<bet?'Te weinig geld':'Opstijgen · '+fmt(bet)}</button>
  <button class="btn ghost sm av-fast ${av.fast?'on':''}" onclick="av.fast=!av.fast;SFX.click();this.classList.toggle('on',av.fast);this.textContent=av.fast?'Sneller vliegen: aan':'Sneller vliegen: uit'" aria-pressed="${!!av.fast}">${av.fast?'Sneller vliegen: aan':'Sneller vliegen: uit'}</button>
  <div class="av-legend">
   <div><i class="add">+1</i><span>+1 tot +10 · duwt hem omhoog</span></div><div><i class="mul">×2</i><span>×2 tot ×5 · houdt hem even op hoogte</span></div>
   <div><i class="bom">÷2</i><span>Bom: halveert, ontploft en hij zakt</span></div><div><i class="deck"></i><span>Land op een dek en blijf staan</span></div></div>
  <div class="label" style="margin-top:4px">Laatste vluchten</div>
  <div class="av-hist">${h.length?h.map(x=>`<i class="${x.ok?'w':'l'}" title="${x.ok?'Geland':'Niet geland'}">${x.ok?avX(x.m):'✕'}</i>`).join(''):'<span class="label">Nog niet gevlogen</span>'}</div>
  <p class="cf-fine">Er is geen vaste baan: de items hangen willekeurig in de lucht en wat hij raakt bepaalt of hij stijgt of zakt. Een vlucht duurt meestal 12 tot 55 seconden, soms anderhalve minuut of langer. Doorgerekend: ${['±1 op de 6 vluchten landt, RTP ±86% (VIP en High roller: langere dekken, vaker landen)','als VIP zijn de dekken langer en land je ±6% vaker, RTP ±92%','als High roller zijn de dekken langer en land je ±12% vaker, RTP ±96%'][tier()]}. Max ${AVC.cap}× je inzet. De vlucht ligt vast zodra je opstijgt.</p>
 </section></div>`}
/* ---------- Tekenen ---------- */
function avSize(cv){const dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return [x,W,H]}
// Vliegtuig: klein propellervliegtuig met romp, ramen, cockpit, staart en draaiende propeller (neus naar rechts)
function avPlane(x,px,py,ang,sc){const t=performance.now();x.save();x.translate(px,py);x.rotate(ang);x.scale(sc,sc);
 // vleugel en hoogteroer aan de verre kant
 x.fillStyle='#9c9588';x.beginPath();x.moveTo(-2,-3);x.lineTo(-9,-12);x.quadraticCurveTo(-6,-13.5,-3,-12.5);x.lineTo(8,-4);x.closePath();x.fill();
 x.beginPath();x.moveTo(-22,-2);x.lineTo(-29,-7);x.lineTo(-25,-7.4);x.lineTo(-16,-2.4);x.closePath();x.fill();
 // romp
 const g=x.createLinearGradient(0,-9,0,8);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#e9e4d9');g.addColorStop(1,'#a59f93');
 x.fillStyle=g;x.beginPath();x.moveTo(-33,-2.5);x.quadraticCurveTo(-27,-8,-8,-8);x.lineTo(15,-7.4);x.quadraticCurveTo(28,-6.4,33,-.6);x.quadraticCurveTo(29,6,15,6.6);x.lineTo(-8,6.6);x.quadraticCurveTo(-27,6,-33,1.2);x.closePath();x.fill();
 x.strokeStyle='rgba(60,55,48,.35)';x.lineWidth=.8;x.stroke();
 // oranje streep over de romp
 x.fillStyle='#ff7a1a';x.beginPath();x.moveTo(-31,.4);x.lineTo(31,.4);x.quadraticCurveTo(31.4,1.4,30.6,2.6);x.lineTo(-30.5,2.6);x.closePath();x.fill();
 // staart
 const tg=x.createLinearGradient(-36,-21,-22,-3);tg.addColorStop(0,'#ffad5c');tg.addColorStop(1,'#c94f08');x.fillStyle=tg;
 x.beginPath();x.moveTo(-31.5,-3);x.lineTo(-37.5,-19.5);x.quadraticCurveTo(-34.5,-22,-30.5,-19.5);x.lineTo(-19,-6.8);x.closePath();x.fill();
 x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.moveTo(-33.5,-15);x.lineTo(-31.6,-15);x.lineTo(-27,-8.6);x.lineTo(-28.9,-8.6);x.closePath();x.fill();
 // ramen
 x.fillStyle='#1d3d5c';for(let i=0;i<5;i++){x.beginPath();x.ellipse(-15+i*5.6,-3.4,1.45,1.75,0,0,7);x.fill()}
 x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++){x.beginPath();x.ellipse(-15.4+i*5.6,-4,.5,.6,0,0,7);x.fill()}
 // cockpit
 const cg=x.createLinearGradient(17,-7,29,-1);cg.addColorStop(0,'#bfe4ff');cg.addColorStop(1,'#2d6ea8');x.fillStyle=cg;
 x.beginPath();x.moveTo(16.5,-6.6);x.quadraticCurveTo(25,-6.2,29.6,-1.8);x.lineTo(18.4,-1.8);x.closePath();x.fill();
 // vleugel aan de dichte kant
 const wg=x.createLinearGradient(0,1,0,16);wg.addColorStop(0,'#f6f2ea');wg.addColorStop(1,'#b8b1a3');x.fillStyle=wg;
 x.beginPath();x.moveTo(-5,2.2);x.lineTo(-15,15.5);x.quadraticCurveTo(-12,17.6,-8,16.6);x.lineTo(11,3.2);x.closePath();x.fill();
 x.fillStyle='#ff7a1a';x.beginPath();x.moveTo(-15,15.5);x.quadraticCurveTo(-12,17.6,-8,16.6);x.lineTo(-9.2,15);x.lineTo(-13.6,14.6);x.closePath();x.fill();
 x.fillStyle=Math.floor(t/450)%2?'#ff3d52':'#5b1a22';x.beginPath();x.arc(-13.4,15.6,1.1,0,7);x.fill();
 // hoogteroer dichtbij
 x.fillStyle='#d9d3c6';x.beginPath();x.moveTo(-23,1.2);x.lineTo(-31,7.6);x.lineTo(-26,8);x.lineTo(-17.5,1.8);x.closePath();x.fill();
 // neus en draaiende propeller
 x.fillStyle='#3a3f47';x.beginPath();x.ellipse(33.2,-.6,2.4,2.8,0,0,7);x.fill();
 x.fillStyle='rgba(235,240,245,.22)';x.beginPath();x.ellipse(35.2,-.6,2.4,14.5,0,0,7);x.fill();
 const sp=Math.sin(t/22);x.strokeStyle='rgba(30,34,40,.8)';x.lineWidth=1.8;x.lineCap='round';x.beginPath();x.moveTo(35.2,-.6-13.5*sp);x.lineTo(35.2,-.6+13.5*sp);x.stroke();
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
 // items: overal in de lucht. Wat hij raakt, spat uiteen; de rest blijft gewoon hangen.
 if(P)P.items.forEach(e=>{const ex=X(e.x),ey=yA(e.alt);if(ex<-30||ex>W+30)return;const got=e.hit&&planeX>=e.x;if(got&&(planeX-e.x)>50)return;
  const a=got?Math.max(0,1-(planeX-e.x)/50):1,r=16*(got?1+(1-a)*.8:1),bob=got?0:Math.sin(t*2+e.x*.05)*2;x.globalAlpha=a*(e.hit||planeX<e.x?1:.75);
  if(e.it==='bom'){x.fillStyle='rgba(255,61,82,.2)';x.beginPath();x.arc(ex,ey+bob,r+7,0,7);x.fill();x.fillStyle='#16181d';x.beginPath();x.arc(ex,ey+bob,r,0,7);x.fill();x.strokeStyle='#ff3d52';x.lineWidth=2;x.stroke();
   x.strokeStyle='#ffb35a';x.lineWidth=2;x.beginPath();x.moveTo(ex+r*.5,ey+bob-r*.8);x.quadraticCurveTo(ex+r*.9,ey+bob-r*1.4,ex+r*1.2,ey+bob-r*1.2);x.stroke();
   x.fillStyle='#ff6b7c';x.font='800 12px "Big Shoulders Text",sans-serif';x.textAlign='center';x.fillText('÷2',ex,ey+bob+4)}
  else{const mul=e.it[0]==='x',c=mul?'#f2c230':'#3fe395';x.fillStyle=mul?'rgba(242,194,48,.2)':'rgba(63,227,149,.18)';x.beginPath();x.arc(ex,ey+bob,r+6,0,7);x.fill();
   x.fillStyle='#0b1a12';x.beginPath();x.roundRect(ex-r-4,ey+bob-r+3,(r+4)*2,(r-3)*2,8);x.fill();x.strokeStyle=c;x.lineWidth=2;x.stroke();
   x.fillStyle=c;x.font='900 14px "Big Shoulders Display",sans-serif';x.textAlign='center';x.fillText(mul?'×'+e.it.slice(1):e.it,ex,ey+bob+5)}
  x.globalAlpha=1});
 // effecten: bom ontploft, plusje/keer flitst
 (av.fx||[]).forEach(f=>{const k=(performance.now()-f.t0)/700;if(k>1)return;const fx=X(f.x),fy=yA(f.alt);
  if(f.it==='bom'){for(let i=0;i<3;i++){x.strokeStyle=`rgba(255,${120+i*40},60,${(1-k)*(.9-i*.25)})`;x.lineWidth=4-i;x.beginPath();x.arc(fx,fy,10+k*(40+i*18),0,7);x.stroke()}
   for(let i=0;i<12;i++){const an=i/12*6.283,d=8+k*55;x.fillStyle=`rgba(255,${150+(i%3)*30},80,${1-k})`;x.beginPath();x.arc(fx+Math.cos(an)*d,fy+Math.sin(an)*d+k*k*20,3*(1-k)+1,0,7);x.fill()}}
  else{const c=f.it[0]==='x'?'242,194,48':'63,227,149';x.strokeStyle=`rgba(${c},${1-k})`;x.lineWidth=3;x.beginPath();x.arc(fx,fy,12+k*36,0,7);x.stroke();
   x.fillStyle=`rgba(${c},${1-k})`;x.font='900 18px "Big Shoulders Display",sans-serif';x.textAlign='center';x.fillText(f.it[0]==='x'?'×'+f.it.slice(1):f.it==='bom'?'÷2':f.it,fx,fy-18-k*26)}});
 // vliegtuig
 const py=planeAlt==null?deck-8:yA(Math.max(0,planeAlt))+(planeAlt<0?-planeAlt*2.2:0)-8;
 // rookspoor: de laatste hoogtes van het vliegtuig, vervagend naar achteren
 if(av.flying&&planeAlt!=null){av.trail=av.trail||[];av.trail.unshift(py);if(av.trail.length>34)av.trail.length=34}else if(!av.flying)av.trail=[];
 if(av.trail&&av.trail.length>2){const px=X(planeX)-30*s*1.6;for(let i=1;i<av.trail.length;i++){const k=i/av.trail.length;x.fillStyle=`rgba(255,255,255,${.28*(1-k)})`;x.beginPath();x.arc(px-i*5.2*s,av.trail[i]+Math.sin(i*.9+performance.now()/300)*1.2,(2.2+i*.22)*s,0,7);x.fill()}}
 avPlane(x,X(planeX),py,ang||0,s*1.6);
 if(extra&&extra.splash){const sx=X(extra.splash.x),k=extra.splash.k;for(let i=0;i<14;i++){const a=-Math.PI*(i/13),d=10+k*40;x.fillStyle=`rgba(220,240,255,${1-k})`;x.beginPath();x.arc(sx+Math.cos(a)*d,sea-Math.abs(Math.sin(a))*d*1.4+k*30,3,0,7);x.fill()}}
 x.restore()}
function avMount(){if(av.flying)return;const P=av.plan&&av.res?av.plan:null;
 if(P){const endX=av.res.endX!=null?av.res.endX:P.touch;avDraw(P,endX,av.res.endAlt!=null?av.res.endAlt:0,av.res.endAng||0)}else avDraw(null,-110,null,0)}
window.addEventListener('resize',()=>{if(page==='casino'&&casinoTab==='avia'&&!av.flying)avMount()});
Object.assign(act,{
 avFly(){if(av.flying||inJail())return;const bet=avBet();if(casCash()<bet){toast(casShort(),'bad');return}
  const P=avPlan(tier()),pay=P.ok?Math.floor(bet*P.m):0;
  // uitkomst staat vast en wordt meteen verrekend
  S.cash+=pay-bet;window.slotPending=pay;if(pay>bet)S.stats.won+=pay-bet;else S.stats.lost+=bet-pay;casinoRound(bet,pay,'avia');
  av.prevHist=(S.avHist||[]).slice();S.avHist=[{m:P.m,ok:P.ok}].concat(S.avHist||[]).slice(0,14);save();
  const lg=log('Hoogvlieger: '+(P.ok?'geland op '+avX(P.m)+', '+fmt(pay):'niet geland ('+fmt(bet)+' kwijt)'),P.ok?'ok':'bad',60000);
  av.plan=P;av.res=null;av.flying=true;av.cur=1;av.shake=0;av.fx=[];render();SFX.spin();
  let T0=performance.now(),tt=0,lastNow=T0;const flyT=(P.touch+40)/AVC.speed*1000,rollT=1300,fallT=1100,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;let seen=0,splash=null,endX=P.touch,endAlt=0,endAng=0;
  const hud=()=>{const m=document.getElementById('avMult'),p=document.getElementById('avPay');if(m)m.textContent=avX(av.cur);if(p)p.textContent=fmt(bet*av.cur)};
  const step=now=>{if(!document.getElementById('avCanvas')&&page!=='casino'){finish();return}
   tt+=(now-lastNow)*(av.fast&&tt<flyT?3:1);lastNow=now;let t=tt;if(reduce)t=Math.max(t,flyT);let px,pa,ang=0,ex=null;
   if(t<flyT){px=-40+t/1000*AVC.speed;pa=avAltAt(P,px);const pa2=avAltAt(P,px+6);ang=Math.atan2(pa-pa2,6*1.2)*.6;
    while(seen<P.ev.length&&px>=P.ev[seen].x){const e=P.ev[seen++];av.cur=e.m;hud();av.fx=(av.fx||[]).filter(f=>performance.now()-f.t0<800).concat([{x:e.x,alt:e.alt,it:e.it,t0:performance.now()}]);if(e.it==='bom'){SFX.lose();av.shake=12}else SFX.win(e.it[0]==='x'?4:2)}}
   else{const rt=t-flyT;
    if(!P.on){px=P.touch;pa=-Math.min(1,rt/500)*14;ang=.5;if(!splash)SFX.lose();splash={x:P.touch,k:Math.min(1,rt/fallT)};ex={splash};if(rt>fallT){endX=px;endAlt=-14;endAng=.5;return finish()}}
    else{const edge=P.plat[1]-P.touch,dist=P.ok?P.R:edge+10,dur=P.ok?rollT:rollT*Math.min(1,(edge+10)/P.R);const k=Math.min(1,rt/dur);px=P.touch+dist*(1-Math.pow(1-k,2));pa=0;
     if(!P.ok&&k>=1){const ft=rt-dur;pa=-Math.min(1,ft/400)*14;ang=Math.min(.9,ft/400);px=P.touch+dist+ft/1000*40;splash={x:P.plat[1]+14,k:Math.min(1,ft/fallT)};ex={splash};if(ft<30)SFX.lose();if(ft>fallT){endX=px;endAlt=pa;endAng=ang;return finish()}}
     else if(P.ok&&rt>dur+350){endX=px;return finish()}}}
   av.shake=Math.max(0,av.shake*.88-.2);avDraw(P,px,pa,ang,ex);av.raf=requestAnimationFrame(step)};
  const finish=()=>{if(lg)delete lg.r;cancelAnimationFrame(av.raf);av.flying=false;window.slotPending=0;av.res={ok:P.ok,on:P.on,m:P.m,pay,bet,endX,endAlt,endAng};
   if(P.ok){(P.m>=10?SFX.big():SFX.win(5));toast('Geland! '+avX(P.m)+' · je krijgt '+fmt(pay),P.m>=10?'lvl':'ok')}else toast(P.on?'Van het dek gerold. '+fmt(bet)+' kwijt':'In het water. '+fmt(bet)+' kwijt','bad');
   save();if(page==='casino'&&casinoTab==='avia')render();else renderTop()};
  av.raf=requestAnimationFrame(step)}});
