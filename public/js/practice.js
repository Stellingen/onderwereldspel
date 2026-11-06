// Oefenen zonder gevolgen: het rennen-vluchtspel (fleeGame), contact maken bij auto stelen (carHeist) en wegrijden
// (carChaseGame). De minigames zelf veranderen niets aan je account: hier roepen we alleen de minigame aan, nooit de actie
// eromheen (geen energie, geen straf, geen hitte, geen cred, geen auto in je garage, geen statistiek). Eerst uitleg en een
// niveau, dan een expliciete startknop en een korte aftelling. Niet in de cel, niet tijdens een echte achtervolging of
// arrestatie.
const PRACTICE={
 flee:{n:'Rennen',sub:'Vluchten na een mislukte klus',how:'Wissel van baan met ← → (of vegen/tikken), spring met ↑ of spatie en buk met ↓. Ontwijk wat op je pad komt en haal de uitgang.',
  lv:()=>[1,2,3,4,5].map(l=>[l,FLEE_LEVELS[l].label])},
 contact:{n:'Contact maken',sub:'Een auto openbreken bij straat afzoeken',how:'Druk de pijlen in de goede volgorde, voordat de tijd op is. Rode pijlen druk je andersom in. Hoe zeldzamer de auto, hoe meer sloten en hoe minder tijd.',
  lv:()=>[1,2,3,4,5].map(t=>[t,(CAR_RARITY[t]||['Niveau '+t])[0]])},
 chase:{n:'Wegrijden',sub:'Vluchten met een gestolen auto',how:'Stuur met ← → (of vegen), rem en gebruik nitro. Ontwijk verkeer, laat je niet klem rijden en neem een zijstraat om ze kwijt te raken.',
  lv:()=>[1,2,3,4,5].map(l=>[l,FLEE_LEVELS[l].label])},
 lock:{n:'Slotenkraken',sub:'Een slot op de deur tijdens een klus',how:'Druk (spatie, klik of tik) als de naald in het groene stuk staat: dan zit een pin. Mis je, dan loopt je paniek op. Is die vol, dan moet je eerst rustig ademen: tik als de cirkel het grootst is.',
  lv:()=>[1,2,3,4,5].map(l=>[l,['Simpel slot','Degelijk slot','Zwaar slot','Kluisdeur','Bankkluis'][l-1]])},
 breath:{n:'Ademhaling',sub:'Rustig blijven als het spannend wordt',how:'Een cirkel zwelt en krimpt. Tik (of spatie) precies als hij het grootst is. Zes ademhalingen, minstens vijf goed.',
  lv:()=>[1,2,3,4,5].map(l=>[l,['Ruim venster','Gewoon','Krap','Heel krap','Flinterdun'][l-1]])}};
const prCan=()=>!inJail()&&!window.__chase&&!S.pendingArrest&&!S.pendingHeist&&!S.pendingJack&&!S.pendingGame;
function prWhy(){return inJail()?'Niet in de cel':window.__chase?'Eerst je achtervolging afmaken':S.pendingArrest?'Eerst je arrestatie afhandelen':''}
// knoppen die een pagina kan tonen
function prButtons(kinds){const why=prWhy();
 return `<div class="pr-strip"><span class="pr-tag">Oefenen · telt niet mee</span>${kinds.map(k=>`<button class="btn ghost sm pr-btn" type="button" onclick="practiceOpen('${k}')" ${why?'disabled':''}>${PRACTICE[k].n}</button>`).join('')}${why?`<em>${why}</em>`:''}</div>`}
function practiceOpen(kind,lv0){const P=PRACTICE[kind];if(!P)return;if(!prCan()){toast(prWhy()||'Nu niet','bad');return}if(P.open)return P.open(lv0);
 const lvs=P.lv();let lv=lv0||lvs[0][0];
 const ov=document.createElement('div');ov.className='pr-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','prT');
 const paint=()=>{ov.innerHTML=`<div class="pr-box"><span class="pr-tag">Oefenen · telt niet mee</span><h2 id="prT">${P.n}</h2><p class="pr-sub">${P.sub}</p>
   <div class="pr-how"><span class="label">Zo werkt het</span><p>${P.how}</p></div>
   <div class="pr-safe">Je energie, geld, hitte, straf, straatcredit, auto's en statistieken blijven precies zoals ze zijn.</div>
   <span class="label">Niveau</span><div class="pr-lv" role="radiogroup" aria-label="Niveau">${lvs.map(([v,l])=>`<button type="button" role="radio" aria-checked="${v===lv}" class="${v===lv?'on':''}" data-lv="${v}"><b>${v}</b><small>${l}</small></button>`).join('')}</div>
   <div class="pr-act"><button class="btn ghost" type="button" data-a="close">Terug</button><button class="btn" type="button" data-a="go">Start oefening</button></div><div class="pr-count" aria-live="assertive"></div></div>`;
  ov.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>{lv=+b.dataset.lv;try{SFX.click()}catch(e){}paint()});
  ov.querySelector('[data-a="close"]').onclick=close;ov.querySelector('[data-a="go"]').onclick=go;
  setTimeout(()=>{const g=ov.querySelector('[data-a="go"]');g&&g.focus({preventScroll:true})},30)};
 const key=e=>{if(e.code==='Escape'){e.preventDefault();close()}};
 function close(){document.removeEventListener('keydown',key);ov.classList.add('out');setTimeout(()=>ov.remove(),200)}
 async function go(){if(!prCan()){close();return}const box=ov.querySelector('.pr-box'),c=ov.querySelector('.pr-count');box.classList.add('counting');
  ov.querySelectorAll('button').forEach(b=>b.disabled=true);
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(const n of reduce?['Start']:['3','2','1']){c.textContent=n;c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');try{SFX.tick()}catch(e){}await new Promise(r=>setTimeout(r,reduce?350:650))}
  document.removeEventListener('keydown',key);ov.remove();
  let ok=false;try{ok=await prRun(kind,lv)}catch(e){console.error(e)}
  prResult(kind,lv,ok)}
 document.addEventListener('keydown',key);paint();document.body.appendChild(ov)}
// alleen de minigame, zonder de actie eromheen
async function prRun(kind,lv){
 if(kind.indexOf('cg_')===0&&typeof cgPracticeRun==='function')return (await cgPracticeRun(kind.slice(3),lv))===true; // klus-spellen (crimegames.js)
 if(kind==='flee')return (await fleeGame(lv))===true;
 if(kind==='lock')return (await lockGame(lockParams(null,lv),{title:'Oefenen · slot'}))===true;
 if(kind==='breath')return (await breathGame(lockParams(null,lv),{title:'Oefenen · ademhaling',label:'Oefenen'}))===true;
 const pool=CARS.filter(m=>!m.leg&&carTier(m)===lv),m=pool[Math.floor(Math.random()*pool.length)]||CARS[0];
 if(kind==='contact'){const sp=spawnCar(m,'Oefenplaats');return (await carHeist(sp))===true}
 if(kind==='chase'){const c=(spawnCar(m,'Oefenplaats')||{}).c||'#8a929c';return (await carChaseGame(lv,{b:m.b,c,n:m.n}))===true}
 return false}
function prResult(kind,lv,ok){const P=PRACTICE[kind],ov=document.createElement('div');ov.className='pr-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','prR');
 ov.innerHTML=`<div class="pr-box ${ok?'won':'lost'}"><span class="pr-tag">Oefening · telde niet mee</span><h2 id="prR">${ok&&P.ok?P.ok:!ok&&P.no?P.no:ok?(kind==='contact'||kind==='lock'?'Gelukt!':kind==='breath'?'Rustig!':'Ontkomen!'):(kind==='contact'||kind==='lock'||kind==='breath'?'Mislukt':'Gepakt')}</h2>
  <p class="pr-sub">${P.n} · niveau ${lv}. ${ok?'Zo doe je het in het echt ook.':'Geen zorgen: er is niets veranderd aan je account.'}</p>
  <div class="pr-act"><button class="btn ghost" type="button" data-a="close">Klaar</button><button class="btn" type="button" data-a="again">Nog een keer</button></div></div>`;
 document.body.appendChild(ov);
 const close=()=>{ov.classList.add('out');setTimeout(()=>ov.remove(),200)};
 ov.querySelector('[data-a="close"]').onclick=close;ov.querySelector('[data-a="again"]').onclick=()=>{ov.remove();practiceOpen(kind,lv)};
 setTimeout(()=>{const g=ov.querySelector('[data-a="again"]');g&&g.focus({preventScroll:true})},30)}
