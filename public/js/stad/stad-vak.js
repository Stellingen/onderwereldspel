// Pixelstad: vakmanschap. Hoe vaker je iets doet, hoe makkelijker het spelletje ervan wordt. Een hogere rang leert sneller.
//  - S.stadVak = {sleutel: punten}. Sleutel = de klus ('zakken', 'inbraak', 'kluis', 'kortsluit', 'tag', 'vecht', …) of anders
//    de naam van het spel ('timing', 'slot', …).
//  - niveau 0 … 10: niveau n vraagt 4·n² punten. Per poging: gelukt 1, mislukt 0,35, keer 1 + 0,12 · rang.
//  - G.vak.ease(k): 0 … 1 (niveau weegt 0,65, rang 0,35). Elk spel zet dat om in eigen knoppen (groen vak, tijd, …).
// Ook hier: het 'podium' (donkere, wazige achtergrond) waar elk spelletje op staat, en de uitslag (+x vakmanschap).
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fx=n=>{try{G.snd&&G.snd.fx(n)}catch(e){}};
const NAMES={zakken:'zakkenrollen',roof:'beroven',overval:'overvallen',autokraak:'auto\'s openbreken',kortsluit:'kortsluiten',inbraak:'sloten openen',
  kluis:'kluizen kraken',vecht:'knokken',tag:'taggen',bescherm:'beschermgeld innen',openbreken:'kisten openbreken',zoeken:'doorzoeken',vissen:'vissen',
  optreden:'optreden',timing:'timing',mash:'snel drukken',hold:'volhouden',ritme:'ritme',haal:'binnenhalen',slot:'sloten openen',draad:'bedrading'};
const MAXL=10,need=n=>4*n*n;
const store=()=>{try{if(typeof S==='undefined'||!S)return {};if(!S.stadVak||typeof S.stadVak!=='object')S.stadVak={};return S.stadVak}catch(e){return {}}};
const pts=k=>+store()[k]||0;
function level(k){const x=pts(k);let n=0;while(n<MAXL&&x>=need(n+1))n++;return {n,fr:n>=MAXL?1:clamp((x-need(n))/(need(n+1)-need(n)),0,1),x}}
const rank=()=>{try{return typeof rankIdx==='function'&&typeof S!=='undefined'&&S?rankIdx(S.xp||0):0}catch(e){return 0}};
const rankMax=()=>{try{return typeof RANKS!=='undefined'&&RANKS.length>1?RANKS.length-1:19}catch(e){return 19}};
const rate=()=>1+.12*rank();
function ease(k){const L=level(k);return clamp(.65*Math.min(1,(L.n+(L.n>=MAXL?0:L.fr))/MAXL)+.35*clamp(rank()/rankMax(),0,1),0,1)}
const naam=k=>NAMES[k]||String(k||'dit');
const num=v=>(Math.round(v*10)/10).toString().replace('.',',');
function add(k,ok){if(!k)return null;const s=store(),b=level(k).n,g=Math.round((ok?1:.35)*rate()*100)/100;s[k]=Math.round(((+s[k]||0)+g)*100)/100;
  try{typeof save==='function'&&save()}catch(e){}const a=level(k);const up=a.n>b;
  if(up){setTimeout(()=>{fx('lvl');try{G.toast&&G.toast('Je wordt beter in '+naam(k)+' · niveau '+a.n,'ok')}catch(e){}},350)}
  return {gain:g,lv:a.n,fr:a.fr,up}}
// balkje in elk paneel
function bar(k){const L=level(k);return `<div class="sd-vak" data-vk="${esc(k)}"><span>Vakmanschap · <b>${esc(naam(k))}</b> · niveau <em>${L.n}</em>${L.n>=MAXL?' · meester':''}</span><i><i style="width:${Math.round(L.fr*100)}%"></i></i></div>`}
function paint(el,k,g){const v=el&&el.querySelector('.sd-vak');if(!v)return;const L=level(k);v.querySelector('em').textContent=L.n;v.querySelector('i>i').style.width=Math.round(L.fr*100)+'%';
  if(g&&g.up)v.classList.add('up')}
/* ---------- podium: donkere, wazige laag over de wereld ---------- */
const bd=document.createElement('div');bd.className='sd-mfx';bd.hidden=true;document.body.appendChild(bd);
['pointerdown','click','wheel','touchstart'].forEach(n=>bd.addEventListener(n,e=>{e.stopPropagation()},{passive:true}));
const own=new Map();
function stage(id,on){if(on)own.set(id,on);else own.delete(id);const v=own.size>0,block=[...own.values()].some(x=>x===1||x===true);
  bd.hidden=!v;bd.classList.toggle('pass',!block);document.body.classList.toggle('sd-focus',block);
  if(block&&document.pointerLockElement){try{document.exitPointerLock()}catch(e){}}}
// uitslag: stempel + punten, het paneel blijft heel even staan (zonder te blokkeren) en verdwijnt dan
function finish(el,id,k,r,hide,lab){const ok=r==null||r==='cancel'?null:(r===true||r==='ok'||!!(r&&r.ok));
  if(ok==null||!k){hide();stage(id,0);return 0}
  const g=add(k,ok);lab=lab||[];
  el.classList.add('res',ok?'win':'lose');
  const d=document.createElement('div');d.className='sd-res';
  d.innerHTML=`<b>${esc(ok?(lab[0]||'Gelukt'):(lab[1]||'Mislukt'))}</b><small>+${num(g.gain)} vakmanschap${g.up?' · niveau '+g.lv+'!':''}</small>`;el.appendChild(d);
  paint(el,k,g);if(!ok)fx('bad');stage(id,'res');
  return setTimeout(()=>{hide();stage(id,0)},ok?1000:1250)}
G.vak={ease,level,add,naam,bar,paint,stage,finish,rate,get:k=>pts(k),need};
})();
