// Spelerstatus, opslaan/laden, spelregels, arrestaties, skills, meldingen
let S;
function fresh(){return{name:'Jij',cash:250,bank:0,xp:0,hp:100,heat:0,jailUntil:0,cred:0,family:null,skills:{steal:0,cars:0,charisma:0,speed:0},news:[],wanted:false,lastSentence:30,cd:{},cars:[],biz:{},gear:{},stats:{crimes:0,fails:0,cars:0,won:0,lost:0},log:[],last:now(),
  npcs:NPC_NAMES.map((n,i)=>({n,xp:Math.floor(200*Math.pow(1.55,i))+rnd(0,300),cash:rnd(1000,50000)*(i+1)}))}}
// Opslag: met account in de database (via /api/state), anders alleen in de browser.
const SAVE_KEY='onderwereld_v1'+(window.__USER__?'_'+window.__USER__.toLowerCase():'');
function load(){
  let d=window.__SERVER_STATE__||null;
  if(!d){try{d=JSON.parse(localStorage.getItem(SAVE_KEY))||JSON.parse(localStorage.getItem('onderwereld_v1'))}catch(e){}}
  if(d&&d.npcs){const f=fresh();d=Object.assign(f,d);d.stats=Object.assign(fresh().stats,d.stats);d.skills=Object.assign(fresh().skills,d.skills);
    if(window.__USER__)d.name=window.__USER__;return d}
  const f=fresh();if(window.__USER__)f.name=window.__USER__;return f}
let _pushTimer=null,_lastPush=0;
function pushState(beacon){
  if(!window.__TOKEN__)return;
  const body=JSON.stringify({state:Object.assign({},S,{rankname:RANKS[rankIdx(S.xp)][0]})});
  try{fetch('/api/state',{method:'POST',keepalive:!!beacon,headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__TOKEN__},body})
    .then(r=>{if(r.status===401){try{localStorage.removeItem('ow_token')}catch(e){}location.replace('/')}}).catch(()=>{})}catch(e){}
  _lastPush=Date.now()}
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(S))}catch(e){}
  if(!window.__TOKEN__)return;
  clearTimeout(_pushTimer);
  _pushTimer=setTimeout(()=>pushState(),Date.now()-_lastPush>15000?400:3000)}
window.addEventListener('pagehide',()=>pushState(true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')pushState(true)});
function logout(){pushState(true);try{localStorage.removeItem('ow_token')}catch(e){}setTimeout(()=>location.replace('/'),150)}
S=load();

const rankIdx=xp=>{let i=0;RANKS.forEach((r,j)=>{if(xp>=r[1])i=j});return i};
const inJail=()=>S.jailUntil>now();
const gearBonus=()=>GEAR.reduce((a,g)=>a+(S.gear[g.id]?g.bonus:0),0);
const fam=()=>FAMILIES.find(f=>f.id===S.family)||{chance:0,loot:0,jail:0};
const chance=c=>Math.max(5,Math.min(95,c.base+rankIdx(S.xp)*2+gearBonus()+fam().chance+S.skills.steal*(c.id==='zakken'?4:2)-Math.floor(S.heat/4)));
function sendToJail(sec){sec=Math.max(30,Math.min(600,Math.round(sec*(1-fam().jail/100))));S.lastSentence=sec;S.jailUntil=now()+sec*1000;return sec}
function bailCost(){const left=Math.max(0,Math.ceil((S.jailUntil-now())/1000));return Math.floor(left*(20+rankIdx(S.xp)*15)*(1-S.skills.charisma*0.04))}
const talkChance=()=>Math.min(45,S.skills.charisma*4.5);
// Arrestatie met de keuze om je eruit te praten (charisma)
function arrest(sec,title,msg,mult=1,raid=false){
  const ch=Math.round(talkChance()*mult);
  const goJail=(extra=1,why='')=>{const s=sendToJail(sec*extra);if(raid){S.wanted=false;S.stats.raids=(S.stats.raids||0)+1}
    log((why||title)+'. '+fmtTime(s)+' de bajes in','bad');save();closeModal();page='jail';try{history.replaceState(null,'','#jail')}catch(e){}render();toast('Opgepakt: '+fmtTime(s),'bad')};
  if(ch<=0){showModal(title,msg+' Je gaat de bajes in voor '+fmtTime(Math.max(30,Math.min(600,sec)))+'.',[{l:'Begrepen',c:'red',f:()=>goJail()}]);return}
  showModal(title,msg+' Je kunt je overgeven of proberen de agent om te praten.',[
    {l:'Praat je eruit · '+ch+'%',c:'gold',f:()=>{if(rnd(1,100)<=ch){S.cred+=1;addXp(5);log('Uit een arrestatie gepraat','ok');save();closeModal();render();toast('Je praat je eruit. De agent laat je gaan.')}else goJail(1.25,'Praatje mislukt, de agent wordt boos (+25% straf)')}},
    {l:'Geef je over · '+fmtTime(Math.max(30,Math.min(600,Math.round(sec*(1-fam().jail/100))))),c:'red',f:()=>goJail()}])}
function policeRaid(){
  if(!S.wanted||inJail()||!$('#modal').hidden)return false;
  S.heat=Math.min(100,S.heat+20);
  if(window.bj&&!bj.done){bj.done=true;bj.msg='Spel afgebroken door de politie';S.stats.lost+=bj.bet}
  arrest(S.lastSentence+120,'Politiecontrole!','Agenten doen een controle '+(PLACES[page]||'op straat')+' en herkennen je van de gezochtlijst.',0.5,true);return true}
const fmtTime=s=>{s=Math.round(s);return s>=60?Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s':s+'s'};
function showModal(t,m,btns){$('#modal').hidden=false;$('#modalT').textContent=t;$('#modalM').textContent=m;
  btns=btns||[{l:'Begrepen',c:'red',f:closeModal}];const box=$('#modalB');box.innerHTML='';
  btns.forEach(b=>{const e=document.createElement('button');e.className='btn '+(b.c||'');e.textContent=b.l;e.onclick=b.f;box.appendChild(e)})}
function closeModal(){$('#modal').hidden=true}
const SKILLS=[
 {id:'steal',n:'Vingervlugheid',d:'Zakkenrollen +4% en alle andere misdaden +2% slaagkans per level.',base:500,col:'var(--cyan)'},
 {id:'cars',n:'Autodiefstal',d:'+3% kans om een auto te stelen en +4% hogere autowaarde per level.',base:800,col:'var(--gold)'},
 {id:'charisma',n:'Charisma',d:'+4,5% kans om je uit een arrestatie te praten en 4% korting op borg per level.',base:1200,col:'var(--violet)'},
 {id:'speed',n:'Snelheid',d:'5% kortere wachttijd tussen misdaden en autodiefstal per level.',base:1000,col:'var(--green)'}];
const skillCost=s=>Math.floor(s.base*Math.pow(1.7,S.skills[s.id]));
const crimeCd=c=>c.cd*1000*(1-S.skills.speed*0.05);
const carCd=()=>30000*(1-S.skills.speed*0.05);
const RL_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const REDS=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const numCol=n=>n===0?'green':REDS.has(n)?'red':'black';
window.rl={bets:{},angle:0,spinning:false,hist:[],chip:100,res:null,net:0};
const income=()=>BIZ.reduce((a,b)=>a+(S.biz[b.id]||0)*b.inc,0);

function toast(msg,cls='ok'){const t=document.createElement('div');t.className='toast '+cls;t.textContent=msg;$('#toasts').prepend(t);setTimeout(()=>t.remove(),3200)}
function log(msg,cls='info'){S.log.unshift({m:msg,c:cls,t:now()});S.log=S.log.slice(0,40)}
function addXp(x){const before=rankIdx(S.xp);S.xp+=x;const after=rankIdx(S.xp);if(after>before){toast('Promotie: je bent nu '+RANKS[after][0]+'!','lvl');log('Gepromoveerd tot '+RANKS[after][0],'ok')}}
