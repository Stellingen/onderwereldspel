// Geluid voor het casino, volledig opgewekt met Web Audio (geen bestanden nodig).
const SFX=(()=>{
  let ctx=null,master=null,on=true;try{on=localStorage.getItem('ow_sound')!=='0'}catch(e){}
  const ac=()=>{if(!on)return null;if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();master=ctx.createGain();master.gain.value=.35;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume();return ctx};
  const tone=(f,t,d,type='sine',v=.3,f2)=>{const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,c.currentTime+t);
    if(f2)o.frequency.exponentialRampToValueAtTime(f2,c.currentTime+t+d);g.gain.setValueAtTime(0,c.currentTime+t);g.gain.linearRampToValueAtTime(v,c.currentTime+t+.008);
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+t+d);o.connect(g);g.connect(master);o.start(c.currentTime+t);o.stop(c.currentTime+t+d+.05)};
  const noise=(t,d,v=.2,hp=800)=>{const c=ac();if(!c)return;const b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);
    const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=c.createGain();g.gain.value=v;s.connect(f);f.connect(g);g.connect(master);s.start(c.currentTime+t)};
  const scale=[523,587,659,784,880,1047,1175,1319,1568,1760];
  // ---------- bouwstenen voor de slotgeluiden ----------
  // ruis door een filter dat van f0 naar f1 schuift (plons, zoef, klik, schudden)
  const fnoise=(t,d,v,type,f0,f1,q)=>{const c=ac();if(!c)return;const n=Math.max(1,Math.floor(c.sampleRate*d)),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
    const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=type||'bandpass';f.Q.value=q||1;const t0=c.currentTime+t;f.frequency.setValueAtTime(f0,t0);if(f1&&f1!==f0)f.frequency.exponentialRampToValueAtTime(f1,t0+d);
    const g=c.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+Math.min(.02,d*.2));g.gain.exponentialRampToValueAtTime(.0001,t0+d);s.connect(f);f.connect(g);g.connect(master);s.start(t0);s.stop(t0+d+.05)};
  // belletje (FM): r = verhouding modulator, k = hoe metalig
  const bell=(f,t,d,v,r,k)=>{const c=ac();if(!c)return;const t0=c.currentTime+t,o=c.createOscillator(),m=c.createOscillator(),mg=c.createGain(),g=c.createGain();
    o.frequency.value=f;m.frequency.value=f*(r||3.5);mg.gain.setValueAtTime(f*(k||1.5),t0);mg.gain.exponentialRampToValueAtTime(f*.02+.01,t0+d);m.connect(mg);mg.connect(o.frequency);
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.004);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(master);o.start(t0);m.start(t0);o.stop(t0+d+.05);m.stop(t0+d+.05)};
  // toon door een laagdoorlaatfilter (koper, accordeon), met korte aanzet
  const brass=(f,t,d,v,type,lp)=>{const c=ac();if(!c)return;const t0=c.currentTime+t,o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type=type||'sawtooth';o.frequency.value=f;
    fl.type='lowpass';fl.frequency.setValueAtTime(lp||1800,t0);fl.frequency.exponentialRampToValueAtTime((lp||1800)*.45,t0+d);
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.03);g.gain.setValueAtTime(v*.8,t0+d*.6);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(fl);fl.connect(g);g.connect(master);o.start(t0);o.stop(t0+d+.05)};
  // krakende deur: zaagtand met trilling door een smal filter
  const creak=(t,d,v,f0,f1)=>{const c=ac();if(!c)return;const t0=c.currentTime+t,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),fl=c.createBiquadFilter(),g=c.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(f0,t0);o.frequency.linearRampToValueAtTime(f1,t0+d);lfo.frequency.value=23;lg.gain.value=f0*.18;lfo.connect(lg);lg.connect(o.frequency);
    fl.type='bandpass';fl.frequency.value=f0*6;fl.Q.value=6;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.08);g.gain.setValueAtTime(v,t0+d*.7);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(fl);fl.connect(g);g.connect(master);o.start(t0);lfo.start(t0);o.stop(t0+d+.05);lfo.stop(t0+d+.05)};
  const N=(n)=>440*Math.pow(2,(n-69)/12); // midi-noot naar Hz
  const melody=(notes,t0,step,fn)=>notes.forEach((n,i)=>{if(n==null)return;(Array.isArray(n)?n:[n]).forEach(m=>fn(N(m),t0+i*step))});
  // ---------- Kluiskraker: metaal, munten en een kluisdeur ----------
  const kk={
    spin(){fnoise(0,.32,.1,'bandpass',900,2600,1.6);for(let i=0;i<5;i++)fnoise(i*.045,.02,.12,'highpass',4000,4000);tone(70,0,.3,'sawtooth',.04,55)},
    land(col){bell(400-col*9,0,.16,.07,2.76,1.1);fnoise(0,.03,.05,'highpass',3000,3000)},
    win(step){const n=3+Math.min(step,4);for(let k=0;k<n;k++)bell(1700+Math.random()*1100,k*.05,.3,.06,3.6,2.2);[0,4,7].forEach((x,i)=>tone(scale[Math.min(9,step)]*Math.pow(2,x/12),i*.05,.3,'triangle',.08))},
    pop(){fnoise(0,.14,.16,'highpass',2600,6000);bell(820,0,.12,.05,1.4,3)},
    mult(v){const n=Math.min(9,Math.log2(v||2));bell(500+n*110,0,.35,.1,2,1.4);bell(1000+n*160,.07,.35,.08,2,1.2)},
    scatter(i){tone(92,0,.28,'sine',.32,52);fnoise(0,.09,.22,'bandpass',700,260,3);bell(250+i*45,.03,.5,.11,2,1)},
    tease(n,d){const b=120+n*30;tone(b,0,d||.6,'sawtooth',.045,b*2.4);fnoise(0,d||.6,.04,'bandpass',600,2400,3)},
    // kluis open: cijferslot (tikjes die versnellen), grendel, krakende deur, dan een korte koperfanfare
    bonus(short){let t=0;if(!short){for(let i=0;i<9;i++){t+=.11-i*.008;fnoise(t,.025,.16,'bandpass',2600,2600,4);bell(1300,t,.05,.03,1.4,2)}
      t+=.12;tone(70,t,.35,'sine',.45,40);fnoise(t,.18,.3,'bandpass',500,180,2);bell(180,t,.6,.12,1.5,1.2);
      creak(t+.18,1,.11,95,70);fnoise(t+.3,.9,.06,'lowpass',300,1400,1);t+=1.05}
     const st=.16;melody([[50,62],null,[53,65],[57,69],[62,74],null,[57,69],[62,74,78]],t,st,(f,tt)=>{brass(f,tt,.32,.07,'sawtooth',2400)});
     tone(N(38),t+st*7,1.2,'sine',.25);bell(N(86),t+st*7,1.4,.07,3.5,1.6);fnoise(t+st*7,1.1,.05,'highpass',5000,9000)},
    retrig(){tone(80,0,.3,'sine',.35,48);fnoise(0,.12,.2,'bandpass',600,220,2);melody([[57,69],[62,74]],.14,.14,(f,t)=>brass(f,t,.3,.07))},
    big(){for(let k=0;k<26;k++)bell(1500+Math.random()*1500,k*.045+Math.random()*.02,.35,.05,3.6,2.4);melody([[55,67],[59,71],[62,74],[67,79]],0,.12,(f,t)=>brass(f,t,.45,.07,'sawtooth',2600))},
    lose(){tone(140,0,.22,'sine',.07,100)},
    tick(){bell(1500,0,.05,.04,1.4,2)}};
  // ---------- Visdief: hout, water en een boei met een bel ----------
  const vd={
    spin(){let t=0;for(let i=0;i<14;i++){t+=.022+Math.abs(i-7)*.004;fnoise(t,.018,.1,'bandpass',3200,3200,3)}fnoise(0,.4,.05,'bandpass',300,900,1)},
    land(col){tone(210-col*9,0,.1,'triangle',.18,120);fnoise(0,.05,.06,'lowpass',900,300)},
    tick(){tone(240,0,.07,'triangle',.14,140);fnoise(0,.04,.05,'lowpass',900,300)},
    win(step){const P=[67,69,71,74,76,79,81,83,86];const b=Math.min(step,5);[0,2,4].forEach((k,i)=>{const f=N(P[b+k]);tone(f,i*.07,.3,'sine',.14);tone(f*4,i*.07,.06,'sine',.03)});tone(500,.25,.12,'sine',.06,1100)},
    pop(){tone(300,0,.12,'sine',.12,900);fnoise(0,.06,.05,'bandpass',1200,2600,2)},
    mult(v){const n=Math.min(9,Math.log2(v||2));tone(300+n*60,0,.2,'sine',.12,900+n*120);bell(N(79)+n*40,.08,.5,.08,1.4,2)},
    scatter(i){bell(N(76+i*3),0,1.1,.13,1.41,2.2);fnoise(0,.3,.04,'lowpass',600,200)},
    tease(n,d){const b=200+n*40;tone(b,0,d||.6,'sine',.06,b*2.5);fnoise(0,d||.6,.04,'bandpass',500,2000,2)},
    // plons: aanzwellen, de klap in het water, druppels, dan een vrolijk havendeuntje
    bonus(short){let t=0;if(!short){fnoise(0,.35,.12,'bandpass',300,2400,1.2);t=.34;fnoise(t,.9,.5,'lowpass',5000,260,.8);tone(90,t,.4,'sine',.4,45);fnoise(t,.5,.18,'highpass',2500,6000);
      for(let i=0;i<11;i++){const tt=t+.15+Math.random()*.75,f=500+Math.random()*700;tone(f,tt,.08,'sine',.08,f*2.2)}t+=1}
     const st=.15;melody([67,71,74,79,null,76,74,71,72,76,79,[79,83]],t,st,(f,tt)=>{tone(f,tt,.28,'triangle',.13);brass(f/2,tt,.26,.035,'square',1400)});
     melody([[43,55],null,null,[50,62],null,null,[48,60],null,null,[43,55,59]],t,st*1.2,(f,tt)=>tone(f,tt,.5,'sine',.08))},
    retrig(){fnoise(0,.5,.3,'lowpass',4000,300,.8);bell(N(81),.1,.9,.12,1.41,2)},
    collect(){let t=0;for(let i=0;i<10;i++){t+=.03;fnoise(t,.018,.09,'bandpass',3000,3000,3)}tone(400,.3,.12,'sine',.14,1200);tone(600,.42,.1,'sine',.1,1500)},
    big(){fnoise(0,.6,.3,'lowpass',4500,300,.8);melody([67,71,74,79,83,[79,86]],.15,.12,(f,t)=>tone(f,t,.4,'triangle',.14))},
    lose(){tone(260,0,.2,'sine',.08,160)}};
  // ---------- Suikerbaron: plopjes, glinsters en een speeldoosje ----------
  const zb={
    spin(){for(let i=0;i<6;i++)fnoise(i*.05,.04,.08,'highpass',5000,7000);tone(300,0,.35,'sine',.05,900)},
    land(col){tone(560-col*28,0,.13,'sine',.15,250);fnoise(0,.02,.04,'highpass',4000,4000)},
    win(step){const P=[72,74,76,79,81,84,86,88,91];const b=Math.min(step,5);[0,1,2,4].forEach((k,i)=>bell(N(P[b+k]),i*.06,.5,.08,3.5,.8))},
    pop(){tone(700,0,.07,'sine',.12,1700);fnoise(0,.03,.06,'highpass',4000,6000)},
    mult(v){const n=Math.min(9,Math.log2(v||2));tone(180+n*20,0,.38,'sine',.16,620+n*90);bell(N(84+Math.min(12,n*2)),.12,.6,.08,3.5,1)},
    scatter(i){[0,4,7].forEach((k,j)=>bell(N(84+i*2+k),j*.05,.7,.07,3.5,.9))},
    tease(n,d){const b=300+n*50;tone(b,0,d||.6,'sine',.06,b*2.6);for(let k=0;k<6;k++)bell(N(88+k),k*(d||.6)/6,.2,.03,3.5,.8)},
    // betovering: glinsterende ladder omhoog, een plop uit de kauwgomautomaat, dan een speeldoosdeuntje
    bonus(short){let t=0;if(!short){for(let i=0;i<14;i++)bell(N(72+i*2),i*.04,.35,.06,3.5,.8);fnoise(0,.6,.05,'highpass',3000,9000);t=.62;
      tone(160,t,.12,'square',.06,90);fnoise(t,.05,.12,'bandpass',1500,800,3);tone(500,t+.1,.12,'sine',.18,1400);t+=.3}
     const st=.13;melody([76,79,84,83,79,76,77,81,84,88,86,[84,88,91]],t,st,(f,tt)=>{bell(f,tt,.6,.1,3.5,.9);bell(f*2,tt,.25,.025,3.5,.6)});
     melody([[48,60],null,null,[55,67],null,null,[53,65],null,null,[48,55,60]],t,st*1.2,(f,tt)=>tone(f,tt,.45,'triangle',.07))},
    retrig(){[0,4,7,12].forEach((k,i)=>bell(N(84+k),i*.06,.6,.08,3.5,.9));tone(500,.25,.12,'sine',.15,1400)},
    big(){for(let i=0;i<16;i++)bell(N(84+(i%8)*2+(i>7?12:0)),i*.05,.5,.06,3.5,.9);[60,64,67,72].forEach((m,i)=>tone(N(m),.1+i*.02,.8,'triangle',.06))},
    lose(){tone(420,0,.25,'sine',.06,300)}};
  return {kk,vd,zb,

    get on(){return on},
    toggle(){on=!on;try{localStorage.setItem('ow_sound',on?'1':'0')}catch(e){}if(on)this.click();return on},
    click(){tone(900,0,.05,'square',.08)},
    spin(){noise(0,.35,.12,1500);tone(180,0,.3,'sawtooth',.06,90)},
    land(col){tone(260-col*14,0,.07,'triangle',.18,140);noise(0,.04,.06,3000)},
    win(step){const b=Math.min(step,6);[0,2,4].forEach((k,i)=>tone(scale[b+k]||1760,i*.06,.35,'triangle',.18))},
    pop(){noise(0,.12,.14,2500);tone(1400,0,.08,'sine',.08,600)},
    mult(v){const n=Math.min(9,Math.log2(v||2));tone(400+n*120,0,.18,'square',.07,800+n*160);tone(1200+n*100,.06,.2,'sine',.1)},
    scatter(i){tone(110,0,.6,'sine',.35,95);tone(220+i*60,0,.5,'triangle',.12);if(i>=2)tone(scale[Math.min(9,i+2)],.05,.4,'triangle',.14)},
    tick(){tone(1800,0,.03,'square',.03)},
    // spanning: een stijgende toon terwijl een kolom traag valt (hoger bij meer kluizen)
    tease(n,d){const b=160+n*40;tone(b,0,d||.6,'sawtooth',.05,b*2.2);tone(b*2,0,d||.6,'sine',.06,b*4)},
    bonus(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*.11,.32,'triangle',.2));noise(.7,.5,.08,4000)},
    big(){[392,523,659,784,1047,1319,1568].forEach((f,i)=>{tone(f,i*.08,.5,'triangle',.18);tone(f/2,i*.08,.5,'sine',.1)})},
    lose(){tone(220,0,.25,'sine',.08,180)},
    shot(){noise(0,.45,.55,120);tone(110,0,.3,'triangle',.45,38);noise(.03,.9,.08,2400)},
    card(){noise(0,.07,.12,2000)},
    chip(){tone(2200,0,.04,'square',.05);tone(1700,.03,.05,'square',.04)}
  };
})();
