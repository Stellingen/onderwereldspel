// Pixelstad: sfeer. Dit maakt de stad levend om je heen, zonder dat het iets aan de regels verandert.
// - Licht: de zon draait mee met de tijd (lange schaduwen 's ochtends en 's avonds), een gouden uur, blauwe maannacht waarin je
//   je poppetje gewoon blijft zien (zachte lichtkring), wolken die voorbij trekken.
// - Weer: helder, bewolkt, regen (soms onweer), mist en in de winter sneeuw. Elk half uur anders en voor iedereen gelijk (uit de
//   datum berekend); in de instellingen kun je het vastzetten. Regen: druppels, een natte donkere straat, spatten en geluid.
// - Seizoen: vallende bladeren in de herfst, sneeuw in de winter, vlinders in de lente en zomer, vuurvliegjes op zomernachten.
// - Dieren: duiven op pleinen en in parken die opvliegen als je eraan komt, meeuwen boven de haven en het strand (met schaduw),
//   katten die je kunt aaien, ratten bij de containers, boten op zee.
// - Jij: stofwolkjes en voetstappen als je rent, een rode flits als je geraakt wordt, een titelkaart als je de stad in komt.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,X=STAD_GFX,TH=window.THREE,K=G.kit,T=M.T,$s=id=>document.getElementById(id);
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
/* ---------- weer: per half uur, uit de datum ---------- */
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296}
const month=()=>new Date().getMonth(),winter=()=>[11,0,1].includes(month()),autumn=()=>[8,9,10].includes(month()),summer=()=>month()>=3&&month()<=8;
const WN={helder:'Helder',bewolkt:'Bewolkt',regen:'Regen',onweer:'Onweer',mist:'Mist',sneeuw:'Sneeuw'};
function weerNu(){const f=LS('stad_weer','');if(WN[f])return f;const d=new Date(),k=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()+'-'+Math.floor((d.getHours()*60+d.getMinutes())/30),r=hashS('weer'+k),hr=d.getHours();
  if(r<.46)return 'helder';if(r<.7)return 'bewolkt';if(r<.9)return winter()&&hashS('sn'+k)<.6?'sneeuw':hashS('ow'+k)<.25?'onweer':'regen';if(hr<9||hr>20)return 'mist';return 'bewolkt'}
let W={k:'helder',rain:0,mist:0,cloud:.3,snow:0},Wt={rain:0,mist:0,cloud:.3,snow:0};
function weerDoel(){const k=weerNu();W.k=k;Wt={rain:k==='regen'?.8:k==='onweer'?1:0,mist:k==='mist'?1:0,cloud:k==='helder'?.25:1,snow:k==='sneeuw'?1:0}}
G.weer=()=>W.k;G.weerNaam=()=>WN[W.k];G.weerZet=v=>{try{localStorage.setItem('stad_weer',v||'')}catch(e){}weerDoel();G.applyLight&&G.applyLight()};
/* ---------- licht ---------- */
const SKY={day:[.5,.63,.8],gold:[.88,.6,.42],night:[.045,.065,.15],rain:[.4,.44,.49],mist:[.66,.69,.72]};
let L0=null,baseSun=2,sunCol=new TH.Color(),lastHp=null;
function sunTimes(){const d=new Date(),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),len=12+4.3*Math.sin(2*Math.PI*(doy-80)/365);return {rise:13.2-len/2,set:13.2+len/2,len,hr:d.getHours()+d.getMinutes()/60}}
G.onLight=function(o){L0=o;const day=o.day,night=o.night,S0=sunTimes(),hr=G.forceDay===1?13.4:S0.hr,gold=Math.sin(Math.PI*clamp(day,0,1))*(G.forceDay!=null?0:1),e=clamp(Math.sin(Math.PI*clamp((hr-S0.rise)/S0.len,0,1)),0,1);
  // zonstand: oost → zuid → west; laag bij op- en ondergang
  if(night>.92){G.sunOff={x:34,y:72,z:-44}}else{const a=clamp((hr-S0.rise)/S0.len,.04,.96)*Math.PI,hd=34+52*(1-e);G.sunOff={x:Math.cos(a)*hd,y:26+60*e,z:Math.sin(a)*hd*.8+14}}
  const rain=W.rain,mist=W.mist,snow=W.snow;
  let c=[mix(SKY.night[0],SKY.day[0],day),mix(SKY.night[1],SKY.day[1],day),mix(SKY.night[2],SKY.day[2],day)];
  c=c.map((v,i)=>mix(v,SKY.gold[i],gold*.55));c=c.map((v,i)=>mix(v,SKY.rain[i]*(.25+.75*day),Math.max(rain,snow*.6)*.75));c=c.map((v,i)=>mix(v,SKY.mist[i]*(.3+.7*day),mist*.85));
  const sky=new TH.Color().setRGB(c[0],c[1],c[2]);o.scene.background=sky;o.scene.fog.color=sky;
  if(!G.camK||G.camK<1.5){o.scene.fog.near=mix(mix(70,46,rain),20,mist);o.scene.fog.far=mix(mix(190,135,Math.max(rain,snow*.5)),92,mist)}
  o.hemi.intensity=(.78+.95*day)*(1-.18*rain);o.hemi.color.setRGB(mix(.5,1,day),mix(.62,1,day)-gold*.08,mix(1,1,day)-gold*.22);o.hemi.groundColor.setRGB(.22+.14*day,.22+.12*day,.3-.04*day);
  baseSun=(.34+2.0*day)*(1-.55*rain)*(1-.5*mist)*(1-.3*snow);o.sun.intensity=baseSun;sunCol.setRGB(mix(.55,1,day),mix(.68,.97,day)-gold*.25,mix(1,.93,day)-gold*.5);o.sun.color.copy(sunCol);
  if(o.post){const u=o.post.material.uniforms,ft=G.fotoTint||[1,1,1];u.uTint.value.set((mix(.9,1,day)+gold*.07)*ft[0],(mix(.97,1,day)+gold*.0)*ft[1],(mix(1.12,1,day)-gold*.1+rain*.04)*ft[2]);
    u.uTint.value.x*=1-.1*rain;u.uTint.value.y*=1-.05*rain;if(!(G.foto&&G.foto.isOpen&&G.foto.isOpen()))u.uSat.value=1.12-.22*rain-.2*mist+gold*.08;u.uVig.value=.35+.2*night}
  if(G.ground)G.ground.material.color.setScalar(1-.24*rain+.1*snow);
  if(o.pools)o.pools.material.opacity=Math.max(Math.max(0,night-.15)*.7,(rain>.4||mist>.5)&&day<.9?.3:0);
  if(glow)glow.material.opacity=clamp(night-.1,0,1)*.42;
  hud()};
/* ---------- regen, sneeuw, bladeren, vlinders, vuurvliegjes ---------- */
let rainL=null,splash=null,flakes=null,flakeD=null,glow=null,plas=null,nat=0;const RN=300,FN=420;
function setupSky(){const sc=G.scene();
  const g=new TH.BufferGeometry(),p=new Float32Array(RN*6);g.setAttribute('position',new TH.BufferAttribute(p,3));rainL=new TH.LineSegments(g,new TH.LineBasicMaterial({color:0xcfe2f6,transparent:true,opacity:.8,depthWrite:false}));rainL.frustumCulled=false;rainL.visible=false;rainL.userData.d=Array.from({length:RN},()=>({x:rr(-30,30),y:rr(0,18),z:rr(-24,24)}));sc.add(rainL);
  const sg=new TH.BufferGeometry();sg.setAttribute('position',new TH.BufferAttribute(new Float32Array(90*3),3));splash=new TH.Points(sg,new TH.PointsMaterial({color:0xdfeeff,size:2,sizeAttenuation:false,transparent:true,opacity:.7,depthWrite:false}));splash.frustumCulled=false;splash.visible=false;sc.add(splash);
  const fg=new TH.BufferGeometry();fg.setAttribute('position',new TH.BufferAttribute(new Float32Array(FN*3),3));flakes=new TH.Points(fg,new TH.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false,transparent:true,opacity:.95,depthWrite:false}));flakes.frustumCulled=false;flakes.visible=false;sc.add(flakes);
  flakeD=Array.from({length:FN},()=>({x:rr(-27,27),y:rr(0,16),z:rr(-21,21),s:rr(0,6.28),v:rr(.7,1.3)}));
  // zachte lichtkring onder je poppetje ('s nachts)
  const cv=document.createElement('canvas');cv.width=cv.height=32;const cx=cv.getContext('2d');for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-15.5,y-15.5)/16,v=Math.max(0,1-d),q=Math.floor(v*v*6)/6;cx.fillStyle=`rgba(190,215,255,${q})`;cx.fillRect(x,y,1,1)}
  // plassen: glimmende vlekken op straat en stoep, zichtbaar als het regent en nog even daarna
  {let s=4242;const rnd=()=>{s=Math.imul(s^(s>>>15),2246822507)>>>0;s=Math.imul(s^(s>>>13),3266489909)>>>0;s^=s>>>16;return (s>>>0)/4294967296},L=[];
   for(let i=0;i<9000&&L.length<260;i++){const x=8+rnd()*(M.W-16),z=8+rnd()*(M.H-16),t=M.at(Math.floor(x),Math.floor(z));if((t===T.ROAD||t===T.WALK||t===T.PLAZA||t===T.DOCK)&&!M.solid[Math.floor(z)*M.W+Math.floor(x)])L.push([x,z,.7+rnd()*1.5,rnd()*3.14])}
   plas=new TH.InstancedMesh(new TH.PlaneGeometry(1,1).rotateX(-Math.PI/2),new TH.MeshBasicMaterial({color:0x9fc4e6,transparent:true,opacity:0,depthWrite:false}),L.length);const o=new TH.Object3D();L.forEach((p,i)=>{o.position.set(p[0],.035,p[1]);o.rotation.y=p[3];o.scale.set(p[2],1,p[2]*.62);o.updateMatrix();plas.setMatrixAt(i,o.matrix)});plas.renderOrder=1;plas.frustumCulled=false;plas.visible=false;sc.add(plas)}
  glow=new TH.Mesh(new TH.PlaneGeometry(9,9).rotateX(-Math.PI/2),new TH.MeshBasicMaterial({map:X.nearestTex(cv),transparent:true,opacity:0,blending:TH.AdditiveBlending,depthWrite:false}));glow.renderOrder=2;sc.add(glow);nat=W.rain>.3?.8:0}
let fMode='',thT=rr(20,60);
function skyStep(dt,ts){const P=G.P,cx=P.x,cz=P.z;
  // overgang van het weer
  let ch=false;for(const k of ['rain','mist','cloud','snow']){const d=Wt[k]-W[k];if(Math.abs(d)>.002){W[k]+=Math.sign(d)*Math.min(Math.abs(d),dt*.07);ch=true}}G.rain=W.rain;if(ch){skyStep.t=(skyStep.t||0)+dt;if(skyStep.t>.4){skyStep.t=0;G.applyLight&&G.applyLight()}}
  // wolken: de zon wordt af en toe even zwakker
  if(L0&&G.night<.9)L0.sun.intensity=baseSun*(1-.2*W.cloud*(.5+.5*Math.sin(ts*.09+Math.sin(ts*.023)*3)));
  if(glow){glow.position.set(cx,.09,cz);glow.visible=glow.material.opacity>.02&&!G.driving}
  // nat wegdek: loopt op in de regen, droogt langzaam op
  nat=clamp(nat+(W.rain>.3?dt*.05:-dt*.008),0,1);if(plas){plas.visible=nat>.03;plas.material.opacity=nat*.3}
  // regen
  const rOn=W.rain>.05;rainL.visible=rOn;splash.visible=rOn;if(rOn){const a=rainL.geometry.attributes.position.array,D=rainL.userData.d,n=Math.floor(RN*clamp(W.rain,0,1));
    for(let i=0;i<RN;i++){const d=D[i];d.y-=40*dt;d.x-=7*dt;if(d.y<0){d.y=rr(14,20);d.x=rr(-30,30);d.z=rr(-24,24)}const o=i*6,vis=i<n;a[o]=cx+d.x;a[o+1]=vis?d.y:-99;a[o+2]=cz+d.z;a[o+3]=cx+d.x+.42;a[o+4]=vis?d.y+2.4:-99;a[o+5]=cz+d.z}
    rainL.geometry.attributes.position.needsUpdate=true;const s=splash.geometry.attributes.position.array;for(let i=0;i<90;i++){if(Math.random()<.3){s[i*3]=cx+rr(-26,26);s[i*3+1]=.08;s[i*3+2]=cz+rr(-22,22)}}splash.geometry.attributes.position.needsUpdate=true;
    if(W.k==='onweer'){thT-=dt;if(thT<=0){thT=rr(18,55);G.flash('#dfe8ff',.55);setTimeout(()=>G.snd&&G.snd.fx('thunder'),rr(300,1400))}}}
  // sneeuw, bladeren, vlinders, vuurvliegjes: één wolk van puntjes om je heen
  let mode='';if(W.snow>.05)mode='sneeuw';else if(!rOn){const t=M.at(Math.floor(cx),Math.floor(cz)),green=t===T.PARK||t===T.GARDEN||t===T.GRASS||nearGreen(cx,cz);if(green){if(autumn())mode='blad';else if(summer())mode=G.night>.6?'vuur':G.night<.3?'vlinder':''}}
  const lk=mode==='vuur'?1:mode==='sneeuw'?.55+.45*(G.day||0):.3+.7*(G.day||0);if(mode!==fMode||Math.abs(lk-(skyStep.lk||0))>.03){fMode=mode;skyStep.lk=lk;const m=flakes.material;m.color.set(mode==='sneeuw'?'#ffffff':mode==='blad'?'#d9832a':mode==='vuur'?'#d8ff6a':'#ffe9a8').multiplyScalar(lk);m.blending=mode==='vuur'?TH.AdditiveBlending:TH.NormalBlending;m.needsUpdate=true}
  flakes.visible=!!mode;if(mode){const a=flakes.geometry.attributes.position.array,n=mode==='sneeuw'?Math.floor(FN*W.snow):mode==='blad'?40:mode==='vuur'?26:14;
    for(let i=0;i<FN;i++){const d=flakeD[i],o=i*3;if(i>=n){a[o+1]=-99;continue}d.s+=dt*d.v;
      if(mode==='sneeuw'){d.y-=2.4*d.v*dt;d.x+=Math.sin(d.s)*dt*.9;if(d.y<0)d.y=rr(12,17)}
      else if(mode==='blad'){d.y-=1.5*d.v*dt;d.x+=Math.sin(d.s*1.4)*dt*1.6+dt*.7;d.z+=Math.cos(d.s)*dt*.8;if(d.y<0){d.y=rr(5,9);d.x=rr(-26,26);d.z=rr(-20,20)}}
      else{d.y=1.2+Math.sin(d.s*.9+i)*.9+(mode==='vuur'?.4:0);d.x+=Math.sin(d.s*.7+i)*dt*1.2;d.z+=Math.cos(d.s*.5+i*2)*dt*1.2;if(mode==='vuur'&&Math.sin(d.s*2+i)<-.2){a[o+1]=-99;continue}}
      if(d.x>27)d.x-=54;if(d.x<-27)d.x+=54;if(d.z>21)d.z-=42;if(d.z<-21)d.z+=42;a[o]=cx+d.x;a[o+1]=d.y;a[o+2]=cz+d.z}
    flakes.geometry.attributes.position.needsUpdate=true}}
let ngT=0,ngV=false;function nearGreen(x,z){const now=performance.now();if(now-ngT<1500)return ngV;ngT=now;ngV=false;for(let a=0;a<8&&!ngV;a++){const t=M.at(Math.floor(x+Math.cos(a*.785)*9),Math.floor(z+Math.sin(a*.785)*9));if(t===T.PARK||t===T.GARDEN)ngV=true}return ngV}
/* ---------- flits over het beeld (onweer, geraakt, foto) ---------- */
let flA=0;G.flash=function(col,a){if(!G.post)return;const u=G.post.material.uniforms.uFlash.value,c=new TH.Color(col);u.x=c.r;u.y=c.g;u.z=c.b;flA=Math.max(flA,a||.5)};
function flashStep(dt){if(!G.post)return;const u=G.post.material.uniforms.uFlash.value;let low=0;try{if(S.hp<25&&!G.driving)low=.1+.06*Math.sin(performance.now()/260)}catch(e){}
  if(flA>.004){flA*=Math.pow(.004,dt);u.w=Math.max(flA,low)}else if(low){u.x=.8;u.y=.05;u.z=.08;u.w=low}else u.w=0;
  // geraakt: rood
  try{const hp=S.hp;if(lastHp!=null&&hp<lastHp-.9&&!G.paused){G.flash('#ff2a3a',Math.min(.75,.25+(lastHp-hp)*.03));if(!G.pose&&!G.emote){G.pose='au';setTimeout(()=>{if(G.pose==='au')G.pose=null},450)}}lastHp=hp}catch(e){}}
/* ---------- stofwolkjes en voetstappen ---------- */
const PUF=[];let pufG=null,pufM=null;
function puff(x,z,col,n,up){if(!pufG){pufG=new TH.BoxGeometry(.2,.2,.2);pufM={}}for(let i=0;i<(n||1);i++){let p=PUF.find(p=>p.life<=0);if(!p){if(PUF.length>40)return;p={m:new TH.Mesh(pufG,new TH.MeshBasicMaterial({color:0xffffff})),life:0};G.scene().add(p.m);PUF.push(p)}
  p.m.material.color.set(col||'#b9b4a8');p.m.position.set(x+rr(-.2,.2),.12,z+rr(-.2,.2));p.v={x:rr(-.6,.6),y:up||rr(.5,1.1),z:rr(-.6,.6)};p.life=p.max=rr(.3,.55);p.m.visible=true}}
G.puff=puff;
function puffStep(dt){for(const p of PUF){if(p.life<=0)continue;p.life-=dt;if(p.life<=0){p.m.visible=false;continue}const k=p.life/p.max;p.m.position.x+=p.v.x*dt;p.m.position.y+=p.v.y*dt;p.m.position.z+=p.v.z*dt;p.m.scale.setScalar(.5+1.6*(1-k)*k*2)}}
let stepN=0;G.onFoot=function(run){stepN++;const P=G.P,t=M.at(Math.floor(P.x),Math.floor(P.z)),wet=W.rain>.3;
  if(run){puff(P.x-Math.sin(P.ry)*.3,P.z-Math.cos(P.ry)*.3,wet?'#bcd6ee':t===T.SAND?'#e8d8a8':t===T.PARK||t===T.GRASS||t===T.GARDEN?'#7aa860':'#b9b4a8',wet?2:1,wet?1.6:0);if(stepN%2===0)G.snd&&G.snd.fx('step')}
  else if(wet&&stepN%2===0)puff(P.x,P.z,'#bcd6ee',1,1.2)};
/* ---------- dieren ---------- */
// duiven: groepjes op de grond die opvliegen
const FL=[];let birdM=null,gullM=null,gullS=null;const BN=72,_o=new TH.Object3D(),_c=new TH.Color();
const SPOTS_D=[[226,123],[233,116],[221,128],[154,78],[150,18],[60,60],[150,229],[100,229],[54,50],[229,78],[279,140],[20,110],[240,229],[160,14],[448,300]];
function setupBirds(){const sc=G.scene();birdM=new TH.InstancedMesh(new TH.BoxGeometry(.26,.2,.42),new TH.MeshLambertMaterial({color:0xffffff}),BN);birdM.castShadow=true;birdM.frustumCulled=false;birdM.instanceMatrix.setUsage(TH.DynamicDrawUsage);sc.add(birdM);
  let k=0;SPOTS_D.forEach(([x,z],fi)=>{const p=M.nearestWalk(x,z,6);if(!p)return;const f={x:p.x,z:p.z,st:'ground',t:0,b:[]};const n=4+Math.floor(Math.random()*3);for(let i=0;i<n&&k<BN;i++,k++)f.b.push({i:k,ox:rr(-1.6,1.6),oz:rr(-1.6,1.6),ry:rr(0,6.28),ph:rr(0,6),col:pick(['#8a929c','#9aa1ab','#6a7078','#c9cfd6','#7a7480'])});FL.push(f)});
  for(let i=0;i<BN;i++){_c.set('#8a929c');birdM.setColorAt(i,_c)}FL.forEach(f=>f.b.forEach(b=>{_c.set(b.col);birdM.setColorAt(b.i,_c)}));birdM.count=k;if(birdM.instanceColor)birdM.instanceColor.needsUpdate=true;
  // meeuwen: vleugels als een brede platte balk, cirkelen boven water
  gullM=new TH.InstancedMesh(new TH.BoxGeometry(1.5,.06,.34),new TH.MeshLambertMaterial({color:0xf4f4f0}),8);gullM.castShadow=true;gullM.frustumCulled=false;gullM.instanceMatrix.setUsage(TH.DynamicDrawUsage);sc.add(gullM);
  gullS=[[352,60,16],[358,118,13],[366,170,15],[90,244,17],[200,246,14],[150,240,20],[40,238,12],[470,8,12]].map(([x,z,r],i)=>({x,z,r,a:rr(0,6.28),v:rr(.25,.45)*(i%2?1:-1),y:rr(13,20),cry:rr(5,30)}))}
function birdStep(dt,ts){const P=G.P;if(!birdM)return;let upd=false;
  for(const f of FL){const d=Math.hypot(f.x-P.x,f.z-P.z);if(d>70){if(f.st!=='ground'){f.st='ground';f.t=0}continue}upd=true;
    if(f.st==='ground'){const sp=Math.hypot(P.vx,P.vz),hd=G.hondPos;if((d<(sp>7||G.driving?5.5:2.9)&&(sp>.5))||(hd&&hd.g.visible&&Math.hypot(f.x-hd.x,f.z-hd.z)<3.4)){f.st='fly';f.t=0;f.b.forEach(b=>{const a=Math.atan2(f.x+b.ox-P.x,f.z+b.oz-P.z)+rr(-.7,.7);b.vx=Math.sin(a)*rr(4,7);b.vz=Math.cos(a)*rr(4,7);b.vy=rr(4,7);b.x=f.x+b.ox;b.z=f.z+b.oz;b.y=.1});if(d<30)G.snd&&G.snd.fx('flutter')}
      f.b.forEach(b=>{b.ph+=dt*(3+b.i%3);const peck=Math.sin(b.ph)>.6;if(Math.random()<dt*.25){b.ry+=rr(-1,1);b.ox=clamp(b.ox+Math.sin(b.ry)*.25,-2,2);b.oz=clamp(b.oz+Math.cos(b.ry)*.25,-2,2)}
        _o.position.set(f.x+b.ox,.1,f.z+b.oz);_o.rotation.set(peck?.55:0,b.ry,0);_o.scale.setScalar(1);_o.updateMatrix();birdM.setMatrixAt(b.i,_o.matrix)})}
    else if(f.st==='fly'){f.t+=dt;f.b.forEach(b=>{b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;_o.position.set(b.x,b.y,b.z);_o.rotation.set(-.3,Math.atan2(b.vx,b.vz),Math.sin(ts*26+b.i)*.5);_o.scale.set(1.9,.6,1);_o.updateMatrix();birdM.setMatrixAt(b.i,_o.matrix)});
      if(f.t>3.2){f.st='away';f.t=0;f.b.forEach(b=>{_o.position.set(0,-50,0);_o.scale.setScalar(0);_o.updateMatrix();birdM.setMatrixAt(b.i,_o.matrix)})}}
    else{f.t+=dt;if(f.t>25&&d>12){f.st='ground';f.t=0}}}
  if(upd)birdM.instanceMatrix.needsUpdate=true;
  gullS.forEach((g,i)=>{g.a+=g.v*dt;const x=g.x+Math.cos(g.a)*g.r,z=g.z+Math.sin(g.a)*g.r;_o.position.set(x,g.y+Math.sin(ts*.7+i)*1.2,z);_o.rotation.set(0,-g.a+(g.v>0?0:Math.PI),Math.sin(ts*5+i)*.28);_o.scale.setScalar(G.night>.7?0:1);_o.updateMatrix();gullM.setMatrixAt(i,_o.matrix);
    g.cry-=dt;if(g.cry<=0){g.cry=rr(9,34);if(G.night<.7&&Math.hypot(x-P.x,z-P.z)<45)G.snd&&G.snd.fx('gull')}});gullM.instanceMatrix.needsUpdate=true}
// katten: zitten ergens, je kunt ze aaien; ratten: schieten weg
const CATS=[];let rat=null;
function setupCats(){const al=M.alleys;const C=[[200.5,70],[182.6,150],[96,228.6],[309.5,40]];[al[1],al[Math.floor(al.length*.4)],al[Math.floor(al.length*.75)]].filter(Boolean).forEach(a=>C.push([a.cx,a.cz]));
  C.forEach(([x,z],i)=>{const p=M.nearestWalk(x,z,5);if(!p)return;const col=pick(['#1d1d1f','#d98a3a','#8a8c90','#e8e4da','#5a4030']),m=K.model([[.3,.3,.55,0,.22,0,col],[.28,.26,.26,0,.42,.3,col],[.08,.1,.06,-.09,.59,.34,col],[.08,.1,.06,.09,.59,.34,col],[.07,.07,.4,0,.3,-.42,col],[.05,.04,.02,-.06,.45,.44,'#c8ff6a',1],[.05,.04,.02,.06,.45,.44,'#c8ff6a',1]]);
    m.position.set(p.x,0,p.z);m.rotation.y=rr(0,6.28);G.scene().add(m);const c={x:p.x,z:p.z,hx:p.x,hz:p.z,m,st:'sit',t:0,pet:0};CATS.push(c);
    if(G.spot)c.spot=G.spot({k:'kat',x:p.x,z:p.z,r:1.7,n:'Aaien',col:'#ffb0d0',h:1.1,noRing:1,show:()=>c.st==='sit',act:()=>{if(G.driving||G.talking)return;G.pose='aai';G.P.ry=Math.atan2(c.x-G.P.x,c.z-G.P.z);G.snd&&G.snd.fx('miauw');G.bubble&&G.bubble(c,pick(['Prrr…','Miauw.','Mrrrow.']),{y:1.3,col:'#ffe0ee'});G.fx2&&G.fx2.burst(c.x,.9,c.z,'#ff7fb3',5);
      c.pet++;setTimeout(()=>{if(G.pose==='aai')G.pose=null},1500);if(c.pet===1){G.ev&&G.ev('kat')}if(c.pet>=3){c.st='walk';c.t=0;c.a=rr(0,6.28)}}})})
  rat=K.model([[.16,.12,.34,0,.07,0,'#3a342e'],[.04,.04,.3,0,.06,-.3,'#6a5a52']],{noShadow:1});rat.visible=false;G.scene().add(rat)}
G.critter=function(k,x,z){if(k==='rat'&&rat){const a=rr(0,6.28);rat.userData={t:1.6,vx:Math.sin(a)*7,vz:Math.cos(a)*7};rat.position.set(x,0,z);rat.rotation.y=a;rat.visible=true}};
function catStep(dt,ts){const P=G.P;for(const c of CATS){if(Math.hypot(c.x-P.x,c.z-P.z)>60)continue;c.t+=dt;
    if(c.st==='sit'){c.m.rotation.x=0;c.m.position.y=Math.sin(ts*2+c.x)*.01;if(G.driving&&Math.hypot(c.x-P.x,c.z-P.z)<5){c.st='walk';c.t=0;c.a=Math.atan2(c.x-P.x,c.z-P.z)}}
    else{const sp=3.2,nx=c.x+Math.sin(c.a)*sp*dt,nz=c.z+Math.cos(c.a)*sp*dt;if(M.canStand(nx,nz,.25)){c.x=nx;c.z=nz}else c.a+=1.7;c.m.position.set(c.x,Math.abs(Math.sin(ts*14))*.06,c.z);c.m.rotation.y=c.a;
      if(c.t>3.5){c.st='away';c.m.visible=false;c.t=0}}
    if(c.st==='away'&&c.t>40&&Math.hypot(c.hx-P.x,c.hz-P.z)>18){c.st='sit';c.x=c.hx;c.z=c.hz;c.pet=0;c.m.position.set(c.x,0,c.z);c.m.visible=true}
    if(c.spot){c.spot.x=c.x;c.spot.z=c.z}}
  if(rat&&rat.visible){const u=rat.userData;u.t-=dt;rat.position.x+=u.vx*dt;rat.position.z+=u.vz*dt;if(u.t<=0)rat.visible=false}
  // ratten bij containers in het donker
  if(G.night>.6&&rat&&!rat.visible&&Math.random()<dt*.05){const h=M.hides.find(h=>h.k==='dumpster'&&Math.hypot(h.x-P.x,h.z-P.z)<7);if(h)G.critter('rat',h.x,h.z)}}
// boten op zee
const BOATS=[];
function setupBoats(){[[20,266,1,5.5,'#e8e4da','#c0261e'],[330,278,-1,8,'#2f5d9a','#f1efe9']].forEach(([x,z,dir,v,c1,c2],i)=>{const m=K.model(i?[[2.4,.9,7,0,-.2,0,c1],[1.8,1.1,2.6,0,.75,-.8,c2],[1.6,.5,1.2,0,1.5,-.8,'#24323f'],[.3,.3,.3,0,.5,3.2,'#fff3c8',1]]:[[2,.7,5.5,0,-.25,0,c1],[.12,5.2,.12,0,2.6,.3,'#6a4a2c'],[.06,3.8,2.6,0,2.9,-1.1,c2],[.06,2.6,1.6,0,2.2,1.3,'#f1efe9']]);
    m.position.set(x,-.3,z);G.scene().add(m);BOATS.push({m,x,z,dir,v})})}
function boatStep(dt,ts){BOATS.forEach((b,i)=>{b.x+=b.dir*b.v*dt;if(b.x>384){b.dir=-1}if(b.x<12){b.dir=1}b.m.position.set(b.x,-.32+Math.sin(ts*1.3+i*2)*.07,b.z);b.m.rotation.y=b.dir>0?Math.PI/2:-Math.PI/2;b.m.rotation.z=Math.sin(ts*.9+i)*.04})}
/* ---------- geluid van de omgeving ---------- */
let ambT=0,chT=rr(2,6);
function ambStep(dt){ambT+=dt;const P=G.P;if(ambT>.6){ambT=0;const sea=clamp(1-Math.min(P.x<392?Math.abs(P.z-246)/34:9,Math.abs(P.x-366)/30,1),0,1);G.snd&&G.snd.amb&&G.snd.amb({rain:W.rain,sea:G.driving?sea*.4:sea,wind:Math.max(W.snow*.6,G.camK>1.5?.8:0)});
    const mz=G.NPC&&G.NPC.find(n=>n.arch==='muzikant');if(mz&&G.snd&&G.snd.busk){const d=Math.hypot(mz.x-P.x,mz.z-P.z);G.snd.busk(mz.st==='play'&&d<26?clamp(1-d/26,0,1):0)}}
  chT-=dt;if(chT<=0){chT=rr(2.5,8);if(W.rain<.3&&!G.driving&&nearGreen(P.x,P.z)){const k=G.night>.6?(summer()?'cricket':''):'chirp';if(k)G.snd&&G.snd.fx(k)}}}
/* ---------- weer en tijd in de HUD ---------- */
const WIC={helder:'4,4,8,8;7,1,2,2;7,13,2,2;1,7,2,2;13,7,2,2',bewolkt:'3,7,10,5;5,5,5,3;9,6,4,2',regen:'3,4,10,5;5,2,5,3;4,11,1,3;7,10,1,3;10,11,1,3',onweer:'3,3,10,5;5,1,5,3;8,8,2,3;6,10,3,2;7,12,2,3',mist:'2,4,12,2;4,7,10,2;2,10,12,2',sneeuw:'7,1,2,14;1,7,14,2;4,4,2,2;10,4,2,2;4,10,2,2;10,10,2,2',nacht:'5,2,6,2;3,4,4,8;5,12,6,2;11,10,2,2;7,4,2,2'};
let wx=null;function hud(){const loc=document.querySelector('.sd-loc');if(!loc)return;if(!wx){wx=document.createElement('i');wx.className='sd-wx';wx.id='sdWx';loc.appendChild(wx)}const k=W.k==='helder'&&G.night>.6?'nacht':W.k;
  wx.title=WN[W.k];wx.innerHTML=`<svg viewBox="0 0 16 16" shape-rendering="crispEdges">${WIC[k].split(';').map(r=>{const [x,y,w,h]=r.split(',');return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="currentColor"/>`}).join('')}</svg>`}
/* ---------- titelkaart bij binnenkomst ---------- */
function titleCard(){try{if(typeof inJail==='function'&&inJail())return;if(G.ui&&G.ui.cur&&G.ui.cur())return}catch(e){}
  const d=new Date(),el=document.createElement('div');el.className='sd-title';el.innerHTML=`<i></i><div><small>${K.E(d.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'}))} · ${d.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})} · ${K.E(WN[W.k])}</small><b>Pixelstad</b><span>${K.E(M.districtAt(G.P.x,G.P.z))}</span></div><i></i>`;
  document.body.appendChild(el);G.dist=Math.min(74,G.distT*1.55);setTimeout(()=>el.classList.add('uit'),2300);setTimeout(()=>el.remove(),3100)}
/* ---------- koppelen ---------- */
weerDoel();Object.assign(W,Wt);
setInterval(()=>{const k0=W.k;weerDoel();if(W.k!==k0&&G.ready&&!G.paused&&G.toast){hud()}},20000);
const wait=setInterval(()=>{if(!G.ready||!G.post)return;clearInterval(wait);
  try{setupSky();setupBirds();setupCats();setupBoats()}catch(e){console.error(e)}
  G.applyLight&&G.applyLight();titleCard();
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(G.paused)return;const ts=performance.now()/1000;try{skyStep(dt,ts);flashStep(dt);puffStep(dt);birdStep(dt,ts);catStep(dt,ts);boatStep(dt,ts);ambStep(dt)}catch(e){if(!G._sfErr){G._sfErr=1;console.error(e)}}}},220);
})();
