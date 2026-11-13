// Verhaal "De Bezorger" · Hoofdstuk 1 · Dozen (Seizoen 1, gratis voor iedereen).
// Vier avonden in de Westbuurt, aan de Boulevard en in Oud-Zuid. Gebouwd op de verhaalkern:
//   G.story (stappen, geld, meters, vlaggen, klok) · G.cut (cutscènes) · G.binnen (interieurs) · G.draag (dozen)
//   G.fiets (de fiets) · G.bezorg (bezorgen) · G.kaart (missies) · G.uiterlijk (kleding, als die er is).
// Elke stap kan na een herlaadbeurt opnieuw beginnen ({hervat:true}); keuzes staan in S.story.flags en komen later terug.
// Minispellen hier: achtervolging (de dief), vuistgevecht (Rapido), geld tellen (Rafiq), verstoppen (thuis), het verhoor.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const $s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const PI=Math.PI,sin=Math.sin,cos=Math.cos,hyp=Math.hypot;
const eur=n=>'€'+Math.round(n).toLocaleString('nl-NL');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ST,C,B,K;

/* =================== hulpjes =================== */
const A=(k,fx,fz)=>{const a=M.A&&M.A[k];if(a&&a.x!=null)return {x:a.x,z:a.z};return {x:fx,z:fz}};
const P=()=>({x:G.P.x,z:G.P.z,ry:G.P.ry||0});
const F=(k,v)=>v===undefined?ST.flag(k):ST.flag(k,v);
const W=(id,x,z)=>B.p(id,x,z);
function W3(id,x,y,z){const p=W(id,x,z);return [p[0],y,p[1]]}
const binnen=async id=>{if(B.waar()!==id)await B.in(id,{forceer:true})};
const buiten=async()=>{if(B.waar())await B.uit()};
const fx=n=>{try{G.snd&&G.snd.fx(n)}catch(e){}};
const zeg=(id,t,o)=>C.zeg(id,t,o);
const sein=(t,c)=>ST.seintje(t,c);
function walk(x,z,r){const p=M.nearestWalk?M.nearestWalk(x,z,r||6):null;return p||{x,z}}
// iets vóór de speler op straat (voor gebeurtenissen onderweg)
function voor(d,zij){const p=P(),fx_=sin(p.ry),fz_=cos(p.ry);let x=p.x+fx_*d+(zij||0)*fz_,z=p.z+fz_*d-(zij||0)*fx_;return walk(x,z,8)}
function naar(a,b){return Math.atan2(b.x-a.x,b.z-a.z)}
// tijd alleen vooruit zetten (de klok loopt vanzelf door; bij een scène zetten we hem op het juiste uur)
function tijd(h,m){const k=ST.klok(),nu=k.h*60+k.m,doel=h*60+(m||0);if(doel>nu||nu-doel>600)ST.tijd(h,m||0)}
// de fiets: altijd ergens in de buurt
function zorgFiets(bij){if(!G.fiets)return;const fp=G.fiets.pos();const p=bij||P();if(G.fiets.actief())return;if(fp&&hyp(fp.x-p.x,fp.z-p.z)<60)return;const q=walk(p.x+1.6,p.z+1.2,6);G.fiets.spawn(q.x,q.z,p.ry||0,{kleur:'#c0261e'})}
function fietsAf(){try{if(G.fiets&&G.fiets.actief())G.fiets.af(true)}catch(e){}}
// kleding gaat vanzelf (klas = school, thuis = thuis, jas van Giovanni = bezorger); hier alleen een situatie wissen
function uitfit(n){try{if(n==null&&G.uiterlijk&&G.uiterlijk.situatie)G.uiterlijk.situatie(null)}catch(e){}}
// een poppetje in een interieur dat blijft staan (ook na opnieuw binnenkomen)
function zetBinnen(id,x,z,ry,o){const a=C.zet(id,x,z,ry,Object.assign({blijf:true},o||{}));if(a&&a.g)a.g.binnenId=1;if(o&&o.prop)a.prop(o.prop);return a}
// statische stapel dozen in de wereld
const STAPELS=[];
function stapelOp(p,n){if(!p||!C.stapel)return;const g=C.stapel(n);g.position.set(p.x,(p.y||.9)+.005,p.z);g.rotation.y=rr(-.3,.3);g.binnenId=1;G.scene().add(g);STAPELS.push(g);return g}
function stapelsWeg(){STAPELS.splice(0).forEach(g=>g.parent&&g.parent.remove(g))}
// camera-stap: positie en kijkpunt (y = hoogte)
const cam=(px,py,pz,lx,ly,lz,o)=>({cam:Object.assign({pos:[px,py,pz],look:[lx,ly,lz]},o||{})});
const camNaar=(px,py,pz,lx,ly,lz,t,o)=>({cam:Object.assign({to:{pos:[px,py,pz],look:[lx,ly,lz]},t:t||3},o||{})});
// een schot vanaf een punt rond (x,z): hoek a, afstand d, hoogte h, kijkt naar (x, ly, z)
// op een staand scherm (telefoon) is het beeld smal: de camera een stukje verder weg
const pk=()=>innerWidth<innerHeight?1.3:1;
const rond=(x,z,a,d,h,ly,o)=>{d*=pk();return cam(x+sin(a)*d,h,z+cos(a)*d,x,ly==null?1.3:ly,z,o)};
const rondNaar=(x,z,a,d,h,ly,t,o)=>{d*=pk();return camNaar(x+sin(a)*d,h,z+cos(a)*d,x,ly==null?1.3:ly,z,t,o)};
// telefoon die trilt
function tril(){try{navigator.vibrate&&G.verhaalInst&&G.verhaalInst.get&&G.verhaalInst.get('tril')!==false&&navigator.vibrate([60,60,60])}catch(e){}fx('tril');setTimeout(()=>fx('notify'),420)}
// schoolbel (eigen geluid: twee tonen die lang doorklinken)
function schoolbel(){if(G.snd&&G.snd.fx){fx('schoolbel');return}try{const ac=G.snd&&G.snd.ctx?G.snd.ctx():new (window.AudioContext||window.webkitAudioContext)();const t=ac.currentTime;
  for(let i=0;i<14;i++){const o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=i%2?880:1046;g.gain.setValueAtTime(0,t+i*.11);g.gain.linearRampToValueAtTime(.05,t+i*.11+.01);g.gain.linearRampToValueAtTime(0,t+i*.11+.1);o.connect(g);g.connect(ac.destination);o.start(t+i*.11);o.stop(t+i*.11+.12)}}catch(e){fx('notify')}}

/* =================== extra cast voor hoofdstuk 1 =================== */
function cast(){const CA=C.actors;
  const zwart={kind:'jacket',c:'#141416',c2:'#26282c'},bm={kind:'skimask',c:'#141416'};
  const mk=(n,rol,col,look,face,o)=>{if(!CA[n.id])CA[n.id]=Object.assign({n:n.n,col,rol,look,face},o||{})};
  mk({id:'masker',n:'Bivakmuts'},'',"#9aa1ab",{skin:'#c8956a',hair:'#141416',hs:'kort',eye:'#24160e',mood:'boos',top:zwart,legs:{kind:'jeans',c:'#141416'},shoes:{kind:'boot',c:'#141416'},head:bm,gloves:'#101012'},
    {skin:'#202024',hair:'#141416',hs:'kaal',eye:'#c9c4b8',top:'#141416',col:'leer',age:1,fw:20,jaw:'hoekig'},{schaal:1.08});
  mk({id:'masker2',n:'Bivakmuts',},'','#9aa1ab',{skin:'#8d5a3a',hair:'#141416',hs:'kort',eye:'#24160e',mood:'boos',top:{kind:'hoodie',c:'#1a1a1c',c2:'#2a2a2e'},legs:{kind:'track',c:'#141416',c2:'#2a2a2e'},shoes:{kind:'sneaker',c:'#141416',c2:'#2a2a2e'},head:bm,gloves:'#101012'},
    {skin:'#1c1c20',hair:'#141416',hs:'kaal',eye:'#c9c4b8',top:'#1a1a1c',col:'hoodie',age:0,fw:18,jaw:'rond'});
  mk({id:'nova_m',n:'Bivakmuts'},'','#ff3d7a',Object.assign({},C.look('nova')||{},{head:bm,gloves:'#101012'}),
    {skin:'#202024',hair:'#141416',hs:'kaal',eye:'#5a3a22',top:'#141416',col:'leer',age:0,v:1,fw:16,jaw:'spits'});
  mk({id:'koerier',n:'Jongen van Rafiq'},'','#ffb35a',{skin:'#a8714c',hair:'#16161a',hs:'opgeschoren',eye:'#24160e',mood:'koel',top:{kind:'track',c:'#2a2c30',c2:'#ffd35a'},legs:{kind:'track',c:'#2a2c30',c2:'#ffd35a'},shoes:{kind:'sneaker',c:'#f1efe9',c2:'#2a2c30'},head:{kind:'cap',c:'#16161a',c2:'#ffd35a'}},
    {skin:'#a8714c',hair:'#16161a',hs:'opgeschoren',eye:'#24160e',top:'#2a2c30',col:'track',hat:'pet',hatC:'#16161a',age:0,fw:18});
  mk({id:'buurman',n:'Buurman'},'','#a9dcff',{skin:'#f1caa5',hair:'#8a8478',hs:'kort',fh:'snor',eye:'#3a4a60',mood:'neutraal',top:{kind:'tee',c:'#6a8a5a'},legs:{kind:'jeans',c:'#4a4c50'},shoes:{kind:'boot',c:'#3a2418'}},
    {skin:'#f1caa5',hair:'#8a8478',hs:'kalend',fh:'snor',eye:'#3a4a60',top:'#6a8a5a',col:'shirt',age:2,fw:20});
  mk({id:'nietbetaler',n:'Man in de deur'},'','#ff7a6a',{skin:'#e0ab84',hair:'#3a2418',hs:'kort',fh:'stoppel',eye:'#3a2414',mood:'boos',top:{kind:'tee',c:'#e8e4da'},legs:{kind:'track',c:'#2a2c30'},shoes:{kind:'sneaker',c:'#3a3f48'}},
    {skin:'#e0ab84',hair:'#3a2418',hs:'kort',fh:'stoppel',eye:'#3a2414',top:'#e8e4da',col:'shirt',age:1,fw:20});
  mk({id:'klant_bang',n:'De klant'},'','#c9c4b8',{skin:'#d9a27a',hair:'#5a3a22',hs:'kort',eye:'#3a2414',mood:'bang',top:{kind:'hoodie',c:'#4a5a6a'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'sneaker',c:'#c9cfd6'}},
    {skin:'#d9a27a',hair:'#5a3a22',hs:'kort',eye:'#3a2414',top:'#4a5a6a',col:'hoodie',age:1,fw:18});
}
// Luca in pak, voor de dagdroom
function lucaPak(){const L=JSON.parse(JSON.stringify(ST.lucaLook()||{}));L.top={kind:'suit',c:'#16181d',c2:'#e8e4da'};L.legs={kind:'jeans',c:'#16181d'};L.shoes={kind:'boot',c:'#0e0e10'};L.sun='#0b0b0d';L.mood='koel';return L}

/* =================== een scooter (Rapido, de dief) =================== */
function scooter(kleur){const g=new TH.Group(),mat=c=>new TH.MeshLambertMaterial({color:c});const box=(w,h,d,c,x,y,z)=>{const m=new TH.Mesh(new TH.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
  box(.36,.32,1.05,kleur,0,.42,0);box(.32,.5,.22,kleur,0,.72,.5);box(.5,.06,.06,'#202226',0,1.0,.55);box(.34,.14,.5,'#1a1a1c',0,.66,-.12);
  box(.44,.34,.44,'#f2c230',0,.92,-.42);box(.1,.36,.36,'#16161a',0,.18,.52);box(.1,.36,.36,'#16161a',0,.18,-.46);box(.14,.08,.04,'#fff6c8',0,.82,.62);g.binnenId=0;return g}

/* =================== CSS voor de minispellen =================== */
function css(){if($s('h1Css'))return;const s=document.createElement('style');s.id='h1Css';s.textContent=`
.h1-mg{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:60;width:min(460px,calc(100vw - 24px));background:#121016ee;border:2px solid #2c2734;
  box-shadow:0 8px 0 #0008;color:#f1efe9;font:600 14px/1.35 'Space Grotesk',system-ui,sans-serif;padding:14px 14px 12px;image-rendering:pixelated}
.h1-mg h4{margin:0 0 2px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#ffd35a}.h1-mg p{margin:0 0 10px;color:#c9c4b8;font-weight:500;font-size:13px}
.h1-bar{position:relative;height:22px;background:#2a2630;border:2px solid #3a3442;margin:8px 0}.h1-bar i{position:absolute;top:0;bottom:0;background:#3fe39555;border-left:2px solid #3fe395;border-right:2px solid #3fe395}
.h1-bar b{position:absolute;top:-4px;bottom:-4px;width:4px;background:#ffd35a;box-shadow:0 0 0 2px #0008}
.h1-hp{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#c9c4b8}.h1-hp span{display:flex;gap:3px;align-items:center}.h1-hp em{display:inline-block;width:12px;height:12px;background:#ff5a4a;border:1px solid #0008}.h1-hp em.weg{background:#3a3442}
.h1-knop{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:8px;margin-top:10px}.h1-knop button{font:700 14px 'Space Grotesk',system-ui;color:#121016;background:#ffd35a;border:0;border-bottom:4px solid #b8902a;padding:12px 6px;cursor:pointer;touch-action:manipulation}
.h1-knop button.b{background:#7fd1ff;border-color:#4a8ab0}.h1-knop button.r{background:#ff7a6a;border-color:#b84a3a}.h1-knop button:active{transform:translateY(2px);border-bottom-width:2px}.h1-knop kbd{font:600 10px monospace;opacity:.6;margin-left:4px}
.h1-warn{color:#ff7a6a;font-weight:700;min-height:20px;text-align:center;letter-spacing:.04em}.h1-warn.ok{color:#3fe395}
.h1-biljet{height:96px;margin:6px auto 4px;width:200px;display:flex;align-items:center;justify-content:center;font:800 30px 'Space Grotesk',system-ui;color:#121016;border:3px solid #0006;position:relative;box-shadow:inset 0 0 0 6px #fff3,0 4px 0 #0006;transition:transform .12s}
.h1-biljet:after{content:'';position:absolute;top:8px;bottom:8px;right:26px;width:8px;background:var(--strip,#e8e4da);opacity:.85}.h1-biljet small{position:absolute;left:8px;top:6px;font-size:11px;opacity:.7}
.h1-biljet.vlieg{transform:translateX(160px) rotate(12deg);opacity:0}
`;document.head.appendChild(s)}
function mgOpen(html,cls){css();const el=document.createElement('div');el.className='h1-mg '+(cls||'');el.innerHTML=html;document.body.appendChild(el);return el}

/* =================== minispel: vuistgevecht =================== */
// Om de beurt: jij slaat (druk als het gele streepje in het groen staat) of hij haalt uit (ontwijk op tijd).
function vechten(o){o=o||{};return new Promise(res=>{const el=mgOpen(`<h4>Vuistgevecht · ${o.wie||'Rapido'}</h4><p>Slaan als het streepje in het groen staat. Haalt hij uit: ontwijken.</p>
   <div class="h1-hp"><span>Luca ${'<em></em>'.repeat(3)}</span><span>${o.wie||'Hij'} ${'<em></em>'.repeat(3)}</span></div><div class="h1-bar"><i></i><b></b></div><div class="h1-warn"></div>
   <div class="h1-knop"><button data-k="slaan">Slaan<kbd>${touch?'':'E'}</kbd></button><button class="b" data-k="ontwijk">Ontwijken<kbd>${touch?'':'Q'}</kbd></button></div>`,'vecht');
  const bar=el.querySelector('.h1-bar b'),zone=el.querySelector('.h1-bar i'),warn=el.querySelector('.h1-warn'),hp=el.querySelectorAll('.h1-hp span');
  let mij=3,hem=3,pos=0,dir=1,sp=1.1,zx=.4,zw=.2,fase='slaan',t0=performance.now(),haal=0,klaar=false,last=performance.now();
  const zet=()=>{zx=rr(.12,.68);zw=clamp(.24-(.03*(3-hem)),.13,.3);zone.style.left=(zx*100)+'%';zone.style.width=(zw*100)+'%'};zet();
  const hart=()=>{hp[0].querySelectorAll('em').forEach((e,i)=>e.classList.toggle('weg',i>=mij));hp[1].querySelectorAll('em').forEach((e,i)=>e.classList.toggle('weg',i>=hem))};
  const msg=(t,ok)=>{warn.textContent=t;warn.classList.toggle('ok',!!ok)};
  const tegen=()=>{fase='hij';haal=performance.now()+rr(700,1500);msg('…')};
  const actie=k=>{if(klaar)return;const nu=performance.now();
    if(k==='slaan'&&fase==='slaan'){if(pos>=zx&&pos<=zx+zw){hem--;fx('punch');msg('Raak!',true);try{o.onRaak&&o.onRaak()}catch(e){}if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}}else{msg('Mis!');fx('jank')}hart();zet();if(hem<=0)return end(true);tegen();return}
    if(k==='ontwijk'&&fase==='hij'){if(haal&&nu<haal){msg('Te vroeg — hij ziet het');fx('jank');haal=nu+400;return}if(nu-haal<650){msg('Ontweken',true);fx('whoosh');fase='slaan';sp=Math.min(2.1,sp+.12);return}}};
  function end(win){klaar=true;cancelAnimationFrame(raf);removeEventListener('keydown',key,true);setTimeout(()=>{el.remove();res(win)},700);msg(win?'Hij gaat neer.':'Je ligt op de grond.',win)}
  function tick(){const nu=performance.now(),dt=Math.min(.05,(nu-last)/1000);last=nu;if(klaar)return;
    if(fase==='slaan'){pos+=dir*sp*dt;if(pos>1){pos=1;dir=-1}if(pos<0){pos=0;dir=1}bar.style.left='calc('+(pos*100)+'% - 2px)'}
    else if(fase==='hij'){if(nu>=haal&&warn.textContent==='…'){msg('Hij haalt uit!');fx('whistle')}if(nu-haal>650&&nu>haal){mij--;hart();fx('hit');msg('Au.');try{o.onGeraakt&&o.onGeraakt()}catch(e){}if(navigator.vibrate)try{navigator.vibrate(120)}catch(e){}if(mij<=0)return end(false);fase='slaan'}}
    raf=requestAnimationFrame(tick)}
  let raf=requestAnimationFrame(tick);
  el.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-k]');if(b){e.preventDefault();actie(b.dataset.k)}});
  const key=e=>{const k=e.key.toLowerCase();if(k==='e'||k===' '||k==='enter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)actie('slaan')}else if(k==='q'||k==='shift'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)actie('ontwijk')}};
  addEventListener('keydown',key,true)})}

/* =================== minispel: geld tellen =================== */
// Briefjes op waarde sorteren en valse eruit halen. Vals = verkeerde kleur of geen zilveren strip.
const BILJET={10:'#e8a0a0',20:'#8ab4e8',50:'#f2b04a',100:'#7fd09a'};
function tellen(){return new Promise(res=>{const N=16,TIJD=40;let i=0,goed=0,fout=0,tot=0,klaar=false,t0=performance.now();
  const lijst=[];for(let k=0;k<N;k++){const v=pick([10,10,20,20,50,50,100]),vals=k>2&&Math.random()<.22;lijst.push({v,vals,kleur:vals&&Math.random()<.5?BILJET[pick([10,20,50,100].filter(x=>x!==v))]:BILJET[v],strip:vals&&Math.random()>=.5?'transparent':null})}
  const el=mgOpen(`<h4>Geld tellen · achterin Sahara</h4><p>Sorteer op waarde. Verkeerde kleur of geen strip? Vals.</p>
    <div class="h1-hp"><span id="h1tN">Briefje 1/${N}</span><span id="h1tT">${TIJD} s</span></div><div class="h1-biljet" id="h1b"></div><div class="h1-warn" id="h1w"></div>
    <div class="h1-knop">${[10,20,50,100].map((v,k)=>`<button data-v="${v}" style="background:${BILJET[v]};border-color:#0004">€${v}<kbd>${touch?'':k+1}</kbd></button>`).join('')}<button class="r" data-v="vals">Vals<kbd>${touch?'':'5'}</kbd></button></div>`,'tel');
  const bj=el.querySelector('#h1b'),w=el.querySelector('#h1w');
  const show=()=>{const b=lijst[i];if(!b)return;bj.classList.remove('vlieg');bj.style.background=b.kleur;bj.style.setProperty('--strip',b.strip||'#e8e4da');bj.innerHTML=`<small>EURO</small>${b.v}`;el.querySelector('#h1tN').textContent='Briefje '+(i+1)+'/'+N};
  const kies=v=>{if(klaar)return;const b=lijst[i];if(!b)return;const ok=b.vals?v==='vals':v==String(b.v);if(ok){goed++;if(!b.vals)tot+=b.v;fx('coin');w.textContent=b.vals?'Vals eruit':'+'+eur(b.v);w.className='h1-warn ok'}else{fout++;fx('jank');w.textContent=b.vals?'Die was vals':'Dat was '+eur(b.v);w.className='h1-warn'}
    bj.classList.add('vlieg');i++;if(i>=N){end();return}setTimeout(show,140)};
  const iv=setInterval(()=>{const l=TIJD-(performance.now()-t0)/1000;el.querySelector('#h1tT').textContent=Math.max(0,Math.ceil(l))+' s';if(l<=0)end()},200);
  function end(){if(klaar)return;klaar=true;clearInterval(iv);removeEventListener('keydown',key,true);const score=clamp(Math.round((goed-fout*1.5)/N*100),0,100);setTimeout(()=>{el.remove();res({goed,fout,score,tot,af:i})},500)}
  el.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)kies(b.dataset.v)});
  const key=e=>{const m={'1':'10','2':'20','3':'50','4':'100','5':'vals'}[e.key];if(m){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)kies(m)}};addEventListener('keydown',key,true);show()})}

/* =================== de stappen =================== */
let RUN=0;const nieuw=()=>++RUN;
const SP={};   // tijdelijke spots per stap
function spotWeg(k){const s=SP[k];if(s){G.unspot&&G.unspot(s);delete SP[k]}}
function stap(id,def){ST.step(id,def)}
const go=id=>ST.goto(id);
const LUCA_NAAM=()=>ST.flag('plein')==='ingegrepen'?'Luca':'Luca';

function registreer(){
/* ---------- begin ---------- */
stap('start',{async start(){const t=nieuw();
  // eerst de intro (één keer), na het welkomstkaartje
  if(!ST.flag('intro')&&G.verhaalIntro){let w=0;while(((!ST.st().welkom&&w<15)||document.querySelector('.sv-ov')||G.paused)&&w<1200){await sleep(300);w++}await sleep(400);if(t!==RUN)return;try{await G.verhaalIntro.play()}catch(e){console.error(e)}}
  if(t!==RUN)return;go('h1_klas')}});

/* ======================= AVOND 1 · De eerste dienst ======================= */
stap('h1_klas',{doel:null,async start(o){const t=nieuw();ST.avond(1);ST.tijd(14,20);uitfit('school');fietsAf();await binnen('klas');if(t!==RUN)return;
  const seat=B.plek('klas','luca')||{x:W('klas',4,6)[0],y:0,z:W('klas',4,6)[1]},bord=B.plek('klas','bord')||{x:W('klas',7,1)[0],z:W('klas',7,1)[1]};
  const Z=A('zakendistrict',1030,576),H=A('haven',735,120),S=A('school',232,337);
  const ry=PI;
  await C.play([
   {fade:'out',t:.01},{speler:false},
   {actor:'luca',at:[seat.x,seat.z],ry,anim:'sit',sitY:-.42},{fn:()=>{const a=C.acteur('luca');if(a){a.g.binnenId=1;a.kijk=-.6}}},
   cam(...W3('klas',13.8,3.0,1.2),...W3('klas',10.6,0.9,6.8)),{fade:'in',t:1.2},
   {titel:'Hoofdstuk 1',sub:'Dozen',t:3.4},
   {say:'docent',text:'Belastingen. Van elke euro die jullie ooit verdienen, gaat een deel naar de staat.',t:4.2},
   cam(...W3('klas',10.2,2.1,3.4),...W3('klas',7.2,1.5,1.7)),camNaar(...W3('klas',9.6,2.0,3.0),...W3('klas',7.2,1.5,1.7),4,{wacht:false}),
   {say:'docent',text:'Inkomstenbelasting. Btw. En wie het niet betaalt, krijgt vroeg of laat een brief van een heel saaie meneer.',t:4.6},
   cam(...W3('klas',14.4,2.1,4.4),seat.x,1.1,seat.z),camNaar(...W3('klas',14.2,1.9,5.0),seat.x,1.1,seat.z,3,{wacht:false}),
   {say:null,text:'Luca kijkt naar buiten. Het raam, de flats, de lucht boven de haven…',t:3.2},
   // de dagdroom
   {fade:'out',t:.9},{dream:true},{buiten:true},{speler:false},
   {actor:'luca_d',at:[Z.x,Z.z],ry:PI*.25,look:lucaPak(),prop:'tas',anim:'idle'},
   cam(Z.x-40,46,Z.z+60,Z.x,8,Z.z),{fade:'in',t:.8},{snd:'whoosh'},
   camNaar(Z.x+6,2.4,Z.z+7,Z.x,1.4,Z.z,4.5),
   {say:'luca',text:'Ooit.',t:1.6,mood:'koel'},
   {anim:'luca_d',a:'give',t:.8},{snd:'click'},
   cam(H.x+70,60,H.z+90,H.x,6,H.z),{snd:'whoosh'},camNaar(H.x-20,34,H.z+40,H.x,4,H.z,4),
   {say:null,text:'Een helikopter boven de haven. Koffers. Mannen die naar hem luisteren.',t:3},
   {fn:schoolbel},{fade:'out',t:.25},{dream:false},{weg:'luca_d'},{binnen:'klas'},{speler:false},
   {weg:'luca'},{actor:'luca',at:[seat.x,seat.z],ry,anim:'schrik',sitY:-.42},{fn:()=>{const a=C.acteur('luca');if(a)a.g.binnenId=1}},
   cam(...W3('klas',14.5,2.3,10.4),seat.x-.4,1.0,seat.z),{fade:'in',t:.3},{fn:schoolbel},
   {say:'docent',text:'…en dat is de bel. Hoofdstuk vier lezen! Ook jij, De Santis.',t:3.2},
   {say:'dex',text:'Ey, droomkoning. Werken.',t:2.4,mood:'blij'},
   {say:'luca',text:'Ik droomde niet.',t:1.8},
   {say:'dex',text:'Je kwijlde op je boek, broer. Kom, buiten.',t:2.6,mood:'blij'},
   {fade:'out',t:.5},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);
  if(t!==RUN)return;go('h1_naarbuiten')}});
stap('h1_naarbuiten',{doel:'Ga naar buiten, naar het schoolplein',waar:()=>{const a=A('schoolhek',234,371);return {x:a.x,z:a.z,r:9}},
  start(o){if(o.hervat&&!B.waar())return;},aankomst(){go('h1_plein')}});

stap('h1_plein',{muziek:'school',doel:'Het schoolplein',async start(o){const t=nieuw();await buiten();if(t!==RUN)return;
  const h=A('schoolhek',234,371),p=walk(h.x,h.z-4,6),l=P();
  const oj=walk(p.x+2.4,p.z-1.2,4),bk=walk(p.x+3.2,p.z-.2,4),dx=walk(l.x-1,l.z+.6,3);
  const r1=await C.play([{speler:false},
   {actor:'luca',at:[l.x,l.z],ry:naar(l,oj)},{actor:'dex',at:[dx.x,dx.z],ry:naar(dx,oj)},
   {actor:'oudere_jongen',at:[oj.x,oj.z],ry:naar(oj,bk),anim:'idle',prop:'pet'},{actor:'brugklasser',at:[bk.x,bk.z],ry:naar(bk,oj),anim:'handenop'},
   rond(oj.x,oj.z,naar(oj,l)+.5,6,2.4,1.2),
   {say:'oudere_jongen',text:'Mooie pet, brugpieper. Nu is hij van mij.',t:2.8},
   {say:'brugklasser',text:'Geef terug, man. Die is van mijn broer…',t:2.6,mood:'bang'},
   rond(l.x,l.z,naar(l,oj)+PI-.4,2.4,1.7,1.4),
   {say:'dex',text:'Laat zitten, Luca. Niet ons probleem.',t:2.4},
   {keuze:[{t:'Ingrijpen',id:'in',sub:'Dex vindt je stoer'},{t:'Doorlopen',id:'door',sub:'Niemand merkt het'}],wie:'luca',text:'Wat doe je?'}],{blijf:true});
  if(t!==RUN)return;
  if(r1==='in'){await C.play([
     {move:'luca',to:[oj.x-1.1,oj.z+.4],t:1.6},{anim:'luca',a:'point',naar:[oj.x,oj.z]},rond(oj.x,oj.z,naar(oj,l)-.6,3.6,1.8,1.4),
     {say:'luca',text:'Geef die pet terug.',t:1.8,mood:'koel'},
     {anim:'oudere_jongen',a:'duw',naar:'luca'},{say:'oudere_jongen',text:'Of wat, pizzajongen?',t:2},
     {move:'dex',to:[oj.x-.6,oj.z+1.3],t:.9,anim:'run'},{anim:'dex',a:'armen',naar:[oj.x,oj.z]},
     {say:'dex',text:'Of wij.',t:1.4,mood:'boos'},{wait:.4},
     {anim:'oudere_jongen',a:'idle',prop:null},{snd:'whoosh'},{say:'oudere_jongen',text:'Rustig, rustig. Was een grapje.',t:2},
     {move:'oudere_jongen',to:[oj.x+9,oj.z-6],t:3,wacht:false},
     {anim:'brugklasser',a:'pet',prop:'pet'},{say:'brugklasser',text:'Bedankt… Ik ben Sami.',t:2.2,mood:'blij'},
     {say:'dex',text:'Kijk hem. Superheld van de Westbuurt.',t:2.2,mood:'blij'},
     {fade:'out',t:.4},{speler:true},{fade:'in',t:.4}]);
    F('plein','ingegrepen');F('sami',1);ST.meter('loy_dex',5);ST.meter('imago',3)}
  else{await C.play([
     {move:'luca',to:[l.x-5,l.z+5],t:2.6,wacht:false},{move:'dex',to:[dx.x-5,dx.z+5],t:2.6,wacht:false},
     rond(bk.x,bk.z,naar(bk,l)+PI,1.4,1.5,1.4),{say:null,text:'Sami kijkt je na. Hij onthoudt je gezicht.',t:2.6},
     {say:'dex',text:'Slim. Niet jouw oorlog.',t:2},{fade:'out',t:.4},{speler:true},{fade:'in',t:.4}]);
    F('plein','door')}
  C.allesWeg(false);['luca','dex','oudere_jongen','brugklasser'].forEach(k=>C.weg(k));
  if(t!==RUN)return;go('h1_fiets')}});

stap('h1_fiets',{muziek:'school',doel:'Pak je fiets bij het fietsenrek',waar:()=>{const a=A('fietsenrek',210,361);return {x:a.x,z:a.z,r:3.2}},
  start(o){const r=A('fietsenrek',210,361),p=walk(r.x,r.z,3);if(G.fiets&&!G.fiets.actief()){const fp=G.fiets.pos();if(!fp||hyp(fp.x-p.x,fp.z-p.z)>3)G.fiets.spawn(p.x,p.z,0,{kleur:'#2c4a6a'})}},
  async aankomst(){const t=nieuw();const fp=(G.fiets&&G.fiets.pos())||P(),l=P();
   await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,fp)},
    rond(fp.x,fp.z,naar(fp,l)+.9,2.2,.6,.5),{move:'luca',to:[fp.x+.7,fp.z+.4],t:1},{anim:'luca',a:'hurk',t:.6},{snd:'click'},
    {say:null,text:'Het slot klemt. Zoals altijd.',t:1.8},{snd:'click'},
    {anim:'luca',a:'idle'},rond(fp.x,fp.z,naar(fp,l)-.6,3.2,1.0,.8),
    {say:'dex',text:'Morgen voetbal? Kooi, vier uur.',t:2.2},{say:'luca',text:'Als Giovanni me laat gaan.',t:2},
    {say:'dex',text:'Ga dan. Werk ze, pizzaman.',t:1.8,mood:'blij'},
    {fade:'out',t:.3},{speler:true},{fade:'in',t:.3}]);
   if(t!==RUN)return;try{G.fiets.op()}catch(e){}go('h1_napoli')}});

stap('h1_napoli',{doel:'Fiets naar Bella Napoli',waar:()=>{const a=A('napoli',419,492);return {x:a.x,z:a.z,r:9}},
  start(o){zorgFiets();this._hond=false;this._t=0},
  tick(dt){const h=A('steeg_hond',359,429);if(!this._hond&&hyp(G.P.x-h.x,G.P.z-h.z)<10){this._hond=true;fx('woef');setTimeout(()=>fx('woef'),380);
     zeg('luca','Rustig! Rustig, goeie hond…',{t:2});if(G.fiets&&G.fiets.actief())G.fiets.balans({waarom:'Een hond springt tegen je tas',duur:2.2}).then(ok=>{if(!ok)zeg('luca','Bijna. Die steeg neem ik niet meer.',{t:2.2})})}},
  aankomst(){fietsAf();go('h1_giovanni')}});

stap('h1_giovanni',{async start(o){const t=nieuw();fietsAf();await binnen('napoli');if(t!==RUN)return;tijd(16,10);
  B.toon('napoli','giovanni',false);
  const g=W('napoli',8,6.9),l=W('napoli',8,10.8),gp={x:g[0],z:g[1]},lp={x:l[0],z:l[1]};
  await C.play([{speler:false},
   {actor:'giovanni',at:g,ry:PI,anim:'kok'},{actor:'luca',at:l,ry:PI},{fn:()=>['giovanni','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
   cam(gp.x+3.2,2.2,gp.z-1.4,gp.x,1.3,gp.z+1),{fade:'in',t:.6},
   {say:null,text:'Meel in de lucht. Een radio met Italiaanse liedjes. De oven tikt.',t:2.6},
   {anim:'giovanni',a:'talk',ry:0,naar:'luca'},{say:'giovanni',text:'Daar is hij! Mijn snelste jongen. Twee minuten te laat, maar de snelste.',t:3,mood:'blij'},
   rond(lp.x,lp.z,PI+.7,2.6,1.7,1.4),{move:'giovanni',to:[gp.x,gp.z+2.4],t:1.4},
   {anim:'giovanni',a:'give',prop:'tas',naar:'luca'},
   {say:'giovanni',text:'Hier. De jas van Bella Napoli. En twee tassen. Draag ze met trots.',t:3},
   {fn:()=>{ST.jas(true);uitfit('bezorger')}},{snd:'grab'},{anim:'giovanni',a:'point',prop:null},
   {say:'giovanni',text:"Twee pizza's per tas. Nooit scheef. En lach naar de klant, dan krijg je fooi.",t:3.4},
   {say:'giovanni',text:'Drie bestellingen. Een student, meneer De Wit — die wil praten, laat hem praten — en een kantoor op de Zuidas.',t:4},
   {say:'luca',text:'De Zuidas? Dat is aan de andere kant van de stad.',t:2.4},
   {say:'giovanni',text:'Daarom heb je benen, ragazzo. Vai!',t:2.2,mood:'blij'},
   {fade:'out',t:.4},{weg:'giovanni'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);
  B.toon('napoli','giovanni',true);if(t!==RUN)return;go('h1_ritten')}});

stap('h1_ritten',{doel:"Bezorg drie bestellingen (pak je fiets bij de deur)",async start(o){const t=nieuw();zorgFiets(A('napoli',419,492));
  if(!G.bezorg){go('h1_dief');return}
  const best=[
   Object.assign({},G.bezorg.plek('student'),{klant:'student',pizzas:1,id:'stu'}),
   Object.assign({},G.bezorg.plek('oude_man'),{klant:'oude_man',pizzas:1,naam:'Meneer De Wit',id:'dewit'}),
   Object.assign({},G.bezorg.plek('kantoor'),{klant:'kantoor',pizzas:2,id:'kantoor'})].filter(b=>b.x!=null);
  const sum=await G.bezorg.start(best,{onKlaar(r){if(r.klant==='oude_man'&&r.vriendelijk>0)F('dewit_geluisterd',1)}});
  if(t!==RUN)return;F('a1_fooi',sum.fooi||0);if((sum.klachten||0)>0)ST.meter('imago',-1);
  go('h1_dief')}});

/* ---------- de dief ---------- */
stap('h1_dief',{muziek:'jacht',doel:'Terug naar Bella Napoli',async start(o){const t=nieuw();zorgFiets();
  // wacht tot je op de fiets zit en een stukje onderweg bent
  let w=0;while(t===RUN&&w<40){await sleep(500);w+=.5;if(G.fiets&&G.fiets.actief()&&(G.fiets.snelheid()>8||w>14))break;if(w>4&&!G.fiets.actief()&&w>20)break}
  if(t!==RUN)return;dief(t)}});

async function dief(t){const l=P();const s=voor(26,3.5),r=walk(s.x+1.8,s.z+.8,4);
  const sc=scooter('#f2c230');sc.position.set(s.x,0,s.z);sc.rotation.y=naar(s,l);G.scene().add(sc);
  const keus=await C.play([
   {actor:'rapido',at:[r.x,r.z],ry:naar(r,s),anim:'idle'},{actor:'scooterdief',at:[s.x-3,s.z-3],ry:naar({x:s.x-3,z:s.z-3},s)},
   rond(s.x,s.z,naar(s,l)+.8,7,2.6,1),
   {move:'scooterdief',to:[s.x-.5,s.z],t:1.2,anim:'run'},{anim:'scooterdief',a:'give',prop:'tas'},{snd:'grab'},
   {anim:'rapido',a:'schrik',naar:'scooterdief'},{say:'rapido',text:'Hé! Mijn tas! Al mijn geld van vanavond zit erin!',t:2.4,mood:'boos'},
   {move:'scooterdief',to:[s.x-6,s.z+8],t:1.5,anim:'run',wacht:false},
   rond(l.x,l.z,(l.ry||0)+PI,3.6,1.8,1.3),
   {keuze:[{t:'Achtervolgen',id:'ja'},{t:'Laten gaan',id:'nee'}],wie:'luca',text:'Hij rent jouw kant op.'}],{blijf:true});
  C.weg('scooterdief');
  if(t!==RUN){sc.parent&&sc.parent.remove(sc);return}
  if(keus!=='ja'){await C.play([rond(r.x,r.z,naar(r,l),3.4,1.6,1.4),{say:'rapido',text:'Bedankt voor niks, Napoli.',t:2,mood:'boos'}]);C.weg('rapido');sc.parent&&sc.parent.remove(sc);F('dief','gelaten');go('h1_terug');return}
  // achtervolging: hij is sneller op rechte stukken, jij in bochten
  const tgt=(()=>{let best=null;for(let k=0;k<30;k++){const a=pick(M.ADRESSEN||[]);if(!a)break;const d=hyp(a.x-s.x,a.z-s.z);if(d>200&&d<330){best=a;break}}return best||A('portiek',182,390)})();
  const pad=(M.findPath(s.x,s.z,tgt.x,tgt.z)||[]).slice();
  const d0=C.persoon('scooterdief',{x:s.x-3,z:s.z+3,anim:'run',prop:'tas'});let i=0,tt=0,klaar=false,v=0;
  ST.doel('Pak de dief!',null);sein('Achtervolging · blijf dichtbij','#ff6a5a');zorgFiets();
  const res=await new Promise(res=>{const f0=G.onFrame;let alive=true;
    const stop=r=>{if(!alive)return;alive=false;G.onFrame=f0;res(r)};
    G.onFrame=dt=>{f0&&f0(dt);if(!alive||G.paused||C.active())return;tt+=dt;const n=pad[i];
      if(!n){stop('weg');return}
      const dx=n.x-d0.x,dz=n.z-d0.z,d=hyp(dx,dz);
      // bochten: kijk naar het volgende punt
      const n2=pad[i+1];let bocht=0;if(n2){const a1=Math.atan2(dx,dz),a2=Math.atan2(n2.x-n.x,n2.z-n.z);bocht=Math.abs(Math.atan2(sin(a2-a1),cos(a2-a1)))}
      const pd=hyp(G.P.x-d0.x,G.P.z-d0.z);const vmax=(d<5&&bocht>.6?5.4:9.4)*(pd>45?.8:1);v+=(vmax-v)*Math.min(1,dt*3);
      if(d<v*dt+.1){d0.x=n.x;d0.z=n.z;i++}else{d0.x+=dx/d*v*dt;d0.z+=dz/d*v*dt;d0.ryT=Math.atan2(dx,dz);d0.v=v}
      const m=$s('svDoelM');if(m)m.textContent=Math.round(pd)+' m';
      if(pd<2.8){stop('gepakt');return}if(pd>85||tt>80){stop('weg');return}}});
  d0.weg();ST.doel(null);
  if(t!==RUN){sc.parent&&sc.parent.remove(sc);C.weg('rapido');return}
  if(res==='gepakt'){fietsAf();const l2=P(),q=voor(1.4);
    await C.play([{speler:false},{actor:'luca',at:[l2.x,l2.z],ry:l2.ry},{actor:'scooterdief',at:[q.x,q.z],ry:naar(q,l2),anim:'laag',prop:'tas'},
     rond(q.x,q.z,naar(q,l2)+.9,3.2,1.4,.7),{snd:'punch'},{say:'scooterdief',text:'Oké, oké! Hier. Neem die tas.',t:2,mood:'bang'},
     {anim:'scooterdief',a:'give',prop:null,naar:'luca'},{anim:'luca',a:'give',prop:'tas'},{move:'scooterdief',to:[q.x+12,q.z-10],t:2.2,anim:'run',wacht:false},
     {say:'luca',text:'Ja, ren maar.',t:1.6,mood:'koel'},{fade:'out',t:.5},{weg:'scooterdief'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);
    F('dief','gepakt');ST.meter('imago',4);sein('De tas gaat terug naar de bezorger van Rapido','#3fe395')}
  else{zeg('luca','Weg. Die gast is sneller dan een tram.',{t:2.4});F('dief','gelaten')}
  C.weg('rapido');sc.parent&&sc.parent.remove(sc);go('h1_terug')}

stap('h1_terug',{doel:'Terug naar Bella Napoli',waar:()=>{const a=A('napoli',419,492);return {x:a.x,z:a.z,r:9}},start(){zorgFiets()},aankomst(){fietsAf();go('h1_grote')}});

stap('h1_grote',{async start(o){const t=nieuw();fietsAf();await binnen('napoli');if(t!==RUN)return;tijd(21,0);
  B.toon('napoli','giovanni',false);const g=W('napoli',7.2,8.0),l=W('napoli',8.2,10.6),gp={x:g[0],z:g[1]};
  const gepakt=F('dief')==='gepakt';
  await C.play([{speler:false},{actor:'giovanni',at:g,ry:0,anim:'idle'},{actor:'luca',at:l,ry:PI},{fn:()=>['giovanni','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
   rond(gp.x,gp.z,.9,3.2,1.9,1.3),{fade:'in',t:.5},{titel:'Het laatste uur',sub:'21:00',t:2.4},
   ...(gepakt?[{say:'giovanni',text:'De jongen van Rapido belde. Hij zei dat een Napolitaan zijn tas terugpakte. Mijn Napolitaan!',t:3.4,mood:'blij'},
     {say:'giovanni',text:'Vanaf nu krijg jij de beste routes. Geen heuvels, geen honden.',t:2.8,mood:'blij'}]:[]),
   {snd:'notify'},{say:null,text:"Op het scherm van de kassa: 6 pizza's en mezze · Lounge Sahara, Boulevard · online betaald.",t:3.2},
   {anim:'giovanni',a:'talk'},{say:'giovanni',text:'Alle bezorgers zijn weg. Mario is ziek, de scooter is kapot.',t:2.8},
   {say:'giovanni',text:"Jij bent de enige. Drie per tas. Pas op de bocht bij het strand, daar ligt zand.",t:3.4},
   {say:'luca',text:"Lounge Sahara? Daar mag ik niet eens naar binnen.",t:2.2},
   {say:'giovanni',text:'Je gaat er niet in om te roken, ragazzo. Je brengt pizza. Vai!',t:2.6,mood:'blij'},
   {fade:'out',t:.4},{weg:'giovanni'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);
  B.toon('napoli','giovanni',true);if(gepakt)F('beste_routes',1);if(t!==RUN)return;go('h1_zwaar')}});

stap('h1_zwaar',{doel:"Breng 6 pizza's en mezze naar Lounge Sahara",waar:()=>{const a=A('sahara',655,909);return {x:a.x,z:a.z,r:8}},
  start(o){B.slot('sahara',false);zorgFiets(A('napoli',419,492));if(G.fiets){G.fiets.last(6);G.fiets.scheef(0)}sein("Zwaarbeladen: de fiets stuurt trager en remt langer",'#ffd35a')},
  aankomst(){fietsAf();go('h1_sahara')}});

/* ---------- Lounge Sahara ---------- */
stap('h1_sahara',{async start(o){const t=nieuw();fietsAf();const sch=G.fiets?G.fiets.scheef():0;if(G.fiets)G.fiets.last(0);
  await buiten();if(t!==RUN)return;tijd(21,40);
  const d=A('sahara',655,909),l=P(),u=walk(d.x+1.8,d.z+1.4,3);
  // buiten: de uitsmijter
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,d),dozen:4},{actor:'uitsmijter',at:[u.x,u.z],ry:naar(u,l),anim:'armen'},
   rond(d.x,d.z,naar(d,l)+.5,7.5,2.2,2.2),{fade:'in',t:.4},
   {move:'luca',to:[walk(d.x,d.z+1.6,2).x,walk(d.x,d.z+1.6,2).z],t:1.6,anim:'carry'},
   {say:'uitsmijter',text:'Bestelling voor de baas?',t:2},{say:'luca',text:"Zes pizza's en mezze. Online betaald.",t:2.2},
   ...(sch>0?[{say:'uitsmijter',text:'Die bovenste hangt scheef, kleine.',t:2}]:[]),
   {anim:'uitsmijter',a:'dag'},{say:null,text:'Hij knikt. De zware deur gaat open.',t:2},
   {fade:'out',t:.5},{weg:'uitsmijter'},{weg:'luca'},{binnen:'sahara'},{speler:false},
   // binnen: de camera glijdt door de zaal
   {actor:'luca',at:W('sahara',11.1,25.6),ry:PI,dozen:4},{fn:()=>{const a=C.acteur('luca');if(a)a.g.binnenId=1}},
   cam(...W3('sahara',11,3.4,27.2),...W3('sahara',10,1.4,18)),{fade:'in',t:.8},
   camNaar(...W3('sahara',17,2.6,22),...W3('sahara',6,1.2,16),5,{wacht:false}),
   {say:null,text:'Paars en goud licht. Rook van waterpijpen. Lage banken, een DJ in de hoek, voetbal op een groot scherm.',t:4},
   {move:'luca',to:W('sahara',4.6,17.6),t:3.4,anim:'carry'},
   {fn:()=>{stapelOp(B.plek('sahara','bar'),4)}},{anim:'luca',a:'idle',dozen:0},
   {say:'luca',text:'Bella Napoli. Waar moet het heen?',t:2},
   {say:null,text:'De barman wijst zonder te kijken naar de bar.',t:2},
   camNaar(...W3('sahara',8,2.0,24),...W3('sahara',11,1.2,27),2,{wacht:false}),
   {move:'luca',to:W('sahara',11.1,26.6),t:2.6},{fade:'out',t:.4},
   {anim:'luca',dozen:2},{fade:'in',t:.4},{move:'luca',to:W('sahara',4.6,19.6),t:3,anim:'carry'},
   {fn:()=>{stapelOp(B.plek('sahara','bar2'),2)}},{anim:'luca',a:'idle',dozen:0},
   {say:'luca',text:'Er is er nog één! Ik kom zo!',t:2},
   {fade:'out',t:.4},{weg:'luca'}],{blijfZwart:false});
  if(t!==RUN)return;go('h1_ronde3')}});

stap('h1_ronde3',{doel:'De bar is leeg. Breng de laatste doos naar achteren',
  waar:()=>{const p=B.plek('sahara','tafel_achter')||{x:W('sahara',6.4,4)[0],z:W('sahara',6.4,4)[1]};return {binnen:'sahara',x:p.x,z:p.z+1.2,r:1.6}},
  async start(o){const t=nieuw();await binnen('sahara');if(t!==RUN)return;
   B.toon('sahara','barman',false);G.draag.zet(1);
   const sp=W('sahara',11.1,25.4);G.P.x=sp[0];G.P.z=sp[1];G.P.ry=PI;
   zetBinnen('rafiq',...W('sahara',6.4,2.2),0,{anim:'sit',sitY:-.45});this._stil=0;this._kijk=0;
   zeg('luca','Hallo? …Iemand?',{t:2})},
  tick(dt){// in de achterkamer blijven staan = je kijkt naar het geld
   const o=B.o('sahara');if(!o||B.waar()!=='sahara')return;const lz=G.P.z-o.z;const stil=hyp(G.P.vx||0,G.P.vz||0)<.3;
   if(lz<6.5&&stil){this._kijk+=dt;if(this._kijk>3.5&&!F('nieuwsgierig')){F('nieuwsgierig',1);zeg('luca','(Zoveel geld… dat is meer dan papa in een jaar verdient.)',{t:3})}}},
  async aankomst(){const t=nieuw();const p=B.plek('sahara','tafel_achter');await G.draag.af({binnen:'sahara',plek:'tafel_achter'});if(t!==RUN)return;
   const r=C.acteur('rafiq');
   await C.play([cam(...W3('sahara',10.4,2.4,5.6),...W3('sahara',6,1.1,3)),
    {snd:'telmachine'},{say:null,text:'Stapels geld. Een telmachine die ratelt — en stopt. Dozen die je niet hoort te zien. Het wordt stil.',t:4},
    {anim:'rafiq',a:'sit',naar:'luca'},cam(...W3('sahara',3.0,2.3,5.4),...W3('sahara',6.4,1.2,3.6)),
    {say:'luca',text:'Eh… mezze. Eet smakelijk.',t:2,mood:'bang'},{wait:.6}]);
   G.story.doel('Loop naar buiten',null);F('ronde3',1);go('h1_eruit')}});
stap('h1_eruit',{doel:'Loop naar buiten',waar:()=>{const a=A('sahara',655,909);return {x:a.x,z:a.z,r:8}},
  start(o){if(o.hervat&&!B.waar()){}},tick(dt){const s=ST.steps.h1_ronde3;if(B.waar()==='sahara'&&s&&s.tick)s.tick.call(s,dt)},aankomst(){go('h1_hejongen')}});

stap('h1_hejongen',{muziek:'lounge',async start(o){const t=nieuw();await buiten();if(t!==RUN)return;C.weg('rafiq');B.toon('sahara','barman',true);stapelsWeg();
  const d=A('sahara',655,909),l=P(),ld=walk(l.x+(l.x-d.x)*.4,l.z+(l.z-d.z)*.4,3);
  const nieuws=F('nieuwsgierig');
  const r1=await C.play([{speler:false},{actor:'luca',at:[ld.x,ld.z],ry:naar(d,ld)},{actor:'rafiq',at:[d.x,d.z],ry:naar(d,ld),anim:'leun'},
   rond(ld.x,ld.z,naar(d,ld)+.4,3.4,1.5,1.4),{fade:'in',t:.3},{wait:.6},
   {say:'rafiq',text:'Hé, jongen. Kom eens even terug.',t:2.6,mood:'koel'},
   {anim:'luca',a:'turn',ry:naar(ld,d)},rond(d.x,d.z,naar(d,ld)-.5,4,1.7,1.5),
   {move:'rafiq',to:[(d.x+ld.x)/2,(d.z+ld.z)/2],t:1.8},{anim:'rafiq',a:'give',prop:'geld',naar:'luca'},
   {say:'rafiq',text:'Fooi.',t:1.4,mood:'koel'},{snd:'cash'},{fn:()=>ST.geld(300,'fooi')},{anim:'rafiq',a:'idle',prop:null},
   ...(nieuws?[{say:'rafiq',text:'Je keek goed rond daarbinnen. Nieuwsgierig, hè?',t:2.6,mood:'koel'},{say:'luca',text:'Ik… zocht de tafel.',t:1.8,mood:'bang'}]:[]),
   rond((d.x+ld.x)/2,(d.z+ld.z)/2,naar(d,ld)+1.4,2.4,1.6,1.5),
   {say:'rafiq',text:'Veel ruimte in die dozen van jou.',t:2.2},
   {say:'rafiq',text:'Ik heb klanten die ook pizza bestellen. Als er iets van mij meegaat… verdient je zaak wat?',t:3.6},
   {say:'rafiq',text:'Verdien jij wat? Duizend vijfhonderd nu. En twintig procent van elke rit.',t:3.4},
   {keuze:[{t:'Ja',id:'ja'},{t:'Nee',id:'nee'}],wie:'rafiq',text:'Nou, jongen?'}],{blijf:true});
  if(t!==RUN)return;let pct=20,bedrag=1500;
  if(r1==='nee'){await C.play([{anim:'rafiq',a:'talk'},{snd:'lach'},{say:'rafiq',text:'Ha! Onderhandelaar, hè.',t:2,mood:'blij'},
     {anim:'rafiq',a:'give',prop:'geld',naar:'luca'},{say:'rafiq',text:'Tweeënhalf. En dertig procent. Dit is het laatste wat ik zeg.',t:3},
     {keuze:[{t:'Ja',id:'ja'}],wie:'rafiq',text:'Nou?'}],{blijf:true});pct=30;bedrag=2500;ST.koers(5,'zakelijk');F('onderhandeld',1)}
  await C.play([{anim:'rafiq',a:'give',prop:'geld',naar:'luca'},{snd:'cash'},{fn:()=>ST.geld(bedrag,'van Rafiq')},{anim:'rafiq',a:'idle',prop:null},
   {say:'rafiq',text:'Morgen na school. Achter Bella Napoli. Kom niet te laat, jongen.',t:2.8,mood:'koel'},
   {move:'rafiq',to:[d.x,d.z],t:1.6,wacht:false},rond(ld.x,ld.z,naar(ld,d)+PI,1.6,1.6,1.5),{say:null,text:'Luca kijkt naar de rol briefjes in zijn hand. Zijn hand trilt een beetje.',t:3},
   {fade:'out',t:.5},{speler:true},{fade:'in',t:.5}]);
  C.weg('rafiq');C.weg('luca');F('aanbod',pct);ST.meter('loy_rafiq',5);if(t!==RUN)return;go('h1_naarhuis')}});

stap('h1_naarhuis',{doel:'Fiets naar huis',waar:()=>{const a=A('thuis',198,483);return {x:a.x,z:a.z,r:8}},start(){zorgFiets();tijd(22,20)},aankomst(){fietsAf();go('h1_thuis')}});

/* ---------- thuis: het geld ---------- */
stap('h1_thuis',{async start(o){const t=nieuw();fietsAf();await binnen('thuis');if(t!==RUN)return;tijd(22,50);uitfit('thuis');
  ['marco','giulia','elena'].forEach(k=>B.toon('thuis',k,false));
  const mp=W('thuis',3.6,6.25),gp=W('thuis',7.4,5.95),ep=W('thuis',6.0,3.0),lp=W('thuis',3.0,8.4),deur=W('thuis',2.0,8.9);
  const r=await C.play([{speler:false},
   {actor:'marco',at:mp,ry:PI,anim:'tv',sitY:-.4},{actor:'giulia',at:gp,ry:PI,anim:'schrijfzit',sitY:-.42},{actor:'elena',at:ep,ry:PI*.5,prop:'tas'},{actor:'luca',at:lp,ry:0},
   {fn:()=>['marco','giulia','elena','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
   cam(...W3('thuis',9.2,2.3,7.2),...W3('thuis',4,1.0,5.6)),{fade:'in',t:.6},
   {say:null,text:'Elena in haar verpleegstersschort, op weg naar haar nachtdienst. Marco op de bank, met zijn rug. Giulia met haar boeken.',t:4},
   {move:'elena',to:[(deur[0]+lp[0])/2+.6,(deur[1]+lp[1])/2-.4],t:2},{anim:'elena',a:'talk',naar:'luca'},
   {say:'elena',text:'Er staat soep op het fornuis. En jij, Marco: niet tillen. Ik meen het.',t:3},
   {say:'marco',text:'Ja, zuster.',t:1.4},
   {anim:'marco',a:'tv',naar:'luca'},rond(mp[0],mp[1],-.4,2.6,1.4,1.1),{say:'marco',text:'En, nog wat verdiend?',t:2},
   rond(lp[0],lp[1],PI-.3,2.4,1.6,1.5),
   {keuze:[{t:'Niks zeggen, later verstoppen',id:'verstop',sub:'Kies een plek in je kamer'},{t:'"Fooi, mam." Een deel aan Elena geven',id:'mama',sub:'€200'},{t:'Nieuwe sneakers bestellen',id:'schoen',sub:'€240'}],wie:'luca',text:'Het geld brandt in je zak.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='mama'){await C.play([{move:'luca',to:[ep[0]+.2,ep[1]+1],t:1.2},{anim:'luca',a:'give',prop:'geld',naar:'elena'},{fn:()=>ST.geld(-200,'voor mama')},
     {say:'luca',text:'Fooi, mam. Voor de boodschappen.',t:2},{anim:'elena',a:'schrik'},{say:'elena',text:'Fooi? Zoveel? …Dankjewel, lieverd.',t:2.6,mood:'blij'},
     {say:'marco',text:'Hoeveel fooi krijgt een bezorger tegenwoordig?',t:2.4},{say:'luca',text:'Rijke mensen op de Zuidas.',t:1.8},
     {say:null,text:'Marco zegt niets meer. Hij kijkt nog lang naar de tv, maar hij hoort niet wat er gezegd wordt.',t:3.4}]);
    F('geld','mama');ST.meter('fam_elena',8);ST.meter('fam_marco',-3)}
  else if(r==='schoen'){await C.play([{say:null,text:'Luca bestelt op zijn telefoon de witte sneakers waar hij al een jaar naar kijkt. Express.',t:3},{fn:()=>ST.geld(-240,'sneakers')},
     {anim:'giulia',a:'schrijfzit',naar:'luca'},rond(gp[0],gp[1],-.6,2.2,1.4,1.1),{say:'giulia',text:'Wat zit jij te grijnzen?',t:2},{say:'luca',text:'Niks. Huiswerk.',t:1.6},
     {say:'giulia',text:'Jij maakt nooit huiswerk.',t:2}]);
    F('geld','sneakers');F('sneakers',1);ST.meter('fam_giulia',-3)}
  else{F('geld','verstop')}
  await C.play([{fade:'out',t:.5},{weg:'elena'},{weg:'luca'},{fade:'in',t:.5}],{blijf:true});
  // marco en giulia blijven als figurant zitten
  C.weg('marco');C.weg('giulia');B.toon('thuis','marco',true);B.toon('thuis','giulia',true);
  if(t!==RUN)return;go(F('geld')==='verstop'?'h1_verstop':'h1_nacht')}});

stap('h1_verstop',{muziek:'thuis',doel:'Verstop het geld in je kamer',start(o){const t=nieuw();binnen('thuis').then(()=>{if(t!==RUN)return;
   const PL=B.plekken('thuis')||{};const risico={matras:1,kast:1};
   Object.keys(PL).forEach(k=>{const p=PL[k];if(!p)return;SP['vs_'+k]=G.spot({story:1,k:'verstop',x:p.x,z:p.z,r:1.3,prio:2,n:'Verstoppen: '+(p.n||k),sub:'Hier leg je het geld',col:'#ffd35a',h:1.2,
     act:()=>{Object.keys(SP).filter(s=>s.startsWith('vs_')).forEach(spotWeg);F('verstop',k);if(risico[k])F('verstop_risico',1);fx('hide');
       zeg('luca',k==='matras'?'Onder de matras. Daar kijkt toch niemand.':k==='kast'?'Achter de truien. Niemand vouwt mijn truien.':k==='rooster'?'Achter het ventilatierooster. Schroefje los, schroefje vast.':k==='schoenendoos'?'In de oude schoenendoos. Die van groep acht.':'Achter de plint. Niemand weet dat die loszit.',{t:3});
       setTimeout(()=>{if(t===RUN)go('h1_nacht')},1800)}})});
   if(!Object.keys(PL).length)go('h1_nacht')})},stop(){Object.keys(SP).filter(s=>s.startsWith('vs_')).forEach(spotWeg)}});

stap('h1_nacht',{muziek:'thuis',async start(o){const t=nieuw();await binnen('thuis');if(t!==RUN)return;
  await C.play([{fade:'out',t:.8},{say:null,text:'Luca ligt wakker. Hij hoort de deur van de flat dichtgaan: mama gaat naar haar dienst. Buiten rijdt een scooter voorbij. Hij telt het geld in zijn hoofd. Opnieuw. En opnieuw.',t:5},
   {fn:()=>{ST.avond(2);ST.tijd(16,30)}},{titel:'Avond 2',sub:"Iets extra's",t:3},{fade:'in',t:.8}]);
  if(t!==RUN)return;go('h2_tas')}});

/* ======================= AVOND 2 · Iets extra's ======================= */
stap('h2_tas',{muziek:'spanning',doel:'Ga naar de achterkant van Bella Napoli',waar:()=>{const a=A('napoli_achter',388,492);return {x:a.x,z:a.z,r:4}},
  start(o){if(o.hervat||!B.waar())zorgFiets(A('thuis',198,483));const th=A('thuis',198,483);if(!B.waar()){}else setTimeout(()=>{if(B.waar()==='thuis'){}},0);
    if(G.fiets&&!G.fiets.pos()){const q=walk(th.x+2,th.z+2,5);G.fiets.spawn(q.x,q.z,0,{kleur:'#c0261e'})}uitfit('bezorger');dienstAan(true)},
  async aankomst(){const t=nieuw();fietsAf();const l=P(),k=voor(2.2),gelaten=F('dief')==='gelaten';
   await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:gelaten?'scooterdief':'koerier',at:[k.x,k.z],ry:naar(k,l),prop:'tas'},
    rond(k.x,k.z,naar(k,l)+1.1,3.6,1.7,1.3),{fade:'in',t:.3},
    ...(gelaten?[{say:'luca',text:'Jij! Jij bent die gast van de tas!',t:2,mood:'boos'},{say:'scooterdief',text:'Rustig, Napoli. Ik werk nu voor dezelfde man als jij.',t:2.8,mood:'koel'}]
      :[{say:'koerier',text:'Jij bent de pizzajongen? Van Rafiq.',t:2.2,mood:'koel'}]),
    {anim:gelaten?'scooterdief':'koerier',a:'give',naar:'luca'},{anim:'luca',a:'give',prop:'tas'},{snd:'grab'},
    {say:null,text:'Een sporttas. Kleine pakketjes in folie, zo groot als een pak boter.',t:2.8},
    {snd:'notify'},{fn:tril},{anim:'luca',a:'bel',prop:'telefoon'},
    {say:'rafiq',text:'Onder de pizza. Nooit twee keer dezelfde route. Nooit tellen waar mensen bij zijn.',t:3.6,mood:'koel'},
    {say:'luca',text:'En als iemand het ziet?',t:1.8},{say:'rafiq',text:'Dan zien ze een pizza.',t:2,mood:'koel'},
    {fade:'out',t:.4},{speler:true},{fade:'in',t:.4}]);
   ST.inv('pakketje',2);F('tas',1);if(t!==RUN)return;go('h2_ritten')}});

stap('h2_ritten',{doel:'Vier adressen: twee gewone, twee met iets extra’s',async start(o){const t=nieuw();zorgFiets();if(!G.bezorg){go('h2_dex');return}dienstAan(false);
  const pct=F('aanbod')||20;this._agent=0;this._agentDone=!!F('agent');const self=this;
  const fam=G.bezorg.adres({klant:'familie',min:90,max:360})||G.bezorg.plek('familie'),chg=G.bezorg.adres({klant:'chagrijn',min:90,max:360}),
    fst=G.bezorg.adres({klant:'feest',min:120,max:380}),nb=G.bezorg.adres({klant:'feest',min:120,max:400});
  const best=[Object.assign({},fam,{klant:'familie',pizzas:2,id:'f'}),Object.assign({},fst,{klant:'feest',pizzas:2,extra:true,id:'x1'}),
    Object.assign({},chg,{klant:'chagrijn',pizzas:1,id:'c'}),Object.assign({},nb,{klant:'chagrijn',pizzas:1,extra:true,id:'nb',naam:'Meneer Vos'})].filter(b=>b.x!=null);
  this._n=0;
  const sum=await G.bezorg.start(best,{async onKlaar(r,ord){self._n++;
     if(r.id==='x1'&&r.ok){const d=Math.round(500*pct/100);ST.geld(d,pct+'% voor Rafiq')}
     if(r.id==='nb')await nietBetaler(t,pct);
     if(self._n===1)self._agent=1}});
  if(t!==RUN)return;sein(sum.ok+' van '+best.length+' bezorgd','#3fe395');go('h2_dex')},
  tick(dt){// de agent op de hoek: na de eerste bezorging, als je fietst
   if(this._agent&&!this._agentDone&&G.fiets&&G.fiets.actief()&&G.fiets.snelheid()>10){this._agent+=dt;if(this._agent>9){this._agentDone=true;agent(RUN)}}},
  stop(){try{G.bezorg&&G.bezorg.actief()&&G.bezorg.stop('stap')}catch(e){}}});

async function agent(t){const l=P(),q=voor(7,1.6);G.verhaalSfeer&&G.verhaalSfeer.zet('spanning');
  const r1=await C.play([{actor:'agent',at:[q.x,q.z],ry:naar(q,l),anim:'handenop'},{snd:'whistle'},rond(q.x,q.z,naar(q,l)+.7,6,2,1.3),
   {say:'agent',text:'Ho! Stop eens even, jongeman.',t:2},rond(l.x,l.z,(l.ry||0)+PI*.75,3,1.6,1.3),
   {say:'agent',text:'Je achterlicht doet het niet. Weet je wat dat kost?',t:2.6},
   {keuze:[{t:'"Sorry, agent. Ik had het niet gezien."',id:'rustig'},{t:'"Ik heb haast, man."',id:'haast'},{t:'Wegfietsen',id:'weg',sub:'Hitte omhoog'}],wie:'luca',text:''}],{blijf:true});
  if(t!==RUN){C.weg('agent');return}
  if(r1==='weg'){await C.play([{snd:'whistle'},{say:'agent',text:'HÉ! Blijf staan!',t:1.4,mood:'boos'}]);C.weg('agent');F('agent','gevlucht');ST.meter('hitte',12);
    try{G.police&&G.police.report(G.P.x,G.P.z,{story:1,stars:1,why:'weggefietst bij een agent'})}catch(e){}sein('Politie zoekt een jongen in een rode jas','#ff6a5a');return}
  let goed=r1==='rustig'?1:0;
  const r2=await C.play([{anim:'agent',a:'point',naar:'luca'},{say:'agent',text:'Wat zit er in die tassen?',t:2},
   {keuze:[{t:'"Pizza. Wilt u er een? Ze zijn nog warm."',id:'pizza'},{t:'"Gaat u niks aan."',id:'bot'},{t:'"Eh… gewoon… pizza."',id:'zenuw'}],wie:'luca',text:''}],{blijf:true});
  if(t!==RUN){C.weg('agent');return}
  if(r2==='pizza')goed++;if(r2==='zenuw')ST.meter('hitte',3);
  if(goed>=2){await C.play([{anim:'agent',a:'talk'},{say:'agent',text:'Ha. Nee, dank je. Laat dat licht maken. Volgende keer schrijf ik je op.',t:3},{say:'luca',text:'Komt goed. Fijne avond.',t:1.6,mood:'blij'}]);F('agent','gepraat');ST.meter('imago',2)}
  else{await C.play([{anim:'agent',a:'armen'},{say:'agent',text:'Tas open.',t:1.6,mood:'boos'},rond(l.x,l.z,(l.ry||0)+PI*.6,1.6,1.2,.9),{snd:'click'},
     {say:null,text:'Hij tilt het deksel van de bovenste doos op. Luca houdt zijn adem in.',t:3},{wait:.8},{say:'agent',text:'…Pepperoni.',t:1.6},
     {say:'agent',text:'Laat dat licht maken. En let op je toon.',t:2.2,mood:'boos'}]);F('agent','gecontroleerd');ST.meter('hitte',8)}
  C.weg('agent')}

async function nietBetaler(t,pct){G.verhaalSfeer&&G.verhaalSfeer.zet('spanning');const l=P(),dr=voor(1.6);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'nietbetaler',at:[dr.x,dr.z],ry:naar(dr,l)},rond(dr.x,dr.z,naar(dr,l)+1.2,2.6,1.6,1.4),
   {anim:'nietbetaler',a:'give',naar:'luca'},{say:'nietbetaler',text:'Ja, ja. Dank je. Dag.',t:1.6},{snd:'door'},{weg:'nietbetaler'},
   {say:null,text:'De deur slaat dicht. Het pakketje is weg. Het geld voor Rafiq niet.',t:2.8},
   {keuze:[{t:'Aanbellen tot hij opendoet',id:'bel'},{t:'De buurman vragen',id:'buur',sub:'Achterom'},{t:'Aan Rafiq melden',id:'rafiq',sub:'Hij regelt het'}],wie:'luca',text:'Vijftig euro. Van Rafiq.'}],{blijf:true});
  if(t!==RUN)return;const deel=Math.round(500*pct/100);
  if(r==='bel'){await C.play([{snd:'deurbel'},{wait:.8},{snd:'deurbel'},{wait:.5},{snd:'deurbel'},{wait:.3},{snd:'deurbel'},{actor:'nietbetaler',at:[dr.x,dr.z],ry:naar(dr,l)},
     {say:'nietbetaler',text:'WAT?!',t:1.2,mood:'boos'},{say:'luca',text:'Vijftig euro. Of ik bel nog honderd keer. Ik heb de hele avond.',t:2.8,mood:'koel'},
     {say:null,text:'Hij kijkt naar de rode jas. Naar de straat. Dan haalt hij zijn portemonnee tevoorschijn.',t:2.8},{anim:'nietbetaler',a:'give',prop:'geld',naar:'luca'},{snd:'cash'},
     {fade:'out',t:.3},{weg:'nietbetaler'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);ST.geld(deel,pct+'% voor Rafiq');ST.meter('imago',2);F('nb','gebeld')}
  else if(r==='buur'){const b=walk(dr.x+3,dr.z,3);await C.play([{actor:'buurman',at:[b.x,b.z],ry:naar(b,l)},rond(b.x,b.z,naar(b,l)+.8,3,1.6,1.4),
     {say:'buurman',text:'Vos? Die laat zijn keukendeur altijd open. Achterom, door de tuin. Maar ik heb niks gezegd.',t:3.4},
     {fade:'out',t:.5},{say:null,text:'De keuken. Op het aanrecht een portemonnee. Luca pakt er precies vijftig uit. Niet meer.',t:3.4},{snd:'cash'},
     {weg:'buurman'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);ST.geld(deel,pct+'% voor Rafiq');ST.meter('hitte',4);ST.koers(3,'straat');F('nb','achterom')}
  else{await C.play([{anim:'luca',a:'bel',prop:'telefoon'},{snd:'notify'},{say:'rafiq',text:'Laat maar. Ik regel het. Jij rijdt door.',t:2.4,mood:'koel'},
     {fade:'out',t:.3},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);ST.geld(deel,pct+'% voor Rafiq');ST.meter('loy_rafiq',5);F('nb','rafiq')}}

stap('h2_dex',{doel:'Dex wacht op je bij de hoek',waar:()=>{const a=A('dex',277,480);return {x:a.x,z:a.z,r:5}},start(){zorgFiets();dienstAan(true)},
  async aankomst(){const t=nieuw();fietsAf();tijd(20,40);const l=P(),d=voor(2.2);
   const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,d)},{actor:'dex',at:[d.x,d.z],ry:naar(d,l),anim:'leun'},rond(d.x,d.z,naar(d,l)+1,3.4,1.6,1.4),{fade:'in',t:.3},
    {say:'dex',text:'Pizzaman! Je was er niet bij de kooi.',t:2.2},{anim:'dex',a:'point',naar:'luca'},
    ...(F('sneakers')?[{say:'dex',text:'Wacht. Wat zijn dat voor schoenen? Sinds wanneer?',t:2.4}]:[{say:'dex',text:'Wacht. Wat zit er in je zak? Is dat een rol briefjes?',t:2.4}]),
    {say:'dex',text:'Waar haal jij dat vandaan, broer?',t:2},
    {keuze:[{t:'Vertellen',id:'ja',sub:'Hij wil meedoen'},{t:'Liegen',id:'nee',sub:'"Fooi."'}],wie:'luca',text:'Dex kent je al sinds groep drie.'}],{blijf:true});
   if(t!==RUN)return;
   if(r==='ja'){await C.play([{say:'luca',text:'Rafiq. Van Sahara. Ik neem soms iets mee onder de pizza.',t:2.6},{anim:'dex',a:'schrik'},{say:'dex',text:'Serieus?! Rafiq?',t:1.6},
      {say:'dex',text:'Broer. Ik wil meedoen. Ik meen het. Zeg het tegen hem.',t:2.6,mood:'blij'},{say:'luca',text:'Ik zal kijken. Niemand mag het weten, Dex.',t:2.2}]);F('dex','weet');ST.meter('loy_dex',8)}
   else{await C.play([{say:'luca',text:'Fooi. Rijke mensen op de Zuidas.',t:2},{snd:'lach'},{say:'dex',text:'Ja ja. Fooi.',t:1.6},{say:null,text:'Dex lacht, maar zijn ogen niet.',t:2.2}]);F('dex','gelogen');ST.meter('loy_dex',-8)}
   await C.play([{fade:'out',t:.6},{weg:'dex'},{weg:'luca'},{speler:true},{fn:()=>{ST.avond(3);ST.tijd(17,30)}},{titel:'Avond 3',sub:'Regels',t:3},{fade:'in',t:.6}]);
   if(t!==RUN)return;go('h3_rapido')}});

/* ======================= AVOND 3 · Regels ======================= */
stap('h3_rapido',{doel:'Een bestelling op de Boulevard',async start(o){const t=nieuw();zorgFiets();dienstAan(false);this._ev=!!F('rapido');const self=this;if(!G.bezorg){go('h3_tellen');return}
  const b=G.bezorg.adres({klant:'feest',wijk:'Boulevard',min:0,max:1400})||G.bezorg.plek('feest');this._b=b;
  const sum=await G.bezorg.start([Object.assign({},b,{klant:'feest',pizzas:2,id:'blv'})]);if(t!==RUN)return;go('h3_tellen')},
  tick(dt){if(this._ev||!this._b)return;const d=hyp(G.P.x-this._b.x,G.P.z-this._b.z);if(d<70&&G.fiets&&G.fiets.actief()){this._ev=true;rapido(RUN)}},
  stop(){try{G.bezorg&&G.bezorg.actief()&&G.bezorg.stop('stap')}catch(e){}}});

async function rapido(t){fietsAf();G.verhaalSfeer&&G.verhaalSfeer.zet('gevecht');const l=P(),q=voor(4.5);const sc=scooter('#f2c230');const sp=walk(q.x+1.6,q.z,3);sc.position.set(sp.x,0,sp.z);sc.rotation.y=naar(sp,l)+PI/2;G.scene().add(sc);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,q)},{actor:'rapido',at:[q.x,q.z],ry:naar(q,l),anim:'armen'},rond(q.x,q.z,naar(q,l)+.9,4.6,1.8,1.3),{fade:'in',t:.3},
   {say:'rapido',text:'Napoli. Jij weer.',t:1.6,mood:'boos'},...(F('dief')==='gepakt'?[{say:'rapido',text:'Die tas, dat was netjes. Maar de Boulevard is van Rapido. Niet van jou.',t:3.2}]:[{say:'rapido',text:'De Boulevard is van Rapido. Jullie klanten zijn nu onze klanten.',t:3}]),
   {anim:'rapido',a:'duw',naar:'luca'},{snd:'hit'},{say:'rapido',text:'Draai om. Of ik draai jou om.',t:2,mood:'boos'},
   {keuze:[{t:'Vechten',id:'vecht',sub:'Je eerste vuistgevecht'},{t:'Slim zijn',id:'slim',sub:'Straks, als hij binnen is'}],wie:'luca',text:''}],{blijf:true});
  if(t!==RUN){C.weg('rapido');C.weg('luca');sc.parent&&sc.parent.remove(sc);return}
  if(r==='vecht'){await gevecht(t,q);}
  else{await C.play([{say:'luca',text:'Ja ja. Jouw Boulevard.',t:1.6,mood:'koel'},{move:'rapido',to:[q.x+7,q.z+5],t:2.4,wacht:false},{say:null,text:'Hij lacht en loopt een portiek in met zijn bestelling. Zijn scooter laat hij staan.',t:2.8},
     {fade:'out',t:.3},{weg:'rapido'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);
    ST.doel('Prik zijn band lek (hij is binnen)',{x:sp.x,z:sp.z});const ok=await new Promise(res=>{let tt=0;const s=G.spot({story:1,k:'lek',x:sp.x,z:sp.z,r:1.8,prio:3,n:'Band lekprikken',sub:'Snel, voor hij terugkomt',col:'#ff6a5a',h:1,act:()=>{G.unspot(s);clearInterval(iv);res(true)}});
      const iv=setInterval(()=>{tt+=.25;const m=$s('svDoelM');if(m)m.textContent=Math.max(0,Math.ceil(25-tt))+' s';if(tt>=25||t!==RUN){G.unspot(s);clearInterval(iv);res(false)}},250)});
    if(t!==RUN){sc.parent&&sc.parent.remove(sc);return}
    if(ok){fx('spray');sc.position.y=-.08;sc.rotation.z=.06;const l2=P(),rp=walk(sp.x+6,sp.z+4,4);
      await C.play([{actor:'rapido',at:[rp.x,rp.z],ry:naar(rp,sp)},rond(sp.x,sp.z,1,4,1.5,.6),{say:null,text:'Pssssss.',t:1.4},{move:'rapido',to:[sp.x+1.4,sp.z+1],t:1.6},{anim:'rapido',a:'schrik'},
        {say:'rapido',text:'Wat?! WIE?!',t:1.6,mood:'boos'},{say:null,text:'Luca is al drie straten verder.',t:2}]);F('rapido','lek');ST.koers(2,'zakelijk')}
    else{await C.play([{actor:'rapido',at:[sp.x+1.5,sp.z+1.2],ry:naar({x:sp.x+1.5,z:sp.z+1.2},P())},rond(sp.x,sp.z,1.2,4,1.6,1.2),{say:'rapido',text:'Wat doe jij bij mijn scooter?!',t:1.8,mood:'boos'}],{blijf:true});await gevecht(t,{x:sp.x+1.5,z:sp.z+1.2})}}
  C.weg('rapido');C.weg('luca');setTimeout(()=>{sc.parent&&sc.parent.remove(sc)},20000);if(t===RUN)ST.doel('Een bestelling op de Boulevard',null);
  try{const h=G.bezorg&&G.bezorg.huidig();if(h&&G.setWaypoint)G.setWaypoint(h.x,h.z,h.naam)}catch(e){}zorgFiets()}
async function gevecht(t,q){const l=P();await C.play([{actor:'luca',at:[l.x,l.z],ry:naar(l,q),anim:'armen'},{actor:'rapido',at:[q.x,q.z],ry:naar(q,l),anim:'armen'},rond((l.x+q.x)/2,(l.z+q.z)/2,naar(l,q)+PI/2,4.2,1.6,1.2)],{blijf:true});
  const lu=C.acteur('luca'),ra=C.acteur('rapido');G.frozen=1e9;G.talking=true;
  const win=await vechten({wie:'Rapido',onRaak:()=>{if(ra)ra.doe('schrik');if(lu)lu.doe('duw');setTimeout(()=>{ra&&ra.doe('armen');lu&&lu.doe('armen')},350)},onGeraakt:()=>{if(ra)ra.doe('duw');if(lu)lu.doe('schrik');setTimeout(()=>{ra&&ra.doe('armen');lu&&lu.doe('armen')},350)}});
  G.frozen=0;G.talking=false;if(t!==RUN)return;
  if(win){await C.play([{anim:'rapido',a:'laag'},{say:'rapido',text:'Oké! Oké. Neem die Boulevard. Gek.',t:2.2,mood:'bang'},{move:'rapido',to:[q.x+10,q.z+8],t:2.2,anim:'run',wacht:false},{say:'luca',text:'(Mijn hand. Au. Maar: au, gewonnen.)',t:2.4},{fade:'out',t:.3},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);F('rapido','gewonnen');ST.meter('imago',3);ST.meter('hitte',3);ST.koers(3,'straat')}
  else{await C.play([{anim:'luca',a:'laag'},{say:'rapido',text:'Blijf van mijn klanten af, Napoli.',t:2,mood:'boos'},{move:'rapido',to:[q.x+10,q.z+8],t:2.4,wacht:false},{say:null,text:'Je lip bloedt. De pizza\'s zijn nog heel. Dat is iets.',t:2.6},{fade:'out',t:.3},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);F('rapido','verloren');ST.meter('imago',-2)}}

stap('h3_tellen',{doel:'Rafiq wil je spreken in Lounge Sahara',waar:()=>{const a=A('sahara',655,909);return {x:a.x,z:a.z,r:8}},start(){zorgFiets();dienstAan(true)},
  async aankomst(){const t=nieuw();fietsAf();await binnen('sahara');if(t!==RUN)return;tijd(19,10);
   const rp=W('sahara',6.4,2.2),lp=W('sahara',6.4,4.6);
   await C.play([{speler:false},{actor:'rafiq',at:rp,ry:0,anim:'tel'},{actor:'luca',at:lp,ry:PI},{fn:()=>['rafiq','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
    cam(...W3('sahara',9.6,2.2,5.2),...W3('sahara',6.4,1.0,3.2)),{fade:'in',t:.5},
    ...(F('nb')==='rafiq'?[{say:'rafiq',text:'Meneer Vos heeft betaald. Hij is tegen een deur gelopen, zegt hij. Blauw oog.',t:3.2,mood:'koel'}]:[]),
    ...(F('agent')==='gevlucht'?[{say:'rafiq',text:'En jij fietst weg van agenten. In een rode jas. Slim, jongen. Heel slim.',t:3.2,mood:'boos'}]:[]),
    {say:'rafiq',text:'Ga zitten. Ik laat je iets zien.',t:2},
    rond(rp[0],rp[1],.6,1.6,1.4,.9),{anim:'rafiq',a:'tel',prop:'geld'},{snd:'telmachine'},
    {say:'rafiq',text:'Een rol tel je zonder te kijken. Met je duim. Twintig, veertig, zestig…',t:3.2},
    {say:'rafiq',text:'Geld is stil. Mensen praten. Onthoud dat.',t:2.6,mood:'koel'},
    {say:'rafiq',text:'Nu jij. En let op: er zit vals tussen. Verkeerde kleur, geen strip.',t:3}],{blijf:true});
   if(t!==RUN)return;G.frozen=1e9;const res=await tellen();G.frozen=0;if(t!==RUN)return;
   const sc=res.score;ST.meter('loy_rafiq',sc>=80?8:sc>=50?4:-2);F('tellen',sc);
   await C.play([{anim:'rafiq',a:'idle',prop:null},
    {say:'rafiq',text:sc>=80?'…Niet slecht. Echt niet slecht. Mijn neef doet er twee keer zo lang over.':sc>=50?'Langzaam. Maar je leert.':'Dit was geen tellen, jongen. Dit was gokken.',t:3,mood:sc>=80?'blij':'koel'},
    ...(sc>=80?[{anim:'rafiq',a:'give',prop:'geld',naar:'luca'},{snd:'cash'},{fn:()=>ST.geld(150,'bonus')}]:[]),
    {fade:'out',t:.5},{weg:'rafiq'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);
   if(t!==RUN)return;go('h3_verjaardag')}});

stap('h3_verjaardag',{doel:'Naar huis: Marco is jarig',waar:()=>{const a=A('thuis',198,483);return {x:a.x,z:a.z,r:8}},start(){zorgFiets()},
  async aankomst(){const t=nieuw();fietsAf();await binnen('thuis');if(t!==RUN)return;tijd(20,30);
   ['marco','giulia','elena'].forEach(k=>B.toon('thuis',k,false));
   const tafel=B.plek('thuis','eettafel')||{x:W('thuis',7.4,5.2)[0],y:.81,z:W('thuis',7.4,5.2)[1]};
   const mp=W('thuis',7.4,4.1),gp=W('thuis',6.2,6.2),ep=W('thuis',8.6,6.2),lp=W('thuis',7.4,6.8);
   const taart=maakTaart();taart.position.set(tafel.x,(tafel.y||.81),tafel.z);taart.binnenId=1;G.scene().add(taart);
   const opties=[{t:'Een duur horloge',id:'duur',sub:'€450'},{t:'Een nieuwe werkjas voor de haven',id:'jas',sub:'€90'},{t:'Een kaart die je zelf hebt gemaakt',id:'kaart',sub:'Gratis'}].filter(o=>o.id!=='duur'||ST.geld()>=450);
   const r=await C.play([{speler:false},{actor:'marco',at:mp,ry:0,anim:'sit',sitY:-.4},{actor:'giulia',at:gp,ry:PI*.85},{actor:'elena',at:ep,ry:PI*1.15},{actor:'luca',at:lp,ry:PI},
    {fn:()=>['marco','giulia','elena','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
    cam(tafel.x+2.6,2.2,tafel.z+2.6,tafel.x,1.0,tafel.z),{fade:'in',t:.6},
    {say:null,text:'Marco wordt vijftig. Giulia heeft een taart gekocht van haar bijbaan. Iedereen zingt, Marco het hardst en het valst.',t:4},
    {anim:'marco',a:'juich'},{say:'marco',text:'Vijftig! Mijn rug is honderd, maar ik ben vijftig.',t:2.6,mood:'blij'},
    {say:'giulia',text:'Cadeautjes! Luca eerst. Hij heeft al de hele avond een geheimzinnig gezicht.',t:2.8,mood:'blij'},
    rond(lp[0],lp[1],PI-.4,2.2,1.6,1.4),{keuze:opties,wie:'luca',text:'Wat geef je papa?'}],{blijf:true});
   if(t!==RUN){taart.parent&&taart.parent.remove(taart);return}
   if(r==='duur'){await C.play([{fn:()=>ST.geld(-450,'horloge')},{anim:'luca',a:'give',prop:'pakket',naar:'marco'},{anim:'marco',a:'give',prop:'pakket'},
      rond(mp[0],mp[1],.3,1.6,1.4,1.2),{say:null,text:'Marco maakt het doosje open. Hij kijkt lang. Heel lang.',t:3},
      {say:'marco',text:'…Waar heb je dit van betaald, Luca?',t:2.2},{say:'luca',text:'Gespaard. Fooi.',t:1.6},{say:'marco',text:'Fooi.',t:1.4},
      {say:null,text:'Elena kijkt naar Marco. Giulia kijkt naar Luca. Niemand zegt iets. De kaarsjes branden op.',t:3.4}]);F('cadeau','duur');ST.meter('fam_marco',-5);ST.meter('fam_elena',-2);ST.meter('fam_giulia',-2)}
   else if(r==='jas'){await C.play([{fn:()=>ST.geld(-90,'werkjas')},{anim:'luca',a:'give',prop:'pakket',naar:'marco'},{anim:'marco',a:'give',prop:'pakket'},
      {say:'marco',text:'Mijn oude is helemaal versleten. Hoe wist jij dat?',t:2.6,mood:'blij'},{say:'luca',text:'Ik zie je elke ochtend met dat ding.',t:2},
      {say:'elena',text:'Hij heeft hem van zijn eigen geld gekocht, Marco.',t:2.2,mood:'blij'}]);F('cadeau','jas');ST.meter('fam_marco',8);ST.meter('fam_elena',3)}
   else{await C.play([{anim:'luca',a:'give',naar:'marco'},{say:null,text:'Een kaart. Op de voorkant een kraan in de haven, getekend met balpen. Binnenin: "Voor de sterkste man van de haven."',t:3.6},
      {anim:'marco',a:'juich'},{say:'marco',text:'Die hang ik op. Op het werk. Iedereen gaat hem zien.',t:2.6,mood:'blij'}]);F('cadeau','kaart');ST.meter('fam_marco',4);ST.meter('fam_giulia',3)}
   await C.play([{fade:'out',t:.6},{weg:'marco'},{weg:'giulia'},{weg:'elena'},{weg:'luca'},{speler:true},{fade:'in',t:.6}]);
   ['marco','giulia','elena'].forEach(k=>B.toon('thuis',k,k!=='elena'));setTimeout(()=>taart.parent&&taart.parent.remove(taart),30000);
   if(t!==RUN)return;go('h3_strand')}});
function maakTaart(){const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c});const b=new TH.Mesh(new TH.CylinderGeometry(.22,.22,.14,10),m('#f1e6d0'));b.position.y=.07;g.add(b);
  const t=new TH.Mesh(new TH.CylinderGeometry(.225,.225,.03,10),m('#c0261e'));t.position.y=.15;g.add(t);
  for(let i=0;i<5;i++){const a=i/5*PI*2,k=new TH.Mesh(new TH.BoxGeometry(.02,.08,.02),m('#7fd1ff'));k.position.set(cos(a)*.13,.2,sin(a)*.13);g.add(k);const v=new TH.Mesh(new TH.BoxGeometry(.025,.03,.025),new TH.MeshBasicMaterial({color:'#ffd35a'}));v.position.set(cos(a)*.13,.255,sin(a)*.13);g.add(v)}return g}

stap('h3_strand',{muziek:'spanning',doel:'Nachtlevering bij de strandtenten',async start(o){const t=nieuw();await buiten();if(t!==RUN)return;zorgFiets();dienstAan(false);tijd(23,20);
  try{G.weerZet&&G.weerZet('mist',true)}catch(e){}
  const s=A('strand_nacht',900,960);this._s=s;this._ev=!!F('nova_gezien');this._trail=[];this._vol=null;
  if(!G.bezorg){go('h4_rit');return}
  const sum=await G.bezorg.start([{x:s.x,z:s.z,adres:'Strandtent De Zeemeeuw',naam:'Strandtent De Zeemeeuw',klant:'feest',pizzas:2,extra:true,id:'strand'}],{onKlaar(r){if(r.ok){const pct=F('aanbod')||20;ST.geld(Math.round(500*pct/100),pct+'% voor Rafiq')}}});
  if(t!==RUN)return;volgerWeg(this);try{G.weerZet&&G.weerZet('',true)}catch(e){}go('h4_start')},
  tick(dt){// iemand volgt je: een figuur in het donker, een paar seconden achter je
   const tr=this._trail;tr.push({x:G.P.x,z:G.P.z,ry:G.P.ry});if(tr.length>220)tr.shift();
   if(!this._vol&&tr.length>120&&!this._ev&&G.fiets&&G.fiets.actief()){this._vol=C.persoon(C.actors.nova_m?'nova_m':'nova',{anim:'walk'})}
   if(this._vol&&tr.length>100){const q=tr[tr.length-100];this._vol.x=q.x;this._vol.z=q.z;this._vol.ryT=q.ry;this._vol.v=hyp(G.P.x-q.x,G.P.z-q.z)>.5?5:0}
   if(!this._ev&&this._s&&hyp(G.P.x-this._s.x,G.P.z-this._s.z)<45&&this._vol){this._ev=true;novaScene(RUN,this)}},
  stop(){volgerWeg(this);try{G.weerZet&&G.weerZet('',true)}catch(e){}try{G.bezorg&&G.bezorg.actief()&&G.bezorg.stop('stap')}catch(e){}}});
function volgerWeg(s){if(s&&s._vol){s._vol.weg();s._vol=null}}
async function novaScene(t,st){const v=st._vol;if(!v)return;const l=P();
  await C.play([cam(l.x+sin(l.ry)*1.2,1.1,l.z+cos(l.ry)*1.2,v.x,1.5,v.z),{snd:'heart'},
   {say:null,text:'In het rode schijnsel van je achterlicht: een figuur. Een masker. Hij staat stil als jij stilstaat.',t:3.6},
   camNaar(v.x+sin(l.ry)*3,1.6,v.z+cos(l.ry)*3,v.x,1.5,v.z,1.4),{say:'luca',text:'Hallo? …Wie is daar?',t:2,mood:'bang'},
   {fn:()=>{v.loop(v.x-sin(l.ry)*10,v.z-cos(l.ry)*10,{t:1.6})}},{wait:1.2},{say:null,text:'Weg. Alleen de mist en de zee.',t:2.4}]);
  volgerWeg(st);F('nova_gezien',1);ST.meter('hitte',2)}

/* ======================= AVOND 4 · Het verkeerde huis ======================= */
stap('h4_start',{async start(o){const t=nieuw();await C.play([{fade:'out',t:.8},{say:null,text:'Luca slaapt tot twaalf uur. Hij droomt niet.',t:2.6},{fn:()=>{ST.avond(4);ST.tijd(21,30)}},{titel:'Avond 4',sub:'Het verkeerde huis',t:3.2},{fade:'in',t:.8}]);
  if(t!==RUN)return;go('h4_rit')}});
stap('h4_rit',{muziek:'spanning',doel:'Laatste rit: een rijtjeshuis in Oud-Zuid',waar:()=>{const a=A('rijtjeshuis',858,754);return {x:a.x,z:a.z,r:8}},
  start(o){zorgFiets();dienstAan(false);B.slot('rijtjeshuis',true,'Je hebt hier niks te zoeken');this._stil=false;tijd(21,40);
    if(!o.hervat){tril();zeg('giovanni','Laatste rit, ragazzo. Rijtjeshuis in Oud-Zuid, online betaald. Daarna naar huis.',{t:3.2})}
    if(G.fiets){G.fiets.last(1);G.fiets.scheef(0)}},
  tick(){const a=A('rijtjeshuis',858,754);if(!this._stil&&hyp(G.P.x-a.x,G.P.z-a.z)<70){this._stil=true;zeg('luca','Gordijnen dicht. Geen auto’s. Het is hier stil. Te stil.',{t:3})}},
  aankomst(){fietsAf();go('h4_binnen')}});

stap('h4_binnen',{async start(o){const t=nieuw();fietsAf();if(G.fiets)G.fiets.last(0);B.slot('rijtjeshuis',false);
  const d=A('rijtjeshuis',858,754),l=P();
  if(!B.waar()){await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,d),dozen:1},rond(d.x,d.z,naar(d,l)+.4,4.6,1.7,1.6),{fade:'in',t:.3},
    {move:'luca',to:[walk(d.x,d.z,2).x,walk(d.x,d.z,2).z],t:1.4,anim:'carry'},{snd:'deurbel'},{wait:1.2},
    {say:null,text:'De deur gaat open. Maar niet door de klant.',t:2.4},{snd:'door'},{snd:'scream'},{fade:'out',t:.15},{weg:'luca'},{binnen:'rijtjeshuis'}],{blijfZwart:true})}
  else await binnen('rijtjeshuis');
  if(t!==RUN)return;uitfit(null);
  const bank=B.plek('rijtjeshuis','bank')||{x:W('rijtjeshuis',5.4,5.4)[0],z:W('rijtjeshuis',5.4,5.4)[1]},muur=B.plek('rijtjeshuis','muur')||{x:W('rijtjeshuis',10.6,6)[0],z:W('rijtjeshuis',10.6,6)[1]};
  const lp=W('rijtjeshuis',4.2,8.0),m1=W('rijtjeshuis',2.6,8.6),m2=W('rijtjeshuis',6.2,7.4),nv=W('rijtjeshuis',7.6,5.0),L={x:lp[0],z:lp[1]};
  const vragen=[
   {wie:'masker',q:'Voor wie werk jij?',o:[['stoer','"Voor Bella Napoli. Wil je een menukaart?"'],['bang','"Ik… ik bezorg alleen pizza, ik zweer het."'],['slim','"Voor wie de bestelling plaatst. Ik kijk niet in de dozen."']]},
   {wie:'masker2',q:'Hoe lang doe je dit al?',o:[['stoer','"Lang genoeg."'],['bang','"Drie dagen… alsjeblieft, ik wil naar huis…"'],['slim','"Sinds deze week. En ik weet nu al dat het een slecht idee was."']]},
   {wie:'masker',q:'Wie stopt dit in je pizzadoos?',o:[['stoer','"Je moeder."'],['bang','"Een man… ik weet zijn naam niet…"'],['slim','"Iemand die ik nooit zie. Een tas achter de pizzeria. Zo werkt het."']]}];
  const tel={stoer:0,bang:0,slim:0};
  await C.play([{speler:false},
   {actor:'luca',at:lp,ry:PI*.25,anim:'bang'},{actor:'klant_bang',at:[bank.x,bank.z],ry:PI,anim:'sit',sitY:-.42},{actor:'masker',at:m1,ry:naar({x:m1[0],z:m1[1]},L),anim:'armen'},{actor:'masker2',at:m2,ry:naar({x:m2[0],z:m2[1]},L),anim:'armen'},
   {actor:'nova_m',at:nv,ry:naar({x:nv[0],z:nv[1]},L),anim:'leun'},
   {fn:()=>['luca','klant_bang','masker','masker2','nova_m'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
   cam(...W3('rijtjeshuis',9.6,2.2,9.4),...W3('rijtjeshuis',5,1.0,6.5)),{fade:'in',t:.25},{snd:'heart'},
   {say:null,text:'Bivakmutsen. De klant zit op de bank, gezicht naar de grond. Iemand trekt de doos uit je handen.',t:3.4},
   rond(lp[0],lp[1],PI*.25+PI,1.8,1.7,1.5),{anim:'masker',a:'point',naar:'luca'},
   {say:'masker',text:'Voor wie werk jij? Wie stopt dit in je pizzadoos?',t:2.8,mood:'boos'}],{blijf:true});
  for(const v of vragen){if(t!==RUN)return;const r=await C.play([rond(lp[0],lp[1],PI*1.1,2.2,1.6,1.4),
     {keuze:v.o.map(([k,x])=>({t:x,id:k})),wie:v.wie,text:v.q}],{blijf:true});tel[r]=(tel[r]||0)+1;
    await C.play([{snd:r==='stoer'?'punch':'heart'},...(r==='stoer'?[{anim:v.wie,a:'duw',naar:'luca'},{anim:'luca',a:'schrik'}]:[]),{wait:.5}],{blijf:true})}
  if(t!==RUN)return;F('verhoor',tel);
  const lieg=tel.slim===3;
  const r=await C.play([rond(nv[0],nv[1],-.6,2.6,1.6,1.5),{anim:'nova_m',a:'talk'},
   {say:'nova_m',text:tel.stoer>=2?'Grote mond voor zo’n klein ventje.':'Het is nog maar een jong ventje. Hij weet niet eens wat hij vervoert.',t:3},
   {fn:()=>G.verhaalSfeer&&G.verhaalSfeer.zet('ray')},{snd:'door'},{actor:'ray',at:W('rijtjeshuis',2.0,9.6),ry:naar({x:W('rijtjeshuis',2,9.6)[0],z:W('rijtjeshuis',2,9.6)[1]},L)},{fn:()=>{const a=C.acteur('ray');if(a)a.g.binnenId=1}},
   cam(...W3('rijtjeshuis',5.4,2.4,4.2),...W3('rijtjeshuis',2.0,1.4,9.6)),
   {say:null,text:'Een grote, kalme man komt binnen. Zonder masker. Iedereen gaat rechtop staan.',t:3.2},
   {anim:'masker',a:'idle'},{anim:'masker2',a:'idle'},{anim:'nova_m',a:'idle'},
   {move:'ray',to:[lp[0]-.9,lp[1]+.5],t:2.2},{anim:'ray',a:'hurk',naar:'luca'},rond(lp[0],lp[1],PI*.75,2.3,1.4,1.0),
   {say:'ray',text:'Hoe heet je?',t:1.6,mood:'koel'},{say:'luca',text:'…Luca.',t:1.4,mood:'bang'},
   {say:'ray',text:'Luca. Mooie naam. Weet je wie ik ben, Luca?',t:2.6},
   {anim:'ray',a:'duw',naar:'luca'},{move:'luca',to:[muur.x-1,muur.z],t:.35},{snd:'hit'},{anim:'luca',a:'bang'},
   rond(muur.x-1,muur.z,.35,2.3,1.5,1.3),{say:null,text:'Geen bloed. Wel angst.',t:2},
   {move:'ray',to:[muur.x-2.1,muur.z+.3],t:1},{anim:'ray',a:'give',prop:'envelop',naar:'luca'},
   {say:'ray',text:'Vijfduizend euro. Voor jou. Vertel me wie je leverancier is, en je werkt voortaan voor mij.',t:3.6,mood:'koel'},
   {say:'ray',text:'Per rit verdien je meer dan bij hem in een maand.',t:2.6},
   {keuze:[{t:'Rafiq verraden',id:'verraad',sub:'De envelop'},{t:'Zwijgen',id:'zwijg',sub:'Loyaal'},...(lieg?[{t:'Liegen: een verkeerde naam',id:'lieg',sub:'Alleen als je slim bent gebleven'}]:[])],wie:'ray',text:'Nou, Luca?'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='verraad'){await C.play([{say:'luca',text:'…Rafiq. Lounge Sahara.',t:2,mood:'bang'},{say:'ray',text:'Zie je. Zo moeilijk was dat niet.',t:2.2,mood:'blij'},
     {anim:'luca',a:'give',prop:'envelop'},{snd:'cash'},{fn:()=>ST.geld(5000,'envelop')},{say:'ray',text:'Nova geeft je een nummer. Je bent nu van ons.',t:2.6}],{blijf:true});
    F('envelop','verraden');ST.koers(10,'straat');F('rafiq_lek',1);ST.meter('loy_ray',15)}
  else if(r==='zwijg'){await C.play([{say:null,text:'Luca zegt niets. Tien seconden. Twintig.',t:2.6},{anim:'ray',a:'talk'},{say:'ray',text:'Loyaal. Dat is zeldzaam.',t:2.2,mood:'blij'},
     {anim:'ray',a:'give',prop:'telefoon',naar:'luca'},{say:'ray',text:'Mijn nummer. Voor als je ooit genoeg hebt van pizza.',t:2.6}],{blijf:true});
    F('envelop','zwijgen');F('ray_nummer',1);ST.koers(10,'zakelijk');ST.meter('loy_rafiq',10);ST.meter('loy_ray',5)}
  else{await C.play([{say:'luca',text:'Een gast uit de haven. Bij de kranen. Ze noemen hem… Teun.',t:2.8},{anim:'ray',a:'idle'},{say:null,text:'Ray kijkt hem lang aan. Nova schudt bijna onzichtbaar haar hoofd.',t:3},
     {say:'ray',text:'Teun. Goed.',t:1.6,mood:'koel'},{anim:'ray',a:'give',prop:'envelop',naar:'luca'},{snd:'cash'},{fn:()=>ST.geld(2500,'halve envelop')},
     {say:'ray',text:'De helft. De andere helft als het klopt.',t:2.4}],{blijf:true});
    F('envelop','gelogen');F('vijand_teun',1);ST.meter('loy_ray',-5)}
  await C.play([{say:'ray',text:'Ga naar huis, Luca. Je moeder maakt zich zorgen.',t:2.6,mood:'koel'},{say:null,text:'Hoe weet hij dat?',t:2},{fade:'out',t:.8},
   {weg:'ray'},{weg:'masker'},{weg:'masker2'},{weg:'nova_m'},{weg:'klant_bang'},{weg:'luca'},{buiten:true}],{blijfZwart:true});
  if(t!==RUN)return;go('h4_einde')}});

stap('h4_einde',{muziek:'ray',async start(o){const t=nieuw();await buiten();if(t!==RUN)return;zorgFiets();tijd(23,40);
  try{G.fiets&&G.fiets.op()}catch(e){}const l=P(),R=A('hoek',236,461),H=A('haven',735,120),pol=A('politie',655,349),env=F('envelop');
  await C.play([{cam:{volg:'luca',af:[1.6,1.2,-4.2],kijk:[0,1.2,0]}},{fade:'in',t:1},
   {say:null,text:env==='verraden'?'Luca op de fiets. Vijfduizend euro onder zijn jas. Het voelt zwaarder dan zes pizza’s.':env==='gelogen'?'Luca op de fiets. Een halve envelop en een naam die niet klopt.':'Luca op de fiets. Geen envelop. Wel een nummer in zijn zak.',t:3.6},
   {snd:'notify'},{fn:tril},{say:null,text:'Zijn telefoon trilt. Rafiq.',t:2},{snd:'notify'},{fn:tril},{say:null,text:'Hij trilt nog een keer. Onbekend nummer.',t:2.4},
   {fade:'out',t:1.2},{dream:true},{speler:false},
   {actor:'ray',at:[R.x,R.z],ry:0,anim:'leun'},cam(R.x+5,2.2,R.z+5,R.x,1.5,R.z),{fade:'in',t:.6},{wait:2},{fade:'out',t:.4},
   {actor:'bakker',at:[pol.x,pol.z+3],ry:PI,look:{skin:'#e8c4a0',hair:'#8a8478',hs:'kort',eye:'#3a4a60',mood:'koel',top:{kind:'suit',c:'#3a3f48',c2:'#e8e4da'},legs:{kind:'jeans',c:'#3a3f48'},shoes:{kind:'boot',c:'#1a1a1c'}},anim:'point'},
   cam(pol.x+3,1.8,pol.z+6,pol.x,1.5,pol.z+3),{fade:'in',t:.4},{say:null,text:'Rechercheur Bakker prikt een foto op een bord. Een jongen in een rode jas.',t:3},{fade:'out',t:.4},
   cam(H.x+90,70,H.z+110,H.x,4,H.z),{fade:'in',t:.4},camNaar(H.x-40,30,H.z+50,H.x,2,H.z,3.4),{fade:'out',t:.5},{dream:false},
   {titel:'Seizoen 2',sub:G.h2&&G.h2.live&&G.h2.live()?'Twee bazen':'Coming soon',t:3.6},{weg:'ray'},{weg:'bakker'},{speler:true},{fade:'in',t:1}]);
  if(t!==RUN)return;F('h1_klaar',Date.now());if(G.h2&&G.h2.live&&G.h2.live()&&G.h2.mag&&G.h2.mag()){G.h2.begin();return}go('h1_vrij');seizoen2()}});

stap('h1_vrij',{doel:null,start(o){dienstAan(true);const zetDoel=()=>ST.doel(G.h2&&G.h2.live&&G.h2.live()?'Seizoen 2 is uit · extra diensten bij Giovanni':'Seizoen 2 · coming soon. Extra diensten bij Giovanni',null);zetDoel();setTimeout(zetDoel,2000);zorgFiets();B.slot('rijtjeshuis',true,'Daar ga je nooit meer naar binnen');
  // zodra Seizoen 2 live is, gaat het verhaal vanzelf verder
  setTimeout(()=>{if(ST.huidig()==='h1_vrij'&&G.h2&&G.h2.live&&G.h2.live())G.h2.begin()},2500)}});
G.h1.test={agent,nietBetaler,rapido,dief,gevecht};
}

/* =================== Seizoen 2: de poort =================== */
function seizoen2(){const vip=ST.vip&&ST.vip(),s=ST.st(),m=s.m||{},kz=m.koers||0;
  const route=kz>8?'zakelijk':kz<-8?'straat':'nog open';
  ST.kaart(`<small>De Bezorger · Seizoen 1 uitgespeeld</small><b>Je werkt nu voor twee bazen</b>
   <p>Envelop: <b>${F('envelop')==='verraden'?'aangenomen':F('envelop')==='gelogen'?'half':'geweigerd'}</b> · Koers: <b>${route}</b> · Verhaalgeld: <b>${eur(s.geld)}</b></p>
   ${G.h2&&G.h2.live&&G.h2.live()?'<p><b>Seizoen 2 is uit.</b> Twee bazen, twee telefoons. Al je keuzes gaan mee.</p>':'<p><b>Seizoen 2 · coming soon.</b> De straat, de haven, Ray en Rafiq tegelijk. Al je keuzes blijven bewaard en komen terug.</p>'}
   ${vip?'':'<p>Seizoen 2 en verder speel je met VIP of High roller.</p>'}<div class="sv-k-b">${vip?'':'<a class="btn ghost" href="/lidmaatschap#verhaal">Bekijk lidmaatschap</a>'}<button class="btn" data-x>Verder rondfietsen</button></div>`)}

/* =================== zijmissie: extra dienst bij Giovanni =================== */
// Op de kaart als kleine zijmissie. Twee bestellingen, verhaalgeld + fooi. Kan tussen de hoofdmissies door (niet midden in een rit).
let dienstOk=false,dienstSpot=null,dienstCd=0;
function dienstAan(on){dienstOk=!!on;const n=A('napoli',419,492);try{if(on&&!G.bezorg.actief())G.kaart&&G.kaart.missie&&G.kaart.missie('h1_dienst',{soort:'zij',x:n.x,z:n.z,n:'Extra dienst · Giovanni'});else G.kaart&&G.kaart.missie&&G.kaart.missie('h1_dienst',null)}catch(e){}}
function dienstInit(){if(!G.spot||dienstSpot)return;const n=A('napoli',419,492),p=walk(n.x+2.2,n.z+1.6,3);
  dienstSpot=G.spot({story:1,k:'dienst',x:p.x,z:p.z,r:2.4,prio:2,n:'Extra dienst',sub:'Giovanni heeft nog bestellingen',col:'#3fe395',h:2.2,
    show:()=>dienstOk&&!B.waar()&&!(G.bezorg&&G.bezorg.actief())&&!C.active()&&Date.now()>dienstCd,
    act:async()=>{if(!G.bezorg)return;dienstCd=Date.now()+90e3;dienstAan(false);zorgFiets();
      const k=pick([['student','familie'],['oude_man','feest'],['kantoor','chagrijn'],['familie','feest']]);
      const best=k.map((kl,i)=>Object.assign({},G.bezorg.adres({klant:kl,min:80,max:380}),{klant:kl,pizzas:1+(Math.random()<.4?1:0),id:'d'+i})).filter(b=>b.x!=null);
      await zeg('giovanni',pick(['Ah, ragazzo! Ik heb er nog twee. Snel, ze worden koud!','Twee bestellingen. Nooit scheef, hè!','Jij weer? Bravo. Hier, twee adressen.']),{t:2.4});
      const sum=await G.bezorg.start(best,{loon:3});if(sum&&sum.ok)ST.meter('imago',1);dienstAan(true)}})}

/* =================== geheime klus (niet op de kaart): de boodschappen van buurvrouw Ans =================== */
let ansSpot=null;
function ansInit(){if(!G.spot||ansSpot)return;const a=A('ans',223,483);
  ansSpot=G.spot({story:1,k:'ans',x:a.x,z:a.z,r:2.6,prio:2,n:'Buurvrouw Ans',sub:'Ze staat met vier tassen bij de lift',col:'#ffb0d0',h:2,
    show:()=>!ST.flag('ans')&&ST.avond()>=2&&!B.waar()&&!C.active()&&!(G.bezorg&&G.bezorg.actief()),
    act:async()=>{const l=P(),q=voor(1.8);const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'buurvrouw_ans',at:[q.x,q.z],ry:naar(q,l)},rond(q.x,q.z,naar(q,l)+1,3,1.6,1.4),
       {say:'buurvrouw_ans',text:'Luca, jongen! De lift is wéér kapot. En ik woon op acht.',t:2.6},
       {keuze:[{t:'Tassen naar boven dragen',id:'ja'},{t:'"Sorry, ik moet werken."',id:'nee'}],wie:'luca',text:''}],{blijf:true});
      if(r==='ja'){await C.play([{fade:'out',t:.5},{say:null,text:'Acht trappen. Vier tassen. Een pot augurken die bijna sneuvelt.',t:3},{fade:'in',t:.5},
         {say:'buurvrouw_ans',text:'Hier, voor jou. Nee, niet weigeren. En zeg tegen je moeder dat ze te hard werkt.',t:3,mood:'blij'},{fn:()=>ST.geld(20,'van Ans')}]);ST.meter('imago',2);ST.meter('fam_elena',2);ST.flag('ans','geholpen')}
      else{await C.play([{say:'buurvrouw_ans',text:'Natuurlijk, natuurlijk. Jullie jongeren hebben het druk.',t:2.4}]);ST.flag('ans','nee')}
      C.weg('luca');C.weg('buurvrouw_ans')}})}

/* =================== opstarten =================== */
const iv=setInterval(()=>{if(!G.ready||!G.story||!G.cut||!G.binnen||!G.story.step)return;clearInterval(iv);
  ST=G.story;C=G.cut;B=G.binnen;K=G.kit;
  try{cast()}catch(e){console.error(e)}css();
  // Sahara is dicht tot de grote bestelling (behalve als je al verder bent)
  const s=ST.st();const vroeg=['start','h1_klas','h1_naarbuiten','h1_plein','h1_fiets','h1_napoli','h1_giovanni','h1_ritten','h1_dief','h1_terug','h1_grote'];
  if(vroeg.includes(s.step))B.slot('sahara',true,'Lounge Sahara · alleen op uitnodiging');
  if(!['h4_rit','h4_binnen'].includes(s.step))B.slot('rijtjeshuis',true,'Je hebt hier niks te zoeken');
  registreer();
  setTimeout(()=>{try{dienstInit();ansInit()}catch(e){console.error(e)}},800);
},120);
G.h1={vechten,tellen,dienstAan,seizoen2,lib:{A,P,F,W,W3,walk,voor,naar,tijd,zorgFiets,fietsAf,binnen,buiten,cam,camNaar,rond,rondNaar,tril,mgOpen,css,scooter,zetBinnen,stapelOp,stapelsWeg,fx,zeg,sein,sleep,eur,pick,rr,clamp,hyp},stappen:()=>Object.keys((G.story&&G.story.steps)||{}).filter(k=>/^h\d|^start/.test(k))};
})();
