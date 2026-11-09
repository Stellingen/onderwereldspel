// Pixelstad: redenen om terug te komen. Berichten van contacten, dagklussen (elke dag om 6 uur drie nieuwe), prestaties, 30
// verstopte pakketjes in stegen, parken en op kades, en een taxi. Alles wordt bewaard in S (S.stadMsg, S.stadDag, S.stadCnt,
// S.stadAch, S.stadCol), dus net als de rest van je voortgang. Beloningen zitten op de schaal van de straatklussen van je rang.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id);
const sv=()=>{try{save()}catch(e){}};
const obj=(k,d)=>{try{if(!S[k]||typeof S[k]!=='object')S[k]=d;return S[k]}catch(e){return d}};
const ref=()=>(G.roofRef&&G.roofRef())||{min:20,max:60,xp:4};
const scale=k=>{const c=ref();return Math.max(10,Math.round(((c.min+c.max)/2)*(typeof lootMult==='function'?lootMult():1)*k/5)*5)};
/* ---------- contacten en berichten ---------- */
const CON={notaris:{n:'Notaris De Sleutel',look:{skin:'#e9b98f',hair:'#d8d4cc',top:'#1f2430',tie:'#7a1f2a',glasses:1,bg:'#2b2418'},col:'#f2c230'},
  contact:{n:'Het Contact',look:{skin:'#b97a52',hair:'#151517',top:'#1d1d1f',hat:'cap',hatC:'#2a2c30',bg:'#2a1414'},col:'#ff5a4a'},
  heler:{n:'Ome Henk',look:{skin:'#d9a27a',hair:'#151517',top:'#1d1d1f',hat:'cap',hatC:'#e8e4da',chain:1,bg:'#2a2014'},col:'#ff7a1a'},
  garage:{n:'Garage Van der Plaat',look:{skin:'#f1caa5',hair:'#4a2e1a',top:'#2e5f9a',hat:'cap',hatC:'#f0b23a',bg:'#141c2a'},col:'#f0b23a'},
  taxi:{n:'Taxi Centrale',look:{skin:'#8d5a3a',hair:'#151517',top:'#f2c230',bg:'#2a2410'},col:'#f2c230'},
  stad:{n:'Pixelstad',look:{skin:'#d9a27a',hair:'#2a1d14',top:'#ff7a1a',bg:'#1a1d23'},col:'#ff7a1a'}};
G.contacts=CON;
const msgs=()=>{try{return Array.isArray(S.stadMsg)?S.stadMsg:(S.stadMsg=[])}catch(e){return []}};
// a = actie: {k:'route',x,z,n} | {k:'vastgoed'} | {k:'board'} | {k:'dag'} | {k:'ach'}
function msg(from,text,a,quiet){const L=msgs();L.unshift({f:from,t:Date.now(),x:text,a:a||null,u:1});if(L.length>40)L.length=40;sv();if(!quiet){G.snd&&G.snd.fx('notify');pop(from,text)}G.onMsg&&G.onMsg()}
G.msg=msg;G.msgs=msgs;G.unread=()=>msgs().filter(m=>m.u).length;
// melding bovenin (zoals een telefoon)
const nb=document.createElement('button');nb.className='sd-note';nb.id='sdNote';nb.hidden=true;document.body.appendChild(nb);let nbT=0;
function pop(from,text){const c=CON[from]||CON.stad;nb.innerHTML=`<canvas width="24" height="24"></canvas><span><b>${K.E(c.n)}</b><small>${K.E(text)}</small></span>`;K.portrait(c.look,null,nb.querySelector('canvas'));nb.style.setProperty('--c',c.col);
  nb.hidden=false;nb.classList.remove('go');void nb.offsetWidth;nb.classList.add('go');clearTimeout(nbT);nbT=setTimeout(()=>{nb.hidden=true},4200)}
nb.addEventListener('click',()=>{nb.hidden=true;G.phone&&G.phone.open('berichten')});
/* ---------- gebeurtenissen: tellers, dagklussen en prestaties ---------- */
const cnt=()=>obj('stadCnt',{});
function ev(name,n){n=n||1;const C=cnt();C[name]=(C[name]||0)+n;dagEv(name,n);achCheck();sv()}
G.ev=ev;
/* ---------- dagklussen ---------- */
const DAILY=[['roof2','Beroof 2 mensen op straat','roof',2],['zakenman','Beroof een zakenman','roof:zakenman',1],['toerist','Beroof een toerist','roof:toerist',1],['oma','Help een oma met haar boodschappen','oma',1],
  ['fooi3','Geef 3 keer een fooi of een euro','fooi',3],['heler','Verkoop spullen bij de heler','heler',1],['ontsnap','Schud de politie af','ontsnap',1],['praat6','Praat met 6 mensen','praat',6],
  ['missie2','Doe 2 klussen als missie','missie',2],['pakket','Vind een verstopt pakketje','pakket',1],['verstop','Verstop je voor de politie','verstop',1],['foto','Maak een foto voor een toerist','foto',1],['taxi','Neem een taxi','taxi',1],['kraak2','Breek 2 geparkeerde auto\'s open','kraak',2],['lever','Steel een auto en lever hem af','lever',1],['jack','Carjack een auto in het verkeer','jack',1]];
const dayKey=()=>{try{return new Date(Date.now()-6*3600e3).toLocaleDateString('nl-NL',{timeZone:'Europe/Amsterdam'})}catch(e){return new Date(Date.now()-6*3600e3).toDateString()}};
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function dag(){const D=obj('stadDag',{});const k=dayKey();if(D.k!==k){const prevFull=D.k&&D.full;let h=hashS(k+(window.__USER__||''));const pool=DAILY.slice(),ids=[];while(ids.length<3&&pool.length){ids.push(pool.splice(h%pool.length,1)[0][0]);h=Math.imul(h^(h>>>13),2654435761)>>>0}
    const yest=D.k;Object.assign(D,{k,ids,p:{},claimed:{},full:0,streak:prevFull&&yest?(D.streak||0):0});if(G.ready)setTimeout(()=>msg('contact','Nieuwe klusjes voor vandaag. Drie stuks, je weet me te vinden.',{k:'dag'}),3000);sv()}return D}
const dagDef=id=>DAILY.find(d=>d[0]===id);
function dagEv(name,n){const D=dag();(D.ids||[]).forEach(id=>{const d=dagDef(id);if(!d||d[2]!==name)return;const was=D.p[id]||0;if(was>=d[3])return;D.p[id]=Math.min(d[3],was+n);if(D.p[id]>=d[3]){G.snd&&G.snd.fx('lvl');msg('contact','Klusje gedaan: '+d[1].toLowerCase()+'. Je beloning staat klaar.',{k:'dag'})}})}
function dagReward(){return {cash:scale(2.4),xp:Math.max(3,Math.round(ref().xp*1.6))}}
function dagClaim(id){const D=dag(),d=dagDef(id);if(!d||D.claimed[id]||(D.p[id]||0)<d[3])return false;const r=dagReward();D.claimed[id]=1;S.cash+=r.cash;if(typeof addZwart==='function')addZwart(r.cash);if(typeof addXp==='function')addXp(r.xp);
  G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.float('+'+fmt(r.cash),G.P.x,G.P.z);
  if(D.ids.every(i=>D.claimed[i])&&!D.full){D.full=1;D.streak=(D.streak||0)+1;const b=scale(3)*Math.min(7,D.streak);S.cash+=b;if(typeof addZwart==='function')addZwart(b);cnt().dagvol=(cnt().dagvol||0)+1;
    msg('contact','Alle drie gedaan. Bonus: '+fmt(b)+(D.streak>1?' (dag '+D.streak+' op rij)':'')+'. Morgen meer.',{k:'dag'});G.snd&&G.snd.fx('lvl')}
  achCheck();sv();return true}
G.dag={get:dag,def:dagDef,claim:dagClaim,reward:dagReward};
/* ---------- prestaties ---------- */
const ACH=[['eerste','Eerste slachtoffer','Beroof iemand op straat','roof',1],['roof25','Straatrover','Beroof 25 mensen','roof',25],['oma5','Padvinder','Help 5 oma\'s','oma',5],
  ['praat50','Kletskous','Praat met 50 mensen','praat',50],['fooi10','Gulle gever','Geef 10 keer een fooi','fooi',10],['ontsnap1','Weg is weg','Schud de politie af','ontsnap',1],['ontsnap10','Glibberig','Schud de politie 10 keer af','ontsnap',10],
  ['drie','Onvindbaar','Ontsnap met 3 sterren','ontsnap3',1],['verstop10','Kameleon','Verstop je 10 keer','verstop',10],['heler10','Vaste klant','Verkoop 10 keer bij de heler','heler',10],
  ['pakket10','Speurneus','Vind 10 pakketjes','pakket',10],['pakket30','Alles gevonden','Vind alle 30 pakketjes','pakket',30],['missie10','Vakman','Doe 10 klussen als missie','missie',10],
  ['dag7','Week vol','Maak 7 keer al je dagklussen af','dagvol',7],['taxi','Achterbank','Neem een taxi','taxi',1],['selfie','Selfie','Maak een foto met je telefoon','selfie',1],['bezit5','Landheer','Heb 5 panden op Oostland','bezit',5],['kraak10','Ruitentikker','Breek 10 auto\'s open','kraak',10],['lever1','Eerste rit','Lever een gestolen auto af','lever',1],['lever10','Autodief','Lever 10 gestolen auto\'s af','lever',10],['jack1','Uitstappen!','Carjack een auto','jack',1]];
G.ACH=ACH;
function achVal(a){if(a[3]==='bezit')return (M.places||[]).filter(p=>p.est&&p.own).length;return cnt()[a[3]]||0}
G.achVal=achVal;
function achCheck(){const H=obj('stadAch',{});ACH.forEach(a=>{if(H[a[0]])return;if(achVal(a)>=a[4]){H[a[0]]=Date.now();G.snd&&G.snd.fx('lvl');ach(a)}})}
function ach(a){const el=document.createElement('div');el.className='sd-ach';el.innerHTML=`<i>${K.ic.star}</i><span><small>Prestatie</small><b>${K.E(a[1])}</b><em>${K.E(a[2])}</em></span>`;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);
  msg('stad','Prestatie: '+a[1]+'. '+a[2]+'.',{k:'ach'},true)}
setInterval(()=>{if(G.ready&&!G.paused)achCheck()},5000);
/* ---------- verstopte pakketjes ---------- */
const PK=[];(function(){let s=91711;const rnd=()=>{s=Math.imul(s^(s>>>15),2246822507)>>>0;s=Math.imul(s^(s>>>13),3266489909)>>>0;s^=s>>>16;return (s>>>0)/4294967296};
  const C=[];M.alleys.forEach(a=>{const ns=a.f==='N'||a.f==='S';C.push({x:ns?a.x0+2.3:a.cx,z:ns?a.cz:a.z0+2.3,w:'een steeg'})});
  const T=M.T;for(let i=0;i<4000&&C.length<120;i++){const x=8+rnd()*(M.W-16),z=8+rnd()*(M.H-16),t=M.ground[(z|0)*M.W+(x|0)];if((t===T.PARK||t===T.YARD||t===T.SAND||t===T.DOCK)&&M.canStand(x,z,.6))C.push({x,z,w:t===T.PARK?'een park':t===T.SAND?'het strand':t===T.DOCK?'de kade':'een binnenplaats'})}
  for(const c of C){if(PK.length>=30)break;if(PK.every(p=>Math.hypot(p.x-c.x,p.z-c.z)>24)&&M.canStand(c.x,c.z,.4))PK.push(Object.assign(c,{id:'p'+PK.length}))}})();
G.pakketten=PK;
const col=()=>obj('stadCol',{});
let pkMesh=[];
function pkSetup(){const sc=G.scene(),g=new TH.BoxGeometry(.7,.55,.5),m=new TH.MeshLambertMaterial({color:0xb08850,emissive:0x3a2a10}),d=new TH.OctahedronGeometry(.18,0),dm=new TH.MeshBasicMaterial({color:0xffd35a});
  PK.forEach(p=>{const grp=new TH.Group(),b=new TH.Mesh(g,m);b.position.y=.3;b.castShadow=true;const t=new TH.Mesh(new TH.BoxGeometry(.72,.08,.52),new TH.MeshLambertMaterial({color:0x6a4a2c}));t.position.y=.45;const dd=new TH.Mesh(d,dm);dd.position.y=1.2;grp.add(b,t,dd);grp.position.set(p.x,0,p.z);grp.visible=false;sc.add(grp);pkMesh.push({p,g:grp,d:dd})})}
function pkStep(dt,ts){const C=col(),P=G.P;pkMesh.forEach(o=>{if(C[o.p.id]){o.g.visible=false;return}const d=Math.hypot(P.x-o.p.x,P.z-o.p.z);o.g.visible=d<34||(G.waypoint&&G.waypoint.pk===o.p.id);if(!o.g.visible)return;
  o.d.rotation.y=ts*2.4;o.d.position.y=1.2+Math.sin(ts*3)*.12;if(d<1.3&&!G.driving){C[o.p.id]=Date.now();const n=Object.keys(C).length,g=scale(1.2);S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(3);
    G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.burst(o.p.x,.8,o.p.z,'#ffd35a',10);G.fx2&&G.fx2.float('+'+fmt(g)+' · pakketje '+n+'/30',o.p.x,o.p.z,'#ffd35a');ev('pakket');
    if(G.waypoint&&G.waypoint.pk===o.p.id&&G.clearWaypoint)G.clearWaypoint();
    if(n===30){const b=scale(30);S.cash+=b;if(typeof addZwart==='function')addZwart(b);msg('contact','Alle 30 pakketjes. Niemand anders heeft dat ooit gedaan. Hier, '+fmt(b)+'.')}else if(n%10===0)msg('contact',n+' van de 30 pakketjes gevonden. Ga zo door.');sv()}})}
// tip van een zwerver: het dichtstbijzijnde pakketje dat je nog niet hebt
G.pakketTip=function(){const C=col(),P=G.P,L=PK.filter(p=>!C[p.id]).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));const p=L[0];if(!p)return null;
  if(G.setWaypoint){G.setWaypoint(p.x,p.z,'Pakketje');if(G.waypoint)G.waypoint.pk=p.id}return p};
/* ---------- taxi ---------- */
G.taxi=function(pl){if(!pl)return;if(G.police&&G.police.active()){G.toast('Geen taxi die je nu meeneemt','bad');return false}if(G.mission&&G.mission()){G.toast('Maak eerst je klus af','bad');return false}if(typeof inJail==='function'&&inJail())return false;
  const d=Math.hypot(pl.door.x-G.P.x,pl.door.z-G.P.z),fare=taxiFare(d);if(S.cash<fare){G.toast('Te weinig contant voor de taxi ('+fmt(fare)+')','bad');return false}
  S.cash-=fare;sv();ev('taxi');const f=document.createElement('div');f.className='sd-fade';document.body.appendChild(f);G.snd&&G.snd.fx('carDoor');
  setTimeout(()=>{if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.placeAtDoor(pl);G.resume()},450);setTimeout(()=>f.remove(),1100);G.toast('Taxi naar '+pl.name.replace(/^(Thuis: |Jouw )/,'')+' · '+fmt(fare),'info');return true};
const taxiFare=d=>Math.max(25,Math.round((15+d*.55)/5)*5);G.taxiFare=taxiFare;
/* ---------- koppelen ---------- */
const wait=setInterval(()=>{if(!G.ready)return;clearInterval(wait);pkSetup();dag();const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)pkStep(dt,performance.now()/1000)};
  if(!msgs().length){msg('contact','Welkom in de stad. Praat met mensen, kijk rond. In de stegen liggen pakketjes die niemand mist.',null,true);msg('notaris','Uw grond in Oostland ligt klaar. Kom langs bij Notaris De Sleutel als u wilt bouwen.',{k:'vastgoed'},true)}},300);
})();
