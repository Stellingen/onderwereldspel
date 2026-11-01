// Huizenmarkt (Verblijf → Huizenmarkt): woningen kopen of huren, waardestijging, huur per speldag, achterstand en uitzetting.
// S.home   = id uit HOUSES waar je woont (Onder de brug kan altijd)
// S.owned  = {id: {b: aankoopprijs, t: gekocht op, xp: XP al gehad}}  — gekochte woningen blijven van jou, ook als je verhuist
// S.rent   = {id, paid: begin van de laatst betaalde speldag, debt: achterstand, late: begin van de eerste onbetaalde speldag}
// Huur gaat elke speldag (4 uur, dezelfde blokken als de bedrijven) automatisch van de bank, en anders van je wit geld.
// Lukt dat niet, dan loopt er een achterstand op. Na 7 speldagen achterstand word je uitgezet: je gaat naar je beste eigen
// woning (of onder de brug) en spullen die niet passen gaan naar de opslag. Alles wordt per speldag afgerekend met een teller
// in je opslag, dus offline wordt het bij het openen ingehaald en kan niets dubbel gaan.
const RENT_GRACE=7;
const ownedS=()=>S.owned||(S.owned={});
const houseOwned=id=>id==='brug'||!!ownedS()[id];
const houseTier=id=>HOMES.findIndex(t=>t.id===houseOf(id).t);
function houseVal(id){const o=ownedS()[id];if(!o)return 0;const L=houseOf(id),d=Math.max(0,(now()-o.t)/DAY_MS);return Math.floor(o.b*Math.min(L.cap||1,Math.pow(1+(L.g||0),d)))}
const houseSell=id=>Math.floor(houseVal(id)*(1-HOUSE_FEE));
const homesVal=()=>Object.keys(ownedS()).reduce((a,id)=>a+houseVal(id),0);
// volgende speldag na t (ook goed bij zomer- en wintertijd)
const rentNext=t=>dayStart(t+DAY_MS+5400000);
// betaal een bedrag van de bank en anders van je wit geld; geeft terug wat er betaald is
function rentTake(x,why){let paid=0;const b=Math.min(S.bank,x);if(b>0){S.bank-=b;paid+=b;typeof bkTx==='function'&&bkTx('pay',-b,why)}
 const w=Math.min(wit(),x-paid);if(w>0){spendWit(w);paid+=w}return paid}
function rentTick(){
 // oude huurschuld (na een uitzetting) wordt verrekend zodra er weer geld is; tot die tijd kun je niets huren
 if(S.rentOwed>0){const got=rentTake(S.rentOwed,'Oude huurschuld');if(got>0){S.rentOwed-=got;if(S.rentOwed<=0){S.rentOwed=0;log('Oude huurschuld afbetaald','ok')}}}
 const R=S.rent;if(!R)return;if(R.id!==S.home){S.rent=null;return}
 const L=houseOf(R.id),cur=dayStart(now());let n=0,miss=0;
 while(rentNext(R.paid)<=cur&&n<500){R.paid=rentNext(R.paid);n++;const got=rentTake(L.rent,'Huur '+L.n);if(got<L.rent){R.debt=(R.debt||0)+L.rent-got;if(!R.late)R.late=R.paid;miss++}}
 // achterstand aflossen zodra er weer geld is
 if(R.debt>0){const got=rentTake(R.debt,'Huurachterstand '+L.n);R.debt-=got;if(R.debt<=0){R.debt=0;R.late=0;if(got>0){log('Huurachterstand betaald: '+fmt(got),'ok');typeof toast==='function'&&toast('Huurachterstand afgelost','ok')}}}
 if(n&&!miss)log('Huur '+L.n+': '+fmt(L.rent*n)+(n>1?' ('+n+' speldagen)':''),'info');
 if(miss&&typeof toast==='function')toast('Je kon de huur niet betalen. Achterstand: '+fmt(R.debt),'bad');
 if(R.debt>0&&R.late&&rentDaysLate()>=RENT_GRACE)evict()}
// hoeveel speldagen de achterstand al loopt
function rentDaysLate(){const R=S.rent;if(!R||!R.late||!(R.debt>0))return 0;let d=0,t=R.late;const cur=dayStart(now());while(t<cur&&d<99){t=rentNext(t);d++}return d}
const rentDeadline=()=>{const R=S.rent;if(!R||!R.late)return 0;let t=R.late;for(let i=0;i<RENT_GRACE;i++)t=rentNext(t);return t};
function bestOwned(){const ids=Object.keys(ownedS()).filter(id=>houseOf(id).id===id);return ids.sort((a,b)=>houseTier(b)-houseTier(a)||houseOf(b).p-houseOf(a).p)[0]||'brug'}
function evict(){const R=S.rent;if(!R)return;const L=houseOf(R.id),to=bestOwned();S.rentOwed=(S.rentOwed||0)+(R.debt||0);S.rent=null;if(window.stay&&stay.kind&&typeof stayStop==='function')try{stayStop(false)}catch(e){}
 S.home=to;const moved=furnNormalize();
 const msg='Uitgezet uit '+L.n+' ('+L.place+'): 7 speldagen huurachterstand. Je woont nu '+(to==='brug'?'onder de brug':'in je '+houseOf(to).n.toLowerCase())+'. De schuld van '+fmt(S.rentOwed)+' blijft staan en wordt verrekend zodra je weer geld hebt.'+(moved.length?' '+moved.length+' spul'+(moved.length>1?'len staan':' staat')+' in de opslag.':'');
 log(msg,'bad');if(typeof toast==='function')toast(msg,'bad');save()}
function houseMove(id){if(window.stay&&stay.kind){toast('Je bent nog bezig met rusten of de dokter','bad');return false}
 if(S.rent&&S.rent.id!==id&&S.rent.debt>0){toast('Betaal eerst je huurachterstand van '+fmt(S.rent.debt),'bad');return false}
 if(S.rent&&S.rent.id!==id)S.rent=null;
 S.home=id;const moved=furnNormalize();if(window.vb){vb.view=null;vb.sel=null}
 const L=houseOf(id);SFX.big();toast('Je woont nu in '+(id==='brug'?'je hoek onder de brug':L.n.toLowerCase()+' ('+L.place+')')+(moved.length?'. '+moved.map(f=>f.n).join(' en ')+' '+(moved.length>1?'staan':'staat')+' in de opslag.':''),'lvl');return true}
Object.assign(act,{
 buyHouse(id,src){const L=houseOf(id);if(L.id!==id||id==='brug'||houseOwned(id))return;if(rankIdx(S.xp)<L.r){toast('Vanaf '+RANKS[L.r][0],'bad');return}
  if(src==='bank'){if(S.bank<L.p){toast('Niet genoeg op de bank','bad');return}S.bank-=L.p;typeof bkTx==='function'&&bkTx('pay',-L.p,'Woning: '+L.n)}
  else{if(wit()<L.p){toast(S.cash>=L.p?'Een woning koop je met wit geld. Was je zwarte geld eerst wit, of betaal van de bank.':'Niet genoeg wit geld','bad');return}spendWit(L.p)}
  const first=!(S.houseXp&&S.houseXp[id]);ownedS()[id]={b:L.p,t:now(),xp:1};S.houseXp=S.houseXp||{};S.houseXp[id]=1;
  if(S.rent&&S.rent.id===id&&!(S.rent.debt>0))S.rent=null;
  log('Gekocht: '+L.n+', '+L.place+' voor '+fmt(L.p)+(src==='bank'?' (van de bank)':''),'ok');if(first)addXp(Math.floor(L.p/1000));
  SFX.big();toast(L.n+' is van jou. '+(S.home===id?'':'Kies "Hier wonen" om te verhuizen.'),'lvl');save();render()},
 rentHouse(id){const L=houseOf(id);if(L.id!==id||id==='brug'||houseOwned(id))return;if(rankIdx(S.xp)<L.r){toast('Vanaf '+RANKS[L.r][0],'bad');return}
  if(S.rent&&S.rent.debt>0){toast('Betaal eerst je huurachterstand van '+fmt(S.rent.debt),'bad');return}
  if(S.rentOwed>0){toast('Je hebt nog een oude huurschuld van '+fmt(S.rentOwed)+'. Geen verhuurder neemt je zo aan.','bad');return}
  if(S.bank+wit()<L.rent){toast('Je hebt '+fmt(L.rent)+' nodig voor de eerste speldag huur (bank of wit geld)','bad');return}
  if(window.stay&&stay.kind){toast('Je bent nog bezig met rusten of de dokter','bad');return}
  rentTake(L.rent,'Huur '+L.n);if(!houseMove(id))return;S.rent={id,paid:dayStart(now()),debt:0,late:0};
  log('Gehuurd: '+L.n+', '+L.place+' voor '+fmt(L.rent)+' per speldag','ok');save();render()},
 moveHouse(id){if(!houseOwned(id)||S.home===id)return;if(houseMove(id)){log('Verhuisd naar '+houseOf(id).n,'ok');save();render()}},
 sellHouse(id){if(id==='brug'||!houseOwned(id))return;const L=houseOf(id),v=houseVal(id),get=houseSell(id),o=ownedS()[id];
  if(S.home===id){if(window.stay&&stay.kind){toast('Je bent nog bezig met rusten of de dokter','bad');return}}
  delete ownedS()[id];S.bank+=get;typeof bkTx==='function'&&bkTx('in',get,'Verkoop woning: '+L.n);
  if(S.home===id){S.home=bestOwned();furnNormalize()}
  const winst=get-o.b;log(`Verkocht: ${L.n} voor ${fmt(get)} (waarde ${fmt(v)}, −5% makelaar; ${winst>=0?'winst':'verlies'} ${fmt(Math.abs(winst))})`,winst>=0?'ok':'bad');
  SFX.chip();toast(L.n+' verkocht: '+fmt(get)+' staat op je bank','ok');save();render()},
 payRent(){const R=S.rent;if(!R||!(R.debt>0))return;const got=rentTake(R.debt,'Huurachterstand '+houseOf(R.id).n);if(!got){toast('Geen geld op de bank of wit op zak','bad');return}
  R.debt-=got;if(R.debt<=0){R.debt=0;R.late=0;toast('Achterstand betaald','ok')}else toast('Deels betaald, nog '+fmt(R.debt),'bad');save();render()}});
