// Pixelstad (/stad): de keuze tussen Stad en Verhaal.
// - De eerste keer in de Pixelstad: kies Stad (zoals altijd, je eigen karakter) of Verhaal (De Bezorger, je speelt Luca op /verhaal).
// - Daarna: een app "Verhaal" op je telefoon en een ingang bij Lounge Sahara aan de Boulevard (naast de shishakavel).
// Het verhaal zelf draait op een eigen pagina met een eigen stad; hier verandert verder niets aan de Stad.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,$s=id=>document.getElementById(id);
const KEY='stad_keuze';
const ART='<svg viewBox="0 0 120 50" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
function artStad(){return ART+'<rect width="120" height="50" fill="#141a2a"/>'+[[6,18,14,32],[22,10,16,40],[40,22,12,28],[54,6,18,44],[74,16,14,34],[90,12,20,38]].map(([x,y,w,h],i)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${['#2a3140','#323a4c','#262c3a'][i%3]}"/>`+Array.from({length:Math.floor(h/6)},(_,r)=>`<rect x="${x+3}" y="${y+3+r*6}" width="3" height="2" fill="${(r+i)%3?'#ffd98a':'#3a4458'}"/><rect x="${x+w-6}" y="${y+3+r*6}" width="3" height="2" fill="${(r+i)%2?'#3a4458':'#ffd98a'}"/>`).join('')).join('')+'<rect y="46" width="120" height="4" fill="#0c0e14"/></svg>'}
function artVerhaal(){return ART+'<rect width="120" height="50" fill="#1a0f22"/><rect x="0" y="34" width="120" height="16" fill="#0e0a14"/><rect x="18" y="8" width="44" height="26" fill="#2a1834"/><rect x="22" y="12" width="36" height="7" fill="#b45cff"/><rect x="24" y="14" width="32" height="3" fill="#ffd35a"/><rect x="34" y="22" width="12" height="12" fill="#120a18"/>'
  +'<rect x="76" y="30" width="16" height="2" fill="#2a2c30"/><circle cx="78" cy="38" r="5" fill="none" stroke="#e8e4da" stroke-width="1.5"/><circle cx="96" cy="38" r="5" fill="none" stroke="#e8e4da" stroke-width="1.5"/><rect x="80" y="30" width="14" height="3" fill="#c0261e"/><rect x="84" y="21" width="6" height="9" fill="#c0261e"/><rect x="85" y="16" width="5" height="5" fill="#c8956a"/><rect x="84" y="15" width="7" height="3" fill="#1a1410"/><rect x="92" y="25" width="7" height="5" fill="#f1efe9"/></svg>'}
function naarVerhaal(){try{G.savePos&&G.savePos();localStorage.setItem(KEY,'verhaal')}catch(e){}location.href='/verhaal'}
function kies(force){let k=null;try{k=localStorage.getItem(KEY)}catch(e){}if(k&&!force)return;if(document.querySelector('.sk-ov'))return;
  const ov=document.createElement('div');ov.className='sk-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Stad of Verhaal');
  ov.innerHTML=`<div class="sk-box"><small>Pixelstad · nieuw</small><h2>Stad of Verhaal?</h2>
   <div class="sk-opts"><button class="sk-o" type="button" data-k="stad">${artStad()}<span class="sk-t"><b>Stad</b><span>Zoals je gewend bent: je eigen karakter, dezelfde voortgang als het klikspel. Klussen, kluizen, achtervolgingen.</span></span></button>
   <button class="sk-o" type="button" data-k="verhaal">${artVerhaal()}<span class="sk-t"><b>Verhaal: De Bezorger</b><span>Je speelt Luca, 16, pizzabezorger. Eigen stad, eigen geld, eigen klok. Seizoen 1 is gratis.</span></span></button></div>
   <p class="sk-n">Het verhaal kun je altijd beginnen of hervatten bij Lounge Sahara aan de Boulevard of via je telefoon.</p></div>`;
  document.body.appendChild(ov);G.pause&&G.pause();
  ov.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;try{localStorage.setItem(KEY,b.dataset.k)}catch(x){}ov.remove();if(b.dataset.k==='verhaal')naarVerhaal();else G.resume&&G.resume()})}
G.keuze={open:()=>kies(true),verhaal:naarVerhaal};
const IC='<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="2" width="12" height="12" fill="currentColor"/><rect x="4" y="4" width="8" height="2" fill="#0008"/><rect x="4" y="7" width="8" height="1" fill="#0006"/><rect x="4" y="9" width="6" height="1" fill="#0006"/><rect x="4" y="11" width="7" height="1" fill="#0006"/></svg>';
const wait=setInterval(()=>{if(!G.ready||!G.phone||!G.phone.add||!G.spot)return;clearInterval(wait);
  G.phone.add({k:'bezorger',n:'De Bezorger',ic:IC,c:'#ff4fd8',after:'kaart',render:(scr,head)=>{scr.innerHTML=head('Verhaal','De Bezorger · Seizoen 1')+`<div class="sd-p2-list"><div class="sd-p2-dag"><b>De Bezorger</b><span>Je speelt Luca, 16, pizzabezorger in de Westbuurt. Een eigen stad, eigen geld en een eigen klok: je klikspel-karakter merkt er niets van.</span><button class="btn sm" data-vk="go">${(()=>{try{return S.story&&S.story.welkom?'Hervat het verhaal':'Begin het verhaal'}catch(e){return 'Naar het verhaal'}})()}</button></div><p class="sd-p2-note">Ook te beginnen of te hervatten bij Lounge Sahara aan de Boulevard.</p></div>`},
    click:t=>{if(t.closest('[data-vk]')){naarVerhaal();return true}return false},badge:()=>0});
  // de ingang bij Lounge Sahara (Boulevard, naast de shishakavel): een bord met neon
  try{const p=M.nearestWalk(256,509,6)||{x:256,z:509};const m=K.model([[.12,2.6,.12,0,1.3,0,'#2a2c30'],[1.9,.9,.14,0,2.75,0,'#1a0f22'],[1.7,.12,.16,0,3.12,0,'#b45cff',1],[1.7,.08,.16,0,2.4,0,'#b45cff',1],[1.3,.3,.17,0,2.76,0,'#ffd35a',1]]);
    m.position.set(p.x+1.2,0,p.z-1.1);G.scene().add(m);const sg=K.sign('SAHARA','#ffd35a','#1a0f22','#b45cff',.42);sg.position.set(p.x+1.2,2.76,p.z-1.01);G.scene().add(sg);
    G.spot({k:'sahara',x:p.x,z:p.z,r:2.4,n:'Lounge Sahara',sub:'Verhaal: De Bezorger',col:'#ff4fd8',h:2.4,prio:1,act:()=>kies(true),dot:'#ff4fd8',dotR:120,map:{n:'Lounge Sahara · Verhaal',ic:K.ic.star,c:'#ff4fd8',pri:2}})}catch(e){console.error(e)}
  setTimeout(()=>kies(false),1200)},400);
})();
