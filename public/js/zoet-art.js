// Zoete Buit: de snoepjes, de lolly, de kauwgomballen en de illustratie voor de lobby en de website.
// Eigen tekeningen (SVG). Kleurverlopen staan één keer in een onzichtbaar blad, zodat elk snoepje ze kan gebruiken.
window.ZBA=(()=>{
const DEFS=`<defs>
 <linearGradient id="zbg-drop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b3f66"/><stop offset=".5" stop-color="#26172b"/><stop offset="1" stop-color="#0c060e"/></linearGradient>
 <radialGradient id="zbg-zuur" cx="38%" cy="32%" r="72%"><stop offset="0" stop-color="#fff6b0"/><stop offset=".45" stop-color="#ffc93a"/><stop offset="1" stop-color="#ff8a12"/></radialGradient>
 <linearGradient id="zbg-wrap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7ab8"/><stop offset="1" stop-color="#d93a86"/></linearGradient>
 <linearGradient id="zbg-spek" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ffe3f0"/></linearGradient>
 <linearGradient id="zbg-spekr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ccb"/><stop offset="1" stop-color="#ff4f9a"/></linearGradient>
 <clipPath id="zbc-spek"><rect x="9" y="20" width="46" height="24" rx="12" transform="rotate(-28 32 32)"/></clipPath>
 <radialGradient id="zbg-beer" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#c8ff9c"/><stop offset=".5" stop-color="#5fe063"/><stop offset="1" stop-color="#1c9a3c"/></radialGradient>
 <clipPath id="zbc-stok"><rect x="27" y="2" width="11" height="60" rx="5.5" transform="rotate(32 32 32)"/></clipPath>
 <radialGradient id="zbg-bon" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#c47a4a"/><stop offset=".55" stop-color="#7a3e1e"/><stop offset="1" stop-color="#3a1a0b"/></radialGradient>
 <linearGradient id="zbg-cup" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6fae"/><stop offset="1" stop-color="#c9216e"/></linearGradient>
 <radialGradient id="zbg-deeg" cx="45%" cy="35%" r="75%"><stop offset="0" stop-color="#ffd89a"/><stop offset="1" stop-color="#c7782f"/></radialGradient>
 <radialGradient id="zbg-glazuur" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#ffc4e2"/><stop offset=".6" stop-color="#ff6fb4"/><stop offset="1" stop-color="#e2338c"/></radialGradient>
 <radialGradient id="zbg-wafel" cx="42%" cy="35%" r="75%"><stop offset="0" stop-color="#ffd27e"/><stop offset=".7" stop-color="#d98c35"/><stop offset="1" stop-color="#a65e1c"/></radialGradient>
 <linearGradient id="zbg-glas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe8ff" stop-opacity=".35"/><stop offset=".2" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#d6f0ff" stop-opacity=".1"/><stop offset="1" stop-color="#9fd6ff" stop-opacity=".35"/></linearGradient>
 <linearGradient id="zbg-goud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a6"/><stop offset=".45" stop-color="#ffc93a"/><stop offset="1" stop-color="#c7860c"/></linearGradient>
 <clipPath id="zbc-wafel"><circle cx="32" cy="31" r="22.5"/></clipPath>
 <clipPath id="zbc-pot"><path d="M12 24h40v28a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z"/></clipPath>
 <clipPath id="zbc-lolly"><circle cx="32" cy="26" r="21"/></clipPath>
 <radialGradient id="zbg-gb0" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#d4f4ff"/><stop offset=".45" stop-color="#4cc6ff"/><stop offset="1" stop-color="#1468c9"/></radialGradient>
 <radialGradient id="zbg-gb1" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f2dcff"/><stop offset=".45" stop-color="#b072ff"/><stop offset="1" stop-color="#5b23c2"/></radialGradient>
 <radialGradient id="zbg-gb2" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffe0ee"/><stop offset=".45" stop-color="#ff4f9a"/><stop offset="1" stop-color="#b3125c"/></radialGradient>
 <radialGradient id="zbg-gb3" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff8cc"/><stop offset=".45" stop-color="#ffc93a"/><stop offset="1" stop-color="#c77a00"/></radialGradient>
 <linearGradient id="zbg-gb4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f9a"/><stop offset=".25" stop-color="#ffc93a"/><stop offset=".5" stop-color="#5fe063"/><stop offset=".75" stop-color="#4cc6ff"/><stop offset="1" stop-color="#b072ff"/></linearGradient>
</defs>`;
// het blad met kleurverlopen één keer in de pagina zetten (niet display:none, anders tekenen sommige browsers de verlopen niet)
function inject(){if(document.getElementById('zbDefs'))return;const d=document.createElement('div');d.id='zbDefs';d.setAttribute('aria-hidden','true');
 d.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';d.innerHTML=`<svg width="0" height="0" focusable="false">${DEFS}</svg>`;document.body.appendChild(d)}
if(document.body)inject();else document.addEventListener('DOMContentLoaded',inject);
const IC={
 // Drop: zwarte ruit met zoutkorrels
 drop:`<path d="M32 5L58 32 32 59 6 32z" fill="url(#zbg-drop)"/><path d="M32 5L58 32H32z" fill="#fff" opacity=".07"/>
  <path d="M32 12L51 32 32 52 13 32z" fill="none" stroke="#8a62a0" stroke-width="1.6" opacity=".6"/><path d="M18 29L29 17" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".38"/>
  <g fill="#fff"><circle cx="25" cy="33" r="1.9" opacity=".85"/><circle cx="37" cy="24" r="1.5" opacity=".75"/><circle cx="40" cy="38" r="1.7" opacity=".7"/><circle cx="31" cy="44" r="1.3" opacity=".6"/><circle cx="33" cy="31" r="1.1" opacity=".55"/></g>`,
 // Zuurtje: rond snoepje in een roze papiertje met gedraaide puntjes
 zuurtje:`<path d="M15 32L3 21l3.5 11L3 43z" fill="url(#zbg-wrap)"/><path d="M49 32l12-11-3.5 11L61 43z" fill="url(#zbg-wrap)"/>
  <path d="M6 24l7 6M6 40l7-6M58 24l-7 6M58 40l-7-6" stroke="#ffd1e6" stroke-width="1.4" opacity=".7"/>
  <ellipse cx="32" cy="32" rx="19" ry="16.5" fill="url(#zbg-zuur)"/><path d="M21 21c5 6 5 16 0 22M43 21c-5 6-5 16 0 22" stroke="#fff" stroke-width="2.2" fill="none" opacity=".5"/>
  <ellipse cx="26" cy="24" rx="6" ry="3.2" fill="#fff" opacity=".7" transform="rotate(-20 26 24)"/>`,
 // Spekje: gedraaid roze-wit
 spek:`<rect x="9" y="20" width="46" height="24" rx="12" fill="url(#zbg-spek)" transform="rotate(-28 32 32)"/>
  <g clip-path="url(#zbc-spek)" fill="url(#zbg-spekr)"><path d="M2 46L18 8h8L10 46zM18 52L34 14h8L26 52zM34 58L50 20h8L42 58z"/></g>
  <rect x="9" y="20" width="46" height="24" rx="12" fill="none" stroke="#e8498f" stroke-width="1.2" opacity=".55" transform="rotate(-28 32 32)"/>
  <path d="M17 30c6-5 16-10 26-13" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
 // Gombeer: groene gummybeer
 gombeer:`<circle cx="22" cy="11" r="5" fill="url(#zbg-beer)"/><circle cx="42" cy="11" r="5" fill="url(#zbg-beer)"/><circle cx="32" cy="19" r="12" fill="url(#zbg-beer)"/>
  <ellipse cx="18" cy="35" rx="5" ry="7" fill="url(#zbg-beer)" transform="rotate(25 18 35)"/><ellipse cx="46" cy="35" rx="5" ry="7" fill="url(#zbg-beer)" transform="rotate(-25 46 35)"/>
  <ellipse cx="32" cy="41" rx="13" ry="15" fill="url(#zbg-beer)"/><ellipse cx="22" cy="56" rx="6" ry="5" fill="url(#zbg-beer)"/><ellipse cx="42" cy="56" rx="6" ry="5" fill="url(#zbg-beer)"/>
  <ellipse cx="32" cy="43" rx="7" ry="8" fill="#c8ff9c" opacity=".35"/><circle cx="27.5" cy="18" r="1.6" fill="#0f5a22"/><circle cx="36.5" cy="18" r="1.6" fill="#0f5a22"/>
  <ellipse cx="32" cy="23" rx="3" ry="2" fill="#0f5a22" opacity=".55"/><ellipse cx="27" cy="12" rx="4" ry="2.2" fill="#fff" opacity=".55"/><ellipse cx="25" cy="34" rx="2.5" ry="5" fill="#fff" opacity=".35"/>`,
 // Zuurstok: rechte stok met rode streep
 zuurstok:`<rect x="27" y="2" width="11" height="60" rx="5.5" fill="#fff" transform="rotate(32 32 32)"/>
  <g clip-path="url(#zbc-stok)"><path d="M-10 18L40-10l4 7L-6 25zM-6 32L44 4l4 7L-2 39zM-2 46L48 18l4 7L2 53zM2 60L52 32l4 7L6 67zM6 74L56 46l4 7L10 81z" fill="#ff3b5c"/></g>
  <rect x="27" y="2" width="11" height="60" rx="5.5" fill="none" stroke="#c81e3f" stroke-width="1.1" opacity=".5" transform="rotate(32 32 32)"/>
  <path d="M20 54L44 14" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6"/>`,
 // Bonbon: chocolade met roze krul in een geplooid bakje
 bonbon:`<path d="M12 38h40l-5 18H17z" fill="url(#zbg-cup)"/><path d="M16 38l2 18M22 38l1 18M28 38v18M34 38l0 18M40 38l-1 18M46 38l-2 18" stroke="#ffa6cd" stroke-width="1.4" opacity=".7"/>
  <path d="M10 40c0-15 10-26 22-26s22 11 22 26c-7 3-15 4-22 4s-15-1-22-4z" fill="url(#zbg-bon)"/>
  <path d="M19 28c4-4 9-3 11 1s7 4 10 0" stroke="#ff8cc6" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M19 22c3-4 7-6 11-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>
  <circle cx="32" cy="12" r="3.6" fill="#ff3b5c"/><circle cx="31" cy="11" r="1.2" fill="#fff" opacity=".7"/>`,
 // Donut: roze glazuur met spikkels
 donut:`<circle cx="32" cy="33" r="25" fill="url(#zbg-deeg)"/><path d="M8.5 31c0-12 10.5-22 23.5-22s23.5 10 23.5 22c-2 4-5 3-6 7-2 5-6 2-8 6-3 4-6 1-9 3-4 2-7-2-10-1-4 1-6-3-8-6-3-3-6 0-6-9z" fill="url(#zbg-glazuur)"/>
  <circle cx="32" cy="32" r="8" fill="#5a2a14"/><circle cx="32" cy="32" r="6.5" fill="#2a1408"/>
  <g stroke-width="2.6" stroke-linecap="round"><path d="M19 22l3 2" stroke="#ffe36b"/><path d="M42 18l-3 2" stroke="#5ad1ff"/><path d="M46 30l1 3" stroke="#fff"/><path d="M16 33l2-2" stroke="#5fe063"/><path d="M26 15h3" stroke="#b072ff"/><path d="M37 41l3 1" stroke="#ffe36b"/><path d="M22 40l-1 3" stroke="#5ad1ff"/><path d="M33 20l2 1" stroke="#fff"/></g>
  <ellipse cx="22" cy="17" rx="6" ry="2.6" fill="#fff" opacity=".45" transform="rotate(-25 22 17)"/>`,
 // Stroopwafel: rond met ruitjes en stroop aan de rand
 wafel:`<circle cx="32" cy="32" r="26" fill="#a65e1c"/><circle cx="32" cy="31" r="25" fill="url(#zbg-wafel)"/>
  <g clip-path="url(#zbc-wafel)" stroke="#b46a24" stroke-width="2.1" opacity=".9"><path d="M-56 0L8 64M-47 0L17 64M-38 0L26 64M-29 0L35 64M-20 0L44 64M-11 0L53 64M-2 0L62 64M7 0L71 64M16 0L80 64M25 0L89 64M34 0L98 64M43 0L107 64M52 0L116 64M61 0L125 64M-56 64L8 0M-47 64L17 0M-38 64L26 0M-29 64L35 0M-20 64L44 0M-11 64L53 0M-2 64L62 0M7 64L71 0M16 64L80 0M25 64L89 0M34 64L98 0M43 64L107 0M52 64L116 0M61 64L125 0"/></g>
  <circle cx="32" cy="31" r="25" fill="none" stroke="#7a3f0c" stroke-width="2.4"/><circle cx="32" cy="31" r="21.5" fill="none" stroke="#e8902a" stroke-width="2" opacity=".55"/>
  <path d="M9 34c6 3 12 1 17 3s10 4 14 2 12-4 15-3" stroke="#f0a43a" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".9"/>
  <ellipse cx="22" cy="17" rx="7" ry="3" fill="#fff" opacity=".35" transform="rotate(-30 22 17)"/>`,
 // Snoeppot: glazen pot vol snoep met gouden deksel
 pot:`<rect x="16" y="7" width="32" height="9" rx="3" fill="url(#zbg-goud)"/><rect x="16" y="7" width="32" height="3" rx="1.5" fill="#fff" opacity=".5"/><rect x="13" y="15" width="38" height="7" rx="2.5" fill="#d99a1c"/>
  <g clip-path="url(#zbc-pot)"><rect x="10" y="22" width="44" height="42" fill="#ffe3f0"/>
   <circle cx="18" cy="55" r="7" fill="#ff4f9a"/><circle cx="32" cy="56" r="7" fill="#4cc6ff"/><circle cx="46" cy="55" r="7" fill="#ffc93a"/><circle cx="25" cy="44" r="7" fill="#5fe063"/><circle cx="39" cy="44" r="7" fill="#b072ff"/>
   <circle cx="17" cy="32" r="6.5" fill="#ff8a12"/><circle cx="31" cy="33" r="6.5" fill="#ff3b5c"/><circle cx="45" cy="32" r="6.5" fill="#4cc6ff"/>
   <g fill="#fff" opacity=".6"><circle cx="16" cy="53" r="2"/><circle cx="30" cy="54" r="2"/><circle cx="44" cy="53" r="2"/><circle cx="23" cy="42" r="2"/><circle cx="37" cy="42" r="2"/><circle cx="15" cy="30" r="1.8"/><circle cx="29" cy="31" r="1.8"/><circle cx="43" cy="30" r="1.8"/></g></g>
  <path d="M12 24h40v28a8 8 0 0 1-8 8H20a8 8 0 0 1-8-8z" fill="url(#zbg-glas)" stroke="#f2fbff" stroke-width="2.2"/>
  <path d="M17 28v23" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".8"/>
  <rect x="21" y="37" width="22" height="11" rx="3" fill="#ff4f9a" stroke="#fff" stroke-width="1.4"/><path d="M32 39l1.6 3.2 3.4.4-2.5 2.3.7 3.3-3.2-1.7-3.2 1.7.7-3.3-2.5-2.3 3.4-.4z" fill="#ffe36b"/>`,
 // Lolly (scatter): regenboogkrul op een stokje
 lolly:`<rect x="30" y="40" width="4.5" height="22" rx="2.2" fill="#f4eee4"/><rect x="31" y="40" width="1.4" height="22" fill="#fff" opacity=".8"/>
  <circle cx="32" cy="26" r="22" fill="#fff"/>
  <g clip-path="url(#zbc-lolly)"><path d="M32 26m0-24a24 24 0 0 1 0 48a24 24 0 0 1 0-48z" fill="#ff4f9a"/>
   <path d="M32 26L32 2A24 24 0 0 1 52.8 14z" fill="#ffc93a"/><path d="M32 26L52.8 14A24 24 0 0 1 52.8 38z" fill="#5fe063"/><path d="M32 26L52.8 38A24 24 0 0 1 32 50z" fill="#4cc6ff"/>
   <path d="M32 26L32 50A24 24 0 0 1 11.2 38z" fill="#b072ff"/><path d="M32 26L11.2 38A24 24 0 0 1 11.2 14z" fill="#ff8a12"/>
   <path d="M32 26c0-3 4-3 4 0 0 5-8 5-8 0 0-7 12-7 12 0 0 9-16 9-16 0 0-11 20-11 20 0 0 13-24 13-24 0 0-15 28-15 28 0" fill="none" stroke="#fff" stroke-width="3.2" opacity=".85"/></g>
  <circle cx="32" cy="26" r="21.5" fill="none" stroke="#fff" stroke-width="2"/><ellipse cx="23" cy="14" rx="7" ry="3.5" fill="#fff" opacity=".55" transform="rotate(-30 23 14)"/>`};
// kauwgombal: kleur naar waarde
const gbTier=v=>v>=250?4:v>=50?3:v>=15?2:v>=6?1:0;
const ball=v=>`<circle cx="32" cy="34" r="25" fill="#000" opacity=".18"/><circle cx="32" cy="31" r="25" fill="url(#zbg-gb${gbTier(v)})"/>
 <circle cx="32" cy="31" r="17" fill="#fff" opacity=".18"/><ellipse cx="22" cy="18" rx="8" ry="4.5" fill="#fff" opacity=".7" transform="rotate(-30 22 18)"/><circle cx="44" cy="44" r="2.4" fill="#fff" opacity=".35"/>`;
const svg=(id,v)=>`<svg viewBox="0 0 64 64" aria-hidden="true">${id==='bal'?ball(v||2):IC[id]||''}</svg>`;
// Illustratie voor de lobby en de website (320 × 220): snoepkraam met roze lucht, suikerspinwolken, een snoeppot, lolly en kauwgomballen
function cover(uid){uid=uid||'zbc';return `<svg viewBox="0 0 320 220" class="cov-svg" role="img" aria-hidden="true"><defs>
  <linearGradient id="${uid}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8cc6"/><stop offset=".55" stop-color="#ffc0dc"/><stop offset="1" stop-color="#ffe7a8"/></linearGradient>
  <radialGradient id="${uid}z" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <rect width="320" height="220" fill="url(#${uid}l)"/><circle cx="160" cy="96" r="120" fill="url(#${uid}z)" opacity=".55"/>
  <g fill="#fff" opacity=".85"><circle cx="40" cy="58" r="20"/><circle cx="62" cy="50" r="24"/><circle cx="88" cy="60" r="17"/><circle cx="246" cy="44" r="18"/><circle cx="270" cy="36" r="23"/><circle cx="294" cy="48" r="16"/></g>
  <g fill="#ffd1e6" opacity=".7"><circle cx="52" cy="66" r="14"/><circle cx="282" cy="52" r="13"/></g>
  <g stroke-width="4" stroke-linecap="round"><path d="M24 120l6-4" stroke="#5ad1ff"/><path d="M296 128l-5-5" stroke="#5fe063"/><path d="M112 30l5 3" stroke="#ffc93a"/><path d="M214 24l-4 4" stroke="#b072ff"/><path d="M300 92l3 5" stroke="#ff3b5c"/><path d="M16 86l4 4" stroke="#ffc93a"/></g>
  <path d="M0 196q40-18 80-4t80-2 80 4 80-8v34H0z" fill="#ff6fae"/><path d="M0 206q40-12 80-2t80 0 80 2 80-6v20H0z" fill="#e2338c" opacity=".55"/>
  <g transform="translate(206 70) rotate(14) scale(1.55)">${IC.lolly}</g>
  <g transform="translate(108 58) scale(1.75)">${IC.pot}</g>
  <g transform="translate(36 128) rotate(-12) scale(1)">${IC.donut}</g>
  <g transform="translate(236 140) rotate(10) scale(.95)">${ball(10)}</g><text x="267" y="174" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="20" fill="#fff" stroke="#5b23c2" stroke-width="3" paint-order="stroke" transform="rotate(10 267 170)">×10</text>
  <g transform="translate(8 150) rotate(-25) scale(.75)">${IC.zuurstok}</g><g transform="translate(150 158) rotate(8) scale(.8)">${IC.zuurtje}</g>
  <g transform="translate(88 150) rotate(-6) scale(.7)">${IC.gombeer}</g><g transform="translate(276 92) scale(.6)">${ball(100)}</g></svg>`}
return {svg,cover,gbTier,IC,inject}})();
