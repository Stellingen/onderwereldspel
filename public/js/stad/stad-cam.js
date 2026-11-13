// Pixelstad: camera. Drie standen, wisselen met V (of de knop rechtsboven, of in de instellingen van je telefoon):
// - Bovenaf: zoals altijd. Klik op een gebouw en je loopt erheen.
// - Achter je (third-person): over je schouder, zoals in een gangsterspel. Kijken met de muis (klik in het beeld om de muis
//   vast te zetten, Esc laat los) of door te slepen; op de telefoon veeg je rechts om te kijken. In de auto hangt de camera
//   achter de auto en draait mee met de weg.
// - Door je ogen (first-person): je kijkt zelf de straat in. Met een stip in het midden: wat je aankijkt, daar praat je mee.
//   In de auto kijk je over de motorkap.
// Ook: een echte lucht (verloop, zon, maan, sterren en pixelwolken) die je ziet zodra je niet meer recht naar beneden kijkt.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE;
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const MODES=['boven','achter','ogen'],NAME={boven:'Bovenaf',achter:'Achter je',ogen:'Door je ogen'};
let mode='boven';try{const v=localStorage.getItem('stad_cam');if(MODES.includes(v))mode=v}catch(e){}
G.camMode=mode;
const C={pitch:.2,pitchT:.2,tpD:5.4,tpDT:5.4,carD:8.5,fov:0,pos:new TH.Vector3(),look:new TH.Vector3(),init:false,lockWant:false,bob:0};
G.camC=C;   // (verhaal: interieurs lezen pitch en afstand)
// gebouwen blokkeren de camera, lage dingen (bankjes, containers) niet
let B=null;function bmap(){B=new Uint8Array(M.W*M.H);M.buildings.forEach(b=>{for(let z=b.z0;z<b.z1;z++)for(let x=b.x0;x<b.x1;x++)if(x>=0&&z>=0&&x<M.W&&z<M.H)B[z*M.W+x]=1})}
const wall=(x,z)=>{x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return false;return !!B[z*M.W+x]};

/* ---------- wisselen ---------- */
function setCam(m,quiet){if(!MODES.includes(m))m='boven';const was=mode;mode=m;G.camMode=m;try{localStorage.setItem('stad_cam',m)}catch(e){}
  if(m==='boven'){unlock();G.shadowC=null;G.yawT=G.yaw}else{if(was==='boven'){C.pitchT=C.pitch=m==='ogen'?.05:.2;C.init=false}if(m==='ogen')C.pitchT=C.pitch=clamp(C.pitch,-.2,.25)}
  if(typeof dot!=='undefined'&&dot)dot.hidden=m!=='ogen';G.resize&&G.resize();ui();if(!quiet){G.toast&&G.toast('Camera: '+NAME[m]+(touch?'':' · V wisselt'+(m!=='boven'?', klik om te kijken met de muis':'')),'info');G.snd&&G.snd.fx('blip')}
  G.onCam&&G.onCam(m)}
G.setCam=setCam;G.camNext=()=>setCam(MODES[(MODES.indexOf(mode)+1)%3]);
addEventListener('keydown',e=>{const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(G.paused||!G.ready)return;
  if(e.key.toLowerCase()==='v'&&!e.repeat){e.preventDefault();G.camNext()}});

/* ---------- muis vastzetten (pc) ---------- */
const cv=()=>G.canvas;
function locked(){return document.pointerLockElement===cv()}
function unlock(){if(locked())try{document.exitPointerLock()}catch(e){}}
G.camLocked=locked;
document.addEventListener('pointerlockchange',()=>{ui()});
document.addEventListener('mousemove',e=>{if(!locked()||mode==='boven'||G.paused)return;const k=mode==='ogen'?.0024:.0028;G.yawT-=e.movementX*k;G.yaw=G.yawT;C.pitchT=clamp(C.pitchT+e.movementY*k*.85,mode==='ogen'?-1.15:-.35,mode==='ogen'?1.2:1.15);C.pitch=C.pitchT});
// klikken: in de nieuwe standen loop je niet naar een plek, maar zet je de muis vast; met vaste muis is klikken 'doen' (zoals E)
G.camClick=function(){if(mode==='boven')return false;if(touch){act();return true}
  if(!locked()){try{const r=cv().requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}return true}act();return true};
function act(){if(G.missionAction&&G.missionAction())return;if(G.verhaalAct&&G.verhaalAct())return;if(G.interact&&G.interact())return;if(G.near&&G.onEnter)G.onEnter(G.near)}
// slepen omhoog en omlaag = op en neer kijken (draaien doet stad-game.js al)
(function(){let ids=new Map();
  const host=()=>cv();const wait=setInterval(()=>{const c=host();if(!c)return;clearInterval(wait);
    c.addEventListener('pointerdown',e=>{ids.set(e.pointerId,{y:e.clientY})});
    c.addEventListener('pointermove',e=>{const p=ids.get(e.pointerId);if(!p||mode==='boven'||locked())return;const dy=e.clientY-p.y;p.y=e.clientY;if(ids.size>1)return;C.pitchT=clamp(C.pitchT+dy*.006,mode==='ogen'?-1.15:-.35,mode==='ogen'?1.2:1.15)});
    const up=e=>ids.delete(e.pointerId);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
    c.addEventListener('wheel',e=>{if(mode!=='achter')return;if(G.driving)C.carD=clamp(C.carD*(e.deltaY>0?1.1:.9),5,16);else C.tpDT=clamp(C.tpDT*(e.deltaY>0?1.12:.89),2.4,10)},{passive:true})},200)})();

/* ---------- de camera zelf (elke frame, vanuit stad-game.js) ---------- */
const tmp=new TH.Vector3();
G.camRig=function(dt,cam){if(mode==='boven'||!G.ready){if(C.fov&&cam.fov!==G.fov0){cam.fov=G.fov0;cam.updateProjectionMatrix();C.fov=0}return false}
  if(!B)bmap();if(G.paused)unlock();
  const P=G.P,car=G.driving&&G.car?G.car:null;
  C.pitch+=(C.pitchT-C.pitch)*Math.min(1,dt*14);C.tpD+=(C.tpDT-C.tpD)*Math.min(1,dt*6);
  // in een gesprek: iets dichterbij
  const talk=G.talking&&!car&&G.lookAt;
  let yaw=G.yaw;const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
  const asp=innerWidth/innerHeight;let fov;
  if(mode==='achter'){fov=asp<1?68:56;
    let px,py,pz,d,p=C.pitch;
    if(car){px=car.x;pz=car.z;py=1.7;d=C.carD*(asp<1?1.35:1);p=clamp(p,.08,.9)}
    else{const por=asp<1,sh=talk?.25:por?.32:.62;px=P.x+rx*sh;pz=P.z+rz*sh;py=G.hidden?1.3:2.1;d=(talk?3.2:C.tpD)*(por?1.55:1);
      if(G.lookAt&&talk){px+=(G.lookAt.x-P.x)*.35;pz+=(G.lookAt.z-P.z)*.35}}
    const cp=Math.cos(p),sp=Math.sin(p),dx=Math.sin(yaw)*cp,dz=Math.cos(yaw)*cp;
    // niet door een muur: inschuiven tot de camera vrij staat
    let dd=d;for(let s=.4;s<=d;s+=.25){const x=px+dx*s,z=pz+dz*s,y=py+sp*s;if(wall(x,z)&&y<40){dd=Math.max(.6,s-.45);break}}
    let cy=py+sp*dd;if(cy<.35){cy=.35}
    C.pos.set(px+dx*dd,cy,pz+dz*dd);C.look.set(px,py+(car?.2:0),pz);
    if(!C.init){cam.position.copy(C.pos);C.init=true}else cam.position.lerp(C.pos,Math.min(1,dt*(car?10:16)));
    cam.lookAt(C.look);G.shadowC={x:px+fx*22,z:pz+fz*22}}
  else{// door je ogen
    fov=asp<1?78:66;let ex,ey,ez,ly=yaw;
    if(car){const cfx=Math.sin(car.ry),cfz=Math.cos(car.ry);ex=car.x+cfx*.35;ez=car.z+cfz*.35;ey=1.45;if(performance.now()-(G.manualRotT||0)>1200)G.yawT=car.ry+Math.PI}
    else{const v=Math.hypot(P.vx,P.vz);C.bob+=dt*v*1.9;const bob=v>.5?Math.sin(C.bob)*.045*Math.min(1,v/5):0;ex=P.x+fx*.28;ez=P.z+fz*.28;ey=(G.hidden?1.25:2.02)+bob;
      // je lichaam kijkt waar jij kijkt
      P.ry=yaw+Math.PI}
    const p=C.pitch,cp=Math.cos(p);C.pos.set(ex,ey,ez);cam.position.copy(C.pos);
    C.look.set(ex-Math.sin(ly)*cp*10,ey-Math.sin(p)*10,ez-Math.cos(ly)*cp*10);cam.lookAt(C.look);G.shadowC={x:ex+fx*26,z:ez+fz*26};C.init=false}
  if(G.camK&&G.camK>1.5){fov*=.8}
  if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix();C.fov=fov}
  dot.hidden=mode!=='ogen'||!!G.paused||!!car;
  if(sky)sky.position.copy(cam.position);
  return true};

/* ---------- lucht: verloop, zon of maan, sterren, pixelwolken ---------- */
let sky=null;
function makeSky(){const sc=G.scene&&G.scene();if(!sc)return false;
  const mat=new TH.ShaderMaterial({depthWrite:false,depthTest:true,fog:false,side:TH.BackSide,
    uniforms:{uHor:{value:new TH.Color()},uTop:{value:new TH.Color()},uSun:{value:new TH.Vector3(0,1,0)},uDay:{value:1},uCloud:{value:.4},uT:{value:0},uSunC:{value:new TH.Color(1,.9,.7)}},
    vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.99999;}',
    fragmentShader:`uniform vec3 uHor,uTop,uSun,uSunC;uniform float uDay,uCloud,uT;varying vec3 vD;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){vec3 d=normalize(vD);float y=d.y;
        float k=pow(clamp(y,0.,1.),.55);vec3 c=mix(uHor,uTop,k);
        if(y<0.)c=uHor*.92;
        // zon (overdag) of maan (nacht): een harde schijf met een zachte gloed
        float s=dot(d,normalize(uSun));c+=uSunC*pow(max(s,0.),60.)*.35*(.4+uDay);
        float disk=step(.9988,s);c=mix(c,uDay>.3?vec3(1.,.97,.88):vec3(.86,.9,1.),disk);
        // sterren
        if(uDay<.5&&y>0.){vec2 g=floor(d.xz/(y+.35)*160.);float st=step(.9965,h(g))*(1.-uDay*2.)*clamp(y*3.,0.,1.);c+=vec3(st*.8);}
        // wolken: blokkerig, getrapt (pixel-stijl)
        if(y>0.02){vec2 q=d.xz/(y+.12)*2.2+vec2(uT*.012,uT*.004);float w=n(q)*.6+n(q*2.3)*.3+n(q*5.1)*.1;
          float cl=smoothstep(.62-uCloud*.35,.78-uCloud*.3,w);cl=floor(cl*3.)/3.;
          vec3 cc=mix(uHor*1.08,vec3(1.),.55*uDay)*(.55+.45*uDay);cc=mix(cc,cc*.72,step(.5,1.-n(q*1.7+.3)));
          c=mix(c,cc,cl*clamp(y*6.,0.,1.)*.92);}
        gl_FragColor=vec4(c,1.);}`});
  sky=new TH.Mesh(new TH.SphereGeometry(400,24,14),mat);sky.renderOrder=-10;sky.frustumCulled=false;sc.add(sky);return true}
const hsl={};
function skyStep(dt){if(!sky&&!makeSky())return;const sc=G.scene();sky.visible=mode!=='boven'||(G.camK&&G.camK>1.5);if(!sky.visible)return;
  const u=sky.material.uniforms,bg=sc.background&&sc.background.isColor?sc.background:new TH.Color(.5,.6,.7);
  u.uHor.value.copy(sc.fog?sc.fog.color:bg);bg.getHSL(hsl);const day=G.day!=null?G.day:1;
  u.uTop.value.setHSL(hsl.h,Math.min(1,hsl.s*1.35+.08),hsl.l*(.62+.1*day));
  // het zonlicht komt van sunOff (vanaf het doel gezien): daar staat de zon. 's Nachts een vaste maan.
  const so=G.sunOff||{x:-40,y:80,z:25};if(day>.25)u.uSun.value.set(so.x,Math.max(so.y,8),so.z).normalize();else u.uSun.value.set(.4,.55,-.7).normalize();
  u.uDay.value=day;u.uT.value+=dt;const w=G.weer?G.weer():'helder';u.uCloud.value=w==='zon'?.08:w==='helder'?.25:w==='bewolkt'?.85:w==='mist'?.6:1;
  if(w==='regen'||w==='onweer'||w==='sneeuw'){u.uTop.value.lerp(u.uHor.value,.6)}}

/* ---------- knop, stip en hints ---------- */
const ICON='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.4"/></svg>';
const btn=document.createElement('button');btn.className='sd-b sd-camb';btn.id='sdCamB';btn.title='Camera wisselen (V)';btn.innerHTML=ICON+'<span>Camera</span><kbd>V</kbd>';
btn.addEventListener('click',e=>{e.stopPropagation();G.camNext()});
const dot=document.createElement('div');dot.className='sd-dot';dot.hidden=true;document.body.appendChild(dot);
const tip=document.createElement('div');tip.className='sd-camtip';tip.hidden=true;document.body.appendChild(tip);
function ui(){btn.querySelector('span').textContent=touch?NAME[mode]:'Camera';btn.classList.toggle('on',mode!=='boven');
  document.body.classList.toggle('sd-cam3',mode!=='boven');document.body.classList.toggle('sd-cam1',mode==='ogen');
  tip.hidden=touch||mode==='boven'||locked()||!!G.paused;tip.textContent='Klik in het beeld om rond te kijken met de muis · Esc laat los';}
const place=setInterval(()=>{const row=document.querySelector('.sd-btns');if(!row)return;clearInterval(place);row.insertBefore(btn,row.firstChild);ui()},200);
// hints in de toetsenbalk
const kh=setInterval(()=>{const k=document.getElementById('sdKeys');if(!k)return;clearInterval(kh);const s=document.createElement('span');s.innerHTML='<kbd>V</kbd>camera';const last=k.querySelector('.sd-beta');k.insertBefore(s,last)},300);
/* ---------- elke frame ---------- */
const hook=setInterval(()=>{if(!G.ready)return;clearInterval(hook);const f0=G.onFrame;G.onFrame=function(dt){f0&&f0(dt);try{skyStep(dt);if(G.paused&&locked())unlock();tip.hidden=touch||mode==='boven'||locked()||!!G.paused||!!G.talking}catch(e){console.error(e)}};
  if(mode!=='boven')setCam(mode,true);else ui()},100);
})();
