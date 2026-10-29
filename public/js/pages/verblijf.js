// Tab: Verblijf — tafereel van je woning, rusten en dokter (alleen zolang je blijft), onderduiken (loopt door) en de woningmarkt.
const STAY={
 rest:{dur:()=>home().rest*1000,cd:()=>home().cd*1000*(1-furnFx('restCd'))*waitK(),key:'vb_rest'},
 doc:{dur:()=>DOC.dur*1000,cd:()=>DOC.cd*1000*waitK(),key:'vb_doc'}};
window.stay=window.stay||{kind:null,t0:0,dur:0,from:null,timer:null};
const stayP=()=>stay.kind?Math.min(1,(performance.now()-stay.t0)/stay.dur):0;
const stayCd=k=>STAY[k].key?cdLeft(STAY[k].key):0;
function stayTarget(k){const f=stay.kind===k&&stay.from?stay.from:{e:S.energy,h:S.hp,heat:S.heat},h=home();
 if(k==='rest')return {e:EN_MAX,h:Math.min(100,f.h+h.hp+furnFx('restHp')),heat:Math.max(0,f.heat-h.heat)};
 return {h:Math.min(100,f.h+DOC.hp)}}
function stayUseful(k){if(k==='rest')return S.energy<EN_MAX-.5||S.hp<100;return S.hp<100}
function stayApply(p){const f=stay.from,T=stayTarget(stay.kind);
 if(stay.kind==='rest'){S.energy=f.e+(T.e-f.e)*p;S.hp=Math.round(f.h+(T.h-f.h)*p);if(!S.hide&&T.heat<f.heat)S.heat=Math.min(S.heat,Math.round(f.heat+(T.heat-f.heat)*p))}
 else S.hp=Math.round(f.h+(T.h-f.h)*p)}
function stayStop(reason){const k=stay.kind;if(!k)return;const p=stayP();stayApply(p);clearInterval(stay.timer);stay.kind=null;
 // wachttijd naar verhouding: half gerust = halve wachttijd
 if(STAY[k].key&&p>0)S.cd[STAY[k].key]=now()+Math.round(STAY[k].cd()*p);
 if(p>=1){if(k==='rest'){toast('Uitgerust. Energie vol, gezondheid '+S.hp+'%.');log('Uitgerust in '+home().n,'ok')}
  else{toast('De dokter heeft je opgelapt. Gezondheid '+S.hp+'%.');log('Dokterbezoek: gezondheid '+S.hp+'%','ok')}
  SFX.win(3)}
 else if(reason)toast((k==='rest'?'Rust':'Dokterbezoek')+' onderbroken bij '+Math.round(p*100)+'%.','bad');
 save();if(page==='verblijf')render();else{renderTop();renderNav()}}
function stayStart(k){if(stay.kind||inJail()||stayCd(k)||!stayUseful(k))return;
 Object.assign(stay,{kind:k,t0:performance.now(),dur:STAY[k].dur(),from:{e:S.energy,h:S.hp,heat:S.heat},fx0:performance.now()});SFX.click();render();
 stay.timer=setInterval(()=>{if(page!=='verblijf'||document.hidden){stayStop(true);return}const p=stayP();stayApply(p);vbLive();renderTop();if(p>=1)stayStop(false)},100)}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&stay.kind)stayStop(true)});
window.addEventListener('hashchange',()=>{if(stay.kind&&location.hash.slice(1)!=='verblijf')stayStop(true)});
// Onderduiken loopt door als je weggaat. Op Verblijf zakt je hitte snel en word je bijna nooit herkend;
// elders loop je vermomd rond: je hitte zakt 4x zo traag en een agent kan je herkennen (dan word je opgepakt).
const HIDE={home:20,away:5,riskHome:.005,riskAway:.04}; // hitte per minuut, kans per minuut bij 100% hitte
const hideHome=()=>page==='verblijf'&&!document.hidden;
function hideStart(){if(S.hide||inJail()||S.heat<=0)return;S.hide={t0:now(),from:S.heat};S._hideAcc=0;SFX.click();
 toast('Ondergedoken. Hier zakt je hitte snel; ga je weg, dan loop je vermomd rond.');log('Ondergedoken met '+S.heat+'% hitte','info');save();render()}
function hideStop(msg){if(!S.hide)return;S.hide=null;S._hideAcc=0;if(msg)toast(msg);save();if(page==='verblijf')render();else renderTop()}
// mins = minuten sinds de vorige tik, live = het spel staat open (offline geen herkenning)
function hideTick(mins,live){if(!S.hide||mins<=0)return;if(inJail()){S.hide=null;return}
 const atHome=live&&hideHome();S._hideAcc=(S._hideAcc||0)+(atHome?HIDE.home:HIDE.away)*mins;const d=Math.floor(S._hideAcc);if(d>0){S.heat=Math.max(0,S.heat-d);S._hideAcc-=d}
 if(S.heat<=0){S.hide=null;S._hideAcc=0;if(S.wanted){S.wanted=false;toast('Ondergedoken. Je staat niet meer op de gezochtlijst.','lvl')}else toast('Ondergedoken. Je hitte is weg.');
  log('Onderduiken klaar: hitte 0','ok');SFX.win(3);if(page==='verblijf')render();return}
 if(live&&$('#modal').hidden&&!window.__chase&&Math.random()<(atHome?HIDE.riskHome:HIDE.riskAway)*S.heat/100*mins){
  const sec=45+Math.round(S.heat*1.5);S.hide=null;S._hideAcc=0;log(atHome?'Verraden tijdens het onderduiken':'Herkend ondanks je vermomming','bad');save();
  arrest(sec,'Herkend!',atHome?'Een buurman heeft je verraden. De politie staat aan de deur.':'Een agent herkent je ondanks je vermomming.',{flee:atHome?4:2})}}
function vbHideCard(){const on=!!S.hide,heat=S.heat;
 return `<article class="va ${on?'on':''} ${heat>=100?'hot':''}" style="--c:#b8a1ff">
  <div class="va-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle id="ring_hide" cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:${RING};stroke-dashoffset:${RING*(1-heat/100)}"/></svg>
   <div class="va-c"><b id="ringT_hide">${heat}%</b><span>hitte</span></div></div>
  <div class="va-b"><h3>Onderduiken</h3><p>${on?'Je bent ondergedoken. Gordijnen dicht, telefoon uit.':'Gordijnen dicht, telefoon uit. Of ga vermomd de straat op.'}</p>
   <div class="va-eff"><div><span>Hier op Verblijf</span><b>−${HIDE.home}%/min</b><i></i><em>bijna nooit herkend</em></div>
    <div><span>Vermomd elders</span><b>−${HIDE.away}%/min</b><i></i><em>kans op herkenning</em></div>${S.wanted?'<div><span>Op de gezochtlijst</span><b>ja</b><i>→</i><em>nee bij 0%</em></div>':''}</div>
   <button class="btn ${on?'ghost':''}" onclick="${on?"hideStop('Je duikt weer op.')":'hideStart()'}" ${!on&&(inJail()||heat<=0)?'disabled':''}>${on?'Stoppen met onderduiken':inJail()?'Je zit vast':heat<=0?'Geen hitte':'Onderduiken'}</button>
   <div class="va-note">${on?`Hier ben je over <b id="hideEta">${fmtClock(heat/HIDE.home*60000)}</b> klaar. Ga je weg, dan loopt het door, maar 4× zo traag en de politie kan je herkennen.`:'Je kunt gewoon verder spelen. Op deze pagina zakt je hitte 4× zo snel en word je bijna nooit herkend.'}</div></div></article>`}
// Live bijwerken zonder hertekenen
const RING=2*Math.PI*52;
function vbLive(){const k=stay.kind;
 const hf=document.getElementById('ring_hide'),ht=document.getElementById('ringT_hide');if(hf){hf.style.strokeDashoffset=RING*(1-S.heat/100);ht.textContent=S.heat+'%'}
 const he=document.getElementById('hideEta');if(he&&S.hide)he.textContent=fmtClock(S.heat/HIDE.home*60000);
 ['rest','doc'].forEach(x=>{const fg=document.getElementById('ring_'+x),tx=document.getElementById('ringT_'+x);if(!fg)return;
  if(x===k){const p=stayP();fg.style.strokeDashoffset=RING*(1-p);tx.textContent=Math.round(p*100)+'%'}
  else{const c=stayCd(x);if(c){fg.style.strokeDashoffset=RING*(c/STAY[x].cd());tx.textContent=fmtClock(c)}}});
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('vbE',Math.floor(S.energy));set('vbH',S.hp+'%');set('vbHeat',S.heat+'%');set('vbHd',S.hp+'%');set('vbHeat2',S.heat+'%');set('vbE2',Math.floor(S.energy)+'/'+EN_MAX);set('vbHs',S.hp+'%')}
let _vbSig='';
setInterval(()=>{if(page!=='verblijf'||stay.kind)return;const sig=['rest','doc'].map(k=>stayCd(k)>0).join()+inJail()+!!S.hide+(S.heat>0);
 if(sig!==_vbSig&&_vbSig){_vbSig=sig;render();return}_vbSig=sig;vbLive()},1000);

/* ---------- Tafereel (canvas) ---------- */
function vbRng(seed){let a=7;for(const ch of seed)a=(a*31+ch.charCodeAt(0))|0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function vbSky(x,W,hz,t,seed){const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#05070f');g.addColorStop(1,'#1a2442');x.fillStyle=g;x.fillRect(0,0,W,hz+2);
 const r=vbRng(seed+'s');for(let i=0;i<70;i++){const sx=r()*W,sy=r()*hz*.8,tw=.4+.6*Math.abs(Math.sin(t*.8+i));x.fillStyle=`rgba(255,255,255,${.25*tw*r()+.08})`;x.fillRect(sx,sy,1.4,1.4)}
 x.save();x.shadowColor='rgba(244,236,210,.6)';x.shadowBlur=30;x.fillStyle='#f1e9cf';x.beginPath();x.arc(W*.84,hz*.28,Math.max(8,hz*.07),0,7);x.fill();x.restore();
 x.fillStyle='#1a2442';x.beginPath();x.arc(W*.84+hz*.03,hz*.28-hz*.015,Math.max(7,hz*.062),0,7);x.globalAlpha=.55;x.fill();x.globalAlpha=1}
function vbCity(x,W,hz,t,seed,o){const r=vbRng(seed),s=o.scale||1;let px=-10;
 while(px<W){const bw=(16+r()*46)*s,bh=(o.min+r()*(o.max-o.min))*s;x.fillStyle=o.col||'#0b0f1c';x.fillRect(px,hz-bh,bw,bh);
  for(let wy=hz-bh+5*s;wy<hz-4*s;wy+=8*s)for(let wx=px+4*s;wx<px+bw-4*s;wx+=6.5*s){const q=r();if(q<(o.dens||.3)){const ph=r();const on=ph>.06||Math.sin(t*.6+ph*90)>0;if(!on)continue;
   x.fillStyle=q<.04?`rgba(160,210,255,.7)`:`rgba(255,${180+Math.floor(r()*50)},110,${.45+.4*r()})`;x.fillRect(wx,wy,2.2*s,3.6*s)}}
  px+=bw+r()*4*s}}
function vbWater(x,W,y0,y1,t,seed){const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#0d1428');g.addColorStop(1,'#05070d');x.fillStyle=g;x.fillRect(0,y0,W,y1-y0);
 const r=vbRng(seed+'w');for(let i=0;i<16;i++){const sx=r()*W,col=r()<.75?'255,190,110':'160,210,255',w=2+r()*4;
  for(let yy=y0+2;yy<y1;yy+=3){const a=.35*(1-(yy-y0)/(y1-y0))*(.5+.5*Math.sin(yy*.3+t*2+i));if(a<.02)continue;x.fillStyle=`rgba(${col},${a})`;x.fillRect(sx+Math.sin(yy*.12+t*1.6+i)*3,yy,w,2)}}}
function vbRain(x,W,H,t,n,alpha){x.strokeStyle=`rgba(190,205,235,${alpha||.18})`;x.lineWidth=1;x.beginPath();
 for(let i=0;i<n;i++){const sp=380+(i%7)*40,xx=((i*97.13)+t*sp*.25)%(W+40)-20,yy=((i*53.7)+t*sp)%(H+30)-15;x.moveTo(xx,yy);x.lineTo(xx-3,yy+11)}x.stroke()}
function vbGlow(x,cx,cy,rad,col,a){const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2)}
function vbBed(x,bx,by,bw,bh,o){x.fillStyle=o.frame||'#2a221c';x.fillRect(bx,by+bh*.55,bw,bh*.45);if(o.head){x.fillRect(bx-bh*.15,by-bh*.6,bh*.18,bh*1.6)}
 x.fillStyle=o.mat||'#d8d0bf';x.beginPath();x.roundRect(bx,by,bw,bh*.62,4);x.fill();
 x.fillStyle=o.cover;x.beginPath();x.roundRect(bx+bw*.28,by-bh*.08,bw*.72,bh*.72,6);x.fill();
 x.fillStyle='rgba(255,255,255,.08)';x.fillRect(bx+bw*.28,by-bh*.08,bw*.72,bh*.12);
 x.fillStyle=o.pillow||'#e6e1d6';x.beginPath();x.roundRect(bx+bw*.03,by-bh*.18,bw*.22,bh*.38,8);x.fill()}
const VB_BED={brug:[.21,.8],kraak:[.3,.79],kamer:[.5,.74],gracht:[.5,.75],penthouse:[.41,.8],villa:[.79,.82]};
function vbScene(x,W,H,id,t){
 if(id==='brug'){const hz=H*.6;vbSky(x,W,hz,t,'brug');vbCity(x,W,hz,t,'brug',{min:18,max:95,scale:H/300,dens:.32});vbWater(x,W,hz,H*.86,t,'brug');
  [.18,.42,.66,.9].forEach(px=>{x.fillStyle='#0d0b0a';x.fillRect(W*px-1,hz-H*.12,2,H*.12);vbGlow(x,W*px,hz-H*.12,H*.12,'255,170,80',.55)});
  vbRain(x,W,H*.86,t,120,.16);
  x.fillStyle='#17120f';x.fillRect(0,H*.86,W,H*.14);x.strokeStyle='rgba(255,255,255,.03)';for(let i=0;i<W;i+=18){x.beginPath();x.moveTo(i,H*.86);x.lineTo(i-8,H);x.stroke()}
  x.beginPath();x.rect(0,0,W,H);x.ellipse(W/2,H*1.04,W*.58,H*.92,0,0,Math.PI*2);x.fillStyle='#110e0c';x.fill('evenodd');
  x.strokeStyle='rgba(255,255,255,.035)';x.lineWidth=2;for(let k=1;k<5;k++){x.beginPath();x.ellipse(W/2,H*1.04,W*.58+k*14,H*.92+k*12,0,Math.PI,Math.PI*2);x.stroke()}
  vbBed(x,W*.05,H*.79,W*.33,H*.09,{frame:'#0e0c0b',mat:'#6b5a46',cover:'#2e4a6b',pillow:'#b9ae96'});
  const fl=.7+.3*Math.sin(t*9)*Math.sin(t*3.3);vbGlow(x,W*.43,H*.82,H*.22*fl,'255,170,80',.45);x.fillStyle='#e6dcc0';x.fillRect(W*.43-2,H*.82,4,H*.05);x.fillStyle='#ffcf6b';x.beginPath();x.ellipse(W*.43,H*.81,2.5,5*fl,0,0,7);x.fill();
  x.strokeStyle='#2a2522';x.lineWidth=2;const cx=W*.76,cy=H*.78;x.strokeRect(cx,cy,W*.09,H*.08);x.beginPath();x.moveTo(cx,cy);x.lineTo(cx-W*.02,cy-H*.04);x.stroke();
  [cx+6,cx+W*.08].forEach(w=>{x.beginPath();x.arc(w,cy+H*.1,4,0,7);x.stroke()})}
 else if(id==='kraak'){x.fillStyle='#16131a';x.fillRect(0,0,W,H);const r=vbRng('graf');
  ['#ff3d52','#3fe395','#b8a1ff','#ffad6b','#a9dcff'].forEach(c=>{x.strokeStyle=c;x.globalAlpha=.22;x.lineWidth=5+r()*8;x.lineCap='round';x.beginPath();const sx=r()<.5?r()*W*.25:W*.75+r()*W*.25,sy=H*.15+r()*H*.5;
   x.moveTo(sx,sy);x.bezierCurveTo(sx+40,sy-30,sx-20,sy+40,sx+60,sy+10);x.stroke()});x.globalAlpha=1;
  const wx=W*.3,wy=H*.08,ww=W*.4,wh=H*.5;x.save();x.beginPath();x.rect(wx,wy,ww,wh);x.clip();vbSky(x,W,wy+wh*.85,t,'kraak');vbCity(x,W,wy+wh*.85,t,'kraak',{min:30,max:120,scale:H/300,dens:.3});
  x.fillStyle='#0b0f1c';x.fillRect(wx,wy+wh*.85,ww,wh);vbRain(x,W,H,t,90,.18);x.restore();
  x.strokeStyle='#2c2731';x.lineWidth=6;x.strokeRect(wx,wy,ww,wh);x.lineWidth=4;x.beginPath();x.moveTo(wx+ww/3,wy);x.lineTo(wx+ww/3,wy+wh);x.moveTo(wx+ww*2/3,wy);x.lineTo(wx+ww*2/3,wy+wh);x.moveTo(wx,wy+wh/2);x.lineTo(wx+ww,wy+wh/2);x.stroke();
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(wx+ww*.75,wy+wh*.1);x.lineTo(wx+ww*.85,wy+wh*.28);x.lineTo(wx+ww*.8,wy+wh*.42);x.moveTo(wx+ww*.85,wy+wh*.28);x.lineTo(wx+ww*.95,wy+wh*.33);x.stroke();
  [[-.18,.25],[.14,.62]].forEach(([a,yy])=>{x.save();x.translate(wx+ww/2,wy+wh*yy);x.rotate(a);x.fillStyle='#5a4330';x.fillRect(-ww*.58,-9,ww*1.16,18);x.fillStyle='#2a1f16';x.fillRect(-ww*.58,-9,ww*1.16,3);
   x.fillStyle='#bbb';[-ww*.5,ww*.5].forEach(n=>{x.beginPath();x.arc(n,0,2,0,7);x.fill()});x.restore()});
  x.fillStyle='#1f1c23';x.fillRect(0,H*.74,W,H*.26);x.fillStyle='rgba(0,0,0,.25)';x.beginPath();x.ellipse(W*.62,H*.86,W*.08,H*.03,0,0,7);x.fill();
  vbBed(x,W*.12,H*.8,W*.36,H*.08,{frame:'#141216',mat:'#8a7e68',cover:'#6b3a2a',pillow:'#c8bfae'});
  const sw=Math.sin(t*1.2)*6,bx=W*.84+sw,by=H*.3;x.strokeStyle='#333';x.lineWidth=1.5;x.beginPath();x.moveTo(W*.84,0);x.lineTo(bx,by);x.stroke();vbGlow(x,bx,by+6,H*.4,'255,200,120',.32);
  x.fillStyle='#fff1c9';x.beginPath();x.arc(bx,by+6,6,0,7);x.fill()}
 else if(id==='kamer'){x.fillStyle='#281d24';x.fillRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.025)';for(let i=0;i<W;i+=22)x.fillRect(i,0,8,H*.78);
  const wx=W*.38,wy=H*.08,ww=W*.24,wh=H*.44;x.save();x.beginPath();x.rect(wx,wy,ww,wh);x.clip();vbSky(x,W,wy+wh*.82,t,'kamer');vbCity(x,W,wy+wh*.82,t,'kamer',{min:30,max:110,scale:H/320,dens:.35});x.fillStyle='#0b0f1c';x.fillRect(wx,wy+wh*.82,ww,wh);x.restore();
  x.strokeStyle='#160f13';x.lineWidth=7;x.strokeRect(wx,wy,ww,wh);x.lineWidth=4;x.beginPath();x.moveTo(wx+ww/2,wy);x.lineTo(wx+ww/2,wy+wh);x.stroke();
  [[wx-W*.09,W*.1],[wx+ww-W*.01,W*.1]].forEach(([cx,cw])=>{const g=x.createLinearGradient(cx,0,cx+cw,0);g.addColorStop(0,'#4a2029');g.addColorStop(.5,'#6a2c38');g.addColorStop(1,'#43202a');x.fillStyle=g;x.fillRect(cx,wy-H*.04,cw,wh+H*.12)});
  x.fillStyle='#1a1317';x.fillRect(0,H*.78,W,H*.22);
  vbBed(x,W*.26,H*.72,W*.48,H*.14,{frame:'#3a2a22',cover:'#2f5a7a',pillow:'#e6e1d6',head:1});
  x.fillStyle='#2a1f1a';x.fillRect(W*.8,H*.72,W*.08,H*.12);vbGlow(x,W*.84,H*.66,H*.35,'255,190,110',.4);x.fillStyle='#e8c98a';x.beginPath();x.moveTo(W*.82,H*.66);x.lineTo(W*.86,H*.66);x.lineTo(W*.875,H*.71);x.lineTo(W*.805,H*.71);x.fill()}
 else if(id==='gracht'){x.fillStyle='#1d140d';x.fillRect(0,0,W,H);x.strokeStyle='rgba(255,220,170,.05)';x.lineWidth=2;for(let i=0;i<W;i+=W/8){x.strokeRect(i+6,H*.7,W/8-12,H*.06)}
  [[.12,.4],[.6,.88]].forEach(([a,b2],wi)=>{const wx=W*a,ww=W*(b2-a),wy=H*.06,wh=H*.62;x.save();x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+ww/2);x.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.closePath();x.clip();
   const hz=wy+wh*.72;vbSky(x,W,hz,t,'gracht');const r=vbRng('gevel'+wi);let px=wx-10;
   while(px<wx+ww+10){const gw=24+r()*22,gh=wh*.32+r()*wh*.2;x.fillStyle=['#1c1a24','#241f2a','#191722'][Math.floor(r()*3)];x.beginPath();x.moveTo(px,hz);x.lineTo(px,hz-gh);
    for(let st=0;st<3;st++){x.lineTo(px+gw*(.15+st*.12),hz-gh-st*8);x.lineTo(px+gw*(.15+st*.12),hz-gh-(st+1)*8)}x.lineTo(px+gw*(1-.51),hz-gh-24);
    for(let st=2;st>=0;st--){x.lineTo(px+gw*(1-.15-st*.12),hz-gh-(st+1)*8);x.lineTo(px+gw*(1-.15-st*.12),hz-gh-st*8)}x.lineTo(px+gw,hz-gh);x.lineTo(px+gw,hz);x.fill();
    for(let yy=hz-gh+8;yy<hz-6;yy+=13)for(let xx=px+5;xx<px+gw-6;xx+=9)if(r()<.45){x.fillStyle=`rgba(255,${185+Math.floor(r()*40)},110,${.5+.4*r()})`;x.fillRect(xx,yy,4,7)}px+=gw}
   vbWater(x,W,hz,wy+wh,t,'gracht'+wi);x.restore();
   x.strokeStyle='#0f0905';x.lineWidth=6;x.beginPath();x.moveTo(wx,wy+wh);x.lineTo(wx,wy+ww/2);x.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0);x.lineTo(wx+ww,wy+wh);x.closePath();x.stroke();
   x.lineWidth=3;x.beginPath();x.moveTo(wx+ww/2,wy);x.lineTo(wx+ww/2,wy+wh);x.moveTo(wx,wy+wh*.45);x.lineTo(wx+ww,wy+wh*.45);x.stroke()});
  x.fillStyle='#24180f';x.fillRect(0,H*.8,W,H*.2);vbGlow(x,W*.5,H*.3,H*.7,'255,190,120',.08);
  vbBed(x,W*.32,H*.75,W*.36,H*.15,{frame:'#3b2613',cover:'#7a2f3a',pillow:'#efe7d6',head:1})}
 else if(id==='penthouse'){const hz=H*.5;vbSky(x,W,hz,t,'pent');
  const g=x.createLinearGradient(0,hz,0,H*.86);g.addColorStop(0,'#0a0e1c');g.addColorStop(1,'#070912');x.fillStyle=g;x.fillRect(0,hz,W,H*.86-hz);
  const r=vbRng('carpet');for(let i=0;i<900;i++){const yy=hz+Math.pow(r(),1.6)*(H*.86-hz),xx=r()*W;const a=.25+.6*r();x.fillStyle=r()<.8?`rgba(255,${170+Math.floor(r()*60)},100,${a})`:`rgba(170,215,255,${a})`;const sz=.8+(yy-hz)/(H*.36)*1.6;x.fillRect(xx,yy,sz,sz)}
  vbCity(x,W,hz+4,t,'pentfar',{min:8,max:40,scale:H/300,dens:.4,col:'#0a0d18'});
  for(let lane=0;lane<2;lane++)for(let i=0;i<26;i++){const u=((i/26)+(t*(lane?.05:-.04)))%1,uu=u<0?u+1:u;const px=uu*W,py=hz+H*.2+Math.sin(uu*Math.PI*1.4)*H*.08+lane*4;x.fillStyle=lane?'rgba(255,60,70,.85)':'rgba(255,250,230,.9)';x.fillRect(px,py,2.4,1.6)}
  x.fillStyle='rgba(255,255,255,.03)';x.beginPath();x.moveTo(W*.1,0);x.lineTo(W*.25,0);x.lineTo(W*.05,H*.86);x.lineTo(0,H*.86);x.fill();
  x.fillStyle='#08090c';for(let i=0;i<=5;i++)x.fillRect(i*W/5-3,0,6,H*.86);x.fillRect(0,0,W,8);
  const fg=x.createLinearGradient(0,H*.86,0,H);fg.addColorStop(0,'#13151c');fg.addColorStop(1,'#08090d');x.fillStyle=fg;x.fillRect(0,H*.86,W,H*.14);
  vbBed(x,W*.18,H*.8,W*.46,H*.08,{frame:'#0c0c0f',mat:'#cfc7b6',cover:'#e9e4d8',pillow:'#f5f1e8'});x.fillStyle='#c9a227';x.fillRect(W*.5,H*.79,W*.14,H*.05);
  x.strokeStyle='#8c8f96';x.lineWidth=3;x.beginPath();x.moveTo(W*.8,H*.94);x.quadraticCurveTo(W*.8,H*.4,W*.6,H*.48);x.stroke();vbGlow(x,W*.6,H*.5,H*.4,'255,220,160',.25)}
 else{const hz=H*.52;vbSky(x,W,hz,t,'villa');const r=vbRng('trees');x.fillStyle='#08110d';x.beginPath();x.moveTo(0,hz);for(let i=0;i<=W;i+=14)x.lineTo(i,hz-6-r()*H*.06);x.lineTo(W,hz+2);x.lineTo(0,hz+2);x.fill();
  const lg=x.createLinearGradient(0,hz,0,H*.86);lg.addColorStop(0,'#0b1a12');lg.addColorStop(1,'#060d09');x.fillStyle=lg;x.fillRect(0,hz,W,H*.86-hz);
  const py0=H*.6,py1=H*.78;x.save();x.beginPath();x.moveTo(W*.3,py0);x.lineTo(W*.7,py0);x.lineTo(W*.78,py1);x.lineTo(W*.22,py1);x.closePath();x.shadowColor='rgba(14,165,233,.8)';x.shadowBlur=30;
  const pg=x.createLinearGradient(0,py0,0,py1);pg.addColorStop(0,'#38bdf8');pg.addColorStop(1,'#0369a1');x.fillStyle=pg;x.fill();x.restore();
  x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1;for(let k=0;k<6;k++){const yy=py0+6+k*(py1-py0-8)/6,off=Math.sin(t*1.5+k)*10;x.beginPath();x.moveTo(W*.32+off,yy);x.quadraticCurveTo(W*.5,yy+3*Math.sin(t+k),W*.68+off,yy);x.stroke()}
  [[.12,1],[.9,-1]].forEach(([px,dir])=>{const bx=W*px,by=H*.84;x.strokeStyle='#050806';x.lineWidth=6;x.beginPath();x.moveTo(bx,by);x.quadraticCurveTo(bx+dir*12,H*.5,bx+dir*4,H*.3);x.stroke();
   x.fillStyle='#050806';for(let f=0;f<6;f++){const a=f/6*Math.PI*2+Math.sin(t*.8)*.05;x.beginPath();x.ellipse(bx+dir*4+Math.cos(a)*28,H*.3+Math.sin(a)*10+8,30,6,a,0,7);x.fill()}});
  x.fillStyle='#0c0e11';x.fillRect(0,0,W,10);[0,1/3,2/3,1].forEach(f=>x.fillRect(f*W-4,0,8,H*.86));
  x.fillStyle='#1e1c19';x.fillRect(0,H*.86,W,H*.14);vbBed(x,W*.62,H*.82,W*.34,H*.12,{frame:'#151310',cover:'#e9dfc6',pillow:'#fbf7ec',head:1})}
}
// Spullen die je hebt gekocht, zie je ook staan
function vbFurn(x,W,H,id,t){const F=S.furn||{};
 if(F.aquarium){const ax=W*.84,ay=H*.62,aw=W*.12,ah=H*.14;x.fillStyle='#0b2a4a';x.fillRect(ax,ay,aw,ah);vbGlow(x,ax+aw/2,ay+ah/2,H*.25,'77,157,255',.3);
  for(let i=0;i<4;i++){const fx=ax+aw*(.15+.7*((Math.sin(t*.5+i*1.7)+1)/2)),fy=ay+ah*(.25+i*.15);x.fillStyle=['#ffad6b','#ff7fb3','#f2c230','#3fe395'][i];x.beginPath();x.ellipse(fx,fy,4,2.2,0,0,7);x.fill()}
  x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1.5;x.strokeRect(ax,ay,aw,ah);x.fillStyle='#14161b';x.fillRect(ax-3,ay+ah,aw+6,H*.1)}
 if(F.plant){const px=id==='villa'?W*.48:W*.07,py=H*.9;x.fillStyle='#6b3a22';x.beginPath();x.moveTo(px-12,py-22);x.lineTo(px+12,py-22);x.lineTo(px+8,py);x.lineTo(px-8,py);x.fill();
  x.fillStyle='#1f6b3a';for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.32+Math.sin(t*.9+i)*.03;x.save();x.translate(px,py-22);x.rotate(a+Math.PI/2);x.beginPath();x.ellipse(0,-22,5,22,0,0,7);x.fill();x.restore()}}
}
function vbFx(x,W,H,id,t){const k=stay.kind,ramp=k?Math.min(1,(performance.now()-(stay.fx0||0))/1200):0;
 if(k==='rest'){x.fillStyle=`rgba(4,6,18,${.45*ramp})`;x.fillRect(0,0,W,H);const [bx,by]=VB_BED[id];
  x.font='900 20px "Big Shoulders Display",sans-serif';for(let i=0;i<3;i++){const ph=((t*.45)+i/3)%1;x.globalAlpha=Math.sin(ph*Math.PI)*ramp;x.fillStyle='#a9dcff';x.font=`900 ${14+ph*20}px "Big Shoulders Display",sans-serif`;x.fillText('z',W*bx+ph*46,H*by-20-ph*H*.3)}x.globalAlpha=1}
 if(S.hide){const hr=Math.min(1,(now()-(S.hide.t0||0))/1200),c=1-Math.pow(1-hr,3),cw=W*.5*c;[[0,1],[W-cw,-1]].forEach(([cx])=>{const g=x.createLinearGradient(cx,0,cx+cw,0);for(let f=0;f<=8;f++)g.addColorStop(f/8,f%2?'#1d1418':'#120c0f');x.fillStyle=g;x.fillRect(cx,0,cw,H)});
  if(c>.97){vbGlow(x,W/2,H*.5,H*.5,'255,190,120',.12);x.fillStyle='rgba(255,200,130,.5)';x.fillRect(W/2-1,0,2,H)}}
 const v=x.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,W*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=v;x.fillRect(0,0,W,H)}
function vbSize(cv){const dpr=Math.min(2,devicePixelRatio||1),W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return [x,W,H]}
let vbRaf=null;const vbReduce=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function vbLoop(ts){const cv=document.getElementById('vbScene');if(!cv){vbRaf=null;return}const [x,W,H]=vbSize(cv),t=vbReduce()?0:ts/1000,id=home().id;
 x.clearRect(0,0,W,H);vbScene(x,W,H,id,t);vbFurn(x,W,H,id,t);vbFx(x,W,H,id,t);vbRaf=requestAnimationFrame(vbLoop)}
function vbMount(){document.querySelectorAll('canvas[data-home]').forEach(cv=>{const [x,W,H]=vbSize(cv);vbScene(x,W,H,cv.dataset.home,2);
  const v=x.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,W*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');x.fillStyle=v;x.fillRect(0,0,W,H)});
 if(!vbRaf)vbRaf=requestAnimationFrame(vbLoop)}

/* ---------- Pagina ---------- */
function vbAct(k){const h=home(),active=stay.kind===k,other=stay.kind&&!active,cd=stayCd(k),useful=stayUseful(k),T=stayTarget(k),p=active?stayP():0;
 const C={rest:['#a9dcff','Rusten','Slaap even bij.',h.rest+' s'],doc:['#3fe395','Dokter','De huisartsenpost om de hoek lapt je op.',DOC.dur+' s']}[k];
 const off=active?RING*(1-p):cd?RING*(cd/STAY[k].cd()):RING;
 const center=active?Math.round(p*100)+'%':cd?fmtClock(cd):C[3];
 const sub=active?'bezig':cd?'wachten':'duur';
 const rows=k==='rest'?[['Energie',`<b id="vbE">${Math.floor(S.energy)}</b>`,Math.floor(T.e)],['Gezondheid',`<b id="vbH">${S.hp}%</b>`,T.h+'%'],...(h.heat?[['Hitte',S.heat+'%',T.heat+'%']]:[])]
  :k==='doc'?[['Gezondheid',`<b id="vbHd">${S.hp}%</b>`,T.h+'%']]:[['Hitte',`<b id="vbHeat2">${S.heat}%</b>`,'0%'],...(S.wanted?[['Op de gezochtlijst','ja','nee']]:[])];
 const label=active?'Stoppen':other?'Even geduld':inJail()?'Je zit vast':cd?'Weer over '+fmtClock(cd):!useful?(k==='rest'?'Al uitgerust':k==='doc'?'Kerngezond':'Geen hitte'):({rest:'Rusten',doc:'Naar de dokter',hide:'Onderduiken'})[k];
 const note=k==='rest'?`Elke ${fmtClock(STAY.rest.cd())} min. Ga je eerder weg, dan houd je wat je had en wacht je naar verhouding.`:k==='doc'?`+${DOC.hp}% gezondheid in ${DOC.dur} s, daarna ${DOC.cd/60} min wachten.`:`In 5 minuten naar 0% hitte.${S.wanted?' Volledig uitzitten haalt je van de gezochtlijst.':''}`;
 return `<article class="va ${active?'on':''}" style="--c:${C[0]}">
  <div class="va-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle id="ring_${k}" cx="60" cy="60" r="52" class="fg" style="stroke-dasharray:${RING};stroke-dashoffset:${off}"/></svg>
   <div class="va-c"><b id="ringT_${k}">${center}</b><span>${sub}</span></div>${k==='doc'?'<svg class="ecg" viewBox="0 0 120 30"><path d="M0,15 L34,15 L40,15 L44,4 L50,26 L55,10 L59,15 L120,15"/></svg>':''}</div>
  <div class="va-b"><h3>${C[1]}</h3><p>${C[2]}</p>
   <div class="va-eff">${rows.map(r=>`<div><span>${r[0]}</span>${r[1].startsWith?r[1].startsWith('<b')?r[1]:`<b>${r[1]}</b>`:''}<i>→</i><em>${r[2]}</em></div>`).join('')}</div>
   <button class="btn ${active?'ghost':''}" onclick="${active?'stayStop(true)':`stayStart('${k}')`}" ${(!active&&(other||inJail()||cd||!useful))?'disabled':''}>${label}</button>
   <div class="va-note">${note}</div></div></article>`}
V.verblijf=()=>{const h=home(),hi=HOMES.indexOf(h),ri=rankIdx(S.xp);setTimeout(vbMount,0);
 const st=stay.kind?({rest:'Aan het rusten',doc:'Bij de dokter'})[stay.kind]+(S.hide?' · ondergedoken':''):S.hide?'Ondergedoken':'';
 const perks=x=>[`Rust ${x.rest} s, elke ${fmtClock(x.cd*1000)} min`,`+${x.hp}% gezondheid per rust`,x.en?`+${x.en} max. energie`:'Geen extra energie',x.heat?`-${x.heat}% hitte per rust`:null].filter(Boolean);
 return `<h1>Verblijf</h1><p class="sub">Je begint als straatrat onder de brug. Blijf op deze pagina zolang je rust, naar de dokter gaat of onderduikt: ga je weg, dan houd je alleen wat je tot dan toe had.</p>
 <section class="vb-hero ${stay.kind?'act-'+stay.kind:''}"><canvas id="vbScene" aria-label="Tafereel: ${h.n}"></canvas>
  <div class="vb-cap"><div class="label">${h.place}</div><h2>${h.n}</h2><p>${h.d}</p>
   <div class="vb-chips"><span>Rust ${h.rest} s</span><span>Elke ${fmtClock(STAY.rest.cd())}</span><span>+${h.hp+furnFx('restHp')}% gezondheid</span>${h.en?`<span>+${h.en} max. energie</span>`:''}</div></div>
  ${st?`<div class="vb-live"><i></i>${st}</div>`:''}
  <div class="vb-stats"><div><span>Energie</span><b id="vbE2">${Math.floor(S.energy)}/${EN_MAX}</b></div><div><span>Gezondheid</span><b id="vbHs">${S.hp}%</b></div><div><span>Hitte</span><b id="vbHeat">${S.heat}%</b></div></div>
 </section>
 <div class="vb-acts">${['rest','doc'].map(vbAct).join('')}${vbHideCard()}</div>
 <div class="tierhead"><h2>Inrichting</h2><span>${hi<2?'Vanaf de huurkamer kun je je woning inrichten':'Spullen verhuizen mee · elk geeft een blijvend voordeel'}</span></div>
 <div class="vb-furn">${FURN.map(f=>{const own=S.furn&&S.furn[f.id],lock=hi<f.h,afford=S.cash>=f.p;
  return `<article class="vf ${own?'own':''} ${lock?'locked':''}" style="--c:${f.col}"><div class="vf-ic">${furnIcon(f.id)}</div>
   <div class="vf-b"><h3>${f.n}</h3><p>${f.d}</p><ul>${Object.entries(f.fx).map(([k,v])=>`<li><span>${FURN_FX[k][0]}</span><b>${FURN_FX[k][1](v)}</b></li>`).join('')}</ul>
   ${own?'<div class="hstate">In huis</div>':`<button class="btn ${afford&&!lock?'':'ghost'}" onclick="act.buyFurn('${f.id}')" ${lock||!afford?'disabled':''}>${lock?'Vanaf '+HOMES[f.h].n:(!afford?'Te duur · ':'Kopen · ')+fmt(f.p)}</button>`}</div></article>`}).join('')}</div>
 <div class="tierhead"><h2>Woningmarkt</h2><span>Beter wonen = sneller rusten, vaker rusten en meer energie</span></div>
 <div class="vb-market">${HOMES.map((x,i)=>{const own=i<=hi,cur=i===hi,lock=ri<x.r,afford=S.cash>=x.p,next=i===hi+1;
  return `<article class="vm ${cur?'cur':''} ${own&&!cur?'past':''} ${lock&&!own?'locked':''}">
   <div class="vm-img"><canvas data-home="${x.id}"></canvas>${cur?'<span class="vm-stamp">Hier woon je</span>':''}${lock&&!own?`<span class="vm-lock">🔒 ${RANKS[x.r][0]}</span>`:''}</div>
   <div class="vm-b"><div class="label">${x.place}</div><h3>${x.n}</h3><div class="vm-price">${x.p?fmt(x.p):'Gratis'}</div>
    <ul>${perks(x).map(t=>`<li>${t}</li>`).join('')}</ul>
    ${own?`<div class="hstate">${cur?'Je woont hier':'Achter je gelaten'}</div>`:`<button class="btn ${next&&afford&&!lock?'':'ghost'}" onclick="act.moveHome('${x.id}')" ${lock||!afford||!next||stay.kind?'disabled':''}>${lock?'Vanaf '+RANKS[x.r][0]:!next?'Eerst de vorige':!afford?'Te duur':'Verhuizen'}</button>`}</div>
  </article>`}).join('')}</div>`};
function furnIcon(id){const P={
 plant:'<path d="M20 40h24l-3 16H23z" fill="currentColor" opacity=".55"/><path d="M32 40C32 26 22 20 14 20c0 10 8 18 18 20zm0 0c0-14 10-22 18-22 0 12-8 20-18 22zm0 0V16" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 espresso:'<rect x="16" y="12" width="32" height="10" rx="2" fill="currentColor"/><path d="M20 22h24v22H20z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M26 34h12v8a6 6 0 0 1-12 0z" fill="currentColor" opacity=".6"/><path d="M14 50h36" stroke="currentColor" stroke-width="3"/>',
 bed:'<path d="M8 44V22m0 14h48v8M56 44v-8" stroke="currentColor" stroke-width="3" fill="none"/><rect x="12" y="28" width="14" height="8" rx="3" fill="currentColor" opacity=".6"/><path d="M28 30h26v6H28z" fill="currentColor"/>',
 bokszak:'<path d="M32 6v8" stroke="currentColor" stroke-width="2.5"/><rect x="22" y="14" width="20" height="38" rx="9" fill="currentColor" opacity=".7"/><path d="M22 24h20M22 42h20" stroke="#000" stroke-opacity=".35" stroke-width="2"/>',
 aquarium:'<rect x="8" y="16" width="48" height="30" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M8 24h48" stroke="currentColor" stroke-opacity=".4"/><path d="M22 34c4-4 10-4 14 0-4 4-10 4-14 0zm14 0 5-4v8z" fill="currentColor"/><path d="M14 52h36" stroke="currentColor" stroke-width="3"/>',
 camera:'<path d="M10 20l30-6 4 14-30 6z" fill="currentColor" opacity=".7"/><circle cx="40" cy="26" r="4" fill="#000" opacity=".5"/><path d="M18 33l4 12h-8M48 30l6 2" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 kluis:'<rect x="12" y="12" width="40" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M32 23v4M32 37v4M23 32h4M37 32h4" stroke="currentColor" stroke-width="2"/>',
 bios:'<rect x="8" y="12" width="48" height="28" rx="2" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="2.5"/><path d="M28 20l10 6-10 6z" fill="currentColor"/><path d="M14 50c0-4 4-6 8-6s8 2 8 6m4 0c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" stroke-width="2.5" fill="none"/>',
 sauna:'<path d="M10 52V26l22-14 22 14v26z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 44c-3-4 3-6 0-10m8 10c-3-4 3-6 0-10m8 10c-3-4 3-6 0-10" stroke="currentColor" stroke-width="2.2" fill="none"/>',
 zen:'<circle cx="32" cy="22" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 50c4-10 14-12 20-12s16 2 20 12z" fill="currentColor" opacity=".6"/>'};
 return `<svg viewBox="0 0 64 64" aria-hidden="true">${P[id]||''}</svg>`}
Object.assign(act,{buyFurn(id){const f=FURN.find(x=>x.id===id);if(!f||(S.furn&&S.furn[id]))return;if(HOMES.indexOf(home())<f.h){toast('Dat past pas in een '+HOMES[f.h].n.toLowerCase(),'bad');return}
  if(S.cash<f.p){toast('Niet genoeg contant geld','bad');return}S.cash-=f.p;S.furn=S.furn||{};S.furn[id]=1;SFX.pop();
  toast(f.n+' staat in je '+home().n.toLowerCase()+'. '+Object.entries(f.fx).map(([k,v])=>FURN_FX[k][0].toLowerCase()+' '+FURN_FX[k][1](v)).join(', '),'lvl');log(f.n+' gekocht ('+fmt(f.p)+')','ok');addXp(Math.floor(f.p/500));save();render()},
 moveHome(id){const i=HOMES.findIndex(h=>h.id===id),cur=HOMES.indexOf(home()),x=HOMES[i];
  if(i!==cur+1||rankIdx(S.xp)<x.r||S.cash<x.p||stay.kind)return;S.cash-=x.p;S.home=id;
  SFX.big();toast('Verhuisd naar '+x.n+' ('+x.place+')','lvl');log('Verhuisd naar '+x.n+', '+x.place,'ok');addXp(Math.floor(x.p/400));save();render()}});
