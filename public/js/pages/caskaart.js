// Casinokaart: je status in het casino, los van je rang. Zes kaarten: Basis, Brons, Zilver, Goud, Platina en Zwart.
// Je groeit door in te zetten (wit en zwart tellen mee), verdeeld over drie soorten spel: slots, snel spel en tafels.
// Is alles van de volgende kaart gehaald, dan krijg je hem meteen. Word je gepakt met zwart geld (verbanning of controle),
// dan ben je 40% van je voortgang naar de volgende kaart kwijt.
// De kaart bepaalt: maximale inzet per spel (VIP en High roller mogen daarbovenop meer), hoe lang je achter elkaar mag
// spelen en hoe lang je daarna pauze moet nemen, je cashback, en hoe snel de beveiliging op zwart geld let.
// VIP en High roller houden daarnaast hun betere kansen (RTP) in de slots; dat staat los van de kaart.
const CC=[
 {id:'basis',n:'Basis',col:'#8a929c',need:null,slot:500,tafel:1000,side:50,rin:500,sess:30,cd:15,cb:0,eye:1.3,lim:20000},
 {id:'brons',n:'Brons',col:'#c27a3e',need:{slot:30000,snel:20000,tafel:50000},slot:2500,tafel:5000,side:250,rin:2500,sess:45,cd:12,cb:.25,eye:1.1,lim:60000},
 {id:'zilver',n:'Zilver',col:'#c9cfd8',need:{slot:150000,snel:100000,tafel:250000},slot:10000,tafel:20000,side:1000,rin:10000,sess:60,cd:10,cb:.5,eye:.9,lim:200000},
 {id:'goud',n:'Goud',col:'#e8b923',need:{slot:750000,snel:500000,tafel:1250000},slot:25000,tafel:50000,side:2500,rin:40000,sess:90,cd:8,cb:.75,eye:.7,lim:600000},
 {id:'platina',n:'Platina',col:'#a9dcff',need:{slot:3600000,snel:2400000,tafel:6000000},slot:50000,tafel:100000,side:5000,rin:100000,sess:150,cd:6,cb:1,eye:.5,lim:2000000},
 {id:'zwart',n:'Zwart',col:'#2a2a31',need:{slot:18000000,snel:12000000,tafel:30000000},slot:100000,tafel:200000,side:10000,rin:150000,sess:240,cd:5,cb:1.25,eye:.35,lim:6000000}];
// lidmaatschap bovenop de kaart: limieten (slots/snel, tafels, side bets, roulette-nummers), speeltijd, pauze
const CC_T={slot:[1,2,2.5],tafel:[1,1.25,1.5],side:[1,1.5,2],rin:[1,1.33,1.67],sess:[1,1.5,2],cd:[1,.8,.6],lim:[1,1.5,2]};
const CC_CAT={kluis:'slot',vis:'slot',zoet:'slot',mines:'snel',avia:'snel',coin:'snel',roulette:'tafel',bj:'tafel',tcp:'tafel',th:'tafel'};
const CC_CATN={slot:'Slots',snel:'Snel spel',tafel:'Tafels'};
// cashback mag nooit boven het huisvoordeel uitkomen: per spel een plafond op de factor
const CC_CBMAX={bj:1.5,coin:0};
const ccS=()=>{if(!S.cc||typeof S.cc!=='object')S.cc={lv:0,p:{slot:0,snel:0,tafel:0}};S.cc.p=S.cc.p||{slot:0,snel:0,tafel:0};return S.cc};
const ccLv=()=>Math.max(0,Math.min(CC.length-1,ccS().lv|0));
const ccCard=()=>CC[ccLv()];
const ccT=k=>(CC_T[k]||[1,1,1])[typeof tier==='function'?tier():0]||1;
// maximale inzet: 'slot' (ook snel spel), 'tafel' (hoofdinzet), 'side', 'rin' (roulette binnen), 'rout' (roulette buiten)
function casMax(k){const c=ccCard();if(k==='snel')k='slot';
 if(k==='rin')return Math.round(c.rin*ccT('rin')/100)*100;if(k==='rout')return Math.round(c.rin*2*ccT('rin')/100)*100;
 return Math.round(c[k]*ccT(k))}
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
function ccCardSvg(lv,small){const c=CC[lv],dark=lv===5,fg=dark?'#e8b923':lv===4?'#0d2333':lv===3?'#3a2700':'#15181d',uid='cc'+lv+(small?'s':'');
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
 return `<section class="ccp" style="--cc:${c.col}">
  <div class="ccp-card">${ccCardSvg(lv)}<div class="ccp-id"><span class="label">Jouw casinokaart</span><b>${c.n}</b><small>${t?`${TIER_NAME[t]}: hogere limieten en langer spelen bovenop je kaart`:'Los van je rang: je groeit door te spelen'}</small></div></div>
  <div class="ccp-prog">${nx?`<div class="ccp-h"><span class="label">Op weg naar ${nx.n}</span><b>${fmt(['slot','snel','tafel'].reduce((a,k)=>a+Math.min(C.p[k]||0,nx.need[k]),0))} / ${fmt(ccNeedTot(nx))}</b></div>
   ${['slot','snel','tafel'].map(k=>{const p=Math.min(1,(C.p[k]||0)/nx.need[k]);return `<div class="ccp-bar ${p>=1?'ok':''}"><span>${CC_CATN[k]}</span><i><i style="width:${(p*100).toFixed(1)}%"></i></i><em>${fmt(Math.min(C.p[k]||0,nx.need[k]))} / ${fmt(nx.need[k])}</em></div>`}).join('')}
   <small class="ccp-n">Alles telt: wit en zwart geld. Gepakt met zwart geld = 40% van je voortgang kwijt.</small>`:'<div class="ccp-h"><span class="label">Hoogste kaart</span><b>Je bent er</b></div><small class="ccp-n">De Zwarte kaart: de hoogste limieten, de langste speeltijd en de beveiliging laat je bijna met rust.</small>'}</div>
  <div class="ccp-perks"><div class="ccp-ph"><span></span><b>${c.n}</b>${nx?`<em>${nx.n}</em>`:''}</div>
   ${perk('Max. inzet slots en snel spel',val(c,'slot'),nx?val(nx,'slot'):null)}${perk('Max. inzet aan tafel',val(c,'tafel'),nx?val(nx,'tafel'):null)}
   ${perk('Side bets',val(c,'side'),nx?val(nx,'side'):null)}${perk('Roulette per nummer',val(c,'rin'),nx?val(nx,'rin'):null)}
   ${perk('Speeltijd achter elkaar',val(c,'sess'),nx?val(nx,'sess'):null)}${perk('Pauze daarna',val(c,'cd'),nx?val(nx,'cd'):null)}
   ${perk('Cashback',val(c,'cb'),nx?val(nx,'cb'):null)}${perk('Aandacht voor zwart geld',Math.round(c.eye*100)+'%',nx?Math.round(nx.eye*100)+'%':null)}</div>
 </section>`}
// kleine regel in de casinobalk: kaart en hoeveel speeltijd je nog hebt
const ccChip=()=>{const c=ccCard(),l=ccSessLeft();return `<div class="ch-cell ch-card" style="--cc:${c.col}" title="Casinokaart ${c.n}: speeltijd ${ccMin(ccSessMs())}, daarna ${ccMin(ccCdMs())} pauze"><span class="cc-mini">${ccCardSvg(ccLv(),1)}</span><div><span class="label">Kaart ${c.n}</span><b id="ccSess" class="cc-sess-t">${fmtClock(l)}</b></div></div>`};
setInterval(()=>{const L=document.querySelectorAll('.cc-sess-t');if(L.length){const t=fmtClock(ccSessLeft());L.forEach(e=>{if(e.textContent!==t)e.textContent=t})}},1000);
