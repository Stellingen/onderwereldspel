// node shoot.js <shot> <w> <h> <uit.png> [extra query]
const {chromium}=require('playwright');
(async()=>{const [shot,w,h,out,extra]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const p=await b.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:1});
  p.on('console',m=>{const t=m.text();if(m.type()==='error'||/^\[real\]/.test(t))console.log('CONSOLE',t.slice(0,600))});p.on('pageerror',e=>console.log('PAGEERROR',String(e).slice(0,900)));
  const t0=Date.now();await p.goto('http://localhost:4011/?shot='+shot+(extra?'&'+extra:''),{waitUntil:'commit',timeout:60000});
  try{await p.waitForFunction('window.__ready===true||window.__fail',null,{timeout:420000})}catch(e){console.log('TIMEOUT')}
  const fail=await p.evaluate('window.__fail||null');if(fail)console.log('FAIL',fail);
  await p.screenshot({path:out});console.log('klaar',shot,((Date.now()-t0)/1000).toFixed(1)+'s',await p.evaluate('JSON.stringify(window.__stats||{})'));await b.close()})();
