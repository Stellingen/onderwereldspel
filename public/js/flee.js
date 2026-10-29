// Vluchtspel: druk op het juiste moment als de wijzer in het groene gat staat.
// Raak = je rent verder richting de steeg. Mis = de agent komt dichterbij.
// Moeilijkheid komt uit FLEE_LEVELS (data.js); Conditie en Snelheid uit de training maken het makkelijker.
function fleeParams(level){
  const L=FLEE_LEVELS[level]||FLEE_LEVELS[2],k=(S.skills&&S.skills.conditie)||0,sp=(S.skills&&S.skills.speed)||0;
  return {level,label:L.label,hits:L.hits,miss:L.miss,time:L.time,
    zone:Math.min(.42,L.zone*(1+k*.04)),speed:L.speed*(1-sp*.03)};
}
function fleeGame(level){
  return new Promise(resolve=>{
    const P=fleeParams(level);window.__chase=true;
    const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ov=document.createElement('div');ov.className='chase-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','chT');
    ov.innerHTML=`<div class="chase-box"><div class="siren"></div>
      <div class="chase-head"><h2 id="chT">Rennen!</h2><span class="tag lvl${level}">Vluchten: ${P.label}</span></div>
      <p class="chase-p">Druk op <b>Nu!</b> (of de spatiebalk) als de wijzer in het groene gat staat. Haal ${P.hits}× raak voordat de agent je inhaalt.</p>
      <div class="chase-track"><div class="ct-road"></div><div class="ct-exit">Steeg</div><div class="ct-you" id="chYou"></div><div class="ct-cop" id="chCop"></div></div>
      <div class="chase-bar" id="chBar"><div class="ch-zone" id="chZone"></div><div class="ch-mark" id="chMark"></div></div>
      <div class="chase-time"><i id="chTime"></i></div>
      <div class="chase-info"><span id="chHits">Raak 0/${P.hits}</span><span id="chMiss"></span></div>
      <button class="btn xl chase-go" id="chGo">Nu!</button></div>`;
    document.body.appendChild(ov);
    const q=id=>ov.querySelector('#'+id);
    let hits=0,miss=0,done=false,last=0,z0=0;
    const t0=performance.now(),dur=P.time*1000;
    const placeZone=()=>{z0=.08+Math.random()*(.84-P.zone);const z=q('chZone');z.style.left=(z0*100)+'%';z.style.width=(P.zone*100)+'%'};
    const youX=()=>12+hits/P.hits*70, copX=()=>Math.max(2,youX()-14*(1-miss/(P.miss+1)));
    const drawPos=()=>{q('chYou').style.left=youX()+'%';q('chCop').style.left=copX()+'%';
      q('chHits').textContent='Raak '+hits+'/'+P.hits;
      q('chMiss').innerHTML='Missers over: '+(P.miss-miss<0?'0':'<b>'+'●'.repeat(Math.max(0,P.miss-miss+1))+'</b>'+'○'.repeat(Math.min(P.miss+1,miss)))};
    placeZone();drawPos();
    let mx=0;
    const frame=t=>{if(done)return;const el=(t-t0);
      const ph=((el/1000)*P.speed)%2;mx=ph<1?ph:2-ph;q('chMark').style.left=(mx*100)+'%';
      q('chTime').style.width=Math.max(0,100-el/dur*100)+'%';
      if(el>=dur)return finish(false,'Te laat. De agent heeft je ingehaald.');
      requestAnimationFrame(frame)};
    const flash=c=>{const b=q('chBar');b.classList.remove('hit','miss');void b.offsetWidth;b.classList.add(c)};
    const press=()=>{if(done)return;const n=performance.now();if(n-last<160)return;last=n;
      if(mx>=z0&&mx<=z0+P.zone){hits++;flash('hit');if(hits>=P.hits){drawPos();return finish(true,'Je schiet de steeg in. Weg ben je.')}placeZone()}
      else{miss++;flash('miss');if(miss>P.miss){drawPos();return finish(false,'De agent grijpt je bij je jas.')}}
      drawPos()};
    const key=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();press()}};
    function finish(ok,msg){done=true;document.removeEventListener('keydown',key);
      const box=ov.querySelector('.chase-box');box.classList.add(ok?'won':'lost');
      q('chT').textContent=ok?'Ontkomen!':'Gepakt!';ov.querySelector('.chase-p').textContent=msg;
      const go=q('chGo');go.textContent=ok?'Doorgaan':'Naar de cel';go.onclick=()=>{ov.remove();window.__chase=false;resolve(ok)};go.focus()}
    q('chGo').onclick=press;q('chBar').addEventListener('pointerdown',e=>{e.preventDefault();press()});
    document.addEventListener('keydown',key);
    setTimeout(()=>q('chGo').focus(),30);
    if(reduce){/* geen beweging: wijzer stapt langzaam */}
    requestAnimationFrame(frame);
  });
}
