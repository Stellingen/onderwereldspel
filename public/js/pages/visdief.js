// Casino: Visdief — nachtvissen in de haven. 5 rollen, 4 rijen, 20 lijnen. Engine: js/vis.js (VISD).
// Bonus: in de free spins pakt de Visdief het geld van alle vissen. Een ronde speelt altijd uit; met 4 Visdieven begint daarna
// een nieuwe ronde van 10 spins met een hogere multiplier (×2, ×3, ×10). Extra Visdieven tellen door; elke volgende 4 zijn lastiger. Uitkomst ligt vast bij het draaien en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
window.vd=window.vd||{bi:4,busy:false,turbo:false,grid:null,msg:'Kies je inzet en draai',fs:null,lastWin:0,stepWin:0,pick:false,confirm:false,shown:0,bet:0,tick:''};
const vdBet=()=>{const B=kkBets();if(vd.bi>=B.length)vd.bi=B.length-1;return B[vd.bi]};
const vdEl=id=>document.getElementById(id);
const vdOn=()=>page==='casino'&&casinoTab==='vis'&&!!vdEl('vdBoard')&&!document.hidden;
const vdReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const vdFast=()=>vd.turbo||vdReduce();
const vdT=()=>vdFast()?{spin:420,stag:90,tease:600,hold:560,line:0,collect:420}:{spin:820,stag:170,tease:1150,hold:900,line:520,collect:780};
const vdWait=ms=>new Promise(r=>setTimeout(r,vdOn()?ms:0));
const vdShort=n=>n>=1e6?'€'+(Math.round(n/1e5)/10).toLocaleString('nl-NL')+'M':n>=1e4?'€'+Math.round(n/1e3).toLocaleString('nl-NL')+'K':fmt(n);
// lijnkleuren (bolders en winlijnen)
const VD_LC=['#f5c542','#2fd1c5','#7aa7ff','#ff9a3c','#ff7fb3','#b8a1ff','#9be15d','#ffd08a','#5ad1ff','#e6e1d6'];
// Vissen krijgen een kleur naar hun waarde
const vdTier=v=>v>=250?['#f5c542','#a67c00','#fff1b8']:v>=50?['#b48cff','#6b46c1','#e4d6ff']:v>=10?['#5fe08f','#1f9a57','#c9f7da']:['#5ad1ff','#1f8fc7','#c8efff'];
function vdFishSvg(v){const [a,b,c]=vdTier(v||0);return `<path d="M46 32l14-12v24z" fill="${b}"/><path d="M4 32c10-16 32-18 45 0-13 18-35 16-45 0z" fill="${a}"/><path d="M5 33c11 8 27 10 39 4" fill="${c}" opacity=".55"/>
 <path d="M24 15c7-4 14-2 17 4" fill="${b}"/><path d="M27 47c5 3 10 3 13 0" fill="${b}"/><circle cx="15" cy="29" r="3.6" fill="#08131b"/><circle cx="14" cy="28" r="1.2" fill="#fff"/>
 <path d="M23 22c4 6 4 14 0 20" stroke="${b}" stroke-width="2.2" fill="none"/><path d="M30 26l3 3M34 24l3 3M33 32l3 3M38 29l3 3" stroke="${c}" stroke-width="1.4" opacity=".6"/>`}
const VD_IC={
 dobber:'<path d="M32 3v11" stroke="#d6dbe2" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="34" r="19" fill="#f4f1ea"/><path d="M13 34a19 19 0 0 1 38 0z" fill="#ff4b5c"/><rect x="12" y="32" width="40" height="4.5" rx="2" fill="#16181d" opacity=".35"/><path d="M32 53v8" stroke="#a9b0ba" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="24" r="4.5" fill="#fff" opacity=".5"/>',
 haak:'<circle cx="34" cy="9" r="4.5" fill="none" stroke="#d6dbe2" stroke-width="3.5"/><path d="M34 14v27a11 11 0 0 1-22 0v-6" fill="none" stroke="#d6dbe2" stroke-width="5.5" stroke-linecap="round"/><path d="M12 30l-5 9 10-3z" fill="#d6dbe2"/><path d="M38 20v18" stroke="#fff" stroke-width="1.6" opacity=".5"/>',
 blik:'<rect x="13" y="24" width="38" height="33" rx="5" fill="#8a6a3a"/><ellipse cx="32" cy="24" rx="19" ry="5.5" fill="#b08a50"/><ellipse cx="32" cy="24" rx="15" ry="3.6" fill="#3b2a14"/><path d="M25 24c-3-9 9-13 11-6s9 1 7-7" fill="none" stroke="#ff8fb1" stroke-width="5" stroke-linecap="round"/><rect x="17" y="35" width="30" height="11" rx="2" fill="#f5c542"/><path d="M22 40.5h20" stroke="#8a6a3a" stroke-width="2.4"/>',
 molen:'<rect x="19" y="53" width="22" height="6" rx="2" fill="#2b3038"/><path d="M30 46v8" stroke="#2b3038" stroke-width="5"/><circle cx="30" cy="31" r="18" fill="#7aa7ff"/><circle cx="30" cy="31" r="12" fill="#1d3f74"/><path d="M30 19v24M18 31h24" stroke="#7aa7ff" stroke-width="2"/><circle cx="30" cy="31" r="4.5" fill="#d6dbe2"/><path d="M30 31L48 15" stroke="#d6dbe2" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="13" r="5.5" fill="#f5c542"/>',
 net:'<defs><clipPath id="vdNetC"><circle cx="27" cy="26" r="17"/></clipPath></defs><g clip-path="url(#vdNetC)" stroke="#2fd1c5" stroke-width="1.7" opacity=".75"><path d="M0 12l60 30M0 26l60 30M0 40l60 30M0 -2l60 30M8 0L-10 60M22 0L4 60M36 0L18 60M50 0L32 60"/></g><circle cx="27" cy="26" r="18" fill="none" stroke="#2fd1c5" stroke-width="4.5"/><path d="M40 39l16 18" stroke="#c9a227" stroke-width="6.5" stroke-linecap="round"/>',
 koffer:'<rect x="15" y="10" width="20" height="9" fill="#5fe08f" transform="rotate(-10 25 15)"/><rect x="27" y="9" width="20" height="9" fill="#2bb877" transform="rotate(8 37 13)"/><path d="M24 21v-6h16v6" fill="none" stroke="#5a3418" stroke-width="4"/><rect x="7" y="20" width="50" height="35" rx="5" fill="#7a4a24"/><rect x="7" y="33" width="50" height="5" fill="#5a3418"/><rect x="28" y="30" width="8" height="10" rx="1.5" fill="#f5c542"/>',
 boot:'<path d="M3 55c6-4 10 4 16 0s10 4 16 0 10 4 16 0 8 4 12 0" stroke="#5ad1ff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M3 37h56l-9 13H14z" fill="#ff9a3c"/><path d="M3 37h56l-2 3H5z" fill="#ffc48a"/><path d="M19 37l9-13h15l7 13z" fill="#e9e4d8"/><path d="M30 26h11l5 9H25z" fill="#7aa7ff"/><path d="M47 30l8-12" stroke="#d6dbe2" stroke-width="2.5"/>',
 hengel:'<path d="M9 57L53 8" stroke="#c9a227" stroke-width="5.5" stroke-linecap="round"/><path d="M53 8c5 15 2 30-5 41" stroke="#e6e1d6" stroke-width="1.6" fill="none"/><circle cx="19" cy="46" r="7.5" fill="#2b3038" stroke="#d6dbe2" stroke-width="2.2"/><path d="M19 46l6-5" stroke="#d6dbe2" stroke-width="2"/><path d="M45 49q1 7 6 5" stroke="#d6dbe2" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 52l-4 4" stroke="#7a4a24" stroke-width="7" stroke-linecap="round"/>',
 // De Visdief: hoed, zonnebril, stoppels, tandenstoker, gestreepte vissertrui en een hengel over de schouder
 visdief:`<defs><linearGradient id="vdSkin" x1="0" x2="1"><stop offset="0" stop-color="#f0c29b"/><stop offset="1" stop-color="#d79c74"/></linearGradient>
  <linearGradient id="vdGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4656"/><stop offset=".55" stop-color="#0b0f14"/><stop offset="1" stop-color="#1c2633"/></linearGradient>
  <clipPath id="vdTrui"><path d="M8 64c1-10 10-16 24-16s23 6 24 16z"/></clipPath></defs>
  <path d="M4 62L60 4" stroke="#8a6a3a" stroke-width="2.6" stroke-linecap="round"/><path d="M60 4c2 10 1 18-3 24" stroke="#e6e1d6" stroke-width="1" fill="none"/>
  <path d="M8 64c1-10 10-16 24-16s23 6 24 16z" fill="#f4f1ea"/><g clip-path="url(#vdTrui)" fill="#1d3557"><rect x="0" y="50" width="64" height="3"/><rect x="0" y="55.5" width="64" height="3"/><rect x="0" y="61" width="64" height="3"/></g>
  <path d="M25 47l7 6 7-6" fill="none" stroke="#1d3557" stroke-width="2.4" stroke-linejoin="round"/>
  <rect x="27" y="41" width="10" height="8" rx="3" fill="#cf9168"/>
  <ellipse cx="18.6" cy="33" rx="2.6" ry="3.6" fill="#d99a70"/><ellipse cx="45.4" cy="33" rx="2.6" ry="3.6" fill="#c98a62"/>
  <ellipse cx="32" cy="32" rx="13.5" ry="14" fill="url(#vdSkin)"/>
  <path d="M19.5 36c1 7 6 11 12.5 11s11.5-4 12.5-11c-3 3-7 4-12.5 4s-9.5-1-12.5-4z" fill="#8f5a3c" opacity=".28"/>
  <path d="M21 26.5c2.5-1.6 6-1.8 8.5-.6M35 25.4c2.6-1.4 6-1 8 .8" stroke="#3b2414" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M19.5 28.5h10.5l-.8 5.2c-.3 1.8-1.8 2.8-3.6 2.8h-2.8c-1.8 0-3.2-1.2-3.4-3z" fill="url(#vdGlass)"/><path d="M34 28.5h10.5l-.3 5c-.2 1.8-1.6 3-3.4 3h-2.8c-1.8 0-3.3-1-3.6-2.8z" fill="url(#vdGlass)"/>
  <path d="M30 29.6c1.3-.8 2.7-.8 4 0" stroke="#0b0f14" stroke-width="1.6" fill="none"/><path d="M21.5 30l3-1.2M36 30l3-1.2" stroke="#fff" stroke-width="1.2" opacity=".55" stroke-linecap="round"/>
  <path d="M31 36.5c.6 1 1.6 1 2.2 0" stroke="#a86a46" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M26.5 41c3 1.8 7.5 1.6 11-1" stroke="#6b3420" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M36.5 40.6l9 2.6" stroke="#e0b25a" stroke-width="1.8" stroke-linecap="round"/>
  <ellipse cx="32" cy="20.5" rx="22" ry="4.6" fill="#1a1d22"/><path d="M20.5 20.5c-.5-6 2-11 6-12.5 2.5 1.2 8.5 1.2 11 0 4 1.5 6.5 6.5 6 12.5z" fill="#262a31"/>
  <path d="M26.5 8c2.5 2.2 8.5 2.2 11 0" stroke="#11141a" stroke-width="1.6" fill="none"/><path d="M20.6 16.2h22.8v3.6H20.6z" fill="#ff4b5c"/><path d="M12 21.5c6 2 34 2 40 0" stroke="#3a3f47" stroke-width="1" fill="none"/>`,
 boei:'<circle cx="32" cy="32" r="25" fill="#ff4b5c"/><g fill="#f4f1ea"><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(90 32 32)"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(180 32 32)"/><path d="M32 7a25 25 0 0 1 17.7 7.3L40.5 23.5A12 12 0 0 0 32 20z" transform="rotate(270 32 32)"/></g><circle cx="32" cy="32" r="12" fill="#07131c"/><circle cx="32" cy="32" r="18.5" fill="none" stroke="#f5c542" stroke-width="1.6" stroke-dasharray="4 3"/>'};
const vdSvg=(id,v)=>`<svg viewBox="0 0 64 64" aria-hidden="true">${id==='vis'?vdFishSvg(v):VD_IC[id]||''}</svg>`;
const VD_PLATE={koffer:'hi',boot:'hi',hengel:'hi'};
function vdCellHtml(x,fs,bet){const fish=x.s===VISD.VIS,id=x.sc?'boei':x.w?'visdief':VISD.SYMS[x.s].id;
 const cls='vd-cell'+(x.sc?' sc':'')+(x.w?' wild':'')+(fish?' fish':'')+(VD_PLATE[id]?' hi':'')+(fish&&fs&&x.v>=50?' rich':'');
 return `<div class="${cls}">${vdSvg(id,fs?x.v:0)}${x.w?'<span class="vd-lb">Visdief</span>':x.sc?'<span class="vd-lb sc">Bonus</span>':''}${fs&&fish&&x.v?`<b class="vd-tag">${vdShort(x.v*(bet||vd.bet||vdBet()))}</b>`:''}</div>`}
function vdDemo(){const ids=[[0,5,8,3],[1,6,3,7],[8,7,2,0],[4,0,5,6],[2,8,1,4]];return ids.map(col=>col.map(s=>({s,v:s===VISD.VIS?10:0})))}
function vdRand(fs,lvl,rd){const x=VISD.fill(Math.random,!!fs,false,0,lvl||0,rd||0)[0][0];return x.sc?{s:0}:x}
function vdReelsHtml(g,fs){return g.map((col,c)=>`<div class="vd-reel" data-c="${c}"><div class="vd-strip" style="--n:${VISD.ROWS}">${col.map(x=>vdCellHtml(x,fs)).join('')}</div></div>`).join('')}
const vdCellEl=(c,r)=>{const re=document.querySelectorAll('#vdReels .vd-reel')[c];return re?re.querySelectorAll('.vd-cell')[r]:null};
// Havensilhouet bovenaan: kranen, containers en lampen. De naam staat op een container.
const VD_SKY=`<svg class="vd-sky" viewBox="0 0 900 90" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
 <circle cx="780" cy="30" r="17" fill="#f4e3b5" opacity=".9"/><circle cx="772" cy="26" r="17" fill="#0c1a24" opacity=".25"/>
 <g fill="#0f212d"><path d="M40 90V30h6v60zM20 30h120v5H20zM120 35l-6 20h3l6-20zM100 30L46 8v4l50 18z"/><path d="M590 90V22h6v68zM560 22h140v5H560zM680 27l-5 22h3l5-22zM650 22L596 2v4l50 16z"/>
  <rect x="160" y="62" width="90" height="28"/><rect x="250" y="70" width="70" height="20"/><rect x="470" y="58" width="80" height="32"/><rect x="700" y="66" width="120" height="24"/><rect x="820" y="56" width="80" height="34"/></g>
 <g fill="#13303f"><rect x="330" y="50" width="130" height="40"/></g>
 <text x="395" y="80" text-anchor="middle" class="vd-sign">VISDIEF</text>
 <g fill="#ff9a3c"><circle cx="210" cy="58" r="2.6"/><circle cx="520" cy="54" r="2.6"/><circle cx="740" cy="62" r="2.6"/></g>
 <g stroke="#ff9a3c" stroke-width="1" opacity=".35"><path d="M210 58v32M520 54v36M740 62v28"/></g></svg>`;

function vdInfo(){const fs=vd.fs,pend=window.slotPending||0;
 return `<div class="kk-bal"><span class="label">Saldo</span><b id="vdBal">${fmt(S.cash-pend+(vd.shown||0))}</b></div>
  <div class="kk-stat"><span class="label">Deze spin</span><b id="vdStep" class="acc">${fmt(vd.stepWin)}</b></div>
  <div class="kk-stat"><span class="label">${fs?'Bonuswinst':'Laatste winst'}</span><b id="vdLast" class="grn">${fmt(fs?fs.total:vd.lastWin)}</b></div>
  ${fs?`<div class="kk-stat fsb"><span class="label">Free spins</span><b id="vdMsg">${fs.at} / ${fs.of}</b></div>`:`<div class="kk-stat"><span class="label">Status</span><b id="vdMsg" class="sm">${vd.msg}</b></div>`}`}
// Vangstmeter in de bonus: ronde, multiplier en hoeveel Visdieven je nog nodig hebt voor de volgende ronde
function vdFsBar(){const f=vd.fs;if(!f)return '';const P=VISD.PER_LEVEL,top=f.lvl>=VISD.MULTS.length-1,next=(f.lvl+1)*P,have=Math.max(0,Math.min(P,f.caught-f.lvl*P)),sec=!top&&f.caught>=next,extra=sec?f.caught-next:0;
 const hook='<svg viewBox="0 0 24 24"><path d="M13 3v11a5 5 0 0 1-10 0v-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
 return `<div class="vd-fs${sec?' sec':''}"><div class="vd-round"><span>Ronde</span><b>${f.lvl+1}</b></div>
  <div class="vd-hooks">${Array.from({length:P},(_,i)=>`<i class="${top||i<have?'on':''}">${top||i<have?vdSvg('visdief'):hook}</i>`).join('')}</div>
  <p class="vd-next">${top?'Laatste ronde: alles telt ×10':sec?`<b>Ronde ${f.lvl+2} is binnen</b> (×${VISD.MULTS[f.lvl+1]})${extra?`, ${extra} extra voor ronde ${f.lvl+3}`:''}. Deze ronde speelt eerst uit.`:`Nog ${next-f.caught} Visdie${next-f.caught===1?'f':'ven'} voor <b>ronde ${f.lvl+2}</b>: ${VISD.RETRIG} spins met ×${VISD.MULTS[f.lvl+1]}${f.lvl?'. Deze zijn lastiger.':''}`}</p>
  <div class="vd-mult${f.lvl?' up':''}"><span>Multiplier</span><b>×${VISD.MULTS[f.lvl]}</b></div></div>`}
function vdSubHtml(){return vd.fs?'':`${isVip()?'<i class="vipt">VIP</i>':''}${isVip()?'Bonus ±1 op 140, vaker een Visdief':'Bonus ±1 op 150'}, 20 lijnen`}
function vdControls(){const b=vdBet();return `<div class="kk-betbox"><span class="label">Inzet</span>
   <div class="kk-bet"><button onclick="vdStepBet(-1)" ${vd.busy?'disabled':''} aria-label="Lagere inzet">−</button><button class="kk-betv" onclick="vd.pick=!vd.pick;vd.confirm=false;vdRefresh()" ${vd.busy?'disabled':''} aria-label="Inzet kiezen">${fmt(b)}</button><button onclick="vdStepBet(1)" ${vd.busy?'disabled':''} aria-label="Hogere inzet">+</button></div></div>
   <button class="btn kk-go" onclick="act.vdSpin(false)" ${vd.busy||inJail()?'disabled':''}>${vd.busy?'Bezig…':'Draaien'}<small>spatie</small></button>
   <div class="kk-small"><button class="btn ghost sm vd-turbo ${vd.turbo?'on':''}" onclick="vdTurbo()" aria-pressed="${vd.turbo}">${vd.turbo?'Snel: aan':'Snel: uit'}</button>
    <button class="btn ghost sm" onclick="vd.confirm=true;vd.pick=false;vdRefresh()" ${vd.busy||inJail()?'disabled':''}>Bonus kopen</button></div>`}
function vdPickHtml(){return `<div class="kk-pick"><div class="kk-pick-h"><b>Kies je inzet${isHighRoller()?' <i class="vipt" style="margin-left:6px">HIGH ROLLER</i>':''}</b><button class="btn ghost sm" onclick="vd.pick=false;vdRefresh()">Sluiten</button></div>
  <div class="kk-pick-g">${kkBets().map((v,i)=>`<button class="${i===vd.bi?'on':''} ${S.cash<v?'no':''}" onclick="vdSetBet(${i})">${fmt(v)}</button>`).join('')}</div>
  <div class="kk-pick-q"><button class="btn ghost sm" onclick="vdSetBet(0)">Min · ${fmt(kkBets()[0])}</button><button class="btn sm" onclick="vdSetBet(kkBets().length-1)">Max · ${fmt(kkBets()[kkBets().length-1])}</button></div></div>`}
function vdConfirm(){const b=vdBet(),buy=b*VISD.BUY_COST;return `<div class="kk-confirm"><div><b>Bonus kopen voor ${fmt(buy)}?</b>
  <span>Dat is ${VISD.BUY_COST}× je inzet van ${fmt(b)}. Je krijgt direct ${VISD.FS_BY_SC[3]} free spins. Gemiddeld levert hij iets minder op dan hij kost (±96%). De meeste bonussen zijn klein; ronde 2 haal je ongeveer 1 op 10 keer, ronde 4 (×10) ongeveer 1 op 430.</span></div>
  <div class="flex"><button class="btn sm" onclick="act.vdSpin(true)" ${S.cash<buy?'disabled':''}>${S.cash<buy?'Te weinig geld':'Kopen'}</button><button class="btn ghost sm" onclick="vd.confirm=false;vdRefresh()">Annuleren</button></div></div>`}
function vdSeed(){if(!S.vdSeed||!S.vdSeed.s)S.vdSeed=kkNewSd(S.vdSeed&&S.vdSeed.prev);return S.vdSeed}
function vdSeedHtml(){const sd=vdSeed(),p=sd.prev;
 return `<div class="kk-seed"><div class="kk-seed-i"><span class="label">Seed</span><b>${kkSeedId(sd)}</b></div>
  <div class="kk-seed-i"><span class="label">Op deze seed</span><b>${sd.spins} spin${sd.spins===1?'':'s'}, ${sd.bon} bonus${sd.bon===1?'':'sen'}</b></div>
  ${p?`<div class="kk-seed-i prev"><span class="label">Vorige seed</span><b>${p.id}: ${p.spins} spins, ${p.bon} bonus${p.bon===1?'':'sen'}</b></div>`:''}
  <button class="btn ghost sm" onclick="act.vdNewSeed()" ${vd.busy?'disabled':''}>Nieuwe seed</button></div>`}
// Uitbetaling + de 10 lijnen als kleine kaartjes
function vdPayTab(){const b=vdBet(),k=VISD.PAYK/VISD.LINES.length;
 const rows=VISD.SYMS.slice().reverse().map(s=>`<div class="vd-pt"><span>${vdSvg(s.id,s.id==='vis'?10:0)}</span><div>${[2,1,0].map(i=>`<p><i>${i+3}</i>${fmt(s.pay[i]*k*b)}</p>`).join('')}</div></div>`).join('');
 const lines=VISD.LINES.map((L,i)=>`<div class="vd-ln" style="--lc:${VD_LC[i%VD_LC.length]}"><svg viewBox="0 0 50 40" aria-hidden="true"><g fill="#1b2a33">${[0,1,2,3,4].map(c=>[0,1,2,3].map(r=>`<rect x="${c*10+1}" y="${r*10+1}" width="8" height="8" rx="1.5"/>`).join('')).join('')}</g><polyline points="${L.map((r,c)=>(c*10+5)+','+(r*10+5)).join(' ')}"/></svg></div>`).join('');
 const fish=VISD.FISH.map(([v])=>`<i style="--fc:${vdTier(v)[0]}">${vdShort(v*b)}</i>`).join('');
 return `<div class="vd-pay-g"><div><h3 class="vd-h">Uitbetaling per lijn bij ${fmt(b)} inzet</h3><p class="vd-p">3, 4 of 5 dezelfde van links naar rechts. In de bonus telt de multiplier ook voor lijnwinst.</p><div class="vd-ptab">${rows}</div></div>
  <div><h3 class="vd-h">De 20 lijnen</h3><div class="vd-lns">${lines}</div>
  <h3 class="vd-h" style="margin-top:18px">Waarde van een vis in de bonus</h3><div class="vd-fishv">${fish}</div></div></div>`}
function visView(){const g=vd.grid||vdDemo(),fs=vd.fs;
 return `<div class="kk kk3 vd ${fs?'is-fs':''}">
 <div class="kk-stage vd-stage" id="vdStage">
  <div class="vd-board" id="vdBoard">${VD_SKY}<button class="kk-snd vd-snd" onclick="SFX.toggle();this.textContent=SFX.on?'🔊':'🔇'" aria-label="Geluid aan of uit">${SFX.on?'🔊':'🔇'}</button><span id="vdSub" class="vd-sub">${vdSubHtml()}</span>
   <div id="vdFs">${vdFsBar()}</div>
   <div class="vd-deck"><div class="vd-reelwrap"><div class="vd-reels" id="vdReels">${vdReelsHtml(g,!!fs)}</div><svg class="vd-lines" id="vdLines" viewBox="0 0 500 ${VISD.ROWS*100}" preserveAspectRatio="none"></svg><div class="vd-fx" id="vdFx"></div></div></div>
   <div class="vd-tick" id="vdTick">${vd.tick||(fs?'De Visdief pakt alles wat op het scherm ligt':'3 boeien geven de bonus. In de bonus pakt de Visdief alle vissen.')}</div>
   <div id="vdBanner"></div></div>
  <div class="kk-bar"><div class="kk-hud" id="vdInfo">${vdInfo()}</div><div class="kk-ctl" id="vdCtl">${vdControls()}</div></div>
  <div id="vdPickBox">${vd.pick&&!vd.busy?vdPickHtml():''}</div>
  <div id="vdConfirmBox">${vd.confirm&&!vd.busy?vdConfirm():''}</div>
  <div id="vdSeedBox">${vdSeedHtml()}</div>
 </div>
 <section class="card kk-pay vd-pay"><div id="vdPayTab">${vdPayTab()}</div>
  <div class="kk-rules">
   <div><span>${vdSvg('boei')}</span><p><b>3 boeien</b> geven ${VISD.FS_BY_SC[3]} free spins, 4 geven ${VISD.FS_BY_SC[4]} en 5 geven ${VISD.FS_BY_SC[5]}. Meer boeien betekent een langere bonus en meer kans op de max win.</p></div>
   <div><span>${vdSvg('vis',50)}</span><p><b>Vissen</b> hebben in de bonus een geldwaarde. Ze leveren alleen iets op als er een Visdief op het scherm staat.</p></div>
   <div><span>${vdSvg('visdief')}</span><p><b>De Visdief</b> valt alleen in de bonus. Hij vervangt elk symbool en pakt het geld van alle vissen; twee pakken alles twee keer. Een ronde speelt altijd helemaal uit. Heb je er dan ${VISD.PER_LEVEL}, dan volgt ronde 2: ${VISD.RETRIG} spins waarin alles ×2 telt. Bij ${VISD.PER_LEVEL*2} volgt ronde 3 (×3), bij ${VISD.PER_LEVEL*3} ronde 4 (×10). Extra Visdieven tellen door voor de volgende ronde. Elke volgende ${VISD.PER_LEVEL} zijn lastiger te vangen, maar in hogere rondes zwemmen er vaker grote vissen.</p></div>
   <div><span class="kk-mini key">␣</span><p><b>Spatiebalk</b> draait. De max win is ${VISD.MAX_WIN.toLocaleString('nl-NL')}× je inzet: daarvoor moet je ×10 halen en grote vissen vangen.${isVip()?' Als <b>VIP</b> kom je vaker in de bonus en valt de Visdief er iets vaker.':''}</p></div>
  </div></section></div>`}
function vdRefresh(){const root=document.querySelector('.vd');if(!root)return;root.classList.toggle('is-fs',!!vd.fs);
 const set=(id,h)=>{const e=vdEl(id);if(e)e.innerHTML=h};
 set('vdSub',vdSubHtml());set('vdInfo',vdInfo());set('vdCtl',vdControls());set('vdFs',vdFsBar());
 set('vdPickBox',vd.pick&&!vd.busy?vdPickHtml():'');set('vdConfirmBox',vd.confirm&&!vd.busy?vdConfirm():'');set('vdSeedBox',vdSeedHtml());set('vdPayTab',vdPayTab())}
function vdStepBet(d){if(vd.busy)return;vd.bi=Math.max(0,Math.min(kkBets().length-1,vd.bi+d));vd.confirm=false;SFX.chip();vdRefresh()}
function vdSetBet(i){if(vd.busy)return;vd.bi=Math.max(0,Math.min(kkBets().length-1,i));vd.pick=false;vd.confirm=false;SFX.chip();vdRefresh()}
function vdTurbo(){vd.turbo=!vd.turbo;SFX.click();document.querySelectorAll('.vd-turbo').forEach(b=>{b.textContent=vd.turbo?'Snel: aan':'Snel: uit';b.classList.toggle('on',vd.turbo);b.setAttribute('aria-pressed',vd.turbo)})}
function vdText(id,v){const e=vdEl(id);if(e)e.textContent=v}
function vdTick(t){vd.tick=t;const e=vdEl('vdTick');if(e){e.innerHTML=t;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}}
function vdCount(id,from,to,ms){const el=vdEl(id);if(!el||!vdOn()){if(el)el.textContent=fmt(to);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const st=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(st);else res()};requestAnimationFrame(st)})}
function vdBanner(big,small,ms,cls){const el=vdEl('vdBanner');if(el)el.innerHTML=`<div class="kk-banner ${cls||''}"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return vdWait(ms||1400).then(()=>{const e=vdEl('vdBanner');if(e)e.innerHTML=''})}
function vdShowBal(add){vd.shown=(vd.shown||0)+add;vdText('vdBal',fmt(S.cash-(window.slotPending||0)+vd.shown))}
// Rollen draaien: een korte aanloop omhoog, vaart (met bewegingsonscherpte) en een stuiter bij het stoppen.
// Liggen er al 2 boeien, dan draaien de volgende rollen langer en lichten ze op.
async function vdSpinReels(g,fs,lvl,rd){const reels=[...document.querySelectorAll('#vdReels .vd-reel')];const T=vdT();
 if(!reels.length||!vdOn()){vd.grid=g;return}
 const cur=vd.grid||vdDemo();let sc=0,delay=0,maxT=0,heard=0;const anims=[];
 reels.forEach((el,c)=>{const tease=!fs&&sc>=2;if(tease)delay+=T.tease;const R=VISD.ROWS,F=8+c*3+(tease?10:0),n=F+2*R,strip=el.querySelector('.vd-strip');
  strip.getAnimations().forEach(a=>a.cancel());
  strip.style.setProperty('--n',n);strip.innerHTML=[...g[c],...Array.from({length:F},()=>vdRand(fs,lvl,rd)),...cur[c]].map(x=>vdCellHtml(x,fs)).join('');
  const cell=100/n,S0=-(F+R)*cell,dur=T.spin+c*T.stag+delay;maxT=Math.max(maxT,dur);
  strip.style.transform='translateY(0%)';el.classList.toggle('tease',tease);
  const kf=vdReduce()?[{transform:`translateY(${S0}%)`},{transform:'translateY(0%)'}]:[
   {transform:`translateY(${S0}%)`,filter:'blur(0px)',easing:'ease-out'},
   {transform:`translateY(${S0-.22*cell}%)`,filter:'blur(0px)',offset:.08,easing:'cubic-bezier(.55,0,1,.6)'},
   {transform:`translateY(${S0*.55}%)`,filter:'blur(2px)',offset:.42,easing:'cubic-bezier(0,.25,.35,1)'},
   {transform:`translateY(${.16*cell}%)`,filter:'blur(0px)',offset:.9,easing:'ease-in-out'},
   {transform:'translateY(0%)',filter:'blur(0px)'}];
  anims.push(strip.animate(kf,{duration:dur,fill:'both'}));
  const scHere=g[c].filter(x=>x.sc).length;
  setTimeout(()=>{el.classList.remove('tease');el.classList.add('stop');setTimeout(()=>el.classList.remove('stop'),260);SFX.tick();if(scHere){SFX.scatter(heard);heard+=scHere;el.classList.add('scland')}},dur*.93);
  if(tease)setTimeout(()=>SFX.tease&&SFX.tease(sc,Math.min(1.2,T.tease/1000)),Math.max(0,dur-T.tease));
  sc+=scHere});
 await vdWait(maxT+60);
 reels.forEach((el,c)=>{const strip=el.querySelector('.vd-strip');strip.getAnimations().forEach(a=>a.cancel());strip.style.transform='none';strip.style.setProperty('--n',VISD.ROWS);strip.innerHTML=g[c].map(x=>vdCellHtml(x,fs)).join('');el.classList.remove('scland','tease')});
 vd.grid=g}
function vdLineSvg(w,draw){const L=VISD.LINES[w.line],pts=['0,'+(L[0]*100+50)].concat(L.map((r,c)=>(c*100+50)+','+(r*100+50)),['500,'+(L[4]*100+50)]).join(' ');
 return `<polyline class="glow" points="${pts}" style="--lc:${VD_LC[w.line]}" pathLength="100"/><polyline class="${draw?'draw':''}" points="${pts}" style="--lc:${VD_LC[w.line]}" pathLength="100"/>`}
const vdSymName=(w)=>{const s=VISD.SYMS[w.sym].n.toLowerCase();return w.n+'× '+s};
function vdMark(cells){const R=VISD.ROWS,hit=new Set(cells.map(([c,r])=>c*R+r));for(let c=0;c<VISD.REELS;c++)for(let r=0;r<R;r++){const e=vdCellEl(c,r);if(e){e.classList.toggle('win',hit.has(c*R+r));e.classList.toggle('dim',!hit.has(c*R+r))}}}
function vdUnmark(){document.querySelectorAll('#vdReels .vd-cell').forEach(e=>e.classList.remove('win','dim','collect','caught'));const s=vdEl('vdLines');if(s)s.innerHTML=''}
// Winlijnen: eerst alle lijnen tegelijk (getekend als vislijn), daarna een voor een met het bedrag
async function vdShowWins(wins,mult,bet,stepFrom){if(!wins.length)return 0;const T=vdT();const svg=vdEl('vdLines');
 vdMark(wins.flatMap(w=>w.cells));
 if(svg)svg.innerHTML=wins.map(w=>vdLineSvg(w,true)).join('');
 const add=wins.reduce((a,w)=>a+w.pay,0)*mult*bet;SFX.win(Math.min(6,wins.length+1));
 vdTick(wins.length>1?`${wins.length} lijnen winnen samen <b>${fmt(add)}</b>${mult>1?' (×'+mult+')':''}`:`${vdSymName(wins[0])}: <b>${fmt(add)}</b>${mult>1?' (×'+mult+')':''}`);
 vdCount('vdStep',stepFrom,stepFrom+add,T.hold*.7);vdShowBal(add);
 await vdWait(T.hold);
 if(T.line&&wins.length>1)for(const w of wins.slice(0,5)){if(!vdOn())break;
  vdMark(w.cells);if(svg)svg.innerHTML=vdLineSvg(w,false);vdTick(`${vdSymName(w)}: <b>${fmt(w.pay*mult*bet)}</b>`);await vdWait(T.line)}
 vdUnmark();return add}
// De Visdief pakt alle vissen: de prijskaartjes vliegen naar hem toe
async function vdCollect(s,bet,stepFrom){const board=vdEl('vdReels');if(!s.wilds||!s.fish.length)return 0;const T=vdT();
 const wild=[];s.grid.forEach((col,c)=>col.forEach((x,r)=>{if(x.w)wild.push([c,r])}));
 const add=s.collect*bet;if(!board||!vdOn())return add;
 const fx=vdEl('vdFx'),br=fx.getBoundingClientRect();const ctr=(c,r)=>{const e=vdCellEl(c,r);if(!e)return [0,0];const q=e.getBoundingClientRect();return [q.left-br.left+q.width/2,q.top-br.top+q.height/2]};
 wild.forEach(([c,r])=>vdCellEl(c,r)?.classList.add('collect'));s.fish.forEach(([c,r])=>vdCellEl(c,r)?.classList.add('caught'));
 vdTick(`${wild.length>1?wild.length+' Visdieven pakken':'De Visdief pakt'} ${s.fish.length} vis${s.fish.length>1?'sen':''}`);
 SFX.bonus();await vdWait(T.collect*.5);let got=0;
 for(const [wc,wr] of wild){const [tx,ty]=ctr(wc,wr);
  s.fish.forEach(([c,r,v],i)=>{const [x,y]=ctr(c,r);const d=document.createElement('div');d.className='vd-chip';d.textContent=vdShort(v*bet*s.mult);d.style.left=x+'px';d.style.top=y+'px';fx.appendChild(d);
   setTimeout(()=>{d.style.transform=`translate(calc(-50% + ${tx-x}px),calc(-50% + ${ty-y}px)) scale(.55)`;d.style.opacity='0'},40+i*70);setTimeout(()=>d.remove(),T.collect+i*70+200)});
  const part=s.fish.reduce((a,f)=>a+f[2],0)*s.mult*bet;setTimeout(()=>{SFX.win(4);vdCellEl(wc,wr)?.classList.add('gulp');setTimeout(()=>vdCellEl(wc,wr)?.classList.remove('gulp'),300)},T.collect*.85);
  vdCount('vdStep',stepFrom+got,stepFrom+got+part,T.collect);vdShowBal(part);got+=part;
  await vdWait(T.collect+s.fish.length*70)}
 const p=document.createElement('div');p.className='kk-pop vd-pop';const [px,py]=ctr(wild[0][0],wild[0][1]);p.style.left=px+'px';p.style.top=py+'px';p.innerHTML=fmt(add)+(s.mult>1?`<small>×${s.mult}</small>`:'');fx.appendChild(p);setTimeout(()=>p.remove(),1500);
 vdTick(`Gevangen: <b>${fmt(add)}</b>${s.mult>1?' (×'+s.mult+')':''}`);
 await vdWait(T.hold*.6);vdUnmark();return add}
async function vdPlay(round,bet,isBuy){const T=vdT();vd.stepWin=0;vdText('vdStep',fmt(0));
 if(!isBuy){vdText('vdMsg','Draait…');vdTick('&nbsp;');await vdSpinReels(round.base.grid,false,0);if(round.base.wins.length){await vdShowWins(round.base.wins,1,bet,0)}else if(!round.fs)vdTick(round.base.sc===2?'Twee boeien, net niet':'Geen winst')}
 else{vdText('vdMsg','Bonus gekocht');vdTick('Bonus gekocht');await vdSpinReels(round.base.grid,false,0)}
 const baseWin=round.base.win*bet;if(!isBuy&&baseWin>0){vd.lastWin=baseWin;vdText('vdLast',fmt(baseWin))}
 if(round.fs){const n=round.base.sc;document.querySelectorAll('#vdReels .vd-cell.sc').forEach(e=>e.classList.add('win'));SFX.bonus();vdTick(n+' boeien: bonus!');await vdWait(T.hold*.9);vdUnmark();
  await vdBanner(round.fsStart+' free spins',n+' boeien. De Visdief pakt alle vissen.',2200,'fsin');
  vd.fs={at:0,of:round.fsStart,total:0,caught:0,lvl:0};vdRefresh();let at=0,wasSec=false;
  for(let i=0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];
   if(s.newRound){vd.fs.lvl=s.lvl;wasSec=false;at=0;const fb=vdEl('vdFs');if(fb)fb.innerHTML=vdFsBar();SFX.big();
    await vdBanner('Ronde '+s.newRound,VISD.RETRIG+' free spins. Alles telt nu ×'+VISD.MULTS[s.lvl]+'.',2200,s.lvl>=3?'big gold':'fsin');vd.fs.of=VISD.RETRIG}
   at++;vd.fs.at=at;vd.fs.of=at+s.left;vdText('vdMsg',at+' / '+vd.fs.of);vd.stepWin=0;vdText('vdStep',fmt(0));SFX.spin();
   await vdSpinReels(s.grid,true,Math.min(VISD.MULTS.length-1,Math.floor((s.caught-s.wilds)/VISD.PER_LEVEL)),s.lvl);let step=0;
   if(s.wins.length)step+=await vdShowWins(s.wins,s.mult,bet,step);
   if(s.wilds&&s.fish.length)step+=await vdCollect(s,bet,step);
   else if(s.wilds){SFX.lose();document.querySelectorAll('#vdReels .vd-cell.wild').forEach(e=>e.classList.add('win'));vdTick(s.wilds>1?s.wilds+' Visdieven, maar geen vis':'Visdief, maar geen vis');await vdWait(T.hold*.5);vdUnmark()}
   else if(!s.wins.length)vdTick(s.fish.length?'Vissen, maar geen Visdief':'Niets gevangen');
   vd.fs.total=s.total*bet;vd.fs.caught=s.caught;vdText('vdLast',fmt(vd.fs.total));const fb=vdEl('vdFs');if(fb)fb.innerHTML=vdFsBar();
   if(s.secured&&!wasSec){wasSec=true;SFX.bonus();vdTick(`<b>Ronde ${s.lvl+2} is binnen</b>: na deze ronde nog ${VISD.RETRIG} spins met ×${VISD.MULTS[s.lvl+1]}`);await vdWait(T.hold*.8)}
   if(s.total>=VISD.MAX_WIN){SFX.big();await vdBanner('Max win',VISD.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   await vdWait(vdFast()?100:280)}
  const x=round.fs.total;if(x>=20)SFX.big();
  await vdBanner(fmt(x*bet),(x>=VISD.MAX_WIN?'Max win, ':x>=200?'Episch, ':x>=100?'Megawinst, ':x>=40?'Grote vangst, ':'Bonus voorbij, ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2600,x>=40?'big':'');
  vd.fs=null;vdRefresh();vdTick(`Bonus voorbij: <b>${fmt(x*bet)}</b>`)}
 else{const x=round.total;if(x>=20){SFX.big();await vdBanner(fmt(x*bet),(x>=100?'Megawinst':'Grote winst')+', '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2000,'big')}else if(x===0)SFX.lose()}}
document.addEventListener('keydown',e=>{if(e.code!=='Space'||page!=='casino'||casinoTab!=='vis'||window.__chase)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!$('#modal').hidden)return;
 e.preventDefault();if(!vd.busy)act.vdSpin(false)});
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
