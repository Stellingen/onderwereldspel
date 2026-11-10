// Kleine statische server voor het realistische prototype (alleen lokaal; staat niet in het spel).
// Starten: cd proto/realistisch && npm i three playwright && node serve.js  → http://localhost:4011/?shot=plein
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=__dirname,THREE=path.join(__dirname,'node_modules','three'),GAME=path.join(__dirname,'..','..','public');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json','.jpg':'image/jpeg'};
http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);let f;
  if(u.startsWith('/three/'))f=path.join(THREE,u.slice(7));else if(u.startsWith('/game/'))f=path.join(GAME,u.slice(6));else f=path.join(ROOT,u==='/'?'real.html':u);
  if(!f.startsWith(ROOT)&&!f.startsWith(THREE)&&!f.startsWith(GAME)){res.writeHead(403);res.end();return}
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('nf');return}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(d)})}).listen(4011,()=>console.log('prototype op http://localhost:4011/?shot=plein'));
