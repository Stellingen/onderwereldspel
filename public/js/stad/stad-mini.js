// Pixelstad: gedeelde spelletjes voor alles wat je in de stad doet. Het spel neemt het scherm over (donkere, wazige laag over
// de wereld, groot paneel in het midden; op de telefoon onderin met grote knoppen), bediening met toetsen of knoppen:
//  - G.mini.timing: druk als het streepje in het groene vlak staat (zakkenrollen, tag)
//  - G.mini.mash: snel achter elkaar drukken
//  - G.mini.hold: knop vasthouden tot de balk vol is (doorzoeken, beschermgeld, kist openbreken)
//  - G.mini.ritme: druk de pijl die in het vak komt (straatoptreden)
//  - G.mini.vecht: knokken. Ontwijk de klap in de goede richting, sla terug als het kan (wijkbaas, vechtclub)
//  - G.mini.haal: houd de vis in het vak tot hij binnen is (vissen)
// o.vak = sleutel voor vakmanschap (stad-vak.js); zonder sleutel telt het spel zelf. Hoe beter je bent, hoe ruimer het spel.
// Elk spel geeft een Promise terug met de uitslag. Esc of het kruisje = stoppen ('cancel').
(function(){
'use strict';
const G=STAD,K=G.kit,E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=k=>{try{return G.vak?clamp(G.vak.ease(k),0,1):0}catch(e){return 0}};
const mp=document.createElement('div');mp.className='sd-mini sd-mini2';mp.id='sdMini2';mp.hidden=true;document.body.appendChild(mp);
let cur=null,hideT=0;const held={tap:false};
function open(title,sub,body,cls,vk){clearTimeout(hideT);mp.className='sd-mini sd-mini2 sd-stage'+(cls?' '+cls:'');
  mp.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub||'')}</small><button class="sd-x" data-mx aria-label="Stoppen">×</button></div>${vk&&G.vak?G.vak.bar(vk):''}<div class="sd-mini-b">${body}</div>`;
  mp.hidden=false;mp.classList.remove('go');void mp.offsetWidth;mp.classList.add('go');G.talking=true;held.tap=false;G.vak&&G.vak.stage('mini',1);if(vk)fx('whoosh')}
// r = uitslag (of 'cancel'), vk = vakmanschap-sleutel, lab = [tekst bij gelukt, tekst bij mislukt]
function close(r,vk,lab){cur=null;G.talking=false;held.tap=false;const hide=()=>{mp.hidden=true;mp.classList.remove('res','win','lose')};
  if(G.vak)hideT=G.vak.finish(mp,'mini',vk,r,hide,lab);else hide()}
const q=s=>mp.querySelector(s);
mp.addEventListener('click',e=>{if(e.target.closest('[data-mx]')){cur&&cur.end('cancel');return}const b=e.target.closest('[data-k]');if(b&&cur&&cur.key&&!('tap' in b.dataset))cur.key(b.dataset.k)});
mp.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tap]');if(b&&cur){e.preventDefault();held.tap=true;b.classList.add('dn');cur.key&&cur.key(b.dataset.k||'tap')}});
const up=()=>{held.tap=false;mp.querySelectorAll('.dn').forEach(b=>b.classList.remove('dn'))};addEventListener('pointerup',up);addEventListener('pointercancel',up);
const MAP={' ':'tap',e:'tap',enter:'tap',arrowleft:'L',arrowup:'U',arrowright:'R',arrowdown:'D',a:'L',w:'U',d:'R',s:'D'};
addEventListener('keydown',e=>{if(!cur)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();cur.end('cancel');return}
  const m=MAP[k];if(m){e.preventDefault();e.stopImmediatePropagation();if(m==='tap')held.tap=true;if(!e.repeat&&cur.key)cur.key(m)}},true);
addEventListener('keyup',e=>{const m=MAP[e.key.toLowerCase()];if(m==='tap')held.tap=false},true);
const tapBtn=(t,k)=>`<button class="btn sd-mini-go" data-tap data-k="${k||'tap'}">${touch?'':'<kbd>Spatie</kbd> '}${E(t)}</button>`;
const ARW={L:'←',U:'↑',R:'→',D:'↓'};
const fx=k=>{try{G.snd&&G.snd.fx(k)}catch(e){}};
const buzz=ms=>{if(navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};
// korte tekst die over het spel springt (Raak!, Mis!)
function pop(el,t,cls){if(!el)return;el.textContent=t;el.className=el.className.split(' ')[0]+' '+cls;void el.offsetWidth;el.classList.add('on')}
/* ---------- timing: streepje in het groene vlak ---------- */
// Beginner: dun groen vlak, snel streepje. Met vakmanschap: breder vlak, trager streepje, een misser extra en meer speling.
function timing(o){return new Promise(res=>{const vk=o.vak||'timing',e=ease(vk),n=o.n||3,sp=(o.sp||1.4)*(1-.3*e),allow=(o.allow==null?1:o.allow)+(e>.7?1:0),grace=(30+30*e)/1000;
  let w=clamp((o.w||.2)*(.55+.9*e),.06,.4),pin=0,miss=0,c=rr(.2,.8),t0=performance.now(),raf=0,lock=0,over=false;
  open(o.title||'Timing',o.sub||'Druk als het streepje in het groen staat',`<div class="sd-pick"><div class="sd-pick-bar"><i class="z"><i></i></i><i class="g"></i><i class="m"></i><b class="sd-pop"></b></div>
    <div class="sd-pick-ft"><div class="sd-pick-pins">${Array.from({length:n},(_,i)=>`<i data-p="${i}"></i>`).join('')}</div><div class="sd-pick-miss"></div></div></div>${tapBtn(o.label||'Nu!')}`,'',vk);
  const bar=q('.sd-pick-bar'),z=q('.z'),mk=q('.m'),gh=q('.g'),pp=q('.sd-pop'),ms=q('.sd-pick-miss');
  const zone=()=>{z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%'};zone();
  const lives=()=>{const l=allow-miss;ms.textContent=l<=0?'Je mag niet missen':'Je mag nog '+l+' keer missen';ms.classList.toggle('last',l<=0)};lives();
  const at=t=>(Math.sin((t-t0)/1000*sp*Math.PI)+1)/2;
  const loop=()=>{if(!cur)return;mk.style.left=at(performance.now())*100+'%';if(o.tick&&o.tick()===false){cur.end('cancel');return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  const ghost=(p,cls)=>{gh.style.left=p*100+'%';gh.className='g '+cls;void gh.offsetWidth;gh.classList.add('on')};
  cur={key:k=>{if(k!=='tap'||over)return;const now=performance.now();if(now<lock)return;
      // een beetje speling voor de vertraging van het scherm: wat je net zag telt ook
      const p0=at(now),p1=at(now-grace*1000),d0=Math.abs(p0-c),d1=Math.abs(p1-c),dd=Math.min(d0,d1);
      if(dd<=w/2){const P=q(`[data-p="${pin}"]`);P&&P.classList.add('ok');pin++;ghost(d0<=d1?p0:p1,'ok');
        pop(pp,dd<w/7?'Perfect!':'Raak!','ok');bar.classList.remove('bad','hit');void bar.offsetWidth;bar.classList.add('hit');fx(pin>=n?'ok':'blip');buzz(15);o.hit&&o.hit(pin);
        if(pin>=n){over=true;setTimeout(()=>cur&&cur.end({ok:true,miss}),260);return}
        lock=now+230;setTimeout(()=>{if(!cur||over)return;let nc;do{nc=rr(.14,.86)}while(Math.abs(nc-c)<.18);c=nc;if(o.shrink)w=Math.max(.06,w*o.shrink);zone();t0=performance.now()-rr(0,800)},180)}
      else{miss++;ghost(p0,'bad');pop(pp,'Mis!','bad');bar.classList.remove('bad','hit');void bar.offsetWidth;bar.classList.add('bad');fx('bad');buzz(60);G.shake&&G.shake(.2);
        lock=now+180;if(miss>allow){over=true;ms.textContent='Te vaak mis';setTimeout(()=>cur&&cur.end({ok:false,miss}),300)}else lives()}},
    end:r=>{cancelAnimationFrame(raf);close(r,vk,['Gelukt','Mislukt']);res(r)}}})}
/* ---------- snel drukken ---------- */
function mash(o){return new Promise(res=>{const vk=o.vak||'mash',e=ease(vk);let n=0;const need=Math.max(3,Math.round((o.need||8)*(1.2-.45*e))),T=(o.time||3.5)*(.9+.35*e),t0=performance.now();let raf=0,over=false;
  open(o.title||'Snel!',o.sub||'Druk snel achter elkaar',`<div class="sd-ms"><i class="sd-ms-bar"><i></i><b>0 / ${need}</b></i><i class="sd-ms-t"><i></i></i></div>${tapBtn(o.label||'Druk!')}`,'',vk);
  const tb=q('.sd-ms-bar>i'),tt=q('.sd-ms-bar>b'),tm=q('.sd-ms-t>i');const loop=()=>{if(!cur)return;const t=(performance.now()-t0)/1000;tb.style.width=clamp(n/need,0,1)*100+'%';tm.style.width=clamp(1-t/T,0,1)*100+'%';
    if(t>T&&!over){over=true;cur.end({ok:false});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(k!=='tap'||over)return;n++;tt.textContent=n+' / '+need;fx(o.fx||'grab');G.shake&&G.shake(.15);o.hit&&o.hit(n);if(n>=need){over=true;cur.end({ok:true,t:(performance.now()-t0)/1000})}},end:r=>{cancelAnimationFrame(raf);close(r,vk);res(r)}}})}
/* ---------- vasthouden: houd de knop (of E/spatie) vast tot de balk vol is ---------- */
function hold(o){return new Promise(res=>{if(cur){res('cancel');return}const vk=o.vak||'hold',e=ease(vk),d=(o.d||1.5)*(1.25-.5*e),decay=.8*(1.3-.6*e),wait=Math.max(o.wait||6,4);let t=0,idle=0,last=performance.now(),raf=0;
  open(o.title||o.label||'Bezig',o.sub||(touch?'Houd de knop vast tot de balk vol is':'Houd spatie of E vast tot de balk vol is'),
    `<div class="sd-hd"><i class="sd-hd-bar"><i></i><b>0%</b></i></div><button class="btn sd-mini-go" data-tap data-k="hold">${touch?'Houd vast':'<kbd>Spatie</kbd> Houd vast'}</button>`,'',vk);
  const hb=q('.sd-hd-bar>i'),ht=q('.sd-hd-bar>b'),box=q('.sd-hd');
  const loop=()=>{if(!cur)return;const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(G.paused){raf=requestAnimationFrame(loop);return}
    if(o.can&&!o.can()){cur.end('cancel');return}const on=held.tap||G.K.e||G.K[' ']||G.actHold;box.classList.toggle('on',!!on);
    if(on){t+=dt;idle=0;o.tick&&o.tick(t/d)}else{t=Math.max(0,t-dt*decay);idle+=dt;if(idle>wait){cur.end('cancel');return}}
    hb.style.width=clamp(t/d,0,1)*100+'%';ht.textContent=Math.floor(clamp(t/d,0,1)*100)+'%';if(t>=d){fx('ok');cur.end('ok');return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:()=>{},end:r=>{cancelAnimationFrame(raf);close(r,vk,['Klaar','Mislukt']);res(r)}}})}
/* ---------- ritme: pijlen die in het vak komen ---------- */
function ritme(o){return new Promise(res=>{const vk=o.vak||'ritme',e=ease(vk),n=o.n||16,gap=o.gap||.62,lead=1.7,win=(o.win||.17)*(.8+.7*e),notes=[];let t=1.2;for(let i=0;i<n;i++){notes.push({t,k:pick(['L','U','R','D']),st:0});t+=gap*(Math.random()<.25?.5:1)}
  const total=t+.8;let hits=0,combo=0,best=0,t0=performance.now(),raf=0;
  open(o.title||'Optreden',o.sub||'Druk de pijl als hij in het vak staat',`<div class="sd-rit"><div class="sd-rit-tr"><i class="sd-rit-z"></i>${notes.map((x,i)=>`<b data-n="${i}" class="k${x.k}">${ARW[x.k]}</b>`).join('')}<b class="sd-pop"></b></div><div class="sd-rit-s"><span id="sdRitC">0 / ${n}</span><em id="sdRitM"></em></div></div>
    <div class="sd-wire-b sd-rit-b">${['L','U','R','D'].map(k=>`<button data-tap data-k="${k}" class="k${k}" aria-label="${ARW[k]}"><b>${ARW[k]}</b></button>`).join('')}</div>`,'wide',vk);
  const els=[...mp.querySelectorAll('[data-n]')],pp=q('.sd-rit-tr .sd-pop');
  const loop=()=>{if(!cur)return;const now=(performance.now()-t0)/1000;notes.forEach((x,i)=>{const d=x.t-now,el=els[i];if(x.st){return}if(d<-win){x.st=-1;el.classList.add('miss');combo=0;o.miss&&o.miss();return}
      const p=.14+clamp(d/lead,0,1.2)*.86;el.style.left=p*100+'%';el.style.opacity=d>lead?0:1});
    if(now>total){cur.end({ok:hits>=n*.5,score:hits/n,hits,n,best});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(!ARW[k])return;const now=(performance.now()-t0)/1000;const x=notes.find(x=>!x.st&&Math.abs(x.t-now)<=win*1.6);
      if(x&&x.k===k&&Math.abs(x.t-now)<=win){x.st=1;hits++;combo++;best=Math.max(best,combo);els[notes.indexOf(x)].classList.add('ok');fx('blip');pop(pp,combo>2?combo+'×':'Raak','ok');o.hit&&o.hit(combo);q('#sdRitC').textContent=hits+' / '+n;q('#sdRitM').textContent=combo>2?combo+'× raak':''}
      else{combo=0;q('#sdRitM').textContent='';fx('click');pop(pp,'Mis','bad');if(x){x.st=-1;els[notes.indexOf(x)].classList.add('miss')}o.miss&&o.miss()}},
    end:r=>{cancelAnimationFrame(raf);close(r,vk,['Goed gespeeld','Uit de maat']);res(r)}}})}
/* ---------- knokken ---------- */
// o: {name, hp (tegenstander), dmg (per klap op jou), win (reactietijd in s), pow (jouw kracht), on(evt)}
function vecht(o){return new Promise(res=>{const vk=o.vak||'vecht',e=ease(vk);let you=100,foe=o.hp||100,ph='idle',pt=rr(.9,1.6),dir='L',jabCd=0,last=performance.now(),raf=0,done=false;
  const pow=o.pow||1,win=(o.win||.7)*(.85+.5*e),dmg=(o.dmg||14)*(1.2-.5*e);
  open(o.name||'Knokken',o.sub||'Ontwijk de klap, sla dan terug',`<div class="sd-vt"><div class="sd-vt-bars"><span><small>Jij</small><i class="you"><i></i></i></span><span><small>${E(o.short||'Hij')}</small><i class="foe"><i></i></i></span></div>
    <div class="sd-vt-mid"><b id="sdVtA"></b><i class="sd-vt-ring"><i></i></i><em id="sdVtT">Zoek een opening…</em></div></div>
    <div class="sd-vt-b"><button data-tap data-k="L" aria-label="Links ontwijken"><b>←</b></button><button data-tap data-k="U" aria-label="Bukken"><b>↑</b></button><button data-tap data-k="R" aria-label="Rechts ontwijken"><b>→</b></button><button class="hit" data-tap data-k="tap">${touch?'Sla!':'<kbd>Spatie</kbd> Sla!'}</button></div>`,'wide',vk);
  const yb=q('.you>i'),fb=q('.foe>i'),A=q('#sdVtA'),T=q('#sdVtT'),ring=q('.sd-vt-ring>i'),mid=q('.sd-vt-mid');
  const bars=()=>{yb.style.width=clamp(you,0,100)+'%';fb.style.width=clamp(foe/(o.hp||100),0,1)*100+'%'};bars();
  const ev=k=>{try{o.on&&o.on(k)}catch(e){}};
  const fin=w=>{if(done)return;done=true;ev(w?'win':'lose');cur.end({ok:w,you,foe})};
  const loop=()=>{if(!cur)return;const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(G.paused){raf=requestAnimationFrame(loop);return}pt-=dt;jabCd-=dt;
    if(ph==='idle'&&pt<=0){ph='tele';pt=win;dir=pick(['L','R','U']);A.textContent=ARW[dir];mid.className='sd-vt-mid tele';T.textContent=dir==='U'?'Bukken!':dir==='L'?'Naar links!':'Naar rechts!';fx('tab');ev('tele:'+dir)}
    else if(ph==='tele'){ring.style.transform='scale('+(.25+.75*clamp(pt/win,0,1))+')';if(pt<=0){you-=dmg;fx('hit');G.shake&&G.shake(.9);G.hitStop=.06;buzz(50);ev('hit');bars();ph='idle';pt=rr(.8,1.5);A.textContent='';mid.className='sd-vt-mid au';T.textContent='Au!';if(you<=0){fin(false);return}}}
    else if(ph==='counter'&&pt<=0){ph='idle';pt=rr(.7,1.4);mid.className='sd-vt-mid';T.textContent='Zoek een opening…';A.textContent=''}
    raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:k=>{if(done)return;
      if(k==='tap'){if(jabCd>0)return;jabCd=.22;if(ph==='tele'){T.textContent='Niet slaan, ontwijken!';return}
        const crit=ph==='counter',blocked=!crit&&Math.random()<(o.block==null?.3:o.block);if(blocked){fx('click');ev('blok');T.textContent='Geblokt';return}
        const d=rr(4,6)*pow*(crit?2.1:1);foe-=d;fx(crit?'punch':'hit');G.shake&&G.shake(crit?.5:.25);if(crit)G.hitStop=.04;ev(crit?'crit':'jab');bars();mid.classList.remove('jab');void mid.offsetWidth;mid.classList.add('jab');if(foe<=0){fin(true)}return}
      if(ph!=='tele')return;if(k===dir){ph='counter';pt=1.0+.3*e;mid.className='sd-vt-mid open';A.textContent='!';T.textContent='Nu slaan!';fx('ok');ev('dodge:'+dir)}
      else{pt=0}},
    end:r=>{cancelAnimationFrame(raf);close(r,vk,['Gewonnen','Verloren']);res(r)}}})}
/* ---------- binnenhalen (vissen): houd de vis in het vak ---------- */
// o: {name, kracht 0..1 (hoe wild de vis is), vak (breedte van jouw vak 0..1)}
function haal(o){return new Promise(res=>{const vk=typeof o.vak==='string'?o.vak:'haal',e=ease(vk),wd=clamp((typeof o.vak==='number'?o.vak:o.vakW||.26)*(.8+.5*e),.12,.45),wild=clamp(o.kracht||.3,.05,1);let p=.3,v=0,f=.5,fv=0,ft=0,prog=.32,last=performance.now(),raf=0;
  open(o.title||'Beet!',o.sub||'Houd ingedrukt om in te halen. Houd de vis in het vak.',`<div class="sd-hl"><div class="sd-hl-bar"><i class="z"></i><i class="f">${K.ic.vis||''}</i></div><i class="sd-wire-t big"><i></i></i></div><button class="btn sd-mini-go" data-tap>${touch?'Houd vast':'<kbd>Spatie</kbd> vasthouden'}</button>`,'',vk);
  const z=q('.z'),fe=q('.f'),pb=q('.sd-wire-t>i');z.style.width=wd*100+'%';
  const loop=()=>{if(!cur)return;const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;if(G.paused){raf=requestAnimationFrame(loop);return}
    v+=(held.tap?2.6:-2.1)*dt;v*=Math.pow(.2,dt);p+=v*dt;if(p<0){p=0;v=Math.abs(v)*.3}if(p>1-wd){p=1-wd;v=-Math.abs(v)*.3}
    ft-=dt;if(ft<=0){ft=rr(.35,1.1)/(.6+wild);fv=rr(-1,1)*(.25+wild*.9)}f=clamp(f+fv*dt,.03,.97);if(f<=.03||f>=.97)fv=-fv;
    const inZ=f>=p&&f<=p+wd;prog+=(inZ?dt/2.4:-dt/(4.2-wild*1.6));z.style.left=p*100+'%';fe.style.left=f*100+'%';z.classList.toggle('on',inZ);pb.style.width=clamp(prog,0,1)*100+'%';
    if(o.tick)o.tick(inZ,prog);if(prog>=1){fx('ok');cur.end({ok:true});return}if(prog<=0){cur.end({ok:false});return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  cur={key:()=>{},end:r=>{cancelAnimationFrame(raf);close(r,vk,['Binnen!','Ontsnapt']);res(r)}}})}
/* ---------- eigen paneel (dobbelen en zo): de aanroeper vult het zelf ---------- */
function paneel(title,sub,body,o){o=o||{};open(title,sub,body,o.cls);cur={key:k=>{o.key&&o.key(k)},end:r=>{close(r);o.onEnd&&o.onEnd(r)}};return {el:mp,q,close:r=>{if(cur)cur.end(r||'cancel')},set:(t,s)=>{if(t!=null)q('.sd-mini-h b').textContent=t;if(s!=null)q('.sd-mini-h small').textContent=s}}}
G.mini={timing,mash,hold,ritme,vecht,haal,paneel,active:()=>!!cur,stop:()=>{if(cur)cur.end('cancel')}};
})();
