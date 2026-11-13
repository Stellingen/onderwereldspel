// Verhaal: de muziek volgt de scène (G.verhaalSfeer). Volgorde: politie achter je > minispel > tijdelijk (scènes zetten dit zelf)
// > de stap van het verhaal (def.muziek) > dagdroom > de binnenruimte > nacht of dag. Speelt via G.verhaalMuziek (echte muziek);
// de chiptune (G.snd.sfeer) staat in het verhaal altijd op 'stil'.
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const BINNEN={sahara:'lounge',napoli:'napoli',thuis:'thuis',klas:'school',rijtjeshuis:'spanning'};
let tijdelijk=null,laatste=null;
const S=G.verhaalSfeer={
  zet(m){tijdelijk=m||null;kies()},           // geldt tot het einde van de cutscène of de volgende stap
  los(){tijdelijk=null;kies()},
  nu:()=>laatste,BINNEN};
function kies(){if(!G.snd||!G.snd.sfeer)return;let m=null;
  try{
    if(G.police&&G.police.active&&G.police.active())m='jacht';
    else if(document.querySelector('.h1-mg.vecht'))m='gevecht';
    else if(document.querySelector('.h1-mg.tel'))m='lounge';
    else if(tijdelijk)m=tijdelijk;
    else{const st=G.story&&G.story.steps&&G.story.huidig&&G.story.steps[G.story.huidig()];const sm=st&&st.muziek;const w=G.binnen&&G.binnen.waar&&G.binnen.waar();
      const droom=document.querySelector('#svDroom.on');
      if(droom)m='droom';
      else if(sm&&!(st.muziekBuiten&&w))m=typeof sm==='function'?sm():sm;
      else if(w&&BINNEN[w])m=BINNEN[w];}
  }catch(e){}
  // de chiptune van de Pixelstad speelt in het verhaal nooit: echte muziek via G.verhaalMuziek (verhaal-muziek.js)
  if(G.snd.sfeerNu!=='stil')G.snd.sfeer('stil');
  if(m!==laatste||!G.verhaalMuziek||G.verhaalMuziek.nu===undefined){laatste=m;G.verhaalMuziek&&G.verhaalMuziek.zet(m)}}
const iv=setInterval(()=>{if(!G.ready||!G.story)return;clearInterval(iv);
  if(G.cut&&G.cut.onEnd)G.cut.onEnd.push(()=>{tijdelijk=null});
  if(G.story.onStep)G.story.onStep.push(()=>{tijdelijk=null});
  setInterval(kies,400)},200);
})();
