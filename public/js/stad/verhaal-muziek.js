// Verhaal: echte muziek in plaats van de chiptune (G.verhaalMuziek). Elke stemming uit G.verhaalSfeer wijst naar een nummer
// (gemaakt met ElevenLabs, audio/verhaal/muziek/). Een nummer loopt rond met een kruisfade, wisselen gaat met een kruisfade,
// de muziek zakt weg als de verteller praat (duik) en volgt de knoppen voor muziek en volume. In het verhaal speelt de
// chiptune van de Pixelstad nooit (verhaal-sfeer.js zet die op 'stil').
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const V='?v=1';
// a/b: het stuk dat rondloopt (seconden); v: volume
const NUM={stad:{a:6,b:165,v:.5},spanning:{a:2,b:114,v:.46},lounge:{a:2,b:113,v:.44},droom:{a:3,b:76,v:.55},napoli:{a:2,b:140,v:.42}};
const STEMMING={dag:'stad',nacht:'stad',school:'droom',droom:'droom',thuis:'droom',napoli:'napoli',lounge:'lounge',feest:'lounge',spanning:'spanning',gevecht:'spanning',jacht:'spanning',ray:'spanning'};
let ctx=null,uit=null,ontgrendeld=false,duik=1,nu=null,wil=null;const DEKS=[];
const STIL='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
function aan(){if(uit)return true;try{ctx=G.snd&&G.snd.ctx&&G.snd.ctx();if(!ctx)return false;uit=ctx.createGain();uit.gain.value=1;uit.connect((G.snd.master&&G.snd.master())||ctx.destination);return true}catch(e){return false}}
function dek(){let d=DEKS.find(d=>!d.bezig);if(d)return d;if(DEKS.length>=3)return null;if(!aan())return null;
  const el=new Audio();el.preload='auto';el.crossOrigin='anonymous';el.playsInline=true;let node=null,g=null;
  try{node=ctx.createMediaElementSource(el);g=ctx.createGain();g.gain.value=0;node.connect(g);g.connect(uit)}catch(e){g=null}
  d={el,g,bezig:false,num:null,vol:0,doel:0};DEKS.push(d);return d}
// iOS: een geluid mag pas na een tik; elk element één keer 'ontgrendelen'
function ontgrendel(){if(ontgrendeld)return;if(!aan())return;ontgrendeld=true;for(let i=0;i<2;i++){const d=dek();if(!d)break;try{d.el.src=STIL;const p=d.el.play();if(p&&p.then)p.then(()=>d.el.pause()).catch(()=>{})}catch(e){}}
  try{vtMaak();if(vtEl){vtEl.src=STIL;const p=vtEl.play();if(p&&p.then)p.then(()=>vtEl.pause()).catch(()=>{})}}catch(e){}
  if(wil)zet(wil,true)}
['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e,ontgrendel,{passive:true}));
function luid(){const m=G.snd?(G.snd.muOn?1:0):1;return m*duik}
function start(id,vanaf){const n=NUM[id];if(!n)return null;const d=dek();if(!d)return null;d.bezig=true;d.num=id;d.vol=0;d.doel=1;
  if(!d.el.src||d.el.src.indexOf('/muziek/'+id+'.mp3')<0)d.el.src='/audio/verhaal/muziek/'+id+'.mp3'+V;
  const zetTijd=()=>{try{d.el.currentTime=vanaf}catch(e){}};if(d.el.readyState>=1)zetTijd();else d.el.addEventListener('loadedmetadata',zetTijd,{once:true});
  const p=d.el.play();if(p&&p.catch)p.catch(()=>{});return d}
// kies een stemming (of null/'stil' voor stilte)
function zet(m,direct){wil=m;const id=m==='stil'?null:(STEMMING[m]||(NUM[m]?m:(m==null?'stad':null)));
  if(id===nu&&!direct)return;nu=id;if(!ontgrendeld)return;
  DEKS.forEach(d=>{if(d.bezig)d.doel=0});
  if(id){const n=NUM[id];start(id,id==='stad'?n.a+Math.random()*(n.b-n.a-40):n.a)}}
// elke 100 ms: volumes naar hun doel, rondlopen met een kruisfade, klaar = vrij
let laatst=performance.now();
setInterval(()=>{const t=performance.now(),dt=Math.min(.5,(t-laatst)/1000);laatst=t;const L=luid();
  DEKS.forEach(d=>{if(!d.bezig)return;const n=NUM[d.num]||{v:.5,b:1e9,a:0};
    // bijna aan het eind van het rondloop-stuk: een tweede dek neemt het over
    if(d.doel>0&&d.el.currentTime>n.b&&!d.over){d.over=true;d.doel=0;const e=start(d.num,n.a);if(e){e.over=false;e.snel=.35}}
    const snel=d.doel>0?(d.snel||.6):.45;d.vol+=Math.sign(d.doel-d.vol)*Math.min(Math.abs(d.doel-d.vol),dt*snel);
    const v=Math.max(0,d.vol)*n.v*L;if(d.g)d.g.gain.setTargetAtTime(v,ctx.currentTime,.08);else d.el.volume=Math.min(1,v);
    if(d.doel===0&&d.vol<=.001){d.bezig=false;d.over=false;d.snel=0;try{d.el.pause()}catch(e){}}})},100);
document.addEventListener('visibilitychange',()=>{DEKS.forEach(d=>{if(!d.bezig)return;try{if(document.hidden)d.el.pause();else{const p=d.el.play();if(p&&p.catch)p.catch(()=>{})}}catch(e){}})});
/* ---------- de verteller: de misdaadverslaggever uit de intro, ingesproken (audio/verhaal/verteller/vNN.mp3) ---------- */
const VT={
 v01:"Zestien jaar. Hij droomde van auto's die hij nooit zou kunnen betalen. Van koffers vol geld. Niemand in dat klaslokaal had kunnen raden hoe dichtbij die droom al was.",
 v02:'De rode jas van Bella Napoli. Voor Luca was het werk. Voor de stad was het een vermomming. Een jongen in een bezorgjas valt niemand op.',
 v03:"Lounge Sahara. Iedereen in de buurt kende het. Niemand wist precies wat er achterin gebeurde. Die avond liep een jongen van zestien met zes pizza's recht naar binnen.",
 v04:'Wat hij die avond zag, zou hij nooit meer vergeten. Stapels geld. Een telmachine. En mannen die heel goed onthielden wie er binnenliep.',
 v05:'Hier begon het. Niet met geweld. Met een fooi. En met een vraag.',
 v06:'Die nacht lag hij wakker. Meer geld dan zijn vader in een maand verdiende in de haven. Hij telde het in zijn hoofd. Opnieuw. En opnieuw.',
 v07:'Een pizzadoos is groot. Een pakketje is klein. Twee dagen later reed hij door de stad met allebei.',
 v08:"Zijn eerste contact met de politie. In het dossier dat later honderden pagina's zou tellen, is het één regel.",
 v09:'Geld is stil, zei Rafiq. Mensen praten. Het was het eerste wat Luca van hem leerde. Het zou ook het laatste zijn.',
 v10:'Iemand volgde hem die nacht. Hij zag alleen een masker in zijn achterlicht. Pas jaren later zou hij weten wie het was.',
 v11:'Iedereen in dit verhaal herinnert zich de avond in Oud-Zuid. Een rijtjeshuis. Gordijnen dicht. Een laatste rit.',
 v12:'Ze noemden hem Grote Ray. Geen masker, geen haast. Hij hoefde nooit hard te praten om gehoord te worden.',
 v13:'Twee telefoons. Twee bazen. En een jongen van zestien die dacht dat hij het onder controle had. Hij had het mis.'};
let vtEl=null,vtNode=null,vtG=null,vtSub=null;
function vtMaak(){if(vtEl||!aan())return;vtEl=new Audio();vtEl.preload='auto';vtEl.playsInline=true;try{vtNode=ctx.createMediaElementSource(vtEl);vtG=ctx.createGain();vtNode.connect(vtG);vtG.connect((G.snd.master&&G.snd.master())||ctx.destination)}catch(e){vtG=null}}
function vtCss(){if(document.getElementById('vtCss'))return;const s=document.createElement('style');s.id='vtCss';s.textContent=`
#vtSub{position:fixed;left:50%;bottom:calc(11vh + 14px);transform:translateX(-50%);z-index:100001;pointer-events:none;width:min(900px,calc(100vw - 32px));text-align:center;
 color:#fff;font:600 clamp(15px,2.3vw,22px)/1.38 'Space Grotesk',system-ui,sans-serif;text-shadow:0 2px 0 #000,0 0 10px #000,0 0 3px #000;opacity:0;transition:opacity .35s}
#vtSub.on{opacity:1}#vtSub small{display:block;font:600 10px monospace;letter-spacing:.32em;color:#ff4a3a;margin-bottom:6px;text-transform:uppercase;text-shadow:none}
body.sv-geen-ondertitels #vtSub{display:none}`;document.head.appendChild(s)}
function vtTekst(t){vtCss();if(!vtSub){vtSub=document.createElement('div');vtSub.id='vtSub';vtSub.setAttribute('data-ondertitel','');document.body.appendChild(vtSub)}
  if(!t){vtSub.classList.remove('on');return}vtSub.innerHTML='<small>De verslaggever</small>'+t;vtSub.classList.add('on')}
// speel een zin; wacht tot hij klaar is (of tot de speler de scène overslaat). Zonder geluid: alleen de ondertitel.
async function verteller(id){const t=VT[id];if(!t)return;
  try{if(G.verhaalInst&&G.verhaalInst.get&&G.verhaalInst.get('verteller')===false)return}catch(e){}
  const C=G.cut,geluid=!G.snd||G.snd.fxOn||G.snd.muOn;let klaar=false,dur=Math.max(3,t.length/15);
  if(geluid&&aan()){try{vtMaak();
    vtEl.src='/audio/verhaal/verteller/'+id+'.mp3'+V;if(vtG)vtG.gain.value=1.15;vtEl.onended=()=>{klaar=true};vtEl.onerror=()=>{klaar=false};
    const p=vtEl.play();if(p&&p.catch)p.catch(()=>{});vtEl.onloadedmetadata=()=>{if(isFinite(vtEl.duration))dur=vtEl.duration+.2}}catch(e){}}
  duik=.32;vtTekst(t);const sb=document.getElementById('svSub');if(sb)sb.hidden=true;const t0=performance.now();
  while(!klaar&&(performance.now()-t0)/1000<dur+(vtEl&&!vtEl.paused?2:0)){const a=performance.now();if(C&&C.wacht){await C.wacht(.1);if(performance.now()-a<2)break}else await new Promise(r=>setTimeout(r,100))}
  try{if(vtEl&&!vtEl.paused)vtEl.pause()}catch(e){}vtTekst(null);duik=1;await new Promise(r=>setTimeout(r,250))}
G.verteller=verteller;G.verteller.tekst=VT;

G.verhaalMuziek={zet,get nu(){return nu},deks:()=>DEKS.map(d=>({num:d.num,bezig:d.bezig,vol:+d.vol.toFixed(2),t:+(d.el.currentTime||0).toFixed(1),pauze:d.el.paused})),duik(k){duik=Math.max(0,Math.min(1,k))},NUM,STEMMING};
})();
