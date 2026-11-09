// Pixelstad: geluid en muziek, helemaal opgewekt met Web Audio (geen bestanden).
// - Effecten: G.snd.fx('coin') enz. Klein en kort, zoals in een pixelgame.
// - Muziek: een eenvoudige chiptune-sequencer met vier stemmingen: dag (rustig), nacht (donker), achtervolging (snel) en stil.
//   Akkoorden, baslijn, arpeggio en drums worden live gemaakt, met een paar varianten zodat het niet gaat vervelen.
// - Sirene: G.snd.siren(afstand, richting) zet een loeiende sirene die harder wordt als de politie dichterbij is.
// Aan en uit (los voor effecten en muziek) in de instellingen van de telefoon; bewaard in localStorage.
(function(){
'use strict';
const G=window.STAD;
const LS=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v}catch(e){return d}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const st={fx:LS('stad_fx','1')==='1',mu:LS('stad_mu','1')==='1',vol:+LS('stad_vol','.8')||.8};
let ctx=null,master=null,fxBus=null,muBus=null,comp=null;
function ac(){if(ctx)return ctx;const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
  try{ctx=new A();comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master=ctx.createGain();master.gain.value=st.vol;
    fxBus=ctx.createGain();fxBus.gain.value=st.fx?.55:0;muBus=ctx.createGain();muBus.gain.value=st.mu?.2:0;fxBus.connect(comp);muBus.connect(comp);comp.connect(master);master.connect(ctx.destination)}catch(e){ctx=null}
  return ctx}
// pas na een tik of toets mag een browser geluid maken
const wake=()=>{const c=ac();if(c&&c.state==='suspended')c.resume();if(c&&st.mu&&!seq.on)startMusic()};
['pointerdown','keydown','touchstart'].forEach(e=>addEventListener(e,wake,{passive:true}));
const ok=v=>Number.isFinite(v);
function tone(f,t,d,type,v,f2,bus){const c=ac();if(!c||!ok(f)||!ok(t)||!ok(d))return;const T=c.currentTime+Math.max(0,t),o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,T);
  if(f2&&ok(f2))o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),T+d);g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v||.2,T+.006);g.gain.exponentialRampToValueAtTime(.0001,T+d);
  o.connect(g);g.connect(bus||fxBus);o.start(T);o.stop(T+d+.05)}
let nbuf=null;function noiseBuf(c){if(nbuf)return nbuf;const b=c.createBuffer(1,c.sampleRate*1.5,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return nbuf=b}
function noise(t,d,v,ftype,f0,f1,bus){const c=ac();if(!c)return;const T=c.currentTime+Math.max(0,t),s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type=ftype||'highpass';f.frequency.setValueAtTime(f0||1000,T);
  if(f1)f.frequency.exponentialRampToValueAtTime(f1,T+d);const g=c.createGain();g.gain.setValueAtTime(v||.2,T);g.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(f);f.connect(g);g.connect(bus||fxBus);s.start(T,Math.random());s.stop(T+d+.05)}
/* ---------- effecten ---------- */
const FX={
  blip:()=>tone(820+Math.random()*120,0,.035,'square',.05),
  click:()=>tone(1500,0,.03,'square',.06),
  tab:()=>{tone(900,0,.03,'square',.06);tone(1300,.03,.03,'square',.05)},
  open:()=>{tone(523,0,.06,'square',.08);tone(784,.06,.08,'square',.08)},
  close:()=>{tone(784,0,.05,'square',.07);tone(523,.05,.07,'square',.07)},
  door:()=>{tone(90,0,.18,'sine',.35,50);noise(0,.12,.12,'lowpass',900,200)},
  coin:()=>{tone(988,0,.07,'square',.1);tone(1319,.07,.22,'square',.1)},
  cash:()=>{[0,.05,.1,.15].forEach((t,i)=>tone(1046+i*170,t,.08,'square',.07));noise(.05,.15,.06,'highpass',5000)},
  ok:()=>{[523,659,784,1046].forEach((f,i)=>tone(f,i*.07,.14,'square',.08))},
  bad:()=>{[392,330,262].forEach((f,i)=>tone(f,i*.1,.16,'square',.09))},
  lvl:()=>{[523,659,784,1046,1319].forEach((f,i)=>tone(f,i*.06,.2,'triangle',.12))},
  notify:()=>{tone(180,0,.07,'square',.12);tone(180,.11,.07,'square',.12);tone(1760,.2,.08,'sine',.05)},
  grab:()=>noise(0,.18,.18,'bandpass',600,3200),
  hit:()=>{tone(120,0,.12,'sine',.45,40);noise(0,.1,.3,'lowpass',2400,300)},
  scream:()=>{tone(700+Math.random()*200,0,.5,'sawtooth',.05,1100);tone(720,.02,.45,'sawtooth',.04,1300)},
  whistle:()=>{tone(2600,0,.12,'sine',.12,2800);tone(2600,.16,.3,'sine',.12,2500)},
  caught:()=>{tone(220,0,.3,'sawtooth',.14,110);noise(0,.2,.2,'lowpass',1500,200)},
  hide:()=>noise(0,.25,.1,'lowpass',500,150),
  heart:()=>{tone(60,0,.09,'sine',.4,45);tone(60,.16,.09,'sine',.3,45)},
  build:()=>{tone(320,0,.05,'square',.08);noise(0,.06,.12,'highpass',2000)},
  step:()=>noise(0,.04,.035,'lowpass',700,300),
  splash:()=>noise(0,.35,.15,'lowpass',1800,300),
  phoneRing:()=>{for(let i=0;i<4;i++){tone(1318,i*.1,.05,'square',.06);tone(1046,i*.1+.05,.05,'square',.06)}},
  carDoor:()=>{tone(140,0,.08,'square',.12,80);noise(0,.06,.1,'lowpass',1200)},
  glass:()=>{noise(0,.3,.3,'highpass',3000);[2400,3100,2700,3600].forEach((f,i)=>tone(f,i*.04,.12,'square',.04))},
  carAlarm:()=>{for(let i=0;i<8;i++){tone(i%2?880:660,i*.22,.2,'square',.07)}},
  engineStart:()=>{tone(60,0,.5,'sawtooth',.18,140);noise(0,.4,.08,'lowpass',600,1200)},
  money:()=>{tone(1568,0,.05,'square',.07);tone(2093,.05,.12,'square',.07)},
  gull:()=>{tone(1500,0,.16,'sawtooth',.035,1100);tone(1450,.2,.22,'sawtooth',.03,900)},
  flutter:()=>{for(let i=0;i<6;i++)noise(i*.05,.04,.07,'bandpass',1400,900)},
  thunder:()=>{noise(0,1.6,.5,'lowpass',240,60);tone(55,0,1.2,'sine',.3,30)},
  woef:()=>{tone(300,0,.09,'sawtooth',.12,170);tone(280,.14,.1,'sawtooth',.11,150)},
  jank:()=>tone(900,0,.25,'sine',.06,600),
  miauw:()=>tone(700,0,.3,'triangle',.07,480),
  spray:()=>noise(0,.3,.09,'highpass',4200,6000),
  dice:()=>{for(let i=0;i<4;i++)tone(600+Math.random()*500,i*.05,.03,'square',.06)},
  punch:()=>{tone(150,0,.09,'sine',.5,50);noise(0,.07,.28,'lowpass',1800,300)},
  whoosh:()=>noise(0,.16,.1,'bandpass',500,2200),
  go:()=>{tone(880,0,.5,'square',.1)},beep:()=>tone(440,0,.18,'square',.09),
  chirp:()=>{const f=2600+Math.random()*900;tone(f,0,.05,'sine',.03,f*1.2);tone(f*1.1,.09,.05,'sine',.03,f*.9)},
  cricket:()=>{for(let i=0;i<3;i++)tone(4200,i*.06,.03,'square',.012)},
};
function fx(k){if(!st.fx)return;try{(FX[k]||FX.click)()}catch(e){}}
/* ---------- sirene (loeit, harder en panning naar richting) ---------- */
let sir=null;
function siren(d,pan){const c=ac();if(!c)return;if(d==null||d>140||!st.fx){if(sir){sir.g.gain.setTargetAtTime(0,c.currentTime,.3)}return}
  if(!sir){const o=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),g=c.createGain(),p=c.createStereoPanner?c.createStereoPanner():null;
    o.type='sawtooth';o2.type='square';o.frequency.value=760;o2.frequency.value=764;lfo.frequency.value=.55;lfo.type='triangle';lg.gain.value=230;lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
    const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=1800;o.connect(f);o2.connect(f);f.connect(g);g.gain.value=0;if(p){g.connect(p);p.connect(fxBus)}else g.connect(fxBus);o.start();o2.start();lfo.start();sir={g,p}}
  const v=Math.max(0,Math.min(.07,.07*(1-d/140)));sir.g.gain.setTargetAtTime(v,c.currentTime,.25);if(sir.p&&ok(pan))sir.p.pan.setTargetAtTime(Math.max(-1,Math.min(1,pan)),c.currentTime,.2)}
/* ---------- motor (als je rijdt) ---------- */
let eng=null;
function engine(v){const c=ac();if(!c)return;if(v==null||!st.fx){if(eng)eng.g.gain.setTargetAtTime(0,c.currentTime,.15);return}
  if(!eng){const o=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='square';f.type='lowpass';f.frequency.value=420;o.connect(f);o2.connect(f);f.connect(g);g.gain.value=0;g.connect(fxBus);o.start();o2.start();eng={o,o2,g}}
  const s=Math.abs(v);eng.o.frequency.setTargetAtTime(38+s*3.4,c.currentTime,.1);eng.o2.frequency.setTargetAtTime(19+s*1.7,c.currentTime,.1);eng.g.gain.setTargetAtTime(.05+Math.min(.05,s*.003),c.currentTime,.1)}
/* ---------- omgeving: regen, zee en wind als zachte ruislagen ---------- */
const AMB={};
function ambLayer(k){const c=ac();if(!c)return null;if(AMB[k])return AMB[k];const src=c.createBufferSource();src.buffer=noiseBuf(c);src.loop=true;const f=c.createBiquadFilter(),g=c.createGain();g.gain.value=0;
  if(k==='rain'){f.type='highpass';f.frequency.value=2400}else if(k==='sea'){f.type='lowpass';f.frequency.value=520;const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.13;lg.gain.value=260;l.connect(lg);lg.connect(f.frequency);l.start()}else{f.type='bandpass';f.frequency.value=380;f.Q.value=.6}
  src.connect(f);f.connect(g);g.connect(fxBus);src.start();return AMB[k]={g}}
function amb(o){if(!ctx||ctx.state!=='running')return;for(const k of ['rain','sea','wind']){const v=st.fx?Math.max(0,Math.min(1,o[k]||0)):0;if(!v&&!AMB[k])continue;const L=ambLayer(k);if(L)L.g.gain.setTargetAtTime(v*(k==='rain'?.11:k==='sea'?.16:.07),ctx.currentTime,.6)}}
/* ---------- muziek ---------- */
const N=n=>440*Math.pow(2,(n-69)/12);
// akkoorden als midi-grondtoon + type; per stemming een paar progressies
const SONGS={
  dag:{bpm:92,prog:[[[57,'m7'],[62,'m7'],[55,'7'],[60,'M7']],[[60,'M7'],[57,'m7'],[65,'M7'],[67,'7']],[[62,'m7'],[67,'7'],[60,'M7'],[57,'m7']]],lead:.5,hat:.5,kick:[0,8],snare:[4,12],bassPat:[0,0,7,0,12,0,7,5]},
  nacht:{bpm:80,prog:[[[57,'m'],[53,'M'],[60,'M'],[55,'M']],[[52,'m'],[57,'m'],[53,'M7'],[55,'M']]],lead:.3,hat:.35,kick:[0,10],snare:[8],bassPat:[0,0,0,7,0,0,5,3]},
  jacht:{bpm:146,prog:[[[52,'m'],[48,'M'],[50,'M'],[47,'M']],[[52,'m'],[52,'m'],[48,'M'],[50,'M']]],lead:.8,hat:1,kick:[0,4,8,12],snare:[4,12],bassPat:[0,12,0,12,0,12,7,10]}};
const CH={m:[0,3,7],M:[0,4,7],m7:[0,3,7,10],M7:[0,4,7,11],'7':[0,4,7,10]};
const seq={on:false,mode:'dag',want:'dag',step:0,next:0,bar:0,prog:0,timer:0,fade:1};
function startMusic(){const c=ac();if(!c||seq.on)return;seq.on=true;seq.next=c.currentTime+.1;seq.step=0;clearInterval(seq.timer);seq.timer=setInterval(schedule,40)}
function stopMusic(){seq.on=false;clearInterval(seq.timer)}
function schedule(){const c=ctx;if(!c||!seq.on)return;const S0=SONGS[seq.mode];if(!S0)return;const spb=60/S0.bpm/4;
  while(seq.next<c.currentTime+.25){const s=seq.step%16,T=seq.next-c.currentTime;
    if(s===0&&seq.step>0){seq.bar++;if(seq.want!==seq.mode&&seq.bar%2===0){seq.mode=seq.want;seq.prog=Math.floor(Math.random()*SONGS[seq.mode].prog.length);seq.step=0;seq.bar=0;seq.next+=spb;return}
      if(seq.bar%8===0)seq.prog=Math.floor(Math.random()*S0.prog.length)}
    if(seq.mode!=='stil')note(S0,s,T,spb);seq.step++;seq.next+=spb}}
function note(S0,s,T,spb){const P=S0.prog[seq.prog%S0.prog.length],ch=P[Math.floor((seq.bar%(P.length*2))/2)%P.length],root=ch[0],iv=CH[ch[1]]||CH.m;
  // bas (driehoek), op de achtsten
  if(s%2===0){const b=S0.bassPat[(s/2)%8];tone(N(root-24+b),T,spb*1.8,'triangle',.32,null,muBus)}
  // arpeggio (zacht blokgolfje)
  if(s%2===1||seq.mode==='jacht'){const n=root+iv[(s>>1)%iv.length]+(s>=8?12:0);tone(N(n),T,spb*.9,'square',.045,null,muBus)}
  // melodie af en toe (pentatonisch boven het akkoord)
  if(Math.random()<S0.lead*.18&&s%4===2){const pen=[0,3,5,7,10],n=root+12+pen[Math.floor(Math.random()*5)];tone(N(n),T,spb*3,'triangle',.07,null,muBus)}
  // drums
  if(S0.kick.includes(s))tone(130,T,.12,'sine',.5,45,muBus);
  if(S0.snare.includes(s))noise(T,.1,.13,'highpass',1800,null,muBus);
  if(s%2===0&&Math.random()<S0.hat)noise(T,.03,.05,'highpass',7000,null,muBus);
  // de straatmuzikant: een gitaarloopje dat harder wordt als je dichterbij komt
  if(busk>0&&st.fx&&s%2===0){const pen=[0,3,5,7,10,12],n=root+pen[(s/2+seq.bar*3)%6];tone(N(n),T,spb*1.7,'triangle',.11*busk,null,fxBus);if(s%8===0)tone(N(root-12),T,spb*3.5,'triangle',.1*busk,null,fxBus)}}
let busk=0;
function music(mode){seq.want=mode;if(mode!=='stil'&&st.mu&&!seq.on&&ctx&&ctx.state==='running')startMusic()}
// stemming volgt het spel: achtervolging, missie, binnen, nacht of dag
setInterval(()=>{if(!G||!G.ready)return;const chase=(G.police&&G.police.active&&G.police.active())||(G.mission&&G.mission()&&G.mission().alarm);
  const inside=G.ui&&G.ui.cur&&G.ui.cur();music(chase?'jacht':inside?'stil':(G.night>.55?'nacht':'dag'))},700);
function apply(){if(!ctx)return;fxBus.gain.setTargetAtTime(st.fx?.55:0,ctx.currentTime,.05);muBus.gain.setTargetAtTime(st.mu?.2:0,ctx.currentTime,.3);master.gain.setTargetAtTime(st.vol,ctx.currentTime,.05);
  if(st.mu&&!seq.on)startMusic()}
G.snd={fx,siren,engine,music,amb,busk:v=>{busk=Math.max(0,Math.min(1,v||0))},
  get fxOn(){return st.fx},get muOn(){return st.mu},get vol(){return st.vol},
  setFx(v){st.fx=!!v;set('stad_fx',v?'1':'0');apply();if(!v){siren(null);engine(null)}},setMu(v){st.mu=!!v;set('stad_mu',v?'1':'0');apply()},setVol(v){st.vol=Math.max(0,Math.min(1,+v||0));set('stad_vol',st.vol);apply()}};
// pauze (tabblad weg): muziek zachter
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(st.fx||st.mu)ctx.resume()});
})();
