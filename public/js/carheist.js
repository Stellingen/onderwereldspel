// Auto's tekenen (zijaanzicht per carrosserie) en de minigame "Contact maken".
// Moeilijker model = langere reeks, minder tijd per pijl, geen missers; vanaf 'moeilijk' moet je de reeks onthouden.
const CAR_BODIES={
 // body: carrosserie, win: ramen, w: wielposities [x1,x2], r: wielstraal, hl/tl: koplamp/achterlicht
 hatch:{body:'M14,58 L14,46 Q16,39 30,37 L56,35 Q68,22 86,19 L130,19 Q142,20 150,32 L174,36 Q186,38 187,48 L187,58 L168,58 A13,13 0 0 0 142,58 L58,58 A13,13 0 0 0 32,58 Z',
  win:'M62,35 Q72,24 88,22 L103,22 L103,35 Z M107,22 L128,22 Q138,23 146,34 L107,34 Z',w:[45,155],r:11,hl:[180,42],tl:[16,44]},
 sedan:{body:'M8,57 L8,47 Q10,41 24,39 L56,37 Q72,23 94,20 L124,20 Q140,21 152,35 L180,38 Q192,40 192,49 L192,57 L170,57 A13,13 0 0 0 144,57 L58,57 A13,13 0 0 0 32,57 Z',
  win:'M64,37 Q77,26 95,23 L108,23 L108,37 Z M112,23 L123,23 Q136,24 146,36 L112,36 Z',w:[45,157],r:11,hl:[186,43],tl:[10,44]},
 estate:{body:'M8,57 L8,46 Q10,40 24,38 L52,36 Q64,22 84,19 L158,19 Q167,20 171,30 L182,38 Q192,40 192,49 L192,57 L170,57 A13,13 0 0 0 144,57 L58,57 A13,13 0 0 0 32,57 Z',
  win:'M58,36 Q69,25 86,22 L108,22 L108,36 Z M112,22 L156,22 Q163,23 166,33 L166,36 L112,36 Z',w:[45,157],r:11,hl:[187,43],tl:[10,43]},
 coupe:{body:'M10,58 L10,48 Q12,42 28,40 L60,37 Q80,22 106,20 Q132,20 154,34 L178,40 Q190,43 190,52 L190,58 L168,58 A13,13 0 0 0 142,58 L58,58 A13,13 0 0 0 32,58 Z',
  win:'M70,37 Q86,26 105,24 Q124,24 140,36 Z',w:[45,155],r:11.5,hl:[184,45],tl:[12,46]},
 super:{body:'M6,56 L8,49 Q12,45 30,44 L66,40 L100,25 Q108,22 120,23 L142,27 L170,40 L188,44 Q194,46 194,52 L194,56 L170,56 A13,13 0 0 0 144,56 L56,56 A13,13 0 0 0 30,56 Z',
  win:'M82,40 L104,29 Q111,26 120,27 L136,30 L152,40 Z',w:[43,157],r:12,hl:[188,47],tl:[8,49]},
 suv:{body:'M10,58 L10,40 Q11,33 22,32 L46,31 L60,15 Q62,13 66,13 L150,13 Q156,13 160,18 L172,31 L182,32 Q190,34 190,42 L190,58 L169,58 A14,14 0 0 0 141,58 L59,58 A14,14 0 0 0 31,58 Z',
  win:'M54,31 L64,17 L104,17 L104,31 Z M108,17 L148,17 L161,31 L108,31 Z',w:[45,155],r:12.5,hl:[184,39],tl:[12,39]},
 luxury:{body:'M8,58 L8,44 Q9,37 22,36 L54,34 Q64,19 84,16 L132,16 Q146,17 154,32 L182,35 Q192,37 192,46 L192,58 L170,58 A13,13 0 0 0 144,58 L58,58 A13,13 0 0 0 32,58 Z',
  win:'M60,34 Q71,21 86,19 L106,19 L106,34 Z M110,19 L130,19 Q142,20 149,33 L110,33 Z',w:[45,157],r:12,hl:[186,42],tl:[10,42]},
 offroad:{body:'M12,58 L12,36 L20,32 L40,31 L46,12 L150,12 L154,31 L184,32 Q190,33 190,40 L190,58 L169,58 A14,14 0 0 0 141,58 L59,58 A14,14 0 0 0 31,58 Z',
  win:'M50,30 L54,16 L96,16 L96,30 Z M100,16 L146,16 L148,30 L100,30 Z',w:[45,155],r:13,hl:[185,38],tl:[13,38]}
};
let _carUid=0;
function carSvg(b,color,opt){opt=opt||{};const B=CAR_BODIES[b]||CAR_BODIES.hatch,u='cg'+(++_carUid),c=color||'#8a929c';
 const wheel=x=>`<g><circle cx="${x}" cy="${58+(B.r-11)*.3}" r="${B.r}" fill="#0b0c0f"/><circle cx="${x}" cy="${58+(B.r-11)*.3}" r="${B.r*.62}" fill="#5d636d"/><circle cx="${x}" cy="${58+(B.r-11)*.3}" r="${B.r*.5}" fill="url(#${u}r)"/><circle cx="${x}" cy="${58+(B.r-11)*.3}" r="${B.r*.14}" fill="#1a1c20"/></g>`;
 const car=`<path d="${B.body}" fill="url(#${u}b)"/><path d="${B.body}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width=".8"/>
  <path d="${B.win}" fill="url(#${u}w)"/><path d="M20,47 L182,47" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
  <ellipse cx="${B.hl[0]}" cy="${B.hl[1]}" rx="4.5" ry="2.4" fill="#fff6d6"/><rect x="${B.tl[0]-1}" y="${B.tl[1]-2}" width="5" height="4" rx="1" fill="#ff2d3d"/>
  ${wheel(B.w[0])}${wheel(B.w[1])}`;
 return `<svg viewBox="0 0 200 ${opt.reflect?96:72}" class="carsvg" aria-hidden="true"><defs>
  <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity="1"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".9"/></linearGradient>
  <linearGradient id="${u}w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a60"/><stop offset=".5" stop-color="#121821"/><stop offset="1" stop-color="#05070a"/></linearGradient>
  <radialGradient id="${u}r"><stop offset="0" stop-color="#d6dbe2"/><stop offset="1" stop-color="#6a707a"/></radialGradient>
  ${opt.reflect?`<linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${u}k"><rect x="0" y="70" width="200" height="26" fill="url(#${u}m)"/></mask>`:''}</defs>
  <ellipse cx="100" cy="70" rx="88" ry="4" fill="rgba(0,0,0,.6)"/>
  ${opt.hl?`<path d="M${B.hl[0]},${B.hl[1]} L200,${B.hl[1]-14} L200,${B.hl[1]+18} Z" fill="rgba(255,240,200,.12)"/>`:''}
  ${car}
  ${opt.reflect?`<g mask="url(#${u}k)"><g transform="translate(0,140) scale(1,-1)">${car}</g></g>`:''}</svg>`}
const CAR_COLORS={1:['#c9cfd6','#8a929c','#3a5fa8','#b8333a','#e6e1d6','#2f6b4a','#d8a23a','#50565f'],
 2:['#e6e1d6','#1d1f26','#3a5fa8','#b8333a','#5d6670','#f2c230','#e2e8ef'],3:['#1d1f26','#2b2f38','#e6e1d6','#6f7d8c','#14306b','#7a1f2a'],
 4:['#1d1f26','#e6e1d6','#c9a227','#14306b','#2f5f4a','#9a1a2a','#c0c6cc'],5:['#f2c230','#38c172','#ff7a1a','#e11d48','#7c3aed','#0ea5e9','#f8fafc','#111318']};
const PLATE_L='BDFGHJKLNPRSTVXZ';
function randPlate(){const L=()=>PLATE_L[Math.floor(Math.random()*PLATE_L.length)],N=()=>Math.floor(Math.random()*10);
 return [()=>L()+L()+'-'+N()+N()+N()+'-'+L(),()=>N()+'-'+L()+L()+L()+'-'+N()+N(),()=>L()+'-'+N()+N()+N()+'-'+L()+L()][Math.floor(Math.random()*3)]()}
function carRarity(m){return m.leg?CAR_MYTH:CAR_RARITY[m.d]}
// Minigame "Contact maken": per slot een reeks pijlen binnen de tijd. Rode pijl = druk de andere kant op.
// Zeldzamer model = meer sloten achter elkaar, langere reeks, minder tijd, geen fouten en meer rode pijlen.
// Rijvaardigheid (training) geeft +5% tijd per level. Niet onmogelijk, wel oefenen.
const HEIST_KEYS=['←','↑','→','↓'],HEIST_OPP=[2,3,0,1];
const HEIST_TIERS={1:{locks:1,len:4,per:1500,miss:2,rev:0},2:{locks:1,len:5,per:1100,miss:1,rev:0},3:{locks:2,len:5,per:820,miss:1,rev:0},
 4:{locks:2,len:6,per:620,miss:0,rev:1},5:{locks:3,len:6,per:480,miss:0,rev:2},6:{locks:3,len:7,per:400,miss:0,rev:3}};
const carTier=m=>m.leg?6:m.d;
const secTxt=ms=>(ms/1000).toLocaleString('nl-NL',{maximumFractionDigits:1})+' s';
// Ervaring als autodief: als groentje trillen je handen (minder tijd per pijl) en ziet vaker een voorbijganger je bezig.
// Groeit met het aantal gestolen auto's en je rang.
const CAR_LV=['Groentje','Leerling','Handig','Ervaren','Meesterdief'];
const carNerve=()=>{const n=(S.stats&&S.stats.cars)||0,ri=rankIdx(S.xp),a=.6*Math.min(1,n/40),b=.4*Math.min(1,ri/6),lv=Math.min(1,a+b),i=Math.min(4,Math.floor(lv*5));
 return {lv,i,name:CAR_LV[i],time:.78+.22*lv,wit:Math.max(.05,.28-.23*lv)}};
function heistParams(m){const sk=(S.skills&&S.skills.cars)||0,T=HEIST_TIERS[carTier(m)],N=carNerve();return {...T,per:Math.round(T.per*(1+sk*SK.cars.time+gearFx('car'))*N.time),d:m.d,wit:N.wit,nv:N}}
function heistTxt(P){return [P.locks>1?P.locks+' sloten':'1 slot',P.len+' pijlen in '+secTxt(P.len*P.per),P.rev?P.rev+' rode per slot':null,P.miss?P.miss+'× fout mag':'geen fouten'].filter(Boolean).join(' · ')}
function carHeist(sp){const m=CARS.find(k=>k.id===sp.id)||CARS[0];
 return new Promise(resolve=>{
  const P=heistParams(m),R=carRarity(m);window.__chase=true;
  const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','hT');
  ov.innerHTML=`<div class="chase-box heist t${carTier(m)}" style="--rc:${R[1]}">
    <div class="hx-car">${carSvg(m.b,sp.c,{hl:1})}<span class="plate">${sp.plate}</span></div>
    <div class="heist-top"><span class="rar" style="--rc:${R[1]}">${R[0]}</span><span class="label">${esc(m.n)}</span></div>
    <div class="hx-head"><h2 id="hT">Contact maken</h2><div class="hx-locks" id="hLocks" aria-label="Sloten">${Array.from({length:P.locks},()=>'<i></i>').join('')}</div></div>
    ${P.nv.i<2?`<div class="hx-nerve">${P.nv.name}: je handen trillen (−${Math.round((1-P.nv.time)*100)}% tijd). Let op voorbijgangers.</div>`:''}
    <div class="hx-wit" id="hWit" hidden><i>👁</i><span>Een voorbijganger ziet je bezig en pakt zijn telefoon. Schiet op!</span></div>
    <p class="chase-p" id="hP">Toets de pijlen in deze volgorde in. ${P.rev?'<b class="rv">Rode pijl</b> = druk de andere kant op. ':''}${P.miss?'Je mag '+P.miss+'× fout.':'Eén fout en het alarm gaat af.'} Pijltjestoetsen, WASD of de knoppen.</p>
    <div class="heist-seq" id="hSeq">${'<i class="ghost"></i>'.repeat(P.len)}</div>
    <div class="hx-time"><i id="hTime"></i></div>
    <div class="heist-pad">${HEIST_KEYS.map((k,i)=>`<button data-k="${i}" aria-label="Pijl ${k}">${k}</button>`).join('')}</div></div>`;
  document.body.appendChild(ov);
  const q=s=>ov.querySelector(s),bar=q('#hTime');let dur=P.len*P.per;
  let lock=0,idx=0,miss=0,done=false,t0=0,run=0,seq=[],cells=[];
  // voorbijganger: op een willekeurig moment ziet iemand je; je verliest tijd en mislukt het, dan belde hij 112 (maar je bent op tijd weg)
  const wit={on:Math.random()<P.wit,lock:Math.floor(Math.random()*P.locks),at:.3+Math.random()*.35,seen:false};
  const need=s=>s.r?HEIST_OPP[s.k]:s.k;
  const mark=()=>cells.forEach((c,i)=>{c.classList.toggle('cur',i===idx&&!!t0);c.classList.toggle('ok',i<idx)});
  const lockUi=()=>q('#hLocks').querySelectorAll('i').forEach((e,i)=>{e.classList.toggle('open',i<lock);e.classList.toggle('cur',i===lock&&!done)});
  const newSeq=()=>{seq=Array.from({length:P.len},()=>({k:Math.floor(Math.random()*4),r:false}));
   [...Array(P.len-1).keys()].map(i=>i+1).sort(()=>Math.random()-.5).slice(0,P.rev).forEach(i=>seq[i].r=true);
   q('#hSeq').innerHTML=seq.map(s=>`<i class="${s.r?'rev':''}">${HEIST_KEYS[s.k]}</i>`).join('');cells=[...q('#hSeq').children];idx=0};
  const loop=r=>t=>{if(done||r!==run)return;let p=(t-t0)/dur;
   if(wit.on&&!wit.seen&&lock===wit.lock&&p>=wit.at){wit.seen=true;t0-=dur*.25;p=(t-t0)/dur;dur=Math.round(dur*.85);q('#hWit').hidden=false;try{SFX.lose()}catch(e){}}
   bar.style.width=Math.max(0,100-p*100)+'%';bar.classList.toggle('low',p>.7);
   if(p>=1)return finish(false,wit.seen?'Te traag. De voorbijganger belt 112.':'Te traag. Het alarm gaat af.');requestAnimationFrame(loop(r))};
  const startLock=()=>{if(done)return;newSeq();t0=performance.now();run++;mark();lockUi();bar.classList.remove('peek');requestAnimationFrame(loop(run))};
  const press=k=>{if(done||!t0)return;const btn=q(`.heist-pad [data-k="${k}"]`);btn.classList.remove('hit','bad');void btn.offsetWidth;
   if(k===need(seq[idx])){btn.classList.add('hit');SFX.tick();idx++;mark();
    if(idx>=seq.length){lock++;t0=0;run++;lockUi();
     if(lock>=P.locks)return finish(true,'De motor slaat aan. Rijden!');
     SFX.pop();q('#hP').textContent='Slot '+lock+' van '+P.locks+' open. Volgende reeks komt eraan.';setTimeout(startLock,450)}}
   else{btn.classList.add('bad');miss++;SFX.lose();const c=cells[idx];c.classList.add('err');setTimeout(()=>c.classList.remove('err'),300);
    if(miss>P.miss)finish(false,(seq[idx].r?'Rode pijl gemist':'Verkeerde draad')+(wit.seen?'. De voorbijganger belt 112.':'. Het alarm gaat af.'))}};
  const KEYMAP={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,KeyA:0,KeyW:1,KeyD:2,KeyS:3};
  const key=e=>{if(e.code in KEYMAP){e.preventDefault();press(KEYMAP[e.code])}};
  document.addEventListener('keydown',key);
  ov.querySelectorAll('.heist-pad button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(+b.dataset.k)}));
  function finish(ok,msg){done=true;run++;document.removeEventListener('keydown',key);const box=q('.chase-box');box.classList.add(ok?'won':'lost');lockUi();
   q('#hT').textContent=ok?'Gelukt!':wit.seen?'112 gebeld!':'Alarm!';q('#hP').textContent=msg;
   if(ok)box.querySelector('.hx-car').classList.add('drive');
   (ok?SFX.win(3):SFX.lose());const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);
   setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok?true:wit.seen?'witness':'alarm')},220)},1500)}
  bar.classList.add('peek');lockUi();setTimeout(startLock,800);
 });
}
