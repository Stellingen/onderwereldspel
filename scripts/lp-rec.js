// Clips van de minigames voor de voorpagina, opgenomen uit de echte spelcode (Playwright + ffmpeg).
//   node scripts/lp-rec.js <poort> <tokenbestand> [rennen,plankgas,carjacken,contact] [takes]
// Alleen tegen een LOKALE server met een testaccount, nooit tegen de live site. Opslaan staat uit tijdens het opnemen
// (save/pushState worden leeg gemaakt), dus het testaccount verandert niet. We roepen alleen de minigame zelf aan.
// Per spel worden een paar takes gespeeld door een kleine bot; de beste take (geen botsing/struikeling/fout in het venster)
// wordt geknipt (6 s), bijgesneden tot 9:16 en gecodeerd naar AV1 (webm) en H.264 (mp4), plus een poster (webp, ≤ 10 KB).
// De gekozen ruwe take (geknipt, VP9 hoge kwaliteit) blijft bewaard in scripts/lp-rec/takes/, zodat hij later opnieuw te
// coderen is zonder opnieuw te spelen (een vaste seed maakt een take niet herhaalbaar: de spellen lopen op performance.now()).
// Geen merk- of modelnamen in beeld: de modelnaam, het kenteken en de labels worden met CSS verborgen.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const port = process.argv[2] || '3999', tokFile = process.argv[3] || '/tmp/claude-0/ovg/tok5';
const ONLY = (process.argv[4] || 'rennen,plankgas,carjacken,contact').split(','), TAKES = +(process.argv[5] || 4);
const BASE = 'http://localhost:' + port, ROOT = path.join(__dirname, '..');
const MEDIA = path.join(ROOT, 'public', 'media', 'lp'), POSTER = path.join(ROOT, 'public', 'img', 'lp'), KEEP = path.join(__dirname, 'lp-rec', 'takes');
const TMP = path.join(require('os').tmpdir(), 'lp-rec'); [MEDIA, POSTER, KEEP, TMP].forEach(d => fs.mkdirSync(d, { recursive: true }));
const tok = fs.readFileSync(tokFile, 'utf8').trim();
const HIDE = 'body>.app{visibility:hidden!important}.hx-head .label,.heist-top .label,.plate,.hx-nerve,.helerb,.heler-b{visibility:hidden!important}.chase-ov{backdrop-filter:none!important}#toasts{display:none!important}';
const ff = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

// ---------- bots (draaien in de pagina) ----------
const BOTS = {
  // Plankgas: kijkt vooruit, wisselt van baan voor blokkades en knipperende politie, nitro als de politie dichtbij is
  chase: () => { const ov = document.querySelector('.cc-ov'); let lastAct = 0; window.__hitsAt = [];
    const iv = setInterval(() => { const s = ov._cc(); if (!s.playing) { s.act.skip(); return; } if (s.done) { clearInterval(iv); return; }
      if (s.hits > window.__hitsAt.length) window.__hitsAt.push(performance.now());
      const look = s.v * .95 + 6, lanes = [-1, 0, 1], dang = {}; lanes.forEach(l => dang[l] = 999);
      s.rows.forEach(r => { if (r.z < -4.8 || r.z > look + 20) return; r.obs.forEach(o => { if (!o.hit) dang[o.x] = Math.min(dang[o.x], Math.max(0, r.z)); }); });
      const near = l => dang[l] < 6, free = l => dang[l] > look, cur = s.lane; let tgt = cur;
      if (!free(cur)) { let bd = dang[cur]; lanes.forEach(l => { const ok = Math.abs(l - cur) < 2 || dang[0] > 7; if (ok && dang[l] > bd + (Math.abs(l - cur) > 1 ? 4 : 0)) { tgt = l; bd = dang[l]; } }); }
      s.cops.forEach(c => { if ((c.st === 'tele' || c.st === 'sw') && c.tgt === cur && Math.abs(c.z) < 5) { const away = lanes.filter(l => Math.abs(l - cur) === 1 && Math.sign(l - cur) !== Math.sign(c.x - cur) && free(l)); if (away.length) tgt = away[0]; else if (s.nitro > 0) s.act.boost(); } });
      const ex = s.exits.find(e => e.z > 0 && e.z < 45 && !e.taken); if (ex && free(ex.side) && !near(ex.side) && tgt === cur && Math.abs(ex.side - cur) === 1) tgt = ex.side;
      const st1 = cur + Math.sign(tgt - cur); if (tgt !== cur && near(st1) && dang[cur] > 4) tgt = cur;
      const now = performance.now(); if (tgt !== cur && now - lastAct > 140) { s.act.steer(Math.sign(tgt - cur)); lastAct = now; }
      if (s.gap < 14 && s.nitro > 0 && s.nitroT <= 0 && s.rows.every(r => r.z < 0 || r.z > 35 || r.obs.every(o => o.x !== cur))) s.act.boost();
    }, 45); },
  // Rennen: menselijke reactietijd (0,3 s), wisselt van baan of springt
  flee: () => { const ov = document.querySelector('.fl-ov'); if (!ov || !ov._fl) return; window.__hitsAt = []; let pm = 0;
    const press = c => document.dispatchEvent(new KeyboardEvent('keydown', { code: c, bubbles: true })); let busy = 0; const RT = .3;
    const tick = () => { const g = ov._fl(); if (!g.started && g.skip) { try { g.skip(); } catch (e) {} } if (g.done) return; if (g.misses > pm) { pm = g.misses; window.__hitsAt.push(performance.now()); }
      const look = g.rows.filter(r => r.z - g.dist > .4); if (!look.length) { setTimeout(tick, 30); return; }
      const r = look[0], z = r.z - g.dist, tt = z / Math.max(1, g.v), X = o => o.cr ? o.to : o.x;
      const blocked = l => r.obs.some(o => !o.low && Math.abs(l - X(o)) < (.42 + o.w) / 2 * g.R.hit + .1), lowIn = l => r.obs.some(o => o.low && Math.abs(l - X(o)) < (.42 + o.w) / 2 * g.R.hit + .1);
      if (!busy && tt < 1.2) {
        if (blocked(g.lane)) { const fr = [-1, 0, 1].filter(l => !blocked(l)).sort((a, b) => Math.abs(a - g.lane) - Math.abs(b - g.lane));
          if (fr.length) { const target = fr[0]; busy = 1; setTimeout(() => { let d = target - ov._fl().lane; const go = () => { if (d === 0) { setTimeout(() => busy = 0, 60); return; } press(d < 0 ? 'ArrowLeft' : 'ArrowRight'); d += d < 0 ? 1 : -1; setTimeout(go, 90); }; go(); }, RT * 1000); } }
        else if (lowIn(g.lane) && g.jumpT < 0 && tt < RT + .32) { busy = 1; setTimeout(() => { press('Space'); setTimeout(() => busy = 0, 300); }, Math.max(0, (tt - .28) * 1000)); } }
      setTimeout(tick, 30); }; tick(); },
  // Carjacken: druk als de streep midden in het groene stuk staat
  jack: () => { window.__hitsAt = []; const f = () => { const mk = document.querySelector('#jkMk'), z = document.querySelector('#jkZone'); if (!mk || document.querySelector('.chase-box.won,.chase-box.lost')) return;
      const a = parseFloat(z.style.left), w = parseFloat(z.style.width), p = parseFloat(mk.style.left || '0');
      if (performance.now() - (window.__jkT || window.__jk0) > (window.__jkT ? 1100 : 1400)) { if (p > a + w * .3 && p < a + w * .7) { window.__jkT = performance.now(); document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true })); } }
      requestAnimationFrame(f); }; window.__jk0 = performance.now(); setTimeout(() => requestAnimationFrame(f), 900); },
  // Contact maken: toetst de reeks in, rode pijl andersom
  heist: () => { window.__hitsAt = []; const K = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'], OPP = [2, 3, 0, 1], SYM = ['←', '↑', '→', '↓'];
    const f = () => { if (document.querySelector('.chase-box.won,.chase-box.lost')) return; const cur = document.querySelector('#hSeq i.cur');
      if (cur && (!window.__hT || performance.now() - window.__hT > 400)) { window.__hT = performance.now(); let k = SYM.indexOf(cur.textContent.trim()); if (k < 0) k = 0; if (cur.classList.contains('rev')) k = OPP[k];
        document.dispatchEvent(new KeyboardEvent('keydown', { code: K[k], bubbles: true })); }
      setTimeout(f, 40); }; f(); }
};

const CLIPS = {
  plankgas: { vp: { width: 390, height: 844 }, dpr: 1, start: `carChaseGame(2,{b:'hatch',c:'#b8322a',n:'Hatchback'})`, bot: 'chase', stage: '#ccStage', dur: 6, lead: 1.2, rec: 11 },
  rennen: { vp: { width: 390, height: 844 }, dpr: 1, start: `fleeGame(2)`, bot: 'flee', stage: '#flStage', dur: 6, lead: 1.2, rec: 11 },
  carjacken: { vp: { width: 360, height: 640 }, dpr: 1, box: '.chase-box', max: 6, start: `(()=>{const m=CARS.find(c=>carTier(c)===2&&!c.leg)||CARS[0];return jackGame(Object.assign({},m,{n:'Hatchback'}),{c:'#3a6fb0',plate:'XX-123-Y',spot:'Stoplicht op de Wibautstraat'})})()`, bot: 'jack', dur: 6, lead: 0, rec: 7.5 },
  contact: { vp: { width: 360, height: 640 }, dpr: 1, box: '.chase-box', max: 7, start: `(()=>{const m=CARS.find(c=>carTier(c)===4&&!c.leg)||CARS[0];return carHeist({id:m.id,c:'#5a6470',plate:'XX-123-Y'})})()`, bot: 'heist', dur: 6, lead: 0, rec: 8 }
};

async function take(b, name, C, i) {
  const vdir = path.join(TMP, name + '-' + i); fs.rmSync(vdir, { recursive: true, force: true });
  const ctx = await b.newContext({ viewport: C.vp, deviceScaleFactor: C.dpr, isMobile: true, hasTouch: true, recordVideo: { dir: vdir, size: C.vp } });
  await ctx.addInitScript(t => { localStorage.setItem('ow_token', t); localStorage.setItem('ow_pwa_hide', 'never'); }, tok);
  const t0 = Date.now(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '/game', { waitUntil: 'networkidle' }); await p.waitForFunction("typeof S!=='undefined'&&S.name", null, { timeout: 30000 });
  await p.evaluate(() => { window.save = () => {}; window.pushState = () => {}; S.tour = 'over'; const t = document.querySelector('#tour'); t && t.remove(); document.querySelectorAll('.modal,#modal').forEach(m => m.hidden = true); });
  await p.addStyleTag({ content: HIDE });
  await p.evaluate(code => { window.__res = undefined; window.__t0g = performance.now(); Promise.resolve(eval(code)).then(r => { window.__res = r; }); const iv = setInterval(() => { if (document.querySelector('.chase-box.won,.chase-box.lost')) { window.__doneAt = performance.now(); clearInterval(iv); } }, 30); }, C.start);
  await p.waitForTimeout(150); await p.addStyleTag({ content: HIDE });
  await p.evaluate(BOTS[C.bot]);
  // het spel loopt pas na de intro; meet wanneer het echt begint
  let playAt = Date.now();
  if (C.bot === 'chase') { await p.waitForFunction(() => { const o = document.querySelector('.cc-ov'); return o && o._cc().playing; }, null, { timeout: 8000 }); playAt = Date.now(); }
  if (C.bot === 'flee') { await p.waitForFunction(() => { const o = document.querySelector('.fl-ov'); return o && o._fl().started; }, null, { timeout: 8000 }).catch(() => {}); playAt = Date.now(); }
  let box = C.stage ? await p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }, C.stage) : null;
  if (C.box) { await p.waitForTimeout(350); box = await p.evaluate(([sel, W, H]) => { const r = document.querySelector(sel).getBoundingClientRect(); // rond de kaart, 9:16
      let w = Math.min(W, r.width + 20), h = w * 16 / 9; if (h > H) { h = H; w = h * 9 / 16; } const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      return [Math.max(0, Math.min(W - w, cx - w / 2)), Math.max(0, Math.min(H - h, cy - h / 2)), w, h]; }, [C.box, C.vp.width, C.vp.height]); }
  const pagePerf0 = await p.evaluate(() => performance.now()); const wall0 = Date.now();
  await p.waitForTimeout(C.rec * 1000);
  const hits = await p.evaluate(() => window.__hitsAt || []); const doneAt = await p.evaluate(() => window.__doneAt || 0); const res = await p.evaluate(() => window.__res);
  await ctx.close(); const vid = fs.readdirSync(vdir).find(f => f.endsWith('.webm'));
  // botsingen omrekenen naar seconden in de video
  const hitSec = hits.map(h => (wall0 - t0) / 1000 + (h - pagePerf0) / 1000);
  const from = (playAt - t0) / 1000 + C.lead, endAt = doneAt ? (wall0 - t0) / 1000 + (doneAt - pagePerf0) / 1000 + 1.25 : 0;
  return { file: path.join(vdir, vid), from, dur: endAt ? Math.min(C.max || 6, endAt - from) : C.dur, hits: hitSec, box, res, errs };
}

function encode(name, C, T) {
  let crop = '';
  if (T.box) { // speelveld bijsnijden tot 9:16
    let [x, y, w, h] = T.box.map(v => v * C.dpr); if (w / h > 9 / 16) { const nw = h * 9 / 16; x += (w - nw) / 2; w = nw; } else { const nh = w * 16 / 9; h = Math.min(h, nh); }
    const e = v => Math.round(v / 2) * 2; crop = `crop=${e(w)}:${e(h)}:${e(x)}:${e(y)},`;
  }
  const D = T.dur || C.dur, ss = T.from.toFixed(2), t = D.toFixed(2);
  const keep = path.join(KEEP, name + '.webm');
  ff(['-ss', ss, '-t', t, '-i', T.file, '-vf', crop + 'fps=24', '-an', '-c:v', 'libvpx-vp9', '-crf', '18', '-b:v', '0', keep]);
  const av1 = path.join(MEDIA, name + '.av1.webm'), h264 = path.join(MEDIA, name + '.h264.mp4'), poster = path.join(POSTER, name + '.webp');
  const fade = `,fade=t=in:st=0:d=0.25,fade=t=out:st=${(D - .3).toFixed(2)}:d=0.3`; // zachte naad bij het herhalen
  let crf = 44; do { ff(['-i', keep, '-vf', `scale=360:640:flags=lanczos,fps=24${fade}`, '-an', '-c:v', 'libsvtav1', '-crf', String(crf), '-g', '48', '-pix_fmt', 'yuv420p', av1]); crf += 4; } while (fs.statSync(av1).size > 190000 && crf < 63);
  crf = 30; do { ff(['-i', keep, '-vf', `scale=360:640:flags=lanczos,fps=24${fade}`, '-an', '-c:v', 'libx264', '-crf', String(crf), '-preset', 'slow', '-pix_fmt', 'yuv420p', '-profile:v', 'main', '-movflags', '+faststart', h264]); crf += 2; } while (fs.statSync(h264).size > 195000 && crf < 45);
  let q = 60; do { ff(['-ss', String(Math.min(3, D / 2)), '-i', keep, '-vf', 'scale=360:640:flags=lanczos', '-frames:v', '1', '-c:v', 'libwebp', '-q:v', String(q), poster]); q -= 8; } while (fs.statSync(poster).size > 9800 && q > 5);
  return { av1: fs.statSync(av1).size, h264: fs.statSync(h264).size, poster: fs.statSync(poster).size };
}

(async () => {
  const b = await chromium.launch();
  for (const name of ONLY) {
    const C = CLIPS[name]; let best = null;
    for (let i = 0; i < TAKES; i++) {
      const T = await take(b, name, C, i);
      const bad = T.hits.filter(h => h >= T.from - .3 && h <= T.from + C.dur + .3).length;
      const ok = C.bot === 'jack' || C.bot === 'heist' ? T.res === true : true;
      console.log(name, 'take', i, 'start', T.from.toFixed(2), 'fouten in venster', bad, 'uitslag', T.res, T.errs.length ? 'ERR ' + T.errs.join('|') : '');
      if (ok && (!best || bad < best.bad)) best = Object.assign(T, { bad });
      if (best && best.bad === 0) break;
    }
    if (!best) { console.log(name, 'GEEN bruikbare take'); continue; }
    console.log(name, 'gekozen', JSON.stringify(encode(name, C, best)));
  }
  await b.close();
})();
