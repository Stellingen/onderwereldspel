// Casino: Visdief — 5 rollen, 3 rijen, 10 lijnen. Engine: js/vis.js (VISD).
// Bonus: in de free spins pakt de Visdief het geld van alle vissen. Elke 4 Visdieven: +10 spins en een hogere multiplier.
// Uitkomst ligt vast bij het draaien en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
window.vd=window.vd||{bi:4,busy:false,turbo:false,grid:null,msg:'Kies je inzet en draai',fs:null,lastWin:0,stepWin:0,pick:false,confirm:false,shown:0,bet:0};
const vdBet=()=>{const B=kkBets();if(vd.bi>=B.length)vd.bi=B.length-1;return B[vd.bi]};
const vdEl=id=>document.getElementById(id);
const vdOn=()=>page==='casino'&&casinoTab==='vis'&&!!vdEl('vdBoard')&&!document.hidden;
const vdFast=()=>vd.turbo||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const vdT=()=>vdFast()?{spin:380,stag:90,tease:520,land:120,hold:520,collect:380}:{spin:720,stag:170,tease:1000,land:220,hold:1000,collect:760};
const vdWait=ms=>new Promise(r=>setTimeout(r,vdOn()?ms:0));
const vdShort=n=>n>=1e6?'€'+(Math.round(n/1e5)/10).toLocaleString('nl-NL')+'M':n>=1e4?'€'+Math.round(n/1e3).toLocaleString('nl-NL')+'K':fmt(n);
const VD_IC={
 dobber:'<path d="M32 3v11" stroke="#d6dbe2" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="34" r="19" fill="#f4f1ea"/><path d="M13 34a19 19 0 0 1 38 0z" fill="#ff3d52"/><rect x="12" y="32" width="40" height="4.5" rx="2" fill="#16181d" opacity=".35"/><path d="M32 53v8" stroke="#a9b0ba" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4.5" fill="#fff" opacity=".5"/>',
 haak:'<circle cx="34" cy="9" r="4.5" fill="none" stroke="#d6dbe2" stroke-width="3.5"/><path d="M34 14v27a11 11 0 0 1-22 0v-6" fill="none" stroke="#d6dbe2" stroke-width="5.5" stroke-linecap="round"/><path d="M12 30l-5 9 10-3z" fill="#d6dbe2"/><path d="M38 20v18" stroke="#fff" stroke-width="1.6" opacity=".5"/>',
 blik:'<rect x="13" y="24" width="38" height="33" rx="5" fill="#8a6a3a"/><ellipse cx="32" cy="24" rx="19" ry="5.5" fill="#b08a50"/><ellipse cx="32" cy="24" rx="15" ry="3.6" fill="#3b2a14"/><path d="M25 24c-3-9 9-13 11-6s9 1 7-7" fill="none" stroke="#ff8fb1" stroke-width="5" stroke-linecap="round"/><rect x="17" y="35" width="30" height="11" rx="2" fill="#f2c230"/><path d="M22 40.5h20" stroke="#8a6a3a" stroke-width="2.4"/>',
 molen:'<rect x="19" y="53" width="22" height="6" rx="2" fill="#2b3038"/><path d="M30 46v8" stroke="#2b3038" stroke-width="5"/><circle cx="30" cy="31" r="18" fill="#4d9dff"/><circle cx="30" cy="31" r="12" fill="#1d3f74"/><circle cx="30" cy="31" r="4.5" fill="#d6dbe2"/><path d="M30 31L48 15" stroke="#d6dbe2" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="13" r="5.5" fill="#f2c230"/>',
 net:'<defs><clipPath id="vdNetC"><circle cx="27" cy="26" r="17"/></clipPath></defs><g clip-path="url(#vdNetC)" stroke="#3fe395" stroke-width="1.7" opacity=".75"><path d="M0 12l60 30M0 26l60 30M0 40l60 30M0 -2l60 30M8 0L-10 60M22 0L4 60M36 0L18 60M50 0L32 60"/></g><circle cx="27" cy="26" r="18" fill="none" stroke="#3fe395" stroke-width="4.5"/><path d="M40 39l16 18" stroke="#c9a227" stroke-width="6.5" stroke-linecap="round"/>',
 koffer:'<rect x="15" y="10" width="20" height="9" fill="#3fe395" transform="rotate(-10 25 15)"/><rect x="27" y="9" width="20" height="9" fill="#2bb877" transform="rotate(8 37 13)"/><path d="M24 21v-6h16v6" fill="none" stroke="#5a3418" stroke-width="4"/><rect x="7" y="20" width="50" height="35" rx="5" fill="#7a4a24"/><rect x="7" y="33" width="50" height="5" fill="#5a3418"/><rect x="28" y="30" width="8" height="10" rx="1.5" fill="#f2c230"/>',
 boot:'<path d="M3 55c6-4 10 4 16 0s10 4 16 0 10 4 16 0 8 4 12 0" stroke="#38bdf8" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M3 37h56l-9 13H14z" fill="#ff7a1a"/><path d="M3 37h56l-2 3H5z" fill="#ffad6b"/><path d="M19 37l9-13h15l7 13z" fill="#e9e4d8"/><path d="M30 26h11l5 9H25z" fill="#4d9dff"/><path d="M47 30l8-12" stroke="#d6dbe2" stroke-width="2.5"/>',
 hengel:'<path d="M9 57L53 8" stroke="#c9a227" stroke-width="5.5" stroke-linecap="round"/><path d="M53 8c5 15 2 30-5 41" stroke="#e6e1d6" stroke-width="1.6" fill="none"/><circle cx="19" cy="46" r="7.5" fill="#2b3038" stroke="#d6dbe2" stroke-width="2.2"/><path d="M19 46l6-5" stroke="#d6dbe2" stroke-width="2"/><path d="M45 49q1 7 6 5" stroke="#d6dbe2" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 52l-4 4" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/>',
 vis:'<path d="M47 32l13-11v22z" fill="#1f8fc7"/><path d="M5 32c10-15 31-17 44 0-13 17-34 15-44 0z" fill="#38bdf8"/><path d="M5 32c10 9 25 11 37 6" fill="#7fd6ff" opacity=".55"/><path d="M26 16c6-4 12-3 15 2" fill="#1f8fc7"/><circle cx="16" cy="29" r="3.4" fill="#0b1a12"/><circle cx="15" cy="28" r="1.1" fill="#fff"/><path d="M24 23c4 6 4 13 0 19" stroke="#1f8fc7" stroke-width="2.2" fill="none"/>',
 visdief:'<path d="M14 64c0-10 8-15 18-15s18 5 18 15z" fill="#2b3038"/><path d="M26 49l6 8 6-8" fill="#e6e1d6"/><circle cx="32" cy="34" r="15" fill="#e8b48a"/><ellipse cx="32" cy="20" rx="21" ry="4.5" fill="#16181d"/><path d="M21 20c0-12 22-12 22 0z" fill="#16181d"/><rect x="21" y="14" width="22" height="4" fill="#ff3d52"/><rect x="19.5" y="29" width="11" height="7" rx="2.2" fill="#0b0c0e"/><rect x="33.5" y="29" width="11" height="7" rx="2.2" fill="#0b0c0e"/><path d="M30 31.5h4" stroke="#0b0c0e" stroke-width="2"/><path d="M26 42c4 3 9 2.5 12-1" stroke="#7a3b22" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M38 41.5l9 2" stroke="#c9a227" stroke-width="2" stroke-linecap="round"/>',
 boei:'<circle cx="32" cy="32" r="25" fill="#ff3d52"/><g fill="#f4f1ea"><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(90 32 32)"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(180 32 32)"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(270 32 32)"/></g><circle cx="32" cy="32" r="12" fill="#0a1a26"/><circle cx="32" cy="32" r="18.5" fill="none" stroke="#f2c230" stroke-width="1.6" stroke-dasharray="4 3"/>'};
const vdSvg=id=>`<svg viewBox="0 0 64 64" aria-hidden="true">${VD_IC[id]||''}</svg>`;
function vdCellHtml(x,fs,bet){const fish=x.s===VISD.VIS;
 const cls='vd-cell'+(x.sc?' sc':'')+(x.w?' wild':'')+(fish?' fish':'')+(fish&&fs&&x.v>=50?' rich':'');
 const icon=x.sc?vdSvg('boei'):x.w?vdSvg('visdief'):vdSvg(VISD.SYMS[x.s].id);
 return `<div class="${cls}">${icon}${x.w?'<span class="vd-lb">Visdief</span>':x.sc?'<span class="vd-lb sc">Bonus</span>':''}${fs&&fish&&x.v?`<b class="vd-val">${vdShort(x.v*(bet||vd.bet||vdBet()))}</b>`:''}</div>`}
function vdDemo(){const ids=[[0,5,8],[1,6,3],[8,7,2],[4,0,5],[2,8,1]];return ids.map(col=>col.map(s=>({s,v:s===VISD.VIS?10:0})))}
function vdRand(fs){const x=VISD.fill(Math.random,!!fs,false,0)[0][0];return x.sc?{s:0}:x}
function vdReelsHtml(g,fs){return g.map((col,c)=>`<div class="vd-reel" data-c="${c}"><div class="vd-strip" style="--n:3">${col.map(x=>vdCellHtml(x,fs)).join('')}</div></div>`).join('')}
const vdCellEl=(c,r)=>{const re=document.querySelectorAll('#vdReels .vd-reel')[c];return re?re.querySelectorAll('.vd-cell')[r]:null};

function vdInfo(){const fs=vd.fs,pend=window.slotPending||0;
 return `<div class="kk-bal"><span class="label">Saldo</span><b id="vdBal">${fmt(S.cash-pend+(vd.shown||0))}</b></div>
  <div class="kk-stat"><span class="label">Deze spin</span><b id="vdStep" class="acc">${fmt(vd.stepWin)}</b></div>
  <div class="kk-stat"><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="vdLast" class="grn">${fmt(fs?fs.total:vd.lastWin)}</b></div>
  ${fs?`<div class="kk-stat fsb"><span class="label">Free spins</span><b id="vdMsg">${fs.at} / ${fs.of}</b></div>`:`<div class="kk-stat"><span class="label">Status</span><b id="vdMsg" class="sm">${vd.msg}</b></div>`}`}
function vdFsBar(){const f=vd.fs;if(!f)return '';const lvl=f.lvl,inLvl=lvl>=VISD.MULTS.length-1?VISD.PER_LEVEL:f.caught-lvl*VISD.PER_LEVEL;
 return `<div class="vd-fs"><div class="vd-fs-c"><span class="label">Visdieven</span><div class="vd-pips">${Array.from({length:VISD.PER_LEVEL},(_,i)=>`<i class="${i<inLvl?'on':''}">${vdSvg('visdief')}</i>`).join('')}</div><small>${f.caught} gevangen · elke ${VISD.PER_LEVEL}: +${VISD.RETRIG} spins</small></div>
  <div class="vd-mults">${VISD.MULTS.map((m,i)=>`<b class="${i===lvl?'on':i<lvl?'done':''}">×${m}</b>`).join('')}</div></div>`}
function vdSubHtml(){return vd.fs?`<span class="vip">Bonus</span><span class="kk-subtxt"> De Visdief pakt alle vissen</span>`
 :`${isVip()?'<span class="vip gold">VIP</span>':''}<span class="kk-subtxt">${isVip()?' bonus ±1 op 130 · meer Visdieven · RTP ±97%':' bonus ±1 op 145 · RTP ±92%'} · 10 lijnen · max ${VISD.MAX_WIN.toLocaleString('nl-NL')}×</span>`}
function vdControls(){const b=vdBet();return `<div class="kk-betbox"><span class="label">Inzet</span>
   <div class="kk-bet"><button onclick="vdStepBet(-1)" ${vd.busy?'disabled':''} aria-label="Lagere inzet">−</button><button class="kk-betv" onclick="vd.pick=!vd.pick;vd.confirm=false;vdRefresh()" ${vd.busy?'disabled':''} aria-label="Inzet kiezen">${fmt(b)}</button><button onclick="vdStepBet(1)" ${vd.busy?'disabled':''} aria-label="Hogere inzet">+</button></div></div>
   <button class="btn kk-go" onclick="act.vdSpin(false)" ${vd.busy||inJail()?'disabled':''}>${vd.busy?'Bezig…':'Draaien'}<small>spatie</small></button>
   <div class="kk-small"><button class="btn ghost sm vd-turbo ${vd.turbo?'on':''}" onclick="vdTurbo()" aria-pressed="${vd.turbo}">${vd.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="btn ghost sm" onclick="vd.confirm=true;vd.pick=false;vdRefresh()" ${vd.busy||inJail()?'disabled':''}>Bonus kopen</button></div>`}
function vdPickHtml(){return `<div class="kk-pick"><div class="kk-pick-h"><b>Kies je inzet${isHighRoller()?' <i class="vipt" style="margin-left:6px">HIGH ROLLER</i>':''}</b><button class="btn ghost sm" onclick="vd.pick=false;vdRefresh()">Sluiten</button></div>
  <div class="kk-pick-g">${kkBets().map((v,i)=>`<button class="${i===vd.bi?'on':''} ${S.cash<v?'no':''}" onclick="vdSetBet(${i})">${fmt(v)}</button>`).join('')}</div>
  <div class="kk-pick-q"><button class="btn ghost sm" onclick="vdSetBet(0)">Min · ${fmt(kkBets()[0])}</button><button class="btn sm" onclick="vdSetBet(kkBets().length-1)">Max · ${fmt(kkBets()[kkBets().length-1])}</button></div></div>`}
function vdConfirm(){const b=vdBet(),buy=b*VISD.BUY_COST;return `<div class="kk-confirm"><div><b>Bonus kopen voor ${fmt(buy)}?</b>
  <span>Dat is ${VISD.BUY_COST}× je inzet van ${fmt(b)}. Je krijgt direct ${VISD.FS_BY_SC[3]} free spins. Gemiddeld levert hij iets minder op dan hij kost (±95%); de meeste bonussen zijn klein, heel soms pak je de ×10.</span></div>
  <div class="flex"><button class="btn sm" onclick="act.vdSpin(true)" ${S.cash<buy?'disabled':''}>${S.cash<buy?'Te weinig geld':'Kopen'}</button><button class="btn ghost sm" onclick="vd.confirm=false;vdRefresh()">Annuleren</button></div></div>`}
function vdSeed(){if(!S.vdSeed||!S.vdSeed.s)S.vdSeed=kkNewSd(S.vdSeed&&S.vdSeed.prev);return S.vdSeed}
function vdSeedHtml(){const sd=vdSeed(),p=sd.prev;
 return `<div class="kk-seed"><div class="kk-seed-i"><span class="label">Seed</span><b>${kkSeedId(sd)}</b></div>
  <div class="kk-seed-i"><span class="label">Op deze seed</span><b>${sd.spins} spin${sd.spins===1?'':'s'} · ${sd.bon} bonus${sd.bon===1?'':'sen'}</b></div>
  ${p?`<div class="kk-seed-i prev"><span class="label">Vorige seed</span><b>${p.id} · ${p.spins} spins · ${p.bon} bonus${p.bon===1?'':'sen'}</b></div>`:''}
  <button class="btn ghost sm" onclick="act.vdNewSeed()" ${vd.busy?'disabled':''}>Nieuwe seed</button></div>`}
function vdPayTab(){const b=vdBet(),k=VISD.PAYK/10;
 const rows=VISD.SYMS.slice().reverse().map(s=>`<div class="vd-pt"><span>${vdSvg(s.id)}</span><div>${[2,1,0].map(i=>`<p><i>${i+3}×</i>${fmt(s.pay[i]*k*b)}</p>`).join('')}</div></div>`).join('');
 const fish=VISD.FISH.map(([v])=>`<i>${vdShort(v*b)}</i>`).join('');
 return `<div class="kk-pay-h"><div class="label">Uitbetaling per lijn bij ${fmt(b)} inzet · 3, 4 of 5 dezelfde van links naar rechts, 10 lijnen</div></div>
  <div class="vd-ptab">${rows}</div>
  <div class="label" style="margin-top:14px">Waarde van een vis in de bonus</div><div class="vd-fishv">${fish}</div>`}
function visView(){const g=vd.grid||vdDemo(),fs=vd.fs;
 return `<div class="kk kk3 vd ${fs?'is-fs':''}">
 <div class="kk-stage" id="vdStage">
  <div class="kk-head"><div class="kk-title">Vis<span>dief</span></div>
   <div class="kk-sub"><span id="vdSub">${vdSubHtml()}</span><button class="kk-snd" onclick="SFX.toggle();this.textContent=SFX.on?'🔊':'🔇'" aria-label="Geluid aan of uit">${SFX.on?'🔊':'🔇'}</button></div></div>
  <div id="vdFs">${vdFsBar()}</div>
  <div class="vd-board" id="vdBoard"><div class="vd-reels" id="vdReels">${vdReelsHtml(g,!!fs)}</div><svg class="vd-lines" id="vdLines" viewBox="0 0 500 300" preserveAspectRatio="none"></svg><div class="vd-fx" id="vdFx"></div><div id="vdBanner"></div></div>
  <div class="kk-bar"><div class="kk-hud" id="vdInfo">${vdInfo()}</div><div class="kk-ctl" id="vdCtl">${vdControls()}</div></div>
  <div id="vdPickBox">${vd.pick&&!vd.busy?vdPickHtml():''}</div>
  <div id="vdConfirmBox">${vd.confirm&&!vd.busy?vdConfirm():''}</div>
  <div id="vdSeedBox">${vdSeedHtml()}</div>
 </div>
 <section class="card kk-pay"><div id="vdPayTab">${vdPayTab()}</div>
  <div class="kk-rules">
   <div><span>${vdSvg('boei')}</span><p><b>3 boeien</b> = ${VISD.FS_BY_SC[3]} free spins, <b>4</b> = ${VISD.FS_BY_SC[4]}, <b>5</b> = ${VISD.FS_BY_SC[5]}. Hoe meer boeien, hoe langer de bonus en hoe meer kans op de max win.</p></div>
   <div><span>${vdSvg('vis')}</span><p><b>Vissen</b> hebben in de bonus een geldwaarde. Ze leveren alleen op als er een Visdief op het scherm staat.</p></div>
   <div><span>${vdSvg('visdief')}</span><p><b>Visdief</b> (alleen in de bonus) vervangt elk symbool en pakt het geld van alle vissen. Twee Visdieven pakken alles twee keer. Elke ${VISD.PER_LEVEL} Visdieven: +${VISD.RETRIG} spins en de multiplier gaat naar ×2, ×3 en ×10.</p></div>
   <div><span class="kk-mini key">␣</span><p><b>Spatiebalk</b> = draaien. Max win ${VISD.MAX_WIN.toLocaleString('nl-NL')}× je inzet: daarvoor moet je de ×10 halen én grote vissen vangen.${isVip()?' Als <b>VIP</b> kom je vaker in de bonus en valt de Visdief er iets vaker.':''}</p></div>
  </div></section></div>`}
function vdRefresh(){const root=document.querySelector('.vd');if(!root)return;root.classList.toggle('is-fs',!!vd.fs);
 const set=(id,h)=>{const e=vdEl(id);if(e)e.innerHTML=h};
 set('vdSub',vdSubHtml());set('vdInfo',vdInfo());set('vdCtl',vdControls());set('vdFs',vdFsBar());
 set('vdPickBox',vd.pick&&!vd.busy?vdPickHtml():'');set('vdConfirmBox',vd.confirm&&!vd.busy?vdConfirm():'');set('vdSeedBox',vdSeedHtml());set('vdPayTab',vdPayTab())}
function vdStepBet(d){if(vd.busy)return;vd.bi=Math.max(0,Math.min(kkBets().length-1,vd.bi+d));vd.confirm=false;SFX.chip();vdRefresh()}
function vdSetBet(i){if(vd.busy)return;vd.bi=Math.max(0,Math.min(kkBets().length-1,i));vd.pick=false;vd.confirm=false;SFX.chip();vdRefresh()}
function vdTurbo(){vd.turbo=!vd.turbo;SFX.click();document.querySelectorAll('.vd-turbo').forEach(b=>{b.textContent=vd.turbo?'Snel: aan':'Snel: uit';b.classList.toggle('on',vd.turbo);b.setAttribute('aria-pressed',vd.turbo)})}
function vdText(id,v){const e=vdEl(id);if(e)e.textContent=v}
function vdCount(id,from,to,ms){const el=vdEl(id);if(!el||!vdOn()){if(el)el.textContent=fmt(to);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const st=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(st);else res()};requestAnimationFrame(st)})}
function vdBanner(big,small,ms,cls){const el=vdEl('vdBanner');if(el)el.innerHTML=`<div class="kk-banner ${cls||''}"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return vdWait(ms||1400).then(()=>{const e=vdEl('vdBanner');if(e)e.innerHTML=''})}
function vdShowBal(add){vd.shown=(vd.shown||0)+add;vdText('vdBal',fmt(S.cash-(window.slotPending||0)+vd.shown))}
// Rollen draaien: elke rol stopt iets later; liggen er al 2 boeien, dan draaien de volgende rollen langer (spanning)
async function vdSpinReels(g,fs){const reels=document.querySelectorAll('#vdReels .vd-reel');const T=vdT();
 if(!reels.length||!vdOn()){vd.grid=g;return}
 const cur=vd.grid||vdDemo();let sc=0,delay=0,maxT=0,heard=0;
 reels.forEach((el,c)=>{const tease=!fs&&sc>=2;if(tease)delay+=T.tease;const F=7+c*2+(tease?7:0),n=F+6,strip=el.querySelector('.vd-strip');
  const filler=Array.from({length:F},()=>vdRand(fs));
  strip.style.transition='none';strip.style.setProperty('--n',n);strip.innerHTML=[...g[c],...filler,...cur[c]].map(x=>vdCellHtml(x,fs)).join('');
  strip.style.transform=`translateY(${-(F+3)/n*100}%)`;el.classList.toggle('tease',tease);el.classList.add('spin');
  const dur=T.spin+c*T.stag+delay;maxT=Math.max(maxT,dur);void strip.offsetHeight;
  strip.style.transition=`transform ${dur}ms cubic-bezier(.3,.05,.25,1.06)`;strip.style.transform='translateY(0)';
  const scHere=g[c].filter(x=>x.sc).length;
  setTimeout(()=>{el.classList.remove('spin','tease');SFX.tick();if(scHere){SFX.scatter(heard);heard+=scHere;el.classList.add('scland')}if(tease)SFX.tease&&SFX.tease(sc,.4)},dur);
  sc+=scHere});
 await vdWait(maxT+80);
 reels.forEach((el,c)=>{const strip=el.querySelector('.vd-strip');strip.style.transition='none';strip.style.transform='none';strip.style.setProperty('--n',3);strip.innerHTML=g[c].map(x=>vdCellHtml(x,fs)).join('');el.classList.remove('scland')});
 vd.grid=g}
const VD_LC=['#f2c230','#3fe395','#4d9dff','#ff7a1a','#ff7fb3','#b8a1ff','#a9dcff','#ffad6b','#38bdf8','#e6e1d6'];
async function vdShowWins(wins,mult,bet,stepFrom){if(!wins.length)return 0;const T=vdT();const svg=vdEl('vdLines');
 const hit=new Set();wins.forEach(w=>w.cells.forEach(([c,r])=>hit.add(c*3+r)));
 for(let c=0;c<5;c++)for(let r=0;r<3;r++){const e=vdCellEl(c,r);if(e)e.classList.add(hit.has(c*3+r)?'win':'dim')}
 if(svg)svg.innerHTML=wins.map(w=>`<polyline points="${VISD.LINES[w.line].map((r,c)=>(c*100+50)+','+(r*100+50)).join(' ')}" stroke="${VD_LC[w.line]}" />`).join('');
 const add=wins.reduce((a,w)=>a+w.pay,0)*mult*bet;SFX.win(Math.min(6,wins.length+1));
 vdCount('vdStep',stepFrom,stepFrom+add,T.hold*.7);vdShowBal(add);
 await vdWait(T.hold);
 if(svg)svg.innerHTML='';document.querySelectorAll('#vdReels .vd-cell').forEach(e=>e.classList.remove('win','dim'));return add}
// De Visdief pakt alle vissen: geldbedragen vliegen naar hem toe
async function vdCollect(s,bet,stepFrom){const board=vdEl('vdBoard');if(!s.wilds||!s.fish.length)return 0;const T=vdT();
 const wild=[];s.grid.forEach((col,c)=>col.forEach((x,r)=>{if(x.w)wild.push([c,r])}));
 const add=s.collect*bet;if(!board||!vdOn())return add;
 const br=board.getBoundingClientRect(),fx=vdEl('vdFx');const ctr=(c,r)=>{const e=vdCellEl(c,r);if(!e)return [0,0];const q=e.getBoundingClientRect();return [q.left-br.left+q.width/2,q.top-br.top+q.height/2]};
 wild.forEach(([c,r])=>vdCellEl(c,r)?.classList.add('collect'));s.fish.forEach(([c,r])=>vdCellEl(c,r)?.classList.add('caught'));
 SFX.bonus();await vdWait(T.collect*.5);let got=0;
 for(const [wc,wr] of wild){const [tx,ty]=ctr(wc,wr);
  s.fish.forEach(([c,r,v],i)=>{const [x,y]=ctr(c,r);const d=document.createElement('div');d.className='vd-chip';d.textContent=vdShort(v*bet*s.mult);d.style.left=x+'px';d.style.top=y+'px';fx&&fx.appendChild(d);
   setTimeout(()=>{d.style.transform=`translate(calc(-50% + ${tx-x}px),calc(-50% + ${ty-y}px)) scale(.6)`;d.style.opacity='.2'},30+i*60);setTimeout(()=>d.remove(),T.collect+i*60+120)});
  const part=s.fish.reduce((a,f)=>a+f[2],0)*s.mult*bet;setTimeout(()=>SFX.win(4),T.collect*.8);
  vdCount('vdStep',stepFrom+got,stepFrom+got+part,T.collect);vdShowBal(part);got+=part;
  await vdWait(T.collect+s.fish.length*60)}
 const p=document.createElement('div');p.className='kk-pop';const [px,py]=ctr(wild[0][0],wild[0][1]);p.style.left=px+'px';p.style.top=py+'px';p.innerHTML=fmt(add)+(s.mult>1?`<small>×${s.mult}</small>`:'');fx&&fx.appendChild(p);setTimeout(()=>p.remove(),1500);
 await vdWait(T.hold*.6);document.querySelectorAll('#vdReels .vd-cell').forEach(e=>e.classList.remove('collect','caught'));return add}
async function vdPlay(round,bet,isBuy){const T=vdT();vd.stepWin=0;vdText('vdStep',fmt(0));
 if(!isBuy){vdText('vdMsg','Draait…');await vdSpinReels(round.base.grid,false);if(round.base.wins.length){await vdShowWins(round.base.wins,1,bet,0)}}
 else{vdText('vdMsg','Bonus gekocht');await vdSpinReels(round.base.grid,false)}
 const baseWin=round.base.win*bet;if(!isBuy&&baseWin>0){vd.lastWin=baseWin;vdText('vdLast',fmt(baseWin))}
 if(round.fs){const n=round.base.sc;document.querySelectorAll('#vdReels .vd-cell.sc').forEach(e=>e.classList.add('win'));SFX.bonus();await vdWait(T.hold*.8);
  await vdBanner(round.fsStart+' free spins',n+' boeien · de Visdief pakt alle vissen',2200,'fsin');
  vd.fs={at:0,of:round.fsStart,total:0,caught:0,lvl:0};vdRefresh();let of=round.fsStart;
  for(let i=0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];vd.fs.at=i+1;vdText('vdMsg',vd.fs.at+' / '+of);vd.stepWin=0;vdText('vdStep',fmt(0));SFX.spin();
   await vdSpinReels(s.grid,true);let step=0;
   if(s.wins.length)step+=await vdShowWins(s.wins,s.mult,bet,step);
   if(s.wilds&&s.fish.length)step+=await vdCollect(s,bet,step);
   else if(s.wilds){SFX.lose();document.querySelectorAll('#vdReels .vd-cell.wild').forEach(e=>e.classList.add('win'));await vdWait(T.hold*.5)}
   vd.fs.total=s.total*bet;vd.fs.caught=s.caught;const lvUp=s.lvl>vd.fs.lvl;vd.fs.lvl=s.lvl;vdText('vdLast',fmt(vd.fs.total));vdEl('vdFs')&&(vdEl('vdFs').innerHTML=vdFsBar());
   if(s.re){of+=s.re;vd.fs.of=of;SFX.big();await vdBanner('+'+s.re+' spins','Multiplier nu ×'+VISD.MULTS[s.lvl],1800,s.lvl>=3?'big gold':'fsin')}
   if(s.total>=VISD.MAX_WIN){SFX.big();await vdBanner('Max win',VISD.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   await vdWait(vdFast()?100:260)}
  const x=round.fs.total;if(x>=20)SFX.big();
  await vdBanner(fmt(x*bet),(x>=VISD.MAX_WIN?'Max win · ':x>=200?'Episch · ':x>=100?'Megawinst · ':x>=40?'Grote winst · ':'Bonus voorbij · ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2600,x>=40?'big':'');
  vd.fs=null;vdRefresh()}
 else{const x=round.total;if(x>=20){SFX.big();await vdBanner(fmt(x*bet),(x>=100?'Megawinst':'Grote winst')+' · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× inzet',2000,'big')}else if(x===0)SFX.lose()}}
document.addEventListener('keydown',e=>{if(e.code!=='Space'||page!=='casino'||casinoTab!=='vis'||window.__chase)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!$('#modal').hidden)return;
 e.preventDefault();if(!vd.busy&&!e.repeat)act.vdSpin(false);else if(!vd.busy&&e.repeat)act.vdSpin(false)});
Object.assign(act,{
 vdNewSeed(){if(vd.busy)return;const o=vdSeed();S.vdSeed=kkNewSd({id:kkSeedId(o),spins:o.spins,bon:o.bon,sup:0});SFX.chip();save();vdRefresh();toast('Nieuwe seed: '+kkSeedId(S.vdSeed))},
 async vdSpin(isBuy){if(vd.busy||inJail())return;const bet=vdBet(),cost=isBuy?bet*VISD.BUY_COST:bet;if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  vd.busy=true;vd.confirm=false;vd.pick=false;vd.bet=bet;vd.shown=0;SFX.spin();
  const sd=vdSeed(),rng=SLOT.seedRng('vis:'+sd.s+':'+sd.c+':'+sd.n);sd.n++;
  const round=VISD.playRound(rng,{buy:isBuy,vip:isVip()});if(!isBuy){sd.spins++;if(round.fs)sd.bon++}
  const pay=Math.floor(round.total*bet*100)/100;
  S.cash+=pay-cost;window.slotPending=pay;if(pay>cost)S.stats.won+=pay-cost;else S.stats.lost+=cost-pay;casinoRound(cost,pay,'vis');
  save();renderTop();vdRefresh();
  try{await vdPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;vd.busy=false;vd.shown=0;vd.fs=null;vd.lastWin=pay;vd.stepWin=0;
  vd.msg=pay>0?(Math.round(round.total*100)/100).toLocaleString('nl-NL')+'× inzet':'Geen winst';
  if(pay>=bet*20||isBuy||round.fs)log('Visdief: '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':round.fs?'bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Grote vangst: '+fmt(pay)+'!','lvl');
  save();renderTop();vdRefresh()}});
