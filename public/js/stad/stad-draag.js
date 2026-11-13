// Verhaal: dragen (G.draag). Een stapel pizzadozen in de handen van Luca: 1–2 dozen = één stapel met twee handen,
// 3–4 dozen = twee per hand. Met dozen loop je langzamer en kun je niet rennen.
//   G.draag.zet(n, soort='pizza') · G.draag.n() · G.draag.leeg() · await G.draag.af(plek) (neerzetten op een tafel)
//   plek = {x,y,z,ry} in de wereld, of {binnen:'sahara', plek:'bar'} (een plek die het interieur kent, zie G.binnen.plek)
//   G.draag.opruimen() haalt neergezette dozen weer weg.
(function(){
'use strict';
const G=STAD,TH=window.THREE;
let N=0,soort='pizza',held=null,parts=null,spm=null;const PLACED=[];
const D=G.draag={};
function stack(n){if(G.cut&&G.cut.stapel){const g=new TH.Group();if(n>2){const L=G.cut.stapel(Math.ceil(n/2)),R=G.cut.stapel(Math.floor(n/2));L.position.x=-.36;R.position.x=.36;g.add(L,R)}else if(n>0)g.add(G.cut.stapel(n));return g}
  const g=new TH.Group();for(let i=0;i<n;i++){const m=new TH.Mesh(new TH.BoxGeometry(.64,.13,.64),new TH.MeshLambertMaterial({color:0xe8dcc0}));m.position.y=i*.135;g.add(m)}return g}
function attach(){const P=G.avatarParts&&G.avatarParts();if(!P||!held)return;if(held.parent===P.torso&&parts===P)return;parts=P;held.parent&&held.parent.remove(held);held.position.set(0,.16,.56);held.scale.setScalar(1/1.18);P.torso.add(held)}
function apply(){const on=N>0;G.noRun=on;if(on){if(spm==null)spm=G.spMul||1;G.spMul=spm*(N>2?.7:.8)}else if(spm!=null){G.spMul=spm;spm=null}}
D.zet=function(n,s){n=Math.max(0,Math.min(4,n|0));soort=s||'pizza';if(held){held.parent&&held.parent.remove(held);held=null}N=n;
  if(n>0){held=stack(n);attach();G.snd&&G.snd.fx('grab')}apply();return N};
D.n=()=>N;D.soort=()=>soort;
D.leeg=function(){D.zet(0)};
D.af=function(plek){return new Promise(res=>{if(!N||!held){res(null);return}
  let p=plek||{};if(p.binnen&&G.binnen&&G.binnen.plek)p=Object.assign({},G.binnen.plek(p.binnen,p.plek)||{},{ry:p.ry});
  const from=new TH.Vector3();held.getWorldPosition(from);const q=new TH.Quaternion();held.getWorldQuaternion(q);
  const g=held;held=null;const n=N;N=0;apply();g.parent&&g.parent.remove(g);const sc=G.scene();sc.add(g);g.position.copy(from);g.quaternion.copy(q);g.scale.setScalar(1);
  const to=new TH.Vector3(p.x!=null?p.x:G.P.x+Math.sin(G.P.ry)*.9,(p.y!=null?p.y:.9)+.005,p.z!=null?p.z:G.P.z+Math.cos(G.P.ry)*.9);
  const ry=p.ry!=null?p.ry:G.P.ry,q2=new TH.Quaternion().setFromEuler(new TH.Euler(0,ry,0));let t=0;G.pose='pak';
  const tick=()=>{t+=1/60;const k=Math.min(1,t/.45),e=k*k*(3-2*k);g.position.lerpVectors(from,to,e);g.position.y+=Math.sin(Math.PI*k)*.12;g.quaternion.slerpQuaternions(q,q2,e);
    if(k<1)requestAnimationFrame(tick);else{if(G.pose==='pak')G.pose=null;G.snd&&G.snd.fx('step');PLACED.push(g);res({g,n})}};tick()})};
D.opruimen=function(){PLACED.splice(0).forEach(g=>g.parent&&g.parent.remove(g))};
// armen naar voren en de stapel bij je (stad-avatar.js roept G.armHook elke frame aan)
G.armHook=function(T,P,h,moving){if(!N)return;T.aL=T.aR=-1.18+(moving?Math.sin(h.ph)*.04:0);T.zL=.2;T.zR=-.2;T.tx=Math.min(T.tx||0,0)-.04};
const iv=setInterval(()=>{if(!G.ready)return;clearInterval(iv);const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);if(held)attach();if(N){G.runToggle=false;if(G.driving)D.leeg()}}},150);
})();
