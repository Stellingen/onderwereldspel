// Op de telefoon: uitleg hoe je Onderwereld op je beginscherm zet, zodat hij opent als een app (schermvullend, zonder adresbalk).
// - Alleen op een telefoon/tablet (iPhone/iPad/Android) en niet als hij al als app geopend is (display-mode: standalone).
// - Android/Chrome: vangt 'beforeinstallprompt' op, dan kan het met één tik ("Installeren").
// - Kruisje = 5 dagen niet tonen, "Niet meer laten zien" = nooit meer. Opnieuw openen kan altijd met owInstall.open().
(function(){
const ua=navigator.userAgent||'',KEY='ow_pwa_hide';
const ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
const android=/Android/i.test(ua);
const standalone=()=>{try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true}catch(e){return false}};
const iosOther=ios&&/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua),samsung=/SamsungBrowser/i.test(ua);
let deferred=null,shown=false,tab=ios?'ios':'android';
const get=()=>{try{return localStorage.getItem(KEY)}catch(e){return null}};
const set=v=>{try{localStorage.setItem(KEY,v)}catch(e){}};
const hidden=()=>{const v=get();if(v==='never')return true;const t=+v;return t>0&&Date.now()<t};

const IC={
 share:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>',
 dots:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
 kebab:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
 plus:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
 menu:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 phone:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10.5 18.5h3"/><path d="M12 6.5v6M9.5 10l2.5 2.5 2.5-2.5"/></svg>',
 x:'<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'};
const K=(ic,t)=>`<span class="owi-k">${IC[ic]||''}${t?'<b>'+t+'</b>':''}</span>`;

function steps(t){
 if(t==='ios')return [
  iosOther?`Tik rechtsboven in de adresbalk op ${K('share')} (delen). In Safari staat hij onderaan; zie je hem niet, tik dan eerst op ${K('dots')}.`
          :`Tik onderaan op ${K('share')} (delen). Zie je die niet, tik dan eerst op ${K('dots')} en daarna op ${K('share','Deel')}.`,
  `Scroll een stukje naar beneden en tik op ${K('plus','Zet op beginscherm')}. Staat hij er niet tussen? Tik dan op <b>Meer</b> of <b>Wijzig acties</b>.`,
  `Laat <b>Open als webapp</b> aan staan (als je die ziet) en tik rechtsboven op <b>Voeg toe</b>.`,
  `Open Onderwereld vanaf je beginscherm en log één keer in. Daarna blijf je ingelogd.`];
 return samsung?[
  `Tik onderaan op ${K('menu')} (menu).`,
  `Tik op <b>Pagina toevoegen aan</b> en kies <b>Startscherm</b>.`,
  `Tik op <b>Toevoegen</b>.`,
  `Open Onderwereld vanaf je startscherm. Je blijft ingelogd.`]:[
  `Tik rechtsboven op ${K('kebab')} (de drie puntjes).`,
  `Tik op <b>App installeren</b> of <b>Toevoegen aan startscherm</b>.`,
  `Kies <b>Installeren</b> en bevestig.`,
  `Open Onderwereld vanaf je startscherm. Je blijft ingelogd.`];
}

const CSS=`
.owi-bar{position:fixed;left:10px;right:10px;z-index:80;display:flex;align-items:center;gap:10px;padding:10px 10px 10px 12px;border-radius:14px;
 background:#14161b;color:#ebe8e2;box-shadow:0 12px 34px rgba(0,0,0,.6),inset 0 0 0 1px #2b3038;font:500 14px/1.3 'Schibsted Grotesk',system-ui,sans-serif;
 animation:owiIn .28s ease-out;max-width:520px;margin:0 auto}
.owi-ic{flex:none;width:40px;height:40px;border-radius:11px;display:grid;place-items:center;background:rgba(255,122,26,.14);color:#ff7a1a}
.owi-t{flex:1;min-width:0}.owi-t b{display:block;font-weight:700;font-size:14.5px}.owi-t span{color:#8a8f98;font-size:12.5px}
.owi-go{flex:none;border:0;border-radius:10px;padding:10px 13px;background:#ff7a1a;color:#140a02;font:700 13.5px/1 'Schibsted Grotesk',system-ui,sans-serif;cursor:pointer}
.owi-x{flex:none;width:32px;height:32px;border:0;border-radius:9px;background:transparent;color:#8a8f98;display:grid;place-items:center;cursor:pointer}
.owi-bg{position:fixed;inset:0;z-index:90;background:rgba(4,5,7,.72);display:flex;align-items:flex-end;justify-content:center;animation:owiFade .2s ease-out}
.owi-sh{width:100%;max-width:520px;max-height:88vh;overflow:auto;background:#101216;color:#ebe8e2;border-radius:20px 20px 0 0;box-shadow:inset 0 1px 0 #2b3038;
 padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));font:400 14.5px/1.45 'Schibsted Grotesk',system-ui,sans-serif;animation:owiUp .26s ease-out}
.owi-hd{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}.owi-hd .owi-x{margin-left:auto}
.owi-hd h3{margin:0;font:800 24px/1.05 'Big Shoulders Display',system-ui,sans-serif;letter-spacing:.01em;text-transform:uppercase}
.owi-hd p{margin:4px 0 0;color:#8a8f98;font-size:13.5px}
.owi-pros{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 0 14px}
.owi-pros div{background:#15181d;border-radius:10px;padding:9px 8px;font-size:12px;color:#c5c2bb;text-align:center;box-shadow:inset 0 0 0 1px #1e2228}
.owi-pros b{display:block;color:#ffad6b;font-size:13px;margin-bottom:2px}
.owi-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;background:#0b0c0f;border-radius:11px;margin-bottom:12px}
.owi-tabs button{border:0;border-radius:8px;padding:9px;background:transparent;color:#8a8f98;font:700 13.5px/1 'Schibsted Grotesk',system-ui,sans-serif;cursor:pointer}
.owi-tabs button.on{background:#1e2228;color:#ebe8e2}
.owi-st{list-style:none;margin:0;padding:0;counter-reset:s}
.owi-st li{counter-increment:s;position:relative;padding:11px 12px 11px 46px;margin-bottom:6px;background:#15181d;border-radius:12px;box-shadow:inset 0 0 0 1px #1e2228}
.owi-st li::before{content:counter(s);position:absolute;left:11px;top:10px;width:24px;height:24px;border-radius:50%;background:#ff7a1a;color:#140a02;font:800 13px/24px 'Schibsted Grotesk',system-ui,sans-serif;text-align:center}
.owi-k{display:inline-flex;align-items:center;gap:5px;vertical-align:middle;padding:2px 7px;margin:0 1px;border-radius:7px;background:#232831;color:#ebe8e2;line-height:1.2}
.owi-k svg{color:#6aa8ff}.owi-k b{font-weight:600}
.owi-now{display:block;width:100%;border:0;border-radius:12px;padding:14px;margin:0 0 12px;background:#ff7a1a;color:#140a02;font:800 15px/1 'Schibsted Grotesk',system-ui,sans-serif;cursor:pointer}
.owi-ft{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px}
.owi-ft button{border:0;background:transparent;color:#8a8f98;font:500 13px/1.2 'Schibsted Grotesk',system-ui,sans-serif;text-decoration:underline;cursor:pointer;padding:6px 0}
.owi-ft .owi-ok{background:#1e2228;color:#ebe8e2;text-decoration:none;border-radius:10px;padding:10px 16px;font-weight:700}
@keyframes owiIn{from{transform:translateY(16px);opacity:0}}@keyframes owiUp{from{transform:translateY(40px);opacity:.4}}@keyframes owiFade{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.owi-bar,.owi-sh,.owi-bg{animation:none}}`;
function css(){if(document.getElementById('owiCss'))return;const s=document.createElement('style');s.id='owiCss';s.textContent=CSS;document.head.appendChild(s)}
// in het spel staat op de telefoon onderaan de menubalk: de melding komt daarboven
function bottom(){const mb=document.querySelector('.mbar');const h=mb&&getComputedStyle(mb).display!=='none'?mb.getBoundingClientRect().height:0;return `calc(${Math.round(h)+10}px + ${h?'0px':'env(safe-area-inset-bottom,0px)'})`}

function bar(){if(shown||standalone()||hidden()||document.getElementById('owiBar'))return;
 if(document.querySelector('.owi-bg,#modal:not([hidden])'))return void setTimeout(bar,8000);
 shown=true;css();const d=document.createElement('div');d.className='owi-bar';d.id='owiBar';d.setAttribute('role','region');d.setAttribute('aria-label','Speel als app');
 d.style.bottom=bottom();
 d.innerHTML=`<span class="owi-ic">${IC.phone}</span><span class="owi-t"><b>Speel Onderwereld als app</b><span>Op je beginscherm, schermvullend.</span></span>
  <button class="owi-go" type="button">${deferred?'Installeren':'Zo doe je dat'}</button><button class="owi-x" type="button" aria-label="Later">${IC.x}</button>`;
 d.querySelector('.owi-go').onclick=()=>{if(deferred)install();else{close();open()}};
 d.querySelector('.owi-x').onclick=()=>{set(String(Date.now()+5*864e5));close()};
 document.body.appendChild(d)}
function close(){const d=document.getElementById('owiBar');if(d)d.remove()}

function sheet(){const s=document.querySelector('.owi-sh');if(!s)return;
 s.innerHTML=`<div class="owi-hd"><div><h3>Zet hem op je beginscherm</h3><p>Dan open je Onderwereld met één tik, net als een app: schermvullend, zonder adresbalk.</p></div><button class="owi-x" type="button" aria-label="Sluiten">${IC.x}</button></div>
  <div class="owi-pros"><div><b>Eén tik</b>Direct vanaf je beginscherm</div><div><b>Meer ruimte</b>Geen adresbalk of tabbladen</div><div><b>Gratis</b>Geen app store nodig</div></div>
  ${deferred&&tab==='android'?'<button class="owi-now" type="button">Installeren</button>':''}
  <div class="owi-tabs" role="tablist"><button type="button" role="tab" data-t="ios" class="${tab==='ios'?'on':''}" aria-selected="${tab==='ios'}">iPhone / iPad</button><button type="button" role="tab" data-t="android" class="${tab==='android'?'on':''}" aria-selected="${tab==='android'}">Android</button></div>
  <ol class="owi-st">${steps(tab).map(x=>`<li>${x}</li>`).join('')}</ol>
  <div class="owi-ft"><button type="button" class="owi-never">Niet meer laten zien</button><button type="button" class="owi-ok">Begrepen</button></div>`;
 s.querySelector('.owi-x').onclick=shut;s.querySelector('.owi-ok').onclick=()=>{set(String(Date.now()+14*864e5));shut()};
 s.querySelector('.owi-never').onclick=()=>{set('never');shut()};
 const nw=s.querySelector('.owi-now');if(nw)nw.onclick=install;
 s.querySelectorAll('.owi-tabs button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;sheet()})}
function open(){css();close();if(document.querySelector('.owi-bg'))return;const bg=document.createElement('div');bg.className='owi-bg';
 bg.innerHTML='<div class="owi-sh" role="dialog" aria-modal="true" aria-label="Op je beginscherm zetten"></div>';
 bg.addEventListener('click',e=>{if(e.target===bg)shut()});document.body.appendChild(bg);sheet()}
function shut(){const bg=document.querySelector('.owi-bg');if(bg)bg.remove()}
async function install(){const p=deferred;if(!p){open();return}deferred=null;close();shut();
 try{await p.prompt();const r=await p.userChoice;if(r&&r.outcome==='dismissed')set(String(Date.now()+5*864e5))}catch(e){open()}}

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;const g=document.querySelector('#owiBar .owi-go');if(g)g.textContent='Installeren'});
window.addEventListener('appinstalled',()=>{set('never');close();shut()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});
window.owInstall={open,phone:ios||android,standalone};
if((ios||android)&&!standalone())setTimeout(bar,location.pathname.startsWith('/game')?7000:3500);
})();
