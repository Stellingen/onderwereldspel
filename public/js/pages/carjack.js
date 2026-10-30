// Auto's: carjacken bij het stoplicht. Een andere manier om aan een auto te komen dan de straat afzoeken:
// geen zoektocht, meteen een auto, maar meer risico en een lagere prijs (de auto is "heet").
// Er stopt een auto voor rood. Druk drie keer op het juiste moment (portier open, bestuurder eruit, gas erop) voordat het licht
// op groen springt. Het groene stuk is groter met ervaring, Conditie, Rijvaardigheid en een zwaarder wapen; duurdere auto's gaan sneller.
// Mis je, dan rijdt hij soms gewoon weg, vecht de bestuurder soms terug (gezondheid), en soms staat er politie om de hoek.
const JACK_R=4,JACK_EN=12,JACK_CD=4,JACK_HOT=.85,JACK_STEPS=['Portier open','Bestuurder eruit','Gas erop'];
const JACK_TIER={1:.45,2:.32,3:.16,4:.07};
const JACK_SPOTS=['Stoplicht op de Wibautstraat','Kruispunt bij het Museumplein','Afrit van de A10 bij de RAI','Stoplicht op de Coolsingel','Kruising bij het Malieveld','Rotonde in Amstelveen'];
let carMode='zoek';
const jackCd=()=>JACK_CD*60000*waitK();
function jackPick(){let r=Math.random(),t=1;for(const k of [1,2,3,4]){r-=JACK_TIER[k];if(r<=0){t=k;break}}
 const pool=CARS.filter(m=>carTier(m)===t);let w=Math.random()*pool.reduce((a,m)=>a+m.w,0);for(const m of pool){w-=m.w;if(w<=0)return m}return pool[0]}
const jackWeapon=()=>{const g=gearBest('wapen');return g?GEAR.filter(x=>x.cat==='wapen').indexOf(g):-1};
function jackParams(m){const N=carNerve(),d=carTier(m),wp=jackWeapon();
 const zone=Math.max(.1,Math.min(.32,.2-d*.015+N.lv*.06+sk('conditie')*.0015+sk('cars')*.0015+(wp>=2?.02:0)));
 return {zone,speed:.55+d*.12,time:6500,d,nv:N}}

function jackSection(){const ri=rankIdx(S.xp),left=cdLeft('jack'),full=S.cars.length>=GARAGE_MAX,wp=jackWeapon()>=0,lock=ri<JACK_R,N=carNerve();
 const ok=!lock&&!left&&!full&&wp&&!inJail()&&S.energy>=JACK_EN;
 const label=lock?'Vanaf '+RANKS[JACK_R][0]:inJail()?'Je zit vast':!wp?'Eerst een wapen':full?'Garage vol, verkoop eerst':left?'Even afkoelen · <span id="jackCd">'+fmtClock(left)+'</span>':S.energy<JACK_EN?'Te moe · '+JACK_EN+' energie':'Op de loer bij het stoplicht · '+JACK_EN+' energie';
 const z=Math.round(jackParams({d:2,w:1}).zone*100);
 return `<section class="hunt jk">
  <div class="hunt-scene jk-scene"><div class="jk-road"><i></i><i></i><i></i></div><div class="jk-light"><i class="r on"></i><i class="a"></i><i class="g"></i></div>
   <div class="hs-ghost">${carSvg('sedan','#2a2f38')}</div>
   <div class="hs-msg"><span class="label">Carjacken</span><b>Wacht tot hij stopt voor rood</b><p>Drie keer op het juiste moment drukken, voordat het licht op groen springt.</p></div></div>
  <div class="hunt-body"><div class="hunt-tip"><h3>Hoe werkt het?</h3><ul>
   <li>Geen zoektocht: er stopt meteen een auto. Meestal iets gewoons, soms een zeldzame. Legendarisch of mythisch zit er niet bij.</li>
   <li>Druk op <b>spatie</b> of <b>Nu!</b> als de streep in het groene stuk staat: portier open, bestuurder eruit, gas erop.</li>
   <li>Een gejatte auto is <b>heet</b>: hij is ${Math.round((1-JACK_HOT)*100)}% minder waard en je krijgt meer hitte dan bij gewoon stelen.</li>
   <li>Mis je, dan rijdt hij weg, vecht de bestuurder terug (gezondheid) of staat er politie om de hoek.</li></ul></div>
   <div class="sc-nerve n${N.i}"><span class="label">Jouw ervaring</span><b>${N.name}</b><span>Groen stuk ±${z}% van de balk bij een gewone auto · groter met Conditie, Rijvaardigheid en een zwaarder wapen</span></div>
   <div class="hunt-btns"><button class="btn xl" onclick="act.jackCar()" ${ok?'':'disabled'}>${label}</button></div></div></section>`}

function jackGame(m,car){return new Promise(resolve=>{
 const P=jackParams(m),R=carRarity(m);window.__chase=true;
 const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML=`<div class="chase-box heist jk-box t${carTier(m)}" style="--rc:${R[1]}">
  <div class="hx-car">${carSvg(m.b,car.c,{hl:1})}<span class="plate">${car.plate}</span><div class="jk-light sm"><i class="r on"></i><i class="a"></i><i class="g"></i></div></div>
  <div class="heist-top"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="label">${esc(m.n)} · ${esc(car.spot)}</span></div>
  <div class="hx-head"><h2 id="jkT">Carjacken</h2><div class="jk-steps" id="jkSteps">${JACK_STEPS.map(s=>`<span>${s}</span>`).join('')}</div></div>
  <p class="chase-p" id="jkP">Druk op <b>spatie</b> of <b>Nu!</b> als de streep in het groene stuk staat.</p>
  <div class="jk-bar" id="jkBar"><i class="jk-zone" id="jkZone"></i><i class="jk-mk" id="jkMk"></i></div>
  <div class="hx-time"><i id="jkTime"></i></div>
  <button class="btn xl jk-now" id="jkNow">Nu!</button></div>`;
 document.body.appendChild(ov);
 const q=s=>ov.querySelector(s);let step=0,pos=0,dir=1,speed=P.speed,zone={a:0,w:P.zone},done=false,t0=0,last=0,raf=0;
 const place=()=>{zone.a=.06+Math.random()*(.88-zone.w);const z=q('#jkZone');z.style.left=(zone.a*100)+'%';z.style.width=(zone.w*100)+'%'};
 const pills=()=>q('#jkSteps').querySelectorAll('span').forEach((e,i)=>{e.className=i<step?'ok':i===step&&!done?'cur':''});
 const loop=t=>{if(done)return;const dt=Math.min(.05,(t-last)/1000);last=t;pos+=dir*speed*dt;if(pos>1){pos=1;dir=-1}if(pos<0){pos=0;dir=1}
  q('#jkMk').style.left=(pos*100)+'%';const p=(t-t0)/P.time;const bar=q('#jkTime');bar.style.width=Math.max(0,100-p*100)+'%';bar.classList.toggle('low',p>.7);
  if(p>.72){ov.querySelector('.jk-light .r').classList.remove('on');ov.querySelector('.jk-light .a').classList.add('on')}
  if(p>=1)return finish('gone','Het licht springt op groen. Hij rijdt weg.');raf=requestAnimationFrame(loop)};
 const press=()=>{if(done||!t0)return;const inZ=pos>=zone.a&&pos<=zone.a+zone.w;
  if(inZ){step++;try{SFX.tick()}catch(e){}pills();if(step>=JACK_STEPS.length)return finish(true,'Hij staat op de stoep en jij rijdt weg.');
   speed*=1.18;zone.w=Math.max(.08,zone.w*.92);place();q('#jkP').textContent=JACK_STEPS[step]+'…';return}
  const r=Math.random();finish(r<.45?'fight':r<.8?'gone':'police',r<.45?'De bestuurder vecht terug en je moet het opgeven.':r<.8?'Te vroeg. Hij geeft gas en is weg.':'Verkeerd moment, en er staat politie om de hoek.')};
 const key=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)press()}};
 document.addEventListener('keydown',key);q('#jkNow').addEventListener('pointerdown',e=>{e.preventDefault();press()});q('#jkBar').addEventListener('pointerdown',e=>{e.preventDefault();press()});
 function finish(res,msg){done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);const box=q('.chase-box');box.classList.add(res===true?'won':'lost');pills();
  q('#jkT').textContent=res===true?'Gelukt!':res==='police'?'Politie!':res==='fight'?'Verzet!':'Weg!';q('#jkP').textContent=msg;q('#jkNow').disabled=true;
  if(res===true){box.querySelector('.hx-car').classList.add('drive');try{SFX.win(3)}catch(e){}}else{try{SFX.lose()}catch(e){}}
  setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(res)},220)},1500)}
 place();pills();setTimeout(()=>{t0=last=performance.now();raf=requestAnimationFrame(loop)},700);
})}

Object.assign(act,{
 async jackCar(){if(window.__chase||inJail()||cdLeft('jack')||rankIdx(S.xp)<JACK_R||jackWeapon()<0)return;
  if(S.cars.length>=GARAGE_MAX){toast('Garage vol, verkoop eerst iets','bad');return}if(S.energy<JACK_EN){toast('Te moe','bad');return}
  S.energy-=JACK_EN;S.cd.jack=now()+jackCd();const m=jackPick(),spot=JACK_SPOTS[Math.floor(Math.random()*JACK_SPOTS.length)],car=spawnCar(m,spot);
  S.pendingJack={id:m.id};save();pushState();
  const r=await jackGame(m,car);S.pendingJack=null;S.stats.jackTries=(S.stats.jackTries||0)+1;S.carDex=S.carDex||{};
  if(r===true){const v=Math.round(carSell(car.v)*JACK_HOT/10)*10;S.cars.push({id:m.id,n:m.n,v,b:m.b,c:car.c,year:car.year,km:car.km,staat:car.staat,hot:1});S.stats.cars++;S.stats.jacks=(S.stats.jacks||0)+1;
   S.cred+=carTier(m)>=3?2:1;addHeat(6+m.d*2);addXp(8+m.d*m.d*4);if(typeof famEv==='function')famEv('car',{v});const d=S.carDex[m.id]||[0,0];d[0]++;d[1]++;S.carDex[m.id]=d;
   toast(`${m.n} gejat bij het stoplicht! Waarde ${fmt(v)} (heet)`,'ok');log(`Carjacking: ${m.n} (${fmt(v)})`,'ok')}
  else if(r==='fight'){const h=rnd(8,18);S.hp=Math.max(5,S.hp-h);addHeat(3);toast(`De bestuurder van de ${m.n} vecht terug. −${h}% gezondheid`,'bad');log(`Carjacking mislukt: de bestuurder vocht terug (−${h}% gezondheid)`,'bad')}
  else if(r==='gone'){addHeat(2);toast(`De ${m.n} rijdt weg. Geen politie, wel energie kwijt.`,'bad');log(`Carjacking mislukt: de ${m.n} reed weg`,'bad')}
  else{addHeat(6+m.d*2);log(`Carjacking mislukt: politie bij de ${m.n}`,'bad');save();render();
   arrest(40+m.d*25,'Politie!','Een agent zag je bij de '+m.n+' aan het portier trekken.',{flee:Math.min(5,Math.max(1,m.d))});return}
  save();render()}});
