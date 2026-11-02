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

