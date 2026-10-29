// Vluchtspel: druk op het juiste moment als de wijzer in het groene gat staat.
// Raak = je rent verder richting de steeg. Mis = de agent komt dichterbij.
// Moeilijkheid komt uit FLEE_LEVELS (data.js); Conditie en Snelheid uit de training maken het makkelijker.
function fleeParams(level){
  const L=FLEE_LEVELS[level]||FLEE_LEVELS[2],k=(S.skills&&S.skills.conditie)||0,sp=(S.skills&&S.skills.speed)||0;
  return {level,label:L.label,hits:L.hits,miss:L.miss,time:L.time,shrink:L.shrink||1,accel:L.accel||1,drift:!!L.drift,
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
    let hits=0,miss=0,done=false,last=0,z0=0,zw=P.zone,spd=P.speed,ph0=0,tRef=0,zBase=0;
    const t0=performance.now(),dur=P.time*1000;
    const placeZone=()=>{zBase=.06+Math.random()*(.88-zw);z0=zBase;const z=q('chZone');z.style.left=(z0*100)+'%';z.style.width=(zw*100)+'%'};
    // fase loopt van 0 tot 2 (heen en terug); bij een snelheidswissel blijft de wijzer op zijn plek
    const phaseAt=t=>ph0+((t-tRef)/1000)*spd, markAt=t=>{const ph=phaseAt(t)%2;return ph<1?ph:2-ph};
    const zoneAt=t=>P.drift?Math.max(.02,Math.min(.98-zw,zBase+Math.sin(t/420)*.12)):zBase;
    const youX=()=>12+hits/P.hits*70, copX=()=>Math.max(2,youX()-14*(1-miss/(P.miss+1)));
    const drawPos=()=>{q('chYou').style.left=youX()+'%';q('chCop').style.left=copX()+'%';
      q('chHits').textContent='Raak '+hits+'/'+P.hits;
      q('chMiss').innerHTML='Missers over: '+(P.miss-miss<0?'0':'<b>'+'●'.repeat(Math.max(0,P.miss-miss+1))+'</b>'+'○'.repeat(Math.min(P.miss+1,miss)))};
    placeZone();drawPos();
    let mx=0;
    tRef=t0;
    const frame=t=>{if(done)return;const el=(t-t0);
      mx=markAt(t);q('chMark').style.left=(mx*100)+'%';
      if(P.drift){z0=zoneAt(t);q('chZone').style.left=(z0*100)+'%'}
      q('chTime').style.width=Math.max(0,100-el/dur*100)+'%';
      if(el>=dur)return finish(false,'Te laat. De agent heeft je ingehaald.');
      requestAnimationFrame(frame)};
    const flash=c=>{const b=q('chBar');b.classList.remove('hit','miss');void b.offsetWidth;b.classList.add(c)};
    const press=()=>{if(done)return;const n=performance.now();if(n-last<140)return;last=n;
      const m=markAt(n),z=P.drift?zoneAt(n):z0;
      if(m>=z&&m<=z+zw){hits++;flash('hit');if(hits>=P.hits){drawPos();return finish(true,'Je schiet de steeg in. Weg ben je.')}
        ph0=phaseAt(n);tRef=n;spd*=P.accel;zw*=P.shrink;placeZone()}
      else{miss++;flash('miss');if(miss>P.miss){drawPos();return finish(false,'De agent grijpt je bij je jas.')}}
      drawPos()};
    const key=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();press()}};
    function finish(ok,msg){done=true;document.removeEventListener('keydown',key);
      const box=ov.querySelector('.chase-box');box.classList.add(ok?'won':'lost');
      q('chT').textContent=ok?'Ontkomen!':'Gepakt!';ov.querySelector('.chase-p').textContent=msg;
      // uitslag kort tonen en daarna vanzelf sluiten (klikken mag, hoeft niet)
      const go=q('chGo');go.textContent=ok?'Ontsnapt!':'Gepakt';go.classList.add(ok?'ok':'no');
      let closed=false;const close=()=>{if(closed)return;closed=true;ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(ok)},220)};
      go.onclick=close;ov.querySelector('.chase-bar').onpointerdown=null;
      const tb=document.createElement('div');tb.className='chase-auto';ov.querySelector('.chase-box').appendChild(tb);
      (ok?SFX.win(3):SFX.lose());setTimeout(close,1500)}
    q('chGo').onclick=press;q('chBar').addEventListener('pointerdown',e=>{e.preventDefault();press()});
    document.addEventListener('keydown',key);
    setTimeout(()=>q('chGo').focus(),30);
    if(reduce){/* geen beweging: wijzer stapt langzaam */}
    requestAnimationFrame(frame);
  });
}
