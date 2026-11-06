// Rennen! (flee.js) — het tekenwerk: de plek waar je ontsnapt, jij als renner in je eigen outfit, en je portret.
// flee.js houdt de regels (fleeCore) en het scherm eromheen; dit bestand tekent alleen (canvas 2D, geen DOM per frame).
//
// Schilder-volgorde van ver naar dichtbij, zodat niets verkeerd over elkaar valt:
//  1. lucht en skyline (alleen boven de horizon; in de parkeergarage een plafond)
//  2. de vloer: straat, stoep, water
//  3. het einde van de route (dwarsstraat met gevels, de kade, de uitrit) — vóór de zijkanten, die stoppen waar de route stopt
//  4. de zijkanten, per kant van ver naar dichtbij (gevels, muren, containers, pilaren, bruggen, woonboten)
//  5. alles wat op of naast de baan staat (lantaarns, bomen, obstakels, jij en de agent), samen op diepte gesorteerd
// Begin je binnen, dan eerst de buitenwereld achter de deur, dan de gang zelf (die alles rond de deur afdekt) en wat er binnen staat.
// Decor staat altijd buiten de banen (|X| ≥ 2,6 m) en zijgevels liggen op |X| ≥ 2,9 m, dus decor en obstakels raken elkaar nooit.
const FLA={CB:8.4,CHo:5.0,CHi:3.9,ceil:5.2,W:2.9,lane:1.5};
// per plek: naam, uitgang, kleuren (lucht, mist, straat, stoep), de zijkanten en het einde
const FLV={
 gracht:{n:'Gracht',exit:'Brug',sky:['#050916','#211b31'],fog:'#17172a',road:'#1d1c21',walk:'#29262b',pat:'klinker',L:'pand',R:'gracht',end:'brug',rain:1,amb:'255,170,90',line:'toren'},
 steeg:{n:'Steeg',exit:'Portiek',sky:['#05060c','#1d1420'],fog:'#151017',road:'#19181b',walk:'#1f1d20',pat:'klinker',L:'muur',R:'muur',end:'portiek',rain:1,amb:'255,130,100',line:'stad'},
 markt:{n:'Winkelstraat',exit:'Zijstraat',sky:['#060714','#2c1d2c'],fog:'#1c1624',road:'#28262c',walk:'#2e2b31',pat:'tegel',L:'winkel',R:'winkel',end:'zijstraat',amb:'255,205,150',line:'toren'},
 haven:{n:'Kade',exit:'Bootje',sky:['#04060b','#2d1c15'],fog:'#181417',road:'#2a2a2d',walk:'#2a2a2d',pat:'beton',L:'container',R:'kade',end:'water',amb:'255,150,60',line:'kranen'},
 woonwijk:{n:'Woonwijk',exit:'Park',sky:['#050814','#1c2133'],fog:'#151b28',road:'#1c1d22',walk:'#2b2b30',pat:'asfalt',L:'woning',R:'woning',end:'park',rain:1,amb:'255,190,120',line:'bomen'},
 garage:{n:'Parkeergarage',exit:'Uitrit',roof:1,ceil:4.8,fog:'#0f1114',road:'#2c2e33',walk:'#2c2e33',pat:'garage',L:'garage',R:'garage',end:'uitrit',amb:'225,238,255'},
 gang:{n:'Gang',fog:'#0d0e11',road:'#202228',pat:'tegel'},winkel:{n:'Winkel',fog:'#101114',road:'#34373d',pat:'tegel'},kantoor:{n:'Kantoor',fog:'#0c1018',road:'#151c2a',pat:'tapijt'}};
const flH=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const FLA_RGB={};const flRgb=h=>FLA_RGB[h]||(FLA_RGB[h]=[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const flMix=(a,b,k)=>{const A=flRgb(a),B=flRgb(b);return `rgb(${A[0]+(B[0]-A[0])*k|0},${A[1]+(B[1]-A[1])*k|0},${A[2]+(B[2]-A[2])*k|0})`};

// ---------------- de wereld (vast per vlucht, zelfde zaadjes = zelfde straat) ----------------
function flWorldArt(X,len){const T=FLV[X.out]||FLV.gracht,Wd={L:[],R:[],O:[],br:[],boats:[],ships:[],deco:[],front:[],len,end:T.end};let n=11;const h=()=>flH(n++);
 const open=T.end==='brug',zs=-18,ze=open?len+130:len,OX=FLA.W+12;Wd.OX=OX;
 const BR=['#4a2a22','#3d2520','#5a3226','#33292a','#46322a','#2e3442','#3a3a2e','#55301f','#262a30'],TR=['#d6cdbb','#d6cdbb','#ddd5c4','#b0bba6','#cdbd92'];
 // bruggen over de gracht (de laatste is de uitgang) — daar een zijstraat: geen gevels, geen decor
 if(T.R==='gracht'){for(let z=36+h()*16;z<len-30;z+=52+h()*24)Wd.br.push(z);Wd.br.push(len)}
 const gapAt=z=>Wd.br.find(b=>z>b-2&&z<b+7);
 // een rij panden/muren/containers achter elkaar; na een opening (brug, zijstraat) zie je de kopse kant van het volgende blok
 const fill=(arr,mk,sd)=>{let z=zs,gap=true;while(z<ze){const b=gapAt(z);if(b!=null){z=b+7;gap=true;continue}
   const o=mk(z,sd);const b2=Wd.br.find(b=>b-2>o.z0&&b-2<o.z1);if(b2!=null)o.z1=b2-2;o.z1=Math.min(o.z1,ze);if(gap)o.gapB=1;gap=false;arr.push(o);z=o.z1;if(o.gapAfter){z+=o.gapAfter;gap=true}}};
 const pand=(z,sd)=>({k:'pand',z0:z,z1:z+4.3+h()*2.1,h:9+h()*3.6,g:['trap','klok','hals','lijst','trap','klok'][Math.floor(h()*6)],col:BR[Math.floor(h()*BR.length)],trim:TR[Math.floor(h()*TR.length)],seed:n++,door:h()<.5?0:1});
 const winkel=(z,sd)=>({k:'winkel',z0:z,z1:z+5.4+h()*2.6,h:8.6+h()*3,col:BR[Math.floor(h()*BR.length)],trim:TR[Math.floor(h()*TR.length)],seed:n++,
  sc:['#e0485f','#2fb5ad','#e8b931','#8f7ae0','#58b368','#e8742e'][Math.floor(h()*6)],aw:h()<.55,cool:h()<.3});
 let blk=0,inb=0;const woning=(z,sd)=>{if(inb<=0){inb=4+Math.floor(h()*3);blk++}inb--;const last=inb===0;
  return {k:'woning',z0:z,z1:z+5.4,h:6.1,col:['#5a3226','#4a2c24','#6a4a36','#3e3a36'][blk%4],roof:['#2a2624','#3a2a24','#262a30'][blk%3],seed:n++,door:(Math.floor(z/5.4)%2),gapAfter:last?3.2:0}};
 const muur=(z,sd)=>({k:'muur',z0:z,z1:z+4+h()*4,h:6.4+h()*3,col:['#3c2621','#33231f','#402a22','#2e2524'][Math.floor(h()*4)],f:h(),seed:n++});
 const cont=(z,sd)=>{const L=h()<.6?12.2:6.1,nn=1+Math.floor(h()*3);return {k:'cont',z0:z,z1:z+L,n:nn,c:[0,1,2].map(()=>['#8a2c24','#1f4f8a','#2d6b3f','#c06a1c','#5a5f66','#7a2a5a','#a88a2a'][Math.floor(h()*7)]),gapAfter:h()<.25?3:.3,seed:n++}};
 const kind={pand,winkel,woning,muur,container:cont};
 [['L',-1,T.L],['R',1,T.R]].forEach(([s,sd,k])=>{if(kind[k]){blk=s==='R'?2:0;inb=0;fill(Wd[s],kind[k],sd)}});
 if(T.L==='garage'){Wd.pil=[];for(let z=zs;z<len;z+=5.6)Wd.pil.push({z0:z,c:[h()<.62?['#7a1f22','#2a4d7a','#cfd2d6','#1d1f24','#5a5f66','#2f5a3a'][Math.floor(h()*6)]:null,h()<.62?['#7a1f22','#2a4d7a','#cfd2d6','#1d1f24','#5a5f66','#c9a227'][Math.floor(h()*6)]:null],
   c2:[h()<.6?['#1d1f24','#7a1f22','#cfd2d6','#2a4d7a'][Math.floor(h()*4)]:null,h()<.6?['#5a5f66','#1d1f24','#2a4d7a','#cfd2d6'][Math.floor(h()*4)]:null]})}
 // gracht: de overkant (met openingen bij de bruggen) en woonboten langs onze kade
 if(T.R==='gracht'){let z=zs-10;while(z<ze+40){const b=Wd.br.find(b=>z>b-2&&z<b+7);if(b!=null){z=b+7;Wd.O.push({gap:1});continue}const o=pand(z,1);const b2=Wd.br.find(b=>b-2>o.z0&&b-2<o.z1);if(b2!=null)o.z1=b2-2;if(!Wd.O.length||Wd.O[Wd.O.length-1].gap)o.gapB=1;Wd.O.push(o);z=o.z1}
  Wd.O=Wd.O.filter(o=>!o.gap);
  for(let z=zs+8;z<ze;z+=16+h()*14){const L=11+h()*6,bad=Wd.br.some(b=>z<b+10&&z+L>b-5);if(!bad)Wd.boats.push({z0:z,z1:z+L,col:['#2b3b33','#3a2a24','#26303d','#4a3a2a'][Math.floor(h()*4)],roof:['#6a2a22','#2a3a2a','#3a3f48'][Math.floor(h()*3)],seed:n++});z+=L}}
 if(T.R==='kade')for(let z=zs+20;z<len+60;z+=48+h()*30)Wd.ships.push({z0:z,z1:z+30+h()*20,col:['#2a3440','#3a1f1f','#23302a'][Math.floor(h()*3)],seed:n++});
 // decor naast de baan (nooit in de banen, nooit bij een brug)
 const D=(k,z,x,o)=>{if(Wd.br.some(b=>z>b-5&&z<b+9))return;Wd.deco.push(Object.assign({k,z,X:x},o||{}))};const W=FLA.W;
 if(T.R==='gracht'){for(let z=zs+4;z<ze;z+=9+h()*4)D('boom',z,W-.2);for(let z=zs+9;z<ze;z+=15)D('lamp',z,W-.35);for(let z=zs+6;z<ze;z+=8+h()*8)if(h()<.55)D('fietsen',z,-W+.4,{c:Math.floor(h()*4)})}
 if(T.L==='muur')for(let z=zs+10;z<ze;z+=17+h()*8)if(h()<.5)D('afval',z,(h()<.5?-1:1)*(W-.35));
 if(T.L==='winkel'){for(let z=zs+7;z<ze;z+=13)D('lamp',z,(Math.round(z/13)%2?1:-1)*(W-.25));for(let z=zs+11;z<ze;z+=19+h()*9)D(h()<.5?'bank':'bak',z,(h()<.5?-1:1)*(W-.35));Wd.lights=[];for(let z=zs+12;z<ze;z+=16)Wd.lights.push(z)}
 if(T.L==='container'){for(let z=zs+6;z<ze;z+=20)D('mast',z,W-.25);for(let z=zs+3;z<ze;z+=6)D('bolder',z,W-.2)}
 if(T.L==='woning'){for(let z=zs+5;z<ze;z+=11+h()*5)D('boom',z,(h()<.5?-1:1)*(W-.2));for(let z=zs+9;z<ze;z+=18)D('lamp',z,(Math.round(z/18)%2?1:-1)*(W-.3))}
 // het einde: een dwarsstraat (die tekent zijn eigen lantaarns, achter de zijmuren)
 if(T.end==='portiek'||T.end==='zijstraat'||T.end==='park')Wd.Dc=8;
 if(T.end==='water'){D('bolder',len+1.8,-1.9);D('bolder',len+1.8,1.9)}
 Wd.deco.sort((a,b)=>a.z-b.z);return Wd}

// ---------------- jij: de renner (van achteren) of je portret (van voren) ----------------
// L = runnerLook(); o = {ph: stap-fase, air: 0..1 sprong, duck: 0..1 bukken, lean: kantelen, front: van voren, hurt}
// Tekent in meters met y omhoog vanaf je voeten; de aanroeper zet translate + scale(s,-s).
function flDrawRunner(ctx,L,o){o=o||{};const sk='#c99b7a',skD='#a87b5c',hair=L.hair||'#2a1e16',F=!!o.front;
 const k=o.duck||0,air=o.air||0,run=o.stand?0:1,ph=o.ph||0,s1=Math.sin(ph)*run;
 const ln=(pts,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke()};
 const rr=(x,y,w,h,r,c)=>{ctx.fillStyle=c;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);ctx.fill()};
 const ci=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()};
 const pg=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill()};
 const hipY=.93-.38*k+air*.04,shY=hipY+.58-.12*k,top=L.top,lg=L.legs,sh=L.shoes,hd=L.head;
 ctx.save();ctx.rotate(-(o.lean||0));
 // benen en schoenen: het been dat naar achteren zwaait komt omhoog en je ziet de zool
 const leg=(sd,lift)=>{lift=air?.55:lift;const hx=sd*.1,fx=sd*(.1+k*.14),fy=.06+lift*.4*(1-k*.6),ky=hipY*.5+fy*.5+.05+lift*.1,kx=sd*(.13+k*.2);
  ln([[hx,hipY],[kx,ky],[fx,fy]],.17,lg.c);
  if(lg.kind==='track'||lg.kind==='suit')ln([[hx+sd*.075,hipY-.05],[kx+sd*.075,ky],[fx+sd*.07,fy+.05]],.025,lg.kind==='track'?lg.c2:'rgba(255,255,255,.12)');
  else if(lg.kind==='jeans')ln([[hx+sd*.06,hipY-.1],[kx+sd*.06,ky],[fx+sd*.06,fy+.08]],.014,lg.c2);
  const sw=.2,sh_=sh.kind==='boot'?.17:sh.kind==='dress'?.085:.11,up=F?0:lift;
  if(sh.kind==='boot')rr(fx-.09,fy-.06,.18,sh_+.04,.03,sh.c);
  rr(fx-sw/2,fy-.07,sw,sh_,.045,sh.c);
  if(sh.kind==='sneaker'){rr(fx-sw/2,fy-.07,sw,.035+up*.05,.02,sh.c2);if(!F)rr(fx-.03,fy-.02+up*.04,.06,.05,.01,sh.c2)}
  else if(sh.kind==='dress')rr(fx-sw/2+.03,fy-.005,.06,.02,.01,'rgba(255,255,255,.35)');
  else rr(fx-sw/2,fy-.07,sw,.03+up*.04,.015,sh.c2)};
 const la=Math.max(0,s1),lb=Math.max(0,-s1);
 if(la>lb){leg(1,lb);leg(-1,la)}else{leg(-1,la);leg(1,lb)}
 // romp
 const long=top.kind==='suit'?.12:top.kind==='jacket'?.07:top.kind==='hoodie'?.05:0,wb=.2,ws=.255,y0=hipY-.04-long;
 const torso=[[-wb,y0],[wb,y0],[ws+.01,shY-.08],[ws-.05,shY+.02],[-ws+.05,shY+.02],[-ws-.01,shY-.08]];
 // armen (achter de romp de zwaaiende arm die naar voren gaat, voor de romp de andere)
 const arm=sd=>{const sw=-sd*s1,ex=sd*(.33+k*.04),ey=shY-.27+sw*.07+air*.12,hx=sd*(.27+(air?.08:0)),hy2=shY-.45+sw*.22+air*.2+k*.12,sl=top.c;
  if(top.kind==='tee'){ln([[sd*.22,shY-.04],[sd*.27,shY-.16]],.15,sl);ln([[sd*.27,shY-.14],[ex,ey],[hx,hy2]],.105,sk)}
  else{ln([[sd*.22,shY-.04],[ex,ey],[hx,hy2]],.13,sl);
   if(top.kind==='tracksuit')ln([[sd*.26,shY-.06],[ex+sd*.05,ey],[hx+sd*.05,hy2+.04]],.025,top.c2);
   if(top.kind==='thief')for(let i=1;i<4;i++){const f=i/4;ln([[sd*.22+(ex-sd*.22)*f-.06,shY-.04+(ey-shY+.04)*f],[sd*.22+(ex-sd*.22)*f+.06,shY-.04+(ey-shY+.04)*f]],.04,top.c2)}
   if(top.kind==='suit')ci(hx,hy2+.05,.05,'#e9e6df')}
  ci(hx,hy2,.055,sk)};
 arm(s1>0?1:-1);
 pg(torso,top.c);
 // details per soort
 ctx.save();ctx.beginPath();torso.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.clip();
 if(top.kind==='thief')for(let y=y0+.06;y<shY+.05;y+=.12)rr(-.4,y,.8,.055,0,top.c2);
 if(top.kind==='tracksuit'){rr(-ws,y0,.07,.7,0,top.c2);rr(ws-.07,y0,.07,.7,0,top.c2);if(F)rr(-.012,y0,.024,.7,0,'rgba(255,255,255,.5)')}
 if(top.kind==='hoodie'){rr(-.3,y0,.6,.06,0,top.c2);if(F){rr(-.13,y0+.08,.26,.14,.04,top.c2)}}
 if(top.kind==='jacket'){if(F){pg([[-.03,y0],[.03,y0],[.06,shY],[-.06,shY]],'#20232a')}else rr(-.008,y0,.016,.62,0,'rgba(0,0,0,.25)');rr(-.3,y0,.6,.04,0,'rgba(0,0,0,.22)')}
 if(top.kind==='suit'){if(F){pg([[-.07,shY-.02],[.07,shY-.02],[.0,shY-.3]],'#e9e6df');pg([[-.02,shY-.06],[.02,shY-.06],[.025,shY-.36],[0,shY-.4],[-.025,shY-.36]],top.c2);
   pg([[-.07,shY-.02],[-.15,shY-.02],[-.02,shY-.42]],'rgba(0,0,0,.25)');pg([[.07,shY-.02],[.15,shY-.02],[.02,shY-.42]],'rgba(0,0,0,.25)')}else{ln([[0,y0],[0,y0+.2]],.012,'rgba(0,0,0,.4)')}}
 // licht van opzij en schaduw onderin
 const g=ctx.createLinearGradient(-ws,0,ws,0);g.addColorStop(0,'rgba(255,190,130,.16)');g.addColorStop(.35,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=g;ctx.fillRect(-.4,y0,.8,.8);
 if(o.hurt){ctx.fillStyle='rgba(255,40,60,.32)';ctx.fillRect(-.4,y0,.8,.8)}
 ctx.restore();
 arm(s1>0?-1:1);
 // hals en hoofd
 const hy=shY+.2,hr=.135;
 if(top.kind==='suit'||top.kind==='jacket'||top.kind==='tracksuit')rr(-.09,shY-.03,.18,.07,.02,top.kind==='suit'?'#e9e6df':top.c2);
 if(hd.kind!=='skimask'&&hd.kind!=='hood')rr(-.055,shY-.02,.11,.1,.02,skD);
 if(top.kind==='hoodie'&&hd.kind!=='hood')pg([[-.16,shY+.02],[.16,shY+.02],[.12,shY-.12],[-.12,shY-.12]],F?top.c2:top.c);
 if(hd.kind==='hood'){ci(0,hy,hr+.05,hd.c);if(F){ci(0,hy-.01,hr-.005,sk);ci(-.045,hy+.01,.014,'#1b1b1b');ci(.045,hy+.01,.014,'#1b1b1b');ctx.strokeStyle=hd.c2;ctx.lineWidth=.025;ctx.beginPath();ctx.arc(0,hy,hr+.01,0,7);ctx.stroke()}else{ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.arc(0,hy,hr+.05,-.4,Math.PI+.4,true);ctx.fill()}}
 else if(hd.kind==='skimask'){ci(0,hy,hr+.005,hd.c);rr(-.06,shY-.02,.12,.1,.02,hd.c);if(F){rr(-.085,hy-.005,.17,.05,.025,sk);ci(-.04,hy+.02,.013,'#1b1b1b');ci(.04,hy+.02,.013,'#1b1b1b');rr(-.03,hy-.075,.06,.03,.015,sk)}
  else{ln([[-.1,hy+.02],[.1,hy+.02]],.012,hd.c2)}}
 else{ci(-hr+.005,hy,.03,skD);ci(hr-.005,hy,.03,skD);
  if(F){ci(0,hy,hr,sk);pg([[-hr,hy+.02],[hr,hy+.02],[hr*.9,hy+.11],[0,hy+hr+.01],[-hr*.9,hy+.11]],hair);ci(-.045,hy,.014,'#1b1b1b');ci(.045,hy,.014,'#1b1b1b');rr(-.03,hy-.07,.06,.012,.006,'#7a4a3a')}
  else{ci(0,hy,hr,hair);rr(-.06,hy-hr+.01,.12,.04,.01,skD)}
  if(hd.kind==='cap'){ctx.fillStyle=hd.c;ctx.beginPath();ctx.arc(0,hy+.015,hr+.012,0,Math.PI);ctx.fill();rr(-hr-.012,hy,2*hr+.024,.03,.01,hd.c2);
   if(F)pg([[-.15,hy+.02],[.15,hy+.02],[.12,hy-.02],[-.12,hy-.02]],hd.c2);else{ctx.fillStyle=hair;ctx.beginPath();ctx.arc(0,hy+.02,.035,0,Math.PI);ctx.fill()}}
  else if(hd.kind==='beanie'){ctx.fillStyle=hd.c;ctx.beginPath();ctx.arc(0,hy-.01,hr+.018,-.05,Math.PI+.05);ctx.fill();rr(-hr-.02,hy-.03,2*hr+.04,.07,.02,hd.c2)}
  else if(hd.kind==='hat'){rr(-.25,hy+.06,.5,.035,.017,hd.c);rr(-.13,hy+.08,.26,.15,.04,hd.c);rr(-.13,hy+.09,.26,.035,0,hd.c2)}}
 ctx.restore()}
// je portret (van voren) in een klein canvas
function flPortrait(cv,L){if(!cv||!cv.getContext)return;const r=cv.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(40,r.width||64),h=Math.max(50,r.height||80);
 cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
 const g=c.createRadialGradient(w/2,h*.55,2,w/2,h*.55,h*.7);g.addColorStop(0,'rgba(255,170,90,.32)');g.addColorStop(1,'rgba(255,170,90,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
 const s=h/2.15;c.save();c.translate(w/2,h*.97);c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(0,0,.34*s,.06*s,0,0,7);c.fill();c.scale(s,-s);flDrawRunner(c,L,{stand:1,front:1});c.restore()}

// ---------------- de tekenaar ----------------
function flArt(cv,st){const ctx=cv.getContext('2d'),C=st.C,X=st.X,P=st.P,LK=st.LK,reduce=st.reduce,TO=FLV[X.out]||FLV.gracht,TI=X.inn?(FLV[X.inn]||FLV.gang):null,Wd=flWorldArt(X,C.len),FW=FLA.W,FLN=FLA.lane;
 const CB=FLA.CB,near=-CB+.4;let W=0,H=0,F=1,hy=0,cx=0,dpr=1,camX=0,CH=FLA.CHo,t=0,fogC=TO.fog,skyG=null,stars=[];
 const fit=()=>{const r=cv.parentNode.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(200,r.width);H=Math.max(160,r.height);
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);F=Math.min(H*1.15,W*1.45);cx=W/2;skyG=null;stars=Array.from({length:30},(_,i)=>[flH(i)*W,flH(i+50),.12+flH(i+9)*.4])};
 const P3=(x,y,z)=>{const s=F/Math.max(.3,z+CB);return {x:cx+(x-camX)*s,y:hy+(CH-y)*s,s}};
 const Zc=z=>Math.max(near,z);
 const poly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();for(let i=0;i<pts.length;i++){const p=pts[i];i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.closePath();ctx.fill()};
 const wq=(x,z1,z2,y1,y2)=>[P3(x,y1,Zc(z1)),P3(x,y2,Zc(z1)),P3(x,y2,Zc(z2)),P3(x,y1,Zc(z2))];
 const fq=(x1,x2,y1,y2,z)=>[P3(x1,y1,z),P3(x2,y1,z),P3(x2,y2,z),P3(x1,y2,z)];
 const gq=(x1,x2,z1,z2,y)=>[P3(x1,y,Zc(z1)),P3(x2,y,Zc(z1)),P3(x2,y,Zc(z2)),P3(x1,y,Zc(z2))];
 const fogK=z=>flClamp((z-12)/80,0,.84);const fc=(c,z)=>{const k=fogK(z);return k<=0?c:flMix(c,fogC,k)};
 const litC=(z,r)=>`rgba(255,${190+(r*45|0)},${110+(r*30|0)},${.85*(1-fogK(z)*.55)})`;
 const glow=(x,y,r,col,a)=>{if(r<1||a<=.004)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)};
 const add=f=>{ctx.save();ctx.globalCompositeOperation='lighter';f();ctx.restore()};
 const pool=(x,z,r,col,a)=>{if(z<near+.5)return;const c=P3(x,0,z),f=P3(x,0,z+r),nn=P3(x,0,Math.max(near+.3,z-r)),ry=Math.max(1,(nn.y-f.y)/2),rx=r*c.s;if(rx<2)return;
  add(()=>{ctx.translate(c.x,(nn.y+f.y)/2);ctx.scale(1,ry/rx);glow(0,0,rx,col,a)})};
 const d=()=>C.dist;
 // ---- lucht en skyline ----
 function sky(){if(TO.roof){ctx.fillStyle='#0b0c0e';ctx.fillRect(0,0,W,H);return}
  if(!skyG){skyG=ctx.createLinearGradient(0,0,0,Math.max(10,hy));skyG.addColorStop(0,TO.sky[0]);skyG.addColorStop(1,TO.sky[1])}
  ctx.fillStyle=skyG;ctx.fillRect(0,0,W,hy+1);ctx.fillStyle=fogC;ctx.fillRect(0,hy,W,H-hy);
  for(const s of stars){const y=s[1]*hy*.75;if(y>hy-10)continue;ctx.fillStyle=`rgba(255,255,255,${s[2]})`;ctx.fillRect(s[0],y,1,1)}
  const u=Math.min(W,H)/360,vx=P3(0,0,600).x,y0=hy+1,sil=flMix(TO.sky[1],'#000000',.45);ctx.fillStyle=sil;
  if(TO.line==='toren'||TO.line==='stad'){let x=-10,i=0;ctx.beginPath();ctx.moveTo(-10,y0);while(x<W+10){const w=(14+flH(i+300)*20)*u,hh=(TO.line==='stad'?16+flH(i+301)*40:8+flH(i+301)*12)*u;ctx.lineTo(x,y0-hh);
    if(TO.line==='toren'&&flH(i+302)<.6){ctx.lineTo(x+w*.5,y0-hh-6*u)}ctx.lineTo(x+w,y0-hh);x+=w;i++}ctx.lineTo(W+10,y0);ctx.closePath();ctx.fill();
   if(TO.line==='stad')for(let k=0;k<26;k++){const x=flH(k+400)*W,y=y0-(4+flH(k+401)*34)*u;ctx.fillStyle=`rgba(255,200,120,${.25+flH(k)*.3})`;ctx.fillRect(x,y,1.5*u,1.5*u)}
   if(TO.line==='toren'){const x=vx+W*.16;ctx.fillStyle=sil;ctx.fillRect(x-5*u,y0-62*u,10*u,62*u);ctx.fillRect(x-4*u,y0-82*u,8*u,20*u);ctx.beginPath();ctx.moveTo(x-3*u,y0-82*u);ctx.lineTo(x,y0-108*u);ctx.lineTo(x+3*u,y0-82*u);ctx.fill();
    ctx.fillStyle='#2a5bd7';ctx.beginPath();ctx.arc(x,y0-86*u,2.6*u,0,7);ctx.fill();add(()=>glow(x,y0-70*u,22*u,'255,190,120',.14))}}
  if(TO.line==='kranen'){ctx.strokeStyle=sil;ctx.lineWidth=2.4*u;for(let i=0;i<3;i++){const x=vx+(30+i*78)*u;ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y0-74*u);ctx.lineTo(x+58*u,y0-74*u);ctx.moveTo(x-18*u,y0-66*u);ctx.lineTo(x+48*u,y0-66*u);ctx.moveTo(x+40*u,y0-74*u);ctx.lineTo(x+40*u,y0-50*u);ctx.stroke();
    ctx.fillStyle=Math.floor(t*1.4+i)%2?'#ff3d52':'#4a1418';ctx.fillRect(x+55*u,y0-78*u,3*u,3*u)}
   ctx.fillStyle=sil;ctx.fillRect(vx-120*u,y0-12*u,90*u,12*u);ctx.fillRect(vx-100*u,y0-22*u,26*u,10*u)}
  if(TO.line==='bomen'){ctx.beginPath();for(let i=0;i<40;i++){const x=flH(i+500)*W,r=(8+flH(i+501)*12)*u;ctx.moveTo(x+r,y0);ctx.arc(x,y0-r*.4,r,0,Math.PI,true)}ctx.fill();
   for(const [px,hh] of [[.12,52],[.82,64]]){const x=px*W;ctx.fillRect(x-14*u,y0-hh*u,28*u,hh*u);for(let k=0;k<10;k++){if(flH(k+px*99)<.5)continue;ctx.fillStyle='rgba(255,210,140,.4)';ctx.fillRect(x-10*u+(k%3)*8*u,y0-(hh-6-Math.floor(k/3)*12)*u,4*u,4*u)}ctx.fillStyle=sil}}
  add(()=>glow(vx,hy,W*.5,TO.amb||'255,160,90',.1))}
 // ---- vloer ----
 function floor(T,za,zb,inn){if(zb<=za)return;const a=P3(0,0,Zc(za)),b=P3(0,0,zb),g=ctx.createLinearGradient(0,b.y,0,a.y);g.addColorStop(0,fc(T.road,zb));g.addColorStop(1,T.road);
  ctx.fillStyle=g;ctx.beginPath();gq(-FW,FW,za,zb,0).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  const z2=Math.min(zb,42);
  if(!inn&&T.pat!=='garage'){const wl=T.R==='gracht'||T.R==='kade'?[-1]:[-1,1];wl.forEach(sd=>{poly(gq(sd*(FW-.85),sd*FW,za,zb,.02),fc(T.walk,40));ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;const p=P3(sd*(FW-.85),.02,Zc(za)),q=P3(sd*(FW-.85),.02,zb);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()});
   if(T.R==='gracht'||T.R==='kade'){poly(gq(FW-.18,FW,za,zb,.02),'#5a5248');}}
  ctx.lineWidth=1;const st=T.pat==='klinker'?.6:T.pat==='tegel'?1.2:T.pat==='beton'?3:T.pat==='tapijt'?0:T.pat==='garage'?0:0;
  if(st){ctx.strokeStyle='rgba(255,255,255,.045)';ctx.beginPath();for(let k=Math.ceil((d()+Zc(za))/st)*st;k<d()+z2;k+=st){const z=k-d(),p=P3(-FW,0,z),q=P3(FW,0,z);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke()}
  if(T.pat==='asfalt'||T.pat==='garage'||T.pat==='beton'){const col=T.pat==='beton'?'rgba(242,194,48,.3)':'rgba(235,235,225,.2)';[-.75,.75].forEach(l=>{ctx.strokeStyle=col;ctx.lineWidth=Math.max(1,F*.004);ctx.beginPath();
   for(let k=Math.floor(d()/3)*3;k<d()+z2;k+=3){const z1=k-d(),z3=z1+1.4;if(z3<za)continue;const p=P3(l*FLN,0,Zc(Math.max(z1,za))),q=P3(l*FLN,0,z3);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke()})}
  if(inn){[-1,1].forEach(sd=>{const p=P3(sd*(FW-.3),0,Zc(za)),q=P3(sd*(FW-.3),0,zb);ctx.strokeStyle=X.alarm?'rgba(255,214,90,.4)':'rgba(255,214,90,.2)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()})}
  if(T.rain&&!inn)for(let k=Math.floor(d()/7)*7;k<d()+40;k+=7){const z=k-d()+3.2;if(z<za||z>zb)continue;const nn=Math.floor(k/7);if(flH(nn)<.45)continue;pool((flH(nn+3)-.5)*3.4,z,1.1,'255,150,70',.12)}}
 // ---- gevels op een vlak X (zijkant): ramen met kozijnen ----
 function win(x,zc,w,y1,hh,trim,lit,z,r){if(Math.abs(P3(x,y1,zc-w/2).x-P3(x,y1,zc+w/2).x)<3)return;
  poly(wq(x,zc-w/2-.07,zc+w/2+.07,y1-.08,y1+hh+.08),trim);poly(wq(x,zc-w/2,zc+w/2,y1,y1+hh),lit?litC(z,r):fc('#0d1117',z));
  ctx.fillStyle=trim;ctx.beginPath();wq(x,zc-.03,zc+.03,y1,y1+hh).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  ctx.beginPath();wq(x,zc-w/2,zc+w/2,y1+hh*.6,y1+hh*.6+.06).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill()}
 // de kopse kant van een blok (zichtbaar na een opening): een vlak op diepte z, van de rooilijn naar buiten
 function endFace(x,sd,z,hh,col,depth){if(z<near+.2)return;poly(fq(x,x+sd*(depth||9),0,hh,z),fc(flMix(col,'#000000',.35),z))}
 function pand(hs,x,sd,za,zb){const z0=hs.z0-d(),z1=hs.z1-d();if(z1<=Math.max(za,near)||z0>zb)return;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,col=fc(hs.col,m),w=hs.z1-hs.z0;
  if(hs.gapB&&z0>=za)endFace(x,sd,z0,hs.h,hs.col);
  poly(wq(x,a,b,0,hs.h),col);
  // gevel bovenop (alleen als het hele pand voor de camera staat)
  if(z0>near+.2&&z0>=za-.01){const gh=Math.min(3.3,w*.6),mz=(z0+z1)/2,pts=[],Q=(z,y)=>pts.push(P3(x,y,z));
   if(hs.g==='trap'){const sw=w*.16,sh=gh/3.6;Q(z0,hs.h);for(let i=0;i<3;i++){Q(z0+i*sw,hs.h+(i+1)*sh);Q(z0+(i+1)*sw,hs.h+(i+1)*sh)}Q(mz-.35,hs.h+gh);Q(mz+.35,hs.h+gh);for(let i=2;i>=0;i--){Q(z1-(i+1)*sw,hs.h+(i+1)*sh);Q(z1-i*sw,hs.h+(i+1)*sh)}Q(z1,hs.h)}
   else if(hs.g==='klok'){Q(z0,hs.h);Q(z0+w*.12,hs.h+gh*.2);Q(z0+w*.2,hs.h+gh*.55);Q(z0+w*.3,hs.h+gh*.85);Q(mz-.3,hs.h+gh);Q(mz,hs.h+gh*1.1);Q(mz+.3,hs.h+gh);Q(z1-w*.3,hs.h+gh*.85);Q(z1-w*.2,hs.h+gh*.55);Q(z1-w*.12,hs.h+gh*.2);Q(z1,hs.h)}
   else if(hs.g==='hals'){Q(z0,hs.h);Q(z0+w*.22,hs.h+gh*.18);Q(z0+w*.3,hs.h+gh*.62);Q(mz-.4,hs.h+gh*.62);Q(mz-.4,hs.h+gh);Q(mz+.4,hs.h+gh);Q(mz+.4,hs.h+gh*.62);Q(z1-w*.3,hs.h+gh*.62);Q(z1-w*.22,hs.h+gh*.18);Q(z1,hs.h)}
   else{Q(z0,hs.h);Q(z0,hs.h+.5);Q(z1,hs.h+.5);Q(z1,hs.h)}
   poly(pts,col);ctx.strokeStyle=fc(hs.trim,m);ctx.lineWidth=Math.max(1,P3(x,0,m).s*.06);ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   if(hs.g!=='lijst'){const p1=P3(x,hs.h+gh*.62,mz),p2=P3(x-sd*.55,hs.h+gh*.62,mz);ctx.strokeStyle='#120f0d';ctx.lineWidth=Math.max(1,p1.s*.08);ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke()}}
  poly(wq(x,a,b,hs.h-.22,hs.h),'rgba(0,0,0,.28)');
  if(Math.abs(P3(x,0,a).x-P3(x,0,b).x)<6)return;
  const nc=w>5.2?3:2,sp=w/nc,ww=Math.min(1.05,sp*.5),tr=fc(hs.trim,m);
  for(let f=0;;f++){const y1=f===0?.55:3.1+(f-1)*2.6;if(f>0&&y1+1.8>hs.h-.3)break;
   for(let i=0;i<nc;i++){const zc=hs.z0+sp*(i+.5)-d();if(zc+ww/2<a||zc-ww/2>b)continue;const r=flH(hs.seed*13+f*7+i);
    if(f===0){if(i===(hs.door?nc-1:0)){poly(wq(x,zc-.55,zc+.55,0,2.5),tr);poly(wq(x,zc-.45,zc+.45,0,2.15),fc('#1a2420',zc));poly(wq(x,zc-.45,zc+.45,2.2,2.42),r<.5?litC(zc,r):'#121518')}
     else win(x,zc,ww,.55,1.2,tr,r<.18,zc,r);continue}
    win(x,zc,ww,y1,1.75,tr,r<.3,zc,r)}}}
 function winkel(hs,x,sd,za,zb){const z0=hs.z0-d(),z1=hs.z1-d();if(z1<=Math.max(za,near)||z0>zb)return;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,col=fc(hs.col,m),w=hs.z1-hs.z0,fa=1-fogK(m);
  if(hs.gapB&&z0>=za)endFace(x,sd,z0,hs.h,hs.col);
  poly(wq(x,a,b,0,hs.h),col);poly(wq(x,a,b,hs.h-.3,hs.h),'rgba(0,0,0,.3)');
  // pui: etalage met licht, naamband in de winkelkleur, luifel
  poly(wq(x,a,b,0,.3),fc('#141518',m));poly(wq(x,a,b,.3,2.7),fc('#1b1916',m));poly(wq(x,a,b,.3,2.7),hs.cool?`rgba(150,200,255,${.3*fa+.04})`:`rgba(255,200,130,${.32*fa+.04})`);
  poly(wq(x,a,b,2.1,2.7),hs.cool?`rgba(200,230,255,${.45*fa+.05})`:`rgba(255,226,170,${.5*fa+.05})`);poly(wq(x,a,b,.3,.9),'rgba(0,0,0,.25)');
  ctx.fillStyle='rgba(0,0,0,.4)';for(let zz=hs.z0+1.5;zz<hs.z1-.5;zz+=1.6){const zr=zz-d();if(zr<a||zr>b)continue;ctx.beginPath();wq(x,zr-.05,zr+.05,.3,2.7).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill()}
  poly(wq(x,a,b,2.75,3.3),fc(hs.sc,m));
  if(hs.aw){ctx.fillStyle='rgba(255,255,255,.16)';for(let zz=hs.z0+.4;zz<hs.z1;zz+=.8){const zr=zz-d();if(zr<a||zr+.4>b)continue;ctx.beginPath();wq(x,zr,zr+.4,2.75,3.3).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill()}}
  if(fa>.1)pool(x-sd*1.3,m,2.2,hs.cool?'170,215,255':'255,214,160',.12*fa);
  if(Math.abs(P3(x,0,a).x-P3(x,0,b).x)<6)return;
  const nc=w>6.5?3:2,sp=w/nc,ww=Math.min(1.1,sp*.48),tr=fc(hs.trim,m);
  for(let f=0;;f++){const y1=4.0+f*2.55;if(y1+1.7>hs.h-.4)break;for(let i=0;i<nc;i++){const zc=hs.z0+sp*(i+.5)-d();if(zc+ww/2<a||zc-ww/2>b)continue;const r=flH(hs.seed*11+f*5+i);win(x,zc,ww,y1,1.6,tr,r<.32,zc,r)}}}
 function woning(hs,x,sd,za,zb){const z0=hs.z0-d(),z1=hs.z1-d();if(z1<=Math.max(za,near)||z0>zb)return;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,xf=x+sd*2.4,col=fc(hs.col,m);
  if(hs.gapB&&z0-3.2>=za)poly(gq(x,x+sd*14,z0-3.2,z0,0),fc(TO.road,z0));
  if(hs.gapB&&z0>=za&&z0>near+.2){poly([P3(xf,0,z0),P3(xf,hs.h,z0),P3(xf+sd*4.5,hs.h+2.8,z0),P3(xf+sd*9,hs.h,z0),P3(xf+sd*9,0,z0)],fc(flMix(hs.col,'#000000',.35),z0))}
  poly(gq(x,xf,a,b,.01),fc('#17201a',m));
  poly(wq(xf,a,b,0,hs.h),col);
  poly([P3(xf,hs.h,Zc(a)),P3(xf+sd*4.5,hs.h+2.8,Zc(a)),P3(xf+sd*4.5,hs.h+2.8,b),P3(xf,hs.h,b)],fc(hs.roof,m));
  poly(wq(xf,a,b,hs.h-.12,hs.h+.05),'rgba(0,0,0,.35)');
  if(Math.abs(P3(xf,0,a).x-P3(xf,0,b).x)>6){const r=flH(hs.seed),r2=flH(hs.seed+1),dz=hs.door?hs.z0+4.2:hs.z0+1.2,wz=hs.door?hs.z0+2.0:hs.z0+3.6,tr=fc('#d9d4c8',m);
   const dr=dz-d();if(dr>a&&dr<b){poly(wq(xf,dr-.5,dr+.5,0,2.2),fc('#2a1e18',dr));poly(wq(xf,dr-.4,dr+.4,1.6,2.1),r<.6?litC(dr,r):'#121518');const lp=P3(xf-sd*.05,2.4,dr+.7);add(()=>glow(lp.x,lp.y,lp.s*.8,'255,200,120',.35*(1-fogK(dr))))}
   const wr=wz-d();if(wr>a&&wr<b){poly(wq(xf,wr-1,wr+1,.7,2.2),tr);poly(wq(xf,wr-.92,wr+.92,.78,2.12),r2<.55?litC(wr,r2):fc('#0d1117',wr))}
   for(const zz of [1.4,4.0]){const zr=hs.z0+zz-d();if(zr<a||zr>b)continue;win(xf,zr,.9,3.5,1.3,tr,flH(hs.seed+zz)<.35,zr,r)}}
  // heg met een opening bij de deur
  const dz=(hs.door?hs.z0+4.2:hs.z0+1.2)-d(),hc=fc('#1c3322',m);if(dz-.6>a)poly(wq(x,a,Math.min(b,dz-.6),0,.95),hc);if(dz+.6<b)poly(wq(x,Math.max(a,dz+.6),b,0,.95),hc);
  poly(wq(x,a,b,.88,.95),'rgba(120,170,110,.18)')}
 function muur(hs,x,sd,za,zb){const z0=hs.z0-d(),z1=hs.z1-d();if(z1<=Math.max(za,near)||z0>zb)return;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,fa=1-fogK(m);
  const pa=P3(x,0,Zc(a)),pb=P3(x,0,b),g=ctx.createLinearGradient(pa.x,0,pb.x,0);g.addColorStop(0,fc(hs.col,a));g.addColorStop(1,fc(hs.col,b));ctx.fillStyle=g;ctx.beginPath();wq(x,a,b,0,hs.h).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  poly(wq(x,a,b,hs.h-.25,hs.h),fc('#4a3a32',m));
  if(m<30){ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;ctx.beginPath();for(let y=.45;y<hs.h-.3;y+=.45){const p=P3(x,y,Zc(a)),q=P3(x,y,b);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke()}
  const zc=(hs.z0+hs.z1)/2-d();if(zc<a||zc>b)return;const f=hs.f;
  if(f<.32){poly(wq(x,zc-.62,zc+.62,0,2.35),fc('#2a221e',zc));poly(wq(x,zc-.52,zc+.52,0,2.25),fc('#121012',zc));const lp=P3(x-sd*.25,2.75,zc);ctx.fillStyle='#ffd08a';ctx.fillRect(lp.x-lp.s*.1,lp.y-lp.s*.05,lp.s*.2,lp.s*.1);
   if(fa>.05){add(()=>glow(lp.x,lp.y,lp.s*1.5,'255,160,80',.4*fa));pool(x-sd*1.0,zc,2.2,'255,140,60',.16*fa)}}
  else if(f<.55){poly(wq(x,zc-.8,zc+.8,2.4,3.6),f<.42?`rgba(255,60,80,${.55*fa+.06})`:litC(zc,f));ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=Math.max(1,P3(x,0,zc).s*.04);ctx.beginPath();for(let i=-2;i<=2;i++){const p=P3(x,2.4,zc+i*.32),q=P3(x,3.6,zc+i*.32);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke();
   if(f<.42&&fa>.05){const c=P3(x,3,zc);add(()=>glow(c.x,c.y,c.s*2,'255,40,80',.18*fa))}}
  else if(f<.72){poly(wq(x,zc-.08,zc+.08,0,hs.h),fc('#26201d',zc));poly(wq(x,zc-.11,zc+.11,1,1.08),fc('#1a1513',zc))}
  else if(f<.86){poly(wq(x,zc-.5,zc+.5,3.2,3.9),fc('#5a5f66',zc));poly(wq(x,zc-.42,zc+.42,3.28,3.82),fc('#3a3f46',zc))}}
 function cont(c,x,sd,za,zb){const z0=c.z0-d(),z1=c.z1-d();if(z1<=Math.max(za,near)||z0>zb)return;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,big=Math.abs(P3(x,0,a).x-P3(x,0,b).x)>18;
  if(c.gapB&&z0>=za&&z0>near+.2)for(let j=0;j<c.n;j++){const y=j*2.6;poly(fq(x,x+sd*2.44,y,y+2.55,z0),fc(flMix(c.c[j],'#000000',.3),z0));ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=Math.max(1,P3(x,0,z0).s*.03);ctx.beginPath();
   for(const k of [.55,.95,1.5,1.9]){const p=P3(x+sd*k,y+.15,z0),q=P3(x+sd*k,y+2.4,z0);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke()}
  for(let j=0;j<c.n;j++){const y=j*2.6;poly(wq(x,a,b,y,y+2.55),fc(c.c[j],m));poly(wq(x,a,b,y+2.4,y+2.55),'rgba(0,0,0,.3)');poly(wq(x,a,b,y,y+.12),'rgba(0,0,0,.3)');
   if(big){ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.beginPath();for(let zz=Math.ceil(a/.5)*.5;zz<b;zz+=.5){const p=P3(x,y+.15,zz),q=P3(x,y+2.4,zz);ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y)}ctx.stroke()}}
  if(c.n===1&&z0>near)poly(gq(x,x+sd*2.44,a,b,2.55),fc(flMix(c.c[0],'#ffffff',.12),m))}
 function sideList(arr,x,sd,za,zb){for(let i=arr.length-1;i>=0;i--){const o=arr[i];if(o.z0-d()>zb)continue;if(o.z1-d()<za)break;
  if(o.k==='pand')pand(o,x,sd,za,zb);else if(o.k==='winkel')winkel(o,x,sd,za,zb);else if(o.k==='woning')woning(o,x,sd,za,zb);else if(o.k==='muur')muur(o,x,sd,za,zb);else if(o.k==='cont')cont(o,x,sd,za,zb)}}
 // ---- gracht: water, de overkant, woonboten, bruggen (alles op diepte) ----
 const WY=-1.2;
 function gracht(za,zb){const OX=Wd.OX;poly(gq(FW,OX+30,za,zb,WY),'#070d18');
  const g=ctx.createLinearGradient(0,P3(0,WY,zb).y,0,H);g.addColorStop(0,fc('#0c1626',zb));g.addColorStop(1,'#03060c');ctx.fillStyle=g;ctx.beginPath();gq(FW,OX+30,za,zb,WY).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  // weerspiegeling van verlichte ramen aan de overkant
  add(()=>{for(const hs of Wd.O){const z0=hs.z0-d();if(z0<za||z0>Math.min(zb,60))continue;const fa=1-fogK(z0);for(let i=0;i<3;i++){const r=flH(hs.seed*5+i);if(r>.45)continue;
   const zz=z0+(hs.z1-hs.z0)*(i+.5)/3,p=P3(OX,WY,zz),q=P3(OX-6,WY,zz),wob=reduce?0:Math.sin(t*3+zz)*p.s*.08;
   const g2=ctx.createLinearGradient(p.x,0,q.x,0);g2.addColorStop(0,`rgba(255,190,110,${.3*fa})`);g2.addColorStop(1,'rgba(255,190,110,0)');ctx.fillStyle=g2;ctx.fillRect(Math.min(p.x,q.x)+wob,p.y-p.s*.05,Math.abs(q.x-p.x),Math.max(1,p.s*.1))}}});
  if(!reduce){ctx.strokeStyle='rgba(160,190,230,.07)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<14;k++){const zz=((k*5.3-d()*.15+t*1.4)%50+50)%50+Math.max(za,2),X1=FW+1.5+flH(k)*7,a1=P3(X1,WY,zz),b1=P3(X1+1.2,WY,zz);ctx.moveTo(a1.x,a1.y);ctx.lineTo(b1.x,b1.y)}ctx.stroke()}
  // de overkant + bruggen + woonboten, van ver naar dichtbij
  const items=[];for(const hs of Wd.O){const z0=hs.z0-d();if(hs.z1-d()<za||z0>zb+20)continue;items.push([z0,()=>pand(hs,OX,1,za,zb+20)])}
  for(const b of Wd.br){const z=b-d();if(z<za-4||z>zb)continue;items.push([z,()=>bridge(z,b===Wd.len)])}
  for(const bt of Wd.boats){const z0=bt.z0-d();if(bt.z1-d()<za||z0>zb)continue;items.push([z0-.01,()=>boat(bt,za,zb)])}
  items.sort((p,q)=>q[0]-p[0]);items.forEach(i=>i[1]())}
 function boat(bt,za,zb){const z0=bt.z0-d(),z1=bt.z1-d(),a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,x1=FW+1.1,x2=FW+4;if(b<=near)return;
  if(z0>near+.2){poly(fq(x1,x2,WY,-.3,z0),fc(flMix(bt.col,'#000000',.3),z0));poly(fq(x1+.3,x2-.4,-.3,1.1,z0+.8),fc('#3a3530',z0))}
  poly(wq(x1,a,b,WY,-.3),fc(bt.col,m));poly(gq(x1,x2,a,b,-.3),fc('#2a2724',m));
  const c1=Math.max(a,z0+.8),c2=Math.min(b,z1-.8);if(c2>c1){poly(wq(x1+.3,c1,c2,-.3,1.1),fc('#3a3530',m));poly(gq(x1+.3,x2-.4,c1,c2,1.1),fc(bt.roof,m));
   for(let zz=bt.z0+2;zz<bt.z1-1.5;zz+=2.2){const zr=zz-d();if(zr<c1||zr+.8>c2)continue;poly(wq(x1+.3,zr,zr+.9,.15,.8),flH(bt.seed+zz)<.5?litC(zr,.5):fc('#10141a',zr))}}}
 function bridge(z,last){const X1=FW,X2=Wd.OX,dk=.55,fa=1-fogK(z);if(z+3.2<near)return;const z0=Zc(z);
  poly(gq(X1,X2,z,z+3.2,dk),fc('#2e2a26',z));if(z<near+.1)return;
  const top=[],bot=[];for(let i=0;i<=16;i++){const X_=X1+(X2-X1)*i/16;top.push(P3(X_,dk,z0));bot.push(P3(X_,WY+(dk-.5-WY)*Math.sin(Math.PI*i/16),z0))}
  poly(top.concat(bot.slice().reverse()),fc('#433a33',z));
  // reling
  ctx.strokeStyle=fc('#1d1a17',z);ctx.lineWidth=Math.max(1,top[0].s*.05);ctx.beginPath();top.forEach((p,i)=>{const y=p.y-p.s*.95;i?ctx.lineTo(p.x,y):ctx.moveTo(p.x,y)});ctx.stroke();
  add(()=>{bot.forEach((p,i)=>{if(i%2)return;ctx.fillStyle=`rgba(255,226,150,${.85*fa+.1})`;ctx.beginPath();ctx.arc(p.x,p.y-p.s*.05,Math.max(1,p.s*.045),0,7);ctx.fill();glow(p.x,p.y,p.s*.35,'255,200,110',.3*fa)})});
  if(last){const c=P3(X1+1.2,1.4,z+1.6);add(()=>glow(c.x,c.y,c.s*2.4,'40,220,110',.35));}}
 // ---- haven: kade met water en schepen ----
 function kade(za,zb){poly(gq(-60,-FW,za,zb,0),fc(TO.road,30));const g=ctx.createLinearGradient(0,P3(0,-1.6,zb).y,0,H);g.addColorStop(0,fc('#0a1018',zb));g.addColorStop(1,'#03060a');ctx.fillStyle=g;ctx.beginPath();gq(FW,FW+80,za,zb,-1.6).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  add(()=>{for(let k=0;k<8;k++){const zz=20+k*7-(d()*.2%7),p=P3(FW+3+flH(k)*18,-1.6,zz);if(zz>zb)continue;ctx.fillStyle=`rgba(255,150,60,${.1*(1-fogK(zz))})`;ctx.fillRect(p.x,p.y,p.s*2.5,Math.max(1,p.s*.05))}});
  for(let i=Wd.ships.length-1;i>=0;i--){const s=Wd.ships[i],z0=s.z0-d(),z1=s.z1-d();if(z1<za||z0>zb)continue;const a=Math.max(z0,za),b=Math.min(z1,zb),m=(a+b)/2,x=FW+7;
   if(z0>near+.2)poly([P3(x,-1.6,z0),P3(x,3,z0),P3(x+8,3,z0),P3(x+8,-1.6,z0)],fc(flMix(s.col,'#000000',.3),z0));
   poly(wq(x,a,b,-1.6,3),fc(s.col,m));poly(wq(x,a,b,2.6,3),fc('#c9ccd1',m));const s1=Math.max(a,z1-9),s2=Math.min(b,z1-3);if(s2>s1){poly(wq(x+1,s1,s2,3,7),fc('#d6d8dc',m));
    for(let y=3.6;y<6.6;y+=1.1)poly(wq(x+1,s1+.4,s2-.4,y,y+.45),litC(m,.6))}}}
 // ---- parkeergarage: plafond, achterwand, auto's en pilaren ----
 function garage(za,zb){const ce=TO.ceil;poly(gq(-30,30,za,zb+1.6,ce),'#121417');
  for(let k=Math.floor((d()+za)/5.6);k*5.6<d()+zb;k++){const z1=k*5.6-d()+2.4;if(z1<za||z1>zb)continue;const fa=1-fogK(z1),c=P3(0,ce,z1);
   poly(gq(-FW-6,FW+6,z1-.25,z1+.25,ce-.01),fc('#191b1f',z1));[-1.2,1.2].forEach(xx=>{poly(gq(xx-.6,xx+.6,z1-.08,z1+.08,ce-.02),`rgba(225,238,255,${.55*fa+.2})`)});
   add(()=>glow(c.x,c.y,c.s*2,'220,235,255',.14*fa));pool(0,z1,2.4,'220,235,255',.06*fa+.02)}
  [-1,1].forEach(sd=>{const xb=sd*(FW+5.6);poly(wq(xb,za,zb+1.6,0,ce),fc('#24272b',40));poly(wq(xb,za,zb+1.6,0,.9),fc('#2e3238',40));
   poly(gq(sd*FW,sd*(FW+5.6),za,zb+1.6,.005),fc('#26282c',40));
   const items=[];for(const p of Wd.pil){const z=p.z0-d();if(z>zb||z+5.6<za)continue;items.push([z+.6,()=>cars(p,sd,z,za,zb)]);items.push([z,()=>pillar(sd,z,za,zb)])}
   items.sort((p,q)=>q[0]-p[0]);items.forEach(i=>i[1]())})}
 function cars(p,sd,z,za,zb){const cs=sd<0?p.c:p.c2;[[1.0,2.8],[3.4,5.2]].forEach(([s,e],i)=>{const col=cs[i];if(!col)return;const a=z+s,b=z+e;if(b<za||a>zb||b<near+.3)return;const x=sd*(FW+.9),m=(a+b)/2;
   const a2=Math.max(a,za),X1=sd*(FW+1.6),X2=sd*(FW+2.3),X3=sd*(FW+3.7),body=fc(col,m);
   poly(gq(X2,X3,a2+.12,b-.12,1.42),fc(flMix(col,'#ffffff',.1),m));poly([P3(X1,1.0,Zc(a2+.1)),P3(X2,1.42,Zc(a2+.12)),P3(X2,1.42,b-.12),P3(X1,1.0,b-.1)],fc('#11161e',m));
   poly(gq(x,X1,a2,b,1.0),fc(flMix(col,'#ffffff',.05),m));
   poly(wq(x,a2,b,.25,1.0),body);poly(wq(x,a2,b,.15,.3),'#0b0b0d');
   poly(wq(x,Math.max(a,za)+.1,Math.max(a,za)+.4,.7,.85),'#c0262f');poly(wq(x,b-.4,b-.1,.7,.85),'#c0262f');poly(wq(x,a+.6,b-.6,.35,.55),fc('#d9dde3',m))})}
 function pillar(sd,z,za,zb){if(z+.6<Math.max(za,near)||z>zb)return;const x=sd*FW,ce=TO.ceil;
  if(z>near+.2){poly(fq(x,x+sd*.6,0,ce,z),fc('#8b8f96',z));poly(fq(x,x+sd*.6,0,.9,z),fc('#e0b520',z));ctx.fillStyle='#1b1d22';for(let i=0;i<3;i++){const y=.15+i*.27;poly([P3(x+sd*(.05),y,z),P3(x+sd*(.25),y+.18,z),P3(x+sd*(.38),y+.18,z),P3(x+sd*(.18),y,z)],'#1b1d22')}
   poly(fq(x,x+sd*.6,2.2,2.7,z),fc('#3a8a6a',z))}
  poly(wq(x,Math.max(z,za),z+.6,0,ce),fc('#6f737a',z+.3));poly(wq(x,Math.max(z,za),z+.6,0,.9),fc('#c9a21c',z+.3))}
 // ---- binnen: gang, winkel of kantoor ----
 function binnen(th,sd,za,zb){const x=sd*FW,al=X.alarm,ce=FLA.ceil;const base=th==='kantoor'?'#1f2a38':th==='winkel'?'#2a2d33':al?'#2a1b1d':'#2a2e36';
  const a=P3(x,0,Zc(za)),b=P3(x,0,zb),g=ctx.createLinearGradient(a.x,0,b.x,0);g.addColorStop(0,base);g.addColorStop(1,fc(base,zb));ctx.fillStyle=g;ctx.beginPath();wq(x,za,zb,0,ce).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  if(th==='winkel'){const PC=['#e0313f','#f2c230','#3fa0e0','#5cc36b','#ff8a3c','#e9e6df','#b8a1ff'];for(const y of [.1,.6,1.1,1.6])poly(wq(x,za,zb,y,y+.06),'#9ca1a8');
   const z2=Math.min(zb,32);for(let k=Math.floor((d()+Zc(za))/.7);k*.7<d()+z2;k++){const zz=k*.7-d();if(zz<za)continue;for(let j=0;j<4;j++){const r=flH(k*5+j+(sd>0?77:0));if(r<.12)continue;poly(wq(x,zz+.05,zz+.62,.16+j*.5,.16+j*.5+.32+r*.08),fc(PC[Math.floor(r*PC.length)],zz))}}
   for(let k=Math.floor((d()+Zc(za))/9);k*9<d()+zb;k++){const zz=k*9-d()+3;if(zz<za||zz>zb)continue;poly(wq(x,zz,zz+1.6,2.6,3.1),fc(flH(k)<.5?'#e0313f':'#f2c230',zz))}}
  else if(th==='kantoor'){for(let k=Math.floor((d()+Zc(za))/3);k*3<d()+zb;k++){const zz=k*3-d();if(zz+3<za)continue;const r=flH(k+(sd>0?40:0)),fa=1-fogK(zz);
    poly(wq(x,zz+.5,zz+2.4,.75,.8),'#3a4250');if(r<.6)poly(wq(x,zz+1,zz+1.6,.85,1.25),`rgba(120,190,255,${.55*fa+.1})`);if(r>.8)poly(wq(x,zz+2.0,zz+2.5,0,1.1),fc('#2d6b3f',zz));
    poly(wq(x,zz,zz+.08,0,ce),fc('#8a96a6',zz))}
   ctx.fillStyle='rgba(140,190,255,.06)';ctx.beginPath();wq(x,za,zb,0,ce).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill()}
  else{poly(wq(x,za,zb,0,1.05),fc(al?'#3a2224':'#363b45',20));poly(wq(x,za,zb,1.05,1.12),'rgba(255,255,255,.08)');
   for(let k=Math.floor((d()+Zc(za))/6.5);k*6.5<d()+zb;k++){const zz=k*6.5-d()+2;if(zz+1.2<za)continue;const r=flH(k*2+(sd>0?1:0)),fa=1-fogK(zz);
    poly(wq(x,zz-.12,zz+1.22,0,2.45),fc('#15171b',zz));poly(wq(x,zz,zz+1.1,0,2.35),fc(al?'#4a2a2c':'#4a525e',zz));if(r<.4)poly(wq(x,zz,zz+1.1,0,.05),`rgba(169,220,255,${.4*fa})`);
    if(r>.7)poly(wq(x,zz+2.6,zz+2.9,.9,1.5),fc('#c0262f',zz));
    if(al&&r>.5&&zz+3.2>za&&zz+3.2<zb){const c=P3(x,ce-.5,zz+3.2),on=Math.sin(t*9+k)>0;ctx.fillStyle=on?'#ff3d52':'#4a1218';ctx.fillRect(c.x-c.s*.09,c.y-c.s*.09,c.s*.18,c.s*.18);if(on)add(()=>glow(c.x,c.y,c.s*1.4,'255,61,82',.3*fa+.05))}}}
  poly(wq(x,za,zb,0,.12),'rgba(0,0,0,.4)')}
 function ceiling(za,zb){const ce=FLA.ceil;poly(gq(-FW,FW,za,zb,ce),X.alarm?'#130d0e':'#101216');
  const ls=5.2;for(let k=Math.floor((d()+Zc(za))/ls);k*ls<d()+zb;k++){const z1=k*ls-d()+2,z2=z1+1.5;if(z2<za||z1>zb)continue;const fl=X.alarm?.55+.45*Math.max(0,Math.sin(t*2.2+k)):1,fa=1-fogK(z1);
   poly(gq(-.42,.42,Math.max(z1,za),z2,ce-.01),X.alarm?`rgba(255,200,200,${.35*fl})`:`rgba(225,240,255,${.3+.45*fa})`);
   const c=P3(0,ce,(z1+z2)/2);if(fa>0)add(()=>glow(c.x,c.y,c.s*1.8,X.alarm?'255,80,80':'200,230,255',.14*fl*fa));pool(0,(z1+z2)/2,1.8,X.alarm?'255,80,80':'200,230,255',.07*fl*fa+.015)}}
 function doorWall(z){if(z<near+.1)return;const ce=FLA.ceil,c=X.alarm?'#1e1416':'#1f2228',dh=2.9;
  poly(fq(-FW,FW,dh,ce,z),c);poly(fq(-FW,-FW+.28,0,dh,z),c);poly(fq(FW-.28,FW,0,dh,z),c);poly(fq(-FW+.28,FW-.28,dh-.12,dh,z),'#15171b');
  const s1=P3(-.5,3.6,z),s2=P3(.5,3.15,z);ctx.fillStyle='#16a34a';ctx.fillRect(s1.x,s1.y,s2.x-s1.x,s2.y-s1.y);
  ctx.strokeStyle='#eafff1';ctx.lineWidth=Math.max(1,s1.s*.05);ctx.beginPath();const my=(s1.y+s2.y)/2,mx=(s1.x+s2.x)/2,u=s1.s*.14;ctx.moveTo(mx-u*1.3,my);ctx.lineTo(mx+u*1.1,my);ctx.moveTo(mx+u*.4,my-u*.7);ctx.lineTo(mx+u*1.1,my);ctx.lineTo(mx+u*.4,my+u*.7);ctx.stroke();
  add(()=>glow(mx,my,s1.s*1.1,'40,220,110',.35))}
 // ---- het einde van de route ----
 const exN=X.veh?X.veh.n:TO.exit;
 function frontRow(z,kind){const Dc=Wd.Dc||8;if(z>118)return;const fa=1-fogK(z);
  // de dwarsstraat (met lantaarns, die de zijmuren daarna netjes afdekken)
  poly(gq(-60,60,z-Dc,z,0),fc(TO.road,z));poly(gq(-60,60,z-1.3,z,.02),fc(TO.walk,z));
  const lamps=()=>{deco({k:'lamp',X:-5.4},z-1.6);deco({k:'lamp',X:5.4},z-1.6)};
  if(kind==='park'){poly(fq(-60,60,0,.9,z),fc('#1b2a1e',z));for(let i=-9;i<=9;i++){const xx=i*4.2+flH(i+70)*1.5;if(Math.abs(xx)<2.4)continue;const c=P3(xx,4.2+flH(i+71)*1.4,z+1.5),r=(2.2+flH(i+72))*c.s;ctx.fillStyle=fc(i%2?'#13241a':'#18301f',z);ctx.beginPath();ctx.arc(c.x,c.y,r,0,7);ctx.fill();
    const tr=P3(xx,0,z+1.5);ctx.fillStyle=fc('#21170f',z);ctx.fillRect(tr.x-tr.s*.15,c.y,tr.s*.3,tr.y-c.y)}
   poly(fq(-1.6,1.6,0,.9,z),fc('#2a2a24',z));const lp=P3(0,3.2,z+3);ctx.fillStyle='#ffe2a0';ctx.fillRect(lp.x-lp.s*.12,lp.y-lp.s*.12,lp.s*.24,lp.s*.24);add(()=>{glow(lp.x,lp.y,lp.s*3,'40,220,110',.3*fa+.08);glow(lp.x,lp.y,lp.s*1.5,'255,210,140',.4*fa)});lamps();return}
  if(kind==='zijstraat'){poly(gq(-2.8,2.8,z,z+40,0),fc(TO.road,z+20));
   [-1,1].forEach(sd=>{poly(wq(sd*2.8,z+40,z,0,9),fc('#3a2a26',z+20));for(let k=0;k<6;k++)poly(wq(sd*2.8,z+2+k*5,z+3+k*5,.4,2.6),`rgba(255,214,160,${.4*fa})`)})}
  let x=-34,i=0;while(x<34){let w=4.6+flH(i+90)*2.2;if(kind==='zijstraat'&&x<-2.8&&x+w>-2.8-1.5)w=-2.8-x;const hh=kind==='portiek'?7+flH(i+91)*4:8+flH(i+91)*3.5,col=['#3a2621','#46322a','#2e2a2c','#55301f','#2e3442'][i%5];
   if(kind==='zijstraat'&&x>=-2.8&&x<2.8){x=2.8;i++;continue}
   const x1=x,x2=x+w;if(w<.5){x=x2;i++;continue}poly(fq(x1,x2,0,hh,z),fc(col,z));poly(fq(x1,x2,hh-.25,hh,z),'rgba(0,0,0,.3)');
   if(kind==='zijstraat'){poly(fq(x1+.2,x2-.2,.3,2.7,z),`rgba(255,214,160,${.5*fa+.08})`);poly(fq(x1,x2,2.75,3.25,z),fc(['#e0485f','#2fb5ad','#e8b931','#8f7ae0'][i%4],z))}
   for(let f=kind==='zijstraat'?1:0;;f++){const y=(kind==='zijstraat'?1.3:.7)+f*2.5;if(y+1.6>hh-.4)break;for(let c=0;c<2;c++){const xc=x1+w*(c+.5)/2;if(kind==='portiek'&&f===0&&Math.abs(xc)<1.6)continue;const r=flH(i*7+f*3+c+5);
     poly(fq(xc-.45,xc+.45,y,y+1.5,z),'#cfc6b4');poly(fq(xc-.38,xc+.38,y+.07,y+1.43,z),r<.35?litC(z,r):fc('#0d1117',z))}}
   x=x2;i++}
  if(kind==='portiek'){poly(fq(-1.1,1.1,0,2.8,z),fc('#2a1e18',z));poly(fq(-.85,.85,0,2.55,z),`rgba(255,196,120,${.75*fa+.15})`);const c=P3(0,1.3,z);add(()=>{glow(c.x,c.y,c.s*2.4,'255,190,110',.4*fa);glow(c.x,c.y,c.s*1.6,'40,220,110',.22)})}
  if(kind==='zijstraat'){const g=P3(0,2,z+12);add(()=>{glow(g.x,g.y,g.s*5,'255,205,150',.3*fa);glow(g.x,g.y,g.s*2.5,'40,220,110',.2)})}
  lamps()}
 function endWater(z){if(z>118)return;poly(gq(-60,60,z,z+140,-1.6),'#060b13');const fa=1-fogK(z);
  add(()=>{for(let k=0;k<10;k++){const zz=z+4+k*6,p=P3(-14+flH(k+30)*28,-1.6,zz);ctx.fillStyle=`rgba(255,150,60,${.12*fa})`;ctx.fillRect(p.x,p.y,p.s*2.5,Math.max(1,p.s*.05))}});
  poly(gq(-60,60,z-.25,z,.03),fc('#5a5248',z));
  // het bootje aan de kade (of je eigen boot): daar spring je in
  if(!(X.veh&&X.veh.k==='boot')&&z+3>near+.5){const b=P3(.4,-1.45,z+3);ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.s,b.s);
   lpoly([[-1.3,0],[1.3,0],[1.5,.55],[-1.5,.55]],'#2a3a44');rect(-1.5,.5,3,.08,'#c9ccd1');rect(-.5,.55,.9,.45,'#1a2230');rect(-.42,.62,.3,.25,'rgba(255,214,150,.7)');ctx.restore();
   add(()=>glow(b.x,b.y-b.s*.6,b.s*2.2,'40,220,110',.22))}}
 function endUitrit(z){if(z>118)return;const ce=TO.ceil,fa=1-fogK(z);
  const g=ctx.createLinearGradient(0,P3(0,ce,z).y,0,P3(0,0,z).y);g.addColorStop(0,'rgba(255,190,110,.9)');g.addColorStop(1,'rgba(255,150,70,.5)');ctx.fillStyle=g;ctx.beginPath();fq(-2.7,2.7,0,ce,z).forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.fill();
  poly(fq(-2.7,2.7,0,1.2,z+.01),'rgba(40,30,30,.55)');
  poly(fq(-60,-2.7,0,ce,z),fc('#3a3d42',z));poly(fq(2.7,60,0,ce,z),fc('#3a3d42',z));poly(fq(-2.7,2.7,3.2,ce,z),fc('#3a3d42',z));
  poly(fq(-2.7,-2.4,0,3.2,z),fc('#e0b520',z));poly(fq(2.4,2.7,0,3.2,z),fc('#e0b520',z));
  const s=P3(0,3.75,z),u=s.s;ctx.fillStyle='#16a34a';ctx.fillRect(s.x-u*.55,s.y-u*.22,u*1.1,u*.44);ctx.strokeStyle='#eafff1';ctx.lineWidth=Math.max(1,u*.05);ctx.beginPath();ctx.moveTo(s.x-u*.3,s.y);ctx.lineTo(s.x+u*.25,s.y);ctx.moveTo(s.x+u*.08,s.y-u*.13);ctx.lineTo(s.x+u*.25,s.y);ctx.lineTo(s.x+u*.08,s.y+u*.13);ctx.stroke();
  const c=P3(0,1.8,z);add(()=>glow(c.x,c.y,c.s*4,'255,170,90',.35*fa+.1))}
 // ---- decor naast de baan ----
 function bikeSide(col){ctx.strokeStyle='#121316';ctx.lineWidth=.05;ctx.beginPath();ctx.arc(-.34,-.34,.33,0,7);ctx.moveTo(.67,-.34);ctx.arc(.34,-.34,.33,0,7);ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=.05;ctx.beginPath();ctx.moveTo(-.34,-.34);ctx.lineTo(-.02,-.36);ctx.lineTo(.2,-.8);ctx.lineTo(-.14,-.8);ctx.lineTo(-.34,-.34);ctx.moveTo(-.02,-.36);ctx.lineTo(.34,-.34);ctx.lineTo(.22,-.88);ctx.stroke();rect(-.24,.8,.22,.05,'#111');rect(.1,.88,.3,.05,'#222')}
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,-y-h,w,h)};
 const circ=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,-y,r,0,Math.PI*2);ctx.fill()};
 const lpoly=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],-p[1]):ctx.moveTo(p[0],-p[1]));ctx.closePath();ctx.fill()};
 function deco(o,z){const s=P3(o.X,0,z);if(s.s<.8)return;const fa=1-fogK(z),a=z<-1?flClamp(1+(z+1)/2.5,0,1):1;if(a<=0)return;const sd=Math.sign(o.X)||1;
  ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
  if(o.k==='boom'){rect(-.09,0,.18,3.2,fc('#2a2019',z));ctx.restore();ctx.save();ctx.globalAlpha=a;[[.5,4.6,1.35],[-.1,4.2,.95],[1.1,4.3,1.0],[.6,5.5,1.0],[.1,5.2,.85]].forEach(([dx,y,r],i)=>{const c=P3(o.X+sd*dx,y,z);ctx.fillStyle=fc(i%2?'#16291b':'#1c3423',z);ctx.beginPath();ctx.arc(c.x,c.y,r*c.s,0,7);ctx.fill()});
   const lc=P3(o.X-sd*.1,3.9,z);ctx.fillStyle=`rgba(255,170,80,${.08*fa})`;ctx.beginPath();ctx.arc(lc.x,lc.y,.9*lc.s,0,7);ctx.fill();ctx.restore();return}
  if(o.k==='lamp'){const c0='#1c2420';rect(-.05,0,.1,4.3,c0);rect(-.11,0,.22,.45,c0);rect(-.17,4.25,.34,.1,c0);lpoly([[-.15,4.35],[.15,4.35],[.2,4.78],[-.2,4.78]],'#ffd08a');lpoly([[-.22,4.78],[.22,4.78],[0,4.98]],c0);ctx.restore();
   const c=P3(o.X,4.56,z);add(()=>glow(c.x,c.y,c.s*1.7,'255,160,70',.4*fa+.04));pool(o.X-sd*1.1,z,2.5,'255,140,50',.2*fa+.03);return}
  if(o.k==='fietsen'){for(let i=0;i<3+o.c%2;i++){ctx.save();ctx.translate(sd*.05,0);ctx.scale(.3,1);ctx.translate(i*.95-.9,0);bikeSide(['#2b2f36','#6b2a2a','#1f3a5a','#3a4a2a'][(i+o.c)%4]);ctx.restore()}ctx.restore();return}
  if(o.k==='bolder'){rect(-.12,0,.24,.48,'#1b1d22');rect(-.16,.44,.32,.1,'#2b2e34');ctx.restore();return}
  if(o.k==='afval'){rect(-.3,0,.6,.9,fc('#2b3d33',z));rect(-.33,.88,.66,.1,fc('#355046',z));ctx.restore();return}
  if(o.k==='bank'){rect(-.3,.4,.6,.08,'#5a4126');rect(-.3,.55,.6,.06,'#5a4126');rect(-.26,0,.05,.42,'#222');rect(.21,0,.05,.42,'#222');ctx.restore();return}
  if(o.k==='bak'){rect(-.3,0,.6,.55,'#3a3f46');circ(-.1,.75,.25,'#2d5a35');circ(.12,.8,.22,'#245030');ctx.restore();return}
  if(o.k==='mast'){rect(-.08,0,.16,9,'#2b2e34');rect(-.5,8.8,1,.2,'#2b2e34');ctx.restore();const c=P3(o.X,8.7,z);add(()=>glow(c.x,c.y,c.s*3,'255,150,60',.38*fa+.04));pool(o.X-sd*1.5,z,3.4,'255,140,50',.18*fa+.03);return}
  ctx.restore()}
 // ---- obstakels ----
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
  if(kind==='agent'){rect(-.17,1.79,.34,.1,'#16233f');rect(-.2,1.78,.4,.04,'#0e1830');rect(-.17,1.84,.34,.03,'#e6e6e6');circ(-.045,1.72,.018,'#1b1b1b');circ(.045,1.72,.018,'#1b1b1b')}
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
  scooter(o){rect(-.2,.06,.4,.42,'#20242a');lpoly([[-.32,.4],[.32,.4],[.26,.95],[-.26,.95]],'#b8242f');rect(-.2,.95,.4,.12,'#7d1820');rect(-.36,1.05,.72,.06,'#1a1a1a');circ(0,.14,.13,'#0b0b0b');rect(-.08,.7,.16,.1,'rgba(255,240,200,.85)')},
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
  bord(o){lpoly([[-.22,0],[.22,0],[.08,.66],[-.08,.66]],'#f2c230');lpoly([[-.15,.12],[.15,.12],[.07,.5],[-.07,.5]],'#e0a800');rect(-.025,.24,.05,.16,'#1b1d22')},
  paaltjes(o){[-.36,0,.36].forEach(x=>{rect(x-.07,0,.14,.66,'#5a1f1a');circ(x,.68,.08,'#5a1f1a');[.18,.36,.52].forEach(y=>rect(x-.075,y,.15,.04,'#e9e6df'))})},
  pionnen(o){[-.3,.3].forEach(x=>{lpoly([[x-.2,0],[x+.2,0],[x+.06,.7],[x-.06,.7]],'#ff6a1a');rect(x-.13,.25,.26,.08,'#f4f4f4');rect(x-.09,.47,.18,.07,'#f4f4f4')});rect(-.32,.42,.64,.05,'#f2c230')},
  touw(o){rect(-.5,0,1,.12,'#3a3530');ctx.strokeStyle='#c9a26a';ctx.lineWidth=.07;ctx.beginPath();ctx.ellipse(0,-.2,.42,.14,0,0,7);ctx.ellipse(0,-.3,.34,.1,0,0,7);ctx.stroke()},
  hond(o){const dd=o.dir||1,ph=t*16;ctx.save();ctx.scale(dd,1);const leg=(x,p)=>{const k=Math.sin(ph+p)*.05;rect(x+k,0,.06,.24,'#3b2a1e')};leg(-.24,0);leg(-.13,2.2);leg(.12,1.1);leg(.22,3.3);
   rect(-.3,.22,.58,.2,'#7a5432');rect(.22,.34,.2,.17,'#7a5432');rect(.38,.36,.11,.09,'#5a3d25');circ(.3,.46,.022,'#000');lpoly([[.24,.5],[.31,.5],[.27,.6]],'#4a321f');rect(-.02,.4,.2,.03,'#c0262f');ctx.restore()},
  hek(o){for(let x=-2.55;x<2.5;x+=1.7){ctx.strokeStyle='#8b929c';ctx.lineWidth=.045;ctx.beginPath();ctx.moveTo(x,-.12);ctx.lineTo(x,-.8);ctx.lineTo(x+1.55,-.8);ctx.lineTo(x+1.55,-.12);ctx.lineTo(x,-.12);for(let k=1;k<9;k++){ctx.moveTo(x+k*.172,-.12);ctx.lineTo(x+k*.172,-.8)}ctx.stroke();rect(x-.1,0,.3,.04,'#6b7078');rect(x+1.35,0,.3,.04,'#6b7078')}},
  lint(o){rect(-2.7,0,.08,.98,'#c9d1da');rect(2.62,0,.08,.98,'#c9d1da');for(let i=0;i<14;i++)rect(-2.62+i*.38,.82,.38,.1,i%2?'#f4f4f4':'#e0313f')},
  steiger(o){[-2.68,-.9,.9,2.6].forEach(x=>rect(x,0,.08,2.3,'#8b929c'));rect(-2.75,1.18,5.5,.1,'#9aa1ab');rect(-2.75,2.1,5.5,.08,'#8b929c');rect(-2.75,1.28,5.5,.16,'#7d5c37');for(let i=0;i<15;i++)rect(-2.75+i*.367,1.06,.367,.1,i%2?'#f4f4f4':'#e0313f')},
  rolluik(o){rect(-2.75,1.12,5.5,1.38,'#4a515c');for(let y=1.18;y<2.5;y+=.12)rect(-2.75,y,5.5,.03,'rgba(0,0,0,.35)');for(let i=0;i<14;i++)rect(-2.75+i*.393,1.06,.393,.1,i%2?'#1b1d22':'#f2c230');rect(-2.8,0,.1,2.5,'#2b2f36');rect(2.7,0,.1,2.5,'#2b2f36');
   const on=Math.floor(t*4)%2;circ(-2.4,2.3,.07,on?'#ff8a1a':'#5a2a10');circ(2.4,2.3,.07,on?'#5a2a10':'#ff8a1a')},
  slagboom(o){rect(-2.8,0,.24,1.15,'#c9ccd1');rect(-2.84,1.05,.32,.25,'#2b2e34');for(let i=0;i<14;i++)rect(-2.6+i*.38,1.1,.38,.14,i%2?'#f4f4f4':'#e0313f');circ(-2.68,1.4,.06,Math.floor(t*4)%2?'#ff3d52':'#5a1a20')}};
 const VEH={moto(){rect(-.06,0,.12,.55,'#111');rect(-.34,.45,.68,.4,'#c0262f');rect(-.3,.85,.6,.08,'#1a1a1a');rect(-.38,.95,.76,.05,'#888');rect(-.1,.55,.2,.12,'rgba(255,240,200,.9)');add(()=>glow(0,-.6,1.2,'255,230,170',.3))},
  auto(){rect(-.95,.15,1.9,.7,'#5a5f66');lpoly([[-.8,.85],[.8,.85],[.62,1.35],[-.62,1.35]],'#4a4f56');lpoly([[-.7,.9],[.7,.9],[.55,1.28],[-.55,1.28]],'#141a24');rect(-.88,.5,.32,.14,'#ff3d52');rect(.56,.5,.32,.14,'#ff3d52');rect(-.9,0,.4,.18,'#0b0b0b');rect(.5,0,.4,.18,'#0b0b0b');add(()=>{glow(-.72,-.57,.6,'255,61,82',.4);glow(.72,-.57,.6,'255,61,82',.4)})},
  boot(){lpoly([[-1.1,.1],[1.1,.1],[.9,.6],[-1.2,.6]],'#e9ecef');rect(-.6,.6,.9,.4,'#1a2230');rect(-1.2,.55,2.3,.06,'#c0262f');add(()=>glow(0,-.3,1.4,'120,190,255',.2))},
  heli(){const yy=4.2;rect(-.9,yy,1.8,.75,'#1a1d22');lpoly([[.9,yy+.2],[2.4,yy+.45],[2.4,yy+.6],[.9,yy+.6]],'#1a1d22');rect(-1.6,yy+.95,3.2,.05,'#555');rect(-.05,yy+.75,.1,.2,'#333');rect(-.6,yy+.25,.6,.35,'rgba(169,220,255,.5)');
   add(()=>{const g=ctx.createLinearGradient(0,-yy,0,0);g.addColorStop(0,'rgba(255,250,220,.35)');g.addColorStop(1,'rgba(255,250,220,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-.2,-yy);ctx.lineTo(.2,-yy);ctx.lineTo(1.3,0);ctx.lineTo(-1.3,0);ctx.fill()})}};
 // markering op lage/hoge versperringen: pijltjes (geel = springen, blauw = bukken)
 function chev(o,z,a){const up=!o.high,c=P3(0,up?1.25:o.h+.35,z),u=Math.max(5,c.s*.16);ctx.save();ctx.globalAlpha=a*.95;ctx.strokeStyle=up?'#f2c230':'#7aa2ff';ctx.lineWidth=Math.max(2,u*.35);ctx.lineCap='round';ctx.lineJoin='round';
  for(const dx of [-1.6,1.6]){const x=c.x+dx*c.s;ctx.beginPath();if(up){ctx.moveTo(x-u,c.y+u*.5);ctx.lineTo(x,c.y-u*.5);ctx.lineTo(x+u,c.y+u*.5)}else{ctx.moveTo(x-u,c.y-u*.5);ctx.lineTo(x,c.y+u*.5);ctx.lineTo(x+u,c.y-u*.5)}ctx.stroke()}ctx.restore()}
 function drawOb(o,z){const s=P3(o.x*FLN,0,z);if(s.s<1.2)return;
  let a=1;if(z>C.reveal-8)a=flClamp((C.reveal-z)/8,0,1);if(z<0)a=Math.max(0,1+z/(o.hit?1:1.4));if(a<=0)return;
  ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(0,0,(o.w*FLN)*.5+.05,.09,0,0,7);ctx.fill();
  if(o.hit)ctx.rotate((o.x>=C.px?1:-1)*Math.min(.9,(t-o.hitT)*5));
  (DRAW[o.t]||DRAW.kliko)(o);ctx.restore();
  if(((o.low&&o.w>3)||o.high)&&z>2&&z<C.reveal)chev(o,z,a)}
 // jij
 const puffs=[];
 function drawMe(st_){const h=C.jumpH(),sl=C.slideH(),z=st_.meZ,s=P3(C.px*FLN,0,z);const stum=t-st_.stT<.5,lean=(C.lane-C.px)*.3+(stum&&!reduce?Math.sin(t*30)*.1:0);
  // tegenlicht (de zaklamp van de agent), zodat ook zwarte kleren loskomen van een donkere straat
  if(!C.done||!C.res){const c=P3(C.px*FLN,1.2+h-sl*.4,z);glow(c.x,c.y,c.s*1.25,'200,215,240',.13)}
  ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);
  ctx.fillStyle=`rgba(0,0,0,${.5-h*.25})`;ctx.beginPath();ctx.ellipse(0,0,.34-h*.1+sl*.1,.08,0,0,7);ctx.fill();
  ctx.translate(0,-h*1.0);ctx.scale(1,-1);
  flDrawRunner(ctx,LK,{ph:C.started?C.dist*1.7:0,stand:!C.started,air:C.jumpT>=0?1:0,duck:sl,lean,hurt:stum||(C.done&&C.res===false)});
  ctx.restore();
  if(!reduce&&C.started&&!C.done&&C.stam<.35&&Math.random()<.12)puffs.push({x:C.px*FLN+(Math.random()-.5)*.2,y:1.9-sl*.5,z:z+.2,a:.5,r:.08});
  for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.y+=.012;p.r+=.006;p.a-=.012;if(p.a<=0){puffs.splice(i,1);continue}const c=P3(p.x,p.y,p.z);ctx.fillStyle=`rgba(230,236,245,${p.a})`;ctx.beginPath();ctx.arc(c.x,c.y,p.r*c.s,0,7);ctx.fill()}}
 // de agent achter je: altijd links achter je (nooit over je heen), komt dichterbij als de afstand kleiner wordt
 function copZ(){const g=C.gap;return g>7.5||!C.started?null:-flClamp(.7+g*.42,.7,3.8)}
 function drawCop(z){const g=C.gap,x=C.px*FLN-1.05+Math.sin(t*2.3)*.08,s=P3(x,0,z);
  const ph=t*11,a=flClamp((7.5-g)/2,0,1);ctx.save();ctx.globalAlpha=a;ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);ctx.translate(0,-Math.abs(Math.sin(ph))*.05);
  const l1=Math.max(0,Math.sin(ph))*.3,l2=Math.max(0,-Math.sin(ph))*.3;
  rect(-.21,l1,.18,.88,'#141d33');rect(.03,l2,.18,.88,'#141d33');rect(-.3,.84,.6,.76,'#1a2744');
  rect(-.3,1.05,.6,.12,'#f2d22e');rect(-.3,1.17,.6,.08,'#2a5bd7');rect(-.3,1.25,.6,.08,'#f2d22e');
  const reach=g<3?.3:0;rect(-.46,1.0+Math.sin(ph)*.12,.15,.58,'#1a2744');rect(.31,1.0-Math.sin(ph)*.12+reach,.15,.58,'#1a2744');
  rect(-.07,1.58,.14,.1,'#c99b7a');circ(0,1.8,.16,'#2a1e16');rect(-.2,1.86,.4,.12,'#16233f');rect(-.22,1.86,.44,.04,'#e6e6e6');
  ctx.restore();
  const c=P3(x,1.42,z);if(c.s*.13>6&&c.y<H-c.s*.2){ctx.globalAlpha=a;ctx.fillStyle='#e9eef8';ctx.font=`800 ${c.s*.12}px system-ui,sans-serif`;ctx.textAlign='center';ctx.fillText('POLITIE',c.x,c.y);ctx.globalAlpha=1}}
 // regen, zwaailicht, vignet
 const drops=Array.from({length:TO.rain?80:0},()=>({x:Math.random(),y:Math.random(),l:.4+Math.random()*.6,s:.8+Math.random()*.6}));let vig=null,vigK='';
 function overlays(st_){const outside=!X.inn||C.dist>X.doorZ-3;
  if(drops.length&&outside&&!reduce){ctx.strokeStyle='rgba(190,205,230,.14)';ctx.lineWidth=1;ctx.beginPath();const sp=C.v/12;drops.forEach(o=>{const y=((o.y+t*o.s*(1.1+sp*.4))%1)*H,x=((o.x+t*.05)%1)*W,l=14*o.l*(1+sp*.3);ctx.moveTo(x,y);ctx.lineTo(x-l*.25,y+l)});ctx.stroke()}
  const close=C.done&&C.res===false?1:flClamp(1-C.gap/(P.G0+2),0,1),k=.08+.36*close,ph=reduce?0:Math.floor(t*(4+close*5))%2;
  const r1=ph?'255,61,82':'77,125,255',r2=ph?'77,125,255':'255,61,82';glow(0,H,H*(.45+close*.35),r1,k);glow(W,H,H*(.45+close*.35),r2,k);
  if(X.alarm&&!outside&&!reduce){ctx.fillStyle=`rgba(255,40,60,${.05+.06*Math.max(0,Math.sin(t*4))})`;ctx.fillRect(0,0,W,H)}
  if(C.stam<.35&&C.started&&!C.done){const p=reduce?.5:.5+.5*Math.sin(t*(6+(1-C.stam)*4));ctx.fillStyle=`rgba(80,0,10,${(.35-C.stam)*.5*p})`;ctx.fillRect(0,0,W,H)}
  const vk=W+'x'+H;if(vk!==vigK){vigK=vk;vig=ctx.createRadialGradient(cx,H*.55,Math.min(W,H)*.35,cx,H*.55,Math.max(W,H)*.8);vig.addColorStop(0,'rgba(0,0,0,0)');vig.addColorStop(1,'rgba(0,0,0,.5)')}ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
  if(C.done&&C.res){const a=Math.min(1,(t-st_.doneT)/1.2);add(()=>glow(cx,hy+(H-hy)*.35,Math.max(W,H)*(.5+a*.5),TO.amb||'255,170,90',a*.25))}
  if(C.done&&!C.res){ctx.fillStyle=`rgba(5,6,8,${Math.min(.5,(t-st_.doneT)*.8)})`;ctx.fillRect(0,0,W,H)}}
 // ---- het hele beeld ----
 function draw(tt,st_){t=tt;
  // camerahoogte: buiten hoger (je ziet over je hoofd heen), binnen en in de garage lager; soepel bij de deur
  const roofOut=!!TO.roof,inK=X.inn?flClamp((X.doorZ-C.dist+CB*.6)/(CB*.9),0,1):0,chOut=roofOut?FLA.CHi:FLA.CHo;CH=chOut+(FLA.CHi-chOut)*inK;
  hy=Math.max(H*.1,H*.88-CH*F/CB);
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);camX+=((C.px*FLN*.35)-camX)*.2;
  if(st_.shake>0&&!reduce)ctx.translate((Math.random()-.5)*st_.shake*14,(Math.random()-.5)*st_.shake*10);
  const ez=C.len-C.dist,far=Math.min(TO.roof?72:118,ez+(TO.end==='brug'?120:Wd.Dc?Wd.Dc+2:TO.end==='water'?140:4)),dz=X.inn?X.doorZ-C.dist:-999,za=Math.max(near,dz);fogC=TO.fog;
  // alles wat op of naast de baan staat, op diepte
  const sp=[];
  for(const r of C.rows){const z=r.z-C.dist;if(z>110)break;if(z<-1.5)continue;r.obs.forEach(o=>sp.push([z,0,o]))}
  for(const o of Wd.deco){const z=o.z-C.dist;if(z>far||z>110)break;if(z<-CB+1)continue;sp.push([z,1,o])}
  sp.push([st_.meZ,2]);const cz=copZ();if(cz!=null)sp.push([cz,3]);
  if(X.veh&&ez<110)sp.push([ez+2.6,4]);
  sp.sort((a,b)=>b[0]-a[0]);
  const spr=e=>{if(e[1]===1&&e[0]<dz)return;if(e[1]===0)drawOb(e[2],e[0]);else if(e[1]===1)deco(e[2],e[0]);else if(e[1]===2)drawMe(st_);else if(e[1]===3)drawCop(e[0]);else vehicle(e[0])};
  if(far>za){sky();
   const zEnd=TO.end==='brug'?far:TO.end==='water'?ez+.01:TO.end==='uitrit'?Math.min(far,ez+1.5):Math.min(far,ez);
   if(TO.end==='portiek'||TO.end==='zijstraat'||TO.end==='park')frontRow(ez+Wd.Dc,TO.end);
   if(TO.end==='water')endWater(ez);
   if(TO.end==='uitrit')endUitrit(ez+1.5);
   floor(TO,za,zEnd,false);
   for(const b of Wd.br){const z=b-C.dist;if(z+7<za||z-2>far)continue;poly(gq(-FW-40,-FW,Math.max(za,z-2),z+7,0),fc(TO.road,z))}
   const zs=Math.min(far,TO.end==='brug'?far:ez);
   if(TO.R==='gracht')gracht(za,far);if(TO.R==='kade')kade(za,TO.end==='water'?ez:far);
   if(TO.L==='garage')garage(za,Math.min(far,ez));
   sideList(Wd.L,-FW,-1,za,zs);sideList(Wd.R,FW,1,za,zs);
   if(Wd.lights)lightStrings(za,zs);
   if(TO.end==='brug'&&ez<far){const c=P3(FW-.6,2.4,ez+1.6);if(ez+1.6>near)exitSign(c,1)}
   if(ez<far&&ez>near)pool(0,ez+1,2.2,'40,220,110',.14);
   sp.filter(e=>e[0]>=dz).forEach(spr)}
  if(X.inn&&dz>near){const zb=Math.min(dz,far);if(!(far>za)){ctx.fillStyle='#08090b';ctx.fillRect(0,0,W,H)}
   floor(TI,near,zb,true);ceiling(near,zb);binnen(X.inn,-1,near,zb);binnen(X.inn,1,near,zb);doorWall(dz);
   sp.filter(e=>e[0]<dz).forEach(spr)}
  overlays(st_)}
 function lightStrings(za,zb){for(const z0 of Wd.lights){const z=z0-C.dist;if(z<near+1||z>zb)continue;const fa=1-fogK(z),pts=[];for(let i=0;i<=10;i++){const xx=-FW+2*FW*i/10;pts.push(P3(xx,6.4-Math.sin(Math.PI*i/10)*.5,z))}
   ctx.strokeStyle=fc('#2a2420',z);ctx.lineWidth=1;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
   add(()=>pts.forEach((p,i)=>{if(i===0||i===10)return;ctx.fillStyle=`rgba(255,${200+(i%3)*20},140,${.8*fa+.1})`;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(1,p.s*.05),0,7);ctx.fill();glow(p.x,p.y,p.s*.3,'255,200,120',.25*fa)}))}}
 function exitSign(c,dir){const u=c.s;ctx.fillStyle='#2b2e34';ctx.fillRect(c.x-u*.04,c.y,u*.08,u*2.4);ctx.fillStyle='#16a34a';ctx.fillRect(c.x-u*.4,c.y-u*.2,u*.8,u*.4);ctx.strokeStyle='#eafff1';ctx.lineWidth=Math.max(1,u*.05);ctx.beginPath();ctx.moveTo(c.x-u*.22*dir,c.y);ctx.lineTo(c.x+u*.2*dir,c.y);ctx.moveTo(c.x+u*.06*dir,c.y-u*.12);ctx.lineTo(c.x+u*.2*dir,c.y);ctx.lineTo(c.x+u*.06*dir,c.y+u*.12);ctx.stroke();
  add(()=>glow(c.x,c.y,u*1.4,'40,220,110',.35))}
 function vehicle(z){if(z<near+.5)return;const k=X.veh.k;let x=0,y=0;if(k==='boot'){if(TO.R==='gracht'){x=FW+2.2;y=WY+.1}else if(TO.end==='water'){y=-1.5;z+=2}else return}
  const s=P3(x,y,z);ctx.save();ctx.translate(s.x,s.y);ctx.scale(s.s,s.s);VEH[k]();ctx.restore()}
 fit();
 return {fit,draw,exitName:exN}}
