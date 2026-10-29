// Tab: Casino (blackjack, gokkast, dubbel of niks, roulette)
V.casino=()=>`<h1>Casino</h1><p class="sub">Echte regels en eerlijke kansen. Het huis heeft een klein voordeel, net als in elk casino.</p>
 ${S.wanted?'<div class="card" style="border-color:var(--acc);margin-bottom:14px;color:var(--acc)">▲ Casino\'s hangen vol camera\'s. Als gezochte crimineel loop je hier extra risico op een controle.</div>':''}
 ${isVip()?vipCbHtml():''}
 <div class="tabs">${[['kluis','Kluiskraker'],['bj','Blackjack'],['tcp','Three Card Poker'],['roulette','Roulette'],['coin','Dubbel of niks']].map(([k,n])=>`<button class="${casinoTab===k?'on':''}" onclick="casinoGo('${k}')">${n}</button>`).join('')}</div>
 ${casinoTab==='kluis'?kkView():casinoTab==='bj'?bjTable():casinoTab==='tcp'?tpTable():casinoTab==='roulette'?rouletteView():`<div class="card" style="max-width:560px">
  <div class="label">Inzet</div><input id="bet" class="input" type="number" min="10" value="${window._bet||100}" oninput="window._bet=+this.value" style="margin-top:6px">
  <div class="flex" style="margin:8px 0 16px">${[100,1000,10000].map(v=>`<button class="btn ghost sm" onclick="window._bet=${v};render()">${fmt(v)}</button>`).join('')}<button class="btn ghost sm" onclick="window._bet=Math.floor(S.cash);render()">Alles</button></div>
  ${casinoTab==='bj'?bjView():''}
  ${casinoTab==='coin'?`<p style="color:var(--mute)">50/50. Win en je verdubbelt je inzet. Geen huisvoordeel.</p><div class="flex"><button class="btn" onclick="act.coin('kop')">Kop</button><button class="btn" onclick="act.coin('munt')">Munt</button></div>`:''}
 </div>`}`;

const fmtHM=ms=>{const m=Math.ceil(ms/60000);return m>=60?Math.floor(m/60)+'u '+String(m%60).padStart(2,'0')+'m':m+' min'};
function vipCbHtml(){const a=cbAvail(),l=cbLeft(),net=S.cb?Math.max(0,S.cb.net):0;
 return `<div class="vipcb"><i class="vipt" style="margin:0">VIP</i><div class="vc-t"><b>Cashback ${Math.round(CB_PCT*100)}% van je netto verlies</b>
  <span>Alle casinospellen tellen mee${net?' · netto verlies sinds je laatste claim '+fmt(net):''}. Elke 6 uur te claimen, maximaal ${fmt(CB_MAX)} per keer. In Kluiskraker kom je ook iets vaker in de bonus.</span></div>
  <div class="vc-a">${fmt(a)}</div><button class="btn gold" onclick="act.claimCb()" ${!a||l?'disabled':''}>${l?'Weer over '+fmtHM(l):a?'Claimen':'Nog niks te claimen'}</button></div>`}
function cardHtml(c){if(c.hidden)return '<div class="pc back"></div>';const red=c.s==='♥'||c.s==='♦';return `<div class="pc ${red?'red':''}"><span>${c.v}</span><span>${c.s}</span></div>`}
function handVal(h){let t=0,a=0;h.forEach(c=>{if(c.hidden)return;if(c.v==='A'){a++;t+=11}else t+=['K','Q','J'].includes(c.v)?10:+c.v});while(t>21&&a){t-=10;a--}return t}
function bjView(){const b=window.bj;
 if(!b)return `<p style="color:var(--mute)">Kom zo dicht mogelijk bij 21 zonder eroverheen te gaan. Blackjack betaalt 3:2, de dealer pakt tot 17.</p><button class="btn gold" onclick="act.bjDeal()">Delen</button>`;
 return `<div class="label">Dealer · ${handVal(b.d)}${b.d.some(c=>c.hidden)?' + ?':''}</div><div class="cards">${b.d.map(cardHtml).join('')}</div>
  <div class="label">Jij · ${handVal(b.p)} · inzet ${fmt(b.bet)}</div><div class="cards">${b.p.map(cardHtml).join('')}</div>
  ${b.done?`<div class="big" style="font-size:20px;text-align:center;margin:8px 0 12px;color:${b.res>0?'var(--green)':b.res<0?'var(--red)':'var(--fg)'}">${b.msg}</div><button class="btn gold" onclick="act.bjDeal()">Nieuwe hand</button>`
  :`<div class="flex"><button class="btn" onclick="act.bjHit()">Kaart</button><button class="btn gold" onclick="act.bjStand()">Passen</button><button class="btn" onclick="act.bjDouble()" ${b.p.length>2||S.cash<b.bet?'disabled':''}>Verdubbelen</button></div>`}`}

function casinoGo(k){if((kk.busy&&!kk.inBonus)||['dealing','dealer'].includes(bt.phase)||tp.phase==='dealing'){toast('Wacht tot het spel klaar is','bad');return}casinoTab=k;render()}
