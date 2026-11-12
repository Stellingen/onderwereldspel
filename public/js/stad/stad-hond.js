// Pixelstad: een hond. In het Noorderpark loopt een zwerfhond. Aai hem, neem hem mee (eenmalig: dierenarts en een mand) en hij
// loopt overal met je mee. Toets H (of de knop met de poot): aaien, zoeken (hij rent naar het dichtstbijzijnde verstopte
// pakketje, of graaft iets op), een bal gooien, zitten of naar huis. Hij blaft als er politie in de buurt is terwijl je gezocht
// wordt, jaagt duiven op en mensen vinden hem leuk. In de auto zit hij naast je. Ook een paar mensen in de stad laten hun hond uit.
// Bewaard in S.stadHond = {n:naam, k:vacht, t:sinds, home:thuis, found:aantal gevonden}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv=()=>{try{save()}catch(e){}};
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k);
const fl=(t,x,z,c)=>G.fx2&&G.fx2.float(t,x,z,c);
const VACHT=[['#8a5a34','#5a3a20'],['#1d1d1f','#3a3a3c'],['#e8e4da','#8a5a34'],['#d6a24a','#b0802a'],['#8a8c90','#5a5d63']];
const NAMEN=['Boef','Rakker','Vito','Tyson','Saar','Mop','Bikkel','Donna'];
const H=()=>{try{return S.stadHond&&typeof S.stadHond==='object'&&S.stadHond.n?S.stadHond:null}catch(e){return null}};
/* ---------- een hond van blokjes ---------- */
// elk bewegend deel is één model (K.model voegt de blokjes samen)
function Dog(k,scale){const v=VACHT[k%VACHT.length],g=new TH.Group(),P={};this.g=g;this.P=P;g.scale.setScalar(scale||1);
  const body=new TH.Group();body.position.y=.42;g.add(body);P.body=body;body.add(K.model([[.34,.32,.78,0,0,0,v[0]],[.36,.12,.3,0,.12,-.1,v[1]]]));
  const head=new TH.Group();head.position.set(0,.2,.42);body.add(head);P.head=head;head.add(K.model([[.3,.28,.28,0,.06,.06,v[0]],[.16,.14,.2,0,0,.28,v[1]],[.08,.07,.05,0,.04,.39,'#15161a'],[.09,.16,.06,-.13,.2,0,v[1]],[.09,.16,.06,.13,.2,0,v[1]],[.05,.05,.02,-.08,.1,.2,'#15161a'],[.05,.05,.02,.08,.1,.2,'#15161a']]));
  const tail=new TH.Group();tail.position.set(0,.12,-.4);body.add(tail);P.tail=tail;tail.add(K.model([[.08,.08,.34,0,.08,-.14,v[0]]]));
  P.legs=[[-.12,.3],[.12,.3],[-.12,-.3],[.12,-.3]].map(([x,z])=>{const l=new TH.Group();l.position.set(x,.3,z);g.add(l);l.add(K.model([[.1,.32,.1,0,-.16,0,v[1]]]));return l});
  P.band=K.model([[.36,.07,.1,0,.1,.32,'#c0261e']]);body.add(P.band);P.band.visible=false;
  this.x=0;this.z=0;this.ry=0;this.ph=0;this.v=0;this.sit=0;this.st='idle';this.t=0;G.scene().add(g)}
Dog.prototype.draw=function(dt,ts){const P=this.P,g=this.g,mv=this.v>.3;this.ph+=dt*this.v*2.4;g.position.set(this.x,this.y||0,this.z);g.rotation.y=this.ry;
  const sw=mv?Math.sin(this.ph)*.7:0;P.legs[0].rotation.x=sw;P.legs[3].rotation.x=sw;P.legs[1].rotation.x=-sw;P.legs[2].rotation.x=-sw;
  const sit=this.sit>0&&!mv;P.body.rotation.x=sit?-.5:this.dig?.35:0;P.body.position.y=sit?.36:.42+(mv?Math.abs(Math.cos(this.ph))*.04:0)+(this.hop||0);P.legs[2].rotation.x=sit?-1.3:P.legs[2].rotation.x;P.legs[3].rotation.x=sit?-1.3:P.legs[3].rotation.x;
  P.tail.rotation.y=Math.sin(ts*(this.happy?22:9))*(this.happy?.9:.45);P.tail.rotation.x=this.sad?.9:-.5;P.head.rotation.x=this.dig?.7+Math.sin(ts*18)*.2:sit?.35:Math.sin(ts*1.7+this.x)*.06;P.head.rotation.y=this.lookY||0;
  if(this.dig){P.legs[0].rotation.x=Math.sin(ts*24)*.9;P.legs[1].rotation.x=-Math.sin(ts*24)*.9}};
Dog.prototype.moveTo=function(tx,tz,sp,dt){const dx=tx-this.x,dz=tz-this.z,d=Math.hypot(dx,dz);if(d<.15){this.v=0;return true}const s=Math.min(sp*dt,d),nx=this.x+dx/d*s,nz=this.z+dz/d*s;let mv=false;
  if(M.canStand(nx,this.z,.22)){this.x=nx;mv=true}if(M.canStand(this.x,nz,.22)){this.z=nz;mv=true}let r=Math.atan2(dx,dz)-this.ry;r=Math.atan2(Math.sin(r),Math.cos(r));this.ry+=r*Math.min(1,dt*12);this.v=mv?sp:0;this.stuck=mv?0:(this.stuck||0)+dt;return false};
/* ---------- jouw hond (of de zwerfhond die het nog moet worden) ---------- */
let dog=null,job=null,ball=null,barkT=0,sniffT=6,zoekCd=0,balXp=0,stray=null;
const STRAY={x:M.A.park.x-40,z:M.A.park.z};   // in het Noorderpark
function spawn(){const h=H();if(dog){G.scene().remove(dog.g);dog=null}if(stray){G.scene().remove(stray.g);stray=null}
  if(h){dog=new Dog(h.k||0);dog.P.band.visible=true;const p=M.nearestWalk(G.P.x+1.2,G.P.z+1,4)||G.P;dog.x=p.x;dog.z=p.z;dog.g.visible=!h.home}
  else{stray=new Dog(strayK());const p=M.nearestWalk(STRAY.x,STRAY.z,10)||STRAY;stray.x=stray.hx=p.x;stray.z=stray.hz=p.z;stray.sad=1}btn()}
const strayK=()=>{let h=0;const s=String(window.__USER__||'x');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h%VACHT.length};
const say=(d,t,o)=>G.bubble&&G.bubble(d,t,Object.assign({y:1.25,col:'#fff3c8',life:1.6},o||{}));
function bark(d,loud){say(d,pick(['Woef!','Waf!','Woef woef!']));if(loud||Math.hypot(d.x-G.P.x,d.z-G.P.z)<25)G.snd&&G.snd.fx('woef');d.hop=.12;setTimeout(()=>{d.hop=0},160)}
function hearts(d){G.fx2&&G.fx2.burst(d.x,1,d.z,'#ff7fb3',6);d.happy=1;clearTimeout(d._h);d._h=setTimeout(()=>{d.happy=0},2500)}
function follow(dt,ts){const P=G.P,h=H();if(!dog||!h)return;if(h.home){dog.g.visible=false;return}
  if(G.driving){dog.g.visible=false;dog.x=P.x;dog.z=P.z;return}if(!dog.g.visible){dog.g.visible=true;const p=M.nearestWalk(P.x+1.3,P.z+.6,4)||P;dog.x=p.x;dog.z=p.z}
  const d=Math.hypot(P.x-dog.x,P.z-dog.z);if(d>45||(dog.stuck||0)>2.5){const p=M.nearestWalk(P.x-Math.sin(P.ry)*1.6,P.z-Math.cos(P.ry)*1.6,5)||P;dog.x=p.x;dog.z=p.z;dog.stuck=0;job=job&&job.k==='zoek'?job:null}
  dog.dig=0;dog.lookY=0;G.hondPos=dog;
  if(job){job.t+=dt;
    if(job.k==='zoek'){if(!job.path||!job.path.length||dog.moveTo(job.path[0].x,job.path[0].z,7.5,dt)){job.path&&job.path.shift();if(!job.path||!job.path.length){dog.v=0;dog.dig=1;if(!job.at){job.at=job.t;bark(dog,1)}if(job.t-job.at>1.6&&Math.floor(job.t*1.2)!==job.bk){job.bk=Math.floor(job.t*1.2);if(Math.random()<.4)bark(dog)}
          if(job.done&&job.t-job.at>1.8){job.done();job=null}else if(!job.done&&(d<3.2||job.t-job.at>40))job=null}}if(job&&job.t>70)job=null}
    else if(job.k==='bal'){const b=ball;if(job.ph===0){if(dog.moveTo(job.x,job.z,9.5,dt)||job.t>4){job.ph=1;b.visible=false;dog.happy=1}}else{if(d<1.8||job.t>9){job=null;hearts(dog);say(dog,'Woef!');if(performance.now()-balXp>20000){balXp=performance.now();G.ev&&G.ev('bal')}}else dog.moveTo(P.x,P.z,8.5,dt)}}
    else if(job.k==='zit'){dog.v=0;dog.sit=1;if(d>14){job=null;dog.sit=0}}
    dog.draw(dt,ts);return}
  // gewoon meelopen: schuin achter je
  const tx=P.x-Math.sin(P.ry)*1.2+Math.cos(P.ry)*.9,tz=P.z-Math.cos(P.ry)*1.2-Math.sin(P.ry)*.9,pv=Math.hypot(P.vx,P.vz),td=Math.hypot(tx-dog.x,tz-dog.z);
  if(td>1.1||pv>1){dog.sit=0;dog.moveTo(tx,tz,clamp(2.2+td*2.2,pv*.9,12.5),dt)}else{dog.v=0;dog.idle=(dog.idle||0)+dt;if(dog.idle>2.2||G.sitting)dog.sit=1;dog.lookY=clamp(Math.atan2(P.x-dog.x,P.z-dog.z)-dog.ry,-.9,.9)}
  if(pv>1)dog.idle=0;
  // snuffelen: blaffen naar politie als je gezocht wordt, duiven en katten opjagen
  barkT-=dt;sniffT-=dt;if(sniffT<=0){sniffT=rr(4,9);try{const cop=S.wanted&&G.NPC.find(n=>n.arch==='agent'&&Math.hypot(n.x-P.x,n.z-P.z)<24);
      if(cop&&barkT<=0){barkT=18;bark(dog,1);G.toast(h.n+' ruikt politie in de buurt','bad')}
      else if(Math.random()<.18&&!G.talking){const m=G.NPC.find(n=>(n.arch==='oma'||n.arch==='toerist'||n.arch==='student')&&n.st==='walk'&&Math.hypot(n.x-dog.x,n.z-dog.z)<5);if(m&&G.bubble){G.bubble(m,pick(['Wat een lieverd!','Ach, kijk nou.','Mag ik hem aaien?','So cute!']));if(!m.dogLove){m.dogLove=1;G.rep&&G.rep.add(m.x,m.z,1)}}}}catch(e){}}
  dog.draw(dt,ts)}
function strayStep(dt,ts){const P=G.P,s=stray;if(!s)return;const d=Math.hypot(P.x-s.x,P.z-s.z);if(d>70)return;s.t+=dt;
  if(s.friend>0){s.friend-=dt;const tx=P.x-Math.sin(P.ry)*1.5,tz=P.z-Math.cos(P.ry)*1.5;if(Math.hypot(tx-s.x,tz-s.z)>1.2)s.moveTo(tx,tz,clamp(Math.hypot(tx-s.x,tz-s.z)*2,2,9),dt);else{s.v=0;s.sit=1}if(Math.hypot(s.x-s.hx,s.z-s.hz)>60)s.friend=0}
  else{s.sit=0;if(!s.wp||s.moveTo(s.wp.x,s.wp.z,1.5,dt)||(s.stuck||0)>1){if((s.wait=(s.wait||rr(2,6))-dt)<=0){s.wait=0;const q=M.nearestWalk(s.hx+rr(-9,9),s.hz+rr(-7,7),4);s.wp=q||{x:s.hx,z:s.hz}}else{s.v=0;s.sit=s.wait>1.5?1:0}}
    if(d<9&&Math.random()<dt*.12){say(s,pick(['…','Piep.','Wf.']),{life:1.2});if(d<6)G.snd&&G.snd.fx('jank')}}
  s.draw(dt,ts);if(s.spot){s.spot.x=s.x;s.spot.z=s.z}}
/* ---------- zwerfhond: aaien en meenemen ---------- */
function dogPic(k){return cv=>{cv.width=40;cv.height=24;const c=cv.getContext('2d'),v=VACHT[k%VACHT.length],R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};R(0,0,40,24,'#1a1d23');R(0,20,40,4,'#2f5a2a');R(9,10,18,8,v[0]);R(9,10,18,2,v[1]);R(25,5,9,9,v[0]);R(32,9,5,4,v[1]);R(36,9,2,2,'#15161a');R(26,3,3,4,v[1]);R(31,3,3,4,v[1]);R(30,8,2,2,'#15161a');R(10,18,3,3,v[1]);R(15,18,3,3,v[1]);R(21,18,3,3,v[1]);R(6,7,3,5,v[0]);if(H())R(24,11,2,6,'#c0261e')}}
const prijs=()=>Math.max(100,Math.round((G.schaal&&G.schaal.kost?G.schaal.kost(5):zS(5))/50)*50);   // prijs: zonder lidbonus
function strayMenu(){if(G.talking||G.driving||!stray)return;G.talking=true;const s=stray,k=strayK();s.friend=Math.max(s.friend||0,6);
  const pet=()=>{G.pose='aai';G.P.ry=Math.atan2(s.x-G.P.x,s.z-G.P.z);hearts(s);s.sad=0;s.friend=40;G.snd&&G.snd.fx('woef');setTimeout(()=>{if(G.pose==='aai')G.pose=null},1400);K.say('Hij kwispelt en duwt zijn neus in je hand. Hij loopt een stukje met je mee.','blij',ch())};
  const ch=()=>[{t:'Aaien',ic:K.ic.hart,f:pet},{t:'Meenemen · '+fmt(prijs()),sub:S.cash<prijs()?'':'Dierenarts, halsband en een mand',ic:K.ic.poot,dis:S.cash<prijs(),why:'Kost '+fmt(prijs())+' contant',f:()=>{K.say('Hoe ga je hem noemen?',null,NAMEN.map(nm=>({t:nm,ic:K.ic.poot,f:()=>adopt(nm,k)})))}},{t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()}];
  K.dialog({name:'Zwerfhond',role:'Noorderpark',draw:dogPic(k),lines:['Een zwerfhond. Mager en vies, maar hij kijkt je aan alsof hij je al jaren kent.'],col:'#d9a27a',choices:ch(),onClose:()=>{G.talking=false}})}
function adopt(nm,k){if(S.cash<prijs())return;S.cash-=prijs();S.stadHond={n:nm,k,t:Date.now(),home:0,found:0};sv();K.closeDialog(true);const x=stray.x,z=stray.z;if(stray.spot)G.unspot(stray.spot);spawn();dog.x=x;dog.z=z;hearts(dog);bark(dog,1);G.ev&&G.ev('hond');G.snd&&G.snd.fx('lvl');
  const el=document.createElement('div');el.className='sd-ach sd-lvl';el.innerHTML=`<i>${K.ic.poot}</i><span><small>Nieuwe maat</small><b>${E(nm)}</b><em>Hij loopt nu overal met je mee</em></span>`;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);
  G.msg&&G.msg('stad',nm+' is nu van jou. Druk op H: aaien, zoeken, een bal gooien of naar huis sturen.',{k:'hond'},true);if(typeof log==='function')log('Hond geadopteerd in de Pixelstad: '+nm,'ok')}
/* ---------- wat je met je hond kunt doen (H) ---------- */
function zoek(){const h=H(),P=G.P;if(zoekCd>performance.now()){G.toast(h.n+' moet even uitrusten','info');return}zoekCd=performance.now()+75000;G.ev&&G.ev('zoek');G.snd&&G.snd.fx('whistle');say(dog,'Snuf snuf…');
  const C=S.stadCol||{},L=(G.pakketten||[]).filter(p=>!C[p.id]).map(p=>({p,d:Math.hypot(p.x-P.x,p.z-P.z)})).filter(o=>o.d<130).sort((a,b)=>a.d-b.d);
  const ext=G.hondDoel&&G.hondDoel();const tgt=ext||(L[0]&&L[0].p);
  if(tgt){const path=M.findPath(dog.x,dog.z,tgt.x,tgt.z);if(path&&path.length){job={k:'zoek',t:0,path};G.setWaypoint&&G.setWaypoint(tgt.x,tgt.z,h.n+' heeft iets geroken');if(G.waypoint&&tgt.id)G.waypoint.pk=tgt.id;return}}
  // niets in de buurt: soms graaft hij zelf iets op
  const q=M.nearestWalk(P.x+rr(-7,7),P.z+rr(-7,7),4)||P;job={k:'zoek',t:0,path:[{x:q.x,z:q.z}],done:()=>{if(Math.random()<.45){const g=Math.max(5,zS(.15));S.cash+=g;h.found=(h.found||0)+1;sv();fl(h.n+' graaft iets op · +'+fmt(g),dog.x,dog.z,'#ffd35a');G.snd&&G.snd.fx('coin');hearts(dog)}else{fl('Niks te vinden hier',dog.x,dog.z,'#9aa1ab');dog.sad=1;setTimeout(()=>{dog.sad=0},2000)}}}}
function bal(){const P=G.P;if(!ball){ball=new TH.Mesh(new TH.BoxGeometry(.2,.2,.2),new TH.MeshBasicMaterial({color:0xe8584a}));G.scene().add(ball)}const a=P.ry+rr(-.3,.3);let q=null;for(let r=9;r>2&&!q;r-=1.5){const x=P.x+Math.sin(a)*r,z=P.z+Math.cos(a)*r;if(M.canStand(x,z,.3)&&G.los(P,{x,z}))q={x,z}}if(!q){G.toast('Hier is geen ruimte','info');return}
  G.pose='slaR';setTimeout(()=>{if(G.pose==='slaR')G.pose=null},350);G.snd&&G.snd.fx('whoosh');ball.visible=true;ball.userData={t:0,x0:P.x,z0:P.z,x1:q.x,z1:q.z};job={k:'bal',t:0,ph:0,x:q.x,z:q.z}}
function menu(){const h=H();if(!h){G.toast('Je hebt nog geen hond. In het Noorderpark loopt er een rond.','info');return}if(G.talking||G.paused||G.driving||(G.mini&&G.mini.active()))return;
  if(h.home){h.home=0;sv();const P=G.P,p=M.nearestWalk(P.x-Math.sin(P.ry)*9,P.z-Math.cos(P.ry)*9,8)||P;dog.x=p.x;dog.z=p.z;dog.g.visible=true;G.snd&&G.snd.fx('whistle');G.toast(h.n+' komt eraan','ok');btn();return}
  G.talking=true;const near=Math.hypot(dog.x-G.P.x,dog.z-G.P.z)<3.5;
  K.dialog({name:h.n,role:'Jouw hond',draw:dogPic(h.k||0),lines:[pick(['Hij kijkt je aan en kwispelt.','Zijn oren gaan omhoog.','Hij wacht op wat je gaat zeggen.'])],col:'#d9a27a',choices:[
    {t:'Aaien',ic:K.ic.hart,dis:!near,why:'Hij is te ver weg',f:()=>{K.closeDialog(true);G.pose='aai';G.P.ry=Math.atan2(dog.x-G.P.x,dog.z-G.P.z);hearts(dog);G.snd&&G.snd.fx('woef');setTimeout(()=>{if(G.pose==='aai')G.pose=null},1400)}},
    {t:'Zoek!',sub:'Pakketjes en verloren spullen',ic:K.ic.eye,f:()=>{K.closeDialog(true);zoek()}},
    {t:'Bal gooien',ic:K.ic.star,f:()=>{K.closeDialog(true);bal()}},
    {t:job&&job.k==='zit'?'Kom':'Zit en blijf',ic:K.ic.hand,f:()=>{K.closeDialog(true);job=job&&job.k==='zit'?null:{k:'zit',t:0};dog.sit=job?1:0;say(dog,job?'…':'Woef!')}},
    {t:'Naar huis',sub:'Fluit hem terug met H',ic:K.ic.home,f:()=>{K.closeDialog(true);h.home=1;job=null;sv();dog.g.visible=false;G.toast(h.n+' gaat naar huis','info');btn()}},
    {t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()}],onClose:()=>{G.talking=false}})}
addEventListener('keydown',e=>{if(e.repeat||G.paused)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(e.key.toLowerCase()==='h'&&!(K.dialogOpen&&K.dialogOpen())&&H()){e.preventDefault();menu()}});
let hb=null;function btn(){const w=document.querySelector('.sd-btns');if(!w)return;if(!hb){hb=document.createElement('button');hb.className='sd-b sd-b-em';hb.id='sdHond';hb.title='Hond (H)';w.insertBefore(hb,w.firstChild);hb.addEventListener('click',menu)}const h=H();hb.hidden=!h;if(h)hb.innerHTML=`${K.ic.poot}<span>${E(h.n)}</span><kbd>H</kbd>`;hb.classList.toggle('uit',!!(h&&h.home))}
/* ---------- telefoon ---------- */
function html(){const h=H();if(!h)return `<div class="sd-p2-list"><div class="sd-vg-empty"><b>Nog geen hond</b><p>In het Noorderpark loopt een zwerfhond rond. Aai hem een keer. Wie weet wil hij mee.</p><button class="btn sm" data-hroute>Route naar het park</button></div></div>`;
  const dgn=Math.max(1,Math.round((Date.now()-(h.t||Date.now()))/864e5));
  return `<div class="sd-p2-list"><div class="sd-nm-top"><canvas id="sdHondPic" width="40" height="24" style="width:80px;height:48px;image-rendering:pixelated;border:2px solid #000"></canvas><div><strong>${E(h.n)}</strong><small>${dgn} dag${dgn>1?'en':''} bij jou · ${h.found||0} keer iets gevonden</small><small>${h.home?'Ligt thuis in zijn mand':'Loopt met je mee'}</small></div></div>
   <button class="sd-p2-row" data-hhome><i class="sd-p2-ri">${K.ic.home}</i><span><b>${h.home?'Fluiten':'Naar huis sturen'}</b><small>${h.home?'Hij komt naar je toe':'Hij wacht thuis op je'}</small></span></button>
   <button class="sd-p2-row" data-hnaam><i class="sd-p2-ri">${K.ic.poot}</i><span><b>Andere naam</b><small>Nu: ${E(h.n)}</small></span></button>
   <p class="sd-p2-note">Buiten: toets H of de knop met de poot. Aaien, zoeken, bal gooien, zitten.</p></div>`}
function click(t,close){const h=H();if(t.closest('[data-hroute]')){close();G.setWaypoint&&G.setWaypoint(STRAY.x,STRAY.z,'Zwerfhond (Noorderpark)');return true}if(!h)return false;
  if(t.closest('[data-hhome]')){h.home=h.home?0:1;sv();if(dog){dog.g.visible=!h.home;if(!h.home){const p=M.nearestWalk(G.P.x+1.5,G.P.z+1,5)||G.P;dog.x=p.x;dog.z=p.z}}btn();return true}
  if(t.closest('[data-hnaam]')){h.n=NAMEN[(NAMEN.indexOf(h.n)+1)%NAMEN.length];sv();btn();return true}return false}
G.hond={has:()=>!!H(),menu,html,click,after:()=>{const c=document.getElementById('sdHondPic'),h=H();if(c&&h)dogPic(h.k||0)(c)},_t:{get dog(){return dog},get stray(){return stray},zoek,bal,adopt,strayMenu}};
/* ---------- honden van anderen ---------- */
const PETS=[];
function setupPets(){const L=G.NPC.filter(n=>!n.fixed&&(n.arch==='burger'||n.arch==='oma'||n.arch==='zakenman')).slice(0,3);L.forEach((n,i)=>{const d=new Dog(i+1,.82);d.x=n.x+.6;d.z=n.z+.4;PETS.push({d,n})})}
function petStep(dt,ts){const P=G.P;PETS.forEach(o=>{const d=o.d,n=o.n;if(Math.hypot(n.x-P.x,n.z-P.z)>75){d.g.visible=false;d.x=n.x;d.z=n.z;return}d.g.visible=true;const tx=n.x+Math.cos(n.ry)*.8-Math.sin(n.ry)*.5,tz=n.z-Math.sin(n.ry)*.8-Math.cos(n.ry)*.5,td=Math.hypot(tx-d.x,tz-d.z);
    if(td>25){d.x=tx;d.z=tz}if(td>.5)d.moveTo(tx,tz,clamp(td*2.4,1,9),dt);else{d.v=0;d.sit=n.sp<.1?1:0}if(n.sp>.1)d.sit=0;
    if(dog&&dog.g.visible&&Math.hypot(dog.x-d.x,dog.z-d.z)<4&&Math.random()<dt*.25)bark(d);d.draw(dt,ts)})}
/* ---------- koppelen ---------- */
function ballStep(dt){if(!ball||!ball.visible)return;const u=ball.userData;u.t=Math.min(1,u.t+dt*1.6);ball.position.set(u.x0+(u.x1-u.x0)*u.t,.2+Math.sin(u.t*Math.PI)*2.6+(u.t>=1?0:1),u.z0+(u.z1-u.z0)*u.t)}
function step(dt){const ts=performance.now()/1000;follow(dt,ts);strayStep(dt,ts);petStep(dt,ts);ballStep(dt)}
const wait=setInterval(()=>{if(!G.ready||!G.spot||!G.NPC||G.NPC.length<10)return;clearInterval(wait);
  try{spawn();setupPets();if(stray)stray.spot=G.spot({k:'hond',x:stray.x,z:stray.z,r:2.2,n:'Zwerfhond',col:'#d9a27a',h:1.5,noRing:1,act:strayMenu,dot:'#d9a27a',dotR:80,map:{n:'Zwerfhond',ic:K.ic.poot,c:'#d9a27a',pri:2}})}catch(e){console.error(e)}
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)try{step(dt)}catch(e){if(!G._hErr){G._hErr=1;console.error(e)}}}},280);
})();
