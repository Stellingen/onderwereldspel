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
  return {
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
