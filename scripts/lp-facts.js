// Feiten voor de voorpagina die buiten data.js staan (outfits en winkelstraten uit pages/look.js, GAME_CONST uit data.js).
// Schrijft public/lp/facts.json; de server leest dat bij het opstarten.
//   node scripts/lp-facts.js          → schrijven
//   node scripts/lp-facts.js --check  → alleen vergelijken (npm run lp:check); faalt als facts.json niet meer klopt met de code
const fs = require('fs'), path = require('path'), vm = require('vm');
const PUB = path.join(__dirname, '..', 'public');
function compute() {
  const noop = () => {}, el = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : el), apply: () => el, construct: () => el });
  const ctx = { console: { log: noop, warn: noop, error: noop }, Math, Date, JSON, document: el, localStorage: el, navigator: {}, addEventListener: noop, setTimeout: noop, setInterval: noop, matchMedia: () => ({ matches: false, addEventListener: noop }) };
  ctx.V = {}; ctx.act = {}; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['js/data.js', 'js/pages/look.js']) vm.runInContext(fs.readFileSync(path.join(PUB, f), 'utf8'), ctx, { filename: f });
  return vm.runInContext(`({
    outfits: OUTFITS.filter(o => !fitIsCharm(o)).length,   // in de drie winkelstraten (zonder geluksbrengers)
    streets: FIT_STREETS.map(s => ({ id: s.id, n: s.n, r: s.r.slice() })),
    gameConst: Object.assign({}, GAME_CONST)
  })`, ctx);
}
const out = JSON.stringify(compute(), null, 1) + '\n', file = path.join(PUB, 'lp', 'facts.json');
if (process.argv.includes('--check')) {
  let cur = ''; try { cur = fs.readFileSync(file, 'utf8'); } catch (e) {}
  if (cur !== out) { console.error('public/lp/facts.json klopt niet meer met de code. Draai: node scripts/lp-facts.js'); process.exit(1); }
  console.log('facts.json klopt.');
  // de voorpagina renderen zoals de server dat doet en de getallen en woorden controleren
  const ctx = { console, Math, Date, JSON }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['js/data.js', 'js/covers.js', 'js/jb-core.js', 'js/lp-views.js']) vm.runInContext(fs.readFileSync(path.join(PUB, f), 'utf8'), ctx, { filename: f });
  ctx.__f = JSON.parse(out); const N = vm.runInContext('LPV.facts(__f)', ctx); N.brand = 'Onderwereld';
  const html = ctx.LPV.page(N), txt = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const nl = n => n.toLocaleString('nl-NL'), need = [`${N.ranks} rangen`, `${N.crimes} klussen`, `${N.fams} families`, `${N.cars} auto's`, `${N.cars} modellen`, `${N.biz} soorten zaken`,
    `${N.houses} woningen`, `${N.outfits} kledingstukken`, `${N.slots} eigen kasten`, `€${nl(N.startCash)}`, `in ${N.energyFullMin} minuten`, `tot ${N.garageMax} plekken`, `Vanaf ${N.jackRank}`, `Vanaf ${N.hitRank}`];
  const miss = need.filter(t => !txt.includes(t)), bad = (txt.match(/gokkast|jackpot|\bRTP\b|Max ×/gi) || []);
  if (miss.length || bad.length) { console.error('Voorpagina klopt niet. Ontbreekt:', miss, 'Verboden:', bad); process.exit(1); }
  console.log('Voorpagina: alle getallen uit de code (' + need.length + ' gecontroleerd), geen gokwoorden.');
} else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, out); console.log('Geschreven:', file); process.stdout.write(out); }
