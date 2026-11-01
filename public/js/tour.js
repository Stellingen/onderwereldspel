// Rondleiding voor nieuwe spelers: stap voor stap over de echte schermen. Het onderdeel licht op (de rest wordt donker),
// ernaast een kaartje met uitleg. Volgende / Vorige / Overslaan, ook met de pijltjestoetsen en Escape.
// Nieuwe accounts krijgen hem automatisch (nog geen XP en geen klussen); daarna staat S.tour op 'klaar' of 'over'.
// Terugvinden: knop op het dashboard (lagere rangen) en "rondleiding" in het zoekmenu.
// el = [selector computer, selector telefoon] (bijgewerkt voor het dashboardblok, de huizenmarkt en de losse pagina Ontspannen); is het onderdeel op de telefoon niet in beeld, dan wijst hij naar Meer.
const TOUR_STEPS=()=>[
 {t:'Welkom in Onderwereld',p:`Je begint als <b>${RANKS[0][0]}</b> op straat in Amsterdam. Met klussen verdien je geld en XP en klim je op tot <b>${RANKS[RANKS.length-1][0]}</b>. In een minuut zie je waar alles zit.`,ic:'crown'},
 {el:['nav.side','#mbar'],t:'Het menu',p:'Bovenaan staat alles over <b>jou</b>: je dashboard, de ranglijst en je profiel. Daaronder vier delen: Straat, Geld, Macht en Overig. Op de telefoon staan de belangrijkste onderdelen onderaan; de rest zit onder <b>Meer</b>, met een zoekbalk.'},
 {el:['nav.side .nav-dash','#mbar a[href="#dash"]'],t:'Je dashboard',p:'Je centrale overzicht: rang en XP, wat de volgende rang opent, je geld, energie en hitte, wat er klaarstaat en je laatste gebeurtenissen.'},
 {el:['.d-vits','#topbar .chip.en'],t:'Energie, gezondheid en hitte',p:'Elke klus kost <b>energie</b>; die laadt vanzelf op. <b>Gezondheid</b> zakt als het misgaat. <b>Hitte</b> stijgt met elke klus: word je te heet, dan komt de politie langs.'},
 {el:['.dm2','#topbar .chip.cash'],t:'Wit en zwart geld',p:'Wat je met klussen verdient is <b>zwart</b>. Daarmee kun je niet naar de bank en geen zaken kopen: was het eerst <b>wit</b>. Op de bank ben je je geld niet kwijt als je gepakt wordt.'},
 {el:['nav.side a[href="#crimes"]','#mbar a[href="#crimes"]'],t:'Misdaden',p:'Hier begint alles. Per klus zie je de kans, de buit en hoeveel energie hij kost. Mislukt hij, dan moet je vluchten of ga je de cel in. Elke rang opent nieuwe klussen.'},
 {el:['nav.side a[href="#verblijf"]','#mbar .more'],t:'Verblijf',p:'Rusten vult je energie en geeft gezondheid terug. Op de <b>huizenmarkt</b> koop of huur je een betere woning: kopen stijgt in waarde, huur gaat elke speldag van je bank. Richt je woning in voor blijvende voordelen.'},
 {el:['nav.side a[href="#cars"]','#mbar a[href="#cars"]'],t:"Auto's",p:"Zoek de straat af, steel auto's en verkoop ze of zet ze in je garage. Hoe zeldzamer, hoe meer hij waard is."},
 {el:['nav.side a[href="#skills"]','#mbar .more'],t:'Trainen',p:'Training maakt je <b>blijvend</b> beter (tot level 50): meer kans, kortere wachttijden, minder energie per klus.'},
 {el:['nav.side a[href="#relax"]','#mbar .more'],t:'Ontspannen',p:'Een korte opkikker: energie of gezondheid bijvullen, focus of minder hitte. Elke plek heeft een eigen wachttijd.'},
 {el:['nav.side a[href="#biz"]','#mbar .more'],t:'Bezit',p:'Koop zaken: ze verdienen elke speldag (4 uur) geld, ook als je offline bent. Via je zaken was je ook zwart geld wit.'},
 {el:['nav.side a[href="#bank"]','#mbar .more'],t:'Bank',p:'Zet wit geld veilig op de bank. Je krijgt rente, je kunt het vastzetten in een deposito of beleggen.'},
 {el:['nav.side a[href="#casino"]','#mbar a[href="#casino"]'],t:'Casino',p:()=>`Vanaf <b>${RANKS[typeof CAS_MIN_R!=='undefined'?CAS_MIN_R:2][0]}</b> mag je naar binnen, de slots vanaf <b>${RANKS[typeof CAS_SLOT_R!=='undefined'?CAS_SLOT_R:3][0]}</b>. Speel je met zwart geld of te lang achter elkaar, dan loopt de verdenking op en word je weggestuurd.`},
 {el:['.dh2 .dh-xp','#topbar .chip.rank'],t:'Je rang',p:'Met XP klim je in rang. Op je dashboard zie je precies wat de volgende rang opent: klussen, woningen, trainingen, het casino en huurmoorden.'},
 {t:'Klaar om te beginnen',p:'Begin met een makkelijke klus en kijk hoe het gaat. Deze rondleiding vind je terug op je dashboard en via <b>rondleiding</b> in het zoekmenu.',end:1,ic:'star'}];
const tr={i:0,on:false,steps:null,raf:0};
const tourMob=()=>matchMedia('(max-width:900px)').matches;
const tourAuto=()=>typeof S!=='undefined'&&S&&!S.tour&&(S.xp||0)<1&&!(S.stats&&S.stats.crimes);
function tourEl(st){if(!st.el)return null;const sel=st.el[tourMob()?1:0];let e=sel&&document.querySelector(sel);
 const ok=x=>{if(!x)return false;const r=x.getBoundingClientRect();return r.width>2&&r.height>2&&getComputedStyle(x).visibility!=='hidden'};
 if(!ok(e))e=document.querySelector(st.el[tourMob()?0:1]);return ok(e)?e:null}
function tourStart(force){if(tr.on)return;if(!force&&!tourAuto())return;tr.on=true;tr.i=0;tr.steps=TOUR_STEPS();
 if(typeof page!=='undefined'&&page!=='dash')location.hash='dash';
 let ov=document.getElementById('tour');if(!ov){ov=document.createElement('div');ov.id='tour';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Rondleiding');document.body.appendChild(ov)}
 ov.innerHTML='<div class="tg-dim"></div><div class="tg-hole"></div><div class="tg-card" tabindex="-1"></div>';document.body.classList.add('tg-lock');
 requestAnimationFrame(()=>ov.classList.add('on'));setTimeout(()=>tourShow(0),260)}
function tourShow(i){const S0=tr.steps;tr.i=Math.max(0,Math.min(S0.length-1,i));const st=S0[tr.i],ov=document.getElementById('tour');if(!ov)return;
 const card=ov.querySelector('.tg-card'),n=S0.length,last=tr.i===n-1;
 let el=tourEl(st);if(el&&el.scrollIntoView&&!el.closest('#mbar,#topbar'))el.scrollIntoView({block:'nearest',inline:'nearest'});
 const more=el&&el.matches&&el.matches('#mbar .more');
 const ic={crown:'<path d="M3 18h18l-2-10-5 4-2-6-2 6-5-4z"/><path d="M5 21h14"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'}[st.ic];
 card.innerHTML=`<div class="tg-top"><span class="tg-n">${tr.i+1} / ${n}</span><button class="tg-skip" onclick="tourEnd('over')">Overslaan</button></div>
  ${ic?`<span class="tg-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${ic}</svg></span>`:''}
  <h3>${st.t}</h3><p>${typeof st.p==='function'?st.p():st.p}${more?' <i class="tg-more">Op de telefoon vind je dit onder Meer.</i>':''}</p>
  <div class="tg-dots" aria-hidden="true">${S0.map((_,k)=>`<i class="${k===tr.i?'on':k<tr.i?'done':''}"></i>`).join('')}</div>
  <div class="tg-btns">${tr.i?`<button class="btn ghost" onclick="tourShow(${tr.i-1})">Vorige</button>`:'<span></span>'}
   ${last?`<button class="btn" onclick="tourEnd('klaar',1)">Doe je eerste klus</button>`:`<button class="btn" onclick="tourShow(${tr.i+1})">${tr.i?'Volgende':'Laat zien'}</button>`}</div>`;
 tr.el=el;ov.classList.toggle('free',!el);tourPlace();card.classList.remove('in');void card.offsetWidth;card.classList.add('in');
 try{card.focus({preventScroll:true})}catch(e){}}
// gat op het onderdeel en het kaartje ernaast (telefoon: boven of onder, de volle breedte)
function tourPlace(){const ov=document.getElementById('tour');if(!ov||!tr.on)return;const hole=ov.querySelector('.tg-hole'),card=ov.querySelector('.tg-card'),el=tr.el,W=innerWidth,H=innerHeight,m=12;
 if(!el||!el.isConnected){hole.style.cssText='opacity:0;left:50%;top:50%;width:0;height:0';card.style.cssText=`left:${Math.max(m,(W-Math.min(460,W-2*m))/2)}px;top:${Math.max(m,H/2-card.offsetHeight/2)}px;width:${Math.min(460,W-2*m)}px`;return}
 const r=el.getBoundingClientRect(),pad=6,x=Math.max(2,r.left-pad),y=Math.max(2,r.top-pad),w=Math.min(W-4,r.width+pad*2),h=Math.min(H-4,r.height+pad*2);
 hole.style.cssText=`opacity:1;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
 const cw=Math.min(tourMob()?W-2*m:400,W-2*m);card.style.width=cw+'px';const ch=card.offsetHeight;let cx,cy;
 if(tourMob()){cx=m;cy=(r.top+r.height/2>H/2)?Math.max(m,y-ch-14):Math.min(H-ch-m,y+h+14);if(cy<m)cy=m}
 else{const sp={r:W-(x+w),l:x,b:H-(y+h),t:y};
  if(sp.r>=cw+24){cx=x+w+16;cy=Math.min(H-ch-m,Math.max(m,r.top+r.height/2-ch/2))}
  else if(sp.l>=cw+24){cx=x-cw-16;cy=Math.min(H-ch-m,Math.max(m,r.top+r.height/2-ch/2))}
  else if(sp.b>=ch+24){cy=y+h+16;cx=Math.min(W-cw-m,Math.max(m,r.left+r.width/2-cw/2))}
  else{cy=Math.max(m,y-ch-16);cx=Math.min(W-cw-m,Math.max(m,r.left+r.width/2-cw/2))}}
 card.style.left=cx+'px';card.style.top=cy+'px'}
function tourEnd(k,go){if(!tr.on)return;tr.on=false;S.tour=k||'over';try{save()}catch(e){}const ov=document.getElementById('tour');document.body.classList.remove('tg-lock');
 if(ov){ov.classList.remove('on');setTimeout(()=>{if(!tr.on)ov.remove()},260)}if(go)location.hash='crimes'}
addEventListener('resize',()=>{if(tr.on)tourPlace()});addEventListener('scroll',()=>{if(tr.on)tourPlace()},true);
document.addEventListener('keydown',e=>{if(!tr.on)return;if(e.key==='Escape'){e.preventDefault();tourEnd('over')}else if(e.key==='ArrowRight'||e.key==='Enter'){if(e.target&&e.target.tagName==='BUTTON'&&e.key==='Enter')return;e.preventDefault();if(tr.i<tr.steps.length-1)tourShow(tr.i+1)}else if(e.key==='ArrowLeft'){e.preventDefault();if(tr.i)tourShow(tr.i-1)}});
// automatisch voor nieuwe accounts, zodra het spel er staat
setTimeout(()=>{try{if(tourAuto())tourStart()}catch(e){}},1600);
