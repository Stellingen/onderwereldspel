// Verhaal, hoofdstuk 1: de vijf interieurs (G.binnen.add). Lounge Sahara (het visitekaartje), Pizzeria Bella Napoli,
// de flat van de familie De Santis, het klaslokaal van het Westbuurt College en het rijtjeshuis in Oud-Zuid.
// De buitendeuren staan op de plekken uit de verhaalstad (M.A.sahara, M.A.napoli, M.A.thuis, M.A.school, M.A.rijtjeshuis);
// zolang die er niet zijn, tijdelijk op vaste plekken in de Pixelstad-kaart (zie FALLBACK). Bella Napoli volgt G.bezorg.napoli als die er is.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,BN=G.binnen;if(!BN)return;
const shade=K.shade,R=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
const pc=BN.plaatCanvas;
// tijdelijke plekken op de Pixelstad-kaart (stad-map.js) zolang verhaal-map.js er niet is
const FALLBACK={sahara:{x:267,z:507},napoli:{x:213,z:507},thuis:{x:189,z:267.5},school:{x:200.5,z:248},rijtjeshuis:{x:441.5,z:371.6}};
const anker=id=>{const f0=()=>{const A=M.A||{};if(id==='napoli'&&G.bezorg&&G.bezorg.napoli&&G.bezorg.napoli.x!=null)return G.bezorg.napoli;if(A[id]&&A[id].x!=null)return A[id];const f=FALLBACK[id];return f?(M.nearestWalk(f.x,f.z,6)||f):null};return f0};

/* =================== meubels (blokjes rond 0,0; y = midden van het blok) =================== */
const F={
 tafel:(w,d,h,top,poot)=>{h=h||.78;poot=poot||shade(top,.7);const b=[[w,.06,d,0,h-.03,0,top],[w-.04,.03,d-.04,0,h-.075,0,shade(top,.8)]];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>b.push([.07,h-.06,.07,a*(w/2-.08),(h-.06)/2,c*(d/2-.08),poot]));return b},
 rondtafel:(r,h,top,poot)=>{const b=[[r*2,.05,r*1.4,0,h-.025,0,top],[r*1.4,.05,r*2,0,h-.025,0,top],[r*1.7,.051,r*1.7,0,h-.024,0,top],[.08,h-.05,.08,0,(h-.05)/2,0,poot],[r*.9,.04,r*.9,0,.02,0,poot]];return b},
 stoel:(col,poot,rug)=>{poot=poot||'#2a2420';const b=[[.46,.06,.44,0,.46,0,col],[.46,.5,.05,0,.73,-.2,rug||col]];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>b.push([.045,.45,.045,a*.19,.225,c*.18,poot]));return b},
 kruk:(top,poot)=>[[.42,.07,.42,0,.86,0,top],[.06,.8,.06,0,.43,0,poot],[.34,.03,.34,0,.42,0,poot],[.36,.03,.36,0,.02,0,poot]],
 // lage bank (lounge): breedte langs x, rug aan -z
 bankLaag:(w,base,kus,rug,acc)=>{const b=[[w,.26,.92,0,.13,0,base],[w-.06,.14,.84,0,.33,.02,kus],[w,.62,.24,0,.52,-.36,rug],[.2,.42,.92,-w/2+.1,.36,0,base],[.2,.42,.92,w/2-.1,.36,0,base]];
   for(let x=-w/2+.55;x<w/2-.4;x+=.75)b.push([.55,.36,.14,x,.58,-.2,(Math.round(x*4))%2?acc:shade(acc,.75)]);for(let x=-w/2+.4;x<w/2-.3;x+=.75)b.push([.6,.012,.7,x+.2,.405,.04,shade(kus,1.12)]);return b},
 sofa:(w,col,poot)=>{const b=[[w,.42,.9,0,.33,0,col],[w-.4,.16,.74,0,.58,.04,shade(col,1.1)],[w,.62,.22,0,.72,-.34,shade(col,.9)],[.22,.58,.9,-w/2+.11,.48,0,shade(col,.85)],[.22,.58,.9,w/2-.11,.48,0,shade(col,.85)]];
   for(let x=-w/2+.5;x<w/2-.3;x+=.9)b.push([.82,.04,.7,x+.3,.665,.06,shade(col,1.16)]);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,c])=>b.push([.08,.12,.08,a*(w/2-.12),.06,c*.36,poot||'#2a2018']));return b},
 kast:(w,h,d,col,greep)=>{const b=[[w,h,d,0,h/2,0,col],[w+.04,.05,d+.04,0,h+.02,0,shade(col,.8)],[.02,h-.12,.01,0,h/2,d/2+.005,shade(col,.7)]];b.push([.03,.14,.03,-.06,h*.52,d/2+.02,greep||'#c9cfd6'],[.03,.14,.03,.06,h*.52,d/2+.02,greep||'#c9cfd6']);return b},
 plank:(w,y,d,col)=>[[w,.04,d,0,y,0,col],[.04,.12,d,-w/2+.1,y-.08,0,shade(col,.7)],[.04,.12,d,w/2-.1,y-.08,0,shade(col,.7)]],
 flessen:(w,y,z,kleuren,rng)=>{const b=[];let x=-w/2+.08;let i=0;while(x<w/2-.06){const c=kleuren[i++%kleuren.length],h=.22+((i*37)%7)*.03;b.push([.08,h,.08,x,y+h/2,z,c,(i%3===0)?1:0],[.035,.08,.035,x,y+h+.04,z,shade(c,.7)]);x+=.11+((i*13)%3)*.02}return b},
 plant:(pot,blad)=>[[.36,.36,.36,0,.18,0,pot],[.4,.05,.4,0,.37,0,shade(pot,.8)],[.5,.4,.5,0,.65,0,blad],[.34,.36,.34,.06,.98,-.04,shade(blad,1.15)],[.22,.3,.22,-.1,1.18,.06,shade(blad,.85)],[.6,.12,.3,0,.6,.1,shade(blad,.9)]],
 lantaarn:(y,metaal,glas)=>[[.34,.04,.34,0,y+.42,0,metaal],[.3,.46,.3,0,y+.18,0,glas,1],[.36,.05,.36,0,y-.06,0,metaal],[.05,.05,.32,0,y+.18,0,metaal],[.32,.05,.05,0,y+.18,0,metaal],[.12,.12,.12,0,y+.5,0,metaal],[.02,1.2,.02,0,y+1.15,0,'#1a1714']],
 waterpijp:(glas,metaal,kool)=>[[.3,.06,.3,0,.03,0,shade(glas,.8)],[.32,.34,.32,0,.23,0,glas,1],[.2,.06,.2,0,.42,0,shade(glas,1.2),1],[.06,.5,.06,0,.68,0,metaal],[.24,.03,.24,0,.66,0,metaal],[.16,.1,.16,0,.97,0,'#8a4a2a'],[.14,.04,.14,0,1.04,0,kool,1],[.04,.04,.36,.12,.5,.14,'#2a2c30'],[.04,.3,.04,.16,.36,.34,'#2a2c30']],
 deur:(w,h,col,klink)=>[[w+.2,.12,.16,0,h+.06,0,shade(col,.7)],[.1,h,.16,-w/2-.05,h/2,0,shade(col,.7)],[.1,h,.16,w/2+.05,h/2,0,shade(col,.7)],[w,h,.07,0,h/2,0,col],[w-.2,h*.4,.02,0,h*.7,.04,shade(col,1.1)],[w-.2,h*.36,.02,0,h*.28,.04,shade(col,1.1)],[.05,.05,.08,w/2-.14,h*.5,.07,klink||'#d6a63e']],
 speaker:(h)=>[[.6,h,.5,0,h/2,0,'#141518'],[.42,.42,.02,0,h*.66,.26,'#2a2c30'],[.26,.26,.03,0,h*.66,.27,'#0a0b0c'],[.22,.22,.02,0,h*.25,.26,'#2a2c30'],[.12,.12,.03,0,h*.25,.27,'#0a0b0c']],
 tv:(w,h,col)=>[[w,h,.06,0,0,0,col||'#111214']],
 doos:(w,h,d,col)=>[[w,h,d,0,h/2,0,col],[w+.005,.06,d*.3,0,h-.01,0,shade(col,.85)],[.05,h+.005,d+.005,0,h/2,0,'#c8b890']],
 bed:(w,l,col,deken)=>[[w,.3,l,0,.15,0,'#3a2a20'],[w-.06,.2,l-.06,0,.4,0,'#e8e4da'],[w-.04,.08,l*.62,0,.53,l*.17,deken],[w-.3,.14,.38,0,.57,-l/2+.3,'#f1efe9'],[w,.7,.08,0,.35,-l/2,'#3a2a20']]};

/* =================== plaatjes =================== */
function neonTekst(t,w,h,kleur,gloed){return pc(w,h,(c)=>{c.clearRect(0,0,w,h);c.font='bold '+(h*.7|0)+'px monospace';c.textAlign='center';c.textBaseline='middle';
  for(let i=4;i>0;i--){c.globalAlpha=.12;c.strokeStyle=gloed;c.lineWidth=i*2;c.strokeText(t,w/2,h/2)}c.globalAlpha=1;c.fillStyle=kleur;c.fillText(t,w/2,h/2)})}
function bokser(seed){return pc(24,32,(c,w,h)=>{const r=(n)=>((seed*9301+n*49297)%233280)/233280;R(c,0,0,w,h,'#3a2a1a');R(c,1,1,w-2,h-2,'#d8c49a');R(c,2,2,w-4,h-4,shade('#b89a6a',.9+r(1)*.2));
  const sk=['#3a2418','#6e4630','#b97a52','#e9b98f'][seed%4],x=8+(r(2)*4|0);R(c,x,7,6,6,sk);R(c,x-1,6,8,2,'#1a1410');R(c,x-2,13,10,9,seed%2?'#8a1f2a':'#1f3a6a');R(c,x-5,12,4,4,'#b8333a');R(c,x+7,10+(seed%3),4,4,'#b8333a');R(c,x-1,22,4,7,'#1a1a1c');R(c,x+3,22,4,7,'#1a1a1c');
  c.globalAlpha=.25;R(c,2,2,w-4,3,'#fff');c.globalAlpha=1;R(c,3,h-5,w-6,2,'#3a2a1a')})}
function rugCanvas(a,b,c2,d){return pc(32,48,(c,w,h)=>{R(c,0,0,w,h,a);R(c,1,1,w-2,h-2,b);R(c,3,3,w-6,h-6,a);for(let y=6;y<h-6;y+=6)for(let x=6;x<w-6;x+=6){R(c,x,y,4,4,c2);R(c,x+1,y+1,2,2,d)}for(let x=2;x<w-2;x+=2){R(c,x,0,1,1,d);R(c,x,h-1,1,1,d)}R(c,w/2-4,h/2-6,8,12,d);R(c,w/2-2,h/2-4,4,8,b)})}
function voetbal(){const cv=pc(96,54,()=>{});const c=cv.getContext('2d');let t=0;const sp=[];for(let i=0;i<14;i++)sp.push({x:10+Math.random()*76,y:8+Math.random()*38,vx:0,vy:0,t:i<7?0:1});let bal={x:48,y:27};let sc=[1,0],ticker=0;
  const draw=dt=>{t+=dt;R(c,0,0,96,54,'#2f7a32');for(let x=0;x<96;x+=12)R(c,x,0,6,54,'#358a38');c.fillStyle='#e8f0e0';R(c,4,4,88,1,'#e8f0e0');R(c,4,49,88,1,'#e8f0e0');R(c,4,4,1,46,'#e8f0e0');R(c,91,4,1,46,'#e8f0e0');R(c,48,4,1,46,'#e8f0e0');R(c,4,18,8,1,'#e8f0e0');R(c,4,36,8,1,'#e8f0e0');R(c,11,18,1,19,'#e8f0e0');R(c,84,18,8,1,'#e8f0e0');R(c,84,36,8,1,'#e8f0e0');R(c,84,18,1,19,'#e8f0e0');
    bal.x+=Math.sin(t*.9)*.6+Math.cos(t*.37)*.3;bal.y+=Math.cos(t*1.1)*.35;bal.x=Math.max(8,Math.min(88,bal.x));bal.y=Math.max(8,Math.min(46,bal.y));
    sp.forEach((p,i)=>{const tx=bal.x+(i%7-3)*5+(p.t?6:-6),ty=bal.y+((i*5)%9-4)*3;p.x+=(tx-p.x)*.03;p.y+=(ty-p.y)*.03;R(c,p.x|0,p.y|0,2,3,p.t?'#e8e4da':'#c0261e');R(c,p.x|0,(p.y|0)-1,2,1,'#1a1410')});R(c,bal.x|0,bal.y|0,1,1,'#ffffff');
    R(c,2,1,30,7,'rgba(10,10,20,.8)');c.font='6px monospace';c.fillStyle='#fff';c.fillText('AJX '+sc[0]+'-'+sc[1]+' FEY',4,7);c.fillStyle='#ffd35a';c.fillText(String(60+((t/4)|0)%30)+"'",34,7);
    ticker+=dt;if(ticker>40){ticker=0;sc[Math.random()<.5?0:1]++}};
  draw(0);return {cv,draw}}
function stadRaam(nacht){return pc(48,32,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,nacht?'#0b1026':'#6a9ad0');g.addColorStop(1,nacht?'#2a2440':'#d8c0a0');c.fillStyle=g;c.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){const x=i*6-2,bh=8+((i*7)%5)*3;R(c,x,h-bh,6,bh,nacht?'#14142a':'#5a6070');for(let y=h-bh+2;y<h-1;y+=3)for(let xx=x+1;xx<x+5;xx+=2)if((xx*7+y*3)%5<(nacht?2:1))R(c,xx,y,1,1,nacht?'#ffd98a':'#9ab0c8')}
  if(nacht){for(let i=0;i<12;i++)R(c,(i*17)%w,(i*7)%10,1,1,'#ffffff')}})}

/* =================== LOUNGE SAHARA =================== */
// hal 20×15 (z 13–28), gang naar achteren (x 1.6–3.8, z 6–13), achterkamer 11×5 (z 1–6)
BN.add('sahara',{naam:'Lounge Sahara',kleur:'#ff4fd8',w:23,h:29.5,plafond:3.8,deur:{x:11.1,z:27.5},spawn:{x:11.1,z:25.3,ry:Math.PI},anker:anker('sahara'),ankerId:'sahara',
  licht:{bg:'#07050a',hemi:'#9a7ac8',grond:'#3a2038',int:1.0,zon:.5,zonKleur:'#c8a0ff',gloed:1,vig:.55,sat:1.22,tint:[1.02,.97,1.06]},cam:{k:.56},
  bouw(B){const T=B.tex,PLUM='#3a1f3e',GOUD='#d6a63e',NEON='#b45cff',NEON2='#ff4fd8',H=3.8;
    const wand=T.stuc('#3c2040'),wand2=T.stuc('#2a1a2c'),gangW=T.stuc('#4a2a24'),beton=T.beton('#6a6660'),hout=T.planken('#3a2418'),gangV=T.tapijt('#3a1418'),betonV=T.beton('#4a4844');
    // vloeren
    B.vloer(1,13,21,28,hout,2.4);B.vloer(1.6,6,3.8,13,gangV,1);B.vloer(1,1,12,6,betonV,2);
    // muren hal
    const wS1=B.muur(.6,28,10,28.35,{h:H,tex:wand}),wS2=B.muur(12.2,28,21.4,28.35,{h:H,tex:wand});{const l=new TH.Mesh(new TH.BoxGeometry(2.2,.9,.35),new TH.MeshLambertMaterial({map:wand}));l.position.set(11.1,H-.45,28.17);B.root.add(l);wS1.extra.push(l)}
    const wW=B.muur(.6,12.7,1,28.35,{h:H,tex:wand}),wE=B.muur(21,12.7,21.4,28.35,{h:H,tex:wand}),wN1=B.muur(.6,12.7,1.6,13,{h:H,tex:wand}),wN2=B.muur(3.8,12.7,21.4,13,{h:H,tex:wand});
    // gang en achterkamer
    const gW=B.muur(1.25,6,1.6,12.7,{h:3.2,tex:gangW}),gE=B.muur(3.8,6.3,4.15,12.7,{h:3.2,tex:gangW});
    const aN=B.muur(.6,.6,12.4,1,{h:3.2,tex:beton}),aW=B.muur(.6,.6,1,6.3,{h:3.2,tex:beton}),aE=B.muur(12,.6,12.4,6.3,{h:3.2,tex:beton}),aS1=B.muur(.6,6,1.6,6.3,{h:3.2,tex:beton}),aS2=B.muur(3.8,6,12.4,6.3,{h:3.2,tex:beton});
    B.plafond(1,13,21,28,H,'#1c1020');B.plafond(1.6,6,3.8,13,3.2,'#1a1210');B.plafond(1,1,12,6,3.2,'#1e1e1e');
    // gouden lijst en neonbuis langs de muren van de hal (hangen aan de muren, zakken mee weg)
    const strip=(wall,x0,z0,x1,z1)=>{const w=Math.max(.05,x1-x0),d=Math.max(.05,z1-z0);const g=new TH.Mesh(new TH.BoxGeometry(w,.06,d),new TH.MeshBasicMaterial({color:NEON}));g.position.set((x0+x1)/2,H-.25,(z0+z1)/2);B.root.add(g);wall.extra.push(g);
      const t=new TH.Mesh(new TH.BoxGeometry(w,.1,d),new TH.MeshLambertMaterial({color:GOUD}));t.position.set((x0+x1)/2,2.55,(z0+z1)/2);B.root.add(t);wall.extra.push(t);
      const l=new TH.Mesh(new TH.BoxGeometry(w,.04,d),new TH.MeshBasicMaterial({color:'#ffd35a'}));l.position.set((x0+x1)/2,.22,(z0+z1)/2);B.root.add(l);wall.extra.push(l)};
    strip(wW,1,13,1.06,28);strip(wE,20.94,13,21,28);strip(wN2,3.8,12.94,21,13);strip(wS1,1,27.94,10,28);strip(wS2,12.2,27.94,21,28);
    // bogen (Marokkaanse nissen) op de oostmuur, met een lampje erin
    for(let z=15;z<26;z+=3.4){const cv=pc(16,24,(c,w,h)=>{R(c,0,0,w,h,'#2a1530');c.fillStyle='#1a0c1e';c.beginPath();c.moveTo(2,h);c.lineTo(2,9);c.arc(8,9,6,Math.PI,0);c.lineTo(14,h);c.fill();c.strokeStyle='#d6a63e';c.lineWidth=1;c.beginPath();c.moveTo(1.5,h);c.lineTo(1.5,9);c.arc(8,9,6.5,Math.PI,0);c.lineTo(14.5,h);c.stroke();R(c,7,10,2,3,'#ffb84a')});
      B.plaat(cv,1.3,1.95,20.95,1.55,z,-Math.PI/2,{muur:wE})}
    // ===== bar langs de westmuur =====
    const zell=T.zellige('#1f6a6a','#e8e4da','#d6a63e');
    const front=new TH.Mesh(new TH.BoxGeometry(.12,1.05,9.2),new TH.MeshLambertMaterial({map:zell}));front.position.set(3.32,.56,19.2);B.root.add(front);
    zell.repeat&&0;B.box(1.0,1.0,9.2,2.8,.5,19.2,'#2a1810');B.box(1.25,.08,9.5,2.85,1.08,19.2,'#5a3a22');B.box(1.27,.03,9.52,2.85,1.125,19.2,'#7a5232');
    B.box(.06,.06,9.3,3.5,.25,19.2,GOUD);B.solid(2.2,14.5,3.5,23.9);
    B.box(.04,.04,9.2,3.38,1.0,19.2,NEON2,1);
    // tappen en spullen op de bar
    [16,17.4,21,22.6].forEach((z,i)=>B.meubel([[.1,.4,.1,0,1.32,0,'#c9cfd6'],[.24,.06,.1,0,1.5,.06,'#c9cfd6'],[.06,.16,.06,0,1.58,.1,i%2?'#ffd35a':'#e8e4da']],2.6,z));
    B.meubel([[.3,.22,.24,0,1.24,0,'#1a1a1c'],[.24,.12,.02,0,1.3,.13,'#3fe395',1]],2.7,24.1);   // kassa
    [[3.0,18.2,'#ffd35a'],[3.1,20.3,'#ff6a5a'],[2.9,22.2,'#7fd1ff']].forEach(([x,z,c])=>B.box(.1,.14,.1,x,1.2,z,c,1));
    // achterbar: planken met flessen en een paarse gloed erachter
    B.box(.34,2.4,9.2,1.18,1.6,19.2,'#1a0e1c');
    const flesK=['#3a8a4a','#c9a227','#8a2a2a','#e8e4da','#4a6aaa','#d6862a','#2a5a3a','#b45cff'];
    [1.35,1.95,2.55].forEach((y,i)=>{B.meubel(F.plank(9,y,.4,'#5a3a22'),1.35,19.2,Math.PI/2);B.meubel(F.flessen(8.6,y+.02,0,flesK.slice(i)),1.32,19.2,Math.PI/2)});
    B.box(.04,.06,9.2,1.52,1.3,19.2,NEON,1);B.box(.04,.06,9.2,1.52,1.9,19.2,NEON,1);B.box(.04,.06,9.2,1.52,2.5,19.2,NEON,1);
    const sah=B.plaat(neonTekst('SAHARA',128,32,'#ffe08a','#ff9a2a'),3.4,.85,1.08,3.05,19.2,Math.PI/2,{glow:1,alpha:1,muur:wW});
    B.licht(2.2,2.6,17,'#b45cff',5,7,{puls:2.1});B.licht(2.2,2.6,21.5,'#ff6ad8',4,7,{puls:1.7});
    // barkrukken
    for(let z=15.2;z<24;z+=1.15)B.meubel(F.kruk('#7a2a3a','#c9a227'),3.95,z);
    // ===== lage banken langs de oostmuur en de noordmuur, met tapijten, tafeltjes en waterpijpen =====
    const banken=[[19.9,15.2,-Math.PI/2,3.4],[19.9,19.3,-Math.PI/2,3.4],[19.9,23.4,-Math.PI/2,3.4]];
    banken.forEach(([x,z,ry,w],i)=>{B.meubel(F.bankLaag(w,'#2a1810',i%2?'#7a1f3a':'#5a1a4a','#3a1430',i%2?GOUD:'#c0602a'),x,z,ry,{solid:[w,.95]});});
    const rugs=[[17.6,15.2,0],[17.6,19.3,0],[17.6,23.4,0],[17.4,15.6,Math.PI/2]];
    rugs.slice(0,3).forEach(([x,z],i)=>{const m=B.plaat(rugCanvas(['#7a1a22','#5a1a4a','#1f4a5a'][i],'#d6a63e','#c0602a','#e8e4da'),2.4,3.6,x,.02,z,0);m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI/2});
    const tafels=[[17.7,15.2],[17.7,19.3],[17.7,23.4]];
    tafels.forEach(([x,z],i)=>{B.meubel(F.rondtafel(.5,.42,'#b8862a','#5a3a1a'),x,z);B.solid(x-.5,z-.5,x+.5,z+.5);
      B.meubel(F.waterpijp(['#1f8a8a','#8a2a6a','#2a6a3a'][i],'#c9a227','#ff6a1a'),x+.1,z-.1);B.rook(x+.1,1.1,z-.1,{rate:.9,size:.35,rise:.35,life:2.6,kleur:'#cfc8e8'});
      B.meubel([[.14,.12,.14,-.25,.48,.2,'#e8e4da'],[.1,.02,.1,-.25,.55,.2,'#6a3a1a'],[.18,.02,.12,.25,.43,.25,'#c9cfd6']],x,z);
      B.plek('tafel'+(i+1),x,.44,z)});
    // rokers (met een wolkje als ze uitblazen)
    const rokers=[[19.6,14.5,-Math.PI/2],[19.6,16.1,-Math.PI/2],[19.6,18.6,-Math.PI/2],[19.6,20.2,-Math.PI/2],[19.6,23.0,-Math.PI/2],[19.6,24.3,-Math.PI/2]];
    rokers.forEach(([x,z,ry],i)=>{const e=B.rook(x,1.5,z,{rate:0,acc:0,kleur:'#e0dcf0',life:2.8,rise:.45,spread:.5,size:.55,alpha:.6});
      B.persoon(null,{x,z,ry,anim:i%3===1?'tv':'rook',sitY:-.62,naam:'roker'+i,onPuff:a=>{e.x=a.x-B.o.x+Math.sin(a.ry)*.45;e.z=a.z-B.o.z+Math.cos(a.ry)*.45;e.y=1.55;e.rate=16;setTimeout(()=>{e.rate=0},500)}})});
    // ===== groot scherm met voetbal (noordmuur) en banken ervoor =====
    const vb=voetbal();const tvM=B.plaat(vb.cv,4.4,2.48,8.8,2.15,13.06,0,{glow:1,muur:wN2});B.meubel([[4.6,2.66,.08,0,0,0,'#0c0c0e']],8.8,13.02);
    const tvRand=new TH.Mesh(new TH.BoxGeometry(4.64,2.7,.06),new TH.MeshLambertMaterial({color:'#0c0c0e'}));tvRand.position.set(8.8,2.15,13.0);B.root.add(tvRand);wN2.extra.push(tvRand);
    let vbT=0;B.tick(dt=>{vbT+=dt;if(vbT>.12){vb.draw(vbT);vbT=0;tvM.material.map.needsUpdate=true}});
    B.licht(8.8,1.8,14.4,'#5aa86a',2.2,5);
    B.meubel(F.bankLaag(3.2,'#2a1810','#4a1a3a','#2a1028',GOUD),8.2,16.6,Math.PI,{solid:[3.2,.95]});
    [[7.2,16.4],[8.4,16.5],[9.5,16.4]].forEach(([x,z],i)=>B.persoon(null,{x,z,ry:Math.PI,anim:i===1?'juich':'tv',sitY:-.6,naam:'kijker'+i}));
    // ===== DJ-hoek (noordoost, op een verhoging) =====
    B.box(4.2,.3,2.2,15.9,.15,14.2,'#1a1418');B.box(4.2,.04,.04,15.9,.31,15.3,NEON2,1);B.solid(13.8,13,18,15.3);
    B.meubel([[2.2,1.05,.6,0,.83,0,'#141218'],[2.2,.05,.62,0,1.37,0,'#2a2430'],[2.16,.04,.02,0,.7,.31,NEON,1],[.4,.04,.4,-.6,1.41,0,'#0a0a0c'],[.4,.04,.4,.6,1.41,0,'#0a0a0c'],[.1,.05,.1,-.6,1.44,0,'#c9cfd6'],[.1,.05,.1,.6,1.44,0,'#c9cfd6'],[.5,.06,.3,0,1.42,.05,'#2a2c30'],[.42,.02,.24,0,1.46,.05,'#3fe395',1],[.36,.24,.02,0,1.6,-.12,'#7fd1ff',1]],15.9,14.7);
    B.meubel(F.speaker(1.8),13.9,13.6);B.meubel(F.speaker(1.8),17.9,13.6);
    B.persoon(null,{x:15.9,z:14.05,ry:0,anim:'dj',naam:'dj',y:.3});
    const djL=B.licht(15.9,3.2,15.6,'#ff4fd8',6,9,{puls:4.4});
    // lichtbalk met gekleurde spots boven de dansvloer
    B.box(6,.08,.08,11.5,3.5,20.5,'#1a1a1c');[[9.5,'#ff4fd8'],[11.5,'#7fd1ff'],[13.5,'#ffd35a']].forEach(([x,c])=>B.box(.2,.2,.2,x,3.38,20.5,c,1));
    // dansvloer: lichtvlekken die bewegen
    const vlek=[];['#ff4fd8','#7fd1ff','#ffd35a','#b45cff'].forEach((c,i)=>{const m=new TH.Mesh(new TH.PlaneGeometry(1.4,1.4),new TH.MeshBasicMaterial({color:c,transparent:true,opacity:.22,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(11.5,.03,21);B.root.add(m);vlek.push(m)});
    B.tick((dt,t)=>{vlek.forEach((m,i)=>{m.position.x=11.5+Math.sin(t*.7+i*1.6)*2.6;m.position.z=21+Math.cos(t*.9+i*2.1)*2.0;m.material.opacity=.16+.1*Math.sin(t*3+i)})});
    [[10.4,20.2,'dans'],[12.3,21.4,'dans2'],[11.0,22.6,'dans'],[13.4,20.4,'dans'],[9.6,22.0,'dans2']].forEach(([x,z,a],i)=>B.persoon(null,{x,z,ry:Math.random()*6,anim:a,naam:'danser'+i,v:i%2===0}));
    B.licht(11.5,3.2,21,'#b45cff',5,9,{puls:3.3});
    // kaarttafel (zuidwest) en een paar staande gasten
    B.meubel(F.tafel(1.2,1.2,.76,'#3a2418','#1a1410'),6.2,25.1);B.solid(5.6,24.5,6.8,25.7);
    B.meubel([[.5,.01,.3,0,.795,0,'#1f6a3a'],[.08,.01,.12,-.3,.8,-.2,'#e8e4da'],[.08,.01,.12,.25,.8,.25,'#e8e4da'],[.08,.01,.12,.3,.8,-.28,'#c0261e'],[.18,.04,.12,0,.81,.1,'#c9a227']],6.2,25.1);
    [[6.2,24.2,0],[7.1,25.1,-Math.PI/2],[5.3,25.1,Math.PI/2]].forEach(([x,z,ry],i)=>{B.meubel(F.stoel('#3a2418'),x+(x-6.2)*.12,z+(z-25.1)*.12,ry);B.persoon(null,{x,z,ry:ry,anim:'kaart',sitY:-.42,naam:'kaarter'+i})});
    B.persoon(null,{x:4.6,z:16.2,ry:-Math.PI/2,anim:'leun',naam:'gast1'});B.persoon(null,{x:4.4,z:21.7,ry:-Math.PI/2,anim:'talk',naam:'gast2',v:true});
    B.persoon(null,{x:1.95,z:18.4,ry:Math.PI/2,anim:'bar',naam:'barman'});
    // uitsmijter bij de deur (binnen) en planten, lantaarns
    B.persoon('uitsmijter',{x:13.2,z:26.6,ry:Math.PI*1.15,anim:'armen',naam:'uitsmijter'});
    [[1.6,27.3],[20.4,27.3]].forEach(([x,z])=>{B.meubel(F.plant('#6a3a2a','#2f6e3a'),x,z);B.solid(x-.25,z-.25,x+.25,z+.25)});
    [[17.6,15.2],[17.6,19.3],[17.6,23.4],[6.2,25.1],[8.5,17.2]].forEach(([x,z],i)=>{B.meubel(F.lantaarn(2.5,'#c9a227',i%2?'#a8602a':'#9a4a22'),x,z);B.licht(x,2.4,z,i%2?'#ffb070':'#ff9a50',1.5,5)});
    // de deur (binnenkant) met een rood gordijn
    B.meubel(F.deur(1.6,2.5,'#3a2014','#d6a63e'),11.1,28.0);B.meubel([[.08,2.9,.08,-1.2,1.45,0,'#c9a227'],[.08,2.9,.08,1.2,1.45,0,'#c9a227'],[.6,2.6,.06,-.95,1.4,-.06,'#7a1a22'],[.6,2.6,.06,.95,1.4,-.06,'#7a1a22']],11.1,27.75);
    B.licht(11.1,3.0,26.5,'#ffc890',2.2,5);
    // ===== de gang: foto's van boksers, dimmer licht, de muziek zakt weg =====
    for(let i=0;i<4;i++){const z=7.2+i*1.5;B.plaat(bokser(i*3+1),.62,.82,1.62,1.75,z,Math.PI/2,{muur:gW});B.plaat(bokser(i*3+2),.62,.82,3.78,1.75,z+.6,-Math.PI/2,{muur:gE});
      B.box(.03,.9,.7,1.6,1.75,z,'#2a1a10');B.box(.03,.9,.7,3.8,1.75,z+.6,'#2a1a10')}
    B.meubel([[.05,.05,.05,0,3.0,0,'#1a1714'],[.18,.12,.18,0,2.88,0,'#ffd98a',1]],2.7,8.2);B.meubel([[.05,.05,.05,0,3.0,0,'#1a1714'],[.18,.12,.18,0,2.88,0,'#ffd98a',1]],2.7,11.2);
    B.licht(2.7,2.7,8.2,'#ffc070',1.6,4.5,{flik:1});B.licht(2.7,2.7,11.2,'#ffc070',1.4,4.5);
    B.box(.9,1.6,.4,2.0,.8,7.0,'#5a5048');B.solid(1.6,6.8,2.45,7.2); // meterkast
    B.meubel(F.deur(1.2,2.3,'#4a3a2a','#c9cfd6'),2.7,6.25);
    // ===== achterkamer: tafel vol geld, telmachine, dozen =====
    B.meubel(F.tafel(3.8,1.6,.8,'#4a4440','#2a2420'),6.4,3.4);B.solid(4.5,2.6,8.3,4.2);
    const geld=[];for(let i=0;i<22;i++){const x=-1.6+((i*7)%11)*.3,z=-.55+((i*5)%4)*.33,h=.06+((i*13)%5)*.04;geld.push([.26,h,.13,x,.8+h/2,z,i%4?'#6a9a5a':'#b0a0d0'],[.27,.012,.035,x,.8+h-.002,z,'#c9a227'])}
    B.meubel(geld,6.4,3.4);
    B.meubel([[.5,.32,.4,0,.96,0,'#2a2c30'],[.46,.04,.3,0,1.13,-.02,'#3a3d44'],[.3,.06,.02,0,1.0,.21,'#3fe395',1],[.3,.08,.14,0,1.17,.12,'#6a9a5a']],7.6,3.1);
    const telBriefjes=[];for(let i=0;i<4;i++){const m=new TH.Mesh(new TH.BoxGeometry(.24,.008,.12),new TH.MeshLambertMaterial({color:'#7aaa6a'}));m.position.set(7.6,1.18,3.2);B.root.add(m);telBriefjes.push(m)}
    let ratel=0;B.tick((dt,t)=>{telBriefjes.forEach((m,i)=>{const k=((t*6+i/4)%1);m.position.z=3.25-k*.35;m.position.y=1.2-k*.12+Math.sin(k*Math.PI)*.02});
      const p=G.P;if(Math.hypot(p.x-(B.o.x+7.6),p.z-(B.o.z+3.1))<5.5){ratel+=dt;if(ratel>.09){ratel=0;G.snd&&G.snd.fx('click')}}});
    [[4.4,3.4,Math.PI/2],[8.4,3.4,-Math.PI/2],[6.4,2.3,0]].forEach(([x,z,ry])=>B.meubel(F.stoel('#2a2c30','#16161a'),x,z,ry));
    [[5.5,4.3,Math.PI],[7.4,4.3,Math.PI]].forEach(([x,z,ry],i)=>{B.meubel(F.stoel('#2a2c30','#16161a'),x,z+.1,ry);B.persoon(null,{x,z,ry,anim:'tel',sitY:-.42,naam:'teller'+i})});
    B.persoon(null,{x:10.9,z:5.2,ry:Math.PI*1.25,anim:'armen',naam:'bewaker'});
    // dozen die je niet hoort te zien
    [[10.6,1.6,0],[11.3,1.6,0],[10.95,1.6,.62],[10.6,2.45,0],[11.3,2.45,0],[9.6,1.6,0]].forEach(([x,z,y],i)=>B.meubel(F.doos(.7,.6,.7,i%2?'#a07a4a':'#8a6a3e'),x,z+0,0));
    B.meubel([[.7,.6,.7,0,.9,0,'#a07a4a']],10.95,1.6);B.solid(9.2,1.1,11.9,2.9);
    B.meubel([[.9,1.2,.8,0,.6,0,'#3a3d44'],[.7,.9,.02,0,.62,.41,'#4a4d54'],[.12,.12,.04,.2,.7,.43,'#c9cfd6']],1.6,1.6);B.solid(1.1,1.1,2.1,2.1);  // kluis
    B.meubel([[.06,.6,.06,0,2.9,0,'#1a1714'],[.7,.3,.7,0,2.5,0,'#2a2c30'],[.5,.04,.5,0,2.34,0,'#ffe0a0',1]],6.4,3.4);
    B.licht(6.4,2.2,3.4,'#ffd8a0',7,7.5);B.licht(10.5,2.6,2,'#c8d0ff',1,5);
    B.plek('tafel_achter',6.4,.81,4.0);B.plek('bar',3.0,1.14,17.2);B.plek('bar2',3.0,1.14,19.8);
    // muziek: zachter in de gang en de achterkamer
    B.tick(()=>{try{const z=G.P.z-B.o.z;G.snd&&G.snd.busk&&0}catch(e){}});
  },
  buiten(g,f){// gevel aan de Boulevard: neonbord, luifel, zware deur, lantaarns, koord
    const m=K.model([[2.4,3.0,.2,0,1.5,-.05,'#1a0f1e'],[1.5,2.6,.12,0,1.3,.05,'#2a1610'],[1.36,2.4,.04,0,1.25,.12,'#3a2014'],[.06,.4,.06,.5,1.25,.16,'#d6a63e'],[2.9,.12,1.3,0,3.15,.6,'#3a1430'],[2.9,.04,.04,0,3.08,1.25,'#d6a63e'],
      [3.4,.9,.14,0,3.85,.05,'#120a16'],[3.3,.07,.16,0,4.28,.06,'#b45cff',1],[3.3,.07,.16,0,3.42,.06,'#b45cff',1],[.07,.9,.16,-1.66,3.85,.06,'#b45cff',1],[.07,.9,.16,1.66,3.85,.06,'#b45cff',1],
      [.22,.34,.22,-1.05,2.35,.25,'#ffb84a',1],[.26,.05,.26,-1.05,2.54,.25,'#c9a227'],[.22,.34,.22,1.05,2.35,.25,'#ffb84a',1],[.26,.05,.26,1.05,2.54,.25,'#c9a227'],
      [.08,.9,.08,-1.3,.45,1.4,'#c9a227'],[.08,.9,.08,1.3,.45,1.4,'#c9a227'],[2.5,.05,.05,0,.82,1.4,'#7a1a22'],[1.5,.02,1.0,0,.01,.7,'#7a1a22']]);
    if(f.eigen){// de verhaalstad heeft de gevel en het bord al: alleen koord, loper en lantaarns
      g.add(K.model([[.08,.9,.08,-1.3,.45,1.4,'#c9a227'],[.08,.9,.08,1.3,.45,1.4,'#c9a227'],[2.5,.05,.05,0,.82,1.4,'#7a1a22'],[1.5,.02,1.0,0,.01,.7,'#7a1a22'],[.22,.34,.22,-1.05,2.35,.25,'#ffb84a',1],[.26,.05,.26,-1.05,2.54,.25,'#c9a227'],[.22,.34,.22,1.05,2.35,.25,'#ffb84a',1],[.26,.05,.26,1.05,2.54,.25,'#c9a227']]))}
    else{g.add(m);const s=K.sign('LOUNGE SAHARA','#ffe08a','#120a16','#b45cff',.5);s.position.set(0,3.86,.14);g.add(s)}
    const l=new TH.PointLight('#c070ff',4,7,1.6);l.position.set(0,3.2,1.2);g.add(l);
    // de uitsmijter buiten (knikt als je langskomt)
    if(G.cut&&G.cut.persoon){const a=BN.uitsmijterBuiten||G.cut.persoon('uitsmijter',{x:0,z:0,anim:'armen'});const wp=new TH.Vector3(1.7,0,1.0).applyAxisAngle(new TH.Vector3(0,1,0),g.rotation.y).add(g.position);a.zet(wp.x,wp.z,g.rotation.y-.3);BN.uitsmijterBuiten=a}}});

/* =================== PIZZERIA BELLA NAPOLI =================== */
// keuken achter (z 1–8.3) met houtoven, winkel voor (z 8.3–13): toonbank, kassa, menubord
BN.add('napoli',{naam:'Bella Napoli',kleur:'#3fe395',w:16,h:14,plafond:3.3,deur:{x:8,z:13.1},spawn:{x:8,z:12.3,ry:Math.PI},anker:anker('napoli'),ankerId:'napoli',
  licht:{bg:'#0e0a08',hemi:'#ffe0c0',grond:'#4a3020',int:.8,zon:.45,zonKleur:'#fff0d8',gloed:.55,vig:.42,sat:1.14,tint:[1.04,1.0,.95]},cam:{k:.4},
  bouw(B){const T=B.tex,H=3.3;const tegW=T.wandtegel('#e8e4da'),stuc=T.stuc('#e8d8b8'),vloer=T.tegels('#4a4440','#cfc6b4',4),baks=T.baksteen('#8a3b2a');
    B.vloer(1,1,15,13,vloer,2.2);
    const wN=B.muur(.6,.6,15.4,1,{h:H,tex:tegW,ts:1}),wW=B.muur(.6,.6,1,13.4,{h:H,tex:tegW,ts:1}),wE=B.muur(15,.6,15.4,13.4,{h:H,tex:tegW,ts:1}),
      wS1=B.muur(.6,13,7.1,13.4,{h:H,tex:stuc}),wS2=B.muur(8.9,13,15.4,13.4,{h:H,tex:stuc});B.box(1.8,.5,.4,8,H-.25,13.2,'#e8d8b8');
    B.plafond(1,1,15,13,H,'#e8dcc8');
    // bovenste deel van de muren crème met een groen-wit-rode band
    const band=(wall,x0,z0,x1,z1)=>{[['#2f8a4a',0],['#f1efe9',1],['#c0261e',2]].forEach(([c,i])=>{const w=Math.max(.04,x1-x0),d=Math.max(.04,z1-z0);const m=new TH.Mesh(new TH.BoxGeometry(w,.08,d),new TH.MeshLambertMaterial({color:c}));m.position.set((x0+x1)/2,1.6+i*.08,(z0+z1)/2);B.root.add(m);wall.extra.push(m)});
      const w=Math.max(.04,x1-x0),d=Math.max(.04,z1-z0),m=new TH.Mesh(new TH.BoxGeometry(w,H-1.86,d),new TH.MeshLambertMaterial({map:stuc}));m.position.set((x0+x1)/2,1.86+(H-1.86)/2,(z0+z1)/2);B.root.add(m);wall.extra.push(m)};
    band(wN,1,1,15,1.04);band(wW,1,1,1.04,13);band(wE,14.96,1,15,13);
    // ===== de houtoven (midden achter) =====
    const oven=[];for(let i=0;i<5;i++){const w=3.0-i*.45;oven.push([w,.42,2.2-i*.25,0,.95+i*.38,0,shade('#9a4a32',.9+i*.04)])}
    oven.push([3.2,.95,2.4,0,.47,0,'#7a3a2a'],[3.4,.12,2.6,0,.98,.05,'#c9b8a0'],[1.0,.7,.3,0,1.45,1.05,'#1a0a04'],[.84,.5,.1,0,1.4,1.0,'#ff6a1a',1],[.6,.22,.1,0,1.3,.96,'#ffd35a',1],[.3,.12,.06,-.15,1.25,.95,'#fff0b0',1],
      [1.2,.12,.34,0,1.86,1.08,'#5a2a1a'],[.4,1.1,.4,0,3.0,-.5,'#5a5048'],[.5,.1,.5,0,2.48,-.5,'#3a3430']);
    B.meubel(oven,8,2.2);B.solid(6.4,1,9.6,3.4,true);
    B.licht(8,1.4,3.8,'#ff7a2a',4,7,{vuur:1});B.licht(8,.9,3.3,'#ff4a10',1.6,3,{vuur:1});
    B.rook(8,1.85,3.25,{rate:2.2,size:.32,rise:.7,life:1.6,kleur:'#5a5048',alpha:.35,spread:.15});
    // houtstapel naast de oven
    const hout=[];for(let i=0;i<14;i++)hout.push([.62,.16,.16,0,.08+Math.floor(i/4)*.17,-.3+(i%4)*.18,i%3?'#7a5232':'#5a3a22']);B.meubel(hout,10.3,1.8);B.solid(9.9,1.4,10.7,2.2);
    // ===== werkbank met deeg, meel, saus =====
    B.meubel([[4.2,.9,1.0,0,.45,0,'#c9cfd6'],[4.3,.06,1.1,0,.93,0,'#e8e4e0'],[4.1,.04,.02,0,.6,.51,'#8a8c90']],8,5.6);B.solid(5.8,5,10.2,6.2);
    [[-1.4,0],[-.9,.2],[-.4,-.1],[1.3,.15]].forEach(([x,z])=>B.meubel([[.26,.12,.26,0,1.02,0,'#f1e8d0'],[.2,.06,.2,0,1.1,0,'#f8f0dc']],8+x,5.6+z));
    B.meubel([[.9,.012,.9,0,.965,0,'#f1ece0'],[.5,.02,.5,.1,.975,.1,'#ffffff']],8.5,5.5);   // meel op de bank
    B.meubel([[.34,.18,.34,0,1.05,0,'#c9cfd6'],[.28,.02,.28,0,1.15,0,'#b8231a'],[.3,.16,.3,.5,1.04,0,'#c9cfd6'],[.24,.02,.24,.5,1.13,0,'#f1e8c0'],[.3,.16,.3,1.0,1.04,0,'#c9cfd6'],[.24,.02,.24,1.0,1.13,0,'#3a7a3a']],6.5,5.4);
    B.meubel([[.5,.03,.5,0,.98,0,'#d9a050'],[.4,.02,.4,0,1.0,0,'#c0261e'],[.08,.015,.08,.1,1.012,.05,'#f1efe9'],[.08,.015,.08,-.08,1.012,-.1,'#f1efe9'],[.06,.015,.06,0,1.012,.12,'#2f8a4a']],9.6,5.7);  // pizza in de maak
    B.rook(8.4,1.05,5.5,{rate:1.4,size:.16,rise:.2,life:3.5,kleur:'#ffffff',alpha:.4,spread:.5});
    B.persoon('giovanni',{x:8,z:6.65,ry:Math.PI,anim:'kok',naam:'giovanni'});
    // ===== schappen met blikken en potten, radio =====
    const blik=[];for(let i=0;i<12;i++)blik.push([.14,.2,.14,-1.2+i*.22,1.62,0,['#c0261e','#2f8a4a','#e8b923'][i%3]],[.13,.02,.13,-1.2+i*.22,1.73,0,'#c9cfd6']);
    for(let i=0;i<9;i++)blik.push([.16,.24,.16,-1.2+i*.3,2.12,0,i%2?'#d8c890':'#a8461e']);
    B.meubel(F.plank(2.9,1.5,.38,'#7a5232').concat(F.plank(2.9,2.0,.38,'#7a5232'),blik),3.3,1.25);B.solid(1.8,1,4.8,1.5);
    B.meubel([[.5,.28,.2,0,2.14,0,'#6a4a2a'],[.18,.18,.02,-.12,2.14,.11,'#3a3430'],[.12,.06,.02,.14,2.18,.11,'#ffd35a',1],[.02,.3,.02,.2,2.42,0,'#c9cfd6']],12.6,1.3);   // radio
    B.meubel(F.plank(2.6,2.0,.38,'#7a5232'),12.4,1.25);B.meubel([[.3,.36,.3,-.9,2.2,0,'#e8e4da'],[.3,.36,.3,-.5,2.2,0,'#e8e4da'],[.24,.3,.24,.3,2.17,0,'#4a6a3a']],12.4,1.25);
    // radio-noten
    const noot=pc(8,8,(c)=>{c.clearRect(0,0,8,8);R(c,4,1,1,5,'#ffd35a');R(c,2,5,3,2,'#ffd35a');R(c,5,1,2,1,'#ffd35a')});const nm=[];for(let i=0;i<3;i++){const m=B.plaat(noot,.2,.2,12.6,2.5,1.5,0,{glow:1,alpha:1});nm.push(m)}
    B.tick((dt,t)=>{nm.forEach((m,i)=>{const k=(t*.45+i/3)%1;m.position.set(12.5+Math.sin(k*6+i)*.2,2.35+k*.9,1.5);m.material.opacity=1-k;m.material.transparent=true})});
    // koelkast, pizzadozen, kapstok met rode jassen en tassen
    B.meubel([[1.1,2.1,.8,0,1.05,0,'#c9cfd6'],[.02,1.3,.02,.4,1.3,.41,'#8a8c90'],[1.06,.02,.02,0,1.5,.41,'#8a8c90']],14.2,2.6,-Math.PI/2);B.solid(13.8,2,15,3.2,true);
    const dozen=[];for(let i=0;i<9;i++)dozen.push([.64,.12,.64,0,.06+i*.13,0,i%2?'#e8dcc0':'#e0d2b4'],[.4,.01,.12,0,.125+i*.13,.15,'#c0261e']);B.meubel(dozen,13.9,5.0);B.meubel(dozen,13.9,5.75);B.solid(13.5,4.6,14.3,6.1);
    B.meubel([[.06,.06,1.6,0,1.9,0,'#5a3a22'],[.06,.16,.06,0,1.85,-.6,'#c9cfd6'],[.06,.16,.06,0,1.85,0,'#c9cfd6'],[.06,.16,.06,0,1.85,.6,'#c9cfd6'],
      [.18,.9,.6,.06,1.4,-.6,'#c0261e'],[.2,.25,.62,.06,1.68,-.6,'#a01a14'],[.18,.9,.6,.06,1.4,0,'#c0261e'],[.2,.25,.62,.06,1.68,0,'#a01a14'],[.5,.42,.36,.2,1.25,.6,'#1a1c21'],[.52,.06,.38,.2,1.47,.6,'#c0261e']],1.08,7.0);
    B.plek('jassen',1.4,1.4,7.0);
    // achterdeur
    B.meubel(F.deur(1.1,2.2,'#5a6a5a','#c9cfd6'),1.05,4.6,Math.PI/2);
    // ===== winkel: toonbank met vitrine, kassa, menubord, foto van opa =====
    B.meubel([[6.0,1.0,.9,0,.5,0,'#7a2a1a'],[6.2,.07,1.0,0,1.04,0,'#e8e0d0'],[6.0,.06,.04,0,.2,.46,'#d6a63e'],[2.2,.45,.8,1.4,1.3,0,'#a8d0e0',1],[2.0,.05,.7,1.4,1.1,0,'#c8b890']],7.5,8.6);B.solid(4.5,8.1,10.5,9.1);
    for(let i=0;i<4;i++)B.meubel([[.4,.03,.4,0,1.14,0,'#d9a050'],[.34,.02,.34,0,1.155,0,'#c0261e'],[.06,.01,.06,.08,1.17,.05,'#f1efe9']],7.5+.95+i*.48,8.55);
    B.meubel([[.44,.3,.36,0,1.22,0,'#2a2c30'],[.4,.06,.2,0,1.4,.05,'#3a3d44'],[.3,.16,.02,0,1.46,-.1,'#3fe395',1]],5.4,8.5);    // kassa
    const menu=pc(64,40,(c,w,h)=>{R(c,0,0,w,h,'#1a1a1c');R(c,1,1,w-2,h-2,'#24262a');c.font='bold 7px monospace';c.fillStyle='#ffd35a';c.fillText('BELLA NAPOLI',6,9);c.font='5px monospace';c.fillStyle='#e8e4da';
      ['Margherita  8,50','Salami      9,50','Quattro F. 11,00','Calzone    10,50','Napoletana  9,00'].forEach((t,i)=>c.fillText(t,5,17+i*5.4));R(c,0,h-3,w,1,'#2f8a4a');R(c,0,h-2,w,1,'#f1efe9');R(c,0,h-1,w,1,'#c0261e')});
    B.plaat(menu,2.6,1.6,7.4,2.35,1.06,0,{glow:1,muur:wN});
    const opa=pc(20,26,(c,w,h)=>{R(c,0,0,w,h,'#5a3a22');R(c,2,2,w-4,h-4,'#c8b090');R(c,7,6,6,7,'#b89070');R(c,6,5,8,2,'#e8e4da');R(c,8,12,4,1,'#5a4030');R(c,5,13,10,9,'#3a3430');R(c,9,13,2,4,'#e8e4da');c.globalAlpha=.3;R(c,2,2,w-4,4,'#fff')});
    B.plaat(opa,.6,.78,14.95,2.2,10.2,-Math.PI/2,{muur:wE});
    // vlaggetjes en lampen
    for(let i=0;i<12;i++){const m=new TH.Mesh(new TH.PlaneGeometry(.3,.36),new TH.MeshLambertMaterial({color:['#2f8a4a','#f1efe9','#c0261e'][i%3],side:TH.DoubleSide}));m.position.set(2+i*1.05,2.95,11.2);m.rotation.y=.1;B.root.add(m);B.hoog(m)}
    [[4,4.5],[8,6],[12,4.5],[5,10.5],[11,10.5]].forEach(([x,z],i)=>{B.meubel([[.03,.5,.03,0,3.05,0,'#1a1714'],[.36,.2,.36,0,2.75,0,'#2a5a3a'],[.22,.06,.22,0,2.63,0,'#fff0c8',1]],x,z);B.licht(x,2.5,z,'#ffe2b0',i<3?1.3:1.1,6)});
    // tafeltje met twee stoelen voor de wachtende klant, en de deur
    B.meubel(F.tafel(.8,.8,.76,'#f1efe9','#2a2c30'),12.6,11.4);B.meubel([[.8,.01,.8,0,.77,0,'#c0261e'],[.2,.01,.8,-.2,.771,0,'#f1efe9'],[.8,.01,.2,0,.771,-.2,'#f1efe9']],12.6,11.4);B.solid(12.2,11,13,11.8);
    B.meubel(F.stoel('#2a2c30'),12.6,12.2,Math.PI);B.meubel(F.stoel('#2a2c30'),13.4,11.4,-Math.PI/2);
    B.meubel(F.deur(1.6,2.3,'#2f6a3a','#c9cfd6'),8,13.18);
    B.plek('toonbank',7.0,1.08,8.6);B.plek('werkbank',8,0.96,5.6)},
  buiten(g,f){if(f.eigen||(G.bezorg&&G.bezorg.napoli))return;const m=K.model([[2.0,2.6,.16,0,1.3,-.04,'#1e3a24'],[1.4,2.3,.08,0,1.15,.05,'#2f6a3a'],[3.4,.12,1.2,0,2.9,.6,'#c0261e'],[3.4,.12,.4,0,2.9,.4,'#f1efe9'],[3.2,.7,.14,0,3.5,.05,'#1a1a1c']]);g.add(m);
    const s=K.sign('BELLA NAPOLI','#ffd35a','#1a1a1c','#2f8a4a',.48);s.position.set(0,3.5,.13);g.add(s)}});

/* =================== DE FLAT VAN DE SANTIS =================== */
// woonkamer (x 1–10, z 1–7.6) met keuken (noordoost), gang (z 7.6–9.4), Luca's kamer (x 10.2–15, z 7.6–12)
BN.add('thuis',{naam:'Thuis',kleur:'#7fd1ff',w:16,h:13,plafond:2.8,deur:{x:2.0,z:9.0},spawn:{x:2.6,z:8.6,ry:Math.PI/2},anker:anker('thuis'),ankerId:'thuis',deurTxt:'Naar huis',
  licht:{bg:'#0a0a10',hemi:'#d8d0c0',grond:'#3a3028',int:1.0,zon:.5,zonKleur:'#ffe8c8',gloed:.45,vig:.48,sat:1.08,tint:[1.02,1,.97]},cam:{k:.38},
  bouw(B){const T=B.tex,H=2.8;const beh=T.behang('#d8cdb0','#c8b890'),behL=T.behang('#5a6a7a','#4a5a6a'),stuc=T.stuc('#d8d4c8'),lam=T.planken('#8a6a4a'),lino=T.linoleum('#b8b0a0'),tapL=T.tapijt('#4a5060');
    B.vloer(1,1,10.2,7.6,lam,2);B.vloer(10.2,1,15,7.6,lino,2);B.vloer(1,7.6,10.2,9.6,lam,2);B.vloer(10.2,7.6,15,12,tapL,1);
    // buitenmuren
    const wN=B.muur(.6,.6,15.4,1,{h:H,tex:beh}),wW=B.muur(.6,.6,1,9.9,{h:H,tex:beh}),wE=B.muur(15,.6,15.4,12.4,{h:H,tex:stuc}),wS=B.muur(.6,9.6,10.2,9.9,{h:H,tex:beh}),wS2=B.muur(10.2,12,15.4,12.4,{h:H,tex:behL});
    // binnenmuren: woonkamer | gang, gang | Luca's kamer
    B.muur(1,7.6,4.2,7.85,{h:H,tex:beh});B.muur(5.6,7.6,10.2,7.85,{h:H,tex:beh});B.muur(10.2,7.6,11.2,7.85,{h:H,tex:behL});B.muur(12.5,7.6,15,7.85,{h:H,tex:behL});B.muur(9.95,7.85,10.2,12.2,{h:H,tex:behL});
    B.plafond(1,1,15,12,H,'#e8e4dc');
    // ramen (avond: de stad met lichtjes)
    const rm=stadRaam(true);[[3.4,1.02],[7.4,1.02]].forEach(([x,z])=>{B.plaat(rm,1.8,1.1,x,1.6,z,0,{glow:1,muur:wN});B.box(1.96,.06,.18,x,1.03,z+.06,'#e8e4da')});B.plaat(rm,1.2,1.0,14.97,1.6,10,-Math.PI/2,{glow:1,muur:wE});
    // gordijnen
    [[2.4,1.1],[4.4,1.1],[6.4,1.1],[8.4,1.1]].forEach(([x,z],i)=>B.box(.36,2.1,.06,x,1.45,z,i%2?'#7a3a2a':'#8a4a32'));
    // ===== woonkamer =====
    B.meubel(F.sofa(2.8,'#5a6a4a'),3.6,6.4,Math.PI,{solid:[2.8,.9]});
    B.meubel([[2.2,.01,1.6,0,.012,0,'#8a3a2a'],[2.0,.012,1.4,0,.014,0,'#b8603a'],[1.0,.013,.6,0,.016,0,'#d8c090']],3.6,4.8);
    B.meubel(F.tafel(1.2,.6,.42,'#6a4a2a'),3.6,4.8);B.solid(3,4.5,4.2,5.1);B.meubel([[.3,.04,.2,-.2,.45,0,'#c0261e'],[.12,.12,.12,.3,.48,.1,'#f1efe9']],3.6,4.8);
    // tv-meubel en tv (aan, met een quiz)
    B.meubel([[2.2,.5,.45,0,.25,0,'#4a3a2a'],[2.18,.02,.02,0,.3,.23,'#2a2018']],3.6,1.4);B.solid(2.5,1,4.7,1.7);
    const tvc=pc(48,28,(c,w,h)=>{R(c,0,0,w,h,'#1a2a6a');R(c,4,4,18,12,'#e8b923');R(c,26,4,18,12,'#e8b923');R(c,4,18,40,6,'#2a3a8a');c.font='5px monospace';c.fillStyle='#fff';c.fillText('WIE WORDT',6,23)});
    const tvm=B.plaat(tvc,1.5,.86,3.6,1.0,1.28,0,{glow:1});B.meubel([[1.6,.96,.06,0,1.0,0,'#111214']],3.6,1.24);B.licht(3.6,1.0,2.0,'#7a8aff',1.6,4.5,{puls:1.3});
    B.meubel(F.plant('#c8b890','#3a7a3a'),1.5,1.5);B.meubel(F.kast(1.0,1.9,.4,'#6a4a2a'),5.4,1.25);B.solid(4.9,1,5.9,1.5,true);
    for(let i=0;i<8;i++)B.box(.08,.26,.18,5.0+i*.11,1.3+((i%3)*.03),1.4,['#c0261e','#2f6a8a','#e8b923','#3a7a3a'][i%4]);
    // staande lamp
    B.meubel([[.3,.04,.3,0,.02,0,'#2a2c30'],[.04,1.5,.04,0,.77,0,'#2a2c30'],[.42,.3,.42,0,1.6,0,'#f1e0b0',1]],1.6,6.8);B.licht(1.9,1.7,6.4,'#ffd8a0',1.3,5);
    // eettafel bij de keuken
    B.meubel(F.tafel(1.6,1.0,.78,'#a07a4a'),7.4,5.2);B.solid(6.6,4.7,8.2,5.7);[[6.8,4.5,0],[8.0,4.5,0],[6.8,5.9,Math.PI],[8.0,5.9,Math.PI]].forEach(([x,z,ry])=>B.meubel(F.stoel('#7a5a3a'),x,z,ry));
    B.meubel([[.36,.04,.26,-.3,.81,0,'#f1efe9'],[.3,.06,.22,.2,.82,.1,'#2a4a8a'],[.28,.05,.2,.25,.87,.12,'#8a2a2a'],[.14,.12,.14,-.5,.85,-.25,'#f1efe9']],7.4,5.2);
    B.meubel([[.05,.6,.05,0,2.5,0,'#1a1714'],[.5,.16,.5,0,2.15,0,'#d8b070'],[.3,.04,.3,0,2.06,0,'#fff0c8',1]],7.4,5.2);B.licht(7.4,2.0,5.2,'#ffe0b0',1.8,5.5);
    // ===== keuken (noordoost) =====
    B.meubel([[4.4,.9,.62,0,.45,0,'#e8e4da'],[4.5,.05,.66,0,.92,0,'#5a5a62'],[4.4,.7,.36,0,1.95,-.13,'#e8e4da'],[.62,.04,.5,-1.0,.95,0,'#2a2c30'],[.16,.02,.16,-1.15,.98,-.1,'#ff6a3a',1],[.5,.2,.4,.8,.88,0,'#c9cfd6'],[.08,.3,.08,.8,1.12,-.15,'#c9cfd6']],12.6,1.35);B.solid(10.4,1,14.8,1.7,true);
    B.meubel([[.8,1.9,.7,0,.95,0,'#f1efe9'],[.02,.6,.02,.3,1.3,.36,'#8a8c90']],14.5,2.4,-Math.PI/2);B.solid(14.1,2,14.9,2.8,true);
    B.meubel([[.3,.4,.3,0,1.15,0,'#c9cfd6'],[.2,.06,.2,0,1.38,0,'#2a2c30']],11.4,1.3);
    B.licht(12.6,2.5,3.2,'#f0f4ff',1.4,6);B.box(1.2,.04,.2,12.6,2.76,3.2,'#ffffff',1);
    // familie (de scène zet ze waar nodig; G.binnen.toon('thuis','marco',false) verbergt ze)
    B.persoon('marco',{x:3.6,z:6.25,ry:Math.PI,anim:'tv',sitY:-.4,naam:'marco'});
    B.persoon('giulia',{x:7.4,z:5.95,ry:Math.PI,anim:'schrijfzit',sitY:-.42,naam:'giulia'});
    B.persoon('elena',{x:12.2,z:2.25,ry:0,anim:'kok',naam:'elena'});
    // ===== gang =====
    B.meubel(F.deur(1.1,2.2,'#7a5a3a','#c9cfd6'),.95,8.6,Math.PI/2);B.meubel([[.06,.06,1.0,0,1.7,0,'#5a3a22'],[.22,.8,.5,.05,1.25,-.2,'#3a5a7a'],[.22,.9,.5,.05,1.2,.25,'#7fb8c9']],1.1,8.6);
    B.meubel([[.8,.01,1.6,0,.012,0,'#6a3a2a']],5,8.6);
    B.meubel(F.deur(.9,2.1,'#e8e4da','#c9cfd6'),7.6,9.55);B.meubel(F.deur(.9,2.1,'#e8e4da','#c9cfd6'),9.3,9.55);   // badkamer, kamer Giulia (dicht)
    B.meubel([[.04,.6,.04,0,2.5,0,'#1a1714'],[.24,.12,.24,0,2.2,0,'#fff0c8',1]],6,8.6);B.licht(6,2.0,8.6,'#ffe8c0',1.6,4);
    // ===== Luca's kamer =====
    B.meubel(F.bed(1.0,2.0,'#3a2a20','#2f4a6a'),14.2,10.6,0,{solid:[1,2]});
    B.meubel(F.kast(1.2,2.0,.55,'#d8d4c8'),11.0,11.6,Math.PI);B.solid(10.3,11.3,11.7,12,true);
    B.meubel(F.tafel(1.1,.6,.74,'#e8e4da','#8a8c90'),12.8,8.2,Math.PI);B.solid(12.2,7.85,13.4,8.5);B.meubel(F.stoel('#2a2c30'),12.8,8.9,Math.PI);
    B.meubel([[.4,.28,.02,0,1.0,-.1,'#16161a'],[.36,.22,.01,0,1.0,-.09,'#3a7aff',1],[.4,.02,.26,0,.77,.05,'#2a2c30']],12.8,8.2);
    // poster (actiefilm) en een sportschoenen-doos onder het bed
    const post=pc(20,28,(c,w,h)=>{R(c,0,0,w,h,'#1a1a2a');R(c,0,18,w,10,'#c0261e');R(c,3,6,14,8,'#e8b923');R(c,5,8,6,4,'#1a1a1c');R(c,12,9,4,2,'#1a1a1c');c.font='5px monospace';c.fillStyle='#fff';c.fillText('DUBBEL',2,24)});
    B.plaat(post,.8,1.1,14.97,1.7,9.2,-Math.PI/2,{muur:wE});
    B.meubel([[.5,.18,.32,0,.09,0,'#e8e4da'],[.52,.04,.34,0,.19,0,'#c0261e']],13.7,11.3);
    B.meubel([[.4,.3,.04,0,.5,0,'#8a8c90'],[.36,.02,.05,0,.42,0,'#5a5a62'],[.36,.02,.05,0,.5,0,'#5a5a62'],[.36,.02,.05,0,.58,0,'#5a5a62']],15.0,8.5,-Math.PI/2);   // ventilatierooster laag in de muur
    B.box(1.4,.1,.03,12.2,.05,11.98,'#c8b890');   // losse plint
    B.meubel([[.04,.5,.04,0,2.55,0,'#1a1714'],[.3,.1,.3,0,2.25,0,'#e8e4da',1]],12.6,9.8);B.licht(12.6,2.1,9.8,'#e8f0ff',2.0,4.5);
    B.verstop('matras',14.2,10.3,'Onder het matras');B.verstop('kast',11.0,11.0,'Achter in de kast');B.verstop('rooster',14.6,8.5,'Achter het ventilatierooster');B.verstop('schoenendoos',13.7,11.0,'In de schoenendoos');B.verstop('plint',12.2,11.6,'Achter de losse plint');
    B.plek('eettafel',7.4,.81,5.2);B.plek('salontafel',3.6,.44,4.8);B.plek('bureau',12.8,.77,8.2)},
  buiten(g,f){if(f.eigen)return;const m=K.model([[1.5,2.4,.14,0,1.2,-.03,'#2a3a4a'],[1.3,2.2,.06,0,1.1,.04,'#3a4a5a'],[.3,.5,.06,.9,1.3,.06,'#c9cfd6'],[.24,.04,.02,.9,1.5,.1,'#3a3d44'],[.04,.04,.02,.84,1.4,.1,'#ffd35a',1],[1.8,.08,.6,0,2.5,.3,'#5a5a62']]);g.add(m)}});

/* =================== KLASLOKAAL (Westbuurt College) =================== */
BN.add('klas',{naam:'Westbuurt College',kleur:'#a9dcff',w:15,h:12,plafond:3.2,deur:{x:2.0,z:11.2},spawn:{x:2.0,z:10.5,ry:Math.PI},anker:anker('school'),ankerId:'school',deurTxt:'Naar binnen',
  licht:{bg:'#12161c',hemi:'#f0f4ff',grond:'#8a8478',int:1.35,zon:1.1,zonKleur:'#fff4dc',gloed:.2,vig:.32,sat:1.08,tint:[1.0,1.0,1.0]},cam:{k:.42},
  bouw(B){const T=B.tex,H=3.2;const st=T.stuc('#e8e2cc'),lino=T.linoleum('#9aa48a'),stG=T.stuc('#b8c8b8');
    B.vloer(1,1,14,11,lino,2);
    const wN=B.muur(.6,.6,14.4,1,{h:H,tex:st}),wW=B.muur(.6,.6,1,11.4,{h:H,tex:st}),wS1=B.muur(.6,11,1.3,11.4,{h:H,tex:st}),wS2=B.muur(2.7,11,14.4,11.4,{h:H,tex:st});
    // de oostmuur is ramen: borstwering, kozijnen, glas met uitzicht
    const wE=B.muur(14,.6,14.4,11.4,{h:.95,tex:stG,stub:.3});
    const vw=pc(64,24,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#7ab0e0');g.addColorStop(1,'#d8e8f0');c.fillStyle=g;c.fillRect(0,0,w,h);for(let i=0;i<14;i++){const x=i*5,bh=6+((i*7)%5)*2;R(c,x,h-bh,5,bh,['#8a7a6a','#9a8a78','#7a7a82'][i%3]);for(let y=h-bh+2;y<h-1;y+=3)R(c,x+1,y,1,1,'#5a6a7a'),R(c,x+3,y,1,1,'#5a6a7a')}R(c,0,h-2,w,2,'#5a6a4a');R(c,40,3,6,2,'#ffffff');R(c,12,5,8,2,'#ffffff');R(c,52,2,3,3,'#fff4c0')});
    const ruit=B.plaat(vw,9.6,1.9,14.02,1.95,6,-Math.PI/2,{glow:1});wE.extra.push(ruit);
    for(let z=1.2;z<11;z+=1.6){const k=new TH.Mesh(new TH.BoxGeometry(.12,2.1,.1),new TH.MeshLambertMaterial({color:'#e8e4da'}));k.position.set(14.05,2.0,z);B.root.add(k);wE.extra.push(k)}
    const bov=new TH.Mesh(new TH.BoxGeometry(.4,.25,10.4),new TH.MeshLambertMaterial({map:st}));bov.position.set(14.2,H-.12,6);B.root.add(bov);wE.extra.push(bov);
    B.box(.3,.05,10.4,13.85,.97,6,'#e8e4da');B.solid(13.9,1,14.5,11,true);
    // zonlicht door de ramen
    B.licht(12.6,2.4,4,'#fff0d0',3,8);B.licht(12.6,2.4,8.5,'#fff0d0',3,8);
    B.plafond(1,1,14,11,H,'#f1efe9');
    // tl-buizen
    [[4.5,4],[4.5,8],[9.5,4],[9.5,8]].forEach(([x,z])=>{B.box(1.4,.06,.16,x,H-.05,z,'#f8fbff',1);B.box(1.5,.04,.22,x,H-.02,z,'#c9cfd6')});B.licht(7,2.8,6,'#f4f8ff',2.4,10);
    // schoolbord met de les
    const bord=pc(96,40,(c,w,h)=>{R(c,0,0,w,h,'#f4f6f2');R(c,0,0,w,1,'#c9cfd6');c.font='bold 6px monospace';c.fillStyle='#1a3a8a';c.fillText('BELASTINGEN',4,8);c.font='4px monospace';c.fillStyle='#1a1a1c';
      ['- inkomstenbelasting (box 1)','- btw: 21% / 9%','- heffingskorting','  bruto - belasting = netto'].forEach((t,i)=>c.fillText(t,4,16+i*6));c.strokeStyle='#c0261e';c.strokeRect(60,12,30,14);c.fillStyle='#c0261e';c.fillText('€ 2.000',64,21)});
    B.plaat(bord,4.8,2.0,7,1.85,1.03,0,{muur:wN});B.box(5.0,.08,.12,7,.82,1.08,'#c9cfd6');B.box(4.96,2.08,.04,7,1.85,1.02,'#8a8c90');
    // klok, posters
    const klok=pc(16,16,(c)=>{c.fillStyle='#f1efe9';c.beginPath();c.arc(8,8,7,0,7);c.fill();c.strokeStyle='#1a1a1c';c.stroke();R(c,7.5,3,1,5,'#1a1a1c');R(c,8,8,4,1,'#1a1a1c')});B.plaat(klok,.5,.5,11.2,2.5,1.03,0,{alpha:1,muur:wN});
    const pst=(t,a,b)=>pc(20,28,(c,w,h)=>{R(c,0,0,w,h,a);R(c,2,2,w-4,10,b);c.font='4px monospace';c.fillStyle='#fff';c.fillText(t,2,20)});
    B.plaat(pst('EUROPA','#2f6a8a','#e8b923'),.8,1.1,1.03,1.8,4,Math.PI/2,{muur:wW});B.plaat(pst('STOP!','#c0261e','#f1efe9'),.8,1.1,1.03,1.8,7,Math.PI/2,{muur:wW});
    // lessenaar docent
    B.meubel(F.tafel(1.8,.8,.76,'#a07a4a','#8a8c90'),3.4,2.4);B.solid(2.5,2,4.3,2.8);B.meubel([[.36,.03,.26,-.4,.79,0,'#f1efe9'],[.3,.2,.02,.4,.9,-.1,'#16161a'],[.28,.18,.01,.4,.9,-.09,'#7ab0e0',1]],3.4,2.4);
    B.persoon('docent',{x:7.2,z:1.7,ry:0,anim:'schrijf',naam:'docent'});
    // tafels in rijen (4 kolommen × 3 rijen), leerlingen
    const COL=[3.2,6.0,8.8,11.6],ROW=[4.4,6.6,8.8];let n=0;
    ROW.forEach((z,ri)=>COL.forEach((x,ci)=>{B.meubel(F.tafel(1.5,.6,.72,'#c8a878','#5a5a62'),x,z);B.solid(x-.75,z-.3,x+.75,z+.3);[-.38,.38].forEach((dx,k)=>{B.meubel(F.stoel('#2f6a8a','#5a5a62'),x+dx,z+.62,Math.PI);
      const luca=ri===1&&ci===3&&k===1,dex=ri===1&&ci===3&&k===0;const key='plek_'+ri+'_'+ci+'_'+k;B.plek(key,x+dx,.74,z);
      if(luca){B.plek('luca',x+dx,0,z+.66);return}if(dex){B.persoon('dex',{x:x+dx,z:z+.66,ry:Math.PI,anim:'dag',sitY:-.42,naam:'dex',kijk:.5});return}
      if((n++)%3!==1)B.persoon(null,{x:x+dx,z:z+.66,ry:Math.PI,anim:['schrijfzit','sit','slaap','schrijfzit'][n%4],sitY:-.42,naam:'leerling'+n})});
      B.meubel([[.3,.02,.22,-.35,.74,0,'#f1efe9'],[.3,.02,.22,.38,.74,.02,'#e8e4da'],[.04,.01,.18,-.2,.75,0,'#2a4a8a']],x,z)}));
    // kapstok en tassen bij de deur, de deur
    B.meubel([[.4,.36,.26,0,.18,0,'#1a1c21'],[.4,.36,.26,.5,.18,.05,'#c0261e'],[.36,.3,.24,1.0,.15,0,'#2f6a8a']],4.2,10.5);
    B.meubel(F.deur(1.2,2.2,'#a07a4a','#c9cfd6'),2.0,11.15);
    B.meubel(F.plant('#c8b890','#3a7a3a'),13.3,10.3);
    B.plek('bord',7,1.85,1.2)},
  buiten(g,f){if(f.eigen)return;const m=K.model([[3.4,2.8,.2,0,1.4,-.05,'#5a6a7a'],[1.6,2.4,.1,-.6,1.2,.06,'#2f6a8a'],[1.6,2.4,.1,1.0,1.2,.06,'#2f6a8a'],[1.4,2.1,.02,-.6,1.25,.12,'#a8d0e0',1],[1.4,2.1,.02,1.0,1.25,.12,'#a8d0e0',1],[4.4,.14,1.4,0,2.9,.7,'#e8e4da'],[4.6,.9,.16,0,3.55,.04,'#1a3a6a'],
      [.08,.6,.08,-2.4,.3,1.6,'#8a8c90'],[.08,.6,.08,-1.4,.3,1.6,'#8a8c90'],[1.1,.06,.06,-1.9,.6,1.6,'#8a8c90'],[.08,.6,.08,1.4,.3,1.6,'#8a8c90'],[.08,.6,.08,2.4,.3,1.6,'#8a8c90'],[1.1,.06,.06,1.9,.6,1.6,'#8a8c90']]);g.add(m);
    const s=K.sign('WESTBUURT COLLEGE','#ffffff','#1a3a6a','#e8b923',.55);s.position.set(0,3.55,.13);g.add(s)}});

/* =================== RIJTJESHUIS (Oud-Zuid, avond 4) =================== */
BN.add('rijtjeshuis',{naam:'Rijtjeshuis',kleur:'#ff6a5a',w:12,h:11,plafond:2.7,deur:{x:2.0,z:10.0},spawn:{x:2.0,z:9.4,ry:Math.PI},anker:anker('rijtjeshuis'),ankerId:'rijtjeshuis',deurTxt:'Aanbellen',
  licht:{bg:'#060508',hemi:'#8a8070',grond:'#2a2018',int:.6,zon:.2,zonKleur:'#ffd8a0',gloed:.4,vig:.62,sat:1.0,tint:[1.04,.98,.92]},cam:{k:.36},
  bouw(B){const T=B.tex,H=2.7;const beh=T.behang('#7a6a4a','#6a5a3a'),hout=T.parket('#6a4a2a'),gang=T.planken('#5a4030');
    B.vloer(1,1,11,7.4,hout,2);B.vloer(1,7.4,4,10.2,gang,2);B.vloer(4,7.4,11,10.2,hout,2);
    const wN=B.muur(.6,.6,11.4,1,{h:H,tex:beh}),wW=B.muur(.6,.6,1,10.6,{h:H,tex:beh}),wE=B.muur(11,.6,11.4,10.6,{h:H,tex:beh}),wS1=B.muur(.6,10.2,1.4,10.6,{h:H,tex:beh}),wS2=B.muur(2.6,10.2,11.4,10.6,{h:H,tex:beh});
    B.muur(4,7.4,4.25,10.2,{h:H,tex:beh});B.muur(4.25,7.4,7.4,7.65,{h:H,tex:beh});B.muur(8.6,7.4,11,7.65,{h:H,tex:beh});
    B.plafond(1,1,11,10.2,H,'#d8d0c0');
    // dichte gordijnen voor het grote raam
    for(let i=0;i<8;i++)B.box(.5,2.2,.1+(i%2)*.04,2.4+i*.6,1.3,1.1,i%2?'#5a1a1a':'#6a2420');B.box(5,.08,.1,4.5,2.45,1.06,'#2a2018');
    // de bank (de klant zit hier, gezicht naar de grond), salontafel, tv uit, kast
    B.meubel(F.sofa(2.6,'#4a3a3a'),5.4,5.6,Math.PI,{solid:[2.6,.9]});B.meubel(F.sofa(1.6,'#4a3a3a'),8.6,4.2,-Math.PI/2,{solid:[1.6,.9]});
    B.meubel(F.tafel(1.2,.7,.42,'#3a2a1a'),5.4,4.1);B.solid(4.8,3.75,6,4.45);B.meubel([[.34,.06,.34,-.3,.45,0,'#e8dcc0'],[.3,.02,.3,-.3,.485,0,'#c0261e'],[.1,.12,.1,.3,.48,.1,'#c9cfd6'],[.24,.02,.16,.3,.43,-.15,'#2a2c30']],5.4,4.1);
    B.meubel([[1.8,.5,.45,0,.25,0,'#2a2018'],[1.4,.8,.06,0,1.0,0,'#0c0c0e']],5.4,1.5);B.solid(4.5,1.2,6.3,1.8);
    B.meubel(F.kast(1.4,1.9,.45,'#4a3424'),9.8,1.4);B.solid(9.1,1.1,10.5,1.7,true);
    // familiefoto's
    [0,1,2].forEach(i=>{const ph=pc(12,10,(c,w,h)=>{R(c,0,0,w,h,'#2a1a10');R(c,1,1,w-2,h-2,'#c8b090');R(c,3+i,3,2,4,'#7a5a4a');R(c,7,3,2,4,'#5a4a3a')});B.plaat(ph,.4,.32,10.97,1.6,3+i*.6,-Math.PI/2,{muur:wE})});
    // één schemerlamp: het enige licht
    B.meubel([[.26,.04,.26,0,.02,0,'#2a2018'],[.04,1.3,.04,0,.67,0,'#2a2018'],[.4,.28,.4,0,1.42,0,'#d8b070',1]],3.5,6.6);B.licht(3.5,1.4,6.4,'#ffc880',2.6,5.5,{flik:1});
    B.licht(7,2.4,9,'#a0a8c0',.6,4);
    // gang en voordeur, kapstok
    B.meubel(F.deur(1.1,2.2,'#3a2a20','#c9a227'),2.0,10.25);B.meubel([[.06,.06,.9,0,1.7,0,'#3a2a20'],[.2,.8,.5,.05,1.25,0,'#3a3d44']],1.1,8.6);
    B.meubel([[.7,.9,.4,0,.45,0,'#3a2a20']],2.5,7.8);
    B.plek('bank',5.4,0,5.4);B.plek('salontafel',5.4,.44,4.1);B.plek('muur',10.6,0,6)},
  buiten(g,f){if(f.eigen)return;const m=K.model([[1.3,2.3,.12,0,1.15,-.02,'#3a2a20'],[1.1,2.1,.05,0,1.05,.05,'#4a3424'],[.2,.12,.02,.3,1.6,.09,'#c9a227'],[2.4,.6,.06,0,.3,1.4,'#3a3d44'],[.06,.6,1.4,-1.2,.3,.7,'#3a3d44'],[.06,.6,1.4,1.2,.3,.7,'#3a3d44'],[.28,.2,.02,0,2.42,.06,'#e8e4da']]);g.add(m);
    const s=K.sign('14','#1a1a1c','#e8e4da','#3a3d44',.22);s.position.set(.6,1.95,.1);g.add(s)}});
})();
