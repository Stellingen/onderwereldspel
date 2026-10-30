// Casino: Dubbel of niks — een echte munt die opgegooid wordt. Precies 50% kans (crypto-random), geen huisvoordeel.
// Win je, dan kies je: je pot pakken of nog een keer gooien voor het dubbele. Maximaal 10 keer achter elkaar.
// De lopende pot (S.coin) staat in je opslag: verversen of weggaan verandert niets aan de uitkomst.
const CF_BETS=[10,25,50,100,250,500,1000,2500,5000,10000,25000,50000],CF_MAX=10;
window.cf=window.cf||{bi:3,side:'kop',flipping:false,rot:0,hist:[],msg:null};
const cfBet=()=>CF_BETS[cf.bi];
function cfFaceSvg(id){if(id==='kop')return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#7a5506" stroke-width="1.5" stroke-dasharray="2 3"/>
  <path d="M30 58 L26 36 L38 46 L50 30 L62 46 L74 36 L70 58 Z" fill="#7a5506"/><rect x="29" y="60" width="42" height="7" rx="2" fill="#7a5506"/><circle cx="50" cy="30" r="3.2" fill="#7a5506"/><circle cx="26" cy="35" r="2.6" fill="#7a5506"/><circle cx="74" cy="35" r="2.6" fill="#7a5506"/>
  <text x="50" y="82" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="13" letter-spacing="2" fill="#7a5506">KOP</text></svg>`;
 return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#7a5506" stroke-width="1.5" stroke-dasharray="2 3"/>
  ${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<circle cx="${50+Math.cos(a)*33}" cy="${50+Math.sin(a)*33}" r="1.8" fill="#7a5506"/>`}).join('')}
  <text x="50" y="62" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="38" fill="#7a5506">×2</text>
  <text x="50" y="80" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="12" letter-spacing="2" fill="#7a5506">MUNT</text></svg>`}
function cfCoinHtml(){return `<div class="cf-coin" id="cfCoin" style="transform:rotateX(${cf.rot}deg)">
  ${Array.from({length:9},(_,i)=>`<i class="cf-rim" style="transform:translateZ(${i-4}px)"></i>`).join('')}
  <div class="cf-face kop">${cfFaceSvg('kop')}</div><div class="cf-face munt">${cfFaceSvg('munt')}</div></div>`}
// Tijdens het gooien tonen we de stand van vóór de worp (cf.show): pot, knoppen en statistiek verraden de uitkomst dus niet.
function coinView(){const flip=cf.flipping,sh=flip&&cf.show,c=sh?sh.coin:S.coin,st=(sh?sh.st:S.cfStats)||{k:0,m:0,best:0,flips:0},bet=cfBet();
 const m=cf.msg,stake=c?c.stake:bet,step=c?c.step:0;
 const msg=flip?'<b>De munt draait…</b>':m?(m.win?`<b class="w">${m.res==='kop'?'Kop':'Munt'}! Gewonnen</b><span>Je pot is nu ${fmt(m.pot)}</span>`:`<b class="l">${m.res==='kop'?'Kop':'Munt'}. Verloren</b><span>${fmt(m.stake)} kwijt</span>`)
  :c?`<b>Pot staat klaar</b><span>Pak je geld of gooi nog een keer</span>`:'<b>Kies kop of munt</b><span>Win je, dan verdubbel je je inzet</span>';
 const sideBtns=`<div class="cf-sides">${['kop','munt'].map(k=>`<button class="cf-pick ${cf.side===k?'on':''}" onclick="cf.side='${k}';SFX.chip();render()" ${flip?'disabled':''}><span class="cf-mini">${cfFaceSvg(k)}</span><b>${k==='kop'?'Kop':'Munt'}</b></button>`).join('')}</div>`;
 const ladder=`<div class="cf-ladder">${Array.from({length:CF_MAX},(_,i)=>{const n=i+1,reached=step>=n,next=step+1===n;return `<div class="${reached?'on':''} ${next&&c?'next':''}"><span>×${2**n}</span><b>${fmt(stake*2**n)}</b></div>`}).join('')}</div>`;
 const tot=st.k+st.m;
 return `<div class="cfx">
 <section class="cf-stage card ${m&&!flip?(m.win?'win':'lose'):''}">
  <div class="cf-coinwrap"><div class="cf-toss" id="cfToss">${cfCoinHtml()}</div><div class="cf-shadow" id="cfShadow"></div></div>
  <div class="cf-msg" id="cfMsg">${msg}</div>
  <div class="cf-hist">${cf.hist.length?cf.hist.map(r=>`<i class="${r}">${r==='kop'?'K':'M'}</i>`).join(''):'<span class="label">Nog niet gegooid</span>'}</div>
 </section>
 <section class="cf-panel card">
  ${c?`<div class="cf-pot"><span class="label">Jouw pot</span><b>${fmt(c.pot)}</b><small>Inzet ${fmt(c.stake)} · ${c.step}× op rij gewonnen</small></div>
   ${ladder}
   <div class="label" style="margin:12px 0 6px">Volgende worp: kies je kant</div>${sideBtns}
   <button class="btn gold xl cf-go" onclick="act.cfFlip()" ${flip||c.step>=CF_MAX?'disabled':''}>${c.step>=CF_MAX?'Maximaal bereikt':'Dubbel of niks · gooi voor '+fmt(c.pot*2)}</button>
   <button class="btn cf-cash" onclick="act.cfCash()" ${flip?'disabled':''}>Pak je geld · ${fmt(c.pot)}</button>`
  :`<div class="label">Inzet</div>
   <div class="kk-bet"><button onclick="cf.bi=Math.max(0,cf.bi-1);cf.msg=null;SFX.chip();render()" ${flip?'disabled':''} aria-label="Lagere inzet">−</button><b>${fmt(bet)}</b><button onclick="cf.bi=Math.min(CF_BETS.length-1,cf.bi+1);cf.msg=null;SFX.chip();render()" ${flip?'disabled':''} aria-label="Hogere inzet">+</button></div>
   <div class="cf-quick">${CF_BETS.map((v,i)=>`<button class="${cf.bi===i?'on':''}" onclick="cf.bi=${i};SFX.chip();render()" ${flip?'disabled':''}>${v>=1000?v/1000+'K':v}</button>`).join('')}</div>
   <div class="label" style="margin:14px 0 6px">Jouw kant</div>${sideBtns}
   <button class="btn gold xl cf-go" onclick="act.cfFlip()" ${flip||inJail()||casCash()<bet?'disabled':''}>${casCash()<bet?'Te weinig geld':'Gooien · '+fmt(bet)}</button>
   ${ladder}`}
  <div class="cf-stats"><div><span>Kop</span><b>${tot?Math.round(st.k/tot*100):0}%</b></div><div><span>Munt</span><b>${tot?Math.round(st.m/tot*100):0}%</b></div><div><span>Worpen</span><b>${tot}</b></div><div><span>Langste reeks</span><b>${st.best}×</b></div></div>
  <p class="cf-fine">Eerlijk: elke worp is precies 50% kop en 50% munt, los van de vorige. Geen huisvoordeel. Je kunt maximaal ${CF_MAX} keer achter elkaar verdubbelen (×${2**CF_MAX}).</p>
 </section></div>`}
const cfReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
Object.assign(act,{
 async cfFlip(){if(cf.flipping||inJail())return;let c=S.coin;const side=cf.side;
  if(!c){const bet=cfBet();if(casCash()<bet){toast(casShort(),'bad');return}}else if(c.step>=CF_MAX)return;
  cf.show={coin:c?{...c}:null,st:{...(S.cfStats||{k:0,m:0,best:0})}};
  if(!c){const bet=cfBet();S.cash-=bet;c={stake:bet,pot:bet,step:0}}
  // uitkomst: precies 50/50 en meteen vastgelegd
  const res=(crypto.getRandomValues(new Uint8Array(1))[0]&1)?'kop':'munt',win=res===side;
  S.cfStats=S.cfStats||{k:0,m:0,best:0};S.cfStats[res==='kop'?'k':'m']++;
  if(win){S.coin={stake:c.stake,pot:c.pot*2,step:c.step+1};S.cfStats.best=Math.max(S.cfStats.best,S.coin.step)}
  let lg=null;
  if(!win){S.coin=null;S.stats.lost+=c.stake;lg=log('Dubbel of niks: '+fmt(c.stake)+' verloren'+(c.step?' na '+c.step+'× winst':''),'bad',4000)}
  save();
  cf.flipping=true;cf.msg=null;render();SFX.click();
  const el=document.getElementById('cfCoin'),toss=document.getElementById('cfToss'),sh=document.getElementById('cfShadow'),dur=cfReduce()?350:1700;
  let target=Math.ceil((cf.rot+1800)/360)*360+(res==='munt'?180:0);if(target-cf.rot<1440)target+=360;cf.rot=target;
  if(el){void el.offsetWidth;el.style.transition=`transform ${dur}ms cubic-bezier(.22,.62,.28,1)`;el.style.transform=`rotateX(${target}deg)`}
  if(toss){toss.style.animationDuration=dur+'ms';toss.classList.add('go')}if(sh){sh.style.animationDuration=dur+'ms';sh.classList.add('go')}
  await new Promise(r=>setTimeout(r,dur+60));
  cf.flipping=false;cf.show=null;if(lg)delete lg.r;if(!win)casinoRound(c.stake,0,'coin');cf.hist.unshift(res);cf.hist=cf.hist.slice(0,24);
  cf.msg={win,res,pot:win?S.coin.pot:0,stake:c.stake};
  if(win){SFX.win(Math.min(5,S.coin.step));if(S.coin.step>=CF_MAX){toast('Maximaal verdubbeld! Je pot wordt uitbetaald','lvl');act.cfCash();return}}else SFX.lose();
  if(page==='casino'&&casinoTab==='coin')render();else renderTop()},
 cfCash(){const c=S.coin;if(!c||cf.flipping)return;S.cash+=c.pot;const net=c.pot-c.stake;S.stats.won+=net;casinoRound(c.stake,c.pot,'coin');
  log('Dubbel of niks: '+fmt(c.pot)+' gepakt ('+c.step+'× gewonnen, inzet '+fmt(c.stake)+')','ok');toast('Je pakt '+fmt(c.pot)+' (+'+fmt(net)+')',c.step>=5?'lvl':'ok');
  if(c.step>=5)SFX.big();else SFX.chip();S.coin=null;cf.msg=null;save();render()}});
