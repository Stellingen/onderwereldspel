// Seizoen 1 (nieuw) · hoofdstuk 11–15 en de epiloog: Zeventien, De overkant, De tas, Calzone, De val / Stil, en de teaser.
// Plus: de Marijke (Ray's boot) aan een steiger op Het Eiland, de loods op de Noordkade, het lokbericht, zwijgen en het schot.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH||!G.s1)return;
const S1=G.s1,PI=Math.PI,sin=Math.sin,cos=Math.cos;
let ST,C,B,K,L;
function reg(){ST=S1.ST;C=S1.C;B=S1.B;K=S1.K;L=S1.L;
const {F,fx,eur,meter,geld,plusF,A,W,W3,walk,P,naar,voor,tijd,Z,T_,cam,camNaar,rond,ots,verteller,titel,speel,keuze,sleep,hyp,pick,rr,clamp,
  doelNaar,fietsAf,zorgFiets,binnen,buiten,bericht,sein,mgTiming,mgHold,mgGesprek,mgOpen,levend,hoofdstuk,VOLG,PL,AD,pt,adr,outfit,dag,actIn,hoek,hoekWeg,zetBuitenSahara,studio,css}=S1;
const E=s=>K.E(s);

/* ---------- de Marijke: een wit jacht aan het eind van een steiger, met een tafel op de steiger ---------- */
const JX=1180,JZ=1008;let jacht=null;
function marijke(on){if(!on){if(jacht)jacht.visible=false;return}if(jacht){jacht.visible=true;return}const g=new TH.Group();
  g.add(K.model([[22,1.6,5.6,0,.4,0,'#f1efe9'],[22.2,.22,5.7,0,1.15,0,'#1f3a4a'],[14,1.4,4.6,-1.5,1.9,0,'#f1efe9'],[13,.5,4.62,-1.5,1.9,0,'#1a2430'],[8,1.1,3.8,-2.5,3.1,0,'#f1efe9'],[7,.36,3.82,-2.5,3.1,0,'#1a2430'],
    [.1,.9,5.4,10.2,1.6,0,'#c9cfd6'],[.12,3,.12,-2,4.7,0,'#c9cfd6'],[3.6,.5,.06,-4,.9,2.84,'#16161a']]));
  const naam=document.createElement('canvas');naam.width=128;naam.height=24;const c=naam.getContext('2d');c.fillStyle='#16161a';c.fillRect(0,0,128,24);c.fillStyle='#d6b25a';c.font='bold 16px serif';c.textAlign='center';c.fillText('MARIJKE',64,18);
  const tx=new TH.CanvasTexture(naam);const nm=new TH.Mesh(new TH.PlaneGeometry(3.4,.6),new TH.MeshBasicMaterial({map:tx}));nm.position.set(-4,.9,2.88);g.add(nm);
  [[-8,1.8],[-4,1.8],[0,1.8],[4,1.8],[8,1.8]].forEach(([x,y])=>{const l=new TH.PointLight('#ffd9a0',1.4,8,1.6);l.position.set(x,y+1.4,2.4);g.add(l);g.add(K.model([[.14,.14,.14,x,y+1.2,2.8,'#ffe2a8',1]]))});
  g.position.set(JX,0,JZ);
  // steiger van de kade naar de boot, tafel en stoelen aan het eind
  const st=K.model([[1.8,.14,30,0,.05,0,'#7a5a3a'],[.14,.8,.14,.85,-.3,-14,'#4a3a2a'],[.14,.8,.14,-.85,-.3,-14,'#4a3a2a'],[.14,.8,.14,.85,-.3,0,'#4a3a2a'],[.14,.8,.14,-.85,-.3,0,'#4a3a2a'],
    [4.6,.14,4,0,.05,-15.6,'#7a5a3a']]);st.position.set(JX,0,JZ+19);
  const tafel=K.model([[1.6,.08,1.0,0,.78,0,'#e8e4da'],[.1,.74,.1,0,.38,0,'#c9cfd6'],[.6,.04,.6,0,.02,0,'#c9cfd6']]);tafel.position.set(JX,0,JZ+5.2);
  const lamp=new TH.PointLight('#ffe2b0',2.2,9,1.5);lamp.position.set(JX,2.8,JZ+5.2);
  const wrap=new TH.Group();wrap.add(g,st,tafel,lamp);G.scene().add(wrap);jacht=wrap}
S1.marijke=marijke;
const RAY={tafel:{x:JX,z:JZ+5.2},ray:{x:JX,z:JZ+4.2},luca:{x:JX,z:JZ+6.3},nova:{x:JX+.6,z:JZ+33},begin:{x:JX,z:JZ+35}};S1.RAY=RAY;

/* ---------- de loods op de Noordkade: kale ruimte, één schommelende lamp ---------- */
let loodsG=null,loodsIv=0;
function loods(on){if(!on){if(loodsG){loodsG.parent&&loodsG.parent.remove(loodsG);loodsG=null}clearInterval(loodsIv);return null}
  const h=PL.havenloods(),c=walk(h.x+14,h.z+30,14),g=new TH.Group();
  g.add(K.model([[14,.1,10,0,.05,0,'#3a3d44'],[14,6,.2,0,3,-5,'#5a5d63'],[.2,6,10,-7,3,0,'#4a4d54'],[.2,6,10,7,3,0,'#4a4d54'],[14,.2,10,0,6.1,0,'#2a2c30'],
    [1.2,1,1.2,-4.5,.5,-3.6,'#7a5a3a'],[1.2,1,1.2,-3.1,.5,-3.8,'#6a4a2a'],[1.2,1,1.2,-4.0,1.5,-3.7,'#7a5a3a'],[1.2,1,1.2,4.6,.5,-3.6,'#6a4a2a'],[.6,.9,.6,0,.45,0,'#2a2c30']]));
  const lampG=new TH.Group();lampG.position.set(0,6,0);lampG.add(K.model([[.04,2.2,.04,0,-1.1,0,'#16161a'],[.5,.3,.5,0,-2.3,0,'#2a2c30'],[.3,.1,.3,0,-2.5,0,'#fff3c8',1]]));
  const pl=new TH.PointLight('#fff1c8',4,16,1.4);pl.position.set(0,-2.6,0);lampG.add(pl);g.add(lampG);
  g.position.set(c.x,0,c.z);G.scene().add(g);loodsG=g;let k=0;loodsIv=setInterval(()=>{k+=.06;lampG.rotation.z=sin(k)*.12;lampG.rotation.x=cos(k*.7)*.06},50);g.mid=c;return c}
S1.loods=loods;

/* ---------- telefoon: een bericht kiezen, typen, verzonden, antwoord ---------- */
S1.telefoonKeuze=function(o){css();return new Promise(res=>{const el=mgOpen(`<small>${E(o.kop||'Tweede telefoon')}</small><h4>${E(o.naar||'Rafiq')}</h4><div class="s1-chat" style="min-height:90px;display:flex;flex-direction:column;gap:6px;margin:6px 0 10px"></div><div class="s1-opt"></div>`,{kleur:'#34c759',mid:true});
  const chat=el.querySelector('.s1-chat'),opt=el.querySelector('.s1-opt');const bel=(t,mij)=>{const b=document.createElement('div');b.style.cssText='max-width:82%;padding:8px 11px;border-radius:14px;font:500 14px/1.35 system-ui;'+(mij?'align-self:flex-end;background:#2f7a4a;color:#fff':'align-self:flex-start;background:#2a2c36;color:#e8e4da');b.textContent=t;chat.appendChild(b);return b};
  (o.eerder||[]).forEach(x=>bel(x,false));
  opt.innerHTML=o.opties.map((x,j)=>`<button data-j="${j}">${E(x.t)}</button>`).join('');
  opt.querySelectorAll('[data-j]').forEach(b=>b.onclick=async()=>{const x=o.opties[+b.dataset.j];opt.innerHTML='';const m=bel('…',true);fx('tab');await sleep(1500);m.textContent=x.t;fx('notify');
    const st=document.createElement('small');st.textContent='Verzonden';st.style.cssText='align-self:flex-end;color:#8a8f98;letter-spacing:.08em';chat.appendChild(st);await sleep(900);
    const n=(o.twijfel?2:1);for(let i=0;i<n;i++){const d=bel('typt…',false);await sleep(1400);d.remove();await sleep(i<n-1?900:200)}
    const ant=typeof x.antwoord==='function'?x.antwoord():x.antwoord;if(ant){bel(ant,false);fx('notify');await sleep(2200)}el.remove();res(x.id)})})};

/* ---------- zwijgen: houd 'Zwijgen' vast tot de balk vol is, of noem Rafiq ---------- */
S1.zwijgen=function(o){css();return new Promise(res=>{const el=mgOpen(`<small>${E(o.kop||'Zwijgen')}</small><h4>${E(o.vraag)}</h4><div class="s1-bar"><u style="width:0"></u></div><p class="s1-st" style="min-height:20px;margin:0 0 8px;color:#ff9a8a"></p>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="s1-knop" data-z>Zwijgen <span style="opacity:.6">(houd E)</span></button><button class="s1-knop g" data-n>Rafiq noemen</button></div>`,{kleur:'#ff5a4a'});
  const u=el.querySelector('u'),st=el.querySelector('.s1-st');let v=0,houd=false,klaar=false,last=performance.now(),loslaat=0;
  const loop=()=>{if(klaar)return;const nu=performance.now(),dt=Math.min(.1,(nu-last)/1000);last=nu;if(houd){v+=dt/o.duur;st.textContent='';if(Math.random()<dt*2.5)fx('heart')}else if(v>0&&v<1){v=Math.max(0,v-dt*.6)}
    u.style.width=(clamp(v,0,1)*100)+'%';if(v>=1){klaar=true;weg();res('zwijg');return}requestAnimationFrame(loop)};requestAnimationFrame(loop);
  const zb=el.querySelector('[data-z]'),aan=e=>{e&&e.preventDefault();houd=true},uit=()=>{if(houd&&v<1){loslaat++;st.textContent='Luca: "Wacht…"'}houd=false};
  zb.addEventListener('pointerdown',aan);zb.addEventListener('pointerup',uit);zb.addEventListener('pointerleave',uit);
  el.querySelector('[data-n]').onclick=()=>{if(klaar)return;klaar=true;weg();res('noem')};
  const kd=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)houd=true}},ku=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.stopImmediatePropagation();uit()}};
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);const weg=()=>{removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);el.remove()}})};

/* ---------- het schot: houd E om de arm te heffen; zakt hij, dan begin je opnieuw. Daarna één knop. ---------- */
S1.heffen=function(o){css();return new Promise(res=>{const el=mgOpen(`<small>${E(o.kop||'')}</small><h4>${E(o.titel||'Houd E om je arm te heffen')}</h4><div class="s1-bar"><u style="width:0"></u></div><p class="s1-st" style="min-height:20px;margin:0 0 8px;color:#ff9a8a"></p><button class="s1-knop">Heffen <span style="opacity:.6">(houd E)</span></button>`,{kleur:'#c0261e'});
  const u=el.querySelector('u'),st=el.querySelector('.s1-st');let v=0,houd=false,klaar=false,last=performance.now(),zak=0;
  const loop=()=>{if(klaar)return;const nu=performance.now(),dt=Math.min(.1,(nu-last)/1000);last=nu;if(houd)v+=dt/(o.duur||3);else if(v>0){v=Math.max(0,v-dt*.8);if(v===0&&zak){zak=0;o.onZak&&o.onZak();st.textContent=o.zakTekst||''}}
    u.style.width=(clamp(v,0,1)*100)+'%';if(Math.random()<dt*(1+v*3))fx('heart');if(v>=1){klaar=true;weg();res(true);return}requestAnimationFrame(loop)};requestAnimationFrame(loop);
  const b=el.querySelector('.s1-knop'),aan=e=>{e&&e.preventDefault();houd=true;zak=1},uit=()=>{houd=false};b.addEventListener('pointerdown',aan);b.addEventListener('pointerup',uit);b.addEventListener('pointerleave',uit);
  const kd=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){houd=true;zak=1}}},ku=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.stopImmediatePropagation();houd=false}};
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);const weg=()=>{removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);el.remove()}})};
S1.eenKnop=function(tekst,kleur){css();return new Promise(res=>{const el=mgOpen(`<div style="display:flex;justify-content:center"><button class="s1-knop" style="background:${kleur||'#c0261e'};color:#fff;border-color:#6a1410;font-size:18px;padding:14px 34px">${E(tekst)}</button></div>`,{kleur:kleur||'#c0261e',mid:true});
  const go=()=>{removeEventListener('keydown',kd,true);el.remove();res(true)};el.querySelector('button').onclick=go;const kd=e=>{if(e.key==='e'||e.key==='E'||e.key==='Enter'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();go()}};addEventListener('keydown',kd,true)})};
// direct zwart, één droog schot
async function schotZwart(){const z=document.createElement('div');z.style.cssText='position:fixed;inset:0;background:#000;z-index:96';document.body.appendChild(z);try{G.cut&&G.cut.stop&&G.cut.stop()}catch(e){}
  await sleep(500);fx('schot');await sleep(2600);return z}
S1.schotZwart=schotZwart;

/* =================== HOOFDSTUK 11 · Zeventien =================== */
hoofdstuk({id:'s1_h11',na:'s1_h12',vrij:true,blokken:[
 async t=>{dag(16,7,30);outfit('thuis');await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));
  const taart=K.model([[.6,.3,.6,0,.15,0,'#f1e4c8'],[.62,.06,.62,0,.31,0,'#c0261e'],[.03,.14,.03,-.15,.4,-.1,'#7fd1ff'],[.03,.14,.03,.15,.4,.1,'#ffb0d0'],[.03,.14,.03,0,.4,.15,'#ffd35a'],[.03,.03,.03,0,.49,.15,'#ffcf5a',1]]);
  const tp=W('thuis',7.4,5.2);taart.position.set(tp[0],.78+1.0,tp[1]);taart.binnenId=1;G.scene().add(taart);
  const sq3=F('sq3_klaar'),uit=F('uithaal_gedaan'),ans=F('ans_zag')&&!F('ans_zwijgt');
  const r=await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 11','Zeventien',2.6),
   {actor:'marco',at:W('thuis',7.4,4.5),ry:0,anim:'sit',sitY:-.42},{actor:'elena',at:W('thuis',8.8,4.4),ry:-PI/2},{actor:'giulia',at:W('thuis',6.2,5.0),ry:PI/2},
   {actor:'luca',at:W('thuis',7.4,5.9),ry:PI,anim:'sit',sitY:-.42},actIn(['marco','elena','giulia','luca']),
   cam(...W3('thuis',10.6,2.3,7.6),...W3('thuis',7.4,1.1,5.0),{fov:46}),{fade:'in',t:.8},T_('Ze zingen. Marco het hardst en het valst.'),
   {anim:'marco',a:'give',naar:'luca'},Z('marco','Van mijn vader. Ik kreeg hem toen ik zeventien werd. Nu is hij van jou.'),T_('Een oud horloge. Het loopt nog.'),
   uit?T_('Hij heeft twee uur geslapen. Zijn handen ruiken nog naar de haven.'):null,
   ans?Z('elena','Ans zegt dat je vorige week een jongen hebt geslagen. Hier, op straat.'):null,
   ans?keuze('luca','',[{t:'"Hij begon."',id:'begon'},{t:'"Ans ziet niet zo goed meer."',id:'ans'}]):null]);
  if(ans){meter('band_elena',r==='ans'?-10:-5);if(r==='ans')await speel(t,[T_('Marco kijkt op van zijn bord.')])}
  await speel(t,[sq3?{anim:'giulia',a:'give'}:null,sq3?Z('giulia','Zeventien. Doe er iets goeds mee.'):T_('Giulia legt een kaart neer en gaat naar haar kamer.'),sq3?null:T_('Op de kaart staat één zin: "Je weet wat ik wil voor je verjaardag. G."'),{fade:'out',t:.5}]);
  ['marco','elena','giulia','luca'].forEach(k=>C.weg(k));taart.parent&&taart.parent.remove(taart);F('horloge',1)},
 async t=>{// 17:00: een doos aan de deur
  tijd(17,0);await binnen('thuis');
  await speel(t,[{speler:false},{snd:'deurbel'},{actor:'luca',at:W('thuis',2.8,8.4),ry:-PI/2,anim:'give'},{actor:'elena',at:W('thuis',5.4,9.2),ry:-PI/2},actIn(['luca','elena']),
   cam(...W3('thuis',9.6,2.5,8.3),...W3('thuis',3.4,2.0,8.6),{fov:48,strak:true}),{fade:'in',t:.4},T_('Een jongen op een scooter geeft een doos af. Op het kaartje: "22:00. Jij bent de gast. R."'),
   Z('elena','Van wie is dat?'),Z('luca','Van Giovanni. Voor mijn verjaardag.'),T_('Elena kijkt naar de doos. Ze zegt niks.'),{fade:'out',t:.3}]);C.weg('luca');C.weg('elena');
  const p=W('thuis',13.6,8.6);if(!await doelNaar(t,'Je kamer: de doos openmaken',{x:p[0],z:p[1],binnen:'thuis'},{actie:'Doos openen',sub:'Van R.'}))return;
  await speel(t,[{speler:false},{actor:'luca',at:W('thuis',13.6,9.2),ry:0},actIn(['luca']),cam(...W3('thuis',13.6,2.2,11.4),...W3('thuis',13.6,.9,8.6),{fov:40}),{fade:'in',t:.3},
   T_('Een zwart overhemd. Een gouden schakelketting. Witte sneakers, maat 43.'),{fn:()=>outfit('feest')},{wait:.8},{fade:'out',t:.3}]);C.weg('luca');F('ketting',1);await buiten()},
 async t=>{// het feest
  tijd(21,50);if(!await doelNaar(t,'Lounge Sahara · 22:00',PL.sahara(),{actie:'Naar binnen',sub:'Jouw feest',gebouw:'sahara'}))return;tijd(22,0);if(B.waar())await zetBuitenSahara();
  const d=PL.sahara(),l=walk(d.x-.4,d.z+3.4,3),mo={x:d.x+1.6,z:d.z+1.0};const bu=G.binnen.uitsmijterBuiten;if(bu&&bu.g)bu.g.visible=false;
  await speel(t,[{speler:false},{actor:'mo',at:[mo.x,mo.z],ry:naar(mo,l),anim:'lach'},{actor:'luca',at:[l.x,l.z],ry:naar(l,d)},cam(l.x+1,.6,l.z+4.4,d.x,2.4,d.z,{fov:44}),{fade:'in',t:.5},
   {move:'luca',to:[d.x-.4,d.z+1.6],t:2,wacht:false},Z('mo','De jarige. Vanavond loop jij voorop.',{mood:'blij'}),{fade:'out',t:.3}]);C.weg('mo');C.weg('luca');if(bu&&bu.g)bu.g.visible=true;
  await binnen('sahara');try{B.saharaFeest&&B.saharaFeest(true)}catch(e){}B.toon('sahara','uitsmijter',false);
  const vt=meter('vertrouwen')||0,sem=F('sq5_open')&&!F('uithaal_gedaan'),dx=F('dex_wil')==='erin';
  await speel(t,[{speler:false},{actor:'luca',at:W('sahara',13,32.6),ry:PI},{actor:'tarik',at:W('sahara',14.3,30.6),ry:PI*1.1,anim:'armen'},actIn(['luca','tarik']),
   cam(...W3('sahara',13,1.9,30.9),...W3('sahara',13,1.7,33.4),{fov:40}),{fade:'in',t:.4},T_('Luca trekt zijn ketting recht. Hier droeg hij ooit zes dozen langs.'),
   cam(...W3('sahara',11.2,2.1,33.8),...W3('sahara',13.6,1.4,31),{fov:44}),{snd:'open'},T_('Tarik opent de tweede deur voor hem. En knikt.'),
   {move:'luca',to:W('sahara',13,27.6),t:2.4,wacht:false},cam(...W3('sahara',13,1.8,29.6),...W3('sahara',13,1.6,18),{fov:56}),{snd:'lach'},
   {actor:'rafiq',at:W('sahara',21.4,15.2),ry:PI*1.25,anim:'juich',y:.24},actIn(['rafiq']),cam(...W3('sahara',17.8,.9,19.4),...W3('sahara',21.4,2.0,15.2),{fov:44}),
   Z('rafiq','Daar is hij. Zeventien. De jongen die zes pizza\'s naar binnen bracht.'),Z('rafiq','Vanavond betaal jij nergens voor.'),
   {weg:'tarik'},{actor:'luca',at:W('sahara',4.4,20.4),ry:-PI/2},{actor:'yasmina',at:W('sahara',4.4,21.8),ry:-PI/2+.5},actIn(['luca','yasmina']),
   cam(...W3('sahara',7.6,1.8,21.4),...W3('sahara',4.2,1.5,21.0),{fov:40}),Z('yasmina','Jij bent Luca? Iedereen heeft het over jou.'),Z('luca','Wat zeggen ze dan?'),
   Z('yasmina','Dat Rafiq naar jou luistert. Dans je?')]);
  await S1.inScene(t,[{actor:'luca',at:W('sahara',6.5,22),ry:0,anim:'dans'},{actor:'yasmina',at:W('sahara',7.6,22.6),ry:PI,anim:'dans2'},actIn(['luca','yasmina']),cam(...W3('sahara',4.0,2.0,25.0),...W3('sahara',7.0,1.4,22.2),{fov:46})],
   ()=>mgTiming({kop:'Dansen · jouw feest',titel:'Op de maat',uitleg:'Stap als het streepje in het groene vak staat. Yasmina lacht als je mist.',rondes:5,snel:1.35,vak:.2,knop:'Stap'}));
  const r=await speel(t,[{actor:'luca',at:W('sahara',6.5,22),ry:0,anim:'dans'},{actor:'yasmina',at:W('sahara',7.6,22.6),ry:PI,anim:'dans2'},{actor:'bilal',at:W('sahara',10.4,18.6),ry:-PI/2,anim:'leun'},actIn(['luca','yasmina','bilal']),
   cam(...W3('sahara',4.0,2.0,25.0),...W3('sahara',7.0,1.4,22.2),{fov:46}),{wait:1.4},T_('Twee meisjes bij de bar kijken naar hem. "Is dat die van Rafiq?"'),
   {anim:'luca',a:'idle'},Z('yasmina','Geef je me je nummer?'),keuze('luca','',[{t:'"Ja."',id:'ja'},{t:'"Straks. Rafiq wacht."',id:'straks'}])]);
  F('yasmina_nummer',r==='ja'?1:0);
  await speel(t,[{weg:'yasmina'},{weg:'bilal'},{actor:'rafiq',at:W('sahara',20.6,14.0),ry:0,anim:'sit',sitY:-.38,y:.24},{actor:'luca',at:W('sahara',22.2,14.0),ry:0,anim:'sit',sitY:-.38,y:.24},actIn(['rafiq','luca']),
   cam(...W3('sahara',21.4,1.5,19.6),...W3('sahara',21.4,1.4,14.0),{fov:34}),{wait:1.2},T_('Iedereen staat. Alleen zij twee zitten. Zelfde houding, zelfde hoogte.'),
   {anim:'rafiq',a:'drink'},Z('rafiq','Op Luca. Groter dan ik was op zijn leeftijd.'),Z('rafiq',vt>=70?'Mijn rechterhand.':'Van pizzajongen naar dit. In drie weken.'),{snd:'lach'},
   {fn:()=>{const o=document.createElement('div');o.id='s1Rec';o.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(300px,70vw);aspect-ratio:9/16;border:10px solid #111;border-radius:26px;z-index:70;pointer-events:none;box-shadow:0 0 0 2000px #0006';o.innerHTML='<div style="position:absolute;top:12px;left:12px;color:#fff;font:700 12px monospace"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#ff2a1a;margin-right:6px;animation:s1knip 1s steps(2,end) infinite"></span>REC</div>';document.body.appendChild(o)}},
   verteller('n25'),{fn:()=>{const o=document.getElementById('s1Rec');if(o)o.remove()}},
   {actor:'bilal',at:W('sahara',18.4,17.0),ry:PI*.8},actIn(['bilal']),cam(...W3('sahara',16.4,1.7,19.0),...W3('sahara',18.4,1.5,17.0),{fov:34}),T_('Bilal heft zijn glas niet. Hij verdwijnt de gang in.'),
   {move:'bilal',to:W('sahara',3.0,12.4),t:3.4,wacht:false},
   sem?Z('rafiq','Sem deed de container met Bilal. Volgende keer jij.'):null,dx?{actor:'dex',at:W('sahara',8,22),ry:PI/2,anim:'dans'}:null,dx?actIn(['dex']):null,dx?Z('dex','Kijk ons. Kijk ons nou.'):null,{fade:'out',t:.6}]);
  ['rafiq','luca','bilal','dex'].forEach(k=>C.weg(k));try{B.saharaFeest&&B.saharaFeest(false)}catch(e){}B.toon('sahara','uitsmijter',true);
  await zetBuitenSahara();tijd(1,30);const l2=P();
  await speel(t,[{speler:false},{actor:'luca',at:[l2.x,l2.z],ry:0},rond(l2,PI,4,1.5,1.4),{fade:'in',t:.6},T_('Luca, alleen onder de luifel. De ketting glimt.'),
   {fn:()=>{bericht('Mama','Er is nog taart. Slaap je bij Dex?',{kleur:'#34c759'});if(!dx)setTimeout(()=>bericht('Dex',F('dex_weet')?'Zag je feest op insta. Mooi, broer.':'Zag je feest op insta. Wist niet dat je Rafiq zo goed kende.',{kleur:'#ff5a4a'}),3500)}},
   {wait:dx?3:6.5},T_('Hij typt niks terug.'),{fade:'out',t:.8}]);C.weg('luca');meter('naam',5)},
 async t=>{await studio(t,1,['n26'],[{snd:'click'}]);await zetBuitenSahara();await speel(t,[titel('Vrijdag','Week drie',2.2)])}]});
VOLG.s1_h12={tekst:'Verder: Bella Napoli, vrijdagavond (Hoofdstuk 12)',p:()=>PL.napoli(),sub:'Vrijdag · De overkant',actie:'Naar binnen'};

/* =================== HOOFDSTUK 12 · De overkant =================== */
async function opDeBrug(t,cb){for(let i=0;i<6000&&levend(t);i++){await sleep(200);const x=G.P.x,z=G.P.z;if(Math.abs(x-1080)<10&&z>988&&z<1050&&!C.active()){await cb();return true}}return false}
hoofdstuk({id:'s1_h12',na:'s1_h13',vrij:true,outfit:'bezorger',blokken:[
 async t=>{dag(19,21,0);outfit('bezorger');await binnen('napoli');B.toon('napoli','giovanni',false);
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 12','De overkant',2.6),{actor:'giovanni',at:W('napoli',...S1.NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',...S1.NAP.luca),ry:PI},actIn(['giovanni','luca']),
   cam(...W3('napoli',8.2,2.0,9.6),...W3('napoli',8,1.2,7.2),{fov:34}),{fade:'in',t:.6},T_('Giovanni vouwt zelf een calzone dicht. Met meer zorg dan normaal.'),
   cam(...W3('napoli',4.4,2.2,10.8),...W3('napoli',7.8,1.4,7.6),{fov:44}),
   Z('giovanni','Deze breng je zelf. Jachthaven, op Het Eiland. Aan het eind van de steiger. De boot heet Marijke.'),
   Z('giovanni','Meneer Ray. Hij bestelt al dertig jaar bij mij. Hij woont op een boot.'),T_('Een boot. "Kroon is van de boot."'),
   Z('giovanni','Wees beleefd. Hij geeft goed fooi. En hij onthoudt alles.'),{fade:'out',t:.4}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli());try{G.fiets.last(1)}catch(e){}marijke(true)},
 async t=>{marijke(true);opDeBrug(t,async()=>{await verteller('n27').fn()});
  if(!await doelNaar(t,'Jachthaven Het Eiland · de Marijke',RAY.begin,{actie:'Afstappen',sub:'De steiger'}))return;try{G.fiets.last(0)}catch(e){}tijd(21,40);
  const b=RAY.begin,nv=RAY.nova;
  await speel(t,[{speler:false},{actor:'nova',at:[nv.x,nv.z],ry:naar(nv,b),anim:'armen'},{actor:'luca',at:[b.x,b.z],ry:PI},cam(JX+16,7,JZ+44,JX,1.5,JZ+6,{fov:42}),{fade:'in',t:.6},{snd:'gull'},
   T_('Masten. Lichtjes op het water. Aan het eind van de steiger: een wit jacht, MARIJKE.'),rond(nv,naar(nv,b)+1,3.4,1.7,1.5),
   Z('nova','Bella Napoli. Telefoon. Niemand filmt hier.'),{anim:'luca',a:'give',prop:'telefoon',naar:'nova'},T_('Luca geeft er één. De tweede zit in zijn sok.')]);
  const g=await S1.inScene(t,[rond(nv,naar(nv,b)+1,2.8,1.7,1.5)],()=>mgTiming({kop:'Rustig blijven',titel:'Nova kijkt je aan',uitleg:'Druk op de piek van je hartslag. Twee van de drie.',rondes:3,snel:1.15,vak:.19,knop:'Ademen'}))||0;
  if(g<2){F('twee_tel_gezien',1);await speel(t,[T_('Nova bukt. Ze trekt de tweede telefoon uit zijn sok.'),Z('nova','Twee. Ik tel altijd.')])}else await speel(t,[Z('nova','Hij zit achter. Aan tafel.')]);
  await speel(t,[{fade:'out',t:.3}]);C.weg('nova');C.weg('luca')},
 async t=>{// Ray aan tafel op de steiger
  marijke(true);const R=RAY;
  const r=await speel(t,[{speler:false},{actor:'ray',at:[R.ray.x,R.ray.z],ry:0,anim:'sit',sitY:-.36},{actor:'luca',at:[R.luca.x,R.luca.z+1.4],ry:PI,dozen:1},
   cam(JX-6,2.6,JZ+9,JX,1.3,JZ+5,{fov:40}),{fade:'in',t:.6},{move:'luca',to:[R.luca.x+.3,R.luca.z+.4],t:1.2},{anim:'luca',a:'give',dozen:0},
   Z('ray','Calzone. Giovanni weet het nog.'),Z('ray','Ga even zitten. Ik eet niet graag alleen. En je werd dinsdag zeventien, hoor ik.'),
   {actor:'luca',at:[R.luca.x,R.luca.z],ry:PI,anim:'sit',sitY:-.4},ots(R.luca,R.ray,2.2,.8,1.9),
   F('twee_tel_gezien')?Z('ray','Eén telefoon voor je moeder. En die andere?'):null,F('twee_tel_gezien')?T_('Luca zegt niks. Ray glimlacht.'):null,
   Z('ray','Tramlaan. Derde galerij, toch?'),Z('luca','Hoe weet u dat?'),Z('ray','Ik woonde er ook. Eén hoger. Doet die lift het nog steeds niet?'),
   cam(JX+2.4,1.5,JZ+6.6,JX,1.3,JZ+5.2,{fov:32}),{anim:'ray',a:'point',naar:'luca'},Z('ray','Die jas. Daar heb ik twee winters in gefietst.'),{snd:'heart'},T_('Luca zegt niks.'),
   {anim:'ray',a:'give',naar:'luca'},ots(R.ray,R.luca,2.2,.8,1.9),Z('ray','Mijn vrienden aan deze kant eten ineens veel pizza. Weet jij daar iets van?')]);
  const k=await S1.inScene(t,[ots(R.ray,R.luca,2.2,.8,1.9)],()=>mgGesprek({kop:'Big Ray',wie:'ray',kleur:'#e8e4da',meters:{},beurten:[{vraag:'"Weet jij daar iets van?"',tijd:5,geenAntwoord:{t:'(zwijgen)',id:'stil',eff:{},reactie:'Stil. Ook een antwoord.'},
    opties:[{t:'"Pizza is lekker, meneer."',id:'grap',eff:{},reactie:'Giovanni leert ze goed.'},{t:'"Ik bezorg alleen voor Giovanni."',id:'netjes',eff:{},reactie:'Natuurlijk.'},{t:'(zwijgen)',id:'stil',eff:{},reactie:'Stil. Ook een antwoord.'}]}]}))||{gekozen:['stil']};
  F('ray_indruk',k.gekozen[0]||'stil');
  await speel(t,[{anim:'ray',a:'give',prop:'geld'},{snd:'cash'},T_('Ray legt een briefje van vijftig op de lege doos.'),Z('ray','Doe Giovanni de groeten. En Luca? Rij voorzichtig.'),
   cam(JX-14,4,JZ+30,JX,1.5,JZ+5,{fov:38}),verteller('n28'),{fade:'out',t:.5}]);C.weg('ray');C.weg('luca');geld(50,'fooi van Ray');meter('ray',5);
  const b=RAY.begin;G.P.x=b.x;G.P.z=b.z;zorgFiets(b)},
 async t=>{// de terugweg: op De Harp gaat de tweede telefoon
  ST.doel('Terug naar de stad, over De Harp',PL.brugNoord());const ok=await opDeBrug(t,async()=>{});if(!ok||!levend(t))return;ST.doel(null);fietsAf();const l=P();
  const r=await speel(t,[{speler:false},{snd:'phoneRing'},{actor:'luca',at:[l.x,l.z],ry:l.ry,anim:'bel',prop:'telefoon'},rond(l,l.ry+PI*.8,4.4,2.4,1.6),{fade:'in',t:.3},
   T_('De tweede telefoon. Rafiq.'),Z('rafiq','Je was op de boot. Bij Ray.'),keuze('luca','',[{t:'"Ja. Hij bestelde een calzone."',id:'waar'},{t:'"Nee. Ik was bij een klant."',id:'gelogen'}])]);
  F('brug_antwoord',r);if(r==='waar'){meter('vertrouwen',10);await speel(t,[Z('rafiq','Wat zei hij?'),Z('luca','Dat zijn vrienden ineens veel pizza eten.'),Z('rafiq','…Morgen kom je langs. Zeg niks tegen niemand.')])}
  else{meter('vertrouwen',-10);await speel(t,[Z('rafiq','Oké.'),Z('rafiq','Ik heb overal ogen, Luca. Ook op het water.')])}
  await speel(t,[{anim:'luca',a:'idle',prop:null},{fade:'out',t:.5},titel('Zaterdag','',2)]);C.weg('luca');marijke(false);zorgFiets()}]});
VOLG.s1_h13={tekst:'Verder: Lounge Sahara, zaterdagmiddag (Hoofdstuk 13)',p:()=>PL.sahara(),sub:'Zaterdag · De tas',actie:'Naar binnen'};

/* =================== HOOFDSTUK 13 · De tas =================== */
// Een nacht: vier verstopplekken thuis, vier momenten waarop iemand er precies daar bij moet.
S1.eenNacht=function(t){return new Promise(async res=>{const PLEK={bed:{n:'Onder je bed',p:[14.2,11.6]},giulia:{n:'Onder Giulia\'s bed',p:[6.6,12.4]},kast:{n:'Meterkast in de gang',p:[1.4,7.4]},keuken:{n:'Keukenkastje',p:[13.4,1.6]}};
  const MOM=[{t:19*60,plek:'bed',wie:'elena',tekst:'Elena komt met de stofzuiger: "Je kamer is een zwijnenstal."',smoes:'"Ik doe het zelf, mam!"',band:'band_elena'},
   {t:20*60+30,plek:'kast',wie:'marco',tekst:'Marco zoekt een zekering: "Het licht in de badkamer is weer uit."',smoes:'"Ik heb het al gedaan, pap!"',band:'band_marco',verm:1},
   {t:22*60,plek:'keuken',wie:'elena',tekst:'Elena zoekt de grote pan: "Morgen komt tante Rosa."',smoes:'"Die staat in de kelderbox!"',band:'band_elena'},
   {t:23*60+30,plek:'giulia',wie:'giulia',tekst:'Giulia komt thuis. Dienst geruild. Ze loopt naar haar kamer.',smoes:'"Giulia! Kun je even helpen?"',band:'band_giulia'}];
  let waar='bed',inHand=false,van=18*60,tot=24*60,duur=170*(S1.testSnel||1),t0=performance.now(),mi=0,gewaarsch=-1;
  const hud=document.createElement('div');hud.className='s1-hud2';hud.innerHTML='<div class="k"></div><div class="w"></div><div class="m" style="max-width:270px;color:#ffd35a"></div>';document.body.appendChild(hud);
  const nu=()=>van+Math.min(1,(performance.now()-t0)/1000/duur)*(tot-van);
  const teken=()=>{const m=Math.floor(nu());hud.querySelector('.k').textContent='Een nacht · '+String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');hud.querySelector('.w').textContent='De tas: '+(inHand?'in je handen':PLEK[waar].n)};
  const spots=Object.keys(PLEK).map(k=>{const p=W('thuis',...PLEK[k].p);return G.spot({story:1,k:'nacht_'+k,x:p[0],z:p[1],r:1.9,prio:4,n:PLEK[k].n,sub:'',col:'#ffd35a',h:1.2,
    show:function(){if(B.waar()!=='thuis'||C.active())return false;this.sub=inHand?'Tas hier verstoppen':(waar===k?'Tas pakken':'');return inHand||waar===k},
    act:async()=>{if(!inHand&&waar===k){inHand=true;fx('grab');teken();return}if(inHand){const r=await mgHold({kop:'Verstoppen',titel:PLEK[k].n,stappen:1,duur:1});if(r&&r.ok){waar=k;inHand=false;fx('click');teken()}}}})});
  try{F('s1_huis_stil',1)}catch(e){}
  while(levend(t)){await sleep(300);teken();const m=nu();try{tijd(Math.floor(m/60)%24,Math.floor(m%60))}catch(e){}
    const mo=MOM[mi];if(!mo){if(m>=tot)break;continue}
    if(m>=mo.t-25&&gewaarsch!==mi){gewaarsch=mi;hud.querySelector('.m').textContent='Pas op: '+mo.tekst.split(':')[0]+' → '+PLEK[mo.plek].n;fx('heart');sein(mo.tekst.split(':')[0]+'… ('+PLEK[mo.plek].n+')','#ffd35a')}
    if(m>=mo.t){mi++;hud.querySelector('.m').textContent='';const fout=(waar===mo.plek&&!inHand)||(inHand&&false);
      await speel(t,[{speler:false},T_(mo.tekst),fout?Z('luca',mo.smoes):null,fout?T_('De tas blijft liggen. Maar ze kijkt je raar aan.'):T_('Niks.')],{blijf:true});
      try{C.weg('luca')}catch(e){}if(fout){meter(mo.band,-10);if(mo.verm)plusF('marco_vermoeden')}else meter('vertrouwen',2)}}
  spots.forEach(s=>G.unspot(s));hud.remove();try{F('s1_huis_stil',null)}catch(e){}F('tas_plek',waar);res(waar)})};

hoofdstuk({id:'s1_h13',na:'s1_h14',vrij:true,blokken:[
 async t=>{dag(20,14,0);outfit('casual');await binnen('sahara');const bw=F('brug_antwoord')==='waar',vt=meter('vertrouwen')||0;
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 13','De tas',2.6),{actor:'rafiq',at:W('sahara',13.6,31.0),ry:0},{actor:'luca',at:W('sahara',12.2,29.4),ry:PI*.9},{actor:'bilal',at:W('sahara',10.6,29.0),ry:PI*.6,prop:'tas'},actIn(['rafiq','luca','bilal']),
   cam(...W3('sahara',10.2,2.0,26.8),...W3('sahara',13.4,1.6,31.0),{fov:40}),{fade:'in',t:.5},T_('Rafiq bij het raam. Het gordijn een paar centimeter open.'),
   Z('rafiq','Een grijze Skoda. Staat er al twee dagen. Politie of de boot, maakt niet uit.'),bw?Z('rafiq','Ray vraagt naar pizza. Dus ik ruim op.'):null,
   {anim:'bilal',a:'give',naar:'luca'},T_('Bilal zet een sporttas voor Luca\'s voeten.'),Z('rafiq','Tot maandag. Bij jou. Niemand zoekt in een flat aan de Tramlaan.'),
   Z('rafiq',vt>=70?'Jij bent familie. Dit vraag ik aan familie.':'Niet openmaken. Niet verliezen.'),{fade:'out',t:.4}]);['rafiq','luca','bilal'].forEach(k=>C.weg(k));await zetBuitenSahara();
  if(!await doelNaar(t,'Naar huis met de tas',PL.thuis(),{actie:'Naar binnen',sub:'Thuis',gebouw:'thuis'}))return;outfit('thuis');tijd(18,0)},
 async t=>{await binnen('thuis');S1.huisZet();
  await speel(t,[{speler:false},{actor:'luca',at:W('thuis',14.2,9.8),ry:PI},actIn(['luca']),cam(...W3('thuis',16.0,2.2,12.0),...W3('thuis',14.2,.8,10.6),{fov:42}),{fade:'in',t:.4},
   T_('De tas ligt onder zijn bed. Niemand mag hem vinden.'),verteller('n29'),{fade:'out',t:.3}]);C.weg('luca');
  sein('Een nacht: verplaats de tas vóór iemand er precies daar bij moet (E bij de plekken)','#ffd35a');const w=await S1.eenNacht(t);if(!levend(t))return;
  await speel(t,[titel('Zondag','15:00',2.2)])},
 async t=>{// zondagsdienst, de inval
  dag(21,15,0);outfit('bezorger');await buiten();zorgFiets(PL.napoli());const a=S1.adres('Boulevard','winkel',1,PL.sahara())||{x:PL.sahara().x+30,z:PL.sahara().z,adres:'Boulevard'};
  sein('Zondagsdienst: één bestelling aan de Boulevard','#3fe395');
  const d=PL.sahara();ST.doel('Bezorgen · '+(a.adres||'Boulevard'),a);let ok=false;for(let i=0;i<5000&&levend(t);i++){await sleep(200);if((hyp(G.P.x-d.x,G.P.z-d.z)<60||hyp(G.P.x-a.x,G.P.z-a.z)<30)&&!C.active()&&!B.waar()){ok=true;break}}if(!ok||!levend(t))return;
  ST.doel(null);fietsAf();const l=P(),bus1=S1.politieAuto({busje:true}),bus2=S1.politieAuto({busje:true});const p1=walk(d.x-6,d.z+6,6),p2=walk(d.x+8,d.z+6,6);
  bus1.position.set(p1.x,0,p1.z);bus1.rotation.y=PI/2;bus2.position.set(p2.x,0,p2.z);bus2.rotation.y=-PI/2;G.scene().add(bus1,bus2);
  const lint=K.model([[16,.12,.04,0,1.1,0,'#c0261e'],[.08,1.2,.08,-8,.6,0,'#c9cfd6'],[.08,1.2,.08,8,.6,0,'#c9cfd6']]);lint.position.set(d.x,0,d.z+4);G.scene().add(lint);
  const hp=walk(d.x+10,d.z+26,8),dz=F('controle')!=='gepraat';
  await speel(t,[{speler:false},{actor:'agent',at:[d.x-1,d.z+1.2],ry:PI,anim:'carry',dozen:1},{actor:'agent2',at:[d.x+3,d.z+2.6],ry:0},{actor:'mo',at:[d.x+3.6,d.z+3.4],ry:PI,anim:'handenzij'},
   dz?{actor:'kramer',at:[d.x-4,d.z+4.6],ry:naar({x:d.x-4,z:d.z+4.6},l)}:null,{actor:'luca',at:[l.x,l.z],ry:naar(l,d)},
   cam(l.x+4,2.2,l.z+6,d.x,1.6,d.z,{fov:46}),{fade:'in',t:.4},T_('Twee politiebusjes. Rood-wit lint. Agenten dragen dozen naar buiten.'),T_('Mo staat met zijn handen op zijn rug bij een agent.'),
   dz?T_('Kramer staat bij het lint. Hij ziet Luca. Hij knikt één keer.'):null,
   {actor:'rafiq',at:[d.x,d.z+.6],ry:0,anim:'rook'},rond({x:d.x,z:d.z+.6},0,4,1.7,1.5),T_('Rafiq komt naar buiten. Geen handboeien. Hij steekt een sigaret op.'),
   {anim:'rafiq',a:'idle',naar:'luca'},{wait:1.2},T_('Hij kijkt even over de straat naar de rode jas. Dan kijkt hij weg.'),
   {actor:'hugo',at:[hp.x,hp.z],ry:naar(hp,l),prop:'camera'},cam(hp.x-1,1.7,hp.z+1.4,hp.x,1.6,hp.z,{fov:40}),T_('Aan de overkant, bij de tramhalte: een man met een camera.'),
   {fn:()=>{const o=document.createElement('div');o.id='s1Lens';o.style.cssText='position:fixed;inset:0;z-index:70;pointer-events:none;background:radial-gradient(circle at 50% 50%,transparent 32%,#000 34%)';document.body.appendChild(o)}},
   cam(hp.x,1.7,hp.z,l.x,1.3,l.z,{fov:10}),{snd:'click'},{wait:.5},{snd:'click'},verteller('n30'),{fn:()=>{const o=document.getElementById('s1Lens');if(o)o.remove()}},
   {fn:()=>bericht('B.','Rij door. Niet stoppen.',{kleur:'#5a5d63'})},{fade:'out',t:.5}]);
  ['agent','agent2','mo','kramer','luca','rafiq','hugo'].forEach(k=>C.weg(k));setTimeout(()=>{[bus1,bus2,lint].forEach(o=>o.parent&&o.parent.remove(o))},500);F('inval',1);await speel(t,[titel('Maandag','16:00',2)])},
 async t=>{// maandag: de tas terug, bij de hoek
  dag(22,16,0);outfit('school');const tp=F('tas_plek')||'bed';
  if(!await doelNaar(t,'De tas naar Bilal · de hoek',PL.hoek(),{actie:'Tas afgeven',sub:'Bilal'}))return;const h=PL.hoek(),b=walk(h.x-2,h.z-3,4),l=walk(h.x+.6,h.z-1,4);
  await speel(t,[{speler:false},{actor:'bilal',at:[b.x,b.z],ry:naar(b,l)},{actor:'luca',at:[l.x,l.z],ry:naar(l,b),prop:'tas'},rond(b,naar(b,l)+1.2,3.4,1.6,1.3),{fade:'in',t:.4},
   {anim:'luca',a:'give',prop:null,naar:'bilal'},Z('bilal','Een lege verpakking en wat poeder. Eigen gebruik, zei zijn advocaat. Hij staat weer buiten.'),
   Z('bilal','Zonder deze tas had hij nu vastgezeten. Rafiq zegt dat je familie bent.'),T_('Bilal zegt het alsof het iets vies is.'),{fade:'out',t:.4}]);
  C.weg('bilal');C.weg('luca');meter('vertrouwen',15);F('tas_terug',1);await speel(t,[titel('Dinsdag','Week vier',2)])}]});
VOLG.s1_h14={tekst:'Verder: Bella Napoli, dinsdagavond (Hoofdstuk 14)',p:()=>PL.napoli(),sub:'Dinsdag · Calzone',actie:'Naar binnen'};

/* =================== HOOFDSTUK 14 · Calzone =================== */
hoofdstuk({id:'s1_h14',outfit:'bezorger',na:()=>F('finale')==='verraad'?'s1_h15a':'s1_h15b',blokken:[
 async t=>{dag(23,21,30);outfit('bezorger');await binnen('napoli');B.toon('napoli','giovanni',false);
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 14','Calzone',2.6),{actor:'giovanni',at:W('napoli',...S1.NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',...S1.NAP.luca),ry:PI},actIn(['giovanni','luca']),
   cam(...W3('napoli',8.2,2.0,9.6),...W3('napoli',8,1.2,7.2),{fov:34}),{fade:'in',t:.6},T_('Giovanni pakt een calzone in. Langzamer dan anders.'),
   cam(...W3('napoli',4.4,2.2,10.8),...W3('napoli',7.8,1.4,7.6),{fov:44}),Z('giovanni','Meneer Ray. Weer een calzone. Hij vroeg naar jou. Bij naam.'),
   Z('giovanni','Hij kreeg ooit ook zo\'n fooi. Op de Boulevard. Daarna kwam hij niet meer terug.'),{anim:'giovanni',a:'give',naar:'luca'},T_('Hij houdt de doos nog even vast als Luca hem pakt.'),
   Z('giovanni','Wat er ook is, ragazzo. Je kunt hier altijd terugkomen.'),verteller('n31'),{fade:'out',t:.4}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli());marijke(true)},
 async t=>{marijke(true);setTimeout(()=>{if(levend(t))bericht('Rafiq','Waar ben je?',{kleur:'#5a5d63'})},20000);
  if(!await doelNaar(t,'Jachthaven Het Eiland · de Marijke',RAY.begin,{actie:'Afstappen',sub:'Ray'}))return;tijd(22,0);const b=RAY.begin,nv=RAY.nova;
  await speel(t,[{speler:false},{actor:'nova',at:[nv.x,nv.z],ry:naar(nv,b),anim:'armen'},{actor:'raysman',at:[nv.x-2.2,nv.z-1],ry:naar(nv,b),anim:'armen'},{actor:'luca',at:[b.x,b.z],ry:PI},
   cam(JX+12,4,JZ+42,JX,1.4,JZ+30,{fov:40}),{fade:'in',t:.6},T_('De Marijke is donker. Alleen een lamp boven de tafel.'),rond(nv,naar(nv,b)+1,3.4,1.7,1.5),Z('nova','Telefoons.'),
   {anim:'luca',a:'give',prop:'telefoon',naar:'nova'},F('twee_tel_gezien')?Z('nova','Twee. Ik tel altijd.'):T_('Nova telt ze. Twee.'),{fade:'out',t:.4}]);C.weg('nova');C.weg('raysman');C.weg('luca')},
 async t=>{const R=RAY,c=F('controle'),ed=F('edwin'),g3=F('geld_300'),ri=F('ray_indruk');
  const vRi=ri==='grap'?'Vorige keer zei je: pizza is lekker. Dat vond ik grappig. Toen.':ri==='netjes'?'Vorige keer zei je: ik bezorg alleen voor Giovanni. Dat geloofde ik. Toen.':'Vorige keer zei je niks. Dat vond ik netjes. Toen.';
  const vEd=ed==='angst'?'Je dreigde met zijn dochter. Bij mijn mensen doe je dat niet.':'Je gaf hem geld. Ik geef hem al twintig jaar meer.';
  const vC=F('heg_gevonden')?'En een hovenier in de Villawijk vond een pizzadoos onder een heg. Hij belde mij. Niet de politie.':c==='gepraat'?'En een man in de Villawijk kreeg die avond een pizzadoos zonder pizza.':'Agent Kramer schreef je naam op. Kramer schrijft ook voor mij.';
  const vG=g3==='ouders'?'Je moeder betaalt tegenwoordig contant bij de bakker. Briefjes van vijftig.':g3==='giulia'?'Je zus loopt om zeven uur \'s ochtends alleen naar de tram. Mooie witte schoenen.':'Schoenendoos, maat 43, onder je bed. We hebben hem laten staan.';
  const r=await speel(t,[{speler:false},{actor:'ray',at:[R.ray.x,R.ray.z-1.2],ry:PI},{actor:'luca',at:[R.luca.x,R.luca.z+.8],ry:PI},{actor:'nova',at:[R.ray.x+1.8,R.ray.z],ry:-PI/2,anim:'armen'},
   cam(JX-5,2.4,JZ+9,JX,1.3,JZ+4.6,{fov:42}),{fade:'in',t:.5},T_('Ray staat bij de rand van de steiger, met zijn rug naar Luca. Op tafel: een lege Bella Napoli-doos en een uitgeprinte foto.'),
   Z('ray','Ga zitten, Luca.'),{actor:'luca',at:[R.luca.x,R.luca.z],ry:PI,anim:'sit',sitY:-.4},{anim:'ray',a:'turn',ry:0},{actor:'ray',at:[R.ray.x,R.ray.z],ry:0,anim:'sit',sitY:-.36},
   ots(R.luca,R.ray,2.2,.8,1.9),Z('ray',vRi),cam(JX+.4,2.2,JZ+5.9,JX,.8,JZ+5.2,{fov:28}),{anim:'ray',a:'point'},
   Z('ray','Kramer stuurde me deze foto. Een lege verpakking uit de vriezer van Sahara. Met een schorpioen.'),Z('ray','Dat is niet mijn stempel.'),
   ots(R.luca,R.ray,2.2,.8,1.9),Z('ray','Edwin kwam na de inval zelf naar me toe. Twintig jaar werkt hij al voor mij. Hij zegt dat jij bij hem was.'),Z('ray',vEd),
   Z('ray',vC),Z('ray',vG),cam(JX,1.5,JZ+6.6,JX,1.4,JZ+4.2,{fov:24}),{snd:'heart'},
   Z('ray','Ik weet het eigenlijk al. Maar ik doe niks op een gevoel.'),verteller('n32'),Z('ray','Ik vraag het één keer. Voor wie werk je?'),
   keuze('luca','',[{t:'"Rafiq. Van Sahara."',id:'verraad'},{t:'(zwijgen)',id:'loyaal'},{t:'"Een man uit de haven. Teun."',id:'teun'}])]);
  if(!levend(t))return;if(r==='teun'){F('loog_tegen_ray',1);F('finale','loyaal');await speel(t,[Z('ray','Nova?'),Z('nova','Er is geen Teun.'),Z('ray','Liegen is erger dan zwijgen, Luca.')])}
  else{F('finale',r==='verraad'?'verraad':'loyaal');if(r==='verraad')F('verraad_moment','boot')}}]});

/* =================== HOOFDSTUK 15A · De val (verraad) =================== */
hoofdstuk({id:'s1_h15a',na:'s1_epi',outfit:'bezorger',blokken:[
 async t=>{marijke(true);const R=RAY,loods_=F('verraad_moment')==='loods';tijd(22,20);outfit('bezorger');
  await speel(t,[{speler:false},{actor:'ray',at:[R.ray.x,R.ray.z],ry:0,anim:'sit',sitY:-.36},{actor:'luca',at:[R.luca.x,R.luca.z],ry:PI,anim:'sit',sitY:-.4},{actor:'nova',at:[R.ray.x+1.8,R.ray.z],ry:-PI/2,anim:'armen'},
   loods_?titel('De Marijke','Een uur later',2):null,cam(JX-4,2.0,JZ+7.4,JX,1.2,JZ+5,{fov:40}),{fade:'in',t:.4},loods_?Z('ray','Had dat meteen gezegd. Dat had je een lip gescheeld.'):null,Z('ray','Zie je. Zo moeilijk was dat niet.'),{anim:'ray',a:'drink'},
   Z('ray','Nu laat ik je zien hoe het werkt. Bij de grote mensen.'),{anim:'nova',a:'give',prop:'telefoon',naar:'luca'},T_('Nova schuift Rafiqs telefoon terug, met een envelop erbij.'),
   Z('ray','Stuur hem een bericht. Noordkade, twee uur. Je fietst er zelf heen.'),Z('ray','In die rode jas. Anders komt hij niet.')]);
  const vt=meter('vertrouwen')||0,gel=F('brug_antwoord')==='gelogen';
  const id=await S1.inScene(t,[cam(JX+.6,2.0,JZ+6.4,JX,.8,JZ+5.2,{fov:30})],()=>S1.telefoonKeuze({kop:'Tweede telefoon',naar:'Rafiq',twijfel:gel,opties:[
   {t:'Er klopt iets niet met de lading. Noordkade, twee uur. Kom alleen.',id:'lading',antwoord:()=>vt>=80?'Ik kom.':'Ik kom. Met Tarik.'},
   {t:'Ray was bij me. Hij weet iets. Ik moet je spreken. Noordkade.',id:'ray',antwoord:'Wat weet hij? Ik kom. Met Tarik.'},
   {t:'Ik zit in de problemen. Kun je komen? Noordkade, twee uur.',id:'hulp',antwoord:()=>vt>=50?'Blijf daar. Ik kom eraan.':'Ik kom. Met Tarik.'}]}))||'hulp';
  F('lokbericht',id);F('tarik_mee',(id==='ray'||(id==='lading'&&vt<80)||(id==='hulp'&&vt<50))?1:0);geld(12500,'envelop van Ray');
  await speel(t,[verteller('n33'),{actor:'luca',at:[R.begin.x,R.begin.z-2],ry:0},{actor:'nova',at:[R.begin.x+.8,R.begin.z-1.4],ry:naar({x:R.begin.x+.8,z:R.begin.z-1.4},{x:R.begin.x,z:R.begin.z-2})},
   rond({x:R.begin.x,z:R.begin.z-2},PI*.4,3,1.7,1.5),{anim:'nova',a:'give',naar:'luca'},Z('nova','Rechtop. Je wacht op je baas.'),{fade:'out',t:.5}]);['ray','luca','nova'].forEach(k=>C.weg(k));
  G.P.x=R.begin.x;G.P.z=R.begin.z;zorgFiets(R.begin)},
 async t=>{// de rit in de regen; het achterlicht blijft aan
  tijd(1,30);try{G.weerZet&&G.weerZet('regen',true)}catch(e){}S1.lichtKnop(true);S1.licht(true);
  const iv=setInterval(()=>{if(!levend(t)){clearInterval(iv);return}if(!S1.lichtAan()){S1.licht(true);sein('(Aan laten. Hij moet me zien.)','#ff9a8a')}},400);
  const k=PL.noordkade(),plek=walk(k.x+4,k.z+3,6);const ok=await doelNaar(t,'Noordkade · twee uur',plek,{actie:'Wachten',sub:'Onder de lamp',fietsAf:false});clearInterval(iv);if(!ok)return;
  fietsAf();tijd(1,55);const l=P(),car=walk(l.x+16,l.z+10,8),rc=S1.auto('#121316');rc.position.set(car.x,0,car.z);rc.rotation.y=naar(car,l);
  const vb=F('lokbericht'),tm=F('tarik_mee');
  const blik=await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,car)},cam(l.x-8,2.4,l.z-6,l.x,1.3,l.z,{fov:40}),{fade:'in',t:.8},{snd:'heart'},verteller('n34'),
   {fn:()=>G.scene().add(rc)},{snd:'engineStart'},cam(l.x-3,1.6,l.z-4,car.x,1.2,car.z,{fov:44}),{snd:'carDoor'},
   {actor:'rafiq',at:[car.x-1.6,car.z-1.6],ry:naar(car,l)},tm?{actor:'tarik',at:[car.x+1.4,car.z-1.8],ry:naar(car,l),anim:'armen'}:null,{move:'rafiq',to:[l.x+3,l.z+2],t:2.6},
   ots(l,{x:l.x+3,z:l.z+2},2,.7,1.8),Z('rafiq',vb==='hulp'?'Luca. Wat is er? Ben je gewond?':vb==='lading'?'Wat is er met de lading? Laat zien.':'Wat weet Ray? Wat heb je gezegd?'),
   Z('luca','Het spijt me.'),{snd:'engineStart'},T_('Een tweede paar koplampen. Achter Rafiq.'),{fade:'out',t:.3},{fn:()=>S1.fietsOpKade(true)},{fade:'in',t:.3},
   T_('Luca laat de fiets los. Hij valt op de kade. Het achterlicht knippert.'),
   {actor:'ray',at:[l.x+8,l.z+8],ry:naar({x:l.x+8,z:l.z+8},{x:l.x+3,z:l.z+2})},{actor:'nova',at:[l.x+9.4,l.z+7],ry:naar({x:l.x+9.4,z:l.z+7},{x:l.x+3,z:l.z+2})},
   {actor:'raysman',at:[l.x+1,l.z+8],ry:naar({x:l.x+1,z:l.z+8},{x:l.x+3,z:l.z+2}),anim:'armen'},cam(l.x-4,2.2,l.z-3,l.x+6,1.4,l.z+6,{fov:44}),
   tm?T_('Nova kijkt naar Tarik. Tarik kijkt naar Rafiq. Dan loopt hij de regen in.'):null,tm?{move:'tarik',to:[car.x+20,car.z+10],t:4,wacht:false}:null,
   Z('ray','Rafiq. Je kocht bij mij. En je verkocht aan mijn klanten.'),Z('ray','Met een kind in een rode jas. In mijn haven.'),
   ots(l,{x:l.x+3,z:l.z+2},1.8,.6,1.8),Z('rafiq',vb==='hulp'?'Je vroeg om hulp. En ik kwam.':F('brug_antwoord')==='gelogen'?'Je loog toen al. Op de brug.':F('vader_ontkend')?'Je kende je eigen vader niet, die nacht. Ik had het moeten weten.':'Jij? Ik heb je alles laten zien.'),
   {anim:'nova',a:'give',naar:'ray'},cam(l.x-1.2,1.6,l.z-1.6,l.x,1.5,l.z,{fov:36}),{anim:'ray',a:'point',prop:'pistool'},{snd:'heart'},
   Z('ray','Dit doe ik zelf. Hij stal van mij, niet van Nova. Kijk goed, Luca.'),Z('rafiq','Luca. Kijk me aan.'),
   keuze('luca','',[{t:'Kijk hem aan',id:'aan'},{t:'Kijk weg',id:'weg'}])]);
  F('laatste_blik',blik||'aan');
  const e_=A('eiland'),bc=F('laatste_blik')==='weg'?[cam(l.x,1.6,l.z,e_.x,4,e_.z,{fov:40,to:{pos:[l.x,1.6,l.z],look:[e_.x+40,4,e_.z]},t:2.4})]
   :[cam(l.x+sin(naar(l,{x:l.x+3,z:l.z+2}))*1.4,1.5,l.z+cos(naar(l,{x:l.x+3,z:l.z+2}))*1.4,l.x,1.5,l.z,{fov:30}),{wait:1.5}];
  const z=await S1.inScene(t,bc,()=>schotZwart());F('rafiq_dood',1);F('rafiq_dood_door','ray');['luca','rafiq','tarik','ray','nova','raysman'].forEach(k=>C.weg(k));rc.parent&&rc.parent.remove(rc);
  S1.lichtKnop(false);S1._zwart=z}]});

/* =================== HOOFDSTUK 15B · Stil (loyaal) =================== */
hoofdstuk({id:'s1_h15b',na:'s1_epi',outfit:'bezorger',blokken:[
 async t=>{marijke(true);const R=RAY;outfit('bezorger');
  await speel(t,[{speler:false},{actor:'ray',at:[R.ray.x,R.ray.z],ry:0,anim:'sit',sitY:-.36},{actor:'luca',at:[R.luca.x,R.luca.z],ry:PI,anim:'sit',sitY:-.4},{actor:'nova',at:[R.ray.x+1.8,R.ray.z],ry:-PI/2,anim:'armen'},
   cam(JX,1.5,JZ+6.6,JX,1.4,JZ+4.2,{fov:26}),{fade:'in',t:.3},{wait:3},Z('ray','Jammer.'),{anim:'ray',a:'point',naar:'nova'},{fade:'out',t:.4},{snd:'carDoor'},{snd:'engineStart'},
   titel('Havenloods 7','Noordkade',2.4)]);['ray','luca','nova'].forEach(k=>C.weg(k));marijke(false)},
 async t=>{tijd(0,40);const c=loods(true)||PL.noordkade();const st={x:c.x,z:c.z+1},ry={x:c.x,z:c.z-3},nv={x:c.x-4,z:c.z-2.6};
  const zitL=[{actor:'luca',at:[st.x,st.z],ry:PI,anim:'sit',sitY:-.4},{actor:'ray',at:[ry.x,ry.z],ry:0,anim:'sit',sitY:-.3},{actor:'nova',at:[nv.x,nv.z],ry:naar(nv,st),anim:'armen'},
   {actor:'raysman',at:[st.x+1.6,st.z+1.6],ry:PI*1.2,anim:'armen'}];
  await speel(t,[{speler:false},...zitL,cam(c.x+5,5.4,c.z+5.6,c.x,1,c.z-.6,{fov:52}),{fade:'in',t:.6},verteller('n35')]);
  const g3=F('geld_300');
  const vragen=[{v:(F('loog_tegen_ray')?'En geen Teun deze keer. ':'')+'Voor wie werk je, Luca?',d:4},
   {v:(g3==='ouders'?'Je vader sjouwt op de Containerkade. Met die rug. Hoe lang nog?':g3==='giulia'?'Je zus loopt om zeven uur alleen naar de tram. Elke ochtend.':'We waren in je kamer, Luca. Maat drieënveertig.')+' Voor wie?',d:5},
   {v:'Laatste keer. Daarna vraag ik het niet meer aan jou.',d:6}];
  for(let i=0;i<3&&levend(t);i++){await speel(t,[ots(st,ry,2.0,.7,1.6),Z('ray',vragen[i].v)]);
   const k=await S1.inScene(t,[cam(st.x+1.2,1.6,st.z-1.6,st.x,1.3,st.z,{fov:32}),{snd:'heart'}],()=>S1.zwijgen({kop:'Ronde '+(i+1)+' van 3',vraag:'Ray wacht.',duur:vragen[i].d}))||'zwijg';
   if(k==='noem'){F('finale','verraad');F('verraad_moment','loods');F('verraad_ronde',i+1);await speel(t,[Z('luca','…Rafiq. Rafiq van Sahara.'),{fade:'out',t:.4}]);
    ['luca','ray','nova','raysman'].forEach(k=>C.weg(k));loods(false);return 'goto:s1_h15a'}
   await speel(t,[i<2?{anim:'ray',a:'point',naar:'raysman'}:null,cam(c.x,2,c.z+.5,c.x,6,c.z,{fov:60}),i===1?null:{snd:'punch'},{fade:'out',t:.08},{wait:.4},{actor:'luca',at:[st.x,st.z],ry:PI,anim:'bang'},{fade:'in',t:.2},
    cam(c.x+2.4,1.4,c.z+3.4,st.x,1.0,st.z,{fov:40}),{wait:.8}])}
  F('zwegen',3);
  // de tip
  const dex=!!F('dex_weet');
  await speel(t,[{snd:'phoneRing'},T_('Stilte. Dan gaat er een telefoon.'),
   ...(dex?[T_('Luca\'s eigen telefoon, in Nova\'s hand. Op het scherm: Dex.'),Z('ray','Op de speaker.'),{anim:'nova',a:'bel',prop:'telefoon'},
     Z('dex','Luca? Waar zit je? Je moeder belde mij al twee keer.'),Z('nova','Luca kan nu niet.'),Z('dex','Wie is dit? Rafiq zoekt je ook. Hij wacht bij zijn busje op de Noordkade.'),T_('Nova hangt op.'),verteller('n36')]
    :[{anim:'ray',a:'bel',prop:'telefoon'},T_('Ray zet hem op de speaker.'),Z('bilal','Je zoekt wie die pizzajongen stuurt? Rafiq. Hij staat nu op de Noordkade.'),Z('ray','En jij wil zijn plek.'),
     Z('bilal','Ik wil niks. Ik bel alleen.'),F('bilal_jaloers')?Z('bilal','Rafiq gaf die jongen alles. Mij gaf hij een telmachine.'):null,verteller('n37')]),
   {anim:'ray',a:'hurk',prop:null},{actor:'ray',at:[st.x,st.z-1.2],ry:0,anim:'hurk'},cam(c.x-2,1.1,c.z-.2,st.x,1.1,st.z,{fov:36}),T_('Ray hurkt voor hem. Voor het eerst zijn ze even hoog.'),
   Z('ray','Drie keer niks gezegd. Daarom leef je nog.'),Z('ray','Wie zo kan zwijgen, kan voor mij werken. Maar eerst ben je niet meer van hem.'),
   {actor:'nova',at:[st.x-1.2,st.z+.4],ry:naar({x:st.x-1.2,z:st.z+.4},st)},{anim:'nova',a:'give',naar:'luca'},T_('Nova trekt de rode jas van zijn schouders. Ze geeft hem een zwarte jas en een bivakmuts.'),
   Z('nova','Die jas kent iedereen. Vannacht ben je niemand.'),{fn:()=>outfit('masker')},cam(st.x,1.6,st.z-1.4,st.x,1.6,st.z,{fov:30}),{wait:1.6},T_('Alleen adem. En een hartslag.'),{fade:'out',t:.5}]);
  ['luca','ray','nova','raysman'].forEach(k=>C.weg(k));loods(false)},
 async t=>{// de kade
  tijd(2,0);try{G.weerZet&&G.weerZet('regen',true)}catch(e){}const k=PL.noordkade(),l=walk(k.x-6,k.z+2,6),rf=walk(k.x+2,k.z+8,6),bus=S1.auto('#2a2c30',true);bus.position.set(rf.x+3,0,rf.z+3);bus.rotation.y=PI/2;G.scene().add(bus);
  const bil=!F('dex_weet');
  await speel(t,[{speler:false},{fn:()=>S1.fietsOpKade(true,true)},{actor:'rafiq',at:[rf.x,rf.z],ry:naar(rf,l),anim:'handenop'},{actor:'raysman',at:[rf.x+1.2,rf.z+.8],ry:naar(rf,l),anim:'armen'},
   {actor:'ray',at:[l.x+2,l.z-3],ry:naar({x:l.x+2,z:l.z-3},rf)},{actor:'nova',at:[l.x-1.6,l.z-1.6],ry:naar({x:l.x-1.6,z:l.z-1.6},rf)},bil?{actor:'bilal',at:[rf.x+7,rf.z+6],ry:naar({x:rf.x+7,z:rf.z+6},rf)}:null,
   {actor:'luca',at:[l.x-3,l.z-4],ry:naar({x:l.x-3,z:l.z-4},rf)},cam(k.x-14,6,k.z-12,rf.x,1,rf.z,{fov:46}),{fade:'in',t:.6},
   T_('Rafiqs busje met open deuren. Twee mannen houden Rafiq vast.'),bil?T_('Bilal is er ook. Capuchon op. Hij kijkt niemand aan.'):null,T_('Nova zet de rode fiets op de kade en legt de rode jas eroverheen. De fiets valt. Het achterlicht knippert.'),
   cam(l.x-4,.6,l.z-5.4,l.x,1.6,l.z,{fov:44}),{move:'luca',to:[rf.x-2.4,rf.z-2],t:4.4},{snd:'heart'},ots({x:rf.x-2.4,z:rf.z-2},rf,2,.6,1.8),
   Z('rafiq','Wie ben jij?'),cam(rf.x-2.1,1.9,rf.z-1.8,rf.x-2.4,1.7,rf.z-2,{fov:22}),T_('De gouden ketting glimt bij zijn kraag.'),ots({x:rf.x-2.4,z:rf.z-2},rf,2,.6,1.8),
   Z('rafiq','Die ketting… Luca? Die heb ik je gegeven.'),{actor:'ray',at:[rf.x-3.6,rf.z-2.6],ry:naar({x:rf.x-3.6,z:rf.z-2.6},rf)},{anim:'ray',a:'give',prop:'pistool',naar:'luca'},
   cam(rf.x-3,1.2,rf.z-3.4,rf.x-2.4,1.0,rf.z-2,{fov:28}),verteller('n38'),{anim:'luca',a:'idle'},
   Z('ray','Hij heeft je gebruikt. Nu geef ik je iets terug.'),Z('ray','Hij, of jullie allebei. Zo gaat het in de grote mensenwereld.'),Z('rafiq','Luca. Jij bent niet zoals hij.'),
   cam(rf.x-3.2,2.0,rf.z-3.6,rf.x,1.6,rf.z,{fov:40})]);
  let n=0;const schotCam=cam(rf.x-3.6,2.0,rf.z-3.8,rf.x,1.6,rf.z,{fov:38});await S1.inScene(t,[schotCam,{snd:'heart'}],()=>S1.heffen({kop:'Het schot',titel:'Houd E om je arm te heffen',duur:3,zakTekst:'Nova: "Eén of twee, Luca."',onZak:()=>{n++;fx('click')}}));F('geaarzeld',n);
  await speel(t,[{anim:'luca',a:'point'},{snd:'heart'}]);
  const lw=await speel(t,[keuze('luca','Zijn laatste woord',[{t:'"Sorry."',id:'sorry'},{t:'"Je had me nooit binnen moeten halen."',id:'binnen'},{t:'(niks)',id:'niks'}])]);F('laatste_woord',lw||'niks');
  if(lw==='sorry')await speel(t,[Z('luca','Sorry.')]);else if(lw==='binnen')await speel(t,[Z('luca','Je had me nooit binnen moeten halen.')]);
  const z=await S1.inScene(t,[schotCam],async()=>{await S1.eenKnop('Schieten');return schotZwart()});F('rafiq_dood',1);F('rafiq_dood_door','luca');
  ['luca','rafiq','ray','nova','raysman','bilal'].forEach(k=>C.weg(k));bus.parent&&bus.parent.remove(bus);S1._zwart=z}]});

/* =================== EPILOOG en TEASER =================== */
hoofdstuk({id:'s1_epi',na:'s1_vrij',blokken:[
 async t=>{tijd(2,10);const B_=F('finale')!=='verraad';try{G.weerZet&&G.weerZet('regen',true)}catch(e){}await buiten();const p=S1.fietsOpKade(true,B_)||PL.noordkade();
  const zw=document.createElement('div');zw.style.cssText='position:fixed;inset:0;background:#000;z-index:96;transition:opacity 3s';document.body.appendChild(zw);if(S1._zwart){S1._zwart.remove();S1._zwart=null}
  await speel(t,[{speler:false},cam(p.x-2.6,.32,p.z+1.9,p.x,.3,p.z,{fov:36}),{fn:()=>{requestAnimationFrame(()=>zw.style.opacity='0');setTimeout(()=>zw.remove(),3200)}},{wait:3},verteller('n39'),
   {fn:()=>S1.kadeStop()},{wait:1.2},{fade:'out',t:.01}]);S1.fietsOpKade(false);try{G.weerZet&&G.weerZet('')}catch(e){}
  await studio(t,2,['n40'],[{snd:'click'},{wait:.8}]);await speel(t,[{snd:'click'},{fade:'out',t:.01}])},
 async t=>{F('s1_klaar',Date.now());try{B.slot('sahara',true,'Verzegeld · Politie')}catch(e){}outfit('straat');
  const s=[F('finale')==='verraad'?'Je verraadde Rafiq. Big Ray schoot.':'Je zweeg drie keer. Rafiq viel door jouw hand.',
   'De driehonderd: '+({ouders:'voor mama',giulia:'voor Giulia',doos:'in de schoenendoos'}[F('geld_300')]||'—'),'Giulia: '+(F('sq3_klaar')?'ze gelooft nog in je':'ze kijkt je niet meer aan'),
   'Dex: '+(F('dex_weet')?'hij weet het':'hij weet van niks'),'De controle: '+({gepraat:'eruit gepraat',doos:'de tas, net goed',bureau:'het bureau'}[F('controle')]||'—'),
   'Edwin: '+(F('edwin')==='angst'?'bang gemaakt':'betaald'),'Ray: '+({grap:'vond je grappig',netjes:'vond je netjes',stil:'vond je stil'}[F('ray_indruk')]||'—')].map(x=>'· '+E(x)).join('<br>');
  const v=await S1.teaser({knoppen:true,samenvatting:'<b>Jouw keuzes gaan mee naar Seizoen 2</b><br>'+s});
  if(v==='opnieuw'){try{const st=ST.st(),inst=st.inst;Object.keys(st).forEach(k=>delete st[k]);st.v=3;st.inst=inst||{};st.step='start';st.reset=Date.now();st.s1reset=S1.RESET_V;try{window.save&&window.save()}catch(e){}}catch(e){}setTimeout(()=>location.reload(),400);return 'stop'}}]});
// na het seizoen: vrij rondrijden, klussen open, verhaal op slot
ST.step('s1_vrij',{async start(){const t=S1.nieuw();try{B.slot('sahara',true,'Verzegeld · Politie')}catch(e){}outfit('straat');F('s1_hfd','vrij');
  sein('Seizoen 1 is klaar. Klussen bij Bella Napoli en op de hoek blijven open. Seizoen 2: 24 november.','#ff5a4a');
  const iv=setInterval(()=>{if(!levend(t)){clearInterval(iv);return}},5000)}});
}
if(S1.ST)reg();else S1.onStart.push(reg);
})();
