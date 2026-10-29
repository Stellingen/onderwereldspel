// Tab: Casino (blackjack, gokkast, dubbel of niks, roulette)
V.casino=()=>`<h1>Casino</h1><p class="sub">Vier spellen, eerlijke kansen. Roulette heeft 37 vakken die allemaal even vaak vallen, en de Kluiskraker betaalt op lange termijn 94,6% van je inzet terug.</p>
 ${S.wanted?'<div class="card" style="border-color:var(--acc);margin-bottom:14px;color:var(--acc)">▲ Casino\'s hangen vol camera\'s. Als gezochte crimineel loop je hier extra risico op een controle.</div>':''}
 <div class="tabs">${[['kluis','Kluiskraker'],['bj','Blackjack'],['roulette','Roulette'],['coin','Dubbel of niks']].map(([k,n])=>`<button class="${casinoTab===k?'on':''}" onclick="${'if(kk.busy){toast(\'Wacht tot de spin klaar is\',\'bad\')}else{casinoTab=\''+k+'\';render()}'}">${n}</button>`).join('')}</div>
 ${casinoTab==='kluis'?kkView():casinoTab==='roulette'?rouletteView():`<div class="card" style="max-width:560px">
  <div class="label">Inzet</div><input id="bet" class="input" type="number" min="10" value="${window._bet||100}" oninput="window._bet=+this.value" style="margin-top:6px">
  <div class="flex" style="margin:8px 0 16px">${[100,1000,10000].map(v=>`<button class="btn ghost sm" onclick="window._bet=${v};render()">${fmt(v)}</button>`).join('')}<button class="btn ghost sm" onclick="window._bet=Math.floor(S.cash);render()">Alles</button></div>
  ${casinoTab==='bj'?bjView():''}
  ${casinoTab==='coin'?`<p style="color:var(--mute)">50/50. Win en je verdubbelt je inzet. Geen huisvoordeel.</p><div class="flex"><button class="btn" onclick="act.coin('kop')">Kop</button><button class="btn" onclick="act.coin('munt')">Munt</button></div>`:''}
 </div>`}`;

function rouletteView(){const r=rl;const tot=Object.values(r.bets).reduce((a,b)=>a+b,0);
 const short=v=>v>=1000?(v/1000)+'K':v;const chipOn=k=>r.bets[k]?`<i class="chipmark">${short(r.bets[k])}</i>`:'';
 const cell=(k,label,cls='')=>`<button class="cell ${cls} ${r.res!=null&&!r.spinning&&k==='n'+r.res?'hit':''}" onclick="act.rlBet('${k}')" ${r.spinning?'disabled':''}>${label}${chipOn(k)}</button>`;
 const nums=[];for(let row=0;row<3;row++)for(let col=0;col<12;col++){const n=col*3+(3-row);nums.push(cell('n'+n,n,numCol(n)))}
 const resTxt=r.spinning?'Rien ne va plus…':r.res==null?'Plaats je fiches en draai':`${r.res} · ${({red:'Rood',black:'Zwart',green:'Groen'})[numCol(r.res)]}`;
 return `<div class="rlwrap">
 <div class="card wheelcard"><div class="wheelbox"><canvas id="wheel" width="560" height="560" aria-label="Roulettewiel"></canvas><div class="pointer"></div></div>
  <div class="rlres ${r.res!=null&&!r.spinning?numCol(r.res):''}">${resTxt}</div>
  ${r.res!=null&&!r.spinning?`<div style="font-family:var(--f-mono);color:${r.net>0?'var(--green)':r.net<0?'var(--red)':'var(--mute)'}">${r.net>0?'+':r.net<0?'-':''}${fmt(Math.abs(r.net))}</div>`:''}
  <div class="hist">${r.hist.map(n=>`<span class="hn ${numCol(n)}">${n}</span>`).join('')||'<span class="label">Nog geen worpen</span>'}</div></div>
 <div class="card"><div class="label">Kies je fiche en tik op het bord</div>
  <div class="chiprow">${[10,100,1000,10000,50000].map(v=>`<button class="pchip ${r.chip===v?'on':''}" onclick="rl.chip=${v};render()">${short(v)}</button>`).join('')}</div>
  <div class="boardscroll"><div class="board">${cell('n0','0','green zero')}${nums.join('')}</div>
  <div class="outside">${cell('d1','1e 12')}${cell('d2','2e 12')}${cell('d3','3e 12')}</div>
  <div class="outside six">${cell('low','1–18')}${cell('even','Even')}${cell('red','Rood','red')}${cell('black','Zwart','black')}${cell('odd','Oneven')}${cell('high','19–36')}</div></div>
  <div class="label" style="margin:10px 0">Getal x36 · dozijn x3 · rood/zwart, even/oneven, laag/hoog x2</div>
  <div class="row"><span>Totale inzet</span><b style="color:var(--gold);font-family:var(--f-mono)">${fmt(tot)}</b></div>
  <div class="flex" style="margin-top:10px"><button class="btn red" onclick="act.rlClear()" ${r.spinning||!tot?'disabled':''}>Wissen</button><button class="btn gold" onclick="act.rlSpin()" ${r.spinning||!tot?'disabled':''}>${r.spinning?'Draait…':'Draaien'}</button></div>
 </div></div>`}
function drawWheel(a){const cv=document.getElementById('wheel');if(!cv)return;const x=cv.getContext('2d'),W=cv.width,c=W/2,R=c-14,seg=Math.PI*2/37;
 x.clearRect(0,0,W,W);x.save();x.translate(c,c);
 x.beginPath();x.arc(0,0,R+10,0,Math.PI*2);x.fillStyle='#1b2238';x.fill();x.lineWidth=3;x.strokeStyle='#c9a24a';x.stroke();
 x.rotate(a);
 RL_ORDER.forEach((n,i)=>{const s=-Math.PI/2+i*seg-seg/2;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,s,s+seg);x.closePath();
  x.fillStyle=n===0?'#13a86b':REDS.has(n)?'#c8243f':'#12141f';x.fill();x.strokeStyle='rgba(201,162,74,.55)';x.lineWidth=1.2;x.stroke();
  x.save();x.rotate(s+seg/2+Math.PI/2);x.fillStyle='#f3f1ea';x.font='700 22px "Chakra Petch",sans-serif';x.textAlign='center';x.fillText(n,0,-R+30);x.restore()});
 x.beginPath();x.arc(0,0,R*0.62,0,Math.PI*2);x.fillStyle='#151b2e';x.fill();x.strokeStyle='#c9a24a';x.lineWidth=2;x.stroke();
 for(let k=0;k<8;k++){x.save();x.rotate(k*Math.PI/4);x.beginPath();x.moveTo(0,-R*0.18);x.lineTo(0,-R*0.6);x.strokeStyle='rgba(201,162,74,.5)';x.lineWidth=3;x.stroke();x.restore()}
 x.beginPath();x.arc(0,0,R*0.16,0,Math.PI*2);x.fillStyle='#c9a24a';x.fill();
 x.restore();
 if(!rl.spinning&&rl.res!=null){x.beginPath();x.arc(c,c-R+52,9,0,Math.PI*2);x.fillStyle='#fff';x.shadowColor='rgba(255,255,255,.8)';x.shadowBlur=12;x.fill();x.shadowBlur=0}}
function cardHtml(c){if(c.hidden)return '<div class="pc back"></div>';const red=c.s==='♥'||c.s==='♦';return `<div class="pc ${red?'red':''}"><span>${c.v}</span><span>${c.s}</span></div>`}
function handVal(h){let t=0,a=0;h.forEach(c=>{if(c.hidden)return;if(c.v==='A'){a++;t+=11}else t+=['K','Q','J'].includes(c.v)?10:+c.v});while(t>21&&a){t-=10;a--}return t}
function bjView(){const b=window.bj;
 if(!b)return `<p style="color:var(--mute)">Kom zo dicht mogelijk bij 21 zonder eroverheen te gaan. Blackjack betaalt 3:2, de dealer pakt tot 17.</p><button class="btn gold" onclick="act.bjDeal()">Delen</button>`;
 return `<div class="label">Dealer · ${handVal(b.d)}${b.d.some(c=>c.hidden)?' + ?':''}</div><div class="cards">${b.d.map(cardHtml).join('')}</div>
  <div class="label">Jij · ${handVal(b.p)} · inzet ${fmt(b.bet)}</div><div class="cards">${b.p.map(cardHtml).join('')}</div>
  ${b.done?`<div class="big" style="font-size:20px;text-align:center;margin:8px 0 12px;color:${b.res>0?'var(--green)':b.res<0?'var(--red)':'var(--fg)'}">${b.msg}</div><button class="btn gold" onclick="act.bjDeal()">Nieuwe hand</button>`
  :`<div class="flex"><button class="btn" onclick="act.bjHit()">Kaart</button><button class="btn gold" onclick="act.bjStand()">Passen</button><button class="btn" onclick="act.bjDouble()" ${b.p.length>2||S.cash<b.bet?'disabled':''}>Verdubbelen</button></div>`}`}
