// Tab: Huurmoorden — contracten vanaf Huurmoordenaar. Een richt-minigame met een scherpschuttersvizier:
// je vizier volgt de muis (op de telefoon: slepen) en zwiept een beetje heen en weer. Houd je adem in voor een rustig vizier
// en schiet met een klik (of de knop Vuur). Hoofd = perfect, romp = gelukt. Mis je, dan wordt het doelwit gewaarschuwd en rent hij weg.
// Raak je een omstander of is je laatste kogel mis, dan komt de politie. Verversen tijdens een contract telt als mislukt.
const HIT_RANK=7;
const HITS=[
 {id:'verklikker',d:1,r:7,n:'De verklikker',t:'Ronnie "Het Lek" de Wit',w:'Parkeerplaats achter een snackbar in Osdorp',desc:'Hij praat al maanden met de recherche. Vanavond haalt hij zijn laatste patatje.',pay:[20000,36000],xp:320,cr:14,en:34,cd:8},
 {id:'schuld',d:2,r:7,n:'De wanbetaler',t:'Gerrit Kramer',w:'Station Sloterdijk, perron 3',desc:'Een half miljoen schuld en een treinkaartje naar Brussel. Die trein haalt hij niet.',pay:[32000,56000],xp:450,cr:18,en:37,cd:10},
 {id:'rivaal',d:3,r:8,n:'De rivaal',t:'Sal "Het Mes" Moretti',w:'Terras aan de Amstel',desc:'Capo van de concurrent. Elke dinsdag op hetzelfde terras, nooit zonder publiek.',pay:[55000,95000],xp:640,cr:24,en:41,cd:12},
 {id:'wethouder',d:4,r:9,n:'De wethouder',t:'Wethouder Van Dijk',w:'Bordes van het stadhuis',desc:'Hij nam geld aan van iedereen en wil nu praten. Achter elke auto staat een camera.',pay:[95000,170000],xp:900,cr:32,en:45,cd:15},
 {id:'getuige',d:5,r:10,n:'De kroongetuige',t:'"Getuige 17"',w:'Boulevard bij het safehouse in Scheveningen',desc:'Morgen getuigt hij tegen de halve onderwereld. Eén wandeling per dag, altijd tussen mensen.',pay:[170000,310000],xp:1300,cr:42,en:50,cd:18},
 {id:'peetvader',d:6,r:11,n:'De oude peetvader',t:'Don Aurelio Basile',w:'Kerkplein na de zondagsmis',desc:'De laatste die nog boven jou staat. Lijfwachten, kerkgangers en maar één kans.',pay:[300000,550000],xp:1900,cr:56,en:56,cd:22}];
const HIT_COLS=['#5b6b7c','#3f5a46','#6b5a44','#4a4f6b','#6b4a5a','#556070'];
const hitWeapon=()=>{const g=gearBest('wapen');return g?GEAR.filter(x=>x.cat==='wapen').indexOf(g):-1};
const HIT_GUN=4; // Scherpschuttersgeweer of beter
// hoe rustig je vizier is: training Schieten, beter wapen, lidmaatschap en het voordeel van Het Schaduwcontract
const hitSteady=()=>{const sk_=Math.min(.4,sk('schiet')*.008),wp=hitWeapon()>HIT_GUN?.1:0,tr=tierK()*.5,fp=famPerk('hit');
 return {sk:sk_,wp,tr,fp,k:(1-sk_)*(1-wp)*(1-tr)*(1-fp)}};
const hitParams=H=>{const d=H.d;return {speed:24+d*9,size:1.12-d*.07,sway:8+d*4.4,time:Math.round((32-d*2.6)*(1+tierK())),bullets:d<=2?2:1,civ:[0,1,2,2,3,4][d-1],cover:d>=3,guards:d>=6?2:d>=5?1:0}};
const hitPay=H=>{const k=lootMult()*(1+famPerk('hit'));return [H.pay[0]*k,H.pay[1]*k]};
const hitCd=H=>H.cd*60000*waitK();
const hitJail=H=>180+H.d*70;

V.hits=()=>{const ri=rankIdx(S.xp),st=hitSteady(),done=(S.stats&&S.stats.hits)||0,left=cdLeft('hit'),gunOk=hitWeapon()>=HIT_GUN;
 const pct=v=>Math.round(v*100)+'%';
 if(ri<HIT_RANK)return `<h1>Huurmoorden</h1>
  <section class="card ht-lock"><div class="ht-scope-ic">${hitScopeSvg()}</div><div><span class="label">Nog op slot</span><h2>Vanaf ${RANKS[HIT_RANK][0]}</h2>
  <p>Contracten op mensen die iemand liever kwijt is. Je richt zelf door een scherpschuttersvizier: raak je, dan verdien je veel geld, straatcredit en XP. De zwaarste families nemen alleen huurmoordenaars aan.</p>
  <div class="bar"><i style="width:${Math.min(100,S.xp/RANKS[HIT_RANK][1]*100)}%;background:var(--red)"></i></div><small>${Math.floor(S.xp).toLocaleString('nl-NL')} / ${RANKS[HIT_RANK][1].toLocaleString('nl-NL')} XP</small></div></section>`;
 const card=H=>{const P=hitParams(H),lock=ri<H.r,[a,b]=hitPay(H),tired=S.energy<H.en,can=!lock&&!left&&!tired&&!inJail()&&gunOk;
  const label=lock?'Vanaf '+RANKS[H.r][0]:inJail()?'Je zit vast':!gunOk?'Eerst een scherpschuttersgeweer':left?'Nog '+fmtClock(left):tired?'Te moe · '+H.en+' energie':'Contract aannemen';
  return `<article class="ht-card ${lock?'locked':''}">
   <header><div class="ht-d" title="Moeilijkheid ${H.d} van 6">${[1,2,3,4,5,6].map(i=>`<i class="${i<=H.d?'on':''}"></i>`).join('')}</div><span class="label">${esc(H.w)}</span></header>
   <h3>${esc(H.n)}</h3><b class="ht-t">Doelwit: ${esc(H.t)}</b><p>${esc(H.desc)}</p>
   <div class="ht-s"><div><span>Beloning</span><b class="g">${fmtK(a)} – ${fmtK(b)}</b></div><div><span>Erbij</span><b>+${H.xp} XP</b><small>+${Math.round(H.cr*credMult('netjes'))} cred (hoofdschot ${Math.round(H.cr*credMult('perfect'))})</small></div>
    <div><span>Tijd en kogels</span><b>${P.time} s · ${P.bullets} ${P.bullets>1?'kogels':'kogel'}</b><small>${P.civ?P.civ+' omstander'+(P.civ>1?'s':''):'geen omstanders'}${P.cover?' · dekking':''}${P.guards?' · '+P.guards+' lijfwacht'+(P.guards>1?'en':''):''}</small></div>
    <div><span>Energie · wachttijd</span><b>${H.en} · ${Math.round(hitCd(H)/60000)} min</b><small>mislukt: ${fmtTime(jailSec(hitJail(H)))} cel</small></div></div>
   <button class="btn ${can?'red':''}" onclick="hitStart('${H.id}')" ${can?'':'disabled'}>${label}</button></article>`};
 return `<h1>Huurmoorden</h1>
 <section class="card hud ht-hero">
  <div class="ht-h-k"><span class="label">Geslaagde huurmoorden</span><b style="color:var(--red)">${done}</b><em>${S.stats&&S.stats.hitsPerfect?S.stats.hitsPerfect+' met een hoofdschot':'Nog geen hoofdschot'}</em></div>
  <div class="ht-h-k"><span class="label">Rustig vizier</span><b style="color:var(--ice)">−${pct(1-st.k)}</b><em>Schieten ${pct(st.sk)}${st.wp?' · wapen 10%':''}${st.tr?` · ${lidName()} ${pct(st.tr)}`:''}${st.fp?` · familie ${pct(st.fp)}`:''}</em></div>
  <div class="ht-h-k"><span class="label">Wapen</span><b class="${gunOk?'up':'dn'}">${gunOk?esc(gearBest('wapen').n):'Geen geweer'}</b><em>${gunOk?'Klaar voor een contract':'<a href="#shop">Koop een scherpschuttersgeweer</a>'}</em></div>
  <div class="ht-h-k"><span class="label">Volgende contract</span><b>${left?fmtClock(left):'Nu'}</b><em>${Math.floor(S.energy)}/${EN_MAX} energie${tierK()?` · ${lidName()}: ${Math.round(tierK()*100)}% meer tijd`:''}</em></div>
 </section>
 <div class="ht-how"><span class="label">Zo werkt het</span><p><b>Richten</b> met je muis, op de telefoon <b>slepen</b> over het beeld. Je vizier beweegt een beetje mee met je ademhaling: houd <b>spatie</b> of <b>Adem</b> ingedrukt voor een paar seconden rust. <b>Klik</b> of tik op <b>Vuur</b> om te schieten. Hoofd = perfect (meer geld en cred), romp = gelukt. Mis je, dan rent het doelwit weg. Raak je een omstander of mis je je laatste kogel, dan komt de politie.</p></div>
 <div class="ht-grid">${HITS.map(card).join('')}</div>`};

function hitScopeSvg(){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="3"/><path d="M24 2v12M24 34v12M2 24h12M34 24h12"/></svg>'}

// ---------- het spel ----------
function hitStart(id){const H=HITS.find(h=>h.id===id);if(!H||window.__hitG)return;
 if(rankIdx(S.xp)<H.r||cdLeft('hit')||S.energy<H.en||inJail()||hitWeapon()<HIT_GUN)return;
 S.energy-=H.en;S.cd.hit=now()+hitCd(H);S.pendingHit={id:H.id,at:now()};save();pushState();
 hitGame(H).then(res=>hitEnd(H,res))}

function hitEnd(H,res){S.pendingHit=null;S.stats.hitTries=(S.stats.hitTries||0)+1;
 if(res.ok){const [a,b]=hitPay(H),perfect=res.zone==='head',pay=Math.round(rnd(a,b)*(perfect?1.25:1)),cr=credGain(H.cr,perfect?'perfect':'netjes');
  S.cash+=pay;S.cred+=cr;S.stats.hits=(S.stats.hits||0)+1;if(perfect)S.stats.hitsPerfect=(S.stats.hitsPerfect||0)+1;addHeat(8+H.d*3);addXp(Math.round(H.xp*(perfect?1.2:1)));
  if(typeof famEv==='function')famEv('crime',{r:H.r,g:pay,cr});
  log(`Huurmoord: ${H.t} uitgeschakeld${perfect?' met een hoofdschot':''} (+${fmt(pay)}, +${cr} cred)`,'ok');save();pushState();render();
  toast(`${perfect?'Hoofdschot! ':''}${H.t} is uitgeschakeld: +${fmt(pay)} · +${cr} cred`,'lvl');return}
 if(res.why==='escaped'||res.why==='quit'){addHeat(12);log(`Huurmoord mislukt: ${H.t} is ontkomen`,'bad');save();pushState();render();toast(res.why==='quit'?'Contract afgebroken. Het doelwit is gewaarschuwd.':'Het doelwit is ontkomen.','bad');return}
 const civ=res.why==='civilian';addHeat(civ?35:18);log(civ?`Huurmoord mislukt: een omstander geraakt`:`Huurmoord mislukt: ${H.t} gemist`,'bad');save();
 arrest(hitJail(H)*(civ?1.3:1),civ?'Een omstander geraakt!':'Gemist!',civ?'Je raakte iemand die er niets mee te maken had. Binnen een minuut staat de straat vol politie.':`${H.t} rent weg en iemand heeft je raam gezien. De politie is onderweg.`,{flee:Math.min(5,H.d+(civ?1:0))})}

function hitGame(H){return new Promise(resolve=>{
 const P=hitParams(H),ST=hitSteady(),W=1000,GH=600,seed=Math.floor(Math.random()*1e9);let rs=seed;const R=()=>(rs=(rs*1664525+1013904223)%4294967296)/4294967296;
 window.__hitG=true;window.__chase=true;
 const L=document.createElement('div');L.id='hitLayer';L.innerHTML=`<div class="hg">
  <div class="hg-top"><div><span class="label">${esc(H.n)} · ${esc(H.w)}</span><b>Doelwit: ${esc(H.t)} <i class="hg-tag">rode jas</i></b></div>
   <div class="hg-k"><span>Tijd</span><b id="hgT">${P.time}</b></div><div class="hg-k"><span>Kogels</span><b id="hgB">${'●'.repeat(P.bullets)}</b></div>
   <div class="hg-k hg-br"><span>Adem</span><i><i id="hgA"></i></i></div><button class="btn ghost sm" id="hgQ">Opgeven</button></div>
  <div class="hg-stage" id="hgS"><canvas id="hgC"></canvas><div class="hg-msg" id="hgM"></div>
   <div class="hg-pad"><button class="hg-breath" id="hgBr">Adem<br><small>ingedrukt houden</small></button><button class="hg-fire" id="hgF">Vuur</button></div></div>
  <p class="hg-help" id="hgH">Zoek de man in de <b>rode jas</b>. Richt met je muis, houd <b>spatie</b> ingedrukt voor een rustig vizier en <b>klik</b> om te schieten.</p></div>`;
 document.body.appendChild(L);document.body.classList.add('hg-open');
 const cv=L.querySelector('#hgC'),cx=cv.getContext('2d'),stage=L.querySelector('#hgS'),touch=matchMedia('(pointer:coarse)').matches;
 if(touch)L.querySelector('#hgH').innerHTML='Zoek de man in de <b>rode jas</b>. <b>Sleep</b> over het beeld om te richten, houd <b>Adem</b> ingedrukt voor rust en tik op <b>Vuur</b>.';
 // achtergrond: gevels met ramen, lantaarns, stoep (één keer tekenen)
 const bg=document.createElement('canvas');bg.width=W*2;bg.height=GH*2;const b=bg.getContext('2d');b.scale(2,2);
 const sky=b.createLinearGradient(0,0,0,430);sky.addColorStop(0,'#05070c');sky.addColorStop(1,'#131a26');b.fillStyle=sky;b.fillRect(0,0,W,430);
 for(let i=0;i<60;i++){b.fillStyle=`rgba(255,255,255,${.2+R()*.5})`;b.fillRect(R()*W,R()*180,1.2,1.2)}
 let x=-10;while(x<W){const bw=70+R()*120,bh=170+R()*220,top=430-bh;b.fillStyle=['#0d1119','#10151f','#0b0e15','#121825'][Math.floor(R()*4)];b.fillRect(x,top,bw,bh);
  b.fillStyle='rgba(0,0,0,.35)';b.fillRect(x+bw-6,top,6,bh);
  for(let wy=top+16;wy<410;wy+=26)for(let wx=x+10;wx<x+bw-16;wx+=20){const on=R()<.32;b.fillStyle=on?`rgba(255,${180+Math.floor(R()*50)},${90+Math.floor(R()*60)},${.55+R()*.4})`:'rgba(40,52,70,.5)';b.fillRect(wx,wy,10,14)}
  x+=bw+R()*8}
 const road=b.createLinearGradient(0,430,0,GH);road.addColorStop(0,'#1a1d23');road.addColorStop(.35,'#15171c');road.addColorStop(1,'#0c0d10');b.fillStyle=road;b.fillRect(0,430,W,GH-430);
 b.fillStyle='#2a2d34';b.fillRect(0,428,W,4);b.fillStyle='#22252b';b.fillRect(0,538,W,3);
 for(let i=0;i<W;i+=60){b.fillStyle='rgba(255,255,255,.035)';b.fillRect(i,432,1,106)}
 const lamps=[];for(let lx=90;lx<W;lx+=230+R()*60)lamps.push(lx);
 lamps.forEach(lx=>{b.fillStyle='#2b2f36';b.fillRect(lx-2,300,4,130);b.fillRect(lx-2,300,22,4);const g=b.createRadialGradient(lx+18,306,2,lx+18,420,150);g.addColorStop(0,'rgba(255,170,80,.42)');g.addColorStop(1,'rgba(255,170,80,0)');b.fillStyle=g;b.beginPath();b.moveTo(lx+12,306);b.lineTo(lx-80,540);b.lineTo(lx+120,540);b.closePath();b.fill();b.fillStyle='#ffd39a';b.fillRect(lx+14,304,8,4)});
 // dekking: geparkeerde auto's en een kiosk (staan vóór de mensen)
 const covers=[];if(P.cover){const n=2+(H.d>=5?1:0);for(let i=0;i<n;i++){const cxp=150+i*(700/n)+R()*120;covers.push({x:cxp,w:120,y:470,h:58,k:'car',c:['#2c3440','#3a2f2f','#2f3a33','#1f2430'][i%4]})}
  if(H.d>=4)covers.push({x:560+R()*200,w:46,y:400,h:128,k:'kiosk',c:'#232833'})}
 // mensen: het doelwit (rode jas), omstanders en lijfwachten
 const lane=()=>520+R()*12;
 const mk=(kind,i)=>({kind,x:kind==='target'?(R()<.5?120:880):80+R()*840,y:lane(),sc:.95+R()*.12,v:P.speed*(kind==='target'?1:.8+R()*.5),dir:R()<.5?-1:1,mode:'walk',tx:80+R()*840,tm:0,ph:R()*6,col:kind==='guard'?'#15171c':HIT_COLS[i%HIT_COLS.length],alarm:false,gone:false});
 const people=[mk('target',0)];for(let i=0;i<P.civ;i++)people.push(mk('civ',i+1));for(let i=0;i<P.guards;i++)people.push(mk('guard',i));
 const T=people[0];
 // vizier
 const aim={x:500,y:420},sway={ph:[R()*6,R()*6,R()*6,R()*6]};let breath=1,holding=false,winded=0,recoil=0,flash=0,bullets=P.bullets,tLeft=P.time,over=false,result=null,last=performance.now(),t0=last,shots=[];
 let cw=0,ch=0,s=1,camX=0,viewW=W,dpr=1;
 function size(){const r=stage.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);cw=r.width;ch=r.height;cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+'px';cv.style.height=ch+'px';s=ch/GH;viewW=Math.min(W,cw/s);if(cw/s>W){s=cw/W;viewW=W}}
 size();const ro=new ResizeObserver(size);ro.observe(stage);
 try{if(localStorage.getItem('ow_debug')==='1')window.__hitDbg={T,people,aim,covers,get s(){return s},get camX(){return camX},get swayK(){return swayK()}}}catch(e){}
 const cam=()=>{camX=Math.max(0,Math.min(W-viewW,aim.x-viewW/2))};
 const swayK=()=>P.sway*ST.k*(holding&&breath>0?.16:winded>0?1.45:1);
 const shotPt=t=>{const A=swayK(),u=t/1000,p=sway.ph;return {x:aim.x+A*(.62*Math.sin(u*1.15+p[0])+.38*Math.sin(u*2.45+p[1])),y:aim.y+A*.8*(.6*Math.sin(u*1.42+p[2])+.4*Math.sin(u*3.05+p[3]))-recoil}};
 // invoer
 let drag=null;
 const toWorld=(px,py)=>({x:camX+px/s,y:py/s});
 cv.addEventListener('pointermove',e=>{if(over)return;const r=cv.getBoundingClientRect();if(e.pointerType==='mouse'){const w=toWorld(e.clientX-r.left,e.clientY-r.top);aim.x=w.x;aim.y=w.y}
  else if(drag){const k=1.05/s;aim.x=Math.max(0,Math.min(W,aim.x+(e.clientX-drag.x)*k));aim.y=Math.max(60,Math.min(GH-10,aim.y+(e.clientY-drag.y)*k));drag={x:e.clientX,y:e.clientY}}});
 cv.addEventListener('pointerdown',e=>{if(over)return;if(e.pointerType==='mouse'){if(e.button===0)fire()}else{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId)}});
 cv.addEventListener('pointerup',()=>{drag=null});cv.addEventListener('pointercancel',()=>{drag=null});
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 const bBtn=L.querySelector('#hgBr'),fBtn=L.querySelector('#hgF');
 const hold=v=>{holding=v&&breath>0&&!winded;bBtn.classList.toggle('on',holding)};
 bBtn.addEventListener('pointerdown',e=>{e.preventDefault();hold(true)});['pointerup','pointerleave','pointercancel'].forEach(ev=>bBtn.addEventListener(ev,()=>hold(false)));
 fBtn.addEventListener('pointerdown',e=>{e.preventDefault();fire()});
 const kd=e=>{if(over)return;if(e.code==='Space'||e.key==='Shift'){e.preventDefault();if(!e.repeat)hold(true)}if(e.key==='Enter'||e.key==='f'){e.preventDefault();fire()}if(e.key==='Escape')finish({ok:false,why:'quit'})};
 const ku=e=>{if(e.code==='Space'||e.key==='Shift')hold(false)};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 L.querySelector('#hgQ').onclick=()=>finish({ok:false,why:'quit'});
 // treffer bepalen: eerst dekking, dan wie het dichtst bij staat
 const zones=p=>{const h=p.sc,fy=p.y;return {head:{x:p.x,y:fy-101*h,r:9.5*h},body:{x:p.x-14*h,y:fy-90*h,w:28*h,h:50*h},legs:{x:p.x-12*h,y:fy-40*h,w:24*h,h:40*h}}};
 function hitTest(q){for(const c of covers)if(q.x>=c.x&&q.x<=c.x+c.w&&q.y>=c.y&&q.y<=c.y+c.h)return {who:null,zone:'cover'};
  const order=people.filter(p=>!p.gone).sort((a,b)=>b.y-a.y);
  for(const p of order){const z=zones(p);if(Math.hypot(q.x-z.head.x,q.y-z.head.y)<=z.head.r)return {who:p,zone:'head'};
   if(q.x>=z.body.x&&q.x<=z.body.x+z.body.w&&q.y>=z.body.y&&q.y<=z.body.y+z.body.h)return {who:p,zone:'body'};
   if(q.x>=z.legs.x&&q.x<=z.legs.x+z.legs.w&&q.y>=z.legs.y&&q.y<=z.legs.y+z.legs.h)return {who:p,zone:'legs'}}
  return {who:null,zone:'miss'}}
 function msg(t,cls){const m=L.querySelector('#hgM');m.className='hg-msg on '+(cls||'');m.innerHTML=t;clearTimeout(msg.t);msg.t=setTimeout(()=>{if(!over)m.className='hg-msg'},1200)}
 function fire(){if(over||bullets<=0||recoil>4)return;const q=shotPt(performance.now()-t0);bullets--;recoil=26;flash=1;shots.push({x:q.x,y:q.y,t:performance.now()});
  try{SFX.shot()}catch(e){}if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
  L.querySelector('#hgB').textContent='●'.repeat(bullets)+'○'.repeat(P.bullets-bullets);
  const h=hitTest(q);
  if(h.who&&h.who!==T&&(h.zone!=='legs'||h.who.kind==='civ')){h.who.down=performance.now();return finish({ok:false,why:'civilian'},'Je raakt een '+(h.who.kind==='guard'?'lijfwacht':'omstander')+'!')}
  if(h.who===T&&h.zone!=='legs'){T.down=performance.now();return finish({ok:true,zone:h.zone},h.zone==='head'?'Hoofdschot':'Raak')}
  // mis (of alleen in de benen): doelwit gewaarschuwd, iedereen rent
  people.forEach(p=>{p.alarm=true;p.mode='flee';p.dir=p.x<500?-1:1;p.v=p.kind==='target'?P.speed*2.5:P.speed*1.8});
  if(bullets<=0)return finish({ok:false,why:'missed'},h.zone==='legs'?'Alleen in zijn been':h.zone==='cover'?'Je raakt de dekking':'Mis');
  msg(h.zone==='legs'?'In zijn been. Hij rent!':h.zone==='cover'?'Je raakt de dekking. Hij rent!':'Mis! Hij rent weg.','bad')}
 function finish(res,text){if(over)return;over=true;result=res;hold(false);
  msg(res.ok?`<b>${text||'Raak'}</b><span>${esc(H.t)} is uitgeschakeld</span>`:`<b>${text||(res.why==='escaped'?'Ontkomen':'Afgebroken')}</b><span>${res.why==='escaped'?'Het doelwit is weg':res.why==='quit'?'Contract afgebroken':res.why==='civilian'?'De politie komt eraan':'Het doelwit is gewaarschuwd'}</span>`,res.ok?'ok':'bad');
  setTimeout(close,res.ok?1500:1300)}
 function close(){cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);L.remove();document.body.classList.remove('hg-open');window.__hitG=false;window.__chase=false;resolve(result)}
 // beweging
 function step(dt){people.forEach(p=>{if(p.gone||p.down)return;p.ph+=dt*p.v/9;
   if(p.mode==='flee'){p.x+=p.dir*p.v*dt;if(p.x<-40||p.x>W+40){p.gone=true;if(p===T&&!over)finish({ok:false,why:'escaped'},'Ontkomen')}return}
   if(p.mode==='pause'){p.tm-=dt;if(p.tm<=0){p.mode='walk';p.tx=60+R()*880}return}
   const dx=p.tx-p.x;p.dir=dx<0?-1:1;p.x+=p.dir*Math.min(Math.abs(dx),p.v*dt);
   if(Math.abs(dx)<2){p.mode='pause';p.tm=(p.kind==='target'?.7:.4)+R()*(p.kind==='target'?2.2-H.d*.25:2)}});
  if(holding){breath=Math.max(0,breath-dt/3.2);if(breath<=0){hold(false);winded=1.6}}else breath=Math.min(1,breath+dt/(winded>0?4:2.4));
  if(winded>0)winded=Math.max(0,winded-dt);recoil=Math.max(0,recoil-dt*60);flash=Math.max(0,flash-dt*6);
  if(!over){tLeft-=dt;if(tLeft<=0){tLeft=0;people.forEach(p=>{p.mode='flee';p.dir=p.x<500?-1:1;p.v*=1.6});finish({ok:false,why:'escaped'},'Te laat')}}}
 // tekenen
 function person(c,p,now){if(p.gone)return;const h=p.sc,fy=p.y,down=p.down?Math.min(1,(now-p.down)/350):0;
  c.save();c.translate(p.x,fy);if(down){c.rotate(down*1.35*(p.dir||1));c.globalAlpha=1-down*.25}
  const sw=p.mode==='pause'?0:Math.sin(p.ph)*8*h;
  c.strokeStyle='#0a0b0e';c.lineWidth=7*h;c.lineCap='round';c.beginPath();c.moveTo(-4*h,-42*h);c.lineTo(-4*h+sw,0);c.moveTo(4*h,-42*h);c.lineTo(4*h-sw,0);c.stroke();
  const coat=p.kind==='target'?'#c62f3a':p.col;c.fillStyle=coat;c.beginPath();c.roundRect(-14*h,-92*h,28*h,54*h,7*h);c.fill();
  c.strokeStyle=coat;c.lineWidth=6*h;c.beginPath();c.moveTo(-12*h,-84*h);c.lineTo(-15*h-sw*.4,-52*h);c.moveTo(12*h,-84*h);c.lineTo(15*h+sw*.4,-52*h);c.stroke();
  c.fillStyle='#d9b38c';c.beginPath();c.arc(0,-101*h,9.5*h,0,Math.PI*2);c.fill();
  if(p.kind==='target'){c.fillStyle='#16090b';c.fillRect(-11*h,-113*h,22*h,5*h);c.fillRect(-7*h,-121*h,14*h,9*h)}
  if(p.kind==='guard'){c.fillStyle='#050608';c.fillRect(-8*h,-104*h,16*h,4*h)}
  if(p.mode==='pause'&&p.kind==='target'&&!p.alarm){c.fillStyle='#9bd1ff';c.fillRect(7*h,-104*h,4*h,8*h)}
  c.restore()}
 function car(c,o){c.fillStyle=o.c;c.beginPath();c.roundRect(o.x,o.y+14,o.w,o.h-22,8);c.fill();c.beginPath();c.roundRect(o.x+22,o.y,o.w-46,24,8);c.fill();
  c.fillStyle='rgba(150,190,230,.18)';c.fillRect(o.x+28,o.y+5,o.w-58,14);c.fillStyle='#08090b';c.beginPath();c.arc(o.x+24,o.y+o.h-6,10,0,7);c.arc(o.x+o.w-24,o.y+o.h-6,10,0,7);c.fill();
  c.fillStyle='rgba(255,200,120,.6)';c.fillRect(o.x+o.w-6,o.y+22,5,6)}
 function kiosk(c,o){c.fillStyle=o.c;c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle='#ff7a1a';c.fillRect(o.x,o.y,o.w,10);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(o.x+6,o.y+18,o.w-12,40)}
 function world(c,now){c.drawImage(bg,0,0,W,GH);people.slice().sort((a,b)=>a.y-b.y).forEach(p=>person(c,p,now));covers.forEach(o=>o.k==='car'?car(c,o):kiosk(c,o));
  shots.forEach(q=>{const a=Math.max(0,1-(now-q.t)/1400);if(a>0){c.fillStyle=`rgba(255,230,180,${a})`;c.beginPath();c.arc(q.x,q.y,2.4,0,7);c.fill()}})}
 let raf=0;
 function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);cam();
  const q=shotPt(now-t0);
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,cw,ch);
  // breed beeld (gedimd)
  cx.save();cx.scale(s,s);cx.translate(-camX,0);world(cx,now);cx.restore();
  cx.fillStyle='rgba(3,4,6,.55)';cx.fillRect(0,0,cw,ch);
  // vizier: ingezoomd beeld in een cirkel
  const Z=2.6,Rr=Math.min(cw,ch)*(cw<600?.36:.3),sx=(q.x-camX)*s,sy=q.y*s;
  cx.save();cx.beginPath();cx.arc(sx,sy,Rr,0,Math.PI*2);cx.clip();cx.translate(sx,sy);cx.scale(s*Z,s*Z);cx.translate(-q.x,-q.y);world(cx,now);cx.restore();
  const vg=cx.createRadialGradient(sx,sy,Rr*.55,sx,sy,Rr);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');cx.fillStyle=vg;cx.beginPath();cx.arc(sx,sy,Rr,0,7);cx.fill();
  cx.strokeStyle='rgba(0,0,0,.9)';cx.lineWidth=Math.max(6,Rr*.07);cx.beginPath();cx.arc(sx,sy,Rr,0,7);cx.stroke();
  cx.strokeStyle='rgba(255,61,82,.85)';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(sx-Rr,sy);cx.lineTo(sx-6,sy);cx.moveTo(sx+6,sy);cx.lineTo(sx+Rr,sy);cx.moveTo(sx,sy-Rr);cx.lineTo(sx,sy-6);cx.moveTo(sx,sy+6);cx.lineTo(sx,sy+Rr);cx.stroke();
  cx.lineWidth=3;cx.strokeStyle='rgba(0,0,0,.8)';[[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b2])=>{cx.beginPath();cx.moveTo(sx+a*Rr*.62,sy+b2*Rr*.62);cx.lineTo(sx+a*Rr,sy+b2*Rr);cx.stroke()});
  cx.fillStyle='rgba(255,61,82,.95)';cx.beginPath();cx.arc(sx,sy,1.8,0,7);cx.fill();
  if(flash>0){cx.fillStyle=`rgba(255,220,160,${flash*.35})`;cx.fillRect(0,0,cw,ch)}
  // doelwit buiten beeld: pijltje
  if(!T.gone&&(T.x<camX||T.x>camX+viewW)){const left=T.x<camX;cx.fillStyle='#ff3d52';cx.beginPath();const ay=T.y*s-60*s;if(left){cx.moveTo(10,ay);cx.lineTo(24,ay-10);cx.lineTo(24,ay+10)}else{cx.moveTo(cw-10,ay);cx.lineTo(cw-24,ay-10);cx.lineTo(cw-24,ay+10)}cx.fill()}
  L.querySelector('#hgT').textContent=Math.ceil(tLeft);L.querySelector('#hgT').classList.toggle('dn',tLeft<6);
  const A=L.querySelector('#hgA');A.style.width=(breath*100)+'%';A.classList.toggle('low',winded>0);
  raf=requestAnimationFrame(frame)}
 raf=requestAnimationFrame(frame)})}
