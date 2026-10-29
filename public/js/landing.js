// Landingspagina: misdaadkaart, meldkamer, index, mini-slot, families, meetlat en het inlogdossier.
// Gebruikt RANKS/CRIMES/FAMILIES/BIZ uit data.js en KK_ICON/kkSvg uit icons.js.
(function(){
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(a,b)=>Math.floor(Math.random()*(b-a+1))+a, pick=a=>a[Math.floor(Math.random()*a.length)];
const getToken=()=>{try{return localStorage.getItem('ow_token')}catch(e){return null}};
const setToken=t=>{try{t?localStorage.setItem('ow_token',t):localStorage.removeItem('ow_token')}catch(e){}};
let loggedIn=false;

/* ---------- Kop wordt solide bij scrollen ---------- */
const top=q('#top');const onScroll=()=>top.classList.toggle('solid',scrollY>30);addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- Ingelogd ---------- */
function showLoggedIn(name){
  loggedIn=true;const n=esc(name);
  q('#topAuth').innerHTML=`<span class="whoami">Ingelogd als <b>${n}</b></span><button class="tlink" id="outBtn">Uitloggen</button><a class="btn sm" href="/game.html">Mijn dashboard</a>`;
  q('#outBtn').onclick=()=>{setToken(null);location.href='/'};
  q('#kick').innerHTML='<span class="dot"></span>Welkom terug, '+n;
  q('#mega').innerHTML='<span>De stad</span><span><em>wacht op je.</em></span>';
  q('#lede').textContent='Je imperium staat precies waar je het hebt achtergelaten. Je zaken hebben doorgedraaid en je rivalen hebben niet stilgezeten.';
  const cta='<a class="btn xl" href="/game.html">Ga naar mijn dashboard →</a>';
  q('#heroCta').innerHTML=cta;q('#finCta').innerHTML=cta;
  q('#finTitle').innerHTML='<span>Terug aan</span><span><em>het werk.</em></span>';
  q('#finLead').textContent='Je dashboard staat klaar met alles wat er is gebeurd terwijl je weg was.';
}
async function checkSession(){const t=getToken();if(!t)return;
  try{const r=await fetch('/api/me',{headers:{Authorization:'Bearer '+t}});if(r.ok)showLoggedIn((await r.json()).username);else if(r.status===401)setToken(null)}catch(e){}}

/* ---------- Misdaadkaart (hero) ---------- */
const PLACES=['Damrak','Kalverstraat','Zeedijk','Rembrandtplein','Leidseplein','De Wallen','Haarlemmerdijk','Albert Cuypmarkt','Zuidas','Bijlmer','Oostelijke Handelskade','Museumplein','Vondelpark','Centraal Station','Westerpark','Nieuwmarkt','Spui','Waterlooplein'];
const TYPES=[['Zakkenrollerij',0],['Fietsendiefstal',0],['Winkeldiefstal',0],['Autokraak',0],['Overval avondwinkel',1],['Inbraak woning',0],['Verdachte situatie',0],['Achtervolging',1],['Overval juwelier',1],['Fruitautomaat opengebroken',0],['Valse tickets',0],['Telefoonfraude gemeld',0],['Geldtransport onderschept',1],['Arrestatie',0]];
const cv=q('#map'),cx=cv.getContext('2d'),off=document.createElement('canvas'),ox=off.getContext('2d');
let W=0,H=0,dpr=1,C={x:0,y:0},pings=[],mouse=null,light={x:0,y:0},streets=[];
function buildMap(){
  dpr=Math.min(2,devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;
  [cv,off].forEach(c=>{c.width=W*dpr;c.height=H*dpr});cx.setTransform(dpr,0,0,dpr,0,0);ox.setTransform(dpr,0,0,dpr,0,0);
  C={x:W*.64,y:H*1.02};const S=Math.max(W,H);streets=[];
  ox.clearRect(0,0,W,H);
  // water: het IJ bovenaan en de grachtengordel als halve ringen
  ox.fillStyle='rgba(40,70,110,.18)';ox.beginPath();ox.moveTo(0,H*.06);ox.bezierCurveTo(W*.3,H*.02,W*.6,H*.14,W,H*.04);ox.lineTo(W,0);ox.lineTo(0,0);ox.fill();
  const rings=[.2,.3,.4,.5,.62];
  rings.forEach((k,i)=>{ox.strokeStyle=`rgba(70,120,170,${.22-i*.02})`;ox.lineWidth=7-i*.6;ox.beginPath();ox.arc(C.x,C.y,S*k,Math.PI*1.02,Math.PI*1.98);ox.stroke()});
  // radiale straten
  ox.lineCap='round';
  for(let a=Math.PI*1.04;a<Math.PI*1.97;a+=Math.PI/26){const r0=S*(.14+Math.random()*.05),r1=S*(1.1);
    ox.strokeStyle='rgba(235,232,226,.075)';ox.lineWidth=1.2;ox.beginPath();ox.moveTo(C.x+Math.cos(a)*r0,C.y+Math.sin(a)*r0);ox.lineTo(C.x+Math.cos(a)*r1,C.y+Math.sin(a)*r1);ox.stroke();
    streets.push(a)}
  // ringwegen tussen de grachten
  rings.forEach(k=>{ox.strokeStyle='rgba(235,232,226,.06)';ox.lineWidth=1;ox.beginPath();ox.arc(C.x,C.y,S*(k+.05),Math.PI*1.02,Math.PI*1.98);ox.stroke()});
  // dwarsstraatjes en bouwblokken
  for(let i=0;i<260;i++){const a=Math.PI*(1.04+Math.random()*.92),r=S*(.16+Math.random()*.9),x=C.x+Math.cos(a)*r,y=C.y+Math.sin(a)*r;if(y<H*.08)continue;
    ox.fillStyle=`rgba(235,232,226,${.025+Math.random()*.035})`;const w=6+Math.random()*16,h=5+Math.random()*12;ox.save();ox.translate(x,y);ox.rotate(a+Math.PI/2);ox.fillRect(-w/2,-h/2,w,h);ox.restore()}
  light={x:W*.7,y:H*.45};
}
function addPing(){
  if(!W)return;const S=Math.max(W,H);const a=pick(streets)||Math.PI*1.5,r=S*(.18+Math.random()*.6);
  const x=C.x+Math.cos(a)*r,y=C.y+Math.sin(a)*r;if(y<H*.12||y>H*.92||x<10||x>W-10)return addPing();
  const t=pick(TYPES),p=pick(PLACES);pings.push({x,y,t0:performance.now(),hot:t[1]});pings=pings.slice(-14);
  const d=new Date(),hh=String(d.getHours()).padStart(2,'0'),mm=String(d.getMinutes()).padStart(2,'0');
  const li=document.createElement('li');if(t[1])li.className='hot';li.innerHTML=`<time>${hh}:${mm}</time><b>${t[0]}</b><span>${p}</span>`;
  const f=q('#feed');f.prepend(li);while(f.children.length>7)f.lastChild.remove();
}
function drawMap(t){
  cx.clearRect(0,0,W,H);
  cx.globalAlpha=.55;cx.drawImage(off,0,0,W,H);cx.globalAlpha=1;
  const tgt=mouse||{x:W*(.55+.25*Math.sin(t/4200)),y:H*(.42+.18*Math.cos(t/3100))};
  light.x+=(tgt.x-light.x)*.08;light.y+=(tgt.y-light.y)*.08;
  const rad=Math.min(W,H)*.32;
  cx.save();cx.beginPath();cx.arc(light.x,light.y,rad,0,Math.PI*2);cx.clip();cx.drawImage(off,0,0,W,H);cx.drawImage(off,0,0,W,H);cx.restore();
  const g=cx.createRadialGradient(light.x,light.y,0,light.x,light.y,rad);g.addColorStop(0,'rgba(255,122,26,.16)');g.addColorStop(1,'rgba(255,122,26,0)');cx.fillStyle=g;cx.fillRect(0,0,W,H);
  pings.forEach(p=>{const age=(t-p.t0)/1000;const col=p.hot?'255,61,82':'255,122,26';
    for(let k=0;k<2;k++){const a2=(age+k*.9)%1.8;cx.strokeStyle=`rgba(${col},${Math.max(0,.7-a2*.4)})`;cx.lineWidth=1.5;cx.beginPath();cx.arc(p.x,p.y,4+a2*22,0,Math.PI*2);cx.stroke()}
    cx.fillStyle=`rgba(${col},${Math.max(.35,1-age*.05)})`;cx.beginPath();cx.arc(p.x,p.y,3.2,0,Math.PI*2);cx.fill()});
  if(!reduce)requestAnimationFrame(drawMap);
}
q('#hero').addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse={x:e.clientX-r.left,y:e.clientY-r.top}});
q('#hero').addEventListener('pointerleave',()=>{mouse=null});
buildMap();for(let i=0;i<5;i++)addPing();requestAnimationFrame(drawMap);
setInterval(addPing,reduce?6000:2300);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{buildMap();pings=[]},150)});
const clock=()=>{const d=new Date();q('#clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0')};clock();setInterval(clock,1000);

/* ---------- Index ---------- */
q('#index').addEventListener('click',e=>{const b=e.target.closest('.ix');if(!b)return;const open=b.getAttribute('aria-expanded')==='true';
  qa('.ix').forEach(x=>x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',String(!open))});

/* ---------- Mini-slot ---------- */
const ms=q('#minislot'),SY=['munt','dobbel','fiche','sleutel','horloge','ring','diamant','goud'];
let cells=[];
function msFill(all){for(let i=0;i<30;i++){if(all||!cells[i]){cells[i]={s:Math.random()<.04?'kluis':pick(SY),nw:1}}}}
function msDraw(){ms.innerHTML=cells.map((c,i)=>`<div class="c${c.nw?' nw':''}${c.st?' '+c.st:''}" data-i="${i}">${kkSvg(c.s)}</div>`).join('');cells.forEach(c=>{c.nw=0})}
async function msLoop(){
  const wait=ms2=>new Promise(r=>setTimeout(r,ms2));
  msFill(true);msDraw();
  while(true){
    await wait(1500);
    const sym=pick(SY.slice(2));const idx=[...Array(30).keys()].sort(()=>Math.random()-.5).slice(0,R(8,11));
    idx.forEach(i=>{cells[i]={s:sym}});msDraw();await wait(500);
    idx.forEach(i=>{cells[i].st='win'});msDraw();
    const tag=document.createElement('div');tag.className='tag-win';tag.textContent=pick(['x2','x5','x8','x12','x25']);ms.appendChild(tag);
    await wait(900);idx.forEach(i=>{cells[i].st='gone'});msDraw();await wait(260);
    idx.forEach(i=>{cells[i]=null});
    // vallen: per kolom
    const grid=[];for(let c=0;c<6;c++){const col=[];for(let r=0;r<5;r++)col.push(cells[r*6+c]);const keep=col.filter(Boolean);
      const fresh=Array.from({length:5-keep.length},()=>({s:pick(SY),nw:1}));grid.push(fresh.concat(keep))}
    for(let c=0;c<6;c++)for(let r=0;r<5;r++)cells[r*6+c]=grid[c][r];
    msDraw();await wait(1200);
    if(Math.random()<.5){msFill(true);msDraw()}
  }
}
if(!reduce)msLoop();else{msFill(true);msDraw()}

/* ---------- Families ---------- */
q('#crests').innerHTML=FAMILIES.map(f=>`<article class="fam-t"><div class="crest" style="color:${f.col};box-shadow:inset 0 0 0 2px ${f.col}">${f.m}</div>
  <h3>${f.n}</h3><p>${f.d}</p><div class="req">Vanaf ${RANKS[f.r][0]} · ${f.cred} cred · +${f.loot}% buit</div><i class="bar-c" style="background:${f.col}"></i></article>`).join('');

/* ---------- Meetlat ---------- */
const RANKTXT=['Iedereen begint hier. Bedelen, zakkenrollen en je eerste fiets.','Je kent de straat. Tijd voor de eerste overval.','De Nieuwe Garde ziet je staan.','Villa\'s in Wassenaar en snackbars die gaan betalen.','Kantoren op de Zuidas en geld dat wit moet.','De haven en de juweliers van de P.C. Hooft.','Vrachtwagens op de A15 en geldtransporten.','Banken en musea. Je naam valt bij de politie.','Antwerpen en de diamanten.','Het casino. De familie Cupola kent je naam.','De Centrale Bank. Nog één stap.','De stad is van jou.'];
const wall=q('#wall');
wall.innerHTML=RANKS.map((r,i)=>i).reverse().map(i=>`<button class="wl" data-i="${i}"><span class="n">${String(i+1).padStart(2,'0')}</span><span class="r">${RANKS[i][0]}</span><span class="xp">${RANKS[i][1].toLocaleString('nl-NL')} XP</span></button>`).join('');
function pickRank(i){qa('.wl').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
  const cr=CRIMES.filter(c=>c.r===i),fm=FAMILIES.filter(f=>f.r===i),bz=BIZ.filter(b=>b.r===i);
  const items=[...cr.map(c=>'Klus: '+c.n),...fm.map(f=>'Familie: '+f.n),...bz.map(b=>'Zaak: '+b.n)];
  q('#wallInfo').innerHTML=`<div class="label">Rang ${String(i+1).padStart(2,'0')} van 12 · ${RANKS[i][1].toLocaleString('nl-NL')} XP</div><h3>${RANKS[i][0]}</h3><p>${RANKTXT[i]}</p>
   <ul>${items.length?items.map(x=>`<li>${esc(x)}</li>`).join(''):'<li>Geen nieuwe klussen. Alleen respect.</li>'}</ul>`}
wall.addEventListener('click',e=>{const b=e.target.closest('.wl');if(b)pickRank(+b.dataset.i)});
wall.addEventListener('mouseover',e=>{const b=e.target.closest('.wl');if(b&&matchMedia('(hover:hover)').matches)pickRank(+b.dataset.i)});
pickRank(0);

/* ---------- Inloggen / account ---------- */
let mode='login';const auth=q('#auth'),form=q('#authForm'),err=q('#authErr');
const plNo='Nr. '+String(R(100000,999999));q('#plNo').textContent=plNo;
const d=new Date();q('#plDate').textContent=String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear();
(function height(){const h=q('#height');let html='';for(let cm=220,i=0;cm>=120;cm-=5,i++){const maj=cm%25===0;html+=`<div class="${maj?'maj':''}" style="top:${i*(100/20)}%"><span>${maj?cm:''}</span><span>${maj?cm:''}</span></div>`}h.innerHTML=html})();
function setMode(m){
  mode=m;const reg=m==='register';
  q('#tabLogin').classList.toggle('on',!reg);q('#tabReg').classList.toggle('on',reg);
  q('#tabLogin').setAttribute('aria-selected',!reg);q('#tabReg').setAttribute('aria-selected',reg);
  q('#authTitle').textContent=reg?'Nieuw dossier':'Welkom terug';
  q('#authHint').textContent=reg?'Kies een naam die de straat zal onthouden. Een e-mailadres is niet nodig.':'Log in en ga verder waar je gebleven was.';
  q('#authSubmit').textContent=reg?'Account aanmaken':'Inloggen';
  q('#pass2wrap').hidden=!reg;q('#meter').hidden=!reg;q('#userHint').hidden=!reg;
  q('#authPass').autocomplete=reg?'new-password':'current-password';
  q('#plStatus').textContent=reg?'Nieuw dossier':'Bekende';q('#plRank').textContent=reg?'Rookie':'?';
  q('#authSwap').innerHTML=reg?'Al een account? <button type="button" data-mode="login">Log in</button>':'Nog geen account? <button type="button" data-mode="register">Maak er een aan</button>';
  err.hidden=true;validate();
}
function openAuth(m){setMode(m);auth.hidden=false;document.body.style.overflow='hidden';if(matchMedia('(min-width:761px)').matches)setTimeout(()=>q('#authUser').focus(),60);auth.scrollTop=0}
function closeAuth(){auth.hidden=true;document.body.style.overflow=''}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-auth]');if(a){e.preventDefault();openAuth(a.dataset.auth);return}
  const m=e.target.closest('[data-mode]');if(m&&auth.contains(m))setMode(m.dataset.mode)});
q('#authClose').onclick=closeAuth;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!auth.hidden)closeAuth()});
q('#peek').onclick=()=>{const p=q('#authPass'),show=p.type==='password';p.type=show?'text':'password';q('#authPass2').type=p.type;q('#peek').textContent=show?'Verberg':'Toon'};
const okName=v=>/^[a-zA-Z0-9_]{3,20}$/.test(v);
function validate(){
  const u=q('#authUser').value.trim(),p=q('#authPass').value,p2=q('#authPass2').value,reg=mode==='register';
  const pl=q('#plName');pl.textContent=u?u.toUpperCase():'ONBEKEND';pl.classList.toggle('typing',document.activeElement===q('#authUser'));
  const uh=q('#userHint');
  if(reg){
    if(!u){uh.textContent='3 tot 20 tekens: letters, cijfers of _';uh.className='fhint';q('#authUser').className=''}
    else if(okName(u)){uh.textContent='Goede naam.';uh.className='fhint good';q('#authUser').className='good'}
    else{uh.textContent=u.length<3?'Nog '+(3-u.length)+' teken'+(3-u.length>1?'s':'')+' te gaan.':u.length>20?'Maximaal 20 tekens.':'Alleen letters, cijfers en _ zijn toegestaan.';uh.className='fhint bad';q('#authUser').className='bad'}
    let s=0;if(p.length>=6)s++;if(p.length>=10)s++;if(/[A-Z]/.test(p)&&/[a-z]/.test(p))s++;if(/\d/.test(p)&&/[^A-Za-z0-9]/.test(p))s++;
    if(p.length&&p.length<6)s=0;
    const cols=['var(--red)','var(--red)','var(--acc)','var(--acc2)','var(--green)'];
    qa('#meter i').forEach((i,k)=>{i.style.background=p&&k<Math.max(1,s)?cols[s]:'var(--line2)'});
    q('#meterTxt').textContent=!p?'':p.length<6?'Te kort':['Te kort','Zwak','Redelijk','Sterk','IJzersterk'][s];
    const mh=q('#matchHint');
    if(!p2){mh.textContent='';mh.className='fhint';q('#authPass2').className=''}
    else if(p2===p){mh.textContent='Wachtwoorden komen overeen.';mh.className='fhint good';q('#authPass2').className='good'}
    else{mh.textContent='Nog niet gelijk.';mh.className='fhint bad';q('#authPass2').className='bad'}
  }else{q('#authUser').className='';q('#authPass2').className=''}
}
['#authUser','#authPass','#authPass2'].forEach(s=>{q(s).addEventListener('input',validate);q(s).addEventListener('focus',validate);q(s).addEventListener('blur',validate)});
form.addEventListener('submit',async e=>{
  e.preventDefault();err.hidden=true;
  const username=q('#authUser').value.trim(),password=q('#authPass').value;
  const fail=m=>{err.textContent=m;err.hidden=false;const ai=q('.auth-inner');ai.classList.remove('shake');void ai.offsetWidth;ai.classList.add('shake')};
  if(!okName(username))return fail('Je gebruikersnaam moet 3 tot 20 tekens zijn: letters, cijfers of _.');
  if(password.length<6)return fail('Je wachtwoord moet minstens 6 tekens zijn.');
  if(mode==='register'&&password!==q('#authPass2').value)return fail('De twee wachtwoorden zijn niet gelijk.');
  const btn=q('#authSubmit'),label=btn.textContent;btn.disabled=true;btn.textContent=mode==='register'?'Dossier aanmaken…':'Controleren…';
  try{
    const r=await fetch('/api/'+(mode==='register'?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    let j={};try{j=await r.json()}catch(x){}
    if(!r.ok)throw new Error(j.error||'Er ging iets mis. Probeer het opnieuw.');
    setToken(j.token);
    q('.placard').classList.add('ok');q('#plStatus').textContent='Toegang';q('#plName').textContent=String(j.username||username).toUpperCase();
    btn.textContent=mode==='register'?'Welkom in de onderwereld':'Welkom terug';
    setTimeout(()=>location.href='/game.html',700);
  }catch(x){
    fail(x.message==='Failed to fetch'?'De server is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.':x.message);
    btn.disabled=false;btn.textContent=label;
  }
});

setMode('login');
checkSession().then(()=>{if(/[?&]login=1/.test(location.search)&&!loggedIn)openAuth('login')});
})();
