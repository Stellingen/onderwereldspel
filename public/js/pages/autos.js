// Tab: Auto's — zoek de straat af, kom willekeurig een auto tegen en probeer hem te stelen. Daaronder je garage.
// Garage: 2 plekken, uit te bouwen tot 10 (wit geld). Bestaande spelers met meer auto's krijgen meteen genoeg plek.
const GARAGE_CAPS=[2,4,6,8,10],GARAGE_UP=[0,25000,90000,300000,900000],GARAGE_MAX=GAME_CONST.garageMax;
const garageLvl=()=>{if(S.garage==null){let l=0;while(l<GARAGE_CAPS.length-1&&GARAGE_CAPS[l]<S.cars.length)l++;S.garage=l}return S.garage};
const garageCap=()=>GARAGE_CAPS[garageLvl()];
const SEARCH_EN=2,SEARCH_MS=1700,FIND_MS=60000;
// Zoeken maakt moe: elke zoektocht in een reeks kost meer energie (SRCH_COST). Na SRCH_MAX zoektochten (gewoon / VIP / High roller)
// moet je SRCH_CD minuten uitrusten; daarna begin je weer bij 2. Zoek je zo lang niet, dan ben je ook weer uitgerust.
const SRCH_MAX=[6,10,15],SRCH_CD=[8,6,4],SRCH_COST=[2,3,4,5,6,8,10,12,14,17,20,23,26,30,34];
const srchMax=()=>SRCH_MAX[tier()]||SRCH_MAX[0],srchCdMs=()=>(SRCH_CD[tier()]||SRCH_CD[0])*60000;
function srch(){const h=S.carHunt||(S.carHunt={n:0,last:0,until:0}),t=now();
 if(h.n>=srchMax()&&!h.until)h.until=h.last+srchCdMs();
 if(h.until&&t>=h.until){h.n=0;h.until=0}else if(!h.until&&h.n&&t-h.last>=srchCdMs())h.n=0;
 return h}
const srchCost=()=>SRCH_COST[Math.min(srch().n,SRCH_COST.length-1)];
const srchLeft=()=>{const h=srch();return h.until?Math.max(0,h.until-now()):0};
function srchStam(){const h=srch(),mx=srchMax(),left=srchLeft(),cd=SRCH_CD[tier()]||SRCH_CD[0];
 return `<div class="hunt-stam${left?' rest':''}"><div class="hst-h"><span class="label">Conditie</span><span class="hst-t">${left?'Uitrusten · <b id="srchCd">'+fmtClock(left)+'</b>':h.n?`Nog <b>${mx-h.n}</b> van ${mx} · daarna ${cd} min rust`:`<b>${mx}</b> zoektochten, daarna ${cd} min rust`}</span></div>
  <div class="hst-pips" style="--n:${mx}">${Array.from({length:mx},(_,i)=>`<i class="${i<h.n?'used':''}${i===h.n&&!left?' next':''}"><em>${SRCH_COST[i]}</em></i>`).join('')}</div>
  <p>${left?'Je bent moe gelopen. Even zitten, dan kun je weer.':h.n?`Volgende zoektocht kost <b>${srchCost()} energie</b>. Hoe vaker je achter elkaar zoekt, hoe moeier je wordt. Zoek je ${cd} minuten niet, dan begin je weer bij 2.`:'De eerste zoektocht kost 2 energie. Elke volgende kost meer, want je wordt moe.'}</p></div>`}
const carEn=m=>4+m.d*2+(m.leg?4:0);
// Kans per zoektocht per zeldzaamheid (0 = niks gevonden, 6 = mythisch) schuift mee met je kracht als autodief (carPow:
// 80% steelervaring, 20% rang): FIND0 als groentje, FIND1 als legende. Binnen een groep telt het gewicht (w) van het model,
// keer de klasse (carClassW): de dure klassen (k 1 en 2 in CARS) zie je vaker naarmate je ervarener bent; onder hun rang
// (Ritselaar / Kapitein) minder vaak. Gewone straatauto's zie je als ervaren dief iets minder vaak (je loopt ze voorbij).
const FIND0={0:.18,1:.47,2:.22,3:.085,4:.032,5:.011,6:.002},FIND1={0:.10,1:.22,2:.25,3:.21,4:.13,5:.07,6:.02};
const lerpT=(A,B,p)=>{const o={};for(const t in A)o[t]=A[t]+((B[t]||0)-A[t])*p;return o};
const findTier=p=>lerpT(FIND0,FIND1,p==null?carPow():p);
const CLASS_R={1:RANKS.findIndex(r=>r[0]==='Ritselaar'),2:RANKS.findIndex(r=>r[0]==='Kapitein')};
const CLASS_N={1:'Ritselaar t/m Huurmoordenaar',2:'Kapitein t/m Peetvader'};
function carClassW(m,p,ri){const k=m.k||0;if(!k)return 1-.45*p;const gate=ri>=CLASS_R[k]?1:k===1?.35:.25;return (k===1?.12+1.5*p:.03+1.9*p*p)*gate}
const tierName=t=>t===6?CAR_MYTH:CAR_RARITY[t];
// kans per model voor jou nu (of voor een andere kracht p / rang ri / tabel T); boost = extra gewicht voor de dure klassen (carjacken)
let _oddsC={};
function carOdds(p,ri,T,boost){p=p==null?carPow():p;ri=ri==null?rankIdx(S.xp):ri;T=T||findTier(p);boost=boost||1;
 const key=[p.toFixed(3),ri,boost,JSON.stringify(T)].join('|');if(_oddsC.key===key)return _oddsC.o;
 const W=m=>m.w*carClassW(m,p,ri)*(m.k?boost:1),sum={},o={};CARS.forEach(m=>{const t=carTier(m);sum[t]=(sum[t]||0)+W(m)});
 CARS.forEach(m=>{const t=carTier(m);o[m.id]=(T[t]||0)*W(m)/sum[t]});_oddsC={key,o};return o}
// kies een model: eerst de zeldzaamheid (tabel T), dan binnen die groep op gewicht × klasse
function pickCar(T,boost){const p=carPow(),ri=rankIdx(S.xp);boost=boost||1;let r=Math.random(),t=1;const ks=Object.keys(T).map(Number).sort((a,b)=>a-b);
 for(const k of ks){r-=T[k];if(r<=0){t=k;break}t=k}if(!t)return null;
 const W=m=>m.w*carClassW(m,p,ri)*(m.k?boost:1),pool=CARS.filter(m=>carTier(m)===t);let w=Math.random()*pool.reduce((a,m)=>a+W(m),0);
 for(const m of pool){w-=W(m);if(w<=0)return m}return pool[0]}
// Steelervaring als blok (lobby, straat en stoplicht). mini = alleen de kop en de balk.
function cxpHtml(mini){const l=cxpLvl(),x=carXp(),nx=CXP_LV[l],a=CXP_LV[l-1],pct=nx?Math.min(100,(x-a)/(nx-a)*100):100,T=findTier(),hi=T[4]+T[5]+T[6];
 return `<section class="cxp${mini?' mini':''}"><div class="cxp-h"><span class="label">Steelervaring</span><b>${CAR_LV[l-1]}</b><em>level ${l} van ${CXP_LV.length} · ${Math.floor(x)} punten</em></div>
  <div class="cxp-steps">${CXP_LV.map((t,i)=>`<i class="${i<l-1?'done':i===l-1?'now':''}" title="${CAR_LV[i]}: vanaf ${t} punten"></i>`).join('')}</div>
  ${mini?'':`<div class="cxp-bar"><i style="width:${pct}%"></i></div>
  <p class="cxp-next">${nx?`Nog <b>${Math.ceil(nx-x)}</b> punten tot <b>${CAR_LV[l]}</b>. Elke gestolen auto telt (straat en stoplicht): gewoon 1, zeldzaam en episch 2, legendarisch 3, mythisch 4.`:'Hoogste level: niemand kraakt een auto zo snel als jij.'}</p>
  <div class="cxp-odds">${[3,4,5,6].map(t=>{const R=tierName(t);return `<span style="--rc:${R[1]}"><small>${R[0]}</small><b>${oddTxt(T[t])}</b></span>`}).join('')}<span class="cxp-tot"><small>Episch of beter</small><b>${oddTxt(hi)}</b></span></div>
  <p class="cxp-note">Hoe ervarener, hoe vaker je dure auto's tegenkomt en hoe meer tijd je krijgt bij het contact maken. Je rang helpt een beetje.</p>`}</section>`}
const oddTxt=p=>{const v=p*100;return (v>=10?v.toFixed(0):v>=1?v.toFixed(1):v.toFixed(2)).replace('.',',')+'%'};
const kTxt=n=>n>=1e6?'€'+(n/1e6).toLocaleString('nl-NL',{maximumFractionDigits:1})+' mln':n>=1000?'€'+(n/1000).toLocaleString('nl-NL',{maximumFractionDigits:1})+'k':'€'+n;
const kmTxt=k=>k.toLocaleString('nl-NL')+' km';
const NOTHING=['Alleen een bakfiets en een scootmobiel.','Overal camera\'s. Je loopt maar door.','Een buurtwacht kijkt je na. Niks te halen.',
 'Een roestige caravan zonder wielen.','Alles staat met een stuurslot vast.','Een taxi met de chauffeur er nog in.','Een lege parkeerplaats en een boze kat.'];
const rollCar=()=>pickCar(findTier());
// Eén gevonden auto: eigen bouwjaar, kilometerstand, staat, kleur, kenteken en straatwaarde binnen de prijsklasse van het model
function spawnCar(m,spot){const [y0,y1]=m.y,year=y0+Math.floor(Math.random()*(y1-y0+1)),age=y1>y0?(y1-year)/(y1-y0):0;
 const km=Math.round((age*160000+4000+Math.random()*36000)/100)*100;
 const ST=[['Slecht',.72,.16],['Redelijk',.88,.36],['Goed',1,.34],['Nieuwstaat',1.08,.14]];let r=Math.random(),st=ST[2];for(const x of ST){r-=x[2];if(r<=0){st=x;break}}
 const base=m.lo+(m.hi-m.lo)*(.55*(1-age)+.45*(1-Math.min(1,km/220000)));
 const v=Math.max(Math.round(m.lo*.7/50)*50,Math.min(Math.round(m.hi*1.08/50)*50,Math.round(base*st[1]/50)*50));
 const pal=CAR_COLORS[m.d];return {id:m.id,spot,year,km,staat:st[0],v,c:Math.random()<.4?carSig(m):pal[Math.floor(Math.random()*pal.length)],plate:randPlate()}}
const carSell=v=>Math.round(v*(1+((S.skills&&S.skills.cars)||0)*SK.cars.price)*(1+famPerk('car'))*(1+fitFx('car'))/10)*10;
let carSearch=null,oddsOpen=false;
const findM=x=>CARS.find(k=>k.id===x.id)||CARS[0];
function carExpire(quiet){const x=S.carFind;if(x&&x.until&&!x.res&&x.until<now()){S.carFind={...x,res:'gone'};if(!quiet)toast('De eigenaar komt terug. De '+findM(x).n+' rijdt weg.','bad');save();return true}return false}
// Zoekt de heler dit model vandaag? Dan laten we dat meteen zien bij een vondst of bij het stoplicht.
const helerWants=id=>{try{const o=carOrders().list.find(o=>o.id===id&&!o.done&&!o.hired);return o||null}catch(e){return null}};
const helerBadge=id=>{const o=helerWants(id);return o?`<div class="hs-order"><b>De heler zoekt deze auto</b><span>Steel hem en lever hem af voor ×${o.k.toLocaleString('nl-NL')} de waarde</span></div>`:''};
function huntScene(){const x=S.carFind;
 if(carSearch)return `<div class="hunt-scene searching"><div class="beam"></div><div class="hs-msg"><span class="label">Aan het zoeken</span><b>${carSearch.spot}</b><div class="hs-prog"><i style="animation-duration:${SEARCH_MS}ms"></i></div></div></div>`;
 if(!x)return `<div class="hunt-scene idle"><div class="hs-ghost">${carSvg('sedan','#1c2029')}</div><div class="hs-msg"><span class="label">Nog niks gezien</span><b>Loop de straat af</b><p>De eerste zoektocht kost ${SRCH_COST[0]} energie, daarna steeds meer. Je weet nooit wat er om de hoek staat.</p></div></div>`;
 if(x.none)return `<div class="hunt-scene none"><div class="hs-loc"><i></i>${x.spot}</div><div class="hs-ghost">${carSvg('hatch','#1c2029')}</div><div class="hs-msg"><span class="label">Niks gevonden</span><b>${x.msg}</b></div></div>`;
 const m=findM(x),R=carRarity(m),t=carTier(m);
 return `<div class="hunt-scene car t${t} ${x.res||''}" style="--rc:${R[1]}"><div class="hs-loc"><i></i>${x.spot}</div>
  ${x.res==='ok'?'':helerBadge(m.id)}<div class="hs-car">${carSvg(m.b,x.c,{reflect:1,hl:1})}</div><span class="plate">${x.plate}</span>
  ${x.res==='ok'?'<span class="hs-stamp ok">Gestolen</span>':x.res==='fail'?'<span class="hs-stamp bad">Alarm</span>':x.res==='gone'?'<span class="hs-stamp">Weggereden</span>':x.res==='fled'?'<span class="hs-stamp bad">Gevlucht</span>':''}
  ${x.res?'':`<div class="hs-left"><span class="label">Staat er nog</span><b id="hsLeft">${fmtClock(x.until-now())}</b></div>`}</div>`}
function huntInfo(){const x=S.carFind;if(carSearch||!x||x.none)return `<div class="hunt-tip"><h3>Hoe werkt het?</h3><ul>
  <li>Je loopt de straat af en komt willekeurig een auto tegen. Rechts zie je de kans per model.</li>
  <li>Hoe zeldzamer de auto, hoe zwaarder het contact maken: meer sloten achter elkaar, minder tijd en <b class="rv">rode pijlen</b> die je andersom moet indrukken.</li>
  <li>Een vondst staat er een minuut. Laat je hem staan, dan zoek je verder.</li>
  <li>Rijvaardigheid (training) geeft je meer tijd per reeks en een betere prijs bij verkoop.</li>
  <li>Elke gestolen auto geeft <b>steelervaring</b> (ook bij het stoplicht). Hoe ervarener, hoe vaker je dure auto's ziet en hoe meer tijd je krijgt. Een dure auto als groentje? Bijna onmogelijk. Jij bent nu: <b>${carNerve().name}</b> (level ${cxpLvl()}).</li>
  <li>Mislukt? Niet altijd politie: belt een omstander 112 of gaat het alarm af in een lege straat, dan ben je vaak op tijd weg.</li></ul></div>`;
 const m=findM(x),R=carRarity(m),P=heistParams(m),t=carTier(m),sk=(S.skills&&S.skills.cars)||0;
 return `<div class="hunt-info"><div class="sc-head"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="hi-odd">Kans per zoektocht ${oddTxt(carOdds()[m.id])}</span></div>
  <h3>${m.n}</h3>
  <div class="hi-val">${fmt(carSell(x.v))}<small>${sk?'incl. +'+Math.round(sk*SK.cars.price*100)+'% rijvaardigheid · ':''}model ${fmt(m.lo)} tot ${fmt(m.hi)}</small></div>
  <dl class="sc-spec"><div><dt>Bouwjaar</dt><dd>${x.year}</dd></div><div><dt>Kilometers</dt><dd>${kmTxt(x.km)}</dd></div><div><dt>Staat</dt><dd>${x.staat}</dd></div></dl>
  <div class="sc-diff" style="--rc:${R[1]}"><span class="label">Contact maken</span><div class="sc-bars">${[1,2,3,4,5,6].map(k=>`<i class="${k<=t?'on':''}"></i>`).join('')}</div><span class="sc-dtx">${heistTxt(P)}</span></div>
  <div class="sc-nerve n${P.nv.i} ${P.rel<=-1?'hard':P.rel>=1?'easy':''}"><span class="label">Jouw steelervaring · level ${P.nv.lvl} · aanbevolen ${P.req}</span><b>${P.nv.name}</b><span>${P.rel<=-1?'Te zwaar voor je: ':P.rel>=1?'Makkelijk voor je: ':''}${relTime(P.rel)*P.nv.time<.995?'−'+Math.round((1-relTime(P.rel)*P.nv.time)*100)+'% tijd':'+'+Math.round((relTime(P.rel)*P.nv.time-1)*100)+'% tijd'} · ${Math.round(P.wit*100)}% kans dat een voorbijganger je ziet</span></div></div>`}
function huntBtns(){const x=S.carFind,left=cdLeft('car'),full=S.cars.length>=garageCap(),jail=inJail(),live=x&&!x.none&&!x.res;let steal='';
 if(live){const m=findM(x),en=carEn(m),ok=!left&&!jail&&!full&&S.energy>=en;
  steal=`<button class="btn xl" onclick="act.stealCar()" ${ok?'':'disabled'}>${jail?'Je zit vast':full?'Garage vol, verkoop eerst':S.energy<en?'Te moe · '+en+' energie':'Stelen · '+en+' energie'}</button>`}
 const rest=srchLeft(),en=srchCost(),sOk=!carSearch&&!left&&!rest&&!jail&&!full&&S.energy>=en;
 const sl=carSearch?'Zoeken…':jail?'Je zit vast':rest?'Uitrusten · <span id="huntRest">'+fmtClock(rest)+'</span>':left?'Even afkoelen · <span id="huntCd">'+fmtClock(left)+'</span>':full?'Garage vol, verkoop eerst':S.energy<en?'Te moe · '+en+' energie nodig':(live?'Laat staan, verder zoeken':'Zoek een auto')+' · '+en+' energie';
 const got=x&&x.res==='ok'?carGotHtml('zoek'):'';
 return `${got}<div class="hunt-btns">${steal}<button class="btn ${live||got?'ghost':'xl'}" onclick="act.searchCar()" ${sOk?'':'disabled'}>${got&&sOk?'Zoek nog een auto · '+en+' energie':sl}</button></div>${srchStam()}`}
// Eigen kleur per model (zoals je hem het vaakst ziet) en het soort auto, zodat je in de collectie meteen ziet wat het is
const CAR_SIG={p918:'#c9ced6',p1:'#ff8a12',spectre:'#2b2f3a',laf:'#d0102a',huayra:'#2a6dd8',amgone:'#c7ccd3',panda:'#e8c547',corsa:'#d9483b',yaris:'#e6e1d6',clio:'#f08a24',p208:'#3a6fd8',picanto:'#7fd1c7',polo:'#c9cfd6',c3:'#d8a23a',
 golf:'#c81e2c',focus:'#2f6fe0',leon:'#8a929c',a3:'#1f2a44',octavia:'#5fb34a',mini:'#2f6b4a',v60:'#a9b4c2',gr86:'#e8e4da',
 m3:'#2f9ad8',c63:'#50565f',tesla:'#e9edf2',rs6:'#7d838d',rr:'#2a2f38',macan:'#b8333a',x5m:'#1c3d6e',
 911:'#e8c547','r8':'#e9edf2',taycan:'#6a4bd6',g63:'#1c1d22',mase:'#2a3f8a',bent:'#2f4f3a',db12:'#5a6b4a',
 hura:'#a8e04a',urus:'#f2b21a',f8:'#c81e2c',mc720:'#f08a24',cull:'#3a2a4a',sf90:'#d01c2c',chiron:'#1f4fd8',jesko:'#e9edf2',
 transporter:'#e9edf2',prius:'#f2c230',i30:'#5a8ac8',sprinter:'#d9dde2',xc90:'#3a4a5a',mustang:'#2f6fe0',raptor:'#f08a24',challenger:'#7a2be0',
 sklasse:'#15171c',e280:'#c9b48a',limo:'#e9edf2',etype:'#2f5a3a',phantom:'#3a1f2a',
 m5:'#2b4f7a',rs7:'#6d737c',e63:'#1c1d22',gtr:'#c9ced6',z06:'#e8c547',cayenne:'#3a3f47',lc500:'#b8333a',defender:'#5a6b4a',
 gt3rs:'#3fa86b',amggt:'#ff8a12',vantage:'#2f5f4a',m8:'#14306b',maybach:'#2b2f3a',ghost:'#e6e1d6',emira:'#e8c547',bentayga:'#4a2f2a',dbx:'#7a1f2a',
 f296:'#d0102a',revuelto:'#7c3aed',f812:'#c81e2c',senna:'#f08a24',cullbb:'#111318',g650:'#e9edf2',nevera:'#2a6dd8',sl300:'#c0c6cc',miura:'#f2b21a',
 f40:'#d0102a',sp3:'#d01c2c',utopia:'#2f5f4a',valkyrie:'#1f4f3a',speedtail:'#5a6b7a',divo:'#1c3d6e',mistral:'#3a2a4a'};
const CAR_KIND=b=>({city:'Stadsauto',hatch:'Hatchback',hot:'Hot hatch',sedan:'Sedan',estate:'Stationwagen',liftback:'Liftback',coupe:'Coupé',sport:'Sportwagen',gt:'Gran turismo',
 suv:'SUV',cross:'Crossover',supersuv:'Super-SUV',offroad:'Terreinwagen',luxsuv:'Luxe-SUV',luxury:'Luxe sedan',super:'Supercar',hyper:'Hypercar',muscle:'Muscle car',pickup:'Pick-up',van:'Bestelbus',limo:'Limousine',classic:'Klassieker'})[String(b).replace(/\d+$/,'')]||'Auto';
const carSig=m=>CAR_SIG[m.id]||(CAR_COLORS[m.d]||['#8a929c'])[0];
function oddsList(){const dex=S.carDex||{},got=CARS.filter(m=>(dex[m.id]||[0,0])[1]>0).length,cur=S.carFind&&!S.carFind.res&&S.carFind.id,FT=findTier(),OD=carOdds();
 return `<div class="dex-top"><div><span class="label">Verzameld</span><b>${got} / ${CARS.length}</b></div><div class="dex-bar"><i style="width:${got/CARS.length*100}%"></i></div><div><span class="label">Niks gevonden</span><b>${oddTxt(FT[0])}</b></div></div>
  ${cxpHtml(1)}<p class="sub dex-note">De kansen hieronder zijn voor jou nu (${carNerve().name}, ${RANKS[rankIdx(S.xp)][0]}). Met meer steelervaring schuiven ze op naar de dure auto's.</p>
  ${[1,2,3,4,5,6].map(t=>{const R=tierName(t),ms=CARS.filter(m=>carTier(m)===t).sort((a,b)=>OD[b.id]-OD[a.id]),gt=ms.filter(m=>(dex[m.id]||[0,0])[1]>0).length;
   return `<section class="dex-tier" style="--rc:${R[1]}"><div class="dex-th"><h3>${R[0]}</h3><span>${oddTxt(FT[t])} per zoektocht · aanbevolen level ${CXP_REQ[t]} · ${gt}/${ms.length} verzameld</span></div>
   <div class="dex-grid">${ms.map(m=>{const d=dex[m.id]||[0,0],o=helerWants(m.id);return `<div class="dex-card ${d[1]?'got':''} ${cur===m.id?'now':''}">
    <div class="dex-car">${carSvg(m.b,carSig(m))}</div>
    <div class="dex-t"><b>${m.n}</b><small class="dex-k">${CAR_KIND(m.b)}${m.k?' · <i class="dex-cl k'+m.k+'" title="Vaker te zien met meer steelervaring">'+CLASS_N[m.k]+'</i>':''}</small><span>${kTxt(m.lo)} – ${kTxt(m.hi)}</span></div>
    <div class="dex-f"><em>${oddTxt(OD[m.id])}</em>${d[1]?`<i class="ok">✓ ${d[1]}× gestolen</i>`:d[0]?`<i>${d[0]}× gezien</i>`:'<i>nog niet gezien</i>'}${o?'<i class="hl">heler zoekt hem</i>':''}</div></div>`}).join('')}</div></section>`}).join('')}`}
// Bestellingen van de heler: elke speldag (4 uur) een nieuwe lijst. Lever je zo'n auto af uit je garage, dan betaalt hij
// een veelvoud van de waarde en krijg je straatcredit. Hoe meer je levert, hoe hoger je niveau bij hem (S.heler.n = leveringen):
// meer bestellingen, hogere bedragen, een deel in wit geld, een spoedorder (×3) en uiteindelijk neemt hij elke auto aan.
const HELER_LV=[
 {n:'Kennis',need:0,ord:3,k:[1.4,1.9],wit:0,T:{1:.34,2:.34,3:.22,4:.1},p:'3 bestellingen per speldag, ×1,4 tot ×1,9 de waarde'},
 {n:'Vaste klant',need:5,ord:4,k:[1.5,2.0],wit:0,T:{1:.28,2:.34,3:.25,4:.13},p:'4 bestellingen, ×1,5 tot ×2,0'},
 {n:'Partner',need:15,ord:4,k:[1.6,2.1],wit:.25,T:{1:.2,2:.32,3:.3,4:.15,5:.03},p:'25% van het geld krijg je wit, soms een supercar op de lijst'},
 {n:'Rechterhand',need:35,ord:5,k:[1.7,2.2],wit:.3,spoed:1,T:{1:.15,2:.3,3:.32,4:.18,5:.05},p:'5 bestellingen en elke speldag een spoedorder voor ×3'},
 {n:'Compagnon',need:70,ord:5,k:[1.8,2.4],wit:.4,spoed:1,any:1.1,T:{1:.1,2:.28,3:.34,4:.21,5:.07},p:'40% wit en hij neemt elke auto aan voor ×1,1'},
 {n:'Vertrouweling',need:120,ord:6,k:[1.9,2.5],wit:.45,spoed:1,any:1.15,T:{1:.06,2:.22,3:.34,4:.26,5:.12},p:'6 bestellingen, ×1,9 tot ×2,5, 45% wit, elke auto ×1,15'},
 {n:'Bloedbroeder',need:200,ord:7,k:[2.0,2.7],wit:.5,spoed:1,any:1.2,T:{1:.04,2:.18,3:.32,4:.3,5:.16},p:'7 bestellingen, ×2,0 tot ×2,7, de helft wit, elke auto ×1,2'}];
// Band met de heler (S.heler.b): groeit met elke levering. Een gewone auto +1, episch of beter +2, een spoedorder nog +1 extra.
// Laat je een auto halen door iemand die je inhuurt, dan groeit de band maar met een half punt. Bestaande spelers: band = leveringen.
const helerN=()=>{if(!S.heler)S.heler={n:(S.stats&&S.stats.orders)||0};return S.heler.n};
const helerB=()=>{helerN();if(S.heler.b==null)S.heler.b=S.heler.n;return S.heler.b};
const helerLv=()=>{const n=helerB();let l=0;HELER_LV.forEach((x,i)=>{if(n>=x.need)l=i});return l};
const helerGain=(m,spoed)=>1+(carTier(m)>=4?1:0)+(spoed?1:0);
// dure klassen pas op de lijst als je de rang hebt (anders vraagt hij een Revuelto aan een Gangster)
const classOk=(m,ri)=>!m.k||(ri==null?rankIdx(S.xp):ri)>=CLASS_R[m.k];
// Inhuren (vanaf Gangster): iemand haalt een gevraagde auto voor je op. Jij krijgt 70% van wat de heler betaalt, hij 30%.
// Wachttijd 6 min + 4 min per zeldzaamheid (× lidmaatschap), kans op mislukken 5% + 2% per zeldzaamheid − 1% per niveau bij de heler
// (minimaal 3%). Eén tegelijk, vanaf Compagnon twee. Spoedorders wil de heler van jou zelf. S.helerJobs = lopende klussen.
const HIRE_R=RANKS.findIndex(r=>r[0]==='Gangster'),HIRE_CUT=.3;
const HIRE_WHO=['Sjonnie de Sleutel','Kleine Ricardo','Mo Taxi','De Belg','Yasmina R.','Frenkie Fluit','Stille Willem','Dre van de Overkant','Tante Truus','Nico Stilletto'];
const hireMs=m=>Math.round((6+carTier(m)*4)*60000*waitK());
const hireFail=m=>Math.max(.03,.05+carTier(m)*.02-helerLv()*.01);
const hireMax=()=>helerLv()>=4?2:1;
const helerJobs=()=>(S.helerJobs=Array.isArray(S.helerJobs)?S.helerJobs:[]);
const HIRE_FAIL=['werd gepakt bij het contact maken','vond hem nergens in de stad','reed hem total loss op de A10','ging er zelf vandoor met de auto'];
function helerJobsTick(quiet){const J=helerJobs();if(!J.length)return false;let ch=false;
 for(const j of J.slice()){if(j.until>now())continue;J.splice(J.indexOf(j),1);ch=true;const m=CARS.find(k=>k.id===j.id)||CARS[0],O=S.orders&&S.orders.day===j.day?S.orders:null,o=O&&O.list[j.oi]&&O.list[j.oi].id===j.id?O.list[j.oi]:null;
  if(o)delete o.hired;if(o&&o.done){toast(`${j.who} kwam met de ${m.n}, maar de heler had hem al. Geen geld.`,'bad');continue}
  if(Math.random()<j.fail){const why=HIRE_FAIL[Math.floor(Math.random()*HIRE_FAIL.length)];toast(`${j.who} ${why}. Geen ${m.n} voor de heler.`,'bad');log(`Inhuren mislukt: ${j.who} ${why} (${m.n})`,'bad');continue}
  const L=HELER_LV[helerLv()],v=spawnCar(m,'').v,pay=Math.round(v*j.k*(1-HIRE_CUT)/10)*10,w=Math.round(pay*(L.wit||0));S.cash+=pay;addZwart(pay-w);
  if(o)o.done=1;const lv0=helerLv();helerN();S.heler.n++;S.heler.b=helerB()+.5;S.stats.orders=(S.stats.orders||0)+1;S.stats.hired=(S.stats.hired||0)+1;
  const up=helerLv()>lv0;toast(`${j.who} leverde de ${m.n} af bij de heler: +${fmt(pay)} voor jou (70%)${w?' · '+fmt(w)+' wit':''}`+(up?` · je bent nu ${HELER_LV[helerLv()].n}!`:''),'lvl');
  log(`Ingehuurd: ${j.who} leverde de ${m.n} af (+${fmt(pay)}, 70%)`,'ok')}
 if(ch){save();if(quiet)return ch;if(typeof page!=='undefined'&&page==='cars')render();else if(typeof renderTop==='function')renderTop()}return ch}
setInterval(()=>{if(typeof S!=='undefined'&&S&&S.helerJobs&&S.helerJobs.length&&!window.__chase)helerJobsTick()},3000);
function carOrders(){const d=dayStart(now());if(S.orders&&S.orders.day===d)return S.orders;const L=HELER_LV[helerLv()],ri=rankIdx(S.xp);
 const pick=()=>{let r=Math.random(),t=1;for(const k of Object.keys(L.T)){r-=L.T[k];if(r<=0){t=+k;break}}const pool=CARS.filter(m=>carTier(m)===t&&classOk(m,ri));return pool[Math.floor(Math.random()*pool.length)]};
 const list=[];for(let g=0;list.length<L.ord&&g<60;g++){const m=pick();if(m&&!list.some(o=>o.id===m.id))list.push({id:m.id,k:+(L.k[0]+Math.random()*(L.k[1]-L.k[0])).toFixed(2),done:0})}
 if(L.spoed){const pool=CARS.filter(m=>carTier(m)>=3&&carTier(m)<=4&&classOk(m,ri)&&!list.some(o=>o.id===m.id)),m=pool[Math.floor(Math.random()*pool.length)];if(m)list.push({id:m.id,k:3,spoed:1,done:0})}
 S.orders={day:d,list,lv:helerLv()};return S.orders}
function helerHtml(){const lv=helerLv(),L=HELER_LV[lv],nx=HELER_LV[lv+1],n=helerN(),b=helerB(),pct=nx?Math.min(100,(b-L.need)/(nx.need-L.need)*100):100,bt=x=>Math.floor(x*2)/2;
 return `<section class="hl-lv"><div class="hl-lv-h"><span class="label">Jouw band met de heler</span><b>${L.n}</b><em>niveau ${lv+1} van ${HELER_LV.length} · band ${bt(b).toLocaleString('nl-NL')} · ${n} auto${n===1?'':'\'s'} geleverd</em></div>
  <div class="hl-steps n${HELER_LV.length}">${HELER_LV.map((x,i)=>`<i class="${i<lv?'done':i===lv?'now':''}" title="${x.n}: vanaf band ${x.need}"><b>${i+1}</b><span>${x.n}</span></i>`).join('')}</div>
  ${nx?`<div class="hl-bar"><i style="width:${pct}%"></i></div><p class="hl-next">Nog <b>${bt(nx.need-b).toLocaleString('nl-NL')}</b> band tot <b>${nx.n}</b>: ${nx.p}.</p>`:'<p class="hl-next">Hoogste niveau: hij vertrouwt je alles toe.</p>'}
  <p class="hl-how">De band groeit met elke levering: een gewone auto +1, episch of beter +2, spoedorder +1 extra. Laat je hem halen door iemand die je inhuurt, dan +½.</p>
  <div class="hl-perk"><span class="label">Nu</span>${L.p}${L.wit?` · ${Math.round(L.wit*100)}% wit`:''}</div></section>`}
// Inhuren: uitleg en lopende klussen
function hireHtml(){const ri=rankIdx(S.xp),J=helerJobs();
 if(ri<HIRE_R)return `<section class="hire lock"><span class="label">Iemand inhuren</span><b>Vanaf ${RANKS[HIRE_R][0]}</b><p>Dan laat je een gevraagde auto door iemand anders stelen en afleveren. Jij krijgt 70% van wat de heler betaalt.</p></section>`;
 return `<section class="hire"><div class="hire-h"><span class="label">Iemand inhuren · ${J.length}/${hireMax()} bezig</span><b>Laat een bestelling halen</b></div>
  <p>Geen tijd of geen zin? Een kennis steelt de gevraagde auto en levert hem af. De heler betaalt hem, jij krijgt <b>70%</b>, hij houdt 30%. Dat duurt even (6 tot 26 minuten) en soms gaat het mis: dan krijg je niks, maar kun je het opnieuw proberen. Spoedorders wil de heler van jou zelf.</p>
  ${J.length?`<div class="hire-jobs">${J.map(j=>{const m=CARS.find(k=>k.id===j.id)||CARS[0];return `<div class="hire-job"><span class="hj-who">${esc(j.who)}</span><b>${m.n}</b><em>klaar over <b class="js-cd" data-until="${j.until}">${bkDur(j.until-now())}</b></em></div>`}).join('')}</div>`:''}</section>`}
function ordersHtml(){const O=carOrders(),L=HELER_LV[helerLv()],next=O.day+DAY_MS,canHire=rankIdx(S.xp)>=HIRE_R,free=helerJobs().length<hireMax();
 const any=L.any?S.cars.map((c,i)=>[c,i]).filter(([c])=>!O.list.some(o=>o.id===c.id&&!o.done)):[];
 return `${helerHtml()}${hireHtml()}
 <div class="tierhead"><h2>Bestellingen van vandaag</h2><span class="hl-cd">Nieuwe lijst over <b class="js-cd" data-until="${next}">${bkDur(next-now())}</b></span></div>
 <div class="ord-grid">${O.list.map((o,i)=>{const m=CARS.find(c=>c.id===o.id)||CARS[0],R=carRarity(m),have=S.cars.findIndex(c=>c.id===o.id),car=have>=0?S.cars[have]:null,est=Math.round((m.lo+m.hi)/2*o.k*(1-HIRE_CUT)/10)*10,job=o.hired&&helerJobs().find(j=>j.day===O.day&&j.oi===i);
  const hire=!o.done&&!car&&!o.spoed&&canHire?(job?`<span class="ord-job">${esc(job.who)} is onderweg · <b class="js-cd" data-until="${job.until}">${bkDur(job.until-now())}</b></span>`
   :`<button class="btn sm ghost ord-hire" onclick="act.helerHire(${i})" ${free?'':'disabled'} title="${Math.round(hireMs(m)/60000)} min · ${Math.round(hireFail(m)*100)}% kans dat het misgaat">${free?`Laat halen · ±${kTxt(est)} (70%)`:'Al iemand onderweg'}</button>`):'';
  return `<div class="ord ${o.done?'done':''} ${o.spoed?'spoed':''} ${job?'busy':''}" style="--rc:${R[1]}">${o.spoed?'<span class="ord-sp">Spoed ×3</span>':''}<div class="ord-car">${carSvg(m.b,'#3a404a')}</div><div class="ord-t"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><b>${m.n}</b><small>${o.done?'Afgeleverd':`×${o.k.toLocaleString('nl-NL')} de waarde${car?' · jij hebt hem: '+fmt(Math.round(car.v*o.k)):' · '+kTxt(Math.round(m.lo*o.k))+'–'+kTxt(Math.round(m.hi*o.k))}`}${!o.done&&!car&&canHire&&!o.spoed&&!job?` · ${Math.round(hireMs(m)/60000)} min, ${Math.round(hireFail(m)*100)}% risico`:''}</small></div>
   <div class="ord-btns">${o.done?'<em class="ord-ok">✓</em>':job?'':`<button class="btn sm ${car?'':'ghost'}" onclick="act.carOrder(${i})" ${car?'':'disabled'}>${car?'Afleveren':'Niet in je garage'}</button>`}${hire}</div></div>`}).join('')}</div>
 ${any.length?`<div class="tierhead"><h2>Ook welkom</h2><span>Als ${L.n.toLowerCase()} neemt hij elke auto aan voor ×${String(L.any).replace('.',',')} de waarde</span></div>
  <div class="ord-grid">${any.map(([c,i])=>{const m=CARS.find(k=>k.id===c.id)||CARS[0];return `<div class="ord"><div class="ord-car">${carSvg(m.b,c.c||'#3a404a')}</div><div class="ord-t"><b>${esc(c.n)}</b><small>waarde ${fmt(c.v)}</small></div><button class="btn sm" onclick="act.carHelerAny(${i})">Verkopen · ${fmt(Math.round(c.v*L.any/10)*10)}</button></div>`}).join('')}</div>`:''}`}
// aftellers (heler-lijst) elke seconde bijwerken zonder de pagina opnieuw te tekenen
setInterval(()=>{document.querySelectorAll('.js-cd[data-until]').forEach(e=>{const l=+e.dataset.until-now();e.textContent=l>0?bkDur(l):'nu'})},1000);
// ---------- Verkopen via kopers, het autokerkhof en de garage ----------
// Verkopen: een koper doet een bod rond de gemiddelde prijs (soms flink eronder, soms erboven). Per speluur (10 min) krijg je
// 3 biedingen; wijs je ze alle drie af, dan wacht je op het volgende speluur. Netjes verkocht = wit geld, contant of op je bank.
// Auto's die als gestolen zijn opgegeven (rep) kan niemand kopen: die kunnen alleen naar het autokerkhof (zwart geld voor de onderdelen).
const GHOUR=DAY_MS/24,SALE_TRIES=3,SLOOP_P=80000,SLOOP_R=RK[3];
// Sloop-ervaring (S.sloopN = gesloopte auto's): hoe vaker je sloopt, hoe minder schade aan de onderdelen en hoe minder kosten
// (pers, afvoer, een hulpje). Onderdelen zijn samen 80% van de waarde; per level minder schade (30% → 6%) en kosten (6% → 2%).
// Netto: Prutser ±50%, Monteur ±60%, Meestersloper ±73% van de waarde. Wie het autokerkhof al had, begint als Demonteur (±64%).
const SLOOP_LV=[['Prutser',0],['Sleutelaar',5],['Monteur',15],['Demonteur',35],['Vakman',70],['Meestersloper',120]];
const SLOOP_DMG=[.30,.25,.20,.15,.10,.06],SLOOP_COST=[.06,.05,.045,.04,.03,.02],SLOOP_GROSS=.8;
const SLOOP_PARTS=[['Motor',.32],['Versnellingsbak',.13],['Velgen en banden',.11],['Elektronica',.13],['Plaatwerk',.07],['Interieur',.04]];
const sloopN=()=>{if(S.sloopN==null)S.sloopN=S.sloop?35:0;return S.sloopN};
const sloopLv=()=>{const n=sloopN();let l=0;SLOOP_LV.forEach((x,i)=>{if(n>=x[1])l=i});return l};
const sloopK=l=>{l=l==null?sloopLv():l;return SLOOP_GROSS*(1-SLOOP_DMG[l])-SLOOP_COST[l]};
const sloopEst=c=>Math.round(c.v*sloopK()/10)*10;
// één auto slopen: per onderdeel een eigen schade rond je gemiddelde (0,4× tot 1,6×)
function sloopRoll(c){const l=sloopLv(),parts=SLOOP_PARTS.map(([n,k])=>{const g=c.v*k,d=Math.min(.9,SLOOP_DMG[l]*(.4+Math.random()*1.2));return {n,g:Math.round(g),d,net:Math.round(g*(1-d))}});
 const cost=Math.round(c.v*SLOOP_COST[l]),net=Math.max(0,Math.round((parts.reduce((a,p)=>a+p.net,0)-cost)/10)*10);return {c,parts,cost,net}}
let sloopLast=null;
const BUYERS=['Henk uit Purmerend','Een opkoper uit Antwerpen','Sandra, leaseklant','Mo van de autohandel','Een student uit Delft','Gerrit, verzamelaar','Een Pool met een trailer','Jamal uit Lelystad','Een tandarts uit het Gooi','Familie Bakker'];
const carRep=c=>c.rep!=null?!!c.rep:!!c.hot;
const carNew=c=>{const m=CARS.find(k=>k.id===c.id);return m?Math.round(m.hi*1.7/500)*500:Math.round(c.v*2/500)*500};
const saleWin=()=>Math.floor(now()/GHOUR);
const saleS=()=>{const w=saleWin();if(!S.carSale||S.carSale.w!==w)S.carSale={w,n:0};return S.carSale};
const saleLeft=()=>Math.max(0,SALE_TRIES-saleS().n);
function newOffer(c){const f=+(0.68+Math.random()*.42).toFixed(3);saleS().n++;c.offer={f,who:BUYERS[Math.floor(Math.random()*BUYERS.length)],bank:Math.random()<.5,t:now()}}
const offerAmt=c=>Math.round(c.v*c.offer.f/10)*10;
let carSaleIdx=null;
// Net gestolen (straat afzoeken of carjacken): kies zelf of je naar je garage gaat, hem meteen bij de heler aflevert
// (als die dit model zoekt) of teruggaat naar het overzicht. carGot.car is de auto zelf, zodat precies die wordt afgeleverd.
let carGot=null,carFresh=null;
// na het stelen: het keuzevak in beeld schuiven (op de telefoon staat het onder de uitleg)
function carGotShow(){setTimeout(()=>{const el=document.querySelector('.got-box');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},120)}
function carGotHtml(src){const g=carGot;if(!g||g.src!==src||now()-g.t>15*60000)return '';const ci=S.cars.indexOf(g.car);if(ci<0)return '';
 const c=g.car,o=helerWants(c.id),oi=o?carOrders().list.indexOf(o):-1,pay=o?Math.round(c.v*o.k/10)*10:0;
 return `<div class="got-box ${o?'heler':''}"><div class="got-h"><span class="label">Gestolen</span><b>${esc(c.n)} staat in je garage</b><em>Waarde ${fmt(c.v)}${c.hot?' · heet':''}${carRep(c)?' · gemeld als gestolen':''}</em></div>
  ${o?`<p class="got-hl">De heler zoekt precies deze auto en betaalt <b>×${o.k.toLocaleString('nl-NL')}</b> de waarde, in zwart geld.</p>`:''}
  <div class="got-btns">${o?`<button class="btn got-sell" onclick="act.carGotHeler(${oi})">Verkoop direct aan de heler · ${fmt(pay)}</button>`:''}
   <button class="btn ${o?'ghost':''}" onclick="act.carGotGo('garage')">Naar je garage</button>
   <button class="btn ghost" onclick="act.carGotGo(null)">Terug naar het overzicht</button></div></div>`}
function carSaleHtml(i){const c=S.cars[i];if(!c)return '';const left=saleLeft(),o=c.offer,amt=o?offerAmt(c):0,diff=o?Math.round((o.f-1)*100):0;
 return `<div class="cs-panel"><div class="cs-prices"><div><span class="label">Gemiddelde verkoopprijs</span><b>${fmt(c.v)}</b></div><div><span class="label">Nieuwprijs</span><b>${fmt(carNew(c))}</b></div><div><span class="label">Biedingen dit speluur</span><b>${left} over</b></div></div>
  ${o?`<div class="cs-offer ${diff>=0?'hi':diff<-15?'lo':''}"><div class="cs-who"><span class="label">Bod van</span><b>${o.who}</b><small>${o.bank?'Maakt het over naar je bank':'Betaalt contant'} · wit geld</small></div>
   <div class="cs-amt"><b>${fmt(amt)}</b><em>${diff>=0?'+':''}${diff}% t.o.v. gemiddeld</em></div></div>
   <div class="cs-btns"><button class="btn" onclick="act.carAccept(${i})">Accepteren · ${fmt(amt)}</button>${left?`<button class="btn ghost" onclick="act.carReject(${i})">Weigeren, volgende koper</button>`:`<button class="btn ghost" disabled>Nieuwe kopers over ${fmtClock(GHOUR-(now()%GHOUR))}</button>`}</div>`
  :`<div class="cs-btns"><button class="btn" onclick="act.carOffer(${i})" ${left?'':'disabled'}>${left?'Kopers zoeken':'Nieuwe kopers over '+fmtClock(GHOUR-(now()%GHOUR))}</button></div>`}
  <p class="cs-note">Je krijgt ${SALE_TRIES} biedingen per speluur (10 minuten). Wijs je ze af, dan wacht je op het volgende speluur.</p></div>`}
// Het Autokerkhof: hek met prikkeldraad, gestapelde geperste auto's, een kraan met magneet en banden
function yardSvg(){const crush=(x,y,w,c,r)=>`<g transform="translate(${x} ${y}) rotate(${r||0})"><rect width="${w}" height="15" rx="2" fill="${c}"/><rect y="0" width="${w}" height="15" rx="2" fill="url(#ykS)"/><path d="M${w*.18} 4h${w*.22}M${w*.5} 4h${w*.24}" stroke="#9fb3c4" stroke-opacity=".55" stroke-width="3"/><path d="M3 11h${w-6}" stroke="#000" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="6 3 2 4"/></g>`;
 const tire=(x,y)=>`<g transform="translate(${x} ${y})"><ellipse rx="17" ry="6" fill="#141518"/><ellipse rx="17" ry="6" fill="none" stroke="#2c2f35" stroke-width="2"/><ellipse rx="7" ry="2.4" fill="#0a0b0c"/></g>`;
 return `<svg class="yardsvg" viewBox="0 0 320 220" aria-hidden="true"><defs><pattern id="ykF" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0l10 10M10 0L0 10" stroke="#5b616b" stroke-opacity=".45" stroke-width="1"/></pattern>
  <linearGradient id="ykS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <linearGradient id="ykG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2620"/><stop offset="1" stop-color="#121110"/></linearGradient></defs>
  <rect x="0" y="92" width="320" height="86" fill="url(#ykF)"/>
  <g stroke="#3a3f47" stroke-width="3">${[8,72,136,200,264,312].map(x=>`<path d="M${x} 86v92"/>`).join('')}</g>
  <path d="M0 92h320" stroke="#5b616b" stroke-width="1.5"/><path d="M0 86 ${Array.from({length:32},(_,i)=>`l5 ${i%2?4:-4} l5 ${i%2?-4:4}`).join(' ')}" fill="none" stroke="#7a808a" stroke-width="1" opacity=".7"/>
  <g stroke="#c9a227" stroke-width="3" fill="none"><path d="M236 178V34M250 178V34"/><path d="M236 178l14-14-14-14 14-14-14-14 14-14-14-14 14-14-14-14 14-14" stroke-width="1.5"/>
   <path d="M243 34H112M243 26l-120 8M243 26v8" /><path d="M243 34h40l0 10h-12" stroke-width="2.5"/></g>
  <rect x="270" y="34" width="22" height="18" fill="#3d3424"/><rect x="228" y="40" width="30" height="20" rx="2" fill="#2b2f36" stroke="#c9a227" stroke-width="1.5"/><rect x="232" y="44" width="10" height="8" fill="#ffd78c" opacity=".7"/>
  <path d="M148 34v36" stroke="#9aa1ab" stroke-width="1.5"/><path d="M134 70h28v6h-28z" fill="#4b5059"/><path d="M136 76h24" stroke="#c9a227" stroke-width="1.5"/>
  <g transform="rotate(-5 148 96)">${typeof carSvg==='function'?carSvg('hatch','#7a2a2a').replace('<svg ','<svg x="102" y="70" width="92" height="46" ').replace('class="carsvg"','class="yk-car"'):''}</g>
  <rect x="0" y="176" width="320" height="44" fill="url(#ykG)"/>
  ${crush(18,160,74,'#3d6b8a',-1)}${crush(96,161,70,'#6b5a3a',1)}${crush(26,144,66,'#7a3a3a',2)}${crush(88,145,68,'#4a5866',-2)}${crush(48,129,62,'#5d6b3a',-1)}${crush(56,113,46,'#8a6f2a',3)}
  ${tire(208,172)}${tire(208,164)}${tire(208,156)}${tire(290,174)}${tire(286,166)}
  <path d="M170 182h28M120 190h40M230 188h22" stroke="#3a352c" stroke-width="2" stroke-linecap="round"/>
 </svg>`}
// kleine taferelen voor de banners
const caArt=(k,html)=>`<span class="ca-sc ${k}">${html||''}</span>`;
function carLobby(){const ri=rankIdx(S.xp),cap=garageCap(),gv=S.cars.reduce((a,c)=>a+c.v,0),rep=S.cars.filter(carRep).length,O=carOrders(),od=O.list.filter(o=>!o.done&&S.cars.some(c=>c.id===o.id)).length;
 const best=S.cars.slice().sort((a,b)=>b.v-a.v)[0],bm=best&&(CARS.find(k=>k.id===best.id)||{b:'sedan'});
 const b=(k,col,kind,title,desc,facts,go,art,dis)=>`<button class="bzb car-b" style="--c:${col}" onclick="carMode='${k}';render();window.scrollTo({top:0,behavior:'smooth'})" ${dis?'disabled':''}>
  <span class="bzb-art" aria-hidden="true">${art}</span><span class="bzb-t"><span class="bzb-k">${kind}</span><b>${title}</b><span class="bzb-d">${desc}</span><span class="bzb-f">${facts}</span><span class="bzb-go">${go}</span></span></button>`;
 return `<h1>Auto's</h1>
 <div class="bzb-grid">
  ${(()=>{const show=S.cars.slice().sort((x,y)=>y.v-x.v).slice(0,3),art=show.length?`<span class="gar-line n${show.length}">${show.map(c=>{const m=CARS.find(k=>k.id===c.id)||{b:c.b||'hatch'};return carSvg(m.b||c.b,c.c||'#8a929c')}).join('')}</span>`:(typeof bzArt==='function'?bzArt({id:'cg',col:'#ffad6b',icp:ICONS.cars,kind:'garage'},'cag'):'');
   return b('garage','#ffad6b','Jouw gestolen auto\'s','Garage',S.cars.length?`Hier staan de auto's die je gestolen hebt. Verkoop ze aan kopers, sloop ze of lever ze af bij de heler of je familie.`:`Hier komen de auto's die je steelt. ${cap} plekken${cap<10?', uit te breiden tot 10':''}.`,`<em><b>${S.cars.length}</b>/${cap} plekken</em><em><b>${fmt(gv)}</b> waarde</em>${rep?`<em class="dn"><b>${rep}</b> gemeld als gestolen</em>`:''}${od?`<em class="up"><b>${od}</b> voor de heler</em>`:''}`,S.cars.length?'Bekijk je auto\'s ›':'Openen ›',art).replace('class="bzb car-b"','class="bzb car-b gar-b"')})()}
  ${b('zoek','#7fd1c7','Stelen','Straat afzoeken','Kijk wat er geparkeerd staat. Een Polo vind je zo, een Lamborghini bijna nooit.',(srchLeft()?`<em class="dn">uitrusten nog ${fmtClock(srchLeft())}</em>`:`<em>${cdLeft('car')?'nog '+fmtClock(cdLeft('car')):'klaar'}</em><em><b>${srchCost()}</b> energie · ${srchMax()-srch().n}/${srchMax()} over</em>`),'Op pad ›',caArt('street','<i class="lamp"></i>'+carSvg('hatch','#5a6270')))}
  ${b('jack','#ff5c6c','Stelen','Carjacken','Bij het stoplicht, portier open en gas erop. Snel, maar heet.',ri<JACK_R?`<em>vanaf ${RANKS[JACK_R][0]}</em>`:`<em>${cdLeft('jack')?'nog '+fmtClock(cdLeft('jack')):'klaar'}</em><em><b>${JACK_EN}</b> energie</em>`,'Naar het stoplicht ›',caArt('light',carSvg('sedan','#7a1424')+'<i class="tl"><i></i><i></i><i></i></i>'))}
  ${b('sloop','#c9a227','Onderdelen · zwart geld','Het Autokerkhof',S.sloop?'Je eigen sloperij. Hier gaat elke auto weg, ook als hij als gestolen is gemeld.':`Koop een sloperij en verkoop auto's als onderdelen. Ook gemelde auto's raak je hier kwijt.`,S.sloop?`<em><b>${Math.round(sloopK()*100)}%</b> van de waarde</em><em>${SLOOP_LV[sloopLv()][0]}</em>`:`<em>${ri<SLOOP_R?'vanaf '+RANKS[SLOOP_R][0]:fmt(SLOOP_P)}</em>`,S.sloop?'Openen ›':'Bekijken ›',caArt('yard',yardSvg()))}
  ${b('heler','#b8a1ff','Op bestelling','De heler',`Elke speldag een nieuwe lijst. Hoe sterker jullie band, hoe beter hij betaalt. Jij bent: ${HELER_LV[helerLv()].n}.${ri>=HIRE_R?' Je kunt ook iemand inhuren die een auto voor je haalt.':''}`,`<em><b>${O.list.filter(o=>!o.done).length}</b> open</em><em>nieuw over ${bkDur(O.day+DAY_MS-now())}</em>${od?`<em class="up"><b>${od}</b> in je garage</em>`:''}${helerJobs().length?`<em class="up"><b>${helerJobs().length}</b> ingehuurd</em>`:''}`,'Bekijken ›',caArt('van',carSvg('van','#2f3640')))}
 </div>
 ${cxpHtml()}
 <button class="dex-bn" onclick="carMode='dex';render();window.scrollTo({top:0,behavior:'smooth'})"><span><span class="label">Collectie en kansen</span><b>${CARS.filter(m=>((S.carDex||{})[m.id]||[0,0])[1]>0).length} van de ${CARS.length} modellen gestolen</b><small>Bekijk per model hoe groot de kans is en wat hij waard is</small></span><i>›</i></button>`}
function carBack(t){return `<div class="vb-bar"><button class="vb-back" onclick="carMode=null;carSaleIdx=null;carGot=null;carFresh=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Terug naar auto's</span></button><h2>${t}</h2></div>`}
function garageView(){const L=garageLvl(),cap=garageCap(),nx=GARAGE_CAPS[L+1],gv=S.cars.reduce((a,c)=>a+c.v,0);
 return `${carBack('Garage')}
 <section class="gar-up card"><div><span class="label">Plekken</span><div class="gar-slots">${Array.from({length:10},(_,i)=>`<i class="${i<S.cars.length?'f':i<cap?'o':''}"></i>`).join('')}</div><small>${S.cars.length} van ${cap} bezet · waarde ${fmt(gv)}</small></div>
  ${nx?`<button class="btn ${wit()>=GARAGE_UP[L+1]?'gold':'ghost'}" onclick="act.garageUp()" ${wit()>=GARAGE_UP[L+1]?'':'disabled'}>Uitbouwen naar ${nx} plekken · ${fmt(GARAGE_UP[L+1])}</button>`:'<span class="gar-max">Je garage is maximaal: 10 plekken</span>'}</section>
 ${S.cars.length?`<div class="garage g2">${S.cars.map((c,i)=>{const m=CARS.find(k=>k.id===c.id)||CARS.find(k=>k.n===c.n)||{b:'hatch',d:1},rep=carRep(c),open=carSaleIdx===i;
   const R=carRarity(m)||CAR_RARITY[1],ho=helerWants(c.id);
   return `<div class="gcar v2 ${open?'open':''} ${rep?'is-rep':''} ${c===carFresh?'is-new':''}" style="--rc:${R[1]}">
    <div class="gc-stage">${carSvg((m&&m.b)||c.b,c.c||'#8a929c')}<span class="gc-tags"><i class="gc-rar">${R[0]}</i>${c.hot?'<i class="g-hot" title="Gejat bij het stoplicht: minder waard">heet</i>':''}${rep?'<i class="g-rep" title="Als gestolen opgegeven: alleen via het autokerkhof, de heler of je familie">gemeld</i>':''}${ho?`<i class="gc-hel" title="De heler betaalt ×${ho.k.toLocaleString('nl-NL')}">heler zoekt hem</i>`:''}</span><span class="gc-slot">Plek ${i+1}</span></div>
    <div class="gc-h"><b>${c.n}</b><span class="gv">${fmt(c.v)}</span></div>
    <div class="gc-specs"><span><small>Bouwjaar</small><b>${c.year||'–'}</b></span><span><small>Km-stand</small><b>${c.km!=null?kmTxt(c.km):'–'}</b></span><span><small>Staat</small><b>${c.staat||'–'}</b></span><span><small>Nieuw</small><b>${fmt(carNew(c))}</b></span></div>
    <div class="g-s">${rep?'':`<button class="btn sm" onclick="carSaleIdx=${open?'null':i};render()">${open?'Sluiten':'Verkopen'}</button>`}${S.sloop?`<button class="btn sm ghost" onclick="act.carSloop(${i})" title="Onderdelen: ±${fmt(sloopEst(c))} zwart">Slopen · ±${fmt(sloopEst(c))}</button>`:''}${S.family?`<button class="btn sm ghost g-fam" onclick="act.famCar(${i})" title="Afleveren bij ${famBase().n}: ${fmt(Math.round(c.v*.3))} en +${Math.round(2+Math.sqrt(c.v)/20)} eer">Familie</button>`:''}${ho?`<button class="btn sm ghost" onclick="carMode='heler';render();window.scrollTo(0,0)">Naar de heler</button>`:''}</div>
    ${rep&&!S.sloop?'<div class="g-note">Als gestolen gemeld: geen koper wil hem. Alleen het autokerkhof, de heler of je familie.</div>':''}
    ${open?carSaleHtml(i):''}</div>`}).join('')}</div>`:`<div class="card empty gar-empty"><b>Je garage is leeg.</b><span>Hier komen de auto's die je steelt. Zoek de straat af of ga carjacken.</span><button class="btn" onclick="carMode='zoek';render()">Straat afzoeken ›</button></div>`}`}
function sloopView(){const ri=rankIdx(S.xp);
 if(!S.sloop)return `${carBack('Het Autokerkhof')}<section class="card sl-buy"><div class="sl-art">${caArt('yard',yardSvg())}</div>
  <div><h3>Een eigen sloperij</h3><p class="sub">Een terrein vol wrakken, een pers en een man die onderdelen per stuk verkoopt. Elke auto gaat hier uit elkaar voor zwart geld: als beginner ±${Math.round(sloopK(0)*100)}% van de waarde, als meestersloper ±${Math.round(sloopK(SLOOP_LV.length-1)*100)}%. Ook auto's die als gestolen zijn opgegeven.</p>
   <button class="btn gold" onclick="act.buySloop()" ${ri>=SLOOP_R&&wit()>=SLOOP_P?'':'disabled'}>${ri<SLOOP_R?'Vanaf '+RANKS[SLOOP_R][0]:wit()<SLOOP_P?'Nog '+fmt(SLOOP_P-wit())+' wit nodig':'Koop het autokerkhof · '+fmt(SLOOP_P)}</button></div></section>`;
 const l=sloopLv(),n=sloopN(),nx=SLOOP_LV[l+1],pct=nx?Math.min(100,(n-SLOOP_LV[l][1])/(nx[1]-SLOOP_LV[l][1])*100):100,R=sloopLast,pc=x=>Math.round(x*100)+'%';
 return `${carBack('Het Autokerkhof')}
 <section class="slx"><div class="slx-h"><span class="label">Sloop-ervaring</span><b>${SLOOP_LV[l][0]}</b><em>${n} auto${n===1?'':'\'s'} gesloopt · niveau ${l+1} van ${SLOOP_LV.length}</em></div>
  <div class="slx-steps">${SLOOP_LV.map((x,i)=>`<i class="${i<l?'done':i===l?'now':''}" title="${x[0]}: vanaf ${x[1]} auto's"><b>${i+1}</b><span>${x[0]}</span></i>`).join('')}</div>
  ${nx?`<div class="hl-bar"><i style="width:${pct}%"></i></div>`:''}
  <div class="slx-fx"><span><small>Schade aan onderdelen</small><b>±${pc(SLOOP_DMG[l])}</b></span><span><small>Kosten (pers, afvoer)</small><b>${pc(SLOOP_COST[l])}</b></span><span><small>Jij krijgt</small><b>±${pc(sloopK())}</b></span></div>
  <p class="hl-next">${nx?`Nog <b>${nx[1]-n}</b> auto${nx[1]-n===1?'':'\'s'} slopen tot <b>${nx[0]}</b>: ±${pc(SLOOP_DMG[l+1])} schade, ${pc(SLOOP_COST[l+1])} kosten, ±${pc(sloopK(l+1))} van de waarde.`:'Hoogste niveau: je haalt een auto uit elkaar zonder één kras.'}</p></section>
 ${R?`<section class="sl-bon"><div class="sl-bon-h"><span class="label">Net gesloopt</span><b>${esc(R.c.n)}</b><em>${R.n>1?R.n+' auto\'s · ':''}waarde ${fmt(R.v)}</em></div>
  <div class="sl-parts">${R.parts.map(p=>`<span><small>${p.n}</small><b>${fmt(p.net)}</b><i class="${p.d>.2?'bad':p.d<.08?'ok':''}">${Math.round(p.d*100)}% schade</i></span>`).join('')}<span class="sl-cost"><small>Kosten</small><b>−${fmt(R.cost)}</b></span></div>
  <div class="sl-tot">Opbrengst <b>${fmt(R.net)}</b> zwart · ${pc(R.net/Math.max(1,R.v))} van de waarde</div></section>`:''}
 <p class="sub">Elke auto uit je garage gaat hier uit elkaar. Je krijgt zwart geld voor de onderdelen. Hoe vaker je sloopt, hoe minder je kapotmaakt.</p>
 ${S.cars.length?`<div class="sl-list">${S.cars.map((c,i)=>{const m=CARS.find(k=>k.id===c.id)||{b:'hatch'};return `<div class="sl-row">${carSvg(m.b||c.b,c.c||'#8a929c')}<div><b>${c.n}${carRep(c)?' <i class="g-rep">gemeld</i>':''}</b><small>${SLOOP_PARTS.map(([n,k])=>n+' ±'+fmt(Math.round(c.v*k*(1-SLOOP_DMG[l])))).join(' · ')} · kosten ${fmt(Math.round(c.v*SLOOP_COST[l]))}</small></div><button class="btn sm" onclick="act.carSloop(${i})">Slopen · ±${fmt(sloopEst(c))}</button></div>`}).join('')}</div>
  <button class="btn ghost" style="width:auto;margin-top:10px" onclick="act.sloopAll()">Alles slopen · ±${fmt(S.cars.reduce((a,c)=>a+sloopEst(c),0))} zwart</button>`:'<div class="card empty">Je garage is leeg.</div>'}`}
V.cars=()=>{if(S.street)delete S.street;S.carDex=S.carDex||{};carExpire(true);carXp();helerB();sloopN();helerJobsTick(1);
 if(carMode==='zoek'||carMode==='jack')return `${carBack(carMode==='jack'?'Carjacken':'Straat afzoeken')}<div class="hunt-grid">${carMode==='jack'?jackSection():`<section class="hunt">${huntScene()}<div class="hunt-body">${huntInfo()}${huntBtns()}</div></section>`}</div>${typeof prButtons==='function'?prButtons(carMode==='jack'?['chase']:['contact','chase']):''}`;
 if(carMode==='garage')return garageView();
 if(carMode==='sloop')return sloopView();
 if(carMode==='heler')return `${carBack('De heler')}${ordersHtml()}`;
 if(carMode==='dex')return `${carBack('Collectie en kansen')}${oddsList()}`;
 return carLobby()};
// Eigen klok: aftellen zonder alles opnieuw te tekenen
let _carSig='';
setInterval(()=>{if(page!=='cars'||window.__chase||carSearch)return;if(carExpire()){render();return}const x=S.carFind;
 const sig=[cdLeft('jack')>0,carMode,typeof saleLeft==='function'?saleLeft():0,cdLeft('car')>0,inJail(),S.cars.length>=garageCap(),srchLeft()>0,srch().n,S.energy>=srchCost(),x&&x.id&&!x.res?S.energy>=carEn(findM(x)):0].join();
 if(_carSig&&sig!==_carSig){_carSig=sig;render();return}_carSig=sig;
 const a=document.getElementById('hsLeft');if(a&&x&&x.until)a.textContent=fmtClock(x.until-now());
 const c=document.getElementById('huntCd');if(c)c.textContent=fmtClock(cdLeft('car'));const rl=fmtClock(srchLeft());['huntRest','srchCd'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=rl});const j=document.getElementById('jackCd');if(j)j.textContent=fmtClock(cdLeft('jack'))},1000);
Object.assign(act,{
 garageUp(){const L=garageLvl();if(L>=GARAGE_CAPS.length-1)return;const c=GARAGE_UP[L+1];if(wit()<c){toast('Je garage uitbouwen betaal je met wit geld','bad');return}spendWit(c);S.garage=L+1;SFX.win(3);toast('Garage uitgebouwd: '+GARAGE_CAPS[L+1]+' plekken','lvl');log('Garage uitgebouwd naar '+GARAGE_CAPS[L+1]+' plekken ('+fmt(c)+')','info');save();render()},
 carOffer(i){const c=S.cars[i];if(!c||carRep(c))return;if(!saleLeft()){toast('Wacht op nieuwe kopers','bad');return}newOffer(c);SFX.click();save();render()},
 carReject(i){const c=S.cars[i];if(!c)return;delete c.offer;if(!saleLeft()){save();render();return}newOffer(c);save();render()},
 carAccept(i){const c=S.cars[i];if(!c||!c.offer)return;const a=offerAmt(c),bank=c.offer.bank,who=c.offer.who;S.cars.splice(i,1);carSaleIdx=null;
  if(bank){S.bank+=a;typeof bkTx==='function'&&bkTx('car',a,c.n+' · '+who)}else S.cash+=a;SFX.win(3);toast(`${c.n} verkocht aan ${who}: ${fmt(a)} ${bank?'op je bank':'contant'} (wit)`,'ok');log(`${c.n} verkocht aan ${who} voor ${fmt(a)} (${bank?'overgemaakt':'contant'})`,'ok');save();render()},
 buySloop(){if(S.sloop||rankIdx(S.xp)<SLOOP_R)return;if(wit()<SLOOP_P){toast('Het autokerkhof koop je met wit geld','bad');return}spendWit(SLOOP_P);S.sloop=1;SFX.big();toast('Het Autokerkhof is van jou','lvl');log('Autokerkhof gekocht ('+fmt(SLOOP_P)+')','info');save();render()},
 carSloop(i){const c=S.cars[i];if(!c||!S.sloop)return;const l0=sloopLv(),R=sloopRoll(c),a=R.net;S.cars.splice(i,1);carSaleIdx=null;S.cash+=a;addZwart(a);S.sloopN=sloopN()+1;sloopLast={...R,v:c.v,n:1};
  SFX.chip();toast(`${c.n} gesloopt: ${fmt(a)} zwart voor de onderdelen`,'ok');log(`${c.n} gesloopt (${fmt(a)} zwart, ${Math.round(a/Math.max(1,c.v)*100)}%)`,'info');
  if(sloopLv()>l0){toast('Sloop-ervaring: je bent nu '+SLOOP_LV[sloopLv()][0]+'. Minder schade, minder kosten.','lvl');log('Sloop-ervaring: '+SLOOP_LV[sloopLv()][0],'ok')}
  if(carMode!=='sloop'&&carMode!=='garage')carMode='sloop';save();render()},
 sloopAll(){if(!S.sloop||!S.cars.length)return;const l0=sloopLv(),n=S.cars.length;let a=0,v=0,last=null;const sum={};let cost=0;
  S.cars.forEach(c=>{const R=sloopRoll(c);a+=R.net;v+=c.v;cost+=R.cost;R.parts.forEach(p=>{const s=sum[p.n]||(sum[p.n]={n:p.n,g:0,net:0});s.g+=p.g;s.net+=p.net});S.sloopN=sloopN()+1;last=c});
  S.cars=[];carSaleIdx=null;S.cash+=a;addZwart(a);sloopLast={c:{n:n+' auto\'s'},parts:Object.values(sum).map(p=>({...p,d:p.g?1-p.net/p.g:0})),cost,net:a,v,n};
  SFX.big();toast(`${n} auto's gesloopt: ${fmt(a)} zwart`,'ok');log(`${n} auto's gesloopt (${fmt(a)} zwart)`,'info');
  if(sloopLv()>l0){toast('Sloop-ervaring: je bent nu '+SLOOP_LV[sloopLv()][0]+'. Minder schade, minder kosten.','lvl');log('Sloop-ervaring: '+SLOOP_LV[sloopLv()][0],'ok')}save();render()},
 helerHire(i){const O=carOrders(),o=O.list[i];if(!o||o.done||o.hired||o.spoed)return;if(rankIdx(S.xp)<HIRE_R){toast('Iemand inhuren kan vanaf '+RANKS[HIRE_R][0],'bad');return}
  if(helerJobs().length>=hireMax()){toast('Er is al iemand voor je onderweg','bad');return}const m=CARS.find(k=>k.id===o.id);if(!m)return;
  const busy=helerJobs().map(j=>j.who),pool=HIRE_WHO.filter(w=>!busy.includes(w)),who=pool[Math.floor(Math.random()*pool.length)]||HIRE_WHO[0];
  helerJobs().push({oi:i,day:O.day,id:o.id,k:o.k,who,t:now(),until:now()+hireMs(m),fail:hireFail(m)});o.hired=1;SFX.click();
  toast(`${who} gaat op zoek naar een ${m.n}. Klaar over ${Math.round(hireMs(m)/60000)} minuten.`,'ok');log(`Ingehuurd: ${who} zoekt een ${m.n} voor de heler`,'info');save();render()},
 carOrder(i,ci){const O=carOrders(),o=O.list[i];if(!o||o.done||o.hired)return;const at=ci!=null&&S.cars[ci]&&S.cars[ci].id===o.id?ci:S.cars.findIndex(c=>c.id===o.id);if(at<0)return;const c=S.cars.splice(at,1)[0];
  const om=CARS.find(m=>m.id===o.id)||{d:1},lv0=helerLv(),L=HELER_LV[lv0],pay=Math.round(c.v*o.k/10)*10,w=Math.round(pay*(L.wit||0)),cr=2+Math.floor(carTier(om)/2)+(o.spoed?3:0);o.done=1;S.cash+=pay;addZwart(pay-w);S.cred+=cr;S.stats.orders=(S.stats.orders||0)+1;helerN();S.heler.b=helerB()+helerGain(om,o.spoed);S.heler.n++;
  const up=helerLv()>lv0;toast(`${c.n} afgeleverd bij de heler: +${fmt(pay)}${w?' ('+fmt(w)+' wit)':''} · +${cr} cred`+(up?` · je bent nu ${HELER_LV[helerLv()].n}!`:''),'lvl');if(up)log('De heler: je bent nu '+HELER_LV[helerLv()].n+' ('+HELER_LV[helerLv()].p+')','ok');log(`Bestelling: ${c.n} afgeleverd (+${fmt(pay)})`,'ok');save();render()},
 carGotGo(m){carFresh=m==='garage'&&carGot?carGot.car:null;carGot=null;carSaleIdx=null;carMode=m;if(!m)S.carFind=null;render();window.scrollTo(0,0);
  if(carFresh)setTimeout(()=>{const el=document.querySelector('.gcar.is-new');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},60)},
 carHelerAny(i){const L=HELER_LV[helerLv()],c=S.cars[i];if(!L.any||!c)return;const pay=Math.round(c.v*L.any/10)*10,w=Math.round(pay*L.wit);S.cars.splice(i,1);S.cash+=pay;addZwart(pay-w);SFX.chip();toast(`${c.n} aan de heler verkocht: +${fmt(pay)} (${fmt(w)} wit)`,'ok');log(`${c.n} aan de heler verkocht (${fmt(pay)})`,'ok');save();render()},
 carGotHeler(i){const g=carGot;if(!g)return;const ci=S.cars.indexOf(g.car);if(ci<0)return;carGot=null;act.carOrder(i,ci)},
 async searchCar(){carGot=null;if(carSearch||window.__chase||inJail()||cdLeft('car'))return;if(S.cars.length>=garageCap()){toast('Garage vol, verkoop eerst iets','bad');return}
  if(srchLeft()){toast('Je bent moe gelopen. Uitrusten: nog '+fmtClock(srchLeft()),'bad');return}
  const en=srchCost();if(S.energy<en){toast('Te moe: deze zoektocht kost '+en+' energie','bad');return}
  const h=srch();S.energy-=en;h.n++;h.last=now();if(h.n>=srchMax()){h.until=now()+srchCdMs();toast('Dat was je laatste zoektocht. Even uitrusten: '+(SRCH_CD[tier()]||SRCH_CD[0])+' minuten')}
  S.carFind=null;const spot=CAR_SPOTS[Math.floor(Math.random()*CAR_SPOTS.length)];carSearch={spot};S.stats.searches=(S.stats.searches||0)+1;
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
  if(ok){const v=carSell(x.v),car={id:m.id,n:m.n,v,b:m.b,c:x.c,year:x.year,km:x.km,staat:x.staat,rep:Math.random()<(.12+carTier(m)*.05)?1:0};S.cars.push(car);carGot={car,src:'zoek',t:now()};S.stats.cars++;cxpAdd(m);S.cred+=carTier(m)>=3?2:1;
    addHeat(m.d*2);addXp(6+m.d*m.d*4+(m.leg?200:0));if(typeof famEv==='function')famEv('car',{v});const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d;
    toast(m.n+' gestolen! Waarde '+fmt(v),m.d>=5?'lvl':'ok');log(m.n+' gestolen ('+fmt(v)+')','ok');save();render();carGotShow()}
  else if(fled){addHeat(2+m.d);const w=r==='witness';S.stats.carFled=(S.stats.carFled||0)+1;
    log(`Mislukt: ${m.n}. ${w?'Een omstander belde 112, maar je bent op tijd weggekomen':'Het alarm ging af, maar je was weg voordat er iemand kwam'}`,'bad');save();render();
    toast(w?'Mislukt. Een omstander belde 112, maar je bent op tijd weggekomen.':'Mislukt. Het alarm gaat af, maar je bent weg voordat er iemand komt.','bad')}
  else{addHeat(4+m.d*2);log('Mislukte poging: '+m.n,'bad');save();render();
    arrest(30+m.d*20,'Alarm!','Het alarm van de '+m.n+' gaat af. Spring erin en rijd weg, of geef je over.',{flee:Math.min(5,Math.max(1,m.d)),chase:{b:m.b,c:x.c,n:m.n}})}}});
