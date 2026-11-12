// Pixelstad: kraakwerk. Drie spelletjes die echt vakmanschap vragen. Ook deze nemen het scherm over (groot slot, grote kluis):
//  - G.kraak.slot({d}): slot openpeuteren. Zoek met je haakje (links/rechts) de goede hoek en draai het slot (vasthouden).
//    Zit je ernaast, dan klemt het slot en buigt je haakje. Te lang forceren en het breekt. Je hebt een paar haakjes.
//  - G.kraak.kluis({d}): kluis kraken. Draai aan de knop en luister: hoe dichter bij het goede getal, hoe harder het tikt
//    (de meter slaat uit). Sta je erop, zet het getal vast. Drie getallen, drie fouten mag je niet maken.
//  - G.kraak.draad({d}): bedrading. Auto starten zonder sleutel: verbind elke draad met het contact van dezelfde kleur
//    voordat de tijd op is. Een foute verbinding geeft een schok.
// d = moeilijkheid 0 … 1, o.vak = sleutel voor vakmanschap (stad-vak.js; zonder: 'slot', 'kluis', 'draad'). Hoe meer
// vakmanschap, hoe ruimer: meer speling, meer tijd, een haakje of fout extra. Elk spel geeft een Promise: {ok:true|false} of 'cancel'.
(function(){
'use strict';
const G=STAD,K=G.kit,E=K?K.E:(s=>String(s));
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fx=n=>{try{G.snd&&G.snd.fx(n)}catch(e){}};
const buzz=ms=>{if(navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
const ease=k=>{try{return G.vak?clamp(G.vak.ease(k),0,1):0}catch(e){return 0}};
const box=document.createElement('div');box.className='sd-mini sd-kr';box.hidden=true;document.body.appendChild(box);
let cur=null,hideT=0;const keys={L:0,R:0,U:0,D:0,tap:0};
function open(title,sub,body,vk){if(cur){const c=cur;cur=null;try{c.end('cancel')}catch(e){}}clearTimeout(hideT);box.className='sd-mini sd-kr sd-stage';
  box.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub)}</small><button class="sd-x" data-kx aria-label="Stoppen">×</button></div>${vk&&G.vak?G.vak.bar(vk):''}<div class="sd-mini-b">${body}</div>`;
  box.hidden=false;box.classList.remove('go');void box.offsetWidth;box.classList.add('go');G.talking=true;for(const k in keys)keys[k]=0;G.vak&&G.vak.stage('kraak',1);fx('whoosh')}
function close(r,vk,lab){cur=null;G.talking=false;for(const k in keys)keys[k]=0;const hide=()=>{box.hidden=true;box.classList.remove('res','win','lose')};
  if(G.vak)hideT=G.vak.finish(box,'kraak',vk,r,hide,lab);else hide()}
const q=s=>box.querySelector(s);
const MAP={arrowleft:'L',a:'L',q:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'tap',e:'tap',enter:'tap',f:'tap'};
addEventListener('keydown',e=>{if(!cur)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();cur.end('cancel');return}
  const m=MAP[k];if(!m)return;e.preventDefault();e.stopImmediatePropagation();if(!keys[m]&&cur.press)cur.press(m);keys[m]=1},true);
addEventListener('keyup',e=>{const m=MAP[e.key.toLowerCase()];if(m)keys[m]=0},true);
box.addEventListener('pointerdown',e=>{if(e.target.closest('[data-kx]')){cur&&cur.end('cancel');return}const b=e.target.closest('[data-k]');if(!b||!cur)return;e.preventDefault();const m=b.dataset.k;if(!keys[m]&&cur.press)cur.press(m);keys[m]=1;b.classList.add('dn')});
const upAll=()=>{box.querySelectorAll('.dn').forEach(b=>{keys[b.dataset.k]=0;b.classList.remove('dn')})};
addEventListener('pointerup',upAll);addEventListener('pointercancel',upAll);
const btn=(k,t,cls)=>`<button class="btn sd-kr-b ${cls||''}" data-k="${k}">${t}</button>`;
function loop(f){let last=performance.now(),raf=0;const L=t=>{if(!cur)return;const dt=Math.min(.05,(t-last)/1000);last=t;f(dt);raf=requestAnimationFrame(L)};raf=requestAnimationFrame(L);return ()=>cancelAnimationFrame(raf)}
const px=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
// tekst onder het spel, met een kleurtje (ok/bad)
const say=(t,cls)=>{const s=q('.sd-kr-s');if(!s)return;s.textContent=t;s.className='sd-kr-s '+(cls||'');if(cls){void s.offsetWidth;s.classList.add('on')}};
const flash=cls=>{const v=q('.sd-kr-vis');if(!v)return;v.classList.remove('ok','bad');void v.offsetWidth;v.classList.add(cls)};
const CW=192,CH=112;

/* ---------- slot openpeuteren ---------- */
function slot(o){o=o||{};return new Promise(res=>{const vk=o.vak||'slot',e=ease(vk),d=clamp(o.d==null?.4:o.d,0,1),max=(o.picks||Math.max(2,4-Math.round(d*2)))+(e>.6?1:0);
  let picks=max,sweet=rr(-1.2,1.2),ang=0,turn=0,strain=0,shake=0,won=false,feel=-1;const tol=(.42-d*.26)*(.7+.7*e),sr=(1.1+d)*(1.25-.55*e);
  open(o.title||'Slot openpeuteren',touch?'Zoek de hoek met ◀ ▶, houd Draai vast. Klemt hij? Loslaten.':'Zoek de hoek met A en D, houd spatie vast om te draaien. Klemt hij? Loslaten.',
   `<div class="sd-kr-vis"><canvas class="sd-kr-cv" width="${CW}" height="${CH}"></canvas></div><div class="sd-kr-info"><b class="sd-kr-n"></b><small class="sd-kr-s">Voel waar het slot meegeeft</small></div>
    <div class="sd-kr-pad">${btn('L','◀')}${btn('tap',touch?'Draai':'<kbd>Spatie</kbd> Draai','go')}${btn('R','▶')}</div>`,vk);
  const cv=q('.sd-kr-cv'),c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  const info=()=>{q('.sd-kr-n').textContent='Haakjes  '+'▮'.repeat(Math.max(0,picks))+'▯'.repeat(Math.max(0,max-picks))};info();
  const stop=loop(dt=>{if(!keys.tap&&!won){ang=clamp(ang+((keys.R?1:0)-(keys.L?1:0))*dt*1.5,-1.45,1.45)}
    const off=Math.abs(ang-sweet),allow=off<tol?1:clamp(1-(off-tol)/.55,0,.95);
    if(keys.tap&&!won){turn=Math.min(allow,turn+dt*1.15);
      if(turn>=allow-.01&&allow<1){strain+=dt*sr;shake=.6;if(Math.random()<dt*14)fx('click');if(feel!==2){feel=2;say(allow>.6?'Bijna! Klemt een klein beetje':'Hij klemt. Loslaten en verder zoeken','bad')}}
      else{shake*=.8;if(feel!==1&&turn>.15){feel=1;say(allow>=1?'Hij draait mee…':'Hij geeft wat mee','')}}
      if(turn>=1&&!won){won=true;fx('ok');buzz(30);G.shake&&G.shake(.15);flash('ok');say('Klik! Het slot is open','ok');setTimeout(()=>cur&&cur.end({ok:true,picks}),450)}}
    else if(!won){turn=Math.max(0,turn-dt*2.2);strain=Math.max(0,strain-dt*.6);shake=0;feel=-1}
    if(strain>=1){picks--;strain=0;turn=0;fx('bad');buzz(80);G.shake&&G.shake(.3);flash('bad');say(picks>0?'Krak! Je haakje is gebroken':'Je laatste haakje is gebroken','bad');info();if(picks<=0){won=true;setTimeout(()=>cur&&cur.end({ok:false}),450)}}
    // tekenen: deurbeslag, cilinder die draait, haakje en spanner
    px(c,0,0,CW,CH,'#14161b');const cx=96,cy=58,sx=shake?Math.round(rr(-1,1))*2:0;
    px(c,52,6,88,100,'#1d1f25');px(c,56,10,80,92,'#6b5426');px(c,58,12,76,88,'#a07f3c');px(c,58,12,76,4,'#c9a457');px(c,58,96,76,4,'#6b5426');
    for(const y of [20,92])px(c,cx-2,y-2,4,4,'#4a3a1a');
    c.fillStyle='#2a2420';c.beginPath();c.arc(cx,cy,30,0,7);c.fill();c.fillStyle='#8a8d96';c.beginPath();c.arc(cx,cy,27,0,7);c.fill();
    c.save();c.translate(cx+sx,cy);c.rotate(turn*Math.PI/2);c.fillStyle='#c4c7cf';c.beginPath();c.arc(0,0,22,0,7);c.fill();px(c,-3,-18,6,22,'#0b0b0e');px(c,-6,2,12,8,'#0b0b0e');c.restore();
    // spanner onderin (draait mee)
    c.save();c.translate(cx,cy);c.rotate(turn*Math.PI/2);px(c,-2,6,4,14,'#3a3d45');px(c,-2,18,30,4,'#3a3d45');c.restore();
    // haakje
    c.save();c.translate(cx+sx,cy);c.rotate(ang);c.strokeStyle=strain>.5?'#ff7a5a':'#e8ebf2';c.lineWidth=3;c.beginPath();c.moveTo(0,-4);c.lineTo(0,-50);c.lineTo(-7,-55);c.stroke();px(c,-3,-62,6,4,strain>.5?'#ff7a5a':'#e8ebf2');c.restore();
    // spanning
    px(c,8,CH-10,CW-16,6,'#000');px(c,9,CH-9,(CW-18)*clamp(strain,0,1),4,strain>.6?'#ff3d52':'#f2c230');
    px(c,8,10,32,4,'#2b2f38');px(c,8,10,32*clamp(turn,0,1),4,'#3fe395')});
  cur={press:()=>{},end:r=>{stop();close(r,vk,['Open','Mislukt']);res(r)}}})}

/* ---------- kluis kraken ---------- */
function kluis(o){o=o||{};return new Promise(res=>{const vk=o.vak||'kluis',e=ease(vk),d=clamp(o.d==null?.4:o.d,0,1),N=40,code=[0,1,2].slice(0,o.n||3).map(()=>Math.floor(rr(0,N)));
  let i=0,dial=Math.floor(rr(0,N)),v=0,hk=0,strikes=0,last=-1,done=false,tm=(o.time||(70-d*25))*(.85+.4*e);const maxS=(o.strikes||3)+(e>.7?1:0),rad=(6-d*3)*(.75+.6*e);
  open(o.title||'Kluis kraken',touch?'Tik of houd ◀ ▶. Zet vast waar de meter het hoogst staat':'Draai met A en D (tik = één stap), zet vast met spatie waar de meter het hoogst staat',
   `<div class="sd-kr-vis"><canvas class="sd-kr-cv" width="${CW}" height="${CH}"></canvas></div><div class="sd-kr-info"><b class="sd-kr-n"></b><i class="sd-kr-meter"><i></i></i><small class="sd-kr-s">Luister naar het tikken</small></div>
    <div class="sd-kr-pad">${btn('L','◀')}${btn('tap',touch?'Vastzetten':'<kbd>Spatie</kbd> Vastzetten','go')}${btn('R','▶')}</div>`,vk);
  const cv=q('.sd-kr-cv'),c=cv.getContext('2d');
  const info=()=>{q('.sd-kr-n').textContent=code.map((n,k)=>k<i?String(n).padStart(2,'0'):'··').join(' – ')+'   ·   '+Math.max(0,Math.ceil(tm))+' s'};
  const near=()=>{const t=code[i];let df=Math.abs(Math.round(dial)%N-t);df=Math.min(df,N-df);return df};
  const meter=()=>{const df=near();return df===0?1:Math.max(0,1-df/rad)};
  const stop=loop(dt=>{if(done)return;tm-=dt;if(tm<=0){done=true;fx('bad');flash('bad');say('Te laat, de bewaking komt','bad');setTimeout(()=>cur&&cur.end({ok:false}),500);return}
    const dir=(keys.R?1:0)-(keys.L?1:0);
    if(dir){hk+=dt;if(hk>.28){const want=dir*(keys.U||keys.D?4:9);v+=(want-v)*Math.min(1,dt*10);dial=(dial+v*dt+N)%N}}
    else{hk=0;v=0;const tg=Math.round(dial);dial=(dial+(tg-dial)*Math.min(1,dt*16)+N)%N}
    const cn=Math.round(dial)%N;if(cn!==last){last=cn;const df=near();const loud=df===0?1:df<=1?.6-d*.3+.2*e:df<=3?.3-d*.2+.1*e:0;if(loud>0.05&&Math.random()<loud+.1)fx('click')}
    const m=meter();q('.sd-kr-meter>i').style.width=Math.round(m*100)+'%';info();
    // tekenen: grote draaiknop links, meter rechts
    px(c,0,0,CW,CH,'#14161b');const cx=70,cy=58;px(c,10,4,120,108,'#1f2228');
    c.fillStyle='#2a2c33';c.beginPath();c.arc(cx,cy,50,0,7);c.fill();c.fillStyle='#45474f';c.beginPath();c.arc(cx,cy,44,0,7);c.fill();
    for(let k=0;k<N;k++){const a=(k-dial)/N*Math.PI*2-Math.PI/2,r1=k%5?38:33;c.strokeStyle=k%5?'#8a8d96':'#e8e4da';c.lineWidth=k%5?1:2;c.beginPath();c.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1);c.lineTo(cx+Math.cos(a)*43,cy+Math.sin(a)*43);c.stroke()}
    c.fillStyle='#f2c230';c.beginPath();c.moveTo(cx-5,2);c.lineTo(cx+5,2);c.lineTo(cx,10);c.fill();c.fillStyle='#1b1c21';c.beginPath();c.arc(cx,cy,17,0,7);c.fill();
    c.fillStyle='#e8e4da';c.font='700 16px ui-monospace,monospace';c.textAlign='center';c.fillText(String(Math.round(dial)%N).padStart(2,'0'),cx,cy+6);
    // meter (stethoscoop): hoe hoger, hoe dichterbij
    px(c,146,8,22,84,'#000');const mh=Math.round(80*m);for(let y=0;y<mh;y+=4){const t=y/80;px(c,148,90-y-3,18,3,t>.85?'#3fe395':t>.5?'#f2c230':'#c75a2a')}
    if(m>=1)px(c,144,6,26,2,'#3fe395');
    for(let k=0;k<maxS;k++)px(c,140+k*12,98,9,9,k<strikes?'#ff3d52':'#2f323a')});
  cur={press:k=>{if(done)return;
      if(k==='L'||k==='R'){dial=(Math.round(dial)+(k==='R'?1:-1)+N)%N;v=0;hk=0;return}
      if(k!=='tap')return;
      if(near()===0){i++;fx('ok');buzz(25);G.shake&&G.shake(.1);flash('ok');say(i<code.length?'Klik! Volgende getal':'Open!','ok');
        if(i>=code.length){done=true;fx('coin');setTimeout(()=>cur&&cur.end({ok:true,strikes}),550)}}
      else{strikes++;fx('bad');buzz(70);G.shake&&G.shake(.2);flash('bad');say(strikes>=maxS?'Het slot zit dicht':'Mis. Het slot sprong terug','bad');if(strikes>=maxS){done=true;setTimeout(()=>cur&&cur.end({ok:false}),500)}}},
    end:r=>{stop();close(r,vk,['Open','Mislukt']);res(r)}};info()})}

/* ---------- bedrading (auto zonder sleutel starten) ---------- */
const WC=[['#e8402a','rood'],['#3a8ad6','blauw'],['#f2c230','geel'],['#3fbf5a','groen'],['#e8e4da','wit']];
function draad(o){o=o||{};return new Promise(res=>{const vk=o.vak||'draad',e=ease(vk),d=clamp(o.d==null?.4:o.d,0,1),n=d>.55&&e<.35?5:e>.75&&d<.5?3:4,cols=WC.slice(0,n),right=cols.map((c,i)=>i).sort(()=>Math.random()-.5);
  let tm=(o.time||(11-d*4))*(.85+.45*e),sel=0,from=-1,doneN=0,shocks=0,done=false;const maxS=3+(e>.6?1:0),RW=26;const linked=new Set();
  open(o.title||'Bedrading',touch?'Tik een draad en dan het contact met dezelfde kleur':'Klik een draad en dan het contact met dezelfde kleur (of W/S kiezen, spatie verbindt)',
   `<div class="sd-kr-vis sd-kr-wire" style="--n:${n}"><div class="sd-kr-l">${cols.map((c,i)=>`<button data-w="${i}" style="--c:${c[0]}" aria-label="${c[1]}e draad"><i></i></button>`).join('')}</div><canvas class="sd-kr-cv2" width="120" height="${n*RW}"></canvas>
    <div class="sd-kr-r">${right.map((ci,j)=>`<button data-t="${j}" style="--c:${cols[ci][0]}" aria-label="${cols[ci][1]} contact"><i></i></button>`).join('')}</div></div><div class="sd-kr-info"><b class="sd-kr-n"></b><i class="sd-kr-meter sd-kr-tm"><i></i></i><small class="sd-kr-s">Snel, voordat iemand kijkt</small></div>`,vk);
  const cv=q('.sd-kr-cv2'),c=cv.getContext('2d'),T0=tm;
  const mark=()=>{box.querySelectorAll('[data-w]').forEach(b=>{const i=+b.dataset.w;b.classList.toggle('on',from<0&&i===sel||from===i);b.classList.toggle('done',linked.has(i))});box.querySelectorAll('[data-t]').forEach(b=>{const j=+b.dataset.t;b.classList.toggle('on',from>=0&&j===sel);b.classList.toggle('done',linked.has(right[j]))})};
  function link(j){if(from<0||done)return;const ci=right[j];if(ci===from){linked.add(from);doneN++;fx('click');buzz(15);from=-1;sel=cols.findIndex((c,i)=>!linked.has(i));if(sel<0)sel=0;
      if(doneN>=n){done=true;fx('engineStart');flash('ok');say('Vroem! Hij loopt','ok');setTimeout(()=>cur&&cur.end({ok:true,shocks}),550)}else say('Goed zo, nog '+(n-doneN),'ok')}
    else{shocks++;fx('bad');buzz(90);G.shake&&G.shake(.35);G.flash&&G.flash('#fff2a0',.35);flash('bad');tm-=1.5;say(shocks>=maxS?'Au! Kortsluiting':'Au! Verkeerde draad · nog '+(maxS-shocks)+' fout'+(maxS-shocks===1?'':'en'),'bad');from=-1;if(shocks>=maxS){done=true;setTimeout(()=>cur&&cur.end({ok:false}),450)}}mark()}
  box.querySelector('.sd-kr-l').addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b||done)return;const i=+b.dataset.w;if(linked.has(i))return;from=i;sel=0;fx('blip');mark()});
  box.querySelector('.sd-kr-r').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;link(+b.dataset.t)});
  const stop=loop(dt=>{if(done)return;tm-=dt;q('.sd-kr-n').textContent=Math.max(0,tm).toFixed(1)+' s';const tb=q('.sd-kr-tm>i');tb.style.width=clamp(tm/T0,0,1)*100+'%';tb.classList.toggle('lo',tm<3);
    if(tm<=0){done=true;fx('bad');flash('bad');say('Te laat','bad');setTimeout(()=>cur&&cur.end({ok:false}),400);return}
    c.clearRect(0,0,120,n*RW);linked.forEach(i=>{const j=right.indexOf(i);c.strokeStyle=cols[i][0];c.lineWidth=4;c.beginPath();c.moveTo(0,i*RW+13);c.bezierCurveTo(60,i*RW+13,60,j*RW+13,120,j*RW+13);c.stroke()});
    if(from>=0){c.strokeStyle=cols[from][0];c.lineWidth=4;c.setLineDash([5,4]);c.beginPath();c.moveTo(0,from*RW+13);c.lineTo(120,sel*RW+13);c.stroke();c.setLineDash([])}});
  cur={press:k=>{if(done)return;if(k==='U'||k==='D'){const m=k==='U'?-1:1;sel=(sel+m+n)%n;mark()}else if(k==='tap'){if(from<0){if(!linked.has(sel)){from=sel;sel=0;fx('blip')}}else link(sel);mark()}},
    end:r=>{stop();close(r,vk,['Hij loopt','Mislukt']);res(r)}};mark()})}
G.kraak={slot,kluis,draad,active:()=>!!cur,stop:()=>{if(cur)cur.end('cancel')}};
box.addEventListener('click',e=>{if(e.target.closest('[data-kx]')&&cur)cur.end('cancel')});
// de knoppen/toetsen van de wereld doen niets zolang je kraakt
const wi=setInterval(()=>{if(!G.interact)return;clearInterval(wi);const i0=G.interact;G.interact=function(){if(cur)return true;return i0()}},300);
})();
