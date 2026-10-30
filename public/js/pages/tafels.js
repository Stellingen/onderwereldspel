// Casino-tafels: Blackjack (met Perfect Pairs en 21+3) en Three Card Poker (met Pair Plus en 6-Card Bonus).
// Echte regels en standaard uitbetalingstabellen, dus het huis wint op termijn. Side bets: €10 tot €50.
// Side bets: maximaal €50 per rang (Rookie €50, Straatschoffie €100 … Peetvader €600)
const TB={MAIN_MIN:50,MAIN_MAX:50000,SIDE_MIN:10,get SIDE_MAX(){return 500*(rankIdx(S.xp)+1)},CHIPS:[10,25,50,100,500,1000,5000,10000]};
const RNK=['','','2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS=['♠','♥','♦','♣'];const isRed=s=>s==='♥'||s==='♦';
function newShoe(decks){const a=[];for(let d=0;d<decks;d++)for(const s of SUITS)for(let r=2;r<=14;r++)a.push({r,s});
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
// Alleen nieuwe kaarten schuiven binnen; een dichte kaart die opengaat draait om.
function cardEl(c,i,hidden){
  if(!c)return `<div class="tc ghost"></div>`;
  let anim='';if(!c._seen){anim='new';c._seen=1;c._hid=!!hidden}else if(c._hid&&!hidden){anim='flip';c._hid=false}
  if(hidden)return `<div class="tc back ${anim}"></div>`;
  return `<div class="tc ${isRed(c.s)?'red':''} ${anim}"><span class="tl">${RNK[c.r]}<i>${c.s}</i></span><span class="tm">${c.s}</span><span class="tr">${RNK[c.r]}<i>${c.s}</i></span></div>`}
const ghosts=n=>`<div class="ghosts">${'<div class="tc ghost"></div>'.repeat(n)}</div>`;
function chipStack(v){if(!v)return '';const cs=[];let left=v;for(const c of [...TB.CHIPS].reverse()){while(left>=c&&cs.length<6){cs.push(c);left-=c}}
  return `<div class="stack">${cs.reverse().map((c,i)=>`<i class="chip c${c}" style="--n:${i}"></i>`).join('')}<b>${fmt(v)}</b></div>`}
let tbChip=50;
function chipTray(game){return `<div class="tray">${TB.CHIPS.map(c=>`<button class="tchip c${c} ${tbChip===c?'on':''}" onclick="tbChip=${c};SFX.chip();render()" aria-label="Fiche ${c}">${c>=1000?c/1000+'K':c}</button>`).join('')}
  <span class="tray-l">Kies een fiche en tik op een vak</span></div>`}
function spot(game,key,label,val,opts){opts=opts||{};return `<button class="spot ${opts.side?'side':''} ${val?'has':''} ${opts.res?'r-'+opts.res:''}" ${opts.dis?'disabled':''} onclick="act.tbBet('${game}','${key}')">
  <span class="spot-l">${label}</span>${chipStack(val)}${opts.sub?`<span class="spot-s">${opts.sub}</span>`:''}${opts.out?`<span class="spot-o">${opts.out}</span>`:''}</button>`}
// Bonnetje na een ronde: per vak inzet, winst en wat je terugkrijgt
function receiptHtml(lines,net){if(!lines||!lines.length)return '';const st=lines.reduce((a,l)=>a+l.stake,0),bk=lines.reduce((a,l)=>a+l.back,0);
 return `<div class="receipt ${net>0?'win':net<0?'lose':''}"><div class="rc-head"><span>Uitbetaling</span><b>${net>0?'+'+fmt(net):net<0?'−'+fmt(-net):'Quitte'}</b></div>
  <div class="rc-row rc-lab"><span></span><span>Inzet</span><span>Winst</span><span>Terug</span></div>
  ${lines.map(l=>`<div class="rc-row ${l.back>l.stake?'w':l.back===l.stake&&l.stake?'p':'l'}"><span>${l.label}${l.note?`<small>${l.note}</small>`:''}</span><span>${l.stake?fmt(l.stake):'—'}</span><span>${l.back>l.stake?'+'+fmt(l.back-l.stake):l.back===l.stake&&l.stake?'±0':l.stake?'−'+fmt(l.stake):'—'}</span><b>${fmt(l.back)}</b></div>`).join('')}
  <div class="rc-row rc-tot"><span>Totaal</span><span>${fmt(st)}</span><span>${bk-st>=0?'+':'−'}${fmt(Math.abs(bk-st))}</span><b>${fmt(bk)}</b></div></div>`}
function tbPayRow(rows){return rows.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}

/* ======================= BLACKJACK ======================= */
window.bt=window.bt||{shoe:newShoe(6),bets:{main:0,pp:0,t21:0},last:null,phase:'bet',hands:[],dealer:[],active:0,side:{},msg:'',net:0};
const bjv=c=>c.r>=11&&c.r<=13?10:c.r===14?11:c.r;
function bjTotal(cards){let t=0,a=0;cards.forEach(c=>{t+=bjv(c);if(c.r===14)a++});while(t>21&&a){t-=10;a--}return {t,soft:a>0}}
function bjDraw(){if(bt.shoe.length<78)bt.shoe=newShoe(6);return bt.shoe.pop()}
function ppResult(a,b){if(a.r!==b.r)return null;if(a.s===b.s)return ['Perfect pair',27];if(isRed(a.s)===isRed(b.s))return ['Gekleurd paar',12];return ['Gemengd paar',6]}
function t3Result(cs){const rs=cs.map(c=>c.r).sort((x,y)=>x-y),fl=cs.every(c=>c.s===cs[0].s),tr=rs[0]===rs[2];
  const st=(rs[2]-rs[0]===2&&rs[1]-rs[0]===1)||(rs[0]===2&&rs[1]===3&&rs[2]===14);
  if(tr&&fl)return ['Suited trips',100];if(st&&fl)return ['Straight flush',40];if(tr)return ['Drie gelijke',30];if(st)return ['Straat',10];if(fl)return ['Flush',5];return null}
function bjTable(){
 const b=bt,bet=b.phase==='bet',h=b.hands,dUp0=b.dealer.length?bjTotal((b.phase==='play'||b.phase==='dealing')?[b.dealer[0]]:b.dealer).t:null,dUp=dUp0>21?'dood ('+dUp0+')':dUp0;
 const sideOut=k=>{const r=b.side[k];return r?(r.win?`${r.name} · +${fmt(r.win)}`:'Geen'):''};
 return `<div class="table bj">
  <div class="felt">
   <div class="felt-rules"><b>Blackjack betaalt 3 tegen 2</b><span>Dealer staat op alle 17 · 6 kaartspellen · splitsen en verdubbelen toegestaan</span></div>
   <div class="zone dealer"><div class="zl">Dealer${dUp!=null?` · <b>${dUp}${b.phase==='play'?'':''}</b>`:''}</div>
    ${b.dealer.length?`<div class="cards">${b.dealer.map((c,i)=>cardEl(c,i,(b.phase==='play'||b.phase==='dealing')&&i===1)).join('')}</div>`:ghosts(2)}</div>
   <div class="felt-arc">Verzekering niet beschikbaar · Side bets €${TB.SIDE_MIN}–€${TB.SIDE_MAX} (hoger met je rang)</div>
   <div class="zone player">
    <div class="hands">${h.length?h.map((hd,i)=>{const t=bjTotal(hd.cards);return `<div class="hand ${b.phase==='play'&&i===b.active?'act':''} ${hd.res?'r-'+hd.res:''}">
      <div class="cards">${hd.cards.map((c,j)=>cardEl(c,j)).join('')}</div>
      <div class="hl"><b>${t.t>21?'Dood':(t.soft&&t.t<21?t.t-10+'/'+t.t:t.t)}</b><span>${fmt(hd.bet)}${hd.dbl?' · verdubbeld':''}</span>${hd.out?`<em>${hd.out}</em>`:''}</div></div>`}).join(''):`<div class="hand">${ghosts(2)}</div>`}</div>
    <div class="spots">
     ${spot('bj','pp','Perfect Pairs',b.bets.pp,{side:1,dis:!bet,sub:'27 : 1',out:bet?'':sideOut('pp'),res:b.side.pp&&(b.side.pp.win?'win':'lose')})}
     ${spot('bj','main','Inzet',b.bets.main,{dis:!bet,sub:`€${TB.MAIN_MIN}–€${TB.MAIN_MAX.toLocaleString('nl-NL')}`})}
     ${spot('bj','t21','21 + 3',b.bets.t21,{side:1,dis:!bet,sub:'100 : 1',out:bet?'':sideOut('t21'),res:b.side.t21&&(b.side.t21.win?'win':'lose')})}
    </div>
   </div>
   ${b.msg?`<div class="felt-msg ${b.net>0?'win':b.net<0?'lose':''}">${b.msg}</div>`:''}
   ${b.phase==='done'?receiptHtml(b.lines,b.net):''}
  </div>
  <div class="table-bar">
   ${bet?`${chipTray('bj')}<div class="tb-act"><button class="btn ghost" onclick="act.tbClear('bj')" ${b.bets.main+b.bets.pp+b.bets.t21?'':'disabled'}>Wissen</button>
     ${b.last?`<button class="btn ghost" onclick="act.tbRebet('bj')">Zelfde inzet</button>`:''}
     <button class="btn" onclick="act.btDeal()" ${b.bets.main>=TB.MAIN_MIN&&!inJail()?'':'disabled'}>Delen · ${fmt(b.bets.main+b.bets.pp+b.bets.t21)}</button></div>`
   :b.phase==='play'?`<div class="tb-act play">${(()=>{const hd=h[b.active],c=hd.cards,can2=c.length===2&&!hd.splitAce;
     const pair=bjv(c[0])===bjv(c[1]),money=S.cash>=hd.bet;
     const canSplit=can2&&h.length===1&&pair&&money,canDbl=can2&&money;
     // Kan het niet, dan duidelijk rood met de reden eronder
     const whyDbl=!can2?'alleen bij 2 kaarten':!money?'te weinig saldo':'',whySpl=!can2||h.length>1?'alleen bij je eerste 2 kaarten':!pair?'geen paar':!money?'te weinig saldo':'';
     const ab=(fn,lab,en,ok,why)=>`<button class="btn bj-a ${ok?'ghost':'no'}" onclick="${fn}" ${ok?'':'disabled aria-disabled="true"'}><span>${lab}</span><small>${ok?en:why}</small></button>`;
     return ab('act.btHit()','Kaart','hit',1).replace('bj-a ghost','bj-a')+ab('act.btStand()','Passen','stand',1).replace('bj-a ghost','bj-a')
      +ab('act.btDouble()','Verdubbelen','double · '+fmt(hd.bet)+' erbij',canDbl,whyDbl)+ab('act.btSplit()','Splitsen','split · '+fmt(hd.bet)+' erbij',canSplit,whySpl)})()}</div>`
   :`<div class="tb-act"><button class="btn" onclick="act.btNew()">Nieuwe ronde</button><button class="btn ghost" onclick="act.tbRebet('bj');act.btDeal()" ${b.last&&S.cash>=b.last.main+b.last.pp+b.last.t21?'':'disabled'}>Zelfde inzet en delen</button></div>`}
  </div>
  <div class="paytabs">
   <div class="card"><h3>Perfect Pairs</h3><p class="sub">Je eerste twee kaarten vormen een paar.</p>${tbPayRow([['Perfect pair (zelfde kleur en teken)','27 : 1'],['Gekleurd paar (zelfde kleur)','12 : 1'],['Gemengd paar','6 : 1']])}</div>
   <div class="card"><h3>21 + 3</h3><p class="sub">Je twee kaarten plus de open kaart van de dealer, als pokerhand.</p>${tbPayRow([['Suited trips','100 : 1'],['Straight flush','40 : 1'],['Drie gelijke','30 : 1'],['Straat','10 : 1'],['Flush','5 : 1']])}</div>
  </div>
 </div>`;
}
function btSettleSide(){const p=bt.hands[0].cards,up=bt.dealer[0];bt.side={};
 if(bt.bets.pp){const r=ppResult(p[0],p[1]);bt.side.pp=r?{name:r[0],win:bt.bets.pp*r[1]}:{win:0}}
 if(bt.bets.t21){const r=t3Result([p[0],p[1],up]);bt.side.t21=r?{name:r[0],win:bt.bets.t21*r[1]}:{win:0}}}
function btFinish(){
 const b=bt;b.phase='done';const d=bjTotal(b.dealer).t,dBJ=b.dealer.length===2&&d===21;let back=0;const lines=[];
 b.hands.forEach(hd=>{const t=bjTotal(hd.cards).t,bj=hd.cards.length===2&&t===21&&b.hands.length===1;let pay=0;
  if(t>21){hd.res='lose';hd.out='Dood'}
  else if(bj&&!dBJ){pay=hd.bet*2.5;hd.res='win';hd.out='Blackjack!'}
  else if(dBJ&&!bj){hd.res='lose';hd.out='Dealer blackjack'}
  else if(d>21||t>d){pay=hd.bet*2;hd.res='win';hd.out=d>21?'Dealer dood':'Gewonnen'}
  else if(t===d){pay=hd.bet;hd.res='push';hd.out='Gelijk'}
  else{hd.res='lose';hd.out='Dealer wint'}
  back+=pay;lines.push({label:b.hands.length>1?'Hand '+(lines.length+1):'Inzet',note:hd.out+(hd.dbl?' · verdubbeld':''),stake:hd.bet,back:pay})});
 if(b.side.pp){const r=b.side.pp,bk=r.win?r.win+b.bets.pp:0;back+=bk;lines.push({label:'Perfect Pairs',note:r.name||'geen paar',stake:b.bets.pp,back:bk})}
 if(b.side.t21){const r=b.side.t21,bk=r.win?r.win+b.bets.t21:0;back+=bk;lines.push({label:'21 + 3',note:r.name||'geen combinatie',stake:b.bets.t21,back:bk})}
 b.lines=lines;
 const staked=b.hands.reduce((a,h)=>a+h.bet,0)+b.bets.pp+b.bets.t21;
 S.cash+=back;b.net=back-staked;
 if(b.net>0)S.stats.won+=b.net;else S.stats.lost+=-b.net;casinoRound(staked,back,'bj');
 b.msg=b.net>0?'Je krijgt '+fmt(back)+' terug':b.net<0?(back?'Je krijgt '+fmt(back)+' terug':'Je verliest '+fmt(-b.net)):'Quitte · '+fmt(back)+' terug';
 b.net>0?(b.net>=staked*3?SFX.big():SFX.win(2)):b.net<0?SFX.lose():SFX.chip();
 log('Blackjack: '+b.msg,b.net>0?'ok':b.net<0?'bad':'info');save();render();
}
async function btDealerPlay(){const b=bt;render();await tbWait(450);
 const live=b.hands.some(h=>bjTotal(h.cards).t<=21);
 while(live&&bjTotal(b.dealer).t<17){b.dealer.push(bjDraw());SFX.card();render();await tbWait(520)}
 btFinish()}
const tbWait=ms=>new Promise(r=>setTimeout(r,(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)?0:ms));
function btNext(){const b=bt;
 while(b.active<b.hands.length){const hd=b.hands[b.active],t=bjTotal(hd.cards).t;if(hd.done||t>=21||hd.splitAce&&hd.cards.length>=2){hd.done=true;b.active++}else break}
 if(b.active>=b.hands.length){b.phase='dealer';btDealerPlay()}else render()}

/* ======================= THREE CARD POKER ======================= */
window.tp=window.tp||{shoe:null,bets:{ante:0,pp:0,six:0},last:null,phase:'bet',p:[],d:[],res:null,msg:'',net:0};
function tp3(cs){const rs=cs.map(c=>c.r).sort((x,y)=>y-x),fl=cs.every(c=>c.s===cs[0].s);
  let st=rs[0]-rs[1]===1&&rs[1]-rs[2]===1,hi=rs;if(rs[0]===14&&rs[1]===3&&rs[2]===2){st=true;hi=[3,2,1]}
  const tr=rs[0]===rs[2],pr=rs[0]===rs[1]||rs[1]===rs[2];
  let cat=0,name='Hoge kaart',key=hi;
  if(st&&fl){cat=5;name='Straight flush'}else if(tr){cat=4;name='Drie gelijke'}else if(st){cat=3;name='Straat'}else if(fl){cat=2;name='Flush'}
  else if(pr){cat=1;name='Paar';const p=rs[1],k=rs[0]===rs[1]?rs[2]:rs[0];key=[p,k]}
  return {cat,name,key,hi:rs[0]}}
const tpCmp=(a,b)=>a.cat!==b.cat?a.cat-b.cat:(()=>{for(let i=0;i<a.key.length;i++)if(a.key[i]!==b.key[i])return a.key[i]-b.key[i];return 0})();
function best5of6(cards){let best=null;for(let i=0;i<6;i++){const h=cards.filter((_,j)=>j!==i);const c=cat5(h);if(!best||c[1]>best[1])best=c}return best}
function cat5(cs){const rs=cs.map(c=>c.r).sort((a,b)=>a-b),fl=cs.every(c=>c.s===cs[0].s),cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);const v=Object.values(cnt).sort((a,b)=>b-a);
  const uniq=[...new Set(rs)];const st=uniq.length===5&&(rs[4]-rs[0]===4||(rs.join()==='2,3,4,5,14'));
  if(st&&fl&&rs[0]===10)return ['Royal flush',9,1000];if(st&&fl)return ['Straight flush',8,200];if(v[0]===4)return ['Carré',7,50];if(v[0]===3&&v[1]===2)return ['Full house',6,25];
  if(fl)return ['Flush',5,20];if(st)return ['Straat',4,10];if(v[0]===3)return ['Drie gelijke',3,5];return ['Niets',0,0]}
const PP_PAY={5:40,4:30,3:6,2:3,1:1},ANTE_BONUS={5:5,4:4,3:1};
function tpTable(){
 const t=tp,bet=t.phase==='bet',dec=t.phase==='decide',done=t.phase==='done',rv=t.phase==='reveal';
 const pv=t.p.length?tp3(t.p):null,dv=done&&t.d.length?tp3(t.d):null;
 const o=t.res||{};
 return `<div class="table tcp">
  <div class="felt">
   <div class="felt-rules"><b>Three Card Poker</b><span>Dealer speelt met vrouw-hoog of beter · ante-bonus wordt altijd uitbetaald</span></div>
   <div class="zone dealer"><div class="zl">Dealer${dv?` · <b>${dv.name}</b>${o.qual===false?' · speelt niet':''}`:''}</div>
    ${t.d.length?`<div class="cards">${t.d.map((c,i)=>cardEl(c,i,!(done||(rv&&i<(t.rv||0))))).join('')}</div>`:ghosts(3)}</div>
   <div class="felt-arc">Pair Plus en 6-Card Bonus €${TB.SIDE_MIN}–€${TB.SIDE_MAX} (hoger met je rang) · winnen ook als je past</div>
   <div class="zone player">
    <div class="hands"><div class="hand ${o.main?'r-'+o.main:''}">${t.p.length?`<div class="cards">${t.p.map((c,i)=>cardEl(c,i)).join('')}</div>`:ghosts(3)}
     ${pv?`<div class="hl"><b>${pv.name}</b>${o.mainOut?`<em>${o.mainOut}</em>`:''}</div>`:''}</div></div>
    <div class="spots">
     ${spot('tp','pp','Pair Plus',t.bets.pp,{side:1,dis:!bet,sub:'tot 40 : 1',out:o.ppOut||'',res:o.pp})}
     ${spot('tp','ante','Ante',t.bets.ante,{dis:!bet,sub:`€${TB.MAIN_MIN}–€${TB.MAIN_MAX.toLocaleString('nl-NL')}`,out:o.anteOut||'',res:o.main})}
     <div class="spot play ${t.play?'has':''}"><span class="spot-l">Play</span>${chipStack(t.play||0)}<span class="spot-s">= ante</span></div>
     ${spot('tp','six','6-Card Bonus',t.bets.six,{side:1,dis:!bet,sub:'tot 1000 : 1',out:o.sixOut||'',res:o.six})}
    </div>
   </div>
   ${t.msg?`<div class="felt-msg ${t.net>0?'win':t.net<0?'lose':''}">${t.msg}</div>`:''}
   ${done?receiptHtml(t.lines,t.net):''}
  </div>
  <div class="table-bar">
   ${bet?`${chipTray('tp')}<div class="tb-act"><button class="btn ghost" onclick="act.tbClear('tp')" ${t.bets.ante+t.bets.pp+t.bets.six?'':'disabled'}>Wissen</button>
     ${t.last?`<button class="btn ghost" onclick="act.tbRebet('tp')">Zelfde inzet</button>`:''}
     <button class="btn" onclick="act.tpDeal()" ${(t.bets.ante>=TB.MAIN_MIN||t.bets.pp||t.bets.six)&&!inJail()?'':'disabled'}>Delen · ${fmt(t.bets.ante+t.bets.pp+t.bets.six)}</button></div>`
   :rv?`<div class="tb-act"><button class="btn" disabled>De dealer draait zijn kaarten om…</button></div>`
   :dec?`<div class="tb-act play"><button class="btn" onclick="act.tpPlay()" ${S.cash>=t.bets.ante?'':'disabled'}>Spelen · ${fmt(t.bets.ante)}</button><button class="btn red" onclick="act.tpFold()">Passen (ante kwijt)</button></div>`
   :`<div class="tb-act"><button class="btn" onclick="act.tpNew()">Nieuwe ronde</button><button class="btn ghost" onclick="act.tbRebet('tp');act.tpDeal()" ${t.last&&S.cash>=t.last.ante*2+t.last.pp+t.last.six?'':'disabled'}>Zelfde inzet en delen</button></div>`}
  </div>
  <div class="paytabs three">
   <div class="card"><h3>Ante en Play</h3><p class="sub">Versla de dealer. Speelt de dealer niet (lager dan vrouw-hoog), dan krijg je 1:1 op je ante en je play-inzet terug.</p>${tbPayRow([['Ante-bonus: straight flush','5 : 1'],['Drie gelijke','4 : 1'],['Straat','1 : 1']])}</div>
   <div class="card"><h3>Pair Plus</h3><p class="sub">Alleen je eigen drie kaarten tellen.</p>${tbPayRow([['Straight flush','40 : 1'],['Drie gelijke','30 : 1'],['Straat','6 : 1'],['Flush','3 : 1'],['Paar','1 : 1']])}</div>
   <div class="card"><h3>6-Card Bonus</h3><p class="sub">Beste vijf uit jouw drie en de drie van de dealer.</p>${tbPayRow([['Royal flush','1000 : 1'],['Straight flush','200 : 1'],['Carré','50 : 1'],['Full house','25 : 1'],['Flush','20 : 1'],['Straat','10 : 1'],['Drie gelijke','5 : 1']])}</div>
  </div>
 </div>`;
}
function tpDraw(){if(!tp.shoe||tp.shoe.length<10)tp.shoe=newShoe(1);return tp.shoe.pop()}
// de dealer draait zijn kaarten één voor één om; pas daarna volgt de uitslag
async function tpReveal(folded){const t=tp;t.phase='reveal';t.rv=0;render();await tbWait(300);
 for(let i=0;i<t.d.length;i++){t.rv=i+1;SFX.card();render();await tbWait(480)}
 await tbWait(200);tpSettle(folded)}
function tpSettle(folded){
 const t=tp;t.phase='done';const pv=tp3(t.p),dv=tp3(t.d),qual=dv.cat>0||dv.hi>=12;const o={qual};let back=0;
 const staked=t.bets.ante+t.bets.pp+t.bets.six+(t.play||0);
 if(t.bets.pp){const m=PP_PAY[pv.cat]||0;o.pp=m?'win':'lose';o.ppOut=m?`${pv.name} · +${fmt(t.bets.pp*m)}`:'Geen';back+=m?t.bets.pp*(m+1):0}
 if(t.bets.six){const c=best5of6([...t.p,...t.d]);o.six=c[2]?'win':'lose';o.sixOut=c[2]?`${c[0]} · +${fmt(t.bets.six*c[2])}`:'Geen';back+=c[2]?t.bets.six*(c[2]+1):0}
 if(t.bets.ante){
  if(folded){o.main='lose';o.mainOut='Gepast';o.anteOut='Kwijt'}
  else{const bonus=(ANTE_BONUS[pv.cat]||0)*t.bets.ante;back+=bonus;
   if(!qual){back+=t.bets.ante*2+t.play;o.main='win';o.mainOut='Dealer speelt niet';o.anteOut='+'+fmt(t.bets.ante+bonus)}
   else{const c=tpCmp(pv,dv);
    if(c>0){back+=t.bets.ante*2+t.play*2;o.main='win';o.mainOut='Je wint';o.anteOut='+'+fmt(t.bets.ante*2+bonus)}
    else if(c===0){back+=t.bets.ante+t.play;o.main='push';o.mainOut='Gelijk';o.anteOut=bonus?'+'+fmt(bonus):'Gelijk'}
    else{o.main='lose';o.mainOut='Dealer wint';o.anteOut=bonus?'Bonus +'+fmt(bonus):'Kwijt'}}}
 }
 // bonnetje
 const L=[];const pm=PP_PAY[pv.cat]||0,c6=t.bets.six?best5of6([...t.p,...t.d]):null,ab=(ANTE_BONUS[pv.cat]||0)*t.bets.ante;
 if(t.bets.ante){let aBack=0,pBack=0;
  if(folded){}else if(!qual){aBack=t.bets.ante*2;pBack=t.play}else{const c=tpCmp(pv,dv);if(c>0){aBack=t.bets.ante*2;pBack=t.play*2}else if(c===0){aBack=t.bets.ante;pBack=t.play}}
  L.push({label:'Ante',note:o.mainOut,stake:t.bets.ante,back:aBack});
  if(!folded)L.push({label:'Play',note:!qual?'terug, dealer speelt niet':o.mainOut,stake:t.play,back:pBack});
  if(ab&&!folded)L.push({label:'Ante-bonus',note:pv.name,stake:0,back:ab})}
 if(t.bets.pp)L.push({label:'Pair Plus',note:pm?pv.name:'geen',stake:t.bets.pp,back:pm?t.bets.pp*(pm+1):0});
 if(t.bets.six)L.push({label:'6-Card Bonus',note:c6[2]?c6[0]:'geen',stake:t.bets.six,back:c6[2]?t.bets.six*(c6[2]+1):0});
 t.lines=L;
 t.res=o;S.cash+=back;t.net=back-staked;
 if(t.net>0)S.stats.won+=t.net;else S.stats.lost+=-t.net;casinoRound(staked,back,'tcp');
 t.msg=t.net>0?'Je krijgt '+fmt(back)+' terug':t.net<0?(back?'Je krijgt '+fmt(back)+' terug':'Je verliest '+fmt(-t.net)):'Quitte · '+fmt(back)+' terug';
 t.net>0?(t.net>=staked*3?SFX.big():SFX.win(2)):t.net<0?SFX.lose():SFX.chip();
 log('Three Card Poker: '+t.msg,t.net>0?'ok':t.net<0?'bad':'info');save();render()}

/* ======================= Acties ======================= */
Object.assign(act,{
 tbBet(game,key){const T=game==='bj'?bt:tp;if(T.phase!=='bet'&&T.phase!=='done')return;if(T.phase==='done'){game==='bj'?act.btNew():act.tpNew()}
  const side=key!=='main'&&key!=='ante',cap=side?TB.SIDE_MAX:TB.MAIN_MAX;
  const cur=T.bets[key],tot=Object.values(T.bets).reduce((a,b)=>a+b,0);
  let add=Math.min(tbChip,cap-cur);if(add<=0){toast(side?'Side bets gaan bij jouw rang tot €'+TB.SIDE_MAX+' (+€500 per rang)':'Maximale inzet bereikt','bad');return}
  if(side&&cur+add<TB.SIDE_MIN)add=TB.SIDE_MIN-cur;
  if(tot+add>S.cash){toast('Niet genoeg contant geld','bad');return}
  T.bets[key]=cur+add;SFX.chip();render()},
 tbClear(game){const T=game==='bj'?bt:tp;if(T.phase!=='bet')return;Object.keys(T.bets).forEach(k=>T.bets[k]=0);render()},
 tbRebet(game){const T=game==='bj'?bt:tp;if(!T.last)return;if(T.phase==='done')game==='bj'?act.btNew():act.tpNew();T.bets=Object.assign({},T.last);render()},
 btNew(){Object.assign(bt,{bets:{main:0,pp:0,t21:0},lines:null,phase:'bet',hands:[],dealer:[],active:0,side:{},msg:'',net:0});render()},
 async btDeal(){const b=bt;if(b.phase!=='bet'||inJail())return;const tot=b.bets.main+b.bets.pp+b.bets.t21;
  if(b.bets.main<TB.MAIN_MIN){toast('Minimale inzet is €'+TB.MAIN_MIN,'bad');return}if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  S.cash-=tot;b.last=Object.assign({},b.bets);b.msg='';b.net=0;b.side={};
  b.hands=[{cards:[],bet:b.bets.main}];b.dealer=[];b.active=0;b.phase='dealing';
  for(const who of ['p','d','p','d']){if(who==='p')b.hands[0].cards.push(bjDraw());else b.dealer.push(bjDraw());SFX.card();render();await tbWait(260)}
  btSettleSide();b.phase='play';
  const up=b.dealer[0],dBJ=bjTotal(b.dealer).t===21,pBJ=bjTotal(b.hands[0].cards).t===21;
  if((up.r===14||bjv(up)===10)&&dBJ){b.msg='Dealer kijkt… blackjack!';btFinish();return}
  if(pBJ){btFinish();return}
  save();render()},
 btHit(){const b=bt;if(b.phase!=='play')return;const hd=b.hands[b.active];hd.cards.push(bjDraw());SFX.card();if(bjTotal(hd.cards).t>=21)hd.done=true;btNext()},
 btStand(){const b=bt;if(b.phase!=='play')return;b.hands[b.active].done=true;b.active++;btNext()},
 btDouble(){const b=bt;if(b.phase!=='play')return;const hd=b.hands[b.active];if(hd.cards.length!==2||S.cash<hd.bet)return;
  S.cash-=hd.bet;hd.bet*=2;hd.dbl=1;hd.cards.push(bjDraw());SFX.chip();SFX.card();hd.done=true;b.active++;btNext()},
 btSplit(){const b=bt;if(b.phase!=='play'||b.hands.length>1)return;const hd=b.hands[0];if(hd.cards.length!==2||bjv(hd.cards[0])!==bjv(hd.cards[1])||S.cash<hd.bet)return;
  S.cash-=hd.bet;const ace=hd.cards[0].r===14;const h2={cards:[hd.cards.pop(),bjDraw()],bet:hd.bet,splitAce:ace};hd.cards.push(bjDraw());hd.splitAce=ace;b.hands.push(h2);SFX.chip();SFX.card();btNext()},
 tpNew(){Object.assign(tp,{bets:{ante:0,pp:0,six:0},lines:null,phase:'bet',p:[],d:[],res:null,msg:'',net:0,play:0});render()},
 async tpDeal(){const t=tp;if(t.phase!=='bet'||inJail())return;const tot=t.bets.ante+t.bets.pp+t.bets.six;
  if(t.bets.ante&&t.bets.ante<TB.MAIN_MIN){toast('Minimale ante is €'+TB.MAIN_MIN,'bad');return}
  if(!tot){toast('Zet eerst een inzet','bad');return}if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  S.cash-=tot;t.last=Object.assign({},t.bets);t.shoe=newShoe(1);t.p=[];t.d=[];t.res=null;t.msg='';t.play=0;t.phase='dealing';
  for(let i=0;i<3;i++){t.p.push(tpDraw());t.d.push(tpDraw());SFX.card();render();await tbWait(220)}
  if(!t.bets.ante){tpSettle(false);return}
  t.phase='decide';save();render()},
 tpPlay(){const t=tp;if(t.phase!=='decide'||S.cash<t.bets.ante)return;S.cash-=t.bets.ante;t.play=t.bets.ante;SFX.chip();tpReveal(false)},
 tpFold(){const t=tp;if(t.phase!=='decide')return;tpReveal(true)}
});
