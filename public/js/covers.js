// Casino: de spellen en hun illustraties. Gedeeld door de website (landing.js) en het spel (lobby in casino.js).
// Alles zit in COV, zodat namen als RL_ORDER niet botsen met die in het spel.
window.COV=(()=>{
const GAMES=[
 {id:'kluis',slug:'kluiskraker',n:'Kluiskraker',col:'#ff7a1a',kind:'Cluster-slot · 10 × 10',short:'Vijf gelijke symbolen die elkaar raken, ontploffen. Op dezelfde plek weer winst? Dan wordt dat vakje x2, x4, x8.',tags:['Max 5.000×','RTP ±92%']},
 {id:'vis',slug:'visdief',n:'Visdief',col:'#5ad1ff',kind:'Video-slot · 5 × 4',short:'Elke vis heeft een prijskaartje. Valt de Visdief erbij, dan pakt hij ze allemaal.',tags:['Max 10.000×','RTP ±92%']},
 {id:'mines',slug:'mines',n:'Mines',col:'#3fe395',kind:'Durfspel · 5 × 5',short:'Vijfentwintig vakjes en jij kiest hoeveel bommen. Elk veilig vakje is meer waard. Stop op tijd.',tags:['Max 10.000×','RTP tot 99,2%']},
 {id:'avia',slug:'hoogvlieger',n:'Hoogvlieger',col:'#a9dcff',kind:'Vluchtspel',short:'Een vliegtuigje boven zee. Pluspunten duwen hem omhoog, bommen halen hem neer. Land op het dek.',tags:['Vlucht ligt vast','RTP ±87%']},
 {id:'bj',slug:'blackjack',n:'Blackjack',col:'#1fd17a',kind:'Kaarttafel',short:'Zo dicht mogelijk bij 21 zonder eroverheen. Blackjack betaalt 3 tot 2, de dealer pakt tot 17.',tags:['3 : 2','2 side bets']},
 {id:'tcp',slug:'three-card-poker',n:'Three Card Poker',col:'#b8a1ff',kind:'Kaarttafel',short:'Drie kaarten tegen de dealer. Met Pair Plus win je ook als de dealer niet speelt.',tags:['Pair Plus 40 : 1','6-Card Bonus']},
 {id:'th',slug:'texas-holdem',n:"Texas Hold'em",col:'#f472b6',kind:'Kaarttafel',short:'Twee kaarten en de flop. Speel je mee voor 2× je ante, dan komen de turn en de river. Beste vijf van zeven wint.',tags:['Royal 100 : 1','AA Bonus']},
 {id:'roulette',slug:'roulette',n:'Roulette',col:'#ff3d52',kind:'Tafelspel',short:'Een Europees wiel met één nul. Op een getal, een rij, een kleur. Dan rolt de bal.',tags:['Eén nul','RTP 97,3%']},
 {id:'coin',slug:'dubbel-of-niks',n:'Dubbel of niks',col:'#ffc53a',kind:'Munt',short:'Een echte munt, precies vijftig procent. Win je, dan pak je je pot of gooi je door voor het dubbele.',tags:['50 / 50','Tot ×1.024']}];
const gameBy=slug=>GAMES.find(g=>g.slug===slug);

// Speelkaart (met getekende kleuren, dus overal gelijk)
const SUIT={
 h:'M0 7C-11-1-11-10-5-10-2-10 0-7 0-6 0-7 2-10 5-10 11-10 11-1 0 7Z',
 d:'M0-10L7.5 0 0 10-7.5 0Z',
 s:'M0-10C11-1 11 6 4.5 6 2 6 1 4.5.7 3.5L2.5 10h-5L-.7 3.5C-1 4.5-2 6-4.5 6-11 6-11-1 0-10Z',
 c:'M0-10a4.6 4.6 0 0 1 4.3 6.2A4.6 4.6 0 1 1 1.2 3.4L2.6 10h-5.2L-1.2 3.4A4.6 4.6 0 1 1-4.3-3.8 4.6 4.6 0 0 1 0-10Z'};
function pcard(x,y,rot,rank,s,o){o=o||{};const red=s==='h'||s==='d',col=red?'#c8102e':'#16181d';
 return `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-34" y="-48" width="68" height="96" rx="7" fill="#000" opacity=".35" transform="translate(3 5)"/>
  <rect x="-34" y="-48" width="68" height="96" rx="7" fill="#f4f0e7" stroke="#cbc3b2" stroke-width="1.2"/>
  <text x="-25" y="-25" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="21" fill="${col}">${rank}</text>
  <path d="${SUIT[s]}" fill="${col}" transform="translate(-19 -11) scale(.62)"/>
  <path d="${SUIT[s]}" fill="${col}" transform="translate(4 14) scale(${o.big||1.75})"/></g>`}
function chip(x,y,col,n){let s='';for(let i=0;i<(n||1);i++){const yy=y-i*6;
 s+=`<ellipse cx="${x}" cy="${yy+3}" rx="20" ry="7" fill="#000" opacity=".25"/><ellipse cx="${x}" cy="${yy}" rx="20" ry="7" fill="${col}"/><ellipse cx="${x}" cy="${yy}" rx="20" ry="7" fill="none" stroke="#f4f0e7" stroke-width="3" stroke-dasharray="5 6"/><ellipse cx="${x}" cy="${yy}" rx="11" ry="3.8" fill="none" stroke="#f4f0e7" stroke-opacity=".55"/>`}return s}
const RL_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RL_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function arcSeg(cx,cy,r0,r1,a0,a1){const p=(r,a)=>(cx+Math.cos(a)*r).toFixed(2)+' '+(cy+Math.sin(a)*r).toFixed(2);
 return `M${p(r1,a0)}A${r1} ${r1} 0 0 1 ${p(r1,a1)}L${p(r0,a1)}A${r0} ${r0} 0 0 0 ${p(r0,a0)}Z`}
function wheelSvg(cx,cy,R,uid,ballA){const n=37,step=Math.PI*2/n;let pk='',nums='';
 RL_ORDER.forEach((v,i)=>{const a0=-Math.PI/2+i*step-step/2,a1=a0+step;const f=v===0?'#178a46':RL_RED.has(v)?'#c8102e':'#15171b';
  pk+=`<path d="${arcSeg(cx,cy,R*.67,R*.87,a0,a1)}" fill="${f}" stroke="#c9a227" stroke-opacity=".55" stroke-width=".6"/>`;
  const am=(a0+a1)/2,tx=cx+Math.cos(am)*R*.8,ty=cy+Math.sin(am)*R*.8;
  nums+=`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${(am*180/Math.PI+90).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="JetBrains Mono,monospace" font-size="${(R*.075).toFixed(1)}" font-weight="700" fill="#f4f0e7">${v}</text>`});
 const ba=ballA==null?-Math.PI/2+5.4*step:ballA,bx=cx+Math.cos(ba||0)*R*.92,by=cy+Math.sin(ba||0)*R*.92;
 return `<defs><radialGradient id="${uid}w" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#5a3a24"/><stop offset="1" stop-color="#20140c"/></radialGradient>
  <radialGradient id="${uid}c" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#4a3322"/><stop offset="1" stop-color="#140d08"/></radialGradient></defs>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#${uid}w)" stroke="#c9a227" stroke-opacity=".5" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="${R*.9}" fill="none" stroke="#0d0907" stroke-width="${R*.05}" opacity=".6"/>
  <g class="rl-ring">${pk}${nums}</g>
  <circle cx="${cx}" cy="${cy}" r="${R*.66}" fill="url(#${uid}c)"/>
  <g stroke="#c9a227" stroke-width="${R*.05}" stroke-linecap="round" class="rl-turret"><path d="M${cx-R*.3} ${cy}H${cx+R*.3}M${cx} ${cy-R*.3}V${cy+R*.3}"/></g>
  <g fill="#e6c25a"><circle cx="${cx-R*.3}" cy="${cy}" r="${R*.05}"/><circle cx="${cx+R*.3}" cy="${cy}" r="${R*.05}"/><circle cx="${cx}" cy="${cy-R*.3}" r="${R*.05}"/><circle cx="${cx}" cy="${cy+R*.3}" r="${R*.05}"/></g>
  <circle cx="${cx}" cy="${cy}" r="${R*.11}" fill="#e6c25a" stroke="#8a6a12"/>
  ${ballA===false?'':`<circle class="rl-ball" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${R*.05}" fill="#fbfaf6" stroke="#9aa1ab" stroke-width=".6"/>`}`}

function coverSvg(id,uid){uid=uid||('c'+id);const T='font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900"';
 const M='font-family="JetBrains Mono,monospace"';
 const svg=b=>`<svg viewBox="0 0 320 220" class="cov-svg" role="img" aria-hidden="true">${b}</svg>`;
 if(id==='kluis'){const bar=(x,y,w)=>`<path d="M${x} ${y}l4-11h${w-8}l4 11z" fill="url(#${uid}g)" stroke="#7a4504" stroke-width=".8"/><path d="M${x+4} ${y-11}h${w-8}l-2 3h${-(w-12)}z" fill="#fff4c2" opacity=".55"/>`;
  return svg(`<defs><radialGradient id="${uid}l" cx="50%" cy="58%" r="62%"><stop offset="0" stop-color="#ffc27a"/><stop offset=".45" stop-color="#ff7a1a" stop-opacity=".55"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
   <linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#ffbe36"/><stop offset="1" stop-color="#b8700a"/></linearGradient>
   <linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#30353d"/><stop offset="1" stop-color="#16181c"/></linearGradient></defs>
   <path d="M136 168L318 214H320V176L214 160Z" fill="#ff7a1a" opacity=".13"/>
   <ellipse cx="178" cy="184" rx="104" ry="11" fill="#000" opacity=".55"/>
   <path d="M122 42L146 28H252L228 42Z" fill="#2c3037"/><path d="M228 42L252 28V160L228 176Z" fill="#101215"/>
   <rect x="122" y="42" width="106" height="134" fill="url(#${uid}s)" stroke="#3c414a" stroke-width="1.4"/>
   <rect x="128" y="176" width="14" height="7" fill="#0c0d10"/><rect x="208" y="176" width="14" height="7" fill="#0c0d10"/>
   <rect x="134" y="54" width="82" height="110" fill="#0a0b0d"/><rect x="134" y="54" width="82" height="110" fill="url(#${uid}l)"/>
   <path d="M134 108H216" stroke="#3a1c08" stroke-width="3"/>
   <g>${[[146,92],[164,92],[182,92]].map(([x,y])=>`<rect x="${x}" y="${y-14}" width="16" height="14" fill="#1f9d63"/><rect x="${x}" y="${y-9}" width="16" height="4" fill="#e9e5db" opacity=".9"/>`).join('')}
    <rect x="155" y="64" width="16" height="14" fill="#2bb877"/><rect x="155" y="69" width="16" height="4" fill="#e9e5db" opacity=".9"/>
    <circle cx="200" cy="96" r="7" fill="#c99a5b"/><circle cx="200" cy="96" r="4.6" fill="none" stroke="#7a5426" stroke-width="1.2"/></g>
   ${bar(140,164,24)}${bar(164,164,24)}${bar(188,164,24)}${bar(152,153,24)}${bar(176,153,24)}${bar(164,142,24)}
   <path d="M82 66L88 68V180L82 178Z" fill="#0f1114"/>
   <path d="M134 54L88 68V180L134 164Z" fill="#24282e" stroke="#3c414a" stroke-width="1.4"/>
   <path d="M128 62L94 73V171L128 158Z" fill="none" stroke="#33383f" stroke-width="1"/>
   ${[88,118,148].map(y=>`<rect x="72" y="${y}" width="13" height="7" rx="2" fill="#9aa1ab"/><rect x="72" y="${y}" width="13" height="2.5" rx="1" fill="#d6dbe2"/>`).join('')}
   <ellipse cx="112" cy="112" rx="13" ry="20" fill="#121418" stroke="#ffad6b" stroke-width="2"/>
   <ellipse cx="112" cy="112" rx="8" ry="13" fill="none" stroke="#ffad6b" stroke-opacity=".5" stroke-width="1"/>
   ${Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return `<path d="M${(112+Math.cos(a)*10.5).toFixed(1)} ${(112+Math.sin(a)*16.5).toFixed(1)}L${(112+Math.cos(a)*12.5).toFixed(1)} ${(112+Math.sin(a)*19.3).toFixed(1)}" stroke="#ffad6b" stroke-width="1"/>`}).join('')}
   <ellipse cx="112" cy="112" rx="3.5" ry="5.5" fill="#ff7a1a"/>
   <path d="M111 140V156M104 146l7 4 7-4" stroke="#9aa1ab" stroke-width="3" fill="none" stroke-linecap="round"/>
   <g transform="translate(40 176) rotate(-28)"><circle cx="0" cy="0" r="11" fill="none" stroke="#a9dcff" stroke-width="5"/><path d="M10-3h30v6h-5v8h-6v-8h-4v5h-6v-5h-9z" fill="#a9dcff"/></g>
   <g transform="translate(252 56) rotate(4)"><rect x="0" y="0" width="54" height="32" fill="#ff7a1a"/><text x="27" y="24" text-anchor="middle" ${T} font-size="23" fill="#0b0907">x16</text></g>
   <path d="M268 112l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4z" fill="#ffe9a8"/><path d="M58 50l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ffad6b" opacity=".8"/>`)}
 if(id==='vis')return svg(`<defs><linearGradient id="${uid}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5c88a8"/><stop offset=".45" stop-color="#cfe2ee"/><stop offset="1" stop-color="#6d97b4"/></linearGradient></defs>
   <rect x="0" y="164" width="320" height="56" fill="#5ad1ff" opacity=".07"/>
   ${[164,176,190,204].map((y,i)=>`<path d="M0 ${y}${Array.from({length:9},(_,k)=>` q20 ${i%2?5:-5} 40 0`).join('')}" stroke="#5ad1ff" stroke-opacity="${.55-i*.12}" stroke-width="1.6" fill="none"/>`).join('')}
   <path d="M160 0V60" stroke="#e6e1d6" stroke-width="1.2" opacity=".75"/>
   <ellipse cx="160" cy="194" rx="34" ry="5" fill="#000" opacity=".25"/>
   <path d="M160 140L139 176L160 166L181 176Z" fill="#4f7894"/>
   <path d="M137 98Q120 110 136 126Z" fill="#4f7894"/><path d="M183 98Q200 110 184 126Z" fill="#4f7894"/>
   <ellipse cx="160" cy="106" rx="23" ry="44" fill="url(#${uid}f)"/>
   <path d="M146 84Q160 92 174 84" stroke="#3d6680" stroke-width="2" fill="none"/>
   ${[0,1,2,3].map(k=>`<path d="M${148+((k%2)*6)} ${102+k*10}q6 5 12 0q6 5 12 0" stroke="#3d6680" stroke-opacity=".45" fill="none"/>`).join('')}
   <circle cx="152" cy="76" r="4.4" fill="#fff"/><circle cx="151" cy="75.5" r="2.2" fill="#0b0f14"/>
   <path d="M155 63q5 -4 10 0" stroke="#2c4a5e" stroke-width="2" fill="none"/>
   <path d="M160 52v12a6 6 0 0 1-12 0v-3" stroke="#d6dbe2" stroke-width="2.6" fill="none" stroke-linecap="round"/>
   <path d="M166 166L198 182" stroke="#e6e1d6" stroke-width="1.2"/>
   <g transform="translate(196 176) rotate(14)"><path d="M0 0h62v28H0l-8-14z" fill="#f4f0e7" stroke="#cbc3b2"/><circle cx="2" cy="14" r="2.6" fill="#0d0f12"/><text x="34" y="20" text-anchor="middle" ${M} font-weight="700" font-size="14" fill="#16181d">€250</text></g>
   <g transform="translate(80 162)"><ellipse cx="0" cy="6" rx="22" ry="5" fill="none" stroke="#5ad1ff" stroke-opacity=".45"/><path d="M0-22v8" stroke="#d6dbe2" stroke-width="2"/><circle cx="0" cy="0" r="10" fill="#f4f0e7"/><path d="M-10 0a10 10 0 0 1 20 0z" fill="#ff4b5c"/></g>
   <g transform="translate(276 206)"><ellipse cx="0" cy="-8" rx="40" ry="7" fill="#1a1d22"/><path d="M-21-8c-1-13 4-22 11-24 4 2 15 2 21 0 7 3 11 12 10 24z" fill="#262a31"/><path d="M-21-15h42v5h-42z" fill="#ff4b5c"/>
    <path d="M-20 4h17l-1.5 8c-.4 2-2 3-4 3h-6c-2 0-3.6-1.2-4-3zM3 4h17l-1.5 8c-.4 2-2 3-4 3h-6c-2 0-3.6-1.2-4-3z" fill="#0b0f14"/><path d="M-3 6h6" stroke="#0b0f14" stroke-width="2"/></g>
   <g transform="translate(34 40)"><circle r="20" fill="#5ad1ff" opacity=".14"/><circle r="20" fill="none" stroke="#5ad1ff" stroke-opacity=".6"/><text y="7" text-anchor="middle" ${T} font-size="19" fill="#5ad1ff">×10</text></g>`);
 if(id==='mines'){const gem=new Set(['0,0','1,0','0,1','2,1','1,2','3,2','2,4']),mine='3,3';let t='';
  const order=[];for(let i=0;i<5;i++)for(let j=0;j<5;j++)order.push([i,j]);order.sort((a,b)=>(a[0]+a[1])-(b[0]+b[1]));
  order.forEach(([i,j])=>{const cx=176+(i-j)*24,cy=70+(i+j)*13.4,k=i+','+j,g=gem.has(k),m=k===mine;
   const top=m?'#3a0f16':g?'#0f2f20':'#1e2229',side1=m?'#24090d':g?'#0a1f15':'#121418',side2=m?'#1a0609':g?'#07170f':'#0d0f12';
   t+=`<path d="M${cx-21} ${cy}L${cx} ${cy+11.6}V${cy+17}L${cx-21} ${cy+5.4}Z" fill="${side1}"/><path d="M${cx} ${cy+11.6}L${cx+21} ${cy}V${cy+5.4}L${cx} ${cy+17}Z" fill="${side2}"/>
    <path d="M${cx} ${cy-11.6}L${cx+21} ${cy}L${cx} ${cy+11.6}L${cx-21} ${cy}Z" fill="${top}" stroke="${m?'#ff3d52':g?'#3fe395':'#2b3038'}" stroke-opacity="${m||g?.8:1}" stroke-width="1"/>`;
   if(g)t+=`<path d="M${cx-7} ${cy-3}l3.5-5h7l3.5 5-7 8z" fill="#3fe395"/><path d="M${cx-7} ${cy-3}h14M${cx-3.5} ${cy-8}l3.5 5 3.5-5" stroke="#0a2a1a" stroke-width=".8" fill="none"/>`;
   if(m)t+=`<ellipse cx="${cx}" cy="${cy}" rx="18" ry="9" fill="#ff3d52" opacity=".25"/><g stroke="#ff3d52" stroke-width="2" stroke-linecap="round"><path d="M${cx-10} ${cy-4}h20M${cx} ${cy-14}v20M${cx-7} ${cy-11}l14 14M${cx+7} ${cy-11}l-14 14"/></g><circle cx="${cx}" cy="${cy-4}" r="6.5" fill="#16181d" stroke="#ff3d52" stroke-width="1.5"/><circle cx="${cx-2}" cy="${cy-6}" r="1.6" fill="#fff" opacity=".7"/>`});
  return svg(`<ellipse cx="176" cy="200" rx="116" ry="14" fill="#000" opacity=".45"/>${t}
   <g transform="translate(26 34)"><text ${T} font-size="34" fill="#3fe395">×3,42</text><text y="18" ${M} font-size="10" letter-spacing="1.5" fill="#8a8f98">5 BOMMEN · 4 VEILIG</text></g>`)}
 if(id==='avia')return svg(`<rect x="0" y="168" width="320" height="52" fill="#4d7dff" opacity=".1"/>
   ${[172,184,198,212].map((y,i)=>`<path d="M0 ${y}${Array.from({length:11},()=>` q16 ${i%2?3:-3} 32 0`).join('')}" stroke="#a9dcff" stroke-opacity="${.35-i*.07}" stroke-width="1.3" fill="none"/>`).join('')}
   <path d="M196 170H306L298 186H206Z" fill="#2b3038"/><path d="M196 170H306" stroke="#9aa1ab" stroke-width="2"/><path d="M206 167H292" stroke="#f4f0e7" stroke-width="1.4" stroke-dasharray="8 6" opacity=".7"/>
   <rect x="276" y="152" width="12" height="16" fill="#3a3f47"/><rect x="279" y="146" width="3" height="7" fill="#9aa1ab"/>
   <path d="M18 156C70 58 168 30 236 98" stroke="#a9dcff" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round" fill="none" opacity=".8"/>
   <g transform="translate(74 92)"><circle r="15" fill="#3fe395" opacity=".16"/><circle r="15" fill="none" stroke="#3fe395"/><text y="6" text-anchor="middle" ${T} font-size="17" fill="#3fe395">+5</text></g>
   <g transform="translate(150 50)"><circle r="15" fill="#ffc53a" opacity=".16"/><circle r="15" fill="none" stroke="#ffc53a"/><text y="6" text-anchor="middle" ${T} font-size="17" fill="#ffc53a">×3</text></g>
   <g transform="translate(214 128)"><circle r="12" fill="#16181d" stroke="#ff3d52" stroke-width="1.5"/><path d="M6-9q6-8 12-6" stroke="#9aa1ab" stroke-width="2" fill="none"/><circle cx="19" cy="-15" r="3" fill="#ff7a1a"/><text y="5" text-anchor="middle" ${T} font-size="12" fill="#ff3d52">÷2</text></g>
   <g transform="translate(236 98) rotate(38)"><path d="M-30-3h44c8 0 14 2 14 5s-6 5-14 5h-44l-6-4z" fill="#ff7a1a"/><path d="M-28-3l-8-12h8l10 12z" fill="#ffad6b"/>
    <path d="M-6 2l-10 16h8l14-16z" fill="#d6631a"/><path d="M-4-2l-6-11h7l9 11z" fill="#ffad6b" opacity=".8"/><circle cx="8" cy="0" r="3" fill="#a9dcff"/>
    <ellipse cx="29" cy="2" rx="2" ry="13" fill="#e6e1d6" opacity=".5"/></g>
   <g transform="translate(298 34)" text-anchor="end"><text ${T} font-size="34" fill="#a9dcff">×12,4</text><text y="18" ${M} font-size="10" letter-spacing="1.5" fill="#8a8f98">HOOGTE 64 · 9 ITEMS</text></g>`);
 if(id==='bj')return svg(`<defs><path id="${uid}a" d="M30 214Q160 120 290 214"/></defs>
   <path d="M-10 230Q160 96 330 230Z" fill="#1fd17a" opacity=".08"/><path d="M20 220Q160 118 300 220" stroke="#1fd17a" stroke-opacity=".5" fill="none"/>
   <text ${M} font-size="9" letter-spacing="2.5" fill="#1fd17a" opacity=".85"><textPath href="#${uid}a" startOffset="50%" text-anchor="middle">BLACKJACK BETAALT 3 TOT 2</textPath></text>
   ${pcard(136,100,-11,'A','s')}${pcard(184,94,9,'K','h')}
   ${chip(262,168,'#c8102e',3)}${chip(54,176,'#1f6feb',2)}
   <g transform="translate(250 50)"><circle r="22" fill="#1fd17a"/><text y="9" text-anchor="middle" ${T} font-size="26" fill="#07170f">21</text></g>`);
 if(id==='tcp')return svg(`<path d="M-10 230Q160 110 330 230Z" fill="#b8a1ff" opacity=".07"/>
   ${pcard(118,120,-16,'Q','d')}${pcard(160,108,0,'K','d')}${pcard(202,120,16,'A','d')}
   ${chip(48,182,'#7c5cff',3)}${chip(278,184,'#16181d',2)}
   <g transform="translate(160 26)"><text text-anchor="middle" ${M} font-size="10" letter-spacing="2" fill="#b8a1ff">PAIR PLUS · STRAIGHT FLUSH</text><text y="22" text-anchor="middle" ${T} font-size="22" fill="#e9e2ff">40 : 1</text></g>`);
 if(id==='th'){const sm=(x,y,r,s2,rot)=>`<g transform="translate(${x} ${y}) scale(.56)">${pcard(0,0,rot||0,r,s2,{big:1.5})}</g>`;
  return svg(`<path d="M-10 236Q160 96 330 236Z" fill="#f472b6" opacity=".07"/><path d="M14 226Q160 112 306 226" stroke="#f472b6" stroke-opacity=".45" fill="none"/>
   <g transform="translate(160 22)"><text text-anchor="middle" ${M} font-size="9.5" letter-spacing="2.4" fill="#f472b6">FLOP · TURN · RIVER</text></g>
   ${sm(76,72,'A','h')}${sm(122,72,'K','h')}${sm(168,72,'Q','h')}${sm(214,72,'J','h')}<g opacity=".55">${sm(260,72,'4','c')}</g>
   ${pcard(140,168,-10,'10','h')}${pcard(184,164,8,'9','s')}
   ${chip(60,196,'#f472b6',3)}${chip(270,200,'#16181d',2)}`)}
 if(id==='roulette')return svg(`<ellipse cx="160" cy="200" rx="118" ry="12" fill="#000" opacity=".45"/>${wheelSvg(160,108,94,uid)}`);
 if(id==='coin'){const coin=(x,y,ry,o,rot)=>`<g transform="translate(${x} ${y}) rotate(${rot||0})" opacity="${o}"><ellipse cx="0" cy="${Math.max(3,ry*.16)}" rx="46" ry="${ry}" fill="#8a5a06"/><ellipse cx="0" cy="0" rx="46" ry="${ry}" fill="url(#${uid}g)" stroke="#7a5506" stroke-width="1.2"/>
   <ellipse cx="0" cy="0" rx="38" ry="${ry*.82}" fill="none" stroke="#7a5506" stroke-opacity=".6" stroke-dasharray="2 3"/>
   <g transform="scale(1 ${(ry/46).toFixed(3)})"><path d="M-20 10L-24-10-12 0 0-16 12 0 24-10 20 10Z" fill="#7a5506"/><rect x="-21" y="12" width="42" height="6" rx="2" fill="#7a5506"/></g></g>`;
  return svg(`<defs><linearGradient id="${uid}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#ffc53a"/><stop offset="1" stop-color="#c98a06"/></linearGradient></defs>
   <path d="M70 190C80 60 210 40 236 130" stroke="#ffc53a" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="3 6" fill="none"/>
   ${coin(84,170,40,.18,0)}${coin(110,92,22,.35,-8)}${coin(176,62,9,1,-14)}
   <path d="M150 40q26-12 52 0M146 84q32 14 60 2" stroke="#ffc53a" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>
   <ellipse cx="176" cy="198" rx="70" ry="8" fill="#000" opacity=".4"/>
   <g transform="translate(272 40)" ${T} text-anchor="middle">${['×2','×4','×8','×16','×32'].map((t,i)=>`<text y="${i*30}" font-size="${16+i*2}" fill="#ffc53a" opacity="${.25+i*.18}">${t}</text>`).join('')}</g>`)}
 return ''}

return {GAMES,gameBy,SUIT,pcard,chip,RL_ORDER,RL_RED,arcSeg,wheelSvg,coverSvg}})();
