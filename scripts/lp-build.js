// Statische beelden voor de voorpagina, getekend door de echte spelcode (Playwright tegen een lokale server met een testaccount).
//   node scripts/lp-build.js <poort> <tokenbestand>
// Schrijft naar public/img/lp/: woning-{brug,kraak,kamer,gracht,penthouse,villa}.svg (vhScene), cov-{bj,roulette,th}.svg (coverSvg),
// auto-1..5.svg (carSvg, zonder merk), pop-{laag,midden,hoog}.svg (dollSvg, startkleren per winkelstraat) en zaak.svg (bzArt).
// Daarna (met --og) het OG-beeld public/og.jpg: de hero van de voorpagina op 1200×630.
// Nooit tegen de live site draaien.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const port = process.argv[2] || '3999', tokFile = process.argv[3] || '/tmp/claude-0/ovg/tok5';
const OUT = path.join(__dirname, '..', 'public', 'img', 'lp'), BASE = 'http://localhost:' + port;
// lichte opschoning (geen svgo nodig): getallen op 1 decimaal, witruimte weg
const mini = s => s.replace(/(\d+\.\d)\d+/g, '$1').replace(/\.0(?=[^\d])/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
const withNs = s => s.replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  if (!process.argv.includes('--og-only')) {
    const tok = fs.readFileSync(tokFile, 'utf8').trim();
    const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await c.addInitScript(t => { localStorage.setItem('ow_token', t); localStorage.setItem('ow_pwa_hide', 'never'); }, tok);
    const p = await c.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
    await p.goto(BASE + '/game', { waitUntil: 'networkidle' }); await p.waitForFunction("typeof S!=='undefined'&&S.name&&typeof vhScene==='function'", null, { timeout: 30000 });
    const files = await p.evaluate(() => {
      const o = {};
      for (const id of ['brug', 'kraak', 'kamer', 'gracht', 'penthouse', 'villa']) o['woning-' + id] = vhScene(id, { thumb: 1, key: 'lp' });
      for (const id of ['bj', 'roulette', 'th']) o['cov-' + id] = COV.coverSvg(id, 'lp' + id);
      // vijf auto's van stadsauto tot hypercar, zonder merk of kenteken
      [['city', '#5a6470'], ['hatch', '#b8322a'], ['sedan', '#3a6fb0'], ['suv', '#2b2f36'], ['hyper', '#ff7a1a']].forEach(([bd, col], i) => { o['auto-' + (i + 1)] = carSvg(bd, col, {}); });
      // etalagepop per winkelstraat: per lichaamsdeel het goedkoopste stuk uit die straat
      for (const st of ['laag', 'midden', 'hoog']) {
        const wear = {}; ['hoofd', 'kleding', 'nek', 'pols', 'schoenen'].forEach(sl => {
          const it = OUTFITS.filter(x => x.slot === sl && fitStreet(x) === st).sort((a, b) => a.p - b.p)[st === 'laag' ? 0 : 1] || OUTFITS.filter(x => x.slot === sl && fitStreet(x) === st)[0];
          if (it) wear[sl] = it.id; });
        o['pop-' + st] = dollSvg(wear);
      }
      o.zaak = bzArt(BIZ[0], 'lpz');
      return o;
    });
    for (const [k, v] of Object.entries(files)) {
      if (!v) { console.log('LEEG', k); continue; }
      const s = withNs(mini(v)); fs.writeFileSync(path.join(OUT, k + '.svg'), s); console.log(k, s.length);
    }
    await c.close();
  }
  if (process.argv.includes('--og') || process.argv.includes('--og-only')) {
    const c = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const p = await c.newPage(); await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: '.lp-mast,.lp-cijfers,.lp-hero__cta,.lp-klim__pauze,.lp-klim figcaption,.lp-feitjes__dev{display:none!important}.lp-hero{padding:0!important;height:630px;display:flex;flex-direction:column;justify-content:center}.lp-feitjes{margin-top:22px;font-size:15px}' });
    await p.waitForTimeout(400); const buf = await p.screenshot({ type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    fs.writeFileSync(path.join(__dirname, '..', 'public', 'og.jpg'), buf); console.log('og.jpg', buf.length);
    await c.close();
  }
  await b.close();
})();
