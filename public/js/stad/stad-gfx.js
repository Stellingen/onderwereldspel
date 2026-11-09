// Pixelstad: tekenwerk. Pixeltexturen (alles met de hand in code getekend), de stad als één blok-model, water en poppetjes.
// Alles grof gepixeld: texturen zonder vervaging en de wereld wordt op lage resolutie getekend (zie stad-game.js).
(function(){
'use strict';
const M=STAD_MAP,{W,H,FL,T}=M;
const TH=window.THREE;
const hash=(x,y,s)=>{let h=(x*374761393+y*668265263+(s||0)*2147483647)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296};
const hex=c=>{const n=parseInt(c.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const cl=v=>v<0?0:v>255?255:v|0;
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const shade=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
const css=c=>`rgb(${cl(c[0])},${cl(c[1])},${cl(c[2])})`;
function nearestTex(cv,mips){const t=new TH.CanvasTexture(cv);t.magFilter=TH.NearestFilter;t.minFilter=mips?TH.NearestMipmapNearestFilter:TH.NearestFilter;t.generateMipmaps=!!mips;t.colorSpace=TH.SRGBColorSpace;t.anisotropy=1;return t}

/* =================== atlas met gevels, daken en kleurvlakjes =================== */
const AS=512,atlas=document.createElement('canvas'),lit=document.createElement('canvas');atlas.width=atlas.height=lit.width=lit.height=AS;
const A=atlas.getContext('2d'),L=lit.getContext('2d');L.fillStyle='#000';L.fillRect(0,0,AS,AS);
const px=(cx,x,y,c)=>{cx.fillStyle=css(c);cx.fillRect(x,y,1,1)};
const rect=(cx,x,y,w,h,c)=>{cx.fillStyle=css(c);cx.fillRect(x,y,w,h)};
// tegel in uv-ruimte (de textuur wordt omgedraaid: uv v=0 is de onderkant van het plaatje)
const tileUV=(x,y,w,h)=>[x/AS,1-(y+h)/AS,w/AS,h/AS];
// kleurvlakjes (8×8) voor de rest van de spullen
const SW={};let swN=0;
function swatch(c,glow,noise){const key=c+'|'+(glow||'')+'|'+(noise==null?6:noise);if(SW[key])return SW[key];
  const i=swN++,x=(i%64)*8,y=448+Math.floor(i/64)*8,b=hex(c),nz=noise==null?6:noise;
  for(let a=0;a<8;a++)for(let d=0;d<8;d++){const n=(hash(x+d,y+a,7)-.5)*nz*2;px(A,x+d,y+a,[b[0]+n,b[1]+n,b[2]+n])}
  if(glow)rect(L,x,y,8,8,hex(glow));
  return SW[key]=tileUV(x+1,y+1,6,6)}
// gevelstijlen: muur, voeg/schaduw, kozijn, glas, soort begane grond, dak
const STY={
 brick:{w:'#8a3b2a',m:'#6a2a1e',f:'#e9e1cf',g:'#26323f',gnd:'shop',aw:'#a3262a',roof:'#5a2620',pat:'brick'},
 brick2:{w:'#4d2f26',m:'#3a221b',f:'#d6c5a2',g:'#1f2833',gnd:'door',roof:'#3a2a24',pat:'brick'},
 brick3:{w:'#a65a34',m:'#7f4126',f:'#f1ece0',g:'#28394a',gnd:'shop',aw:'#2f6d3e',roof:'#4a3a32',pat:'brick'},
 plaster:{w:'#d8cbb0',m:'#bfb196',f:'#5c4a38',g:'#243241',gnd:'shop',aw:'#25507a',roof:'#6b6458',pat:'plain'},
 shop:{w:'#c4b293',m:'#a99878',f:'#3d4a3a',g:'#2a3a48',gnd:'shopbig',aw:'#2b7a55',roof:'#5d5850',pat:'plain'},
 glass:{w:'#29597d',m:'#1f4663',f:'#9fb6c6',g:'#3a7aa8',gnd:'lobby',roof:'#55606a',pat:'curtain'},
 glass2:{w:'#2c6a66',m:'#1f4f4c',f:'#a9c4bf',g:'#3f8f88',gnd:'lobby',roof:'#55606a',pat:'curtain'},
 concrete:{w:'#8c8e92',m:'#74767a',f:'#55585e',g:'#2a3440',gnd:'lobby',roof:'#6a6c70',pat:'panel'},
 ware:{w:'#6f808b',m:'#58666f',f:'#3c464d',g:'#2a3440',gnd:'roll',roof:'#5d666c',pat:'corr'},
 ware2:{w:'#8c5c3c',m:'#6e4630',f:'#3c2a20',g:'#2a3440',gnd:'roll',roof:'#5d5048',pat:'corr'},
 beach:{w:'#eab7a0',m:'#d29a84',f:'#ffffff',g:'#3a6a8a',gnd:'kiosk',aw:'#e8584a',roof:'#c2a68a',pat:'plain'},
 beach2:{w:'#a5d6cd',m:'#86bab0',f:'#ffffff',g:'#3a6a8a',gnd:'kiosk',aw:'#f0b23a',roof:'#a8b8b0',pat:'plain'},
 casino:{w:'#1b1519',m:'#120e11',f:'#d6a63e',g:'#4a1f4a',gnd:'casino',roof:'#2a2228',pat:'casino',neon:'#ff4fd8'},
 club:{w:'#12161e',m:'#0b0e13',f:'#2a3a5a',g:'#0f1d33',gnd:'casino',roof:'#1d222b',pat:'casino',n1:'#3ad6ff',n2:'#2a6cff',n3:'#b8a1ff'},
 kraak:{w:'#6d6a62',m:'#57544d',f:'#4a4640',g:'#1c1f24',gnd:'door',roof:'#4a4844',pat:'boarded'},
 bank:{w:'#cfc5b2',m:'#b3a993',f:'#7a705e',g:'#1f2a36',gnd:'columns',roof:'#7d776b',pat:'stone'},
 police:{w:'#e3e6ea',m:'#c9cdd3',f:'#1f4ea8',g:'#1d2a44',gnd:'police',roof:'#8a9098',pat:'plain'},
 jail:{w:'#7b7d80',m:'#64666a',f:'#3a3c40',g:'#1c1f24',gnd:'bars',roof:'#5f6164',pat:'jail'},
 villa:{w:'#efebe1',m:'#d9d3c4',f:'#5a3a24',g:'#1f2a33',gnd:'villa',roof:'#3d4148',pat:'plain'},
 pub:{w:'#2f4a36',m:'#243a2a',f:'#c9a24a',g:'#4a3a1a',gnd:'pub',roof:'#3a2a24',pat:'wood'},
 gun:{w:'#3a3d42',m:'#2c2e32',f:'#7a1f1f',g:'#1c1f24',gnd:'bars',roof:'#3a3d42',pat:'panel'},
 garage:{w:'#b6bac0',m:'#9a9ea4',f:'#3a4048',g:'#2a3440',gnd:'roll',roof:'#6a6e74',pat:'corr'},
 gym:{w:'#38486a',m:'#2a3854',f:'#e0e4ea',g:'#4a6a9a',gnd:'shopbig',aw:'#e8a03a',roof:'#4a5260',pat:'panel'},
 boutique:{w:'#2a2a2c',m:'#1d1d1f',f:'#d6b25a',g:'#4a4a52',gnd:'shopbig',aw:'#1d1d1f',roof:'#3a3a3c',pat:'plain'}};
const SLOT={};let slotN=0;
function drawStyle(k,s){const i=slotN++,ox=(i%8)*64,oy=Math.floor(i/8)*64;
  const w=hex(s.w),m=hex(s.m),f=hex(s.f),g=hex(s.g);
  const wall=(x,y,ww,hh,base)=>{for(let a=0;a<hh;a++)for(let d=0;d<ww;d++){const X=x+d,Y=y+a,n=(hash(X,Y,i)-.5)*14;let c=base||w;
    if(s.pat==='brick'){const row=Math.floor(a/3),off=row%2?3:0;if(a%3===2||(d+off)%6===5)c=m}
    else if(s.pat==='corr'){if(d%3===2)c=m;else if(d%3===0)c=shade(w,1.08)}
    else if(s.pat==='panel'){if(a%8===7||d%16===15)c=m}
    else if(s.pat==='stone'){if(a%4===3||(d+(Math.floor(a/4)%2)*4)%8===7)c=m}
    else if(s.pat==='wood'){if(d%4===3)c=m}
    else if(s.pat==='jail'){if(a%5===4)c=m}
    else if(s.pat==='casino'){if(a%16<2)c=shade(f,.55)}
    px(A,X,Y,[c[0]+n,c[1]+n,c[2]+n])}};
  // bovenverdiepingen: 4 traveeën × 2 verdiepingen, elk 16×16
  wall(ox,oy,64,32);
  for(let fy=0;fy<2;fy++)for(let bx=0;bx<4;bx++){const x=ox+bx*16,y=oy+fy*16,on=hash(bx,fy,i*3+1)<.55;
    if(s.pat==='curtain'){rect(A,x,y,16,16,g);rect(A,x,y,16,1,f);rect(A,x,y,1,16,f);for(let a=2;a<14;a++)px(A,x+a,y+15-a,mix(g,[255,255,255],.25));
      if(on)rect(L,x+1,y+1,15,15,hex(hash(bx,fy,i)<.5?'#ffe7a8':'#cfe8ff'));continue}
    if(s.pat==='casino'){rect(A,x+3,y+3,10,11,g);rect(A,x+2,y+2,12,1,f);rect(A,x+2,y+14,12,1,f);rect(L,x+3,y+3,10,11,hex(on?(s.n1||'#ff4fd8'):(s.n2||'#7a3cff')));rect(L,x+2,y+2,12,1,hex(s.n3||'#ffcf5a'));continue}
    if(s.pat==='corr'){if(fy===0&&bx%2===0){rect(A,x+3,y+4,10,4,f);rect(A,x+4,y+5,8,2,g);if(on)rect(L,x+4,y+5,8,2,hex('#ffe7a8'))}continue}
    const ww=s.pat==='jail'?4:s.k==='villa'||s.pat==='stone'?8:8,wh=s.pat==='jail'?6:s.pat==='stone'?12:10,wx=x+(16-ww)/2|0,wy=y+(s.pat==='stone'?2:3);
    rect(A,wx-1,wy-1,ww+2,wh+2,f);rect(A,wx,wy,ww,wh,g);
    if(s.pat!=='jail'){rect(A,wx+ww/2|0,wy,1,wh,f);rect(A,wx,wy+(wh/2|0),ww,1,f);px(A,wx+1,wy+1,mix(g,[255,255,255],.35))}
    else for(let a=0;a<ww;a+=2)rect(A,wx+a,wy,1,wh,f);
    rect(A,wx-1,wy+wh+1,ww+2,1,shade(f,.8));
    if(s.pat==='boarded'&&hash(bx,fy,i+4)<.7){for(let a=0;a<wh;a+=3)rect(A,wx-1,wy+a,ww+2,2,shade(hex('#8a6a42'),.8+hash(a,bx,i)*.4));continue}
    if(on){const lc=hex(hash(bx,fy,i+9)<.7?'#ffd98a':'#ffeec8');rect(L,wx,wy,ww,wh,lc);if(s.pat!=='jail'){rect(L,wx+ww/2|0,wy,1,wh,[0,0,0]);rect(L,wx,wy+(wh/2|0),ww,1,[0,0,0])}}}
  // begane grond (64×16)
  const gy=oy+32;wall(ox,gy,64,16);
  for(let bx=0;bx<4;bx++){const x=ox+bx*16,on=hash(bx,9,i)<.8;
    switch(s.gnd){
    case 'shop':case 'shopbig':{const big=s.gnd==='shopbig';rect(A,x+1,gy+4,14,12,f);rect(A,x+2,gy+5,12,big?11:9,g);if(!big)rect(A,x+2,gy+14,12,2,shade(w,.7));
      if(s.aw){for(let d=0;d<16;d++)rect(A,x+d,gy+1,1,3,d%4<2?hex(s.aw):[240,236,226]);rect(A,x,gy+4,16,1,shade(hex(s.aw),.6))}
      rect(L,x+2,gy+5,12,big?11:9,hex('#ffe2a0'));if(bx===1&&!big){rect(A,x+6,gy+6,4,10,shade(f,.6));rect(L,x+6,gy+6,4,10,[0,0,0])}break}
    case 'door':{rect(A,x+4,gy+4,8,12,f);rect(A,x+5,gy+5,6,11,shade(g,.9));px(A,x+9,gy+10,[220,190,90]);if(on)rect(L,x+5,gy+5,6,3,hex('#ffd98a'));break}
    case 'lobby':{rect(A,x,gy+3,16,13,f);rect(A,x+1,gy+4,14,12,g);rect(A,x+8,gy+4,1,12,f);rect(L,x+1,gy+4,14,12,hex('#dfe9f0'));rect(L,x+8,gy+4,1,12,[0,0,0]);break}
    case 'roll':{rect(A,x+1,gy+3,14,13,shade(w,.75));for(let a=4;a<16;a+=2)rect(A,x+2,gy+a,12,1,shade(w,.6));rect(A,x+1,gy+2,14,1,f);break}
    case 'kiosk':{rect(A,x+1,gy+5,14,11,g);for(let d=0;d<16;d++)rect(A,x+d,gy+1,1,4,d%4<2?hex(s.aw):[255,255,255]);rect(A,x+1,gy+11,14,5,shade(w,.8));rect(L,x+1,gy+5,14,6,hex('#ffe2a0'));break}
    case 'casino':{rect(A,x,gy+2,16,14,f);rect(A,x+1,gy+4,14,12,g);rect(L,x+1,gy+4,14,12,hex(s.n1||'#ff4fd8'));rect(L,x,gy+2,16,2,hex(s.n3||'#ffcf5a'));rect(L,x+7,gy+4,2,12,hex(s.n3||'#ffcf5a'));break}
    case 'columns':{rect(A,x+2,gy,3,16,shade(w,1.1));rect(A,x+11,gy,3,16,shade(w,1.1));rect(A,x+2,gy,3,1,f);rect(A,x+11,gy,3,1,f);rect(A,x+6,gy+4,4,12,g);break}
    case 'police':{rect(A,x,gy,16,4,hex('#1f4ea8'));rect(A,x,gy+2,16,1,[240,240,240]);rect(A,x+3,gy+6,10,10,g);rect(A,x+3,gy+6,10,1,f);rect(L,x+3,gy+7,10,9,hex('#cfe0ff'));break}
    case 'bars':{rect(A,x+3,gy+4,10,12,g);for(let a=3;a<13;a+=2)rect(A,x+a,gy+4,1,12,f);break}
    case 'villa':{rect(A,x+3,gy+2,10,14,f);rect(A,x+4,gy+3,8,13,g);rect(A,x+8,gy+3,1,13,f);rect(L,x+4,gy+3,8,13,hex('#ffd98a'));break}
    case 'pub':{rect(A,x+1,gy+3,14,13,f);rect(A,x+2,gy+4,12,9,hex('#4a3a1a'));rect(L,x+2,gy+4,12,9,hex('#ffb84a'));rect(A,x+2,gy+13,12,3,shade(w,.8));break}
    }}
  // dak (64×16): grind of pannen
  const r=hex(s.roof);for(let a=0;a<16;a++)for(let d=0;d<64;d++){const n=(hash(ox+d,oy+48+a,i+5)-.5)*20;let c=r;if(s.pat==='brick'||s.k==='gable')c=(a%4===3)?shade(r,.75):r;px(A,ox+d,oy+48+a,[c[0]+n,c[1]+n,c[2]+n])}
  SLOT[k]={up:tileUV(ox,oy,64,32),gnd:tileUV(ox,gy,64,16),roof:tileUV(ox,oy+48,64,16)};
}
Object.keys(STY).forEach(k=>drawStyle(k,STY[k]));
// pannendak (schuin) apart: rijen dakpannen
const ROOFT={};['#7a2f22','#3c4148','#5a2a1c'].forEach((c,j)=>{const x=j*64,y=384,b=hex(c);for(let a=0;a<16;a++)for(let d=0;d<64;d++){const n=(hash(x+d,y+a,3)-.5)*16,row=a%4===3,off=(Math.floor(a/4)%2)*3;let k=row?.7:((d+off)%6===5?.85:1);px(A,x+d,y+a,shade([b[0]+n,b[1]+n,b[2]+n],k))}ROOFT[j]=tileUV(x,y,64,16)});
// deur (16×24) en raam-licht van de deur
const DOORT=(()=>{const x=192,y=384;rect(A,x,y,16,24,[60,48,40]);rect(A,x+1,y+1,14,23,[110,80,50]);rect(A,x+2,y+2,12,22,[70,46,28]);rect(A,x+3,y+3,10,6,[40,60,80]);rect(L,x+3,y+3,10,6,hex('#ffd98a'));px(A,x+11,y+14,[230,200,100]);return tileUV(x,y,16,24)})();
// containerwand met ribbels
const CONT={};['#b03a2e','#2e5f9a','#3c8a4a','#d68a2a','#7d8288'].forEach((c,j)=>{const x=208+j*16,y=384,b=hex(c);for(let a=0;a<16;a++)for(let d=0;d<16;d++){const n=(hash(x+d,y+a,4)-.5)*12;px(A,x+d,y+a,shade([b[0]+n,b[1]+n,b[2]+n],d%3===0?.75:1))}CONT[j]=tileUV(x,y,16,16)});
// kademuur (baksteen, donker)
const QUAY=(()=>{const x=288,y=384,b=hex('#5e4b40'),m=hex('#3d3029');for(let a=0;a<16;a++)for(let d=0;d<16;d++){const n=(hash(x+d,y+a,5)-.5)*14,c=(a%4===3||(d+(Math.floor(a/4)%2)*4)%8===7)?m:b;px(A,x+d,y+a,[c[0]+n,c[1]+n,c[2]+n])}return tileUV(x,y,16,16)})();

/* =================== grond: één grote pixeltextuur van de hele stad =================== */
const GP=4;
function groundCanvas(){
  const cv=document.createElement('canvas');cv.width=W*GP;cv.height=H*GP;const cx=cv.getContext('2d'),img=cx.createImageData(cv.width,cv.height),d=img.data;
  const C={grass:hex('#4f8a3a'),grass2:hex('#5d9a44'),road:hex('#3a3c42'),walk:hex('#a7a49c'),walk2:hex('#8f8c84'),sand:hex('#e2cf98'),plaza:hex('#9a8f80'),plaza2:hex('#857a6c'),
    lot:hex('#55534e'),dock:hex('#8a8c8e'),yard:hex('#6e7072'),bridge:hex('#7b6a5a'),park:hex('#3f7a34'),garden:hex('#4c8c3e'),path:hex('#c2b28a')};
  const G=M.ground;
  for(let Y=0;Y<cv.height;Y++){const z=(Y/GP)|0;for(let X=0;X<cv.width;X++){const x=(X/GP)|0,t=G[z*W+x],o=(Y*cv.width+X)*4,n=(hash(X,Y,1)-.5);let c,a=255;
    switch(t){
    case T.WATER:a=0;c=[0,0,0];break;
    case T.ROAD:c=shade(C.road,1+n*.12);break;
    case T.WALK:{const gx=X%8,gy=Y%8;c=(gx===0||gy===0)?C.walk2:shade(C.walk,1+n*.08);break}
    case T.SAND:c=shade(C.sand,1+n*.1);break;
    case T.PLAZA:{const gx=X%6,gy=(Y+((X/6|0)%2)*3)%6;c=(gx===0||gy===0)?C.plaza2:shade(C.plaza,1+n*.1);break}
    case T.LOT:c=C.lot;break;
    case T.DOCK:{c=shade(C.dock,1+n*.1);if(X%32===0||Y%32===0)c=shade(C.dock,.85);break}
    case T.YARD:c=shade(C.yard,1+n*.08);break;
    case T.BRIDGE:{c=M.bridgeWalk[z*W+x]?((X%8===0)?shade(C.bridge,.8):shade(C.bridge,1+n*.1)):shade(C.road,1+n*.12);break}
    case T.PARK:c=shade(hash(X>>2,Y>>2,2)<.5?C.park:C.grass,1+n*.14);break;
    case T.GARDEN:c=shade(hash(X>>2,Y>>2,3)<.5?C.garden:C.grass2,1+n*.12);break;
    default:c=shade(hash(X>>2,Y>>2,4)<.5?C.grass:C.grass2,1+n*.14)}
    if(t===T.GRASS||t===T.PARK||t===T.GARDEN){const r=hash(X,Y,11);if(r<.006)c=[[236,224,96],[240,240,236],[214,96,120],[150,120,220]][(r*1000|0)%4];else if(r<.06)c=shade(c,.82);else if(r>.97)c=shade(c,1.12)}
    if(t===T.ROAD){const r=hash(X>>1,Y>>1,12);if(r<.012)c=shade(c,.8);else if(r>.994)c=shade(c,1.25)}
    d[o]=cl(c[0]);d[o+1]=cl(c[1]);d[o+2]=cl(c[2]);d[o+3]=a}}
  cx.putImageData(img,0,0);
  // wegmarkering: streep in het midden (niet op kruisingen), zebrapaden bij elke kruising
  cx.fillStyle='#e8e4d8';
  const inX=(x)=>M.RX.some(q=>Math.abs(q-x)<=M.RW+M.SW),inZ=(z)=>M.RZ.some(q=>Math.abs(q-z)<=M.RW+M.SW);
  M.RX.forEach(x=>{for(let z=M.RZ[0];z<M.RZ[3];z+=1){if(inZ(z))continue;if(Math.floor(z/2)%2===0)cx.fillRect(x*GP-1,z*GP,2,GP)}});
  M.RZ.forEach(z=>{for(let x=M.RX[0];x<340;x+=1){if(inX(x)||(x>=185&&x<197&&false))continue;if(Math.floor(x/2)%2===0)cx.fillRect(x*GP,z*GP-1,GP,2)}});
  const zebraV=(x,z)=>{for(let k=-M.RW+1;k<M.RW;k+=1)cx.fillRect((x+k)*GP,z*GP,GP-2,GP*2)};
  const zebraH=(x,z)=>{for(let k=-M.RW+1;k<M.RW;k+=1)cx.fillRect(x*GP,(z+k)*GP,GP*2,GP-2)};
  M.RX.forEach(x=>M.RZ.forEach(z=>{zebraV(x,z-M.RW-2);zebraV(x,z+M.RW);if(x>M.RX[0])zebraH(x-M.RW-2,z);zebraH(x+M.RW,z)}));
  // kade-rand: gele lijn langs het havenwater
  cx.fillStyle='#d8b23a';for(let z=6;z<200;z++)for(let x=300;x<378;x++){if(G[z*W+x]===T.DOCK&&(G[z*W+x+1]===T.WATER||G[(z+1)*W+x]===T.WATER||G[(z-1)*W+x]===T.WATER))cx.fillRect(x*GP,z*GP,GP,GP)}
  // stoeprand: lichte rand op de stoep, donkere goot op de weg
  const R=t=>t===T.ROAD,Wk=t=>t===T.WALK||t===T.PLAZA;
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){const t=G[z*W+x];if(!Wk(t))continue;
    if(R(G[z*W+x+1])){cx.fillStyle='#cfccc4';cx.fillRect(x*GP+GP-1,z*GP,1,GP);cx.fillStyle='#24262a';cx.fillRect((x+1)*GP,z*GP,1,GP)}
    if(R(G[z*W+x-1])){cx.fillStyle='#cfccc4';cx.fillRect(x*GP,z*GP,1,GP);cx.fillStyle='#24262a';cx.fillRect(x*GP-1,z*GP,1,GP)}
    if(R(G[(z+1)*W+x])){cx.fillStyle='#cfccc4';cx.fillRect(x*GP,z*GP+GP-1,GP,1);cx.fillStyle='#24262a';cx.fillRect(x*GP,(z+1)*GP,GP,1)}
    if(R(G[(z-1)*W+x])){cx.fillStyle='#cfccc4';cx.fillRect(x*GP,z*GP,GP,1);cx.fillStyle='#24262a';cx.fillRect(x*GP,z*GP-1,GP,1)}}
  // schuim langs de waterlijn op het strand
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){if(G[z*W+x]!==T.SAND)continue;if(G[(z+1)*W+x]===T.WATER){for(let k=0;k<GP;k++)if(hash(x*GP+k,z,13)<.7){cx.fillStyle='#f4f1e6';cx.fillRect(x*GP+k,z*GP+GP-1-(hash(x*GP+k,z,14)*2|0),1,1)}}}
  // putdeksels in de weg
  M.RX.forEach(x=>{for(let z=M.RZ[0]+10;z<M.RZ[3];z+=23){if(M.RZ.some(q=>Math.abs(q-z)<8))continue;const X0=(x+2)*GP,Y0=z*GP;cx.fillStyle='#2a2c30';cx.fillRect(X0-2,Y0-1,5,3);cx.fillRect(X0-1,Y0-2,3,5);cx.fillStyle='#4a4d54';cx.fillRect(X0-1,Y0-1,3,3);cx.fillStyle='#2a2c30';cx.fillRect(X0,Y0-1,1,3)}});
  // zachte schaduw rond gebouwen en muren op de grond
  const soft=(x0,z0,x1,z1,n)=>{for(let k=n;k>=1;k--){cx.fillStyle=`rgba(0,0,0,${.07})`;cx.fillRect(x0*GP-k,z0*GP-k,(x1-x0)*GP+2*k,(z1-z0)*GP+2*k)}};
  M.buildings.forEach(b=>soft(b.x0,b.z0,b.x1,b.z1,6));M.props.forEach(p=>{if(p.k==='wall')soft(p.x0,p.z0,p.x1,p.z1,4);if(p.k==='container')soft(p.x-(p.rot?1.5:3.5),p.z-(p.rot?3.5:1.5),p.x+(p.rot?1.5:3.5),p.z+(p.rot?3.5:1.5),3);if(p.k==='hedge')soft(p.x-1,p.z-1,p.x+1,p.z+1,2)});
  // lege kavels: grind met een betonrand (wordt bebouwd als je de zaak koopt)
  M.places.forEach(p=>{if(!p.rect)return;const r=p.rect;for(let Y=r.z0*GP;Y<r.z1*GP;Y++)for(let X=r.x0*GP;X<r.x1*GP;X++){const n=hash(X,Y,21);cx.fillStyle=n<.08?'#4a3e30':n>.9?'#8a7a62':'#6b5c48';cx.fillRect(X,Y,1,1)}
    cx.strokeStyle='#9a968c';cx.lineWidth=2;cx.strokeRect(r.x0*GP+1,r.z0*GP+1,(r.x1-r.x0)*GP-2,(r.z1-r.z0)*GP-2)});
  // tuinpaden in het park
  cx.fillStyle=css(C.path);[[6,114,23,116],[37,62,73,64],[54,43,56,81],[123,17,185,19],[150,6,152,29],[6,17,46,19]].forEach(([a,b,c,e])=>cx.fillRect(a*GP,b*GP,(c-a)*GP,(e-b)*GP));
  // parkeervakken voor het politiebureau, plein-cirkel
  cx.strokeStyle='#e8e4d8';cx.lineWidth=1;[142,150,158,166].forEach(x=>{cx.beginPath();cx.moveTo(x*GP+.5,125*GP);cx.lineTo(x*GP+.5,132*GP);cx.stroke()});
  cx.fillStyle='#b4a894';for(let a=0;a<64;a++){const t=a/64*Math.PI*2;cx.fillRect(Math.round((229+Math.cos(t)*6)*GP),Math.round((119+Math.sin(t)*6)*GP),GP,GP)}
  return cv}
// kleine kaart (1 pixel per meter) voor de minikaart en de grote kaart
function mapCanvas(){const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d'),img=cx.createImageData(W,H),d=img.data;
  const C={};C[T.WATER]='#1d3d55';C[T.ROAD]='#3b3e45';C[T.WALK]='#7c7a74';C[T.SAND]='#c9b47c';C[T.PLAZA]='#7d7366';C[T.LOT]='#2a2c30';C[T.DOCK]='#6a6c6e';C[T.YARD]='#55575a';C[T.BRIDGE]='#6a5a4a';C[T.PARK]='#2f5f2a';C[T.GARDEN]='#3a6d32';C[T.GRASS]='#3c6c30';
  const CC={};Object.keys(C).forEach(k=>CC[k]=hex(C[k]));
  for(let i=0;i<W*H;i++){const c=CC[M.ground[i]]||CC[T.GRASS];d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=255}
  cx.putImageData(img,0,0);
  M.buildings.forEach(b=>{const k=Math.min(1,.45+b.fl*.04);cx.fillStyle=b.pl?'#c9a86a':css(shade([120,118,112],k));cx.fillRect(b.x0,b.z0,b.x1-b.x0,b.z1-b.z0)});
  return cv}

/* =================== geometrie-bouwer =================== */
function GB(){this.p=[];this.n=[];this.u=[];this.t=[]}
GB.prototype.tri=function(a,b,c,ua,ub,uc,tile){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  for(const [p,u] of [[a,ua],[b,ub],[c,uc]]){this.p.push(p[0],p[1],p[2]);this.n.push(nx,ny,nz);this.u.push(u[0],u[1]);this.t.push(tile[0],tile[1],tile[2],tile[3])}};
// a,b,c,d tegen de klok in, van buitenaf gezien (linksonder, rechtsonder, rechtsboven, linksboven)
GB.prototype.quad=function(a,b,c,d,u0,v0,u1,v1,tile){this.tri(a,b,c,[u0,v0],[u1,v0],[u1,v1],tile);this.tri(a,c,d,[u0,v0],[u1,v1],[u0,v1],tile)};
// kist met per vlak een tegel; uvScale: hoeveel herhalingen per meter (0 = 1 keer per vlak)
GB.prototype.box=function(x0,y0,z0,x1,y1,z1,tile,o){o=o||{};const ts=o.side||tile,tt=o.top||tile,us=o.us||0;
  const U=(len)=>us?len*us:1,dx=x1-x0,dy=y1-y0,dz=z1-z0,vy=us?dy*us:1;
  this.quad([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],0,0,U(dx),vy,ts);
  this.quad([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],0,0,U(dx),vy,ts);
  this.quad([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],0,0,U(dz),vy,ts);
  this.quad([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],0,0,U(dz),vy,ts);
  if(!o.noTop)this.quad([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],0,0,U(dx),us?dz*us:1,tt);
  if(o.bottom)this.quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],0,0,1,1,tt)};
// kist om een middelpunt, eventueel 90° gedraaid
GB.prototype.cbox=function(cx,cz,w,d,y0,y1,tile,rot,o){if(rot){const t=w;w=d;d=t}this.box(cx-w/2,y0,cz-d/2,cx+w/2,y1,cz+d/2,tile,o)};
GB.prototype.mesh=function(mat){const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new TH.Float32BufferAttribute(this.n,3));
  g.setAttribute('uv',new TH.Float32BufferAttribute(this.u,2));g.setAttribute('aTile',new TH.Float32BufferAttribute(this.t,4));g.computeBoundingSphere();return new TH.Mesh(g,mat)};

// materiaal: textuuratlas met tegels die zich herhalen, plus 's nachts verlichte ramen
const U={uNight:{value:0},uLit:{value:null}};
function atlasMat(tex,litTex){const m=new TH.MeshLambertMaterial({map:tex});U.uLit.value=litTex;
  m.onBeforeCompile=sh=>{sh.uniforms.uNight=U.uNight;sh.uniforms.uLit=U.uLit;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aTile;\nvarying vec4 vTile;\nvarying vec2 vAo;').replace('#include <uv_vertex>','#include <uv_vertex>\nvTile=aTile;').replace('#include <project_vertex>','#include <project_vertex>\nvAo=vec2((modelMatrix*vec4(transformed,1.)).y,abs(normal.y));');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vTile;\nvarying vec2 vAo;\nuniform sampler2D uLit;\nuniform float uNight;')
      .replace('#include <map_fragment>','vec2 aUv=vTile.xy+clamp(fract(vMapUv),.002,.998)*vTile.zw;\nvec4 sampledDiffuseColor=texture2D(map,aUv);\ndiffuseColor*=sampledDiffuseColor;\nif(vAo.y<.5)diffuseColor.rgb*=mix(.58,1.,smoothstep(-.4,2.4,vAo.x));')
      .replace('#include <emissivemap_fragment>','totalEmissiveRadiance+=texture2D(uLit,aUv).rgb*uNight;')};
  m.customProgramCacheKey=()=>'stad-atlas';return m}

/* =================== de stad bouwen =================== */
const PROPC={trunk:'#5a3d26',leaf:['#2f6e2a','#3c8a34','#4f7a26'],pine:'#24502a',palm:'#3f8a3a',lamp:'#2a2d32',bench:'#6a4a2c',hedge:'#2f6a2c',wall:'#8a8c90',stone:'#b7ad9a',gold:'#d6a63e',glass:'#2a3f52',tire:'#1c1d20',
  car:['#c23b2e','#2f5d9a','#e8e4da','#2a2c30','#d7a530','#3f7a4a','#7a3c8a']};
// één gebouw (blok met gevels en dak) in de bouwer; ook gebruikt voor je eigen panden (stad-lots.js)
function drawBuilding(gb,b,bi){const s=SLOT[b.st]||SLOT.brick,h=b.fl*FL,dx=b.x1-b.x0,dz=b.z1-b.z0,uOff=Math.floor(hash(bi,1,2)*4)/4,vOff=hash(bi,2,2)<.5?0:.5;
    const face=(a,bq,len)=>{const bays=Math.max(1,Math.round(len/3.4))/4;
      // begane grond
      gb.quad([a[0],0,a[1]],[bq[0],0,bq[1]],[bq[0],FL,bq[1]],[a[0],FL,a[1]],uOff,0,uOff+bays,1,s.gnd);
      if(b.fl>1)gb.quad([a[0],FL,a[1]],[bq[0],FL,bq[1]],[bq[0],h,bq[1]],[a[0],h,a[1]],uOff,vOff,uOff+bays,vOff+(b.fl-1)/2,s.up)};
    face([b.x0,b.z1],[b.x1,b.z1],dx);face([b.x1,b.z0],[b.x0,b.z0],dx);face([b.x1,b.z1],[b.x1,b.z0],dz);face([b.x0,b.z0],[b.x0,b.z1],dz);
    if(b.roof==='gableX'||b.roof==='gableZ'){const alongX=b.roof==='gableX',D=alongX?dz:dx,rh=Math.min(D*.42,4.2),rt=ROOFT[bi%3],top=h+rh,ov=.35;
      if(alongX){const zm=(b.z0+b.z1)/2;
        gb.quad([b.x1+ov,h-.2,b.z0-ov],[b.x0-ov,h-.2,b.z0-ov],[b.x0-ov,top,zm],[b.x1+ov,top,zm],0,0,dx/4,rh/2,rt);
        gb.quad([b.x0-ov,h-.2,b.z1+ov],[b.x1+ov,h-.2,b.z1+ov],[b.x1+ov,top,zm],[b.x0-ov,top,zm],0,0,dx/4,rh/2,rt);
        gb.tri([b.x0,h,b.z0],[b.x0,h,b.z1],[b.x0,top,zm],[0,0],[1,0],[.5,1],swatch(STY[b.st]?STY[b.st].w:'#8a3b2a'));
        gb.tri([b.x1,h,b.z1],[b.x1,h,b.z0],[b.x1,top,zm],[0,0],[1,0],[.5,1],swatch(STY[b.st]?STY[b.st].w:'#8a3b2a'))}
      else{const xm=(b.x0+b.x1)/2;
        gb.quad([b.x0-ov,h-.2,b.z0-ov],[b.x0-ov,h-.2,b.z1+ov],[xm,top,b.z1+ov],[xm,top,b.z0-ov],0,0,dz/4,rh/2,rt);
        gb.quad([b.x1+ov,h-.2,b.z1+ov],[b.x1+ov,h-.2,b.z0-ov],[xm,top,b.z0-ov],[xm,top,b.z1+ov],0,0,dz/4,rh/2,rt);
        gb.tri([b.x0,h,b.z1],[b.x1,h,b.z1],[xm,top,b.z1],[0,0],[1,0],[.5,1],swatch(STY[b.st]?STY[b.st].w:'#8a3b2a'));
        gb.tri([b.x1,h,b.z0],[b.x0,h,b.z0],[xm,top,b.z0],[0,0],[1,0],[.5,1],swatch(STY[b.st]?STY[b.st].w:'#8a3b2a'))}}
    else{gb.quad([b.x0,h,b.z1],[b.x1,h,b.z1],[b.x1,h,b.z0],[b.x0,h,b.z0],0,0,dx/16,dz/4,s.roof);
      // dakrand
      const rc=swatch(STY[b.st]?STY[b.st].m:'#666'),e=.3;gb.box(b.x0,h,b.z0,b.x1,h+.5,b.z0+e,rc);gb.box(b.x0,h,b.z1-e,b.x1,h+.5,b.z1,rc);gb.box(b.x0,h,b.z0,b.x0+e,h+.5,b.z1,rc);gb.box(b.x1-e,h,b.z0,b.x1,h+.5,b.z1,rc);
      if(dx*dz>90&&!b.pl){const n=1+(hash(bi,5,1)*2|0);for(let k=0;k<n;k++){const ax=b.x0+2+hash(bi,k,8)*(dx-5),az=b.z0+2+hash(bi,k,9)*(dz-5);gb.box(ax,h,az,ax+1.6,h+1.2,az+1.2,swatch('#9a9ca0'),{top:swatch('#7d8084')})}}}
  }
function buildCity(){
  const gb=new GB();
  // gebouwen
  M.buildings.forEach((b,bi)=>drawBuilding(gb,b,bi));
  // deuren van de bijzondere plekken
  M.places.forEach(p=>{if(p.dyn)return;const b=M.buildings[p.b],e=.04,w=1.3,dh=2.6;let x=p.door.x,z=p.door.z;
    if(p.face==='S')gb.quad([x-w,0,b.z1+e],[x+w,0,b.z1+e],[x+w,dh,b.z1+e],[x-w,dh,b.z1+e],0,0,1,1,DOORT);
    if(p.face==='N')gb.quad([x+w,0,b.z0-e],[x-w,0,b.z0-e],[x-w,dh,b.z0-e],[x+w,dh,b.z0-e],0,0,1,1,DOORT);
    if(p.face==='E')gb.quad([b.x1+e,0,z+w],[b.x1+e,0,z-w],[b.x1+e,dh,z-w],[b.x1+e,dh,z+w],0,0,1,1,DOORT);
    if(p.face==='W')gb.quad([b.x0-e,0,z-w],[b.x0-e,0,z+w],[b.x0-e,dh,z+w],[b.x0-e,dh,z-w],0,0,1,1,DOORT)});
  // kademuren: overal waar land aan water grenst
  const G=M.ground,isW=(x,z)=>x<0||z<0||x>=W||z>=H||G[z*W+x]===T.WATER;
  for(let z=0;z<H;z++)for(let x=0;x<W;x++){if(isW(x,z))continue;const y0=-1.3;
    if(isW(x,z+1))gb.quad([x,y0,z+1],[x+1,y0,z+1],[x+1,0,z+1],[x,0,z+1],0,0,.25,.33,QUAY);
    if(isW(x,z-1))gb.quad([x+1,y0,z],[x,y0,z],[x,0,z],[x+1,0,z],0,0,.25,.33,QUAY);
    if(isW(x+1,z))gb.quad([x+1,y0,z+1],[x+1,y0,z],[x+1,0,z],[x+1,0,z+1],0,0,.25,.33,QUAY);
    if(isW(x-1,z))gb.quad([x,y0,z],[x,y0,z+1],[x,0,z+1],[x,0,z],0,0,.25,.33,QUAY)}
  // bruggen: reling en een stenen rand
  M.bridges.forEach(b=>{const st=swatch(PROPC.stone),ir=swatch('#2a2d32');gb.box(b.x0,-.9,b.z0,b.x1,.05,b.z0+.6,st);gb.box(b.x0,-.9,b.z1-.6,b.x1,.05,b.z1,st);
    gb.box(b.x0,0,b.z0,b.x1,1.0,b.z0+.25,ir,{});gb.box(b.x0,0,b.z1-.25,b.x1,1.0,b.z1,ir);for(let x=b.x0;x<=b.x1;x+=2){gb.box(x-.15,0,b.z0,x+.15,1.1,b.z0+.35,st);gb.box(x-.15,0,b.z1-.35,x+.15,1.1,b.z1,st)}});
  // spullen
  M.props.forEach((p,pi)=>{const r=hash(pi,3,3);switch(p.k){
   case 'tree':{const s=p.s||1;gb.cbox(p.x,p.z,.5*s,.5*s,0,1.8*s,swatch(PROPC.trunk));
     if(p.v===1){const c=swatch(PROPC.pine);gb.cbox(p.x,p.z,2.6*s,2.6*s,1.2*s,2.4*s,c);gb.cbox(p.x,p.z,1.9*s,1.9*s,2.4*s,3.5*s,c);gb.cbox(p.x,p.z,1.1*s,1.1*s,3.5*s,4.5*s,c)}
     else{const c=swatch(PROPC.leaf[p.v===2?2:r<.5?0:1]);gb.cbox(p.x,p.z,2.8*s,2.8*s,1.6*s,3.4*s,c);gb.cbox(p.x,p.z,2*s,2*s,3.4*s,4.3*s,c)}break}
   case 'palm':{const s=p.s||1,tr=swatch('#8a6a42'),lf=swatch(PROPC.palm);for(let k=0;k<5;k++)gb.cbox(p.x+k*.08,p.z,.45,.45,k*1.1*s,(k+1)*1.1*s,tr);const ty=5.5*s,tx=p.x+.4;
     [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c])=>gb.box(Math.min(tx,tx+a*2.4),ty-.15-(a||c?.0:0),Math.min(p.z,p.z+c*2.4)-(a?.35:0),Math.max(tx,tx+a*2.4)+(c?.35:0),ty+.15,Math.max(p.z,p.z+c*2.4)+(a?.35:0)-(c?0:0),lf));gb.cbox(tx,p.z,.9,.9,ty-.2,ty+.4,lf);break}
   case 'umbrella':{const cols=['#e8584a','#f0b23a','#3a8ad6','#ffffff'];gb.cbox(p.x,p.z,.12,.12,0,2.2,swatch('#e0e0e0'));gb.cbox(p.x,p.z,2.4,2.4,2.1,2.35,swatch(cols[p.v%4]));gb.box(p.x+.4,0,p.z-.4,p.x+2.2,.06,p.z+.5,swatch(cols[(p.v+1)%4]));break}
   case 'lamp':{const c=swatch(PROPC.lamp);gb.cbox(p.x,p.z,.18,.18,0,4.2,c);gb.cbox(p.x,p.z,.5,.5,4.2,4.5,swatch('#3a3d42','#ffe2a0'),0,{});gb.cbox(p.x,p.z,.36,.36,3.95,4.2,swatch('#fff3c8','#ffe9a8'));break}
   case 'bench':{const c=swatch(PROPC.bench);gb.cbox(p.x,p.z,1.8,.6,.45,.6,c,p.rot%2);gb.cbox(p.x,p.z,.12,.5,0,.45,swatch(PROPC.lamp),p.rot%2);break}
   case 'container':{const w=7,d=3,t=CONT[p.v%5];for(let k=0;k<p.h;k++){const y0=k*2.6;if(p.rot)gb.box(p.x-d/2,y0,p.z-w/2,p.x+d/2,y0+2.5,p.z+w/2,t,{us:.6,top:t});else gb.box(p.x-w/2,y0,p.z-d/2,p.x+w/2,y0+2.5,p.z+d/2,t,{us:.6,top:t})}break}
   case 'crane':{const c=swatch('#d8a52a'),dk=swatch('#3a3d42');[[-2,-2],[2,-2],[-2,2],[2,2]].forEach(([a,b])=>gb.cbox(p.x+a,p.z+b,.5,.5,0,16,c));gb.box(p.x-2.5,15,p.z-2.5,p.x+2.5,16.5,p.z+2.5,c);
     gb.box(p.x-6,16.5,p.z-.6,p.x+24,17.5,p.z+.6,c);gb.box(p.x-1,16.5,p.z-1.2,p.x+1.5,19,p.z+1.2,dk);gb.cbox(p.x+16,p.z,.1,.1,8,16.5,dk);gb.cbox(p.x+16,p.z,1.2,1.2,7.4,8,dk);break}
   case 'car':case 'police':{const pol=p.k==='police',col=pol?'#eef0f2':PROPC.car[p.v%7],rot=p.rot;gb.cbox(p.x,p.z,1.9,4.2,.3,1.05,swatch(col),rot?0:1);
     gb.cbox(p.x,p.z,1.7,2.2,1.05,1.65,swatch(PROPC.glass,'#000000'),rot?0:1,{top:swatch(col)});
     if(pol){gb.cbox(p.x,p.z,1.92,1.2,.55,.8,swatch('#1f4ea8'),rot?0:1);gb.cbox(p.x,p.z,1.2,.4,1.65,1.85,swatch('#2a5fd8','#3a6aff'),rot?0:1)}
     const tw=swatch(PROPC.tire);[[-.85,-1.3],[.85,-1.3],[-.85,1.3],[.85,1.3]].forEach(([a,b])=>gb.cbox(p.x+(rot?a:b),p.z+(rot?b:a),rot?.3:.7,rot?.7:.3,0,.6,tw));
     const hl=swatch('#fff3c8','#fff3c8');gb.cbox(p.x+(rot?-.6:2.1),p.z+(rot?2.1:-.6),rot?.4:.08,rot?.08:.4,.6,.85,hl);gb.cbox(p.x+(rot?.6:2.1),p.z+(rot?2.1:.6),rot?.4:.08,rot?.08:.4,.6,.85,hl);break}
   case 'statue':{gb.cbox(p.x,p.z,4,4,0,1.2,swatch(PROPC.stone));gb.cbox(p.x,p.z,2.6,2.6,1.2,2.6,swatch('#a89e8a'));const gd=swatch(PROPC.gold,'#3a2a08');
     gb.cbox(p.x,p.z,.9,.6,2.6,4.2,gd);gb.cbox(p.x,p.z,1.2,.7,4.2,5.4,gd);gb.cbox(p.x,p.z,.6,.6,5.4,6.0,gd);gb.box(p.x+.55,4.9,p.z-.2,p.x+.85,6.6,p.z+.2,gd);break}
   case 'hedge':gb.cbox(p.x,p.z,2,2,0,1.6,swatch(PROPC.hedge,null,18));break;
   case 'wall':gb.box(p.x0,0,p.z0,p.x1,4.2,p.z1,swatch(PROPC.wall,null,10),{top:swatch('#5a5c60')});gb.box(p.x0,4.2,p.z0,p.x1,4.6,p.z1,swatch('#3a3c40'));break;
   case 'tower':{const c=swatch('#7d7f82');gb.cbox(p.x,p.z,3,3,0,8,c);gb.cbox(p.x,p.z,3.8,3.8,8,10,swatch('#4a4c50','#ffe9a8'));gb.cbox(p.x,p.z,4.2,4.2,10,10.4,swatch('#3a3c40'));break}
   case 'gate':{gb.box(p.x-3,0,p.z-.6,p.x+3,4.6,p.z+.6,swatch('#2c2e32'),{});for(let x=p.x-2.6;x<p.x+3;x+=.7)gb.box(x,0,p.z+.6,x+.18,4.4,p.z+.8,swatch('#55585e'));gb.box(p.x-3.4,4.6,p.z-.8,p.x+3.4,5.3,p.z+.8,swatch('#3a3c40'));break}
  }});
  return gb}

/* =================== poppetjes (alle mensen in twee keer tekenen) =================== */
// Onderdelen: benen, schoenen, romp, armen, handen, hoofd, haar/pet, klep, ogen. Elk onderdeel is één InstancedMesh.
const PARTS=['legL','legR','shoeL','shoeR','torso','armL','armR','handL','handR','head','hair','brim','eyes'];
function makeHumans(scene,max){
  const mat=new TH.MeshLambertMaterial({color:0xffffff});
  const geo={};const bx=(w,h,d,py)=>{const g=new TH.BoxGeometry(w,h,d);g.translate(0,py,0);return g};
  geo.legL=geo.legR=bx(.26,.82,.3,-.41);geo.shoeL=geo.shoeR=bx(.3,.16,.42,-.08);geo.torso=bx(.62,.72,.36,.36);
  geo.armL=geo.armR=bx(.2,.66,.24,-.33);geo.handL=geo.handR=bx(.2,.16,.22,-.08);geo.head=bx(.5,.5,.48,.25);geo.hair=bx(.54,.2,.52,.1);geo.brim=bx(.52,.06,.3,.03);geo.eyes=bx(.32,.07,.02,0);
  const im={};PARTS.forEach(k=>{const m=new TH.InstancedMesh(geo[k],mat,max);m.instanceMatrix.setUsage(TH.DynamicDrawUsage);m.castShadow=k!=='eyes'&&k!=='brim';m.receiveShadow=false;m.frustumCulled=false;m.count=0;scene.add(m);im[k]=m;
    m.setColorAt(0,new TH.Color(1,1,1))});
  // röntgen-silhouet voor de speler achter gebouwen
  const xm=new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.42,depthWrite:false,depthFunc:TH.GreaterDepth});
  const xr={};['legL','legR','torso','armL','armR','head','hair'].forEach(k=>{const m=new TH.InstancedMesh(geo[k],xm,1);m.renderOrder=10;m.frustumCulled=false;m.count=1;scene.add(m);xr[k]=m});
  const o=new TH.Object3D(),q=new TH.Matrix4(),tmp=new TH.Matrix4(),col=new TH.Color(),root=new TH.Matrix4(),rot=new TH.Matrix4();
  const set=(k,i,m)=>im[k].setMatrixAt(i,m);
  const hide=new TH.Matrix4().makeScale(0,0,0);
  // h: {x,z,ry,ph (loopfase),sp (snelheid 0..1),look:{skin,hair,top,arm,pants,shoe,hat:'none|cap|beanie|hat|mask',hatC}}
  const SC=new TH.Matrix4().makeScale(1.18,1.18,1.18);
  function pose(i,h){root.makeRotationY(h.ry);root.setPosition(h.x,h.y||0,h.z);root.multiply(SC);const sw=Math.sin(h.ph)*.75*Math.min(1,h.sp),bob=Math.abs(Math.cos(h.ph))*.06*Math.min(1,h.sp),lean=h.lean||0;
    const at=(k,x,y,z,rx,sx,sy,sz)=>{tmp.makeRotationX(rx||0);q.makeTranslation(x,y+bob,z).multiply(tmp);if(sx!=null)q.scale(new TH.Vector3(sx,sy,sz));tmp.multiplyMatrices(root,q);set(k,i,tmp);return tmp};
    at('legL',-.15,.84,0,sw);at('legR',.15,.84,0,-sw);
    // schoenen aan het eind van het been
    q.makeTranslation(-.15,.84+bob,0).multiply(rot.makeRotationX(sw)).multiply(tmp.makeTranslation(0,-.74,.06));set('shoeL',i,tmp.multiplyMatrices(root,q));
    q.makeTranslation(.15,.84+bob,0).multiply(rot.makeRotationX(-sw)).multiply(tmp.makeTranslation(0,-.74,.06));set('shoeR',i,tmp.multiplyMatrices(root,q));
    at('torso',0,.84,0,lean);
    const asw=-sw*.8+(h.arm||0);at('armL',-.41,1.5,0,asw);at('armR',.41,1.5,0,h.armR!=null?h.armR:-asw);
    q.makeTranslation(-.41,1.5+bob,0).multiply(rot.makeRotationX(asw)).multiply(tmp.makeTranslation(0,-.62,0));set('handL',i,tmp.multiplyMatrices(root,q));
    q.makeTranslation(.41,1.5+bob,0).multiply(rot.makeRotationX(h.armR!=null?h.armR:-asw)).multiply(tmp.makeTranslation(0,-.62,0));set('handR',i,tmp.multiplyMatrices(root,q));
    at('head',0,1.56,0,0);
    const hat=h.look.hat||'none';
    if(hat==='hat'){at('hair',0,2.0,0,0,1.06,1.6,1.06);at('brim',0,2.0,0,0,1.5,1,2.6)}
    else if(hat==='cap'){at('hair',0,1.98,0,0,1,1.1,1);at('brim',0,1.98,.32,0,1,1,1)}
    else if(hat==='beanie'){at('hair',0,1.92,0,0,1.04,1.8,1.04);set('brim',i,hide)}
    else if(hat==='mask'){at('hair',0,1.52,0,0,1.06,2.75,1.06);set('brim',i,hide)}
    else if(hat==='bald'){set('hair',i,hide);set('brim',i,hide)}
    else{at('hair',0,1.94,-.02,0);set('brim',i,hide)}
    at('eyes',0,1.83,.25,0);
    const L=h.look,c=(k,v)=>{col.set(v);im[k].setColorAt(i,col)};
    c('legL',L.pants);c('legR',L.pants);c('shoeL',L.shoe);c('shoeR',L.shoe);c('torso',L.top);c('armL',L.arm||L.top);c('armR',L.arm||L.top);c('handL',L.skin);c('handR',L.skin);c('head',L.skin);
    c('hair',hat==='none'||hat==='bald'?L.hair:L.hatC||L.hair);c('brim',L.hatC||L.hair);c('eyes',hat==='mask'?'#e8e4da':'#15161a')}
  return {im,count(n){PARTS.forEach(k=>{im[k].count=n})},pose,
    flush(){PARTS.forEach(k=>{im[k].instanceMatrix.needsUpdate=true;if(im[k].instanceColor)im[k].instanceColor.needsUpdate=true})},
    xray(on){['legL','legR','torso','armL','armR','head','hair'].forEach(k=>{const m=xr[k];m.visible=on;if(on){im[k].getMatrixAt(0,q);m.setMatrixAt(0,q);m.instanceMatrix.needsUpdate=true}})}};
}

/* =================== naambordjes en markeringen bij de ingangen =================== */
function textCanvas(text,fg,bg,border){const cv=document.createElement('canvas'),cx=cv.getContext('2d');cx.font='bold 9px monospace';const w=Math.ceil(cx.measureText(text).width)+8;
  cv.width=w;cv.height=13;cx.fillStyle=bg;cx.fillRect(0,0,w,13);if(border){cx.fillStyle=border;cx.fillRect(0,0,w,1);cx.fillRect(0,12,w,1);cx.fillRect(0,0,1,13);cx.fillRect(w-1,0,1,13)}
  cx.font='bold 9px monospace';cx.fillStyle=fg;cx.textBaseline='middle';cx.fillText(text,4,7);
  // scherpe pixels: halfdoorzichtige randjes weghalen
  const im=cx.getImageData(0,0,w,13),d=im.data,f=hex(fg),b=hex(bg);for(let i=0;i<d.length;i+=4){const lum=(d[i]+d[i+1]+d[i+2])/3,fl=(f[0]+f[1]+f[2])/3,bl=(b[0]+b[1]+b[2])/3;const t=Math.abs(fl-bl)<1?0:(lum-bl)/(fl-bl);const c=t>.45?f:(Math.abs(d[i]-b[0])<40?b:[d[i],d[i+1],d[i+2]]);if(t>.45||t<.2){d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2]}}
  cx.putImageData(im,0,0);return cv}
const SIGNC={casino:['#ffcf5a','#2a0f2a','#ff4fd8'],bank:['#2a2418','#e9dfc8','#7a705e'],politie:['#ffffff','#1f4ea8','#ffffff'],crimes:['#ffcf5a','#1f2a1f','#c9a24a'],jail:['#e8e4da','#2c2e32','#7b7d80'],
  fam:['#d6b25a','#1a1418','#d6b25a'],hits:['#ff5a4a','#140c0c','#7a1f1f'],shop:['#ffffff','#7a1f1f','#2c2e32'],cars:['#1d1d1f','#f0b23a','#1d1d1f'],werk:['#ffffff','#2e5f9a','#ffffff'],
  skills:['#ffffff','#e8a03a','#38486a'],relax:['#1f4a5a','#bfe8e0','#ffffff'],look:['#d6b25a','#1d1d1f','#d6b25a'],wit:['#1f3a6a','#e8f2ff','#3a7ad6'],biz:['#ffffff','#2b7a55','#ffffff'],verblijf:['#3a2418','#f1e4c8','#7a5a3a']};
function placeMarks(scene){const out=[];
  M.places.forEach(p=>{if(p.dyn)return;const b=M.buildings[p.b],c=SIGNC[p.id]||['#fff','#222','#fff'];const cv=textCanvas(p.sign,c[0],c[1],c[2]),tex=nearestTex(cv);
    const sw=cv.width/13*1.15,sh=1.15,mat=new TH.MeshBasicMaterial({map:tex});const m=new TH.Mesh(new TH.PlaneGeometry(sw,sh),mat);
    const y=Math.min(FL*.98,3.2)+.55,e=.08;let ry=0,x=p.door.x,z=p.door.z;
    if(p.face==='S'){z=b.z1+e;ry=0}else if(p.face==='N'){z=b.z0-e;ry=Math.PI}else if(p.face==='E'){x=b.x1+e;ry=Math.PI/2}else{x=b.x0-e;ry=-Math.PI/2}
    m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);
    // grondring (zoals in GTA): hier sta je goed om naar binnen te gaan
    const ring=new TH.Mesh(new TH.RingGeometry(.75,1.05,16),new TH.MeshBasicMaterial({color:new TH.Color(c[2]==='#ffffff'?c[1]:c[2]),transparent:true,opacity:.85,depthWrite:false}));
    ring.rotation.x=-Math.PI/2;ring.position.set(p.door.x,.06,p.door.z);scene.add(ring);
    const pin=new TH.Mesh(new TH.OctahedronGeometry(.42,0),new TH.MeshBasicMaterial({color:new TH.Color(c[2]==='#ffffff'?c[1]:c[2])}));pin.scale.set(1,1.5,1);pin.position.set(p.door.x,3.0,p.door.z);scene.add(pin);
    out.push({p,ring,pin,sign:m})});
  return out}

// lichtplassen onder de lantaarns ('s nachts): één platte schijf per lamp, opgeteld licht, in pixelringen
function lampPools(scene){const cv=document.createElement('canvas');cv.width=cv.height=32;const cx=cv.getContext('2d');
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const d=Math.hypot(x-15.5,y-15.5)/16;const v=Math.max(0,1-d);const q=Math.floor(v*v*5)/5;cx.fillStyle=`rgba(255,${200+q*40|0},${120+q*60|0},${q})`;cx.fillRect(x,y,1,1)}
  const tex=nearestTex(cv);const L=M.props.filter(p=>p.k==='lamp');
  const mat=new TH.MeshBasicMaterial({map:tex,transparent:true,opacity:0,blending:TH.AdditiveBlending,depthWrite:false});
  const m=new TH.InstancedMesh(new TH.PlaneGeometry(9,9).rotateX(-Math.PI/2),mat,L.length);const o=new TH.Object3D();
  L.forEach((p,i)=>{o.position.set(p.x,.08,p.z);o.updateMatrix();m.setMatrixAt(i,o.matrix)});m.renderOrder=2;scene.add(m);return m}
window.STAD_GFX={drawBuilding,lampPools,SIGNC,ROOFT,DOORT,STY,SLOT,swatch,atlas,lit,groundCanvas,mapCanvas,buildCity,atlasMat,makeHumans,placeMarks,textCanvas,nearestTex,U,GB,hash,PROPC};
})();
