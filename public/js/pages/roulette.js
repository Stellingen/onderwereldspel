// Casino: Europese roulette (één nul, huisvoordeel 2,7%). Groot wiel met bal bovenaan, echte inzettafel eronder.
// Elke inzet is een set getallen: valt de bal op een van die getallen, dan krijg je inzet × 36 / (aantal getallen) terug.
// Zo betalen nummer 35:1, split 17:1, rij 11:1, hoek 8:1, zes 5:1, kolom en dozijn 2:1 en de kansen 1:1.
const RL_CHIPS=[10,25,100,500,1000,5000,10000,25000],RL_SPOT_MAX=50000;
window.rl=Object.assign({bets:{},angle:0,ball:0,ballR:1,spinning:false,hist:[],chip:100,res:null,net:0,last:null,undo:[],erase:false,lines:null},window.rl||{});
if(!rl.undo)rl.undo=[];
const rlN=(j,r)=>3*j+(3-r); // horizontaal: kolom j (0-11), rij r (0 = boven: 3,6,9 … ; 2 = onder: 1,4,7 …)
const RL_OUT={red:[...REDS],black:Array.from({length:36},(_,i)=>i+1).filter(n=>!REDS.has(n)),even:[],odd:[],low:[],high:[],d1:[],d2:[],d3:[],c1:[],c2:[],c3:[]};
for(let n=1;n<=36;n++){RL_OUT[n%2?'odd':'even'].push(n);RL_OUT[n<=18?'low':'high'].push(n);RL_OUT['d'+Math.ceil(n/12)].push(n);RL_OUT['c'+(((n-1)%3)+1)].push(n)}
const RL_OUT_LABEL={red:'Rood',black:'Zwart',even:'Even',odd:'Oneven',low:'1 tot 18',high:'19 tot 36',d1:'1e twaalf',d2:'2e twaalf',d3:'3e twaalf',c1:'Kolom 1',c2:'Kolom 2',c3:'Kolom 3'};
// sleutel → getallen. Binnen-inzetten: 'i:1,2,4,5'
const rlNums=k=>k.startsWith('i:')?k.slice(2).split(',').map(Number):RL_OUT[k]||[];
const rlKey=ns=>'i:'+[...ns].sort((a,b)=>a-b).join(',');
function rlLabel(k){const ns=rlNums(k);if(!k.startsWith('i:'))return RL_OUT_LABEL[k];
 const t={1:'Nummer',2:'Split',3:ns.includes(0)?'Drie met nul':'Rij',4:ns.includes(0)?'Eerste vier':'Hoek',6:'Zes'}[ns.length];return t+' '+ns.join('/')}
// Groepen op het wiel (aantal fiches per groep = lengte van de lijst)
const RL_GROUPS=[
 {id:'voisins',n:'Buren van nul',d:'17 getallen rond de nul (22 t/m 25)',bets:[[0,2,3],[0,2,3],[4,7],[12,15],[18,21],[19,22],[32,35],[25,26,28,29],[25,26,28,29]]},
 {id:'tiers',n:'Overkant',d:'12 getallen tegenover de nul (27 t/m 33)',bets:[[5,8],[10,11],[13,16],[23,24],[27,30],[33,36]]},
 {id:'orph',n:'Weesjes',d:'De 8 getallen die overblijven',bets:[[1],[6,9],[14,17],[17,20],[31,34]]},
 {id:'zero',n:'Nulspel',d:'7 getallen vlak bij de nul',bets:[[0,3],[12,15],[26],[32,35]]}];
const rlTotal=()=>Object.values(rl.bets).reduce((a,b)=>a+b,0);
const rlShort=v=>v>=1000?(v/1000).toLocaleString('nl-NL')+'K':v;
// Tafelgeometrie: (u,v) in tafel-eenheden (u: 0-12 langs de getallen, v: 0-3 over de rijen) → % in het getallenvak
const rlVert=()=>window.matchMedia&&matchMedia('(max-width:720px)').matches;
const rlPos=(u,v,vert)=>vert?[(3-v)/3*100,u/12*100]:[u/12*100,v/3*100];
function rlZones(){const Z=[];const add=(u,v,ns,cls)=>Z.push({u,v,ns,cls});
 for(let j=0;j<12;j++)for(let r=0;r<3;r++){if(j<11)add(j+1,r+.5,[rlN(j,r),rlN(j+1,r)],'sp');if(r<2)add(j+.5,r+1,[rlN(j,r),rlN(j,r+1)],'sp');if(j<11&&r<2)add(j+1,r+1,[rlN(j,r),rlN(j+1,r),rlN(j,r+1),rlN(j+1,r+1)],'co')}
 for(let j=0;j<12;j++){add(j+.5,3,[3*j+1,3*j+2,3*j+3],'st');if(j<11)add(j+1,3,[3*j+1,3*j+2,3*j+3,3*j+4,3*j+5,3*j+6],'sl')}
 for(let r=0;r<3;r++)add(0,r+.5,[0,rlN(0,r)],'sp');add(0,1,[0,2,3],'co');add(0,2,[0,1,2],'co');add(0,3,[0,1,2,3],'sl');return Z}
const RL_ZONES=rlZones();
function rlChip(v,win){return v?`<i class="rchip c${RL_CHIPS.filter(c=>c<=v).pop()||10} ${win?'win':''}">${rlShort(v)}</i>`:''}
function rlSpot(k,inner,cls,extra){const v=rl.bets[k]||0,won=rl.res!=null&&!rl.spinning&&rl.lines&&rl.lines.some(l=>l.k===k&&l.back>0);
 return `<button class="rs ${cls||''}" data-k="${k}" data-ns="${rlNums(k).join(',')}" ${extra||''} onclick="act.rlBet('${k}')" oncontextmenu="event.preventDefault();act.rlRemove('${k}')" onmouseenter="rlHl(this.dataset.ns)" onmouseleave="rlHl('')" ${rl.spinning?'disabled':''}>${inner}${rlChip(v,won)}</button>`}
function rlTable(){const vert=rlVert(),hit=!rl.spinning&&rl.res!=null?rl.res:null;
 let nums='';for(let j=0;j<12;j++)for(let r=0;r<3;r++){const n=rlN(j,r),[x,y]=vert?[2-r,j]:[j,r];
  nums+=rlSpot(rlKey([n]),`<b>${n}</b>`,'num '+numCol(n)+(hit===n?' hit':''),`style="grid-column:${x+1};grid-row:${y+1}"`)}
 const zones=RL_ZONES.map(z=>{const [x,y]=rlPos(z.u,z.v,vert),k=rlKey(z.ns),v=rl.bets[k]||0,won=rl.res!=null&&!rl.spinning&&rl.lines&&rl.lines.some(l=>l.k===k&&l.back>0);
  return `<button class="rz ${z.cls} ${v?'on':''}" style="left:${x}%;top:${y}%" data-k="${k}" data-ns="${z.ns.join(',')}" aria-label="${rlLabel(k)}" title="${rlLabel(k)} · ${36/z.ns.length-1}:1" onclick="act.rlBet('${k}')" oncontextmenu="event.preventDefault();act.rlRemove('${k}')" onmouseenter="rlHl(this.dataset.ns)" onmouseleave="rlHl('')" ${rl.spinning?'disabled':''}>${rlChip(v,won)}</button>`}).join('');
 const red=`<span class="dia red"></span>`,blk=`<span class="dia black"></span>`;
 return `<div class="rt ${vert?'v':'h'} ${rl.erase?'erase':''}">
  <div class="rt-zero">${rlSpot(rlKey([0]),'<b>0</b>','num green zero'+(hit===0?' hit':''))}</div>
  <div class="rt-nums">${nums}<div class="rt-zones">${zones}</div></div>
  <div class="rt-cols">${(vert?['c1','c2','c3']:['c3','c2','c1']).map(k=>rlSpot(k,'<b>2:1</b>','out col')).join('')}</div>
  <div class="rt-doz">${['d1','d2','d3'].map(k=>rlSpot(k,`<b>${RL_OUT_LABEL[k]}</b>`,'out')).join('')}</div>
  <div class="rt-even">${rlSpot('low','<b>1-18</b>','out')}${rlSpot('even','<b>Even</b>','out')}${rlSpot('red',red,'out')}${rlSpot('black',blk,'out')}${rlSpot('odd','<b>Oneven</b>','out')}${rlSpot('high','<b>19-36</b>','out')}</div>
 </div>`}
function rlHl(ns){const set=new Set((ns||'').split(',').filter(Boolean).map(Number));document.querySelectorAll('.rt .num').forEach(el=>{const n=+el.querySelector('b').textContent;el.classList.toggle('hl',set.has(n))})}
function rlGroupsHtml(){const r=rl;return `<span class="label">Groepen op het wiel</span>${RL_GROUPS.map(g=>`<button class="rgrp" onclick="act.rlGroup('${g.id}')" onmouseenter="rlHl('${[...new Set(g.bets.flat())].join(',')}')" onmouseleave="rlHl('')" title="${g.d}" ${r.spinning?'disabled':''}><b>${g.n}</b><small>${g.bets.length} fiches · ${fmt(g.bets.length*r.chip)}</small></button>`).join('')}`}
function rlCtlHtml(){const r=rl,tot=rlTotal();return `
   <button class="btn ghost" onclick="act.rlUndo()" ${r.spinning||!r.undo.length?'disabled':''}>↶ Ongedaan</button>
   <button class="btn ghost ${r.erase?'on':''}" onclick="rl.erase=!rl.erase;rlPaintCtl()" ${r.spinning||!tot?'disabled':''}>${r.erase?'Weghalen: aan':'Fiches weghalen'}</button>
   <button class="btn ghost" onclick="act.rlClear()" ${r.spinning||!tot?'disabled':''}>Alles wissen</button>
   <button class="btn ghost" onclick="act.rlDouble()" ${r.spinning||(!tot&&!r.last)?'disabled':''}>${tot?'Verdubbelen':'Vorige × 2'}</button>
   <button class="btn ghost" onclick="act.rlRepeat()" ${r.spinning||tot||!r.last?'disabled':''}>Herhalen</button>
   <button class="btn gold rl-go" onclick="act.rlSpin()" ${r.spinning||!tot||inJail()?'disabled':''}>${r.spinning?'Draait…':'Draaien · '+fmt(tot)}</button>`}
// Alleen de vakken die veranderden bijwerken (geen hele pagina opnieuw tekenen bij elke fiche)
function rlPaint(keys){[...new Set(keys)].forEach(k=>document.querySelectorAll(`.rt [data-k="${k}"]`).forEach(el=>{const old=el.querySelector('.rchip');if(old)old.remove();const v=rl.bets[k]||0;
  if(v)el.insertAdjacentHTML('beforeend',rlChip(v,false));el.classList.toggle('on',!!v)}));rlPaintCtl()}
function rlPaintCtl(){if(!document.getElementById('rlCtl')){render();return}
 const t=document.getElementById('rlTot');if(t)t.textContent=fmt(rlTotal());document.getElementById('rlCtl').innerHTML=rlCtlHtml();
 const g=document.getElementById('rlGroups');if(g)g.innerHTML=rlGroupsHtml();
 document.querySelectorAll('.rl-chips .pchip').forEach(b=>b.classList.toggle('on',+b.dataset.v===rl.chip));
 const rt=document.querySelector('.rt');if(rt)rt.classList.toggle('erase',!!rl.erase)}
function rouletteView(){const tot=rlTotal(),r=rl,done=!r.spinning&&r.res!=null,cnt={red:0,black:0,green:0};r.hist.slice(0,50).forEach(n=>cnt[numCol(n)]++);
 const hn=Math.max(1,r.hist.slice(0,50).length);
 return `<div class="rlx">
 <section class="rl-top">
  <div class="rl-stats card"><div class="label">Laatste worpen</div><div class="hist">${r.hist.map((n,i)=>`<span class="hn ${numCol(n)} ${i===0&&done?'new':''}">${n}</span>`).join('')||'<span class="label">Nog geen worpen</span>'}</div>
   <div class="rl-bars"><div><span>Rood</span><i style="width:${cnt.red/hn*100}%;background:#c8243f"></i><b>${cnt.red}</b></div><div><span>Zwart</span><i style="width:${cnt.black/hn*100}%;background:#cfd3da"></i><b>${cnt.black}</b></div><div><span>Nul</span><i style="width:${cnt.green/hn*100}%;background:#13a86b"></i><b>${cnt.green}</b></div></div>
   <p class="rl-fine">Europese roulette met één nul. Elke worp staat los van de vorige: een reeks rood maakt zwart niet waarschijnlijker. Huisvoordeel 2,7%.</p></div>
  <div class="rl-wheel"><div class="wheelbox"><canvas id="wheel" width="1100" height="1100" aria-label="Roulettewiel"></canvas></div></div>
  <div class="rl-res card ${done?numCol(r.res):''}">
   <div class="label">${r.spinning?'Rien ne va plus':'Uitslag'}</div>
   <div class="rl-num">${r.spinning?'<span class="spin">…</span>':r.res==null?'<span class="dim">–</span>':r.res}</div>
   <div class="rl-col">${r.spinning?'De bal rolt':r.res==null?'Plaats je fiches':({red:'Rood',black:'Zwart',green:'Nul'})[numCol(r.res)]+(r.res?' · '+(r.res%2?'oneven':'even')+' · '+(r.res<=18?'1-18':'19-36'):'')}</div>
   ${done&&r.lines?`<div class="rl-pay ${r.net>0?'w':r.net<0?'l':''}"><span>${r.lines.some(l=>l.back)?'Je krijgt terug':'Verloren'}</span><b>${fmt(r.lines.reduce((a,l)=>a+l.back,0))}</b><small>${r.net>=0?'+':'−'}${fmt(Math.abs(r.net))} netto · inzet ${fmt(r.lines.reduce((a,l)=>a+l.stake,0))}</small></div>`:''}
  </div>
 </section>
 <section class="rl-felt">
  <div class="rl-bar">
   <div class="rl-chips">${RL_CHIPS.map(v=>`<button class="pchip c${v} ${r.chip===v?'on':''}" data-v="${v}" onclick="rl.chip=${v};rl.erase=false;SFX.chip();rlPaintCtl()" ${r.spinning?'disabled':''} aria-label="Fiche ${fmt(v)}">${rlShort(v)}</button>`).join('')}</div>
   <div class="rl-total"><span class="label">Totale inzet</span><b id="rlTot">${fmt(tot)}</b></div>
  </div>
  ${rlTable()}
  <div class="rl-groups" id="rlGroups">${rlGroupsHtml()}</div>
  <div class="rl-ctl" id="rlCtl">${rlCtlHtml()}</div>
  <p class="rl-help">Klik op een vak om een fiche te zetten. Op de lijnen tussen getallen zet je een split, op een kruispunt een hoek, onderaan een rij (3) of zes getallen. Rechtsklik of "Fiches weghalen" haalt een inzet weg. Max ${fmt(RL_SPOT_MAX)} per vak.</p>
  ${done&&r.lines&&r.lines.length?`<div class="rl-receipt">${receiptHtml(r.lines.filter(l=>l.back>0).concat(r.lines.some(l=>!l.back)?[{label:'Overige inzetten',note:r.lines.filter(l=>!l.back).length+' vakken verloren',stake:r.lines.filter(l=>!l.back).reduce((a,l)=>a+l.stake,0),back:0}]:[]),r.net)}</div>`:''}
 </section></div>`}
// Wiel + bal
function drawWheel(a){const cv=document.getElementById('wheel');if(!cv)return;const x=cv.getContext('2d'),W=cv.width,c=W/2,R=c*.78,seg=Math.PI*2/37,k=W/680;
 x.clearRect(0,0,W,W);x.save();x.translate(c,c);
 // houten rand en baan voor de bal
 let g=x.createRadialGradient(0,0,R*.9,0,0,c);g.addColorStop(0,'#3b2414');g.addColorStop(.55,'#5a361c');g.addColorStop(1,'#1e120a');x.beginPath();x.arc(0,0,c-2,0,Math.PI*2);x.fillStyle=g;x.fill();
 x.beginPath();x.arc(0,0,c*.93,0,Math.PI*2);x.strokeStyle='rgba(255,220,160,.25)';x.lineWidth=2*k;x.stroke();
 g=x.createRadialGradient(0,0,R,0,0,c*.9);g.addColorStop(0,'#1a1d24');g.addColorStop(1,'#2c313b');x.beginPath();x.arc(0,0,c*.9,0,Math.PI*2);x.arc(0,0,R+4,0,Math.PI*2,true);x.fillStyle=g;x.fill();
 for(let k=0;k<8;k++){x.save();x.rotate(k*Math.PI/4+Math.PI/8);x.fillStyle='#c9a24a';x.beginPath();x.moveTo(0,-c*.885);x.lineTo(5*k,-R-10*k);x.lineTo(-5*k,-R-10*k);x.closePath();x.fill();x.restore()}
 x.rotate(a);
 RL_ORDER.forEach((n,i)=>{const s=-Math.PI/2+i*seg-seg/2;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,s,s+seg);x.closePath();
  x.fillStyle=n===0?'#13a86b':REDS.has(n)?'#b81f38':'#14161c';x.fill();x.strokeStyle='rgba(201,162,74,.7)';x.lineWidth=1.4*k;x.stroke();
  x.save();x.rotate(s+seg/2+Math.PI/2);x.fillStyle='#f3f1ea';x.font='700 '+Math.round(W*.034)+'px "Big Shoulders Text","Arial Narrow",sans-serif';x.textAlign='center';x.fillText(n,0,-R+W*.045);x.restore()});
 x.beginPath();x.arc(0,0,R*.74,0,Math.PI*2);x.strokeStyle='rgba(201,162,74,.8)';x.lineWidth=2*k;x.stroke();
 g=x.createRadialGradient(-R*.15,-R*.15,0,0,0,R*.64);g.addColorStop(0,'#5a3a20');g.addColorStop(1,'#26160c');x.beginPath();x.arc(0,0,R*.64,0,Math.PI*2);x.fillStyle=g;x.fill();
 for(let k=0;k<4;k++){x.save();x.rotate(k*Math.PI/2);x.beginPath();x.moveTo(0,-R*.1);x.lineTo(0,-R*.56);x.strokeStyle='#c9a24a';x.lineWidth=6*k;x.lineCap='round';x.stroke();
  x.beginPath();x.arc(0,-R*.56,7*k,0,Math.PI*2);x.fillStyle='#e8c66a';x.fill();x.restore()}
 x.beginPath();x.arc(0,0,R*.12,0,Math.PI*2);x.fillStyle='#e8c66a';x.fill();
 x.restore();
 // bal: rl.ball = hoek op de wereld, rl.ballR = 1 (baan) … 0 (in het vakje)
 if(rl.res!=null||rl.spinning){const br=(R+(c*.86-R)*rl.ballR)-(1-rl.ballR)*W*.03,bx=c+Math.cos(rl.ball)*br,by=c+Math.sin(rl.ball)*br;
  x.beginPath();x.arc(bx+2*k,by+3*k,W*.014,0,Math.PI*2);x.fillStyle='rgba(0,0,0,.45)';x.fill();
  g=x.createRadialGradient(bx-3*k,by-3*k,1,bx,by,W*.016);g.addColorStop(0,'#fff');g.addColorStop(1,'#b9bcc4');x.beginPath();x.arc(bx,by,W*.015,0,Math.PI*2);x.fillStyle=g;x.fill()}}
let rlResizeT=null,rlWasVert=null;
window.addEventListener('resize',()=>{clearTimeout(rlResizeT);rlResizeT=setTimeout(()=>{const v=rlVert();if(page==='casino'&&casinoTab==='roulette'&&v!==rlWasVert&&!rl.spinning)render();rlWasVert=v},150)});
Object.assign(act,{
 rlBet(k){const r=rl;if(r.spinning)return;if(r.erase){act.rlRemove(k);return}
  const cur=r.bets[k]||0,add=Math.min(r.chip,RL_SPOT_MAX-cur);if(add<=0){toast('Maximaal '+fmt(RL_SPOT_MAX)+' per vak','bad');return}
  if(rlTotal()+add>S.cash){toast('Niet genoeg contant geld voor deze fiche','bad');return}
  r.bets[k]=cur+add;r.undo.push([[k,add]]);SFX.chip();rlPaint([k])},
 rlRemove(k){const r=rl;if(r.spinning||!r.bets[k])return;const v=r.bets[k];delete r.bets[k];r.undo.push([[k,-v]]);SFX.click();rlPaint([k])},
 rlGroup(id){const r=rl,g=RL_GROUPS.find(x=>x.id===id);if(r.spinning||!g)return;
  const cost=g.bets.length*r.chip;if(rlTotal()+cost>S.cash){toast('Niet genoeg contant geld voor '+g.n.toLowerCase(),'bad');return}
  const step=[];g.bets.forEach(ns=>{const k=rlKey(ns),cur=r.bets[k]||0,add=Math.min(r.chip,RL_SPOT_MAX-cur);if(add>0){r.bets[k]=cur+add;step.push([k,add])}});
  if(step.length)r.undo.push(step);SFX.chip();rlPaint(step.map(x=>x[0]))},
 rlUndo(){const r=rl;if(r.spinning||!r.undo.length)return;const step=r.undo.pop();step.forEach(([k,v])=>{r.bets[k]=(r.bets[k]||0)-v;if(r.bets[k]<=0)delete r.bets[k]});SFX.click();rlPaint(step.map(x=>x[0]))},
 rlClear(){const r=rl;if(r.spinning)return;const keys=Object.keys(r.bets),step=Object.entries(r.bets).map(([k,v])=>[k,-v]);if(step.length)r.undo.push(step);r.bets={};r.erase=false;rlPaint(keys)},
 rlDouble(){const r=rl;if(r.spinning)return;const src=rlTotal()?r.bets:r.last;if(!src)return;const tot=Object.values(src).reduce((a,b)=>a+b,0)*2;
  if(tot>S.cash){toast('Niet genoeg contant geld om te verdubbelen','bad');return}
  const keys=[...Object.keys(r.bets),...Object.keys(src)],step=[],nb={};Object.entries(src).forEach(([k,v])=>{const nv=Math.min(RL_SPOT_MAX,v*2);nb[k]=nv;step.push([k,nv-(r.bets[k]||0)])});
  r.bets=nb;r.undo.push(step);SFX.chip();rlPaint(keys)},
 rlRepeat(){const r=rl;if(r.spinning||!r.last||rlTotal())return;const tot=Object.values(r.last).reduce((a,b)=>a+b,0);if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  r.bets=Object.assign({},r.last);r.undo.push(Object.entries(r.bets).map(([k,v])=>[k,v]));SFX.chip();rlPaint(Object.keys(r.bets))},
 rlSpin(){const r=rl;if(r.spinning||inJail())return;const tot=rlTotal();if(!tot)return;if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  // uitkomst staat meteen vast en wordt meteen verrekend (verversen verandert niets)
  const n=crypto.getRandomValues(new Uint32Array(1))[0]%37;
  const lines=Object.entries(r.bets).map(([k,v])=>{const ns=rlNums(k);return {k,label:rlLabel(k),note:ns.length>1&&ns.length<=6?(36/ns.length-1)+':1':'',stake:v,back:ns.includes(n)?v*36/ns.length:0}});
  const pay=lines.reduce((a,l)=>a+l.back,0),net=pay-tot;
  S.cash+=pay-tot;window.slotPending=pay;if(net>0)S.stats.won+=net;else S.stats.lost+=-net;casinoRound(tot,pay,'roulette');
  log('Roulette: '+n+' · inzet '+fmt(tot)+', terug '+fmt(pay),net>0?'ok':net<0?'bad':'info');save();
  r.last=Object.assign({},r.bets);r.undo=[];r.erase=false;
  const i=RL_ORDER.indexOf(n),seg=Math.PI*2/37,TAU=Math.PI*2,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from=r.angle,delta=TAU*(4+Math.random())+Math.random()*TAU,to=from+delta,pocket=-Math.PI/2+i*seg,b0=r.ball||-Math.PI/2;
  const dur=reduce?400:6500,t0=performance.now();r.spinning=true;r.res=null;r.lines=null;render();SFX.spin();
  let lastTick=0;
  const step=t=>{const p=Math.min(1,(t-t0)/dur);const ew=1-Math.pow(1-p,3);r.angle=from+delta*ew;
   // bal draait de andere kant op, valt rond 70% in de vakjes en ligt vanaf 86% stil in zijn vakje
   const q=Math.min(1,p/.86),eb=1-Math.pow(1-q,2.4),rel=pocket+(1-eb)*TAU*9;r.ball=r.angle+rel;
   r.ballR=p<.62?1:p<.86?Math.max(0,1-(p-.62)/.24)*(0.6+0.4*Math.abs(Math.cos((p-.62)*40))):0;
   if(p>.62&&p<.9&&t-lastTick>110+(p-.62)*600){lastTick=t;SFX.tick()}
   drawWheel(r.angle);if(p<1)requestAnimationFrame(step);else finish()};
  requestAnimationFrame(step);
  const finish=()=>{r.spinning=false;r.res=n;r.net=net;r.lines=lines;r.hist.unshift(n);r.hist=r.hist.slice(0,16);r.bets={};window.slotPending=0;
   if(net>0){toast(n+' '+({red:'rood',black:'zwart',green:'nul'})[numCol(n)]+'. Je krijgt '+fmt(pay)+' terug (+'+fmt(net)+')');net>=tot*5?SFX.big():SFX.win(2)}
   else if(pay>0){toast(n+'. Je krijgt '+fmt(pay)+' terug ('+fmt(net)+')','bad');SFX.chip()}
   else{toast(n+' '+({red:'rood',black:'zwart',green:'nul'})[numCol(n)]+'. Verloren: '+fmt(tot),'bad');SFX.lose()}
   save();if(page==='casino'&&casinoTab==='roulette')render();else{renderTop()}}}});
