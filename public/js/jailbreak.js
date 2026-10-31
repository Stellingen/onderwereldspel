// Bajes-ontsnapspel: ontsnappen is geen dobbelsteen meer maar een spel in drie fases, na een korte filmpje-intro.
//  1. De tralies: vijl in het ritme (druk als de naald in het groene stuk staat). Mis je, dan maak je lawaai; komt de
//     bewaker langs, dan lig je stil. Te veel lawaai = de bewaker hoort je.
//  2. De gang: van bovenaf, stap voor stap over een raster. Bewakers lopen hun ronde en zoeklampen draaien; sta je in
//     een lichtkegel, dan ben je gezien. Haal de deur naar de binnenplaats voor de celtelling (beperkt aantal stappen).
//  3. De muur: klim met links en rechts om de beurt. Het zoeklicht zwaait over de muur: zit het op jou, dan stilhouden.
//     Wacht je te lang, dan zakt je grip en glijd je terug.
// Moeilijkheid (jbParams): uit escChance() (lidmaatschap, familie, outfit 'esc') en de straf die nog over is. Een betere
// kans geeft meer ruimte (bredere groene zone, kortere kegels, meer stappen, trager zoeklicht) in plaats van een gok.
// jailBreakGame(P) geeft een Promise met true (ontsnapt) of false (gepakt). Tijdens het spel staat S.pendingEsc: wie
// ververst of het venster sluit, is betrapt (zie escFail).

// ---------- moeilijkheid ----------
const JB_LV=['','Makkelijk','Te doen','Lastig','Zwaar','Bijna onmogelijk'];
// ch/left optioneel (tests): kans zoals escChance() en resterende straf in seconden
function jbParams(ch,left){if(ch==null)ch=typeof escChance==='function'?escChance():.35;const ease=Math.max(0,Math.min(1,(ch-.25)/.5));
 if(left==null)left=Math.max(0,((S.jailUntil||0)-now())/1000);const long=Math.max(0,Math.min(1,(left-60)/540));
 const d=Math.max(0,Math.min(1,(1-ease)*.66+long*.34)),lv=Math.min(5,1+Math.floor(d*4.99));
 return {d,lv,label:JB_LV[lv],
  // fase 1: breedte groene zone, slingersnelheid (rondes per seconde), slagen per tralie, lawaai per misser, hoe snel lawaai zakt,
  // om de hoeveel seconden de bewaker langskomt en hoe lang hij blijft
  zone:.3-.16*d,swing:.62+.5*d,hits:3+Math.round(d*2),noiseMiss:24+18*d,decay:11-5*d,guardEvery:6.5-2.2*d,guardDur:2.1+.9*d,
  // fase 2: welke gang, reikwijdte van de kegels, hoeveel stappen extra boven de kortste route, volgende stap vooraf tonen
  map:d<.34?0:d<.67?1:2,range:d<.67?2:3+(d>.88?1:0),slack:2-.75*d,preview:d<.5,
  // fase 3: hoogte per stap (%), periode van het zoeklicht (s), breedte van de lichtbundel, terugglijden
  per:8.2-2.6*d,sweep:4.6-1.7*d,beam:.2+.08*d,slip:5+4*d,grip:1.9-.6*d}}

// ---------- fase 2: de gang ----------
// # muur · . vloer · c kratten (blokkeren zicht en doorgang) · L zoeklamp (blokkeert doorgang) · S celdeur (veilig) · E uitgang
// g: bewakers met een route (heen en terug); l: zoeklampen met hun richtingen (wisselen elke 'every' stappen)
const JB_MAPS=[
 {g:["###E###",
     "#.....#",
     "#.c.c.#",
     "#.....#",
     "##.#.##",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#c...c#",
     "#.....#",
     "###S###"],
  guards:[{p:[[1,7],[5,7]]},{p:[[5,3],[1,3]]}],lamps:[]},
 {g:["#####E#",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#.##c.#",
     "#..L..#",
     "#.c.#.#",
     "#.....#",
     "###.#.#",
     "#.....#",
     "#S#####"],
  guards:[{p:[[5,9],[2,9]]},{p:[[1,7],[3,7]]},{p:[[5,3],[1,3]]}],lamps:[{x:3,y:5,dirs:['L','U','R','D'],every:2}]},
 {g:["###E###",
     "#.....#",
     "#.#.#.#",
     "#..L..#",
     "#.#.#.#",
     "#.....#",
     "##c.c##",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#S#####"],
  guards:[{p:[[5,9],[2,9]]},{p:[[1,7],[5,7]]},{p:[[1,1],[5,1]]}],lamps:[{x:3,y:3,dirs:['D','L','U','R'],every:2}]}];
const JB_DIR={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
// route heen en terug uitschrijven tot losse vakjes
function jbRoute(p){const out=[];for(let i=0;i<p.length-1;i++){const [x1,y1]=p[i],[x2,y2]=p[i+1],dx=Math.sign(x2-x1),dy=Math.sign(y2-y1);let x=x1,y=y1;
  while(x!==x2||y!==y2){out.push([x,y]);x+=dx;y+=dy}}out.push(p[p.length-1]);
 const back=out.slice(1,-1).reverse();return out.concat(back)}
function jbMap(i,range){const M=JB_MAPS[i],H=M.g.length,W=M.g[0].length,cell=(x,y)=>x<0||y<0||x>=W||y>=H?'#':M.g[y][x];let S0=null,E0=null;
 M.g.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='S')S0=[x,y];if(c==='E')E0=[x,y]}));
 const guards=M.guards.map(g=>({route:jbRoute(g.p)}));
 let P=1;const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a*b/gcd(a,b);guards.forEach(g=>{P=lcm(P,g.route.length)});M.lamps.forEach(l=>{P=lcm(P,l.dirs.length*l.every)});
 return {W,H,cell,S:S0,E:E0,guards,lamps:M.lamps,range,P}}
const jbBlock=c=>c==='#'||c==='c'||c==='L';
// bewaker op stap t: positie en kijkrichting (de richting waarin hij loopt)
function jbGuard(g,t){const n=g.route.length,i=t%n,[x,y]=g.route[i],[nx,ny]=g.route[(i+1)%n];
 let dx=nx-x,dy=ny-y;if(!dx&&!dy){const [px,py]=g.route[(i-1+n)%n];dx=x-px;dy=y-py}return {x,y,dx,dy}}
// lichtkegel: rechtdoor tot 'range' vakjes, vanaf het tweede vakje ook één breder; muren en kratten houden hem tegen
function jbCone(m,x,y,dx,dy,r,out){for(let k=1;k<=r;k++){const cx=x+dx*k,cy=y+dy*k;if(jbBlock(m.cell(cx,cy)))break;out.add(cx+','+cy);
  if(k>=2)[[-dy,dx],[dy,-dx]].forEach(([sx,sy])=>{const ax=cx+sx,ay=cy+sy;if(!jbBlock(m.cell(ax,ay))&&!jbBlock(m.cell(x+dx*(k-1)+sx,y+dy*(k-1)+sy)))out.add(ax+','+ay)})}}
function jbSeen(m,t){const s=new Set(),gs=[];m.guards.forEach(g=>{const G=jbGuard(g,t);gs.push(G);jbCone(m,G.x,G.y,G.dx,G.dy,m.range,s)});
 m.lamps.forEach(l=>{const d=JB_DIR[l.dirs[Math.floor(t/l.every)%l.dirs.length]];jbCone(m,l.x,l.y,d[0],d[1],m.range+1,s)});return {cone:s,gs}}
// kan de speler van (x,y) op stap t naar (nx,ny)? gezien, tegen een bewaker aan of door hem heen = gepakt
function jbStep(m,x,y,nx,ny,t){const c=m.cell(nx,ny);if(jbBlock(c))return 'wall';if(c==='E')return 'out';
 const a=jbSeen(m,t),b=jbSeen(m,t+1);
 for(let i=0;i<b.gs.length;i++){const G0=a.gs[i],G1=b.gs[i];if(G1.x===nx&&G1.y===ny)return 'bump';if(G0.x===nx&&G0.y===ny&&G1.x===x&&G1.y===y)return 'bump'}
 if(c!=='S'&&b.cone.has(nx+','+ny))return 'seen';return 'ok'}
// kortste route (in stappen, wachten telt mee) met breadth-first search over (vakje, stap mod P)
function jbSolve(m,max){max=max||220;const seen=new Set(),q=[[m.S[0],m.S[1],0]];seen.add(m.S+',0');
 for(let h=0;h<q.length;h++){const [x,y,t]=q[h];if(t>=max)continue;
  for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[0,0]]){const nx=x+dx,ny=y+dy,r=jbStep(m,x,y,nx,ny,t);if(r==='out')return t+1;if(r!=='ok')continue;
   const k=nx+','+ny+','+((t+1)%m.P);if(seen.has(k))continue;seen.add(k);q.push([nx,ny,t+1])}}return 0}
// kortste route als lijst zetten [dx,dy] (voor de test-hook)
function jbPath(m,max){max=max||220;const par=new Map(),q=[[m.S[0],m.S[1],0]],k0=m.S+',0';par.set(k0,null);
 for(let h=0;h<q.length;h++){const [x,y,t]=q[h];if(t>=max)continue;const kk=x+','+y+','+(t%m.P);
  for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[0,0]]){const nx=x+dx,ny=y+dy,r=jbStep(m,x,y,nx,ny,t);
   if(r==='out'){const out=[[dx,dy]];let k=kk;while(par.get(k)){const p=par.get(k);out.unshift(p.m);k=p.k}return out}
   if(r!=='ok')continue;const k=nx+','+ny+','+((t+1)%m.P);if(par.has(k))continue;par.set(k,{k:kk,m:[dx,dy]});q.push([nx,ny,t+1])}}return null}

// ---------- mislukt ----------
// Zelfde straf als vroeger: +30 seconden (max 11 minuten). Ook als je ververst of weggaat tijdens een poging.
function escFail(why,quiet){S.pendingEsc=null;if(!inJail()){save();return}const left=Math.ceil((S.jailUntil-now())/1000),nl=Math.max(left,Math.min(660,left+30));
 S.jailUntil=now()+nl*1000;S.lastSentence=Math.max(S.lastSentence||0,nl);S.stats.escFail=(S.stats.escFail||0)+1;
 log('Ontsnapping mislukt'+(why?': '+why:''),'bad');if(!quiet)toast('Betrapt. +30s straf','bad');save()}

// ---------- het spel ----------
function jailBreakGame(P){
 return new Promise(resolve=>{
  P=P||jbParams();window.__chase=true;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const doll=()=>typeof dollSvg==='function'&&typeof fitS==='function'?dollSvg(fitS().wear,{label:'Jij'}):'';
  const ov=document.createElement('div');ov.className='chase-ov jb-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','jbT');
  ov.innerHTML=`<div class="jb-box lv${P.lv}">
    <div class="jb-top"><div class="jb-tt"><h2><span id="jbT">Ontsnappen</span><span class="jb-lv lv${P.lv}">${P.label}</span></h2><p id="jbSub">Nacht in de bajes</p></div>
     <div class="jb-steps" aria-label="Fases"><i data-s="1">1<small>Tralies</small></i><i data-s="2">2<small>Gang</small></i><i data-s="3">3<small>Muur</small></i></div></div>
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
  function intro(n,title,txt,start){st.intro=true;steps(n);q('jbSub').textContent='Fase '+n+' van 3 · '+title;
   const box=document.createElement('div');box.className='jb-intro';box.innerHTML=`<span class="label">Fase ${n} van 3</span><h3>${title}</h3><p>${txt}</p><button class="btn" id="jbGo">Begin</button><small>of druk op spatie</small>`;
   stage.appendChild(box);const go=()=>{if(!st.intro)return;st.intro=false;box.remove();start()};box.querySelector('#jbGo').onclick=e=>{e.stopPropagation();go()};
   setKeys(e=>{if(e.code==='Space'||e.code==='Enter'){go();return}return false});st.go=go}

  // ===== fase 1: de tralies =====
  function phase1(){st.ph=1;stage.onclick=null;
   const need=3*P.hits;let cut=0,noise=0,p=0,zc=.5,cool=0,guard=0,gNext=P.guardEvery*.8,warn=false,flash=0,stroke=0;
   stage.innerHTML=`<div class="jb-p1"><div class="jb-hall"><div class="jb-tl"></div><div class="jb-gd" id="jbGd"><i class="jb-tb"></i></div><span class="jb-warn" id="jbWarn">Voetstappen…</span></div>
     <div class="jb-cell"><div class="jb-bars">${[0,1,2].map(i=>`<div class="jb-bar" data-b="${i}"><i class="jb-cut" style="--c:0"></i></div>`).join('')}</div><div class="jb-file" id="jbFile"></div></div>
     <div class="jb-meters"><div class="jb-rh"><span class="label">Ritme</span><div class="jb-track"><i class="jb-zone" id="jbZone"></i><i class="jb-needle" id="jbNeedle"></i></div></div>
      <div class="jb-noise"><span class="label">Lawaai</span><div class="jb-nbar"><i id="jbNoise"></i></div></div></div></div>`;
   help.innerHTML='Druk op <b>Vijl</b> (spatie) als de naald in het <b class="g">groene stuk</b> staat. Mis je, dan maak je lawaai. Komt de bewaker langs: <b>niks doen</b>.';
   ctl.innerHTML='<button class="jb-b jb-big" id="jbFileBtn">Vijl</button>';
   const Z=q('jbZone'),N=q('jbNeedle'),NB=q('jbNoise'),GD=q('jbGd'),WN=q('jbWarn'),F=q('jbFile');
   const place=()=>{zc=P.zone/2+.04+Math.random()*(1-P.zone-.08);Z.style.left=((zc-P.zone/2)*100)+'%';Z.style.width=(P.zone*100)+'%'};place();
   const bar=()=>Math.min(2,Math.floor(cut/P.hits));
   const hit=()=>{if(st.done||st.intro||cool>0)return;cool=.2;stroke=.22;
    if(guard>0){noise+=70;flash=1;sfx('lose');help.innerHTML='<b class="r">De bewaker staat voor je cel!</b> Niet vijlen als hij er is.'}
    else if(Math.abs(p-zc)<=P.zone/2){cut++;noise=Math.max(0,noise+4);sfx('card');const b=Math.min(2,Math.floor((cut-1)/P.hits));
     const el=stage.querySelector(`.jb-bar[data-b="${b}"]`);el.querySelector('.jb-cut').style.setProperty('--c',((cut-b*P.hits)/P.hits).toFixed(3));if(cut%P.hits===0){el.classList.add('done');sfx('pop')}
     place();if(cut>=need){win1();return}}
    else{noise+=P.noiseMiss;flash=.6;sfx('tick');stage.classList.remove('jb-shake');void stage.offsetWidth;stage.classList.add('jb-shake')}
    if(noise>=100)fail('De bewaker hoorde het vijlen.')};
   q('jbFileBtn').addEventListener('pointerdown',e=>{e.preventDefault();hit()});
   const tapStage=e=>{if(e.target.closest('.jb-intro'))return;e.preventDefault();hit()};stage.addEventListener('pointerdown',tapStage);
   const win1=()=>{stage.removeEventListener('pointerdown',tapStage);loop=null;sfx('win',1);stage.querySelector('.jb-cell').classList.add('open');help.innerHTML='<b class="g">De tralies zijn door.</b> Je wringt je erdoor.';
    later(phase2,reduce?600:1200)};
   intro(1,'De tralies','Vijl drie tralies door met de lepel. Druk alleen als de naald in het groene stuk staat: elke misser maakt lawaai. Hoor je voetstappen, stop dan tot de bewaker weg is. Te veel lawaai en hij hoort je.',()=>{
    setKeys(e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='ArrowUp'||e.code==='KeyF'){hit();return}return false});
    run(dt=>{if(st.done)return;p=(Math.sin(st.t*Math.PI*2*P.swing)+1)/2;cool=Math.max(0,cool-dt);stroke=Math.max(0,stroke-dt);flash=Math.max(0,flash-dt*2);
     noise=Math.max(0,noise-P.decay*dt);
     if(guard>0){guard-=dt;if(guard<=0){gNext=P.guardEvery*(.75+Math.random()*.5);GD.classList.remove('on');WN.classList.remove('on')}}
     else{gNext-=dt;if(gNext<1.1&&!warn){warn=true;WN.classList.add('on');sfx('tick')}if(gNext<=0){warn=false;guard=P.guardDur;GD.classList.add('on')}}
     N.style.left=(p*100)+'%';N.classList.toggle('in',Math.abs(p-zc)<=P.zone/2);NB.style.width=Math.min(100,noise)+'%';NB.className=noise>66?'hot':noise>33?'warm':'';
     F.style.setProperty('--b',bar());F.style.setProperty('--y',stroke>0?Math.sin(stroke/.22*Math.PI):0);stage.style.setProperty('--fl',flash.toFixed(2))})});
   st.p1=()=>({cut,need,noise,p,zc,guard,zone:P.zone});st.p1hit=hit}

  // ===== fase 2: de gang =====
  function phase2(){st.ph=2;loop=null;const m=jbMap(P.map,P.range),opt=jbSolve(m)||40,maxS=Math.ceil(opt*P.slack)+2;
   let x=m.S[0],y=m.S[1],t=0,moves=0,busy=false;
   stage.innerHTML=`<div class="jb-p2"><div class="jb-p2h"><span class="label">Celtelling</span><b id="jbLeft"></b><div class="jb-lbar"><i id="jbLb"></i></div></div><div class="jb-grid" id="jbGrid" style="--w:${m.W};--h:${m.H}"></div></div>`;
   const G=q('jbGrid'),you=`<span class="jb-you">${doll()}</span>`;
   const fit=()=>{const r=stage.getBoundingClientRect(),cs=Math.floor(Math.min((r.width-8)/m.W,(r.height-48)/m.H));G.style.setProperty('--cs',Math.max(22,cs)+'px')};fit();
   const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(stage);st.ro=ro;
   const draw=(caught)=>{const a=jbSeen(m,t),b=P.preview?jbSeen(m,t+1):null;let h='';
    for(let yy=0;yy<m.H;yy++)for(let xx=0;xx<m.W;xx++){const c=m.cell(xx,yy),k=xx+','+yy;let cls='jg '+(c==='#'?'w':c==='c'?'cr':c==='L'?'lp':c==='E'?'ex':c==='S'?'st':'f');
     if(c!=='#'&&a.cone.has(k))cls+=' cn';else if(b&&c!=='#'&&b.cone.has(k))cls+=' cn2';
     const gi=a.gs.findIndex(G0=>G0.x===xx&&G0.y===yy);let inner='';
     if(gi>=0){const G0=a.gs[gi],rot=G0.dx>0?90:G0.dx<0?-90:G0.dy>0?180:0;inner+=`<span class="jb-g" style="--r:${rot}deg"><i></i></span>`}
     if(c==='L'){const l=m.lamps.find(l=>l.x===xx&&l.y===yy),d=l.dirs[Math.floor(t/l.every)%l.dirs.length];inner+=`<span class="jb-lamp" style="--r:${{U:0,R:90,D:180,L:-90}[d]}deg"></span>`}
     if(c==='E')inner+='<span class="jb-door">UIT</span>';
     if(xx===x&&yy===y)inner+=you;
     h+=`<div class="${cls}${xx===x&&yy===y&&caught?' caught':''}" data-x="${xx}" data-y="${yy}">${inner}</div>`}
    G.innerHTML=h;const left=maxS-moves;q('jbLeft').textContent=left+' stappen';q('jbLb').style.width=Math.max(0,left/maxS*100)+'%';q('jbLb').className=left<=4?'hot':left<=maxS*.35?'warm':''};
   const go=(dx,dy)=>{if(st.done||st.intro||busy)return;const r=jbStep(m,x,y,x+dx,y+dy,t);if(r==='wall'){sfx('tick');return}
    moves++;t++;if(dx||dy){x+=dx;y+=dy;sfx('card')}else sfx('tick');
    if(r==='out'){draw();sfx('win',1);busy=true;help.innerHTML='<b class="g">Je bent op de binnenplaats.</b> Nu nog de muur over.';later(phase3,reduce?500:1000);return}
    if(r==='seen'||r==='bump'){draw(true);fail(r==='bump'?'Je liep recht tegen een bewaker aan.':'Een bewaker zag je in de gang.');return}
    if(moves>=maxS){draw(true);fail('Celtelling: ze zagen dat je cel leeg was.');return}draw()};
   const dirs={ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1],ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],Space:[0,0],Period:[0,0]};
   help.innerHTML=`Loop naar de deur <b class="g">UIT</b>. Elke stap of <b>wacht</b> laat de bewakers één stap lopen. Niet in het <b class="y">gele licht</b> staan.${P.preview?' Het vage licht is waar ze <b>na je stap</b> kijken.':''}`;
   const arr=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${{L:'M15 5l-7 7 7 7',R:'M9 5l7 7-7 7',U:'M5 15l7-7 7 7',D:'M5 9l7 7 7-7'}[d]}"/></svg>`;
   ctl.innerHTML=`<div class="jb-pad"><button class="jb-b" data-m="-1,0" aria-label="Links">${arr('L')}</button><button class="jb-b" data-m="0,-1" aria-label="Omhoog">${arr('U')}</button><button class="jb-b" data-m="0,1" aria-label="Omlaag">${arr('D')}</button><button class="jb-b" data-m="1,0" aria-label="Rechts">${arr('R')}</button><button class="jb-b jb-wait" data-m="0,0">Wacht</button></div>`;
   ctl.querySelectorAll('[data-m]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();const [a,c]=b.dataset.m.split(',').map(Number);go(a,c)}));
   // tikken op een vakje naast je, of vegen over het raster
   let sw=null;G.addEventListener('pointerdown',e=>{sw={x:e.clientX,y:e.clientY,used:false}});
   G.addEventListener('pointermove',e=>{if(!sw||sw.used)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.max(Math.abs(dx),Math.abs(dy))>28){sw.used=true;Math.abs(dx)>Math.abs(dy)?go(Math.sign(dx),0):go(0,Math.sign(dy))}});
   G.addEventListener('pointerup',e=>{if(!sw)return;const used=sw.used;sw=null;if(used)return;const c=e.target.closest('.jg');if(!c)return;const cx=+c.dataset.x,cy=+c.dataset.y,dx=cx-x,dy=cy-y;
    if(!dx&&!dy)go(0,0);else if(Math.abs(dx)+Math.abs(dy)===1)go(dx,dy)});
   draw();
   intro(2,'De gang','Sluip naar de deur naar de binnenplaats. Bewakers lopen hun ronde en zoeklampen draaien: sta je in hun licht, dan ben je gezien. Je hebt maar een paar stappen voor de celtelling.',()=>{
    setKeys(e=>{const d=dirs[e.code];if(d){go(d[0],d[1]);return}return false})});
   st.p2=()=>({x,y,t,moves,maxS,opt,map:P.map,range:P.range,path:jbPath(m)});st.p2go=go}

  // ===== fase 3: de muur =====
  function phase3(){st.ph=3;if(st.ro){st.ro.disconnect();st.ro=null}
   let h=0,lastSide=0,idle=0,bx=0,dir=1,seen=0,cool=0,slipT=0;const sweep=P.sweep;
   stage.innerHTML=`<div class="jb-p3"><div class="jb-sky"></div><div class="jb-tower"><i class="jb-sl"></i></div><div class="jb-beam" id="jbBeam"></div>
     <div class="jb-wall"><div class="jb-wire"></div><div class="jb-climb" id="jbClimb"><span class="jb-cl">${doll()}</span></div></div>
     <div class="jb-hgt"><i id="jbH"></i><span id="jbHt">0%</span></div><div class="jb-still" id="jbStill">Stil!</div></div>`;
   help.innerHTML='Klim met <b>links</b> en <b>rechts</b> om de beurt (← →). Twee keer dezelfde kant = je glijdt. Staat het <b class="y">zoeklicht</b> op je: <b>niks doen</b>. Wacht je te lang, dan glijd je terug.';
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
   intro(3,'De muur','Klim over de buitenmuur: om de beurt links en rechts. Het zoeklicht zwaait heen en weer. Valt het op jou, doe dan niks tot het voorbij is. Blijf je te lang hangen, dan zakt je grip.',()=>{
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
   st.p3=()=>({h,bx,lit:lit(),lastSide,per:P.per});st.p3climb=climb}

  // ===== einde =====
  function fail(why){if(st.done)return;st.why=why;finish(false)}
  function finish(ok){if(st.done)return;st.done=true;st.res=ok;loop=null;setKeys(e=>{if(e.code==='Space'||e.code==='Enter'){close();return}return false});
   const box=ov.querySelector('.jb-box');box.classList.add(ok?'won':'lost');ctl.innerHTML='';const stl=q('jbStill');if(stl)stl.remove();
   if(ok){steps(4);q('jbT').textContent='Ontsnapt!';q('jbSub').textContent='Over de muur en de nacht in';sfx('big');
    stage.innerHTML=`<div class="jb-out"><div class="jbo-sky"><i class="jbo-moon"></i></div><div class="jbo-city">${Array.from({length:14},(_,i)=>`<i style="--h:${30+((i*37)%55)}%;--d:${i*.13}s"></i>`).join('')}</div>
      <div class="jbo-wall"></div><div class="jbo-you">${doll()}</div><p class="jbo-t">Je bent eruit. Ze zoeken je nu overal.</p></div>`;help.innerHTML='Je staat op de gezochtlijst tot de politie je vindt.'}
   else{q('jbT').textContent='Gepakt!';q('jbSub').textContent=st.why||'Alarm';sfx('lose');
    stage.insertAdjacentHTML('beforeend',`<div class="jb-alarm"><b>Alarm</b><span>${st.why||''}</span></div>`);help.innerHTML='Terug je cel in, met <b class="r">30 seconden extra straf</b>.'}
   later(close,ok?2400:2000)}
  function close(){if(closed||!st.done)return;closed=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);document.removeEventListener('keydown',onKey);if(st.ro)st.ro.disconnect();
   ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(st.res===true)},220)}
  ov.addEventListener('click',e=>{if(st.done)close()});
  // test-hook (zoals ov._fl bij het vluchtspel)
  ov._jb=()=>Object.assign({ph:st.ph,intro:st.intro,done:st.done,res:st.res,why:st.why,P},st.ph===1&&st.p1?st.p1():st.ph===2&&st.p2?st.p2():st.ph===3&&st.p3?st.p3():{});
  ov._jbT={go:()=>st.go&&st.go(),skip:()=>{if(st.ph===0)phase1()},hit:()=>st.p1hit&&st.p1hit(),move:(a,b)=>st.p2go&&st.p2go(a,b),climb:s=>st.p3climb&&st.p3climb(s)};
  last=performance.now();raf=requestAnimationFrame(frame);cutscene()})}
