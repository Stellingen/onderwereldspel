// Casino: Gouden Draak — een draak boven een restaurant op de Zeedijk. 5 rollen, 3 rijen, 20 lijnen. Engine: js/draak.js (DRAAK).
// Twee bonussen: 3 gongs = 10 free spins met de Reuzendraak (rol 2 t/m 4 worden één groot symbool), en 6 of meer gouden munten =
// de Muntenbonus op 9 vakjes (munten blijven plakken, je staat dan weer op 3 spins; alle 9 vol = Mega, de max win).
// De uitkomst ligt vast bij het draaien en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
window.dr=window.dr||{bi:4,busy:false,grid:null,fs:null,hs:null,buyMode:false,shown:0,bet:0,tick:'',stepWin:0,lastWin:0,paused:false,inBonus:false};
const drBet=()=>{const B=kkBets();if(dr.bi>=B.length)dr.bi=B.length-1;return B[dr.bi]};
const drEl=id=>document.getElementById(id);
const drOn=()=>page==='casino'&&casinoTab==='draak'&&!!drEl('drBoard')&&!document.hidden;
const drReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const drT=()=>({spin:slotSp(800,400),stag:slotSp(160,85),hold:slotSp(950,560),line:slotSpd()===3?0:slotSp(520,260),hs:slotSp(900,480),drop:slotSp(420,220)});
// Bonus pauzeert als je wegklikt of het scherm uit staat; overslaan kan niet, alleen de snelheid
function drGate(){return new Promise(res=>{dr.paused=true;dr._resume=res;if(drOn())render()})}
function drResume(){if(!dr.paused)return;dr.paused=false;SFX.click();render();const r=dr._resume;dr._resume=null;if(r)setTimeout(r,60)}
const drHold=async()=>{if(dr.inBonus&&(!drOn()||dr.paused))await drGate()};
const drWait=ms=>new Promise(async r=>{await drHold();setTimeout(r,drOn()?ms:0)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&dr.paused&&page==='casino'&&casinoTab==='draak')render()});
const drShort=n=>n>=1e6?'€'+(Math.round(n/1e5)/10).toLocaleString('nl-NL')+'M':n>=1e4?'€'+Math.round(n/1e3).toLocaleString('nl-NL')+'K':fmt(n);
const DR_LC=['#ffd35a','#ff5a4e','#ffb347','#f7e08a','#ff8a5c','#e8c66a','#ffcf70','#ff6f61','#f5b041','#ffe7a3'];
const DR_JP={mini:['Mini','#5fe08f'],minor:['Minor','#5ad1ff'],major:['Major','#b48cff'],mega:['Mega','#ff4f5a']};
// doorgerekend per lidmaatschap (draaksim2.js)
const DR_TIER=[{fs:240,hs:260,rtp:'93'},{fs:220,hs:240,rtp:'94,5'},{fs:205,hs:210,rtp:'96'}];

// ---------- Iconen ----------
const DR_IC={
 koekje:'<path d="M8 40c2-16 18-26 30-22 10 3 16 12 18 20-8-4-16-4-22 2-6-8-16-8-26 0z" fill="#e9b45a"/><path d="M8 40c10-8 20-8 26 0 6-6 14-6 22-2-4 10-14 16-25 16S10 48 8 40z" fill="#c98a32"/><path d="M34 40c-1 6-1 10 1 14" stroke="#a5701f" stroke-width="2" fill="none"/><path d="M30 34l22-10 2 4-22 10z" fill="#fff8e6"/><path d="M36 33l12-5M37 35.5l9-4" stroke="#c0392b" stroke-width="1.3"/>',
 stokjes:'<ellipse cx="32" cy="48" rx="20" ry="6" fill="#1c1c22"/><path d="M12 44h40c-2 9-10 14-20 14s-18-5-20-14z" fill="#f2efe6"/><path d="M14 47h36" stroke="#c0392b" stroke-width="2.4"/><ellipse cx="32" cy="44" rx="20" ry="4" fill="#fff"/><path d="M20 44c3-3 21-3 24 0" fill="#f6f1df"/><path d="M14 8l26 34" stroke="#b71c1c" stroke-width="4.5" stroke-linecap="round"/><path d="M24 6l20 36" stroke="#d32f2f" stroke-width="4.5" stroke-linecap="round"/><path d="M14 8l5 6.5M24 6l4 7" stroke="#ffd35a" stroke-width="4.5" stroke-linecap="round"/>',
 theepot:'<path d="M12 30c-8 0-10 12 0 14" stroke="#e9e6dc" stroke-width="4" fill="none"/><path d="M52 34l10-8-2 10-8 6z" fill="#e9e6dc"/><ellipse cx="32" cy="38" rx="21" ry="17" fill="#f4f1ea"/><path d="M14 36c6 4 30 4 36 0" stroke="#2c5aa0" stroke-width="3" fill="none"/><path d="M22 44c3 3 6 3 9 0s6-3 9 0" stroke="#2c5aa0" stroke-width="2" fill="none"/><ellipse cx="32" cy="22" rx="12" ry="4" fill="#e3dfd2"/><circle cx="32" cy="16" r="3.5" fill="#2c5aa0"/><ellipse cx="32" cy="54" rx="13" ry="3" fill="#d6d1c2"/>',
 jade:'<circle cx="32" cy="32" r="25" fill="#2fae74"/><circle cx="32" cy="32" r="25" fill="none" stroke="#8ff0bd" stroke-width="2" opacity=".6"/><circle cx="32" cy="32" r="9" fill="#0b2a1c"/><circle cx="32" cy="32" r="16.5" fill="none" stroke="#1f8a58" stroke-width="3"/><path d="M32 7v6M32 51v6M7 32h6M51 32h6M14 14l4 4M46 46l4 4M14 50l4-4M46 18l4-4" stroke="#1f8a58" stroke-width="2.4"/><path d="M18 20c4-6 10-8 16-8" stroke="#c9ffe2" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/>',
 waaier:'<path d="M32 54L4 26a40 40 0 0 1 56 0z" fill="#c0392b"/><path d="M32 54L4 26a40 40 0 0 1 56 0z" fill="none" stroke="#ffd35a" stroke-width="2"/>'+[0,1,2,3,4,5,6].map(i=>{const a=(-135+i*15)*Math.PI/180;return `<path d="M32 54L${(32+Math.cos(a)*40).toFixed(1)} ${(54+Math.sin(a)*40).toFixed(1)}" stroke="#ffd35a" stroke-width="1.4" opacity=".75"/>`}).join('')+'<path d="M14 30c6-6 30-8 36 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".35"/><circle cx="32" cy="54" r="4" fill="#ffd35a"/>',
 lantaarn:'<path d="M32 2v6" stroke="#ffd35a" stroke-width="2"/><rect x="22" y="8" width="20" height="5" rx="2" fill="#ffd35a"/><ellipse cx="32" cy="30" rx="20" ry="18" fill="#e53935"/><path d="M20 15c-4 9-4 22 0 31M44 15c4 9 4 22 0 31M32 12v36" stroke="#a11a1a" stroke-width="2" fill="none"/><ellipse cx="26" cy="24" rx="5" ry="8" fill="#ff8a80" opacity=".5"/><rect x="22" y="46" width="20" height="5" rx="2" fill="#ffd35a"/><path d="M28 51l-1 11M32 51v12M36 51l1 11" stroke="#ffd35a" stroke-width="2"/>',
 kat:'<ellipse cx="32" cy="58" rx="18" ry="4" fill="rgba(0,0,0,.3)"/><path d="M14 58V38c0-10 8-18 18-18s18 8 18 18v20z" fill="#fbf8f2"/><path d="M44 30l8-18 4 4-6 16z" fill="#fbf8f2"/><circle cx="55" cy="14" r="5" fill="#fbf8f2"/><path d="M18 22l3-12 8 8zM46 22l-3-12-8 8z" fill="#fbf8f2"/><path d="M20 20l2-6 4 4zM44 20l-2-6-4 4z" fill="#ff9aa2"/><path d="M22 30q4 3 8 0M34 30q4 3 8 0" stroke="#1c1c22" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M30 35h4l-2 2z" fill="#ff7a8a"/><path d="M16 42c10 4 22 4 32 0" stroke="#d32f2f" stroke-width="4" fill="none"/><circle cx="32" cy="46" r="4" fill="#ffd35a"/><ellipse cx="32" cy="54" rx="9" ry="3" fill="#ffd35a"/>',
 draak:`<defs><linearGradient id="drDg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a4e"/><stop offset="1" stop-color="#9b1010"/></linearGradient></defs>
  <path d="M10 18c6-10 14-12 20-6-6 0-10 4-10 8z" fill="#ffd35a"/><path d="M54 18c-6-10-14-12-20-6 6 0 10 4 10 8z" fill="#ffd35a"/>
  <path d="M12 30c0-12 9-18 20-18s20 6 20 18c0 8-4 14-8 18l-3 10H23l-3-10c-4-4-8-10-8-18z" fill="url(#drDg)"/>
  <path d="M20 26c3-2 7-2 9 1M44 26c-3-2-7-2-9 1" stroke="#ffd35a" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="25" cy="30" r="3" fill="#ffe27a"/><circle cx="39" cy="30" r="3" fill="#ffe27a"/><circle cx="25" cy="30" r="1.2" fill="#1c0b0b"/><circle cx="39" cy="30" r="1.2" fill="#1c0b0b"/>
  <path d="M24 44c4 3 12 3 16 0" stroke="#ffd35a" stroke-width="2" fill="none"/><path d="M26 47l2 4 2-4M34 47l2 4 2-4" fill="#fff"/><circle cx="28" cy="39" r="1.6" fill="#5a0b0b"/><circle cx="36" cy="39" r="1.6" fill="#5a0b0b"/>
  <path d="M22 42C12 44 6 50 4 58M42 42c10 2 16 8 18 16" stroke="#ffd35a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
 parel:`<defs><radialGradient id="drPg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffd35a"/><stop offset="1" stop-color="#b8790a"/></radialGradient></defs>
  <path d="M8 46c6-10 10-12 14-10M56 46c-6-10-10-12-14-10M18 56c2-8 6-10 10-8M46 56c-2-8-6-10-10-8" stroke="#c0392b" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="30" r="20" fill="url(#drPg)"/><path d="M22 26c4-8 14-10 20-4-6-2-12 0-14 6s2 10 8 10c-8 2-16-4-14-12z" fill="#fff6c9" opacity=".7"/><circle cx="25" cy="22" r="4" fill="#fff" opacity=".8"/>`,
 gong:'<path d="M6 10h52" stroke="#7a3a12" stroke-width="5" stroke-linecap="round"/><path d="M10 10v48M54 10v48" stroke="#7a3a12" stroke-width="4.5"/><path d="M4 10l4-5h48l4 5" fill="#c0392b"/><path d="M24 12v6M40 12v6" stroke="#caa24a" stroke-width="1.6"/><circle cx="32" cy="36" r="17" fill="#c98a2a"/><circle cx="32" cy="36" r="17" fill="none" stroke="#ffe08a" stroke-width="1.6"/><circle cx="32" cy="36" r="9" fill="#e8b04a"/><circle cx="32" cy="36" r="4" fill="#ffd35a"/><path d="M22 28a14 14 0 0 1 8-5" stroke="#fff3c4" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>',
 munt:`<defs><radialGradient id="drMg" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff1b0"/><stop offset=".55" stop-color="#f5c542"/><stop offset="1" stop-color="#a87400"/></radialGradient></defs>
  <circle cx="32" cy="32" r="27" fill="url(#drMg)"/><circle cx="32" cy="32" r="27" fill="none" stroke="#8a5d00" stroke-width="1.6"/><circle cx="32" cy="32" r="21.5" fill="none" stroke="#c48c10" stroke-width="2"/>
  <rect x="26" y="26" width="12" height="12" fill="#5a1414" stroke="#8a5d00" stroke-width="1.4"/><path d="M18 18l4 4M46 18l-4 4M18 46l4-4M46 46l-4-4" stroke="#c48c10" stroke-width="2"/>`};
const drSvg=id=>`<svg viewBox="0 0 64 64" aria-hidden="true">${DR_IC[id]||''}</svg>`;
const drSymId=x=>x.sc?'gong':x.w?'parel':x.m!=null?'munt':DRAAK.SYMS[x.s].id;
const drCoinLab=(v,bet)=>typeof v==='string'?DR_JP[v][0]:drShort(v*(bet||dr.bet||drBet()));
function drCellHtml(x,bet){const id=drSymId(x),jp=typeof x.m==='string';
 const cls='dr-cell'+(x.sc?' sc':'')+(x.w?' wild':'')+(x.m!=null?' coin'+(jp?' jp jp-'+x.m:''):'')+(['draak','kat','lantaarn'].includes(id)?' hi':'');
 return `<div class="${cls}">${drSvg(id)}${x.w?'<span class="dr-lb">Wild</span>':x.sc?'<span class="dr-lb sc">Bonus</span>':''}${x.m!=null?`<b class="dr-cv">${drCoinLab(x.m,bet)}</b>`:''}</div>`}
function drDemo(){return [[{s:0},{s:4},{s:7}],[{s:2},{w:1},{s:5}],[{s:6},{s:1},{sc:1}],[{m:5},{s:3},{s:0}],[{s:7},{s:2},{s:4}]]}
function drRand(fs){if(fs)return DRAAK.pickSym(Math.random,0);return Math.random()<.08?{m:DRAAK.pickCoin(Math.random)}:DRAAK.pickSym(Math.random,1)}
function drReelsHtml(g,fs){if(fs){const big=g[1][0];return `<div class="dr-reel" data-c="0"><div class="dr-strip">${g[0].map(x=>drCellHtml(x)).join('')}</div></div>
  <div class="dr-bigw"><div class="dr-big" id="drBig">${drBigHtml(big)}</div></div><div class="dr-reel" data-c="4"><div class="dr-strip">${g[4].map(x=>drCellHtml(x)).join('')}</div></div>`}
 return g.map((col,c)=>`<div class="dr-reel" data-c="${c}"><div class="dr-strip" style="--n:3">${col.map(x=>drCellHtml(x)).join('')}</div></div>`).join('')}
const drBigHtml=b=>`<div class="dr-cell big${b.sc?' sc':''}${b.w?' wild':''}">${drSvg(drSymId(b))}${b.w?'<span class="dr-lb">Wild</span>':b.sc?'<span class="dr-lb sc">Bonus</span>':''}</div>`;
const drCellEl=(c,r)=>{if(dr.fs&&c>=1&&c<=3)return drEl('drBig');const re=document.querySelector(`#drReels .dr-reel[data-c="${c}"]`);return re?re.querySelectorAll('.dr-cell')[r]:null};
// Kop: daken van de Zeedijk met lantaarns en de naam in goud
const DR_LOGO=`<div class="dr-logo"><svg class="dr-lg-ic" viewBox="0 0 64 64" aria-hidden="true">${DR_IC.draak}</svg><span class="dr-name">Gouden<b>Draak</b></span></div>`;
const DR_SKY=`<svg class="dr-sky" viewBox="0 0 900 80" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
 <g fill="#2a0c0c"><path d="M0 80V52l40-10 40 10v28zM120 80V44l50-14 50 14v36zM610 80V40l55-16 55 16v40zM760 80V50l45-12 45 12v30z"/><path d="M30 44q10-8 20 0M140 36q30-14 60 0M630 32q35-14 70 0M770 42q35-12 70 0" stroke="#5a1a12" stroke-width="3" fill="none"/></g>
 <path d="M0 12Q225 34 450 18T900 14" stroke="#3a1410" stroke-width="1.4" fill="none"/>
 ${[60,170,290,410,530,650,770,870].map((x,i)=>{const y=12+Math.sin(i*1.3)*6+10;return `<g class="dr-lan" style="--d:${(i%4)*.6}s"><path d="M${x} ${y-10}v6" stroke="#caa24a" stroke-width="1"/><ellipse cx="${x}" cy="${y+2}" rx="7" ry="8" fill="#e53935"/><rect x="${x-4}" y="${y-6}" width="8" height="2.4" fill="#ffd35a"/><rect x="${x-4}" y="${y+9}" width="8" height="2.4" fill="#ffd35a"/><ellipse cx="${x}" cy="${y+2}" rx="12" ry="12" fill="#ff7043" opacity=".18"/></g>`}).join('')}</svg>`;

function drInfo(){const fs=dr.fs,hs=dr.hs,pend=window.slotPending||0;
 return `<div class="kk-bal has-r"><div class="kk-bal-l"><span class="label">Saldo</span><b id="drBal">${fmt(S.cash-pend+(dr.shown||0))}</b></div>${fs?slotFsIn(fs,'Free spins'):hs?`<div class="kk-fsin"><span class="label">Munten</span><b>${hs.filled||0} / 9</b></div>`:slotBetIn(dr.busy&&dr.bet?dr.bet:drBet(),false,0)}</div>
  <div class="kk-stat"><span class="label">Deze spin</span><b id="drStep" class="acc">${fmt(dr.stepWin)}</b></div>
  <div class="kk-stat"><span class="label">${fs||hs?'Bonuswinst':'Gewonnen'}</span><b id="drLast" class="grn">${fmt(fs?fs.total:hs?hs.total||0:dr.lastWin)}</b></div>
  ${fs?`<div class="kk-stat kk-fsx"><span class="label">Bonus</span><b class="sm kk-xn">${slotX(fs.total,dr.bet)}</b></div><div class="kk-stat fsb"><span class="label">Free spins</span><b class="kk-fsn">${fs.at} / ${fs.of}</b></div>`:''}`}
function drSubHtml(){return dr.fs?'<span class="dr-tag">Reuzendraak</span> Rol 2 t/m 4 zijn één groot symbool':dr.hs?'<span class="dr-tag">Muntenbonus</span> Elke nieuwe munt zet je weer op 3 spins':`${vipTag()}Free spins ±1 op ${DR_TIER[tier()].fs} · munten ±1 op ${DR_TIER[tier()].hs} · max ${DRAAK.MAX_WIN.toLocaleString('nl-NL')}×`}
function drControls(){const b=drBet(),fsC=b*DRAAK.FS_BUY,hsC=b*DRAAK.HS_BUY,dis=dr.busy||inJail();
 return `<div class="kk-betbox"><span class="label">Inzet</span>
   <div class="kk-bet"><button onclick="drStepBet(-1)" ${dr.busy?'disabled':''} aria-label="Lagere inzet">−</button><button class="kk-betv" onclick="slotBetPop('dr')" ${dr.busy?'disabled':''} aria-label="Inzet kiezen">${fmt(b)}</button><button onclick="drStepBet(1)" ${dr.busy?'disabled':''} aria-label="Hogere inzet">+</button></div></div>
   ${dr.buyMode?`<div class="dr-buys"><button class="btn kk-go buy dr-bfs" onclick="act.drSpin('fs')" ${dis||casCash()<fsC?'disabled':''}><span class="kk-buy-l">Free spins</span><b class="kk-buy-p" data-fit="13" title="${fmt(fsC)}">${fsC>=1e6?fmtS(fsC):fmt(fsC)}</b><small>${DRAAK.FS_BUY}× · 10 spins</small></button>
    <button class="btn kk-go buy dr-bhs" onclick="act.drSpin('hs')" ${dis||casCash()<hsC?'disabled':''}><span class="kk-buy-l">Munten</span><b class="kk-buy-p" data-fit="13" title="${fmt(hsC)}">${hsC>=1e6?fmtS(hsC):fmt(hsC)}</b><small>${DRAAK.HS_BUY}× · 6 munten</small></button></div>`
    :`<button class="btn kk-go" onclick="act.drSpin(false)" ${dis?'disabled':''}>${dr.busy?'Bezig…':'Draaien'}<small>spatie</small></button>`}
   <div class="kk-small">${slotSpdHtml()}
    <button class="kk-buyt ${dr.buyMode?'on':''}" onclick="dr.buyMode=!dr.buyMode;SFX.click();drRefresh()" ${dr.busy?'disabled':''} aria-pressed="${!!dr.buyMode}"><i></i><span>Bonus kopen</span><small>${dr.buyMode?'aan':'uit'}</small></button></div>`}
function drSeed(){if(!S.drSeed||!S.drSeed.s)S.drSeed=kkNewSd(S.drSeed&&S.drSeed.prev);return S.drSeed}
function drSeedHtml(){const s0=drSeed(),p=s0.prev,sd={...s0,bon:s0.bon-(dr.busy&&dr.sdPend?1:0)};
 return `<div class="kk-seed"><div class="kk-seed-i"><span class="label">Seed</span><b>${kkSeedId(sd)}</b></div>
  <div class="kk-seed-i"><span class="label">Op deze seed</span><b>${sd.spins} spin${sd.spins===1?'':'s'}, ${sd.bon} bonus${sd.bon===1?'':'sen'}</b></div>
  ${p?`<div class="kk-seed-i prev"><span class="label">Vorige seed</span><b>${p.id}: ${p.spins} spins, ${p.bon} bonus${p.bon===1?'':'sen'}</b></div>`:''}
  <button class="btn ghost sm" onclick="act.drNewSeed()" ${dr.busy?'disabled':''}>Nieuwe seed</button></div>`}
// Uitbetaling per lijn, de munten en de jackpots
function drPayTab(){const b=drBet(),k=DRAAK.PAYK/DRAAK.LINES.length*(DRAAK.VIP_KT[tier()]||1);
 const rows=DRAAK.SYMS.slice().reverse().map(s=>`<div class="vd-pt dr-pt"><span>${drSvg(s.id)}</span><div>${[2,1,0].map(i=>`<p><i>${i+3}</i>${fmt(s.pay[i]*k*b)}</p>`).join('')}</div></div>`).join('');
 const coins=DRAAK.COINS.filter(c=>typeof c[0]==='number').map(c=>`<i>${drShort(c[0]*b)}</i>`).join('');
 const jp=['mini','minor','major'].map(j=>`<div class="dr-jpr" style="--jc:${DR_JP[j][1]}"><b>${DR_JP[j][0]}</b><span>${DRAAK.JP[j]}×</span><em>${fmt(DRAAK.JP[j]*b)}</em></div>`).join('')+`<div class="dr-jpr mega" style="--jc:${DR_JP.mega[1]}"><b>Mega</b><span>alle 9 vol</span><em>${fmt(DRAAK.MAX_WIN*b)}</em></div>`;
 return `<div class="vd-pay-g"><div><h3 class="vd-h">Uitbetaling per lijn bij ${fmt(b)} inzet${isVip()?' ('+lidName()+')':''}</h3><p class="vd-p">3, 4 of 5 dezelfde van links naar rechts, op 20 vaste lijnen. De parel vervangt alles behalve de gong en de munt.</p><div class="vd-ptab">${rows}</div></div>
  <div><h3 class="vd-h">Jackpots in de Muntenbonus</h3><div class="dr-jps">${jp}</div>
  <h3 class="vd-h" style="margin-top:18px">Waarde van een munt</h3><div class="vd-fishv dr-coinv">${coins}</div></div></div>`}
function draakView(){const g=dr.grid||drDemo(),fs=dr.fs,hs=dr.hs;
 return `<div class="kk kk3 dr ${fs?'is-fs':''} ${hs?'is-hs':''} ${dr.buyMode?'is-buy':''}">
 <div class="kk-stage dr-stage" id="drStage">
  <div class="dr-board" id="drBoard">${DR_SKY}<header class="dr-head">${DR_LOGO}<span id="drSub" class="dr-sub">${drSubHtml()}</span><button class="kk-snd dr-snd" onclick="SFX.toggle();this.textContent=SFX.on?'🔊':'🔇'" aria-label="Geluid aan of uit">${SFX.on?'🔊':'🔇'}</button></header>
   <div class="dr-deck"><div class="dr-frame"><div class="dr-reels ${fs?'fs':''}" id="drReels">${drReelsHtml(g,!!fs)}</div>${hs?drHsHtml():''}<svg class="dr-lines" id="drLines" viewBox="0 0 500 300" preserveAspectRatio="none"></svg><div class="dr-fx" id="drFx"></div></div></div>
   <div class="dr-tick" id="drTick">${dr.tick||'3 gongs geven 10 free spins met de Reuzendraak. 6 gouden munten geven de Muntenbonus.'}</div>
   <div id="drBanner"></div>${drRunHtml()}${dr.paused?`<div class="kk-banner pause dr-ban"><div><b>Gepauzeerd</b><span>Je bonus staat klaar</span><button class="btn kk-go" style="margin-top:18px" onclick="drResume()">Bonus verder afspelen</button></div></div>`:''}</div>
  <div class="kk-bar"><div class="kk-hud" id="drInfo">${drInfo()}</div><div class="kk-ctl" id="drCtl">${drControls()}</div></div>
  <div id="drSeedBox">${drSeedHtml()}</div>
 </div>
 <section class="card kk-pay vd-pay dr-pay"><div id="drPayTab">${drPayTab()}</div>
  <div class="kk-rules">
   <div><span>${drSvg('gong')}</span><p><b>3 gongs</b> (op rol 1, 3 en 5) geven ${DRAAK.FS_START} free spins met de <b>Reuzendraak</b>: rol 2, 3 en 4 worden één groot blok met één symbool. Dat telt als drie volle rollen van dat symbool, dus één gelijk symbool op rol 1 is al vier op een lijn, en met rol 5 erbij vijf. Een gong op rol 1, een reuzengong en een gong op rol 5 geven ${DRAAK.FS_RETRIG} spins extra.</p></div>
   <div><span>${drSvg('munt')}</span><p><b>${DRAAK.HS_TRIG} of meer gouden munten</b>, waar ook op het scherm, geven de <b>Muntenbonus</b>: een bord van 9 vakjes waarin de beste munten blijven staan. Je hebt 3 spins. Valt er een munt bij, dan blijft hij plakken en sta je weer op 3. Valt er niets, dan gaat er een spin af. Munten zijn 1× tot 50× je inzet waard, of een jackpot: Mini ${DRAAK.JP.mini}×, Minor ${DRAAK.JP.minor}×, Major ${DRAAK.JP.major}×. Alle 9 vakjes vol is <b>Mega</b>: ${DRAAK.MAX_WIN.toLocaleString('nl-NL')}× je inzet, de max win.</p></div>
   <div><span>${drSvg('parel')}</span><p><b>De drakenparel</b> is wild op rol 2, 3 en 4. In de free spins kan het hele grote blok een parel zijn: dan telt elke lijn met een symbool op rol 1 als vier op een lijn.</p></div>
   <div><span class="kk-mini key">␣</span><p><b>Spatiebalk</b> draait. RTP ±${DR_TIER[tier()].rtp}%. Bonus kopen: free spins ${DRAAK.FS_BUY}× of de Muntenbonus met 6 munten ${DRAAK.HS_BUY}× je inzet (±96%).${isVip()?` Als <b>${lidName()}</b> vallen gongs en munten vaker; lijnwinst in het basisspel is daarvoor ${Math.round((1-DRAAK.VIP_KT[tier()])*100)}% lager.`:` <b>VIP</b> en <b>High roller</b> komen vaker in de bonussen.`}</p></div>
  </div></section></div>`}
function drRefresh(){const root=document.querySelector('.dr');if(!root)return;root.classList.toggle('is-fs',!!dr.fs);root.classList.toggle('is-hs',!!dr.hs);root.classList.toggle('is-buy',!!dr.buyMode);
 const set=(id,h)=>{const e=drEl(id);if(e){e.innerHTML=h;fitText(e)}};
 set('drSub',drSubHtml());set('drInfo',drInfo());set('drCtl',drControls());set('drSeedBox',drSeedHtml());set('drPayTab',drPayTab())}
function drStepBet(d){if(dr.busy)return;dr.bi=Math.max(0,Math.min(kkBets().length-1,dr.bi+d));SFX.chip();drRefresh()}
function drSetBet(i){if(dr.busy)return;dr.bi=Math.max(0,Math.min(kkBets().length-1,i));SFX.chip();drRefresh()}
function drText(id,v){const e=drEl(id);if(e)e.textContent=v}
function drTick(t){dr.tick=t;const e=drEl('drTick');if(e){e.innerHTML=t;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}}
function drCount(id,from,to,ms){const el=drEl(id);if(!el||!drOn()){if(el)el.textContent=fmt(to);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const st=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(st);else res()};requestAnimationFrame(st)})}
function drShowBal(add){dr.shown=(dr.shown||0)+add;drText('drBal',fmt(S.cash-(window.slotPending||0)+dr.shown))}
async function drBanner(big,small,ms,cls,ic){await drHold();const el=drEl('drBanner');if(el)el.innerHTML=`<div class="kk-banner dr-ban ${cls||''}">${/plus/.test(cls||'')?'<i class="ban-rip"></i><i class="ban-rip b"></i>':''}<div>${ic?`<i class="ban-ic">${ic}</i>`:''}<b>${big}</b><span>${small||''}</span></div></div>`;
 return drWait(ms||1400).then(()=>{const e=drEl('drBanner');if(e)e.innerHTML=''})}

// ---------- Rollen ----------
async function drSpinReels(g,fs){await drHold();const T=drT();const box=drEl('drReels');
 if(!box||!drOn()){dr.grid=g;return}
 if(box.classList.contains('fs')!==!!fs){box.classList.toggle('fs',!!fs);box.innerHTML=drReelsHtml(dr.grid&&!!dr.grid[1][0].big===!!fs?dr.grid:g,fs)}
 const cur=dr.grid&&(!!dr.grid[1][0].big===!!fs)?dr.grid:g;let maxT=0;
 [...box.querySelectorAll('.dr-reel')].forEach(el=>{const c=+el.dataset.c,F=7+c*2,n=F+6,strip=el.querySelector('.dr-strip');
  strip.getAnimations().forEach(a=>a.cancel());strip.style.setProperty('--n',n);
  strip.innerHTML=[...g[c],...Array.from({length:F},()=>drRand(fs)),...cur[c]].map(x=>drCellHtml(x)).join('');
  const cell=100/n,S0=-(F+3)*cell,dur=T.spin+(fs&&c===4?3:c)*T.stag;maxT=Math.max(maxT,dur);
  const kf=drReduce()?[{transform:`translateY(${S0}%)`},{transform:'translateY(0%)'}]:[
   {transform:`translateY(${S0}%)`,filter:'blur(0px)',easing:'ease-out'},{transform:`translateY(${S0-.2*cell}%)`,offset:.08,filter:'blur(0px)',easing:'cubic-bezier(.55,0,1,.6)'},
   {transform:`translateY(${S0*.55}%)`,filter:'blur(2px)',offset:.42,easing:'cubic-bezier(0,.25,.35,1)'},{transform:`translateY(${.14*cell}%)`,filter:'blur(0px)',offset:.9,easing:'ease-in-out'},{transform:'translateY(0%)',filter:'blur(0px)'}];
  strip.animate(kf,{duration:dur,fill:'both'});
  const sc=g[c].some(x=>x.sc),coin=g[c].some(x=>x.m!=null);
  setTimeout(()=>{el.classList.add('stop');setTimeout(()=>el.classList.remove('stop'),260);SFX.dr.tick();if(sc)SFX.dr.gong(c/2);else if(coin)SFX.dr.coin(c)},dur*.93)});
 // free spins: het grote blok wisselt snel van symbool en landt dan
 const big=fs&&drEl('drBig');let iv=null;
 if(big){const bd=T.spin+2*T.stag;maxT=Math.max(maxT,bd);big.classList.add('roll');iv=setInterval(()=>{big.innerHTML=drBigHtml(DRAAK.fsGrid(Math.random).big)},drReduce()?400:85);
  setTimeout(()=>{clearInterval(iv);iv=null;big.classList.remove('roll');big.innerHTML=drBigHtml(g[1][0]);big.classList.add('land');setTimeout(()=>big.classList.remove('land'),500);SFX.dr.tick();if(g[1][0].sc)SFX.dr.gong(2)},bd)}
 dr.grid=g;await drWait(maxT+80);if(iv)clearInterval(iv);
 box.querySelectorAll('.dr-reel').forEach(el=>{const c=+el.dataset.c,strip=el.querySelector('.dr-strip');strip.getAnimations().forEach(a=>a.cancel());strip.style.transform='none';strip.style.setProperty('--n',3);strip.innerHTML=g[c].map(x=>drCellHtml(x)).join('')});
 const bb=drEl('drBig');if(bb&&fs)bb.innerHTML=drBigHtml(g[1][0]);dr.grid=g}
function drLineSvg(w,draw){const L=DRAAK.LINES[w.line],pts=['0,'+(L[0]*100+50)].concat(L.map((r,c)=>(c*100+50)+','+(r*100+50)),['500,'+(L[4]*100+50)]).join(' ');
 return `<polyline class="glow" points="${pts}" style="--lc:${DR_LC[w.line%DR_LC.length]}" pathLength="100"/><polyline class="${draw?'draw':''}" points="${pts}" style="--lc:${DR_LC[w.line%DR_LC.length]}" pathLength="100"/>`}
const drSymName=w=>w.n+'× '+DRAAK.SYMS[w.sym].n.toLowerCase();
function drMark(cells){const hit=new Set(cells.map(([c,r])=>c+':'+r));document.querySelectorAll('#drReels .dr-cell').forEach(e=>e.classList.add('dim'));
 cells.forEach(([c,r])=>{const e=drCellEl(c,r);if(e){e.classList.remove('dim');e.classList.add('win')}});if(dr.fs&&cells.some(([c])=>c>=1&&c<=3)){const b=drEl('drBig');if(b){b.classList.remove('dim');b.querySelector('.dr-cell')?.classList.remove('dim');b.querySelector('.dr-cell')?.classList.add('win')}}}
function drUnmark(){document.querySelectorAll('#drReels .dr-cell,#drBig').forEach(e=>e.classList.remove('win','dim'));const s=drEl('drLines');if(s)s.innerHTML=''}
async function drShowWins(wins,bet,stepFrom){if(!wins.length)return 0;await drHold();const T=drT(),svg=drEl('drLines');
 drMark(wins.flatMap(w=>w.cells));if(svg)svg.innerHTML=wins.map(w=>drLineSvg(w,true)).join('');
 const add=wins.reduce((a,w)=>a+w.pay,0)*bet;SFX.dr.win(Math.min(5,wins.length));
 drTick(wins.length>1?`${wins.length} lijnen winnen samen <b>${fmt(add)}</b>`:`${drSymName(wins[0])}: <b>${fmt(add)}</b>`);
 drCount('drStep',stepFrom,stepFrom+add,T.hold*.7);drShowBal(add);await drWait(T.hold);
 if(T.line&&wins.length>1)for(const w of wins.slice(0,5)){if(!drOn())break;drUnmark();drMark(w.cells);const sv=drEl('drLines');if(sv)sv.innerHTML=drLineSvg(w,false);drTick(`${drSymName(w)}: <b>${fmt(w.pay*bet)}</b>`);await drWait(T.line)}
 drUnmark();return add}

// ---------- Muntenbonus ----------
function drHsHtml(){const h=dr.hs;if(!h)return '';const lamps=Array.from({length:DRAAK.HS_SPINS},(_,i)=>`<i class="${i<h.left?'on':''}"></i>`).join('');
 return `<div class="dr-hs" id="drHs"><div class="dr-hs-jp">${['mega','major','minor','mini'].map(j=>`<div class="dr-jp ${j}" style="--jc:${DR_JP[j][1]}"><b>${DR_JP[j][0]}</b><em>${fmt((j==='mega'?DRAAK.MAX_WIN:DRAAK.JP[j])*dr.bet)}</em></div>`).join('')}</div>
  <div class="dr-hs-g" id="drHsG">${h.cells.map((v,i)=>`<div class="dr-hc ${v!=null?'on':''}" data-i="${i}">${v!=null?drCoinHtml(v):''}</div>`).join('')}</div>
  <div class="dr-hs-side"><span class="label">Spins</span><div class="dr-lamps" id="drLamps">${lamps}</div><span class="label">Totaal</span><b id="drHsSum">${fmt(h.sum*dr.bet)}</b></div></div>`}
const drCoinHtml=v=>`<div class="dr-coin ${typeof v==='string'?'jp jp-'+v:''}" style="${typeof v==='string'?'--jc:'+DR_JP[v][1]:''}">${drSvg('munt')}<b>${drCoinLab(v,dr.bet)}</b></div>`;
function drHsSet(i,v,anim){const el=document.querySelector(`#drHsG .dr-hc[data-i="${i}"]`);if(!el)return;el.classList.add('on');el.innerHTML=drCoinHtml(v);if(anim){el.classList.remove('drop');void el.offsetWidth;el.classList.add('drop')}}
function drLamps(){const e=drEl('drLamps');if(e)e.innerHTML=Array.from({length:DRAAK.HS_SPINS},(_,i)=>`<i class="${i<dr.hs.left?'on':''}"></i>`).join('')}
async function drPlayHs(hsr,bet,step0){const T=drT();dr.inBonus=true;
 await drBanner('Muntenbonus','9 vakjes · elke nieuwe munt zet je weer op 3 spins',slotSp(2000,1300),'plus',drSvg('munt'));SFX.dr.bonus();
 dr.hs={cells:Array(9).fill(null),left:DRAAK.HS_SPINS,sum:0,filled:0,total:0};drUnmark();
 const box=drEl('drReels');const fr=box&&box.parentElement;if(fr){const old=drEl('drHs');if(old)old.remove();fr.insertAdjacentHTML('beforeend',drHsHtml())}drRefresh();
 // startmunten: een voor een op hun plek
 let k=0;for(let i=0;i<9;i++){const v=hsr.start[i];if(v==null)continue;dr.hs.cells[i]=v;dr.hs.sum+=DRAAK.coinVal(v);dr.hs.filled++;drHsSet(i,v,true);SFX.dr.coin(k++);drText('drHsSum',fmt(dr.hs.sum*bet));drInfoSet();await drWait(slotSp(260,120))}
 drTick(`${dr.hs.filled} munten blijven staan. Nog ${9-dr.hs.filled} vakjes: vul ze allemaal voor de Mega.`);await drWait(T.hold*.6);
 for(const st of hsr.steps){try{await drHold();
  const g=drEl('drHsG');if(g)g.classList.add('spin');SFX.dr.spin();await drWait(T.hs);if(g)g.classList.remove('spin');
  if(st.nw.length){for(const [i,v] of st.nw){dr.hs.cells[i]=v;dr.hs.sum+=DRAAK.coinVal(v);dr.hs.filled++;drHsSet(i,v,true);
    if(typeof v==='string'){SFX.dr.jp(['mini','minor','major'].indexOf(v));drTick(`<b>${DR_JP[v][0]}</b>: ${fmt(DRAAK.JP[v]*bet)}!`);document.querySelector(`.dr-jp.${v}`)?.classList.add('hit')}else{SFX.dr.coin(i);drTick(`Munt van <b>${fmt(v*bet)}</b> blijft plakken. Weer 3 spins!`)}
    drText('drHsSum',fmt(dr.hs.sum*bet));await drWait(T.drop)}}
  else{SFX.dr.lose();drTick(st.left?`Niets erbij. Nog ${st.left} spin${st.left>1?'s':''}.`:'Geen spins meer.')}
  dr.hs.left=st.left;drLamps();drInfoSet();
  if(dr.hs.filled>=9){await drWait(300);break}
  await drWait(slotSp(260,110))}catch(e){console.error(e)}}
 const tot=hsr.total*bet;dr.hs.total=tot;
 if(hsr.full){SFX.dr.big();document.querySelector('.dr-jp.mega')?.classList.add('hit');await drBanner('MEGA',`Alle 9 vakjes vol · ${DRAAK.MAX_WIN.toLocaleString('nl-NL')}× je inzet · ${fmt(tot)}`,4000,'plus gold',drSvg('draak'))}
 else{SFX.dr.retrig();await drCount('drHsSum',0,tot,slotSp(900,450));await drBanner(fmt(tot),`Muntenbonus · ${(Math.round(hsr.total*10)/10).toLocaleString('nl-NL')}× je inzet`,2400,hsr.total>=40?'big':'',drSvg('munt'))}
 drCount('drStep',step0,step0+tot,500);drShowBal(tot);
 dr.hs=null;const h=drEl('drHs');if(h)h.remove();const bx=drEl('drReels');if(bx){bx.classList.remove('fs');bx.innerHTML=drReelsHtml(dr.grid&&!dr.grid[1][0].big?dr.grid:drDemo(),false)}drRefresh();return tot}
const drInfoSet=()=>{const e=drEl('drInfo');if(e){e.innerHTML=drInfo();fitText(e)}};

// ---------- Ronde afspelen ----------
async function drPlay(round,bet,buy,resume){const T=drT();dr.stepWin=0;drText('drStep',fmt(0));
 if(resume){drTick('Je bonus gaat verder');dr.inBonus=true;await drBanner('Je bonus gaat verder','Het geld staat al op je saldo',2000,'fsin')}
 else{drTick(buy?'Bonus gekocht':'&nbsp;');await drSpinReels(round.base.grid,false);
  if(round.base.wins.length)await drShowWins(round.base.wins,bet,0);else if(!round.fs&&!round.hs)drTick(round.base.sc===2?'Twee gongs, net niet':round.base.coins.length>=4?round.base.coins.length+' munten, je hebt er 6 nodig':'Geen winst')}
 let step=round.base.win*bet;
 if(round.fs){dr.inBonus=true;document.querySelectorAll('#drReels .dr-cell.sc').forEach(e=>e.classList.add('win'));SFX.dr.gong(3);drTick('3 gongs: free spins!');await drWait(T.hold*.9);drUnmark();
  await drBanner(DRAAK.FS_START+' free spins','De Reuzendraak: rol 2 t/m 4 zijn één groot symbool',slotSp(2600,1500),'plus',drSvg('gong'));SFX.dr.bonus();
  dr.fs={at:0,of:DRAAK.FS_START,total:0};let at=0;drRefresh();
  for(const s of round.fs.spins){try{
   if(S.slotRun&&S.slotRun.g==='draak'){S.slotRun.at=(S.slotRun.at||0)+1}
   at++;dr.fs.at=at;dr.fs.of=at+s.left-s.extra;slotFsSet(at,dr.fs.of);dr.stepWin=0;drText('drStep',fmt(0));SFX.dr.spin();
   await drSpinReels(s.grid,true);
   if(s.wins.length)await drShowWins(s.wins,bet,0);else drTick(s.big.sc?'Reuzengong!':'Geen winst deze spin');
   dr.fs.total=s.total*bet;drText('drLast',fmt(dr.fs.total));slotXSet(dr.fs.total,bet);
   if(s.extra){SFX.dr.retrig();dr.fs.of=at+s.left;slotFsSet(at,dr.fs.of,s.extra);await drBanner('+'+s.extra+' spins','3 gongs in de free spins',1800,'plus',drSvg('gong'))}
   if(round.fs.maxHit&&s.total>=DRAAK.MAX_WIN){SFX.dr.big();await drBanner('Max win',DRAAK.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   await drWait(slotSp(280,110))}catch(e){console.error(e);try{drUnmark()}catch(_){}dr.fs.total=s.total*bet}}
  const x=round.fs.total;if(x>=20)SFX.dr.big();
  await drBanner(fmt(x*bet),(x>=200?'Episch · ':x>=100?'Megawinst · ':x>=40?'Grote winst · ':'Free spins voorbij · ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2400,x>=40?'big':'');
  dr.fs=null;step+=x*bet;const box=drEl('drReels');if(box){box.classList.remove('fs');box.innerHTML=drReelsHtml(round.base.grid,false)}dr.grid=round.base.grid;drRefresh()}
 if(round.hs){dr.inBonus=true;document.querySelectorAll('#drReels .dr-cell.coin').forEach(e=>e.classList.add('win'));SFX.dr.coin(5);drTick(round.base.coins.length+' gouden munten: de Muntenbonus!');await drWait(T.hold);drUnmark();
  try{step+=await drPlayHs(round.hs,bet,step)}catch(e){console.error(e);dr.hs=null;const h=drEl('drHs');if(h)h.remove();drRefresh()}}
 if(!round.fs&&!round.hs){const x=round.total;if(x>=20){SFX.dr.big();await drBanner(fmt(x*bet),(x>=100?'Megawinst':'Grote winst')+' · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2000,'big')}else if(x===0)SFX.dr.lose()}
 else drTick(`Bonus voorbij: <b>${fmt(round.total*bet)}</b>`)}
document.addEventListener('keydown',e=>{if(e.code!=='Space'||page!=='casino'||casinoTab!=='draak'||window.__chase||czBanLeft())return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!$('#modal').hidden)return;
 e.preventDefault();if(document.activeElement&&document.activeElement.tagName==='BUTTON')document.activeElement.blur();if(dr.paused){drResume();return}if(dr.busy)return;if(S.slotRun&&S.slotRun.g==='draak'){drResumeRun();return}if(!dr.buyMode)act.drSpin(false)});
async function drResumeRun(){const run=S.slotRun;if(!run||run.g!=='draak'||dr.busy)return;
 let round=null;try{round=DRAAK.playRound(SLOT.seedRng(run.seed),{buy:run.buy||false,vip:run.t})}catch(e){}
 if(!round||!(round.fs||round.hs)||Math.abs(round.total-run.tot)>1e-6){delete S.slotRun;save();render();toast('Je bonus in Gouden Draak is al uitbetaald: '+fmt(run.pay),'lvl');return}
 dr.busy=true;dr.inBonus=true;dr.paused=false;dr.bet=run.bet;dr.shown=0;window.slotPending=0;SFX.click();render();
 try{await drPlay(round,run.bet,run.buy,true)}catch(e){console.error(e)}
 dr.busy=false;dr.inBonus=false;dr.paused=false;dr.fs=null;dr.hs=null;dr.lastWin=run.pay;dr.stepWin=0;delete S.slotRun;save();renderTop();drRefresh()}
const drRunHtml=()=>{const run=S.slotRun;if(!run||run.g!=='draak'||dr.busy)return '';
 return `<div class="kk-banner pause dr-ban"><div><b>Je bonus loopt nog</b><span>${run.buy?'Gekochte bonus':'Bonus'} bij ${fmt(run.bet)} inzet · uitbetaald: ${fmt(run.pay)}. Het geld staat al op je saldo.</span>
  <div class="kk-run-b"><button class="btn kk-go" onclick="drResumeRun()">Bonus verder afspelen</button></div></div></div>`};
Object.assign(act,{
 drNewSeed(){if(dr.busy)return;const o=drSeed();S.drSeed=kkNewSd({id:kkSeedId(o),spins:o.spins,bon:o.bon,sup:0});SFX.chip();save();drRefresh();toast('Nieuwe seed: '+kkSeedId(S.drSeed))},
 async drSpin(buy){if(dr.busy||inJail())return;if(S.slotRun&&S.slotRun.g==='draak'){drResumeRun();return}
  const bet=drBet(),cost=buy==='fs'?bet*DRAAK.FS_BUY:buy==='hs'?bet*DRAAK.HS_BUY:bet;if(casCash()<cost){toast(casShort(),'bad');return}
  dr.busy=true;dr.inBonus=!!buy;dr.paused=false;dr.bet=bet;dr.shown=0;SFX.dr.spin();
  const sd=drSeed(),seedStr='draak:'+sd.s+':'+sd.c+':'+sd.n,rng=SLOT.seedRng(seedStr);sd.n++;
  const round=DRAAK.playRound(rng,{buy:buy||false,vip:tier()});if(!buy){sd.spins++;if(round.fs||round.hs)sd.bon++}
  const pay=Math.floor(round.total*bet*100)/100,lk=typeof luckPct==='function'&&pay>0?Math.floor(pay*luckPct()*100)/100:0;
  S.cash+=pay+lk-cost;window.slotPending=pay+lk;if(pay+lk>cost)S.stats.won+=pay+lk-cost;else S.stats.lost+=cost-pay-lk;
  dr.sdPend=!buy&&(round.fs||round.hs)?1:0;
  if(round.fs||round.hs)S.slotRun={g:'draak',seed:seedStr,buy:buy||false,t:tier(),bet,cost,pay,tot:round.total,at:0,ts:now()};
  casinoRound(cost,pay+lk,'draak');save();renderTop();drRefresh();
  try{await drPlay(round,bet,buy)}catch(e){console.error(e)}
  window.slotPending=0;dr.busy=false;dr.inBonus=false;dr.paused=false;dr.shown=0;dr.fs=null;dr.hs=null;dr.lastWin=pay+lk;dr.stepWin=0;dr.sdPend=0;if(S.slotRun&&S.slotRun.g==='draak')delete S.slotRun;
  if(lk)toast('Geluksdobbelsteen: +'+fmt(lk)+' extra','lvl');
  if(pay>=bet*20||buy||round.fs||round.hs)log('Gouden Draak: '+fmt(pay)+' gewonnen ('+(buy?'gekochte bonus, ':round.hs&&round.hs.full?'MEGA, ':round.fs||round.hs?'bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Gouden Draak: '+fmt(pay)+'!','lvl');
  save();renderTop();drRefresh()}});
