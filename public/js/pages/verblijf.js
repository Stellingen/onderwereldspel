// Tab: Verblijf — je woningen (bovenaan, om te verhuizen), je eigen woning als tafereel om in te richten,
// rusten en dokter (alleen zolang je blijft) en onderduiken (loopt door). Tafereel en inrichten: inrichting.js.
const STAY={
 rest:{dur:()=>home().rest*1000,cd:()=>home().cd*1000*(1-furnFx('restCd'))*waitK(),key:'vb_rest'},
 doc:{dur:()=>DOC.dur*1000,cd:()=>DOC.cd*1000*(1-furnFx('docCd'))*waitK(),key:'vb_doc'}};
window.stay=window.stay||{kind:null,t0:0,dur:0,from:null,timer:null};
window.vb=window.vb||{sel:null,edit:false,view:null,pay:'cash'};
const stayP=()=>stay.kind?Math.min(1,(performance.now()-stay.t0)/stay.dur):0;
const stayCd=k=>STAY[k].key?cdLeft(STAY[k].key):0;
const docHp=()=>DOC.hp+furnFx('docHp');
function stayTarget(k){const f=stay.kind===k&&stay.from?stay.from:{e:S.energy,h:S.hp,heat:S.heat},h=home();
 if(k==='rest')return {e:Math.max(EN_MAX,f.e),h:Math.min(100,f.h+h.hp+furnFx('restHp')),heat:Math.max(0,f.heat-h.heat)};
 return {h:Math.min(100,f.h+docHp())}}
function stayUseful(k){if(k==='rest')return S.energy<EN_MAX-.5||S.hp<100;return S.hp<100}
function stayApply(p){const f=stay.from,T=stayTarget(stay.kind);
 if(stay.kind==='rest'){S.energy=f.e+(T.e-f.e)*p;S.hp=Math.round(f.h+(T.h-f.h)*p);if(!S.hide&&T.heat<f.heat)S.heat=Math.min(S.heat,Math.round(f.heat+(T.heat-f.heat)*p))}
 else S.hp=Math.round(f.h+(T.h-f.h)*p)}
function stayStop(reason){const k=stay.kind;if(!k)return;const p=stayP();stayApply(p);clearInterval(stay.timer);stay.kind=null;
 // wachttijd naar verhouding: half gerust = halve wachttijd
 if(STAY[k].key&&p>0)S.cd[STAY[k].key]=now()+Math.round(STAY[k].cd()*p);
 if(p>=1){if(k==='rest'){toast('Uitgerust. Energie vol, gezondheid '+S.hp+'%.');log('Uitgerust in '+home().n,'ok')}
  else{toast('De dokter heeft je opgelapt. Gezondheid '+S.hp+'%.');log('Dokterbezoek: gezondheid '+S.hp+'%','ok')}
  SFX.win(3)}
 else if(reason)toast((k==='rest'?'Rust':'Dokterbezoek')+' onderbroken bij '+Math.round(p*100)+'%.','bad');
 save();if(page==='verblijf')render();else{renderTop();renderNav()}}
function stayStart(k){if(stay.kind||inJail()||stayCd(k)||!stayUseful(k))return;vb.sel=null;
 Object.assign(stay,{kind:k,t0:performance.now(),dur:STAY[k].dur(),from:{e:S.energy,h:S.hp,heat:S.heat},fx0:performance.now()});SFX.click();render();
 stay.timer=setInterval(()=>{if(page!=='verblijf'||document.hidden){stayStop(true);return}const p=stayP();stayApply(p);vbLive();renderTop();if(p>=1)stayStop(false)},100)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&stay.kind)stayStop(true)});
window.addEventListener('hashchange',()=>{if(stay.kind&&location.hash.slice(1)!=='verblijf')stayStop(true)});
// Onderduiken loopt door als je weggaat. Op Verblijf zakt je hitte snel en word je bijna nooit herkend;
// elders loop je vermomd rond: je hitte zakt 4x zo traag en een agent kan je herkennen (dan word je opgepakt).
// Sloten en een hek laten je sneller onderduiken (hideRate); met een hond kijkt niemand twee keer (hideRisk).
const HIDE={home:20,away:5,riskHome:.005,riskAway:.04}; // hitte per minuut, kans per minuut bij 100% hitte
const hideRate=w=>(w==='home'?HIDE.home:HIDE.away)*(1+furnFx('hideRate'));
const hideRisk=w=>(w==='home'?HIDE.riskHome:HIDE.riskAway)*(1-Math.min(.8,furnFx('hideRisk')));
const hideHome=()=>page==='verblijf'&&!document.hidden;
function hideStart(){if(S.hide||inJail()||S.heat<=0)return;S.hide={t0:now(),from:S.heat};S._hideAcc=0;SFX.click();
 toast('Ondergedoken. Hier zakt je hitte snel; ga je weg, dan loop je vermomd rond.');log('Ondergedoken met '+S.heat+'% hitte','info');save();render()}
function hideStop(msg){if(!S.hide)return;S.hide=null;S._hideAcc=0;if(msg)toast(msg);save();if(page==='verblijf')render();else renderTop()}
// mins = minuten sinds de vorige tik, live = het spel staat open (offline geen herkenning)
function hideTick(mins,live){if(!S.hide||mins<=0)return;if(inJail()){S.hide=null;return}
 const atHome=live&&hideHome();S._hideAcc=(S._hideAcc||0)+hideRate(atHome?'home':'away')*mins;const d=Math.floor(S._hideAcc);if(d>0){S.heat=Math.max(0,S.heat-d);S._hideAcc-=d}
 if(S.heat<=0){S.hide=null;S._hideAcc=0;if(S.wanted){S.wanted=false;toast('Ondergedoken. Je staat niet meer op de gezochtlijst.','lvl')}else toast('Ondergedoken. Je hitte is weg.');
  log('Onderduiken klaar: hitte 0','ok');SFX.win(3);if(page==='verblijf')render();return}
 if(live&&$('#modal').hidden&&!window.__chase&&Math.random()<hideRisk(atHome?'home':'away')*S.heat/100*mins){
  const sec=45+Math.round(S.heat*1.5);S.hide=null;S._hideAcc=0;log(atHome?'Verraden tijdens het onderduiken':'Herkend ondanks je vermomming','bad');save();
  arrest(sec,'Herkend!',atHome?'Een buurman heeft je verraden. De politie staat aan de deur.':'Een agent herkent je ondanks je vermomming.',{flee:atHome?4:2})}}
const RING=2*Math.PI*52;
const vbRing=(k,off,center,sub,extra)=>`<div class="va-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle id="ring_${k}" cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:${RING};stroke-dashoffset:${off}"/></svg>
   <div class="va-c"><b id="ringT_${k}">${center}</b><span>${sub}</span></div>${extra||''}</div>`;
function vbHideCard(){const on=!!S.hide,heat=S.heat,rh=Math.round(hideRate('home')),ra=Math.round(hideRate('away')*10)/10;
 return `<article class="va hd ${on?'on':''} ${heat>=100?'hot':''}" style="--c:#b8a1ff">
  ${vbRing('hide',RING*(1-heat/100),heat+'%','hitte')}
  <div class="va-b"><h3 data-fit="12">Onderduiken</h3><p>${on?'Je bent ondergedoken. Luiken dicht, telefoon uit.':'Luiken dicht, telefoon uit. Of ga vermomd de straat op.'}</p>
   <div class="va-eff"><div><span>Hier thuis</span><b>−${rh}%/min</b><i></i><em>bijna nooit herkend</em></div>
    <div><span>Vermomd elders</span><b>−${String(ra).replace('.',',')}%/min</b><i></i><em>${furnFx('hideRisk')?'minder kans herkend':'kans op herkenning'}</em></div>${S.wanted?'<div><span>Op de gezochtlijst</span><b>ja</b><i>→</i><em>nee bij 0%</em></div>':''}</div>
   <button class="btn ${on?'ghost':''}" onclick="${on?"hideStop('Je duikt weer op.')":'hideStart()'}" ${!on&&(inJail()||heat<=0)?'disabled':''}>${on?'Stoppen met onderduiken':inJail()?'Je zit vast':heat<=0?'Geen hitte':'Onderduiken'}</button>
   <div class="va-note">${on?`Hier ben je over <b id="hideEta">${fmtClock(heat/rh*60000)}</b> klaar. Ga je weg, dan loopt het door, maar 4× zo traag en de politie kan je herkennen.`:'Je kunt gewoon verder spelen. Op deze pagina zakt je hitte 4× zo snel en word je bijna nooit herkend.'}</div></div></article>`}
// Live bijwerken zonder hertekenen
function vbLive(){const k=stay.kind;
 const hf=document.getElementById('ring_hide'),ht=document.getElementById('ringT_hide');if(hf){hf.style.strokeDashoffset=RING*(1-S.heat/100);ht.textContent=S.heat+'%'}
 const he=document.getElementById('hideEta');if(he&&S.hide)he.textContent=fmtClock(S.heat/hideRate('home')*60000);
 ['rest','doc'].forEach(x=>{const fg=document.getElementById('ring_'+x),tx=document.getElementById('ringT_'+x);if(!fg)return;
  if(x===k){const p=stayP();fg.style.strokeDashoffset=RING*(1-p);tx.textContent=Math.round(p*100)+'%'}
  else{const c=stayCd(x);if(c){fg.style.strokeDashoffset=RING*(c/STAY[x].cd());tx.textContent=fmtClock(c);
   // de knop telt met dezelfde klok mee als de ring (anders bleef hij op de tijd van het tekenen staan)
   const bt=document.getElementById('vbCd_'+x);if(bt)bt.textContent=fmtClock(c)}}});
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v},bar=(id,p)=>{const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,p))+'%'};
 set('vbE',Math.floor(S.energy));set('vbH',S.hp+'%');set('vbHd',S.hp+'%');set('vbHeat2',S.heat+'%');
 set('vbE2',Math.floor(S.energy)+'/'+EN_MAX);set('vbHs',S.hp+'%');set('vbHeat',S.heat+'%');bar('vbEb',S.energy/EN_MAX*100);bar('vbHb',S.hp);bar('vbTb',S.heat)}
let _vbSig='';
setInterval(()=>{if(page!=='verblijf'||stay.kind)return;const sig=['rest','doc'].map(k=>stayCd(k)>0).join()+inJail()+!!S.hide+(S.heat>0);
 if(sig!==_vbSig&&_vbSig){_vbSig=sig;if(!userBusy())render();return}_vbSig=sig;vbLive()},1000);

/* ---------- Pagina ---------- */
function vbAct(k){const h=home(),active=stay.kind===k,other=stay.kind&&!active,cd=stayCd(k),useful=stayUseful(k),T=stayTarget(k),p=active?stayP():0;
 const C={rest:['#a9dcff','Rusten','Slaap even bij in '+(h.id==='brug'?'je hoek onder de brug':'je '+house().n.toLowerCase())+'.',h.rest+' s'],doc:['#3fe395','Dokter','De huisartsenpost om de hoek lapt je op.',DOC.dur+' s']}[k];
 const off=active?RING*(1-p):cd?RING*(cd/STAY[k].cd()):RING;
 const center=active?Math.round(p*100)+'%':cd?fmtClock(cd):C[3];
 const sub=active?'bezig':cd?'wachten':'duur';
 const rows=k==='rest'?[['Energie',`<b id="vbE">${Math.floor(S.energy)}</b>`,Math.floor(T.e)],['Gezondheid',`<b id="vbH">${S.hp}%</b>`,T.h+'%'],...(h.heat?[['Hitte',S.heat+'%',T.heat+'%']]:[])]
  :[['Gezondheid',`<b id="vbHd">${S.hp}%</b>`,T.h+'%']];
 const label=active?'Stoppen':other?'Even geduld':inJail()?'Je zit vast':cd?'Weer over <span id="vbCd_'+k+'">'+fmtClock(cd)+'</span>':!useful?(k==='rest'?'Al uitgerust':'Kerngezond'):({rest:'Rusten',doc:'Naar de dokter'})[k];
 const note=k==='rest'?`Elke ${fmtClock(STAY.rest.cd())} min. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.`:`+${docHp()}% gezondheid in ${DOC.dur} s, daarna ${fmtClock(STAY.doc.cd())} min wachten.`;
 return `<article class="va ${active?'on':''}" style="--c:${C[0]}">
  ${vbRing(k,off,center,sub,k==='doc'?'<svg class="ecg" viewBox="0 0 120 30"><path d="M0,15 L34,15 L40,15 L44,4 L50,26 L55,10 L59,15 L120,15"/></svg>':'')}
  <div class="va-b"><h3 data-fit="12">${C[1]}</h3><p>${C[2]}</p>
   <div class="va-eff">${rows.map(r=>`<div><span>${r[0]}</span>${String(r[1]).startsWith('<b')?r[1]:`<b>${r[1]}</b>`}<i>→</i><em>${r[2]}</em></div>`).join('')}</div>
   <button class="btn ${active?'ghost':''}" onclick="${active?'stayStop(true)':`stayStart('${k}')`}" ${(!active&&(other||inJail()||cd||!useful))?'disabled':''}>${label}</button>
   <div class="va-note">${note}</div></div></article>`}
// Woning kiezen op de huizenmarkt
function vbSel(id){vb.view='markt';vb.sel=id||null;SFX.click();render();if(id)setTimeout(()=>{const e=document.getElementById('mkDetail');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})},40)}
function vbEdit(on){vb.edit=!!on;vb.sel=null;SFX.click();render();if(on)vbFocus()}
// op de telefoon staat het tafereel onder de woningen: even naar beneden scrollen
function vbFocus(){const st=document.getElementById('vbStage');if(!st)return;const r=st.getBoundingClientRect();if(r.top<56||r.top>innerHeight*.45)window.scrollTo({top:scrollY+r.top-70,behavior:'smooth'})}
// wat je spullen samen doen
function vbFurnSum(){const keys=Object.keys(FURN_FX).filter(k=>furnFx(k));return keys.length?keys.map(k=>{const top=FURN_CAP[k]!=null&&furnFxRaw(k)>=FURN_CAP[k]-1e-9;return `<li class="${top?'top':''}"><span>${FURN_FX[k][0]}</span><b>${FURN_FX[k][1](Math.round(furnFx(k)*100)/100)}${top?'<em title="Meer van dit effect helpt niet meer">max</em>':''}</b></li>`}).join(''):''}
function vbInfo(up){const h=home(),L=house(),used=furnPlaced().length,sum=vbFurnSum();
 return `<div class="vh-info"><div class="label">${L.place}${S.rent&&S.rent.id===L.id?' · gehuurd':houseOwned(L.id)&&L.id!=='brug'?' · eigen woning':''}</div><h2>${L.n}</h2><p>${L.d}</p>
  <dl class="vh-facts"><div><dt>Rust</dt><dd>${h.rest} s · elke ${fmtClock(STAY.rest.cd())}</dd></div><div><dt>Per rustbeurt</dt><dd>+${h.hp+furnFx('restHp')}% gezondheid</dd></div>
   <div><dt>Max. energie</dt><dd>${h.en?'+'+h.en:'geen extra'}</dd></div><div><dt>Hitte per rust</dt><dd>${h.heat?'−'+h.heat+'%':'—'}</dd></div></dl>
  <div class="vh-meters"><div><span>Energie</span><b id="vbE2">${Math.floor(S.energy)}/${EN_MAX}</b><i><em id="vbEb" style="width:${Math.min(100,S.energy/EN_MAX*100)}%;--c:var(--ice)"></em></i></div>
   <div><span>Gezondheid</span><b id="vbHs">${S.hp}%</b><i><em id="vbHb" style="width:${S.hp}%;--c:var(--green)"></em></i></div>
   <div><span>Hitte</span><b id="vbHeat">${S.heat}%</b><i><em id="vbTb" style="width:${S.heat}%;--c:${S.heat>60?'var(--red)':'var(--acc)'}"></em></i></div></div>
  ${sum?`<div class="vh-sum"><div class="label">Je spullen</div><ul>${sum}</ul></div>`:''}
  ${up?'':`<div class="vh-cta"><button class="btn" onclick="vbGo('shop')">Inrichten · ${used}/${furnSlots()} plekken</button></div>`}</div>`}
// Huizenmarkt: alle woningen als kaarten; kies er een voor de bezichtiging (vergelijken, kopen, huren, erin gaan wonen)
const vbTypeOf=L=>HOMES.find(t=>t.id===L.t)||HOMES[0];
function vbMkStatus(L){const ri=rankIdx(S.xp),own=houseOwned(L.id),cur=S.home===L.id,rent=S.rent&&S.rent.id===L.id;
 return cur?(rent?['rent','Gehuurd · hier woon je']:['cur','Hier woon je']):own&&L.id!=='brug'?['own','In bezit']:ri<L.r?['lock','Vanaf '+RANKS[L.r][0]]:L.id==='brug'?['free','Gratis']:['sale','Te koop of te huur']}
function vbMkCard(L){const T=vbTypeOf(L),[k,st]=vbMkStatus(L),own=houseOwned(L.id)&&L.id!=='brug',v=own?houseVal(L.id):0,o=own?ownedS()[L.id]:null,sel=vb.sel===L.id;
 return `<button class="mk-card ${k} ${sel?'sel':''}" onclick="vbSel('${L.id}')" aria-pressed="${sel}">
  <span class="mk-th">${vhScene(T.id,{thumb:1,key:'m'+L.id,furn:S.home===L.id?S.furn:{}})}</span>
  <span class="mk-b"><span class="mk-pl">${L.place}</span><b>${L.n}</b><span class="mk-st ${k}">${st}</span>
   <span class="mk-p">${L.id==='brug'?'<em>Gratis</em>':own?`<em>Waarde ${fmt(v)}</em><small class="${v>=o.b?'up':'dn'}">${v>=o.b?'+':''}${fmt(v-o.b)}</small>`:`<em>${fmt(mktPrice(L.id))}</em><small>of ${fmt(L.rent)} huur / speldag</small>`}</span></span></button>`}
function vbMkDetail(L){const h=home(),x=vbTypeOf(L),ri=rankIdx(S.xp),lock=ri<L.r,own=houseOwned(L.id),cur=S.home===L.id,xi=HOMES.indexOf(x),busy=!!stay.kind;
 const R=[['Rust',h.rest+' s',x.rest+' s',x.rest<h.rest],['Wachttijd rusten',fmtClock(h.cd*1000),fmtClock(x.cd*1000),x.cd<h.cd],['Per rustbeurt','+'+h.hp+'%','+'+x.hp+'%',x.hp>h.hp],['Max. energie','+'+h.en,'+'+x.en,x.en>h.en],['Hitte per rust',h.heat?'−'+h.heat+'%':'—',x.heat?'−'+x.heat+'%':'—',x.heat>h.heat],['Plekken voor spullen',furnSlots(),houseSlots(L.id),houseSlots(L.id)>furnSlots()]];
 const gone=cur?[]:FURN.filter(f=>S.furn[f.id]&&!furnFits(f,xi));
 const MP=mktPrice(L.id),affW=wit()>=MP,affB=S.bank>=MP,affR=S.bank+wit()>=L.rent,debt=(S.rent&&S.rent.debt>0)||S.rentOwed>0;
 const o=own&&L.id!=='brug'?ownedS()[L.id]:null,v=o?houseVal(L.id):0,days=o?Math.floor((now()-o.t)/DAY_MS):0;
 let acts='';
 if(cur)acts=`<div class="mk-here">${S.rent&&S.rent.id===L.id?'Je huurt deze woning':'Hier woon je'}</div>`;
 else if(own)acts=`<button class="btn" onclick="act.moveHouse('${L.id}')" ${busy||debt?'disabled':''}><span>Hier wonen</span><small>${L.id==='brug'?'gratis':'je eigen woning'}${debt?' · eerst je achterstand betalen':''}</small></button>`;
 else if(lock)acts=`<button class="btn ghost" disabled>Vanaf ${RANKS[L.r][0]}</button>`;
 else acts=`<div class="mk-buy">
   <button class="btn ${affW?'':'ghost'}" onclick="act.buyHouse('${L.id}','cash')" ${affW&&!busy?'':'disabled'}><span>${affW?'Kopen met wit geld':'Te weinig wit geld'}</span><small>${fmt(MP)} · je hebt ${fmt(wit())}</small></button>
   <button class="btn ${affB?'':'ghost'}" onclick="act.buyHouse('${L.id}','bank')" ${affB&&!busy?'':'disabled'}><span>${affB?'Kopen van de bank':'Te weinig op de bank'}</span><small>${fmt(MP)} · op de bank ${fmt(S.bank)}</small></button>
   <button class="btn ghost mk-rent" onclick="act.rentHouse('${L.id}')" ${affR&&!busy&&!debt?'':'disabled'}><span>Huren · ${fmt(L.rent)} per speldag</span><small>${debt?'eerst je achterstand betalen':'je betaalt nu de eerste speldag; daarna elke 4 uur automatisch'}</small></button></div>`;
 return `<section class="vh-stage is-prev mk-detail" id="mkDetail"><div class="vh-scene">${vhScene(x.id,{furn:cur?S.furn:Object.fromEntries(Object.keys(S.furn||{}).filter(k=>{const f=FURN.find(y=>y.id===k);return f&&furnFits(f,xi)}).map(k=>[k,1])),key:'s'})}${cur?'':'<div class="vh-live pv"><i></i>Bezichtiging</div>'}</div>
  <aside class="vh-side"><div class="vh-info prev"><div class="label">${L.place} · ${x.n}</div><h2>${L.n}</h2><p>${L.d}</p>
   ${o?`<div class="mk-val"><div><span>Gekocht voor</span><b>${fmt(o.b)}</b></div><div><span>Waarde nu</span><b class="${v>=o.b?'up':'dn'}">${fmt(v)}</b></div><div><span>Verkopen levert</span><b>${fmt(houseSell(L.id))}</b></div><small>${days} speldag${days===1?'':'en'} in bezit · stijgt ±${(L.g*100).toFixed(2).replace('.',',')}% per speldag, tot ${Math.round((L.cap-1)*100)}% boven de aankoopprijs · verkopen doe je bij <a href="#biz">Bezit</a></small></div>`:
    L.id!=='brug'?`<div class="mk-val"><div><span>Marktprijs</span><b>${fmt(mktPrice(L.id))}<small class="${mktChg(L.id,6)>=0?'up':'dn'}">${mktChg(L.id,6)>=0?'+':'−'}${Math.abs(mktChg(L.id,6)*100).toFixed(1).replace('.',',')}% /6 speldagen</small></b></div><div><span>Huur</span><b>${fmt(L.rent)}<small>/speldag</small></b></div><div><span>Trend</span><b>±${(L.g*100).toFixed(2).replace('.',',')}%<small>/speldag</small></b></div><small>De prijs volgt de huizenmarkt: op lange termijn omhoog, maar hij kan ook zakken. Een gekochte woning blijft van jou als je verhuist. Een huurwoning vervalt als je ergens anders gaat wonen.</small></div>`:''}
   ${cur?'':`<table class="vh-cmp"><thead><tr><th></th><th>Nu</th><th>${L.n}</th></tr></thead><tbody>${R.map(r=>`<tr class="${r[3]?'up':''}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`}
   ${gone.length?`<p class="vh-warn">${gone.map(f=>f.n).join(' en ')} ${gone.length>1?'passen':'past'} hier niet en ${gone.length>1?'gaan':'gaat'} naar de opslag.</p>`:''}
   <div class="vh-cta">${acts}<button class="vh-back" onclick="vbSel(null)">‹ Alle woningen</button></div></div></aside></section>`}
// huur: wat het kost, wanneer de volgende afschrijving is en hoe lang je nog hebt bij een achterstand
function vbRentHtml(){const R=S.rent;if(!R)return S.rentOwed>0?`<div class="mk-rentbar late"><div><span class="label">Oude huurschuld</span><b>${fmt(S.rentOwed)}</b><small>Van je uitzetting. Wordt automatisch verrekend zodra er geld op de bank of wit op zak is; tot die tijd kun je niets huren.</small></div></div>`:'';const L=houseOf(R.id),late=R.debt>0,left=late?Math.max(0,RENT_GRACE-rentDaysLate()):0,dl=late?rentDeadline():0;
 return `<div class="mk-rentbar ${late?'late':''}"><div><span class="label">${late?'Huurachterstand':'Je huurt'}</span><b>${L.n} · ${fmt(L.rent)} per speldag</b>
  <small>${late?`Nog <b>${fmt(R.debt)}</b> open. Betaal binnen ${left} speldag${left===1?'':'en'} (vóór ${new Date(dl).toLocaleString('nl-NL',{weekday:'short',hour:'2-digit',minute:'2-digit'})}), anders word je uitgezet.`:`Volgende afschrijving om ${new Date(rentNext(R.paid)).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}, eerst van de bank, anders van je wit geld.`}</small></div>
  ${late?`<button class="btn" onclick="act.payRent()" ${S.bank+wit()>0?'':'disabled'}>Achterstand betalen</button>`:''}</div>`}
function vbMarktHtml(){const tab=vb.mt||'all',L=HOUSES.filter(x=>tab==='all'||(tab==='mine'?houseOwned(x.id)||S.home===x.id:!houseOwned(x.id))),sel=vb.sel&&HOUSES.find(x=>x.id===vb.sel);
 const nOwn=Object.keys(ownedS()).length,val=homesVal();
 return `${vbBackHtml('Huizenmarkt')}
  <div class="mk-top"><p>Koop een woning (blijft van jou en stijgt in waarde) of huur er een (elke speldag automatisch betaald). Betere woningen: meer rust, energie en plek voor spullen.</p>
   <div class="mk-kpis"><div><span>In bezit</span><b>${nOwn}</b></div><div><span>Waarde</span><b>${fmt(val)}</b></div><div><span>Huur</span><b>${S.rent?fmt(houseOf(S.rent.id).rent)+'/sd':'—'}</b></div></div></div>
  ${vbRentHtml()}
  ${sel?vbMkDetail(sel):''}
  <div class="fit-tabs2 mk-tabs">${[['all','Alle woningen',HOUSES.length],['mine','Mijn woningen',HOUSES.filter(x=>houseOwned(x.id)||S.home===x.id).length],['sale','Te koop',HOUSES.filter(x=>!houseOwned(x.id)).length]].map(([k,n,c])=>`<button class="${tab===k?'on':''}" onclick="vb.mt='${k}';render()">${n} <small>${c}</small></button>`).join('')}</div>
  <div class="mk-grid">${L.map(vbMkCard).join('')}</div>`}
// Pagina-indeling:// Pagina-indeling: bovenaan rusten, dokter en onderduiken; daaronder twee knoppen (winkel, upgraden); dan je woning.
// vb.view: null = je woning, 'shop' = winkel (kopen, neerzetten, opbergen), 'markt' = huizenmarkt (kopen, huren, verhuizen)
const VB_IC={shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16l-1.3 11.1a2 2 0 0 1-2 1.9H7.3a2 2 0 0 1-2-1.9z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>',
 up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M12 18v-6M9.5 14.5L12 12l2.5 2.5"/></svg>',
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>'};
function vbGo(v){if(stay.kind&&v)return;vb.view=v||null;vb.edit=v==='shop';vb.sel=null;SFX.click();render();window.scrollTo({top:0,behavior:'smooth'})}
// betalen: contant of van de bank (lopende rekening)
const vbPayHtml=(p)=>`<div class="vb-pay" role="group" aria-label="Betalen met"><span>Betalen met</span>
  <button class="${vb.pay!=='bank'?'on':''}" onclick="vb.pay='cash';render()"><small>Contant</small><b>${fmt(p==='wit'?wit():S.cash)}</b></button>
  <button class="${vb.pay==='bank'?'on':''}" onclick="vb.pay='bank';render()"><small>Bankrekening</small><b>${fmt(S.bank)}</b></button></div>`;
function vbNavHtml(){const h=home(),hi=HOMES.indexOf(h),free=furnFree(),buy=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&furnFits(f,hi)).length;
 const ri=rankIdx(S.xp),open=HOUSES.filter(x=>!houseOwned(x.id)&&x.r<=ri),better=open.filter(x=>HOMES.findIndex(t=>t.id===x.t)>hi),nOwn=Object.keys(ownedS()).length;
 const sub=S.rent&&S.rent.debt>0?'Huurachterstand: '+fmt(S.rent.debt):S.rent?'Je huurt · '+fmt(houseOf(S.rent.id).rent)+' per speldag':nOwn?nOwn+' woning'+(nOwn>1?'en':'')+' in bezit · '+fmt(homesVal()):better.length?better.length+' betere woning'+(better.length>1?'en':'')+' te koop of te huur':'Kopen, huren en verhuizen';
 return `<div class="vb-nav">
  <button class="vb-big shop" onclick="vbGo('shop')" ${stay.kind?'disabled':''}><span class="vb-ic">${VB_IC.shop}</span><span class="vb-bt"><b>Winkel</b><small>Spullen voor je ${S.home==='brug'?'plek onder de brug':house().n.toLowerCase()} · ${buy?buy+' te koop':'alles gekocht'} · ${free} plek${free===1?'':'ken'} vrij</small></span><i class="vb-arr">›</i></button>
  <button class="vb-big up ${better.length?'can':''} ${S.rent&&S.rent.debt>0?'late':''}" onclick="vbGo('markt')" ${stay.kind?'disabled':''}><span class="vb-ic">${VB_IC.up}</span><span class="vb-bt"><b>Huizenmarkt</b><small>${sub}</small></span><i class="vb-arr">›</i></button></div>`}
const vbBackHtml=t=>`<div class="vb-bar"><button class="vb-back" onclick="vbGo(null)">${VB_IC.back}<span>Verblijf</span></button><h2>${t}</h2></div>`;
// Winkel: per spul een kaart met wat het doet en de prijs. Wat bij een betere woning hoort, zie je al (op slot).
const FURN_IC={hp:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',en:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',hide:'<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 4l16 16"/>',
 focus:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',safe:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 run:'<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v5M7 12l3-4 4 2 3 3M10 8l-3 1"/>',time:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',heat:'<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z"/>'};
const furnIc=f=>{const k=Object.keys(f.fx)[0],m={restHp:'hp',hpRegen:'hp',docHp:'hp',en:'en',enRegen:'en',hideRate:'hide',hideRisk:'hide',focus:'focus',safe:'safe',zone:'run',restCd:'time',docCd:'time',heat:'heat'}[k]||'focus';
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${FURN_IC[m]}</svg>`};
// winkel: filter op wat een spul doet
const FURN_CAT=[['all','Alles'],['hp','Gezondheid en rust'],['en','Energie'],['hide','Onderduiken en hitte'],['safe','Veiligheid'],['focus','Focus en vluchten']];
// categorie = het eerste (belangrijkste) voordeel van een stuk
const furnCat=f=>{const k=Object.keys(f.fx)[0];return ['restHp','hpRegen','docHp','restCd','docCd'].includes(k)?'hp':['en','enRegen'].includes(k)?'en':['hideRate','hideRisk','heat'].includes(k)?'hide':k==='safe'?'safe':'focus'};
function vbShopHtml(){const hi=furnHi(),h=home(),used=furnPlaced().length,free=furnFree(),bank=vb.pay==='bank',have=bank?S.bank:S.cash,cf=vb.cat||'all',fc=L=>cf==='all'?L:L.filter(f=>furnCat(f)===cf);
 const placed=furnPlaced(),stored=FURN.filter(f=>S.furnStore&&S.furnStore[f.id]),buy=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&furnFits(f,hi)),later=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&hi<f.h);
 const card=(f,kind)=>{const why=furnWhy(f);let btn='';
  if(kind==='buy')btn=`<button class="btn sm" onclick="act.buyFurn('${f.id}','${bank?'bank':'cash'}')" ${have>=f.p&&free?'':'disabled'}>${!free?'Geen plek vrij':have<f.p?(bank?'Te weinig op de bank':'Te weinig contant'):'Kopen'}</button>`;
  else if(kind==='in')btn=`<button class="btn ghost sm" onclick="act.storeFurn('${f.id}')">Opbergen</button>`;
  else if(kind==='store')btn=why?`<button class="btn ghost sm" onclick="act.sellFurn('${f.id}')">Verkopen · ${fmt(furnSell(f))}</button>`:`<button class="btn sm" onclick="act.placeFurn('${f.id}')" ${free?'':'disabled'}>${free?'Neerzetten':'Geen plek'}</button><button class="btn ghost sm" onclick="act.sellFurn('${f.id}')" title="De helft terug">${fmt(furnSell(f))}</button>`;
  return `<article class="fs-card ${kind}" style="--c:${f.col}" data-it="${f.id}" onmouseenter="vhHover('${f.id}')" onmouseleave="vhHover(null)">
   <div class="fs-ic">${furnIc(f)}</div><div class="fs-b"><div class="fs-h"><b>${f.n}</b>${kind==='later'?`<span class="fs-lock">${HOMES[f.h].n}</span>`:kind==='in'?'<span class="fs-in">In huis</span>':kind==='store'?'<span class="fs-st">Opslag</span>':''}</div>
    <p>${f.d}</p><div class="fs-fx">${furnFxList(f)}</div>
    <div class="fs-f"><span class="fs-p">${kind==='in'||kind==='store'?'':fmt(f.p)}</span>${kind==='later'?`<span class="fs-why">Vanaf ${HOMES[f.h].n.toLowerCase()}</span>`:`<span class="fs-btn">${btn}</span>`}</div></div></article>`};
 const sec=(t,sub,list0,kind)=>{const list=fc(list0);return list.length?`<section class="fs-sec ${kind}"><div class="fs-sh"><h3>${t}</h3><span>${sub}</span></div><div class="fs-grid">${list.map(f=>card(f,kind)).join('')}</div></section>`:''};
 const byHome=HOMES.map((x,i)=>[x,later.filter(f=>f.h===i)]).filter(([,L])=>L.length),nLater=fc(later).length;
 const tsl=x=>{const [a,b]=typeSlots(x.id);return a===b?a+' plekken':a+'–'+b+' plekken'};
 return `${vbBackHtml('Winkel')}
  <div class="fs-top"><div class="fs-slots"><span class="label">${house().n} · plekken</span>${furnSlotBar(used)}<small>Hoe beter je woning, hoe meer plek en hoe grotere spullen.${tierSlots()?` Als ${lidName()} heb je in elke woning ${tierSlots()} plekken extra.`:''}</small></div>${vbPayHtml('cash')}</div>
  <div class="fit-tabs2 fs-cats">${FURN_CAT.map(([k,n])=>{const c=k==='all'?FURN.length:FURN.filter(f=>furnCat(f)===k).length;return `<button class="${cf===k?'on':''}" onclick="vb.cat='${k}';render()">${n} <small>${c}</small></button>`}).join('')}</div>
  <section class="vh-stage is-edit fs-stage" id="vbStage"><div class="vh-scene">${(()=>{const nw=window._vbNew;window._vbNew=null;let sc=vhScene(h.id,{furn:S.furn,ghosts:true,key:'s'});if(nw)sc=sc.replace(`class="vh-it" data-it="${nw}"`,`class="vh-it new" data-it="${nw}"`);return sc})()}</div></section>
  ${sec('In huis',used+' van '+furnSlots()+' plekken · wat neerstaat, werkt',placed,'in')}${sec('Te koop',free?'past in je '+house().n.toLowerCase()+' · '+free+' plek'+(free===1?'':'ken')+' vrij':'alles vol · berg eerst iets op',buy,'buy')}${sec('In de opslag','bewaard voor later',stored,'store')}
  ${nLater?`<details class="fs-later" ${vb.later?'open':''} ontoggle="vb.later=this.open"><summary><b>Nog op slot</b><span>${nLater} spul${nLater===1?'':'len'} voor een betere woning</span></summary>
   ${byHome.map(([x,L])=>sec('Bij een '+x.n.toLowerCase(),tsl(x),L,'later')).join('')}</details>`:''}`}
V.verblijf=()=>{const h=home();if(stay.kind&&vb.view)vb.view=null;
 if(vb.view==='shop')return vbShopHtml();
 if(vb.view==='up'||vb.view==='markt')return vbMarktHtml();
 vb.sel=null;vb.edit=false;
 const st=stay.kind?({rest:'Aan het rusten',doc:'Bij de dokter'})[stay.kind]:S.hide?'Ondergedoken':'';
 const nw=window._vbNew;window._vbNew=null;let scene=vhScene(h.id,{furn:S.furn,key:'s'});if(nw)scene=scene.replace(`class="vh-it" data-it="${nw}"`,`class="vh-it new" data-it="${nw}"`);
 return `<div class="vb-head"><h1>Verblijf</h1><span>${house().n} · ${house().place}</span></div>
 ${vbRentHtml()}
 <div class="vb-acts vh-acts vb-top">${['rest','doc'].map(vbAct).join('')}${vbHideCard()}</div>
 ${vbNavHtml()}
 <section class="vh-stage ${stay.kind?'act-'+stay.kind:''} ${S.hide?'is-hide':''}" id="vbStage">
  <div class="vh-scene ${stay.kind?'':'can-edit'}" ${stay.kind?'':`onclick="vbGo('shop')" title="Naar de winkel" role="button" tabindex="0" onkeydown="if(event.key==='Enter')vbGo('shop')"`}>${scene}
   ${st?`<div class="vh-live"><i></i>${st}</div>`:''}${!stay.kind?'<div class="vh-hint">Tik om in te richten</div>':''}</div>
  <aside class="vh-side">${vbInfo()}</aside>
 </section>`};
// oude knop (verhuizen naar de volgende woning) wijst nu naar de huizenmarkt
Object.assign(act,{moveHome(id){vbSel(id)}});
