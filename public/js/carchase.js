// Ontsnappen met de auto: "Plankgas!". Word je betrapt bij autodiefstal (straat afzoeken of carjacken) en kies je vluchten,
// dan spring je in de auto en rijd je weg. Eerst een korte filmpje (je karakter met je eigen kleren stapt in, de motor brult,
// zwaailichten in de spiegel), daarna rijd je door de stad: verkeer en versperringen ontwijken, politieauto's die je klem
// proberen te rijden (ze knipperen eerst naar jouw baan: wissel van baan, rem of geef nitro) en zijstraten waar je in kunt
// schieten om ze kwijt te raken. Je verliest als de auto te veel schade heeft of als de politie je inhaalt.
// Besturing: ← → (A/D) baan wisselen, ↑ / W / spatie = nitro, ↓ / S ingedrukt = remmen. Telefoon: vegen of de knoppen.
// Moeilijkheid per niveau (CC_LV, zelfde 1-5 als FLEE_LEVELS):
//   v = snelheid (m/s) · gap = seconden tussen twee rijen verkeer · p2 = kans op twee banen dicht · block/cop = kans op een
//   versperring of een politieauto die je klem wil rijden · hits = schade die je mag oplopen · start = voorsprong (m) ·
//   copK = hoe snel de politie achter je aan komt (1 = even snel als jij) · nitro = aantal keer nitro · time = lengte (s) ·
//   exits = zijstraten onderweg
// Rijvaardigheid, je uitrusting, outfit, familie en lidmaatschap geven meer ruimte en voorsprong (ccParams).
// carChaseGame(level, car) geeft een Promise met true (ontkomen) of false (klem gereden / motor kapot).
// escapeGame(level, opts) kiest het juiste spel: met opts.chase de auto, anders het rennen (fleeGame).
const CC_LV={
 1:{v:22,gap:1.45,p2:.2,block:.08,cop:.12,hits:3,start:48,copK:1.004,nitro:3,time:30,exits:3},
 2:{v:24,gap:1.28,p2:.3,block:.12,cop:.16,hits:2,start:42,copK:1.008,nitro:3,time:32,exits:3},
 3:{v:26,gap:1.14,p2:.38,block:.16,cop:.2,hits:2,start:36,copK:1.014,nitro:2,time:34,exits:2},
 4:{v:28,gap:1.06,p2:.44,block:.2,cop:.22,hits:2,start:33,copK:1.025,nitro:2,time:36,exits:3},
 5:{v:30,gap:.96,p2:.52,block:.24,cop:.26,hits:2,start:27,copK:1.04,nitro:2,time:38,exits:2}};
const CC_LW=3.2,CC_ROAD=5.4,CC_WALK=8,CC_CL=4.4,CC_REVEAL=72,CC_FAR=110;
function ccParams(level){const L=CC_LV[level]||CC_LV[2],sk=(S.skills&&S.skills.cars)||0,fx=k=>{try{return k()}catch(e){return 0}};
 const ease=(1+sk*.012+fx(()=>gearFx('flee'))+fx(()=>famPerk('flee'))+fx(()=>typeof fitFx==='function'?fitFx('flee'):0))*(1+fx(()=>tierK())*.6);
 return Object.assign({},L,{level,ease,gap:L.gap*Math.min(1.3,Math.sqrt(ease)),start:L.start*Math.min(1.5,ease),
  hitW:Math.max(.48,.62/Math.pow(ease,.3)),nitro:L.nitro+(sk>=10?1:0),label:(FLEE_LEVELS[level]||FLEE_LEVELS[2]).label})}
function escapeGame(level,opts){return opts&&opts.chase&&typeof carChaseGame==='function'?carChaseGame(level,opts.chase):fleeGame(level)}
// De route in "ontmoet-tijden": rij i komt jou tegen op tijd T (bij gewoon gas). Rijdt hij zelf u m/s, dan begint hij op (V-u)·T.
// Zo vallen auto's die langzamer rijden en versperringen die stilstaan altijd netjes na elkaar.
function ccCourse(P){const rows=[],V=P.v,ex=[];for(let i=0;i<P.exits;i++)ex.push(P.time*(.24+i*(.62/Math.max(1,P.exits-1)))+(Math.random()-.5)*1.2);
 const pick=W=>{let t=0;for(const k in W)t+=W[k];let x=Math.random()*t;for(const k in W){x-=W[k];if(x<=0&&W[k]>0)return k}return 'one'};
 let T=2.4,last='';
 while(T<P.time-1.2){const d=T/P.time,ph=d<.25?0:d<.7?1:2;let k;
  if(ph===0)k=Math.random()<P.p2*.6?'two':'one';
  else if(ph===1)k=pick({one:.3,two:P.p2+.1,block:P.block,cop:last==='cop'?0:P.cop});
  else k=pick({one:.12,two:.22+P.p2,block:P.block+.04,cop:last==='cop'?0:P.cop+.04,sl:.2});
  const u=k==='block'?0:V*(.42+Math.random()*.12);
  if(k==='sl'){rows.push({k:'two',T,u,set:0});T+=Math.max(7.5/Math.max(4,V-u)+.3,P.gap*.62);rows.push({k:'sl',T,u,set:0,prev:rows[rows.length-1]})}
  else rows.push({k,T,u,set:0});
  // nooit sneller dan haalbaar: eerst de vorige auto voorbij (±7,5 m) plus een reactietijd
  const minG=7.5/Math.max(4,V-u)+.42;
  last=k;T+=Math.max(minG,P.gap*(ph===2?.82:ph===0?1.18:1)*(.9+Math.random()*.2)*(k==='cop'?1.25:1))}
 // zijstraten: de buitenste baan aan die kant blijft vrij in de rijen eromheen
 const exits=ex.map(T=>({T,side:Math.random()<.5?-1:1,z0:V*T,taken:0,passed:0}));
 rows.forEach((r,i)=>{r.z0=(V-r.u)*r.T;r.pv=i?rows[i-1]:null;const e=exits.find(e=>Math.abs(e.T-r.T)<.8);if(e)r.forceFree=e.side});
 return {rows,exits,len:V*P.time}}
// rij invullen ten opzichte van jouw baan op het moment dat hij in zicht komt (er blijft altijd een baan vrij)
function ccFill(r,P,lane){const L=[-1,0,1],pk=a=>a[Math.floor(Math.random()*a.length)];
 const col=()=>pk(['#c9ccd1','#2b2f36','#7b1f24','#1f3b63','#e9e6df','#4a4f3a','#f2c230','#5b6069','#253238','#8a6a42']);
 const mk=(t,x,o)=>Object.assign({t,x,hit:0,c:col(),h:pk([1.42,1.45,1.5,1.62,1.78])},o||{});
 // altijd haalbaar: vlak na een vorige rij ligt het nieuwe gat hooguit één baan naast het vorige gat
 const pv=r.pv&&r.pv.set&&r.pv.free!=null&&r.T-r.pv.T<1.6?r.pv.free:null,near=l=>pv==null||Math.abs(l-pv)<=1;
 let opts=L.filter(l=>l!==lane&&near(l));if(!opts.length)opts=L.filter(near);
 let free=r.forceFree!=null?r.forceFree:pk(opts);
 if(r.k==='one'){let ok=L.filter(l=>l!==r.forceFree&&l!==pv);const at=r.forceFree==null&&pv==null&&Math.random()<.7?lane:ok.includes(lane)&&Math.random()<.6?lane:pk(ok.length?ok:L);r.obs=[mk(Math.random()<.12?'taxi':'car',at)];r.free=pv!=null?pv:null}
 else if(r.k==='sl'&&r.prev&&r.prev.free!=null){const f=r.forceFree!=null?r.forceFree:r.prev.free===0?pk([-1,1]):0;r.free=f;r.obs=L.filter(l=>l!==f).map(l=>mk(Math.random()<.15?'van':'car',l,l===0?{}:{}))}
 else if(r.k==='block'){r.free=free;r.obs=L.filter(l=>l!==free).map(l=>mk('block',l))}
 else if(r.k==='cop'){r.obs=[]}
 else{r.free=free;r.obs=L.filter(l=>l!==free).map(l=>mk(Math.random()<.15?'van':Math.random()<.1?'taxi':'car',l))}
 r.obs.forEach(o=>{if(o.t==='van')o.h=2.1;if(o.t==='taxi'){o.c='#e9e6df';o.h=1.48}});r.set=1}

function carChaseGame(level,car){
 return new Promise(resolve=>{
  car=car||{};const P=ccParams(level),C=ccCourse(P),V=P.v,LV=FLEE_LEVELS[level]||FLEE_LEVELS[2];window.__chase=true;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const body=(typeof CAR_BODIES!=='undefined'&&CAR_BODIES[car.b])||{H:1.45},myH=Math.max(1.15,Math.min(2.2,body.H||1.45)),myC=car.c||'#8a929c';
  const arrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
  let doll='';try{if(typeof dollSvg==='function'&&typeof fitS==='function')doll=dollSvg(fitS().wear,{label:'Jij'})}catch(e){doll=''}
  let side='';try{if(typeof carSvg==='function')side=carSvg(car.b||'hatch',myC,{hl:1})}catch(e){side=''}
  const ov=document.createElement('div');ov.className='chase-ov fl-ov cc-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','ccT');
  ov.innerHTML=`<div class="fl-box cc-box lv${level}"><div class="siren"></div>
   <div class="fl-top"><div class="fl-tt"><h2 id="ccT">Plankgas!</h2><p class="fl-where" id="ccWhere">${esc(car.n||'Je auto')} · rijd ze eruit</p></div><span class="tag lvl${level}">Wegrijden: ${P.label}</span></div>
   <div class="fl-stage cc-stage" id="ccStage"><canvas id="ccCv" aria-label="Achtervolging met de auto: ontwijk verkeer en politie"></canvas>
    <div class="fl-track cc-track" aria-hidden="true"><span class="fl-rail"><i class="fl-done" id="ccDone"></i>${C.exits.map(e=>`<i class="cc-ex" style="left:${Math.min(97,e.z0/C.len*100)}%"></i>`).join('')}<i class="fl-you" id="ccYou"></i></span><b>Kwijt</b></div>
    <div class="cc-mirror" id="ccMir" aria-hidden="true"><span class="cc-mir-in"><i class="cc-cop"></i><i class="cc-cop"></i></span><b id="ccGap">0 m</b></div>
    <div class="cc-spd" aria-hidden="true"><b id="ccSpd">0</b><small>km/u</small></div>
    <div class="cc-pop" id="ccPop"></div>
    <div class="fl-big" id="ccBig">Gas erop!</div>
    <div class="cc-cut" id="ccCut">
     <div class="cc-cut-sky"></div><div class="cc-cut-lamp"></div><div class="cc-cut-st"></div><div class="cc-cut-cops"></div>
     <div class="cc-cut-car" id="ccCar">${side}</div><div class="cc-cut-me">${doll}</div>
     <div class="cc-cut-t"><span>De politie komt eraan</span><b>Instappen!</b></div><span class="cc-cut-skip">Tik om over te slaan</span></div></div>
   <div class="fl-info"><span id="ccHud"></span><span class="fl-keys"><kbd>←</kbd><kbd>→</kbd> sturen · <kbd>↑</kbd>/<kbd>spatie</kbd> nitro · <kbd>↓</kbd> remmen</span><span class="fl-tap">Veeg opzij · omhoog: nitro</span></div>
   <div class="fl-ctl cc-ctl"><button class="fl-b" data-a="-1" aria-label="Naar links">${arrow(-1)}</button><button class="fl-b cc-rem" data-a="b">Rem</button><button class="fl-b fl-j cc-nit" data-a="n">Nitro</button><button class="fl-b" data-a="1" aria-label="Naar rechts">${arrow(1)}</button></div></div>`;
  document.body.appendChild(ov);
  const q=id=>ov.querySelector('#'+id),cv=q('ccCv'),ctx=cv.getContext('2d'),stage=q('ccStage'),big=q('ccBig'),cut=q('ccCut');
  // spelstatus
  let W=0,H=0,F=1,hy=0,cx=0,dpr=1,t=0,last=0,raf=0,done=false,res=null,why='',doneT=0,closed=false,playing=false;
  let dist=0,px=0,lane=0,mul=1,brake=false,nitroT=0,nitro=P.nitro,hits=0,stumT=-1,shake=0,copZ=-P.start,flash=0,popT=0,camX=0,taken=0;
  const CB=6.4;let CH=2.7;const cops=[];
  const fit=()=>{const r=stage.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(200,r.width);H=Math.max(180,r.height);
   cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);F=Math.min(H*1.05,W*1.25);CH=H>W*1.2?3.5:2.7;hy=Math.max(H*.26,H*.85-CH*F/CB);cx=W/2};
  fit();const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(stage);else window.addEventListener('resize',fit);
  const P3=(X,Y,z)=>{const D=Math.max(.35,z+CB),s=F/D;return {x:cx+(X-camX)*s,y:hy+(CH-Y)*s,s}};
  const v=()=>V*mul;
  // ---------- invoer ----------
  const steer=d=>{if(done||!playing)return;const n=Math.max(-1,Math.min(1,lane+d));if(n!==lane){lane=n;try{SFX.card()}catch(e){}}};
  const boost=()=>{if(done||!playing||nitroT>0||nitro<=0)return;nitro--;nitroT=1.6;try{SFX.spin()}catch(e){}pop('Nitro!','n')};
  const setBrake=b=>{brake=!!b&&!done&&playing;q('ccStage').classList.toggle('braking',brake)};
  const key=e=>{const k=e.code;let hit=true;
   if(!playing&&!done&&(k==='Space'||k==='Enter'||k.startsWith('Arrow'))){skip();e.preventDefault();return}
   if(k==='ArrowLeft'||k==='KeyA'){if(!e.repeat)steer(-1)}else if(k==='ArrowRight'||k==='KeyD'){if(!e.repeat)steer(1)}
   else if(k==='ArrowUp'||k==='KeyW'||k==='Space'){if(!e.repeat)boost()}else if(k==='ArrowDown'||k==='KeyS')setBrake(true)
   else if(k==='Enter'&&done)close();else hit=false;if(hit)e.preventDefault()};
  const keyUp=e=>{if(e.code==='ArrowDown'||e.code==='KeyS')setBrake(false)};
  document.addEventListener('keydown',key);document.addEventListener('keyup',keyUp);
  ov.querySelectorAll('.fl-b').forEach(b=>{const a=b.dataset.a;
   b.addEventListener('pointerdown',e=>{e.preventDefault();if(!playing&&!done){skip();return}if(a==='b')setBrake(true);else if(a==='n')boost();else steer(+a)});
   if(a==='b'){['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>setBrake(false)))}});
  let sw=null;
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('.fl-b'))return;e.preventDefault();if(done){close();return}if(!playing){skip();return}sw={x:e.clientX,y:e.clientY,used:false}});
  stage.addEventListener('pointermove',e=>{if(!sw||sw.used)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;
   if(Math.abs(dx)>24&&Math.abs(dx)>Math.abs(dy)){steer(dx<0?-1:1);sw.used=true}else if(dy<-28){boost();sw.used=true}else if(dy>28){setBrake(true);sw.used='b'}});
  stage.addEventListener('pointerup',e=>{if(!sw)return;if(sw.used==='b')setBrake(false);else if(!sw.used){const r=stage.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width;if(fx<.4)steer(-1);else if(fx>.6)steer(1);else boost()}sw=null});
  stage.addEventListener('pointercancel',()=>{if(sw&&sw.used==='b')setBrake(false);sw=null});
  // ---------- tekenhulpjes ----------
  const glow=(x,y,r,col,a)=>{if(r<1||a<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
  const quad=(a,b,c,d)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath()};
  const floorQ=(x1,x2,z1,z2)=>quad(P3(x1,0,z1),P3(x2,0,z1),P3(x2,0,z2),P3(x1,0,z2));
  const wallQ=(X,z1,z2,y1,y2)=>quad(P3(X,y1,z1),P3(X,y2,z1),P3(X,y2,z2),P3(X,y1,z2));
  const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
  const fade=z=>Math.max(0,Math.min(1,1-(z-40)/60));
  // zijstraten die nu in beeld zijn (gat in de huizenrij)
  const holes=sd=>C.exits.filter(e=>e.side===sd).map(e=>[e.z0-dist-5.5,e.z0-dist+5.5]).filter(h=>h[1]>-CB&&h[0]<CC_FAR);
  function scene(){const near=-CB+.4,far=CC_FAR,sp=v();
   // lucht met stadsgloed
   const g=ctx.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#05060a');g.addColorStop(1,'#1a1420');ctx.fillStyle=g;ctx.fillRect(0,0,W,hy+2);
   glow(cx,hy,W*.6,'255,120,60',.12);
   // skyline in de verte
   ctx.fillStyle='#0b0b10';for(let i=0;i<26;i++){const bx=((i*97+13)%W),bw=18+hash(i)*44,bh=20+hash(i+9)*70;ctx.fillRect(bx-bw/2,hy-bh,bw,bh+2)}
   ctx.fillStyle='rgba(255,190,120,.35)';for(let i=0;i<60;i++){const bx=(i*53+7)%W,by=hy-6-hash(i+3)*60;if(hash(i+5)<.5)ctx.fillRect(bx,by,2,2)}
   // stoep, weg en natte glans
   ctx.fillStyle='#16171b';floorQ(-CC_WALK,CC_WALK,near,far);ctx.fill();
   const rg=ctx.createLinearGradient(0,P3(0,0,far).y,0,H);rg.addColorStop(0,'#0c0d10');rg.addColorStop(1,'#1d1f25');ctx.fillStyle=rg;floorQ(-CC_ROAD,CC_ROAD,near,far);ctx.fill();
   // stoeprand
   [-1,1].forEach(sd=>{ctx.fillStyle='#2b2d33';floorQ(sd*CC_ROAD-.12,sd*CC_ROAD+.12,near,far);ctx.fill()});
   // dwarsvoegen in het asfalt die meeschuiven (snelheidsgevoel)
   ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;ctx.beginPath();for(let k=Math.ceil(dist/2.5)*2.5;k<dist+60;k+=2.5){const z=k-dist;if(z<near)continue;const a=P3(-CC_ROAD,0,z),b=P3(CC_ROAD,0,z);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}ctx.stroke();
   // baanstrepen
   [-.5,.5].forEach(l=>{const X=l*CC_LW;ctx.fillStyle='rgba(235,235,225,.55)';for(let k=Math.floor(dist/9)*9;k<dist+far;k+=9){const z1=k-dist,z2=z1+3.4;if(z2<near)continue;floorQ(X-.07,X+.07,Math.max(near,z1),z2);ctx.fill()}});
   // pijl op de weg en bord voor een zijstraat
   C.exits.forEach(e=>{const z=e.z0-dist;if(z<near-10||z>far)return;const X=e.side*CC_LW;
    if(z-9>near){ctx.fillStyle='rgba(120,255,170,.5)';const a=P3(X,0,z-11),b=P3(X+e.side*.9,0,z-8),c=P3(X,0,z-9),d=P3(X-e.side*.15,0,z-9.4);quad(a,b,c,d);ctx.fill();floorQ(X-.12,X+.12,z-15,z-10);ctx.fill()}
    const zs=z-16;if(zs>near){const p=P3(e.side*(CC_ROAD+.9),0,zs),top=P3(e.side*(CC_ROAD+.9),3.2,zs);ctx.strokeStyle='#3a3d44';ctx.lineWidth=Math.max(1,p.s*.08);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(top.x,top.y);ctx.stroke();
     const s=top.s,w=s*1.6,h=s*.75;ctx.fillStyle=e.taken?'#1d5c36':'#13803f';ctx.fillRect(top.x-w/2,top.y-h,w,h);ctx.strokeStyle='#e9fff1';ctx.lineWidth=Math.max(1,s*.06);ctx.strokeRect(top.x-w/2+s*.06,top.y-h+s*.06,w-s*.12,h-s*.12);
     if(s>9){ctx.fillStyle='#e9fff1';ctx.font=`800 ${Math.round(s*.28)}px var(--f-head),sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText((e.side<0?'← ':'')+'Steeg'+(e.side>0?' →':''),top.x,top.y-h/2)}}});
   // huizen met ramen, met een gat bij elke zijstraat
   [-1,1].forEach(sd=>{const X=sd*CC_WALK,hs=holes(sd).sort((a,b)=>a[0]-b[0]);let z=near;const segs=[];hs.forEach(h=>{if(h[0]>z)segs.push([z,Math.min(far,h[0])]);z=Math.max(z,h[1])});if(z<far)segs.push([z,far]);
    segs.forEach(([z1,z2])=>{const a=P3(X,0,z1),b=P3(X,0,z2);const wg=ctx.createLinearGradient(a.x,0,b.x,0);wg.addColorStop(0,'#2a2326');wg.addColorStop(1,'#0c0b0e');ctx.fillStyle=wg;wallQ(X,z1,z2,0,11);ctx.fill()});
    // zijstraat: asfalt naar opzij en de koppen van de huizen
    hs.forEach(([z1,z2])=>{ctx.fillStyle='#121318';quad(P3(X,0,z1),P3(X+sd*16,0,z1),P3(X+sd*16,0,z2),P3(X,0,z2));ctx.fill();
     ctx.fillStyle='#19161a';[z1,z2].forEach(zz=>{if(zz>near){quad(P3(X,0,zz),P3(X+sd*16,0,zz),P3(X+sd*16,11,zz),P3(X,11,zz));ctx.fill()}});
     const m=P3(X+sd*6,1.4,(z1+z2)/2);glow(m.x,m.y,m.s*3,'90,255,160',.14)});
    // ramen
    for(let k=Math.floor((dist-8)/5);k*5<dist+far;k++){const zb=k*5-dist;if(zb+5<near)continue;if(hs.some(h=>zb+4>h[0]&&zb<h[1]))continue;
     for(let fl=0;fl<3;fl++){const n=k*7+fl+(sd>0?3:0),lit=hash(n)<.28,y1=2.6+fl*2.7,z1=zb+1,z2=zb+3.2;if(z2<near)continue;
      ctx.fillStyle=lit?`rgba(255,190,110,${.5*fade(z1)+.12})`:'#0a0a0c';wallQ(X,z1,z2,y1,y1+1.5);ctx.fill();
      if(lit&&hash(n+1)<.3){ctx.fillStyle='rgba(120,200,255,.25)';wallQ(X,z1,z2,y1,y1+1.5);ctx.fill()}}
     // neon bij sommige winkels
     if(hash(k*3+(sd>0?1:0))<.18&&zb>near){const c=P3(X,1.6,zb+2.5),col=hash(k)<.5?'255,61,140':'90,200,255';ctx.fillStyle=`rgba(${col},.85)`;const a=P3(X,1.4,zb+1.2),b=P3(X,1.8,zb+3.8);quad(a,P3(X,1.8,zb+1.2),b,P3(X,1.4,zb+3.8));ctx.fill();glow(c.x,c.y,c.s*2.2,col,.22*fade(zb))}}});
   // lantaarns met oranje plassen licht en strepen weerspiegeling op de natte weg
   const ls=16;for(let k=Math.floor((dist-8)/ls);k*ls<dist+far;k++){const z=k*ls-dist+6;if(z<near||z>far)continue;const sd=k%2?1:-1,fa=fade(z);
    const base=P3(sd*(CC_ROAD+.6),0,z),hd=P3(sd*(CC_ROAD-.8),6.2,z),top=P3(sd*(CC_ROAD+.6),6.4,z);ctx.strokeStyle='#26282d';ctx.lineWidth=Math.max(1,base.s*.1);ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(top.x,top.y);ctx.lineTo(hd.x,hd.y);ctx.stroke();
    ctx.save();ctx.globalCompositeOperation='lighter';glow(hd.x,hd.y,hd.s*2.4,'255,150,60',.35*fa+.05);
    const rf=P3(sd*(CC_ROAD-1.4),0,z),rl=Math.min(H-rf.y,rf.s*2.4);if(rl>2){const lg=ctx.createLinearGradient(0,rf.y-rf.s*.2,0,rf.y+rl);lg.addColorStop(0,`rgba(255,150,70,${.22*fa})`);lg.addColorStop(1,'rgba(255,150,70,0)');ctx.fillStyle=lg;ctx.fillRect(rf.x-rf.s*.35,rf.y-rf.s*.2,rf.s*.7,rl)}
    ctx.restore()}
   // snelheidslijnen bij nitro
   if(nitroT>0&&!reduce){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(169,220,255,.35)';ctx.lineWidth=1.4;ctx.beginPath();
    for(let i=0;i<26;i++){const a=hash(i+Math.floor(t*20))*Math.PI*2,r1=Math.min(W,H)*(.25+hash(i*3)*.2),r2=r1+40+hash(i+7)*90;ctx.moveTo(cx+Math.cos(a)*r1,hy+Math.sin(a)*r1*.7);ctx.lineTo(cx+Math.cos(a)*r2,hy+Math.sin(a)*r2*.7)}ctx.stroke();ctx.restore()}}
  // auto van achteren: carRear(x-midden in m, z, kleur, hoogte, soort)
  function carRear(X,z,col,h,kind,o){const s=P3(X,0,z);if(s.s<1.4)return;let a=1;if(z>CC_REVEAL-14)a=Math.max(0,(CC_REVEAL-z)/14);if(z<-1.5)a=Math.max(0,1+(z+1.5)/3.5);if(a<=0)return;
   const w=kind==='van'?2:1.82,isCop=kind==='cop';ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);if(o&&o.rot)ctx.rotate(o.rot);
   const R=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(x,-y-hh,ww,hh)};
   ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(0,0,w*.62,.16,0,0,7);ctx.fill();
   R(-w/2+.08,0,.36,.34,'#0a0a0b');R(w/2-.44,0,.36,.34,'#0a0a0b');
   const bodyH=h*.55,cab=h-bodyH-.12;
   R(-w/2,.14,w,bodyH,isCop?'#eef1f4':col);
   ctx.fillStyle=isCop?'#e6e9ee':col;ctx.beginPath();ctx.moveTo(-w/2+.08,-.14-bodyH);ctx.lineTo(w/2-.08,-.14-bodyH);ctx.lineTo(w/2-.3,-.14-bodyH-cab);ctx.lineTo(-w/2+.3,-.14-bodyH-cab);ctx.closePath();ctx.fill();
   const wg=ctx.createLinearGradient(0,-.14-bodyH-cab,0,-.14-bodyH);wg.addColorStop(0,'#3b4656');wg.addColorStop(1,'#0b0f15');ctx.fillStyle=wg;ctx.beginPath();ctx.moveTo(-w/2+.2,-.2-bodyH);ctx.lineTo(w/2-.2,-.2-bodyH);ctx.lineTo(w/2-.36,-.1-bodyH-cab);ctx.lineTo(-w/2+.36,-.1-bodyH-cab);ctx.closePath();ctx.fill();
   R(-w/2,.14+bodyH*.62,w,.05,'rgba(255,255,255,.18)');R(-w/2,.14,w,.12,'rgba(0,0,0,.45)');
   if(isCop){for(let i=0;i<8;i++)R(-w/2+i*w/8,.3,w/8,.14,i%2?'#1f4fbf':'#e8571f');R(-.38,.52,.76,.12,'#1d2c5a')}
   if(kind==='taxi'){R(-.22,h,.44,.14,'#f2c230')}
   R(-.24,.3,.48,.13,'#f4f1e2');
   const br=(o&&o.brake)?1:0;R(-w/2+.06,.14+bodyH*.55,.38,.16,br?'#ff2a3d':'#b3121f');R(w/2-.44,.14+bodyH*.55,.38,.16,br?'#ff2a3d':'#b3121f');
   ctx.restore();
   const tl=P3(X,.14+bodyH*.6,z);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;[-1,1].forEach(sd=>{const lx=tl.x+sd*(w/2-.25)*tl.s;glow(lx,tl.y,tl.s*(br?.9:.55),'255,30,50',br?.55:.35);
    if(z>0){const rl=Math.min(H-tl.y,tl.s*1.8);const lg=ctx.createLinearGradient(0,s.y,0,s.y+rl);lg.addColorStop(0,'rgba(255,40,60,.22)');lg.addColorStop(1,'rgba(255,40,60,0)');ctx.fillStyle=lg;ctx.fillRect(lx-tl.s*.12,s.y,tl.s*.24,rl)}});
   if(isCop||(o&&o.bar)){const top=P3(X,h+.1,z),on=reduce?1:Math.floor(t*7+(o&&o.ph||0))%2;
    ctx.globalCompositeOperation='source-over';ctx.fillStyle=on?'#ff3d52':'#5a1620';ctx.fillRect(top.x-top.s*.5,top.y-top.s*.12,top.s*.48,top.s*.12);ctx.fillStyle=on?'#1d2c5a':'#4d7dff';ctx.fillRect(top.x+top.s*.02,top.y-top.s*.12,top.s*.48,top.s*.12);
    ctx.globalCompositeOperation='lighter';glow(top.x+(on?-1:1)*top.s*.25,top.y,top.s*2.2,on?'255,61,82':'77,125,255',.5)}
   // knipperlicht: deze politieauto wil naar jouw baan
   if(o&&o.blink&&Math.floor(t*8)%2){const bx=tl.x+Math.sign(o.blink)*(w/2-.1)*tl.s;glow(bx,tl.y,tl.s*1.1,'255,180,40',.9)}
   ctx.restore()}
  function barrier(X,z,o){const s=P3(X,0,z);if(s.s<1.4)return;let a=1;if(z>CC_REVEAL-14)a=Math.max(0,(CC_REVEAL-z)/14);if(z<-1.5)a=Math.max(0,1+(z+1.5)/3.5);if(a<=0)return;
   ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);const R=(x,y,ww,hh,c)=>{ctx.fillStyle=c;ctx.fillRect(x,-y-hh,ww,hh)};
   ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(0,0,1.6,.14,0,0,7);ctx.fill();
   R(-1.5,0,3,.82,'#d9dde2');for(let i=0;i<6;i++)R(-1.5+i*.5,.3,.5,.3,i%2?'#f4f4f4':'#e0313f');R(-1.5,.78,3,.06,'#9aa1aa');
   R(-.05,.84,.1,.8,'#3a3d44');ctx.font='800 .26px sans-serif';R(-.62,1.5,1.24,.38,'#1d2c5a');ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('POLITIE',0,-1.69);
   ctx.restore();const top=P3(X,1.95,z),on=reduce?1:Math.floor(t*6+X)%2;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=a;glow(top.x,top.y,top.s*2.6,on?'255,61,82':'77,125,255',.5);ctx.restore()}
  function drawMe(){const s=P3(px*CC_LW,0,0);const lean=(lane-px)*.12+(stumT>=0?Math.sin(stumT*28)*.08:0);
   carRear(px*CC_LW,0,myC,myH,'me',{rot:lean,brake:brake});
   // uitlaatvlam bij nitro
   if(nitroT>0){ctx.save();ctx.globalCompositeOperation='lighter';const e=P3(px*CC_LW+.5,.25,-.3),f=reduce?1:.7+Math.random()*.5;glow(e.x,e.y,e.s*.7*f,'120,170,255',.9);glow(e.x,e.y,e.s*.35*f,'255,240,220',.9);const e2=P3(px*CC_LW-.5,.25,-.3);glow(e2.x,e2.y,e2.s*.7*f,'120,170,255',.9);ctx.restore()}
   // koplampen van jezelf op de weg vooruit
   ctx.save();ctx.globalCompositeOperation='lighter';const hl=P3(px*CC_LW,0,9);glow(hl.x,hl.y,hl.s*4,'255,240,200',.08);ctx.restore()}
  function overlays(){const gap=dist-copZ,close=Math.max(0,Math.min(1,1-(gap-4)/32))+(done&&res===false?1:0),ph=reduce?0:Math.floor(t*(5+close*5))%2,k=.08+.42*Math.min(1,close);
   glow(0,H,H*(.6+close*.3),ph?'255,61,82':'77,125,255',k);glow(W,H,H*(.6+close*.3),ph?'77,125,255':'255,61,82',k);
   if(flash>0){ctx.fillStyle=`rgba(255,255,255,${flash*.5})`;ctx.fillRect(0,0,W,H)}
   const vg=ctx.createRadialGradient(cx,H*.55,Math.min(W,H)*.35,cx,H*.55,Math.max(W,H)*.85);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.62)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
   if(done&&res===true){const a=Math.min(1,(t-doneT)/1.2);ctx.save();ctx.globalCompositeOperation='lighter';glow(cx,hy,Math.max(W,H)*(.5+a*.5),'90,255,160',a*.25);ctx.restore()}
   if(done&&res===false){ctx.fillStyle=`rgba(5,6,8,${Math.min(.5,(t-doneT)*.8)})`;ctx.fillRect(0,0,W,H)}}
  function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
   if(shake>0&&!reduce)ctx.translate((Math.random()-.5)*shake*16,(Math.random()-.5)*shake*10);
   scene();const L=[];
   C.rows.forEach(r=>{if(!r.set)return;const z=r.z0+r.u*t-dist;if(z>CC_FAR||z<-CB+.5)return;r.obs.forEach(o=>L.push([z,o]))});
   cops.forEach(c=>L.push([c.z,c]));
   // eindscène: politieauto's rijden je klem
   if(done&&res===false){const k=Math.min(1,(t-doneT)/.8);L.push([1.4-k*.6,{t:'cop',x:px-1+.45*k,ph:1}]);L.push([1.4-k*.6,{t:'cop',x:px+1-.45*k,ph:0}])}
   L.sort((a,b)=>b[0]-a[0]);let me=false;
   L.forEach(([z,o])=>{if(!me&&z<0){drawMe();me=true}
    if(o.t==='block')barrier(o.x*CC_LW,z,o);else carRear((o.xs!=null?o.xs:o.x)*CC_LW,z,o.t==='cop'?'#eef1f4':o.c,o.t==='cop'?1.5:o.h,o.t,{rot:o.hit?(o.rotK||.3)*Math.min(1,(t-o.hitT)*3):0,brake:o.t!=='cop'&&z<16,blink:o.blink,ph:o.ph||0})});
   if(!me)drawMe();overlays()}
  // ---------- HUD ----------
  let hudH='';const hud=()=>{const p=Math.min(1,dist/C.len),gap=Math.max(0,dist-copZ);q('ccYou').style.left=(p*100)+'%';q('ccDone').style.width=(p*100)+'%';
   q('ccGap').textContent=Math.round(gap)+' m';q('ccMir').classList.toggle('near',gap<16);q('ccMir').classList.toggle('mid',gap>=16&&gap<30);q('ccSpd').textContent=Math.round(v()*3.6*1.55);
   const left=Math.max(0,P.hits-hits),h=`Klappen: <b class="${left<=0?'no':''}">${'●'.repeat(left)}<i>${'○'.repeat(Math.min(P.hits,hits))}</i></b> · Nitro: <b class="nit">${'⚡'.repeat(Math.max(0,nitro))||'–'}</b>`;
   if(h!==hudH){hudH=h;q('ccHud').innerHTML=h}const nb=ov.querySelector('.cc-nit');if(nb)nb.disabled=done||nitro<=0||nitroT>0;
   if(nb)nb.textContent=nitroT>0?'Nitro…':nitro>0?'Nitro ×'+nitro:'Op'};
  function pop(txt,cls){const el=q('ccPop');el.textContent=txt;el.className='cc-pop on '+(cls||'');popT=1.1}
  // ---------- spelverloop ----------
  function hit(o,why2){if(window.__ccLog)window.__ccLog.push({t:+t.toFixed(2),why:why2,ot:o&&o.t,ox:o&&o.x,px:+px.toFixed(2),lane});if(o)o.hit=1,o.hitT=t,o.rotK=(o.x>=px?1:-1)*(.25+Math.random()*.2);hits++;mul=.38;stumT=0;shake=.45;flash=.35;try{SFX.lose()}catch(e){}
   stage.classList.remove('bump');void stage.offsetWidth;stage.classList.add('bump');pop(why2||'Boem!','bad');if(hits>P.hits)finish(false,'kapot')}
  function step(dt){t+=dt;if(done){doneT=doneT||t;if(res===true){dist+=V*1.3*dt;if(taken===0)px+=(Math.sign(px||1)*.9)*dt}return}
   // snelheid: nitro, remmen, herstellen na een botsing
   const target=nitroT>0?1.5:brake?.55:1;mul+=(target-mul)*Math.min(1,dt*(target>mul?2.2:3.2));if(nitroT>0)nitroT=Math.max(0,nitroT-dt);
   const prev=dist;dist+=v()*dt;copZ+=V*P.copK*dt;
   const dx=lane-px,ls=dt/.14;px=Math.abs(dx)<=ls?lane:px+Math.sign(dx)*ls;camX+=(px*CC_LW*.55-camX)*Math.min(1,dt*5);
   if(stumT>=0){stumT+=dt;if(stumT>.6)stumT=-1}shake=Math.max(0,shake-dt*1.6);flash=Math.max(0,flash-dt*2.5);
   if(popT>0){popT-=dt;if(popT<=0)q('ccPop').classList.remove('on')}
   // verkeer en versperringen
   for(const r of C.rows){const z1=r.z0+r.u*t-dist;
    if(!r.set&&z1<CC_REVEAL){ccFill(r,P,lane);if(r.k==='cop')r.spawn=1}
    if(r.k==='cop'&&r.spawn===1&&z1<CC_REVEAL*.35){r.spawn=2;const from=lane===0?(Math.random()<.5?-1:1):0;cops.push({t:'cop',x:from,xs:from,z:-9,st:'in',tgt:lane,blink:0,ph:Math.random()*2})}
    if(!r.obs)continue;
    for(const o of r.obs){if(o.hit)continue;if(Math.abs(z1)<CC_CL*.85&&Math.abs(px-o.x)<P.hitW){hit(o,o.t==='block'?'Tegen de versperring!':'Boem!');if(done)return}}}
   // politieauto's die je klem willen rijden: van achteren naast je, knipperen naar jouw baan, dan erin
   for(let i=cops.length-1;i>=0;i--){const c=cops[i];let ws=V;
    if(c.st==='in'){ws=V+8;if(c.z>=.4){c.st='tele';c.tt=0;c.tgt=lane;c.blink=c.tgt-c.x;try{SFX.tick()}catch(e){}pop('Politie naast je!','cop')}}
    else if(c.st==='tele'){c.tt+=dt;if(c.tt>.8){c.st='sw';c.tt=0;c.x0=c.xs}}
    else if(c.st==='sw'){c.tt+=dt;const k=Math.min(1,c.tt/.38);c.xs=c.x0+(c.tgt-c.x0)*k;c.blink=0;if(k>=1){c.st='out';c.x=c.tgt}}
    else ws=V-9;
    c.z+=(ws-v())*dt;
    if(!c.hit&&c.st!=='in'&&Math.abs(c.z)<CC_CL*.9&&Math.abs(px-c.xs)<P.hitW){c.hit=1;c.hitT=t;c.rotK=(c.xs>=px?1:-1)*.2;hit(null,'Klem!');if(done)return}
    if(c.z<-16||c.z>90)cops.splice(i,1)}
   // zijstraten: zit je in de buitenste baan aan die kant als hij voorbijkomt, dan schiet je erin
   for(const e of C.exits){const z0=e.z0-prev,z1=e.z0-dist;if(e.passed||!(z0>0&&z1<=0))continue;e.passed=1;
    if(Math.abs(px-e.side)<.45){e.taken=1;taken++;copZ-=22;nitro=Math.min(P.nitro+2,nitro+1);flash=.25;try{SFX.win(2)}catch(e2){}pop('Zijstraat! Ze zijn je even kwijt','ok')}}
   if(dist-copZ<=2.5){finish(false,'klem');return}
   if(dist>=C.len)finish(true)}
  let ft=0;
  function frame(now){if(closed)return;const ts=window.__ccTS||1;let acc=Math.min(.25*ts,Math.max(0,(now-last)/1000)*ts);last=now;if(playing||done)while(acc>1e-4){const h=Math.min(1/60,acc);step(h);acc-=h}
   const a=performance.now();draw();ft=ft*.9+(performance.now()-a)*.1;hud();raf=requestAnimationFrame(frame)}
  function finish(ok,w){if(done)return;done=true;res=ok;why=w||'';doneT=t;brake=false;document.removeEventListener('keydown',key);document.removeEventListener('keyup',keyUp);
   const box=ov.querySelector('.fl-box');box.classList.add(ok?'won':'lost');
   const lose=w==='kapot'?'Motor kapot!':'Klem gereden!';q('ccT').textContent=ok?'Ontkomen!':lose;
   q('ccWhere').textContent=ok?(taken?'Via de steeg en weg. Ze zoeken nog steeds.':'Plankgas de stad uit. Ze zijn je kwijt.'):w==='kapot'?'De motor rookt en stopt. Ze trekken je uit de auto.':'Twee politieauto\'s zetten je klem.';
   big.textContent=ok?'Ontkomen!':lose;big.className='fl-big '+(ok?'ok':'no');ov.querySelectorAll('.fl-b').forEach(b=>{b.disabled=true});
   const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);try{ok?SFX.win(3):SFX.lose()}catch(e){}
   setTimeout(close,1700)}
  function close(){if(closed||!done)return;closed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',fit);
   ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(res===true)},220)}
  ov.addEventListener('click',e=>{if(done&&!e.target.closest('.fl-ctl'))close()});
  // ---------- filmpje vooraf ----------
  let cutT=0;function start(){if(playing||done)return;playing=true;cut.classList.add('gone');setTimeout(()=>cut.remove(),400);big.textContent='Gas erop!';big.className='fl-big';last=performance.now();
   try{SFX.spin()}catch(e){}setTimeout(()=>{if(!done)big.classList.add('gone')},900)}
  function skip(){clearTimeout(cutT);start()}
  big.classList.add('gone');
  if(reduce)cutT=setTimeout(start,900);
  else{cut.classList.add('play');setTimeout(()=>{try{SFX.tick()}catch(e){}},1300);setTimeout(()=>{try{SFX.spin()}catch(e){}},1700);cutT=setTimeout(start,2900)}
  ov._cc=()=>({dist,len:C.len,px,lane,hits,maxHits:P.hits,gap:dist-copZ,done,res,why,playing,nitro,nitroT,mul,v:v(),t,P,ft,
   rows:C.rows.filter(r=>r.set&&r.obs).map(r=>({z:r.z0+r.u*t-dist,obs:r.obs.map(o=>({x:o.x,t:o.t,hit:o.hit}))})),
   cops:cops.map(c=>({z:c.z,x:c.xs,st:c.st,tgt:c.tgt})),exits:C.exits.map(e=>({z:e.z0-dist,side:e.side,taken:e.taken})),
   act:{steer,boost,brake:setBrake,skip}});
  last=performance.now();draw();raf=requestAnimationFrame(frame);
 })}
