// Klus-spellen: elke misdaad heeft een minigame (11 soorten). Hoe professioneler je in een klus bent, hoe makkelijker het
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
// SNEL UITVOEREN (vanaf Meester, P ≥ 0,8): zonder spel, kans = dobbelsteen × (G(P) − 0,06), geen schone-klusbonus.
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
const crCanQuick=c=>crP(c)>=CG_QUICK_P;
const crQuick=c=>Math.max(1,Math.round(crDice(c)*Math.max(0,cgG(crP(c))-CG_QUICK_K)));
const crLootK=c=>1+CG_LOOT*Math.pow(crP(c),1.5);
const cgCleanK=miss=>miss==null?1:1+(CG_CLEAN[miss]||0);

// ---------- 2. model van een gemiddelde speler en de rekensom per poging ----------
// timing: drukfout ~ N(0, sig) s · reactie (iets opent onverwacht): N(rt, rts) s · keuze: N(mu, s) s plus kans e op een fout antwoord
const CG_HUM={sig:.07,rt:.42,rts:.09};
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
// how (uitleg), init(G) (venster uit G.p), tick(G,dt), press(G,a), view: stage/ctl/paint. G.hint = hulp voor bots en de simulatie.
const CG_TYPES={
 grab:{n:'Zakkenrollen',lbl:'Grijpen',ic:'wallet',sk:['steal','ademhaling'],kind:'react',km:w=>[4+Math.round(w),2],btn:'Grijp',
  how:'Wacht tot hij wegkijkt (groen) en grijp dan meteen. Grijp je als hij kijkt, of ben je te laat, dan valt het op.',
  init(G){G.L=cgReact(G.p)*G.slow;G.ph='watch';G.pt=cgU(.8,1.6);G.wid=0},
  tick(G,dt){G.pt-=dt;if(G.pt<=0){if(G.ph==='watch'){G.ph='away';G.pt=G.L;G.wid++}else{G.ph='watch';G.pt=cgU(.8,1.6)}G.dirty=1}
   G.hint={kind:'react',id:G.wid,on:G.ph==='away'}},
  press(G){if(G.ph==='away'){G.ph='watch';G.pt=cgU(.8,1.6);G.hit(G.th.items?G.th.items[G.hits%G.th.items.length]:'Gepakt')}else G.bad('Hij keek precies op dat moment')}},
 sneak:{n:'Sluipen',lbl:'Sluipen',ic:'camera',sk:['steal','speed'],kind:'timing',sig:.065,km:w=>[4+Math.round(w),2],btn:'Pak',
  how:'Pakken duurt even. Druk zodra de lichtkegel van je wegdraait, dan ben je klaar voordat hij terugkomt.',
  init(G){G.Pd=(2.1+.7*(1-G.d))*G.slow;G.cw=.14;G.h=cgHalfWin(G.p,.07);G.t0=Math.random()*G.Pd;G.side=Math.random()<.5?0:1;G.grab=0;G.gT=0;this.place(G)},
  place(G){G.side=1-G.side;G.x=G.side?.94:.06;const onT=2*(Math.min(G.x,1-G.x)+G.cw)/(2/G.Pd);G.tau=Math.max(.3,G.Pd-onT-2*G.h);G.dirty=1},
  pos(G,t){return cgTri((t+G.t0)/(G.Pd/2))},
  on(G,t){return Math.abs(this.pos(G,t)-G.x)<G.cw},
  tick(G,dt){if(G.grab>0){G.grab-=dt;if(this.on(G,G.t)){G.grab=0;G.bad('De kegel ving je');this.place(G)}else if(G.grab<=0){G.grab=0;G.hit(G.th.items?G.th.items[G.hits%G.th.items.length]:'Gepakt');this.place(G)}}
   // bot: wanneer verlaat de kegel je plek? (stap vooruit tot hij eraf is)
   let aim=null;if(!G.grab){if(!this.on(G,G.t))for(let s=.005;s<=G.h;s+=.005){if(this.on(G,G.t-s)){aim=G.h-s;break}} // net weg: nu nog binnen het venster
   if(aim==null){let t=G.t,was=this.on(G,t);for(let i=0;i<600;i++){t+=.01;const o=this.on(G,t);if(was&&!o){aim=t-G.t+G.h;break}was=o}}}
   G.hint={kind:'timing',aim}},
  press(G){if(G.grab>0)return;if(this.on(G,G.t)){G.bad('Je pakte het onder de kegel');this.place(G);return}G.grab=G.tau;G.gT=G.tau}},
 lock:{n:'Slot',lbl:'Slot',ic:'lock',sk:['sloten','ademhaling'],kind:'lock',km:w=>[3+Math.round(w),2],
  how:'Druk (spatie, klik of tik) als de naald in het groene stuk staat: dan zit een pin. Twee missers op rij en een pin springt terug; loopt je paniek vol, dan eerst rustig ademen.'},
 safe:{n:'Kluis kraken',lbl:'Kluis',ic:'vault',sk:['sloten','ademhaling'],kind:'timing',sig:.08,km:w=>[4+Math.round(w),2],btn:'Klik',
  how:'De draaischijf draait. Het gevoel-lampje gloeit op als je bij het juiste getal komt: druk als het het felst is.',
  init(G){G.om=(.26+.2*G.d)/G.slow;G.h=cgHalfWin(G.p,.08);G.hw=G.h*G.om;G.th0=Math.random();G.dir=1;G.code=[];this.next(G)},
  next(G){G.tg=((G.th0+G.dir*cgU(.35,.85))%1+1)%1;G.dirty=1},
  delta(G){let d=(G.tg-G.th0)*G.dir;d=((d%1)+1)%1;return d>.5?d-1:d}, // >0: nog te gaan
  tick(G,dt){G.th0=((G.th0+G.dir*G.om*dt)%1+1)%1;const d=this.delta(G);G.prox=Math.max(0,1-Math.abs(d)/.1);
   G.hint={kind:'timing',aim:(d>=0?d:d+1)/G.om}},
  press(G){const d=this.delta(G);if(Math.abs(d)<=G.hw){G.code.push(Math.round(G.tg*100)%100);G.dir=-G.dir;G.hit('Klik');if(!G.done)this.next(G)}else G.bad(d>0?'Te vroeg: verkeerd getal':'Te laat: verkeerd getal')}},
 heist:{n:'Overval',lbl:'Overval',ic:'smash',sk:['schiet','ademhaling'],kind:'choice',mu:.75,s:.18,e:[.015,.04],km:w=>[5+Math.round(2*w),2],
  how:'Houd de boel onder controle: er gebeurt steeds iets. Kies op tijd de juiste reactie (tik, of toets 1 tot 4).',
  init(G){G.acts=G.th.acts||CG_DEF.heist.acts;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=cgU(.5,.9);G.qid=0;G.last=-1},
  tick(G,dt){if(G.q){G.q.left-=dt;if(G.q.left<=0){const a=G.acts[G.q.ans];G.q=null;G.gap=cgU(.35,.8);G.dirty=1;G.bad('Te laat: '+a[1].toLowerCase())}}
   else{G.gap-=dt;if(G.gap<=0){let a;do{a=Math.floor(Math.random()*4)}while(a===G.last);G.last=a;G.q={ans:a,left:G.Tc,id:++G.qid};G.dirty=1}}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:4}},
  press(G,a){if(!G.q||a==null||a==='go')return;const ok=+a===G.q.ans,A=G.acts[G.q.ans];G.q=null;G.gap=cgU(.35,.8);G.dirty=1;if(ok)G.hit(A[0]);else G.bad('Verkeerde reactie')}},
 talk:{n:'Gesprek',lbl:'Praten',ic:'handshake',sk:['charisma','handel'],kind:'choice',mu:1.35,s:.35,e:[.02,.05],km:w=>[3+Math.round(w),1],
  how:'Kijk hoe de ander erbij zit en kies op tijd de aanpak die past. Eén keer mis mag.',
  init(G){G.set=CG_MOODS[G.th.set||'std'];G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=.4;G.qid=0;G.lastM=-1},
  tick(G,dt){if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=.6;G.dirty=1;G.bad('Je twijfelde te lang')}}
   else{G.gap-=dt;if(G.gap<=0){let mi;do{mi=Math.floor(Math.random()*G.set.length)}while(mi===G.lastM&&G.set.length>1);G.lastM=mi;
    const opts=cgShuffle([mi].concat(cgShuffle(G.set.map((_,i)=>i).filter(i=>i!==mi)).slice(0,2)));G.q={mood:mi,opts,ans:opts.indexOf(mi),line:cgPick(G.set[mi][3]),left:G.Tc,id:++G.qid};G.dirty=1}}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:3}},
  press(G,a){if(!G.q||a==null||+a>=G.q.opts.length)return;const ok=+a===G.q.ans,m=G.set[G.q.mood];G.q=null;G.gap=.6;G.dirty=1;if(ok)G.hit(m[2]+': werkt');else G.bad('Verkeerde toon')}},
 memory:{n:'Geheugen',lbl:'Onthouden',ic:'doc',sk:['charisma','rechten'],kind:'choice',mu:1.25,s:.3,e:[.02,.06],km:w=>[3+Math.round(w),1],
  how:'Eerst zie je een paar gegevens: onthoud ze. Daarna vraagt iemand ernaar. Kies op tijd het juiste antwoord.',
  init(G){const th=G.th,n=G.k+1;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;
   if(th.pool){const labs=cgShuffle(th.labels).slice(0,n),vals=cgShuffle(th.pool).slice(0,n);G.facts=labs.map((l,i)=>[l,vals[i],th.pool])}
   else G.facts=cgShuffle(th.facts).slice(0,n).map(f=>[f[0],cgPick(f[1]),f[1]]);
   G.show=(2+n*(.75+.5*(1-G.d)))*G.slow;G.showT=G.show;G.order=cgShuffle(G.facts.map((_,i)=>i)).slice(0,G.k+G.m+1);G.oi=0;G.q=null;G.gap=0;G.qid=0;G.dirty=1},
  ask(G){const f=G.facts[G.order[G.oi++%G.order.length]],wrong=cgShuffle(f[2].filter(v=>v!==f[1])).slice(0,2),opts=cgShuffle([f[1]].concat(wrong));
   G.q={f,opts,ans:opts.indexOf(f[1]),left:G.Tc,id:++G.qid};G.dirty=1},
  tick(G,dt){if(G.show>0){G.show-=dt;if(G.show<=0){G.show=0;G.dirty=1;this.ask(G)}G.hint={kind:'choice',id:0,ans:null,n:3};return}
   if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=.5;G.dirty=1;G.bad('Te lang nagedacht')}}else{G.gap-=dt;if(G.gap<=0)this.ask(G)}
   G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:3}},
  press(G,a){if(G.show>0){if(a==='go'){G.show=0;G.dirty=1;this.ask(G)}return}if(!G.q||a==null||a==='go'||+a>=3)return;const ok=+a===G.q.ans;G.q=null;G.gap=.45;G.dirty=1;if(ok)G.hit('Klopt');else G.bad('Dat klopte niet')}},
 hack:{n:'Hacken',lbl:'Hacken',ic:'chip',sk:['hack'],kind:'choice',mu:.62,s:.16,e:[.01,.03],km:w=>[8+Math.round(4*w),2],
  how:'Typ de code over voordat de trace-balk leeg is: met het toetsenbord of de knoppen. Een typfout telt als fout.',
  init(G){const ch='0123456789ABCDEF';G.code=Array.from({length:G.k},()=>ch[Math.floor(Math.random()*16)]).join('');G.i=0;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.left=G.Tc+.6;G.qid=1;G.dirty=1},
  tick(G,dt){G.left-=dt;if(G.left<=0){G.left=G.Tc;G.qid++;G.dirty=1;G.bad('Te traag: de trace komt dichterbij')}G.hint={kind:'choice',id:G.qid,ans:G.code[G.i],n:16}},
  press(G,a){if(a==null||a==='go')return;a=String(a).toUpperCase();if(!/^[0-9A-F]$/.test(a))return;G.qid++;G.left=G.Tc;G.dirty=1;if(a===G.code[G.i]){G.i++;G.hit(a)}else G.bad('Typfout')}},
 route:{n:'Route',lbl:'Route',ic:'truck',sk:['cars','speed'],kind:'react',km:w=>[5+Math.round(2*w),2],
  how:'Er komen controles op je af. Wissel op tijd naar de vrije baan: ← → (of A/D), de knoppen of tik links/rechts.',
  init(G){G.lane=1;G.cp=null;G.gap=.8;G.wid=0;G.scroll=0},
  spawn(G){const free=cgPick([0,1,2].filter(l=>l!==G.lane)),nm=Math.abs(free-G.lane);G.cp={free,y:0,W:cgReact(G.p,.45+.2*(nm-1),.1)*G.slow,ctl:[0,1,2].map(()=>cgPick(G.th.ctl||['Controle']))};G.wid++;G.dirty=1},
  tick(G,dt){G.scroll+=dt;if(G.cp){G.cp.y+=dt/G.cp.W;if(G.cp.y>=1){const ok=G.lane===G.cp.free,nm=G.cp.ctl[G.lane];G.cp=null;G.gap=cgU(.45,.8);G.dirty=1;if(ok)G.hit('Erdoor');else G.bad(nm+': je moet stoppen')}}
   else{G.gap-=dt;if(G.gap<=0)this.spawn(G)}G.hint={kind:'react',id:G.cp?G.wid:0,on:!!G.cp,lane:G.lane,free:G.cp?G.cp.free:null}},
  press(G,a){if(a==='L'&&G.lane>0){G.lane--;G.dirty=1}else if(a==='R'&&G.lane<2){G.lane++;G.dirty=1}}},
 deal:{n:'Onderhandelen',lbl:'Dealen',ic:'chart',sk:['handel','charisma'],kind:'timing',km:w=>[4+Math.round(w),1],btn:'Deal',
  how:'De wijzer zwaait over de prijs. Stop hem in het groene stuk: lager laat je geld liggen, hoger en de ander haakt af.',
  init(G){G.v=(.35+.35*G.d)/G.slow;G.h=cgHalfWin(G.p);G.zw=G.h*G.v;G.ph0=Math.random()*2;this.next(G)},
  next(G){G.zc=cgU(.5,.82);G.dirty=1},
  x(G){return cgTri(G.ph0+G.t*G.v)},
  tick(G){const x=this.x(G);G.nx=x;// bot: tijd tot de naald het midden van het groene stuk raakt
   let aim=null;const P0=G.ph0+G.t*G.v;for(let i=1;i<400;i++){const t=i*.005;if(Math.abs(cgTri(P0+t*G.v)-G.zc)<.004){aim=t;break}}G.hint={kind:'timing',aim}},
  press(G){const x=this.x(G);if(Math.abs(x-G.zc)<=G.zw){G.hit((G.th.ok||'Deal'));this.next(G)}else{G.bad(x<G.zc?(G.th.lo||'Te goedkoop'):(G.th.hi||'Te duur: hij haakt af'));this.next(G)}}},
 saw:{n:'Ritme',lbl:'Ritme',ic:'saw',sk:['conditie','steal'],kind:'timing',km:w=>[8+Math.round(3*w),2],btn:'Nu',
  how:'Houd het ritme vast: druk telkens als het blad aan het eind van zijn slag is (de oplichtende kant). Mis je, dan maak je herrie.',
  init(G){G.tb=(1-.35*G.d)*G.slow;G.h=cgHalfWin(G.p);G.ph0=Math.random()*.5;G.lastRev=-1},
  rev(G){const u=(G.t+G.ph0*G.tb)/G.tb;return Math.round(u)}, // dichtstbijzijnde omkeerpunt
  tick(G){const u=(G.t+G.ph0*G.tb)/G.tb;G.mx=cgTri(u);const nx=Math.ceil(u);let aim=(nx-u)*G.tb;if(nx===G.lastRev||aim<.02&&Math.round(u)===G.lastRev)aim+=G.tb;G.hint={kind:'timing',aim}},
  press(G){const u=(G.t+G.ph0*G.tb)/G.tb,r=Math.round(u),dt=Math.abs(u-r)*G.tb;if(dt<=G.h&&r!==G.lastRev){G.lastRev=r;G.hit(G.th.ok||'Slag')}else G.bad(r===G.lastRev?'Twee keer op dezelfde slag':'Uit de maat: herrie')}}};

// stemmingen bij het gesprek: [naam, teken, juiste aanpak, zinnen]
const CG_MOODS={
 std:[['hebberig','€','Geld bieden',['Wat levert het mij op?','Dat is wel erg weinig.','Ik heb ook kosten, hè.','Voor dat bedrag sta ik niet eens op.']],
  ['bang','!','Geruststellen',['Als dit uitkomt, ben ik alles kwijt.','Wie weet hier nog meer van?','Ik heb kinderen thuis.','En als de krant erachter komt?']],
  ['ijdel','★','Vleien',['Weet je wel wie ik ben?','Zonder mij gebeurt hier niks.','Ik doe dit al twintig jaar.','Ze zouden een standbeeld voor me moeten maken.']],
  ['koppig','✕','Druk zetten',['Nee. Ik doe het niet.','Zoek maar een ander.','Ik ben niet te koop.','Ga maar weg.']]],
 // oplichting: alleen algemene tonen, geen echte belscripts
 fraud:[['argwanend','?','Zakelijk blijven',['Hoe weet ik dat dit klopt?','Dit voelt niet goed.','Ik bel liever even terug.']],
  ['ongerust','!','Vriendelijk en rustig',['Is er iets mis?','Ik snap er niks van.','Moet ik nu iets doen?']],
  ['ongeduldig','⏱','Snel ter zake',['Ik heb hier geen tijd voor.','Kom op, wat wil je?','Schiet eens op.']]],
 beg:[['meelevend','♥','Zielig verhaal',['Gaat het wel met je?','Wat is er gebeurd?','Heb je het koud?']],['vrolijk','☺','Grapje maken',['Hé, mooie dag, hè!','Haha, jij weer.','Zo, lekker bezig?']],
  ['toerist','✈','In het Engels',['Sorry, no Dutch.','Excuse me?','Where is the Red Light?']],['gehaast','⏱','Kort en snel',['Ik moet mijn trein halen!','Geen tijd, sorry.','Ik ben al te laat.']]]};
const CG_DEF={heist:{acts:[['Kassa','De la gaat open'],['Handen!','Iemand pakt zijn telefoon'],['Knop','Hand naar het alarm'],['Deur','Er komt iemand binnen']]}};
// Per klus: spel en thema. t = type, n = titel, who = wie er kijkt / met wie je praat, items = wat je pakt (op volgorde)
const CG_OF={
 // grijpen
 zakken:{t:'grab',n:'Rugzak op de Dam',who:'Toerist',items:['Portemonnee','Telefoon','Paspoort','Zonnebril','Powerbank']},
 pakket:{t:'grab',n:'Stoep vol dozen',who:'Bewoner achter het raam',items:['Doos van de webshop','Pakketje','Sneakers','Koptelefoon','Maaltijdbox']},
 horloge:{t:'grab',n:'Patek op het terras',who:'Man met de Patek',items:['Hand schudden','Sluiting los','Van de pols','In je mouw','Doorlopen']},
 stadion:{t:'grab',n:'Kassa onder de tribune',who:'Kassamedewerker',items:['Bundel twintigjes','Zak munten','Envelop','Geldlade','Kluissleutel']},
 // sluipen
 winkeldief:{t:'sneak',n:'Schappen bij de drogist',who:'Camera',items:['Parfum','Scheermesjes','Tandenbleekset','Oordopjes','Zonnebrand']},
 flessen:{t:'sneak',n:'Kratten achter de supermarkt',who:'Bedrijfsleider',items:['Krat pils','Krat cola','Krat spa','Krat pils','Krat fris']},
 spuiten:{t:'sneak',n:'Muur in de wijk',who:'Zaklamp van de wijkagent',items:['Outline','Vulling','Schaduw','Highlights','Tag']},
 kasteel:{t:'sneak',n:'Gangen van het kasteel',who:'De butler',items:['Kandelaar','Oude meester','Familiezilver','Snuifdoos','Tafelklok']},
 kunst:{t:'sneak',n:'Zaal 7 van het museum',who:'Camera in de zaal',items:['Alarmdraad','Lijst los','Doek eruit','Oprollen','Koker dicht']},
 londen:{t:'sneak',n:'Vitrines in Londen',who:'Bewaker met zaklamp',items:['Vitrine open','Collier','Tiara','Broche','Oorbellen']},
 kroon:{t:'sneak',n:'De schatkamer',who:'Laserscanner',items:['Kroon','Scepter','Rijksappel','Zwaard','Ring']},
 rivaal:{t:'sneak',n:'Loods van de rivaal',who:'Bewaker van de rivaal',items:['Tas cash','Doos telefoons','Kist sigaretten','Krat sneakers','Weegschaal']},
 vrachtwagen:{t:'sneak',n:'Truckparking bij Venlo',who:'Beveiliger met zaklamp',items:['Zeil open','Doos telefoons','Doos tablets','Doos laptops','Zeil dicht']},
 // slot (lockgame.js)
 fiets:{t:'lock',n:'Kettingslot',sub:'Fiets bij het station'},scooter:{t:'lock',n:'Accuslot',sub:'Fatbike in het rek'},autokraak:{t:'lock',n:'Portierslot',sub:'Parkeergarage'},
 inbraak:{t:'lock',n:'Voordeur van de villa',sub:'Wassenaar'},parkeer:{t:'lock',n:'Portier van een leaseauto',sub:'Koplampen en airbags'},
 garagebox:{t:'lock',n:'Kanteldeur',sub:'Garagebox in Almere'},apotheek:{t:'lock',n:'Achterdeur',sub:'Apotheek na sluitingstijd'},
 // kluis
 bank:{t:'safe',n:'Bankkluis'},diamant:{t:'safe',n:'Kluis op de beurs'},casino:{t:'safe',n:'Casinokluis'},centralebank:{t:'safe',n:'Kluis van de Centrale Bank'},
 geneve:{t:'safe',n:'Vrijhavenkluis'},goudreserve:{t:'safe',n:'Goudkluis'},
 // overval
 winkel:{t:'heist',n:'Achter de toonbank',acts:[['Kassa','De la gaat open'],['Handen!','Klant pakt zijn telefoon'],['Knop','Eigenaar reikt naar het alarm'],['Deur','Er komt iemand binnen']]},
 ramkraak:{t:'heist',n:'Negentig seconden',acts:[['Grijpen','Telefoons in het rek'],['Terug!','Beveiliger komt eraan'],['Rolluik','Het rolluik zakt'],['Motor','De bus slaat bijna af']]},
 juwelier:{t:'heist',n:'Dertig seconden',acts:[['Vitrine','Vitrine ligt open'],['Handen!','Verkoper beweegt'],['Knop','Voet naar het alarm'],['Uitkijk','Scooter van de wijkagent']]},
 transport:{t:'heist',n:'De gepantserde bus',acts:[['Kisten','Kluis gaat open'],['Wapen neer','Bewaker grijpt naar zijn holster'],['Zender','Noodzender knippert'],['Route','Politie op de scanner']]},
 goud:{t:'heist',n:'Tussen de vrachtvliegtuigen',acts:[['Pallet','Pallet op de lift'],['Rustig','Grondpersoneel kijkt op'],['Pasje','Poort vraagt om een pas'],['Radio','Verkeerstoren roept op']]},
 jet:{t:'heist',n:'Aan boord',acts:[['Koffers','Koffers in het ruim'],['Zitten!','Passagier staat op'],['Transponder','Transponder gaat aan'],['Cockpit','Piloot twijfelt']]},
 // gesprek
 bedelen:{t:'talk',n:'Een bekertje bij Centraal',who:'Voorbijganger',set:'beg'},
 snackbar:{t:'talk',n:'Even praten met de eigenaar',who:'Eigenaar van de snackbar'},afpersing:{t:'talk',n:'De foto\'s op tafel',who:'De vastgoedbaron'},
 havenbaas:{t:'talk',n:'Koffie op de kade',who:'De havenbaas'},aanbesteding:{t:'talk',n:'Een etentje',who:'Ambtenaar inkoop'},matchfix:{t:'talk',n:'In de spelersbus',who:'De keeper'},
 rechter:{t:'talk',n:'In de raadkamer',who:'De rechter'},minister:{t:'talk',n:'Lunch in Den Haag',who:'De lobbyist'},kartelvrede:{t:'talk',n:'Aan het hoofd van de tafel',who:'Twee kartelbazen'},
 telefoon:{t:'talk',n:'Aan de lijn',who:'Iemand aan de telefoon',set:'fraud'},fruitautomaat:{t:'talk',n:'Een appje van "je zoon"',who:'Ontvanger van het appje',set:'fraud'},
 deurbel:{t:'talk',n:'Op het schoolplein',who:'De werver',set:'fraud'},
 // onthouden (papierspoor)
 webshop:{t:'memory',n:'Klantenservice',q:'Wat zei je tegen {l}?',labels:['Kevin','Sanne','Mo','Lisa','Daan','Priya'],pool:['Pakket bij de buren','Vertraagd in Duitsland','Verkeerde maat','Terugbetaling loopt','Nieuw nummer gemaild','Staking bij de bezorger']},
 bouwfraude:{t:'memory',n:'Controle op de bouw',q:'De inspecteur vraagt: wat doet {l}?',labels:['Kees','Ahmed','Piotr','Henk','Jurgen','Sven'],pool:['Metselaar','Timmerman','Kraanmachinist','Stukadoor','Elektricien','Tegelzetter']},
 scheepswerf:{t:'memory',n:'Twee kopers, één jacht',q:'De tweede koper vraagt: {l}?',facts:[['Naam van het jacht',['Bella Vita','Sea Breeze','Lady M','Nomad','Aurora','Blue Pearl']],['Thuishaven',['Monaco','Antibes','Palma','Porto Cervo','Marbella']],['Oplevering',['maart','juni','augustus','oktober','december']],['Lengte',['62 meter','70 meter','78 meter','85 meter','91 meter']],['Aanbetaling',['€4 mln','€6 mln','€9 mln','€12 mln','€15 mln']]]},
 kaaiman:{t:'memory',n:'De stichting op papier',q:'De notaris vraagt: {l}?',facts:[['Naam stichting',['Helping Hands','Blue Ocean Fund','Stichting Zonlicht','Hope Foundation','Kids First']],['Stroman',['meneer Ebanks','mevrouw Bodden','meneer McLaughlin','mevrouw Rivers']],['Bank',['Cayman National','Butterfield','Island Trust','Harbour Bank']],['Rekening',['KY-4471','KY-9023','KY-1186','KY-7730','KY-5562']],['Doel op papier',['Schoolboeken','Waterputten','Dierenasiel','Sportveld']]]},
 wereldbank:{t:'memory',n:'Het land dat niet bestaat',q:'De bankdirecteur vraagt: {l}?',facts:[['Land',['Valdoria','Morvia','Esteral','Kel Maran']],['Hoofdstad',['Port Selen','Varnaburg','Ostrava Nova','Santa Lira']],['Munt',['Valdo','Morvische kroon','Esterreal','Selen']],['Project',['Een stuwdam','Een snelweg','Een haven','Een luchthaven']],['Bedrag',['€120 mln','€180 mln','€240 mln','€310 mln']]]},
 witwas:{t:'memory',n:'De boekhouding klopt',q:'De boekhouder vraagt: {l}?',facts:[['Opdrachtgever',['Bouwbedrijf Van Dijk','Klusbedrijf Öztürk','Sloopwerken Noord','Stukadoors BV']],['Werk',['Dakgoten','Tegelwerk','Sloopwerk','Steigerbouw','Schilderwerk']],['Bedrag',['€8.400','€12.750','€19.300','€23.900']],['Datum',['3 maart','17 april','2 juni','28 augustus']],['Factuurnummer',['F-2041','F-2077','F-2113','F-2159']]]},
 satelliet:{t:'memory',n:'Het schriftje',q:'Waar moet het geld van {l} heen?',labels:['Yusuf','Mehmet','Anil','Reza','Samir','Tariq'],pool:['Dubai','Istanbul','Lahore','Casablanca','Paramaribo','Mumbai']},
 // hacken
 tickets:{t:'hack',n:'QR-code nabouwen',what:'Code van het polsbandje'},pand:{t:'hack',n:'Alarmpaneel',what:'Alarmcode'},datalek:{t:'hack',n:'Server van de verzekeraar',what:'Wachtwoord van de beheerder'},
 cryptobeurs:{t:'hack',n:'De hot wallet',what:'Privésleutel'},container:{t:'hack',n:'Havensysteem',what:'Nieuw containernummer'},stroom:{t:'hack',n:'De slimme meter',what:'Code van de meter'},
 renbaan:{t:'hack',n:'Gokwebsite in de lucht',what:'Sleutel van de betaalserver'},
 // route
 envelop:{t:'route',n:'Door Noord',veh:'bike',ctl:['Wijkagent','Camera','Handhaving']},smokkel:{t:'route',n:'De containerterminal',veh:'truck',ctl:['Scanner','Douane','Hond']},
 wapenlading:{t:'route',n:'Grens bij Venlo',veh:'truck',ctl:['Grenscontrole','Weegbrug','Marechaussee']},jacht:{t:'route',n:'Koers naar de baai',veh:'boat',water:1,ctl:['Kustwacht','Radar','Douaneboot']},
 rotterdam:{t:'route',n:'Maasvlakte',veh:'truck',ctl:['Scanner','Douane','Hond']},tanker:{t:'route',n:'Koers langs de kust',veh:'boat',water:1,ctl:['Marine','Kustwacht','Radar']},
 // dealen
 heling:{t:'deal',n:'Koper op Marktplaats',lo:'Te goedkoop weggegeven',hi:'Te duur: hij haakt af',ok:'Verkocht'},veiling:{t:'deal',n:'De hamer valt',lo:'Te vroeg afgehamerd',hi:'Te hoog: de zaal haakt af',ok:'Verkocht'},
 gokhal:{t:'deal',n:'De pot',lo:'Te weinig afgeroomd',hi:'Te veel: de spelers worden boos',ok:'Mooie pot'},voorkennis:{t:'deal',n:'Verkopen op de top',lo:'Te vroeg verkocht',hi:'Te laat: de koers zakt',ok:'Verkocht',chart:1},
 olympisch:{t:'deal',n:'Twintig appartementen',lo:'Te goedkoop gekocht? Te weinig weggezet',hi:'Te hoog: de makelaar stelt vragen',ok:'Getekend'},
 // ritme
 koper:{t:'saw',n:'Kabel knippen',ok:'Knip'},katalysator:{t:'saw',n:'Onder de auto',ok:'Zaag'},drukkerij:{t:'saw',n:'Drukgang',ok:'Laag erop',print:1}};
const cgType=c=>(CG_OF[c.id]&&CG_OF[c.id].t)||'grab';
const cgTheme=c=>CG_OF[c.id]||{t:'grab',n:c.n};
const cgW=c=>Math.min(1,(c.r||0)/(RANKS.length-1));
// voor de oefenstand: een klus van elk type om het thema van te lenen
const cgSample=t=>{const id=Object.keys(CG_OF).find(k=>CG_OF[k].t===t);return CRIMES.find(c=>c.id===id)};

// ---------- 4. het spel spelen ----------
function cgNew(type,P,w,th){const T=CG_TYPES[type],[k,m]=T.km(w||0),p=cgSolve(cgG(P),k,m);
 const G={type,P,d:1-P,w:w||0,k,m,p,hits:0,miss:0,t:0,done:false,th:th||{},slow:1,dirty:1,fx:null,e:T.e?T.e[0]+T.e[1]*(1-P):0};
 G.hit=lbl=>{if(G.done)return;G.hits++;G.fx={ok:1,txt:lbl,t:G.t};G.dirty=1;if(G.onFx)G.onFx(true);if(G.hits>=G.k)G.end(true)};
 G.bad=why=>{if(G.done)return;G.miss++;G.fx={ok:0,txt:why,t:G.t};G.dirty=1;if(G.onFx)G.onFx(false);if(G.miss>G.m)G.end(false,why)};
 G.end=(ok,why)=>{if(G.done)return;G.done=true;G.ok=ok;G.why=why||''};
 return G}
// tijd: ruim genoeg voor een gemiddelde speler; op = mislukt
function cgTime(G){const T=CG_TYPES[G.type],n=G.k+G.m;switch(G.type){
 case 'grab':return 6+n*(1.2+G.L);case 'sneak':return 6+n*G.Pd*1.7;case 'safe':return 5+n*(.75/G.om);case 'heist':return 4+n*(G.Tc*.7+.7);
 case 'talk':return 3+n*(G.Tc*.75+.8);case 'memory':return 2+G.show+n*(G.Tc*.75+.6);case 'hack':return 4+n*(G.Tc*.75+.25);case 'route':return 4+n*1.9;
 case 'deal':return 5+n*2.6/G.v;case 'saw':return 4+n*G.tb*1.6}return 20}
// spel voor een klus (of oefenen: c = null, P en type gegeven). Geeft {ok, miss, why}
async function cgPlay(c,o){o=o||{};const type=o.type||cgType(c),P=o.P!=null?o.P:crP(c),w=o.w!=null?o.w:cgW(c),th=o.th||cgTheme(c);
 if(type==='lock')return cgLock(c,P,w,th,o);
 const T=CG_TYPES[type],G=cgNew(type,P,w,th),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;G.slow=reduce?1.15:1;T.init(G);G.T=cgTime(G);G.c=c;G.practice=!!o.practice;
 return new Promise(resolve=>{window.__chase=true;window.__cg=G;
  const ov=cgOverlay(G,o),stage=ov.querySelector('#cgStage'),ctl=ov.querySelector('#cgCtl'),tim=ov.querySelector('#cgTime');
  let raf=0,last=0,started=false,introT=0;
  const snd=k=>{try{if(window.SFX&&SFX[k])SFX[k]()}catch(e){}};
  G.onFx=ok=>{snd(ok?'click':'tick');paintLives();const st=ov.querySelector('.cg-stage');if(st&&!ok){st.classList.remove('cg-shake');void st.offsetWidth;st.classList.add('cg-shake')}};
  const paintLives=()=>{const l=ov.querySelector('#cgLives');if(l)l.innerHTML=Array.from({length:G.m+1},(_,i)=>`<i class="${i<G.miss?'x':''}"></i>`).join('');
   const pr=ov.querySelector('#cgProg');if(pr)pr.innerHTML=Array.from({length:G.k},(_,i)=>`<i class="${i<G.hits?'on':''}"></i>`).join('')};
  const V=CG_VIEW[type];
  const press=a=>{if(G.done)return;if(!started){if(a==null||a==='go')go();return}T.press(G,a);if(G.done)finish()};
  const go=()=>{if(started)return;started=true;const it=ov.querySelector('.cg-intro');if(it)it.remove();G.dirty=1;snd('click')};
  const key=e=>{if(e.repeat)return;const k=e.key;
   if(e.code==='Space'||k==='Enter'){e.preventDefault();if(!started){go();return}if(V.space)press(V.space(G))}
   else if(/^[1-4]$/.test(k)&&(type==='heist'||type==='talk'||type==='memory')){e.preventDefault();press(+k-1)}
   else if(type==='route'&&(k==='ArrowLeft'||k==='a'||k==='A')){e.preventDefault();press('L')}
   else if(type==='route'&&(k==='ArrowRight'||k==='d'||k==='D')){e.preventDefault();press('R')}
   else if(type==='hack'&&/^[0-9a-fA-F]$/.test(k)&&started){e.preventDefault();press(k)}
   else if(k==='Escape'){e.preventDefault()}};
  document.addEventListener('keydown',key);
  ov.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-a]');if(b){e.preventDefault();press(b.dataset.a==='go'?'go':isNaN(+b.dataset.a)?b.dataset.a:+b.dataset.a);return}
   if(e.target.closest('.cg-stage')){e.preventDefault();if(!started){go();return}
    if(type==='route'){const r=stage.getBoundingClientRect();press(e.clientX<r.left+r.width/2?'L':'R')}else if(V.space)press(V.space(G))}});
  const finish=()=>{if(finish.d)return;finish.d=1;G.done=true;cancelAnimationFrame(raf);document.removeEventListener('keydown',key);
   const box=ov.querySelector('.cg-box');box.classList.add(G.ok?'won':'lost');
   stage.insertAdjacentHTML('beforeend',`<div class="cg-end ${G.ok?'won':'lost'}"><b>${G.ok?(G.miss?'Gelukt':'Schone klus'):'Betrapt'}</b><span>${G.ok?(G.miss?G.miss+' fout'+(G.miss>1?'en':'')+', maar je bent binnen':'Geen fout gemaakt: extra buit'):cgEsc(G.why||'De tijd is op: iemand komt eraan')}</span></div>`);
   ctl.innerHTML='';snd(G.ok?'win':'lose');window.__cg=null;
   setTimeout(()=>{ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve({ok:!!G.ok,miss:G.miss,why:G.why||'De tijd was op.',hits:G.hits})},200)},G.ok?850:1250)};
  stage.innerHTML=V.stage(G)+`<div class="cg-intro"><b>${cgEsc(th.n||T.n)}</b><p>${T.how}</p><span class="cg-go">${'ontouchstart' in window?'Tik om te beginnen':'Spatie of klik om te beginnen'}</span><i class="cg-introbar"><i></i></i></div>`;
  ctl.innerHTML=V.ctl(G);paintLives();
  const tick=t=>{if(G.done){finish();return}const dt=Math.min(.05,(t-last)/1000);last=t;
   if(!started){introT+=dt;const ib=ov.querySelector('.cg-introbar>i');if(ib)ib.style.width=Math.min(100,introT/2.6*100)+'%';if(introT>=2.6)go()}
   else{G.t+=dt;T.tick(G,dt);if(G.t>=G.T&&!G.done)G.end(false,th.timeout||'De tijd is op: iemand komt eraan');
    const left=Math.max(0,1-G.t/G.T);tim.style.width=(left*100).toFixed(1)+'%';tim.classList.toggle('hot',left<.25)}
   V.paint(G,ov);G.dirty=0;if(G.done){finish();return}raf=requestAnimationFrame(tick)};
  V.paint(G,ov);raf=requestAnimationFrame(t=>{last=t;tick(t)})})}
const cgEsc=s=>String(s==null?'':s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function cgOverlay(G,o){const T=CG_TYPES[G.type],th=G.th,ov=document.createElement('div');ov.className='chase-ov jb-ov lk-ov cg-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','cgT');
 const lv=Math.min(5,1+Math.floor((1-G.P)*4.99));
 ov.innerHTML=`<div class="jb-box lk-box cg-box cgt-${G.type}"><div class="jb-top"><div class="jb-tt"><h2><span id="cgT">${cgEsc(o.title||th.n||T.n)}</span><span class="jb-lv lv${lv}">${o.practice?'Oefenen · ':''}${T.lbl} · ${cgLvName(G.P)}</span></h2><p id="cgSub">${cgEsc(o.sub||(G.c?G.c.n:'Telt niet mee'))}</p></div>
  <div class="lk-meters cg-meters"><div class="lk-m"><span class="label">Fouten over</span><div class="cg-lives" id="cgLives"></div></div><div class="lk-m lk-m-t"><span class="label">Tijd</span><div class="lk-bar t"><i id="cgTime" style="width:100%"></i></div></div></div></div>
  <div class="cg-prog" id="cgProg" aria-label="Voortgang"></div>
  <div class="jb-stage lk-stage cg-stage" id="cgStage"></div><div class="jb-help cg-help" id="cgHelp">${T.how}</div><div class="jb-ctl cg-ctl" id="cgCtl"></div></div>`;
 document.body.appendChild(ov);return ov}
// het bestaande slot (lockgame.js) met moeilijkheid uit P; pinnen naar de zwaarte van de klus
function cgLockP(P,w){const d=1-P,pins=5+Math.round(w*2),p=cgSolve(cgG(P),pins,2),speed=.42+.38*d,h=cgHalfWin(p)*CG_LOCK_K,zone=Math.min(.6,2*h*speed);
 const ad=sk('ademhaling'),k=kalmLv();
 return {d,pins,zone,speed,panicRate:(.02+.035*d)*kalmPanic(),panicMiss:(10+8*d)*kalmPanic(),breathTol:Math.min(.42,.18+.05*(1-d)+SK.ademhaling.adem*ad+k*.012),breathN:3,time:7+pins*2.6,
  maxMiss:2,label:'Slot · '+cgLvName(P)}}
const CG_LOCK_K=1; // correctie na simulatie (zie scripts in de rapportage)
async function cgLock(c,P,w,th,o){if(typeof lockGame!=='function')return {ok:true,miss:0};const LP=cgLockP(P,w),st={misses:0};
 const ok=await lockGame(LP,{title:o.title||th.n||'Slot',sub:o.sub||((th.sub?th.sub+' · ':'')+(o.practice?'Oefenen · ':'')+LP.pins+' pinnen · hooguit '+LP.maxMiss+' fouten'),onEnd:x=>Object.assign(st,x)});
 return {ok:!!ok,miss:Math.min(2,st.misses||0),why:ok?'':'Het slot ging niet open.'}}

// ---------- 5. tekeningen (SVG) per spel ----------
const CG_SVG=(inner,cls,ar)=>`<svg class="cg-svg ${cls||''}" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid ${ar||'meet'}" aria-hidden="true">${inner}</svg>`;
const cgFx=G=>G.fx&&G.t-G.fx.t<.9?`<div class="cg-fx ${G.fx.ok?'ok':'no'}" style="opacity:${(1-(G.t-G.fx.t)/.9).toFixed(2)}">${cgEsc(G.fx.txt)}</div>`:'';
function cgFxPaint(G,ov){const el=ov.querySelector('#cgFx');if(!el)return;const on=G.fx&&G.t-G.fx.t<.9;if(!on){if(el._on){el.className='cg-fx';el._on=0}return}
 if(el._k!==G.fx){el._k=G.fx;el.textContent=G.fx.txt;el.className='cg-fx show '+(G.fx.ok?'ok':'no');el._on=1}}
const cgBtn=(a,html,cls)=>`<button type="button" class="btn cg-b ${cls||''}" data-a="${a}">${html}</button>`;
const cgBig=(lbl)=>cgBtn('go',`${lbl}<small>spatie</small>`,'lk-go cg-big');
const CG_VIEW={
 grab:{space:()=>'go',
  stage:G=>CG_SVG(`<defs><linearGradient id="cgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f2b"/><stop offset="1" stop-color="#0b0d12"/></linearGradient></defs>
   <rect width="400" height="240" fill="url(#cgSky)"/><path d="M0 150V70h30v-20h26v28h22V40h34v40h18V58h30v92zM250 150V64h24V44h30v30h22V52h36v28h38v70z" fill="#141821"/>
   <g fill="#ffd166" opacity=".35"><rect x="40" y="86" width="6" height="8"/><rect x="92" y="60" width="6" height="8"/><rect x="104" y="96" width="6" height="8"/><rect x="262" y="80" width="6" height="8"/><rect x="316" y="70" width="6" height="8"/><rect x="352" y="100" width="6" height="8"/></g>
   <rect y="150" width="400" height="90" fill="#101318"/><path d="M0 150h400" stroke="#2b3038"/>
   <g id="cgMark" transform="translate(200 0)"><ellipse cx="0" cy="226" rx="46" ry="6" fill="#000" opacity=".5"/><rect x="-30" y="118" width="60" height="100" rx="18" fill="#3a4250"/><rect x="-24" y="128" width="48" height="58" rx="10" fill="#c0563a" id="cgPack"/><rect x="-14" y="150" width="28" height="20" rx="4" fill="#8f3a26"/>
    <g id="cgHead"><circle cx="0" cy="98" r="22" fill="#d9a77c"/><path d="M-22 92a22 22 0 0144 0z" fill="#3b2a1e"/><g id="cgEyes"><circle cx="-8" cy="100" r="3" fill="#111"/><circle cx="8" cy="100" r="3" fill="#111"/></g></g>
    <path id="cgCone" d="M0 98L-120 30L120 30z" fill="#ff3d52" opacity=".18"/></g>
   <g id="cgHand" transform="translate(110 200)"><path d="M0 0c10-16 26-22 40-18l30 8c6 2 6 9 0 10l-22 2 26 6c6 2 5 10-1 10L22 24C10 24 2 16 0 0z" fill="#e6b48a" stroke="#8a5a3a" stroke-width="2"/></g>
   <text id="cgState" x="200" y="26" text-anchor="middle" class="cg-st">KIJKT</text>`)+'<div class="cg-fx" id="cgFx"></div><div class="cg-who">'+cgEsc(G.th.who||'')+'</div>',
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
   <g id="cgItem"><circle r="22" fill="none" stroke="#2b3038" stroke-width="5"/><circle id="cgRing" r="22" fill="none" stroke="#3fe395" stroke-width="5" stroke-dasharray="138.2" stroke-dashoffset="138.2" transform="rotate(-90)"/><rect x="-9" y="-11" width="18" height="22" rx="3" fill="#ffd166"/></g>`)+'<div class="cg-fx" id="cgFx"></div><div class="cg-who">'+cgEsc(G.th.who||'')+'</div><div class="cg-tag" id="cgTag"></div>',
  ctl:()=>cgBig('Pak'),
  paint(G,ov){const T=CG_TYPES.sneak,pos=T.pos(G,G.t),cx=14+pos*372,on=T.on(G,G.t),ix=14+G.x*372,iy=200;
   const cone=ov.querySelector('#cgCone');if(cone){cone.setAttribute('d',`M200 22L${cx-G.cw*372} 236L${cx+G.cw*372} 236Z`);cone.setAttribute('fill',on?'#ff3d52':'#fff6c8');cone.setAttribute('opacity',on?'.28':'.16')}
   const it=ov.querySelector('#cgItem');if(it)it.setAttribute('transform',`translate(${ix} ${iy})`);
   const ring=ov.querySelector('#cgRing');if(ring)ring.setAttribute('stroke-dashoffset',(138.2*(G.grab>0?G.grab/G.gT:1)).toFixed(1));
   if(G.dirty){const tg=ov.querySelector('#cgTag');if(tg){tg.textContent=G.th.items?G.th.items[G.hits%G.th.items.length]:'';tg.style.left=(G.x*100).toFixed(1)+'%';tg.classList.toggle('r',G.x>.5)}}
   cgFxPaint(G,ov)}},
 safe:{space:()=>'go',
  stage:G=>{const ticks=Array.from({length:100},(_,i)=>{const a=i/100*Math.PI*2,r1=i%10?86:80;return `<line x1="${(Math.sin(a)*r1).toFixed(1)}" y1="${(-Math.cos(a)*r1).toFixed(1)}" x2="${(Math.sin(a)*92).toFixed(1)}" y2="${(-Math.cos(a)*92).toFixed(1)}" stroke="${i%10?'#5b626d':'#c9d1da'}" stroke-width="${i%10?1:2}"/>${i%10?'':`<text x="${(Math.sin(a)*68).toFixed(1)}" y="${(-Math.cos(a)*68+4).toFixed(1)}" text-anchor="middle" class="cg-num">${i}</text>`}`}).join('');
   return CG_SVG(`<rect width="400" height="240" fill="#0b0d10"/><rect x="60" y="6" width="280" height="228" rx="14" fill="#1a1d23" stroke="#2b3038" stroke-width="2"/>
    <circle cx="200" cy="124" r="104" fill="#121419" stroke="#3a404a" stroke-width="3"/><g id="cgDial" transform="translate(200 124)"><circle r="96" fill="#20242b" stroke="#4a515c"/>${ticks}<circle r="30" fill="#2b3038" stroke="#5b626d"/><rect x="-4" y="-30" width="8" height="18" rx="2" fill="#5b626d"/></g>
    <path d="M200 14l-8-12h16z" fill="#ffd166"/><circle id="cgGlow" cx="356" cy="44" r="16" fill="#ffd166" opacity=".1"/><text x="356" y="80" text-anchor="middle" class="cg-small">GEVOEL</text>`)+'<div class="cg-fx" id="cgFx"></div><div class="cg-code" id="cgCode"></div>'},
  ctl:()=>cgBig('Klik'),
  paint(G,ov){const d=ov.querySelector('#cgDial');if(d)d.setAttribute('transform',`translate(200 124) rotate(${(-G.th0*360).toFixed(1)})`);
   const g=ov.querySelector('#cgGlow');if(g){const p=G.prox||0;g.setAttribute('opacity',(.08+.92*p*p).toFixed(2));g.setAttribute('r',(12+8*p).toFixed(1))}
   if(G.dirty){const c=ov.querySelector('#cgCode');if(c)c.innerHTML=Array.from({length:G.k},(_,i)=>`<i class="${i<G.code.length?'on':''}">${i<G.code.length?String(G.code[i]).padStart(2,'0'):'··'}</i>`).join('')}cgFxPaint(G,ov)}},
 heist:{
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0f0d0d"/><path d="M0 170h400M40 170V60h120v110M240 170V40h130v130" stroke="#2b2222" stroke-width="3" fill="none"/><rect x="60" y="80" width="80" height="40" fill="#1d1717"/><rect x="260" y="60" width="90" height="60" fill="#1d1717"/>
   <circle id="cgAlarm" cx="380" cy="20" r="8" fill="#ff3d52" opacity=".2"/>`)+'<div class="cg-alert" id="cgAlert"></div><div class="cg-fx" id="cgFx"></div>',
  ctl:G=>`<div class="cg-pad4">${G.acts.map((a,i)=>cgBtn(i,`<kbd>${i+1}</kbd>${cgEsc(a[0])}`,'ghost')).join('')}</div>`,
  paint(G,ov){const a=ov.querySelector('#cgAlert');if(a&&G.dirty){a.innerHTML=G.q?`<b>${cgEsc(G.acts[G.q.ans][1])}</b><i class="cg-ring"><i id="cgQt"></i></i>`:'<span>Rustig houden…</span>';a.classList.toggle('on',!!G.q)}
   const q=ov.querySelector('#cgQt');if(q&&G.q)q.style.width=(G.q.left/G.Tc*100).toFixed(1)+'%';
   const al=ov.querySelector('#cgAlarm');if(al)al.setAttribute('opacity',G.q?(.3+.7*((G.t*4)%1<.5)).toFixed(2):'.2');cgFxPaint(G,ov)}},
 talk:{
  stage:G=>`<div class="cg-talk"><div class="cg-npc">${CG_SVG(`<circle cx="200" cy="120" r="110" fill="#15181d"/><path d="M110 240c0-60 40-86 90-86s90 26 90 86z" fill="#2f3542"/><circle cx="200" cy="100" r="48" fill="#c99872"/><path d="M152 92c4-34 26-46 48-46s44 12 48 46c-14-14-30-18-48-18s-34 4-48 18z" fill="#2a1f18"/>
   <g id="cgFace"><path id="cgBrowL" d="M176 88l16 4" stroke="#2a1f18" stroke-width="4" stroke-linecap="round"/><path id="cgBrowR" d="M224 88l-16 4" stroke="#2a1f18" stroke-width="4" stroke-linecap="round"/><circle cx="184" cy="100" r="4" fill="#111"/><circle cx="216" cy="100" r="4" fill="#111"/><path id="cgMouth" d="M186 124q14 6 28 0" stroke="#5a2a1a" stroke-width="4" fill="none" stroke-linecap="round"/></g>`,'cg-npcsvg')}<span class="cg-mood" id="cgMood"></span></div>
   <div class="cg-say"><span class="cg-whoT">${cgEsc(G.th.who||'')}</span><p id="cgLine">…</p><i class="cg-ring"><i id="cgQt"></i></i></div></div><div class="cg-fx" id="cgFx"></div>`,
  ctl:()=>'<div class="cg-opts" id="cgOpts"></div>',
  paint(G,ov){if(G.dirty){const q=G.q,m=q?G.set[q.mood]:null,ln=ov.querySelector('#cgLine'),md=ov.querySelector('#cgMood'),op=ov.querySelector('#cgOpts');
    if(ln)ln.textContent=q?'"'+q.line+'"':'…';if(md){md.textContent=m?m[1]+' '+m[0]:'';md.className='cg-mood m'+(q?q.mood:'')}
    if(op)op.innerHTML=q?q.opts.map((mi,i)=>cgBtn(i,`<kbd>${i+1}</kbd>${cgEsc(G.set[mi][2])}`,'ghost')).join(''):G.set.map(s=>`<span class="cg-leg"><b>${s[1]}</b> ${s[0]} → ${s[2]}</span>`).join('');
    const mo=ov.querySelector('#cgMouth'),bl=ov.querySelector('#cgBrowL'),br=ov.querySelector('#cgBrowR'),k=q?q.mood:-1;
    const F=[['M186 122q14 8 28 0','M176 86l16 4','M224 86l-16 4'],['M188 128q12-8 24 0','M176 90l16-6','M224 90l-16-6'],['M184 122q16 10 32 0','M176 84l16 0','M224 84l-16 0'],['M186 126h28','M176 84l16 8','M224 84l-16 8']];
    const f=F[k%4]||F[0];if(mo)mo.setAttribute('d',f[0]);if(bl)bl.setAttribute('d',f[1]);if(br)br.setAttribute('d',f[2])}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.q?(G.q.left/G.Tc*100).toFixed(1)+'%':'0%';cgFxPaint(G,ov)}},
 memory:{space:G=>G.show>0?'go':null,
  stage:G=>`<div class="cg-doc"><div class="cg-docH"><span>${cgEsc(G.th.n||'Onthoud')}</span><i class="cg-ring"><i id="cgQt"></i></i></div><div class="cg-docB" id="cgDoc"></div></div><div class="cg-fx" id="cgFx"></div>`,
  ctl:()=>'<div class="cg-opts" id="cgOpts"></div>',
  paint(G,ov){if(G.dirty){const d=ov.querySelector('#cgDoc'),op=ov.querySelector('#cgOpts');
    if(G.show>0){d.innerHTML=`<span class="label">Onthoud dit</span>`+G.facts.map(f=>`<div class="cg-fact"><span>${cgEsc(f[0])}</span><b>${cgEsc(f[1])}</b></div>`).join('');op.innerHTML=cgBtn('go','Onthouden <small>spatie</small>','lk-go cg-big')}
    else if(G.q){d.innerHTML=`<span class="label">Vraag</span><p class="cg-qq">${cgEsc((G.th.q||'Welke {l}?').replace('{l}',G.th.pool?G.q.f[0]:G.q.f[0].toLowerCase()))}</p>`;op.innerHTML=G.q.opts.map((v,i)=>cgBtn(i,`<kbd>${i+1}</kbd>${cgEsc(v)}`,'ghost')).join('')}
    else{d.innerHTML='<p class="cg-qq">…</p>';op.innerHTML=''}}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=(G.show>0?G.show/G.showT:G.q?G.q.left/G.Tc:0)*100+'%';cgFxPaint(G,ov)}},
 hack:{
  stage:G=>`<div class="cg-term"><div class="cg-termH"><span>${cgEsc(G.th.n||'Terminal')}</span><em>${cgEsc(G.th.what||'Code')}</em></div><div class="cg-codeline" id="cgLine"></div><div class="cg-trace"><span>trace</span><i class="cg-ring"><i id="cgQt"></i></i></div></div><div class="cg-fx" id="cgFx"></div>`,
  ctl:()=>`<div class="cg-hex">${'0123456789ABCDEF'.split('').map(ch=>cgBtn(ch,ch,'ghost')).join('')}</div>`,
  paint(G,ov){if(G.dirty){const l=ov.querySelector('#cgLine');if(l)l.innerHTML=G.code.split('').map((ch,i)=>`<i class="${i<G.i?'ok':i===G.i?'cur':''}">${ch}</i>`).join('')}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=Math.max(0,Math.min(1,G.left/G.Tc))*100+'%';cgFxPaint(G,ov)}},
 route:{
  stage:G=>{const w=G.th.water;return CG_SVG(`<rect width="400" height="240" fill="${w?'#08131c':'#0e1013'}"/><rect x="80" width="240" height="240" fill="${w?'#0b1b28':'#16191e'}"/>
   <g id="cgDash" stroke="${w?'#1d3a50':'#3a404a'}" stroke-width="4" stroke-dasharray="16 18">${w?'<path d="M100 0v240M300 0v240" stroke-dasharray="4 22"/>':'<path d="M160 0v240M240 0v240"/>'}</g>
   <g id="cgCp"></g><g id="cgVeh">${CG_VEH[G.th.veh||'truck']}</g>`,'cg-route','slice')+'<div class="cg-fx" id="cgFx"></div>'},
  ctl:()=>`<div class="cg-lr">${cgBtn('L','<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>','ghost')}${cgBtn('R','<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>','ghost')}</div>`,
  paint(G,ov){const lx=l=>120+l*80,v=ov.querySelector('#cgVeh');if(v){v._x=v._x==null?lx(G.lane):v._x+(lx(G.lane)-v._x)*.35;v.setAttribute("transform",`translate(${v._x.toFixed(1)} 190)`)}
   const ds=ov.querySelector('#cgDash');if(ds)ds.setAttribute('stroke-dashoffset',(-G.scroll*120%34).toFixed(1));
   const cp=ov.querySelector('#cgCp');if(cp){if(G.cp){const y=-20+G.cp.y*210;if(G.dirty||!cp.firstChild)cp.innerHTML=[0,1,2].map(l=>l===G.cp.free?`<rect x="${lx(l)-34}" y="-14" width="68" height="28" rx="4" fill="#3fe395" opacity=".18"/><text x="${lx(l)}" y="5" text-anchor="middle" class="cg-small g">VRIJ</text>`:`<rect x="${lx(l)-36}" y="-12" width="72" height="24" fill="#2a1216" stroke="#ff3d52"/><path d="M${lx(l)-36} -12l72 24" stroke="#ff3d52" stroke-width="2" opacity=".5"/><text x="${lx(l)}" y="4" text-anchor="middle" class="cg-small r">${cgEsc(G.cp.ctl[l]).toUpperCase()}</text>`).join('');cp.setAttribute('transform',`translate(0 ${y.toFixed(1)})`)}else cp.innerHTML=''}
   cgFxPaint(G,ov)}},
 deal:{space:()=>'go',
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0d0f12"/>${G.th.chart?`<path id="cgChart" d="" stroke="#3a4b6a" stroke-width="3" fill="none"/>`:''}
   <rect x="30" y="112" width="340" height="34" rx="6" fill="#16191e" stroke="#2b3038"/><rect id="cgZone" x="0" y="112" width="0" height="34" fill="#3fe395" opacity=".35"/><rect id="cgZoneHi" x="0" y="108" width="0" height="42" fill="none" stroke="#3fe395" stroke-width="2"/>
   <g id="cgNeedle"><path d="M0 98l-7-14h14z" fill="#fff"/><rect x="-2" y="104" width="4" height="50" fill="#fff"/></g>
   <text x="30" y="174" class="cg-small">${cgEsc(G.th.lo?'GOEDKOOP':'LAAG')}</text><text x="370" y="174" text-anchor="end" class="cg-small">${cgEsc('TE DUUR')}</text>
   <text x="200" y="64" text-anchor="middle" class="cg-big2" id="cgPrice"></text>`)+'<div class="cg-fx" id="cgFx"></div>',
  ctl:()=>cgBig('Deal'),
  paint(G,ov){const X=x=>30+x*340,n=ov.querySelector('#cgNeedle');if(n)n.setAttribute('transform',`translate(${X(G.nx||0).toFixed(1)} 0)`);
   if(G.dirty){const z=ov.querySelector('#cgZone'),zh=ov.querySelector('#cgZoneHi');[z,zh].forEach(e=>{if(e){e.setAttribute('x',X(G.zc-G.zw).toFixed(1));e.setAttribute('width',(G.zw*2*340).toFixed(1))}})
    const ch=ov.querySelector('#cgChart');if(ch){let d='M30 90';for(let i=1;i<=20;i++)d+=` L${30+i*17} ${(90-Math.sin(i*.7+G.zc*9)*14-i*1.2).toFixed(1)}`;ch.setAttribute('d',d)}}
   const pr=ov.querySelector('#cgPrice');if(pr){const c=G.c||{min:100,max:1000};pr.textContent=fmt((c.min+(c.max-c.min)*1.4*(G.nx||0))*(G.th.chart?1:1))}cgFxPaint(G,ov)}},
 saw:{space:()=>'go',
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0d0f12"/>${G.th.print?'<rect x="60" y="40" width="280" height="150" fill="#e9e3cf" opacity=".9"/><rect id="cgInk" x="60" y="40" width="0" height="150" fill="#5ce1c4" opacity=".35"/>':'<rect x="0" y="150" width="400" height="22" fill="#b87333"/><rect x="0" y="150" width="400" height="6" fill="#d9965a"/><rect id="cgCut" x="196" y="150" width="8" height="0" fill="#0d0f12"/>'}
   <rect id="cgEndL" x="24" y="40" width="44" height="100" fill="#3fe395" opacity=".08"/><rect id="cgEndR" x="332" y="40" width="44" height="100" fill="#3fe395" opacity=".08"/>
   <g id="cgBlade"><rect x="-40" y="70" width="80" height="54" rx="6" fill="#4a515c" stroke="#8a929c" stroke-width="2"/><path d="M-40 124h80l-4 8h-72z" fill="#c9d1da"/><rect x="-10" y="48" width="20" height="24" fill="#2b3038"/></g>`)+'<div class="cg-fx" id="cgFx"></div>',
  ctl:()=>cgBig(G=>G),
  paint(G,ov){const b=ov.querySelector('#cgBlade'),x=70+(G.mx||0)*260;if(b)b.setAttribute('transform',`translate(${x.toFixed(1)} 0)`);
   const nearL=(G.mx||0)<.08,nearR=(G.mx||0)>.92;['L','R'].forEach(s=>{const e=ov.querySelector('#cgEnd'+s);if(e)e.setAttribute('opacity',(s==='L'?nearL:nearR)?'.35':'.08')});
   const c=ov.querySelector('#cgCut');if(c)c.setAttribute('height',(22*G.hits/G.k).toFixed(1));const ink=ov.querySelector('#cgInk');if(ink)ink.setAttribute('width',(280*G.hits/G.k).toFixed(1));cgFxPaint(G,ov)}}};
CG_VIEW.saw.ctl=G=>cgBig(G.th.ok||'Nu');
const CG_VEH={truck:'<rect x="-16" y="-30" width="32" height="56" rx="4" fill="#ff7a1a"/><rect x="-14" y="-28" width="28" height="14" rx="2" fill="#2b3038"/><rect x="-18" y="-6" width="36" height="34" fill="#c9d1da"/>',
 bike:'<rect x="-3" y="-26" width="6" height="52" rx="3" fill="#c9d1da"/><rect x="-14" y="-18" width="28" height="5" rx="2" fill="#ff7a1a"/><circle cx="0" cy="-2" r="8" fill="#2b3038"/>',
 boat:'<path d="M0 -36c14 12 18 30 16 62h-32c-2-32 2-50 16-62z" fill="#e9e3cf"/><rect x="-8" y="-6" width="16" height="16" rx="2" fill="#2b3038"/><path d="M-14 30q14 10 28 0" stroke="#5ce1c4" stroke-width="2" fill="none" opacity=".6"/>'};

// ---------- 6. oefenen (practice.js) ----------
const CG_PR_LV=[[1,'Meester'],[2,'Professional'],[3,'Gevorderd'],[4,'Beginner'],[5,'Nieuweling']];
const cgPrP=lv=>1-(lv-1)/4;
async function cgPracticeRun(type,lv){const c=cgSample(type),th=c?cgTheme(c):{n:CG_TYPES[type].n};
 const r=await cgPlay(c,{type,P:cgPrP(lv),w:.5,th,practice:true,title:'Oefenen · '+CG_TYPES[type].n,sub:(th.n||'')+' · telt niet mee'});return r&&r.ok}
// kiezer: welk spel wil je oefenen?
function cgPracticePick(type0){if(typeof prCan==='function'&&!prCan()){toast((typeof prWhy==='function'&&prWhy())||'Nu niet','bad');return}
 const ov=document.createElement('div');ov.className='pr-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','cgPrT');
 const types=Object.keys(CG_TYPES),ic=t=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(typeof KL_IC!=='undefined'&&KL_IC[CG_TYPES[t].ic])||''}</svg>`;
 ov.innerHTML=`<div class="pr-box cg-pick"><span class="pr-tag">Oefenen · telt niet mee</span><h2 id="cgPrT">Klus-spellen</h2><p class="pr-sub">Elke klus heeft een eigen spel. Kies er een om te oefenen; daarna kies je het niveau.</p>
  <div class="cg-pickg">${types.map(t=>`<button type="button" class="${t===type0?'on':''}" data-t="${t}">${ic(t)}<b>${CG_TYPES[t].n}</b><small>${Object.values(CG_OF).filter(x=>x.t===t).length} klussen</small></button>`).join('')}</div>
  <div class="pr-act"><button class="btn ghost" type="button" data-a="close">Terug</button></div></div>`;
 const close=()=>{document.removeEventListener('keydown',key);ov.classList.add('out');setTimeout(()=>ov.remove(),200)};
 const key=e=>{if(e.code==='Escape'){e.preventDefault();close()}};document.addEventListener('keydown',key);
 ov.querySelector('[data-a="close"]').onclick=close;ov.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{close();practiceOpen('cg_'+b.dataset.t)});
 document.body.appendChild(ov);setTimeout(()=>{const b=ov.querySelector('[data-t].on')||ov.querySelector('[data-t]');b&&b.focus({preventScroll:true})},30)}
// registreer elk type als oefening in practice.js
if(typeof PRACTICE!=='undefined')Object.keys(CG_TYPES).forEach(t=>{PRACTICE['cg_'+t]={n:CG_TYPES[t].n,sub:'Klus-spel · '+CG_TYPES[t].lbl,how:CG_TYPES[t].how,lv:()=>CG_PR_LV,ok:'Gelukt!',no:'Betrapt'}});
if(typeof PRACTICE!=='undefined')PRACTICE.cg={n:'Klus-spellen',open:()=>cgPracticePick()};
// node (simulatie): exporteer de rekensommen
if(typeof module!=='undefined')module.exports={CG_TYPES,CG_OF,CG_HUM,cgG,cgNB,cgSolve,cgHalfWin,cgReact,cgChoiceT,cgNew,cgTime,cgLockP,CG_MOODS,CG_DEF,cgTri};
