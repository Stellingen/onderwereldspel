// iPhone: twee keer snel tikken zoomt niet in. Knijpen met twee vingers blijft werken, en de tweede tik telt gewoon als klik.
// (CSS touch-action: manipulation doet dit al in de meeste browsers; dit vangt de gevallen op die iOS toch laat zoomen,
//  zoals een knop die tijdens het draaien even uitgeschakeld is.)
(function(){
  var last=0,lx=0,ly=0,sx=0,sy=0,multi=false;
  document.addEventListener('touchstart',function(e){multi=e.touches.length>1;if(!multi){sx=e.touches[0].clientX;sy=e.touches[0].clientY}},{passive:true});
  document.addEventListener('touchend',function(e){
    if(multi||e.touches.length||e.changedTouches.length!==1)return;
    var t=e.changedTouches[0],x=t.clientX,y=t.clientY,now=e.timeStamp||Date.now();
    if(Math.abs(x-sx)>12||Math.abs(y-sy)>12)return; // dit was scrollen, geen tik
    var quick=now-last<380&&Math.abs(x-lx)<45&&Math.abs(y-ly)<45;
    last=now;lx=x;ly=y;
    if(!quick)return;
    var el=e.target&&e.target.closest?e.target:null;if(!el)return;
    if(el.closest('input,textarea,select,[contenteditable="true"]'))return; // tekst selecteren in invulvelden mag
    e.preventDefault(); // geen inzoomen
    var c=el.closest('button,a,label,summary,[onclick],[role="button"]');
    if(c&&!c.disabled&&!c.hasAttribute('disabled'))c.click(); // de tik telt wel
    last=0; // een derde tik begint weer opnieuw
  },{passive:false});
})();
