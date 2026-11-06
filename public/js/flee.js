// Vluchtspel "Rennen!" (versie 3): gaat een klus mis en kies je vluchten, dan ren je weg met de agent achter je aan.
// Je rent (2,5D, camera achter je) door Amsterdam: langs een gracht, door een steeg, een woonwijk, de winkelstraat, over de
// kade of door een parkeergarage; bij zwaardere klussen eerst door het gebouw (gang, winkel, kantoor) en dan de deur uit.
// De renner ben jij, in je eigen outfit (runnerLook, kledingcontract). Het tekenwerk staat in flee-art.js.
// Wissel van baan met ← → (A/D, vegen of links/rechts tikken), spring met ↑/W/spatie (omhoog vegen of midden tikken) en buk
// met ↓/S (omlaag vegen of de knop). In de balk onder het beeld: afstand tot de agent, de route en je adem.
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
const FL_LANE=1.5,FL_PW=.42,FL_JUMP=.6,FL_SLIDE=.62,FL_TACKLE=2;
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
// Wat er op je pad staat per plek (de tekeningen en kleuren staan in flee-art.js, FLV). Een stilstaande agent staat niet meer
// in de weg (die leek naast je te staan); agenten komen alleen op je af (rij 'drift') of zitten achter je aan.
const FL_TH={
 gracht:{out:1,tall:['fiets','toerist','kliko','bakfiets','toerist','fiets'],low:['paaltjes','krat','zakken','dranghek'],cross:['fietser','toerist','hond','fietser'],duck:'steiger',fence:'dranghek',wide:'busje',
  win:'Over de brug en de hoek om. Weg ben je.',lose:'Hij grijpt je bij je jas, vlak bij de brug.'},
 steeg:{out:1,tall:['kliko','fiets','container','mens'],low:['pallet','zakken','krat'],cross:['hond','mens'],duck:'steiger',fence:'hek',
  win:'Je schiet een portiek in. Weg ben je.',lose:'De agent grijpt je bij je jas.'},
 woonwijk:{out:1,tall:['kliko','fiets','mens','bakfiets'],low:['krat','zakken','paaltjes'],cross:['hond','fietser'],duck:'steiger',fence:'hek',
  win:'Over een heg het park in. Weg ben je.',lose:'Hij pakt je bij een tuinhek.'},
 markt:{out:1,tall:['mens','toerist','scooter','mens','fiets','mens'],low:['krat','dranghek','zakken','bord'],cross:['mens','toerist','fietser'],duck:'steiger',fence:'dranghek',wide:'busje',
  win:'Je duikt een zijstraat in en verdwijnt tussen de mensen.',lose:'Een agent tackelt je tussen de mensen.'},
 haven:{out:1,tall:['vaten','havenman','havenman','kist'],low:['pallet','touw','krat'],cross:['havenman'],duck:'slagboom',fence:'hek',
  win:'Je springt in een bootje en bent weg.',lose:'Twee agenten klemmen je tussen de containers.'},
 garage:{out:1,tall:['scooter','kliko','fiets','mens','scooter','fiets'],low:['pionnen','pallet','krat','pionnen'],cross:['mens','fietser','mens','schoonmaker'],duck:'slagboom',fence:'dranghek',wide:'busje',
  win:'De uitrit op en de nacht in. Weg ben je.',lose:'Hij klemt je tegen een pilaar.'},
 gang:{in:1,tall:['dozen','kast','schoonmaker'],low:['kar','pallet','bord'],cross:['schoonmaker'],duck:'rolluik',fence:'lint'},
 winkel:{in:1,tall:['dozen','mens','mens','dozen'],low:['kar','winkelwagen','bord'],cross:['mens','schoonmaker'],duck:'rolluik',fence:'lint'},
 kantoor:{in:1,tall:['kast','printer','plant','bewaker'],low:['bureau','stoel','bord'],cross:['mens','schoonmaker'],duck:'rolluik',fence:'lint'}};
// welke plek: soort klus (opts.cat), huurmoord, politiecontrole of anders het niveau. Zware klussen beginnen binnen.
function fleeCtx(level,opts,rnd){opts=opts||{};rnd=rnd||Math.random;const pick=a=>a[Math.floor(rnd()*a.length)];
 const cat=opts.cat||(opts.wanted?'hit':opts.raid?'raid':'');let inn=null,out;
 if(cat==='straat')out=level<=1?pick(['gracht','steeg','woonwijk']):level===2?'markt':pick(['markt','gracht']);
 else if(cat==='kraak'){out=level>=4?'gracht':'woonwijk';if(level>=2)inn='gang'}
 else if(cat==='geweld'){out='markt';if(level>=3)inn='winkel'}
 else if(cat==='fraude'){out=level>=3?'garage':'gracht';if(level>=3)inn='kantoor'}
 else if(cat==='invloed'){out='gracht';if(level>=3)inn='kantoor'}
 else if(cat==='smokkel'){out='haven';if(level>=4)inn='gang'}
 else if(cat==='hit')out=pick(['steeg','gracht','woonwijk']);
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
 stoel:{w:.52,h:.95,low:1},hond:{w:.5,h:.55,low:1},paaltjes:{w:.8,h:.72,low:1},pionnen:{w:.8,h:.72,low:1},touw:{w:.8,h:.4,low:1},winkelwagen:{w:.6,h:.95,low:1},
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

// ---------------- jij: de renner in je eigen outfit (kledingcontract) ----------------
// Elk kledingstuk mag look:{c,c2,kind} hebben (pages/look.js). runnerLook() leest wat je draagt en geeft per plek
// {kind,c,c2}; ontbreekt look.kind, dan een soort uit het oude id of de oude look.k, anders een nette standaard.
const FL_KINDS={head:['skimask','cap','beanie','hood','hat','none'],top:['tee','hoodie','jacket','suit','tracksuit','thief'],legs:['jeans','track','suit','thief'],shoes:['sneaker','boot','dress']};
const FL_LDEF={head:{kind:'none',c:'#2a1e16',c2:'#1a120c'},top:{kind:'tee',c:'#30353e',c2:'#454c58'},legs:{kind:'jeans',c:'#27354e',c2:'#3f5274'},shoes:{kind:'sneaker',c:'#e9e6df',c2:'#bdb7aa'}};
const FL_LKC={skimask:'#111215',cap:'#16181c',beanie:'#3a3f4a',hood:'#3a3f48',hat:'#2a2420',hoodie:'#4f5560',jacket:'#1d2026',suit:'#262b35',tracksuit:'#1b2a44',thief:'#1b1c20',track:'#1b2a44',boot:'#1b1c1e',dress:'#2a1810'};
const FL_LOLD={head:{pet:['cap','#111316'],snapback:['cap','#c0262f'],tacpet:['cap'],nvg:['cap'],muts:['beanie','#3a3f4a'],baret:['beanie'],durag:['beanie','#1b1d22'],bivak:['skimask','#0d0e10'],helm:['beanie','#0b0c0e','#2a2c30'],
  hoed:['hat','#2a2420'],homburg:['hat'],panama:['hat','#d9c9a0','#2a2420'],bucket:['hat','#5a5f3a']},
 top:{hoodie:['hoodie','#4f5560'],trainingspak:['tracksuit','#1b2a44','#ff7a1a'],voetbal:['tracksuit','#c0262f','#f4f4f4'],velours:['tracksuit','#5e1a33','#f2c230'],werkjas:['jacket','#e98a1c','#e8f0c0'],
  designer:['jacket','#b3243a'],jas:['jacket','#15171b'],bomber:['jacket','#2f3a2a','#ff7a1a'],leer:['jacket','#141518'],trench:['jacket','#a88d5e'],overjas:['jacket','#2a2c30'],bont:['jacket','#6b4a32','#8a6444'],
  jeansjack:['jacket','#3a5a8a','#c9d1da'],kroko:['jacket','#2f4a2a'],tacvest:['jacket'],clubjas:['jacket'],kevlar:['jacket'],pak:['suit','#262b35','#7a1f2a'],colbert:['suit','#3a3f4a','#1b2233'],smoking:['suit','#121317','#121317'],napels:['suit']},
 shoes:{sneakers:['sneaker','#e9e6df','#ffffff'],renners:['sneaker','#ff7a1a','#f4f4f4'],basket:['sneaker','#e9e6df','#c0262f'],limited:['sneaker','#ff7a1a','#1b1d22'],gympen:['sneaker','#1c2a4a','#f4f4f4'],
  canvas:['sneaker','#1c2a4a','#f4f4f4'],goudsneak:['sneaker'],slippers:['sneaker','#2b4a8a','#1b1d22'],kisten:['boot','#1b1c1e','#0e0e0c'],laarzen:['boot','#7a6a3a','#3a2a1a'],werkschoen:['boot','#6b4a2a','#2a1e14'],
  tackist:['boot'],gesp:['boot','#2a1810','#120a06'],instappers:['dress','#3a2416','#1a120c'],brogues:['dress','#6b3f22','#2a1810'],oxford:['dress'],lak:['dress','#0d0d10','#1b1b1b'],studs:['dress']}};
const FL_LOLDK={pet:'cap',muts:'beanie',hoed:'hat',top:'jacket',jas:'suit',vest:'jacket'},FL_LSLOT={hoofd:'head',kleding:'top',bovenlijf:'top',top:'top',benen:'legs',broek:'legs',schoenen:'shoes'};
const flHex=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)?c:null;
const flShade=(c,k)=>{const h=flHex(c);if(!h)return c;const n=[1,3,5].map(i=>Math.round(parseInt(h.slice(i,i+2),16)*(1-k))).map(v=>v.toString(16).padStart(2,'0'));return '#'+n.join('')};
// eigen lezer (werkt ook zonder outfitLook): per plek uit look.kind, anders uit het id of de oude look.k
function flLookOwn(){const L={hair:'#2a1e16'};for(const pl in FL_LDEF)L[pl]=Object.assign({},FL_LDEF[pl]);let wear={},legs=false;
 try{wear=(typeof fitS==='function'&&fitS().wear)||{}}catch(e){}
 for(const sl in wear){const id=wear[sl];if(!id)continue;let it=null;try{it=typeof fitItem==='function'?fitItem(id):null}catch(e){}
  const pl=FL_LSLOT[sl]||(it&&FL_LSLOT[it.slot]);if(!pl)continue;const lk=(it&&it.look)||{},old=FL_LOLD[pl]&&FL_LOLD[pl][id];
  let kind=FL_KINDS[pl].includes(lk.kind)?lk.kind:null;if(!kind&&old)kind=old[0];if(!kind&&FL_KINDS[pl].includes(FL_LOLDK[lk.k]))kind=FL_LOLDK[lk.k];
  if(id==='pruik')L.hair='#5a3a22';if(!kind)continue; // van achteren niet te zien (bril, grill) of onbekend: standaard
  const c=flHex(lk.c)||(old&&old[1])||FL_LKC[kind]||FL_LDEF[pl].c,c2=flHex(lk.c2)||flHex(lk.sole)||(old&&old[2])||flShade(c,.3);
  L[pl]={kind,c,c2,pants:flHex(lk.pants),own:1};if(pl==='legs')legs=true;
  if(pl==='top'&&lk.legs&&FL_KINDS.legs.includes(lk.legs.kind)&&!legs)L.legs={kind:lk.legs.kind,c:flHex(lk.legs.c)||c,c2:flHex(lk.legs.c2)||flShade(flHex(lk.legs.c)||c,.3),own:1}}
 // geen eigen broek: past bij het bovenstuk (pak → pantalon, trainingspak → trainingsbroek, boevenshirt → zwarte broek)
 if(!legs&&!L.legs.own){const t=L.top;if(t.kind==='suit')L.legs={kind:'suit',c:t.pants||t.c,c2:t.c2,own:1};else if(t.kind==='tracksuit')L.legs={kind:'track',c:t.pants||t.c,c2:t.c2,own:1};else if(t.kind==='thief')L.legs={kind:'thief',c:'#15161a',c2:'#2a2b30',own:1}}
 if(L.top.kind==='thief'&&L.top.c2===flShade(L.top.c,.3))L.top.c2='#e9e6df';
 return L}
// Kledingcontract: outfitLook() (pages/look.js) geeft per plek {kind,c,c2,id}; id null = standaard. Draag je een ouder stuk
// zonder look.kind (oude hoodie, pet, pak), dan tekenen we dat met de eigen lezer in plaats van de standaard.
function runnerLook(){const L=flLookOwn();let o=null;try{o=typeof outfitLook==='function'?outfitLook():null}catch(e){}if(!o)return L;
 const M={hoofd:'head',bovenlijf:'top',benen:'legs',schoenen:'shoes'};
 for(const k in M){const pl=M[k],x=o[k];if(!x||!FL_KINDS[pl].includes(x.kind))continue;if(x.id==null&&L[pl].own)continue;
  const c=flHex(x.c)||L[pl].c;L[pl]={kind:x.kind,c,c2:flHex(x.c2)&&x.c2!==c?x.c2:flShade(c,.3)};if(pl==='top'&&x.kind==='thief'&&!flHex(x.c2))L.top.c2='#e9e6df'}
 return L}

// kleine iconen voor de balk en de kaart vooraf
const FL_ICO={cop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M4 18h16"/><path d="M12 3v2M4.5 6l1.5 1.5M19.5 6 18 7.5"/></svg>',
 lung:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 14h15a3 3 0 1 1-3 3"/><path d="M3 19h6"/></svg>',
 hart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7-4.4-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.6-9 9-9 9z"/></svg>',
 bat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="3" y="7" width="16" height="10" rx="2"/><path d="M21 10v4" stroke-linecap="round"/><path d="M6 10h6v4H6z" fill="currentColor"/></svg>',
 bolt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
 trip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><path d="M9 20l3-6 4 2 3-5"/><circle cx="8" cy="7" r="2"/></svg>',
 up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>',
 down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
 flag:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 21V4h11l-2 4 2 4H7v9z"/></svg>'};
const flArrow=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7'}"/></svg>`;

function fleeGame(level,opts){
 return new Promise(resolve=>{
  level=flClamp(Math.round(+level)||2,1,5);
  const P=fleeParams(level,opts),X=fleeCtx(level,opts),C=fleeCore(P,X),TO=FL_TH[X.out];window.__chase=true;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  const LK=runnerLook(),V=FLV[X.out]||FLV.gracht,VI=X.inn?FLV[X.inn]:null;
  const exitN=X.veh?X.veh.n.replace(/^Je /,''):V.exit,place=(VI?VI.n+' → ':'')+V.n;
  const T=P.T,R=P.rate,why=[['Conditie',T.conditie,'hart'],['Uithouding',T.duur,'bat'],['Ademhaling',T.ademhaling,'lung'],['Snelheid',T.speed,'bolt']];
  const xPct=Math.round((P.G0/FL_LV[level].G0-1)*100),xWho=P.X.parts.map(p=>p[0]).concat(P.X.tk?[P.X.lid]:[]).join(', ');
  const ov=document.createElement('div');ov.className='chase-ov fl-ov rn-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-labelledby','chT');
  ov.innerHTML=`<div class="fl-box rn-box lv${level}"><div class="siren"></div>
   <div class="fl-top"><div class="fl-tt"><h2 id="chT">Rennen!</h2><p class="fl-where" id="flWhere">${place}</p></div><span class="tag lvl${level}">${P.label}</span></div>
   <div class="fl-stage rn-stage" id="flStage"><canvas id="flCv" aria-label="Achtervolging: ontwijk wat op je pad komt"></canvas>
    <div class="rn-pop" id="rnPop"></div><div class="fl-big gone" id="flBig"></div></div>
   <div class="rn-bar" aria-hidden="true">
    <div class="rn-pill rn-cop" id="rnCop" title="Afstand tot de agent"><i class="rn-ic">${FL_ICO.cop}</i><b id="rnGap">${Math.round(C.gap)} m</b><em><i id="rnGapBar"></i></em></div>
    <div class="rn-track" title="Route naar de uitgang"><span class="rn-rail"><i class="rn-done" id="rnDone"></i>${C.rows.sprintZ?`<i class="rn-sp" style="left:${Math.min(96,C.rows.sprintZ/C.len*100)}%"></i>`:''}${X.inn?`<i class="rn-door" style="left:${X.doorZ/C.len*100}%"></i>`:''}<i class="rn-you" id="rnYou"></i></span><b>${FL_ICO.flag}<span>${exitN}</span></b></div>
    <div class="rn-pill rn-st" id="rnSt" title="Adem"><i class="rn-ic">${FL_ICO.lung}</i><b id="rnStT">100%</b><em><i id="rnStBar"></i></em></div></div>
   <div class="fl-ctl"><button class="fl-b" data-a="L" aria-label="Naar links">${flArrow(-1)}</button><button class="fl-b fl-d" data-a="D" aria-label="Bukken">${FL_ICO.down}<span>Buk</span></button><button class="fl-b fl-j" data-a="J" aria-label="Springen">${FL_ICO.up}<span>Spring</span></button><button class="fl-b" data-a="R" aria-label="Naar rechts">${flArrow(1)}</button></div></div>`;
  document.body.appendChild(ov);
  const q=id=>ov.querySelector('#'+id),cv=q('flCv'),stage=q('flStage'),big=q('flBig');
  const art=flArt(cv,{C,P,X,LK,reduce});
  let last=0,raf=0,closed=false,shake=0,doneT=0,t=0,meZ=0,stT=-9;
  const ro=window.ResizeObserver?new ResizeObserver(()=>art.fit()):null;if(ro)ro.observe(stage);else window.addEventListener('resize',art.fit);
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
  // ---------- HUD (alleen bijwerken als er iets verandert) ----------
  const el={you:q('rnYou'),done:q('rnDone'),gap:q('rnGap'),gb:q('rnGapBar'),cop:q('rnCop'),st:q('rnSt'),stT:q('rnStT'),sb:q('rnStBar'),pop:q('rnPop')};let hudK='',hudP=-1,popT=0;
  // nooit twee meldingen tegelijk: staat er een grote ("Eindsprint!"), dan komt deze er net na
  function pop(txt,cls,w){if(!w&&!big.classList.contains('gone')){setTimeout(()=>{if(!C.done)pop(txt,cls,1)},650);return}el.pop.textContent=txt;el.pop.className='rn-pop on '+(cls||'');clearTimeout(popT);popT=setTimeout(()=>{el.pop.className='rn-pop '+(cls||'')},900)}
  function hud(){const p=C.done&&C.res?1:Math.min(1,C.dist/C.len),g=Math.max(0,C.gap),gk=g/P.gapMax,sp=Math.round(C.stam*100),pp=Math.round(p*400)/4;
   if(pp!==hudP){hudP=pp;el.you.style.left=pp+'%';el.done.style.width=pp+'%'}
   const k=Math.round(g)+'|'+sp;if(k===hudK)return;hudK=k;
   el.gap.textContent=Math.round(g)+' m';el.gb.style.width=Math.round(gk*100)+'%';el.cop.className='rn-pill rn-cop'+(g<FL_TACKLE+1.5?' near':g<P.G0*.6?' mid':'');
   el.stT.textContent=sp+'%';el.sb.style.width=sp+'%';el.st.className='rn-pill rn-st'+(C.stam<.2?' low':C.stam<.35?' mid':'')}
  // ---------- verloop ----------
  const warned={};let bigT=0;
  function bigMsg(txt,cls){el.pop.classList.remove('on');big.textContent=txt;big.className='fl-big '+(cls||'');clearTimeout(bigT);bigT=setTimeout(()=>{big.classList.add('gone')},900)}
  function evs(){while(C.ev.length){const e=C.ev.shift();
   if(e==='lane')snd('card');else if(e==='jump')snd('tick');else if(e==='duck')snd('card');
   else if(e==='hit'){shake=.4;stT=t;snd('lose');stage.classList.remove('bump');void stage.offsetWidth;stage.classList.add('bump');pop(C.gap<FL_TACKLE+2?'Gestruikeld! Hij is vlakbij':'Gestruikeld!','bad')}
   else if(e==='surge'){pop('Hij zet aan!','cop');snd('tick')}}
   if(!C.done&&C.started){if(!warned.adem&&C.stam<.35){warned.adem=1;pop('Je hijgt','bad')}if(!warned.near&&C.gap<FL_TACKLE+1.5){warned.near=1;pop('Hij zit vlak achter je!','bad')}
    if(!warned.sprint&&C.rows.sprintZ&&C.dist>C.rows.sprintZ-P.v*1.6){warned.sprint=1;bigMsg('Eindsprint!','sp')}
    if(X.inn&&!warned.door&&C.dist>X.doorZ-1){warned.door=1;pop('Naar buiten!','ok')}
    const dk=C.rows.find(r=>!r.passed&&r.k==='duck'&&r.z-C.dist<P.v*1.5&&r.z-C.dist>0);if(dk&&!warned.duck){warned.duck=1;bigMsg('Buk!','sp')}
    const fe=C.rows.find(r=>!r.passed&&r.k==='fence'&&r.z-C.dist<P.v*1.5&&r.z-C.dist>0);if(fe&&!warned.fence){warned.fence=1;bigMsg('Spring!','sp')}}}
  // ---------- het einde: jouw portret met de uitslag ----------
  function finish(){const ok=C.res===true;doneT=t;document.removeEventListener('keydown',key);clearTimeout(bigT);big.classList.add('gone');
   const box=ov.querySelector('.fl-box');box.classList.add(ok?'won':'lost');
   q('chT').textContent=ok?'Ontkomen!':'Gepakt!';q('flWhere').textContent=ok?TO.win:(C.why==='tackle'?'Je struikelt en hij ligt meteen boven op je.':X.inn&&C.dist<X.doorZ?'Je haalt de deur niet eens.':TO.lose);
   const end=document.createElement('div');end.className='rn-end '+(ok?'ok':'no');
   end.innerHTML=`<canvas class="rn-face" aria-hidden="true"></canvas><div class="rn-end-r"><b>${ok?'Ontkomen!':'Gepakt!'}</b><span class="rn-chips">${ok?`<i title="Voorsprong">${FL_ICO.cop}${Math.round(C.gap)} m</i>`:`<i title="Route">${FL_ICO.flag}${Math.round(C.dist/C.len*100)}%</i>`}<i title="Gestruikeld">${FL_ICO.trip}${C.misses}×</i></span></div>`;
   stage.appendChild(end);requestAnimationFrame(()=>{flPortrait(end.querySelector('canvas'),LK);end.classList.add('on')});
   ov.querySelectorAll('.fl-b').forEach(b=>{b.disabled=true});
   const tb=document.createElement('div');tb.className='chase-auto';box.appendChild(tb);snd(ok?'win':'lose');if(ok)try{SFX.win(3)}catch(e){}
   setTimeout(close,2000)}
  function close(){if(closed||!C.done)return;closed=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener('resize',art.fit);
   ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;resolve(C.res===true)},220)}
  ov.addEventListener('click',e=>{if(C.done&&!e.target.closest('.fl-ctl'))close()});
  // ---------- vooraf: de agent betrapt je; jij, je kans en wat meetelt (kort) ----------
  const cut=document.createElement('div');cut.className='rn-cut'+(X.inn?' in':'')+(X.alarm?' alarm':'');
  cut.innerHTML=`<div class="rn-cut-bg"></div>
   <div class="rn-cut-say">${X.alarm?'Beveiliging! Blijf staan!':'Politie! Staan blijven!'}</div>
   <div class="rn-pre"><div class="rn-me"><canvas class="rn-face" aria-hidden="true"></canvas><div class="rn-me-r"><span class="rn-lab2">Voor jou</span><b class="rn-rate r${R.k}">${R.txt}</b>
     <span class="rn-why">${why.map(([n,v,ic])=>`<i class="${v>=25?'hi':v>=8?'mid':''}" title="${n} ${v}" aria-label="${n} ${v}">${FL_ICO[ic]}<b>${v}</b></i>`).join('')}${xPct>0?`<i class="x" title="Voorsprong door ${xWho}">+${xPct}%</i>`:''}</span></div></div>
    <div class="rn-keys" aria-label="Besturing"><span><kbd>←</kbd><kbd>→</kbd></span><span><kbd>↑</kbd>spring</span><span><kbd>↓</kbd>buk</span></div>
    <button class="btn rn-go" type="button">Rennen!</button><span class="rn-auto" aria-hidden="true"><i></i></span></div>`;
  stage.appendChild(cut);requestAnimationFrame(()=>flPortrait(cut.querySelector('.rn-face'),LK));
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
   const a=performance.now();art.draw(t,{shake,meZ,stT,doneT});ft=ft*.9+(performance.now()-a)*.1;hud();raf=requestAnimationFrame(frame)}
  ov._fl=()=>({C,P,X,ft,go,LK});
  last=performance.now();art.draw(0,{shake,meZ,stT,doneT});hud();raf=requestAnimationFrame(frame);
  setTimeout(()=>{const g=cut.querySelector('.rn-go');g&&g.focus({preventScroll:true})},30);
 })}
