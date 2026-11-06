// Wapenskins en Wapenkisten — een extraatje in het casino, alleen voor VIP en High roller.
// Een skin = patroon × wapen. Zes zeldzaamheden. Vier kisten: hoe duurder, hoe meer kans op zeldzaam.
// De uitslag ligt vast bij de klik (geld eraf, skin in je kluis, casinoRound); de strip die afremt is alleen de show.
// Opslag: S.skins = ['patroon:wapen', ...] (dubbele mogen), S.skinOn = {wapen:'patroon'} (puur cosmetisch), S.wkLast = laatste kist.
// Verwachte waarde per kist ligt vast: VIP 88%, High roller 91% van de prijs (zie wkOdds). Geen cashback, telt niet voor de casinokaart.

const SK_R=[
 {n:'Gewoon',c:'#a3abb5',v:1000},
 {n:'Ongewoon',c:'#3fe395',v:3200},
 {n:'Zeldzaam',c:'#4f9dff',v:11000},
 {n:'Episch',c:'#b46bff',v:40000},
 {n:'Legendarisch',c:'#ffb020',v:220000},
 {n:'Ultra legendarisch',c:'#ff3d6e',v:20000000}];
// [id, naam, zeldzaamheid, soort tekening, kleuren, waardefactor binnen de zeldzaamheid]
const SKP_LIST=[
 ['grgr','Grachtengrijs',0,'metal',['#5d6670','#a4aeb8'],1],
 ['bakf','Bakfietsbeige',0,'metal',['#8a7a5c','#d2c29a'],.9],
 ['vond','Vondelcamo',0,'camo',['#3d4a2c','#5c6b3a','#22281a'],1.05],
 ['stoe','Stoeptegel',0,'check',['#5f6268','#7d8086'],.9],
 ['bouw','Bouwhek',0,'stripe',['#e2e2e2','#d23a2a'],1.1],
 ['roes','Oud Roest',0,'camo',['#6b3a1e','#8f5228','#3e2414'],.95],
 ['asfa','Nat Asfalt',0,'dots',['#25282e','#3d4149'],.85],
 ['herf','Herfstblad',0,'camo',['#6e5220','#9b6b2a','#3f3216'],1],
 ['pind','Pindakaas',0,'metal',['#9a6a2e','#e0b46a'],1.05],
 ['regj','Regenjas',0,'stripe',['#e7c740','#b8961a'],1],
 ['kade','Kademuur',0,'brick',['#5a5f66','#33373c'],1.1],
 ['fiet','Fietsenrek',0,'bike',['#3a3f47','#a3abb5'],1],
 ['jord','Jordaanbaksteen',1,'brick',['#9a4128','#4e1d10'],1],
 ['grwa','Grachtwater',1,'wave',['#1b4756','#4fa3b4'],1],
 ['stro','Stroopwafel',1,'waffle',['#c08a3e','#7a4f1c'],1.1],
 ['tram','Tramrails',1,'rails',['#3a3e45','#c7ccd3'],.9],
 ['hari','Haringkar',1,'stripe',['#f4f4f4','#2b5fae'],1],
 ['oran','Oranjegekte',1,'stripe',['#ff7a1a','#ffc04a'],1.15],
 ['nbus','Nachtbus',1,'dots',['#111c33','#4f86ff'],.95],
 ['kaas','Kaasmarkt',1,'cheese',['#f2c230','#c99510'],.9],
 ['bitt','Bitterbal',1,'camo',['#7a4618','#a8642a','#4e2a0c'],1],
 ['mist','IJmist',1,'metal',['#8ea6b6','#eef4f8'],1],
 ['delf','Delfts Blauw',2,'delft',['#f2f5fb','#1f4fae'],1.1],
 ['tulp','Tulpenveld',2,'tulip',['#2b5f2a','#e8333f','#ffd23a'],1],
 ['xxx','Drie Kruisen',2,'xxx',['#141414','#d4202a'],1.15],
 ['gord','Grachtengordel',2,'houses',['#1d2330','#c99a5b'],1],
 ['tijg','Haventijger',2,'tiger',['#e08a1e','#1a1208'],.95],
 ['zebr','Zebrapad',2,'zebra',['#f2f2f2','#1c1c1c'],.85],
 ['kool','Koolstof',2,'carbon',['#16181c','#30343b'],.95],
 ['neon','Neon Wallen',2,'neon',['#14081c','#ff3da8','#ff9be0'],1],
 ['goud','Gouden Bocht',3,'engrave',['#f2c24a','#7a5206'],1.1],
 ['graf','Kraakpand',3,'graffiti',['#22252b','#ff4fd8','#3fe395','#ffd23a'],1],
 ['vuur','Frituurvuur',3,'flame',['#1a0a04','#ff5a1a','#ffd23a'],1],
 ['hack','Hackersgroen',3,'circuit',['#04120a','#2fe38a'],.9],
 ['diam','Diamantbeurs',3,'argyle',['#14223a','#5cb8ff','#e8f6ff'],1.05],
 ['noor','Noorderlicht',3,'aurora',['#06121f','#3fe3b0','#8a5cff'],.95],
 ['kroo','Kroonjuweel',4,'jewel',['#3a0b2a','#ffcf4a','#e8335a'],1.1],
 ['oudn','Oud en Nieuw',4,'fireworks',['#07070f','#ffd23a','#ff3d6e','#3fd6ff'],1],
 ['blik','Bliksem boven het IJ',4,'lightning',['#0b0e20','#7fb2ff','#ffffff'],.95],
 ['zwgd','Zwart Goud',4,'engrave',['#121212','#e8b923'],.95],
 ['peet','De Peetvader',5,'crown',['#0a0a0a','#ffd35a','#fff3c4'],1.1],
 ['mlkw','Melkweg van Mokum',5,'galaxy',['#05030f','#8a5cff','#ff3da8','#ffffff'],1],
 ['prsm','Prisma',5,'prism',['#ff3d6e','#ffd23a','#3fe395','#3fd6ff','#8a5cff'],.9]];
const SKP=Object.fromEntries(SKP_LIST.map(([id,n,r,k,c,v])=>[id,{id,n,r,k,c,v}]));
// waardefactor genormaliseerd: gemiddeld 1 per zeldzaamheid, zodat de verwachte waarde precies klopt
SK_R.forEach((R,r)=>{const L=SKP_LIST.filter(p=>p[2]===r).map(p=>SKP[p[0]]),m=L.reduce((a,p)=>a+p.v,0)/L.length;L.forEach(p=>p.vk=p.v/m);R.pats=L.map(p=>p.id)});

// Wapens met skins: wat skin:true heeft, anders alle wapens uit de wapenwinkel
const skGuns=()=>{const G=typeof GEAR!=='undefined'?GEAR:[],a=G.filter(g=>g.skin);return a.length?a:G.filter(g=>g.cat==='wapen')};
const skGun=id=>(typeof GEAR!=='undefined'&&GEAR.find(g=>g.id===id))||null;
const skGunName=id=>{const g=skGun(id);return g?g.n:'Wapen'};
// duurder wapen = duurdere skin (0,7× tot 1,3×), genormaliseerd op gemiddeld 1 over de wapens met skins
let _skWk=null,_skWkSig='';
function skWk(id){const L=skGuns(),sig=L.map(g=>g.id+g.p).join();if(sig!==_skWkSig){_skWkSig=sig;const raw={};L.forEach(g=>{const t=(Math.log10(Math.max(100,g.p||1000))-2.9)/3.4;raw[g.id]=.7+.6*Math.max(0,Math.min(1,t))});
 const m=L.reduce((a,g)=>a+raw[g.id],0)/Math.max(1,L.length);_skWk={};L.forEach(g=>_skWk[g.id]=raw[g.id]/m)}return _skWk[id]||1}
const skNice=v=>v>=1e6?Math.round(v/1e4)*1e4:v>=1e5?Math.round(v/1000)*1000:v>=1e4?Math.round(v/100)*100:Math.round(v/10)*10;
const skVal=key=>{const [p,w]=key.split(':'),P=SKP[p];return P?skNice(SK_R[P.r].v*P.vk*skWk(w)):0};
const skRar=key=>{const P=SKP[key.split(':')[0]];return P?P.r:0};

// ---------- Kisten ----------
// sh = kans per zeldzaamheid boven de bodem; de bodem krijgt de rest. De hogere kansen worden zo geschaald
// dat de verwachte waarde precies op het doel uitkomt (VIP 88%, High roller 91%).
const WK_CASES=[
 {id:'straat',n:'Straatkist',p:5000,col:'#c49a5a',d:'Alles kan erin zitten.',sh:[0,.27,.08,.02,.003,.00003]},
 {id:'koffer',n:'Kofferbakkist',p:25000,col:'#3fe395',d:'Uit de kofferbak. Geen vragen.',sh:[0,.30,.30,.12,.03,.0003]},
 {id:'pantser',n:'Pantserkist',p:100000,col:'#4f9dff',d:'Vanaf Ongewoon.',fl:1,sh:[0,0,.30,.35,.18,.0016]},
 {id:'gek',n:'Gekke Kist',p:1000000,col:'#ffb020',d:'Vanaf Zeldzaam. Alles of niks.',fl:2,sh:[0,0,0,.40,.42,.037]}];
const WK_RTP=[.88,.88,.91];
const wkCase=id=>WK_CASES.find(c=>c.id===id)||WK_CASES[0];
const wkTier=()=>typeof tier==='function'?Math.max(0,Math.min(2,tier())):0;
const _wkOdds={};
function wkOdds(id,t){t=t==null?wkTier():t;const C=wkCase(id),key=id+t;if(_wkOdds[key])return _wkOdds[key];
 const f=C.fl||0,fv=SK_R[f].v,goal=C.p*WK_RTP[t];let pv=0,ps=0;C.sh.forEach((p,r)=>{if(r>f){pv+=p*SK_R[r].v;ps+=p}});
 const k=(goal-fv)/(pv-ps*fv),P=C.sh.map((p,r)=>r>f?p*k:0);P[f]=1-P.reduce((a,b)=>a+b,0);return _wkOdds[key]=P}
// verwachte waarde (met afronding van de verkoopprijs) — voor de tekst bij de kist
function wkEV(id,t){const P=wkOdds(id,t),G=skGuns();let ev=0;P.forEach((p,r)=>{if(!p)return;const L=SK_R[r].pats;let s=0;L.forEach(pi=>G.forEach(g=>s+=skVal(pi+':'+g.id)));ev+=p*s/(L.length*Math.max(1,G.length))});return ev}
const wkRnd=()=>{try{return crypto.getRandomValues(new Uint32Array(1))[0]/4294967296}catch(e){return Math.random()}};
// één trekking: zeldzaamheid volgens de kansen, dan een patroon en een wapen (elk even vaak)
function wkDraw(id,t,rnd){rnd=rnd||wkRnd;const P=wkOdds(id,t);let u=rnd(),r=0;while(r<5&&u>=P[r]){u-=P[r];r++}while(!P[r]&&r>0)r--;
 const L=SK_R[r].pats,G=skGuns(),p=L[Math.min(L.length-1,Math.floor(rnd()*L.length))],g=G[Math.min(G.length-1,Math.floor(rnd()*G.length))];return p+':'+(g?g.id:'mes')}
const wkOneIn=p=>{if(!(p>0))return '';const n=1/p;return '1 op '+(n>=1000?Math.round(n/100)*100:n>=100?Math.round(n/10)*10:Math.round(n)).toLocaleString('nl-NL')};
const wkPct=p=>p>=.1?(p*100).toLocaleString('nl-NL',{maximumFractionDigits:1})+'%':p>=.001?(p*100).toLocaleString('nl-NL',{maximumFractionDigits:2})+'%':(p*100).toLocaleString('nl-NL',{maximumSignificantDigits:2})+'%';

// ---------- Tekenen ----------
const skHash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const skRng=s=>{let a=skHash(s);return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const skMix=(h,t,to)=>{const n=x=>parseInt(x,16),a=h.replace('#',''),b=(to||'#000000').replace('#','');const c=[0,2,4].map(i=>Math.round(n(a.substr(i,2))*(1-t)+n(b.substr(i,2))*t));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')};
const r1=v=>Math.round(v*10)/10;
// patroon of verloop met id; de wapenvorm vult met url(#id)
function skPat(P,id){const c=P.c,R=skRng(P.id);
 const pat=(w,h,inner,tr)=>`<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}"${tr?` patternTransform="${tr}"`:''}>${inner}</pattern>`;
 const bg=(col,w,h)=>`<rect width="${w}" height="${h}" fill="${col}"/>`;
 const wrap=(x,y,W,H,r,f)=>{let s='';[0,x<r?W:x>W-r?-W:null].forEach(dx=>{if(dx==null)return;[0,y<r?H:y>H-r?-H:null].forEach(dy=>{if(dy==null)return;s+=f(x+dx,y+dy)})});return s};
 switch(P.k){
 case 'metal':return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset=".42" stop-color="${c[0]}"/><stop offset=".6" stop-color="${c[0]}"/><stop offset="1" stop-color="${skMix(c[0],.45)}"/></linearGradient>`;
 case 'camo':{let s=bg(c[0],44,44);for(let i=0;i<9;i++){const col=c[1+i%2],x=R()*44,y=R()*44,r=3+R()*4,a=R()*6;s+=wrap(x,y,44,44,r+6,(X,Y)=>`<g fill="${col}"><ellipse cx="${r1(X)}" cy="${r1(Y)}" rx="${r1(r*1.5)}" ry="${r1(r)}" transform="rotate(${Math.round(a*30)} ${r1(X)} ${r1(Y)})"/><circle cx="${r1(X+r)}" cy="${r1(Y+r*.6)}" r="${r1(r*.8)}"/></g>`)}return pat(44,44,s)}
 case 'check':return pat(12,12,bg(c[0],12,12)+`<path d="M0 0h6v6H0zM6 6h6v6H6z" fill="${c[1]}"/>`);
 case 'stripe':return pat(10,10,bg(c[0],10,10)+`<rect width="5" height="10" fill="${c[1]}"/>`,'rotate(45)');
 case 'dots':return pat(8,8,bg(c[0],8,8)+`<g fill="${c[1]}"><circle cx="2" cy="2" r="1.5"/><circle cx="6" cy="6" r="1.5"/></g>`);
 case 'cheese':return pat(18,14,bg(c[0],18,14)+`<g fill="${c[1]}"><circle cx="4" cy="4" r="2.6"/><circle cx="13" cy="9" r="1.8"/><circle cx="9" cy="2" r="1"/><circle cx="16" cy="2.5" r="1.2"/><circle cx="5" cy="11" r="1.4"/></g>`);
 case 'brick':{const b2=skMix(c[0],.18);return pat(16,8,bg(c[1],16,8)+`<g fill="${c[0]}"><rect x=".6" y=".6" width="6.8" height="2.8"/><rect x="4.6" y="4.6" width="6.8" height="2.8"/></g><g fill="${b2}"><rect x="8.6" y=".6" width="6.8" height="2.8"/><rect x="-3.4" y="4.6" width="6.8" height="2.8"/><rect x="12.6" y="4.6" width="6.8" height="2.8"/></g>`)}
 case 'bike':return pat(26,16,bg(c[0],26,16)+`<g fill="none" stroke="${c[1]}" stroke-width=".9"><circle cx="6" cy="10" r="4.4"/><circle cx="20" cy="10" r="4.4"/><path d="M6 10L11 5h6l3 5M11 5l2 5 4-5M10 3.6h3M17 5l-.6-1.6h2"/></g>`);
 case 'wave':return pat(20,8,bg(c[0],20,8)+`<path d="M0 4Q5 0 10 4T20 4" fill="none" stroke="${c[1]}" stroke-width="1.3"/><path d="M0 7.6Q5 3.6 10 7.6T20 7.6" fill="none" stroke="${c[1]}" stroke-opacity=".4" stroke-width=".8"/>`);
 case 'waffle':return pat(9,9,bg(c[0],9,9)+`<rect x="2" y="2" width="5" height="5" fill="#fff" fill-opacity=".1"/><path d="M0 0H9M0 0V9" stroke="${c[1]}" stroke-width="2.2"/>`,'rotate(45)');
 case 'rails':return pat(12,16,bg(c[0],12,16)+`<rect x="4" width="3" height="16" fill="${skMix(c[0],.35)}"/><path d="M0 5H12M0 11H12" stroke="${c[1]}" stroke-width="1.2"/>`);
 case 'delft':return pat(16,16,bg(c[0],16,16)+`<g fill="none" stroke="${c[1]}" stroke-width=".9"><circle cx="8" cy="8" r="4"/><path d="M8 2.4V5M8 11v2.6M2.4 8H5M11 8h2.6"/></g><g fill="${c[1]}"><circle cx="8" cy="8" r="1.4"/><path d="M0 0h2.6A2.6 2.6 0 0 1 0 2.6zM16 0v2.6A2.6 2.6 0 0 1 13.4 0zM0 16v-2.6A2.6 2.6 0 0 1 2.6 16zM16 16h-2.6A2.6 2.6 0 0 1 16 13.4z"/></g><rect width="16" height="16" fill="none" stroke="${c[1]}" stroke-opacity=".3" stroke-width=".5"/>`);
 case 'tulip':{const t=(x,y,col)=>`<path d="M${x} ${y+2}v3" stroke="#6fbf5a" stroke-width=".8"/><path d="M${x-2.4} ${y-2.6}L${x-1.2} ${y-.6}L${x} ${y-2.8}L${x+1.2} ${y-.6}L${x+2.4} ${y-2.6}Q${x+2.6} ${y+2} ${x} ${y+2.2}Q${x-2.6} ${y+2} ${x-2.4} ${y-2.6}Z" fill="${col}"/>`;return pat(20,16,bg(c[0],20,16)+t(5,5,c[1])+t(15,12,c[2])+t(15,-4,c[2]))}
 case 'xxx':return pat(24,12,bg(c[0],24,12)+[4,12,20].map(x=>`<path d="M${x-2.4} 3.6L${x+2.4} 8.4M${x+2.4} 3.6L${x-2.4} 8.4" stroke="${c[1]}" stroke-width="1.7"/>`).join(''));
 case 'houses':{let s=bg(c[0],36,24),d='',win='';for(let x=0;x<36;x+=6){const h=9+Math.floor(R()*7),top=24-h;d+=`M${x} 24V${top}L${x+3} ${top-3}L${x+6} ${top}V24Z`;win+=`<rect x="${x+1.3}" y="${top+2}" width="1.3" height="1.9"/><rect x="${x+3.4}" y="${top+2}" width="1.3" height="1.9"/><rect x="${x+1.3}" y="${top+5.5}" width="1.3" height="1.9"/><rect x="${x+3.4}" y="${top+5.5}" width="1.3" height="1.9"/>`}
  return pat(36,24,s+`<path d="${d}" fill="${c[1]}" stroke="${skMix(c[1],.4)}" stroke-width=".4"/><g fill="${c[0]}" fill-opacity=".85">${win}</g>`)}
 case 'tiger':case 'zebra':{const W=P.k==='zebra'?22:30,H=24;let s=bg(c[0],W,H);for(let i=0;i<4;i++){const y=i*6+R()*2,a=R()*2.5,th=1.4+R()*1.4;s+=`<path d="M0 ${r1(y)}Q${W*.3} ${r1(y+2.5+a)} ${W/2} ${r1(y+.6)}Q${W*.75} ${r1(y-1.4)} ${W} ${r1(y)}L${W} ${r1(y+th)}Q${W*.72} ${r1(y+.4+th)} ${W/2} ${r1(y+.6+th*1.3)}Q${W*.3} ${r1(y+2.5+a+th)} 0 ${r1(y+th)}Z" fill="${c[1]}"/>`}return pat(W,H,s,P.k==='zebra'?'rotate(70)':'')}
 case 'carbon':return pat(6,6,bg(c[0],6,6)+`<path d="M0 0h3v3H0zM3 3h3v3H3z" fill="${c[1]}"/><path d="M0 1.5h3M3 4.5h3" stroke="#fff" stroke-opacity=".07"/>`,'rotate(45)');
 case 'neon':{const z='M0 12L6 4L12 12L18 4L24 12',y='M0 2H24';return pat(24,16,bg(c[0],24,16)+`<path d="${z}" fill="none" stroke="${c[1]}" stroke-opacity=".35" stroke-width="2.8"/><path d="${z}" fill="none" stroke="${c[2]}" stroke-width=".8"/><path d="${y}" stroke="${c[1]}" stroke-opacity=".5" stroke-width=".6"/>`)}
 case 'engrave':return pat(16,16,bg(c[0],16,16)+`<path d="M0 8Q4 2 8 8T16 8M8 0Q12 4 8 8Q4 12 8 16" fill="none" stroke="${c[1]}" stroke-width=".7" stroke-opacity=".85"/><circle cx="8" cy="8" r="1.2" fill="${c[1]}"/><path d="M2 2l1 1M14 14l-1-1M14 2l-1 1M2 14l1-1" stroke="${c[1]}" stroke-width=".6"/>`);
 case 'graffiti':{let s=bg(c[0],48,30);for(let i=0;i<6;i++){const col=c[1+i%3],x=R()*48,y=R()*30,w=2+R()*2.4;s+=`<path d="M${r1(x)} ${r1(y)}c${r1(R()*12-6)} ${r1(R()*10-5)} ${r1(R()*16)} ${r1(R()*10-5)} ${r1(R()*20-4)} ${r1(R()*8-4)}" fill="none" stroke="${col}" stroke-width="${r1(w)}" stroke-linecap="round"/><path d="M${r1(x)} ${r1(y)}v${r1(3+R()*5)}" stroke="${col}" stroke-width=".8" stroke-linecap="round"/>`}return pat(48,30,s)}
 case 'flame':return pat(20,24,bg(c[0],20,24)+`<path d="M10 24C3 19 8 14 5 7C9 11 11 9 11 3C15 9 18 16 14 24Z" fill="${c[1]}"/><path d="M10.5 24C7.5 21 10 18 9 14C11 16 12 15 12.5 12C14 16 14.5 20 13 24Z" fill="${c[2]}"/>`);
 case 'circuit':return pat(20,20,bg(c[0],20,20)+`<g stroke="${c[1]}" stroke-width=".7" fill="none"><path d="M0 5H6L9 8V14H20M10 0V4L14 8H20M4 20V15L7 12"/></g><g fill="${c[1]}"><circle cx="9" cy="14" r="1"/><circle cx="14" cy="8" r="1"/><circle cx="4" cy="15" r="1"/></g>`);
 case 'argyle':return pat(16,20,bg(c[0],16,20)+`<path d="M8 0L16 10L8 20L0 10Z" fill="${c[1]}" fill-opacity=".55"/><path d="M0 0L16 20M16 0L0 20" stroke="${c[2]}" stroke-width=".5" stroke-opacity=".8"/>`);
 case 'aurora':{let st='';for(let i=0;i<14;i++)st+=`<circle cx="${r1(R()*120)}" cy="${r1(R()*48)}" r="${r1(.3+R()*.5)}"/>`;
  return pat(120,48,bg(c[0],120,48)+`<path d="M0 30C20 18 40 34 60 22S100 12 120 24V36C100 26 80 40 60 32S20 30 0 40Z" fill="${c[1]}" fill-opacity=".55"/><path d="M0 18C24 8 44 22 64 12S104 4 120 14V22C100 14 82 26 62 20S20 18 0 26Z" fill="${c[2]}" fill-opacity=".5"/><g fill="#fff" fill-opacity=".8">${st}</g>`)}
 case 'jewel':return pat(14,14,bg(c[0],14,14)+`<path d="M7 1L13 7L7 13L1 7Z" fill="${c[1]}"/><path d="M7 1V13M1 7H13" stroke="${c[0]}" stroke-opacity=".35" stroke-width=".5"/><circle cx="7" cy="7" r="2" fill="${c[2]}"/><circle cx="6.3" cy="6.3" r=".6" fill="#fff" fill-opacity=".8"/>`);
 case 'fireworks':{let s=bg(c[0],40,30);for(let i=0;i<3;i++){const col=c[1+i],x=6+R()*28,y=6+R()*18,L=4+R()*3;let d='';for(let a=0;a<10;a++){const t=a/10*Math.PI*2;d+=`M${r1(x+Math.cos(t)*1.6)} ${r1(y+Math.sin(t)*1.6)}L${r1(x+Math.cos(t)*L)} ${r1(y+Math.sin(t)*L)}`}s+=`<path d="${d}" stroke="${col}" stroke-width=".8" stroke-linecap="round"/><circle cx="${r1(x)}" cy="${r1(y)}" r=".9" fill="${col}"/>`}return pat(40,30,s)}
 case 'lightning':{const b='M14 0L8 18H14L6 34H12L4 48';return pat(30,48,bg(c[0],30,48)+`<path d="${b}" fill="none" stroke="${c[1]}" stroke-opacity=".45" stroke-width="3.2"/><path d="${b}" fill="none" stroke="${c[2]}" stroke-width=".9"/><path d="M27 4L23 16H27L21 28" fill="none" stroke="${c[1]}" stroke-width=".7" stroke-opacity=".7"/>`)}
 case 'crown':return `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[1]}" stop-opacity="0"/><stop offset=".5" stop-color="${c[2]}" stop-opacity=".55"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0"/></linearGradient>`
  +pat(18,18,bg(c[0],18,18)+`<path d="M0 18L18 0" stroke="${c[1]}" stroke-opacity=".35" stroke-width=".6"/><path d="M5 12L4 6L7 8.5L9 5L11 8.5L14 6L13 12Z" fill="${c[1]}"/><rect x="5" y="12.6" width="8" height="1.4" fill="${c[1]}"/><rect width="18" height="18" fill="url(#${id}g)"/>`);
 case 'galaxy':{let st='';for(let i=0;i<22;i++)st+=`<circle cx="${r1(R()*60)}" cy="${r1(R()*48)}" r="${r1(.25+R()*.6)}"/>`;
  return `<radialGradient id="${id}a"><stop offset="0" stop-color="${c[1]}" stop-opacity=".9"/><stop offset="1" stop-color="${c[1]}" stop-opacity="0"/></radialGradient><radialGradient id="${id}b"><stop offset="0" stop-color="${c[2]}" stop-opacity=".8"/><stop offset="1" stop-color="${c[2]}" stop-opacity="0"/></radialGradient>`
   +pat(60,48,bg(c[0],60,48)+`<ellipse cx="18" cy="20" rx="20" ry="12" fill="url(#${id}a)"/><ellipse cx="44" cy="32" rx="18" ry="11" fill="url(#${id}b)"/><g fill="${c[3]}">${st}</g>`)}
 case 'prism':return `<linearGradient id="${id}" x1="0" y1="0" x2=".55" y2="1" spreadMethod="reflect">${c.map((x,i)=>`<stop offset="${(i/(c.length-1)).toFixed(2)}" stop-color="${x}"/>`).join('')}</linearGradient>`;
 default:return `<linearGradient id="${id}"><stop stop-color="${c[0]}"/></linearGradient>`}}
// Eigen silhouetten (viewBox 120×48, loop naar rechts) voor als gunart.js er (nog) niet is
const SK_SHAPE={
 knife:{b:'M10 21Q8 21 8 23V28Q8 30 10 30H56V21ZM56 20H100L114 24.5L104 28.5H56Z',d:'<path d="M14 24H50V27H14Z" fill="#000" fill-opacity=".35"/><circle cx="56" cy="25" r="1.6" fill="#0b0c0e"/><path d="M60 26.5H102" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>'},
 pistol:{b:'M22 13Q22 12 23 12H97Q98 12 98 13V23H95V28.5H57L50 45Q49.5 46 48 46H34Q32 46 32.5 44L37 28L24 23.5H22Z',d:'<path d="M57 28.5Q58 37 65 37H68Q70 37 70 34V28.5M62.5 28.5Q64 32 62 34" fill="none" stroke="#0b0c0e" stroke-width="1.4"/><path d="M22 23H95M27 14.5V21M29.5 14.5V21M32 14.5V21" stroke="#0b0c0e" stroke-opacity=".55" stroke-width=".8"/><rect x="62" y="13.6" width="14" height="3" fill="#000" fill-opacity=".35"/>'},
 smg:{b:'M24 14Q24 13 25 13H95Q96 13 96 14V16.5H108V21H96V24Q96 25 95 25H65L64.5 45Q64.5 46 63.5 46H54Q53 46 53 45L52.5 25H25Q24 25 24 24Z',d:'<path d="M24 16H10V22H24" fill="none" stroke="#0b0c0e" stroke-width="2.2"/><path d="M65 25Q66 33 72 33H74Q76 33 76 30V25" fill="none" stroke="#0b0c0e" stroke-width="1.4"/><circle cx="40" cy="11.6" r="1.6" fill="#0b0c0e"/><path d="M55 30H62M55 34H62M55 38H62" stroke="#0b0c0e" stroke-opacity=".5" stroke-width=".8"/>'},
 rifle:{b:'M3 21Q3 19.2 4 19L32 15.5V13.5H72V12.5H92V15H96V17H116V20H96V23H72V25H66Q69 33 75 40.5Q75.5 42 74 42.5L66.5 45Q65 45.5 64 44.5Q57 37 54 25H49L46.5 38Q46 39.5 44.5 39.5H39.5Q38 39.5 38.5 38L42 25H32L6 31Q3 31.5 3 28Z',d:'<path d="M32 15.5V25M72 13.5V25" stroke="#0b0c0e" stroke-opacity=".6" stroke-width=".9"/><path d="M49.5 25Q50 30 53 30.5" fill="none" stroke="#0b0c0e" stroke-width="1.3"/><path d="M112.5 17V14M60 13.5V11.5" stroke="#0b0c0e" stroke-width="1.4"/>'},
 sniper:{b:'M2 22Q2 19 4 19L14 17.5H38V16H82V18.5H118V21.5H82V25H54L50 37Q49.5 38.5 48 38.5H43Q41.5 38.5 42 37L45 25H36L12 33Q8 34.5 5 33Q2 31.5 2 28ZM44 6.5H74Q76.5 6.5 76.5 9.25Q76.5 12 74 12H44Q41.5 12 41.5 9.25Q41.5 6.5 44 6.5Z',d:'<path d="M50 12V16M68 12V16" stroke="#0b0c0e" stroke-width="2.4"/><path d="M58 16L61 12.6" stroke="#0b0c0e" stroke-width="1.3"/><circle cx="61.4" cy="12.2" r="1.3" fill="#0b0c0e"/><path d="M100 21.5L94 40M101 21.5L106 40" stroke="#0b0c0e" stroke-width="1.6"/><path d="M54 25Q55 31 60 31H62Q63.5 31 63.5 29V25" fill="none" stroke="#0b0c0e" stroke-width="1.3"/><ellipse cx="76.5" cy="9.25" rx="1" ry="2.4" fill="#9fd8ff" fill-opacity=".7"/>'},
 mg:{b:'M2 24Q2 18 6 17.5L24 15V12H78V14H112V16H118V19H112V21H78V27H75V39Q75 40 74 40H57Q56 40 56 39V27H48L45.5 40Q45 41.5 43.5 41.5H39Q37.5 41.5 38 40L41 27H24L8 31Q2 32 2 27Z',d:'<path d="M44 12Q44 6 50 6H58Q62 6 62 12" fill="none" stroke="#0b0c0e" stroke-width="2"/><g fill="#0b0c0e">'+[84,90,96,102,108].map(x=>`<circle cx="${x}" cy="17.5" r="1.3"/>`).join('')+'</g><path d="M104 21L98 44M105 21L112 44" stroke="#0b0c0e" stroke-width="1.7"/><path d="M58 31H73M58 35H73" stroke="#0b0c0e" stroke-opacity=".5" stroke-width=".8"/><path d="M78 12V27" stroke="#0b0c0e" stroke-opacity=".6" stroke-width=".9"/>'}};
function skShapeOf(w){const M={mes:'knife',pistool:'pistol',uzi:'smg',ak:'rifle',sniper:'sniper',mg:'mg'};if(M[w])return SK_SHAPE[M[w]];const g=skGun(w);
 if(g&&g.ic==='knife')return SK_SHAPE.knife;const p=g?g.p||0:0;return p<20000?SK_SHAPE.pistol:p<60000?SK_SHAPE.smg:p<250000?SK_SHAPE.rifle:p<900000?SK_SHAPE.sniper:SK_SHAPE.mg}
// skin tekenen: patroon over het wapen. Met gunSvg (gunart.js) als die er is, anders het eigen silhouet.
function skinSvg(p,w,uid,cls){const P=SKP[p]||SKP.grgr,id='sk'+uid,defs=skPat(P,id),fill=`url(#${id})`;
 if(typeof gunSvg==='function'){try{let s=gunSvg(w,fill,`<defs>${defs}</defs>`);if(typeof s==='string'&&s.includes('<svg')){if(!s.includes(`id="${id}"`))s=s.replace(/<svg([^>]*)>/,`<svg$1><defs>${defs}</defs>`);const o=s.match(/<svg[^>]*>/)[0];let o2=/\sclass="/.test(o)?o.replace(/\sclass="/,` class="${cls?cls+' ':''}`):o.replace('<svg',`<svg class="${cls||''}"`);if(!/aria-hidden/.test(o2))o2=o2.replace('<svg','<svg aria-hidden="true"');return s.replace(o,o2)}}catch(e){}}
 const sh=skShapeOf(w);
 return `<svg class="${cls||''}" viewBox="0 0 120 48" aria-hidden="true"><defs>${defs}<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".38" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient></defs>
  <path d="${sh.b}" fill="${fill}"/><path d="${sh.b}" fill="url(#${id}s)"/>${sh.d}<path d="${sh.b}" fill="none" stroke="#0b0c0e" stroke-opacity=".85" stroke-width="1.1" stroke-linejoin="round"/></svg>`}
// de kist zelf (320×220, past in de casinokaarten)
function wkCrateSvg(id,uid){const C=wkCase(id),c=C.col,u='wc'+uid,gek=id==='gek',st=id==='straat',w=st?'#6b4a26':id==='koffer'?'#2d3a2a':id==='pantser'?'#2a3444':'#16130c',w2=skMix(w,.35);
 const label={straat:'STRAAT',koffer:'KOFFERBAK',pantser:'PANTSER',gek:'GEK'}[id];
 return `<svg viewBox="0 0 320 220" aria-hidden="true"><defs><radialGradient id="${u}g" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${u}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skMix(w,-0)}"/><stop offset="1" stop-color="${w2}"/></linearGradient><linearGradient id="${u}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${gek?'#ffe28a':'#c9ced6'}"/><stop offset="1" stop-color="${gek?'#a8740c':'#6a717c'}"/></linearGradient></defs>
  <ellipse cx="160" cy="120" rx="150" ry="100" fill="url(#${u}g)"/>
  <ellipse cx="160" cy="196" rx="112" ry="10" fill="#000" fill-opacity=".45"/>
  <rect x="58" y="88" width="204" height="104" rx="8" fill="url(#${u}b)" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
  ${st?'<path d="M60 122H260M60 158H260" stroke="#000" stroke-opacity=".35" stroke-width="2"/>':`<path d="M70 100H250V180H70Z" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="2" stroke-dasharray="${gek?'0':'6 5'}"/>`}
  <rect x="50" y="66" width="220" height="30" rx="7" fill="${w2}" stroke="#000" stroke-opacity=".6" stroke-width="2"/>
  <path d="M50 81H270" stroke="${c}" stroke-opacity=".75" stroke-width="2.5"/>
  <g fill="url(#${u}m)" stroke="#000" stroke-opacity=".5"><path d="M50 66h22v14H58v16h-8Z"/><path d="M270 66h-22v14h14v16h8Z"/><path d="M58 192v-22h14v14h14v8Z"/><path d="M262 192v-22h-14v14h-14v8Z"/>
   <rect x="142" y="76" width="36" height="42" rx="5"/></g>
  <circle cx="160" cy="94" r="5" fill="#111"/><path d="M158 96h4l1.5 12h-7Z" fill="#111"/>
  <text x="160" y="153" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${label.length>7?20:30}" letter-spacing="3" fill="${c}" fill-opacity=".9">${label}</text>
  ${gek?'<g fill="#fff3c4">'+[[86,52,3],[246,46,2.4],[272,120,2],[44,132,2.2],[214,30,1.6]].map(([x,y,r])=>`<path d="M${x} ${y-r*3}L${x+r} ${y-r}L${x+r*3} ${y}L${x+r} ${y+r}L${x} ${y+r*3}L${x-r} ${y+r}L${x-r*3} ${y}L${x-r} ${y-r}Z"/>`).join('')+'</g>':''}
  ${SK_R.slice(C.fl||0).map((R,i,a)=>`<circle cx="${160-(a.length-1)*7+i*14}" cy="174" r="4" fill="${R.c}" stroke="#000" stroke-opacity=".5"/>`).join('')}</svg>`}
// wapenrek voor de kluis-kaart in de lobby
function skRackSvg(uid){const L=skInvList().slice(0,3),demo=[['goud','ak'],['delf','pistool'],['oudn','sniper']],items=L.length?L.map(x=>[x.p,x.w]):demo;
 return `<svg viewBox="0 0 320 220" aria-hidden="true"><defs><radialGradient id="rk${uid}" cx=".55" cy=".5" r=".6"><stop offset="0" stop-color="#ffb020" stop-opacity=".35"/><stop offset="1" stop-color="#ffb020" stop-opacity="0"/></radialGradient></defs><rect width="320" height="220" fill="url(#rk${uid})"/>
  <path d="M40 60H300M40 120H300M40 180H300" stroke="#3a3f47" stroke-width="3"/>${items.map(([p,w],i)=>skinSvg(p,w,'rk'+uid+i).replace('<svg ',`<svg x="${60+(i%2)*14}" y="${12+i*60}" width="230" height="92" `)).join('')}</svg>`}

// ---------- Kluis (inventaris) ----------
const skInit=()=>{if(!Array.isArray(S.skins))S.skins=[];S.skins=S.skins.filter(k=>typeof k==='string'&&SKP[k.split(':')[0]]);if(!S.skinOn||typeof S.skinOn!=='object'||Array.isArray(S.skinOn))S.skinOn={}};
const skHas=()=>Array.isArray(S.skins)&&S.skins.length>0;
const skOk=()=>typeof isVip==='function'&&isVip();
// mag je de kluis zien? VIP/HR altijd; anderen alleen als ze skins hebben
const skInvOk=()=>skOk()||skHas();
function skInvList(){const m=new Map();(S.skins||[]).forEach((k,i)=>{const e=m.get(k);if(e){e.n++;e.i=i}else{const [p,w]=k.split(':');m.set(k,{k,p,w,n:1,i,r:skRar(k),v:skVal(k)})}});return [...m.values()]}
const skWorn=(p,w)=>S.skinOn&&S.skinOn[w]===p&&S.skins.includes(p+':'+w);
const skTotal=()=>(S.skins||[]).reduce((a,k)=>a+skVal(k),0);
window.skU=window.skU||{r:-1,sort:'new'};
const SK_SORT=[['new','Nieuwste'],['val','Duurste'],['cheap','Goedkoopste'],['rar','Zeldzaamheid'],['gun','Wapen']];
function skCard(x,where){const R=SK_R[x.r],own=!!(S.gear&&S.gear[x.w]),on=skWorn(x.p,x.w),P=SKP[x.p];
 return `<article class="sk-card r${x.r}${on?' on':''}" style="--rc:${R.c}"><div class="sk-art${x.r>=4?' sk-shine':''}">${skinSvg(x.p,x.w,'i'+where+x.k.replace(':','_'))}</div>
  <div class="sk-info"><span class="sk-rar">${R.n}</span><b>${P.n}</b><small>${esc(skGunName(x.w))}${x.n>1?` · <em>×${x.n}</em>`:''}</small></div>
  <div class="sk-val">${fmt(x.v)}</div>
  <div class="sk-btns">${on?`<button class="btn ghost sm" onclick="act.skWear('${x.w}','')">Afdoen</button>`:own?`<button class="btn ghost sm" onclick="act.skWear('${x.w}','${x.p}')">Gebruiken</button>`:`<button class="btn ghost sm" disabled title="Koop eerst een ${esc(skGunName(x.w))}">Niet in bezit</button>`}
   <button class="btn sm sk-sell" onclick="act.skSell('${x.k}')">Verkoop</button></div>${on?'<i class="sk-on">In gebruik</i>':''}</article>`}
function skInvView(where){skInit();if(!skInvOk())return wkDenyView();
 const all=skInvList(),U=skU,cnt=SK_R.map((_,r)=>all.filter(x=>x.r===r).reduce((a,x)=>a+x.n,0));if(U.r>=0&&!cnt[U.r])U.r=-1;
 let L=U.r>=0?all.filter(x=>x.r===U.r):all.slice();
 const srt={new:(a,b)=>b.i-a.i,val:(a,b)=>b.v-a.v,cheap:(a,b)=>a.v-b.v,rar:(a,b)=>b.r-a.r||b.v-a.v,gun:(a,b)=>skGunName(a.w).localeCompare(skGunName(b.w))||b.v-a.v}[U.sort]||((a,b)=>b.i-a.i);L.sort(srt);
 const bulk=U.r>=0?skBulkFix(U.r):null;
 return `<div class="sk">
  <div class="sk-head"><div>${where==='shop'?'':'<span class="label">Wapenkluis</span>'}<h2>${S.skins.length} skin${S.skins.length===1?'':'s'}</h2></div><div class="sk-tot"><span class="label">Waarde</span><b>${fmt(skTotal())}</b></div>
   ${skOk()&&where!=='cas'?`<a class="btn ghost sm" href="#kisten">Kisten openen</a>`:skOk()?`<button class="btn ghost sm" onclick="casinoGo('kist')">Kisten openen</button>`:''}</div>
  ${all.length?`<div class="sk-bar"><div class="sk-chips" role="group" aria-label="Zeldzaamheid"><button class="${U.r<0?'on':''}" onclick="skU.r=-1;render()" aria-pressed="${U.r<0}">Alles <em>${S.skins.length}</em></button>${SK_R.map((R,r)=>cnt[r]?`<button class="${U.r===r?'on':''}" style="--rc:${R.c}" onclick="skU.r=${r};render()" aria-pressed="${U.r===r}"><i></i>${R.n} <em>${cnt[r]}</em></button>`:'').join('')}</div>
   <label class="sk-sort"><span class="label">Sorteer</span><select onchange="skU.sort=this.value;render()" aria-label="Sorteren">${SK_SORT.map(([k,n])=>`<option value="${k}" ${U.sort===k?'selected':''}>${n}</option>`).join('')}</select></label></div>
   ${bulk&&bulk.n?`<button class="btn sk-bulk" style="--rc:${SK_R[U.r].c}" onclick="act.skSellAll(${U.r})">Alle ${SK_R[U.r].n.toLowerCase()} verkopen <b>${bulk.n}× · ${fmt(bulk.v)}</b></button>`:''}
   <div class="sk-grid">${L.map(x=>skCard(x,where==='cas'?'c':'s')).join('')}</div>`
  :`<div class="sk-empty card">${skRackSvg('e')}<p>Nog leeg.${skOk()?' Open een kist in het casino.':''}</p>${skOk()?(where==='cas'?`<button class="btn gold" onclick="casinoGo('kist')">Naar de kisten</button>`:`<a class="btn gold" href="#kisten">Naar de kisten</a>`):''}</div>`}
 </div>`}
// alles van één zeldzaamheid verkopen, behalve één exemplaar van wat je op een wapen hebt
const skBulkFix=r=>{const worn=new Set(Object.entries(S.skinOn||{}).map(([w,p])=>p+':'+w)),seen=new Set();let n=0,v=0;const left=[];
 (S.skins||[]).forEach(k=>{if(skRar(k)!==r){left.push(k);return}if(worn.has(k)&&!seen.has(k)){seen.add(k);left.push(k);return}n++;v+=skVal(k)});return {n,v,left}};
// Wapenwinkel: geskinde wapens tonen (hook in wapens.js) en profiel (hook in profiel.js)
function skGearIc(g){if(!g||!S.skinOn||!S.gear||!S.gear[g.id])return '';const p=S.skinOn[g.id];if(!p||!skWorn(p,g.id))return '';
 return `<div class="gr-ic sk-gic" title="Skin: ${SKP[p].n}">${skinSvg(p,g.id,'g'+g.id)}</div>`}
function skProfHtml(){if(!skHas())return '';const worn=Object.entries(S.skinOn||{}).filter(([w,p])=>skWorn(p,w)&&S.gear&&S.gear[w]);
 return `<section class="card sk-prof"><div class="sk-prof-h"><h3>Wapenkluis</h3><span>${S.skins.length} skins · ${fmt(skTotal())}</span><a class="btn ghost sm" href="#wapenkluis">Open</a></div>
  ${worn.length?`<div class="sk-prof-g">${worn.map(([w,p])=>`<div class="sk-prof-i" style="--rc:${SK_R[SKP[p].r].c}">${skinSvg(p,w,'pf'+w)}<span><b>${SKP[p].n}</b><small>${esc(skGunName(w))}</small></span></div>`).join('')}</div>`:''}</section>`}

// ---------- Kisten openen ----------
window.wk=window.wk||{c:'straat',spin:null,res:null,strip:null};
const wkReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const wkDenied=k=>(k||casinoTab)==='kist'?!skOk():(k||casinoTab)==='skins'?!skInvOk():false;
function wkDenyView(){return `<section class="wk-deny card"><span class="label">Privé</span><h2>Deze deur blijft dicht</h2><p>Alleen op uitnodiging.</p><button class="btn ghost" onclick="casinoGo('')">Terug naar het casino</button></section>`}
function wkTabs(){return skOk()?[['kist','Wapenkisten','Kisten'],['skins','Wapenkluis','Kluis']]:[]}
function wkTile(k,i,win){const r=skRar(k),[p,w]=k.split(':');return `<div class="wk-t r${r}${win?' win':''}" style="--rc:${SK_R[r].c}"><div class="wk-ti">${skinSvg(p,w,'t'+i)}<small>${SKP[p].n}</small></div></div>`}
// stilstaande strip: een greep uit alle zeldzaamheden, met k (de uitslag) in het midden
function wkPreview(k){const G=skGuns(),items=[];for(let i=0;i<15;i++){const r=[0,1,0,2,0,1,3,0,1,2,4,0,1,5,0][i],L=SK_R[r].pats;items.push(L[(i*7)%L.length]+':'+((G[i%Math.max(1,G.length)]||{id:'mes'}).id))}if(k)items[7]=k;return {items,idx:7,jit:0}}
function wkStripHtml(){const s=wk.spin||wk.strip;let items,pos;
 if(s){items=s.items;pos=wk.spin?0:s.idx+.5+s.jit}else{items=wkPreview().items;pos=7.5}
 return `<div class="wk-win" aria-hidden="true"><div class="wk-strip" id="wkStrip" style="transform:translate3d(calc(var(--wk-step) * -${pos.toFixed(3)}),0,0)">${items.map((k,i)=>wkTile(k,i,!wk.spin&&s&&i===s.idx)).join('')}</div><i class="wk-mark"></i></div>`}
function wkResHtml(){const R=wk.res;if(!R||wk.spin)return '';const r=skRar(R.k),[p,w]=R.k.split(':'),v=skVal(R.k),still=(S.skins||[]).includes(R.k)&&!R.sold,C=wkCase(R.c);
 return `<div class="wk-res r${r}" style="--rc:${SK_R[r].c}"><div class="wk-res-art${r>=4?' sk-shine':''}">${skinSvg(p,w,'res')}</div>
  <div class="wk-res-t"><span class="sk-rar">${SK_R[r].n}</span><b>${SKP[p].n}</b><small>${esc(skGunName(w))} · ${fmt(v)}</small></div>
  <div class="wk-res-b">${still?`<button class="btn" onclick="act.skSell('${R.k}',1)">Verkoop · ${fmt(v)}</button><button class="btn ghost" onclick="wk.res=null;render()">Houden</button>`:`<span class="wk-sold">${R.sold?'Verkocht':'In je kluis'}</span>`}</div></div>`}
function wkView(){if(wkDenied())return wkDenyView();if(casinoTab==='skins')return skInvView('cas');skInit();
 const C=wkCase(wk.c),t=wkTier(),P=wkOdds(C.id,t),busy=!!wk.spin,can=casCash()>=C.p&&!inJail();
 return `<div class="wk" style="--kc:${C.col}">
  <div class="wk-cases" role="group" aria-label="Kies een kist">${WK_CASES.map(K=>{const pu=wkOdds(K.id,t)[5];return `<button class="wk-case${K.id===C.id?' on':''}" style="--kc:${K.col}" onclick="wkPick('${K.id}')" ${busy?'disabled':''} aria-pressed="${K.id===C.id}">
   <span class="wk-case-art">${wkCrateSvg(K.id,'p'+K.id)}</span><span class="wk-case-t"><b>${K.n}</b><span>${fmt(K.p)}</span><small>Ultra ${wkOneIn(pu)}</small></span></button>`}).join('')}</div>
  <section class="wk-stage card">
   <div class="wk-stage-h"><div><span class="label">${C.n}</span><b>${C.d}</b></div>${vipTag()}</div>
   ${wkStripHtml()}
   <div id="wkRes">${wkResHtml()}</div>
   <button class="btn gold xl wk-go" onclick="act.wkOpen()" ${busy||!can?'disabled':''}>${busy?'De kist gaat open…':inJail()?'Je zit vast':casCash()<C.p?'Te weinig geld':'Open · '+fmt(C.p)}</button>
  </section>
  <section class="wk-side">
   <div class="wk-odds card"><div class="wk-odds-h"><span class="label">Kansen</span><small>Gemiddeld ${Math.round(WK_RTP[t]*100)}% terug</small></div>
    ${SK_R.map((R,r)=>P[r]>0?`<div class="wk-o" style="--rc:${R.c}"><i></i><span>${R.n}</span><b>${wkPct(P[r])}</b><small>${P[r]<.02?wkOneIn(P[r]):''}</small><em>${skRange(r)}</em></div>`:'').join('')}</div>
   <button class="wk-kluis card" onclick="casinoGo('skins')"><span class="label">Wapenkluis</span><b>${(S.skins||[]).length} skin${(S.skins||[]).length===1?'':'s'}</b><span>${fmt(skTotal())}</span></button>
   ${typeof casSesHtml==='function'?casSesHtml('kist','wk-ses'):''}
  </section></div>`}
function skRange(r){const G=skGuns(),L=SK_R[r].pats;let a=Infinity,b=0;L.forEach(p=>G.forEach(g=>{const v=skVal(p+':'+g.id);a=Math.min(a,v);b=Math.max(b,v)}));return a===Infinity?'':fmtS(a)+' – '+fmtS(b)}
function wkPick(id){if(wk.spin)return;wk.c=id;wk.res=null;wk.strip=null;try{SFX.chip()}catch(e){}render()}
// de strip: positie hangt alleen af van de tijd, dus hertekenen tijdens het draaien kan geen kwaad
const wkEase=p=>1-Math.pow(1-p,4);
function wkFrame(){const s=wk.spin;if(!s)return;const p=Math.min(1,(performance.now()-s.t0)/s.dur),x=(s.idx+.5+s.jit)*wkEase(p),el=document.getElementById('wkStrip');
 if(el){el.style.transform=`translate3d(calc(var(--wk-step) * -${x.toFixed(4)}),0,0)`;const cell=Math.floor(x);if(cell!==s.cell){s.cell=cell;const t=performance.now();if(t-(s.tk||0)>40){s.tk=t;try{SFX.tick()}catch(e){}}}}
 if(p<1)requestAnimationFrame(wkFrame);else wkDone()}
function wkDone(){const s=wk.spin;if(!s)return;wk.spin=null;wk.strip={items:s.items,idx:s.idx,jit:s.jit};wk.res={k:s.k,c:s.c};if(typeof casSesFlush==='function')casSesFlush('kist');
 const r=skRar(s.k);try{r>=4?SFX.big():r>=2?SFX.win(r*2-2):r===1?SFX.win(1):SFX.chip()}catch(e){}
 if(r>=3)toast(`${SK_R[r].n}: ${SKP[s.k.split(':')[0]].n} op je ${skGunName(s.k.split(':')[1])} (${fmt(skVal(s.k))})`,'lvl');
 if(page==='casino'&&casinoTab==='kist')render();else renderTop()}
Object.assign(act,{
 wkOpen(){if(wk.spin)return;if(!skOk()){toast('Deze deur blijft dicht','bad');return}if(inJail())return;const C=wkCase(wk.c);
  if(casCash()<C.p){toast(casShort(),'bad');return}skInit();
  // uitslag meteen vastleggen: geld eraf, skin in de kluis, ronde in het casino
  const k=wkDraw(C.id,wkTier()),v=skVal(k),r=skRar(k),dur=wkReduce()?0:5600;
  S.cash-=C.p;S.skins.push(k);S.wkLast={c:C.id,k,t:now()};if(v>=C.p)S.stats.won+=v-C.p;else S.stats.lost+=C.p-v;
  casinoRound(C.p,v,'kist',dur>0);log(`${C.n}: ${SK_R[r].n} ${SKP[k.split(':')[0]].n} (${skGunName(k.split(':')[1])}, ${fmt(v)})`,r>=3?'ok':'info',dur?dur+300:0);save();
  wk.res=null;
  if(!dur){wk.spin=Object.assign(wkPreview(k),{k,c:C.id,t0:0,dur:1});wkDone();return}
  // vulling: willekeurig volgens dezelfde kansen (alleen voor de show)
  const N=58,idx=50,items=Array.from({length:N},(_,i)=>i===idx?k:wkDraw(C.id,wkTier(),Math.random));
  wk.spin={k,c:C.id,items,idx,jit:(Math.random()-.5)*.76,t0:performance.now(),dur,cell:-1};try{SFX.click()}catch(e){}render();requestAnimationFrame(wkFrame)},
 skWear(w,p){skInit();if(p&&!(S.gear&&S.gear[w])){toast('Koop eerst een '+skGunName(w),'bad');return}if(p&&!S.skins.includes(p+':'+w))return;
  if(p){S.skinOn[w]=p;toast(SKP[p].n+' op je '+skGunName(w),'ok')}else delete S.skinOn[w];try{SFX.chip()}catch(e){}save();render()},
 skSell(k,fromRes,ok){skInit();const i=S.skins.lastIndexOf(k);if(i<0)return;const v=skVal(k),[p,w]=k.split(':');
  if(v>=1e6&&!ok){showModal('Verkopen?',`${SKP[p].n} op je ${skGunName(w)} voor ${fmt(v)}.`,[{l:'Verkopen',c:'gold',f:()=>{closeModal();act.skSell(k,fromRes,1)}},{l:'Houden',c:'ghost',f:closeModal}]);return}
  S.skins.splice(i,1);if(S.skinOn[w]===p&&!S.skins.includes(k))delete S.skinOn[w];S.cash+=v;
  if(wk.res&&wk.res.k===k&&fromRes)wk.res.sold=1;log(`Skin verkocht: ${SKP[p].n} (${skGunName(w)}) voor ${fmt(v)}`,'ok');toast('Verkocht: +'+fmt(v),'ok');try{SFX.chip()}catch(e){}save();if(typeof pushSoon==='function')pushSoon();render()},
 skSellAll(r,ok){skInit();const B=skBulkFix(r);if(!B.n)return;
  if(!ok){showModal('Alles verkopen?',`${B.n}× ${SK_R[r].n.toLowerCase()} voor ${fmt(B.v)}. Wat je op een wapen hebt, houd je.`,[{l:'Verkopen',c:'gold',f:()=>{closeModal();act.skSellAll(r,1)}},{l:'Annuleren',c:'ghost',f:closeModal}]);return}
  S.skins=B.left;S.cash+=B.v;log(`Wapenkluis: ${B.n}× ${SK_R[r].n.toLowerCase()} verkocht voor ${fmt(B.v)}`,'ok');toast('Verkocht: +'+fmt(B.v),'ok');try{SFX.chip()}catch(e){}save();if(typeof pushSoon==='function')pushSoon();render()}});

// ---------- Lobby, zoeken, routes ----------
function wkLobbyHtml(){if(!skOk())return '';const t=wkTier(),n=(S.skins||[]).length;
 const card=(id,kind,name,sub,tags,art,col)=>`<button class="cl-card wk-lc" style="--c:${col}" onclick="casinoGo('${id}')" aria-label="${name}"><span class="cl-art" aria-hidden="true">${art}</span>
  <span class="cl-txt"><span class="cl-k">${kind}</span><b class="cl-n">${name}</b><span class="cl-s">${sub}</span><span class="cl-f"><span class="cl-tags">${tags.map(x=>`<em>${x}</em>`).join('')}</span><span class="cl-go">Open${CAS_ICO_BACK.replace('M15 6l-6 6 6 6','M9 6l6 6-6 6')}</span></span></span></button>`;
 return `<section class="cl-sec wk-lobby"><div class="cl-sh"><h2>Privékamer</h2><span>Alleen voor VIP en High roller</span></div>
  <div class="cl-grid g2">${card('kist','4 kisten','Wapenkisten','Open een kist, pak een wapenskin. Van Gewoon tot Ultra legendarisch.',['Vanaf €5.000','RTP '+Math.round(WK_RTP[t]*100)+'%'],wkCrateSvg('gek','lb'),'#ffb020')}
  ${card('skins','Je skins','Wapenkluis',n?`${n} skin${n===1?'':'s'} · ${fmt(skTotal())}. Verkopen of op je wapen zetten.`:'Nog leeg. Wat je uit een kist haalt, komt hier.',[n+' skin'+(n===1?'':'s')],skRackSvg('lb'),'#b46bff')}</div></section>`}
if(typeof CAS_NAMES!=='undefined'){CAS_NAMES.kist='Wapenkisten';CAS_NAMES.skins='Wapenkluis'}
if(typeof MS_FIND!=='undefined'){MS_FIND.push(['Wapenkisten','Kisten met wapenskins','casino:kist','kist kisten case cases skin skins wapenskin',()=>skOk()],
 ['Wapenkluis','Je wapenskins','casino:skins','skins skin inventaris inventory kluis wapenskin verkopen',()=>skOk()],
 ['Wapenkluis','Je wapenskins','shop','skins skin inventaris inventory kluis wapenskin verkopen',()=>!skOk()&&skHas()])}
// Wapens-pagina: banner naar de kluis (alleen als je hem mag zien) en de kluis zelf
if(typeof V!=='undefined'&&V.shop){const _vs=V.shop;V.shop=()=>{if(window.gsel&&gsel.shop==='kluis'){if(!skInvOk())gsel.shop=null;else return `<div class="vb-bar"><button class="vb-back" onclick="gsel.shop=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Winkelstraat</span></button><h2>Wapenkluis</h2></div>${skInvView('shop')}`}
 const h=_vs();if(window.gsel&&gsel.shop||!skInvOk())return h;const n=(S.skins||[]).length;
 return h+`<button class="sk-banner" onclick="gsel.shop='kluis';render();window.scrollTo(0,0)"><span class="sk-banner-art">${skRackSvg('sb')}</span><span><span class="label">Wapenkluis</span><b>${n} skin${n===1?'':'s'}</b><small>${fmt(skTotal())}</small></span><em>Open ›</em></button>`}}
// #kisten en #wapenkluis: direct naar de juiste plek (normale spelers: nette weigering)
function skRoute(){const h=(location.hash||'').slice(1);if(h!=='kisten'&&h!=='wapenkluis')return false;
 if(h==='kisten'||skOk()){page='casino';casinoTab=h==='kisten'?'kist':'skins';try{history.replaceState(null,'','#casino')}catch(e){}}
 else{page='shop';if(window.gsel)gsel.shop='kluis';try{history.replaceState(null,'','#shop')}catch(e){}}
 return true}
window.addEventListener('hashchange',()=>{if(skRoute()){render();window.scrollTo(0,0)}});
skInit();skRoute();
// na verversen midden in het openen: de uitslag staat al in je kluis, laat hem meteen zien
if(S.wkLast&&now()-(S.wkLast.t||0)<15*60000&&SKP[(S.wkLast.k||'').split(':')[0]]){wk.c=wkCase(S.wkLast.c).id;wk.res={k:S.wkLast.k,c:wk.c};wk.strip=wkPreview(S.wkLast.k)}
