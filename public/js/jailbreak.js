// Bajes-ontsnapspel: ontsnappen is geen dobbelsteen maar een spel in vier fases, na een korte filmpje-intro.
//  1. De tralies: vijl in het ritme (druk als de naald in het groene stuk staat). Mis je, dan maak je lawaai; komt de
//     bewaker langs, dan lig je stil. Te veel lawaai = de bewaker hoort je.
//  2. De gang (van opzij): sluip van dekking naar dekking. Een bewaker op de loopbrug kijkt afwisselend weg en de gang in,
//     een camera wijst om de beurt naar links of rechts. Een steen gooien leidt de bewaker af. Altijd te halen: elk stuk
//     zonder dekking past in één keer wegkijken (jbGang in jb-core.js, getest met een bot).
//  3. De sleutels: pak de sleutelbos van de slapende nachtwaker als hij diep slaapt, en kies de sleutel die bij de deur past.
//  4. De muur: klim met links en rechts om de beurt. Het zoeklicht zwaait over de muur: zit het op jou, dan stilhouden.
//     Wacht je te lang, dan zakt je grip en glijd je terug.
// Moeilijkheid (jbParams): uit escChance() (lidmaatschap, familie, outfit 'esc'), de straf die nog over is en je rang
// (hoe hoger je staat, hoe zwaarder je bewaakt wordt). Een betere
// kans geeft meer ruimte (bredere groene zone, kortere kegels, meer stappen, trager zoeklicht) in plaats van een gok.
// jailBreakGame(P) geeft een Promise met true (ontsnapt) of false (gepakt). Tijdens het spel staat S.pendingEsc: wie
// ververst of het venster sluit, is betrapt (zie escFail).

// ---------- moeilijkheid ----------
const JB_LV=['','Makkelijk','Te doen','Lastig','Zwaar','Bijna onmogelijk'];
// ch/left optioneel (tests): kans zoals escChance() en resterende straf in seconden
function jbParams(ch,left){if(ch==null)ch=typeof escChance==='function'?escChance():.35;const ease=Math.max(0,Math.min(1,(ch-.25)/.5));
 if(left==null)left=Math.max(0,((S.jailUntil||0)-now())/1000);const long=Math.max(0,Math.min(1,(left-60)/540));
// rang: een rookie zit in een politiecel met één bewaker, een peetvader in de zwaarst bewaakte vleugel.
 // Rookie ±0,25 makkelijker dan vroeger, Peetvader ±0,15 zwaarder (zelfde kans en straf).
 const rk=typeof rankIdx==='function'&&typeof S!=='undefined'&&S?Math.min(1,rankIdx(S.xp||0)/(RANKS.length-1)):.5;
 const d=Math.max(0,Math.min(1,(1-ease)*.5+long*.2+rk*.4-.1)),lv=Math.min(5,1+Math.floor(d*4.99));
 return {d,lv,label:JB_LV[lv],
  // fase 1: breedte groene zone, slingersnelheid (rondes per seconde), slagen per tralie, lawaai per misser, hoe snel lawaai zakt,
  // om de hoeveel seconden de bewaker langskomt en hoe lang hij blijft
  zone:.3-.16*d,swing:.62+.5*d,hits:3+Math.round(d*2),noiseMiss:24+18*d,decay:11-5*d,guardEvery:6.5-2.2*d,guardDur:2.1+.9*d,
  // fase 2: welke gang, reikwijdte van de kegels, hoeveel stappen extra boven de kortste route, volgende stap vooraf tonen
  map:d<.34?0:d<.67?1:2,range:d<.67?2:3+(d>.88?1:0),slack:2-.75*d,preview:d<.5,
  // fase 3: hoogte per stap (%), periode van het zoeklicht (s), breedte van de lichtbundel, terugglijden
  per:8.2-2.6*d,sweep:4.6-1.7*d,beam:.2+.08*d,slip:5+4*d,grip:1.9-.6*d}}

// ---------- fase 2: de gang ----------
// JB_MAPS, jbMap, jbGuard, jbCone, jbSeen, jbStep, jbSolve en jbPath staan in jb-core.js (ook gebruikt door de voorpagina).

// ---------- mislukt ----------
// Zelfde straf als vroeger: +30 seconden (max 11 minuten). Ook als je ververst of weggaat tijdens een poging.
function escFail(why,quiet){S.pendingEsc=null;if(!inJail()){save();return}const left=Math.ceil((S.jailUntil-now())/1000),nl=Math.max(left,Math.min(660,left+30));
 S.jailUntil=now()+nl*1000;S.lastSentence=Math.max(S.lastSentence||0,nl);S.stats.escFail=(S.stats.escFail||0)+1;
 log('Ontsnapping mislukt'+(why?': '+why:''),'bad');if(!quiet)toast('Betrapt. +30s straf','bad');save()}

// ---------- het spel ----------
function jailBreakGame(P){
 return new Promise(resolve=>{
  P=P||jbParams();if(!P.seed)P.seed=1+(Math.random()*1e9|0);window.__chase=true;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const doll=()=>typeof dollSvg==='function'&&typeof fitS==='function'?dollSvg(fitS().wear,{label:'Jij'}):'';
  const ov=document.createElement('div');ov.className='chase-ov jb-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','jbT');
  ov.innerHTML=`<div class="jb-box lv${P.lv}">
    <div class="jb-top"><div class="jb-tt"><h2><span id="jbT">Ontsnappen</span><span class="jb-lv lv${P.lv}">${P.label}</span></h2><p id="jbSub">Nacht in de bajes</p></div>
     <div class="jb-steps" aria-label="Fases"><i data-s="1">1<small>Tralies</small></i><i data-s="2">2<small>Gang</small></i><i data-s="3">3<small>Sleutels</small></i><i data-s="4">4<small>Muur</small></i></div></div>
    <div class="jb-stage" id="jbStage"></div>
    <div class="jb-help" id="jbHelp"></div>
    <div class="jb-ctl" id="jbCtl"></div></div>`;
  document.body.appendChild(ov);
  const q=id=>ov.querySelector('#'+id),stage=q('jbStage'),help=q('jbHelp'),ctl=q('jbCtl');
  const st={ph:0,intro:false,done:false,res:null,why:'',t:0};let raf=0,last=0,loop=null,keyH=null,closed=false,timers=[];
  const later=(f,ms)=>{const id=setTimeout(()=>{if(!closed)f()},ms);timers.push(id);return id};
  const sfx=(n,a)=>{try{SFX[n](a)}catch(e){}};
  const steps=n=>ov.querySelectorAll('.jb-steps i').forEach(i=>{const s=+i.dataset.s;i.className=s<n?'ok':s===n?'on':''});
  const frame=now_=>{if(closed)return;const dt=Math.min(.05,Math.max(0,(now_-last)/1000));last=now_;st.t+=dt;if(loop)loop(dt);raf=requestAnimationFrame(frame)};
  const run=f=>{loop=f;last=performance.now()};
  const setKeys=f=>{keyH=f};
  const onKey=e=>{if(e.repeat&&e.code!=='Space')return;if(keyH&&keyH(e)!==false){e.preventDefault()}};
  document.addEventListener('keydown',onKey);

  // ===== intro: de cel bij nacht =====
  function cutscene(){steps(0);q('jbSub').textContent='Nacht in de bajes';help.innerHTML='<span class="jb-skip">Tik of druk op spatie om door te gaan</span>';ctl.innerHTML='';
   stage.innerHTML=`<div class="jb-cut ${reduce?'still':''}"><div class="jbc-win"><i></i><i></i><i></i></div><div class="jbc-moon"></div>
     <div class="jbc-bunk"></div><div class="jbc-you">${doll()}</div><div class="jbc-spoon"></div>
     <div class="jbc-bars">${'<i></i>'.repeat(7)}</div><div class="jbc-guard"><i class="jbc-torch"></i></div>
     <div class="jbc-txt"><p class="l1">02:47. De bewaker loopt zijn ronde.</p><p class="l2">Onder je matras: een geslepen lepel.</p><p class="l3">Nu of nooit.</p></div></div>`;
   const go=()=>{if(st.ph!==0)return;phase1()};setKeys(e=>{if(e.code==='Space'||e.code==='Enter'){go();return}return false});
   stage.onclick=go;later(go,reduce?1600:3900)}

  // ===== uitleg voor elke fase =====
  function intro(n,title,txt,start){st.intro=true;steps(n);q('jbSub').textContent='Fase '+n+' van 4 · '+title;
   const box=document.createElement('div');box.className='jb-intro';box.innerHTML=`<span class="label">Fase ${n} van 4</span><h3>${title}</h3><p>${txt}</p><button class="btn" id="jbGo">Begin</button><small>of druk op spatie</small>`;
   stage.appendChild(box);const go=()=>{if(!st.intro)return;st.intro=false;box.remove();start()};box.querySelector('#jbGo').onclick=e=>{e.stopPropagation();go()};
   setKeys(e=>{if(e.code==='Space'||e.code==='Enter'){go();return}return false});st.go=go}

  // ===== fase 1: de tralies =====
  function phase1(){st.ph=1;stage.onclick=null;
   const need=3*P.hits;let cut=0,noise=0,p=0,zc=.5,cool=0,guard=0,gNext=P.guardEvery*.8,warn=false,flash=0,stroke=0;
   stage.innerHTML=`<div class="jb-p1"><div class="jb-hall"><div class="jb-tl"></div><div class="jb-gd" id="jbGd"><i class="jb-tb"></i></div><span class="jb-warn" id="jbWarn">Voetstappen…</span></div>
     <div class="jb-cell"><div class="jb-bars">${[0,1,2].map(i=>`<div class="jb-bar" data-b="${i}"><i class="jb-cut" style="--c:0"></i></div>`).join('')}</div><div class="jb-file" id="jbFile"></div></div>
     <div class="jb-meters"><div class="jb-rh"><span class="label">Ritme</span><div class="jb-track"><i class="jb-zone" id="jbZone"></i><i class="jb-needle" id="jbNeedle"></i></div></div>
      <div class="jb-noise"><span class="label">Lawaai</span><div class="jb-nbar"><i id="jbNoise"></i></div></div></div></div>`;
   help.innerHTML='<b>Vijl</b> (spatie) als de naald in het <b class="g">groen</b> staat. Bewaker bij je cel: <b>niks doen</b>.';
   ctl.innerHTML='<button class="jb-b jb-big" id="jbFileBtn">Vijl</button>';
   const Z=q('jbZone'),N=q('jbNeedle'),NB=q('jbNoise'),GD=q('jbGd'),WN=q('jbWarn'),F=q('jbFile');
   const place=()=>{zc=P.zone/2+.04+Math.random()*(1-P.zone-.08);Z.style.left=((zc-P.zone/2)*100)+'%';Z.style.width=(P.zone*100)+'%'};place();
   const bar=()=>Math.min(2,Math.floor(cut/P.hits));
   // een tik wordt beoordeeld op wat je zag: het scherm loopt op een telefoon ±50-60 ms achter, dus we kijken iets terug in de tijd
   // (en een fractie ervoor), met wat extra speling bij touch
   const pAt=t=>(Math.sin(t*Math.PI*2*P.swing)+1)/2;
   const inZone=src=>{const touch=src==='touch',lag=touch?.06:.015,g=touch?.025:.008;return [0,.035,.07].some(k=>Math.abs(pAt(st.t-lag-k*(touch?1:.4))-zc)<=P.zone/2+g)};
   const hit=src=>{if(st.done||st.intro||cool>0)return;cool=.2;stroke=.22;
    if(guard>0){noise+=70;flash=1;sfx('lose');help.innerHTML='<b class="r">De bewaker staat voor je cel!</b> Niet vijlen als hij er is.'}
    else if(inZone(src)){cut++;noise=Math.max(0,noise+4);sfx('card');const b=Math.min(2,Math.floor((cut-1)/P.hits));
     const el=stage.querySelector(`.jb-bar[data-b="${b}"]`);el.querySelector('.jb-cut').style.setProperty('--c',((cut-b*P.hits)/P.hits).toFixed(3));if(cut%P.hits===0){el.classList.add('done');sfx('pop')}
     place();if(cut>=need){win1();return}}
    else{noise+=P.noiseMiss;flash=.6;sfx('tick');stage.classList.remove('jb-shake');void stage.offsetWidth;stage.classList.add('jb-shake')}
    if(noise>=100)fail('De bewaker hoorde het vijlen.')};
   q('jbFileBtn').addEventListener('pointerdown',e=>{e.preventDefault();hit(e.pointerType==='mouse'?'mouse':'touch')});
   const tapStage=e=>{if(e.target.closest('.jb-intro'))return;e.preventDefault();hit(e.pointerType==='mouse'?'mouse':'touch')};stage.addEventListener('pointerdown',tapStage);
   const win1=()=>{stage.removeEventListener('pointerdown',tapStage);loop=null;sfx('win',1);stage.querySelector('.jb-cell').classList.add('open');help.innerHTML='<b class="g">De tralies zijn door.</b>';
    later(phase2,reduce?600:1200)};
   intro(1,'De tralies','Vijl drie tralies door. Druk als de naald in het groene stuk staat. Hoor je voetstappen? Stop tot de bewaker weg is.',()=>{
    setKeys(e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='ArrowUp'||e.code==='KeyF'){hit('key');return}return false});
    run(dt=>{if(st.done)return;p=(Math.sin(st.t*Math.PI*2*P.swing)+1)/2;cool=Math.max(0,cool-dt);stroke=Math.max(0,stroke-dt);flash=Math.max(0,flash-dt*2);
     noise=Math.max(0,noise-P.decay*dt);
     if(guard>0){guard-=dt;if(guard<=0){gNext=P.guardEvery*(.75+Math.random()*.5);GD.classList.remove('on');WN.classList.remove('on')}}
     else{gNext-=dt;if(gNext<1.1&&!warn){warn=true;WN.classList.add('on');sfx('tick')}if(gNext<=0){warn=false;guard=P.guardDur;GD.classList.add('on')}}
     N.style.left=(p*100)+'%';N.classList.toggle('in',Math.abs(p-zc)<=P.zone/2);NB.style.width=Math.min(100,noise)+'%';NB.className=noise>66?'hot':noise>33?'warm':'';
     F.style.setProperty('--b',bar());F.style.setProperty('--y',stroke>0?Math.sin(stroke/.22*Math.PI):0);stage.style.setProperty('--fl',flash.toFixed(2))})});
   st.p1=()=>({cut,need,noise,p,zc,guard,zone:P.zone});st.p1hit=hit}

  // ===== fase 2: de gang, van opzij. Sluip van dekking naar dekking (rekenwerk in jb-core.js: jbGang*) =====
  function phase2(){st.ph=2;loop=null;stage.onclick=null;
   const G=jbGang(P.d,P.seed),s=jbGangState(G),gx=G.g.x,beamA=gx-G.g.reach;let keyL=0,keyR=0,btn=0,stones=G.stones,ended=false,camX=0;
   const zL=G.cam?jbGangZone(G,'L'):null,zR=G.cam?jbGangZone(G,'R'):null;
   const doors=Array.from({length:9},(_,i)=>{const x=10+i*9.5;return G.covers.some(c=>Math.abs(c.x-x)<6)||x>gx-6?'':`<i class="jz-door" style="--x:${x}"><b>${String(14+i*2).padStart(3,'0')}</b></i>`}).join('');
   const cov=G.covers.map(c=>`<div class="jz-c k-${c.k}" style="--x:${c.x}"></div>`).join('');
   const mini=G.covers.map(c=>`<i class="mc" style="--a:${c.x-c.w/2};--b:${c.x+c.w/2}"></i>`).join('');
   stage.innerHTML=`<div class="jb-p2g">
     <div class="jz-hud"><span class="jz-st" id="jgEye"><i class="jz-ic"></i><b></b></span>${G.cam?'<span class="jz-st" id="jgCamH"><i class="jz-ic cam"></i><b></b></span>':''}
      <span class="jz-tm"><span class="label">Celtelling</span><b id="jbLeft"></b></span></div>
     <div class="jz-view" id="jgView"><div class="jz-world" id="jgW" style="--L:${G.L}">
      <div class="jz-wall">${doors}<i class="jz-lamp" style="--x:22"></i><i class="jz-lamp" style="--x:60"></i></div><div class="jz-floor"></div>
      <div class="jz-walk" style="--x:${gx-6}"></div>
      <div class="jz-exit" style="--x:${G.exit}"><span>Post</span></div>
      ${G.cam?`<div class="jz-cz" id="jgZL" style="--a:${zL[0]};--b:${zL[1]}"></div><div class="jz-cz" id="jgZR" style="--a:${zR[0]};--b:${zR[1]}"></div><div class="jz-dode" style="--x:${G.cam.x}"></div><div class="jz-cam" id="jgCam" style="--x:${G.cam.x}"><i></i></div>`:''}
      <div class="jz-beam" id="jgBeam" style="--a:${beamA};--b:${G.safeFrom};--g:${gx-1.5}"></div>
      <div class="jz-guard" id="jgGuard" style="--x:${gx}"><span class="jz-gb"></span><span class="jz-q" id="jgQ"></span></div>
      <div class="jz-you" id="jgYou">${doll()}</div>${cov}
     </div><div class="jz-vig" id="jgVig"></div></div>
     <div class="jz-mini" aria-hidden="true"><i class="mb" id="jgMB" style="--a:${beamA};--b:${G.safeFrom}"></i>${G.cam?`<i class="mz" id="jgML" style="--a:${zL[0]};--b:${zL[1]}"></i><i class="mz" id="jgMR" style="--a:${zR[0]};--b:${zR[1]}"></i>`:''}${mini}<i class="me" style="--a:${G.exit-2};--b:100"></i><i class="my" id="jgMY"></i></div></div>`;
   help.innerHTML='Houd <b>Sluip</b> vast om te lopen (of →). Kijkt er iets <b class="y">jouw kant op</b>, sta dan achter iets.';
   ctl.innerHTML=`<div class="jz-ctl"><button class="jb-b" id="jgBack" aria-label="Terug"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>
     <button class="jb-b jb-big" id="jgGo">Sluip <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>
     <button class="jb-b jz-stone" id="jgStone">Steen <b id="jgStN">${stones}</b></button></div>`;
   const V=q('jgView'),W=q('jgW'),Y=q('jgYou'),B=q('jgBeam'),GD=q('jgGuard'),QQ=q('jgQ'),EY=q('jgEye'),CH=q('jgCamH'),CM=q('jgCam'),VG=q('jgVig'),MB=q('jgMB'),MY=q('jgMY'),ZL=q('jgZL'),ZR=q('jgZR'),ML=q('jgML'),MR=q('jgMR');
   let u=8,VW=50;
   const fit=()=>{const r=V.getBoundingClientRect();VW=r.width<520?44:r.width<760?58:66;u=r.width/VW;W.style.setProperty('--u',u+'px')};fit();
   const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(V);st.ro=ro;
   const hold=(el,v)=>{const on=e=>{e.preventDefault();btn=v;el.classList.add('on')},off=()=>{if(btn===v)btn=0;el.classList.remove('on')};
    el.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,off))};
   hold(q('jgGo'),1);hold(q('jgBack'),-1);
   // op de telefoon: ook ergens in de gang vasthouden = sluipen
   V.addEventListener('pointerdown',e=>{if(e.target.closest('.jb-intro'))return;e.preventDefault();btn=1});['pointerup','pointercancel','pointerleave'].forEach(n=>V.addEventListener(n,()=>{if(btn===1)btn=0}));
   const stone=()=>{if(st.done||st.intro||ended||stones<=0)return;stones--;q('jgStN').textContent=stones;if(!stones)q('jgStone').disabled=true;
    jbGangDistract(G,s);sfx('tick');const pb=document.createElement('i');pb.className='jz-pebble';pb.style.setProperty('--x',Math.min(gx+8,99));W.appendChild(pb);later(()=>pb.remove(),900)};
   q('jgStone').addEventListener('click',stone);
   const ku=e=>{const k=e.code;if(k==='ArrowRight'||k==='KeyD')keyR=0;if(k==='ArrowLeft'||k==='KeyA')keyL=0};document.addEventListener('keyup',ku);
   const blur=()=>{keyL=keyR=btn=0};window.addEventListener('blur',blur);
   st.p2off=()=>{document.removeEventListener('keyup',ku);window.removeEventListener('blur',blur);if(ro)ro.disconnect();st.ro=null};
   const GS={away:['Kijkt weg','ok'],turn:['Draait om!','warn'],look:['Kijkt!','bad'],back:['Draait weg','warn']};
   let lastG='',lastC='',walkT=0;
   const draw=(dt)=>{const x=s.x,hid=jbGangHid(G,x),seen=jbGangSeen(G,s,x);
    camX=Math.max(0,Math.min(G.L-VW,x-VW*.38));W.style.transform=`translateX(${(-camX*u).toFixed(1)}px)`;
    const mv=(keyR||btn>0)?1:(keyL||btn<0)?-1:0;walkT=mv?walkT+dt:0;
    Y.style.setProperty('--x',x.toFixed(2));Y.classList.toggle('hid',hid);Y.classList.toggle('walk',!!mv);Y.classList.toggle('seen',seen);
    Y.classList.toggle('low',hid&&G.covers.some(c=>c.k==='kar'&&Math.abs(x-c.x)<=c.w/2));
    if(s.gs!==lastG){lastG=s.gs;const [t,c]=GS[s.gs];EY.className='jz-st '+c;EY.querySelector('b').textContent=t;GD.dataset.s=s.gs;B.dataset.s=s.gs;MB.dataset.s=s.gs;if(s.gs==='turn')sfx('tick')}
    QQ.textContent=s.dis>0?'?':s.gs==='turn'?'!':'';
    if(G.cam){const blink=s.ct<G.cam.blink;const k=s.cs+(blink?'b':'');if(k!==lastC){lastC=k;CH.className='jz-st '+(blink?'warn':'cam');CH.querySelector('b').textContent=blink?'Camera draait':'Camera '+(s.cs==='L'?'links':'rechts');
      CM.dataset.s=s.cs;ZL.classList.toggle('on',s.cs==='L');ZR.classList.toggle('on',s.cs==='R');ML.classList.toggle('on',s.cs==='L');MR.classList.toggle('on',s.cs==='R');ZL.classList.toggle('bl',blink);ZR.classList.toggle('bl',blink)}}
    MY.style.setProperty('--x',x.toFixed(1));VG.style.opacity=(s.sus/100).toFixed(2);
    const left=Math.max(0,G.time-s.t);q('jbLeft').textContent=Math.ceil(left)+'s';q('jbLeft').className=left<8?'hot':left<16?'warm':''};
   const win2=()=>{ended=true;loop=null;st.p2off();sfx('win',1);help.innerHTML='<b class="g">Je bent bij de bewakerspost.</b>';later(phase3,reduce?500:900)};
   draw(0);
   intro(2,'De gang','Sluip van dekking naar dekking. Kijkt de bewaker of de camera jouw kant op, sta dan verstopt. Recht onder de camera ziet hij je niet. Een steen leidt de bewaker even af.',()=>{
    setKeys(e=>{const k=e.code;if(k==='ArrowRight'||k==='KeyD'){keyR=1;return}if(k==='ArrowLeft'||k==='KeyA'){keyL=1;return}if(k==='Space'||k==='KeyE'){stone();return}return false});
    run(dt=>{if(st.done||ended)return;const mv=(keyR||btn>0)?1:(keyL||btn<0)?-1:0;const r=jbGangTick(G,s,dt,mv);draw(dt);
     if(r==='out'){win2();return}
     if(r==='caught'){st.p2off();const z=G.cam?jbGangZone(G,s.cs):null,byCam=z&&s.x>=z[0]&&s.x<=z[1]&&s.gs!=='look';Y.classList.add('caught');fail(byCam?'De camera zag je in de gang.':'De bewaker zag je in de gang.');return}
     if(s.t>=G.time){st.p2off();fail('Celtelling: ze zagen dat je cel leeg was.')}})});
   st.p2=()=>({x:s.x,t:s.t,gs:s.gs,gt:s.gt,cs:s.cs,ct:s.ct,sus:s.sus,hid:jbGangHid(G,s.x),time:G.time,stones,covers:G.covers,cam:G.cam,g:G.g,exit:G.exit,safeFrom:G.safeFrom,v:G.v});
   st.p2set=(v)=>{btn=v};st.p2stone=stone;st.G=G;st.s=s}

  // ===== fase 3: de sleutels van de slapende nachtwaker =====
  function phase3(){st.ph=3;loop=null;
   const Z=jbSleep(P.d,P.seed),s=jbSleepState(Z),K=jbKeys(Z);let hold=0,keys=false,kt=Z.keyTime,ended=false;
   const keySvg=(k,i)=>`<svg viewBox="0 0 60 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#c9ced6" stroke-width="4"/><path d="M21 10h33v4h-4v5h-4v-5h-4v6h-4v-6h-17z" fill="#c9ced6"/></svg>`;
   stage.innerHTML=`<div class="jb-pk"><div class="jn-room" id="jkRoom">
      <div class="jn-win"><i></i></div><div class="jn-mon"><i></i><i></i></div><div class="jn-clock">03:12</div>
      <div class="jn-desk"></div><div class="jn-cup"></div>
      <div class="jn-guard" id="jkG"><div class="jn-chair"></div><div class="jn-body"><i class="jn-belt"></i></div><div class="jn-head"><i class="jn-cap"></i><i class="jn-eye"></i></div><div class="jn-ring" id="jkRing">${'<i></i>'.repeat(Z.keys)}</div></div>
      <div class="jn-zz" id="jkZ"><i>Z</i><i>z</i><i>z</i></div>
      <div class="jn-arm" id="jkArm"><i class="jn-hand"></i></div>
      <div class="jn-door" id="jkDoor"><span class="jn-sign">Binnenplaats</span><span class="jn-tag" style="--c:${JB_KEYC[K.door.c][1]}">${K.door.n}</span></div>
     </div>
     <div class="jn-meters"><div class="jn-ss" id="jkSs"><i></i><b></b></div>
      <div class="jn-bar"><span class="label">Hand</span><div><i id="jkP"></i></div></div><div class="jn-bar wake"><span class="label">Wakker</span><div><i id="jkW"></i></div></div></div></div>`;
   help.innerHTML='Houd <b>Pak</b> vast als hij <b class="g">diep slaapt</b>. Laat los als hij <b class="y">woelt</b>.';
   ctl.innerHTML='<button class="jb-b jb-big" id="jkHold">Pak de sleutels</button>';
   const HB=q('jkHold'),A=q('jkArm'),GG=q('jkG'),SS=q('jkSs'),PB=q('jkP'),WB=q('jkW'),ZZ=q('jkZ');
   const on=e=>{e.preventDefault();hold=1;HB.classList.add('on')},off=()=>{hold=0;HB.classList.remove('on')};
   HB.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(n=>HB.addEventListener(n,off));
   const ku=e=>{if(e.code==='Space'||e.code==='ArrowUp'||e.code==='Enter')hold=0};document.addEventListener('keyup',ku);const blur=()=>{hold=0};window.addEventListener('blur',blur);
   const offK=()=>{document.removeEventListener('keyup',ku);window.removeEventListener('blur',blur)};st.p3off=offK;
   const SL={deep:['Diep in slaap','ok'],stir:['Woelt… laat los','warn'],light:['Slaapt licht: niks doen','bad']};let lastS='';
   const draw=()=>{if(s.ss!==lastS){lastS=s.ss;const [t,c]=SL[s.ss];SS.className='jn-ss '+c;SS.querySelector('b').textContent=t;GG.dataset.s=s.ss;ZZ.dataset.s=s.ss;if(s.ss==='stir')sfx('tick')}
    A.style.setProperty('--p',(s.prog/100).toFixed(3));A.classList.toggle('mv',!!hold);PB.style.width=s.prog+'%';WB.style.width=Math.min(100,s.wake)+'%';WB.className=s.wake>60?'hot':s.wake>25?'warm':'';
    q('jkRoom').classList.toggle('risk',!!hold&&s.ss==='light')};
   draw();
   // de sleutelbos is binnen: kies de sleutel die bij het bordje op de deur past
   const pick=()=>{keys=true;hold=0;offK();sfx('pop');q('jkRing').classList.add('got');
    help.innerHTML=`Welke sleutel past op de deur? Zoek <b>${JB_KEYC[K.door.c][0]} ${K.door.n}</b>.`;
    ctl.innerHTML=`<div class="jn-keys" role="group" aria-label="Sleutelbos">${K.keys.map((k,i)=>`<button class="jn-key" data-i="${i}" aria-label="Sleutel ${JB_KEYC[k.c][0]} ${k.n}">${keySvg(k,i)}<span class="jn-tag" style="--c:${JB_KEYC[k.c][1]}">${k.n}</span></button>`).join('')}</div><div class="jn-kt"><i id="jkKt"></i></div>`;
    q('jkDoor').classList.add('on');
    ctl.querySelectorAll('.jn-key').forEach(b=>b.addEventListener('click',()=>{if(st.done||ended)return;const k=K.keys[+b.dataset.i];
     if(k.ok){ended=true;loop=null;b.classList.add('ok');q('jkDoor').classList.add('open');sfx('win',1);help.innerHTML='<b class="g">Klik.</b> De deur naar de binnenplaats is open.';later(phase4,reduce?500:1000);return}
     b.disabled=true;b.classList.add('no');s.wake+=42;sfx('lose');GG.classList.remove('jolt');void GG.offsetWidth;GG.classList.add('jolt');
     if(s.wake>=100){fail('Het gerammel maakte de nachtwaker wakker.')}}));
    setKeys(()=>false);
    run(dt=>{if(st.done||ended)return;kt-=dt;s.wake=Math.max(0,s.wake-dt*6);WB.style.width=Math.min(100,s.wake)+'%';const kk=q('jkKt');if(kk){kk.style.width=Math.max(0,kt/Z.keyTime*100)+'%';kk.className=kt<2.5?'hot':''}
     if(kt<=0)fail('Je stond te lang te rommelen bij de deur.')})};
   intro(3,'De sleutels','De nachtwaker slaapt. Houd Pak vast als hij diep slaapt, laat los als hij woelt. Kies daarna de sleutel die bij de deur past.',()=>{
    setKeys(e=>{if(e.code==='Space'||e.code==='ArrowUp'||e.code==='Enter'){hold=1;return}return false});
    run(dt=>{if(st.done||ended||keys)return;const r=jbSleepTick(Z,s,dt,hold);draw();
     if(r==='woke'){offK();GG.dataset.s='awake';fail('De nachtwaker werd wakker.');return}if(r==='got')pick()})});
   st.p3=()=>({ss:s.ss,st:s.st,prog:s.prog,wake:s.wake,keys,door:K.door,keyList:K.keys,kt});st.p3hold=v=>{hold=v?1:0};st.p3key=i=>{const b=ctl.querySelector(`.jn-key[data-i="${i}"]`);if(b)b.click()}}

  // ===== fase 4: de muur =====
  function phase4(){st.ph=4;if(st.ro){st.ro.disconnect();st.ro=null}
   let h=0,lastSide=0,idle=0,bx=0,dir=1,seen=0,cool=0,slipT=0;const sweep=P.sweep;
   stage.innerHTML=`<div class="jb-p3"><div class="jb-sky"></div><div class="jb-tower"><i class="jb-sl"></i></div><div class="jb-beam" id="jbBeam"></div>
     <div class="jb-wall"><div class="jb-wire"></div><div class="jb-climb" id="jbClimb"><span class="jb-cl">${doll()}</span></div></div>
     <div class="jb-hgt"><i id="jbH"></i><span id="jbHt">0%</span></div><div class="jb-still" id="jbStill">Stil!</div></div>`;
   help.innerHTML='<b>Links</b>, <b>rechts</b>, om de beurt (← →). In het <b class="y">zoeklicht</b>: niks doen.';
   ctl.innerHTML='<div class="jb-climbb"><button class="jb-b jb-big" data-s="-1">Links</button><button class="jb-b jb-big" data-s="1">Rechts</button></div>';
   const B=q('jbBeam'),C=q('jbClimb'),HB=q('jbH'),HT=q('jbHt'),STL=q('jbStill');
   const lit=()=>Math.abs(bx-.5)<P.beam/2+.05;
   const climb=s=>{if(st.done||st.intro||cool>0)return;cool=.09;
    if(lit()){fail('Het zoeklicht vond je op de muur.');return}
    if(s===lastSide){h=Math.max(0,h-3);sfx('tick');C.classList.remove('slip');void C.offsetWidth;C.classList.add('slip')}
    else{h=Math.min(100,h+P.per);lastSide=s;idle=0;sfx('card');C.dataset.s=s>0?'r':'l'}
    if(h>=100)win()};
   ctl.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();climb(+b.dataset.s)}));
   // tik op de linker- of rechterhelft van het beeld
   const tap=e=>{if(e.target.closest('.jb-intro'))return;e.preventDefault();const r=stage.getBoundingClientRect();climb(e.clientX-r.left<r.width/2?-1:1)};stage.addEventListener('pointerdown',tap);
   intro(4,'De muur','Klim om de beurt links en rechts. Staat het zoeklicht op je, doe dan niks. Hang je te lang stil, dan zak je terug.',()=>{
    setKeys(e=>{const k=e.code;if(k==='ArrowLeft'||k==='KeyA'){climb(-1);return}if(k==='ArrowRight'||k==='KeyD'){climb(1);return}return false});
    let ph=Math.random()*Math.PI*2;
    run(dt=>{if(st.done)return;cool=Math.max(0,cool-dt);
     // zoeklicht: heen en weer, op zware niveaus soms een onverwachte draai
     ph+=dt*Math.PI*2/sweep*(1+(P.d>.6?.35*Math.sin(st.t*.9):0));bx=.5+.62*Math.sin(ph);
     const on=lit();STL.classList.toggle('on',on);
     if(!on){idle+=dt;if(idle>P.grip&&h>0){h=Math.max(0,h-P.slip*dt);slipT=.2}}
     B.style.left=(bx*100)+'%';B.style.setProperty('--w',(P.beam*100)+'%');C.style.bottom=`calc(${h*.78}% + 6px)`;HB.style.height=h+'%';HT.textContent=Math.floor(h)+'%';
     stage.classList.toggle('jb-lit',on)})});
   const win=()=>{stage.removeEventListener('pointerdown',tap);finish(true)};
   st.p4=()=>({h,bx,lit:lit(),lastSide,per:P.per});st.p4climb=climb}

  // ===== einde =====
  function fail(why){if(st.done)return;st.why=why;finish(false)}
  function finish(ok){if(st.done)return;st.done=true;st.res=ok;loop=null;setKeys(e=>{if(e.code==='Space'||e.code==='Enter'){close();return}return false});
   const box=ov.querySelector('.jb-box');box.classList.add(ok?'won':'lost');ctl.innerHTML='';const stl=q('jbStill');if(stl)stl.remove();
   if(ok){steps(5);q('jbT').textContent='Ontsnapt!';q('jbSub').textContent='Over de muur en de nacht in';sfx('big');
    stage.innerHTML=`<div class="jb-out"><div class="jbo-sky"><i class="jbo-moon"></i></div><div class="jbo-city">${Array.from({length:14},(_,i)=>`<i style="--h:${30+((i*37)%55)}%;--d:${i*.13}s"></i>`).join('')}</div>
      <div class="jbo-wall"></div><div class="jbo-you">${doll()}</div><p class="jbo-t">Je bent eruit. Ze zoeken je nu overal.</p></div>`;help.innerHTML='Je staat op de gezochtlijst tot de politie je vindt.'}
   else{q('jbT').textContent='Gepakt!';q('jbSub').textContent=st.why||'Alarm';sfx('lose');
    stage.insertAdjacentHTML('beforeend',`<div class="jb-alarm"><b>Alarm</b><span>${st.why||''}</span></div>`);help.innerHTML='Terug je cel in, met <b class="r">30 seconden extra straf</b>.'}
   later(close,ok?2400:2000)}
  function close(){if(closed||!st.done)return;closed=true;cancelAnimationFrame(raf);if(st.p2off)st.p2off();if(st.p3off)st.p3off();timers.forEach(clearTimeout);document.removeEventListener('keydown',onKey);if(st.ro)st.ro.disconnect();
   ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(st.res===true)},220)}
  ov.addEventListener('click',e=>{if(st.done)close()});
  // test-hook (zoals ov._fl bij het vluchtspel)
  ov._jb=()=>Object.assign({ph:st.ph,intro:st.intro,done:st.done,res:st.res,why:st.why,P},st.ph===1&&st.p1?st.p1():st.ph===2&&st.p2?st.p2():st.ph===3&&st.p3?st.p3():st.ph===4&&st.p4?st.p4():{});
  ov._jbT={go:()=>st.go&&st.go(),skip:()=>{if(st.ph===0)phase1()},hit:()=>st.p1hit&&st.p1hit(),walk:v=>st.p2set&&st.p2set(v),stone:()=>st.p2stone&&st.p2stone(),hold:v=>st.p3hold&&st.p3hold(v),key:i=>st.p3key&&st.p3key(i),gang:()=>[st.G,st.s],jump:n=>{if(st.ph<=1&&!st.done){loop=null;[phase2,phase3,phase4][n-2]()}},climb:s=>st.p4climb&&st.p4climb(s)};
  last=performance.now();raf=requestAnimationFrame(frame);cutscene()})}
