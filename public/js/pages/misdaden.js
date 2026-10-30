// Tab: Misdaden — je bonussen, de beste klussen voor jou en alle klussen per rang (inklapbaar).
// Elke klus heeft een eigen pictogram. Per klus: kans, opbrengst (buit, XP, straatcredit) en wat er gebeurt als het misgaat.
let crimeShowAll=false;const crimeOpen={};
const fmtK=v=>v>=1e6?'€'+(v/1e6).toLocaleString('nl-NL',{maximumFractionDigits:1})+' mln':v>=1e4?'€'+Math.round(v/1000)+'k':fmt(v);
const crEv=c=>chance(c)/100*(c.min+c.max)/2*lootMult()*mastLoot(c.id)/c.en;
// Pictogrammen (24×24, lijnen) en welke klus welk pictogram krijgt
const KL_IC={
 cup:'<path d="M7 9h10l-1.4 11.5H8.4z"/><path d="M6 9h12"/><circle cx="12" cy="4.6" r="2.1"/>',
 wallet:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M21 11h-4.5a2 2 0 000 4H21"/><path d="M6 7l9.5-3.5L17 7"/>',
 tag:'<path d="M3 12.6V4h8.6l9.4 9.4-8.6 8.6z"/><circle cx="7.6" cy="8.4" r="1.6"/>',
 bike:'<circle cx="5.8" cy="16" r="3.6"/><circle cx="18.2" cy="16" r="3.6"/><path d="M5.8 16l3.6-7h6l2.8 7M9.4 9l2.8 7H5.8M8 6h3M15.4 9l-1.2-3.5h2.6"/>',
 box:'<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9M7.8 5.3l8.4 4.5"/>',
 phonewave:'<rect x="5" y="3" width="10" height="18" rx="2"/><path d="M9 18h2M18 8.5a5 5 0 010 7M20.5 6a8.5 8.5 0 010 12"/>',
 carbreak:'<path d="M3 16l2-6a2 2 0 011.9-1.4h10.2A2 2 0 0119 10l2 6v3H3z"/><path d="M6.5 19v2M17.5 19v2M9 8.6l1.6 3.2 1.8-2.4 1.4 2.8 1.4-3.6"/>',
 store:'<path d="M3 9.5L5 4h14l2 5.5"/><path d="M3 9.5a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 12.5V20h14v-7.5M10 20v-4.5h4V20"/>',
 slot:'<rect x="3.5" y="5" width="14" height="15.5" rx="1.5"/><path d="M6.5 9h8v5h-8zM9.2 9v5M11.8 9v5M17.5 9.5h2.5V5.5M7 17.5h7"/><circle cx="20" cy="4.5" r="1.2"/>',
 ticket:'<path d="M3 7.5h18v3a1.6 1.6 0 000 3v3H3v-3a1.6 1.6 0 000-3z"/><path d="M14.5 8.5v1.4M14.5 11.3v1.4M14.5 14.1v1.4"/>',
 scooter:'<circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M8 17.5h8.5L13.5 7h3M13.5 7h-2.5M3.5 14.5L5.5 12h6l2 5.5"/>',
 house:'<path d="M3 11l9-7 9 7"/><path d="M5 9.5V20h14V9.5"/><circle cx="12" cy="13.6" r="1.8"/><path d="M12 15.4v2.6"/>',
 fries:'<path d="M5.5 10h13l-1.6 11H7.1z"/><path d="M8 10L6.8 3.5M11 10V3M14 10l1-6.5M17 10l2.2-5.5"/>',
 tower:'<path d="M5 21V4h9v17M14 9h5v12M3 21h18"/><path d="M8 7.5h3M8 11h3M8 14.5h3M16.5 12.5v.01M16.5 15.5v.01"/>',
 polish:'<path d="M9.5 9.5h5l1.5 2v8A1.5 1.5 0 0114.5 21h-5A1.5 1.5 0 018 19.5v-8z"/><path d="M10.5 9.5V3.5h3v6M8 14.5h8"/>',
 ship:'<path d="M2.5 14.5h19L19 19.5H5z"/><path d="M5.5 14.5v-4h5.5v4M11 14.5V7.5h6v7M14 7.5V4.5"/><path d="M2 22c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
 ring:'<circle cx="12" cy="15" r="6"/><path d="M9.5 4h5L16 6.4 12 9.6 8 6.4z"/>',
 truck:'<path d="M2 6h12v11H2zM14 10h4l3 3.5V17h-7"/><circle cx="6" cy="18.5" r="2"/><circle cx="17" cy="18.5" r="2"/>',
 van:'<path d="M2 7h13v10H2zM15 10.5h3.5L21 13v4h-6"/><circle cx="6" cy="18.5" r="2"/><circle cx="17.5" cy="18.5" r="2"/><path d="M8.5 9.5l2.5 1v1.5c0 1.4-1.1 2.4-2.5 2.9-1.4-.5-2.5-1.5-2.5-2.9v-1.5z"/>',
 bank:'<path d="M3 10h18L12 4zM5 10v8M10 10v8M14 10v8M19 10v8M3 20.5h18"/>',
 frame:'<rect x="3" y="4" width="18" height="16" rx="1"/><rect x="6" y="7" width="12" height="10"/><path d="M6 15.5l3.5-3.5 2.5 2.5 2-2 4 4"/><circle cx="14.6" cy="9.8" r="1.1"/>',
 diamond:'<path d="M6.5 4h11L21 9l-9 11L3 9z"/><path d="M3 9h18M9.5 4L8 9l4 11 4-11-1.5-5"/>',
 chip:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><path d="M12 3v3.6M12 17.4V21M3 12h3.6M17.4 12H21M5.6 5.6l2.6 2.6M15.8 15.8l2.6 2.6M5.6 18.4l2.6-2.6M15.8 8.2l2.6-2.6"/>',
 vault:'<rect x="3" y="3.5" width="18" height="16" rx="1.5"/><circle cx="12" cy="11.5" r="4.4"/><path d="M12 7.1v1.6M12 14.3v1.6M7.6 11.5h1.6M14.8 11.5h1.6M6 19.5v2M18 19.5v2"/>',
 spray:'<rect x="6.5" y="8.5" width="8" height="12.5" rx="1.5"/><path d="M8 8.5V6h5v2.5M9.6 6V3.8h1.8"/><path d="M17.5 4.5v.01M20 3v.01M20 6v.01M22 4.5v.01M18.5 8v.01"/>',
 mail:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3.5 7l8.5 6.5L20.5 7"/>',
 listing:'<rect x="3.5" y="4.5" width="17" height="11" rx="1"/><path d="M2 19h20M8.5 8h5l2.2 2-2.2 2h-5z"/>',
 coil:'<circle cx="11" cy="12" r="8"/><circle cx="11" cy="12" r="4.4"/><path d="M11 7.6a4.4 4.4 0 014.4 4.4M19 12h3"/>',
 meter:'<rect x="6.5" y="2.5" width="11" height="10.5" rx="3.5"/><path d="M12 13v8M8.5 21h7M9.5 6.5h5M9.5 9.5h3"/>',
 smash:'<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4l-2.2 5.6 4.2 2.2-3.2 8.2M3 13.5l6.8-3.9M21 8.6l-7 3.2"/>',
 cards:'<rect x="9.5" y="3" width="11.5" height="15.5" rx="1.5"/><path d="M9.5 6.6L4.7 7.9a1.5 1.5 0 00-1 1.8l3 11a1.5 1.5 0 001.8 1l6-1.6"/><path d="M15.3 7.6c-1.3 1.6-2.5 2.4-2.5 3.6a1.3 1.3 0 002.2.9l-.4 1.8h1.4l-.4-1.8a1.3 1.3 0 002.2-.9c0-1.2-1.2-2-2.5-3.6z"/>',
 watch:'<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1.5M9 6.6l.8-4.1h4.4l.8 4.1M9 17.4l.8 4.1h4.4l.8-4.1"/>',
 camera:'<path d="M3 8h4l1.6-2.5h6.8L17 8h4v11.5H3z"/><circle cx="12" cy="13.4" r="3.6"/>',
 container:'<path d="M3 9.5L12 6l9 3.5v8L12 21l-9-3.5z"/><path d="M3 9.5l9 3.5 9-3.5M12 13v8M6 10.7v7.9M9 11.8v7.9M15 11.8v7.9M18 10.7v7.9M12 6V2.5"/>',
 gavel:'<path d="M14.6 3.4l6 6M12.4 5.6l6 6M13.5 4.5l-5 5 6 6 5-5M11 12.5l-7.5 7.5"/><path d="M3 21.5h9"/>',
 warehouse:'<path d="M3 9.5L12 4l9 5.5V20.5H3z"/><path d="M7 20.5v-7.5h10v7.5M7 16.7h10"/>',
 yacht:'<path d="M2.5 16.5h19L18.8 21H5.2zM12 2.5v12M12 3.5l7 11h-7M10 6.5L4.5 14.5H10"/>',
 gold:'<path d="M3 20l2-5h6l2 5zM11 20l2-5h6l2 5zM7 15l2-5h6l2 5"/>',
 bribe:'<rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M3.5 9l8.5 6 8.5-6"/><path d="M7 8V4h10v4M10.5 6h3"/>',
 handshake:'<path d="M2 11.5l3.6-3.6L9 9.4l3-1.6 3 1.6 3.4-1.5L22 11.5"/><path d="M5.6 7.9v6.3l5 4.8a1.6 1.6 0 002.2 0l5-4.8V7.9M9.5 15.3l1.6 1.6M11.6 13.2l2 2M13.7 11.1l1.6 1.6"/>',
 chart:'<path d="M3 3v18h18"/><path d="M6.5 15.5l4-4.5 3 3L20 6.5"/><path d="M15.5 6.5H20V11"/>',
 jet:'<path d="M12 2.5c.9 0 1.4.9 1.4 1.9v5.4l7.6 4.4v2.2l-7.6-2.3v4.1l2.3 1.7v1.6L12 20.6l-3.7.9v-1.6l2.3-1.7v-4.1L3 16.4v-2.2l7.6-4.4V4.4c0-1 .5-1.9 1.4-1.9z"/>',
 doc:'<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12h7M9 15.5h4"/><circle cx="15.6" cy="17.6" r="2"/>',
 dossier:'<path d="M3 6.5h6.4L11 8.2h10v11.8H3z"/><path d="M3 11h18M13.5 14.5h4.5M13.5 17h3"/>',
 crypto:'<path d="M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z"/><path d="M12 7v10M8 9.5l8 5M16 9.5l-8 5"/>',
 island:'<path d="M2.5 20.5c3-1.8 6-2 9.5-2s6.5.2 9.5 2"/><path d="M12 18.5c-.6-4 .4-8 2.5-11"/><path d="M14.5 7.5C13 5.5 10.5 5 8.5 6M14.5 7.5c.5-2.5 3-3.5 5-3M14.5 7.5c2 0 4 1.3 4.5 3.5"/>',
 crane:'<path d="M5.5 21V4M3 21h6M5.5 4h15M5.5 8.5L10 4M9.5 4v4.5M18 4v5.5"/><path d="M16 9.5h4v3.5h-4z"/>',
 crown:'<path d="M3 8l4.6 4L12 5l4.4 7L21 8l-2 11H5z"/><path d="M5.4 16h13.2"/>',
 sneaker:'<path d="M2.5 18.5V12l3.3-.8 2.9 3 5.3 1.5 6.3.9c1 .2 1.7.9 1.7 1.9v1H2.5z"/><path d="M5.8 11.2V7.5l2.8.6M8.7 14.2l1.4-2M11.6 15.5l1.4-2.1"/>',
 garage:'<path d="M3 21V9.5l9-5.5 9 5.5V21"/><path d="M6.5 21v-8.5h11V21M6.5 15.4h11M6.5 18.2h11"/>',
 hardhat:'<path d="M3 16.5h18V19H3z"/><path d="M5 16.5a7 7 0 0114 0"/><path d="M10 10V6.5h4V10"/>',
 ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7.6l4 2.9-1.5 4.7h-5L8 10.5z"/><path d="M12 3v4.6M16 10.5l4.6-1.4M14.5 15.2l2.8 4.1M9.5 15.2l-2.8 4.1M8 10.5L3.4 9.1"/>',
 castle:'<path d="M4 21V9h3v2h2.5V9h5v2H17V9h3v12z"/><path d="M4 9V5.5h3V9M17 9V5.5h3V9M10 21v-4a2 2 0 014 0v4"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10.5" rx="1.5"/><path d="M8 10.5V7a4 4 0 018 0v3.5M12 14.5V17"/>',
 horseshoe:'<path d="M6.5 20.5V12a5.5 5.5 0 0111 0v8.5"/><path d="M4.5 20.5h4M15.5 20.5h4M7.1 13v.01M16.9 13v.01M8 9.4v.01M16 9.4v.01M12 6.6v.01"/>',
 scale:'<path d="M12 3v17M7 21h10M4 7h16M6.5 7L3 14a3.5 3.5 0 007 0zM17.5 7L14 14a3.5 3.5 0 007 0z"/>',
 tanker:'<path d="M2 14.5h20l-2.6 5H4.6z"/><path d="M4 14.5V12h7.5v2.5M15 14.5V9h3.5v5.5M16.75 9V6"/><circle cx="8" cy="9" r="1.8"/>'};
const KL_OF={bedelen:'cup',zakken:'wallet',winkeldief:'tag',fiets:'bike',pakket:'box',telefoon:'phonewave',autokraak:'carbreak',winkel:'store',
 fruitautomaat:'slot',tickets:'ticket',scooter:'scooter',inbraak:'house',snackbar:'fries',pand:'tower',witwas:'polish',smokkel:'ship',juwelier:'ring',
 vrachtwagen:'truck',transport:'van',bank:'bank',kunst:'frame',diamant:'diamond',casino:'chip',centralebank:'vault',spuiten:'spray',envelop:'mail',
 heling:'listing',koper:'coil',parkeer:'meter',ramkraak:'smash',gokhal:'cards',horloge:'watch',afpersing:'camera',container:'container',veiling:'gavel',
 rivaal:'warehouse',jacht:'yacht',goud:'gold',havenbaas:'bribe',londen:'gavel',voorkennis:'chart',jet:'jet',aanbesteding:'doc',geneve:'vault',
 minister:'dossier',cryptobeurs:'crypto',kaaiman:'island',kartelvrede:'handshake',tanker:'tanker',rotterdam:'crane',kroon:'crown',webshop:'sneaker',
 garagebox:'garage',bouwfraude:'hardhat',matchfix:'ball',kasteel:'castle',datalek:'lock',renbaan:'horseshoe',rechter:'scale',goudreserve:'gold'};
const klIc=c=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KL_IC[KL_OF[c.id]]||KL_IC.box}</svg>`;
// vakmanschap: sterretjes en de voortgang naar het volgende niveau
function mastHtml(c){const n=mastN(c.id),l=mastLv(c.id),nx=MAST[l+1];
 return `<div class="cr-m l${l}" title="Vakmanschap: ${n}× gelukt${nx?`, nog ${nx[0]-n} tot ${nx[1]}`:''}"><span class="cr-ms">${[1,2,3,4].map(i=>`<i class="${i<=l?'on':''}"></i>`).join('')}</span><b>${MAST[l][1]}</b>${nx?`<em><i style="width:${Math.round((n-MAST[l][0])/(nx[0]-MAST[l][0])*100)}%"></i></em><small>${n}/${nx[0]}</small>`:'<small>+8% kans · +20% buit</small>'}</div>`}
// vluchtniveau als vijf blokjes, gekleurd naar moeilijkheid
const klPips=lv=>`<span class="kl-pips l${lv}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>`;
const klM=v=>v>=1e6?fmtK(v):fmt(v);
const klChCls=ch=>ch>60?'up':ch>35?'':'dn';
const klSeg=ch=>`<i class="kl-seg" aria-hidden="true"><i style="width:${ch}%"></i></i>`;
function klState(c){const lock=rankIdx(S.xp)<c.r,left=cdLeft(c.id),tired=S.energy<c.en,jail=inJail();return {lock,left,tired,jail,ok:!lock&&!left&&!tired&&!jail}}
function klBtn(c,st){const [b,s]=st.lock?['Vanaf '+RANKS[c.r][0],'nog '+Math.ceil(RANKS[c.r][1]-S.xp).toLocaleString('nl-NL')+' XP']:st.jail?['Je zit vast','eerst vrijkomen']:st.left?['Nog '+fmtClock(st.left),'even afkoelen']:st.tired?['Te moe',c.en+' energie nodig']:['Uitvoeren',c.en+' energie'];
 return `<button class="btn kl-go" onclick="act.crime('${c.id}')" ${st.ok?'':'disabled'}><b>${b}</b><small>${s}</small></button>`}
// opbrengst en risico in gewone woorden
function klVals(c){const m=lootMult()*mastLoot(c.id),ch=chance(c),cr=c.cr?Math.round(c.cr*credMult('')):0,crP=c.cr?Math.round(c.cr*credMult('perfect')):0;
 return {ch,lo:klM(c.min*m),hi:klM(c.max*m),xp:'+'+c.xp+' XP'+(cr?' · +'+cr+' cred':''),crT:cr?`Straatcredit: ${cr}, perfect uitgevoerd ${crP}`:'',jail:fmtTime(jailSec(c.jail))+' cel',fl:FLEE_LEVELS[c.flee]?FLEE_LEVELS[c.flee].label:''}}
function klRow(c){const st=klState(c),v=klVals(c);
 return `<article class="kl ${st.lock?'locked':''} ${st.left?'cool':''}">
  <div class="kl-ic">${klIc(c)}</div>
  <div class="kl-id"><h3>${c.n}</h3><p>${c.d}</p>${st.lock?'':mastHtml(c)}</div>
  <div class="kl-st">
   <div class="kl-k kl-kans"><span>Kans</span><b class="${klChCls(v.ch)}">${v.ch}%</b>${klSeg(v.ch)}</div>
   <div class="kl-k"><span>Opbrengst</span><b class="g">${v.lo} – ${v.hi}</b><em title="${v.crT}">${v.xp}</em></div>
   <div class="kl-k"><span>Mislukt</span><b>${v.jail}</b><em class="lv${c.flee}">${klPips(c.flee)}vluchten ${v.fl}</em></div>
  </div>
  ${klBtn(c,st)}
  ${st.left?`<div class="kl-cd" style="transform:scaleX(${Math.min(1,st.left/crimeCd(c)).toFixed(3)})"></div>`:''}</article>`}
// Beste voor jou: groter, met de opbrengst per energiepunt waar de volgorde op gebaseerd is
function klBest(c){const st=klState(c),v=klVals(c),ev=crEv(c);
 return `<article class="klb ${st.left?'cool':''}">
  <header><div class="kl-ic">${klIc(c)}</div><div><h3>${c.n}</h3><p>${c.d}</p></div></header>
  <div class="klb-ch"><b class="${klChCls(v.ch)}">${v.ch}%</b><span>kans</span>${klSeg(v.ch)}</div>
  <dl class="klb-dl">
   <div><dt>Buit</dt><dd class="g">${v.lo} – ${v.hi}</dd></div>
   <div><dt>Per energie</dt><dd>≈ ${fmtK(ev)}</dd></div>
   <div><dt>Erbij</dt><dd title="${v.crT}">${v.xp}</dd></div>
   <div><dt>Mislukt</dt><dd>${v.jail}</dd></div>
   <div><dt>Vluchten</dt><dd class="lv${c.flee}">${klPips(c.flee)}${v.fl}</dd></div>
  </dl>
  ${mastHtml(c)}
  ${klBtn(c,st)}
  ${st.left?`<div class="kl-cd" style="transform:scaleX(${Math.min(1,st.left/crimeCd(c)).toFixed(3)})"></div>`:''}</article>`}
V.crimes=()=>{
 const ri=rankIdx(S.xp),mult=lootMult(),fit=k=>typeof fitFx==='function'?fitFx(k):0;
 const tiers=[...new Set(CRIMES.map(c=>c.r))].sort((a,b)=>a-b);
 const visible=tiers.filter(t=>crimeShowAll||t<=ri+1);
 const avail=CRIMES.filter(c=>c.r<=ri);
 const isOpen=t=>crimeOpen[t]!=null?crimeOpen[t]:(t>=ri-1);
 const best=avail.slice().sort((a,b)=>crEv(b)-crEv(a)).slice(0,3);
 const bon=[['Rang',ri*RANK_LOOT+rankLvlBonus()],['Familie',fam().loot/100],['Uitrusting',gearFx('buit')],['Outfit',fit('buit')],['Hacken',sk('hack')*SK.hack.loot/100],['Buit-boost',buffLoot()/100],[lidName(),tierLoot()]].filter(x=>x[1]>0);
 const chb=[['Rang',ri*2],['Uitrusting',gearBonus()],['Outfit',fit('kans')],['Familie',fam().chance],['Vingervlugheid',sk('steal')*SK.steal.all],['Focus',focusPct()]].filter(x=>x[1]>0);
 const pct=v=>'+'+Math.round(v*100)+'%';
 return `<div class="kl-page"><h1>Misdaden</h1>
 <section class="card hud kl-hero">
  <div class="kl-h"><span class="label">Buit</span><b class="g">×${mult.toLocaleString('nl-NL',{maximumFractionDigits:2})}</b><em>${bon.map(([l,v])=>`${l} ${pct(v)}`).join(' · ')||'Nog geen bonus'}</em></div>
  <div class="kl-h"><span class="label">Extra slaagkans</span><b class="up">+${Math.round(chb.reduce((a,x)=>a+x[1],0))}%</b><em>${chb.map(([l,v])=>`${l} +${Math.round(v)}%`).join(' · ')||'Nog geen bonus'}${S.heat>=4?` · hitte −${Math.floor(S.heat/4)}%`:''}${tierK()?` · daarna ×${(1+tierK()).toLocaleString('nl-NL')} als ${lidName()}`:''}</em></div>
  <div class="kl-h"><span class="label">Straatcredit</span><b style="color:var(--violet)">×${credMult('').toLocaleString('nl-NL',{maximumFractionDigits:2})}</b><em>Uitrusting +${Math.round(gearCredK()*100)}%${tierK()?` · ${lidName()} +${Math.round(tierK()*100)}%`:''} · perfect ×1,5, netjes ×1,2 · je hebt ${S.cred}</em></div>
  <div class="kl-h"><span class="label">Energie</span><b style="color:var(--ice)">${Math.floor(S.energy)}/${EN_MAX}</b><div class="bar"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div><em>1 punt per ${EN_REGEN_S} s${S.energy<EN_MAX?' · <a href="#ontspannen">bijvullen</a>':''}</em></div>
  <div class="kl-h"><span class="label">Hitte</span><b style="color:${S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--fg)'}">${S.heat}%</b><div class="bar"><i style="width:${S.heat}%;background:${S.heat>60?'var(--red)':'var(--acc)'}"></i></div><em>Elke 4% hitte = −1% kans</em></div>
 </section>
 <div class="cr-mast-how"><b>Vakmanschap</b><span>Elke klus die lukt telt mee voor die klus: na 10 keer <em>Brons</em>, 30 <em>Zilver</em>, 75 <em>Goud</em> en 150 <em>Meester</em>. Elk niveau geeft +2% kans en +5% buit op die klus.</span></div>
 ${best.length?`<div class="tierhead kl-besth"><h2>Beste voor jou</h2><span>Meeste buit per energiepunt, met jouw kans</span></div><div class="klb-grid n${best.length}">${best.map(klBest).join('')}</div>`:''}
 <div class="kl-bar"><span>${avail.length} van de ${CRIMES.length} klussen staan voor je open. Mislukt een klus, dan kun je vluchten of ga je de cel in.</span>
  <div class="filters"><button class="chip-toggle ${crimeShowAll?'':'on'}" onclick="crimeShowAll=false;render()">Tot mijn rang</button><button class="chip-toggle ${crimeShowAll?'on':''}" onclick="crimeShowAll=true;render()">Alle ${CRIMES.length}</button></div></div>
 ${visible.map(t=>{const cs=CRIMES.filter(c=>c.r===t),open=isOpen(t),lock=t>ri,ready=cs.filter(c=>!lock&&!cdLeft(c.id)&&S.energy>=c.en).length,mst=cs.filter(c=>mastLv(c.id)>0).length;
  return `<button class="kl-tier ${lock?'locked':''} ${open?'open':''}" onclick="crimeOpen[${t}]=${!open};render()" aria-expanded="${open}">
   <h2>${RANKS[t][0]}</h2><span>${lock?'Nog '+Math.ceil(RANKS[t][1]-S.xp).toLocaleString('nl-NL')+' XP':cs.length+' klussen · '+ready+' klaar'+(mst?' · '+mst+' met vakmanschap':'')}</span>
   <i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${lock?'<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V7.5a4 4 0 018 0V11"/>':'<path d="M6 9l6 6 6-6"/>'}</svg></i></button>
  ${open?`<div class="kl-list">${cs.map(klRow).join('')}</div>`:''}`}).join('')}</div>`};
