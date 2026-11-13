// Pixelstad: de telefoon (J). Startscherm met jou en je geld, een 'Nu'-kaart (wat je nu aan het doen bent of wat je kunt doen),
// meldingen en apps. Apps in de telefoon zelf: Berichten (van je contacten, met knoppen), Dagklussen, Contacten (bellen = iets
// regelen), Taxi, Camera (selfie van je poppetje), Prestaties en Instellingen. Apps met ↗ openen het scherm van het klikspel.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const pic=k=>{try{return typeof svg==='function'&&typeof ICONS!=='undefined'&&ICONS[k]?svg(k):K.ic.route}catch(e){return K.ic.route}};
const hasPage=k=>typeof PAGES!=='undefined'&&PAGES.some(x=>x[0]===k);
const pageName=k=>{const p=(typeof PAGES!=='undefined'&&PAGES.find(x=>x[0]===k));return p?p[1]:k};
const MAPIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>';
const SETIC='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>';
// sleutel, naam, icoon, kleur, soort: in = scherm in de telefoon, go = actie, klik = klikspel-scherm, rt = route erheen
const APPS=[['berichten','Berichten',K.ic.talk,'#3fe395','in'],['kaart','Kaart',MAPIC,'#3fe395','go'],['klussen','Klussen',null,'#ff7a1a','go'],['vastgoed','Vastgoed',K.ic.key,'#f2c230','go'],
  ['dag','Dagklussen',K.ic.star,'#ff5a4a','in'],['naam','Straatnaam',K.ic.kroon,'#ffd35a','in'],['wijken','Wijken',K.ic.vuist,'#ff5a4a','in'],['doen','Te doen',K.ic.bliksem,'#3ad6ff','in'],['contacten','Contacten',K.ic.hand,'#a9dcff','in'],['taxi','Taxi',K.ic.route,'#f2c230','in'],['auto','Mijn auto',null,'#ff7a1a','go'],
  ['camera','Camera',K.ic.photo,'#b8a1ff','in'],['visboek','Visboek',K.ic.vis,'#3a8ad6','in'],['hond','Hond',K.ic.poot,'#d9a27a','in'],['prestaties','Prestaties',K.ic.star,'#ffd35a','in'],['bank','Bank',null,null,'klik'],['look','Kleding',null,null,'klik'],
  ['shop','Wapens',null,null,'klik'],['fam','Familie',null,null,'klik'],['hits','Opdrachten',null,null,'klik'],['dash','Overzicht',null,null,'klik'],
  ['profiel','Profiel',null,null,'klik'],['rank','Ranglijst',null,null,'klik'],['lid','Lid',null,null,'klik'],['casino','Casino',null,null,'rt'],['cars',"Auto's",null,null,'rt'],
  ['set','Instellingen',SETIC,'#a9dcff','in'],['klik','Klikspel',null,'#ff7a1a','go']];
const DOCK=['berichten','kaart','klussen','vastgoed'];
const secCol=k=>{const g=typeof NAV_GROUPS!=='undefined'&&NAV_GROUPS.find(g=>g[1].includes(k));return g?g[2]:'#ff7a1a'};
/* ---------- opbouw ---------- */
const ov=document.createElement('div');ov.className='sd-ph2';ov.id='sdPh2';ov.hidden=true;document.body.appendChild(ov);
ov.innerHTML=`<div class="sd-ph2-dev"><div class="sd-ph2-bar"><span id="sdP2Clock"></span><i class="sd-notch"></i><span class="sd-ph2-st"><i class="sd-sig"><i></i><i></i><i></i><i></i></i><b id="sdP2Bat"></b></span></div>
 <div class="sd-ph2-scr" id="sdP2Scr"></div><div class="sd-ph2-nav"><button data-back aria-label="Terug">‹</button><button data-home aria-label="Startscherm"><i></i></button><button data-close aria-label="Telefoon wegleggen">×</button></div></div>`;
const scr=$s('sdP2Scr');let app='home',sub=null;
const playerLook=()=>{const L=G.P&&G.P.look||{};let tie=null,chain=null;try{const ol=typeof outfitLook==='function'?outfitLook():null;if(ol&&ol.bovenlijf&&ol.bovenlijf.kind==='suit')tie=ol.bovenlijf.c2||'#7a1f2a';const w=S.fit&&S.fit.wear||{};if(/ketting|goud|chain/.test(w.nek||''))chain=1}catch(e){}
  return {skin:L.skin,hair:L.hair,hs:L.hs,fh:L.fh,eye:L.eye,mouth:L.mouth,top:L.top,hat:L.hat,hatC:L.hatC,tie,chain,bg:'#1d2230'}};
/* ---------- schermen ---------- */
const EXT={};
function badge(k){if(EXT[k])return EXT[k].badge?EXT[k].badge():0;if(k==='berichten')return G.unread?G.unread():0;if(k==='dag'&&G.dag){const D=G.dag.get();return (D.ids||[]).filter(id=>{const d=G.dag.def(id);return d&&(D.p[id]||0)>=d[3]&&!D.claimed[id]}).length}if(k==='vastgoed')return (G.lots||[]).filter(l=>l.building).length;if(k==='naam'&&G.naam)return G.naam.points();if(k==='wijken'&&G.wijk)return G.wijk.open();return 0}
function appBtn(a){if(!a)return '';const [k,n,ic,c,kind]=a;if(kind==='klik'&&!hasPage(k))return '';if(G.storyApps&&!G.storyApps(k))return '';const icon=ic||pic(k==='klussen'?'crimes':k==='auto'?'cars':k==='klik'?'dash':k),col=c||secCol(k),b=badge(k);
  return `<button class="sd-p2-app" data-app="${k}"><i style="--c:${col}">${icon}${b?`<em>${b}</em>`:''}${kind==='klik'?'<u>↗</u>':kind==='rt'?`<u>${K.ic.route}</u>`:''}</i><span>${E(n)}</span></button>`}
function nowCard(){const m=G.mission&&G.mission(),w=G.waypoint;
  if(G.police&&G.police.active())return `<div class="sd-p2-now bad"><small>Nu</small><b>Politie! ${'★'.repeat(G.police.stars())}</b><p>Ga uit het zicht: stegen, hoeken, containers.</p></div>`;
  if(m){const s=m.steps[m.i];return `<div class="sd-p2-now"><small>Missie · ${E(m.c.n)}</small><b>${E(s?s.txt:'')}</b></div>`}
  if(w)return `<button class="sd-p2-now" data-now="wp"><small>Route</small><b>${E(w.n)}</b><p>${Math.round(Math.hypot(w.x-G.P.x,w.z-G.P.z))} m · tik om erheen te lopen</p></button>`;
  if(G.dag){const D=G.dag.get(),n=(D.ids||[]).length,done=(D.ids||[]).filter(id=>(D.p[id]||0)>=G.dag.def(id)[3]).length;if(done<n)return `<button class="sd-p2-now" data-app="dag"><small>Dagklussen · ${done}/${n}</small><b>${E(G.dag.def(D.ids.find(id=>(D.p[id]||0)<G.dag.def(id)[3]))[1])}</b><p>Elke dag om 6 uur drie nieuwe.</p></button>`}
  const C=S.stadCol||{},f=Object.keys(C).length;return `<button class="sd-p2-now" data-app="prestaties"><small>Verzamelen</small><b>${f}/30 pakketjes gevonden</b><p>Kijk in stegen, parken en op de kades.</p></button>`}
function home(){if(G.storyHome){G.storyHome(scr,()=>APPS.filter(a=>!DOCK.includes(a[0])).map(appBtn).join(''));dock();return}const L=G.msgs?G.msgs().filter(m=>m.u).slice(0,2):[];
  scr.innerHTML=`<div class="sd-p2-home"><div class="sd-p2-hero"><canvas id="sdP2Me" width="24" height="24"></canvas><div><b>${E(window.__USER__||'Jij')}</b><small>${E(RANKS[rankIdx(S.xp)][0])} · ${E(M.districtAt(G.P.x,G.P.z))}</small></div>
   <div class="sd-p2-m"><span><i>Contant</i><b>${fmt(S.cash)}</b></span><span><i>Bank</i><b>${fmt(S.bank||0)}</b></span></div></div>
   ${G.weerKaart?G.weerKaart():''}${nowCard()}${L.map(m=>{const c=G.contacts[m.f]||G.contacts.stad;return `<button class="sd-p2-not" data-thread="${m.f}"><canvas data-por="${m.f}" width="24" height="24"></canvas><span><b>${E(c.n)}</b><small>${E(m.x)}</small></span></button>`}).join('')}
   <div class="sd-p2-grid">${APPS.filter(a=>!DOCK.includes(a[0])).map(appBtn).join('')}</div></div>`;
  K.portrait(playerLook(),'blij',$s('sdP2Me'));scr.querySelectorAll('[data-por]').forEach(c=>K.portrait((G.contacts[c.dataset.por]||G.contacts.stad).look,null,c));
  dock()}
function dock(){let d=ov.querySelector('.sd-p2-dock');if(!d){d=document.createElement('div');d.className='sd-p2-dock';ov.querySelector('.sd-ph2-dev').insertBefore(d,ov.querySelector('.sd-ph2-nav'))}d.innerHTML=DOCK.map(k=>appBtn(APPS.find(a=>a[0]===k))).join('');d.hidden=app!=='home'}
function head(t,s){return `<div class="sd-p2-h"><button data-back aria-label="Terug">‹</button><div><b>${E(t)}</b>${s?`<small>${E(s)}</small>`:''}</div></div>`}
const ago=t=>{const s=(Date.now()-t)/1000;return s<60?'nu':s<3600?Math.floor(s/60)+' min':s<86400?Math.floor(s/3600)+' u':Math.floor(s/86400)+' d'};
function berichten(){const L=G.msgs?G.msgs():[];if(sub){const c=G.contacts[sub]||G.contacts.stad,T=L.filter(m=>m.f===sub);T.forEach(m=>m.u=0);try{save()}catch(e){}
    scr.innerHTML=head(c.n)+`<div class="sd-p2-thread">${T.slice().reverse().map(m=>`<div class="sd-p2-b"><p>${E(m.x)}</p>${m.a?`<button data-act='${E(JSON.stringify(m.a))}'>${E(actLabel(m.a))}</button>`:''}<small>${ago(m.t)}</small></div>`).join('')||'<p class="sd-p2-none">Nog geen berichten.</p>'}</div>`;
    const th=scr.querySelector('.sd-p2-thread');th.scrollTop=th.scrollHeight;G.onMsg&&G.onMsg();return}
  const by={};L.forEach(m=>{if(!by[m.f])by[m.f]={m,u:0};if(m.u)by[m.f].u++});
  scr.innerHTML=head('Berichten')+`<div class="sd-p2-list">${Object.keys(by).map(f=>{const c=G.contacts[f]||G.contacts.stad,o=by[f];return `<button class="sd-p2-row" data-thread="${f}"><canvas data-por="${f}" width="24" height="24"></canvas><span><b>${E(c.n)}</b><small>${E(o.m.x)}</small></span><em>${o.u?`<i>${o.u}</i>`:''}${ago(o.m.t)}</em></button>`}).join('')||'<p class="sd-p2-none">Nog geen berichten.</p>'}</div>`;
  scr.querySelectorAll('[data-por]').forEach(c=>K.portrait((G.contacts[c.dataset.por]||G.contacts.stad).look,null,c))}
const actLabel=a=>a.k==='route'||a.k==='pers'?'Route':a.k==='vastgoed'?'Naar de notaris':a.k==='board'?'Klussen':a.k==='dag'?'Dagklussen':a.k==='ach'?'Prestaties':a.k==='naam'?'Talenten':a.k==='wijk'?'Wijken':a.k==='hond'?'Hond':a.k==='app'?'Bekijken':'Open';
function doAct(a){if(a.k==='npc'){const n=G.NPC.find(q=>q.arch===a.a);if(n){close();G.setWaypoint&&G.setWaypoint(n.x,n.z,a.n||'Route')}return}if(a.k==='none')return;if(a.k==='race'){close();G.race&&G.race.route(a.id);return}if(a.k==='route'){close();G.setWaypoint&&G.setWaypoint(a.x,a.z,a.n||'Route')}else if(a.k==='vastgoed'){close();G.vastgoed&&G.vastgoed.open()}else if(a.k==='board'){close();G.openBoard&&G.openBoard()}else if(a.k==='dag')go('dag');else if(a.k==='ach')go('prestaties');else if(a.k==='naam')go('naam');else if(a.k==='wijk')go('wijken');else if(a.k==='hond')go('hond');else if(a.k==='app'&&RENDER[a.a])go(a.a);else if(a.k==='foto'){close();G.foto&&G.foto.open()}else if(a.k==='pers'){close();G.volk&&G.volk.zoek(a.id)}}
function dagScr(){const D=G.dag.get(),r=G.dag.reward();
  scr.innerHTML=head('Dagklussen','Van Het Contact · nieuw om 6 uur')+`<div class="sd-p2-list">${(D.ids||[]).map(id=>{const d=G.dag.def(id),p=Math.min(d[3],D.p[id]||0),ok=p>=d[3],cl=D.claimed[id];
    return `<div class="sd-p2-dag${ok?' ok':''}${cl?' cl':''}"><b>${E(d[1])}</b><i class="sd-p2-pb"><i style="width:${p/d[3]*100}%"></i></i><span>${p}/${d[3]} · ${fmt(r.cash)} + ${r.xp} XP</span>${cl?'<em>Opgehaald</em>':ok?`<button class="btn sm" data-claim="${id}">Ophalen</button>`:''}</div>`}).join('')}
   <p class="sd-p2-note">Alle drie gedaan = bonus${D.streak?' · '+D.streak+' dag'+(D.streak>1?'en':'')+' op rij':''}.</p></div>`}
function contacten(){const C=[['notaris','Langskomen of kopen'],['garage','Breng mijn auto'],['contact','Klussen en dagklussen'],['heler','Waar zit je?'],['taxi','Een taxi bestellen']];
  scr.innerHTML=head('Contacten')+`<div class="sd-p2-list">${C.map(([k,d])=>`<button class="sd-p2-row" data-call="${k}"><canvas data-por="${k}" width="24" height="24"></canvas><span><b>${E(G.contacts[k].n)}</b><small>${E(d)}</small></span><em class="call">${K.ic.talk}</em></button>`).join('')}</div>`;
  scr.querySelectorAll('[data-por]').forEach(c=>K.portrait(G.contacts[c.dataset.por].look,null,c))}
function call(k){G.snd&&G.snd.fx('phoneRing');
  if(k==='notaris'){close();G.vastgoed&&G.vastgoed.open()}else if(k==='garage'){close();G.bringCar&&G.bringCar()}else if(k==='contact'){go('dag')}else if(k==='taxi'){go('taxi')}
  else if(k==='heler'){const h=G.helerContact||G.NPC.find(n=>n.arch==='heler'&&n.contact)||G.NPC.find(n=>n.arch==='heler');if(h){close();G.setWaypoint&&G.setWaypoint(h.x,h.z,'Ome Henk (heler)')}}}
function taxi(){const home=M.places.find(p=>p.dyn==='plot'&&p.home),own=M.places.filter(p=>p.dyn&&p.own&&p.zone!=='brug'&&!p.home),pl=M.places.filter(p=>!p.dyn);
  const row=p=>{const d=Math.hypot(p.door.x-G.P.x,p.door.z-G.P.z),f=G.taxiFare(d);return `<button class="sd-p2-row" data-taxi="${p.id}"><i class="sd-p2-ri">${pic(p.page)}</i><span><b>${E(p.name.replace(/^(Thuis: |Jouw )/,''))}</b><small>${E(M.districtAt(p.door.x,p.door.z))} · ${Math.round(d)} m</small></span><em>${fmt(f)}</em></button>`};
  scr.innerHTML=head('Taxi Centrale','Betalen met contant geld')+`<div class="sd-p2-list">${home?'<h5>Thuis</h5>'+row(home):''}${own.length?'<h5>Jouw bezit</h5>'+own.map(row).join(''):''}<h5>In de stad</h5>${pl.map(row).join('')}</div>`}
let pose=0;const POSES=['blij','neutraal','boos','bang'];
function camera(){scr.innerHTML=head('Camera')+`<div class="sd-p2-cam"><div class="sd-p2-shot"><canvas id="sdP2Cam" width="24" height="24"></canvas><span>${E(M.districtAt(G.P.x,G.P.z).toUpperCase())}</span><small>${new Date().toLocaleDateString('nl-NL')}</small></div>
  <div class="sd-p2-camb"><button class="btn ghost sm" data-pose>Andere pose</button><button class="btn sm" data-snap>Foto opslaan</button></div><button class="sd-p2-now" data-act='{"k":"foto"}'><small>Fotomodus</small><b>Foto van de stad</b><p>HUD weg, filter kiezen, pose erbij.</p></button></div>`;K.portrait(playerLook(),POSES[pose%4],$s('sdP2Cam'))}
function snap(){const c=document.createElement('canvas');c.width=240;c.height=300;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#f4efe4';x.fillRect(0,0,240,300);
  const p=K.portrait(playerLook(),POSES[pose%4]);x.drawImage(p,20,20,200,200);x.fillStyle='#111';x.font='bold 16px monospace';x.fillText(M.districtAt(G.P.x,G.P.z).toUpperCase(),20,248);x.font='12px monospace';x.fillText('PIXELSTAD · '+new Date().toLocaleDateString('nl-NL'),20,272);
  try{const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='pixelstad-selfie.png';document.body.appendChild(a);a.click();a.remove()}catch(e){}G.snd&&G.snd.fx('click');G.ev&&G.ev('selfie')}
function prestaties(){const H=S.stadAch||{},C=S.stadCol||{},f=Object.keys(C).length;
  scr.innerHTML=head('Prestaties',Object.keys(H).length+' van '+G.ACH.length)+`<div class="sd-p2-list"><div class="sd-p2-dag"><b>Pakketjes</b><i class="sd-p2-pb"><i style="width:${f/30*100}%"></i></i><span>${f}/30 · stegen, parken, kades</span></div>
   ${G.ACH.map(a=>{const v=Math.min(a[4],G.achVal(a)),ok=!!H[a[0]];return `<div class="sd-p2-ach${ok?' ok':''}"><i>${K.ic.star}</i><span><b>${E(a[1])}</b><small>${E(a[2])}</small>${ok?'':`<i class="sd-p2-pb"><i style="width:${v/a[4]*100}%"></i></i>`}</span><em>${ok?'✓':v+'/'+a[4]}</em></div>`}).join('')}</div>`}
function settings(){const pix=G.pixPref||0;let skin='',wz='';try{skin=localStorage.getItem('stad_skin')||'';wz=sessionStorage.getItem('stad_weer')||''}catch(e){}const SK=['#f1caa5','#e9b98f','#d9a27a','#b97a52','#8d5a3a','#6e4630'],snd=G.snd||{};
  scr.innerHTML=head('Instellingen')+`<div class="sd-p2-set">
   <div class="sd-row"><b>Geluid</b><div class="sd-seg"><button data-snd="fx" class="${snd.fxOn?'on':''}">Effecten</button><button data-snd="mu" class="${snd.muOn?'on':''}">Muziek</button></div></div>
   <div class="sd-row"><b>Volume</b><input type="range" min="0" max="1" step=".05" value="${snd.vol!=null?snd.vol:.8}" data-vol aria-label="Volume"></div>
   <div class="sd-row"><b>Camera</b><div class="sd-seg">${[['boven','Bovenaf'],['achter','Achter je'],['ogen','Ogen']].map(([v,n])=>`<button data-cam="${v}" class="${(G.camMode||'boven')===v?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="sd-row"><b>Beeld</b><div class="sd-seg">${[[640,'Scherp'],[0,'Normaal'],[340,'Grof']].map(([v,n])=>`<button data-pix="${v}" class="${pix===v?'on':''}">${n}</button>`).join('')}</div></div>
   ${typeof KAR!=='undefined'?`<div class="sd-row"><b>Uiterlijk</b><button class="btn sm" data-kar>Uiterlijk aanpassen</button></div>`:`<div class="sd-row"><b>Huidskleur</b><div class="sd-sk">${SK.map(c=>`<button data-skin="${c}" style="--c:${c}" class="${skin===c?'on':''}" aria-label="Huidskleur"></button>`).join('')}</div></div>`}
   <div class="sd-row"><b>Tijd van de dag</b><div class="sd-seg">${[['','Vanzelf'],['1','Dag'],['0','Nacht']].map(([v,n])=>`<button data-day="${v}" class="${String(G.forceDay==null?'':G.forceDay)===v?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="sd-row"><b>Weer (alleen beeld)</b><div class="sd-seg">${[['','Vanzelf'],['zon','Zon'],['regen','Regen'],['storm','Storm'],['sneeuw','Sneeuw']].map(([v,n])=>`<button data-weer="${v}" class="${wz===v?'on':''}">${n}</button>`).join('')}</div></div>
   <div class="sd-row"><b>Besturing</b><p>${touch?'Stick linksonder om te lopen, ver duwen is rennen. Tik op iemand of op de knop boven zijn hoofd om te praten. Veeg om de camera te draaien, knijp om te zoomen.':'WASD lopen, Shift rennen, E praten, doen en naar binnen, T emotes, F auto, H hond, Z en C draaien, scrollen zoomt, J telefoon, M kaart, Esc terug.'}</p></div></div>`;
  const vr=scr.querySelector('[data-vol]');if(vr)vr.oninput=()=>G.snd&&G.snd.setVol(+vr.value)}
function naamScr(){scr.innerHTML=head('Straatnaam',G.naam?G.naam.title():'')+(G.naam?G.naam.html():'')}
function wijkScr(){scr.innerHTML=head('Wijken','Respect, wijkbazen en beschermgeld')+(G.wijk?G.wijk.html():'<p class="sd-p2-none">Nog niet beschikbaar.</p>')}
function hondScr(){scr.innerHTML=head('Hond')+(G.hond?G.hond.html():'<p class="sd-p2-none">Nog niet beschikbaar.</p>');G.hond&&G.hond.after&&G.hond.after()}
function visScr(){const V=G.vis;if(!V){scr.innerHTML=head('Visboek');return}const D=V.S(),n=Object.keys(D.dex).length;
  scr.innerHTML=head('Visboek',n+' van '+V.VIS.length+' soorten')+`<div class="sd-p2-list">${D.bag.length?`<div class="sd-p2-dag ok"><b>In je emmer: ${D.bag.length}</b><span>${D.bag.map(f=>E(V.def(f.id)[1])+' '+V.kg(f.w)).join(', ')}</span><span>Waarde ${fmt(V.waarde())}</span><button class="btn sm" data-act='{"k":"npc","a":"visboer","n":"Ouwe Jaap (visboer)"}'>Route naar de visboer</button></div>`:''}
   ${V.VIS.map(v=>{const d=D.dex[v[0]];return `<div class="sd-p2-ach${d?' ok':''}" style="--k:${V.VCOL[v[2]]}"><i style="background:${d?V.VCOL[v[2]]:'#22262d'};color:#111">${K.ic.vis}</i><span><b>${d?E(v[1]):'???'}</b><small>${E(V.VZ[v[2]])}${v[4]?' · alleen in het donker':''}${d?' · record '+V.kg(d[1]):''}</small></span><em>${d?d[0]+'×':''}</em></div>`}).join('')}
   <p class="sd-p2-note">Stekken staan op je kaart. Elke worp kost 2 energie.</p></div>`}
function doenScr(){const P=G.P,sp=(G.spots||[]),near=k=>sp.filter(s=>s.k===k).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0],H=S.stadKijk||{};
  const row=(ic,c,n,d,act,x)=>`<button class="sd-p2-row" data-act='${E(JSON.stringify(act))}'><i class="sd-p2-ri" style="color:${c}">${ic}</i><span><b>${E(n)}</b><small>${E(d)}</small></span><em>${x||''}</em></button>`;
  const rt=(s,n)=>s?{k:'route',x:s.x,z:s.z,n}:{k:'none'},m=s=>s?Math.round(Math.hypot(s.x-P.x,s.z-P.z))+' m':'';
  const vs=near('vis'),at=near('atm'),kj=sp.filter(s=>s.k==='kijk'&&!H[s.id]).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];
  let h='<h5>Op straat</h5>'+row(K.ic.vis,'#3a8ad6','Vissen',vs?'Dichtstbijzijnde stek: '+vs.sub:'',rt(vs,'Visstek'),m(vs))+row(K.ic.music,'#ffd35a','Straatoptreden','Met Sjaak op Het Plein',{k:'npc',a:'muzikant',n:'Sjaak (straatmuzikant)'})
   +row(K.ic.dobbel,'#b8a1ff','Dobbelen','Snelle Eddy in de haven',{k:'npc',a:'dobbelaar',n:'Snelle Eddy'})+row(K.ic.eye,'#d6a63e','Uitkijkpunten',Object.keys(H).length+' van 6 gevonden',rt(kj,'Uitkijkpunt'),m(kj))
   +(G.race?G.race.rows(row):'')+(G.wijk&&G.wijk.kooiRow?G.wijk.kooiRow(row):'')
   +'<h5>Handig</h5>'+row(K.ic.bank,'#3ad6ff','Geldautomaat','Storten en opnemen',rt(at,'Geldautomaat'),m(at))+row(K.ic.kop,'#ffad6b','Koffiekar','Espresso bij Luigi op Het Plein',{k:'npc',a:'barista',n:'Koffiekar'})+row(K.ic.kop,'#ffd166','Snackkar','Broodje shoarma op de boulevard',{k:'npc',a:'snack',n:'Snackkar'})
   +row(K.ic.photo,'#b8a1ff','Fotomodus','Maak een foto van de stad',{k:'foto'});
  scr.innerHTML=head('Te doen','Alleen in de Pixelstad')+`<div class="sd-p2-list">${h}<p class="sd-p2-note">Verder: bankjes om op te zitten, bakken om te doorzoeken, katten om te aaien. Druk op T voor emotes.</p></div>`}
const RENDER={home,berichten,dag:dagScr,contacten,taxi,camera,prestaties,set:settings,naam:naamScr,wijken:wijkScr,hond:hondScr,visboek:visScr,doen:doenScr};
function draw(){(RENDER[app]||home)();ov.querySelector('.sd-ph2-dev').classList.toggle('in',app!=='home');dock();hud()}
function go(k,s){app=k;sub=s||null;G.snd&&G.snd.fx('tab');draw();scr.scrollTop=0}
/* ---------- openen en sluiten ---------- */
function open(k){if(G.ui&&G.ui.closeAll)G.ui.closeAll();if(G.kit.dialogOpen())G.kit.closeDialog(true);ov.hidden=false;ov.classList.remove('go');void ov.offsetWidth;ov.classList.add('go');app=k||'home';sub=null;if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.pause();draw();G.snd&&G.snd.fx('open');if(navigator.vibrate&&touch)try{navigator.vibrate(15)}catch(e){}}
function close(){if(ov.hidden)return;ov.hidden=true;G.snd&&G.snd.fx('close');if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
G.phone={open,close,toggle:()=>ov.hidden?open():close(),isOpen:()=>!ov.hidden,
  // een app erbij uit een andere module: {k, n, ic, c, render(scr, head, sub), click(t, close, go), badge()}
  add(o){if(EXT[o.k])return;EXT[o.k]=o;const i=APPS.findIndex(a=>a[0]===(o.after||'contacten'));APPS.splice(i<0?APPS.length:i+1,0,[o.k,o.n,o.ic,o.c,'in']);RENDER[o.k]=()=>o.render(scr,head,sub)}};
function launch(k){const a=APPS.find(x=>x[0]===k);if(!a)return;if(G.storyApps&&!G.storyApps(k))return;const kind=a[4];
  if(kind==='in'){go(k);return}
  if(k==='kaart'){close();G.kaart&&G.kaart.open();return}
  if(k==='klussen'){close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.openBoard&&G.openBoard();return}
  if(k==='vastgoed'){close();G.vastgoed&&G.vastgoed.open();return}
  if(k==='auto'){close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.resume();G.bringCar&&G.bringCar();return}
  if(k==='klik'){try{sessionStorage.setItem('ow_mode','klik')}catch(e){}G.savePos&&G.savePos();location.href='/game';return}
  if(kind==='rt'){const pl=M.placeByPage(k);close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.resume();G.setWaypoint&&G.setWaypoint(pl.door.x,pl.door.z,pl.name,pl.id);return}
  if(kind==='klik'){ov.hidden=true;G.ui&&G.ui.phoneApp&&G.ui.phoneApp(k)}}
ov.addEventListener('click',e=>{const t=e.target;if(t===ov){close();return}
  if(t.closest('[data-close]')){close();return}if(t.closest('[data-home]')){go('home');return}if(t.closest('[data-back]')){if(sub){sub=null;draw()}else if(app!=='home')go('home');else close();return}
  const ap=t.closest('[data-app]');if(ap){launch(ap.dataset.app);return}
  const th=t.closest('[data-thread]');if(th){app='berichten';sub=th.dataset.thread;draw();return}
  if(EXT[app]&&EXT[app].click&&EXT[app].click(t,close,go)){if(!ov.hidden)draw();return}
  if(app==='naam'&&G.naam&&G.naam.click(t)){draw();return}if(app==='wijken'&&G.wijk&&G.wijk.click&&G.wijk.click(t,close)){if(!ov.hidden)draw();return}if(app==='hond'&&G.hond&&G.hond.click&&G.hond.click(t,close)){if(!ov.hidden)draw();return}
  const ac=t.closest('[data-act]');if(ac){try{doAct(JSON.parse(ac.dataset.act))}catch(e){}return}
  const cl=t.closest('[data-claim]');if(cl){G.dag.claim(cl.dataset.claim);draw();return}
  const ca=t.closest('[data-call]');if(ca){call(ca.dataset.call);return}
  const tx=t.closest('[data-taxi]');if(tx){const pl=M.placeById(tx.dataset.taxi);close();G.taxi&&G.taxi(pl);return}
  if(t.closest('[data-pose]')){pose++;camera();G.snd&&G.snd.fx('click');return}if(t.closest('[data-snap]')){snap();return}
  if(t.closest('[data-now="wp"]')){const w=G.waypoint;close();if(w){if(w.pl)G.goPlace(M.placeById(w.pl));else G.goTo(w.x,w.z)}return}
  const b=t.closest('button');if(!b||app!=='set')return;
  if(b.dataset.snd&&G.snd){if(b.dataset.snd==='fx')G.snd.setFx(!G.snd.fxOn);else G.snd.setMu(!G.snd.muOn);settings();return}
  if(b.dataset.cam!=null){G.setCam&&G.setCam(b.dataset.cam);settings();return}
  if(b.dataset.pix!=null){G.setPix(+b.dataset.pix||0);settings();return}
  if(b.dataset.weer!=null){G.weerZet&&G.weerZet(b.dataset.weer);settings();return}
  if(b.dataset.kar!=null&&typeof KAR!=='undefined'){close();KAR.open({manual:1});return}
  if(b.dataset.skin){try{localStorage.setItem('stad_skin',b.dataset.skin)}catch(e){}G.refreshLook&&G.refreshLook();settings();return}
  if(b.dataset.day!=null){G.forceDay=b.dataset.day===''?null:+b.dataset.day;try{localStorage.setItem('stad_day',b.dataset.day)}catch(e){}G.applyLight&&G.applyLight();settings()}});
addEventListener('keydown',e=>{if(ov.hidden)return;const k=e.key.toLowerCase();const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  if(k==='escape'||k==='backspace'){e.preventDefault();e.stopImmediatePropagation();if(sub){sub=null;draw()}else if(app!=='home')go('home');else close();return}
  if(k==='j'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();close()}},true);
/* ---------- klok, batterij, stipje op de telefoonknop ---------- */
function hud(){$s('sdP2Clock').textContent=G.klok?G.klok().txt+' · speldag':new Date().toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});try{$s('sdP2Bat').textContent=Math.round(Math.max(0,Math.min(EN_MAX,S.energy))/EN_MAX*100)+'%'}catch(e){}
  const n=(G.unread?G.unread():0)+badge('dag');const pb=$s('sdPhoneB');if(pb){pb.classList.toggle('dot',n>0);pb.dataset.n=n||''}}
G.onMsg=()=>{hud();if(!ov.hidden&&app==='home')home()};setInterval(()=>{hud();if(!ov.hidden&&(app==='home'||app==='dag'))draw()},2000);
})();
