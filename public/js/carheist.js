// Minigame bij autodiefstal: "Contact maken" — toets de reeks pijlen in voordat de tijd op is.
// Moeilijker model = langere reeks, minder tijd, minder missers; vanaf 'moeilijk' zie je de reeks maar even (onthouden).
const HEIST_KEYS=['←','↑','→','↓'];
function heistParams(d){const sk=(S.skills&&S.skills.cars)||0;
  return {len:3+d*2-(d>=4?1:0),per:Math.round((1350-d*170)*(1+sk*.05)),miss:d<=1?2:d===2?1:0,peek:d===4?1800:d===5?1100:0,d}}
function carHeist(car){
  return new Promise(resolve=>{
    const P=heistParams(car.d),seq=Array.from({length:P.len},()=>Math.floor(Math.random()*4));window.__chase=true;
    const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
    ov.innerHTML=`<div class="chase-box heist"><div class="heist-top"><span class="tag lvl${car.d}">${CAR_LEVEL[car.d]}</span><span class="label">${esc(car.n)}</span></div>
      <h2 id="hT">Contact maken</h2>
      <p class="chase-p" id="hP">${P.peek?'Onthoud de reeks. Hij verdwijnt zo.':'Toets de pijlen in deze volgorde in.'} Pijltjestoetsen, WASD of de knoppen. ${P.miss?'Je mag '+P.miss+'× mis.':'Eén fout en het alarm gaat af.'}</p>
      <div class="heist-seq" id="hSeq">${seq.map((k,i)=>`<i data-i="${i}">${HEIST_KEYS[k]}</i>`).join('')}</div>
      <div class="chase-time"><i id="hTime"></i></div>
      <div class="heist-pad">${HEIST_KEYS.map((k,i)=>`<button data-k="${i}" aria-label="Pijl ${k}">${k}</button>`).join('')}</div></div>`;
    document.body.appendChild(ov);
    const q=s=>ov.querySelector(s),cells=[...ov.querySelectorAll('#hSeq i')];
    let idx=0,miss=0,done=false,t0=0;const dur=P.len*P.per;
    const mark=()=>cells.forEach((c,i)=>{c.classList.toggle('cur',i===idx);c.classList.toggle('ok',i<idx)});mark();
    const start=()=>{t0=performance.now();if(P.peek)cells.forEach((c,i)=>{if(i>=idx)c.classList.add('hide')});requestAnimationFrame(tick)};
    const tick=t=>{if(done)return;const p=(t-t0)/dur;q('#hTime').style.width=Math.max(0,100-p*100)+'%';if(p>=1)return finish(false,'Te traag. Het alarm gaat af.');requestAnimationFrame(tick)};
    const press=k=>{if(done||!t0)return;const btn=q(`.heist-pad [data-k="${k}"]`);btn.classList.remove('hit','bad');void btn.offsetWidth;
      if(k===seq[idx]){btn.classList.add('hit');SFX.tick();cells[idx].classList.remove('hide');idx++;mark();if(idx>=seq.length)finish(true,'De motor slaat aan. Rijden!')}
      else{btn.classList.add('bad');miss++;SFX.lose();cells[idx].classList.add('err');setTimeout(()=>cells[idx]&&cells[idx].classList.remove('err'),300);if(miss>P.miss)finish(false,'Verkeerde draad. Het alarm gaat af.')}};
    const KEYMAP={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3,KeyA:0,KeyW:1,KeyD:2,KeyS:3};
    const key=e=>{if(e.code in KEYMAP){e.preventDefault();press(KEYMAP[e.code])}};
    document.addEventListener('keydown',key);
    ov.querySelectorAll('.heist-pad button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(+b.dataset.k)}));
    function finish(ok,msg){done=true;document.removeEventListener('keydown',key);const box=q('.chase-box');box.classList.add(ok?'won':'lost');
      q('#hT').textContent=ok?'Gelukt!':'Alarm!';q('#hP').textContent=msg;cells.forEach(c=>c.classList.remove('hide'));
      (ok?SFX.win(3):SFX.lose());const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);
      setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok)},220)},1500)}
    setTimeout(start,P.peek?P.peek:400);
  });
}
