// Beurs voor de bank: koersen die voor iedereen gelijk zijn en vanzelf doorlopen, ook als je offline bent.
// De koers is een vaste functie van de tijd (zelfde seed voor alle spelers), gebouwd met een Brownse brug:
// elke koers is in een paar microseconden uit te rekenen voor elk moment, zonder de hele geschiedenis af te lopen.
// Koers = basis × e^(X - σ²/2), waarbij X een som is van bewegende vensters van toevalsstappen (traag en snel).
// Zo schommelt een koers flink (zakken kan echt), maar loopt hij op lange termijn niet weg naar nul of oneindig.
// Het rendement komt uit de uitkering per uur (rente, huur, dividend, staking): die groeit je aantal stukken.
// Doorgerekend (marketsim.js): zie de kansen op verlies per fonds in de README.
(function(root){
const EPOCH=Date.UTC(2026,0,1),STEP=10000,N=1<<25; // stap = 10 s, ±10 jaar vanaf 1 januari 2026 (er is dus al koersgeschiedenis)
function hash(a,b){let h=Math.imul(a^0x9e3779b9,0x85ebca6b)^Math.imul((b|0)+0x632be5ab,0xc2b2ae35);
 h^=h>>>16;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return h>>>0}
function z(seed,k){const u1=(hash(seed,k)+1)/4294967297,u2=hash(seed^0x5bd1e995,k)/4294967296;return Math.sqrt(-2*Math.log(u1))*Math.cos(6.283185307179586*u2)}
// Brownse beweging W(t) op hele stappen, t in [0, N]
// knooppunten worden onthouden: opeenvolgende koersen delen bijna de hele boom
const NODE=new Map(),SQ=[];for(let d=0;d<=26;d++)SQ[d]=Math.sqrt(Math.pow(2,d)/4);
function zc(seed,m){const k=seed*67108864+m;let v=NODE.get(k);if(v===undefined){if(NODE.size>300000)NODE.clear();v=z(seed,m);NODE.set(k,v)}return v}
function W(seed,t){let lo=0,hi=N,wl=0,wh=Math.sqrt(N)*zc(seed,0),d=25;
 while(hi-lo>1){const m=(lo+hi)>>>1,wm=(wl+wh)/2+SQ[d]*zc(seed,m);d--;if(t===m)return wm;if(t<m){hi=m;wh=wm}else{lo=m;wl=wm}}
 return t===lo?wl:wh}
// y = uitkering per uur, c = [[σ, venster in uren], ...] (schommelingen die weer bijtrekken),
// het venster van 60 dagen (1440 uur) laat een koers wekenlang zakken of stijgen; rw = optionele vrije wandeling, risk = 1..5
const FUNDS=[
 {id:'oblig',n:'Staatsobligaties',s:'NL-OBL',d:'Lenen aan de Staat. Saai, maar je slaapt er rustig van.',kind:'Rente',y:.0022,base:100,col:'#7cc4ff',risk:1,fee:.0025,seed:11,rw:0,c:[[.012,1440],[.012,72],[.005,4]]},
 {id:'vast',n:'Vastgoedfonds Zuidas',s:'ZUID',d:'Kantoren en penthouses. Huur komt elke maand binnen, de waarde beweegt mee met de markt.',kind:'Huur',y:.0032,base:250,col:'#3fe395',risk:2,fee:.005,seed:23,rw:0,c:[[.07,1440],[.08,240],[.03,12]]},
 {id:'haven',n:'Haven Rotterdam NV',s:'HAVN',d:'Containers, kranen en een paar ladingen die nergens op papier staan. Aandelen schommelen flink.',kind:'Dividend',y:.0045,base:40,col:'#ffad6b',risk:3,fee:.0075,seed:37,rw:0,c:[[.18,1440],[.20,168],[.09,8],[.025,.5]]},
 {id:'coin',n:'OnderCoin',s:'ODC',d:'Crypto uit een kelder in Rotterdam-Zuid. Kan in een middag verdubbelen of halveren.',kind:'Staking',y:.0065,base:3,col:'#ff7fb3',risk:5,fee:.01,seed:53,rw:0,c:[[.32,1440],[.50,168],[.25,6],[.07,.5]]}];
const PER_DAY=86400000/STEP;FUNDS.forEach(f=>{f.var=f.c.reduce((a,x)=>a+x[0]*x[0],0);f.win=f.c.map(x=>Math.round(x[1]*3600000/STEP));f.rws=f.rw/Math.sqrt(PER_DAY)});
// X op stap t (genormaliseerd: elk venster is N(0,1))
function X(f,t){let x=f.rws?f.rws*W(f.seed*7+6,t):0;f.c.forEach((c,i)=>{const L=f.win[i];x+=c[0]*(W(f.seed*7+i,t+L)-W(f.seed*7+i,t))/Math.sqrt(L)});return x}
const stepAt=ms=>Math.max(0,Math.min(N-1e6,Math.floor((ms-EPOCH)/STEP)));
const PC=new Map();
function price(f,ms){if(typeof f==='string')f=FUNDS.find(x=>x.id===f);const t=stepAt(ms),k=f.seed*67108864+t;let p=PC.get(k);if(p!==undefined)return p;
 p=f.base*Math.exp(X(f,t)-f.var/2);if(PC.size>20000)PC.clear();PC.set(k,p);return p}
// reeks van n punten over de laatste `span` ms
function series(f,ms,span,n){const out=[];for(let i=0;i<n;i++)out.push(price(f,ms-span+span*i/(n-1)));return out}
const API={FUNDS,price,series,STEP,EPOCH,W,X,stepAt};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.MK=API;
})(typeof window!=='undefined'?window:globalThis);
