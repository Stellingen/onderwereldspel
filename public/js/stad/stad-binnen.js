// Verhaal: interieurs (G.binnen). Aparte pixel-ruimtes waar je echt in loopt: eigen licht, meubels, figuranten, botsing en camera.
// Ze liggen ver buiten de stad (x ≥ 5000) zodat niets van de stad in beeld komt; binnen is de stad verborgen en staan verkeer en
// voorbijgangers stil. Alle drie de camerastanden werken: bovenaf (muren aan jouw kant zakken weg), achter je (de camera blijft
// binnen de muren), door je ogen (met plafond).
//   G.binnen.add(id,{naam, w, h, bouw(B), spawn:{x,z,ry}, deur:{x,z}, anker:()=>({x,z}), buiten(B2,deur), licht:{bg,hemi,grond,int,zon,gloed,tint}, cam:{k}})
//   await G.binnen.in(id,{fade:true}) · await G.binnen.uit() · G.binnen.waar() → id of null
//   G.binnen.p(id,x,z) → [x,z] in de wereld (voor cutscènes) · G.binnen.o(id) → oorsprong · G.binnen.plek(id,naam) → {x,y,z} (tafels voor G.draag.af)
//   G.binnen.extra(id,naam) → figurant (poppetje van G.cut.persoon) · G.binnen.plekken(id) → verstopplekken e.d. · G.binnen.slot(id,dicht,tekst)
//   G.binnen.deurBuiten(id) → {x,z} van de buitendeur in de stad
// Coördinaten in bouw() zijn lokaal: (0,0) is de hoek van het interieur, x naar rechts, z naar beneden (zuiden), y omhoog, in meters.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const DEF={},BUILT={};let inside=null,wasOut=null,hidden=[],slotN=0;
const CELL=.25,ORIG={x:5200,z:5200};
const LMUL=6;   // puntlichten: r185 rekent fysiek (candela), de waarden in de interieurs zijn relatief
const B0=G.binnen={rigHooked:true};

/* =================== texturen (pixels, met een vaste toevalsreeks) =================== */
function rng(seed){let s=seed>>>0||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return ((s>>>0)%100000)/100000}}
const shade=K.shade;
const TEX={};
function canvasTex(key,w,h,draw){if(TEX[key])return TEX[key];const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;draw(c,w,h,rng(key.length*977+w*13+h));
  const t=new TH.CanvasTexture(cv);t.magFilter=TH.NearestFilter;t.minFilter=TH.NearestFilter;t.generateMipmaps=false;t.colorSpace=TH.SRGBColorSpace;t.wrapS=t.wrapT=TH.RepeatWrapping;TEX[key]=t;return t}
const R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
// ruis op een kleur
function noise(c,w,h,r,base,amt,n){R(c,0,0,w,h,base);for(let i=0;i<(n||w*h*.35);i++){const x=r()*w|0,y=r()*h|0;R(c,x,y,1,1,shade(base,1+(r()-.5)*amt))}}
const T={
  stuc:(col)=>canvasTex('stuc'+col,32,32,(c,w,h,r)=>noise(c,w,h,r,col,.12)),
  beton:(col)=>canvasTex('beton'+col,32,32,(c,w,h,r)=>{noise(c,w,h,r,col,.18);for(let i=0;i<5;i++)R(c,r()*w|0,r()*h|0,2+(r()*4|0),1,shade(col,.8))}),
  planken:(col)=>canvasTex('planken'+col,32,32,(c,w,h,r)=>{for(let y=0;y<h;y+=4){const k=.85+r()*.3;R(c,0,y,w,4,shade(col,k));R(c,0,y+3,w,1,shade(col,k*.72));const o=r()*w|0;R(c,o,y,1,3,shade(col,k*.7));for(let i=0;i<6;i++)R(c,r()*w|0,y+(r()*3|0),2,1,shade(col,k*(.9+r()*.2)))}}),
  parket:(col)=>canvasTex('parket'+col,32,32,(c,w,h,r)=>{for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){const k=.85+r()*.25,v=((x+y)/8)%2;for(let i=0;i<4;i++){if(v)R(c,x+i*2,y,2,8,shade(col,k*(i%2?.92:1)));else R(c,x,y+i*2,8,2,shade(col,k*(i%2?.92:1)))}}}),
  tegels:(a,b,n)=>canvasTex('tegels'+a+b+n,32,32,(c,w,h,r)=>{const s=w/(n||4);for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){const col=((x+y)/s)%2?a:b;R(c,x,y,s,s,shade(col,.95+r()*.08));R(c,x,y,s,1,shade(col,1.08));R(c,x,y+s-1,s,1,shade(col,.82))}}),
  wandtegel:(col)=>canvasTex('wandtegel'+col,32,32,(c,w,h,r)=>{R(c,0,0,w,h,shade(col,.8));for(let y=0;y<h;y+=4)for(let x=(y/4)%2?-4:0;x<w;x+=8){R(c,x+1,y+1,7,3,shade(col,.97+r()*.06));R(c,x+1,y+1,7,1,shade(col,1.1))}}),
  baksteen:(col)=>canvasTex('baksteen'+col,32,32,(c,w,h,r)=>{R(c,0,0,w,h,'#9a8f80');for(let y=0;y<h;y+=4)for(let x=(y/4)%2?-4:0;x<w;x+=8){const k=.85+r()*.3;R(c,x,y,7,3,shade(col,k));R(c,x,y,7,1,shade(col,k*1.12))}}),
  behang:(a,b)=>canvasTex('behang'+a+b,16,32,(c,w,h,r)=>{noise(c,w,h,r,a,.06,60);for(let x=0;x<w;x+=8){R(c,x+3,0,2,h,b)}for(let y=4;y<h;y+=8)R(c,6,y,4,2,shade(b,1.1))}),
  tapijt:(col)=>canvasTex('tapijt'+col,16,16,(c,w,h,r)=>noise(c,w,h,r,col,.2,200)),
  schoolbord:()=>canvasTex('bord',64,32,(c,w,h,r)=>{noise(c,w,h,r,'#2f4a3a',.1,300);for(let i=0;i<40;i++){c.globalAlpha=.08;R(c,r()*w|0,r()*h|0,6,1,'#e8e4da')}c.globalAlpha=1}),
  zellige:(a,b,c2)=>canvasTex('zellige'+a+b+c2,16,16,(c,w,h,r)=>{R(c,0,0,w,h,a);for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){R(c,x+3,y,2,8,b);R(c,x,y+3,8,2,b);R(c,x+3,y+3,2,2,c2);R(c,x,y,1,1,c2)}}),
  linoleum:(col)=>canvasTex('lino'+col,32,32,(c,w,h,r)=>{noise(c,w,h,r,col,.08,180);for(let i=0;i<14;i++){c.globalAlpha=.25;R(c,r()*w|0,r()*h|0,3,1,shade(col,.8))}c.globalAlpha=1})};
B0.tex=T;B0.canvasTex=canvasTex;
// plaatjes (schilderijen, posters, foto's, schermen): canvas → vlak
function plaatCanvas(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;draw(c,w,h);return cv}
B0.plaatCanvas=plaatCanvas;

/* =================== bouwen =================== */
const MATS={};
function mat(tex,col,glow){const k=(tex?tex.uuid:'')+'|'+(col||'')+'|'+(glow?1:0);if(MATS[k])return MATS[k];const o={};if(tex)o.map=tex;if(col)o.color=new TH.Color(col);MATS[k]=glow?new TH.MeshBasicMaterial(o):new TH.MeshLambertMaterial(o);return MATS[k]}
// doos met textuur in wereldmaat (ts = meters per textuur)
function uvBox(w,h,d,ts){const g=new TH.BoxGeometry(w,h,d),uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*dims[f][0]/ts,uv.getY(i)*dims[f][1]/ts)}return g}
function uvPlane(w,h,ts){const g=new TH.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/ts,uv.getY(i)*h/ts);return g}
function rotP(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry);return [x*c+z*s,-x*s+z*c]}
function build(id){const d=DEF[id];if(BUILT[id])return BUILT[id];const sc=G.scene(),root=new TH.Group();root.position.set(d.o.x,0,d.o.z);root.visible=false;sc.add(root);
  const W=d.w||24,H=d.h||20,gw=Math.ceil(W/CELL),gh=Math.ceil(H/CELL),grid=new Uint8Array(gw*gh);
  const S={id,d,root,W,H,gw,gh,grid,bx:[],walls:[],ceils:[],lights:[],ticks:[],extras:{},plekken:{},verstop:{},spots:[],persons:[],smoke:[],hoog:[]};
  const mark=(x0,z0,x1,z1,v)=>{for(let z=Math.floor(z0/CELL);z<Math.ceil(z1/CELL);z++)for(let x=Math.floor(x0/CELL);x<Math.ceil(x1/CELL);x++)if(x>=0&&z>=0&&x<gw&&z<gh)grid[z*gw+x]=Math.max(grid[z*gw+x],v)};
  const Bp={W,H,T,tex:T,o:d.o,root,
    box:(w,h,dd,x,y,z,col,glow,ry)=>{S.bx.push([w,h,dd,x,y,z,col,glow?1:0,ry||0])},
    // meubel: lijst blokjes [w,h,d,x,y,z,kleur,gloei] rond (0,0), op plek (x,z) gedraaid met ry
    meubel:(boxes,x,z,ry,o)=>{ry=ry||0;boxes.forEach(b=>{const p=rotP(b[3],b[5],ry);S.bx.push([b[0],b[1],b[2],x+p[0],b[4],z+p[1],b[6],b[7]?1:0,(b[8]||0)+ry])});
      if(o&&o.solid){const s=o.solid;const q=Math.abs(Math.sin(ry))>.7;const hw=(q?s[1]:s[0])/2,hd=(q?s[0]:s[1])/2;mark(x-hw,z-hd,x+hw,z+hd,o.hoog?2:1)}},
    solid:(x0,z0,x1,z1,hoog)=>mark(x0,z0,x1,z1,hoog?2:1),
    vloer:(x0,z0,x1,z1,tex,ts,col)=>{const m=new TH.Mesh(uvPlane(x1-x0,z1-z0,ts||2),mat(tex,col));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.01,(z0+z1)/2);m.receiveShadow=true;root.add(m);return m},
    // muur als blok; n = richting de kamer in ([0,1] = naar het zuiden). Zonder n: binnenmuur (zakt weg aan de kant van de camera)
    muur:(x0,z0,x1,z1,o)=>{o=o||{};const h=o.h||3.4,w=x1-x0,dd=z1-z0,ts=o.ts||2;const m=new TH.Mesh(uvBox(w,h,dd,ts),mat(o.tex||null,o.tex?null:(o.kleur||'#8a8478')));m.position.set((x0+x1)/2,h/2,(z0+z1)/2);m.castShadow=true;m.receiveShadow=true;root.add(m);
      const sh=o.stub||.32;const st=new TH.Mesh(uvBox(w,sh,dd,ts),mat(o.tex||null,o.tex?null:(o.kleur||'#8a8478')));st.position.set((x0+x1)/2,sh/2,(z0+z1)/2);st.visible=false;st.receiveShadow=true;root.add(st);
      const cap=new TH.Mesh(new TH.BoxGeometry(w+.02,.05,dd+.02),mat(null,o.rand||'#1a1714'));cap.position.set((x0+x1)/2,sh+.02,(z0+z1)/2);cap.visible=false;root.add(cap);
      const extra=[];S.walls.push({m,st,cap,extra,n:o.n||null,c:{x:(x0+x1)/2,z:(z0+z1)/2},ax:w>=dd?'x':'z',x0,x1,z0,z1,cut:false,nooit:!!o.nooit});mark(x0,z0,x1,z1,2);return S.walls[S.walls.length-1]},
    // dingen die aan een muur hangen (verdwijnen mee als de muur wegzakt)
    aanMuur:(wall,obj)=>{wall.extra.push(obj);return obj},
    plafond:(x0,z0,x1,z1,h,col,tex)=>{const m=new TH.Mesh(uvPlane(x1-x0,z1-z0,2),mat(tex||null,tex?null:(col||'#2a2622')));m.rotation.x=Math.PI/2;m.position.set((x0+x1)/2,h,(z0+z1)/2);root.add(m);S.ceils.push(m);return m},
    licht:(x,y,z,col,int,dist,o)=>{o=o||{};int*=LMUL;const l=new TH.PointLight(col,int,(dist||10)*1.3,o.decay!=null?o.decay:1.5);l.position.set(x,y,z);root.add(l);S.lights.push({l,base:int,o});return l},
    plaat:(cv,w,h,x,y,z,ry,o)=>{o=o||{};const t=cv.isTexture?cv:new TH.CanvasTexture(cv);if(!cv.isTexture){t.magFilter=t.minFilter=TH.NearestFilter;t.generateMipmaps=false;t.colorSpace=TH.SRGBColorSpace}
      const m=new TH.Mesh(new TH.PlaneGeometry(w,h),o.glow?new TH.MeshBasicMaterial({map:t,transparent:!!o.alpha}):new TH.MeshLambertMaterial({map:t,transparent:!!o.alpha}));m.position.set(x,y,z);m.rotation.y=ry||0;m.receiveShadow=!o.glow;root.add(m);if(o.muur)o.muur.extra.push(m);return m},
    persoon:(who,o)=>{o=o||{};if(!G.cut||!G.cut.persoon)return null;const a=G.cut.persoon(who,Object.assign({},o,{x:d.o.x+(o.x||0),z:d.o.z+(o.z||0)}));a.binnen=id;a.g.binnenId=1;a.g.visible=false;a.slaap=true;S.persons.push(a);if(o.naam)S.extras[o.naam]=a;return a},
    // rook (lokale coördinaten); geeft de bron terug, zodat je rate/x/y/z later kunt aanpassen (uitblazen)
    rook:(x,y,z,o)=>{const e=Object.assign({x,y,z,rate:1.2,acc:Math.random(),kleur:'#d8d4e8',life:3.2,rise:.55,spread:.35,size:.5},o||{});e.x=x;e.y=y;e.z=z;S.smoke.push(e);return e},
    plek:(naam,x,y,z,ry)=>{S.plekken[naam]={x:d.o.x+x,y,z:d.o.z+z,ry:ry||0}},
    verstop:(naam,x,z,label)=>{S.verstop[naam]={x:d.o.x+x,z:d.o.z+z,n:label||naam}},
    spot:o=>{S.spots.push(o)},
    tick:f=>{S.ticks.push(f)},
    hoog:(m)=>{S.hoog.push(m)}};
  try{d.bouw(Bp)}catch(e){console.error('interieur '+id,e)}
  if(S.bx.length){const m=K.model(S.bx);m.traverse(o=>{if(o.isMesh){o.receiveShadow=true}});root.add(m)}
  // rook: één puntenwolk per interieur
  if(S.smoke.length)S.puffs=mkPuffs(root,S);
  // plekken waar je iets kunt (G.spot uit stad-doen.js), alleen zichtbaar als je hier binnen bent
  S.spots.forEach(o=>{const sp=Object.assign({},o,{story:1,k:o.k||'binnen',x:d.o.x+o.x,z:d.o.z+o.z,prio:o.prio!=null?o.prio:1,show:()=>inside===id&&!(G.cut&&G.cut.active())&&(!o.show||o.show())});if(G.spot)o._spot=G.spot(sp)});
  // de uitgang
  if(d.deur&&G.spot)S.uitSpot=G.spot({story:1,k:'binnen',x:d.o.x+d.deur.x,z:d.o.z+d.deur.z,r:1.9,prio:1,n:'Naar buiten',sub:d.naam,col:'#a9dcff',h:2.4,show:()=>inside===id&&!(G.cut&&G.cut.active())&&!d.uitDicht,act:()=>B0.uit()});
  BUILT[id]=S;return S}

/* =================== rook =================== */
function mkPuffs(root,S){const N=S.smoke.length*26,pos=new Float32Array(N*3),al=new Float32Array(N),sz=new Float32Array(N),col=new Float32Array(N*3);
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.BufferAttribute(pos,3));g.setAttribute('alpha',new TH.BufferAttribute(al,1));g.setAttribute('size',new TH.BufferAttribute(sz,1));g.setAttribute('color',new TH.BufferAttribute(col,3));
  const m=new TH.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uScale:{value:300}},
    vertexShader:'attribute float alpha;attribute float size;attribute vec3 color;varying float vA;varying vec3 vC;uniform float uScale;void main(){vA=alpha;vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=max(1.,size*uScale/-mv.z);}',
    fragmentShader:'varying float vA;varying vec3 vC;float b(vec2 p){p=mod(floor(p),4.);float i=p.x+p.y*4.;return fract(i*.618);}void main(){vec2 q=gl_PointCoord-.5;float r=dot(q,q)*4.;float a=vA*(1.-r);if(a<b(gl_FragCoord.xy)*.6+.04)discard;gl_FragColor=vec4(vC,min(1.,a*1.6));}'});
  const pts=new TH.Points(g,m);pts.frustumCulled=false;root.add(pts);const P=[];for(let i=0;i<N;i++)P.push({life:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,s:0,max:1});
  return {pts,P,g,m,N}}
const cTmp=new TH.Color();
function puffStep(S,dt){const pf=S.puffs;if(!pf)return;const P=pf.P;let k=0;
  S.smoke.forEach(e=>{e.acc+=dt*e.rate;while(e.acc>1){e.acc-=1;const p=P.find(q=>q.life<=0);if(!p)break;p.life=p.max=e.life*(.7+Math.random()*.6);p.x=e.x+(Math.random()-.5)*.1;p.y=e.y;p.z=e.z+(Math.random()-.5)*.1;p.vx=(Math.random()-.5)*e.spread;p.vz=(Math.random()-.5)*e.spread;p.vy=e.rise*(.7+Math.random()*.6);p.s=e.size;p.c=e.kleur;p.a=e.alpha||.55}});
  const pos=pf.g.attributes.position.array,al=pf.g.attributes.alpha.array,sz=pf.g.attributes.size.array,col=pf.g.attributes.color.array;
  for(let i=0;i<P.length;i++){const p=P[i];if(p.life>0){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy*=.995;p.vx+=Math.sin(p.y*2+i)*.02*dt;const t=1-p.life/p.max;
      pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;al[i]=p.a*Math.sin(Math.PI*Math.min(1,t*1.1))*(p.life>0?1:0);sz[i]=p.s*(1+t*2.4);cTmp.set(p.c);col[i*3]=cTmp.r;col[i*3+1]=cTmp.g;col[i*3+2]=cTmp.b}else{al[i]=0;pos[i*3+1]=-50}}
  pf.g.attributes.position.needsUpdate=pf.g.attributes.alpha.needsUpdate=pf.g.attributes.size.needsUpdate=pf.g.attributes.color.needsUpdate=true;
  const cam=G.camera(),rs=G.renderer().getSize(new TH.Vector2());pf.m.uniforms.uScale.value=rs.y/(2*Math.tan(cam.fov*Math.PI/360))}

/* =================== botsing =================== */
function solidAt(S,x,z,hoog){const lx=(x-S.d.o.x)/CELL,lz=(z-S.d.o.z)/CELL;if(lx<0||lz<0||lx>=S.gw||lz>=S.gh)return true;const v=S.grid[(lz|0)*S.gw+(lx|0)];return hoog?v>=2:v>=1}
const cs0=M.canStand;
M.canStand=function(x,z,r){if(inside&&BUILT[inside]&&x>4000){const S=BUILT[inside];r=r||.3;return !solidAt(S,x,z)&&!solidAt(S,x-r,z)&&!solidAt(S,x+r,z)&&!solidAt(S,x,z-r)&&!solidAt(S,x,z+r)}return cs0.apply(this,arguments)};
const dA0=M.districtAt;M.districtAt=function(x,z){if(x>4000){for(const id in DEF){const d=DEF[id];if(x>=d.o.x-5&&x<d.o.x+(d.w||24)+5&&z>=d.o.z-5&&z<d.o.z+(d.h||20)+5)return d.naam}return 'Binnen'}return dA0.apply(this,arguments)};

/* =================== binnen en buiten =================== */
const fadeEl=document.createElement('div');fadeEl.className='sv-bfade';document.body.appendChild(fadeEl);
function fade(v,t){return new Promise(res=>{fadeEl.style.transition=`opacity ${t}s`;fadeEl.style.opacity=v;fadeEl.style.pointerEvents=v>0?'auto':'none';setTimeout(res,t*1000+20)})}
const SKIPVIS=new Set();
function hideOutside(S){const sc=G.scene(),keep=new Set([S.root,G.avatarObj&&G.avatarObj()]);hidden=[];
  sc.children.forEach(o=>{if(keep.has(o)||o.isLight||o.isCamera||o.type==='Object3D'&&o.children.length===0)return;if(o.binnenId)return;if(o.visible){hidden.push(o);o.visible=false}})}
function keepHidden(){const av=G.avatarObj&&G.avatarObj();for(const o of hidden){if(o===av)continue;if(o.visible)o.visible=false}}
function showOutside(){hidden.forEach(o=>{o.visible=true});hidden=[]}
B0.in=async function(id,o){o=o||{};const d=DEF[id];if(!d)return false;if(inside===id)return true;if(inside)await B0.uit({fade:false,naar:null});
  if(d.dicht&&!o.forceer){G.toast&&G.toast(d.dichtTxt||'Dicht','info');return false}
  const fd=o.fade!==false;if(fd){G.snd&&G.snd.fx('door');await fade(1,.32)}
  const S=build(id);if(!inside)wasOut={x:G.P.x,z:G.P.z,ry:G.P.ry,yaw:G.yawT};
  if(G.driving&&G.exitCar)G.exitCar(true);
  inside=id;S.root.visible=true;S.persons.forEach(a=>{a.g.visible=!a.uit;a.slaap=!!a.uit});hideOutside(S);
  const sp=o.spawn||d.spawn||{x:(d.w||20)/2,z:(d.h||16)-2,ry:Math.PI};G.P.x=d.o.x+sp.x;G.P.z=d.o.z+sp.z;G.P.ry=sp.ry!=null?sp.ry:Math.PI;G.P.vx=G.P.vz=0;G.stopPath&&G.stopPath();
  G.yawT=G.yaw=sp.yaw!=null?sp.yaw:G.P.ry+Math.PI;if(G.camC){G.camC.init=false}
  G.camK=(d.cam&&d.cam.k)||.5;document.body.classList.add('sv-binnen');document.body.dataset.binnen=id;
  G.applyLight&&G.applyLight();setTimeout(()=>G.applyLight&&G.applyLight(),50);
  try{if(G.story){const s=G.story.st();s.binnen=id;try{save()}catch(e){}}}catch(e){}
  d.onIn&&d.onIn(S);(B0.onIn||[]).forEach(f=>{try{f(id)}catch(e){}});
  if(fd){await new Promise(r=>setTimeout(r,60));await fade(0,.4)}return true};
B0.uit=async function(o){o=o||{};if(!inside)return;const id=inside,d=DEF[id],S=BUILT[id];const fd=o.fade!==false;if(fd){G.snd&&G.snd.fx('door');await fade(1,.3)}
  inside=null;S.root.visible=false;S.persons.forEach(a=>{a.g.visible=false;a.slaap=true});showOutside();G.camK=null;document.body.classList.remove('sv-binnen');delete document.body.dataset.binnen;
  const out=o.naar||deurBuiten(id)||wasOut;if(out){const p=M.nearestWalk(out.x,out.z,8)||out;G.P.x=p.x;G.P.z=p.z;G.P.vx=G.P.vz=0;const f=facade(id);if(f){G.P.ry=Math.atan2(f.nx,f.nz);G.yawT=G.yaw=G.P.ry+Math.PI}}
  if(G.camC)G.camC.init=false;G.applyLight&&G.applyLight();
  try{if(G.story){G.story.st().binnen=null;try{save()}catch(e){}}}catch(e){}
  d.onUit&&d.onUit(S);(B0.onUit||[]).forEach(f=>{try{f(id)}catch(e){}});
  if(fd){await new Promise(r=>setTimeout(r,60));await fade(0,.4)}};
B0.onIn=[];B0.onUit=[];
B0.waar=()=>inside;
B0.add=function(id,def){def.o={x:ORIG.x+(slotN++)*170,z:ORIG.z};DEF[id]=def;if(G.ready&&G.spot)setTimeout(()=>doors(),0);return B0};
B0.def=id=>DEF[id];B0.lijst=()=>Object.keys(DEF);
B0.o=id=>DEF[id]&&DEF[id].o;
B0.p=(id,x,z)=>{const d=DEF[id];return d?[d.o.x+x,d.o.z+z]:[x,z]};
B0.plek=(id,n)=>{const S=build(id);return S.plekken[n]||null};
B0.extra=(id,n)=>{const S=build(id);return n?S.extras[n]||null:S.extras};
B0.plekken=id=>{const S=build(id);return S.verstop};
B0.bouw=id=>build(id);
B0.slot=(id,dicht,tekst)=>{const d=DEF[id];if(!d)return;d.dicht=!!dicht;if(tekst)d.dichtTxt=tekst};
// een figurant tonen of verbergen (blijft zo, ook na opnieuw binnenkomen)
B0.toon=(id,n,aan)=>{const a=B0.extra(id,n);if(!a)return null;a.uit=!aan;if(inside===id){a.g.visible=!!aan;a.slaap=!aan}return a};
B0.uitSlot=(id,dicht)=>{const d=DEF[id];if(d)d.uitDicht=!!dicht};

/* =================== deuren in de stad =================== */
function deurBuiten(id){const d=DEF[id];if(!d)return null;let a=null;try{a=d.anker&&d.anker()}catch(e){}return a&&a.x!=null?a:null}
B0.deurBuiten=deurBuiten;
// de gevel bij een deurpunt: welke kant is het gebouw (eerste vaste tegel)
const FACE={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
function facade(id){const a=deurBuiten(id);if(!a)return null;let best=null;
  // weet de plek zelf welke kant de deur op kijkt (face of ry), dan die gebruiken
  const fc=a.face&&FACE[a.face];if(fc){let k=.5;for(;k<7;k+=.25){const x=Math.floor(a.x-fc[0]*k),z=Math.floor(a.z-fc[1]*k);if(x>=0&&z>=0&&x<M.W&&z<M.H&&M.solid[z*M.W+x])break}if(k>=7)k=1;return {x:a.x-fc[0]*k,z:a.z-fc[1]*k,nx:fc[0],nz:fc[1],k}}[[0,-1],[1,0],[0,1],[-1,0]].forEach(([dx,dz])=>{for(let k=.5;k<7;k+=.25){const x=Math.floor(a.x+dx*k),z=Math.floor(a.z+dz*k);if(x<0||z<0||x>=M.W||z>=M.H)break;if(M.solid[z*M.W+x]){if(!best||k<best.k)best={k,dx,dz};break}}});
  if(!best)return {x:a.x,z:a.z,nx:0,nz:1,k:0};return {x:a.x+best.dx*best.k,z:a.z+best.dz*best.k,nx:-best.dx,nz:-best.dz,k:best.k}}
B0.gevel=facade;
const DOORS={};
function doors(){if(!G.spot)return;for(const id in DEF){const d=DEF[id],a=deurBuiten(id);if(!a)continue;const k=Math.round(a.x*10)+','+Math.round(a.z*10);const cur=DOORS[id];if(cur&&cur.k===k)continue;
    if(cur){G.unspot&&G.unspot(cur.spot);cur.deco&&cur.deco.parent&&cur.deco.parent.remove(cur.deco)}
    const f=facade(id);const spot=G.spot({story:1,k:'deur',x:a.x,z:a.z,r:2.3,prio:1,n:d.deurTxt||'Naar binnen',sub:d.naam,col:d.kleur||'#ffd35a',h:2.6,show:()=>!inside&&!(G.cut&&G.cut.active())&&!(d.verborgen&&d.verborgen()),act:()=>B0.in(id),
      map:d.kaart===false?null:{n:d.naam,ic:K.ic.door,c:d.kleur||'#ffd35a',pri:1}});
    let deco=null;if(d.buiten&&f){deco=new TH.Group();deco.binnenId=1;deco.position.set(f.x,0,f.z);deco.rotation.y=Math.atan2(f.nx,f.nz);f.eigen=!!(a.eigen||(M.A&&d.ankerId&&M.A[d.ankerId]));try{d.buiten(deco,f)}catch(e){console.error(e)}G.scene().add(deco)}
    DOORS[id]={k,spot,deco}}}
B0.doors=doors;

/* =================== camera binnen =================== */
const v3=new TH.Vector3();let camPos=null;
function rigAchter(dt,cam){const S=BUILT[inside],d=S.d,P=G.P,C=G.camC||{pitch:.2,tpD:5.4};const yaw=G.yaw,p=clamp(C.pitch!=null?C.pitch:.2,-.2,.9);
  const asp=innerWidth/innerHeight,por=asp<1,rx=Math.cos(yaw),rz=-Math.sin(yaw);const sh=por?.25:.45,px=P.x+rx*sh,pz=P.z+rz*sh,py=1.95;
  const dmax=Math.min(4.6,(C.tpD||5.4)*(por?1.2:.9)),dx=Math.sin(yaw)*Math.cos(p),dz=Math.cos(yaw)*Math.cos(p),dy=Math.sin(p);
  let dd=dmax;for(let s=.3;s<=dmax;s+=.08){if(solidAt(S,px+dx*s,pz+dz*s,true)){dd=Math.max(.35,s-.32);break}}
  // staat er vlak achter je een muur: de camera gaat omhoog en kijkt over je schouder naar voren (niet in je nek)
  const ceil=(d.plafond||3.4)-.3,tekort=Math.max(0,2.8-dd),fx=-Math.sin(yaw),fz=-Math.cos(yaw);
  const tgt=v3.set(px+dx*dd,Math.min(ceil,py+dy*dd+tekort*.75),pz+dz*dd);if(!camPos||!C.init){camPos=tgt.clone();C.init=true}else camPos.lerp(tgt,Math.min(1,dt*12));
  cam.position.copy(camPos);cam.lookAt(px+fx*tekort*.9,py-.2-tekort*.25,pz+fz*tekort*.9);const fov=por?70:58;if(Math.abs(cam.fov-fov)>.01){cam.fov=fov;cam.updateProjectionMatrix()}G.shadowC={x:P.x,z:P.z};return true}
function hookRig(){const r0=G.camRig;G.camRig=function(dt,cam){if(G.cut&&G.cut.rig&&G.cut.rig(dt,cam))return true;if(inside&&BUILT[inside]&&G.camMode==='achter'&&!G.paused)return rigAchter(dt,cam);
  if(inside&&G.camMode==='boven'){if(cam.fov!==G.fov0&&G.fov0){cam.fov=G.fov0;cam.updateProjectionMatrix()}return false}return r0?r0(dt,cam):false}}

/* =================== licht binnen =================== */
function hookLight(){const l0=G.onLight;G.onLight=function(o){l0&&l0(o);if(!inside)return;const L=DEF[inside].licht||{};const bg=new TH.Color(L.bg||'#0a080c');
  o.scene.background=bg;o.scene.fog.color=bg;o.scene.fog.near=60;o.scene.fog.far=200;
  o.hemi.intensity=L.int!=null?L.int:.55;o.hemi.color.set(L.hemi||'#b8a8d8');o.hemi.groundColor.set(L.grond||'#2a2030');
  o.sun.intensity=L.zon!=null?L.zon:.35;o.sun.color.set(L.zonKleur||'#ffe8c8');G.sunOff={x:-7,y:34,z:11};
  if(o.post){const u=o.post.material.uniforms,t=L.tint||[1,1,1];u.uTint.value.set(t[0],t[1],t[2]);u.uSat.value=L.sat||1.16;u.uVig.value=L.vig!=null?L.vig:.5;u.uNight.value=L.gloed!=null?L.gloed:.7}
  if(o.pools)o.pools.material.opacity=0}}

/* =================== elke frame =================== */
let flT=0;
function frame(dt){if(!inside)return;const S=BUILT[inside];if(!S)return;keepHidden();const t=performance.now()/1000;
  // muren aan de kant van de camera laten zakken (alleen bovenaf), plafond alleen als je niet van boven kijkt
  const boven=G.camMode==='boven'||(G.cut&&G.cut.active()&&false);const cam=G.camera().position,P=G.P,ox=S.d.o.x,oz=S.d.o.z;
  S.walls.forEach(w=>{let cut=false;if(boven&&!w.nooit){const cx=ox+w.c.x,cz=oz+w.c.z;
      const nx=w.ax==='x'?0:1,nz=w.ax==='x'?1:0,s1=(cam.x-cx)*nx+(cam.z-cz)*nz,s2=(P.x-cx)*nx+(P.z-cz)*nz;cut=s1*s2<0&&Math.abs(s2)<(w.bereik||11)&&(w.ax==='x'?(P.x>ox+w.x0-5&&P.x<ox+w.x1+5):(P.z>oz+w.z0-5&&P.z<oz+w.z1+5))}
    if(cut!==w.cut){w.cut=cut;w.m.visible=!cut;w.st.visible=cut;w.cap.visible=cut;w.extra.forEach(e=>{e.visible=!cut})}});
  S.ceils.forEach(c=>{c.visible=!boven});S.hoog.forEach(m=>{m.visible=!boven});
  // flakkerend licht (neon, vuur, tl-buis)
  S.lights.forEach(L=>{const o=L.o;if(o.vuur)L.l.intensity=L.base*(.82+Math.sin(t*9.1+L.base)*.08+Math.sin(t*23.7)*.06+Math.random()*.06);else if(o.flik)L.l.intensity=L.base*(Math.random()<.015?.25:1);else if(o.puls)L.l.intensity=L.base*(.8+Math.sin(t*o.puls)*.2)});
  puffStep(S,dt);S.ticks.forEach(f=>{try{f(dt,t,S)}catch(e){console.error(e)}})}

/* =================== opstarten =================== */
const wait=setInterval(()=>{if(!G.ready||!G.spot)return;clearInterval(wait);hookRig();hookLight();
  const nb=G.npcBrain;G.npcBrain=function(n,dt){if(inside)return true;return nb?nb(n,dt):false};
  const cs=G.carStep;if(cs)G.carStep=function(dt){if(inside)return;return cs(dt)};
  const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);try{frame(dt)}catch(e){console.error(e)}};
  doors();setInterval(doors,3000);
  // was je binnen toen je wegging: daar weer verder
  setTimeout(()=>{try{const s=G.story&&G.story.st();if(s&&s.binnen&&DEF[s.binnen])B0.in(s.binnen,{fade:false,forceer:1})}catch(e){}},700)},150);
})();
