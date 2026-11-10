// Pixelstad: het nieuws. De Grachtenbode schrijft over wat er in de stad gebeurt, en dat ben vaak jij. Ben je nog onbekend, dan
// staat er 'een onbekende man'; ben je een bekende naam, dan staat je naam in de kop. Met een bivakmuts op weet de krant van niets.
// - Slecht nieuws (overvallen, achtervolgingen, een geramde versperring) maakt je een half uur lang bekender op straat.
// - Goed nieuws (mensen helpen, een mooi stukje van een bevriende journalist) geeft respect in de wijk.
// - Lezen: in de telefoon (Nieuws) of bij een krantenbak op straat. Mensen op straat praten erover.
// Bewaard in S.stadNieuws = [{t, k, h kop, s onderkop, m toon, w wijk}] (de laatste 12) en S.stadNieuwsS = {hot, u ongelezen, r rang, p plek}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,E=K.E;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sv=()=>{try{save()}catch(e){}};
const NW=()=>{try{return Array.isArray(S.stadNieuws)?S.stadNieuws:(S.stadNieuws=[])}catch(e){return []}};
const ST=()=>{try{if(!S.stadNieuwsS||typeof S.stadNieuwsS!=='object')S.stadNieuwsS={};return S.stadNieuwsS}catch(e){return {}}};
const me=()=>String(window.__USER__||'Onbekende');
const masked=()=>!!(G.P&&G.P.look&&G.P.look.hat==='mask');
const faam=()=>G.faam?G.faam():0;
const rang=()=>{try{return RANKS[rankIdx(S.xp)][0]}catch(e){return 'crimineel'}};
const wie=cap=>{const t=masked()?'een gemaskerde man':faam()<30?pick(['een onbekende man','een jonge verdachte','een man in het zwart']):me();return cap?t.charAt(0).toUpperCase()+t.slice(1):t};
const hier=()=>M.districtAt(G.P.x,G.P.z);
// soort → [kop, onderkop, toon]   toon: m = misdaad, g = goed, n = neutraal
const TPL={
  roofreeks:o=>['Reeks straatroven in '+o.w,wie(1)+' slaat opnieuw toe. Bewoners durven de straat niet meer op.','m'],
  oma:o=>['Oma beroofd in '+o.w,'De buurt reageert geschokt. "Wie doet zoiets?"','m'],
  ontsnap:o=>['Verdachte ontkomt in '+o.w,'De politie zocht een uur lang. Zonder resultaat.','m'],
  ontsnap3:o=>['Wilde achtervolging eindigt in het niets',wie(1)+' schudt drie politiewagens af in '+o.w+'.','m'],
  ram:o=>['Auto ramt politieversperring',wie(1)+' rijdt dwars door een fuik in '+o.w+'. Twee wagens total loss.','m'],
  wijk:o=>['Machtswisseling in '+o.w,(o.baas||'De oude baas')+' is de wijk kwijt. De nieuwe baas: '+wie()+'.','m'],
  smeerfail:o=>['Agent weigert steekpenningen','"Ik ben niet te koop", zegt '+(o.agent||'de agent')+'.','m'],
  goud:o=>['Straatrace door de stad','Getuigen zagen een auto met ruim honderdvijftig over de weg razen.','m'],
  kampioen:o=>['Nieuwe kampioen in De Kooi',wie(1)+' verslaat vijf man op één avond.','n'],
  help:o=>['Onbekende helpt ouderen met boodschappen','"Zo\'n nette jongen", zegt een bewoonster van '+o.w+'.','g'],
  held:o=>['Voorbijganger schiet te hulp in '+o.w,'"Je ziet het niet vaak meer", zegt een omstander.','g'],
  optreden:o=>['Straatmuzikant krijgt gezelschap','Publiek op Het Plein danst mee.','g'],
  visz:o=>['Zeldzame vangst in de stad','Een hengelaar haalt een vis boven water die hier bijna nooit zwemt.','g'],
  hond:o=>['Zwerfhond uit het Noorderpark heeft een baas','"Hij loopt overal met hem mee", zeggen buurtbewoners.','g'],
  pers:o=>[me()+': een man met hart voor '+o.w,'Een portret van iemand over wie veel wordt gepraat.','g'],
  pos:o=>[me()+' stijgt naar plek '+o.n,'De ranglijst van de onderwereld is opgeschud.','n'],
  rang:o=>['Wie is '+me()+'?','De '+rang().toLowerCase()+' die in korte tijd naam maakt in de stad.','n']};
const FILL=[['Gemeente plaatst meer lantaarns in de stegen','Bewoners klaagden al jaren over donkere hoeken.'],['Parkeren op de Zuidas weer duurder','"Straks betaal je om stil te staan én om te rijden."'],['Meeuwen plunderen strandtent','Eigenaar overweegt een vogelverschrikker.'],
  ['Huren in het centrum stijgen opnieuw','Studenten wonen inmiddels met zijn vieren op twaalf vierkante meter.'],['Visboer Jaap viert jubileum','Veertig jaar op dezelfde plek aan de boulevard.'],['Fietsendiefstal: weer een record','De politie raadt twee sloten aan. En een derde.'],
  ['Havenbedrijf zoekt nachtwakers','"Er verdwijnt nogal eens een container."'],['Nieuwe koffiekar op Het Plein','Luigi: "Suiker hoort er niet in."'],['Toeristen verdwalen massaal','De gemeente denkt na over meer bordjes.'],['Burgemeester belooft meer blauw op straat','Wijkagenten krijgen een vaste ronde.'],
  ['Casino boekt recordomzet','De bank wint. Zoals altijd.'],['Storm op komst','Strandtenten zetten de stoelen binnen.']];
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const filler=()=>{let h=hashS(new Date().toDateString());const out=[],pool=FILL.slice();while(out.length<3&&pool.length){out.push(pool.splice(h%pool.length,1)[0]);h=Math.imul(h^(h>>>13),2654435761)>>>0}return out};
/* ---------- een bericht erbij ---------- */
const CD={};let lastT=0;
function add(k,o){o=o||{};if(!TPL[k])return false;const now=Date.now();if(!o.force&&(now-lastT<45000||(CD[k]||0)>now))return false;lastT=now;CD[k]=now+(k==='wijk'||k==='kampioen'||k==='pers'?0:8*60000);
  o.w=o.w||hier();const [h,s,m]=TPL[k](o),L=NW(),Q=ST(),named=!masked()&&faam()>=30;L.unshift({t:now,k,h,s,m,w:o.w});if(L.length>12)L.length=12;Q.u=(Q.u||0)+1;
  if(m==='m'&&!masked()){Q.hot=now+30*60000;if(typeof addHeat==='function')addHeat(2)}else if(m==='g')G.rep&&G.rep.add(G.P.x,G.P.z,2);
  if(named||m==='g')G.ev&&G.ev('voorpagina');sv();ticker(h,m);return true}
const heet=()=>(ST().hot||0)>Date.now();
/* ---------- balk onderin ---------- */
const bar=document.createElement('button');bar.className='sd-nws';bar.hidden=true;document.body.appendChild(bar);let barT=0;
function ticker(h,m){bar.innerHTML=`<b>De Grachtenbode</b><span>${E(h)}</span>`;bar.dataset.m=m;bar.hidden=false;bar.classList.remove('go');void bar.offsetWidth;bar.classList.add('go');G.snd&&G.snd.fx('notify');clearTimeout(barT);barT=setTimeout(()=>{bar.hidden=true},6500)}
bar.addEventListener('click',()=>{bar.hidden=true;G.phone&&G.phone.open('nieuws')});
/* ---------- wat levert een kop op ---------- */
const CNT={};
function onEv(name){const w=hier();
  if(name==='roof'){const k=w+new Date().toDateString();CNT[k]=(CNT[k]||0)+1;if(CNT[k]===3||CNT[k]===7)add('roofreeks',{w})}
  else if(name==='roof:oma')add('oma',{w,force:1});
  else if(name==='ontsnap3')add('ontsnap3',{w,force:1});else if(name==='ontsnap'){if(Math.random()<.22)add('ontsnap',{w})}
  else if(name==='ram')add('ram',{w,force:1});
  else if(name==='wijk'){const wk=G.wijk&&G.wijk.at(G.P.x,G.P.z);add('wijk',{w:wk?wk.n:w,baas:wk&&wk.baas,force:1})}
  else if(name==='kampioen')add('kampioen',{force:1});else if(name==='goud')add('goud',{});else if(name==='hond')add('hond',{force:1});else if(name==='visz')add('visz',{});
  else if(name==='oma'){CNT.oma=(CNT.oma||0)+1;if(CNT.oma%3===1)add('help',{w})}
  else if(name==='event'){if(Math.random()<.35)add('held',{w})}else if(name==='optreden'){if(Math.random()<.25)add('optreden',{})}}
/* ---------- telefoon: Nieuws ---------- */
const ago=t=>{const s=(Date.now()-t)/1000;return s<90?'zojuist':s<3600?Math.floor(s/60)+' min geleden':s<86400?Math.floor(s/3600)+' uur geleden':Math.floor(s/86400)+' d geleden'};
function render(scr,head){const L=NW(),Q=ST(),f=faam();Q.u=0;const lead=L[0],d=new Date().toLocaleDateString('nl-NL',{weekday:'long',day:'numeric',month:'long'});
  scr.innerHTML=head('Nieuws','De Grachtenbode')+`<div class="sd-krant"><div class="sd-kr-h"><b>De Grachtenbode</b><small>${E(d)} · sinds 1887</small></div>
   ${lead?`<div class="sd-kr-lead" data-m="${lead.m}"><canvas id="sdKrFace" width="48" height="48"></canvas><div><em>${lead.m==='m'?'Misdaad':lead.m==='g'?'Stad':'Onderwereld'} · ${E(lead.w||'')}</em><b>${E(lead.h)}</b><p>${E(lead.s)}</p><small>${ago(lead.t)}</small></div></div>`:'<p class="sd-p2-none">Nog niets over jou. Dat kan veranderen.</p>'}
   ${L.slice(1,7).map(n=>`<div class="sd-kr-i" data-m="${n.m}"><b>${E(n.h)}</b><p>${E(n.s)}</p><small>${E(n.w||'')} · ${ago(n.t)}</small></div>`).join('')}
   <h5>Verder in de stad</h5>${filler().map(n=>`<div class="sd-kr-i"><b>${E(n[0])}</b><p>${E(n[1])}</p></div>`).join('')}
   <p class="sd-p2-note">${heet()?'Je bent in het nieuws: mensen herkennen je nu sneller. ':''}${f>=30?'De krant kent je naam.':'De krant kent je naam nog niet. Word bekender en ze schrijven hem voluit.'} Met een bivakmuts op blijf je onbekend.</p></div>`;
  const c=scr.querySelector('#sdKrFace');if(c&&lead){const named=f>=30&&lead.m!=='g'||lead.k==='pers'||lead.k==='pos'||lead.k==='rang';const P=G.P&&G.P.look||{};
    if(named&&K.face)K.face({skin:P.skin,hair:P.hair,top:P.top,hat:P.hat==='mask'?'none':P.hat,hatC:P.hatC,bg:'#cfc8b8'},lead.m==='m'?'boos':'blij',c);
    else if(K.face)K.face({skin:'#2a2c30',hair:'#1a1b1e',top:'#1a1b1e',hs:'kort',bg:'#cfc8b8',eye:'#2a2c30',lip:'#2a2c30'},null,c)}sv()}
/* ---------- krantenbakken op straat ---------- */
const BAK=[[224.5,121],[150,152],[279,118],[84,152],[326,152],[150,226]];
function setup(){BAK.forEach(([x,z])=>{const p=M.nearestWalk(x,z,6);if(!p)return;const m=K.model([[.7,1.1,.5,0,.55,0,'#2f5d9a'],[.74,.1,.54,0,1.14,0,'#1f3f6a'],[.5,.5,.04,0,.72,.26,'#f1efe9'],[.4,.06,.05,0,.86,.27,'#111214'],[.4,.04,.05,0,.74,.27,'#8a8f98'],[.4,.04,.05,0,.66,.27,'#8a8f98'],[.12,.3,.12,-.24,.15,-.14,'#1d1d1f'],[.12,.3,.12,.24,.15,-.14,'#1d1d1f']]);
    m.position.set(p.x,0,p.z);G.scene().add(m);const q=M.nearestWalk(p.x,p.z+.9,2)||p;
    G.spot&&G.spot({k:'krant',x:q.x,z:q.z,r:1.8,n:'Krant lezen',sub:'De Grachtenbode',col:'#a9dcff',h:1.9,act:()=>G.phone&&G.phone.open('nieuws'),map:{n:'Krantenbak',ic:K.ic.krant,c:'#a9dcff',pri:0}})})}
/* ---------- mensen praten erover ---------- */
let chT=18;function chat(dt){chT-=dt;if(chT>0)return;chT=20+Math.random()*25;const L=NW();if(!L.length||Date.now()-L[0].t>3600e3)return;const near=G.NPC.filter(n=>n.st==='walk'&&!n.fixed&&Math.hypot(n.x-G.P.x,n.z-G.P.z)<14&&Math.hypot(n.x-G.P.x,n.z-G.P.z)>3);if(!near.length)return;
  const n=pick(near),m=L[0].m,nm=!masked()&&faam()>=30;G.bubble&&G.bubble(n,m==='m'?pick(nm?['Die '+me()+' weer…','Heb je de krant gezien?','Het wordt steeds gekker.']:['Weer een overval, zeg.','Heb je de krant gezien?','Je bent nergens meer veilig.']):pick(['Mooi stukje in de krant.','Er zijn nog goede mensen.','Heb je het gelezen?']))}
G.nieuws={add,heet,list:NW,ticker};
const wait=setInterval(()=>{if(!G.ready||!G.phone||!G.phone.add||!G.ev||!G.spot)return;clearInterval(wait);try{setup()}catch(e){console.error(e)}
  const ev0=G.ev;G.ev=function(name,n){ev0(name,n);try{onEv(name)}catch(e){}};
  G.phone.add({k:'nieuws',n:'Nieuws',ic:K.ic.krant,c:'#a9dcff',render,after:'bekenden',badge:()=>ST().u||0});
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)chat(dt)};
  // rang omhoog of een hogere plek op de ranglijst: dat haalt de krant
  setTimeout(()=>{try{const Q=ST(),ri=rankIdx(S.xp);if(Q.r==null)Q.r=ri;else if(ri>Q.r){Q.r=ri;if(faam()>=20)add('rang',{force:1})}sv()}catch(e){}},6000);
  G.onPos=p=>{try{const Q=ST();if(p&&Q.p&&p<Q.p)add('pos',{n:p,force:1});if(p)Q.p=p;sv()}catch(e){}};if(G.volk&&G.volk.pos)G.onPos(G.volk.pos)},350);
})();
