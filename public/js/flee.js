// Vluchtspel "Rennen!": een korte achtervolging in 2,5D. Je rent door een steeg (of door een gebouw) naar de uitgang,
// de agent zit je op de hielen. Wissel van baan met ← → (of A/D, vegen, de knoppen) en spring over lage dingen
// met ↑, W of spatie. Struikel je vaker dan je mag, dan heeft de agent je. Haal je de uitgang, dan ben je weg.
// Moeilijkheid komt uit FLEE_LEVELS (data.js):
//   speed  = tempo van de achtervolging en hoe kort de obstakels op elkaar volgen
//   zone   = hoeveel ruimte je krijgt: minder dubbele blokkades, ruimere botsing, makkelijker springen
//   time, hits = lengte van de route · miss = hoe vaak je mag struikelen
//   shrink/accel = per voorbijgerend obstakel krapper en sneller · drift = bewakers die met je mee schuiven
//   where  = de plek: buiten in een steeg, in de drukte, binnen in een gang, of alles op slot
// Conditie, Snelheid, je familie, je woning, je vervoer, je outfit en je lidmaatschap maken het makkelijker (via fleeParams).
// Elke achtervolging loopt op van makkelijk naar moeilijk: eerst losse obstakels met ruimte ertussen, dan het gewone werk
// (hekken, auto's, mensen die oversteken), en in de eindsprint dicht op elkaar: slalom door twee rijen, overstekers en bewakers.
// fleeGame(level) geeft een Promise met true (ontkomen) of false (gepakt).
function fleeParams(level){
  const L=FLEE_LEVELS[level]||FLEE_LEVELS[2],k=(S.skills&&S.skills.conditie)||0,sp=(S.skills&&S.skills.speed)||0;
  return {level,label:L.label,hits:L.hits,miss:L.miss,time:L.time,shrink:L.shrink||1,accel:L.accel||1,drift:!!L.drift,
    zone:Math.min(.42,L.zone*(1+k*SK.conditie.zone+furnFx('zone')+famPerk('flee')+gearFx('flee')+(typeof fitFx==='function'?fitFx('flee'):0))*(1+tierK())),speed:L.speed*(1-sp*SK.speed.mark)};
}
// Van de vluchtparameters naar de achtervolging
function fleeRun(P){
  const len=Math.max(0,Math.min(1,(P.zone-.08)/.34)),gap=Math.max(.62,Math.min(1.05,1.02-(P.speed-.9)*.32));
  return {len,gap,v:10+P.speed*3,level:P.level,rows:Math.max(9,Math.round(((P.time-1.5)/gap+(P.hits-3))*1.35)),
    p2:Math.max(.06,Math.min(.5,.56-len*.5)),hit:.95-len*.3,jump:.3+(1-len)*.28,lowP:.22+len*.15,
    miss:P.miss,drift:P.drift,accel:Math.pow(P.accel||1,1/3),shrink:Math.pow(P.shrink||1,1/3),fences:P.level<=3?2:1};
}
// De plek per moeilijkheid: buiten (1-2) of binnen (3-5)
const FL_SCENE={
 1:{out:1,exit:'Steeg',tall:['kliko','fiets','agent','kliko','container'],low:['pallet','zakken'],cross:['hond'],fence:'hek',run:'Ren de steeg uit!',
    win:'Je schiet de steeg in. Weg ben je.',lose:'De agent grijpt je bij je jas.'},
 2:{out:1,busy:1,exit:'Zijstraat',tall:['mens','mens','scooter','agent','container'],low:['kratten','afzetting','zakken'],cross:['mens','hond','mens'],fence:'hek',run:'Door de drukte!',
    win:'Je duikt een zijstraat in en verdwijnt tussen de mensen.',lose:'Een agent tackelt je tussen de mensen.'},
 3:{out:0,exit:'Uitgang',tall:['dozen','agent','kast'],low:['kar','pallet','bord'],cross:['schoonmaker'],fence:'lint',run:'Naar de uitgang!',
    win:'Door de achterdeur naar buiten. Weg ben je.',lose:'Twee agenten klemmen je in de gang.'},
 4:{out:0,office:1,door:1,exit:'Deur',tall:['kast','agent','dozen','printer'],low:['bureau','kar','stoel','bord'],cross:['mens','schoonmaker'],dr:'agent',fence:'lint',run:'Langs de agent!',
    win:'Je glipt langs de agent de deur uit.',lose:'De agent bij de deur heeft je.'},
 5:{out:0,alarm:1,exit:'Nooduitgang',tall:['bewaker','kast','dozen','printer'],low:['kar','bord','stoel'],cross:['bewaker'],fence:'lint',run:'Zoek de nooduitgang!',
    win:'Door de nooduitgang en weg. Niemand snapt hoe.',lose:'De beveiliging drukt je tegen de grond.'}};
// w = breedte in banen (voor de botsing), h = hoogte in meters, low = je kunt erover springen
const FL_OBS={kliko:{w:.5,h:1.15},fiets:{w:.62,h:1.05},agent:{w:.46,h:1.86},mens:{w:.44,h:1.76},scooter:{w:.52,h:1.18},
 dozen:{w:.62,h:1.62},kast:{w:.56,h:1.96},bewaker:{w:.46,h:1.9},auto:{w:1.78,h:1.5},
 pallet:{w:.78,h:.48,low:1},kratten:{w:.8,h:.62,low:1},kar:{w:.62,h:.56,low:1},bureau:{w:.9,h:.76,low:1},
 hek:{w:3.4,h:.82,low:1},lint:{w:3.4,h:.9,low:1},
 container:{w:.86,h:1.45},printer:{w:.62,h:1.2},schoonmaker:{w:.5,h:1.8},
 zakken:{w:.72,h:.5,low:1},afzetting:{w:.82,h:.85,low:1},bord:{w:.44,h:.66,low:1},stoel:{w:.52,h:.95,low:1},hond:{w:.5,h:.55,low:1}};
const FL_LANE=1.5,FL_HALF=2.75,FL_FAR=74,FL_PW=.42,FL_JUMP=.6,FL_REVEAL=46;
// De route: rijen obstakels op afstand z (meter); er blijft altijd een baan vrij of je kunt erover springen
// De route: rijen obstakels op afstand z (meter). Welke baan dicht is, wordt pas bepaald als een rij uit de mist komt,
// op basis van waar jij dan loopt: stilstaan helpt dus niet, maar je ziet het altijd ruim op tijd aankomen.
// Drie fases: opwarmen (losse obstakels, veel ruimte), het gewone werk, en de eindsprint (dicht op elkaar, slalom, overstekers).
// De tijd tussen twee rijen gaat van ±1,05× naar ±0,6× het tempo van het niveau, maar nooit onder een halve seconde.
function fleeCourse(R,SC){
  const rows=[],N=R.rows;let z=R.v*1.15+3,fence=0,vi=R.v,sprint=-1;
  const push=(k,ph,gt)=>{const r={z,k,ph,obs:[],passed:0,set:0,low:Math.random()<R.lowP,extra:Math.random()<.45,prev:rows[rows.length-1]||null};rows.push(r);
    vi*=R.accel;z+=vi*gt*(.9+Math.random()*.2);return r};
  const wpick=W=>{let t=0;for(const k in W)t+=W[k];let x=Math.random()*t;for(const k in W){x-=W[k];if(x<=0&&W[k]>0)return k}return 'one'};
  for(let i=0;i<N;i++){const d=N>1?i/(N-1):0,ph=d<.3?0:d<.68?1:2,last=i===N-1,gt=Math.max(.5,R.gap*(1.05-.43*d));let k;
    if(ph===2&&sprint<0)sprint=rows.length;
    if(SC.door&&last)k='door';
    else if(ph===0)k=i>0&&Math.random()<R.p2*.5?'two':'one';
    else if(ph===1)k=wpick({one:.34,two:R.p2+.16,fence:i>1&&fence<R.fences?.14:0,cross:.14,drift:R.drift?.3:0});
    else k=wpick({one:.14,two:.3+R.p2,sl:i<N-2?.26:0,cross:.16,drift:R.drift||R.level>=4?.22:0,fence:fence<R.fences?.08:0});
    if(k==='fence')fence++;
    if(k==='two'&&SC.out&&Math.random()<.32)k='auto';
    // slalom: twee rijen vlak na elkaar, het gat schuift één baan op
    if(k==='sl'){push('two',ph,Math.max(.55,R.gap*.72));push('sl',ph,gt);continue}
    push(k,ph,gt)}
  return {rows,len:z+R.v*.4+6,sprintZ:sprint>=0?rows[sprint].z:0}}
// rij invullen ten opzichte van de baan van de speler (altijd een baan vrij, of eroverheen springen)
function fleeFill(r,R,SC,lane){const lanes=[-1,0,1],pick=a=>a[Math.floor(Math.random()*a.length)],other=lanes.filter(l=>l!==lane);
  const mk=(t,x,o)=>Object.assign({t,x,x0:x,hit:0,done:0},FL_OBS[t],o||{});let obs;
  if(r.k==='door'){const side=lane!==0?lane:pick([-1,1]);obs=[mk('agent',side,{door:1}),mk(pick(SC.low),0)]}
  else if(r.k==='fence')obs=[mk(SC.fence,0)];
  else if(r.k==='drift'){obs=[mk(SC.dr||'bewaker',lane,{dr:1})];if(r.extra)obs.push(mk(pick(SC.low),pick(other)))}
  // overstekers: lopen van de zijkant naar jouw baan; waar ze uitkomen zie je ruim op tijd
  else if(r.k==='cross'){const from=lane>0?-1.75:lane<0?1.75:pick([-1.75,1.75]),zr=Math.max(8,r.z-(r._d||0));
    obs=[mk(pick(SC.cross||['mens']),from,{cr:1,from,to:lane,zr,dir:Math.sign(lane-from)||1})];
    if(r.ph===2&&r.extra)obs.push(mk(pick(SC.low),pick(other)))}
  else if(r.k==='sl'&&r.prev&&r.prev.free!=null){const pf=r.prev.free,free=pf===0?pick([-1,1]):0;r.free=free;
    obs=lanes.filter(l=>l!==free).map(l=>mk(Math.random()<R.lowP*.5?pick(SC.low):pick(SC.tall),l))}
  else if(r.k==='auto'){const a=lane===0?pick([-.5,.5]):lane*.5;obs=[mk('auto',a)]}
  else if(r.k==='two'||r.k==='sl'){const free=pick(other);r.free=free;obs=lanes.filter(l=>l!==free).map(l=>mk(Math.random()<R.lowP*.7?pick(SC.low):pick(SC.tall),l))}
  else{obs=[mk(r.low?pick(SC.low):pick(SC.tall),lane)];
    // later in de route: vaak nog iets laags in een andere baan (eroverheen springen of de derde baan nemen)
    if(r.ph>=1&&r.extra)obs.push(mk(pick(SC.low),pick(other)))}
  obs.forEach(o=>{if(o.t==='mens')o.c=pick(['#3b4a5c','#5a3a3a','#4a4f3a','#2f3640','#6b5a44','#3a3150']);if(o.t==='kratten')o.c=pick(['#2f6b4a','#8a3b2c','#2c4f8a'])});
  r.obs=obs;r.set=1}

function fleeGame(level){
  return new Promise(resolve=>{
    const P=fleeParams(level),R=fleeRun(P),SC=FL_SCENE[level]||FL_SCENE[2],L=FLEE_LEVELS[level]||FLEE_LEVELS[2];window.__chase=true;
    const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
    const course=fleeCourse(R,SC);course.rows.forEach(r=>{if(r.z<FL_REVEAL)fleeFill(r,R,SC,0)});
    const arrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
    const ov=document.createElement('div');ov.className='chase-ov fl-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','chT');
    ov.innerHTML=`<div class="fl-box lv${level}"><div class="siren"></div>
      <div class="fl-top"><div class="fl-tt"><h2 id="chT">Rennen!</h2><p class="fl-where" id="flWhere">${L.where}</p></div><span class="tag lvl${level}">Vluchten: ${P.label}</span></div>
      <div class="fl-stage" id="flStage"><canvas id="flCv" aria-label="Achtervolging: ontwijk wat op je pad komt"></canvas>
        <div class="fl-track" aria-hidden="true"><span class="fl-rail"><i class="fl-done" id="flDone"></i>${course.sprintZ?`<i class="fl-sp" style="left:${Math.min(96,course.sprintZ/(course.len-6)*100)}%"></i>`:''}<i class="fl-cop" id="flCop"></i><i class="fl-you" id="flYou"></i></span><b>${SC.exit}</b></div>
        <div class="fl-big" id="flBig">${SC.run}</div></div>
      <div class="fl-info"><span id="flMiss"></span><span class="fl-keys"><kbd>←</kbd><kbd>→</kbd> wisselen · <kbd>↑</kbd> of <kbd>spatie</kbd> springen</span><span class="fl-tap">Tik links of rechts · midden: springen</span></div>
      <div class="fl-ctl"><button class="fl-b" data-a="-1" aria-label="Naar links">${arrow(-1)}</button><button class="fl-b fl-j" data-a="j">Spring</button><button class="fl-b" data-a="1" aria-label="Naar rechts">${arrow(1)}</button></div></div>`;
    document.body.appendChild(ov);
    const q=id=>ov.querySelector('#'+id),cv=q('flCv'),ctx=cv.getContext('2d'),stage=q('flStage');
    // spelstatus
    let W=0,H=0,F=1,hy=0,cx=0,dpr=1,dist=0,t=0,last=0,raf=0,done=false,res=null,doneT=0,closed=false;
    // camera hoog achter de renner, zodat je over hem heen de steeg in kijkt
    const CB=SC.out?8.2:7.8,CH=SC.out?5:4.4,WALL_H=SC.out?9:6.2,near=-CB+.35;
    let px=0,lane=0,jumpT=-1,spdF=1,v=R.v,hitK=R.hit,misses=0,stumT=-1,shake=0,passed=0,meZ=0;
    const fit=()=>{const r=stage.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(200,r.width);H=Math.max(180,r.height);
      cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);F=Math.min(H*1.22,W*1.55);hy=Math.max(H*(SC.out?.1:.14),H*.86-CH*F/CB);cx=W/2};
    fit();const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(stage);else window.addEventListener('resize',fit);
    // projectie: X opzij (m), Y omhoog (m), z vooruit vanaf de renner (m)
    const P3=(X,Y,z)=>{const D=Math.max(.3,z+CB),s=F/D;return {x:cx+X*s,y:hy+(CH-Y)*s,s}};
    const jumpH=()=>jumpT<0?0:Math.sin(Math.PI*Math.min(1,jumpT/FL_JUMP));
    // ---------- invoer ----------
    const move=d=>{if(done)return;const n=Math.max(-1,Math.min(1,lane+d));if(n!==lane){lane=n;try{SFX.card()}catch(e){}}};
    const jump=()=>{if(done||jumpT>=0)return;jumpT=0;try{SFX.tick()}catch(e){}};
    const key=e=>{const k=e.code;let hit=true;
      if(k==='ArrowLeft'||k==='KeyA'){if(!e.repeat)move(-1)}else if(k==='ArrowRight'||k==='KeyD'){if(!e.repeat)move(1)}
      else if(k==='ArrowUp'||k==='KeyW'||k==='Space'){if(!e.repeat)jump()}else if(k==='Enter'&&done){close()}else hit=false;
      if(hit)e.preventDefault()};
    document.addEventListener('keydown',key);
    ov.querySelectorAll('.fl-b').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();const a=b.dataset.a;if(a==='j')jump();else move(+a)}));
    // vegen of tikken op het beeld: links/rechts van baan, midden of omhoog vegen = springen
    let sw=null;
    cv.addEventListener('pointerdown',e=>{e.preventDefault();if(done){close();return}sw={x:e.clientX,y:e.clientY,t:performance.now(),used:false}});
    cv.addEventListener('pointermove',e=>{if(!sw||sw.used)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;
      if(Math.abs(dx)>26&&Math.abs(dx)>Math.abs(dy)){move(dx<0?-1:1);sw.used=true}else if(dy<-26){jump();sw.used=true}});
    cv.addEventListener('pointerup',e=>{if(!sw)return;if(!sw.used){const r=cv.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width;if(fx<1/3)move(-1);else if(fx>2/3)move(1);else jump()}sw=null});
    cv.addEventListener('pointercancel',()=>{sw=null});
    // ---------- tekenen ----------
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,-y-h,w,h)};
    const circ=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,-y,r,0,Math.PI*2);ctx.fill()};
    const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],-p[1]):ctx.moveTo(p[0],-p[1]));ctx.closePath();ctx.fill()};
    const quad=(a,b,c,d)=>{ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath()};
    const wallQ=(side,z1,z2,y1,y2)=>{const X=side*FL_HALF;quad(P3(X,y1,z1),P3(X,y2,z1),P3(X,y2,z2),P3(X,y1,z2))};
    const glow=(x,y,r,col,a)=>{if(r<1)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
    const pool=(X,z,r,col,a)=>{const c=P3(X,0,z),f=P3(X,0,z+r),n=P3(X,0,z-r),ry=Math.max(1,(n.y-f.y)/2),rx=r*c.s;if(rx<2)return;
      ctx.save();ctx.translate(c.x,(n.y+f.y)/2);ctx.scale(1,ry/rx);glow(0,0,rx,col,a);ctx.restore()};
    const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
    const fade=z=>Math.max(0,Math.min(1,1-(z-22)/26));
    function scene(){
      const ex=course.len-dist,far=Math.min(FL_FAR,ex);
      if(far<near+.3){ctx.fillStyle=SC.out?'#ffd9b0':'#e8f6ff';ctx.fillRect(0,0,W,H);return}
      // lucht of plafond en de diepte
      if(SC.out){const g=ctx.createLinearGradient(0,0,0,hy);g.addColorStop(0,'#06070a');g.addColorStop(1,'#141217');ctx.fillStyle=g;ctx.fillRect(0,0,W,hy+2);glow(cx,hy,W*.45,'255,140,60',.1)}
      else{ctx.fillStyle=SC.alarm?'#0d0708':'#08090b';ctx.fillRect(0,0,W,H)}
      // grond
      const gN=P3(0,0,near),gF=P3(0,0,far);const gg=ctx.createLinearGradient(0,gF.y,0,H);
      gg.addColorStop(0,SC.out?'#0b0c0e':'#0c0d10');gg.addColorStop(1,SC.out?'#1b1c20':(SC.office?'#1c1e22':'#18191c'));
      ctx.fillStyle=gg;quad(P3(-FL_HALF,0,near),P3(FL_HALF,0,near),P3(FL_HALF,0,far),P3(-FL_HALF,0,far));ctx.fill();
      // straatstenen of vloervoegen die meeschuiven
      ctx.strokeStyle=SC.out?'rgba(255,255,255,.035)':'rgba(255,255,255,.03)';ctx.lineWidth=1;ctx.beginPath();
      const st=SC.out?1.2:2.4;for(let k=Math.ceil((dist+0)/st)*st;k<dist+Math.min(40,far);k+=st){const z=k-dist;if(z<near)continue;const a=P3(-FL_HALF,0,z),b=P3(FL_HALF,0,z);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}ctx.stroke();
      // baanlijnen (gestippeld) of gele veiligheidslijnen binnen
      [-.5,.5].forEach(l=>{const X=l*FL_LANE;ctx.strokeStyle=SC.out?'rgba(255,255,255,.07)':'rgba(255,214,90,.16)';ctx.lineWidth=1.5;ctx.beginPath();
        for(let k=Math.floor(dist/3)*3;k<dist+Math.min(46,far);k+=3){const z1=k-dist,z2=z1+1.5;if(z2<near)continue;const a=P3(X,0,Math.max(near,z1)),b=P3(X,0,z2);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y)}ctx.stroke()});
      if(!SC.out){[-1,1].forEach(sd=>{const X=sd*(FL_HALF-.28);const a=P3(X,0,near),b=P3(X,0,far);ctx.strokeStyle=SC.alarm?'rgba(255,214,90,.35)':'rgba(255,214,90,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()})}
      // plassen met weerspiegeling (buiten)
      if(SC.out)for(let k=Math.floor(dist/7)*7;k<dist+40;k+=7){const z=k-dist+3.2;if(z<near||z>far)continue;const n=Math.floor(k/7);if(hash(n)<.45)continue;
        const X=(hash(n+3)-.5)*3.6;pool(X,z,1.1,'255,150,70',.16)}
      // muren
      [-1,1].forEach(sd=>{const a=P3(sd*FL_HALF,0,near),b=P3(sd*FL_HALF,0,far);const g=ctx.createLinearGradient(a.x,0,b.x,0);
        if(SC.out){g.addColorStop(0,'#2a2522');g.addColorStop(1,'#0d0c0d')}else if(SC.alarm){g.addColorStop(0,'#241b1d');g.addColorStop(1,'#0c0909')}else{g.addColorStop(0,SC.office?'#262a31':'#22252b');g.addColorStop(1,'#0b0c0f')}
        ctx.fillStyle=g;wallQ(sd,near,far,0,WALL_H);ctx.fill();
        // voegen of tegels
        ctx.strokeStyle=SC.out?'rgba(0,0,0,.28)':'rgba(255,255,255,.035)';ctx.lineWidth=1;ctx.beginPath();
        for(let y=SC.out?.32:.9;y<WALL_H;y+=SC.out?.32:.9){const p=P3(sd*FL_HALF,y,near),q2=P3(sd*FL_HALF,y,far);ctx.moveTo(p.x,p.y);ctx.lineTo(q2.x,q2.y)}ctx.stroke();
        if(!SC.out){ctx.fillStyle='rgba(0,0,0,.35)';wallQ(sd,near,far,0,.14);ctx.fill()}});
      if(!SC.out){// plafond
        ctx.fillStyle=SC.alarm?'#120c0d':'#0e1013';quad(P3(-FL_HALF,WALL_H,near),P3(FL_HALF,WALL_H,near),P3(FL_HALF,WALL_H,far),P3(-FL_HALF,WALL_H,far));ctx.fill()}
      // ramen, deuren, regenpijpen; binnen kantoordeuren
      const step=SC.out?4.6:6.5;
      for(let k=Math.floor((dist-8)/step);k*step<dist+far;k++){const zb=k*step-dist;if(zb+step<near)continue;
        [-1,1].forEach(sd=>{const n=k*2+(sd>0?1:0),hz=hash(n);
          if(SC.out){
            for(let fl=0;fl<3;fl++){const y1=2.7+fl*2.1,lit=hash(n*7+fl)<.2;const z1=zb+1.1,z2=zb+2.3;if(z2<near||z1>far)continue;
              ctx.fillStyle='#3a332e';wallQ(sd,z1-.1,z2+.1,y1-.12,y1+1.32);ctx.fill();
              ctx.fillStyle=lit?`rgba(255,186,110,${.42*fade(z1)+.1})`:'#0b0b0d';wallQ(sd,z1,z2,y1,y1+1.2);ctx.fill();
              ctx.fillStyle='rgba(30,26,24,.9)';wallQ(sd,(z1+z2)/2-.04,(z1+z2)/2+.04,y1,y1+1.2);ctx.fill();
              if(lit&&z1>0){const c=P3(sd*FL_HALF,y1+.6,(z1+z2)/2);glow(c.x,c.y,c.s*1.3,'255,170,90',.1*fade(z1))}}
            if(hz<.3){const z1=zb+2.9,z2=zb+3.9;if(z2>near&&z1<far){ctx.fillStyle='#0f0e10';wallQ(sd,z1,z2,0,2.25);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.06)';wallQ(sd,z1,z2,0,2.25);ctx.stroke()}}
            if(hz>.7){const z1=zb+.3,z2=zb+.42;if(z2>near&&z1<far){ctx.fillStyle='#38332f';wallQ(sd,z1,z2,0,WALL_H);ctx.fill()}}
          }else{
            const z1=zb+2,z2=zb+3.1;if(z2>near&&z1<far){ctx.fillStyle=SC.office?'#2c3139':'#1a1c20';wallQ(sd,z1-.12,z2+.12,0,2.32);ctx.fill();ctx.fillStyle=SC.office?'#3a4250':'#121316';wallQ(sd,z1,z2,0,2.2);ctx.fill();
              if(hz<.35){ctx.fillStyle=SC.alarm?'rgba(255,60,80,.25)':'rgba(169,220,255,.18)';wallQ(sd,z1,z2,0,.06);ctx.fill()}}
            if(SC.alarm&&hz>.55){const c=P3(sd*FL_HALF,WALL_H-.35,zb+5);const on=Math.sin(t*9+n)>0;if(zb+5>near&&zb+5<far){ctx.fillStyle=on?'#ff3d52':'#4a1218';ctx.fillRect(c.x-c.s*.09,c.y-c.s*.09,c.s*.18,c.s*.18);if(on)glow(c.x,c.y,c.s*1.4,'255,61,82',.32*fade(zb+5)+.04)}}
          }})}
      // lampen: oranje straatlantaarns buiten, tl-buizen binnen
      if(SC.out){const ls=11;for(let k=Math.floor((dist-6)/ls);k*ls<dist+far;k++){const z=k*ls-dist+5;if(z<near||z>far)continue;const sd=k%2?1:-1;
          const wall=P3(sd*FL_HALF,4.6,z),hd=P3(sd*(FL_HALF-.7),4.45,z);ctx.strokeStyle='#2b2724';ctx.lineWidth=Math.max(1,hd.s*.05);ctx.beginPath();ctx.moveTo(wall.x,wall.y);ctx.lineTo(hd.x,hd.y);ctx.stroke();
          ctx.fillStyle='#ffd08a';ctx.fillRect(hd.x-hd.s*.16,hd.y,hd.s*.32,hd.s*.08);
          const fa=fade(z);pool(sd*(FL_HALF-1.2),z,2.6,'255,140,50',.24*fa+.04);
          ctx.save();ctx.globalCompositeOperation='lighter';glow(hd.x,hd.y+hd.s*.05,hd.s*1.9,'255,150,60',.38*fa+.05);ctx.restore()}}
      else{const ls=5.2;for(let k=Math.floor((dist-6)/ls);k*ls<dist+far;k++){const z1=k*ls-dist+2,z2=z1+1.5;if(z2<near||z1>far)continue;const flick=SC.alarm?.55+.45*Math.max(0,Math.sin(t*2.2+k)):1;
          ctx.fillStyle=SC.alarm?`rgba(255,200,200,${.35*flick})`:'rgba(222,244,255,.85)';quad(P3(-.42,WALL_H,z1),P3(.42,WALL_H,z1),P3(.42,WALL_H,z2),P3(-.42,WALL_H,z2));ctx.fill();
          const fa=fade(z1),c=P3(0,WALL_H,(z1+z2)/2);if(fa>0){ctx.save();ctx.globalCompositeOperation='lighter';glow(c.x,c.y,c.s*2.2,SC.alarm?'255,80,80':'200,230,255',.2*flick*fa);ctx.restore()}
          pool(0,(z1+z2)/2,1.8,SC.alarm?'255,80,80':'200,230,255',.1*flick*fa+.02)}}
      // de uitgang
      if(ex<FL_FAR){
        if(SC.out){const a=P3(-FL_HALF,0,ex),b=P3(FL_HALF,WALL_H,ex);const g=ctx.createLinearGradient(0,b.y,0,a.y);g.addColorStop(0,'#1a130e');g.addColorStop(.55,'#4a2c16');g.addColorStop(1,'#ffcf96');
          ctx.fillStyle=g;ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);ctx.save();ctx.globalCompositeOperation='lighter';glow((a.x+b.x)/2,a.y-(a.y-b.y)*.15,(b.x-a.x)*.9,'255,170,90',.5);ctx.restore()}
        else{const a=P3(-FL_HALF,0,ex),b=P3(FL_HALF,WALL_H,ex);ctx.fillStyle=SC.alarm?'#1c1314':'#1d2025';ctx.fillRect(a.x,b.y,b.x-a.x,a.y-b.y);
          const d1=P3(-1.25,0,ex),d2=P3(1.25,2.35,ex);const g=ctx.createLinearGradient(0,d2.y,0,d1.y);g.addColorStop(0,'#cfe6f2');g.addColorStop(1,'#f4fbff');ctx.fillStyle=g;ctx.fillRect(d1.x,d2.y,d2.x-d1.x,d1.y-d2.y);
          ctx.save();ctx.globalCompositeOperation='lighter';glow((d1.x+d2.x)/2,(d1.y+d2.y)/2,(d2.x-d1.x)*1.1,'190,230,255',.45);ctx.restore();
          const s1=P3(-.42,2.95,ex),s2=P3(.42,2.55,ex);ctx.fillStyle='#16a34a';ctx.fillRect(s1.x,s1.y,s2.x-s1.x,s2.y-s1.y);
          ctx.strokeStyle='#eafff1';ctx.lineWidth=Math.max(1,s1.s*.05);ctx.beginPath();const my=(s1.y+s2.y)/2,mx=(s1.x+s2.x)/2,u=s1.s*.14;ctx.moveTo(mx-u*1.3,my);ctx.lineTo(mx+u*1.1,my);ctx.moveTo(mx+u*.4,my-u*.7);ctx.lineTo(mx+u*1.1,my);ctx.lineTo(mx+u*.4,my+u*.7);ctx.stroke();
          if(ex<26){ctx.save();ctx.globalCompositeOperation='lighter';glow((s1.x+s2.x)/2,(s1.y+s2.y)/2,s1.s*.9,'40,220,110',.35);ctx.restore()}}}
      else{ctx.save();ctx.globalCompositeOperation='lighter';const c=P3(0,1.2,FL_FAR);glow(c.x,c.y,W*.06,SC.out?'255,160,80':'180,220,255',.14);ctx.restore()}
    }
    // ---------- obstakels ----------
    const DRAW={
      kliko(o){rect(-.34,.08,.68,.98,'#1d4a33');rect(.18,.08,.16,.98,'#163a28');rect(-.37,1.0,.74,.14,'#2a6a48');rect(-.37,1.11,.74,.04,'#3c8a60');circ(-.24,.08,.08,'#0a0a0a');circ(.24,.08,.08,'#0a0a0a');rect(-.2,.75,.4,.06,'rgba(255,255,255,.12)')},
      fiets(o){ctx.strokeStyle='#1a1a1c';ctx.lineWidth=.05;ctx.beginPath();ctx.arc(-.34,-.34,.33,0,7);ctx.moveTo(.67,-.34);ctx.arc(.34,-.34,.33,0,7);ctx.stroke();
        ctx.strokeStyle='#9a3b2c';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(-.34,-.34);ctx.lineTo(-.02,-.36);ctx.lineTo(.2,-.78);ctx.lineTo(-.14,-.78);ctx.lineTo(-.34,-.34);ctx.moveTo(-.02,-.36);ctx.lineTo(.34,-.34);ctx.lineTo(.22,-.86);ctx.stroke();rect(-.24,.8,.22,.05,'#111');rect(.12,.86,.26,.05,'#222')},
      agent(o){person(o,'#16233f','#1d2c4f',1)},
      mens(o){person(o,o.c||'#3b4a5c',o.c||'#3b4a5c',0)},
      bewaker(o){person(o,'#0f1012','#17191c',2)},
      scooter(o){rect(-.2,.06,.4,.42,'#20242a');poly([[-.32,.4],[.32,.4],[.26,.95],[-.26,.95]],'#b8242f');rect(-.2,.95,.4,.12,'#7d1820');rect(-.36,1.05,.72,.06,'#1a1a1a');circ(0,.14,.13,'#0b0b0b');rect(-.08,.7,.16,.1,'rgba(255,240,200,.85)')},
      dozen(o){[[-.31,0,.62,.55,'#8a6a42'],[-.28,.55,.56,.5,'#9a7748'],[-.22,1.05,.44,.56,'#87683f']].forEach(b=>{rect(b[0],b[1],b[2],b[3],b[4]);rect(b[0],b[1]+b[3]*.45,b[2],b[3]*.1,'rgba(255,255,255,.12)');rect(b[0]+b[2]*.8,b[1],b[2]*.2,b[3],'rgba(0,0,0,.18)')})},
      kast(o){rect(-.32,0,.64,1.96,'#4a515c');rect(.18,0,.14,1.96,'#3a4048');rect(-.3,.04,.29,1.88,'#535b67');rect(.01,.04,.28,1.88,'#4d5560');rect(-.06,.9,.04,.2,'#c9d1da');rect(.05,.9,.04,.2,'#c9d1da')},
      pallet(o){rect(-.58,0,1.16,.12,'#6b4e2e');rect(-.58,.18,1.16,.12,'#7d5c37');rect(-.58,.36,1.16,.12,'#8a6740');[-.52,-.06,.4].forEach(x=>rect(x,0,.12,.48,'#5a4126'))},
      kratten(o){[-.6,0].forEach((x,i)=>{rect(x,0,.58,.6,o.c||'#2f6b4a');rect(x+.04,.34,.5,.06,'rgba(0,0,0,.35)');rect(x+.04,.16,.5,.06,'rgba(0,0,0,.35)');rect(x,.56,.58,.04,'rgba(255,255,255,.2)')})},
      kar(o){rect(-.46,.08,.92,.12,'#c9a227');circ(-.36,.06,.06,'#111');circ(.36,.06,.06,'#111');rect(-.4,.2,.38,.36,'#8a6a42');rect(.02,.2,.36,.3,'#9a7748')},
      bureau(o){rect(-.68,.68,1.36,.08,'#5b4632');rect(-.64,0,.07,.68,'#2b2f36');rect(.57,0,.07,.68,'#2b2f36');rect(-.6,.3,.5,.36,'#3a3f47');rect(-.22,.76,.3,.24,'#14171c');rect(-.19,.79,.24,.18,'rgba(169,220,255,.35)')},
      hek(o){for(let x=-2.55;x<2.5;x+=1.7){ctx.strokeStyle='#8b929c';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(x,-.12);ctx.lineTo(x,-.8);ctx.lineTo(x+1.55,-.8);ctx.lineTo(x+1.55,-.12);ctx.lineTo(x,-.12);
          for(let k=1;k<9;k++){ctx.moveTo(x+k*.172,-.12);ctx.lineTo(x+k*.172,-.8)}ctx.stroke();rect(x-.1,0,.3,.04,'#6b7078');rect(x+1.35,0,.3,.04,'#6b7078')}},
      lint(o){rect(-2.7,0,.08,.98,'#c9d1da');rect(2.62,0,.08,.98,'#c9d1da');for(let i=0;i<14;i++)rect(-2.62+i*.38,.82,.38,.1,i%2?'#f4f4f4':'#e0313f')},
      container(o){rect(-.42,.1,.84,1.1,'#3d5a44');rect(.2,.1,.22,1.1,'#2f4736');rect(-.46,1.2,.92,.14,'#4c6f55');rect(-.46,1.32,.92,.05,'#5e8467');
        circ(-.3,.08,.08,'#0b0b0b');circ(.3,.08,.08,'#0b0b0b');rect(-.3,.55,.6,.2,'rgba(255,255,255,.07)');rect(-.12,.62,.24,.07,'#e9e6df');rect(-.38,.95,.76,.03,'rgba(0,0,0,.3)')},
      zakken(o){[[-.33,.27,.29,'#16181b'],[.1,.3,.32,'#1b1d21'],[-.1,.62,.24,'#22252a']].forEach(([x,cy,r,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,-cy,r,r*.92,0,0,7);ctx.fill();
          ctx.fillStyle='rgba(255,255,255,.09)';ctx.beginPath();ctx.ellipse(x-r*.38,-cy-r*.4,r*.24,r*.13,-.5,0,7);ctx.fill()});rect(-.14,.82,.07,.1,'#2a2c30');rect(.06,.58,.07,.09,'#2a2c30')},
      afzetting(o){rect(-.48,0,.07,.84,'#c9d1da');rect(.41,0,.07,.84,'#c9d1da');for(let i=0;i<6;i++)rect(-.48+i*.16,.52,.16,.22,i%2?'#f4f4f4':'#e0313f');
        rect(-.56,0,.22,.04,'#555a62');rect(.34,0,.22,.04,'#555a62');circ(-.445,.86,.05,'#ffb020');circ(.445,.86,.05,'#ffb020')},
      bord(o){poly([[-.22,0],[.22,0],[.08,.66],[-.08,.66]],'#f2c230');poly([[.22,0],[.26,0],[.1,.66],[.08,.66]],'#c99a12');
        poly([[-.15,.12],[.15,.12],[.07,.5],[-.07,.5]],'#e0a800');rect(-.025,.24,.05,.16,'#1b1d22');circ(0,.18,.03,'#1b1d22')},
      printer(o){rect(-.32,0,.64,.8,'#c9ccd1');rect(.18,0,.14,.8,'#a9adb4');rect(-.34,.8,.68,.3,'#dfe2e6');rect(-.3,1.1,.6,.1,'#b9bdc3');
        rect(-.22,.42,.44,.06,'#3a3f47');rect(-.22,.22,.44,.06,'#3a3f47');rect(.13,.93,.13,.08,'#4ade80');rect(-.26,1.2,.4,.04,'#f4f4f4')},
      stoel(o){rect(-.04,.08,.08,.36,'#2b2f36');rect(-.3,0,.6,.06,'#2b2f36');circ(-.28,.03,.04,'#111');circ(.28,.03,.04,'#111');circ(0,.03,.04,'#111');
        rect(-.27,.42,.54,.12,'#1f2937');rect(-.24,.54,.48,.4,'#273244');rect(-.19,.6,.38,.28,'#2f3c52')},
      schoonmaker(o){person(o,'#2d5f86','#24435c',3)},
      hond(o){const d=o.dir||1,ph=t*16;ctx.save();ctx.scale(d,1);
        const leg=(x,p)=>{const k=Math.sin(ph+p)*.05;rect(x+k,0,.06,.24,'#3b2a1e')};leg(-.24,0);leg(-.13,2.2);leg(.12,1.1);leg(.22,3.3);
        rect(-.3,.22,.58,.2,'#7a5432');rect(-.3,.36,.58,.06,'#8d6440');rect(.22,.34,.2,.17,'#7a5432');rect(.38,.36,.11,.09,'#5a3d25');rect(.48,.4,.03,.04,'#111');
        circ(.3,.46,.022,'#000');poly([[.24,.5],[.31,.5],[.27,.6]],'#4a321f');
        ctx.strokeStyle='#7a5432';ctx.lineWidth=.055;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-.3,-.38);ctx.quadraticCurveTo(-.44,-.46+Math.sin(ph*.7)*.05,-.46,-.58);ctx.stroke();
        rect(-.02,.4,.2,.03,'#c0262f');ctx.restore()},
      auto(o){const sx=o.x>0?1:-1;rect(-1.05,.18,2.1,.66,'#e9ecef');poly([[-.86,.84],[.86,.84],[.66,1.32],[-.66,1.32]],'#dfe3e8');poly([[-.74,.88],[.74,.88],[.58,1.26],[-.58,1.26]],'#1a2230');
        for(let i=0;i<10;i++)rect(-1.05+i*.21,.36,.21,.16,i%2?'#1f4fbf':'#e8571f');rect(-.98,.62,.3,.12,'#c0262f');rect(.68,.62,.3,.12,'#c0262f');rect(-1.0,.06,.42,.2,'#0b0b0b');rect(.58,.06,.42,.2,'#0b0b0b');
        const on=Math.floor(t*6)%2;rect(-.5,1.32,1,.12,'#20242a');rect(-.46,1.34,.44,.09,on?'#4d7dff':'#1d2c5a');rect(.02,1.34,.44,.09,on?'#1d2c5a':'#4d7dff');o.flash=on}};
    // persoon van voren: agent (1), bewaker met zaklamp (2) of voorbijganger (0)
    function person(o,body,leg,kind){const sw=Math.sin(t*3+o.x*2)*.03;
      rect(-.2,0,.17,.9,leg);rect(.03,0,.17,.9,leg);rect(-.23,0,.2,.07,'#0a0a0a');rect(.03,0,.2,.07,'#0a0a0a');
      rect(-.27,.86,.54,.7,body);rect(-.42+sw,.95,.15,.58,body);rect(.27-sw,.95,.15,.58,body);
      if(kind===1){rect(-.27,1.12,.54,.08,'#cfd8e6');rect(-.27,1.3,.54,.05,'#cfd8e6')}
      if(kind===2){rect(-.06,1.2,.12,.36,'#e6e6e6');rect(-.03,1.22,.06,.32,'#111')}
      if(kind===0){rect(.14,.82,.22,.3,'#25282e')}
      if(kind===3){rect(-.27,1.05,.54,.07,'#f2c230');rect(.4,0,.04,1.45,'#c9a227');rect(.3,0,.25,.09,'#e9e6df');rect(-.42,.6,.22,.24,'#3b82f6')}
      circ(0,1.72,.13,'#c99b7a');
      if(kind===1){rect(-.17,1.79,.34,.1,'#16233f');rect(-.2,1.78,.4,.04,'#0e1830');rect(-.17,1.84,.34,.03,'#e6e6e6')}
      else rect(-.14,1.8,.28,.07,kind===2?'#0a0a0a':'#2a2522');
      if(kind===2){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(.4,-1.0,.05,.4,-1.0,1.2);g.addColorStop(0,'rgba(255,240,190,.35)');g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.fillRect(-.8,-2.2,2.4,2.4);ctx.restore();circ(.38,1.0,.05,'#fff7d6')}}
    function drawOb(o,z){const s=P3(o.x*FL_LANE,0,z);if(s.s<1.2)return;
      let a=1;if(z>30)a=Math.max(0,1-(z-30)/(FL_FAR-30));if(z>FL_REVEAL-8)a*=Math.max(0,(FL_REVEAL-z)/8);if(z<0)a=Math.max(0,1+z/(o.hit?1.1:2.4));if(a<=0)return;
      ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
      // schaduw
      ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,0,(o.w*FL_LANE)*.5+.05,.09,0,0,7);ctx.fill();
      if(o.hit){ctx.rotate((o.x>=px?1:-1)*Math.min(.9,(t-o.hitT)*5));}
      (DRAW[o.t]||DRAW.kliko)(o);ctx.restore();
      if(o.t==='auto'&&o.flash!=null&&z>0&&z<50){const c=P3(o.x*FL_LANE,1.4,z);ctx.save();ctx.globalCompositeOperation='lighter';glow(c.x,c.y,c.s*1.6,o.flash?'77,125,255':'60,90,200',.35);ctx.restore()}}
    // de renner van achteren, met oranje randlicht van de lantaarns
    function drawMe(){if(meZ>9)return;const h=jumpH(),s=P3(px*FL_LANE,0,meZ);const ph=dist*1.85,air=jumpT>=0,lean=(lane-px)*.32+(stumT>=0?Math.sin(stumT*30)*.12:0);
      const hurt=(stumT>=0&&stumT<.45)||(done&&res===false),HD=hurt?'#4a1e26':'#24272e',AR=hurt?'#3e1a21':'#20232a',RIM=hurt?'rgba(255,61,82,.9)':'rgba(255,122,26,.75)';
      ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
      ctx.fillStyle=`rgba(0,0,0,${.5-h*.25})`;ctx.beginPath();ctx.ellipse(0,0,.34-h*.12,.08,0,0,7);ctx.fill();
      ctx.translate(0,-h*1.0-Math.abs(Math.sin(ph))*.05);ctx.rotate(lean);
      const l1=air?.25:Math.max(0,Math.sin(ph))*.32,l2=air?.25:Math.max(0,-Math.sin(ph))*.32;
      rect(-.19,l1,.16,.86-l1*.7,'#1b2638');rect(.03,l2,.16,.86-l2*.7,'#1b2638');rect(-.21,l1-.04,.2,.12,'#e9e6df');rect(.01,l2-.04,.2,.12,'#e9e6df');
      const ar=air?.2:Math.sin(ph)*.16;
      rect(-.4,.98+ar,.14,.5,AR);rect(.26,.98-ar,.14,.5,AR);
      rect(-.28,.82,.56,.74,HD);poly([[-.2,1.56],[.2,1.56],[.17,1.92],[-.17,1.92]],HD);circ(0,1.82,.17,HD);
      ctx.fillStyle=RIM;ctx.fillRect(-.29,-1.56,.035,.72);ctx.fillRect(.255,-1.56,.035,.72);ctx.fillRect(-.415,-1.48-ar,.025,.48);ctx.fillRect(.39,-1.48+ar,.025,.48);
      ctx.beginPath();ctx.arc(0,-1.82,.17,Math.PI*1.05,Math.PI*1.95);ctx.strokeStyle=RIM;ctx.lineWidth=.035;ctx.stroke();
      rect(-.12,1.0,.24,.1,'rgba(0,0,0,.25)');
      ctx.restore()}
    function overlays(){
      // zwaailicht van de agent achter je: sterker als hij dichterbij komt
      const close=Math.min(1,misses/(R.miss+1)+(done&&res===false?1:0)),k=.12+.38*close,ph=reduce?0:Math.floor(t*(5+close*4))%2;
      const r1=ph?'255,61,82':'77,125,255',r2=ph?'77,125,255':'255,61,82';
      glow(0,H,H*(.55+close*.25),r1,k);glow(W,H,H*(.55+close*.25),r2,k);
      if(SC.alarm&&!reduce){ctx.fillStyle=`rgba(255,40,60,${.05+.06*Math.max(0,Math.sin(t*4))})`;ctx.fillRect(0,0,W,H)}
      const v=ctx.createRadialGradient(cx,H*.55,Math.min(W,H)*.35,cx,H*.55,Math.max(W,H)*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
      if(done&&res===true){const a=Math.min(1,(t-doneT)/1.2);ctx.save();ctx.globalCompositeOperation='lighter';glow(cx,hy+(H-hy)*.35,Math.max(W,H)*(.5+a*.5),SC.out?'255,170,90':'190,230,255',a*.32);ctx.restore()}
      if(done&&res===false){ctx.fillStyle=`rgba(5,6,8,${Math.min(.5,(t-doneT)*.8)})`;ctx.fillRect(0,0,W,H)}}
    function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
      if(shake>0&&!reduce){ctx.translate((Math.random()-.5)*shake*14,(Math.random()-.5)*shake*10)}
      scene();
      const list=[];course.rows.forEach(r=>{const z=r.z-dist;if(z>FL_FAR||z<-CB+.6)return;r.obs.forEach(o=>list.push([o,z]))});
      list.sort((a,b)=>b[1]-a[1]);list.filter(x=>x[1]>=0).forEach(x=>drawOb(x[0],x[1]));drawMe();list.filter(x=>x[1]<0).forEach(x=>drawOb(x[0],x[1]));
      overlays()}
    // ---------- spelverloop ----------
    const big=q('flBig');setTimeout(()=>{if(!done)big.classList.add('gone')},900);
    // aankondiging van de eindsprint, vlak voor de drukste rijen
    let spShown=!course.sprintZ;const sprintCheck=()=>{if(spShown||done||dist<course.sprintZ-R.v*1.7)return;spShown=true;
      big.textContent='Eindsprint!';big.className='fl-big sp';try{SFX.tick()}catch(e){}setTimeout(()=>{if(!done)big.classList.add('gone')},950)};
    let missH='';
    const drawHud=()=>{const p=done&&res===true?1:Math.min(1,dist/(course.len-6)),gap=done&&res===false?0:Math.max(.012,.15*(1-misses/(R.miss+1)));
      q('flYou').style.left=(p*100)+'%';q('flDone').style.width=(p*100)+'%';q('flCop').style.left=Math.max(0,(p-gap)*100)+'%';
      const left=R.miss-misses,h=R.miss===0?'<b class="no">Niet struikelen</b>':`Struikelen: <b>${'●'.repeat(Math.max(0,left))}</b>${'○'.repeat(Math.min(R.miss,misses))}`;
      if(h!==missH){missH=h;q('flMiss').innerHTML=h}};
    drawHud();
    function stumble(o){o.hit=1;o.hitT=t;misses++;spdF=.3;stumT=0;shake=.35;try{SFX.lose()}catch(e){}
      const b=q('flStage');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump');
      if(misses>R.miss)finish(false)}
    function step(dt){t+=dt;if(done){doneT=doneT||t;if(res===true){meZ+=v*dt*.75;dist+=Math.max(0,(course.len-5.2)-dist)*Math.min(1,dt*3)}return}
      const prev=dist;dist+=v*spdF*dt;spdF+=(1-spdF)*Math.min(1,dt*2.4);
      const dx=lane-px,ls=dt/.13;px=Math.abs(dx)<=ls?lane:px+Math.sign(dx)*ls;
      if(jumpT>=0){jumpT+=dt;if(jumpT>FL_JUMP)jumpT=-1}
      if(stumT>=0){stumT+=dt;if(stumT>.6)stumT=-1}
      shake=Math.max(0,shake-dt*1.6);
      for(const r of course.rows){const z0=r.z-prev,z1=r.z-dist;if(!r.set&&z1<FL_REVEAL){r._d=dist;fleeFill(r,R,SC,lane)}
        for(const o of r.obs){
          // bewakers schuiven met je mee tot ze dichtbij zijn
          if(o.dr&&z1>9+R.len*4&&z1<26){const d=px-o.x,m=.9*dt;o.x+=Math.abs(d)<=m?d:Math.sign(d)*m}
          // overstekers lopen gelijkmatig door: precies op jouw hoogte staan ze in hun eindbaan
          if(o.cr)o.x=o.to+(o.from-o.to)*Math.max(-1.6,Math.min(1,z1/o.zr));
          if(o.done||o.hit)continue;
          if(z0>0&&z1<=0){o.done=1;const over=Math.abs(px-o.x)<(FL_PW+o.w)/2*hitK;
            if(over&&!(o.low&&jumpH()>R.jump)){stumble(o);if(done)return}}}
        if(!r.passed&&z1<0){r.passed=1;passed++;v*=R.accel;hitK=Math.min(1.08,hitK/R.shrink)}}
      sprintCheck();if(dist>=course.len-6)finish(true)}
    // vaste kleine stapjes: ook bij een trage telefoon loopt de achtervolging op het juiste tempo
    let ft=0;
    function frame(now){if(closed)return;let acc=Math.min(.25,Math.max(0,(now-last)/1000));last=now;while(acc>1e-4){const h=Math.min(1/60,acc);step(h);acc-=h}
      const a=performance.now();draw();ft=ft*.9+(performance.now()-a)*.1;drawHud();raf=requestAnimationFrame(frame)}
    function finish(ok){if(done)return;done=true;res=ok;doneT=t;document.removeEventListener('keydown',key);
      const box=ov.querySelector('.fl-box');box.classList.add(ok?'won':'lost');
      q('chT').textContent=ok?'Ontkomen!':'Gepakt!';q('flWhere').textContent=ok?SC.win:SC.lose;
      big.textContent=ok?'Ontkomen!':'Gepakt!';big.className='fl-big '+(ok?'ok':'no');
      ov.querySelectorAll('.fl-b').forEach(b=>{b.disabled=true});
      const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);
      try{ok?SFX.win(3):SFX.lose()}catch(e){}
      setTimeout(close,1500)}
    function close(){if(closed||!done)return;closed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',fit);
      ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(res===true)},220)}
    ov.addEventListener('click',e=>{if(done&&!e.target.closest('.fl-ctl'))close()});
    ov._fl=()=>({dist,px,lane,jumpT,misses,v:v*spdF,done,res,R,rows:course.rows,len:course.len,ft});
    last=performance.now();draw();raf=requestAnimationFrame(frame);
    setTimeout(()=>{const j=ov.querySelector('.fl-j');j&&j.focus({preventScroll:true})},30);
  });
}
