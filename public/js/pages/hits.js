// Tab: Huurmoorden — contracten vanaf Huurmoordenaar, in drie niveaus: Straat, Professioneel en Elite.
// Per contract kies je een methode, elk met een eigen spel:
// - Mes: sluip van dichtbij naar je doelwit. Kijkt hij om, sta dan stil (liefst in een donkere portiek). Dichtbij: toeslaan op de ring.
// - Pistool: korte afstand op straat. Grote doelen, snelle mensen en meer kogels; na je eerste schot rent iedereen.
// - Geweer: door een scherpschuttersvizier vanaf een dak. Houd je adem in en richt tegen de wind in (streepjes in het vizier).
// - Ongeluk: een lading van een bouwkraan die net verkeerd valt. Geen wapen, wel timing (vanaf Capo).
// Elke geslaagde klus geeft reputatie als huurmoordenaar (S.hm.rep). Reputatie én rang openen Professioneel en Elite.
// Na een klus kun je gezocht worden: S.wanted={lv,until,t,sec}. Dan komen er controles (actions.js, main.js) en vanaf niveau 2
// premiejagers. Het zakt met de tijd, drie keer zo snel als je ondergedoken bent. Ontsnapt uit de bajes = S.wanted=true (geen timer).
// Verversen tijdens een contract telt als mislukt (resumePending in state.js).
const HIT_RANK=GAME_CONST.hitR,HIT_GUN=4; // HIT_GUN: Scherpschuttersgeweer of beter
const HIT_TIERS=[
 {id:'straat',n:'Straat',r:7,rep:0,col:'var(--acc)',d:'Verklikkers, koeriers en wanbetalers. Weinig bescherming, wel veel ogen op straat.'},
 {id:'pro',n:'Professioneel',r:8,rep:2,col:'var(--red)',d:'Mensen met geld, macht of een advocaat. Ze verwachten iemand zoals jij.'},
 {id:'elite',n:'Elite',r:9,rep:4,col:'var(--violet)',d:'Overlopers, bankiers en peetvaders. Eén fout en heel Nederland kent je gezicht.'}];
// m = toegestane methodes, pref = wens van de klant (+20% beloning)
const HITS=[
 {id:'verklikker',tier:'straat',d:1,r:7,n:'De verklikker',t:'Ronnie "Het Lek" de Wit',w:'Parkeerplaats achter een snackbar in Osdorp',desc:'Hij praat al maanden met de recherche. Vanavond haalt hij zijn laatste patatje.',pay:[20000,36000],xp:320,cr:14,en:34,cd:8,m:['mes','pistool','geweer']},
 {id:'koerier',tier:'straat',d:1,r:7,n:'De koerier',t:'Dennis "Snelle" Bakker',w:'Busstation Zuidplein in Rotterdam',desc:'Hij reed weg met twee kilo van de familie en verkoopt het nu zelf. Hij kijkt vaak over zijn schouder.',pay:[24000,42000],xp:360,cr:15,en:35,cd:9,m:['mes','pistool'],pref:'mes',prefWhy:'De familie wil dat hij het ziet aankomen.'},
 {id:'schuld',tier:'straat',d:2,r:7,n:'De wanbetaler',t:'Gerrit Kramer',w:'Station Sloterdijk, perron 3',desc:'Een half miljoen schuld en een treinkaartje naar Brussel. Die trein haalt hij niet.',pay:[32000,56000],xp:450,cr:18,en:37,cd:10,m:['mes','pistool','geweer']},
 {id:'rivaal',tier:'pro',d:3,r:8,n:'De rivaal',t:'Sal "Het Mes" Moretti',w:'Terras aan de Amstel',desc:'Capo van de concurrent. Elke dinsdag op hetzelfde terras, nooit zonder publiek.',pay:[55000,95000],xp:640,cr:24,en:41,cd:12,m:['pistool','geweer','mes']},
 {id:'boekhouder',tier:'pro',d:3,r:8,n:'De boekhouder',t:'Herman Visser',w:'Bouwplaats aan de Zuidas',desc:'Hij kent elk getal van de familie en heeft volgende week een afspraak met de FIOD. Het moet op een ongeluk lijken.',pay:[60000,105000],xp:680,cr:25,en:42,cd:12,m:['ongeluk','geweer'],pref:'ongeluk',prefWhy:'Een ongeluk: geen vragen, geen onderzoek.'},
 {id:'wethouder',tier:'pro',d:4,r:9,n:'De vastgoedbaron',t:'Frits "De Huisbaas" Mulder',w:'Bordes van zijn kantoorpand aan de Herengracht',desc:'De familie waste geld via zijn panden en nu weigert hij af te rekenen. Achter elke auto staat een camera.',pay:[95000,170000],xp:900,cr:32,en:45,cd:15,m:['geweer','ongeluk']},
 {id:'getuige',tier:'elite',d:5,r:10,n:'De overloper',t:'Vincent "De Vos" Hoekstra',w:'Boulevard in Scheveningen',desc:'Hij liep over naar de concurrent en nam de halve klantenlijst mee. Eén wandeling per dag, altijd tussen mensen.',pay:[170000,310000],xp:1300,cr:42,en:50,cd:18,m:['geweer','ongeluk']},
 {id:'bankier',tier:'elite',d:5,r:10,n:'De bankier',t:'Maurits van Lier',w:'Jachthaven van Muiden',desc:'Hij wast geld voor drie families tegelijk en wil met allemaal afrekenen. De andere twee moeten het in de krant lezen.',pay:[190000,340000],xp:1400,cr:44,en:51,cd:18,m:['mes','geweer','ongeluk'],pref:'mes',prefWhy:'Een boodschap voor de andere families.'},
 {id:'peetvader',tier:'elite',d:6,r:11,n:'De oude peetvader',t:'Don Aurelio Basile',w:'Kerkplein na de zondagsmis',desc:'De laatste die nog boven jou staat. Lijfwachten, kerkgangers en maar één kans.',pay:[300000,550000],xp:1900,cr:56,en:56,cd:22,m:['geweer','mes','pistool']}];
rkRemap(HIT_TIERS);rkRemap(HITS); // rangen naar de nieuwe indeling (20 rangen)
const HIT_COLS=['#5b6b7c','#3f5a46','#6b5a44','#4a4f6b','#6b4a5a','#556070'];
const hitWeapon=()=>{const g=gearBest('wapen');return g?(g.cls!=null?g.cls:GEAR.filter(x=>x.cat==='wapen').indexOf(g)):-1}; // cls: wapenklasse (data.js)
// methodes: pay/cr = factor op beloning en cred, want = basiskans om gezocht te worden, feud = factor op de kans op wraak
const HIT_M={
 mes:{n:'Mes',k:'Van dichtbij',d:'Sluip naar hem toe zonder dat hij je ziet en sla toe op het juiste moment.',pay:.9,cr:1.3,want:.42,feud:1.2,need:()=>hitWeapon()>=0,why:'Eerst een mes of ander wapen'},
 pistool:{n:'Pistool',k:'Korte afstand',d:'Dichtbij op straat: grote doelen, snelle mensen en meer kogels.',pay:1,cr:1,want:.32,feud:1,need:()=>hitWeapon()>=1,why:'Eerst een pistool of zwaarder'},
 geweer:{n:'Geweer',k:'Van een afstand',d:'Door het vizier vanaf een dak. Houd je adem in en reken met de wind.',pay:1.05,cr:.9,want:.14,feud:.9,need:()=>hitWeapon()>=HIT_GUN,why:'Eerst een scherpschuttersgeweer'},
 ongeluk:{n:'Ongeluk',k:'Geen wapen',d:'Een lading van de bouwkraan die net verkeerd valt. Lijkt het een ongeluk, dan stelt niemand vragen.',pay:1.12,cr:.85,want:.05,feud:.45,need:()=>rankIdx(S.xp)>=RK[8],why:'Vanaf '+RANKS[RK[8]][0]}};
const HIT_MORDER=['mes','pistool','geweer','ongeluk'];
const HIT_REP=[['Nieuweling',0],['Huurling',50],['Vakman',150],['Specialist',350],['Schim',700],['Legende',1300]];
const ht={tier:null,sel:{},how:false,open:false};
const hitK=v=>typeof fmtK==='function'?fmtK(v):fmt(v);
// reputatie als huurmoordenaar (oude saves: geschat uit het aantal geslaagde klussen)
const hm=()=>{if(!S.hm||typeof S.hm!=='object'){const st=S.stats||{};S.hm={rep:(st.hits||0)*30+(st.hitsPerfect||0)*10,n:{},bh:0}}if(!S.hm.n)S.hm.n={};return S.hm};
const hitRepLv=()=>{const r=hm().rep;let l=0;HIT_REP.forEach((x,i)=>{if(r>=x[1])l=i});return l};
const hitRepK=()=>1+hitRepLv()*.03;
const hitTierOpen=T=>rankIdx(S.xp)>=T.r&&hitRepLv()>=T.rep;
const hitRepGain=(H,m,perfect,clean)=>Math.round(8*H.d*(perfect?1.3:1)*(clean?1.25:1)*(H.pref===m?1.15:1));
// hoe rustig je vizier is: training Schieten, beter wapen, lidmaatschap en het voordeel van Het Schaduwcontract
const hitSteady=()=>{const sk_=Math.min(.4,sk('schiet')*.008),wp=hitWeapon()>HIT_GUN?.1:0,tr=tierK()*.5,fp=famPerk('hit');
 return {sk:sk_,wp,tr,fp,k:(1-sk_)*(1-wp)*(1-tr)*(1-fp)}};
// Vaste hand: als beginnende huurmoordenaar trillen je handen (snelle bibber bovenop het zwiepen van je vizier).
// Trainen bij Schieten, ervaring (geslaagde contracten) en een hogere rang maken je hand rustiger.
const HAND_LV=['Bibberend','Zenuwachtig','Redelijk vast','Vast','IJskoud'];
const hitNerve=()=>{const ri=rankIdx(S.xp),done=(S.stats&&S.stats.hits)||0;
 const a=.45*Math.min(1,sk('schiet')/40),b=.35*Math.min(1,done/15),c=.2*Math.min(1,Math.max(0,ri-HIT_RANK)/4),lv=Math.min(1,a+b+c);
 return {lv,a,b,c,amp:.6+5.4*(1-lv),name:HAND_LV[Math.min(4,Math.floor(lv*5))],i:Math.min(4,Math.floor(lv*5))}};
// spelinstellingen per methode
// publiek (geweer/pistool) schaalt met het doelwit: wie weinig betaalt loopt alleen, een peetvader loopt in een drukte.
// civ = omstanders in totaal, front = hoeveel daarvan vóór het doelwit langs lopen (die moet je laten passeren).
const HIT_CROWD={geweer:{civ:[2,3,6,8,10,13],front:[0,1,2,3,4,5]},pistool:{civ:[1,2,4,5,6,8],front:[0,0,1,2,2,3]}};
const hitParams=(H,m)=>{const d=H.d,tk=1+tierK(),C=HIT_CROWD.geweer,B={speed:24+d*9,size:1.12-d*.07,sway:8+d*4.4,time:Math.round((32-d*2.6+C.front[d-1]*.8)*tk),bullets:d<=2?2:1,civ:C.civ[d-1],front:C.front[d-1],cover:d>=3,guards:d>=6?2:d>=5?1:0};
 if(m==='pistool'){const Cp=HIT_CROWD.pistool;return {...B,speed:B.speed*1.35,sway:B.sway*.6,time:Math.round((24-d*1.7+Cp.front[d-1]*.8)*tk),bullets:d<=2?3:2,civ:Cp.civ[d-1],front:Cp.front[d-1]}}
 if(m==='mes')return {d,time:Math.round((48-d*3)*tk),g0:4.4-d*.35,g1:7.4-d*.5,warn:.95-d*.07,look:1.05+d*.12,view:780,shadows:d<=2?6:d<=4?5:4,guards:d>=5?1:0,vT:30+d*4,vP:66+sk('speed')*.35,qDur:1.02-d*.05,tol:Math.min(.16,.06+hitNerve().lv*.05+sk('steal')*.0012)};
 if(m==='ongeluk')return {d,time:Math.round((42-d*2)*tk),loads:d<=3?2:1,calls:d<=2?2:1,civ:[0,1,2,2,3,3][d-1],vT:30+d*5};
 return {...B,wind:.8+d*.45}};
const hitPay=H=>{const k=lootMult()*(1+famPerk('hit'));return [H.pay[0]*k,H.pay[1]*k]};
const hitPayM=(H,m)=>{const [a,b]=hitPay(H),k=HIT_M[m].pay*(H.pref===m?1.2:1)*hitRepK();return [a*k,b*k]};
const hitCd=H=>H.cd*60000*waitK();
const hitJail=H=>180+H.d*70;
// standaardkeuze: de wens van de klant als dat kan, anders de eerste methode die je hebt
const hitSel=H=>{let m=ht.sel[H.id];const ls=S.hm&&S.hm.last;if(!m||!H.m.includes(m))m=H.m.find(x=>x===H.pref&&HIT_M[x].need())||(ls&&H.m.includes(ls)&&HIT_M[ls].need()?ls:0)||H.m.find(x=>HIT_M[x].need())||H.pref||H.m[0];return m};
function hitPick(id,m){ht.sel[id]=m;try{SFX.click()}catch(e){}render()}
function hitTab(t){ht.tier=t;ht.open=true;try{SFX.click()}catch(e){}render();window.scrollTo({top:0,behavior:'smooth'})}
function hitHowToggle(){ht.how=!ht.how;render()}

// ---------- gezocht ----------
const WANT_LV=[null,
 {n:'Signalement',min:12,raid:.45,tick:.2,d:'Er gaat een beschrijving van je rond. Af en toe een controle als je iets doet.'},
 {n:'Opsporingsbericht',min:25,raid:.75,tick:.4,d:'Je gezicht hangt op het bureau. Vaker controles, en er lopen premiejagers rond.'},
 {n:'Landelijk gezocht',min:45,raid:1.05,tick:.75,d:'Heel Nederland zoekt je. Controles bij bijna alles en premiejagers op straat.'}];
const wantedObj=()=>S.wanted&&typeof S.wanted==='object'&&S.wanted.lv?S.wanted:null;
// resterende tijd (ms); ontsnapt uit de bajes = Infinity (geen timer)
function wantedLeft(){if(!S.wanted)return 0;const w=wantedObj();return w?Math.max(0,w.until-now()):Infinity}
function wantedLv(){if(!S.wanted)return 0;const w=wantedObj();return w?w.lv:2}
// factor op de kans op een controle: kind 'tick' (vanzelf, main.js) of standaard (bij een actie, actions.js)
function wantedK(kind){const w=wantedObj(),b=w?WANT_LV[w.lv][kind==='tick'?'tick':'raid']:1;return b*(typeof wantMod==='function'?wantMod():1)}
function wantedLabel(){if(!S.wanted)return '';const w=wantedObj();return w?'▲ GEZOCHT · '+fmtClock(w.until-now()):'▲ GEZOCHT'}
function setWanted(lv,t,sec){lv=Math.max(1,Math.min(3,lv|0));if(S.wanted===true)return; // ontsnapt blijft ontsnapt (strenger, geen timer)
 const w=wantedObj(),until=now()+WANT_LV[lv].min*60000;
 S.wanted={lv:Math.max(lv,w?w.lv:0),until:Math.max(until,w?w.until:0),t:t||(w&&w.t)||'',sec:Math.max(sec||0,(w&&w.sec)||0),at:now()};
 const L=WANT_LV[S.wanted.lv];log(`Gezocht: ${L.n.toLowerCase()}${t?' na '+t:''}, nog ${fmtClock(S.wanted.until-now())}`,'bad');
 setTimeout(()=>toast(`Je staat op de gezochtlijst: ${L.n}. ${L.d}`,'bad'),1400)}
function clearWanted(reason,quiet){if(!S.wanted)return false;S.wanted=false;if(reason){log(reason,'ok');if(!quiet)toast(reason,'lvl')}save();if(page==='hits'&&!window.__chase&&typeof render==='function')render();return true}
// kans om gezocht te worden na een geslaagde klus
const hitWantChance=(H,m,perfect)=>{const c=gearBest('comm');let p=HIT_M[m].want*(1+.1*(H.d-1))*(perfect?.7:1)*(1-(c?c.heat:0)/200)*(1+S.heat/250)*(1-hitRepLv()*.04);
 if(typeof wantMod==='function')p*=wantMod();return Math.max(.02,Math.min(.85,p))};
const hitWantLv=(H,m)=>m==='ongeluk'?1:Math.max(1,Math.min(3,Math.ceil(H.d/2)-(m==='geweer'?1:0)));
// timer: aflopen, ondergedoken drie keer zo snel, opgepakt = dossier dicht; premiejagers vanaf niveau 2
let _hwT=Date.now(),_hwS=0;
setInterval(()=>{const t=Date.now(),dt=Math.min(t-_hwT,6*3600e3);_hwT=t;if(typeof S==='undefined'||!S||typeof render!=='function')return;
 if(S.hm&&S.hm.bhPend&&!window.__bhG){S.hm.bhPend=0;bhLose(true);return}
 const w=wantedObj();if(!w)return;
 if(inJail()){clearWanted('Je zit vast. Voor '+(w.t||'de huurmoord')+' sta je niet meer op de gezochtlijst.',true);return}
 if(S.hide){w.until-=dt*2;if(t-_hwS>15000){_hwS=t;save()}}
 if(w.until<=now()){clearWanted('Je staat niet meer op de gezochtlijst. Het spoor naar jou is koud.');return}
 bhMaybe(w)},1000);

// ---------- de pagina ----------
const hitMIc=m=>({
 mes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5 20 2l-2.5 5.5-8 8-3-3z"/><path d="m6.5 12.5 5 5"/><path d="m8 16-4 4"/><path d="M3 19.5 4.5 21"/></svg>',
 pistool:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h17v4h-8l-1.5 2.5H8L6.5 20H3l1.5-9H3z"/><path d="M9 11v2.5"/></svg>',
 geweer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14h13l2-2h5"/><path d="M5 14l-1.5 5h3L8 14"/><rect x="8" y="8.5" width="7" height="3"/><path d="M11.5 11.5V14"/></svg>',
 ongeluk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V3h15"/><path d="M5 7l4-4"/><path d="M16 3v6"/><rect x="13" y="9" width="6" height="4"/><path d="M14 17.5v.5M16 16v2M18 17.5v.5"/></svg>'}[m]||'');
const hitWantIc=()=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>';
function hitScopeSvg(){return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="3"/><path d="M24 2v12M24 34v12M2 24h12M34 24h12"/></svg>'}
// dossierfoto: silhouet tegen een meetlat, met een detail per doelwit
function hitPhoto(H){const i=HITS.indexOf(H),c=HIT_COLS[i%HIT_COLS.length],a={koerier:'cap',boekhouder:'glas',bankier:'glas',peetvader:'hoed',wethouder:'das',getuige:'kap',rivaal:'haar'}[H.id]||'';
 const acc=a==='cap'?'<path d="M21 26c1-7 6-10 11-10s10 3 11 10z" fill="#151820"/><path d="M41 25h9" stroke="#151820" stroke-width="3"/>'
  :a==='hoed'?'<path d="M17 25h30" stroke="#0d0f13" stroke-width="3"/><path d="M22 25c0-8 3-11 10-11s10 3 10 11z" fill="#0d0f13"/>'
  :a==='glas'?'<path d="M24 31h7M33 31h7" stroke="#8fa3b8" stroke-width="2.4"/><path d="M31 31h2" stroke="#8fa3b8" stroke-width="1.2"/>'
  :a==='das'?'<path d="M32 57l-3 4 3 13 3-13z" fill="#8a2430"/>'
  :a==='kap'?'<path d="M18 46c0-20 6-30 14-30s14 10 14 30l-5 7H23z" fill="#262b34"/>'
  :a==='haar'?'<path d="M21 28c0-9 5-13 11-13s11 4 11 13c-3-4-7-5-11-5s-8 1-11 5z" fill="#0d0f13"/>':'';
 return `<div class="ht-photo" aria-hidden="true"><svg viewBox="0 0 64 76">
  <rect width="64" height="76" fill="#0b0d11"/>${[12,24,36,48,60].map(y=>`<path d="M0 ${y}h64" stroke="#1a1e25" stroke-width="1"/><text x="2" y="${y-2}" fill="#2a3039" font-size="5" font-family="monospace">${(200-y*1.2).toFixed(0)}</text>`).join('')}
  <path d="M6 76c1.5-14 11-21 26-21s24.5 7 26 21z" fill="${c}"/><path d="M27 44h10v12H27z" fill="#1d2129"/>
  <ellipse cx="32" cy="32" rx="11" ry="13.5" fill="#232831"/>${acc}
  <path d="M3 3h7M3 3v7M61 3h-7M61 3v7M3 73h7M3 73v-7M61 73h-7M61 73v-7" stroke="var(--red)" stroke-width="1.4" fill="none"/></svg></div>`}
function hitWantHtml(){if(!S.wanted)return '';const w=wantedObj();
 if(!w)return `<section class="ht-want esc"><i class="ht-w-ic">${hitWantIc()}</i><div class="ht-w-t"><span class="label">Gezocht</span><b>Ontsnapt uit de bajes</b><p>Geen timer: je blijft gezocht tot je wordt opgepakt of tot je ondergedoken bent tot 0% hitte.</p></div>${S.hide?'':'<a class="btn ghost sm" href="#verblijf">Onderduiken</a>'}</section>`;
 const L=WANT_LV[w.lv],left=Math.max(0,w.until-now()),tot=L.min*60000;
 return `<section class="ht-want lv${w.lv}"><i class="ht-w-ic">${hitWantIc()}</i>
  <div class="ht-w-t"><span class="label">Gezocht${w.t?' · na '+esc(w.t):''}</span><b>${L.n}</b><p>${L.d}${S.hide?' Je bent ondergedoken: de tijd loopt drie keer zo snel.':''}</p></div>
  <div class="ht-w-lv" title="Niveau ${w.lv} van 3">${[1,2,3].map(i=>`<i class="${i<=w.lv?'on':''}"></i>`).join('')}</div>
  <div class="ht-w-c"><span class="label">Nog</span><b>${fmtClock(left)}</b><div class="bar"><i style="width:${Math.min(100,left/tot*100)}%"></i></div></div>
  ${S.hide?'':'<a class="btn ghost sm" href="#verblijf">Onderduiken</a>'}</section>`}
function hitHowHtml(){const T={
  mes:'Houd <b>spatie</b> (of <b>Sluip</b>) ingedrukt om dichterbij te komen. Een <b>!</b> boven zijn hoofd: hij gaat omkijken. Sta dan stil, liefst in het donker van een portiek. Belt hij, dan let hij niet op. Dichtbij: druk op <b>E</b> of <b>Toeslaan</b>, en nog een keer als de ring in het groen staat.',
  pistool:'Dichtbij op straat. Richt met je muis of door te slepen en <b>klik</b> (of tik op <b>Vuur</b>). Grote doelen en meer kogels, maar na je eerste schot rent iedereen en je raakt snel een omstander.',
  geweer:'Door het vizier. Houd <b>spatie</b> of <b>Adem</b> in voor een rustig vizier. De wind duwt je kogel opzij: elk streepje in het vizier is één punt wind, dus richt zoveel streepjes tegen de wind in.',
  ongeluk:'Beweeg de kraan met je muis of door te slepen en laat de lading <b>los</b> met een klik of spatie. Hij valt niet meteen en slingert mee: reken vooruit. <b>Bel</b> hem op (toets B) en hij blijft even staan.'};
 return `<section class="ht-how"><div class="ht-how-g">${HIT_MORDER.map(m=>`<div class="ht-how-m"><div class="ht-how-h"><i>${hitMIc(m)}</i><b>${HIT_M[m].n}</b><span>${HIT_M[m].k}</span></div><p>${T[m]}</p></div>`).join('')}</div>
  <div class="ht-how-x">
   <p><b>Reputatie.</b> Elke geslaagde klus geeft reputatie: het meest voor schoon werk (niet gezocht), een perfecte uitvoering en de wens van de klant. Met reputatie én rang gaan Professioneel en Elite open, en elk niveau geeft 3% meer beloning.</p>
   <p><b>Gezocht.</b> Na een klus kan de politie je zoeken: van dichtbij is dat een grotere kans dan vanaf een dak of met een ongeluk. Zolang je gezocht bent, kan elke actie een controle opleveren. Vanaf een opsporingsbericht lopen er ook premiejagers rond. Het zakt vanzelf, drie keer zo snel als je ondergedoken bent.</p>
   <p><b>Trillende handen.</b> Als beginner trillen je handen; adem inhouden helpt maar een beetje. Train <b>Schieten</b>, doe meer contracten en stijg in rang voor een vaste hand. Met het mes maakt een vaste hand het groene stuk van de ring groter.</p>
   <p><b>Wraak.</b> Een doelwit heeft vaak eigen mensen. Na een contract (of als hij ontsnapt) kunnen ze je komen zoeken: dan volgt een <b>bendegevecht</b>. Een ongeluk geeft minder kans op wraak. Wie in een familie zit en niet komt opdagen, wordt ${typeof FEUD_BAN_DAYS!=='undefined'?FEUD_BAN_DAYS:30} speldagen verbannen.</p></div></section>`}

V.hits=()=>{const ri=rankIdx(S.xp);
 if(ri<HIT_RANK)return `<h1>Huurmoorden</h1>
  <section class="card ht-lock"><div class="ht-scope-ic">${hitScopeSvg()}</div><div><span class="label">Nog op slot</span><h2>Vanaf ${RANKS[HIT_RANK][0]}</h2>
  <p>Contracten op mensen die iemand liever kwijt is. Je kiest zelf hoe: van dichtbij met een mes, op straat met een pistool, vanaf een dak met een geweer of zo dat het op een ongeluk lijkt. Lukt het, dan verdien je veel geld, straatcredit en XP. Hoe beter je naam als huurmoordenaar, hoe zwaarder de contracten.</p>
  <div class="ht-lock-m">${HIT_MORDER.map(m=>`<span>${hitMIc(m)}${HIT_M[m].n}</span>`).join('')}</div>
  <div class="bar"><i style="width:${Math.min(100,S.xp/RANKS[HIT_RANK][1]*100)}%;background:var(--red)"></i></div><small>${Math.floor(S.xp).toLocaleString('nl-NL')} / ${RANKS[HIT_RANK][1].toLocaleString('nl-NL')} XP</small></div></section>`;
 const st=hitSteady(),nv=hitNerve(),H0=hm(),rl=hitRepLv(),nx=HIT_REP[rl+1],done=(S.stats&&S.stats.hits)||0,left=cdLeft('hit'),busy=!!window.__hitG;
 if(!ht.tier||!HIT_TIERS.find(t=>t.id===ht.tier))ht.tier=(HIT_TIERS.slice().reverse().find(hitTierOpen)||HIT_TIERS[0]).id;
 const T=HIT_TIERS.find(t=>t.id===ht.tier),tOpen=hitTierOpen(T),pct=v=>Math.round(v*100)+'%';
 const own=HIT_MORDER.filter(m=>HIT_M[m].need()).length,gb=gearBest('wapen');
 const repPct=nx?Math.min(100,(H0.rep-HIT_REP[rl][1])/(nx[1]-HIT_REP[rl][1])*100):100;
 const card=H=>{const m=hitSel(H),M=HIT_M[m],P=hitParams(H,m),[a,b]=hitPayM(H,m),mOk=M.need(),lockR=ri<H.r,lockT=!tOpen,tired=S.energy<H.en,
   can=!lockR&&!lockT&&mOk&&!left&&!tired&&!inJail()&&!busy,pref=H.pref===m;
  const label=lockT?T.n+' is nog op slot':lockR?'Vanaf '+RANKS[H.r][0]:inJail()?'Je zit vast':!mOk?M.why:left?'Nog '+fmtClock(left):tired?'Te moe · '+H.en+' energie':'Aannemen · '+M.n;
  const wc=hitWantChance(H,m,false),wl=hitWantLv(H,m),risk=wc<.12?['Laag','lo']:wc<.3?['Middel','mid']:['Hoog','hi'];
  const n=x=>x+' omstander'+(x>1?'s':''),gd=P.guards?' · '+P.guards+' lijfwacht'+(P.guards>1?'en':''):'';
  const ex=m==='mes'?[`${P.time} s · sluipen`,`kijkt om de ${Math.round(P.g0)}–${Math.round(P.g1)} s${gd}`]
   :m==='ongeluk'?[`${P.time} s · ${P.loads} lading${P.loads>1?'en':''}`,`${P.calls}× bellen · ${P.civ?P.civ+' voorbijganger'+(P.civ>1?'s':''):'rustige stoep'}`]
   :m==='pistool'?[`${P.time} s · ${P.bullets} kogels`,`dichtbij · ${P.civ?n(P.civ):'geen omstanders'}${P.cover?' · dekking':''}${gd}`]
   :[`${P.time} s · ${P.bullets} ${P.bullets>1?'kogels':'kogel'}`,`wind tot ${P.wind.toFixed(1).replace('.',',')} · ${P.civ?n(P.civ):'geen omstanders'}${gd}`];
  const crG=Math.round(H.cr*M.cr*(pref?1.1:1)*credMult('netjes'));
  return `<article class="ht-card ${lockR||lockT?'locked':''}" style="--hc:${T.col}">
   <div class="ht-c-top">${hitPhoto(H)}<div class="ht-c-id"><div class="ht-d" title="Moeilijkheid ${H.d} van 6">${[1,2,3,4,5,6].map(i=>`<i class="${i<=H.d?'on':''}"></i>`).join('')}</div>
    <h3>${esc(H.n)}</h3><b class="ht-t">${esc(H.t)}</b><span class="ht-w">${esc(H.w)}</span></div></div>
   <p class="ht-desc">${esc(H.desc)}</p>
   <div class="ht-meth" role="radiogroup" aria-label="Methode">${H.m.map(x=>{const X=HIT_M[x],ok=X.need();return `<button type="button" role="radio" aria-checked="${x===m}" class="ht-mc ${x===m?'on':''} ${ok?'':'lock'}" onclick="hitPick('${H.id}','${x}')" title="${esc(X.n+(ok?' · '+X.k:': '+X.why))}">${hitMIc(x)}<span>${X.n}</span>${H.pref===x?'<em>wens</em>':''}</button>`}).join('')}</div>
   <div class="ht-mnote ${mOk?'':'bad'}">${mOk?(pref?`<b>Wens van de klant · +20%</b> ${esc(H.prefWhy)}`:esc(M.d)):`${esc(M.why)}${m==='ongeluk'?'':' · <a href="#shop">naar Wapens</a>'}`}</div>
   <div class="ht-s">
    <div><span>Beloning</span><b class="g">${hitK(a)} – ${hitK(b)}</b><small>perfect +25%${H0&&rl?' · reputatie +'+rl*3+'%':''}</small></div>
    <div><span>Erbij</span><b>+${H.xp} XP</b><small>+${crG} cred · +${hitRepGain(H,m,false,true)} reputatie</small></div>
    <div><span>Opsporing</span><b class="rk ${risk[1]}">${risk[0]} · ${Math.round(wc*100)}%</b><small>dan ${WANT_LV[wl].n.toLowerCase()}, ${WANT_LV[wl].min} min</small></div>
    <div><span>Uitvoering</span><b>${ex[0]}</b><small>${ex[1]}</small></div></div>
   <div class="ht-foot"><small>${H.en} energie · ${Math.round(hitCd(H)/60000)} min wachten · mislukt: ${fmtTime(jailSec(hitJail(H)))} cel</small>
    <button class="btn ${can?'red':''}" onclick="hitStart('${H.id}')" ${can?'':'disabled'}>${label}</button></div></article>`};
 const tierBtn=X=>{const o=hitTierOpen(X),rk=ri>=X.r,rp=rl>=X.rep,cnt=HITS.filter(h=>h.tier===X.id).length;
  return `<button type="button" role="tab" aria-selected="${X.id===T.id}" class="ht-tier ${X.id===T.id?'on':''} ${o?'':'lock'}" style="--tc:${X.col}" onclick="hitTab('${X.id}')"><b>${X.n}</b><span>${o?cnt+' contracten':[!rp?HIT_REP[X.rep][0]:'',!rk?RANKS[X.r][0]:''].filter(Boolean).join(' + ')}</span></button>`};
 const need=!tOpen?[rl<T.rep?`reputatie <b>${HIT_REP[T.rep][0]}</b> (nu ${HIT_REP[rl][0]}, ${H0.rep}/${HIT_REP[T.rep][1]})`:'',ri<T.r?`rang <b>${RANKS[T.r][0]}</b>`:''].filter(Boolean).join(' en '):'';
 return `<h1>Huurmoorden</h1>${hitWantHtml()}
 <section class="card hud ht-hero">
  <div class="ht-h-k ht-rep"><span class="label">Reputatie</span><b>${HIT_REP[rl][0]}</b><div class="ht-rbar"><i style="width:${repPct}%"></i></div><em>${nx?`${H0.rep} / ${nx[1]} · dan ${nx[0]}`:'Hoogste niveau'}<br>${done} geslaagd${S.stats&&S.stats.hitsPerfect?' · '+S.stats.hitsPerfect+' perfect':''}${rl?' · +'+rl*3+'% beloning':''}</em></div>
  <div class="ht-h-k ht-hand"><span class="label">Vaste hand</span><b style="color:${['var(--red)','var(--acc)','var(--gold)','var(--ice)','var(--green)'][nv.i]}">${nv.name}</b><div class="ht-lv">${HAND_LV.map((x,i)=>`<i class="${i<=nv.i?'on':''}"></i>`).join('')}</div><em>Trillen −${pct(nv.lv)} · Schieten ${pct(nv.a)} · ervaring ${pct(nv.b)} · rang ${pct(nv.c)}</em></div>
  <div class="ht-h-k"><span class="label">Rustig vizier</span><b style="color:var(--ice)">−${pct(1-st.k)}</b><em>Schieten ${pct(st.sk)}${st.wp?' · wapen 10%':''}${st.tr?` · ${lidName()} ${pct(st.tr)}`:''}${st.fp?` · familie ${pct(st.fp)}`:''}</em></div>
  <div class="ht-h-k ht-ars"><span class="label">Methodes</span><div class="ht-ars-i">${HIT_MORDER.map(m=>`<i class="${HIT_M[m].need()?'on':''}" title="${esc(HIT_M[m].n+(HIT_M[m].need()?'':': '+HIT_M[m].why))}">${hitMIc(m)}</i>`).join('')}</div><em>${own} van 4 · ${gb?esc(gb.n):'<a href="#shop">geen wapen</a>'}</em></div>
  <div class="ht-h-k"><span class="label">Volgende contract</span><b>${left?fmtClock(left):'Nu'}</b><em>${Math.floor(S.energy)}/${EN_MAX} energie${tierK()?` · ${lidName()}: ${Math.round(tierK()*100)}% meer tijd`:''}</em></div>
 </section>
 ${ht.open?`<div class="vb-bar"><button class="vb-back" onclick="ht.open=false;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Alle contracten</span></button><h2 style="color:${T.col}">${T.n}</h2><button type="button" class="ht-howb ${ht.how?'on':''}" onclick="hitHowToggle()" aria-expanded="${ht.how}" style="margin-left:auto">Zo werkt het</button></div>
 ${ht.how?hitHowHtml():''}
 <p class="ht-tier-d" style="--tc:${T.col}"><b>${T.n}.</b> ${T.d}${need?` <span class="bad">Op slot: je hebt ${need} nodig.</span>`:''}</p>
 <div class="ht-grid">${HITS.filter(h=>h.tier===T.id).map(card).join('')}</div>`
 :`<div class="bz-sec"><h2>Contracten</h2><span>kies een niveau</span><button type="button" class="ht-howb ${ht.how?'on':''}" onclick="hitHowToggle()" aria-expanded="${ht.how}" style="margin-left:auto">Zo werkt het</button></div>${ht.how?hitHowHtml():''}
 <div class="ht-banners">${HIT_TIERS.map(X=>{const o=hitTierOpen(X),L=HITS.filter(h=>h.tier===X.id),pay=L.reduce((a,h)=>Math.max(a,hitPay(h)[1]),0),why=[rl<X.rep?HIT_REP[X.rep][0]+' reputatie':'',ri<X.r?RANKS[X.r][0]:''].filter(Boolean).join(' + ');
   return `<button class="bzb ht-bn ${o?'':'lock'}" style="--c:${X.col}" onclick="hitTab('${X.id}')">
    <span class="bzb-art ht-bn-art" aria-hidden="true"><span class="ht-bn-scope">${hitScopeSvg()}</span><span class="ht-bn-ph">${L.map(h=>hitPhoto(h)).join('')}</span></span>
    <span class="bzb-t"><span class="bzb-k">${L.length} contracten</span><b>${X.n}</b><span class="bzb-d">${X.d}</span><span class="bzb-f"><em>tot <b>${hitK(pay)}</b></em>${o?'':`<em class="dn">op slot: ${why}</em>`}</span><span class="bzb-go">${o?'Bekijken ›':'Bekijken'}</span></span></button>`}).join('')}</div>`}`};

// ---------- contract starten en afronden ----------
function hitStart(id){const H=HITS.find(h=>h.id===id);if(!H||window.__hitG||window.__chase)return;const m=hitSel(H),T=HIT_TIERS.find(t=>t.id===H.tier);
 if(!HIT_M[m].need()||!hitTierOpen(T)||rankIdx(S.xp)<H.r||cdLeft('hit')||S.energy<H.en||inJail())return;
 S.energy-=H.en;S.cd.hit=now()+hitCd(H);S.pendingHit={id:H.id,m,at:now()};hm().last=m;save();pushState();
 (m==='mes'?hitKnife(H):m==='ongeluk'?hitAccident(H):hitGame(H,m)).then(res=>hitEnd(H,res,m))}

function hitEnd(H,res,m){m=HIT_M[m]?m:'geweer';const M=HIT_M[m],pref=H.pref===m,R0=hm();S.pendingHit=null;S.stats.hitTries=(S.stats.hitTries||0)+1;
 const feudK=M.feud,wl=hitWantLv(H,m);
 if(res.ok){const [a,b]=hitPayM(H,m),perfect=res.zone==='head',pay=Math.round(rnd(a,b)*(perfect?1.25:1)),cr=credGain(H.cr*M.cr*(pref?1.1:1),perfect?'perfect':'netjes');
  S.cash+=pay;addZwart(pay);S.cred+=cr;S.stats.hits=(S.stats.hits||0)+1;if(perfect)S.stats.hitsPerfect=(S.stats.hitsPerfect||0)+1;R0.n[m]=(R0.n[m]||0)+1;
  addHeat((8+H.d*3)*(m==='ongeluk'?.4:1));addXp(Math.round(H.xp*(perfect?1.2:1)));
  if(typeof famEv==='function')famEv('crime',{r:H.r,g:pay,cr});
  const wanted=Math.random()<hitWantChance(H,m,perfect),lv0=hitRepLv();R0.rep+=hitRepGain(H,m,perfect,!wanted);const lv1=hitRepLv();
  const how={mes:perfect?'in één zuivere beweging':'van dichtbij',pistool:perfect?'met een hoofdschot':'met je pistool',geweer:perfect?'met een hoofdschot':'vanaf een dak',ongeluk:perfect?'met een perfect ongeluk':'met een ongeluk'}[m];
  log(`Huurmoord: ${H.t} uitgeschakeld ${how} (+${fmt(pay)}, +${cr} cred)`,'ok');
  if(wanted)setWanted(wl,H.t,hitJail(H));
  save();pushState();render();
  toast(`${perfect?{mes:'Zuiver! ',ongeluk:'Perfect ongeluk! '}[m]||'Hoofdschot! ':''}${H.t} is uitgeschakeld: +${fmt(pay)} · +${cr} cred${wanted?'':' · niemand zag je'}`,'lvl');
  if(lv1>lv0){const op=HIT_TIERS.find(t=>t.rep===lv1&&rankIdx(S.xp)>=t.r);setTimeout(()=>toast(`Reputatie: je bent nu ${HIT_REP[lv1][0]}${op?'. '+op.n+' is open':''}`,'lvl'),wanted?2800:1300)}
  if(!S.feud&&Math.random()<(.12+H.d*.06)*feudK)setTimeout(()=>feudStart(H,'hit'),1600);return}
 R0.rep=Math.max(0,R0.rep-3*H.d);
 // mes: hij worstelt zich los
 if(res.why==='struggle'){const h=rnd(8,18);S.hp=Math.max(5,S.hp-h);addHeat(14);log(`Huurmoord mislukt: ${H.t} worstelde zich los (−${h}% gezondheid)`,'bad');
  if(Math.random()<.4)setWanted(1,H.t,hitJail(H));save();pushState();render();toast(`${H.t} worstelt zich los en rent weg. −${h}% gezondheid`,'bad');
  if(!S.feud&&Math.random()<.35)setTimeout(()=>feudStart(H,'escaped'),1700);return}
 // ongeluk: net mis, hij schrikt. Het leek op een ongeluk, dus geen politie
 if(res.why==='nearmiss'){addHeat(6);log(`Huurmoord mislukt: de lading viel net naast ${H.t}`,'bad');save();pushState();render();
  toast('Net mis. Hij schrikt en loopt hard weg. Het leek op een ongeluk: geen politie.','bad');
  if(!S.feud&&Math.random()<.2)setTimeout(()=>feudStart(H,'escaped'),1500);return}
 if(res.why==='escaped'||res.why==='quit'||res.why==='spotted'){addHeat(res.why==='spotted'?10:12);
  log(res.why==='spotted'?`Huurmoord mislukt: ${H.t} zag je aankomen`:`Huurmoord mislukt: ${H.t} is ontkomen`,'bad');
  if(m!=='ongeluk'&&Math.random()<(res.why==='quit'?.2:.3))setWanted(1,H.t,hitJail(H));save();pushState();render();
  toast(res.why==='quit'?'Contract afgebroken. Het doelwit is gewaarschuwd.':res.why==='spotted'?'Hij heeft je gezien en rent weg.':'Het doelwit is ontkomen.','bad');
  if(res.why!=='quit'&&!S.feud&&Math.random()<.3*feudK)setTimeout(()=>feudStart(H,'escaped'),1400);return}
 // gemist: niet altijd politie. Soms laat het doelwit het aan zijn eigen mensen over.
 if(res.why==='missed'&&!S.feud&&Math.random()<.45){addHeat(10);log(`Huurmoord mislukt: ${H.t} gemist. Geen politie, maar zijn mensen zoeken je`,'bad');save();pushState();render();feudStart(H,'missed');return}
 const civ=res.why==='civilian';addHeat(civ?35:18);log(civ?`Huurmoord mislukt: een omstander geraakt`:`Huurmoord mislukt: ${H.t} gemist`,'bad');save();
 // ontkom je de politie, dan sta je wel op de gezochtlijst (state.js arrest: opts.wanted)
 arrest(hitJail(H)*(civ?1.3:1),civ?(m==='ongeluk'?'Een voorbijganger!':'Een omstander geraakt!'):'Gemist!',
  civ?(m==='ongeluk'?'De lading raakte iemand die er niets mee te maken had. De bouwplaats staat binnen een minuut vol politie.':'Je raakte iemand die er niets mee te maken had. Binnen een minuut staat de straat vol politie.'):`${H.t} rent weg en iemand heeft je gezien. De politie is onderweg.`,
  {flee:Math.min(5,H.d+(civ?1:0)),wanted:{lv:Math.min(3,wl+(civ?1:0)),t:H.t,sec:hitJail(H)}})}

// ---------- gedeeld: figuurtjes en de laag ----------
// p: {x,y,sc,kind:'target'|'civ'|'guard'|'me',mode,ph,dir,face,down,col,alarm,dim,lk}
// Anonieme figuren: jas met schouders, broek en schoenen, armen die meezwaaien, haar of een pet. Het doelwit draagt altijd
// de rode jas en een hoed; lijfwachten een donker pak met zonnebril. De zones voor treffers (hoofd/romp/benen) blijven gelijk.
const HIT_CIV_COATS=['#5b6b7c','#3f5a46','#6b5a44','#4a4f6b','#6d5a6a','#556070','#7a6a3a','#2f4f5f','#8a7f70','#4d3b55','#3d4d5c','#6a7480'];
const HIT_SKIN=['#e2bf9a','#d0a17a','#b98260','#8f5f40','#6e4630','#f0d2b4'];
const HIT_HAIR=['#16110d','#2a1d14','#4a3322','#6b5a48','#9a8a78','#1c1c1f'];
function hitLook(p){if(p.lk)return p.lk;const r=Math.random,k=p.kind;
 return p.lk={skin:HIT_SKIN[Math.floor(r()*HIT_SKIN.length)],hair:HIT_HAIR[Math.floor(r()*HIT_HAIR.length)],
  pants:k==='guard'?'#0b0c10':['#14161b','#1d222b','#2a2622','#1a1f1a'][Math.floor(r()*4)],
  hat:k==='target'?'hoed':k==='civ'?(r()<.2?'pet':r()<.15?'muts':''):'',bag:k==='civ'&&r()<.28?(r()<.5?1:-1):0,
  long:k==='civ'&&r()<.35,scarf:k==='civ'&&r()<.25?['#b9a27a','#7f8fa3','#a3707a','#cfcfcf'][Math.floor(r()*4)]:''}}
function hitShade(hex,f){const n=parseInt(hex.slice(1),16),m=v=>Math.max(0,Math.min(255,Math.round(v*f)));return `rgb(${m(n>>16)},${m((n>>8)&255)},${m(n&255)})`}
function hitPerson(c,p,now){if(p.gone)return;const h=p.sc,down=p.down?Math.min(1,(now-p.down)/350):0,lk=hitLook(p);
 c.save();c.translate(p.x,p.y);
 // schaduw op de stoep
 if(!down){c.fillStyle='rgba(0,0,0,.38)';c.beginPath();c.ellipse(0,1*h,17*h,3.6*h,0,0,7);c.fill()}
 if(down){c.rotate(down*1.35*(p.dir||1));c.globalAlpha=1-down*.25}if(p.dim)c.globalAlpha*=p.dim;
 const still=p.mode==='pause'||p.mode==='stand'||p.mode==='phone'||p.mode==='look',sw=still?0:Math.sin(p.ph)*8*h,fd=p.face||p.dir||1;
 const coat=p.kind==='target'?'#c62f3a':p.kind==='me'?'#262d38':p.kind==='guard'?'#15171c':(p.col||'#556070'),dark=hitShade(coat.length===7?coat:'#556070',.72);
 // benen en schoenen
 c.lineCap='round';c.strokeStyle=lk.pants;c.lineWidth=7.4*h;c.beginPath();c.moveTo(-4.2*h,-42*h);c.lineTo(-4.2*h+sw,-3*h);c.moveTo(4.2*h,-42*h);c.lineTo(4.2*h-sw,-3*h);c.stroke();
 c.fillStyle='#07080a';c.beginPath();c.ellipse(-4.2*h+sw+fd*2*h,-1.6*h,5.4*h,2.6*h,0,0,7);c.ellipse(4.2*h-sw+fd*2*h,-1.6*h,5.4*h,2.6*h,0,0,7);c.fill();
 // arm aan de achterkant
 c.strokeStyle=dark;c.lineWidth=6.2*h;c.beginPath();c.moveTo(-11*h*fd,-84*h);c.lineTo((-14*h-sw*.45)*fd,-54*h);c.stroke();
 // jas: schouders, iets wijder aan de zoom
 const hem=lk.long?-30:-38;c.fillStyle=coat;c.beginPath();c.moveTo(-9*h,-95*h);c.quadraticCurveTo(-16.5*h,-93*h,-16*h,-82*h);c.lineTo(-15*h,hem*h);c.quadraticCurveTo(0,(hem+3)*h,15*h,hem*h);c.lineTo(16*h,-82*h);c.quadraticCurveTo(16.5*h,-93*h,9*h,-95*h);c.closePath();c.fill();
 c.fillStyle=dark;c.fillRect(-15*h,(hem-4)*h,30*h,4*h);c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=1.2*h;c.beginPath();c.moveTo(fd*2*h,-90*h);c.lineTo(fd*2*h,hem*h);c.stroke();
 // licht van de lantaarns op één schouder
 c.strokeStyle='rgba(255,214,160,.22)';c.lineWidth=1.6*h;c.beginPath();c.moveTo(9*h*fd,-94.5*h);c.quadraticCurveTo(16*h*fd,-92*h,15.6*h*fd,-80*h);c.stroke();
 if(lk.scarf){c.fillStyle=lk.scarf;c.fillRect(-8*h,-96*h,16*h,5*h)}
 if(p.kind==='guard'){c.fillStyle='#e8e6e0';c.beginPath();c.moveTo(-4*h,-95*h);c.lineTo(0,-86*h);c.lineTo(4*h,-95*h);c.fill();c.fillStyle='#050608';c.fillRect(-1*h,-92*h,2*h,10*h)}
 // nek en hoofd
 c.fillStyle=lk.skin;c.fillRect(-3.4*h,-99*h,6.8*h,5*h);c.beginPath();c.arc(0,-101*h,9.5*h,0,Math.PI*2);c.fill();
 c.fillStyle=lk.hair;c.beginPath();c.arc(0,-102.5*h,9.7*h,Math.PI*1.04,Math.PI*1.96);c.fill();
 if(p.face){c.fillStyle=lk.hair;c.beginPath();c.arc(0,-101*h,9.8*h,p.face>0?Math.PI*.5:-Math.PI*.5,p.face>0?Math.PI*1.5:Math.PI*.5);c.fill()}
 if(lk.hat==='hoed'){c.fillStyle='#16090b';c.beginPath();c.ellipse(0,-109*h,13*h,2.6*h,0,0,7);c.fill();c.beginPath();c.roundRect(-7.5*h,-121*h,15*h,12*h,[3*h,3*h,0,0]);c.fill();c.fillStyle='#3a1418';c.fillRect(-7.5*h,-112.5*h,15*h,2.2*h)}
 else if(lk.hat==='pet'){c.fillStyle=hitShade(coat.length===7?coat:'#556070',.55);c.beginPath();c.arc(0,-104*h,9.9*h,Math.PI,0);c.fill();c.fillRect(fd>0?3*h:-12*h,-105*h,9*h,2.4*h)}
 else if(lk.hat==='muts'){c.fillStyle=lk.scarf||'#3d4552';c.beginPath();c.arc(0,-104*h,10*h,Math.PI,0);c.fill();c.fillRect(-10*h,-106*h,20*h,3*h)}
 if(p.kind==='guard'){c.fillStyle='#050608';c.fillRect(-8*h,-104*h,16*h,4*h)}
 // arm aan de voorkant, hand, tas
 c.strokeStyle=coat;c.lineWidth=6.4*h;c.beginPath();c.moveTo(11*h*fd,-84*h);c.lineTo((15*h+sw*.45)*fd,-54*h);c.stroke();
 c.fillStyle=lk.skin;c.beginPath();c.arc((15*h+sw*.45)*fd,-51.5*h,2.8*h,0,7);c.fill();
 if(lk.bag){const bx=(15*h+sw*.45)*fd;c.fillStyle='#1b1712';c.beginPath();c.roundRect(bx-5*h,-50*h,10*h,12*h,2*h);c.fill()}
 if(p.kind==='me'){c.strokeStyle='rgba(169,220,255,.7)';c.lineWidth=1.4;c.beginPath();c.roundRect(-15*h,-95*h,30*h,57*h,7*h);c.stroke()}
 if((p.mode==='pause'||p.mode==='phone')&&p.kind==='target'&&!p.alarm){c.fillStyle='#9bd1ff';c.fillRect(7*h*(p.face<0?-1.6:1),-104*h,4*h,8*h)}
 c.restore()}
// knop die je ingedrukt kunt houden óf kort aantikt (aan, nog een tik = uit): nooit alleen "ingedrukt houden"
function hitHoldBtn(btn,set,on,pre){let id=null,t0=0,mode='';const st={sticky:false};
 btn.addEventListener('pointerdown',e=>{e.preventDefault();if(pre&&pre(e))return;if(id!==null)return;id=e.pointerId;try{btn.setPointerCapture(id)}catch(_){}
  if(st.sticky&&on()){st.sticky=false;mode='off';set(false);return}
  st.sticky=false;mode='hold';t0=performance.now();set(true)});
 const end=e=>{if(e.pointerId!==id)return;id=null;if(mode!=='hold')return;mode='';
  if(e.type==='pointerup'&&performance.now()-t0<260&&on()){st.sticky=true;return}set(false)};
 btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end);
 return st}
// canvas-resolutie: scherp, maar nooit meer dan ~2,6 miljoen pixels per frame
const hitDpr=(w,h)=>Math.max(1,Math.min(2,window.devicePixelRatio||1,Math.sqrt(2.6e6/Math.max(1,w*h))));
const hitReduced=()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};
// avondstraat met gevels, ramen en lantaarns (voor geweer, pistool en mes)
function hitStreet(b,R,W,top,ground){const sky=b.createLinearGradient(0,0,0,ground);sky.addColorStop(0,'#05070c');sky.addColorStop(1,'#131a26');b.fillStyle=sky;b.fillRect(0,0,W,ground);
 for(let i=0;i<W*.06;i++){b.fillStyle=`rgba(255,255,255,${.2+R()*.5})`;b.fillRect(R()*W,R()*top*.9,1.2,1.2)}
 let x=-10;while(x<W){const bw=70+R()*120,bh=170+R()*220,t=ground-bh;b.fillStyle=['#0d1119','#10151f','#0b0e15','#121825'][Math.floor(R()*4)];b.fillRect(x,t,bw,bh);
  b.fillStyle='rgba(0,0,0,.35)';b.fillRect(x+bw-6,t,6,bh);
  for(let wy=t+16;wy<ground-20;wy+=26)for(let wx=x+10;wx<x+bw-16;wx+=20){const on=R()<.32;b.fillStyle=on?`rgba(255,${180+Math.floor(R()*50)},${90+Math.floor(R()*60)},${.55+R()*.4})`:'rgba(40,52,70,.5)';b.fillRect(wx,wy,10,14)}
  x+=bw+R()*8}}
function hitLamp(b,lx,y0,ground,reach){b.fillStyle='#2b2f36';b.fillRect(lx-2,y0,4,ground-y0);b.fillRect(lx-2,y0,22,4);
 const g=b.createRadialGradient(lx+18,y0+6,2,lx+18,ground,150);g.addColorStop(0,'rgba(255,170,80,.42)');g.addColorStop(1,'rgba(255,170,80,0)');b.fillStyle=g;b.beginPath();b.moveTo(lx+12,y0+6);b.lineTo(lx-80,reach);b.lineTo(lx+120,reach);b.closePath();b.fill();
 b.fillStyle='#ffd39a';b.fillRect(lx+14,y0+4,8,4)}
function hitLayerOpen(html){try{const a=document.activeElement;if(a&&a!==document.body&&a.blur)a.blur()}catch(e){}window.__hitG=true;window.__chase=true;const L=document.createElement('div');L.id='hitLayer';L.innerHTML=html;document.body.appendChild(L);document.body.classList.add('hg-open');return L}
function hitLayerClose(L){L.remove();document.body.classList.remove('hg-open');window.__hitG=false;window.__chase=false}
function hitSetT(L,t,low){const v=Math.ceil(t);if(L._t===v)return;L._t=v;const e=L.querySelector('#hgT');e.textContent=v;e.classList.toggle('dn',t<low)}
const hitDbgOn=()=>{try{return localStorage.getItem('ow_debug')==='1'}catch(e){return false}};

// ---------- geweer en pistool ----------
// Geweer: ingezoomd vizier met wind (streepjes = punten wind). Pistool: de straat van dichtbij, grote en snelle mensen, rood richtpunt.
function hitGame(H,m){const PI=m==='pistool';return new Promise(resolve=>{
 const P=hitParams(H,PI?'pistool':'geweer'),ST=hitSteady(),NV=hitNerve(),W=1000,GH=600,seed=Math.floor(Math.random()*1e9);let rs=seed;const R=()=>(rs=(rs*1664525+1013904223)%4294967296)/4294967296;
 const L=hitLayerOpen(`<div class="hg ${PI?'hp':'hs'}">
  <div class="hg-top"><div><span class="label">${esc(H.n)} · ${esc(H.w)} · ${PI?'pistool':'geweer'}</span><b>Doelwit: ${esc(H.t)} <i class="hg-tag">rode jas</i></b></div>
   <div class="hg-k"><span>Tijd</span><b id="hgT">${P.time}</b></div><div class="hg-k"><span>Kogels</span><b id="hgB">${'●'.repeat(P.bullets)}</b></div>
   ${PI?'':'<div class="hg-k hg-wind"><span>Wind</span><b id="hgW">0</b></div>'}
   <div class="hg-k hg-br"><span>Adem</span><i><i id="hgA"></i></i></div><div class="hg-k hg-hand"><span>Hand</span><b class="h${NV.i}">${NV.name}</b></div><button class="btn ghost sm" id="hgQ">Opgeven</button></div>
  <div class="hg-stage" id="hgS"><canvas id="hgC"></canvas><div class="hg-msg" id="hgM"></div>
   <div class="hg-pad"><button class="hg-breath" id="hgBr">Adem<br><small>houden of tikken</small></button><button class="hg-fire" id="hgF">Vuur</button></div></div>
  <p class="hg-help" id="hgH"></p></div>`);
 const cv=L.querySelector('#hgC'),cx=cv.getContext('2d'),stage=L.querySelector('#hgS'),touch=matchMedia('(pointer:coarse)').matches,RM=hitReduced();
 L.querySelector('#hgH').innerHTML=PI?(touch?'Zoek de man in de <b>rode jas</b>. <b>Sleep</b> over het beeld om te richten en tik op <b>Vuur</b>. Na je eerste schot rent iedereen weg.':'Zoek de man in de <b>rode jas</b>. Richt met je muis en <b>klik</b> om te schieten. Na je eerste schot rent iedereen weg.')
  :(touch?'Zoek de man in de <b>rode jas</b>. <b>Sleep</b> om te richten, houd <b>Adem</b> ingedrukt (of tik hem aan en uit) voor rust en tik op <b>Vuur</b>. Elk streepje in het vizier is één punt wind.':'Zoek de man in de <b>rode jas</b>. Richt met je muis, houd <b>spatie</b> ingedrukt voor een rustig vizier en <b>klik</b>. Elk streepje in het vizier is één punt wind: richt tegen de wind in.');
 // achtergrond: gevels met ramen, lantaarns, stoep (één keer tekenen)
 const bg=document.createElement('canvas');bg.width=W*2;bg.height=GH*2;const b=bg.getContext('2d');b.scale(2,2);
 hitStreet(b,R,W,180,430);
 const road=b.createLinearGradient(0,430,0,GH);road.addColorStop(0,'#1a1d23');road.addColorStop(.35,'#15171c');road.addColorStop(1,'#0c0d10');b.fillStyle=road;b.fillRect(0,430,W,GH-430);
 b.fillStyle='#2a2d34';b.fillRect(0,428,W,4);b.fillStyle='#22252b';b.fillRect(0,538,W,3);
 for(let i=0;i<W;i+=60){b.fillStyle='rgba(255,255,255,.035)';b.fillRect(i,432,1,106)}
 for(let lx=90;lx<W;lx+=230+R()*60)hitLamp(b,lx,300,430,540);
 // dekking: geparkeerde auto's en een kiosk (staan vóór de mensen). Pistool: alles dichterbij en groter.
 const covers=[],cf=PI?1.38:1;if(P.cover){const n=2+(H.d>=5?1:0);for(let i=0;i<n;i++){const cxp=150+i*(700/n)+R()*120;covers.push({x:cxp,w:120*cf,y:PI?512:470,h:58*cf+(PI?8:0),k:'car',c:['#2c3440','#3a2f2f','#2f3a33','#1f2430'][i%4]})}
  if(H.d>=4)covers.push({x:560+R()*200,w:46*cf,y:PI?420:400,h:128*cf,k:'kiosk',c:'#232833'})}
 // mensen: het doelwit (rode jas), omstanders en lijfwachten
 // drie stroken (diepte): achter (kleiner, achter het doelwit), midden (het doelwit) en voor (groter, loopt vóór hem langs).
 // [y, spreiding y, schaal, spreiding schaal]. Wie lager staat, staat dichterbij en wordt eerst geraakt.
 const LN=PI?{back:[540,10,1.2,.08],mid:[576,12,1.48,.1],front:[601,3,1.78,.08]}:{back:[494,8,.84,.05],mid:[518,10,.98,.08],front:[552,6,1.24,.06]};
 const inLane=(p,ln)=>{const L0=LN[ln];p.lane=ln;p.y=L0[0]+R()*L0[1];p.sc=L0[2]+R()*L0[3];p.ty=p.y;p.tsc=p.sc};
 const passV=p=>P.speed*(.8+R()*.5)*(p.lane==='front'?1.15:.85);
 const mk=(kind,ln)=>{const p={kind,x:kind==='target'?(R()<.5?120:880):80+R()*840,v:P.speed*(kind==='target'?1:.8+R()*.5),dir:R()<.5?-1:1,mode:'walk',tx:80+R()*840,tm:0,ph:R()*6,
   col:kind==='guard'?'#15171c':HIT_CIV_COATS[Math.floor(R()*HIT_CIV_COATS.length)],alarm:false,gone:false};inLane(p,ln);
  if(kind==='civ'&&ln!=='mid'){p.pass=true;p.x=R()*W;p.v=passV(p);p.next=1+R()*6;p.stop=0;p.wait=0}
  if(kind==='guard'){p.off=(R()<.5?-1:1)*(40+R()*50);p.tm=1+R()*2}return p};
 // LINGER: kans dat een voorbijganger vóór het doelwit even blijft staan; CLUSTER: kans dat iemand naast hem gaat lopen
 const LINGER=[0,0,.25,.35,.45,.55][H.d-1],CLUSTER=[0,0,.3,.4,.5,.6][H.d-1];
 const people=[mk('target','mid')],rest=P.civ-P.front,nMid=Math.round(rest*.35);
 for(let i=0;i<P.civ;i++)people.push(mk('civ',i<P.front?'front':i<P.front+nMid?'mid':'back'));
 const T=people[0];for(let i=0;i<P.guards;i++){const g=mk('guard','mid');g.x=T.x+g.off;people.push(g)}
 // wind (alleen geweer): langzaam draaiend met vlagen; DRIFT = wereldpixels opzij per punt wind
 const wB=(R()*2-1)*(P.wind||0)*.7,wP=[R()*6,R()*6],DRIFT=7;
 const windAt=u=>PI?0:Math.max(-P.wind,Math.min(P.wind,wB+P.wind*(.32*Math.sin(u*.45+wP[0])+.14*Math.sin(u*1.35+wP[1]))));
 // vizier
 const aim={x:500,y:PI?470:420},sway={ph:[R()*6,R()*6,R()*6,R()*6,R()*6,R()*6,R()*6,R()*6]};let breath=1,holding=false,winded=0,recoil=0,flash=0,bullets=P.bullets,tLeft=P.time,over=false,result=null,last=performance.now(),t0=last,shots=[],wTxt='';
 let cw=0,ch=0,s=1,camX=0,viewW=W,dpr=1;
 let rect=null;function size(){const r=stage.getBoundingClientRect();cw=r.width;ch=r.height;dpr=hitDpr(cw,ch);cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+'px';cv.style.height=ch+'px';s=ch/GH;viewW=Math.min(W,cw/s);if(cw/s>W){s=cw/W;viewW=W}rect=cv.getBoundingClientRect()}
 size();const ro=new ResizeObserver(size);ro.observe(stage);
 const cam=()=>{camX=Math.max(0,Math.min(W-viewW,aim.x-viewW/2))};
 const swayK=()=>P.sway*ST.k*(holding&&breath>0?.16:winded>0?1.45:1);
 // trillen: snelle bibber (7 tot 15 Hz) die met adem inhouden maar een beetje minder wordt
 const tremK=()=>NV.amp*(holding&&breath>0?.7:winded>0?1.35:1);
 const shotPt=t=>{const A=swayK(),u=t/1000,p=sway.ph,B=tremK();
  return {x:aim.x+A*(.62*Math.sin(u*1.15+p[0])+.38*Math.sin(u*2.45+p[1]))+B*(.5*Math.sin(u*44+p[4])+.3*Math.sin(u*67+p[5])+.2*Math.sin(u*97+p[6])),
   y:aim.y+A*.8*(.6*Math.sin(u*1.42+p[2])+.4*Math.sin(u*3.05+p[3]))+B*(.5*Math.sin(u*51+p[7])+.3*Math.sin(u*73+p[5]*1.7)+.2*Math.sin(u*89+p[4]*.6))-recoil}};
 if(hitDbgOn())window.__hitDbg={T,people,aim,covers,P,DRIFT,PI,shot:()=>{const t=performance.now()-t0,q=shotPt(t);q.x+=windAt(t/1000)*DRIFT;return q},test:q=>hitTest(q),get over(){return over},get breath(){return breath},get holding(){return holding},get s(){return s},get camX(){return camX},get swayK(){return swayK()},get trem(){return tremK()},get wind(){return windAt((performance.now()-t0)/1000)},win:z=>finish({ok:true,zone:z||'body'},'Raak'),fail:w=>finish({ok:false,why:w||'missed'})};
 // invoer
 let drag=null;
 const toWorld=(px,py)=>({x:camX+px/s,y:py/s});
 cv.addEventListener('pointermove',e=>{if(over)return;const r=rect;if(e.pointerType==='mouse'){const w=toWorld(e.clientX-r.left,e.clientY-r.top);aim.x=w.x;aim.y=w.y}
  else if(drag&&e.pointerId===drag.id){const k=1.05/s;aim.x=Math.max(0,Math.min(W,aim.x+(e.clientX-drag.x)*k));aim.y=Math.max(60,Math.min(GH-10,aim.y+(e.clientY-drag.y)*k));drag.x=e.clientX;drag.y=e.clientY}});
 cv.addEventListener('pointerdown',e=>{if(over)return;rect=cv.getBoundingClientRect();if(e.pointerType==='mouse'){if(e.button===0){const w=toWorld(e.clientX-rect.left,e.clientY-rect.top);aim.x=w.x;aim.y=w.y;fire()}}else if(e.isPrimary||!drag){drag={x:e.clientX,y:e.clientY,id:e.pointerId};cv.setPointerCapture(e.pointerId)}});
 const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null};cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);
 cv.addEventListener('contextmenu',e=>e.preventDefault());
 const bBtn=L.querySelector('#hgBr'),fBtn=L.querySelector('#hgF'),elB=L.querySelector('#hgB'),elA=L.querySelector('#hgA'),elW=L.querySelector('#hgW');let aW=-1,aLow=null;
 const hold=v=>{holding=v&&breath>0&&!winded;bBtn.classList.toggle('on',holding)};
 hitHoldBtn(bBtn,hold,()=>holding);
 fBtn.addEventListener('pointerdown',e=>{e.preventDefault();fire()});
 const kd=e=>{if(over)return;if(e.code==='Space'||e.key==='Shift'){e.preventDefault();if(!e.repeat)hold(true)}if(e.key==='Enter'||e.key==='f'){e.preventDefault();fire()}if(e.key==='Escape')finish({ok:false,why:'quit'})};
 const ku=e=>{if(e.code==='Space'||e.key==='Shift')hold(false)};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 L.querySelector('#hgQ').onclick=()=>finish({ok:false,why:'quit'});
 // treffer bepalen: eerst dekking, dan wie het dichtst bij staat
 const zones=p=>{const h=p.sc,fy=p.y;return {head:{x:p.x,y:fy-101*h,r:9.5*h},body:{x:p.x-14*h,y:fy-90*h,w:28*h,h:50*h},legs:{x:p.x-12*h,y:fy-40*h,w:24*h,h:40*h}}};
 // alles op diepte: mensen op hun voeten (y), dekking op de onderkant. Wat het dichtst bij staat, vangt het schot.
 const depth=o=>o.k?o.y+o.h:o.y;
 function hitTest(q){const order=people.filter(p=>!p.gone).concat(covers).sort((a,b)=>depth(b)-depth(a));
  for(const p of order){if(p.k){if(q.x>=p.x&&q.x<=p.x+p.w&&q.y>=p.y&&q.y<=p.y+p.h)return {who:null,zone:'cover'};continue}
   const z=zones(p);if(Math.hypot(q.x-z.head.x,q.y-z.head.y)<=z.head.r)return {who:p,zone:'head'};
   if(q.x>=z.body.x&&q.x<=z.body.x+z.body.w&&q.y>=z.body.y&&q.y<=z.body.y+z.body.h)return {who:p,zone:'body'};
   if(q.x>=z.legs.x&&q.x<=z.legs.x+z.legs.w&&q.y>=z.legs.y&&q.y<=z.legs.y+z.legs.h)return {who:p,zone:'legs'}}
  return {who:null,zone:'miss'}}
 function msg(t,cls){const m_=L.querySelector('#hgM');m_.className='hg-msg on '+(cls||'');m_.innerHTML=t;clearTimeout(msg.t);msg.t=setTimeout(()=>{if(!over)m_.className='hg-msg'},1200)}
 function fire(){if(over||bullets<=0||recoil>(PI?10:4))return;const t=performance.now()-t0,q=shotPt(t);q.x+=windAt(t/1000)*DRIFT;bullets--;recoil=PI?32:26;flash=1;shots.push({x:q.x,y:q.y,t:performance.now()});
  try{SFX.shot()}catch(e){}if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
  elB.textContent='●'.repeat(bullets)+'○'.repeat(P.bullets-bullets);
  const h=hitTest(q);
  if(h.who&&h.who!==T&&(h.zone!=='legs'||h.who.kind==='civ')){h.who.down=performance.now();return finish({ok:false,why:'civilian'},'Je raakt een '+(h.who.kind==='guard'?'lijfwacht':'omstander')+'!')}
  if(h.who===T&&h.zone!=='legs'){T.down=performance.now();return finish({ok:true,zone:h.zone},h.zone==='head'?'Hoofdschot':'Raak')}
  // mis (of alleen in de benen): doelwit gewaarschuwd, iedereen rent
  people.forEach(p=>{p.alarm=true;p.mode='flee';p.dir=p.x<500?-1:1;p.v=p.kind==='target'?P.speed*2.5:P.speed*1.8});
  if(bullets<=0)return finish({ok:false,why:'missed'},h.zone==='legs'?'Alleen in zijn been':h.zone==='cover'?'Je raakt de dekking':'Mis');
  msg(h.zone==='legs'?'In zijn been. Hij rent!':h.zone==='cover'?'Je raakt de dekking. Hij rent!':'Mis! Hij rent weg.','bad')}
 function finish(res,text){if(over)return;over=true;result=res;hold(false);
  msg(res.ok?`<b>${text||'Raak'}</b><span>${esc(H.t)} is uitgeschakeld</span>`:`<b>${text||(res.why==='escaped'?'Ontkomen':'Afgebroken')}</b><span>${res.why==='escaped'?'Het doelwit is weg':res.why==='quit'?'Contract afgebroken':res.why==='civilian'?'De politie komt eraan':'Het doelwit is gewaarschuwd'}</span>`,res.ok?'ok':'bad');
  setTimeout(close,res.ok?1500:1300)}
 function close(){cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);hitLayerClose(L);resolve(result)}
 // beweging
 function step(dt){people.forEach(p=>{if(p.gone||p.down)return;p.ph+=dt*p.v/9;
   if(p.mode==='flee'){p.x+=p.dir*p.v*dt;if(p.x<-40||p.x>W+40){p.gone=true;if(p===T&&!over)finish({ok:false,why:'escaped'},'Ontkomen')}return}
   // voorbijgangers: lopen door, blijven soms even staan en komen later van een van beide kanten terug
   if(p.pass){if(p.wait>0){p.wait-=dt;if(p.wait<=0){p.dir=R()<.5?1:-1;p.x=p.dir>0?-45:W+45;p.v=passV(p)}return}
    if(p.stop>0){p.stop-=dt;p.mode='pause';return}
    p.next-=dt;if(p.next<=0){p.next=4+R()*7;if(p.x>60&&p.x<W-60&&R()<.45){p.stop=.8+R()*1.8;p.mode='pause';return}}
    // drukte rond een zwaar doelwit: wie vlak vóór hem langsloopt, blijft soms even staan (kerkgangers, toeristen)
    const dT=Math.abs(p.x-T.x);if(dT>120)p.near=false;else if(!p.near&&dT<22&&!T.alarm){p.near=true;if(p.lane==='front'&&R()<LINGER){p.stop=.7+R()*1.5;p.mode='pause';return}}
    p.mode='walk';p.x+=p.dir*p.v*dt;if(p.x<-50||p.x>W+50)p.wait=.3+R()*2.2;return}
   // lijfwachten: blijven bij het doelwit en stappen soms vóór hem
   if(p.kind==='guard'){p.tm-=dt;if(p.tm<=0){p.tm=1.8+R()*2.6;p.off=(R()<.5?-1:1)*(28+R()*60);const L0=LN[R()<.4?'front':'mid'];p.ty=L0[0]+R()*L0[1];p.tsc=L0[2]+R()*L0[3]}
    const k=Math.min(1,dt*2.5);p.y+=(p.ty-p.y)*k;p.sc+=(p.tsc-p.sc)*k;const dx=T.x+p.off-p.x;if(Math.abs(dx)<3){p.mode='stand';return}
    p.dir=dx<0?-1:1;p.x+=p.dir*Math.min(Math.abs(dx),p.v*1.25*dt);p.mode='walk';return}
   if(p.mode==='pause'){p.tm-=dt;if(p.tm<=0){p.mode='walk';p.tx=p.kind==='civ'&&R()<CLUSTER?Math.max(60,Math.min(940,T.x+(R()*2-1)*110)):60+R()*880}return}
   const dx=p.tx-p.x;p.dir=dx<0?-1:1;p.x+=p.dir*Math.min(Math.abs(dx),p.v*dt);
   if(Math.abs(dx)<2){p.mode='pause';p.tm=(p.kind==='target'?.7:.4)+R()*(p.kind==='target'?2.2-H.d*.25:2)}});
  if(holding){breath=Math.max(0,breath-dt/3.2);if(breath<=0){hold(false);winded=1.6}}else breath=Math.min(1,breath+dt/(winded>0?4:2.4));
  if(winded>0)winded=Math.max(0,winded-dt);recoil=Math.max(0,recoil-dt*60);flash=Math.max(0,flash-dt*6);
  if(!over){tLeft-=dt;if(tLeft<=0){tLeft=0;people.forEach(p=>{p.mode='flee';p.dir=p.x<500?-1:1;p.v*=1.6});finish({ok:false,why:'escaped'},'Te laat')}}}
 // tekenen
 function car(c,o){c.fillStyle=o.c;c.beginPath();c.roundRect(o.x,o.y+14*cf,o.w,o.h-22*cf,8);c.fill();c.beginPath();c.roundRect(o.x+22*cf,o.y,o.w-46*cf,24*cf,8);c.fill();
  c.fillStyle='rgba(150,190,230,.18)';c.fillRect(o.x+28*cf,o.y+5*cf,o.w-58*cf,14*cf);c.fillStyle='#08090b';c.beginPath();c.arc(o.x+24*cf,o.y+o.h-6*cf,10*cf,0,7);c.arc(o.x+o.w-24*cf,o.y+o.h-6*cf,10*cf,0,7);c.fill();
  c.fillStyle='rgba(255,200,120,.6)';c.fillRect(o.x+o.w-6,o.y+22*cf,5,6*cf)}
 function kiosk(c,o){c.fillStyle=o.c;c.fillRect(o.x,o.y,o.w,o.h);c.fillStyle='#ff7a1a';c.fillRect(o.x,o.y,o.w,10);c.fillStyle='rgba(255,255,255,.06)';c.fillRect(o.x+6,o.y+18,o.w-12,40)}
 // x0..x1: alleen tekenen wat in beeld is (het vizier ziet maar een klein stuk)
 function world(c,now,x0,x1){c.drawImage(bg,0,0,W,GH);scene.forEach(o=>{if(o.k)return o.k==='car'?car(c,o):kiosk(c,o);if(o.x>x0-40&&o.x<x1+40)hitPerson(c,o,now)});
  shots.forEach(q=>{const a=Math.max(0,1-(now-q.t)/1400);if(a>0){c.fillStyle=`rgba(255,230,180,${a})`;c.beginPath();c.arc(q.x,q.y,2.4,0,7);c.fill()}})}
 let raf=0;
 let scene=[];
 function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);cam();scene=people.concat(covers).sort((a,b)=>depth(a)-depth(b));
  const q=shotPt(now-t0),wv=windAt((now-t0)/1000);
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,cw,ch);
  if(PI){
   // pistool: de straat van dichtbij, rood richtpunt
   cx.save();cx.scale(s,s);cx.translate(-camX,0);world(cx,now,camX,camX+viewW);cx.restore();
   const vg=cx.createRadialGradient(cw/2,ch/2,Math.min(cw,ch)*.35,cw/2,ch/2,Math.max(cw,ch)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');cx.fillStyle=vg;cx.fillRect(0,0,cw,ch);
   const sx=(q.x-camX)*s,sy=q.y*s;cx.strokeStyle='rgba(0,0,0,.6)';cx.lineWidth=4;cx.beginPath();cx.arc(sx,sy,13,0,7);cx.stroke();
   cx.strokeStyle='rgba(255,61,82,.95)';cx.lineWidth=1.8;cx.beginPath();cx.arc(sx,sy,13,0,7);cx.stroke();
   cx.beginPath();[[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b2])=>{cx.moveTo(sx+a*18,sy+b2*18);cx.lineTo(sx+a*28,sy+b2*28)});cx.stroke();
   cx.fillStyle='#ff3d52';cx.beginPath();cx.arc(sx,sy,2.2,0,7);cx.fill();
  }else{
   // breed beeld (gedimd) en het vizier: ingezoomd beeld in een cirkel
   cx.save();cx.scale(s,s);cx.translate(-camX,0);world(cx,now,camX,camX+viewW);cx.restore();
   cx.fillStyle='rgba(3,4,6,.55)';cx.fillRect(0,0,cw,ch);
   const Z=2.6,Rr=Math.min(cw,ch)*(cw<600?.36:.3),sx=(q.x-camX)*s,sy=q.y*s;
   cx.save();cx.beginPath();cx.arc(sx,sy,Rr,0,Math.PI*2);cx.clip();cx.translate(sx,sy);cx.scale(s*Z,s*Z);cx.translate(-q.x,-q.y);world(cx,now,q.x-Rr/(s*Z),q.x+Rr/(s*Z));cx.restore();
   const vg=cx.createRadialGradient(sx,sy,Rr*.55,sx,sy,Rr);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');cx.fillStyle=vg;cx.beginPath();cx.arc(sx,sy,Rr,0,7);cx.fill();
   cx.strokeStyle='rgba(0,0,0,.9)';cx.lineWidth=Math.max(6,Rr*.07);cx.beginPath();cx.arc(sx,sy,Rr,0,7);cx.stroke();
   cx.strokeStyle='rgba(255,61,82,.85)';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(sx-Rr,sy);cx.lineTo(sx-6,sy);cx.moveTo(sx+6,sy);cx.lineTo(sx+Rr,sy);cx.moveTo(sx,sy-Rr);cx.lineTo(sx,sy-6);cx.moveTo(sx,sy+6);cx.lineTo(sx,sy+Rr);cx.stroke();
   // windstreepjes: elk streepje = één punt wind
   const tk=DRIFT*s*Z;cx.lineWidth=1.3;for(let k=1;k<=5;k++)[-1,1].forEach(sg=>{const x=sx+sg*k*tk;if(k*tk<Rr*.9){const hh=k%2?4:7;cx.beginPath();cx.moveTo(x,sy-hh);cx.lineTo(x,sy+hh);cx.stroke()}});
   cx.lineWidth=3;cx.strokeStyle='rgba(0,0,0,.8)';[[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b2])=>{cx.beginPath();cx.moveTo(sx+a*Rr*.62,sy+b2*Rr*.62);cx.lineTo(sx+a*Rr,sy+b2*Rr);cx.stroke()});
   cx.fillStyle='rgba(255,61,82,.95)';cx.beginPath();cx.arc(sx,sy,1.8,0,7);cx.fill();
   const wt=Math.abs(wv).toFixed(1).replace('.',',');cx.font='600 12px "JetBrains Mono",ui-monospace,monospace';cx.textAlign='center';cx.fillStyle='rgba(235,232,226,.82)';
   cx.fillText((wv<-.05?'◂ ':'')+'wind '+wt+(wv>.05?' ▸':''),sx,sy-Rr*.7);
  }
  if(flash>0&&!RM){cx.fillStyle=`rgba(255,220,160,${flash*(PI?.25:.35)})`;cx.fillRect(0,0,cw,ch)}
  // doelwit buiten beeld: pijltje
  if(!T.gone&&(T.x<camX||T.x>camX+viewW)){const left=T.x<camX;cx.fillStyle='#ff3d52';cx.beginPath();const ay=T.y*s-60*s*T.sc;if(left){cx.moveTo(10,ay);cx.lineTo(24,ay-10);cx.lineTo(24,ay+10)}else{cx.moveTo(cw-10,ay);cx.lineTo(cw-24,ay-10);cx.lineTo(cw-24,ay+10)}cx.fill()}
  hitSetT(L,tLeft,6);
  if(!PI){const t2=(wv<-.05?'← ':wv>.05?'→ ':'')+Math.abs(wv).toFixed(1).replace('.',',');if(t2!==wTxt){wTxt=t2;elW.textContent=t2}}
  const aw=Math.round(breath*100),lo=winded>0;if(aw!==aW){aW=aw;elA.style.width=aw+'%'}if(lo!==aLow){aLow=lo;elA.classList.toggle('low',lo)}
  raf=requestAnimationFrame(frame)}
 raf=requestAnimationFrame(frame)})}

// ---------- mes ----------
// Sluipen over de stoep. Hij kijkt af en toe om (eerst een ! boven zijn hoofd). Beweeg je dan, of sta je dichtbij in het licht,
// dan stijgt zijn argwaan. In een donkere portiek zie je onzichtbaar. Belt hij, dan let hij niet op. Dichtbij: toeslaan op de ring.
function hitKnife(H){return new Promise(resolve=>{
 const P=hitParams(H,'mes'),NV=hitNerve(),WW=2600,GH=600,LANE=548,BAND=.38,BS=1.5;let rs=Math.floor(Math.random()*1e9);const R=()=>(rs=(rs*1664525+1013904223)%4294967296)/4294967296;
 const touch=matchMedia('(pointer:coarse)').matches;
 const L=hitLayerOpen(`<div class="hg hk">
  <div class="hg-top"><div><span class="label">${esc(H.n)} · ${esc(H.w)} · mes</span><b>Doelwit: ${esc(H.t)} <i class="hg-tag">rode jas</i></b></div>
   <div class="hg-k"><span>Tijd</span><b id="hgT">${P.time}</b></div>
   <div class="hg-k hg-sus"><span>Argwaan</span><i><i id="hkSu"></i></i></div>
   <div class="hg-k hg-hand"><span>Hand</span><b class="h${NV.i}">${NV.name}</b></div><button class="btn ghost sm" id="hgQ">Opgeven</button></div>
  <div class="hg-stage" id="hgS"><canvas id="hgC"></canvas><div class="hg-msg" id="hgM"></div>
   <div class="hg-pad"><button class="hg-breath hk-go" id="hkGo">Sluip<br><small>houden of tikken</small></button><button class="hg-fire hk-hit" id="hkHit" disabled>Toe&shy;slaan</button></div></div>
  <p class="hg-help">${touch?'Houd <b>Sluip</b> ingedrukt (of tik hem aan en uit) om dichterbij te komen. Zie je een <b>!</b> boven zijn hoofd, laat dan los, liefst in het donker van een portiek. Dichtbij: tik op <b>Toeslaan</b> en nog een keer als de ring in het groen staat.'
   :'Houd de <b>muisknop</b>, <b>spatie</b> of <b>→</b> ingedrukt om dichterbij te sluipen. Zie je een <b>!</b> boven zijn hoofd, sta dan stil, liefst in het donker van een portiek. Dichtbij: <b>klik</b> of druk op <b>E</b>, en nog een keer als de ring in het groen staat.'}</p></div>`);
 const cv=L.querySelector('#hgC'),cx=cv.getContext('2d'),stage=L.querySelector('#hgS'),goB=L.querySelector('#hkGo'),hitB=L.querySelector('#hkHit'),elSu=L.querySelector('#hkSu');let suW=-1;
 // decor: portieken (schaduw), lantaarns, gevels, zijn auto aan het eind
 const shadows=[];{const n=P.shadows,gap=(WW-760)/n;for(let i=0;i<n;i++){const w=60+R()*28;shadows.push({x:330+i*gap+R()*(gap-w-60),w})}}
 const END=WW-190;
 const bg=document.createElement('canvas');bg.width=WW*BS;bg.height=GH*BS;const b=bg.getContext('2d');b.scale(BS,BS);
 hitStreet(b,R,WW,190,470);
 shadows.forEach(z=>{b.fillStyle='#030406';b.fillRect(z.x,372,z.w,98);b.fillStyle='#1b2029';b.fillRect(z.x-5,366,z.w+10,6);b.fillRect(z.x-5,366,5,104);b.fillRect(z.x+z.w,366,5,104);
  const g=b.createLinearGradient(0,372,0,470);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');b.fillStyle=g;b.fillRect(z.x,372,z.w,98)});
 const side=b.createLinearGradient(0,470,0,GH);side.addColorStop(0,'#1c1f25');side.addColorStop(.5,'#16181d');side.addColorStop(1,'#0c0d10');b.fillStyle=side;b.fillRect(0,470,WW,GH-470);
 b.fillStyle='#2a2d34';b.fillRect(0,468,WW,3);b.fillStyle='#262930';b.fillRect(0,566,WW,4);b.fillStyle='#0b0c0f';b.fillRect(0,570,WW,30);
 for(let i=0;i<WW;i+=56){b.fillStyle='rgba(255,255,255,.03)';b.fillRect(i,471,1,95)}
 for(let lx=200;lx<WW-120;lx+=280+R()*90)hitLamp(b,lx,330,566,566);
 // zijn auto
 b.fillStyle='#262c36';b.beginPath();b.roundRect(END+18,512,150,44,8);b.fill();b.beginPath();b.roundRect(END+44,490,92,30,8);b.fill();b.fillStyle='rgba(150,190,230,.16)';b.fillRect(END+52,496,76,16);
 b.fillStyle='#07080a';b.beginPath();b.arc(END+48,556,12,0,7);b.arc(END+138,556,12,0,7);b.fill();b.fillStyle='rgba(255,210,140,.75)';b.fillRect(END+163,522,6,8);
 // mensen
 const me={x:150,y:LANE+6,sc:1.04,kind:'me',ph:0,mode:'stand',face:1,dir:1};
 const T={x:560,y:LANE,sc:1,kind:'target',ph:0,mode:'walk',face:1,dir:1,next:2.4+R()*2,warn:0,look:0,phone:3.6+R()*3,ptm:0};
 const obs=[T];let G=null;if(P.guards){G={x:T.x+92,y:LANE-3,sc:1.03,kind:'guard',col:'#15171c',ph:0,mode:'walk',face:1,dir:1,next:3.4+R()*2,warn:0,look:0};obs.push(G)}
 let going=false,sus=0,tLeft=P.time,over=false,result=null,qte=null,last=performance.now(),cw=0,ch=0,s=1,viewW=900,camX=0,oy=0,dpr=1,raf=0;
 function size(){const r=stage.getBoundingClientRect();cw=r.width;ch=r.height;dpr=hitDpr(cw,ch);cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+'px';cv.style.height=ch+'px';
  s=Math.min(ch/GH,cw/(cw<600?600:720));viewW=Math.min(WW,cw/s);oy=Math.max(0,(ch-GH*s)/2)}
 size();const ro=new ResizeObserver(size);ro.observe(stage);
 const inShadow=x=>shadows.some(z=>x>=z.x-4&&x<=z.x+z.w+4);
 const dist=()=>T.x-me.x,inRange=()=>dist()<=58;
 if(hitDbgOn())window.__hitDbg={T,me,G,obs,shadows,P,get sus(){return sus},set sus(v){sus=v},get qte(){return qte},win:z=>finish({ok:true,zone:z||'body'},'Raak'),fail:w=>finish({ok:false,why:w||'spotted'})};
 function msg(t,cls,keep){const m_=L.querySelector('#hgM');m_.className='hg-msg on '+(cls||'');m_.innerHTML=t;clearTimeout(msg.t);if(!keep)msg.t=setTimeout(()=>{if(!over)m_.className='hg-msg'},1100)}
 // invoer: sluipen (ingedrukt houden) en toeslaan
 const setGo=v=>{going=v&&!over;goB.classList.toggle('on',going)};
 function strike(){if(over)return;if(qte){qtePress();return}if(!inRange())return;
  qte={t:0,dur:P.qDur,tol:P.tol*(T.look>0?.5:1)};setGo(false);try{SFX.click()}catch(e){}hitB.textContent='Nu!'}
 function qtePress(){if(!qte||qte.done)return;const r=1-qte.t/qte.dur,e=Math.abs(r-BAND);qte.done=true;
  if(e<=qte.tol*.4){T.down=performance.now();return finish({ok:true,zone:'head'},'Zuiver')}
  if(e<=qte.tol){T.down=performance.now();return finish({ok:true,zone:'body'},'Raak')}
  flee();finish({ok:false,why:'struggle'},'Hij worstelt zich los')}
 function flee(){obs.forEach(o=>{o.look=0;o.warn=0;o.mode='flee';o.face=1})}
 hitHoldBtn(goB,setGo,()=>going,()=>{if(qte||over){strike();return true}return false});
 hitB.addEventListener('pointerdown',e=>{e.preventDefault();strike()});
 cv.addEventListener('pointerdown',e=>{if(over)return;if(qte){strike();return}if(e.pointerType==='mouse'&&e.button===0){if(inRange()){strike();return}setGo(true);cv.setPointerCapture(e.pointerId)}});
 cv.addEventListener('pointerup',()=>setGo(false));cv.addEventListener('pointercancel',()=>setGo(false));cv.addEventListener('contextmenu',e=>e.preventDefault());
 const kd=e=>{if(over)return;const k=e.key;if(e.code==='Space'||k==='ArrowRight'||k==='d'||k==='D'){e.preventDefault();if(qte){if(!e.repeat)strike()}else setGo(true)}
  if(k==='e'||k==='E'||k==='Enter'||k==='f'||k==='F'){e.preventDefault();if(!e.repeat)strike()}if(k==='Escape')finish({ok:false,why:'quit'})};
 const ku=e=>{if(e.code==='Space'||e.key==='ArrowRight'||e.key==='d'||e.key==='D')setGo(false)};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);
 L.querySelector('#hgQ').onclick=()=>finish({ok:false,why:'quit'});
 // omkijken: waarschuwing (!) → kijken (blikveld) → verder lopen. Belt hij, dan kijkt hij niet om.
 function stepObs(o,dt){if(o.mode==='flee'){o.x+=P.vT*3.2*dt;o.ph+=dt*P.vT*3.2/9;o.face=1;return}
  if(o.look>0){o.look-=dt;o.face=-1;o.mode='look';if(o.look<=0){o.face=1;o.mode='walk';o.next=P.g0+R()*(P.g1-P.g0)}return}
  const busy=o===T&&o.ptm>0;
  if(o.warn>0){o.warn-=dt;if(o.warn<=0){o.look=P.look;o.face=-1;o.mode='look';try{SFX.tick()}catch(e){}return}}
  else if(!busy){o.next-=dt;if(o.next<=0)o.warn=P.warn}
  if(busy){o.ptm-=dt;o.mode='phone';if(o.ptm<=0)o.phone=5+R()*4;return}
  if(o===T){o.phone-=dt;if(o.phone<=0&&o.warn<=0){o.ptm=1.5+R()*1.5;o.mode='phone';return}}
  if(o!==T&&o.x>T.x+96){o.mode='pause';return}
  const v=P.vT*(o.warn>0?.55:1);o.x+=v*dt;o.ph+=dt*v/9;o.mode='walk'}
 function step(dt){if(qte){qte.t+=dt;if(qte.t>=qte.dur&&!qte.done){qte.done=true;flee();finish({ok:false,why:'struggle'},'Te laat')}return}
  obs.forEach(o=>stepObs(o,dt));
  const moving=going&&me.x<T.x-34;me.moving=going;if(going){me.x=Math.min(T.x-34,me.x+P.vP*dt);me.ph+=dt*P.vP/9;me.mode='walk'}else me.mode='stand';
  let looking=false;obs.forEach(o=>{if(o.look>0){looking=true;const d=o.x-me.x;if(d>0&&d<P.view){const close=1+1.6*(1-d/P.view),hid=!going&&inShadow(me.x);sus+=dt*(going?64:hid?0:8)*close}}});
  if(!looking)sus=Math.max(0,sus-dt*5);
  if(sus>=100){sus=100;flee();return finish({ok:false,why:'spotted'},'Gezien')}
  tLeft-=dt;if(tLeft<=0){tLeft=0;flee();return finish({ok:false,why:'escaped'},'Te laat')}
  if(T.x>=END){flee();return finish({ok:false,why:'escaped'},'Hij stapt in zijn auto')}
  if(moving&&me.x>=T.x-35&&!inRange())setGo(false)}
 function finish(res,text){if(over)return;over=true;result=res;setGo(false);hitB.disabled=true;
  msg(res.ok?`<b>${text||'Raak'}</b><span>${esc(H.t)} is uitgeschakeld</span>`:`<b>${text||'Mislukt'}</b><span>${res.why==='quit'?'Contract afgebroken':res.why==='struggle'?'Hij rent weg':res.why==='spotted'?'Hij heeft je gezien en rent weg':'Het doelwit is weg'}</span>`,res.ok?'ok':'bad',1);
  try{res.ok?SFX.win(3):SFX.lose()}catch(e){}
  setTimeout(close,res.ok?1500:1400)}
 function close(){cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);hitLayerClose(L);resolve(result)}
 function mark(c,o,col,txt){const y=o.y-138*o.sc;c.fillStyle=col;c.beginPath();c.moveTo(o.x,y+12);c.lineTo(o.x-9,y-4);c.lineTo(o.x+9,y-4);c.closePath();c.fill();
  c.fillStyle='#0a0b0e';c.font='800 13px "Big Shoulders Text","Arial Narrow",sans-serif';c.textAlign='center';c.fillText(txt,o.x,y+3)}
 function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(!over)step(dt);else obs.forEach(o=>{if(o.mode==='flee')stepObs(o,dt)});
  // camera: jij links in beeld, maar schuif mee zodat hij (en zijn !) ook in beeld blijft als dat past
  camX=Math.max(0,Math.min(WW-viewW,Math.min(me.x-30,Math.max(me.x-viewW*.28,T.x-viewW+70))));
  cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle='#05070c';cx.fillRect(0,0,cw,ch);
  cx.save();cx.translate(0,oy);cx.scale(s,s);cx.translate(-camX,0);
  cx.drawImage(bg,camX*BS,0,viewW*BS,GH*BS,camX,0,viewW,GH);
  // blikveld bij omkijken (rood), zwak bij de waarschuwing
  obs.forEach(o=>{if(o.look>0||o.warn>0){const a=o.look>0?.24:.08,hy=o.y-100*o.sc,g=cx.createLinearGradient(o.x,0,o.x-P.view,0);g.addColorStop(0,`rgba(255,61,82,${a})`);g.addColorStop(1,'rgba(255,61,82,0)');
   cx.fillStyle=g;cx.beginPath();cx.moveTo(o.x-6,hy-4);cx.lineTo(o.x-P.view,hy-150);cx.lineTo(o.x-P.view,o.y+24);cx.lineTo(o.x-6,hy+10);cx.closePath();cx.fill()}});
  const hid=!going&&inShadow(me.x);me.dim=hid?.5:1;
  [T,G,me].filter(Boolean).sort((a,b)=>a.y-b.y).forEach(p=>hitPerson(cx,p,now));
  if(hid&&!over){cx.strokeStyle='rgba(169,220,255,.5)';cx.setLineDash([4,4]);cx.lineWidth=1.2;const z=shadows.find(z=>me.x>=z.x-4&&me.x<=z.x+z.w+4);if(z)cx.strokeRect(z.x+2,374,z.w-4,94);cx.setLineDash([])}
  obs.forEach(o=>{if(over)return;if(o.warn>0)mark(cx,o,'#ffd35a','!');else if(o.look>0)mark(cx,o,'#ff3d52','!');else if(o===T&&o.ptm>0)mark(cx,o,'#a9dcff','…')});
  // binnen bereik: pulserende ring; tijdens toeslaan de timingring
  const ty=T.y-70*T.sc;
  if(!qte&&!over&&inRange()){const pu=.5+.5*Math.sin(now/140);cx.strokeStyle=`rgba(255,61,82,${.45+pu*.4})`;cx.lineWidth=2;cx.beginPath();cx.arc(T.x,ty,46+pu*4,0,7);cx.stroke();
   cx.fillStyle='rgba(235,232,226,.9)';cx.font='700 13px "JetBrains Mono",ui-monospace,monospace';cx.textAlign='center';cx.fillText(touch?'TOESLAAN':'KLIK OF E',T.x,ty+72)}
  if(qte&&!qte.done){const R0=72,jit=NV.amp*.0035*Math.sin(now*.06),r=Math.max(0,1-qte.t/qte.dur+jit);
   cx.fillStyle='rgba(5,6,8,.35)';cx.beginPath();cx.arc(T.x,ty,R0*1.05,0,7);cx.fill();
   cx.strokeStyle='rgba(63,227,149,.5)';cx.lineWidth=Math.max(2,R0*qte.tol*2);cx.beginPath();cx.arc(T.x,ty,R0*BAND,0,7);cx.stroke();
   cx.strokeStyle='rgba(63,227,149,.95)';cx.lineWidth=1.2;cx.beginPath();cx.arc(T.x,ty,R0*BAND,0,7);cx.stroke();
   cx.strokeStyle='#ebe8e2';cx.lineWidth=2.6;cx.beginPath();cx.arc(T.x,ty,Math.max(1,R0*r),0,7);cx.stroke()}
  cx.restore();
  // nog te ver weg voor het beeld (smalle telefoon): pijl aan de rand, met zijn ! erbij
  if(!over&&T.x>camX+viewW-8){const ay=oy+(T.y-70*T.sc)*s,c_=T.look>0?'#ff3d52':T.warn>0?'#ffd35a':'#ff3d52';cx.fillStyle=c_;cx.beginPath();cx.moveTo(cw-8,ay);cx.lineTo(cw-24,ay-11);cx.lineTo(cw-24,ay+11);cx.fill();
   if(T.look>0||T.warn>0){cx.font='800 18px "Big Shoulders Text","Arial Narrow",sans-serif';cx.textAlign='center';cx.fillText('!',cw-16,ay-18)}}
  // doel: afstand tot zijn auto (onderin)
  const pr=Math.min(1,Math.max(0,(T.x-560)/(END-560)));cx.fillStyle='rgba(255,255,255,.08)';cx.fillRect(0,ch-3,cw,3);cx.fillStyle='rgba(255,61,82,.75)';cx.fillRect(0,ch-3,cw*pr,3);
  hitSetT(L,tLeft,8);
  const sw_=Math.round(sus);if(sw_!==suW){suW=sw_;elSu.style.width=sw_+'%';elSu.classList.toggle('hi',sus>60)}
  const can=!over&&(qte?!qte.done:inRange());if(hitB.disabled===can)hitB.disabled=!can;if(!qte&&hitB.textContent!=='Toe­slaan'&&!over)hitB.innerHTML='Toe&shy;slaan';
  raf=requestAnimationFrame(frame)}
 raf=requestAnimationFrame(frame)})}

// ---------- ongeluk ----------
// Een torenkraan boven de stoep. Beweeg de kraan, laat de lading los. De lading slingert mee en valt niet meteen: reken vooruit.
// Bellen laat hem even stilstaan. Raak je een voorbijganger: politie. Net mis: hij schrikt en is weg (maar het leek een ongeluk).
// Soepel: natuurkunde in vaste stapjes van 1/120 s (gelijk op elk scherm, ook als een frame hapert), de kat volgt je muis of
// vinger kritisch gedempt (geen naschuiven), pijltjes sturen de kat direct en stoppen meteen bij loslaten. Een gele ring op de
// stoep laat zien waar de lading nu zou landen (zo breed als de lading raakt); tijdens de val groeit zijn schaduw.
function hitAccident(H){return new Promise(resolve=>{
 const P=hitParams(H,'ongeluk'),W=1000,GH=600,LANE=556,JIB=92,CL=150,GP=900,GF=1300,DAMP=.6,STEP=1/120,XMIN=130,XMAX=960,
  KW=9,VM=540,AM=1800,KS=.32; // kat: veerkracht (kritisch gedempt), topsnelheid, max. versnelling, hoe hard de lading meeslingert
 let rs=Math.floor(Math.random()*1e9);const R=()=>(rs=(rs*1664525+1013904223)%4294967296)/4294967296;
 const touch=matchMedia('(pointer:coarse)').matches,RM=hitReduced();
 const L=hitLayerOpen(`<div class="hg ha">
  <div class="hg-top"><div><span class="label">${esc(H.n)} · ${esc(H.w)} · ongeluk</span><b>Doelwit: ${esc(H.t)} <i class="hg-tag">rode jas</i></b></div>
   <div class="hg-k"><span>Tijd</span><b id="hgT">${P.time}</b></div><div class="hg-k"><span>Lading</span><b id="haL">${'■'.repeat(P.loads)}</b></div><div class="hg-k"><span>Bellen</span><b id="haC">${P.calls}</b></div>
   <button class="btn ghost sm ha-callt" id="haCallT" tabindex="-1">Bel hem · B</button><button class="btn ghost sm" id="hgQ" tabindex="-1">Opgeven</button></div>
  <div class="hg-stage" id="hgS"><canvas id="hgC"></canvas><div class="hg-msg" id="hgM"></div>
   <div class="hg-pad"><button class="hg-breath ha-call" id="haCall" tabindex="-1">Bel hem<br><small>${P.calls}× · hij blijft staan</small></button><button class="hg-fire ha-drop" id="haDrop" tabindex="-1">Los</button></div></div>
  <p class="hg-help">${touch?'<b>Sleep</b> over het beeld om de kraan te bewegen en tik op <b>Los</b>. De lading slingert mee en valt niet meteen: reken vooruit. De gele ring laat zien waar hij nu zou landen. <b>Bel hem</b> en hij blijft even staan.'
   :'Beweeg de kraan met je <b>muis</b> (of ← →) en <b>klik</b> of druk op <b>spatie</b> om de lading los te laten. Hij slingert mee en valt niet meteen: reken vooruit. De gele ring laat zien waar hij nu zou landen. <b>B</b> = bel hem, dan blijft hij even staan.'}</p></div>`);
 const cv=L.querySelector('#hgC'),cx=cv.getContext('2d'),stage=L.querySelector('#hgS'),elL=L.querySelector('#haL'),elC=L.querySelector('#haC'),
  bCall=L.querySelector('#haCall'),bCallT=L.querySelector('#haCallT'),bDrop=L.querySelector('#haDrop'),elM=L.querySelector('#hgM');
 // achtergrond: stad, bouwhek met strepen, een half gebouw met steigers, de kraan (één keer tekenen)
 const bg=document.createElement('canvas');bg.width=W*2;bg.height=GH*2;const b=bg.getContext('2d');b.scale(2,2);
 hitStreet(b,R,W,160,470);
 b.fillStyle='rgba(5,7,12,.45)';b.fillRect(0,0,W,470);
 b.fillStyle='#161a21';b.fillRect(640,250,300,220);b.strokeStyle='#2b313b';b.lineWidth=2;for(let y=250;y<=470;y+=44){b.beginPath();b.moveTo(640,y);b.lineTo(940,y);b.stroke()}for(let x=640;x<=940;x+=50){b.beginPath();b.moveTo(x,250);b.lineTo(x,470);b.stroke()}
 b.strokeStyle='rgba(255,173,107,.35)';b.lineWidth=1.2;for(let y=272;y<470;y+=44){b.beginPath();b.moveTo(630,y);b.lineTo(950,y);b.stroke()}
 b.fillStyle='#1d2027';b.fillRect(0,470,W,70);for(let x=0;x<W;x+=14){b.fillStyle=(x/14)%2?'#ff7a1a':'#14161b';b.beginPath();b.moveTo(x,470);b.lineTo(x+14,470);b.lineTo(x+6,480);b.lineTo(x-8,480);b.closePath();b.fill()}
 b.fillStyle='#ff7a1a';b.fillRect(420,492,96,26);b.fillStyle='#0a0b0e';b.font='800 13px "Big Shoulders Text","Arial Narrow",sans-serif';b.textAlign='center';b.fillText('BOUWPLAATS',468,510);
 b.fillStyle='#2a2d34';b.fillRect(0,540,W,4);const sd=b.createLinearGradient(0,544,0,GH);sd.addColorStop(0,'#1a1d22');sd.addColorStop(1,'#0c0d10');b.fillStyle=sd;b.fillRect(0,544,W,GH-544);
 b.fillStyle='#222529';b.fillRect(0,574,W,3);
 b.strokeStyle='#e8a24a';b.lineWidth=2;b.beginPath();b.moveTo(62,JIB);b.lineTo(62,540);b.moveTo(84,JIB);b.lineTo(84,540);for(let y=JIB;y<540;y+=24){b.moveTo(62,y);b.lineTo(84,y+24);b.moveTo(84,y);b.lineTo(62,y+24)}b.stroke();
 b.beginPath();b.moveTo(14,JIB-12);b.lineTo(990,JIB-12);b.moveTo(14,JIB+4);b.lineTo(990,JIB+4);for(let x=14;x<990;x+=22){b.moveTo(x,JIB+4);b.lineTo(x+11,JIB-12);b.lineTo(x+22,JIB+4)}b.stroke();
 b.beginPath();b.moveTo(73,JIB-12);b.lineTo(73,JIB-56);b.lineTo(990,JIB-12);b.moveTo(73,JIB-56);b.lineTo(14,JIB-12);b.stroke();
 b.fillStyle='#3a3f48';b.fillRect(16,JIB+4,40,26);b.fillStyle='#e8a24a';b.fillRect(86,JIB+4,26,24);b.fillStyle='rgba(169,220,255,.35)';b.fillRect(92,JIB+9,14,10);
 // mensen op de stoep: doelwit, voorbijgangers
 const fromL=R()<.5;
 const T={kind:'target',x:fromL?-24:W+24,y:LANE+4,sc:1,dir:fromL?1:-1,face:fromL?1:-1,mode:'walk',ph:0,v:P.vT,ptm:0,pz:2.6+R()*3,alarm:false};
 const civs=[];const mkC=(x)=>{const d=R()<.5?1:-1;return {kind:'civ',x:x!=null?x:(d>0?-24:W+24),y:LANE+(R()*10-4),sc:.96+R()*.1,dir:d,face:d,mode:'walk',ph:R()*6,v:P.vT*(.75+R()*.6),col:HIT_CIV_COATS[Math.floor(R()*HIT_CIV_COATS.length)]}};
 for(let i=0;i<P.civ;i++)civs.push(mkC(120+R()*760));let spawn=2+R()*3;
 // kraan en lading
 let tx=520,vt=0,acc=0,th=0,om=0,aimX=520,keyDir=0,attached=true,fall=null,loadsLeft=P.loads,calls=P.calls,reload=0,dust=[],tLeft=P.time,over=false,result=null,last=performance.now(),acc_=0,raf=0,nope=0;
 let cw=0,ch=0,s=1,viewW=W,camX=0,ox=0,oy=0,dpr=1,rect=null;
 const clampX=x=>Math.max(XMIN,Math.min(XMAX,x));
 function size(){const r=stage.getBoundingClientRect();cw=r.width;ch=r.height;dpr=hitDpr(cw,ch);cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);cv.style.width=cw+'px';cv.style.height=ch+'px';
  s=Math.min(ch/GH,cw/640);viewW=Math.min(W,cw/s);ox=Math.max(0,(cw-W*s)/2);oy=Math.max(0,(ch-GH*s)/2);rect=cv.getBoundingClientRect()}
 size();const ro=new ResizeObserver(size);ro.observe(stage);
 const loadPos=()=>({x:tx+CL*Math.sin(th),y:JIB+10+CL*Math.cos(th)});
 // beginsnelheid van de lading als je nu loslaat (zelfde formule als drop)
 const relV=()=>({vx:vt+CL*Math.cos(th)*om,vy:-CL*Math.sin(th)*om*.3});
 // waar landt hij als je nu loslaat? (de val zelf is een zuivere worp: vx blijft gelijk, vy krijgt GF erbij)
 function predict(){const p=loadPos(),v=relV(),dy=LANE+6-(p.y+20),t=(-v.vy+Math.sqrt(v.vy*v.vy+2*GF*Math.max(0,dy)))/GF;return {x:p.x+v.vx*t,t,x0:p.x,y0:p.y,vx:v.vx,vy:v.vy}}
 if(hitDbgOn())window.__hitDbg={T,civs,P,get tx(){return tx},get swing(){return th},get omega(){return om},settle:x=>{tx=aimX=x;vt=0;th=0;om=0},get aimX(){return aimX},set aimX(v){aimX=v},get fall(){return fall},get attached(){return attached&&!reload},get over(){return over},predict,drop:()=>drop(),call:()=>call(),win:z=>finish({ok:true,zone:z||'body'},'Raak'),fail:w=>finish({ok:false,why:w||'nearmiss'})};
 function msg(t,cls,keep){elM.className='hg-msg on '+(cls||'');elM.innerHTML=t;clearTimeout(msg.t);if(!keep)msg.t=setTimeout(()=>{if(!over)elM.className='hg-msg'},1200)}
 let hudSig='';
 function hud(){const cOff=!calls||over||T.alarm||T.ptm>0,dOff=!attached||over||reload>0,sig=loadsLeft+'|'+calls+'|'+cOff+'|'+dOff;if(sig===hudSig)return;hudSig=sig;
  elL.textContent='■'.repeat(loadsLeft)+'□'.repeat(P.loads-loadsLeft);elC.textContent=calls;
  bCall.disabled=cOff;bCallT.disabled=cOff;bCall.querySelector('small').textContent=calls+'× · hij blijft staan';
  // Los blijft aanklikbaar (anders verdwijnt een tik zonder reactie); als hij niet kan, zie je waarom
  bDrop.classList.toggle('off',dOff);bDrop.setAttribute('aria-disabled',dOff?'true':'false')}
 function drop(){if(over)return;
  if(!attached||reload>0){nope=.35;bDrop.classList.remove('nope');void bDrop.offsetWidth;bDrop.classList.add('nope');msg(loadsLeft>0?'De nieuwe lading komt eraan':'Geen lading meer','',0);return}
  const p=loadPos(),v=relV();fall={x:p.x,y:p.y,vx:v.vx,vy:v.vy,rot:th};attached=false;loadsLeft--;try{SFX.spin()}catch(e){}if(navigator.vibrate)try{navigator.vibrate(25)}catch(e){}hud()}
 function call(){if(!calls||over||T.alarm||T.ptm>0||T.x<-10||T.x>W+10)return;calls--;T.ptm=2.7;T.mode='phone';try{SFX.tick()}catch(e){}msg('Hij neemt op en blijft staan','',0);hud()}
 // invoer. Muis: de kat volgt de cursor, klik = los. Touch/pen: slepen (relatief), Los-knop. Toetsen: ← → sturen direct.
 let drag=null;
 cv.addEventListener('pointermove',e=>{if(over)return;
  if(e.pointerType==='mouse'){keyDir=0;aimX=clampX(camX+(e.clientX-rect.left-ox)/s)}
  else if(drag&&e.pointerId===drag.id){keyDir=0;aimX=clampX(aimX+(e.clientX-drag.x)/s);drag.x=e.clientX}});
 cv.addEventListener('pointerdown',e=>{if(over)return;rect=cv.getBoundingClientRect();
  if(e.pointerType==='mouse'){if(e.button===0){keyDir=0;aimX=clampX(camX+(e.clientX-rect.left-ox)/s);drop()}}
  else if(!drag){drag={id:e.pointerId,x:e.clientX};try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
 const endDrag=e=>{if(drag&&e.pointerId===drag.id)drag=null};cv.addEventListener('pointerup',endDrag);cv.addEventListener('pointercancel',endDrag);cv.addEventListener('contextmenu',e=>e.preventDefault());
 const tap=(el,fn)=>el.addEventListener('pointerdown',e=>{e.preventDefault();if(e.button>0)return;fn()});
 tap(bDrop,drop);tap(bCall,call);tap(bCallT,call);
 // toetsenbord: activeren via klik (Enter/spatie op een knop met focus) mag niet nóg een keer iets doen
 [bDrop,bCall,bCallT].forEach(el=>el.addEventListener('click',e=>{e.preventDefault()}));
 const keys={l:0,r:0};const setDir=()=>{const d=keys.r-keys.l;if(d)keyDir=d;else if(keyDir){keyDir=0;aimX=clampX(tx)}};
 const kd=e=>{if(over)return;const k=e.key;
  if(k==='ArrowLeft'||k==='a'||k==='A'){e.preventDefault();keys.l=1;setDir()}else if(k==='ArrowRight'||k==='d'||k==='D'){e.preventDefault();keys.r=1;setDir()}
  else if(e.code==='Space'||k==='Enter'||k==='ArrowDown'||k==='s'||k==='S'){e.preventDefault();if(!e.repeat)drop()}
  else if(k==='b'||k==='B'){e.preventDefault();if(!e.repeat)call()}else if(k==='Escape')finish({ok:false,why:'quit'})};
 const ku=e=>{const k=e.key;if(k==='ArrowLeft'||k==='a'||k==='A')keys.l=0;else if(k==='ArrowRight'||k==='d'||k==='D')keys.r=0;else return;setDir()};
 const blur=()=>{keys.l=keys.r=0;setDir()};
 document.addEventListener('keydown',kd);document.addEventListener('keyup',ku);window.addEventListener('blur',blur);
 L.querySelector('#hgQ').onclick=()=>finish({ok:false,why:'quit'});
 function walk(p,dt){if(p.down)return;if(p.ptm>0){p.ptm-=dt;p.mode='phone';return}
  if(p===T&&!p.alarm){p.pz-=dt;if(p.pz<=0){p.ptm=.9+R()*1.3;p.pz=3+R()*4;p.mode='pause';return}}
  p.x+=p.dir*p.v*dt;p.ph+=dt*p.v/9;p.mode='walk'}
 function people(){return [T,...civs].filter(p=>!p.gone)}
 function landed(){const pr=fall;fall=null;try{SFX.shot()}catch(e){}if(!RM)for(let i=0;i<18;i++)dust.push({x:pr.x+(R()*60-30),y:LANE,vx:R()*160-80,vy:-R()*120,a:1,r:4+R()*6});
  if(over)return;const dx=Math.abs(pr.x-T.x);
  if(dx<95&&!T.down){T.alarm=true;T.ptm=0;T.dir=pr.x<T.x?1:-1;T.face=T.dir;T.v=P.vT*3.4;msg('Net mis!','bad',1);setTimeout(()=>finish({ok:false,why:'nearmiss'},'Net mis'),900);over=true;return}
  if(loadsLeft>0){reload=2.4;msg('Mis. Er komt een nieuwe lading','',0)}else{msg('Geen lading meer','bad',1);setTimeout(()=>finish({ok:false,why:'escaped'},'Geen lading meer'),800);over=true}}
 // één vaste stap natuurkunde (1/120 s)
 function tick(dt){
  if(keyDir&&!over)aimX=clampX(tx+keyDir*VM*.3);
  const want=clampX(aimX),a0=Math.max(-AM,Math.min(AM,(want-tx)*KW*KW-2*KW*vt)),nv=Math.max(-VM,Math.min(VM,vt+a0*dt));acc=(nv-vt)/dt;vt=nv;tx+=vt*dt;
  if(attached&&!reload){om+=(-(GP/CL)*Math.sin(th)-(acc*KS/CL)*Math.cos(th))*dt;om*=Math.exp(-DAMP*dt);th+=om*dt}
  if(reload>0){reload-=dt;if(reload<=0){reload=0;attached=true;th=0;om=0;hud()}}
  if(fall){fall.vy+=GF*dt;fall.x+=fall.vx*dt;fall.y+=fall.vy*dt;fall.rot*=Math.exp(-2*dt);const bot=fall.y+20;
   for(const p of people()){if(p.down)continue;const top=p.y-121*p.sc;if(bot>=top&&bot<=p.y+6&&Math.abs(fall.x-p.x)<=30+12*p.sc){p.down=performance.now();p.dir=fall.x<p.x?1:-1;const f=fall;fall=null;
     try{SFX.shot()}catch(e){}if(!RM)for(let i=0;i<14;i++)dust.push({x:f.x+(R()*50-25),y:p.y-40,vx:R()*140-70,vy:-R()*110,a:1,r:4+R()*5});
     if(p===T)finish({ok:true,zone:Math.abs(f.x-p.x)<=10?'head':'body'},Math.abs(f.x-p.x)<=10?'Perfect ongeluk':'Raak');else finish({ok:false,why:'civilian'},'Een voorbijganger!');return}}
   if(bot>=LANE+6)landed()}
  walk(T,dt);civs.forEach(p=>{walk(p,dt);if(p.x<-40||p.x>W+40)p.gone=true});
  for(let i=civs.length-1;i>=0;i--)if(civs[i].gone)civs.splice(i,1);
  spawn-=dt;if(spawn<=0&&civs.length<P.civ){civs.push(mkC());spawn=2.5+R()*3.5}
  dust.forEach(d=>{d.vy+=420*dt;d.x+=d.vx*dt;d.y=Math.min(LANE+6,d.y+d.vy*dt);d.a-=dt*.9});
  if(nope>0)nope-=dt;
  if(over)return;
  tLeft-=dt;if(tLeft<=0){tLeft=0;T.alarm=true;return finish({ok:false,why:'escaped'},'Te laat')}
  if((T.dir>0&&T.x>W+30)||(T.dir<0&&T.x<-30))finish({ok:false,why:'escaped'},'Hij is de bouwplaats voorbij')}
 function step(realDt){acc_+=Math.min(.25,realDt);let n=0;while(acc_>=STEP&&n<40){tick(STEP);acc_-=STEP;n++}if(dust.length)dust=dust.filter(d=>d.a>0)}
 function finish(res,text){if(result)return;over=true;result=res;keyDir=0;hud();
  msg(res.ok?`<b>${text||'Raak'}</b><span>Een tragisch ongeluk op de bouwplaats</span>`:`<b>${text||'Mislukt'}</b><span>${res.why==='quit'?'Contract afgebroken':res.why==='civilian'?'De politie komt eraan':res.why==='nearmiss'?'Hij schrikt en loopt hard weg':'Het doelwit is weg'}</span>`,res.ok?'ok':'bad',1);
  try{res.ok?SFX.win(3):SFX.lose()}catch(e){}
  setTimeout(close,res.ok?1600:1400)}
 function close(){cancelAnimationFrame(raf);ro.disconnect();document.removeEventListener('keydown',kd);document.removeEventListener('keyup',ku);window.removeEventListener('blur',blur);hitLayerClose(L);resolve(result)}
 function pallet(c,x,y,rot){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle='#6b4a2c';c.fillRect(-32,14,64,6);c.fillStyle='#4a321d';c.fillRect(-30,20,8,4);c.fillRect(-4,20,8,4);c.fillRect(22,20,8,4);
  for(let r=0;r<3;r++)for(let k=0;k<4;k++){c.fillStyle=(r+k)%2?'#9b4a2c':'#8a3f25';c.fillRect(-30+k*15+(r%2?4:0),-16+r*10,14,9)}
  c.strokeStyle='rgba(20,10,5,.5)';c.lineWidth=1;c.strokeRect(-30,-16,60,30);c.restore()}
 const HITR=30+12; // zo breed raakt de lading iemand (vanuit het midden)
 function frame(now){const dt=(now-last)/1000;last=now;step(dt);hud();
  camX=Math.max(0,Math.min(W-viewW,tx-viewW/2));
  cx.setTransform(dpr,0,0,dpr,0,0);cx.fillStyle='#05070c';cx.fillRect(0,0,cw,ch);
  cx.save();cx.translate(ox,oy);cx.scale(s,s);cx.translate(-camX,0);
  cx.drawImage(bg,0,0,W,GH);
  const gy=LANE+4;
  // kat en kabel
  cx.fillStyle='#ffd35a';cx.fillRect(tx-14,JIB-2,28,12);cx.fillStyle='#14161b';cx.fillRect(tx-10,JIB+10,4,4);cx.fillRect(tx+6,JIB+10,4,4);
  // waar de kat heen gaat (meteen zichtbaar bij elke beweging van muis, vinger of toets)
  if(!over){const far=Math.min(1,Math.abs(aimX-tx)/40);cx.strokeStyle=`rgba(255,211,90,${.35+.5*far})`;cx.lineWidth=2.4;cx.beginPath();cx.moveTo(aimX-8,JIB-24);cx.lineTo(aimX,JIB-15);cx.lineTo(aimX+8,JIB-24);cx.stroke()}
  const lp=loadPos();
  if(attached&&!reload){cx.strokeStyle='#c9ccd2';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(tx,JIB+10);cx.lineTo(lp.x,lp.y-18);cx.stroke();
   // waar hij landt als je nu loslaat: stippelboog en een ring zo breed als de lading raakt
   if(!over){const pr=predict();cx.strokeStyle='rgba(255,211,90,.35)';cx.lineWidth=1.4;cx.setLineDash([3,6]);cx.beginPath();
    for(let i=0;i<=14;i++){const t=pr.t*i/14,x=pr.x0+pr.vx*t,y=pr.y0+20+pr.vy*t+.5*GF*t*t;i?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();cx.setLineDash([]);
    cx.fillStyle='rgba(255,211,90,.12)';cx.strokeStyle='rgba(255,211,90,.85)';cx.lineWidth=2;cx.beginPath();cx.ellipse(pr.x,gy,HITR,6.5,0,0,7);cx.fill();cx.stroke();
    cx.beginPath();cx.moveTo(pr.x,gy-11);cx.lineTo(pr.x,gy+7);cx.stroke()}
   pallet(cx,lp.x,lp.y,th)}
  else if(reload>0){const k=1-reload/2.4,ly=JIB+10+CL*k;cx.strokeStyle='#c9ccd2';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(tx,JIB+10);cx.lineTo(tx,ly-18);cx.stroke();pallet(cx,tx,ly,0)}
  else{cx.strokeStyle='#c9ccd2';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(tx,JIB+10);cx.lineTo(tx,JIB+40);cx.stroke()}
  // vallende lading: schaduw die groeit naarmate hij lager komt
  if(fall){const k=Math.max(0,Math.min(1,(fall.y-JIB)/(gy-JIB)));cx.fillStyle=`rgba(0,0,0,${.25+.45*k})`;cx.beginPath();cx.ellipse(fall.x,gy,18+16*k,4+3*k,0,0,7);cx.fill()}
  people().slice().sort((a,b)=>a.y-b.y).forEach(p=>hitPerson(cx,p,now));
  if(T.ptm>0&&!over){const y=T.y-138;cx.fillStyle='#a9dcff';cx.beginPath();cx.moveTo(T.x,y+12);cx.lineTo(T.x-9,y-4);cx.lineTo(T.x+9,y-4);cx.closePath();cx.fill()}
  if(fall)pallet(cx,fall.x,fall.y,fall.rot);
  dust.forEach(d=>{cx.fillStyle=`rgba(150,140,128,${Math.max(0,d.a)*.6})`;cx.beginPath();cx.arc(d.x,d.y,d.r,0,7);cx.fill()});
  cx.restore();
  // doelwit buiten beeld (telefoon): pijltje
  if(T.x<camX||T.x>camX+viewW){const left=T.x<camX,ay=oy+(T.y-70)*s;cx.fillStyle='#ff3d52';cx.beginPath();if(left){cx.moveTo(10,ay);cx.lineTo(24,ay-10);cx.lineTo(24,ay+10)}else{cx.moveTo(cw-10,ay);cx.lineTo(cw-24,ay-10);cx.lineTo(cw-24,ay+10)}cx.fill()}
  hitSetT(L,tLeft,8);
  raf=requestAnimationFrame(frame)}
 hud();raf=requestAnimationFrame(frame)})}

// ---------- premiejager ----------
// Vanaf een opsporingsbericht kan er een premiejager opduiken (niet in het casino, niet ondergedoken, hooguit eens per 6 minuten).
// Snel trekken: wacht op zijn beweging en reageer binnen de tijd. Te vroeg is ook mis. Verversen = verloren.
function bhMaybe(w){if(w.lv<2||S.hide||inJail()||window.__chase||window.__hitG||window.__bhG||document.hidden||page==='casino'||!$('#modal').hidden||document.getElementById('feudLayer')||(window.kk&&kk.busy))return;
 const H0=hm();if(now()-(H0.bh||0)<6*60000)return;if(Math.random()<(w.lv>=3?1/240:1/480))bhStart()}
function bhStart(){const w=wantedObj();if(!w||window.__bhG)return;const H0=hm();H0.bh=now();H0.bhPend=now();save();
 bhGame(w).then(r=>{H0.bhPend=0;if(r.ok)bhWin(r.ms);else bhLose(false,r.why)})}
const bhWindow=()=>Math.min(820,Math.round(470+sk('schiet')*4+hitNerve().lv*130+(hitWeapon()>=1?40:0)));
function bhScene(){return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="400" height="220" fill="#07080b"/><path d="M0 0 150 70v100L0 220z" fill="#10131a"/><path d="M400 0 250 70v100l150 50z" fill="#0d1016"/>
  <path d="M150 170h100l150 50H0z" fill="#121419"/><rect x="150" y="70" width="100" height="100" fill="#0a0c10"/>
  <path d="M30 40h40v26H30zM330 46h34v22h-34z" fill="rgba(255,190,110,.12)"/><ellipse cx="200" cy="168" rx="70" ry="6" fill="rgba(255,170,80,.08)"/>
  <circle cx="200" cy="62" r="46" fill="rgba(255,170,80,.07)"/><rect x="197" y="70" width="6" height="4" fill="#ffd39a"/>
  <g class="bh-man" fill="#030405"><path d="M191 168l3-28h12l3 28z"/><path d="M187 146c0-15 5-23 13-23s13 8 13 23z"/><circle cx="200" cy="116" r="6"/><path d="M188 112h24v2.5h-24z"/><path d="M193 112l1.5-8h11l1.5 8z"/>
   <path class="bh-arm" d="M211 129l7 15" stroke="#030405" stroke-width="5" stroke-linecap="round"/></g></svg>`}
function bhGame(w){return new Promise(resolve=>{window.__bhG=true;window.__chase=true;
 const win=bhWindow(),armed=hitWeapon()>=0,L=document.createElement('div');L.id='bhLayer';L.setAttribute('role','dialog');L.setAttribute('aria-modal','true');
 L.innerHTML=`<div class="bh"><div class="bh-scene" id="bhS">${bhScene()}<b class="bh-sig" id="bhSig">Nu!</b></div>
  <div class="bh-txt"><span class="label">Premiejager · ${WANT_LV[w.lv].n}</span><h2 id="bhT">Iemand wacht je op</h2>
   <p id="bhP">De mensen van ${esc(w.t||'je laatste doelwit')} hebben een prijs op je hoofd gezet. Hij staat aan het eind van de steeg. Wacht op zijn beweging en ${armed?'trek':'duik weg'} dan meteen. Te vroeg is ook mis.</p>
   <div class="bh-k"><span>Je hebt</span><b>${win} ms</b><small>Schieten, een vaste hand en een vuurwapen geven meer tijd</small></div>
   <button class="btn xl red" id="bhB">${armed?'Trek':'Duik weg'}</button></div></div>`;
 document.body.appendChild(L);document.body.classList.add('hg-open');try{SFX.lose()}catch(e){}
 const q=s=>L.querySelector(s);let ph='intro',tGo=0,done=false,go=0,late=0;
 const start=setTimeout(()=>{ph='wait';L.classList.add('wait');q('#bhT').textContent='Wacht…';
  go=setTimeout(()=>{ph='go';tGo=performance.now();L.classList.add('go');q('#bhT').textContent='Nu!';late=setTimeout(()=>end(false,'late'),win)},1300+Math.random()*2400)},1500);
 const press=e=>{if(e&&e.cancelable)e.preventDefault();if(done||ph==='intro')return;if(ph==='wait'){clearTimeout(go);end(false,'early');return}clearTimeout(late);end(true,'ok',Math.round(performance.now()-tGo))};
 const kd=e=>{if((e.code==='Space'||e.key==='Enter')&&!e.repeat)press(e)};
 document.addEventListener('keydown',kd);q('#bhB').addEventListener('pointerdown',press);q('#bhS').addEventListener('pointerdown',press);
 if(hitDbgOn())window.__bhDbg={press,get ph(){return ph},win};
 function end(ok,why,ms){done=true;clearTimeout(start);clearTimeout(go);clearTimeout(late);document.removeEventListener('keydown',kd);L.classList.remove('wait');L.classList.add(ok?'won':'lost');
  q('#bhT').textContent=ok?'Je was sneller':why==='early'?'Te vroeg':'Te laat';
  q('#bhP').textContent=ok?`${ms} ms. Hij was niet snel genoeg en gaat ervandoor zonder zijn papieren.`:why==='early'?'Je bewoog voordat hij dat deed. Hij was er klaar voor.':'Hij was sneller dan jij.';
  q('#bhB').disabled=true;try{ok?SFX.shot():SFX.lose()}catch(e){}
  setTimeout(()=>{L.remove();document.body.classList.remove('hg-open');window.__bhG=false;window.__chase=false;resolve({ok,why,ms})},1800)}})}
function bhWin(ms){const w=wantedObj(),g=Math.round(rnd(20,50)*100*(1+hitRepLv()*.5)),cr=credGain(3,'netjes');S.cash+=g;addZwart(g);S.cred+=cr;hm().rep+=6;
 if(w&&w.lv>1)w.lv--;log(`Premiejager afgeschud (${ms} ms): +${fmt(g)}, +${cr} cred${w?', nu '+WANT_LV[w.lv].n.toLowerCase():''}`,'ok');
 save();pushState();if(!window.__chase)render();toast(`Je was sneller (${ms} ms). Zijn geld en zijn dossier over jou: +${fmt(g)}${w?' · nog '+WANT_LV[w.lv].n.toLowerCase():''}`,'lvl')}
function bhLose(refresh){const h=rnd(12,24),c=Math.min(40000,Math.max(0,Math.round(S.cash*.06)));S.hp=Math.max(5,S.hp-h);S.cash-=c;if(S.hm)S.hm.bhPend=0;
 log(refresh?`Premiejager: je liep weg, maar hij kreeg je toch te pakken (−${h}% gezondheid${c?', −'+fmt(c):''})`:`Premiejager was sneller: −${h}% gezondheid${c?', −'+fmt(c):''}`,'bad');
 save();pushState();if(!window.__chase)render();toast(`De premiejager was sneller. −${h}% gezondheid${c?' en '+fmt(c)+' kwijt':''}`,'bad')}
