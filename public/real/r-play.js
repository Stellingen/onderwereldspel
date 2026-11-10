// Speelbare beta van de realistische stad: rondlopen met je karakter, camera achter je of van boven, tijd van de dag en kwaliteit.
// Nog geen klussen, gesprekken of verkeer: dit is om de stijl en de besturing te testen. Er wordt niets opgeslagen in je spel.
export function startPlay(o){const {THREE,M,S,scene,cam,renderer,comp,frame,G,dl,water,makePerson,LOOKS}=o;
  const P={x:S.px,z:S.pz,ry:S.pry,v:0,ph:0};
  // karakter: acht loopstanden en één stilstaand, steeds één zichtbaar
  const body=new THREE.Group(),poses=[];for(let i=0;i<8;i++){const g=makePerson(LOOKS[0],{pose:'loop',ph:i/8*Math.PI*2});g.visible=false;body.add(g);poses.push(g)}
  const stand=makePerson(LOOKS[0],{pose:'sta'});body.add(stand);scene.add(body);
  // besturing
  const K={};let yaw=P.ry+Math.PI,top=false,dist=5.6,jx=0,jy=0,run=false;try{top=localStorage.getItem('real_cam')==='boven'}catch(e){}
  addEventListener('keydown',e=>{if(e.target&&/input|textarea/i.test(e.target.tagName))return;K[e.key.toLowerCase()]=1;if(e.key.toLowerCase()==='c')setTop(!top);if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))e.preventDefault()});
  addEventListener('keyup',e=>{K[e.key.toLowerCase()]=0});addEventListener('blur',()=>{for(const k in K)K[k]=0});
  const cv=renderer.domElement;let drag=null;const touches={};
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);if(e.pointerType==='touch'){touches[e.pointerId]={x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,stick:e.clientX<innerWidth*.5};if(touches[e.pointerId].stick)stickShow(e.clientX,e.clientY)}else drag={x:e.clientX}});
  cv.addEventListener('pointermove',e=>{if(e.pointerType==='touch'){const t=touches[e.pointerId];if(!t)return;if(t.stick){const dx=e.clientX-t.x0,dy=e.clientY-t.y0,m=Math.hypot(dx,dy),k=Math.min(1,m/56);jx=m?dx/m*k:0;jy=m?dy/m*k:0;run=m>84;stickMove(jx,jy)}else{yaw-=(e.clientX-t.x)*.006;t.x=e.clientX}}else if(drag){yaw-=(e.clientX-drag.x)*.005;drag.x=e.clientX}});
  const up=e=>{const t=touches[e.pointerId];if(t&&t.stick){jx=jy=0;run=false;stickHide()}delete touches[e.pointerId];drag=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{dist=Math.max(3.2,Math.min(top?60:11,dist+(e.deltaY>0?.6:-.6)*(top?3:1)));e.preventDefault()},{passive:false});
  // schermlaag
  const ui=document.getElementById('ui');ui.innerHTML=`<div class="rb-top"><span class="rb-tag">BETA</span><b>Realistische stad</b><small id="rbWijk"></small></div>
   <div class="rb-btns"><button id="rbCam"></button><button id="rbTijd"></button><button id="rbKw"></button><a href="/stad" class="rb-l">Pixelstad</a><a href="/game" class="rb-l">Klikspel</a></div>
   <div class="rb-hint" id="rbHint"><b>Vroege test.</b> Je kunt rondlopen en de stijl bekijken. Klussen, gesprekken en verkeer werken hier nog niet, en er wordt niets opgeslagen.<br><span class="rb-pc">WASD of pijltjes lopen · Shift rennen · muis slepen of Q/E draaien · C camera</span><span class="rb-mob">Links slepen om te lopen · rechts slepen om te draaien</span><button id="rbOk">Begrepen</button></div>
   <div class="rb-stick" id="rbStick" hidden><i></i></div><div class="rb-load" id="rbLoad" hidden><span>Stad laden…</span></div>`;
  const $=id=>document.getElementById(id),TN={dag:'Dag',goud:'Gouden uur',nacht:'Nacht',regen:'Regen'},TL=['dag','goud','nacht','regen'];
  function setTop(v){top=v;dist=top?30:5.6;try{localStorage.setItem('real_cam',top?'boven':'achter')}catch(e){}$('rbCam').textContent='Camera: '+(top?'van boven':'achter je')}
  setTop(top);$('rbTijd').textContent='Tijd: '+TN[S.time];$('rbKw').textContent='Kwaliteit: '+(S.hoog?'hoog':'snel');
  const reload=extra=>{$('rbLoad').hidden=false;const q=new URLSearchParams({x:P.x.toFixed(1),z:P.z.toFixed(1),ry:P.ry.toFixed(2)});Object.keys(extra||{}).forEach(k=>q.set(k,extra[k]));setTimeout(()=>location.replace(location.pathname+'?'+q),60)};
  $('rbCam').onclick=()=>setTop(!top);
  $('rbTijd').onclick=()=>{const n=TL[(TL.indexOf(S.time)+1)%TL.length];try{localStorage.setItem('real_tijd',n)}catch(e){}reload({time:n})};
  $('rbKw').onclick=()=>{try{localStorage.setItem('real_kwal',S.hoog?'snel':'hoog')}catch(e){}reload()};
  try{if(localStorage.getItem('real_hint'))$('rbHint').hidden=true}catch(e){}$('rbOk').onclick=()=>{$('rbHint').hidden=true;try{localStorage.setItem('real_hint','1')}catch(e){}};
  const st=$('rbStick');function stickShow(x,y){st.hidden=false;st.style.left=x+'px';st.style.top=y+'px';stickMove(0,0)}function stickMove(x,y){st.firstElementChild.style.transform=`translate(${x*40}px,${y*40}px)`}function stickHide(){st.hidden=true}
  addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight,false);comp.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
  // lus
  let last=performance.now(),wijkT=0,gone=false,fpsT=0,fpsN=0;const tgt=new THREE.Vector3(),want=new THREE.Vector3();
  function step(now){requestAnimationFrame(step);const dt=Math.min(.05,(now-last)/1000);last=now;if(gone)return;
    if(K.q)yaw+=dt*1.9;if(K.e)yaw-=dt*1.9;
    let ix=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0)+jx,iy=(K.s||K.arrowdown?1:0)-(K.w||K.arrowup?1:0)+jy;const m=Math.hypot(ix,iy);
    if(m>.12){ix/=Math.max(1,m);iy/=Math.max(1,m);
      // richting ten opzichte van de camera: vooruit = van de camera af
      const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),wx=rx*ix-fx*iy,wz=rz*ix-fz*iy,sp=(K.shift||run?6.4:3.1)*Math.min(1,m);
      const nx=P.x+wx*sp*dt,nz=P.z+wz*sp*dt;if(M.canStand(nx,P.z,.35))P.x=nx;if(M.canStand(P.x,nz,.35))P.z=nz;
      let d=Math.atan2(wx,wz)-P.ry;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;P.ry+=d*Math.min(1,dt*10);P.v=sp;P.ph+=dt*sp*2.05}
    else P.v=0;
    const moving=P.v>.2,idx=Math.floor(((P.ph%(Math.PI*2))+Math.PI*2)%(Math.PI*2)/(Math.PI*2)*8)%8;poses.forEach((g,i)=>g.visible=moving&&i===idx);stand.visible=!moving;
    const y=G.hAt(P.x,P.z);body.position.set(P.x,y,P.z);body.rotation.y=P.ry;
    // camera
    if(top){tgt.set(P.x,y+1,P.z);const p=.98;want.set(P.x+Math.sin(yaw)*Math.cos(p)*dist,y+1+Math.sin(p)*dist,P.z+Math.cos(yaw)*Math.cos(p)*dist)}
    else{tgt.set(P.x,y+1.55,P.z);let d=dist;const sx=Math.sin(yaw),sz=Math.cos(yaw);
      // niet door een muur heen: dichterbij komen tot de camera vrij staat
      for(let k=0;k<12&&d>1.2;k++){const cx=Math.floor(P.x+sx*d),cz=Math.floor(P.z+sz*d);if(cx<0||cz<0||cx>=M.W||cz>=M.H||!M.solid[cz*M.W+cx]||isLow(cx,cz))break;d-=.45}
      want.set(P.x+sx*d,y+1.55+d*.3,P.z+sz*d)}
    cam.position.lerp(want,Math.min(1,dt*9));cam.lookAt(tgt);
    dl.target.position.set(P.x,0,P.z);dl.position.set(P.x+o.sun.x*260,o.sun.y*260,P.z+o.sun.z*260);
    water.material.uniforms.time.value+=dt*.6;
    frame();
    // dicht bij de rand van het gebouwde stuk: opnieuw laden rond je nieuwe plek
    if(Math.hypot(P.x-S.focus[0],P.z-S.focus[1])>S.R-68){gone=true;reload()}
    wijkT-=dt;if(wijkT<0){wijkT=1;const w=M.districtAt?M.districtAt(P.x,P.z):null;$('rbWijk').textContent=(w&&(w.n||w))||''}
    fpsN++;fpsT+=dt;if(fpsT>2){window.__fps=Math.round(fpsN/fpsT);fpsN=0;fpsT=0}}
  // lage dingen (bankjes, hagen) blokkeren de camera niet: alleen gebouwen tellen
  const B=new Uint8Array(M.W*M.H);M.buildings.forEach(b=>{for(let z=b.z0;z<b.z1;z++)for(let x=b.x0;x<b.x1;x++)if(x>=0&&z>=0&&x<M.W&&z<M.H)B[z*M.W+x]=1});const isLow=(x,z)=>!B[z*M.W+x];
  cam.position.set(P.x+Math.sin(yaw)*dist,3,P.z+Math.cos(yaw)*dist);window.__P=P;requestAnimationFrame(step)}
