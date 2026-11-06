// Slotenkraken en ademhaling: twee kleine spellen die in een klus kunnen opduiken (een slot op de deur) en die je ook
// kunt trainen (Slotenkraken, Ademhaling) of oefenen zonder gevolgen.
//  Slot: een naald zwaait over een balk; druk (spatie, klik of tik) als hij in het groene stuk staat, dan zit een pin.
//        Mis je, dan loopt je paniek op en bij twee missers op rij springt een pin terug. De paniek loopt ook vanzelf op.
//        Is hij vol, dan moet je eerst je ademhaling onder controle krijgen (zie onder). Tijd op = iemand komt eraan.
//  Ademhaling: een cirkel zwelt en krimpt. Tik als hij het grootst is. Drie (of vier) keer goed op rij = rustig; drie
//        keer mis = je raakt in paniek (bij een slot: betrapt; bij training: mislukt). Werkt met tikken, dus ook op telefoon.
// De moeilijkheid komt uit lockParams() in state.js: je skills Slotenkraken en Ademhaling, je kalmte en de rang van de klus.
// lockGame(P,opts) en breathGame(P,opts) geven een Promise met true (gelukt) of false (mislukt).
const LK_SND=()=>{try{return SFX}catch(e){return {}}};
const lkSnd=k=>{try{const s=LK_SND();if(s&&s[k])s[k]()}catch(e){}};
function lkOverlay(title,lv,sub){const ov=document.createElement('div');ov.className='chase-ov jb-ov lk-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','lkT');
 ov.innerHTML=`<div class="jb-box lk-box lv${lv}"><div class="jb-top"><div class="jb-tt"><h2><span id="lkT">${title}</span><span class="jb-lv lv${lv}" id="lkLv">${sub||''}</span></h2><p id="lkSub"></p></div>
  <div class="lk-meters"><div class="lk-m"><span class="label">Paniek</span><div class="lk-bar"><i id="lkPanic"></i></div></div><div class="lk-m lk-m-t"><span class="label">Tijd</span><div class="lk-bar t"><i id="lkTime"></i></div></div></div></div>
  <div class="jb-stage lk-stage" id="lkStage"></div><div class="jb-help" id="lkHelp"></div><div class="jb-ctl" id="lkCtl"></div></div>`;
 document.body.appendChild(ov);return ov}
const lkReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const lkLvOf=d=>Math.min(5,1+Math.floor(d*4.99));

// ---------- het slot ----------
function lockGame(P,opts){opts=opts||{};return new Promise(resolve=>{
 window.__chase=true;const ov=lkOverlay(opts.title||'Een slot',lkLvOf(P.d),P.label),stage=ov.querySelector('#lkStage'),help=ov.querySelector('#lkHelp'),ctl=ov.querySelector('#lkCtl'),sub=ov.querySelector('#lkSub');
 const pan=ov.querySelector('#lkPanic'),tim=ov.querySelector('#lkTime');sub.textContent=opts.sub||(P.pins+' pinnen · zet ze alle '+P.pins);
 let set=0,misses=0,missT=0,panic=opts.panic0||0,mode='lock',done=false,t0=performance.now(),last=t0,center=.5,dir=1,x=0,fx=null,raf=0;
 let breath=null;const reduce=lkReduce(),speed=P.speed*(reduce?.75:1);
 const newZone=()=>{center=.18+Math.random()*.64};newZone();
 const pinsHtml=()=>`<div class="lk-pins">${Array.from({length:P.pins},(_,i)=>`<i class="${i<set?'on':''}"></i>`).join('')}</div>`;
 const paintLock=()=>{stage.innerHTML=`<div class="lk-lock">${pinsHtml()}
   <div class="lk-track"><i class="lk-zone" style="left:${((center-P.zone/2)*100).toFixed(1)}%;width:${(P.zone*100).toFixed(1)}%"></i><b class="lk-needle" id="lkNeedle"></b></div>
   <div class="lk-hint">${fx||'Druk als de naald in het groene stuk staat'}</div></div>`;
  help.innerHTML='<b>Spatie</b>, klik of tik op het slot zet een pin. Mis je, dan loopt je paniek op; twee missers op rij en een pin springt terug.';
  ctl.innerHTML='<button class="btn lk-go" type="button" id="lkBtn">Zet pin <small>spatie</small></button>';ov.querySelector('#lkBtn').onpointerdown=e=>{e.preventDefault();press()}};
 const paintBreath=()=>{stage.innerHTML=`<div class="lk-breath"><div class="lk-ring-w"><i class="lk-ring" id="lkRing"></i><span class="lk-ring-t" id="lkRingT">Adem in</span></div>
   <div class="lk-streak" id="lkStreak"></div><div class="lk-hint" id="lkBHint">Tik als de cirkel het grootst is · ${breath.need} keer goed op rij</div></div>`;
  help.innerHTML='Je raakt in paniek. <b>Tik</b> (of spatie) precies als de cirkel het grootst is. Drie keer mis en je raakt het kwijt.';
  ctl.innerHTML='<button class="btn lk-go breath" type="button" id="lkBtn">Nu <small>spatie</small></button>';ov.querySelector('#lkBtn').onpointerdown=e=>{e.preventDefault();press()};streakPaint()};
 const streakPaint=()=>{const e=ov.querySelector('#lkStreak');if(e)e.innerHTML=Array.from({length:breath.need},(_,i)=>`<i class="${i<breath.hit?'on':''}"></i>`).join('')+`<em>${breath.bad?breath.bad+' mis':''}</em>`};
 const startBreath=()=>{mode='breath';breath={hit:0,bad:0,t0:performance.now(),period:2600,need:P.breathN||3};paintBreath();lkSnd('lose')};
 const endBreath=ok=>{if(ok){panic=Math.max(0,Math.min(panic,38));mode='lock';fx='Rustig. Terug naar het slot.';paintLock();setTimeout(()=>{fx=null},1200);lkSnd('win')}else finish(false,'Je raakte in paniek')};
 let press=()=>{if(done)return;
  if(mode==='lock'){if(Math.abs(x-center)<=P.zone/2){set++;misses=0;lkSnd('click');fx=null;if(set>=P.pins){finish(true);return}newZone();paintLock()}
   else{misses++;missT++;panic=Math.min(100,panic+P.panicMiss);lkSnd('tick');if(P.maxMiss!=null&&missT>P.maxMiss){finish(false,'Te veel herrie: iemand hoorde je');return}fx='Mis'+(misses%2===0&&set>0?' · een pin springt terug':'')+(P.maxMiss!=null?' · nog '+(P.maxMiss-missT)+' fout'+(P.maxMiss-missT===1?'':'en')+' over':'');if(misses%2===0&&set>0)set--;paintLock();if(panic>=100)startBreath()}}
  else{const ph=((performance.now()-breath.t0)/breath.period)%1,dist=Math.min(Math.abs(ph-.5),1);// grootst op ph=.5
   if(dist<=P.breathTol/2){breath.hit++;lkSnd('click');if(breath.hit>=breath.need){endBreath(true);return}}
   else{breath.bad++;breath.hit=0;lkSnd('tick');if(breath.bad>=3){endBreath(false);return}}
   streakPaint()}};
 const finish=(ok,why)=>{if(done)return;done=true;cancelAnimationFrame(raf);if(opts.onEnd)try{opts.onEnd({misses:missT,set})}catch(e){}document.removeEventListener('keydown',key);stage.onpointerdown=null;
  stage.innerHTML=`<div class="lk-end ${ok?'won':'lost'}"><b>${ok?'Open!':'Betrapt'}</b><span>${ok?'Alle pinnen zitten. Snel verder.':(why||'De tijd is op: iemand komt eraan.')}</span></div>`;help.textContent='';ctl.innerHTML='';
  lkSnd(ok?'win':'lose');setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok)},200)},ok?700:1100)};
 const key=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();press()}};document.addEventListener('keydown',key);
 stage.onpointerdown=e=>{e.preventDefault();press()};
 const tick=t=>{if(done)return;const dt=Math.min(.1,(t-last)/1000);last=t;
  if(mode==='lock'){x+=dir*speed*dt;if(x>=1){x=1;dir=-1}else if(x<=0){x=0;dir=1}const n=ov.querySelector('#lkNeedle');if(n)n.style.left=(x*100).toFixed(2)+'%';
   panic=Math.min(100,panic+P.panicRate*100*dt);if(panic>=100){startBreath()}}
  else{const ph=((t-breath.t0)/breath.period)%1,s=.5+.5*Math.sin((ph-.25)*Math.PI*2);// 0 bij ph=0, 1 bij ph=.5
   const r=ov.querySelector('#lkRing');if(r){r.style.transform='scale('+(.5+.5*s).toFixed(3)+')';r.classList.toggle('peak',Math.abs(ph-.5)<=P.breathTol/2)}
   const rt=ov.querySelector('#lkRingT');if(rt)rt.textContent=ph<.5?'Adem in':'Adem uit'}
  pan.style.width=panic.toFixed(1)+'%';pan.classList.toggle('hot',panic>70);
  const el=(t-t0)/1000,left=Math.max(0,1-el/P.time);tim.style.width=(left*100).toFixed(1)+'%';tim.classList.toggle('hot',left<.25);
  if(el>=P.time){finish(false);return}
  raf=requestAnimationFrame(tick)};
 paintLock();const run=()=>{raf=requestAnimationFrame(t=>{last=t;t0=t;tick(t)})};
 if(opts.intro&&typeof cgIntro==='function'){let live=false;const k0=press;press=()=>{if(live)k0()};cgIntro(ov.querySelector('.jb-box'),opts.intro,()=>{live=true;run()})}else run()})}

// ---------- ademhaling (training en oefenen) ----------
function breathGame(P,opts){opts=opts||{};return new Promise(resolve=>{
 window.__chase=true;const rounds=opts.rounds||6,need=opts.need||5;
 const ov=lkOverlay(opts.title||'Ademhaling',lkLvOf(P.d),opts.label||'Yogaschool'),stage=ov.querySelector('#lkStage'),help=ov.querySelector('#lkHelp'),ctl=ov.querySelector('#lkCtl');
 ov.querySelector('.lk-m-t').style.display='none';ov.querySelector('#lkSub').textContent=rounds+' ademhalingen · minstens '+need+' keer op het juiste moment';
 const pan=ov.querySelector('#lkPanic');pan.parentElement.parentElement.querySelector('.label').textContent='Rust';
 let hit=0,n=0,done=false,raf=0,t0=performance.now(),pressed=false;const period=2600;
 stage.innerHTML=`<div class="lk-breath"><div class="lk-ring-w"><i class="lk-ring" id="lkRing"></i><span class="lk-ring-t" id="lkRingT">Adem in</span></div><div class="lk-streak" id="lkStreak"></div><div class="lk-hint">Tik als de cirkel het grootst is</div></div>`;
 help.innerHTML='Vier tellen in, vier tellen uit. <b>Tik</b> (of spatie) precies als de cirkel het grootst is. Elke ademhaling telt één keer.';
 ctl.innerHTML='<button class="btn lk-go breath" type="button" id="lkBtn">Nu <small>spatie</small></button>';
 const paint=()=>{const e=ov.querySelector('#lkStreak');if(e)e.innerHTML=Array.from({length:rounds},(_,i)=>`<i class="${i<hit?'on':i<n?'off':''}"></i>`).join('');pan.style.width=(hit/need*100).toFixed(1)+'%'};
 const press=()=>{if(done||pressed)return;const ph=((performance.now()-t0)/period)%1;pressed=true;
  if(Math.abs(ph-.5)<=P.breathTol/2){hit++;lkSnd('click')}else lkSnd('tick');n++;paint()};
 const finish=ok=>{if(done)return;done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);stage.onpointerdown=null;
  stage.innerHTML=`<div class="lk-end ${ok?'won':'lost'}"><b>${ok?'Rustig':'Nog niet'}</b><span>${hit} van de ${rounds} op het juiste moment${ok?'. Je hartslag blijft laag.':'. Je hebt er minstens '+need+' nodig.'}</span></div>`;help.textContent='';ctl.innerHTML='';
  lkSnd(ok?'win':'lose');setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok)},200)},900)};
 const key=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();press()}};document.addEventListener('keydown',key);
 stage.onpointerdown=e=>{e.preventDefault();press()};ov.querySelector('#lkBtn').onpointerdown=e=>{e.preventDefault();press()};
 let lastCycle=0;
 const tick=t=>{if(done)return;const el=t-t0,cyc=Math.floor(el/period),ph=(el/period)%1,s=.5+.5*Math.sin((ph-.25)*Math.PI*2);
  if(cyc>lastCycle){if(!pressed){n++;lkSnd('tick')}pressed=false;lastCycle=cyc;paint();if(n>=rounds){finish(hit>=need);return}}
  const r=ov.querySelector('#lkRing');if(r){r.style.transform='scale('+(.5+.5*s).toFixed(3)+')';r.classList.toggle('peak',Math.abs(ph-.5)<=P.breathTol/2)}
  const rt=ov.querySelector('#lkRingT');if(rt)rt.textContent=ph<.5?'Adem in':'Adem uit';
  raf=requestAnimationFrame(tick)};
 paint();raf=requestAnimationFrame(t=>{t0=t;tick(t)})})}
