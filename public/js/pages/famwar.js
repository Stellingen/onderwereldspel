// Families: de macht in de stad, de bendeoorlog en de overname.
// - De stand: elke periode van 5 speldagen (20 uur) verschuift de macht tussen de families. De stand volgt uit het nummer van de
//   periode (vaste toevalsgetallen), dus iedereen ziet dezelfde stand. Er zit naijleffect in: wie sterk is, blijft meestal boven,
//   maar de top wisselt regelmatig. Alleen jouw eigen familie schuift mee met wat jij in de oorlog doet: jouw slagen tellen mee
//   in de stand van de volgende periode (en daarna steeds iets minder).
// - De oorlog: de laatste 2 speldagen van elke periode. Jouw familie vecht tegen de familie direct boven jullie (staan jullie
//   bovenaan, dan tegen de nummer 2). Per oorlog vecht je 3 slagen: wijken veroveren op de kaart, 6 rondes, op timing.
//   Wie halverwege weggaat (verversen, app dicht), verliest die slag.
// - De overname: als Onderbaas daag je de baas uit voor een duel (best of 3, reactie). Win je, dan leid jij de familie.
const FW_DAYS=5,FW_MS=FW_DAYS*DAY_MS,FW_WAR=3*DAY_MS,FW_MAX=3,FW_EN=15,FW_HP=35,FW_CD=10,FW_ROUNDS=6;
const FW_A=.5,FW_NOISE=28,FW_STEP=3.5,FW_BASE=40,FW_BACK=24,FW_N=9;
const FDU_EN=20,FDU_HP=60;
const fwPer=t=>Math.floor((t==null?now():t)/FW_MS);
const fwStartT=P=>P*FW_MS;
const fwWarOn=()=>now()-fwStartT(fwPer())>=FW_WAR;
const fwDur=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+'u '+String(m%60).padStart(2,'0')+'m':m+'m'};
const famLore=id=>(typeof FAM_LORE!=='undefined'&&FAM_LORE&&FAM_LORE[id])||null;
// vaste toevalsgetallen per periode en familie (mulberry32 op een gemengd zaadje)
function fwRand(P,i){let a=(P*2654435761+(i+1)*40503+0x1234567)>>>0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}
const fwMineIdx=()=>(typeof S!=='undefined'&&S&&S.family)?FAMILIES.findIndex(f=>f.id===S.family):-1;
const fwBoost=()=>(typeof S!=='undefined'&&S&&S.fwh&&S.fwh.f===S.family&&S.fwh.h)||{};
let _fwM={k:null,v:null};
// macht per familie voor de laatste FW_N perioden (t/m P). Basis groeit met de grootte van de familie.
function fwSeries(P){const mi=fwMineIdx(),bo=fwBoost(),k=P+'|'+mi+'|'+JSON.stringify(bo);if(_fwM.k===k)return _fwM.v;
 const base=FAMILIES.map((f,i)=>FW_BASE+i*FW_STEP);let X=base.slice();const out=[];
 for(let p=P-FW_N+1-FW_BACK;p<=P;p++){X=X.map((x,i)=>FW_A*x+(1-FW_A)*(base[i]+(fwRand(p,i)*2-1)*FW_NOISE)+(i===mi?(+bo[p-1]||0):0));if(p>P-FW_N)out.push(X)}
 _fwM={k,v:out};return out}
const fwOrder=X=>X.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]||a[1]-b[1]).map(v=>v[1]);
function fwTable(){const s=fwSeries(fwPer()),cur=s[FW_N-1],o=fwOrder(cur),op=fwOrder(s[FW_N-2]),mx=Math.max(...cur);
 return o.map((i,k)=>({f:FAMILIES[i],i,pow:cur[i],pct:cur[i]/mx,pos:k+1,prev:op.indexOf(i)+1}))}
const fwPosOf=id=>{const r=fwTable().find(x=>x.f.id===id);return r?r.pos:0};
const fwMinePos=()=>S.family?fwPosOf(S.family):0;
// posities van een familie in de laatste 8 perioden (oudste eerst)
function fwPosHist(id){const i=FAMILIES.findIndex(f=>f.id===id);return fwSeries(fwPer()).slice(1).map(X=>fwOrder(X).indexOf(i)+1)}
function fwReign(){const s=fwSeries(fwPer()),top=fwOrder(s[FW_N-1])[0];let n=0;for(let k=FW_N-1;k>=0&&fwOrder(s[k])[0]===top;k--)n++;return n}
function fwRival(){const T=fwTable(),me=T.find(r=>r.f.id===S.family);if(!me)return null;return me.pos===1?T[1]:T[me.pos-2]}
// andere oorlogen deze periode: buren in de stand, zonder jouw eigen gevecht
function fwOtherWars(){const T=fwTable(),R=S.family&&fwRival(),busy=new Set([S.family,R&&R.f.id].filter(Boolean)),o=[];
 for(let k=0;k<T.length-1&&o.length<3;k++){const a=T[k],b=T[k+1];if(busy.has(a.f.id)||busy.has(b.f.id))continue;o.push([a,b]);k++}return o}

// ---------- jouw oorlog ----------
function fwCur(){const P=fwPer();return (S.fw&&S.fw.p===P&&S.fw.f===S.family)?S.fw:{p:P,f:S.family,n:0,w:0,l:0,d:0,at:0}}
const fwCdLeft=()=>{const w=fwCur();return w.at?Math.max(0,w.at+FW_CD*60000*waitK()-now()):0};
function fwWhyNot(){if(!S.family)return 'Geen familie';if(!fwWarOn())return 'Nog geen oorlog';const w=fwCur();if(w.n>=FW_MAX)return 'Al je slagen gevochten';
 if(inJail())return 'Je zit vast';if(S.feud)return 'Eerst het bendegevecht';const cd=fwCdLeft();if(cd)return 'Volgende slag over '+fmtClock(cd);
 if(S.hp<FW_HP)return 'Minimaal '+FW_HP+'% gezondheid';if(S.energy<FW_EN)return 'Te moe · '+FW_EN+' energie';return ''}
// kracht: wapens, Schieten, Conditie, familie, rang in de familie en gezondheid. Hun kracht: grootte en macht van hun familie.
const fwYou=()=>Math.round(30+gearBonus()*.9+sk('schiet')*.35+sk('conditie')*.15+8+famTier()*3+famRankIdx()*2+Math.max(0,S.hp-60)*.25);
const fwThem=r=>Math.round(40+FAMILIES.indexOf(r.f)*9+(r.pow-60)*.5);
const fwW=(you,them)=>Math.max(.16,Math.min(.32,.22+(you-them)/260));
// tikmarge in seconden bij een aanval op hun wijk in ronde 1 (de ring valt van 3,1x naar 0 in D ms)
const fwWin=w=>2*w/3.1*1125/1000;
const fwPts=res=>{const L=famLead();return (res==='win'?6:res==='draw'?2:-2)*(L===2?2:L===1?1.5:1)};
const fwWinCash=(T,m)=>Math.round(2400*Math.pow(2,T)*(1+Math.min(10,Math.max(0,m))*.05));
function fwTodo(){if(!S.family||!fwWarOn())return null;const w=fwCur();if(w.n>=FW_MAX)return null;const R=fwRival();if(!R)return null;
 return {ic:'fam',t:'Bendeoorlog',s:'Tegen '+R.f.n+' · '+(FW_MAX-w.n)+' slag'+(FW_MAX-w.n>1?'en':'')+' over',h:'fam',c:'var(--red)'}}

// weglopen midden in een slag (verversen, app dicht): telt als verloren
function fwAbandon(){const w=S.fw;if(!w||!w.live)return;delete w.live;w.l=(w.l||0)+1;w.res=w.res||[];w.res.push('loss');
 if(w.f===S.family){S.fwh=(S.fwh&&S.fwh.f===S.family)?S.fwh:{f:S.family,h:{}};S.fwh.h[w.p]=(S.fwh.h[w.p]||0)-2}
 S.hp=Math.max(5,S.hp-8);log('Bendeoorlog: je liet je familie midden in de slag in de steek. Telt als verloren (−8% gezondheid)','bad');
 toast('Je liep weg midden in de slag. Dat telt als verloren.','bad');save()}
// periodewissel en begin van de oorlog melden
function fwTick(){if(typeof S==='undefined'||!S||typeof save!=='function')return;
 if(S.fw&&S.fw.live&&!document.getElementById('fwLayer'))fwAbandon();
 const P=fwPer();
 if(S.fwSeen!==P){const first=S.fwSeen==null;S.fwSeen=P;
  if(!first){const T=fwTable(),top=T[0];
   log(`Nieuwe periode in de stad: ${top.f.n} heeft de macht${S.family?`, ${famBase().n} staat #${fwMinePos()}`:''}`,'info');
   if(S.family)toast(`Nieuwe periode: ${top.f.n} heeft de macht. ${famBase().n} staat #${fwMinePos()}.`,fwMinePos()===1?'lvl':'ok')}
  save()}
 if(S.family&&fwWarOn()&&S.fwWar!==P){S.fwWar=P;const R=fwRival();if(R&&fwCur().n<FW_MAX){toast(`Bendeoorlog: ${famBase().n} tegen ${R.f.n}. Vecht mee op de familiepagina.`,'bad');log(`De bendeoorlog is begonnen: ${famBase().n} tegen ${R.f.n}`,'bad')}save()}}
setInterval(fwTick,2000);

// opbrengst van de periode voor families in de top 3 (eenmalig per periode, je moest er bij het begin al bij zijn)
function fwIncome(){if(!S.family||!S.fr||S.fr.id!==S.family)return null;const P=fwPer();if(S.fpay===P||(S.fr.since||0)>fwStartT(P))return null;
 const pos=fwMinePos(),b=pos===1?3000:pos===2?1500:pos===3?800:0;return b?{P,pos,amt:Math.round(b*Math.pow(2,famTier())*famScale())}:null}
// afdracht voor de leiding: Onderbaas en Baas krijgen per speldag een deel van wat de familie binnenhaalt (max 3 speldagen sparen)
const famTribRate=()=>{const L=famLead();if(!L)return 0;const pos=fwMinePos();return Math.round((L===2?1200:500)*Math.pow(2,famTier())*(pos===1?1.5:pos<=3?1.25:1))};
const famTribAvail=()=>{if(!famLead()||!S.fr||!S.fr.trib)return 0;return Math.floor(famTribRate()*Math.min(3*DAY_MS,Math.max(0,now()-S.fr.trib))/DAY_MS)};
const famTribMin=()=>Math.max(1,Math.round(famTribRate()*.1));

// ---------- de stad (op de familiepagina) ----------
function fwCityHtml(){const T=fwTable(),P=fwPer(),t=now()-fwStartT(P),day=Math.min(FW_DAYS,Math.floor(t/DAY_MS)+1),war=t>=FW_WAR,mine=S.family,reign=fwReign();
 const rows=T.map(r=>{const d=r.prev-r.pos,me=r.f.id===mine;
  return `<li><button class="fw-row${me?' me':''}${r.pos===1?' top':''}" style="--fc:${r.f.col}" onclick="famOpen('${r.f.id}')" aria-label="${esc(r.f.n)}, plek ${r.pos}">
   <span class="fw-pos">${r.pos}</span><span class="crest">${r.f.m}</span>
   <span class="fw-nm"><b>${r.f.n}</b>${r.pos===1||me?`<small>${r.pos===1?(reign>1?'heerst al '+reign+' perioden':'heerst over de stad'):''}${r.pos===1&&me?' · ':''}${me?'jouw familie':''}</small>`:''}</span>
   <span class="fw-pw"><i style="width:${Math.round(r.pct*100)}%"></i></span><span class="fw-val">${Math.round(r.pow)}</span>
   <em class="fw-tr${d>0?' up':d<0?' dn':''}" title="${d?'vorige periode #'+r.prev:'gelijk gebleven'}">${d>0?'▲'+d:d<0?'▼'+(-d):'–'}</em></button></li>`}).join('');
 const mk=Math.round(t/FW_MS*400)/4;
 const tl=`<div class="fw-tl"><div class="fw-days">${[1,2,3,4,5].map(d=>`<i class="${d>3?'war ':''}${d<day?'past':d===day?'now':''}"><span>${d>3?'Oorlog':'Dag '+d}</span></i>`).join('')}</div><b class="fw-mk" style="left:${mk}%"></b></div>`;
 const moved=T.filter(r=>Math.abs(r.prev-r.pos)>=2).sort((a,b)=>Math.abs(b.prev-b.pos)-Math.abs(a.prev-a.pos)).slice(0,3);
 const inc=fwIncome();
 return `<section class="fw-city">
  <div class="fw-head"><div><h2>De stad</h2><p>Wie heeft deze periode de macht? Elke 5 speldagen verschuift het. De laatste 2 speldagen is het oorlog, en wat jij dan doet telt mee voor de stand van jouw familie.</p></div>
   <div class="fw-when">${tl}<span>${war?`Oorlog · nieuwe stand over <b>${fwDur(FW_MS-t)}</b>`:`Speldag ${day} van ${FW_DAYS} · oorlog over <b>${fwDur(FW_WAR-t)}</b>`}</span></div></div>
  <div class="fw-grid${mine?' mine':''}">
   <div class="fw-chainw"><div class="fw-chain-h"><span class="label">Plek</span><span class="label">Familie</span><span class="label">Macht</span></div><ol class="fw-chain">${rows}</ol></div>
   <div class="fw-side">${fwWarHtml(T,war,t)}
    ${inc?`<div class="fw-inc"><div><span class="label">Opbrengst van de periode</span><b>${fmt(inc.amt)}</b><small>${famBase().n} staat #${inc.pos}: de stad betaalt mee</small></div><button class="btn sm" onclick="act.fwPay()">Ophalen</button></div>`:''}
    <div class="fw-news"><span class="label">Vorige periode</span>${moved.length?moved.map(r=>`<div><i style="--fc:${r.f.col}"></i><span>${r.f.n} ${r.prev>r.pos?'stijgt':'zakt'} naar <b>#${r.pos}</b></span></div>`).join(''):'<div><span>Rustige periode: bijna niemand kwam van zijn plek.</span></div>'}</div>
   </div></div></section>`}
function fwWarHtml(T,war,t){const mine=S.family,R=mine&&fwRival(),f=famBase();
 const others=fwOtherWars().map(([a,b])=>`<li><i style="--fc:${a.f.col}"></i>${a.f.n} <em>tegen</em> ${b.f.n}<i style="--fc:${b.f.col}"></i></li>`).join('');
 if(!mine||!R)return `<div class="fw-war idle"><span class="label">Bendeoorlog</span><h3>${war?'De families vechten om de stad':'De volgende oorlog'}</h3>
   <p>Hoor je bij een familie, dan vecht je mee: jouw familie tegen de familie direct boven jullie. Elke gewonnen slag duwt jouw familie omhoog in de stand.</p>
   ${others?`<ul class="fw-others">${others}</ul>`:''}</div>`;
 const me=T.find(r=>r.f.id===mine),w=fwCur(),why=fwWhyNot(),can=!why,you=fwYou(),them=fwThem(R),win=fwWin(fwW(you,them));
 const dots=Array.from({length:FW_MAX},(_,i)=>{const r=w.res&&w.res[i];return `<i class="${r||''}" title="Slag ${i+1}"></i>`}).join('');
 return `<div class="fw-war${war?' on':''}"><span class="label">${war?'Bendeoorlog · nu':'Bendeoorlog · over '+fwDur(FW_WAR-t)}</span>
  <div class="fw-vs"><div style="--fc:${f.col}"><span class="crest">${f.m}</span><b>${f.n}</b><small>#${me.pos} · macht ${Math.round(me.pow)}</small></div><em>tegen</em>
   <div style="--fc:${R.f.col}"><span class="crest">${R.f.m}</span><b>${R.f.n}</b><small>#${R.pos} · macht ${Math.round(R.pow)}</small></div></div>
  <p>${me.pos===1?`Jullie staan bovenaan. ${R.f.n} wil jullie plek: houd ze klein.`:`${R.f.n} staat net boven jullie. Verover hun wijken en neem hun plek in.`} Per oorlog vecht je ${FW_MAX} slagen van ${FW_ROUNDS} rondes: wijken innemen en je eigen wijken verdedigen, op het juiste moment tikken.</p>
  <div class="fw-k"><div><span class="label">Kracht</span><b>${you} <small>tegen</small> ${them}</b><em>jullie tegen hen: wapens, Schieten, Conditie, je rang</em></div><div><span class="label">Tikmarge</span><b>${win.toFixed(2).replace('.',',')} s</b><em>${win<.14?'krap':win<.19?'normaal':'ruim'}, bij hun wijken</em></div></div>
  <div class="fw-slagen"><span class="label">Jouw slagen</span><div class="fw-dots">${dots}</div><span>${w.w} gewonnen · ${w.d||0} gelijk · ${w.l} verloren</span></div>
  <div class="fw-rw"><span>Winst: <b>${fmt(fwWinCash(famTier(),3))}</b>+, ${Math.round(18*(1+famTier()*.5))} eer, cred en XP</span><span>Stand: <b>+${fwPts('win')}</b> macht per gewonnen slag${famLead()?' (jij bent de leiding)':''}</span></div>
  ${war?`<button class="btn ${can?'red':'ghost'}" onclick="fwStart()" ${can?'':'disabled'}>${can?'Ten strijde · '+FW_EN+' energie':why}</button>`:`<button class="btn ghost" disabled>De oorlog begint op speldag 4</button>`}
  ${others?`<div class="fw-oth"><span class="label">${war?'Ook in oorlog':'Ook tegen elkaar'}</span><ul class="fw-others">${others}</ul></div>`:''}</div>`}

// ---------- de slag: wijken veroveren ----------
// Kaart van 19 wijken (zeshoeken). Midden telt 3, de binnenring 2, de buitenring 1. Jij begint links, zij rechts.
// Elke ronde: jij kiest een wijk naast jouw gebied en tikt als de ring over de rand valt. Daarna vallen zij aan:
// een wijk van jou verdedig je op dezelfde manier. Na 6 rondes telt wie de meeste punten heeft.
const FW_S=40,FW_NAMES={'0,0':'Dam','0,-1':'Jordaan','1,-1':'Wallen','1,0':'Plantage','0,1':'De Pijp','-1,1':'Vondel','-1,0':'Oud-West',
 '1,-2':'Noord','2,-2':'Haven','2,-1':'Zeeburg','2,0':'IJburg','1,1':'Watergraaf','0,2':'Bijlmer','-1,2':'Rivieren','-2,2':'Zuidas','-2,1':'Nieuw-West','-2,0':'Osdorp','-1,-1':'Sloterdijk','0,-2':'Houthaven'};
const FW_MAP=Object.keys(FW_NAMES).map(k=>{const [q,r]=k.split(',').map(Number),ring=Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r));
 return {k,q,r,x:Math.round(FW_S*Math.sqrt(3)*(q+r/2)*10)/10,y:FW_S*1.5*r,v:3-ring,n:FW_NAMES[k]}});
const FW_BY=Object.fromEntries(FW_MAP.map(h=>[h.k,h]));
const fwNb=k=>{const h=FW_BY[k];return [[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]].map(([a,b])=>(h.q+a)+','+(h.r+b)).filter(x=>FW_BY[x])};
const fwHexPts=s=>[0,1,2,3,4,5].map(i=>{const a=Math.PI/180*(60*i-30);return (s*Math.cos(a)).toFixed(1)+','+(s*Math.sin(a)).toFixed(1)}).join(' ');
let FWG=null;
const fwQ=s=>document.querySelector('#fwLayer '+s);
const fwHex=k=>fwQ(`.fwh[data-k="${k}"]`);
function fwTargets(side){const G=FWG;return FW_MAP.filter(h=>G.own[h.k]!==side&&fwNb(h.k).some(n=>G.own[n]===side)).map(h=>h.k)}
function fwScore(){const G=FWG,s={a:G.bonus.a,b:G.bonus.b};FW_MAP.forEach(h=>{if(G.own[h.k]===1)s.a+=h.v;else if(G.own[h.k]===2)s.b+=h.v});return s}
function fwStart(){const why=fwWhyNot();if(why){toast(why,'bad');return}const R=fwRival();if(!R||window.__chase||document.getElementById('fwLayer'))return;
 const P=fwPer(),w=fwCur(),me=famBase(),you=fwYou(),them=fwThem(R);
 S.energy-=FW_EN;w.n++;w.at=now();w.live=now();S.fw=w;S.stats.wars=(S.stats.wars||0)+1;save();try{pushState()}catch(e){}
 FWG={P,me,R,you,them,w:fwW(you,them),round:1,phase:'pick',own:{},bonus:{a:0,b:0},dmg:0,quit:false};
 FW_MAP.forEach(h=>FWG.own[h.k]=0);['-2,0','-2,1'].forEach(k=>FWG.own[k]=1);['2,0','2,-1'].forEach(k=>FWG.own[k]=2);
 window.__chase=true;fwDraw();setTimeout(fwPick,500)}
function fwDraw(){const G=FWG;let el=document.getElementById('fwLayer');if(!el){el=document.createElement('div');el.id='fwLayer';document.body.appendChild(el)}
 const pts=fwHexPts(FW_S-2.5),hex=FW_MAP.map(h=>`<g class="fwh" data-k="${h.k}" transform="translate(${h.x} ${h.y})"><polygon points="${pts}"/>
   <text class="fwh-n" y="${h.v===3?-5:-1}">${h.n.toUpperCase()}</text><g class="fwh-v">${Array.from({length:h.v},(_,i)=>`<rect x="${(i-(h.v-1)/2)*7-2.5}" y="${h.v===3?4:7}" width="5" height="5"/>`).join('')}</g></g>`).join('');
 el.className='fwg-ov';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
 el.innerHTML=`<div class="fwg-box" style="--fa:${G.me.col};--fb:${G.R.f.col}">
  <div class="fwg-top"><div class="fwg-side a"><span class="crest">${G.me.m}</span><span><b>${G.me.n}</b><em id="fwSa">0</em></span></div>
   <div class="fwg-mid"><span class="label">Slag ${S.fw.n} van ${FW_MAX}</span><b id="fwRnd">Ronde 1/${FW_ROUNDS}</b></div>
   <div class="fwg-side b"><span><b>${G.R.f.n}</b><em id="fwSb">0</em></span><span class="crest">${G.R.f.m}</span></div></div>
  <div class="fwg-msg" id="fwMsg">De wijken worden verdeeld…</div>
  <div class="fwg-map" id="fwMap"><svg viewBox="-178 -166 356 332" id="fwSvg" aria-label="Kaart van de stad">${hex}<g id="fwFx"></g></svg></div>
  <div class="fwg-foot"><span class="fwg-hp" id="fwHp"></span><button class="btn xl fwg-now" id="fwNow" disabled>Kies een wijk</button><button class="btn ghost sm" id="fwQuit">Opgeven</button></div></div>`;
 el.querySelector('#fwSvg').addEventListener('pointerdown',e=>{const g=e.target.closest('.fwh');if(FWG&&FWG.phase==='pick'){if(g&&g.classList.contains('can')){e.preventDefault();fwAttack(g.dataset.k)}return}if(FWG&&FWG.phase==='ring'){e.preventDefault();fwPress()}});
 el.querySelector('#fwNow').addEventListener('pointerdown',e=>{e.preventDefault();fwPress()});
 el.querySelector('#fwQuit').addEventListener('click',()=>{const b=el.querySelector('#fwQuit');if(!G.quit){G.quit=true;b.textContent='Zeker? Telt als verloren';b.classList.add('red');return}fwEnd(true)});
 document.addEventListener('keydown',fwKey);fwPaint()}
function fwKey(e){if(!FWG)return;if((e.code==='Space'||e.code==='Enter')&&FWG.phase==='ring'){e.preventDefault();if(!e.repeat)fwPress()}}
function fwPaint(){const G=FWG;if(!G)return;FW_MAP.forEach(h=>{const g=fwHex(h.k);if(!g)return;g.classList.toggle('a',G.own[h.k]===1);g.classList.toggle('b',G.own[h.k]===2)});
 const s=fwScore();fwQ('#fwSa').textContent=s.a;fwQ('#fwSb').textContent=s.b;fwQ('#fwRnd').textContent=`Ronde ${Math.min(G.round,FW_ROUNDS)}/${FW_ROUNDS}`;
 fwQ('#fwHp').innerHTML=`Gezondheid <b class="${S.hp<40?'low':''}">${S.hp}%</b>${G.dmg?` <small>−${G.dmg}</small>`:''}`}
function fwMsg(t,c){const m=fwQ('#fwMsg');if(m){m.className='fwg-msg'+(c?' '+c:'');m.innerHTML='<span>'+t+'</span>'}}
function fwBtn(on,t){const b=fwQ('#fwNow');if(b){b.disabled=!on;b.textContent=t}}
function fwPick(){const G=FWG;if(!G)return;G.phase='pick';const can=fwTargets(1);fwPaint();
 if(!can.length){fwMsg('Er grenst geen wijk meer aan jullie gebied. Zij zijn aan zet.');fwBtn(false,'Even wachten');setTimeout(fwEnemy,1000);return}
 can.forEach(k=>fwHex(k).classList.add('can'));fwBtn(false,'Kies een wijk');
 fwMsg(G.round===1?'Kies een wijk die aan jullie gebied grenst. Daarna valt er een ring om die wijk: <b>tik als de ring over de rand valt</b>.':`Ronde ${G.round}: kies een wijk naast jullie gebied.`)}
function fwAttack(k){const G=FWG;if(!G||G.phase!=='pick')return;document.querySelectorAll('#fwLayer .fwh.can').forEach(e=>e.classList.remove('can'));
 const def=G.own[k],w=def===2?G.w:Math.min(.36,G.w+.07);G.kind='att';G.k=k;
 fwMsg(def===2?`Aanval op <b>${FW_BY[k].n}</b>, een wijk van ${G.R.f.n}. Tik als de ring over de rand valt.`:`Jullie trekken <b>${FW_BY[k].n}</b> in. De buurt verzet zich: tik als de ring over de rand valt.`);
 try{SFX.click()}catch(e){}fwRing(k,w,(def===2?1150:1300)-G.round*25)}
function fwRing(k,w,D){const G=FWG,h=FW_BY[k],R0=FW_S*3.1;G.phase='ring';G.ring={k,w,D,R0,t0:performance.now()+140,done:false};
 fwQ('#fwFx').innerHTML=`<circle class="fwg-band" cx="${h.x}" cy="${h.y}" r="${FW_S}" stroke-width="${(2*w*FW_S).toFixed(1)}"/><circle class="fwg-perf" cx="${h.x}" cy="${h.y}" r="${FW_S}" stroke-width="${(2*w*FW_S/3).toFixed(1)}"/><circle class="fwg-ring" cx="${h.x}" cy="${h.y}" r="${R0}"/>`;
 const g=fwHex(k);g.classList.add('tgt');fwBtn(true,'Nu!');const ring=fwQ('.fwg-ring'),band=fwQ('.fwg-band'),me=G.ring;
 const loop=t=>{if(!FWG||FWG.ring!==me||me.done)return;const r=fwRingR(t);ring.setAttribute('r',Math.max(0,r).toFixed(1));band.classList.toggle('on',Math.abs(r-FW_S)<=w*FW_S);
  if(r<FW_S*(1-w)){fwRingEnd(false,'late');return}G.raf=requestAnimationFrame(loop)};G.raf=requestAnimationFrame(loop)}
const fwRingR=t=>{const g=FWG.ring;return g.R0*(1-Math.max(0,t-g.t0)/g.D)};
function fwPress(){const G=FWG;if(!G||G.phase!=='ring'||!G.ring||G.ring.done)return;const t=performance.now();if(t<G.ring.t0+150)return;
 const r=fwRingR(t),d=Math.abs(r-FW_S),w=G.ring.w;fwRingEnd(d<=w*FW_S,d<=w*FW_S/3?'perfect':r>FW_S?'early':'late')}
function fwPop(k,t,c){const h=FW_BY[k],fx=fwQ('#fwFx');if(!fx)return;fx.insertAdjacentHTML('beforeend',`<text class="fwg-pop ${c}" x="${h.x}" y="${h.y-FW_S*.15}">${t}</text>`)}
function fwHurt(a,b){const G=FWG,d=Math.min(rnd(a,b),Math.max(0,20-G.dmg));if(d<=0)return 0;G.dmg+=d;S.hp=Math.max(5,S.hp-d);return d}
function fwRingEnd(ok,how){const G=FWG,R=G.ring;if(!R||R.done)return;R.done=true;cancelAnimationFrame(G.raf);G.phase='wait';fwBtn(false,'…');
 const k=R.k,n=FW_BY[k].n,perf=ok&&how==='perfect',fx=fwQ('#fwFx');fwHex(k).classList.remove('tgt');
 fx.querySelectorAll('circle').forEach(c=>c.remove());
 if(G.kind==='att'){if(ok){const from=G.own[k];G.own[k]=1;if(perf)G.bonus.a++;fwPop(k,perf?'Perfect +1':'Raak','ok');fwMsg(`${perf?'Perfect! ':''}<b>${n}</b> is van jullie${from===2?`, ${G.R.f.n} is hem kwijt`:''}.`,'ok');try{SFX.tick()}catch(e){}}
  else{const d=fwHurt(2,4);fwPop(k,how==='early'?'Te vroeg':'Te laat','bad');fwMsg(`${how==='early'?'Te vroeg':'Te laat'}. <b>${n}</b> houdt stand${d?` en het kost je ${d}% gezondheid`:''}.`,'bad')}
  fwPaint();setTimeout(fwEnemy,1100)}
 else{if(ok){if(perf)G.bonus.a++;fwPop(k,perf?'Perfect +1':'Gehouden','ok');fwMsg(`${perf?'Perfect! ':''}Jullie houden <b>${n}</b>.`,'ok');try{SFX.tick()}catch(e){}}
  else{G.own[k]=2;const d=fwHurt(3,5);fwPop(k,'Gevallen','bad');fwMsg(`<b>${n}</b> is gevallen${d?`, −${d}% gezondheid`:''}.`,'bad')}
  fwPaint();setTimeout(fwNext,1100)}}
// zij zijn aan zet: liefst een wijk van jou die veel waard is, anders de duurste vrije wijk
function fwEnemy(){const G=FWG;if(!G)return;G.phase='enemy';const c=fwTargets(2);fwPaint();
 if(!c.length){fwMsg(`${G.R.f.n} kan nergens heen.`);setTimeout(fwNext,900);return}
 const sc=k=>FW_BY[k].v*10+(G.own[k]===1?7:0)+fwNb(k).filter(n=>G.own[n]===2).length*2+Math.random()*6;const k=c.sort((a,b)=>sc(b)-sc(a))[0],n=FW_BY[k].n;
 const g=fwHex(k);g.classList.add('hit');try{SFX.shot()}catch(e){}
 if(G.own[k]===1){fwMsg(`${G.R.f.n} valt <b>${n}</b> aan. Verdedig: tik als de ring over de rand valt!`,'bad');G.kind='def';
  setTimeout(()=>{g.classList.remove('hit');if(FWG===G)fwRing(k,G.w,1150-G.round*25)},650);return}
 fwMsg(`${G.R.f.n} trekt <b>${n}</b> in…`);
 setTimeout(()=>{if(FWG!==G)return;g.classList.remove('hit');const p=Math.max(.45,Math.min(.8,.62+(G.them-G.you)/400));
  if(Math.random()<p){G.own[k]=2;fwPop(k,'Ingenomen','bad');fwMsg(`${G.R.f.n} neemt <b>${n}</b> in.`,'bad')}else{fwPop(k,'Afgeslagen','ok');fwMsg(`De buurt in <b>${n}</b> jaagt ${G.R.f.n} weg.`,'ok')}
  fwPaint();setTimeout(fwNext,1000)},800)}
function fwNext(){const G=FWG;if(!G)return;const fx=fwQ('#fwFx');if(fx)fx.innerHTML='';G.round++;if(G.round>FW_ROUNDS){fwEnd(false);return}fwPick()}
function fwEnd(quit){const G=FWG;if(!G||G.phase==='end')return;cancelAnimationFrame(G.raf);G.phase='end';document.removeEventListener('keydown',fwKey);
 const s=fwScore(),res=quit?'loss':s.a>s.b?'win':s.a===s.b?'draw':'loss',T=famTier(),w=S.fw&&S.fw.p===G.P?S.fw:fwCur(),pts=fwPts(res);let got=[];
 delete w.live;if(!S.fr||S.fr.id!==S.family)S.fr={id:S.family,eer:0,since:now()};
 S.fwh=(S.fwh&&S.fwh.f===S.family)?S.fwh:{f:S.family,h:{}};S.fwh.h[G.P]=(S.fwh.h[G.P]||0)+pts;Object.keys(S.fwh.h).forEach(p=>{if(+p<G.P-30)delete S.fwh.h[p]});
 w.res=w.res||[];w.res.push(res);
 if(res==='win'){w.w++;S.fr.ww=(S.fr.ww||0)+1;const cash=fwWinCash(T,s.a-s.b),e=Math.round(18*(1+T*.5)),cr=credGain(4+Math.floor(T/2),'netjes'),xp=50+T*25;
  S.cash+=cash;S.cred+=cr;famAddEer(e);addXp(xp);S.stats.warWins=(S.stats.warWins||0)+1;got=[fmt(cash),'+'+e+' eer','+'+cr+' cred','+'+xp+' XP']}
 else if(res==='draw'){w.d=(w.d||0)+1;const cash=Math.round(900*Math.pow(2,T)),e=Math.round(8*(1+T*.5)),xp=25+T*12;S.cash+=cash;famAddEer(e);addXp(xp);got=[fmt(cash),'+'+e+' eer','+'+xp+' XP']}
 else{w.l++;if(!quit){famAddEer(4);addXp(15+T*6);got=['+4 eer omdat je er was','+'+(15+T*6)+' XP']}}
 addHeat(4);S.fw=w;
 log(`Bendeoorlog tegen ${G.R.f.n}: slag ${res==='win'?'gewonnen':res==='draw'?'gelijk':'verloren'} (${s.a}–${s.b})${got.length?', '+got.join(', '):''}`,res==='win'?'ok':res==='draw'?'info':'bad');
 save();try{pushState()}catch(e){}
 const box=fwQ('.fwg-box');if(box)box.classList.add(res==='win'?'won':res==='loss'?'lost':'even');
 fwMsg(quit?'Je hebt opgegeven.':'De slag is voorbij.',res==='win'?'ok':res==='loss'?'bad':'');fwBtn(false,'Klaar');
 const foot=fwQ('.fwg-foot');if(foot)foot.outerHTML=`<div class="fwg-res"><h3 class="${res}">${res==='win'?'Gewonnen':res==='draw'?'Gelijkspel':'Verloren'}</h3>
  <p>${s.a} tegen ${s.b} punten${G.dmg?` · −${G.dmg}% gezondheid`:''}${got.length?' · '+got.join(' · '):''}</p>
  <p class="fwg-pts">Stand van ${G.me.n}: <b class="${pts>=0?'up':'dn'}">${pts>=0?'+':''}${pts} macht</b> in de volgende periode</p>
  <button class="btn ${res==='loss'?'ghost':''}" id="fwClose">Sluiten</button></div>`;
 const c=fwQ('#fwClose');if(c){c.addEventListener('click',fwClose);setTimeout(()=>c.focus({preventScroll:true}),50)}
 try{res==='win'?SFX.win(3):res==='loss'?SFX.lose():SFX.chip()}catch(e){}
 toast(res==='win'?`Slag gewonnen tegen ${G.R.f.n}`:res==='draw'?`Gelijkspel tegen ${G.R.f.n}`:`Slag verloren tegen ${G.R.f.n}`,res==='win'?'lvl':res==='loss'?'bad':'ok')}
function fwClose(){FWG=null;const el=document.getElementById('fwLayer');if(el)el.remove();window.__chase=false;render()}

// ---------- de overname: duel met de baas ----------
// Best of 3. Wacht op het teken en tik zo snel je kunt. Te vroeg (of bij een schijnbeweging) = ronde kwijt.
// Schieten en vuurkracht geven je een paar honderdsten voorsprong. De baas van een grotere familie is sneller.
let FDU=null;
const fduBonus=()=>Math.min(80,Math.round(sk('schiet')*1.2+gearVk()*2.5));
const fduBossMs=T=>Math.round(425-T*6);
function famTakeoverWhy(){if(famLead()!==1)return 'Alleen als Onderbaas';const need=famNeed(FAM_TOP+2);if(famEer()<need)return 'Nog '+Math.ceil(need-famEer()).toLocaleString('nl-NL')+' eer';
 if(inJail())return 'Je zit vast';if(S.feud)return 'Eerst het bendegevecht';if(cdLeft('fam_tko'))return 'Opnieuw over '+fwDur(cdLeft('fam_tko'));
 if(S.hp<FDU_HP)return 'Minimaal '+FDU_HP+'% gezondheid';if(S.energy<FDU_EN)return 'Te moe · '+FDU_EN+' energie';return ''}
function famTakeover(){if(famTakeoverWhy()||window.__chase||document.getElementById('fwLayer'))return;const f=famBase(),L=famLore(f.id),T=famTier();
 S.cd.fam_tko=now()+DAY_MS*waitK();S.energy-=FDU_EN;save();try{pushState()}catch(e){}
 FDU={f,boss:(L&&L.baas)||'de oude baas',T,w:0,l:0,n:0,phase:'idle',tm:[]};window.__chase=true;
 const el=document.createElement('div');el.id='fwLayer';el.className='fwg-ov';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);
 el.innerHTML=`<div class="fdu-box" style="--fc:${f.col}"><div class="fdu-top"><span class="crest">${f.m}</span><div><span class="label">De overname · ${esc(f.n)}</span><h2>Jij tegen ${esc(FDU.boss)}</h2></div></div>
  <p class="fdu-how">Best of 3. Wacht op het teken en tik dan zo snel als je kunt. Te vroeg, of bij een schijnbeweging, is de ronde kwijt.${fduBonus()?` Schieten en je wapens geven je <b>${fduBonus()} ms</b> voorsprong.`:''}</p>
  <button class="fdu-arena" id="fduA" aria-label="Tik"><span class="fdu-sig" id="fduSig">Klaar?</span><small id="fduSub">Het eerste teken komt zo</small></button>
  <ol class="fdu-rounds" id="fduR">${[0,1,2].map(i=>`<li><span>Ronde ${i+1}</span><b></b></li>`).join('')}</ol><div class="fdu-foot" id="fduF"></div></div>`;
 el.querySelector('#fduA').addEventListener('pointerdown',e=>{e.preventDefault();fduPress()});document.addEventListener('keydown',fduKey);
 FDU.tm.push(setTimeout(fduRound,1300))}
function fduKey(e){if(!FDU)return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)fduPress()}}
function fduSig(t,c,sub){const a=document.getElementById('fduA'),s=document.getElementById('fduSig'),u=document.getElementById('fduSub');if(!a)return;a.className='fdu-arena'+(c?' '+c:'');s.textContent=t;if(u)u.textContent=sub||''}
const FDU_FAKE=['Hij verschuift zijn stoel…','Hij kijkt naar de deur…','Iemand laat een glas vallen…','Hij steekt een sigaar op…'];
function fduRound(){const D=FDU;if(!D)return;D.phase='wait';D.t0=0;fduSig('Wacht…','wait','Nog niet tikken');const delay=1500+Math.random()*2300;
 if(delay>2100&&Math.random()<.5){const dt=Math.min(delay-850,delay*(.3+Math.random()*.3));
  D.tm.push(setTimeout(()=>{if(D.phase!=='wait')return;D.phase='fake';fduSig(FDU_FAKE[Math.floor(Math.random()*FDU_FAKE.length)],'fake','Schijnbeweging? Niet tikken');
   D.tm.push(setTimeout(()=>{if(D.phase==='fake'){D.phase='wait';fduSig('Wacht…','wait','Nog niet tikken')}},600))},dt))}
 D.tm.push(setTimeout(()=>{if(D.phase!=='wait')return;D.phase='go';fduSig('Nu!','go','');D.tGo=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>{if(D.phase==='go')D.t0=performance.now()}));
  D.tm.push(setTimeout(()=>{if(D.phase==='go')fduEnd(false,'Te traag. Hij was je voor.')},1100))},delay))}
function fduPress(){const D=FDU;if(!D)return;
 if(D.phase==='wait'||D.phase==='fake'){fduEnd(false,D.phase==='fake'?'Je trok bij een schijnbeweging.':'Te vroeg. Hij zag je aankomen.');return}
 if(D.phase!=='go')return;const rt=performance.now()-(D.t0||D.tGo),me=Math.max(110,Math.round(rt-fduBonus())),him=Math.max(230,fduBossMs(D.T)+Math.round(Math.random()*70-35));
 fduEnd(me<him,`Jij ${(me/1000).toFixed(2).replace('.',',')} s · ${D.boss} ${(him/1000).toFixed(2).replace('.',',')} s`)}
function fduEnd(ok,msg){const D=FDU;if(!D||D.phase==='res'||D.phase==='end')return;D.tm.forEach(clearTimeout);D.tm=[];D.phase='res';
 const li=document.querySelectorAll('#fduR li')[D.n];if(li){li.className=ok?'ok':'bad';li.querySelector('b').textContent=msg}
 D.n++;ok?D.w++:D.l++;fduSig(ok?'Raak':'Mis',ok?'won':'lost',msg);try{ok?SFX.tick():SFX.shot()}catch(e){}
 D.tm.push(setTimeout(()=>{if(D.w>=2||D.l>=2)fduFinish();else fduRound()},1500))}
function fduFinish(){const D=FDU;if(!D)return;D.phase='end';document.removeEventListener('keydown',fduKey);const f=D.f,T=D.T,won=D.w>=2;let txt='';
 if(won&&S.family===f.id){if(!S.fr||S.fr.id!==S.family)S.fr={id:S.family,eer:0,since:now()};S.fr.lead=2;S.fr.boss=now();S.fr.trib=S.fr.trib||now();const pay=famPromoPay(FAM_TOP+2,T),cr=credGain(15+T*2,'netjes');
  S.cash+=pay;S.cred+=cr;addXp(300+T*120);S.stats.takeovers=(S.stats.takeovers||0)+1;
  txt=`Jij bent nu de Baas van ${f.n}. +${fmt(pay)} · +${cr} cred`;log(`Overname: ${D.boss} is weg, jij bent de Baas van ${f.n} (+${fmt(pay)})`,'ok');toast(`Jij bent de Baas van ${f.n}!`,'lvl');try{SFX.win(5)}catch(e){}}
 else if(!won){const h=rnd(15,25),lose=Math.ceil(famEer()*.04);S.hp=Math.max(5,S.hp-h);if(lose)famAddEer(-lose);
  txt=`${D.boss} blijft de baas. −${h}% gezondheid${lose?' · −'+lose.toLocaleString('nl-NL')+' eer':''}. Opnieuw over ${fwDur(cdLeft('fam_tko'))}.`;log(`Overname mislukt: ${D.boss} blijft de baas van ${f.n} (−${h}% gezondheid)`,'bad');toast('De overname is mislukt','bad');try{SFX.lose()}catch(e){}}
 save();try{pushState()}catch(e){}
 const box=document.querySelector('#fwLayer .fdu-box');if(box)box.classList.add(won?'won':'lost');fduSig(won?'De familie is van jou':'Hij blijft de baas',won?'won':'lost',txt);
 const ft=document.getElementById('fduF');if(ft){ft.innerHTML=`<button class="btn ${won?'':'ghost'}" id="fduClose">Sluiten</button>`;const c=document.getElementById('fduClose');c.addEventListener('click',fduClose);setTimeout(()=>c.focus({preventScroll:true}),50)}}
function fduClose(){FDU&&FDU.tm.forEach(clearTimeout);FDU=null;document.removeEventListener('keydown',fduKey);const el=document.getElementById('fwLayer');if(el)el.remove();window.__chase=false;render()}

Object.assign(act,{
 fwPay(){const x=fwIncome();if(!x)return;S.cash+=x.amt;S.fpay=x.P;toast(`Opbrengst van de periode: +${fmt(x.amt)}`,'lvl');log(`${famBase().n} staat #${x.pos} in de stad: +${fmt(x.amt)}`,'ok');save();render()},
 famTrib(){const a=famTribAvail();if(a<famTribMin())return;S.cash+=a;S.fr.trib=now();toast(`Afdracht van de familie: +${fmt(a)}`,'lvl');log(`Afdracht als ${FAM_RANKS[famRankIdx()][0]}: +${fmt(a)}`,'ok');save();render()}
});
