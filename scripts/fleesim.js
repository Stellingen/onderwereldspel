// Rennen! (public/js/flee.js): simulatie met een speelbot om de moeilijkheid te ijken.
// Gebruik: node scripts/fleesim.js [aantal per vakje, standaard 300] [niveaus, bv. 1,3,5]
// Kolommen: training 0 (nieuweling), 25, 50 (alles maximaal), MAX+X = alles maximaal plus extra's (woning, familie,
// uitrusting, outfit) en High roller. Bots: good = reactie 0,3 s en 8% kans op een fout per rij, avg = 0,45 s en 12%,
// bad = 0,6 s en 20% (meer fouten bij rijen vlak na elkaar en hoger tempo). De bot in de browser (toetsaanslagen) is dezelfde.
// react = reactietijd (s) nadat een rij zichtbaar wordt, sd = spreiding in timing van springen/bukken, err = kans per rij op een fout.
function flMakeBot(prof,rnd,send){rnd=rnd||Math.random;const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
 const FLPW=.42;
 return function(C){if(C.done||!C.started)return;const act=a=>send?send(a,C):C.act(a);const P=C.P,v=Math.max(1,C.v);
  let r=null;for(const x of C.rows){if(x.passed)continue;if(!x.set)break;if(x.z-C.dist<=0)continue;r=x;break}if(!r)return;
  const z=r.z-C.dist,tau=z/v;
  if(!r._b){const pr=r.prev?(r.z-r.prev.z)/P.v:1,dens=1+1.6*Math.max(0,.85-pr)/.35,spd=P.v/10;r._b={seen:C.t,err:rnd()<prof.err*dens*spd,kind:rnd(),jt:.3+gauss()*prof.sd,late:0}}
  const b=r._b;const isDrift=r.obs.some(o=>o.dr);
  if(isDrift&&z>9){b.seen=C.t+(z-9)/v;}
  if(C.t<b.seen+prof.react+(isDrift?-prof.react*.5:0)+b.late)return;
  if(b.err){if(b.kind<.6)return; // niet gezien
   if(b.kind<.8){b.late=.35;b.err=false;return} // te laat
   // verkeerde kant op
   if(!b.wrong){b.wrong=1;act(rnd()<.5?'L':'R')}return}
  // per baan: vrij, laag (springen), hoog (bukken) of dicht
  const st=[-1,0,1].map(l=>{let s='free';for(const o of r.obs){const x=o.cr?o.to:o.x;if(Math.abs(l-x)<(FLPW+o.w)/2*P.hitK+.06){if(o.low){if(s==='free')s='low'}else if(o.high){if(s==='free')s='high'}else s='block'}}return s});
  const cur=C.lane,si=l=>st[l+1];
  let want=cur;if(si(cur)!=='free'){let best=null;for(const l of [cur-1,cur+1,cur-2,cur+2]){if(l<-1||l>1)continue;if(si(l)==='free'){best=l;break}}
   if(best==null&&(si(cur)==='low'||si(cur)==='high'))best=cur;
   if(best==null)for(const l of [cur-1,cur+1,cur-2,cur+2]){if(l<-1||l>1)continue;if(si(l)==='low'||si(l)==='high'){best=l;break}}
   if(best!=null)want=best}
  if(want!==C.lane){act(want<C.lane?'L':'R');return}
  const s=si(C.lane);if(Math.abs(C.px-C.lane)>.05&&s==='free')return;
  if(s==='low'&&C.jumpT<0&&tau<=b.jt)act('J');
  if(s==='high'&&C.slideT<0&&tau<=b.jt+.05)act('D')}}
const fs=require('fs'),vm=require('vm'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../public/js/flee.js'),'utf8');
const ctx={Math,console,S:{skills:{}},FLEE_LEVELS:{1:{label:'makkelijk'},2:{label:'redelijk'},3:{label:'lastig'},4:{label:'moeilijk'},5:{label:'bijna onmogelijk'}},Object,Array};
vm.createContext(ctx);vm.runInContext(src+';this.fleeParams=fleeParams;this.fleeCore=fleeCore;this.fleeCtx=fleeCtx;',ctx);
const PROF={good:{react:.3,sd:.04,err:.08},avg:{react:.45,sd:.07,err:.12},bad:{react:.6,sd:.1,err:.2}};
const T=v=>({conditie:v,duur:v,ademhaling:v,speed:v}),X0={parts:[],E:0,k:0,tk:0},XM={parts:[['alles',1]],E:1,k:1-Math.exp(-1.1),tk:.4};
function run(level,train,extra,prof,N){let win=0,mis=0;
 for(let i=0;i<N;i++){const P=ctx.fleeParams(level,null,train,extra),X=ctx.fleeCtx(level,{cat:['straat','kraak','geweld','fraude','smokkel','invloed'][i%6]});
  const C=ctx.fleeCore(P,X);C.started=true;const bot=flMakeBot(PROF[prof]);while(!C.done&&C.t<120){bot(C);C.step(1/60)}if(C.res)win++;mis+=C.misses}
 return [win/N,mis/N]}
const N=+process.argv[2]||300,LV=(process.argv[3]||'1,2,3,4,5').split(',').map(Number),f=x=>(x[0]*100).toFixed(0).padStart(3)+'% ('+x[1].toFixed(1)+')';
console.log('slaagkans (gem. keer gestruikeld)\nniv  nieuw-bad    nieuw-avg    nieuw-good   25-avg       max-avg      max-good     MAX+X-good   MAX+X-avg');
for(const lv of LV)console.log('L'+lv+'  '+[run(lv,T(0),X0,'bad',N),run(lv,T(0),X0,'avg',N),run(lv,T(0),X0,'good',N),run(lv,T(25),X0,'avg',N),run(lv,T(50),X0,'avg',N),run(lv,T(50),X0,'good',N),run(lv,T(50),XM,'good',N),run(lv,T(50),XM,'avg',N)].map(f).join('  '));
