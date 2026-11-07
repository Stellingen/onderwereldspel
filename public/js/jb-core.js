// Kern van de gang uit het ontsnapspel (fase 2): de plattegronden, bewakers, lichtkegels en de kortste route.
// Puur rekenwerk zonder S of DOM. Het spel laadt dit vóór jailbreak.js (game.html); de voorpagina laadt het voor de
// live gang-demo bij de minigames (lp-gang.js). Eén bron, geen kopie.
// ---------- fase 2: de gang ----------
// # muur · . vloer · c kratten (blokkeren zicht en doorgang) · L zoeklamp (blokkeert doorgang) · S celdeur (veilig) · E uitgang
// g: bewakers met een route (heen en terug); l: zoeklampen met hun richtingen (wisselen elke 'every' stappen)
const JB_MAPS=[
 {g:["###E###",
     "#.....#",
     "#.c.c.#",
     "#.....#",
     "##.#.##",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#c...c#",
     "#.....#",
     "###S###"],
  guards:[{p:[[1,7],[5,7]]},{p:[[5,3],[1,3]]}],lamps:[]},
 {g:["#####E#",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#.##c.#",
     "#..L..#",
     "#.c.#.#",
     "#.....#",
     "###.#.#",
     "#.....#",
     "#S#####"],
  guards:[{p:[[5,9],[2,9]]},{p:[[1,7],[3,7]]},{p:[[5,3],[1,3]]}],lamps:[{x:3,y:5,dirs:['L','U','R','D'],every:2}]},
 {g:["###E###",
     "#.....#",
     "#.#.#.#",
     "#..L..#",
     "#.#.#.#",
     "#.....#",
     "##c.c##",
     "#.....#",
     "#.#.#.#",
     "#.....#",
     "#S#####"],
  guards:[{p:[[5,9],[2,9]]},{p:[[1,7],[5,7]]},{p:[[1,1],[5,1]]}],lamps:[{x:3,y:3,dirs:['D','L','U','R'],every:2}]}];
const JB_DIR={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0]};
// route heen en terug uitschrijven tot losse vakjes
function jbRoute(p){const out=[];for(let i=0;i<p.length-1;i++){const [x1,y1]=p[i],[x2,y2]=p[i+1],dx=Math.sign(x2-x1),dy=Math.sign(y2-y1);let x=x1,y=y1;
  while(x!==x2||y!==y2){out.push([x,y]);x+=dx;y+=dy}}out.push(p[p.length-1]);
 const back=out.slice(1,-1).reverse();return out.concat(back)}
function jbMap(i,range){const M=JB_MAPS[i],H=M.g.length,W=M.g[0].length,cell=(x,y)=>x<0||y<0||x>=W||y>=H?'#':M.g[y][x];let S0=null,E0=null;
 M.g.forEach((r,y)=>[...r].forEach((c,x)=>{if(c==='S')S0=[x,y];if(c==='E')E0=[x,y]}));
 const guards=M.guards.map(g=>({route:jbRoute(g.p)}));
 let P=1;const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a*b/gcd(a,b);guards.forEach(g=>{P=lcm(P,g.route.length)});M.lamps.forEach(l=>{P=lcm(P,l.dirs.length*l.every)});
 return {W,H,cell,S:S0,E:E0,guards,lamps:M.lamps,range,P}}
const jbBlock=c=>c==='#'||c==='c'||c==='L';
// bewaker op stap t: positie en kijkrichting (de richting waarin hij loopt)
function jbGuard(g,t){const n=g.route.length,i=t%n,[x,y]=g.route[i],[nx,ny]=g.route[(i+1)%n];
 let dx=nx-x,dy=ny-y;if(!dx&&!dy){const [px,py]=g.route[(i-1+n)%n];dx=x-px;dy=y-py}return {x,y,dx,dy}}
// lichtkegel: rechtdoor tot 'range' vakjes, vanaf het tweede vakje ook één breder; muren en kratten houden hem tegen
function jbCone(m,x,y,dx,dy,r,out){for(let k=1;k<=r;k++){const cx=x+dx*k,cy=y+dy*k;if(jbBlock(m.cell(cx,cy)))break;out.add(cx+','+cy);
  if(k>=2)[[-dy,dx],[dy,-dx]].forEach(([sx,sy])=>{const ax=cx+sx,ay=cy+sy;if(!jbBlock(m.cell(ax,ay))&&!jbBlock(m.cell(x+dx*(k-1)+sx,y+dy*(k-1)+sy)))out.add(ax+','+ay)})}}
function jbSeen(m,t){const s=new Set(),gs=[];m.guards.forEach(g=>{const G=jbGuard(g,t);gs.push(G);jbCone(m,G.x,G.y,G.dx,G.dy,m.range,s)});
 m.lamps.forEach(l=>{const d=JB_DIR[l.dirs[Math.floor(t/l.every)%l.dirs.length]];jbCone(m,l.x,l.y,d[0],d[1],m.range+1,s)});return {cone:s,gs}}
// kan de speler van (x,y) op stap t naar (nx,ny)? gezien, tegen een bewaker aan of door hem heen = gepakt
function jbStep(m,x,y,nx,ny,t){const c=m.cell(nx,ny);if(jbBlock(c))return 'wall';if(c==='E')return 'out';
 const a=jbSeen(m,t),b=jbSeen(m,t+1);
 for(let i=0;i<b.gs.length;i++){const G0=a.gs[i],G1=b.gs[i];if(G1.x===nx&&G1.y===ny)return 'bump';if(G0.x===nx&&G0.y===ny&&G1.x===x&&G1.y===y)return 'bump'}
 if(c!=='S'&&b.cone.has(nx+','+ny))return 'seen';return 'ok'}
// kortste route (in stappen, wachten telt mee) met breadth-first search over (vakje, stap mod P)
function jbSolve(m,max){max=max||220;const seen=new Set(),q=[[m.S[0],m.S[1],0]];seen.add(m.S+',0');
 for(let h=0;h<q.length;h++){const [x,y,t]=q[h];if(t>=max)continue;
  for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[0,0]]){const nx=x+dx,ny=y+dy,r=jbStep(m,x,y,nx,ny,t);if(r==='out')return t+1;if(r!=='ok')continue;
   const k=nx+','+ny+','+((t+1)%m.P);if(seen.has(k))continue;seen.add(k);q.push([nx,ny,t+1])}}return 0}
// kortste route als lijst zetten [dx,dy] (voor de test-hook)
function jbPath(m,max){max=max||220;const par=new Map(),q=[[m.S[0],m.S[1],0]],k0=m.S+',0';par.set(k0,null);
 for(let h=0;h<q.length;h++){const [x,y,t]=q[h];if(t>=max)continue;const kk=x+','+y+','+(t%m.P);
  for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1],[0,0]]){const nx=x+dx,ny=y+dy,r=jbStep(m,x,y,nx,ny,t);
   if(r==='out'){const out=[[dx,dy]];let k=kk;while(par.get(k)){const p=par.get(k);out.unshift(p.m);k=p.k}return out}
   if(r!=='ok')continue;const k=nx+','+ny+','+((t+1)%m.P);if(par.has(k))continue;par.set(k,{k:kk,m:[dx,dy]});q.push([nx,ny,t+1])}}return null}


// ---------- de gang van opzij (sinds november 2026 fase 2 in het spel) ----------
// De oude rastergang hierboven blijft voor de live demo op de voorpagina. In het spel sluip je nu van dekking naar dekking
// door een lange gang. Een bewaker op de loopbrug kijkt afwisselend weg en de gang in; een camera wijst om de beurt naar
// links of rechts. Alles hieronder is puur rekenwerk (zelfde code voor het spel en de test-bot). Eenheden: de gang is 100 lang.
function jbRng(seed){let s=(seed>>>0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
const JBG_KINDS=['pilaar','kar','kast','nis'];
// d = moeilijkheid 0..1 (jbParams().d); seed bepaalt de plattegrond en het ritme van de bewaker
function jbGang(d,seed){const r=jbRng(seed||1),L=100,v=9,lo=(a,b)=>a+(b-a)*r();
 const g={x:88,reach:60+16*d,away:[4.4-1.4*d,6.2-2*d],turn:1.2-.45*d,look:[1.5+.7*d,2.3+.9*d]};
 const W=5,maxGap=.58*(g.away[0]+g.turn)*v;   // langste stuk zonder dekking: haalbaar binnen één keer wegkijken, met speling
 const cam=d>=.3?{x:Math.round(lo(46,58)),zw:9,every:2.9-.7*d,blink:.65}:null;
 const anchors=[{x:4,k:'cel',fix:1}];if(cam)anchors.push({x:cam.x-cam.zw-5.5,k:JBG_KINDS[0|r()*3]},{x:cam.x,k:'cam',nofill:1},{x:cam.x+cam.zw+5.5,k:JBG_KINDS[0|r()*3],nofill:1});
 anchors.push({x:g.x+4,k:'post',end:1});anchors.sort((a,b)=>a.x-b.x);
 // anchors.nofill: geen extra dekking in het stuk ervóór (dat is het camerazicht)
 const covers=[];for(let i=0;i<anchors.length;i++){const A=anchors[i];if(i>0&&!A.nofill){let px=anchors[i-1].x+W/2;const end=A.x-W/2;
   while(end-px>maxGap){const gap=Math.min(end-px-W-4,maxGap*lo(.62,.92));if(gap<4)break;const cx=px+gap+W/2;covers.push({x:+cx.toFixed(1),w:W,k:JBG_KINDS[0|r()*4]});px=cx+W/2}}
  if(!A.end&&A.k!=='cel')covers.push({x:+A.x.toFixed(1),w:A.k==='cam'?5:W,k:A.k})}
 covers.sort((a,b)=>a.x-b.x);
 return {d,seed,L,v,g,cam,covers,start:4,exit:96,safeFrom:g.x-3,stones:d<.5?2:1,time:Math.round(68-14*d),grace:.5-.22*d,r}}
// nieuwe toestand (bewaker begint weg te kijken, camera naar links)
function jbGangState(G){return {gs:'away',gt:G.g.away[0]+G.r()*(G.g.away[1]-G.g.away[0])+1.2,dis:0,cs:'L',ct:G.cam?G.cam.every:0,sus:0,x:G.start,t:0}}
// één tijdstap; mv = -1, 0 of 1 (lopen). Geeft 'caught', 'out' of null.
function jbGangTick(G,s,dt,mv){s.t+=dt;const R=G.r,g=G.g;s.dis=Math.max(0,s.dis-dt);
 s.gt-=dt;if(s.gt<=0){if(s.gs==='away'){s.gs='turn';s.gt=g.turn}else if(s.gs==='turn'){s.gs='look';s.gt=g.look[0]+R()*(g.look[1]-g.look[0])}
  else if(s.gs==='look'){s.gs='back';s.gt=.35}else{s.gs='away';s.gt=g.away[0]+R()*(g.away[1]-g.away[0])}}
 if(G.cam){s.ct-=dt;if(s.ct<=0){s.cs=s.cs==='L'?'R':'L';s.ct=G.cam.every*(.85+.3*R())}}
 if(mv)s.x=Math.max(G.start,Math.min(G.exit,s.x+mv*G.v*dt));if(s.x>=G.exit)return 'out';
 if(jbGangSeen(G,s,s.x)){s.sus+=dt*100/G.grace;if(s.sus>=100)return 'caught'}else s.sus=Math.max(0,s.sus-dt*55);return null}
// afleiden: een steentje gooien. De bewaker draait zich om naar het geluid; de camera merkt het niet.
function jbGangDistract(G,s){s.gt=Math.max(s.gs==='away'?s.gt:0,3.4-.8*G.d);s.gs='away';s.dis=1.6}
const jbGangHid=(G,x)=>x<=G.start+2.6||x>=G.safeFrom||G.covers.some(c=>Math.abs(x-c.x)<=c.w/2);
// camera-zone van een kant: [van, tot]
const jbGangZone=(G,side)=>{const c=G.cam,h=2.5;return side==='L'?[c.x-h-c.zw,c.x-h]:[c.x+h,c.x+h+c.zw]};
function jbGangSeen(G,s,x){if(jbGangHid(G,x))return false;
 if(s.gs==='look'&&x>=G.g.x-G.g.reach)return true;
 if(G.cam){const z=jbGangZone(G,s.cs);if(x>=z[0]&&x<=z[1])return true}return false}
// voorspelling (voor de bot en de hint): is plek x de komende 'sec' seconden veilig als niemand verandert?
function jbGangSafeFor(G,s,x){if(jbGangHid(G,x))return 99;let t=0;
 if(s.gs==='look')return 0;const gIn=x>=G.g.x-G.g.reach;
 let gSafe=gIn?(s.gs==='away'?s.gt+G.g.turn:s.gs==='turn'?s.gt:s.gs==='back'?s.gt+G.g.away[0]+G.g.turn:0):99;
 let cSafe=99;if(G.cam){const zL=jbGangZone(G,'L'),zR=jbGangZone(G,'R'),inL=x>=zL[0]&&x<=zL[1],inR=x>=zR[0]&&x<=zR[1];
  if((inL&&s.cs==='L')||(inR&&s.cs==='R'))cSafe=0;else if(inL||inR)cSafe=s.ct}
 return Math.min(gSafe,cSafe)}

// ---------- de bewakerspost: sleutels pakken bij een slapende bewaker ----------
// diep slapen → je hand mag bewegen; 'woelt' is de waarschuwing (nog veilig); licht slapen → bewegen maakt hem wakker
function jbSleep(d,seed){const r=jbRng((seed||1)*7+3);return {d,r,deep:[2.3-.7*d,3.3-1*d],stir:.6-.25*d,light:[1+.4*d,1.6+.5*d],
  need:4.2+1.6*d,wakeIn:.95-.35*d,keys:4+(d>.5?1:0),keyTime:Math.round(8-3*d)}}
function jbSleepState(Z){return {ss:'deep',st:Z.deep[0]+Z.r()*(Z.deep[1]-Z.deep[0]),prog:0,wake:0}}
// hold = hand beweegt. Geeft 'woke', 'got' of null.
function jbSleepTick(Z,s,dt,hold){const R=Z.r;s.st-=dt;
 if(s.st<=0){if(s.ss==='deep'){s.ss='stir';s.st=Z.stir}else if(s.ss==='stir'){s.ss='light';s.st=Z.light[0]+R()*(Z.light[1]-Z.light[0])}else{s.ss='deep';s.st=Z.deep[0]+R()*(Z.deep[1]-Z.deep[0])}}
 if(hold){if(s.ss==='light'){s.wake+=dt*100/Z.wakeIn;if(s.wake>=100)return 'woke'}else{s.prog+=dt*100/Z.need;if(s.prog>=100){s.prog=100;return 'got'}}}
 else s.wake=Math.max(0,s.wake-dt*14);return null}
// de sleutelbos: één sleutel past bij het bordje op de deur (kleur én nummer)
const JB_KEYC=[['rood','#ff5c6c'],['blauw','#5aa9ff'],['geel','#ffd24a'],['groen','#3fe395']];
function jbKeys(Z){const r=Z.r,c=0|r()*4,n=1+(0|r()*4),out=[{c,n,ok:1}],has=k=>out.some(o=>o.c===k.c&&o.n===k.n);
 const near=[{c,n:1+((n)%4)},{c:(c+1+(0|r()*3))%4,n},{c,n:1+((n+1)%4)},{c:(c+2)%4,n}];
 for(const k of near){if(out.length>=Z.keys)break;if(!has(k))out.push(k)}
 while(out.length<Z.keys){const k={c:0|r()*4,n:1+(0|r()*4)};if(!has(k))out.push(k)}
 for(let i=out.length-1;i>0;i--){const j=0|r()*(i+1);[out[i],out[j]]=[out[j],out[i]]}return {door:{c,n},keys:out}}
