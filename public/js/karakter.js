// Karakter: je eigen uiterlijk (huid, kapsel, haarkleur, ogen, uitstraling, mond, baard) en één keer een gratis startoutfit.
// Eén component voor het klikspel en de Pixelstad (die laadt dezelfde bestanden). Tekent je op drie manieren:
//  KAR.face(look,mood,cv)  pixelportret 48×48, Pixelstad-stijl (stad-face.js gebruikt dit ook als K.face voor iedereen)
//  KAR.dollHead(ch,o)      hoofd, haar en gezicht op de etalagepop uit look.js (klikspel-stijl, SVG)
//  karBust(o)              borstbeeld (de pop, ingezoomd) voor profiel, menu en dossier
// In de Pixelstad: het 3D-poppetje (stad-avatar.js) leest karGet(); in de maker draait het mee als voorbeeld.
// Opslag: S.char = {skin,hs,hc,eye,mood,mouth,fh} (alleen waarden uit KAR_OPT), S.charDone = tijdstip van de eerste keer opslaan,
// S.charStart = gekozen startoutfit (id uit START_FITS, 'eigen' of 'set:<stijl>'), S.charAsk = hoe vaak een bestaande speler 'Later' koos.
// Wanneer: nieuw account meteen (vóór de rondleiding, tour.js wacht via karPending); bestaand account één keer per sessie,
// hooguit KAR_ASK keer 'Later'. Daarna altijd via profiel, outfit en de Pixelstad-telefoon (Instellingen, Uiterlijk aanpassen).
(function(){
'use strict';
const KAR_OPT={
 skin:[['#f8dcc4','Heel licht'],['#f1caa5','Licht'],['#e9b98f','Lichtbruin'],['#d9a27a','Getint'],['#b97a52','Bruin'],['#8d5a3a','Donkerbruin'],['#6e4630','Donker'],['#4a2e20','Heel donker']],
 hs:[['kort','Kort'],['kuif','Kuif'],['opgeschoren','Geschoren'],['lang','Lang'],['krul','Krullen'],['afro','Afro'],['knot','Knot'],['kaal','Kaal']],
 hc:[['#16161a','Zwart'],['#2a1d14','Donkerbruin'],['#5a3a22','Bruin'],['#8a5a2a','Lichtbruin'],['#d4ac5a','Blond'],['#a8461e','Rood'],['#8e8c88','Grijs'],['#e4dfd4','Wit']],
 mood:[['blij','Vrolijk'],['neutraal','Rustig'],['koel','Koel'],['boos','Boos']],
 eye:[['#5a3a22','Bruin'],['#24160e','Donker'],['#8a6a2a','Hazel'],['#3d7a42','Groen'],['#3f6fb8','Blauw'],['#7d8b97','Grijs']],
 mouth:[['normaal','Gewoon'],['breed','Breed'],['smal','Smal'],['vol','Vol']],
 fh:[['','Geen'],['stoppel','Stoppels'],['snor','Snor'],['sik','Sik'],['ringbaard','Ringbaard'],['baard','Baard']]};
const KAR_DEF={skin:'#d9a27a',hs:'kort',hc:'#2a1d14',eye:'#5a3a22',mood:'neutraal',mouth:'normaal',fh:''};
const KAR_ASK=3;
const KEYS=Object.keys(KAR_DEF);
// alleen bekende waarden (de kleuren gaan rechtstreeks in SVG en canvas)
function san(c){const o={};c=c&&typeof c==='object'?c:{};KEYS.forEach(k=>{const v=c[k];o[k]=KAR_OPT[k].some(x=>x[0]===v)?v:KAR_DEF[k]});return o}
const karGet=()=>san(typeof S!=='undefined'&&S?S.char:null);
const shade=(h,k)=>{const n=parseInt(String(h).slice(1),16);if(!Number.isFinite(n))return h;const r=Math.min(255,(n>>16&255)*k|0),g=Math.min(255,(n>>8&255)*k|0),b=Math.min(255,(n&255)*k|0);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)};
const mix=(a,b,t)=>{const p=x=>{const n=parseInt(String(x).slice(1),16);return [n>>16&255,n>>8&255,n&255]},A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const light=c=>parseInt(String(c).slice(1,3),16)>150;
const isStad=()=>!!(document.body&&document.body.classList.contains('stad'));

/* ---------- pixelportret 48×48 (Pixelstad-stijl) ---------- */
// look = het uiterlijk van een poppetje (skin, hair, top, hat, hatC …) plus, alleen voor het portret:
//   hs  kapsel: kort | kuif | zij | opgeschoren | lang | bob | knot | staart | krul | afro | kalend | kaal | hanenkam | vlecht
//   fh  gezichtshaar: stoppel | snor | sik | ringbaard | baard          col kleding: shirt | pak | hoodie | uniform | schort |
//   fw  breedte van het gezicht (16, 18, 20), jaw: rond | hoekig | spits     leer | tank | trui | blouse | track | werk
//   age 0 jong, 1 midden, 2 oud · eye oogkleur · lip lippenstift · v vrouw (wimpers) · w breedte schouders
//   mouth normaal | breed | smal | vol (karakter) · mood (standaard als er geen stemming wordt meegegeven)
//   acc {bril, zon, oor, lit, spr, mv, tat, kop, tand, pl, hb (zweetband, kleur)}
// mood: neutraal | blij | boos | bang | koel
function face(look,mood,cv){cv=cv||document.createElement('canvas');cv.width=cv.height=48;const c=cv.getContext('2d'),L=look||{},A=L.acc||{};
  if(mood==null)mood=L.mood||null;
  const R=(x,y,w,h,col)=>{if(w<=0||h<=0)return;c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
  const sk=L.skin||'#d9a27a',skD=shade(sk,.84),skDD=shade(sk,.64),skL=shade(sk,1.1);
  const top=L.top||'#30353e',topD=shade(top,.7),topL=shade(top,1.3);
  let hat=L.hat||'none',hs=L.hs||(L.long?'lang':'kort');if(hat==='bald'){hat='none';hs='kaal'}
  const hair=L.hair||'#2a1d14',hairD=shade(hair,.66),hairL=shade(hair,1.45);
  const hc=L.hatC||'#2a2c30',hcD=shade(hc,.66),hcL=shade(hc,1.35),bg=L.bg||'#1a1d23';
  const fw=L.fw||18,hw=fw>>1,x0=24-hw,y0=12,fh=22,ey=y0+10,my=y0+17,exL=18,exR=27;
  const jaw={rond:[0,0,1,1,2,4],hoekig:[0,0,0,0,1,2],spits:[0,1,2,3,4,6]}[L.jaw]||[0,0,1,1,2,4];
  const half=y=>hw-(y<2?[2,1][y]:y>=fh-6?jaw[Math.min(5,y-(fh-6))]:0);
  const covered=hat==='hijab'||hat==='hood'||hat==='mask';
  /* achtergrond */
  R(0,0,48,48,bg);R(4,3,40,38,shade(bg,1.22));R(8,6,32,30,shade(bg,1.4));R(0,0,48,1,shade(bg,1.7));R(0,46,48,2,shade(bg,.6));
  /* haar en kap achter het hoofd */
  if(hat==='hijab'){R(x0-3,y0-2,fw+6,27,hcD);R(x0-1,y0-4,fw+2,3,hcD)}
  else if(hat==='hood'){R(x0-4,y0-3,fw+8,27,topD);R(x0-2,y0-5,fw+4,3,topD)}
  else if(hat!=='mask'){
    if(hs==='lang'||hs==='vlecht')R(x0-2,y0+1,fw+4,27,hairD);
    else if(hs==='bob')R(x0-2,y0+1,fw+4,17,hairD);
    else if(hs==='krul'){R(x0-3,y0,fw+6,17,hairD);for(let i=0;i<6;i++)R(x0-4+(i%2)*(fw+5),y0+2+i*3,3,3,hair)}
    else if(hs==='afro'&&hat==='none'){const ry=13,rx=hw+6;for(let y=-ry;y<=11;y++){const w=Math.round(Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))*rx);R(24-w,y0+6+y,w*2,1,y%3?hair:hairD)}R(17,y0-5,5,1,hairL);R(15,y0-3,3,1,hairL)}
    else if(hs==='afro'){R(x0-4,y0+1,fw+8,15,hairD);for(let i=0;i<5;i++)R(x0-5+(i%2)*(fw+7),y0+2+i*3,3,3,hair)}
    else if(hs==='staart'){R(x0+fw,y0+4,3,10,hairD);R(x0+fw+1,y0+13,3,7,hairD);R(x0+fw,y0+3,2,2,L.hatC||'#c0261e')}}
  /* romp */
  const sh=Math.round(17*(L.w||1)),col=L.col||(L.tie?'pak':'shirt');
  const body=cc=>{R(24-sh+3,37,sh*2-6,1,cc);R(24-sh+1,38,sh*2-2,1,cc);R(24-sh,39,sh*2,9,cc)};
  if(col==='tank'){body(sk);R(24+sh-4,39,4,9,skD);R(17,39,14,9,top);R(27,39,4,9,topD);R(18,37,3,2,top);R(27,37,3,2,topD)}
  else{body(top);R(24+sh-5,39,5,9,topD);R(24-sh+3,37,sh*2-6,1,topL)}
  /* nek */
  R(20,31,8,7,skD);R(20,33,8,1,skDD);
  if(col==='shirt'||col==='werk'){R(20,37,8,1,skD);R(21,38,6,1,skD);R(22,39,4,1,skD);R(19,37,1,2,topL);R(28,37,1,2,topL)}
  else if(col==='pak'){R(20,37,8,11,'#f1efe9');R(18,37,3,11,topD);R(27,37,3,11,topD);R(19,37,2,2,topL);R(27,37,2,2,topL);const ti=L.tie||'#7a1f2a';R(22,38,4,2,ti);R(23,40,2,8,ti);R(24,40,1,8,shade(ti,.75));R(30,42,3,1,'#f1efe9')}
  else if(col==='hoodie'){R(18,36,12,2,topD);R(21,37,6,1,skD);R(22,38,4,1,skD);R(21,40,1,5,'#e8e4da');R(26,40,1,5,'#e8e4da');R(18,45,12,1,topD)}
  else if(col==='uniform'){R(19,36,10,2,topL);R(22,37,4,2,'#f1efe9');R(24-sh+1,38,5,2,'#c9a227');R(24+sh-6,38,5,2,'#c9a227');R(28,41,3,4,'#e8b923');R(29,42,1,2,'#fff3c8');R(15,40,3,5,'#0e0f12');R(16,39,1,1,'#0e0f12');R(18,42,5,1,'#e8e4da');R(24-sh,46,sh*2,1,'#d8d4cc')}
  else if(col==='schort'){R(21,37,6,2,skD);R(18,40,12,8,'#f1efe9');R(18,37,2,3,'#f1efe9');R(28,37,2,3,'#f1efe9');R(18,40,12,1,'#d2cdc2');R(27,41,3,7,'#dcd7cc')}
  else if(col==='leer'){R(21,37,6,4,'#e8e4da');R(18,37,3,5,topL);R(27,37,3,5,topL);R(24,41,1,7,'#9aa1ab');R(24-sh+2,40,1,8,topL)}
  else if(col==='trui'){R(19,34,10,4,top);R(19,34,10,1,topL);R(27,35,2,3,topD);for(let x=24-sh+2;x<24+sh-2;x+=4)R(x,44,2,1,topL)}
  else if(col==='blouse'){R(20,37,8,1,skD);R(21,38,6,1,skD);R(22,39,4,1,skD);R(23,40,2,1,skD);R(19,37,1,3,topL);R(28,37,1,3,topL)}
  else if(col==='track'){R(19,36,10,2,top);R(19,36,10,1,topL);R(23,38,1,10,'#f1efe9');R(24-sh,40,2,8,'#f1efe9');R(24+sh-2,40,2,8,'#f1efe9')}
  if(col==='werk'){R(24-sh,43,sh*2,2,'#e8e4da');R(24-sh,43,sh*2,1,'#f2c230')}
  if(L.chain){R(20,38,1,2,'#e8b923');R(27,38,1,2,'#e8b923');R(21,40,6,1,'#e8b923');R(23,41,2,2,'#ffd35a')}
  if(A.tat)R(21,34,3,3,'#24465a'),R(22,35,1,1,'#4a7a9a');
  /* hoofd */
  for(let y=0;y<fh;y++){const h=half(y);R(24-h,y0+y,h*2,1,sk);R(24+h-2,y0+y,2,1,skD)}
  R(24-half(1)+2,y0+1,4,1,skL);
  if(!covered&&!['lang','bob','afro','krul'].includes(hs)){R(x0-1,ey-1,1,5,skD);R(x0+fw,ey-1,1,5,skDD);if(A.oor)R(x0-1,ey+4,1,2,'#e8b923');if(A.oor===2)R(x0+fw,ey+4,1,2,'#e8b923')}
  /* leeftijd, sproeten, littekens */
  if(L.age>=1){R(19,my-2,1,L.age,skD);R(28,my-2,1,L.age,skD)}
  if(L.age>=2){R(exL,ey+3,2,1,skD);R(exR+1,ey+3,2,1,skD);R(20,y0+4,3,1,skD);R(25,y0+4,3,1,skD);R(exL-1,ey+2,1,1,skD);R(exR+3,ey+2,1,1,skD)}
  if(A.spr){[[x0+3,ey+3],[x0+5,ey+4],[x0+fw-4,ey+3],[x0+fw-6,ey+4],[23,ey+2]].forEach(p=>R(p[0],p[1],1,1,skDD))}
  if(A.mv)R(x0+4,my-1,1,1,'#3a2418');
  if(A.pl){R(x0+2,ey+4,4,2,'#e8d8b8');R(x0+3,ey+4,2,2,'#d8c4a0')}
  /* ogen en wenkbrauwen */
  const iris=L.eye||'#3a2a1a',white='#f4f1ea',dark='#101114',browC=shade(hair,parseInt(hair.slice(1,3),16)>170?.55:.85),bw=L.brow===2?2:1;
  const eye=x=>{if(mood==='bang'){R(x,ey-1,3,3,white);R(x+1,ey,1,1,dark)}
    else if(mood==='boos'){R(x,ey,3,1,white);R(x+1,ey,1,1,dark);R(x,ey-1,3,1,skDD)}
    else if(mood==='blij'){R(x,ey,3,1,white);R(x+1,ey,1,1,iris);R(x,ey-1,3,1,skDD);R(x,ey+1,3,1,skD)}
    else if(mood==='koel'){R(x,ey-1,3,1,skD);R(x,ey,3,1,skDD);R(x,ey+1,3,1,white);R(x+1,ey+1,1,1,iris)}
    else{R(x,ey,3,2,white);R(x+1,ey,1,2,iris);R(x+1,ey+1,1,1,dark);R(x,ey-1,3,1,skDD)}};
  eye(exL);eye(exR);if(L.v){R(exL-1,ey-1,1,1,dark);R(exR+3,ey-1,1,1,dark)}
  if(mood==='boos'){R(exL,ey-4,2,bw,browC);R(exL+1,ey-3,2,bw,browC);R(exR+1,ey-4,2,bw,browC);R(exR,ey-3,2,bw,browC)}
  else if(mood==='bang'){R(exL,ey-4,1,1,browC);R(exL+1,ey-5,2,1,browC);R(exR,ey-5,2,1,browC);R(exR+2,ey-4,1,1,browC)}
  else if(mood==='blij'){R(exL,ey-4-(bw-1),3,bw,browC);R(exR,ey-4-(bw-1),3,bw,browC)}
  else if(mood==='koel'){R(exL,ey-3,3,bw,browC);R(exR,ey-4,3,bw,browC);R(exR+2,ey-3,1,1,browC)}
  else{R(exL,ey-3-(bw-1),3,bw,browC);R(exR,ey-3-(bw-1),3,bw,browC)}
  if(A.lit){const sc=shade(sk,1.25);R(exR+3,ey-5,1,4,sc);R(exR+3,ey+2,1,3,sc);R(exR+4,ey+3,1,2,sc)}
  if(A.tat===2)R(exL-1,ey+3,1,2,'#1f3a4a');
  /* neus en mond (mouth: breedte en volle lippen) */
  R(24,ey+1,1,3,skD);const nw=L.nose==='breed'?4:2;R(24-(nw>>1),ey+4,nw,1,skDD);if(L.nose==='lang')R(24,ey,1,1,skD);
  const mw={breed:8,smal:4}[L.mouth]||6,mx=24-mw/2,vol=L.mouth==='vol';
  const lip=L.lip||shade(sk,.6),low=L.lip?shade(L.lip,.82):skD,lipV=shade(sk,.74);
  const mouth=()=>{if(mood==='blij'){R(mx,my,mw,1,'#3a1512');R(mx+1,my,mw-2,1,white);R(mx-1,my-1,1,1,lip);R(mx+mw,my-1,1,1,lip);R(mx+1,my+1,mw-2,1,lip);if(vol){R(mx,my+1,mw,1,lipV);R(mx+1,my+2,mw-2,1,skD)}if(A.tand)R(24,my,1,1,'#e8b923')}
    else if(mood==='boos'){R(mx,my,mw,1,'#3a1512');R(mx-1,my+1,1,1,lip);R(mx+mw,my+1,1,1,lip);if(vol)R(mx+1,my+1,mw-2,1,lipV)}
    else if(mood==='bang'){R(22,my-1,4,3,'#3a1512');R(23,my+1,2,1,'#8a3a36')}
    else if(mood==='koel'){R(mx,my,mw,1,lip);R(mx+mw,my-1,1,1,lip);R(mx+1,my+1,mw-3,1,vol?lipV:low)}
    else{if(vol)R(mx+1,my-1,mw-2,1,lipV);R(mx,my,mw,1,lip);R(mx+1,my+1,mw-2,1,vol?lipV:low);if(vol)R(mx+1,my+2,mw-2,1,skD)}};
  mouth();if(L.v&&mood==='blij'){c.globalAlpha=.45;R(x0+2,ey+4,2,1,'#e87a6a');R(x0+fw-4,ey+4,2,1,'#e87a6a');c.globalAlpha=1}
  /* gezichtshaar */
  const fhh=hat==='mask'?'':(L.fh!=null?L.fh:(L.beard?'baard':''));
  if(fhh==='stoppel'){c.globalAlpha=.34;for(let y=my-3;y<y0+fh;y++){const h=half(y-y0);for(let x=24-h;x<24+h;x++)if((x+y)%2===0&&!(y>=my-1&&y<=my+1&&x>=mx&&x<mx+mw))R(x,y,1,1,hairD)}c.globalAlpha=1}
  if(fhh==='snor'||fhh==='ringbaard'){R(20,my-2,8,2,hair);R(20,my,1,1,hair);R(27,my,1,1,hair);R(23,my-2,2,1,hairD)}
  if(fhh==='sik'){R(22,my+2,4,3,hair);R(23,my+5,2,1,hair)}
  if(fhh==='ringbaard'){R(20,my,1,3,hair);R(27,my,1,3,hair);R(21,my+2,6,3,hair);R(22,my+5,4,1,hair)}
  if(fhh==='baard'){for(let y=my-2;y<y0+fh+2;y++){const yy=y-y0,h=yy<fh?half(yy):half(fh-1)-1-(yy-fh)*2;R(24-h,y,h*2,1,hair);R(24+h-2,y,2,1,hairD)}
    R(x0,ey+2,2,my-ey-4,hair);R(x0+fw-2,ey+2,2,my-ey-4,hairD);R(mx,my,mw,1,mood==='bang'?'#3a1512':lip);if(mood==='blij')R(mx+1,my,mw-2,1,white);R(22,my+3,4,1,hairL)}
  /* haar van voren */
  const tp=(y,h,ins)=>R(x0+(ins||0),y,fw-2*(ins||0),h,hair),sb=n=>{R(x0,y0+3,1,n,hair);R(x0+fw-1,y0+3,1,n,hairD)};
  if(hat==='none'){
    if(hs==='kaal'){R(x0+4,y0+1,5,1,skL);R(x0+4,y0+2,2,1,skL)}
    else if(hs==='kalend'){R(x0-1,y0+5,2,7,hair);R(x0+fw-1,y0+5,2,7,hairD);R(x0+5,y0+1,4,1,skL)}
    else if(hs==='opgeschoren'){tp(y0-2,2,2);tp(y0,2,1);c.globalAlpha=.4;R(x0,y0+2,2,7,hair);R(x0+fw-2,y0+2,2,7,hair);c.globalAlpha=1;R(x0+4,y0-2,4,1,hairL)}
    else if(hs==='kuif'){tp(y0-5,2,4);tp(y0-3,2,2);tp(y0-1,3,0);sb(3);R(x0+5,y0-4,5,1,hairL);R(x0+3,y0-2,3,1,hairL)}
    else if(hs==='zij'){tp(y0-2,2,1);tp(y0,3,0);R(x0,y0+3,7,1,hair);R(x0,y0+4,4,1,hair);R(x0+8,y0-2,1,4,hairD);sb(5);R(x0+2,y0-1,4,1,hairL)}
    else if(hs==='lang'){tp(y0-2,2,1);tp(y0,3,0);R(23,y0-2,2,4,hairD);R(x0-2,y0+2,3,24,hair);R(x0+fw-1,y0+2,3,24,hairD);R(x0+3,y0-1,4,1,hairL)}
    else if(hs==='bob'){tp(y0-2,2,1);tp(y0,4,0);R(x0-2,y0+2,3,15,hair);R(x0+fw-1,y0+2,3,15,hairD);R(x0+3,y0-1,4,1,hairL)}
    else if(hs==='knot'){R(21,y0-8,6,6,hair);R(22,y0-9,4,1,hair);R(22,y0-7,2,1,hairL);R(25,y0-7,2,5,hairD);tp(y0-2,2,1);tp(y0,2,0);sb(4)}
    else if(hs==='staart'){tp(y0-2,2,1);tp(y0,3,0);sb(3);R(x0+3,y0-1,5,1,hairL)}
    else if(hs==='krul'){for(let i=0;i*3<fw+4;i++)R(x0-2+i*3,y0-3+(i%2),3,5,i%2?hair:hairL===hair?hair:shade(hair,1.15));tp(y0,2,0);R(x0-2,y0+2,3,9,hair);R(x0+fw-1,y0+2,3,9,hairD)}
    else if(hs==='afro'){tp(y0-1,4,0);R(x0+2,y0+3,3,1,hair);R(x0+fw-5,y0+3,3,1,hair)}
    else if(hs==='hanenkam'){R(22,y0-7,4,9,hair);R(23,y0-8,2,1,hair);R(22,y0-6,1,5,hairL);c.globalAlpha=.3;R(x0+1,y0,fw-2,3,hair);c.globalAlpha=1}
    else if(hs==='vlecht'){tp(y0-2,2,1);tp(y0,3,0);for(let i=0;i*3<fw-3;i++)R(x0+2+i*3,y0-2,1,5,hairD);R(x0-2,y0+3,3,26,hair);R(x0+fw-1,y0+3,3,26,hair);for(let y=y0+5;y<y0+29;y+=3){R(x0-2,y,3,1,hairD);R(x0+fw-1,y,3,1,hairD)}}
    else{tp(y0-2,2,1);tp(y0,3,0);sb(4);R(x0+3,y0-1,5,1,hairL)}}
  else if(!covered){ // haar onder een pet, muts of hoed
    if(hs==='lang'||hs==='vlecht'){R(x0-2,y0+4,3,22,hair);R(x0+fw-1,y0+4,3,22,hairD)}else if(hs==='bob'||hs==='krul'||hs==='afro'){R(x0-2,y0+4,3,13,hair);R(x0+fw-1,y0+4,3,13,hairD)}else if(hs!=='kaal'&&hs!=='kalend')sb(4)}
  if(A.hb&&!covered&&hat==='none'){R(x0,y0+3,fw,2,A.hb);R(x0+fw-3,y0+3,3,2,shade(A.hb,.7));R(x0+2,y0+3,4,1,shade(A.hb,1.25))}
  /* hoofddeksels */
  if(hat==='cap'){R(x0+1,y0-4,fw-2,1,hc);R(x0,y0-3,fw,6,hc);R(x0+fw-3,y0-3,3,6,hcD);R(x0+3,y0-3,4,1,hcL);R(x0-1,y0+3,fw+3,2,hcD);R(x0-1,y0+3,fw+3,1,hc);R(22,y0-1,4,2,hcL);R(x0+1,y0+5,fw-2,1,skDD)}
  else if(hat==='beanie'){R(x0+2,y0-6,fw-4,1,hc);R(x0+1,y0-5,fw-2,2,hc);R(x0,y0-3,fw,5,hc);R(x0+fw-3,y0-4,3,5,hcD);R(x0-1,y0+1,fw+2,3,hcD);for(let x=x0;x<x0+fw;x+=3)R(x,y0+1,1,3,hc);R(x0+3,y0-4,4,1,hcL)}
  else if(hat==='hat'){R(x0+2,y0-8,fw-4,1,hc);R(x0+1,y0-7,fw-2,7,hc);R(x0+fw-4,y0-7,3,7,hcD);R(x0+1,y0-2,fw-2,2,L.band||hcD);R(x0-5,y0,fw+10,2,hc);R(x0-5,y0+1,fw+10,1,hcD);R(x0+1,y0+2,fw-2,1,skDD);R(x0+4,y0-6,3,1,hcL)}
  else if(hat==='pet'){R(x0-1,y0-7,fw+2,2,hc);R(x0-2,y0-5,fw+4,3,hc);R(x0+fw-2,y0-6,3,4,hcD);R(x0-1,y0-2,fw+2,1,hcD);R(x0,y0-1,fw,2,'#0e0f12');R(22,y0-5,4,3,'#e8b923');R(23,y0-4,2,1,'#fff3c8');R(x0,y0+1,fw,2,'#0c0d10');R(x0+2,y0+1,fw-6,1,'#2a2d35');R(x0+1,y0+3,fw-2,1,skDD)}
  else if(hat==='hijab'){R(x0+1,y0-4,fw-2,1,hc);R(x0-1,y0-3,fw+2,4,hc);R(x0-2,y0,3,fh+1,hc);R(x0+fw-1,y0,3,fh+1,hcD);R(x0+1,y0+fh-3,2,3,hc);R(x0+fw-3,y0+fh-3,2,3,hcD);R(x0+2,y0+fh-1,fw-4,6,hc);R(14,36,20,3,hc);R(14,38,20,1,hcD);R(x0+3,y0-2,5,1,hcL);R(x0+fw-4,y0+fh,2,5,hcD)}
  else if(hat==='hood'){R(x0+2,y0-5,fw-4,1,top);R(x0-1,y0-4,fw+2,3,top);R(x0-3,y0-2,3,23,top);R(x0+fw,y0-2,3,23,topD);R(x0,y0-1,fw,2,skDD);R(x0+2,y0-1,fw-5,2,hair);R(x0+3,y0-3,4,1,topL)}
  else if(hat==='mask'){for(let y=-2;y<fh;y++){const h=y<0?hw-2:half(y);R(24-h,y0+y,h*2,1,hc);R(24+h-2,y0+y,2,1,hcD)}R(20,31,8,7,hcD);R(x0+2,ey-2,fw-4,5,sk);eye(exL);eye(exR);R(21,my,6,1,hcD);for(let x=x0+2;x<x0+fw-2;x+=3)R(x,y0-1,1,5,hcD);R(x0+3,y0,4,1,hcL)}
  /* bril, zonnebril, koptelefoon */
  if(A.zon&&hat!=='mask'){const f='#0c0d10';R(exL-1,ey-1,5,3,f);R(exR-1,ey-1,5,3,f);R(exL+4,ey-1,exR-exL-5,1,f);R(x0,ey-1,exL-1-x0,1,f);R(exR+4,ey-1,x0+fw-exR-4,1,f);R(exL,ey-1,2,1,'#4a5a6a');R(exR,ey-1,2,1,'#4a5a6a')}
  else if((A.bril||L.glasses)&&hat!=='mask'){const f=A.bril===2?'#c9a227':'#15161a';[exL,exR].forEach(x=>{R(x-1,ey-2,5,1,f);R(x-1,ey+2,5,1,f);R(x-1,ey-2,1,5,f);R(x+3,ey-2,1,5,f)});R(exL+4,ey-1,exR-exL-5,1,f);R(x0,ey-1,exL-1-x0,1,f);R(exR+4,ey-1,x0+fw-exR-4,1,f)}
  if(A.kop){R(x0,y0-4,fw,1,'#1d1d1f');R(x0-1,y0-3,1,4,'#1d1d1f');R(x0+fw,y0-3,1,4,'#1d1d1f');R(x0-3,ey-2,3,6,'#2a2c30');R(x0+fw,ey-2,3,6,'#2a2c30');R(x0-3,ey,1,2,'#ff7a1a')}
  return cv}

// het pixel-uiterlijk van jou (karakter plus wat je draagt): voor het portret in de maker, de telefoon en het dossier
const COL={suit:'pak',hoodie:'hoodie',tracksuit:'track',jacket:'leer',thief:'trui',tee:'shirt'};
function pixLook(ch,wear){ch=san(ch||karGet());const w=wear||(typeof S!=='undefined'&&S.fit&&S.fit.wear)||{};let L=null;try{L=typeof outfitLook==='function'?outfitLook(w):null}catch(e){}
  const b=L&&L.bovenlijf||{},h=L&&L.hoofd||{},hk=h.kind||'none',it=typeof fitItem==='function'?fitItem(w.hoofd):null,hl=it&&it.look||{},nek=String(w.nek||'');
  return {skin:ch.skin,hair:ch.hc,hs:ch.hs,fh:ch.fh,eye:ch.eye,mouth:ch.mouth,mood:ch.mood,top:b.c||'#30353e',col:b.id==='sttank'?'tank':COL[b.kind]||'shirt',tie:b.kind==='suit'?(b.c2||'#7a1f2a'):null,
    hat:{cap:'cap',beanie:'beanie',hat:'hat',skimask:'mask'}[hk]||'none',hatC:h.c||'#2a2c30',chain:/ketting|goud|zilver|cuban|diamant|iced|medaillon/.test(nek)?1:0,
    acc:{bril:hl.glasses||w.hoofd==='bril'?2:0,zon:hl.sun||w.hoofd==='zonnebril'?1:0,hb:hl.band||null,tand:/grill/.test(String(w.hoofd||''))?1:0}}}

/* ---------- hoofd op de etalagepop (klikspel, SVG; coördinaten van dollSvg in look.js) ---------- */
// o.hat: er staat iets op je hoofd (haar alleen aan de zijkant), o.cover: bivakmuts, skimasker of helm (geen gezicht, geen voorhaar)
function dollHead(ch,o){ch=san(ch);o=o||{};const sk=ch.skin,skD=shade(sk,.84),skDD=shade(sk,.66),h=ch.hc,hD=shade(h,.7),hL=mix(h,'#ffffff',.22),hs=ch.hs,m=ch.mood,hat=!!o.hat;
  const bc=light(h)?shade(h,.6):h,lineC=shade(sk,.5),lipC=mix(shade(sk,.8),'#b0504a',.35);
  let back='',feat='',front='';
  /* haar achter het hoofd */
  if(hs==='lang')back=`<path d="M78.4 46 Q77.8 22 100 21.4 Q122.2 22 121.6 46 L123.6 90 Q112 95 100 93 Q88 95 76.4 90Z" fill="${hD}"/>`;
  else if(hs==='krul'||(hs==='afro'&&hat))back=`<path d="M77.4 52 Q73 26 100 21 Q127 26 122.6 52 Q124.6 63 119.6 71 L80.4 71 Q75.4 63 77.4 52Z" fill="${hD}"/>`;
  else if(hs==='afro')back=`<ellipse cx="100" cy="42" rx="30" ry="27.5" fill="${hD}"/><ellipse cx="100" cy="40" rx="27" ry="24" fill="${h}"/>${[[78,30],[86,20],[100,16.5],[114,20],[122,30],[75,44],[125,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.6" fill="${hL}" opacity=".5"/>`).join('')}`;
  /* nek, oren, hoofd */
  let head=`<path d="M93 70h14v24H93z" fill="${skD}"/><path d="M93 71h14v4q-7 3.4-14 0z" fill="${skDD}" opacity=".55"/>`;
  if(!o.cover&&hs!=='lang')head+=`<ellipse cx="81.4" cy="53" rx="2.9" ry="4.6" fill="${skD}"/><ellipse cx="118.6" cy="53" rx="2.9" ry="4.6" fill="${skD}"/>`;
  head+=`<ellipse cx="100" cy="50" rx="19" ry="23" fill="${sk}"/><path d="M106 28.5 Q119 34 119 50 Q119 66 106 71.5 Q114 60 114 50 Q114 38 106 28.5Z" fill="${skD}" opacity=".5"/>`;
  if(!o.cover){
    /* baard en stoppels (onder de mond) */
    if(ch.fh==='stoppel')feat+=`<path d="M81.3 52 Q82 69 100 73.6 Q118 69 118.7 52 Q117.5 60 112 63 Q106 60.2 100 60.6 Q94 60.2 88 63 Q82.5 60 81.3 52Z" fill="${h}" opacity=".3"/>`;
    if(ch.fh==='baard')feat+=`<path d="M81.2 49 Q80.4 71.4 100 76.8 Q119.6 71.4 118.8 49 Q117.6 58.6 113.4 61.8 Q108 59.4 100 59.8 Q92 59.4 86.6 61.8 Q82.4 58.6 81.2 49Z" fill="${h}"/><path d="M92 72 Q100 75.6 108 72" stroke="${hL}" stroke-width="1" fill="none" opacity=".5"/>`;
    if(ch.fh==='ringbaard')feat+=`<path d="M93.4 62 Q91.6 67.5 95.4 71.4 Q100 74.4 104.6 71.4 Q108.4 67.5 106.6 62 L105 62.6 Q105.8 67 103 69.2 Q100 70.4 97 69.2 Q94.2 67 95 62.6Z" fill="${h}"/>`;
    if(ch.fh==='sik')feat+=`<path d="M96.2 66.6 Q100 65.4 103.8 66.6 L103 72.6 Q100 74.6 97 72.6Z" fill="${h}"/>`;
    if(m==='blij')feat+=`<ellipse cx="87.6" cy="59" rx="3.2" ry="2" fill="#e0706a" opacity=".2"/><ellipse cx="112.4" cy="59" rx="3.2" ry="2" fill="#e0706a" opacity=".2"/>`;
    /* neus */
    feat+=`<path d="M100.6 51.4 L98.4 57.6 Q100 58.8 102 57.8" stroke="${skDD}" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    /* mond (breedte en lippen), per uitstraling */
    const hw=ch.mouth==='breed'?7:ch.mouth==='smal'?3.4:5,vol=ch.mouth==='vol',a=100-hw,b=100+hw;
    if(m==='blij'){feat+=`<path d="M${a-.6} 61.8 Q100 63.8 ${b+.6} 61.8 Q100 69.4 ${a-.6} 61.8Z" fill="#4a1a16"/><path d="M${a+.7} 62.5 Q100 64.2 ${b-.7} 62.5 L${b-1.4} 63.7 Q100 65.2 ${a+1.4} 63.7Z" fill="#f4f1ea"/>`;if(vol)feat+=`<path d="M${a+.4} 64.6 Q100 70.2 ${b-.4} 64.6" stroke="${lipC}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`}
    else if(m==='boos'){if(vol)feat+=`<path d="M${a+.6} 64.4 Q100 66.6 ${b-.6} 64.4 Q100 63.4 ${a+.6} 64.4Z" fill="${lipC}"/>`;feat+=`<path d="M${a} 64.6 Q100 61.4 ${b} 64.6" stroke="${lineC}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`}
    else if(m==='koel'){if(vol)feat+=`<path d="M${a+.8} 63.6 Q100 66.6 ${b-.8} 63.2Z" fill="${lipC}"/>`;feat+=`<path d="M${a} 63.4 Q${100+hw*.2} 64.4 ${b} 61.4" stroke="${lineC}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`}
    else{if(vol)feat+=`<path d="M${a+.6} 62.7 Q${100-hw/2} 60.8 100 61.9 Q${100+hw/2} 60.8 ${b-.6} 62.7Z" fill="${lipC}"/><path d="M${a+.8} 63.4 Q100 67 ${b-.8} 63.4Z" fill="${lipC}"/>`;feat+=`<path d="M${a} 63 Q100 63.9 ${b} 63" stroke="${lineC}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`}
    /* snor (over de mond) */
    if(ch.fh==='snor'||ch.fh==='ringbaard'||ch.fh==='baard')feat+=`<path d="M92.6 61.6 Q96 58.6 100 60 Q104 58.6 107.4 61.6 Q108.2 63.2 106.4 62.6 Q103 61.2 100 61.8 Q97 61.2 93.6 62.6 Q91.8 63.2 92.6 61.6Z" fill="${h}"/>`;
    /* ogen: wit, iris in jouw kleur, pupil en een lichtpuntje; leden en wenkbrauwen per uitstraling */
    const E=(x,s)=>{let e=`<ellipse cx="${x}" cy="51.2" rx="3.4" ry="${m==='blij'?2:2.4}" fill="#f4f1ea"/><circle cx="${x+.4*s}" cy="51.4" r="1.8" fill="${ch.eye}"/><circle cx="${x+.4*s}" cy="51.4" r=".8" fill="#111214"/><circle cx="${x+.4*s+.7}" cy="50.7" r=".45" fill="#fff"/>`;
      if(m==='boos')e+=`<path d="M${x-4} 47.4 L${x+4.6*s} ${s>0?50.2:47.4} L${x+4.6*s} 51 L${x-4} ${s>0?49.4:51}Z" fill="${sk}" transform="${s<0?`scale(-1 1) translate(${-2*x} 0)`:''}"/>`;
      if(m==='koel')e+=`<path d="M${x-3.8} 51.3 Q${x} 48.6 ${x+3.8} 51.3 L${x+3.8} 47.6 L${x-3.8} 47.6Z" fill="${sk}"/><path d="M${x-3.8} 51.3 Q${x} 50.1 ${x+3.8} 51.3" stroke="${skDD}" stroke-width="1.2" fill="none"/>`;
      else e+=`<path d="M${x-3.6} 50.3 Q${x} 47.9 ${x+3.6} 50.3" stroke="${skDD}" stroke-width="1" fill="none"/>`;
      if(m==='blij')e+=`<path d="M${x-3.2} 53.4 Q${x} 51.8 ${x+3.2} 53.4" stroke="${skD}" stroke-width="1.1" fill="none"/>`;return e};
    feat+=E(92,1)+E(108,-1);
    const brow=(x0,y0,x1,y1,cx,cy)=>`<path d="M${x0} ${y0} Q${cx} ${cy} ${x1} ${y1}" stroke="${bc}" stroke-width="2.3" fill="none" stroke-linecap="round"/>`;
    if(m==='boos')feat+=brow(86.6,44.2,96.6,47.6,91.6,45.2)+brow(113.4,44.2,103.4,47.6,108.4,45.2);
    else if(m==='blij')feat+=brow(87,44.6,96,44,91.5,41.6)+brow(104,44,113,44.6,108.5,41.6);
    else if(m==='koel')feat+=brow(87,46.4,96,46.4,91.5,45.4)+brow(104,45.4,113,44.6,108.5,42.6);
    else feat+=brow(87,45.4,96,45,91.5,43.6)+brow(104,45,113,45.4,108.5,43.6);
    /* haar van voren */
    if(hat){if(hs==='lang')front=`<path d="M80.4 44 L80 80 Q82 82 84.4 79 L84.6 44Z" fill="${h}"/><path d="M119.6 44 L120 80 Q118 82 115.6 79 L115.4 44Z" fill="${h}"/>`;
      else if(hs==='krul'||hs==='afro')front=`<circle cx="80.6" cy="47" r="5" fill="${h}"/><circle cx="119.4" cy="47" r="5" fill="${h}"/>`;
      else if(hs!=='kaal')front=`<path d="M81.4 43 L81.6 52 L83.6 52 L83.6 43Z" fill="${h}"/><path d="M118.6 43 L118.4 52 L116.4 52 L116.4 43Z" fill="${h}"/>`}
    else if(hs==='kort')front=`<path d="M81.4 48 Q79.6 25.6 100 25 Q120.4 25.6 118.6 48 L117 48 Q116.6 38.4 110 35.6 Q104 37.6 96 36 Q87 35.4 83.4 40 Q82.8 44 83 48Z" fill="${h}"/><path d="M88 29.6 Q96 26.8 106 28" stroke="${hL}" stroke-width="1.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
    else if(hs==='kuif')front=`<path d="M81.6 48 Q80 30 88 24.6 Q97 15.6 110 18.4 Q121.4 22.6 118.4 48 L117 48 Q116.2 36 108 33.8 Q99 35.6 91 33.2 Q84.4 36 83 48Z" fill="${h}"/><path d="M90 24.4 Q99.4 18 110 20.8" stroke="${hL}" stroke-width="1.6" fill="none" opacity=".6" stroke-linecap="round"/>`;
    else if(hs==='opgeschoren')front=`<path d="M82.2 44 Q81.4 27 100 26.4 Q118.6 27 117.8 44 Q116 33.4 100 32.4 Q84 33.4 82.2 44Z" fill="${h}" opacity=".88"/><path d="M81.3 43 Q80.9 49 81.5 54 L83.1 54 Q82.7 48 83.3 43Z" fill="${h}" opacity=".4"/><path d="M118.7 43 Q119.1 49 118.5 54 L116.9 54 Q117.3 48 116.7 43Z" fill="${h}" opacity=".4"/>`;
    else if(hs==='lang')front=`<path d="M80.4 52 Q78.4 24.6 100 24 Q121.6 24.6 119.6 52 L120 80 Q118 82 115.6 79 L115.4 46 Q112 34.4 100 33.2 Q91 33.8 86 40 Q84.6 44 84.6 49 L84.4 79 Q82 82 80 80Z" fill="${h}"/><path d="M100 24.4 Q98.8 29 100 33" stroke="${hD}" stroke-width="1.2" fill="none"/><path d="M86 30 Q93 26 99 25.6" stroke="${hL}" stroke-width="1.4" fill="none" opacity=".5" stroke-linecap="round"/>`;
    else if(hs==='krul')front=[[83.5,41,6],[88.5,33.4,6.4],[96,29.2,6.6],[104,29.2,6.6],[111.5,33.4,6.4],[116.5,41,6],[81.4,49,4.2],[118.6,49,4.2]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.32}" fill="${hL}" opacity=".35"/>`).join('');
    else if(hs==='afro')front=`<path d="M81 47 Q80.6 30 100 29.6 Q119.4 30 119 47 Q116 38.4 100 37.4 Q84 38.4 81 47Z" fill="${h}"/>`;
    else if(hs==='knot')front=`<circle cx="100" cy="21.6" r="7.4" fill="${h}"/><path d="M95 18.6 Q100 15.8 105 18.6" stroke="${hL}" stroke-width="1.3" fill="none" opacity=".55"/><path d="M81.6 47 Q80 25.6 100 25 Q120 25.6 118.4 47 Q116.4 33 100 31.6 Q83.6 33 81.6 47Z" fill="${h}"/><path d="M93.6 26.4 Q100 28.8 106.4 26.4" stroke="${hD}" stroke-width="1.6" fill="none"/><path d="M88 30 Q94 27.6 99 27.4" stroke="${hL}" stroke-width="1.2" fill="none" opacity=".5"/>`;
    else if(hs==='kaal')front=`<ellipse cx="93" cy="33" rx="5" ry="2.6" fill="#fff" opacity=".16" transform="rotate(-18 93 33)"/>`}
  return {back,head:head+feat+front}}

// klein borstbeeld (vector, klikspel): de pop met jouw hoofd, ingezoomd. Cache, want menu en dossier tekenen elke seconde.
const _bc=new Map();
function karBust(o){o=o||{};if(typeof dollSvg!=='function')return '';const ch=o.char?san(o.char):karGet(),wear=o.wear||(S.fit&&S.fit.wear)||{},vb=o.vb||'58 8 84 96';
  const k=JSON.stringify([ch,wear,vb]);let s=_bc.get(k);if(!s){s=dollSvg(wear,{vb,char:ch,label:o.label||'Jij'});if(_bc.size>40)_bc.clear();_bc.set(k,s)}
  return `<span class="kar-bust${o.cls?' '+o.cls:''}" aria-hidden="${o.label?'false':'true'}">${s}</span>`}

/* ---------- de maker ---------- */
const st={open:false,step:'look',ch:null,pick:null,mode:'edit',first:false,stadPaused:false,p3:null,last:null};
const karNew=()=>typeof S!=='undefined'&&S&&!S.charDone&&(S.xp||0)<1&&!(S.stats&&S.stats.crimes)&&!S.tour;
// de rondleiding (tour.js) wacht zolang een nieuw account zijn karakter nog moet maken
function karPending(){return st.open||karNew()}
const startFits=()=>typeof START_FITS!=='undefined'?START_FITS:[];
const fitPieces=f=>(f.items||[]).map(id=>typeof fitItem==='function'?fitItem(id):null).filter(Boolean);
const fitSum=L=>{const t={};L.forEach(o=>Object.entries(o.fx||{}).forEach(([k,v])=>{t[k]=Math.round(((t[k]||0)+v)*1000)/1000}));return t};
// bestaande spelers: ook kiezen uit wat ze al hebben (wat ze nu dragen, of hun eigen set per stijl)
function ownSets(){if(typeof OUTFITS==='undefined'||typeof fitS!=='function')return [];const F=fitS(),own=OUTFITS.filter(o=>F.own[o.id]&&!o.start&&typeof fitIsCharm==='function'&&!fitIsCharm(o)),out=[];
  const worn=Object.values(F.wear||{}).filter(id=>{const o=fitItem(id);return o&&!fitIsCharm(o)});
  if(worn.length)out.push({id:'eigen',n:'Wat je nu draagt',d:'Je houdt je eigen kleren aan.',col:'#a9dcff',wear:Object.assign({},F.wear)});
  const by={};own.forEach(o=>{if(FIT_STYLES[o.st])(by[o.st]=by[o.st]||[]).push(o)});
  Object.entries(by).filter(([,L])=>L.length>=3).sort((a,b)=>b[1].length-a[1].length).slice(0,3).forEach(([k,L])=>{const w={};
    L.slice().sort((a,b)=>a.p-b.p).forEach(o=>{w[o.slot]=o.id});
    if(!Object.keys(w).every(s=>F.wear[s]===w[s]))out.push({id:'set:'+k,n:'Je '+FIT_STYLES[k].n+'-set',d:L.length+' stukken uit je kast.',col:FIT_STYLES[k].col,wear:Object.assign({},F.wear,w)})});
  return out}
function choiceWear(id){if(!id)return null;const f=startFits().find(x=>x.id===id);if(f){const w=Object.assign({},(typeof fitS==='function'?fitS().wear:{}));fitPieces(f).forEach(o=>{w[o.slot]=o.id});return w}
  const o=ownSets().find(x=>x.id===id);return o?o.wear:null}
// bij het uiterlijk even zonder pet, hoed of muts, zodat je je kapsel ziet (brillen en zweetbanden blijven op)
const curWear=()=>{if(st.step==='fit')return (st.pick&&choiceWear(st.pick))||(typeof fitS==='function'?fitS().wear:{});
  const w=Object.assign({},typeof fitS==='function'?fitS().wear:{}),h=w.hoofd&&typeof fitItem==='function'?fitItem(w.hoofd):null;if(h&&!(h.look&&h.look.kind==='none'))delete w.hoofd;return w};

let dlg=null;
const IC={dice:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'};
function build(){const d=document.createElement('dialog');d.className='kar-dlg';d.id='karDlg';d.setAttribute('aria-labelledby','karT');d.setAttribute('aria-describedby','karSub');
  d.innerHTML=`<div class="kar-in"><header class="kar-h"><div class="kar-ht"><span class="label" id="karK"></span><h2 id="karT" tabindex="-1"></h2><p id="karSub"></p></div>
   <button type="button" class="kar-x" data-k="x" aria-label="Sluiten">${IC.x}</button></header>
   <div class="kar-main"><section class="kar-stage" aria-label="Voorbeeld"><div class="kar-big" id="karBig"></div>
     <figure class="kar-pix"><canvas id="karPix" width="48" height="48" role="img" aria-label="Je pixelportret"></canvas><figcaption>Pixelstad</figcaption></figure>
     <button type="button" class="btn ghost sm kar-rnd" data-k="rnd">${IC.dice}<span>Willekeurig</span></button></section>
    <section class="kar-ctl" id="karCtl"></section></div>
   <footer class="kar-f" id="karF"></footer></div>`;
  document.body.appendChild(d);
  d.addEventListener('cancel',e=>{e.preventDefault();if(st.mode==='new')return;st.mode==='ask'&&st.step==='look'?later():close()});
  // toetsen niet doorgeven aan het spel of de stad (lopen, telefoon, Esc = pagina verlaten)
  d.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&e.target&&e.target.type==='radio'){e.preventDefault();const b=d.querySelector('.kar-f .btn:not(.ghost)');if(b)b.click()}});
  d.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const k=b.dataset.k;
    if(k==='x'){if(st.mode==='new')return;st.mode==='ask'&&st.step==='look'?later():close()}
    else if(k==='rnd')rnd();else if(k==='later')later();else if(k==='cancel')close();else if(k==='next'){st.step='fit';draw(true)}
    else if(k==='back'){st.step='look';draw(true)}else if(k==='save')finish()});
  d.addEventListener('change',e=>{const t=e.target;if(!t||t.type!=='radio')return;const k=t.name.replace(/^kar-/,'');
    if(k==='fit'){st.pick=t.value;foot();preview();return}
    if(KEYS.includes(k)){st.ch[k]=t.value;preview();thumbs(k)}});
  return d}
const opt=(k,v,n,on)=>{const sw=['skin','hc','eye'].includes(k);
  return `<label class="kar-o ${sw?'sw':'th'}" title="${esc(n)}"><input type="radio" name="kar-${k}" value="${esc(v)}"${on?' checked':''}>${sw?`<i style="--c:${v}"></i><span class="kar-sr">${esc(n)}</span>`:`<span class="kar-th" data-th="${k}:${esc(v)}"></span><b>${esc(n)}</b>`}</label>`};
const GROUPS=[['skin','Huidskleur'],['hs','Kapsel'],['hc','Haarkleur'],['mood','Uitstraling'],['eye','Ogen'],['mouth','Mond'],['fh','Baard']];
function ctlLook(){return GROUPS.map(([k,n])=>`<fieldset class="kar-g kar-g-${k}"><legend>${n}<em>${esc((KAR_OPT[k].find(x=>x[0]===st.ch[k])||[])[1]||'')}</em></legend><div class="kar-os">${KAR_OPT[k].map(([v,l])=>opt(k,v,l,st.ch[k]===v)).join('')}</div></fieldset>`).join('')}
function ctlFit(){const own=st.first&&!karNew()?ownSets():[];const card=(f,pieces,wear,chips)=>`<label class="kar-fit" style="--c:${f.col||'#7fd1c7'}"><input type="radio" name="kar-fit" value="${esc(f.id)}"${st.pick===f.id?' checked':''}>
   <span class="kar-fd" aria-hidden="true">${typeof dollSvg==='function'?dollSvg(wear,{char:st.ch,label:f.n}):''}</span>
   <span class="kar-ft"><b>${esc(f.n)}</b><small>${esc(f.d)}</small>${pieces?`<em>${pieces.map(o=>esc(o.n)).join(' · ')}</em>`:''}<span class="fit-chips">${chips||''}</span></span><i class="kar-ck" aria-hidden="true"></i></label>`;
  return `<p class="kar-note">Gratis, alleen nu. Een klein voordeel in één richting${own.length?', of je houdt wat je al hebt':''}.</p>
   <div class="kar-fits" role="radiogroup" aria-label="Startoutfit">${startFits().map(f=>{const P=fitPieces(f);return card(f,P,choiceWear(f.id),typeof fitChips==='function'?fitChips(fitSum(P)):'')}).join('')}
   ${own.length?`<div class="kar-own"><span class="label">Of uit je eigen kast</span></div>`+own.map(o=>card(o,null,o.wear,'')).join(''):''}</div>`}
function foot(){const F=document.getElementById('karF');if(!F)return;const fit=st.step==='fit',f=fit&&st.pick?(startFits().find(x=>x.id===st.pick)||ownSets().find(x=>x.id===st.pick)):null;
  const left=fit?`<button type="button" class="btn ghost" data-k="back">Terug</button>`:st.mode==='ask'?`<button type="button" class="btn ghost" data-k="later">Later</button>`:st.mode==='edit'?`<button type="button" class="btn ghost" data-k="cancel">Annuleren</button>`:'<span></span>';
  const right=fit?`<button type="button" class="btn" data-k="save" ${f?'':'disabled'}>${f?(f.id.startsWith('set:')||f.id==='eigen'?'Klaar':'Kies '+esc(f.n)):'Kies een outfit'}</button>`
    :st.first&&startFits().length?`<button type="button" class="btn" data-k="next"><span class="kar-wide">Verder: startoutfit</span><span class="kar-narrow">Verder</span></button>`:`<button type="button" class="btn" data-k="save">Opslaan</button>`;
  F.innerHTML=left+right}
function head(){const fit=st.step==='fit';const T=fit?['Eén keer gratis','Kies je startoutfit','Je kunt hem later gewoon uittrekken.']
   :st.mode==='new'?['Nieuw dossier','Maak je karakter','Zo zien ze je, in het klikspel en in de Pixelstad.']
   :st.mode==='ask'?['Nieuw','Maak snel je karakter aan','Je eigen gezicht, in het klikspel en in de Pixelstad. Daarna een gratis startoutfit.']
   :['Karakter','Uiterlijk aanpassen','Zo zien ze je, in het klikspel en in de Pixelstad.'];
  document.getElementById('karK').textContent=T[0];document.getElementById('karT').textContent=T[1];document.getElementById('karSub').textContent=T[2];
  dlg.querySelector('.kar-x').hidden=st.mode==='new'}
function draw(focus){if(!dlg)return;head();dlg.classList.toggle('kar-s2',st.step==='fit');const C=document.getElementById('karCtl');C.innerHTML=st.step==='fit'?ctlFit():ctlLook();C.scrollTop=0;foot();preview();if(st.step==='look')thumbs();
  if(focus){const el=C.querySelector('input:checked')||C.querySelector('input');setTimeout(()=>{try{(el||document.getElementById('karT')).focus({preventScroll:true})}catch(e){}},30)}}
// kleine voorbeelden bij kapsel, uitstraling, mond en baard: jouw gezicht met die keuze (klikspel: pop, Pixelstad: pixels)
function thumbs(changed){if(!dlg||st.step!=='look')return;if(changed)upLegend(changed);
  const px=isStad();dlg.querySelectorAll('[data-th]').forEach(el=>{const [k,v]=el.dataset.th.split(':'),ch=Object.assign({},st.ch,{[k]:v});if(changed&&k===changed&&el.firstChild)return; // eigen groep: hangt niet af van je keuze daar
    if(px){const big=face(pixLook(ch,{}),null),cv=document.createElement('canvas');cv.width=30;cv.height=32;const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(big,9,3,30,32,0,0,30,32);el.innerHTML='';el.appendChild(cv)}
    else el.innerHTML=typeof dollSvg==='function'?dollSvg({},{vb:k==='hs'?'72 8 56 64':'76 30 48 50',char:ch,label:''}):''})}
function upLegend(k){const L=dlg.querySelector('.kar-g-'+k+' legend em');if(L)L.textContent=(KAR_OPT[k].find(x=>x[0]===st.ch[k])||[])[1]||''}
function preview(){if(!dlg)return;const w=curWear();face(Object.assign(pixLook(st.ch,w),{bg:'#14171c'}),null,document.getElementById('karPix'));
  if(st.p3){st.p3.frame(st.step);st.p3.set(st.ch,w);return}
  // uiterlijk: ingezoomd op hoofd en schouders; startoutfit: de hele pop
  const B=document.getElementById('karBig');B.innerHTML=typeof dollSvg==='function'?dollSvg(w,{char:st.ch,label:'Jij',vb:st.step==='look'?'46 4 108 150':undefined}):''}
function rnd(){const r=a=>a[Math.floor(Math.random()*a.length)][0];const hc=Math.random()<.12?r(KAR_OPT.hc.slice(6)):r(KAR_OPT.hc.slice(0,6));
  st.ch={skin:r(KAR_OPT.skin),hs:r(KAR_OPT.hs),hc,eye:r(KAR_OPT.eye),mood:r(KAR_OPT.mood),mouth:r(KAR_OPT.mouth),fh:Math.random()<.45?'':r(KAR_OPT.fh.slice(1))};
  if(st.step!=='look'){st.step='look'}const C=document.getElementById('karCtl');const y=C?C.scrollTop:0;draw(false);if(C)C.scrollTop=y;try{SFX.click&&SFX.click()}catch(e){}}

/* ---------- 3D-voorbeeld in de Pixelstad (stad-avatar.js: STAD.avatarMake) ---------- */
function p3(host){const TH=window.THREE,G=window.STAD;if(!TH||!G||!G.avatarMake||!host)return null;let r;
  try{r=new TH.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'})}catch(e){return null}
  r.setPixelRatio(Math.min(2,devicePixelRatio||1));if(TH.SRGBColorSpace)r.outputColorSpace=TH.SRGBColorSpace;r.domElement.className='kar-3d';host.innerHTML='';host.appendChild(r.domElement);
  const sc=new TH.Scene();sc.add(new TH.HemisphereLight(0xffffff,0x3a4250,1.5));const dl=new TH.DirectionalLight(0xffffff,1.9);dl.position.set(2.5,4,3.5);sc.add(dl);
  const cam=new TH.PerspectiveCamera(26,1,.1,60);let m=null,ry=.35,raf=0,lt=performance.now(),drag=null,fr=[1.32,3.05,1.6];const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // fr = [midden, hoogte, breedte] van wat in beeld moet: het hele poppetje (±2,6 hoog) of alleen hoofd en schouders
  const fit=()=>{const w=Math.max(10,host.clientWidth),h=Math.max(10,host.clientHeight),a=w/h,t=2*Math.tan(13*Math.PI/180);r.setSize(w,h,false);cam.aspect=a;
    const d=Math.max(fr[1]/t,fr[2]/(t*a));cam.position.set(0,fr[0]+.12,d);cam.lookAt(0,fr[0],0);cam.updateProjectionMatrix()};
  const ro=typeof ResizeObserver!=='undefined'?new ResizeObserver(fit):null;if(ro)ro.observe(host);fit();
  const loop=t=>{const dt=Math.min(.05,(t-lt)/1000);lt=t;if(!drag&&!still)ry+=dt*.55;if(m)m.rotation.y=ry;r.render(sc,cam);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  const cv=r.domElement;cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,r:ry};try{cv.setPointerCapture(e.pointerId)}catch(x){}});
  cv.addEventListener('pointermove',e=>{if(drag)ry=drag.r+(e.clientX-drag.x)*.012});const up=()=>{drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  return {frame(step){const f=step==='look'?[2,2.15,1.75]:[1.32,3.05,1.6];if(f[0]!==fr[0]){fr=f;fit()}},
    set(ch,wear){let g=null;try{g=G.avatarMake({char:ch,wear})}catch(e){console.error(e)}if(!g)return;if(m)sc.remove(m);m=g;m.rotation.y=ry;sc.add(m)},
    stop(){cancelAnimationFrame(raf);if(ro)ro.disconnect();if(m)sc.remove(m);try{r.dispose();r.forceContextLoss&&r.forceContextLoss()}catch(e){}cv.remove()}}}

/* ---------- openen, opslaan, sluiten ---------- */
function open(o){o=o||{};if(typeof S==='undefined'||!S)return;if(!dlg)dlg=build();if(st.open)return;
  st.first=!S.charDone;st.mode=o.mode||(!st.first?'edit':karNew()?'new':'ask');st.manual=!!o.manual&&st.mode!=='new';st.step='look';st.ch=san(S.char);st.pick=null;st.last=document.activeElement;
  // Pixelstad: de wereld even stil (geen lopen achter het venster), telefoon en gesprek dicht
  const G=window.STAD;if(isStad()&&G&&G.ready){try{G.phone&&G.phone.isOpen&&G.phone.isOpen()&&G.phone.close();G.kit&&G.kit.dialogOpen&&G.kit.dialogOpen()&&G.kit.closeDialog(true)}catch(e){}if(!G.paused){G.pause();st.stadPaused=true}}
  st.open=true;try{dlg.showModal()}catch(e){dlg.setAttribute('open','')}document.documentElement.classList.add('kar-on');
  st.p3=isStad()?p3(document.getElementById('karBig')):null;dlg.classList.toggle('d3',!!st.p3);draw(true)}
function close(){if(!st.open)return;st.open=false;if(st.p3){st.p3.stop();st.p3=null}try{dlg.close()}catch(e){dlg.removeAttribute('open')}document.documentElement.classList.remove('kar-on');
  const G=window.STAD;if(st.stadPaused&&G&&G.ready){st.stadPaused=false;const busy=(G.ui&&G.ui.cur&&G.ui.cur())||(G.phone&&G.phone.isOpen&&G.phone.isOpen());if(!busy)G.resume()}
  if(st.last&&st.last.isConnected&&st.last.focus)try{st.last.focus({preventScroll:true})}catch(e){}}
function later(){if(st.manual){close();return}S.charAsk=(S.charAsk||0)+1;window.__karLater=1;try{save()}catch(e){}close();
  toast(S.charAsk>=KAR_ASK?'Je karakter maak je later via je profiel.':'Goed, de volgende keer.','ok')}
function apply(){_bc.clear();try{localStorage.setItem('stad_skin',S.char.skin)}catch(e){}
  const G=window.STAD;if(G&&G.ready){try{G.refreshLook&&G.refreshLook();G.avatarSync&&G.avatarSync()}catch(e){}}}
function finish(){const first=!S.charDone,isNew=st.mode==='new';S.char=san(st.ch);let msg='Karakter opgeslagen';
  if(first){S.charDone=now();const id=st.pick,f=startFits().find(x=>x.id===id),F=typeof fitS==='function'?fitS():null;
    if(f&&F){fitPieces(f).forEach(o=>{F.own[o.id]=1;F.wear[o.slot]=o.id});S.charStart=f.id;msg='Startoutfit '+f.n+' aangetrokken';log('Karakter gemaakt · startoutfit '+f.n,'ok')}
    else if(id&&F){const w=choiceWear(id);if(w){Object.keys(w).forEach(sl=>{if(F.own[w[sl]])F.wear[sl]=w[sl]})}S.charStart=id.startsWith('set:')?id:'eigen';log('Karakter gemaakt','ok')}
    else S.charStart='eigen'}
  try{save();typeof pushSoon==='function'&&pushSoon()}catch(e){}close();apply();try{typeof render==='function'&&render()}catch(e){}
  try{SFX.buy&&SFX.buy()}catch(e){}toast(msg,'lvl');
  if(first&&isNew&&typeof tourStart==='function')setTimeout(()=>{try{tourStart()}catch(e){}},600)}

/* ---------- vanzelf: nieuw account meteen, bestaand account één keer per sessie (max. KAR_ASK keer Later) ---------- */
function autoTry(n){if(st.open||typeof S==='undefined'||!S||S.charDone)return;const nw=karNew();if(!nw&&((S.charAsk||0)>=KAR_ASK||window.__karLater))return;
  const G=window.STAD,md=document.getElementById('modal');
  const busy=window.__LOCKED__||document.getElementById('devLock')||(md&&!md.hidden)||(typeof tr!=='undefined'&&tr.on)||S.pendingArrest||document.querySelector('.cg-ov,.chase-ov,.ar-ov,.pv-ov')
    ||(isStad()&&(!G||!G.ready||(G.kit&&G.kit.dialogOpen&&G.kit.dialogOpen())||(G.phone&&G.phone.isOpen&&G.phone.isOpen())||(G.ui&&G.ui.cur&&G.ui.cur())));
  if(busy){if(n<60)setTimeout(()=>autoTry(n+1),1500);return}open()}
setTimeout(()=>autoTry(0),900);

window.KAR={open,close,face,dollHead,look:pixLook,get:karGet,san,shade,mix,OPT:KAR_OPT,DEF:KAR_DEF,
  // Pixelstad: jouw uiterlijk in G.P.look (HUD-poppetje, telefoon, krant): huid, haar en gezicht uit je karakter
  stadLook(v){if(!v||typeof v!=='object')return v;const c=karGet(),old=v.skin;if(v.arm&&v.arm===old)v.arm=c.skin;v.skin=c.skin;v.hair=c.hc;v.hs=c.hs;v.fh=c.fh;v.eye=c.eye;v.mouth=c.mouth;return v}};
window.karGet=karGet;window.karBust=karBust;window.karPending=karPending;window.karOpen=o=>open(Object.assign({manual:1},o||{}));
// de Pixelstad leest je huidskleur ook uit de browser (stad-game.js): gelijk houden met je karakter
try{if(typeof S!=='undefined'&&S&&S.char)localStorage.setItem('stad_skin',karGet().skin)}catch(e){}
})();
