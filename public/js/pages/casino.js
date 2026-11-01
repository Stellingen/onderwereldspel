// Tab: Casino (blackjack, gokkast, dubbel of niks, roulette)
// Klein onderaan elk casinoscherm: 18+ en dat het om spelgeld gaat (geen echt geld, niets uit te betalen)
const casNote=()=>`<p class="cas-note"><b>18+</b> Spel met virtueel spelgeld. Je kunt geen echt geld inzetten, winnen of laten uitbetalen.</p>`;
// Toegang per rang: het casino vanaf Loopjongen (eerst het spel leren), de slots (het verslavendst) pas vanaf Dief.
// Een bonus die nog loopt mag je altijd afmaken.
const CAS_MIN_R=2,CAS_SLOT_R=3,CAS_SLOTS=['kluis','vis','zoet'];
const casNeedR=k=>CAS_SLOTS.includes(k)?CAS_SLOT_R:CAS_MIN_R;
const casLocked=k=>!(S.slotRun&&S.slotRun.g===k)&&rankIdx(S.xp)<(k?casNeedR(k):CAS_MIN_R);
V.casino=()=>{if(casinoTab&&casLocked(casinoTab))casinoTab='';
 return (czBanLeft()&&!casSwitchBusy()?casBanView():casLocked('')&&!S.slotRun?casLockView():casinoTab&&CAS_NAMES[casinoTab]?casGameView():casLobby())+casNote()};
// Nog te laag in rang: wat je nodig hebt en wat er dan opengaat
function casLockView(){const r=CAS_MIN_R,xp=S.xp||0,need=RANKS[r][1],from=RANKS[rankIdx(xp)][1],pct=Math.max(0,Math.min(100,(xp-from)/Math.max(1,need-from)*100));
 const games=r2=>CAS_LIST.filter(([k])=>casNeedR(k)===r2).map(([,n])=>`<em>${n}</em>`).join('');
 return `<section class="cas-lock"><div class="cas-lock-in">${czEyesSvg(1)}<span class="label">Casino</span><h1>Nog niet binnen</h1>
  <p>De portier kent je nog niet. Bewijs jezelf eerst op straat: vanaf <b>${RANKS[r][0]}</b> mag je naar binnen.</p>
  <div class="cas-lock-xp"><div><span>${RANKS[rankIdx(xp)][0]}</span><span>${RANKS[r][0]} · ${need.toLocaleString('nl-NL')} XP</span></div><i><b style="width:${pct.toFixed(1)}%"></b></i><small>Nog ${Math.max(0,need-xp).toLocaleString('nl-NL')} XP</small></div>
  <div class="cas-lock-g"><div><span class="label">Vanaf ${RANKS[CAS_MIN_R][0]}</span><p>${games(CAS_MIN_R)}</p></div><div><span class="label">Vanaf ${RANKS[CAS_SLOT_R][0]}</span><p>${games(CAS_SLOT_R)}</p></div></div>
  <div class="cas-ban-b"><a class="btn" href="#crimes">Naar de misdaden</a><a class="btn ghost" href="#dash">Naar je dashboard</a></div></div></section>`}
// Verbannen: de hele pagina rood, met hoe lang nog. Daarna staat de verdenking weer op 0%.
function casBanView(){const L=czBanLeft(),t=typeof tier==='function'?tier():0,lang=S.czBanWhy==='tijd';
 return `<section class="cas-ban"><div class="cas-ban-in">${czEyesSvg(2)}<span class="label">Casino</span><h1>U bent verbannen</h1><p>${lang?'U zit hier al uren achter elkaar. De beveiliging zet u een speldag buiten de deur.':'De beveiliging heeft u te vaak gezien. U bent hier voorlopig niet meer welkom.'}</p>
  <div class="cas-ban-t"><span>Nog</span><b id="casBanT">${fmtClock(L)}</b></div>
  <small>${lang?'Wie twee uur aan één stuk in het casino zit zonder iets anders te doen, valt op: 4 uur (een speldag) niet welkom. Doe tussendoor klussen of missies, dan zakt het weer.':['Gewone spelers 30 minuten','VIP 20 minuten','High roller 10 minuten'][t]+'. Daarna mag je terug en staat je verdenking weer op 0%. Met wit geld loopt de verdenking niet op, dat kun je verantwoorden.'}</small>
  <div class="cas-ban-b">${lang?'<a class="btn ghost" href="#crimes">Naar de misdaden</a>':'<a class="btn ghost" href="#wit">Naar witwassen</a>'}<a class="btn ghost" href="#dash">Naar je dashboard</a></div></div></section>`}
const CAS_LIST=[['kluis','Kluiskraker'],['vis','Visdief'],['zoet','Suikerbaron'],['mines','Mines'],['avia','Hoogvlieger'],['bj','Blackjack'],['tcp','Three Card Poker','Poker'],['th',"Texas Hold'em","Hold'em"],['roulette','Roulette'],['coin','Dubbel of niks','Dubbel']];
const CAS_NAMES=Object.fromEntries(CAS_LIST.map(([k,n])=>[k,n]));
const CAS_ICO_BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
function casGameView(){
 return `<p class="sub cas-sub">Echte regels en eerlijke kansen. Het huis heeft een klein voordeel, net als in elk casino.</p>
 ${S.wanted?'<div class="card" style="border-color:var(--acc);margin-bottom:14px;color:var(--acc)">▲ Casino\'s hangen vol camera\'s. Als gezochte crimineel loop je hier extra risico op een controle.</div>':''}
 <div class="cas-bar"><button class="cas-back" onclick="casinoGo('')" aria-label="Terug naar alle spellen" title="Alle spellen">${CAS_ICO_BACK}<span>Alle spellen</span></button><button class="cas-pick" onclick="this.closest('.cas-bar').classList.toggle('open');this.setAttribute('aria-expanded',this.closest('.cas-bar').classList.contains('open'))" aria-expanded="false"><small>Spel</small><b>${CAS_NAMES[casinoTab]||'Casino'}</b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="tabs">${CAS_LIST.map(([k,n,sh])=>`<button class="${casinoTab===k?'on':''} ${casLocked(k)?'lk':''}" onclick="casinoGo('${k}')" aria-pressed="${casinoTab===k}" ${casLocked(k)?`title="Vanaf ${RANKS[casNeedR(k)][0]}"`:''}><span class="t-lg">${n}</span><span class="t-sm">${sh||n}</span></button>`).join('')}</div></div>
 ${casinoTab==='kluis'?kkView():casinoTab==='vis'?visView():casinoTab==='zoet'?zoetView():casinoTab==='bj'?bjTable():casinoTab==='tcp'?tpTable():casinoTab==='th'?thTable():casinoTab==='roulette'?rouletteView():casinoTab==='mines'?minesView():casinoTab==='avia'?aviaView():coinView()}`}
// Lobby: elk spel als banner met de illustratie erachter. Slots groot, daarna snelle spellen en de tafels.
const CAS_GROUPS=[['Slots','Eigen gokkasten met bonusrondes',['kluis','vis','zoet']],['Snel spel','Eén klik, meteen uitslag of zelf stoppen',['mines','avia','coin']],['Aan tafel','Kaarten en het wiel, tegen de dealer',['bj','th','tcp','roulette']]];
function casLobby(){const G=window.COV?COV.GAMES:[],by=id=>G.find(g=>g.id===id),run=S.slotRun;
 const card=(g,big)=>{const lk=casLocked(g.id);return `<button class="cl-card${big?' big':''}${lk?' locked':''}" style="--c:${g.col}" onclick="casinoGo('${g.id}')" aria-label="${g.n} ${lk?'(vanaf '+RANKS[casNeedR(g.id)][0]+')':'spelen'}">${lk?`<span class="cl-lock">Vanaf ${RANKS[casNeedR(g.id)][0]}</span>`:''}
   <span class="cl-art" aria-hidden="true">${COV.coverSvg(g.id,'lb'+g.id)}</span>
   <span class="cl-txt"><span class="cl-k">${g.kind}</span><b class="cl-n">${g.n}</b><span class="cl-s">${g.short}</span>
    <span class="cl-f"><span class="cl-tags">${g.tags.map(t=>`<em>${t}</em>`).join('')}</span><span class="cl-go">${lk?'Op slot':'Spelen'+CAS_ICO_BACK.replace('M15 6l-6 6 6 6','M9 6l6 6-6 6')}</span></span></span></button>`};
 return `<div class="cl">
  <div class="cl-head"><div><h1>Casino</h1><p>${G.length} spellen. Echte regels en doorgerekende kansen; het huis heeft een klein voordeel, net als in elk casino.</p></div></div>
  ${S.wanted?'<div class="card cl-warn">▲ Casino\'s hangen vol camera\'s. Als gezochte crimineel loop je hier extra risico op een controle.</div>':''}
  ${run&&CAS_NAMES[run.g]?`<button class="cl-run" onclick="casinoGo('${run.g}')"><b>Je bonus in ${CAS_NAMES[run.g]} loopt nog</b><span>Het geld staat al op je saldo. Tik om hem verder af te spelen.</span></button>`:''}
  ${CAS_GROUPS.map(([t,sub,ids],gi)=>`<section class="cl-sec"><div class="cl-sh"><h2>${t}</h2><span>${sub}</span></div>
   <div class="cl-grid g${ids.length}">${ids.map(id=>by(id)).filter(Boolean).map(g=>card(g,gi===0)).join('')}</div></section>`).join('')}
 </div>`}

// VIP-cashback: klein rechtsboven, direct te claimen. De percentages per spel staan in de tooltip.
function vipCbHtml(){const a=cbAvail(),m=TIER_CB[tier()]||1,tip=Object.keys(CB_RATE).map(k=>CB_NAME[k]+' '+(CB_RATE[k]*m*100).toLocaleString('nl-NL',{maximumFractionDigits:3})+'%').join(' · ');
 return `<div class="cbmini" title="Cashback op elke inzet${m>1?' (High roller ×1,5)':''}: ${tip}">${vipTag().replace('class="vipt','style="margin:0" class="vipt')}<span>Cashback</span><b id="cbAmt">${fmt(a)}</b>
  <button class="btn gold sm" id="cbBtn" onclick="act.claimCb()" ${a<1?'disabled':''}>${a>=1?'Claimen':'Nog niks te claimen'}</button></div>`}
function cardHtml(c){if(c.hidden)return '<div class="pc back"></div>';const red=c.s==='♥'||c.s==='♦';return `<div class="pc ${red?'red':''}"><span>${c.v}</span><span>${c.s}</span></div>`}
function handVal(h){let t=0,a=0;h.forEach(c=>{if(c.hidden)return;if(c.v==='A'){a++;t+=11}else t+=['K','Q','J'].includes(c.v)?10:+c.v});while(t>21&&a){t-=10;a--}return t}
function bjView(){const b=window.bj;
 if(!b)return `<p style="color:var(--mute)">Kom zo dicht mogelijk bij 21 zonder eroverheen te gaan. Blackjack betaalt 3:2, de dealer pakt tot 17.</p><button class="btn gold" onclick="act.bjDeal()">Delen</button>`;
 return `<div class="label">Dealer · ${handVal(b.d)}${b.d.some(c=>c.hidden)?' + ?':''}</div><div class="cards">${b.d.map(cardHtml).join('')}</div>
  <div class="label">Jij · ${handVal(b.p)} · inzet ${fmt(b.bet)}</div><div class="cards">${b.p.map(cardHtml).join('')}</div>
  ${b.done?`<div class="big" style="font-size:20px;text-align:center;margin:8px 0 12px;color:${b.res>0?'var(--green)':b.res<0?'var(--red)':'var(--fg)'}">${b.msg}</div><button class="btn gold" onclick="act.bjDeal()">Nieuwe hand</button>`
  :`<div class="flex"><button class="btn" onclick="act.bjHit()">Kaart</button><button class="btn gold" onclick="act.bjStand()">Passen</button><button class="btn" onclick="act.bjDouble()" ${b.p.length>2||S.cash<b.bet?'disabled':''}>Verdubbelen</button></div>`}`}

// Is er een spel bezig? Dan niet wisselen (een slotbonus mag wel op de achtergrond doorlopen).
const casSwitchBusy=()=>(kk.busy&&!kk.inBonus)||(window.vd&&vd.busy)||(window.zb&&zb.busy)||(window.cf&&cf.flipping)||(window.av&&av.flying)||(window.rl&&rl.spinning)||['dealing','dealer'].includes(bt.phase)||tp.phase==='dealing'||tp.phase==='reveal'||(window.th&&['dealing','reveal'].includes(th.phase));
function casinoGo(k){if(czBanLeft()){render();return}if(k&&casLocked(k)){toast(CAS_NAMES[k]+' speel je vanaf '+RANKS[casNeedR(k)][0]+' ('+RANKS[casNeedR(k)][1].toLocaleString('nl-NL')+' XP)','bad');return}if(casSwitchBusy()){toast('Wacht tot het spel klaar is','bad');return}casinoTab=k;render();window.scrollTo(0,0)}
