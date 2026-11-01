// Casino: Suikerbaron (intern 'zoet') — snoepslot op 6 × 5, uitbetaling overal (8+ van hetzelfde), tumbles, en een bonus met
// kauwgomballen die de winst vermenigvuldigen. Engine: js/zoet.js (ZOET), tekeningen: js/zoet-art.js (ZBA), geluid: SFX.zb (sfx.js).
// De uitkomst ligt vast bij het draaien en wordt meteen verrekend; de animatie laat alleen zien wat er gebeurde.
// Indeling: bord links, rechts alles om te spelen (saldo, inzetten met wat je kunt betalen, draaiknop, bonus kopen, sessie).
window.zb=window.zb||{bi:4,busy:false,grid:null,fs:null,lastWin:0,stepWin:0,shown:0,bet:0,tick:'',buyMode:false,sess:{n:0,bet:0,won:0,best:0,bon:0},hrOpen:null};
if(!zb.sess)zb.sess={n:0,bet:0,won:0,best:0,bon:0};
const ZB_NAME='Suikerbaron';
const zbBet=()=>{const B=kkBets();if(zb.bi>=B.length)zb.bi=B.length-1;return B[zb.bi]};
const zbEl=id=>document.getElementById(id);
const zbOn=()=>page==='casino'&&casinoTab==='zoet'&&!!zbEl('zbCells')&&!document.hidden;
const zbT=()=>({base:slotSp(250,140),per:slotSp(38,18),col:slotSp(64,30),hold:slotSp(860,470),pop:slotSp(300,190),tease:slotSp(950,480),bomb:slotSp(520,250)});
const zbWait=ms=>new Promise(r=>setTimeout(r,zbOn()?ms:0));
const ZB_R=()=>ZOET.ROWS,ZB_C=()=>ZOET.COLS;
// doorgerekend per lidmaatschap (sim2.js, 6 mln. spins en 300.000 gekochte bonussen per lidmaatschap)
const ZB_TIER=[{b:330,rtp:'95',buy:'95'},{b:300,rtp:'95,5',buy:'96'},{b:250,rtp:'96',buy:'97'}];
// voorbeeldbord: rustige mix zonder winst
function zbDemo(){let x=20261101;const R=()=>(x=(x*1103515245+12345)%2147483648)/2147483648;const N=ZOET.SYMS.length,cnt=new Array(N).fill(0),g=[];
 for(let c=0;c<ZB_C();c++){g.push([]);for(let r=0;r<ZB_R();r++){let s;do{s=Math.floor(R()*N)}while(cnt[s]>=5||(c&&g[c-1][r].s===s)||(r&&g[c][r-1].s===s));cnt[s]++;g[c].push({s})}}
 g[1][2]={sc:1};return g}
// Spanning: liggen er al 3 lolly's, dan vallen de volgende kolommen trager en lichten ze op
function zbPlan(g){const T=zbT();let n=0,extra=0;const P=[];
 for(let c=0;c<ZB_C();c++){const tease=n>=3;if(tease)extra+=T.tease;P.push({delay:c*T.col+extra,slow:tease?1.6:1,tease,cnt:n});n+=g[c].filter(x=>x.sc).length}return P}
function zbCell(x,c,r,anim){const T=zbT();let f=0,d=0,t=0;
 if(anim==='all'){const p=zb.plan[c];f=ZB_R();d=p.delay+(ZB_R()-1-r)*12;t=(T.base+f*T.per)*p.slow}
 else if(anim==='tumble'&&x.fall){f=x.fall;d=c*Math.round(T.col/3);t=T.base+f*T.per}
 const id=x.sc?'lolly':x.m?'bal':ZOET.SYMS[x.s].id;
 const cls='zb-cell'+(f?' fall':'')+(x.sc?' sc':'')+(x.m?' bomb':'')+(x.s>=7?' hi':'');
 return `<div class="${cls}" data-k="${c*ZB_R()+r}" style="grid-column:${c+1};grid-row:${r+1};${f?`--f:${f};--d:${Math.round(d)}ms;--t:${Math.round(t)}ms`:''}">${ZBA.svg(id,x.m)}${x.m?`<b class="zb-x t${ZBA.gbTier(x.m)}">×${x.m}</b>`:''}${x.sc?'<span class="zb-lb">Bonus</span>':''}</div>`}
function zbCellsHtml(g,anim){zb.plan=anim==='all'?zbPlan(g):null;let h='';for(let c=0;c<ZB_C();c++)for(let r=0;r<ZB_R();r++)h+=zbCell(g[c][r],c,r,anim);return h}
function zbShow(g,anim){zb.grid=g;const el=zbEl('zbCells');if(el)el.innerHTML=zbCellsHtml(g,anim)}
function zbFallTime(g,anim){const T=zbT();if(anim==='all'){const P=zb.plan||zbPlan(g);return Math.max(...P.map(p=>p.delay+(ZB_R()-1)*12+(T.base+ZB_R()*T.per)*p.slow))}
 let m=0;g.forEach((col,c)=>col.forEach(x=>{if(x.fall)m=Math.max(m,c*Math.round(T.col/3)+T.base+x.fall*T.per)}));return m}
// geluid bij het landen; spanning bij 3 lolly's: de kolom licht op
function zbLand(g,anim){const T=zbT();
 if(anim==='all'){const P=zb.plan||zbPlan(g);let n=0;
  for(let c=0;c<ZB_C();c++){const p=P[c],land=p.delay+(T.base+ZB_R()*T.per)*p.slow*.72,scs=g[c].filter(x=>x.sc).length,from=n;n+=scs;
   if(p.tease)setTimeout(()=>{if(!zbOn())return;const gl=zbEl('zbGlow');if(gl){gl.style.setProperty('--c',c);gl.classList.add('on')}SFX.zb.tease(p.cnt,(land-p.delay)/1000)},Math.max(0,p.delay-30));
   setTimeout(()=>{if(!zbOn())return;SFX.zb.land(c);for(let k=0;k<scs;k++)setTimeout(()=>SFX.zb.scatter(from+k),k*90);const gl=zbEl('zbGlow');if(gl&&p.tease)gl.classList.remove('on')},land-20)}
  zb.scSeen=n;return}
 for(let c=0;c<ZB_C();c++){if(!g[c].some(x=>x.fall))continue;const d=c*Math.round(T.col/3)+(T.base+Math.max(...g[c].map(x=>x.fall||0))*T.per)*.7;setTimeout(()=>{if(zbOn())SFX.zb.land(c)},d-20)}}
// nieuwe spin: het oude bord valt naar beneden weg terwijl het nieuwe invalt
function zbDropOut(){const cells=zbEl('zbCells');if(!cells||!zbOn()||!cells.children.length)return;const T=zbT(),dur=Math.round((T.base+ZB_R()*T.per)*.7);
 const old=cells.cloneNode(true);old.removeAttribute('id');old.classList.add('zb-old');
 old.querySelectorAll('.zb-cell').forEach(el=>{const c=Math.floor(+el.dataset.k/ZB_R());el.className=el.className.replace(/\b(fall|win|dim|pop)\b/g,'');el.style.removeProperty('--f');el.style.setProperty('--od',(c*T.col)+'ms');el.style.setProperty('--ot',dur+'ms');el.classList.add('out')});
 cells.parentNode.insertBefore(old,cells);setTimeout(()=>old.remove(),ZB_C()*T.col+dur+120)}
function zbText(id,v){const e=zbEl(id);if(e)e.textContent=v}
function zbTick(t){zb.tick=t;const e=zbEl('zbTick');if(e){e.innerHTML=t;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}}
function zbCount(id,from,to,ms){const el=zbEl(id);if(!el||!zbOn()){if(el)el.textContent=fmt(to);return Promise.resolve()}
 return new Promise(res=>{const t0=performance.now();const st=t=>{const p=Math.min(1,(t-t0)/ms),e=1-Math.pow(1-p,3);el.textContent=fmt(from+(to-from)*e);if(p<1)requestAnimationFrame(st);else res()};requestAnimationFrame(st)})}
function zbBanner(big,small,ms,cls){const el=zbEl('zbBanner');if(el)el.innerHTML=`<div class="kk-banner zb-ban ${cls||''}"><div><b>${big}</b><span>${small||''}</span></div></div>`;
 return zbWait(ms||1400).then(()=>{const e=zbEl('zbBanner');if(e)e.innerHTML=''})}
function zbShowBal(add){zb.shown=(zb.shown||0)+add;zbText('zbBal',fmt(S.cash-(window.slotPending||0)+zb.shown))}
const zbCellEl=k=>document.querySelector(`#zbCells .zb-cell[data-k="${k}"]`);
const zbName=w=>w.n+'× '+ZOET.SYMS[w.sym].n.toLowerCase();
function zbLabel(w,bet){const fx=zbEl('zbFx');if(!fx||!zbOn())return;const cx=w.cells.reduce((a,[c])=>a+c,0)/w.cells.length,cy=w.cells.reduce((a,[,r])=>a+r,0)/w.cells.length;
 const d=document.createElement('div');d.className='kk-pop zb-pop';d.style.left=((cx+.5)/ZB_C()*100)+'%';d.style.top=((cy+.5)/ZB_R()*100)+'%';d.innerHTML=fmt(w.pay*bet)+`<small>${w.n}×</small>`;fx.appendChild(d);setTimeout(()=>d.remove(),1600)}
const ZB_CONF=['#ff4f9a','#ffc93a','#5fe063','#4cc6ff','#b072ff','#ff8a12','#fff'];
function zbSparks(keys){const fx=zbEl('zbFx');if(!fx||slotSpd()===3||!zbOn())return;
 keys.forEach(k=>{const c=Math.floor(k/ZB_R()),r=k%ZB_R();for(let i=0;i<4;i++){const s=document.createElement('i');s.className='zb-conf';s.style.left=((c+.5)/ZB_C()*100)+'%';s.style.top=((r+.5)/ZB_R()*100)+'%';
  const a=Math.random()*Math.PI*2,d=22+Math.random()*34;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');s.style.setProperty('--rot',(Math.random()*540-270)+'deg');s.style.background=ZB_CONF[(k+i)%ZB_CONF.length];fx.appendChild(s);setTimeout(()=>s.remove(),700)}})}
// één spin afspelen (alle tumbles). runFrom = bonuswinst tot nu toe (in de bonus), anders null. Geeft de tumblewinst in € terug.
async function zbAnimate(sp,bet,inFs,runFrom){let sofar=0;zb.scSeen=0;
 for(let i=0;i<sp.steps.length;i++){const T=zbT(),st=sp.steps[i],anim=i===0?'all':'tumble';
  if(i===0)zbDropOut();zbShow(st.grid,anim);zbLand(st.grid,anim);
  await zbWait(zbFallTime(st.grid,anim)+60);
  let sc=0;st.grid.forEach(col=>col.forEach(x=>{if(x.sc)sc++}));for(let k=zb.scSeen;k<sc;k++)SFX.zb.scatter(k);
  if(i>0&&sc>zb.scSeen&&sc>=(inFs?ZOET.RETRIG_SC:ZOET.TRIG))zbTick(`<b>${sc} lolly's</b>, er tumbelde er een bij!`);zb.scSeen=Math.max(zb.scSeen,sc);
  if(!st.wins.length)break;
  const hit=new Set();st.wins.forEach(w=>w.cells.forEach(([c,r])=>hit.add(c*ZB_R()+r)));
  document.querySelectorAll('#zbCells .zb-cell').forEach(el=>{const k=+el.dataset.k;el.classList.toggle('win',hit.has(k));el.classList.toggle('dim',!hit.has(k)&&!el.classList.contains('bomb'))});
  st.wins.forEach(w=>zbLabel(w,bet));SFX.zb.win(i);
  const add=st.wins.reduce((a,w)=>a+w.pay,0)*bet;
  zbTick(st.wins.length>1?`${st.wins.map(w=>zbName(w)).join(' + ')}: <b>${fmt(add)}</b>`:`${zbName(st.wins[0])}: <b>${fmt(add)}</b>`);
  zbCount('zbStep',sofar,sofar+add,T.hold*.8);if(runFrom!=null){zbCount('zbLast',runFrom+sofar,runFrom+sofar+add,T.hold*.8);slotXSet(runFrom+sofar+add,bet)}zbShowBal(add);
  sofar+=add;zb.stepWin=sofar;await zbWait(T.hold);
  document.querySelectorAll('#zbCells .zb-cell.win').forEach(el=>el.classList.add('pop'));SFX.zb.pop();zbSparks([...hit]);await zbWait(T.pop)}
 document.querySelectorAll('#zbCells .zb-cell').forEach(el=>el.classList.remove('dim'));
 return sofar}
// kauwgomballen: een voor een optellen, daarna × de winst van de spin
async function zbBombs(sp,bet,sofar,runFrom){if(!sp.mult||!sp.bombs.length)return sofar;const T=zbT();let m=0;const mb=zbEl('zbMul');
 for(const [c,r,v] of sp.bombs){const el=zbCellEl(c*ZB_R()+r);if(el)el.classList.add('boom');m+=v;if(mb){mb.textContent='×'+m;mb.classList.remove('bump');void mb.offsetWidth;mb.classList.add('bump')}
  SFX.zb.mult(v);zbTick(`Kauwgombal <b>×${v}</b>${sp.bombs.length>1?' · samen ×'+m:''}`);await zbWait(T.bomb)}
 const to=sofar*sp.mult;SFX.zb.big();zbTick(`${fmt(sofar)} × ${sp.mult} = <b>${fmt(to)}</b>`);
 zbCount('zbStep',sofar,to,T.hold);zbShowBal(to-sofar);if(runFrom!=null){zbCount('zbLast',runFrom+sofar,runFrom+to,T.hold);slotXSet(runFrom+to,bet)}
 const fx=zbEl('zbFx');if(fx&&zbOn()){const d=document.createElement('div');d.className='zb-multpop';d.innerHTML=`×${sp.mult}<small>${fmt(to)}</small>`;fx.appendChild(d);setTimeout(()=>d.remove(),1700)}
 await zbWait(T.hold*1.3);document.querySelectorAll('#zbCells .zb-cell.boom').forEach(el=>el.classList.remove('boom'));if(mb)mb.textContent='×0';return to}
function zbInfo(){const fs=zb.fs,pend=window.slotPending||0;
 return `<div class="sb-bal"><div class="sb-bal-l"><span class="label">Saldo</span><b id="zbBal" data-fit="18">${fmt(S.cash-pend+(zb.shown||0))}</b></div>${fs?slotFsIn(fs,'Free spins'):slotBetIn(zb.busy&&zb.bet?zb.bet:zbBet(),zb.buyMode,ZOET.BUY_COST)}</div>
  <div class="sb-st"><span class="label">Deze spin</span><b id="zbStep" class="acc" data-fit="12">${fmt(zb.stepWin)}</b></div>
  <div class="sb-st"><span class="label">${fs?'Bonuswinst':'Gewonnen'}</span><b id="zbLast" class="grn" data-fit="12">${fmt(fs?fs.total:zb.lastWin)}</b></div>
  ${fs?`<div class="sb-st sb-fsx"><span class="label">Bonus tot nu toe</span><b class="kk-xn">${slotX(fs.total,zb.bet)}</b></div>`:''}`}
function zbFsBar(){const f=zb.fs;if(!f)return '';
 return `<div class="zb-fs"><div class="zb-fsl"><span>Free spins</span><b class="kk-fsl">${Math.max(0,f.of-f.at)}</b></div>
  <p>Kauwgomballen blijven liggen tot de spin klaar is. Valt er winst, dan tellen ze op en gaat de winst van die spin keer het totaal. ${ZOET.RETRIG_SC}+ lolly's = +${ZOET.FS_RETRIG} spins.</p>
  <div class="zb-mul"><span>Deze spin</span><b id="zbMul">×0</b></div></div>`}
function zbSubHtml(){return zb.fs?`<span class="sb-tag fs">Bonus</span><span>Kauwgomballen vermenigvuldigen je winst</span>`
 :`${typeof kkTierTag==='function'?kkTierTag():''}<span>Bonus ±1 op ${ZB_TIER[tier()].b} · RTP ±${ZB_TIER[tier()].rtp}% · max ${ZOET.MAX_WIN.toLocaleString('nl-NL')}× je inzet</span>`}
// grootste inzet waarvoor je een bonus kunt kopen (index), of -1
const zbBuyMaxI=()=>{const B=kkBets(),c=casCash();let r=-1;B.forEach((v,i)=>{if(v*ZOET.BUY_COST<=c)r=i});return r};
// rechts: alle inzetten in een raster. Met bonus kopen aan zie je per inzet de prijs van de bonus; wat je niet kunt betalen is grijs.
function zbBetsHtml(){const b=zbBet(),buy=!!zb.buyMode,cost=ZOET.BUY_COST,dis=zb.busy?'disabled':'',hr=typeof isHighRoller==='function'&&isHighRoller(),B=kkBets(),cash=casCash();
 const std=B.map((v,i)=>[v,i]).filter(([v])=>v<=50000),hi=B.map((v,i)=>[v,i]).filter(([v])=>v>50000),showHi=hr&&hi.length&&(zb.hrOpen==null?b>50000:zb.hrOpen);
 const btn=([v,i])=>{const pr=buy?v*cost:v,no=cash<pr;return `<button class="${i===zb.bi?'on':''} ${no?'no':''}" onclick="zbSetBet(${i})" ${dis} title="${fmt(v)} inzet${buy?' · bonus '+fmt(pr):''}${no?' · te weinig saldo':''}">${buy?`<b>${kkShortBet(pr)}</b><small>${kkShortBet(v)}</small>`:`<b>${kkShortBet(v)}</b>`}</button>`};
 const mi=zbBuyMaxI();
 return `<div class="sb-bets-h"><div><span class="label">${buy?'Bonus kopen · prijs per bonus':'Inzet per spin'}</span>
   <div class="sb-amt"><button onclick="zbStepBet(-1)" ${dis} aria-label="Lagere inzet">−</button><b data-fit="16">${fmt(buy?b*cost:b)}</b><button onclick="zbStepBet(1)" ${dis} aria-label="Hogere inzet">+</button></div></div>
   ${buy?`<em>${cost}× je inzet van ${fmt(b)}</em>`:`<em>bonus kopen: ${fmt(b*cost)}</em>`}</div>
  <div class="sb-grid ${buy?'buy':''}">${(showHi?hi:std).map(btn).join('')}</div>
  ${buy&&cash<b*cost?`<p class="sb-hint">${mi>=0?`Je kunt een bonus kopen tot <b>${fmt(B[mi]*cost)}</b>. <button class="sb-lnk" onclick="zbSetBet(${mi})" ${dis}>Kies ${fmt(B[mi])} inzet</button>`:`Een bonus kost minstens ${fmt(B[0]*cost)}. Daar heb je nu te weinig voor.`}</p>`:''}
  ${hr&&hi.length?`<button class="sb-hr ${showHi?'on':''}" onclick="zb.hrOpen=!${showHi};zbRefresh()" ${dis} aria-expanded="${!!showHi}"><span>${showHi?'Gewone inzetten':'High roller-inzetten'}</span><small>${showHi?'€10 t/m €50K':'tot '+kkShortBet(hi[hi.length-1][0])}</small></button>`:''}`}
function zbControls(){const b=zbBet(),bc=b*ZOET.BUY_COST,poor=casCash()<bc;
 return `<div class="sb-step"><span class="label">Inzet · klik om te kiezen</span>
   <div class="sb-amt"><button onclick="zbStepBet(-1)" ${zb.busy?'disabled':''} aria-label="Lagere inzet">−</button><button class="sb-betv" onclick="slotBetPop('zb')" ${zb.busy?'disabled':''} aria-label="Inzet kiezen">${fmt(b)}</button><button onclick="zbStepBet(1)" ${zb.busy?'disabled':''} aria-label="Hogere inzet">+</button></div></div>
  ${zb.buyMode?`<button class="sb-go buy" onclick="act.zbSpin(true)" ${zb.busy||inJail()||poor?'disabled':''}><span>${zb.busy?'Bezig…':poor?'Te weinig saldo':'Koop bonus'}</span><b data-fit="16">${fmt(bc)}</b><small>${ZOET.FS_START} free spins · ${ZOET.TRIG} lolly's</small></button>`
   :`<button class="sb-go" onclick="act.zbSpin(false)" ${zb.busy||inJail()?'disabled':''}><span>${zb.busy?'Bezig…':'Draaien'}</span><small>spatiebalk</small></button>`}
  <div class="sb-row">${slotSpdHtml('sb-spd')}
   <button class="kk-buyt sb-buyt ${zb.buyMode?'on':''}" onclick="zb.buyMode=!zb.buyMode;SFX.click();zbRefresh()" ${zb.busy?'disabled':''} aria-pressed="${!!zb.buyMode}"><i></i><span>Bonus kopen</span><small>${zb.buyMode?'aan':'uit'}</small></button></div>`}
function zbConfirm(){const b=zbBet(),buy=b*ZOET.BUY_COST;return `<div class="sb-bonus"><span class="sb-bonus-ic">${ZBA.svg('lolly')}</span><div><b>Bonus kopen staat aan</b>
  <p>Elke klik koopt een bonus voor <b>${fmt(buy)}</b> (${ZOET.BUY_COST}× je inzet): altijd ${ZOET.TRIG} lolly's en ${ZOET.FS_START} free spins. Valt er nog een lolly bij, dan betaalt die mee. Gemiddeld ±${ZB_TIER[tier()].buy}% terug; de helft van de keren minder dan 65× je inzet, de rest zit in de grote kauwgomballen.</p></div></div>`}
function zbSessHtml(){const x=zb.sess||{n:0,bet:0,won:0,best:0,bon:0},net=x.won-x.bet;
 return `<div class="sb-sess"><span class="label">Deze sessie</span>
  <div><span>Spins</span><b>${x.n.toLocaleString('nl-NL')}</b></div><div><span>Bonussen</span><b>${x.bon}</b></div><div><span>Netto</span><b class="${net>0?'up':net<0?'dn':''}" data-fit="10">${net>=0?'+':'−'}${fmt(Math.abs(net))}</b></div></div>`}
function zbSeed(){if(!S.zbSeed||!S.zbSeed.s)S.zbSeed=kkNewSd(S.zbSeed&&S.zbSeed.prev);return S.zbSeed}
function zbSeedHtml(){const s0=zbSeed(),sd={...s0,bon:s0.bon-(zb.busy&&zb.sdPend?1:0)};
 return `<div class="sb-seed"><div><span class="label">Seed</span><b>${kkSeedId(sd)}</b><small>${sd.spins} spin${sd.spins===1?'':'s'}, ${sd.bon} bonus${sd.bon===1?'':'sen'}</small></div>
  <button class="sb-lnk" onclick="act.zbNewSeed()" ${zb.busy?'disabled':''}>Nieuwe seed</button></div>`}
// Uitbetaling per snoepje bij de gekozen inzet (8–9, 10–11, 12–14, 15+), lolly's en kauwgomballen
function zbPayTab(){const b=zbBet(),k=ZOET.PAYK*(ZOET.VIP_KT[tier()]||1),B=['8–9','10–11','12–14','15+'];
 const rows=ZOET.SYMS.slice().reverse().map(s=>`<div class="zb-pt"><span>${ZBA.svg(s.id)}</span><div><b>${s.n}</b>${s.p.map((p,i)=>`<p><i>${B[i]}</i>${fmt(p*k*b)}</p>`).join('')}</div></div>`).join('');
 const balls=ZOET.BOMB.vals.map(([v])=>`<i class="t${ZBA.gbTier(v)}">×${v.toLocaleString('nl-NL')}</i>`).join('');
 return `<div class="zb-pay-g"><div><h3 class="vd-h">Uitbetaling bij ${fmt(b)} inzet${isVip()?' ('+lidName()+')':''}</h3><p class="vd-p">8 of meer van hetzelfde snoepje, waar ze ook liggen. In de bonus ${Math.round(ZOET.FS_K/(ZOET.VIP_KT[tier()]||1)*100)}% hiervan, maar dan nog keer de kauwgomballen.</p><div class="zb-ptab">${rows}</div></div>
  <div><h3 class="vd-h">Lolly's</h3><p class="vd-p">${ZOET.TRIG} of meer lolly's (na het doortumbelen) geven ${ZOET.FS_START} free spins en betalen zelf ook.</p>
   <div class="kk-scpay zb-scpay">${[4,5,6].map(n=>`<span><i>${n}${n===6?'+':''} lolly's</i><b>${fmt(ZOET.SC_PAY[n]*b)}</b><i>${ZOET.SC_PAY[n]}×</i></span>`).join('')}</div>
   <h3 class="vd-h" style="margin-top:18px">Kauwgomballen in de bonus</h3><div class="zb-balls">${balls}</div>
   <p class="vd-p" style="margin-top:8px">Hoe hoger, hoe zeldzamer: ×250 en hoger komen maar heel af en toe voor.</p></div></div>`}
const zbLogo=()=>`<div class="sb-logo"><span class="sb-hat">${ZBA.hat()}</span><span class="sb-name">Suiker<b>baron</b></span></div>`;
function zoetView(){const g=zb.grid||zbDemo(),fs=zb.fs;
 return `<div class="zb sb ${fs?'is-fs':''} ${zb.buyMode?'is-buy':''}">
 <div class="sb-stage" id="zbStage">
  <header class="sb-head">${zbLogo()}
   <div class="sb-sub" id="zbSub">${zbSubHtml()}</div>
   <button class="sb-ibtn" onclick="SFX.toggle();this.textContent=SFX.on?'🔊':'🔇'" aria-label="Geluid aan of uit" title="Geluid">${SFX.on?'🔊':'🔇'}</button></header>
  <div class="sb-main">
   <div class="sb-play">
    <div id="zbFs">${zbFsBar()}</div>
    <div class="sb-board" id="zbBoard">
     <div class="zb-grid"><div class="zb-glow" id="zbGlow"></div><div class="zb-cells" id="zbCells">${zbCellsHtml(g,'none')}</div><div class="zb-fx" id="zbFx"></div></div>
     <div id="zbBanner"></div>${zbRunHtml()}</div>
    <div class="sb-tick" id="zbTick">${zb.tick||(fs?'Kauwgomballen vermenigvuldigen de winst van de spin':'8 of meer van hetzelfde wint, waar ze ook liggen. 4 lolly\'s geven de bonus.')}</div>
   </div>
   <aside class="sb-side">
    <div class="sb-hud" id="zbInfo">${zbInfo()}</div>
    <div class="sb-bets" id="zbBets">${zbBetsHtml()}</div>
    <div class="sb-ctl" id="zbCtl">${zbControls()}</div>
    <div id="zbConfirmBox">${zb.buyMode&&!zb.busy?zbConfirm():''}</div>
    <div class="sb-foot"><div id="zbSess">${zbSessHtml()}</div><div id="zbSeedBox">${zbSeedHtml()}</div></div>
   </aside>
  </div>
 </div>
 <section class="card kk-pay vd-pay zb-pay"><div id="zbPayTab">${zbPayTab()}</div>
  <div class="kk-rules">
   <div><span>${ZBA.svg('pot')}</span><p><b>Overal raak</b>: er zijn geen lijnen. Liggen er 8 of meer van hetzelfde snoepje op het bord, waar dan ook, dan win je. Meer van hetzelfde betaalt meer (8–9, 10–11, 12–14 en 15+). De winnende snoepjes knallen weg, de rest valt naar beneden en er vallen nieuwe in: zolang er winst valt, gaat het door.</p></div>
   <div><span>${ZBA.svg('lolly')}</span><p><b>${ZOET.TRIG} lolly's</b> geven ${ZOET.FS_START} free spins. Lolly's blijven liggen tijdens het tumbelen en tellen aan het eind van de spin, dus een 4e kan er nog bij vallen. Ze betalen zelf ook: ${ZOET.TRIG} = ${ZOET.SC_PAY[4]}×, 5 = ${ZOET.SC_PAY[5]}×, 6 of meer = ${ZOET.SC_PAY[6]}× je inzet. In de bonus geven ${ZOET.RETRIG_SC} of meer lolly's ${ZOET.FS_RETRIG} extra spins.</p></div>
   <div><span>${ZBA.svg('bal',10)}</span><p><b>Kauwgomballen</b> vallen alleen in de bonus, met ×2 tot ×1.000. Ze blijven liggen tot de spin klaar is. Is er in die spin iets gewonnen, dan worden alle ballen op het bord opgeteld en gaat de winst van de hele spin keer dat totaal. Zonder winst doen ze niets.</p></div>
   <div><span class="kk-mini key">␣</span><p><b>Spatiebalk</b> draait. De max win is ${ZOET.MAX_WIN.toLocaleString('nl-NL')}× je inzet per ronde, ook bij een gekochte bonus. RTP ±${ZB_TIER[tier()].rtp}%, bonus kopen ±${ZB_TIER[tier()].buy}%.${isVip()?` Als <b>${lidName()}</b> vallen er vaker lolly's (bonus ±1 op ${ZB_TIER[tier()].b} in plaats van ±1 op ${ZB_TIER[0].b}); snoepjes betalen in het basisspel daarvoor ${Math.round((1-ZOET.VIP_KT[tier()]/ZOET.VIP_KT[0])*100)}% minder.`:` <b>VIP</b> komt ±10% vaker in de bonus, <b>High roller</b> ±30%.`}</p></div>
  </div></section></div>`}
function zbRefresh(){const root=document.querySelector('.zb');if(!root)return;root.classList.toggle('is-fs',!!zb.fs);root.classList.toggle('is-buy',!!zb.buyMode);
 const set=(id,h)=>{const e=zbEl(id);if(e&&e._h!==h){e.innerHTML=h;e._h=h;fitText(e)}};
 set('zbSub',zbSubHtml());set('zbInfo',zbInfo());set('zbBets',zbBetsHtml());set('zbCtl',zbControls());set('zbFs',zbFsBar());
 set('zbConfirmBox',zb.buyMode&&!zb.busy?zbConfirm():'');set('zbSess',zbSessHtml());set('zbSeedBox',zbSeedHtml());set('zbPayTab',zbPayTab())}
function zbStepBet(d){if(zb.busy)return;zb.bi=Math.max(0,Math.min(kkBets().length-1,zb.bi+d));SFX.chip();zbRefresh()}
function zbSetBet(i){if(zb.busy)return;zb.bi=Math.max(0,Math.min(kkBets().length-1,i));SFX.chip();zbRefresh()}
// Bonus binnen (gewonnen of gekocht): de krullolly draait het bord in, snoepjes knallen alle kanten op, dan de free spins
async function zbIntro(n,sc,isBuy){const fast=slotSpd()===3,dur=fast?1500:2800,el=zbEl('zbBanner');SFX.zb.bonus();
 const kinds=['zuurtje','gombeer','donut','spek','bal','bonbon','zuurstok','wafel'];
 if(el&&zbOn())el.innerHTML=`<div class="sb-intro" style="--dur:${dur}ms"><div class="sb-rays"></div><div class="sb-in-lolly">${ZBA.svg('lolly')}</div>
  <div class="sb-in-burst">${Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2+.2,d=34+(i%3)*8;return `<i style="--dx:${(Math.cos(a)*d).toFixed(1)}cqi;--dy:${(Math.sin(a)*d*.8).toFixed(1)}cqi;--r:${(i*67)%360-180}deg;--dl:${(i%4)*45}ms">${ZBA.svg(kinds[i%kinds.length],[3,12,40][i%3])}</i>`}).join('')}</div>
  <div class="sb-in-t"><b>${n} free spins</b><span>${isBuy?'Gekochte bonus':sc+' lolly\'s'} · kauwgomballen vermenigvuldigen je winst</span></div></div>`;
 await zbWait(dur);const e=zbEl('zbBanner');if(e)e.innerHTML=''}
// from = free spin waar een eerder gestarte bonus verdergaat (het geld is dan al verrekend)
async function zbPlay(round,bet,isBuy,from){const T=zbT();zb.stepWin=0;zbText('zbStep',fmt(0));const resume=from!=null&&!!round.fs;
 const b=round.base;
 if(resume){zbTick('Je bonus gaat verder');zbShow(b.steps[b.steps.length-1].grid,'none')}
 else{zbTick(isBuy?'Bonus gekocht':'&nbsp;');let w=await zbAnimate(b,bet,false,null);if(!w&&!round.fs)zbTick(b.sc===3?'Drie lolly\'s, net niet':'Geen winst')}
 const baseWin=b.win*bet,scPay=b.scPay*bet;
 if(scPay>0&&!resume){document.querySelectorAll('#zbCells .zb-cell.sc').forEach(el=>el.classList.add('win'));SFX.zb.win(3);zbShowBal(scPay);
  zbCount('zbStep',baseWin-scPay,baseWin,700);await zbBanner('+'+fmt(scPay),Math.min(6,b.sc)+(b.sc>6?'+':'')+' lolly\'s betalen '+b.scPay+'× je inzet',1900,'gold')}
 if(baseWin>0){zb.lastWin=baseWin;zbText('zbLast',fmt(baseWin))}
 if(round.fs){const st0=resume?Math.max(0,Math.min(from,round.fs.spins.length-1)):0;
  if(resume){SFX.zb.bonus(true);await zbBanner('Je bonus gaat verder','Free spin '+(st0+1)+' · het geld staat al op je saldo',2200,'fsin')}
  else{zbTick(`<b>${b.sc} lolly's</b>: bonus!`);await zbWait(T.hold*.5);await zbIntro(round.fsStart,b.sc,isBuy)}
  document.querySelectorAll('#zbCells .zb-cell.win').forEach(el=>el.classList.remove('win'));
  zb.fs={at:0,of:round.fsStart,total:0};let of=round.fsStart;
  for(let i=0;i<st0;i++){const s=round.fs.spins[i];if(s.extra)of+=s.extra;zb.fs.of=of;zb.fs.at=i+1;zb.fs.total=Math.min(ZOET.MAX_WIN,s.total)*bet}
  zbRefresh();if(st0)zbText('zbLast',fmt(zb.fs.total));
  for(let i=st0;i<round.fs.spins.length;i++){const s=round.fs.spins[i];
   if(S.slotRun&&S.slotRun.g==='zoet'&&i>(S.slotRun.at||0)){S.slotRun.at=i;save()}
   zb.fs.at=i+1;zb.fs.of=Math.max(of,i+1);slotFsSet(zb.fs.at,zb.fs.of);zb.stepWin=0;zbText('zbStep',fmt(0));SFX.zb.spin();
   const before=zb.fs.total;let w=await zbAnimate(s,bet,true,before);
   if(s.mult)w=await zbBombs(s,bet,w,before);
   else if(!w)zbTick(s.bombs.length?'Kauwgomballen, maar geen winst':'Geen winst deze spin');
   zb.fs.total=Math.min(ZOET.MAX_WIN,s.total)*bet;zbText('zbLast',fmt(zb.fs.total));slotXSet(zb.fs.total,bet);
   if(round.fs.maxHit&&s.total>=ZOET.MAX_WIN){SFX.zb.big();await zbBanner('Max win',ZOET.MAX_WIN.toLocaleString('nl-NL')+'× je inzet',3000,'big gold');break}
   if(s.extra){SFX.zb.retrig();of+=s.extra;zb.fs.of=Math.max(of,zb.fs.at);slotFsSet(zb.fs.at,zb.fs.of,s.extra);await zbBanner('+'+s.extra+' spins',s.sc+' lolly\'s tijdens de bonus',1500,'fsin')}
   await zbWait(slotSp(300,120))}
  const x=round.fs.total;if(x>=20)SFX.zb.big();
  await zbBanner(fmt(x*bet),(x>=ZOET.MAX_WIN?'Max win · ':x>=200?'Episch · ':x>=100?'Megawinst · ':x>=40?'Zoete winst · ':'Bonus voorbij · ')+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2600,x>=40?'big':'');
  zb.fs=null;zbRefresh();zbTick(`Bonus voorbij: <b>${fmt(x*bet)}</b>`)}
 else{const x=round.total;if(x>=20){SFX.zb.big();await zbBanner(fmt(x*bet),(x>=100?'Megawinst':'Zoete winst')+' · '+(Math.round(x*10)/10).toLocaleString('nl-NL')+'× je inzet',2000,'big')}else if(x===0)SFX.zb.lose()}}
document.addEventListener('keydown',e=>{if(e.code!=='Space'||page!=='casino'||casinoTab!=='zoet'||window.__chase||czBanLeft())return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!$('#modal').hidden)return;
 e.preventDefault();if(document.activeElement&&document.activeElement.tagName==='BUTTON')document.activeElement.blur();if(zb.busy)return;if(S.slotRun&&S.slotRun.g==='zoet'){zbResumeRun();return}if(zb.buyMode){if(!e.repeat)act.zbSpin(true);return}act.zbSpin(false)});
async function zbResumeRun(){const run=S.slotRun;if(!run||run.g!=='zoet'||zb.busy)return;
 let round=null;try{round=ZOET.playRound(SLOT.seedRng(run.seed),{buy:run.buy,vip:run.t})}catch(e){}
 if(!round||!round.fs||Math.abs(round.total-run.tot)>1e-6){delete S.slotRun;save();render();toast('Je bonus in '+ZB_NAME+' is al uitbetaald: '+fmt(run.pay),'lvl');return}
 zb.busy=true;zb.bet=run.bet;zb.shown=0;window.slotPending=0;SFX.click();render();
 try{await zbPlay(round,run.bet,run.buy,run.at||0)}catch(e){console.error(e)}
 zb.busy=false;zb.fs=null;zb.lastWin=run.pay;zb.stepWin=0;delete S.slotRun;save();renderTop();zbRefresh()}
function zbSkipRun(){const run=S.slotRun;if(!run||run.g!=='zoet'||zb.busy)return;delete S.slotRun;save();zb.lastWin=run.pay;render();toast('Bonus overgeslagen. Hij was al uitbetaald: '+fmt(run.pay))}
const zbRunHtml=()=>{const run=S.slotRun;if(!run||run.g!=='zoet'||zb.busy)return '';
 return `<div class="kk-banner pause"><div><b>Je bonus loopt nog</b><span>${run.buy?'Gekochte bonus':'Bonus'} bij ${fmt(run.bet)} inzet · free spin ${(run.at||0)+1} · uitbetaald: ${fmt(run.pay)}. Het geld staat al op je saldo.</span>
  <div class="kk-run-b"><button class="btn kk-go" onclick="zbResumeRun()">Bonus verder afspelen</button><button class="btn ghost sm" onclick="zbSkipRun()">Overslaan</button></div></div></div>`};
Object.assign(act,{
 zbNewSeed(){if(zb.busy)return;const o=zbSeed();S.zbSeed=kkNewSd({id:kkSeedId(o),spins:o.spins,bon:o.bon,sup:0});SFX.chip();save();zbRefresh();toast('Nieuwe seed: '+kkSeedId(S.zbSeed))},
 async zbSpin(isBuy){if(zb.busy||inJail())return;const bet=zbBet(),cost=isBuy?bet*ZOET.BUY_COST:bet;if(casCash()<cost){toast(casShort(),'bad');return}
  zb.busy=true;zb.bet=bet;zb.shown=0;SFX.zb.spin();
  if(S.slotRun&&S.slotRun.g==='zoet')delete S.slotRun;
  const sd=zbSeed(),seedStr='zoet:'+sd.s+':'+sd.c+':'+sd.n,rng=SLOT.seedRng(seedStr);sd.n++;
  const round=ZOET.playRound(rng,{buy:isBuy,vip:tier()});if(!isBuy){sd.spins++;if(round.fs)sd.bon++}
  const pay=Math.floor(round.total*bet*100)/100,lk=typeof luckPct==='function'&&pay>0?Math.floor(pay*luckPct()*100)/100:0;
  S.cash+=pay+lk-cost;window.slotPending=pay+lk;if(pay+lk>cost)S.stats.won+=pay+lk-cost;else S.stats.lost+=cost-pay-lk;
  zb.sdPend=!isBuy&&round.fs?1:0;
  if(round.fs)S.slotRun={g:'zoet',seed:seedStr,buy:!!isBuy,t:tier(),bet,cost,pay,tot:round.total,at:0,ts:now()};
  casinoRound(cost,pay+lk,'zoet');
  save();renderTop();zbRefresh();
  try{await zbPlay(round,bet,isBuy)}catch(e){console.error(e)}
  window.slotPending=0;zb.busy=false;zb.shown=0;zb.fs=null;zb.lastWin=pay+lk;zb.stepWin=0;zb.sdPend=0;if(S.slotRun&&S.slotRun.g==='zoet')delete S.slotRun;
  const ss=zb.sess||(zb.sess={n:0,bet:0,won:0,best:0,bon:0});ss.n++;ss.bet+=cost;ss.won+=pay+lk;ss.best=Math.max(ss.best,pay+lk);if(round.fs)ss.bon++;
  if(lk)toast('Geluksdobbelsteen: +'+fmt(lk)+' extra','lvl');
  if(pay>=bet*20||isBuy||round.fs)log(ZB_NAME+': '+fmt(pay)+' gewonnen ('+(isBuy?'gekochte bonus, ':round.fs?'bonus, ':'')+'inzet '+fmt(cost)+')',pay>=cost?'ok':'bad');
  if(pay>=bet*50)toast('Zoete winst: '+fmt(pay)+'!','lvl');
  save();renderTop();zbRefresh()}});
