// Carjack-spellen: per aanpak een kort speelmoment (zes aanpakken, zes spellen). Dit bestand bevat
//  1. de kans G (hoe groot de kans is dat een gemiddelde speler het spel haalt) per aanpak, doelwit en speler,
//  2. het pure model van de spellen (jgNew / jgStep / jgPress), ook bruikbaar in een simulatie zonder browser,
//  3. de tekening (SVG) en bediening (jgPlay), touch en toetsenbord.
// Net als bij de klus-spellen (crimegames.js) wordt de ruimte per poging uit G teruggerekend met een model van een
// gemiddelde speler (JG_HUM): drukfout ~ N(0; 0,07 s), reactietijd N(0,55; 0,12) s, kiezen N(1,15; 0,32) s met 4% vergissingen.
// Zo betekent "kans 45%" op de kaart ook echt: 45% van de pogingen van een gemiddelde speler lukt. Gewonnen = gelukt.
//
// KANS G per doelwit:
//   P (vakmanschap 0..1) = 0,45 × steelervaring + 0,15 × rang + 0,20 × training (2 skills per aanpak) + 0,20 × X
//     X = bij wapen-aanpakken 60% vuurkracht (vk/12) + 40% routine (√(carjacks/60)), anders alleen routine
//   G = 0,30 + 0,64 × P + zwaarte (je level t.o.v. het aanbevolen level van de auto: −6,5% per level eronder,
//       +2,5% per level erboven, max +4) − 5% per beveiligingsniveau + aanpak-correctie, tussen 6% en 97%.
//   Groentje met een mes bij een gewone auto: ±30%. Meesterdief met training en zwaar wapen: 80–95%.
const JG_HUM={sig:.07,rt:.55,rts:.12,cmu:1.15,cs:.32,ce:.04};
const jgErfinv=x=>{const a=.147,l=Math.log(1-x*x),t=2/(Math.PI*a)+l/2;return Math.sign(x)*Math.sqrt(Math.sqrt(t*t-l/a)-t)};
const jgNinv=p=>Math.SQRT2*jgErfinv(2*Math.max(1e-6,Math.min(1-1e-6,p))-1);
function jgNB(p,k,m){let s=0,c=1;for(let j=0;j<=m;j++){if(j>0)c=c*(k-1+j)/j;s+=c*Math.pow(p,k)*Math.pow(1-p,j)}return s}
function jgSolve(G,k,m){let lo=.01,hi=.9999;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(jgNB(mid,k,m)<G)lo=mid;else hi=mid}return (lo+hi)/2}
const jgHalf=p=>JG_HUM.sig*Math.SQRT2*jgErfinv(Math.min(.9999,p));
const jgReact=p=>JG_HUM.rt+JG_HUM.rts*jgNinv(p);
const jgChoiceT=p=>JG_HUM.cmu+JG_HUM.cs*jgNinv(Math.min(.999,p/(1-JG_HUM.ce)));
const jgTri=x=>{x=((x%2)+2)%2;return x<1?x:2-x};
const JG_REQ={1:1,2:2,3:4,4:6,5:8,6:9}; // gelijk aan CXP_REQ (carheist.js), hier los zodat de simulatie zonder browser kan

// De zes aanpakken. r = rang-index, en = energie, cd = afkoelen (min), wp = wapen nodig, sk = trainingen die helpen,
// T0/T1 = kans per zeldzaamheid als groentje / legende, bw = extra gewicht per carrosserie, boost = dure klassen (k),
// g = correctie op G, wit = kans op getuigen bij succes, own = eigenaar erbij (auto altijd gemeld), val = deel van de waarde,
// heat = hitte bij succes (+2 per zeldzaamheid), fail = [weg, verzet, politie] bij mislukken, car = bij politie zit je al in de auto
// (achtervolging), anders te voet. loot/risk = 1..5 voor de kaart.
const JG_APS=[
 {id:'tank',n:'Tankstation',sub:'Hij rekent af, de sleutel zit erin.',game:'sneak',en:8,cd:3,wp:0,sk:['steal','speed'],g:.04,wit:.3,own:1,val:.85,heat:4,
  T0:{1:.56,2:.32,3:.1,4:.02},T1:{1:.24,2:.35,3:.28,4:.11,5:.02},bw:{},boost:1,fail:[.55,.15,.3],car:0,loot:1,risk:2,
  how:'Sluip naar de auto als hij je zijn rug toekeert.',steps:['Pomp','Bumper','Portier','Weg'],btn:'Sluip'},
 {id:'bezorger',n:'Bezorger',sub:'Motor draait, hij rent de trap op.',game:'spots',en:8,cd:3,wp:0,sk:['speed','conditie'],g:.04,wit:.25,own:1,val:.85,heat:3,
  T0:{1:.62,2:.3,3:.07,4:.01},T1:{1:.3,2:.4,3:.22,4:.07,5:.01},bw:{van:4,estate:2,liftback:2,hatch:1.3},boost:1,fail:[.6,.3,.1],car:0,loot:1,risk:1,
  how:'Tik wat oplicht, voordat hij weer beneden is.',steps:['Portier','Contact','Handrem']},
 {id:'licht',n:'Stoplicht',sub:'Portier open, bestuurder eruit.',game:'bar',en:12,cd:5,wp:1,sk:['conditie','schiet'],g:0,wit:.35,own:1,val:.85,heat:6,
  T0:{1:.34,2:.33,3:.21,4:.1,5:.02},T1:{1:.1,2:.16,3:.31,4:.29,5:.12,6:.02},bw:{},boost:1.2,fail:[.45,.3,.25],car:1,loot:3,risk:3,
  how:'Druk als de streep in het groen staat.',steps:['Portier','Eruit','Gas'],btn:'Nu!'},
 {id:'garage',n:'Parkeergarage',sub:'Geen mens te zien. Wel camera\'s.',game:'lock',en:12,cd:6,wp:0,sk:['sloten','cars'],g:-.02,wit:.15,own:0,val:.95,heat:3,rank:1,
  T0:{1:.2,2:.36,3:.3,4:.12,5:.02},T1:{1:.05,2:.14,3:.33,4:.32,5:.14,6:.02},bw:{},boost:1.3,fail:[.4,0,.6],car:0,loot:3,risk:3,
  how:'Draai als de naald in het groene stuk staat.',btn:'Draai'},
 {id:'tik',n:'Valse aanrijding',sub:'Een tikje, hij stapt uit, jij stapt in.',game:'bump',en:14,cd:5,wp:1,sk:['cars','charisma'],g:-.03,wit:.4,own:1,val:.85,heat:6,rank:2,
  T0:{1:.24,2:.36,3:.27,4:.11,5:.02},T1:{1:.05,2:.14,3:.32,4:.32,5:.15,6:.02},bw:{},boost:1.3,fail:[.35,.4,.25],car:1,loot:4,risk:4,
  how:'Druk als je in het groen bent: remmen, wachten, instappen.',steps:['Tikje','Uitstappen','Instappen'],btn:'Nu!'},
 {id:'oprit',n:'Oprit \'s nachts',sub:'Keyless. De sleutel ligt in de gang.',game:'relay',en:16,cd:9,wp:0,sk:['hack','sloten'],g:-.06,wit:.1,own:0,val:1,heat:4,rank:3,
  T0:{1:.05,2:.25,3:.38,4:.24,5:.07,6:.01},T1:{2:.06,3:.3,4:.36,5:.24,6:.04},bw:{},boost:1.4,fail:[.35,.15,.5],car:1,loot:5,risk:4,
  how:'Tik de golf die gelijk is aan het signaal van de sleutel.',steps:['Versterker','Sleutel','Deur']}];
const jgAp=id=>JG_APS.find(a=>a.id===id)||JG_APS[2];
const JG_SEC=['Slot','Alarm','Keyless'];

// pure kans: prof = {E: steelervaring 0..1, R: rang 0..1, T: training 0..1, X: wapen/routine 0..1, lvl: steel-level 1..10}
function jgP(prof){return Math.max(0,Math.min(1,.45*prof.E+.15*prof.R+.2*prof.T+.2*prof.X))}
function jgG(ap,tier,sec,prof){const P=jgP(prof),rel=Math.max(-5,Math.min(4,prof.lvl-JG_REQ[tier]));
 return Math.max(.06,Math.min(.97,.30+.64*P+(rel<0?.065*rel:.025*rel)-.05*(sec||0)+(ap.g||0)))}

// ---------- het model ----------
// soort: sweep (heen en weer), oneway (één kant op, op tijd drukken), ring (rondje), react (wachten tot het kan),
// react3 (de juiste van drie, op tijd), choice (de juiste golf kiezen)
const JG_TYPES={bar:{kind:'sweep',k:3,m:1,v:.78},bump:{kind:'oneway',k:3,m:1,v:.62},lock:{kind:'ring',k:4,m:1,v:.5},
 sneak:{kind:'react',k:4,m:1},spots:{kind:'react3',k:3,m:1},relay:{kind:'choice',k:3,m:1}};
const JG_PAUSE=.55;
function jgNew(type,G,o){o=o||{};const T=JG_TYPES[type],k=o.k||T.k,m=T.m,p=jgSolve(G,k,m),rnd=o.rnd||Math.random;
 const g={type,kind:T.kind,G,p,k,m,v:T.v,hits:0,miss:0,t:0,done:0,win:false,ev:null,rnd,pause:0,n:0};
 if(T.v)g.w=Math.min(.5,2*jgHalf(p)*T.v);
 if(T.kind==='react'||T.kind==='react3')g.rw=Math.max(.32,jgReact(p));
 if(T.kind==='choice')g.ct=Math.max(.7,jgChoiceT(p));
 const per={sweep:3,oneway:2.6,ring:2.8,react:3.6,react3:3.2,choice:2.8}[T.kind];g.limit=(k+m)*per+3;
 jgArm(g);return g}
function jgArm(g){const r=g.rnd,t0=g.t+(g.n?JG_PAUSE:0);g.t0=t0;g.n++;g.pause=t0;
 if(g.kind==='sweep'){g.c=.12+g.w/2+r()*(.76-g.w);g.ph=r()<.5?0:1}
 else if(g.kind==='oneway'){g.c=.6+r()*.24;if(g.c+g.w/2>.97)g.c=.97-g.w/2}
 else if(g.kind==='ring'){g.c=r();g.ph=(g.c+.35+r()*.3)%1}
 else if(g.kind==='react'||g.kind==='react3'){g.open=t0+.8+r()*1.5;g.close=g.open+g.rw;g.slot=Math.floor(r()*3)}
 else if(g.kind==='choice'){g.until=t0+g.ct;g.ans=Math.floor(r()*3);const f=[2,3,4,5,6].sort(()=>r()-.5).slice(0,3),a=[.55,.9];
  g.waves=f.map((n,i)=>({f:n,a:a[Math.floor(r()*2)],sq:r()<.3?1:0}));g.sig=g.waves[g.ans]}}
// stand van de wijzer (0..1)
function jgPos(g){const d=Math.max(0,g.t-g.t0);
 if(g.kind==='sweep')return jgTri(g.ph+d*g.v);
 if(g.kind==='oneway')return Math.min(1,d*g.v);
 if(g.kind==='ring')return (g.ph+d*g.v)%1;return 0}
function jgInZone(g){const x=jgPos(g);if(g.kind==='ring'){let dd=Math.abs(x-g.c)%1;dd=Math.min(dd,1-dd);return dd<=g.w/2}return Math.abs(x-g.c)<=g.w/2}
function jgEnd(g,win,why){g.done=1;g.win=win;g.why=why;g.ev={k:win?'win':'lose',why,t:g.t};return g.ev}
function jgHit(g){g.hits++;g.ev={k:'hit',i:g.hits-1,t:g.t};if(g.hits>=g.k)return jgEnd(g,true,'ok');jgArm(g);return g.ev}
function jgMiss(g,why){g.miss++;g.ev={k:'miss',why,t:g.t};if(g.miss>g.m)return jgEnd(g,false,why);jgArm(g);return g.ev}
// tijd laten lopen; geeft een gebeurtenis terug als er iets gebeurt (te laat, tijd op)
function jgStep(g,dt){if(g.done)return null;g.t+=dt;
 if(g.t>=g.limit)return jgEnd(g,false,'time');
 if(g.t<g.pause)return null;
 if(g.kind==='oneway'&&g.t-g.t0>=1/g.v)return jgMiss(g,'late');
 if(g.kind==='react'&&g.t>=g.close){g.open=g.t+.6+g.rnd()*1.3;g.close=g.open+g.rw}
 if(g.kind==='react3'&&g.t>=g.close)return jgMiss(g,'late');
 if(g.kind==='choice'&&g.t>=g.until)return jgMiss(g,'late');
 return null}
// drukken (inp = 0..2 bij drie knoppen)
function jgPress(g,inp){if(g.done||g.t<g.pause)return null;
 if(g.kind==='sweep'||g.kind==='oneway'||g.kind==='ring')return jgInZone(g)?jgHit(g):jgMiss(g,'zone');
 if(g.kind==='react')return g.t>=g.open&&g.t<g.close?jgHit(g):jgMiss(g,'seen');
 if(g.kind==='react3'){if(g.t<g.open)return jgMiss(g,'early');return inp===g.slot?jgHit(g):jgMiss(g,'wrong')}
 if(g.kind==='choice')return inp===g.ans?jgHit(g):jgMiss(g,'wrong');return null}
// state voor de react-spellen: kijkt hij (watch) of is het moment er (open)
const jgOpen=g=>g.t>=g.pause&&g.t>=g.open&&g.t<g.close;

// ---------- simulatie: een gemiddelde speler (JG_HUM) speelt het echte model ----------
function jgBotRun(type,G,o){o=o||{};const g=jgNew(type,G,o),r=g.rnd,N=()=>{let u=0,v=0;while(!u)u=r();while(!v)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)},dt=1/240;
 let plan=null;
 const mk=()=>{const t0=Math.max(g.t,g.pause);
  if(g.kind==='sweep'){let t=t0+.35;for(let i=0;i<4000;i++){const a=jgTri(g.ph+(t-g.t0)*g.v),b=jgTri(g.ph+(t+.001-g.t0)*g.v);if((a-g.c)*(b-g.c)<=0)break;t+=.001}return {t:t+JG_HUM.sig*N()}}
  if(g.kind==='oneway')return {t:g.t0+g.c/g.v+JG_HUM.sig*N()};
  if(g.kind==='ring'){let d=((g.c-g.ph)%1+1)%1;if(d/g.v<.35)d+=1;return {t:g.t0+d/g.v+JG_HUM.sig*N()}}
  if(g.kind==='react'||g.kind==='react3')return {t:g.open+JG_HUM.rt+JG_HUM.rts*N(),inp:g.slot};
  if(g.kind==='choice')return {t:g.t0+JG_HUM.cmu+JG_HUM.cs*N(),inp:r()<JG_HUM.ce?(g.ans+1)%3:g.ans}};
 let arm=g.n;plan=mk();
 for(let i=0;i<200000&&!g.done;i++){jgStep(g,dt);if(g.done)break;if(g.n!==arm){arm=g.n;plan=mk()}
  if(g.kind==='react'&&plan&&g.open>plan.t+5)plan=mk();
  if(plan&&g.t>=plan.t&&g.t>=g.pause){jgPress(g,plan.inp);plan=null;if(g.n===arm&&!g.done)plan=mk()}}
 return g.win}

// ---------- tekening ----------
const jgE=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// een auto (carSvg, 200×72) op x,y met breedte w; flip = rijdt naar links
function jgCar(b,c,x,y,w,o){o=o||{};if(typeof carSvg!=='function')return '';const h=w*.36,s=carSvg(b,c,{hl:o.hl}).replace('<svg ',`<svg x="0" y="0" width="${w}" height="${h}" `);
 return `<g ${o.id?`id="${o.id}" `:''}class="${o.cls||''}"><g transform="translate(${x} ${(y-h*68/72).toFixed(1)})${o.flip?` translate(${w} 0) scale(-1 1)`:''}">${s}</g></g>`}
// een poppetje (zij-aanzicht), voeten op y
function jgMan(x,y,col,o){o=o||{};const s=o.s||1;return `<g ${o.id?`id="${o.id}" `:''}class="jg-man ${o.cls||''}" transform="translate(${x} ${y}) scale(${s})">
 <path d="M-4 0l1.5-15h5L4 0" stroke="#0c0d10" stroke-width="3.2" stroke-linecap="round" fill="none"/>
 <path d="M-6-14q0-13 6-14q6 1 6 14z" fill="${col}"/><path d="M-6-25l-3 9M6-25l3 9" stroke="${col}" stroke-width="3" stroke-linecap="round"/>
 <circle cy="-32" r="4.6" fill="#c69a7a"/>${o.hood?`<path d="M-5.4-32a5.4 5.6 0 0 1 10.8 0v2h-10.8z" fill="${o.hood}"/>`:''}</g>`}
const jgSky=(id,a,b)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
 <radialGradient id="${id}L" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="#ffb35a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient></defs><rect width="360" height="190" fill="url(#${id})"/>`;
const jgCity=(y,seed)=>{let o='',x=-4,s=seed||7;const R=()=>{s=(s*9301+49297)%233280;return s/233280};
 while(x<360){const w=26+R()*40,h=30+R()*60;o+=`<rect x="${x.toFixed(1)}" y="${(y-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#0f131b"/>`;
  for(let wy=y-h+6;wy<y-6;wy+=9)for(let wx=x+4;wx<x+w-5;wx+=8)if(R()<.22)o+=`<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="3.5" height="4" fill="#f6c46a" opacity="${(.35+R()*.5).toFixed(2)}"/>`;x+=w+2}return o};

// per aanpak de scène (viewBox 0 0 360 190) en de bijbehorende bediening
function jgScene(ap,m,c,G){const b=m.b,K=G.k;
 if(ap.id==='licht')return `${jgSky('jgS1','#0a0d14','#171b26')}${jgCity(128,3)}
  <rect y="128" width="360" height="62" fill="#14161b"/><path d="M0 160h360" stroke="#f2f0ea" stroke-opacity=".25" stroke-width="2" stroke-dasharray="18 14"/><path d="M262 132v56" stroke="#f2f0ea" stroke-opacity=".5" stroke-width="5"/>
  <rect x="300" y="40" width="5" height="100" fill="#2a2e36"/><rect x="290" y="40" width="25" height="62" rx="5" fill="#07080a" stroke="#2b2f37"/>
  <circle id="jgLr" cx="302.5" cy="54" r="7.5" class="jg-lamp r on"/><circle id="jgLa" cx="302.5" cy="71" r="7.5" class="jg-lamp a"/><circle id="jgLg" cx="302.5" cy="88" r="7.5" class="jg-lamp g"/>
  ${jgCar(b,c,78,152,180,{id:'jgCar',hl:1,cls:'jg-car'})}
  <path id="jgDoor" class="jg-door" d="M150 118l-26 -6v30l26 4z" fill="#0b0c0f" stroke="#3a3f48" opacity="0"/>
  ${jgMan(140,170,'#3a4250',{id:'jgDrv',cls:'jg-drv'})}${jgMan(46,172,'#20242c',{id:'jgMe',cls:'jg-me',hood:'#15171c'})}`;
 if(ap.id==='tank')return `${jgSky('jgS2','#090b10','#121620')}
  <rect y="146" width="360" height="44" fill="#16181d"/><rect x="0" y="20" width="360" height="14" fill="#1d2129"/><rect x="0" y="33" width="360" height="3" fill="#ff7a1a" opacity=".8"/><rect x="0" y="36" width="360" height="110" fill="url(#jgS2L)" opacity=".35"/>
  <rect x="10" y="58" width="100" height="88" fill="#1a1e26" stroke="#2b3038"/><rect id="jgWin" class="jg-win" x="20" y="70" width="80" height="44" fill="#f3d9a0" opacity=".85"/>
  <g id="jgClerk" transform="translate(60 114)"><g class="jg-face"><circle cy="-26" r="7" fill="#c69a7a"/><circle cx="-2.5" cy="-27" r="1.2" fill="#111"/><circle cx="2.5" cy="-27" r="1.2" fill="#111"/><path d="M-10 0q0-18 10-18q10 0 10 18z" fill="#3a4250"/></g>
   <g class="jg-back"><circle cy="-26" r="7" fill="#3b2c22"/><path d="M-10 0q0-18 10-18q10 0 10 18z" fill="#2f3542"/></g></g>
  <g id="jgEye" class="jg-eye" transform="translate(60 52)"><path d="M-14 0q14-11 28 0q-14 11-28 0z" fill="#fff"/><circle r="4.6" fill="#ff3d52"/></g>
  <rect x="130" y="92" width="18" height="54" rx="3" fill="#c8202f"/><rect x="133" y="98" width="12" height="10" fill="#0d0f13"/><path d="M148 110q8 0 8 16" stroke="#111" stroke-width="2.5" fill="none"/>
  ${jgCar(b,c,170,160,180,{id:'jgCar',cls:'jg-car'})}${jgMan(118,166,'#20242c',{id:'jgMe',cls:'jg-me',hood:'#15171c'})}`;
 if(ap.id==='bezorger')return `${jgSky('jgS3','#0a0c12','#151924')}
  <rect x="8" y="16" width="134" height="140" fill="#1b1f28" stroke="#2a2f38"/>${[0,1,2,3].map(f=>`<rect id="jgF${f}" class="jg-fl" x="62" y="${124-f*30}" width="26" height="18" fill="#2a2f38"/><rect x="${f%2?20:104}" y="${126-f*30}" width="22" height="14" fill="#f6c46a" opacity=".35"/>`).join('')}
  <rect x="64" y="134" width="22" height="22" fill="#0c0d10"/><rect y="156" width="360" height="34" fill="#15171c"/><path d="M150 158h210" stroke="#3a3f48" stroke-width="3"/>
  ${jgCar(b,c,160,170,190,{id:'jgCar',cls:'jg-car'})}<g class="jg-puff"><circle cx="160" cy="160" r="4"/><circle cx="152" cy="156" r="5.5"/><circle cx="143" cy="151" r="7"/></g>
  ${[0,1,2].map(i=>`<g id="jgH${i}" class="jg-hot" transform="translate(${200+i*55} 128)"><circle r="15"/><circle r="5"/></g>`).join('')}`;
 if(ap.id==='garage')return `${jgSky('jgS4','#0d0f13','#16191e')}
  <rect width="360" height="22" fill="#22262d"/>${[40,150,260].map(x=>`<rect class="jg-tube" x="${x}" y="22" width="60" height="4" fill="#dff3ff"/>`).join('')}
  <rect x="2" y="22" width="20" height="150" fill="#1c1f25"/><rect y="150" width="360" height="40" fill="#1a1c21"/><path d="M28 150l-14 40M210 150l14 40" stroke="#e6c229" stroke-width="3" opacity=".7"/>
  <g class="jg-cam" transform="translate(30 34)"><rect x="-4" y="-2" width="20" height="9" rx="2" fill="#3a3f48"/><circle cx="14" cy="2.5" r="2.3" fill="#ff3d52"/></g>
  ${jgCar(b,c,26,164,180,{cls:'jg-car',id:'jgCar'})}
  <g transform="translate(278 98)"><circle r="66" fill="#0a0b0e" stroke="#2b3038" stroke-width="2"/><circle r="56" fill="url(#jgLk)"/>
   <defs><radialGradient id="jgLk"><stop offset="0" stop-color="#d2a84a"/><stop offset="1" stop-color="#6f5622"/></radialGradient></defs>
   <path id="jgZone" class="jg-zone-arc" d="" fill="none" stroke-width="14"/><circle r="38" fill="#2a2116" opacity=".55"/>
   <path d="M-5-14a8 8 0 1 1 10 0l4 26h-18z" fill="#0b0c0f"/><g id="jgPick"><path d="M0 0v-60" stroke="#f2f0ea" stroke-width="4" stroke-linecap="round"/><circle cy="-60" r="4" fill="#fff"/></g>
   <g transform="translate(0 -84)">${Array.from({length:K},(_,i)=>`<rect class="jg-pin" id="jgP${i}" x="${(i-(K-1)/2)*16-5}" y="-6" width="10" height="12" rx="2"/>`).join('')}</g></g>`;
 if(ap.id==='oprit')return `${jgSky('jgS5','#060810','#10141e')}<circle cx="320" cy="30" r="12" fill="#e9e6da" opacity=".85"/>
  <path d="M6 150V70l78-40 78 40v80z" fill="#1b1f28" stroke="#2a2f38"/><rect x="66" y="96" width="34" height="54" fill="#0d0f13"/><rect x="70" y="100" width="26" height="20" fill="#f3d9a0" opacity=".25"/>
  <rect x="22" y="86" width="26" height="22" fill="#f6c46a" opacity=".3"/><rect x="118" y="86" width="26" height="22" fill="#0d0f13"/>
  <g id="jgKey" class="jg-key" transform="translate(84 136)"><rect x="-7" y="-4" width="14" height="8" rx="3" fill="#2b2f37"/><circle r="1.6" cx="3" fill="#3fe395"/></g>
  <rect y="150" width="360" height="40" fill="#14161b"/><path d="M150 150l-30 40h240v-40z" fill="#1a1c20"/>
  ${jgCar(b,c,176,164,176,{id:'jgCar',cls:'jg-car'})}${jgMan(132,166,'#20242c',{id:'jgMe',cls:'jg-me',hood:'#15171c'})}
  <g class="jg-scope" transform="translate(196 18)"><rect width="150" height="58" rx="6" fill="#07090b" stroke="#2b3038"/><text x="8" y="14" class="jg-sct">SLEUTEL</text><path id="jgSig" d="" fill="none" stroke="#3fe395" stroke-width="2.5"/></g>`;
 if(ap.id==='tik')return `${jgSky('jgS6','#0a0d14','#171b26')}${jgCity(124,11)}
  <rect y="124" width="360" height="66" fill="#14161b"/><path d="M0 170h360" stroke="#f2f0ea" stroke-opacity=".22" stroke-width="2" stroke-dasharray="18 14"/>
  ${jgCar(b,c,180,156,170,{id:'jgCar',cls:'jg-car',hl:1})}${jgCar('hatch','#3b414b',0,160,150,{id:'jgMine',cls:'jg-mine'})}
  <g id="jgBang" class="jg-bang" transform="translate(186 128)"><path d="M0-14l4 9 10-4-6 9 9 6-11 1 1 11-7-8-7 8 1-11-11-1 9-6-6-9 10 4z" fill="#ffd35a"/></g>
  ${jgMan(300,170,'#3a4250',{id:'jgDrv',cls:'jg-drv'})}${jgMan(120,172,'#20242c',{id:'jgMe',cls:'jg-me',hood:'#15171c'})}`;
 return ''}
// golfje voor het relay-spel: n toppen, amplitude a, blok of sinus
function jgWave(wv,W,H){const n=wv.f,a=wv.a*H*.42,mid=H/2;let d='';for(let i=0;i<=80;i++){const x=i/80,ph=x*n*Math.PI*2;let y=Math.sin(ph);if(wv.sq)y=y>=0?1:-1;d+=(i?'L':'M')+(x*W).toFixed(1)+' '+(mid-y*a).toFixed(1)}return d}
const JG_ICON={door:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20V9l5-5h11v16z"/><path d="M4 11h16M15 14h3"/></svg>',
 key:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/></svg>',
 brake:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 20h12M12 20L8 6"/><circle cx="8" cy="5" r="2.2"/></svg>'};
function jgCtl(ap,G){
 if(G.kind==='react3')return `<div class="jg-three">${ap.steps.map((s,i)=>`<button type="button" class="jg-opt" data-i="${i}">${JG_ICON[['door','key','brake'][i]]}<span>${s}</span></button>`).join('')}</div>`;
 if(G.kind==='choice')return `<div class="jg-three">${[0,1,2].map(i=>`<button type="button" class="jg-opt jg-wv" data-i="${i}" aria-label="Golf ${['links','midden','rechts'][i]}"><svg viewBox="0 0 120 40" aria-hidden="true"><path d="" fill="none" stroke="currentColor" stroke-width="2.5"/></svg></button>`).join('')}</div>`;
 const bar=G.kind==='sweep'||G.kind==='oneway'?`<div class="jg-bar ${G.kind}" id="jgBar"><i class="jg-z" id="jgZ"></i><i class="jg-mk" id="jgMk"></i></div>`:'';
 return `${bar}<button type="button" class="btn xl jg-now" id="jgNow">${jgE(ap.btn||'Nu!')}</button>`}
const JG_SAY={hit:{licht:['Portier open.','Hij stapt uit.','Gas erop!'],tank:['Achter de pomp.','Bij de bumper.','Aan het portier.','Erin!'],bezorger:['Portier open.','Contact.','Handrem eraf!'],
  garage:['Pin zit.'],tik:['Tik. Hij stapt uit.','Hij kijkt naar de bumper.','Je zit erin!'],oprit:['Versterker aan.','Sleutel gevonden.','Deur open!']},
 miss:{zone:'Mis.',seen:'Hij kijkt! Wegduiken.',early:'Te vroeg.',wrong:'Verkeerd.',late:'Te laat.'},
 tikMiss:['Te zacht of te hard.','Te vroeg, hij ziet je.','Te laat.']};
const jgReduce=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// speel het spel. o = {ap, m, car:{c,plate}, G, k}. Promise → {win, why, miss}
function jgPlay(o){const ap=o.ap,m=o.m,c=o.car.c,R=typeof carRarity==='function'?carRarity(m):['','#888'];
 return new Promise(resolve=>{
 const G=jgNew(ap.game,o.G,{k:o.k});window.__jk=G;window.__chase=true;
 const ov=document.createElement('div');ov.className='chase-ov jg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','jgT');
 const named=ap.steps&&G.kind!=='react3',pips=named?ap.steps.map(s=>`<span>${jgE(s)}</span>`).join(''):Array.from({length:G.k},()=>'<span class="dot"></span>').join('');
 ov.innerHTML=`<div class="jg-box ap-${ap.id}" style="--rc:${R[1]}">
  <div class="jg-head"><span class="rar" style="--rc:${R[1]}">${jgE(R[0])}</span><h2 id="jgT">${jgE(m.n)}</h2><em>${jgE(ap.n)}</em></div>
  <div class="jg-stage"><svg class="jg-svg" viewBox="0 0 360 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${jgScene(ap,m,c,G)}</svg>
   <div class="jg-say" id="jgSay" aria-live="polite"></div><div class="jg-flash" id="jgFl"></div></div>
  <div class="jg-row"><div class="jg-pips ${named?'':'dots'}" id="jgPips">${pips}</div><div class="jg-lives" id="jgLv" aria-label="Kansen">${Array.from({length:G.m+1},()=>'<i></i>').join('')}</div></div>
  <div class="jg-time"><i id="jgTime"></i></div>
  <div class="jg-ctl" id="jgCtl">${jgCtl(ap,G)}</div></div>`;
 document.body.appendChild(ov);
 const q=s=>ov.querySelector(s),box=q('.jg-box'),say=q('#jgSay');let raf=0,last=0,live=false,ended=false;
 const setSay=(t,cl)=>{say.textContent=t;say.className='jg-say show '+(cl||'');clearTimeout(setSay.t);setSay.t=setTimeout(()=>say.classList.remove('show'),1100)};
 const flash=cl=>{const f=q('#jgFl');f.className='jg-flash';void f.offsetWidth;f.className='jg-flash '+cl};
 // intro: één zin en Start, dan 3-2-1
 const intro=document.createElement('div');intro.className='jg-in';intro.innerHTML=`<p>${jgE(ap.how)}</p><button type="button" class="btn jg-go">Start</button>`;q('.jg-stage').appendChild(intro);
 const paintWaves=()=>{if(G.kind!=='choice')return;q('#jgSig').setAttribute('d',jgWave(G.sig,134,34).replace(/([ML])([\d.]+) ([\d.]+)/g,(a,L,x,y)=>L+(+x+8).toFixed(1)+' '+(+y+19).toFixed(1)));
  ov.querySelectorAll('.jg-wv path').forEach((p,i)=>p.setAttribute('d',jgWave(G.waves[i],120,40)))};
 const zoneArc=()=>{const z=q('#jgZone');if(!z)return;const a0=(G.c-G.w/2)*Math.PI*2,a1=(G.c+G.w/2)*Math.PI*2,r=48,P=a=>`${(Math.sin(a)*r).toFixed(1)} ${(-Math.cos(a)*r).toFixed(1)}`;
  z.setAttribute('d',`M${P(a0)} A${r} ${r} 0 ${G.w>.5?1:0} 1 ${P(a1)}`)};
 let armSeen=-1;
 const paint=()=>{const pos=jgPos(G),fr=G.t/G.limit;q('#jgTime').style.width=Math.max(0,100-fr*100)+'%';q('#jgTime').classList.toggle('low',fr>.7);
  if(armSeen!==G.n){armSeen=G.n;const Z=q('#jgZ');if(Z){Z.style.left=((G.c-G.w/2)*100)+'%';Z.style.width=(G.w*100)+'%'}zoneArc();paintWaves();
   ov.querySelectorAll('#jgPips span').forEach((e,i)=>{e.className=(e.classList.contains('dot')?'dot ':'')+(i<G.hits?'ok':i===G.hits&&!G.done?'cur':'')});
   ov.querySelectorAll('#jgLv i').forEach((e,i)=>e.classList.toggle('gone',i>=G.m+1-G.miss))}
  const mk=q('#jgMk');if(mk)mk.style.left=(pos*100)+'%';
  const bar=q('#jgBar');if(bar)bar.classList.toggle('in',G.t>=G.pause&&jgInZone(G));
  const pk=q('#jgPick');if(pk)pk.setAttribute('transform',`rotate(${(pos*360).toFixed(1)})`);
  const lk=q('.ap-garage .jg-svg');if(lk)lk.classList.toggle('in',G.t>=G.pause&&jgInZone(G));
  const op=jgOpen(G);
  if(G.kind==='react'){box.classList.toggle('open',op)}
  if(G.kind==='react3'){ov.querySelectorAll('.jg-hot').forEach((h,i)=>h.classList.toggle('on',op&&i===G.slot));ov.querySelectorAll('.jg-opt').forEach((h,i)=>h.classList.toggle('on',op&&i===G.slot));
   const fl=Math.min(3,Math.floor(jgTri(fr*2)*4));ov.querySelectorAll('.jg-fl').forEach((f,i)=>f.classList.toggle('on',i===fl))}
  if(ap.id==='licht'&&fr>.72){q('#jgLr').classList.remove('on');q('#jgLa').classList.add('on')}
  if(ap.id==='tik'){const h=G.hits;const mine=q('#jgMine'),drv=q('#jgDrv'),me=q('#jgMe');
   if(h===0&&!G.done)mine.setAttribute('transform',`translate(${(pos*44).toFixed(1)} 0)`);
   if(h===1&&!G.done)drv.setAttribute('transform',`translate(${(300-pos*96).toFixed(1)} 170)`);
   if(h===2&&!G.done)me.setAttribute('transform',`translate(${(120+pos*160).toFixed(1)} 172)`)}
  if(ap.id==='tank'){const xs=[118,150,196,246,300];q('#jgMe').style.transform=`translate(${xs[Math.min(4,G.hits)]}px,166px)`}
 };
 const show=ev=>{if(!ev)return;
  if(ev.k==='hit'||(ev.k==='win')){const i=ev.k==='win'?G.k-1:ev.i,H=JG_SAY.hit[ap.id]||[];setSay(H[Math.min(i,H.length-1)]||'Goed.','ok');flash('ok');try{SFX.tick()}catch(e){}
   box.classList.add('h'+(i+1));const pin=q('#jgP'+i);if(pin)pin.classList.add('set')}
  if(ev.k==='miss'||ev.k==='lose'){const t=ap.id==='tik'&&ev.why!=='time'?JG_SAY.tikMiss[Math.min(2,G.hits)]:ev.why==='time'?'De tijd is op.':JG_SAY.miss[ev.why]||'Mis.';setSay(t,'bad');flash('bad');box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');
   if(ap.id==='tik'&&G.hits===0){const b=q('#jgBang');if(b){b.classList.remove('on');void b.getBBox;b.classList.add('on')}}}
  if(ev.k==='win'||ev.k==='lose')finish()};
 const press=inp=>{if(!live||G.done)return;const ev=jgPress(G,inp);show(ev);paint()};
 const loop=t=>{if(G.done)return;const dt=Math.min(.05,(t-last)/1000);last=t;const ev=jgStep(G,dt);if(ev)show(ev);paint();if(!G.done)raf=requestAnimationFrame(loop)};
 const key=e=>{if(!live)return;const k=e.key,code=e.code;let inp=null;
  if(G.kind==='react3'||G.kind==='choice'){if(k==='ArrowLeft'||code==='KeyA')inp=0;else if(k==='ArrowDown'||k==='ArrowUp'||code==='KeyS'||code==='KeyW')inp=1;else if(k==='ArrowRight'||code==='KeyD')inp=2;else if(/^[123]$/.test(k))inp=+k-1}
  else if(code==='Space'||k==='Enter')inp=0;
  if(inp==null)return;e.preventDefault();if(!e.repeat)press(inp)};
 document.addEventListener('keydown',key);
 const nb=q('#jgNow');if(nb)nb.addEventListener('pointerdown',e=>{e.preventDefault();press(0)});
 const bb=q('#jgBar');if(bb)bb.addEventListener('pointerdown',e=>{e.preventDefault();press(0)});
 ov.querySelectorAll('.jg-opt').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();press(+b.dataset.i)}));
 ov.querySelectorAll('.jg-hot').forEach((h,i)=>h.addEventListener('pointerdown',e=>{e.preventDefault();press(i)}));
 if(ap.id==='garage'){const s=q('.jg-svg');s.addEventListener('pointerdown',e=>{e.preventDefault();press(0)})}
 function finish(){if(ended)return;ended=true;live=false;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);paint();
  box.classList.add(G.win?'won':'lost');ov.querySelectorAll('.jg-ctl button').forEach(b=>b.disabled=true);
  const end=document.createElement('div');end.className='jg-end '+(G.win?'ok':'bad');end.innerHTML=`<b>${G.win?'Gelukt!':'Mislukt'}</b>`;q('.jg-stage').appendChild(end);
  try{G.win?SFX.win(3):SFX.lose()}catch(e){}
  setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;window.__jk=null;resolve({win:G.win,why:G.why,miss:G.miss,hits:G.hits})},220)},jgReduce()?900:1500)}
 const go=()=>{if(intro._g)return;intro._g=1;document.removeEventListener('keydown',ik,true);intro.classList.add('out');setTimeout(()=>intro.remove(),180);
  const cnt=document.createElement('div');cnt.className='jg-cnt';q('.jg-stage').appendChild(cnt);let n=3;
  const step=()=>{if(n===0){cnt.remove();live=true;last=performance.now();G.t=0;jgArm0();paint();raf=requestAnimationFrame(loop);try{nb&&nb.focus({preventScroll:true})}catch(e){}return}
   cnt.innerHTML=`<b>${n}</b>`;try{SFX.tick()}catch(e){}n--;setTimeout(step,jgReduce()?380:450)};step()};
 // de eerste poging begint pas na de 3-2-1
 const jgArm0=()=>{G.n=0;G.t=0;jgArm(G);armSeen=-1};
 const ik=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)go()}};
 document.addEventListener('keydown',ik,true);intro.querySelector('.jg-go').addEventListener('click',go);
 paint();setTimeout(()=>{try{intro.querySelector('.jg-go').focus({preventScroll:true})}catch(e){}},60);
 })}
if(typeof module!=='undefined')module.exports={JG_APS,jgAp,jgG,jgP,jgNew,jgStep,jgPress,jgBotRun,jgSolve,jgNB,JG_TYPES};
