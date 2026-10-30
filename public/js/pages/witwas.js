// Tab: Witwassen. Zwart geld (klussen, huurmoorden, auto's, familie) wordt hier wit, zodat je het op de bank kunt zetten
// en er zaken en woningen mee kunt kopen. Drie manieren:
// - Via je zaken: een werkdag aan de kassa (minigame), daarna gaat het geld door de boeken. Dat kost tijd: met één vestiging
//   op level 1 10 speldagen, met één vestiging op max level 1 speldag, met tien vestigingen op max level ±1 speluur (wwDur).
//   Per soort zaak loopt er één tegelijk; het geld staat zolang in de wasstraat (S.wwJobs) en komt daarna wit binnen.
//   Hoe beter je bezit, hoe minder het kost: basis 26%, tot 18% minder
//   door je imperium (vestigingen en upgrades, zelfde maat als de inkomensbonus) en tot 5% minder door het niveau van de zaak
//   waar je het doorheen haalt (minimaal 5%, nog 2% minder als niemand iets merkt). Een beter uitgebouwde zaak heeft meer
//   klanten en minder bonnen nodig, dus het gaat ook sneller. Per speldag maximaal 2,5× wat je zaken verdienen.
//   Te opvallend = controle: 30% van die dag in beslag en hitte.
// - Via Ome Kees: meteen klaar, 30% voor hem (de normale prijs), met een maximum per speldag dat met je rang meegroeit.
// - Via het casino: speel met zwart geld, wat je wint is wit. Hoe meer zwart je inzet, hoe groter de kans op een controle;
//   word je gecontroleerd met zwart geld op zak, dan nemen ze het in beslag en volgt een arrestatie (zie casinoRound/czControl).
const WW_BASE=.26,WW_IMP=.18,WW_LVL=.05,WW_MIN=.05,WW_TOP=.02,WW_KEES=.30,WW_BUST=.3,WW_CHUNKS=12;
// kosten via een zaak: basis min imperium (0..1 van de maximale bonus) min het gemiddelde niveau van die zaak
function wwFee(B){const M=bizMult(),q=Math.min(1,M.imp/(typeof BIZ_IMP_MAX!=='undefined'?BIZ_IMP_MAX:.5)),u=B?bizUnits(B.id):[],f=u.length?u.reduce((a,l)=>a+l,0)/u.length/5:0;
 const imp=WW_IMP*q,lvl=WW_LVL*f;return {fee:Math.max(WW_MIN,WW_BASE-imp-lvl),imp,lvl,f}}
const wwChunks=B=>Math.max(8,WW_CHUNKS-Math.round(4*wwFee(B).f));
const wwS=()=>{const d=dayStart(now());if(!S.ww||S.ww.day!==d)S.ww={day:d,zaak:0,kees:0,hist:(S.ww&&S.ww.hist)||[]};return S.ww};
const wwZaakCap=()=>Math.round(2.5*(typeof income==='function'?income():0)/100)*100;
const wwKeesCap=()=>Math.round(25000*Math.pow(1.7,rankIdx(S.xp))/100)*100;
const wwZaakLeft=()=>Math.max(0,wwZaakCap()-wwS().zaak);
const wwKeesLeft=()=>Math.max(0,wwKeesCap()-wwS().kees);
const wwFronts=()=>BIZ.filter(b=>bizUnits(b.id).length);
// Hoe lang het duurt via een soort zaak: q = som van de levels van je vestigingen van die soort (1 tot 50).
// 10 speldagen × q^-1,43: 1 vestiging level 1 = 10 dagen, 1 op max = 1 dag, 10 op max = ±1 speluur (minimaal 1 speluur).
const WW_DMAX=10,WW_DEXP=1.43;
const wwQ=B=>B?bizUnits(B.id).reduce((a,l)=>a+l,0):0;
const wwDur=B=>Math.max(DAY_MS/24,WW_DMAX*Math.pow(Math.max(1,wwQ(B)),-WW_DEXP)*DAY_MS);
// tijd in speltijd (een speldag = 4 uur) met de echte tijd erbij
function wwGT(ms){const d=ms/DAY_MS,h=ms/(DAY_MS/24),r=ms/60000;
 const real=r>=120?Math.round(r/60*10)/10+' uur':Math.max(1,Math.round(r))+' min';
 return (d>=1?(Math.round(d*10)/10).toLocaleString('nl-NL')+' speldag'+(d>=1.05?'en':''):Math.max(1,Math.round(h))+' speluur')+' · '+real.replace('.',',')}
const wwJobs=()=>S.wwJobs||(S.wwJobs={});
const wwJob=id=>wwJobs()[id]||null;
// klaar? dan komt het witte geld binnen
function wwJobsTick(){const J=wwJobs();let any=false;Object.keys(J).forEach(id=>{const j=J[id];if(now()>=j.t1){S.cash+=j.got;delete J[id];any=true;
  const b=BIZ.find(x=>x.id===id);wwHist('zaak',j.a,j.got,(b?b.n:'zaak')+' · klaar');toast(`${fmt(j.got)} wit binnen via je ${b?b.n.toLowerCase():'zaak'}`,'ok');log(`Witwassen klaar via ${b?b.n:'zaak'}: ${fmt(j.a)} → ${fmt(j.got)} wit`,'ok')}});
 if(any){save();if(page==='wit'||page==='biz')render();else renderTop()}}
setInterval(()=>{if(typeof S!=='undefined'&&S.wwJobs)wwJobsTick()},1000);
const wwJobHtml=(id,b)=>{const j=wwJob(id);if(!j)return '';const p=Math.min(100,(now()-j.t0)/(j.t1-j.t0)*100);
 return `<div class="ww-job" style="--c:${b.col}"><div><span class="label">In de wasstraat · ${esc(b.n)}</span><b>${fmt(j.a)} → ${fmt(j.got)} wit</b></div><i><i style="width:${p.toFixed(1)}%"></i></i><small>Klaar over ${wwGT(Math.max(0,j.t1-now()))}</small></div>`};
const ww={front:null,amt:{zaak:0,kees:0},busy:false};
function wwHist(kind,a,got,note){const W=wwS();W.hist=[{t:now(),k:kind,a,got,n:note||''}].concat(W.hist||[]).slice(0,10)}
// witwassen: het zwarte deel wordt wit, de kosten gaan van het nu witte geld af
function wwClean(a,fee){a=Math.min(a,zwart());if(a<=0)return 0;S.zwart=zwart()-a;const f=Math.round(a*fee);spendWit(f);return a-f}
const wwPick=(kind,max)=>{const a=ww.amt[kind]||0;return Math.max(0,Math.min(a||max,max))};
function wwAmtRow(kind,max){const cur=wwPick(kind,max);return `<div class="ww-amt"><span class="label">Bedrag</span><b>${fmt(cur)}</b>
  <div class="ww-q">${[[.1,'10%'],[.25,'25%'],[.5,'50%'],[1,'Max']].map(([f,l])=>`<button class="${Math.abs(cur-Math.floor(max*f))<1&&max>0?'on':''}" onclick="ww.amt.${kind}=${Math.floor(max*f)};render()" ${max<1?'disabled':''}>${l}</button>`).join('')}</div></div>`}
function czBar(){const v=Math.round(czVal());return `<div class="ww-meter ${v>=70?'hot':v>=35?'warm':''}"><div><span class="label">Verdenking in het casino</span><b>${v}%</b></div><i><i style="width:${v}%"></i></i><small>${v?'Zakt 3% per minuut. Op 100% volgt zeker een controle.':'Niemand let op je.'}</small></div>`}
// Illustraties bovenaan de drie routes
const WW_ART={kees:`<svg viewBox="0 0 320 220"><defs><radialGradient id="wwkl" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
  <rect x="0" y="0" width="320" height="220" fill="url(#wwkl)"/><path d="M30 150h260v12H30z" fill="#4a2f1d"/><path d="M40 162h10v48H40zM270 162h10v48h-10z" fill="#33200f"/>
  <g transform="translate(70 70)"><path d="M0 80L20 0" stroke="#9aa1ab" stroke-width="5"/><path d="M8 -6l40 -8 4 14-40 10z" fill="#c9a227"/><circle cx="50" cy="8" r="14" fill="#ffd27a" opacity=".35"/></g>
  <g transform="translate(118 104) rotate(-6)"><rect width="74" height="46" fill="#efe9dc"/><path d="M8 10h50M8 18h40M8 26h56M8 34h30" stroke="#9a907d" stroke-width="2"/></g>
  <g transform="translate(150 96) rotate(8)"><rect width="74" height="46" fill="#f6f1e6"/><path d="M8 10h50M8 18h44M8 26h30" stroke="#9a907d" stroke-width="2"/><circle cx="56" cy="32" r="10" fill="none" stroke="#c8102e" stroke-width="2.5"/><path d="M51 32h10" stroke="#c8102e" stroke-width="2"/></g>
  <g transform="translate(240 96)"><rect x="-10" y="34" width="34" height="10" rx="2" fill="#7a1424"/><rect x="0" y="6" width="14" height="30" rx="3" fill="#2a1a10"/><circle cx="7" cy="4" r="8" fill="#3a2414"/></g>
  <g transform="translate(250 40)" fill="#b8a1ff"><circle r="16" opacity=".14"/><text y="6" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="18">30%</text></g></svg>`};
V.wit=()=>{const z=zwart(),w=wit(),W=wwS(),fr=wwFronts(),zl=wwZaakLeft(),kl=wwKeesLeft(),zMax=Math.min(z,zl),kMax=Math.min(z,kl);
 if(!ww.front||!fr.find(b=>b.id===ww.front))ww.front=fr.length?fr[fr.length-1].id:null;const F=fr.find(b=>b.id===ww.front);
 const tot=Math.max(1,S.cash);
 return `<h1>Witwassen</h1><p class="sub">Geld uit klussen, huurmoorden, auto's en de familie is zwart. Wapens, kleding en training betaal je er gewoon mee, maar de bank, je zaken en een nieuwe woning willen wit geld. Hoe je het witwast, bepaalt hoeveel er overblijft.</p>
 <section class="card hud ww-hero">
  <div class="ww-bal zw"><i class="dm-ic">${ICO_CASH}</i><div><span class="label">Zwart geld op zak</span><b>${fmt(z)}</b><em>uit klussen, huurmoorden, auto's en de familie</em></div></div>
  <div class="ww-bal wt"><i class="dm-ic">${ICO_CASH}</i><div><span class="label">Wit geld op zak</span><b>${fmt(w)}</b><em>mag naar de bank en in je zaken</em></div></div>
  <div class="ww-split" aria-hidden="true"><i style="width:${z/tot*100}%"></i></div>
 </section>
 <div class="ww-grid">
  <section class="card ww-m ww-zaak"><div class="ww-art" aria-hidden="true">${typeof bzArt==='function'?bzArt(F||BIZ[0],'ww'+(F||BIZ[0]).id):''}</div><header><span class="ww-tag">Goedkoopst</span><h3>Via je zaken</h3><p>Een werkdag aan de kassa. Je laat zwarte bonnen meelopen met echte klanten, daarna gaat het door de boeken en dat kost tijd. Hoe beter je bezit, hoe minder het kost en hoe sneller het gaat. Te opvallend? Dan nemen ze ${Math.round(WW_BUST*100)}% in beslag.</p></header>
   ${fr.length?`<div class="ww-fronts">${fr.map(b=>`<button class="${b.id===ww.front?'on':''} ${wwJob(b.id)?'busy':''}" onclick="ww.front='${b.id}';render()" style="--c:${b.col||'var(--green)'}">${esc(b.n)}<small>${wwJob(b.id)?'bezig':wwGT(wwDur(b)).split(' · ')[0]}</small></button>`).join('')}</div>
    ${fr.filter(b=>wwJob(b.id)).map(b=>wwJobHtml(b.id,b)).join('')}
    ${(()=>{const f=wwFee(F),pc=v=>(Math.round(v*1000)/10).toLocaleString('nl-NL');return `<div class="ww-fee"><div><span class="label">Kosten via je ${esc(F?F.n.toLowerCase():'zaak')}</span><b>${pc(f.fee)}%</b><small>${Math.max(WW_MIN,f.fee-WW_TOP)===f.fee?'':'of '+pc(Math.max(WW_MIN,f.fee-WW_TOP))+'% als niemand iets merkt'}</small></div>
     <ul><li><span>Basis</span><em>${pc(WW_BASE)}%</em></li><li><span>Je imperium (vestigingen en upgrades)</span><em>−${pc(f.imp)}%</em></li><li><span>Niveau van deze zaak</span><em>−${pc(f.lvl)}%</em></li><li class="k"><span>Ome Kees ter vergelijking</span><em>${pc(WW_KEES)}%</em></li></ul>
     <div class="ww-dur"><span class="label">Duur via je ${esc(F?F.n.toLowerCase():'zaak')}</span><b>${wwGT(wwDur(F))}</b><small>${bizUnits(F.id).length} vestiging${bizUnits(F.id).length===1?'':'en'}, samen level ${wwQ(F)} van ${BIZ_MAX*5}. Meer vestigingen en upgrades = sneller (10 op max: ±1 speluur).</small></div></div>`})()}
    <div class="ww-cap"><span>Vandaag nog door de boeken</span><b>${fmt(zl)}</b><small>van ${fmt(wwZaakCap())} (2,5× je inkomen per speldag)</small></div>
    ${wwAmtRow('zaak',zMax)}
    <button class="btn xl act-btn" style="--c:var(--green)" onclick="act.wwZaak()" ${zMax>=WW_CHUNKS&&!inJail()&&!wwJob(F.id)?'':'disabled'}>${inJail()?'Je zit vast':wwJob(F.id)?'Je '+esc(F.n.toLowerCase())+' is nog bezig':!z?'Geen zwart geld':!zl?'Vandaag zit het vol':'Werkdag in je '+esc(F?F.n.toLowerCase():'zaak')}</button>`
   :`<div class="ww-none">Je hebt nog geen zaak. Een zaak koop je met wit geld: begin via Ome Kees of het casino, en koop dan bijvoorbeeld een wasserette.<a href="#biz">Naar Bezit ›</a></div>`}
  </section>
  <section class="card ww-m ww-kees"><div class="ww-art" aria-hidden="true">${WW_ART.kees}</div><header><span class="ww-tag">Meteen</span><h3>Via Ome Kees</h3><p>Een oude boekhouder met een stempel voor alles. Hij regelt het meteen, zonder vragen. Hij houdt wel ${Math.round(WW_KEES*100)}% voor zichzelf.</p></header>
   <div class="ww-cap"><span>Vandaag kan Kees nog</span><b>${fmt(kl)}</b><small>van ${fmt(wwKeesCap())} (groeit met je rang)</small></div>
   ${wwAmtRow('kees',kMax)}
   <div class="ww-calc">${kMax?`Je geeft ${fmt(wwPick('kees',kMax))} zwart en krijgt ${fmt(wwPick('kees',kMax)-Math.round(wwPick('kees',kMax)*WW_KEES))} wit terug.`:''}</div>
   <button class="btn xl act-btn" style="--c:var(--violet)" onclick="act.wwKees()" ${kMax>=1&&!inJail()?'':'disabled'}>${inJail()?'Je zit vast':!z?'Geen zwart geld':!kl?'Kees doet vandaag niks meer':'Laat Kees het doen'}</button>
  </section>
  <section class="card ww-m ww-cas"><div class="ww-art" aria-hidden="true">${window.COV?COV.coverSvg('roulette','wwc'):''}</div><header><span class="ww-tag">Riskant</span><h3>Via het casino</h3><p>Zet je zwarte geld in. Wat je wint, is wit. Maar hoe meer zwart je inzet, hoe groter de kans dat de beveiliging je controleert. Heb je dan zwart geld op zak, of zien ze dat je net veel zwart hebt ingezet, dan nemen ze het in beslag en word je aangehouden.</p></header>
   ${czBar()}
   <a class="btn xl ghost" href="#casino">Naar het casino</a>
  </section>
 </div>
 ${(W.hist||[]).length?`<section class="card ww-log"><div class="label">Laatst witgewassen</div>${W.hist.map(h=>`<div class="ww-row ${h.k}"><time>${new Date(h.t).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</time><span>${h.k==='zaak'?'Via je zaken':h.k==='start'?'Gestart':h.k==='kees'?'Via Ome Kees':'Controle'}${h.n?' · '+esc(h.n):''}</span><b>${h.got>0?fmt(h.a)+' → '+fmt(h.got)+' wit':h.k==='bust'?'−'+fmt(h.a):h.k==='start'?fmt(h.a)+' in de boeken':fmt(h.a)}</b></div>`).join('')}</section>`:''}`};

// ---------- Minigame: een werkdag aan de kassa ----------
// Echte klanten lopen binnen en rekenen af. Vlak na een echte klant valt een zwarte bon niet op (dekking, max 2 per klant).
// Zonder klant valt het op, en kijkt de inspecteur mee (rood), dan gaat de verdenking hard omhoog. Op 100% is het mis.
function wwGame(amount,B){return new Promise(resolve=>{
 const tier=Math.max(0,BIZ.indexOf(B)),T=24,N=wwChunks(B),lv=wwFee(B).f,gap=[1.05,1.9].map(x=>x*Math.max(.5,1-tier*.03-lv*.2));
 const ov=document.createElement('div');ov.className='chase-ov ww-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 ov.innerHTML=`<div class="chase-box ww-box">
  <div class="ww-gh"><div><span class="label">Werkdag · ${esc(B.n)}</span><h2 id="wwT">Laat het meelopen</h2></div><b id="wwClock">0:${T}</b></div>
  <p class="chase-p" id="wwP">Druk op <b>spatie</b> of <b>Zwarte bon</b> vlak nadat een echte klant afrekent. Kijkt de inspecteur mee, dan wacht je.</p>
  <div class="ww-shop" id="wwShop"><div class="ww-door"></div><div class="ww-till" id="wwTill"><i></i></div><div class="ww-insp" id="wwInsp"><svg viewBox="0 0 40 24"><path d="M2 12 Q20 -4 38 12 Q20 28 2 12Z" fill="#1b1d22" stroke="currentColor" stroke-width="2"/><circle cx="20" cy="12" r="6" fill="currentColor"/><circle cx="20" cy="12" r="2.5" fill="#0b0b0d"/></svg><span>Inspecteur</span></div></div>
  <div class="ww-bars"><div><span class="label">Verdenking</span><i class="ww-sus"><i id="wwSus"></i></i></div><div><span class="label">Door de boeken</span><i class="ww-prog" id="wwProg" style="grid-template-columns:repeat(${N},1fr)">${Array.from({length:N},()=>'<i></i>').join('')}</i><b id="wwAmt">${fmt(0)} van ${fmt(amount)}</b></div></div>
  <button class="btn xl ww-go" id="wwGo">Zwarte bon</button></div>`;
 document.body.appendChild(ov);window.__chase=true;
 const q=s=>ov.querySelector(s),shop=q('#wwShop');let t0=0,raf=0,done=false,k=0,sus=0,maxSus=0,last=0;
 const cust=[];let nextC=.6,cover=-9,coverN=0,insp={on:false,warn:-1,a:4+Math.random()*2,b:0};
 const say=(m,c)=>{const p=q('#wwP');p.textContent=m;p.className='chase-p '+(c||'')};
 const draw=()=>{q('#wwSus').style.width=Math.min(100,sus)+'%';q('#wwSus').parentNode.classList.toggle('hot',sus>=70);
  q('#wwProg').querySelectorAll('i').forEach((e,i)=>e.className=i<k?'f':'');q('#wwAmt').textContent=fmt(Math.floor(amount*k/N))+' van '+fmt(amount)};
 const spawn=t=>{const el=document.createElement('i');el.className='ww-c';el.style.setProperty('--h',Math.floor(Math.random()*360));shop.appendChild(el);cust.push({el,t0:t})};
 const loop=now_=>{if(done)return;const t=(now_-t0)/1000,dt=Math.min(.1,(now_-last)/1000);last=now_;
  q('#wwClock').textContent='0:'+String(Math.max(0,Math.ceil(T-t))).padStart(2,'0');
  if(t>=nextC){spawn(t);nextC=t+gap[0]+Math.random()*(gap[1]-gap[0])}
  for(let i=cust.length-1;i>=0;i--){const c=cust[i],p=(t-c.t0)/1.1;if(p>=1&&!c.sold){c.sold=true;cover=t;coverN=0;q('#wwTill').classList.remove('ring');void q('#wwTill').offsetWidth;q('#wwTill').classList.add('ring');try{SFX.tick()}catch(e){}}
   c.el.style.left=(6+Math.min(1,p)*62)+'%';c.el.style.opacity=p>1.5?Math.max(0,2.2-p):1;if(p>2.3){c.el.remove();cust.splice(i,1)}}
  q('#wwTill').classList.toggle('cover',t-cover<.85&&coverN<2);
  // inspecteur: eerst een waarschuwing, dan kijkt hij mee
  if(!insp.on&&insp.warn<0&&t>=insp.a-.6){insp.warn=t;q('#wwInsp').className='ww-insp warn'}
  if(!insp.on&&t>=insp.a){insp.on=true;insp.b=t+1.3+Math.random()*1;q('#wwInsp').className='ww-insp on'}
  if(insp.on&&t>=insp.b){insp.on=false;insp.warn=-1;insp.a=t+3.2+Math.random()*3;q('#wwInsp').className='ww-insp'}
  sus=Math.max(0,sus-4*dt);draw();
  if(sus>=100)return finish(true);if(t>=T||k>=N)return finish(false);
  raf=requestAnimationFrame(loop)};
 const press=()=>{if(done||!t0)return;const t=(performance.now()-t0)/1000;k++;
  if(insp.on){sus+=35;say('De inspecteur kijkt mee! Dat viel op.','bad')}
  else if(t-cover<.85&&coverN<2){coverN++;sus+=3;say('Mooi meegelopen met een echte klant.','ok')}
  else{sus+=17;say('Een bon zonder klant valt op.','warn')}
  maxSus=Math.max(maxSus,sus);try{SFX.chip()}catch(e){}draw();if(sus>=100)finish(true);else if(k>=N)finish(false)};
 const key=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)press()}};
 document.addEventListener('keydown',key);q('#wwGo').addEventListener('pointerdown',e=>{e.preventDefault();press()});
 function finish(bust){done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);q('#wwGo').disabled=true;
  const box=q('.ww-box');box.classList.add(bust?'lost':'won');q('#wwT').textContent=bust?'Controle!':k>=N?'Klaar':'Einde van de dag';
  say(bust?'De boeken kloppen niet. Een controleur neemt geld in beslag.':k?`${k} van ${N} bonnen door de boeken.`:'Er is niets door de boeken gegaan.',bust?'bad':'ok');
  setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve({k,n:N,bust,maxSus})},220)},1500)}
 draw();setTimeout(()=>{t0=last=performance.now();raf=requestAnimationFrame(loop)},700);
})}

// ---------- Controle in het casino ----------
const casBusy=()=>(window.kk&&kk.busy)||(window.vd&&vd.busy)||(window.cf&&cf.flipping)||(window.av&&av.flying)||(window.rl&&rl.spinning)||(window.bt&&['dealing','dealer'].includes(bt.phase))||(window.tp&&['dealing','reveal'].includes(tp.phase))||(window.th&&['dealing','reveal'].includes(th.phase));
function czControl(){window.__czCheck=false;const C=S.cz||(S.cz={s:0,t:now(),g:0});czVal();const z=zwart(),g=Math.round((C.g||0)*.5);
 if(z<1&&g<1){C.s=Math.max(0,C.s-40);toast('Controle in het casino. Je bent schoon, ze laten je gaan.','ok');log('Casino: gecontroleerd, niets gevonden','info');save();return}
 const conf=Math.min(S.cash,z+g);S.cash-=conf;S.zwart=0;C.s=0;C.g=0;addHeat(25);wwHist('bust',conf,0,'controle in het casino');
 const sec=Math.min(600,Math.round(60+25*Math.log2(1+conf/5000)));
 log(`Casinocontrole: ${fmt(conf)} zwart geld in beslag genomen`,'bad');save();render();
 arrest(sec,'Controle in het casino',`De beveiliging en de recherche controleren je. Ze vinden zwart geld en nemen ${fmt(conf)} in beslag.`,{flee:4})}
setInterval(()=>{if(window.__czCheck&&!casBusy()&&!window.__chase&&!S.pendingArrest&&!inJail()&&typeof arrest==='function')czControl()},1000);

Object.assign(act,{
 async wwZaak(){if(ww.busy||inJail()||window.__chase)return;const fr=wwFronts(),B=fr.find(b=>b.id===ww.front)||fr[fr.length-1];if(!B)return;if(wwJob(B.id)){toast('Via je '+B.n.toLowerCase()+' loopt al een witwasronde','bad');return}
  const a=wwPick('zaak',Math.min(zwart(),wwZaakLeft()));if(a<WW_CHUNKS){toast('Te weinig om door de boeken te halen','bad');return}
  ww.busy=true;const r=await wwGame(a,B);ww.busy=false;const W=wwS();
  if(r.bust){const conf=Math.min(zwart(),Math.round(a*WW_BUST));S.cash-=conf;addHeat(20);W.zaak+=a;wwHist('bust',conf,0,B.n);
   toast(`Controle bij je ${B.n.toLowerCase()}: ${fmt(conf)} in beslag genomen`,'bad');log(`Witwassen mislukt bij ${B.n}: ${fmt(conf)} in beslag`,'bad')}
  else if(r.k){const part=Math.min(zwart(),Math.floor(a*r.k/r.n)),f0=wwFee(B).fee,fee=r.maxSus<50?Math.max(WW_MIN,f0-WW_TOP):f0,got=part-Math.round(part*fee),dur=wwDur(B);
   // het zwarte geld gaat de boeken in en komt na de looptijd wit terug
   S.zwart=zwart()-part;S.cash-=part;wwJobs()[B.id]={a:part,got,t0:now(),t1:now()+dur};W.zaak+=part;wwHist('start',part,0,B.n+' · '+wwGT(dur).split(' · ')[0]);
   toast(`${fmt(part)} gaat door de boeken van je ${B.n.toLowerCase()}. Over ${wwGT(dur)} krijg je ${fmt(got)} wit.`,'ok');log(`Witwassen gestart via ${B.n}: ${fmt(part)} → ${fmt(got)} wit over ${wwGT(dur)}`,'info')}
  ww.amt.zaak=0;save();render()},
 wwKees(){if(inJail())return;const a=wwPick('kees',Math.min(zwart(),wwKeesLeft()));if(a<1)return;const got=wwClean(a,WW_KEES);wwS().kees+=a;wwHist('kees',a,got);
  try{SFX.chip()}catch(e){}toast(`Ome Kees: ${fmt(a)} zwart → ${fmt(got)} wit`,'ok');log(`Witgewassen via Ome Kees: ${fmt(a)} → ${fmt(got)} wit`,'ok');ww.amt.kees=0;save();render()}});
