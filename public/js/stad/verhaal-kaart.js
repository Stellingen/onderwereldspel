// Verhaalstad (/verhaal): de verhaalkaart. Zelfde kaart en minikaart als de Pixelstad (stad-kaart.js), maar met de soorten van het
// verhaal (via G.kaartMode):
//  - Hoofdmissie: groot, goud, pulserend, met een pijl aan de rand als hij buiten beeld is. Komt vanzelf uit G.story (doelregel)
//    of uit G.kaart.missie(id,{soort:'hoofd',x,z,n,sub}).
//  - Zijmissies: kleiner, lichtblauw. G.kaart.missie(id,{soort:'zij',x,z,n,sub}) / G.kaart.missieWeg(id).
//  - Speciale missies (soort:'speciaal') komen NOOIT op de kaart: die moet je zelf vinden.
//  - Plekken (thuis, school, werk, Sahara, …) uit M.PLEKKEN, zichtbaar vanaf hun hoofdstuk of als ze ontdekt zijn
//    (G.kaart.plek(id,true) of G.story.flag('plek_'+id,1)). Tramhaltes onder 'Stad' (pas zichtbaar als je inzoomt).
// Bovenin de kaart een menubalk: het doel van nu (met Route), Thuis, Instellingen. Plus een doel-pijl in de doelregel (navigatiehulp),
// die je in de instellingen uit kunt zetten (G.story.instelling('nav') en ('pijl')).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP;if(!G||!M||!G.kaart||!M.VERHAAL)return;
const K=G.kit,E=K.E,$s=id=>document.getElementById(id);
const C=G.kaart.cats;
/* ---------- soorten ---------- */
Object.assign(C,{
 hoofd:{g:'missie',lay:'missie',n:'Hoofdmissie',s:'Hier gaat het verhaal verder',sh:'dia',c:'#ffd35a',ic:'star',imp:3,nocl:1,pulse:1,fixed:1},
 zij:{g:'missie',lay:'missie',n:'Zijmissie',s:'Iets voor erbij. Verdwijnt als je eroverheen groeit',sh:'ci',c:'#7fd1ff',ic:'tip',imp:2,nocl:1},
 vthuis:{g:'vplek',lay:'vplek',n:'Thuis',s:'Flat De Santis, Westbuurt',sh:'hs',c:'#5fd35a',ic:'home',imp:3,nocl:1},
 vwerk:{g:'vplek',lay:'vplek',n:'Werk',s:'Waar je geld verdient',sh:'sq',c:'#ff8a3a',ic:'kop',imp:2,nocl:1},
 vschool:{g:'vplek',lay:'vplek',n:'School',s:'Westbuurt College',sh:'sq',c:'#7fb2ff',ic:'lijst',imp:2,nocl:1},
 vplek:{g:'vplek',lay:'vplek',n:'Plekken',s:'Waar je mensen kent',sh:'sq',c:'#e8e4da',ic:'door',imp:2},
 vgevaar:{g:'vplek',lay:'vplek',n:'Oppassen',s:'Politie en mensen met macht',sh:'shd',c:'#ff6f9f',ic:'badge',imp:2},
 halte:{g:'stad',lay:'stad',n:'Tramhalte',s:'Lijn 5 en 7',sh:'ci',c:'#f2c230',ic:'route',sm:1,dz:1.6,hz:1.1}});
C.hl.n='Adres';C.hl.s='Bezorgadres of iets uitgelicht';
const CATOF={thuis:'vthuis',werk:'vwerk',school:'vschool',plek:'vplek',gevaar:'vgevaar'};
/* ---------- missies ---------- */
const MIS=new Map();
G.kaart.missie=function(id,o){if(!o){MIS.delete(id)}else MIS.set(id,Object.assign({soort:'zij'},o));G.kaart.draw();return id};
G.kaart.missieWeg=id=>{if(id==null)MIS.clear();else MIS.delete(id);G.kaart.draw()};
G.kaart.missies=()=>[...MIS.entries()].map(([id,o])=>Object.assign({id},o));
// G.story.doel roept G.kaart.highlight(pos) aan met één object (of null): dat is de hoofdmissie. Met (x,z,naam,o) werkt het als altijd.
let hoofdOver=null;const baseHL=G.kaart.highlight;
G.kaart.highlight=function(x,z,n,o){if(x==null||typeof x==='object'){hoofdOver=x&&x.x!=null?{x:x.x,z:x.z,n:x.n||null,binnen:x.binnen}:null;G.kaart.draw();return 'hoofd'}return baseHL(x,z,n,o)};
const story=()=>G.story||null;
function hoofd(){const s=story();let p=null,n=null;
  try{if(s&&s.doelPlek){p=s.doelPlek();n=s.doelTekst&&s.doelTekst()}}catch(e){}
  if(!p&&hoofdOver)p=hoofdOver;if(p&&p.binnen)return null;
  const m=[...MIS.values()].find(o=>o.soort==='hoofd');if(!p&&m){p=m;n=m.n}
  return p&&p.x!=null?{x:p.x,z:p.z,n:n||p.n||'Hoofdmissie',sub:(m&&m.sub)||'Hoofdmissie'}:null}
G.kaart.hoofd=hoofd;
/* ---------- plekken ---------- */
const SHOW={};try{Object.assign(SHOW,JSON.parse(localStorage.getItem('verhaal_plekken')||'{}'))}catch(e){}
G.kaart.plek=function(id,on){SHOW[id]=on?1:0;try{localStorage.setItem('verhaal_plekken',JSON.stringify(SHOW))}catch(e){}G.kaart.draw()};
function hfst(){try{return (story()&&story().st().ch)||1}catch(e){return 1}}
function bekend(p){if(SHOW[p.id]===0)return false;if(SHOW[p.id]===1)return true;try{if(story()&&story().flag&&story().flag('plek_'+p.id))return true}catch(e){}return (p.ch||1)<=hfst()}
/* ---------- de kaartmodus ---------- */
G.kaartMode={title:'De Bezorger',
 groups:[['missie','Missies'],['vplek','Plekken'],['stad','Stad'],['route','Route']],
 lays:[['missie','Missies','dia','#ffd35a'],['vplek','Plekken','sq','#ff8a3a'],['stad','Stad','ci','#f2c230']],
 items(add){const h=hoofd();if(h)add({cat:'hoofd',x:h.x,z:h.z,n:h.n,sub:h.sub,pri:14,big:1,tgt:1,pulse:1});
  MIS.forEach((o,id)=>{if(o.soort==='zij'&&o.x!=null)add({cat:'zij',id:o.pl||null,x:o.x,z:o.z,n:o.n||'Zijmissie',sub:o.sub||'Zijmissie',pri:7})});
  (M.PLEKKEN||[]).forEach(p=>{if(p.x==null||!bekend(p))return;const cat=CATOF[p.cat]||'vplek';add({cat,id:p.id,x:p.x,z:p.z,n:p.n,sub:p.sub,ic:p.ic,c:cat==='vplek'?p.c:null,pri:cat==='vthuis'?9:5,big:cat==='vthuis'?1:0})});
  (M.HALTES||[]).forEach(t=>add({cat:'halte',x:t.x,z:t.z,n:'Tram '+t.lijn+' · '+t.n,pri:1}))},
 // onder de markeringen: zachte gloed rond de hoofdmissie, zodat hij ook van ver opvalt
 drawUnder(cx,sx,sz,Z){const h=hoofd();if(!h)return;const t=performance.now()/600,r=Math.max(18,26*Math.min(2,Z))*(1+.08*Math.sin(t));
  const gr=cx.createRadialGradient(sx(h.x),sz(h.z),2,sx(h.x),sz(h.z),r);gr.addColorStop(0,'rgba(255,211,90,.55)');gr.addColorStop(1,'rgba(255,211,90,0)');cx.fillStyle=gr;cx.beginPath();cx.arc(sx(h.x),sz(h.z),r,0,Math.PI*2);cx.fill()}};
/* ---------- stijl ---------- */
const css=`
.kpin.k-hoofd{width:40px;height:40px;z-index:6;filter:drop-shadow(0 0 6px rgba(255,211,90,.9))}
.kpin.k-hoofd .kp>i{transform:scale(1.15)}
.kpins.lo .kpin.k-hoofd,.kpins.vlo .kpin.k-hoofd{width:34px;height:34px}
.kpin.k-hoofd.pulse::before{border-width:4px;animation-duration:1.15s}
.kpin.k-hoofd::after{content:"";position:absolute;left:50%;top:50%;width:230%;height:230%;margin:-115% 0 0 -115%;border-radius:50%;border:2px solid #ffd35a;opacity:0;pointer-events:none;animation:kPulse 1.15s ease-out .55s infinite}
.klab.imp[style*="#ffd35a"]{font-size:14px}
.kpin.k-zij{width:24px;height:24px}
.vk-bar{display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid #2b3038;background:#0d0f13;overflow-x:auto;scrollbar-width:none;min-height:46px}
.vk-bar::-webkit-scrollbar{display:none}
.vk-doel{flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:9px;padding:5px 6px 5px 4px;background:none;border:0;color:#ece8de!important;cursor:pointer;text-align:left}
.vk-doel .kp{width:26px;height:26px;flex:none}
.vk-doel span{min-width:0;display:flex;flex-direction:column}
.vk-doel small{font:700 9.5px var(--f-mono,monospace);letter-spacing:.2em;text-transform:uppercase;color:#ffd35a}
.vk-doel b{font:700 14.5px/1.2 var(--f-head,sans-serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vk-doel.leeg b{color:#8a8f98;font-weight:600}
.vk-b{flex:none;display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 11px;background:#15181d;border:1px solid #3a4049;color:#ece8de!important;font:800 12px var(--f-head,sans-serif)!important;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.45)}
.vk-b i{width:15px;height:15px;display:block}.vk-b i svg{width:100%;height:100%;display:block}
.vk-b.go{background:#ffd35a;color:#111!important;border-color:#000}
.vk-b:hover{border-color:#6a717c}
@media (max-width:560px){.vk-b span{display:none}.vk-b{padding:0 9px}.vk-doel b{font-size:13.5px}}
.vk-pijl{flex:none;width:26px;height:26px;display:grid;place-items:center;margin:-4px 0;transition:transform .12s linear}
.vk-pijl[hidden]{display:none}
.vk-pijl svg{width:22px;height:22px;display:block;filter:drop-shadow(1px 1px 0 #000)}
@media (prefers-reduced-motion:reduce){.kpin.k-hoofd::after{animation:none}.vk-pijl{transition:none}}`;
const st=document.createElement('style');st.id='vkStijl';st.textContent=css;document.head.appendChild(st);
/* ---------- kop en menubalk in de grote kaart ---------- */
const ov=G.kaart.el;
if(ov){const t=ov.querySelector('.sd-k-t');if(t)t.innerHTML='<small>De Bezorger</small><b>Kaart</b>';
  const bar=document.createElement('div');bar.className='vk-bar';bar.id='vkBar';const top=ov.querySelector('.sd-k-top');if(top)top.after(bar);
  bar.addEventListener('click',e=>{const b=e.target.closest('[data-vk]');if(!b)return;const a=b.dataset.vk;
    if(a==='doel'){const h=hoofd();if(h)G.kaart.fly(h.x,h.z,Math.max(2.4,0));return}
    if(a==='route'){const h=hoofd();if(h){G.kaart.setWp(h.x,h.z,h.n);G.kaart.close()}return}
    if(a==='thuis'){const p=(M.PLEKKEN||[]).find(q=>q.id==='thuis');if(p)G.kaart.fly(p.x,p.z,2.6);return}
    if(a==='inst'){G.kaart.close();G.verhaalInst&&G.verhaalInst.open();return}
    if(a==='leg'){G.kaart.legend()}});}
function barHtml(){const h=hoofd(),pin=G.kaart.pin('hoofd',{});
  return `<button class="vk-doel${h?'':' leeg'}" data-vk="doel"${h?'':' disabled'}>${pin}<span><small>Hoofdmissie</small><b>${E(h?h.n:'Geen doel: verken de stad')}</b></span></button>
   ${h?`<button class="vk-b go" data-vk="route"><i>${K.ic.route}</i><span>Route</span></button>`:''}
   <button class="vk-b" data-vk="thuis"><i>${K.ic.home}</i><span>Thuis</span></button>
   <button class="vk-b" data-vk="inst" aria-label="Instellingen"><i>${K.ic.info||K.ic.tip}</i><span>Instellingen</span></button>`}
let lastBar='';function bar(){const b=$s('vkBar');if(!b||G.kaart.el.hidden)return;const h=barHtml();if(h!==lastBar){lastBar=h;b.innerHTML=h}}
const open0=G.kaart.open;G.kaart.open=function(){open0();lastBar='';bar();G.kaart.refresh&&G.kaart.refresh()};
setInterval(bar,700);
/* ---------- doel-pijl (navigatiehulp) ---------- */
const navOn=()=>{try{const s=story();if(s&&s.instelling){if(s.instelling('nav')===false)return false;if(s.instelling('pijl')===false)return false}}catch(e){}return true};
const pijl=document.createElement('span');pijl.className='vk-pijl';pijl.hidden=true;pijl.setAttribute('aria-hidden','true');
pijl.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2 21 21 12 16 3 21Z" fill="#ffd35a" stroke="#111" stroke-width="2" stroke-linejoin="round"/></svg>';
function pijlStap(){const d=$s('svDoel');if(d&&pijl.parentNode!==d){d.insertBefore(pijl,d.firstChild);const i=d.querySelector('i:not(.vk-pijl)');if(i)i.style.display='none'}
  const h=hoofd(),P=G.P,ok=!!(h&&P&&navOn()&&!(G.binnen&&G.binnen.waar&&G.binnen.waar())&&Math.hypot(h.x-P.x,h.z-P.z)>4);
  pijl.hidden=!ok;if(d){const i=d.querySelector('i:not(.vk-pijl)');if(i)i.style.display=ok?'none':''}
  if(!ok)return;const a=Math.atan2(h.x-P.x,h.z-P.z),rel=(G.yaw||0)-a+Math.PI;pijl.style.transform=`rotate(${rel}rad)`}
setInterval(pijlStap,120);
G.kaart.pijl=pijlStap;
})();
