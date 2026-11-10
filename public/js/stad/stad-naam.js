// Pixelstad: je Straatnaam. Alles wat je in de Pixelstad doet (praten, klussen, vissen, racen, wijken overnemen …) levert
// straat-XP op. Elk level geeft één punt voor een talent dat alleen in de Pixelstad werkt: sneller lopen, meer adem, vlugge
// vingers, minder getuigen die bellen, meer zakruimte, een goedkopere taxi, betere vis, een snellere auto, meer respect.
// High rollers krijgen 20% meer straat-XP. Bewaard in S.stadNaam = {xp, pk:{talent:rang}, rs:dag van de laatste herverdeling}.
(function(){
'use strict';
const G=STAD,K=G.kit,E=K.E;
const sv=()=>{try{save()}catch(e){}};
const N=()=>{try{if(!S.stadNaam||typeof S.stadNaam!=='object')S.stadNaam={xp:0,pk:{}};if(!S.stadNaam.pk)S.stadNaam.pk={};return S.stadNaam}catch(e){return {xp:0,pk:{}}}};
const MAXL=30;
const need=L=>60*(L-1)+15*(L-1)*L;            // totaal XP voor level L
function level(xp){xp=xp==null?N().xp:xp;let L=1;while(L<MAXL&&xp>=need(L+1))L++;return L}
const TITLES=[[1,'Onbekende'],[3,'Nieuwkomer'],[5,'Bekend gezicht'],[8,'Buurtfiguur'],[12,'Straatmaat'],[16,'Grote jongen'],[20,'Straatlegende'],[25,'Onderkoning'],[30,'Koning van de stad']];
const title=L=>{let t=TITLES[0][1];TITLES.forEach(x=>{if(L>=x[0])t=x[1]});return t};
// wat levert wat op
const SXP={praat:1,roof:6,oma:5,fooi:2,heler:4,ontsnap:10,ontsnap3:10,verstop:3,missie:12,pakket:8,foto:2,taxi:1,kraak:5,lever:12,jack:10,vis:3,visz:9,bak:1,tag:6,wijk:60,bescherm:3,
  brons:15,zilver:25,goud:40,bekend:1,cadeau:2,gunst:3,verzoek:6,vriend:20,vertrouw:40,loon:15,omkoop:10,ram:15,voorpagina:6,agentkoffie:1,race:4,dobbel:2,optreden:8,uitkijk:10,event:12,zakrol:5,deal:4,hond:25,compl:1,knok:10,eet:1,selfie:2,stadfoto:2,dagvol:20,zoek:3,bal:1};
const PERKS=[
 ['benen','Snelle benen','Je loopt en rent 4% sneller per rang',3],
 ['adem','Lange adem','Rennen voor de politie kost 13% minder adem per rang',3],
 ['vingers','Vingervlug','Sloten en zakken: het groene vlak is 12% groter per rang',2],
 ['prater','Gladde prater','Getuigen bellen 12% minder vaak per rang',3],
 ['zakken','Diepe zakken','Twee plekken extra voor spullen en vis per rang',2],
 ['neus','Scherpe neus','Pakketjes, klanten en tagmuren in de buurt staan op je minikaart',1],
 ['taxi','Vaste klant','De taxi is 20% goedkoper per rang',2],
 ['hengel','Vissersgeluk','Vaker zeldzame vis, en hij is makkelijker binnen te halen',2],
 ['racer','Zware voet','Elke auto rijdt 4% harder per rang',2],
 ['charme','Charmeur','25% meer respect en fooien per rang',2],
 ['incasso','Incasseerder','15% meer beschermgeld per rang',2],
 ['vuist','IJzeren vuist','Je slaat 12% harder in een gevecht per rang',2]];
G.PERKS=PERKS;
const rank=id=>{try{return Math.max(0,Math.min((PERKS.find(p=>p[0]===id)||[0,0,0,0])[3],+N().pk[id]||0))}catch(e){return 0}};
G.perk=rank;
const spent=()=>PERKS.reduce((a,p)=>a+rank(p[0]),0);
const points=()=>Math.max(0,level()-1-spent());
function apply(){G.spMul=1+.04*rank('benen');G.stamK=1-.13*rank('adem');G.carK=1+.04*rank('racer')}
const tierN=()=>{try{return typeof tier==='function'?tier():0}catch(e){return 0}};
function add(x){if(!(x>0))return;const D=N(),L0=level(D.xp);D.xp=Math.round((D.xp+x*(tierN()>=2?1.2:1))*10)/10;const L1=level(D.xp);if(L1>L0)levelUp(L1);hud()}
function levelUp(L){G.snd&&G.snd.fx('lvl');const el=document.createElement('div');el.className='sd-ach sd-lvl';el.innerHTML=`<i>${L}</i><span><small>Straatnaam</small><b>${E(title(L))}</b><em>Level ${L} · 1 talentpunt erbij</em></span>`;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);
  G.fx2&&G.fx2.burst(G.P.x,2,G.P.z,'#ffd35a',16);if(!G.emote&&!G.driving&&G.doEmote&&!G.talking)G.doEmote('juich');
  G.msg&&G.msg('stad','Straatnaam level '+L+': '+title(L)+'. Je hebt een talentpunt te verdelen.',{k:'naam'},true);sv()}
function buy(id){const p=PERKS.find(x=>x[0]===id);if(!p||rank(id)>=p[3]||points()<1)return false;N().pk[id]=rank(id)+1;apply();G.snd&&G.snd.fx('ok');sv();return true}
const dayKey=()=>{try{return new Date().toLocaleDateString('nl-NL',{timeZone:'Europe/Amsterdam'})}catch(e){return new Date().toDateString()}};
const respecCost=()=>{try{const c=G.roofRef&&G.roofRef();return Math.max(100,Math.round(((c?c.min+c.max:200)/2)*4/50)*50)}catch(e){return 500}};
function respec(){const D=N();if(!spent())return false;if(D.rs===dayKey()){G.toast('Je kunt één keer per dag opnieuw verdelen','bad');return false}const c=respecCost();if(S.cash<c){G.toast('Opnieuw verdelen kost '+fmt(c)+' contant','bad');return false}
  S.cash-=c;D.pk={};D.rs=dayKey();apply();sv();G.snd&&G.snd.fx('tab');return true}
// gebeurtenissen van de Pixelstad → straat-XP
const wait=setInterval(()=>{if(!G.ev)return;clearInterval(wait);const ev0=G.ev;G.ev=function(name,n){ev0(name,n);const x=SXP[name];if(x)add(x*(n||1))};apply();hud()},150);
/* ---------- regel op je kaartje linksboven ---------- */
let row=null;
function hud(){const card=document.getElementById('sdCard');if(!card)return;if(!row){row=document.createElement('button');row.className='sd-sn';row.id='sdSn';row.title='Straatnaam';card.appendChild(row);row.addEventListener('click',()=>G.phone&&G.phone.open('naam'))}
  const D=N(),L=level(D.xp),a=need(L),b=need(L+1),p=L>=MAXL?100:Math.max(0,Math.min(100,(D.xp-a)/(b-a)*100)),pt=points();
  row.innerHTML=`<b>${L}</b><span>${E(title(L))}</span><i><i style="width:${p.toFixed(1)}%"></i></i>${pt?`<em>+${pt}</em>`:''}`}
setInterval(hud,3000);
/* ---------- scherm in de telefoon ---------- */
function html(){const D=N(),L=level(D.xp),a=need(L),b=need(L+1),p=L>=MAXL?100:Math.max(0,Math.min(100,(D.xp-a)/(b-a)*100)),pt=points();
  return `<div class="sd-p2-list sd-nm"><div class="sd-nm-top"><b>${L}</b><div><strong>${E(title(L))}</strong><i class="sd-p2-pb"><i style="width:${p}%"></i></i><small>${L>=MAXL?'Hoogste level':Math.floor(D.xp-a)+' / '+(b-a)+' straat-XP'}${tierN()>=2?' · High roller +20%':''}</small></div></div>
   <div class="sd-nm-pt${pt?' on':''}"><span>${pt?pt+' talentpunt'+(pt>1?'en':'')+' te verdelen':'Elk level geeft een talentpunt'}</span>${spent()?`<button data-respec>Opnieuw · ${fmt(respecCost())}</button>`:''}</div>
   ${PERKS.map(pk=>{const r=rank(pk[0]),full=r>=pk[3];return `<div class="sd-nm-pk${r?' has':''}"><span><b>${E(pk[1])}</b><small>${E(pk[2])}</small></span><i>${'<u class="on"></u>'.repeat(r)}${'<u></u>'.repeat(pk[3]-r)}</i>${full?'<em>Max</em>':`<button data-perk="${pk[0]}" ${pt?'':'disabled'} aria-label="Talent kiezen">+</button>`}</div>`}).join('')}
   <p class="sd-p2-note">Talenten werken alleen in de Pixelstad.</p></div>`}
function click(t){const b=t.closest('[data-perk]');if(b){buy(b.dataset.perk);hud();return true}if(t.closest('[data-respec]')){respec();hud();return true}return false}
G.naam={level:()=>level(),title:()=>title(level()),points,add,html,click,xp:()=>N().xp,need};
})();
