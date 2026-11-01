// Suikerbaron: de snoepjes, de lolly, de kauwgomballen, de hoge hoed (logo) en de illustratie voor de lobby en de website.
// Eigen tekeningen (SVG), allemaal in dezelfde stijl: donkere rand in de eigen kleur, zacht verloop, één of twee glimlichtjes.
// Kleurverlopen staan één keer in een onzichtbaar blad, zodat elk snoepje ze kan gebruiken.
window.ZBA=(()=>{
const DEFS=`<defs>
 <linearGradient id="zbg-drop" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#8d68aa"/><stop offset=".45" stop-color="#3a2249"/><stop offset="1" stop-color="#170b1f"/></linearGradient>
 <radialGradient id="zbg-zuur" cx="36%" cy="30%" r="75%"><stop offset="0" stop-color="#fff7c2"/><stop offset=".4" stop-color="#ffd23f"/><stop offset="1" stop-color="#ff8a12"/></radialGradient>
 <linearGradient id="zbg-wrap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ff0ff"/><stop offset="1" stop-color="#27a8e0"/></linearGradient>
 <linearGradient id="zbg-spek" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe0ee"/></linearGradient>
 <linearGradient id="zbg-spekr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa3cf"/><stop offset="1" stop-color="#ff4f9a"/></linearGradient>
 <radialGradient id="zbg-beer" cx="38%" cy="28%" r="78%"><stop offset="0" stop-color="#e2ffb8"/><stop offset=".45" stop-color="#6ee86a"/><stop offset="1" stop-color="#1f9e45"/></radialGradient>
 <radialGradient id="zbg-beerb" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#c9ff9a"/><stop offset=".5" stop-color="#55d65a"/><stop offset="1" stop-color="#188a3a"/></radialGradient>
 <radialGradient id="zbg-bon" cx="36%" cy="26%" r="80%"><stop offset="0" stop-color="#b9774c"/><stop offset=".5" stop-color="#6e3a1f"/><stop offset="1" stop-color="#2e140a"/></radialGradient>
 <linearGradient id="zbg-cup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c7820f"/><stop offset=".3" stop-color="#ffe08a"/><stop offset=".6" stop-color="#f2b739"/><stop offset="1" stop-color="#b8740b"/></linearGradient>
 <radialGradient id="zbg-deeg" cx="42%" cy="34%" r="75%"><stop offset="0" stop-color="#ffe0a6"/><stop offset=".7" stop-color="#e09a4c"/><stop offset="1" stop-color="#b3651f"/></radialGradient>
 <radialGradient id="zbg-glazuur" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#ffd3ea"/><stop offset=".55" stop-color="#ff74b8"/><stop offset="1" stop-color="#e2338c"/></radialGradient>
 <radialGradient id="zbg-wafel" cx="40%" cy="32%" r="78%"><stop offset="0" stop-color="#ffdf96"/><stop offset=".65" stop-color="#e09a42"/><stop offset="1" stop-color="#ad621e"/></radialGradient>
 <linearGradient id="zbg-glas" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d8f1ff" stop-opacity=".55"/><stop offset=".18" stop-color="#ffffff" stop-opacity=".75"/><stop offset=".45" stop-color="#e6f6ff" stop-opacity=".12"/><stop offset=".85" stop-color="#cdeaff" stop-opacity=".2"/><stop offset="1" stop-color="#a9d8ff" stop-opacity=".5"/></linearGradient>
 <linearGradient id="zbg-goud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".45" stop-color="#ffc83a"/><stop offset="1" stop-color="#c27f0a"/></linearGradient>
 <linearGradient id="zbg-hoed" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1022"/><stop offset=".35" stop-color="#4a3358"/><stop offset=".6" stop-color="#2a1a33"/><stop offset="1" stop-color="#120a18"/></linearGradient>
 <clipPath id="zbc-zuur"><circle cx="32" cy="32" r="15"/></clipPath>
 <clipPath id="zbc-spek"><rect x="10" y="21" width="44" height="22" rx="11" transform="rotate(-30 32 32)"/></clipPath>
 <clipPath id="zbc-wafel"><circle cx="32" cy="32" r="22"/></clipPath>
 <clipPath id="zbc-pot"><path d="M14 25h36v25a9 9 0 0 1-9 9H23a9 9 0 0 1-9-9z"/></clipPath>
 <clipPath id="zbc-lolly"><circle cx="32" cy="25" r="20"/></clipPath>
 <clipPath id="zbc-band"><path d="M16 35.5c3.4 2.2 9.4 3.3 16 3.3s12.6-1.1 16-3.3v8.6c-3.4 2.2-9.4 3.3-16 3.3s-12.6-1.1-16-3.3z"/></clipPath>
 <radialGradient id="zbg-gb0" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#e2f8ff"/><stop offset=".42" stop-color="#4cc6ff"/><stop offset="1" stop-color="#155fc0"/></radialGradient>
 <radialGradient id="zbg-gb1" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#f4e6ff"/><stop offset=".42" stop-color="#b072ff"/><stop offset="1" stop-color="#5420b8"/></radialGradient>
 <radialGradient id="zbg-gb2" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#ffe6f1"/><stop offset=".42" stop-color="#ff4f9a"/><stop offset="1" stop-color="#ad0f55"/></radialGradient>
 <radialGradient id="zbg-gb3" cx="34%" cy="28%" r="78%"><stop offset="0" stop-color="#fffad6"/><stop offset=".42" stop-color="#ffc93a"/><stop offset="1" stop-color="#c27200"/></radialGradient>
 <linearGradient id="zbg-gb4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f9a"/><stop offset=".25" stop-color="#ffc93a"/><stop offset=".5" stop-color="#5fe063"/><stop offset=".75" stop-color="#4cc6ff"/><stop offset="1" stop-color="#b072ff"/></linearGradient>
 <radialGradient id="zbg-lgl" cx="32%" cy="26%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a1050" stop-opacity=".28"/></radialGradient>
 <radialGradient id="zbg-shine" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>`;
// het blad met kleurverlopen één keer in de pagina zetten (niet display:none, anders tekenen sommige browsers de verlopen niet)
function inject(){if(document.getElementById('zbDefs'))return;const d=document.createElement('div');d.id='zbDefs';d.setAttribute('aria-hidden','true');
 d.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';d.innerHTML=`<svg width="0" height="0" focusable="false">${DEFS}</svg>`;document.body.appendChild(d)}
if(document.body)inject();else document.addEventListener('DOMContentLoaded',inject);
// glimlichtje: een klein kruisje
const twinkle=(x,y,s,o)=>`<path d="M${x} ${y-s}Q${x+s*.18} ${y-s*.18} ${x+s} ${y}Q${x+s*.18} ${y+s*.18} ${x} ${y+s}Q${x-s*.18} ${y+s*.18} ${x-s} ${y}Q${x-s*.18} ${y-s*.18} ${x} ${y-s}z" fill="#fff" opacity="${o||.9}"/>`;
// krul van de lolly: zes gekleurde banen die van het midden naar de rand draaien
const swirl=(cx,cy,R,cols,tw)=>{const n=cols.length,st=Math.PI*2/n,pt=(a,t)=>[cx+Math.cos(a+tw*t)*R*t,cy+Math.sin(a+tw*t)*R*t],f=v=>v.toFixed(2);
 return cols.map((c,i)=>{const a0=i*st-Math.PI/2,a1=a0+st;let d='M'+cx+' '+cy;for(let k=1;k<=12;k++){const [x,y]=pt(a0,k/12);d+='L'+f(x)+' '+f(y)}
  const e=pt(a1,1);d+=`A${R} ${R} 0 0 1 ${f(e[0])} ${f(e[1])}`;for(let k=11;k>=1;k--){const [x,y]=pt(a1,k/12);d+='L'+f(x)+' '+f(y)}return `<path d="${d}z" fill="${c}"/>`}).join('')};
const LOLLY_SW=swirl(32,25,21,['#ff4f9a','#fff','#ffc93a','#fff','#4cc6ff','#fff','#5fe063','#fff','#b072ff','#fff','#ff8a12','#fff'],2.4);
const IC={
 // Drop: glanzende zwarte ruit met zoutkorrels
 drop:`<path d="M32 6L58 32 32 58 6 32z" fill="url(#zbg-drop)" stroke="#0e0614" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M32 6L6 32h7.5L32 13.5z" fill="#fff" opacity=".16"/><path d="M32 13.5L50.5 32 32 50.5 13.5 32z" fill="none" stroke="#c7a6e0" stroke-width="1.4" opacity=".45"/>
  <path d="M15.5 29.5l13-13" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
  <g fill="#fff"><rect x="23" y="31" width="3.4" height="2.6" rx=".8" transform="rotate(20 24.7 32.3)" opacity=".95"/><rect x="35" y="23" width="3" height="2.4" rx=".8" transform="rotate(-25 36.5 24.2)" opacity=".85"/>
   <rect x="37.5" y="36" width="3.2" height="2.5" rx=".8" transform="rotate(35 39 37.2)" opacity=".85"/><rect x="29" y="42" width="2.6" height="2.1" rx=".7" transform="rotate(-10 30.3 43)" opacity=".7"/><rect x="31" y="29.5" width="2.2" height="1.8" rx=".6" opacity=".6"/></g>`,
 // Zuurtje: rond citroen-sinaasappelsnoepje met krullen, in een blauw papiertje met gedraaide punten
 zuurtje:`<path d="M18 32L5 21.5c-1.6 3.2-2.2 6.8-2 10.5.2 3.7 1 7.2 2 10.5z" fill="url(#zbg-wrap)" stroke="#1577a6" stroke-width="2" stroke-linejoin="round"/>
  <path d="M46 32l13-10.5c1.6 3.2 2.2 6.8 2 10.5-.2 3.7-1 7.2-2 10.5z" fill="url(#zbg-wrap)" stroke="#1577a6" stroke-width="2" stroke-linejoin="round"/>
  <path d="M6.5 26l9 4.5M6.5 38l9-4.5M57.5 26l-9 4.5M57.5 38l-9-4.5" stroke="#e8fbff" stroke-width="1.4" stroke-linecap="round" opacity=".75"/>
  <circle cx="32" cy="32" r="15" fill="url(#zbg-zuur)"/>
  <g clip-path="url(#zbc-zuur)" fill="none" stroke="#fff" stroke-width="2.6" opacity=".55" stroke-linecap="round"><path d="M22 18c6 5 7 14 1 22"/><path d="M33 16c5 6 6 16-1 26"/><path d="M43 19c4 6 4 14-2 22"/></g>
  <circle cx="32" cy="32" r="15" fill="none" stroke="#c4560a" stroke-width="2.2"/>
  <ellipse cx="26" cy="25" rx="5.5" ry="3" fill="#fff" opacity=".8" transform="rotate(-30 26 25)"/>`,
 // Spekje: gedraaid roze-wit spek
 spek:`<rect x="10" y="21" width="44" height="22" rx="11" fill="url(#zbg-spek)" transform="rotate(-30 32 32)"/>
  <g clip-path="url(#zbc-spek)" fill="url(#zbg-spekr)"><path d="M4 50L22 6h7L11 50zM19 56L37 12h7L26 56zM34 62L52 18h7L41 62z"/></g>
  <rect x="10" y="21" width="44" height="22" rx="11" fill="none" stroke="#c42a6f" stroke-width="2.2" transform="rotate(-30 32 32)"/>
  <path d="M17.5 32.5c6-5 15-10 24-13" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".75"/>`,
 // Gombeer: groene gummybeer, hoofd vóór het lijf
 gombeer:`<g stroke="#137034" stroke-width="2" stroke-linejoin="round">
   <ellipse cx="22" cy="55" rx="7" ry="5.2" fill="url(#zbg-beerb)"/><ellipse cx="42" cy="55" rx="7" ry="5.2" fill="url(#zbg-beerb)"/>
   <ellipse cx="32" cy="43" rx="14" ry="14.5" fill="url(#zbg-beerb)"/>
   <ellipse cx="17" cy="40" rx="5" ry="7.5" fill="url(#zbg-beer)" transform="rotate(28 17 40)"/><ellipse cx="47" cy="40" rx="5" ry="7.5" fill="url(#zbg-beer)" transform="rotate(-28 47 40)"/>
   <circle cx="20.5" cy="10.5" r="5.6" fill="url(#zbg-beer)"/><circle cx="43.5" cy="10.5" r="5.6" fill="url(#zbg-beer)"/>
   <ellipse cx="32" cy="21" rx="14.5" ry="13" fill="url(#zbg-beer)"/></g>
  <circle cx="20.5" cy="10.5" r="2.4" fill="#2fae4f" opacity=".6"/><circle cx="43.5" cy="10.5" r="2.4" fill="#2fae4f" opacity=".6"/>
  <ellipse cx="32" cy="45" rx="7.5" ry="8" fill="#e2ffb8" opacity=".3"/>
  <ellipse cx="32" cy="26" rx="6.2" ry="4.4" fill="#d8ffb0" opacity=".75"/><ellipse cx="32" cy="24.2" rx="2.6" ry="1.8" fill="#0f4a20"/>
  <path d="M29.5 28.2q2.5 2 5 0" stroke="#0f4a20" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <circle cx="25.5" cy="18.5" r="2.3" fill="#0f4a20"/><circle cx="38.5" cy="18.5" r="2.3" fill="#0f4a20"/><circle cx="26.3" cy="17.7" r=".8" fill="#fff"/><circle cx="39.3" cy="17.7" r=".8" fill="#fff"/>
  <ellipse cx="25" cy="12.5" rx="5" ry="2.4" fill="#fff" opacity=".6" transform="rotate(-18 25 12.5)"/><ellipse cx="23.5" cy="40" rx="2.3" ry="5" fill="#fff" opacity=".35"/>`,
 // Zuurstok: rood-witte wandelstok
 zuurstok:`<g transform="rotate(-14 32 34)" fill="none" stroke-linecap="round">
   <path d="M38 59V22a10 10 0 0 0-20 0v4" stroke="#8a0f2a" stroke-width="13"/>
   <path d="M38 59V22a10 10 0 0 0-20 0v4" stroke="#fff" stroke-width="9.6"/>
   <path d="M38 59V22a10 10 0 0 0-20 0v4" stroke="#ff2e55" stroke-width="9.6" stroke-dasharray="5.2 5.2" stroke-linecap="butt"/>
   <path d="M35 56V22.5a7 7 0 0 0-8-6.9" stroke="#fff" stroke-width="2.2" opacity=".7"/></g>`,
 // Bonbon: chocoladetruffel met roze krul en een kersje, in een gouden bakje
 bonbon:`<path d="M11.5 38h41l-5.5 19.5a3 3 0 0 1-2.9 2.2H19.9a3 3 0 0 1-2.9-2.2z" fill="url(#zbg-cup)" stroke="#8a560a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M17 39l3.5 19.5M23 39l2 20M29 39l.7 20.5M35 39l-.7 20.5M41 39l-2 20M47 39l-3.5 19.5" stroke="#8a560a" stroke-width="1.2" opacity=".45"/>
  <path d="M9.5 40c0-15.5 10-26.5 22.5-26.5S54.5 24.5 54.5 40c-6.5 3.5-14.5 4.5-22.5 4.5S16 43.5 9.5 40z" fill="url(#zbg-bon)" stroke="#2a1006" stroke-width="2" stroke-linejoin="round"/>
  <path d="M17 31c4-5 8-5 11-1s7 4 10 0 7-3 9 0" stroke="#ff8cc6" stroke-width="3.6" fill="none" stroke-linecap="round"/>
  <path d="M18 23c3-4.5 7.5-6.5 12-6.5" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>
  <path d="M33 13.5c1-4 3.5-6.5 7-7.5" stroke="#3d7a20" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="13.5" r="4.6" fill="#ff2e55" stroke="#8a0f2a" stroke-width="1.6"/><circle cx="30.4" cy="12" r="1.4" fill="#fff" opacity=".85"/>`,
 // Donut: roze glazuur met spikkels
 donut:`<circle cx="32" cy="33" r="25" fill="url(#zbg-deeg)" stroke="#8c4a16" stroke-width="2.2"/>
  <path d="M9 31c0-12.5 10.3-22.5 23-22.5S55 18.5 55 31c-1.6 4.6-4.6 3.4-5.6 7.6-1.3 5-5.8 2.6-8.1 6.3-2.8 4.3-6 1.3-9.3 3-3.8 2-6.7-1.6-9.7-.8-4.2 1.1-6.2-2.8-7.8-6.1C13 37.8 9.4 39.6 9 31z" fill="url(#zbg-glazuur)" stroke="#b81f6c" stroke-width="1.6" stroke-linejoin="round"/>
  <circle cx="32" cy="31.5" r="7.6" fill="#2a1430" stroke="#8c4a16" stroke-width="2"/><path d="M26.5 29.5a6 6 0 0 1 6-4" stroke="#ffd3ea" stroke-width="1.6" fill="none" opacity=".7"/>
  <g stroke-width="2.7" stroke-linecap="round"><path d="M18.5 22l3.2 2" stroke="#ffe36b"/><path d="M42.5 17.5l-3 2" stroke="#5ad1ff"/><path d="M47 29l.9 3.2" stroke="#fff"/><path d="M15.5 33l2.4-2.2" stroke="#5fe063"/>
   <path d="M26 14.5h3.4" stroke="#b072ff"/><path d="M38 41l3.2 1" stroke="#ffe36b"/><path d="M21.5 40l-1 3.2" stroke="#5ad1ff"/><path d="M34 19.5l2.6 1.4" stroke="#fff"/><path d="M45 37.5l2.5-1.8" stroke="#ff8a12"/></g>
  <ellipse cx="21" cy="17.5" rx="6.5" ry="2.8" fill="#fff" opacity=".55" transform="rotate(-28 21 17.5)"/>`,
 // Stroopwafel: ruitjes en stroop aan de rand
 wafel:`<circle cx="32" cy="34.5" r="25" fill="#7a3d0e"/><circle cx="32" cy="32" r="25" fill="url(#zbg-wafel)" stroke="#6b3410" stroke-width="2.2"/>
  <g clip-path="url(#zbc-wafel)" stroke="#a85c1c" stroke-width="2.2" opacity=".85"><path d="M-30 0L34 64M-21 0L43 64M-12 0L52 64M-3 0L61 64M6 0L70 64M15 0L79 64M24 0L88 64M-39 0L25 64M-48 0L16 64M-57 0L7 64"/>
   <path d="M94 0L30 64M85 0L21 64M76 0L12 64M67 0L3 64M58 0L-6 64M49 0L-15 64M40 0L-24 64M103 0L39 64M112 0L48 64M121 0L57 64"/></g>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#f3b04a" stroke-width="2" opacity=".6"/>
  <path d="M8.5 35c5 2.6 10 1.2 14.5 3s8.5 3.6 12.5 2 10-3.6 15.5-2.6" stroke="#ffb547" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".9"/>
  <ellipse cx="22" cy="17" rx="7" ry="2.8" fill="#fff" opacity=".45" transform="rotate(-30 22 17)"/>`,
 // Snoeppot: glazen pot vol snoep met gouden deksel en een ster
 pot:`<rect x="16.5" y="6" width="31" height="9" rx="3.2" fill="url(#zbg-goud)" stroke="#8a560a" stroke-width="1.8"/><rect x="19" y="7.6" width="26" height="2.4" rx="1.2" fill="#fff" opacity=".6"/>
  <rect x="13" y="14.5" width="38" height="8" rx="3" fill="#e2a321" stroke="#8a560a" stroke-width="1.8"/>
  <g clip-path="url(#zbc-pot)"><rect x="10" y="22" width="44" height="40" fill="#fde8f2"/>
   <circle cx="19" cy="53" r="7" fill="#ff4f9a"/><circle cx="32" cy="55" r="7" fill="#4cc6ff"/><circle cx="45" cy="53" r="7" fill="#ffc93a"/><circle cx="25.5" cy="43" r="7" fill="#5fe063"/><circle cx="38.5" cy="43" r="7" fill="#b072ff"/>
   <circle cx="18" cy="32" r="6.5" fill="#ff8a12"/><circle cx="31" cy="32.5" r="6.5" fill="#ff2e55"/><circle cx="44" cy="32" r="6.5" fill="#4cc6ff"/>
   <g fill="#fff" opacity=".65"><circle cx="17" cy="51" r="2"/><circle cx="30" cy="53" r="2"/><circle cx="43" cy="51" r="2"/><circle cx="23.5" cy="41" r="2"/><circle cx="36.5" cy="41" r="2"/><circle cx="16" cy="30" r="1.8"/><circle cx="29" cy="30.5" r="1.8"/><circle cx="42" cy="30" r="1.8"/></g></g>
  <path d="M14 25h36v25a9 9 0 0 1-9 9H23a9 9 0 0 1-9-9z" fill="url(#zbg-glas)" stroke="#eaf8ff" stroke-width="2.2"/>
  <path d="M18.5 28.5v21" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/>
  <rect x="21" y="36" width="22" height="12" rx="3.5" fill="#ff4f9a" stroke="#fff" stroke-width="1.6"/>
  <path d="M32 38.2l1.7 3.4 3.7.5-2.7 2.6.7 3.6-3.4-1.8-3.4 1.8.7-3.6-2.7-2.6 3.7-.5z" fill="#ffe36b" stroke="#c27f0a" stroke-width=".7"/>`,
 // Lolly (scatter): regenboogkrul op een stokje met een strik
 lolly:`<rect x="29.8" y="42" width="4.4" height="20" rx="2.2" fill="#f6efe2" stroke="#b9ab92" stroke-width="1"/>
  <circle cx="32" cy="25" r="22" fill="#fff"/>
  <g clip-path="url(#zbc-lolly)">${LOLLY_SW}<circle cx="32" cy="25" r="20" fill="url(#zbg-lgl)"/></g>
  <circle cx="32" cy="25" r="20.6" fill="none" stroke="#fff" stroke-width="2.6"/>
  <path d="M32 46.5l-7.5-4.2c-1.4-.8-2.4.3-2 1.7l1.4 4.6c.4 1.4 1.6 1.7 2.8.9L32 46.5l5.3 3c1.2.8 2.4.5 2.8-.9l1.4-4.6c.4-1.4-.6-2.5-2-1.7z" fill="#ff4f9a" stroke="#ad0f55" stroke-width="1.4" stroke-linejoin="round"/>
  <circle cx="32" cy="46.6" r="2.2" fill="#ff8cc6" stroke="#ad0f55" stroke-width="1.2"/>
  <ellipse cx="23" cy="13.5" rx="7" ry="3.4" fill="#fff" opacity=".6" transform="rotate(-32 23 13.5)"/>${twinkle(46,9,3.6,.9)}`};
// kauwgombal: kleur naar waarde (blauw, paars, roze, goud, regenboog)
const gbTier=v=>v>=250?4:v>=50?3:v>=15?2:v>=6?1:0;
const GB_RIM=['#0f4a99','#40189a','#8a0b44','#9a5a00','#3a1060'];
const ball=v=>{const t=gbTier(v);return `<ellipse cx="32" cy="58" rx="18" ry="3.5" fill="#000" opacity=".22"/><circle cx="32" cy="31" r="25" fill="url(#zbg-gb${t})" stroke="${GB_RIM[t]}" stroke-width="2.2"/>
 <circle cx="32" cy="31" r="18" fill="#fff" opacity=".12"/><ellipse cx="22.5" cy="18.5" rx="8.5" ry="4.8" fill="#fff" opacity=".75" transform="rotate(-32 22.5 18.5)"/><circle cx="44" cy="44" r="2.6" fill="#fff" opacity=".35"/>${t>=3?twinkle(47,13,4,.95):''}`};
const svg=(id,v)=>`<svg viewBox="0 0 64 64" aria-hidden="true">${id==='bal'?ball(v||2):IC[id]||''}</svg>`;
// Logo: hoge hoed van de Suikerbaron met een zuurstokband
const HAT=`<ellipse cx="32" cy="50" rx="27" ry="7.5" fill="#120a18" stroke="#000" stroke-width="1.5"/><ellipse cx="32" cy="48.5" rx="24.5" ry="5.5" fill="#3a2648"/>
 <path d="M16 46.5V14c0-3.2 7.2-5.5 16-5.5s16 2.3 16 5.5v32.5c-3.4 2.2-9.4 3.3-16 3.3s-12.6-1.1-16-3.3z" fill="url(#zbg-hoed)" stroke="#0a050e" stroke-width="1.6"/>
 <ellipse cx="32" cy="14" rx="16" ry="5.5" fill="#3d2a4b" stroke="#0a050e" stroke-width="1.4"/>
 <path d="M16 35.5c3.4 2.2 9.4 3.3 16 3.3s12.6-1.1 16-3.3v8.6c-3.4 2.2-9.4 3.3-16 3.3s-12.6-1.1-16-3.3z" fill="#fff"/>
 <g clip-path="url(#zbc-band)"><path d="M14 33l6 16M21 33l6 16M28 33l6 16M35 33l6 16M42 33l6 16M49 33l6 16" stroke="#ff2e55" stroke-width="3.4"/></g>
 <path d="M16 35.5c3.4 2.2 9.4 3.3 16 3.3s12.6-1.1 16-3.3M16 44.1c3.4 2.2 9.4 3.3 16 3.3s12.6-1.1 16-3.3" stroke="#8a0f2a" stroke-width="1.3" fill="none"/>
 <path d="M21 16v17" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".28"/>`;
const hat=()=>`<svg viewBox="0 0 64 60" aria-hidden="true">${HAT}</svg>`;
// Illustratie voor de lobby en de website (320 × 220), zonder eigen achtergrond (zoals de andere spellen):
// een grote krullolly met de hoge hoed eraan, roze gloed, een paar snoepjes en een kauwgombal ×100.
function cover(uid){uid=uid||'zbc';const T='font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900"';
 return `<svg viewBox="0 0 320 220" class="cov-svg" role="img" aria-hidden="true"><defs>
  <radialGradient id="${uid}l" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff7ab8" stop-opacity=".75"/><stop offset=".5" stop-color="#d33a8f" stop-opacity=".3"/><stop offset="1" stop-color="#b03aff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${uid}m" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#b072ff" stop-opacity=".55"/><stop offset="1" stop-color="#b072ff" stop-opacity="0"/></radialGradient></defs>
  <circle cx="190" cy="92" r="112" fill="url(#${uid}l)"/><circle cx="262" cy="150" r="70" fill="url(#${uid}m)"/>
  <ellipse cx="196" cy="186" rx="92" ry="9" fill="#000" opacity=".5"/>
  <g transform="translate(126 44) scale(2.15)">${IC.lolly}</g>
  <g transform="translate(166 0) rotate(14 37 34) scale(1.15)">${HAT}</g>
  <g transform="translate(244 112) rotate(10) scale(.95)">${ball(100)}</g><text x="275" y="150" text-anchor="middle" ${T} font-size="20" fill="#fff" stroke="#9a5a00" stroke-width="4" paint-order="stroke" transform="rotate(10 275 144)">×100</text>
  <g transform="translate(96 112) rotate(-12) scale(.85)">${IC.gombeer}</g>
  <g transform="translate(92 44) rotate(-16) scale(.62)">${IC.zuurtje}</g>
  ${twinkle(268,40,6)}${twinkle(300,92,4.5,.8)}${twinkle(118,30,4,.7)}${twinkle(150,178,3.5,.6)}
  <g fill="#fff"><circle cx="122" cy="102" r="2" opacity=".7"/><circle cx="276" cy="40" r="1.6" opacity=".6"/><circle cx="300" cy="190" r="2" opacity=".5"/><circle cx="72" cy="110" r="1.6" opacity=".5"/></g></svg>`}
return {svg,cover,gbTier,IC,inject,hat,twinkle}})();
