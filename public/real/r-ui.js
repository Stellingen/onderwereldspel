// Schermlaag voor de voorbeelden: een strak HUD (speelbeeld) en een gespreksvenster met een portret van dichtbij.
export function buildUI(S,portrait){const ui=document.getElementById('ui');const st=document.createElement('style');st.textContent=`
#ui{position:fixed;inset:0;pointer-events:none;font:500 15px/1.3 "Inter","Segoe UI",system-ui,Arial,sans-serif;color:#f4f1ea}
.g{background:rgba(14,16,20,.62);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.35)}
.card{position:absolute;left:28px;top:26px;padding:16px 18px;width:300px}
.card b{font:800 20px/1 inherit;letter-spacing:.01em}.card small{display:block;margin-top:4px;color:#b9b4a8;font-size:12.5px;letter-spacing:.08em;text-transform:uppercase}
.money{font:800 28px/1 inherit;color:#59e09a;margin:14px 0 12px}.bar{height:7px;border-radius:5px;background:rgba(255,255,255,.14);margin:7px 0;overflow:hidden}.bar i{display:block;height:100%;border-radius:5px}
.row{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#cfcabd}.row .bar{flex:1}
.mm{position:absolute;right:28px;top:26px;width:176px;height:176px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,.25);box-shadow:0 12px 40px rgba(0,0,0,.4)}
.mm canvas{width:100%;height:100%}.wijk{position:absolute;right:28px;top:214px;width:176px;text-align:center;padding:7px 0;font:700 12.5px/1 inherit;letter-spacing:.14em;text-transform:uppercase;border-radius:10px}
.btns{position:absolute;right:226px;top:30px;display:flex;gap:10px}.btns span{padding:11px 16px;font:700 13px/1 inherit;border-radius:12px}
.hint{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);padding:10px 16px;font:700 14px/1 inherit;border-radius:12px;display:flex;gap:10px;align-items:center}.hint kbd{background:#f4f1ea;color:#15161a;border-radius:6px;padding:4px 8px;font:800 12px/1 inherit}
.dlg{position:absolute;left:50%;bottom:34px;transform:translateX(-50%);width:min(900px,calc(100vw - 60px));display:grid;grid-template-columns:210px 1fr;gap:22px;padding:20px;border-radius:20px}
.dlg img{width:210px;height:250px;object-fit:cover;border-radius:14px;display:block}
.dlg h3{margin:2px 0 0;font:800 26px/1.05 inherit}.dlg em{font-style:normal;color:#7fd1c7;font:700 12.5px/1 inherit;letter-spacing:.12em;text-transform:uppercase}
.dlg p{margin:12px 0 14px;font-size:18px;line-height:1.4;color:#f4f1ea}.band{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:12.5px;color:#b9b4a8}.band .bar{width:150px;margin:0}
.opt{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:11px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);margin-top:8px;font:600 15.5px/1.2 inherit}.opt.on{background:rgba(255,160,60,.18);border-color:rgba(255,170,80,.7)}
.opt small{color:#b9b4a8;font-weight:500;font-size:12.5px}`;document.head.appendChild(st);
  if(S.ui==='hud'){ui.innerHTML=`<div class="g card"><b>Don_Vito</b><small>Kapitein · Straatnaam 3</small><div class="money">€ 8.328.516</div>
     <div class="row">Energie<div class="bar"><i style="width:82%;background:#f2c230"></i></div>178</div><div class="row">Gezondheid<div class="bar"><i style="width:100%;background:#ff5a6a"></i></div>100</div></div>
    <div class="btns"><span class="g">Emote</span><span class="g">Kaart</span><span class="g">Telefoon</span></div>
    <div class="mm"><canvas id="mm" width="352" height="352"></canvas></div><div class="g wijk">Het Plein · 14:20</div>
    <div class="g hint"><kbd>E</kbd> Praten met Marieke Jansen</div>`;mini(S)}
  else if(S.ui==='gesprek'){ui.innerHTML=`<div class="g dlg"><img src="${portrait||''}" alt=""><div><em>Koffiekar op Het Plein · Goede bekende</em><h3>Luigi</h3>
     <div class="band">Band<div class="bar"><i style="width:68%;background:#7fd1c7"></i></div>36 · nog 9 tot vriend</div>
     <p>“Hé Don_Vito, goed je te zien! Het gebruikelijke? Suiker hoort er niet in, dat weet je.”</p>
     <div class="opt on"><span>Praten</span><small>Compliment, grap, de weg vragen</small></div><div class="opt"><span>Espresso · € 175</span><small>+12 energie · vaste klant 10% korting</small></div><div class="opt"><span>Iets geven</span><small>Trakteren of een cadeau</small></div></div></div>`}}
function mini(S){const M=window.STAD_MAP,c=document.getElementById('mm'),x=c.getContext('2d'),T=M.T,[fx,fz]=S.focus,sc=3.2,n=352;const col={[T.ROAD]:'#4a4d55',[T.BRIDGE]:'#4a4d55',[T.WALK]:'#8d8a84',[T.PLAZA]:'#a3957e',[T.GRASS]:'#55793a',[T.PARK]:'#55793a',[T.GARDEN]:'#55793a',[T.WATER]:'#234a5e',[T.SAND]:'#c9b98f',[T.DOCK]:'#7d7d78',[T.LOT]:'#7c7467',[T.YARD]:'#706b60'};
  for(let py=0;py<n;py+=2)for(let px=0;px<n;px+=2){const wx=Math.floor(fx+(px-n/2)/sc),wz=Math.floor(fz+(py-n/2)/sc);const t=wx<0||wz<0||wx>=M.W||wz>=M.H?T.WATER:M.ground[wz*M.W+wx];x.fillStyle=col[t]||'#666';x.fillRect(px,py,2,2)}
  x.fillStyle='#2a2d33';M.buildings.forEach(b=>{x.fillRect((b.x0-fx)*sc+n/2,(b.z0-fz)*sc+n/2,(b.x1-b.x0)*sc,(b.z1-b.z0)*sc)});
  x.fillStyle='#ff8a2a';x.beginPath();x.moveTo(n/2,n/2+24-10);x.lineTo(n/2+8,n/2+24+8);x.lineTo(n/2-8,n/2+24+8);x.fill()}
