// Tab: Auto's — zoek de straat af, kom willekeurig een auto tegen en probeer hem te stelen. Daaronder je garage.
const GARAGE_MAX=10,SEARCH_EN=2,SEARCH_MS=1700,FIND_MS=60000;
const carEn=m=>4+m.d*2+(m.leg?4:0);
// Kans per zoektocht per zeldzaamheid (0 = niks gevonden, 6 = mythisch). Binnen een groep telt het gewicht (w) van het model.
const FIND_TIER={0:.15,1:.4425,2:.24,3:.10,4:.045,5:.02,6:.0025};
const tierName=t=>t===6?CAR_MYTH:CAR_RARITY[t];
const CAR_ODDS=(()=>{const sum={},o={};CARS.forEach(m=>{const t=carTier(m);sum[t]=(sum[t]||0)+m.w});CARS.forEach(m=>{const t=carTier(m);o[m.id]=FIND_TIER[t]*m.w/sum[t]});return o})();
const oddTxt=p=>{const v=p*100;return (v>=10?v.toFixed(0):v>=1?v.toFixed(1):v.toFixed(2)).replace('.',',')+'%'};
const kTxt=n=>n>=1000?'€'+(n/1000).toLocaleString('nl-NL',{maximumFractionDigits:1})+'k':'€'+n;
const kmTxt=k=>k.toLocaleString('nl-NL')+' km';
const NOTHING=['Alleen een bakfiets en een scootmobiel.','Overal camera\'s. Je loopt maar door.','Een buurtwacht kijkt je na. Niks te halen.',
 'Een roestige caravan zonder wielen.','Alles staat met een stuurslot vast.','Een taxi met de chauffeur er nog in.','Een lege parkeerplaats en een boze kat.'];
function rollCar(){let r=Math.random();for(const t of [0,1,2,3,4,5,6]){r-=FIND_TIER[t];if(r>0)continue;if(!t)return null;
  const pool=CARS.filter(m=>carTier(m)===t);let w=Math.random()*pool.reduce((a,m)=>a+m.w,0);for(const m of pool){w-=m.w;if(w<=0)return m}return pool[0]}return CARS[0]}
// Eén gevonden auto: eigen bouwjaar, kilometerstand, staat, kleur, kenteken en straatwaarde binnen de prijsklasse van het model
function spawnCar(m,spot){const [y0,y1]=m.y,year=y0+Math.floor(Math.random()*(y1-y0+1)),age=y1>y0?(y1-year)/(y1-y0):0;
 const km=Math.round((age*160000+4000+Math.random()*36000)/100)*100;
 const ST=[['Slecht',.72,.16],['Redelijk',.88,.36],['Goed',1,.34],['Nieuwstaat',1.08,.14]];let r=Math.random(),st=ST[2];for(const x of ST){r-=x[2];if(r<=0){st=x;break}}
 const base=m.lo+(m.hi-m.lo)*(.55*(1-age)+.45*(1-Math.min(1,km/220000)));
 const v=Math.max(Math.round(m.lo*.7/50)*50,Math.min(Math.round(m.hi*1.08/50)*50,Math.round(base*st[1]/50)*50));
 const pal=CAR_COLORS[m.d];return {id:m.id,spot,year,km,staat:st[0],v,c:pal[Math.floor(Math.random()*pal.length)],plate:randPlate()}}
const carSell=v=>Math.round(v*(1+((S.skills&&S.skills.cars)||0)*SK.cars.price)*(1+famPerk('car'))*(1+fitFx('car'))/10)*10;
let carSearch=null,oddsOpen=false;
const findM=x=>CARS.find(k=>k.id===x.id)||CARS[0];
function carExpire(quiet){const x=S.carFind;if(x&&x.until&&!x.res&&x.until<now()){S.carFind={...x,res:'gone'};if(!quiet)toast('De eigenaar komt terug. De '+findM(x).n+' rijdt weg.','bad');save();return true}return false}
function huntScene(){const x=S.carFind;
 if(carSearch)return `<div class="hunt-scene searching"><div class="beam"></div><div class="hs-msg"><span class="label">Aan het zoeken</span><b>${carSearch.spot}</b><div class="hs-prog"><i style="animation-duration:${SEARCH_MS}ms"></i></div></div></div>`;
 if(!x)return `<div class="hunt-scene idle"><div class="hs-ghost">${carSvg('sedan','#1c2029')}</div><div class="hs-msg"><span class="label">Nog niks gezien</span><b>Loop de straat af</b><p>Elke zoektocht kost ${SEARCH_EN} energie. Je weet nooit wat er om de hoek staat.</p></div></div>`;
 if(x.none)return `<div class="hunt-scene none"><div class="hs-loc"><i></i>${x.spot}</div><div class="hs-ghost">${carSvg('hatch','#1c2029')}</div><div class="hs-msg"><span class="label">Niks gevonden</span><b>${x.msg}</b></div></div>`;
 const m=findM(x),R=carRarity(m),t=carTier(m);
 return `<div class="hunt-scene car t${t} ${x.res||''}" style="--rc:${R[1]}"><div class="hs-loc"><i></i>${x.spot}</div>
  <div class="hs-car">${carSvg(m.b,x.c,{reflect:1,hl:1})}</div><span class="plate">${x.plate}</span>
  ${x.res==='ok'?'<span class="hs-stamp ok">Gestolen</span>':x.res==='fail'?'<span class="hs-stamp bad">Alarm</span>':x.res==='gone'?'<span class="hs-stamp">Weggereden</span>':x.res==='fled'?'<span class="hs-stamp bad">Gevlucht</span>':''}
  ${x.res?'':`<div class="hs-left"><span class="label">Staat er nog</span><b id="hsLeft">${fmtClock(x.until-now())}</b></div>`}</div>`}
function huntInfo(){const x=S.carFind;if(carSearch||!x||x.none)return `<div class="hunt-tip"><h3>Hoe werkt het?</h3><ul>
  <li>Je loopt de straat af en komt willekeurig een auto tegen. Rechts zie je de kans per model.</li>
  <li>Hoe zeldzamer de auto, hoe zwaarder het contact maken: meer sloten achter elkaar, minder tijd en <b class="rv">rode pijlen</b> die je andersom moet indrukken.</li>
  <li>Een vondst staat er een minuut. Laat je hem staan, dan zoek je verder.</li>
  <li>Rijvaardigheid (training) geeft je meer tijd per reeks en een betere prijs bij verkoop.</li>
  <li>Als groentje trillen je handen en word je vaker gezien. Hoe meer auto's je steelt en hoe hoger je rang, hoe rustiger het gaat. Je ervaring nu: <b>${carNerve().name}</b>.</li>
  <li>Mislukt? Niet altijd politie: belt een omstander 112 of gaat het alarm af in een lege straat, dan ben je vaak op tijd weg.</li></ul></div>`;
 const m=findM(x),R=carRarity(m),P=heistParams(m),t=carTier(m),sk=(S.skills&&S.skills.cars)||0;
 return `<div class="hunt-info"><div class="sc-head"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="hi-odd">Kans per zoektocht ${oddTxt(CAR_ODDS[m.id])}</span></div>
  <h3>${m.n}</h3>
  <div class="hi-val">${fmt(carSell(x.v))}<small>${sk?'incl. +'+Math.round(sk*SK.cars.price*100)+'% rijvaardigheid · ':''}model ${fmt(m.lo)} tot ${fmt(m.hi)}</small></div>
  <dl class="sc-spec"><div><dt>Bouwjaar</dt><dd>${x.year}</dd></div><div><dt>Kilometers</dt><dd>${kmTxt(x.km)}</dd></div><div><dt>Staat</dt><dd>${x.staat}</dd></div></dl>
  <div class="sc-diff" style="--rc:${R[1]}"><span class="label">Contact maken</span><div class="sc-bars">${[1,2,3,4,5,6].map(k=>`<i class="${k<=t?'on':''}"></i>`).join('')}</div><span class="sc-dtx">${heistTxt(P)}</span></div>
  <div class="sc-nerve n${P.nv.i}"><span class="label">Jouw ervaring</span><b>${P.nv.name}</b><span>${P.nv.time<1?'−'+Math.round((1-P.nv.time)*100)+'% tijd door trillende handen · ':''}${Math.round(P.wit*100)}% kans dat een voorbijganger je ziet</span></div></div>`}
function huntBtns(){const x=S.carFind,left=cdLeft('car'),full=S.cars.length>=GARAGE_MAX,jail=inJail(),live=x&&!x.none&&!x.res;let steal='';
 if(live){const m=findM(x),en=carEn(m),ok=!left&&!jail&&!full&&S.energy>=en;
  steal=`<button class="btn xl" onclick="act.stealCar()" ${ok?'':'disabled'}>${jail?'Je zit vast':full?'Garage vol, verkoop eerst':S.energy<en?'Te moe · '+en+' energie':'Stelen · '+en+' energie'}</button>`}
 const sOk=!carSearch&&!left&&!jail&&!full&&S.energy>=SEARCH_EN;
 const sl=carSearch?'Zoeken…':jail?'Je zit vast':left?'Even afkoelen · <span id="huntCd">'+fmtClock(left)+'</span>':full?'Garage vol, verkoop eerst':S.energy<SEARCH_EN?'Te moe om te zoeken':(live?'Laat staan, verder zoeken':'Zoek een auto')+' · '+SEARCH_EN+' energie';
 return `<div class="hunt-btns">${steal}<button class="btn ${live?'ghost':'xl'}" onclick="act.searchCar()" ${sOk?'':'disabled'}>${sl}</button></div>`}
function oddsList(){const dex=S.carDex||{},got=CARS.filter(m=>(dex[m.id]||[0,0])[1]>0).length,cur=S.carFind&&!S.carFind.res&&S.carFind.id;
 return `<details class="odds" ${oddsOpen?'open':''} ontoggle="oddsOpen=this.open"><summary><h2>Kans per zoektocht</h2><span>${got}/${CARS.length} verzameld</span></summary>
  <div class="od-list"><div class="od-none"><span>Niks gevonden</span><b>${oddTxt(FIND_TIER[0])}</b></div>
  ${[1,2,3,4,5,6].map(t=>{const R=tierName(t),ms=CARS.filter(m=>carTier(m)===t).sort((a,b)=>CAR_ODDS[b.id]-CAR_ODDS[a.id]);
   return `<div class="od-tier" style="--rc:${R[1]}"><div class="od-th"><b>${R[0]}</b><span>${oddTxt(FIND_TIER[t])}</span></div>
   ${ms.map(m=>{const d=dex[m.id]||[0,0];return `<div class="od-row ${d[1]?'got':''} ${cur===m.id?'now':''}"><span class="od-n">${m.n}</span><span class="od-v">${kTxt(m.lo)}–${kTxt(m.hi)}</span><b>${oddTxt(CAR_ODDS[m.id])}</b><i title="${d[1]?d[1]+'× gestolen':'Nog niet gestolen'}">${d[1]?'✓':''}</i></div>`}).join('')}</div>`}).join('')}</div></details>`}
// Bestellingen van de heler: elke speldag (4 uur) vraagt hij 3 modellen. Lever je zo'n auto af uit je garage,
// dan krijg je ×1,4 tot ×1,9 de waarde en wat straatcredit. Geeft een doel aan het verzamelen.
const ORD_TIER={1:.34,2:.34,3:.22,4:.1};
function carOrders(){const d=dayStart(now());if(S.orders&&S.orders.day===d)return S.orders;
 const pick=()=>{let r=Math.random(),t=1;for(const k of [1,2,3,4]){r-=ORD_TIER[k];if(r<=0){t=k;break}}const pool=CARS.filter(m=>carTier(m)===t);return pool[Math.floor(Math.random()*pool.length)]};
 const list=[];for(let g=0;list.length<3&&g<40;g++){const m=pick();if(!list.some(o=>o.id===m.id))list.push({id:m.id,k:+(1.4+Math.random()*.5).toFixed(2),done:0})}
 S.orders={day:d,list};return S.orders}
function ordersHtml(){const O=carOrders(),left=O.day+DAY_MS-now();
 return `<div class="tierhead"><h2>Bestellingen van de heler</h2><span>Lever een auto uit je garage af voor extra geld · nieuwe lijst over ${bkDur(left)}</span></div>
 <div class="ord-grid">${O.list.map((o,i)=>{const m=CARS.find(c=>c.id===o.id)||CARS[0],R=carRarity(m),have=S.cars.findIndex(c=>c.id===o.id),car=have>=0?S.cars[have]:null;
  return `<div class="ord ${o.done?'done':''}" style="--rc:${R[1]}"><div class="ord-car">${carSvg(m.b,'#3a404a')}</div><div class="ord-t"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><b>${m.n}</b><small>${o.done?'Afgeleverd':`×${o.k.toLocaleString('nl-NL')} de waarde${car?' · jij hebt hem: '+fmt(Math.round(car.v*o.k)):''}`}</small></div>
   ${o.done?'<em class="ord-ok">✓</em>':`<button class="btn sm ${car?'':'ghost'}" onclick="act.carOrder(${i})" ${car?'':'disabled'}>${car?'Afleveren':'Niet in je garage'}</button>`}</div>`}).join('')}</div>`}
V.cars=()=>{if(S.street)delete S.street;S.carDex=S.carDex||{};carExpire(true);const gv=S.cars.reduce((a,c)=>a+c.v,0);
 return `<h1>Auto's</h1><p class="sub">Zoek de straat af en kijk wat je tegenkomt. Een gewone Polo vind je zo, een Lamborghini bijna nooit. En als je er een vindt, moet je wel snel zijn.</p>
 <div class="car-modes" role="tablist"><button role="tab" class="${carMode==='zoek'?'on':''}" onclick="carMode='zoek';render()"><b>Straat afzoeken</b><span>Zoek, kies en kraak het slot</span></button><button role="tab" class="${carMode==='jack'?'on':''}" onclick="carMode='jack';render()"><b>Carjacken</b><span>${rankIdx(S.xp)<JACK_R?'Vanaf '+RANKS[JACK_R][0]:'Snel, maar heet en riskant'}</span></button></div>
 <div class="hunt-grid">${carMode==='jack'?jackSection():`<section class="hunt">${huntScene()}<div class="hunt-body">${huntInfo()}${huntBtns()}</div></section>`}</div>
 ${ordersHtml()}
 <div class="tierhead"><h2>Garage</h2><span>${S.cars.length} / ${GARAGE_MAX} · waarde ${fmt(gv)}</span></div>
 ${S.cars.length?`<div class="garage">${S.cars.map((c,i)=>{const m=CARS.find(k=>k.id===c.id)||CARS.find(k=>k.n===c.n)||{b:'hatch',d:1};
   return `<div class="gcar" style="--rc:${(carRarity(m)||CAR_RARITY[1])[1]}">${carSvg((m&&m.b)||c.b,c.c||'#8a929c')}<div class="g-n"><b>${c.n}${c.hot?'<i class="g-hot" title="Gejat bij het stoplicht: minder waard">heet</i>':''}</b><span>${c.year?c.year+' · '+kmTxt(c.km)+(c.staat?' · '+c.staat:''):'&nbsp;'}</span></div>
    <div class="g-s"><span class="gv">${fmt(c.v)}</span><button class="btn sm" onclick="act.sell(${i})">Verkoop</button>${S.family?`<button class="btn sm ghost g-fam" onclick="act.famCar(${i})" title="Afleveren bij ${famBase().n}: ${fmt(Math.round(c.v*.3))} en +${Math.round(2+Math.sqrt(c.v)/20)} eer">Familie</button>`:''}</div></div>`}).join('')}</div>
  <button class="btn" style="margin-top:10px;width:auto" onclick="act.sellAll()">Alles verkopen · ${fmt(gv)}</button>`:'<div class="card empty">Je garage is leeg. Zoek hierboven je eerste auto.</div>'}
 <div class="cars-odds">${oddsList()}</div>`};
// Eigen klok: aftellen zonder alles opnieuw te tekenen
let _carSig='';
setInterval(()=>{if(page!=='cars'||window.__chase||carSearch)return;if(carExpire()){render();return}const x=S.carFind;
 const sig=[cdLeft('jack')>0,carMode,cdLeft('car')>0,inJail(),S.cars.length>=GARAGE_MAX,S.energy>=SEARCH_EN,x&&x.id&&!x.res?S.energy>=carEn(findM(x)):0].join();
 if(_carSig&&sig!==_carSig){_carSig=sig;render();return}_carSig=sig;
 const a=document.getElementById('hsLeft');if(a&&x&&x.until)a.textContent=fmtClock(x.until-now());
 const c=document.getElementById('huntCd');if(c)c.textContent=fmtClock(cdLeft('car'));const j=document.getElementById('jackCd');if(j)j.textContent=fmtClock(cdLeft('jack'))},1000);
Object.assign(act,{
 carOrder(i){const O=carOrders(),o=O.list[i];if(!o||o.done)return;const at=S.cars.findIndex(c=>c.id===o.id);if(at<0)return;const c=S.cars.splice(at,1)[0];
  const pay=Math.round(c.v*o.k/10)*10,cr=2+Math.floor(carTier(CARS.find(m=>m.id===o.id)||{d:1})/2);o.done=1;S.cash+=pay;S.cred+=cr;S.stats.orders=(S.stats.orders||0)+1;
  toast(`${c.n} afgeleverd bij de heler: +${fmt(pay)} · +${cr} cred`,'lvl');log(`Bestelling: ${c.n} afgeleverd (+${fmt(pay)})`,'ok');save();render()},
 async searchCar(){if(carSearch||window.__chase||inJail()||cdLeft('car'))return;if(S.cars.length>=GARAGE_MAX){toast('Garage vol, verkoop eerst iets','bad');return}
  if(S.energy<SEARCH_EN){toast('Te moe om te zoeken','bad');return}
  S.energy-=SEARCH_EN;S.carFind=null;const spot=CAR_SPOTS[Math.floor(Math.random()*CAR_SPOTS.length)];carSearch={spot};S.stats.searches=(S.stats.searches||0)+1;
  save();SFX.click();if(page==='cars')render();
  await new Promise(r=>setTimeout(r,SEARCH_MS));
  const m=rollCar();carSearch=null;S.carDex=S.carDex||{};
  if(!m)S.carFind={none:1,spot,msg:NOTHING[Math.floor(Math.random()*NOTHING.length)]};
  else{S.carFind={...spawnCar(m,spot),until:now()+FIND_MS};const d=S.carDex[m.id]||[0,0];d[0]++;S.carDex[m.id]=d;const t=carTier(m);
   if(t>=5){SFX.big();toast((m.leg?'Mythische':'Legendarische')+' vondst: '+m.n+'!','lvl');log('Gespot: '+m.n,'ok')}else if(t>=3)SFX.pop()}
  save();if(page==='cars')render();else renderTop()},
 async stealCar(){const x=S.carFind;if(!x||x.none||x.res||inJail()||cdLeft('car')||window.__chase)return;if(carExpire()){render();return}
  const m=findM(x),en=carEn(m);if(S.energy<en){toast('Te moe','bad');return}if(S.cars.length>=GARAGE_MAX){toast('Garage vol, verkoop eerst iets','bad');return}
  S.energy-=en;S.cd.car=now()+carCd();S.pendingHeist={id:m.id};S.carFind={...x,res:'busy'};save();pushState();
  const r=await carHeist(x),ok=r===true;S.pendingHeist=null;
  // niet altijd politie: een omstander die 112 belt geeft je tijd om weg te komen, en niet elk alarm trekt meteen een agent aan
  const fled=!ok&&(r==='witness'||Math.random()>Math.min(.97,.55+m.d*.08+(m.leg?.2:0)));S.carFind={...x,res:ok?'ok':fled?'fled':'fail'};
  if(ok){const v=carSell(x.v);S.cars.push({id:m.id,n:m.n,v,b:m.b,c:x.c,year:x.year,km:x.km,staat:x.staat});S.stats.cars++;S.cred+=carTier(m)>=3?2:1;
    addHeat(m.d*2);addXp(6+m.d*m.d*4+(m.leg?200:0));if(typeof famEv==='function')famEv('car',{v});const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d;
    toast(m.n+' gestolen! Waarde '+fmt(v),m.d>=5?'lvl':'ok');log(m.n+' gestolen ('+fmt(v)+')','ok');save();render()}
  else if(fled){addHeat(2+m.d);const w=r==='witness';S.stats.carFled=(S.stats.carFled||0)+1;
    log(`Mislukt: ${m.n}. ${w?'Een omstander belde 112, maar je bent op tijd weggekomen':'Het alarm ging af, maar je was weg voordat er iemand kwam'}`,'bad');save();render();
    toast(w?'Mislukt. Een omstander belde 112, maar je bent op tijd weggekomen.':'Mislukt. Het alarm gaat af, maar je bent weg voordat er iemand komt.','bad')}
  else{addHeat(4+m.d*2);log('Mislukte poging: '+m.n,'bad');save();render();
    arrest(30+m.d*20,'Alarm!','Het alarm van de '+m.n+' gaat af. '+FLEE_LEVELS[Math.min(5,m.d)].where,{flee:Math.min(5,Math.max(1,m.d))})}}});
