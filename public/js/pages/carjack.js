// Auto's: carjacken bij het stoplicht. Een andere manier om aan een auto te komen dan de straat afzoeken:
// geen zoektocht, meteen een auto, maar meer risico en een lagere prijs (de auto is "heet").
// Er stopt een auto voor rood. Druk drie keer op het juiste moment (portier open, bestuurder eruit, gas erop) voordat het licht
// op groen springt. Het groene stuk is groter met ervaring, Conditie, Rijvaardigheid en een zwaarder wapen; duurdere auto's gaan sneller.
// Mis je, dan rijdt hij soms gewoon weg, vecht de bestuurder soms terug (gezondheid), en soms staat er politie om de hoek.
const JACK_R=GAME_CONST.jackR,JACK_EN=12,JACK_CD=4,JACK_HOT=.85,JACK_STEPS=['Portier open','Bestuurder eruit','Gas erop'];
// Bij het stoplicht staan duurdere auto's dan op straat (meer lef): JACK_T0 als groentje, JACK_T1 als legende (steelervaring),
// en de dure klassen (k in CARS) tellen ×1,3 zwaarder dan op straat.
const JACK_T0={1:.34,2:.33,3:.21,4:.1,5:.02,6:0},JACK_T1={1:.1,2:.16,3:.31,4:.29,5:.12,6:.02},JACK_BOOST=1.2;
const jackTier=p=>lerpT(JACK_T0,JACK_T1,powK(p==null?carPow():p));
const JACK_SPOTS=['Stoplicht op de Wibautstraat','Kruispunt bij het Museumplein','Afrit van de A10 bij de RAI','Stoplicht op de Coolsingel','Kruising bij het Malieveld','Rotonde in Amstelveen'];
let carMode=null;
const jackCd=()=>JACK_CD*60000*waitK();
const jackPick=()=>pickCar(jackTier(),JACK_BOOST);
// Wapen: zonder wapen stapt niemand uit. Hoe zwaarder (vuurkracht vk, Vlindermes 1 tot Machinegeweer 12), hoe groter het groene
// stuk, hoe minder kans dat de bestuurder weigert of terugvecht.
const jackWeapon=()=>{const g=gearBest('wapen');return g?GEAR.filter(x=>x.cat==='wapen').indexOf(g):-1};
const jackGun=()=>gearBest('wapen');
const jackWpow=()=>{const g=jackGun();return g?Math.min(1,(g.vk||1)/12):0};
// kans dat de bestuurder bij "Bestuurder eruit" weigert en gas geeft (duurdere auto = stoerder of met chauffeur)
const jackRefuse=m=>Math.max(0,Math.min(.6,.1+.06*carTier(m)-.5*jackWpow()-.1*carPow()));
// kans dat iemand 112 belt als het gelukt is: dan volgt een achtervolging (Plankgas!) die je moet winnen
const jackPolice=m=>Math.max(.06,Math.min(.45,.14+carTier(m)*.04-carPow()*.12-gearFx('heat')*.1+(S.heat||0)/500));
function jackParams(m){const N=carNerve(),d=carTier(m),rel=typeof carRel==='function'?carRel(m):0,wp=jackWpow();
 const zone=Math.max(.06,Math.min(.34,.17-d*.012+rel*.012+wp*.07+sk('conditie')*.0012+sk('cars')*.0012));
 return {zone,speed:.55+d*.1-Math.max(-.2,Math.min(.2,rel*.025)),time:6500,d,nv:N,rel,wp}}

function jackSection(){const ri=rankIdx(S.xp),left=cdLeft('jack'),full=S.cars.length>=garageCap(),wp=jackWeapon()>=0,lock=ri<JACK_R,N=carNerve(),G=jackGun();
 const ok=!lock&&!left&&!full&&!inJail()&&S.energy>=JACK_EN;
 const label=lock?'Vanaf '+RANKS[JACK_R][0]:inJail()?'Je zit vast':full?'Garage vol, verkoop eerst':left?'Even afkoelen · <span id="jackCd">'+fmtClock(left)+'</span>':S.energy<JACK_EN?'Te moe · '+JACK_EN+' energie':(wp?'Op de loer bij het stoplicht · ':'Zonder wapen proberen · ')+JACK_EN+' energie';
 const z=Math.round(jackParams({d:2,w:1}).zone*100),JT=jackTier(),T3=JT[3]+JT[4]+JT[5]+JT[6],ref=m=>Math.round(jackRefuse(m)*100);
 return `<section class="hunt jk">
  <div class="hunt-scene jk-scene"><div class="jk-road"><i></i><i></i><i></i></div><div class="jk-light"><i class="r on"></i><i class="a"></i><i class="g"></i></div>
   <div class="hs-ghost">${carSvg('sedan','#2a2f38')}</div>
   <div class="hs-msg"><span class="label">Carjacken</span><b>Wacht tot hij stopt voor rood</b><p>Drie keer op het juiste moment drukken, voordat het licht op groen springt.</p></div></div>
  <div class="hunt-body"><div class="hunt-tip"><h3>Hoe werkt het?</h3><ul>
   <li>Geen zoektocht: er stopt meteen een auto. Hier staan duurdere auto's dan op straat. Voor jou nu: <b>${Math.round(T3*100)}%</b> kans op zeldzaam of beter.</li>
   <li>Druk op <b>spatie</b> of <b>Nu!</b> als de streep in het groene stuk staat: portier open, bestuurder eruit, gas erop.</li>
   <li><b>Zonder wapen stapt niemand uit</b>: de bestuurder rijdt gewoon weg. Hoe zwaarder je wapen, hoe groter het groene stuk en hoe minder vaak hij weigert.</li>
   <li>Gelukt? Soms belt een omstander <b>112</b>. Dan moet je de politie eruit rijden. Verlies je de achtervolging, dan word je gepakt en ben je de auto kwijt.</li>
   <li>Een gejatte auto is <b>heet</b>: hij is ${Math.round((1-JACK_HOT)*100)}% minder waard en je krijgt meer hitte dan bij gewoon stelen. Hij telt wel mee voor je steelervaring.</li></ul></div>
   <div class="jk-wp ${G?'':'none'}"><span class="label">Je wapen</span><b>${G?esc(G.n):'Geen wapen'}</b><span>${G?`Vuurkracht ${G.vk} · weigert bij een gewone auto ${ref({d:2})}%, bij een supercar ${ref({d:5})}%`:'Niemand stapt voor je uit. Koop eerst een wapen bij Het Arsenaal.'}</span>${G?'':`<a class="btn sm ghost" href="#shop" onclick="if(window.gsel)gsel.shop='arsenaal'">Naar Het Arsenaal ›</a>`}</div>
   <div class="sc-nerve n${N.i}"><span class="label">Jouw steelervaring · level ${N.lvl}</span><b>${N.name}</b><span>Groen stuk ±${z}% van de balk bij een gewone auto · ±${Math.round(jackPolice({d:2})*100)}% kans dat iemand 112 belt · groter met ervaring, Conditie, Rijvaardigheid en een zwaarder wapen</span></div>
   ${typeof carGotHtml==='function'?carGotHtml('jack'):''}<div class="hunt-btns"><button class="btn xl" onclick="act.jackCar()" ${ok?'':'disabled'}>${label}</button></div></div></section>`}

// opts (van jackCar): noWp = geen wapen (niemand stapt uit), refuse = de bestuurder weigert bij stap 2, gun = naam van je wapen
function jackGame(m,car,opts){const O=opts||{};return new Promise(resolve=>{
 const P=jackParams(m),R=carRarity(m);window.__chase=true;
 const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML=`<div class="chase-box heist jk-box t${carTier(m)}" style="--rc:${R[1]}">
  <div class="hx-car">${carSvg(m.b,car.c,{hl:1})}<span class="plate">${car.plate}</span><div class="jk-light sm"><i class="r on"></i><i class="a"></i><i class="g"></i></div></div>
  <div class="heist-top"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="label">${esc(m.n)} · ${esc(car.spot)}</span></div>
  ${typeof helerBadge==='function'?helerBadge(m.id):''}
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
  if(inZ){step++;try{SFX.tick()}catch(e){}pills();
   if(O.noWp&&step===1)return finish('nowp','Je rukt het portier open, maar zonder wapen stapt niemand uit. Hij geeft gas en is weg.');
   if(O.refuse&&step===2)return finish('refuse','De bestuurder kijkt naar je '+(O.gun?O.gun.toLowerCase():'wapen')+', lacht en trapt het gas in.');
   if(step>=JACK_STEPS.length)return finish(true,'Hij staat op de stoep en jij rijdt weg.');
   speed*=1.18;zone.w=Math.max(.08,zone.w*.92);place();q('#jkP').textContent=JACK_STEPS[step]+'…';return}
  const r=Math.random(),fp=.45*(1-.7*(P.wp||0));finish(r<fp?'fight':r<.8?'gone':'police',r<fp?'De bestuurder vecht terug en je moet het opgeven.':r<.8?'Te vroeg. Hij geeft gas en is weg.':'Verkeerd moment, en er staat politie om de hoek.')};
 const key=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)press()}};
 document.addEventListener('keydown',key);q('#jkNow').addEventListener('pointerdown',e=>{e.preventDefault();press()});q('#jkBar').addEventListener('pointerdown',e=>{e.preventDefault();press()});
 function finish(res,msg){done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);const box=q('.chase-box');box.classList.add(res===true?'won':'lost');pills();
  q('#jkT').textContent=res===true?'Gelukt!':res==='police'?'Politie!':res==='fight'?'Verzet!':res==='nowp'?'Geen wapen':'Weg!';q('#jkP').textContent=msg;q('#jkNow').disabled=true;
  if(res===true){box.querySelector('.hx-car').classList.add('drive');try{SFX.win(3)}catch(e){}}else{try{SFX.lose()}catch(e){}}
  setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(res)},220)},1500)}
 place();pills();setTimeout(()=>{t0=last=performance.now();raf=requestAnimationFrame(loop)},700);
})}

Object.assign(act,{
 async jackCar(){if(typeof carGot!=='undefined')carGot=null;if(window.__chase||inJail()||cdLeft('jack')||rankIdx(S.xp)<JACK_R)return;
  if(S.cars.length>=garageCap()){toast('Garage vol, verkoop eerst iets','bad');return}if(S.energy<JACK_EN){toast('Te moe','bad');return}
  S.energy-=JACK_EN;S.cd.jack=now()+jackCd();const m=jackPick(),spot=JACK_SPOTS[Math.floor(Math.random()*JACK_SPOTS.length)],car=spawnCar(m,spot),G=jackGun();
  const opts={noWp:!G,refuse:!!G&&Math.random()<jackRefuse(m),gun:G&&G.n};
  S.pendingJack={id:m.id};save();pushState();
  const r=await jackGame(m,car,opts);S.pendingJack=null;S.stats.jackTries=(S.stats.jackTries||0)+1;S.carDex=S.carDex||{};const dx=S.carDex[m.id]||[0,0];dx[0]++;S.carDex[m.id]=dx;
  if(r===true){const v=Math.round(carSell(car.v)*JACK_HOT/10)*10,nc={id:m.id,n:m.n,v,b:m.b,c:car.c,year:car.year,km:car.km,staat:car.staat,hot:1,rep:1};S.stats.jacks=(S.stats.jacks||0)+1;cxpAdd(m);
   S.cred+=carTier(m)>=3?2:1;addHeat(6+m.d*2);addXp(8+m.d*m.d*4);
   if(Math.random()<jackPolice(m)){jackChase(m,car,nc);return}
   jackKeep(m,nc);return}
  else if(r==='nowp'){addHeat(1);toast(`Zonder wapen stapt niemand uit. De ${m.n} rijdt weg.`,'bad');log(`Carjacking mislukt: zonder wapen stapte de bestuurder van de ${m.n} niet uit`,'bad')}
  else if(r==='refuse'){addHeat(2);toast(`De bestuurder van de ${m.n} is niet onder de indruk van je ${(opts.gun||'wapen').toLowerCase()} en rijdt weg.`,'bad');log(`Carjacking mislukt: de bestuurder van de ${m.n} weigerde`,'bad')}
  else if(r==='fight'){const h=rnd(8,18);S.hp=Math.max(5,S.hp-h);addHeat(3);toast(`De bestuurder van de ${m.n} vecht terug. −${h}% gezondheid`,'bad');log(`Carjacking mislukt: de bestuurder vocht terug (−${h}% gezondheid)`,'bad')}
  else if(r==='gone'){addHeat(2);toast(`De ${m.n} rijdt weg. Geen politie, wel energie kwijt.`,'bad');log(`Carjacking mislukt: de ${m.n} reed weg`,'bad')}
  else{addHeat(6+m.d*2);log(`Carjacking mislukt: politie bij de ${m.n}`,'bad');save();render();
   arrest(40+m.d*25,'Politie!','Een agent zag je bij de '+m.n+' aan het portier trekken. De motor draait nog.',{flee:Math.min(5,Math.max(1,m.d)),chase:{b:m.b,c:car.c,n:m.n}});return}
  save();render()}});
// Gelukt en geen politie (of de achtervolging gewonnen): de auto gaat je garage in
function jackKeep(m,nc,chased){S.cars.push(nc);if(typeof carGot!=='undefined')carGot={car:nc,src:'jack',t:now()};S.stats.cars++;
 const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d;if(typeof famEv==='function')famEv('car',{v:nc.v});
 toast(chased?`Ontkomen! De ${m.n} is van jou. Waarde ${fmt(nc.v)} (heet)`:`${m.n} gejat bij het stoplicht! Waarde ${fmt(nc.v)} (heet)`,chased?'lvl':'ok');log(`Carjacking: ${m.n} (${fmt(nc.v)})${chased?', na een achtervolging':''}`,'ok');
 save();render();if(typeof carGotShow==='function')carGotShow()}
// Iemand belde 112: achtervolging in Plankgas! (carchase.js). Winnen = auto houden, verliezen = de cel in (bestaande jailFor) en de auto kwijt.
// De arrestatie staat al open (S.pendingArrest, fleeing): wie ververst of wegklikt, telt als gepakt (+20%, resumePending).
function jackChase(m,car,nc){const lv=Math.min(5,Math.max(2,carTier(m))),ch={b:m.b,c:car.c,n:m.n},L=FLEE_LEVELS[lv];
 const pa={sec:40+m.d*25,title:'Achtervolging verloren',msg:'',opts:{flee:lv,chase:ch},fleeing:true};S.pendingArrest=pa;S.stats.jackChases=(S.stats.jackChases||0)+1;addHeat(4);
 log(`Carjacking: een omstander belde 112 over de ${m.n}`,'bad');save();pushState();render();
 showModal('112 gebeld!',`Je zit in de ${m.n}, maar een omstander heeft de politie gebeld. Zwaailichten in je spiegel. Rijd ze eruit (${L.label}): lukt het, dan is de auto van jou. Verlies je, dan word je gepakt en ben je hem kwijt.`,
  [{l:'Plankgas! · '+L.label,c:'',f:()=>{closeModal();(typeof carChaseGame==='function'?carChaseGame(lv,ch):fleeGame(lv)).then(ok=>{
   if(ok){S.pendingArrest=null;S.stats.fled=(S.stats.fled||0)+1;S.stats.jackEsc=(S.stats.jackEsc||0)+1;S.cred+=1;addHeat(5);addXp(3);jackKeep(m,nc,1)}
   else jailFor(pa,1,`Klem gereden in de gejatte ${m.n}. De auto gaat terug naar de eigenaar`)})}}])}
