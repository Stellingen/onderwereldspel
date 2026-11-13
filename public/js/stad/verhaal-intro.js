// Verhaal "De Bezorger": de intro (G.verhaalIntro). Een misdaadverslaggever vertelt (ingesproken stem, audio/verhaal/intro.mp3:
// stem + muziek + geluidseffecten in één spoor), met ondertitels en beelden die volgen wat hij zegt. Alles loopt op de tijd van
// de audio; lukt afspelen niet, dan op de klok. Eindigt in zwart, daarna begint hoofdstuk 1 in het klaslokaal.
// Speelt één keer voor het verhaal begint (stap 'start' in stad-h1.js); via de telefoon opnieuw; overslaan zoals elke cutscène.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const STAD_NAAM='Noordhaven';
const V=2.0;   // de stem begint 2 s na de muziek
// wat de verteller zegt, met de starttijd in de stem (seconden)
const TEKST=[
 [0.0,'Goedenavond.'],[1.31,'Weer een villa die in de fik staat.'],[3.52,'Weer een container die net te laat wordt onderschept.'],
 [6.60,'Weer een naam die niemand hardop wil uitspreken.'],[10.10,'Luca De Santis.'],[12.11,'Zestien was hij.'],
 [13.25,'Een jongen op een fiets.'],[14.82,'Rode bezorgjas.'],[16.13,'Zes pizza’s op de bagagedrager.'],
 [18.60,'Niemand die naar hem keek.'],[20.21,'Niemand die dacht dat die jongen ooit iets zou worden.'],
 [23.28,'Acht jaar later heeft hij half Europa in handen.'],[26.38,'Cocaïne, macht, angst… alles.'],
 [29.57,'En nog steeds kent bijna niemand zijn gezicht.'],[32.72,'Dit is geen sprookje.'],
 [34.22,'Dit is hoe een pizzabezorger uit Pixelstad uitgroeide tot een van de gevaarlijkste mannen die dit continent heeft gekend.'],
 [41.55,'Het begon niet met een pistool.'],[43.40,'Het begon niet met een kluis vol geld.'],[45.66,'Het begon op een gewone avond…'],
 [47.94,'met een fooi van driehonderd euro…'],[50.03,'en een vraag die hij nooit had moeten beantwoorden.'],[53.49,'Dit is het verhaal van Luca De Santis.']];
const EIND=[0.83,3.13,6.20,9.45,11.34,12.94,14.48,15.82,18.02,19.79,22.61,25.84,29.25,32.05,33.84,40.88,42.91,45.27,47.55,49.66,52.75,56.11];
const A=(k,x,z)=>{const a=M.A&&M.A[k];return a&&a.x!=null?{x:a.x,z:a.z}:{x,z}};
const walk=(x,z,r)=>(M.nearestWalk&&M.nearestWalk(x,z,r||6))||{x,z};

/* ---------- beeld: nieuwsbalk, ondertitels, grote tekst, kaart van Europa ---------- */
function css(){if(document.getElementById('viCss'))return;const s=document.createElement('style');s.id='viCss';s.textContent=`
#viOv{position:fixed;inset:0;z-index:100000;pointer-events:none;font-family:'Space Grotesk',system-ui,sans-serif}
#viMid{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:min(860px,calc(100vw - 40px));text-align:center;color:#f1efe9;font:800 clamp(28px,6vw,64px)/1.1 'Space Grotesk',system-ui,sans-serif;letter-spacing:.02em;text-shadow:0 3px 0 #000,0 0 24px #000c;opacity:0;transition:opacity .5s}
#viMid.on{opacity:1}#viMid small{display:block;font:600 clamp(11px,1.4vw,14px) monospace;letter-spacing:.32em;color:#ff4a3a;margin-bottom:14px;text-transform:uppercase}
#viSub{position:absolute;left:50%;bottom:calc(11vh + 14px);transform:translateX(-50%);width:min(900px,calc(100vw - 32px));text-align:center;color:#fff;font:600 clamp(15px,2.3vw,23px)/1.35 'Space Grotesk',system-ui,sans-serif;text-shadow:0 2px 0 #000,0 0 10px #000,0 0 3px #000;opacity:0;transition:opacity .25s}
#viSub.on{opacity:1}
body.sv-geen-ondertitels #viSub{display:none}
#viBar{position:absolute;left:max(16px,4vw);top:calc(11vh + 16px);display:flex;flex-direction:column;opacity:0;transform:translateY(-10px);transition:opacity .35s,transform .35s;max-width:min(760px,calc(100vw - 32px))}
#viBar.on{opacity:1;transform:none}#viBar .t{display:flex;align-items:stretch}
#viBar .b{background:#d8231a;color:#fff;font:800 clamp(11px,1.5vw,14px) 'Space Grotesk',system-ui;letter-spacing:.14em;padding:7px 12px;display:flex;align-items:center}
#viBar .h{background:#f4f1ea;color:#111;font:700 clamp(13px,2vw,20px) 'Space Grotesk',system-ui;padding:7px 14px;flex:1;min-width:0}
#viBar .s{background:#111c;color:#e8e4da;font:600 clamp(10px,1.3vw,12px) monospace;letter-spacing:.18em;padding:5px 12px;align-self:flex-start;text-transform:uppercase}
#viBar .s i{display:inline-block;width:8px;height:8px;background:#d8231a;border-radius:50%;margin-right:8px;animation:viP 1s infinite}@keyframes viP{50%{opacity:.2}}
#viTitel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;transition:opacity 1s}
#viTitel.on{opacity:1}#viTitel b{font:900 clamp(44px,10vw,110px)/1 'Space Grotesk',system-ui;color:#f1efe9;letter-spacing:.06em;text-shadow:0 5px 0 #c0261e,0 0 34px #000}
#viTitel span{font:600 clamp(12px,1.6vw,16px) monospace;letter-spacing:.4em;color:#ff4fd8;text-transform:uppercase}
#viKaart{position:absolute;inset:0;background:radial-gradient(ellipse at 45% 45%,#141a24,#05070a 70%);opacity:0;transition:opacity .6s}#viKaart.on{opacity:1}
#viKaart svg{position:absolute;inset:0;width:100%;height:100%}
#viFlits{position:absolute;inset:0;background:#fff;opacity:0}#viFlits.go{animation:viF .35s ease-out}@keyframes viF{0%{opacity:.75}100%{opacity:0}}
#viVlak{position:absolute;inset:0;background:#000;opacity:0;transition:opacity .4s}#viVlak.on{opacity:1}
`;document.head.appendChild(s)}
let ov=null;
function mount(){css();if(ov)return ov;ov=document.createElement('div');ov.id='viOv';
  ov.innerHTML='<div id="viVlak"></div><div id="viKaart"></div><div id="viMid"></div><div id="viBar"><div class="s"></div><div class="t"><span class="b">BREAKING</span><span class="h"></span></div></div><div id="viTitel"><span></span><b></b></div><div id="viSub" data-ondertitel></div><div id="viFlits"></div>';
  document.body.appendChild(ov);return ov}
function weg(){if(ov){ov.remove();ov=null}}
const $=id=>document.getElementById(id);
function sub(t){mount();const e=$('viSub');if(!t){e.classList.remove('on');return}e.textContent=t;e.classList.add('on')}
function mid(t,klein){mount();const e=$('viMid');if(!t){e.classList.remove('on');return}e.innerHTML=(klein?'<small>'+klein+'</small>':'')+t;e.classList.add('on')}
function balk(kop,s){mount();const b=$('viBar');if(!kop){b.classList.remove('on');return}b.querySelector('.h').textContent=kop;b.querySelector('.s').innerHTML='<i></i>'+s;b.classList.remove('on');void b.offsetWidth;b.classList.add('on')}
function titel(groot,klein){mount();const t=$('viTitel');if(!groot){t.classList.remove('on');return}t.querySelector('b').textContent=groot;t.querySelector('span').textContent=klein||'';t.classList.add('on')}
function vlak(on){mount();$('viVlak').classList.toggle('on',!!on)}
function flits(){mount();const f=$('viFlits');f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}
// de kaart van Europa: steden als stippen, lijnen die vanuit de stad uitwaaieren
function kaart(on){mount();const k=$('viKaart');if(!on){k.style.transition='none';k.classList.remove('on');void k.offsetWidth;k.style.transition='';return}
  const S=[['Pixelstad',47,34,1],['Antwerpen',44,40],['Rotterdam',45,37],['Hamburg',55,27],['Parijs',40,49],['Marseille',44,70],['Barcelona',36,76],['Napels',60,79],['Málaga',24,86],['Berlijn',61,32],['Milaan',51,61],['Lyon',43,60]];
  const lines=S.slice(1).map((c,i)=>`<line x1="47" y1="34" x2="${c[1]}" y2="${c[2]}" stroke="#d8231a" stroke-width=".35" stroke-dasharray="80" stroke-dashoffset="80" opacity=".9"><animate attributeName="stroke-dashoffset" from="80" to="0" begin="${(i*.18).toFixed(2)}s" dur="1.2s" fill="freeze"/></line>`).join('');
  const dots=S.map((c,i)=>`<g><circle cx="${c[1]}" cy="${c[2]}" r="${c[3]?1.4:.8}" fill="${c[3]?'#ff4fd8':'#f4f1ea'}" opacity="0"><animate attributeName="opacity" from="0" to="1" begin="${(i*.18).toFixed(2)}s" dur=".3s" fill="freeze"/></circle><text x="${c[1]+1.6}" y="${c[2]+.9}" font-size="2.2" fill="#c9c4b8" font-family="monospace" opacity="0">${c[0]}<animate attributeName="opacity" from="0" to="1" begin="${(i*.18+.2).toFixed(2)}s" dur=".4s" fill="freeze"/></text></g>`).join('');
  const grid=Array.from({length:21},(_,i)=>`<line x1="${i*5}" y1="0" x2="${i*5}" y2="100" stroke="#1d2633" stroke-width=".15"/><line x1="0" y1="${i*5}" x2="100" y2="${i*5}" stroke="#1d2633" stroke-width=".15"/>`).join('');
  k.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">${grid}${lines}${dots}</svg>`;k.classList.add('on')}

/* ---------- decor: politie, vuur, container, het bord, de fiets ---------- */
const DINGEN=[];const reg=o=>{DINGEN.push(o);return o};
function opruimen(){DINGEN.splice(0).forEach(d=>{try{d.weg()}catch(e){}})}
const mat=c=>new TH.MeshLambertMaterial({color:c}),gloei=c=>new TH.MeshBasicMaterial({color:c});
function box(g,w,h,d,m,x,y,z){const o=new TH.Mesh(new TH.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o}
function politie(x,z,ry){const g=new TH.Group();box(g,1.8,.62,4.2,mat('#f1efe9'),0,.62,0);box(g,1.82,.16,4.22,mat('#2a5bd7'),0,.72,0);box(g,1.64,.48,2.1,mat('#1a2430'),0,1.16,-.2);
  [[-.82,1.3],[.82,1.3],[-.82,-1.3],[.82,-1.3]].forEach(([a,b])=>box(g,.26,.62,.62,mat('#121214'),a,.32,b));
  const l1=box(g,.36,.14,.3,gloei('#3a7bff'),-.24,1.48,-.2),l2=box(g,.36,.14,.3,gloei('#ff3a3a'),.24,1.48,-.2);
  const p1=new TH.PointLight('#3a7bff',0,24),p2=new TH.PointLight('#ff3a3a',0,24);p1.position.set(-.3,2.2,0);p2.position.set(.3,2.2,0);g.add(p1,p2);
  g.position.set(x,0,z);g.rotation.y=ry||0;G.scene().add(g);let t=0;const iv=setInterval(()=>{t++;const on=t%2;l1.visible=!!on;l2.visible=!on;p1.intensity=on?70:0;p2.intensity=on?0:70},170);
  return reg({weg(){clearInterval(iv);g.parent&&g.parent.remove(g)}})}
function vuur(x,z,w,d,h){const g=new TH.Group();const vl=[];for(let i=0;i<10;i++){const m=box(g,.8+Math.random()*1.2,1+Math.random()*2.4,.8+Math.random()*1.2,gloei(['#ff7a1a','#ffb02a','#ff4a1a','#ffd35a'][i%4]),(Math.random()-.5)*w,h+Math.random()*1.5,(Math.random()-.5)*d);m.userData.y=m.position.y;vl.push(m)}
  const rook=[];for(let i=0;i<14;i++){const m=box(g,1.6,1.6,1.6,new TH.MeshLambertMaterial({color:'#2a2a2e',transparent:true,opacity:.55}),(Math.random()-.5)*w,h+2+i*.9,(Math.random()-.5)*d);m.userData.y=m.position.y;rook.push(m)}
  const L1=new TH.PointLight('#ff7a1a',120,40),L2=new TH.PointLight('#ff4a1a',90,30);L1.position.set(0,h+2,0);L2.position.set(w*.3,h+1,d*.3);g.add(L1,L2);
  g.position.set(x,0,z);G.scene().add(g);let t=0;const iv=setInterval(()=>{t+=.05;vl.forEach((m,i)=>{const k=.7+.5*Math.abs(Math.sin(t*7+i*1.7));m.scale.set(k,.6+.8*Math.abs(Math.sin(t*5+i)),k);m.position.y=m.userData.y+Math.sin(t*6+i)*.25});
    rook.forEach((m,i)=>{m.position.y=m.userData.y+((t*2+i*.9)%12);m.material.opacity=.55*(1-((t*2+i*.9)%12)/12)});L1.intensity=90+60*Math.random();L2.intensity=60+50*Math.random()},50);
  return reg({weg(){clearInterval(iv);g.parent&&g.parent.remove(g)}})}
function container(x,z,ry){const g=new TH.Group();box(g,2.4,2.6,6,mat('#2a6a9a'),0,1.3,0);for(let i=-2;i<=2;i++)box(g,2.44,2.3,.08,mat('#1f5480'),0,1.3,i*1.1);
  const deur=box(g,.08,2.4,1.1,mat('#2a6a9a'),1.26,1.3,2.4);deur.rotation.y=-1.1;box(g,1.2,.3,1,mat('#c9c4b8'),0,.4,2.2);box(g,1,.3,.9,mat('#c9c4b8'),.1,.7,2.1);
  g.position.set(x,0,z);g.rotation.y=ry||0;G.scene().add(g);return reg({weg(){g.parent&&g.parent.remove(g)}})}
function bord(x,z,ry){const g=new TH.Group(),b=(w,h,d,c,px,py,pz)=>box(g,w,h,d,mat(c),px,py,pz);
  b(2.8,1.7,.08,'#a8763e',0,1.6,0);b(.08,1.9,.08,'#3a2a1a',-1.2,.95,.06);b(.08,1.9,.08,'#3a2a1a',1.2,.95,.06);
  const P=[[-.95,2.05],[-.95,1.25],[.95,2.0],[.95,1.2],[-.3,2.2],[.35,1.05]];P.forEach(([px,py])=>{b(.38,.44,.02,'#c9c4b8',px,py,.05);b(.26,.22,.02,'#4a3a2a',px,py+.04,.06)});
  b(.5,.6,.02,'#f1efe9',0,1.6,.05);b(.34,.32,.02,'#c0261e',0,1.54,.06);b(.18,.16,.02,'#c8956a',0,1.76,.07);b(.12,.1,.02,'#1a1410',0,1.85,.075);
  P.forEach(([px,py])=>{const d=Math.hypot(px,py-1.6),o=b(d,.02,.01,'#d8231a',px/2,(py+1.6)/2,.08);o.rotation.z=Math.atan2(py-1.6,px)});
  const L=new TH.SpotLight('#ffe8c0',60,9,.6,.5);L.position.set(1.2,3.4,2.4);L.target.position.set(0,1.6,0);g.add(L,L.target);
  g.position.set(x,0,z);g.rotation.y=ry||0;G.scene().add(g);return reg({weg(){g.parent&&g.parent.remove(g)}})}
function fiets(x,z,ry){try{const g=G.fiets&&G.fiets.model?G.fiets.model('#c0261e',true):null;if(!g)return null;g.position.set(x,0,z);g.rotation.y=ry||0;G.scene().add(g);
  if(G.cut&&G.cut.stapel){const s=G.cut.stapel(3);s.position.set(0,.98,-.62);s.scale.setScalar(.62);g.add(s)}return reg({g,weg(){g.parent&&g.parent.remove(g)}})}catch(e){return null}}

/* ---------- de klok van de intro: de audio, anders de echte tijd ---------- */
let audio=null,t0=0,gestopt=false;
// de audio bepaalt de tijd (zo blijven beeld en stem gelijk, ook als het laden even hapert), maar nooit sneller dan de echte klok
function klok(){const w=(performance.now()-t0)/1000;if(audio&&!audio.paused&&audio.currentTime>0)return Math.min(audio.currentTime,w+.3);return w}
// wacht tot moment T; G.cut.wacht keert meteen terug als de speler overslaat, dan stopt de intro
async function tot(T){const C=G.cut;while(!gestopt&&klok()<T){const a=performance.now();await C.wacht(.05);if(performance.now()-a<2){gestopt=true;break}}}
const zeg=i=>sub(TEKST[i][1]),stil=()=>sub(null);
function startAudio(){try{audio=new Audio('/audio/verhaal/intro.mp3?v=1');audio.preload='auto';const v=G.snd&&G.snd.vol!=null?G.snd.vol:.8;audio.volume=Math.max(.15,Math.min(1,v));
  const p=audio.play();if(p&&p.catch)p.catch(()=>{});}catch(e){audio=null}t0=performance.now()}
function stopAudio(){if(!audio)return;const a=audio;audio=null;let v=a.volume;const iv=setInterval(()=>{v-=.08;if(v<=0){clearInterval(iv);a.pause()}else a.volume=v},40)}

/* ---------- de intro ---------- */
async function play(o){o=o||{};const C=G.cut,ST=G.story;if(!C||!ST)return;gestopt=false;
  const k0=ST.klok();
  try{G.verhaalSfeer&&G.verhaalSfeer.zet('stil')}catch(e){}
  if(G.binnen&&G.binnen.waar())await G.binnen.uit({fade:false});
  const Wb=A('hoek',236,461),E=A('villa_cosa',1252,1101),H=A('kranen',700,130),Pz=A('politie',655,349),S=A('school',232,337),N=A('napoli',419,492),Bv=A('boulevard',780,906),Zd=A('zakendistrict',1030,576),Sa=A('sahara',655,909),Dak=A('garagedak',930,875);
  const ep=walk(E.x,E.z-16,12),hp=walk(H.x+8,H.z+40,14),bp=walk(Pz.x+3,Pz.z+5,6),np=walk(N.x+3.2,N.z+1.6,4),sp=walk(Sa.x+1.8,Sa.z+3,4),bq=walk(Bv.x,Bv.z,6);
  const V_=s=>V+s;   // tijd in de mix
  const licht=(h,m)=>{ST.tijd(h,m);G.applyLight&&G.applyLight()},nacht=()=>licht(1,15),avond=()=>licht(19,40),dag=()=>licht(16,30);
  // Luca op 16 in de rode jas van Bella Napoli, en op 24 in pak (het uiterlijk komt uit G.uiterlijk, dus het klopt met de rest van het verhaal)
  const U=G.uiterlijk,L=U&&U.spec?U.spec('luca'):null;
  const jas=(U&&U.spec&&U.spec('luca',{outfit:'bezorger',lucaAge:16}))||Object.assign({},L||{},{top:{kind:'jacket',c:'#c0261e',c2:'#f1efe9'}});
  const pak=(U&&U.spec&&U.spec('luca',{outfit:'zakelijk',lucaAge:24}))||Object.assign({},L||{},{top:{kind:'suit',c:'#16181d',c2:'#e8e4da'},legs:{kind:'jeans',c:'#16181d'},shoes:{kind:'boot',c:'#0e0e10'}});
  const steps=[
   {fade:'out',t:.01},{speler:false},{fn:()=>{mount();vlak(true);nacht();startAudio()}},
   // Goedenavond — het nieuws
   {fn:()=>tot(V_(-.2))},{fn:()=>{flits();balk('Drie meldingen in één nacht','Live · nieuws');zeg(0)}},
   // de villa
   {fn:()=>tot(V_(1.2))},{fn:()=>{vuur(E.x,E.z,10,8,4.5);politie(ep.x,ep.z,.3);politie(ep.x+5,ep.z-2,2.2);vlak(false);balk('Villa op Het Eiland in brand','Live · Het Eiland');zeg(1)}},
   {cam:{pos:[E.x-46,26,E.z-44],look:[E.x,5,E.z],to:{pos:[E.x-28,14,E.z-30],look:[E.x,6,E.z]},t:2.4,wacht:false}},{fade:'in',t:.3},
   // de container
   {fn:()=>tot(V_(3.45))},{fn:()=>{container(hp.x,hp.z-6,.4);politie(hp.x+4,hp.z,1.2);flits();balk('Container in de haven onderschept: te laat','Live · De Haven');zeg(2)}},
   {cam:{pos:[hp.x+14,9,hp.z+12],look:[hp.x,1.6,hp.z-6],to:{pos:[hp.x+8,4.5,hp.z+6],look:[hp.x,1.4,hp.z-6]},t:3,wacht:false}},
   // de naam: het bord van de recherche
   {fn:()=>tot(V_(6.5))},{fn:()=>{bord(bp.x,bp.z+2.4,Math.PI);balk(null);zeg(3)}},
   {cam:{pos:[bp.x+2.6,1.9,bp.z-1.6],look:[bp.x,1.6,bp.z+2.4],to:{pos:[bp.x+.5,1.7,bp.z+.6],look:[bp.x,1.6,bp.z+2.4]},t:3.6,wacht:false}},
   // Luca De Santis
   {fn:()=>tot(V_(10.0))},{fn:()=>{vlak(true);stil();mid('Luca De Santis','Gezocht')}},
   // zestien, de fiets
   {fn:()=>tot(V_(11.95))},{fn:()=>{mid(null);dag();zeg(5);fiets(np.x,np.z,1.2)}},
   {cam:{pos:[S.x+30,18,S.z+38],look:[S.x,2,S.z],to:{pos:[S.x+16,8,S.z+24],look:[S.x,2,S.z]},t:3,wacht:false}},{fn:()=>vlak(false)},
   {fn:()=>tot(V_(13.15))},{actor:'luca_i',at:[np.x+1.1,np.z-.6],ry:-.6,look:jas},{fn:()=>zeg(6)},
   {cam:{pos:[np.x+7,2.4,np.z+5],look:[np.x+.5,1.1,np.z],to:{pos:[np.x+4.2,1.8,np.z+3],look:[np.x+.6,1.2,np.z]},t:2.8,wacht:false}},
   {fn:()=>tot(V_(14.75))},{fn:()=>zeg(7)},{anim:'luca_i',a:'idle',ry:Math.atan2(np.x+3.4-(np.x+1.1),np.z+1.4-(np.z-.6))},{cam:{pos:[np.x+3.4,1.6,np.z+1.4],look:[np.x+1.1,1.25,np.z-.6]}},
   {fn:()=>tot(V_(16.05))},{fn:()=>zeg(8)},{cam:{pos:[np.x-2.2,1.6,np.z+2.2],look:[np.x,.9,np.z],to:{pos:[np.x-1.4,1.3,np.z+1.4],look:[np.x,.9,np.z]},t:2,wacht:false}},
   // niemand die naar hem keek: de Boulevard, mensen lopen langs
   {fn:()=>tot(V_(18.5))},{weg:'luca_i'},{fn:()=>{avond();zeg(9);C.zet('luca_i',bq.x,bq.z,0,{look:jas,anim:'idle'});
     for(let i=0;i<9;i++){const a=C.persoon(C.figurant(),{x:bq.x-14+i*3.2,z:bq.z+(i%2?1.6:-1.4),ry:Math.PI/2});a.loop(bq.x+18-i*.5,a.z,{v:2.4+Math.random()});reg({weg(){a.weg()}})}}},
   {cam:{pos:[bq.x+6,1.7,bq.z+7],look:[bq.x,1.4,bq.z],to:{pos:[bq.x+3,1.6,bq.z+4],look:[bq.x,1.4,bq.z]},t:3.5,wacht:false}},
   {fn:()=>tot(V_(20.15))},{fn:()=>zeg(10)},{cam:{to:{pos:[bq.x+12,22,bq.z+18],look:[bq.x,1,bq.z]},t:3,wacht:false}},
   // acht jaar later: Europa
   {fn:()=>tot(V_(23.2))},{fn:()=>{kaart(true);zeg(11)}},
   // cocaïne, macht, angst… alles
   {fn:()=>tot(V_(26.3))},{fn:()=>{kaart(false);nacht();flits();sub('Cocaïne,')}},{cam:{pos:[hp.x+5,2.2,hp.z-1],look:[hp.x,1.2,hp.z-6]}},
   {fn:()=>tot(V_(27.2))},{fn:()=>{flits();sub('Cocaïne, macht,')}},{cam:{pos:[Zd.x-30,8,Zd.z+30],look:[Zd.x,26,Zd.z]}},
   {fn:()=>tot(V_(27.95))},{fn:()=>{flits();sub('Cocaïne, macht, angst…')}},{cam:{pos:[ep.x-3,1.6,ep.z-4],look:[ep.x,1,ep.z]}},
   {fn:()=>tot(V_(28.8))},{fn:()=>{vlak(true);sub('Cocaïne, macht, angst… alles.')}},
   // niemand kent zijn gezicht: Luca, 24, op het dak, van achteren
   {fn:()=>tot(V_(29.5))},{weg:'luca_i'},{actor:'luca_24',at:[Dak.x,Dak.z],ry:Math.PI*.75,look:pak,y:17},{fn:()=>{vlak(false);zeg(13)}},
   {cam:{pos:[Dak.x+3.2,18.6,Dak.z+3.4],look:[Dak.x-30,10,Dak.z-30],to:{pos:[Dak.x+4.6,19.6,Dak.z+5.2],look:[Dak.x-30,10,Dak.z-30]},t:3,wacht:false}},
   // geen sprookje
   {fn:()=>tot(V_(32.65))},{fn:()=>{vlak(true);stil();mid('Dit is geen sprookje.')}},
   // hoe een pizzabezorger uitgroeide…: over de stad
   {fn:()=>tot(V_(34.15))},{weg:'luca_24'},{fn:()=>{mid(null);vlak(false);zeg(15)}},
   {cam:{pos:[Wb.x+90,58,Wb.z+95],look:[Wb.x,2,Wb.z],to:{pos:[Wb.x+25,34,Wb.z+20],look:[Wb.x-70,0,Wb.z-50]},t:6.6,wacht:false}},
   // het begon niet met een pistool / een kluis
   {fn:()=>tot(V_(41.45))},{fn:()=>{vlak(true);stil();mid('Het begon niet met een pistool.')}},
   {fn:()=>tot(V_(43.3))},{fn:()=>{mid('Het begon niet met een kluis vol geld.')}},
   // een gewone avond bij Sahara, de fooi, de vraag
   {fn:()=>tot(V_(45.55))},{fn:()=>{mid(null);avond();zeg(18)}},{actor:'luca_i',at:[sp.x,sp.z+2.4],ry:Math.PI,look:jas,dozen:2},{actor:'rafiq',at:[Sa.x,Sa.z+.6],ry:0,anim:'leun'},
   {cam:{pos:[sp.x+9,4,sp.z+12],look:[Sa.x,2.4,Sa.z],to:{pos:[sp.x+5,2.4,sp.z+7],look:[Sa.x,1.8,Sa.z]},t:2.4,wacht:false}},{fn:()=>vlak(false)},
   {move:'luca_i',to:[sp.x,sp.z+.9],t:1.6,anim:'carry',wacht:false},
   {fn:()=>tot(V_(47.85))},{fn:()=>zeg(19)},{anim:'luca_i',a:'idle',dozen:0},{anim:'rafiq',a:'give',prop:'geld',naar:'luca_i'},
   {cam:{pos:[sp.x+2.2,1.5,sp.z+1.2],look:[(sp.x+Sa.x)/2,1.2,(sp.z+Sa.z)/2+.6]}},
   {fn:()=>tot(V_(49.95))},{fn:()=>zeg(20)},{anim:'rafiq',a:'talk',prop:null},
   {cam:{pos:[Sa.x+1.6,1.7,Sa.z+2.8],look:[Sa.x,1.6,Sa.z+.6],to:{pos:[Sa.x+1,1.65,Sa.z+2.1],look:[Sa.x,1.6,Sa.z+.6]},t:2.6,wacht:false}},
   // het verhaal van Luca De Santis
   {fn:()=>tot(V_(53.35))},{fn:()=>{vlak(true);zeg(21)}},
   {fn:()=>tot(V_(55.3))},{fn:()=>{stil();titel('DE BEZORGER','Seizoen 1')}},
   {fn:()=>tot(V_(60.2))},{fn:()=>titel(null)},{fn:()=>tot(V_(61.4))}];
  // de ondertitels gaan uit aan het eind van elke zin
  const subIv=setInterval(()=>{const tt=klok()-V;if(tt>=26.3&&tt<29.5)return;let on=false;for(let i=0;i<TEKST.length;i++){if(tt>=TEKST[i][0]-.25&&tt<=EIND[i]+.35){on=true;break}}if(!on)stil()},150);
  try{await C.play(o.los?steps.concat([{fn:()=>vlak(false)},{fade:'in',t:.6}]):steps,{blijfZwart:!o.los})}finally{
    clearInterval(subIv);stopAudio();opruimen();C.weg('luca_i');C.weg('luca_24');C.weg('rafiq');weg();
    try{G.verhaalSfeer&&G.verhaalSfeer.los()}catch(e){}
    if(o.los){ST.tijd(k0.h,k0.m);G.applyLight&&G.applyLight()}else ST.flag('intro',1)}}
G.verhaalIntro={play,naam:STAD_NAAM,tekst:TEKST};
})();
