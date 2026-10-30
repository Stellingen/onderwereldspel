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
 if(k==='rest')return {e:EN_MAX,h:Math.min(100,f.h+h.hp+furnFx('restHp')),heat:Math.max(0,f.heat-h.heat)};
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
  <div class="va-b"><h3>Onderduiken</h3><p>${on?'Je bent ondergedoken. Luiken dicht, telefoon uit.':'Luiken dicht, telefoon uit. Of ga vermomd de straat op.'}</p>
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
  else{const c=stayCd(x);if(c){fg.style.strokeDashoffset=RING*(c/STAY[x].cd());tx.textContent=fmtClock(c)}}});
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v},bar=(id,p)=>{const e=document.getElementById(id);if(e)e.style.width=Math.max(0,Math.min(100,p))+'%'};
 set('vbE',Math.floor(S.energy));set('vbH',S.hp+'%');set('vbHd',S.hp+'%');set('vbHeat2',S.heat+'%');
 set('vbE2',Math.floor(S.energy)+'/'+EN_MAX);set('vbHs',S.hp+'%');set('vbHeat',S.heat+'%');bar('vbEb',S.energy/EN_MAX*100);bar('vbHb',S.hp);bar('vbTb',S.heat)}
let _vbSig='';
setInterval(()=>{if(page!=='verblijf'||stay.kind)return;const sig=['rest','doc'].map(k=>stayCd(k)>0).join()+inJail()+!!S.hide+(S.heat>0);
 if(sig!==_vbSig&&_vbSig){_vbSig=sig;if(!userBusy())render();return}_vbSig=sig;vbLive()},1000);

/* ---------- Pagina ---------- */
function vbAct(k){const h=home(),active=stay.kind===k,other=stay.kind&&!active,cd=stayCd(k),useful=stayUseful(k),T=stayTarget(k),p=active?stayP():0;
 const C={rest:['#a9dcff','Rusten','Slaap even bij in '+(h.id==='brug'?'je hoek onder de brug':'je '+h.n.toLowerCase())+'.',h.rest+' s'],doc:['#3fe395','Dokter','De huisartsenpost om de hoek lapt je op.',DOC.dur+' s']}[k];
 const off=active?RING*(1-p):cd?RING*(cd/STAY[k].cd()):RING;
 const center=active?Math.round(p*100)+'%':cd?fmtClock(cd):C[3];
 const sub=active?'bezig':cd?'wachten':'duur';
 const rows=k==='rest'?[['Energie',`<b id="vbE">${Math.floor(S.energy)}</b>`,Math.floor(T.e)],['Gezondheid',`<b id="vbH">${S.hp}%</b>`,T.h+'%'],...(h.heat?[['Hitte',S.heat+'%',T.heat+'%']]:[])]
  :[['Gezondheid',`<b id="vbHd">${S.hp}%</b>`,T.h+'%']];
 const label=active?'Stoppen':other?'Even geduld':inJail()?'Je zit vast':cd?'Weer over '+fmtClock(cd):!useful?(k==='rest'?'Al uitgerust':'Kerngezond'):({rest:'Rusten',doc:'Naar de dokter'})[k];
 const note=k==='rest'?`Elke ${fmtClock(STAY.rest.cd())} min. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.`:`+${docHp()}% gezondheid in ${DOC.dur} s, daarna ${fmtClock(STAY.doc.cd())} min wachten.`;
 return `<article class="va ${active?'on':''}" style="--c:${C[0]}">
  ${vbRing(k,off,center,sub,k==='doc'?'<svg class="ecg" viewBox="0 0 120 30"><path d="M0,15 L34,15 L40,15 L44,4 L50,26 L55,10 L59,15 L120,15"/></svg>':'')}
  <div class="va-b"><h3>${C[1]}</h3><p>${C[2]}</p>
   <div class="va-eff">${rows.map(r=>`<div><span>${r[0]}</span>${String(r[1]).startsWith('<b')?r[1]:`<b>${r[1]}</b>`}<i>→</i><em>${r[2]}</em></div>`).join('')}</div>
   <button class="btn ${active?'ghost':''}" onclick="${active?'stayStop(true)':`stayStart('${k}')`}" ${(!active&&(other||inJail()||cd||!useful))?'disabled':''}>${label}</button>
   <div class="va-note">${note}</div></div></article>`}
// Woning kiezen bovenaan: je eigen woning opent het inrichten, een andere woning laat zien wat verhuizen oplevert
function vbSel(id){const cur=home().id;if(stay.kind&&id&&id!==cur)return;vb.view='up';vb.sel=id||cur;SFX.click();render()}
function vbEdit(on){vb.edit=!!on;vb.sel=null;SFX.click();render();if(on)vbFocus()}
// op de telefoon staat het tafereel onder de woningen: even naar beneden scrollen
function vbFocus(){const st=document.getElementById('vbStage');if(!st)return;const r=st.getBoundingClientRect();if(r.top<56||r.top>innerHeight*.45)window.scrollTo({top:scrollY+r.top-70,behavior:'smooth'})}
// wat je spullen samen doen
function vbFurnSum(){const keys=Object.keys(FURN_FX).filter(k=>furnFx(k));return keys.length?keys.map(k=>`<li><span>${FURN_FX[k][0]}</span><b>${FURN_FX[k][1](Math.round(furnFx(k)*100)/100)}</b></li>`).join(''):''}
function vbStep(x,i){const hi=HOMES.indexOf(home()),ri=rankIdx(S.xp),cur=i===hi,past=i<hi,next=i===hi+1,lock=ri<x.r,sel=(vb.sel||home().id)===x.id;
 const st=cur?`Hier woon je · ${furnPlaced().length}/${x.slots} plekken`:past?'Gewoond':next?(lock?'Vanaf '+RANKS[x.r][0]+' · '+fmt(x.p):wit()>=x.p?'Verhuizen · '+fmt(x.p):fmt(x.p)):'Vanaf '+RANKS[x.r][0]+' · '+fmt(x.p);
 const thumb=vhScene(x.id,{thumb:1,key:'t',furn:cur?S.furn:{}});
 return `<button class="vh-step ${cur?'cur':past?'past':next?'next':'lock'} ${sel?'sel':''} ${next&&!lock&&wit()>=x.p?'can':''}" onclick="vbSel('${x.id}')" aria-pressed="${sel}" ${stay.kind&&!cur?'disabled':''}>
  <span class="vh-th">${thumb}</span><span class="vh-sb"><span class="vh-pl">${x.place}</span><b>${x.n}</b><em>${st}</em></span></button>`}
function vbInfo(up){const h=home(),hi=HOMES.indexOf(h),nx=HOMES[hi+1],used=furnPlaced().length,sum=vbFurnSum();
 return `<div class="vh-info"><div class="label">${h.place}</div><h2>${h.n}</h2><p>${h.d}</p>
  <dl class="vh-facts"><div><dt>Rust</dt><dd>${h.rest} s · elke ${fmtClock(STAY.rest.cd())}</dd></div><div><dt>Per rustbeurt</dt><dd>+${h.hp+furnFx('restHp')}% gezondheid</dd></div>
   <div><dt>Max. energie</dt><dd>${h.en?'+'+h.en:'geen extra'}</dd></div><div><dt>Hitte per rust</dt><dd>${h.heat?'−'+h.heat+'%':'—'}</dd></div></dl>
  <div class="vh-meters"><div><span>Energie</span><b id="vbE2">${Math.floor(S.energy)}/${EN_MAX}</b><i><em id="vbEb" style="width:${Math.min(100,S.energy/EN_MAX*100)}%;--c:var(--ice)"></em></i></div>
   <div><span>Gezondheid</span><b id="vbHs">${S.hp}%</b><i><em id="vbHb" style="width:${S.hp}%;--c:var(--green)"></em></i></div>
   <div><span>Hitte</span><b id="vbHeat">${S.heat}%</b><i><em id="vbTb" style="width:${S.heat}%;--c:${S.heat>60?'var(--red)':'var(--acc)'}"></em></i></div></div>
  ${sum?`<div class="vh-sum"><div class="label">Je spullen</div><ul>${sum}</ul></div>`:''}
  ${up?'':`<div class="vh-cta"><button class="btn" onclick="vbGo('shop')">Inrichten · ${used}/${h.slots} plekken</button></div>`}</div>`}
function vbPreview(x){const h=home(),i=HOMES.indexOf(x),hi=HOMES.indexOf(h),ri=rankIdx(S.xp),lock=ri<x.r,afford=wit()>=x.p,next=i===hi+1,past=i<hi;
 const R=[['Rust',h.rest+' s',x.rest+' s',x.rest<h.rest],['Wachttijd rusten',fmtClock(h.cd*1000),fmtClock(x.cd*1000),x.cd<h.cd],['Per rustbeurt','+'+h.hp+'%','+'+x.hp+'%',x.hp>h.hp],['Max. energie','+'+h.en,'+'+x.en,x.en>h.en],['Hitte per rust',h.heat?'−'+h.heat+'%':'—',x.heat?'−'+x.heat+'%':'—',x.heat>h.heat],['Plekken voor spullen',h.slots,x.slots,x.slots>h.slots]];
 const gone=FURN.filter(f=>S.furn[f.id]&&f.hmax!=null&&i>f.hmax);
 const label=past?'Al achter je gelaten':lock?'Vanaf '+RANKS[x.r][0]:!next?'Eerst '+HOMES[i-1].n.toLowerCase():!afford?(S.cash>=x.p?'Eerst witwassen · '+fmt(x.p-wit())+' wit nodig':'Nog '+fmt(x.p-wit())+' wit nodig'):'Verhuizen · '+fmt(x.p);
 return `<div class="vh-info prev"><div class="label">${x.place}</div><h2>${x.n}</h2><p>${x.d}</p>
  <table class="vh-cmp"><thead><tr><th></th><th>Nu</th><th>${x.n}</th></tr></thead><tbody>${R.map(r=>`<tr class="${!past&&r[3]?'up':''}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>
  ${gone.length&&!past?`<p class="vh-warn">${gone.map(f=>f.n).join(' en ')} ${gone.length>1?'gaan':'gaat'} naar de opslag: dat neem je niet mee.</p>`:''}
  <div class="vh-cta">${next&&!lock?`<div class="vh-buy2"><button class="btn ${afford?'':'ghost'}" onclick="act.moveHome('${x.id}','cash')" ${afford&&!stay.kind?'':'disabled'}><span>${afford?'Kopen met wit geld':'Te weinig wit geld'}</span><small>${fmt(x.p)} · je hebt ${fmt(wit())}</small></button>
    <button class="btn ${S.bank>=x.p?'':'ghost'}" onclick="act.moveHome('${x.id}','bank')" ${S.bank>=x.p&&!stay.kind?'':'disabled'}><span>${S.bank>=x.p?'Betalen van de bank':'Te weinig op de bank'}</span><small>${fmt(x.p)} · op de bank ${fmt(S.bank)}</small></button></div>`
    :`<button class="btn ghost" disabled>${label}</button>`}
   <button class="vh-back" onclick="vbSel(null)">‹ ${h.id==='brug'?'Je plek onder de brug':'Je '+h.n.toLowerCase()}</button></div></div>`}
// Pagina-indeling: bovenaan rusten, dokter en onderduiken; daaronder twee knoppen (winkel, upgraden); dan je woning.
// vb.view: null = je woning, 'shop' = winkel (kopen, neerzetten, opbergen), 'up' = verhuizen naar een betere woning
const VB_IC={shop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16l-1.3 11.1a2 2 0 0 1-2 1.9H7.3a2 2 0 0 1-2-1.9z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>',
 up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M12 18v-6M9.5 14.5L12 12l2.5 2.5"/></svg>',
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>'};
function vbGo(v){if(stay.kind&&v)return;vb.view=v||null;vb.edit=v==='shop';vb.sel=v==='up'?(HOMES[HOMES.indexOf(home())+1]||home()).id:null;SFX.click();render();window.scrollTo({top:0,behavior:'smooth'})}
// betalen: contant of van de bank (lopende rekening)
const vbPayHtml=(p)=>`<div class="vb-pay" role="group" aria-label="Betalen met"><span>Betalen met</span>
  <button class="${vb.pay!=='bank'?'on':''}" onclick="vb.pay='cash';render()"><small>Contant</small><b>${fmt(p==='wit'?wit():S.cash)}</b></button>
  <button class="${vb.pay==='bank'?'on':''}" onclick="vb.pay='bank';render()"><small>Bankrekening</small><b>${fmt(S.bank)}</b></button></div>`;
function vbNavHtml(){const h=home(),hi=HOMES.indexOf(h),nx=HOMES[hi+1],free=furnFree(),buy=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&furnFits(f,hi)).length;
 const lock=nx&&rankIdx(S.xp)<nx.r,can=nx&&!lock&&(wit()>=nx.p||S.bank>=nx.p);
 return `<div class="vb-nav">
  <button class="vb-big shop" onclick="vbGo('shop')" ${stay.kind?'disabled':''}><span class="vb-ic">${VB_IC.shop}</span><span class="vb-bt"><b>Winkel</b><small>Spullen voor je ${h.id==='brug'?'plek onder de brug':h.n.toLowerCase()} · ${buy?buy+' te koop':'alles gekocht'} · ${free} plek${free===1?'':'ken'} vrij</small></span><i class="vb-arr">›</i></button>
  <button class="vb-big up ${can?'can':''}" onclick="vbGo('up')" ${stay.kind?'disabled':''}><span class="vb-ic">${VB_IC.up}</span><span class="vb-bt"><b>Upgraden</b><small>${nx?(lock?'Volgende: '+nx.n+' · vanaf '+RANKS[nx.r][0]:'Volgende: '+nx.n+' · '+fmt(nx.p)):'Je woont in de beste woning'}</small></span><i class="vb-arr">›</i></button></div>`}
const vbBackHtml=t=>`<div class="vb-bar"><button class="vb-back" onclick="vbGo(null)">${VB_IC.back}<span>Verblijf</span></button><h2>${t}</h2></div>`;
// Winkel: per spul een kaart met wat het doet en de prijs. Wat bij een betere woning hoort, zie je al (op slot).
const FURN_IC={hp:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',en:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',hide:'<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><path d="M4 4l16 16"/>',
 focus:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".5"/>',safe:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 run:'<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v5M7 12l3-4 4 2 3 3M10 8l-3 1"/>',time:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',heat:'<path d="M12 21a6 6 0 0 0 6-6c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-3-2 2-3 4-3 7a6 6 0 0 0 6 6z"/>'};
const furnIc=f=>{const k=Object.keys(f.fx)[0],m={restHp:'hp',hpRegen:'hp',docHp:'hp',en:'en',enRegen:'en',hideRate:'hide',hideRisk:'hide',focus:'focus',safe:'safe',zone:'run',restCd:'time',docCd:'time',heat:'heat'}[k]||'focus';
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${FURN_IC[m]}</svg>`};
function vbShopHtml(){const hi=furnHi(),h=home(),used=furnPlaced().length,free=furnFree(),bank=vb.pay==='bank',have=bank?S.bank:S.cash;
 const placed=furnPlaced(),stored=FURN.filter(f=>S.furnStore&&S.furnStore[f.id]),buy=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&furnFits(f,hi)),later=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&hi<f.h);
 const card=(f,kind)=>{const why=furnWhy(f);let btn='';
  if(kind==='buy')btn=`<button class="btn sm" onclick="act.buyFurn('${f.id}','${bank?'bank':'cash'}')" ${have>=f.p&&free?'':'disabled'}>${!free?'Geen plek vrij':have<f.p?(bank?'Te weinig op de bank':'Te weinig contant'):'Kopen'}</button>`;
  else if(kind==='in')btn=`<button class="btn ghost sm" onclick="act.storeFurn('${f.id}')">Opbergen</button>`;
  else if(kind==='store')btn=why?`<button class="btn ghost sm" onclick="act.sellFurn('${f.id}')">Verkopen · ${fmt(furnSell(f))}</button>`:`<button class="btn sm" onclick="act.placeFurn('${f.id}')" ${free?'':'disabled'}>${free?'Neerzetten':'Geen plek'}</button><button class="btn ghost sm" onclick="act.sellFurn('${f.id}')" title="De helft terug">${fmt(furnSell(f))}</button>`;
  return `<article class="fs-card ${kind}" style="--c:${f.col}" data-it="${f.id}" onmouseenter="vhHover('${f.id}')" onmouseleave="vhHover(null)">
   <div class="fs-ic">${furnIc(f)}</div><div class="fs-b"><div class="fs-h"><b>${f.n}</b>${kind==='later'?`<span class="fs-lock">${HOMES[f.h].n}</span>`:kind==='in'?'<span class="fs-in">In huis</span>':kind==='store'?'<span class="fs-st">Opslag</span>':''}</div>
    <p>${f.d}</p><div class="fs-fx">${furnFxList(f)}</div>
    <div class="fs-f"><span class="fs-p">${kind==='in'||kind==='store'?'':fmt(f.p)}</span>${kind==='later'?`<span class="fs-why">Vanaf ${HOMES[f.h].n.toLowerCase()}</span>`:`<span class="fs-btn">${btn}</span>`}</div></div></article>`};
 const sec=(t,sub,list,kind)=>list.length?`<section class="fs-sec"><div class="fs-sh"><h3>${t}</h3><span>${sub}</span></div><div class="fs-grid">${list.map(f=>card(f,kind)).join('')}</div></section>`:'';
 const byHome=HOMES.map((x,i)=>[x,later.filter(f=>f.h===i)]).filter(([,L])=>L.length);
 return `${vbBackHtml('Winkel')}
  <div class="fs-top"><div class="fs-slots"><span class="label">${h.n} · plekken</span><div class="vh-slots">${Array.from({length:h.slots},(_,i)=>`<i class="${i<used?'on':''}"></i>`).join('')}<span>${used}/${h.slots}</span></div><small>Hoe beter je woning, hoe meer plek en hoe grotere spullen.</small></div>${vbPayHtml('cash')}</div>
  <section class="vh-stage is-edit fs-stage" id="vbStage"><div class="vh-scene">${(()=>{const nw=window._vbNew;window._vbNew=null;let sc=vhScene(h.id,{furn:S.furn,ghosts:true,key:'s'});if(nw)sc=sc.replace(`class="vh-it" data-it="${nw}"`,`class="vh-it new" data-it="${nw}"`);return sc})()}</div></section>
  ${sec('Te koop','past in je '+h.n.toLowerCase(),buy,'buy')}${sec('In huis','wat neerstaat, werkt',placed,'in')}${sec('In de opslag','bewaard voor later',stored,'store')}
  ${byHome.map(([x,L])=>sec('Bij een '+x.n.toLowerCase(),'nog op slot · '+(x.slots)+' plekken',L,'later')).join('')}`}
function vbUpHtml(){const h=home(),x=HOMES.find(y=>y.id===vb.sel)||home(),same=x.id===h.id;
 return `${vbBackHtml('Upgraden')}
  <nav class="vh-ladder" aria-label="Woningen">${HOMES.map(vbStep).join('')}</nav>
  <section class="vh-stage is-prev" id="vbStage"><div class="vh-scene">${vhScene(x.id,{furn:same?S.furn:Object.fromEntries(Object.keys(S.furn||{}).filter(k=>{const f=FURN.find(y=>y.id===k);return f&&furnFits(f,HOMES.indexOf(x))}).map(k=>[k,1])),key:'s'})}
   ${same?'':'<div class="vh-live pv"><i></i>Bezichtiging</div>'}</div>
   <aside class="vh-side">${same?vbInfo(true):vbPreview(x)}</aside></section>`}
V.verblijf=()=>{const h=home();if(stay.kind&&vb.view)vb.view=null;
 if(vb.view==='shop')return vbShopHtml();
 if(vb.view==='up')return vbUpHtml();
 vb.sel=null;vb.edit=false;
 const st=stay.kind?({rest:'Aan het rusten',doc:'Bij de dokter'})[stay.kind]:S.hide?'Ondergedoken':'';
 const nw=window._vbNew;window._vbNew=null;let scene=vhScene(h.id,{furn:S.furn,key:'s'});if(nw)scene=scene.replace(`class="vh-it" data-it="${nw}"`,`class="vh-it new" data-it="${nw}"`);
 return `<div class="vb-head"><h1>Verblijf</h1><span>${h.n} · ${h.place}</span></div>
 <div class="vb-acts vh-acts vb-top">${['rest','doc'].map(vbAct).join('')}${vbHideCard()}</div>
 ${vbNavHtml()}
 <section class="vh-stage ${stay.kind?'act-'+stay.kind:''} ${S.hide?'is-hide':''}" id="vbStage">
  <div class="vh-scene ${stay.kind?'':'can-edit'}" ${stay.kind?'':`onclick="vbGo('shop')" title="Naar de winkel" role="button" tabindex="0" onkeydown="if(event.key==='Enter')vbGo('shop')"`}>${scene}
   ${st?`<div class="vh-live"><i></i>${st}</div>`:''}${!stay.kind?'<div class="vh-hint">Tik om in te richten</div>':''}</div>
  <aside class="vh-side">${vbInfo()}</aside>
 </section>`};
Object.assign(act,{moveHome(id,src){const i=HOMES.findIndex(h=>h.id===id),cur=HOMES.indexOf(home()),x=HOMES[i];
  if(i!==cur+1||rankIdx(S.xp)<x.r||stay.kind)return;
  if(src==='bank'){if(S.bank<x.p){toast('Niet genoeg op de bank','bad');return}S.bank-=x.p}
  else{if(wit()<x.p){toast(S.cash>=x.p?'Een woning koop je met wit geld. Was je zwarte geld eerst wit, of betaal van de bank.':'Niet genoeg contant geld','bad');return}spendWit(x.p)}
  S.home=id;const moved=furnNormalize();vb.sel=null;vb.edit=false;vb.view=null;
  SFX.big();toast('Verhuisd naar '+x.n+' ('+x.place+')'+(moved.length?'. '+moved.map(f=>f.n).join(' en ')+' '+(moved.length>1?'staan':'staat')+' in de opslag.':''),'lvl');
  log('Verhuisd naar '+x.n+', '+x.place+(src==='bank'?' (betaald van de bank)':''),'ok');addXp(Math.floor(x.p/400));save();render();window.scrollTo({top:0,behavior:'smooth'})}});
