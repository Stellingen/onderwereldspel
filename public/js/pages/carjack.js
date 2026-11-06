// Auto's: carjacken. Zes aanpakken (tankstation, bezorger, stoplicht, parkeergarage, valse aanrijding, oprit 's nachts),
// elk met een eigen spel (jackgames.js), eigen buit en eigen risico.
// 1. Kies een aanpak en ga op de loer (energie + afkoelen). 2. Je ziet drie auto's: klasse, waarde, beveiliging en jouw kans.
// 3. Kies er één en speel het spel. Gewonnen = de auto is van jou (garage, heler). Getuigen geven extra hitte en de auto
//    wordt als gestolen gemeld. Verloren: hij rijdt weg, de bestuurder vecht terug, of de politie komt (arrestatie met vluchten,
//    vanuit de auto via de achtervolging "Plankgas!" in carchase.js).
// Bewaard: S.jackScout = {ap, t, until, list:[doelwitten]} (3 minuten geldig), S.stats.jackAp = {aanpak:[pogingen, gelukt]}.
// Oude saves: beide velden ontbreken gewoon; S.cd.jack, S.stats.jacks en S.pendingJack werken zoals voorheen.
const JACK_R=GAME_CONST.jackR,JACK_EN=8,JACK_HOT=.85,JACK_SCOUT=3*60000;
let carMode=null;
const JACK_SPOTS={tank:['Shell aan de A10','Tango in Osdorp','Esso bij de Ring','Tankstation Zeeburg'],bezorger:['Flat in de Bijlmer','Portiek in De Pijp','Galerijflat in Slotervaart','Nieuwbouw op IJburg'],
 licht:['Wibautstraat','Museumplein','Afrit RAI','Coolsingel','Malieveld','Rotonde Amstelveen'],garage:['Q-Park Zuidas','Garage Arena','Parkeerkelder Oostpoort','Garage Museumplein'],
 tik:['Stadhouderskade','IJtunnel-afrit','Ring Zuid','Weesperstraat'],oprit:['Villa in het Gooi','Oud-Zuid','Wassenaar','Blaricum','Aerdenhout']};
const jackGun=()=>gearBest('wapen');
const jackWpow=()=>{const g=jackGun();return g?Math.min(1,(g.vk||1)/12):0};
const jackApR=ap=>JACK_R+(ap.rank||0);
const jackApS=id=>{const s=S.stats.jackAp=S.stats.jackAp||{};return s[id]||(s[id]=[0,0])};
// vakmanschap per aanpak (zie jackgames.js voor de formule)
function jackProf(ap){const tr=ap.sk.reduce((a,k)=>a+Math.min(TRAIN_MAX,sk(k)),0)/ap.sk.length/TRAIN_MAX,rout=Math.min(1,Math.sqrt((S.stats.jacks||0)/60));
 return {E:cxpF(),R:rankIdx(S.xp)/(RANKS.length-1),T:tr,X:ap.wp?.6*jackWpow()+.4*rout:rout,lvl:cxpLvlF()}}
const jackG=(ap,m,sec)=>jgG(ap,carTier(m),sec,jackProf(ap));
// kans per zeldzaamheid voor deze aanpak, schuift mee met je kracht als autodief (zoals op straat)
function jackT(ap){const p=powK(carPow()),o={};for(let t=1;t<=6;t++)o[t]=(ap.T0[t]||0)+((ap.T1[t]||0)-(ap.T0[t]||0))*p;return o}
function jackPickM(ap,T,ex){const p=carPow(),ri=rankIdx(S.xp);let r=Math.random(),t=1;for(let k=1;k<=6;k++){r-=T[k]||0;if(r<=0){t=k;break}t=k}
 const W=m=>m.w*carClassW(m,p,ri)*(m.k?ap.boost:1)*((ap.bw||{})[String(m.b).replace(/\d+$/,'')]||1)*(ex.includes(m.id)?.02:1);
 let pool=CARS.filter(m=>carTier(m)===t);if(!pool.length)pool=CARS.filter(m=>carTier(m)===1);let w=Math.random()*pool.reduce((a,m)=>a+W(m),0);
 for(const m of pool){w-=W(m);if(w<=0)return m}return pool[0]}
// beveiliging: 0 geen alarm, 1 alarm, 2 alarm + tracker (duurder = vaker zwaar)
function jackSecRoll(m){const t=carTier(m),r=Math.random(),p2=Math.min(.6,.04+.1*(t-1)),p1=.38;return r<p2?2:r<p2+p1?1:0}
const JACK_SECN=['Geen alarm','Alarm','Alarm + tracker'];
// verwachte kans bij deze aanpak (gemiddeld over de auto's die je er tegenkomt)
function jackAvg(ap){const T=jackT(ap),pr=jackProf(ap);let s=0,n=0;for(let t=1;t<=6;t++){if(!T[t])continue;s+=T[t]*jgG(ap,t,.8,pr);n+=T[t]}return n?s/n:0}
const jackVal=(ap,x)=>Math.round(carSell(x.v)*ap.val/10)*10;
function jackScoutTick(){const s=S.jackScout;if(s&&(!s.until||s.until<now()||!Array.isArray(s.list))){S.jackScout=null;return true}return false}
function jackWhy(ap){const ri=rankIdx(S.xp);if(ri<jackApR(ap))return 'Vanaf '+RANKS[jackApR(ap)][0];if(inJail())return 'Je zit vast';if(ap.wp&&!jackGun())return 'Wapen nodig';
 if(S.cars.length>=garageCap())return 'Garage vol';if(cdLeft('jack'))return 'Afkoelen · <span class="js-jcd">'+fmtClock(cdLeft('jack'))+'</span>';if(S.energy<ap.en)return 'Te moe · '+ap.en+' energie';return ''}

// ---------- tekening ----------
const jxBars=(n,c)=>`<i class="jx-m ${c}">${[1,2,3,4,5].map(i=>`<b class="${i<=n?'on':''}"></b>`).join('')}</i>`;
function jxArt(ap){const car=(b,c,x,y,w,f)=>typeof jgCar==='function'?jgCar(b,c,x,y,w,{flip:f}):'';
 const bg=`<rect width="200" height="100" fill="#0d1016"/>`;let s='';
 if(ap.id==='tank')s=`<rect y="10" width="200" height="8" fill="#20252d"/><rect y="18" width="200" height="2" fill="#ff7a1a"/><rect x="38" y="46" width="12" height="38" rx="2" fill="#c8202f"/><rect x="40" y="50" width="8" height="7" fill="#0d0f13"/>${car('hatch','#4d6f9a',62,88,128)}`;
 if(ap.id==='bezorger')s=`<rect x="6" y="8" width="56" height="80" fill="#1b1f28"/>${[0,1,2,3].map(f=>`<rect x="26" y="${70-f*18}" width="14" height="10" fill="${f===3?'#ffd78c':'#2a2f38'}"/>`).join('')}${car('van','#d9dde2',66,90,128)}`;
 if(ap.id==='licht')s=`<rect x="170" y="10" width="16" height="40" rx="4" fill="#07080a" stroke="#2b2f37"/><circle cx="178" cy="20" r="5" fill="#ff3d52"/><circle cx="178" cy="31" r="5" fill="#1b1d22"/><circle cx="178" cy="42" r="5" fill="#1b1d22"/><rect x="176" y="50" width="4" height="40" fill="#2a2e36"/>${car('sedan2','#2f6fe0',14,90,140)}`;
 if(ap.id==='garage')s=`<rect width="200" height="12" fill="#22262d"/><rect x="30" y="12" width="40" height="3" fill="#dff3ff"/><rect x="120" y="12" width="40" height="3" fill="#dff3ff"/><rect x="176" y="12" width="14" height="80" fill="#1c1f25"/><rect x="164" y="20" width="12" height="6" rx="1" fill="#3a3f48"/><circle cx="166" cy="23" r="1.6" fill="#ff3d52"/>${car('sport','#e8c547',14,90,144)}`;
 if(ap.id==='tik')s=`${car('hatch','#3b414b',0,90,96)}${car('suv','#1c3d6e',90,90,110)}<path d="M96 52l3 7 7-3-4 6 6 4-7 1v7l-5-5-5 5 1-7-8-1 7-4-5-6 7 3z" fill="#ffd35a"/>`;
 if(ap.id==='oprit')s=`<circle cx="176" cy="18" r="8" fill="#e9e6da" opacity=".85"/><path d="M4 90V44l44-24 44 24v46z" fill="#1b1f28"/><rect x="38" y="60" width="18" height="30" fill="#0d0f13"/><rect x="14" y="54" width="14" height="12" fill="#f6c46a" opacity=".35"/>${car('luxsuv','#2b2f3a',84,92,116)}`;
 return `<svg viewBox="0 0 200 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${bg}${s}<rect y="90" width="200" height="10" fill="#15171c"/></svg>`}
function jackTop(){const G=jackGun(),N=carNerve(),cd=cdLeft('jack');
 return `<div class="jx-top">
  <div class="jx-chip"><span class="label">Steelervaring</span><b>${N.name}</b><em>level ${N.lvl}</em></div>
  <div class="jx-chip ${G?'':'bad'}"><span class="label">Wapen</span><b>${G?esc(G.n):'Geen'}</b>${G?`<em>vuurkracht ${G.vk}</em>`:`<a href="#shop" onclick="if(window.gsel)gsel.shop='arsenaal'">Naar het Arsenaal ›</a>`}</div>
  <div class="jx-chip"><span class="label">Energie</span><b>${Math.floor(S.energy)}</b><em>${S.cars.length}/${garageCap()} in garage</em></div>
  <div class="jx-chip ${cd?'wait':'go'}"><span class="label">Op pad</span><b class="js-jcd">${cd?fmtClock(cd):'Klaar'}</b></div></div>`}
function jackAps(){const ri=rankIdx(S.xp);
 return `<div class="jx-aps">${JG_APS.map(ap=>{const why=jackWhy(ap),lock=ri<jackApR(ap),k=Math.round(jackAvg(ap)*100),st=jackApS(ap.id);
  return `<article class="jx-ap ap-${ap.id} ${lock?'lock':''}">
   <div class="jx-art">${jxArt(ap)}${ap.wp?'<span class="jx-wp">Wapen</span>':''}</div>
   <div class="jx-b"><h3>${ap.n}</h3><p>${ap.sub}</p>
    <div class="jx-ms"><span><small>Buit</small>${jxBars(ap.loot,'loot')}</span><span><small>Risico</small>${jxBars(ap.risk,'risk')}</span><span class="jx-k ${lock?'':k>=60?'hi':k>=35?'mid':'lo'}"><small>Kans</small><b>${lock?'–':'±'+k+'%'}</b></span></div>
    ${st[0]?`<span class="jx-rec">${st[1]} van ${st[0]} gelukt</span>`:''}
    <button class="btn ${why?'ghost':''}" onclick="act.jackScout('${ap.id}')" ${why?'disabled':''}>${why||'Op de loer · '+ap.en+' energie'}</button></div></article>`}).join('')}</div>`}
function jackTargets(sc){const ap=jgAp(sc.ap),left=Math.max(0,sc.until-now());
 return `<section class="jx-scout ap-${ap.id}"><div class="jx-sh"><div class="jx-sh-art">${jxArt(ap)}</div><div class="jx-sh-t"><span class="label">${ap.n} · ${esc(sc.spot||'')}</span><h2>Kies je doelwit</h2></div>
   <span class="jx-left">nog <b id="jxLeft">${fmtClock(left)}</b></span></div>
  <div class="jx-tgs">${sc.list.map((x,i)=>{const m=CARS.find(k=>k.id===x.id)||CARS[0],R=carRarity(m),t=carTier(m),k=Math.round(jackG(ap,m,x.sec)*100),o=helerWants(m.id);
   return `<button type="button" class="jx-tg t${t}" style="--rc:${R[1]}" onclick="act.jackGo(${i})">
    <span class="jx-tg-st">${carSvg(m.b,x.c,{reflect:1})}<span class="plate">${x.plate}</span>${o?'<i class="jx-hl">Heler zoekt hem</i>':''}</span>
    <span class="jx-tg-h"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><b>${esc(m.n)}</b><small>${CAR_KIND(m.b)} · ${x.year}</small></span>
    <span class="jx-tg-r"><span class="jx-tg-v"><small>Waarde</small><b>${fmt(jackVal(ap,x))}</b></span>
     <span class="jx-sec s${x.sec}"><small>Beveiliging</small><span><i></i><i></i><i></i></span><em>${JACK_SECN[x.sec]}</em></span></span>
    <span class="jx-odds ${k>=60?'hi':k>=35?'mid':'lo'}"><small>Jouw kans</small><b>${k}%</b><i><s style="width:${k}%"></s></i></span>
    <span class="jx-go">Pak deze</span></button>`}).join('')}</div>
  <div class="jx-foot"><button class="btn ghost sm" onclick="act.jackSkip()">Laat lopen</button></div></section>`}
function jackView(){jackScoutTick();const sc=S.jackScout;
 return `${carBack('Carjacken')}${jackTop()}${typeof carGotHtml==='function'?carGotHtml('jack'):''}${sc?jackTargets(sc):jackAps()}${typeof prButtons==='function'?prButtons(['chase']):''}`}
// klokjes bijwerken zonder alles opnieuw te tekenen; verlopen doelwitten weghalen
setInterval(()=>{if(typeof S==='undefined'||!S||typeof page==='undefined'||page!=='cars'||carMode!=='jack'||window.__chase)return;
 if(jackScoutTick()){save();render();return}const s=S.jackScout,a=document.getElementById('jxLeft');if(a&&s)a.textContent=fmtClock(s.until-now());
 const cd=cdLeft('jack');document.querySelectorAll('.js-jcd').forEach(e=>e.textContent=cd?fmtClock(cd):'Klaar')},1000);

// ---------- afhandeling ----------
const JACK_FIGHT={tank:'De eigenaar komt de shop uit rennen en grijpt je vast.',bezorger:'De bezorger komt de trap af en slaat je met zijn pakket.',licht:'De bestuurder vecht terug.',
 garage:'Een bewaker duwt je tegen een pilaar.',tik:'De bestuurder is sterker dan hij eruitziet.',oprit:'De hond van de buren hangt aan je broek.'};
const JACK_GONE={tank:'Hij ziet je en rijdt weg.',bezorger:'De bezorger is terug en rijdt weg.',licht:'Groen licht. Hij is weg.',garage:'Het slot geeft niet mee. Je loopt door.',
 tik:'Hij rijdt door. Geen tikje waard.',oprit:'Het signaal valt weg. Je laat hem staan.'};
const JACK_COP={tank:['Gezien!','De pompbediende heeft de politie gebeld.'],bezorger:['Betrapt!','De bezorger roept om hulp. Er fietst net een agent langs.'],
 licht:['Politie!','Een agent zag je aan het portier trekken.'],garage:['Alarm!','Het alarm loeit door de garage. De beveiliging komt eraan.'],
 tik:['Politie!','De bestuurder belt 112 terwijl jij nog in de auto zit.'],oprit:['Alarm!','Buitenlampen aan, alarm aan. De bewoner belt de politie.']};
function jackKeep(m,nc,ap,wit){S.cars.push(nc);carGot={car:nc,src:'jack',t:now()};S.stats.cars++;
 S.carDex=S.carDex||{};const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d;if(typeof famEv==='function')famEv('car',{v:nc.v});
 toast(`${m.n} is van jou · ${fmt(nc.v)}${wit?' · getuigen':''}`,carTier(m)>=4?'lvl':'ok');log(`Carjacking (${ap.n.toLowerCase()}): ${m.n} (${fmt(nc.v)})${wit?', er waren getuigen':''}`,'ok');
 save();render();if(typeof carGotShow==='function')carGotShow()}
function jackWin(ap,m,x){const pr=jackProf(ap),hk=Math.min(.6,Math.max(0,fitFx('herken')||0)),wit=Math.random()<Math.max(.03,ap.wit*(1-.5*jgP(pr))*(1-hk));
 const rep=ap.own||wit||(x.sec===2&&Math.random()<.5)?1:0,v=jackVal(ap,x);
 const nc={id:m.id,n:m.n,v,b:m.b,c:x.c,year:x.year,km:x.km,staat:x.staat,hot:ap.own?1:0,rep};
 S.stats.jacks=(S.stats.jacks||0)+1;jackApS(ap.id)[1]++;cxpAdd(m);S.cred+=carTier(m)>=3?2:1;addHeat(ap.heat+m.d*2+(wit?4+m.d:0));addXp(8+m.d*m.d*4);
 jackKeep(m,nc,ap,wit)}
function jackFail(ap,m,x){const wp=jackWpow();let [g,f,p]=ap.fail;f*=1-.6*wp;p=p*(1+.25*x.sec)+(S.heat||0)/400;const s=g+f+p,r=Math.random()*s,t=carTier(m);
 if(r<g){addHeat(2);toast(JACK_GONE[ap.id],'bad');log(`Carjacking mislukt (${ap.n.toLowerCase()}): ${m.n}`,'bad');save();render();return 'gone'}
 if(r<g+f){const h=Math.max(3,Math.round((rnd(6,12)+m.d*2)*(1-.4*wp)));S.hp=Math.max(5,S.hp-h);addHeat(3);toast(`${JACK_FIGHT[ap.id]} −${h}% gezondheid`,'bad');
  log(`Carjacking mislukt (${ap.n.toLowerCase()}): ${m.n}, −${h}% gezondheid`,'bad');save();render();return 'fight'}
 addHeat(ap.heat+m.d*2);log(`Carjacking mislukt (${ap.n.toLowerCase()}): politie bij de ${m.n}`,'bad');save();render();
 const C=JACK_COP[ap.id],lv=ap.car?Math.min(5,Math.max(2,t)):({tank:2,bezorger:1,garage:3}[ap.id]||2);
 arrest(40+m.d*25,C[0],C[1],ap.car?{flee:lv,chase:{b:m.b,c:x.c,n:m.n}}:{flee:lv});return 'police'}

Object.assign(act,{
 jackScout(id){const ap=jgAp(id);if(window.__chase||S.jackScout&&!jackScoutTick())return;const why=jackWhy(ap);if(why){toast(why.replace(/<[^>]+>/g,''),'bad');return}
  if(typeof carGot!=='undefined')carGot=null;S.energy-=ap.en;S.cd.jack=now()+ap.cd*60000*waitK();
  const T=jackT(ap),list=[],ex=[];for(let i=0;i<3;i++){const m=jackPickM(ap,T,ex);ex.push(m.id);const c=spawnCar(m,'');list.push({id:m.id,c:c.c,year:c.year,km:c.km,staat:c.staat,v:c.v,plate:c.plate,sec:jackSecRoll(m)})}
  S.carDex=S.carDex||{};list.forEach(x=>{const d=S.carDex[x.id]||[0,0];d[0]++;S.carDex[x.id]=d});
  const sp=JACK_SPOTS[ap.id]||[''];S.jackScout={ap:ap.id,t:now(),until:now()+JACK_SCOUT,spot:sp[Math.floor(Math.random()*sp.length)],list};
  try{SFX.click()}catch(e){}save();render();window.scrollTo({top:0,behavior:'smooth'})},
 jackSkip(){S.jackScout=null;save();render()},
 async jackGo(i){const sc=S.jackScout;if(!sc||window.__chase||inJail()||jackScoutTick()){render();return}const x=sc.list[i];if(!x)return;
  if(S.cars.length>=garageCap()){toast('Garage vol, verkoop eerst iets','bad');return}
  const ap=jgAp(sc.ap),m=CARS.find(k=>k.id===x.id)||CARS[0];if(typeof carGot!=='undefined')carGot=null;
  S.jackScout=null;S.pendingJack={id:m.id,ap:ap.id};S.stats.jackTries=(S.stats.jackTries||0)+1;jackApS(ap.id)[0]++;save();pushState();
  const r=await jgPlay({ap,m,car:x,G:jackG(ap,m,x.sec),k:ap.game==='lock'?3+x.sec:undefined});S.pendingJack=null;
  if(r.win)jackWin(ap,m,x);else jackFail(ap,m,x)}});
