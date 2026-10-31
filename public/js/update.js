// Nieuwe versie van het spel? Het spel laadt zijn code één keer; staat het tabblad of de app lang open, dan draai je anders
// nog de oude code. Elke 2 minuten en bij terugkomen naar de app vragen we de versie op. Is die nieuw:
// - kom je terug naar de app (of staat hij op de achtergrond) en ben je niet midden in iets, dan ververst hij meteen;
// - anders een balk "Nieuwe versie" met een knop; na een minuut zonder actie ververst hij ook vanzelf als het kan.
(function(){
let seen=false,bar=null;
// midden in iets (kraak, vlucht, spin, witwassen, casino of een pop-up): dan niet vanzelf verversen, alleen met de knop
const busy=()=>{try{return !!(window.__chase||(window.kk&&kk.busy)||(window.vd&&vd.busy)||(typeof ww!=='undefined'&&ww&&ww.busy)||(typeof carSearch!=='undefined'&&carSearch)||(typeof page!=='undefined'&&page==='casino')||document.querySelector('.chase-ov,.owi-bg,#modal:not([hidden])'))}catch(e){return false}};
function reload(){try{if(typeof save==='function')save()}catch(e){}setTimeout(()=>location.reload(),350)}
function showBar(){if(bar)return;bar=document.createElement('div');bar.className='upd-bar';bar.setAttribute('role','status');
 bar.innerHTML='<span><b>Nieuwe versie van het spel</b> Ververs om de laatste aanpassingen te krijgen. Je voortgang blijft bewaard.</span><button type="button">Nu verversen</button>';
 bar.querySelector('button').onclick=reload;document.body.appendChild(bar);
 // na een minuut vanzelf, zodra je niet midden in een spin, vlucht of kraak zit
 setTimeout(function tryNow(){if(!busy())reload();else setTimeout(tryNow,5000)},60000)}
async function check(){if(!window.__VER__||seen)return;
 try{const r=await fetch('/api/version',{cache:'no-store'});if(!r.ok)return;const v=(await r.json()).v;
  if(v&&v!==window.__VER__){seen=true;if(document.visibilityState==='hidden'&&!busy())reload();else showBar()}}catch(e){}}
setInterval(check,120000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(seen&&!busy())reload();else check()}});
window.addEventListener('focus',check);
const st=document.createElement('style');st.textContent=`.upd-bar{position:fixed;left:50%;transform:translateX(-50%);top:calc(10px + env(safe-area-inset-top,0px));z-index:95;display:flex;align-items:center;gap:12px;
 width:min(560px,calc(100% - 20px));padding:10px 10px 10px 14px;border-radius:12px;background:#14161b;color:#ebe8e2;box-shadow:0 12px 34px rgba(0,0,0,.6),inset 0 0 0 1px #ff7a1a;
 font:500 13px/1.35 'Schibsted Grotesk',system-ui,sans-serif}.upd-bar span{flex:1}.upd-bar b{display:block;font-size:14px}
 .upd-bar button{flex:none;border:0;border-radius:9px;padding:10px 13px;background:#ff7a1a;color:#140a02;font:700 13px/1 'Schibsted Grotesk',system-ui,sans-serif;cursor:pointer}`;
document.head.appendChild(st);
})();
