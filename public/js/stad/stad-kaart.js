// Pixelstad: de grote kaart (M). Inzoomen en schuiven (slepen, knijpen, scrollwiel, + en −), lagen aan en uit, plekken die bij
// elkaar staan worden één bolletje met een getal, en al je bezit is één gouden markering op Oostland. Tik op een plek of op de grond:
// een kaartje met 'Route zetten' (lijn op de minikaart en een lichtbaken in de stad) of 'Erheen lopen'.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,X=STAD_GFX,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const pageName=k=>{const p=(typeof PAGES!=='undefined'&&PAGES.find(x=>x[0]===k));return p?p[1]:k};
const secOf=k=>{const g=typeof NAV_GROUPS!=='undefined'&&NAV_GROUPS.find(g=>g[1].includes(k));return g||['Jij',[],'#f2c230']};
const pic=k=>{try{return typeof svg==='function'&&typeof ICONS!=='undefined'&&ICONS[k]?svg(k):K.ic.route}catch(e){return K.ic.route}};
const ownedPlaces=()=>M.places.filter(p=>p.dyn&&p.own&&p.zone!=='brug');
const LAY={verhaal:1,plek:1,doen:1,bezit:1,auto:1,politie:1};try{Object.assign(LAY,JSON.parse(localStorage.getItem('stad_kaart')||'{}'))}catch(e){}
const mapCv=X.mapCanvas();
/* ---------- opbouw ---------- */
const ov=document.createElement('div');ov.className='sd-kaart';ov.id='sdKaart';ov.hidden=true;document.body.appendChild(ov);
ov.innerHTML=`<div class="sd-k-box"><div class="sd-k-top"><div class="sd-k-t"><small>Pixelstad</small><b>Kaart</b></div><div class="sd-k-chips" id="sdKChips"></div><button class="sd-x" data-close aria-label="Sluiten">×</button></div>
 <div class="sd-k-main"><div class="sd-k-view" id="sdKView"><canvas id="sdKCv"></canvas><div class="sd-k-pins" id="sdKPins"></div>
  <div class="sd-k-zoom"><button data-z="1" aria-label="Inzoomen">+</button><button data-z="-1" aria-label="Uitzoomen">−</button><button data-me aria-label="Naar jou">${K.ic.walk}</button></div>
  <div class="sd-k-tip" id="sdKTip">${touch?'Tik op een plek of op de kaart':'Klik op een plek of op de kaart · slepen om te schuiven · scrollen om te zoomen'}</div></div>
  <div class="sd-k-card" id="sdKCard" hidden></div></div></div>`;
const view=$s('sdKView'),cv=$s('sdKCv'),cx=cv.getContext('2d'),pins=$s('sdKPins'),card=$s('sdKCard');
let Z=2,CX=M.W/2,CZ=M.H/2,VW=1,VH=1,dpr=1;
const minZ=()=>Math.min(VW/M.W,VH/M.H)*.96,maxZ=9;
const sx=x=>(x-CX)*Z+VW/2,sz=z=>(z-CZ)*Z+VH/2,wx=x=>(x-VW/2)/Z+CX,wz=y=>(y-VH/2)/Z+CZ;
function clampView(){Z=Math.max(minZ(),Math.min(maxZ,Z));const hw=VW/2/Z,hh=VH/2/Z;CX=M.W<=2*hw?M.W/2:Math.max(hw,Math.min(M.W-hw,CX));CZ=M.H<=2*hh?M.H/2:Math.max(hh,Math.min(M.H-hh,CZ))}
function size(){const r=view.getBoundingClientRect();VW=Math.max(1,r.width);VH=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);cv.style.width=VW+'px';cv.style.height=VH+'px';clampView()}
/* ---------- tekenen ---------- */
function draw(){const P=G.P;cx.setTransform(dpr,0,0,dpr,0,0);cx.imageSmoothingEnabled=false;cx.fillStyle='#14304a';cx.fillRect(0,0,VW,VH);
  cx.drawImage(mapCv,sx(0),sz(0),M.W*Z,M.H*Z);
  // Oostland: goud omlijnd, eigen panden goud ingekleurd
  const es=M.ESTATE;cx.save();cx.strokeStyle='rgba(242,194,48,.85)';cx.lineWidth=2;cx.setLineDash([6,4]);cx.strokeRect(sx(es.x0+1),sz(es.z0+1),(es.x1-es.x0-2)*Z,(es.z1-es.z0-2)*Z);cx.restore();
  if(LAY.bezit&&Z>=1.3){cx.lineWidth=1;cx.setLineDash([3,3]);M.places.forEach(p=>{if(!p.est||p.own)return;const r=p.rect;cx.strokeStyle=p.dyn==='biz'?'rgba(210,210,200,.4)':'rgba(130,230,150,.45)';cx.strokeRect(sx(r.x0)+.5,sz(r.z0)+.5,(r.x1-r.x0)*Z-1,(r.z1-r.z0)*Z-1)});cx.setLineDash([])}
  if(LAY.bezit)ownedPlaces().forEach(p=>{const r=p.rect;cx.fillStyle=p.home?'#ffd35a':'#f2c230';cx.globalAlpha=.85;cx.fillRect(sx(r.x0),sz(r.z0),(r.x1-r.x0)*Z,(r.z1-r.z0)*Z);cx.globalAlpha=1;
    if(Z>=3.4){cx.font='700 11px system-ui,sans-serif';cx.fillStyle='#111';cx.textAlign='center';cx.fillText(p.name.replace(/^(Thuis: |Jouw )/,''),sx((r.x0+r.x1)/2),sz((r.z0+r.z1)/2)+4)}});
  // wijknamen (groot en vaag, alleen als je ver weg kijkt)
  cx.textAlign='center';cx.textBaseline='middle';
  if(Z<3.2){cx.font=`800 ${Math.round(Math.max(10,Math.min(16,Z*6)))}px "Big Shoulders Display",system-ui,sans-serif`;M.DISTRICTS.forEach(d=>{if(M.estateAt(d.x,d.z))return;cx.fillStyle='rgba(255,255,255,.55)';cx.fillText(d.n.toUpperCase(),sx(d.x),sz(d.z))})}
  cx.font=`900 ${Math.round(Math.max(12,Math.min(26,Z*9)))}px "Big Shoulders Display",system-ui,sans-serif`;cx.fillStyle='rgba(242,194,48,.9)';cx.fillText('OOSTLAND',sx((es.x0+es.x1)/2),sz(es.z0+20));
  cx.font='700 10px ui-monospace,monospace';cx.fillStyle='rgba(242,194,48,.75)';if(Z>=1)cx.fillText('JOUW TERREIN',sx((es.x0+es.x1)/2),sz(es.z0+20)+Math.max(12,Z*6));
  // route
  const path=G.gpsPath;if(path&&path.length&&G.waypoint){cx.strokeStyle='#ff4fd8';cx.lineWidth=3;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(sx(P.x),sz(P.z));path.forEach(q=>cx.lineTo(sx(q.x),sz(q.z)));cx.stroke();cx.setLineDash([])}
  if(G.missionPath&&G.missionPath.length){cx.strokeStyle='#ffd35a';cx.lineWidth=3;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(sx(P.x),sz(P.z));G.missionPath.forEach(q=>cx.lineTo(sx(q.x),sz(q.z)));cx.stroke();cx.setLineDash([])}
  if(G.missionDots)G.missionDots().forEach(d=>{const r=d.big?6:4;cx.fillStyle='#000';cx.fillRect(sx(d.x)-r-1,sz(d.z)-r-1,2*r+2,2*r+2);cx.fillStyle=d.c;cx.fillRect(sx(d.x)-r,sz(d.z)-r,2*r,2*r)});
  if(LAY.politie&&G.police&&G.police.dots)G.police.dots().forEach(d=>{cx.fillStyle=d.c||'#4d7dff';cx.beginPath();cx.arc(sx(d.x),sz(d.z),d.r?d.r*Z:4,0,Math.PI*2);if(d.r){cx.globalAlpha=.18;cx.fill();cx.globalAlpha=1;cx.strokeStyle=d.c;cx.lineWidth=2;cx.stroke()}else cx.fill()});
  // jij
  cx.save();cx.translate(sx(P.x),sz(P.z));cx.rotate(Math.atan2(Math.cos(P.ry),Math.sin(P.ry)));const s=Math.max(7,Math.min(12,Z*3));
  cx.fillStyle='#000';cx.beginPath();cx.moveTo(s+2,0);cx.lineTo(-s*.7-1,s*.75+1);cx.lineTo(-s*.3,0);cx.lineTo(-s*.7-1,-s*.75-1);cx.closePath();cx.fill();
  cx.fillStyle='#fff';cx.beginPath();cx.moveTo(s,0);cx.lineTo(-s*.7,s*.7);cx.lineTo(-s*.3,0);cx.lineTo(-s*.7,-s*.7);cx.closePath();cx.fill();cx.restore();
  placePins()}
/* ---------- markeringen (DOM, zodat ze klikbaar en scherp zijn), samengevoegd als ze te dicht op elkaar staan ---------- */
function items(){const out=[];
  if(LAY.plek)M.places.filter(p=>!p.dyn).forEach(p=>out.push({k:'pl',id:p.id,x:p.door.x,z:p.door.z,n:p.name,c:secOf(p.page)[2],ic:pic(p.page),pri:2}));
  const home=M.places.find(p=>p.dyn==='plot'&&p.home);if(home)out.push({k:'home',id:home.id,x:home.door.x,z:home.door.z,n:'Thuis',c:'#ffd35a',ic:K.ic.home,pri:4,big:1});
  if(LAY.bezit){const own=ownedPlaces();out.push({k:'bezit',x:M.ESTATE.gate.x+40,z:M.ESTATE.gate.z+40,n:own.length?'Jouw bezit ×'+own.length:'Oostland · jouw terrein',c:'#f2c230',ic:K.ic.key,pri:5,big:1})}
  const oc=(G.vehicles||[]).find(v=>v.own);if(LAY.auto&&oc)out.push({k:'car',x:oc.x,z:oc.z,n:'Mijn auto',c:'#ff7a1a',ic:pic('cars'),pri:3});
  // de heler (bestellingen, spullen verkopen) en waar je een gestolen auto kwijt kunt
  const hl=G.helerContact||(G.NPC||[]).find(n=>n.arch==='heler'&&n.contact);if(LAY.plek&&hl)out.push({k:'pl',x:hl.x,z:hl.z,n:'Ome Henk (heler)',c:'#ff7a1a',ic:K.ic.bag,pri:2});
  if(G.autoPoints)G.autoPoints().forEach(p=>out.push({k:'dl',x:p.x,z:p.z,n:p.t,c:'#f2c230',ic:K.ic.key,pri:6,big:1}));
  if(G.orderCar&&G.orderCar.st!=='gestolen')out.push({k:'dl',x:G.orderCar.x,z:G.orderCar.z,n:G.orderCar.m.n+' (heler)',c:'#ff7a1a',ic:pic('cars'),pri:7,big:1});
  if(LAY.doen&&G.spotMap)G.spotMap().forEach(o=>out.push(Object.assign({k:'do'},o)));
  if(LAY.verhaal&&G.verhaalMap)G.verhaalMap().forEach(o=>out.push(Object.assign({k:'do'},o)));
  if(G.waypoint)out.push({k:'wp',x:G.waypoint.x,z:G.waypoint.z,n:G.waypoint.n||'Gemarkeerd',c:'#ff4fd8',ic:K.ic.route,pri:9,big:1});
  return out}
let cells=[];
function placePins(){const its=items().map(o=>Object.assign(o,{px:sx(o.x),py:sz(o.z)})).filter(o=>o.px>-20&&o.py>-20&&o.px<VW+20&&o.py<VH+20).sort((a,b)=>b.pri-a.pri);
  const R=Z>=3.2?22:34;cells=[];its.forEach(o=>{const c=cells.find(c=>Math.abs(c.px-o.px)<R&&Math.abs(c.py-o.py)<R);if(c&&(o.k==='pl'||o.k==='do')&&(c.k==='pl'||c.k==='do'))c.more.push(o);else cells.push(Object.assign(o,{more:[]}))});
  const lab=Z>=3.2;
  pins.innerHTML=cells.map((o,i)=>`<button class="sd-k-pin k-${o.k}${o.big?' big':''}${o.more.length?' clu':''}" data-c="${i}" style="left:${o.px}px;top:${o.py}px;--c:${o.c}" aria-label="${E(o.n)}"><i>${o.ic}</i>${o.more.length?`<em>${o.more.length+1}</em>`:''}${(lab||o.big)&&!o.more.length?`<span>${E(o.n)}</span>`:''}</button>`).join('')}
/* ---------- kaartje van een gekozen plek ---------- */
function dist(x,z){return Math.round(Math.hypot(x-G.P.x,z-G.P.z))}
function walkT(d){const s=d/7;return s<60?'minder dan een minuut':Math.round(s/60)+' min'}
function showCard(o){let h='';const d=o.x!=null?dist(o.x,o.z):0;
  if(o.k==='bezit'){const own=ownedPlaces();h=`<div class="sd-k-ch"><i style="--c:#f2c230">${K.ic.key}</i><div><small>Oostland · jouw terrein</small><b>${own.length?'Jouw bezit':'Nog niets van jou'}</b></div></div>
    <div class="sd-k-own">${own.map(p=>`<button data-go="${p.id}"><span>${E(p.name.replace(/^(Thuis: |Jouw )/,''))}</span><small>${E(M.districtAt(p.door.x,p.door.z))}${p.building?' · bouwt':''}</small></button>`).join('')||'<p>Bij Notaris De Sleutel koop je een woning of zaak; die wordt hier gebouwd.</p>'}</div>
    <div class="sd-k-b"><button class="btn sm" data-not>${K.ic.key} Notaris</button><button class="btn ghost sm" data-wp="${M.ESTATE.gate.x},${M.ESTATE.gate.z},Oostland">Route naar Oostland</button></div>`}
  else{const pl=o.id?M.placeById(o.id):null,sub=pl?(pl.dyn?'Jouw bezit':secOf(pl.page)[0]+' · '+pageName(pl.page)):o.k==='car'?'Je auto staat hier':o.k==='wp'?'Jouw markering':o.k==='do'?'Te doen · '+M.districtAt(o.x,o.z):M.districtAt(o.x,o.z);
    h=`<div class="sd-k-ch"><i style="--c:${o.c||'#ff4fd8'}">${o.ic||K.ic.route}</i><div><small>${E(sub)}</small><b>${E(o.n||'Plek op de kaart')}</b></div></div><p class="sd-k-d">${E(M.districtAt(o.x,o.z))} · ${d} m · ${walkT(d)}</p>
    <div class="sd-k-b"><button class="btn sm" data-wp="${o.x},${o.z},${E(o.n||'Gemarkeerd')}"${o.id?` data-pl="${o.id}"`:''}>${K.ic.route} Route zetten</button><button class="btn ghost sm" data-walk="${o.x},${o.z}"${o.id?` data-pl="${o.id}"`:''}>${K.ic.walk} Erheen lopen</button>${o.k==='wp'?'<button class="btn ghost sm" data-clear>Wissen</button>':''}</div>`}
  card.innerHTML=`<button class="sd-x" data-cclose aria-label="Sluiten">×</button>${h}`;card.hidden=false;G.snd&&G.snd.fx('tab')}
/* ---------- route (GPS) ---------- */
let beam=null;
function setWp(x,z,n,plId){const p=M.nearestWalk(x,z,30)||{x,z};G.waypoint={x:p.x,z:p.z,n,pl:plId||null};gps();
  const sc=G.scene();if(!beam){beam=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,60,10,1,true),new THREE.MeshBasicMaterial({color:0xff4fd8,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.renderOrder=4;sc.add(beam)}
  beam.visible=true;beam.position.set(p.x,30,p.z);G.toast&&G.toast('Route gezet: '+n,'info');hudWp()}
function clearWp(){G.waypoint=null;G.gpsPath=null;if(beam)beam.visible=false;hudWp()}
function gps(){const w=G.waypoint;if(!w)return;G.gpsPath=M.findPath(G.P.x,G.P.z,w.x,w.z)}
G.setWaypoint=setWp;G.clearWaypoint=clearWp;
// chip onder de minikaart: waar je heen gaat en hoe ver nog
const chip=document.createElement('button');chip.className='sd-wp';chip.id='sdWp';chip.hidden=true;document.body.appendChild(chip);
function hudWp(){const w=G.waypoint;chip.hidden=!w;if(!w)return;const d=dist(w.x,w.z);chip.innerHTML=`<i>${K.ic.route}</i><span><b>${E(w.n)}</b><small>${d} m</small></span><em data-x aria-label="Route wissen">×</em>`}
chip.addEventListener('click',e=>{if(e.target.closest('[data-x]')){clearWp();return}const w=G.waypoint;if(w){if(w.pl)G.goPlace(M.placeById(w.pl));else G.goTo(w.x,w.z)}});
let gt=0;setInterval(()=>{if(!G.ready||G.paused||!G.waypoint)return;gt++;if(gt%3===0)gps();hudWp();if(beam)beam.material.opacity=.22+Math.sin(performance.now()/300)*.08;
  if(dist(G.waypoint.x,G.waypoint.z)<5){G.toast&&G.toast('Je bent er','ok');G.snd&&G.snd.fx('ok');clearWp()}},500);
/* ---------- openen, sluiten, bedienen ---------- */
function chipsHtml(){const L=[['verhaal','Verhaal'],['plek','Plekken'],['doen','Te doen'],['bezit','Bezit'],['auto','Mijn auto']];if(G.police&&G.police.active&&G.police.active())L.push(['politie','Politie']);
  $s('sdKChips').innerHTML=L.map(([k,n])=>`<button data-lay="${k}" class="${LAY[k]?'on':''}">${n}</button>`).join('')}
function open(){if(G.ui&&G.ui.closeAll)G.ui.closeAll();ov.hidden=false;if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.pause();size();if(!open._z){Z=Math.max(minZ(),Math.min(maxZ,Math.min(VW,VH)/260));open._z=1}CX=G.P.x;CZ=G.P.z;clampView();card.hidden=true;chipsHtml();draw();G.snd&&G.snd.fx('open')}
function close(){if(ov.hidden)return;ov.hidden=true;G.snd&&G.snd.fx('close');if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
G.kaart={open,close,isOpen:()=>!ov.hidden,draw:()=>{if(!ov.hidden)draw()}};
addEventListener('resize',()=>{if(!ov.hidden){size();draw()}});
setInterval(()=>{if(!ov.hidden)draw()},500);
// slepen, knijpen, scrollen
const pts=new Map();let drag=null,pinch=null;
view.addEventListener('pointerdown',e=>{if(e.target.closest('.sd-k-pin,.sd-k-zoom'))return;view.setPointerCapture(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:Z};drag=null;return}drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now()}});
view.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pts.size===2){const [a,b]=[...pts.values()];Z=pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(20,pinch.d);clampView();draw();return}
  if(!drag)return;CX-=(e.clientX-drag.x)/Z;CZ-=(e.clientY-drag.y)/Z;drag.x=e.clientX;drag.y=e.clientY;clampView();draw()});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!drag)return;const d=drag;drag=null;
  if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<7&&performance.now()-d.t<500){const r=view.getBoundingClientRect(),x=wx(e.clientX-r.left),z=wz(e.clientY-r.top);if(x>=0&&z>=0&&x<M.W&&z<M.H)showCard({k:'pt',x,z,n:'Plek op de kaart'})}};
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);drag=null;pinch=null});
view.addEventListener('wheel',e=>{e.preventDefault();const r=view.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top,ax=wx(mx),az=wz(my);Z*=e.deltaY>0?.85:1.18;clampView();CX=ax-(mx-VW/2)/Z;CZ=az-(my-VH/2)/Z;clampView();draw()},{passive:false});
ov.addEventListener('click',e=>{const t=e.target;
  if(t===ov||t.closest('[data-close]')){close();return}
  if(t.closest('[data-cclose]')){card.hidden=true;return}
  const lay=t.closest('[data-lay]');if(lay){const k=lay.dataset.lay;LAY[k]=LAY[k]?0:1;try{localStorage.setItem('stad_kaart',JSON.stringify(LAY))}catch(e){}chipsHtml();draw();G.snd&&G.snd.fx('tab');return}
  const zb=t.closest('[data-z]');if(zb){Z*=+zb.dataset.z>0?1.4:.7;clampView();draw();return}
  if(t.closest('[data-me]')){CX=G.P.x;CZ=G.P.z;Z=Math.max(Z,2.5);clampView();draw();return}
  const pin=t.closest('[data-c]');if(pin){const o=cells[+pin.dataset.c];if(!o)return;if(o.more.length){const all=[o,...o.more],ax=all.reduce((a,q)=>a+q.x,0)/all.length,az=all.reduce((a,q)=>a+q.z,0)/all.length;Z=Math.min(maxZ,Z*2.2);CX=ax;CZ=az;clampView();draw();return}showCard(o);return}
  const wp=t.closest('[data-wp]');if(wp){const [x,z,...n]=wp.dataset.wp.split(',');setWp(+x,+z,n.join(','),wp.dataset.pl);close();return}
  const wk=t.closest('[data-walk]');if(wk){const [x,z]=wk.dataset.walk.split(',');close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.resume();if(wk.dataset.pl)G.goPlace(M.placeById(wk.dataset.pl));else G.goTo(+x,+z);return}
  if(t.closest('[data-clear]')){clearWp();card.hidden=true;draw();return}
  if(t.closest('[data-not]')){close();G.vastgoed&&G.vastgoed.open();return}
  const go=t.closest('[data-go]');if(go){const p=M.placeById(go.dataset.go);if(p){setWp(p.door.x,p.door.z,p.name.replace(/^(Thuis: |Jouw )/,''),p.id);close()}return}});
addEventListener('keydown',e=>{if(ov.hidden)return;const k=e.key.toLowerCase();const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();if(!card.hidden)card.hidden=true;else close();return}
  if(k==='m'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();close();return}
  const st=60/Z;if(k==='arrowleft'||k==='a'){CX-=st}else if(k==='arrowright'||k==='d'){CX+=st}else if(k==='arrowup'||k==='w'){CZ-=st}else if(k==='arrowdown'||k==='s'){CZ+=st}else if(k==='+'||k==='='){Z*=1.4}else if(k==='-'){Z*=.7}else return;
  e.preventDefault();e.stopImmediatePropagation();clampView();draw()},true);
})();
