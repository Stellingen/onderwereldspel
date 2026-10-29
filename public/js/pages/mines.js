// Casino: Mines — 5×5 vakjes. Kies hoeveel bommen (moeilijkheid); elk veilig vakje verhoogt de multiplier.
// Multiplier = RTP × de omgekeerde kans dat al je vakjes veilig zijn. Cash out wanneer je wilt.
// De RTP stijgt met de moeilijkheid (+0,15% per bom) en met elk extra veilig vakje (+0,4%), van 95,5% tot max 99,2%.
// Blijft altijd onder 100%, dus geen enkele manier van spelen levert op de lange duur winst op.
// Kies 1 tot 24 bommen (of een van de standen). Met 24 bommen is het eerste vakje al 24,5× waard.
// De mijnen liggen vast zodra je start en staan in je opslag: verversen verandert niets.
const MN_RTP={base:.955,bomb:.0015,click:.004,max:.992},MN_N=25,MN_MAX=10000;
const mnRtp=(m,k)=>Math.min(MN_RTP.max,MN_RTP.base+MN_RTP.bomb*m+MN_RTP.click*Math.max(0,k-1));
const MN_LEVELS=[['Makkelijk',3],['Normaal',5],['Moeilijk',10],['Expert',15],['Extreem',20],['Gekkenhuis',24]];
const MN_BETS=[10,25,50,100,250,500,1000,2500,5000,10000,25000,50000];
const mnBets=()=>isHighRoller()?MN_BETS.concat([100000,250000,500000]):MN_BETS;
window.mn=window.mn||{bi:3,m:5,fx:null};if(!mn.m)mn.m=5;
const mnSetM=m=>{mn.m=Math.max(1,Math.min(24,m));SFX.chip();render()};
const mnBet=()=>{const B=mnBets();if(mn.bi>=B.length)mn.bi=B.length-1;return B[mn.bi]};
function mnMult(m,k){if(!k)return 1;let x=mnRtp(m,k);for(let i=0;i<k;i++)x*=(MN_N-i)/(MN_N-m-i);return Math.min(MN_MAX,Math.floor(x*100)/100)}
const mnX=v=>'×'+v.toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
const MN_GEM='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M14 8h20l9 11-19 23L5 19z" fill="#3fe395"/><path d="M14 8l4 11h12l4-11M5 19h38M18 19l6 23 6-23" fill="none" stroke="#0f5a37" stroke-width="2" stroke-linejoin="round"/><path d="M16 11l3 7" stroke="#d9ffe9" stroke-width="2.4" stroke-linecap="round"/></svg>';
const MN_BOMB='<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="22" cy="28" r="14" fill="#16181d" stroke="#3a3f47" stroke-width="2"/><path d="M31 17l5-5" stroke="#8a8f98" stroke-width="4" stroke-linecap="round"/><path d="M36 12c3-4 6-3 7-6" stroke="#ffad6b" stroke-width="2" fill="none"/><circle cx="43" cy="6" r="2.6" fill="#ffd35a"/><circle cx="16" cy="22" r="3.5" fill="#fff" opacity=".25"/></svg>';
function minesView(){const g=S.mines,play=!!(g&&g.st==='play'),m=g?g.m:mn.m,k=g?g.open.length:0,bet=g&&play?g.bet:mnBet();
 const cur=g?mnMult(g.m,k):1,next=mnMult(m,(play?k:0)+1),safe=play?(MN_N-m-k)/(MN_N-k):(MN_N-m)/MN_N;
 const tiles=Array.from({length:MN_N},(_,i)=>{const open=g&&g.open.includes(i),mine=g&&g.mines.includes(i),over=g&&g.st!=='play';
  if(open)return `<div class="mn-t open ${mn.fx===i?'new':''}">${MN_GEM}</div>`;
  if(over&&mine)return `<div class="mn-t mine ${g.hit===i?'hit':''}">${MN_BOMB}</div>`;
  if(over)return `<div class="mn-t shut">${MN_GEM}</div>`;
  return `<button class="mn-t" onclick="act.mnPick(${i})" ${play?'':'disabled'} aria-label="Vakje ${i+1}"></button>`}).join('');
 const res=g&&g.st!=='play'?(g.st==='cash'?`<div class="mn-res w"><b>${mnX(g.mult)}</b><span>Je pakt ${fmt(g.pay)}</span></div>`:`<div class="mn-res l"><b>Boem!</b><span>${fmt(g.bet)} kwijt${k?' na '+k+' veilige vakjes':''}</span></div>`):'';
 const ladder=Array.from({length:Math.min(6,MN_N-m-(play?k:0))},(_,j)=>{const n=(play?k:0)+j+1;return `<div class="${j===0?'next':''}"><span>${n}</span><b>${mnX(mnMult(m,n))}</b></div>`}).join('');
 return `<div class="mnx">
 <section class="mn-stage card ${g&&g.st==='boom'?'boom':''} ${g&&g.st==='cash'?'won':''}"><div class="mn-grid">${tiles}</div>${res}</section>
 <section class="mn-panel card">
  ${play?`<div class="mn-cur"><span class="label">Multiplier</span><b>${mnX(cur)}</b><small>${k} veilig · ${m} bommen · inzet ${fmt(g.bet)}</small></div>
   <button class="btn mn-cash" onclick="act.mnCash()" ${k?'':'disabled'}>${k?'Cash out · '+fmt(Math.floor(g.bet*cur)):'Kies eerst een vakje'}</button>
   <div class="mn-next"><span>Volgend vakje</span><b>${mnX(next)}</b><span>kans veilig ${Math.round(safe*100)}%</span></div>
   <button class="btn ghost" onclick="act.mnRandom()">Willekeurig vakje</button>`
  :`<div class="label">Inzet</div>
   <div class="kk-bet"><button onclick="mn.bi=Math.max(0,mn.bi-1);SFX.chip();render()" aria-label="Lagere inzet">−</button><b>${fmt(bet)}</b><button onclick="mn.bi=Math.min(mnBets().length-1,mn.bi+1);SFX.chip();render()" aria-label="Hogere inzet">+</button></div>
   <div class="cf-quick">${mnBets().map((v,i)=>`<button class="${mn.bi===i?'on':''}" onclick="mn.bi=${i};SFX.chip();render()">${v>=1000?v/1000+'K':v}</button>`).join('')}</div>
   <div class="mn-bh"><span class="label">Moeilijkheid</span><div class="kk-bet mn-bc"><button onclick="mnSetM(mn.m-1)" aria-label="Minder bommen">−</button><b>${mn.m} ${mn.m===1?'bom':'bommen'}</b><button onclick="mnSetM(mn.m+1)" aria-label="Meer bommen">+</button></div></div>
   <div class="mn-lv">${MN_LEVELS.map(([n,b])=>`<button class="${mn.m===b?'on':''}" onclick="mnSetM(${b})"><b>${n}</b><small>${b} bommen · 1e vakje ${mnX(mnMult(b,1))}</small></button>`).join('')}</div>
   <button class="btn gold xl mn-go" onclick="act.mnStart()" ${inJail()||S.cash<bet?'disabled':''}>${S.cash<bet?'Te weinig geld':(g?'Opnieuw':'Start')+' · '+fmt(bet)}</button>`}
  <div class="label" style="margin-top:6px">Multipliers</div><div class="mn-ladder">${ladder}</div>
  <p class="cf-fine">Hoe meer bommen en hoe meer vakjes je opent, hoe beter de uitbetaling: RTP van 95,5% tot 99,2% (nu ${(mnRtp(m,(play?k:0)+1)*100).toFixed(1).replace('.',',')}% voor het volgende vakje). Kies 1 tot 24 bommen. Hoe meer bommen, hoe sneller hij stijgt. Max ${MN_MAX.toLocaleString('nl-NL')}× je inzet. De bommen liggen vast zodra je start.</p>
 </section></div>`}
function mnRand(n){return crypto.getRandomValues(new Uint32Array(1))[0]%n}
Object.assign(act,{
 mnStart(){if(inJail())return;const g=S.mines;if(g&&g.st==='play')return;const bet=mnBet(),m=mn.m;if(S.cash<bet){toast('Niet genoeg contant geld','bad');return}
  const pool=[...Array(MN_N).keys()];for(let i=pool.length-1;i>0;i--){const j=mnRand(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
  S.cash-=bet;S.mines={bet,m,mines:pool.slice(0,m),open:[],st:'play',hit:null,mult:1,pay:0};mn.fx=null;SFX.spin();save();render()},
 mnPick(i){const g=S.mines;if(!g||g.st!=='play'||g.open.includes(i))return;
  if(g.mines.includes(i)){g.st='boom';g.hit=i;S.stats.lost+=g.bet;casinoRound(g.bet,0,'mines');SFX.lose();log('Mines: '+fmt(g.bet)+' verloren ('+g.m+' bommen, '+g.open.length+' veilig)','bad');save();render();return}
  g.open.push(i);g.mult=mnMult(g.m,g.open.length);mn.fx=i;SFX.win(Math.min(6,g.open.length));
  if(g.open.length>=MN_N-g.m){act.mnCash();return}save();render()},
 mnRandom(){const g=S.mines;if(!g||g.st!=='play')return;const free=[...Array(MN_N).keys()].filter(i=>!g.open.includes(i));act.mnPick(free[mnRand(free.length)])},
 mnCash(){const g=S.mines;if(!g||g.st!=='play'||!g.open.length)return;const mult=mnMult(g.m,g.open.length),pay=Math.floor(g.bet*mult);
  S.cash+=pay;g.st='cash';g.mult=mult;g.pay=pay;const net=pay-g.bet;if(net>0)S.stats.won+=net;else S.stats.lost+=-net;casinoRound(g.bet,pay,'mines');
  (mult>=10?SFX.big():SFX.win(4));toast('Mines: '+mnX(mult)+' · je pakt '+fmt(pay),mult>=10?'lvl':'ok');log('Mines: '+mnX(mult)+', '+fmt(pay)+' (inzet '+fmt(g.bet)+')','ok');save();render()}});
