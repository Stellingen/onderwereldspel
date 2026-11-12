// Pixelstad: sfeer. Dit maakt de stad levend om je heen, zonder dat het iets aan de regels verandert.
// - Licht: de zon draait mee met de tijd (lange schaduwen 's ochtends en 's avonds), een gouden uur, blauwe maannacht waarin je
//   je poppetje gewoon blijft zien (zachte lichtkring), wolken die voorbij trekken.
// - Weer: zonnig, helder, bewolkt, mist, regen, onweer, storm en in de winter sneeuw. Per speldag een verloop in perioden van
//   20-40 minuten, voor iedereen gelijk (uit de datum berekend), met fronten (bewolkt → regen → onweer of storm → opklaring).
//   Regen en storm samen ongeveer 11% van de tijd. In de instellingen kun je voor deze sessie een ander beeld kiezen.
//   Het weer doet mee: minder mensen op straat en paraplu's bij regen, strandgasten bij zon, gladde wegen (G.weerFx().grip),
//   de politie trager bij storm (G.weerFx().politie), en je max. energie (zon +20, regen −15, onweer −20, storm −25 bij 100).
//   De telefoon heeft een weer-app met de verwachting.
// - Seizoen: vallende bladeren in de herfst, sneeuw in de winter, vlinders in de lente en zomer, vuurvliegjes op zomernachten.
// - Dieren: duiven op pleinen en in parken die opvliegen als je eraan komt, meeuwen boven de haven en het strand (met schaduw),
//   katten die je kunt aaien, ratten bij de containers, boten op zee.
// - Jij: stofwolkjes en voetstappen als je rent, een rode flits als je geraakt wordt, een titelkaart als je de stad in komt.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,X=STAD_GFX,TH=window.THREE,K=G.kit,T=M.T,$s=id=>document.getElementById(id);
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
/* ---------- weer: per speldag een verloop, voor iedereen gelijk (uit de datum) ---------- */
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967296}
const month=()=>new Date().getMonth(),winter=()=>[11,0,1].includes(month()),autumn=()=>[8,9,10].includes(month()),summer=()=>month()>=3&&month()<=8;
const WN={zon:'Zonnig',helder:'Helder',bewolkt:'Bewolkt',mist:'Mist',regen:'Regen',onweer:'Onweer',storm:'Storm',sneeuw:'Sneeuw'};
const WNN={zon:'Zwoel',helder:'Heldere nacht'};   // dezelfde soort, maar 's nachts
/*WEERPLAN*/
// Elke speldag (4 uur) is opgedeeld in perioden van 20 tot 40 minuten. Het soort dag bepaalt wat er in die perioden gebeurt:
// mooi, zonnig (in de zomer soms met een onweersbui aan het eind), wisselend (soms één bui), grijs (mist in de nacht en de
// ochtend), een front (bewolkt → regen → onweer of storm → opklaring) en in de winter sneeuw. Regen, onweer en storm samen zijn
// ongeveer 11% van de tijd. Een speldag begint en eindigt nooit in de regen, en voor regen komt altijd eerst bewolking.
const WEER_RAIN={regen:1,onweer:1,storm:1};
function weerRng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
// kansen per soort dag: [mooi, zonnig, wisselend, grijs, front, sneeuw] voor winter, lente, zomer, herfst
const WEER_DAG=[[.20,.05,.25,.18,.22,.10],[.28,.15,.23,.06,.28,0],[.23,.33,.18,.02,.24,0],[.26,.09,.23,.12,.30,0]];
function weerPlanVan(start,hash){
  const d=new Date(start),mo=d.getMonth(),r=weerRng(Math.floor(hash('w3|'+d.getFullYear()+'-'+mo+'-'+d.getDate()+'-'+d.getHours())*4294967296)),
    sz=mo===11||mo<=1?0:mo<=4?1:mo<=7?2:3;
  const L=[];let rem=240;while(rem>0){let n=rem<=40?rem:20+5*Math.floor(r()*5);if(rem>40&&rem-n<20)n=rem-20;L.push(n);rem-=n}
  const N=L.length,mid=[];let acc=0;L.forEach(n=>{mid.push((acc+n/2)/10);acc+=n});    // speluur midden in elke periode
  const nacht=h=>h<7.5||h>21.5,fair=()=>{const z=sz===2?.45:sz===1?.25:sz===3?.1:0;return r()<z?'zon':'helder'};
  let q=r(),sc=0;const Wd=WEER_DAG[sz];for(;sc<5;sc++){q-=Wd[sc];if(q<=0)break}
  const s=[];for(let i=0;i<N;i++)s.push(fair());
  const at=(j,k)=>{if(j>=0&&j<N)s[j]=k};
  if(sc===0){for(let i=0;i<N;i++){if(r()<.18)s[i]='bewolkt';if(sz!==2&&nacht(mid[i])&&r()<.18)s[i]='mist'}}
  else if(sc===1){for(let i=0;i<N;i++)s[i]=r()<.12?'helder':'zon';if(sz===2&&N>=6&&r()<.3){const j=N-3;at(j-1,'bewolkt');at(j,'onweer');at(j+1,'bewolkt');at(N-1,'helder')}}
  else if(sc===2){let c=r()<.5;for(let i=0;i<N;i++){if(r()<.45)c=!c;s[i]=c?'bewolkt':fair()}if(N>=4&&r()<.65){const j=1+Math.floor(r()*(N-2));at(j-1,'bewolkt');at(j,sz===0&&r()<.4?'sneeuw':'regen');at(j+1,'bewolkt')}}
  else if(sc===3){for(let i=0;i<N;i++)s[i]=nacht(mid[i])&&r()<.7?'mist':'bewolkt';if(N>=4&&r()<.3){const j=1+Math.floor(r()*(N-2));at(j,'regen')}}
  else if(sc===4){const len=N>=7&&r()<.4?3:2,j0=1+Math.floor(r()*Math.max(1,N-len-2)),
      x=sz===2?(r()<.6?'onweer':'regen'):sz===1?(r()<.3?'onweer':r()<.2?'storm':'regen'):(r()<.45?'storm':r()<.35?'onweer':'regen');
    if(j0>=2&&r()<.5)at(j0-2,'bewolkt');at(j0-1,'bewolkt');at(j0,'regen');at(j0+1,x);if(len===3)at(j0+2,'regen');at(j0+len,'bewolkt')}
  else{const j0=1+Math.floor(r()*Math.max(1,N-4));for(let i=0;i<N;i++)if(r()<.4)s[i]='bewolkt';at(j0-1,'bewolkt');at(j0,'sneeuw');at(j0+1,'sneeuw');if(r()<.5)at(j0+2,'sneeuw');else at(j0+2,'bewolkt')}
  // nooit regen aan het begin of eind van een speldag; regen altijd na bewolking
  if(WEER_RAIN[s[0]])s[0]='bewolkt';if(WEER_RAIN[s[N-1]])s[N-1]='bewolkt';
  for(let i=1;i<N;i++)if(WEER_RAIN[s[i]]&&!WEER_RAIN[s[i-1]]&&s[i-1]!=='bewolkt'&&s[i-1]!=='sneeuw')s[i-1]='bewolkt';
  const P=[];acc=0;for(let i=0;i<N;i++){P.push({t0:start+acc*60000,t1:start+(acc+L[i])*60000,k:s[i]});acc+=L[i]}
  P.sc=['mooi','zonnig','wisselend','grijs','front','sneeuw'][sc];return P}
/*/WEERPLAN*/
const PLANS={};
function weerPlan(start){if(!PLANS[start]){PLANS[start]=weerPlanVan(start,hashS);const ks=Object.keys(PLANS);if(ks.length>8)delete PLANS[ks[0]]}return PLANS[start]}
const dagStart=t=>G.klok?G.klok(t).start:Math.floor(t/144e5)*144e5;
// het echte weer op tijdstip t (zonder wat je in de instellingen hebt gekozen)
function weerOp(t){t=t==null?Date.now():t;const P=weerPlan(dagStart(t));for(const p of P)if(t<p.t1)return p;return P[P.length-1]}
// (G._weerTest: alleen voor tests, zet het echte weer vast)
const weerNat=()=>G._weerTest&&WN[G._weerTest]?G._weerTest:weerOp().k;
// wat er de komende tijd aan zit te komen: elke verandering met de speltijd waarop hij begint
function verloop(n){const out=[];let t=Date.now(),cur=weerOp(t).k;for(let g=0;g<40&&out.length<n;g++){const p=weerOp(t);if(p.k!==cur){out.push({t:p.t0,k:p.k});cur=p.k}t=p.t1+1}return out}
// in de instellingen gekozen weer: alleen voor het beeld en alleen deze sessie (oude vaste keuze wordt opgeruimd)
try{if(localStorage.getItem('stad_weer')!=null&&sessionStorage.getItem('stad_weer')==null)sessionStorage.setItem('stad_weer','');localStorage.removeItem('stad_weer')}catch(e){}
const gekozen=()=>{try{const v=sessionStorage.getItem('stad_weer');return WN[v]?v:''}catch(e){return ''}};
function weerNu(){return gekozen()||weerNat()}
// hoe elke soort eruitziet: regen, mist, wolken, sneeuw, wind en warmte (0..1)
const WFX={zon:{cloud:.04,warm:1,wind:.08},helder:{cloud:.25,warm:.3,wind:.15},bewolkt:{cloud:1,wind:.3},mist:{mist:1,cloud:.6},
  regen:{rain:.62,cloud:1,wind:.3},onweer:{rain:.85,cloud:1,wind:.5},storm:{rain:1,cloud:1,wind:1},sneeuw:{snow:1,cloud:1,wind:.2}};
let W={k:'helder',rain:0,mist:0,cloud:.3,snow:0,wind:.1,warm:0},Wt={rain:0,mist:0,cloud:.3,snow:0,wind:.1,warm:0};
function weerDoel(){const k=weerNu();W.k=k;const f=WFX[k]||{};Wt={rain:f.rain||0,mist:f.mist||0,cloud:f.cloud||0,snow:f.snow||0,wind:f.wind||0,warm:f.warm||0}}
const naamVan=(k,night)=>night&&WNN[k]?WNN[k]:WN[k];
G.weer=()=>W.k;G.weerNat=weerNat;G.weerNaam=()=>naamVan(W.k,G.night>.6);G.weerPlan=t=>weerPlan(dagStart(t==null?Date.now():t));G.weerVerloop=verloop;G.weerOp=weerOp;
// v: soort of '' (vanzelf); meteen: zonder overgang (voor tests en foto's)
G.weerZet=(v,meteen)=>{try{sessionStorage.setItem('stad_weer',WN[v]?v:'')}catch(e){}weerDoel();if(meteen){Object.assign(W,Wt);nat=W.rain>.3?1:0}G.applyLight&&G.applyLight();hud()};
/* ---------- licht ---------- */
const SKY={day:[.5,.63,.8],gold:[.88,.6,.42],night:[.045,.065,.15],rain:[.4,.44,.49],mist:[.66,.69,.72]};
let L0=null,baseSun=2,sunCol=new TH.Color(),lastHp=null;
// zon op en onder in speltijd (G.klok uit stad-game.js)
function sunTimes(){const k=G.klok?G.klok():{h:13,rise:5,set:21,len:16};return {rise:k.rise,set:k.set,len:k.len,hr:k.h}}
G.onLight=function(o){L0=o;const day=o.day,night=o.night,S0=sunTimes(),hr=G.forceDay===1?13.4:S0.hr,gold=Math.sin(Math.PI*clamp(day,0,1))*(G.forceDay!=null?0:1),e=clamp(Math.sin(Math.PI*clamp((hr-S0.rise)/S0.len,0,1)),0,1);
  // zonstand: oost → zuid → west; laag bij op- en ondergang
  if(night>.92){G.sunOff={x:34,y:72,z:-44}}else{const a=clamp((hr-S0.rise)/S0.len,.04,.96)*Math.PI,hd=34+52*(1-e);G.sunOff={x:Math.cos(a)*hd,y:26+60*e,z:Math.sin(a)*hd*.8+14}}
  const rain=W.rain,mist=W.mist,snow=W.snow,wind=W.wind,warm=W.warm*day,grey=clamp((W.cloud-.3)/.7,0,1)*(1-rain);
  let c=[mix(SKY.night[0],SKY.day[0],day),mix(SKY.night[1],SKY.day[1],day),mix(SKY.night[2],SKY.day[2],day)];
  c=c.map((v,i)=>mix(v,SKY.gold[i],gold*.55));c=c.map((v,i)=>mix(v,[.56,.7,.9][i],warm*.45));c=c.map((v,i)=>mix(v,SKY.rain[i]*(.3+.7*day)*1.12,grey*.38));
  c=c.map((v,i)=>mix(v,SKY.rain[i]*(.25+.75*day)*(1-.22*wind),Math.max(rain,snow*.6)*.75));c=c.map((v,i)=>mix(v,SKY.mist[i]*(.3+.7*day),mist*.85));
  const sky=new TH.Color().setRGB(c[0],c[1],c[2]);o.scene.background=sky;o.scene.fog.color=sky;
  if(!G.camK||G.camK<1.5){o.scene.fog.near=mix(mix(70,40,rain*(.7+.3*wind)),20,mist);o.scene.fog.far=mix(mix(190,120,Math.max(rain*(.8+.2*wind),snow*.5)),92,mist)}
  o.hemi.intensity=(.78+.95*day)*(1-.18*rain)*(1-.06*grey)*(1+.06*warm)*(1-.16*wind*rain);o.hemi.color.setRGB(mix(.5,1,day),mix(.62,1,day)-gold*.08,mix(1,1,day)-gold*.22-warm*.06);o.hemi.groundColor.setRGB(.22+.14*day,.22+.12*day,.3-.04*day);
  baseSun=(.34+2.0*day)*(1-.55*rain)*(1-.5*mist)*(1-.3*snow)*(1-.22*grey)*(1+.12*warm);o.sun.intensity=baseSun;sunCol.setRGB(mix(.55,1,day),mix(.68,.97,day)-gold*.25-warm*.02,mix(1,.93,day)-gold*.5-warm*.1);o.sun.color.copy(sunCol);
  if(o.post){const u=o.post.material.uniforms,ft=G.fotoTint||[1,1,1];u.uTint.value.set((mix(.9,1,day)+gold*.07+warm*.035)*ft[0],(mix(.97,1,day)+gold*.0+warm*.01)*ft[1],(mix(1.12,1,day)-gold*.1+rain*.04-warm*.04+grey*.02)*ft[2]);
    u.uTint.value.x*=1-.1*rain;u.uTint.value.y*=1-.05*rain;u.uTint.value.multiplyScalar(1-.1*wind*rain);if(!(G.foto&&G.foto.isOpen&&G.foto.isOpen()))u.uSat.value=1.12-.22*rain-.2*mist+gold*.08+warm*.09-grey*.1;u.uVig.value=.35+.2*night+.08*wind*rain}
  if(G.ground)G.ground.material.color.setScalar(1-.24*rain+.1*snow);
  if(o.pools)o.pools.material.opacity=Math.max(Math.max(0,night-.15)*.7,(rain>.4||mist>.5)&&day<.9?.3:0);
  if(glow)glow.material.opacity=clamp(night-.1,0,1)*.42;
  hud()};
/* ---------- regen, sneeuw, bladeren, vlinders, vuurvliegjes ---------- */
let rainL=null,splash=null,flakes=null,flakeD=null,glow=null,plas=null,nat=0;const RN=380,FN=420;
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
  let ch=false;for(const k of ['rain','mist','cloud','snow','wind','warm']){const d=Wt[k]-W[k];if(Math.abs(d)>.002){W[k]+=Math.sign(d)*Math.min(Math.abs(d),dt*.07);ch=true}}G.rain=W.rain;G.wind=W.wind;if(ch){skyStep.t=(skyStep.t||0)+dt;if(skyStep.t>.4){skyStep.t=0;G.applyLight&&G.applyLight()}}
  // wolken: de zon wordt af en toe even zwakker
  if(L0&&G.night<.9)L0.sun.intensity=baseSun*(1-.2*W.cloud*(.5+.5*Math.sin(ts*.09+Math.sin(ts*.023)*3)));
  if(glow){glow.position.set(cx,.09,cz);glow.visible=glow.material.opacity>.02&&!G.driving}
  // nat wegdek: loopt op in de regen, droogt langzaam op
  nat=clamp(nat+(W.rain>.3?dt*.05:-dt*.008),0,1);if(plas){plas.visible=nat>.03;plas.material.opacity=nat*.3}
  // regen
  // regen (bij storm schuin en in vlagen)
  const rOn=W.rain>.05,gust=W.wind*(.75+.25*Math.sin(ts*.7+Math.sin(ts*.31)*2));rainL.visible=rOn;splash.visible=rOn;if(rOn){const a=rainL.geometry.attributes.position.array,D=rainL.userData.d,n=Math.floor(RN*clamp(W.rain,0,1)),wx=7+30*gust,sl=.42+1.9*gust;
    for(let i=0;i<RN;i++){const d=D[i];d.y-=40*dt;d.x-=wx*dt;if(d.y<0||d.x<-36){d.y=rr(14,20);d.x=rr(-30,36);d.z=rr(-24,24)}const o=i*6,vis=i<n;a[o]=cx+d.x;a[o+1]=vis?d.y:-99;a[o+2]=cz+d.z;a[o+3]=cx+d.x+sl;a[o+4]=vis?d.y+2.4:-99;a[o+5]=cz+d.z}
    rainL.geometry.attributes.position.needsUpdate=true;const s=splash.geometry.attributes.position.array;for(let i=0;i<90;i++){if(Math.random()<.3){s[i*3]=cx+rr(-26,26);s[i*3+1]=.08;s[i*3+2]=cz+rr(-22,22)}}splash.geometry.attributes.position.needsUpdate=true;
    if(W.k==='onweer'||W.k==='storm'){thT-=dt;if(thT<=0){thT=W.k==='storm'?rr(35,90):rr(14,45);G.flash('#dfe8ff',W.k==='storm'?.42:.55);setTimeout(()=>G.snd&&G.snd.fx('thunder'),rr(300,1400))}}}
  // storm: af en toe een windstoot die je even opzij duwt (alleen te voet)
  if(W.wind>.7&&!G.driving&&!G.paused&&!G.talking&&!G.hidden&&!G.sitting){skyStep.g=(skyStep.g||rr(6,14))-dt;if(skyStep.g<=0){skyStep.g=rr(7,16);P.vx-=rr(1.2,2.4);P.vz+=rr(-.8,.8);G.shake&&G.shake(.12)}}
  // sneeuw, bladeren, vlinders, vuurvliegjes, en bij storm rondvliegende blaadjes en papiertjes: één wolk van puntjes om je heen
  let mode='';if(W.snow>.05)mode='sneeuw';else if(W.wind>.6)mode='wind';else if(!rOn){const t=M.at(Math.floor(cx),Math.floor(cz)),green=t===T.PARK||t===T.GARDEN||t===T.GRASS||nearGreen(cx,cz);if(green){if(autumn())mode='blad';else if(summer())mode=G.night>.6?'vuur':G.night<.3?'vlinder':''}}
  const lk=mode==='vuur'?1:mode==='sneeuw'?.55+.45*(G.day||0):.3+.7*(G.day||0);if(mode!==fMode||Math.abs(lk-(skyStep.lk||0))>.03){fMode=mode;skyStep.lk=lk;const m=flakes.material;m.color.set(mode==='sneeuw'?'#ffffff':mode==='blad'?'#d9832a':mode==='vuur'?'#d8ff6a':mode==='wind'?'#b8a27a':'#ffe9a8').multiplyScalar(lk);m.blending=mode==='vuur'?TH.AdditiveBlending:TH.NormalBlending;m.needsUpdate=true}
  flakes.visible=!!mode;if(mode){const a=flakes.geometry.attributes.position.array,n=mode==='sneeuw'?Math.floor(FN*W.snow):mode==='blad'?40:mode==='wind'?Math.floor(70*W.wind):mode==='vuur'?26:14;
    for(let i=0;i<FN;i++){const d=flakeD[i],o=i*3;if(i>=n){a[o+1]=-99;continue}d.s+=dt*d.v;
      if(mode==='sneeuw'){d.y-=2.4*d.v*dt;d.x+=Math.sin(d.s)*dt*.9;if(d.y<0)d.y=rr(12,17)}
      else if(mode==='wind'){d.x-=(14+16*gust)*d.v*dt;d.y+=Math.sin(d.s*3)*dt*2.2-dt*.4;d.z+=Math.cos(d.s*2)*dt*1.4;if(d.y<.1||d.y>9)d.y=rr(.3,5);if(d.x<-27){d.x=27;d.y=rr(.3,5);d.z=rr(-20,20)}}
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
// Het Plein, de pleintjes voor de bank, het casino en het politiebureau, het Noorderpark, de Westkust, de gracht, de boulevard,
// het parkje in de Westbuurt, de Tuinwijk, de noordkade en Het Eiland
const SPOTS_D=[[425,290],[440,287],[415,270],[285,230],[435,230],[285,300],[300,130],[380,140],[22,350],[349,400],[240,523],[80,205],[755,420],[300,22],[690,630]];
function setupBirds(){const sc=G.scene();birdM=new TH.InstancedMesh(new TH.BoxGeometry(.26,.2,.42),new TH.MeshLambertMaterial({color:0xffffff}),BN);birdM.castShadow=true;birdM.frustumCulled=false;birdM.instanceMatrix.setUsage(TH.DynamicDrawUsage);sc.add(birdM);
  let k=0;SPOTS_D.forEach(([x,z],fi)=>{const p=M.nearestWalk(x,z,6);if(!p)return;const f={x:p.x,z:p.z,st:'ground',t:0,b:[]};const n=4+Math.floor(Math.random()*3);for(let i=0;i<n&&k<BN;i++,k++)f.b.push({i:k,ox:rr(-1.6,1.6),oz:rr(-1.6,1.6),ry:rr(0,6.28),ph:rr(0,6),col:pick(['#8a929c','#9aa1ab','#6a7078','#c9cfd6','#7a7480'])});FL.push(f)});
  for(let i=0;i<BN;i++){_c.set('#8a929c');birdM.setColorAt(i,_c)}FL.forEach(f=>f.b.forEach(b=>{_c.set(b.col);birdM.setColorAt(b.i,_c)}));birdM.count=k;if(birdM.instanceColor)birdM.instanceColor.needsUpdate=true;
  // meeuwen: vleugels als een brede platte balk, cirkelen boven water
  gullM=new TH.InstancedMesh(new TH.BoxGeometry(1.5,.06,.34),new TH.MeshLambertMaterial({color:0xf4f4f0}),8);gullM.castShadow=true;gullM.frustumCulled=false;gullM.instanceMatrix.setUsage(TH.DynamicDrawUsage);sc.add(gullM);
  // boven de gracht, de zee langs het strand, de noordkust, het havenkanaal en de jachthaven van Het Eiland
  gullS=[[360,345,7],[200,580,20],[450,575,17],[90,600,14],[420,6,6],[596,260,14],[596,430,13],[776,655,10]].map(([x,z,r],i)=>({x,z,r,a:rr(0,6.28),v:rr(.25,.45)*(i%2?1:-1),y:rr(13,20),cry:rr(5,30)}))}
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
function setupCats(){const al=M.alleys;const C=[[100,232],[369.5,300],[450,97],[700,458]];[al[1],al[Math.floor(al.length*.4)],al[Math.floor(al.length*.75)]].filter(Boolean).forEach(a=>C.push([a.cx,a.cz]));
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
// x, z, richting, snelheid, kleuren, en tussen welke x ze heen en weer varen (zee ten zuiden van het strand, west van Het Eiland, en de noordkust)
function setupBoats(){[[40,566,1,5.5,'#e8e4da','#c0261e',24,584],[420,624,-1,8,'#2f5d9a','#f1efe9',24,584],[300,6,1,4.5,'#f1efe9','#2f5d9a',210,576]].forEach(([x,z,dir,v,c1,c2,x0,x1],i)=>{const m=K.model(i%2?[[2.4,.9,7,0,-.2,0,c1],[1.8,1.1,2.6,0,.75,-.8,c2],[1.6,.5,1.2,0,1.5,-.8,'#24323f'],[.3,.3,.3,0,.5,3.2,'#fff3c8',1]]:[[2,.7,5.5,0,-.25,0,c1],[.12,5.2,.12,0,2.6,.3,'#6a4a2c'],[.06,3.8,2.6,0,2.9,-1.1,c2],[.06,2.6,1.6,0,2.2,1.3,'#f1efe9']]);
    m.position.set(x,-.3,z);G.scene().add(m);BOATS.push({m,x,z,dir,v,x0,x1})})}
function boatStep(dt,ts){BOATS.forEach((b,i)=>{b.x+=b.dir*b.v*dt;if(b.x>b.x1){b.dir=-1}if(b.x<b.x0){b.dir=1}b.m.position.set(b.x,-.32+Math.sin(ts*1.3+i*2)*.07,b.z);b.m.rotation.y=b.dir>0?Math.PI/2:-Math.PI/2;b.m.rotation.z=Math.sin(ts*.9+i)*.04})}
/* ---------- geluid van de omgeving ---------- */
let ambT=0,chT=rr(2,6);
// afstand tot de zee (en het brede havenkanaal): de kusten liggen op z 14 (noord), z 548 (strand), x 16 (west) en x 790 (oost);
// Het Eiland ligt los in zee (x 596-790, z 574-652)
const seaD=(x,z)=>x>=592&&z>=556?Math.min(z-574,652-z,x-596,790-x):Math.min(Math.abs(z-548),z-14,x-16,790-x,z>=176?Math.abs(x-596)-16:99);
function ambStep(dt){ambT+=dt;const P=G.P;if(ambT>.6){ambT=0;const sea=clamp(1-Math.max(0,seaD(P.x,P.z))/32,0,1);G.snd&&G.snd.amb&&G.snd.amb({rain:W.rain,sea:G.driving?sea*.4:sea,wind:Math.max(W.snow*.6,W.wind>.4?W.wind:0,G.camK>1.5?.8:0)});
    const mz=G.NPC&&G.NPC.find(n=>n.arch==='muzikant');if(mz&&G.snd&&G.snd.busk){const d=Math.hypot(mz.x-P.x,mz.z-P.z);G.snd.busk(mz.st==='play'&&d<26?clamp(1-d/26,0,1):0)}}
  chT-=dt;if(chT<=0){chT=rr(2.5,8);if(W.rain<.3&&!G.driving&&nearGreen(P.x,P.z)){const k=G.night>.6?(summer()?'cricket':''):'chirp';if(k)G.snd&&G.snd.fx(k)}}}
/* ---------- weer en tijd in de HUD ---------- */
const WIC={zon:'5,5,6,6;7,1,2,2;7,13,2,2;1,7,2,2;13,7,2,2;3,3,2,2;11,3,2,2;3,11,2,2;11,11,2,2',helder:'4,4,8,8;7,1,2,2;7,13,2,2;1,7,2,2;13,7,2,2',bewolkt:'3,7,10,5;5,5,5,3;9,6,4,2',regen:'3,4,10,5;5,2,5,3;4,11,1,3;7,10,1,3;10,11,1,3',onweer:'3,3,10,5;5,1,5,3;8,8,2,3;6,10,3,2;7,12,2,3',
  storm:'3,2,10,5;5,0,5,3;1,9,5,1;7,9,7,1;3,11,8,1;12,11,3,1;1,13,4,1;6,13,6,1',mist:'2,4,12,2;4,7,10,2;2,10,12,2',sneeuw:'7,1,2,14;1,7,14,2;4,4,2,2;10,4,2,2;4,10,2,2;10,10,2,2',nacht:'5,2,6,2;3,4,4,8;5,12,6,2;11,10,2,2;7,4,2,2'};
// pixelicoon voor een soort weer ('s nachts een maan bij helder en zonnig)
const wIcon=(k,night)=>{const q=(k==='helder'||k==='zon')&&night?'nacht':k;return `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${(WIC[q]||WIC.helder).split(';').map(r=>{const [x,y,w,h]=r.split(',');return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="currentColor"/>`}).join('')}</svg>`};
G.weerIcon=wIcon;
let wx=null;function hud(){const loc=document.querySelector('.sd-loc');if(loc){if(!wx){wx=document.createElement('i');wx.className='sd-wx';wx.id='sdWx';loc.appendChild(wx)}
  const night=G.night>.6;wx.title=naamVan(W.k,night);wx.dataset.k=W.k;wx.innerHTML=wIcon(W.k,night)}enHud()}
/* ---------- energie hangt af van het weer (alleen in de Pixelstad) ---------- */
// Bij een max. energie van 100: zon +20, sneeuw −10, regen −15, onweer −20, storm −25; helder, bewolkt en mist niets. Bij een
// hogere max groeit het mee, maar minder dan evenredig (×(max/100)^0,6): bij 450 is zon +49 (≈ +11%) en regen −37 (≈ −8%).
// Het telt het echte weer, niet het weer dat je in de instellingen kiest. EN_MAX van het klikspel (state.js) blijft de basis.
// Energie boven je max blijft staan (er gaat nooit iets af, ook niet als je terug naar het klikspel gaat); je laadt pas weer op
// als je onder je max zakt (main.js).
const EN_W={zon:20,sneeuw:-10,regen:-15,onweer:-20,storm:-25};
const enD0=Object.getOwnPropertyDescriptor(window,'EN_MAX');
const enBasis=()=>{try{return enD0&&enD0.get?enD0.get():enD0?enD0.value:100}catch(e){return 100}};
const enDelta=(b,k)=>{const d=EN_W[k]||0;return d?Math.round(d*Math.pow(Math.max(50,b)/100,.6)):0};
try{if(enD0&&enD0.configurable)Object.defineProperty(window,'EN_MAX',{get:()=>{const b=enBasis();let k='helder';try{k=weerNat()}catch(e){}return b+enDelta(b,k)},configurable:true})}catch(e){console.error(e)}
G.enWeer=()=>{const b=enBasis(),k=weerNat(),d=enDelta(b,k);return {base:b,d,k,max:b+d}};
const sgn=d=>(d>0?'+':'−')+Math.abs(d);
let enChip=null,enPop=null,enPopT=0;
function enHud(){const row=document.querySelector('#stadUi .sd-m.en');if(!row||!G.enWeer)return;
  if(!enChip){enChip=document.createElement('button');enChip.type='button';row.appendChild(enChip);row.classList.add('wx');enChip.addEventListener('click',e=>{e.stopPropagation();enUitleg(enChip)})}
  const E0=G.enWeer(),night=G.night>.6;enChip.className='sd-enw'+(E0.d>0?' up':E0.d<0?' down':'');enChip.innerHTML=wIcon(E0.k,night)+(E0.d?`<b>${sgn(E0.d)}</b>`:'');
  enChip.title=naamVan(E0.k,night)+': max. energie '+E0.max+(E0.d?' ('+sgn(E0.d)+')':'');enChip.setAttribute('aria-label',enChip.title+'. Uitleg')}
function enUitleg(anchor){if(enPop){enPop.remove();enPop=null;return}const E0=G.enWeer(),night=G.night>.6,nx=verloop(1)[0],ks=['zon','sneeuw','regen','onweer','storm'];
  enPop=document.createElement('div');enPop.className='sd-enpop';enPop.setAttribute('role','dialog');
  enPop.innerHTML=`<b>${wIcon(E0.k,night)}${K.E(naamVan(E0.k,night))} · max. energie ${E0.max}</b>
   <p>${E0.d?`Normaal ${E0.base}, nu ${sgn(E0.d)}.`:`Normaal weer: geen effect.`} Het weer in de Pixelstad telt mee:</p>
   <ul>${ks.map(k=>`<li class="${k===E0.k?'on':''}">${wIcon(k,false)}<span>${WN[k]}</span><em>${sgn(enDelta(E0.base,k))}</em></li>`).join('')}</ul>
   <p>Zit je erboven als het weer omslaat? Dan blijft je energie staan, je laadt pas weer op als je eronder zakt.</p>
   ${nx?`<small>Straks: ${K.E(WN[nx.k])} om ${G.klok(nx.t).txt}, over ${Math.max(1,Math.round((nx.t-Date.now())/60000))} min</small>`:''}`;
  document.body.appendChild(enPop);const r=(anchor||enChip).getBoundingClientRect(),w=Math.min(260,innerWidth-24);enPop.style.width=w+'px';
  enPop.style.left=Math.max(12,Math.min(innerWidth-w-12,r.left-w/2+r.width/2))+'px';enPop.style.top=(r.bottom+8)+'px';
  clearTimeout(enPopT);enPopT=setTimeout(()=>{if(enPop){enPop.remove();enPop=null}},9000)}
addEventListener('pointerdown',e=>{if(enPop&&!enPop.contains(e.target)&&e.target!==enChip&&!(enChip&&enChip.contains(e.target))){enPop.remove();enPop=null}},true);
G.enUitleg=enUitleg;
/* ---------- mensen en weer: paraplu's, minder mensen bij regen en storm, strandgasten bij zon ---------- */
// Hoeveel van de gewone voorbijgangers buiten lopen (de rest is 'binnen': uit beeld weggehaald en later elders teruggezet).
const VOLK={zon:1,helder:1,bewolkt:.95,mist:.85,sneeuw:.7,regen:.55,onweer:.45,storm:.3};
// politie: hoeveel trager de melding opgepakt wordt; zicht: hoe ver mensen en agenten kijken
const POL={storm:1.3,onweer:1.15,sneeuw:1.15,regen:1.05},ZICHT={mist:.7,storm:.75,sneeuw:.8,onweer:.85,regen:.88};
const GRIP={regen:.84,onweer:.8,storm:.76,sneeuw:.7};
// G.weerFx(): wat het weer met het spel doet. grip (auto's: 1 = droog), volk, politie (≥1 = trager), zicht, wind, nat, en.
// Spelvoordelen volgen altijd het echte weer; grip ook wat je ziet (het slechtste van de twee).
G.weerFx=()=>{const k=weerNat(),vis=clamp(1-.17*nat-.3*W.snow-.05*W.wind,.6,1),g=Math.min(vis,gekozen()?(GRIP[k]||1):1);
  return {k,beeld:W.k,grip:+g.toFixed(3),volk:VOLK[k]||1,politie:POL[k]||1,zicht:ZICHT[k]||1,wind:+W.wind.toFixed(2),nat:+nat.toFixed(2),en:G.enWeer().d}};
const UMB=['#c0261e','#2f5d9a','#1d1d1f','#f2c230','#3a7a4a','#e8e4da','#8a3a8a','#e07a2a'];
let umbC=null,umbP=null;const UMAX=48,_u=new TH.Object3D(),_uc=new TH.Color();
// een paar platte blokken op elkaar: een getrapt koepeltje
const blokken=L=>{const P=[],N=[];L.forEach(([w,h,d,y])=>{const g=new TH.BoxGeometry(w,h,d).translate(0,y,0).toNonIndexed();P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);g.dispose()});
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(P,3));g.setAttribute('normal',new TH.Float32BufferAttribute(N,3));return g};
function setupUmb(){const sc=G.scene();umbC=new TH.InstancedMesh(blokken([[1.6,.09,1.6,0],[1.1,.11,1.1,.09],[.56,.11,.56,.19],[.1,.16,.1,.3]]),new TH.MeshLambertMaterial({color:0xffffff}),UMAX);
  umbP=new TH.InstancedMesh(new TH.BoxGeometry(.08,1.3,.08),new TH.MeshLambertMaterial({color:0x26282c}),UMAX);
  [umbC,umbP].forEach(m=>{m.frustumCulled=false;m.instanceMatrix.setUsage(TH.DynamicDrawUsage);m.castShadow=true;m.count=0;sc.add(m)})}
// wie er een paraplu bij heeft (vast per persoon): niet de agenten, hardlopers en zwervers
const umbOf=n=>{if(n.umb==null)n.umb=n.arch&&n.arch!=='agent'&&n.arch!=='jogger'&&n.arch!=='zwerver'&&!n.fixed&&Math.random()<.75?1+Math.floor(Math.random()*UMB.length):0;return n.umb};
const UMB_ST={walk:1,wait:1,talk:1,chat:1,stand:1,watch:1};
const gewoon=n=>!n.fixed&&!n.evt&&!n.rid&&!n.aid&&!n.klant&&!n.party&&!n.strand&&!n.mate&&n.arch!=='agent'&&n.arch!=='heler';
const nb0=G.npcBrain;
G.npcBrain=function(n,dt){
  if(n.binnen){n.sp=0;return true}
  if(n.st==='strand'){n.t=(n.t||0)+dt;n.sp=0;n.arm=undefined;n.hop=0;n.hx=0;n.y=-.74;n.legL=n.legR=-1.42;n.lean=-.38;n.armL=n.armR=.62;n.armLz=.28;n.armRz=-.28;n.ry=n.home?n.home.ry:0;n.hy=Math.sin(n.t*.4+n.x)*.5;n.blink=Math.sin(n.t*1.7+n.z)>.97;
    if(Math.random()<dt*.02&&Math.hypot(n.x-G.P.x,n.z-G.P.z)<12)G.bubble&&G.bubble(n,pick(['Heerlijk weer.','Zalig.','Wie heeft de zonnebrand?','Nog even liggen.']),{col:'#ffe9a8'});return true}
  // bij storm, onweer en sneeuw duurt het langer voor een getuige de politie aan de lijn heeft
  if(n.st==='call'){if(!n._wcall){n._wcall=1;n.callT=(n.callT||4)*(POL[weerNat()]||1)}}else if(n._wcall)n._wcall=0;
  const r=nb0?nb0(n,dt):false;
  if(W.rain>.3&&UMB_ST[n.st||'walk']&&umbOf(n)){n.armR=-1.15;n.armRz=-.1;n._umb=1}else n._umb=0;
  return r};
// paraplu's tekenen boven wie er een opheeft (na het poseren van de mensen)
function umbStep(){if(!umbC)return;let c=0;const on=W.rain>.3,s=1.18,P=G.P;
  if(on)for(const n of G.NPC){if(c>=UMAX)break;if(!n._umb||n.binnen||!UMB_ST[n.st||'walk']||Math.abs(n.x-P.x)>60||Math.abs(n.z-P.z)>60)continue;const cs=Math.cos(n.ry),sn=Math.sin(n.ry),y0=(n.y||0)+(n.hop||0);
    const lx=.44*s,lz=.62*s;_u.position.set(n.x+cs*lx+sn*lz,y0+2.12,n.z-sn*lx+cs*lz);_u.rotation.set(0,n.ry,0);_u.scale.set(1,1,1);_u.updateMatrix();umbP.setMatrixAt(c,_u.matrix);
    const cx=.2*s,cz=.28*s;_u.position.set(n.x+cs*cx+sn*cz,y0+2.78,n.z-sn*cx+cs*cz);_u.rotation.set(Math.sin(performance.now()/700+n.x)*.05*(1+3*W.wind),n.ry,W.wind*.12);_u.updateMatrix();umbC.setMatrixAt(c,_u.matrix);
    umbC.setColorAt(c,_uc.set(UMB[(n.umb-1)%UMB.length]));c++}
  umbC.count=umbP.count=c;if(c){umbC.instanceMatrix.needsUpdate=true;umbP.instanceMatrix.needsUpdate=true;if(umbC.instanceColor)umbC.instanceColor.needsUpdate=true}}
// minder mensen op straat: steeds een paar tegelijk naar binnen (uit beeld) of weer naar buiten
function volkStep(){const P=G.P,f=VOLK[weerNat()]||1,gen=[],hid=[];for(const n of G.NPC){if(n.binnen)hid.push(n);else if(gewoon(n))gen.push(n)}
  const want=Math.round((gen.length+hid.length)*(1-f));
  if(hid.length<want){gen.filter(n=>n.st==='walk'&&Math.hypot(n.x-P.x,n.z-P.z)>34).slice(0,Math.min(2,want-hid.length)).forEach(n=>{n.binnen=1;n.x=-9999;n.z=-9999;n._umb=0})}
  else if(hid.length>want&&G.spawnNpc){hid.slice(0,Math.min(2,hid.length-want)).forEach(n=>{for(const k in n)delete n[k];Object.assign(n,G.spawnNpc(false))})}}
// strandgasten: bij zon (en op heldere zomerdagen een paar) onder de parasols op het strand
const STRAND=[];
function strandStep(){const P=G.P,k=weerNat(),want=(G.day||0)>.6?(k==='zon'?1:k==='helder'&&summer()?.4:0):0;
  for(let i=STRAND.length-1;i>=0;i--){const n=STRAND[i],d=Math.hypot(n.x-P.x,n.z-P.z),gone=G.NPC.indexOf(n)<0;
    if(gone||(n.st==='strand'&&((!want&&d>30)||d>130))){if(!gone)G.npcRemove&&G.npcRemove(n);if(n._pa)n._pa._bez=0;STRAND.splice(i,1)}}
  if(!want||STRAND.length>=12||!G.npcMake||Math.abs(P.z-545)>95)return;
  for(const p of M.props){if(STRAND.length>=12)break;if(p.k!=='umbrella'||p._bez)continue;const d=Math.hypot(p.x-P.x,p.z-P.z);if(d>90||d<30)continue;
    if(hashS('strand|'+Math.round(p.x)+'|'+new Date().getDate())>.7*want)continue;
    const n=G.npcMake(pick(['toerist','toerist','student','burger','oma']),p.x+1.3,p.z+.05);if(!n)continue;n.x=p.x+1.3;n.z=p.z+.05;n.fixed=1;n.strand=1;n.st=n.fixSt='strand';n.home={x:n.x,z:n.z,ry:rr(-.5,.5)};n.ry=n.home.ry;n.umb=0;n._pa=p;p._bez=1;
    if(n.look&&Math.random()<.6){n.look=Object.assign({},n.look,{top:pick(['#ff4fd8','#3ad6ff','#f2c230','#ffffff','#ff7a1a']),arm:n.look.skin,hat:Math.random()<.4?'cap':'none'})}STRAND.push(n)}}
/* ---------- telefoon: het weer en de speltijd ---------- */
function temp(k,t){const h=G.klok(t).h,mo=new Date(t).getMonth(),base=[3,4,7,10,14,17,19,19,16,12,7,4][mo],dag=Math.sin(Math.PI*clamp((h-6)/16,0,1));
  let v=base-3+dag*7+({zon:4,helder:1,regen:-2,onweer:-1,storm:-3,sneeuw:-5,mist:-1}[k]||0);if(k==='sneeuw')v=Math.min(v,0);return Math.round(v)}
const FXT={zon:'Strand vol, iedereen buiten.',helder:'Gewoon goed weer.',bewolkt:'Grijs, verder rustig.',mist:'Slecht zicht: je valt minder op.',sneeuw:'Gladde wegen, minder mensen op straat.',
  regen:'Minder mensen op straat, natte wegen.',onweer:'Weinig mensen buiten, gladde wegen.',storm:'Bijna niemand buiten, gladde wegen, de politie is trager.'};
const isNacht=t=>{const k=G.klok(t);return k.h<k.rise-.3||k.h>k.set+.3};
const minTot=t=>{const m=Math.max(1,Math.round((t-Date.now())/60000));return m<60?m+' min':Math.floor(m/60)+' u '+(m%60?m%60+' min':'')};
G.weerKaart=function(){const k=weerNat(),t=Date.now(),kl=G.klok(t),night=G.night>.6,E0=G.enWeer(),V=verloop(3);
  return `<button class="sd-p2-wx" data-app="weer"><i class="sd-p2-wxi" data-k="${k}">${wIcon(k,night)}</i><span class="sd-p2-wxn"><b>${K.E(naamVan(k,night))} · ${temp(k,t)}°</b><small>${kl.txt} speltijd${E0.d?` · energie ${sgn(E0.d)}`:''}</small></span>
   <span class="sd-p2-wxv">${V.map(v=>`<em data-k="${v.k}">${G.klok(v.t).txt}${wIcon(v.k,isNacht(v.t))}</em>`).join('')}</span></button>`};
function weerScr(scr,head){const t=Date.now(),k=weerNat(),kl=G.klok(t),night=G.night>.6,E0=G.enWeer(),V=verloop(6),f=gekozen();
  scr.innerHTML=head('Weer','Pixelstad · voor iedereen hetzelfde')+`<div class="sd-p2-list sd-p2-weer">
   <div class="sd-p2-wxbig"><i class="sd-p2-wxi" data-k="${k}">${wIcon(k,night)}</i><div><b>${K.E(naamVan(k,night))}</b><span>${temp(k,t)}° · ${kl.txt} speltijd</span><small>Nieuwe speldag over ${minTot(kl.end)}</small></div></div>
   <p class="sd-p2-wxfx">${K.E(FXT[k]||'')}</p>
   <div class="sd-p2-dag ${E0.d>0?'ok':''}"><b>Max. energie ${E0.max}</b><span>${E0.d?`Normaal ${E0.base}, door het weer ${sgn(E0.d)}.`:'Dit weer doet niets met je energie.'} Zon geeft meer, regen en storm minder.</span></div>
   <h5>Verwachting</h5>${V.length?V.map(v=>`<div class="sd-p2-row sd-p2-wxr"><i class="sd-p2-ri sd-p2-wxi" data-k="${v.k}">${wIcon(v.k,isNacht(v.t))}</i><span><b>${K.E(WN[v.k])} · ${temp(v.k,v.t)}°</b><small>${G.klok(v.t).txt} speltijd · over ${minTot(v.t)}</small></span><em>${enDelta(E0.base,v.k)?sgn(enDelta(E0.base,v.k)):''}</em></div>`).join(''):'<p class="sd-p2-none">Voorlopig blijft het zo.</p>'}
   ${f?`<p class="sd-p2-note">Je ziet nu ${K.E(WN[f].toLowerCase())} (ingesteld). Energie en drukte volgen het echte weer.</p>`:''}
   <p class="sd-p2-note">Een speldag (4 uur) is één dag en nacht. Een speluur duurt 10 minuten.</p></div>`}
function phoneApp(){if(!G.phone||!G.phone.add)return;G.phone.add({k:'weer',n:'Weer',ic:wIcon('zon',false),c:'#7fc8ff',after:'contacten',render:(scr,head)=>weerScr(scr,head)})}
/* ---------- titelkaart bij binnenkomst ---------- */
function titleCard(){try{if(typeof inJail==='function'&&inJail())return;if(G.ui&&G.ui.cur&&G.ui.cur())return}catch(e){}
  const d=new Date(),el=document.createElement('div');el.className='sd-title';el.innerHTML=`<i></i><div><small>${K.E(d.toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'}))} · ${G.klok?G.klok().txt:''} · ${K.E(naamVan(W.k,G.night>.6))}</small><b>Pixelstad</b><span>${K.E(M.districtAt(G.P.x,G.P.z))}</span></div><i></i>`;
  document.body.appendChild(el);G.dist=Math.min(74,G.distT*1.55);setTimeout(()=>el.classList.add('uit'),2300);setTimeout(()=>el.remove(),3100)}
/* ---------- koppelen ---------- */
weerDoel();Object.assign(W,Wt);phoneApp();
G._weerDbg={volkStep,strandStep,strand:STRAND};   // voor tests
// elke paar seconden kijken of het weer omslaat (de perioden wisselen op vaste tijden); bij een ander effect op je energie een melding
let enK=null;setInterval(()=>{const k0=W.k;weerDoel();if(W.k!==k0)hud();
  try{const E0=G.enWeer();if(enK!=null&&E0.d!==enK&&G.ready&&G.toast){const night=G.night>.6;G.toast(naamVan(E0.k,night)+': max. energie '+E0.max+(E0.d?' ('+sgn(E0.d)+')':''),E0.d<0?'bad':'ok');enHud()}enK=E0.d}catch(e){}},5000);
let slowT=0;
const wait=setInterval(()=>{if(!G.ready||!G.post)return;clearInterval(wait);
  try{setupSky();setupBirds();setupCats();setupBoats();setupUmb()}catch(e){console.error(e)}
  G.applyLight&&G.applyLight();titleCard();
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(G.paused)return;const ts=performance.now()/1000;try{skyStep(dt,ts);flashStep(dt);puffStep(dt);birdStep(dt,ts);catStep(dt,ts);boatStep(dt,ts);ambStep(dt);umbStep();
    if(performance.now()-slowT>1200){slowT=performance.now();volkStep();strandStep()}}catch(e){if(!G._sfErr){G._sfErr=1;console.error(e)}}}},220);
})();
