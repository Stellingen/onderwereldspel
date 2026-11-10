// Pixelstad: grote pixelportretten (48×48) voor gesprekken. Elk personage heeft een eigen gezicht: vorm, kapsel, baard, bril,
// kleding en stemming. look = het uiterlijk van het poppetje (skin, hair, top, hat, hatC …) plus, alleen voor het portret:
//   hs  kapsel: kort | kuif | zij | opgeschoren | lang | bob | knot | staart | krul | afro | kalend | kaal | hanenkam | vlecht
//   fh  gezichtshaar: stoppel | snor | sik | ringbaard | baard          col kleding: shirt | pak | hoodie | uniform | schort |
//   fw  breedte van het gezicht (16, 18, 20), jaw: rond | hoekig | spits     leer | tank | trui | blouse | track | werk
//   age 0 jong, 1 midden, 2 oud · eye oogkleur · lip lippenstift · v vrouw (wimpers) · w breedte schouders
//   acc {bril, zon, oor, lit, spr, mv, tat, kop, tand, pl}
// mood: neutraal | blij | boos | bang
(function(){
'use strict';
const G=STAD,K=G.kit,shade=K.shade;
K.face=function(look,mood,cv){cv=cv||document.createElement('canvas');cv.width=cv.height=48;const c=cv.getContext('2d'),L=look||{},A=L.acc||{};
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
    else if(hs==='afro'){const ry=13,rx=hw+6;for(let y=-ry;y<=11;y++){const w=Math.round(Math.sqrt(Math.max(0,1-(y*y)/(ry*ry)))*rx);R(24-w,y0+6+y,w*2,1,y%3?hair:hairD)}R(17,y0-5,5,1,hairL);R(15,y0-3,3,1,hairL)}
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
    else{R(x,ey,3,2,white);R(x+1,ey,1,2,iris);R(x+1,ey+1,1,1,dark);R(x,ey-1,3,1,skDD)}};
  eye(exL);eye(exR);if(L.v){R(exL-1,ey-1,1,1,dark);R(exR+3,ey-1,1,1,dark)}
  if(mood==='boos'){R(exL,ey-4,2,bw,browC);R(exL+1,ey-3,2,bw,browC);R(exR+1,ey-4,2,bw,browC);R(exR,ey-3,2,bw,browC)}
  else if(mood==='bang'){R(exL,ey-4,1,1,browC);R(exL+1,ey-5,2,1,browC);R(exR,ey-5,2,1,browC);R(exR+2,ey-4,1,1,browC)}
  else{R(exL,ey-3-(bw-1),3,bw,browC);R(exR,ey-3-(bw-1),3,bw,browC)}
  if(A.lit){const sc=shade(sk,1.25);R(exR+3,ey-5,1,4,sc);R(exR+3,ey+2,1,3,sc);R(exR+4,ey+3,1,2,sc)}
  if(A.tat===2)R(exL-1,ey+3,1,2,'#1f3a4a');
  /* neus en mond */
  R(24,ey+1,1,3,skD);const nw=L.nose==='breed'?4:2;R(24-(nw>>1),ey+4,nw,1,skDD);if(L.nose==='lang')R(24,ey,1,1,skD);
  const lip=L.lip||shade(sk,.6),mouth=()=>{if(mood==='blij'){R(21,my,6,1,'#3a1512');R(22,my,4,1,white);R(20,my-1,1,1,lip);R(27,my-1,1,1,lip);R(22,my+1,4,1,lip);if(A.tand)R(24,my,1,1,'#e8b923')}
    else if(mood==='boos'){R(21,my,6,1,'#3a1512');R(20,my+1,1,1,lip);R(27,my+1,1,1,lip)}
    else if(mood==='bang'){R(22,my-1,4,3,'#3a1512');R(23,my+1,2,1,'#8a3a36')}
    else{R(21,my,6,1,lip);R(22,my+1,4,1,L.lip?shade(L.lip,.82):skD)}};
  mouth();if(L.v&&mood==='blij'){c.globalAlpha=.45;R(x0+2,ey+4,2,1,'#e87a6a');R(x0+fw-4,ey+4,2,1,'#e87a6a');c.globalAlpha=1}
  /* gezichtshaar */
  const fhh=hat==='mask'?'':(L.fh!=null?L.fh:(L.beard?'baard':''));
  if(fhh==='stoppel'){c.globalAlpha=.34;for(let y=my-3;y<y0+fh;y++){const h=half(y-y0);for(let x=24-h;x<24+h;x++)if((x+y)%2===0&&!(y>=my-1&&y<=my+1&&x>=21&&x<27))R(x,y,1,1,hairD)}c.globalAlpha=1}
  if(fhh==='snor'||fhh==='ringbaard'){R(20,my-2,8,2,hair);R(20,my,1,1,hair);R(27,my,1,1,hair);R(23,my-2,2,1,hairD)}
  if(fhh==='sik'){R(22,my+2,4,3,hair);R(23,my+5,2,1,hair)}
  if(fhh==='ringbaard'){R(20,my,1,3,hair);R(27,my,1,3,hair);R(21,my+2,6,3,hair);R(22,my+5,4,1,hair)}
  if(fhh==='baard'){for(let y=my-2;y<y0+fh+2;y++){const yy=y-y0,h=yy<fh?half(yy):half(fh-1)-1-(yy-fh)*2;R(24-h,y,h*2,1,hair);R(24+h-2,y,2,1,hairD)}
    R(x0,ey+2,2,my-ey-4,hair);R(x0+fw-2,ey+2,2,my-ey-4,hairD);R(21,my,6,1,mood==='bang'?'#3a1512':lip);if(mood==='blij')R(22,my,4,1,white);R(22,my+3,4,1,hairL)}
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
    if(hs==='lang'||hs==='vlecht'){R(x0-2,y0+4,3,22,hair);R(x0+fw-1,y0+4,3,22,hairD)}else if(hs==='bob'||hs==='krul'){R(x0-2,y0+4,3,13,hair);R(x0+fw-1,y0+4,3,13,hairD)}else if(hs!=='kaal'&&hs!=='kalend')sb(4)}
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
  return cv};
// kleine uitbreiding van het pictogram-portret (24×24): dezelfde persoon blijft herkenbaar
const p0=K.portrait;
K.portrait=function(look,mood,cv){const L=look||{},A=L.acc||{};let hat=L.hat||'none';const hs=L.hs||'';const map=Object.assign({},L);
  if(hat==='pet')map.hat='cap';else if(hat==='hijab'||hat==='hood')map.hat='none';if(hat==='none'&&(hs==='kaal'||hs==='kalend'))map.hat='bald';if(hs==='lang'||hs==='bob'||hs==='vlecht')map.long=1;if(L.fh!=null)map.beard=(L.fh==='baard'||L.fh==='ringbaard')?1:0;if(A.bril)map.glasses=1;
  cv=p0(map,mood,cv);const c=cv.getContext('2d'),R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)},sk=L.skin||'#d9a27a',hair=L.hair||'#2a1d14';
  if(hat==='pet'){R(11,4,2,2,'#e8b923')}
  if(hat==='hijab'||hat==='hood'){const hc=hat==='hood'?(L.top||'#30353e'):(L.hatC||'#2a2c30');R(7,3,10,hat==='hijab'?4:3,hc);R(6,4,2,13,hc);R(16,4,2,13,shade(hc,.75));R(8,15,8,3,hc);R(5,17,14,2,hc)}
  if(hat==='none'&&hs==='afro'){R(5,1,14,5,hair);R(4,3,3,8,hair);R(17,3,3,8,hair)}
  if(hat==='none'&&hs==='knot'){R(10,0,4,3,hair)}
  if(hat==='none'&&hs==='hanenkam'){R(11,0,2,6,hair)}
  if(L.fh==='snor'){R(9,12,6,1,hair)}if(L.fh==='sik'){R(11,14,2,2,hair)}
  if(A.zon){R(8,9,4,2,'#0c0d10');R(12,9,4,2,'#0c0d10');R(8,9,1,1,'#4a5a6a')}
  if(A.lit)R(16,7,1,5,shade(sk,1.25));
  return cv};
})();
