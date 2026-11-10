// Realistischer voorbeeld van de stad (alleen lokaal, niet in het spel). Dezelfde kaart als de Pixelstad, maar zonder pixels:
// volle resolutie, zachte schaduwen, lucht, water met spiegeling, gevels met ramen, ronde auto's en mensen.
import * as THREE from 'three';
import {Sky} from 'three/addons/objects/Sky.js';
import {Water} from 'three/addons/objects/Water.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {rng,mk,canvasTex,Batch,clamp} from './r-util.js';
import {buildGround,CURB} from './r-ground.js';
import {buildBuildings} from './r-build.js';
import {buildProps} from './r-props.js';
import {makePerson,LOOKS} from './r-people.js';
import {SHOTS,TIMES} from './r-shots.js';

const M=window.STAD_MAP,Q=new URLSearchParams(location.search);
const log=(...a)=>console.log('[real] '+a.join(' '));
window.__stats={};
try{await main()}catch(e){console.error(e);window.__fail=String(e&&e.stack||e)}

async function main(){
  const S=Object.assign({},SHOTS[Q.get('shot')||'plein']);if(!S.focus)throw new Error('onbekend shot');
  if(Q.get('time'))S.time=Q.get('time');const TM=Object.assign({},TIMES[S.time||'dag'],S.tm||{});const night=!!TM.night,wet=!!(S.wet||TM.wet);
  const cv=document.getElementById('c'),Wd=innerWidth,Hd=innerHeight,PR=+(Q.get('pr')||1);
  const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(PR);renderer.setSize(Wd,Hd,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=TM.exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const [fx,fz]=S.focus,R=S.R||150;
  // ---- lucht en licht
  const sun=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(90-TM.sunEl),THREE.MathUtils.degToRad(TM.sunAz));
  const pm=new THREE.PMREMGenerator(renderer);
  if(!night){const sky=new Sky();sky.scale.setScalar(450000);const u=sky.material.uniforms;u.turbidity.value=TM.turb;u.rayleigh.value=TM.ray;u.mieCoefficient.value=TM.mie;u.mieDirectionalG.value=.82;u.sunPosition.value.copy(sun);
    scene.add(sky);
    // omgevingslicht voor spiegelingen: een getekende lucht (verloop, zon, grond) in plaats van de luchtshader zelf
    const ec=mk(1024,512),ex=ec.getContext('2d'),g=ex.createLinearGradient(0,0,0,512);const E=TM.envC||['#2f6fc4','#8fb8e8','#dbe9f6','#9a968c','#6a665e'];
    g.addColorStop(0,E[0]);g.addColorStop(.36,E[1]);g.addColorStop(.497,E[2]);g.addColorStop(.503,E[3]);g.addColorStop(1,E[4]);ex.fillStyle=g;ex.fillRect(0,0,1024,512);
    // zon: richting → plek in de kaart
    const su=.5+Math.atan2(sun.x,-sun.z)/(2*Math.PI),sv=.5-Math.asin(sun.y)/Math.PI;[su-1,su,su+1].forEach(u=>{const rg=ex.createRadialGradient(u*1024,sv*512,0,u*1024,sv*512,170);rg.addColorStop(0,'rgba(255,250,235,1)');rg.addColorStop(.08,'rgba(255,240,210,.9)');rg.addColorStop(.35,TM.sunGlow||'rgba(255,236,200,.28)');rg.addColorStop(1,'rgba(255,236,200,0)');ex.fillStyle=rg;ex.fillRect(0,0,1024,512)});
    const et=new THREE.CanvasTexture(ec);et.mapping=THREE.EquirectangularReflectionMapping;et.colorSpace=THREE.SRGBColorSpace;if(Q.get('env')!=='0'){scene.environment=pm.fromEquirectangular(et).texture;scene.environmentIntensity=TM.env==null?1.25:TM.env}}
  else{// nachtlucht: donker verloop met sterren en een beetje stadsgloed
    const c=mk(1024,512),x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#04060d');gr.addColorStop(.45,'#0a1020');gr.addColorStop(.5,'#1a1f33');gr.addColorStop(.52,'#241d22');gr.addColorStop(1,'#0a0a0c');x.fillStyle=gr;x.fillRect(0,0,1024,512);
    const r=rng(5);for(let i=0;i<500;i++){x.fillStyle=`rgba(255,255,255,${.25+r()*.6})`;x.fillRect(r()*1024,r()*235,1,1)}
    const t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;scene.background=t;scene.backgroundIntensity=1;
    const rt=pm.fromEquirectangular(t);scene.environment=rt.texture;scene.environmentIntensity=TM.env==null?.5:TM.env}
  const hemi=new THREE.HemisphereLight(TM.hemi[0],TM.hemi[1],TM.hemi[2]);scene.add(hemi);
  const dl=new THREE.DirectionalLight(TM.sunC,TM.sunI);dl.position.set(fx+sun.x*260,sun.y*260,fz+sun.z*260);dl.target.position.set(fx,0,fz);scene.add(dl,dl.target);
  dl.castShadow=true;const SR=S.shadowR||Math.min(R,130);Object.assign(dl.shadow.camera,{left:-SR,right:SR,top:SR,bottom:-SR,near:20,far:620});dl.shadow.mapSize.set(4096,4096);dl.shadow.bias=-.0003;dl.shadow.normalBias=.06;dl.shadow.radius=TM.soft||2.5;dl.shadow.camera.updateProjectionMatrix();
  scene.fog=new THREE.FogExp2(TM.fog[0],TM.fog[1]);
  // ---- wereld
  const t0=performance.now();
  const G=buildGround(M,{cx:fx,cz:fz,R,wet,PX:S.PX||6,near:!!S.cam.at});scene.add(G.grp);log('grond',Math.round(performance.now()-t0)+'ms');
  const batch=new Batch(),mats={},extra={lamps:[],lights:[],people:[]};
  const camPos=new THREE.Vector3(),camTgt=new THREE.Vector3();placeCam(S,camPos,camTgt);
  const ctx={THREE,M,S,TM,night,wet,scene,batch,mats,extra,fx,fz,R,G,camPos,rand:rng(S.seed||42)};
  buildBuildings(ctx);log('gebouwen',Math.round(performance.now()-t0)+'ms');
  buildProps(ctx);log('spullen',Math.round(performance.now()-t0)+'ms');
  batch.build(scene,mats,{noShadow:['glow','lampHeadOn','spill','spillP']});
  // ---- water
  const wn=waterNormals();const water=new Water(new THREE.PlaneGeometry(R*2+80,R*2+80),{textureWidth:1024,textureHeight:1024,waterNormals:wn,sunDirection:sun.clone(),sunColor:night?0x223355:TM.sunC,waterColor:night?0x05121a:0x16424f,distortionScale:night?.7:.85,fog:true,alpha:1});
  water.rotation.x=-Math.PI/2;water.position.set(fx,-.62,fz);water.material.uniforms.size.value=13;water.material.uniforms.time.value=7.3;scene.add(water);
  // ---- mensen
  (S.people||[]).forEach(p=>{const o=makePerson(p.look||LOOKS[p.l||0],p);o.position.set(p.x,G.hAt(p.x,p.z)+(p.y||0),p.z);o.rotation.y=p.ry||0;scene.add(o);extra.people.push(o)});
  if(S.crowd){const r=rng(S.crowd.seed||9);let n=0,tries=0;while(n<S.crowd.n&&tries++<4000){const x=fx+(r()-.5)*2*(S.crowd.r||40),z=fz+(r()-.5)*2*(S.crowd.r||40),t=G.at(Math.floor(x),Math.floor(z));if(t!==M.T.WALK&&t!==M.T.PLAZA)continue;if(!M.canStand(x,z,.5))continue;
      if((S.people||[]).some(p=>Math.hypot(p.x-x,p.z-z)<1.6))continue;const o=makePerson(LOOKS[Math.floor(r()*LOOKS.length)],{pose:r()<.7?'loop':r()<.5?'sta':'bel',ph:r()*6.28,seed:Math.floor(r()*1e6)});o.position.set(x,G.hAt(x,z),z);o.rotation.y=Math.floor(r()*4)*Math.PI/2+(r()-.5)*.5;scene.add(o);n++}}
  // ---- lampen in de nacht
  if(night){const L=extra.lamps.slice().sort((a,b)=>Math.hypot(a.x-camTgt.x,a.z-camTgt.z)-Math.hypot(b.x-camTgt.x,b.z-camTgt.z));
    L.slice(0,S.lights||12).forEach(l=>{const p=new THREE.PointLight(0xffc27a,TM.lampI||55,26,1.8);p.position.set(l.x,l.y-.15,l.z);scene.add(p)});
    (extra.lights||[]).forEach(l=>{const p=new THREE.PointLight(l.c,l.i,l.d||18,1.8);p.position.set(l.x,l.y,l.z);scene.add(p)})}
  if(wet)scene.add(rain(fx,fz,camPos,night));
  // ---- camera en nabewerking
  const cam=new THREE.PerspectiveCamera(S.fov||40,Wd/Hd,.3,1400);cam.position.copy(camPos);cam.lookAt(camTgt);
  const rtt=new THREE.WebGLRenderTarget(Wd*PR,Hd*PR,{samples:4,type:THREE.HalfFloatType});
  const comp=new EffectComposer(renderer,rtt);comp.setPixelRatio(PR);comp.setSize(Wd,Hd);comp.addPass(new RenderPass(scene,cam));
  if(Q.get('ao')!=='0'){const ao=new GTAOPass(scene,cam,Wd*PR,Hd*PR);ao.blendIntensity=TM.ao==null?1:TM.ao;ao.updateGtaoMaterial({radius:S.aoR||.9,distanceExponent:1,thickness:1.2,scale:1.1,samples:16,screenSpaceRadius:false});comp.addPass(ao)}
  let bk=null;if(S.dof){bk=new BokehPass(scene,cam,{focus:S.dof.focus,aperture:S.dof.ap||.00012,maxblur:S.dof.max||.006});comp.addPass(bk)}
  const bl=new UnrealBloomPass(new THREE.Vector2(Wd*PR,Hd*PR),TM.bloom[0],TM.bloom[1],TM.bloom[2]);comp.addPass(bl);
  comp.addPass(new OutputPass());
  comp.addPass(new ShaderPass(Grade(TM)));
  const frame=Q.get('raw')?()=>{renderer.render(scene,cam)}:()=>{comp.render()};
  // portret voor het gesprek: eerst een close-up maken en bewaren, dan het echte beeld
  if(S.portrait){const P=S.portrait;cam.fov=P.fov||22;cam.position.set(P.cam[0],P.cam[1],P.cam[2]);cam.lookAt(P.at[0],P.at[1],P.at[2]);cam.updateProjectionMatrix();if(bk)bk.uniforms.focus.value=P.focus||1;frame();frame();window.__portrait=cv.toDataURL('image/jpeg',.92);if(bk)bk.uniforms.focus.value=S.dof.focus;
    cam.fov=S.fov||40;cam.position.copy(camPos);cam.lookAt(camTgt);cam.updateProjectionMatrix()}
  frame();frame();
  window.__stats={tris:renderer.info.render.triangles,calls:renderer.info.render.calls,tex:renderer.info.memory.textures,ms:Math.round(performance.now()-t0)};
  if(S.ui){const {buildUI}=await import('./r-ui.js');buildUI(S,window.__portrait)}
  window.__render=frame;window.__ready=true;
}

function placeCam(S,pos,tgt){const [fx,fz]=S.focus;const c=S.cam;
  if(c.at){pos.set(c.pos[0],c.pos[1],c.pos[2]);tgt.set(c.at[0],c.at[1],c.at[2]);return}
  // spelcamera: schuin van boven, yaw = kijkrichting (0 = naar het noorden)
  const p=THREE.MathUtils.degToRad(c.pitch||54),y=THREE.MathUtils.degToRad(c.yaw||0),d=c.dist||36;tgt.set(fx,1,fz);pos.set(fx+Math.sin(y)*Math.cos(p)*d,1+Math.sin(p)*d,fz+Math.cos(y)*Math.cos(p)*d)}

function waterNormals(){const n=256,c=mk(n,n),x=c.getContext('2d'),im=x.createImageData(n,n),h=new Float32Array(n*n),r=rng(3);
  // som van golven die naadloos herhalen
  const W=[];for(let i=0;i<46;i++){const f=5+r()*34,a=r()*6.28;W.push([Math.round(Math.cos(a)*f),Math.round(Math.sin(a)*f),r()*6.28,.5+r()*.9])}
  for(let y=0;y<n;y++)for(let xx=0;xx<n;xx++){let v=0;W.forEach(([a,b,p,am])=>{v+=Math.sin((a*xx+b*y)/n*6.2832+p)*am/(1+Math.hypot(a,b)*.12)});h[y*n+xx]=v}
  for(let y=0;y<n;y++)for(let xx=0;xx<n;xx++){const l=h[y*n+((xx+n-1)%n)],rr=h[y*n+((xx+1)%n)],u=h[((y+n-1)%n)*n+xx],d=h[((y+1)%n)*n+xx];let nx=(l-rr)*.9,ny=(u-d)*.9,nz=1;const k=1/Math.hypot(nx,ny,nz);const i=(y*n+xx)*4;im.data[i]=(nx*k*.5+.5)*255;im.data[i+1]=(ny*k*.5+.5)*255;im.data[i+2]=(nz*k*.5+.5)*255;im.data[i+3]=255}
  x.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}

function rain(fx,fz,cam,night){const n=5200,p=new Float32Array(n*6),r=rng(77);for(let i=0;i<n;i++){const x=cam.x+(r()-.5)*90+(fx-cam.x)*.5,z=cam.z+(r()-.5)*90+(fz-cam.z)*.5,y=r()*26,l=.5+r()*.5;p[i*6]=x;p[i*6+1]=y;p[i*6+2]=z;p[i*6+3]=x+.05;p[i*6+4]=y+l;p[i*6+5]=z+.03}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:night?0xaec6ff:0xdfe8f0,transparent:true,opacity:night?.2:.25,depthWrite:false}))}

// lichte kleurcorrectie en vignet
function Grade(TM){return {uniforms:{tDiffuse:{value:null},uVig:{value:TM.vig==null?.22:TM.vig},uSat:{value:TM.sat==null?1.06:TM.sat},uTint:{value:new THREE.Color(TM.tint||0xffffff)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uVig,uSat;uniform vec3 uTint;varying vec2 vUv;
   void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,uSat)*uTint;vec2 d=vUv-.5;c.rgb*=1.-uVig*smoothstep(.25,.85,length(d)*1.25);gl_FragColor=c;}`}}
