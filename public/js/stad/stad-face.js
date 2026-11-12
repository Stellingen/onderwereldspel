// Pixelstad: grote pixelportretten (48×48) voor gesprekken. Elk personage heeft een eigen gezicht: vorm, kapsel, baard, bril,
// kleding en stemming. De tekening zelf staat sinds het karakter (nov. 2026) in karakter.js (KAR.face), zodat het klikspel
// hetzelfde portret kan tekenen zonder de stad. Velden van look (skin, hair, top, hat, hatC …) plus, alleen voor het portret:
//   hs  kapsel: kort | kuif | zij | opgeschoren | lang | bob | knot | staart | krul | afro | kalend | kaal | hanenkam | vlecht
//   fh  gezichtshaar: stoppel | snor | sik | ringbaard | baard          col kleding: shirt | pak | hoodie | uniform | schort |
//   fw  breedte van het gezicht (16, 18, 20), jaw: rond | hoekig | spits     leer | tank | trui | blouse | track | werk
//   age 0 jong, 1 midden, 2 oud · eye oogkleur · lip lippenstift · v vrouw (wimpers) · w breedte schouders · mouth (karakter)
//   acc {bril, zon, oor, lit, spr, mv, tat, kop, tand, pl, hb}
// mood: neutraal | blij | boos | bang | koel (zonder mood: look.mood)
(function(){
'use strict';
const G=STAD,K=G.kit,shade=K.shade;
// zonder karakter.js (zou niet moeten): K.face blijft leeg en gesprekken vallen terug op het kleine portret
if(window.KAR&&KAR.face)K.face=KAR.face;
// kleine uitbreiding van het pictogram-portret (24×24): dezelfde persoon blijft herkenbaar
const p0=K.portrait;
K.portrait=function(look,mood,cv){const L=look||{},A=L.acc||{};let hat=L.hat||'none';const hs=L.hs||'';const map=Object.assign({},L);
  if(hat==='pet')map.hat='cap';else if(hat==='hijab'||hat==='hood')map.hat='none';if(hat==='none'&&(hs==='kaal'||hs==='kalend'))map.hat='bald';if(hs==='lang'||hs==='bob'||hs==='vlecht')map.long=1;if(L.fh!=null)map.beard=(L.fh==='baard'||L.fh==='ringbaard')?1:0;if(A.bril)map.glasses=1;
  cv=p0(map,mood,cv);const c=cv.getContext('2d'),R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)},sk=L.skin||'#d9a27a',hair=L.hair||'#2a1d14';
  if(hat==='pet'){R(11,4,2,2,'#e8b923')}
  if(hat==='hijab'||hat==='hood'){const hc=hat==='hood'?(L.top||'#30353e'):(L.hatC||'#2a2c30');R(7,3,10,hat==='hijab'?4:3,hc);R(6,4,2,13,hc);R(16,4,2,13,shade(hc,.75));R(8,15,8,3,hc);R(5,17,14,2,hc)}
  if(hat==='none'&&hs==='afro'){R(5,1,14,5,hair);R(4,3,3,8,hair);R(17,3,3,8,hair)}
  if(hat==='none'&&hs==='knot'){R(10,0,4,3,hair)}
  if(hat==='none'&&hs==='kuif'){R(8,2,8,2,hair)}
  if(hat==='none'&&hs==='hanenkam'){R(11,0,2,6,hair)}
  if(L.fh==='snor'){R(9,12,6,1,hair)}if(L.fh==='sik'){R(11,14,2,2,hair)}if(L.fh==='stoppel'){c.globalAlpha=.3;R(7,12,10,4,hair);c.globalAlpha=1}
  if(L.eye&&mood!=='bang'&&mood!=='boos'&&hat!=='mask'){R(9,10,1,1,L.eye);R(13,10,1,1,L.eye)}
  if(A.zon){R(8,9,4,2,'#0c0d10');R(12,9,4,2,'#0c0d10');R(8,9,1,1,'#4a5a6a')}
  if(A.lit)R(16,7,1,5,shade(sk,1.25));
  return cv};
})();
