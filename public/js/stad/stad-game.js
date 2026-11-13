// Pixelstad: de wereld zelf. Scène, camera, licht (dag en nacht in speltijd: één speldag van 4 uur), lopen, botsen, voetgangers en de besturing.
// Getekend op lage resolutie en zonder vervaging opgeschaald: daardoor ziet alles er gepixeld uit.
(function(){
'use strict';
const TH=window.THREE,M=STAD_MAP,X=STAD_GFX;
const G={ready:false,paused:false,near:null,yaw:0,yawT:0,pitch:.92,dist:46,distT:46,pix:3};
window.STAD=G;
let renderer,scene,camera,sun,hemi,water,waterTex,cityMesh,ground,marks,humans,clock,rt,post,postCam,pools,CW=null;
const P={x:M.spawn.x,z:M.spawn.z,ry:Math.PI,vx:0,vz:0,ph:0,sp:0,run:false,path:null,goal:null};
G.P=P;
const NPC=[];const NPC_N=38;const ACT_MAX=30;G.actors=[];G.NPC=NPC;G.stam=1;G.shakeA=0;G.spMul=1;G.sunOff={x:-40,y:80,z:25};

/* ---------- uiterlijk ---------- */
const SKINS=['#e9b98f','#d9a27a','#b97a52','#8d5a3a','#f1caa5','#6e4630'];
const HAIRS=['#2a1d14','#4a2e1a','#151517','#8a6a3a','#c9a24a','#6a2a1a','#d8d4cc'];
const TOPS=['#3a4a6a','#7a2f2a','#2f5d3a','#d8d4cc','#2a2c30','#c28a2a','#5a3a7a','#2f6a8a','#8a8c90','#b04a6a'];
const PANTS=['#1d2531','#2c3a4d','#3a3c40','#4a3a2a','#1a1a1c','#5a5a62'];
function playerLook(){let L=null;try{L=typeof outfitLook==='function'?outfitLook():null}catch(e){}
  const look={skin:'#d9a27a',hair:'#2a1d14',top:'#30353e',arm:'#30353e',pants:'#1d2531',shoe:'#3a3f48',hat:'none'};
  try{const sk=localStorage.getItem('stad_skin');if(sk)look.skin=sk}catch(e){}
  if(!L)return look;
  const b=L.bovenlijf||{},h=L.hoofd||{},l=L.benen||{},s=L.schoenen||{};
  look.top=b.c||look.top;look.arm=b.kind==='tee'?look.skin:(b.c2&&b.kind!=='suit'?b.c:b.c)||look.top;
  if(b.kind==='suit'){look.arm=b.c}
  look.pants=l.c||look.pants;look.shoe=s.c||look.shoe;
  const hk=h.kind||'none';look.hat=hk==='cap'?'cap':hk==='hat'?'hat':hk==='beanie'?'beanie':hk==='skimask'?'mask':'none';look.hatC=h.c||'#2a2c30';
  return look}
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function npcLook(){const hat=Math.random()<.18?rnd(['cap','beanie','hat']):Math.random()<.06?'bald':'none',sk=rnd(SKINS);const t=rnd(TOPS);
  return {skin:sk,hair:rnd(HAIRS),top:t,arm:Math.random()<.4?sk:t,pants:rnd(PANTS),shoe:rnd(['#2a2c30','#e8e4da','#5a3a24','#3a3f48']),hat,hatC:rnd(TOPS)}}

/* ---------- speltijd: één speldag (4 uur, zoals de uitbetalingen in het klikspel: 00:00, 04:00, 08:00 …) is één dag en nacht ---------- */
// Een speluur duurt 10 echte minuten. De speldag begint om middernacht; de zon komt rond 05:00 op en gaat rond 21:00 onder
// ('s zomers iets later, 's winters iets eerder), zodat de nacht ongeveer een derde van de speldag is, met schemer ervoor en erna.
const GDAY=typeof DAY_MS!=='undefined'?DAY_MS:4*3600e3;
const blokStart=t=>{if(typeof dayStart==='function')return dayStart(t);const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.floor(d.getHours()/4)*4).getTime()};
const hhmm=h=>{const m=Math.floor(h*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
G.klok=function(t){t=t==null?Date.now():t;const s=blokStart(t),d=new Date(s),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),
    len=16+.9*Math.sin(2*Math.PI*(doy-80)/365),h=Math.max(0,Math.min(23.99,(t-s)/GDAY*24));
  return {h,rise:13-len/2,set:13+len/2,len,start:s,end:s+GDAY,txt:hhmm(h)}};
G.klokTxt=h=>hhmm(h);
// G.uur(h): echte tijd (ms) waarop het in de huidige speldag h uur is
G.uur=h=>{const k=G.klok();return k.start+h/24*GDAY};
function daylight(){const k=G.klok(),hr=k.h;
  const s=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};const day=hr<13?s((hr-k.rise+.7)/1.4):s((k.set+.7-hr)/1.4);
  if(G.forceDay!=null)return G.forceDay;return day}
function applyLight(){const day=daylight(),night=1-day;
  const sky=new TH.Color().setRGB(.08+.42*day,.1+.52*day,.16+.62*day);scene.background=sky;scene.fog.color=sky;
  hemi.intensity=.55+1.1*day;hemi.color.setRGB(.55+.45*day,.6+.4*day,.8+.2*day);hemi.groundColor.setRGB(.2+.15*day,.2+.12*day,.25);
  sun.intensity=.15+2.3*day;sun.color.setRGB(1,.86+.12*day,.7+.28*day);
  X.U.uNight.value=.22+night*.86;G.night=night;G.day=day;if(post)post.material.uniforms.uNight.value=night;if(pools)pools.material.opacity=Math.max(0,night-.15)*.7;
  if(G.onLight)try{G.onLight({day,night,scene,hemi,sun,post,pools})}catch(e){console.error(e)}}

/* ---------- opstarten ---------- */
G.init=function(host){
  clock=new TH.Clock();
  renderer=new TH.WebGLRenderer({antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(1);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=TH.BasicShadowMap;renderer.outputColorSpace=TH.SRGBColorSpace;
  const cv=renderer.domElement;cv.className='stad-cv';host.appendChild(cv);G.canvas=cv;
  scene=new TH.Scene();scene.fog=new TH.Fog(0x8899aa,70,190);
  camera=new TH.PerspectiveCamera(34,1,1,600);
  hemi=new TH.HemisphereLight(0xffffff,0x444444,1.2);scene.add(hemi);
  sun=new TH.DirectionalLight(0xffffff,2);sun.castShadow=true;const sm=matchMedia('(max-width:700px)').matches?1024:2048;sun.shadow.mapSize.set(sm,sm);
  const sc=sun.shadow.camera;sc.left=-50;sc.right=50;sc.top=50;sc.bottom=-50;sc.near=1;sc.far=220;sun.shadow.bias=-.0006;sun.shadow.normalBias=.04;scene.add(sun);scene.add(sun.target);
  // grond (water zit er als gaten in) en water eronder
  if(!(M.CHUNK&&X.chunkWorld)){const gtex=X.nearestTex(X.groundCanvas(),true);
  ground=new TH.Mesh(new TH.PlaneGeometry(M.W,M.H),new TH.MeshLambertMaterial({map:gtex,alphaTest:.5}));ground.rotation.x=-Math.PI/2;ground.position.set(M.W/2,0,M.H/2);ground.receiveShadow=true;scene.add(ground);G.ground=ground}
  const wc=document.createElement('canvas');wc.width=wc.height=32;const wx=wc.getContext('2d');wx.fillStyle='#1f4f6e';wx.fillRect(0,0,32,32);
  for(let i=0;i<46;i++){const x=Math.random()*32|0,y=Math.random()*32|0;wx.fillStyle=Math.random()<.5?'#2f6f92':'#174056';wx.fillRect(x,y,3+(Math.random()*3|0),1)}
  waterTex=X.nearestTex(wc);const WWd=Math.max(1400,M.W+900),WHd=Math.max(1260,M.H+900);waterTex.wrapS=waterTex.wrapT=TH.RepeatWrapping;waterTex.repeat.set(WWd/7,WHd/7);
  water=new TH.Mesh(new TH.PlaneGeometry(WWd,WHd),new TH.MeshLambertMaterial({map:waterTex}));water.rotation.x=-Math.PI/2;water.position.set(M.W/2,-.55,M.H/2);water.receiveShadow=true;scene.add(water);
  // de stad
  const at=X.nearestTex(X.atlas),lt=X.nearestTex(X.lit);
  // grote kaart (verhaalstad): stad en grond in stukken, alleen dichtbij getekend (zie chunkWorld in stad-gfx.js)
  if(M.CHUNK&&X.chunkWorld){CW=X.chunkWorld(scene,X.atlasMat(at,lt));G.chunks=CW;G.cityParts=CW.city;cityMesh=CW.city[0];G.city=cityMesh;G.ground={material:CW.loMat}}
  else{const gb=X.buildCity();
  cityMesh=gb.mesh(X.atlasMat(at,lt));cityMesh.castShadow=true;cityMesh.receiveShadow=true;scene.add(cityMesh);G.city=cityMesh}
  marks=X.placeMarks(scene);G.marks=marks;
  pools=X.lampPools(scene);
  makePost();
  humans=X.makeHumans(scene,1+NPC_N+48+ACT_MAX);
  if(G.lotsSetup)G.lotsSetup(scene);
  // voetgangers op de stoep
  for(let i=0;i<NPC_N;i++)NPC.push(spawnNpc(true));
  // laatst bekende plek
  try{const s=JSON.parse(localStorage.getItem('stad_pos')||'null');if(s&&M.canStand(s.x,s.z)){P.x=s.x;P.z=s.z;P.ry=s.ry||0;G.yaw=G.yawT=s.yaw||0}}catch(e){}
  P.look=playerLook();if(CW)CW.warm(P.x,P.z);
  applyLight();resize();addEventListener('resize',resize);
  input();G.ready=true;if(G.carsInit)try{G.carsInit()}catch(e){console.error(e)}G.resume();
  // de speltijd loopt zes keer zo snel als de klok: het licht vaker bijwerken
  setInterval(()=>{if(!G.paused)applyLight()},4000);setInterval(()=>{if(!G.paused)P.look=playerLook()},20000);
  setInterval(savePos,4000);
};
function savePos(){try{localStorage.setItem('stad_pos',JSON.stringify({x:+P.x.toFixed(1),z:+P.z.toFixed(1),ry:+P.ry.toFixed(2),yaw:+G.yawT.toFixed(2)}))}catch(e){}}
G.savePos=savePos;
// Pixelgrootte in echte schermpixels (geheel getal, anders worden de pixels ongelijk): de korte kant van het beeld is
// ongeveer 360 pixels hoog (Fijn 480, Grof 260). Zo ziet het er op elke telefoon en elk scherm hetzelfde uit.
function resize(){const dpr=Math.min(devicePixelRatio||1,3),w=innerWidth,h=innerHeight,minDev=Math.min(w,h)*dpr,target=(G.pixPref||480)*(G.camMode&&G.camMode!=='boven'?1.15:1);
  const k=Math.max(1,Math.round(minDev/target));G.pix=k/dpr;const rw=Math.ceil(w*dpr/k),rh=Math.ceil(h*dpr/k);
  renderer.setSize(rw,rh,false);if(rt)rt.setSize(rw,rh);if(post)post.material.uniforms.uRes.value.set(rw,rh);camera.aspect=w/h;camera.fov=w/h<1?Math.min(62,34/Math.max(.55,w/h)*.8):34;G.fov0=camera.fov;camera.updateProjectionMatrix()}
G.resize=()=>resize();
G.setPix=k=>{G.pixPref=k;try{localStorage.setItem('stad_pix',k||'')}catch(e){}resize()};
try{const k=+localStorage.getItem('stad_pix');if(k>=200)G.pixPref=k}catch(e){}

/* ---------- nabewerking: contouren, gloed, kleurdiepte (de 'moderne pixelgame'-look) ---------- */
function makePost(){
  rt=new TH.WebGLRenderTarget(2,2,{minFilter:TH.NearestFilter,magFilter:TH.NearestFilter,depthBuffer:true});
  rt.depthTexture=new TH.DepthTexture(2,2);rt.depthTexture.type=TH.UnsignedIntType;
  postCam=new TH.OrthographicCamera(-1,1,1,-1,0,1);
  const mat=new TH.ShaderMaterial({uniforms:{tColor:{value:rt.texture},tDepth:{value:rt.depthTexture},uRes:{value:new TH.Vector2(2,2)},cameraNear:{value:camera.near},cameraFar:{value:camera.far},uNight:{value:0},uOutline:{value:1},uTint:{value:new TH.Vector3(1,1,1)},uFlash:{value:new TH.Vector4(1,1,1,0)},uSat:{value:1.12},uVig:{value:.35},uAo:{value:1},uAoR:{value:1},uGrade:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`#include <packing>
      uniform sampler2D tColor,tDepth;uniform vec2 uRes;uniform float cameraNear,cameraFar,uNight,uOutline,uSat,uVig,uAo,uAoR,uGrade;uniform vec3 uTint;uniform vec4 uFlash;varying vec2 vUv;
      float ld(vec2 uv){return -perspectiveDepthToViewZ(texture2D(tDepth,uv).x,cameraNear,cameraFar);}
      vec3 toS(vec3 c){c=max(c,0.);return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
      float bayer(vec2 p){p=mod(floor(p),4.);float i=p.x+p.y*4.;
        return (i<1.?0.:i<2.?8.:i<3.?2.:i<4.?10.:i<5.?12.:i<6.?4.:i<7.?14.:i<8.?6.:i<9.?3.:i<10.?11.:i<11.?1.:i<12.?9.:i<13.?15.:i<14.?7.:i<15.?13.:5.)/16.-.5;}
      void main(){vec2 px=1./uRes;vec3 c=texture2D(tColor,vUv).rgb;float d=ld(vUv);
        float dl=ld(vUv-vec2(px.x,0.)),dr=ld(vUv+vec2(px.x,0.)),du=ld(vUv+vec2(0.,px.y)),dd=ld(vUv-vec2(0.,px.y));
        float th=d*.045+.25;
        float behind=max(max(d-dl,d-dr),max(d-du,d-dd));        // ik lig achter een buur: contourlijn
        float front=max(max(dl-d,dr-d),max(du-d,dd-d));         // ik lig voor een buur: lichte rand
        float edge=step(th,behind)*uOutline,rim=step(th,front)*(1.-edge)*uOutline;
        // schaduw in hoeken en tegen muren (uit de diepte): in 1/diepte is een vlak lineair, een binnenhoek ligt er 'achter'
        float w0=1./d,ao=0.,an=0.;
        for(int i=0;i<4;i++){vec2 dir=i==0?vec2(1.,0.):i==1?vec2(0.,1.):i==2?vec2(.7071,.7071):vec2(.7071,-.7071);
          for(int j=1;j<=3;j++){float r=float(j*j)+1.;vec2 o=dir*px*r*uAoR;float wa=1./ld(vUv+o),wb=1./ld(vUv-o);
            float ok=step(abs(wa-w0),w0*.35)*step(abs(wb-w0),w0*.35);ao+=clamp(((wa+wb)*.5-w0)/w0*14.,0.,1.)*ok;an+=1.;}}
        ao=ao/an;c*=1.-clamp(ao*1.9,0.,.55)*uAo;
        c=mix(c,c*.32,edge*.9);c+=c*rim*.12;
        // gloed van lichte dingen (ramen, neon, lampen), vooral 's nachts
        vec3 b=vec3(0.);
        for(int i=0;i<12;i++){float a=float(i)*.5236;vec2 o=vec2(cos(a),sin(a));
          vec3 s1=texture2D(tColor,vUv+o*px*1.6).rgb,s2=texture2D(tColor,vUv+o*px*3.4).rgb;
          b+=max(s1-.55,0.)*.9+max(s2-.55,0.)*.5;}
        c+=b*(.03+.055*uNight);
        // kleur: iets meer contrast en verzadiging
        vec3 s=toS(c)*uTint;float l=dot(s,vec3(.299,.587,.114));s=mix(vec3(l),s,uSat);s=(s-.5)*1.06+.5;
        // filmische kleur: koele schaduwen, warme lichten, een zachte S-curve
        float lg=dot(s,vec3(.299,.587,.114));vec3 gr=s*mix(vec3(.93,.97,1.07),vec3(1.05,1.0,.93),smoothstep(.15,.85,lg));gr=mix(gr,gr*gr*(3.-2.*gr),.28);s=mix(s,gr,uGrade);
        // vignet
        vec2 q=vUv-.5;float vg=dot(q,q);s*=1.-vg*uVig;s=mix(s,uFlash.rgb,uFlash.a*(.25+vg*2.2));
        // beperkte kleurdiepte met dither: echte pixel-art kleuren
        float lv=72.;s=floor(s*lv+bayer(gl_FragCoord.xy)*.6+.5)/lv;
        gl_FragColor=vec4(clamp(s,0.,1.),1.);}`,depthTest:false,depthWrite:false});
  post=new TH.Mesh(new TH.PlaneGeometry(2,2),mat);post.frustumCulled=false;
  G.post=post}

/* ---------- voetgangers ---------- */
const WT=M.T;
const sidewalk=(x,z)=>{x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return false;const i=z*M.W+x;if(M.solid[i])return false;const t=M.ground[i];return t===WT.WALK||t===WT.PLAZA||(t===WT.BRIDGE&&M.bridgeWalk[i])};
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
function spawnNpc(anywhere){for(let k=0;k<400;k++){let x,z;if(anywhere){x=10+Math.random()*(M.W-20);z=10+Math.random()*(M.H-20)}else{const a=Math.random()*Math.PI*2,r=35+Math.random()*45;x=P.x+Math.cos(a)*r;z=P.z+Math.sin(a)*r}
  if(sidewalk(x,z)&&M.canStand(x,z,.3)){const d=DIRS.filter(([a,b])=>sidewalk(x+a*1.5,z+b*1.5));if(!d.length)continue;const dd=rnd(d);
    if(!anywhere&&Math.hypot(x-P.x,z-P.z)<30)continue;const n={x,z,dx:dd[0],dz:dd[1],v:1.1+Math.random()*.7,ph:Math.random()*6,ry:Math.atan2(dd[0],dd[1]),look:npcLook(),turn:2+Math.random()*6,stop:0};G.npcInit&&G.npcInit(n);return n}}
  return {x:M.spawn.x,z:M.spawn.z,dx:1,dz:0,v:1.3,ph:0,ry:0,look:npcLook(),turn:3,stop:0}}
function npcStep(n,dt){
  if(G.npcBrain&&G.npcBrain(n,dt))return;
  if(n.stop>0){n.stop-=dt;n.sp=0;return}
  n.turn-=dt;const ax=n.x+n.dx*1.2,az=n.z+n.dz*1.2;
  if(!sidewalk(ax,az)||n.turn<0){const opts=DIRS.filter(([a,b])=>!(a===-n.dx&&b===-n.dz)&&sidewalk(n.x+a*1.6,n.z+b*1.6));
    const pick=opts.length?rnd(opts):[-n.dx,-n.dz];n.dx=pick[0];n.dz=pick[1];n.turn=3+Math.random()*8;if(Math.random()<.12)n.stop=1+Math.random()*3}
  // uitwijken voor de speler
  const px=n.x-P.x,pz=n.z-P.z,pd=Math.hypot(px,pz),R=G.driving?3.2:1.1+(G.ruim||0);let ox=0,oz=0;if(pd<R&&pd>.01){ox=px/pd*(R-pd)*(G.driving?8:3);oz=pz/pd*(R-pd)*(G.driving?8:3)}
  const nx=n.x+(n.dx*n.v+ox)*dt,nz=n.z+(n.dz*n.v+oz)*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;
  const tr=Math.atan2(n.dx,n.dz);let d=tr-n.ry;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;n.ry+=d*Math.min(1,dt*8);
  n.ph+=dt*n.v*(n.run?2.6:4.2);n.sp=n.run?1.15:.6;
  if(Math.hypot(n.x-P.x,n.z-P.z)>110){for(const k in n)delete n[k];Object.assign(n,spawnNpc(false))}}
G.spawnNpc=spawnNpc;

/* ---------- invoer ---------- */
const K={};G.K=K;G.joy={x:0,y:0,on:false};
function input(){
  const typing=e=>{const t=e.target;return t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)};
  addEventListener('keydown',e=>{if(G.paused||typing(e))return;const k=e.key.toLowerCase();
    if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' ','e'].includes(k)){K[k]=1;if(k.startsWith('arrow')||k===' ')e.preventDefault()}
    if(k==='f')K.f=1;
    if(k===' '||k==='f'||k==='enter'||k==='e'){if(G.missionAction&&G.missionAction()){e.preventDefault()}else if(!e.repeat&&k!=='f'&&G.interact&&G.interact()){e.preventDefault()}else if(G.near&&!e.repeat&&k!=='f'){e.preventDefault();G.onEnter&&G.onEnter(G.near)}}
    if((k==='z'||k==='q')&&!e.repeat){G.yawT+=Math.PI/4;G.manualRotT=performance.now()}if(k==='c'&&!e.repeat){G.yawT-=Math.PI/4;G.manualRotT=performance.now()}
    if((k==='+'||k==='=')&&!e.repeat)G.distT=Math.max(16,G.distT-6);if(k==='-'&&!e.repeat)G.distT=Math.min(70,G.distT+6);
    if(k==='j'&&!e.repeat)G.onPhone&&G.onPhone();if(k==='m'&&!e.repeat)G.onMap&&G.onMap();
    if(K.w||K.a||K.s||K.d||K.arrowup||K.arrowdown||K.arrowleft||K.arrowright)stopPath()});
  addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});
  addEventListener('blur',()=>{for(const k in K)K[k]=0});
  const cv=G.canvas;let drag=null;const pts=new Map();let pinch=null;
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('pointerdown',e=>{if(G.paused)return;cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:G.distT};drag=null;return}
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),moved:0,btn:e.button}});
  cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);G.distT=Math.max(16,Math.min(70,pinch.dist*pinch.d/Math.max(20,d)));return}
    if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;drag.moved+=Math.abs(dx)+Math.abs(e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;
    if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>8){G.yawT-=dx*.008;G.yaw=G.yawT;G.manualRotT=performance.now()}});
  const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!drag||drag.id!==e.pointerId)return;const d=drag;drag=null;
    if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<8&&performance.now()-d.t<600&&d.btn===0)click(e.clientX,e.clientY)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);drag=null;pinch=null});
  cv.addEventListener('wheel',e=>{e.preventDefault();G.distT=Math.max(16,Math.min(70,G.distT*(e.deltaY>0?1.12:.89)))},{passive:false});
}
const ray=new TH.Raycaster(),v2=new TH.Vector2(),plane=new TH.Plane(new TH.Vector3(0,1,0),0),hitP=new TH.Vector3();
function click(cx,cy){if(G.camClick&&G.camClick(cx,cy))return;v2.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v2,camera);
  // eerst de markeringen (ring, ruit, bord), dan de gebouwen, dan de grond
  for(const m of marks){if(!m.ring.visible&&!m.pin.visible)continue;const h=ray.intersectObjects([m.pin,m.sign,m.ring].filter(o=>o&&o.visible!==false),false);if(h.length){goPlace(m.p);return}}
  const hc=CW?ray.intersectObjects(CW.city.filter(m=>m.visible),false):ray.intersectObject(cityMesh,false),hl=ray.intersectObjects(G.lotMeshes||[],false);
  // je eigen panden (en borden 'te koop') als ze dichterbij zijn dan de rest van de stad
  if(hl.length&&(!hc.length||hl[0].distance<=hc[0].distance+.01)){const pl=hl[0].object.userData.pl;if(pl){goPlace(pl);return}}
  if(hc.length){const p=hc[0].point;const b=M.buildings.find(b=>p.x>=b.x0-.6&&p.x<=b.x1+.6&&p.z>=b.z0-.6&&p.z<=b.z1+.6);
    if(b&&b.pl){goPlace(M.placeById(b.pl));return}
    if(ray.ray.intersectPlane(plane,hitP)&&hitP.distanceTo(p)<3){goTo(hitP.x,hitP.z);return}
    goTo(p.x+hc[0].face.normal.x*1.5,p.z+hc[0].face.normal.z*1.5);return}
  if(ray.ray.intersectPlane(plane,hitP))goTo(hitP.x,hitP.z)}
function stopPath(){P.path=null;P.goal=null;G.onPath&&G.onPath(null)}
function goTo(x,z,goal){const path=M.findPath(P.x,P.z,x,z);if(!path||!path.length){G.toast&&G.toast('Daar kun je niet komen');return false}
  P.path=path;P.goal=goal||null;G.onPath&&G.onPath(path,goal);return true}
function goPlace(pl){if(!pl)return;if(Math.hypot(P.x-pl.door.x,P.z-pl.door.z)<2.4){G.onEnter&&G.onEnter(pl);return}goTo(pl.door.x,pl.door.z,pl)}
G.goTo=goTo;G.goPlace=goPlace;G.stopPath=stopPath;

/* ---------- elke frame ---------- */
let raf=0,last=0;
G.resume=function(){if(!G.ready)return;G.paused=false;G.canvas.style.visibility='';last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)};
G.pause=function(){G.paused=true;cancelAnimationFrame(raf);for(const k in K)K[k]=0;savePos()};
// na binnen zijn: buiten voor de deur staan, met je rug naar het gebouw
G.placeAtDoor=function(pl){const f=pl.face,o=f==='S'?[0,1]:f==='N'?[0,-1]:f==='E'?[1,0]:[-1,0];const p=M.nearestWalk(pl.door.x+o[0]*.6,pl.door.z+o[1]*.6,6)||pl.door;P.x=p.x;P.z=p.z;P.ry=Math.atan2(o[0],o[1]);
  G.yawT=G.yaw=Math.atan2(-o[0],-o[1])+Math.PI;stopPath()};
G.teleport=function(x,z){const p=M.nearestWalk(x,z,20);if(p){P.x=p.x;P.z=p.z;stopPath();if(CW)CW.warm(P.x,P.z)}};
function draw(){renderer.setRenderTarget(rt);renderer.render(scene,camera);renderer.setRenderTarget(null);renderer.render(post,postCam)}
const cutV=new TH.Vector3(),cutS=new TH.Vector2();
function frame(t){raf=requestAnimationFrame(frame);let dt=(t-last)/1000;if(!(dt>0))dt=0;dt=Math.min(.05,dt);last=t;if(G.paused)return;if(G.hitStop>0){G.hitStop-=dt;dt*=.05}step(dt,t/1000);draw()}
function step(dt,ts){
  if(G.carStep)G.carStep(dt);
  let v=0;
  if(!G.driving){
  // invoer → richting (ten opzichte van de camera)
  let ix=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0),iy=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0);
  if(G.joy.on){ix=G.joy.x;iy=G.joy.y;if(Math.hypot(ix,iy)>.15)stopPath()}
  if(G.talking||G.frozen>0){ix=iy=0;stopPath();if(G.frozen>0)G.frozen-=dt}
  if(G.hidden){if(Math.hypot(ix,iy)>.2&&G.unhide)G.unhide();else{ix=iy=0}}
  if((G.emote||G.sitting||G.pose)&&(Math.hypot(ix,iy)>.25||P.path)){if(G.poseLock){ix=iy=0;stopPath()}else G.standUp&&G.standUp()}
  let run=!!K.shift||(G.joy.on&&Math.hypot(G.joy.x,G.joy.y)>.86)||G.runToggle;if(G.noRun)run=false;
  const fx=-Math.sin(G.yaw),fz=-Math.cos(G.yaw),rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw);
  let mx=rx*ix+fx*iy,mz=rz*ix+fz*iy;
  if(P.path&&!mx&&!mz){const wp=P.path[0];const dx=wp.x-P.x,dz=wp.z-P.z,d=Math.hypot(dx,dz);
    if(d<.45){P.path.shift();if(!P.path.length){const g=P.goal;stopPath();if(g&&Math.hypot(P.x-g.door.x,P.z-g.door.z)<2.6)G.onEnter&&G.onEnter(g)}}
    else{mx=dx/d;mz=dz/d;run=run||d+pathLeft()>14}}
  const ml=Math.hypot(mx,mz);if(ml>1){mx/=ml;mz/=ml}
  // uithoudingsvermogen telt alleen als de politie achter je aan zit (G.useStam): sprinten kost adem, buiten adem ga je trager
  let sp=(run?9.5:5.2)*(G.spMul||1);if(G.useStam){const moving=Math.hypot(mx,mz)>.2;if(run&&moving){G.stam=Math.max(0,G.stam-dt*(G.stamDrain||.2)*(G.stamK||1))}else G.stam=Math.min(1,G.stam+dt*(G.stamRegen||.1));if(G.stam<=0&&run)sp=G.windSp||7.2}else G.stam=Math.min(1,G.stam+dt*.3);
  if(G.hidden)sp=0;
  const tvx=mx*sp,tvz=mz*sp,acc=Math.min(1,dt*12);P.vx+=(tvx-P.vx)*acc;P.vz+=(tvz-P.vz)*acc;
  const nx=P.x+P.vx*dt,nz=P.z+P.vz*dt;
  if(M.canStand(nx,P.z,.38))P.x=nx;else P.vx*=.2;if(M.canStand(P.x,nz,.38))P.z=nz;else P.vz*=.2;
  v=Math.hypot(P.vx,P.vz);
  if(v>.3){const tr=Math.atan2(P.vx,P.vz);let d=tr-P.ry;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;P.ry+=d*Math.min(1,dt*14)}
  const f0=Math.floor(P.ph/Math.PI);P.ph+=dt*v*1.25;P.sp=Math.min(1.3,v/4.2);if(v>1.5&&Math.floor(P.ph/Math.PI)!==f0&&G.onFoot)G.onFoot(v>7,v);
  }
  // dichtstbijzijnde ingang
  let best=null,bd=2.6;for(const m of marks){const d=Math.hypot(P.x-m.p.door.x,P.z-m.p.door.z);if(d<bd){bd=d;best=m.p}}
  if(best!==G.near){G.near=best;G.onNear&&G.onNear(best)}
  // camera
  let dy=G.yawT-G.yaw;G.yaw+=dy*Math.min(1,dt*8);const zk=G.camK!=null?G.camK:(G.talking&&!G.driving?.82:1);G.dist+=(G.distT*zk-G.dist)*Math.min(1,dt*(zk<1?3.5:6));
  const cp=Math.cos(G.pitch),spp=Math.sin(G.pitch);const tx=P.x+(G.camOff?G.camOff.x:0),tz=P.z+(G.camOff?G.camOff.z:0),ty=1.2;
  if(!(G.camRig&&G.camRig(dt,camera))){camera.position.set(tx+Math.sin(G.yaw)*cp*G.dist,ty+spp*G.dist,tz+Math.cos(G.yaw)*cp*G.dist);camera.lookAt(tx,ty,tz)}
  if(G.shakeA>.01){const a=G.shakeA;camera.position.x+=(Math.random()-.5)*a;camera.position.y+=(Math.random()-.5)*a;camera.position.z+=(Math.random()-.5)*a;G.shakeA*=Math.pow(.02,dt)}
  const shx=G.shadowC?G.shadowC.x:tx,shz=G.shadowC?G.shadowC.z:tz;sun.position.set(shx+G.sunOff.x,G.sunOff.y,shz+G.sunOff.z);sun.target.position.set(shx,0,shz);
  camera.updateMatrixWorld();if(CW)CW.step(camera,P.x,P.z,scene.fog.far);cutV.set(P.x,1.2,P.z).project(camera);const rs=renderer.getSize(cutS);X.U.uPS.value.set((cutV.x*.5+.5)*rs.x,(cutV.y*.5+.5)*rs.y);
  cutV.set(P.x,1.2,P.z).applyMatrix4(camera.matrixWorldInverse);X.U.uPZ.value=-cutV.z;X.U.uCutR.value=rs.y*.2*(G.paused||G.spelerWeg||(G.cut&&G.cut.active&&G.cut.active())||(G.camMode&&G.camMode!=='boven')?0:1);
  // mensen
  G.missionStep&&!G.paused&&G.missionStep(dt);
  const A=G.actors.slice(0,ACT_MAX);humans.count(1+NPC.length+A.length);humans.pose(0,{x:P.x,y:-60,z:P.z,ry:P.ry,ph:P.ph,sp:P.sp,look:P.look});if(G.avatarPose)G.avatarPose({x:P.x,z:P.z,ry:P.ry,ph:P.ph,sp:P.sp,v,dt,lean:v>7?.2:v>1?.05:0,hide:G.driving||G.camMode==='ogen'||!!G.spelerWeg,crouch:G.hidden,arm:G.pArm||0});
  NPC.forEach((n,i)=>{npcStep(n,dt);humans.pose(i+1,n)});A.forEach((a,i)=>humans.pose(1+NPC.length+i,a));humans.flush();humans.xray(false);
  // markeringen laten leven
  for(const m of marks){m.pin.rotation.y=ts*1.6;m.pin.position.y=3+Math.sin(ts*2.2+m.p.door.x)*.18;const s=1+Math.sin(ts*3)*.06;m.ring.scale.set(s,s,s);m.ring.material.opacity=G.near===m.p?1:(m.p.dyn&&!m.p.own?.4:.7)}
  waterTex.offset.x=(ts*.02)%1;waterTex.offset.y=(Math.sin(ts*.3)*.02);
  G.lotStep&&G.lotStep(dt);
  G.onFrame&&G.onFrame(dt)}
function pathLeft(){if(!P.path)return 0;let d=0,px=P.x,pz=P.z;for(const w of P.path){d+=Math.hypot(w.x-px,w.z-pz);px=w.x;pz=w.z}return d}
G.shake=a=>{G.shakeA=Math.max(G.shakeA,a)};
G.refreshLook=()=>{P.look=playerLook()};G.applyLight=()=>applyLight();
G.camera=()=>camera;G.render=draw;G.scene=()=>scene;G.renderer=()=>renderer;G.daylight=daylight;
})();
