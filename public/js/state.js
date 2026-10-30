// Spelerstatus, opslaan/laden, spelregels, arrestaties, skills, meldingen
let S;
function fresh(){return{name:'Jij',cash:250,bank:0,xp:0,hp:100,heat:0,jailUntil:0,cred:0,energy:100,family:null,skills:{steal:0,cars:0,charisma:0,speed:0,conditie:0,schiet:0,hack:0,handel:0,rechten:0},train:{},buffs:{},redeemed:[],home:'brug',furn:{},carDex:{},biz2:{},dep:[],inv:{},trainV:2,gearV:2,news:[],wanted:false,lastSentence:30,cd:{},cars:[],biz:{},gear:{},stats:{crimes:0,fails:0,cars:0,won:0,lost:0},log:[],last:now(),
  npcs:NPC_NAMES.map((n,i)=>({n,xp:Math.floor(200*Math.pow(1.55,i))+rnd(0,300),cash:rnd(1000,50000)*(i+1)}))}}
// Opslag: met account in de database (via /api/state), anders alleen in de browser.
const SAVE_KEY='onderwereld_v1'+(window.__USER__?'_'+window.__USER__.toLowerCase():'');
// vaste id van deze browser: zo weet het spel of de opslag op de server van dit apparaat komt (of van een ander apparaat / een beheerder)
const DEV_ID=(()=>{try{let d=localStorage.getItem('ow_dev');if(!d){d=Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem('ow_dev',d)}return d}catch(e){return 'x'+Math.random().toString(36).slice(2,12)}})();
function load(){
  const sv=window.__SERVER_STATE__||null;let lc=null;try{lc=JSON.parse(localStorage.getItem(SAVE_KEY))}catch(e){}
  // de nieuwste opslag wint: als de server een update kreeg terwijl jij speelde, staat je laatste voortgang nog in de browser
  // met een account wint de server, tenzij deze browser nog niet-opgeslagen voortgang heeft op precies dezelfde versie (bv. server even weg)
  const svRev=window.__SERVER_REV__||0;
  // nieuw: kwam de serveropslag van dít apparaat en is de browseropslag nieuwer, dan wint de browser altijd
  // (bijvoorbeeld als de app werd gesloten terwijl de laatste opslag nog onderweg was)
  const mine=sv&&sv._dev&&sv._dev===DEV_ID;
  let d=sv;if(lc&&lc.npcs&&(!sv||((lc.savedAt||0)>(sv.savedAt||0)&&(!window.__TOKEN__||(lc._rev||0)===svRev||mine)))){d=lc;if(sv)window.__PUSH_LOCAL__=true}
  if(d&&window.__TOKEN__)d._rev=d===lc?(lc._rev||0):svRev;
  if(!d){try{d=JSON.parse(localStorage.getItem('onderwereld_v1'))}catch(e){}}
  // beheerder heeft het account gereset: helemaal opnieuw beginnen (ook de browseropslag telt niet meer)
  if(d&&d.__reset){const f=fresh();f.trainV=2;if(window.__USER__)f.name=window.__USER__;f._admin={notes:['Je account is door een beheerder gereset. Je begint opnieuw.']};return f}
  if(d&&d.npcs){const f=fresh(),oldBiz=!d.biz2,tv=d.trainV,oldTrain=tv!==2||Object.values(d.train||{}).some(n=>n>0),oldGear=d.gearV!==2;d=Object.assign(f,d);d.stats=Object.assign(fresh().stats,d.stats);d.skills=Object.assign(fresh().skills,d.skills);d.train=d.train||{};d.buffs=d.buffs||{};d.redeemed=d.redeemed||[];d.home=d.home||'brug';if(d.pendingArrest===undefined)d.pendingArrest=null;
    if(d.family==='rossi')d.family='colombra';if(d.family==='syndicaat')d.family='lucchetti';if(d.energy==null)d.energy=100;
    if(oldTrain){d.trainV=1;migrateTrain(d)}d.dep=Array.isArray(d.dep)?d.dep:[];
    // bestaande familieleden: starten als Lid (nieuwe leden beginnen als Aspirant)
    if(d.family&&(!d.fr||d.fr.id!==d.family)){const t=Math.max(0,FAMILIES.findIndex(f=>f.id===d.family));d.fr={id:d.family,eer:Math.round(FAM_RANKS[1][1]*(1+t*.5)),since:Date.now()}}
    // uitrusting: vroeger telde alles bij elkaar op, nu per soort je beste item. Overbodige oude items krijg je terug.
    if(oldGear){d.gear=d.gear||{};let back=0;GEAR_CATS.forEach(c=>{const own=GEAR.filter(g=>g.cat===c.id&&d.gear[g.id]);own.slice(0,-1).forEach(g=>{back+=g.p;delete d.gear[g.id]})});if(back){d.cash+=back;d._gearBack=back}d.gearV=2}d.inv=d.inv||{};d.furn=d.furn||{};d.carDex=d.carDex||{};
    // oude saves: aantal bedrijven per soort → vestigingen op level 1
    if(oldBiz){d.biz2={};Object.entries(d.biz||{}).forEach(([k,n])=>{if(n>0)d.biz2[k]=Array(n).fill(1)})}
    if(window.__USER__)d.name=window.__USER__;return d}
  const f=fresh();f.trainV=2;if(window.__USER__)f.name=window.__USER__;return f}
let _pushTimer=null,_lastPush=0,_retry=0,_inFlight=false,_pushAgain=false;
// Opslaan naar de server, één tegelijk (anders kan een oudere stand een nieuwere inhalen). Bij weggaan (beacon) altijd meteen;
// de server negeert zelf een oudere stand van hetzelfde apparaat.
function pushState(beacon){
  if(!window.__TOKEN__)return Promise.resolve();
  if(window.__LOCKED__)return Promise.resolve();
  if(_inFlight&&!beacon){_pushAgain=true;return Promise.resolve()}
  S._dev=DEV_ID;if(!S.savedAt)S.savedAt=Date.now();
  if(!beacon)_inFlight=true;const done=()=>{if(beacon)return;_inFlight=false;if(_pushAgain){_pushAgain=false;clearTimeout(_pushTimer);_pushTimer=setTimeout(()=>pushState(),50)}};
  const body=JSON.stringify({sid:window.__SID__||null,state:Object.assign({},S,{rankname:RANKS[rankIdx(S.xp)][0],bankExtra:typeof bankNet==='function'?Math.floor(bankNet()-S.bank):0})});
  const again=()=>{if(beacon)return;clearTimeout(_pushTimer);_retry=Math.min(_retry+1,6);_pushTimer=setTimeout(()=>pushState(),Math.min(60000,2000*Math.pow(2,_retry)))};
  let pr=Promise.resolve();
  try{pr=fetch('/api/state',{method:'POST',keepalive:!!beacon&&body.length<60000,headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__TOKEN__},body})
    .then(r=>{if(r.status===401){try{localStorage.removeItem('ow_token')}catch(e){}location.replace('/');return}if(r.status===409||r.status===403){r.json().then(j=>deviceLock(j&&j.code)).catch(()=>deviceLock());return}if(!r.ok){again();return}_retry=0;
      return r.json().then(j=>{if(j&&j.rev){S._rev=j.rev;try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}}}).catch(()=>{})}).catch(again).finally(done)}catch(e){done();again()}
  _lastPush=Date.now();return pr}
// Ander apparaat heeft het spel geopend: hier stoppen met opslaan en dat duidelijk laten zien
// Of een beheerder heeft je account aangepast: dan opnieuw laden met de nieuwe stand. Geblokkeerd: terug naar de voorpagina.
function deviceLock(code){if(window.__LOCKED__)return;window.__LOCKED__=true;clearTimeout(_pushTimer);
 // loopt er nog een slotronde (bonus)? Die is al verrekend en opgeslagen: eerst rustig laten uitspelen, daarna de melding
 const busy=()=>(window.kk&&kk.busy)||(window.vd&&vd.busy);if(code!=='banned'&&busy()){const w=()=>{if(busy())setTimeout(w,700);else deviceLockShow(code)};setTimeout(w,700);return}
 deviceLockShow(code)}
function deviceLockShow(code){
 const T={admin_update:['Je account is bijgewerkt','Een beheerder heeft je account aangepast. Laad het spel opnieuw om de nieuwe stand te zien. Wat je hier in de laatste seconden deed, telt niet mee.','Opnieuw laden'],
  banned:['Dit profiel is verbannen','Een beheerder heeft dit profiel verbannen. Je kunt er niet meer mee spelen, maar je kunt wel een nieuw profiel aanmaken.','Nieuw profiel maken'],
  other_device:['Je speelt op een ander apparaat','Je account is ergens anders geopend. Om te voorkomen dat je voortgang dubbel of verkeerd wordt opgeslagen, kun je maar op één apparaat tegelijk spelen. Wat je hier sinds de vorige opslag deed, telt niet mee.','Hier verder spelen']}[code==='admin'?'admin_update':code]||null;
 const t=T||['Je speelt op een ander apparaat','Je account is ergens anders geopend. Om te voorkomen dat je voortgang dubbel of verkeerd wordt opgeslagen, kun je maar op één apparaat tegelijk spelen. Wat je hier sinds de vorige opslag deed, telt niet mee.','Hier verder spelen'];
 const d=document.createElement('div');d.id='devLock';d.innerHTML=`<div class="dl-card"><span class="label">Account</span><b>${t[0]}</b><p>${t[1]}</p><button class="btn" onclick="${code==='banned'?"try{localStorage.removeItem('ow_token')}catch(e){};location.replace('/?register=1&banned=1')":'location.reload()'}">${t[2]}</button></div>`;document.body.appendChild(d)}
// terug naar dit tabblad: meteen kijken of we nog het actieve apparaat zijn
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'||!window.__TOKEN__||!window.__SID__||window.__LOCKED__)return;
 fetch('/api/session?sid='+window.__SID__,{headers:{Authorization:'Bearer '+window.__TOKEN__}}).then(r=>r.ok?r.json():r.status===403?{active:false,reason:'banned'}:null).then(j=>{if(j&&j.active===false)deviceLock(j.reason)}).catch(()=>{})});
// belangrijke momenten (casino, aankopen) meteen naar de server
function pushSoon(){if(!window.__TOKEN__||window.__LOCKED__)return;clearTimeout(_pushTimer);_pushTimer=setTimeout(()=>pushState(),150)}
function save(){
  S.savedAt=Math.max(Date.now(),(S.savedAt||0)+1);S._dev=DEV_ID;
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}
  if(!window.__TOKEN__)return;
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>pushState(),Date.now()-_lastPush>15000?400:3000)}
// weggaan uit de app of het tabblad: eerst de laatste stand in de browser vastleggen, dan meteen naar de server (keepalive)
const flushNow=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}clearTimeout(_pushTimer);pushState(true)};
window.addEventListener('pagehide',flushNow);document.addEventListener('freeze',flushNow);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushNow()});
function logout(){pushState(true);try{localStorage.removeItem('ow_token')}catch(e){}setTimeout(()=>location.replace('/'),150)}
S=load();
// Zwart geld: wat je verdient met klussen, huurmoorden, auto's, de familie en bendes. S.zwart = het deel van je contant geld
// dat zwart is. Gewoon uitgeven (wapens, kleding, training, ontspannen) gaat eerst van je zwarte geld. De bank, deposito's,
// beleggen, zaken en woningen nemen alleen wit geld (spendWit). In het casino regelt casinoRound het zwarte deel van je
// inzet, met een kans op een controle; uitbetalingen uit het casino zijn wit. Witwassen: pages/witwas.js.
let zwWit=false;
const zwCasino=()=>typeof page!=='undefined'&&page==='casino';
function zwInit(){const d=Object.getOwnPropertyDescriptor(S,'cash');if(d&&d.get)return;let c=+S.cash||0;S.zwart=Math.max(0,Math.min(c,+S.zwart||0));
 Object.defineProperty(S,'cash',{enumerable:true,configurable:true,get(){return c},set(v){v=+v||0;const dl=v-c;c=v;
  if(dl<0&&!zwWit&&!zwCasino())S.zwart=Math.max(0,(S.zwart||0)+dl);if((S.zwart||0)>c)S.zwart=Math.max(0,c)}})}
zwInit();
const zwart=()=>Math.max(0,Math.min(S.cash,S.zwart||0));
const wit=()=>Math.max(0,S.cash-zwart());
function addZwart(x){x=+x||0;if(x>0)S.zwart=Math.min(S.cash,(S.zwart||0)+x)}
function spendWit(x){zwWit=true;try{S.cash-=x}finally{zwWit=false}}
// Casino: je kiest zelf of je speelt met wit (legaal) of zwart geld (S.casPay). Wat je wint is altijd wit.
// Verdenking (0-100%) loopt op per ronde: vooral met zwart geld en grote inzetten, het snelst bij de slots (daar was je
// zwart geld het makkelijkst wit), minder bij kaarten en roulette, het minst bij Mines en Hoogvlieger. VIP ±35% en
// High roller ±65% minder (het casino verwacht dat zij veel geld hebben). Kijkt de beveiliging (ogen open) dan telt het
// gewoon, kijken ze naar jouw tafel (rood) dan ruim dubbel, ogen dicht maar een derde. Zakt 3% per minuut in het casino,
// 6% per minuut als je weg bent. Op 100%: verbannen (30 / 20 / 10 minuten), daarna begint het weer op 0%.
const czLim=()=>20000*Math.pow(1.35,rankIdx(S.xp));
const CZ_GAME={kluis:1.4,vis:1.4,roulette:1,bj:.85,tcp:.85,th:.85,coin:.8,mines:.55,avia:.55},CZ_TIER=[1,.65,.35],CZ_BAN=[30,20,10],CZ_EYE=[.35,1,2.3];
const casPayMode=()=>S.casPay==='zwart'?'zwart':'wit';
const casCash=()=>casPayMode()==='zwart'?zwart():wit();
const casShort=()=>casPayMode()==='zwart'?'Niet genoeg zwart geld. Speel met wit geld of was je geld wit.':zwart()>=1?'Niet genoeg wit geld. Kies "zwart" om met je zwarte geld te spelen.':'Niet genoeg contant geld';
// ogen van de beveiliging: per periode van 40 s dicht, open of op jouw tafel gericht (voor iedereen hetzelfde ritme per speler)
function czEyes(t){t=t||now();const P=40000,k=Math.floor(t/P),x=(t%P)/P;let h=2166136261;const sd=String(k)+(S.name||'');for(const c of sd)h=Math.imul(h^c.charCodeAt(0),16777619);const r=((h>>>0)%1000)/1000;
 const closed=.32+r*.2,red=.16+r*.12;return x<closed?0:x<1-red?1:2}
const czEyesLeft=()=>{const P=40000,t=now();let e=czEyes(t),d=0;while(d<P&&czEyes(t+d)===e)d+=500;return d};
const czBanLeft=()=>S.czBan?Math.max(0,S.czBan-now()):0;
function czVal(){const C=S.cz;if(!C)return 0;const m=Math.max(0,(now()-(C.t||now()))/60000),onCas=typeof page!=='undefined'&&page==='casino';C.s=Math.max(0,(C.s||0)-m*(onCas?3:6));C.t=now();if(!C.s)C.g=0;return C.s}
function zwCasinoRound(stake,game){if(!(stake>0))return;const C=S.cz||(S.cz={s:0,t:now(),g:0});czVal();
 const gw=CZ_GAME[game]||1,tf=CZ_TIER[typeof tier==='function'?tier():0]||1,ew=CZ_EYE[czEyes()];let gain;
 if(casPayMode()==='zwart'){const used=Math.min(zwart(),stake);S.zwart=zwart()-used;C.g=(C.g||0)+used;gain=(used/czLim()*90+.1)*gw*tf*ew}
 else gain=stake/czLim()*12*gw*tf*ew;
 C.s=Math.min(100,C.s+gain);if(C.s>=100)window.__czBan=true}
if(window.__PUSH_LOCAL__)setTimeout(()=>pushState(),1200);
if(window.__REDEEMED__)window.__REDEEMED__.forEach(c=>{if(!S.redeemed.includes(c))S.redeemed.push(c)});
S.redeemed=S.redeemed.filter(c=>LIVE_CODES[c]||RANK_CODES[c]);

const rankIdx=xp=>{let i=0;RANKS.forEach((r,j)=>{if(xp>=r[1])i=j});return i};
// Levels binnen een rang (1-5): hoe meer ervaring in je rang, hoe meer je verdient (+3% buit per level).
// Peetvader heeft eigen drempels, zodat ook de top nog iets te halen heeft.
const RANK_SUB=5,RANK_SUB_LOOT=.03,TOP_STEPS=[100000,150000,225000,340000,500000];
function rankLevel(xp){const i=rankIdx(xp);if(i>=RANKS.length-1){let l=0;TOP_STEPS.forEach(t=>{if(xp>=t)l++});return Math.max(1,l)}
 const a=RANKS[i][1],b=RANKS[i+1][1];return Math.min(RANK_SUB,1+Math.floor((xp-a)/(b-a)*RANK_SUB))}
function rankLevelNext(xp){const i=rankIdx(xp),l=rankLevel(xp);if(i>=RANKS.length-1)return l<RANK_SUB?TOP_STEPS[l]:null;const a=RANKS[i][1],b=RANKS[i+1][1];return l<RANK_SUB?a+(b-a)*l/RANK_SUB:b}
const rankLvlBonus=()=>(rankLevel(S.xp)-1)*RANK_SUB_LOOT;
const rankLvlInfo=()=>{const l=rankLevel(S.xp),n=rankLevelNext(S.xp),b=Math.round(((rankIdx(S.xp)*RANK_LOOT)+rankLvlBonus())*100);
 return `Level ${l}/${RANK_SUB} · +${b}% buit${n?` · level ${l+1} op ${Math.ceil(n).toLocaleString('nl-NL')} XP`:l>=RANK_SUB?' · hoogste level':''}`};
const rankStars=xp=>{const l=rankLevel(xp);return `<span class="rk-stars" title="Level ${l} van ${RANK_SUB} in deze rang">${'★'.repeat(l)}<i>${'★'.repeat(RANK_SUB-l)}</i></span>`};
// Wachttijden per lidmaatschap (klussen, auto's, training, ontspanning, rusten, dokter, familieklus): VIP 75%, High roller 55%
const TIER_WAIT=[1,.75,.55];const waitK=()=>TIER_WAIT[tier()]||1;
const inJail=()=>S.jailUntil>now();
// per soort telt je beste item (het duurste dat je hebt)
const gearBest=cat=>{let b=null;GEAR.forEach(g=>{if(g.cat===cat&&S.gear&&S.gear[g.id])b=g});return b};
const gearSum=k=>GEAR_CATS.reduce((a,c)=>{const g=gearBest(c.id);return a+((g&&g[k])||0)},0);
const gearBonus=()=>gearSum('kans');
const gearFx=k=>gearSum(k)/100;
// outfit (kleding en sieraden, zie pages/look.js): voordelen per stuk plus setbonus
const fitFx=k=>typeof outfitFx==='function'?outfitFx(k):0;
const gearVk=()=>gearSum('vk');
// hitte erbij, minder met communicatiemiddelen (kansrekening voor de rest, zodat kleine getallen ook tellen)
function addHeat(h){h*=(1-gearFx('heat'))*(1-famPerk('heat'))*(1-fitFx('heat'));S.heat=Math.min(100,S.heat+Math.floor(h)+(Math.random()<h%1?1:0))}
// Familie: je begint onderaan (Aspirant) en klimt met eer. Familiebonus en eigen voordeel groeien van 50% naar 100%.
const famBase=()=>FAMILIES.find(f=>f.id===S.family)||null;
const famTier=()=>{const f=famBase();return f?FAMILIES.indexOf(f):0};
const famNeed=(i,t)=>Math.round(FAM_RANKS[i][1]*(1+(t==null?famTier():t)*.5));
const famEer=()=>(S.family&&S.fr&&S.fr.id===S.family)?S.fr.eer:0;
// Boven Erelid (FAM_TOP) alleen met een titel: S.fr.lead 1 = Onderbaas, 2 = Baas. Zakt je eer onder Erelid, dan vervalt die.
const FAM_TOP=Math.max(0,FAM_RANKS.findIndex(r=>r[2])-1);
const famLead=()=>(S.family&&S.fr&&S.fr.id===S.family&&S.fr.lead)||0;
const famRankEer=()=>{if(!S.family)return 0;let r=0;FAM_RANKS.forEach((x,i)=>{if(!x[2]&&famEer()>=famNeed(i))r=i});return r};
const famRankIdx=()=>{const r=famRankEer();return r>=FAM_TOP&&famLead()?Math.min(FAM_RANKS.length-1,FAM_TOP+famLead()):r};
const famScale=()=>{const i=famRankIdx();return i>FAM_TOP+1?1.25:.5+.1*i};
const fam=()=>{const f=famBase();if(!f)return {chance:0,loot:0,jail:0};const k=famScale();
 return Object.assign({},f,{chance:Math.round(f.chance*k*10)/10,loot:Math.round(f.loot*k*10)/10,jail:Math.round(f.jail*k*10)/10})};
const famPerk=k=>{const f=famBase();return f&&f.perk.fx[k]?f.perk.fx[k]*famScale():0};
const furnFx=k=>FURN.reduce((a,f)=>a+((S&&S.furn&&S.furn[f.id])?(f.fx[k]||0):0),0);
const buffFocus=()=>(S.buffs&&S.buffs.focus&&S.buffs.focus.until>now())?S.buffs.focus.pct:0;
const buffLoot=()=>(S.buffs&&S.buffs.loot&&S.buffs.loot.until>now())?S.buffs.loot.pct:0;
const sk=id=>(S.skills&&S.skills[id])||0;
// buit-vermenigvuldiger bij klussen: familie × (rang + rang-level + hacken + buit-buff + uitrusting) × lidmaatschap
const lootMult=()=>(1+fam().loot/100)*(1+rankIdx(S.xp)*RANK_LOOT+rankLvlBonus()+sk('hack')*SK.hack.loot/100+buffLoot()/100+gearFx('buit')+fitFx('buit'))*(1+tierLoot());
const focusPct=()=>buffFocus()+furnFx('focus');
// slaagkans: alle bonussen opgeteld, daarna × lidmaatschap (VIP ×1,15, High roller ×1,4), altijd tussen 5% en 95%
// Vakmanschap per klus: hoe vaker een klus lukt, hoe beter je erin wordt (Brons 10, Zilver 30, Goud 75, Meester 150 keer).
// Per niveau +2% kans en +5% buit op die klus.
const MAST=[[0,'Nieuw'],[10,'Brons'],[30,'Zilver'],[75,'Goud'],[150,'Meester']];
const mastN=id=>(S.mast&&S.mast[id])||0;
const mastLv=id=>{const n=mastN(id);let l=0;MAST.forEach((m,i)=>{if(n>=m[0])l=i});return l};
const mastLoot=id=>1+mastLv(id)*.05;
const chanceRaw=c=>mastLv(c.id)*2+c.base+rankIdx(S.xp)*2+gearBonus()+fitFx('kans')+fam().chance+S.skills.steal*(c.id==='zakken'?SK.steal.zakken:SK.steal.all)+(c.r>=HEAVY_R?sk('schiet')*SK.schiet.heavy:0)+focusPct()-Math.floor(S.heat/4);
const chance=c=>Math.max(5,Math.min(95,Math.round(chanceRaw(c)*(1+tierK()))));
// straf 30 s – 10 min, plus 30–60 s (hoe langer de straf, hoe meer) omdat je in de bajes kunt werken: 1 – 11 minuten
const jailSec=sec=>{const b=Math.max(30,Math.min(600,Math.round(sec*(1-fam().jail/100)*(1-sk('rechten')*SK.rechten.jail/100)*(1-gearFx('jail')))));return b+Math.round(30+30*(b-30)/570)};
function sendToJail(sec){sec=jailSec(sec);S.lastSentence=sec;S.jailUntil=now()+sec*1000;if(typeof celNew==='function')celNew(sec);return sec}
// Borg groeit met je rang: als Dief kost 2 minuten zo'n €900, als Peetvader 10 minuten zo'n €150.000. Charisma geeft korting.
const bailRate=()=>2*Math.pow(1.55,rankIdx(S.xp));
function bailCost(){const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000));if(!left)return 0;return Math.max(50,Math.round(left*bailRate()*(1-S.skills.charisma*SK.charisma.bail)*(1-sk('rechten')*SK.rechten.bail/100)*(1-famPerk('bail'))*(1-fitFx('bail'))/10)*10)}
const talkChance=()=>Math.min(45,Math.round(S.skills.charisma*SK.charisma.talk));
// Arrestatie met de keuze om je eruit te praten (charisma)
// Arrestatie: vluchten (vluchtspel), je eruit praten (charisma) of je overgeven.
// opts: {mult: factor op praatkans, raid: politiecontrole bij gezochte speler, flee: moeilijkheid 1-5}
// Arrestatie: vluchten (vluchtspel), je eruit praten (charisma) of je overgeven.
// opts: {mult: factor op praatkans, raid: politiecontrole bij gezochte speler, flee: moeilijkheid 1-5}
// De arrestatie wordt direct opgeslagen (S.pendingArrest), zodat verversen je er niet uit haalt.
function jailFor(pa,extra,why){const s=sendToJail(pa.sec*(extra||1));if(pa.opts&&pa.opts.raid){S.wanted=false;S.stats.raids=(S.stats.raids||0)+1}
  S.pendingArrest=null;log((why||pa.title)+'. '+fmtTime(s)+' de bajes in','bad');save();pushState();closeModal();
  page='jail';try{history.replaceState(null,'','#jail')}catch(e){}render();toast('Opgepakt: '+fmtTime(s),'bad')}
function arrest(sec,title,msg,opts){
  opts=opts||{};
  // Lucchetti: een rechter van de familie seponeert de zaak (één keer gooien per arrestatie, ook na verversen)
  if(!opts.rolled){opts.rolled=true;const p=famPerk('free');if(p&&Math.random()<p){S.pendingArrest=null;log('Zaak geseponeerd door een rechter van '+famBase().n,'ok');save();toast('Een rechter van de familie seponeert je zaak. Je bent vrij.','lvl');render();return}}const mult=opts.mult==null?1:opts.mult,raid=!!opts.raid;
  const pa={sec,title,msg,opts,fleeing:false};S.pendingArrest=pa;save();pushState();
  const ch=Math.round(talkChance()*mult);
  const plain=jailSec(sec);
  const goJail=(extra,why)=>jailFor(pa,extra,why);
  const btns=[];
  if(opts.flee){const L=FLEE_LEVELS[opts.flee];
    btns.push({l:'Vluchten · '+L.label,c:'',f:()=>{pa.fleeing=true;S.pendingArrest=pa;save();pushState();closeModal();fleeGame(opts.flee).then(ok=>{
      if(ok){S.pendingArrest=null;S.stats.fled=(S.stats.fled||0)+1;S.cred+=1;S.heat=Math.min(100,S.heat+5);addXp(3);
        if(opts.wanted&&!raid&&typeof setWanted==='function')setWanted(opts.wanted.lv,opts.wanted.t,opts.wanted.sec); // na een huurmoord: ontkomen, wel gezocht
        log(raid?'Politiecontrole ontvlucht. Je staat nog op de gezochtlijst':'Gevlucht en de politie kwijtgeraakt','ok');save();pushState();render();
        toast(raid?'Ontglipt! Maar je wordt nog steeds gezocht.':'Ontkomen! De politie is je kwijt.')}
      else goJail(1.2,'Vluchtpoging mislukt (+20% straf)')})}});
  }
  if(ch>0)btns.push({l:'Praat je eruit · '+ch+'%',c:'ghost',f:()=>{if(rnd(1,100)<=ch){S.pendingArrest=null;S.cred+=1;addXp(5);log('Uit een arrestatie gepraat','ok');save();pushState();closeModal();render();toast('Je praat je eruit. De agent laat je gaan.')}else goJail(1.25,'Praatje mislukt, de agent wordt boos (+25% straf)')}});
  btns.push({l:'Geef je over · '+fmtTime(plain),c:'red',f:()=>goJail()});
  const hint=opts.flee?' Vlucht je en lukt het, dan ben je vrij. Mislukt het, dan krijg je 20% extra straf.':'';
  showModal(title,msg+hint,btns);
}
// Na verversen: een open arrestatie komt terug; een afgebroken vlucht of autodiefstal telt als mislukt.
function resumePending(){
  if(S.pendingJack){S.pendingJack=null;log('Carjacking afgebroken: de auto reed weg','bad')}
  if(S.pendingHeist){const c=CARS.find(k=>k.id===S.pendingHeist.id)||CARS[0];S.pendingHeist=null;S.heat=Math.min(100,S.heat+4+c.d*2);log('Autodiefstal afgebroken: '+c.n,'bad');
    arrest(30+c.d*20,'Alarm!','Je liet de '+c.n+' halverwege staan en het alarm ging af.',{flee:Math.min(5,Math.max(1,c.d))});return}
  if(S.pendingHit){const H=(typeof HITS!=='undefined'&&HITS.find(h=>h.id===S.pendingHit.id))||{t:'het doelwit',d:3};S.pendingHit=null;addHeat(15);log('Huurmoord afgebroken','bad');
    arrest(typeof hitJail==='function'?hitJail(H):300,'Gezien!','Je liet het contract op '+H.t+' halverwege liggen. Iemand heeft je gezien.',{flee:Math.min(5,H.d)});return}
  const pa=S.pendingArrest;if(!pa)return;
  if(pa.fleeing){jailFor(pa,1.2,'Vluchtpoging afgebroken (+20% straf)');return}
  arrest(pa.sec,pa.title,pa.msg,pa.opts);
}
function policeRaid(){
  if(!S.wanted||inJail()||!$('#modal').hidden||window.__chase)return false;
  S.heat=Math.min(100,S.heat+20);
  if(window.bj&&!bj.done){bj.done=true;bj.msg='Spel afgebroken door de politie';S.stats.lost+=bj.bet}
  arrest((S.wanted&&S.wanted.sec)||S.lastSentence+120,'Politiecontrole!','Agenten doen een controle '+(PLACES[page]||'op straat')+' en herkennen je van de gezochtlijst.',{mult:0.5,raid:true,flee:S.wanted&&S.wanted.lv>=3?4:3});return true}
const fmtClock=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const fmtTime=s=>{s=Math.round(s);return s>=60?Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s':s+'s'};
function showModal(t,m,btns){$('#modal').hidden=false;$('#modalT').textContent=t;$('#modalM').textContent=m;
  btns=btns||[{l:'Begrepen',c:'red',f:closeModal}];const box=$('#modalB');box.innerHTML='';
  btns.forEach(b=>{const e=document.createElement('button');e.className='btn '+(b.c||'');e.textContent=b.l;e.onclick=b.f;box.appendChild(e)})}
function closeModal(){$('#modal').hidden=true}
// VIP en High roller: tag bij je naam, vaker de bonus in de slots en cashback op elke inzet (High roller ×1,5).
// Cashback per spel, afgestemd op het huisvoordeel, zodat je er nooit structureel winst mee maakt. Direct te claimen.
const CB_RATE={kluis:.005,vis:.005,mines:.005,avia:.005,roulette:.01,tcp:.0075,th:.005,bj:.0025,coin:0};
const CB_NAME={kluis:'Kluiskraker',vis:'Visdief',mines:'Mines',avia:'Hoogvlieger',roulette:'Roulette',tcp:'Three Card Poker',th:"Texas Hold'em",bj:'Blackjack',coin:'Dubbel of niks'};
// Lidmaatschap: 0 = gewoon, 1 = VIP, 2 = High roller. Komt van je account (beheerder); oude VIP-code telt nog als VIP.
const tier=()=>{const t=window.__TIER__;if(t!=null)return t;return (S&&S.redeemed&&S.redeemed.includes('vip'))?1:0};
const isVip=()=>tier()>=1;
const isHR=()=>tier()>=2;
// algemeen voordeel per lidmaatschap: VIP +15%, High roller +40% (slaagkans, vluchten, ontsnappen, straatcredit, bankrente)
const TIER_K=[0,.15,.40];const tierK=()=>TIER_K[tier()]||0;
const TIER_NAME=['Gewoon','VIP','High roller'];const lidName=()=>TIER_NAME[tier()];
const TIER_LOOT=[0,.10,.25];const tierLoot=()=>TIER_LOOT[tier()]||0;
const TIER_CB=[0,1,1.5];
// Straatcredit: je krijgt het voor goed uitgevoerde klussen. Betere uitrusting = meer respect op straat.
// Per soort telt je beste item: tier × 4% (alles op het hoogste = +76%). Perfect uitgevoerd ×1,5, netjes ×1,2.
const gearCredK=()=>GEAR_CATS.reduce((a,c)=>{const g=gearBest(c.id);return a+(g?GEAR.filter(x=>x.cat===c.id).indexOf(g)+1:0)},0)*.04;
const credMult=q=>(1+gearCredK())*(1+tierK())*(q==='perfect'?1.5:q==='netjes'?1.2:1);
const credGain=(base,q)=>{const v=base*credMult(q);return Math.floor(v)+(Math.random()<v%1?1:0)};
// ontsnappen uit de bajes: 35% basis × lidmaatschap, plus het familievoordeel
const escChance=()=>.35*(1+tierK())+famPerk('esc')+fitFx('esc');
// tags in lijsten: echte spelers krijgen 'Speler', plus VIP of High roller (t = lidmaatschap 0/1/2)
const lidTag=t=>+t>=2?'<i class="vipt hr" title="High roller">HIGH ROLLER</i>':+t>=1?'<i class="vipt" title="VIP-lid">VIP</i>':'';
const playerTags=t=>'<i class="spt" title="Echte speler">SPELER</i>'+lidTag(t);
// tag bij je naam; kort = 'HR' voor smalle plekken (balk bovenin)
const vipTag=short=>isHR()?`<i class="vipt hr" title="High roller">${short?'HR':'HIGH ROLLER'}</i>`:isVip()?'<i class="vipt" title="VIP-lid">VIP</i>':'';
// Elke afgeronde casinoronde: inzet, wat je terugkreeg en welk spel. VIP spaart een vast percentage van de inzet op.
function casinoRound(stake,pay,game){zwCasinoRound(stake,game);if(typeof pushSoon==='function')setTimeout(pushSoon,0);if(!isVip())return;const r=(CB_RATE[game]||0)*(TIER_CB[tier()]||0);if(!r||!stake)return;S.cb=S.cb||{};S.cb.acc=(S.cb.acc||0)+stake*r;S.cb.tot=(S.cb.tot||0)+stake*r;
  const el=document.getElementById('cbAmt');if(el)el.textContent=fmt(cbAvail());const bt=document.getElementById('cbBtn');if(bt){bt.disabled=cbAvail()<1;bt.textContent=cbAvail()>=1?'Claimen':'Nog niks te claimen'}}
const cbAvail=()=>isVip()&&S.cb?Math.floor(S.cb.acc||0):0;
const crimeCd=c=>c.cd*1000*(1-S.skills.speed*SK.speed.cd)*(1-famPerk('cd'))*(1-fitFx('cd'))*waitK();
const carCd=()=>30000*(1-S.skills.speed*SK.speed.cd)*waitK();
const RL_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numCol=n=>n===0?'green':REDS.has(n)?'red':'black';
window.rl={bets:{},angle:0,spinning:false,hist:[],chip:100,res:null,net:0};
// Inkomen per speldag (4 uur): per vestiging het inkomen van zijn level
const bizUnits=id=>(S.biz2&&S.biz2[id])||[];
function bizMult(){let u=0,up=0;BIZ.forEach(b=>bizUnits(b.id).forEach(l=>{u++;up+=l-1}));const imp=Math.min(BIZ_IMP_MAX,u*BIZ_IMP_UNIT+up*BIZ_IMP_UP),rk=rankIdx(S.xp)*BIZ_RANK+(rankLevel(S.xp)-1)*.005;
 return {units:u,ups:up,imp,rk,total:BIZ_BOOST*(1+imp)*(1+rk)*(1+sk('handel')*SK.handel.inc/100)*(1+famPerk('inc'))*(1+fitFx('inc'))}}
const bizIncome=id=>{const b=BIZ.find(x=>x.id===id);return bizUnits(id).reduce((a,l)=>a+bizInc(b,l),0)};
const income=()=>BIZ.reduce((a,b)=>a+bizIncome(b.id),0); // per speldag (4 uur)
// Speldag: 4 uur, vaste tijden (00:00, 04:00, 08:00 ... op je eigen klok). Bedrijven sparen in de kas en betalen aan het eind uit.
const dayStart=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.floor(d.getHours()/4)*4).getTime()};
const nextPayout=()=>dayStart(now())+DAY_MS;
function bizPayTick(mins,t){S.kas=(S.kas||0)+income()/240*mins;const ds=dayStart(t);if(!S.kasDay)S.kasDay=ds;
 if(ds>S.kasDay){const pay=Math.floor(S.kas);S.kasDay=ds;S.kas=0;if(pay>0){S.cash+=pay;toast('Je bedrijven betalen uit: +'+fmt(pay),'lvl');log('Uitbetaling bedrijven: +'+fmt(pay),'ok')}}}

function toast(msg,cls='ok'){const t=document.createElement('div');t.className='toast '+cls;t.textContent=msg;$('#toasts').prepend(t);setTimeout(()=>t.remove(),3200)}
// delay: de regel blijft verborgen tot de animatie klaar is (casino), zodat het logboek de uitslag niet verraadt
function log(msg,cls='info',delay){const e={m:msg,c:cls,t:now()};if(delay)e.r=now()+delay;S.log.unshift(e);S.log=S.log.slice(0,40);return e}
const logShown=()=>S.log.filter(l=>!(l.r>now()));
function addXp(x){x*=(1+famPerk('xp'))*(1+fitFx('xp'));const before=rankIdx(S.xp),bl=rankLevel(S.xp);S.xp+=x;const after=rankIdx(S.xp),al=rankLevel(S.xp);if(after>before){toast('Promotie: je bent nu '+RANKS[after][0]+'! Claim je beloning op je profiel.','lvl');log('Gepromoveerd tot '+RANKS[after][0],'ok')}
  else if(al>bl){toast(RANKS[after][0]+' level '+al+': +'+Math.round(RANK_SUB_LOOT*100)+'% extra buit','lvl');log(RANKS[after][0]+' level '+al+' bereikt','ok')}}

const EN_BASE=100,EN_REGEN_S=18; // 1 energie per 18 seconden
// Maximale energie groeit met Conditie (sportschool): +5 per level
const home=()=>HOMES.find(h=>h.id===((S&&S.home)||'brug'))||HOMES[0];
Object.defineProperty(window,'EN_MAX',{get:()=>EN_BASE+Math.round(SK.conditie.en*((S&&S.skills&&S.skills.conditie)||0))+((S&&S.home)?home().en:0)+((S&&S.furn)?furnFx('en'):0),configurable:true});
