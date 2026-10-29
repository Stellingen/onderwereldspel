// Landingspagina: inloggen/registreren, ingelogde staat, en de interactieve onderdelen.
(function(){
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>'€'+Math.floor(n).toLocaleString('nl-NL');
const getToken=()=>{try{return localStorage.getItem('ow_token')}catch(e){return null}};
const setToken=t=>{try{t?localStorage.setItem('ow_token',t):localStorage.removeItem('ow_token')}catch(e){}};

/* ---------- Ingelogde staat ---------- */
function showLoggedIn(name){
  const n=esc(name);
  $('#navAuth').innerHTML=`<span class="hello">Ingelogd als <b>${n}</b></span><a class="btn sm" href="/game.html">Mijn dashboard</a><button class="btn ghost sm" id="navOut">Uitloggen</button>`;
  $('#navOut').onclick=logoutHere;
  $('#eyebrow').textContent='Welkom terug, '+name;
  $('#heroTitle').innerHTML=`De stad heeft je<br>gemist, <span class="rot">${n}</span>.`;
  $('#heroTag').textContent='Je imperium staat precies waar je het hebt achtergelaten. Je bedrijven hebben doorgedraaid en je rivalen hebben niet stilgezeten.';
  $('#heroCta').innerHTML=`<a class="btn btn-xl btn-hero" href="/game.html">Ga naar mijn dashboard <span aria-hidden="true">→</span></a>`;
  $('#finTitle').textContent='Terug aan het werk, baas.';
  $('#finLead').textContent='Je dashboard staat klaar met alles wat er is gebeurd terwijl je weg was.';
  $('#finCta').innerHTML=`<a class="btn btn-xl btn-hero" href="/game.html">Ga naar mijn dashboard <span aria-hidden="true">→</span></a>`;
  stopRot=true;
}
function logoutHere(){setToken(null);location.href='/'}

async function checkSession(){
  const t=getToken();if(!t)return;
  try{
    const r=await fetch('/api/me',{headers:{Authorization:'Bearer '+t}});
    if(r.ok){showLoggedIn((await r.json()).username)}else if(r.status===401){setToken(null)}
  }catch(e){}
}

/* ---------- Auth-venster ---------- */
let mode='login';
const modal=$('#authModal'), form=$('#authForm'), err=$('#authErr');
function setMode(m){
  mode=m;const reg=m==='register';
  $('#tabLogin').classList.toggle('on',!reg);$('#tabReg').classList.toggle('on',reg);
  $('#tabLogin').setAttribute('aria-selected',!reg);$('#tabReg').setAttribute('aria-selected',reg);
  $('#authTitle').textContent=reg?'Begin je carrière':'Welkom terug';
  $('#authHint').textContent=reg?'Kies een naam die de straat zal onthouden.':'Log in en ga verder waar je gebleven was.';
  $('#authSubmit').textContent=reg?'Account aanmaken':'Inloggen';
  $('#pass2wrap').hidden=!reg;$('#strength').hidden=!reg;$('#userHint').hidden=!reg;
  $('#authPass').autocomplete=reg?'new-password':'current-password';
  $('#authSwap').innerHTML=reg?'Al een account? <button type="button" data-mode="login">Log in</button>':'Nog geen account? <button type="button" data-mode="register">Maak er een aan</button>';
  err.hidden=true;
}
function openAuth(m){setMode(m);modal.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>$('#authUser').focus(),50)}
function closeAuth(){modal.hidden=true;document.body.style.overflow=''}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-auth]');if(a){e.preventDefault();openAuth(a.dataset.auth);return}
  const m=e.target.closest('[data-mode]');if(m&&modal.contains(m)){setMode(m.dataset.mode)}
});
$('#authClose').onclick=closeAuth;
modal.addEventListener('click',e=>{if(e.target===modal)closeAuth()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeAuth()});
$('#peek').onclick=()=>{const p=$('#authPass'),show=p.type==='password';p.type=show?'text':'password';$('#authPass2').type=p.type;$('#peek').textContent=show?'Verberg':'Toon'};

$('#authPass').addEventListener('input',()=>{
  if(mode!=='register')return;const v=$('#authPass').value;let s=0;
  if(v.length>=6)s++;if(v.length>=10)s++;if(/[A-Z]/.test(v)&&/[a-z]/.test(v))s++;if(/\d/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;
  const lv=[['Te kort','var(--red)'],['Zwak','var(--red)'],['Matig','#ffae4d'],['Goed','var(--gold2)'],['Sterk','var(--green)'],['IJzersterk','var(--green)']][s];
  $('#strength i').style.width=(s/5*100)+'%';$('#strength i').style.background=lv[1];$('#strength span').textContent=lv[0];
});

form.addEventListener('submit',async e=>{
  e.preventDefault();err.hidden=true;
  const username=$('#authUser').value.trim(),password=$('#authPass').value;
  const fail=m=>{err.textContent=m;err.hidden=false;$('.authbox').classList.remove('shake');void $('.authbox').offsetWidth;$('.authbox').classList.add('shake')};
  if(!/^[a-zA-Z0-9_]{3,20}$/.test(username))return fail('Je gebruikersnaam moet 3 tot 20 tekens zijn: letters, cijfers of _.');
  if(password.length<6)return fail('Je wachtwoord moet minstens 6 tekens zijn.');
  if(mode==='register'&&password!==$('#authPass2').value)return fail('De twee wachtwoorden zijn niet gelijk.');
  const btn=$('#authSubmit'),label=btn.textContent;btn.disabled=true;btn.textContent=mode==='register'?'Account aanmaken…':'Inloggen…';
  try{
    const r=await fetch('/api/'+(mode==='register'?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password})});
    let j={};try{j=await r.json()}catch(x){}
    if(!r.ok)throw new Error(j.error||'Er ging iets mis. Probeer het opnieuw.');
    setToken(j.token);
    btn.textContent=mode==='register'?'Welkom in de onderwereld':'Welkom terug';
    $('.authbox').classList.add('success');
    setTimeout(()=>location.href='/game.html',650);
  }catch(x){
    fail(x.message==='Failed to fetch'?'De server is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.':x.message);
    btn.disabled=false;btn.textContent=label;
  }
});

/* ---------- Wisselende rang in de titel ---------- */
const RANKS=['Rookie','Straatschoffie','Loopjongen','Dief','Boef','Gangster','Soldaat','Huurmoordenaar','Capo','Onderbaas','Consigliere','Peetvader'];
let stopRot=false,ri=0;
if(!reduce)setInterval(()=>{if(stopRot)return;const el=$('#rot');if(!el)return;
  el.classList.add('out');setTimeout(()=>{ri=(ri+1)%RANKS.length;el.textContent=RANKS[(ri+6)%RANKS.length];el.classList.remove('out')},280)},2200);

/* ---------- Tellers ---------- */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target,to=+el.dataset.count,t0=performance.now();
  const step=t=>{const p=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);io.unobserve(el)})):null;
$$('[data-count]').forEach(el=>{if(io&&!reduce)io.observe(el);else el.textContent=el.dataset.count});

/* ---------- Kaarten kantelen mee met de muis ---------- */
if(!reduce&&matchMedia('(hover:hover)').matches)$$('[data-tilt]').forEach(c=>{
  c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform=`perspective(700px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-3px)`;c.style.setProperty('--mx',(x+.5)*100+'%');c.style.setProperty('--my',(y+.5)*100+'%')});
  c.addEventListener('mouseleave',()=>{c.style.transform=''});
});

/* ---------- Demo: dubbel of niks ---------- */
let demoCash=1000,demoBet=100,flipping=false,rotY=0;
const coin=$('#coin'),msg=$('#demoMsg');
$$('.demo-bets .pchip').forEach(b=>b.onclick=()=>{$$('.demo-bets .pchip').forEach(x=>x.classList.remove('on'));b.classList.add('on');demoBet=+b.dataset.bet});
function demoFlip(pick){
  if(flipping)return;if(demoBet>demoCash){msg.textContent='Zoveel speelgeld heb je niet meer.';return}
  flipping=true;const res=Math.random()<.5?'kop':'munt';
  rotY+=1800+(res==='munt'?180:0)-(rotY%360);coin.style.transform=`rotateY(${rotY}deg)`;msg.textContent='De munt draait…';msg.className='demo-msg';
  setTimeout(()=>{
    const win=res===pick;demoCash+=win?demoBet:-demoBet;$('#demoCash').textContent=fmt(demoCash);
    msg.textContent=(res==='kop'?'Kop':'Munt')+'. '+(win?'Gewonnen: +'+fmt(demoBet):'Verloren: -'+fmt(demoBet));msg.className='demo-msg '+(win?'win':'lose');
    if(demoCash<=0){msg.textContent='Blut. Precies zoals het huis het graag ziet.';$('#demoReset').hidden=false}
    else if(demoCash>=3000){msg.textContent='Je hebt het speelgeld verdrievoudigd. Tijd voor het echte werk.'}
    flipping=false},reduce?50:1200);
}
$('#demoKop').onclick=()=>demoFlip('kop');$('#demoMunt').onclick=()=>demoFlip('munt');
$('#demoReset').onclick=()=>{demoCash=1000;$('#demoCash').textContent=fmt(1000);msg.textContent='Kies kop of munt';msg.className='demo-msg';$('#demoReset').hidden=true};

/* ---------- Rangladder ---------- */
const LADDER=[
 ['Rookie','Je eerste stappen op straat. Zakkenrollen op de Dam.'],
 ['Straatschoffie','Winkels overvallen en de eerste Volkswagen in je garage.'],
 ['Loopjongen','Je kunt je aansluiten bij De Nieuwe Garde.'],
 ['Dief','Villa-inbraken in Wassenaar en je eerste belwinkel als dekmantel.'],
 ['Boef','Familia Rossi opent haar deuren voor je.'],
 ['Gangster','Smokkelroutes via de haven en je eigen nachtclub.'],
 ['Soldaat','Het Syndicaat ziet potentie in je.'],
 ['Huurmoordenaar','Bankovervallen met je crew en een chop shop voor gestolen auto\'s.'],
 ['Capo','Lamborghini\'s zijn nu binnen bereik.'],
 ['Onderbaas','De casino-kraak en de havenloods van Rotterdam.'],
 ['Consigliere','Nog één stap van de top.'],
 ['Peetvader','La Cupola. De stad is van jou.']];
const lad=$('#ladder');
lad.innerHTML=LADDER.map((r,i)=>`<button class="rung ${i===11?'top':''}" data-i="${i}" style="--i:${i}"><span class="rn">${String(i+1).padStart(2,'0')}</span>${r[0]}</button>`).join('');
function pickRung(i){$$('.rung').forEach(b=>b.classList.toggle('on',+b.dataset.i===i));
  $('#ladderInfo').innerHTML=`<div class="label">Rang ${i+1} van 12</div><h3>${LADDER[i][0]}</h3><p>${LADDER[i][1]}</p><div class="bar"><i style="width:${(i+1)/12*100}%;background:linear-gradient(90deg,var(--crimson),var(--gold2))"></i></div>`}
lad.addEventListener('click',e=>{const b=e.target.closest('.rung');if(b)pickRung(+b.dataset.i)});
pickRung(0);

/* ---------- Stad bij nacht (hero) ---------- */
const cv=$('#city'),cx=cv.getContext('2d');let W=0,H=0,bld=[],drops=[],t0=performance.now();
function build(){const dpr=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
  bld=[];[[.55,.35],[.75,.6],[1,1]].forEach(([depth,alpha],L)=>{let x=-20;while(x<W+20){const w=30+Math.random()*70*depth,h=H*(.14+Math.random()*.32)*depth+(L===2?40:0);
    const wins=[];for(let wy=10;wy<h-10;wy+=13)for(let wx=6;wx<w-8;wx+=10)if(Math.random()<.32)wins.push([wx,wy,Math.random()]);
    bld.push({x,w,h,L,alpha,wins,ant:Math.random()<.15});x+=w+2+Math.random()*8}});
  drops=Array.from({length:reduce?0:Math.round(W/9)},()=>({x:Math.random()*W,y:Math.random()*H,v:6+Math.random()*7,l:8+Math.random()*12}))}
function draw(t){const s=(t-t0)/1000;cx.clearRect(0,0,W,H);
  // zoeklicht
  const a=Math.sin(s*.35)*.6-Math.PI/2,ox=W*.72,oy=H;const g=cx.createLinearGradient(ox,oy,ox+Math.cos(a)*H,oy+Math.sin(a)*H);g.addColorStop(0,'rgba(242,216,136,.10)');g.addColorStop(1,'rgba(242,216,136,0)');
  cx.fillStyle=g;cx.beginPath();cx.moveTo(ox,oy);cx.lineTo(ox+Math.cos(a-.08)*H*1.3,oy+Math.sin(a-.08)*H*1.3);cx.lineTo(ox+Math.cos(a+.08)*H*1.3,oy+Math.sin(a+.08)*H*1.3);cx.fill();
  bld.forEach(b=>{const y=H-b.h;cx.fillStyle=['#120f19','#0f0c15','#0a0810'][b.L];cx.fillRect(b.x,y,b.w,b.h);
    if(b.ant){cx.fillRect(b.x+b.w/2-1,y-18,2,18);if(Math.sin(s*3+b.x)>0){cx.fillStyle='rgba(229,55,79,.9)';cx.fillRect(b.x+b.w/2-2,y-21,4,4)}}
    b.wins.forEach(([wx,wy,r])=>{const on=r>.12||Math.sin(s*.7+r*40)>.2;if(!on)return;cx.fillStyle=r>.85?`rgba(229,55,79,${.5*b.alpha})`:`rgba(242,216,136,${(.25+.5*r)*b.alpha})`;cx.fillRect(b.x+wx,y+wy,4,6)})});
  const fog=cx.createLinearGradient(0,H*.55,0,H);fog.addColorStop(0,'rgba(9,9,12,0)');fog.addColorStop(1,'rgba(9,9,12,.95)');cx.fillStyle=fog;cx.fillRect(0,H*.55,W,H*.45);
  cx.strokeStyle='rgba(180,190,220,.16)';cx.lineWidth=1;cx.beginPath();
  drops.forEach(d=>{d.y+=d.v;d.x-=d.v*.15;if(d.y>H){d.y=-d.l;d.x=Math.random()*W*1.1}cx.moveTo(d.x,d.y);cx.lineTo(d.x+d.l*.15,d.y-d.l)});cx.stroke();
  if(!reduce)requestAnimationFrame(draw)}
build();requestAnimationFrame(draw);let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,150)});

/* ---------- Start ---------- */
setMode('login');
checkSession().then(()=>{if(/[?&]login=1/.test(location.search)&&$('#navOut')===null)openAuth('login')});
})();
