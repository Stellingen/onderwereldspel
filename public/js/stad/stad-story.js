// Verhaalmodus "De Bezorger" (/verhaal): de kern. Je speelt Luca, los van je klikspel-karakter.
// - Alles van het verhaal staat in S.story (wordt met save() gewoon mee opgeslagen). Het klikspel (S.cash, S.bank, S.xp, S.energy,
//   bezit, stats) wordt hier nooit aangeraakt: geld, meters, vlaggen en spullen van Luca zijn apart.
// - Eigen klok: een speldag duurt 30 echte minuten en stuurt dag en nacht in de verhaalstad (G.klok wordt hier vervangen).
// - Hoofdlijn in stappen: het hoofdstukscript registreert G.story.step(id,{doel,waar,start,tick,klaar,na}) en springt met G.story.goto(id).
// - HUD: verhaalgeld, verhaalklok, de doelregel. Telefoon: app "Verhaal" (voortgang, meters, naar de Stad).
// - Neergeschoten: G.story.ziekenhuis(reden) = 10 minuten stilstand, daarna verder.
// - Geld-poorten: await G.story.poort(bedrag, tekst) = het verhaal gaat pas verder als Luca dat bedrag heeft.
// Koers: positief = zakelijk, negatief = straat (−100 … 100). Overige meters 0 … 100.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,E=K.E,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv=()=>{try{save()}catch(e){}};
const eur=n=>'€'+Math.round(n).toLocaleString('nl-NL');
const DAG_MS=30*60e3;              // één speldag in het verhaal
const ZH_MS=10*60e3;               // ziekenhuis
const MDEF={koers:0,imago:0,dossier:0,hitte:0,fam_elena:50,fam_marco:50,fam_giulia:50,loy_dex:50,loy_rafiq:50};
const MNAAM={koers:'Koers',imago:'Imago',dossier:'Dossier',hitte:'Hitte',fam_elena:'Familie · Elena',fam_marco:'Familie · Marco',fam_giulia:'Familie · Giulia',loy_dex:'Loyaliteit · Dex',loy_rafiq:'Loyaliteit · Rafiq',loy_ray:'Loyaliteit · Ray',loy_nova:'Loyaliteit · Nova'};
const vip=()=>{try{return (typeof tier==='function'&&tier()>=1)||!!window.__ADMIN__}catch(e){return false}};

/* ---------- staat ---------- */
function st(){if(typeof S==='undefined'||!S)return {m:Object.assign({},MDEF),flags:{},inv:{}};
  if(!S.story||typeof S.story!=='object')S.story={};const s=S.story;
  // migratie: ontbrekende velden aanvullen, nooit iets weggooien
  if(!s.v)s.v=1;if(!s.ch)s.ch=1;if(!s.step)s.step='start';if(!s.avond)s.avond=1;if(typeof s.geld!=='number'||!isFinite(s.geld))s.geld=0;
  if(!s.flags||typeof s.flags!=='object')s.flags={};if(!s.inv||typeof s.inv!=='object')s.inv={};if(!s.t0)s.t0=Date.now();
  if(!s.m||typeof s.m!=='object')s.m={};for(const k in MDEF)if(typeof s.m[k]!=='number')s.m[k]=MDEF[k];
  if(typeof s.tm!=='number'||!isFinite(s.tm))s.tm=14*60+20;   // de klok (minuten in de speldag); het verhaal begint 's middags in de les
  if(!s.inst||typeof s.inst!=='object')s.inst={};
  return s}
const ST=G.story={};
ST.st=st;ST.on=()=>true;ST.pagina='verhaal';

/* ---------- geld, meters, vlaggen, spullen ---------- */
function floatTxt(t,c){try{if(G.fx2&&G.fx2.float){G.fx2.float(t,G.P.x,G.P.z,c);return}}catch(e){}seintje(t,c)}
ST.geld=function(d,label){const s=st();if(d==null)return s.geld;d=Math.round(+d||0);if(!d)return s.geld;s.geld=Math.max(0,s.geld+d);
  floatTxt((d>0?'+':'−')+eur(Math.abs(d))+(label?' '+label:''),d>0?'#3fe395':'#ff7a6a');if(d>0&&G.snd)G.snd.fx(Math.abs(d)>=500?'cash':'coin');
  sv();hud();poortCheck();(ST.onGeld||[]).forEach(f=>{try{f(s.geld,d)}catch(e){}});return s.geld};
ST.onGeld=[];
ST.meter=function(n,d){const s=st();if(d==null)return s.m[n]!=null?s.m[n]:(MDEF[n]!=null?MDEF[n]:50);const lo=n==='koers'?-100:0,v0=s.m[n]!=null?s.m[n]:(MDEF[n]!=null?MDEF[n]:50);
  const v=clamp(v0+(+d||0),lo,100);s.m[n]=v;sv();
  if(d){let t;if(n==='koers')t='Koers → '+(d>0?'zakelijk':'straat');else t=(MNAAM[n]||n)+' '+(d>0?'▲':'▼');seintje(t,n==='koers'?(d>0?'#7fd1ff':'#ff9a5a'):(d>0?'#3fe395':'#ff6a5a'))}
  hud();return v};
ST.koers=(n,kant)=>ST.meter('koers',kant==='straat'?-Math.abs(n):Math.abs(n));
ST.flag=function(k,v){const s=st();if(arguments.length<2)return s.flags[k];if(v===undefined||v===null)delete s.flags[k];else s.flags[k]=v;sv();return v};
ST.inv=function(k,d){const s=st();if(d==null)return s.inv[k]||0;s.inv[k]=Math.max(0,(s.inv[k]||0)+d);if(!s.inv[k])delete s.inv[k];sv();return s.inv[k]||0};
ST.avond=function(n){const s=st();if(n==null)return s.avond;s.avond=n;sv();hud();return n};
ST.instelling=(k,v)=>{const s=st();if(v===undefined)return s.inst[k];s.inst[k]=v;sv();return v};
ST.navOn=()=>st().inst.nav!==false;

/* ---------- klok: 30 minuten per speldag ---------- */
let stil=0;    // >0 = klok staat stil (cutscène, ziekenhuis, menu)
const hhmm=m=>{m=((Math.floor(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
ST.klok=function(){const s=st(),h=s.tm/60;return {h:Math.floor(h),m:Math.floor(s.tm%60),uur:h,txt:hhmm(s.tm),avond:s.avond,nacht:h>=21.5||h<6}};
ST.tijd=function(h,m){const s=st();s.tm=clamp((+h||0)*60+(+m||0),0,1439.9);sv();G.applyLight&&G.applyLight();hud()};
ST.klokPauze=function(on){stil=Math.max(0,stil+(on?1:-1));return stil>0};
ST.klokLoopt=()=>stil<=0&&!zhActief()&&!G.paused;
// de rest van de engine leest G.klok(): hier is dat de verhaalklok (zon op 06:20, onder 21:40)
const klok0=G.klok;
G.klok=function(t){const s=st(),h=clamp(s.tm/60,0,23.99),now=Date.now(),start=now-h/24*DAG_MS;return {h,rise:6.3,set:21.7,len:15.4,start,end:start+DAG_MS,txt:hhmm(s.tm),verhaal:1}};
G.uur=h=>{const k=G.klok();return k.start+h/24*DAG_MS};
G.klok0=klok0;
let klT=0,lightT=0;
function klokStep(dt){if(!ST.klokLoopt())return;const s=st();s.tm+=dt*1440/(DAG_MS/1000);
  if(s.tm>=1440){s.tm-=1440;s.dag=(s.dag||0)+1}
  lightT+=dt;if(lightT>1){lightT=0;G.applyLight&&G.applyLight()}
  klT+=dt;if(klT>20){klT=0;sv()}}

/* ---------- Luca ---------- */
// uiterlijk voor het 3D-poppetje (stad-avatar.js) en het portret (K.face). LOOK (G.uiterlijk) gaat voor als die er is.
const LUCA={skin:'#c8956a',hair:'#1a1410',hs:'krul',eye:'#3a2414',mood:'neutraal',mouth:'normaal',fh:'',
  top:{kind:'hoodie',c:'#7d8088',c2:'#9a9da4'},legs:{kind:'jeans',c:'#2c3a4d',c2:'#3a4a60'},shoes:{kind:'sneaker',c:'#e8e4da',c2:'#b8333a'},head:{kind:'none'}};
const JAS={kind:'jacket',c:'#c0261e',c2:'#f1efe9'};
ST.lucaLook=function(){if(G.uiterlijk&&G.uiterlijk.spec){try{const x=G.uiterlijk.spec('luca');if(x)return x}catch(e){}}
  const s=st(),o=JSON.parse(JSON.stringify(LUCA));if(s.flags.jas||s.outfit==='bezorger')o.top=Object.assign({},JAS);return o};
ST.lucaFace=function(){if(G.uiterlijk&&G.uiterlijk.face){try{const x=G.uiterlijk.face('luca');if(x)return x}catch(e){}}
  const s=st();return {skin:'#c8956a',hair:'#1a1410',hs:'krul',eye:'#3a2414',top:s.flags.jas?'#c0261e':'#7d8088',col:s.flags.jas?'leer':'hoodie',age:0,fw:18,jaw:'rond'}};
ST.jas=on=>{ST.flag('jas',on?1:null);G.avatarSync&&G.avatarSync()};
G.avatarSpec=()=>ST.lucaLook();

/* ---------- hoofdlijn: stappen ---------- */
const STEPS={};let cur=null,curId=null,arrived=false,doneOnce=false;
ST.step=function(id,def){STEPS[id]=def||{};if(id===st().step&&!curId&&G.ready)setTimeout(resume,50);return ST};
ST.steps=STEPS;
ST.huidig=()=>curId;
ST.goto=function(id,o){o=o||{};resumed=true;const s=st();if(cur&&cur.stop)try{cur.stop()}catch(e){console.error(e)}
  s.step=id;sv();curId=id;cur=STEPS[id]||null;arrived=false;doneOnce=false;
  if(!cur){ST.doel(null);return}
  const w=typeof cur.waar==='function'?null:cur.waar;ST.doel(cur.doel||null,w||null);
  if(cur.start)try{const r=cur.start(o);if(r&&r.catch)r.catch(e=>console.error(e))}catch(e){console.error(e)}
  (ST.onStep||[]).forEach(f=>{try{f(id,cur)}catch(e){}})};
ST.onStep=[];
ST.klaar=function(){if(!cur||doneOnce)return;doneOnce=true;const n=cur.na;if(typeof n==='string')ST.goto(n);else if(typeof n==='function')try{n()}catch(e){console.error(e)}};
function stepTick(dt){if(!cur||G.paused)return;if(G.cut&&G.cut.active&&G.cut.active())return;
  if(cur.tick)try{cur.tick(dt)}catch(e){console.error(e)}
  if(!cur)return;
  const w=typeof cur.waar==='function'?cur.waar():cur.waar;
  if(w&&!arrived){const inside=G.binnen&&G.binnen.waar&&G.binnen.waar();const ok=(w.binnen?inside===w.binnen:!inside)&&(w.x==null||Math.hypot(G.P.x-w.x,G.P.z-w.z)<(w.r||3));
    if(ok){arrived=true;if(cur.aankomst){try{cur.aankomst()}catch(e){console.error(e)}}else if(!cur.klaar)ST.klaar()}}
  if(cur&&cur.klaar&&!doneOnce){let k=false;try{k=cur.klaar()}catch(e){}if(k)ST.klaar()}}
let resumed=false;
function resume(){if(resumed)return;const s=st();if(!STEPS[s.step])return;resumed=true;ST.goto(s.step,{hervat:true})}

/* ---------- doelregel en route ---------- */
let doelTxt=null,doelPos=null;
ST.doel=function(text,pos){doelTxt=text||null;doelPos=pos&&pos.x!=null?pos:null;
  if(doelPos&&ST.navOn()&&!pos.binnen){try{G.setWaypoint&&G.setWaypoint(doelPos.x,doelPos.z,text||'Doel')}catch(e){}}
  else if(!doelPos){try{G.clearWaypoint?G.clearWaypoint():(G.waypoint=null)}catch(e){}}
  try{G.kaart&&G.kaart.highlight&&G.kaart.highlight(doelPos)}catch(e){}
  hud();if(text){const d=$s('svDoel');if(d){d.classList.remove('nieuw');void d.offsetWidth;d.classList.add('nieuw')}}};
ST.doelTekst=()=>doelTxt;ST.doelPlek=()=>doelPos;

/* ---------- geld-poorten ---------- */
const POORT=[];
ST.poort=function(bedrag,tekst,o){o=o||{};return new Promise(res=>{const p={bedrag:+bedrag||0,tekst:tekst||'',o,res};POORT.push(p);
  if(!poortCheck()){const s=st();seintje('Nodig: '+eur(p.bedrag)+(tekst?' · '+tekst:''),'#ffd35a');if(!o.stil)ST.doel((tekst?tekst+': ':'')+'je hebt '+eur(p.bedrag)+' nodig (nog '+eur(p.bedrag-s.geld)+')',doelPos)}})};
function poortCheck(){const s=st();let any=false;for(let i=POORT.length-1;i>=0;i--){const p=POORT[i];if(s.geld>=p.bedrag){POORT.splice(i,1);any=true;
    if(p.o.betaal){s.geld-=p.bedrag;floatTxt('−'+eur(p.bedrag)+(p.tekst?' '+p.tekst:''),'#ffd35a');sv()}
    seintje((p.tekst||'Bedrag')+' · '+eur(p.bedrag)+' ✓','#3fe395');G.snd&&G.snd.fx('ok');try{p.res(true)}catch(e){}}}
  if(!POORT.length&&any&&doelTxt&&/nodig \(nog/.test(doelTxt))ST.doel(cur&&cur.doel||null,doelPos);
  else if(POORT.length){const p=POORT[0];if(!p.o.stil&&doelTxt&&/nodig \(nog/.test(doelTxt))doelTxt=(p.tekst?p.tekst+': ':'')+'je hebt '+eur(p.bedrag)+' nodig (nog '+eur(p.bedrag-s.geld)+')'}
  return any}
ST.poorten=()=>POORT.map(p=>({bedrag:p.bedrag,tekst:p.tekst}));

/* ---------- modus ---------- */
// Op /verhaal is het altijd het verhaal. 'stad' = terug naar de Pixelstad (alleen leden), anders een nette melding.
ST.modus=function(m){if(m==null)return 'verhaal';if(m==='verhaal')return 'verhaal';
  if(m==='stad'){if(!vip()){lockCard();return 'verhaal'}bewaar();try{sessionStorage.setItem('ow_mode','stad')}catch(e){}location.href='/stad';return 'stad'}
  if(m==='klik'){bewaar();try{sessionStorage.setItem('ow_mode','klik')}catch(e){}location.href='/game';return 'klik'}};
ST.vip=vip;
function lockCard(){kaart(`<small>Pixelstad</small><b>Stad is voor VIP en High roller</b><p>In de Stad loop, rijd en kraak je met je eigen karakter en dezelfde voortgang als het klikspel. Het verhaal (Seizoen 1) blijft gratis.</p>
  <div class="sv-k-b"><a class="btn" href="/lidmaatschap#pixelstad">Bekijk lidmaatschap</a><button class="btn ghost" data-x>Verder met het verhaal</button></div>`)}
function kaart(html,o){o=o||{};const ov=document.createElement('div');ov.className='sv-ov';ov.innerHTML=`<div class="sv-k">${html}</div>`;document.body.appendChild(ov);G.pause();
  const close=()=>{ov.remove();removeEventListener('keydown',key,true);if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume();o.onClose&&o.onClose()};
  const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}};addEventListener('keydown',key,true);
  ov.addEventListener('click',e=>{if(e.target===ov||e.target.closest('[data-x]'))close()});return {ov,close}}
ST.kaart=kaart;

/* ---------- ziekenhuis: 10 minuten stilstand ---------- */
const zhActief=()=>{const z=st().zh;return !!(z&&z.tot>Date.now())};
ST.inZiekenhuis=zhActief;
ST.onZiekenhuis=[];ST.naZiekenhuis=[];
let zhEl=null,zhT=0;
ST.ziekenhuis=async function(reden){const s=st();s.zh={tot:Date.now()+ZH_MS,reden:reden||'',t:Date.now()};s.zhN=(s.zhN||0)+1;sv();
  if(G.draag&&G.draag.leeg)G.draag.leeg();
  for(const f of ST.onZiekenhuis){try{await f(reden)}catch(e){console.error(e)}}
  zhShow()};
function zhShow(){if(zhEl)return;const s=st();if(G.binnen&&G.binnen.waar&&G.binnen.waar())try{G.binnen.uit(true)}catch(e){}
  zhEl=document.createElement('div');zhEl.className='sv-zh';
  zhEl.innerHTML=`<div class="sv-zh-in"><canvas width="48" height="48" id="svZhPor"></canvas><small>Ziekenhuis West · afdeling chirurgie</small><b>Luca ligt in het ziekenhuis</b>
   <p>${E(s.zh.reden?s.zh.reden+'. ':'')}Je moeder werkt hier. Ze zegt niets, maar ze blijft de hele nacht naast je bed zitten.</p>
   <div class="sv-zh-t" id="svZhT">10:00</div><i class="sv-zh-bar"><i id="svZhBar"></i></i><p class="sv-zh-s">Het verhaal staat even stil. Je kunt zo lang iets anders doen.</p>
   <div class="sv-k-b">${vip()?'<button class="btn ghost" data-m="stad">Naar de Stad</button>':''}<button class="btn ghost" data-m="klik">Naar het klikspel</button></div></div>`;
  document.body.appendChild(zhEl);document.body.classList.add('sv-inzh');
  try{const a=G.cut&&G.cut.actors&&G.cut.actors.elena;K.face(a?a.face:{skin:'#d9a27a',hair:'#3a2418',hs:'knot',v:1,col:'uniform',top:'#7fb8c9',age:1},'neutraal',$s('svZhPor'))}catch(e){}
  zhEl.addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(b)ST.modus(b.dataset.m)});
  G.frozen=1e9;clearInterval(zhT);zhT=setInterval(zhTick,500);zhTick()}
function zhTick(){const s=st();if(!s.zh){zhEnd();return}const left=s.zh.tot-Date.now();if(left<=0){zhEnd();return}
  const m=Math.floor(left/60000),sec=Math.floor(left/1000)%60;const t=$s('svZhT');if(t)t.textContent=m+':'+String(sec).padStart(2,'0');const b=$s('svZhBar');if(b)b.style.width=(100-left/ZH_MS*100).toFixed(1)+'%'}
function zhEnd(){clearInterval(zhT);const s=st(),was=s.zh;s.zh=null;sv();if(zhEl){zhEl.remove();zhEl=null}document.body.classList.remove('sv-inzh');G.frozen=0;
  const p=(M.A&&(M.A.ziekenhuis||M.A.thuis))||null;if(p)G.teleport(p.x,p.z);
  seintje('Je bent ontslagen uit het ziekenhuis','#a9dcff');
  ST.naZiekenhuis.forEach(f=>{try{f(was&&was.reden)}catch(e){console.error(e)}});if(cur&&cur.ziekenhuis)try{cur.ziekenhuis(was&&was.reden)}catch(e){}}

/* ---------- seintjes ---------- */
let sq=[],sqT=0;
function seintje(t,c){const box=$s('svSein');if(!box)return;const el=document.createElement('div');el.className='sv-sein';el.style.setProperty('--c',c||'#ffd35a');el.textContent=t;box.appendChild(el);
  setTimeout(()=>el.classList.add('weg'),2600);setTimeout(()=>el.remove(),3200);while(box.children.length>4)box.firstChild.remove()}
ST.seintje=seintje;

/* ---------- HUD ---------- */
const hudEl=document.createElement('div');hudEl.id='svHud';
hudEl.innerHTML=`<div class="sv-card"><canvas id="svPor" width="48" height="48"></canvas><div class="sv-id"><b>Luca</b><span id="svBij">Pizzajongen</span></div>
  <div class="sv-geld"><small>Geld</small><b id="svGeld">€0</b></div><div class="sv-tijd"><b id="svKlok">14:20</b><small id="svAvond">Avond 1</small></div></div>`;
const doelEl=document.createElement('div');doelEl.className='sv-doel';doelEl.id='svDoel';doelEl.hidden=true;doelEl.innerHTML='<i></i><span id="svDoelT"></span><em id="svDoelM"></em>';
const seinEl=document.createElement('div');seinEl.id='svSein';
function mountHud(){const top=document.querySelector('#stadUi .sd-top');if(!top||$s('svHud'))return !!top;top.insertBefore(hudEl,top.firstChild);document.body.appendChild(doelEl);document.body.appendChild(seinEl);return true}
const BIJ=['Pizzajongen','Kleine Luca','Bezorger','De Bezorger','De Napolitaan'];
let porKey='';
function hud(){if(!$s('svHud'))return;const s=st(),k=ST.klok();$s('svGeld').textContent=eur(s.geld);$s('svKlok').textContent=k.txt;$s('svAvond').textContent=(s.ch>1?'H'+s.ch+' · ':'')+'Avond '+s.avond+(k.nacht?' · nacht':'');
  $s('svBij').textContent=BIJ[Math.min(BIJ.length-1,Math.max(0,(s.ch||1)-1))];
  const L=ST.lucaFace(),pk=JSON.stringify(L);if(pk!==porKey){porKey=pk;try{K.face(Object.assign({bg:'#1a1d23'},L),'neutraal',$s('svPor'))}catch(e){}}
  const d=$s('svDoel');if(d){const on=!!doelTxt&&!(G.cut&&G.cut.active&&G.cut.active());d.hidden=!on;if(on){$s('svDoelT').textContent=doelTxt;
    let m='';if(doelPos&&!doelPos.binnen&&!(G.binnen&&G.binnen.waar&&G.binnen.waar())){const dd=Math.hypot(doelPos.x-G.P.x,doelPos.z-G.P.z);m=dd<4?'hier':Math.round(dd)+' m'}$s('svDoelM').textContent=m}}
  // klok en batterij van de telefoon
  try{const c=$s('sdP2Clock');if(c)c.textContent=k.txt}catch(e){}}
ST.hud=hud;

/* ---------- telefoon: app Verhaal en een eigen startscherm ---------- */
const IC_V='<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="2" width="12" height="12" fill="currentColor"/><rect x="4" y="4" width="8" height="2" fill="#0008"/><rect x="4" y="7" width="8" height="1" fill="#0006"/><rect x="4" y="9" width="6" height="1" fill="#0006"/><rect x="4" y="11" width="7" height="1" fill="#0006"/></svg>';
// in het verhaal geen klikspel-apps (die gaan over je eigen karakter en je klikspelgeld)
const HIDE_APPS=['klussen','vastgoed','dag','naam','wijken','doen','contacten','taxi','auto','visboek','hond','prestaties','bank','look','shop','fam','hits','dash','profiel','rank','lid','casino','cars','berichten','camera','nieuws'];
G.storyApps=k=>!HIDE_APPS.includes(k);
const MROW=[['koers','Koers'],['imago','Imago'],['hitte','Hitte'],['dossier','Dossier'],['fam_elena','Elena'],['fam_marco','Marco'],['fam_giulia','Giulia'],['loy_dex','Dex'],['loy_rafiq','Rafiq']];
function meterHtml(){const s=st();return MROW.filter(([k])=>k!=='dossier'||s.ch>=3||s.m.dossier>0).map(([k,n])=>{const v=s.m[k];
  if(k==='koers'){const p=(v+100)/2;return `<div class="sv-mr koers"><span>${n}</span><i class="sv-kb"><i style="left:${p}%"></i></i><em>${v>8?'zakelijk':v<-8?'straat':'midden'}</em></div>`}
  return `<div class="sv-mr"><span>${n}</span><i class="sv-mb"><i style="width:${v}%"></i></i><em>${Math.round(v)}</em></div>`}).join('')}
function appRender(scr,head){const s=st(),k=ST.klok(),done=Object.keys(s.flags).length;
  scr.innerHTML=head('Verhaal','De Bezorger · Seizoen '+(s.ch||1))+`<div class="sv-app">
   <div class="sv-app-hero"><canvas id="svAppPor" width="48" height="48"></canvas><div><b>Hoofdstuk ${s.ch} · ${({1:'Dozen',2:'Twee bazen',3:'De hoek',4:'Ploeg'})[s.ch]||''}</b><small>Avond ${s.avond} · ${k.txt}</small><small>${eur(s.geld)} · verhaalgeld</small></div></div>
   ${doelTxt?`<div class="sv-app-doel"><small>Nu</small><b>${E(doelTxt)}</b>${doelPos&&!doelPos.binnen?'<button class="btn sm" data-sv="route">Route</button>':''}</div>`:''}
   ${ST.inZiekenhuis()?'<div class="sv-app-doel bad"><small>Ziekenhuis</small><b>Het verhaal staat even stil</b></div>':''}
   <h5>Zo sta je ervoor</h5>${meterHtml()}
   <h5>Spelen</h5><div class="sv-app-b">${vip()?'<button class="btn ghost sm" data-sv="stad">Naar de Stad</button>':'<button class="btn ghost sm" data-sv="lock">Stad · alleen leden</button>'}<button class="btn ghost sm" data-sv="klik">Klikspel</button></div>
   <p class="sv-app-n">Het verhaal staat los van het klikspel: Luca heeft zijn eigen geld en spullen. Een speldag duurt hier 30 minuten.</p></div>`;
  try{K.face(Object.assign({bg:'#1d2230'},ST.lucaFace()),'neutraal',$s('svAppPor'))}catch(e){}}
function appClick(t,close){const b=t.closest('[data-sv]');if(!b)return false;const a=b.dataset.sv;
  if(a==='route'&&doelPos){close();G.setWaypoint&&G.setWaypoint(doelPos.x,doelPos.z,doelTxt||'Doel');return true}
  if(a==='stad'){ST.modus('stad');return true}if(a==='lock'){close();lockCard();return true}if(a==='klik'){ST.modus('klik');return true}return false}
// startscherm van de telefoon in het verhaal (stad-phone.js roept G.storyHome aan)
G.storyHome=function(scr,appBtn){const s=st(),k=ST.klok();
  scr.innerHTML=`<div class="sd-p2-home"><div class="sd-p2-hero"><canvas id="sdP2Me" width="48" height="48"></canvas><div><b>Luca</b><small>Avond ${s.avond} · ${E(M.districtAt(G.P.x,G.P.z))}</small></div>
   <div class="sd-p2-m"><span><i>Verhaalgeld</i><b>${eur(s.geld)}</b></span><span><i>Tijd</i><b>${k.txt}</b></span></div></div>
   ${doelTxt?`<button class="sd-p2-now" data-app="verhaal"><small>Verhaal · nu</small><b>${E(doelTxt)}</b><p>Tik voor je voortgang en meters.</p></button>`:'<button class="sd-p2-now" data-app="verhaal"><small>Verhaal</small><b>De Bezorger</b><p>Voortgang en meters.</p></button>'}
   <div class="sd-p2-grid">${appBtn()}</div></div>`;
  try{K.face(Object.assign({bg:'#1d2230'},ST.lucaFace()),'blij',$s('sdP2Me'))}catch(e){}};

/* ---------- plek bewaren en hervatten ---------- */
function bewaar(){const s=st();if(!(G.binnen&&G.binnen.waar&&G.binnen.waar())&&!(G.cut&&G.cut.active&&G.cut.active())&&G.P&&M.canStand(G.P.x,G.P.z,.3))s.pos={x:+G.P.x.toFixed(1),z:+G.P.z.toFixed(1),ry:+(G.P.ry||0).toFixed(2)};sv()}
ST.bewaar=bewaar;
function startPlek(){const s=st();if(s.pos&&M.canStand(s.pos.x,s.pos.z,.3))return s.pos;const A=M.A||{};return A.thuis||A.school||A.sahara||M.spawn}

/* ---------- klikspel-dingen uit de verhaalstad houden ---------- */
// (op /verhaal worden de Stad-modules niet geladen; dit vangt de gedeelde engine af)
function guards(){
  // ingangen van klikspelschermen: in het verhaal niet (de deuren van het verhaal zijn G.binnen-plekken)
  const e0=G.onEnter;G.onEnter=function(pl){if(pl&&pl.binnen&&G.binnen&&G.binnen.def&&G.binnen.def(pl.binnen)){G.binnen.in(pl.binnen);return}if(pl&&pl.story&&e0)return e0(pl);if(pl&&pl.verhaal&&pl.act){pl.act();return}};
  const n0=G.onNear;G.onNear=function(p){if(p&&(p.story||p.verhaal||p.binnen))return n0&&n0(p);n0&&n0(null)};
  if(G.marks)G.marks.forEach(m=>{if(m.p&&(m.p.story||m.p.verhaal||m.p.binnen))return;[m.ring,m.pin,m.sign].forEach(o=>{if(o)o.visible=false});m.p._hid=1});
  // je klikspel-auto staat niet in de verhaalstad
  try{(G.vehicles||[]).slice().forEach(v=>{if(v.own&&!v.fiets&&G.removeVehicle)G.removeVehicle(v)})}catch(e){}
  G.bringCar=()=>{G.toast&&G.toast('Luca heeft geen auto. Nog niet.','info')};
  // auto's stelen of instappen: alleen voertuigen van het verhaal (fiets) of als het verhaal het toestaat
  const cl0=G.carLock;G.carLock=()=>{if(cl0&&cl0())return true;const n=G.nearCar;if(!G.driving&&n&&!(n.fiets||n.bike||n.kind==='fiets'||n.story||ST.flag('auto')))return true;return false};
  // politie: alleen als het verhaal er zelf om vraagt ({story:1})
  if(G.police){const s0=G.police.start,r0=G.police.report;G.police.start=o=>{if(o&&o.story)return s0(o)};G.police.report=(x,z,o)=>{if(o&&o.story)return r0(x,z,o)}}
  // dagklussen, prestaties en straatnaam van het klikspel tellen hier niet
  G.ev=()=>{};
  // klikspel-bajes en andere schermen van het klikspel niet openen
  G.openBoard=()=>{};}
// marks die later nog bijkomen (de engine maakt ze bij het opstarten) elke paar seconden verbergen
setInterval(()=>{if(G.marks)G.marks.forEach(m=>{if(m.p&&!m.p.story&&!m.p.verhaal&&!m.p.binnen&&!m.p._hid){[m.ring,m.pin,m.sign].forEach(o=>{if(o)o.visible=false});m.p._hid=1}})},3000);

/* ---------- welkom (de eerste keer) ---------- */
function welkom(){const s=st();if(s.welkom)return;s.welkom=Date.now();sv();
  kaart(`<small>Verhaal · Seizoen 1 · gratis</small><b>De Bezorger</b><p>Luca is 16, bezorgt pizza's op de fiets en droomt in de les van actiefilms. Jij speelt Luca: met zijn eigen geld, zijn eigen spullen en zijn eigen klok. Je klikspel-karakter merkt er niets van.</p>
   <ul class="sv-k-l"><li><b>${touch?'Stick':'WASD'}</b><span>lopen${touch?'':', E doen, J telefoon, M kaart'}</span></li><li><b>Doel</b><span>staat bovenin, de route op de kaart</span></li><li><b>Hervatten</b><span>altijd via je telefoon of bij Lounge Sahara aan de Boulevard</span></li></ul>
   <div class="sv-k-b"><button class="btn" data-x>Begin</button></div>`)}

/* ---------- opstarten ---------- */
function frame(dt){klokStep(dt);stepTick(dt);hudT+=dt;if(hudT>.25){hudT=0;hud()}}
let hudT=0;
const wait=setInterval(()=>{if(!G.ready||!$s('stadUi'))return;clearInterval(wait);document.body.classList.add('verhaal');st();mountHud();
  try{guards()}catch(e){console.error(e)}
  if(G.phone&&G.phone.add)G.phone.add({k:'verhaal',n:'Verhaal',ic:IC_V,c:'#ff4fd8',story:1,after:'kaart',render:appRender,click:appClick,badge:()=>0});
  const p=startPlek();if(p&&!st().binnen)G.teleport(p.x,p.z);
  G.avatarSync&&G.avatarSync();G.applyLight&&G.applyLight();hud();
  const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);if(!G.paused||zhActief())frame(dt)};
  setInterval(bewaar,5000);addEventListener('pagehide',bewaar);
  if(zhActief())zhShow();else if(st().zh)zhEnd();
  setTimeout(()=>{resume();if(!resumed)setTimeout(resume,1500);setTimeout(resume,4000);welkom()},600)},150);
})();
