// Pixelstad: emotes. Je poppetje kan zwaaien, dansen, juichen, buigen, uitdagen, een duim geven, spierballen laten zien, gaan
// zitten en geld strooien. Toets T (of de knop rechtsboven) opent het rad; met 1 tot 9 kies je snel. Mensen in de buurt reageren:
// ze zwaaien terug, klappen, dansen mee, lopen weg of gaan de strijd aan (stad-npc.js: G.onEmote).
(function(){
'use strict';
const G=STAD,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const P=(d,c)=>`<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${d.split(';').map(r=>{const [x,y,w,h,f]=r.split(',');return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f||c||'currentColor'}"/>`}).join('')}</svg>`;
const IC={
  zwaai:P('6,6,4,9;7,3,2,3;10,2,2,5;12,1,2,3;3,8,3,2'),
  dans:P('7,1,2,2;6,4,4,5;3,3,3,2;10,6,3,2;5,9,2,5;9,9,2,3;10,12,3,2'),
  juich:P('7,3,2,2;6,6,4,5;3,1,2,6;11,1,2,6;6,11,2,4;8,11,2,4'),
  buig:P('3,5,2,2;4,7,7,3;10,6,2,8;8,13,2,2;5,8,2,4'),
  uitdaag:P('2,6,4,4;10,6,4,4;6,7,4,2;3,4,2,2;11,4,2,2;7,11,2,3'),
  duim:P('3,7,9,7;7,2,3,5;12,8,2,5;3,7,2,7,#0006'),
  flex:P('7,2,2,2;5,5,6,6;1,4,4,3;11,4,4,3;1,2,2,2;13,2,2,2;6,11,2,4;8,11,2,4'),
  zit:P('5,2,2,2;4,5,4,5;4,10,8,2;10,10,2,5;2,12,3,2'),
  strooi:P('1,9,14,6;3,11,10,2,#0006;4,2,3,2;9,1,3,2;7,5,3,2;12,5,2,2;2,5,2,2'),
  smile:P('2,2,12,12;5,5,2,2,#0009;9,5,2,2,#0009;4,9,2,1,#0009;5,10,6,1,#0009;10,9,2,1,#0009')};
G.emoteIc=IC;
const EMO=[['zwaai','Zwaaien',2.4],['dans','Dansen',0],['juich','Juichen',2.4],['buig','Buigen',1.9],['duim','Duim omhoog',1.8],['flex','Flexen',2.6],['uitdaag','Uitdagen',2.6],['zit','Zitten',0],['strooi','Geld strooien',2.2]];
G.emotes=EMO;
let endT=0;
// opstaan of ophouden (wordt ook aangeroepen als je gaat lopen)
G.standUp=function(){if(G.poseLock)return;const was=G.emote||G.sitting;G.emote=null;if(G.sitting){G.sitting=false;G.onStand&&G.onStand()}clearTimeout(endT);if(G.pose&&!G.poseKeep)G.pose=null;return was};
function can(){return !(G.driving||G.hidden||G.paused||G.talking||G.poseLock)}
const strooiCost=()=>{try{const c=G.roofRef&&G.roofRef();return Math.max(20,Math.round(((c?c.min+c.max:80)/2)*.3/5)*5)}catch(e){return 25}};
G.strooiCost=strooiCost;
G.doEmote=function(id){const e=EMO.find(x=>x[0]===id);if(!e||!can())return false;G.stopPath&&G.stopPath();clearTimeout(endT);
  if(id==='zit'){G.emote=null;G.sitting=true;G.snd&&G.snd.fx('hide');G.onEmote&&G.onEmote('zit');return true}
  if(id==='strooi'){const c=strooiCost();if(S.cash<c){G.toast('Daar heb je '+fmt(c)+' contant voor nodig','bad');return false}S.cash-=c;try{save()}catch(x){}G.snd&&G.snd.fx('cash');
    for(let i=0;i<3;i++)setTimeout(()=>{G.fx2&&G.fx2.burst(G.P.x,2.2,G.P.z,i%2?'#3fe395':'#ffd35a',9)},i*260);G.fx2&&G.fx2.float('−'+fmt(c),G.P.x,G.P.z,'#ffd35a')}
  G.sitting=false;G.emote={id,t0:performance.now()};
  if(id==='zwaai'||id==='duim')G.snd&&G.snd.fx('blip');if(id==='juich')G.snd&&G.snd.fx('ok');if(id==='uitdaag')G.snd&&G.snd.fx('whistle');
  if(e[2])endT=setTimeout(()=>{if(G.emote&&G.emote.id===id)G.emote=null},e[2]*1000);
  G.ev&&G.ev('emote');G.onEmote&&G.onEmote(id);return true};
/* ---------- het rad ---------- */
const box=document.createElement('div');box.className='sd-em';box.id='sdEm';box.hidden=true;document.body.appendChild(box);
function render(){box.innerHTML=`<div class="sd-em-in">${EMO.map((e,i)=>`<button data-em="${e[0]}" title="${E(e[1])}"><i>${IC[e[0]]}</i><span>${E(e[1])}${e[0]==='strooi'?`<small>${fmt(strooiCost())}</small>`:''}</span>${touch?'':`<kbd>${i+1}</kbd>`}</button>`).join('')}</div>`}
function open(){if(!can()&&!G.emote&&!G.sitting){return}render();box.hidden=false;box.classList.remove('go');void box.offsetWidth;box.classList.add('go');G.snd&&G.snd.fx('tab')}
function close(){box.hidden=true}
G.emoteWheel={open,close,toggle:()=>box.hidden?open():close(),isOpen:()=>!box.hidden};
box.addEventListener('click',e=>{const b=e.target.closest('[data-em]');if(!b){close();return}close();G.doEmote(b.dataset.em)});
addEventListener('keydown',e=>{const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(e.repeat)return;const k=e.key.toLowerCase();
  if(!box.hidden){if(k==='escape'||k==='t'){e.preventDefault();e.stopImmediatePropagation();close();return}const n=+k;if(n>=1&&n<=EMO.length){e.preventDefault();e.stopImmediatePropagation();close();G.doEmote(EMO[n-1][0])}return}
  if(k==='t'&&!G.paused&&!(K.dialogOpen&&K.dialogOpen())){e.preventDefault();open()}},true);
// knop in de HUD (naast kaart en telefoon)
const wait=setInterval(()=>{const w=document.querySelector('.sd-btns');if(!w)return;clearInterval(wait);const b=document.createElement('button');b.className='sd-b sd-b-em';b.id='sdEmB';b.title='Emotes (T)';b.innerHTML=`${IC.smile}<span>Emote</span><kbd>T</kbd>`;w.insertBefore(b,w.firstChild);
  b.addEventListener('click',()=>G.emoteWheel.toggle())},200);
// weg met het rad als je iets anders gaat doen
setInterval(()=>{if(!box.hidden&&(G.paused||G.driving||G.talking))close()},300);
// wat je zelf zegt (tekstwolkje boven je hoofd)
G.zeg=function(t,o){if(G.bubble&&G.P&&!G.driving)G.bubble(G.P,t,Object.assign({col:'#fff3c8',life:2.2},o||{}))};
})();
