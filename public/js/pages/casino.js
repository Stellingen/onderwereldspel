// Tab: Casino (blackjack, gokkast, dubbel of niks, roulette)
V.casino=()=>`<p class="sub cas-sub">Echte regels en eerlijke kansen. Het huis heeft een klein voordeel, net als in elk casino.</p>
 ${S.wanted?'<div class="card" style="border-color:var(--acc);margin-bottom:14px;color:var(--acc)">▲ Casino\'s hangen vol camera\'s. Als gezochte crimineel loop je hier extra risico op een controle.</div>':''}
 <div class="cas-bar"><h1 class="cas-h1">Casino</h1><button class="cas-pick" onclick="this.closest('.cas-bar').classList.toggle('open');this.setAttribute('aria-expanded',this.closest('.cas-bar').classList.contains('open'))" aria-expanded="false"><small>Spel</small><b>${CAS_NAMES[casinoTab]||'Casino'}</b><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></button><div class="tabs">${[['kluis','Kluiskraker'],['vis','Visdief'],['mines','Mines'],['avia','Hoogvlieger'],['bj','Blackjack'],['tcp','Three Card Poker','Poker'],['roulette','Roulette'],['coin','Dubbel of niks','Dubbel']].map(([k,n,sh])=>`<button class="${casinoTab===k?'on':''}" onclick="casinoGo('${k}')" aria-pressed="${casinoTab===k}"><span class="t-lg">${n}</span><span class="t-sm">${sh||n}</span></button>`).join('')}</div>${isVip()?vipCbHtml():''}</div>
 ${casinoTab==='kluis'?kkView():casinoTab==='vis'?visView():casinoTab==='bj'?bjTable():casinoTab==='tcp'?tpTable():casinoTab==='roulette'?rouletteView():casinoTab==='mines'?minesView():casinoTab==='avia'?aviaView():coinView()}`;

const CAS_NAMES={kluis:'Kluiskraker',vis:'Visdief',mines:'Mines',avia:'Hoogvlieger',bj:'Blackjack',tcp:'Three Card Poker',roulette:'Roulette',coin:'Dubbel of niks'};
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

function casinoGo(k){if((kk.busy&&!kk.inBonus)||(window.vd&&vd.busy)||(window.cf&&cf.flipping)||(window.av&&av.flying)||(window.rl&&rl.spinning)||['dealing','dealer'].includes(bt.phase)||tp.phase==='dealing'){toast('Wacht tot het spel klaar is','bad');return}casinoTab=k;render()}
