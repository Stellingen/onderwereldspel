// Gebouwen voor het realistische prototype: elke gevel krijgt een eigen getekende textuur (metselwerk of stuc, ramen met kozijn,
// vensterbank en gordijnen, winkelpuien, deuren, uithangborden), met reliëf, glans op het glas en licht achter de ramen in de nacht.
import * as THREE from 'three';
import {rng,mk,canvasTex,shade,mix,jitter,noiseCanvas,tint,place,clamp} from './r-util.js';

const STY={
 brick:{w:'#8a3b2a',m:'#6a2a1e',f:'#e9e1cf',g:'#26323f',gnd:'shop',aw:'#a3262a',roof:'#5a2620',pat:'brick'},
 brick2:{w:'#5a372c',m:'#3a221b',f:'#d6c5a2',g:'#1f2833',gnd:'door',roof:'#3a2a24',pat:'brick'},
 brick3:{w:'#a65a34',m:'#7f4126',f:'#f1ece0',g:'#28394a',gnd:'shop',aw:'#2f6d3e',roof:'#4a3a32',pat:'brick'},
 plaster:{w:'#d8cbb0',m:'#bfb196',f:'#5c4a38',g:'#243241',gnd:'shop',aw:'#25507a',roof:'#6b6458',pat:'plain'},
 shop:{w:'#c4b293',m:'#a99878',f:'#3d4a3a',g:'#2a3a48',gnd:'shopbig',aw:'#2b7a55',roof:'#5d5850',pat:'plain'},
 glass:{w:'#29597d',m:'#1f4663',f:'#9fb6c6',g:'#3a7aa8',gnd:'lobby',roof:'#55606a',pat:'curtain'},
 glass2:{w:'#2c6a66',m:'#1f4f4c',f:'#a9c4bf',g:'#3f8f88',gnd:'lobby',roof:'#55606a',pat:'curtain'},
 concrete:{w:'#8c8e92',m:'#74767a',f:'#55585e',g:'#2a3440',gnd:'lobby',roof:'#6a6c70',pat:'panel'},
 ware:{w:'#6f808b',m:'#58666f',f:'#3c464d',g:'#2a3440',gnd:'roll',roof:'#5d666c',pat:'corr'},
 ware2:{w:'#8c5c3c',m:'#6e4630',f:'#3c2a20',g:'#2a3440',gnd:'roll',roof:'#5d5048',pat:'corr'},
 beach:{w:'#eab7a0',m:'#d29a84',f:'#ffffff',g:'#3a6a8a',gnd:'shop',aw:'#e8584a',roof:'#c2a68a',pat:'wood'},
 beach2:{w:'#a5d6cd',m:'#86bab0',f:'#ffffff',g:'#3a6a8a',gnd:'shop',aw:'#f0b23a',roof:'#a8b8b0',pat:'wood'},
 casino:{w:'#1b1519',m:'#120e11',f:'#d6a63e',g:'#4a1f4a',gnd:'casino',roof:'#2a2228',pat:'casino',neon:'#ff4fd8'},
 bank:{w:'#cfc5b2',m:'#b3a993',f:'#7a705e',g:'#1f2a36',gnd:'columns',roof:'#7d776b',pat:'stone'},
 police:{w:'#dfe3e8',m:'#c9cdd3',f:'#1f4ea8',g:'#1d2a44',gnd:'police',roof:'#8a9098',pat:'panel'},
 jail:{w:'#7b7d80',m:'#64666a',f:'#3a3c40',g:'#1c1f24',gnd:'door',roof:'#5f6164',pat:'panel'},
 villa:{w:'#efebe1',m:'#d9d3c4',f:'#5a3a24',g:'#1f2a33',gnd:'door',roof:'#3d4148',pat:'plain'},
 pub:{w:'#2f4a36',m:'#243a2a',f:'#c9a24a',g:'#4a3a1a',gnd:'pub',roof:'#3a2a24',pat:'wood'},
 gun:{w:'#3a3d42',m:'#2c2e32',f:'#7a1f1f',g:'#1c1f24',gnd:'shop',aw:'#7a1f1f',roof:'#3a3d42',pat:'panel'},
 garage:{w:'#b6bac0',m:'#9a9ea4',f:'#3a4048',g:'#2a3440',gnd:'roll',roof:'#6a6e74',pat:'corr'},
 gym:{w:'#38486a',m:'#2a3854',f:'#e0e4ea',g:'#4a6a9a',gnd:'shopbig',aw:'#e8a03a',roof:'#4a5260',pat:'panel'},
 boutique:{w:'#2a2a2c',m:'#1d1d1f',f:'#d6b25a',g:'#4a4a52',gnd:'shopbig',aw:'#1d1d1f',roof:'#3a3a3c',pat:'plain'}};
const SHOPS=['BAKKERIJ','SLAGERIJ','KAPSALON','BLOEMEN','FIETSEN','TABAK','BOEKHANDEL','APOTHEEK','KAAS','OPTICIEN','SCHOENEN','IJSSALON','DE HOEK','VIS','PIZZERIA','KOFFIE'];
const LIT=['#ffd8a0','#ffc878','#ffe9c4','#ffdcae','#cfe0ff','#ffcf8a'];

// ---- schilder: tekent tegelijk kleur, ruwheid/metaal, reliëf en (nacht) licht. Maten in meters, y vanaf de grond omhoog.
function painter(w,h,ppm,night){const Wp=Math.max(8,Math.round(w*ppm)),Hp=Math.max(8,Math.round(h*ppm));const C=mk(Wp,Hp),R=mk(Wp,Hp),B=mk(Wp,Hp),E=night?mk(Wp,Hp):null;
  const c=C.getContext('2d'),r=R.getContext('2d'),b=B.getContext('2d'),e=E?E.getContext('2d'):null;
  r.fillStyle='rgb(0,225,0)';r.fillRect(0,0,Wp,Hp);b.fillStyle='rgb(128,128,128)';b.fillRect(0,0,Wp,Hp);if(e){e.fillStyle='#000';e.fillRect(0,0,Wp,Hp)}
  const P={ppm,w,h,C,R,B,E,c,r,b,e,
    rect(x,y,ww,hh,col,o){const px=x*ppm,py=Hp-(y+hh)*ppm,pw=ww*ppm,ph=hh*ppm;if(col){c.fillStyle=col;c.fillRect(px,py,pw,ph)}
      if(o){if(o.r!=null){r.fillStyle=`rgb(0,${Math.round(clamp(o.r,0,1)*255)},${Math.round(clamp(o.m||0,0,1)*255)})`;r.fillRect(px,py,pw,ph)}
        if(o.b!=null){b.fillStyle=`rgb(${o.b},${o.b},${o.b})`;b.fillRect(px,py,pw,ph)}if(e&&o.e){e.fillStyle=o.e;e.fillRect(px,py,pw,ph)}}},
    grad(x,y,ww,hh,c0,c1,o){const px=x*ppm,py=Hp-(y+hh)*ppm,pw=ww*ppm,ph=hh*ppm,g=c.createLinearGradient(0,py,0,py+ph);g.addColorStop(0,c0);g.addColorStop(1,c1);c.fillStyle=g;c.fillRect(px,py,pw,ph);if(o)P.rect(x,y,ww,hh,null,o)},
    egrad(x,y,ww,hh,c0,c1){if(!e)return;const px=x*ppm,py=Hp-(y+hh)*ppm,pw=ww*ppm,ph=hh*ppm,g=e.createLinearGradient(0,py,0,py+ph);g.addColorStop(0,c0);g.addColorStop(1,c1);e.fillStyle=g;e.fillRect(px,py,pw,ph)},
    text(s,xc,y,hh,col,o){o=o||{};const px=xc*ppm,py=Hp-(y+hh*.5)*ppm,f=`${o.wt||800} ${Math.max(6,hh*ppm)}px ${o.font||'Arial, Helvetica, sans-serif'}`;c.font=f;c.textAlign='center';c.textBaseline='middle';c.fillStyle=col;c.fillText(s,px,py,(o.max||w)*ppm);
      if(e&&o.e){e.font=f;e.textAlign='center';e.textBaseline='middle';e.fillStyle=o.e;e.shadowColor=o.e;e.shadowBlur=hh*ppm*.5;e.fillText(s,px,py,(o.max||w)*ppm);e.shadowBlur=0}}};
  return P}

function wallPattern(P,sty,r,fine){const {w,h,ppm}=P,wall=sty.w;
  if(sty.pat==='brick'){P.rect(0,0,w,h,sty.m,{r:.92,b:96});const bh=fine?.1:.14,bl=fine?.26:.4,gap=1.01/ppm;let row=0;
    for(let y=0;y<h;y+=bh,row++){const off=(row&1)?bl/2:0;for(let x=-off;x<w;x+=bl){const k=r();P.rect(x+gap/2,y+gap/2,bl-gap,bh-gap,jitter(k<.08?shade(wall,.8):k>.94?shade(wall,1.15):wall,r,9),fine?{b:136}:null)}}}
  else if(sty.pat==='plain'){P.rect(0,0,w,h,wall,{r:.9});}
  else if(sty.pat==='panel'){P.rect(0,0,w,h,wall,{r:.8});for(let x=2.9;x<w-.5;x+=2.9)P.rect(x,0,.04,h,shade(wall,.7),{b:80});for(let y=3.4;y<h-.2;y+=3.4)P.rect(0,y,w,.04,shade(wall,.7),{b:80})}
  else if(sty.pat==='corr'){P.rect(0,0,w,h,wall,{r:.55,m:.5});for(let x=0;x<w;x+=.2){P.rect(x,0,.1,h,shade(wall,1.1),{b:150});P.rect(x+.1,0,.03,h,shade(wall,.78),{b:100})}}
  else if(sty.pat==='stone'){P.rect(0,0,w,h,sty.m,{r:.85,b:95});const bh=.48,bl=.95,gap=1.2/ppm;let row=0;for(let y=0;y<h;y+=bh,row++){const off=(row&1)?bl/2:0;for(let x=-off;x<w;x+=bl)P.rect(x+gap/2,y+gap/2,bl-gap,bh-gap,jitter(wall,r,7),{b:135})}}
  else if(sty.pat==='wood'){P.rect(0,0,w,h,wall,{r:.8});for(let y=0;y<h;y+=.19)P.rect(0,y,w,.025,shade(wall,.72),{b:92})}
  else if(sty.pat==='casino'){P.rect(0,0,w,h,wall,{r:.25,m:.3});for(let x=1.45;x<w;x+=2.9)P.rect(x-.05,0,.1,h,sty.f,{r:.3,m:.9,b:160})}
  else if(sty.pat==='curtain'){P.rect(0,0,w,h,shade(wall,.7),{r:.4,m:.5})}
  else P.rect(0,0,w,h,wall,{r:.9})}

function glassCol(sty,night){return night?shade(sty.g,.5):mix(sty.g,'#a9bdd0',.5)}
function win(P,x,y,ww,hh,sty,r,o){o=o||{};const night=!!P.e,gc=glassCol(sty,night),lit=night&&r()<(o.lit==null?.42:o.lit),lc=LIT[Math.floor(r()*LIT.length)];
  P.rect(x-.07,y-.07,ww+.14,hh+.14,shade(sty.w,.5),{b:64,r:.9});P.rect(x-.035,y-.035,ww+.07,hh+.07,sty.f,{b:150,r:.6});
  P.grad(x,y,ww,hh,night?shade(gc,1.2):mix(gc,'#cfe2f4',.45),shade(gc,night?.7:.78),{r:.07,m:.88,b:84});if(lit){P.egrad(x,y,ww,hh,shade(lc,.95),shade(lc,.45));if(r()<.5){const fw=ww*(.2+r()*.3);P.rect(x+r()*(ww-fw),y,fw,hh*(.25+r()*.4),null,{e:shade(lc,.22)})}}
  const k=r();if(k<.36){const cw=ww*(.2+r()*.14),cc=night&&lit?shade(lc,.75):mix('#f1ece0',sty.w,.15);P.rect(x,y,cw,hh,cc,{r:.8,m:.1,e:lit?shade(lc,.55):null});P.rect(x+ww-cw,y,cw,hh,cc,{r:.8,m:.1,e:lit?shade(lc,.55):null})}
  else if(k<.52){const bh2=hh*(.25+r()*.4);P.rect(x,y+hh-bh2,ww,bh2,night&&lit?shade(lc,.6):'#d9d4c8',{r:.75,m:.1,e:lit?shade(lc,.45):null});for(let yy=y+hh-bh2;yy<y+hh;yy+=.09)P.rect(x,yy,ww,.02,'rgba(0,0,0,.18)')}
  else if(k<.6&&!night){P.rect(x+ww*.15,y,ww*.3,hh*.35,'rgba(60,110,60,.75)')}
  if(!o.plain){P.rect(x+ww/2-.022,y,.045,hh,sty.f,{b:150,r:.6});P.rect(x,y+hh*.62,ww,.045,sty.f,{b:150,r:.6})}
  P.rect(x-.12,y-.15,ww+.24,.09,mix(sty.w,'#ffffff',.5),{b:215,r:.7});P.rect(x-.12,y-.2,ww+.24,.05,'rgba(0,0,0,.33)');
  if(sty.pat==='brick')P.rect(x-.1,y+hh+.04,ww+.2,.15,shade(sty.w,.8),{b:150})}

function shopfront(P,x0,bw,sty,r,label,door){const night=!!P.e,gc=glassCol(sty,night),lit=night?(r()<.75?'#ffe2b0':'#cfe6ff'):null;
  P.rect(x0,0,bw,.4,shade(sty.w,.55),{b:150,r:.8});
  P.rect(x0+.18,.4,bw-.36,2.3,sty.f,{b:155,r:.5});
  P.grad(x0+.26,.48,bw-.52,2.14,night?(lit?'#fff0d0':'#20242c'):mix(gc,'#dbe9f5',.35),night?(lit?'#e8b870':'#12141a'):shade(gc,.62),{r:.05,m:night?.2:.8,b:80});if(lit)P.egrad(x0+.26,.48,bw-.52,2.14,shade(lit,.9),shade(lit,.42));
  // spullen in de etalage
  [1.15,1.85].forEach(sy=>P.rect(x0+.3,sy,bw-.6,.035,night?'#3a3026':mix('#6a5a48',gc,.5),{e:lit?'#3a2c1c':null}));const n=5+Math.floor(r()*6);for(let i=0;i<n;i++){const row=Math.floor(r()*3),sy=[.5,1.185,1.885][row],ww=.14+r()*.3,hh=.16+r()*(row===0?.5:.42),xx=x0+.36+r()*(bw-.9-ww),cc=['#b89a78','#8a9a84','#a87068','#c8c0b0','#78889a','#c0a260','#6a5a4a'][Math.floor(r()*7)];P.rect(xx,sy,ww,hh,night?shade(cc,lit?.6:.22):mix(cc,gc,.5),{e:lit?shade(cc,.38):null})}
  if(door){const dx=x0+bw/2-.5;P.rect(dx-.06,.06,1.12,2.5,sty.f,{b:160,r:.5});P.grad(dx,.12,1,2.36,night?(lit?'#ffe8c0':'#1a1d24'):mix(gc,'#cfe2f4',.3),shade(gc,.55),{r:.05,m:.8,b:78,e:lit});P.rect(dx+.82,1.05,.06,.3,'#d9d9d9',{r:.2,m:1})}
  else P.rect(x0+bw/2-.02,.48,.04,2.14,sty.f,{b:150});
  // bord
  if(label){const bc=sty.aw||shade(sty.w,.5);P.rect(x0+.14,2.78,bw-.28,.52,bc,{b:170,r:.6});P.text(label,x0+bw/2,2.83,.36,'#f4efe2',{max:bw-.5,e:night?'#ffe9c0':null})}}

function resDoor(P,xc,sty,r){const dc=['#3a2a1e','#1f3a2a','#5a1f1f','#22303f','#2a2a2c'][Math.floor(r()*5)];P.rect(xc-.62,0,1.24,2.45,shade(sty.w,.5),{b:70});P.rect(xc-.55,.12,1.1,2.25,sty.f,{b:155});P.rect(xc-.47,.12,.94,2.0,dc,{b:120,r:.5});
  P.rect(xc-.36,1.25,.3,.7,shade(dc,1.25),{b:128});P.rect(xc+.06,1.25,.3,.7,shade(dc,1.25),{b:128});P.rect(xc-.36,.3,.72,.75,shade(dc,1.2),{b:128});P.rect(xc+.3,1.05,.07,.07,'#d6b25a',{r:.2,m:1});
  P.grad(xc-.47,2.16,.94,.2,P.e?'#ffd9a0':'#9fb6cc','#4a5a6a',{r:.08,m:.8,e:P.e&&r()<.6?'#ffd9a0':null});P.rect(xc-.75,0,1.5,.12,'#9a968e',{b:200})}

function rollDoor(P,x0,bw,sty){const ww=Math.min(bw-.6,3.6),xx=x0+(bw-ww)/2;P.rect(xx-.1,0,ww+.2,3.05,shade(sty.w,.55),{b:80});P.rect(xx,0,ww,2.95,'#8f959c',{r:.45,m:.7,b:120});for(let y=.05;y<2.95;y+=.14)P.rect(xx,y,ww,.03,'#6f757c',{b:95})}

function groundFloor(P,sty,r,o){const {w}=P,n=Math.max(1,Math.round(w/3.1)),bw=w/n,front=o.front,street=o.street,g=o.blank?'blank':sty.gnd;
  if(g==='blank'||(!street&&!front)){// achter- of zijgevel: een enkel raam of deur
    for(let i=0;i<n;i++)if(r()<.4)win(P,i*bw+bw/2-.5,1.15,1,1.2,sty,r,{plain:1});if(r()<.5)resDoor(P,bw*(Math.floor(r()*n)+.5),sty,r);return}
  if(g==='shop'||g==='shopbig'){const di=front?Math.floor(n/2):-1;const name=o.sign||SHOPS[Math.floor(r()*SHOPS.length)];for(let i=0;i<n;i++)shopfront(P,i*bw,bw,sty,r,(front?(i===di):(n>1&&i===Math.floor(n/2)&&r()<.5))?name:null,i===di||(!front&&n>2&&i===0&&r()<.4))}
  else if(g==='door'){const di=Math.floor(n/2);for(let i=0;i<n;i++){if(i===di&&(front||r()<.5))resDoor(P,i*bw+bw/2,sty,r);else win(P,i*bw+bw/2-.6,.95,1.2,1.55,sty,r)}}
  else if(g==='lobby'){const night=!!P.e,gc=glassCol(sty,night);P.rect(0,0,w,.25,'#55585e',{b:150});P.grad(.2,.25,w-.4,2.9,night?'#f4e2c0':mix(gc,'#dbe9f5',.4),night?'#b08850':shade(gc,.6),{r:.05,m:night?.2:.85,b:84,e:night?'#ffe4b8':null});for(let x=.2;x<w-.2;x+=1.5)P.rect(x-.03,.25,.06,2.9,sty.f,{b:160,r:.3,m:.8});P.rect(.2,2.2,w-.4,.06,sty.f,{b:160});
    if(front){P.rect(w/2-1.6,3.0,3.2,.14,'#3a3d42',{b:210});if(o.sign)P.text(o.sign,w/2,3.18,.3,'#f1efe9',{e:night?'#ffffff':null})}}
  else if(g==='roll'){for(let i=0;i<n;i++){if(front||street)rollDoor(P,i*bw,bw,sty);}if(front){resDoor(P,.9,sty,r);if(o.sign){P.rect(w/2-2.4,3.0,4.8,.5,shade(sty.w,.5),{b:170});P.text(o.sign,w/2,3.07,.34,'#f4efe2',{max:4.5,e:P.e?'#ffe9c0':null})}}}
  else if(g==='columns'){P.rect(0,0,w,.5,shade(sty.w,.75),{b:190});for(let i=0;i<=n;i++){const x=clamp(i*bw-.3,0,w-.6);P.rect(x,.5,.6,2.6,mix(sty.w,'#ffffff',.35),{b:210,r:.7});P.rect(x-.08,3.0,.76,.18,mix(sty.w,'#ffffff',.5),{b:225});P.rect(x-.08,.5,.76,.14,mix(sty.w,'#ffffff',.5),{b:225})}
    for(let i=0;i<n;i++)if(!(front&&i===Math.floor(n/2)))win(P,i*bw+bw/2-.55,1.0,1.1,1.7,sty,r);
    if(front){const xc=w/2;P.rect(xc-1,.5,2,2.6,'#3a2d1c',{b:90});P.rect(xc-.9,.5,.88,2.45,'#6a5230',{r:.35,m:.8,b:130});P.rect(xc+.02,.5,.88,2.45,'#6a5230',{r:.35,m:.8,b:130});P.rect(xc-2.2,3.2,4.4,.16,mix(sty.w,'#ffffff',.5),{b:230});if(o.sign)P.text(o.sign,xc,3.42,.42,'#5a4a2a',{font:'Georgia, serif',e:P.e?'#ffe0a0':null})}}
  else if(g==='casino'){const night=!!P.e;P.rect(0,0,w,3.4,'#141014',{r:.2,m:.4});for(let i=0;i<n;i++){const x=i*bw;P.rect(x+.3,.3,bw-.6,2.3,'#2a1a2a',{r:.15,m:.7,b:90,e:night?'#3a1030':null});P.rect(x+.3,2.6,bw-.6,.06,sty.f,{r:.3,m:1,e:night?'#ffcf60':null})}
    if(front){const xc=w/2;P.rect(xc-1.5,0,3,2.8,sty.f,{r:.3,m:1,b:170});P.rect(xc-1.35,0,2.7,2.65,'#5a1420',{r:.5,b:110,e:night?'#7a1a2a':null});P.rect(xc-.02,0,.04,2.65,sty.f,{m:1,r:.3});for(let x=xc-3.8;x<=xc+3.8;x+=.38)P.rect(x-.07,3.02,.14,.14,'#ffe9a0',{e:night?'#fff0b0':null,b:200});
      P.text(o.sign||'CASINO',xc,3.5,1.0,night?'#ffd0f4':sty.neon,{wt:900,max:9,e:night?sty.neon:null})}}
  else if(g==='pub'){P.rect(0,0,w,3.2,shade(sty.w,.9),{r:.6,b:128});for(let i=0;i<n;i++){const x=i*bw;if(front&&i===Math.floor(n/2)){resDoor(P,x+bw/2,{w:sty.w,f:sty.f},r);continue}P.rect(x+.3,.9,bw-.6,1.7,sty.f,{b:160,r:.4,m:.6});const night=!!P.e;P.grad(x+.36,.96,bw-.72,1.58,night?'#ffcf80':'#6a5a3a',night?'#c88a40':'#2a2418',{r:.1,m:night?.1:.7,e:night?'#ffc060':null});for(let xx=x+.36+.4;xx<x+bw-.4;xx+=.4)P.rect(xx,.96,.03,1.58,sty.f,{b:150});P.rect(x+.36,1.75,bw-.72,.03,sty.f,{b:150})}
    P.rect(0,2.8,w,.5,shade(sty.w,.7),{b:170});if(o.sign||front)P.text(o.sign||'CAFÉ',w/2,2.86,.36,sty.f,{font:'Georgia, serif',max:w-1,e:P.e?'#ffd070':null})}
  else if(g==='police'){for(let i=0;i<n;i++){if(front&&i===Math.floor(n/2)){const xc=i*bw+bw/2;P.rect(xc-.8,0,1.6,2.6,'#1f4ea8',{b:150});P.grad(xc-.68,.1,1.36,2.36,P.e?'#e8f0ff':'#9fb6cc','#3a4a66',{r:.05,m:.7,e:P.e?'#dfe9ff':null})}else win(P,i*bw+bw/2-.65,.95,1.3,1.6,sty,r)}P.rect(0,2.9,w,.4,'#1f4ea8',{b:160});if(front)P.text(o.sign||'POLITIE',w/2,2.93,.32,'#ffffff',{e:P.e?'#cfe0ff':null})}
  else{for(let i=0;i<n;i++)win(P,i*bw+bw/2-.6,.95,1.2,1.55,sty,r)}}

function facade(b,face,sty,ppm,night,o){const w=face.w,h=face.h,P=painter(w,h,ppm,night),r=rng(b.i*131+face.k*17+5),fine=ppm>=22;
  wallPattern(P,sty,r,fine);const FL=3.4,n=Math.max(1,Math.round(w/3.0)),bw=w/n;
  if(sty.pat==='curtain'){// glazen kantoorgevel: banden glas met stijlen
    const gc=glassCol(sty,night);for(let f=1;f<b.fl;f++){const y=f*FL;P.rect(0,y,w,.5,shade(sty.w,.55),{r:.4,m:.6,b:150});
      for(let x=0;x<w;x+=1.5){const lit=night&&r()<.5;P.grad(x+.04,y+.5,1.42,FL-.5,night?(lit?'#ffe9c4':shade(gc,.5)):mix(gc,'#d8ecff',.5+r()*.15),night?(lit?'#d8a860':shade(gc,.3)):shade(gc,.75),{r:.04,m:.92,b:100,e:lit?LIT[Math.floor(r()*LIT.length)]:null});P.rect(x,y,.05,FL,sty.f,{r:.3,m:.9,b:165})}}}
  else if(sty.pat==='corr'){for(let f=1;f<b.fl;f++)for(let i=0;i<n;i++)if(r()<.5)win(P,i*bw+bw/2-.9,f*FL+1.3,1.8,.9,sty,r,{plain:1,lit:.2})}
  else{const ww=clamp(bw*.44,.9,1.45),wh=sty.pat==='casino'?2.2:1.75;
    for(let f=1;f<b.fl;f++)for(let i=0;i<n;i++){const x=i*bw+bw/2-ww/2,y=f*FL+.95;if(sty.pat==='casino'){P.rect(x,y,ww,wh,'#2a1a2a',{r:.1,m:.8,e:night?(r()<.6?'#5a1848':'#2a0c24'):null});P.rect(x-.05,y+wh,ww+.1,.06,sty.f,{m:1,r:.3,e:night?'#ffcf60':null})}else win(P,x,y,ww,wh,sty,r)}
    for(let f=1;f<b.fl;f++)P.rect(0,f*FL-.06,w,.1,shade(sty.w,sty.pat==='brick'?.82:.9),{b:160})}
  groundFloor(P,sty,r,o);
  // daklijst
  P.rect(0,h-.4,w,.4,mix(sty.w,'#ffffff',sty.pat==='brick'?.3:.12),{b:205,r:.8});P.rect(0,h-.46,w,.06,'rgba(0,0,0,.35)');
  // vuil: onderaan en strepen
  const g=P.c.createLinearGradient(0,P.C.height,0,P.C.height-1.2*ppm);g.addColorStop(0,'rgba(20,18,14,.3)');g.addColorStop(1,'rgba(20,18,14,0)');P.c.fillStyle=g;P.c.fillRect(0,P.C.height-1.2*ppm,P.C.width,1.2*ppm);
  if(fine){for(let i=0;i<w*.5;i++){const x=r()*P.C.width,l=(1+r()*4)*ppm;const gg=P.c.createLinearGradient(0,.5*ppm,0,.5*ppm+l);gg.addColorStop(0,'rgba(15,14,12,.12)');gg.addColorStop(1,'rgba(15,14,12,0)');P.c.fillStyle=gg;P.c.fillRect(x,.5*ppm,2+r()*5,l)}
    noiseCanvas(P.c,P.C.width,P.C.height,4,6,ppm*.9,b.i*7+face.k)}
  return P}

export function buildBuildings(ctx){const {M,S,night,scene,batch,mats,fx,fz,R,camPos,extra}=ctx,T=M.T,FL=M.FL;
  // gedeelde materialen
  const gravel=mk(256,256),gx=gravel.getContext('2d');gx.fillStyle='#dcdad4';gx.fillRect(0,0,256,256);noiseCanvas(gx,256,256,22,10,10,3);const gravT=canvasTex(gravel,true,true);
  const tile=mk(256,256),tx=tile.getContext('2d'),tb=mk(256,256),tbx=tb.getContext('2d');tx.fillStyle='#d8d2ca';tx.fillRect(0,0,256,256);tbx.fillStyle='#808080';tbx.fillRect(0,0,256,256);const rt=rng(9);
  for(let y=0;y<256;y+=16)for(let x=0;x<256;x+=16){const k=195+Math.floor(rt()*55);tx.fillStyle=`rgb(${k},${k-6},${k-12})`;tx.fillRect(x+((y/16)&1?8:0)-8,y,15,15);tx.fillStyle='rgba(0,0,0,.35)';tx.fillRect(x-8,y+13,32,3);tbx.fillStyle='#b0b0b0';tbx.fillRect(x-8,y,32,10);tbx.fillStyle='#505050';tbx.fillRect(x-8,y+13,32,3)}
  const tileT=canvasTex(tile,true,true),tileB=canvasTex(tb,false,true);
  mats.roof=new THREE.MeshStandardMaterial({map:gravT,vertexColors:true,roughness:.95});
  mats.roofTile=new THREE.MeshStandardMaterial({map:tileT,bumpMap:tileB,bumpScale:1.5,vertexColors:true,roughness:.8});
  mats.plain=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85});
  mats.metal=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4,metalness:.8});
  mats.cloth=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide});
  {const sc=mk(128,128),sx=sc.getContext('2d'),im=sx.createImageData(128,128);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const v=1-y/127,u=Math.min(x,127-x)/22;const a=Math.pow(v,2.3)*Math.min(1,u);const i=(y*128+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=Math.max(0,Math.min(255,a*255))}sx.putImageData(im,0,0);const st=new THREE.CanvasTexture(sc);
    mats.spill=new THREE.MeshBasicMaterial({map:st,color:0xffd9a0,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false});mats.spillP=new THREE.MeshBasicMaterial({map:st,color:0xff5fd8,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false})}
  const grpW=new THREE.Group();scene.add(grpW);let nTex=0;
  const outside=(x,z)=>{const t=x<0||z<0||x>=M.W||z>=M.H?T.WATER:M.ground[Math.floor(z)*M.W+Math.floor(x)];return t===T.WALK||t===T.PLAZA||t===T.ROAD||t===T.BRIDGE};
  M.buildings.forEach(b=>{const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,dx=Math.max(b.x0-fx,0,fx-b.x1),dz=Math.max(b.z0-fz,0,fz-b.z1);if(Math.hypot(dx,dz)>R+12)return;
    const sty=STY[b.st]||STY.plaster,r=rng(b.i*977+13),flat=b.roof==='flat'||!b.roof,h=b.fl*FL+(flat?.55:0),w=b.x1-b.x0,d=b.z1-b.z0,pl=b.pl?M.placeById(b.pl):null;
    const front=pl?pl.face:(b.front||'');
    const faces=[{k:0,d:'S',w,h,x:cx,z:b.z1,ry:0,nx:0,nz:1},{k:1,d:'N',w,h,x:cx,z:b.z0,ry:Math.PI,nx:0,nz:-1},{k:2,d:'E',w:d,h,x:b.x1,z:cz,ry:Math.PI/2,nx:1,nz:0},{k:3,d:'W',w:d,h,x:b.x0,z:cz,ry:-Math.PI/2,nx:-1,nz:0}];
    faces.forEach(f=>{const vis=(camPos.x-f.x)*f.nx+(camPos.z-f.z)*f.nz>0||camPos.y>h+4&&false;const dist=Math.hypot(camPos.x-f.x,camPos.z-f.z);
      const geo=new THREE.PlaneGeometry(f.w,f.h);let mat;
      if(!vis){mat=wallPlain(sty)}
      else{const ppm=dist<55?(S.ppm||28):dist<110?16:dist<170?10:6;const street=outside(f.x+f.nx*1.6,f.z+f.nz*1.6)||outside(f.x+f.nx*3.2,f.z+f.nz*3.2);
        const P=facade(b,f,sty,ppm,night,{front:front===f.d,street,sign:front===f.d&&pl?pl.sign:null,blank:b.st==='jail'});nTex++;
        const map=canvasTex(P.C,true),rm=canvasTex(P.R,false);
        mat=new THREE.MeshStandardMaterial({map,roughnessMap:rm,metalnessMap:rm,roughness:1,metalness:1,envMapIntensity:1.15});
        if(ppm>=16){mat.bumpMap=canvasTex(P.B,false);mat.bumpScale=ppm>=22?2.2:1.2}
        if(P.E){mat.emissiveMap=canvasTex(P.E,true);mat.emissive=new THREE.Color(0xffffff);mat.emissiveIntensity=ctx.TM.emis||1.1}
        // luifels boven winkelpuien (alleen dichtbij)
        if(dist<90&&street&&sty.aw&&(sty.gnd==='shop'||sty.gnd==='shopbig')&&b.st!=='gun'){const n=Math.max(1,Math.round(f.w/3.1)),bw=f.w/n;for(let i=0;i<n;i++){if(r()<.25)continue;const g=new THREE.BoxGeometry(bw-.6,.035,.85);g.rotateX(.34);const u=(i+.5)*bw-f.w/2;const gg=tint(g,r()<.2?shade(sty.aw,1.25):sty.aw);gg.translate(u,2.8,.44);gg.rotateY(f.ry);gg.translate(f.x,0,f.z);batch.add('cloth',gg);
            const v=tint(new THREE.BoxGeometry(bw-.6,.2,.025),shade(sty.aw,.8));v.translate(u,2.56,.84);v.rotateY(f.ry);v.translate(f.x,0,f.z);batch.add('cloth',v)}}
        // licht dat uit de etalages op straat valt (nacht)
        if(night&&street&&dist<120&&['shop','shopbig','lobby','pub','casino'].includes(sty.gnd)){const g=new THREE.PlaneGeometry(f.w-.4,8);g.rotateX(-Math.PI/2);g.translate(0,0,4.05);g.rotateY(f.ry);g.translate(f.x,ctx.G.hAt(f.x+f.nx*2,f.z+f.nz*2)+.035,f.z);batch.add(b.st==='casino'?'spillP':'spill',g)}
        if(night&&front===f.d&&(b.st==='casino'||b.st==='pub'))extra.lights.push({x:f.x+f.nx*2.5,y:3.4,z:f.z+f.nz*2.5,c:b.st==='casino'?0xff4fd8:0xffb060,i:b.st==='casino'?26:14,d:26})}
      const m=new THREE.Mesh(geo,mat);m.position.set(f.x,f.h/2,f.z);m.rotation.y=f.ry;m.castShadow=true;m.receiveShadow=true;grpW.add(m)});
    // ---- dak
    if(flat){const top=new THREE.PlaneGeometry(w,d);top.rotateX(-Math.PI/2);const uv=top.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/6,uv.getY(i)*d/6);batch.add('roof',place(tint(top,sty.roof),cx,b.fl*FL+.02,cz));
      const pc=shade(sty.w,.86),th=.28,ph=.55,y=b.fl*FL+ph/2;[[cx,b.z0+th/2,w,th],[cx,b.z1-th/2,w,th],[b.x0+th/2,cz,th,d],[b.x1-th/2,cz,th,d]].forEach(([x,z,ww,dd])=>batch.add('plain',place(tint(new THREE.BoxGeometry(ww,ph,dd),pc),x,y,z)));
      [[cx,b.z0+th/2,w+.1,th+.1],[cx,b.z1-th/2,w+.1,th+.1],[b.x0+th/2,cz,th+.1,d+.1],[b.x1-th/2,cz,th+.1,d+.1]].forEach(([x,z,ww,dd])=>batch.add('plain',place(tint(new THREE.BoxGeometry(ww,.07,dd),mix(sty.w,'#e8e4dc',.55)),x,b.fl*FL+ph+.03,z)));
      // spullen op het dak
      const n=1+Math.floor(r()*Math.min(5,w*d/45));for(let i=0;i<n;i++){const x=b.x0+1.5+r()*(w-3),z=b.z0+1.5+r()*(d-3),k=r();
        if(k<.45){batch.add('metal',place(tint(new THREE.BoxGeometry(1.3,.8,.9),'#b9bcc0'),x,b.fl*FL+.45,z,r()<.5?0:Math.PI/2));batch.add('metal',place(tint(new THREE.CylinderGeometry(.3,.3,.06,12),'#55585c'),x,b.fl*FL+.88,z))}
        else if(k<.7){batch.add('metal',place(tint(new THREE.CylinderGeometry(.14,.14,1.3,8),'#9a9da2'),x,b.fl*FL+.65,z));batch.add('metal',place(tint(new THREE.ConeGeometry(.24,.2,8),'#77797d'),x,b.fl*FL+1.4,z))}
        else if(k<.86&&w>8&&d>8){batch.add('plain',place(tint(new THREE.BoxGeometry(2.6,2.5,2.4),shade(sty.w,.9)),x,b.fl*FL+1.25,z));batch.add('plain',place(tint(new THREE.BoxGeometry(2.8,.1,2.6),'#55585c'),x,b.fl*FL+2.55,z))}
        else{batch.add('plain',place(tint(new THREE.BoxGeometry(2.2,.12,1.2),'#2a3550'),x,b.fl*FL+.5,z));batch.add('metal',place(tint(new THREE.BoxGeometry(.06,.5,.06),'#888'),x-.9,b.fl*FL+.25,z))}}}
    else{// zadeldak
      const alongX=b.roof==='gableX',span=alongX?d:w,len=alongX?w:d,rh=span*.42,ov=.3,y0=b.fl*FL,sl=Math.hypot(span/2+ov,rh*(1+ov/(span/2)));
      const mkSide=s=>{const g=new THREE.PlaneGeometry(len+ov*2,sl);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(len+ov*2)/3.2,uv.getY(i)*sl/3.2);const ang=Math.atan2(rh,span/2);g.rotateX(-Math.PI/2+ang);g.translate(0,rh/2-ov*Math.tan(ang)/2,(span/4+ov/2));if(s<0)g.rotateY(Math.PI);if(!alongX)g.rotateY(Math.PI/2);g.translate(cx,y0,cz);return tint(g,sty.roof)};
      batch.add('roofTile',mkSide(1));batch.add('roofTile',mkSide(-1));
      // topgevels
      [-1,1].forEach(s=>{const sh=new THREE.Shape();sh.moveTo(-span/2,0);sh.lineTo(span/2,0);sh.lineTo(0,rh);sh.closePath();const g=new THREE.ShapeGeometry(sh);if(alongX){g.rotateY(s>0?Math.PI/2:-Math.PI/2);g.translate(cx+s*len/2,y0,cz)}else{if(s<0)g.rotateY(Math.PI);g.translate(cx,y0,cz+s*len/2)}batch.add('plain',tint(g,shade(sty.w,.95)))});
      const ridge=new THREE.BoxGeometry(alongX?len+ov*2:.25,.14,alongX?.25:len+ov*2);batch.add('plain',place(tint(ridge,shade(sty.roof,.7)),cx,y0+rh+.04,cz));
      if(r()<.7){const q=(r()-.5)*len*.5;batch.add('plain',place(tint(new THREE.BoxGeometry(.7,1.5,.7),shade(sty.w,.8)),alongX?cx+q:cx+span*.18,y0+rh*.7+.5,alongX?cz+span*.18:cz+q))}}
  });
  ctx.stats=ctx.stats||{};ctx.stats.facades=nTex;
  function wallPlain(sty){const k='wp_'+sty.w;if(!mats[k])mats[k]=new THREE.MeshStandardMaterial({color:sty.w,roughness:.9});return mats[k]}
}
