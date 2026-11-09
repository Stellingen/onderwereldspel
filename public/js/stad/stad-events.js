// Pixelstad: gebeurtenissen. Om de paar minuten gebeurt er iets bij jou in de buurt. Je hoeft er niets mee, maar het loont:
// - Een verloren portemonnee op de stoep: houden (zwart geld) of terugbrengen naar de eigenaar (wit geld en respect).
// - Houd de dief! Iemand rent weg met de kassa van een winkel. Haal hem in: geef de buit terug of hou hem zelf.
// - Een lading die van een vrachtwagen is gevallen: wie er binnen drie minuten bij is, breekt de kist open.
// - Een verdwaalde toerist: loop met hem mee naar waar hij moet zijn, voor een fooi.
// Niet tijdens een klus, een achtervolging of een race. Je hond helpt zoeken (Zoek!).
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,E=K.E,T=M.T;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv=()=>{try{save()}catch(e){}};
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k),wS=k=>Math.max(5,Math.round((G.schaal?G.schaal.wit():20)*k/5)*5);
const fl=(t,x,z,c)=>G.fx2&&G.fx2.float(t,x,z,c);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
let EV=null,next=rr(70,130);
const free=()=>!(G.mission&&G.mission())&&!(G.police&&G.police.active())&&!(G.race&&G.race.active())&&!G.paused&&!(typeof inJail==='function'&&inJail());
// een plek op de stoep op een afstand van jou, die je lopend kunt bereiken
function plek(min,max,tiles){const P=G.P;for(let k=0;k<60;k++){const a=rr(0,6.28),r=rr(min,max),x=P.x+Math.cos(a)*r,z=P.z+Math.sin(a)*r,t=M.at(Math.floor(x),Math.floor(z));if(!(tiles||[T.WALK,T.PLAZA]).includes(t)||!M.canStand(x,z,.4))continue;if(M.estateAt(x,z)!==M.estateAt(P.x,P.z))continue;const path=M.findPath(P.x,P.z,x,z);if(path&&path.length)return {x,z}}return null}
function banner(sm,t,c){const a=document.getElementById('sdArea');if(!a)return;a.querySelector('small').textContent=sm;a.querySelector('b').textContent=t;a.hidden=false;a.classList.toggle('bad',c==='bad');a.classList.remove('go');void a.offsetWidth;a.classList.add('go');clearTimeout(banner.t);banner.t=setTimeout(()=>{a.hidden=true;a.classList.remove('bad')},3000)}
function end(){if(!EV)return;const e=EV;EV=null;try{e.clean&&e.clean()}catch(x){}next=rr(170,330)}
const done=()=>{G.ev&&G.ev('event');S.stats=S.stats||{};S.stats.stadEv=(S.stats.stadEv||0)+1;sv()};
/* ---------- verloren portemonnee ---------- */
function walletPic(cv){cv.width=40;cv.height=24;const c=cv.getContext('2d'),R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};R(0,0,40,24,'#1a1d23');R(9,7,22,13,'#6a4a2c');R(9,7,22,3,'#8a6a42');R(26,11,5,5,'#d6a63e');R(12,4,10,4,'#3fe395');R(14,3,10,3,'#2f8a4a')}
function evWallet(){const p=plek(22,46);if(!p)return false;const m=K.model([[.36,.1,.26,0,.06,0,'#6a4a2c'],[.38,.04,.1,0,.12,0,'#8a6a42'],[.1,.1,.02,.1,.07,.14,'#d6a63e',1]],{noShadow:1}),gl=new TH.Mesh(new TH.OctahedronGeometry(.14,0),new TH.MeshBasicMaterial({color:0xffe9a8}));
  m.position.set(p.x,0,p.z);m.rotation.y=rr(0,6.28);gl.position.set(p.x,.9,p.z);G.scene().add(m,gl);const nm=pick(['mevrouw De Boer','meneer Yildiz','Sanne','meneer Van Dijk','Fatima','oma Riek']);
  const e=EV={k:'wallet',x:p.x,z:p.z,t:0,max:240,m,gl,nm};
  e.spot=G.spot({k:'ev',x:p.x,z:p.z,r:1.8,n:'Oprapen',sub:'portemonnee',col:'#ffd35a',h:1.2,noRing:1,show:()=>!e.got,act:()=>{if(G.talking||G.driving)return;G.talking=true;const g=zS(.6);
      K.dialog({name:'Portemonnee',role:'Gevonden op straat',draw:walletPic,lines:['Pasjes, een rijbewijs van '+nm+' en wat briefgeld. Wat doe je ermee?'],col:'#ffd35a',choices:[
        {t:'Terugbrengen',sub:'De eigenaar loopt hier ergens rond',ic:K.ic.hand,f:()=>{K.closeDialog(true);take();owner()}},
        {t:'Houden · '+fmt(g),ic:K.ic.money,risk:1,f:()=>{K.closeDialog(true);take();S.cash+=g;if(typeof addZwart==='function')addZwart(g);G.snd&&G.snd.fx('cash');fl('+'+fmt(g),G.P.x,G.P.z);done();end()}},
        {t:'Laten liggen',ic:K.ic.no,f:()=>K.closeDialog()}],onClose:()=>{G.talking=false}})},dot:'#ffd35a',dotR:55,big:1,dotIf:()=>!e.got});
  const take=()=>{e.got=1;G.scene().remove(m,gl);G.pose='pak';setTimeout(()=>{if(G.pose==='pak')G.pose=null},500);G.snd&&G.snd.fx('grab')};
  const owner=()=>{const q=plek(30,70)||plek(12,30);if(!q){S.cash+=wS(2);done();end();return}const n=G.npcMake(pick(['burger','oma','student','zakenman']),q.x,q.z);n.evt='eigenaar';n.st='stand';n.fixed=1;n.fixSt='stand';n.home={x:n.x,z:n.z,ry:rr(0,6.28)};n.nm=nm.charAt(0).toUpperCase()+nm.slice(1);e.n=n;e.t=0;e.max=260;
    G.setWaypoint&&G.setWaypoint(n.x,n.z,'Eigenaar van de portemonnee');G.toast('De eigenaar zoekt ernaar. Op je kaart gezet.','info')};
  e.step=dt=>{gl.rotation.y+=dt*3;gl.position.y=.9+Math.sin(e.t*3)*.1;if(e.n&&Math.random()<dt*.2&&dist(e.n,G.P)<16)G.bubble&&G.bubble(e.n,pick(['Waar is mijn portemonnee?','Ik had hem net nog…','O nee, o nee.']))};
  e.clean=()=>{G.scene().remove(m,gl);G.unspot(e.spot);if(e.n){const n=e.n;n.evt=null;n.fixed=0;n.fixSt=null;n.st='walk'}};
  e.give=n=>{const g=wS(3);S.cash+=g;G.rep&&G.rep.add(n.x,n.z,8);if(typeof addXp==='function')addXp(4);G.snd&&G.snd.fx('ok');fl('+'+fmt(g)+' · respect',n.x,n.z,'#ffd35a');if(G.waypoint&&G.clearWaypoint)G.clearWaypoint();done();end()};
  return true}
/* ---------- houd de dief ---------- */
function evDief(){const p=plek(9,15);if(!p)return false;if(!G.npcA.dief)G.npcA.dief={n:'Dief',col:'#ff3d52',wallet:0,tough:3,call:0,v:[1.3,1.6],look:()=>({top:'#1d1d1f',arm:'top',pants:'#2a2c30',shoe:'#e8e4da',hat:'beanie',hatC:'#151517'}),names:['Een dief'],talk:['…']};
  const n=G.npcMake('dief',p.x,p.z);n.evt='dief';n.st='flee';n.t=0;n.from=G.P;n.flee=999;n.fleeSp=6.9;const e=EV={k:'dief',n,t:0,max:26};
  banner('Gebeurtenis','Houd de dief!','bad');G.snd&&G.snd.fx('whistle');G.bubble&&G.bubble(n,'Wegwezen!',{col:'#ff9a9a'});const w=G.NPC.find(m=>m!==n&&m.st==='walk'&&dist(m,n)<14);if(w)G.bubble&&G.bubble(w,'Houd de dief!',{col:'#ffd35a'});
  e.spot=G.spot({k:'ev',x:n.x,z:n.z,n:'',dot:'#ff3d52',dotR:120,big:1});
  e.step=dt=>{e.spot.x=n.x;e.spot.z=n.z;if(e.caught)return;if(n.st!=='flee'){end();return}if(!G.driving&&dist(n,G.P)<1.5){e.caught=1;e.max=9999;n.st='cower';n.t=-99;G.snd&&G.snd.fx('grab');G.shake&&G.shake(.5);G.hitStop=.06;G.talking=true;const g=zS(.8),r=wS(2.5);
      K.dialog({name:'De dief',role:'Gepakt',look:Object.assign({},n.look,{bg:'#2a1414'}),mood:'bang',lines:['Oké, oké! Hier, neem die tas maar. Laat me gaan!'],col:'#ff3d52',choices:[
        {t:'Buit terug naar de winkel',sub:'Beloning en respect',ic:K.ic.hand,f:()=>{K.closeDialog(true);S.cash+=r;G.rep&&G.rep.add(n.x,n.z,8);if(typeof addXp==='function')addXp(4);G.snd&&G.snd.fx('ok');fl('+'+fmt(r)+' · respect',n.x,n.z,'#ffd35a');fin()}},
        {t:'Zelf houden · '+fmt(g),ic:K.ic.money,risk:1,f:()=>{K.closeDialog(true);S.cash+=g;if(typeof addZwart==='function')addZwart(g);G.rep&&G.rep.add(n.x,n.z,-4);G.snd&&G.snd.fx('cash');fl('+'+fmt(g),n.x,n.z);fin()}}],onClose:()=>{G.talking=false;if(!e.fin)fin(1)}})}};
  const fin=q=>{if(e.fin)return;e.fin=1;if(!q)done();n.st='flee';n.t=0;n.flee=6;n.fleeSp=5;n.evt=null;end()};
  e.clean=()=>{G.unspot(e.spot);if(!e.caught)G.toast('De dief is ontkomen','info');if(n.evt){n.evt=null;n.flee=4;n.t=0}};return true}
/* ---------- gevallen lading ---------- */
function evLading(){const p=plek(55,130,[T.DOCK,T.PARK,T.SAND,T.PLAZA,T.YARD,T.WALK]);if(!p)return false;
  const m=K.model([[1.3,.9,1,0,.45,0,'#8a6a42'],[1.36,.1,1.06,0,.9,0,'#6a4a2c'],[1.36,.1,1.06,0,.2,0,'#6a4a2c'],[.12,.94,1.06,-.5,.47,0,'#6a4a2c'],[.12,.94,1.06,.5,.47,0,'#6a4a2c'],[.3,.3,.04,0,.55,.52,'#ffd35a',1]]);m.position.set(p.x,0,p.z);m.rotation.y=rr(0,3);
  const beam=new TH.Mesh(new TH.CylinderGeometry(.8,.8,50,8,1,true),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.28,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}));beam.position.set(p.x,25,p.z);G.scene().add(m,beam);
  const wk=M.districtAt(p.x,p.z),e=EV={k:'lading',x:p.x,z:p.z,t:0,max:190,m,beam};
  G.msg&&G.msg('contact','Er is een kist van een vrachtwagen gevallen in '+wk+'. Wie er het eerst bij is. Je hebt drie minuten.',{k:'route',x:p.x,z:p.z,n:'Gevallen lading'});
  e.spot=G.spot({k:'ev',x:p.x,z:p.z,r:2.4,n:'Openbreken',sub:'gevallen lading',col:'#ffd35a',h:1.9,show:()=>!e.got,act:async()=>{if(G.driving||(G.mini&&G.mini.active()))return;G.pose='zoek';const r=await G.mini.hold({label:'Kist openbreken',d:2,wait:2.5,can:()=>G.pose==='zoek'&&dist(e,G.P)<3,tick:()=>{if(Math.random()<.12)G.snd&&G.snd.fx('hit')}});if(G.pose==='zoek')G.pose=null;if(r!=='ok'||e.got)return;
      e.got=1;const g=zS(2);S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(5);if(typeof addHeat==='function')addHeat(2);let it='';if(G.zak&&G.zak().length<G.zakMax()){const q=pick([['Doos smartphones',1.2],['Rol koperdraad',.6],['Krat sterke drank',.8],['Designertassen',1]]);G.zak().push({n:q[0],v:Math.max(5,zS(q[1]))});it=' + '+q[0].toLowerCase()}
      G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.burst(e.x,1,e.z,'#ffd35a',14);fl('+'+fmt(g)+it,e.x,e.z,'#ffd35a');if(G.waypoint&&G.clearWaypoint)G.clearWaypoint();done();end()},dot:'#ffd35a',dotR:9999,big:1,map:{n:'Gevallen lading',ic:K.ic.gift,c:'#ffd35a',pri:8,big:1}});
  e.step=dt=>{beam.material.opacity=.2+Math.sin(e.t*4)*.08;if(e.t>e.max-30&&!e.warn){e.warn=1;G.toast('Nog een halve minuut voor de gevallen lading','info')}};
  e.clean=()=>{G.scene().remove(m,beam);G.unspot(e.spot);if(!e.got)G.msg&&G.msg('contact','Te laat. Iemand anders heeft de kist meegenomen.',null,true)};return true}
/* ---------- verdwaalde toerist ---------- */
const DEST=[['casino','het casino'],['bank','de bank'],['crimes','Café Het Gat'],['look','de kledingzaak'],['relax','de spa']];
function evToerist(){if(M.estateAt(G.P.x,G.P.z))return false;const p=plek(10,18);if(!p)return false;const L=DEST.map(d=>({d,pl:M.placeById(d[0])})).filter(o=>o.pl&&Math.hypot(o.pl.door.x-G.P.x,o.pl.door.z-G.P.z)>60&&Math.hypot(o.pl.door.x-G.P.x,o.pl.door.z-G.P.z)<190);if(!L.length)return false;const D=pick(L);
  const n=G.npcMake('toerist',p.x,p.z);n.evt='verdwaald';n.st='stand';n.fixed=1;n.fixSt='stand';n.home={x:n.x,z:n.z,ry:Math.atan2(G.P.x-n.x,G.P.z-n.z)};const e=EV={k:'toerist',n,t:0,max:70,D};
  G.bubble&&G.bubble(n,'Excuse me! Hallo?',{col:'#ffe0a0',life:3});
  e.spot=G.spot({k:'ev',x:n.x,z:n.z,n:'',dot:'#3ad6ff',dotR:60,big:1,dotIf:()=>!e.go});
  e.start=()=>{e.go=1;e.t=0;e.max=330;n.fixed=0;n.fixSt=null;n.st='follow';n.t=0;n.followT=99999;n.escort=1;G.setWaypoint&&G.setWaypoint(D.pl.door.x,D.pl.door.z,D.pl.name,D.pl.id)};
  e.step=dt=>{if(!e.go){if(Math.random()<dt*.18&&dist(n,G.P)<14)G.bubble&&G.bubble(n,pick(['Hello? Can you help me?','Ik ben verdwaald…','Excuse me!']),{col:'#ffe0a0'});return}
    if(n.st!=='follow'){end();return}if(dist(n,G.P)>32){G.bubble&&G.bubble(n,'Wait! Niet zo snel!');if(dist(n,G.P)>60){G.toast('Je bent de toerist kwijt','bad');end();return}}
    if(Math.hypot(n.x-D.pl.door.x,n.z-D.pl.door.z)<8&&dist(n,G.P)<9){const g=wS(4);S.cash+=g;G.rep&&G.rep.add(n.x,n.z,5);if(typeof addXp==='function')addXp(4);G.snd&&G.snd.fx('ok');fl('Fooi +'+fmt(g),n.x,n.z,'#ffd35a');G.bubble&&G.bubble(n,'Thank you so much!',{col:'#c8ffd8'});e.ok=1;if(G.waypoint&&G.clearWaypoint)G.clearWaypoint();done();end()}};
  e.clean=()=>{G.unspot(e.spot);n.evt=null;n.escort=0;n.fixed=0;n.fixSt=null;if(e.ok){n.st='wave';n.t=0;n.dur=2;n.back='walk'}else if(n.st!=='walk'){n.st='walk';n.t=0}};return true}
/* ---------- gesprekken bij een gebeurtenis ---------- */
const o0=G.npcOpen;G.npcOpen=function(n){if(n.evt==='eigenaar')return 'Heb jij een portemonnee gezien? Bruin leer. Alles zit erin!';if(n.evt==='verdwaald'&&EV&&EV.n===n)return EV.go?'Is het nog ver?':'Excuse me… ik zoek '+EV.D.d[1]+'. Ik loop al een uur rondjes. Kun je me helpen?';return o0?o0(n):''};
const x0=G.npcExtra;G.npcExtra=function(n,ch,main){if(x0)x0(n,ch,main);if(!EV)return;
  if(n.evt==='eigenaar'&&EV.n===n)ch.unshift({t:'Portemonnee teruggeven',ic:K.ic.hand,f:()=>{const e=EV;K.say('Je bent een engel! Hier, voor de moeite.','blij',[]);setTimeout(()=>{K.closeDialog(true);e.give(n);n.st='wave';n.t=0;n.dur=2;n.back='walk'},1200)}});
  if(n.evt==='verdwaald'&&EV.n===n&&!EV.go)ch.unshift({t:'Loop maar mee',sub:'Naar '+EV.D.d[1],ic:K.ic.walk,f:()=>{const e=EV;K.say('Oh, thank you! Ik loop achter je aan.','blij',[]);setTimeout(()=>{K.closeDialog(true);e.start()},1100)}})};
G.hondDoel=()=>EV&&EV.k==='wallet'&&!EV.got?{x:EV.x,z:EV.z}:EV&&EV.k==='lading'&&!EV.got?{x:EV.x,z:EV.z}:null;
/* ---------- elke frame ---------- */
const TYPES=[[evWallet,3],[evDief,2],[evLading,2],[evToerist,2]];
function roll(){const tot=TYPES.reduce((a,t)=>a+t[1],0);let x=Math.random()*tot;for(const t of TYPES){x-=t[1];if(x<=0)return t[0]}return evWallet}
function step(dt){if(EV){EV.t+=dt;if(!free()&&EV.k!=='lading'&&!(EV.k==='wallet')){end();return}try{EV.step&&EV.step(dt)}catch(e){console.error(e);end();return}if(EV&&EV.t>EV.max)end();return}
  if(!free()||G.talking||G.driving)return;next-=dt;if(next>0)return;next=20;try{if(roll()())next=0}catch(e){console.error(e)}}
G.events={cur:()=>EV,force:k=>{end();const f={wallet:evWallet,dief:evDief,lading:evLading,toerist:evToerist}[k];return f?f():false},end};
const wait=setInterval(()=>{if(!G.ready||!G.spot||!G.npcMake)return;clearInterval(wait);const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},300);
})();
