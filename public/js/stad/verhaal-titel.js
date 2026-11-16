// Verhaal "De Bezorger": het titelscherm (G.titel). Komt bij elk bezoek vóór het spel: de stad draait langzaam achter een
// filmische banner, met je voortgang, de hoofdstukken van Seizoen 1 en de knop om te beginnen. Begin vraagt eerst of je echt de
// verhaalmodus wilt spelen (alles wordt opgeslagen); Nee brengt je terug naar het klikspel. Pas daarna start of hervat het verhaal.
(function(){
'use strict';
const G=window.STAD;if(!G)return;
G.titelOpen=true;   // stad-story hervat het verhaal pas als dit scherm weg is
const $=s=>document.querySelector(s),E=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const touch=matchMedia('(pointer:coarse)').matches;
const HFD=[['s1_p','Proloog','Het dossier'],['s1_h1','1',"Zes pizza's"],['s1_h2','2','Driehonderd'],['s1_h3','3','Gymles'],['s1_h4','4','Licht uit'],['s1_h5','5','Rafiqs regels'],
 ['s1_h6','6','Lek'],['s1_h7','7','Incasso'],['s1_h8','8','De hoek'],['s1_h9','9','Mijn buurt'],['s1_h10','10','Groen licht'],['s1_h11','11','Zeventien'],
 ['s1_h12','12','De overkant'],['s1_h13','13','De tas'],['s1_h14','14','Calzone'],['s1_h15','15','De Marijke']];

function css(){if($('#tiCss'))return;const s=document.createElement('style');s.id='tiCss';s.textContent=`
#tiOv{position:fixed;inset:0;z-index:100003;color:#f1efe9;font-family:'Schibsted Grotesk',system-ui,sans-serif;overflow:hidden;opacity:1;transition:opacity 1.1s ease;
 padding:max(16px,env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) max(16px,env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));box-sizing:border-box}
#tiOv.weg{opacity:0;pointer-events:none}
body.ti-open #stadUi,body.ti-open #svDoel,body.ti-open #svSein,body.ti-open .s1-hud2,body.ti-open #toasts{visibility:hidden!important}
#tiOv .ti-laad{font:600 11px 'JetBrains Mono',monospace;letter-spacing:.2em;color:#8a857c;text-transform:uppercase}#tiOv .ti-laad:after{content:'';display:inline-block;width:1.2em;text-align:left;animation:tiPunt 1.2s steps(4) infinite}
@keyframes tiPunt{0%{content:''}25%{content:'.'}50%{content:'..'}75%{content:'...'}}
#tiOv .ti-bg{position:absolute;inset:0;background:#07070a;transition:background 1.6s ease}
#tiOv.live .ti-bg{background:radial-gradient(120% 90% at 70% 40%,transparent 0%,#07070acc 58%,#07070af2 100%),linear-gradient(90deg,#07070af0 0%,#07070ab0 38%,transparent 70%)}
#tiOv .ti-korrel{position:absolute;inset:-50%;opacity:.07;pointer-events:none;background-image:repeating-radial-gradient(circle at 17% 32%,#fff 0 1px,transparent 1px 3px);animation:tiKorrel 1s steps(4) infinite}
@keyframes tiKorrel{0%{transform:translate(0,0)}25%{transform:translate(-3%,2%)}50%{transform:translate(2%,-3%)}75%{transform:translate(-2%,-1%)}}
#tiOv .ti-balk{position:absolute;left:0;right:0;height:7vh;background:#000;z-index:1}#tiOv .ti-balk.t{top:0}#tiOv .ti-balk.b{bottom:0}
#tiOv .ti-in{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;justify-content:center;gap:clamp(12px,2.2vh,22px);max-width:min(1180px,100%);margin:0 auto;padding:7vh 0}
.ti-tag{display:flex;align-items:center;gap:10px;font:600 11px 'JetBrains Mono',monospace;letter-spacing:.28em;text-transform:uppercase;color:#b8b2a6}
.ti-tag i{width:10px;height:10px;border-radius:50%;background:#ff2a1a;box-shadow:0 0 14px #ff2a1a;animation:tiKnip 1.04s steps(2,end) infinite}
@keyframes tiKnip{50%{opacity:.12;box-shadow:none}}
.ti-titel{margin:0;white-space:nowrap;font:900 clamp(44px,14vw,148px)/.82 'Big Shoulders Display',Impact,sans-serif;letter-spacing:.01em;text-transform:uppercase;text-shadow:0 6px 0 #000a}
.ti-titel span{display:block;font-size:.42em;letter-spacing:.18em;color:#ff4a3a;margin-top:.18em}
.ti-banner{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch}
.ti-band{font:800 clamp(13px,1.6vw,16px) 'Big Shoulders Text',sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:9px 16px 8px;background:#c0261e;color:#fff;
 clip-path:polygon(0 0,100% 0,calc(100% - 12px) 50%,100% 100%,0 100%);padding-right:28px}
.ti-band.zw{background:#f1efe9;color:#121014;display:flex;align-items:center;gap:10px}.ti-band.zw i{width:9px;height:9px;border-radius:50%;background:#ff2a1a;animation:tiKnip 1.04s steps(2,end) infinite}
.ti-log{max-width:52ch;margin:0;font:500 clamp(15px,1.7vw,18px)/1.5 'Schibsted Grotesk',sans-serif;color:#d8d2c6}
.ti-knop{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.ti-b{font:800 17px 'Big Shoulders Text',sans-serif;letter-spacing:.14em;text-transform:uppercase;border:0;cursor:pointer;padding:15px 30px 14px;touch-action:manipulation;transition:transform .12s,background .2s,color .2s}
.ti-b:hover{transform:translateY(-2px)}.ti-b:active{transform:translateY(1px)}
.ti-b.p{background:#ff3a2a;color:#fff;box-shadow:0 6px 0 #7a1410,0 0 40px #ff3a2a55}.ti-b.p:hover{background:#ff5240}
.ti-b.g{background:#ffffff14;color:#f1efe9;border:2px solid #ffffff33;padding:13px 22px 12px}.ti-b.g:hover{background:#ffffff26}
.ti-b.l{background:none;color:#a8a296;padding:12px 8px;font-size:14px;text-decoration:underline;text-underline-offset:4px}
.ti-voort{display:flex;flex-direction:column;gap:8px;max-width:560px}
.ti-voort b{font:700 12px 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:#ffcf5a}
.ti-rij{display:flex;gap:4px;flex-wrap:wrap}
.ti-h{position:relative;width:30px;height:38px;display:grid;place-items:center;font:800 13px 'Big Shoulders Text',sans-serif;background:#ffffff10;border:1px solid #ffffff22;color:#8a857c;cursor:default}
.ti-h.ok{background:#c0261e;border-color:#ff5240;color:#fff}.ti-h.nu{background:#f1efe9;color:#121014;border-color:#fff;box-shadow:0 0 0 2px #ff3a2a}
.ti-h span{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#121014;border:1px solid #ffffff33;padding:5px 8px;font:600 12px 'Schibsted Grotesk',sans-serif;color:#f1efe9;opacity:0;pointer-events:none;transition:opacity .15s}
.ti-h:hover span{opacity:1}
.ti-voet{position:absolute;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(7vh + 12px);z-index:3;font:600 11px 'JetBrains Mono',monospace;letter-spacing:.18em;color:#8a857c;text-transform:uppercase;text-align:right}
/* bevestigen */
#tiVraag{position:fixed;inset:0;z-index:100004;display:grid;place-items:center;background:#000a;backdrop-filter:blur(3px);opacity:0;transition:opacity .25s;padding:16px}
#tiVraag.in{opacity:1}
.ti-kaart{position:relative;width:min(520px,100%);max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;background:#f1ece0;color:#17151a;padding:26px 24px 22px;box-shadow:0 30px 80px #000c;transform:rotate(-.6deg);font-family:'Schibsted Grotesk',sans-serif}
.ti-kaart:before{content:'';position:absolute;inset:8px;border:1px solid #17151a33;pointer-events:none}
.ti-stempel{position:absolute;right:18px;top:16px;transform:rotate(8deg);border:3px solid #c0261e;color:#c0261e;font:900 15px 'Big Shoulders Display',sans-serif;letter-spacing:.14em;padding:4px 10px;opacity:.85}
.ti-kaart small{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.2em;color:#7a2a20;text-transform:uppercase}
.ti-kaart h3{margin:6px 0 10px;font:900 clamp(26px,5vw,36px)/.95 'Big Shoulders Display',sans-serif;text-transform:uppercase}
.ti-kaart ul{margin:0 0 16px;padding:0;list-style:none;display:grid;gap:8px}
.ti-kaart li{display:grid;grid-template-columns:22px 1fr;gap:8px;font-size:15px;line-height:1.4}.ti-kaart li i{font-style:normal;color:#c0261e;font-weight:800}
.ti-kaart .ti-knop .ti-b.p{box-shadow:0 5px 0 #7a1410}.ti-kaart .ti-b.g{color:#17151a;border-color:#17151a44;background:transparent}.ti-kaart .ti-b.g:hover{background:#17151a12}
@media (max-width:640px){#tiOv .ti-in{padding:9vh 0 10vh;justify-content:flex-end}.ti-h{width:24px;height:32px;font-size:11px}.ti-b.p{flex:1 1 100%}.ti-voet{display:none}}
@media (prefers-reduced-motion:reduce){#tiOv .ti-korrel,.ti-tag i,.ti-band.zw i{animation:none}}`;document.head.appendChild(s)}

/* ---------- voortgang ---------- */
function voortgang(){let st=null;try{st=G.story&&G.story.st&&G.story.st()}catch(e){}const f=(st&&st.flags)||{};
  const hfd=String(f.s1_hfd||'');const klaar=!!f.s1_klaar;const id=hfd.replace(/^tussen:/,'');
  let nu=-1;HFD.forEach((h,i)=>{if(h[0]===id||(h[0]==='s1_h15'&&/^s1_(h15|epi)/.test(id)))nu=i});
  const gedaan=HFD.map(h=>!!f['s1_klaar_'+h[0]]||(h[0]==='s1_h15'&&(klaar||!!f.s1_klaar_s1_h15a||!!f.s1_klaar_s1_h15b)));
  const begonnen=!!(st&&(st.welkom||hfd||st.step&&st.step!=='start'))&&(nu>=0||klaar||gedaan.some(Boolean));
  return {st,f,nu,gedaan,klaar,begonnen,tussen:hfd.startsWith('tussen:'),geld:st&&st.geld}}

/* ---------- de camera draait langzaam over de stad ---------- */
let rig0=null,camT0=0;
function camAan(){if(rig0||!G.camRig)return;rig0=G.camRig;camT0=performance.now();
  G.camRig=function(dt,cam){if(!G.titelOpen)return rig0(dt,cam);const t=(performance.now()-camT0)/1000,M=window.STAD_MAP;
    // langzaam over de Boulevard, op lantaarnhoogte, met Lounge Sahara rechts vooruit (heen en weer, nooit door een gevel)
    const c=(M&&M.A&&M.A.sahara)||{x:700,z:906},bz=(M&&M.HR&&(M.HR.find(h=>h.n==='Boulevard')||{}).z)||920;
    const x=c.x-34+Math.sin(t*.022-1.2)*46,z=bz+2.6,y=5.2+Math.sin(t*.05)*.5;
    cam.position.set(x,y,z);cam.lookAt(x+30,4.2,bz-9);
    const f=innerWidth<innerHeight?66:50;if(cam.fov!==f){cam.fov=f;cam.updateProjectionMatrix()}
    try{const sk=G.scene().children.find(o=>o.renderOrder===-10&&o.geometry&&o.geometry.parameters&&o.geometry.parameters.radius===400);if(sk)sk.position.copy(cam.position)}catch(e){}
    return true}}
// de hook blijft staan (anderen kunnen er inmiddels omheen zitten) en geeft na het titelscherm alles door
function camUit(){try{const c=G.camera&&G.camera();if(c&&G.fov0){c.fov=G.fov0;c.updateProjectionMatrix()}}catch(e){}if(G.camC)G.camC.init=false}

/* ---------- toetsen niet doorlaten naar het spel zolang het scherm er is ---------- */
const blok=e=>{if(!G.titelOpen)return;if(e.key==='Enter'&&!$('#tiVraag')){const p=$('#tiOv [data-start]');if(p){e.preventDefault();p.click()}}
  if(e.key==='Escape'&&$('#tiVraag')){e.preventDefault();sluitVraag()}e.stopImmediatePropagation()};
addEventListener('keydown',blok,true);addEventListener('keyup',e=>{if(G.titelOpen)e.stopImmediatePropagation()},true);

/* ---------- het scherm ---------- */
let res=null;
function bouw(){css();let ov=$('#tiOv');if(ov)return ov;ov=document.createElement('div');ov.id='tiOv';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','De Bezorger · Seizoen 1');
  ov.innerHTML=`<div class="ti-bg"></div><div class="ti-korrel"></div><i class="ti-balk t"></i><i class="ti-balk b"></i><div class="ti-in"><div class="ti-tag"><i></i>Verhaalmodus · Noordhaven</div><h1 class="ti-titel">Onderwereld<span>De Bezorger</span></h1><div class="ti-laad">De stad wordt gebouwd</div></div>`;
  document.body.appendChild(ov);document.body.classList.add('ti-open');return ov}
bouw();   // meteen een donker scherm, zodat je de stad niet ziet opbouwen
function vul(){const ov=bouw(),v=voortgang();const nuH=v.nu>=0?HFD[v.nu]:null;
  const label=v.klaar?'Vrij rondrijden':v.begonnen?'Verder spelen':'Begin';
  const sub=v.klaar?'Seizoen 1 uitgespeeld. De stad blijft open.':nuH?(v.tussen?'Volgende: ':'Je bent bij: ')+(nuH[1]==='Proloog'?'Proloog':'Hoofdstuk '+nuH[1])+' · '+nuH[2]:'15 hoofdstukken · ±2 à 3 uur';
  const rij=HFD.map((h,i)=>{const ok=v.gedaan[i],nu=i===v.nu&&!v.klaar,zien=ok||nu;return `<div class="ti-h${ok?' ok':''}${nu?' nu':''}" tabindex="0">${h[1]==='Proloog'?'P':h[1]}<span>${E(zien?(h[1]==='Proloog'?'Proloog':'H'+h[1])+' · '+h[2]:'Nog niet gespeeld')}</span></div>`}).join('');
  ov.querySelector('.ti-in').innerHTML=`<div class="ti-tag"><i></i>Verhaalmodus · Noordhaven</div>
   <h1 class="ti-titel">Onderwereld<span>De Bezorger</span></h1>
   <div class="ti-banner"><div class="ti-band">Seizoen 1 · nu te spelen</div><div class="ti-band zw"><i></i>Seizoen 2 komt 24 november</div></div>
   <p class="ti-log">Luca is zestien en bezorgt pizza's op een rode fiets. Op een maandagavond geeft Rafiq van Lounge Sahara hem driehonderd euro fooi. En een vraag.</p>
   <div class="ti-voort"><b>${E(sub)}</b><div class="ti-rij">${rij}</div></div>
   <div class="ti-knop"><button class="ti-b p" data-start>${E(label)}</button>${v.begonnen?'<button class="ti-b g" data-opnieuw>Opnieuw beginnen</button>':''}<button class="ti-b l" data-klik>Terug naar het klikspel</button></div>`;
  if(!ov.querySelector('.ti-voet')){const f=document.createElement('div');f.className='ti-voet';f.innerHTML=touch?'':'Enter = '+E(label);ov.appendChild(f)}
  // de titel past altijd op één regel (ook als het lettertype nog laadt of ontbreekt)
  const fit=()=>{const t=ov.querySelector('.ti-titel');if(!t)return;t.style.fontSize='';const w=t.parentNode.clientWidth;let n=0;while(t.scrollWidth>w+2&&n<12){const fs=parseFloat(getComputedStyle(t).fontSize);t.style.fontSize=(fs*.92)+'px';n++}};
  fit();try{document.fonts&&document.fonts.ready.then(fit)}catch(e){}if(!ov.__fit){ov.__fit=1;addEventListener('resize',fit)}
  ov.querySelector('[data-start]').onclick=()=>vraag(v);
  const op=ov.querySelector('[data-opnieuw]');if(op)op.onclick=()=>vraag(v,true);
  ov.querySelector('[data-klik]').onclick=()=>{location.href='/game'}}

/* ---------- bevestigen: weet je het zeker? ---------- */
function sluitVraag(){const q=$('#tiVraag');if(!q)return;q.classList.remove('in');setTimeout(()=>q.remove(),250)}
function vraag(v,opnieuw){sluitVraag();const q=document.createElement('div');q.id='tiVraag';
  const punten=opnieuw?[['!','Je hele verhaal begint opnieuw: hoofdstukken, keuzes, Luca\'s geld en spullen.'],['✓','Je klikspel (geld, rang, spullen) blijft precies zoals het is.'],['✓','Daarna wordt alles weer automatisch opgeslagen.']]
   :[['✓','Je speelt Luca De Santis, los van je klikspel-karakter.'],['✓','Alles wordt automatisch opgeslagen: je hoofdstuk, je keuzes, Luca\'s geld en spullen.'],
     ['✓','Je klikspel (geld, rang, spullen) blijft precies zoals het is.'],['✓','Stoppen kan altijd. Je gaat later verder waar je was.'],['♪','Zet je geluid aan: de verslaggever vertelt het verhaal.']];
  q.innerHTML=`<div class="ti-kaart" role="alertdialog" aria-labelledby="tiVT"><div class="ti-stempel">${opnieuw?'OPNIEUW':'VERHAAL'}</div><small>Dossier · De Bezorger</small>
   <h3 id="tiVT">${opnieuw?'Opnieuw beginnen?':'Verhaalmodus spelen?'}</h3><ul>${punten.map(p=>`<li><i>${p[0]}</i><span>${E(p[1])}</span></li>`).join('')}</ul>
   <div class="ti-knop"><button class="ti-b p" data-ja>${opnieuw?'Ja, opnieuw':'Ja, speel'}</button><button class="ti-b g" data-nee>${opnieuw?'Nee':'Nee, naar het klikspel'}</button></div></div>`;
  document.body.appendChild(q);void q.offsetWidth;q.classList.add('in');
  q.querySelector('[data-ja]').onclick=()=>{sluitVraag();if(opnieuw)wis();klaar()};
  q.querySelector('[data-nee]').onclick=()=>{if(opnieuw)sluitVraag();else location.href='/game'};
  q.addEventListener('click',e=>{if(e.target===q)sluitVraag()});setTimeout(()=>{try{q.querySelector('[data-ja]').focus()}catch(e){}},60)}
function wis(){try{const st=G.story.st(),inst=st.inst;Object.keys(st).forEach(k=>delete st[k]);st.v=3;st.inst=inst||{};st.step='start';st.reset=Date.now();if(G.s1&&G.s1.RESET_V)st.s1reset=G.s1.RESET_V;window.save&&window.save()}catch(e){console.error(e)}}

/* ---------- klaar: het scherm vervaagt, het verhaal begint of gaat verder ---------- */
function klaar(){const ov=$('#tiOv');try{G.s1&&G.s1.doekVast&&G.s1.doekVast(2600)}catch(e){}   // van het titelscherm via zwart naar de eerste scène
  try{const st=G.story&&G.story.st();if(st&&!st.welkom){st.welkom=Date.now();window.save&&window.save()}}catch(e){}
  try{G.snd&&G.snd.fx&&G.snd.fx('click')}catch(e){}
  if(ov){ov.classList.add('weg');setTimeout(()=>ov.remove(),1200)}
  setTimeout(()=>{G.titelOpen=false;document.body.classList.remove('ti-open');camUit();try{G.applyLight&&G.applyLight()}catch(e){}if(res){const r=res;res=null;r(true)}},450)}

// stad-story vraagt dit aan als de wereld klaar is
G.titel={toon(){return new Promise(r=>{res=r;const ov=bouw();vul();camAan();requestAnimationFrame(()=>ov.classList.add('live'));setTimeout(()=>{try{ov.querySelector('[data-start]').focus()}catch(e){}},300)})},
  open:()=>!!G.titelOpen};
})();
