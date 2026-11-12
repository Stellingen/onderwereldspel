// Pixelstad: de politie als mensen. Elke wijk heeft een wijkagent met een naam, een gezicht en een geweten: de een is voor een
// envelop te koop, de ander beslist niet. Je bouwt een band met ze op (praten, koffie, een tip over een rivaal) en je verpest hem
// met misdaad waar ze bij staan.
// - Loonlijst: schuif een wijkagent een envelop toe (prijs op de schaal van je straatklussen, duurder als je bekender bent,
//   goedkoper als hij je mag). Lukt het, dan staat hij 24 uur op je loonlijst: hij ziet jouw misdaden niet, herkent je niet als je
//   gezocht wordt en moffelt de meeste 112-meldingen uit zijn wijk weg. Mislukt het, dan ben je zijn vertrouwen kwijt.
// - Aanhouding: word je in de Pixelstad gepakt, dan kun je de agent een envelop aanbieden. Lukt het, dan loop je weg. Mislukt het,
//   dan ben je de helft kwijt en volgt de gewone arrestatie van het klikspel.
// - Naam bij het korps (−100 … 100): ontsnappen en rammen maken het slechter, enveloppen en koffie beter. Telt mee in je kansen.
// Bewaard in S.stadSmeer = {pay:{wijk:tot}, k:korps, no:{agent:tot}, kn:{agent:1}}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,E=K.E;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const sv=()=>{try{save()}catch(e){}};
const dayN=()=>Math.floor((Date.now()-6*3600e3+3600e3)/864e5);
const zS=k=>G.schaal?(G.schaal.kost||G.schaal.zwart)(k):Math.round(50*k);   // alleen prijzen: zonder lidbonus
const V=()=>G.volk;
const SS=()=>{try{if(!S.stadSmeer||typeof S.stadSmeer!=='object')S.stadSmeer={};const s=S.stadSmeer;if(!s.pay)s.pay={};if(!s.no)s.no={};if(!s.kn)s.kn={};if(typeof s.k!=='number')s.k=0;return s}catch(e){return {pay:{},no:{},kn:{},k:0}}};
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
/* ---------- het korps ---------- */
// wijk, naam, hoe omkoopbaar (0 … 1), vrouw
const WA=[['west','Ria Bakker',.7,1],['noord','Willem de Groot',.2,0],['strand','Selim Yilmaz',.5,0],['centrum','Dana Mulder',.35,1],['plein','Ruud van Dam',.6,0],['haven','Henk Kramer',.85,0],['zuidas','Eline Lindeman',.12,1]];
const PA=[['Koster',.4,0],['Aydin',.55,0],['Smeets',.25,1],['Verbeek',.65,0],['Tjon',.45,1],['Hoekstra',.3,0]];
const SKIN=['#f1caa5','#e9b98f','#d9a27a','#b97a52','#8d5a3a'];
function copLook(seed,v,old){const r=rng(seed),P=a=>a[Math.floor(r()*a.length)],skin=P(SKIN),acc={};if(r()<.3)acc.bril=1;if(r()<.12)acc.mv=1;if(v&&r()<.5)acc.oor=1;
  return {skin,hair:old?P(['#8a8c90','#b8b4ac']):P(['#151517','#2a1d14','#4a2e1a','#8a6a3a','#c9a24a']),top:'#1d2a4a',arm:'#1d2a4a',pants:'#151c30',shoe:'#0e0f12',hat:'pet',hatC:'#1d2a4a',col:'uniform',
    hs:v?P(['staart','knot','bob']):P(['kort','opgeschoren','kalend','zij']),fh:v?'':P(['','','stoppel','snor','sik']),fw:P(v?[16,18]:[18,20]),jaw:P(v?['rond','spits']:['hoekig','rond']),age:old?2:r()<.5?1:0,
    eye:P(['#3a2a1a','#2a4a6a','#3a6a3a']),v:v?1:0,w:+(v?.92+r()*.1:1+r()*.16).toFixed(2),h:+(v?.96+r()*.08:1+r()*.1).toFixed(2),acc,bg:'#141c2e'}}
const AG={},WIJKN={};
// waar de wijkagent zijn ronde begint: een stuk stoep (of plein) in zijn eigen wijk, een eindje bij de wijkbaas vandaan
function beatStart(w){const c=w.c,at=G.wijk&&G.wijk.at;for(let r=9;r<=48;r+=3)for(let a=0;a<12;a++){const t=a/12*Math.PI*2+r*.37,x=c[0]+Math.cos(t)*r,z=c[1]+Math.sin(t)*r;
    if(side(x,z)&&M.canStand(x,z,.35)&&(!at||at(x,z)===w))return {x,z}}
  return M.nearestWalk(c[0]+9,c[1]+7,16)||M.nearestWalk(c[0],c[1],20)}
function setup(){const A=G.npcA,Wl=(G.wijk&&G.wijk.list)||[];
  A.wijkagent={n:'Wijkagent',col:'#4d7dff',wallet:0,tough:9,call:1,cop:1,fixed:'beat',look:()=>({top:'#1d2a4a',arm:'top',pants:'#151c30',shoe:'#0e0f12',hat:'pet',hatC:'#1d2a4a',hair:'#2a1d14'}),names:['Wijkagent'],talk:['Rustige dienst vandaag.','Ik ken iedereen in deze wijk.','Alles goed hier?','Heeft u iets gezien?']};
  WA.forEach(([wid,nm,cor,v],i)=>{const w=Wl.find(x=>x.id===wid);if(!w)return;WIJKN[wid]=w.n;const p=beatStart(w);if(!p)return;
    const n=G.addFixed('wijkagent',p.x,p.z,0),id='a_'+wid,look=copLook(9100+i*77,v,cor<.25);n.nm='Agent '+nm.split(' ').slice(1).join(' ');n.rid=id;n.aid=id;n.wijk=wid;n.look=look;n.turn=0;n.v=1.05;n.st='beat';n.fixSt='beat';
    AG[id]={id,nm:n.nm,full:nm,jobN:'Wijkagent',zone:wid,arch:'wijkagent',trait:cor>.6?'roddelaar':'nuchter',kind:'agent',look,cor,n,wijk:wid};V()&&V().reg(AG[id])});
}
// de agenten die door de stad lopen (de pool) bestaan al bij het laden, zodat de eerste mensen op straat meteen kloppen
PA.forEach(([nm,cor,v],i)=>{const id='p_'+i,look=copLook(7300+i*131,v,false);AG[id]={id,nm:'Agent '+nm,jobN:'Agent',zone:'',arch:'agent',trait:'nuchter',kind:'agent',look,cor,patrol:1};V()&&V().reg(AG[id])});
try{G.npcA.agent.names=PA.map(a=>'Agent '+a[0])}catch(e){}
// een agent uit de pool krijgt een naam en een gezicht van het korps
function patrol(n){const L=Object.values(AG).filter(a=>a.patrol&&!G.NPC.some(m=>m.rid===a.id));if(!L.length)return;const a=pick(L);n.rid=a.id;n.aid=a.id;n.nm=a.nm;n.look=Object.assign({},a.look)}
/* ---------- band met het korps ---------- */
const korps=()=>SS().k;
function korpsAdd(d){const s=SS();s.k=clamp(Math.round(s.k+d),-100,100);sv()}
const KT=[[-100,'Gehaat'],[-40,'Verdacht'],[-10,'Onbekend'],[15,'Bekend'],[40,'Gezien'],[70,'Onaantastbaar']];
const korpsT=()=>{let t=KT[0][1];KT.forEach(x=>{if(korps()>=x[0])t=x[1]});return t};
const loon=wid=>(SS().pay[wid]||0)>Date.now();
const loonN=()=>WA.filter(a=>loon(a[0])).length;
const bond=a=>V()?V().val(a.id):0;
// ziet deze agent jouw misdaad niet? (wijkagent op de loonlijst)
function blind(n){return !!(n&&n.arch==='wijkagent'&&n.wijk&&loon(n.wijk))}
// een agent ziet je iets doen (en staat niet op de loonlijst)
function zag(n){if(!n||!n.rid||!AG[n.rid])return;V()&&V().band(n,-8,{quiet:1});korpsAdd(-2)}
/* ---------- op straat: de ronde van de wijkagent ---------- */
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],T=M.T;
const side=(x,z)=>{x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return false;const i=z*M.W+x;if(M.solid[i])return false;const t=M.ground[i];return t===T.WALK||t===T.PLAZA};
function away(n){if(n.away)return;n.away=1;n.x=-500;n.z=-500}
function watch(n,dt,dP){n.cw=(n.cw||0)-dt;if(n.cw>0)return;n.cw=.4;if(dP>16||G.driving||G.hidden)return;const lv=typeof S!=='undefined'&&S.wanted?(typeof S.wanted==='object'?(S.wanted.lv||1):1):0;if(!lv||(G.police&&G.police.active()))return;
  if(dP>11*(1+(G.faam?G.faam():0)/250)||!G.los(n,G.P))return;
  if(blind(n)){if(!(n.sawT>performance.now())){n.sawT=performance.now()+60000;G.bubble(n,pick(['Ik heb je niet gezien.','Doorlopen. Snel.','…']),{col:'#a9c8ff'})}return}
  G.bubble(n,'Hé! Jou ken ik!',{col:'#a9c8ff'});G.snd&&G.snd.fx('whistle');zag(n);G.police&&G.police.start({stars:Math.min(3,lv),why:'gezocht',at:n,wanted:1})}
function beat(n,dt){n.t=(n.t||0)+dt;n.arm=n.armL=n.armR=undefined;n.armRz=n.armLz=0;n.hop=0;n.legL=n.legR=undefined;n.y=0;n.hx=0;n.lean=0;n.blink=0;
  if(n.away){n.sp=0;if(!(G.police&&G.police.active())){n.away=0;n.x=n.home.x;n.z=n.home.z;n.turn=0}return true}
  const P=G.P,dP=dist(n,P);if(dP>95){n.sp=0;return true}
  watch(n,dt,dP);if(n.away)return true;
  if(n.pause>0){n.pause-=dt;n.sp=0;n.hy=Math.sin(n.t*.8)*.75;n.armL=-.5;n.armR=-.5;return true}n.hy=(n.hy||0)*.9;
  n.turn-=dt;const ax=n.x+n.dx*1.3,az=n.z+n.dz*1.3;
  if(!side(ax,az)||n.turn<0){const hx=n.home.x-n.x,hz=n.home.z-n.z,far=Math.hypot(hx,hz)>34;let o=DIRS.filter(([a,b])=>!(a===-n.dx&&b===-n.dz)&&side(n.x+a*1.7,n.z+b*1.7));
    if(far){const o2=o.filter(([a,b])=>a*hx+b*hz>0);if(o2.length)o=o2;else if(side(n.x-n.dx*1.7,n.z-n.dz*1.7))o=[[-n.dx,-n.dz]]}
    const d=o.length?pick(o):[-n.dx,-n.dz];n.dx=d[0];n.dz=d[1];n.turn=rr(4,9);if(Math.random()<.28)n.pause=rr(2,5)}
  const v=1.05,nx=n.x+n.dx*v*dt,nz=n.z+n.dz*v*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;
  let d=Math.atan2(n.dx,n.dz)-n.ry;d=Math.atan2(Math.sin(d),Math.cos(d));n.ry+=d*Math.min(1,dt*8);n.ph+=dt*v*4.2;n.sp=.6;return true}
const b0=G.npcBrain;G.npcBrain=function(n,dt){if(n.st==='beat')return beat(n,dt);return b0(n,dt)};
/* ---------- prijzen en kansen ---------- */
const faam=()=>G.faam?G.faam():0;
const r50=x=>Math.max(50,Math.round(x/50)*50);
const loonP=a=>r50(zS(4)*(1+faam()/200)*(1-.3*Math.max(0,bond(a))/100));
const loonK=a=>clamp(.25+.5*a.cor+bond(a)*.005+korps()*.001-(S.wanted?.15:0),.05,.97);
const koffieP=()=>Math.max(5,Math.round(zS(.03)/5)*5);
const dossierP=()=>{try{const lv=typeof S.wanted==='object'?(S.wanted.lv||1):2;return r50(zS(6)*lv*(1+faam()/200))}catch(e){return 5000}};
const vangP=(stars,wid)=>r50(zS(2.5)*stars*(1+faam()/200)*(wid&&loon(wid)?.6:1));
const skl=id=>{try{return (S.skills&&S.skills[id])||0}catch(e){return 0}};
const vangK=(stars,wid)=>clamp(.5-.12*(stars-1)+korps()*.003+Math.min(.15,skl('charisma')*.004)+(wid&&loon(wid)?.25:0),.08,.92);
const riskOf=k=>k<.4?3:k<.68?2:1;
/* ---------- gesprek met een wijkagent ---------- */
const o0=G.npcOpen;G.npcOpen=function(n){if(n.arch==='wijkagent'&&AG[n.rid]){const a=AG[n.rid];if(loon(a.wijk))return pick(['Alles rustig. Voor jou tenminste.','Ik heb niets gezien, niets gehoord. Zoals afgesproken.']);
    if(typeof S!=='undefined'&&S.wanted)return '';const v=bond(a);if(v<=-40)return 'Jou hou ik in de gaten. Eén misstap en je gaat mee.';
    return a.cor>.6?pick(['Met dit salaris red je het niet in deze stad.','Mijn hypotheek, man. Ik word er gek van.','Dubbele diensten en nog kom ik niet rond.']):a.cor<.3?pick(['Ik doe dit werk uit overtuiging.','Regels zijn regels. Voor iedereen.','Wie hier iets flikt, krijgt met mij te maken.']):pick(['Rustige dienst vandaag.','Ik ken iedereen in deze wijk. Jou nog niet zo goed.'])}
  return o0?o0(n):''};
G.npcService=G.npcService||{};
function koffie(n,a,ch,main){const s=SS(),day=dayN(),c=koffieP(),r=V()&&V().rec(a.id,1);if(!r)return;
  ch.push({t:'Koffie aanbieden · '+fmt(c),ic:K.ic.kop,dis:r.td===day||S.cash<c,why:r.td===day?'Vandaag al gedaan':'Te weinig contant',f:()=>{S.cash-=c;r.td=day;V().band(n,4,{soc:1});korpsAdd(1);G.ev&&G.ev('agentkoffie');G.snd&&G.snd.fx('coin');K.say(pick(['Dat is aardig. Dank je.','Kan ik gebruiken. Lange dienst.','Zwart, geen suiker. Goed onthouden.']),'blij',main())}})}
G.npcService.agent=(n,ch,main)=>{const a=AG[n.rid];if(!a||(typeof S!=='undefined'&&S.wanted))return;koffie(n,a,ch,main)};
G.npcService.wijkagent=(n,ch,main)=>{const a=AG[n.rid];if(!a)return;const s=SS(),now=Date.now(),on=loon(a.wijk),r=V().rec(a.id,1),day=dayN(),wn=WIJKN[a.wijk]||'de wijk';
  if(on){const h=Math.max(1,Math.ceil((s.pay[a.wijk]-now)/3600e3));
    ch.push({t:'Wat speelt er?',sub:'Loonlijst · nog '+h+' uur',ic:K.ic.badge,f:()=>{const b=G.police&&G.police.blok&&G.police.blok();K.say(b?'Ze zetten een fuik op de weg. Rij er niet in.':'Meldingen uit '+wn+' leg ik onderop de stapel. Nog '+h+' uur, dan wil ik je weer zien.',null,main())}});
    if(h<=12){const p=loonP(a);ch.push({t:'Envelop verlengen · '+fmt(p),sub:'24 uur erbij',ic:K.ic.envelop,dis:S.cash<p,why:'Te weinig contant',f:()=>{S.cash-=p;s.pay[a.wijk]+=24*3600e3;V().band(n,4);korpsAdd(1);G.snd&&G.snd.fx('coin');sv();K.say('Prettig zakendoen.','blij',main())}})}
    const w=typeof S!=='undefined'&&S.wanted;if(w&&typeof w==='object'&&(w.lv||1)<=2&&bond(a)>=45){const p=dossierP();ch.push({t:'Dossier kwijtmaken · '+fmt(p),sub:'Van de gezochtlijst af',ic:K.ic.envelop,risk:2,dis:S.cash<p,why:'Te weinig contant',f:()=>{S.cash-=p;
        if(Math.random()<.75){try{if(typeof clearWanted==='function')clearWanted('Je dossier is zoekgeraakt op het bureau',true);else S.wanted=false}catch(e){S.wanted=false}G.ev&&G.ev('dossier');G.snd&&G.snd.fx('ok');K.say('Welk dossier? Ik zie hier niets liggen.','blij',main())}
        else{V().band(n,-6);korpsAdd(-3);K.say('De recherche zit erbovenop. Dit lukt me niet. Je geld ben je kwijt.','bang',main())}sv()}})}}
  else{const p=loonP(a),k=loonK(a),cd=(s.no[a.id]||0)-now;let why='';if(cd>0)why='Hij wil er niet over praten: nog '+Math.ceil(cd/3600e3)+' uur';else if(S.cash<p)why='Je hebt '+fmt(p)+' contant nodig';else if(G.police&&G.police.active())why='Niet nu';
    ch.push({t:'Envelop toeschuiven · '+fmt(p),sub:why?'':'24 uur op je loonlijst in '+wn,ic:K.ic.envelop,risk:riskOf(k),dis:!!why,why,f:()=>envelop(n,a,p,k,main)})}
  koffie(n,a,ch,main);
  ch.push({t:'Tip geven over een rivaal',sub:r.tp===day?'':'Kost respect in '+wn,ic:K.ic.eye,dis:r.tp===day,why:'Vandaag al gedaan',f:()=>{r.tp=day;V().band(n,6);korpsAdd(2);G.rep&&G.rep.add(n.x,n.z,-2);G.snd&&G.snd.fx('ok');K.say(pick(['Interessant. Daar gaan we eens kijken.','Dat wist ik nog niet. Je hebt wat goed bij me.']),null,main())}})};
function envelop(n,a,p,k,main){const s=SS();
  if(Math.random()<k){S.cash-=p;s.pay[a.wijk]=Date.now()+24*3600e3;s.kn[a.id]=1;V().band(n,10);korpsAdd(4);G.ev&&G.ev('loon');G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.float('−'+fmt(p),G.P.x,G.P.z,'#ffd35a');
    G.msg&&G.msg('stad',a.nm+' staat 24 uur op je loonlijst in '+(WIJKN[a.wijk]||'')+'. Hij ziet niets en de meeste 112-meldingen verdwijnen.',{k:'app',a:'bekenden'},true);if(typeof log==='function')log('Wijkagent omgekocht in de Pixelstad: '+a.nm+', '+fmt(p),'ok');
    K.say(pick(['…Ik heb vandaag slechte ogen. En morgen ook.','Voor de koffiepot op het bureau. Begrepen.','Wij hebben elkaar niet gesproken.']),null,main())}
  else{s.no[a.id]=Date.now()+6*3600e3;if(a.cor<.3)s.kn[a.id]=1;V().band(n,-15);korpsAdd(-5);if(typeof addHeat==='function')addHeat(5);G.ev&&G.ev('smeerfail');G.snd&&G.snd.fx('bad');if(Math.random()<.4)G.nieuws&&G.nieuws.add('smeerfail',{agent:a.nm});
    if(a.cor<.3&&bond(a)<25){K.say('Poging tot omkoping van een ambtenaar. Jij gaat mee.','boos',[]);setTimeout(()=>{K.closeDialog(true);G.police&&G.police.start({stars:1,why:'omkoping',at:n})},1500)}
    else K.say(pick(['Stop dat weg. Nu. En laat ik je er niet meer over horen.','Ik doe alsof ik dit niet gezien heb. Eén keer.']),'boos',main())}
  sv()}
/* ---------- 112-meldingen: de wijkagent op je loonlijst moffelt ze weg ---------- */
function intercept(x,z,o){try{const w=G.wijk&&G.wijk.at(x,z);if(!w||!loon(w.id))return false;const a=AG['a_'+w.id];if(!a)return false;if((o&&o.stars>=3)||Math.random()>(bond(a)>=70?.8:.6))return false;
    G.toast&&G.toast(a.nm+' moffelt de 112-melding weg','ok');G.ev&&G.ev('moffel');return true}catch(e){return false}}
/* ---------- aanhouding: een envelop aanbieden ---------- */
const kan=(mode,stars)=>mode!=='flee'&&!(G.mission&&G.mission());
function aanbod(o){return new Promise(res=>{const wid=(G.wijk&&G.wijk.at(G.P.x,G.P.z)||{}).id,stars=clamp(o.stars||1,1,3),p=vangP(stars,wid),k=vangK(stars,wid);let fin=false,picked=false;
    const done=ok=>{if(fin)return;fin=true;G.frozen=0;G.pose=null;G.poseLock=false;G.talking=false;res(ok)};
    const pa=pick(Object.values(AG).filter(a=>a.patrol)),look=o.look&&o.look.col?o.look:pa.look,nm=o.nm||pa.nm;G.frozen=90;G.pose='blok';G.poseLock=true;G.talking=true;
    K.dialog({name:nm,role:'Aanhouding'+(stars>1?' · '+'★'.repeat(stars):''),look:Object.assign({},look,{bg:'#141c2e'}),mood:'boos',col:'#4d7dff',lines:[pick(['Handen waar ik ze kan zien. Je bent erbij.','Zo. Einde verhaal. Omdraaien.','Hebbes. Je gaat mee naar het bureau.'])],choices:[
      {t:'Envelop toeschuiven · '+fmt(p),sub:S.cash<p?'':'Kans '+Math.round(k*100)+'%'+(wid&&loon(wid)?' · je wijkagent helpt':''),ic:K.ic.envelop,risk:riskOf(k),dis:S.cash<p,why:'Je hebt '+fmt(p)+' contant nodig',f:()=>{picked=true;
        if(Math.random()<k){S.cash-=p;korpsAdd(2);if(typeof addHeat==='function')addHeat(3);G.ev&&G.ev('omkoop');G.snd&&G.snd.fx('cash');sv();K.say(pick(['…Ik heb je niet gezien. Wegwezen.','Loop door. En kom me vandaag niet meer tegen.']),null,[]);setTimeout(()=>{K.closeDialog(true);done(true)},1500)}
        else{const lose=Math.round(p*.5);S.cash-=lose;korpsAdd(-4);if(typeof addHeat==='function')addHeat(4);G.ev&&G.ev('smeerfail');G.snd&&G.snd.fx('bad');sv();K.say('Omkoping? Dat komt er nog bij. En dit geld is bewijs.','boos',[]);G.toast&&G.toast('Mislukt: '+fmt(lose)+' in beslag genomen','bad');setTimeout(()=>{K.closeDialog(true);done(false)},1700)}}},
      {t:'Meegaan',ic:K.ic.hand,f:()=>{picked=true;K.closeDialog(true);done(false)}}],onClose:()=>{if(!picked)done(false)}})})}
/* ---------- wat de kapper weet ---------- */
function roddel(){const s=SS(),L=Object.values(AG).filter(a=>a.wijk&&!s.kn[a.id]);if(!L.length)return '';const a=pick(L);s.kn[a.id]=1;sv();
  return a.nm+' van '+(WIJKN[a.wijk]||'de wijk')+'? '+(a.cor>.6?'Die pakt alles aan wat je toeschuift.':a.cor<.3?'Probeer het niet. Die is niet te koop.':'Die twijfelt. Zorg eerst dat je goed met elkaar bent.')}
/* ---------- telefoon: tabblad Politie ---------- */
function html(){const s=SS(),now=Date.now(),k=korps(),Vv=V();
  return `<div class="sd-p2-dag"><b>Naam bij het korps: ${E(korpsT())}</b><i class="sd-p2-pb"><i style="width:${(k+100)/2}%;background:#4d7dff"></i></i><span>Ontsnappen en rammen maken het slechter, enveloppen en koffie beter.</span></div>`+
   WA.map(w=>{const a=AG['a_'+w[0]];if(!a)return '';const v=bond(a),l=Vv.LV[Vv.lvI(v)],on=loon(a.wijk),h=on?Math.ceil((s.pay[a.wijk]-now)/3600e3):0,kn=s.kn[a.id];
    return `<button class="sd-p2-row sd-bk-r${on?' pay':''}" data-agent="${a.id}"><canvas data-fc="${a.id}" width="24" height="24"></canvas><span><b>${E(a.nm)}</b><small>${E(WIJKN[a.wijk]||'')}${kn?' · '+(a.cor>.6?'te koop':a.cor<.3?'niet te koop':'twijfelt'):''}</small><i class="sd-p2-pb" style="--k:${l[2]}"><i style="width:${(v+100)/2}%"></i></i></span><em style="color:${on?'#ffd35a':l[2]}">${on?'Loonlijst '+h+'u':E(l[1])}</em></button>`}).join('')+
   `<p class="sd-p2-note">Een wijkagent op je loonlijst ziet jouw misdaden niet en moffelt de meeste 112-meldingen uit zijn wijk weg. Tik op een agent voor een route.</p>`}
function click(t,close){const b=t.closest('[data-agent]');if(!b)return false;const a=AG[b.dataset.agent];if(a&&a.n&&!a.n.away){close();G.setWaypoint&&G.setWaypoint(a.n.x,a.n.z,a.nm)}return true}
G.smeer={AG,blind,zag,away,patrol,intercept,kan,aanbod,roddel,html,click,loon,n:loonN,korps,korpsAdd,_t:{loonP,loonK,vangP,vangK,envelop,SS}};
/* ---------- koppelen ---------- */
const wait=setInterval(()=>{if(!G.ready||!G.addFixed||!G.npcA||!G.wijk||!G.volk||!G.ev)return;clearInterval(wait);try{setup()}catch(e){console.error(e)}
  // wat je doet telt bij het korps
  const ev0=G.ev;G.ev=function(name,n){ev0(name,n);try{if(name==='ontsnap')korpsAdd(-2);else if(name==='ontsnap3')korpsAdd(-3);else if(name==='ram')korpsAdd(-5)}catch(e){}};
  // elke dag zakt het wat weg; afgelopen enveloppen melden zich
  const tick=()=>{try{const s=SS(),d=dayN();if(s.d!==d){if(s.d){const n=Math.min(20,d-s.d);s.k=s.k>0?Math.max(0,s.k-n):Math.min(0,s.k+n)}s.d=d;sv()}
      Object.keys(s.pay).forEach(w=>{if(s.pay[w]&&s.pay[w]<Date.now()){delete s.pay[w];const a=AG['a_'+w];if(a)G.msg&&G.msg('stad',a.nm+' staat niet meer op je loonlijst. In '+(WIJKN[w]||'de wijk')+' wordt weer gewoon gebeld.',{k:'app',a:'bekenden'});sv()}})}catch(e){}};
  tick();setInterval(tick,60000)},320);
})();
