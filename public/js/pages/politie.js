// Tab: Politiebureau. Word je opgepakt met meer zwart geld op zak dan je ter plekke kunt verantwoorden, dan neemt de politie
// alles boven de grens in beslag: gewoon €10.000, VIP €15.000, High roller €30.000 houd je. Per arrestatie komt er een dossier.
// Binnen 24 uur kun je het geld terugeisen bij het bureau, maar alleen als je een zaak hebt die het kan verklaren (een zaak
// waar je door kunt witwassen; vastgoed telt niet). Per dossier één poging. De balie kiest hoe je het moet aantonen:
//  - Verhoor: een rechercheur stelt vragen over je zaak (welke zaak, waar, hoeveel vestigingen, wat ze verdienen) en over de
//    arrestatie (hoeveel geld, hoe laat). Je antwoorden moeten kloppen met wat je echt hebt. Elke vraag heeft een tijd.
//  - Bon aanleveren: je krijgt de echte kassabon van je zaak even te zien. Daarna stel je hem zelf weer samen uit losse
//    regels (met bijna-goede valse regels ertussen) en print je hem. De rechercheur legt hem naast het origineel.
// In beide gevallen moet minstens 80% kloppen. Gelukt: je krijgt het geld terug, wit (het is nu verantwoord), min 21%
// belasting, net als witwassen via je zaak. Mislukt of te laat: het geld is weg.
// Hoe groter het bedrag naast wat je zaken verdienen, hoe moeilijker (meer vragen, minder tijd, meer valse regels).
const SEIZE_KEEP=[10000,15000,30000],SEIZE_TTL=24*36e5,SEIZE_TAX=.21,SEIZE_PASS=.8;
const seizeKeep=()=>SEIZE_KEEP[typeof tier==='function'?tier():0]||SEIZE_KEEP[0];
const pbList=()=>Array.isArray(S.seized)?S.seized:(S.seized=[]);
const pbOpen=()=>pbList().filter(d=>d.st==='open'&&now()<d.t+SEIZE_TTL);
// verlopen dossiers afsluiten
function pbExpire(){let ch=false;pbList().forEach(d=>{if(d.st==='open'&&now()>=d.t+SEIZE_TTL){d.st='exp';ch=true;log('Dossier '+d.nr+' verlopen: '+fmt(d.a)+' is verbeurd verklaard','bad')}});return ch}
// bij een arrestatie (jailFor in state.js): alles boven de grens in beslag
function seizeZwart(why){const keep=seizeKeep(),z=zwart();if(z<=keep+.5)return 0;const a=Math.floor(z-keep),z0=S.zwart||0;
 S.cash-=a;S.zwart=Math.max(0,z0-a);
 const id=now(),nr='PV-'+String(id).slice(-6);pbList().unshift({id,nr,a,t:id,why:String(why||'Arrestatie').slice(0,60),st:'open',m:Math.random()<.5?'verhoor':'bon'});
 if(S.seized.length>14)S.seized.length=14;
 log(fmt(a)+' zwart geld in beslag genomen ('+nr+'). Terugeisen kan 24 uur bij het politiebureau','bad');
 setTimeout(()=>toast(fmt(a)+' zwart geld in beslag genomen. Je hield '+fmt(keep)+'. Terugeisen: Politiebureau','bad'),900);return a}
// hoe moeilijk: het bedrag naast wat je zaken per speldag verdienen
function pbDiff(d){const inc=Math.max(1,typeof income==='function'?income():0),r=d.a/inc;return r<.5?1:r<1.5?2:r<4?3:r<10?4:5}
const pbFronts=()=>typeof wwFronts==='function'?wwFronts():[];
const pbBack=d=>Math.floor(d.a*(1-SEIZE_TAX));

// ---------- pictogrammen ----------
const PBI={
 badge:'<path d="M12 2l2.4 2.2 3.2-.4.8 3.1 2.8 1.6-1 3 1 3-2.8 1.6-.8 3.1-3.2-.4L12 22l-2.4-2.2-3.2.4-.8-3.1L2.8 15.5l1-3-1-3 2.8-1.6.8-3.1 3.2.4z"/><path d="M12 7.5l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z"/>',
 folder:'<path d="M3 6.5A1.5 1.5 0 014.5 5H9l2 2.5h8.5A1.5 1.5 0 0121 9v9.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 18.5z"/><path d="M7 13h10M7 16.5h6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
 cash:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
 chat:'<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 receipt:'<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
 store:'<path d="M3 9l1.5-5h15L21 9"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/><path d="M5 11v9h14v-9M10 20v-5h4v5"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
const pbI=(k,c)=>`<svg class="pbi ${c||''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PBI[k]}</svg>`;

// ---------- het bureau in 3D (CSS): sleep om te draaien ----------
function pb3d(){const win=(n,cls)=>Array.from({length:n},(_,i)=>`<i class="${cls||''}${(i*7)%5===1?' lit':''}"></i>`).join('');
 return `<div class="pb3d" id="pb3d" aria-label="Het politiebureau in 3D, sleep om te draaien" role="img">
  <div class="pb-world" id="pbWorld">
   <div class="pb-ground"><i class="pb-park"></i><i class="pb-park b"></i><i class="pb-path"></i></div>
   <div class="pb-bld">
    <div class="pb-f front"><div class="pb-wins top">${win(8)}</div><div class="pb-sign"><span>POLITIE</span><i class="pb-stripe"></i></div>
     <div class="pb-entr"><i class="pb-lamp"></i><div class="pb-door"><i></i><i></i></div><b class="pb-nr">Bureau Centrum</b></div><div class="pb-wins low">${win(4)}</div></div>
    <div class="pb-f back"><div class="pb-wins top">${win(8)}</div><div class="pb-wins low">${win(8)}</div></div>
    <div class="pb-f left"><div class="pb-wins top">${win(4)}</div><div class="pb-wins low">${win(4,'bar')}</div></div>
    <div class="pb-f right"><div class="pb-wins top">${win(4)}</div><div class="pb-wins low">${win(4)}</div><i class="pb-garage"></i></div>
    <div class="pb-f roof"><i class="pb-hvac"></i><i class="pb-heli">H</i></div>
    <div class="pb-mast"><i class="pb-flag"></i></div>
    <div class="pb-beacon"><i></i></div>
   </div>
   <div class="pb-car">${pbCar()}</div>
   <div class="pb-post l"><i></i></div><div class="pb-post r"><i></i></div>
  </div></div>`}
// een blok in 3D (CSS): zes vlakken rond het midden; y0 = onderkant (negatief is boven de grond)
function pbBox(cls,w,d,h,y0,x,z){const T=(fw,fh,tr,top,left)=>`style="width:${fw}px;height:${fh}px;left:${left}px;top:${top}px;transform:${tr}"`;
 return `<div class="pbx ${cls}" style="transform:translate3d(${x||0}px,0,${z||0}px)">
  <i class="fz" ${T(w,h,`translateZ(${d/2}px)`,y0-h,-w/2)}></i><i class="bz" ${T(w,h,`rotateY(180deg) translateZ(${d/2}px)`,y0-h,-w/2)}></i>
  <i class="fx" ${T(d,h,`rotateY(90deg) translateZ(${w/2}px)`,y0-h,-d/2)}></i><i class="bx" ${T(d,h,`rotateY(-90deg) translateZ(${w/2}px)`,y0-h,-d/2)}></i>
  <i class="tp" ${T(w,d,`translateY(${y0-h}px) rotateX(90deg)`,-d/2,-w/2)}></i></div>`}
// politieauto: wit met een blauwe band en blauw-wit blokpatroon, blauwe lichtbalk, vier wielen
function pbCar(){const wheel=(x,z)=>`<div class="pbw" style="transform:translate3d(${x}px,-9px,${z}px)"><i></i></div>`;
 return pbBox('car-body',104,48,18,-8)+pbBox('car-cab',58,42,15,-26,-6)+pbBox('car-bar',30,20,4,-41,-6)
  +wheel(-34,25)+wheel(34,25)+wheel(-34,-25)+wheel(34,-25)}
// draaien met slepen (muis of vinger); vanzelf zachtjes heen en weer
let pbRot={y:-28,x:-16,drag:null,raf:0,t0:0};
function pb3dBind(){const el=document.getElementById('pb3d'),w=document.getElementById('pbWorld');if(!el||!w||el._b)return;el._b=1;
 const set=()=>{w.style.transform=`rotateX(${pbRot.x}deg) rotateY(${pbRot.y}deg)`};set();
 el.addEventListener('pointerdown',e=>{pbRot.drag={x:e.clientX,y:e.clientY,ry:pbRot.y,rx:pbRot.x};el.setPointerCapture(e.pointerId);el.classList.add('drag')});
 el.addEventListener('pointermove',e=>{const d=pbRot.drag;if(!d)return;pbRot.y=d.ry+(e.clientX-d.x)*.45;pbRot.x=Math.max(-38,Math.min(-4,d.rx-(e.clientY-d.y)*.25));set()});
 const up=()=>{pbRot.drag=null;el.classList.remove('drag')};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce)return;
 const loop=t=>{if(!document.body.contains(el))return;if(!pbRot.drag){pbRot.y+=Math.sin(t/2600)*.035}set();requestAnimationFrame(loop)};requestAnimationFrame(loop)}

// ---------- de pagina ----------
V.politie=()=>{if(pbExpire())save();const L=pbList(),open=pbOpen(),fr=pbFronts(),t=tier();
 const sum=(f)=>L.filter(f).reduce((a,d)=>a+d.a,0);
 const kpi=(ic,lab,val,sub,cls)=>`<div class="pb-kpi ${cls||''}">${pbI(ic)}<div><span class="label">${lab}</span><b>${val}</b>${sub?`<em>${sub}</em>`:''}</div></div>`;
 const tiers=['Gewoon','VIP','High roller'];
 const card=d=>{const left=d.t+SEIZE_TTL-now(),lo=d.st==='open'&&left>0,df=pbDiff(d),m=d.m==='bon';
  const st=d.st==='won'?`<span class="pb-st ok">${pbI('check')}Teruggekregen · ${fmt(d.back||pbBack(d))}</span>`:d.st==='lost'?`<span class="pb-st bad">${pbI('x')}Afgewezen · geld kwijt</span>`:d.st==='exp'||!lo?`<span class="pb-st bad">${pbI('clock')}Verlopen · verbeurd verklaard</span>`:`<span class="pb-st open">${pbI('clock')}Nog ${bkDur(left)}</span>`;
  return `<article class="pb-dos ${lo?'open':'shut'}">
   <div class="pb-dos-h"><span class="pb-nrb">${d.nr}</span><span class="pb-dt">${new Date(d.t).toLocaleString('nl-NL',{weekday:'short',hour:'2-digit',minute:'2-digit'})}</span>${st}</div>
   <div class="pb-dos-b"><div><span class="label">In beslag genomen</span><b class="pb-amt">${fmt(d.a)}</b><em>${esc(d.why)}</em></div>
    ${lo?`<div class="pb-how ${m?'bon':'vh'}">${pbI(m?'receipt':'chat')}<div><span class="label">De balie vraagt</span><b>${m?'Een kassabon van je zaak':'Een verhoor over je zaak'}</b><em>${m?'Uit je hoofd namaken en printen':'Vragen beantwoorden, op tijd'} · moeilijkheid ${'●'.repeat(df)}${'○'.repeat(5-df)}</em></div></div>`:''}</div>
   ${lo?`<div class="pb-dos-f"><span>Terug als het lukt: <b>${fmt(pbBack(d))}</b> wit <small>(−21% belasting)</small></span>
    <button class="btn ${fr.length?'':'ghost'}" onclick="act.pbStart(${d.id})" ${fr.length&&!inJail()?'':'disabled'}>${inJail()?'Eerst uit de cel':fr.length?(m?'Bon aanleveren':'Naar het verhoor'):'Je hebt een zaak nodig'}</button></div>`:''}</article>`};
 return `<section class="pb-hero">
  <div class="pb-sky" aria-hidden="true"><i class="pb-moon"></i>${Array.from({length:18},(_,i)=>`<i class="pb-star" style="left:${(i*53)%100}%;top:${(i*29)%46}%;animation-delay:${(i%6)*.4}s"></i>`).join('')}</div>
  ${pb3d()}
  <div class="pb-hero-t"><span class="label">${pbI('badge')} Bureau Centrum · 24 uur open</span><h1>Politiebureau</h1>
   <p>Opgepakt met meer zwart geld dan je kunt verantwoorden? Dan ligt het hier. Toon via je zaak aan dat het van jou is en je krijgt het terug.</p></div>
  <span class="pb-hint" aria-hidden="true">Sleep om te draaien</span></section>
 <div class="pb-kpis">${kpi('folder','Open dossiers',open.length,open.length?'nog terug te eisen':'niets openstaand',open.length?'warn':'')}
  ${kpi('lock','In beslag',fmt(open.reduce((a,d)=>a+d.a,0)),'open bedrag')}
  ${kpi('cash','Teruggekregen',fmt(L.filter(d=>d.st==='won').reduce((a,d)=>a+(d.back||0),0)),'na belasting','ok')}
  ${kpi('x','Kwijt',fmt(sum(d=>d.st==='lost'||d.st==='exp')),'afgewezen of verlopen','bad')}</div>
 <section class="pb-rules card"><h3>${pbI('badge')} Wat mag je bij je hebben?</h3>
  <p class="sub">Contant <b>zwart</b> geld boven de grens kun je ter plekke niet verantwoorden: dat neemt de politie mee. Wit geld en geld op de bank blijven van jou.</p>
  <div class="pb-tiers">${tiers.map((n,i)=>`<span class="${i===t?'on':''}"><i>${n}</i><b>${fmt(SEIZE_KEEP[i])}</b><em>houd je</em></span>`).join('')}</div>
  <ul class="pb-steps"><li>${pbI('folder')}<span><b>Dossier</b> Elke arrestatie met te veel zwart geld krijgt een dossier. Je hebt <b>24 uur</b>.</span></li>
   <li>${pbI('store')}<span><b>Je zaak</b> Je hebt een zaak nodig die het geld verklaart${fr.length?`: <b>${fr.map(b=>b.n).join(', ')}</b>`:`. <a href="#biz">Koop een zaak ›</a>`}</span></li>
   <li>${pbI('chat')}<span><b>Verhoor of bon</b> De balie kiest. Minstens <b>80%</b> moet kloppen, anders is het geld weg.</span></li>
   <li>${pbI('cash')}<span><b>Terug</b> Gelukt? Dan krijg je het wit terug, min 21% belasting.</span></li></ul></section>
 <div class="tierhead"><h2>Jouw dossiers</h2><span>${L.length?L.length+' in totaal':'nog geen'}</span></div>
 ${L.length?`<div class="pb-doss">${L.map(card).join('')}</div>`:`<div class="card empty pb-empty">${pbI('badge')}<b>Schoon blazoen</b><span>Er ligt niets van jou op het bureau. Word je opgepakt met meer dan ${fmt(seizeKeep())} zwart geld, dan zie je het hier.</span></div>`}`};

// ---------- minigames ----------
const pbRnd=a=>a[Math.floor(Math.random()*a.length)];
const pbShuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pbHm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const eur=v=>'€'+(+v).toLocaleString('nl-NL',{minimumFractionDigits:2,maximumFractionDigits:2});
// de rechercheur (SVG)
function pbCop(mood){const brow=mood==='mad'?'M84 46 L96 50M116 46 L104 50':mood==='ok'?'M84 47 Q90 44 96 47M104 47 Q110 44 116 47':'M84 47h12M104 47h12';
 const mouth=mood==='mad'?'M92 68 Q100 63 108 68':mood==='ok'?'M92 65 Q100 71 108 65':'M93 66h14';
 return `<svg class="pb-cop" viewBox="0 0 200 230" aria-hidden="true"><path d="M40 230 Q42 150 100 140 Q158 150 160 230z" fill="#e6e1d6"/><path d="M100 140 L88 230 L112 230z" fill="#1d2c4f"/><path d="M100 142 l-7 10 7 60 7-60z" fill="#7a1d2a"/>
  <path d="M40 230 Q42 160 70 148 L80 230z" fill="#2a2f38"/><path d="M160 230 Q158 160 130 148 L120 230z" fill="#2a2f38"/><rect x="87" y="110" width="26" height="34" rx="6" fill="#c99b7a"/>
  <g transform="translate(0 26)"><ellipse cx="100" cy="62" rx="30" ry="36" fill="#d4a585"/><path d="M70 52 Q72 22 100 22 Q128 22 130 52 Q122 34 100 36 Q78 34 70 52z" fill="#3a2a20"/>
  <circle cx="90" cy="55" r="3" fill="#1b1d22"/><circle cx="110" cy="55" r="3" fill="#1b1d22"/><path d="${brow}" stroke="#3a2a20" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M100 58 l-3 9h6" stroke="#b07f60" stroke-width="2" fill="none"/><path d="${mouth}" stroke="#7a3d32" stroke-width="3" stroke-linecap="round" fill="none"/></g>
  <rect x="122" y="176" width="34" height="12" rx="2" fill="#c9a227" transform="rotate(-8 139 182)"/></svg>`}
// overlay openen
function pbOv(cls,html){const ov=document.createElement('div');ov.className='pb-ov '+cls;ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.innerHTML=html;document.body.appendChild(ov);window.__chase=true;document.body.classList.add('ms-lock');return ov}
function pbClose(ov){ov.classList.add('out');setTimeout(()=>{ov.remove();window.__chase=false;document.body.classList.remove('ms-lock');render()},220)}
// uitslag verwerken
function pbDone(d,pct){const ok=pct>=SEIZE_PASS;d.st=ok?'won':'lost';d.pct=Math.round(pct*100);
 if(ok){const b=pbBack(d);d.back=b;spendWit(-b);addXp(10);S.cred+=2;log(`Dossier ${d.nr}: aangetoond (${d.pct}%). ${fmt(b)} wit terug na 21% belasting`,'ok');toast(`Akkoord! ${fmt(b)} terug, wit (na 21% belasting)`,'lvl');try{SFX.win(3)}catch(e){}}
 else{addHeat(5);log(`Dossier ${d.nr}: afgewezen (${d.pct}%). ${fmt(d.a)} is weg`,'bad');toast(`Afgewezen (${d.pct}%). ${fmt(d.a)} ben je kwijt.`,'bad');try{SFX.lose()}catch(e){}}
 save();pushState()}

// ===== Verhoor: vragen over je zaak en je arrestatie =====
function pbQuestions(d,diff){const fr=pbFronts(),b=pbRnd(fr),n=bizUnits(b.id).length,inc=Math.round((typeof income==='function'?income():0)/50)*50;
 const others=BIZ.filter(x=>!fr.includes(x)&&x.cat!=='vastgoed').map(x=>x.n).concat(['Bloemenstal','Fietsenmaker','Kapsalon']);
 const placesMine=BIZ_PLACES.slice(0,n),placesNot=BIZ_PLACES.slice(n).concat(['Eindhoven','Groningen','Maastricht','Leeuwarden']);
 const nums=v=>pbShuf([...new Set([v,Math.max(1,v-1),v+1,v+2,Math.max(1,v-2),v+3])].filter(x=>x!==v)).slice(0,3);
 const lvl=Math.max(...bizUnits(b.id));
 const Q=[
  {q:'Wat voor zaak heb je?',a:b.n,w:pbShuf(others).slice(0,3)},
  {q:`Waar zit je ${b.n.toLowerCase()}?`,a:pbRnd(placesMine),w:pbShuf(placesNot).slice(0,3),sub:'Eén vestiging is genoeg'},
  {q:`Hoeveel vestigingen van je ${b.n.toLowerCase()} heb je?`,a:String(n),w:nums(n).map(String)},
  {q:'Wat verdienen je zaken samen per speldag, ongeveer?',a:fmt(inc),w:[.35,2.4,6].map(k=>fmt(Math.round(inc*k/50)*50+50))},
  {q:'Hoeveel geld hadden we bij je gevonden?',a:fmt(d.a),w:[.62,1.45,2.1].map(k=>fmt(Math.round(d.a*k/100)*100))},
  {q:'Hoe laat ben je opgepakt?',a:pbHm(d.t),w:[47,-73,131].map(m=>pbHm(d.t+m*6e4))},
  {q:`Hoe ver is je beste ${b.n.toLowerCase()} uitgebouwd?`,a:BIZ_LVL[lvl-1],w:BIZ_LVL.filter((x,i)=>i!==lvl-1).slice(0,3)},
  {q:'Waarom had je zoveel contant geld op zak?',a:`De omzet van mijn ${b.n.toLowerCase()}, ik bracht het naar de bank`,w:['Gevonden, in een tas op straat','Van een vriend, ik weet niet waar hij het vandaan heeft','Daar zeg ik niets over zonder advocaat']}];
 const must=[0,7],rest=pbShuf([1,2,3,4,5,6]).slice(0,3+Math.floor(diff/2));
 return pbShuf(must.concat(rest)).map(i=>({...Q[i],opts:pbShuf([Q[i].a].concat(Q[i].w))}))}
function pbVerhoor(d){const diff=pbDiff(d),Qs=pbQuestions(d,diff),T=Math.max(6.5,14-diff*1.5);let i=0,good=0,raf=0,t0=0,lock=false;
 const ov=pbOv('vh',`<div class="pb-box"><div class="pb-room"><i class="pb-lampk"></i><i class="pb-mirror"></i>
   <span class="pb-bub" id="pbBub">Ga zitten.</span><div class="pb-who cop" id="pbCopW">${pbCop('')}</div>
   <div class="pb-who me">${typeof dollSvg==='function'?dollSvg(fitS().wear,{label:'Jij'}):''}</div><i class="pb-table"></i></div>
  <div class="pb-panel"><div class="pb-top"><span class="label">Verhoor · ${d.nr}</span><span class="pb-prog" id="pbProg"></span></div>
   <div class="pb-q" id="pbQ"></div><div class="pb-time"><i id="pbTime"></i></div><div class="pb-opts" id="pbOpts"></div>
   <div class="pb-foot"><span>Minstens 80% goed · ${Qs.length} vragen</span><span id="pbScore"></span></div></div></div>`);
 const q=id=>ov.querySelector('#'+id);
 const say=(txt,mood)=>{const b=q('pbBub');b.textContent=txt;b.style.animation='none';void b.offsetWidth;b.style.animation='';q('pbCopW').innerHTML=pbCop(mood)};
 const prog=()=>{q('pbProg').innerHTML=Qs.map((x,k)=>`<i class="${k<i?(x.ok?'ok':'no'):k===i?'now':''}"></i>`).join('')};
 function show(){if(i>=Qs.length)return end();lock=false;const Q=Qs[i];prog();say(Q.q,'');
  q('pbQ').innerHTML=`<b>${esc(Q.q)}</b>${Q.sub?`<small>${esc(Q.sub)}</small>`:''}`;
  q('pbOpts').innerHTML=Q.opts.map((o,k)=>`<button class="pb-opt" data-k="${k}"><kbd>${k+1}</kbd><span>${esc(o)}</span></button>`).join('');
  q('pbOpts').querySelectorAll('.pb-opt').forEach(b=>b.addEventListener('click',()=>pick(+b.dataset.k)));
  t0=performance.now();cancelAnimationFrame(raf);const tick=n=>{const f=Math.min(1,(n-t0)/(T*1000));q('pbTime').style.width=(100-f*100)+'%';q('pbTime').className=f>.7?'hot':'';if(f>=1){pick(-1);return}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)}
 function pick(k){if(lock)return;lock=true;cancelAnimationFrame(raf);const Q=Qs[i],ok=k>=0&&Q.opts[k]===Q.a;Q.ok=ok;if(ok)good++;
  q('pbOpts').querySelectorAll('.pb-opt').forEach((b,j)=>{b.disabled=true;if(Q.opts[j]===Q.a)b.classList.add('right');else if(j===k)b.classList.add('wrong')});
  say(k<0?'Te laat. Ik schrijf op: geen antwoord.':ok?pbRnd(['Hm. Dat klopt.','Goed.','Dat staat ook in het register.','Oké.']):pbRnd(['Weet je dat zeker?','Dat klopt niet met onze gegevens.','Interessant…','Ik noteer het.']),ok?'ok':'mad');
  try{ok?SFX.tick():SFX.lose()}catch(e){}q('pbScore').textContent=good+' goed';i++;setTimeout(show,1100)}
 function end(){prog();const pct=good/Qs.length,ok=pct>=SEIZE_PASS;say(ok?'Het klopt allemaal. Je krijgt het terug.':'Dit verhaal geloof ik niet. Het geld blijft hier.',ok?'ok':'mad');
  q('pbQ').innerHTML=`<b class="${ok?'up':'dn'}">${Math.round(pct*100)}% klopt</b><small>${ok?'Akkoord: '+fmt(pbBack(d))+' wit terug':'Afgewezen: het geld is weg'}</small>`;
  q('pbOpts').innerHTML=`<button class="btn" id="pbOk">${ok?'Geld ophalen':'Weglopen'}</button>`;q('pbTime').style.width='0';
  ov.querySelector('.pb-box').classList.add(ok?'won':'lost');pbDone(d,pct);q('pbOk').addEventListener('click',()=>{document.removeEventListener('keydown',key);pbClose(ov)})}
 const key=e=>{const n=+e.key;if(n>=1&&n<=4&&!lock){e.preventDefault();pick(n-1)}};document.addEventListener('keydown',key);
 ov._pb=()=>({i,good,Qs});setTimeout(show,700)}

// ===== Bon aanleveren: de echte bon even zien, dan namaken uit losse regels en printen =====
const PB_ITEMS={snack:[['Frikandel speciaal',3.2],['Patat met',3.9],['Kroket',2.9],['Kipcorn',3.4],['Cola 0,33',2.6],['Bamischijf',2.7]],
 wash:[['Wassen 8 kg',6.5],['Drogen 30 min',3],['Strijkservice',12.5],['Wasmiddel',1.5],['Dekbed reinigen',22]],
 shop:[['Simkaart prepaid',10],['Beltegoed',20],['Scherm vervangen',89],['Oplader USB-C',14.95],['Hoesje',12.5],['Geld overmaken',7.5]],
 barber:[['Fade',27.5],['Baard trimmen',15],['Knippen + baard',39.5],['Haarwax',12.95],['Wassen',7.5]],
 autogarage:[['APK keuring',49],['Banden (4×)',320],['Olie verversen',89],['Remblokken',145],['Uitlijnen',65]],
 shisha:[['Shisha appel-munt',22.5],['Muntthee',4.5],['Mocktail',8.5],['Shisha druif',22.5],['Red Bull',4]],
 club:[['Entree',15],['Fles wodka',245],['Gin-tonic',12.5],['Bier',5],['Champagne',190]]};
function pbBon(d,b){const it=PB_ITEMS[b.id]||[['Product',9.95],['Dienst',25],['Artikel',4.5],['Service',15]],place=pbRnd(BIZ_PLACES.slice(0,Math.max(1,bizUnits(b.id).length)));
 const streets=['Kerkstraat','Dorpsstraat','Stationsweg','Marktplein','Havenkade','Molenweg','Schoolstraat'];
 const nItems=3+Math.min(2,Math.floor(pbDiff(d)/2)),pick=pbShuf(it).slice(0,nItems).map(([n,p])=>{const q=1+Math.floor(Math.random()*3);return {n:(q>1?q+'× ':'')+n,p:+(p*q).toFixed(2)}});
 const tot=pick.reduce((a,x)=>a+x.p,0),btwK=b.cat==='horeca'?.09:.21,btw=tot-tot/(1+btwK),dt=new Date(d.t-36e5*(2+Math.random()*20));
 return {name:b.n+' '+place,addr:pbRnd(streets)+' '+(2+Math.floor(Math.random()*180)),kvk:String(1e7+Math.floor(Math.random()*9e7)),
  date:dt.toLocaleDateString('nl-NL'),time:pbHm(dt.getTime()),items:pick,tot,btw,btwK,b}}
// de regels van de bon: label en waarde; de speler zet de waardes terug
function pbSlots(B){const s=[{k:'name',l:'',v:B.name,head:1},{k:'addr',l:'',v:B.addr,sub:1},{k:'date',l:'Datum',v:B.date},{k:'time',l:'Tijd',v:B.time}];
 B.items.forEach((x,i)=>{s.push({k:'in'+i,l:'',v:x.n,item:1});s.push({k:'ip'+i,l:'',v:eur(x.p),price:1})});
 s.push({k:'tot',l:'Totaal',v:eur(B.tot),tot:1},{k:'btw',l:'Btw '+Math.round(B.btwK*100)+'%',v:eur(B.btw)},{k:'kvk',l:'KvK',v:B.kvk});return s}
function pbDecoys(B,diff){const D=[];const sh=(s,k)=>s.replace(/\d(?!.*\d)/,m=>String((+m+k)%10));
 D.push(B.name.replace(/\s\S+$/,' '+pbRnd(BIZ_PLACES.filter(p=>!B.name.endsWith(p)))));
 D.push(sh(B.addr,3));D.push(sh(B.time,2));D.push(B.date.replace(/^\d+/,m=>String(Math.max(1,(+m%27)+1))));
 B.items.forEach(x=>{D.push(eur(x.p+(Math.random()<.5?.5:-.3)))});D.push(eur(B.tot+1));D.push(eur(B.btw*1.1));D.push(sh(B.kvk,4));
 const it=PB_ITEMS[B.b.id]||[];pbShuf(it).filter(([n])=>!B.items.some(x=>x.n.endsWith(n))).slice(0,2).forEach(([n])=>D.push(n));
 return pbShuf(D).slice(0,Math.min(D.length,4+diff*2))}
function pbBonHtml(B,slots,fill,act,cls){return `<div class="pb-receipt ${cls||''}"><div class="pb-r-in">
  ${slots.map((s,i)=>{const v=fill?fill[i]:s.v,empty=fill&&v==null,lab=s.l?`<span class="pb-r-l">${s.l}</span>`:'';
   const cell=`<span class="pb-r-v ${empty?'empty':''} ${fill&&act===i?'act':''}" ${fill?`data-s="${i}"`:''}>${empty?'…':esc(v)}</span>`;
   if(s.head)return `<div class="pb-r-head">${cell}</div>`;if(s.sub)return `<div class="pb-r-sub">${cell}</div>${i===1?'<div class="pb-r-dash"></div>':''}`;
   if(s.item)return `<div class="pb-r-row it">${cell}`;if(s.price)return `${cell}</div>`;
   return `${s.tot?'<div class="pb-r-dash"></div>':''}<div class="pb-r-row ${s.tot?'tot':''}">${lab}${cell}</div>`}).join('')}
  <div class="pb-r-dash"></div><div class="pb-r-foot">Contant betaald · Bedankt en tot ziens!</div><div class="pb-r-bar" aria-hidden="true">${Array.from({length:34},(_,i)=>`<i style="width:${1+((i*7)%3)}px"></i>`).join('')}</div></div></div>`}
function pbBonGame(d){const diff=pbDiff(d),b=pbRnd(pbFronts()),B=pbBon(d,b),slots=pbSlots(B),study=Math.round(slots.length*1.1+(6-diff)*2),limit=Math.round(100-diff*8);
 const chips=pbShuf(slots.map((s,i)=>({v:s.v,real:i})).concat(pbDecoys(B,diff).map(v=>({v,real:-1})))).map((c,i)=>({...c,id:i,used:false}));
 const fill=slots.map(()=>null),fillC=slots.map(()=>null);let cur=0,phase='study',peek=diff<=2?2:1,t0=0,raf=0;
 const ov=pbOv('bon',`<div class="pb-box"><div class="pb-top"><span class="label">${pbI('receipt')} Bon aanleveren · ${d.nr}</span><span class="pb-phase" id="pbPh">Bekijk de bon</span></div>
  <div class="pb-bon-g"><div class="pb-desk" id="pbDesk"></div><div class="pb-side" id="pbSide"></div></div>
  <div class="pb-time"><i id="pbTime"></i></div><div class="pb-bar" id="pbBar"></div></div>`);
 const q=id=>ov.querySelector('#'+id);
 const timer=(sec,done)=>{t0=performance.now();cancelAnimationFrame(raf);const tick=n=>{const f=Math.min(1,(n-t0)/(sec*1000));q('pbTime').style.width=(100-f*100)+'%';q('pbTime').className=f>.75?'hot':'';const tl=document.getElementById('pbTl');if(tl)tl.textContent=Math.ceil(sec*(1-f))+' s';if(f>=1){done();return}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)};
 function studyView(){q('pbDesk').innerHTML=pbBonHtml(B,slots,null,null,'orig');
  q('pbSide').innerHTML=`<div class="pb-tip">${pbI('receipt')}<div><b>Onthoud deze bon</b><span>Over <b id="pbTl">${Math.ceil(study)} s</b> pakt de rechercheur hem weg. Daarna maak je hem zelf weer na uit losse regels, met valse regels ertussen. Minstens 80% moet kloppen.</span></div></div>`;
  q('pbBar').innerHTML=`<button class="btn" id="pbGo">Ik heb hem, begin</button>`;q('pbGo').onclick=build;timer(study,build)}
 function nextEmpty(from){for(let k=0;k<slots.length;k++){const j=(from+k)%slots.length;if(fill[j]==null)return j}return -1}
 function buildView(){q('pbPh').textContent='Maak de bon na';
  q('pbDesk').innerHTML=pbBonHtml(B,slots,fill,cur,'blank');
  q('pbDesk').querySelectorAll('[data-s]').forEach(el=>el.addEventListener('click',()=>{const s=+el.dataset.s;if(fill[s]!=null){chips[fillC[s]].used=false;fill[s]=null;fillC[s]=null}cur=s;try{SFX.card()}catch(e){}buildView()}));
  const lab=slots[cur]?(slots[cur].l||(slots[cur].head?'Naam van de zaak':slots[cur].sub?'Adres':slots[cur].item?'Omschrijving':slots[cur].price?'Bedrag':'')):'';
  q('pbSide').innerHTML=`<div class="pb-tip sm">${pbI('receipt')}<div><b>${cur>=0?'Kies voor: '+lab:'Alles ingevuld'}</b><span>Tik een regel om hem in het gemarkeerde vak te plakken. Tik een vak op de bon om het leeg te maken of te kiezen.</span></div></div>
   <div class="pb-chips">${chips.map(c=>`<button class="pb-chip ${c.used?'used':''}" data-c="${c.id}" ${c.used?'disabled':''}>${esc(c.v)}</button>`).join('')}</div>`;
  q('pbSide').querySelectorAll('.pb-chip').forEach(el=>el.addEventListener('click',()=>{if(cur<0)return;const c=chips[+el.dataset.c];if(c.used)return;c.used=true;fill[cur]=c.v;fillC[cur]=c.id;try{SFX.tick()}catch(e){}cur=nextEmpty(cur+1);buildView()}));
  const n=fill.filter(v=>v!=null).length;
  q('pbBar').innerHTML=`<span class="pb-cnt">${n}/${slots.length} ingevuld · <b id="pbTl"></b></span>${peek?`<button class="btn ghost sm" id="pbPeek">Origineel 3 s bekijken (${peek}×)</button>`:''}<button class="btn" id="pbPrint" ${n?'':'disabled'}>${pbI('receipt')} Printen</button>`;
  const pk=q('pbPeek');if(pk)pk.onclick=()=>{peek--;const desk=q('pbDesk');desk.innerHTML=pbBonHtml(B,slots,null,null,'orig peek');setTimeout(()=>{if(phase==='build')buildView()},3000)};
  q('pbPrint').onclick=print;
  // het gemarkeerde vak in beeld houden (op de telefoon scrolt de bon apart)
  const av=q('pbDesk').querySelector('.pb-r-v.act');if(av&&av.scrollIntoView)av.scrollIntoView({block:'nearest'})}
 function build(){if(phase!=='study')return;phase='build';cur=0;cancelAnimationFrame(raf);try{SFX.card()}catch(e){}buildView();timer(limit,print)}
 function print(){if(phase!=='build')return;phase='print';cancelAnimationFrame(raf);q('pbTime').style.width='0';q('pbPh').textContent='Printen…';
  const right=slots.map((s,i)=>fill[i]===s.v),pct=right.filter(Boolean).length/slots.length,ok=pct>=SEIZE_PASS;
  q('pbSide').innerHTML=`<div class="pb-printer"><i class="pb-pr-top"></i><div class="pb-pr-slot"></div><div class="pb-pr-paper" id="pbPaper">${pbBonHtml(B,slots,fill.map(v=>v==null?'':v),-1,'printed')}</div></div>`;
  q('pbDesk').innerHTML=pbBonHtml(B,slots,null,null,'orig cmp');q('pbBar').innerHTML=`<span class="pb-cnt">De rechercheur legt ze naast elkaar…</span><b class="pb-pct" id="pbPct">0%</b>`;
  try{SFX.chip()}catch(e){}
  setTimeout(()=>{const rows=q('pbPaper').querySelectorAll('.pb-r-v');let k=0,c=0;const step=()=>{if(k>=rows.length){fin();return}rows[k].classList.add(right[k]?'good':'bad');if(right[k])c++;q('pbPct').textContent=Math.round(c/slots.length*100)+'%';try{right[k]?SFX.tick():SFX.card()}catch(e){}k++;setTimeout(step,140)};step()},1500);
  function fin(){const st=document.createElement('div');st.className='pb-stamp '+(ok?'ok':'no');st.textContent=ok?'Akkoord':'Afgewezen';q('pbSide').appendChild(st);
   ov.querySelector('.pb-box').classList.add(ok?'won':'lost');q('pbPh').textContent=ok?'Goedgekeurd':'Afgewezen';pbDone(d,pct);
   q('pbBar').innerHTML=`<span class="pb-cnt"><b class="${ok?'up':'dn'}">${Math.round(pct*100)}% klopt</b> · ${ok?fmt(pbBack(d))+' wit terug':'het geld is weg'}</span><button class="btn" id="pbOk">${ok?'Geld ophalen':'Weglopen'}</button>`;
   q('pbOk').onclick=()=>pbClose(ov)}}
 ov._pb=()=>({phase,slots,fill,chips,cur});studyView()}

Object.assign(act,{
 pbStart(id){const d=pbList().find(x=>x.id===id);if(!d||d.st!=='open'||now()>=d.t+SEIZE_TTL||inJail()||window.__chase)return;
  if(!pbFronts().length){toast('Je hebt een zaak nodig die het geld kan verklaren','bad');return}
  // één poging: meteen vastleggen, zodat verversen tijdens het spel telt als mislukt
  d.st='busy';save();pushState();try{SFX.click()}catch(e){}
  d.m==='bon'?pbBonGame(d):pbVerhoor(d)}});
// na verversen: een dossier dat midden in een poging zat, is afgewezen
(function(){try{(S.seized||[]).forEach(d=>{if(d.st==='busy'){d.st='lost';d.pct=0;log('Dossier '+d.nr+': poging afgebroken. Het geld is weg','bad')}})}catch(e){}})();
