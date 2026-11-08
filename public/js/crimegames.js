// Klus-spellen: elke misdaad heeft een minigame (18 soorten, de nieuwste zeven in crimegames2.js). Hoe professioneler je in een klus bent, hoe makkelijker het
// spel, hoe hoger de kans daarna en hoe meer buit. Alles over kans en buit van een klus staat in dit bestand; state.js
// (chance) en actions.js (act.crime, crimeResolve) roepen het aan.
//
// PROFESSIONALITEIT P (0..1) per klus:
//   P = 0,40 × vakmanschap  (√(keer gelukt / 150), na 150 keer vol)
//     + 0,25 × ervaring in de soort (level 0..10 uit S.crx, met tussenstand)
//     + 0,20 × training die bij het spel hoort (gemiddelde level / 50, bv. Vingervlugheid bij zakkenrollen)
//     + 0,15 × rang t.o.v. de klus (rangen erboven + level binnen je rang; 3 rangen erboven = vol; Peetvader level 5 = vol)
// SPEL: een gemiddelde speler haalt het spel met kans G(P) = 0,50 + 0,49 × (1 − (1 − P)^1,6)  (50% → 83% bij P=½ → 99%).
//   Elk spel bestaat uit pogingen (k keer goed nodig, hooguit m fouten). De ruimte per poging (venster, reactietijd,
//   antwoordtijd) wordt uit G(P) teruggerekend met een model van een gemiddelde speler (CG_HUM), zodat dit ook echt klopt.
// DAARNA de dobbelsteen: 58 + 38 × P + (basiskans − 50) × 0,2 + uitrusting/familie/outfit/training/focus − hitte,
//   × lidmaatschap, tussen 5% en het plafond (chanceCap). Verwachte kans = G(P) × dobbelsteen.
//   Nieuweling (P=0, niks extra): ±0,5 × 58% ≈ 29%. Alles maximaal: 0,99 × 99% ≈ 98%.
// BUIT: × (1 + 0,6 × P^1,5) (meester +60%), plus een schone klus: geen fout +8%, één fout +4%.
// OVERSLAAN (altijd, op de kaart of bij de uitleg): zonder spel, kans = de kans op de kaart (chance), geen schone-klusbonus.
// Verversen tijdens een spel = betrapt (S.pendingGame, afgehandeld in main.js).

// ---------- 1. professionaliteit, kans en buit ----------
const CG_W={M:.40,X:.25,T:.20,R:.15},CG_MAST_FULL=150,CG_D0=58,CG_D1=38,CG_BASEK=.2,CG_LOOT=.6,CG_CLEAN=[.08,.04],CG_QUICK_P=.8,CG_QUICK_K=.06;
const CG_LV=[[0,'Beginner'],[.3,'Gevorderd'],[.55,'Professional'],[.8,'Meester']];
const cgG=P=>.5+.49*(1-Math.pow(1-Math.max(0,Math.min(1,P)),1.6));
const cgLvName=P=>{let n=CG_LV[0][1];CG_LV.forEach(x=>{if(P>=x[0]-1e-9)n=x[1]});return n};
const cgLvIdx=P=>{let i=0;CG_LV.forEach((x,j)=>{if(P>=x[0]-1e-9)i=j});return i};
function crxFrac(cat){const n=crxN(cat),l=crxLv(cat);if(l>=CRX_T.length-1)return 1;const a=CRX_T[l],b=CRX_T[l+1];return Math.min(1,(l+(n-a)/(b-a))/(CRX_T.length-1))}
function crPro(c){const ty=CG_TYPES[cgType(c)],sks=(ty&&ty.sk)||[];
 const M=Math.min(1,Math.sqrt(mastN(c.id)/CG_MAST_FULL)),X=crxFrac(crCat(c)),T=sks.length?sks.reduce((a,k)=>a+Math.min(TRAIN_MAX,sk(k)),0)/sks.length/TRAIN_MAX:0;
 const top=rankIdx(S.xp)>=RANKS.length-1,up=crimeUp(c)+(rankLevel(S.xp)-1)/(top?4/3:4),R=Math.min(1,up/3);
 const P=Math.round(Math.min(1,CG_W.M*M+CG_W.X*X+CG_W.T*T+CG_W.R*R)*1000)/1000;return {P,M,X,T,R,sks}}
const crP=c=>crPro(c).P;
// de dobbelsteen na het spel, in onderdelen (voor de kansopbouw op de kaart)
function crDiceParts(c,P){if(P==null)P=crP(c);const up=crimeUp(c),fx=k=>typeof fitFx==='function'?fitFx(k):0,heat=Math.floor(S.heat/4*Math.max(.4,1-up*.1));
 const E=[['uitrusting',gearBonus()],['outfit',fx('kans')],['familie',fam().chance],['vingervlugheid',S.skills.steal*(c.id==='zakken'?SK.steal.zakken:SK.steal.all)],
  ['ademhaling',sk('ademhaling')*SK.ademhaling.focus],['schieten',c.r>=HEAVY_R?sk('schiet')*SK.schiet.heavy:0],['focus',focusPct()]].filter(x=>x[1]>0);
 const w=Math.round((c.base-50)*CG_BASEK*10)/10,pro=Math.round(CG_D1*P*10)/10,raw=CG_D0+pro+w+E.reduce((a,x)=>a+x[1],0)-heat;
 return {raw,w,pro,E,heat,cap:chanceCap(c)}}
const crDice=c=>{const d=crDiceParts(c);return Math.max(5,Math.min(d.cap,Math.round(d.raw*(1+tierK()))))};
const crChance=c=>Math.max(1,Math.round(cgG(crP(c))*crDice(c)));
const crCanQuick=c=>true;
// overslaan (zonder spel): precies de kans die op de kaart staat. Altijd mogelijk; alleen de bonus voor een schone klus mis je.
const crQuick=c=>chance(c);
const crLootK=c=>1+CG_LOOT*Math.pow(crP(c),1.5);
const cgCleanK=miss=>miss==null?1:1+(CG_CLEAN[miss]||0);

// ---------- 2. model van een gemiddelde speler en de rekensom per poging ----------
// timing: drukfout ~ N(0, sig) s · reactie (iets opent onverwacht): N(rt, rts) s · keuze: N(mu, s) s plus kans e op een fout antwoord
const CG_HUM={sig:.07,rt:.55,rts:.12}; // reactietijd op een telefoon (zien + tikken), ruimer dan een labtest
const cgErfinv=x=>{const a=.147,l=Math.log(1-x*x),t=2/(Math.PI*a)+l/2;return Math.sign(x)*Math.sqrt(Math.sqrt(t*t-l/a)-t)};
const cgNinv=p=>Math.SQRT2*cgErfinv(2*Math.max(1e-6,Math.min(1-1e-6,p))-1);
// kans om het spel te halen bij kans p per poging: k keer goed voordat je meer dan m fouten maakt
function cgNB(p,k,m){let s=0,c=1;for(let j=0;j<=m;j++){if(j>0)c=c*(k-1+j)/j;s+=c*Math.pow(p,k)*Math.pow(1-p,j)}return s}
function cgSolve(G,k,m){let lo=.01,hi=.9999;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(cgNB(mid,k,m)<G)lo=mid;else hi=mid}return (lo+hi)/2}
const cgHalfWin=(p,sig)=>(sig||CG_HUM.sig)*Math.SQRT2*cgErfinv(Math.min(.9999,p));          // halve vensterbreedte in seconden
const cgReact=(p,mu,s)=>(mu==null?CG_HUM.rt:mu)+(s==null?CG_HUM.rts:s)*cgNinv(p);              // tijd die je krijgt om te reageren
const cgChoiceT=(p,mu,s,e)=>mu+s*cgNinv(Math.min(.999,p/(1-e)));                                  // tijd om te antwoorden
const cgU=(a,b)=>a+Math.random()*(b-a);
const cgPick=a=>a[Math.floor(Math.random()*a.length)];
const cgShuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const cgTri=x=>{x=((x%2)+2)%2;return x<1?x:2-x}; // 0→1→0, periode 2

// ---------- 3. de spellen ----------
// Elk type: n (naam), lbl (kort label op de kaart), ic (pictogram uit misdaden.js), sk (trainingen die meetellen), km(w) = [k, m],
// how (één regel uitleg), init(G) (venster uit G.p), tick(G,dt), press(G,a), time(G) (totale tijd), view: CG_VIEW (stage/ctl/paint).
// G.hint = hulp voor bots en de simulatie. Nieuwe spelsoorten (bellen, meekijken, alarm, keuren, uitkijken, volgen, nakijken)
// staan in crimegames2.js en worden daar aan CG_TYPES/CG_VIEW/CG_INFO toegevoegd.
const cgItem=(G,d)=>G.th.items?G.th.items[G.hits%G.th.items.length]:d;
const CG_TYPES={
 grab:{n:'Zakkenrollen',lbl:'Grijpen',ic:'wallet',sk:['steal','ademhaling'],kind:'react',km:w=>[4+Math.round(w),2],
  how:'Wacht tot hij wegkijkt en grijp dan meteen.',
  init(G){G.L=cgReact(G.p)*G.slow;G.ph='watch';G.pt=cgU(.8,1.6);G.wid=0},
  tick(G,dt){G.pt-=dt;if(G.pt<=0){if(G.ph==='watch'){G.ph='away';G.pt=G.L;G.wid++}else{G.ph='watch';G.pt=cgU(.8,1.6)}G.dirty=1}
   G.hint={kind:'react',id:G.wid,on:G.ph==='away'}},
  press(G){if(G.ph==='away'){G.ph='watch';G.pt=cgU(.8,1.6);G.hit(cgItem(G,'Gepakt'))}else G.bad('Hij keek')},
  time:G=>6+(G.k+G.m)*(1.2+G.L)},
 sneak:{n:'Sluipen',lbl:'Sluipen',ic:'camera',sk:['steal','speed'],kind:'timing',sig:.065,km:w=>[4+Math.round(w),2],
  how:'Pak zodra de lichtkegel van je spullen wegdraait.',
  init(G){G.Pd=(2.1+.7*(1-G.d))*G.slow;G.cw=.14;G.h=cgHalfWin(G.p,.07);G.t0=Math.random()*G.Pd;G.side=Math.random()<.5?0:1;G.grab=0;G.gT=0;this.place(G)},
  place(G){G.side=1-G.side;G.x=G.side?.94:.06;const onT=2*(Math.min(G.x,1-G.x)+G.cw)/(2/G.Pd);G.tau=Math.max(.3,G.Pd-onT-2*G.h);G.dirty=1},
  pos(G,t){return cgTri((t+G.t0)/(G.Pd/2))},
  on(G,t){return Math.abs(this.pos(G,t)-G.x)<G.cw},
  tick(G,dt){if(G.grab>0){G.grab-=dt;if(this.on(G,G.t)){G.grab=0;G.bad('In het licht');this.place(G)}else if(G.grab<=0){G.grab=0;G.hit(cgItem(G,'Gepakt'));this.place(G)}}
   // bot: wanneer verlaat de kegel je plek? (stap vooruit tot hij eraf is)
   let aim=null;if(!G.grab){if(!this.on(G,G.t))for(let s=.005;s<=G.h;s+=.005){if(this.on(G,G.t-s)){aim=G.h-s;break}} // net weg: nu nog binnen het venster
   if(aim==null){let t=G.t,was=this.on(G,t);for(let i=0;i<600;i++){t+=.01;const o=this.on(G,t);if(was&&!o){aim=t-G.t+G.h;break}was=o}}}
   G.hint={kind:'timing',aim}},
  press(G){if(G.grab>0)return;if(this.on(G,G.t)){G.bad('In het licht');this.place(G);return}G.grab=G.tau;G.gT=G.tau},
  time:G=>6+(G.k+G.m)*G.Pd*1.7},
 lock:{n:'Slot',lbl:'Slot',ic:'lock',sk:['sloten','ademhaling'],kind:'lock',km:w=>[3+Math.round(w),2],
  how:'Druk als de naald in het groen staat. Paniek vol? Eerst rustig ademen.'},
 safe:{n:'Kluis kraken',lbl:'Kluis',ic:'vault',sk:['sloten','ademhaling'],kind:'timing',sig:.08,km:w=>[4+Math.round(w),2],
  how:'Klik als de gloed rond de draaischijf het felst is.',
  init(G){G.om=(.26+.2*G.d)/G.slow;G.h=cgHalfWin(G.p,.08);G.hw=G.h*G.om;G.th0=Math.random();G.dir=1;G.code=[];this.next(G)},
  next(G){G.tg=((G.th0+G.dir*cgU(.35,.85))%1+1)%1;G.dirty=1},
  delta(G){let d=(G.tg-G.th0)*G.dir;d=((d%1)+1)%1;return d>.5?d-1:d}, // >0: nog te gaan
  tick(G,dt){G.th0=((G.th0+G.dir*G.om*dt)%1+1)%1;const d=this.delta(G);G.prox=Math.max(0,1-Math.abs(d)/.1);
   G.hint={kind:'timing',aim:(d>=0?d:d+1)/G.om}},
  press(G){const d=this.delta(G);if(Math.abs(d)<=G.hw){G.code.push(Math.round(G.tg*100)%100);G.dir=-G.dir;G.hit('Klik');if(!G.done)this.next(G)}else G.bad(d>0?'Te vroeg':'Te laat')},
  time:G=>5+(G.k+G.m)*(.75/G.om)},
 heist:{n:'Overval',lbl:'Overval',ic:'smash',sk:['schiet','ademhaling'],kind:'choice',mu:1.7,s:.4,e:[.015,.04],km:w=>[5+Math.round(2*w),2],
  how:'Er gebeurt steeds iets: druk op tijd de knop die erbij hoort.',
  init(G){G.acts=G.th.acts||CG_DEF.heist.acts;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=cgU(.9,1.3);G.qid=0;G.last=-1},
  tick(G,dt){if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=cgU(.8,1.2);G.dirty=1;G.bad('Te laat')}}
   else{G.gap-=dt;if(G.gap<=0){let a;do{a=Math.floor(Math.random()*4)}while(a===G.last);G.last=a;G.q={ans:a,left:G.Tc,id:++G.qid};G.dirty=1}}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:4}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>3)return;const ok=+a===G.q.ans,A=G.acts[G.q.ans];G.q=null;G.gap=cgU(.7,1.1);G.dirty=1;if(ok)G.hit(A[0]);else G.bad('Verkeerde knop')},
  time:G=>5+(G.k+G.m)*(G.Tc*.7+1.15)},
 talk:{n:'Gesprek',lbl:'Praten',ic:'handshake',sk:['charisma','handel'],kind:'choice',mu:2.9,s:.6,e:[.02,.05],km:w=>[3+Math.round(w),1],
  how:'Iemand zegt iets: kies het antwoord dat past.',
  init(G){G.set=CG_MOODS[G.th.set||'std'];G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=.6;G.qid=0;G.lastM=-1;G.said=null},
  tick(G,dt){if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=1;G.said={t:'…',ok:0};G.dirty=1;G.bad('Te lang gewacht')}}
   else{G.gap-=dt;if(G.gap<=0){let mi;do{mi=Math.floor(Math.random()*G.set.length)}while(mi===G.lastM&&G.set.length>1);G.lastM=mi;
    const opts=cgShuffle([mi].concat(cgShuffle(G.set.map((_,i)=>i).filter(i=>i!==mi)).slice(0,2))).map(m=>({m,say:cgPick(G.set[m][4])}));
    G.q={mood:mi,opts,ans:opts.findIndex(o=>o.m===mi),line:cgPick(G.set[mi][3]),left:G.Tc,id:++G.qid};G.said=null;G.dirty=1}}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:3}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>=G.q.opts.length)return;const o=G.q.opts[+a],ok=+a===G.q.ans,m=G.set[G.q.mood];G.q=null;G.gap=1.1;G.said={t:o.say,ok};G.dirty=1;if(ok)G.hit(m[5]||'Werkt');else G.bad(m[6]||'Verkeerde toon')},
  time:G=>4+(G.k+G.m)*(G.Tc*.75+1.3)},
 memory:{n:'Geheugen',lbl:'Onthouden',ic:'doc',sk:['charisma','rechten'],kind:'choice',mu:2.5,s:.5,e:[.02,.06],km:w=>[3+Math.round(w),1],
  how:'Onthoud de gegevens en beantwoord daarna de vragen.',
  init(G){const th=G.th,n=G.k+1;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;
   if(th.pool){const labs=cgShuffle(th.labels).slice(0,n),vals=cgShuffle(th.pool).slice(0,n);G.facts=labs.map((l,i)=>[l,vals[i],th.pool])}
   else G.facts=cgShuffle(th.facts).slice(0,n).map(f=>[f[0],cgPick(f[1]),f[1]]);
   G.show=(4+n*(1.6+.8*G.d))*G.slow;G.showT=G.show;G.order=cgShuffle(G.facts.map((_,i)=>i)).slice(0,G.k+G.m+1);G.oi=0;G.q=null;G.gap=0;G.qid=0;G.dirty=1},
  ask(G){const f=G.facts[G.order[G.oi++%G.order.length]],wrong=cgShuffle(f[2].filter(v=>v!==f[1])).slice(0,2),opts=cgShuffle([f[1]].concat(wrong));
   G.q={f,opts,ans:opts.indexOf(f[1]),left:G.Tc,id:++G.qid};G.dirty=1},
  tick(G,dt){if(G.show>0){G.show-=dt;if(G.show<=0){G.show=0;G.dirty=1;this.ask(G)}G.hint={kind:'choice',id:0,ans:null,n:3};return}
   if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=.9;G.dirty=1;G.bad('Te laat')}}else{G.gap-=dt;if(G.gap<=0)this.ask(G)}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:3}},
  press(G,a){if(G.show>0){if(a==='go'){G.show=0;G.dirty=1;this.ask(G)}return}if(!G.q||a==null||a==='go'||+a>=3)return;const ok=+a===G.q.ans;G.q=null;G.gap=.8;G.dirty=1;if(ok)G.hit('Klopt');else G.bad('Fout')},
  time:G=>3+G.show+(G.k+G.m)*(G.Tc*.75+1)},
 hack:{n:'Hacken',lbl:'Hacken',ic:'chip',sk:['hack'],kind:'choice',mu:1.15,s:.3,e:[.01,.03],km:w=>[8+Math.round(4*w),2],
  how:'Typ de code over voordat de trace-balk leeg is.',
  init(G){const ch='0123456789ABCDEF';G.code=Array.from({length:G.k},()=>ch[Math.floor(Math.random()*16)]).join('');G.i=0;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.left=G.Tc+1.2;G.qid=1;G.dirty=1},
  tick(G,dt){G.left-=dt;if(G.left<=0){G.left=G.Tc;G.qid++;G.dirty=1;G.bad('Te traag')}G.hint={kind:'choice',id:G.qid,ans:G.code[G.i],n:16}},
  press(G,a){if(a==null||a==='go')return;a=String(a).toUpperCase();if(!/^[0-9A-F]$/.test(a))return;G.qid++;G.left=G.Tc;G.dirty=1;if(a===G.code[G.i]){G.i++;G.hit(a)}else G.bad('Typfout')},
  time:G=>5+(G.k+G.m)*(G.Tc*.75+.3)},
 route:{n:'Route',lbl:'Route',ic:'truck',sk:['cars','speed'],kind:'react',km:w=>[5+Math.round(2*w),2],
  how:'Wissel op tijd naar de vrije baan.',
  init(G){G.lane=1;G.cp=null;G.gap=1;G.wid=0;G.scroll=0;G.cpW=cgReact(G.p,.95,.15)*G.slow},
  spawn(G){const free=cgPick([0,1,2].filter(l=>l!==G.lane)),nm=Math.abs(free-G.lane);G.cp={free,y:0,W:cgReact(G.p,.85+.3*(nm-1),.15)*G.slow,ctl:[0,1,2].map(()=>cgPick(G.th.ctl||['Controle']))};G.wid++;G.dirty=1},
  tick(G,dt){G.scroll+=dt;if(G.cp){G.cp.y+=dt/G.cp.W;if(G.cp.y>=1){const ok=G.lane===G.cp.free,nm=G.cp.ctl[G.lane];G.cp=null;G.gap=cgU(.6,1);G.dirty=1;if(ok)G.hit('Erdoor');else G.bad(nm+': stoppen')}}
   else{G.gap-=dt;if(G.gap<=0)this.spawn(G)}G.hint={kind:'react',id:G.cp?G.wid:0,on:!!G.cp,lane:G.lane,free:G.cp?G.cp.free:null}},
  press(G,a){if(a==='L'&&G.lane>0){G.lane--;G.dirty=1}else if(a==='R'&&G.lane<2){G.lane++;G.dirty=1}},
  time:G=>5+(G.k+G.m)*(2.3+G.cpW)},
 deal:{n:'Onderhandelen',lbl:'Dealen',ic:'chart',sk:['handel','charisma'],kind:'timing',km:w=>[4+Math.round(w),1],
  how:'Stop de wijzer in het groene stuk van de prijs.',
  init(G){G.v=(.35+.35*G.d)/G.slow;G.h=cgHalfWin(G.p);G.zw=G.h*G.v;G.ph0=Math.random()*2;this.next(G)},
  next(G){G.zc=cgU(.5,.82);G.dirty=1},
  x(G){return cgTri(G.ph0+G.t*G.v)},
  tick(G){const x=this.x(G);G.nx=x;// bot: tijd tot de naald het midden van het groene stuk raakt
   let aim=null;const P0=G.ph0+G.t*G.v;for(let i=1;i<400;i++){const t=i*.005;if(Math.abs(cgTri(P0+t*G.v)-G.zc)<.004){aim=t;break}}G.hint={kind:'timing',aim}},
  press(G){const x=this.x(G);if(Math.abs(x-G.zc)<=G.zw){G.hit((G.th.ok||'Deal'));this.next(G)}else{G.bad(x<G.zc?(G.th.lo||'Te goedkoop'):(G.th.hi||'Te duur'));this.next(G)}},
  time:G=>5+(G.k+G.m)*2.6/G.v},
 saw:{n:'Ritme',lbl:'Ritme',ic:'saw',sk:['conditie','steal'],kind:'timing',km:w=>[8+Math.round(3*w),2],
  how:'Druk telkens als het blad aan het eind van zijn slag is.',
  init(G){G.tb=(1-.35*G.d)*G.slow;G.h=cgHalfWin(G.p);G.ph0=Math.random()*.5;G.lastRev=-1},
  rev(G){const u=(G.t+G.ph0*G.tb)/G.tb;return Math.round(u)}, // dichtstbijzijnde omkeerpunt
  tick(G){const u=(G.t+G.ph0*G.tb)/G.tb;G.mx=cgTri(u);const nx=Math.ceil(u);let aim=(nx-u)*G.tb;if(nx===G.lastRev||aim<.02&&Math.round(u)===G.lastRev)aim+=G.tb;G.hint={kind:'timing',aim}},
  press(G){const u=(G.t+G.ph0*G.tb)/G.tb,r=Math.round(u),dt=Math.abs(u-r)*G.tb;if(dt<=G.h&&r!==G.lastRev){G.lastRev=r;G.hit(G.th.ok||'Slag')}else G.bad(r===G.lastRev?'Dubbel':'Uit de maat')},
  time:G=>4+(G.k+G.m)*G.tb*1.6}};

// stemmingen bij het gesprek: [naam, teken, aanpak, wat hij zegt, wat jij zegt, goed, fout]
const CG_MOODS={
 std:[['hebberig','€','Geld bieden',['Wat levert het mij op?','Dat is wel erg weinig.','Ik heb ook kosten, hè.','Voor dat bedrag sta ik niet eens op.'],
   ['Er zit een dikke envelop voor je in.','Noem je prijs.','Het dubbele. Contant.'],'Hij pakt het geld','Hij wil geld zien'],
  ['bang','!','Geruststellen',['Als dit uitkomt, ben ik alles kwijt.','Wie weet hier nog meer van?','Ik heb kinderen thuis.','En als de krant erachter komt?'],
   ['Niemand komt het ooit te weten.','Rustig. Ik regel het netjes.','Jouw naam valt nergens.'],'Hij ontspant','Hij wordt banger'],
  ['ijdel','★','Vleien',['Weet je wel wie ik ben?','Zonder mij gebeurt hier niks.','Ik doe dit al twintig jaar.','Ze zouden een standbeeld voor me moeten maken.'],
   ['Zonder jou lukt het niet.','Jij bent de enige die dit kan.','Iedereen heeft het over jou.'],'Hij glimt','Hij voelt zich gepasseerd'],
  ['koppig','✕','Druk zetten',['Nee. Ik doe het niet.','Zoek maar een ander.','Ik ben niet te koop.','Ga maar weg.'],
   ['Denk nog even heel goed na.','Ik vraag het niet nog een keer.','Het zou zonde zijn als er iets gebeurt.'],'Hij zwicht','Hij blijft koppig']],
 beg:[['meelevend','♥','Zielig verhaal',['Gaat het wel met je?','Wat is er gebeurd?','Heb je het koud?'],['Ik slaap al een week buiten…','Mijn tas is gestolen, alles kwijt.','Alleen voor een broodje, echt.'],'Ze geeft wat','Ze loopt door'],
  ['vrolijk','☺','Grapje maken',['Hé, mooie dag, hè!','Haha, jij weer.','Zo, lekker bezig?'],['Voor een euro dans ik.','Ik spaar voor een jacht.','Fooi voor de beste bedelaar?'],'Hij lacht en geeft','Hij lacht niet'],
  ['toerist','✈','In het Engels',['Sorry, no Dutch.','Excuse me?','Where is the Red Light?'],['Spare some change, my friend?','Welcome to Amsterdam!','One euro for directions?'],'Een euro erin','Ze snappen je niet'],
  ['gehaast','⏱','Kort en snel',['Ik moet mijn trein halen!','Geen tijd, sorry.','Ik ben al te laat.'],['Eén euro en ik ben weg.','Snel, voor je trein.','Kort: een euro?'],'Snel een munt','Hij rent door']]};
const CG_DEF={heist:{acts:[['Kassa','De la gaat open'],['Handen!','Iemand pakt zijn telefoon'],['Knop','Hand naar het alarm'],['Deur','Er komt iemand binnen']]}};
// Per klus: spel en thema. t = type, n = titel, who = wie er kijkt / met wie je praat, items = wat je pakt (op volgorde).
// De koppeling is zo verdeeld dat elk spel bij een handvol klussen hoort (hooguit 7).
const CG_OF={
 // grijpen
 zakken:{t:'grab',n:'Rugzak op de Dam',who:'Toerist',items:['Portemonnee','Telefoon','Paspoort','Zonnebril','Powerbank']},
 horloge:{t:'grab',n:'Patek op het terras',who:'Man met de Patek',items:['Hand schudden','Sluiting los','Van de pols','In je mouw','Doorlopen']},
 stadion:{t:'grab',n:'Kassa onder de tribune',who:'Kassamedewerker',items:['Bundel twintigjes','Zak munten','Envelop','Geldlade','Kluissleutel']},
 // sluipen
 winkeldief:{t:'sneak',n:'Schappen bij de drogist',who:'Camera',items:['Parfum','Scheermesjes','Tandenbleekset','Oordopjes','Zonnebrand']},
 kasteel:{t:'sneak',n:'Gangen van het kasteel',who:'De butler',items:['Kandelaar','Oude meester','Familiezilver','Snuifdoos','Tafelklok']},
 londen:{t:'sneak',n:'Vitrines in Londen',who:'Bewaker met zaklamp',items:['Vitrine open','Collier','Tiara','Broche','Oorbellen']},
 kroon:{t:'sneak',n:'De schatkamer',who:'Laserscanner',items:['Kroon','Scepter','Rijksappel','Zwaard','Ring']},
 // slot (lockgame.js)
 fiets:{t:'lock',n:'Kettingslot',sub:'Fiets bij het station'},scooter:{t:'lock',n:'Accuslot',sub:'Fatbike in het rek'},autokraak:{t:'lock',n:'Portierslot',sub:'Parkeergarage'},
 inbraak:{t:'lock',n:'Voordeur van de villa',sub:'Wassenaar'},parkeer:{t:'lock',n:'Portier van een leaseauto',sub:'Koplampen en airbags'},
 // kluis
 bank:{t:'safe',n:'Bankkluis'},diamant:{t:'safe',n:'Kluis op de beurs'},casino:{t:'safe',n:'Casinokluis'},centralebank:{t:'safe',n:'Kluis van de Centrale Bank'},
 goudreserve:{t:'safe',n:'Goudkluis'},
 // overval
 winkel:{t:'heist',n:'Achter de toonbank',acts:[['Kassa','De la gaat open'],['Handen!','Klant pakt zijn telefoon'],['Knop','Eigenaar reikt naar het alarm'],['Deur','Er komt iemand binnen']]},
 ramkraak:{t:'heist',n:'Negentig seconden',acts:[['Grijpen','Telefoons in het rek'],['Terug!','Beveiliger komt eraan'],['Rolluik','Het rolluik zakt'],['Motor','De bus slaat bijna af']]},
 juwelier:{t:'heist',n:'Dertig seconden',acts:[['Vitrine','Vitrine ligt open'],['Handen!','Verkoper beweegt'],['Knop','Voet naar het alarm'],['Uitkijk','Scooter van de wijkagent']]},
 transport:{t:'heist',n:'De gepantserde bus',acts:[['Kisten','Kluis gaat open'],['Wapen neer','Bewaker grijpt naar zijn holster'],['Zender','Noodzender knippert'],['Route','Politie op de scanner']]},
 jet:{t:'heist',n:'Aan boord',acts:[['Koffers','Koffers in het ruim'],['Zitten!','Passagier staat op'],['Transponder','Transponder gaat aan'],['Cockpit','Piloot twijfelt']]},
 // gesprek
 bedelen:{t:'talk',n:'Een bekertje bij Centraal',who:'Voorbijganger',set:'beg'},
 snackbar:{t:'talk',n:'Even praten met de eigenaar',who:'Snackbarbaas'},
 havenbaas:{t:'talk',n:'Koffie op de kade',who:'De havenbaas'},matchfix:{t:'talk',n:'In de spelersbus',who:'De keeper'},
 rechter:{t:'talk',n:'In de raadkamer',who:'De rechter'},minister:{t:'talk',n:'Lunch in Den Haag',who:'De lobbyist'},kartelvrede:{t:'talk',n:'Aan het hoofd van de tafel',who:'De kartelbaas'},
 // bellen en appen (crimegames2.js)
 telefoon:{t:'call',n:'Aan de lijn',set:'bank'},fruitautomaat:{t:'call',n:'Een appje aan "mam"',set:'mam'},deurbel:{t:'call',n:'De bank belt jou',set:'mule'},
 afpersing:{t:'call',n:'Het telefoontje',set:'chantage'},webshop:{t:'call',n:'Klantenservice',set:'shop'},
 // onthouden (papierspoor)
 scheepswerf:{t:'memory',n:'Twee kopers, één jacht',q:'De tweede koper vraagt: {l}?',facts:[['Naam van het jacht',['Bella Vita','Sea Breeze','Lady M','Nomad','Aurora','Blue Pearl']],['Thuishaven',['Monaco','Antibes','Palma','Porto Cervo','Marbella']],['Oplevering',['maart','juni','augustus','oktober','december']],['Lengte',['62 meter','70 meter','78 meter','85 meter','91 meter']],['Aanbetaling',['€4 mln','€6 mln','€9 mln','€12 mln','€15 mln']]]},
 kaaiman:{t:'memory',n:'De stichting op papier',q:'De notaris vraagt: {l}?',facts:[['Naam stichting',['Helping Hands','Blue Ocean Fund','Stichting Zonlicht','Hope Foundation','Kids First']],['Stroman',['meneer Ebanks','mevrouw Bodden','meneer McLaughlin','mevrouw Rivers']],['Bank',['Cayman National','Butterfield','Island Trust','Harbour Bank']],['Rekening',['KY-4471','KY-9023','KY-1186','KY-7730','KY-5562']],['Doel op papier',['Schoolboeken','Waterputten','Dierenasiel','Sportveld']]]},
 wereldbank:{t:'memory',n:'Het land dat niet bestaat',q:'De bankdirecteur vraagt: {l}?',facts:[['Land',['Valdoria','Morvia','Esteral','Kel Maran']],['Hoofdstad',['Port Selen','Varnaburg','Ostrava Nova','Santa Lira']],['Munt',['Valdo','Morvische kroon','Esterreal','Selen']],['Project',['Een stuwdam','Een snelweg','Een haven','Een luchthaven']],['Bedrag',['€120 mln','€180 mln','€240 mln','€310 mln']]]},
 satelliet:{t:'memory',n:'Het schriftje',q:'Waar moet het geld van {l} heen?',labels:['Yusuf','Mehmet','Anil','Reza','Samir','Tariq'],pool:['Dubai','Istanbul','Lahore','Casablanca','Paramaribo','Mumbai']},
 // nakijken (crimegames2.js)
 witwas:{t:'check',n:'De boekhouding klopt',set:'factuur'},bouwfraude:{t:'check',n:'Controle op de bouw',set:'bouw'},aanbesteding:{t:'check',n:'De offerte',set:'offerte'},
 // hacken
 tickets:{t:'hack',n:'QR-code nabouwen',what:'Code van het polsbandje'},datalek:{t:'hack',n:'Server van de verzekeraar',what:'Wachtwoord van de beheerder'},
 cryptobeurs:{t:'hack',n:'De hot wallet',what:'Privésleutel'},renbaan:{t:'hack',n:'Gokwebsite in de lucht',what:'Sleutel van de betaalserver'},
 // meekijken (crimegames2.js)
 pand:{t:'peek',n:'Alarmpaneel bij de ingang',who:'De schoonmaker'},garagebox:{t:'peek',n:'Het sleutelkastje',who:'De huurder van box 112'},geneve:{t:'peek',n:'De toegangspoort',who:'De bewaker'},
 // alarm (crimegames2.js)
 apotheek:{t:'wire',n:'Alarmkast in de gang',labels:['SIRENE','LAMP','BEL','GSM']},kunst:{t:'wire',n:'Alarm van zaal 7',labels:['DEUR','LIJST','LASER','CAMERA']},
 stroom:{t:'wire',n:'Kabel onder de stoep',labels:['METER','FASE','NUL','AARDE'],verb:'Tap af'},
 // route
 envelop:{t:'route',n:'Door Noord',veh:'bike',ctl:['Wijkagent','Camera','Handhaving']},smokkel:{t:'route',n:'De containerterminal',veh:'truck',ctl:['Scanner','Douane','Hond']},
 wapenlading:{t:'route',n:'Grens bij Venlo',veh:'truck',ctl:['Grenscontrole','Weegbrug','Marechaussee']},jacht:{t:'route',n:'Koers naar de baai',veh:'boat',water:1,ctl:['Kustwacht','Radar','Douaneboot']},
 tanker:{t:'route',n:'Koers langs de kust',veh:'boat',water:1,ctl:['Marine','Kustwacht','Radar']},
 // volgen (crimegames2.js)
 container:{t:'follow',n:'Kade 7',obj:'container',N:3},goud:{t:'follow',n:'Tussen de vrachtvliegtuigen',obj:'pallet',N:3},rotterdam:{t:'follow',n:'Maasvlakte',obj:'container',N:4},
 // keuren (crimegames2.js)
 drukkerij:{t:'sort',n:'Drukgang',set:'note'},vrachtwagen:{t:'sort',n:'Achter het zeil',set:'lading'},rivaal:{t:'sort',n:'Loods van de rivaal',set:'loods'},
 // uitkijken (crimegames2.js)
 spuiten:{t:'lookout',n:'Muur in de wijk',set:'tag'},flessen:{t:'lookout',n:'Achter de supermarkt',set:'krat'},pakket:{t:'lookout',n:'Stoep vol dozen',set:'pakket'},
 // dealen
 heling:{t:'deal',n:'Koper op Marktplaats',lo:'Te goedkoop',hi:'Te duur',ok:'Verkocht'},veiling:{t:'deal',n:'De hamer valt',lo:'Te vroeg',hi:'Te hoog',ok:'Verkocht'},
 gokhal:{t:'deal',n:'De pot',lo:'Te weinig',hi:'Te veel',ok:'Mooie pot'},voorkennis:{t:'deal',n:'Verkopen op de top',lo:'Te vroeg',hi:'Te laat',ok:'Verkocht',chart:1},
 olympisch:{t:'deal',n:'Twintig appartementen',lo:'Te goedkoop',hi:'Te hoog',ok:'Getekend'},
 // ritme
 koper:{t:'saw',n:'Kabel knippen',ok:'Knip'},katalysator:{t:'saw',n:'Onder de auto',ok:'Zaag'}};
const cgType=c=>(CG_OF[c.id]&&CG_OF[c.id].t)||'grab';
const cgTheme=c=>CG_OF[c.id]||{t:'grab',n:c.n};
const cgW=c=>Math.min(1,(c.r||0)/(RANKS.length-1));
// voor de oefenstand: een klus van elk type om het thema van te lenen
const cgSample=t=>{const id=Object.keys(CG_OF).find(k=>CG_OF[k].t===t);return CRIMES.find(c=>c.id===id)};

// ---------- uitleg vooraf (per spel) ----------
// Kort: doel in één regel (chips), hooguit drie stappen van één regel en de bediening in een paar woorden. De tijd loopt pas
// na Start (en een korte 3-2-1). {who} wordt het thema (bv. "Toerist").
const CG_TAP='ontouchstart' in window||navigator.maxTouchPoints>0;
// bediening: [tik, toetsenbord]
const CG_CTL={one:['Tik op de knop','spatie'],four:['Tik een knop','toetsen 1–4'],three:['Tik je antwoord','toetsen 1–3'],
 hex:['Tik de tekens','typ 0–9, A–F'],lr:['Tik links of rechts','← →'],pad:['Tik de cijfers','cijfertoetsen'],two:['Tik een knop','← →'],
 spot:['Tik op de plek','toetsen 1–4'],slot:['Tik er een aan','toetsen 1–4'],field:['Tik het vakje','toetsen 1–4']};
const CG_INFO={
 grab:{noun:'grijpen',ctl:'one',steps:['Rood: {who} kijkt. Wacht.','Groen: grijp meteen.','Te vroeg of te laat telt als fout.']},
 sneak:{noun:'pakken',ctl:'one',steps:['De lichtkegel zwaait heen en weer.','Pak net als hij van je spullen wegdraait.','De ring moet vol zijn voor het licht terug is.']},
 safe:{noun:'getallen',ctl:'one',steps:['De schijf draait vanzelf.','Klik als de gloed het felst is.','Daarna draait hij de andere kant op.']},
 heist:{noun:'goed',ctl:'four',steps:['Lees wat er gebeurt.','Druk de knop die erbij hoort.','De balk is je tijd.']},
 talk:{noun:'goed',ctl:'three',steps:['{who} zegt iets.','Kies wat je terugzegt.','Geld, geruststellen, vleien of druk: wat past?']},
 memory:{noun:'goed',ctl:'three',steps:['Onthoud de gegevens.','Daarna komen de vragen.','Kies het juiste antwoord.']},
 hack:{noun:'tekens',ctl:'hex',steps:['Typ de code over.','Elk teken heeft zijn eigen tijd.','Een typfout telt als fout.']},
 route:{noun:'erdoor',ctl:'lr',steps:['Er komen controles op je af.','Ga op tijd naar de vrije baan.']},
 deal:{noun:'deals',ctl:'one',steps:['De wijzer schuift over de prijs.','Stop hem in het groene stuk.','Links te goedkoop, rechts te duur.']},
 saw:{noun:'slagen',ctl:'one',steps:['Het blad gaat heen en weer.','Druk als het aan het eind van de slag is.','Eén keer per slag.']},
 lock:{noun:'pinnen',ctl:'one',steps:['Druk als de naald in het groen staat.','Mis je, dan stijgt je paniek.','Paniek vol? Tik als de cirkel het grootst is.']}};
const CG_SI={ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',no:'<path d="M6 6l12 12M18 6L6 18"/>',time:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 tap:'<path d="M9 11V5.5a1.5 1.5 0 013 0V10m0 0V8.5a1.5 1.5 0 013 0V11m0 0a1.5 1.5 0 013 0v3.5a6 6 0 01-6 6h-1a5.5 5.5 0 01-4.6-2.5L4.5 14a1.5 1.5 0 012.3-1.9L9 14"/>',
 key:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7.5 14h9"/>'};
const cgSi=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CG_SI[k]}</svg>`;
// het uitlegscherm. I = {title, tag, type, who, k, m, sec}. onGo wordt aangeroepen na Start + 3-2-1.
function cgIntro(box,I,onGo){const inf=CG_INFO[I.type]||{steps:[],ctl:'one'},c=CG_CTL[inf.ctl]||CG_CTL.one,who=cgEsc(I.who||'het doelwit');
 const el=document.createElement('div');el.className='cg-in';el.setAttribute('role','group');el.setAttribute('aria-label','Uitleg');
 const goal=I.goal||[`${cgSi('ok')}<b>${I.k}×</b> ${cgEsc(inf.noun||'goed')}`,`${cgSi('no')}<b>${I.m}</b> fout${I.m===1?'':'en'} mag`,`${cgSi('time')}<b>${I.sec}</b> s`];
 el.innerHTML=`<div class="cg-in-c"><span class="cg-in-tag">${cgEsc(I.tag||'')}</span><h3>${cgEsc(I.title||'')}</h3>
  <ul class="cg-in-goal" aria-label="Doel">${goal.map(g=>`<li>${g}</li>`).join('')}</ul>
  <ol class="cg-in-steps">${inf.steps.slice(0,3).map(x=>`<li><span>${x.replace(/\{who\}/g,'<b>'+who+'</b>')}</span></li>`).join('')}</ol>
  <p class="cg-in-ctl">${cgSi('tap')}<span>${c[0]}</span>${CG_TAP?'':`${cgSi('key')}<span>${c[1]}</span>`}</p>
  <div class="cg-in-bt${I.onSkip?' two':''}"><button type="button" class="btn lk-go cg-in-go">Start<small>${CG_TAP?'tijd loopt na start':'spatie · tijd loopt na start'}</small></button>${I.onSkip?`<button type="button" class="btn ghost cg-in-skip">Overslaan<small>${I.skipCh}% kans</small></button>`:''}</div></div>`;
 box.appendChild(el);let gone=false;const btn=el.querySelector('.cg-in-go'),sk=el.querySelector('.cg-in-skip');
 // overslaan: geen spel, je gooit met de kans die bij de klus staat (act.crime → crimeResolve quick)
 if(sk)sk.addEventListener('click',()=>{if(gone)return;gone=true;document.removeEventListener('keydown',key,true);I.onSkip()});
 const go=()=>{if(gone)return;gone=true;document.removeEventListener('keydown',key,true);el.classList.add('out');setTimeout(()=>el.remove(),180);cgCount(box,onGo)};
 const key=e=>{if(e.code==='Space'||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)go()}};
 document.addEventListener('keydown',key,true);btn.addEventListener('click',go);setTimeout(()=>{try{btn.focus({preventScroll:true})}catch(e){}},60);return {go}}
// 3-2-1 boven het speelveld
function cgCount(box,onGo){const st=box.querySelector('.jb-stage');const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!st){onGo();return}const el=document.createElement('div');el.className='cg-cnt';st.appendChild(el);let n=3;
 const step=()=>{if(n===0){el.remove();onGo();return}el.innerHTML=`<b>${n}</b>`;try{if(window.SFX&&SFX.tick)SFX.tick()}catch(e){}n--;setTimeout(step,reduce?380:450)};step()}

// ---------- 4. het spel spelen ----------
function cgNew(type,P,w,th,tgt){const T=CG_TYPES[type],[k,m]=T.km(w||0),p=cgSolve(tgt!=null?tgt:cgG(P),k,m);
 const G={type,P,d:1-P,w:w||0,k,m,p,hits:0,miss:0,t:0,done:false,th:th||{},slow:1,dirty:1,fx:null,e:T.e?T.e[0]+T.e[1]*(1-P):0};
 G.hit=lbl=>{if(G.done)return;G.hits++;G.fx={ok:1,txt:lbl,t:G.t};G.dirty=1;if(G.onFx)G.onFx(true);if(G.hits>=G.k)G.end(true)};
 G.bad=why=>{if(G.done)return;G.miss++;G.fx={ok:0,txt:why,t:G.t};G.dirty=1;if(G.onFx)G.onFx(false);if(G.miss>G.m)G.end(false,why)};
 G.end=(ok,why)=>{if(G.done)return;G.done=true;G.ok=ok;G.why=why||''};
 return G}
// tijd: ruim genoeg voor een gemiddelde speler; op = mislukt
function cgTime(G){const T=CG_TYPES[G.type];return T.time?T.time(G):20}
// toetsenbord → actie (null = niets). Cijfers werken bij keuzespellen, maar staan niet op de knoppen.
function cgKey(type,G,e){const k=e.key,T=CG_TYPES[type],V=CG_VIEW[type];if(V.key){const a=V.key(G,k,e);if(a!==undefined)return a}
 if(/^[1-9]$/.test(k)&&T.kind==='choice'&&type!=='hack')return +k-1;
 if(type==='route'&&(k==='ArrowLeft'||k==='a'||k==='A'))return 'L';
 if(type==='route'&&(k==='ArrowRight'||k==='d'||k==='D'))return 'R';
 if(type==='hack'&&/^[0-9a-fA-F]$/.test(k))return k;
 return null}
// spel voor een klus (of oefenen: c = null, P en type gegeven). Geeft {ok, miss, why}
// Gewonnen = gelukt: bij een echte klus is het spel zelf de hele kans (spel × dobbelsteen), dus geen extra worp achteraf.
const cgTarget=(c,P,o)=>o.tgt!=null?o.tgt:(c&&!o.practice&&o.P==null&&typeof crDice==='function')?Math.max(.05,Math.min(.99,cgG(P)*Math.min(chanceCap(c),crDice(c))/100)):null;
async function cgPlay(c,o){o=o||{};const type=o.type||cgType(c),P=o.P!=null?o.P:crP(c),w=o.w!=null?o.w:cgW(c),th=o.th||cgTheme(c),tgt=cgTarget(c,P,o);
 if(type==='lock')return cgLock(c,P,w,th,Object.assign({},o,{tgt}));
 const T=CG_TYPES[type],G=cgNew(type,P,w,th,tgt),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;G.slow=reduce?1.15:1;G.reduce=!!reduce;T.init(G);G.T=cgTime(G);G.c=c;G.practice=!!o.practice;
 return new Promise(resolve=>{window.__chase=true;window.__cg=G;
  const ov=cgOverlay(G,o),stage=ov.querySelector('#cgStage'),ctl=ov.querySelector('#cgCtl'),tim=ov.querySelector('#cgTime');
  let raf=0,last=0,started=false,intro=null;
  const snd=k=>{try{if(window.SFX&&SFX[k])SFX[k]()}catch(e){}};
  G.onFx=ok=>{snd(ok?'click':'tick');paintLives();const st=ov.querySelector('.cg-stage');if(st&&!ok&&!reduce){st.classList.remove('cg-shake');void st.offsetWidth;st.classList.add('cg-shake')}};
  const paintLives=()=>{const l=ov.querySelector('#cgLives');if(l)l.innerHTML=Array.from({length:G.m+1},(_,i)=>`<i class="${i<G.miss?'x':''}"></i>`).join('');
   const pr=ov.querySelector('#cgProg');if(pr)pr.innerHTML=Array.from({length:G.k},(_,i)=>`<i class="${i<G.hits?'on':''}"></i>`).join('')};
  const V=CG_VIEW[type];
  const press=a=>{if(G.done||!started)return;T.press(G,a);if(G.done)finish()};
  const begin=()=>{started=true;G.dirty=1;snd('click')};
  const key=e=>{if(e.repeat)return;const k=e.key;
   if(e.code==='Space'||k==='Enter'){e.preventDefault();if(!started)return;if(V.space){const a=V.space(G);if(a!=null)press(a)}return}
   if(k==='Escape'){e.preventDefault();return}
   if(!started)return;const a=cgKey(type,G,e);if(a!=null){e.preventDefault();press(a)}};
  document.addEventListener('keydown',key);
  ov.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-a]');if(b&&!b.disabled){e.preventDefault();const v=b.dataset.a;press(v==='go'?'go':/^\d+$/.test(v)?+v:v);return}
   if(e.target.closest('.cg-in'))return;if(e.target.closest('.cg-stage')){e.preventDefault();if(!started)return;
    if(type==='route'){const r=stage.getBoundingClientRect();press(e.clientX<r.left+r.width/2?'L':'R')}else if(V.space&&V.tapStage!==false){const a=V.space(G);if(a!=null)press(a)}}});
  const finish=()=>{if(finish.d)return;finish.d=1;G.done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);
   const box=ov.querySelector('.cg-box');box.classList.add(G.ok?'won':'lost');
   stage.insertAdjacentHTML('beforeend',`<div class="cg-end ${G.ok?'won':'lost'}"><b>${G.ok?(G.miss?'Gelukt':'Schone klus'):'Betrapt'}</b><span>${G.ok?(G.miss?G.miss+' fout'+(G.miss>1?'en':''):'Geen fout: extra buit'):cgEsc(G.why||'De tijd is op')}</span></div>`);
   ctl.innerHTML='';snd(G.ok?'win':'lose');window.__cg=null;
   setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve({ok:!!G.ok,miss:G.miss,why:G.why||'De tijd was op.',hits:G.hits})},200)},G.ok?850:1250)};
  stage.innerHTML=V.stage(G);ctl.innerHTML=V.ctl(G);paintLives();
  const onSkip=o.skip&&!o.practice?()=>{G.done=true;finish.d=1;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);window.__cg=null;ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve({skip:true})},150)}:null;
  intro=cgIntro(ov.querySelector('.cg-box'),{type,title:th.n||T.n,who:th.who||(V.who&&V.who(G)),tag:(o.practice?'Oefenen · ':'')+T.n+' · '+cgLvName(G.P),k:G.k,m:G.m,sec:Math.round(G.T),onSkip,skipCh:o.skip},begin);
  const tick=t=>{if(G.done){finish();return}const dt=Math.min(.05,(t-last)/1000);last=t;
   if(started){G.t+=dt;T.tick(G,dt);if(G.t>=G.T&&!G.done)G.end(false,th.timeout||'De tijd is op');
    const left=Math.max(0,1-G.t/G.T);tim.style.width=(left*100).toFixed(1)+'%';tim.classList.toggle('hot',left<.25)}
   V.paint(G,ov);G.dirty=0;if(G.done){finish();return}raf=requestAnimationFrame(tick)};
  V.paint(G,ov);raf=requestAnimationFrame(t=>{last=t;tick(t)})})}
const cgEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function cgOverlay(G,o){const T=CG_TYPES[G.type],th=G.th,ov=document.createElement('div');ov.className='chase-ov jb-ov lk-ov cg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','cgT');
 const lv=Math.min(5,1+Math.floor((1-G.P)*4.99));
 ov.innerHTML=`<div class="jb-box lk-box cg-box cgt-${G.type}"><div class="jb-top"><div class="jb-tt"><h2><span id="cgT">${cgEsc(o.title||th.n||T.n)}</span><span class="jb-lv lv${lv}">${o.practice?'Oefenen · ':''}${T.lbl} · ${cgLvName(G.P)}</span></h2><p id="cgSub">${cgEsc(o.sub||(G.c?G.c.n:'Telt niet mee'))}</p></div>
  <div class="lk-meters cg-meters"><div class="lk-m"><span class="label">Fouten</span><div class="cg-lives" id="cgLives"></div></div><div class="lk-m lk-m-t"><span class="label">Tijd</span><div class="lk-bar t"><i id="cgTime" style="width:100%"></i></div></div></div></div>
  <div class="cg-prog" id="cgProg" aria-label="Voortgang"></div>
  <div class="jb-stage lk-stage cg-stage" id="cgStage"></div><div class="jb-ctl cg-ctl" id="cgCtl"></div></div>`;
 document.body.appendChild(ov);return ov}
// het bestaande slot (lockgame.js) met moeilijkheid uit P; pinnen naar de zwaarte van de klus
function cgLockP(P,w,tgt){const d=1-P,pins=5+Math.round(w*2),p=cgSolve(tgt!=null?tgt:cgG(P),pins,2),speed=.42+.38*d,h=cgHalfWin(p)*CG_LOCK_K,zone=Math.min(.6,2*h*speed);
 const ad=sk('ademhaling'),k=kalmLv();
 return {d,pins,zone,speed,panicRate:(.02+.035*d)*kalmPanic(),panicMiss:(10+8*d)*kalmPanic(),breathTol:Math.min(.42,.18+.05*(1-d)+SK.ademhaling.adem*ad+k*.012),breathN:3,time:7+pins*2.6,
  maxMiss:2,label:'Slot · '+cgLvName(P)}}
const CG_LOCK_K=1; // correctie na simulatie (zie scripts in de rapportage)
async function cgLock(c,P,w,th,o){if(typeof lockGame!=='function')return {ok:true,miss:0};const LP=cgLockP(P,w,o.tgt),st={misses:0};
 const ok=await lockGame(LP,{intro:{type:'lock',title:o.title||th.n||'Slot',tag:(o.practice?'Oefenen · ':'')+'Slot · '+cgLvName(P),k:LP.pins,m:LP.maxMiss,sec:Math.round(LP.time),skipCh:o.practice?0:o.skip},
  title:o.title||th.n||'Slot',sub:o.sub||th.sub||(c?c.n:''),onEnd:x=>Object.assign(st,x)});
 if(ok==='skip')return {skip:true};
 return {ok:!!ok,miss:Math.min(2,st.misses||0),why:ok?'':'Het slot ging niet open.'}}

// ---------- 5. tekeningen (SVG) per spel ----------
// de eerste achtergrond-rect loopt door buiten de viewBox, zodat een hoog speelveld geen lege balken krijgt (svg overflow: visible)
const CG_SVG=(inner,cls,ar)=>`<svg class="cg-svg ${cls||''}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid ${ar||'meet'}" aria-hidden="true">${inner.replace(/<rect (x="0" )?width="400" height="240"/,'<rect x="-600" y="-600" width="1600" height="1440"')}</svg>`;
function cgFxPaint(G,ov){const el=ov.querySelector('#cgFx');if(!el)return;const on=G.fx&&G.t-G.fx.t<.9;if(!on){if(el._on){el.className='cg-fx';el._on=0}return}
 if(el._k!==G.fx){el._k=G.fx;el.textContent=G.fx.txt;el.className='cg-fx show '+(G.fx.ok?'ok':'no');el._on=1}}
const cgBtn=(a,html,cls,attr)=>`<button type="button" class="btn cg-b ${cls||''}" data-a="${a}"${attr||''}>${html}</button>`;
const cgBig=(lbl)=>cgBtn('go',`${lbl}<small>${CG_TAP?'of tik op het beeld':'spatie'}</small>`,'lk-go cg-big');
const cgFxEl='<div class="cg-fx" id="cgFx" aria-live="polite"></div>';
const CG_VIEW={
 grab:{space:()=>'go',
  stage:G=>CG_SVG(`<defs><linearGradient id="cgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f2b"/><stop offset="1" stop-color="#0b0d12"/></linearGradient></defs>
   <rect width="400" height="240" fill="url(#cgSky)"/><path d="M0 150V70h30v-20h26v28h22V40h34v40h18V58h30v92zM250 150V64h24V44h30v30h22V52h36v28h38v70z" fill="#141821"/>
   <g fill="#ffd166" opacity=".35"><rect x="40" y="86" width="6" height="8"/><rect x="92" y="60" width="6" height="8"/><rect x="104" y="96" width="6" height="8"/><rect x="262" y="80" width="6" height="8"/><rect x="316" y="70" width="6" height="8"/><rect x="352" y="100" width="6" height="8"/></g>
   <rect x="-600" y="150" width="1600" height="700" fill="#101318"/><path d="M0 150h400" stroke="#2b3038"/>
   <g id="cgMark" transform="translate(200 0)"><ellipse cx="0" cy="226" rx="46" ry="6" fill="#000" opacity=".5"/><rect x="-30" y="118" width="60" height="100" rx="18" fill="#3a4250"/><rect x="-24" y="128" width="48" height="58" rx="10" fill="#c0563a" id="cgPack"/><rect x="-14" y="150" width="28" height="20" rx="4" fill="#8f3a26"/>
    <g id="cgHead"><circle cx="0" cy="98" r="22" fill="#d9a77c"/><path d="M-22 92a22 22 0 0144 0z" fill="#3b2a1e"/><g id="cgEyes"><circle cx="-8" cy="100" r="3" fill="#111"/><circle cx="8" cy="100" r="3" fill="#111"/></g></g>
    <path id="cgCone" d="M0 98L-120 30L120 30z" fill="#ff3d52" opacity=".18"/></g>
   <g id="cgHand" transform="translate(110 200)"><path d="M0 0c10-16 26-22 40-18l30 8c6 2 6 9 0 10l-22 2 26 6c6 2 5 10-1 10L22 24C10 24 2 16 0 0z" fill="#e6b48a" stroke="#8a5a3a" stroke-width="2"/></g>
   <text id="cgState" x="200" y="26" text-anchor="middle" class="cg-st">KIJKT</text>`)+cgFxEl+'<div class="cg-who">'+cgEsc(G.th.who||'')+'</div>',
  ctl:()=>cgBig('Grijp'),
  paint(G,ov){const away=G.ph==='away',st=ov.querySelector('#cgState'),cone=ov.querySelector('#cgCone'),eyes=ov.querySelector('#cgEyes'),head=ov.querySelector('#cgHead'),hand=ov.querySelector('#cgHand');
   if(st){st.textContent=away?'NU!':'KIJKT';st.setAttribute('class','cg-st '+(away?'go':'no'))}
   if(cone)cone.setAttribute('d',away?'M0 98L190 60L190 140z':'M0 98L-120 30L120 30z'),cone.setAttribute('fill',away?'#3fe395':'#ff3d52');
   if(eyes)eyes.setAttribute('transform',away?'translate(14 0)':'');if(head)head.setAttribute('transform',away?'rotate(12 0 98)':'');
   if(hand){const r=G.fx&&G.fx.ok&&G.t-G.fx.t<.35?1:0;hand.setAttribute('transform',`translate(${110+r*40} ${200-r*40})`)}cgFxPaint(G,ov)}},
 sneak:{space:()=>'go',
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0d1015"/><g id="cgShelves">${[0,1,2].map(r=>`<rect x="14" y="${78+r*50}" width="372" height="6" fill="#2b3038"/>`).join('')}
   ${Array.from({length:18},(_,i)=>`<rect x="${20+(i%9)*41}" y="${54+Math.floor(i/9)*50}" width="${18+(i*7)%14}" height="${18+(i*5)%8}" rx="2" fill="${['#3a4b6a','#6a3a4b','#3a6a5b','#6a5b3a'][i%4]}" opacity=".55"/>`).join('')}</g>
   <g id="cgCam"><rect x="190" y="4" width="20" height="10" fill="#555c66"/><rect x="194" y="12" width="12" height="10" rx="2" fill="#2b3038"/><circle cx="200" cy="22" r="3" fill="#ff3d52" id="cgCamDot"/></g>
   <path id="cgCone" d="" fill="#fff6c8" opacity=".16"/>
   <g id="cgItem"><circle r="22" fill="none" stroke="#2b3038" stroke-width="5"/><circle id="cgRing" r="22" fill="none" stroke="#3fe395" stroke-width="5" stroke-dasharray="138.2" stroke-dashoffset="138.2" transform="rotate(-90)"/><rect x="-9" y="-11" width="18" height="22" rx="3" fill="#ffd166"/></g>`)+cgFxEl+'<div class="cg-who">'+cgEsc(G.th.who||'')+'</div><div class="cg-tag" id="cgTag"></div>',
  ctl:()=>cgBig('Pak'),
  paint(G,ov){const T=CG_TYPES.sneak,pos=T.pos(G,G.t),cx=14+pos*372,on=T.on(G,G.t),ix=14+G.x*372,iy=200;
   const cone=ov.querySelector('#cgCone');if(cone){cone.setAttribute('d',`M200 22L${cx-G.cw*372} 236L${cx+G.cw*372} 236Z`);cone.setAttribute('fill',on?'#ff3d52':'#fff6c8');cone.setAttribute('opacity',on?'.28':'.16')}
   const it=ov.querySelector('#cgItem');if(it)it.setAttribute('transform',`translate(${ix} ${iy})`);
   const ring=ov.querySelector('#cgRing');if(ring)ring.setAttribute('stroke-dashoffset',(138.2*(G.grab>0?G.grab/G.gT:1)).toFixed(1));
   if(G.dirty){const tg=ov.querySelector('#cgTag');if(tg){tg.textContent=cgItem(G,'');tg.style.left=(G.x*100).toFixed(1)+'%';tg.classList.toggle('r',G.x>.5)}}
   cgFxPaint(G,ov)}},
 safe:{space:()=>'go',
  stage:G=>{const ticks=Array.from({length:100},(_,i)=>{const a=i/100*Math.PI*2,r1=i%10?86:80;return `<line x1="${(Math.sin(a)*r1).toFixed(1)}" y1="${(-Math.cos(a)*r1).toFixed(1)}" x2="${(Math.sin(a)*92).toFixed(1)}" y2="${(-Math.cos(a)*92).toFixed(1)}" stroke="${i%10?'#5b626d':'#c9d1da'}" stroke-width="${i%10?1:2}"/>${i%10?'':`<text x="${(Math.sin(a)*68).toFixed(1)}" y="${(-Math.cos(a)*68+4).toFixed(1)}" text-anchor="middle" class="cg-num">${i}</text>`}`}).join('');
   return CG_SVG(`<rect width="400" height="240" fill="#0b0d10"/><rect x="60" y="6" width="280" height="228" rx="14" fill="#1a1d23" stroke="#2b3038" stroke-width="2"/>
    <circle cx="200" cy="124" r="104" fill="#121419" stroke="#3a404a" stroke-width="3"/><g id="cgDial" transform="translate(200 124)"><circle r="96" fill="#20242b" stroke="#4a515c"/>${ticks}<circle r="30" fill="#2b3038" stroke="#5b626d"/><rect x="-4" y="-30" width="8" height="18" rx="2" fill="#5b626d"/></g>
    <circle id="cgRim" cx="200" cy="124" r="101" fill="none" stroke="#ffd166" stroke-width="7" opacity="0"/><path d="M200 14l-8-12h16z" fill="#ffd166"/>`)+'<div class="cg-feel"><span>Gevoel</span><i><i id="cgFeel"></i></i></div>'+cgFxEl+'<div class="cg-code" id="cgCode"></div>'},
  ctl:()=>cgBig('Klik'),
  paint(G,ov){const d=ov.querySelector('#cgDial');if(d)d.setAttribute('transform',`translate(200 124) rotate(${(-G.th0*360).toFixed(1)})`);
   const p=G.prox||0,g=ov.querySelector('#cgRim');if(g)g.setAttribute('opacity',(p*p).toFixed(2));const f=ov.querySelector('#cgFeel');if(f){f.style.width=(p*100).toFixed(1)+'%';f.classList.toggle('hot',p>.8)}
   if(G.dirty){const c=ov.querySelector('#cgCode');if(c)c.innerHTML=Array.from({length:G.k},(_,i)=>`<i class="${i<G.code.length?'on':''}">${i<G.code.length?String(G.code[i]).padStart(2,'0'):'··'}</i>`).join('')}cgFxPaint(G,ov)}},
 heist:{
  stage:G=>CG_SVG(`<defs><linearGradient id="cgHf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1416"/><stop offset="1" stop-color="#0d0a0b"/></linearGradient></defs><rect width="400" height="240" fill="url(#cgHf)"/>
   <rect x="-600" y="176" width="1600" height="700" fill="#0f0c0d"/><path d="M-600 176h1600" stroke="#2e2326" stroke-width="2"/>
   ${[40,74,108].map(y=>`<rect x="190" y="${y}" width="180" height="4" fill="#3a2d31"/>${Array.from({length:9},(_,i)=>`<rect x="${194+i*20}" y="${y-16+(i*7)%6}" width="14" height="${16-(i*7)%6}" rx="2" fill="${['#5a3a2a','#2f4a5a','#5a4f2a','#3a2f5a'][i%4]}" opacity=".7"/>`).join('')}`).join('')}
   <rect x="22" y="34" width="72" height="142" rx="3" fill="#121c22" stroke="#2e3a40" stroke-width="3"/><path d="M58 34v142" stroke="#2e3a40" stroke-width="2"/><rect x="28" y="40" width="24" height="60" fill="#1b2a33" opacity=".7"/><text x="58" y="120" text-anchor="middle" class="cg-small">OPEN</text>
   <rect x="110" y="128" width="270" height="48" rx="4" fill="#2a1f22" stroke="#3a2d31" stroke-width="2"/><rect x="110" y="122" width="270" height="8" rx="2" fill="#3a2d31"/>
   <g transform="translate(150 96)"><rect width="56" height="28" rx="3" fill="#3d4450"/><rect x="6" y="4" width="26" height="10" rx="1" fill="#3fe395" opacity=".5"/><rect x="-4" y="26" width="64" height="8" rx="2" fill="#2b3038"/></g>
   <g transform="translate(330 104)"><rect x="-10" y="0" width="20" height="18" rx="3" fill="#3d4450"/><circle cx="0" cy="9" r="5" fill="#b8323f"/></g>
   <g transform="translate(300 14)"><rect x="-14" y="0" width="22" height="10" rx="2" fill="#555c66"/><circle cx="-14" cy="5" r="3" fill="#ff3d52" opacity=".7"/></g>
   <circle id="cgAlarm" cx="380" cy="20" r="8" fill="#ff3d52" opacity=".2"/>`)+'<div class="cg-alert" id="cgAlert"></div>'+cgFxEl,
  ctl:G=>`<div class="cg-pad4">${G.acts.map((a,i)=>cgBtn(i,`<span class="cg-act-t">${cgEsc(a[0])}</span><small>${cgEsc(a[1])}</small>`,'ghost cg-act c'+i)).join('')}</div>`,
  paint(G,ov){const a=ov.querySelector('#cgAlert');if(a&&G.dirty){a.innerHTML=G.q?`<b>${cgEsc(G.acts[G.q.ans][1])}</b><i class="cg-ring"><i id="cgQt"></i></i>`:'<span>Alles rustig…</span>';a.className='cg-alert'+(G.q?' on c'+G.q.ans:'')}
   const q=ov.querySelector('#cgQt');if(q&&G.q)q.style.width=(G.q.left/G.Tc*100).toFixed(1)+'%';
   const al=ov.querySelector('#cgAlarm');if(al)al.setAttribute('opacity',G.q?(.3+.7*((G.t*4)%1<.5)).toFixed(2):'.2');cgFxPaint(G,ov)}},
 talk:{
  stage:G=>`<div class="cg-talk"><div class="cg-npc">${CG_SVG(`<circle cx="200" cy="120" r="110" fill="#15181d"/><path d="M110 240c0-60 40-86 90-86s90 26 90 86z" fill="#2f3542"/><circle cx="200" cy="100" r="48" fill="#c99872"/><path d="M152 92c4-34 26-46 48-46s44 12 48 46c-14-14-30-18-48-18s-34 4-48 18z" fill="#2a1f18"/>
   <g id="cgFace"><path id="cgBrowL" d="M176 88l16 4" stroke="#2a1f18" stroke-width="4" stroke-linecap="round"/><path id="cgBrowR" d="M224 88l-16 4" stroke="#2a1f18" stroke-width="4" stroke-linecap="round"/><circle cx="184" cy="100" r="4" fill="#111"/><circle cx="216" cy="100" r="4" fill="#111"/><path id="cgMouth" d="M186 124q14 6 28 0" stroke="#5a2a1a" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,'cg-npcsvg')}<span class="cg-mood" id="cgMood"></span></div>
   <div class="cg-say"><div class="cg-bub them"><span class="cg-whoT">${cgEsc(G.th.who||'')}</span><p id="cgLine">…</p><i class="cg-ring"><i id="cgQt"></i></i></div><div class="cg-bub me" id="cgMe" hidden></div></div></div>`+cgFxEl,
  ctl:()=>'<div class="cg-ask">Wat zeg je?</div><div class="cg-opts cg-reply" id="cgOpts"></div>',
  paint(G,ov){if(G.dirty){const q=G.q,m=q?G.set[q.mood]:null,ln=ov.querySelector('#cgLine'),md=ov.querySelector('#cgMood'),op=ov.querySelector('#cgOpts'),me=ov.querySelector('#cgMe');
    if(ln)ln.textContent=q?q.line:'…';if(md){md.textContent=m?m[1]+' '+m[0]:'';md.className='cg-mood m'+(q?q.mood:'')}
    if(me){me.hidden=!G.said;if(G.said){me.textContent=G.said.t;me.className='cg-bub me '+(G.said.ok?'ok':'no')}}
    if(op)op.innerHTML=q?q.opts.map((o,i)=>cgBtn(i,`<b>${cgEsc(G.set[o.m][2])}</b><span>${cgEsc(o.say)}</span>`,'ghost cg-rb')).join(''):'';
    const mo=ov.querySelector('#cgMouth'),bl=ov.querySelector('#cgBrowL'),br=ov.querySelector('#cgBrowR'),k=q?q.mood:-1;
    const F=[['M186 122q14 8 28 0','M176 86h16','M224 86h-16'],['M188 128q12-8 24 0','M176 90l16-6','M224 90l-16-6'],['M184 122q16 10 32 0','M176 84l16 0','M224 84l-16 0'],['M186 126h28','M176 84l16 8','M224 84l-16 8']];
    const f=F[k%4]||F[0];if(mo)mo.setAttribute('d',f[0]);if(bl)bl.setAttribute('d',f[1]);if(br)br.setAttribute('d',f[2])}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.q?(G.q.left/G.Tc*100).toFixed(1)+'%':'0%';cgFxPaint(G,ov)}},
 memory:{space:G=>G.show>0?'go':null,tapStage:false,
  stage:G=>`<div class="cg-doc"><div class="cg-docH"><span>${cgEsc(G.th.n||'Onthoud')}</span><i class="cg-ring"><i id="cgQt"></i></i></div><div class="cg-docB" id="cgDoc"></div></div>`+cgFxEl,
  ctl:()=>'<div class="cg-ask" id="cgAsk"></div><div class="cg-opts" id="cgOpts"></div>',
  paint(G,ov){if(G.dirty){const d=ov.querySelector('#cgDoc'),op=ov.querySelector('#cgOpts'),ak=ov.querySelector('#cgAsk');
    if(G.show>0){d.innerHTML=`<span class="label">Onthoud dit</span>`+G.facts.map(f=>`<div class="cg-fact"><span>${cgEsc(f[0])}</span><b>${cgEsc(f[1])}</b></div>`).join('');op.innerHTML=cgBtn('go','Klaar, onthouden<small>'+(CG_TAP?'':'spatie')+'</small>','lk-go cg-big');ak.textContent=''}
    else if(G.q){const qq=(G.th.q||'Welke {l}?').replace('{l}',G.th.pool?G.q.f[0]:G.q.f[0].toLowerCase()),m=qq.match(/^([^:]+):\s*(.*)$/);
     d.innerHTML=m?`<span class="label">${cgEsc(m[1])}</span><p class="cg-qq">${cgEsc(m[2])}</p>`:`<span class="label">Vraag</span><p class="cg-qq">${cgEsc(qq)}</p>`;
     ak.textContent='Wat antwoord je?';op.innerHTML=G.q.opts.map((v,i)=>cgBtn(i,cgEsc(v),'ghost')).join('')}
    else{d.innerHTML='<p class="cg-qq">…</p>';op.innerHTML='';ak.textContent=''}}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=(G.show>0?G.show/G.showT:G.q?G.q.left/G.Tc:0)*100+'%';cgFxPaint(G,ov)}},
 hack:{
  stage:G=>`<div class="cg-term"><div class="cg-termH"><span>${cgEsc(G.th.n||'Terminal')}</span><em>${cgEsc(G.th.what||'Code')}</em></div><div class="cg-codeline" id="cgLine"></div><div class="cg-trace"><span>trace</span><i class="cg-ring"><i id="cgQt"></i></i></div></div>`+cgFxEl,
  ctl:()=>`<div class="cg-hex">${'0123456789ABCDEF'.split('').map(ch=>cgBtn(ch,ch,'ghost')).join('')}</div>`,
  paint(G,ov){if(G.dirty){const l=ov.querySelector('#cgLine');if(l)l.innerHTML=G.code.split('').map((ch,i)=>`<i class="${i<G.i?'ok':i===G.i?'cur':''}">${ch}</i>`).join('')}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=Math.max(0,Math.min(1,G.left/G.Tc))*100+'%';cgFxPaint(G,ov)}},
 route:{
  stage:G=>{const w=G.th.water,side=w?'#071019':'#0e1013';
   // zijkanten: gebouwen (of kade) die meeschuiven; weg met drie banen
   const blds=Array.from({length:30},(_,i)=>{const h=30+(i*37)%40,c=['#1b2029','#20242c','#191d24'][i%3];return w?`<rect x="${i%2?348:4}" y="${i*60-930}" width="48" height="40" rx="3" fill="#0f2233"/>`:`<rect x="${i%2?330:6}" y="${i*60-930}" width="64" height="${h+20}" fill="${c}"/><rect x="${i%2?338:14}" y="${i*60-920}" width="10" height="8" fill="#ffd166" opacity=".25"/>`}).join('');
   return CG_SVG(`<rect width="400" height="240" fill="${side}"/><g id="cgSide">${[-1800,0,1800].map(o=>blds.replace(/y="(-?\d+)"/g,(m,v)=>`y="${+v+o}"`)).join('')}</g>
   <rect x="78" y="-600" width="244" height="1440" fill="${w?'#0b1b28':'#16191e'}"/>${w?'':'<rect x="74" y="-600" width="6" height="1440" fill="#2b3038"/><rect x="320" y="-600" width="6" height="1440" fill="#2b3038"/>'}
   <g id="cgDash" stroke="${w?'#1d3a50':'#c9d1da'}" stroke-opacity="${w?1:.35}" stroke-width="4" stroke-dasharray="18 22">${w?'<path d="M160 -600v1440M240 -600v1440" stroke-dasharray="4 26"/>':'<path d="M160 -600v1440M240 -600v1440"/>'}</g>
   <g id="cgCp"></g><g id="cgVeh">${CG_VEH[G.th.veh||'truck']}</g>`,'cg-route','meet').replace('viewBox="0 0 400 240"','viewBox="62 0 276 240"')+cgFxEl+'<div class="cg-who">'+cgEsc(G.th.n||'')+'</div>'},
  ctl:()=>`<div class="cg-lr">${cgBtn('L','<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>','ghost',' aria-label="Naar links"')}${cgBtn('R','<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>','ghost',' aria-label="Naar rechts"')}</div>`,
  paint(G,ov){const lx=l=>120+l*80,v=ov.querySelector('#cgVeh');if(v){const tx=lx(G.lane);v._x=v._x==null?tx:v._x+(tx-v._x)*.3;const tilt=Math.max(-14,Math.min(14,(tx-v._x)*.25));v.setAttribute("transform",`translate(${v._x.toFixed(1)} 196) rotate(${tilt.toFixed(1)})`)}
   const ds=ov.querySelector('#cgDash');if(ds)ds.setAttribute('stroke-dashoffset',(-G.scroll*160%40).toFixed(1));
   const sd=ov.querySelector('#cgSide');if(sd)sd.setAttribute('transform',`translate(0 ${(G.scroll*90%1800).toFixed(1)})`);
   const cp=ov.querySelector('#cgCp');if(cp){if(G.cp){const y=-24+G.cp.y*196,blink=(G.t*3)%1<.5;
    if(G.dirty||!cp.firstChild)cp.innerHTML=[0,1,2].map(l=>l===G.cp.free
     ?`<g><rect x="${lx(l)-36}" y="-18" width="72" height="36" rx="6" fill="#3fe395" opacity=".14" stroke="#3fe395" stroke-opacity=".6" stroke-dasharray="6 5"/><path d="M${lx(l)-8} 2l8-10 8 10" stroke="#3fe395" stroke-width="3" fill="none" stroke-linecap="round"/><text x="${lx(l)}" y="14" text-anchor="middle" class="cg-small g">VRIJ</text></g>`
     :`<g><rect x="${lx(l)-38}" y="-6" width="76" height="12" rx="2" fill="url(#cgBar)"/><rect x="${lx(l)-38}" y="-6" width="76" height="12" rx="2" fill="none" stroke="#ff3d52"/><circle class="cg-bl" cx="${lx(l)-30}" cy="-12" r="5" fill="#3d7bff"/><circle class="cg-bl b" cx="${lx(l)+30}" cy="-12" r="5" fill="#ff3d52"/><text x="${lx(l)}" y="22" text-anchor="middle" class="cg-small r">${cgEsc(G.cp.ctl[l]).toUpperCase()}</text></g>`).join('')
      +'<defs><pattern id="cgBar" width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)"><rect width="7" height="12" fill="#f1ece0"/><rect x="7" width="7" height="12" fill="#ff3d52"/></pattern></defs>';
    cp.setAttribute('transform',`translate(0 ${y.toFixed(1)})`);cp.querySelectorAll('.cg-bl').forEach(b=>b.setAttribute('opacity',(b.classList.contains('b')?!blink:blink)?'1':'.25'))}else cp.innerHTML=''}
   cgFxPaint(G,ov)}},
 deal:{space:()=>'go',
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0d0f12"/>${G.th.chart?`<path id="cgChart" d="" stroke="#3a4b6a" stroke-width="3" fill="none"/>`:''}
   <rect x="30" y="112" width="340" height="34" rx="6" fill="#16191e" stroke="#2b3038"/><rect id="cgZone" x="0" y="112" width="0" height="34" fill="#3fe395" opacity=".35"/><rect id="cgZoneHi" x="0" y="108" width="0" height="42" fill="none" stroke="#3fe395" stroke-width="2"/>
   <g id="cgNeedle"><path d="M0 98l-7-14h14z" fill="#fff"/><rect x="-2" y="104" width="4" height="50" fill="#fff"/></g>
   <text x="30" y="174" class="cg-small">GOEDKOOP</text><text x="370" y="174" text-anchor="end" class="cg-small">TE DUUR</text>
   <text x="200" y="64" text-anchor="middle" class="cg-big2" id="cgPrice"></text>`)+cgFxEl,
  ctl:()=>cgBig('Deal'),
  paint(G,ov){const X=x=>30+x*340,n=ov.querySelector('#cgNeedle');if(n)n.setAttribute('transform',`translate(${X(G.nx||0).toFixed(1)} 0)`);
   if(G.dirty){const z=ov.querySelector('#cgZone'),zh=ov.querySelector('#cgZoneHi');[z,zh].forEach(e=>{if(e){e.setAttribute('x',X(G.zc-G.zw).toFixed(1));e.setAttribute('width',(G.zw*2*340).toFixed(1))}})
    const ch=ov.querySelector('#cgChart');if(ch){let d='M30 90';for(let i=1;i<=20;i++)d+=` L${30+i*17} ${(90-Math.sin(i*.7+G.zc*9)*14-i*1.2).toFixed(1)}`;ch.setAttribute('d',d)}}
   const pr=ov.querySelector('#cgPrice');if(pr){const c=G.c||{min:100,max:1000};pr.textContent=fmt(c.min+(c.max-c.min)*1.4*(G.nx||0))}cgFxPaint(G,ov)}},
 saw:{space:()=>'go',
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0d0f12"/>
   <rect id="cgEndL" x="40" y="34" width="56" height="112" rx="8" fill="#3fe395" opacity=".06" stroke="#3fe395" stroke-opacity=".35" stroke-dasharray="5 5"/><rect id="cgEndR" x="304" y="34" width="56" height="112" rx="8" fill="#3fe395" opacity=".06" stroke="#3fe395" stroke-opacity=".35" stroke-dasharray="5 5"/>
   <text x="68" y="28" text-anchor="middle" class="cg-small g">EIND</text><text x="332" y="28" text-anchor="middle" class="cg-small g">EIND</text>
   ${G.th.print?`<rect x="70" y="160" width="260" height="62" rx="3" fill="#e9e3cf"/><rect id="cgInk" x="70" y="160" width="0" height="62" fill="#3fa98a" opacity=".55"/><text x="200" y="197" text-anchor="middle" class="cg-small" style="fill:#1a1c20">€ 50 · € 50 · € 50</text>`
    :`<rect x="0" y="168" width="400" height="22" rx="4" fill="#b87333"/><rect x="0" y="168" width="400" height="6" fill="#d9965a"/><rect x="0" y="186" width="400" height="4" fill="#7a4a20"/><rect id="cgCut" x="194" y="168" width="12" height="0" fill="#0d0f12"/>`}
   <g id="cgBlade"><rect x="-56" y="78" width="112" height="10" rx="2" fill="#2b3038"/><path d="M-56 88h112v40h-112z" fill="#c9d1da"/><path d="M-56 128${Array.from({length:14},()=>`l4 6l4-6`).join('')}" fill="#8a929c"/><rect x="-74" y="70" width="22" height="34" rx="6" fill="#ff7a1a"/><circle id="cgSpark" cx="0" cy="${G.th.print?160:168}" r="0" fill="#ffd166"/></g>`)+cgFxEl,
  ctl:G=>cgBig(G.th.ok||'Nu'),
  paint(G,ov){const b=ov.querySelector('#cgBlade'),x=68+(G.mx||0)*264;if(b)b.setAttribute('transform',`translate(${x.toFixed(1)} 0)`);
   const nearL=(G.mx||0)<.1,nearR=(G.mx||0)>.9;['L','R'].forEach(s=>{const e=ov.querySelector('#cgEnd'+s);if(e)e.setAttribute('opacity',(s==='L'?nearL:nearR)?'.32':'.06')});
   const sp=ov.querySelector('#cgSpark');if(sp){const a=G.fx&&G.fx.ok&&G.t-G.fx.t<.25?1-(G.t-G.fx.t)/.25:0;sp.setAttribute('r',(a*16).toFixed(1));sp.setAttribute('opacity',a.toFixed(2))}
   const c=ov.querySelector('#cgCut');if(c)c.setAttribute('height',(22*G.hits/G.k).toFixed(1));const ink=ov.querySelector('#cgInk');if(ink)ink.setAttribute('width',(260*G.hits/G.k).toFixed(1));cgFxPaint(G,ov)}}};
const CG_VEH={truck:'<ellipse cx="0" cy="30" rx="22" ry="6" fill="#000" opacity=".45"/><rect x="-20" y="-34" width="40" height="66" rx="8" fill="#e9e3cf"/><rect x="-17" y="-30" width="34" height="14" rx="4" fill="#24303c"/><rect x="-18" y="-12" width="36" height="40" rx="3" fill="#d6d0c0"/><rect x="-21" y="-26" width="4" height="8" rx="1" fill="#2b3038"/><rect x="17" y="-26" width="4" height="8" rx="1" fill="#2b3038"/><rect x="-16" y="-36" width="8" height="3" rx="1" fill="#ffd166"/><rect x="8" y="-36" width="8" height="3" rx="1" fill="#ffd166"/>',
 bike:'<ellipse cx="0" cy="28" rx="12" ry="4" fill="#000" opacity=".45"/><rect x="-6" y="-30" width="12" height="16" rx="5" fill="#1a1d23"/><rect x="-6" y="14" width="12" height="16" rx="5" fill="#1a1d23"/><rect x="-2" y="-18" width="4" height="34" fill="#ff7a1a"/><rect x="-15" y="-16" width="30" height="4" rx="2" fill="#c9d1da"/><ellipse cx="0" cy="2" rx="12" ry="9" fill="#3a4b6a"/><circle cx="0" cy="-2" r="7" fill="#d9a77c"/><path d="M-7 -3a7 7 0 0114 0z" fill="#ffd166"/>',
 boat:'<path d="M0 -40c16 14 20 34 18 68h-36c-2-34 2-54 18-68z" fill="#f1ece0"/><path d="M-10 -6h20v18h-20z" fill="#24303c"/><path d="M-18 28q18 14 36 0" stroke="#5ce1c4" stroke-width="3" fill="none" opacity=".6"/><path d="M-14 36q14 10 28 0" stroke="#5ce1c4" stroke-width="2" fill="none" opacity=".35"/>'};

// ---------- 6. oefenen (practice.js) ----------
const CG_PR_LV=[[1,'Meester'],[2,'Professional'],[3,'Gevorderd'],[4,'Beginner'],[5,'Nieuweling']];
const cgPrP=lv=>1-(lv-1)/4;
async function cgPracticeRun(type,lv){const c=cgSample(type),th=c?cgTheme(c):{n:CG_TYPES[type].n};
 const r=await cgPlay(c,{type,P:cgPrP(lv),w:.5,th,practice:true,title:th.n||CG_TYPES[type].n,sub:'Oefenen · telt niet mee'});return r&&r.ok}
// kiezer: welk spel wil je oefenen?
function cgPracticePick(type0){if(typeof prCan==='function'&&!prCan()){toast((typeof prWhy==='function'&&prWhy())||'Nu niet','bad');return}
 const ov=document.createElement('div');ov.className='pr-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','cgPrT');
 const types=Object.keys(CG_TYPES),ic=t=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(typeof KL_IC!=='undefined'&&KL_IC[CG_TYPES[t].ic])||''}</svg>`;
 ov.innerHTML=`<div class="pr-box cg-pick"><span class="pr-tag">Oefenen · telt niet mee</span><h2 id="cgPrT">Klus-spellen</h2><p class="pr-sub">Kies een spel, daarna het niveau.</p>
  <div class="cg-pickg">${types.map(t=>`<button type="button" class="${t===type0?'on':''}" data-t="${t}">${ic(t)}<b>${CG_TYPES[t].n}</b><small>${Object.values(CG_OF).filter(x=>x.t===t).length} klussen</small></button>`).join('')}</div>
  <div class="pr-act"><button class="btn ghost" type="button" data-a="close">Terug</button></div></div>`;
 const close=()=>{document.removeEventListener('keydown',key);ov.classList.add('out');setTimeout(()=>ov.remove(),200)};
 const key=e=>{if(e.code==='Escape'){e.preventDefault();close()}};document.addEventListener('keydown',key);
 ov.querySelector('[data-a="close"]').onclick=close;ov.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{close();practiceOpen('cg_'+b.dataset.t)});
 document.body.appendChild(ov);setTimeout(()=>{const b=ov.querySelector('[data-t].on')||ov.querySelector('[data-t]');b&&b.focus({preventScroll:true})},30)}
// registreer elk type als oefening in practice.js (crimegames2.js roept dit opnieuw aan voor de nieuwe soorten)
function cgRegPractice(){if(typeof PRACTICE==='undefined')return;Object.keys(CG_TYPES).forEach(t=>{PRACTICE['cg_'+t]={n:CG_TYPES[t].n,sub:'Klus-spel · '+CG_TYPES[t].lbl,how:CG_TYPES[t].how,lv:()=>CG_PR_LV,ok:'Gelukt!',no:'Betrapt'}});
 PRACTICE.cg={n:'Klus-spellen',open:()=>cgPracticePick()}}
cgRegPractice();
// node (simulatie): exporteer de rekensommen
if(typeof module!=='undefined')module.exports={CG_TYPES,CG_OF,CG_HUM,cgG,cgNB,cgSolve,cgHalfWin,cgReact,cgChoiceT,cgNew,cgTime,cgLockP,CG_MOODS,CG_DEF,cgTri};
