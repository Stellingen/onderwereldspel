// Pixelstad: alles om de wereld heen. HUD (wie je bent, geld, energie, gezocht), minikaart en wijknaam, de grote kaart (M),
// de telefoon (J), naar binnen en naar buiten (de schermen van het klikspel), de stick op de telefoon en de bajes.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,X=STAD_GFX,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const ICON={map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',phone:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  klik:'<rect x="3" y="4" width="18" height="14" rx="1"/><path d="M8 21h8M12 18v3"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  out:'<path d="M14 4h5v16h-5"/><path d="M10 8l-4 4 4 4M6 12h11"/>',walk:'<circle cx="13" cy="4" r="2"/><path d="M11 21l2-6-3-3 2-5 3 3 3 1M8 13l2-6"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',heart:'<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/>',pin:'<path d="M12 22s7-7 7-12a7 7 0 00-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'};
const ic=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[k]||''}</svg>`;
const pic=k=>{try{return typeof svg==='function'&&typeof ICONS!=='undefined'&&ICONS[k]?svg(k):ic('pin')}catch(e){return ic('pin')}};
const pageName=k=>{const p=(typeof PAGES!=='undefined'&&PAGES.find(x=>x[0]===k));return p?p[1]:k};
const hasPage=k=>typeof PAGES!=='undefined'&&PAGES.some(x=>x[0]===k);
const secOf=k=>{const g=typeof NAV_GROUPS!=='undefined'&&NAV_GROUPS.find(g=>g[1].includes(k));return g||['Jij',[],'#f2c230','242,194,48']};
const jailed=()=>typeof inJail==='function'&&inJail();
const tst=(m,c)=>{try{toast(m,c)}catch(e){}};G.toast=tst;
const E=s=>typeof esc==='function'?esc(s):String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const ui=document.createElement('div');ui.id='stadUi';document.body.appendChild(ui);
ui.innerHTML=`
<div class="sd-top">
 <div class="sd-card" id="sdCard">
  <div class="sd-who"><canvas class="sd-ava" id="sdAva" width="12" height="12"></canvas>
   <div class="sd-id"><b id="sdName"></b><span id="sdRank"></span><i class="sd-xp"><i id="sdXp"></i></i></div></div>
  <div class="sd-money"><b id="sdCash"></b><small id="sdBank"></small></div>
  <div class="sd-meters"><div class="sd-m en" title="Energie">${ic('bolt')}<i><i id="sdEn"></i></i><em id="sdEnV"></em></div><div class="sd-m hp" title="Gezondheid">${ic('heart')}<i><i id="sdHp"></i></i><em id="sdHpV"></em></div></div>
  <div class="sd-wanted" id="sdWanted" hidden></div>
 </div>
 <div class="sd-side">
  <div class="sd-mm" id="sdMmWrap" title="Kaart (M)"><canvas id="sdMini" width="144" height="144"></canvas><i class="sd-north" id="sdNorth">N</i></div>
  <div class="sd-loc"><b id="sdLoc"></b><span id="sdTime"></span></div>
  <div class="sd-btns"><button class="sd-b" id="sdMapB" title="Kaart (M)">${ic('map')}<span>Kaart</span><kbd>M</kbd></button><button class="sd-b" id="sdPhoneB" title="Telefoon (J)">${ic('phone')}<span>Telefoon</span><kbd>J</kbd></button></div>
 </div>
</div>
<div class="sd-area" id="sdArea" hidden><small>Pixelstad</small><b></b></div>
<div class="sd-keys" id="sdKeys" ${touch?'hidden':''}><span><kbd>WASD</kbd>lopen</span><span><kbd>Shift</kbd>rennen</span><span><kbd>E</kbd>praten / naar binnen</span><span><kbd>Z</kbd><kbd>C</kbd>draaien</span><span class="sd-beta">beta</span></div>
<button class="sd-prompt" id="sdPrompt" hidden></button>
<div class="sd-joy" id="sdJoy" ${touch?'':'hidden'}><i id="sdKnob"></i></div>
<button class="sd-run" id="sdRun" ${touch?'':'hidden'}>Ren</button>
<div class="sd-dest" id="sdDest" hidden></div>
<div class="sd-phone" id="sdPhone" hidden><div class="sd-ph">
  <div class="sd-ph-bar"><span id="sdClock"></span><i class="sd-notch"></i><span class="sd-ph-st"><i class="sd-sig"><i></i><i></i><i></i><i></i></i><b id="sdBat"></b></span></div>
  <div class="sd-ph-scr">
   <div id="sdHome"><div class="sd-wid"><div><small>Contant</small><b id="sdPhCash"></b></div><div><small>Bank</small><b id="sdPhBank"></b></div></div>
    <div class="sd-msgs" id="sdMsgs"></div><div class="sd-apps" id="sdApps"></div></div>
   <div class="sd-set" id="sdSet" hidden></div>
  </div>
  <div class="sd-dock"><button class="sd-app" data-app="map"><i style="--c:#3fe395">${ic('map')}</i><span>Kaart</span></button><button class="sd-app" data-app="set"><i style="--c:#a9dcff">${ic('set')}</i><span>Instellingen</span></button><button class="sd-app" data-app="klik"><i style="--c:#ff7a1a">${ic('klik')}</i><span>Klikspel</span></button></div>
  <button class="sd-homebar" data-close aria-label="Telefoon wegleggen"></button>
 </div></div>
<div class="sd-in" id="sdIn" hidden><button class="sd-out" id="sdOut">${ic('out')}<span>Naar buiten</span></button><div class="sd-in-n"><small id="sdInK">Binnen</small><b id="sdInName"></b></div><button class="sd-b" id="sdInPhone" title="Telefoon (J)">${ic('phone')}<span>Telefoon</span></button><button class="sd-b" id="sdInMap" title="Kaart (M)">${ic('map')}<span>Kaart</span></button></div>
<div class="sd-help" id="sdHelp" hidden></div>`;
document.body.classList.add('stad');

/* ---------- HUD ---------- */
const wantedLv=()=>{const w=S.wanted;if(!w)return 0;return typeof w==='object'?(w.lv||1):1};
let avaKey='';
function avatar(){const L=G.P&&G.P.look;if(!L)return;const k=JSON.stringify(L);if(k===avaKey)return;avaKey=k;const c=$s('sdAva').getContext('2d');
  const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};R(0,0,12,12,'#1a1d23');
  R(1,9,10,3,L.top);R(5,9,2,1,L.skin);R(3,3,6,6,L.skin);R(4,5,1,1,'#15161a');R(7,5,1,1,'#15161a');R(5,7,2,1,'rgba(0,0,0,.25)');
  const hat=L.hat||'none',hc=hat==='none'||hat==='bald'?L.hair:L.hatC;
  if(hat==='mask'){R(3,2,6,7,hc);R(4,5,1,1,'#e8e4da');R(7,5,1,1,'#e8e4da')}else if(hat==='hat'){R(1,3,10,1,hc);R(3,1,6,2,hc)}else if(hat==='cap'){R(3,2,6,2,hc);R(7,3,3,1,hc)}else if(hat==='beanie'){R(3,1,6,3,hc)}else if(hat!=='bald'){R(3,2,6,2,hc);R(3,4,1,1,hc);R(8,4,1,1,hc)}}
let lastLoc='',areaT=0;
function hud(){try{
  $s('sdCash').textContent=fmt(S.cash);$s('sdBank').textContent='Bank '+fmt(S.bank||0);
  const ri=rankIdx(S.xp),nx=RANKS[ri+1],pct=nx?Math.max(0,Math.min(100,(S.xp-RANKS[ri][1])/(nx[1]-RANKS[ri][1])*100)):100;
  $s('sdName').innerHTML=E(window.__USER__||'Jij')+(typeof vipTag==='function'?vipTag(1):'');$s('sdRank').textContent=RANKS[ri][0]+' · lv '+rankLevel(S.xp);$s('sdXp').style.width=pct.toFixed(1)+'%';
  const en=Math.max(0,Math.min(EN_MAX,Math.floor(S.energy))),hp=Math.max(0,Math.min(100,Math.round(S.hp)));
  $s('sdEn').style.width=en/EN_MAX*100+'%';$s('sdEnV').textContent=en;$s('sdHp').style.width=hp+'%';$s('sdHpV').textContent=hp;$s('sdHp').parentNode.parentNode.classList.toggle('low',hp<30);
  const w=wantedLv(),we=$s('sdWanted');we.hidden=!w;if(w)we.innerHTML='<span>Gezocht</span><b>'+'★'.repeat(Math.min(5,w))+'<i>'+'★'.repeat(Math.max(0,5-Math.min(5,w)))+'</i></b>';
  const d=new Date(),tm=d.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});$s('sdClock').textContent=tm;$s('sdTime').textContent=tm;
  $s('sdBat').textContent=Math.round(en/EN_MAX*100)+'%';$s('sdPhCash').textContent=fmt(S.cash);$s('sdPhBank').textContent=fmt(S.bank||0);
  avatar()}catch(e){}}
setInterval(hud,400);hud();
// wijknaam: in beeld als je een nieuwe wijk in loopt (zoals in GTA)
function loc(){const P=G.P;if(!P)return;const n=M.districtAt(P.x,P.z);if(n===lastLoc)return;const first=!lastLoc;lastLoc=n;$s('sdLoc').textContent=n;if(first||G.paused)return;
  const a=$s('sdArea');a.querySelector('small').textContent=M.estateAt&&M.estateAt(P.x,P.z)?'Oostland · jouw terrein':'Pixelstad';a.classList.remove('bad');a.querySelector('b').textContent=n;a.hidden=false;a.classList.remove('go');void a.offsetWidth;a.classList.add('go');clearTimeout(areaT);areaT=setTimeout(()=>{a.hidden=true},3200)}

/* ---------- minikaart ---------- */
const mapCv=X.mapCanvas(),mini=$s('sdMini'),mc=mini.getContext('2d');mc.imageSmoothingEnabled=false;
const PCOL={};M.places.forEach(p=>{PCOL[p.id]=secOf(p.page)[2]});
const pcol=p=>p.dyn?(p.own?'#f2c230':'#7d828a'):PCOL[p.id];
let pathPts=null;
function drawMini(){const P=G.P,w=mini.width,s=1.3;mc.setTransform(1,0,0,1,0,0);mc.imageSmoothingEnabled=false;mc.fillStyle='#14304a';mc.fillRect(0,0,w,w);
  mc.save();mc.translate(w/2,w/2);mc.rotate(G.yaw);mc.scale(s,s);mc.translate(-P.x,-P.z);mc.drawImage(mapCv,0,0);
  if(pathPts&&P.path){mc.strokeStyle='#ff7a1a';mc.lineWidth=2;mc.setLineDash([3,2]);mc.beginPath();mc.moveTo(P.x,P.z);P.path.forEach(q=>mc.lineTo(q.x,q.z));mc.stroke();mc.setLineDash([])}
  if(G.missionPath&&G.missionPath.length){mc.strokeStyle='#ffd35a';mc.lineWidth=2.2;mc.setLineDash([3,2]);mc.beginPath();mc.moveTo(P.x,P.z);G.missionPath.forEach(q=>mc.lineTo(q.x,q.z));mc.stroke();mc.setLineDash([])}
  if(G.gpsPath&&G.waypoint){mc.strokeStyle='#ff4fd8';mc.lineWidth=2.2;mc.setLineDash([3,2]);mc.beginPath();mc.moveTo(P.x,P.z);G.gpsPath.forEach(q=>mc.lineTo(q.x,q.z));mc.stroke();mc.setLineDash([]);const w=G.waypoint;mc.fillStyle='#000';mc.fillRect(w.x-3.4,w.z-3.4,6.8,6.8);mc.fillStyle='#ff4fd8';mc.fillRect(w.x-2.6,w.z-2.6,5.2,5.2)}
  if(G.police&&G.police.dots)G.police.dots().forEach(d=>{if(d.r){mc.strokeStyle=d.c;mc.lineWidth=1.5;mc.globalAlpha=.8;mc.beginPath();mc.arc(d.x,d.z,d.r,0,Math.PI*2);mc.stroke();mc.globalAlpha=1}else{mc.fillStyle='#000';mc.fillRect(d.x-2.8,d.z-2.8,5.6,5.6);mc.fillStyle=d.c;mc.fillRect(d.x-2,d.z-2,4,4)}});
  if(G.npcDots)G.npcDots().forEach(d=>{mc.fillStyle=d.c;mc.fillRect(d.x-1.4,d.z-1.4,2.8,2.8)});
  M.places.forEach(p=>{if(p.dyn&&!p.own)return;mc.fillStyle='#000';mc.fillRect(p.door.x-3,p.door.z-3,6,6);mc.fillStyle=pcol(p);mc.fillRect(p.door.x-2.2,p.door.z-2.2,4.4,4.4)});
  if(G.missionDots)G.missionDots().forEach(d=>{const r=d.big?3.4:2;mc.fillStyle='#000';mc.fillRect(d.x-r-.8,d.z-r-.8,2*r+1.6,2*r+1.6);mc.fillStyle=d.c;mc.fillRect(d.x-r,d.z-r,2*r,2*r)});
  mc.translate(P.x,P.z);mc.rotate(Math.atan2(Math.cos(P.ry),Math.sin(P.ry)));mc.fillStyle='#000';mc.beginPath();mc.moveTo(5,0);mc.lineTo(-3.4,3.4);mc.lineTo(-1.6,0);mc.lineTo(-3.4,-3.4);mc.closePath();mc.fill();
  mc.fillStyle='#fff';mc.beginPath();mc.moveTo(3.6,0);mc.lineTo(-2.4,2.4);mc.lineTo(-1,0);mc.lineTo(-2.4,-2.4);mc.closePath();mc.fill();mc.restore();
  const r=mini.getBoundingClientRect().width/2-2;$s('sdNorth').style.transform=`translate(${Math.sin(-G.yaw)*-r}px,${-Math.cos(G.yaw)*r}px)`;
  loc()}
G.drawMini=drawMini;let mmT=0;G.onFrame=dt=>{mmT+=(dt||0);if(!(mmT<.08)){mmT=0;try{drawMini()}catch(e){console.error('minikaart',e)}}};

/* ---------- ingang in de buurt ---------- */
const prompt=$s('sdPrompt');
G.onNear=p=>{if(!p){prompt.hidden=true;return}const sc=p.dyn&&p.own?['Jouw bezit',[],'#f2c230']:secOf(p.page);prompt.hidden=false;
  const act=p.dyn==='biz'&&!p.own?'Bekijken':p.building?'Bouw bekijken':'Naar binnen';prompt.innerHTML=`<i class="sd-pi">${pic(p.page)}</i><span class="sd-pt"><small>${E(sc[0])} · ${E(pageName(p.page))}${p.building?' · in aanbouw':''}</small><b>${E(p.name)}</b></span><span class="sd-pk">${touch?act:'<kbd>Spatie</kbd>'+act}</span>`;prompt.style.setProperty('--c',sc[2])};
prompt.addEventListener('click',()=>{if(G.near)enter(G.near)});
G.onPath=(path,goal)=>{pathPts=path;const d=$s('sdDest');if(!path){d.hidden=true;return}d.hidden=false;d.style.setProperty('--c',goal?pcol(goal):'#ff7a1a');
  d.innerHTML=`${ic('walk')}<span><small>Onderweg naar</small><b>${goal?E(goal.name):'je bestemming'}</b></span><button title="Stoppen" aria-label="Stoppen">×</button>`;d.querySelector('button').onclick=()=>G.stopPath()};

/* ---------- naar binnen en naar buiten ---------- */
let cur=null;
function showInside(kind,label,pg){G.pause();closeAll();cur=kind;document.body.classList.add('stad-in');const ib=$s('sdIn');ib.hidden=false;ib.style.setProperty('--c',secOf(pg)[2]);
  $s('sdInK').textContent=kind.phone?'Telefoon':kind.jail?'Je zit vast':'Binnen · '+(M.districtAt(G.P.x,G.P.z));$s('sdInName').textContent=label;
  if(typeof page!=='undefined'&&page===pg&&location.hash==='#'+pg)render();else location.hash='#'+pg;window.scrollTo(0,0);jailBtn()}
function enter(pl){if(!pl)return;if(G.mission&&G.mission()){tst('Maak eerst je klus af','bad');return}if(G.police&&G.police.active()&&pl.page!=='jail'){tst('Niet nu: de politie zit achter je aan','bad');return}if(G.driving&&G.exitCar)G.exitCar(true);
  // Café Het Gat: het klussenbord van de Pixelstad (missies), niet het scherm van het klikspel
  if(pl.page==='crimes'&&G.openBoard){G.openBoard();return}
  // Notaris De Sleutel: het vastgoedmenu (al je woningen en zaken)
  if(pl.id==='biz'&&G.vastgoed){G.snd&&G.snd.fx('door');G.vastgoed.open();return}
  // kavels op Oostland: leeg of niet je huidige huis → notaris-kaartje van die kavel; je huis of zaak → naar binnen
  if(pl.dyn==='plot'&&!(pl.own&&pl.home)&&pl.zone!=='brug'&&G.plotUI){G.plotUI(pl);return}
  if(pl.dyn==='plot'&&pl.zone==='brug'&&!pl.home&&G.plotUI){G.vastgoed&&G.vastgoed.open({say:'Onder de brug slapen kost niets. Zal ik het als uw adres noteren?'});return}
  if(pl.dyn==='biz'&&!pl.own&&G.plotUI){G.plotUI(pl);return}
  G.snd&&G.snd.fx('door');
  if(!hasPage(pl.page)){tst('Hier is nog niets te doen');return}if(pl.before)pl.before();showInside({pl},pl.name,pl.page)}
G.onEnter=enter;
function enterDirect(pl){if(!pl)return;if(pl.before)pl.before();showInside({pl},pl.name,pl.page)}
function phoneApp(pg){showInside({phone:1,pg},pageName(pg),pg)}
function leave(){if(!cur)return;if(jailed()){if(cur.phone){showInside({jail:1,pl:M.placeById('jail')},'De Bajes','jail');return}tst('Je zit nog vast. Wacht je straf uit, betaal borg of ontsnap.','bad');return}
  const was=cur;cur=null;document.body.classList.remove('stad-in');$s('sdIn').hidden=true;
  if(was.pl)G.placeAtDoor(was.pl);G.resume()}
function leaveQuiet(){if(jailed())return;const was=cur;cur=null;document.body.classList.remove('stad-in');$s('sdIn').hidden=true;if(was&&was.pl)G.placeAtDoor(was.pl)}
$s('sdOut').addEventListener('click',leave);
$s('sdInMap').addEventListener('click',()=>{if(!jailed())leaveQuiet();openMap()});
$s('sdInPhone').addEventListener('click',()=>openPhone());
function jailBtn(){const j=jailed(),b=$s('sdOut');b.disabled=!!(j&&!(cur&&cur.phone));b.querySelector('span').textContent=j&&!(cur&&cur.phone)?'Je zit vast':(cur&&cur.phone?'Telefoon weg':'Naar buiten')}
// de bajes: zit je vast, dan ben je binnen tot je vrij bent
setInterval(()=>{if(typeof inJail!=='function')return;const j=inJail();
  if(j&&(!cur||(!cur.jail&&!cur.phone&&!(cur.pl&&cur.pl.page==='jail'))))showInside({jail:1,pl:M.placeById('jail')},'De Bajes','jail');
  if(cur)jailBtn()},800);

/* ---------- telefoon (J) ---------- */
const APPS=['crimes','vastgoed','mycar','bank','look','shop','fam','hits','cars','casino','dash','profiel','rank','lid'];
const APPN={vastgoed:'Vastgoed',mycar:'Mijn auto',dash:'Overzicht',profiel:'Profiel',rank:'Ranglijst',lid:'Lid',bank:'Bank',shop:'Wapens',look:'Kleding',fam:'Familie',hits:'Opdrachten',crimes:'Klussen',cars:"Auto's",casino:'Casino'};
// alles wat je online kunt doen staat op je telefoon; klussen, casino en auto's doe je ter plekke (die apps tonen de weg)
const ONSITE={cars:1,casino:1};
function renderApps(){$s('sdApps').innerHTML=APPS.filter(k=>k==='mycar'||k==='vastgoed'||hasPage(k)).map(k=>`<button class="sd-app" data-app="${k}"><i style="--c:${k==='mycar'?'#ff7a1a':k==='vastgoed'?'#f2c230':secOf(k)[2]}">${k==='vastgoed'&&G.kit?G.kit.ic.key:pic(k==='mycar'?'cars':k)}${ONSITE[k]?`<em>${ic('pin')}</em>`:''}</i><span>${APPN[k]||pageName(k)}</span></button>`).join('');
  let msgs=[];try{msgs=(typeof logShown==='function'?logShown():S.log||[]).slice(0,2)}catch(e){}
  $s('sdMsgs').innerHTML=msgs.length?msgs.map(l=>`<div class="sd-msg ${l.c||''}"><b>Onderwereld</b><span>${E(String(l.m).replace(/<[^>]+>/g,''))}</span></div>`).join(''):''}
function openPhone(){const ph=$s('sdPhone');if(!ph.hidden){ph.hidden=true;if(!cur)G.resume();return}closeAll();renderApps();$s('sdSet').hidden=true;$s('sdHome').hidden=false;ph.hidden=false;if(!cur)G.pause()}
G.onPhone=openPhone;
$s('sdPhoneB').addEventListener('click',openPhone);
$s('sdPhone').addEventListener('click',e=>{const b=e.target.closest('[data-app]');if(!b)return;const k=b.dataset.app;
  if(k==='map'){$s('sdPhone').hidden=true;if(cur)leaveQuiet();openMap();return}
  if(k==='klik'){try{sessionStorage.setItem('ow_mode','klik')}catch(e){}G.savePos();location.href='/game';return}
  if(k==='set'){settings();return}
  // klussen, casino en auto's: daar moet je heen; de telefoon zet de route uit
  if(k==='mycar'){$s('sdPhone').hidden=true;if(cur)leaveQuiet();G.resume();G.bringCar&&G.bringCar();return}
  if(k==='vastgoed'&&G.vastgoed){$s('sdPhone').hidden=true;G.vastgoed.open();return}
  if(k==='crimes'&&G.openBoard){$s('sdPhone').hidden=true;if(cur)leaveQuiet();G.openBoard();return}
  if(ONSITE[k]&&!jailed()){const pl=M.placeByPage(k);$s('sdPhone').hidden=true;if(cur)leaveQuiet();G.resume();G.goPlace(pl);tst('Route naar '+pl.name);return}
  $s('sdPhone').hidden=true;phoneApp(k)});
function settings(){const s=$s('sdSet');$s('sdHome').hidden=true;s.hidden=false;const pix=G.pixPref||0;let skin='';try{skin=localStorage.getItem('stad_skin')||''}catch(e){}
  const SK=['#f1caa5','#e9b98f','#d9a27a','#b97a52','#8d5a3a','#6e4630'];
  s.innerHTML=`<button class="sd-back" data-back>← Terug</button><h3>Instellingen</h3>
   <div class="sd-row"><b>Beeld</b><div class="sd-seg">${[[480,'Scherp'],[0,'Normaal'],[260,'Grove pixels']].map(([v,n])=>`<button data-pix="${v}" class="${pix===v?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="sd-row"><b>Huidskleur</b><div class="sd-sk">${SK.map(c=>`<button data-skin="${c}" style="--c:${c}" class="${skin===c?'on':''}" aria-label="Huidskleur"></button>`).join('')}</div></div>
   <div class="sd-row"><b>Geluid</b><div class="sd-seg"><button data-snd="fx" class="${G.snd&&G.snd.fxOn?'on':''}">Effecten</button><button data-snd="mu" class="${G.snd&&G.snd.muOn?'on':''}">Muziek</button></div></div>
   <div class="sd-row"><b>Volume</b><input type="range" min="0" max="1" step=".05" value="${G.snd?G.snd.vol:.8}" data-vol aria-label="Volume"></div>
   <div class="sd-row"><b>Tijd van de dag</b><div class="sd-seg">${[['','Echt'],['1','Dag'],['0','Nacht']].map(([v,n])=>`<button data-day="${v}" class="${String(G.forceDay==null?'':G.forceDay)===v?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="sd-row"><b>Besturing</b><p>${touch?'Stick linksonder om te lopen, ver duwen is rennen. Veeg om de camera te draaien, knijp om te zoomen. Tik op een gebouw en je loopt erheen.':'WASD of pijltjes om te lopen, Shift rennen. E of Spatie: praten met iemand of naar binnen. F: auto in en uit. Z en C draaien de camera, scrollen zoomt. Klik op een gebouw en je loopt erheen. J telefoon, M kaart, Esc terug.'}</p></div>`;
  const vr=s.querySelector('[data-vol]');if(vr)vr.oninput=()=>{G.snd&&G.snd.setVol(+vr.value)};
  s.onclick=e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.back!=null){s.hidden=true;$s('sdHome').hidden=false;return}
    if(t.dataset.snd&&G.snd){if(t.dataset.snd==='fx')G.snd.setFx(!G.snd.fxOn);else G.snd.setMu(!G.snd.muOn);settings();return}
    if(t.dataset.pix!=null){G.setPix(+t.dataset.pix||0);settings()}
    if(t.dataset.skin){try{localStorage.setItem('stad_skin',t.dataset.skin)}catch(e){}G.refreshLook&&G.refreshLook();settings()}
    if(t.dataset.day!=null){G.forceDay=t.dataset.day===''?null:+t.dataset.day;try{localStorage.setItem('stad_day',t.dataset.day)}catch(e){}G.applyLight&&G.applyLight();settings()}}}
try{const d=localStorage.getItem('stad_day');if(d==='0'||d==='1')G.forceDay=+d}catch(e){}

/* ---------- grote kaart (M): stad-kaart.js ---------- */
function openMap(){G.kaart&&G.kaart.open()}
G.onMap=()=>{if(G.kaart&&G.kaart.isOpen())G.kaart.close();else openMap()};
$s('sdMapB').addEventListener('click',openMap);$s('sdMmWrap').addEventListener('click',openMap);

/* ---------- sluiten en sneltoetsen ---------- */
function closeAll(){$s('sdPhone').hidden=true;if(G.kaart&&G.kaart.isOpen())G.kaart.close()}
ui.addEventListener('click',e=>{if(e.target.closest('[data-close]')||e.target.classList.contains('sd-phone')){closeAll();if(!cur)G.resume()}});
addEventListener('keydown',e=>{const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;const k=e.key.toLowerCase(),ov=!$s('sdPhone').hidden;
  if(k==='escape'){if(ov){closeAll();if(!cur)G.resume()}else if(cur&&$s('modal').hidden&&!document.querySelector('.cg-ov,.chase-ov'))leave();return}
  if(e.repeat)return;
  if(G.paused&&!cur&&ov){if(k==='j'){closeAll();G.resume()}if(k==='m'){openMap()}}
  else if(cur&&(k==='j'||k==='m')&&$s('modal').hidden){if(k==='j')openPhone();else{if(!jailed())leaveQuiet();openMap()}}});

/* ---------- stick en renknop op de telefoon ---------- */
(function(){const J=$s('sdJoy'),kn=$s('sdKnob');let id=null,cx=0,cy=0;const R=46;
  J.addEventListener('pointerdown',e=>{id=e.pointerId;J.setPointerCapture(id);const r=J.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;mv(e)});
  const mv=e=>{if(e.pointerId!==id)return;let dx=e.clientX-cx,dy=e.clientY-cy;const d=Math.hypot(dx,dy);if(d>R){dx*=R/d;dy*=R/d}kn.style.transform=`translate(${dx}px,${dy}px)`;G.joy.x=dx/R;G.joy.y=-dy/R;G.joy.on=true;J.classList.toggle('far',d>R*.86)};
  J.addEventListener('pointermove',mv);const end=e=>{if(e.pointerId!==id)return;id=null;G.joy.on=false;G.joy.x=G.joy.y=0;kn.style.transform='';J.classList.remove('far')};
  J.addEventListener('pointerup',end);J.addEventListener('pointercancel',end);
  const rb=$s('sdRun');rb.addEventListener('click',()=>{G.runToggle=!G.runToggle;rb.classList.toggle('on',G.runToggle)})})();

/* ---------- uitleg bij de eerste keer ---------- */
(function(){let seen=0;try{seen=+localStorage.getItem('stad_help')}catch(e){}if(seen)return;const h=$s('sdHelp');h.hidden=false;
  h.innerHTML=`<small>Nieuw · beta</small><b>Welkom in de Pixelstad</b><p>Dezelfde stad en dezelfde voortgang, maar nu loop je er zelf doorheen. Ga een gebouw binnen en je speelt daar zoals je gewend bent.</p>
   <ul>${touch?'<li><b>Lopen</b><span>stick linksonder, ver duwen is rennen</span></li><li><b>Naar binnen</b><span>tik op de knop bij de deur of op een gebouw</span></li><li><b>Camera</b><span>veeg om te draaien, knijp om te zoomen</span></li><li><b>Telefoon en kaart</b><span>rechtsboven</span></li>'
   :'<li><b><kbd>WASD</kbd></b><span>lopen, met <kbd>Shift</kbd> rennen</span></li><li><b><kbd>E</kbd></b><span>praten met mensen, naar binnen bij een deur</span></li><li><b><kbd>J</kbd> <kbd>M</kbd></b><span>telefoon en kaart</span></li><li><b><kbd>Z</kbd> <kbd>C</kbd></b><span>camera draaien, scrollen zoomt</span></li><li><b>Klik</b><span>op een gebouw en je loopt erheen</span></li>'}</ul>
   <button class="btn" id="sdHelpOk">Op pad</button>`;
  $s('sdHelpOk').onclick=()=>{h.hidden=true;try{localStorage.setItem('stad_help','1')}catch(e){}}})();

// opstarten in de bajes als je vastzit
if(jailed())setTimeout(()=>{if(!cur)showInside({jail:1,pl:M.placeById('jail')},'De Bajes','jail')},50);
G.ui={enter,enterDirect,leave,leaveQuiet,closeAll,openMap,openPhone,cur:()=>cur};
})();
