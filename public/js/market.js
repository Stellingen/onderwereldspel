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

// ---------- Nieuwe coins ----------
// Elke 4 uur komt er een nieuwe coin op de markt (voor iedereen dezelfde, vaste functie van de tijd). 60% is een memecoin:
// die stijgt hard (gemiddeld ±30% per uur), maar kan elk moment crashen (een 'rug pull'): gemiddeld na ±2,5 uur, haalt hij 50×
// dan crasht hij zeker. Bij een crash is je inzet weg en gaat hij van de markt ("Dit was een scam"). Doorgerekend: de kans op een
// crash is per uur iets groter dan de groei, dus vasthouden levert gemiddeld iets minder op dan je inlegt (net als in het echt).
// De andere 40% is een echte coin: rustiger, licht stijgend, en na 48 uur gaat hij naar de grote beurs (je stukken worden dan
// verkocht tegen de laatste koers). Of een coin echt is, zie je alleen aan de naam en de grafiek, en dat is expres niet makkelijk.
const L_MS=4*3600000,L_STEP=300000,L_REAL=48*3600000,L_SHOW=12*3600000;
const L_NAMES={meme:[['FrikandelCoin','FRIK'],['StoepKat','KAT'],['HodlHamster','HODL'],['MoonMuis','MUIS'],['DuifToken','DUIF'],['Kroketje','KROK'],['BitBami','BAMI'],['Pannenkoek Inu','PANI'],['Raketreiger','REIG'],['Snackbar Doge','SNAK'],['Lambo Lammetje','LAMB'],['TurboTosti','TOST'],['Gabber Coin','GABR'],['Kaaskop Inu','KAAS']],
 real:[['Polder Protocol','PLDR'],['GrachtNet','GRCT'],['Dijkbit','DIJK'],['NoordLedger','NRDL'],['Tulpix','TLPX'],['HavenChain','HVNC'],['Delta Finance','DLTA'],['Molen Token','MOLN'],['KadeCoin','KADE'],['Veluwe Vault','VLWV'],['Zuidas Pay','ZPAY'],['Brug Network','BRUG']]};
const L_COLS=['#ffd35a','#5fe3a6','#ff7fb3','#7cc4ff','#b8a1ff','#ffad6b','#4cc6ff','#ff5c6c'];
const LC=new Map();
const u01=(seed,k)=>hash(seed,k)/4294967296;
function coin(k){if(typeof k==='string')k=+k.slice(1);if(!(k>=0))return null;let c=LC.get(k);if(c)return c;
 const sd=900001+k*13,meme=u01(sd,1)<.6,mix=u01(sd,2),L=(meme?mix<.75:mix>=.85)?L_NAMES.meme:L_NAMES.real,nm=L[hash(sd,3)%L.length];
 const t0=EPOCH+k*L_MS+Math.floor(u01(sd,4)*3600000);
 c={id:'L'+k,k,n:nm[0],s:nm[1],meme,t0,col:L_COLS[hash(sd,5)%L_COLS.length],risk:5,fee:.012,y:0,kind:'Nieuwe coin',coin:1,seed:sd,
  base:meme?.002+u01(sd,6)*.05:.4+u01(sd,6)*12,d:meme?'Net op de markt. Een community die "to the moon" roept.':'Net op de markt. Een project met een website en een whitepaper.'};
 // pad in stappen van 5 minuten (log-koers)
 const g=meme?(.24+u01(sd,7)*.14)/12:(.0012+u01(sd,7)*.003)/12,sig=meme?.065:.028,h=meme?(g*12+.05+sig*sig*6):0;
 let end=meme?Math.max(20*60000,-Math.log(1-u01(sd,8)*.9999)/h*3600000):L_REAL;end=Math.min(end,meme?30*3600000:L_REAL);
 const n=Math.ceil(end/L_STEP)+1,lp=new Float64Array(n);let x=0,cap=Math.log(50);
 for(let j=1;j<n;j++){x+=g+sig*z(sd,100+j)-sig*sig/2*(meme?0:1);if(meme&&x>=cap){x=cap;end=j*L_STEP;lp[j]=x;c.n_=j;break}lp[j]=x}
 c.lp=lp;c.end=t0+end;c.endKind=meme?'scam':'beurs';LC.set(k,c);if(LC.size>200)LC.delete(LC.keys().next().value);return c}
function coinPrice(c,ms){if(typeof c==='string')c=coin(c);if(!c)return 0;const dt=ms-c.t0;if(dt<=0)return c.base;
 if(ms>=c.end)return c.endKind==='scam'?c.base*Math.exp(c.lp[Math.min(c.lp.length-1,Math.floor((c.end-c.t0)/L_STEP))]||0)*.02:coinPrice(c,c.end-1);
 const j=dt/L_STEP,a=Math.floor(j),f=j-a,x0=c.lp[Math.min(a,c.lp.length-1)]||0,x1=c.lp[Math.min(a+1,c.lp.length-1)]||x0;
 // laatste 4 minuten voor een crash: hij zakt al in
 let p=c.base*Math.exp(x0+(x1-x0)*f);if(c.endKind==='scam'&&c.end-ms<240000)p*=.15+.85*(c.end-ms)/240000;return p}
// coins die nu te zien zijn: op de markt, of de laatste 12 uur gecrasht / naar de beurs
function coins(ms){const out=[],k1=Math.floor((ms-EPOCH)/L_MS);for(let k=k1;k>=Math.max(0,k1-14);k--){const c=coin(k);if(c.t0>ms)continue;
  const live=ms<c.end;if(live||ms-c.end<L_SHOW)out.push(c)}return out}
// wanneer de volgende coin komt
function nextCoin(ms){let k=Math.floor((ms-EPOCH)/L_MS);for(let i=0;i<3;i++){const c=coin(k+i);if(c.t0>ms)return c.t0}return ms+L_MS}
const fprice=price;
function price2(f,ms){if(typeof f==='string'&&f[0]==='L')return coinPrice(f,ms);if(f&&f.coin)return coinPrice(f,ms);return fprice(f,ms)}
function series2(f,ms,span,n){const out=[];for(let i=0;i<n;i++)out.push(price2(f,ms-span+span*i/(n-1)));return out}
const API={FUNDS,price:price2,series:series2,STEP,EPOCH,W,X,stepAt,coin,coins,coinPrice,nextCoin,L_MS};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.MK=API;
})(typeof window!=='undefined'?window:globalThis);
