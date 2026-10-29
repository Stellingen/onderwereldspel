// Tab: Auto's — wat er nu op straat staat, stelen met een minigame, en je garage
const STREET_MS=90000,GARAGE_MAX=10;
const carEn=c=>4+c.d*2;
function pickCar(){const t=CARS.reduce((a,c)=>a+c.w,0);let r=Math.random()*t;for(const c of CARS){r-=c.w;if(r<=0)return c}return CARS[0]}
function streetCars(force){
  if(force||!S.street||S.street.until<now()){
    const spots=[...CAR_SPOTS].sort(()=>Math.random()-.5).slice(0,3);
    S.street={until:now()+STREET_MS,cars:spots.map(sp=>Math.random()<.22?null:{id:pickCar().id,spot:sp,taken:false})};save()}
  return S.street.cars;
}
V.cars=()=>{const list=streetCars(),left=cdLeft('car'),avail=list.filter(x=>x&&!x.taken);
 const t=Math.max(0,S.street.until-now());
 return `<h1>Auto's</h1><p class="sub">Elke anderhalve minuut staan er nieuwe auto's op straat. Je kunt alles proberen te stelen, maar hoe duurder de wagen, hoe lastiger het contact maken. Rijvaardigheid (training) geeft je meer tijd.</p>
 <div class="tierhead"><h2>Op straat</h2><span>Nieuwe auto's over ${fmtClock(t)}</span></div>
 ${avail.length?'':`<div class="card empty-street"><b>Geen auto's veilig om te stelen</b><span>Overal lopen mensen of hangen camera's. Kom over ${fmtClock(t)} terug.</span></div>`}
 <div class="street">${list.map((x,i)=>{if(!x)return `<div class="scar none"><div class="label">Leeg</div><p>Hier staat niks dat de moeite waard is.</p></div>`;
   const c=CARS.find(k=>k.id===x.id),en=carEn(c),ok=!x.taken&&!left&&!inJail()&&S.energy>=en&&S.cars.length<GARAGE_MAX;
   return `<article class="scar d${c.d} ${x.taken?'taken':''}"><div class="label">${x.spot}</div>
    <div class="scar-car" aria-hidden="true"><i></i></div>
    <h3>${c.n}</h3><div class="meta"><span class="tag g">± ${fmt(c.v)}</span><span class="tag lvl${c.d}">${CAR_LEVEL[c.d]}</span><span class="tag b">${en} energie</span></div>
    <button class="btn" onclick="act.stealCar(${i})" ${ok?'':'disabled'}>${x.taken?'Weg':inJail()?'Je zit vast':left?'Wacht '+Math.ceil(left/1000)+'s':S.cars.length>=GARAGE_MAX?'Garage vol':S.energy<en?'Te moe':'Stelen'}</button></article>`}).join('')}</div>
 <div class="tierhead"><h2>Garage</h2><span>${S.cars.length} / ${GARAGE_MAX}</span></div>
 <div class="card">${S.cars.length?S.cars.map((c,i)=>`<div class="row car"><span><b>${c.n}</b> <span class="tag g">${fmt(c.v)}</span></span><button class="btn sm" onclick="act.sell(${i})">Verkoop</button></div>`).join('')+`<button class="btn" style="margin-top:10px" onclick="act.sellAll()">Alles verkopen · ${fmt(S.cars.reduce((a,c)=>a+c.v,0))}</button>`:'<div class="empty">Je garage is leeg.</div>'}</div>`};
Object.assign(act,{async stealCar(i){const x=S.street&&S.street.cars[i];if(!x||x.taken||inJail()||cdLeft('car')||window.__chase)return;
  const c=CARS.find(k=>k.id===x.id),en=carEn(c);if(S.energy<en){toast('Te moe','bad');return}if(S.cars.length>=GARAGE_MAX){toast('Garage vol, verkoop eerst iets','bad');return}
  S.energy-=en;S.cd.car=now()+carCd();S.pendingHeist={id:c.id};save();pushState();
  const ok=await carHeist(c);x.taken=true;S.pendingHeist=null;
  if(ok){const v=Math.floor(c.v*(rnd(75,110)/100)*(1+S.skills.cars*0.04));S.cars.push({n:c.n,v});S.stats.cars++;S.cred+=c.d>=3?2:1;S.heat=Math.min(100,S.heat+c.d*2);addXp(6+c.d*c.d*4);
    toast(c.n+' gestolen! Waarde '+fmt(v));log(c.n+' gestolen ('+fmt(v)+')','ok');save();render()}
  else{S.heat=Math.min(100,S.heat+4+c.d*2);log('Mislukte poging: '+c.n,'bad');save();render();
    arrest(30+c.d*20,'Alarm!','Het alarm van de '+c.n+' gaat af. '+FLEE_LEVELS[Math.min(5,c.d)].where,{flee:Math.min(5,Math.max(1,c.d))})}}});
