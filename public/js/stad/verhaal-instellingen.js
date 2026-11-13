// Verhaalstad (/verhaal): instellingen van de verhaalmodus. Eén scherm (pauzemenu met Esc of P, of de app op je telefoon, of de
// knop in de kaart) met: navigatiehulp (route + doel-pijl), ondertitels en hun grootte, cutscenes overslaan, camera, beeld, geluid
// en de toetsen. Opslag: in S.story.inst via G.story.instelling(k,v) (gaat mee met je save); zonder G.story in localStorage.
// Wat per apparaat hoort (pixelgrootte, camerastand, geluid) bewaart de engine zelf al in localStorage.
//
// Voor andere onderdelen:
//   G.verhaalInst.get(k)      → waarde (met standaard). Sleutels: nav, pijl, subs, subGrootte ('s'|'m'|'l'|'xl'), skip, schudden,
//                               schaduw, effecten, tril, camAfstand ('dicht'|'normaal'|'ver')
//   G.verhaalInst.set(k,v)    → zet en past meteen toe;  G.verhaalInst.open() / .close() / .isOpen();  G.verhaalInst.on(fn) (bij elke wijziging)
//   CSS: html[data-sv-sub] = s|m|l|xl en --sv-sub (schaal 0.85…1.6) voor ondertitels; body.sv-geen-ondertitels als ze uit staan.
//   Cutscenes: G.verhaalInst.get('skip') === false → niet overslaan.
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const K=G.kit,E=K.E,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const DEF={nav:true,pijl:true,subs:true,subGrootte:'m',skip:true,schudden:true,schaduw:true,effecten:true,tril:true,camAfstand:'normaal'};
const SUBS={s:.85,m:1,l:1.25,xl:1.6},AFST={dicht:32,normaal:46,ver:60};
let LS={};try{LS=JSON.parse(localStorage.getItem('verhaal_inst')||'{}')||{}}catch(e){LS={}}
const story=()=>G.story&&G.story.instelling?G.story:null;
function get(k){let v;try{const s=story();if(s)v=s.instelling(k)}catch(e){}if(v===undefined)v=LS[k];return v===undefined?DEF[k]:v}
const fns=[];
function set(k,v){try{const s=story();if(s)s.instelling(k,v)}catch(e){}LS[k]=v;try{localStorage.setItem('verhaal_inst',JSON.stringify(LS))}catch(e){}apply(k);fns.forEach(f=>{try{f(k,v)}catch(e){}})}
/* ---------- toepassen ---------- */
function apply(k){const all=k==null;
  if(all||k==='subs'||k==='subGrootte'){const g=get('subGrootte');document.documentElement.dataset.svSub=g;document.documentElement.style.setProperty('--sv-sub',SUBS[g]||1);document.body.classList.toggle('sv-geen-ondertitels',!get('subs'))}
  if(all||k==='nav'||k==='pijl'){try{const s=G.story;if(get('nav')===false){if(G.waypoint&&G.clearWaypoint)G.clearWaypoint()}else if(!all&&k==='nav'&&s&&s.doelPlek){const p=s.doelPlek();if(p&&!p.binnen&&G.setWaypoint)G.setWaypoint(p.x,p.z,(s.doelTekst&&s.doelTekst())||'Doel')}}catch(e){}G.kaart&&G.kaart.pijl&&G.kaart.pijl()}
  if(all||k==='schaduw'){try{const sc=G.scene&&G.scene();if(sc)sc.traverse(o=>{if(o.isDirectionalLight)o.castShadow=!!get('schaduw')})}catch(e){}}
  if(all||k==='effecten'){try{const u=G.post&&G.post.material.uniforms;if(u){const on=!!get('effecten');u.uAo.value=on?1:0;u.uOutline.value=on?1:.0;u.uVig.value=on?.35:.15}}catch(e){}}
  if(all||k==='camAfstand'){const d=AFST[get('camAfstand')]||46;if(G.ready){G.distT=d}}}
// cameraschudden uit = G.shake doet niets; trillen uit = navigator.vibrate doet niets
if(G.shake&&!G.shake.__vi){const sh=G.shake;G.shake=a=>{if(get('schudden')===false)return;sh(a)};G.shake.__vi=1}
try{if(navigator.vibrate&&!navigator.vibrate.__vi){const vb=navigator.vibrate.bind(navigator);const f=p=>get('tril')===false?false:vb(p);f.__vi=1;navigator.vibrate=f}}catch(e){}
/* ---------- het scherm ---------- */
const css=`
.vi-ov{position:fixed;inset:0;z-index:70;background:rgba(4,5,7,.74);display:grid;place-items:center;padding:14px;animation:sdFade .15s}
.vi-ov[hidden]{display:none}
.vi-box{width:min(720px,100%);max-height:min(860px,calc(100dvh - 28px));display:flex;flex-direction:column;background:var(--panel,#101216);border:1px solid #2b3038;box-shadow:10px 10px 0 rgba(0,0,0,.5),inset 0 3px 0 #ffd35a;color:#ece8de}
.vi-top{display:flex;align-items:center;gap:12px;padding:12px 10px 12px 16px;border-bottom:1px solid #2b3038}
.vi-top div{flex:1;display:flex;flex-direction:column}.vi-top small{font:700 10px var(--f-mono,monospace);letter-spacing:.24em;text-transform:uppercase;color:#ffd35a}
.vi-top b{font:900 28px/1 var(--f-display,sans-serif);text-transform:uppercase}
.vi-x{width:40px;height:40px;background:none;border:0;color:#ece8de!important;font-size:26px;cursor:pointer}
.vi-tabs{display:flex;gap:4px;padding:8px 10px 0;border-bottom:1px solid #2b3038;overflow-x:auto;scrollbar-width:none}.vi-tabs::-webkit-scrollbar{display:none}
.vi-tabs button{flex:none;padding:8px 12px 9px;background:none;border:0;border-bottom:3px solid transparent;color:#9aa0a8!important;font:800 13px var(--f-head,sans-serif)!important;text-transform:uppercase;letter-spacing:.06em;cursor:pointer}
.vi-tabs button.on{color:#ece8de!important;border-bottom-color:#ffd35a}
.vi-body{flex:1;min-height:0;overflow:auto;padding:6px 16px 14px;overscroll-behavior:contain}
.vi-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 14px;align-items:center;padding:12px 0;border-bottom:1px solid #1e2228}
.vi-row:last-child{border-bottom:0}
.vi-row>span{min-width:0}.vi-row>span b{display:block;font:700 15px/1.2 var(--f-head,sans-serif)}.vi-row>span small{display:block;margin-top:3px;font:500 12px/1.35 var(--f-body,sans-serif);color:#9aa0a8}
.vi-row.sub{padding-left:14px;border-left:2px solid #2b3038}
.vi-row.off{opacity:.45;pointer-events:none}
.vi-seg{display:inline-flex;flex-wrap:wrap;justify-content:flex-end;gap:0;border:1px solid #3a4049;background:#0c0e11}
.vi-seg button{min-width:44px;min-height:36px;padding:0 11px;background:none;border:0;border-left:1px solid #2b3038;color:#c9c5bb!important;font:700 12.5px var(--f-head,sans-serif)!important;cursor:pointer}
.vi-seg button:first-child{border-left:0}
.vi-seg button.on{background:#ffd35a;color:#111!important}
.vi-sw{position:relative;width:52px;height:30px;border-radius:15px;background:#3a3f48;border:2px solid #0b0c0f;cursor:pointer;flex:none}
.vi-sw::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#9aa0a8;transition:left .12s}
.vi-sw[aria-checked="true"]{background:#ffd35a}.vi-sw[aria-checked="true"]::after{left:25px;background:#111}
.vi-range{width:min(220px,40vw)}
.vi-demo{grid-column:1/-1;margin-top:4px;padding:10px 12px;background:#000;border-left:3px solid #ff4fd8;font:600 calc(15px * var(--sv-sub,1))/1.35 var(--f-body,sans-serif)}
.vi-demo b{color:#ff4fd8;margin-right:6px}
.vi-keys{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;align-items:center;padding:10px 0}
.vi-keys kbd{justify-self:start;display:inline-block;min-width:26px;padding:3px 7px;background:#1b1e24;border:1px solid #3a4049;border-bottom-width:3px;font:700 12px var(--f-mono,monospace);color:#ece8de;text-align:center;white-space:nowrap}
.vi-keys span{font:500 13.5px/1.3 var(--f-body,sans-serif)}
.vi-keys h5{grid-column:1/-1;margin:10px 0 0;font:800 11px var(--f-mono,monospace);letter-spacing:.18em;text-transform:uppercase;color:#8a8f98}
.vi-foot{display:flex;gap:8px;justify-content:space-between;align-items:center;padding:10px 12px;border-top:1px solid #2b3038}
.vi-foot small{font:500 11.5px var(--f-body,sans-serif);color:#8a8f98}
.vi-btn{padding:9px 14px;background:#15181d;border:1px solid #3a4049;color:#ece8de!important;font:800 12.5px var(--f-head,sans-serif)!important;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;box-shadow:2px 2px 0 rgba(0,0,0,.45)}
.vi-btn.go{background:#ffd35a;color:#111!important;border-color:#000}
.vi-pauze{display:grid;gap:8px;padding:14px 16px 6px}
.vi-pauze button{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;background:#15181d;border:1px solid #3a4049;color:#ece8de!important;font:800 16px var(--f-head,sans-serif)!important;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;text-align:left}
.vi-pauze button.go{background:#ffd35a;color:#111!important;border-color:#000}
.vi-pauze button i{width:18px;height:18px;display:block}.vi-pauze button i svg{width:100%;height:100%;display:block}
.vi-pauze button:focus-visible,.vi-seg button:focus-visible,.vi-sw:focus-visible,.vi-tabs button:focus-visible{outline:2px solid #fff;outline-offset:2px}
@media (max-width:600px){.vi-ov{padding:0}.vi-box{max-height:100dvh;height:100dvh;border:0}.vi-top b{font-size:22px}.vi-row{grid-template-columns:1fr}.vi-row>.vi-seg,.vi-row>.vi-sw,.vi-row>.vi-range{justify-self:start}.vi-body{padding:4px 14px 12px}}
@media (prefers-reduced-motion:reduce){.vi-ov{animation:none}.vi-sw::after{transition:none}}
/* ondertitels: grootte en uit (voor de cutscenes) */
body.sv-geen-ondertitels .sc-sub,body.sv-geen-ondertitels .cut-sub,body.sv-geen-ondertitels [data-ondertitel]{display:none!important}`;
const stEl=document.createElement('style');stEl.id='viStijl';stEl.textContent=css;document.head.appendChild(stEl);
const ov=document.createElement('div');ov.className='vi-ov';ov.id='viOv';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','viT');
document.body.appendChild(ov);
let tab='spel',view='inst',wasPaused=false;
const TABS=[['spel','Spel'],['beeld','Beeld'],['geluid','Geluid'],['toetsen','Toetsen']];
const seg=(k,opts,cur)=>`<div class="vi-seg" role="radiogroup">${opts.map(([v,n])=>`<button role="radio" aria-checked="${String(cur)===String(v)}" class="${String(cur)===String(v)?'on':''}" data-set="${k}" data-v="${v}">${E(n)}</button>`).join('')}</div>`;
const sw=(k,lab)=>`<button class="vi-sw" role="switch" aria-checked="${!!get(k)}" aria-label="${E(lab)}" data-sw="${k}"></button>`;
const row=(t,s,ctl,cls)=>`<div class="vi-row${cls?' '+cls:''}"><span><b>${t}</b>${s?`<small>${s}</small>`:''}</span>${ctl}</div>`;
function tabHtml(){const snd=G.snd||{};
  if(tab==='spel')return row('Navigatiehulp','Routelijn op de kaart en de minikaart naar je doel, plus de doel-pijl. Uit = zelf de weg vinden.',sw('nav','Navigatiehulp'))+
    row('Doel-pijl','Pijltje in de doelregel bovenin dat naar je doel wijst.',sw('pijl','Doel-pijl'),'sub'+(get('nav')?'':' off'))+
    row('Ondertitels','Wat er gezegd wordt in cutscenes en gesprekken.',sw('subs','Ondertitels'))+
    row('Grootte ondertitels','',seg('subGrootte',[['s','Klein'],['m','Normaal'],['l','Groot'],['xl','Extra groot']],get('subGrootte'))+`<div class="vi-demo"><b>Rafiq</b>Hé, jongen. Kom eens even terug.</div>`,'sub'+(get('subs')?'':' off'))+
    row('Cutscenes overslaan','Met de knop Overslaan of Esc. Uit = je kijkt ze altijd helemaal.',sw('skip','Cutscenes overslaan'))+
    row('Camera schudt','Bij klappen, explosies en vallen.',sw('schudden','Camera schudt'))+
    (touch?row('Trillen','De telefoon trilt bij belangrijke momenten.',sw('tril','Trillen')):'');
  if(tab==='beeld')return row('Camera','Bovenaf, over je schouder of door je ogen. Wisselen kan ook met V.',seg('cam',[['boven','Bovenaf'],['achter','Achter je'],['ogen','Ogen']],G.camMode||'boven'))+
    row('Afstand','Hoe ver de camera bovenaf van Luca hangt.',seg('camAfstand',[['dicht','Dichtbij'],['normaal','Normaal'],['ver','Ver']],get('camAfstand')))+
    row('Beeldkwaliteit','Scherp ziet er strakker uit, Grof is sneller op een oudere telefoon.',seg('pix',[[640,'Scherp'],[0,'Normaal'],[340,'Grof']],G.pixPref||0))+
    row('Schaduwen','Uit maakt het spel sneller.',sw('schaduw','Schaduwen'))+
    row('Contouren en diepte','Zwarte randjes, schaduw in hoeken en een vignet.',sw('effecten','Contouren en diepte'));
  if(tab==='geluid')return row('Geluidseffecten','',`<button class="vi-sw" role="switch" aria-checked="${!!snd.fxOn}" aria-label="Geluidseffecten" data-snd="fx"></button>`)+
    row('Muziek','',`<button class="vi-sw" role="switch" aria-checked="${!!snd.muOn}" aria-label="Muziek" data-snd="mu"></button>`)+
    row('Volume','',`<input class="vi-range" type="range" min="0" max="1" step=".05" value="${snd.vol!=null?snd.vol:.8}" data-vol aria-label="Volume">`);
  const k=(a,b)=>`<kbd>${a}</kbd><span>${b}</span>`;
  return `<div class="vi-keys">${touch?
    `<h5>Telefoon</h5>${k('Stick','Lopen; ver duwen is rennen')}${k('Ren','Rennen aan/uit')}${k('Tik','Praten, doen, naar binnen')}${k('Vegen','Camera draaien')}${k('Knijpen','In- en uitzoomen')}${k('Telefoon','Verhaal, kaart en instellingen')}<h5>Cutscenes</h5>${k('Tik','Volgende zin')}${k('Overslaan','Cutscene overslaan')}`:
    `<h5>Lopen</h5>${k('W A S D','Lopen (of de pijltjes)')}${k('Shift','Rennen')}${k('Klik','Erheen lopen of naar binnen')}<h5>Doen</h5>${k('E','Praten, doen, naar binnen; op de fiets stappen')}${k('Spatie','Doen (zoals E)')}${k('F','Instappen / uitstappen')}${k('B','Fietsbel')}${k('T','Emotes')}
     <h5>Camera</h5>${k('V','Camerastand wisselen')}${k('Z / C','Camera draaien')}${k('+ / −','Zoomen (of het scrollwiel)')}<h5>Menu</h5>${k('M','Kaart')}${k('J','Telefoon')}${k('Esc / P','Pauze en instellingen')}<h5>Cutscenes</h5>${k('Klik / Spatie','Volgende zin')}${k('Esc','Overslaan (als dat aanstaat)')}`}</div>`}
const IC={door:K.ic.door,map:K.ic.route,set:K.ic.info||K.ic.tip,ph:K.ic.talk,play:K.ic.up};
function html(){if(view==='pauze')return `<div class="vi-box"><div class="vi-top"><div><small>De Bezorger</small><b id="viT">Pauze</b></div><button class="vi-x" data-x aria-label="Sluiten">×</button></div>
   <div class="vi-pauze"><button class="go" data-p="verder"><i>${IC.play}</i>Verder spelen</button><button data-p="kaart"><i>${IC.map}</i>Kaart</button><button data-p="tel"><i>${IC.ph}</i>Telefoon</button><button data-p="inst"><i>${IC.set}</i>Instellingen</button><button data-p="toetsen"><i>${K.ic.lijst||IC.set}</i>Toetsen</button></div>
   <div class="vi-foot"><small>Je voortgang wordt vanzelf bewaard.</small></div></div>`;
  return `<div class="vi-box"><div class="vi-top"><div><small>De Bezorger</small><b id="viT">Instellingen</b></div><button class="vi-x" data-x aria-label="Sluiten">×</button></div>
   <div class="vi-tabs" role="tablist">${TABS.map(([k,n])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-tab="${k}">${n}</button>`).join('')}</div>
   <div class="vi-body" id="viBody">${tabHtml()}</div>
   <div class="vi-foot"><button class="vi-btn" data-reset>Standaard</button><button class="vi-btn go" data-x>Klaar</button></div></div>`}
function draw(){const sc=$s('viBody')?$s('viBody').scrollTop:0;ov.innerHTML=html();const b=$s('viBody');if(b)b.scrollTop=sc;const vr=ov.querySelector('[data-vol]');if(vr)vr.oninput=()=>G.snd&&G.snd.setVol(+vr.value)}
function open(v,t){if(G.kaart&&G.kaart.isOpen&&G.kaart.isOpen())G.kaart.close();if(G.phone&&G.phone.isOpen&&G.phone.isOpen())G.phone.close();
  view=v||'inst';if(t)tab=t;wasPaused=!!G.paused;ov.hidden=false;draw();if(!wasPaused&&G.pause)G.pause();G.snd&&G.snd.fx('open');
  setTimeout(()=>{const f=ov.querySelector(view==='pauze'?'[data-p="verder"]':'.vi-tabs .on');if(f)try{f.focus({preventScroll:true})}catch(e){}},30)}
function close(){if(ov.hidden)return;ov.hidden=true;G.snd&&G.snd.fx('close');const busy=(G.ui&&G.ui.cur&&G.ui.cur())||(G.cut&&G.cut.active&&G.cut.active());if(!wasPaused&&!busy&&G.resume)G.resume()}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov||t.closest('[data-x]')){close();return}
  const p=t.closest('[data-p]');if(p){const a=p.dataset.p;if(a==='verder'){close();return}if(a==='kaart'){close();G.kaart&&G.kaart.open();return}if(a==='tel'){close();G.phone&&G.phone.open();return}
    if(a==='inst'){view='inst';tab='spel';draw();return}if(a==='toetsen'){view='inst';tab='toetsen';draw();return}}
  const tb=t.closest('[data-tab]');if(tb){tab=tb.dataset.tab;draw();G.snd&&G.snd.fx('tab');return}
  const s=t.closest('[data-sw]');if(s){set(s.dataset.sw,!get(s.dataset.sw));draw();G.snd&&G.snd.fx('tab');return}
  const sg=t.closest('[data-set]');if(sg){const k=sg.dataset.set,v=sg.dataset.v;
    if(k==='cam'){G.setCam&&G.setCam(v,true)}else if(k==='pix'){G.setPix&&G.setPix(+v||0)}else set(k,v);draw();G.snd&&G.snd.fx('tab');return}
  const sn=t.closest('[data-snd]');if(sn&&G.snd){if(sn.dataset.snd==='fx')G.snd.setFx(!G.snd.fxOn);else G.snd.setMu(!G.snd.muOn);draw();return}
  if(t.closest('[data-reset]')){Object.keys(DEF).forEach(k=>set(k,DEF[k]));G.setPix&&G.setPix(0);draw();G.toast&&G.toast('Instellingen terug naar standaard','info')}});
// Esc of P: pauzemenu (alleen als er niets anders open is); Esc in het menu: terug of dicht
addEventListener('keydown',e=>{const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&!ov.contains(t))return;const k=e.key.toLowerCase();
  if(!ov.hidden){if(k==='escape'||(k==='p'&&view==='pauze')){e.preventDefault();e.stopImmediatePropagation();if(view==='inst'&&k==='escape'&&wasOpenedFromPause){view='pauze';wasOpenedFromPause=false;draw();return}close()}return}
  if(e.repeat)return;if(k!=='escape'&&k!=='p')return;
  const other=(G.kaart&&G.kaart.isOpen&&G.kaart.isOpen())||(G.phone&&G.phone.isOpen&&G.phone.isOpen())||(G.ui&&G.ui.cur&&G.ui.cur())||(G.cut&&G.cut.active&&G.cut.active())||G.talking||
    document.querySelector('.sd-dlg:not([hidden]),.sv-ov,.sd-mini:not([hidden]),.cg-ov,.sd-kaart:not([hidden])');
  if(other||!G.ready)return;e.preventDefault();wasOpenedFromPause=true;open('pauze')});
let wasOpenedFromPause=false;
ov.addEventListener('click',e=>{if(e.target.closest('[data-p="inst"],[data-p="toetsen"]'))wasOpenedFromPause=true},true);
/* ---------- telefoon-app ---------- */
const SETIC='<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="6" y="1" width="4" height="3"/><rect x="6" y="12" width="4" height="3"/><rect x="1" y="6" width="3" height="4"/><rect x="12" y="6" width="3" height="4"/><rect x="3" y="3" width="10" height="10"/><rect x="6" y="6" width="4" height="4" fill="#0009"/></svg>';
if(G.phone&&G.phone.add){G.phone.add({k:'vinst',n:'Instellingen',ic:SETIC,c:'#a9dcff',story:1,after:'verhaal',
  render(scr,head){scr.innerHTML=head('Instellingen','De Bezorger')+`<div class="sd-p2-list"><button class="sd-p2-now" data-vi="inst"><small>Spel · beeld · geluid · toetsen</small><b>Alle instellingen</b><p>Navigatiehulp, ondertitels, cutscenes, camera en meer.</p></button>
    <button class="sd-p2-now" data-vi="nav"><small>Navigatiehulp</small><b>${get('nav')?'Aan':'Uit'}</b><p>Tik om ${get('nav')?'uit':'aan'} te zetten.</p></button>
    <button class="sd-p2-now" data-vi="subs"><small>Ondertitels</small><b>${get('subs')?'Aan · '+({s:'klein',m:'normaal',l:'groot',xl:'extra groot'}[get('subGrootte')]||''):'Uit'}</b><p>Tik om ${get('subs')?'uit':'aan'} te zetten.</p></button></div>`},
  click(t,close){const b=t.closest('[data-vi]');if(!b)return false;const a=b.dataset.vi;if(a==='inst'){close();setTimeout(()=>open('inst','spel'),30);return true}if(a==='nav'||a==='subs'){set(a,!get(a));return true}return false},badge:()=>0});
  // de Pixelstad-instellingen (tijd van de dag, weer, huidskleur) horen niet bij het verhaal
  const prev=G.storyApps;G.storyApps=k=>k==='set'?false:(prev?prev(k):true)}
G.verhaalInst={get,set,open:(t)=>open('inst',t),pauze:()=>open('pauze'),close,isOpen:()=>!ov.hidden,on:f=>fns.push(f),DEF};
// meteen toepassen (en nog eens zodra de wereld klaar is: schaduw, effecten en camera hebben de scène nodig)
apply();const wt=setInterval(()=>{if(G.ready){clearInterval(wt);apply()}},300);
})();
