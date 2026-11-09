// Pixelstad: gedeelde bouwstenen voor de menu's. Pixelportretten (jij, voorbijgangers, de notaris), tekst die letter voor letter
// verschijnt (met een piepje), kleine pixelplaatjes van gebouwen, en een dialoogvenster met keuzeknoppen (geen nummers).
(function(){
'use strict';
const G=STAD,$s=id=>document.getElementById(id);
const E=s=>typeof esc==='function'?esc(s):String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K={E};G.kit=K;
const shade=(h,k)=>{const n=parseInt(String(h).slice(1),16);if(!Number.isFinite(n))return h;const r=Math.min(255,(n>>16&255)*k|0),g=Math.min(255,(n>>8&255)*k|0),b=Math.min(255,(n&255)*k|0);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)};
K.shade=shade;
/* ---------- portret (24×24 pixels): hoofd en schouders ---------- */
// look: {skin,hair,top,arm,hat:'none|cap|beanie|hat|mask|bald',hatC,tie,glasses,beard,bg}; mood: 'neutraal|blij|bang|boos'
K.portrait=function(look,mood,cv){cv=cv||document.createElement('canvas');cv.width=cv.height=24;const c=cv.getContext('2d'),L=look||{};
  const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};const sk=L.skin||'#d9a27a',top=L.top||'#30353e',hat=L.hat||'none',hc=hat==='none'||hat==='bald'?(L.hair||'#2a1d14'):(L.hatC||'#2a2c30');
  R(0,0,24,24,L.bg||'#1a1d23');R(0,0,24,1,shade(L.bg||'#1a1d23',1.5));
  // schouders en romp
  R(3,18,18,6,top);R(2,20,20,4,top);R(3,18,18,1,shade(top,1.25));
  if(L.tie){R(10,18,4,6,'#f1efe9');R(11,19,2,5,L.tie)}else R(10,18,4,2,shade(sk,.9));
  if(L.chain)R(8,20,8,1,'#e8b923');
  // nek en hoofd
  R(10,15,4,3,shade(sk,.85));R(7,5,10,11,sk);R(6,8,1,4,sk);R(17,8,1,4,sk);R(7,15,10,1,shade(sk,.85));
  // ogen en mond per stemming
  const eye=hat==='mask'?'#e8e4da':'#15161a';
  if(mood==='bang'){R(9,9,2,2,'#fff');R(13,9,2,2,'#fff');R(9,10,1,1,eye);R(14,10,1,1,eye);R(11,13,2,2,'#4a1d16')}
  else if(mood==='boos'){R(8,8,3,1,shade(L.hair||'#2a1d14',1));R(13,8,3,1,shade(L.hair||'#2a1d14',1));R(9,10,2,1,eye);R(13,10,2,1,eye);R(10,13,4,1,'#4a1d16')}
  else if(mood==='blij'){R(9,10,2,1,eye);R(13,10,2,1,eye);R(10,13,4,1,'#4a1d16');R(9,12,1,1,'#4a1d16');R(14,12,1,1,'#4a1d16')}
  else{R(9,9,2,2,eye);R(13,9,2,2,eye);R(10,13,4,1,shade(sk,.6))}
  R(11,11,2,1,shade(sk,.8));
  if(L.glasses){R(8,9,4,2,'#111');R(12,9,4,2,'#111');R(8,9,1,1,'#3a3a44')}
  if(L.beard){R(7,13,10,3,L.hair||'#2a1d14');R(10,13,4,1,'#4a1d16')}
  if(L.grill)R(10,13,4,1,'#e8b923');
  // haar of hoofddeksel
  if(hat==='mask'){R(7,4,10,12,hc);R(8,9,8,3,sk);R(9,9,2,2,'#e8e4da');R(13,9,2,2,'#e8e4da');R(9,10,1,1,'#15161a');R(14,10,1,1,'#15161a');R(10,13,4,1,shade(hc,.6))}
  else if(hat==='cap'){R(7,3,10,4,hc);R(6,5,12,2,hc);R(13,6,7,1,shade(hc,.75))}
  else if(hat==='hat'){R(4,6,16,1,hc);R(7,2,10,4,hc);R(7,5,10,1,shade(hc,.6))}
  else if(hat==='beanie'){R(7,2,10,6,hc);R(6,6,12,2,shade(hc,.8));R(11,1,2,1,hc)}
  else if(hat==='bald'){R(7,5,10,1,shade(sk,1.1))}
  else{R(7,3,10,4,hc);R(6,5,2,5,hc);R(16,5,2,5,hc);if(L.long){R(5,8,2,9,hc);R(17,8,2,9,hc)}}
  return cv};
/* ---------- tekst die verschijnt ---------- */
K.type=function(el,text,o){o=o||{};const sp=o.speed||(G.textSpeed||40);let i=0,done=false,res;const pr=new Promise(r=>res=r);el.textContent='';
  const t=setInterval(()=>{if(done)return;i+=Math.max(1,Math.round(sp/40));el.textContent=text.slice(0,i);if(i%3===0&&G.snd&&o.blip!==false)G.snd.fx('blip');if(i>=text.length){fin()}},1000/40);
  function fin(){if(done)return;done=true;clearInterval(t);el.textContent=text;res()}
  return {skip:fin,get done(){return done},then:f=>pr.then(f)}};
/* ---------- gebouwplaatje (32×32) ---------- */
const STC={brick:'#8a3b2a',brick2:'#7a4a32',brick3:'#6a3a2a',plaster:'#d8cdb5',glass:'#5a8ab0',glass2:'#3a6a8a',villa:'#e8e0cc',kraak:'#6a6458',beach2:'#d8b878',shop:'#c9b490',
  boutique:'#2f2f36',casino:'#5a1f5a',pub:'#4a3324',club:'#24243a',ware:'#7a7d80',ware2:'#5a6066',garage:'#8a8c90',concrete:'#8a8a86'};
K.thumb=function(o,cv){cv=cv||document.createElement('canvas');cv.width=cv.height=32;const c=cv.getContext('2d'),R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  R(0,0,32,32,o.night?'#141a2a':'#9cc4dc');R(0,26,32,6,o.water?'#1f4f6e':'#4c8c3e');
  if(!o.fl){// lege kavel: bomen en een bordje
    [[6,18],[14,15],[24,19]].forEach(([x,y],i)=>{R(x+2,y+5,2,6,'#5a3d26');R(x,y,6,6,['#2f6e2a','#3c8a34','#4f7a26'][i]);R(x+1,y-2,4,2,['#2f6e2a','#3c8a34','#4f7a26'][i])});
    R(17,20,8,5,o.biz?'#c0261e':'#2b7a55');R(20,25,1,2,'#6a4a2c');R(18,22,6,1,'#fff');return cv}
  const col=STC[o.st]||'#8a8a86',fl=Math.min(12,o.fl),w=o.w||(o.tall?12:o.wide?24:16),fh=Math.max(1.6,Math.min(3,22/fl)),h=Math.round(fl*fh),x0=Math.round(16-w/2),y0=26-h;
  if(o.boat){R(6,22,20,4,'#3a2a20');R(8,18,14,4,'#e8e4da');R(10,19,3,2,'#ffd98a');R(16,19,3,2,'#ffd98a');return cv}
  R(x0,y0,w,h,col);R(x0,y0,1,h,shade(col,1.2));R(x0+w-1,y0,1,h,shade(col,.7));
  for(let f=0;f<fl;f++){const y=Math.round(y0+f*fh+1);for(let x=x0+2;x<x0+w-2;x+=3)R(x,y,2,Math.max(1,Math.round(fh-1.4)),(o.night||((x*7+f*13)%5===0))?'#ffd98a':'#2a3a4c')}
  if(o.roof==='gable'){for(let k=0;k<5;k++)R(x0-1+k,y0-1-k,w+2-2*k,1,'#7a2f22')}else R(x0-1,y0-1,w+2,1,shade(col,.6));
  R(15,23,3,3,'#3a2418');if(o.sign)R(x0+2,y0+h-6,w-4,2,o.sign);
  if(o.pool){R(2,27,6,2,'#2f8fd6')}
  if(o.building){R(x0-2,y0,1,h,'#c9a227');R(x0+w+1,y0,1,h,'#c9a227');for(let y=y0;y<26;y+=3)R(x0-2,y,w+4,1,'#c9a227')}
  return cv};
/* ---------- dialoogvenster onderin (portret, tekst, keuzes) ---------- */
// K.dialog({name,role,look,mood,lines:[...],choices:[{t,ic,risk,dis,why,f}],onClose}) — de wereld loopt gewoon door
const box=document.createElement('div');box.className='sd-dlg';box.id='sdDlg';box.hidden=true;box.setAttribute('role','dialog');
box.innerHTML=`<div class="sd-dlg-in"><canvas class="sd-dlg-por" id="sdDlgPor" width="24" height="24"></canvas><div class="sd-dlg-body"><div class="sd-dlg-n"><b id="sdDlgN"></b><small id="sdDlgR"></small></div>
  <p class="sd-dlg-t" id="sdDlgT" aria-live="polite"></p><div class="sd-dlg-c" id="sdDlgC" role="menu"></div></div><button class="sd-dlg-x" id="sdDlgX" aria-label="Sluiten">×</button></div>`;
document.body.appendChild(box);
let D=null,tw=null,sel=0;
function render(){if(!D)return;const cs=$s('sdDlgC');const ch=D.choices||[];
  cs.innerHTML=ch.map((c,i)=>`<button class="sd-dlg-o${i===sel?' on':''}${c.dis?' dis':''}" data-i="${i}" role="menuitem" ${c.dis?'aria-disabled="true"':''}>${c.ic?`<i>${c.ic}</i>`:''}<span>${E(c.t)}${c.why&&c.dis?`<small>${E(c.why)}</small>`:c.sub?`<small>${E(c.sub)}</small>`:''}</span>${c.risk?`<em class="r${c.risk}" title="Risico">${'●'.repeat(c.risk)}${'○'.repeat(3-c.risk)}</em>`:''}</button>`).join('');
  cs.hidden=!(tw&&tw.done)}
K.dialog=function(d){D=d;sel=Math.max(0,(d.choices||[]).findIndex(c=>!c.dis));box.hidden=false;box.classList.remove('go');void box.offsetWidth;box.classList.add('go');
  K.portrait(d.look,d.mood,$s('sdDlgPor'));$s('sdDlgN').textContent=d.name||'';$s('sdDlgR').textContent=d.role||'';box.style.setProperty('--c',d.col||'#ff7a1a');
  const line=Array.isArray(d.lines)?d.lines[0]:d.lines||'';tw=K.type($s('sdDlgT'),line);render();tw.then(()=>render());if(G.snd)G.snd.fx('open');return K};
K.say=function(text,mood,choices){if(!D)return;if(mood){D.mood=mood;K.portrait(D.look,mood,$s('sdDlgPor'))}if(choices)D.choices=choices;tw=K.type($s('sdDlgT'),text);render();tw.then(()=>render())};
K.dialogOpen=()=>!!D;
K.closeDialog=function(quiet){if(!D)return;const d=D;D=null;box.hidden=true;if(tw)tw.skip();if(!quiet&&G.snd)G.snd.fx('close');d.onClose&&d.onClose()};
function pickChoice(i){if(!D)return;if(tw&&!tw.done){tw.skip();render();return}const c=(D.choices||[])[i];if(!c)return;if(c.dis){G.toast&&G.toast(c.why||'Kan nu niet','bad');return}G.snd&&G.snd.fx('click');c.f&&c.f()}
box.addEventListener('click',e=>{if(e.target.closest('#sdDlgX')){K.closeDialog();return}const b=e.target.closest('[data-i]');if(b){pickChoice(+b.dataset.i);return}if(tw&&!tw.done){tw.skip();render()}});
// toetsen: pijltjes of W/S kiezen, E/Spatie/Enter bevestigen, Esc sluit
addEventListener('keydown',e=>{if(!D)return;const k=e.key.toLowerCase(),n=(D.choices||[]).length;
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();K.closeDialog();return}
  if(['arrowdown','s','arrowup','w'].includes(k)&&n){e.preventDefault();e.stopImmediatePropagation();const d=k==='arrowdown'||k==='s'?1:-1;for(let j=0;j<n;j++){sel=(sel+d+n)%n;if(!D.choices[sel].dis)break}render();G.snd&&G.snd.fx('tab');return}
  if((k==='e'||k===' '||k==='enter')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();pickChoice(sel)}},true);
/* ---------- iconen (pixelstijl, 16×16 in SVG) ---------- */
const P=(d,c)=>`<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${d.split(';').map(r=>{const [x,y,w,h,f]=r.split(',');return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f||c||'currentColor'}"/>`}).join('')}</svg>`;
K.ic={
  talk:P('2,3,12,8;4,11,3,2;5,13,1,1;4,6,2,1,#0008;7,6,2,1,#0008;10,6,2,1,#0008'),
  rob:P('1,6,9,3;10,5,4,5;12,10,2,4;3,9,2,2,#0008'),
  money:P('1,4,14,8;3,6,10,4,#0005;7,6,2,4'),
  tip:P('7,1,2,2;5,3,6,6;6,9,4,2;6,12,4,2'),
  walk:P('7,1,3,3;6,5,4,5;5,10,2,5;9,10,2,5;3,6,3,2;10,6,3,2'),
  home:P('2,7,12,8;1,6,14,2;3,4,10,2;5,2,6,2;7,10,3,5,#0008'),
  door:P('4,1,8,14;5,2,6,13,#0006;9,8,1,1'),
  build:P('2,12,12,3;3,3,2,9;3,3,10,2;11,3,2,4;7,7,3,3'),
  up:P('7,2,2,12;4,5,8,2;5,4,6,1;6,3,4,1'),
  sell:P('1,6,10,7;11,8,4,3;3,8,6,3,#0005'),
  key:P('2,5,6,6;4,7,2,2,#0008;8,7,7,2;12,9,2,3'),
  route:P('2,12,3,3;11,1,3,3;3,10,2,2;5,8,2,2;7,6,2,2;9,4,2,2'),
  bag:P('3,5,10,10;5,2,6,2;5,4,1,1;10,4,1,1;3,8,10,1,#0005'),
  hand:P('3,6,10,8;3,2,2,5;6,1,2,5;9,1,2,5;12,3,2,5'),
  no:P('2,2,12,12;4,4,8,8,#0008;5,7,6,2'),
  photo:P('1,4,14,10;3,3,4,1;5,6,6,6,#0008;7,8,2,2'),
  music:P('5,2,9,2;5,2,2,10;12,2,2,8;2,10,5,4;9,8,5,4'),
  eye:P('1,6,14,4;3,4,10,2;3,10,10,2;6,6,4,4,#0008;7,7,2,2'),
  scare:P('3,2,10,9;5,11,2,3;9,11,2,3;5,5,2,2,#0008;9,5,2,2,#0008;6,8,4,1,#0008'),
  hide:P('1,8,14,7;2,6,12,2;4,9,8,1,#0005'),
  star:P('7,1,2,4;1,6,14,3;4,9,3,3;9,9,3,3;3,12,3,3;10,12,3,3'),
  gift:P('2,6,12,9;1,4,14,3;7,4,2,11,#0006;5,1,2,3;9,1,2,3')};
})();
