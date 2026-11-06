// Vluchtspel "Rennen!" (versie 2): gaat een klus mis en kies je vluchten, dan ren je weg met de agent achter je aan.
// Je rent (2,5D, camera achter je) door Amsterdam: langs een gracht, door een steeg, door de winkelstraat of over de kade,
// bij zwaardere klussen eerst door het gebouw (gang, winkel, kantoor) en dan de deur uit. Wissel van baan met ← → (A/D, vegen
// of links/rechts tikken), spring met ↑/W/spatie (omhoog vegen of midden tikken) en buk met ↓/S (omlaag vegen of de knop).
// Onderin zie je hoe ver de agent achter je zit en hoeveel adem je nog hebt. Haal je de uitgang, dan ben je weg.
// Gepakt: de agent haalt je in (afstand 0), of je struikelt terwijl hij binnen FL_TACKLE meter zit.
//
// Aanroep (ongewijzigd): fleeGame(level, opts) geeft een Promise met true (ontkomen) of false (gepakt).
//   level = flee-niveau van de klus (1-5, FLEE_LEVELS). opts (optioneel) = de opts van arrest(): opts.cat (soort klus,
//   CR_CATS), opts.wanted (huurmoord), opts.raid (politiecontrole) kiezen de plek (fleeCtx). Zonder opts kiest het niveau.
//
// MOEILIJKHEID (fleeParams), vastgelegd:
//   Niveau (FL_LV): v = tempo (m/s), T = duur (s), g0→g1 = seconden tussen twee rijen (begin → eindsprint), p2 = kans op twee
//     banen dicht, cop = tempo van de agent als deel van jouw volle tempo, G0 = voorsprong (m), cap = hoeveel je die voorsprong
//     hooguit kunt uitbouwen (de agent raakt je nooit kwijt), drain = adem per seconde, hitV = tempo vlak na struikelen.
//   Training (0-50; c = Conditie/50, u = Uithouding/50, a = Ademhaling/50, s = Snelheid/50):
//     topsnelheid      × (1 + 0,035c + 0,025s)
//     adem per seconde × (1 − 0,5c)                      Conditie: je houdt het langer vol
//     herstel          + 0,03u adem per seconde, na struikelen (1 + 0,5u)× sneller weer op snelheid      Uithouding
//     hijgen           onder 35% adem zak je naar (0,70 + 0,14a) van je tempo, struikelen kost 12% × (1 − 0,5a) adem  Ademhaling
//     wendbaar         baan wisselen in 0,15 s × (1 − 0,3s)                                                Snelheid
//   Extra's (woning furnFx('zone'), familie famPerk('flee'), uitrusting gearFx('flee'), outfit fitFx('flee'); som E):
//     k = 1 − e^(−1,1·E) → voorsprong × (1 + 0,5k), botsing × (1 − 0,06k)
//   Lidmaatschap (tierK: VIP 0,15, High roller 0,40) = t → voorsprong × (1 + 0,6t), adem (1 + 0,5t)× zuiniger.
//   Bij de start zie je wat meetelt en een inschatting (fleeRate).
const FL_LV={
 1:{T:16,v:8.8,g0:1.10,g1:.78,p2:.22,lowP:.34,duck:.06,cross:.12,drift:0,wide:.05,cop:.985,G0:8,cap:3,drain:.026,hitV:.25,hitK:.92,surge:0},
 2:{T:18,v:9.4,g0:1.00,g1:.70,p2:.30,lowP:.35,duck:.08,cross:.14,drift:0,wide:.06,cop:.99,G0:10,cap:3,drain:.028,hitV:.25,hitK:.95,surge:1},
 3:{T:20,v:10,g0:.93,g1:.63,p2:.38,lowP:.36,duck:.10,cross:.15,drift:.08,wide:.06,cop:1,G0:12.5,cap:2.5,drain:.031,hitV:.25,hitK:.98,surge:1},
 4:{T:22,v:10.6,g0:.88,g1:.58,p2:.46,lowP:.37,duck:.11,cross:.16,drift:.14,wide:.06,cop:1.005,G0:13,cap:2.5,drain:.034,hitV:.25,hitK:1,surge:2},
 5:{T:24,v:11.2,g0:.83,g1:.54,p2:.52,lowP:.38,duck:.12,cross:.17,drift:.20,wide:.06,cop:1.01,G0:13,cap:2,drain:.037,hitV:.25,hitK:1.02,surge:2}};
// formule-constanten van fleeParams (zie boven)
const FL_K={top:[.006,.004],drain:.5,regen:.02,floor:[.95,.03],rec:[1.7,.15],hitS:[.12,.5],act:[.018,.4],lane:[.15,.3],ext:[.35,.06],tier:[.4,.5],copSd:.03};
const FL_LANE=1.5,FL_W=2.9,FL_PW=.42,FL_JUMP=.6,FL_SLIDE=.62,FL_TACKLE=2,FL_CEIL=5.4;
const flClamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function flTrain(){const g=id=>flClamp((typeof S!=='undefined'&&S.skills&&S.skills[id])||0,0,50);
 return {conditie:g('conditie'),duur:g('duur'),ademhaling:g('ademhaling'),speed:g('speed')}}
function flExtras(){const f=fn=>{try{return +fn()||0}catch(e){return 0}};
 const parts=[['woning',f(()=>furnFx('zone'))],['familie',f(()=>famPerk('flee'))],['uitrusting',f(()=>gearFx('flee'))],['outfit',f(()=>typeof fitFx==='function'?fitFx('flee'):0)]].filter(x=>x[1]>0);
 const E=parts.reduce((a,x)=>a+x[1],0),tk=f(()=>tierK());
 return {parts,E,k:1-Math.exp(-1.1*E),tk,lid:tk?(typeof lidName==='function'?lidName():'VIP'):''}}
// T en X kunnen worden meegegeven (tests); anders uit de speler
function fleeParams(level,opts,T,X){level=flClamp(Math.round(+level)||2,1,5);const L=FL_LV[level];T=T||flTrain();X=X||flExtras();
 const c=T.conditie/50,u=T.duur/50,a=T.ademhaling/50,s=T.speed/50,k=X.k,t=X.tk;
 const K=FL_K,P=Object.assign({},L,{level,label:(typeof FLEE_LEVELS!=='undefined'&&FLEE_LEVELS[level]||{}).label||'',T,X,c,u,a,s,
  len:L.v*L.T,dur:L.T,
  top:1+K.top[0]*c+K.top[1]*s,
  drain:L.drain*(1-K.drain*c)/(1+K.tier[1]*t),
  regen:K.regen*u,
  floor:K.floor[0]+K.floor[1]*a,
  rec:K.rec[0]*(1+K.rec[1]*u),
  hitS:K.hitS[0]*(1-K.hitS[1]*a),actS:K.act[0]*(1-K.act[1]*c),laneS:.004,
  laneT:K.lane[0]*(1-K.lane[1]*s),
  G0:L.G0*(1+K.ext[0]*k)*(1+K.tier[0]*t),
  hitK:L.hitK*(1-K.ext[1]*k)});
 P.gapMax=P.G0+L.cap;P.rate=fleeRate(P);return P}
// Inschatting vooraf (gekalibreerd met de bot, zie flee-sim): slaagkans voor een gemiddelde loper
function fleeRate(P){const fit=.35*P.c+.2*P.u+.25*P.a+.2*P.s,b=.5*P.X.k+P.X.tk;
 const z=4.3-1.6*P.level+1.5*fit+1.4*b,p=1/(1+Math.exp(-z));
 const w=p>=.75?['te doen',0]:p>=.55?['pittig',1]:p>=.3?['zwaar',2]:p>=.12?['heel zwaar',3]:['bijna kansloos',4];
 return {p,txt:w[0],k:w[1]}}

// ---------------- de plek: past bij de klus ----------------
const FL_TH={
 gracht:{out:1,L:'gevels',R:'gracht',rain:1,amb:'255,170,90',tall:['fiets','toerist','kliko','bakfiets','agent','fiets'],low:['paaltjes','krat','zakken','dranghek'],cross:['fietser','toerist','hond','fietser'],duck:'steiger',fence:'dranghek',wide:'busje',
  where:'Langs de gracht, tussen fietsen en toeristen door.',win:'Over de brug en de hoek om. Weg ben je.',lose:'Hij grijpt je bij je jas, vlak bij de brug.'},
 steeg:{out:1,L:'muur',R:'muur',rain:1,amb:'255,110,120',tall:['kliko','fiets','container','agent'],low:['pallet','zakken','krat'],cross:['hond','mens'],duck:'steiger',fence:'hek',
  where:'De steeg in. Kliko\'s, fietsen en hij zit achter je.',win:'Je schiet een portiek in. Weg ben je.',lose:'De agent grijpt je bij je jas.'},
 markt:{out:1,L:'winkels',R:'winkels',amb:'255,205,150',tall:['mens','toerist','scooter','agent','fiets','mens'],low:['krat','dranghek','zakken','bord'],cross:['mens','toerist','fietser'],duck:'steiger',fence:'dranghek',wide:'busje',
  where:'Door de winkelstraat. Druk, en dat is je kans.',win:'Je duikt een zijstraat in en verdwijnt tussen de mensen.',lose:'Een agent tackelt je tussen de mensen.'},
 haven:{out:1,L:'containers',R:'kade',amb:'255,150,60',tall:['vaten','agent','havenman','kist'],low:['pallet','touw','krat'],cross:['havenman'],duck:'slagboom',fence:'hek',
  where:'Over de kade, tussen de containers door.',win:'Je springt in een bootje en bent weg.',lose:'Twee agenten klemmen je tussen de containers.'},
 gang:{in:1,L:'gang',R:'gang',tall:['dozen','kast','agent'],low:['kar','pallet','bord'],cross:['schoonmaker'],duck:'rolluik',fence:'lint',where:'Door de gang naar de achterdeur.'},
 winkel:{in:1,L:'schappen',R:'schappen',tall:['dozen','mens','agent','dozen'],low:['kar','winkelwagen','bord'],cross:['mens','schoonmaker'],duck:'rolluik',fence:'lint',where:'Tussen de schappen door naar de uitgang.'},
 kantoor:{in:1,L:'glas',R:'glas',tall:['kast','printer','plant','bewaker'],low:['bureau','stoel','bord'],cross:['mens','schoonmaker'],duck:'rolluik',fence:'lint',where:'Door het kantoor naar het trappenhuis.'}};
// welke plek: soort klus (opts.cat), huurmoord, politiecontrole of anders het niveau. Zware klussen beginnen binnen.
function fleeCtx(level,opts,rnd){opts=opts||{};rnd=rnd||Math.random;const pick=a=>a[Math.floor(rnd()*a.length)];
 const cat=opts.cat||(opts.wanted?'hit':opts.raid?'raid':'');let inn=null,out;
 if(cat==='straat')out=level<=1?pick(['gracht','steeg']):level===2?'markt':pick(['markt','gracht']);
 else if(cat==='kraak'){out=level>=4?'gracht':'steeg';if(level>=2)inn='gang'}
 else if(cat==='geweld'){out='markt';if(level>=3)inn='winkel'}
 else if(cat==='fraude'||cat==='invloed'){out='gracht';if(level>=3)inn='kantoor'}
 else if(cat==='smokkel'){out='haven';if(level>=4)inn='gang'}
 else if(cat==='hit')out=pick(['steeg','gracht']);
 else if(cat==='raid')out=pick(['markt','gracht']);
 else{out=[0,'gracht','markt','steeg','gracht','steeg'][level];if(level>=3)inn=level===3?'gang':'kantoor'}
 const frac=inn?[0,0,.3,.36,.44,.52][level]:0;
 return {inn,out,frac,alarm:level>=5&&!!inn,veh:flVehicle(out)}}
// je vluchtvoertuig (Motorhuis Snel) staat klaar bij de uitgang
function flVehicle(out){let g=null;try{g=gearBest('vervoer')}catch(e){}if(!g)return null;
 const k={scooter:'moto',cross:'moto',sedan:'auto',speedboot:'boot',heli:'heli'}[g.id];if(!k)return null;
 return {k,n:{scooter:'Je scooter',cross:'Je crossmotor',sedan:'Je sedan',speedboot:'Je speedboot',heli:'Je heli'}[g.id]}}

const FL_OBS={kliko:{w:.5,h:1.15},fiets:{w:.62,h:1.05},agent:{w:.46,h:1.86},mens:{w:.44,h:1.76},toerist:{w:.5,h:1.76},scooter:{w:.52,h:1.18},bakfiets:{w:.66,h:1.2},
 dozen:{w:.62,h:1.62},kast:{w:.56,h:1.96},bewaker:{w:.46,h:1.9},plant:{w:.5,h:1.6},printer:{w:.62,h:1.2},container:{w:.86,h:1.45},vaten:{w:.7,h:1.0},kist:{w:.74,h:1.5},havenman:{w:.48,h:1.84},
 busje:{w:1.78,h:2.1},schoonmaker:{w:.5,h:1.8},
 pallet:{w:.78,h:.48,low:1},krat:{w:.7,h:.62,low:1},kar:{w:.62,h:.56,low:1},bureau:{w:.9,h:.76,low:1},zakken:{w:.72,h:.5,low:1},dranghek:{w:.82,h:.85,low:1},bord:{w:.44,h:.66,low:1},
 stoel:{w:.52,h:.95,low:1},hond:{w:.5,h:.55,low:1},paaltjes:{w:.8,h:.72,low:1},touw:{w:.8,h:.4,low:1},winkelwagen:{w:.6,h:.95,low:1},
 hek:{w:3.4,h:.82,low:1},lint:{w:3.4,h:.9,low:1},steiger:{w:3.4,h:2.3,high:1},rolluik:{w:3.4,h:2.5,high:1},slagboom:{w:3.4,h:1.3,high:1},fietser:{w:.62,h:1.7}};

// ---------------- de route ----------------
// Rijen obstakels op afstand z (m). Welke baan dicht is, wordt pas bepaald als een rij uit het donker komt (FL-reveal), op
// basis van waar jij dan loopt: stilstaan helpt niet, maar je ziet het altijd op tijd. Opwarmen → gewoon werk → eindsprint.
function flCourse(P,X,rnd){const rows=[],len=P.len,wpick=Wt=>{let t=0;for(const k in Wt)t+=Wt[k];let x=rnd()*t;for(const k in Wt){x-=Wt[k];if(x<=0&&Wt[k]>0)return k}return 'one'};
 let z=P.v*1.5+4,fence=0,sprint=0;const door=X.doorZ||-99,th=zz=>FL_TH[X.inn&&zz<door?X.inn:X.out];
 const push=(k,ph,gt)=>{const T=th(z);rows.push({z,k,ph,obs:[],passed:0,set:0,low:rnd()<P.lowP,extra:rnd()<.45,prev:rows[rows.length-1]||null,th:X.inn&&z<door?X.inn:X.out});
  z+=P.v*gt*(.9+rnd()*.2)};
 while(z<len-P.v*.9){const d=z/len,ph=d<.25?0:d<.66?1:2,gt=Math.max(.46,P.g0+(P.g1-P.g0)*d),T=th(z),nearDoor=Math.abs(z-door)<P.v*.7;
  if(nearDoor){z=door+P.v*.75;continue}
  if(ph===2&&!sprint)sprint=z;let k;
  if(ph===0)k=rows.length&&rnd()<P.p2*.5?'two':'one';
  else if(ph===1)k=wpick({one:.34,two:P.p2+.16,fence:fence<2?.12:0,cross:P.cross,drift:P.drift,duck:P.duck,wide:T.wide?P.wide:0});
  else k=wpick({one:.16,two:.3+P.p2,sl:.26,cross:P.cross,drift:P.drift+.06*(P.level>=4),fence:fence<2?.07:0,duck:P.duck*.8,wide:T.wide?P.wide:0});
  if(k==='fence')fence++;
  if(k==='sl'){push('two',ph,Math.max(.5,P.g1*.85));push('sl',ph,gt);continue}
  push(k,ph,gt)}
 rows.sprintZ=sprint;return rows}
function flFill(r,P,lane,rnd){const T=FL_TH[r.th],lanes=[-1,0,1],pick=a=>a[Math.floor(rnd()*a.length)],other=lanes.filter(l=>l!==lane);
 const mk=(t,x,o)=>Object.assign({t,x,x0:x,hit:0,done:0,sd:rnd()},FL_OBS[t],o||{});let obs;
 if(r.k==='fence')obs=[mk(T.fence,0)];
 else if(r.k==='duck')obs=[mk(T.duck,0)];
 else if(r.k==='drift'){obs=[mk(T.in?(r.th==='kantoor'?'bewaker':'agent'):'agent',lane,{dr:1})];if(r.extra)obs.push(mk(pick(T.low),pick(other)))}
 else if(r.k==='cross'){const from=lane>0?-1.8:lane<0?1.8:pick([-1.8,1.8]),zr=Math.max(8,r.z-(r._d||0));
  obs=[mk(pick(T.cross),from,{cr:1,from,to:lane,zr,dir:Math.sign(lane-from)||1})];if(r.ph===2&&r.extra)obs.push(mk(pick(T.low),pick(other)))}
 else if(r.k==='sl'&&r.prev&&r.prev.free!=null){const pf=r.prev.free,free=pf===0?pick([-1,1]):0;r.free=free;
  obs=lanes.filter(l=>l!==free).map(l=>mk(rnd()<P.lowP*.5?pick(T.low):pick(T.tall),l))}
 else if(r.k==='wide'&&T.wide){const a=lane===0?pick([-.5,.5]):lane*.5;obs=[mk(T.wide,a)]}
 else if(r.k==='two'||r.k==='sl'||r.k==='wide'){const free=pick(other);r.free=free;obs=lanes.filter(l=>l!==free).map(l=>mk(rnd()<P.lowP*.7?pick(T.low):pick(T.tall),l))}
 else{obs=[mk(r.low?pick(T.low):pick(T.tall),lane)];if(r.ph>=1&&r.extra)obs.push(mk(pick(T.low),pick(other)))}
 obs.forEach(o=>{if(o.t==='mens'||o.t==='toerist')o.c=pick(['#3b4a5c','#6a3434','#4a5a3a','#2f3640','#7b5a34','#4a3a6a','#246b6b','#8a2a4a']);if(o.t==='krat')o.c=pick(['#2f6b4a','#b8862c','#2c4f8a','#8a3b2c'])});
 r.obs=obs;r.set=1}

// ---------------- de achtervolging zelf (los van het tekenen, zodat een bot en een simulatie hem kunnen draaien) ----------------
function fleeCore(P,X,rnd){rnd=rnd||Math.random;
 const C={P,X,t:0,dist:0,lane:0,px:0,jumpT:-1,slideT:-1,jq:0,stam:1,paceF:1,gap:P.G0,v:P.v,misses:0,done:false,res:null,why:'',started:false,surge:-1,ev:[],len:P.len,lowT:0};
 X.doorZ=X.inn?Math.round(P.len*X.frac):-99;C.rows=flCourse(P,X,rnd);C.reveal=P.v*2.3+4;
 C.surges=[];for(let i=0;i<P.surge;i++)C.surges.push(P.dur*(.28+.5*rnd())+i*2.4);
 // elke agent is anders: de een is net wat fitter dan de ander (zo is het nooit helemaal zeker, ook niet als je alles goed doet)
 {let g=0;for(let i=0;i<6;i++)g+=rnd();C.copK=1+flClamp((g-3)/.707*FL_K.copSd,-2*FL_K.copSd,2*FL_K.copSd)}
 C.jumpH=()=>C.jumpT<0?0:Math.sin(Math.PI*Math.min(1,C.jumpT/FL_JUMP));
 C.slideH=()=>{if(C.slideT<0)return 0;const k=C.slideT/FL_SLIDE;return k<.15?k/.15:k>.85?Math.max(0,(1-k)/.15):1};
 C.sf=()=>C.stam>=.35?1:P.floor+(1-P.floor)*C.stam/.35;
 C.end=(ok,why)=>{if(C.done)return;C.done=true;C.res=ok;C.why=why||'';C.ev.push(ok?'win':'lose')};
 C.act=a=>{if(C.done||!C.started)return false;
  if(a==='L'||a==='R'){const n=flClamp(C.lane+(a==='L'?-1:1),-1,1);if(n===C.lane)return false;C.lane=n;C.stam=Math.max(0,C.stam-P.laneS);C.ev.push('lane');return true}
  if(a==='J'){if(C.jumpT>=0){if(C.jumpT>FL_JUMP-.2)C.jq=.2;return false}C.jumpT=0;C.slideT=-1;C.stam=Math.max(0,C.stam-P.actS);C.ev.push('jump');return true}
  if(a==='D'){if(C.slideT>=0)return false;C.slideT=0;C.jumpT=-1;C.stam=Math.max(0,C.stam-P.actS);C.ev.push('duck');return true}return false};
 C.hit=o=>{o.hit=1;o.hitT=C.t;C.misses++;C.paceF=Math.min(C.paceF,P.hitV);C.stam=Math.max(0,C.stam-P.hitS);C.ev.push('hit');if(C.gap<FL_TACKLE)C.end(false,'tackle')};
 C.step=dt=>{if(C.done||!C.started)return;C.t+=dt;
  const pace=P.top*C.paceF*C.sf(),v=P.v*pace,prev=C.dist;C.dist+=v*dt;C.v=v;
  let cop=P.cop*C.copK*(C.t<1.2?.82+.18*C.t/1.2:1);const su=C.surges.findIndex(s=>C.t>=s&&C.t<s+1.6);
  if(su!==C.surge){if(su>=0)C.ev.push('surge');C.surge=su}if(su>=0)cop*=1.12;C.copV=P.v*cop;
  C.gap=Math.min(P.gapMax,C.gap+(v-P.v*cop)*dt);
  C.stam=flClamp(C.stam-P.drain*dt+(C.paceF>.9?P.regen*dt:0),0,1);if(C.stam<.35)C.lowT+=dt;
  C.paceF+=(1-C.paceF)*Math.min(1,dt*P.rec);
  const lt=P.laneT*(C.stam<.2?1+.6*(1-P.a):1),ls=dt/lt,dx=C.lane-C.px;C.px=Math.abs(dx)<=ls?C.lane:C.px+Math.sign(dx)*ls;
  if(C.jumpT>=0){C.jumpT+=dt;if(C.jumpT>FL_JUMP){C.jumpT=-1;if(C.jq>0){C.jq=0;C.jumpT=0;C.stam=Math.max(0,C.stam-P.actS)}}}
  if(C.jq>0)C.jq=Math.max(0,C.jq-dt);
  if(C.slideT>=0){C.slideT+=dt;if(C.slideT>FL_SLIDE)C.slideT=-1}
  for(const r of C.rows){const z0=r.z-prev,z1=r.z-C.dist;if(z1>C.reveal+4)break;if(!r.set&&z1<C.reveal){r._d=C.dist;flFill(r,P,C.lane,rnd)}
   for(const o of r.obs){
    if(o.dr&&z1>9&&z1<24){const d=C.px-o.x,m=.9*dt;o.x+=Math.abs(d)<=m?d:Math.sign(d)*m}
    if(o.cr)o.x=o.to+(o.from-o.to)*flClamp(z1/o.zr,-1.6,1);
    if(o.done||o.hit)continue;
    if(z0>0&&z1<=0){o.done=1;const over=Math.abs(C.px-o.x)<(FL_PW+o.w)/2*P.hitK;
     if(over&&!(o.low&&C.jumpH()>.45)&&!(o.high&&C.slideH()>.5)){C.hit(o);if(C.done)return}}}
   if(!r.passed&&z1<0)r.passed=1}
  if(C.gap<=0){C.gap=0;C.end(false,'caught');return}
  if(C.dist>=C.len)C.end(true)};
 return C}

// je outfit op de renner (van achteren)
function fleeLook(){const w=(typeof fitS==='function'&&fitS().wear)||{},k=w.kleding,h=w.hoofd,sh=w.schoenen;
 const TOP={hoodie:'#4f5560',trainingspak:'#1b2a44',werkjas:'#e98a1c',designer:'#b3243a',jas:'#15171b',pak:'#262b35',velours:'#5e1a33',bomber:'#2f3a2a',leer:'#141518',trench:'#a88d5e',bont:'#6b4a32',smoking:'#121317'};
 const PANTS={pak:'#262b35',smoking:'#121317',trainingspak:'#1b2a44',velours:'#5e1a33'};
 const HEAD={pet:'#111316',muts:'#3a3f4a',helm:'#0b0c0e',bivak:'#0d0e10',hoed:'#2a2420',snapback:'#c0262f',pruik:'#5a3a22'};
 const SHOE={sneakers:'#e9e6df',renners:'#ff7a1a',basket:'#e9e6df',limited:'#ff7a1a',slippers:'#2b4a8a',canvas:'#1c2a4a',werkschoen:'#6b4a2a',laarzen:'#7a6a3a',brogues:'#6b3f22'};
 return {top:TOP[k]||'#2a2f3a',pants:PANTS[k]||'#1b2638',hat:HEAD[h]||null,hatK:h||'',hood:k==='hoodie',shoe:SHOE[sh]||(sh?'#16171a':'#e9e6df'),
  stripe:k==='trainingspak'||k==='bomber'?'#ff7a1a':k==='werkjas'?'#e8f0c0':k==='velours'?'#f2c230':null,fur:k==='bont'}}

// kleine deterministische ruis voor gevels, ramen en decor
const flHash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// gevels, bomen, lantaarns en bruggen langs de route (alleen buiten)
function flWorld(X,len){const Wd={L:[],R:[],O:[],deco:[],bridges:[]},z0=Math.max(-12,X.doorZ>0?X.doorZ:-12),end=len+4,T=FL_TH[X.out];let n=1;
 const BR=['#4a2a22','#3d2520','#5a3226','#2f2b2b','#46322a','#283240','#3a3a2e','#55301f','#20262c'],TR=['#cfc6b4','#cfc6b4','#d8d0bf','#a8b4a0','#c9b98f'];
 const houses=(arr,shop,zs,ze)=>{let z=zs;while(z<ze){const h=flHash(n++),w=4+h*2.6,ht=8+flHash(n++)*4.6;
  arr.push({z0:z,z1:Math.min(ze,z+w),h:ht,g:['trap','klok','hals','lijst','trap','klok'][Math.floor(flHash(n++)*6)],col:BR[Math.floor(flHash(n++)*BR.length)],trim:TR[Math.floor(flHash(n++)*TR.length)],seed:n++,shop});z+=w}};
 if(T.L==='gevels'||T.L==='winkels')houses(Wd.L,T.L==='winkels',z0,end);
 if(T.R==='winkels')houses(Wd.R,true,z0,end);
 if(T.R==='gracht'){houses(Wd.O,false,z0-20,end+40);
  for(let z=z0+4;z<end;z+=9+flHash(n++)*4)Wd.deco.push({k:'boom',z,X:FL_W+.75});
  for(let z=z0+8;z<end;z+=15)Wd.deco.push({k:'lamp',z,X:FL_W+.35});
  for(let z=z0+6;z<end;z+=7+flHash(n++)*6)if(flHash(n++)<.6)Wd.deco.push({k:'fietsen',z,X:FL_W+.25,c:Math.floor(flHash(n++)*4)});
  for(let z=z0+40+flHash(n++)*20;z<end-20;z+=55+flHash(n++)*25)Wd.bridges.push(z);Wd.bridges.push(end+3)}
 if(T.L==='containers'){let z=z0;while(z<end){Wd.L.push({z0:z,z1:z+12.2,n:1+Math.floor(flHash(n++)*3),c:[0,1,2].map(()=>['#8a2c24','#1f4f8a','#2d6b3f','#c06a1c','#5a5f66','#7a2a5a'][Math.floor(flHash(n++)*6)])});z+=12.4}
  for(let z=z0+6;z<end;z+=18)Wd.deco.push({k:'mast',z,X:FL_W+.4});for(let z=z0+3;z<end;z+=6)Wd.deco.push({k:'bolder',z,X:FL_W+.25})}
 if(T.L==='muur')for(let z=z0+5;z<end;z+=11)Wd.deco.push({k:'wandlamp',z,X:(Math.round(z/11)%2?1:-1)*FL_W});
 if(T.L==='winkels')for(let z=z0+7;z<end;z+=13)Wd.deco.push({k:'lamp',z,X:(Math.round(z/13)%2?1:-1)*(FL_W-.15)});
 Wd.deco.sort((a,b)=>a.z-b.z);return Wd}

function fleeGame(level,opts){
 return new Promise(resolve=>{
  level=flClamp(Math.round(+level)||2,1,5);
  const P=fleeParams(level,opts),X=fleeCtx(level,opts),C=fleeCore(P,X),TO=FL_TH[X.out],TI=X.inn?FL_TH[X.inn]:null,Wd=flWorld(X,C.len);window.__chase=true;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const LK=fleeLook(),exitN=X.veh?X.veh.n:({gracht:'Brug',steeg:'Portiek',markt:'Zijstraat',haven:'Bootje'}[X.out]);
  const where=(TI?TI.where+' Dan naar buiten: '+TO.where.charAt(0).toLowerCase()+TO.where.slice(1):TO.where);
  const arrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;
  const T=P.T,R=P.rate,why=[['Conditie',T.conditie],['Uithouding',T.duur],['Ademhaling',T.ademhaling],['Snelheid',T.speed]];
  const xtra=P.X.parts.map(p=>p[0]).join(', ');
  const ov=document.createElement('div');ov.className='chase-ov fl-ov rn-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','chT');
  ov.innerHTML=`<div class="fl-box rn-box lv${level}"><div class="siren"></div>
   <div class="fl-top"><div class="fl-tt"><h2 id="chT">Rennen!</h2><p class="fl-where" id="flWhere">${where}</p></div><span class="tag lvl${level}">Vluchten: ${P.label}</span></div>
   <div class="fl-stage rn-stage" id="flStage"><canvas id="flCv" aria-label="Achtervolging: ontwijk wat op je pad komt"></canvas>
    <div class="rn-track" aria-hidden="true"><span class="rn-rail"><i class="rn-done" id="rnDone"></i>${C.rows.sprintZ?`<i class="rn-sp" style="left:${Math.min(96,C.rows.sprintZ/C.len*100)}%"></i>`:''}${X.inn?`<i class="rn-door" style="left:${X.doorZ/C.len*100}%"></i>`:''}<i class="rn-you" id="rnYou"></i></span><b>${exitN}</b></div>
    <div class="rn-hud" aria-live="off">
     <div class="rn-pill rn-cop" id="rnCop"><span class="rn-lab"><i class="rn-siren"></i>Agent</span><b id="rnGap">${Math.round(C.gap)} m</b><em><i id="rnGapBar"></i></em></div>
     <div class="rn-pill rn-st" id="rnSt"><span class="rn-lab"><i class="rn-lung"></i>Adem</span><b id="rnStT">100%</b><em><i id="rnStBar"></i></em></div></div>
    <div class="rn-pop" id="rnPop"></div>
    <div class="fl-big gone" id="flBig"></div></div>
   <div class="fl-info"><span id="flMiss" class="rn-miss"></span><span class="fl-keys"><kbd>←</kbd><kbd>→</kbd> baan · <kbd>↑</kbd>/<kbd>spatie</kbd> springen · <kbd>↓</kbd> bukken</span><span class="fl-tap">Veeg ← → · ↑ spring · ↓ buk</span></div>
   <div class="fl-ctl"><button class="fl-b" data-a="L" aria-label="Naar links">${arrow(-1)}</button><button class="fl-b fl-d" data-a="D">Bukken</button><button class="fl-b fl-j" data-a="J">Spring</button><button class="fl-b" data-a="R" aria-label="Naar rechts">${arrow(1)}</button></div></div>`;
  document.body.appendChild(ov);
  const q=id=>ov.querySelector('#'+id),cv=q('flCv'),ctx=cv.getContext('2d'),stage=q('flStage'),big=q('flBig');
  let W=0,H=0,F=1,hy=0,cx=0,dpr=1,camX=0,last=0,raf=0,closed=false,shake=0,doneT=0,t=0;
  const CB=7.6,CH=4.1,near=-CB+.35;
  const fit=()=>{const r=stage.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(200,r.width);H=Math.max(180,r.height);
   cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);F=Math.min(H*1.2,W*1.5);hy=Math.max(H*.12,H*.84-CH*F/CB);cx=W/2};
  fit();const ro=window.ResizeObserver?new ResizeObserver(fit):null;if(ro)ro.observe(stage);else window.addEventListener('resize',fit);
  // ---------- invoer ----------
  const snd=k=>{try{SFX[k]()}catch(e){}};
  const act=a=>{if(!C.started){go();return}C.act(a)};
  const key=e=>{const k=e.code;let hit=true;
   if(k==='ArrowLeft'||k==='KeyA'){if(!e.repeat)act('L')}else if(k==='ArrowRight'||k==='KeyD'){if(!e.repeat)act('R')}
   else if(k==='ArrowUp'||k==='KeyW'||k==='Space'){if(!e.repeat)act('J')}else if(k==='ArrowDown'||k==='KeyS'){if(!e.repeat)act('D')}
   else if(k==='Enter'){if(C.done)close();else if(!C.started)go()}else hit=false;
   if(hit)e.preventDefault()};
  document.addEventListener('keydown',key);
  ov.querySelectorAll('.fl-b').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();act(b.dataset.a)}));
  // vegen of tikken op het beeld: links/rechts = baan, omhoog of midden = springen, omlaag = bukken
  let sw=null;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();if(C.done){close();return}if(!C.started){go();return}sw={x:e.clientX,y:e.clientY,used:false}});
  cv.addEventListener('pointermove',e=>{if(!sw||sw.used)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;
   if(Math.abs(dx)>24&&Math.abs(dx)>Math.abs(dy)){act(dx<0?'L':'R');sw.used=true}else if(dy<-24){act('J');sw.used=true}else if(dy>24){act('D');sw.used=true}});
  cv.addEventListener('pointerup',e=>{if(!sw)return;if(!sw.used){const r=cv.getBoundingClientRect(),fx=(e.clientX-r.left)/r.width;act(fx<1/3?'L':fx>2/3?'R':'J')}sw=null});
  cv.addEventListener('pointercancel',()=>{sw=null});
  // ---------- tekenen ----------
  const P3=(X_,Y,z)=>{const D=Math.max(.3,z+CB),s=F/D;return {x:cx+(X_-camX)*s,y:hy+(CH-Y)*s,s}};
  const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,-y-h,w,h)};
  const circ=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,-y,r,0,Math.PI*2);ctx.fill()};
  const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],-p[1]):ctx.moveTo(p[0],-p[1]));ctx.closePath();ctx.fill()};
  const path=pts=>{ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath()};
  const fillP=(pts,c)=>{ctx.fillStyle=c;path(pts);ctx.fill()};
  const wallQ=(X_,z1,z2,y1,y2)=>[P3(X_,y1,z1),P3(X_,y2,z1),P3(X_,y2,z2),P3(X_,y1,z2)];
  const flatQ=(x1,x2,z1,z2,y)=>[P3(x1,y,z1),P3(x2,y,z1),P3(x2,y,z2),P3(x1,y,z2)];
  const glow=(x,y,r,col,a)=>{if(r<1||a<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
  const add=f=>{ctx.save();ctx.globalCompositeOperation='lighter';f();ctx.restore()};
  const pool=(X_,z,r,col,a)=>{const c=P3(X_,0,z),f=P3(X_,0,z+r),n=P3(X_,0,z-r),ry=Math.max(1,(n.y-f.y)/2),rx=r*c.s;if(rx<2)return;
   ctx.save();ctx.translate(c.x,(n.y+f.y)/2);ctx.scale(1,ry/rx);glow(0,0,rx,col,a);ctx.restore()};
  const fade=z=>flClamp(1-(z-24)/30,0,1);
  const Zc=z=>Math.max(near,z);
  // --- gevels: een rij Amsterdamse grachtenpanden (trap-, klok-, hals- of lijstgevel) in het vlak X
  function gable(hs,X_,za,zb){const w=hs.z1-hs.z0,h=hs.h,m=(hs.z0+hs.z1)/2-dist(),z0=hs.z0-dist(),z1=hs.z1-dist(),pts=[];const P_=(z,y)=>pts.push(P3(X_,y,Zc(z)));
   const gh=Math.min(3.4,w*.62);
   if(hs.g==='trap'){const st=3,sw=w*.16,sh=gh/(st+.6);P_(z0,h);for(let i=0;i<st;i++){P_(z0+i*sw,h+(i+1)*sh);P_(z0+(i+1)*sw,h+(i+1)*sh)}P_(m-.35,h+gh);P_(m+.35,h+gh);for(let i=st-1;i>=0;i--){P_(z1-(i+1)*sw,h+(i+1)*sh);P_(z1-i*sw,h+(i+1)*sh)}P_(z1,h)}
   else if(hs.g==='klok'){P_(z0,h);P_(z0+w*.12,h+gh*.2);P_(z0+w*.2,h+gh*.55);P_(z0+w*.3,h+gh*.85);P_(m-.3,h+gh);P_(m,h+gh*1.12);P_(m+.3,h+gh);P_(z1-w*.3,h+gh*.85);P_(z1-w*.2,h+gh*.55);P_(z1-w*.12,h+gh*.2);P_(z1,h)}
   else if(hs.g==='hals'){P_(z0,h);P_(z0+w*.22,h+gh*.18);P_(z0+w*.3,h+gh*.62);P_(m-.4,h+gh*.62);P_(m-.4,h+gh);P_(m+.4,h+gh);P_(m+.4,h+gh*.62);P_(z1-w*.3,h+gh*.62);P_(z1-w*.22,h+gh*.18);P_(z1,h)}
   else{P_(z0,h);P_(z0,h+.55);P_(z1,h+.55);P_(z1,h)}
   return pts}
  function house(hs,X_,sd,za,zb){const z0=hs.z0-dist(),z1=hs.z1-dist();if(z1<za||z0>zb)return;const a=Zc(Math.max(z0,za)),b=Math.min(z1,zb),fa=fade((a+b)/2);
   fillP(wallQ(X_,a,b,0,hs.h),hs.col);const gp=gable(hs,X_,za,zb);if(z0>=za-.5)fillP(gp,hs.col);
   // lijst en schaduw onder de goot
   ctx.fillStyle='rgba(0,0,0,.25)';path(wallQ(X_,a,b,hs.h-.25,hs.h));ctx.fill();
   const pw=Math.abs(P3(X_,0,a).x-P3(X_,0,b).x);if(pw<5)return;
   const w=hs.z1-hs.z0,nc=w>5.3?3:2,ww=Math.min(1.05,w/(nc*1.75)),sp=w/nc;
   for(let f=0;;f++){const y1=f===0?.9:3.4+(f-1)*2.65;if(f>0&&y1+1.7>hs.h-.3)break;
    for(let i=0;i<nc;i++){const zc=hs.z0+sp*(i+.5)-dist();if(zc+ww/2<za||zc-ww/2>zb)continue;const r=flHash(hs.seed*13+f*7+i);
     if(f===0){if(hs.shop){continue}
      if(i===0){fillP(wallQ(X_,Zc(zc-.5),zc+.5,0,2.3),'#1a2420');fillP(wallQ(X_,Zc(zc-.44),zc+.44,2.0,2.24),r<.5?`rgba(255,200,120,${.55*fa+.1})`:'#121518');continue}}
     const lit=r<(hs.shop?.42:.3),cool=r<.06;
     fillP(wallQ(X_,Zc(zc-ww/2-.08),zc+ww/2+.08,y1-.1,y1+1.72),hs.trim);
     fillP(wallQ(X_,Zc(zc-ww/2),zc+ww/2,y1,y1+1.62),lit?(cool?`rgba(150,190,255,${.6*fa+.15})`:`rgba(255,${190+Math.floor(r*40)},110,${.6*fa+.15})`):'#0e1116');
     ctx.fillStyle=hs.trim;path(wallQ(X_,Zc(zc-.03),zc+.03,y1,y1+1.62));ctx.fill();path(wallQ(X_,Zc(zc-ww/2),zc+ww/2,y1+.98,y1+1.04));ctx.fill()}}
   // winkelpui op de begane grond: een lichte etalage met een gekleurde naamband
   if(hs.shop){const r=flHash(hs.seed*3),cols=['#ff4d6d','#3fd0c9','#ffd166','#b8a1ff','#7cd67c','#ff8a3c'],c=cols[Math.floor(r*cols.length)];
    fillP(wallQ(X_,a,b,.25,2.6),`rgba(255,${200+Math.floor(r*40)},${150+Math.floor(r*60)},${.3*fa+.08})`);fillP(wallQ(X_,a,b,2.6,3.1),c);
    ctx.fillStyle='rgba(0,0,0,.35)';for(let zz=hs.z0+1.4;zz<hs.z1-.5;zz+=1.5){const zr=zz-dist();if(zr<za||zr>zb)continue;path(wallQ(X_,Zc(zr-.04),zr+.04,.25,2.6));ctx.fill()}
    if(fa>.1)add(()=>{const c2=P3(X_,1.4,(a+b)/2);glow(c2.x,c2.y,c2.s*2.2,'255,220,170',.16*fa)})}
   // hijsbalk
   if(hs.g!=='lijst'&&z0>=za){const m=(hs.z0+hs.z1)/2-dist(),p1=P3(X_,hs.h+Math.min(3.4,w*.62)*.62,m),p2=P3(X_-sd*.5,hs.h+Math.min(3.4,w*.62)*.62,m);ctx.strokeStyle='#15110e';ctx.lineWidth=Math.max(1,p1.s*.09);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke()}}
  function rowHouses(list,X_,sd,za,zb){for(let i=list.length-1;i>=0;i--){const hs=list[i];if(hs.z0-dist()>zb||hs.z1-dist()<za)continue;house(hs,X_,sd,za,zb)}}
  // gracht: water met weerspiegelingen, de overkant en bruggen met lichtjes
  const OX=FL_W+11;
  function gracht(za,zb){const wy=-1.3;
   rowHouses(Wd.O,OX+.6,1,za,zb+20);
   const g=ctx.createLinearGradient(0,P3(0,wy,zb).y,0,H);g.addColorStop(0,'#0b1424');g.addColorStop(1,'#04070d');fillP(flatQ(FL_W+.3,OX,za,zb,wy),'#08101c');ctx.fillStyle=g;path(flatQ(FL_W+.3,OX,za,zb,wy));ctx.fill();
   // weerspiegeling van verlichte ramen aan de overkant: trillende strepen
   add(()=>{for(const hs of Wd.O){const z0=hs.z0-dist();if(z0<za||z0>zb)continue;const fa=fade(z0);if(fa<=0)continue;for(let i=0;i<3;i++){const r=flHash(hs.seed*5+i);if(r>.45)continue;
    const zz=z0+(hs.z1-hs.z0)*(i+.5)/3,p=P3(OX,wy,zz),q_=P3(OX-6,wy,zz),wob=reduce?0:Math.sin(t*3+zz)*p.s*.08;
    const g2=ctx.createLinearGradient(p.x,0,q_.x,0);g2.addColorStop(0,`rgba(255,190,110,${.32*fa})`);g2.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=g2;ctx.fillRect(Math.min(p.x,q_.x)+wob,p.y-p.s*.06,Math.abs(q_.x-p.x),Math.max(1,p.s*.12))}}});
   if(!reduce){ctx.strokeStyle='rgba(160,190,230,.08)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<14;k++){const zz=((k*5.3-dist()*.15+t*1.4)%60+60)%60+Math.max(za,1),X1=FL_W+1+flHash(k)*7;const a1=P3(X1,wy,zz),b1=P3(X1+1.2,wy,zz);ctx.moveTo(a1.x,a1.y);ctx.lineTo(b1.x,b1.y)}ctx.stroke()}
   // kademuur: de rand van de straat
   fillP(flatQ(FL_W,FL_W+.3,za,zb,0),'#3a3631');fillP(wallQ(FL_W+.3,za,zb,wy,0),'#1f1c1a');
   for(const zb_ of Wd.bridges)bridge(zb_-dist(),za,zb)}
  function bridge(z,za,zb){if(z<za-3||z>zb)return;const wy=-1.3,X1=FL_W+.3,X2=OX,dk=.6,fa=fade(z);
   fillP(flatQ(X1,X2,Zc(z),z+3.2,dk),'#2c2824');
   const top=[],bot=[];for(let i=0;i<=16;i++){const X_=X1+(X2-X1)*i/16;top.push(P3(X_,dk,Zc(z)));bot.push(P3(X_,wy+(dk-.45-wy)*Math.sin(Math.PI*i/16),Zc(z)))}
   fillP(top.concat(bot.slice().reverse()),'#3c3530');
   fillP(top.map(p=>({x:p.x,y:p.y})).concat(top.slice().reverse().map(p=>({x:p.x,y:p.y-p.s*.32}))),'#4a423a');
   // de lichtjes onder de boog
   add(()=>{bot.forEach((p,i)=>{if(i%2)return;const b=P3(0,0,0);ctx.fillStyle=`rgba(255,226,150,${.9*fa+.1})`;ctx.beginPath();ctx.arc(p.x,p.y-p.s*.05,Math.max(1,p.s*.05),0,7);ctx.fill();glow(p.x,p.y,p.s*.35,'255,200,110',.35*fa)})});
   ctx.strokeStyle='#1d1a17';ctx.lineWidth=Math.max(1,top[0].s*.05);ctx.beginPath();top.forEach((p,i)=>{const y=p.y-p.s*.95;i?ctx.lineTo(p.x,y):ctx.moveTo(p.x,y)});ctx.stroke()}
  // steeg: bakstenen muur met deuren, rode ramen en graffiti
  function muur(sd,za,zb){const X_=sd*FL_W,hh=8.5;const a=P3(X_,0,za),b=P3(X_,0,zb);const g=ctx.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,'#3d2722');g.addColorStop(1,'#120c0b');ctx.fillStyle=g;path(wallQ(X_,za,zb,0,hh));ctx.fill();
   ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.beginPath();for(let y=.3;y<hh;y+=.3){const p=P3(X_,y,za),q_=P3(X_,y,Math.min(zb,40));ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y)}ctx.stroke();
   const st=4.5;for(let k=Math.floor((dist()+za)/st);k*st<dist()+zb;k++){const zz=k*st-dist();if(zz+2<za)continue;const n=k*2+(sd>0?1:0),h_=flHash(n),fa=fade(zz);
    if(h_<.3){fillP(wallQ(X_,Zc(zz+.6),zz+1.7,0,2.3),'#120f0e');fillP(wallQ(X_,Zc(zz+.62),zz+1.68,1.9,2.2),`rgba(255,190,120,${.4*fa})`)}
    else if(h_<.5){fillP(wallQ(X_,Zc(zz+.8),zz+2.6,2.6,4.2),`rgba(255,40,70,${.55*fa+.08})`);if(fa>0)add(()=>{const c=P3(X_,3.4,zz+1.7);glow(c.x,c.y,c.s*2.4,'255,40,80',.22*fa)})}
    else if(h_<.62){const cs=['#ff6b9d','#5ce1c4','#ffd166','#7cc4ff'];ctx.globalAlpha=.55;fillP(wallQ(X_,Zc(zz+.4),zz+2.4,.5,1.4),cs[Math.floor(flHash(n+9)*4)]);ctx.globalAlpha=1}
    if(flHash(n+3)>.72)fillP(wallQ(X_,Zc(zz+3.2),zz+3.32,0,hh),'#2a211e')}}
  // haven: gestapelde containers
  function containers(za,zb){const X_=-FL_W;for(let i=Wd.L.length-1;i>=0;i--){const c=Wd.L[i],z0=c.z0-dist(),z1=c.z1-dist();if(z1<za||z0>zb)continue;const a=Zc(Math.max(z0,za)),b=Math.min(z1,zb),fa=fade(a);
    for(let j=0;j<c.n;j++){fillP(wallQ(X_,a,b,j*2.6,j*2.6+2.5),c.c[j]);ctx.fillStyle='rgba(0,0,0,.28)';path(wallQ(X_,a,b,j*2.6+2.38,j*2.6+2.5));ctx.fill();
     if(Math.abs(P3(X_,0,a).x-P3(X_,0,b).x)>20){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();for(let zz=Math.ceil(z0/.6)*.6;zz<b;zz+=.6){if(zz<a)continue;const p=P3(X_,j*2.6+.1,zz),q_=P3(X_,j*2.6+2.4,zz);ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y)}ctx.stroke()}}
    ctx.fillStyle=`rgba(0,0,0,${.35*(1-fa)})`;path(wallQ(X_,a,b,0,c.n*2.6));ctx.fill()}}
  function kade(za,zb){const wy=-1.6;fillP(flatQ(FL_W+.3,FL_W+60,za,zb,wy),'#050a12');
   add(()=>{for(let k=0;k<8;k++){const zz=20+k*7-(dist()*.2%7),p=P3(FL_W+3+flHash(k)*20,wy,zz);if(zz>zb)continue;ctx.fillStyle=`rgba(255,150,60,${.12*fade(zz)})`;ctx.fillRect(p.x,p.y,p.s*2.5,Math.max(1,p.s*.06))}});
   fillP(flatQ(FL_W,FL_W+.3,za,zb,0),'#5a5148');fillP(wallQ(FL_W+.3,za,zb,wy,0),'#1b1917')}
  // binnen: gang, schappen of glazen kantoorwanden
  function binnen(th,sd,za,zb){const X_=sd*FL_W,al=X.alarm;
   const base=th==='kantoor'?'#1f2a38':th==='winkel'?'#2a2d33':al?'#2a1b1d':'#262a31';const a=P3(X_,0,za),b=P3(X_,0,zb),g=ctx.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,base);g.addColorStop(1,'#0b0c0f');ctx.fillStyle=g;path(wallQ(X_,za,zb,0,FL_CEIL));ctx.fill();
   if(th==='winkel'){// schappen vol producten
    const PC=['#e0313f','#f2c230','#3fa0e0','#5cc36b','#ff8a3c','#e9e6df','#b8a1ff'];for(const y of [.1,.6,1.1,1.6]){fillP(wallQ(X_,za,zb,y,y+.06),'#c9ccd1')}
    for(let k=Math.floor((dist()+za)/.7);k*.7<dist()+Math.min(zb,30);k++){const zz=k*.7-dist();if(zz<za)continue;for(let j=0;j<4;j++){const r=flHash(k*5+j+(sd>0?77:0));if(r<.12)continue;fillP(wallQ(X_,Zc(zz+.05),zz+.62,.16+j*.5,.16+j*.5+.32+r*.08),PC[Math.floor(r*PC.length)])}}
    for(let k=Math.floor((dist()+za)/9);k*9<dist()+zb;k++){const zz=k*9-dist()+3;if(zz<za||zz>zb)continue;fillP(wallQ(X_,Zc(zz),zz+1.6,2.5,3.0),flHash(k)<.5?'#e0313f':'#f2c230')}}
   else if(th==='kantoor'){// glazen wanden met bureaus en schermen erachter
    for(let k=Math.floor((dist()+za)/3);k*3<dist()+zb;k++){const zz=k*3-dist();if(zz+3<za)continue;const r=flHash(k+(sd>0?40:0)),fa=fade(zz);
     fillP(wallQ(X_,Zc(zz+.5),zz+2.4,.75,.8),'#3a4250');if(r<.6){fillP(wallQ(X_,Zc(zz+1),zz+1.6,.85,1.25),`rgba(120,190,255,${.55*fa+.1})`)}
     fillP(wallQ(X_,Zc(zz),zz+.08,0,FL_CEIL),'#8a96a6')}
    ctx.fillStyle='rgba(140,190,255,.06)';path(wallQ(X_,za,zb,0,FL_CEIL));ctx.fill()}
   else{// gang: deuren met licht eronder
    for(let k=Math.floor((dist()+za)/6.5);k*6.5<dist()+zb;k++){const zz=k*6.5-dist()+2;if(zz+1.2<za)continue;const r=flHash(k*2+(sd>0?1:0)),fa=fade(zz);
     fillP(wallQ(X_,Zc(zz-.1),zz+1.2,0,2.4),'#15171b');fillP(wallQ(X_,Zc(zz),zz+1.1,0,2.3),al?'#3a2224':'#3a414c');if(r<.4)fillP(wallQ(X_,Zc(zz),zz+1.1,0,.05),`rgba(169,220,255,${.4*fa})`);
     if(al&&r>.5){const c=P3(X_,FL_CEIL-.4,zz+3.2),on=Math.sin(t*9+k)>0;if(zz+3.2>za&&zz+3.2<zb){ctx.fillStyle=on?'#ff3d52':'#4a1218';ctx.fillRect(c.x-c.s*.09,c.y-c.s*.09,c.s*.18,c.s*.18);if(on)add(()=>glow(c.x,c.y,c.s*1.4,'255,61,82',.3*fa+.05))}}}}
   ctx.fillStyle='rgba(0,0,0,.4)';path(wallQ(X_,za,zb,0,.14));ctx.fill()}
  // straatverlichting en decor (bomen, fietsen, bolders, havenmasten)
  function deco(d,za,zb){const z=d.z-dist();if(z<za-1||z>zb)return;const s=P3(d.X,0,z);if(s.s<.8)return;const fa=fade(z);
   ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
   if(d.k==='boom'){rect(-.1,0,.2,3.3,'#2a2019');ctx.restore();const cr=[[0,4.6,1.6],[-.8,4.1,1.1],[.9,4.3,1.2],[.2,5.5,1.2],[-.5,5.2,1]];cr.forEach(([dx,y,r],i)=>{const c=P3(d.X-.5+dx,y,z);ctx.fillStyle=i%2?'#14281a':'#1a3321';ctx.beginPath();ctx.arc(c.x,c.y,r*c.s,0,7);ctx.fill()});
    const lc=P3(d.X-.9,3.8,z);ctx.fillStyle=`rgba(255,170,80,${.1*fa})`;ctx.beginPath();ctx.arc(lc.x,lc.y,1.1*lc.s,0,7);ctx.fill();return}
   if(d.k==='lamp'){rect(-.05,0,.1,4.4,'#1c2a22');rect(-.12,0,.24,.5,'#1c2a22');rect(-.2,4.3,.4,.12,'#1c2a22');poly([[-.17,4.42],[.17,4.42],[.22,4.85],[-.22,4.85]],'#ffd08a');poly([[-.24,4.85],[.24,4.85],[0,5.05]],'#1c2a22');ctx.restore();
    const c=P3(d.X,4.62,z);add(()=>glow(c.x,c.y,c.s*1.8,'255,160,70',.42*fa+.05));pool(d.X-.8,z,2.6,'255,140,50',.22*fa+.03);return}
   if(d.k==='wandlamp'){ctx.restore();const sd=Math.sign(d.X),c=P3(d.X-sd*.3,4.2,z),w=P3(d.X,4.4,z);ctx.strokeStyle='#18130f';ctx.lineWidth=Math.max(1,c.s*.06);ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(c.x,c.y);ctx.stroke();
    ctx.fillStyle='#ffd08a';ctx.fillRect(c.x-c.s*.12,c.y,c.s*.24,c.s*.14);add(()=>glow(c.x,c.y,c.s*1.7,'255,150,70',.4*fa+.05));pool(d.X-sd*1.1,z,2.3,'255,140,50',.2*fa+.03);return}
   if(d.k==='fietsen'){for(let i=0;i<2+d.c;i++){ctx.save();ctx.translate(-.05,0);ctx.scale(.32,1);ctx.translate(i*.9-.6,0);bikeSide(['#2b2f36','#6b2a2a','#1f3a5a','#3a4a2a'][(i+d.c)%4]);ctx.restore()}ctx.restore();return}
   if(d.k==='bolder'){rect(-.12,0,.24,.5,'#1b1d22');rect(-.16,.45,.32,.1,'#2b2e34');ctx.restore();return}
   if(d.k==='mast'){rect(-.08,0,.16,9,'#2b2e34');rect(-.5,8.8,1,.2,'#2b2e34');ctx.restore();const c=P3(d.X,8.7,z);add(()=>glow(c.x,c.y,c.s*3,'255,150,60',.4*fa+.05));pool(d.X-1.5,z,3.5,'255,140,50',.2*fa+.03);return}
   ctx.restore()}
  // lucht en skyline: gracht met de Westertoren in de verte, kranen bij de haven
  function sky(th){const g=ctx.createLinearGradient(0,0,0,hy+4);if(th.R==='kade'){g.addColorStop(0,'#05070d');g.addColorStop(1,'#2a1a14')}else{g.addColorStop(0,'#060914');g.addColorStop(1,'#231a2c')}ctx.fillStyle=g;ctx.fillRect(0,0,W,hy+4);
   for(let i=0;i<26;i++){const x=flHash(i)*W,y=flHash(i+50)*hy*.7;ctx.fillStyle=`rgba(255,255,255,${.15+flHash(i+9)*.35})`;ctx.fillRect(x,y,1,1)}
   const v=P3(0,0,200),u=Math.min(W,H)/360;
   if(th.R==='gracht'||th.L==='winkels'){ctx.fillStyle='#0d0f19';const x=v.x+W*.05,y=hy+2;ctx.fillRect(x-6*u,y-70*u,12*u,70*u);ctx.fillRect(x-4.5*u,y-92*u,9*u,22*u);ctx.beginPath();ctx.moveTo(x-3*u,y-92*u);ctx.lineTo(x,y-120*u);ctx.lineTo(x+3*u,y-92*u);ctx.fill();
    ctx.fillStyle='#2a5bd7';ctx.beginPath();ctx.arc(x,y-96*u,3.2*u,0,7);ctx.fill();add(()=>glow(x,y-80*u,26*u,'255,190,120',.18))}
   if(th.R==='kade'){ctx.strokeStyle='#0f1116';ctx.lineWidth=3*u;for(let i=0;i<3;i++){const x=v.x+(40+i*70)*u,y=hy+2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-80*u);ctx.lineTo(x+60*u,y-80*u);ctx.moveTo(x-20*u,y-70*u);ctx.lineTo(x+50*u,y-70*u);ctx.stroke();ctx.fillStyle=Math.floor(t*1.5+i)%2?'#ff3d52':'#5a1a20';ctx.fillRect(x+56*u,y-84*u,4*u,4*u)}}
   add(()=>glow(v.x,hy,W*.5,th.amb||'255,160,90',.12))}
  // de grond: kinderkopjes, klinkers, beton of tegels
  function ground(th,za,zb){const inn=!!th.in;let c1=th.R==='kade'?'#2a2a2c':inn?(th===FL_TH.kantoor?'#141c2a':th===FL_TH.winkel?'#3a3d42':'#1f2126'):'#1b1a1c';
   const a=P3(0,0,za),b=P3(0,0,zb),g=ctx.createLinearGradient(0,b.y,0,a.y);g.addColorStop(0,'#08090b');g.addColorStop(1,c1);ctx.fillStyle=g;path(flatQ(-FL_W,FL_W,za,zb,0));ctx.fill();
   ctx.strokeStyle=inn?'rgba(255,255,255,.05)':'rgba(255,255,255,.045)';ctx.lineWidth=1;ctx.beginPath();const st=inn?1.2:.55;
   for(let k=Math.ceil((dist()+za)/st)*st;k<dist()+Math.min(zb,36);k+=st){const z=k-dist();const p=P3(-FL_W,0,z),q_=P3(FL_W,0,z);ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y)}ctx.stroke();
   if(!inn&&th.R!=='kade'){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.beginPath();for(let i=-6;i<=6;i++){const X_=i*.45,p=P3(X_,0,Zc(za)),q_=P3(X_,0,Math.min(zb,36));ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y)}ctx.stroke()}
   if(th.R==='kade'){[-1,1].forEach(l=>{const X_=l*.75*FL_LANE;ctx.strokeStyle='rgba(242,194,48,.28)';ctx.lineWidth=2;ctx.beginPath();for(let k=Math.floor(dist()/3)*3;k<dist()+Math.min(46,zb);k+=3){const z1=k-dist(),z2=z1+1.6;if(z2<za)continue;const p=P3(X_,0,Zc(z1)),q_=P3(X_,0,z2);ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y)}ctx.stroke()})}
   if(inn){[-1,1].forEach(sd=>{const X_=sd*(FL_W-.3),p=P3(X_,0,za),q_=P3(X_,0,zb);ctx.strokeStyle=X.alarm?'rgba(255,214,90,.4)':'rgba(255,214,90,.22)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q_.x,q_.y);ctx.stroke()})}
   // natte straat: plassen die het licht weerkaatsen
   if(th.rain)for(let k=Math.floor(dist()/7)*7;k<dist()+40;k+=7){const z=k-dist()+3.2;if(z<za||z>zb)continue;const n=Math.floor(k/7);if(flHash(n)<.45)continue;pool((flHash(n+3)-.5)*3.6,z,1.1,'255,150,70',.14)}}
  function ceiling(za,zb){ctx.fillStyle=X.alarm?'#120c0d':'#0e1013';path(flatQ(-FL_W,FL_W,za,zb,FL_CEIL));ctx.fill();
   const ls=5.2;for(let k=Math.floor((dist()+za)/ls);k*ls<dist()+zb;k++){const z1=k*ls-dist()+2,z2=z1+1.5;if(z2<za||z1>zb)continue;const fl=X.alarm?.55+.45*Math.max(0,Math.sin(t*2.2+k)):1,fa=fade(z1);
    ctx.fillStyle=X.alarm?`rgba(255,200,200,${.35*fl})`:`rgba(225,240,255,${.35+.4*fa})`;path(flatQ(-.42,.42,Zc(z1),z2,FL_CEIL));ctx.fill();
    const fg=flClamp(1-z1/26,0,1),c=P3(0,FL_CEIL,(z1+z2)/2);if(fg>0)add(()=>glow(c.x,c.y,c.s*1.8,X.alarm?'255,80,80':'200,230,255',.14*fl*fg));pool(0,(z1+z2)/2,1.8,X.alarm?'255,80,80':'200,230,255',.08*fl*fg+.015)}}
  // de deur van binnen naar buiten: een muur met een grote opening en een groen bordje
  function doorWall(z){if(z<near||z>90)return;fillP([P3(-FL_W,2.7,z),P3(FL_W,2.7,z),P3(FL_W,FL_CEIL,z),P3(-FL_W,FL_CEIL,z)],X.alarm?'#1c1314':'#1d2025');
   fillP([P3(-FL_W,0,z),P3(-FL_W+.25,0,z),P3(-FL_W+.25,2.7,z),P3(-FL_W,2.7,z)],'#15171b');fillP([P3(FL_W-.25,0,z),P3(FL_W,0,z),P3(FL_W,2.7,z),P3(FL_W-.25,2.7,z)],'#15171b');
   const s1=P3(-.5,3.25,z),s2=P3(.5,2.85,z);ctx.fillStyle='#16a34a';ctx.fillRect(s1.x,s1.y,s2.x-s1.x,s2.y-s1.y);
   ctx.strokeStyle='#eafff1';ctx.lineWidth=Math.max(1,s1.s*.05);ctx.beginPath();const my=(s1.y+s2.y)/2,mx=(s1.x+s2.x)/2,u=s1.s*.14;ctx.moveTo(mx-u*1.3,my);ctx.lineTo(mx+u*1.1,my);ctx.moveTo(mx+u*.4,my-u*.7);ctx.lineTo(mx+u*1.1,my);ctx.lineTo(mx+u*.4,my+u*.7);ctx.stroke();
   add(()=>glow((s1.x+s2.x)/2,(s1.y+s2.y)/2,s1.s*1.1,'40,220,110',.35))}
  // het einde: een lichte zijstraat, de brug of je voertuig
  function exitView(ez){if(ez>95)return;const th=TO,fa=fade(ez)*.8+.2;
   fillP([P3(-FL_W-30,0,ez+9),P3(FL_W+30,0,ez+9),P3(FL_W+30,9,ez+9),P3(-FL_W-30,9,ez+9)],'#16131a');
   for(let i=-5;i<=5;i++){const x1=i*4.4;const y1=1+flHash(i+30)*.2;fillP([P3(x1+.8,y1+1.2,ez+8.9),P3(x1+2,y1+1.2,ez+8.9),P3(x1+2,y1+2.6,ez+8.9),P3(x1+.8,y1+2.6,ez+8.9)],flHash(i+7)<.5?`rgba(255,200,120,${.6*fa})`:'#0d0f14')}
   fillP(flatQ(-FL_W-30,FL_W+30,ez,ez+9,0),'#1f1c1e');
   add(()=>{const c=P3(0,1.5,ez+4);glow(c.x,c.y,c.s*7,th.amb||'255,180,110',.32*fa)});
   if(X.veh){const s=P3(0,0,ez+3);ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);VEH[X.veh.k]();ctx.restore()}}
  const dist=()=>C.dist;
  function scene(){const ez=C.len-C.dist,far=Math.min(110,ez+12),dz=X.inn?X.doorZ-C.dist:-999;
   const outA=Math.max(near,dz),outVisible=far>outA;
   if(outVisible){sky(TO);ground(TO,outA,far);
    // zijkanten buiten
    if(TO.L==='gevels'||TO.L==='winkels')rowHouses(Wd.L,-FL_W,-1,outA,Math.min(far,ez));
    if(TO.L==='muur'){muur(-1,outA,Math.min(far,ez));muur(1,outA,Math.min(far,ez))}
    if(TO.L==='containers')containers(outA,Math.min(far,ez));
    if(TO.R==='winkels')rowHouses(Wd.R,FL_W,1,outA,Math.min(far,ez));
    if(TO.R==='gracht')gracht(outA,far);
    if(TO.R==='kade')kade(outA,far);
    exitView(ez);
    for(let i=Wd.deco.length-1;i>=0;i--)deco(Wd.deco[i],outA,Math.min(far,ez))}
   if(X.inn&&dz>near){const zb=Math.min(dz,far);if(!outVisible){ctx.fillStyle='#08090b';ctx.fillRect(0,0,W,H)}
    doorWall(dz);ceiling(near,zb);binnen(X.inn,-1,near,zb);binnen(X.inn,1,near,zb);ground(TI,near,zb)}}
  // ---------- obstakels ----------
  function bikeSide(col){ctx.strokeStyle='#121316';ctx.lineWidth=.05;ctx.beginPath();ctx.arc(-.34,-.34,.33,0,7);ctx.moveTo(.67,-.34);ctx.arc(.34,-.34,.33,0,7);ctx.stroke();
   ctx.strokeStyle=col;ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(-.34,-.34);ctx.lineTo(-.02,-.36);ctx.lineTo(.2,-.8);ctx.lineTo(-.14,-.8);ctx.lineTo(-.34,-.34);ctx.moveTo(-.02,-.36);ctx.lineTo(.34,-.34);ctx.lineTo(.22,-.88);ctx.stroke();rect(-.24,.8,.22,.05,'#111');rect(.1,.88,.3,.05,'#222')}
  function person(o,body,leg,kind){const sw=Math.sin(t*3+o.sd*9)*.03;
   rect(-.2,0,.17,.9,leg);rect(.03,0,.17,.9,leg);rect(-.23,0,.2,.07,'#0a0a0a');rect(.03,0,.2,.07,'#0a0a0a');
   rect(-.27,.86,.54,.7,body);rect(-.42+sw,.95,.15,.58,body);rect(.27-sw,.95,.15,.58,body);
   if(kind==='agent'){rect(-.27,1.0,.54,.1,'#f2d22e');rect(-.27,1.1,.54,.06,'#2a5bd7');rect(-.27,1.3,.54,.04,'#cfd8e6')}
   if(kind==='bewaker'){rect(-.06,1.2,.12,.36,'#e6e6e6');rect(-.03,1.22,.06,.32,'#111')}
   if(kind==='mens'){rect(.14,.82,.22,.3,'#25282e')}
   if(kind==='toerist'){rect(-.3,.86,.6,.1,'rgba(255,255,255,.15)');rect(-.08,1.22,.16,.12,'#111');circ(0,1.28,.04,'#4d7dff');rect(.36,0,.26,.5,'#2b3a5a');rect(.46,.5,.04,.32,'#999')}
   if(kind==='schoon'){rect(-.27,1.05,.54,.07,'#f2c230');rect(.4,0,.04,1.45,'#c9a227');rect(.3,0,.25,.09,'#e9e6df');rect(-.42,.6,.22,.24,'#3b82f6')}
   if(kind==='haven'){rect(-.27,.95,.54,.08,'#e9e6df');rect(-.27,1.25,.54,.08,'#e9e6df')}
   circ(0,1.72,.13,'#c99b7a');
   if(kind==='agent'){rect(-.17,1.79,.34,.1,'#16233f');rect(-.2,1.78,.4,.04,'#0e1830');rect(-.17,1.84,.34,.03,'#e6e6e6')}
   else if(kind==='haven'){circ(0,1.8,.14,'#f2c230');rect(-.17,1.74,.34,.05,'#f2c230')}
   else rect(-.14,1.8,.28,.07,kind==='bewaker'?'#0a0a0a':kind==='toerist'?'#c0262f':'#2a2522');
   if(kind==='bewaker'){add(()=>{const g=ctx.createRadialGradient(.4,-1.0,.05,.4,-1.0,1.2);g.addColorStop(0,'rgba(255,240,190,.35)');g.addColorStop(1,'rgba(255,240,190,0)');ctx.fillStyle=g;ctx.fillRect(-.8,-2.2,2.4,2.4)});circ(.38,1.0,.05,'#fff7d6')}}
  const DRAW={
   kliko(o){rect(-.34,.08,.68,.98,'#1d4a33');rect(.18,.08,.16,.98,'#163a28');rect(-.37,1.0,.74,.14,'#2a6a48');rect(-.37,1.11,.74,.04,'#3c8a60');circ(-.24,.08,.08,'#0a0a0a');circ(.24,.08,.08,'#0a0a0a');rect(-.2,.75,.4,.06,'rgba(255,255,255,.12)')},
   fiets(o){bikeSide(o.sd<.5?'#9a3b2c':'#2c5a9a')},
   bakfiets(o){rect(-.42,.3,.84,.55,'#2f6b4a');rect(-.42,.82,.84,.06,'#3d8a60');circ(-.3,.14,.14,'#111');circ(.3,.14,.14,'#111');rect(-.05,.85,.1,.45,'#222');rect(-.25,1.25,.5,.05,'#222');rect(-.3,.55,.6,.12,'rgba(255,255,255,.1)')},
   agent(o){person(o,'#16233f','#1d2c4f','agent')},mens(o){person(o,o.c||'#3b4a5c','#22252b','mens')},toerist(o){person(o,o.c||'#246b6b','#3a3f48','toerist')},
   bewaker(o){person(o,'#0f1012','#17191c','bewaker')},schoonmaker(o){person(o,'#2d5f86','#24435c','schoon')},havenman(o){person(o,'#e86a1a','#2a2f38','haven')},
   fietser(o){ctx.save();ctx.scale(o.dir||1,1);bikeSide('#c0262f');rect(-.12,.85,.3,.55,o.c||'#3a4a6a');circ(.06,1.55,.12,'#c99b7a');rect(.04,1.0,.36,.08,o.c||'#3a4a6a');rect(-.12,.5,.1,.4,'#22252b');ctx.restore()},
   scooter(o){rect(-.2,.06,.4,.42,'#20242a');poly([[-.32,.4],[.32,.4],[.26,.95],[-.26,.95]],'#b8242f');rect(-.2,.95,.4,.12,'#7d1820');rect(-.36,1.05,.72,.06,'#1a1a1a');circ(0,.14,.13,'#0b0b0b');rect(-.08,.7,.16,.1,'rgba(255,240,200,.85)')},
   dozen(o){[[-.31,0,.62,.55,'#8a6a42'],[-.28,.55,.56,.5,'#9a7748'],[-.22,1.05,.44,.56,'#87683f']].forEach(b=>{rect(b[0],b[1],b[2],b[3],b[4]);rect(b[0],b[1]+b[3]*.45,b[2],b[3]*.1,'rgba(255,255,255,.12)');rect(b[0]+b[2]*.8,b[1],b[2]*.2,b[3],'rgba(0,0,0,.18)')})},
   kast(o){rect(-.32,0,.64,1.96,'#4a515c');rect(.18,0,.14,1.96,'#3a4048');rect(-.3,.04,.29,1.88,'#535b67');rect(.01,.04,.28,1.88,'#4d5560');rect(-.06,.9,.04,.2,'#c9d1da');rect(.05,.9,.04,.2,'#c9d1da')},
   plant(o){rect(-.18,0,.36,.45,'#6b4a32');[[0,1.0,.3],[-.18,.8,.22],[.2,.85,.22],[0,1.35,.24]].forEach(([x,y,r])=>circ(x,y,r,'#2d6b3f'))},
   printer(o){rect(-.32,0,.64,.8,'#c9ccd1');rect(.18,0,.14,.8,'#a9adb4');rect(-.34,.8,.68,.3,'#dfe2e6');rect(-.3,1.1,.6,.1,'#b9bdc3');rect(.13,.93,.13,.08,'#4ade80')},
   container(o){rect(-.42,.1,.84,1.1,'#3d5a44');rect(.2,.1,.22,1.1,'#2f4736');rect(-.46,1.2,.92,.14,'#4c6f55');circ(-.3,.08,.08,'#0b0b0b');circ(.3,.08,.08,'#0b0b0b');rect(-.12,.62,.24,.07,'#e9e6df')},
   vaten(o){[-.24,.24].forEach((x,i)=>{rect(x-.22,0,.44,.95,i?'#2c4f8a':'#8a2c24');rect(x-.22,.3,.44,.05,'rgba(0,0,0,.3)');rect(x-.22,.62,.44,.05,'rgba(0,0,0,.3)');rect(x-.22,.9,.44,.05,'rgba(255,255,255,.15)')})},
   kist(o){rect(-.5,0,1,1.5,'#7a5a36');rect(-.5,0,1,.1,'#5a4126');rect(-.5,1.4,1,.1,'#5a4126');ctx.strokeStyle='#5a4126';ctx.lineWidth=.06;ctx.beginPath();ctx.moveTo(-.45,-.1);ctx.lineTo(.45,-1.4);ctx.stroke()},
   busje(o){rect(-1.05,.2,2.1,1.5,'#e9ecef');rect(-1.05,1.7,2.1,.35,'#dfe3e8');rect(-.9,1.2,1.8,.42,'#1a2230');rect(-1.0,.06,.42,.2,'#0b0b0b');rect(.58,.06,.42,.2,'#0b0b0b');rect(-.98,.55,.25,.14,'#c0262f');rect(.73,.55,.25,.14,'#c0262f');rect(-.6,.7,1.2,.3,'#2a5bd7');rect(-.3,.78,.6,.12,'#e9ecef')},
   pallet(o){rect(-.58,0,1.16,.12,'#6b4e2e');rect(-.58,.18,1.16,.12,'#7d5c37');rect(-.58,.36,1.16,.12,'#8a6740');[-.52,-.06,.4].forEach(x=>rect(x,0,.12,.48,'#5a4126'))},
   krat(o){[-.5,0].forEach(x=>{rect(x,0,.48,.6,o.c||'#2f6b4a');rect(x+.04,.34,.4,.06,'rgba(0,0,0,.35)');rect(x+.04,.16,.4,.06,'rgba(0,0,0,.35)');rect(x,.56,.48,.04,'rgba(255,255,255,.2)')})},
   kar(o){rect(-.46,.08,.92,.12,'#c9a227');circ(-.36,.06,.06,'#111');circ(.36,.06,.06,'#111');rect(-.4,.2,.38,.36,'#8a6a42');rect(.02,.2,.36,.3,'#9a7748')},
   winkelwagen(o){ctx.strokeStyle='#c9ccd1';ctx.lineWidth=.04;ctx.beginPath();for(let i=0;i<6;i++){ctx.moveTo(-.38+i*.15,-.3);ctx.lineTo(-.34+i*.14,-.85)}ctx.moveTo(-.4,-.3);ctx.lineTo(.4,-.3);ctx.moveTo(-.36,-.85);ctx.lineTo(.38,-.85);ctx.stroke();circ(-.3,.06,.06,'#111');circ(.3,.06,.06,'#111');rect(-.4,.92,.8,.05,'#e0313f')},
   bureau(o){rect(-.68,.68,1.36,.08,'#5b4632');rect(-.64,0,.07,.68,'#2b2f36');rect(.57,0,.07,.68,'#2b2f36');rect(-.6,.3,.5,.36,'#3a3f47');rect(-.22,.76,.3,.24,'#14171c');rect(-.19,.79,.24,.18,'rgba(169,220,255,.45)')},
   stoel(o){rect(-.04,.08,.08,.36,'#2b2f36');rect(-.3,0,.6,.06,'#2b2f36');rect(-.27,.42,.54,.12,'#1f2937');rect(-.24,.54,.48,.4,'#273244')},
   zakken(o){[[-.33,.27,.29,'#16181b'],[.1,.3,.32,'#1b1d21'],[-.1,.62,.24,'#22252a']].forEach(([x,cy,r,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,-cy,r,r*.92,0,0,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.09)';ctx.beginPath();ctx.ellipse(x-r*.38,-cy-r*.4,r*.24,r*.13,-.5,0,7);ctx.fill()})},
   dranghek(o){rect(-.5,0,.06,.85,'#c9d1da');rect(.44,0,.06,.85,'#c9d1da');rect(-.5,.8,1,.05,'#c9d1da');rect(-.5,.12,1,.04,'#c9d1da');for(let i=0;i<9;i++)rect(-.44+i*.11,.14,.02,.68,'#aab2bc');rect(-.58,0,.24,.04,'#555a62');rect(.34,0,.24,.04,'#555a62')},
   bord(o){poly([[-.22,0],[.22,0],[.08,.66],[-.08,.66]],'#f2c230');poly([[-.15,.12],[.15,.12],[.07,.5],[-.07,.5]],'#e0a800');rect(-.025,.24,.05,.16,'#1b1d22')},
   paaltjes(o){[-.36,0,.36].forEach(x=>{rect(x-.07,0,.14,.66,'#5a1f1a');circ(x,.68,.08,'#5a1f1a');[.18,.36,.52].forEach(y=>rect(x-.075,y,.15,.04,'#e9e6df'))})},
   touw(o){rect(-.5,0,1,.12,'#3a3530');ctx.strokeStyle='#c9a26a';ctx.lineWidth=.07;ctx.beginPath();ctx.ellipse(0,-.2,.42,.14,0,0,7);ctx.ellipse(0,-.3,.34,.1,0,0,7);ctx.stroke()},
   hond(o){const d=o.dir||1,ph=t*16;ctx.save();ctx.scale(d,1);const leg=(x,p)=>{const k=Math.sin(ph+p)*.05;rect(x+k,0,.06,.24,'#3b2a1e')};leg(-.24,0);leg(-.13,2.2);leg(.12,1.1);leg(.22,3.3);
    rect(-.3,.22,.58,.2,'#7a5432');rect(.22,.34,.2,.17,'#7a5432');rect(.38,.36,.11,.09,'#5a3d25');circ(.3,.46,.022,'#000');poly([[.24,.5],[.31,.5],[.27,.6]],'#4a321f');rect(-.02,.4,.2,.03,'#c0262f');ctx.restore()},
   hek(o){for(let x=-2.55;x<2.5;x+=1.7){ctx.strokeStyle='#8b929c';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(x,-.12);ctx.lineTo(x,-.8);ctx.lineTo(x+1.55,-.8);ctx.lineTo(x+1.55,-.12);ctx.lineTo(x,-.12);for(let k=1;k<9;k++){ctx.moveTo(x+k*.172,-.12);ctx.lineTo(x+k*.172,-.8)}ctx.stroke();rect(x-.1,0,.3,.04,'#6b7078');rect(x+1.35,0,.3,.04,'#6b7078')}},
   lint(o){rect(-2.7,0,.08,.98,'#c9d1da');rect(2.62,0,.08,.98,'#c9d1da');for(let i=0;i<14;i++)rect(-2.62+i*.38,.82,.38,.1,i%2?'#f4f4f4':'#e0313f')},
   steiger(o){[-2.68,-.9,.9,2.6].forEach(x=>rect(x,0,.08,2.3,'#8b929c'));rect(-2.75,1.18,5.5,.1,'#9aa1ab');rect(-2.75,2.1,5.5,.08,'#8b929c');rect(-2.75,1.28,5.5,.16,'#7d5c37');for(let i=0;i<15;i++)rect(-2.75+i*.367,1.06,.367,.1,i%2?'#f4f4f4':'#e0313f');
    poly([[-.36,1.02],[.36,1.02],[.3,.72],[-.3,.72]],'#f2c230');rect(-.03,.78,.06,.18,'#1b1d22')},
   rolluik(o){rect(-2.75,1.12,5.5,1.38,'#4a515c');for(let y=1.18;y<2.5;y+=.12)rect(-2.75,y,5.5,.03,'rgba(0,0,0,.35)');for(let i=0;i<14;i++)rect(-2.75+i*.393,1.06,.393,.1,i%2?'#1b1d22':'#f2c230');rect(-2.8,0,.1,2.5,'#2b2f36');rect(2.7,0,.1,2.5,'#2b2f36');
    const on=Math.floor(t*4)%2;circ(-2.4,2.3,.07,on?'#ff8a1a':'#5a2a10');circ(2.4,2.3,.07,on?'#5a2a10':'#ff8a1a')},
   slagboom(o){rect(-2.8,0,.24,1.15,'#c9ccd1');rect(-2.84,1.05,.32,.25,'#2b2e34');for(let i=0;i<14;i++)rect(-2.6+i*.38,1.1,.38,.14,i%2?'#f4f4f4':'#e0313f');circ(-2.68,1.4,.06,Math.floor(t*4)%2?'#ff3d52':'#5a1a20')}};
  const VEH={moto(){rect(-.06,0,.12,.55,'#111');rect(-.34,.45,.68,.4,'#c0262f');rect(-.3,.85,.6,.08,'#1a1a1a');rect(-.38,.95,.76,.05,'#888');rect(-.1,.55,.2,.12,'rgba(255,240,200,.9)');add(()=>glow(0,-.6,1.2,'255,230,170',.3))},
   auto(){rect(-.95,.15,1.9,.7,'#5a5f66');poly([[-.8,.85],[.8,.85],[.62,1.35],[-.62,1.35]],'#4a4f56');poly([[-.7,.9],[.7,.9],[.55,1.28],[-.55,1.28]],'#141a24');rect(-.88,.5,.32,.14,'#ff3d52');rect(.56,.5,.32,.14,'#ff3d52');rect(-.9,0,.4,.18,'#0b0b0b');rect(.5,0,.4,.18,'#0b0b0b');add(()=>{glow(-.72,-.57,.6,'255,61,82',.4);glow(.72,-.57,.6,'255,61,82',.4)})},
   boot(){poly([[-1.1,.1],[1.1,.1],[.9,.6],[-1.2,.6]],'#e9ecef');rect(-.6,.6,.9,.4,'#1a2230');rect(-1.2,.55,2.3,.06,'#c0262f');add(()=>glow(0,-.3,1.4,'120,190,255',.2))},
   heli(){const yy=4.2;rect(-.9,yy,1.8,.75,'#1a1d22');poly([[.9,yy+.2],[2.4,yy+.45],[2.4,yy+.6],[.9,yy+.6]],'#1a1d22');rect(-1.6,yy+.95,3.2,.05,'#555');rect(-.05,yy+.75,.1,.2,'#333');rect(-.6,yy+.25,.6,.35,'rgba(169,220,255,.5)');
    add(()=>{const g=ctx.createLinearGradient(0,-yy,0,0);g.addColorStop(0,'rgba(255,250,220,.35)');g.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-.2,-yy);ctx.lineTo(.2,-yy);ctx.lineTo(1.3,0);ctx.lineTo(-1.3,0);ctx.fill()})}};
  function drawOb(o,z){const s=P3(o.x*FL_LANE,0,z);if(s.s<1.2)return;
   let a=1;if(z>C.reveal-8)a=flClamp((C.reveal-z)/8,0,1);if(z<0)a=Math.max(0,1+z/(o.hit?1.1:2.4));if(a<=0)return;
   ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
   ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(0,0,(o.w*FL_LANE)*.5+.05,.09,0,0,7);ctx.fill();
   if(o.hit)ctx.rotate((o.x>=C.px?1:-1)*Math.min(.9,(t-o.hitT)*5));
   (DRAW[o.t]||DRAW.kliko)(o);ctx.restore();
   // markering: laag = springen (geel), hoog = bukken (blauw), zodat je het op tijd ziet
   if((o.low&&o.w>3)||o.high){const y=o.high?.0:1.05,c=P3(0,y,z);if(z>2&&z<C.reveal){ctx.globalAlpha=a*.9;ctx.fillStyle=o.high?'#4d7dff':'#f2c230';ctx.font=`900 ${Math.max(10,c.s*.34)}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText(o.high?'▼ BUKKEN':'▲ SPRING',c.x,c.y-(o.high?-c.s*.1:c.s*.12));ctx.globalAlpha=1}}}
  // de renner van achteren, in je eigen kleren; hijgt als je adem op is
  const puffs=[];
  function drawMe(){const h=C.jumpH(),sl=C.slideH(),s=P3(C.px*FL_LANE,0,meZ);const ph=C.dist*1.85,air=C.jumpT>=0,lean=(C.lane-C.px)*.32+(stumT()?Math.sin(t*30)*.12:0);
   const hurt=stumT()||(C.done&&C.res===false),TOP=hurt?'#4a1e26':LK.top,PANT=hurt?'#3a1a20':LK.pants,RIM=hurt?'rgba(255,61,82,.9)':'rgba(255,150,70,.7)';
   ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
   ctx.fillStyle=`rgba(0,0,0,${.5-h*.25})`;ctx.beginPath();ctx.ellipse(0,0,.34-h*.12+sl*.08,.08,0,0,7);ctx.fill();
   ctx.translate(0,-h*1.0-Math.abs(Math.sin(ph))*.05*(1-sl));ctx.rotate(lean);ctx.scale(1,1-sl*.42);
   const l1=air?.25:Math.max(0,Math.sin(ph))*.32*(1-sl),l2=air?.25:Math.max(0,-Math.sin(ph))*.32*(1-sl);
   rect(-.19,l1,.16,.86-l1*.7,PANT);rect(.03,l2,.16,.86-l2*.7,PANT);rect(-.21,l1-.04,.2,.12,LK.shoe);rect(.01,l2-.04,.2,.12,LK.shoe);
   if(LK.stripe){rect(-.2,l1+.08,.025,.7-l1*.7,LK.stripe);rect(.165,l2+.08,.025,.7-l2*.7,LK.stripe)}
   const ar=air?.2:sl?-.12:Math.sin(ph)*.16;
   rect(-.4,.98+ar,.14,.5,TOP);rect(.26,.98-ar,.14,.5,TOP);rect(-.4,.98+ar,.14,.5,'rgba(0,0,0,.18)');rect(.26,.98-ar,.14,.5,'rgba(0,0,0,.18)');
   rect(-.28,.82,.56,.74,TOP);if(LK.fur){rect(-.3,.82,.6,.12,'#8a6444');rect(-.3,1.42,.6,.16,'#8a6444')}
   if(LK.stripe)rect(-.28,1.2,.56,.05,LK.stripe);
   if(LK.hood){poly([[-.2,1.56],[.2,1.56],[.17,1.92],[-.17,1.92]],TOP);circ(0,1.82,.18,TOP)}
   else{rect(-.07,1.54,.14,.1,'#b8876a');circ(0,1.8,.16,LK.hatK==='pruik'?'#5a3a22':'#2a1e16');
    if(LK.hat){if(LK.hatK==='hoed'){rect(-.26,1.86,.52,.05,LK.hat);rect(-.15,1.9,.3,.14,LK.hat)}else if(LK.hatK==='helm'){circ(0,1.84,.21,LK.hat)}else if(LK.hatK!=='pruik')poly([[-.17,1.82],[.17,1.82],[.13,1.98],[-.13,1.98]],LK.hat)}}
   ctx.fillStyle=RIM;ctx.fillRect(-.29,-1.56,.035,.72);ctx.fillRect(.255,-1.56,.035,.72);ctx.fillRect(-.415,-1.48-ar,.025,.48);ctx.fillRect(.39,-1.48+ar,.025,.48);
   ctx.beginPath();ctx.arc(0,-1.82,.17,Math.PI*1.05,Math.PI*1.95);ctx.strokeStyle=RIM;ctx.lineWidth=.035;ctx.stroke();
   ctx.restore();
   // hijgen: wolkjes adem als je bijna op bent
   if(!reduce&&C.started&&!C.done&&C.stam<.35&&Math.random()<.12)puffs.push({x:C.px*FL_LANE+(Math.random()-.5)*.2,y:1.85,z:meZ+.2,a:.5,r:.08});
   for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.y+=.012;p.r+=.006;p.a-=.012;if(p.a<=0){puffs.splice(i,1);continue}const c=P3(p.x,p.y,p.z);ctx.fillStyle=`rgba(230,236,245,${p.a})`;ctx.beginPath();ctx.arc(c.x,c.y,p.r*c.s,0,7);ctx.fill()}}
  // de agent achter je (van achteren gezien): verschijnt onderin als hij dichterbij komt
  function drawCop(){const g=C.gap;if(g>7.5||!C.started)return;const D=flClamp(CB-.6-g*.45,3.6,CB-.4),z=D-CB,s=P3(C.px*FL_LANE*.7+Math.sin(t*2.3)*.3,0,z);
   const ph=t*11,a=flClamp((7.5-g)/2,0,1);ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);ctx.translate(0,-Math.abs(Math.sin(ph))*.05);
   const l1=Math.max(0,Math.sin(ph))*.3,l2=Math.max(0,-Math.sin(ph))*.3;
   rect(-.21,l1,.18,.88,'#141d33');rect(.03,l2,.18,.88,'#141d33');rect(-.3,.84,.6,.76,'#1a2744');
   rect(-.3,1.05,.6,.12,'#f2d22e');rect(-.3,1.17,.6,.08,'#2a5bd7');rect(-.3,1.25,.6,.08,'#f2d22e');
   const reach=g<3?.35:0;rect(-.46,1.0+Math.sin(ph)*.12+reach,.15,.58,'#1a2744');rect(.31,1.0-Math.sin(ph)*.12+reach,.15,.58,'#1a2744');
   rect(-.07,1.58,.14,.1,'#c99b7a');circ(0,1.8,.16,'#2a1e16');rect(-.2,1.86,.4,.12,'#16233f');rect(-.22,1.86,.44,.04,'#e6e6e6');
   ctx.restore();
   const c=P3(C.px*FL_LANE*.7,1.42,z);if(c.s*.13>6&&c.y<H-c.s*.2){ctx.globalAlpha=a;ctx.fillStyle='#e9eef8';ctx.font=`800 ${c.s*.13}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText('POLITIE',c.x,c.y);ctx.globalAlpha=1}}
  // regen, zwaailicht, zaklamp, vignet
  const drops=Array.from({length:TO.rain?90:0},()=>({x:Math.random(),y:Math.random(),l:.4+Math.random()*.6,s:.8+Math.random()*.6}));
  function overlays(){const outside=!X.inn||C.dist>X.doorZ-3;
   if(drops.length&&outside&&!reduce){ctx.strokeStyle='rgba(190,205,230,.15)';ctx.lineWidth=1;ctx.beginPath();const sp=C.v/12;drops.forEach(d=>{const y=((d.y+t*d.s*(1.1+sp*.4))%1)*H,x=((d.x+t*.05)%1)*W,l=14*d.l*(1+sp*.3);ctx.moveTo(x,y);ctx.lineTo(x-l*.25,y+l)});ctx.stroke()}
   const close=C.done&&C.res===false?1:flClamp(1-C.gap/(P.G0+2),0,1),k=.1+.42*close,ph=reduce?0:Math.floor(t*(4+close*5))%2;
   if(C.started&&!(C.done&&C.res))add(()=>glow(cx+Math.sin(t*1.7)*W*.08,H*1.02,H*(.3+close*.5),'235,242,255',.06+close*.22));
   const r1=ph?'255,61,82':'77,125,255',r2=ph?'77,125,255':'255,61,82';glow(0,H,H*(.5+close*.35),r1,k);glow(W,H,H*(.5+close*.35),r2,k);
   if(X.alarm&&!outside&&!reduce){ctx.fillStyle=`rgba(255,40,60,${.05+.06*Math.max(0,Math.sin(t*4))})`;ctx.fillRect(0,0,W,H)}
   if(C.stam<.35&&C.started&&!C.done){const p=reduce?.5:.5+.5*Math.sin(t*(6+(1-C.stam)*4));ctx.fillStyle=`rgba(80,0,10,${(.35-C.stam)*.5*p})`;ctx.fillRect(0,0,W,H)}
   const v=ctx.createRadialGradient(cx,H*.55,Math.min(W,H)*.35,cx,H*.55,Math.max(W,H)*.8);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
   if(C.done&&C.res){const a=Math.min(1,(t-doneT)/1.2);add(()=>glow(cx,hy+(H-hy)*.35,Math.max(W,H)*(.5+a*.5),TO.amb||'255,170,90',a*.3))}
   if(C.done&&!C.res){ctx.fillStyle=`rgba(5,6,8,${Math.min(.5,(t-doneT)*.8)})`;ctx.fillRect(0,0,W,H)}}
  let meZ=0,stT=-9;const stumT=()=>t-stT<.5;
  function draw(){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);camX+=((C.px*FL_LANE*.35)-camX)*.2;
   if(shake>0&&!reduce)ctx.translate((Math.random()-.5)*shake*14,(Math.random()-.5)*shake*10);
   scene();
   const list=[];for(const r of C.rows){const z=r.z-C.dist;if(z>110)break;if(z<-CB+.6)continue;r.obs.forEach(o=>list.push([o,z]))}
   list.sort((a,b)=>b[1]-a[1]);list.filter(x=>x[1]>=0).forEach(x=>drawOb(x[0],x[1]));drawMe();list.filter(x=>x[1]<0).forEach(x=>drawOb(x[0],x[1]));drawCop();
   overlays()}
  // ---------- HUD ----------
  const el={you:q('rnYou'),done:q('rnDone'),gap:q('rnGap'),gb:q('rnGapBar'),cop:q('rnCop'),st:q('rnSt'),stT:q('rnStT'),sb:q('rnStBar'),miss:q('flMiss'),pop:q('rnPop')};let hudK='',popT=0;
  function pop(txt,cls){el.pop.textContent=txt;el.pop.className='rn-pop on '+(cls||'');clearTimeout(popT);popT=setTimeout(()=>{el.pop.className='rn-pop '+(cls||'')},900)}
  function hud(){const p=C.done&&C.res?1:Math.min(1,C.dist/C.len),g=Math.max(0,C.gap),gk=g/P.gapMax,sp=Math.round(C.stam*100);
   el.you.style.left=(p*100)+'%';el.done.style.width=(p*100)+'%';
   const k=Math.round(g)+'|'+sp+'|'+C.misses;if(k===hudK)return;hudK=k;
   el.gap.textContent=Math.round(g)+' m';el.gb.style.width=Math.round(gk*100)+'%';el.cop.className='rn-pill rn-cop'+(g<FL_TACKLE+1.5?' near':g<P.G0*.6?' mid':'');
   el.stT.textContent=sp+'%';el.sb.style.width=sp+'%';el.st.className='rn-pill rn-st'+(C.stam<.2?' low':C.stam<.35?' mid':'');
   el.miss.innerHTML=C.misses?`Gestruikeld: <b>${C.misses}×</b>`:'<b class="ok">Nog niet gestruikeld</b>'}
  // ---------- verloop ----------
  function evs(){while(C.ev.length){const e=C.ev.shift();
   if(e==='lane')snd('card');else if(e==='jump')snd('tick');else if(e==='duck')snd('card');
   else if(e==='hit'){shake=.4;stT=t;snd('lose');stage.classList.remove('bump');void stage.offsetWidth;stage.classList.add('bump');pop(C.gap<FL_TACKLE+2?'Gestruikeld! Hij is vlakbij':'Gestruikeld!','bad')}
   else if(e==='surge'){pop('Hij zet aan!','cop');snd('tick')}}
   if(!C.done&&C.started){if(!warned.adem&&C.stam<.35){warned.adem=1;pop('Je hijgt: rustig blijven','bad')}if(!warned.near&&C.gap<FL_TACKLE+1.5){warned.near=1;pop('Hij zit vlak achter je!','bad')}
    if(!warned.sprint&&C.rows.sprintZ&&C.dist>C.rows.sprintZ-P.v*1.6){warned.sprint=1;bigMsg('Eindsprint!','sp')}
    if(X.inn&&!warned.door&&C.dist>X.doorZ-1){warned.door=1;pop('Naar buiten!','ok')}
    const dk=C.rows.find(r=>!r.passed&&r.k==='duck'&&r.z-C.dist<P.v*1.5&&r.z-C.dist>0);if(dk&&!warned.duck){warned.duck=1;bigMsg('Bukken! ↓','sp')}
    const fe=C.rows.find(r=>!r.passed&&r.k==='fence'&&r.z-C.dist<P.v*1.5&&r.z-C.dist>0);if(fe&&!warned.fence){warned.fence=1;bigMsg('Springen! ↑','sp')}}}
  const warned={};let bigT=0;
  function bigMsg(txt,cls){big.textContent=txt;big.className='fl-big '+(cls||'');clearTimeout(bigT);bigT=setTimeout(()=>{if(!C.done)big.classList.add('gone')},900)}
  function finish(){const ok=C.res===true;doneT=t;document.removeEventListener('keydown',key);
   const box=ov.querySelector('.fl-box');box.classList.add(ok?'won':'lost');
   q('chT').textContent=ok?'Ontkomen!':'Gepakt!';q('flWhere').textContent=ok?TO.win:(C.why==='tackle'?'Je struikelt en hij ligt meteen boven op je.':X.inn&&C.dist<X.doorZ?'Je haalt de deur niet eens.':TO.lose);
   bigMsg(ok?'Ontkomen!':'Gepakt!',ok?'ok':'no');clearTimeout(bigT);
   el.miss.innerHTML=ok?`Voorsprong <b>${Math.round(C.gap)} m</b> · ${C.misses}× gestruikeld`:`Gestruikeld: <b>${C.misses}×</b> · ${Math.round(C.dist/C.len*100)}% van de route`;
   ov.querySelectorAll('.fl-b').forEach(b=>{b.disabled=true});
   const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);snd(ok?'win':'lose');if(ok)try{SFX.win(3)}catch(e){}
   setTimeout(close,1700)}
  function close(){if(closed||!C.done)return;closed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',fit);
   ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(C.res===true)},220)}
  ov.addEventListener('click',e=>{if(C.done&&!e.target.closest('.fl-ctl'))close()});
  // ---------- vooraf: de agent betrapt je, en wat er meetelt ----------
  const cut=document.createElement('div');cut.className='rn-cut'+(X.inn?' in':'')+(X.alarm?' alarm':'');
  cut.innerHTML=`<div class="rn-cut-bg"></div>
   <div class="rn-cut-say">${X.alarm?'Beveiliging! Blijf staan!':'Politie! Staan blijven!'}</div>
   <div class="rn-pre"><div class="rn-pre-h"><span>Niveau ${level} · ${P.label}</span><b class="rn-rate r${R.k}">Voor jou: ${R.txt}</b></div>
    <div class="rn-why">${why.map(([n,v])=>`<span class="${v>=25?'hi':v>=8?'mid':''}"><i>${n}</i><b>${v}</b></span>`).join('')}</div>
    <p class="rn-pre-x">${xtra?`Voorsprong +${Math.round((P.G0/FL_LV[level].G0-1)*100)}% door ${xtra}${P.X.tk?' en '+P.X.lid:''}.`:P.X.tk?`${P.X.lid}: +${Math.round(P.X.tk*60)}% voorsprong.`:'Training in de sportschool, op de hardloopclub en bij yoga maakt vluchten makkelijker.'}</p>
    <button class="btn rn-go" type="button">Rennen!</button><span class="rn-auto" aria-hidden="true"><i></i></span><span class="rn-hint">tik, spatie of Enter</span></div>`;
  stage.appendChild(cut);
  let autoT=0;
  function go(){if(C.started)return;C.started=true;clearTimeout(autoT);cut.classList.add('gone');setTimeout(()=>cut.remove(),300);bigMsg(X.inn?'Naar de uitgang!':'Rennen!','');snd('tick')}
  cut.addEventListener('pointerdown',e=>{e.preventDefault();go()});
  autoT=setTimeout(go,reduce?7000:6000);
  try{SFX.lose()}catch(e){}
  // ---------- lus: vaste kleine stapjes ----------
  let ft=0;
  function frame(now){if(closed)return;let acc=Math.min(.25,Math.max(0,(now-last)/1000));last=now;t+=acc;if(!C.started)acc=0;
   while(acc>1e-4){const h=Math.min(1/60,acc);C.step(h);acc-=h;if(C.done)break}
   if(C.done&&!doneT){finish()}
   if(C.done&&C.res)meZ+=C.v*.016*.6;
   shake=Math.max(0,shake-.016*1.6);evs();
   const a=performance.now();draw();ft=ft*.9+(performance.now()-a)*.1;hud();raf=requestAnimationFrame(frame)}
  ov._fl=()=>({C,P,X,ft,go});
  last=performance.now();draw();hud();raf=requestAnimationFrame(frame);
  setTimeout(()=>{const g=cut.querySelector('.rn-go');g&&g.focus({preventScroll:true})},30);
 })}
