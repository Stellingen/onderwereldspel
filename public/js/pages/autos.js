// Tab: Auto's — zoek de straat af, kom willekeurig een auto tegen en probeer hem te stelen. Daaronder je garage.
// Garage: 2 plekken, uit te bouwen tot 10 (wit geld). Bestaande spelers met meer auto's krijgen meteen genoeg plek.
const GARAGE_CAPS=[2,4,6,8,10],GARAGE_UP=[0,25000,90000,300000,900000],GARAGE_MAX=10;
const garageLvl=()=>{if(S.garage==null){let l=0;while(l<GARAGE_CAPS.length-1&&GARAGE_CAPS[l]<S.cars.length)l++;S.garage=l}return S.garage};
const garageCap=()=>GARAGE_CAPS[garageLvl()];
const SEARCH_EN=2,SEARCH_MS=1700,FIND_MS=60000;
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
// Zoekt de heler dit model vandaag? Dan laten we dat meteen zien bij een vondst of bij het stoplicht.
const helerWants=id=>{try{const o=carOrders().list.find(o=>o.id===id&&!o.done);return o||null}catch(e){return null}};
const helerBadge=id=>{const o=helerWants(id);return o?`<div class="hs-order"><b>De heler zoekt deze auto</b><span>Steel hem en lever hem af voor ×${o.k.toLocaleString('nl-NL')} de waarde</span></div>`:''};
function huntScene(){const x=S.carFind;
 if(carSearch)return `<div class="hunt-scene searching"><div class="beam"></div><div class="hs-msg"><span class="label">Aan het zoeken</span><b>${carSearch.spot}</b><div class="hs-prog"><i style="animation-duration:${SEARCH_MS}ms"></i></div></div></div>`;
 if(!x)return `<div class="hunt-scene idle"><div class="hs-ghost">${carSvg('sedan','#1c2029')}</div><div class="hs-msg"><span class="label">Nog niks gezien</span><b>Loop de straat af</b><p>Elke zoektocht kost ${SEARCH_EN} energie. Je weet nooit wat er om de hoek staat.</p></div></div>`;
 if(x.none)return `<div class="hunt-scene none"><div class="hs-loc"><i></i>${x.spot}</div><div class="hs-ghost">${carSvg('hatch','#1c2029')}</div><div class="hs-msg"><span class="label">Niks gevonden</span><b>${x.msg}</b></div></div>`;
 const m=findM(x),R=carRarity(m),t=carTier(m);
 return `<div class="hunt-scene car t${t} ${x.res||''}" style="--rc:${R[1]}"><div class="hs-loc"><i></i>${x.spot}</div>
  ${helerBadge(m.id)}<div class="hs-car">${carSvg(m.b,x.c,{reflect:1,hl:1})}</div><span class="plate">${x.plate}</span>
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
function huntBtns(){const x=S.carFind,left=cdLeft('car'),full=S.cars.length>=garageCap(),jail=inJail(),live=x&&!x.none&&!x.res;let steal='';
 if(live){const m=findM(x),en=carEn(m),ok=!left&&!jail&&!full&&S.energy>=en;
  steal=`<button class="btn xl" onclick="act.stealCar()" ${ok?'':'disabled'}>${jail?'Je zit vast':full?'Garage vol, verkoop eerst':S.energy<en?'Te moe · '+en+' energie':'Stelen · '+en+' energie'}</button>`}
 const sOk=!carSearch&&!left&&!jail&&!full&&S.energy>=SEARCH_EN;
 const sl=carSearch?'Zoeken…':jail?'Je zit vast':left?'Even afkoelen · <span id="huntCd">'+fmtClock(left)+'</span>':full?'Garage vol, verkoop eerst':S.energy<SEARCH_EN?'Te moe om te zoeken':(live?'Laat staan, verder zoeken':'Zoek een auto')+' · '+SEARCH_EN+' energie';
 return `<div class="hunt-btns">${steal}<button class="btn ${live?'ghost':'xl'}" onclick="act.searchCar()" ${sOk?'':'disabled'}>${sl}</button></div>`}
function oddsList(){const dex=S.carDex||{},got=CARS.filter(m=>(dex[m.id]||[0,0])[1]>0).length,cur=S.carFind&&!S.carFind.res&&S.carFind.id;
 return `<div class="dex-top"><div><span class="label">Verzameld</span><b>${got} / ${CARS.length}</b></div><div class="dex-bar"><i style="width:${got/CARS.length*100}%"></i></div><div><span class="label">Niks gevonden</span><b>${oddTxt(FIND_TIER[0])}</b></div></div>
  ${[1,2,3,4,5,6].map(t=>{const R=tierName(t),ms=CARS.filter(m=>carTier(m)===t).sort((a,b)=>CAR_ODDS[b.id]-CAR_ODDS[a.id]),gt=ms.filter(m=>(dex[m.id]||[0,0])[1]>0).length;
   return `<section class="dex-tier" style="--rc:${R[1]}"><div class="dex-th"><h3>${R[0]}</h3><span>${oddTxt(FIND_TIER[t])} per zoektocht · ${gt}/${ms.length} verzameld</span></div>
   <div class="dex-grid">${ms.map(m=>{const d=dex[m.id]||[0,0],o=helerWants(m.id);return `<div class="dex-card ${d[1]?'got':''} ${cur===m.id?'now':''}">
    <div class="dex-car">${carSvg(m.b,d[1]?(CAR_COLORS[m.d]||['#8a929c'])[0]:'#2a2f38')}</div>
    <div class="dex-t"><b>${m.n}</b><span>${kTxt(m.lo)} – ${kTxt(m.hi)}</span></div>
    <div class="dex-f"><em>${oddTxt(CAR_ODDS[m.id])}</em>${d[1]?`<i class="ok">✓ ${d[1]}× gestolen</i>`:d[0]?`<i>${d[0]}× gezien</i>`:'<i>nog niet gezien</i>'}${o?'<i class="hl">heler zoekt hem</i>':''}</div></div>`}).join('')}</div></section>`}).join('')}`}
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
// ---------- Verkopen via kopers, het autokerkhof en de garage ----------
// Verkopen: een koper doet een bod rond de gemiddelde prijs (soms flink eronder, soms erboven). Per speluur (10 min) krijg je
// 3 biedingen; wijs je ze alle drie af, dan wacht je op het volgende speluur. Netjes verkocht = wit geld, contant of op je bank.
// Auto's die als gestolen zijn opgegeven (rep) kan niemand kopen: die kunnen alleen naar het autokerkhof (zwart geld voor de onderdelen).
const GHOUR=DAY_MS/24,SALE_TRIES=3,SLOOP_P=80000,SLOOP_R=3,SLOOP_K=.6;
const BUYERS=['Henk uit Purmerend','Een opkoper uit Antwerpen','Sandra, leaseklant','Mo van de autohandel','Een student uit Delft','Gerrit, verzamelaar','Een Pool met een trailer','Jamal uit Lelystad','Een tandarts uit het Gooi','Familie Bakker'];
const carRep=c=>c.rep!=null?!!c.rep:!!c.hot;
const carNew=c=>{const m=CARS.find(k=>k.id===c.id);return m?Math.round(m.hi*1.7/500)*500:Math.round(c.v*2/500)*500};
const saleWin=()=>Math.floor(now()/GHOUR);
const saleS=()=>{const w=saleWin();if(!S.carSale||S.carSale.w!==w)S.carSale={w,n:0};return S.carSale};
const saleLeft=()=>Math.max(0,SALE_TRIES-saleS().n);
function newOffer(c){const f=+(0.68+Math.random()*.42).toFixed(3);saleS().n++;c.offer={f,who:BUYERS[Math.floor(Math.random()*BUYERS.length)],bank:Math.random()<.5,t:now()}}
const offerAmt=c=>Math.round(c.v*c.offer.f/10)*10;
let carSaleIdx=null;
function carSaleHtml(i){const c=S.cars[i];if(!c)return '';const left=saleLeft(),o=c.offer,amt=o?offerAmt(c):0,diff=o?Math.round((o.f-1)*100):0;
 return `<div class="cs-panel"><div class="cs-prices"><div><span class="label">Gemiddelde verkoopprijs</span><b>${fmt(c.v)}</b></div><div><span class="label">Nieuwprijs</span><b>${fmt(carNew(c))}</b></div><div><span class="label">Biedingen dit speluur</span><b>${left} over</b></div></div>
  ${o?`<div class="cs-offer ${diff>=0?'hi':diff<-15?'lo':''}"><div class="cs-who"><span class="label">Bod van</span><b>${o.who}</b><small>${o.bank?'Maakt het over naar je bank':'Betaalt contant'} · wit geld</small></div>
   <div class="cs-amt"><b>${fmt(amt)}</b><em>${diff>=0?'+':''}${diff}% t.o.v. gemiddeld</em></div></div>
   <div class="cs-btns"><button class="btn" onclick="act.carAccept(${i})">Accepteren · ${fmt(amt)}</button>${left?`<button class="btn ghost" onclick="act.carReject(${i})">Weigeren, volgende koper</button>`:`<button class="btn ghost" disabled>Nieuwe kopers over ${fmtClock(GHOUR-(now()%GHOUR))}</button>`}</div>`
  :`<div class="cs-btns"><button class="btn" onclick="act.carOffer(${i})" ${left?'':'disabled'}>${left?'Kopers zoeken':'Nieuwe kopers over '+fmtClock(GHOUR-(now()%GHOUR))}</button></div>`}
  <p class="cs-note">Je krijgt ${SALE_TRIES} biedingen per speluur (10 minuten). Wijs je ze af, dan wacht je op het volgende speluur.</p></div>`}
// kleine taferelen voor de banners
const caArt=(k,html)=>`<span class="ca-sc ${k}">${html||''}</span>`;
function carLobby(){const ri=rankIdx(S.xp),cap=garageCap(),gv=S.cars.reduce((a,c)=>a+c.v,0),rep=S.cars.filter(carRep).length,O=carOrders(),od=O.list.filter(o=>!o.done&&S.cars.some(c=>c.id===o.id)).length;
 const best=S.cars.slice().sort((a,b)=>b.v-a.v)[0],bm=best&&(CARS.find(k=>k.id===best.id)||{b:'sedan'});
 const b=(k,col,kind,title,desc,facts,go,art,dis)=>`<button class="bzb car-b" style="--c:${col}" onclick="carMode='${k}';render();window.scrollTo({top:0,behavior:'smooth'})" ${dis?'disabled':''}>
  <span class="bzb-art" aria-hidden="true">${art}</span><span class="bzb-t"><span class="bzb-k">${kind}</span><b>${title}</b><span class="bzb-d">${desc}</span><span class="bzb-f">${facts}</span><span class="bzb-go">${go}</span></span></button>`;
 return `<h1>Auto's</h1>
 <div class="bzb-grid">
  ${b('zoek','#7fd1c7','Stelen','Straat afzoeken','Kijk wat er geparkeerd staat. Een Polo vind je zo, een Lamborghini bijna nooit.',`<em>${cdLeft('car')?'nog '+fmtClock(cdLeft('car')):'klaar'}</em><em><b>${SEARCH_EN}</b> energie</em>`,'Op pad ›',caArt('street',carSvg('hatch','#5a6270')))}
  ${b('jack','#ff5c6c','Stelen','Carjacken','Bij het stoplicht, portier open en gas erop. Snel, maar heet.',ri<JACK_R?`<em>vanaf ${RANKS[JACK_R][0]}</em>`:`<em>${cdLeft('jack')?'nog '+fmtClock(cdLeft('jack')):'klaar'}</em><em><b>${JACK_EN}</b> energie</em>`,'Naar het stoplicht ›',caArt('light',carSvg('sedan','#7a1424')+'<i class="tl"><i></i><i></i><i></i></i>'))}
  ${b('garage','#ffad6b','Jouw garage','Garage',`${S.cars.length} van ${cap} plekken${cap<10?' · uit te breiden tot 10':''}. Verkopen aan kopers die bieden.`,`<em><b>${fmt(gv)}</b> waarde</em>${rep?`<em class="dn"><b>${rep}</b> gemeld als gestolen</em>`:''}`,'Openen ›',typeof bzArt==='function'?bzArt({id:'cg',col:'#ffad6b',icp:ICONS.cars,kind:'garage'},'cag'):'')}
  ${b('sloop','#c9a227','Onderdelen · zwart geld','Het Autokerkhof',S.sloop?'Je eigen sloperij. Hier gaat elke auto weg, ook als hij als gestolen is gemeld.':`Koop een sloperij en verkoop auto's als onderdelen. Ook gemelde auto's raak je hier kwijt.`,S.sloop?`<em><b>${Math.round(SLOOP_K*100)}%</b> van de waarde</em><em>zwart geld</em>`:`<em>${ri<SLOOP_R?'vanaf '+RANKS[SLOOP_R][0]:fmt(SLOOP_P)}</em>`,S.sloop?'Openen ›':'Bekijken ›',caArt('yard','<i class="stack"><i></i><i></i><i></i></i>'+carSvg('van','#4a4f57')))}
  ${b('heler','#b8a1ff','Op bestelling','De heler',`Elke speldag vraagt hij drie modellen, en betaalt er ×1,4 tot ×1,9 voor.`,`<em><b>${O.list.filter(o=>!o.done).length}</b> open</em>${od?`<em class="up"><b>${od}</b> in je garage</em>`:''}`,'Bekijken ›',caArt('van',carSvg('van','#2f3640')))}
 </div>
 <button class="dex-bn" onclick="carMode='dex';render();window.scrollTo({top:0,behavior:'smooth'})"><span><span class="label">Collectie en kansen</span><b>${CARS.filter(m=>((S.carDex||{})[m.id]||[0,0])[1]>0).length} van de ${CARS.length} modellen gestolen</b><small>Bekijk per model hoe groot de kans is en wat hij waard is</small></span><i>›</i></button>`}
function carBack(t){return `<div class="vb-bar"><button class="vb-back" onclick="carMode=null;carSaleIdx=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Auto's</span></button><h2>${t}</h2></div>`}
function garageView(){const L=garageLvl(),cap=garageCap(),nx=GARAGE_CAPS[L+1],gv=S.cars.reduce((a,c)=>a+c.v,0);
 return `${carBack('Garage')}
 <section class="gar-up card"><div><span class="label">Plekken</span><div class="gar-slots">${Array.from({length:10},(_,i)=>`<i class="${i<S.cars.length?'f':i<cap?'o':''}"></i>`).join('')}</div><small>${S.cars.length} van ${cap} bezet · waarde ${fmt(gv)}</small></div>
  ${nx?`<button class="btn ${wit()>=GARAGE_UP[L+1]?'gold':'ghost'}" onclick="act.garageUp()" ${wit()>=GARAGE_UP[L+1]?'':'disabled'}>Uitbouwen naar ${nx} plekken · ${fmt(GARAGE_UP[L+1])}</button>`:'<span class="gar-max">Je garage is maximaal: 10 plekken</span>'}</section>
 ${S.cars.length?`<div class="garage g2">${S.cars.map((c,i)=>{const m=CARS.find(k=>k.id===c.id)||CARS.find(k=>k.n===c.n)||{b:'hatch',d:1},rep=carRep(c),open=carSaleIdx===i;
   return `<div class="gcar ${open?'open':''}" style="--rc:${(carRarity(m)||CAR_RARITY[1])[1]}">${carSvg((m&&m.b)||c.b,c.c||'#8a929c')}<div class="g-n"><b>${c.n}${c.hot?'<i class="g-hot" title="Gejat bij het stoplicht: minder waard">heet</i>':''}${rep?'<i class="g-rep" title="Als gestolen opgegeven: alleen via het autokerkhof">gemeld</i>':''}</b><span>${c.year?c.year+' · '+kmTxt(c.km)+(c.staat?' · '+c.staat:''):'&nbsp;'}</span></div>
    <div class="g-s"><span class="gv">${fmt(c.v)}</span>${rep?'':`<button class="btn sm" onclick="carSaleIdx=${open?'null':i};render()">${open?'Sluiten':'Verkopen'}</button>`}${S.sloop?`<button class="btn sm ghost" onclick="act.carSloop(${i})" title="Onderdelen: ${fmt(Math.round(c.v*SLOOP_K))} zwart">Slopen</button>`:''}${S.family?`<button class="btn sm ghost g-fam" onclick="act.famCar(${i})" title="Afleveren bij ${famBase().n}: ${fmt(Math.round(c.v*.3))} en +${Math.round(2+Math.sqrt(c.v)/20)} eer">Familie</button>`:''}</div>
    ${rep&&!S.sloop?'<div class="g-note">Als gestolen gemeld: geen koper wil hem. Alleen het autokerkhof, de heler of je familie.</div>':''}
    ${open?carSaleHtml(i):''}</div>`}).join('')}</div>`:'<div class="card empty">Je garage is leeg. Zoek de straat af voor je eerste auto.</div>'}`}
function sloopView(){const ri=rankIdx(S.xp);
 if(!S.sloop)return `${carBack('Het Autokerkhof')}<section class="card sl-buy"><div class="sl-art">${caArt('yard','<i class="stack"><i></i><i></i><i></i></i>'+carSvg('van','#4a4f57'))}</div>
  <div><h3>Een eigen sloperij</h3><p class="sub">Een terrein vol wrakken, een pers en een man die onderdelen per stuk verkoopt. Elke auto gaat hier weg voor ${Math.round(SLOOP_K*100)}% van de waarde, in zwart geld. Ook auto's die als gestolen zijn opgegeven.</p>
   <button class="btn gold" onclick="act.buySloop()" ${ri>=SLOOP_R&&wit()>=SLOOP_P?'':'disabled'}>${ri<SLOOP_R?'Vanaf '+RANKS[SLOOP_R][0]:wit()<SLOOP_P?'Nog '+fmt(SLOOP_P-wit())+' wit nodig':'Koop het autokerkhof · '+fmt(SLOOP_P)}</button></div></section>`;
 const parts=[['Motor',.24],['Versnellingsbak',.1],['Velgen en banden',.08],['Elektronica',.1],['Plaatwerk',.05],['Interieur',.03]];
 return `${carBack('Het Autokerkhof')}<p class="sub">Elke auto uit je garage gaat hier uit elkaar. Je krijgt zwart geld voor de onderdelen: ${Math.round(SLOOP_K*100)}% van de waarde.</p>
 ${S.cars.length?`<div class="sl-list">${S.cars.map((c,i)=>{const m=CARS.find(k=>k.id===c.id)||{b:'hatch'};return `<div class="sl-row">${carSvg(m.b||c.b,c.c||'#8a929c')}<div><b>${c.n}${carRep(c)?' <i class="g-rep">gemeld</i>':''}</b><small>${parts.map(([n,k])=>n+' '+fmt(Math.round(c.v*k))).join(' · ')}</small></div><button class="btn sm" onclick="act.carSloop(${i})">Slopen · ${fmt(Math.round(c.v*SLOOP_K))}</button></div>`}).join('')}</div>
  <button class="btn ghost" style="width:auto;margin-top:10px" onclick="act.sloopAll()">Alles slopen · ${fmt(Math.round(S.cars.reduce((a,c)=>a+c.v,0)*SLOOP_K))} zwart</button>`:'<div class="card empty">Je garage is leeg.</div>'}`}
V.cars=()=>{if(S.street)delete S.street;S.carDex=S.carDex||{};carExpire(true);
 if(carMode==='zoek'||carMode==='jack')return `${carBack(carMode==='jack'?'Carjacken':'Straat afzoeken')}<div class="hunt-grid">${carMode==='jack'?jackSection():`<section class="hunt">${huntScene()}<div class="hunt-body">${huntInfo()}${huntBtns()}</div></section>`}</div>`;
 if(carMode==='garage')return garageView();
 if(carMode==='sloop')return sloopView();
 if(carMode==='heler')return `${carBack('De heler')}${ordersHtml()}`;
 if(carMode==='dex')return `${carBack('Collectie en kansen')}${oddsList()}`;
 return carLobby()};
// Eigen klok: aftellen zonder alles opnieuw te tekenen
let _carSig='';
setInterval(()=>{if(page!=='cars'||window.__chase||carSearch)return;if(carExpire()){render();return}const x=S.carFind;
 const sig=[cdLeft('jack')>0,carMode,typeof saleLeft==='function'?saleLeft():0,cdLeft('car')>0,inJail(),S.cars.length>=garageCap(),S.energy>=SEARCH_EN,x&&x.id&&!x.res?S.energy>=carEn(findM(x)):0].join();
 if(_carSig&&sig!==_carSig){_carSig=sig;render();return}_carSig=sig;
 const a=document.getElementById('hsLeft');if(a&&x&&x.until)a.textContent=fmtClock(x.until-now());
 const c=document.getElementById('huntCd');if(c)c.textContent=fmtClock(cdLeft('car'));const j=document.getElementById('jackCd');if(j)j.textContent=fmtClock(cdLeft('jack'))},1000);
Object.assign(act,{
 garageUp(){const L=garageLvl();if(L>=GARAGE_CAPS.length-1)return;const c=GARAGE_UP[L+1];if(wit()<c){toast('Je garage uitbouwen betaal je met wit geld','bad');return}spendWit(c);S.garage=L+1;SFX.win(3);toast('Garage uitgebouwd: '+GARAGE_CAPS[L+1]+' plekken','lvl');log('Garage uitgebouwd naar '+GARAGE_CAPS[L+1]+' plekken ('+fmt(c)+')','info');save();render()},
 carOffer(i){const c=S.cars[i];if(!c||carRep(c))return;if(!saleLeft()){toast('Wacht op nieuwe kopers','bad');return}newOffer(c);SFX.click();save();render()},
 carReject(i){const c=S.cars[i];if(!c)return;delete c.offer;if(!saleLeft()){save();render();return}newOffer(c);save();render()},
 carAccept(i){const c=S.cars[i];if(!c||!c.offer)return;const a=offerAmt(c),bank=c.offer.bank,who=c.offer.who;S.cars.splice(i,1);carSaleIdx=null;
  if(bank)S.bank+=a;else S.cash+=a;SFX.win(3);toast(`${c.n} verkocht aan ${who}: ${fmt(a)} ${bank?'op je bank':'contant'} (wit)`,'ok');log(`${c.n} verkocht aan ${who} voor ${fmt(a)} (${bank?'overgemaakt':'contant'})`,'ok');save();render()},
 buySloop(){if(S.sloop||rankIdx(S.xp)<SLOOP_R)return;if(wit()<SLOOP_P){toast('Het autokerkhof koop je met wit geld','bad');return}spendWit(SLOOP_P);S.sloop=1;SFX.big();toast('Het Autokerkhof is van jou','lvl');log('Autokerkhof gekocht ('+fmt(SLOOP_P)+')','info');save();render()},
 carSloop(i){const c=S.cars[i];if(!c||!S.sloop)return;const a=Math.round(c.v*SLOOP_K);S.cars.splice(i,1);carSaleIdx=null;S.cash+=a;addZwart(a);SFX.chip();toast(`${c.n} gesloopt: ${fmt(a)} zwart voor de onderdelen`,'ok');log(`${c.n} gesloopt (${fmt(a)} zwart)`,'info');save();render()},
 sloopAll(){if(!S.sloop||!S.cars.length)return;const a=Math.round(S.cars.reduce((x,c)=>x+c.v,0)*SLOOP_K);const n=S.cars.length;S.cars=[];carSaleIdx=null;S.cash+=a;addZwart(a);SFX.big();toast(`${n} auto's gesloopt: ${fmt(a)} zwart`,'ok');log(`${n} auto's gesloopt (${fmt(a)} zwart)`,'info');save();render()},
 carOrder(i){const O=carOrders(),o=O.list[i];if(!o||o.done)return;const at=S.cars.findIndex(c=>c.id===o.id);if(at<0)return;const c=S.cars.splice(at,1)[0];
  const pay=Math.round(c.v*o.k/10)*10,cr=2+Math.floor(carTier(CARS.find(m=>m.id===o.id)||{d:1})/2);o.done=1;S.cash+=pay;addZwart(pay);S.cred+=cr;S.stats.orders=(S.stats.orders||0)+1;
  toast(`${c.n} afgeleverd bij de heler: +${fmt(pay)} · +${cr} cred`,'lvl');log(`Bestelling: ${c.n} afgeleverd (+${fmt(pay)})`,'ok');save();render()},
 async searchCar(){if(carSearch||window.__chase||inJail()||cdLeft('car'))return;if(S.cars.length>=garageCap()){toast('Garage vol, verkoop eerst iets','bad');return}
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
  const m=findM(x),en=carEn(m);if(S.energy<en){toast('Te moe','bad');return}if(S.cars.length>=garageCap()){toast('Garage vol, verkoop eerst iets','bad');return}
  S.energy-=en;S.cd.car=now()+carCd();S.pendingHeist={id:m.id};S.carFind={...x,res:'busy'};save();pushState();
  const r=await carHeist(x),ok=r===true;S.pendingHeist=null;
  // niet altijd politie: een omstander die 112 belt geeft je tijd om weg te komen, en niet elk alarm trekt meteen een agent aan
  const fled=!ok&&(r==='witness'||Math.random()>Math.min(.97,.55+m.d*.08+(m.leg?.2:0)));S.carFind={...x,res:ok?'ok':fled?'fled':'fail'};
  if(ok){const v=carSell(x.v);S.cars.push({id:m.id,n:m.n,v,b:m.b,c:x.c,year:x.year,km:x.km,staat:x.staat,rep:Math.random()<(.12+carTier(m)*.05)?1:0});S.stats.cars++;S.cred+=carTier(m)>=3?2:1;
    addHeat(m.d*2);addXp(6+m.d*m.d*4+(m.leg?200:0));if(typeof famEv==='function')famEv('car',{v});const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d;
    toast(m.n+' gestolen! Waarde '+fmt(v),m.d>=5?'lvl':'ok');log(m.n+' gestolen ('+fmt(v)+')','ok');save();render()}
  else if(fled){addHeat(2+m.d);const w=r==='witness';S.stats.carFled=(S.stats.carFled||0)+1;
    log(`Mislukt: ${m.n}. ${w?'Een omstander belde 112, maar je bent op tijd weggekomen':'Het alarm ging af, maar je was weg voordat er iemand kwam'}`,'bad');save();render();
    toast(w?'Mislukt. Een omstander belde 112, maar je bent op tijd weggekomen.':'Mislukt. Het alarm gaat af, maar je bent weg voordat er iemand komt.','bad')}
  else{addHeat(4+m.d*2);log('Mislukte poging: '+m.n,'bad');save();render();
    arrest(30+m.d*20,'Alarm!','Het alarm van de '+m.n+' gaat af. '+FLEE_LEVELS[Math.min(5,m.d)].where,{flee:Math.min(5,Math.max(1,m.d))})}}});
