// Verhaal "De Bezorger": de intro (G.verhaalIntro), in de stijl van een misdaadreportage. Nacht in Noordhaven,
// nieuwsbalken (BREAKING), luchtbeelden van de stad, zwaailichten, en tekst die regel voor regel verschijnt.
// Speelt één keer voor het verhaal begint (stap 'start' in stad-h1.js); overslaan kan zoals bij elke cutscène.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const STAD_NAAM='Noordhaven';
const A=(k,x,z)=>{const a=M.A&&M.A[k];return a&&a.x!=null?{x:a.x,z:a.z}:{x,z}};

/* ---------- beeld: nieuwsbalk en grote tekst ---------- */
function css(){if(document.getElementById('viCss'))return;const s=document.createElement('style');s.id='viCss';s.textContent=`
#viOv{position:fixed;inset:0;z-index:100000;pointer-events:none;font-family:'Space Grotesk',system-ui,sans-serif}
#viMid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(820px,calc(100vw - 40px));text-align:center;color:#f1efe9;font:700 clamp(20px,3.4vw,34px)/1.3 'Space Grotesk',system-ui,sans-serif;letter-spacing:.01em;text-shadow:0 2px 0 #000,0 0 18px #000c;white-space:pre-line}
#viMid small{display:block;font:600 clamp(11px,1.4vw,14px) monospace;letter-spacing:.3em;color:#ff4a3a;margin-bottom:12px;text-transform:uppercase}
#viBar{position:absolute;left:max(16px,4vw);right:max(16px,4vw);bottom:calc(11vh + 18px);display:flex;flex-direction:column;gap:0;opacity:0;transform:translateY(12px);transition:opacity .35s,transform .35s}
#viBar.on{opacity:1;transform:none}
#viBar .t{display:flex;align-items:stretch;max-width:760px}
#viBar .b{background:#d8231a;color:#fff;font:800 clamp(11px,1.5vw,14px) 'Space Grotesk',system-ui;letter-spacing:.14em;padding:8px 12px;display:flex;align-items:center}
#viBar .h{background:#f4f1ea;color:#111;font:700 clamp(14px,2.2vw,22px) 'Space Grotesk',system-ui;padding:8px 14px;flex:1;min-width:0}
#viBar .s{background:#111c;color:#e8e4da;font:600 clamp(10px,1.3vw,12px) monospace;letter-spacing:.18em;padding:5px 12px;align-self:flex-start;text-transform:uppercase}
#viBar .s i{display:inline-block;width:8px;height:8px;background:#d8231a;border-radius:50%;margin-right:8px;animation:viP 1s infinite}
@keyframes viP{50%{opacity:.2}}
#viTitel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;opacity:0;transition:opacity .8s}
#viTitel.on{opacity:1}#viTitel b{font:900 clamp(40px,9vw,96px)/1 'Space Grotesk',system-ui;color:#f1efe9;letter-spacing:.06em;text-shadow:0 4px 0 #c0261e,0 0 30px #000}
#viTitel span{font:600 clamp(12px,1.6vw,16px) monospace;letter-spacing:.4em;color:#ff4fd8;text-transform:uppercase}
`;document.head.appendChild(s)}
let ov=null;
function mount(){css();if(ov)return ov;ov=document.createElement('div');ov.id='viOv';ov.innerHTML='<div id="viMid"></div><div id="viBar"><div class="s"></div><div class="t"><span class="b">BREAKING</span><span class="h"></span></div></div><div id="viTitel"><span></span><b></b></div>';document.body.appendChild(ov);return ov}
function weg(){if(ov){ov.remove();ov=null}}
// tekst regel voor regel typen, met de tikjes van de verteller
let typT=0;
function typ(tekst,sub){mount();const el=document.getElementById('viMid');clearInterval(typT);let i=0;el.innerHTML=(sub?'<small>'+sub+'</small>':'')+'<span></span>';const sp=el.querySelector('span');
  typT=setInterval(()=>{i++;sp.textContent=tekst.slice(0,i);const c=tekst.charCodeAt(i-1);if(i%2===0&&c>64&&G.snd&&G.snd.praat)G.snd.praat('verteller',c);if(i>=tekst.length)clearInterval(typT)},38)}
function leeg(){clearInterval(typT);const el=document.getElementById('viMid');if(el)el.innerHTML=''}
function balk(kop,sub){mount();const b=document.getElementById('viBar');b.querySelector('.h').textContent=kop;b.querySelector('.s').innerHTML='<i></i>'+sub;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');if(G.snd)G.snd.fx('blip')}
function balkWeg(){const b=document.getElementById('viBar');if(b)b.classList.remove('on')}
function titel(groot,klein){mount();const t=document.getElementById('viTitel');t.querySelector('b').textContent=groot;t.querySelector('span').textContent=klein||'';t.classList.add('on')}

/* ---------- zwaailichten: een politieauto met knipperlichten ---------- */
const DINGEN=[];
function politie(x,z,ry){const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c}),box=(w,h,d,c,px,py,pz,em)=>{const o=new TH.Mesh(new TH.BoxGeometry(w,h,d),em?new TH.MeshBasicMaterial({color:c}):m(c));o.position.set(px,py,pz);g.add(o);return o};
  box(1.8,.62,4.2,'#f1efe9',0,.62,0);box(1.82,.16,4.22,'#2a5bd7',0,.72,0);box(1.64,.48,2.1,'#1a2430',0,1.16,-.2);[[-.82,1.3],[.82,1.3],[-.82,-1.3],[.82,-1.3]].forEach(([a,b])=>box(.26,.62,.62,'#121214',a,.32,b));
  const l1=box(.36,.14,.3,'#3a7bff',-.24,1.48,-.2,1),l2=box(.36,.14,.3,'#ff3a3a',.24,1.48,-.2,1);
  const p1=new TH.PointLight('#3a7bff',0,22),p2=new TH.PointLight('#ff3a3a',0,22);p1.position.set(-.3,2,0);p2.position.set(.3,2,0);g.add(p1,p2);
  g.position.set(x,0,z);g.rotation.y=ry||0;G.scene().add(g);let t=0;const iv=setInterval(()=>{t++;const on=t%2;l1.visible=!!on;l2.visible=!on;p1.intensity=on?60:0;p2.intensity=on?0:60},180);
  const o={g,weg(){clearInterval(iv);g.parent&&g.parent.remove(g)}};DINGEN.push(o);return o}
function opruimen(){DINGEN.splice(0).forEach(d=>d.weg())}
// de fiets met de rode tassen bij het fietsenrek (decor)
function fiets(F){try{const p=M.nearestWalk?M.nearestWalk(F.x,F.z,4)||F:F;const g=G.fiets&&G.fiets.model?G.fiets.model('#c0261e',true):null;if(!g)return;g.position.set(p.x,0,p.z);g.rotation.y=.9;G.scene().add(g);DINGEN.push({weg(){g.parent&&g.parent.remove(g)}});F.x=p.x;F.z=p.z}catch(e){}}

/* ---------- de intro ---------- */
async function play(o){o=o||{};const C=G.cut,ST=G.story;if(!C||!ST)return;
  const W=A('hoek',236,461),E=A('villa_cosa',1252,1101),H=A('kranen',700,130),F=A('fietsenrek',210,361),Z=A('zakendistrict',1030,576);
  const k0=ST.klok();ST.tijd(1,15);
  try{G.verhaalSfeer&&G.verhaalSfeer.zet('spanning')}catch(e){}
  const p1=G.binnen&&G.binnen.waar()?null:1;if(G.binnen&&G.binnen.waar())await G.binnen.uit({fade:false});
  const wp=M.nearestWalk?M.nearestWalk(W.x+6,W.z+2,8):{x:W.x+6,z:W.z+2};
  const ep=M.nearestWalk?M.nearestWalk(E.x,E.z-14,10):{x:E.x,z:E.z-14};
  await C.play([{fade:'out',t:.01},{speler:false},
   {fn:()=>typ(STAD_NAAM+'. Kwart over één, midden in de nacht.','Noordhaven · 01:15')},{wait:3.6},
   {fn:()=>{leeg();politie(wp.x,wp.z,.6);politie(wp.x+5,wp.z+3,2.1)}},
   {cam:{pos:[W.x+70,55,W.z+80],look:[W.x,2,W.z],to:{pos:[W.x+22,16,W.z+26],look:[W.x+2,1,W.z+2]},t:7,wacht:false}},{fade:'in',t:1.2},{snd:'whistle'},
   {fn:()=>balk('Schoten in de Westbuurt: één gewonde','Live · Noordhaven · Westbuurt')},{wait:4.4},
   {fade:'out',t:.5},{fn:()=>{balkWeg();politie(ep.x,ep.z,0)}},
   {cam:{pos:[E.x-60,40,E.z-70],look:[E.x,4,E.z],to:{pos:[E.x-26,18,E.z-30],look:[E.x,3,E.z]},t:6,wacht:false}},{fade:'in',t:.6},
   {fn:()=>balk('Villa op Het Eiland doorzocht door arrestatieteam','Live · Noordhaven · Het Eiland')},{wait:4.2},
   {fade:'out',t:.5},{fn:balkWeg},
   {cam:{pos:[H.x+90,46,H.z+70],look:[H.x,6,H.z],to:{pos:[H.x+40,26,H.z+36],look:[H.x,4,H.z]},t:6,wacht:false}},{fade:'in',t:.6},
   {fn:()=>balk('Ruim 2.000 kilo cocaïne in container in de haven','Live · Noordhaven · De Haven')},{wait:4.2},
   {fade:'out',t:.6},{fn:()=>{balkWeg();opruimen()}},
   {fn:()=>typ('Justitie spreekt van de grootste drugsbaron\ndie dit land ooit heeft gekend.')},{wait:4.4},
   {fn:()=>typ('Maar niemand kent zijn gezicht.')},{wait:2.8},
   {fn:()=>typ('Wie is hij? Waar komt hij vandaan?')},{wait:3},
   {fn:()=>typ('En hoe wordt een jongen van zestien\nde man die half Europa in handen heeft?')},{wait:4.4},
   {fn:()=>{leeg();ST.tijd(19,20);G.applyLight&&G.applyLight();fiets(F)}},
   {cam:{pos:[F.x+9,5,F.z+9],look:[F.x,.7,F.z],to:{pos:[F.x+2.6,1.1,F.z+2.2],look:[F.x,.7,F.z]},t:7,wacht:false}},{fade:'in',t:1},
   {fn:()=>typ('Het begon niet in de haven.')},{wait:3},
   {fn:()=>typ('Het begon op een fiets.\nMet een rode jas, en zes pizza\'s.')},{wait:4.2},
   {fade:'out',t:.8},{fn:()=>typ('Dit is het leven van Luca De Santis.')},{wait:3.6},
   {fn:()=>{leeg();titel('DE BEZORGER','Seizoen 1')}},{snd:'deurbel'},{wait:3.2},
   {fn:()=>{const t=document.getElementById('viTitel');if(t)t.classList.remove('on')}},{wait:.8},...(o.los?[{fn:()=>ST.tijd(k0.h,k0.m)},{fade:'in',t:.6}]:[])],{blijfZwart:!o.los});
  opruimen();weg();try{G.verhaalSfeer&&G.verhaalSfeer.los()}catch(e){}
  if(!o.los)ST.flag('intro',1)}
G.verhaalIntro={play,naam:STAD_NAAM};
})();
