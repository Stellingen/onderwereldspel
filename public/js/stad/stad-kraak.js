// Pixelstad: kraakwerk. Drie spelletjes die echt vakmanschap vragen (ook in hetzelfde paneel onderin, de wereld loopt door):
//  - G.kraak.slot({d}): slot openpeuteren. Zoek met je haakje (links/rechts) de goede hoek en draai het slot (vasthouden).
//    Zit je ernaast, dan klemt het slot en buigt je haakje. Te lang forceren en het breekt. Je hebt een paar haakjes.
//  - G.kraak.kluis({d}): kluis kraken. Draai aan de knop en luister: hoe dichter bij het goede getal, hoe harder het tikt
//    (de meter slaat uit). Sta je erop, zet het getal vast. Drie getallen, drie fouten mag je niet maken.
//  - G.kraak.draad({d}): bedrading. Auto starten zonder sleutel: verbind elke draad met het contact van dezelfde kleur
//    voordat de tijd op is. Een foute verbinding geeft een schok.
// d = moeilijkheid 0 … 1. Elk spel geeft een Promise: {ok:true|false} of 'cancel'.
(function(){
'use strict';
const G=STAD,K=G.kit,E=K?K.E:(s=>String(s));
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[Math.floor(Math.random()*a.length)];
const fx=n=>{try{G.snd&&G.snd.fx(n)}catch(e){}};
const box=document.createElement('div');box.className='sd-mini sd-kr';box.hidden=true;document.body.appendChild(box);
let cur=null;const keys={L:0,R:0,U:0,D:0,tap:0};
function open(title,sub,body){if(cur){const c=cur;cur=null;try{c.end('cancel')}catch(e){}}box.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub)}</small><button class="sd-x" data-kx aria-label="Stoppen">×</button></div><div class="sd-mini-b">${body}</div>`;
  box.hidden=false;box.classList.remove('go');void box.offsetWidth;box.classList.add('go');G.talking=true;for(const k in keys)keys[k]=0}
function close(){box.hidden=true;cur=null;G.talking=false;for(const k in keys)keys[k]=0}
const q=s=>box.querySelector(s);
const MAP={arrowleft:'L',a:'L',q:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'tap',e:'tap',enter:'tap',f:'tap'};
addEventListener('keydown',e=>{if(!cur)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();cur.end('cancel');return}
  const m=MAP[k];if(!m)return;e.preventDefault();e.stopImmediatePropagation();if(!keys[m]&&cur.press)cur.press(m);keys[m]=1},true);
addEventListener('keyup',e=>{const m=MAP[e.key.toLowerCase()];if(m)keys[m]=0},true);
box.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-k]');if(e.target.closest('[data-kx]')){cur&&cur.end('cancel');return}if(!b||!cur)return;e.preventDefault();const m=b.dataset.k;if(!keys[m]&&cur.press)cur.press(m);keys[m]=1;b.classList.add('dn')});
const upAll=()=>{if(!cur)return;['L','R','U','D','tap'].forEach(k=>{if(touch||true){}});box.querySelectorAll('.dn').forEach(b=>{keys[b.dataset.k]=0;b.classList.remove('dn')})};
addEventListener('pointerup',upAll);addEventListener('pointercancel',upAll);
const btn=(k,t,cls)=>`<button class="btn sd-kr-b ${cls||''}" data-k="${k}">${t}</button>`;
function loop(f){let last=performance.now(),raf=0;const L=t=>{if(!cur)return;const dt=Math.min(.05,(t-last)/1000);last=t;f(dt);raf=requestAnimationFrame(L)};raf=requestAnimationFrame(L);return ()=>cancelAnimationFrame(raf)}
const px=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};

/* ---------- slot openpeuteren ---------- */
function slot(o){o=o||{};return new Promise(res=>{const d=clamp(o.d==null?.4:o.d,0,1);let picks=o.picks||Math.max(2,4-Math.round(d*2)),sweet=rr(-1.2,1.2),tol=.42-d*.26,ang=0,turn=0,strain=0,shake=0,won=false;
  open(o.title||'Slot openpeuteren',touch?'Zoek de hoek met ◀ ▶, houd Draai vast':'Zoek de hoek met A en D (of pijltjes), houd E of spatie vast om te draaien',
   `<div class="sd-kr-row"><canvas class="sd-kr-cv" width="160" height="96"></canvas><div class="sd-kr-info"><b class="sd-kr-n"></b><small class="sd-kr-s">Voel waar het slot meegeeft</small></div></div>
    <div class="sd-kr-pad">${btn('L','◀')}${btn('tap',touch?'Draai':'<kbd>E</kbd> Draai','go')}${btn('R','▶')}</div>`);
  const cv=q('.sd-kr-cv'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  const info=()=>{q('.sd-kr-n').textContent='Haakjes: '+'▮'.repeat(picks)+'▯'.repeat(Math.max(0,(o.picks||Math.max(2,4-Math.round(d*2)))-picks))};info();
  const stop=loop(dt=>{if(!keys.tap){ang=clamp(ang+((keys.R?1:0)-(keys.L?1:0))*dt*1.5,-1.45,1.45)}
    const off=Math.abs(ang-sweet),allow=off<tol?1:clamp(1-(off-tol)/.55,0,.95);
    if(keys.tap){turn=Math.min(allow,turn+dt*1.15);if(turn>=allow-.01&&allow<1){strain+=dt*(1.1+d);shake=.6;if(Math.random()<dt*14)fx('click')}else shake*=.8;
      if(turn>=1&&!won){won=true;fx('ok');G.shake&&G.shake(.15);setTimeout(()=>cur&&cur.end({ok:true,picks}),350)}}
    else{turn=Math.max(0,turn-dt*2.2);strain=Math.max(0,strain-dt*.6);shake=0}
    if(strain>=1){picks--;strain=0;turn=0;fx('bad');G.shake&&G.shake(.3);q('.sd-kr-s').textContent='Krak! Je haakje is gebroken';info();if(picks<=0){setTimeout(()=>cur&&cur.end({ok:false}),300)}}
    // tekenen: slotplaat, cilinder die draait, haakje
    c.fillStyle='#14161b';c.fillRect(0,0,160,96);const cx=80,cy=60,sx=shake?rr(-1,1)*2:0;
    for(let r=40;r>0;r-=2){const t=r/40;c.fillStyle=`rgb(${120+60*(1-t)|0},${96+50*(1-t)|0},${48+20*(1-t)|0})`;c.beginPath();c.arc(cx,cy,r,Math.PI,0);c.fill()}
    c.save();c.translate(cx+sx,cy);c.rotate(turn*Math.PI/2);px(c,-14,-14,28,28,'#3a3a40');px(c,-12,-12,24,24,'#55565e');px(c,-2,-11,4,14,'#0b0b0e');px(c,-4,2,8,6,'#0b0b0e');c.restore();
    c.save();c.translate(cx,cy);c.rotate(ang);c.strokeStyle=strain>.5?'#ff7a5a':'#c9cdd6';c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(0,-48);c.lineTo(-6,-52);c.stroke();c.restore();
    px(c,0,92,160,4,'#000');px(c,0,92,160*strain,4,strain>.6?'#ff3d52':'#f2c230')});
  cur={press:()=>{},end:r=>{stop();close();res(r)}}})}

/* ---------- kluis kraken ---------- */
function kluis(o){o=o||{};return new Promise(res=>{const d=clamp(o.d==null?.4:o.d,0,1),N=40,code=[0,1,2].slice(0,o.n||3).map(()=>Math.floor(rr(0,N)));let i=0,dial=Math.floor(rr(0,N)),v=0,strikes=0,maxS=o.strikes||3,last=-1,tm=o.time||(70-d*25),done=false;
  open(o.title||'Kluis kraken',touch?'Draai met ◀ ▶, zet vast op het getal waar het het hardst tikt':'Draai met A en D, zet vast met E waar de meter het hoogst uitslaat',
   `<div class="sd-kr-row"><canvas class="sd-kr-cv" width="160" height="96"></canvas><div class="sd-kr-info"><b class="sd-kr-n"></b><small class="sd-kr-s">Luister naar het tikken</small><i class="sd-kr-meter"><i></i></i></div></div>
    <div class="sd-kr-pad">${btn('L','◀')}${btn('tap',touch?'Vastzetten':'<kbd>E</kbd> Vastzetten','go')}${btn('R','▶')}</div>`);
  const cv=q('.sd-kr-cv'),c=cv.getContext('2d');
  const info=()=>{q('.sd-kr-n').textContent=code.map((n,k)=>k<i?String(n).padStart(2,'0'):'··').join(' – ')+'   ·   '+Math.ceil(tm)+' s'};
  const near=()=>{const t=code[i];let df=Math.abs(Math.round(dial)%N-t);df=Math.min(df,N-df);return df};
  const stop=loop(dt=>{if(done)return;tm-=dt;if(tm<=0){done=true;fx('bad');q('.sd-kr-s').textContent='Te laat, de bewaking komt';setTimeout(()=>cur&&cur.end({ok:false}),400);return}
    const want=((keys.R?1:0)-(keys.L?1:0))*(keys.U||keys.D?4:9);v+=(want-v)*Math.min(1,dt*10);dial=(dial+v*dt+N)%N;
    const cn=Math.round(dial)%N;if(cn!==last){last=cn;const df=near();const loud=df===0?1:df<=1?.6-d*.3:df<=3?.3-d*.2:0;if(loud>0.05&&Math.random()<loud+.1)fx('click')}
    const df=near(),m=df===0?1:Math.max(0,1-df/(6-d*3));q('.sd-kr-meter>i').style.width=Math.round(m*100)+'%';info();
    c.fillStyle='#14161b';c.fillRect(0,0,160,96);const cx=60,cy=48;c.fillStyle='#2a2c33';c.beginPath();c.arc(cx,cy,40,0,7);c.fill();c.fillStyle='#45474f';c.beginPath();c.arc(cx,cy,34,0,7);c.fill();
    for(let k=0;k<N;k++){const a=(k-dial)/N*Math.PI*2-Math.PI/2,r1=k%5?30:26;c.strokeStyle=k%5?'#8a8d96':'#e8e4da';c.lineWidth=k%5?1:2;c.beginPath();c.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);c.lineTo(cx+Math.cos(a)*33,cy+Math.sin(a)*33);c.stroke()}
    c.fillStyle='#f2c230';c.beginPath();c.moveTo(cx-4,6);c.lineTo(cx+4,6);c.lineTo(cx,12);c.fill();c.fillStyle='#1b1c21';c.beginPath();c.arc(cx,cy,12,0,7);c.fill();
    c.fillStyle='#e8e4da';c.font='700 13px ui-monospace,monospace';c.textAlign='center';c.fillText(String(Math.round(dial)%N).padStart(2,'0'),cx,cy+5);
    for(let k=0;k<maxS;k++)px(c,118+k*12,74,9,9,k<strikes?'#ff3d52':'#2f323a')});
  cur={press:k=>{if(k!=='tap'||done)return;if(near()===0){i++;fx('ok');G.shake&&G.shake(.1);q('.sd-kr-s').textContent=i<code.length?'Klik! Volgende getal':'Open!';
      if(i>=code.length){done=true;setTimeout(()=>cur&&cur.end({ok:true,strikes}),450)}}
    else{strikes++;fx('bad');G.shake&&G.shake(.2);q('.sd-kr-s').textContent='Mis. Het slot sprong terug';if(strikes>=maxS){done=true;setTimeout(()=>cur&&cur.end({ok:false}),400)}}},
    end:r=>{stop();close();res(r)}};info()})}

/* ---------- bedrading (auto zonder sleutel starten) ---------- */
const WC=[['#e8402a','rood'],['#3a8ad6','blauw'],['#f2c230','geel'],['#3fbf5a','groen'],['#e8e4da','wit']];
function draad(o){o=o||{};return new Promise(res=>{const d=clamp(o.d==null?.4:o.d,0,1),n=d>.55?5:4,cols=WC.slice(0,n),right=cols.map((c,i)=>i).sort(()=>Math.random()-.5);let tm=o.time||(11-d*4),sel=0,from=-1,doneN=0,shocks=0,done=false;const linked=new Set();
  open(o.title||'Bedrading',touch?'Tik een draad en dan het contact met dezelfde kleur':'Kies een draad (W/S of klik), E pakt hem, kies het contact en E verbindt',
   `<div class="sd-kr-wire"><div class="sd-kr-l">${cols.map((c,i)=>`<button data-w="${i}" style="--c:${c[0]}"><i></i></button>`).join('')}</div><canvas class="sd-kr-cv2" width="120" height="${n*26}"></canvas>
    <div class="sd-kr-r">${right.map((ci,j)=>`<button data-t="${j}" style="--c:${cols[ci][0]}"><i></i></button>`).join('')}</div></div><div class="sd-kr-info"><b class="sd-kr-n"></b><small class="sd-kr-s">Snel, voordat iemand kijkt</small></div>`);
  const cv=q('.sd-kr-cv2'),c=cv.getContext('2d');
  const mark=()=>{box.querySelectorAll('[data-w]').forEach(b=>{const i=+b.dataset.w;b.classList.toggle('on',from<0&&i===sel||from===i);b.classList.toggle('done',linked.has(i))});box.querySelectorAll('[data-t]').forEach(b=>{const j=+b.dataset.t;b.classList.toggle('on',from>=0&&j===sel);b.classList.toggle('done',linked.has(right[j]))})};
  function link(j){if(from<0||done)return;const ci=right[j];if(ci===from){linked.add(from);doneN++;fx('click');from=-1;sel=cols.findIndex((c,i)=>!linked.has(i));if(sel<0)sel=0;if(doneN>=n){done=true;fx('engineStart');q('.sd-kr-s').textContent='Vroem! Hij loopt';setTimeout(()=>cur&&cur.end({ok:true,shocks}),450)}}
    else{shocks++;fx('bad');G.shake&&G.shake(.35);G.flash&&G.flash('#fff2a0',.35);tm-=1.5;q('.sd-kr-s').textContent='Au! Verkeerde draad';from=-1;if(shocks>=3){done=true;setTimeout(()=>cur&&cur.end({ok:false}),350)}}mark()}
  box.querySelector('.sd-kr-l').addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b||done)return;const i=+b.dataset.w;if(linked.has(i))return;from=i;sel=0;fx('blip');mark()});
  box.querySelector('.sd-kr-r').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;link(+b.dataset.t)});
  const stop=loop(dt=>{if(done)return;tm-=dt;q('.sd-kr-n').textContent=Math.max(0,tm).toFixed(1)+' s';if(tm<=0){done=true;fx('bad');q('.sd-kr-s').textContent='Te laat';setTimeout(()=>cur&&cur.end({ok:false}),300);return}
    c.clearRect(0,0,120,n*26);linked.forEach(i=>{const j=right.indexOf(i);c.strokeStyle=cols[i][0];c.lineWidth=4;c.beginPath();c.moveTo(0,i*26+13);c.bezierCurveTo(60,i*26+13,60,j*26+13,120,j*26+13);c.stroke()});
    if(from>=0){c.strokeStyle=cols[from][0];c.lineWidth=4;c.setLineDash([5,4]);c.beginPath();c.moveTo(0,from*26+13);c.lineTo(120,sel*26+13);c.stroke();c.setLineDash([])}});
  cur={press:k=>{if(done)return;if(k==='U'||k==='D'){const m=k==='U'?-1:1;sel=(sel+m+n)%n;mark()}else if(k==='tap'){if(from<0){if(!linked.has(sel)){from=sel;sel=0;fx('blip')}}else link(sel);mark()}},
    end:r=>{stop();close();res(r)}};mark()})}
G.kraak={slot,kluis,draad,active:()=>!!cur,stop:()=>{if(cur)cur.end('cancel')}};
box.addEventListener('click',e=>{if(e.target.closest('[data-kx]')&&cur)cur.end('cancel')});
// de knoppen/toetsen van de wereld doen niets zolang je kraakt
const wi=setInterval(()=>{if(!G.interact)return;clearInterval(wi);const i0=G.interact;G.interact=function(){if(cur)return true;return i0()}},300);
})();
