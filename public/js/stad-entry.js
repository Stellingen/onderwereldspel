// Ingang naar de Pixelstad vanuit het klikspel. Alleen voor VIP en High roller (en beheerders):
// - na het inloggen één keer per sessie de keuze: Klikspel of Pixelstad (met 'onthoud mijn keuze');
// - een vaste link in het menu (computer) en in het Meer-menu (telefoon).
// Verandert niets aan het klikspel zelf. Op /stad (dat dezelfde scripts laadt) doet dit bestand niets.
(function(){
'use strict';
if(location.pathname.indexOf('/stad')===0)return;
const vip=()=>(typeof tier==='function'&&tier()>=1)||!!window.__ADMIN__;
const allowed=()=>!!window.__TOKEN__&&vip();
if(!allowed())return;
const css=`.nav-stad{position:relative}.nav-stad em,.ms-stad em{font-style:normal;font:800 9px var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:#111;background:var(--acc);padding:1px 4px;margin-left:auto}
.ms-stad{display:flex;align-items:center;gap:10px;margin:10px 0 4px;padding:12px 14px;background:linear-gradient(100deg,rgba(255,122,26,.18),rgba(77,125,255,.12));border:1px solid rgba(255,122,26,.45);color:var(--fg);text-decoration:none;clip-path:var(--cut-s)}
.ms-stad svg{width:22px;height:22px;color:var(--acc)}.ms-stad b{font:800 15px var(--f-head);text-transform:uppercase;letter-spacing:.06em}.ms-stad small{display:block;font-size:11.5px;color:var(--mute)}
.sc-ov{position:fixed;inset:0;z-index:75;background:rgba(4,5,7,.88);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px;overflow:auto;animation:tin .2s}
.sc-box{width:min(760px,100%)}.sc-box>small{display:block;font:700 11px var(--f-mono);letter-spacing:.24em;text-transform:uppercase;color:var(--acc);margin-bottom:6px}
.sc-box>h2{margin:0 0 16px;font:900 clamp(30px,5vw,46px)/1 var(--f-display);text-transform:uppercase}
.sc-opts{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sc-o{display:flex;flex-direction:column;text-align:left;padding:0;background:var(--panel);border:1px solid var(--line2);color:var(--fg);cursor:pointer;clip-path:var(--cut);font:inherit;transition:border-color .15s,transform .15s}
.sc-o:hover,.sc-o:focus-visible{border-color:var(--acc);transform:translateY(-2px)}
.sc-art{height:150px;display:block;width:100%;background:#0b0d12;image-rendering:pixelated}
.sc-t{padding:14px 16px 16px;display:flex;flex-direction:column;gap:6px}
.sc-t b{font:900 26px/1 var(--f-display);text-transform:uppercase;display:flex;align-items:center;gap:8px}
.sc-t b em{font:800 10px var(--f-mono);font-style:normal;letter-spacing:.1em;color:#111;background:var(--acc);padding:2px 6px}
.sc-t span{font-size:13.5px;line-height:1.5;color:var(--mute)}
.sc-rem{display:flex;align-items:center;gap:8px;margin-top:14px;font-size:13px;color:var(--mute);cursor:pointer}.sc-rem input{accent-color:var(--acc);width:16px;height:16px}
@media (max-width:620px){.sc-opts{grid-template-columns:1fr}.sc-art{height:110px}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const ICO='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l5-3v15M8 21V4l7 3v14M15 21V11l6 2v8M2 21h20"/><path d="M11 9h1M11 12h1M11 15h1M18 15h1"/></svg>';
// link in het menu: terug zetten als het menu opnieuw getekend wordt
function inject(){const nav=document.getElementById('nav');
  if(!vip())return;
  if(nav&&!nav.querySelector('.nav-stad')){const a=document.createElement('a');a.className='navlink nav-stad';a.href='/stad';a.title='Pixelstad: loop zelf door de stad';a.innerHTML=ICO+'<span>Pixelstad</span><em>beta</em>';
    const sp=nav.querySelector('.navspace');if(sp)sp.after(a);else nav.appendChild(a)}
  const pn=document.querySelector('#msheet .ms-panel');
  if(pn&&!pn.querySelector('.ms-stad')){const a=document.createElement('a');a.className='ms-stad';a.href='/stad';a.innerHTML=ICO+'<span><b>Pixelstad</b><small>Loop zelf door de stad. Alleen voor VIP en High roller.</small></span><em>beta</em>';
    const h=pn.querySelector('.ms-search');if(h)h.after(a);else pn.appendChild(a)}}
inject();
['nav','msheet'].forEach(id=>{const el=document.getElementById(id);if(el)new MutationObserver(inject).observe(el,{childList:true})});
setTimeout(()=>{const el=document.getElementById('msheet');if(el&&!el._scObs){el._scObs=1;new MutationObserver(inject).observe(el,{childList:true})}inject()},1500);
// keuze na het inloggen
let mode=null,pref=null;try{mode=sessionStorage.getItem('ow_mode');pref=localStorage.getItem('ow_mode_pref')}catch(e){}
if(mode)return;
const go=(m,remember)=>{try{sessionStorage.setItem('ow_mode',m);if(remember)localStorage.setItem('ow_mode_pref',m)}catch(e){}if(m==='stad')location.href='/stad'};
if(pref==='stad'&&vip()){go('stad');return}
if(pref==='klik'){go('klik');return}
// pixelplaatje van de stad (zelf getekend)
function art(){let s='<svg class="sc-art" viewBox="0 0 120 50" preserveAspectRatio="xMidYMax slice" shape-rendering="crispEdges">';
  s+='<rect width="120" height="50" fill="#141a2a"/><rect y="30" width="120" height="20" fill="#0e1220"/>';
  const B=[[2,22,10,'#3a2a3a'],[13,14,9,'#2b3550'],[23,26,12,'#4a2f2a'],[36,8,10,'#1b1519'],[47,20,11,'#2f4a36'],[59,12,8,'#29597d'],[68,24,13,'#5a4a3a'],[82,16,9,'#3a3d42'],[92,6,10,'#2c6a66'],[103,20,15,'#4d2f26']];
  B.forEach(([x,y,w,c],i)=>{s+=`<rect x="${x}" y="${y}" width="${w}" height="${50-y}" fill="${c}"/>`;for(let yy=y+2;yy<44;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=3){const on=((xx*7+yy*13+i)%5)<2;s+=`<rect x="${xx}" y="${yy}" width="1" height="1" fill="${on?(i===3?'#ff4fd8':'#ffd98a'):'#0a0c12'}"/>`}});
  s+='<rect y="46" width="120" height="4" fill="#2a2c33"/><rect x="0" y="47" width="120" height="1" fill="#3a3c44"/>';
  for(let x=4;x<120;x+=10)s+=`<rect x="${x}" y="48" width="4" height="1" fill="#e8e4d8"/>`;
  s+='<rect x="57" y="40" width="3" height="3" fill="#d9a27a"/><rect x="56" y="43" width="5" height="3" fill="#ff7a1a"/><rect x="57" y="46" width="1" height="2" fill="#1d2531"/><rect x="59" y="46" width="1" height="2" fill="#1d2531"/>';
  return s+'</svg>'}
function artK(){return '<svg class="sc-art" viewBox="0 0 120 50" preserveAspectRatio="xMidYMax slice"><rect width="120" height="50" fill="#101216"/>'
  +[0,1,2].map(r=>[0,1,2,3].map(c=>`<rect x="${8+c*27}" y="${6+r*14}" width="23" height="10" fill="#15181d" stroke="#2b3038" stroke-width=".6"/><rect x="${10+c*27}" y="${8+r*14}" width="${6+((r+c)%3)*4}" height="2" fill="${['#ff7a1a','#3fe395','#b8a1ff','#a9dcff'][(r+c)%4]}"/><rect x="${10+c*27}" y="${12+r*14}" width="12" height="1.4" fill="#565b64"/>`).join('')).join('')+'</svg>'}
function ask(){if(document.querySelector('.sc-ov'))return;const ov=document.createElement('div');ov.className='sc-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Hoe wil je spelen?');
  ov.innerHTML=`<div class="sc-box"><small>${typeof isHR==='function'&&isHR()?'High roller':'VIP'} · nieuw</small><h2>Hoe wil je spelen?</h2>
   <div class="sc-opts"><button class="sc-o" data-m="klik">${artK()}<span class="sc-t"><b>Klikspel</b><span>Zoals je gewend bent: alles met een paar klikken, snel en overzichtelijk.</span></span></button>
   ${vip()?`<button class="sc-o" data-m="stad">${art()}<span class="sc-t"><b>Pixelstad <em>beta</em></b><span>Loop zelf door de stad, ga gebouwen binnen en speel daar. Zelfde voortgang.</span></span></button>`:''}
   </div>
   <label class="sc-rem"><input type="checkbox" id="scRem"> Onthoud mijn keuze (wisselen kan altijd via het menu of je telefoon)</label></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;const rem=document.getElementById('scRem').checked;go(b.dataset.m,rem);ov.remove()})}
// niet over een melding of een lopend spel heen: wachten tot het rustig is
let tries=0;(function wait(){const m=document.getElementById('modal');if((m&&!m.hidden)||document.querySelector('.cg-ov,.chase-ov,.tour,.tb-ov')){if(++tries<60)setTimeout(wait,1000);return}ask()})();
})();
