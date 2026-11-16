// Verhaal: de muziek volgt de scène (G.verhaalSfeer). Volgorde: politie achter je > minispel > tijdelijk (scènes zetten dit zelf)
// > de stap van het verhaal (def.muziek) > dagdroom > de binnenruimte > nacht of dag. Speelt via G.verhaalMuziek (echte muziek);
// de chiptune (G.snd.sfeer) staat in het verhaal altijd op 'stil'.
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const BINNEN={sahara:'lounge',napoli:'napoli',thuis:'thuis',klas:'school',rijtjeshuis:'spanning',studio:'spanning'};
// Cutscènes hebben hun eigen muziek, los van het rondlopen (dan speelde de stadsmuziek gewoon door). Een scène kan zelf kiezen
// ({muziek:'spanning'} als stap, of G.verhaalSfeer.zet vlak ervoor); anders leest dit het script: wie er praat en hoe, of er een
// keuze, hartslag of sirene in zit, en waar het speelt. Spanning bij Rafiq, Ray, de politie, Hugo, maskers en boze of bange
// regels; Napoli bij Giovanni; de muziek van het interieur binnen; anders de rustige, dromerige track (ook onder de verteller).
const SPANNEND={rafiq:2,ray:3,agent:2,agent2:2,bakker:2,hugo:3,masker:3,masker2:3,uitsmijter:1.5,scooterdief:2,nietbetaler:1.5,koerier:1,
  oudere_jongen:1.5,rapido:1.5,prater:1,teun:1.5,concurrent:2,verslaafde:1.5,kevin:1.5,dex:.8,nova:1.2,nova_m:2,koerier:1.5,student:.6,agent_burger:2};
function cutStemming(script){let bin=null,buiten=false,sp=0,zeg=0,napoli=0,zwaar=false;
  for(const s of script||[]){if(!s||typeof s!=='object')continue;if(s.muziek)return s.muziek;
    if(s.binnen)bin=s.binnen;if(s.buiten){buiten=true;bin=null}
    const wie=s.say||s.wie;if(s.text){zeg++;if(wie){sp+=SPANNEND[wie]||0;if((SPANNEND[wie]||0)>=2)zwaar=true;if(wie==='giovanni')napoli++}
      if(s.mood==='boos'||s.mood==='bang')sp+=1.2;else if(s.mood==='koel')sp+=.6}
    if(s.keuze)sp+=.5;if(s.snd==='heart'||s.snd==='siren'||s.snd==='sirene'||s.snd==='whistle')sp+=2;if(s.actor&&SPANNEND[s.actor])sp+=.5}
  if(!bin&&!buiten){try{bin=G.binnen&&G.binnen.waar&&G.binnen.waar()||null}catch(e){}}
  if(zwaar||sp>=4||sp/Math.max(3,zeg)>=.6)return 'spanning';   // Rafiq, Ray, politie, Hugo, maskers: altijd spanning
  // buiten in het donker met iemand uit het wereldje (Nova, een koerier, een klant): ook spanning
  if(sp>0&&!bin&&(G.night||0)>.6)return 'spanning';
  if(napoli)return 'napoli';
  if(bin)return BINNEN[bin]||'droom';
  try{const st=G.story&&G.story.steps&&G.story.steps[G.story.huidig()];if(st&&st.muziek&&typeof st.muziek==='string')return st.muziek}catch(e){}
  return 'droom'}
let tijdelijk=null,laatste,expliciet=false,losT=0;   // laatste begint leeg (undefined), zodat de eerste keuze (ook 'geen') meteen muziek zet
const S=G.verhaalSfeer={
  zet(m){tijdelijk=m||null;expliciet=!!m;kies()},           // geldt tot het einde van de cutscène of de volgende stap
  los(){tijdelijk=null;expliciet=false;kies()},
  nu:()=>laatste,BINNEN,stemming:cutStemming};
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
      else if(w)m=BINNEN[w]||'droom';}
  }catch(e){}
  // de chiptune van de Pixelstad speelt in het verhaal nooit: echte muziek via G.verhaalMuziek (verhaal-muziek.js)
  if(G.snd.sfeerNu!=='stil')G.snd.sfeer('stil');
  if(m!==laatste||!G.verhaalMuziek||G.verhaalMuziek.nu===undefined){laatste=m;G.verhaalMuziek&&G.verhaalMuziek.zet(m)}}
// meteen aanhaken zodra de cutscènes bestaan (ook de allereerste scène na het laden krijgt zo zijn eigen muziek)
const ivC=setInterval(()=>{if(!G.cut||!G.cut.onStart||!G.cut.onEnd)return;clearInterval(ivC);
  // na een scène blijft de muziek van de scène nog even staan: volgt er meteen een volgende scène (achter het zwart), dan
  // springt de muziek niet heen en weer (dat gaf twee nummers door elkaar)
  G.cut.onEnd.push(()=>{expliciet=false;clearTimeout(losT);losT=setTimeout(()=>{if(!(G.cut.active&&G.cut.active())){tijdelijk=null;kies()}},1500)});
  // begint een cutscène zonder eigen keuze: een stemming bij dit script (zie cutStemming)
  G.cut.onStart.push((o,script)=>{clearTimeout(losT);if(o&&o.muziek){tijdelijk=o.muziek}else if(!expliciet){tijdelijk=cutStemming(script)}kies()})},50);
const iv=setInterval(()=>{if(!G.ready||!G.story)return;clearInterval(iv);
  if(G.story.onStep)G.story.onStep.push(()=>{if(!(G.cut&&G.cut.active&&G.cut.active()))tijdelijk=null});   // midden in een scène blijft de muziek van de scène
  setInterval(kies,400)},200);
})();
