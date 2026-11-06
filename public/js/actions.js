// Alle acties (klikken) en de politiecontroles
const act={
 async crime(id,quick){const c=CRIMES.find(x=>x.id===id);if(!c||inJail()||cdLeft(id)||rankIdx(S.xp)<c.r||window.__chase||S.pendingLock||S.pendingGame)return;if(S.energy<crEn(c)){toast('Te moe. Je hebt '+crEn(c)+' energie nodig','bad');return}
  if(typeof arBanLeft==='function'&&arBanLeft(c)){toast(arBanMsg(c),'bad');return}
  // elke klus heeft een spel (crimegames.js; bij inbraak-klussen het slot uit lockgame.js). Meesters kunnen het overslaan
  // (snel uitvoeren, iets lagere kans). Verversen tijdens het spel = betrapt (S.pendingGame, zie main.js)
  if(quick&&!(typeof crCanQuick==='function'&&crCanQuick(c)))return;
  S.energy-=crEn(c);S.cd[id]=now()+crimeCd(c);
  if(typeof cgPlay!=='function'){crimeResolve(c);return}
  if(quick){S.stats.quick=(S.stats.quick||0)+1;crimeResolve(c,{quick:true});return}
  S.pendingGame={id,t:now()};save();render();
  let r=null;try{r=await cgPlay(c)}catch(e){console.error(e);r=null}
  delete S.pendingGame;S.stats.games=(S.stats.games||0)+1;
  if(!r){crimeResolve(c);return} // spel kon niet starten: gewoon de verwachte kans, niemand de dupe
  if(!r.ok){S.stats.gameFail=(S.stats.gameFail||0)+1;crimeFail(c,(r.why?r.why.replace(/\.?$/,'. '):''));return}
  if(!r.miss)S.stats.clean=(S.stats.clean||0)+1;
  crimeResolve(c,{game:r})},
 async trainSession(id){const t=TRAININGS.find(x=>x.id===id);const l=S.skills[id]||0;if(!t||l>=TRAIN_MAX||inJail()||cdLeft('tr_'+id)||rankIdx(S.xp)<(t.r||0)||window.__chase)return;
  const cost=trainCost(t,l);if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  // trainingen met een spel (slotenkraken, ademhaling): eerst spelen. Lukt het, dan betaal je en ga je een level omhoog;
  // lukt het niet, dan betaal je niets en kun je na een derde van de wachttijd opnieuw
  if(t.game&&typeof lockGame==='function'){const lv=1+Math.min(4,Math.floor(l/10)),P=lockParams(null,lv);let ok=false;
   try{ok=t.game==='lock'?await lockGame(P,{title:'Training · '+t.n,sub:P.label+' · level '+lv}):await breathGame(P,{title:'Training · '+t.n,label:t.place})}catch(e){console.error(e)}
   if(!ok){S.cd['tr_'+id]=now()+t.cd*60000*waitK()/3;toast(t.n+': niet gelukt. Je betaalt niets; probeer het zo nog eens.','bad');log(t.n+': training mislukt','bad');save();render();return}}
  S.cash-=cost;S.cd['tr_'+id]=now()+t.cd*60000*waitK();S.skills[id]=l+1;addXp(3+Math.floor(l*1.5));if(typeof famEv==='function')famEv('train');const a=t.eff(l),b=t.eff(l+1);
  toast(t.n+' level '+(l+1)+': '+a[0][0].toLowerCase()+' '+a[0][1]+' → '+b[0][1],TRAIN_MILES.includes(l+1)?'lvl':'ok');log(t.n+' naar level '+(l+1)+' ('+t.place+', '+fmt(cost)+')','ok');
  save();pushState();render()},
 async redeem(raw){let code=String(raw||'').trim().toLowerCase().replace(/[\s_-]+/g,'');code=CODE_ALIAS[code]||code;const btn=document.getElementById('codeBtn');
  if(!code){redeemMsg={ok:false,t:'Vul eerst een code in.'};render();return}
  S.redeemed=S.redeemed||[];
  if(S.redeemed.includes(code)){redeemMsg={ok:false,t:'Je hebt deze code al gebruikt.'};render();return}
  if(RANK_CODES[code]){const ri=RANKS.findIndex(r=>r[0].toLowerCase()===code);if(rankIdx(S.xp)<ri){redeemMsg={ok:false,t:'Deze code werkt pas als je '+RANKS[ri][0]+' bent. Nog '+Math.ceil(RANKS[ri][1]-S.xp).toLocaleString('nl-NL')+' XP te gaan.'};render();return}}
  if(btn){btn.disabled=true;btn.textContent='Controleren…'}
  let amount=0;
  if(window.__TOKEN__)await pushState();
  if(window.__TOKEN__){
    try{const r=await fetch('/api/redeem',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__TOKEN__},body:JSON.stringify({code})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){if(r.status===409&&!S.redeemed.includes(code))S.redeemed.push(code);redeemMsg={ok:false,t:j.error||'Kon de code niet inwisselen.'};save();render();return}
      amount=j.amount}
    catch(e){redeemMsg={ok:false,t:'De server is niet bereikbaar. Probeer het later opnieuw.'};render();return}
  }else{const LOCAL=Object.assign({},LIVE_CODES,RANK_CODES);amount=LOCAL[code];if(!amount){redeemMsg={ok:false,t:'Deze code bestaat niet.'};render();return}}
  S.cash+=amount;S.redeemed.push(code);window._codeIn='';redeemMsg={ok:true,t:'Gelukt! '+fmt(amount)+' is bijgeschreven op je contant geld.'};
  toast('Code '+codeShow(code)+': +'+fmt(amount),'lvl');log('Code '+codeShow(code)+' ingewisseld: +'+fmt(amount),'ok');
  save();if(typeof pushState==='function')pushState();render()},
 relax(id){const r=RELAX.find(x=>x.id===id);if(!r||inJail()||cdLeft('rx_'+id)||rankIdx(S.xp)<(r.r||0)||window.__chase)return;const cost=relaxCost(r,rankIdx(S.xp),rankLevel(S.xp));if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  S.cash-=cost;S.cd['rx_'+id]=now()+r.cd*60000*waitK();const m=[];
  const buff=(k,pct)=>{const b=S.buffs[k],until=now()+r.mins*60000;if(b&&b.until>now()&&b.pct>pct)b.until=Math.max(b.until,until);else S.buffs[k]={until,pct}};
  if(r.focus){buff('focus',r.focus);m.push('focus +'+r.focus+'% voor '+r.mins+' min')}
  if(r.loot){buff('loot',r.loot);m.push('buit +'+r.loot+'% voor '+r.mins+' min')}
  if(r.hp){S.hp=Math.min(100,S.hp+r.hp);m.push(r.hp>=100?'gezondheid vol':'gezondheid +'+r.hp)}
  if(r.energy){const e=r.energy>=999?999:Math.round(r.energy*kalmEnK());S.energy=Math.max(S.energy,Math.min(EN_MAX,S.energy+e));m.push(e>=999?'energie vol':'energie +'+e)}
  kalmAdd(KALM_PTS[r.tier]||1);
  if(r.heat){S.heat=Math.max(0,S.heat-r.heat);m.push('hitte -'+r.heat)}
  if(r.clearWanted&&S.wanted){S.wanted=false;m.push('niet meer gezocht')}
  toast(r.n+': '+m.join(', '));log(r.place+': '+m.join(', '),'info');save();render()},
 sell(i){const c=S.cars.splice(i,1)[0];S.cash+=c.v;addZwart(c.v);toast(c.n+' verkocht: +'+fmt(c.v));save();render()},
 sellAll(){const t=S.cars.reduce((a,c)=>a+c.v,0);S.cash+=t;addZwart(t);S.cars=[];toast('Alles verkocht: +'+fmt(t));save();render()},
 getBet(){if(inJail()){toast('Je zit vast, geen gokken','bad');return 0}const b=Math.floor(+($('#bet').value||0));if(b<10){toast('Minimale inzet is €10','bad');return 0}if(b>S.cash){toast('Niet genoeg contant geld','bad');return 0}return b},
 casPay(m){S.casPay=m==='zwart'||m==='wit'?m:'auto';window.casPayOpen=false;try{SFX.click()}catch(e){}
  toast(m==='zwart'?(zwart()<1?'Je hebt geen zwart geld op zak':'Je speelt nu alleen met zwart geld'):m==='wit'?'Je speelt nu alleen met wit geld (geen verdenking)':'Automatisch: eerst je zwarte geld, daarna je witte',m==='zwart'&&zwart()<1?'bad':'ok');save();renderTop();if(page==='casino')render()},
 casPaySel(){window.casPayOpen=!window.casPayOpen;try{SFX.click()}catch(e){}renderTop()},
 claimCb(){const a=cbAvail();if(a<1)return;S.cash+=a;S.cb.acc=(S.cb.acc||0)-a;SFX.big();toast('Cashback: +'+fmt(a),'lvl');log('Cashback ontvangen: '+fmt(a),'ok');save();pushState();render()},
 win(b,m,label){casinoRound(b,m>0?b*m:0,'coin');if(m>0){S.cash+=b*m-b;S.stats.won+=b*m-b;toast(label+' Gewonnen: +'+fmt(b*m-b));log('Casino: +'+fmt(b*m-b),'ok')}else{S.cash-=b;S.stats.lost+=b;toast(label+' Verloren: -'+fmt(b),'bad');log('Casino: -'+fmt(b),'bad')}save()},
 coin(k){const b=act.getBet();if(!b)return;const r=Math.random()<.5?'kop':'munt';act.win(b,r===k?2:0,'Het werd '+r+'.');render()},
 /* oude roulettesnelknop */ roul(k){const b=act.getBet();if(!b)return;const n=rnd(0,36);const col=n===0?'groen':n%2?'rood':'zwart';window._roul=n+' '+col.toUpperCase();act.win(b,col===k?(k==='groen'?14:2):0,n+' '+col+'.');render()},
 buyGear(id){const g=GEAR.find(x=>x.id===id);if(!g||S.gear[id]||S.cash<g.p||rankIdx(S.xp)<g.r)return;const best=gearBest(g.cat);if(best&&GEAR.indexOf(best)>GEAR.indexOf(g))return;
  S.cash-=g.p;S.gear[id]=1;toast(g.n+' gekocht en uitgerust','ok');log(g.n+' gekocht ('+fmt(g.p)+')','info');save();pushState();render()},
 heal(){const c=healCost();if(S.cash<c){toast('Niet genoeg geld voor de dokter','bad');return}S.cash-=c;S.hp=100;toast('Volledig opgelapt');save();render()},
 bribe(){const c=bribeCost();if(S.cash<c){toast('Niet genoeg geld om om te kopen','bad');return}S.cash-=c;S.heat=0;toast('De politie kijkt even de andere kant op');save();render()},
 bail(){const c=bailCost();if(S.cash+S.bank<c)return;const fromCash=Math.min(S.cash,c);S.cash-=fromCash;S.bank-=c-fromCash;if(c-fromCash>0&&typeof bkTx==='function')bkTx('pay',-(c-fromCash),'Borg');S.jailUntil=0;S.wanted=false;toast('Borg betaald. Je bent netjes vrij');log('Borg betaald: '+fmt(c),'info');save();render()},
 // Ontsnappen is een spel (jailbreak.js): tralies, gang en muur. Tijdens het spel staat S.pendingEsc; verversen of weggaan = betrapt.
 escape(){if(!inJail()||window.__chase||S.pendingEsc)return;const P=jbParams();S.pendingEsc={t:now(),lv:P.lv};save();if(typeof pushState==='function')pushState();
  jailBreakGame(P).then(ok=>{
   if(ok&&inJail()){S.pendingEsc=null;S.jailUntil=0;S.wanted=true;S.heat=Math.min(100,S.heat+15);addXp(15);S.stats.escaped=(S.stats.escaped||0)+1;toast('Ontsnapt! Je staat nu op de gezochtlijst','bad');log('Ontsnapt uit de bajes. Je bent gezocht','bad')}
   else if(ok){S.pendingEsc=null}
   else escFail('betrapt tijdens de ontsnapping');
   save();if(typeof pushState==='function')pushState();render()})},
 bjDeal(){const b=act.getBet();if(!b)return;const deck=[];['♠','♥','♦','♣'].forEach(s=>['A','2','3','4','5','6','7','8','9','10','J','Q','K'].forEach(v=>deck.push({s,v})));
  for(let i=deck.length-1;i>0;i--){const j=rnd(0,i);[deck[i],deck[j]]=[deck[j],deck[i]]}
  S.cash-=b;window.bj={deck,bet:b,p:[deck.pop(),deck.pop()],d:[deck.pop(),Object.assign(deck.pop(),{hidden:true})],done:false};
  if(handVal(bj.p)===21){act.bjEnd()}else{save();render()}},
 bjHit(){if(!bj||bj.done)return;bj.p.push(bj.deck.pop());const v=handVal(bj.p);if(v>21)act.bjEnd();else if(v===21)act.bjStand();else render()},
 bjDouble(){if(!bj||bj.done||S.cash<bj.bet)return;S.cash-=bj.bet;bj.bet*=2;bj.p.push(bj.deck.pop());if(handVal(bj.p)>21)act.bjEnd();else act.bjStand()},
 bjStand(){if(!bj||bj.done)return;bj.d[1].hidden=false;while(handVal(bj.d)<17)bj.d.push(bj.deck.pop());act.bjEnd()},
 bjEnd(){bj.d.forEach(c=>c.hidden=false);const p=handVal(bj.p),d=handVal(bj.d);const nat=p===21&&bj.p.length===2;let pay=0,msg;
  if(p>21){msg='Dood! Je zit boven 21'}else if(nat&&!(d===21&&bj.d.length===2)){pay=bj.bet*2.5;msg='Blackjack!'}
  else if(d>21||p>d){pay=bj.bet*2;msg=d>21?'Dealer dood. Gewonnen!':'Gewonnen!'}else if(p===d){pay=bj.bet;msg='Gelijkspel, inzet terug'}else msg='Dealer wint';
  S.cash+=pay;const net=pay-bj.bet;bj.res=net;bj.done=true;bj.msg=msg+(net?' ('+(net>0?'+':'-')+fmt(Math.abs(net))+')':'');
  if(net>0)S.stats.won+=net;else S.stats.lost+=-net;log('Blackjack: '+msg,net>0?'ok':net<0?'bad':'info');save();render()}
};

// Politiecontroles: elke actie kan een controle opleveren als je gezocht bent
(()=>{const skip=['redeem','claimCb','bail','escape','getBet','win','bjEnd','leave','bjHit','bjStand','bjDouble','rlBet','rlClear'];let depth=0;
 Object.keys(act).forEach(k=>{if(skip.includes(k))return;const fn=act[k];act[k]=function(...a){
  if(depth===0&&S.wanted&&!inJail()&&Math.random()<(page==='casino'?0.2:0.12)*(S.hide?.4:1)*(typeof wantedK==='function'?wantedK():1)){policeRaid();return}
  depth++;try{return fn.apply(this,a)}finally{depth--}}})})();
// Uitkomst van een klus. o.game = uitslag van het klus-spel (dan de dobbelsteen crDice), o.quick = snel uitvoeren (crQuick),
// anders de verwachte kans (chance). Buit: × rang/familie/… (lootMult) × professionaliteit (crLootK, tot +60%) × schone klus (+8%/+4%).
function crimeResolve(c,o){o=o&&typeof o==='object'?o:{bonus:+o||0};const cg=typeof crDice==='function';
  const P0=cg?crP(c):0,roll=rnd(1,100),ch=Math.min(chanceCap(c),cg?(o.quick?crQuick(c):o.game?crDice(c):chance(c)):chance(c)+(o.bonus||0));
  if(roll<=ch){const clean=o.game?cgCleanK(o.game.miss):1,g=Math.floor(rnd(c.min,c.max)*lootMult()*(cg?crLootK(c):mastLoot(c.id))*clean*(o.bonus?1.08:1));S.cash+=g;addZwart(g);S.stats.crimes++;
   crxN(crCat(c));crxAdd(c,1);const ml0=mastLv(c.id);S.mast=S.mast||{};S.mast[c.id]=(S.mast[c.id]||0)+1;const ml1=mastLv(c.id);
   if(cg){const P1=crP(c),l0=cgLvIdx(P0),l1=cgLvIdx(P1);if(l1>l0)setTimeout(()=>toast(`${c.n}: je bent nu ${cgLvName(P1)} (${Math.round(P1*100)}%)${P1>=CG_QUICK_P?' · snel uitvoeren kan nu':''}`,'lvl'),700);
    else if(ml1>ml0)setTimeout(()=>toast(`Vakmanschap ${MAST[ml1][1]}: ${c.n} (professionaliteit ${Math.round(P1*100)}%)`,'lvl'),600)}
   else if(ml1>ml0)setTimeout(()=>toast(`Vakmanschap ${MAST[ml1][1]}: ${c.n} (+${ml1*2}% kans, +${ml1*5}% buit)`,'lvl'),600);
   // hoe goed het ging: met een spel telt hoe netjes je speelde (geen fout = perfect), anders hoe ruim je slaagde
   const q=o.game?(o.game.miss===0?'perfect':o.game.miss===1?'netjes':''):roll<=ch*.3?'perfect':roll<=ch*.65?'netjes':'',cr=c.cr?credGain(c.cr,q):0;S.cred+=cr;if(q==='perfect')S.stats.perfect=(S.stats.perfect||0)+1;
   addHeat(crimeUp(c)>=2?rnd(2,3):rnd(1,4));addXp(c.xp);if(typeof arOk==='function')arOk(c);if(typeof famEv==='function')famEv('crime',{r:c.r,g,cr});
   const how=o.game?(o.game.miss===0?' schone klus':o.game.miss===1?' netjes gedaan':' gelukt'):o.quick?' snel gedaan':q==='perfect'?' perfect uitgevoerd':q==='netjes'?' netjes gedaan':' gelukt';
   toast(c.n+how+': +'+fmt(g)+(clean>1?' (+'+Math.round((clean-1)*100)+'% schoon)':'')+(cr?' · +'+cr+' straatcredit':''),q==='perfect'?'lvl':'ok');log(c.n+' gelukt'+(o.quick?' (snel)':q?' ('+q+')':'')+', buit '+fmt(g)+(cr?', +'+cr+' cred':''),'ok')}
  else crimeFail(c,o.game?'Het spel ging goed, maar toch: ':'');
  save();render()}
function crimeFail(c,pre){
  // Bagatel (c.sev 'A': bedelen, statiegeld): geen cel en geen vlucht. Haak voor het latere gevolg per ernstklasse.
  if(c.sev==='A'){crimeFailMinor(c,pre);return}
  // gevolg per soort (arrest.js): oplichting = aangifte, smokkel = partij kwijt + locatieverbod, witteboord = FIOD-dossier
  if(typeof arFail==='function'&&arFail(c,pre))return;
  // straatwerk, inbraak en overvallen: betrapt. Overvallen ×1,75 en kans op een signalement; daarna het arrestatieverloop
  const X=typeof arHeist==='function'?arHeist(c):{sec:c.jail,o:{}};
  const lost=Math.floor(Math.min(Math.floor(S.cash*0.1),c.max*2)*(1-furnFx('safe'))); // verlies past bij de grootte van de klus
  S.cash-=lost;S.stats.fails++;crxN(crCat(c));crxAdd(c,0);S.hp=Math.max(10,S.hp-rnd(5,15));addHeat(rnd(5,10));
   addXp(Math.ceil(c.xp/4));log(c.n+' mislukt, '+fmt(lost)+' kwijt','bad');save();
   arrest(X.sec,'Betrapt!',(pre||'')+c.n+' ging mis. '+FLEE_LEVELS[c.flee||2].where,Object.assign({flee:c.flee||2,cat:crCat(c)},X.o));save();render()}
// Klasse A: weggestuurd (je mag hier even niet terugkomen: 3× de wachttijd) of een boete (APV), geen arrestatie.
function crimeFailMinor(c,pre){S.stats.fails++;S.stats.minor=(S.stats.minor||0)+1;crxN(crCat(c));crxAdd(c,0);addXp(Math.ceil(c.xp/4));addHeat(1);
  if(Math.random()<.5&&S.cash>=1){const f=Math.min(Math.floor(S.cash),Math.max(50,Math.round(c.max*2)));S.cash-=f;
   log(c.n+' mislukt: boete van '+fmt(f),'bad');toast((pre||'')+'Een handhaver schrijft je op: '+fmt(f)+' boete.','bad')}
  else{S.cd[c.id]=now()+crimeCd(c)*3;log(c.n+' mislukt: weggestuurd','bad');toast((pre||'')+'Weggestuurd. Hier mag je even niet terugkomen.','bad')}
  save();pushState();render()}
