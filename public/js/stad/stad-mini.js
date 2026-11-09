// Pixelstad: gedeelde spelletjes voor alles wat je in de stad doet. Eén paneel onderin (de wereld loopt door), bediening met
// toetsen of met knoppen op het scherm:
//  - G.mini.timing: druk als het streepje in het groene vlak staat (zakkenrollen, tag, beschermgeld)
//  - G.mini.mash: snel achter elkaar drukken
//  - G.mini.hold: knop vasthouden tot de balk vol is (doorzoeken, ophalen)
//  - G.mini.ritme: druk de pijl die in het vak komt (straatoptreden)
//  - G.mini.vecht: knokken. Ontwijk de klap in de goede richting, sla terug als het kan (wijkbaas, vechtclub)
//  - G.mini.haal: houd de vis in het vak tot hij binnen is (vissen)
// Elk spel geeft een Promise terug met de uitslag. Esc of het kruisje = stoppen ('cancel').
(function(){
'use strict';
const G=STAD,K=G.kit,E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mp=document.createElement('div');mp.className='sd-mini sd-mini2';mp.id='sdMini2';mp.hidden=true;document.body.appendChild(mp);
let cur=null;const held={tap:false};
function open(title,sub,body,cls){mp.className='sd-mini sd-mini2'+(cls?' '+cls:'');mp.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub||'')}</small><button class="sd-x" data-mx aria-label="Stoppen">×</button></div><div class="sd-mini-b">${body}</div>`;
  mp.hidden=false;mp.classList.remove('go');void mp.offsetWidth;mp.classList.add('go');G.talking=true;held.tap=false}
function close(){mp.hidden=true;cur=null;G.talking=false;held.tap=false}
const q=s=>mp.querySelector(s);
mp.addEventListener('click',e=>{if(e.target.closest('[data-mx]')){cur&&cur.end('cancel');return}const b=e.target.closest('[data-k]');if(b&&cur&&cur.key&&!('tap' in b.dataset))cur.key(b.dataset.k)});
mp.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tap]');if(b&&cur){e.preventDefault();held.tap=true;cur.key&&cur.key(b.dataset.k||'tap')}});
const up=()=>{held.tap=false};addEventListener('pointerup',up);addEventListener('pointercancel',up);
const MAP={' ':'tap',e:'tap',enter:'tap',arrowleft:'L',arrowup:'U',arrowright:'R',arrowdown:'D',a:'L',w:'U',d:'R',s:'D'};
addEventListener('keydown',e=>{if(!cur)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();cur.end('cancel');return}
  const m=MAP[k];if(m){e.preventDefault();e.stopImmediatePropagation();if(m==='tap')held.tap=true;if(!e.repeat&&cur.key)cur.key(m)}},true);
addEventListener('keyup',e=>{const m=MAP[e.key.toLowerCase()];if(m==='tap')held.tap=false},true);
const tapBtn=(t,k)=>`<button class="btn sd-mini-go" data-tap data-k="${k||'tap'}">${touch?'':'<kbd>E</kbd> '}${E(t)}</button>`;
const ARW={L:'←',U:'↑',R:'→',D:'↓'};
const fx=k=>G.snd&&G.snd.fx(k);
/* ---------- timing: streepje in het groene vlak ---------- */
function timing(o){return new Promise(res=>{const n=o.n||3,sp=o.sp||1.4,allow=o.allow==null?1:o.allow;let w=clamp(o.w||.2,.07,.4),pin=0,miss=0,c=rr(.2,.8),t0=performance.now(),raf=0;
  open(o.title||'Timing',o.sub||'Druk als het streepje in het groen staat',`<div class="sd-pick"><div class="sd-pick-bar"><i class="z"></i><i class="m"></i></div><div class="sd-pick-pins">${Array.from({length:n},(_,i)=>`<i data-p="${i}"></i>`).join('')}</div><div class="sd-pick-miss"></div></div>${tapBtn(o.label||'Nu!')}`);
  const z=q('.z'),mk=q('.m');const zone=()=>{z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%'};zone();
  const pos=()=>(Math.sin((performance.now()-t0)/1000*sp*Math.PI)+1)/2;
  const loop=()=>{if(!cur)return;mk.style.left=pos()*100+'%';if(o.tick&&o.tick()===false){cur.end('cancel');return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(k!=='tap')return;if(Math.abs(pos()-c)<=w/2){q(`[data-p="${pin}"]`).classList.add('ok');pin++;fx('click');o.hit&&o.hit(pin);if(pin>=n){cur.end({ok:true,miss});return}c=rr(.15,.85);if(o.shrink)w=Math.max(.07,w*o.shrink);zone();t0=performance.now()-rr(0,800)}
      else{miss++;fx('bad');G.shake&&G.shake(.2);q('.sd-pick-miss').textContent='Mis: '+miss+(allow>0?' van '+(allow+1):'');if(miss>allow)cur.end({ok:false,miss})}},
    end:r=>{cancelAnimationFrame(raf);close();res(r)}}})}
/* ---------- snel drukken ---------- */
function mash(o){return new Promise(res=>{let n=0;const need=o.need||8,T=o.time||3.5,t0=performance.now();let raf=0;
  open(o.title||'Snel!',o.sub||'Druk snel achter elkaar',`<i class="sd-wire-t big"><i></i></i>${tapBtn(o.label||'Druk!')}`);
  const tb=q('.sd-wire-t>i');const loop=()=>{if(!cur)return;tb.style.width=clamp(n/need,0,1)*100+'%';if((performance.now()-t0)/1000>T){cur.end({ok:false});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(k!=='tap')return;n++;fx(o.fx||'grab');G.shake&&G.shake(.15);o.hit&&o.hit(n);if(n>=need)cur.end({ok:true,t:(performance.now()-t0)/1000})},end:r=>{cancelAnimationFrame(raf);close();res(r)}}})}
/* ---------- vasthouden (losse knop onderin, je staat in de wereld) ---------- */
const hb=document.createElement('button');hb.className='sd-act sd-hold sd-hold2';hb.hidden=true;hb.innerHTML='<i></i><span></span>';document.body.appendChild(hb);
let H=null;
hb.addEventListener('pointerdown',e=>{e.preventDefault();if(H)H.down=true});['pointerup','pointercancel','pointerleave'].forEach(n=>hb.addEventListener(n,()=>{if(H)H.down=false}));
function hold(o){return new Promise(res=>{if(H){res('cancel');return}const d=o.d||1.5;H={t:0,down:false,idle:0};hb.hidden=false;hb.querySelector('span').innerHTML=(touch?'Houd vast · ':'<kbd>E</kbd> vasthouden · ')+E(o.label||'Bezig');
  let last=performance.now();const fin=r=>{H=null;hb.hidden=true;hb.style.setProperty('--p','0%');res(r)};
  const loop=()=>{if(!H)return;const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(G.paused){requestAnimationFrame(loop);return}
    if(o.can&&!o.can()){fin('cancel');return}const on=H.down||G.K.e||G.K[' ']||G.actHold;
    if(on){H.t+=dt;H.idle=0;o.tick&&o.tick(H.t/d)}else{H.t=Math.max(0,H.t-dt*.8);H.idle+=dt;if(H.idle>(o.wait||6)){fin('cancel');return}}
    hb.style.setProperty('--p',clamp(H.t/d,0,1)*100+'%');if(H.t>=d){fin('ok');return}requestAnimationFrame(loop)};requestAnimationFrame(loop)})}
/* ---------- ritme: pijlen die in het vak komen ---------- */
function ritme(o){return new Promise(res=>{const n=o.n||16,gap=o.gap||.62,lead=1.7,win=o.win||.17,notes=[];let t=1.2;for(let i=0;i<n;i++){notes.push({t,k:pick(['L','U','R','D']),st:0});t+=gap*(Math.random()<.25?.5:1)}
  const total=t+.8;let hits=0,combo=0,best=0,t0=performance.now(),raf=0;
  open(o.title||'Optreden',o.sub||'Druk de pijl als hij in het vak staat',`<div class="sd-rit"><div class="sd-rit-tr"><i class="sd-rit-z"></i>${notes.map((x,i)=>`<b data-n="${i}" class="k${x.k}">${ARW[x.k]}</b>`).join('')}</div><div class="sd-rit-s"><span id="sdRitC">0 / ${n}</span><em id="sdRitM"></em></div></div>
    <div class="sd-wire-b sd-rit-b">${['L','U','R','D'].map(k=>`<button data-tap data-k="${k}" class="k${k}" aria-label="${ARW[k]}"><b>${ARW[k]}</b></button>`).join('')}</div>`,'wide');
  const els=[...mp.querySelectorAll('[data-n]')],tr=q('.sd-rit-tr');
  const loop=()=>{if(!cur)return;const now=(performance.now()-t0)/1000;notes.forEach((x,i)=>{const d=x.t-now,el=els[i];if(x.st){return}if(d<-win){x.st=-1;el.classList.add('miss');combo=0;o.miss&&o.miss();return}
      const p=.14+clamp(d/lead,0,1.2)*.86;el.style.left=p*100+'%';el.style.opacity=d>lead?0:1});
    if(now>total){cur.end({ok:hits>=n*.5,score:hits/n,hits,n,best});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(!ARW[k])return;const now=(performance.now()-t0)/1000;const x=notes.find(x=>!x.st&&Math.abs(x.t-now)<=win*1.6);
      if(x&&x.k===k&&Math.abs(x.t-now)<=win){x.st=1;hits++;combo++;best=Math.max(best,combo);els[notes.indexOf(x)].classList.add('ok');fx('blip');o.hit&&o.hit(combo);q('#sdRitC').textContent=hits+' / '+n;q('#sdRitM').textContent=combo>2?combo+'× raak':''}
      else{combo=0;q('#sdRitM').textContent='';fx('click');if(x){x.st=-1;els[notes.indexOf(x)].classList.add('miss')}o.miss&&o.miss()}},
    end:r=>{cancelAnimationFrame(raf);close();res(r)}}})}
/* ---------- knokken ---------- */
// o: {name, hp (tegenstander), dmg (per klap op jou), win (reactietijd in s), pow (jouw kracht), on(evt)}
function vecht(o){return new Promise(res=>{let you=100,foe=o.hp||100,ph='idle',pt=rr(.9,1.6),dir='L',jabCd=0,last=performance.now(),raf=0,done=false;const pow=o.pow||1,win=o.win||.7;
  open(o.name||'Knokken',o.sub||'Ontwijk de klap, sla dan terug',`<div class="sd-vt"><div class="sd-vt-bars"><span><small>Jij</small><i class="you"><i></i></i></span><span><small>${E(o.short||'Hij')}</small><i class="foe"><i></i></i></span></div>
    <div class="sd-vt-mid"><b id="sdVtA"></b><i class="sd-vt-ring"><i></i></i><em id="sdVtT">Zoek een opening…</em></div></div>
    <div class="sd-vt-b"><button data-tap data-k="L" aria-label="Links ontwijken"><b>←</b></button><button data-tap data-k="U" aria-label="Bukken"><b>↑</b></button><button data-tap data-k="R" aria-label="Rechts ontwijken"><b>→</b></button><button class="hit" data-tap data-k="tap">${touch?'Sla!':'<kbd>E</kbd> Sla!'}</button></div>`,'wide');
  const yb=q('.you>i'),fb=q('.foe>i'),A=q('#sdVtA'),T=q('#sdVtT'),ring=q('.sd-vt-ring>i'),mid=q('.sd-vt-mid');
  const bars=()=>{yb.style.width=clamp(you,0,100)+'%';fb.style.width=clamp(foe/(o.hp||100),0,1)*100+'%'};bars();
  const ev=k=>{try{o.on&&o.on(k)}catch(e){}};
  const fin=w=>{if(done)return;done=true;ev(w?'win':'lose');cur.end({ok:w,you,foe})};
  const loop=()=>{if(!cur)return;const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(G.paused){raf=requestAnimationFrame(loop);return}pt-=dt;jabCd-=dt;
    if(ph==='idle'&&pt<=0){ph='tele';pt=win;dir=pick(['L','R','U']);A.textContent=ARW[dir];mid.className='sd-vt-mid tele';T.textContent=dir==='U'?'Bukken!':'Ontwijken!';fx('tab');ev('tele:'+dir)}
    else if(ph==='tele'){ring.style.transform='scale('+(.25+.75*clamp(pt/win,0,1))+')';if(pt<=0){you-=o.dmg||14;fx('hit');G.shake&&G.shake(.9);G.hitStop=.06;if(navigator.vibrate)try{navigator.vibrate(50)}catch(e){}ev('hit');bars();ph='idle';pt=rr(.8,1.5);A.textContent='';mid.className='sd-vt-mid au';T.textContent='Au!';if(you<=0){fin(false);return}}}
    else if(ph==='counter'&&pt<=0){ph='idle';pt=rr(.7,1.4);mid.className='sd-vt-mid';T.textContent='Zoek een opening…';A.textContent=''}
    raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(done)return;
      if(k==='tap'){if(jabCd>0)return;jabCd=.22;if(ph==='tele'){T.textContent='Niet slaan, ontwijken!';return}
        const crit=ph==='counter',blocked=!crit&&Math.random()<(o.block==null?.3:o.block);if(blocked){fx('click');ev('blok');T.textContent='Geblokt';return}
        const d=rr(4,6)*pow*(crit?2.1:1);foe-=d;fx('hit');G.shake&&G.shake(crit?.5:.25);if(crit)G.hitStop=.04;ev(crit?'crit':'jab');bars();if(foe<=0){fin(true)}return}
      if(ph!=='tele')return;if(k===dir){ph='counter';pt=1.0;mid.className='sd-vt-mid open';A.textContent='!';T.textContent='Nu slaan!';fx('ok');ev('dodge:'+dir)}
      else{pt=0}},
    end:r=>{cancelAnimationFrame(raf);close();res(r)}}})}
/* ---------- binnenhalen (vissen): houd de vis in het vak ---------- */
// o: {name, kracht 0..1 (hoe wild de vis is), vak (breedte van jouw vak 0..1)}
function haal(o){return new Promise(res=>{const wd=clamp(o.vak||.26,.14,.4),wild=clamp(o.kracht||.3,.05,1);let p=.3,v=0,f=.5,fv=0,ft=0,prog=.32,last=performance.now(),raf=0;
  open(o.title||'Beet!',o.sub||'Houd ingedrukt om in te halen. Houd de vis in het vak.',`<div class="sd-hl"><div class="sd-hl-bar"><i class="z"></i><i class="f">${K.ic.vis||''}</i></div><i class="sd-wire-t big"><i></i></i></div><button class="btn sd-mini-go" data-tap>${touch?'Houd vast':'<kbd>E</kbd> vasthouden'}</button>`);
  const z=q('.z'),fe=q('.f'),pb=q('.sd-wire-t>i');z.style.width=wd*100+'%';
  const loop=()=>{if(!cur)return;const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;if(G.paused){raf=requestAnimationFrame(loop);return}
    v+=(held.tap?2.6:-2.1)*dt;v*=Math.pow(.2,dt);p+=v*dt;if(p<0){p=0;v=Math.abs(v)*.3}if(p>1-wd){p=1-wd;v=-Math.abs(v)*.3}
    ft-=dt;if(ft<=0){ft=rr(.35,1.1)/(.6+wild);fv=rr(-1,1)*(.25+wild*.9)}f=clamp(f+fv*dt,.03,.97);if(f<=.03||f>=.97)fv=-fv;
    const inZ=f>=p&&f<=p+wd;prog+=(inZ?dt/2.4:-dt/(4.2-wild*1.6));z.style.left=p*100+'%';fe.style.left=f*100+'%';z.classList.toggle('on',inZ);pb.style.width=clamp(prog,0,1)*100+'%';
    if(o.tick)o.tick(inZ,prog);if(prog>=1){cur.end({ok:true});return}if(prog<=0){cur.end({ok:false});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:()=>{},end:r=>{cancelAnimationFrame(raf);close();res(r)}}})}
/* ---------- eigen paneel (dobbelen en zo): de aanroeper vult het zelf ---------- */
function paneel(title,sub,body,o){o=o||{};open(title,sub,body,o.cls);cur={key:k=>{o.key&&o.key(k)},end:r=>{close();o.onEnd&&o.onEnd(r)}};return {el:mp,q,close:r=>{if(cur)cur.end(r||'cancel')},set:(t,s)=>{if(t!=null)q('.sd-mini-h b').textContent=t;if(s!=null)q('.sd-mini-h small').textContent=s}}}
G.mini={timing,mash,hold,ritme,vecht,haal,paneel,active:()=>!!cur||!!H,stop:()=>{if(cur)cur.end('cancel')}};
})();
