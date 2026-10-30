// Werk in de bajes: vier korte klusjes, elk een eigen spelletje van 15–25 seconden.
// Wasserij = sorteren, Keuken = timing, Werkplaats = ritme, Bibliotheek = geheugen.
// Loon is bescheiden en groeit wat met je rang (jjBase). Goed werk haalt tijd van je straf (gedrag, max 40% per straf, bajes.js).
// De wachttijd start zodra je begint, dus verversen helpt niet. Is je straf voorbij tijdens het werk, dan krijg je het loon
// tot dan toe, zonder strafvermindering. Ga je weg (andere pagina, app naar de achtergrond), dan stopt het klusje zonder loon.
const JJ_JOBS=[
 {id:'was',n:'Wasserij',kind:'Sorteren',col:'var(--ice)',pay:1,cut:1,cd:60,t:16,
  d:'Oranje overalls bij oranje, wit bij wit. De bewaker telt mee.',how:'Pijltje links of rechts, of tik op de goede mand, voordat het balkje onder het kledingstuk leeg is.'},
 {id:'keuken',n:'Keuken',kind:'Timing',col:'var(--acc)',pay:1.15,cut:.9,cd:75,t:17,
  d:'Opscheppen voor blok C. Wie morst, hoort het de rest van de week.',how:'Druk op spatie of tik zodra een dienblad onder de pollepel staat. Precies in het midden is perfect. Mis je, dan morst je.'},
 {id:'werk',n:'Werkplaats',kind:'Ritme',col:'var(--green)',pay:1.4,cut:.7,cd:90,t:18,
  d:'Nummerborden persen in de maat van de machine. Betaalt het best.',how:'Druk op spatie of tik als een blokje de groene streep raakt. Elke goede klap slaat een teken in het bord.'},
 {id:'bieb',n:'Bibliotheek',kind:'Geheugen',col:'var(--violet)',pay:.6,cut:1.4,cd:75,t:25,
  d:'Boeken terug op de goede plank. De directeur ziet het graag.',how:'Draai twee boeken om. Zoek de zes paren voordat de tijd op is.'}];
const jjBase=()=>Math.round(30*Math.pow(1.5,rankIdx(S.xp))/5)*5;
const jjPay=(j,s)=>s<.2?0:Math.max(5,Math.round(jjBase()*j.pay*(.35+.65*s)/5)*5);
const jjCutTop=j=>{const L=S.cel&&S.cel.live;return L?Math.round(j.cut*Math.min(45,Math.max(6,L.sent*.09))):0};
const jjCutLeft=()=>{const L=S.cel&&S.cel.live;return L?Math.max(0,L.max-L.cut):0};
const jjCut=(j,s)=>s<.2?0:Math.min(jjCutLeft(),Math.round(jjCutTop(j)*s));
const JJ_IC={was:'<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 7.5h16"/><circle cx="12" cy="14.2" r="4.2"/><path d="M9.7 14.8c1.1-.9 3.5.9 4.6 0"/><path d="M7 5.2h.01M9.5 5.2h.01"/>',
 keuken:'<path d="M4 11h16v2.5A6.5 6.5 0 0 1 13.5 20h-3A6.5 6.5 0 0 1 4 13.5z"/><path d="M2.5 11h19"/><path d="M14 11l5-8"/><path d="M8.5 7.5c0-1.5 1.2-1.8 1.2-3.3"/>',
 werk:'<rect x="3" y="12" width="18" height="8" rx="1"/><path d="M6.5 16h2M10.5 16h3M15.5 16h2"/><path d="M9 3h6v4H9z"/><path d="M12 7v3"/>',
 bieb:'<path d="M4 4h4v16H4zM9.5 6.5h4V20h-4z"/><path d="M15.2 7.2l3.6-1 3.4 13-3.6 1z"/>'};
const jjIcon=id=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${JJ_IC[id]}</svg>`;

function jjJobsHtml(L){const left=jjCutLeft(),B=celBase().best;
 return `<div class="jl-sec"><h2>Werk in de bajes</h2><p>${left?'Elk klusje duurt een halve minuut of korter. Je verdient een paar euro, en goed werk haalt tijd van je straf.':'Je gedrag staat op het maximum. Vanaf nu werk je alleen nog voor het geld.'}</p></div>
 <div class="jl-jobs">${JJ_JOBS.map(j=>{const ok=!cdLeft('jj_'+j.id),cut=Math.min(left,jjCutTop(j));
  return `<article class="jl-job" style="--jc:${j.col}"><div class="jl-job-top"><span class="jl-ic">${jjIcon(j.id)}</span><span class="jl-kind">${j.kind}</span></div>
   <h3>${j.n}</h3><p>${j.d}</p>
   <div class="jl-job-r"><div><span class="label">Loon</span><b>tot ${fmt(jjPay(j,1))}</b></div><div><span class="label">Straf</span><b>${cut?'tot −'+cut+'s':'max bereikt'}</b></div></div>
   <small class="jl-best">${B[j.id]!=null?'Beste score: '+B[j.id]+'%':'Nog niet gedaan'}</small>
   <button class="btn ${ok?'':'ghost'}" onclick="JJ.open('${j.id}')" ${ok?'':'disabled'}>${ok?'Aan de slag':'Weer over <span data-jj="cd:'+j.id+'"></span>'}</button></article>`}).join('')}</div>`}

function jjClose(ov){ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;if(page==='jail')render()},220)}
const JJ={
 ev:i=>celChoose(i),
 async open(id){const j=JJ_JOBS.find(x=>x.id===id);if(!j||window.__chase||!inJail()||cdLeft('jj_'+id))return;
  window.__chase=true;try{SFX.click()}catch(e){}
  const cut=jjCut(j,1),ov=document.createElement('div');ov.className='jj-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label',j.n);
  ov.innerHTML=`<div class="jj-box jj-${j.id}" style="--jc:${j.col}">
   <div class="jj-head"><span class="jl-ic">${jjIcon(j.id)}</span><div><span class="label">Werk in de bajes · ${j.kind}</span><h2>${j.n}</h2></div>
    <div class="jj-score" hidden><span><b data-k="ok">0</b><small>goed</small></span><span><b data-k="bad">0</b><small>fout</small></span></div></div>
   <div class="jj-time"><i></i></div>
   <div class="jj-body"><div class="jj-intro"><p>${j.d}</p><div class="jj-how"><span class="label">Zo werkt het</span><p>${j.how}</p></div>
    <div class="jj-rw"><div><span class="label">Loon</span><b>tot ${fmt(jjPay(j,1))}</b></div><div><span class="label">Straf</span><b>${cut?'tot −'+cut+'s':'gedrag op max'}</b></div><div><span class="label">Duur</span><b>±${j.t}s</b></div></div>
    <div class="jj-btns"><button class="btn ghost" type="button" data-a="back">Terug</button><button class="btn" type="button" data-a="go">Begin</button></div></div></div></div>`;
  document.body.appendChild(ov);
  const go=await new Promise(res=>{let d=false;const done=v=>{if(d)return;d=true;document.removeEventListener('keydown',k,true);res(v)};
   const k=e=>{if(e.code==='Escape'){e.preventDefault();done(false)}else if(e.code==='Enter'||e.code==='Space'){e.preventDefault();done(true)}};
   document.addEventListener('keydown',k,true);ov.querySelector('[data-a="back"]').onclick=()=>done(false);ov.querySelector('[data-a="go"]').onclick=()=>done(true);
   ov.addEventListener('click',e=>{if(e.target===ov)done(false)});setTimeout(()=>{const b=ov.querySelector('[data-a="go"]');b&&b.focus({preventScroll:true})},60)});
  if(!go||!inJail()||cdLeft('jj_'+id)||page!=='jail'){jjClose(ov);return}
  S.cd['jj_'+id]=now()+j.cd*1000*waitK();save();
  ov.querySelector('.jj-score').hidden=false;
  const r=await jjPlay(j,ov);
  jjSettle(j,r,ov)}};

// De spellus: tijdbalk, stoppen bij weggaan of vrijlating, en het spel zelf (JJ_GAMES) per frame.
function jjPlay(j,ov){return new Promise(resolve=>{
 const body=ov.querySelector('.jj-body'),bar=ov.querySelector('.jj-time i');let raf=0,t0=0,last=0,over=false;
 const G={j,ov,body,dur:j.t*1000,get over(){return over},now:()=>t0?performance.now()-t0:-1,
  score(k,v){const e=ov.querySelector(`[data-k="${k}"]`);if(e)e.textContent=v},
  msg(t,c){const m=ov.querySelector('.jj-msg');if(!m)return;m.textContent=t;m.className='jj-msg'+(c?' '+c:'');void m.offsetWidth;m.classList.add('pop')},
  end(r){finish(r||'done')}};
 body.innerHTML='';const game=JJ_GAMES[j.id](G);body.insertAdjacentHTML('beforeend','<p class="jj-msg" aria-live="polite"></p>');
 const onKey=e=>{if(over)return;if(e.repeat){if(/^(Space|Arrow)/.test(e.code))e.preventDefault();return}if(game.key&&game.key(e.code)){e.preventDefault();e.stopPropagation()}};
 const onHash=()=>{if(page!=='jail')finish('left')},onVis=()=>{if(document.hidden)finish('hidden')};
 document.addEventListener('keydown',onKey,true);window.addEventListener('hashchange',onHash);document.addEventListener('visibilitychange',onVis);
 function finish(reason){if(over)return;over=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',onKey,true);window.removeEventListener('hashchange',onHash);document.removeEventListener('visibilitychange',onVis);
  let r={s:0,detail:''};try{r=game.result()}catch(e){}try{game.stop&&game.stop()}catch(e){}resolve(Object.assign({reason},r))}
 // tekenen en beoordelen met dezelfde klok (de tijd van een frame kan bij trage frames ver achterlopen)
 const loop=()=>{if(over)return;const t=performance.now();if(!t0)t0=last=t;const el=t-t0,dt=Math.min(50,t-last);last=t;
  if(!inJail())return finish('free');
  bar.style.width=Math.max(0,100-el/G.dur*100)+'%';bar.classList.toggle('low',el>G.dur*.75);
  game.frame(el,dt);if(over)return;if(el>=G.dur)return finish('time');raf=requestAnimationFrame(loop)};
 setTimeout(()=>{if(!over)raf=requestAnimationFrame(loop)},350)})}

function jjSettle(j,r,ov){const c=celBase(),s=Math.max(0,Math.min(1,r.s||0)),B=ov.querySelector('.jj-body');
 if(r.reason==='left'||r.reason==='hidden'){log(j.n+' in de bajes: afgebroken, geen loon','bad');save();jjClose(ov);toast(j.n+' afgebroken. Geen loon.','bad');return}
 const free=r.reason==='free'||!inJail(),pay=jjPay(j,s),cut=free?0:celGood(jjCut(j,s));
 if(pay){S.cash+=pay;c.tot.pay+=pay}c.tot.jobs++;if(c.live)c.live.jobs++;c.best[j.id]=Math.max(c.best[j.id]||0,Math.round(s*100));
 const grade=s<.2?'Rommel':s<.5?'Matig':s<.75?'Netjes':s<.95?'Goed werk':'Perfect';
 const line=j.n+': '+(pay?fmt(pay):'geen loon')+(cut?', '+fmtTime(cut)+' eraf':'');
 log(j.n+' in de bajes: '+(pay?fmt(pay):'geen loon')+(cut?', '+fmtTime(cut)+' eraf':''),pay?'ok':'bad');toast(line,pay?'ok':'bad');save();
 B.innerHTML=`<div class="jj-res ${free?'':s>=.5?'ok':s<.2?'bad':''}"><span class="label">${free?'De bewaker zet je buiten':'Klaar'}</span><h3>${free?'Je straf zit erop':grade}</h3><p>${r.detail||''}${s<.2&&!free?'. De bewaker stuurt je terug naar je cel.':''}</p>
  <div class="jj-rw"><div><span class="label">Loon</span><b>${pay?'+'+fmt(pay):'€0'}</b></div><div><span class="label">Straf</span><b>${cut?'−'+fmtTime(cut):free?'vrij':jjCutLeft()?'—':'gedrag op max'}</b></div><div><span class="label">Score</span><b>${Math.round(s*100)}%</b></div></div>
  <button class="btn" type="button" data-a="close">${free?'Sluiten':'Terug naar je cel'}</button></div>`;
 try{s>=.5?SFX.win(1):SFX.lose()}catch(e){}
 let closed=false;const kc=e=>{if(e.code==='Enter'||e.code==='Escape'){e.preventDefault();close()}};
 const close=()=>{if(closed)return;closed=true;document.removeEventListener('keydown',kc,true);jjClose(ov)};
 setTimeout(()=>{if(!closed)document.addEventListener('keydown',kc,true)},400);B.querySelector('[data-a="close"]').onclick=close;setTimeout(close,3800)}

const JJ_GAMES={};
// Wasserij: sorteren. Oranje naar links, wit naar rechts. Steeds minder tijd per stuk.
const JW_SH={
 shirt:'<path d="M32 16 14 28l8 16 10-6v44h36V38l10 6 8-16-18-12c-3 6-9 9-18 9s-15-3-18-9z"/>',
 overall:'<path d="M36 10h28v14l9 5v19l-7 2V40l-3 50H55l-5-34-5 34H37l-3-50v10l-7-2V29l9-5z"/><path class="ln" d="M50 24v28"/>',
 laken:'<rect x="15" y="28" width="70" height="46" rx="3"/><path class="ln" d="M15 44h70M15 58h70"/>',
 sok:'<path d="M37 12h24v42l14 13c6 6 3 19-9 19H48c-8 0-13-6-13-13V12z"/><path class="ln" d="M37 22h24"/>',
 doek:'<rect x="17" y="26" width="66" height="50" rx="7"/><path class="ln" d="M17 63h66M17 69h66"/>'};
const jwSvg=(sh,c)=>`<svg viewBox="0 0 100 100" class="${c?'wit':'or'}">${JW_SH[sh]}</svg>`;
JJ_GAMES.was=G=>{const keys=Object.keys(JW_SH);
 G.body.innerHTML=`<div class="jw"><button class="jw-bin" type="button" data-s="0" aria-label="Oranje mand"><span class="jw-b or"></span><b>Oranje</b><small data-c="0">0</small><kbd>←</kbd></button>
  <div class="jw-mid"><div class="jw-item"></div><div class="jw-tb"><i></i></div></div>
  <button class="jw-bin" type="button" data-s="1" aria-label="Witte mand"><span class="jw-b wit"></span><b>Wit</b><small data-c="1">0</small><kbd>→</kbd></button></div>`;
 const it=G.body.querySelector('.jw-item'),tb=G.body.querySelector('.jw-tb i'),bins=[...G.body.querySelectorAll('.jw-bin')];
 let cur=null,ok=0,bad=0,el=0,cnt=[0,0],run=0,lastC=-1,wait=0;
 const next=()=>{if(G.over)return;let c=Math.random()<.5?0:1;if(c===lastC){if(++run>=3){c=1-c;run=0}}else run=0;lastC=c;
  const sh=keys[rnd(0,keys.length-1)];cur={c,sh,t:el,lim:1650-850*Math.min(1,el/G.dur),done:false};
  it.style.transition='none';it.style.transform='';it.style.opacity='';it.className='jw-item';it.innerHTML=jwSvg(sh,c);void it.offsetWidth;it.style.transition='';it.classList.add('in');tb.style.width='100%';tb.classList.remove('low')};
 const sort=s=>{if(!cur||cur.done||G.over||G.now()<0)return;cur.done=true;const right=s===cur.c;it.classList.remove('in');
  const b=bins[s].getBoundingClientRect(),r=it.getBoundingClientRect();it.style.transform=`translate(${Math.round(b.left+b.width/2-(r.left+r.width/2))}px,${Math.round(b.top+b.height*.4-(r.top+r.height/2))}px) scale(.3)`;it.style.opacity='0';
  bins[s].classList.remove('hit','miss');void bins[s].offsetWidth;bins[s].classList.add(right?'hit':'miss');
  if(right){ok++;cnt[s]++;G.body.querySelector(`[data-c="${s}"]`).textContent=cnt[s];G.score('ok',ok);try{SFX.tick()}catch(e){}}
  else{bad++;G.score('bad',bad);G.msg(cur.c?'Dat was wit':'Dat was oranje','bad')}
  wait=el+160};
 bins.forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();sort(+b.dataset.s)}));
 return {frame(t){el=t;if(!cur||(cur.done&&t>=wait)){next();return}
   if(!cur.done){const f=(t-cur.t)/cur.lim;tb.style.width=Math.max(0,100-f*100)+'%';tb.classList.toggle('low',f>.7);
    if(f>=1){cur.done=true;bad++;G.score('bad',bad);G.msg('Te laat','bad');it.classList.add('late');wait=t+240}}},
  key(k){if(k==='ArrowLeft'||k==='KeyA'){sort(0);return true}if(k==='ArrowRight'||k==='KeyD'){sort(1);return true}return false},
  result(){return {s:Math.max(0,Math.min(1,(ok-bad*.5)/14)),detail:`${ok} goed gesorteerd, ${bad} fout of te laat`}}}};

// Keuken: timing. Dienbladen schuiven onder de pollepel door; precies in het midden is perfect.
JJ_GAMES.keuken=G=>{
 G.body.innerHTML=`<div class="jk2" role="button" aria-label="Opscheppen"><div class="jk2-zone"><i></i></div>
  <div class="jk2-pan"><svg viewBox="0 0 120 90" aria-hidden="true"><path d="M104 2 70 50" stroke="#8a8f98" stroke-width="6" stroke-linecap="round"/><path d="M38 48h48a24 24 0 0 1-48 0z" fill="#2b3038" stroke="#8a8f98" stroke-width="3"/><path d="M44 54h36" stroke="#ff7a1a" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg></div>
  <div class="jk2-belt"></div><div class="jk2-trays"></div></div><button class="btn jk2-go" type="button">Opscheppen <kbd>spatie</kbd></button>`;
 const st=G.body.querySelector('.jk2'),box=G.body.querySelector('.jk2-trays'),pan=G.body.querySelector('.jk2-pan');
 const N=12,T=[];let at=450;for(let i=0;i<N;i++){const p=i/(N-1),trav=2500-900*p;T.push({at,trav,el:null,done:false,served:0});at+=1250-430*p+rnd(-110,110)}
 G.dur=T[N-1].at+T[N-1].trav+150;
 let ok=0,bad=0,perf=0,good=0,spill=0,miss=0,W=st.clientWidth,TW=0,el=0;
 const ro=new ResizeObserver(()=>{W=st.clientWidth});ro.observe(st);
 const xOf=(x,t)=>-TW+(t-x.at)/x.trav*(W+TW);
 const press=()=>{const t=G.now();if(G.over||t<0)return;pan.classList.remove('pour');void pan.offsetWidth;pan.classList.add('pour');
  let best=null,bd=1e9;T.forEach(x=>{if(!x.el||x.done||x.served)return;const d=Math.abs(xOf(x,t)+TW/2-W/2);if(d<bd){bd=d;best=x}});
  const f=bd/W;
  if(best&&f<=.05){best.served=2;perf++;ok++;G.msg('Perfect','ok');food(best,2);try{SFX.chip()}catch(e){}}
  else if(best&&f<=.11){best.served=1;good++;ok++;G.msg('Goed','');food(best,1);try{SFX.tick()}catch(e){}}
  else{spill++;bad++;G.msg('Gemorst','bad');const s=document.createElement('i');s.className='jk2-spill';st.appendChild(s);setTimeout(()=>s.remove(),600)}
  G.score('ok',ok);G.score('bad',bad)};
 const food=(x,q)=>{x.el.insertAdjacentHTML('beforeend',`<b class="jk2-food q${q}"></b>`);x.el.classList.add('full')};
 G.body.querySelector('.jk2-go').addEventListener('pointerdown',e=>{e.preventDefault();press()});
 st.addEventListener('pointerdown',e=>{e.preventDefault();press()});
 return {frame(t){el=t;
   T.forEach(x=>{if(!x.el&&!x.done&&t>=x.at){x.el=document.createElement('div');x.el.className='jk2-tray';x.el.innerHTML='<i></i><i></i><i></i>';box.appendChild(x.el);if(!TW)TW=x.el.offsetWidth||80}
    if(x.el){const l=xOf(x,t);x.el.style.transform=`translateX(${l.toFixed(1)}px)`;if(l>W){if(!x.served){miss++;bad++;G.score('bad',bad);G.msg('Leeg dienblad','bad')}x.el.remove();x.el=null;x.done=true}}});
   if(T.every(x=>x.done))G.end('done')},
  key(k){if(k==='Space'||k==='Enter'||k==='ArrowDown'){press();return true}return false},
  result(){return {s:Math.max(0,Math.min(1,(perf+good*.6-spill*.35)/N)),detail:`${perf} perfect, ${good} goed, ${spill} gemorst, ${miss} leeg`}},
  stop(){ro.disconnect()}}};

// Werkplaats: ritme. Blokjes lopen naar de pers; elke goede klap slaat een teken in het nummerbord.
JJ_GAMES.werk=G=>{
 const BEAT=560,LEAD=1400,BARS=7,PAT=[[1,0,1,0],[1,1,1,0],[1,0,1,1],[1,0,0,1],[1,1,0,1],[0,1,1,0]],notes=[];
 for(let b=0;b<BARS;b++){const p=b===0?[1,0,1,0]:PAT[rnd(0,PAT.length-1)];p.forEach((v,i)=>{if(v)notes.push({t:LEAD+(b*4+i)*BEAT,hit:0,el:null})})}
 G.dur=LEAD+BARS*4*BEAT+250;
 const LET='BDFGHJKLNPRSTVXZ',plate=()=>LET[rnd(0,15)]+LET[rnd(0,15)]+'-'+rnd(1,9)+rnd(0,9)+rnd(0,9)+'-'+LET[rnd(0,15)];
 G.body.innerHTML=`<div class="jp"><div class="jp-plates"><div class="jp-plate"></div><span class="jp-count">0 borden</span></div>
  <div class="jp-track" role="button" aria-label="Persen"><div class="jp-line"><span class="jp-press"></span></div><div class="jp-notes"></div></div></div><button class="btn jp-go" type="button">Persen <kbd>spatie</kbd></button>`;
 const track=G.body.querySelector('.jp-track'),nb=G.body.querySelector('.jp-notes'),line=G.body.querySelector('.jp-line'),press=G.body.querySelector('.jp-press'),cnt=G.body.querySelector('.jp-count');
 let pl=G.body.querySelector('.jp-plate'),P='',slot=0,plates=0,perf=0,good=0,missed=0,stray=0,ok=0,bad=0,W=track.clientWidth,lastBeat=-1;
 const ro=new ResizeObserver(()=>{W=track.clientWidth});ro.observe(track);
 const newPlate=()=>{P=plate();slot=0;pl.className='jp-plate';pl.innerHTML=P.split('').map(ch=>ch==='-'?'<span class="dash">-</span>':'<span>·</span>').join('')};newPlate();
 const stamp=q=>{const sp=[...pl.querySelectorAll('span:not(.dash)')],e=sp[slot];if(!e)return;e.textContent=P.replace(/-/g,'')[slot];e.className='st q'+q;slot++;
  if(slot>=sp.length){plates++;cnt.textContent=plates+(plates===1?' bord':' borden');const old=pl;old.classList.add('out');pl=old.cloneNode(false);pl.className='jp-plate';old.after(pl);setTimeout(()=>old.remove(),300);newPlate()}};
 const hitNow=()=>{const t=G.now();if(G.over||t<0)return;press.classList.remove('down');void press.offsetWidth;press.classList.add('down');
  let n=null,bd=1e9;notes.forEach(x=>{if(x.hit)return;const d=Math.abs(t-x.t);if(d<bd){bd=d;n=x}});
  if(n&&bd<=75){n.hit=2;perf++;ok++;stamp(2);G.msg('Perfect','ok');n.el&&n.el.classList.add('hit');try{SFX.chip()}catch(e){}}
  else if(n&&bd<=160){n.hit=1;good++;ok++;stamp(1);G.msg('Goed','');n.el&&n.el.classList.add('hit');try{SFX.tick()}catch(e){}}
  else if(n&&bd<=320){n.hit=-1;missed++;bad++;G.msg(t<n.t?'Te vroeg':'Te laat','bad');n.el&&n.el.classList.add('miss')}
  else{stray++;bad++;G.msg('Mis','bad')}
  G.score('ok',ok);G.score('bad',bad)};
 G.body.querySelector('.jp-go').addEventListener('pointerdown',e=>{e.preventDefault();hitNow()});
 track.addEventListener('pointerdown',e=>{e.preventDefault();hitNow()});
 return {frame(t){const LX=W*.18,SP=Math.max(70,W*.16);
   const b=Math.floor((t-LEAD)/BEAT);if(b>=0&&b!==lastBeat){lastBeat=b;line.classList.remove('beat');void line.offsetWidth;line.classList.add('beat')}
   notes.forEach(n=>{const x=LX+(n.t-t)/BEAT*SP;
    if(!n.el&&!n.hit&&x<W+30){n.el=document.createElement('i');n.el.className='jp-note';nb.appendChild(n.el)}
    if(n.el){n.el.style.transform=`translateX(${x.toFixed(1)}px)`;if(x<-40){n.el.remove();n.el=null}}
    if(!n.hit&&t-n.t>160){n.hit=-1;missed++;bad++;G.score('bad',bad);G.msg('Gemist','bad');n.el&&n.el.classList.add('miss')}})},
  key(k){if(k==='Space'||k==='Enter'||k==='ArrowDown'){hitNow();return true}return false},
  result(){return {s:Math.max(0,Math.min(1,(perf+good*.6-stray*.25)/notes.length)),detail:`${perf} perfect, ${good} goed, ${missed} gemist · ${plates} ${plates===1?'bord':'borden'} geperst`}},
  stop(){ro.disconnect()}}};

// Bibliotheek: geheugen. Zes paren boeken; draai er twee om.
const JB_EM={sleutel:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',anker:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M7.5 11h9M4.5 14a7.5 7.5 0 0 0 15 0"/>',
 ster:'<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.8L12 16.4l-5.1 2.9 1.1-5.8-4.3-4 5.8-.7z"/>',kroon:'<path d="M3.5 8.5l4.3 3.8L12 5.5l4.2 6.8 4.3-3.8-1.8 10H5.3z"/>',
 dobbel:'<rect x="4.5" y="4.5" width="15" height="15" rx="3"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01M12 12h.01" stroke-width="2.6"/>',roos:'<circle cx="12" cy="9" r="4.5"/><path d="M12 13.5V21M12 17.5c-1.8-1.7-3.8-1.9-5-1M12 18.5c1.8-1.7 3.8-1.9 5-1"/>'};
const JB_COL=['var(--ice)','var(--acc)','var(--green)','var(--violet)','var(--red)','var(--acc2)'];
JJ_GAMES.bieb=G=>{const ks=Object.keys(JB_EM),deck=[...ks,...ks].map(k=>({k,o:0,m:0})).sort(()=>Math.random()-.5),code=()=>rnd(100,999)+'.'+rnd(1,9);
 G.body.innerHTML=`<div class="jb">${deck.map((c,i)=>`<button class="jb-c" type="button" data-i="${i}" aria-label="Boek ${i+1}"><span class="jb-in"><span class="jb-back"><i></i><em>${code()}</em></span><span class="jb-face" style="--bc:${JB_COL[ks.indexOf(c.k)]}"><svg viewBox="0 0 24 24" aria-hidden="true">${JB_EM[c.k]}</svg></span></span></button>`).join('')}</div>`;
 let open=[],lock=false,pairs=0,miss=0;const els=[...G.body.querySelectorAll('.jb-c')];
 const flip=i=>{if(lock||G.over||G.now()<0)return;const c=deck[i];if(c.m||c.o)return;c.o=1;els[i].classList.add('up');try{SFX.card()}catch(e){}open.push(i);
  if(open.length<2)return;const [a,b]=open;open=[];
  if(deck[a].k===deck[b].k){deck[a].m=deck[b].m=1;pairs++;G.score('ok',pairs);els[a].classList.add('match');els[b].classList.add('match');G.msg(pairs===6?'Alles staat op zijn plek':'Paar gevonden','ok');if(pairs===6)setTimeout(()=>G.end('done'),450)}
  else{miss++;G.score('bad',miss);lock=true;setTimeout(()=>{deck[a].o=deck[b].o=0;els[a].classList.remove('up');els[b].classList.remove('up');lock=false},700)}};
 els.forEach(e=>e.addEventListener('click',()=>flip(+e.dataset.i)));
 return {frame(){},key(){return false},result(){return {s:pairs/6,detail:`${pairs} van de 6 paren, ${miss} keer mis`}}}};
