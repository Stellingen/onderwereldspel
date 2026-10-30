// Casino: Texas Hold'em tegen de bank (Casino Hold'em, zoals in het casino).
// Ante inzetten → jij en de dealer krijgen 2 kaarten, de flop (3) ligt open → meespelen (call = 2× je ante) of passen.
// Dealer speelt mee vanaf een paar vieren. Speelt hij niet, dan betaalt je ante volgens de tabel en krijg je je call terug.
// Speelt hij wel: wint jouw beste 5 (uit 7) → ante volgens de tabel + call 1:1; gelijk → alles terug; anders alles kwijt.
// AA Bonus (side bet): jouw 2 kaarten + de flop, vanaf een paar azen. Doorgerekend in sim_holdem.js.
/*CORE*/
const TH_ANTE={9:100,8:20,7:10,6:3,5:2};            // royal, straight flush, carré, full house, flush; de rest 1:1
const TH_AA={9:100,8:50,7:40,6:30,5:20,4:7,3:7,2:7};  // plus een paar azen 7:1
const TH_NAMES=['Hoge kaart','Paar','Twee paar','Drie gelijke','Straat','Flush','Full house','Carré','Straight flush','Royal flush'];
// 5 kaarten → [categorie, tiebreakers...] (r: 2..14)
function thEval5(cs){const rs=cs.map(c=>c.r).sort((a,b)=>b-a),fl=cs.every(c=>c.s===cs[0].s),cnt={};rs.forEach(r=>cnt[r]=(cnt[r]||0)+1);
 const g=Object.entries(cnt).map(([r,n])=>[+r,n]).sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
 const u=[...new Set(rs)];let hi=0;if(u.length===5){if(rs[0]-rs[4]===4)hi=rs[0];else if(rs.join()==='14,5,4,3,2')hi=5}
 if(hi&&fl)return [hi===14?9:8,hi];if(g[0][1]===4)return [7,g[0][0],g[1][0]];if(g[0][1]===3&&g[1][1]===2)return [6,g[0][0],g[1][0]];
 if(fl)return [5,...rs];if(hi)return [4,hi];if(g[0][1]===3)return [3,g[0][0],...g.slice(1).map(x=>x[0])];
 if(g[0][1]===2&&g[1][1]===2)return [2,g[0][0],g[1][0],g[2][0]];if(g[0][1]===2)return [1,g[0][0],...g.slice(1).map(x=>x[0])];return [0,...rs]}
const thCmp=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0};
// beste 5 uit 5, 6 of 7 kaarten; geeft ook de gebruikte kaarten terug
const TH_PL={2:'tweeën',3:'drieën',4:'vieren',5:'vijven',6:'zessen',7:'zevens',8:'achten',9:'negens',10:'tienen',11:'boeren',12:'vrouwen',13:'heren',14:'azen'};
const TH_IDX={};
function thCombos(n){if(TH_IDX[n])return TH_IDX[n];const out=[];(function rec(s,acc){if(acc.length===5){out.push(acc.slice());return}for(let i=s;i<n;i++){acc.push(i);rec(i+1,acc);acc.pop()}})(0,[]);return TH_IDX[n]=out}
function thBest(cs){let best=null,use=null;
 for(const I of thCombos(cs.length)){const h=I.map(i=>cs[i]),v=thEval5(h);if(!best||thCmp(v,best)>0){best=v;use=I}}
 return {v:best,cat:best[0],name:best[0]===1?'Paar '+TH_PL[best[1]]:TH_NAMES[best[0]],use}}
const thQual=d=>d.cat>=2||(d.cat===1&&d.v[1]>=4);
function thAA(p,flop){const b=thBest([...p,...flop]);if(TH_AA[b.cat])return {name:b.name,m:TH_AA[b.cat]};if(b.cat===1&&b.v[1]===14)return {name:'Paar azen',m:7};return null}
// uitkomst in "terug"-bedragen (inclusief inzet). call = 0 als je past.
function thSettle(ante,call,aa,p,d,board){const pb=thBest([...p,...board]),db=thBest([...d,...board]),qual=thQual(db);const r={pb,db,qual,ante:0,call:0,aa:0};
 if(aa){const x=thAA(p,board.slice(0,3));r.aaHit=x;r.aa=x?aa*(x.m+1):0}
 if(!call){r.out='fold';return r}
 const am=(TH_ANTE[pb.cat]||1);
 if(!qual){r.ante=ante*(am+1);r.call=call;r.out='nq';return r}
 const c=thCmp(pb.v,db.v);
 if(c>0){r.ante=ante*(am+1);r.call=call*2;r.out='win'}else if(c===0){r.ante=ante;r.call=call;r.out='push'}else r.out='lose';
 return r}
/*/CORE*/
if(typeof window!=='undefined'){
window.th=window.th||{shoe:null,bets:{ante:0,aa:0},last:null,phase:'bet',p:[],d:[],b:[],call:0,res:null,msg:'',net:0,rv:0};
function thDraw(){if(!th.shoe||th.shoe.length<12)th.shoe=newShoe(1);return th.shoe.pop()}
const thBusy=()=>['dealing','reveal'].includes(th.phase);
function thTable(){
 const t=th,bet=t.phase==='bet',dec=t.phase==='decide',done=t.phase==='done',rv=t.phase==='reveal',o=t.res||{};
 const showD=done||(rv&&t.rv>=1),nb=t.b.length;
 const pNow=t.p.length&&nb>=3?thBest([...t.p,...t.b]):null;
 const used=done&&o.pb?new Set(o.pb.use.map(i=>i)):null;
 const dName=showD&&o.db?o.db.name+(o.qual===false?' · speelt niet':''):'';
 const aaOut=t.p.length&&nb>=3&&t.bets.aa?(()=>{const x=thAA(t.p,t.b.slice(0,3));return x?`${x.name} · +${fmt(t.bets.aa*x.m)}`:'Geen'})():'';
 return `<div class="table th">
  <div class="felt">
   <div class="felt-rules"><b>Texas Hold'em</b><span>Tegen de dealer · dealer speelt vanaf een paar vieren · meespelen kost 2× je ante</span></div>
   <div class="zone dealer"><div class="zl">Dealer${dName?` · <b>${dName}</b>`:''}</div>
    ${t.d.length?`<div class="cards">${t.d.map((c,i)=>cardEl(c,i,!showD)).join('')}</div>`:ghosts(2)}</div>
   <div class="zone board"><div class="zl">Tafel${nb?` · <b>${nb===3?'flop':nb===4?'turn':'river'}</b>`:''}</div>
    <div class="cards">${t.b.map((c,i)=>cardEl(c,i)).join('')}${'<div class="tc ghost"></div>'.repeat(5-nb)}</div></div>
   <div class="felt-arc">AA Bonus €${TB.SIDE_MIN}–€${TB.SIDE_MAX} (hoger met je rang) · telt ook als je past</div>
   <div class="zone player">
    <div class="hands"><div class="hand ${o.main?'r-'+o.main:''}">${t.p.length?`<div class="cards">${t.p.map((c,i)=>cardEl(c,i)).join('')}</div>`:ghosts(2)}
     ${pNow?`<div class="hl"><b>${pNow.name}</b>${o.mainOut?`<em>${o.mainOut}</em>`:''}</div>`:''}</div></div>
    <div class="spots">
     ${spot('th','aa','AA Bonus',t.bets.aa,{side:1,dis:!bet,sub:'tot 100 : 1',out:bet?'':aaOut,res:o.aa})}
     ${spot('th','ante','Ante',t.bets.ante,{dis:!bet,sub:`€${TB.MAIN_MIN}–€${TB.MAIN_MAX.toLocaleString('nl-NL')}`,out:o.anteOut||'',res:o.main})}
     <div class="spot play ${t.call?'has':''}"><span class="spot-l">Call</span>${chipStack(t.call||0)}<span class="spot-s">= 2× ante</span></div>
    </div>
   </div>
   ${t.msg?`<div class="felt-msg ${t.net>0?'win':t.net<0?'lose':''}">${t.msg}</div>`:''}
   ${done?receiptHtml(t.lines,t.net):''}
  </div>
  <div class="table-bar">
   ${bet?`${chipTray('th')}<div class="tb-act"><button class="btn ghost" onclick="act.tbClear('th')" ${t.bets.ante+t.bets.aa?'':'disabled'}>Wissen</button>
     ${t.last?`<button class="btn ghost" onclick="act.tbRebet('th')">Zelfde inzet</button>`:''}
     <button class="btn" onclick="act.thDeal()" ${t.bets.ante>=TB.MAIN_MIN&&!inJail()?'':'disabled'}>Delen · ${fmt(t.bets.ante+t.bets.aa)}</button></div>`
   :rv||t.phase==='dealing'?`<div class="tb-act"><button class="btn" disabled>${rv?'De dealer legt de rest neer…':'Delen…'}</button></div>`
   :dec?`<div class="tb-act play">${(()=>{const need=t.bets.ante*2,ok=S.cash>=need;
     return `<button class="btn bj-a ${ok?'':'no'}" onclick="act.thCall()" ${ok?'':'disabled'}><span>Meespelen · ${fmt(need)}</span><small>${ok?'call · 2× je ante':'te weinig saldo'}</small></button>
      <button class="btn bj-a red" onclick="act.thFold()"><span>Passen</span><small>fold · ante kwijt</small></button>`})()}</div>`
   :`<div class="tb-act"><button class="btn" onclick="act.thNew()">Nieuwe ronde</button><button class="btn ghost" onclick="act.tbRebet('th');act.thDeal()" ${t.last&&S.cash>=t.last.ante*3+t.last.aa?'':'disabled'}>Zelfde inzet en delen</button></div>`}
  </div>
  <div class="paytabs three">
   <div class="card"><h3>Ante</h3><p class="sub">Win je van de dealer, of speelt hij niet (lager dan een paar vieren), dan betaalt je ante volgens deze tabel. Je call betaalt 1:1, of je krijgt hem terug als de dealer niet speelt.</p>${tbPayRow([['Royal flush','100 : 1'],['Straight flush','20 : 1'],['Carré','10 : 1'],['Full house','3 : 1'],['Flush','2 : 1'],['Straat of lager','1 : 1']])}</div>
   <div class="card"><h3>AA Bonus</h3><p class="sub">Jouw twee kaarten plus de flop, vanaf een paar azen. Telt ook als je past.</p>${tbPayRow([['Royal flush','100 : 1'],['Straight flush','50 : 1'],['Carré','40 : 1'],['Full house','30 : 1'],['Flush','20 : 1'],['Straat','7 : 1'],['Drie gelijke','7 : 1'],['Twee paar','7 : 1'],['Paar azen','7 : 1']])}</div>
   <div class="card"><h3>Zo speel je</h3><p class="sub">Zet je ante (en eventueel AA Bonus) en deel. Je ziet je twee kaarten en de flop. Meespelen kost 2× je ante; daarna komen de turn en de river en draait de dealer om. Jouw beste vijf uit zeven tegen die van de dealer.</p>${tbPayRow([['Dealer speelt','vanaf paar vieren'],['Gelijk','alles terug'],['Passen','ante kwijt']])}</div>
  </div>
 </div>`}
async function thReveal(folded){const t=th;t.phase='reveal';t.rv=0;render();await tbWait(300);
 while(t.b.length<5){t.b.push(thDraw());SFX.card();render();await tbWait(460)}
 t.rv=1;SFX.card();render();await tbWait(520);thFinish(folded)}
function thFinish(folded){const t=th;t.phase='done';
 const r=thSettle(t.bets.ante,folded?0:t.call,t.bets.aa,t.p,t.d,t.b),o={pb:r.pb,db:r.db,qual:r.qual};
 const staked=t.bets.ante+t.bets.aa+(folded?0:t.call),back=r.ante+r.call+r.aa,am=TH_ANTE[r.pb.cat]||1;
 if(folded){o.main='lose';o.mainOut='Gepast';o.anteOut='Kwijt'}
 else if(r.out==='nq'){o.main='win';o.mainOut='Dealer speelt niet';o.anteOut='+'+fmt(t.bets.ante*am)}
 else if(r.out==='win'){o.main='win';o.mainOut='Je wint';o.anteOut='+'+fmt(t.bets.ante*am)}
 else if(r.out==='push'){o.main='push';o.mainOut='Gelijk';o.anteOut='Gelijk'}
 else{o.main='lose';o.mainOut='Dealer wint';o.anteOut='Kwijt'}
 if(t.bets.aa)o.aa=r.aa?'win':'lose';
 const L=[{label:'Ante',note:o.mainOut+(r.ante>t.bets.ante*2?' · '+r.pb.name+' '+am+':1':''),stake:t.bets.ante,back:r.ante}];
 if(!folded)L.push({label:'Call',note:r.out==='nq'?'terug, dealer speelt niet':o.mainOut,stake:t.call,back:r.call});
 if(t.bets.aa)L.push({label:'AA Bonus',note:r.aaHit?r.aaHit.name:'geen',stake:t.bets.aa,back:r.aa});
 t.lines=L;t.res=o;S.cash+=back;t.net=back-staked;
 if(t.net>0)S.stats.won+=t.net;else S.stats.lost+=-t.net;casinoRound(staked,back,'th');
 t.msg=t.net>0?'Je krijgt '+fmt(back)+' terug':t.net<0?(back?'Je krijgt '+fmt(back)+' terug':'Je verliest '+fmt(-t.net)):'Quitte · '+fmt(back)+' terug';
 t.net>0?(t.net>=staked*3?SFX.big():SFX.win(2)):t.net<0?SFX.lose():SFX.chip();
 log("Texas Hold'em: "+t.msg,t.net>0?'ok':t.net<0?'bad':'info');save();render()}
Object.assign(act,{
 thNew(){Object.assign(th,{bets:{ante:0,aa:0},lines:null,phase:'bet',p:[],d:[],b:[],res:null,msg:'',net:0,call:0,rv:0});render()},
 async thDeal(){const t=th;if(t.phase!=='bet'||inJail())return;const tot=t.bets.ante+t.bets.aa;
  if(t.bets.ante<TB.MAIN_MIN){toast('Minimale ante is €'+TB.MAIN_MIN,'bad');return}if(tot>S.cash){toast('Niet genoeg contant geld','bad');return}
  S.cash-=tot;t.last=Object.assign({},t.bets);t.shoe=newShoe(1);t.p=[];t.d=[];t.b=[];t.res=null;t.msg='';t.call=0;t.rv=0;t.phase='dealing';
  for(let i=0;i<2;i++){t.p.push(thDraw());SFX.card();render();await tbWait(220);t.d.push(thDraw());SFX.card();render();await tbWait(220)}
  for(let i=0;i<3;i++){t.b.push(thDraw());SFX.card();render();await tbWait(240)}
  t.phase='decide';save();render()},
 thCall(){const t=th;if(t.phase!=='decide')return;const need=t.bets.ante*2;if(S.cash<need){toast('Niet genoeg contant geld','bad');return}
  S.cash-=need;t.call=need;SFX.chip();thReveal(false)},
 thFold(){const t=th;if(t.phase!=='decide')return;SFX.click();thReveal(true)}});
}
