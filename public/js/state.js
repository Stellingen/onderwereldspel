// Spelerstatus, opslaan/laden, spelregels, arrestaties, skills, meldingen
let S;
function fresh(){return{name:'Jij',cash:250,bank:0,xp:0,hp:100,heat:0,jailUntil:0,cred:0,energy:100,family:null,skills:{steal:0,cars:0,charisma:0,speed:0,conditie:0,schiet:0,hack:0,handel:0,rechten:0},train:{},buffs:{},redeemed:[],home:'brug',furn:{},carDex:{},biz2:{},dep:[],inv:{},trainV:2,news:[],wanted:false,lastSentence:30,cd:{},cars:[],biz:{},gear:{},stats:{crimes:0,fails:0,cars:0,won:0,lost:0},log:[],last:now(),
  npcs:NPC_NAMES.map((n,i)=>({n,xp:Math.floor(200*Math.pow(1.55,i))+rnd(0,300),cash:rnd(1000,50000)*(i+1)}))}}
// Opslag: met account in de database (via /api/state), anders alleen in de browser.
const SAVE_KEY='onderwereld_v1'+(window.__USER__?'_'+window.__USER__.toLowerCase():'');
function load(){
  const sv=window.__SERVER_STATE__||null;let lc=null;try{lc=JSON.parse(localStorage.getItem(SAVE_KEY))}catch(e){}
  // de nieuwste opslag wint: als de server een update kreeg terwijl jij speelde, staat je laatste voortgang nog in de browser
  let d=sv;if(lc&&lc.npcs&&(!sv||(lc.savedAt||0)>(sv.savedAt||0))){d=lc;if(sv)window.__PUSH_LOCAL__=true}
  if(!d){try{d=JSON.parse(localStorage.getItem('onderwereld_v1'))}catch(e){}}
  if(d&&d.npcs){const f=fresh(),oldBiz=!d.biz2,tv=d.trainV,oldTrain=tv!==2||Object.values(d.train||{}).some(n=>n>0);d=Object.assign(f,d);d.stats=Object.assign(fresh().stats,d.stats);d.skills=Object.assign(fresh().skills,d.skills);d.train=d.train||{};d.buffs=d.buffs||{};d.redeemed=d.redeemed||[];d.home=d.home||'brug';if(d.pendingArrest===undefined)d.pendingArrest=null;
    if(d.family==='rossi')d.family='colombra';if(d.family==='syndicaat')d.family='lucchetti';if(d.energy==null)d.energy=100;
    if(oldTrain){d.trainV=1;migrateTrain(d)}d.dep=Array.isArray(d.dep)?d.dep:[];d.inv=d.inv||{};d.furn=d.furn||{};d.carDex=d.carDex||{};
    // oude saves: aantal bedrijven per soort → vestigingen op level 1
    if(oldBiz){d.biz2={};Object.entries(d.biz||{}).forEach(([k,n])=>{if(n>0)d.biz2[k]=Array(n).fill(1)})}
    if(window.__USER__)d.name=window.__USER__;return d}
  const f=fresh();f.trainV=2;if(window.__USER__)f.name=window.__USER__;return f}
let _pushTimer=null,_lastPush=0,_retry=0;
function pushState(beacon){
  if(!window.__TOKEN__)return Promise.resolve();
  const body=JSON.stringify({state:Object.assign({},S,{rankname:RANKS[rankIdx(S.xp)][0],bankExtra:typeof bankNet==='function'?Math.floor(bankNet()-S.bank):0})});
  const again=()=>{if(beacon)return;clearTimeout(_pushTimer);_retry=Math.min(_retry+1,6);_pushTimer=setTimeout(()=>pushState(),Math.min(60000,2000*Math.pow(2,_retry)))};
  let pr=Promise.resolve();
  try{pr=fetch('/api/state',{method:'POST',keepalive:!!beacon&&body.length<60000,headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__TOKEN__},body})
    .then(r=>{if(r.status===401){try{localStorage.removeItem('ow_token')}catch(e){}location.replace('/');return}if(!r.ok)again();else _retry=0}).catch(again)}catch(e){again()}
  _lastPush=Date.now();return pr}
function save(){
  S.savedAt=Date.now();
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}
  if(!window.__TOKEN__)return;
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>pushState(),Date.now()-_lastPush>15000?400:3000)}
window.addEventListener('pagehide',()=>pushState(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')pushState(true)});
function logout(){pushState(true);try{localStorage.removeItem('ow_token')}catch(e){}setTimeout(()=>location.replace('/'),150)}
S=load();
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
// VIP: alle wachttijden 60% van normaal (klussen, auto's, training, ontspanning, rusten, dokter)
const VIP_WAIT=.6;const waitK=()=>isVip()?VIP_WAIT:1;
const inJail=()=>S.jailUntil>now();
const gearBonus=()=>GEAR.reduce((a,g)=>a+(S.gear[g.id]?g.bonus:0),0);
const fam=()=>FAMILIES.find(f=>f.id===S.family)||{chance:0,loot:0,jail:0};
const furnFx=k=>FURN.reduce((a,f)=>a+((S&&S.furn&&S.furn[f.id])?(f.fx[k]||0):0),0);
const buffFocus=()=>(S.buffs&&S.buffs.focus&&S.buffs.focus.until>now())?S.buffs.focus.pct:0;
const buffLoot=()=>(S.buffs&&S.buffs.loot&&S.buffs.loot.until>now())?S.buffs.loot.pct:0;
const sk=id=>(S.skills&&S.skills[id])||0;
// buit-vermenigvuldiger bij klussen: familie × (rang + rang-level + hacken + buit-buff) × VIP
const lootMult=()=>(1+fam().loot/100)*(1+rankIdx(S.xp)*RANK_LOOT+rankLvlBonus()+sk('hack')*SK.hack.loot/100+buffLoot()/100)*(isVip()?1+VIP_LOOT:1);
const focusPct=()=>buffFocus()+furnFx('focus');
const chance=c=>Math.max(5,Math.min(95,c.base+rankIdx(S.xp)*2+gearBonus()+fam().chance+S.skills.steal*(c.id==='zakken'?SK.steal.zakken:SK.steal.all)+(c.r>=HEAVY_R?sk('schiet')*SK.schiet.heavy:0)+focusPct()-Math.floor(S.heat/4)));
function sendToJail(sec){sec=Math.max(30,Math.min(600,Math.round(sec*(1-fam().jail/100)*(1-sk('rechten')*SK.rechten.jail/100))));S.lastSentence=sec;S.jailUntil=now()+sec*1000;return sec}
// Borg groeit met je rang: als Dief kost 2 minuten zo'n €900, als Peetvader 10 minuten zo'n €150.000. Charisma geeft korting.
const bailRate=()=>2*Math.pow(1.55,rankIdx(S.xp));
function bailCost(){const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000));if(!left)return 0;return Math.max(50,Math.round(left*bailRate()*(1-S.skills.charisma*SK.charisma.bail)*(1-sk('rechten')*SK.rechten.bail/100)/10)*10)}
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
  opts=opts||{};const mult=opts.mult==null?1:opts.mult,raid=!!opts.raid;
  const pa={sec,title,msg,opts,fleeing:false};S.pendingArrest=pa;save();pushState();
  const ch=Math.round(talkChance()*mult);
  const plain=Math.max(30,Math.min(600,Math.round(sec*(1-fam().jail/100))));
  const goJail=(extra,why)=>jailFor(pa,extra,why);
  const btns=[];
  if(opts.flee){const L=FLEE_LEVELS[opts.flee];
    btns.push({l:'Vluchten · '+L.label,c:'',f:()=>{pa.fleeing=true;S.pendingArrest=pa;save();pushState();closeModal();fleeGame(opts.flee).then(ok=>{
      if(ok){S.pendingArrest=null;S.stats.fled=(S.stats.fled||0)+1;S.cred+=1;S.heat=Math.min(100,S.heat+5);addXp(3);
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
  if(S.pendingHeist){const c=CARS.find(k=>k.id===S.pendingHeist.id)||CARS[0];S.pendingHeist=null;S.heat=Math.min(100,S.heat+4+c.d*2);log('Autodiefstal afgebroken: '+c.n,'bad');
    arrest(30+c.d*20,'Alarm!','Je liet de '+c.n+' halverwege staan en het alarm ging af.',{flee:Math.min(5,Math.max(1,c.d))});return}
  const pa=S.pendingArrest;if(!pa)return;
  if(pa.fleeing){jailFor(pa,1.2,'Vluchtpoging afgebroken (+20% straf)');return}
  arrest(pa.sec,pa.title,pa.msg,pa.opts);
}
function policeRaid(){
  if(!S.wanted||inJail()||!$('#modal').hidden||window.__chase)return false;
  S.heat=Math.min(100,S.heat+20);
  if(window.bj&&!bj.done){bj.done=true;bj.msg='Spel afgebroken door de politie';S.stats.lost+=bj.bet}
  arrest(S.lastSentence+120,'Politiecontrole!','Agenten doen een controle '+(PLACES[page]||'op straat')+' en herkennen je van de gezochtlijst.',{mult:0.5,raid:true,flee:3});return true}
const fmtClock=ms=>{const t=Math.max(0,Math.ceil(ms/1000));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
const fmtTime=s=>{s=Math.round(s);return s>=60?Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s':s+'s'};
function showModal(t,m,btns){$('#modal').hidden=false;$('#modalT').textContent=t;$('#modalM').textContent=m;
  btns=btns||[{l:'Begrepen',c:'red',f:closeModal}];const box=$('#modalB');box.innerHTML='';
  btns.forEach(b=>{const e=document.createElement('button');e.className='btn '+(b.c||'');e.textContent=b.l;e.onclick=b.f;box.appendChild(e)})}
function closeModal(){$('#modal').hidden=true}
// VIP (code "vip"): tag bij je naam, iets vaker de bonus in Kluiskraker (alleen het basisspel) en cashback op elke inzet.
// Cashback per spel, afgestemd op het huisvoordeel, zodat je er nooit structureel winst mee maakt. Direct te claimen.
const CB_RATE={kluis:.005,vis:.005,mines:.005,avia:.005,roulette:.01,tcp:.0075,bj:.0025,coin:0};
const CB_NAME={kluis:'Kluiskraker',vis:'Visdief',mines:'Mines',avia:'Hoogvlieger',roulette:'Roulette',tcp:'Three Card Poker',bj:'Blackjack',coin:'Dubbel of niks'};
const isVip=()=>!!(S&&S.redeemed&&S.redeemed.includes('vip'));
// VIP bij misdaden: 15% meer buit, 10% groter groen gat bij vluchten en 10% meer kans om uit de bajes te ontsnappen
const VIP_LOOT=.15,VIP_FLEE=.10,VIP_ESCAPE=.10;
const escChance=()=>.35+(isVip()?VIP_ESCAPE:0);
const vipTag=()=>isVip()?'<i class="vipt" title="VIP-lid">VIP</i>':'';
// Elke afgeronde casinoronde: inzet, wat je terugkreeg en welk spel. VIP spaart een vast percentage van de inzet op.
function casinoRound(stake,pay,game){if(!isVip())return;const r=CB_RATE[game]||0;if(!r||!stake)return;S.cb=S.cb||{};S.cb.acc=(S.cb.acc||0)+stake*r;S.cb.tot=(S.cb.tot||0)+stake*r;
  const el=document.getElementById('cbAmt');if(el)el.textContent=fmt(cbAvail());const bt=document.getElementById('cbBtn');if(bt){bt.disabled=cbAvail()<1;bt.textContent=cbAvail()>=1?'Claimen':'Nog niks te claimen'}}
const cbAvail=()=>isVip()&&S.cb?Math.floor(S.cb.acc||0):0;
const crimeCd=c=>c.cd*1000*(1-S.skills.speed*SK.speed.cd)*waitK();
const carCd=()=>30000*(1-S.skills.speed*SK.speed.cd)*waitK();
const RL_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numCol=n=>n===0?'green':REDS.has(n)?'red':'black';
window.rl={bets:{},angle:0,spinning:false,hist:[],chip:100,res:null,net:0};
// Inkomen per minuut: per vestiging het inkomen van zijn level
const bizUnits=id=>(S.biz2&&S.biz2[id])||[];
function bizMult(){let u=0,up=0;BIZ.forEach(b=>bizUnits(b.id).forEach(l=>{u++;up+=l-1}));const imp=Math.min(BIZ_IMP_MAX,u*BIZ_IMP_UNIT+up*BIZ_IMP_UP),rk=rankIdx(S.xp)*BIZ_RANK+(rankLevel(S.xp)-1)*.01;
 return {units:u,ups:up,imp,rk,total:BIZ_BOOST*(1+imp)*(1+rk)*(1+sk('handel')*SK.handel.inc/100)}}
const bizIncome=id=>{const b=BIZ.find(x=>x.id===id);return bizUnits(id).reduce((a,l)=>a+bizInc(b,l),0)};
const income=()=>BIZ.reduce((a,b)=>a+bizIncome(b.id),0);

function toast(msg,cls='ok'){const t=document.createElement('div');t.className='toast '+cls;t.textContent=msg;$('#toasts').prepend(t);setTimeout(()=>t.remove(),3200)}
function log(msg,cls='info'){S.log.unshift({m:msg,c:cls,t:now()});S.log=S.log.slice(0,40)}
function addXp(x){const before=rankIdx(S.xp),bl=rankLevel(S.xp);S.xp+=x;const after=rankIdx(S.xp),al=rankLevel(S.xp);if(after>before){toast('Promotie: je bent nu '+RANKS[after][0]+'! Claim je beloning op je profiel.','lvl');log('Gepromoveerd tot '+RANKS[after][0],'ok')}
  else if(al>bl){toast(RANKS[after][0]+' level '+al+': +'+Math.round(RANK_SUB_LOOT*100)+'% extra buit','lvl');log(RANKS[after][0]+' level '+al+' bereikt','ok')}}

const EN_BASE=100,EN_REGEN_S=18; // 1 energie per 18 seconden
// Maximale energie groeit met Conditie (sportschool): +5 per level
const home=()=>HOMES.find(h=>h.id===((S&&S.home)||'brug'))||HOMES[0];
Object.defineProperty(window,'EN_MAX',{get:()=>EN_BASE+Math.round(SK.conditie.en*((S&&S.skills&&S.skills.conditie)||0))+((S&&S.home)?home().en:0)+((S&&S.furn)?furnFx('en'):0),configurable:true});
