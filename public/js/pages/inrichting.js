// Woning (Verblijf): elke woning als isometrisch tafereeltje (SVG) en inrichten met spullen.
// Plekken per woning: HOMES[i].slots. Neergezet = S.furn (geeft voordeel via furnFx), opgeborgen = S.furnStore (doet niets).
// Spullen met hmax (slaapzak, winkelwagen) passen niet in een betere woning en gaan bij verhuizen naar de opslag.

/* ---------- isometrische tekenhulp ---------- */
// x loopt schuin naar rechts-onder, y schuin naar links-onder, z omhoog. Achterwanden: x=0 (links) en y=0 (rechts).
const VH_K=Math.cos(Math.PI/6),vhR=n=>Math.round(n*100)/100;
function vhHex(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)||0)}
function vhMix(a,b,t){const A=vhHex(a),B=vhHex(b);return '#'+A.map((v,i)=>Math.max(0,Math.min(255,Math.round(v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('')}
const vhLit=(c,t)=>vhMix(c,'#ffffff',t),vhDrk=(c,t)=>vhMix(c,'#000000',t),vhShd=c=>({t:vhLit(c,.12),l:c,r:vhDrk(c,.34)});
function vhRng(s){let a=2166136261;for(const c of String(s))a=Math.imul(a^c.charCodeAt(0),16777619);return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vhIso(pfx){
 const u=20,C=VH_K*u,Sn=u/2,Z=u,b={x0:1e9,y0:1e9,x1:-1e9,y1:-1e9},defs=[],memo={};let trk=true,n=0;
 const P=(x,y,z)=>{const X=(x-y)*C,Y=(x+y)*Sn-(z||0)*Z;if(trk){if(X<b.x0)b.x0=X;if(X>b.x1)b.x1=X;if(Y<b.y0)b.y0=Y;if(Y>b.y1)b.y1=Y}return [vhR(X),vhR(Y)]};
 const pts=a=>a.map(p=>P(p[0],p[1],p[2]).join(',')).join(' ');
 const g={u,C,Sn,Z,b,P,pts,defs,
  track(v){trk=v},id(){return pfx+(n++).toString(36)},def(s){defs.push(s)},
  poly:(a,f,x)=>`<polygon points="${pts(a)}" fill="${f}"${x?' '+x:''}/>`,
  pl:(a,c,w,x)=>`<polyline points="${pts(a)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${x?' '+x:''}/>`,
  // vlakken: vloer op hoogte z (lokaal x,y), rechterwand op y=y0 (lokaal x, v=-z), linkerwand op x=x0 (lokaal s=yr-y, v=-z)
  fl:z=>`matrix(${vhR(C)} ${vhR(Sn)} ${vhR(-C)} ${vhR(Sn)} 0 ${vhR(-(z||0)*Z)})`,
  wr:y0=>`matrix(${vhR(C)} ${vhR(Sn)} 0 ${Z} ${vhR(-y0*C)} ${vhR(y0*Sn)})`,
  wl:(x0,yr)=>`matrix(${vhR(C)} ${vhR(-Sn)} 0 ${Z} ${vhR((x0-yr)*C)} ${vhR((x0+yr)*Sn)})`,
  at:(x,y,z,s,cls,st)=>{const p=P(x,y,z);return `<g${cls?` class="${cls}"`:''}${st?` style="${st}"`:''} transform="translate(${p[0]} ${p[1]})">${s}</g>`}};
 g.box=(x,y,z,w,d,h,c,o)=>{o=o||{};const s=typeof c==='string'?vhShd(c):c;let out='';
  if(!o.noL)out+=g.poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],s.l);
  if(!o.noR)out+=g.poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],s.r);
  if(!o.noT)out+=g.poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],s.t);
  if(o.edge!==false&&!o.noT)out+=g.pl([[x,y+d,z+h],[x+w,y+d,z+h],[x+w,y,z+h]],o.edge||'rgba(255,255,255,.1)',.6);
  return out};
 g.lin=(st,dir)=>{const k='l'+dir+JSON.stringify(st);if(memo[k])return memo[k];const id=g.id(),v=dir==='h'?'x2="1" y2="0"':'x2="0" y2="1"';
  g.def(`<linearGradient id="${id}" x1="0" y1="0" ${v}>${st.map(s=>`<stop offset="${s[1]}" stop-color="${s[0]}"${s[2]!=null?` stop-opacity="${s[2]}"`:''}/>`).join('')}</linearGradient>`);return memo[k]=`url(#${id})`};
 g.rad=(col,a)=>{a=a==null?.9:a;const k='r'+col+a;if(memo[k])return memo[k];const id=g.id();
  g.def(`<radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${a}"/><stop offset=".4" stop-color="${col}" stop-opacity="${vhR(a*.35)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`);return memo[k]=`url(#${id})`};
 g.glow=(x,y,z,r,col,a,cls)=>{const p=P(x,y,z);return `<ellipse class="vh-glow${cls?' '+cls:''}" cx="${p[0]}" cy="${p[1]}" rx="${vhR(r*u)}" ry="${vhR(r*u*.72)}" fill="${g.rad(col)}" opacity="${a}"/>`};
 g.cyl=(x,y,z,r,h,c,o)=>{o=o||{};const [cx,yb]=P(x,y,z),yt=P(x,y,z+h)[1],rx=vhR(r*1.2247*u),ry=vhR(r*.7071*u);
  const f=g.lin([[vhDrk(c,.5),0],[c,.4],[vhLit(c,.16),.62],[vhDrk(c,.35),1]],'h');
  return `<path d="M${vhR(cx-rx)} ${yb}A${rx} ${ry} 0 0 0 ${vhR(cx+rx)} ${yb}V${yt}A${rx} ${ry} 0 0 0 ${vhR(cx-rx)} ${yt}Z" fill="${f}"/>`+(o.noTop?'':`<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" fill="${o.top||vhLit(c,.1)}"/>`)};
 g.ell=(x,y,z,r,f,x2)=>{const p=P(x,y,z);return `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${vhR(r*1.2247*u)}" ry="${vhR(r*.7071*u)}" fill="${f}"${x2?' '+x2:''}/>`};
 // voorste helft van een ring rond een cilinder (banden op een ton)
 g.band=(x,y,z,r,c,w)=>{const [cx,cy]=P(x,y,z),rx=vhR(r*1.2247*u),ry=vhR(r*.7071*u);return `<path d="M${vhR(cx-rx)} ${cy}A${rx} ${ry} 0 0 0 ${vhR(cx+rx)} ${cy}" fill="none" stroke="${c}" stroke-width="${w}"/>`};
 g.shadow=(x,y,w,d)=>g.poly([[x-.06,y-.06,0],[x+w+.14,y-.06,0],[x+w+.18,y+d+.18,0],[x-.06,y+d+.14,0]],'#000');
 return g}
// convex omhulsel (voor het knipvlak van de tram)
function vhHull(p){p=p.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
 for(const q of p){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)}
 for(const q of p.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)}
 return lo.slice(0,-1).concat(up.slice(0,-1))}

/* ---------- vaste stukjes ---------- */
const VH_FLAME=`<path d="M0 0C-7-4-6-13 0-24C6-13 7-4 0 0Z" fill="#ff5a1f"/><path d="M0 0C-5-3-4-10 0-17C4-10 5-3 0 0Z" fill="#ffa53a"/><path d="M0 0C-2.6-2-2.2-6 0-10C2.2-6 2.6-2 0 0Z" fill="#fff0b8"/>`;
const VH_FLAME_S=`<path d="M0 0C-1.7-1.3-1.5-3.6 0-6C1.5-3.6 1.7-1.3 0 0Z" fill="#ffb347"/><path d="M0-.5C-.8-.9-.7-2 0-3.2C.7-2 .8-.9 0-.5Z" fill="#fff4cf"/>`;
const VH_DOG=`<path class="vh-tail" d="M12-6c5-1 8-4 9-8" fill="none" stroke="#8c5a31" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="2" cy="-5.5" rx="13" ry="6" fill="#a8723f"/><ellipse cx="4" cy="-8.6" rx="9" ry="2.5" fill="#c08850"/>
<path d="M-9-1.4h9M-9 1h7" stroke="#8c5a31" stroke-width="2.4" stroke-linecap="round"/>
<ellipse cx="-11" cy="-8" rx="5.4" ry="4.8" fill="#a8723f"/><ellipse cx="-15.6" cy="-6.6" rx="3.4" ry="2.3" fill="#966235"/>
<circle cx="-18.4" cy="-7.1" r="1.05" fill="#17110d"/><path d="M-12.6-9.2q1 .7 2 0" stroke="#17110d" stroke-width=".8" fill="none"/>
<path d="M-9-12.2l-3.2-3.4l-.6 5.2z" fill="#7a4b26"/>`;
const VH_DOBER=`<path d="M-2 0c-1-6 1-11 6-12c4 0 6 4 5 12z" fill="#1d1715"/><path d="M1.6-11.4c-1-3 0-6.4 3.2-7.4c3 1 4 4.2 3 7.4z" fill="#1d1715"/>
<ellipse cx="3" cy="-19.4" rx="3.4" ry="3" fill="#1d1715"/><path d="M0-18.8h-3.4l.6 1.8h2.8z" fill="#1d1715"/><path d="M2.2-21.8l-1-4.4 2.6 2.8zM4.6-22l.4-4.4 1.8 3.4z" fill="#1d1715"/>
<circle cx="1.4" cy="-19.8" r=".55" fill="#c58a4a"/><path d="M-2.6-17.4h2.4M1.5-12.6l1.6 1.6" stroke="#9a6a35" stroke-width=".8"/><path d="M.4 0v-4.4M3.6 0v-4.4" stroke="#1d1715" stroke-width="1.7"/>`;
function vhLeaves(k){const L=[[-62,22,'#2c7a46'],[-28,26,'#3a9256'],[6,24,'#2f8550'],[40,21,'#25683c'],[74,18,'#3a9256'],[-98,17,'#25683c'],[112,15,'#2f8550']];
 return `<g transform="scale(${k})">`+L.map(([a,l,c])=>`<g transform="rotate(${a})"><path d="M0 0V${-l*.42}" stroke="#2a5a33" stroke-width="1.1"/><path d="M0 ${-l*.4}C${l*.34} ${-l*.5} ${l*.32} ${-l*.96} 0 ${-l*1.1}C${-l*.32} ${-l*.96} ${-l*.34} ${-l*.5} 0 ${-l*.4}Z" fill="${c}"/><path d="M0 ${-l*.42}V${-l*1.04}" stroke="rgba(0,0,0,.28)" stroke-width=".6"/></g>`).join('')+'</g>'}
// stad door een raam (lokale wandcoördinaten): blokken met verlichte ramen
function vhCity(a0,a1,base,lo,hi,seed,o){o=o||{};const r=vhRng(seed);let x=a0-.2,s='';
 while(x<a1){const w=.35+r()*.9,h=lo+r()*(hi-lo);s+=`<rect x="${vhR(x)}" y="${vhR(base-h)}" width="${vhR(w)}" height="${vhR(h+.05)}" fill="${o.col||'#0b0f1d'}"/>`;
  for(let wy=base-h+.15;wy<base-.12;wy+=.22)for(let wx=x+.08;wx<x+w-.1;wx+=.16)if(r()<(o.dens||.3)){const c=r()<.15?'#9fd2ff':'#ffcf7a',tw=r()<.1;
   s+=`<rect${tw?` class="vh-tw" style="animation-delay:${vhR(r()*7)}s"`:''} x="${vhR(wx)}" y="${vhR(wy)}" width=".07" height=".1" fill="${c}" opacity="${vhR(.45+.45*r())}"/>`}
  x+=w+r()*.12}
 return s}
// grachtenpanden met trapgevels
function vhGables(a0,a1,base,seed){const r=vhRng(seed);let x=a0-.1,s='';const cols=['#1d1a22','#261f24','#1a1a20','#231c1c'];
 while(x<a1){const w=.55+r()*.35,h=1.1+r()*.6,c=cols[Math.floor(r()*cols.length)],st=.12;
  s+=`<path d="M${vhR(x)} ${base}V${vhR(base-h)}H${vhR(x+w*.12)}V${vhR(base-h-st)}H${vhR(x+w*.26)}V${vhR(base-h-st*2)}H${vhR(x+w*.38)}V${vhR(base-h-st*3)}H${vhR(x+w*.62)}V${vhR(base-h-st*2)}H${vhR(x+w*.74)}V${vhR(base-h-st)}H${vhR(x+w*.88)}V${vhR(base-h)}H${vhR(x+w)}V${base}Z" fill="${c}"/>`;
  for(let wy=base-h+.16;wy<base-.15;wy+=.26)for(const fx of [.2,.5,.8])if(r()<.55)s+=`<rect x="${vhR(x+w*fx-.05)}" y="${vhR(wy)}" width=".1" height=".15" fill="#ffc96b" opacity="${vhR(.5+.45*r())}"/>`;
  x+=w}
 return s}
// raam in een wand (lokale coördinaten v0 boven, v1 onder); view = uitzicht, blind = luik dat dichtgaat bij onderduiken
function vhWin(g,a0,a1,v0,v1,view,o){o=o||{};const w=vhR(a1-a0),h=vhR(v1-v0),cl=g.id();
 g.def(`<clipPath id="${cl}"><rect x="${a0}" y="${v0}" width="${w}" height="${h}"/></clipPath>`);
 const fr=o.frame||'#2a2c31',ft=o.ft||.1;let bars='';
 (o.cols||[]).forEach(f=>bars+=`<rect x="${vhR(a0+w*f-.025)}" y="${v0}" width=".05" height="${h}" fill="${fr}"/>`);
 (o.rows||[]).forEach(f=>bars+=`<rect x="${a0}" y="${vhR(v0+h*f-.025)}" width="${w}" height=".05" fill="${fr}"/>`);
 return `<g clip-path="url(#${cl})">${view}${bars}<rect class="vh-blind" x="${a0}" y="${v0}" width="${w}" height="${h}" fill="${o.blind||'#15161b'}"/></g>
  <rect x="${vhR(a0-ft/2)}" y="${vhR(v0-ft/2)}" width="${vhR(+w+ft)}" height="${vhR(+h+ft)}" fill="none" stroke="${fr}" stroke-width="${ft}"/>${o.sill?`<rect x="${vhR(a0-.12)}" y="${vhR(v1+ft/2)}" width="${vhR(+w+.24)}" height=".1" fill="${o.sill}"/>`:''}`}
// deur in een wand (lokaal), met extra sloten als item
function vhDoor(g,a0,a1,h,col,F,GH,o){o=o||{};const w=a1-a0;let s=`<rect x="${vhR(a0-.08)}" y="${vhR(-h-.08)}" width="${vhR(w+.16)}" height="${vhR(h+.08)}" fill="${vhDrk(col,.5)}"/><rect x="${a0}" y="${-h}" width="${vhR(w)}" height="${h}" fill="${col}"/>
  <rect x="${vhR(a0+w*.14)}" y="${vhR(-h+.2)}" width="${vhR(w*.72)}" height="${vhR(h*.36)}" fill="none" stroke="${vhDrk(col,.35)}" stroke-width=".04"/><rect x="${vhR(a0+w*.14)}" y="${vhR(-h*.5)}" width="${vhR(w*.72)}" height="${vhR(h*.36)}" fill="none" stroke="${vhDrk(col,.35)}" stroke-width=".04"/>
  <circle cx="${vhR(a1-.15)}" cy="${vhR(-h*.48)}" r=".055" fill="#c9a227"/>`;
 const k=F.sloten?'vh-it':GH?'vh-it vh-ghost':'';
 if(k)s+=`<g class="${k}" data-it="sloten"><rect x="${vhR(a0+.04)}" y="${vhR(-h*.42)}" width="${vhR(w-.08)}" height="${vhR(h*.42-.06)}" fill="#6d747c"/><path d="M${vhR(a0+.04)} ${vhR(-h*.42)}h${vhR(w-.08)}" stroke="#9aa3ad" stroke-width=".04"/>
  ${[.62,.5,.38].map(f=>`<rect x="${vhR(a1-.3)}" y="${vhR(-h*f)}" width=".18" height=".11" fill="#b9c0c8"/><circle cx="${vhR(a1-.21)}" cy="${vhR(-h*f+.055)}" r=".025" fill="#2a2c30"/>`).join('')}
  <path d="M${vhR(a1-.12)} ${vhR(-h*.66)}q-.25 .18 -.05 .36q.2 .17 -.05 .34" fill="none" stroke="#c9ced4" stroke-width=".035" stroke-dasharray=".05 .03"/></g>`;
 return s}
// bed met het hoofdeinde aan de achterkant (kleine y)
function vhBed(g,x,y,dx,dy,o,good){const h=o.h||.32,m=good?.26:.18,ct=h+m;let s='';
 if(o.head)s+=g.box(x-.04,y-.13,0,dx+.08,.13,o.head,o.hc||o.frame);
 s+=g.box(x,y,0,dx,dy,h,o.frame)+g.box(x+.03,y+.03,h,dx-.06,dy-.06,m,o.mat||'#d9d2c2');
 const np=good?Math.max(2,Math.round(dx/.7)):Math.max(1,Math.round(dx/1.1)),pw=(dx-.2)/np;
 for(let i=0;i<np;i++)s+=g.box(x+.1+i*pw+.02,y+.1,ct,pw-.06,.42,good?.18:.12,o.pil||'#e6e1d6');
 const cy=y+dy*.34;s+=g.box(x+.02,cy,ct,dx-.04,y+dy-cy-.02,good?.16:.08,o.cover);
 if(good)s+=g.box(x+.02,cy,ct+.16,dx-.04,.24,.04,vhLit(o.cover,.22),{edge:false})+g.box(x+.02,y+dy*.7,ct+.16,dx-.04,.45,.05,o.throw||'#c9a227');
 return s}

/* ---------- de woningen ---------- */
const VH_SCENE={};
// gewone kamer met twee achterwanden
function vhRoom(g,L,W,D,H,o){const cap=o.cap||'#26272d';
 L.walls.push(g.box(-.32,-.32,0,.32,.32,H,cap,{noL:1,noR:1,edge:false})+g.box(-.32,0,0,.32,D,H,cap,{noR:1})+g.box(0,-.32,0,W,.32,H,cap,{noL:1}));
 const tv=g.lin([['#000',0,.5],['#000',.6,0]],'v'),cL=g.lin([['#000',0,0],['#000',.7,0],['#000',1,.38]],'h'),cR=g.lin([['#000',0,.38],['#000',.3,0],['#000',1,0]],'h');
 L.walls.push(`<g transform="${g.wl(0,D)}"><rect y="${-H}" width="${D}" height="${H}" fill="${o.wallL||o.wall}"/>${o.dL||''}<rect y="${-H}" width="${D}" height="${H}" fill="${tv}"/><rect y="${-H}" width="${D}" height="${H}" fill="${cL}"/>${o.wL||''}</g>`);
 L.walls.push(`<g transform="${g.wr(0)}"><rect y="${-H}" width="${W}" height="${H}" fill="${o.wallR||o.wall}"/>${o.dR||''}<rect y="${-H}" width="${W}" height="${H}" fill="${tv}"/><rect y="${-H}" width="${W}" height="${H}" fill="${cR}"/>${o.wR||''}</g>`);
 L.floor.push(g.box(0,0,-.4,W,D,.4,o.slab||'#111216',{noT:1,edge:false}));
 const fs=g.id();g.def(`<radialGradient id="${fs}" cx=".45" cy=".42" r=".8"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>`);
 const aoX=g.lin([['#000',0,.5],['#000',1,0]],'h'),aoY=g.lin([['#000',0,.5],['#000',1,0]],'v');
 L.floor.push(`<g transform="${g.fl(0)}"><rect width="${W}" height="${D}" fill="${o.floor}"/>${o.dF||''}<rect width="${W}" height="${D}" fill="url(#${fs})"/><rect width=".6" height="${D}" fill="${aoX}"/><rect width="${W}" height=".6" fill="${aoY}"/></g>`)}

// Onder de brug: kademuur, bruggewelf met doorkijk, water, vuurton. Bijna niks.
VH_SCENE.brug=(g,L,F)=>{const W=10,D=5,H=5.2,WD=2.3;
 const br=g.id(),cb=g.id(),cl=g.id(),sky=g.lin([['#04060d',0],['#0f1730',.65],['#2a2236',1]],'v'),wat=g.lin([['#17243d',0],['#070b14',1]],'v');
 g.def(`<pattern id="${br}" width=".9" height=".56" patternUnits="userSpaceOnUse"><rect width=".9" height=".56" fill="#4a2a21"/><path d="M0 .01H.9M0 .29H.9M.45 .01V.29M0 .29V.56M.9 .29V.56" stroke="#24130e" stroke-width=".035"/></pattern>
  <pattern id="${cb}" width=".42" height=".42" patternUnits="userSpaceOnUse"><rect width=".42" height=".42" fill="#18171b"/><rect x=".035" y=".035" width=".35" height=".35" rx=".1" fill="#29282d"/></pattern>`);
 const arch='M3 0V-2.2A2.6 2.6 0 0 1 8.2-2.2V0Z';g.def(`<clipPath id="${cl}"><path d="${arch}"/></clipPath>`);
 const r=vhRng('brug');let stars='';for(let i=0;i<20;i++)stars+=`<rect x="${vhR(3+r()*5.2)}" y="${vhR(-4.9+r()*2.9)}" width=".04" height=".04" fill="#fff" opacity="${vhR(.25+r()*.5)}"/>`;
 let refl='';for(let i=0;i<9;i++){const x=3.2+r()*4.8,c=r()<.7?'#ffc36b':'#9fd2ff';refl+=`<rect class="vh-shim" style="animation-delay:${vhR(r()*3)}s" x="${vhR(x)}" y="${vhR(-.85+r()*.75)}" width="${vhR(.2+r()*.4)}" height=".035" fill="${c}" opacity=".55"/>`}
 // rechterwand: zijkant van de brug met boog
 L.walls.push(g.box(0,-.5,0,W,.5,H,'#3a2119',{noL:1}));
 const dR=`<g clip-path="url(#${cl})"><rect x="3" y="-5" width="5.2" height="5" fill="${sky}"/>${stars}<circle cx="7.1" cy="-3.9" r=".7" fill="${g.rad('#f3ead0',.45)}"/><circle cx="7.1" cy="-3.9" r=".2" fill="#efe6c8"/>
   ${vhCity(2.8,8.4,-.95,.35,1.45,'brugstad',{dens:.34})}<rect x="3" y="-.95" width="5.2" height=".95" fill="${wat}"/>${refl}</g>
  <path d="M0 ${-H}H${W}V0H0Z${arch}" fill="url(#${br})" fill-rule="evenodd"/>
  <path d="M2.55 0V-2.2A3.05 3.05 0 0 1 8.65-2.2V0H8.2V-2.2A2.6 2.6 0 0 0 3-2.2V0Z" fill="#5d3b2c"/>
  ${Array.from({length:15},(_,i)=>{const a=Math.PI+Math.PI*(i+.5)/15;return `<path d="M${vhR(5.6+2.6*Math.cos(a))} ${vhR(-2.2+2.6*Math.sin(a))}L${vhR(5.6+3.05*Math.cos(a))} ${vhR(-2.2+3.05*Math.sin(a))}" stroke="#2e1a12" stroke-width=".035"/>`}).join('')}
  <path d="M3 0V-2.2A2.6 2.6 0 0 1 8.2-2.2V0" fill="none" stroke="#140a07" stroke-width=".24"/>
  <rect y="${-H}" width="${W}" height="${H}" fill="${g.lin([['#000',0,.55],['#000',.55,0]],'v')}"/>
  <path d="M.4-4.1c.5-.4 1.2-.1 1.5.3m.3-.5c.2.5.1 1-.3 1.4" stroke="#3fe395" stroke-width=".07" fill="none" opacity=".55"/>
  <text x="8.9" y="-1.25" font-size=".42" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#b8a1ff" opacity=".45" transform="rotate(-4 8.9 -1.25)">MO</text>`;
 L.walls.push(`<g transform="${g.wr(0)}">${dR}</g>`);
 // linkerwand: kademuur met nis, graffiti en een regenpijp
 L.walls.push(g.box(-.5,0,0,.5,D,H,'#3a2119',{noR:1})+g.box(-.5,-.5,0,.5,.5,H,'#3a2119',{noL:1,noR:1,edge:false}));
 const dL=`<rect y="${-H}" width="${D}" height="${H}" fill="url(#${br})"/>
  <path d="M.85 0V-1.35A1.55 .85 0 0 1 3.95-1.35V0Z" fill="${g.lin([['#0b0605',0],['#1f120d',1]],'v')}"/>
  <rect y="-.9" width="${D}" height=".9" fill="${g.lin([['#1d3a1f',0,0],['#1d3a1f',1,.55]],'v')}"/>
  <text x=".55" y="-2.75" font-size="1.05" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="none" stroke="#ff4f8a" stroke-width=".07" transform="rotate(-5 .55 -2.75)" opacity=".8">DAMSKO</text>
  <path d="M.7-2.35h3.2" stroke="#ff4f8a" stroke-width=".05" opacity=".5"/>
  <rect x="4.55" y="${-H}" width=".16" height="${H-.25}" fill="#1a1c1f"/><path d="M4.55-.25h.16l.3.22h-.46z" fill="#1a1c1f"/><circle class="vh-drip" cx="4.86" cy="-.12" r=".045" fill="#7fb1d6"/>
  <rect y="${-H}" width="${D}" height="${H}" fill="${g.lin([['#000',0,.55],['#000',.55,0]],'v')}"/><rect y="${-H}" width="${D}" height="${H}" fill="${g.lin([['#000',0,0],['#000',.7,0],['#000',1,.4]],'h')}"/>`;
 L.walls.push(`<g transform="${g.wl(0,D)}">${dL}</g>`);
 // brugdek met rails, leuning, lantaarns en af en toe een tram
 const top=H+.5;
 L.walls.push(g.box(0,-1.9,H,W,1.9,.5,'#2c2b30',{noT:1})+`<g transform="${g.fl(top)}"><rect y="-1.9" width="${W}" height="1.9" fill="#1d1d21"/><path d="M0-1.5H${W}M0-1.28H${W}M0-.7H${W}M0-.48H${W}" stroke="#55575e" stroke-width=".04"/></g>`);
 const tc=g.id(),hp=vhHull([[0,-1.9,top],[W,-1.9,top],[W,0,top],[0,0,top],[0,-1.9,top+2.2],[W,-1.9,top+2.2],[W,0,top+2.2],[0,0,top+2.2]].map(p=>g.P(p[0],p[1],p[2])));
 g.def(`<clipPath id="${tc}"><polygon points="${hp.map(p=>p.join(',')).join(' ')}"/></clipPath>`);
 const tram=g.box(4,-1.6,top,3.4,.8,1.0,'#d2d7dd')+`<g transform="${g.wr(-.8)}"><rect x="4" y="${-(top+.32)}" width="3.4" height=".1" fill="#2b5fa8"/>${[0,1,2,3,4,5].map(i=>`<rect x="${vhR(4.18+i*.53)}" y="${-(top+.86)}" width=".36" height=".38" fill="#ffd98a" opacity=".85"/>`).join('')}</g>`+g.pl([[5.2,-1.2,top+1],[5.6,-1.2,top+1.35],[6.0,-1.2,top+1]],'#777',.8);
 L.walls.push(`<g clip-path="url(#${tc})"><g class="vh-tram" style="--sx:${vhR(-9*g.C)}px;--sy:${vhR(-9*g.Sn)}px;--ex:${vhR(7.5*g.C)}px;--ey:${vhR(7.5*g.Sn)}px">${tram}</g></g>`);
 let rail='';for(let x=.2;x<=W;x+=.8)rail+=g.pl([[x,-.08,top],[x,-.08,top+.62]],'#3b3c42',1);rail+=g.pl([[0,-.08,top+.62],[W,-.08,top+.62]],'#4a4b52',1.4);
 [1.6,7.8].forEach(x=>{rail+=g.pl([[x,-.12,top],[x,-.12,top+1.9]],'#2b2c31',1.6)+g.box(x-.12,-.24,top+1.9,.24,.24,.12,'#3a3b40')});
 L.walls.push(rail);
 // kade en water
 L.floor.push(g.box(0,0,-.7,W,D,.7,'#2a292e',{noT:1,edge:false})+`<g transform="${g.wr(D)}">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${i} 0V.7" stroke="#1d1c20" stroke-width=".04"/>`).join('')}<path d="M0 .35H${W}" stroke="#1d1c20" stroke-width=".04"/></g>`);
 L.floor.push(`<g transform="${g.fl(0)}"><rect width="${W}" height="${D}" fill="url(#${cb})"/><rect y="${D-.32}" width="${W}" height=".32" fill="#36353b"/>
   <ellipse cx="6.3" cy="2.45" rx="1.05" ry=".55" fill="#0b111d" opacity=".9"/><ellipse class="vh-flick" cx="5.95" cy="2.4" rx=".42" ry=".16" fill="#ff9a3c" opacity=".35"/>
   <rect width="${W}" height="${D}" fill="${g.lin([['#000',0,.45],['#000',.5,0]],'h')}"/></g>`);
 L.floor.push(g.box(0,D,-1.25,W,WD,.55,'#0a111d',{noT:1,edge:false})+`<g transform="${g.fl(-.7)}"><rect y="${D}" width="${W}" height="${WD}" fill="${g.lin([['#152038',0],['#080c16',1]],'v')}"/>
   ${Array.from({length:14},(_,i)=>`<path class="vh-ripple" style="animation-delay:${vhR(i*.37%3)}s" d="M${vhR(.3+(i*2.7)%9.2)} ${vhR(D+.25+(i*.61)%2)}h${vhR(.5+(i%4)*.25)}" stroke="#4a6a9a" stroke-width=".04" opacity=".5"/>`).join('')}
   <rect class="vh-flick" x="4.1" y="${D+.1}" width=".55" height="1.9" fill="${g.lin([['#ff9a3c',0,.35],['#ff9a3c',1,0]],'v')}"/><rect x="8.5" y="${D+.1}" width=".4" height="2" fill="${g.lin([['#ffc46b',0,.3],['#ffc46b',1,0]],'v')}"/></g>`);
 // spullen
 L.obj.push({k:3.6,s:g.box(.35,1.35,0,1.35,2.55,.2,'#5b5040')+`<g transform="${g.fl(.2)}"><ellipse cx="1.1" cy="3.2" rx=".35" ry=".22" fill="#4a4134"/><ellipse cx=".8" cy="2.2" rx=".2" ry=".3" fill="#4d4436"/></g>`
  +g.box(.45,1.42,.2,1.1,.5,.13,'#8a8170')+(F.slaapzak?'':g.box(.38,2.15,.2,1.3,1.7,.07,'#27324a')+g.pl([[.38,2.5,.27],[1.68,2.5,.27]],'#1c2436',.8))});
 L.obj.push({k:3.2,s:g.box(2.0,.4,0,.95,.75,.6,'#86663f')+g.box(2.08,.48,.6,.72,.56,.44,'#7a5b37')+g.poly([[2.08,.48,1.04],[2.8,.48,1.04],[2.95,.3,1.2],[2.2,.3,1.2]],'#9a7a4c')});
 L.obj.push({k:4.0,s:g.cyl(2.3,3.9,0,.06,.32,'#2f5a2a')+g.cyl(2.48,4.06,0,.06,.26,'#6a4422')+g.cyl(2.2,4.12,0,.055,.22,'#31403a')});
 L.obj.push({k:7.1,s:g.cyl(4.4,2.75,0,.42,1.15,'#5e3b27')+g.band(4.4,2.75,.35,.42,'rgba(0,0,0,.4)',1.6)+g.band(4.4,2.75,.8,.42,'rgba(0,0,0,.4)',1.6)
  +g.ell(4.4,2.75,1.15,.36,'#140a05')+g.at(4.4,2.75,1.12,`<g class="vh-flame">${VH_FLAME}</g><circle class="vh-spark" cx="-3" cy="-26" r="1" fill="#ffcf6b"/><circle class="vh-spark s2" cx="4" cy="-22" r=".8" fill="#ffb347"/>`,'','')});
 L.obj.push({k:9.3,s:g.cyl(1.6,4.7,0,.15,.42,'#202125')+g.cyl(6.2,4.7,0,.15,.42,'#202125')});
 L.obj.push({k:13.2,s:g.cyl(8.75,4.5,0,.07,3.3,'#1b1c20')+g.box(8.6,4.35,3.3,.3,.3,.25,'#2a2b30')+g.ell(8.75,4.5,3.28,.12,'#ffdc96')});
 L.front.push(g.glow(4.4,2.75,1.6,5.2,'#ff8a2a',.5,'vh-fire')+g.glow(8.75,4.5,3.1,3.2,'#ffc46b',.45)+g.glow(7.1,-.3,4.2,2.2,'#e9e2c8',.12));
 // regen boven het water
 const rc=g.id(),y0=D+1.1;g.def(`<clipPath id="${rc}"><polygon points="${[g.P(0,y0,H+1),g.P(W,y0,H+1),g.P(W,y0,-.7),g.P(0,y0,-.7)].map(p=>p.join(',')).join(' ')}"/></clipPath>`);
 const [rx0,ry0]=g.P(0,y0,H+1),[rx1,ry1]=g.P(W,y0,-.7);let rain='';for(let i=0;i<70;i++){const x=rx0+(i*37.1)%(rx1-rx0+40)-20,y=ry0-40+(i*53.3)%(ry1-ry0+60);rain+=`<path d="M${vhR(x)} ${vhR(y)}l-2 7" stroke="rgba(190,205,235,.22)" stroke-width=".8"/>`}
 L.front.push(`<g clip-path="url(#${rc})"><g class="vh-rain">${rain}</g><g class="vh-rain r2">${rain}</g></g>`);
 L.bed=[1.0,2.5,.5]};

// Kraakpand: leeg kantoor, beton, graffiti, kapotte lift, dichtgetimmerd raam
VH_SCENE.kraak=(g,L,F,GH)=>{const W=9,D=6.4,H=4.6,ct=g.id();
 g.def(`<pattern id="${ct}" width="1.8" height="1.8" patternUnits="userSpaceOnUse"><rect width=".9" height=".9" fill="#2a2c31"/><rect x=".9" width=".9" height=".9" fill="#2e3036"/><rect y=".9" width=".9" height=".9" fill="#2d2f35"/><rect x=".9" y=".9" width=".9" height=".9" fill="#282a2f"/><path d="M0 0H1.8M0 .9H1.8M0 0V1.8M.9 0V1.8" stroke="#1d1e22" stroke-width=".025"/></pattern>`);
 const r=vhRng('kraak');let stain='';for(let i=0;i<7;i++)stain+=`<ellipse cx="${vhR(r()*W)}" cy="${vhR(-H+r()*H)}" rx="${vhR(.4+r()*.9)}" ry="${vhR(.3+r()*.6)}" fill="${g.rad('#000',.35)}"/>`;
 for(let i=0;i<5;i++){const x=r()*W;stain+=`<rect x="${vhR(x)}" y="${-H}" width="${vhR(.08+r()*.15)}" height="${vhR(.8+r()*1.8)}" fill="${g.lin([['#000',0,.35],['#000',1,0]],'v')}"/>`}
 const view=`<rect x="3.5" y="-3.9" width="2.8" height="2.4" fill="${g.lin([['#05070f',0],['#1a2140',1]],'v')}"/><circle cx="5.7" cy="-3.4" r=".12" fill="#efe6c8"/>${vhCity(3.3,6.5,-1.5,.4,1.6,'west',{dens:.35})}`;
 const boards=[[-7,-3.35],[5,-2.55],[-3,-1.85]].map(([a,y])=>`<g transform="rotate(${a} 4.9 ${y})"><rect x="3.25" y="${y-.16}" width="3.3" height=".32" fill="#6b4c33"/><rect x="3.25" y="${y-.16}" width="3.3" height=".06" fill="#7d5a3d"/><circle cx="3.45" cy="${y}" r=".035" fill="#bbb"/><circle cx="6.35" cy="${y}" r=".035" fill="#bbb"/></g>`).join('');
 const dR=`${stain}<path d="M.6-2.6c.4-.9 1.1-1.1 1.4-.4s.2 1 .9.5M.9-2.15h2" stroke="#ff4f8a" stroke-width=".08" fill="none"/><text x=".7" y="-2.75" font-size=".7" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#ff4f8a" opacity=".85" transform="rotate(-8 .7 -2.75)">KRAAK</text>
  <text x="6.6" y="-3.3" font-size=".46" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#e8384e">KRAKEN</text><text x="6.6" y="-2.82" font-size=".46" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#e8384e">GAAT DOOR</text>
  ${[6.7,7.1,7.6,8.1,8.5].map((x,i)=>`<rect x="${x}" y="-2.75" width=".03" height="${vhR(.15+i%3*.14)}" fill="#e8384e" opacity=".8"/>`).join('')}
  <rect x="7.4" y="-1.95" width=".62" height=".75" fill="#55585e"/><rect x="7.4" y="-1.95" width=".62" height=".1" fill="#6b6e75"/><path d="M7.6-1.2V-.1M7.8-1.2c0 .5.4.6.4 1.2" stroke="#1a1b1e" stroke-width=".04" fill="none"/>`;
 const wR=vhWin(g,3.5,6.3,-3.9,-1.5,view,{frame:'#3a3d44',ft:.12,blind:'#2b2219'})+`<path d="M5.6-3.8l.25.5-.2.4.35.3M5.85-3.3l.4-.1" stroke="rgba(255,255,255,.35)" stroke-width=".02" fill="none"/>${boards}`;
 const lift=`<rect x="4.4" y="-2.85" width="1.8" height="2.85" fill="#4a4e55"/><rect x="4.5" y="-2.75" width=".78" height="2.75" fill="${g.lin([['#80858d',0],['#5a5e65',1]],'h')}"/><rect x="5.32" y="-2.75" width=".78" height="2.75" fill="${g.lin([['#80858d',0],['#5a5e65',1]],'h')}"/><rect x="5.28" y="-2.75" width=".04" height="2.75" fill="#101113"/>
  <rect x="4.6" y="-3.35" width="1.6" height=".38" fill="#e9e5dc"/><text x="5.4" y="-3.08" font-size=".2" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="800" fill="#c62a3a" text-anchor="middle">BUITEN GEBRUIK</text>
  <path d="M4.55-2.5L6.05-.4M6.05-2.5L4.55-.4" stroke="#e8384e" stroke-width=".09" stroke-dasharray=".16 .12" opacity=".85"/>`;
 const dL=`${stain.replace(/cx="([\d.]+)"/g,(m,v)=>`cx="${vhR(+v*.7)}"`)}${vhDoor(g,.5,1.6,2.7,'#4a3a2c',F,GH)}
  <text x="1.85" y="-1.75" font-size="1.3" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#3fe395" stroke="#0b2a1a" stroke-width=".07" transform="rotate(-3 1.85 -1.75)">WEST</text>
  <text x="1.85" y="-1.75" font-size="1.3" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="none" stroke="#c8ffe2" stroke-width=".025" transform="translate(-.04 -.05) rotate(-3 1.85 -1.75)" opacity=".5">WEST</text>${lift}`;
 vhRoom(g,L,W,D,H,{wall:'#34363c',cap:'#2b2c31',floor:`url(#${ct})`,dR,wR,dL,
  dF:`<rect x="2.7" y="3.6" width=".9" height=".9" fill="#1b1c20"/><rect x="6.3" y="2.7" width=".9" height=".9" fill="#1b1c20"/><rect x="1.8" y="5.4" width=".9" height=".9" fill="#1d1e22"/><ellipse cx="4.9" cy=".9" rx=".7" ry=".35" fill="#101318" opacity=".8"/><path d="M5.2 1.6c.8.3 1.5.1 2.2.6s1 1.2 1.6 1.3" stroke="#111" stroke-width=".04" fill="none"/>`});
 // matras langs de rechterwand
 L.obj.push({k:2.5,s:g.box(.65,.35,0,2.6,1.4,.22,'#7a6e57')+`<g transform="${g.fl(.22)}"><ellipse cx="2.4" cy="1.2" rx=".4" ry=".22" fill="#685d48"/></g>`+g.box(.72,.42,.22,.55,1.2,.13,'#a39a87')
  +(F.slaapzak?'':g.box(1.35,.38,.22,1.85,1.34,.1,'#6a3426')+g.pl([[1.6,.38,.32],[1.6,1.72,.32]],'#4f261c',.8))});
 L.obj.push({k:2.3,s:g.box(3.45,.35,0,.7,.7,.55,'#6e5034')+`<g transform="${g.wr(1.05)}"><path d="M3.45-.18H4.15M3.45-.37H4.15" stroke="#4a3522" stroke-width=".035"/></g>`});
 L.obj.push({k:7.9,s:[0,.19,.38].map(z=>g.box(6.6,.3,z,1.3,1.0,.15,'#8a6d47')+`<g transform="${g.fl(z+.15)}"><path d="M6.6 .55H7.9M6.6 .8H7.9M6.6 1.05H7.9" stroke="#5a4528" stroke-width=".05"/></g>`).join('')});
 L.obj.push({k:8.9,s:g.pl([[5.5,3.4,.05],[5.15,3.4,.02]],'#111',1.4)+g.pl([[5.5,3.4,.05],[5.85,3.4,.02]],'#111',1.4)+g.pl([[5.5,3.4,.05],[5.5,3.05,.02]],'#111',1.4)+g.pl([[5.5,3.4,.05],[5.5,3.75,.02]],'#111',1.4)
  +g.cyl(5.5,3.4,.05,.04,.38,'#2a2b30')+g.box(5.25,3.15,.42,.5,.5,.1,'#1e1f24')+g.box(5.25,3.6,.52,.5,.08,.62,'#1e1f24')});
 L.obj.push({k:6.3,s:g.box(4.05,1.95,0,.42,.32,.18,'#2a2c30')+g.cyl(4.26,2.11,.18,.16,.12,'#55585e')});
 // hanglamp en tl-buis
 L.front.push(g.pl([[2.0,1.5,H],[2.0,1.5,3.35]],'#111',.8)+g.at(2.0,1.5,3.3,'<circle r="3.2" fill="#fff1c9"/>')+g.glow(2.0,1.5,3.2,3.6,'#ffcf8a',.45)
  +g.pl([[6.0,3.0,H],[6.0,3.0,3.9]],'#111',.7)+g.pl([[7.5,3.0,H],[7.5,3.0,3.9]],'#111',.7)+g.box(5.9,2.94,3.82,1.7,.12,.08,'#e8f4ff')+g.glow(6.75,3,3.6,3.2,'#cfe8ff',.3,'vh-tl'));
 L.bed=[1.95,1.0,.55]};

// Huurkamer: behang, kleine douche, bed, bureau onder het raam, uitzicht op De Pijp
VH_SCENE.kamer=(g,L,F,GH)=>{const W=7,D=5.6,H=4.4,wp=g.id(),pk=g.id(),tl=g.id();
 g.def(`<pattern id="${wp}" width=".6" height="1" patternUnits="userSpaceOnUse"><rect width=".6" height="1" fill="#3a2731"/><rect x=".3" width=".3" height="1" fill="#41303a"/><circle cx=".15" cy=".5" r=".035" fill="#5a4450"/></pattern>
  <pattern id="${pk}" width="2.4" height=".9" patternUnits="userSpaceOnUse"><rect width="2.4" height=".45" fill="#4a3426"/><rect y=".45" width="2.4" height=".45" fill="#513a2a"/><path d="M0 .005H2.4M0 .455H2.4M1.3 0V.45M.5 .45V.9M1.9 .45V.9" stroke="#2c1f17" stroke-width=".02"/></pattern>
  <pattern id="${tl}" width=".25" height=".25" patternUnits="userSpaceOnUse"><rect width=".25" height=".25" fill="#7b8f97"/><path d="M0 0H.25M0 0V.25" stroke="#5c6e76" stroke-width=".02"/></pattern>`);
 const view=`<rect x="3.35" y="-3.5" width="1.8" height="2.05" fill="${g.lin([['#070914',0],['#22203a',1]],'v')}"/>
  <rect x="3.2" y="-3.2" width=".9" height="1.8" fill="#2c1a17"/><rect x="4.15" y="-3.45" width="1.2" height="2.1" fill="#33201b"/>
  ${[[3.32,-3.0],[3.62,-3.0],[3.32,-2.55],[3.92,-2.55],[3.62,-2.1],[4.3,-3.2],[4.62,-3.2],[4.95,-2.75],[4.3,-2.3],[4.95,-2.3]].map(([x,y],i)=>`<rect x="${x}" y="${y}" width=".18" height=".26" fill="#ffcf7a" opacity="${i%3?'.75':'.4'}"/>`).join('')}
  <text class="vh-neon" x="4.25" y="-1.68" font-size=".28" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" fill="#ff5fa0" text-anchor="middle">SHOARMA</text><rect class="vh-neon" x="3.75" y="-1.6" width="1" height=".035" fill="#3fe395"/>
  ${[0,1,2,3,4,5,6].map(i=>`<path d="M${vhR(3.45+i*.26)} ${vhR(-3.4+(i%3)*.5)}l-.06 .3" stroke="rgba(220,230,255,.25)" stroke-width=".015"/>`).join('')}`;
 const curt=(a)=>`<rect x="${a}" y="-3.78" width=".42" height="2.6" fill="${g.lin([['#4a1722',0],['#6a2232',.35],['#4a1722',.6],['#5e1e2c',1]],'h')}"/>`;
 const dR=`<rect x="0" y="-2.9" width="1.25" height="2.9" fill="url(#${tl})"/><rect y="-.2" width="${W}" height=".2" fill="#1e1519"/>
  <path d="M.62-2.9V-2.55" stroke="#9aa3ad" stroke-width=".05"/><ellipse cx=".62" cy="-2.5" rx=".14" ry=".05" fill="#c0c6cc"/>
  ${vhDoor(g,5.85,6.75,2.55,'#5a3f2c',F,GH)}<path d="M6.05-2.05h.08v.15" stroke="#888" stroke-width=".03" fill="none"/><path d="M6.0-1.95h.26l.05.9h-.36z" fill="#2c3e5a"/>`;
 const wR=vhWin(g,3.35,5.15,-3.5,-1.45,view,{frame:'#bdb4a6',ft:.1,cols:[.5],sill:'#cfc6b8',blind:'#5a1f2a'})+`<path d="M2.9-3.85H5.6" stroke="#2a2a2a" stroke-width=".05"/>`+curt(2.95)+curt(5.13);
 const dL=`<rect x="${D-1.25}" y="-2.9" width="1.25" height="2.9" fill="url(#${tl})"/><rect y="-.2" width="${D}" height=".2" fill="#1e1519"/>
  <rect x="1.55" y="-3.25" width="1.1" height="1.35" fill="#16130f"/><rect x="1.62" y="-3.18" width=".96" height="1.21" fill="#d9c9a6"/><circle cx="2.1" cy="-2.65" r=".28" fill="#e2683a"/><path d="M1.7-2.1h.8M1.7-2.25h.55" stroke="#2a2a2a" stroke-width=".05"/>
  <rect x="2.95" y="-2.62" width="1.0" height=".06" fill="#3a2a22"/>${[0,1,2,3,4,5].map(i=>`<rect x="${vhR(3.0+i*.13)}" y="${vhR(-2.62-(.22+(i%3)*.05))}" width=".1" height="${vhR(.22+(i%3)*.05)}" fill="${['#7a3a2a','#2f5a7a','#c9a227','#3a6a4a','#8a8a8a','#5a3a6a'][i]}"/>`).join('')}`;
 vhRoom(g,L,W,D,H,{wall:`url(#${wp})`,cap:'#2a1f25',floor:`url(#${pk})`,dR,wR,dL,
  dF:`<rect x="2.3" y="2.6" width="2.6" height="2.1" fill="#5a2e35"/><rect x="2.42" y="2.72" width="2.36" height="1.86" fill="none" stroke="#a0704a" stroke-width=".05"/><path d="M2.7 3.65h1.8M3.6 3.0v1.3" stroke="#7a4a3a" stroke-width=".04"/>`});
 // douche in de hoek
 L.obj.push({k:1.0,s:g.box(0,0,0,1.25,1.25,.1,'#c8c8c4')+g.poly([[0,1.25,.1],[1.25,1.25,.1],[1.25,1.25,2.9],[0,1.25,2.9]],'rgba(160,205,235,.13)')+g.poly([[1.25,0,.1],[1.25,1.25,.1],[1.25,1.25,2.9],[1.25,0,2.9]],'rgba(160,205,235,.1)')
  +g.pl([[0,1.25,2.9],[1.25,1.25,2.9],[1.25,0,2.9]],'#c9ced4',1)+g.pl([[1.25,1.25,.1],[1.25,1.25,2.9]],'#c9ced4',1)+g.pl([[.3,1.25,2.4],[1.0,1.25,.6]],'rgba(255,255,255,.18)',2)
  +g.poly([[1.25,.25,2.9],[1.25,.75,2.9],[1.25,.75,2.2],[1.25,.25,2.3]],'#c97a5a')});
 L.obj.push({k:2.3,s:g.box(1.45,.12,0,.75,.66,.95,'#bdb7aa')+g.pl([[1.45,.78,.62],[2.2,.78,.62]],'#8a857a',.8)+g.pl([[2.05,.78,.3],[2.05,.78,.55]],'#555',1.2)
  +(F.espresso?'':g.box(1.55,.2,.95,.55,.45,.05,'#1d1e22')+g.ell(1.7,.32,1.0,.09,'#3a3b40')+g.ell(1.92,.5,1.0,.09,'#3a3b40'))});
 L.obj.push({k:4.4,s:g.box(3.5,.03,.3,1.55,.1,.75,'#a9a397',{edge:false})+`<g transform="${g.wr(.13)}">${[0,1,2,3,4,5,6,7,8,9].map(i=>`<path d="M${vhR(3.6+i*.15)}-.35V-1" stroke="#7e786e" stroke-width=".03"/>`).join('')}</g>`});
 // bureau met laptop en stoel
 let desk='';[[3.45,.22],[5.05,.22],[3.45,.86],[5.05,.86]].forEach(([x,y])=>desk+=g.box(x,y,0,.06,.06,.74,'#3e2e22'));
 desk+=g.box(3.4,.18,.74,1.75,.75,.06,'#5b4330')+g.box(4.0,.35,.8,.55,.38,.025,'#2a2c31')+g.poly([[4.0,.36,.82],[4.55,.36,.82],[4.55,.27,1.2],[4.0,.27,1.2]],'#1b2433')+g.poly([[4.04,.355,.85],[4.51,.355,.85],[4.51,.28,1.17],[4.04,.28,1.17]],'#7fa8e0');
 L.obj.push({k:4.9,s:desk+g.glow(4.28,.4,1.0,1.6,'#8fb8ff',.35)});
 L.obj.push({k:5.7,s:g.box(4.0,1.1,0,.06,.06,.44,'#222')+g.box(4.48,1.1,0,.06,.06,.44,'#222')+g.box(4.0,1.58,0,.06,.06,.44,'#222')+g.box(4.48,1.58,0,.06,.06,.44,'#222')
  +g.box(3.98,1.08,.44,.58,.58,.07,'#2d2f35')+g.box(3.98,1.62,.51,.58,.06,.55,'#2d2f35')});
 // bed langs de linkerwand en nachtkastje
 L.obj.push({k:3.6,s:`<g class="vh-base" data-it="bed">${vhBed(g,.12,1.9,1.6,2.7,{frame:'#3a2a22',head:1.05,cover:'#2f5a7a',throw:'#c9a227'},F.bed)}</g>`});
 L.obj.push({k:4.1,s:g.box(1.85,1.95,0,.5,.45,.52,'#3a2a22')+g.cyl(2.1,2.17,.52,.07,.25,'#8a7a5a')+g.cyl(2.1,2.17,.77,.17,.2,'#e8d6a8')});
 L.front.push(g.glow(2.1,2.17,.9,2.4,'#ffcf8a',.42)+g.glow(4.25,0,2.5,2.4,'#ff5fa0',.12,'vh-neon'));
 L.bed=[.9,3.2,.7]};

// Grachtenappartement: hoge ramen, boekenkast, open haard, Chesterfield, parket
VH_SCENE.gracht=(g,L,F,GH)=>{const W=10,D=7.6,H=5.6,pq=g.id();
 g.def(`<pattern id="${pq}" width="1.2" height="1.2" patternUnits="userSpaceOnUse"><rect width="1.2" height="1.2" fill="#55381f"/><rect width=".6" height=".6" fill="#5c3d22"/><rect x=".6" y=".6" width=".6" height=".6" fill="#5c3d22"/>
  <path d="M0 .2H.6M0 .4H.6M.8 0V.6M1.0 0V.6M.2 .6V1.2M.4 .6V1.2M.6 .8H1.2M.6 1.0H1.2" stroke="#3e2817" stroke-width=".02"/><path d="M0 0H1.2V1.2M.6 0V1.2M0 .6H1.2" stroke="#33200f" stroke-width=".025" fill="none"/></pattern>`);
 const wains=(len)=>`<rect y="-1.3" width="${len}" height="1.3" fill="#172b25"/>${Array.from({length:Math.floor(len/1.1)},(_,i)=>`<rect x="${vhR(.2+i*1.1)}" y="-1.12" width=".8" height=".9" fill="none" stroke="#264137" stroke-width=".04"/>`).join('')}<rect y="-1.34" width="${len}" height=".08" fill="#2c463c"/>
  <rect y="${-H}" width="${len}" height=".34" fill="#a39d8e"/><rect y="${-H+.34}" width="${len}" height=".05" fill="#6c675d"/>`;
 const view=a=>`<rect x="${a}" y="-5" width="1.6" height="3.9" fill="${g.lin([['#0b1024',0],['#2a2346',1]],'v')}"/>${vhGables(a-.2,a+1.8,-2.05,'gev'+a)}
  <rect x="${a}" y="-2.05" width="1.6" height=".95" fill="${g.lin([['#152038',0],['#080c16',1]],'v')}"/>
  ${[0,1,2,3].map(i=>`<rect class="vh-shim" style="animation-delay:${i*.6}s" x="${vhR(a+.15+i*.38)}" y="${vhR(-1.95+(i%2)*.3)}" width=".2" height=".03" fill="#ffc36b" opacity=".6"/>`).join('')}
  <circle cx="${a+.3}" cy="-2.2" r=".18" fill="#0b1a10"/><circle cx="${a+1.4}" cy="-2.25" r=".22" fill="#0b1a10"/>`;
 const curt=a=>`<rect x="${a}" y="-5.25" width=".34" height="4.15" fill="${g.lin([['#3a0f18',0],['#5a1824',.4],['#3a0f18',.7],['#4a1420',1]],'h')}"/>`;
 const win=a=>vhWin(g,a,a+1.6,-5.0,-1.12,view(a),{frame:'#cfc8b8',ft:.09,cols:[.5],rows:[.25,.5,.75],sill:'#bdb6a6',blind:'#3a1018'})+curt(a-.36)+curt(a+1.62);
 const dR=wains(W)+`<rect x="4.35" y="-4.65" width="1.3" height="1.05" fill="#9c7a2e"/><rect x="4.43" y="-4.57" width="1.14" height=".89" fill="${g.lin([['#2a3442',0],['#4a3a2a',1]],'v')}"/><path d="M4.43-3.95c.3-.2.6-.1.9-.25s.3 0 .24.1" stroke="#1a2a22" stroke-width=".06" fill="none"/>`;
 const wR=win(1.4)+win(6.9)+`<path d="M.95-5.32H3.5M6.45-5.32H9" stroke="#8c7a3a" stroke-width=".05"/>`;
 const dL=wains(D)+vhDoor(g,.3,1.4,3.3,'#3a2416',F,GH)+`<rect x="1.65" y="-3.55" width="1.3" height="1.8" fill="#9c7a2e"/><rect x="1.73" y="-3.47" width="1.14" height="1.64" fill="${g.lin([['#5a6a78',0],['#2a323c',.6],['#3c4652',1]],'v')}"/><path d="M1.85-3.3l.5.6M2.0-3.4l.7.8" stroke="rgba(255,255,255,.18)" stroke-width=".04"/>`;
 vhRoom(g,L,W,D,H,{wall:'#1f3a33',cap:'#2a2622',floor:`url(#${pq})`,dR,wR,dL,
  dF:`<rect x=".9" y="3.9" width="3.7" height="3.4" fill="#5a1f22"/><rect x="1.05" y="4.05" width="3.4" height="3.1" fill="none" stroke="#2b1a3a" stroke-width=".18"/><rect x="1.3" y="4.3" width="2.9" height="2.6" fill="none" stroke="#b08a3e" stroke-width=".04" opacity=".55"/><path d="M2.75 4.6v2M1.6 5.6h2.3" stroke="#b08a3e" stroke-width=".04" opacity=".45"/>`});
 // boekenkast (met geheime wapenkast als item)
 const BC=['#7a3a2a','#2f5a7a','#c9a227','#3a6a4a','#8a8a8a','#5a3a6a','#a35a2a','#2a4a5a','#6a2a2a'];const rb=vhRng('boeken');let books='';
 [-.12,-.97,-1.82,-2.67,-3.52].forEach((v,row)=>{let s=.1;while(s<2.15){const w=.07+rb()*.09,h=.5+rb()*.25;if(!(row===1||row===2)||s<.7||s>1.55||!(F.wapenkast||GH))books+=`<rect x="${vhR(s)}" y="${vhR(v-h)}" width="${vhR(w)}" height="${vhR(h)}" fill="${BC[Math.floor(rb()*BC.length)]}"/>`;s+=w+.012}
  books+=`<rect x="0" y="${vhR(v)}" width="2.25" height=".07" fill="#1c1209"/>`});
 const wk=F.wapenkast?'vh-it':GH?'vh-it vh-ghost':'';
 const secret=wk?`<g class="${wk}" data-it="wapenkast"><rect x=".72" y="-2.6" width=".82" height="1.6" fill="#0e0b08"/>${[.85,1.05,1.25,1.42].map((x,i)=>`<path d="M${x}-1.05V-2.45" stroke="#4a4d52" stroke-width=".06"/><path d="M${x}-1.6h.08v-.3" stroke="#3a2416" stroke-width=".07" fill="none"/>`).join('')}<rect x=".72" y="-2.6" width=".82" height=".05" fill="#ffcf8a" opacity=".6"/></g>`:'';
 L.obj.push({k:2.7,s:g.box(0,1.35,0,.55,2.25,4.3,'#2a1a10')+`<g transform="${g.wl(.55,3.6)}"><rect y="-4.3" width="2.25" height="4.3" fill="#1d120a"/>${books}${secret}</g>`+(wk?`<g class="${wk}" data-it="wapenkast">${g.poly([[.55,2.05,1.0],[1.25,2.45,1.0],[1.25,2.45,2.6],[.55,2.05,2.6]],'#2a1a10')}</g>`:'')});
 // open haard met spiegel
 const fire=g.at(.42,5.3,.12,`<g class="vh-flame" transform="scale(.55)">${VH_FLAME}</g><g class="vh-flame f2" transform="translate(-6 2) scale(.4)">${VH_FLAME}</g>`);
 L.obj.push({k:5.5,s:g.box(0,4.5,0,.38,1.6,1.3,'#b7b1a5')+`<g transform="${g.wl(.38,6.1)}"><rect x=".4" y="-.88" width=".8" height=".88" fill="#120a06"/><rect x=".4" y="-.88" width=".8" height=".1" fill="#3a2a1a"/></g>`+fire+g.box(0,4.42,1.3,.5,1.76,.1,'#cfc9bd')});
 L.obj.push({k:2.2,s:g.box(1.3,.12,0,1.8,.58,.85,'#3a2416')+`<g transform="${g.wr(.7)}"><path d="M1.3-.45H3.1M2.2-.85V-.05" stroke="#24150b" stroke-width=".03"/><circle cx="2.05" cy="-.6" r=".03" fill="#c9a227"/><circle cx="2.35" cy="-.6" r=".03" fill="#c9a227"/></g>`});
 L.obj.push({k:5.4,s:`<g class="vh-base" data-it="bed">${vhBed(g,3.7,.15,2.6,3.05,{frame:'#2a1a10',head:1.9,hc:'#2a1a10',cover:'#7a2f3a',pil:'#efe7d6',throw:'#c9a227',h:.42},F.bed)}</g>`
  +`<g transform="${g.wr(.03)}"><rect x="3.75" y="-1.85" width="2.5" height="1.0" fill="#5a2030"/>${[0,1,2,3,4].map(i=>[0,1].map(j=>`<circle cx="${vhR(4.0+i*.5)}" cy="${vhR(-1.6+j*.45)}" r=".035" fill="#3a1220"/>`).join('')).join('')}</g>`});
 [[3.05,.15],[6.45,.15]].forEach(([x,y])=>L.obj.push({k:x+y+.5,s:g.box(x,y,0,.55,.5,.6,'#2a1a10')+g.cyl(x+.27,y+.25,.6,.06,.3,'#9c7a2e')+g.cyl(x+.27,y+.25,.9,.2,.22,'#e8d6a8')}));
 L.obj.push({k:8.4,s:g.box(2.6,4.17,0,.95,.2,.68,'#4f2419')+g.box(2.6,4.35,0,.95,2.0,.42,'#5a2a1e')+g.box(3.25,4.35,.42,.32,2.0,.45,'#4f2419')+g.box(2.6,6.35,0,.95,.2,.68,'#4f2419')
  +`<g transform="${g.wl(3.25,6.35)}">${[0,1,2,3,4,5].map(i=>`<circle cx="${vhR(.2+i*.32)}" cy="-.7" r=".03" fill="#2a120b"/>`).join('')}</g>`});
 L.front.push(g.pl([[5.1,4.6,H],[5.1,4.6,4.2]],'#8c7a3a',.8)+g.at(5.1,4.6,4.1,`<ellipse rx="14" ry="5" fill="none" stroke="#b08a3e" stroke-width="1.4"/>${[-12,-6,0,6,12].map(x=>`<circle cx="${x}" cy="${-2-Math.abs(x)*.05}" r="1.8" fill="#fff1c9"/>`).join('')}`)
  +g.glow(5.1,4.6,3.9,4.6,'#ffcf8a',.4)+g.glow(.4,5.3,.6,3.0,'#ff8a2a',.45,'vh-fire')+g.glow(3.3,.4,1.2,2,'#ffcf8a',.35)+g.glow(6.7,.4,1.2,2,'#ffcf8a',.35));
 L.bed=[5.0,1.8,.95]};

// Penthouse: glazen wanden, skyline van de Zuidas, eigen lift, keukeneiland
VH_SCENE.penthouse=(g,L,F,GH)=>{const W=12,D=8.4,H=5.2,CORE=3.4;
 const sky=g.lin([['#03050c',0],['#0d1430',.55],['#2b2142',1]],'v');
 const towers=(a0,a1,seed)=>{const r=vhRng(seed);let x=a0,s='';while(x<a1){const w=.5+r()*.8,h=1.6+r()*3.2,c=r()<.5?'#0b1222':'#101830';
   s+=`<rect x="${vhR(x)}" y="${vhR(-.6-h)}" width="${vhR(w)}" height="${vhR(h)}" fill="${c}"/>`;
   for(let wy=-.6-h+.12;wy<-.7;wy+=.16)if(r()<.8){const cc=r()<.3?'#9fd2ff':'#ffd58a';s+=`<rect x="${vhR(x+.05)}" y="${vhR(wy)}" width="${vhR(w-.1)}" height=".05" fill="${cc}" opacity="${vhR(.12+r()*.35)}"/>`}
   if(h>3.6)s+=`<circle class="vh-blink" style="animation-delay:${vhR(r()*2)}s" cx="${vhR(x+w/2)}" cy="${vhR(-.6-h-.06)}" r=".05" fill="#ff3d52"/>`;x+=w+.15+r()*.5}return s};
 const road=(a0,a1)=>`<rect x="${a0}" y="-.62" width="${a1-a0}" height=".1" fill="#0a0c12"/><path class="vh-cars" d="M${a0}-.6H${a1}" stroke="#fff3d0" stroke-width=".035" stroke-dasharray=".12 .5"/><path class="vh-cars r" d="M${a0}-.55H${a1}" stroke="#ff4a4a" stroke-width=".035" stroke-dasharray=".1 .6"/>`;
 const mull=(a0,a1)=>{let s='';for(let a=a0;a<=a1+.01;a+=1.5)s+=`<rect x="${vhR(a-.04)}" y="${-H}" width=".08" height="${H}" fill="#07080a"/>`;return s};
 const refl=(a0,a1)=>`<path d="M${a0+1} ${-H}l1.6 ${H}h.5l-1.6 ${-H}z" fill="#fff" opacity=".035"/><path d="M${a1-3} ${-H}l1.2 ${H}h.25l-1.2 ${-H}z" fill="#fff" opacity=".03"/>`;
 // rechterwand: glas
 L.walls.push(g.box(0,-.25,0,W,.25,.12,'#0b0c0f',{noL:1})+g.box(0,-.25,H-.15,W,.25,.15,'#0b0c0f',{noL:1})+g.box(-.3,-.3,0,.3,.3,H,'#0e0f12',{noL:1,noR:1,edge:false}));
 const vR=`<rect y="${-H}" width="${W}" height="${H}" fill="${sky}"/>${towers(-.2,W,'zuidas')}<rect y="-.6" width="${W}" height=".6" fill="#06070b"/>${road(0,W)}`;
 L.walls.push(`<g transform="${g.wr(0)}">${vhWin(g,0,W,-H,0,vR,{frame:'#07080a',ft:.06,blind:'#101218'})}${mull(0,W)}${refl(0,W)}</g>`);
 // linkerwand: glas aan de achterkant, liftschacht vooraan
 L.walls.push(g.box(-.3,0,0,.3,D,H,'#0e0f12',{noR:1}));
 const vL=`<rect y="${-H}" width="${D}" height="${H}" fill="${sky}"/>${towers(CORE,D+.2,'oost')}<circle cx="6.6" cy="-4.1" r=".55" fill="${g.rad('#f3ead0',.4)}"/><circle cx="6.6" cy="-4.1" r=".17" fill="#efe6c8"/><rect y="-.6" width="${D}" height=".6" fill="#06070b"/>${road(CORE,D)}`;
 const lift=`<rect width="${CORE}" y="${-H}" height="${H}" fill="${g.lin([['#1b1c21',0],['#24252b',1]],'h')}"/><path d="M.4-5.2c.3 1 .1 2 .6 3.1s.2 1.6.5 2.1M2.4-5.2c-.2.9.3 1.9.1 2.8" stroke="#2e3038" stroke-width=".03" fill="none"/>
  <rect x=".8" y="-2.95" width="1.8" height="2.95" fill="#2a2416"/><rect x=".9" y="-2.85" width=".78" height="2.85" fill="${g.lin([['#b8932a',0],['#e2c46a',.45],['#9c7a22',1]],'h')}"/><rect x="1.72" y="-2.85" width=".78" height="2.85" fill="${g.lin([['#b8932a',0],['#e2c46a',.45],['#9c7a22',1]],'h')}"/><rect x="1.68" y="-2.85" width=".04" height="2.85" fill="#3a2f12"/>
  <rect x="1.45" y="-3.3" width=".5" height=".2" fill="#0a0a0c"/><path d="M1.62-3.15l.08-.08.08.08" stroke="#ffad3a" stroke-width=".03" fill="none"/>`;
 const lk=F.sloten?'vh-it':GH?'vh-it vh-ghost':'';
 const keys=lk?`<g class="${lk}" data-it="sloten"><rect x="2.66" y="-1.75" width=".22" height=".34" fill="#1a1b1f"/><rect x="2.69" y="-1.72" width=".16" height=".08" fill="#3fe395" opacity=".8"/>${[0,1,2].map(i=>`<rect x="${vhR(2.69+i*.055)}" y="-1.58" width=".04" height=".04" fill="#8d949c"/><rect x="${vhR(2.69+i*.055)}" y="-1.51" width=".04" height=".04" fill="#8d949c"/>`).join('')}<rect x=".85" y="-1.5" width="1.7" height=".07" fill="#6d747c"/></g>`:'';
 L.walls.push(`<g transform="${g.wl(0,D)}">${vhWin(g,CORE,D,-H,0,vL,{frame:'#07080a',ft:.06,blind:'#101218'})}${mull(CORE+1.25,D)}${refl(CORE,D)}${lift}${keys}<rect width="${CORE}" y="${-H}" height="${H}" fill="${g.lin([['#000',0,.4],['#000',.55,0]],'v')}"/></g>`);
 // gepolijste vloer
 L.floor.push(g.box(0,0,-.4,W,D,.4,'#0c0d10',{noT:1,edge:false})+`<g transform="${g.fl(0)}"><rect width="${W}" height="${D}" fill="${g.lin([['#1f222a',0],['#14161b',1]],'h')}"/>
   ${[2,4,6,8,10].map(x=>`<path d="M${x} 0V${D}" stroke="#262931" stroke-width=".025"/>`).join('')}${[2,4,6,8].map(y=>`<path d="M0 ${y}H${W}" stroke="#262931" stroke-width=".025"/>`).join('')}
   <rect y="0" width="${W}" height="2.4" fill="${g.lin([['#5a6a9a',0,.16],['#5a6a9a',1,0]],'v')}"/><rect width="1.6" height="${D}" fill="${g.lin([['#5a6a9a',0,.12],['#5a6a9a',1,0]],'h')}"/>
   <rect x="4.8" y="3.4" width="4.4" height="3.9" fill="#23262e"/><rect x="5.0" y="3.6" width="4.0" height="3.5" fill="none" stroke="#3a3e48" stroke-width=".04"/></g>`);
 // bed
 L.obj.push({k:3.6,s:`<g class="vh-base" data-it="bed">${vhBed(g,.8,.75,2.8,2.65,{frame:'#121216',head:1.25,hc:'#d6cfc2',cover:'#e9e4d8',mat:'#f0ebe0',pil:'#f6f2e9',throw:'#c9a227',h:.3},F.bed)}${F.bed?'':g.box(.82,2.75,.56,2.76,.42,.04,'#c9a227')}</g>`});
 L.obj.push({k:4.8,s:g.box(3.75,.8,0,.5,.45,.45,'#121216')+g.at(4.0,1.02,.45,'<circle cy="-4" r="4" fill="#fff4dc"/>')});
 // lounge
 L.obj.push({k:10.0,s:g.box(4.8,6.0,0,.2,.95,.6,'#cfc8ba')+g.box(5.0,6.0,0,3.6,.95,.38,'#d9d3c6')+g.box(5.0,6.62,.38,3.6,.33,.45,'#cfc8ba')+g.box(8.6,6.0,0,.2,.95,.6,'#cfc8ba')
  +g.box(5.3,6.25,.38,.5,.3,.3,'#c9a227')+g.box(7.9,6.25,.38,.5,.3,.3,'#16161a')});
 L.obj.push({k:10.2,s:g.box(6.3,4.6,0,1.1,.5,.28,'#0f1013')+g.box(5.85,4.35,.28,2.0,1.0,.07,'#d4cfc5')+`<g transform="${g.fl(.35)}"><path d="M6.1 4.5c.4.3.9.2 1.3.6s.5.3.7.2" stroke="#a8a296" stroke-width=".02" fill="none"/></g>`});
 // keukeneiland met hanglampen en krukken
 L.obj.push({k:11.2,s:g.box(8.9,.9,0,2.7,1.1,.9,'#101114')+g.box(8.85,.85,.9,2.8,1.2,.07,'#e3dfd6')+`<g transform="${g.fl(.97)}"><path d="M9.0 1.0c.5.4 1.1.2 1.6.7s1 .4 1.5.2" stroke="#b8b2a6" stroke-width=".02" fill="none"/></g>`});
 [9.4,10.25,11.1].forEach(x=>L.obj.push({k:x+2.4,s:g.cyl(x,2.4,0,.05,.68,'#1a1a1d')+g.ell(x,2.4,.7,.22,'#24252a')+g.ell(x,2.4,.74,.2,'#2e2f35')}));
 L.front.push([9.5,10.25,11.0].map(x=>g.pl([[x,1.45,H],[x,1.45,2.5]],'#2a2a2a',.6)+g.at(x,1.45,2.45,'<circle cy="-2" r="3.4" fill="#fff1c9"/>')+g.glow(x,1.45,2.2,1.8,'#ffcf8a',.35)).join('')
  +g.glow(4.0,1.0,.8,2,'#ffe2b0',.35));
 L.obj.push({k:11.2,s:g.box(3.3,7.4,0,.5,.5,.8,'#18191d')+g.at(3.55,7.65,.8,'<circle cy="-9" r="7" fill="none" stroke="#c9a227" stroke-width="2.4"/><circle cy="-9" r="3" fill="#c9a227"/>')});
 L.bed=[2.2,1.9,.75]};

// Villa: gevel met schuiframen, haag met hek, terras, zwembad en palmen
VH_SCENE.villa=(g,L,F,GH)=>{const W=14,D=10.4,H=5.8,HH=3.4,tt=g.id(),lv=g.id();
 g.def(`<pattern id="${tt}" width="1" height="1" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="#5c574e"/><path d="M0 0H1M0 0V1" stroke="#47433c" stroke-width=".025"/></pattern>
  <pattern id="${lv}" width=".5" height=".44" patternUnits="userSpaceOnUse"><rect width=".5" height=".44" fill="#0f2a1a"/><ellipse cx=".12" cy=".1" rx=".14" ry=".09" fill="#163a22"/><ellipse cx=".38" cy=".3" rx=".14" ry=".09" fill="#12321e"/><ellipse cx=".3" cy=".06" rx=".08" ry=".05" fill="#1e4a2a"/></pattern>`);
 // gevel (linkerwand)
 L.walls.push(g.box(-.32,0,0,.32,D,H,'#3a3732',{noR:1})+g.box(-.32,-.7,0,.32,.7,H,'#3a3732',{noL:1,noR:1,edge:false}));
 const inside=(s0,s1,o)=>{const w=s1-s0;return `<rect x="${s0}" y="-3.0" width="${w}" height="3.0" fill="${g.lin([['#ffd9a0',0],['#c9844a',1]],'v')}"/>
  <rect x="${vhR(s0+w*.1)}" y="-1.0" width="${vhR(w*.55)}" height=".55" fill="#6a3f22" opacity=".85"/><rect x="${vhR(s0+w*.1)}" y="-1.25" width="${vhR(w*.55)}" height=".28" fill="#7a4a2a" opacity=".85"/>
  <path d="M${vhR(s0+w*.8)}-.1V-2.1" stroke="#4a2a14" stroke-width=".04"/><path d="M${vhR(s0+w*.8-.18)}-2.1h.36l-.1-.28h-.16z" fill="#fff1d0"/>${o||''}`};
 const door=(s0,s1,o)=>vhWin(g,s0,s1,-3.0,0,inside(s0,s1,o),{frame:'#1c1c1e',ft:.1,cols:[.5],blind:'#2a2620'})+`<path d="M${s0+.2}-2.9l.7 2.8M${s0+.5}-2.9l.5 2.1" stroke="#fff" stroke-width=".05" opacity=".12"/>`;
 const fac=`<rect y="${-H}" width="${D}" height="${H}" fill="${g.lin([['#6f6a60',0],['#8d8679',.6],['#7c7669',1]],'v')}"/><rect y="-.4" width="${D}" height=".4" fill="#5c574e"/>
  ${door(7.4,9.4)}${door(2.8,4.8)}
  ${[6.3,1.6,9.9].map(s=>`<rect x="${s-.08}" y="-2.55" width=".16" height=".26" fill="#2a2826"/>`).join('')}`;
 L.walls.push(`<g transform="${g.wl(0,D)}">${fac}<rect y="${-H}" width="${D}" height="${H}" fill="${g.lin([['#000',0,0],['#000',.75,0],['#000',1,.3]],'h')}"/></g>`+g.box(-.32,0,H,.62,D,.28,'#2b2826'));
 L.front.push([6.3,1.6,9.9].map(s=>g.glow(.05,D-s,2.6,1.6,'#ffd59a',.4)).join(''));
 // haag met hek (rechterwand)
 L.walls.push(g.box(0,-.7,0,10.0,.7,HH,'#0f2a1a',{noL:1})+g.box(12.8,-.7,0,1.2,.7,HH,'#0f2a1a',{noL:1}));
 const gate=`<rect x="10.3" y="-3.3" width="2.2" height="3.3" fill="#05070a"/>${Array.from({length:16},(_,i)=>`<path d="M${vhR(10.36+i*.135)} 0V-3.05" stroke="#1d1d20" stroke-width=".035"/><path d="M${vhR(10.36+i*.135)}-3.05l-.03.1h.06z" fill="#c9a227"/>`).join('')}<path d="M10.3-.4H12.5M10.3-2.6H12.5" stroke="#1d1d20" stroke-width=".06"/>`;
 const lk=F.sloten?'vh-it':GH?'vh-it vh-ghost':'';
 const chain=lk?`<g class="${lk}" data-it="sloten"><path d="M11.1-1.5q.3.4.6 0q.3-.4.6 0" stroke="#b9c0c8" stroke-width=".05" fill="none" stroke-dasharray=".07 .04"/><rect x="11.3" y="-1.45" width=".18" height=".22" rx=".04" fill="#c9a227"/><rect x="12.2" y="-1.9" width=".2" height=".32" fill="#1a1b1f"/><rect x="12.23" y="-1.86" width=".14" height=".06" fill="#3fe395"/></g>`:'';
 L.walls.push(`<g transform="${g.wr(0)}"><rect y="${-HH}" width="10" height="${HH}" fill="url(#${lv})"/><rect x="12.8" y="${-HH}" width="1.2" height="${HH}" fill="url(#${lv})"/>${gate}${chain}<rect y="${-HH}" width="${W}" height="${HH}" fill="${g.lin([['#000',0,.35],['#000',.6,0]],'v')}"/></g>`
  +g.box(10.0,-.42,0,.3,.42,3.7,'#8a8577')+g.box(12.5,-.42,0,.3,.42,3.7,'#8a8577')+g.box(9.95,-.47,3.7,.4,.52,.12,'#a39e90')+g.box(12.45,-.47,3.7,.4,.52,.12,'#a39e90'));
 L.front.push(g.glow(10.15,-.2,3.95,1.8,'#ffd59a',.45)+g.glow(12.65,-.2,3.95,1.8,'#ffd59a',.45)+g.at(10.15,-.2,3.85,'<circle cy="-2" r="2.6" fill="#fff1c9"/>')+g.at(12.65,-.2,3.85,'<circle cy="-2" r="2.6" fill="#fff1c9"/>'));
 // terras, gazon en zwembad
 L.floor.push(g.box(0,0,-.4,W,D,.4,'#14130f',{noT:1,edge:false})+`<g transform="${g.fl(0)}"><rect width="${W}" height="${D}" fill="#123820"/>${Array.from({length:12},(_,i)=>`<rect x="${vhR(4.6+i*.8)}" width=".4" height="${D}" fill="#14412a" opacity=".6"/>`).join('')}<rect width="4.6" height="${D}" fill="url(#${tt})"/>
   ${[[11.4,.8],[10.6,1.5],[9.6,2.1],[8.5,2.5],[7.2,2.9],[5.9,3.0],[5.0,2.6]].map(([x,y])=>`<rect x="${x-.3}" y="${y-.22}" width=".6" height=".44" rx=".12" fill="#7a756a"/>`).join('')}
   <rect x="4.95" y="3.15" width="6.9" height="4.5" fill="#a7a194"/><rect x="5.3" y="3.5" width="6.2" height="3.8" fill="${g.lin([['#0a5f96',0],['#2cb3ef',.5],['#1590cf',1]],'v')}"/>
   <rect x="5.3" y="3.5" width="6.2" height=".25" fill="#063a5c" opacity=".7"/><rect x="5.3" y="3.5" width=".25" height="3.8" fill="#063a5c" opacity=".5"/>
   ${Array.from({length:9},(_,i)=>`<path class="vh-caus" style="animation-delay:${vhR(i*.4)}s" d="M${vhR(5.6+(i*1.37)%5.6)} ${vhR(3.9+(i*.73)%3.1)}q.3-.15.6 0t.6 0" stroke="#bfefff" stroke-width=".04" fill="none" opacity=".55"/>`).join('')}
   <rect x="5.3" y="6.5" width=".7" height=".8" fill="#5fc8f2" opacity=".5"/><path d="M5.3 6.7h.7M5.3 6.95h.7" stroke="#a7e6ff" stroke-width=".03"/></g>`);
 L.front.push(g.glow(8.4,5.4,-.1,4.4,'#38bdf8',.28));
 // daybed met hemel (het bed van de villa)
 const cur=g.lin([['#fff',0,.05],['#fff',.5,.22],['#fff',1,.06]],'h');
 L.obj.push({k:3.6,s:`<g class="vh-base" data-it="bed">${vhBed(g,1.2,.9,2.6,1.8,{frame:'#2b2a28',cover:'#e6dcc3',mat:'#efe7d2',pil:'#f6f0e2',throw:'#2f5a7a',h:.35},F.bed)}</g>`
  +[[1.2,.9],[3.72,.9],[1.2,2.62],[3.72,2.62]].map(([x,y])=>g.box(x,y,0,.08,.08,2.7,'#d9d4c7',{edge:false})).join('')
  +g.pl([[1.24,.94,2.7],[3.76,.94,2.7],[3.76,2.66,2.7],[1.24,2.66,2.7],[1.24,.94,2.7]],'#d9d4c7',1.4)
  +`<g class="vh-sway s2">${g.poly([[1.28,2.7,2.65],[2.1,2.7,2.65],[1.9,2.7,.42],[1.28,2.7,.42]],cur)}${g.poly([[3.76,1.0,2.65],[3.76,1.7,2.65],[3.76,1.5,.42],[3.76,1.0,.42]],cur)}</g>`});
 // ligbedden en parasol
 [5.6,7.0].forEach((x,i)=>L.obj.push({k:x+2.2,s:g.box(x,1.0,0,.65,1.85,.26,'#d7d1c4')+g.poly([[x,1.0,.82],[x+.65,1.0,.82],[x+.65,1.55,.28],[x,1.55,.28]],'#ece6d8')+(i?g.box(x+.08,1.7,.26,.5,.9,.03,'#e2b23a'):'')}));
 const um=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2,b=(i+1)/8*Math.PI*2;um.push(g.poly([[6.65,1.35,2.75],[6.65+1.1*Math.cos(a),1.35+1.1*Math.sin(a),2.35],[6.65+1.1*Math.cos(b),1.35+1.1*Math.sin(b),2.35]],i%2?'#c9b48a':'#b5a07a'))}
 L.obj.push({k:8.1,s:g.cyl(6.65,1.35,0,.04,2.4,'#c9c2b0')+um.join('')});
 // palmen
 const palm=(sc)=>`<path d="M0 0C2-20 -4-44 3-70" stroke="#5a4630" stroke-width="${5*sc}" fill="none"/>${[0,1,2,3,4,5,6,7].map(i=>`<path d="M3-70q${-14+i*4} ${-14+Math.abs(i-3.5)*3} ${-30+i*8.5} ${-2+Math.abs(i-3.5)*5}" stroke="#1f5a30" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join('')}`;
 L.obj.push({k:10.5,s:g.at(9.6,.9,0,`<g class="vh-sway">${palm(1)}</g>`)});
 L.obj.push({k:15.6,s:g.at(13.3,2.3,0,`<g class="vh-sway s2" transform="scale(1.15)">${palm(1)}</g>`)});
 [[4.9,8.2],[4.9,2.4],[12.4,8.8],[11.9,2.6]].forEach(([x,y])=>{L.obj.push({k:x+y,s:g.cyl(x,y,0,.06,.5,'#2a2a2c')+g.ell(x,y,.52,.08,'#fff1c9')});L.front.push(g.glow(x,y,.4,1.3,'#ffe2a8',.4))});
 L.bed=[2.5,1.8,.85]};

/* ---------- spullen ---------- */
const VH_ITEM={
 slaapzak(g,A){const {x,y,z,dx,dy}=A;let s=g.box(x,y,z,dx,dy,.2,'#4e5a33')+`<g transform="${g.fl(z+.2)}"><rect x="${x+.05}" y="${y+.05}" width="${vhR(dx-.1)}" height="${vhR(dy-.1)}" rx=".16" fill="#5d6a3d"/>`;
  if(A.dir==='x'){for(let i=1;i<6;i++){const xx=vhR(x+dx*i/6);s+=`<path d="M${xx} ${y+.08}V${vhR(y+dy-.08)}" stroke="#3d4727" stroke-width=".03"/>`}s+=`<rect x="${x+.05}" y="${y+.05}" width=".42" height="${vhR(dy-.1)}" rx=".14" fill="#3a4426"/>`}
  else{for(let i=1;i<6;i++){const yy=vhR(y+dy*i/6);s+=`<path d="M${x+.08} ${yy}H${vhR(x+dx-.08)}" stroke="#3d4727" stroke-width=".03"/>`}s+=`<rect x="${x+.05}" y="${y+.05}" width="${vhR(dx-.1)}" height=".42" rx=".14" fill="#3a4426"/>`}
  return s+'</g>'},
 kar(g,A){const {x,y}=A,w=.8,d=1.3,z0=.32,z1=1.0,ch='#aab3bd',wire='rgba(190,200,212,.5)';let s='';
  [[x+.08,y+.12],[x+w-.08,y+.12],[x+.08,y+d-.1],[x+w-.08,y+d-.1]].forEach(p=>s+=g.ell(p[0],p[1],.06,.07,'#0d0d0f'));
  s+=g.pl([[x+.08,y+.12,.07],[x+.08,y+.12,z0]],ch,1)+g.pl([[x+w-.08,y+.12,.07],[x+w-.08,y+.12,z0]],ch,1)+g.pl([[x+.08,y+d-.1,.07],[x+.08,y+d-.1,z0]],ch,1)+g.pl([[x+w-.08,y+d-.1,.07],[x+w-.08,y+d-.1,z0]],ch,1);
  s+=g.poly([[x,y,z0],[x+w,y,z0],[x+w,y,z1],[x,y,z1]],'rgba(170,180,195,.1)')+g.poly([[x,y,z0],[x,y+d,z0],[x,y+d,z1],[x,y,z1]],'rgba(170,180,195,.1)');
  s+=g.box(x+.08,y+.12,z0,.42,.5,.4,'#2a2d33')+g.box(x+.18,y+.68,z0,.42,.45,.3,'#5a4a3a')+g.cyl(x+.62,y+.4,z0,.06,.46,'#2f6a3a')+g.cyl(x+.6,y+1.0,z0,.06,.38,'#6a4a2a')+g.box(x+.1,y+.2,z0+.4,.5,.9,.06,'#7a2a2a');
  s+=g.poly([[x,y+d,z0],[x+w,y+d,z0],[x+w,y+d,z1],[x,y+d,z1]],'rgba(170,180,195,.08)')+g.poly([[x+w,y,z0],[x+w,y+d,z0],[x+w,y+d,z1],[x+w,y,z1]],'rgba(170,180,195,.08)');
  for(let i=0;i<=8;i++){const yy=y+d*i/8;s+=g.pl([[x+w,yy,z0],[x+w,yy,z1]],wire,.6)}
  for(let i=0;i<=5;i++){const xx=x+w*i/5;s+=g.pl([[xx,y+d,z0],[xx,y+d,z1]],wire,.6)}
  for(let k=0;k<=3;k++){const zz=z0+(z1-z0)*k/3;s+=g.pl([[x,y+d,zz],[x+w,y+d,zz],[x+w,y,zz]],wire,.6)}
  return s+g.pl([[x,y,z1],[x+w,y,z1],[x+w,y+d,z1],[x,y+d,z1],[x,y,z1]],ch,1.1)+g.pl([[x,y,z1],[x,y-.14,z1+.14]],ch,1)+g.pl([[x+w,y,z1],[x+w,y-.14,z1+.14]],ch,1)+g.pl([[x-.02,y-.14,z1+.14],[x+w+.02,y-.14,z1+.14]],'#c0392b',2.4)},
 hond(g,A){const {x,y}=A,z=A.z||0;return (A.bed?g.ell(x+.05,y,z+.02,.62,'#3e2a33')+g.ell(x+.05,y,z+.1,.5,'#6a4a58'):'')+g.at(x,y,z+(A.bed?.1:0),VH_DOG,'vh-dog')},
 kaarsen(g,A){const {x,y,z}=A;let s='';
  if(A.lantern){[[0,0,.62],[.55,.3,.48],[.15,.7,.4]].forEach(([dx,dy,h])=>{s+=g.box(x+dx,y+dy,0,.3,.3,h,{t:'#2a2a2c',l:'rgba(255,200,120,.35)',r:'rgba(255,180,100,.25)'})+g.pl([[x+dx,y+dy+.3,0],[x+dx,y+dy+.3,h],[x+dx+.3,y+dy+.3,h],[x+dx+.3,y+dy+.3,0]],'#1a1a1c',.9)+g.at(x+dx+.15,y+dy+.15,.08,`<g class="vh-flame" transform="scale(1.4)">${VH_FLAME_S}</g>`)+g.glow(x+dx+.15,y+dy+.15,h*.5,1.3,'#ffb45a',.5,'vh-flick')});return s}
  const C=A.dir==='y'?[[0,0,.34],[0,.3,.24],[0,.55,.3],[0,.85,.18]]:[[0,0,.34],[.18,.08,.24],[.06,.22,.17],[.28,.24,.28]];
  C.forEach(([dx,dy,h])=>s+=g.cyl(x+dx,y+dy,z,.055,h,'#ece2c8')+g.at(x+dx,y+dy,z+h,`<g class="vh-flame">${VH_FLAME_S}</g>`));
  if(A.dir!=='y')s+=g.at(x+.42,y+.05,z,'<path d="M0 0l3-9" stroke="#5a3a22" stroke-width=".8"/><path class="vh-smoke" d="M3-9c-2-3 2-5 0-8s2-5 0-8" stroke="rgba(220,220,230,.35)" stroke-width=".8" fill="none"/>');
  return s+g.glow(x+.1,y+.1,z+.4,1.5,'#ffb45a',.5,'vh-flick')},
 plant(g,A){const one=(x,y)=>{const {z=0,s:k=1}=A,pot=A.pot||'#8a4b2f';return g.cyl(x,y,z,.3*k,.44*k,pot)+g.ell(x,y,z+.44*k,.25*k,'#2a1d14')+g.at(x,y,z+.44*k,vhLeaves(k*1.05),'vh-sway')};
  return one(A.x,A.y)+(A.two?one(A.two[0],A.two[1]):'')},
 espresso(g,A){let {x,y,z}=A,s='';
  if(A.bar){s+=g.box(x,y,0,1.6,.75,1.0,'#6b655a')+g.box(x-.05,y-.05,1.0,1.7,.85,.06,'#2a2826')+[.3,.8,1.3].map(dx=>g.cyl(x+dx,y+1.2,0,.04,.7,'#1a1a1c')+g.ell(x+dx,y+1.2,.72,.2,'#2e2f35')).join('');x+=.5;y+=.2;z=1.06}
  s+=g.box(x,y,z,.42,.34,.06,'#2a2b30')+g.box(x+.02,y+.04,z+.06,.38,.26,.34,'#a9b0b8')+g.box(x,y,z+.4,.42,.34,.05,'#c9ced4')+g.box(x+.14,y+.26,z+.26,.14,.1,.07,'#1a1b1f')+g.cyl(x+.21,y+.42,z+.06,.05,.08,'#f2efe8');
  return s+g.at(x+.21,y+.42,z+.16,'<path class="vh-steam" d="M0 0c-2-3 2-5 0-8s2-5 0-8" stroke="rgba(255,255,255,.4)" fill="none" stroke-width="1.1"/>')},
 bokszak(g,A){const {x,y}=A,c='#1d1e22';let s=g.box(x-.15,y-.25,0,.42,.62,.05,c)+g.box(x+.85,y-.25,0,.42,.62,.05,c)+g.box(x,y,0,.12,.12,2.35,c)+g.box(x+1.0,y,0,.12,.12,2.35,c)+g.box(x,y,2.35,1.12,.12,.1,c);
  const hx=x+.56,hy=y+.06,[px,py]=g.P(hx,hy,2.35);
  return s+`<g class="vh-swing" style="transform-origin:${px}px ${py}px">`+g.pl([[hx,hy,2.35],[hx,hy,2.05]],'#8a8f96',1)+g.cyl(hx,hy,1.0,.22,1.05,'#9b1c1c')+g.band(hx,hy,1.2,.22,'#111',2)+g.band(hx,hy,1.85,.22,'#111',2)+'</g>'},
 ehbo(g,A){const T=A.w==='r'?g.wr(0):g.wl(0,A.D),{a0,a1,v0,v1}=A,w=a1-a0,h=v1-v0,cx=a0+w/2,cy=v0+h/2;
  return `<g transform="${T}"><rect x="${vhR(a0+.06)}" y="${v1}" width="${vhR(w)}" height=".08" fill="rgba(0,0,0,.45)"/><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}" fill="#1f8a4c"/><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h*.2)}" fill="#29a55c"/><rect x="${vhR(a1-.05)}" y="${v0}" width=".05" height="${vhR(h)}" fill="#14653a"/>
   <rect x="${vhR(cx-.06)}" y="${vhR(cy-.16)}" width=".12" height=".34" fill="#f3f3ee"/><rect x="${vhR(cx-.17)}" y="${vhR(cy-.05)}" width=".34" height=".12" fill="#f3f3ee"/></g>`},
 kluis(g,A){const T=A.w==='r'?g.wr(0):g.wl(0,A.D),{a0,a1,v0,v1}=A,w=a1-a0,h=v1-v0,cx=a0+w*.45,cy=v0+h/2;
  return `<g transform="${T}"><rect x="${vhR(a0-.06)}" y="${vhR(v0-.06)}" width="${vhR(w+.12)}" height="${vhR(h+.12)}" fill="#0c0d0f"/><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}" fill="${g.lin([['#7d838b',0],['#4e545c',1]],'v')}"/>
   <circle cx="${vhR(cx)}" cy="${vhR(cy)}" r=".16" fill="#2b2e33"/><circle cx="${vhR(cx)}" cy="${vhR(cy)}" r=".11" fill="#9aa1a9"/><path d="M${vhR(cx)} ${vhR(cy-.11)}v.05" stroke="#2b2e33" stroke-width=".02"/>
   <rect x="${vhR(a1-.16)}" y="${vhR(cy-.18)}" width=".06" height=".36" fill="#c9ced4"/><rect x="${vhR(a0+.03)}" y="${vhR(v0+.1)}" width=".04" height=".12" fill="#2b2e33"/><rect x="${vhR(a0+.03)}" y="${vhR(v1-.22)}" width=".04" height=".12" fill="#2b2e33"/></g>`},
 camera(g,A){return A.pts.map(([w,a,v,D])=>{const z=-v;let s;
  if(w==='r')s=g.pl([[a,0,z],[a,.22,z]],'#3a3b40',1.6)+g.box(a-.14,.12,z-.2,.28,.52,.2,'#cfd2d6')+g.box(a-.1,.64,z-.17,.2,.06,.14,'#1a1b1f')+g.at(a+.07,.6,z-.03,'<circle class="vh-blink" r="1.3" fill="#ff3d52"/>');
  else{const y=D-a;s=g.pl([[0,y,z],[.22,y,z]],'#3a3b40',1.6)+g.box(.12,y-.14,z-.2,.52,.28,.2,'#cfd2d6')+g.box(.64,y-.1,z-.17,.06,.2,.14,'#1a1b1f')+g.at(.6,y+.07,z-.03,'<circle class="vh-blink" r="1.3" fill="#ff3d52"/>')}
  return s}).join('')},
 wapenkast(g,A){const C=['#4a4d52','#3a3d42','#55585e'];
  if(A.inside){const T=g.wl(0,A.D),{a0,a1,v0,v1}=A,w=a1-a0;return `<g transform="${T}"><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(v1-v0)}" fill="#1a1612"/><rect x="${vhR(a0+.05)}" y="${vhR(v0+.05)}" width="${vhR(w-.1)}" height=".04" fill="#ffd59a"/>
   ${[.2,.4,.6].map(f=>`<path d="M${vhR(a0+w*f)} ${vhR(v1-.15)}V${vhR(v0+.25)}" stroke="#55585e" stroke-width=".07"/><path d="M${vhR(a0+w*f)} ${vhR(v1-.9)}h.1v-.35" stroke="#5a3a22" stroke-width=".08" fill="none"/>`).join('')}<rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(v1-v0)}" fill="#ffd59a" opacity=".12"/></g>`}
  const {x,y,dx,dy,h}=A;let s=g.box(x,y,0,dx,dy,h,'#24272c');
  s+=`<g transform="${g.wl(x+dx,y+dy)}"><rect x=".08" y="${vhR(-h+.1)}" width="${vhR(dy-.16)}" height="${vhR(h-.2)}" fill="#0d0e10"/>${[.25,.45,.65].map((f,i)=>`<path d="M${vhR(dy*f)} ${vhR(-.25)}V${vhR(-h+.3)}" stroke="${C[i]}" stroke-width=".07"/><path d="M${vhR(dy*f)} ${vhR(-h*.45)}h.1v-.3" stroke="#5a3a22" stroke-width=".08" fill="none"/>`).join('')}
   <rect x=".08" y="${vhR(-h+.1)}" width="${vhR(dy-.16)}" height=".04" fill="#7fd1ff" opacity=".7"/><rect x="${vhR(dy-.2)}" y="${vhR(-h*.55)}" width=".08" height=".14" fill="#3fe395" opacity=".85"/></g>`;
  return s},
 aquarium(g,A){const fish=(n,w,h,seed)=>{const r=vhRng(seed);let f='';for(let i=0;i<n;i++){const c=['#ffad6b','#ff7fb3','#f2c230','#3fe395','#a9dcff'][i%5],yy=vhR(-h*(.25+r()*.55)),dur=vhR(5+r()*5);
    f+=`<g style="transform:translateY(${yy}px)"><g class="vh-fish" style="--d:${vhR(w-.4)}px;animation-duration:${dur}s;animation-delay:${vhR(-r()*dur)}s"><path d="M.06 0c.06-.07.18-.07.24 0c-.06.07-.18.07-.24 0zM.06 0l-.08-.05v.1z" fill="${c}"/></g></g>`}return f};
  const weed=(w,h)=>[.15,.4,.7,.85].filter(f=>f*w<w-.1).map(f=>`<path d="M${vhR(w*f)} 0c-.08-.15.08-.3 0-.45s.08-.3 0-.45" stroke="#2f8a4a" stroke-width=".05" fill="none"/>`).join('');
  const bub=(w)=>[.3,.62].map((f,i)=>`<circle class="vh-bub" style="animation-delay:${i*1.3}s" cx="${vhR(w*f)}" cy="-.1" r=".03" fill="#d6f1ff" opacity=".7"/>`).join('');
  if(A.inwall){const T=g.wl(0,A.D),{a0,a1,v0,v1}=A,w=a1-a0,h=v1-v0,cl=g.id();g.def(`<clipPath id="${cl}"><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}"/></clipPath>`);
   return `<g transform="${T}"><rect x="${vhR(a0-.08)}" y="${vhR(v0-.08)}" width="${vhR(w+.16)}" height="${vhR(h+.16)}" fill="#1a1b1f"/><g clip-path="url(#${cl})"><rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}" fill="${g.lin([['#2a8ad0',0],['#0b3a66',1]],'v')}"/><g transform="translate(${a0} ${v1})">${weed(w,h)}${fish(6,w,h,'aqv')}${bub(w)}</g></g><rect x="${a0}" y="${v0}" width="${vhR(w)}" height=".06" fill="#bfe8ff" opacity=".5"/></g>`+g.glow(.2,A.D-(a0+w/2),-(v0+h/2),2.6,'#4da3ff',.35)}
  const {x,y,dx,dy,ch,h}=A,z0=ch,z1=ch+h,long=dy>dx;let s=g.box(x,y,0,dx,dy,ch,'#15171c');
  s+=g.box(x,y,z0,dx,dy,h*.92,{t:'rgba(120,195,240,.4)',l:'rgba(40,130,210,.5)',r:'rgba(25,90,160,.55)'},{edge:false});
  const cl=g.id(),w=long?dy:dx,T=long?g.wl(x+dx,y+dy):g.wr(y+dy),ox=long?0:x;
  g.def(`<clipPath id="${cl}"><rect x="${ox}" y="${vhR(-z0-h*.92)}" width="${w}" height="${vhR(h*.92)}"/></clipPath>`);
  s+=`<g transform="${T}"><g clip-path="url(#${cl})"><g transform="translate(${ox} ${-z0})">${weed(w,h)}${fish(long?6:4,w,h,'aq'+x)}${bub(w)}</g></g></g>`;
  s+=g.pl([[x,y+dy,z1],[x+dx,y+dy,z1],[x+dx,y,z1]],'rgba(220,240,255,.5)',.8)+g.pl([[x+dx,y+dy,z0],[x+dx,y+dy,z1]],'rgba(220,240,255,.4)',.8)+g.box(x-.02,y-.02,z1,dx+.04,dy+.04,.06,'#15171c');
  return s+g.glow(x+dx/2,y+dy/2,z0+h/2,2.4,'#4da3ff',.32)},
 bios(g,A){const scr=(a0,w,v0,h)=>`<rect x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}" fill="${g.lin([['#20325a',0],['#c8643a',.72],['#f0a24a',1]],'v')}"/><circle cx="${vhR(a0+w*.62)}" cy="${vhR(v0+h*.7)}" r="${vhR(h*.16)}" fill="#ffd08a"/>
   <path d="M${a0} ${vhR(v0+h)}V${vhR(v0+h*.78)}l${vhR(w*.12)} ${vhR(-h*.1)} ${vhR(w*.1)} ${vhR(h*.06)} ${vhR(w*.16)} ${vhR(-h*.14)} ${vhR(w*.2)} ${vhR(h*.1)} ${vhR(w*.18)} ${vhR(-h*.06)} ${vhR(w*.24)} ${vhR(h*.12)}V${vhR(v0+h)}Z" fill="#120d14"/><rect class="vh-scr" x="${a0}" y="${v0}" width="${vhR(w)}" height="${vhR(h)}" fill="#fff"/>`;
  if(A.hedge){const {a0,a1,v0,v1}=A,w=a1-a0,h=v1-v0;return g.box(a0+.3,.05,0,.1,.1,-v0+.1,'#1a1a1c')+g.box(a1-.4,.05,0,.1,.1,-v0+.1,'#1a1a1c')+`<g transform="${g.wr(.16)}"><rect x="${vhR(a0-.08)}" y="${vhR(v0-.08)}" width="${vhR(w+.16)}" height="${vhR(h+.16)}" fill="#0a0a0c"/>${scr(a0,w,v0,h)}</g>`+g.glow(.5*(a0+a1),.6,-v0-h/2,3.4,'#f0a24a',.18)}
  const {x,y,dx,z,h}=A;return g.box(x+.3,y,0,.1,.1,z,'#0a0a0c')+g.box(x+dx-.4,y,0,.1,.1,z,'#0a0a0c')+g.box(x,y,z,dx,.12,h,'#0a0a0c')+`<g transform="${g.wr(y+.12)}">${scr(x+.08,dx-.16,-(z+h-.08),h-.16)}</g>`+g.box(x+.4,y+.05,z-.22,dx-.8,.18,.16,'#141518')+g.glow(x+dx/2,y+.6,z+h/2,3.2,'#f0a24a',.18)},
 fitness(g,A){const {x,y}=A;let s=`<g transform="${g.fl(.01)}"><rect x="${x-.1}" y="${y-.1}" width="2.2" height="3.3" fill="#0f1013"/></g>`;
  s+=g.box(x,y+.25,0,.75,1.7,.16,'#1a1b1f')+g.box(x+.08,y+.4,.16,.59,1.45,.02,'#2b2d33',{edge:false})+g.box(x+.04,y+.18,0,.06,.06,1.2,'#2a2c31')+g.box(x+.65,y+.18,0,.06,.06,1.2,'#2a2c31')+g.box(x,y+.06,1.1,.75,.24,.16,'#24262b')+g.at(x+.37,y+.18,1.2,'<rect x="-3" y="-2" width="6" height="2.4" fill="#5ce1c4" opacity=".75"/>');
  s+=g.box(x+1.25,y+.25,0,.5,1.3,.55,'#222429');for(let i=0;i<4;i++)s+=g.cyl(x+1.38,y+.42+i*.3,.55,.07,.12,'#55585e')+g.cyl(x+1.62,y+.42+i*.3,.55,.07,.12,'#55585e');
  s+=g.box(x+1.2,y+1.9,0,.12,.12,.3,'#1f2024')+g.box(x+1.2,y+2.8,0,.12,.12,.3,'#1f2024')+g.box(x+1.1,y+1.85,.3,.4,1.15,.14,'#2a2c31')+g.box(x+1.1,y+1.85,.44,.4,1.15,.03,'#5ce1c4',{edge:false});
  return s},
 sauna(g,A){const {x,y,dx,dy,h}=A;let s=g.box(x,y,0,dx,dy,h,'#8a5a32',{edge:false});
  s+=`<g transform="${g.wr(y+dy)}">${Array.from({length:Math.floor(h/.18)},(_,i)=>`<path d="M${x} ${vhR(-.18*(i+1))}H${vhR(x+dx)}" stroke="#6a4224" stroke-width=".025"/>`).join('')}<rect x="${vhR(x+.45)}" y="-2.0" width=".62" height="1.95" fill="${g.lin([['#ffcf8a',0],['#d9813a',1]],'v')}"/><rect x="${vhR(x+.45)}" y="-2.0" width=".62" height="1.95" fill="none" stroke="#4a2a14" stroke-width=".06"/><rect x="${vhR(x+.95)}" y="-1.1" width=".04" height=".3" fill="#c9a227"/></g>`;
  s+=`<g transform="${g.wl(x+dx,y+dy)}">${Array.from({length:Math.floor(h/.18)},(_,i)=>`<path d="M0 ${vhR(-.18*(i+1))}H${dy}" stroke="#5a3820" stroke-width=".025"/>`).join('')}<rect x="${vhR(dy*.35)}" y="-1.8" width=".6" height=".45" fill="#ffcf8a" opacity=".8"/></g>`;
  s+=g.box(x-.1,y-.1,h,dx+.2,dy+.2,.12,'#4a3020')+g.cyl(x+dx-.35,y+.4,h+.12,.07,.55,'#55585e');
  const [px,py]=g.P(x+dx-.35,y+.4,h+.7);s+=`<g transform="translate(${px} ${py})">${[0,1,2].map(i=>`<circle class="vh-puff" style="animation-delay:${i*1.1}s" r="3" fill="#e8e8ee"/>`).join('')}</g>`;
  return s+g.glow(x+.75,y+dy+.2,.9,1.8,'#ffb36b',.45)},
 zen(g,A){const {x,y,dx,dy}=A;let s=`<g transform="${g.fl(.02)}"><rect x="${x}" y="${y}" width="${dx}" height="${dy}" fill="#8f8a80"/>${Array.from({length:Math.floor(dy/.14)},(_,i)=>`<path d="M${x+.1} ${vhR(y+.1+i*.14)}H${vhR(x+dx-.1)}" stroke="#77736a" stroke-width=".025"/>`).join('')}
   ${[[x+1.3,y+.9,.42],[x+2.3,y+1.3,.3],[x+1.9,y+.5,.22]].map(([cx,cy,r])=>`<ellipse cx="${cx}" cy="${cy}" rx="${r+.25}" ry="${r+.25}" fill="none" stroke="#77736a" stroke-width=".025"/><ellipse cx="${cx}" cy="${cy}" rx="${r+.12}" ry="${r+.12}" fill="none" stroke="#77736a" stroke-width=".025"/>`).join('')}</g>`;
  s+=g.box(x-.06,y-.06,0,dx+.12,.06,.1,'#3a2a1a')+g.box(x-.06,y-.06,0,.06,dy+.12,.1,'#3a2a1a')+g.box(x-.06,y+dy,0,dx+.12,.06,.1,'#3a2a1a')+g.box(x+dx,y-.06,0,.06,dy+.12,.1,'#3a2a1a');
  [[x+1.3,y+.9,.42,.3],[x+2.3,y+1.3,.3,.22],[x+1.9,y+.5,.22,.16]].forEach(([cx,cy,r,h])=>s+=g.cyl(cx,cy,0,r,h,'#5a5852',{top:'#6e6b64'}));
  s+=g.box(x+dx-.55,y+.2,0,.3,.3,.15,'#7a776f')+g.box(x+dx-.5,y+.25,.15,.2,.2,.4,'#6e6b64')+g.box(x+dx-.62,y+.13,.55,.44,.44,.1,'#7a776f')+g.box(x+dx-.52,y+.23,.65,.24,.24,.2,'#5a5852')+g.glow(x+dx-.4,y+.35,.75,.9,'#ffd59a',.5);
  s+=g.at(x+.45,y+.4,0,`<g class="vh-sway"><path d="M0 0c1-8-2-14 1-22" stroke="#4a2c1a" stroke-width="2.4" fill="none"/>${[[-8,-24,9],[4,-28,10],[10,-20,8],[-2,-32,8],[-11,-17,6]].map(([cx,cy,r],i)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${['#b8402a','#d4552e','#9a2f22','#c9482a','#e0703a'][i]}"/>`).join('')}</g>`);
  return s},
 hek(g,A){const [bx,by]=A.booth;let s=g.box(bx,by,0,.95,.85,2.3,'#2f3136')+g.box(bx-.06,by-.06,2.3,1.07,.97,.1,'#1f2024')+`<g transform="${g.wr(by+.85)}"><rect x="${vhR(bx+.15)}" y="-1.9" width=".65" height=".6" fill="${g.lin([['#ffe0a8',0],['#d99a4a',1]],'v')}"/><circle cx="${vhR(bx+.47)}" cy="-1.56" r=".1" fill="#1a1410"/><path d="M${vhR(bx+.3)}-1.3q.17-.2.34 0" fill="#1a1410"/></g>`
   +g.box(bx+.3,by+.3,2.4,.3,.25,.15,'#2a2b30')+g.glow(bx+.45,by+.6,2.3,2.6,'#e8f2ff',.3);
  A.dogs.forEach(([x,y])=>s+=g.at(x,y,0,VH_DOBER));return s}};

// Waar elk spul staat, per woning (vloer: x,y; wand: w,a0..a1,v0..v1). Ontbreekt een woning, dan past het daar niet.
const VH_AT={
 brug:{slaapzak:{x:.42,y:2.0,z:.2,dx:1.2,dy:1.8,dir:'y'},kar:{x:6.2,y:.9,dx:.8,dy:1.3},hond:{x:3.1,y:3.7}},
 kraak:{slaapzak:{x:1.3,y:.42,z:.22,dx:1.92,dy:1.26,dir:'x'},kar:{x:7.2,y:2.5,dx:.8,dy:1.3},hond:{x:3.6,y:3.6},kaarsen:{x:3.62,y:.52,z:.55},sloten:{door:1}},
 kamer:{hond:{x:3.1,y:4.55,bed:1},kaarsen:{x:4.75,y:.42,z:.8},sloten:{door:1},plant:{x:2.85,y:.55},espresso:{x:1.62,y:.24,z:.95},ehbo:{w:'r',a0:1.5,a1:2.1,v0:-2.45,v1:-1.9},bed:{base:1},bokszak:{x:5.3,y:3.0}},
 gracht:{hond:{x:1.45,y:5.9},kaarsen:{x:.16,y:4.72,z:1.4,dir:'y'},sloten:{door:1},plant:{x:.75,y:.62,s:1.2,pot:'#2a2c31'},espresso:{x:1.55,y:.3,z:.85},ehbo:{w:'l',a0:3.3,a1:3.85,v0:-2.6,v1:-2.05,D:7.6},
  bed:{base:1},bokszak:{x:7.9,y:3.9},aquarium:{x:8.75,y:.15,dx:1.1,dy:.55,ch:.75,h:.95},camera:{w:1,pts:[['r',9.75,-5.0],['l',.25,-5.0,7.6]]},wapenkast:{base:1}},
 penthouse:{hond:{x:1.7,y:6.7,bed:1},kaarsen:{x:6.45,y:4.62,z:.35},sloten:{door:1},plant:{x:11.45,y:.5,s:1.4,pot:'#121216'},espresso:{x:9.2,y:1.05,z:.97},ehbo:{w:'l',a0:2.75,a1:3.22,v0:-2.85,v1:-2.35,D:8.4},
  bed:{base:1},bokszak:{x:9.9,y:3.2},aquarium:{x:4.3,y:.95,dx:.5,dy:2.4,ch:.35,h:1.9},camera:{w:1,pts:[['l',.3,-4.85,8.4],['r',11.8,-4.85]]},wapenkast:{x:.18,y:3.85,dx:.55,dy:1.05,h:2.0},
  kluis:{w:'l',a0:2.72,a1:3.25,v0:-1.4,v1:-.65,D:8.4},bios:{x:5.0,y:.3,dx:3.8,z:1.0,h:2.2},fitness:{x:9.5,y:4.7}},
 villa:{hond:{x:3.9,y:3.8},kaarsen:{x:2.0,y:3.4,lantern:1},sloten:{door:1},plant:{x:.7,y:5.05,s:1.5,pot:'#3a3833',two:[.7,8.15]},espresso:{x:2.4,y:8.7,bar:1},ehbo:{w:'l',a0:1.9,a1:2.4,v0:-2.4,v1:-1.85,D:10.4},
  bed:{base:1},bokszak:{x:12.2,y:6.5},aquarium:{w:'l',inwall:1,a0:5.0,a1:7.1,v0:-2.6,v1:-.9,D:10.4},camera:{w:1,pts:[['l',.3,-5.4,10.4],['l',10.1,-5.4,10.4],['r',10.15,-3.75],['r',12.65,-3.75]]},
  wapenkast:{w:'l',inside:1,a0:7.55,a1:8.25,v0:-2.5,v1:-.2,D:10.4},kluis:{w:'l',a0:.8,a1:1.6,v0:-1.4,v1:-.55,D:10.4},bios:{hedge:1,w:'r',a0:4.8,a1:8.6,v0:-3.05,v1:-1.15},
  fitness:{x:11.7,y:8.3},sauna:{x:12.0,y:3.3,dx:1.8,dy:2.3,h:2.5},zen:{x:5.2,y:8.15,dx:3.2,dy:2.0},hek:{booth:[12.95,.15],dogs:[[11.0,1.5],[11.9,1.25]]}}};

// Het hele tafereel als SVG. o: furn (wat er staat), ghosts (wat je kunt neerzetten, onzichtbaar tot je erop wijst), thumb, key (uniek id-voorvoegsel)
function vhScene(hid,o){o=o||{};const g=vhIso('v'+hid+(o.key||'')+'_'),F=o.furn||{},hi=HOMES.findIndex(h=>h.id===hid),GH=!!o.ghosts;
 const L={walls:[],floor:[],sh:[],wall:[],obj:[],front:[],bed:null};
 VH_SCENE[hid](g,L,F,GH);
 const bx=Object.assign({},g.b);g.track(false);
 FURN.forEach(f=>{const A=VH_AT[hid]&&VH_AT[hid][f.id];if(!A||A.base||A.door||!VH_ITEM[f.id])return;const own=!!F[f.id];if(!own&&!(GH&&furnFits(f,hi)))return;
  const s=VH_ITEM[f.id](g,A,hid,L,F);if(!s)return;const w=`<g class="vh-it${own?'':' vh-ghost'}" data-it="${f.id}">${s}</g>`;
  if(A.w)L.wall.push(w);else L.obj.push({k:A.k!=null?A.k:A.x+(A.dx||0)/2+A.y+(A.dy||0)/2,s:w})});
 const pad=16,vb=[bx.x0-pad,bx.y0-pad,bx.x1-bx.x0+pad*2,bx.y1-bx.y0+pad*2].map(vhR).join(' ');
 const zz=L.bed&&!o.thumb?(p=>`<g class="vh-zz" transform="translate(${p[0]} ${p[1]})"><text x="0" y="0">z</text><text x="7" y="-9">z</text><text x="15" y="-20">Z</text></g>`)(g.P(L.bed[0],L.bed[1],L.bed[2])):'';
 return `<svg class="vh-svg${o.thumb?' vh-thumb':''}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><defs>${g.defs.join('')}</defs>${L.walls.join('')}${L.wall.join('')}${L.floor.join('')}${L.obj.sort((a,b)=>a.k-b.k).map(x=>x.s).join('')}${L.front.join('')}${zz}</svg>`}

/* ---------- inrichten: plekken, opslag, kopen ---------- */
const furnHi=()=>HOMES.indexOf(home());
const furnFits=(f,hi)=>hi>=f.h&&(f.hmax==null||hi<=f.hmax);
const furnPlaced=()=>FURN.filter(f=>S.furn&&S.furn[f.id]);
const furnFree=()=>Math.max(0,(home().slots||0)-furnPlaced().length);
// Past alles nog? Spullen die niet in deze woning passen of te veel zijn, gaan naar de opslag.
function furnNormalize(){S.furn=S.furn||{};S.furnStore=S.furnStore||{};const hi=furnHi(),moved=[];
 Object.keys(S.furn).forEach(k=>{if(!FURN.find(f=>f.id===k))delete S.furn[k]});Object.keys(S.furnStore).forEach(k=>{if(!FURN.find(f=>f.id===k)||S.furn[k])delete S.furnStore[k]});
 FURN.forEach(f=>{if(S.furn[f.id]&&!furnFits(f,hi)){delete S.furn[f.id];S.furnStore[f.id]=1;moved.push(f)}});
 const pl=furnPlaced().sort((a,b)=>b.p-a.p);while(pl.length>(home().slots||0)){const f=pl.pop();delete S.furn[f.id];S.furnStore[f.id]=1;moved.push(f)}
 return moved}
furnNormalize();
const furnFxList=f=>Object.entries(f.fx).map(([k,v])=>FURN_FX[k]?`<span>${FURN_FX[k][0]} <b>${FURN_FX[k][1](v)}</b></span>`:'').join('');
const furnSell=f=>Math.floor(f.p*.5/10)*10;
function furnWhy(f){const hi=furnHi();if(hi<f.h)return 'Vanaf '+HOMES[f.h].n.toLowerCase();if(f.hmax!=null&&hi>f.hmax)return 'Past niet meer bij je woning';return ''}
// Lijst met spullen voor het inrichten (rechts naast het tafereel)
function furnPanelHtml(){const hi=furnHi(),h=home(),used=furnPlaced().length,free=furnFree(),busy=!!(window.stay&&stay.kind);
 const row=(f,kind)=>{const why=furnWhy(f),afford=S.cash>=f.p;let btn='';
  if(kind==='in')btn=`<button class="btn ghost sm" onclick="act.storeFurn('${f.id}')">Opbergen</button>`;
  else if(kind==='store')btn=why?`<button class="btn ghost sm" onclick="act.sellFurn('${f.id}')">Verkopen · ${fmt(furnSell(f))}</button>`:`<button class="btn sm" onclick="act.placeFurn('${f.id}')" ${free?'':'disabled'}>${free?'Neerzetten':'Geen plek'}</button><button class="btn ghost sm" onclick="act.sellFurn('${f.id}')" title="De helft terug">${fmt(furnSell(f))}</button>`;
  else if(kind==='buy')btn=`<button class="btn sm" onclick="act.buyFurn('${f.id}')" ${afford&&free?'':'disabled'}>${!free?'Geen plek vrij':!afford?'Te duur · '+fmt(f.p):'Kopen · '+fmt(f.p)}</button>`;
  else btn=`<span class="vh-lock">${why} · ${fmt(f.p)}</span>`;
  return `<li class="vh-row ${kind}" data-it="${f.id}" style="--c:${f.col}" onmouseenter="vhHover('${f.id}')" onmouseleave="vhHover(null)" onfocusin="vhHover('${f.id}')"><i></i><div class="vh-rb"><b>${f.n}</b><p>${f.d}</p><div class="vh-fx">${furnFxList(f)}</div></div><div class="vh-rbtn">${btn}</div></li>`};
 const placed=furnPlaced(),stored=FURN.filter(f=>S.furnStore&&S.furnStore[f.id]),buy=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&furnFits(f,hi)),later=FURN.filter(f=>!S.furn[f.id]&&!(S.furnStore&&S.furnStore[f.id])&&hi<f.h);
 const sec=(t,list,kind,note)=>list.length?`<div class="vh-sec"><h4>${t}${note?`<span>${note}</span>`:''}</h4><ul>${list.map(f=>row(f,kind)).join('')}</ul></div>`:'';
 return `<div class="vh-ph"><div><div class="label">Inrichten</div><h3>${h.n}</h3></div><div class="vh-slots" title="${used} van ${h.slots} plekken bezet">${Array.from({length:h.slots},(_,i)=>`<i class="${i<used?'on':''}"></i>`).join('')}<span>${used}/${h.slots}</span></div></div>
  <p class="vh-pnote">Er passen ${h.slots} spullen in ${h.n.toLowerCase()==='onder de brug'?'je plek onder de brug':'je '+h.n.toLowerCase()}. Wat neerstaat, werkt. Wat je opbergt, bewaar je voor later.</p>
  ${sec('In huis',placed,'in')}${sec('Te koop',buy,'buy',free?free+' plek'+(free>1?'ken':'')+' vrij':'alles vol')}${sec('In de opslag',stored,'store')}${sec('Later',later,'later','beter wonen')}
  <button class="btn ghost vh-done" onclick="vbEdit(false)">Klaar</button>`}
// Wijs je een regel aan, dan licht het spul (of de plek waar het komt) op in het tafereel
function vhHover(id){document.querySelectorAll('#vbStage .vh-it,#vbStage .vh-base').forEach(e=>e.classList.toggle('hi',!!id&&e.dataset.it===id));
 const st=document.getElementById('vbStage');if(st)st.classList.toggle('has-hi',!!id)}
Object.assign(act,{
 buyFurn(id,src){const f=FURN.find(x=>x.id===id);if(!f||S.furn[id]||(S.furnStore&&S.furnStore[id]))return;
  if(!furnFits(f,furnHi())){toast(furnWhy(f),'bad');return}if(!furnFree()){toast('Geen plek meer. Berg eerst iets op.','bad');return}
  if(src==='bank'){if(S.bank<f.p){toast('Niet genoeg op de bank','bad');return}S.bank-=f.p}else{if(S.cash<f.p){toast('Niet genoeg contant geld','bad');return}S.cash-=f.p}S.furn[id]=1;try{SFX.pop()}catch(e){}window._vbNew=id;
  toast(f.n+' staat in je '+home().n.toLowerCase()+'.','lvl');log(f.n+' gekocht voor je woning ('+fmt(f.p)+(src==='bank'?', van de bank':'')+')','ok');addXp(Math.floor(f.p/500));save();render()},
 storeFurn(id){if(!S.furn[id])return;delete S.furn[id];S.furnStore=S.furnStore||{};S.furnStore[id]=1;try{SFX.click()}catch(e){}save();render()},
 placeFurn(id){const f=FURN.find(x=>x.id===id);if(!f||!S.furnStore||!S.furnStore[id])return;if(!furnFits(f,furnHi())){toast(furnWhy(f),'bad');return}
  if(!furnFree()){toast('Geen plek meer. Berg eerst iets op.','bad');return}delete S.furnStore[id];S.furn[id]=1;try{SFX.pop()}catch(e){}window._vbNew=id;save();render()},
 sellFurn(id){const f=FURN.find(x=>x.id===id);if(!f||!S.furnStore||!S.furnStore[id])return;delete S.furnStore[id];const v=furnSell(f);S.cash+=v;
  toast(f.n+' verkocht voor '+fmt(v)+'.');log(f.n+' verkocht ('+fmt(v)+')','info');save();render()}});
