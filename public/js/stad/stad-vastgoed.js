// Pixelstad: Notaris De Sleutel. Eén plek (en een app op je telefoon) voor al je vastgoed: je woningen en zaken op Oostland.
// Mijn bezit: route erheen, naar binnen, thuis maken, upgraden, een vestiging erbij, verkopen. Te koop: alles wat je nog niet hebt,
// met de gewone prijs uit het klikspel (act.buyHouse / act.rentHouse / act.bizBuy). Na het kopen zie je het gebouw verrijzen.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const NOT={skin:'#e9b98f',hair:'#d8d4cc',top:'#1f2430',tie:'#7a1f2a',glasses:1,bg:'#2b2418'};
const HI=['Goedendag. Alles op uw naam, en niemand die het hoeft te weten.','Welkom terug. Uw grond in Oostland ligt er netjes bij.','Tekenen kan hier. Vragen stellen doen we niet.','Ah, u weer. Wat mag het vandaag worden?'];
const hs=()=>typeof HOUSES!=='undefined'?HOUSES.filter(h=>h.id!=='brug'):[];
const L=id=>typeof houseOf==='function'?houseOf(id):{id,n:id};
const owned=id=>!!(S.owned&&S.owned[id]),rented=id=>!!(S.rent&&S.rent.id===id),isHome=id=>(S.home||'brug')===id;
const units=id=>typeof bizUnits==='function'?bizUnits(id):[];
const ri=()=>rankIdx(S.xp);
const HSPEC={kraak:['kraak',2],boot:['beach2',1],kamer:['brick3',3,'gable'],studio:['brick',3,'gable'],gracht:['plaster',4,'gable'],jordaan:['brick2',5,'gable'],penthouse:['glass',9],ijpent:['glass2',11],omval:['glass',13],villa:['villa',2],gooi:['villa',3]};
const BSPEC=M.BIZ_LOOK;
const pl=(kind,id)=>M.placeById(kind==='biz'?'biz_'+id:'plot_'+id);
const where=p=>p?(p.est?'Oostland · ':'')+M.districtAt(p.door.x,p.door.z):'';
const lot=(kind,id)=>G.lotOf&&G.lotOf(kind,id);
function thumbHouse(id){const s=HSPEC[id]||['brick',2],l=lot('house',id),have=owned(id)||rented(id);return K.thumb({fl:have?s[1]:0,st:s[0],roof:s[2],tall:/pent|omval/.test(id),wide:/villa|gooi|kraak/.test(id),pool:id==='villa'||id==='gooi',boat:id==='boot'&&have,building:l&&l.building,night:G.night>.6})}
function thumbBiz(b){const n=units(b.id).length,mx=n?Math.max(...units(b.id)):0,l=lot('biz',b.id),sp=BSPEC[b.id]||['shop',1,.5,0,3];return K.thumb({fl:n?Math.min(sp[4],Math.max(1,Math.round(sp[1]+sp[2]*mx+sp[3]*Math.floor((n-1)/3)))):0,st:sp[0],roof:sp[5]?'gable':null,biz:1,wide:/hal|garage|port|jet|dealer|transport|groothandel|parkeer/.test(b.id),tall:/vastgoed|kantoor|rederij/.test(b.id),sign:b.col,building:l&&l.building,night:G.night>.6})}
/* ---------- scherm ---------- */
const ui=document.createElement('div');ui.className='sd-board sd-vg';ui.id='sdVg';ui.hidden=true;document.body.appendChild(ui);
ui.innerHTML=`<div class="sd-bd"><div class="sd-vg-top"><canvas class="sd-vg-por" id="sdVgPor" width="24" height="24"></canvas><div class="sd-vg-who"><small>Notaris De Sleutel</small><b>Jouw vastgoed</b><p id="sdVgSay"></p></div>
  <div class="sd-vg-money"><span><i>Wit geld</i><b id="sdVgWit"></b></span><span><i>Bank</i><b id="sdVgBank"></b></span></div><button class="sd-x" data-close aria-label="Sluiten">×</button></div>
 <div class="sd-vg-sum" id="sdVgSum"></div><div class="sd-bd-tabs" id="sdVgTabs"></div><div class="sd-vg-list" id="sdVgList"></div></div>`;
let tab='mine',sub='huis',focus=null,sellAsk=null,sellT=0;
function chips(arr){return arr.filter(Boolean).map(([t,c])=>`<em class="${c||''}">${E(t)}</em>`).join('')}
function btn(label,data,o){o=o||{};return `<button class="btn ${o.ghost?'ghost ':''}sm${o.gold?' gold':''}" ${data} ${o.dis?'disabled':''} ${o.title?`title="${E(o.title)}"`:''}>${o.ic?`<i class="sd-ic">${o.ic}</i>`:''}${E(label)}</button>`}
function houseCard(h,forSale){const id=h.id,p=pl('house',id),l=lot('house',id),have=owned(id),rent=rented(id),home=isHome(id),lock=ri()<(h.r||0),price=typeof mktPrice==='function'?mktPrice(id):h.p;
  const st=l&&l.building?['Bouwt '+Math.max(0,Math.floor(l.shown))+'/'+l.w.fl,'b']:null;
  let acts='';
  if(!forSale){acts=btn('Route','data-route="h:'+id+'"',{ghost:1,ic:K.ic.route})+(home?btn('Naar binnen','data-in="h:'+id+'"',{ic:K.ic.door}):btn('Hier gaan wonen','data-home="'+id+'"',{ic:K.ic.home}))
    +(have?btn(sellAsk==='h:'+id?'Zeker? Verkoop':'Verkopen · '+fmt(typeof houseSell==='function'?houseSell(id):0),'data-sell="h:'+id+'"',{ghost:sellAsk!=='h:'+id,ic:K.ic.sell}):'')}
  else acts=lock?`<span class="sd-vg-l">Vanaf ${E(RANKS[h.r][0])}</span>`:btn('Kopen · '+fmt(price),'data-buy="'+id+'"',{dis:(typeof wit==='function'?wit():S.cash)<price,title:'Met wit geld',ic:K.ic.key})+btn('Van de bank','data-bank="'+id+'"',{ghost:1,dis:(S.bank||0)<price})+(h.rent?btn('Huren · '+fmt(h.rent)+'/dag','data-rent="'+id+'"',{ghost:1}):'');
  return `<article class="sd-vg-c${focus==='h:'+id?' focus':''}${lock&&forSale?' lock':''}" data-k="h:${id}"><span class="sd-vg-th" data-th="h:${id}"></span><div class="sd-vg-m"><b>${E(h.n)}</b><small>${E(where(p))}${h.d&&forSale?' · '+E(h.d):''}</small>
   <div class="sd-vg-ch">${chips([home&&['Thuis','g'],rent&&['Huur'],st,!forSale&&!st&&(have||rent)&&['Klaar','ok']])}</div></div><div class="sd-vg-a">${acts}</div></article>`}
function bizCard(b,forSale){const id=b.id,p=pl('biz',id),l=lot('biz',id),u=units(id),n=u.length,lock=ri()<(b.r||0),price=typeof bizPrice==='function'?bizPrice(b,n):b.p,inc=typeof bizIncome==='function'?bizIncome(id):0,can=typeof bzCanUp==='function'?bzCanUp(b):0,mx=n?Math.max(...u):0;
  const st=l&&l.building?['Bouwt '+Math.max(0,Math.floor(l.shown))+'/'+l.w.fl,'b']:null,wt=typeof wit==='function'?wit():S.cash,full=typeof bizMax==='function'&&n>=bizMax();
  let acts='';
  if(!forSale)acts=btn('Route','data-route="b:'+id+'"',{ghost:1,ic:K.ic.route})+btn('Beheer','data-in="b:'+id+'"',{ic:K.ic.door})+btn(can?'Upgrade ('+can+')':'Upgrade','data-up="'+id+'"',{ghost:!can,dis:!can,ic:K.ic.up,title:'Verbouwing met wit geld'})+(full?'':btn('Vestiging erbij · '+fmt(price),'data-bbuy="'+id+'"',{ghost:1,dis:wt<price||lock,ic:K.ic.build}));
  else acts=lock?`<span class="sd-vg-l">Vanaf ${E(RANKS[b.r][0])}</span>`:btn('Kopen · '+fmt(price),'data-bbuy="'+id+'"',{dis:wt<price,ic:K.ic.key,title:'Met wit geld'});
  return `<article class="sd-vg-c${focus==='b:'+id?' focus':''}${lock&&forSale?' lock':''}" data-k="b:${id}" style="--k:${b.col}"><span class="sd-vg-th" data-th="b:${id}"></span><div class="sd-vg-m"><b>${E(b.n)}</b><small>${E(where(p))}${forSale?' · '+E(b.d||''):''}</small>
   <div class="sd-vg-ch">${chips([n&&['×'+n+' · niveau '+mx],st,n&&[fmt(inc)+' per speldag','ok'],forSale&&!lock&&b.inc&&['± '+fmt(b.inc)+' per speldag']])}</div></div><div class="sd-vg-a">${acts}</div></article>`}
function render(){if(ui.hidden)return;const H=hs(),B=typeof BIZ!=='undefined'?BIZ:[];
  const mineH=H.filter(h=>owned(h.id)||rented(h.id)),mineB=B.filter(b=>units(b.id).length),saleH=H.filter(h=>!owned(h.id)&&!rented(h.id)),saleB=B.filter(b=>!units(b.id).length);
  const inc=typeof income==='function'?income():0,val=mineH.reduce((a,h)=>a+(owned(h.id)&&typeof houseSell==='function'?houseSell(h.id):0),0),vest=mineB.reduce((a,b)=>a+units(b.id).length,0);
  $s('sdVgWit').textContent=fmt(typeof wit==='function'?wit():S.cash);$s('sdVgBank').textContent=fmt(S.bank||0);
  $s('sdVgSum').innerHTML=`<span><i>Woningen</i><b>${mineH.length}</b></span><span><i>Zaken</i><b>${mineB.length}${vest>mineB.length?' · '+vest+' vest.':''}</b></span><span><i>Inkomen</i><b>${fmt(inc)}<small>/speldag</small></b></span><span><i>Waarde huizen</i><b>${fmt(val)}</b></span>`;
  const bouw=(G.lots||[]).filter(l=>l.building).length;
  $s('sdVgTabs').innerHTML=[['mine','Mijn bezit'],['koop','Te koop'],...(bouw?[['bouw','In aanbouw ('+bouw+')']]:[])].map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`).join('')+`<span class="sd-vg-sp"></span><button data-klik class="sd-vg-klik">Alle details ↗</button>`;
  let html='';
  if(tab==='mine'){html=(mineH.length?`<h4>Woningen</h4>${mineH.map(h=>houseCard(h,false)).join('')}`:'')+(mineB.length?`<h4>Zaken</h4>${mineB.map(b=>bizCard(b,false)).join('')}`:'');
    if(!html)html=`<div class="sd-vg-empty"><b>Nog niets op je naam</b><p>Oostland ligt klaar. Kies een woning of zaak en de bouwploeg begint meteen.</p>${btn('Bekijk wat te koop is','data-tab="koop"',{ic:K.ic.key})}</div>`;
    else html+=`<div class="sd-vg-hint">${K.ic.home}<span>Onder de brug in de stad kun je altijd gratis slapen.</span>${isHome('brug')?'':btn('Daar gaan wonen','data-home="brug"',{ghost:1})}</div>`}
  else if(tab==='koop'){html=`<div class="sd-vg-seg"><button data-sub="huis" class="${sub==='huis'?'on':''}">Woningen (${saleH.length})</button><button data-sub="zaak" class="${sub==='zaak'?'on':''}">Zaken (${saleB.length})</button></div>`
    +((sub==='huis'?saleH.sort((a,b)=>(a.r||0)-(b.r||0)).map(h=>houseCard(h,true)).join(''):saleB.sort((a,b)=>(a.r||0)-(b.r||0)).map(b=>bizCard(b,true)).join(''))||'<p class="sd-bd-none">Alles is al van jou.</p>')}
  else{const ls=(G.lots||[]).filter(l=>l.building);html=ls.map(l=>l.p.dyn==='biz'?bizCard(B.find(b=>b.id===l.p.biz),false):houseCard(H.find(h=>h.id===l.p.hid),false)).join('')+`<div class="sd-vg-hint">${K.ic.build}<span>De bouwploeg werkt door zolang jij in de buurt bent. Loop erheen om het te zien.</span></div>`}
  const list=$s('sdVgList');const top=list.scrollTop;list.innerHTML=html;list.scrollTop=top;
  list.querySelectorAll('[data-th]').forEach(s=>{const [k,id]=s.dataset.th.split(':');s.appendChild(k==='h'?thumbHouse(id):thumbBiz(B.find(b=>b.id===id)))});
  if(focus){const f=list.querySelector('.focus');if(f&&!render._scrolled){render._scrolled=1;f.scrollIntoView({block:'center'})}}}
/* ---------- openen en sluiten ---------- */
function open(o){o=o||{};focus=o.house?'h:'+o.house:o.biz?'b:'+o.biz:null;render._scrolled=0;sellAsk=null;
  if(focus){const k=focus.slice(2),mine=o.house?(owned(k)||rented(k)):units(k).length>0;tab=mine?'mine':'koop';sub=o.house?'huis':'zaak'}else if(o.tab)tab=o.tab;
  ui.hidden=false;G.pause();K.portrait(NOT,'blij',$s('sdVgPor'));render();
  const say=o.say||(focus&&tab==='koop'?'Deze kavel is nog vrij. Zal ik de papieren klaarleggen?':HI[Math.floor(Math.random()*HI.length)]);K.type($s('sdVgSay'),say,{blip:false});G.snd&&G.snd.fx('open');
  clearInterval(ui._t);ui._t=setInterval(()=>{if(ui.hidden)clearInterval(ui._t);else render()},1500)}
function close(){if(ui.hidden)return;ui.hidden=true;G.snd&&G.snd.fx('close');if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
G.vastgoed={open,close,isOpen:()=>!ui.hidden};
const placeOf=k=>{const [t,id]=k.split(':');return pl(t==='h'?'house':'biz',id)};
ui.addEventListener('click',e=>{const t=e.target.closest('button');if(e.target===ui||(t&&t.dataset.close!=null)){close();return}if(!t)return;
  G.snd&&G.snd.fx('click');
  if(t.dataset.tab){tab=t.dataset.tab;focus=null;render();return}
  if(t.dataset.sub){sub=t.dataset.sub;render();return}
  if(t.dataset.klik!=null){const p=M.placeById('biz');close();G.ui&&G.ui.enterDirect(p);return}
  if(t.dataset.route){const p=placeOf(t.dataset.route);close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.resume();G.goPlace(p);G.toast&&G.toast('Route naar '+p.name.replace(/^(Thuis: |Jouw )/,''),'info');return}
  if(t.dataset.in){const p=placeOf(t.dataset.in);close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.ui&&G.ui.enterDirect(p);return}
  if(t.dataset.home){act.moveHouse(t.dataset.home);G.lotSync&&G.lotSync();K.type($s('sdVgSay'),'Genoteerd. Uw post gaat voortaan naar het nieuwe adres.',{blip:false});render();return}
  if(t.dataset.up){act.bizUpAll(t.dataset.up);G.lotSync&&G.lotSync();G.snd&&G.snd.fx('build');render();return}
  if(t.dataset.bbuy){const id=t.dataset.bbuy,n0=units(id).length;act.bizBuy(id);if(units(id).length>n0){G.snd&&G.snd.fx('cash');G.lotSync&&G.lotSync();tab='mine';focus='b:'+id;render._scrolled=0;K.type($s('sdVgSay'),'Getekend. De bouwploeg is al onderweg naar Oostland.',{blip:false})}render();return}
  if(t.dataset.buy||t.dataset.bank){const id=t.dataset.buy||t.dataset.bank;act.buyHouse(id,t.dataset.bank?'bank':undefined);if(owned(id)){G.snd&&G.snd.fx('cash');G.lotSync&&G.lotSync();tab='mine';focus='h:'+id;render._scrolled=0;K.type($s('sdVgSay'),'Gefeliciteerd. De grond is van u, er wordt al gebouwd.',{blip:false})}render();return}
  if(t.dataset.rent){const id=t.dataset.rent;act.rentHouse(id);if(rented(id)){G.lotSync&&G.lotSync();tab='mine';focus='h:'+id;render._scrolled=0}render();return}
  if(t.dataset.sell){const k=t.dataset.sell;if(sellAsk!==k||performance.now()-sellT>4000){sellAsk=k;sellT=performance.now();render();return}sellAsk=null;act.sellHouse(k.slice(2));G.lotSync&&G.lotSync();G.snd&&G.snd.fx('money');render();return}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!ui.hidden){e.stopImmediatePropagation();close()}},true);
})();
