// Alle acties (klikken) en de politiecontroles
const act={
 crime(id){const c=CRIMES.find(x=>x.id===id);if(inJail()||cdLeft(id)||rankIdx(S.xp)<c.r)return;if(S.energy<c.en){toast('Te moe. Je hebt '+c.en+' energie nodig','bad');return}S.energy-=c.en;S.cd[id]=now()+crimeCd(c);
  if(rnd(1,100)<=chance(c)){const g=Math.floor(rnd(c.min,c.max)*(1+fam().loot/100));S.cash+=g;S.stats.crimes++;S.cred+=c.cr;S.heat=Math.min(100,S.heat+rnd(1,4));addXp(c.xp);toast(c.n+' gelukt: +'+fmt(g));log(c.n+' gelukt, buit '+fmt(g),'ok')}
  else{const lost=Math.min(Math.floor(S.cash*0.1),c.max*2); // verlies past bij de grootte van de klus
  S.cash-=lost;S.stats.fails++;S.hp=Math.max(10,S.hp-rnd(5,15));S.heat=Math.min(100,S.heat+rnd(5,10));
   addXp(Math.ceil(c.xp/4));log(c.n+' mislukt, '+fmt(lost)+' kwijt','bad');save();
   arrest(c.jail,'Betrapt!',c.n+' ging mis. '+FLEE_LEVELS[c.flee||2].where,{flee:c.flee||2})}
  save();render()},
 car(){if(inJail()||cdLeft('car'))return;S.cd.car=now()+carCd();const pool=CARS.filter(c=>rankIdx(S.xp)>=c.r);const car=pool[rnd(0,pool.length-1)];
  if(rnd(1,100)<=car.c+gearBonus()+S.skills.cars*3){if(S.cars.length>=10){toast('Garage vol, verkoop eerst iets','bad')}else{const v=Math.floor(car.v*(rnd(70,110)/100)*(1+S.skills.cars*0.04));S.cars.push({n:car.n,v});S.stats.cars++;S.cred+=1;addXp(10+Math.floor(car.v/500));toast(car.n+' gestolen!');log(car.n+' gestolen ('+fmt(v)+')','ok')}}
  else{S.heat=Math.min(100,S.heat+6);log('Mislukte poging: '+car.n,'bad');save();arrest(45,'Alarm!','Het alarm van de '+car.n+' gaat af en een agent komt aanrennen.',{flee:2});return}save();render()},
 trainSession(id){const t=TRAININGS.find(x=>x.id===id);const l=S.skills[id]||0;if(!t||l>=TRAIN_MAX||inJail()||cdLeft('tr_'+id))return;
  const cost=t.base*(1+l);if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  S.cash-=cost;S.cd['tr_'+id]=now()+t.cd*60000;S.train[id]=(S.train[id]||0)+1;addXp(3+l);
  if(S.train[id]>=trainNeed(l)){S.train[id]=0;S.skills[id]=l+1;const a=t.eff(l),b=t.eff(l+1);
    toast(t.n+' level '+(l+1)+': '+a[0][0].toLowerCase()+' '+a[0][1]+' → '+b[0][1],'lvl');log(t.n+' naar level '+(l+1)+' ('+t.place+')','ok')}
  else toast(t.place+': sessie '+S.train[id]+' van '+trainNeed(l)+' gedaan');
  save();render()},
 async redeem(raw){const code=String(raw||'').trim().toLowerCase();const btn=document.getElementById('codeBtn');
  if(!code){redeemMsg={ok:false,t:'Vul eerst een code in.'};render();return}
  S.redeemed=S.redeemed||[];
  if(S.redeemed.includes(code)){redeemMsg={ok:false,t:'Je hebt deze code al gebruikt.'};render();return}
  if(btn){btn.disabled=true;btn.textContent='Controleren…'}
  let amount=0;
  if(window.__TOKEN__){
    try{const r=await fetch('/api/redeem',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+window.__TOKEN__},body:JSON.stringify({code})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){if(r.status===409&&!S.redeemed.includes(code))S.redeemed.push(code);redeemMsg={ok:false,t:j.error||'Kon de code niet inwisselen.'};save();render();return}
      amount=j.amount}
    catch(e){redeemMsg={ok:false,t:'De server is niet bereikbaar. Probeer het later opnieuw.'};render();return}
  }else{const LOCAL={lotto:1500};amount=LOCAL[code];if(!amount){redeemMsg={ok:false,t:'Deze code bestaat niet.'};render();return}}
  S.cash+=amount;S.redeemed.push(code);redeemMsg={ok:true,t:'Gelukt! '+fmt(amount)+' is bijgeschreven op je contant geld.'};
  toast('Code '+code.toUpperCase()+': +'+fmt(amount),'lvl');log('Code '+code.toUpperCase()+' ingewisseld: +'+fmt(amount),'ok');
  save();if(typeof pushState==='function')pushState();render()},
 relax(id){const r=RELAX.find(x=>x.id===id);if(!r||inJail()||cdLeft('rx_'+id))return;const cost=r.cost(rankIdx(S.xp));if(S.cash<cost){toast('Niet genoeg contant geld','bad');return}
  S.cash-=cost;S.cd['rx_'+id]=now()+r.cd*60000;const m=[];
  if(r.focus){S.buffs.focus={until:now()+r.mins*60000,pct:r.focus};m.push('focus +'+r.focus+'% voor '+r.mins+' min')}
  if(r.hp){S.hp=Math.min(100,S.hp+r.hp);m.push('gezondheid +'+r.hp)}
  if(r.energy){S.energy=Math.min(EN_MAX,S.energy+r.energy);m.push('energie +'+r.energy)}
  if(r.heat){S.heat=Math.max(0,S.heat-r.heat);m.push('hitte -'+r.heat)}
  if(r.clearWanted&&S.wanted){S.wanted=false;m.push('niet meer gezocht')}
  toast(r.n+': '+m.join(', '));log(r.place+': '+m.join(', '),'info');save();render()},
 rlBet(k){const r=rl;if(r.spinning)return;const tot=Object.values(r.bets).reduce((a,b)=>a+b,0);if(tot+r.chip>S.cash){toast('Niet genoeg contant geld voor deze fiche','bad');return}r.bets[k]=(r.bets[k]||0)+r.chip;render()},
 rlClear(){if(rl.spinning)return;rl.bets={};render()},
 rlSpin(){const r=rl;if(r.spinning||inJail())return;const tot=Object.values(r.bets).reduce((a,b)=>a+b,0);if(!tot)return;if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  S.cash-=tot;save();const n=rnd(0,36);const i=RL_ORDER.indexOf(n);const seg=Math.PI*2/37;
  const cur=((r.angle%(Math.PI*2))+Math.PI*2)%(Math.PI*2);let target=-i*seg;target=((target%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
  const delta=(target-cur+Math.PI*2)%(Math.PI*2)+Math.PI*2*6+(Math.random()-.5)*seg*.6;const from=r.angle,t0=performance.now(),dur=(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)?300:5000;
  r.spinning=true;r.res=null;render();
  const step=t=>{const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,4);r.angle=from+delta*e;drawWheel(r.angle);if(p<1)requestAnimationFrame(step);else finish()};requestAnimationFrame(step);
  const finish=()=>{r.spinning=false;const m=k=>{if(k[0]==='n')return +k.slice(1)===n?36:0;if(n===0)return 0;
    return {red:REDS.has(n)?2:0,black:!REDS.has(n)?2:0,even:n%2===0?2:0,odd:n%2?2:0,low:n<=18?2:0,high:n>=19?2:0,d1:n<=12?3:0,d2:n>12&&n<=24?3:0,d3:n>24?3:0}[k]||0};
    const pay=Object.entries(r.bets).reduce((a,[k,v])=>a+v*m(k),0);const net=pay-tot;S.cash+=pay;r.res=n;r.net=net;r.hist.unshift(n);r.hist=r.hist.slice(0,14);
    if(net>0){S.stats.won+=net;toast(n+' '+({red:'rood',black:'zwart',green:'groen'})[numCol(n)]+'. Gewonnen: +'+fmt(net))}else if(net<0){S.stats.lost+=-net;toast(n+' '+({red:'rood',black:'zwart',green:'groen'})[numCol(n)]+'. Verloren: -'+fmt(-net),'bad')}else toast(n+'. Quitte');
    log('Roulette: '+n+' ('+(net>=0?'+':'-')+fmt(Math.abs(net))+')',net>0?'ok':net<0?'bad':'info');save();render()}},
 sell(i){const c=S.cars.splice(i,1)[0];S.cash+=c.v;toast(c.n+' verkocht: +'+fmt(c.v));save();render()},
 sellAll(){const t=S.cars.reduce((a,c)=>a+c.v,0);S.cash+=t;S.cars=[];toast('Alles verkocht: +'+fmt(t));save();render()},
 getBet(){if(inJail()){toast('Je zit vast, geen gokken','bad');return 0}const b=Math.floor(+($('#bet').value||0));if(b<10){toast('Minimale inzet is €10','bad');return 0}if(b>S.cash){toast('Niet genoeg contant geld','bad');return 0}return b},
 win(b,m,label){if(m>0){S.cash+=b*m-b;S.stats.won+=b*m-b;toast(label+' Gewonnen: +'+fmt(b*m-b));log('Casino: +'+fmt(b*m-b),'ok')}else{S.cash-=b;S.stats.lost+=b;toast(label+' Verloren: -'+fmt(b),'bad');log('Casino: -'+fmt(b),'bad')}save()},
 coin(k){const b=act.getBet();if(!b)return;const r=Math.random()<.5?'kop':'munt';act.win(b,r===k?2:0,'Het werd '+r+'.');render()},
 /* oude roulettesnelknop */ roul(k){const b=act.getBet();if(!b)return;const n=rnd(0,36);const col=n===0?'groen':n%2?'rood':'zwart';window._roul=n+' '+col.toUpperCase();act.win(b,col===k?(k==='groen'?14:2):0,n+' '+col+'.');render()},
 buyBiz(id){const b=BIZ.find(x=>x.id===id);const own=S.biz[id]||0;const p=Math.floor(b.p*Math.pow(1.25,own));if(S.cash<p)return;S.cash-=p;S.biz[id]=own+1;addXp(Math.floor(p/200));toast(b.n+' gekocht');log(b.n+' gekocht voor '+fmt(p),'info');save();render()},
 buyGear(id){const g=GEAR.find(x=>x.id===id);if(S.cash<g.p)return;S.cash-=g.p;S.gear[id]=1;toast(g.n+' gekocht');log(g.n+' gekocht','info');save();render()},
 dep(){const a=Math.min(Math.floor(+$('#amt').value),Math.floor(S.cash));if(a>0){S.cash-=a;S.bank+=a;toast(fmt(a)+' gestort');save();render()}},
 wd(){const a=Math.min(Math.floor(+$('#amt').value),Math.floor(S.bank));if(a>0){S.bank-=a;S.cash+=a;toast(fmt(a)+' opgenomen');save();render()}},
 heal(){const c=healCost();if(S.cash<c){toast('Niet genoeg geld voor de dokter','bad');return}S.cash-=c;S.hp=100;toast('Volledig opgelapt');save();render()},
 bribe(){const c=bribeCost();if(S.cash<c){toast('Niet genoeg geld om om te kopen','bad');return}S.cash-=c;S.heat=0;toast('De politie kijkt even de andere kant op');save();render()},
 bail(){const c=bailCost();if(S.cash+S.bank<c)return;const fromCash=Math.min(S.cash,c);S.cash-=fromCash;S.bank-=c-fromCash;S.jailUntil=0;S.wanted=false;toast('Borg betaald. Je bent netjes vrij');log('Borg betaald: '+fmt(c),'info');save();render()},
 escape(){if(!inJail())return;if(Math.random()<.35){S.jailUntil=0;S.wanted=true;S.heat=Math.min(100,S.heat+15);addXp(15);toast('Ontsnapt! Je staat nu op de gezochtlijst','bad');log('Ontsnapt uit de bajes. Je bent gezocht','bad')}
  else{const left=Math.ceil((S.jailUntil-now())/1000);const nl=Math.min(600,left+30);S.jailUntil=now()+nl*1000;S.lastSentence=Math.max(S.lastSentence,nl);toast('Betrapt bij het hek. +30s straf','bad');log('Ontsnapping mislukt','bad')}save();render()},
 join(id){const f=FAMILIES.find(x=>x.id===id);if(rankIdx(S.xp)<f.r||S.cred<f.cred)return;S.family=id;toast('Welkom bij '+f.n,'lvl');log('Aangesloten bij '+f.n,'ok');save();render()},
 leave(){log('Familie '+fam().n+' verlaten','info');S.family=null;toast('Je bent weer op jezelf');save();render()},
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
(()=>{const skip=['redeem','bail','escape','getBet','win','bjEnd','leave','bjHit','bjStand','bjDouble','rlBet','rlClear'];let depth=0;
 Object.keys(act).forEach(k=>{if(skip.includes(k))return;const fn=act[k];act[k]=function(...a){
  if(depth===0&&S.wanted&&!inJail()&&Math.random()<(page==='casino'?0.2:0.12)){policeRaid();return}
  depth++;try{return fn.apply(this,a)}finally{depth--}}})})();
