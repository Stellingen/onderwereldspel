// Casinokaart: je status in het casino, los van je rang. Zes kaarten: Basis, Brons, Zilver, Goud, Platina en Zwart.
// Je groeit door in te zetten (wit en zwart tellen mee), verdeeld over drie soorten spel: slots, snel spel en tafels.
// Is alles van de volgende kaart gehaald, dan krijg je hem meteen. Word je gepakt met zwart geld (verbanning of controle),
// dan ben je 40% van je voortgang naar de volgende kaart kwijt.
// De kaart bepaalt: maximale inzet per spel (VIP en High roller mogen daarbovenop meer), hoe lang je achter elkaar mag
// spelen en hoe lang je daarna pauze moet nemen, je cashback, en hoe snel de beveiliging op zwart geld let.
// VIP en High roller houden daarnaast hun betere kansen (RTP) in de slots; dat staat los van de kaart.
const CC=[
 {id:'basis',n:'Basis',col:'#8a929c',need:null,slot:500,snel:500,tafel:1000,side:50,rin:500,sess:30,cd:15,cb:0,eye:1.3,lim:20000},
 {id:'brons',n:'Brons',col:'#c27a3e',need:{slot:30000,snel:20000,tafel:50000},slot:2500,snel:2500,tafel:5000,side:250,rin:2500,sess:45,cd:12,cb:.25,eye:1.1,lim:60000},
 {id:'zilver',n:'Zilver',col:'#c9cfd8',need:{slot:150000,snel:100000,tafel:250000},slot:10000,snel:10000,tafel:20000,side:1000,rin:10000,sess:60,cd:10,cb:.5,eye:.9,lim:200000},
 {id:'goud',n:'Goud',col:'#e8b923',need:{slot:750000,snel:500000,tafel:1250000},slot:50000,snel:25000,tafel:50000,side:5000,rin:40000,sess:90,cd:8,cb:.75,eye:.7,lim:600000},
 {id:'platina',n:'Platina',col:'#a9dcff',need:{slot:3600000,snel:2400000,tafel:6000000},slot:200000,snel:50000,tafel:100000,side:20000,rin:100000,sess:150,cd:6,cb:1,eye:.5,lim:2000000},
 {id:'zwart',n:'Zwart',col:'#2a2a31',need:{slot:18000000,snel:12000000,tafel:30000000},slot:500000,snel:100000,tafel:150000,side:50000,rin:250000,sess:240,cd:5,cb:1.25,eye:.35,lim:6000000}];
// lidmaatschap bovenop de kaart: limieten (slots/snel, tafels, side bets, roulette-nummers), speeltijd, pauze
// Zwart: slots €500k (VIP €750k, HR €1 mln), side bets €50k (VIP €75k, HR €100k). Snel spel, tafels en roulette hebben een
// plafond voor iedereen (snel €100k, kaartspellen €150k, roulette €250k per nummer): VIP en HR zitten daar eerder aan.
// High rollers hebben daarnaast de High roller-tafel bij de kaartspellen: tot 3⅓× de gewone tafel, maximaal €500k.
const CC_T={slot:[1,1.5,2],snel:[1,1.5,2],tafel:[1,1.25,1.5],side:[1,1.5,2],rin:[1,1.33,1.67],sess:[1,1.5,2],cd:[1,.8,.6],lim:[1,1.5,2]};
const CC_CAP={snel:100000,tafel:150000,rin:250000,rout:500000,hrtafel:500000};
const ccNice=v=>v>=10000?Math.round(v/1000)*1000:v>=1000?Math.round(v/100)*100:Math.round(v/10)*10;
const CC_CAT={kluis:'slot',vis:'slot',zoet:'slot',mines:'snel',avia:'snel',coin:'snel',roulette:'tafel',bj:'tafel',tcp:'tafel',th:'tafel'};
const CC_CATN={slot:'Slots',snel:'Snel spel',tafel:'Tafels'};
// cashback mag nooit boven het huisvoordeel uitkomen: per spel een plafond op de factor
const CC_CBMAX={bj:1.5,coin:0};
const ccS=()=>{if(!S.cc||typeof S.cc!=='object')S.cc={lv:0,p:{slot:0,snel:0,tafel:0}};S.cc.p=S.cc.p||{slot:0,snel:0,tafel:0};if(!S.cc.bf)ccBackfill(S.cc);return S.cc};
// Eenmalig voor spelers van vóór de casinokaart: hun kaart bijwerken met wat ze al hebben ingezet.
// Een totaal per ronde bestond nog niet, wel je casinowinst en -verlies (stats.won/lost, de netto uitkomst per ronde).
// Bijna elke ronde draait om ongeveer je inzet, dus winst + verlies is een goede schatting van wat je hebt ingezet. Eén grote
// jackpot zou dat opblazen, daarom telt de winst hooguit even zwaar als het verlies. Wat sinds de kaart al is bijgeschreven
// (cc.tot) gaat eraf, zodat niets dubbel telt. Per soort was het niet bijgehouden: het bedrag vult de soorten aan in de
// verhouding die de volgende kaart vraagt.
function ccBackfill(C){C.bf=1;const st=S.stats||{},lost=Math.max(0,+st.lost||0),won=Math.max(0,+st.won||0);
 let rem=Math.floor(lost+Math.min(won,lost)-(C.tot||0));if(!(rem>0))return;const from=C.lv|0;C.est=rem;
 while(rem>0){const nx=CC[(C.lv|0)+1];if(!nx)break;const d={};let D=0;['slot','snel','tafel'].forEach(k=>{d[k]=Math.max(0,nx.need[k]-(C.p[k]||0));D+=d[k]});
  if(rem>=D){rem-=D;C.lv=(C.lv|0)+1;C.p={slot:0,snel:0,tafel:0}}
  else{['slot','snel','tafel'].forEach(k=>{C.p[k]=Math.floor((C.p[k]||0)+rem*d[k]/D)});rem=0}}
 if(C.lv>from){const n=CC[C.lv].n;setTimeout(()=>{try{log(`Casinokaart bijgewerkt met wat je al had ingezet (±${fmt(C.est)}): ${n}`,'ok');toast(`Je casinokaart is bijgewerkt met wat je al had gespeeld: ${n}`,'lvl')}catch(e){}},1500)}}
const ccLv=()=>Math.max(0,Math.min(CC.length-1,ccS().lv|0));
const ccCard=()=>CC[ccLv()];
const ccT=k=>(CC_T[k]||[1,1,1])[typeof tier==='function'?tier():0]||1;
// maximale inzet: 'slot' (ook snel spel), 'tafel' (hoofdinzet), 'side', 'rin' (roulette binnen), 'rout' (roulette buiten)
function casMax(k){const c=ccCard(),cap=v=>CC_CAP[k]?Math.min(CC_CAP[k],v):v;
 if(k==='rout')return Math.min(CC_CAP.rout,casMax('rin')*2);
 if(k==='hrtafel')return typeof tier==='function'&&tier()===2?Math.min(CC_CAP.hrtafel,ccNice(c.tafel*CC_T.tafel[2]*10/3/1.5)):0;
 return cap(ccNice(c[k]*ccT(k)))}
const ccSessMs=()=>Math.round(ccCard().sess*ccT('sess'))*60000;
const ccCdMs=()=>Math.round(ccCard().cd*ccT('cd'))*60000;
const ccCbF=g=>{const f=(ccCard().cb||0)+((typeof TIER_CB!=='undefined'&&TIER_CB[tier()])||0),mx=CC_CBMAX[g];return mx!=null?Math.min(mx,f):Math.min(2.25,f)};
// na elke ronde: inzet bijschrijven en kijken of de volgende kaart binnen is
function ccAdd(game,stake){const cat=CC_CAT[game];if(!cat||!(stake>0))return;const C=ccS();C.p[cat]=(C.p[cat]||0)+stake;C.tot=(C.tot||0)+stake;
 const nx=CC[ccLv()+1];if(!nx)return;if(['slot','snel','tafel'].every(k=>(C.p[k]||0)>=nx.need[k])){C.lv=ccLv()+1;C.p={slot:0,snel:0,tafel:0};
  try{SFX.big()}catch(e){}toast(`Nieuwe casinokaart: ${nx.n}! Hogere inzetten, langer spelen en meer cashback.`,'lvl');log(`Casinokaart ${nx.n} gehaald`,'ok')}}
// gepakt met zwart geld: 40% van de voortgang naar de volgende kaart kwijt
function ccPenalty(why){const C=ccS();let lost=0;['slot','snel','tafel'].forEach(k=>{const v=C.p[k]||0;lost+=v*.4;C.p[k]=Math.floor(v*.6)});
 if(lost>=1)log(`Casinokaart: ${fmt(lost)} van je voortgang kwijt (${why||'gepakt met zwart geld'})`,'bad')}
const ccNeedTot=c=>c&&c.need?c.need.slot+c.need.snel+c.need.tafel:0;
// speeltijd: hoe lang je nog mag in deze sessie
function ccSessLeft(){const T=S.czT;if(!T||now()-T.last>ccCdMs())return ccSessMs();return Math.max(0,T.t0+ccSessMs()-now())}
// de kaart zelf (plastic met chip, naam en niveau)
function ccCardSvg(lv,small){const c=CC[lv],dark=lv===5,fg=dark?'#e8b923':lv===4?'#0d2333':lv===3?'#3a2700':'#15181d',uid='cc'+lv+(small?'s':'')+'_'+(ccCardSvg.n=(ccCardSvg.n||0)+1);
 return `<svg class="cc-svg" viewBox="0 0 172 108" aria-hidden="true"><defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.col}"/><stop offset=".55" stop-color="${dark?'#111115':c.col}" stop-opacity="${dark?1:.78}"/><stop offset="1" stop-color="${dark?'#2a2a31':'#fff'}" stop-opacity="${dark?1:.35}"/></linearGradient></defs>
  <rect x="1" y="1" width="170" height="106" rx="11" fill="url(#${uid}g)" stroke="rgba(255,255,255,.35)"/>
  <path d="M1 70 Q60 40 171 78 L171 96 Q171 107 160 107 L12 107 Q1 107 1 96Z" fill="rgba(0,0,0,.14)"/>
  <rect x="14" y="36" width="24" height="18" rx="3" fill="#d9b25a" stroke="#8a6a20" stroke-width=".8"/><path d="M14 45h24M26 36v18M20 36v18M32 36v18" stroke="#8a6a20" stroke-width=".6"/>
  <text x="14" y="22" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="13" fill="${fg}" letter-spacing="1.5">CASINO</text>
  <text x="158" y="22" text-anchor="end" font-family="JetBrains Mono,monospace" font-size="8" fill="${fg}" opacity=".8">${lv+1}/${CC.length}</text>
  ${small?'':`<text x="14" y="78" font-family="JetBrains Mono,monospace" font-size="9" fill="${fg}" opacity=".85" letter-spacing="2">•••• ${String(1000+((S.name||'x').length*373+lv*911)%9000)}</text>`}
  <text x="14" y="98" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${small?20:17}" fill="${fg}" letter-spacing="1">${c.n.toUpperCase()}</text>
  <circle cx="148" cy="88" r="9" fill="${fg}" opacity=".18"/><circle cx="138" cy="88" r="9" fill="${fg}" opacity=".12"/></svg>`}
const ccMin=ms=>{const m=Math.round(ms/60000);return m>=60?(m%60?Math.floor(m/60)+' u '+(m%60)+' min':(m/60)+' uur'):m+' min'};
function ccPanelHtml(){const lv=ccLv(),c=CC[lv],nx=CC[lv+1],C=ccS(),t=typeof tier==='function'?tier():0;
 const perk=(lab,a,b)=>`<div><span>${lab}</span><b>${a}</b>${b!=null?`<em>${b}</em>`:''}</div>`;
 const val=(cc,k)=>{const old=S.cc.lv;S.cc.lv=CC.indexOf(cc);const v=k==='sess'?ccMin(ccSessMs()):k==='cd'?ccMin(ccCdMs()):k==='cb'?(ccCbF('kluis')>0?(CB_RATE.kluis*ccCbF('kluis')*100).toLocaleString('nl-NL',{maximumFractionDigits:2})+'% slots':'geen'):fmt(casMax(k));S.cc.lv=old;return v};
 const done=nx?['slot','snel','tafel'].reduce((a,k)=>a+Math.min(C.p[k]||0,nx.need[k]),0):0,pct=nx?Math.floor(done/ccNeedTot(nx)*100):100,open=ccpOpen();
 return `<section class="ccp ${open?'open':''}" style="--cc:${c.col}">
  <button class="ccp-top" onclick="ccpToggle(this)" aria-expanded="${open}" aria-controls="ccpBody"><span class="ccp-mini">${ccCardSvg(lv,1)}</span>
   <span class="ccp-tt"><span class="label">Jouw casinokaart</span><b>${c.n}</b></span>
   <span class="ccp-tp">${nx?`<span><span class="label">Op weg naar ${nx.n}</span><em>${pct}%</em></span><i><i style="width:${pct}%"></i></i>`:`<span><span class="label">Hoogste kaart</span><em>Zwart</em></span><i><i style="width:100%"></i></i>`}</span>
   <span class="ccp-tl"><span class="ccp-more">Details</span><span class="ccp-less">Inklappen</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></span></button>
  <div class="ccp-body" id="ccpBody">
  <div class="ccp-card">${ccCardSvg(lv)}<div class="ccp-id"><span class="label">Jouw casinokaart</span><b>${c.n}</b><small>${t?`${TIER_NAME[t]}: hogere limieten en langer spelen bovenop je kaart`:'Los van je rang: je groeit door te spelen'}</small></div></div>
  <div class="ccp-prog">${nx?`<div class="ccp-h"><span class="label">Op weg naar ${nx.n}</span><b>${fmt(['slot','snel','tafel'].reduce((a,k)=>a+Math.min(C.p[k]||0,nx.need[k]),0))} / ${fmt(ccNeedTot(nx))}</b></div>
   ${['slot','snel','tafel'].map(k=>{const p=Math.min(1,(C.p[k]||0)/nx.need[k]);return `<div class="ccp-bar ${p>=1?'ok':''}"><span>${CC_CATN[k]}</span><i><i style="width:${(p*100).toFixed(1)}%"></i></i><em>${fmt(Math.min(C.p[k]||0,nx.need[k]))} / ${fmt(nx.need[k])}</em></div>`}).join('')}
   <small class="ccp-n">Alles telt: wit en zwart geld. Gepakt met zwart geld = 40% van je voortgang kwijt.</small>`:'<div class="ccp-h"><span class="label">Hoogste kaart</span><b>Je bent er</b></div><small class="ccp-n">De Zwarte kaart: de hoogste limieten, de langste speeltijd en de beveiliging laat je bijna met rust.</small>'}</div>
  <div class="ccp-perks"><div class="ccp-ph"><span></span><b>${c.n}</b>${nx?`<em>${nx.n}</em>`:''}</div>
   ${perk('Max. inzet slots',val(c,'slot'),nx?val(nx,'slot'):null)}${perk('Max. inzet snel spel',val(c,'snel'),nx?val(nx,'snel'):null)}${perk('Max. inzet aan tafel',val(c,'tafel'),nx?val(nx,'tafel'):null)}${t===2?perk('High roller-tafel',val(c,'hrtafel'),nx?val(nx,'hrtafel'):null):''}
   ${perk('Side bets',val(c,'side'),nx?val(nx,'side'):null)}${perk('Roulette per nummer',val(c,'rin'),nx?val(nx,'rin'):null)}
   ${perk('Speeltijd achter elkaar',val(c,'sess'),nx?val(nx,'sess'):null)}${perk('Pauze daarna',val(c,'cd'),nx?val(nx,'cd'):null)}
   ${perk('Cashback',val(c,'cb'),nx?val(nx,'cb'):null)}${perk('Aandacht voor zwart geld',Math.round(c.eye*100)+'%',nx?Math.round(nx.eye*100)+'%':null)}</div>
 </div></section>`}
// in- en uitklappen; standaard ingeklapt zodat de spellen eronder meteen in beeld zijn (onthouden per browser)
function ccpOpen(){try{return localStorage.getItem('ow_ccp')==='1'}catch(e){return !!window._ccpOpen}}
function ccpToggle(b){const sec=b.closest('.ccp'),o=!sec.classList.contains('open');sec.classList.toggle('open',o);b.setAttribute('aria-expanded',o);window._ccpOpen=o;try{localStorage.setItem('ow_ccp',o?'1':'0')}catch(e){}if(o)requestAnimationFrame(()=>{try{fitText(sec)}catch(e){}})}
// kleine regel in de casinobalk: kaart en hoeveel speeltijd je nog hebt
const ccChip=()=>{const c=ccCard(),l=ccSessLeft();return `<div class="ch-cell ch-card" style="--cc:${c.col}" title="Casinokaart ${c.n}: speeltijd ${ccMin(ccSessMs())}, daarna ${ccMin(ccCdMs())} pauze"><span class="cc-mini">${ccCardSvg(ccLv(),1)}</span><div><span class="label">Kaart ${c.n}</span><b id="ccSess" class="cc-sess-t">${fmtClock(l)}</b></div></div>`};
setInterval(()=>{const L=document.querySelectorAll('.cc-sess-t');if(L.length){const t=fmtClock(ccSessLeft());L.forEach(e=>{if(e.textContent!==t)e.textContent=t})}},1000);
