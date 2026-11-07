// Voorpagina van Onderwereld: alle secties als pure functies (N, opts) => html.
// De server (server.js) draait dit in dezelfde vm-context als data.js, covers.js en jb-core.js, vult N met getallen uit de code
// (LPV.facts) en zet de HTML in <main id="app" data-ssr="/">. landing.js rendert de voorpagina niet opnieuw; lp-home.js koppelt
// alleen gedrag (menu, dialog, rail, clips, gang, sticky). Geen DOM, geen globale toestand: werkt in de browser en in vm.
(function (root) {
'use strict';
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = n => Math.round(+n).toLocaleString('nl-NL');
const eur = n => '€' + nl(n);
const lc1 = s => s.charAt(0).toLowerCase() + s.slice(1);
const V = n => (+n).toFixed(1).replace(/\.0$/, '');

/* ================= Feiten: alles uit de code ================= */
// Draait alleen waar data.js geladen is (server-vm). facts = public/lp/facts.json (outfits, winkelstraten, GAME_CONST).
function facts(F) {
  F = F || {}; const G = (typeof GAME_CONST !== 'undefined' ? GAME_CONST : F.gameConst) || {};
  const R = RANKS, rk = i => R[Math.max(0, Math.min(R.length - 1, i))][0];
  const byMax = CRIMES.slice().sort((a, b) => a.max - b.max), low = byMax[0], top = byMax[byMax.length - 1];
  const best = ri => CRIMES.filter(c => c.r <= ri).map(c => ({ c, ev: c.base / 100 * (c.min + c.max) / 2 })).sort((a, b) => b.ev - a.ev)[0].c;
  // woning bij een rang: de goedkoopste die op die rang opengaat; anders de duurste die je al hebt
  const homeAt = ri => { const eq = HOUSES.filter(h => h.r === ri).sort((a, b) => a.p - b.p); if (eq.length) return eq[0]; return HOUSES.filter(h => h.r <= ri).sort((a, b) => b.p - a.p)[0]; };
  const ST = (F.streets || []).slice().sort((a, b) => a.r[1] - b.r[1]);
  const street = ri => { const s = ST.find(x => ri <= x.r[1]) || ST[ST.length - 1]; return s ? s.n : ''; };
  // klus bij een rang: de beste (hoogste verwachte buit, zoals het dashboard), maar onderaan de laagste en bovenaan de hoogste klus
  const at = ri => { const c = ri === 0 ? low : ri === R.length - 1 ? top : best(ri), h = homeAt(ri); return { ri, name: rk(ri), xp: R[ri][1], crime: { n: c.n, min: c.min, max: c.max }, home: { n: h.n, place: h.place, t: h.t }, street: street(ri) }; };
  const brug = HOUSES.find(h => h.id === 'brug'), villa = HOUSES.find(h => h.id === 'villa'), gracht = HOUSES.find(h => h.id === 'gracht');
  const slots = COV.GAMES.filter(g => /slot/i.test(g.kind)).length;
  const fams = FAMILIES.slice().sort((a, b) => a.r - b.r || a.cred - b.cred).map(f => ({ id: f.id, n: f.n, m: f.m, col: f.col, rank: rk(f.r) }));
  const map = typeof jbMap === 'function' ? jbMap(1, 2) : null, path = map ? jbPath(map) : null;
  // Grinden loont: kans en buit per niveau van professionaliteit (zelfde som als crimegames.js: spel × dobbelsteen, zonder spullen)
  const cgg = P => .5 + .49 * (1 - Math.pow(1 - P, 1.6));
  const grind = [[0, 'Beginner'], [.3, 'Gevorderd'], [.55, 'Professional'], [.8, 'Meester'], [1, 'Alles maximaal']].map(([P, n]) =>
    ({ n, P: Math.round(P * 100), kans: Math.round(cgg(P) * Math.min(P >= 1 ? 99 : 95, 58 + 38 * P)), buit: Math.round(.6 * Math.pow(P, 1.5) * 100) }));
  return {
    grind, crimeGames: (typeof CG_TYPES==='object'?Object.keys(CG_TYPES).length:18),
    ranks: R.length, crimes: CRIMES.length, fams: FAMILIES.length, biz: BIZ.length, houses: HOUSES.length, cars: CARS.length,
    games: COV.GAMES.length, slots, outfits: F.outfits || 0, streets: ST.map(s => s.n),
    startCash: G.startCash, energyFullMin: Math.round(G.enBase * G.enRegenS / 60), garageMax: G.garageMax,
    jackRank: rk(G.jackR), hitRank: rk(G.hitR), first: rk(0), last: rk(R.length - 1),
    lowCrime: { n: low.n, min: low.min, max: low.max }, topCrime: { n: top.n, min: top.min, max: top.max },
    homeStart: { n: brug.n, place: brug.place, rank: rk(brug.r) }, homeEnd: { n: villa.n, place: villa.place, rank: rk(villa.r) },
    homeTypes: HOMES.map(h => ({ id: h.id, n: h.n, r: h.r, rank: rk(h.r) })),
    haltes: [at(0), at(gracht.r), at(R.length - 1)],
    rail: R.map((_, i) => at(i)), famList: fams,
    gang: map && path ? { W: map.W, H: map.H, g: map.cell ? Array.from({ length: map.H }, (_, y) => Array.from({ length: map.W }, (_, x) => map.cell(x, y)).join('')) : [], path, t0: (s0 => ({ cone: [...s0.cone], gs: s0.gs }))(jbSeen(map, 0)) } : null
  };
}

/* ================= Kleine bouwstenen ================= */
const IC = {
  crimes: '<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>',
  run: '<circle cx="14" cy="4" r="2"/><path d="M6 21l3-6 3 2 2 5M9 15l1-5 4 1 3 3M10 10l-4 1"/>',
  jail: '<path d="M5 3v18M10 3v18M15 3v18M20 3v18M3 3h19M3 21h19"/>',
  xp: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  cross: '<path d="M6 6l12 12M18 6L6 18"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  house: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
  biz: '<path d="M3 21V8l9-5 9 5v13M9 21v-6h6v6"/>',
  cars: '<path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/>',
  shop: '<path d="M4 7h16l-1.5 12h-13zM9 7V5a3 3 0 016 0v2"/>'
};
const ic = (k, c) => `<svg class="ic${c ? ' ' + c : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${IC[k] || ''}</svg>`;
const kicker = (t, w) => `<p class="lp-kicker"${w ? ` style="--w:var(--w-${w})"` : ''}>${t}</p>`;
const tlink = (href, t, x) => `<a class="tlink" href="${href}"${x || ''}>${t}${ic('arrow')}</a>`;
const age = (n, t) => `<abbr class="age" title="${t || n + ' jaar en ouder'}">${n}+</abbr>`;
const crest = (f, c) => `<span class="crest${c ? ' ' + c : ''}" style="--fc:${f.col}" aria-hidden="true">${esc(f.m)}</span>`;
const img = (src, alt, w, h, x) => `<img src="${src}" alt="${esc(alt || '')}" width="${w}" height="${h}" loading="eager" fetchpriority="low" decoding="async"${x || ''}>`;
const V_IMG = '?v=1';

/* ================= Hero: de klim ================= */
// Seeded random voor de skyline (altijd hetzelfde beeld)
function rng(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// punten langs een polyline op gelijke afstand
function along(P, n) {
  const seg = []; let L = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(d); L += d; }
  const at = f => { let d = f * L, i = 0; while (i < seg.length - 1 && d > seg[i]) { d -= seg[i]; i++; } const t = seg[i] ? d / seg[i] : 0, a = P[i], b = P[i + 1];
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, nx: -(b[1] - a[1]) / seg[i], ny: (b[0] - a[0]) / seg[i] }; };
  return { L, at, pts: Array.from({ length: n }, (_, i) => at(n > 1 ? i / (n - 1) : 0)) };
}
// Variant d (desktop, 640×600) of t (telefoon, 640×400). Geeft {svg, start, end, W, H} terug; start/end in % voor de HTML-kaartjes.
const KLIM = {
  d: { W: 640, H: 600, deck: 452, water: 488, bridgeX: [0, 380], route: [[110, 474], [250, 424], [182, 372], [340, 330], [270, 276], [420, 240], [478, 200]], tower: [560, 70, 44], peet: [500, 206], anchor: 'start', key: 'd' },
  t: { W: 640, H: 400, deck: 318, water: 342, bridgeX: [0, 300], route: [[206, 356], [306, 322], [264, 266], [400, 234], [356, 176], [452, 128], [432, 66]], tower: [596, 210, 30], peet: [418, 52], anchor: 'end', key: 't' }
};
function klimSvg(N, k) {
  const K = KLIM[k], W = K.W, H = K.H, r = rng(k === 'd' ? 2026 : 1102), id = 'k' + k;
  let sky = '', win = '';
  // verre skyline
  for (let x = -10; x < W + 10;) { const w = 26 + r() * 46, h = 50 + r() * (k === 'd' ? 190 : 120), y = K.water - h; sky += `<rect x="${V(x)}" y="${V(y)}" width="${V(w)}" height="${V(h + 4)}"/>`;
    for (let i = 0; i < 4; i++) if (r() < .55) win += `<rect x="${V(x + 5 + r() * (w - 12))}" y="${V(y + 8 + r() * (h - 24))}" width="2.4" height="3.4"/>`; x += w + 4 + r() * 10; }
  const [tx, ty, tw] = K.tower, th = K.water - ty;
  // brug: dek, pijlers en drie bogen (Berlagebrug)
  const [b0, b1] = K.bridgeX, bw = b1 - b0, D = K.deck, Wt = K.water, aw = bw / 3;
  let arches = ''; for (let i = 0; i < 3; i++) { const x0 = b0 + i * aw + 10, x1 = x0 + aw - 20; arches += `M${V(x0)} ${Wt}V${V(D + 22)}Q${V((x0 + x1) / 2)} ${V(D + 6)} ${V(x1)} ${V(D + 22)}V${Wt}`; }
  // route en streepjes
  const A = along(K.route, 20), ticks = A.pts.map((p, i) => { const l = 6; return `<line class="lp-tick${i ? '' : ' lp-tick--0'}" style="--i:${i}" x1="${V(p.x - p.nx * l)}" y1="${V(p.y - p.ny * l)}" x2="${V(p.x + p.nx * l)}" y2="${V(p.y + p.ny * l)}"/>`; }).join('');
  const dots = (N.homeTypes || []).map((h, i) => { const p = A.at(h.r / (N.ranks - 1)); return `<circle class="lp-dot" style="--i:${i}" cx="${V(p.x)}" cy="${V(p.y)}" r="3.4"/>`; }).join('');
  const pl = K.route.map(p => p.join(',')).join(' '), ys = K.route.map(p => p[1]), y0 = Math.max(...ys), y1 = Math.min(...ys);
  const s = A.pts[0], e = A.pts[A.pts.length - 1];
  const svg = `<svg class="lp-klim__svg lp-klim__svg--${k}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
<defs><linearGradient id="${id}r" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}"><stop offset="0" stop-color="#565b64"/><stop offset=".55" stop-color="#ff7a1a"/><stop offset="1" stop-color="#f2c230"/></linearGradient>
<radialGradient id="${id}f"><stop offset="0" stop-color="#ffd2ad" stop-opacity=".7"/><stop offset=".25" stop-color="#ff7a1a" stop-opacity=".35"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<pattern id="${id}w" width="8" height="10" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="3" height="4" fill="#ffad6b" opacity=".45"/></pattern></defs>
<g fill="#12151a">${sky}</g><g fill="#a9dcff" opacity=".25">${win}</g>
<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="#171a20" stroke="rgba(255,173,107,.14)"/><rect x="${tx + 4}" y="${ty + 8}" width="${tw - 8}" height="${th - 16}" fill="url(#${id}w)"/>
<rect x="0" y="${Wt}" width="${W}" height="${H - Wt}" fill="#4682be" fill-opacity=".16"/>
<g stroke="#ffad6b" stroke-opacity=".22" stroke-width="1.5" stroke-linecap="round">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${V(30 + i * 97 + (i % 2) * 20)} ${V(Wt + 14 + (i % 3) * 22)}h${28 + (i % 3) * 14}"/>`).join('')}</g>
<ellipse cx="${V(b0 + aw * .62)}" cy="${Wt - 8}" rx="${V(aw * .7)}" ry="${V((Wt - D) * 1.6)}" fill="url(#${id}f)"/>
<path d="M${b0} ${D}H${b1}V${D + 22}H${b0}Z" fill="#2a1c17"/><path d="${arches}" fill="#1a1210"/>
<path d="M${b0} ${D - 2}H${b1}" stroke="#2b3038" stroke-width="2"/><path d="M${b0} ${D + 22}H${b1}" stroke="#1a1210" stroke-width="3"/>
<polyline class="lp-route" points="${pl}" fill="none" stroke="url(#${id}r)" stroke-width="${k === 'd' ? 2 : 2.5}" stroke-linecap="round" stroke-linejoin="round" pathLength="1000"/>
<g class="lp-ticks" stroke="#565b64" stroke-width="2" stroke-linecap="round">${ticks}</g><g class="lp-dots" fill="#ff7a1a">${dots}</g>
<text class="lp-klim__peet" x="${K.peet[0]}" y="${K.peet[1]}" text-anchor="${K.anchor}">${esc(N.last)}</text>
</svg>`;
  return { svg, W, H, start: [s.x / W * 100, s.y / H * 100], end: [e.x / W * 100, e.y / H * 100], deck: D / H * 100, b1: b1 / W * 100, water: Wt / H * 100 };
}
function klim(N) {
  const d = klimSvg(N, 'd'), t = klimSvg(N, 't');
  const card = (cls, a, b, src, alt) => `<div class="lp-klim__stop lp-klim__stop--${cls} dossier"><img src="${src}" alt="${esc(alt)}" width="140" height="96" decoding="async"><p><b>${a}</b> <span>${b}</span></p></div>`;
  const pos = (v, p) => `--${p}sx:${V(v.start[0])}%;--${p}sy:${V(v.start[1])}%;--${p}ex:${V(v.end[0])}%;--${p}ey:${V(v.end[1])}%;--${p}deck:${V(v.deck)}%;--${p}bx:${V(v.b1)}%;--${p}wy:${V(v.water)}%`;
  return `<figure class="lp-klim" id="klim" style="${pos(d, 'd')};${pos(t, 't')}">
 <div class="lp-klim__stage">${d.svg}${t.svg}
  <div class="lp-amb" aria-hidden="true"><i class="lp-amb__tram"></i><i class="lp-amb__water"></i><i class="lp-amb__sirene"></i><i class="lp-amb__raam" style="--x:21%;--y:49%"></i><i class="lp-amb__raam" style="--x:63%;--y:58%;--d:2.3s"></i><i class="lp-amb__raam" style="--x:88%;--y:40%;--d:4.1s"></i></div>
  ${card('start', 'Rang 1 · ' + esc(N.first), esc(N.homeStart.n) + ' · ' + esc(N.homeStart.place), '/img/lp/woning-brug.svg' + V_IMG, N.homeStart.n)}
  ${card('end', 'Vanaf ' + esc(N.homeEnd.rank), esc(N.homeEnd.n) + ' · ' + esc(N.homeEnd.place), '/img/lp/woning-villa.svg' + V_IMG, N.homeEnd.n)}
  <button class="lp-klim__pauze" type="button" aria-pressed="false" hidden>Beweging pauzeren</button>
 </div>
 <figcaption>Van ${esc(N.first)} onder de ${esc(N.homeStart.place)} naar een ${lc1(esc(N.homeEnd.n))} in ${esc(N.homeEnd.place)}: ${N.ranks} rangen.</figcaption>
</figure>
<script>(function(){var k=document.getElementById('klim'),h=document.documentElement;if(!k||!h.classList.contains('js'))return;var m=window.matchMedia;if(m&&m('(prefers-reduced-motion: reduce)').matches)return;
function go(){k.classList.add('go')}var r=k.getBoundingClientRect();if(r.top<innerHeight*.75&&r.bottom>0){go();return}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].intersectionRatio>=.4){go();io.disconnect()}},{threshold:[0,.4]});io.observe(k)}})()</script>`;
}

const cijfersHtml = (N, cls) => `<nav class="lp-cijfers${cls || ''}" aria-label="Het spel in getallen">
  <a class="lp-cijfer" href="/rangen"><b>${N.ranks}</b> <span>rangen</span> <small>van ${esc(N.first)} tot ${esc(N.last)}</small></a>
  <a class="lp-cijfer" href="/misdaden"><b>${N.crimes}</b> <span>klussen</span> <small>van ${lc1(esc(N.lowCrime.n))} tot ${lc1(esc(N.topCrime.n))}</small></a>
  <a class="lp-cijfer" href="/families"><b>${N.fams}</b> <span>families</span> <small>van de jonge honden tot de oudste van Europa</small></a>
  <a class="lp-cijfer" href="/#imperium"><b>${N.cars}</b> <span>auto's</span> <small>van stadsauto tot hypercar</small></a>
 </nav>`;
function hero(N, o) {
  const cijfers = cijfersHtml(N);
  return `<section class="lp-hero" id="top" aria-labelledby="h1">
 <div class="lp-hero__in">
  <div class="lp-hero__copy">
   <p class="lp-kicker lp-hero__kick" style="--w:var(--w-straat)" data-li="kick">Iedereen begint onderaan.</p>
   <h1 class="lp-h1" id="h1"><span>Van ${esc(N.first)}</span> <span>tot <em>${esc(N.last)}.</em></span></h1>
   <p class="lp-lede" data-li="lede">Gratis maffiaspel in je browser. Je begint met ${eur(N.startCash)} onder de ${esc(N.homeStart.place)} en klimt via de misdaad door ${N.ranks} rangen naar de top.</p>
   <div class="lp-hero__cta" data-li="cta"><a class="btn btn--lg" id="heroCta" href="/start" data-auth="register" data-cta="hero">Speel gratis</a> <a class="tlink" href="/?login=1" data-auth="login">Inloggen${ic('arrow')}</a></div>
   <ul class="lp-feitjes" aria-label="In het kort"><li>Gratis</li><li>${age(16)}</li><li class="lp-feitjes__dev">Telefoon en computer</li><li>Alleen spelgeld</li></ul>
  </div>
  ${klim(N)}
 </div>
 ${cijfers}
</section>`;
}

/* ================= Zo werkt het ================= */
function lus(N) {
  const S = [
    ['crimes', 'straat', 'Doe een klus.', 'Zakkenrollen op de Dam, fietsen bij het station, later een geldtransport. Elke klus is een kort spelletje: grijpen, sluipen, een slot of een kluis kraken.', N.crimes + ' klussen'],
    ['run', 'politie', 'Betrapt? Rennen.', 'Gaat het fout, dan vlucht je zelf: te voet door de steeg of met plankgas door de stad.', 'Je speelt het zelf'],
    ['jail', 'politie', 'Gepakt? Ontsnap.', 'De bajes is geen game over. Werk tijd van je straf af, betaal borg of vijl de tralies door.', 'Drie fases'],
    ['xp', 'straat', 'Word er beter in.', 'Hoe vaker je een klus doet, hoe makkelijker het spel en hoe groter de buit. Elke rang opent nieuwe klussen, families en woningen.', N.ranks + ' rangen']];
  return `<section class="lp-sec lp-lus" id="zo-werkt-het" aria-labelledby="h-lus">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Zo werkt het', 'straat')}<h2 class="lp-h2" id="h-lus">Zo kom je boven.</h2></div>
  <ol class="lp-stappen">${S.map((s, i) => `<li class="lp-stap kaart rv" style="--w:var(--w-${s[1]})"><span class="lp-stap__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>${ic(s[0], 'lp-stap__ic')}<h3>${s[2]}</h3><p>${s[3]}</p><span class="chip">${s[4]}</span></li>`).join('')}</ol>
  <p class="lp-note">Je energie is in ${N.energyFullMin} minuten weer vol. Even spelen kan altijd.</p>
  ${cijfersHtml(N, ' lp-cijfers--tel')}
 </div>
</section>`;
}

/* ================= Grinden loont ================= */
function grind(N) {
  const L = N.grind || [], w = ['straat', 'straat', 'geld', 'jij', 'jij'];
  const WAT = [['40%', 'Vaker doen', 'Elke gelukte klus maakt je handiger. Na zo\'n 150 keer ken je hem blind.'],
    ['25%', 'Ervaring in de soort', 'Wie veel steelt, steelt overal beter. Inbraak, oplichting en smokkel tellen elk apart.'],
    ['20%', 'Training', 'In de sportschool en op de schietbaan. Vingervlugheid helpt bij zakkenrollen, Ademhaling bij een kluis.'],
    ['15%', 'Rang', 'Een klus onder je rang gaat je makkelijker af. En je rang geeft je buit een zetje.']];
  return `<section class="lp-sec lp-grind" id="grinden" aria-labelledby="h-grind">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Grinden loont', 'jij')}<h2 class="lp-h2" id="h-grind">Van een op de drie. <em>Naar bijna altijd.</em></h2>
   <p class="lp-lede">Elke klus is een van ${N.crimeGames} spelletjes. Als beginner is het spel krap en lukt ongeveer een op de drie. Hoe professioneler je wordt, hoe ruimer het spel, hoe groter je kans en hoe dikker de buit.</p></div>
  <div class="lp-grind__grid">
   <figure class="lp-ladder kaart" style="--w:var(--w-jij)"><figcaption><span>Per klus</span><span>kans · extra buit</span></figcaption>
    <ol>${L.map((x, i) => `<li style="--c:var(--w-${w[i]})"><span class="lp-ladder__n">${esc(x.n)}<small>${x.P}% professioneel</small></span><span class="lp-ladder__bar" aria-hidden="true"><i style="width:${x.kans}%"></i></span><b class="num">${x.kans}%</b><em class="num">${x.buit ? '+' + x.buit + '%' : '—'}</em></li>`).join('')}</ol>
    <p class="lp-ladder__voet">Kans van een gemiddelde speler, zonder spullen, outfit of familie. Speel je foutloos, dan krijg je er nog tot 8% buit bij.</p></figure>
   <div class="lp-grind__wat"><h3 class="lp-grind__h">Waar professionaliteit uit bestaat</h3>
    <ul>${WAT.map(x => `<li class="kaart"><b class="num">${x[0]}</b><div><h4>${x[1]}</h4><p>${x[2]}</p></div></li>`).join('')}</ul></div>
  </div>
  <ul class="lp-grind__chips" aria-label="Wat grinden nog meer oplevert"><li class="chip">Meester? Klus snel uitvoeren zonder spel</li><li class="chip">Getraind rennen: lastige vlucht 36% → 70%</li><li class="chip">Kalmte: minder paniek onder druk</li><li class="chip">Nooit 100%: de straat blijft de straat</li></ul>
 </div>
</section>`;
}

/* ================= Minigames ================= */
// bewegende laag van de gang: lichtkegels, bewakers en de speler (zelfde tekening in lp-home.js)
function gangDyn(cone, gs, p, ox, oy, c) {
  return cone.map(k => { const [x, y] = k.split(','); return `<rect x="${ox + x * c + 2}" y="${oy + y * c + 2}" width="${c - 4}" height="${c - 4}" fill="#ffd27a" fill-opacity=".2"/>`; }).join('')
    + gs.map(g => `<circle cx="${ox + g.x * c + c / 2}" cy="${oy + g.y * c + c / 2}" r="${c * .3}" fill="#a9dcff"/><circle cx="${ox + (g.x + g.dx * .32) * c + c / 2}" cy="${oy + (g.y + g.dy * .32) * c + c / 2}" r="${c * .09}" fill="#0b0d10"/>`).join('')
    + `<circle cx="${ox + p[0] * c + c / 2}" cy="${oy + p[1] * c + c / 2}" r="${c * .28}" fill="#ff7a1a" stroke="#0b0d10" stroke-width="3"/>`;
}
function gangSvg(N) {
  const G = N.gang; if (!G) return '';
  const c = 46, ox = (360 - G.W * c) / 2, oy = 70;
  let cells = '';
  G.g.forEach((row, y) => [...row].forEach((ch, x) => {
    const X = ox + x * c, Y = oy + y * c;
    if (ch === '#') cells += `<rect x="${X}" y="${Y}" width="${c}" height="${c}" fill="#1c2027"/>`;
    else { cells += `<rect x="${X + .5}" y="${Y + .5}" width="${c - 1}" height="${c - 1}" fill="${ch === 'E' ? '#12301f' : ch === 'S' ? '#2a1c17' : '#101318'}"/>`;
      if (ch === 'c') cells += `<rect x="${X + 7}" y="${Y + 7}" width="${c - 14}" height="${c - 14}" rx="3" fill="#4a3424" stroke="#6b4c33"/>`;
      if (ch === 'L') cells += `<circle cx="${X + c / 2}" cy="${Y + c / 2}" r="${c / 4}" fill="#3a3f48" stroke="#a9dcff" stroke-opacity=".5"/>`;
      if (ch === 'E') cells += `<text x="${X + c / 2}" y="${Y + c / 2 + 5}" text-anchor="middle" class="lp-gang__t" fill="#3fe395">UIT</text>`; }
  }));
  // veilige route als stippellijn (eindbeeld = poster = reduced motion)
  let x = 0, y = 0; G.g.forEach((row, yy) => { const i = row.indexOf('S'); if (i >= 0) { x = i; y = yy; } });
  const pts = [[x, y]]; G.path.forEach(([dx, dy]) => { x += dx; y += dy; if (dx || dy) pts.push([x, y]); });
  const P = pts.map(([a, b]) => `${ox + a * c + c / 2},${oy + b * c + c / 2}`).join(' ');
  return `<svg class="lp-gang" viewBox="0 0 360 640" aria-hidden="true" focusable="false" data-ox="${ox}" data-oy="${oy}" data-c="${c}">
<rect width="360" height="640" fill="#0b0d10"/><text x="18" y="38" class="lp-gang__t" fill="#a9dcff">FASE 2 · DE GANG</text><text x="342" y="38" text-anchor="end" class="lp-gang__t" fill="#8a8f98">${G.path.length} STAPPEN</text>
${cells}<polyline class="lp-gang__route" points="${P}" fill="none" stroke="#ff7a1a" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/><g class="lp-gang__dyn">${gangDyn(G.t0.cone, G.t0.gs, pts[0], ox, oy, c)}</g>
<text x="180" y="${oy + G.H * c + 34}" text-anchor="middle" class="lp-gang__t" fill="#8a8f98">BLIJF UIT DE LICHTKEGELS</text></svg>`;
}
function games(N) {
  const G = [
    ['rennen', 'Rennen!', 'Betrapt? Weg door de steeg. Wissel van baan, spring en buk, en struikel niet te vaak.', 'Na een mislukte klus', 'straat'],
    ['plankgas', 'Plankgas!', 'Met een gestolen auto door de stad. Ontwijk het verkeer, geef nitro en neem een zijstraat.', "Bij auto's stelen", 'straat'],
    ['gang', 'Ontsnappen', 'Vijl de tralies in het ritme, sluip door de gang langs de lichtkegels en klim over de muur.', 'Als je vastzit', 'politie'],
    ['carjacken', 'Carjacken', 'Tankstation, stoplicht, parkeergarage of een valse aanrijding. Kies je auto uit drie, speel je aanpak en rij weg.', 'Vanaf ' + esc(N.jackRank), 'straat'],
    ['contact', 'Contact maken', 'Een geparkeerde auto starten zonder sleutel: toets de pijlen in de goede volgorde voor de tijd op is. Een rode pijl druk je andersom.', 'Bij straat afzoeken', 'straat']];
  const media = (g) => g[0] === 'gang'
    ? `<div class="lp-game__media lp-game__live" data-live="gang">${gangSvg(N)}<span class="lp-game__hud">Live · de echte gang</span><button class="lp-game__pauze" type="button" aria-pressed="true" aria-label="Gang van Ontsnappen: afspelen" hidden>${ic('pause')}</button></div>`
    : `<div class="lp-game__media"><video muted playsinline loop preload="none" poster="/img/lp/${g[0]}.webp${V_IMG}" aria-hidden="true" width="360" height="640" tabindex="-1">
     <source data-src="/media/lp/${g[0]}.av1.webm${V_IMG}" type='video/webm; codecs="av01.0.05M.08"'><source data-src="/media/lp/${g[0]}.h264.mp4${V_IMG}" type="video/mp4"></video>
     <span class="lp-game__hud">Clip uit het spel</span><button class="lp-game__pauze" type="button" aria-pressed="false" aria-label="Clip van ${esc(g[1].replace('!', ''))}: pauzeren" hidden>${ic('pause')}</button></div>`;
  return `<section class="lp-sec lp-games" id="minigames" aria-labelledby="h-games">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Geen dobbelsteen', 'straat')}<h2 class="lp-h2" id="h-games">Je rent, rijdt en <em>ontsnapt zelf.</em></h2>
   <p class="lp-lede">Elke klus speel je zelf, en gaat hij mis, dan begint het pas. Wat er daarna gebeurt, hangt van jou af, niet van een percentage.</p></div>
 </div>
 <ul class="lp-games__rij" tabindex="0" aria-label="Vijf minigames">${G.map((g, i) => `<li class="lp-game" style="--w:var(--w-${g[4]})" data-i="${i}">${media(g)}<h3>${g[1]}</h3><p>${g[2]}</p><span class="chip">${g[3]}</span></li>`).join('')}</ul>
 <div class="lp-wrap"><p class="lp-games__hint" aria-hidden="true"><span data-teller>1 / ${G.length}</span> · veeg →</p>
  <p class="lp-games__oefen">Eerst oefenen? Rennen, contact maken en wegrijden kun je in het spel zonder gevolgen proberen. ${tlink('/start', 'Probeer het zelf', ' data-auth="register" data-cta="games"')}</p></div>
</section>`;
}

/* ================= Loopbaan ================= */
const haltRows = h => `<dl><div><dt>Klus</dt><dd>${esc(h.crime.n)} · <span class="num">${eur(h.crime.min)}–${eur(h.crime.max)}</span></dd></div><div><dt>Je slaapt</dt><dd>${esc(h.home.n)} · ${esc(h.home.place)}</dd></div><div><dt>Je kleren</dt><dd>${esc(h.street)}</dd></div></dl>`;
function halte(h, cls, N) {
  return `<article class="lp-halte lp-halte--${cls} kaart"${cls === 'mid' ? ' id="halteMid"' : ''}>
  <div class="lp-halte__img">${img('/img/lp/woning-' + h.home.t + '.svg' + V_IMG, '', 160, 100, ' data-h-img')}</div>
  <div class="lp-halte__txt"><p class="lp-halte__rang" data-h-rang>Rang ${h.ri + 1} · <span class="num">${nl(h.xp)}</span> XP</p><h3 data-h-name${cls === 'mid' ? ' aria-live="polite"' : ''}>${esc(h.name)}</h3><div data-h-rows>${haltRows(h)}</div></div></article>`;
}
function loopbaan(N) {
  const [a, b, c] = N.haltes, n = N.rail.length;
  const rail = N.rail.map(r => ({ i: r.ri, n: r.name, xp: r.xp, c: [r.crime.n, r.crime.min, r.crime.max], h: [r.home.n, r.home.place, r.home.t], s: r.street }));
  return `<section class="lp-sec lp-loopbaan" id="loopbaan" aria-labelledby="h-loop">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Je loopbaan', 'jij')}<h2 class="lp-h2" id="h-loop">${N.ranks} rangen. <em>Eén weg naar boven.</em></h2>
   <p class="lp-lede">Van een bekertje bij Centraal tot de kroonjuwelen. Zo ziet je leven eruit op drie momenten. Alles komt uit het spel.</p></div>
  <div class="lp-haltes">${halte(a, 'start', N)}${halte(b, 'mid', N)}${halte(c, 'top', N)}</div>
  <div class="lp-rail" data-mid="${b.ri}">
   <div class="lp-rail__track"><ol class="lp-rail__lijst" aria-label="Alle ${n} rangen">${N.rail.map((r, i) => `<li class="lp-rail__tick${i <= b.ri ? ' on' : ''}" title="Rang ${i + 1} · ${esc(r.name)}"><span>${esc(r.name)}</span></li>`).join('')}</ol></div>
   <div class="lp-rail__ctl" hidden><button class="tlink lp-rail__play" type="button">Speel je carrière af</button></div>
  </div>
  <p class="lp-note">Vanaf ${esc(N.hitRank)} komen er huurmoorden bij: een opdracht, een methode en weinig tijd.</p>
  <p>${tlink('/rangen', `Alle ${N.ranks} rangen en wat ze openen`)}</p>
 </div>
 <script type="application/json" id="lpRail">${JSON.stringify(rail).replace(/</g, '\\u003c')}</script>
</section>`;
}

/* ================= Imperium ================= */
function imperium(N) {
  const F = N.famList, n = F.length;
  const keten = `<ol class="lp-keten" aria-label="De ${n} families, van zwak naar sterk">${F.map((f, i) => `<li style="--fc:${f.col};--h:${V(20 + i / (n - 1) * 80)}%"><a href="/families/${f.id}">${crest(f, 'sm')}<span class="lp-keten__bar" aria-hidden="true"></span><b>${esc(f.n)}</b> <small>vanaf ${esc(f.rank)}</small></a></li>`).join('')}</ol>`;
  const woningen = N.homeTypes.map(h => `<li>${img('/img/lp/woning-' + h.id + '.svg' + V_IMG, h.n, 160, 100)}<span>${esc(h.n)} <small>${esc(h.rank)}</small></span></li>`).join('');
  return `<section class="lp-sec lp-imperium" id="imperium" aria-labelledby="h-fam">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Wat je opbouwt', 'macht')}<h2 class="lp-h2" id="h-fam">Kies je familie. <em>Klim in de hiërarchie.</em></h2>
   <div><p class="lp-lede">${N.fams} families, van de jonge honden uit West tot de oudste familie van Europa. Hoe hoger, hoe zwaarder de deur. Binnen een familie klim je van Aspirant tot Baas.</p>
   <ul class="lp-chips"><li class="chip">Dagelijkse missies</li><li class="chip">Elke familie een eigen voordeel</li><li class="chip">Oorlog om de stad</li></ul></div></div>
  ${keten}
  <div class="lp-keten__voet"><p class="lp-note">De families zijn verzonnen en worden door het spel gespeeld. Jij kiest bij wie je hoort.</p>${tlink('/families', 'Alle families')}</div>
  <h2 class="lp-h2 lp-h2--b" id="h-bezit">Wat je verdient, <em>laat je zien.</em></h2>
  <div class="lp-tegels">
   <article class="lp-tegel lp-tegel--woning kaart rv" style="--w:var(--w-leven)"><ul class="lp-woningen">${woningen}</ul><h3>Woning</h3><p>Van een matras onder de ${esc(N.homeStart.place)} tot een landgoed in het Gooi. ${N.houses} woningen, en je richt ze zelf in.</p></article>
   <article class="lp-tegel kaart rv" style="--w:var(--w-geld)"><div class="lp-tegel__img">${img('/img/lp/zaak.svg' + V_IMG, '', 320, 200)}</div><h3>Zaken</h3><p>Van een fietsverhuur tot een casino. ${N.biz} soorten zaken die elke speldag uitbetalen. En je zwarte geld was je er wit mee, inclusief btw.</p></article>
   <article class="lp-tegel kaart rv" style="--w:var(--w-straat)"><div class="lp-tegel__img lp-autos">${[1, 2, 3, 4, 5].map(i => img('/img/lp/auto-' + i + '.svg' + V_IMG, '', 200, 90)).join('')}</div><h3>Auto's</h3><p>${N.cars} modellen, van stadsauto tot hypercar. Stelen, verkopen of houden. Je garage groeit mee tot ${N.garageMax} plekken.</p></article>
   <article class="lp-tegel lp-tegel--outfit kaart rv" style="--w:var(--w-macht)"><div class="lp-tegel__img lp-poppen">${['laag', 'midden', 'hoog'].map(s => img('/img/lp/pop-' + s + '.svg' + V_IMG, '', 80, 160)).join('')}</div><h3>Outfit</h3><p>${N.outfits} kledingstukken en sieraden in drie winkelstraten: ${N.streets.map(esc).join(', ').replace(/, ([^,]*)$/, ' en $1')}. Drie stuks in dezelfde stijl geven een setbonus.</p></article>
  </div>
 </div>
</section>`;
}

/* ================= Casino (bijzaak, gedempt) ================= */
function casino(N) {
  const C = [['bj', 'Blackjack', 'blackjack'], ['roulette', 'Roulette', 'roulette'], ['th', "Texas Hold'em", 'texas-holdem']];
  return `<section class="lp-casino" id="casino" aria-labelledby="h-cas">
 <div class="lp-wrap"><div class="lp-casino__in">
  <div class="lp-casino__txt">${kicker('Ook in de stad', 'geld')}<h2 class="lp-h2 lp-h2--s" id="h-cas">En voor je zwarte geld: het casino.</h2>
   <p>Blackjack, roulette, poker en ${N.slots} eigen kasten. Het huis wint, ook hier.</p>
   <p class="lp-casino__regel">${age(18, '18 jaar en ouder')} Alleen spelgeld. Niets te winnen of uit te betalen.</p></div>
  <ul class="lp-casino__covers">${C.map(c => `<li><a href="/casino/${c[2]}">${img('/img/lp/cov-' + c[0] + '.svg' + V_IMG, '', 140, 96)}<span class="sr-only">${c[1]}</span></a></li>`).join('')}</ul>
  <p class="lp-casino__link">${tlink('/casino', 'Bekijk het casino')}</p>
 </div></div>
</section>`;
}

/* ================= Eerlijk + FAQ ================= */
function faqList(N) {
  const B = esc(N.brand || 'Onderwereld');
  return [
    ['Wat is ' + B + '?', `Een gratis Nederlands maffiaspel in je browser. Je begint als ${esc(N.first)} met ${eur(N.startCash)} spelgeld en werkt je via ${N.ranks} rangen op tot ${esc(N.last)}: ${N.crimes} klussen, vluchtpartijen die je zelf speelt, auto's, ${N.fams} families, zaken, een woning en training. Alles is verzonnen.`],
    ['Vanaf welke leeftijd?', 'Het spel is voor 16 jaar en ouder, want het gaat over misdaad. Het casino in het spel is voor 18+. Alle namen, families en verhalen zijn verzonnen.'],
    ['Kost het iets?', 'Nee. Spelen is gratis en blijft gratis. Binnenkort kun je er vrijwillig VIP of High roller bij nemen; betalen kan nu nog niet. Codes in het spel kosten geen echt geld.'],
    ['Is het pay-to-win?', 'Nu is er niets te koop. Straks geven VIP en High roller voordelen in het spel, zoals meer slaagkans en kortere wachttijden (<a href="/lidmaatschap">alles op een rij</a>). Elke rang is ook gratis te halen, en alles blijft spelgeld.'],
    ['Speel ik met echt geld?', 'Nee. Alle bedragen zijn virtueel spelgeld. Je kunt geen echt geld inzetten, winnen of uitbetalen, ook niet in het casino.'],
    ['Moet ik iets downloaden?', `Nee. Je speelt in je browser, op de computer en op je telefoon. Op je telefoon kun je ${B} ook op je beginscherm zetten, dan opent hij als een app.<span data-faq-app></span>`],
    ['Wordt mijn voortgang bewaard?', 'Ja. Je voortgang staat op de server bij je account, dus je kunt op een ander apparaat inloggen en verder spelen. Je speelt op één apparaat tegelijk: open je het spel ergens anders, dan gaat het daar verder.'],
    ['Wachtwoord vergeten?', 'Je geeft geen e-mailadres op, dus wachtwoordherstel bestaat nu nog niet. Kies een wachtwoord dat je onthoudt, of laat je browser het bewaren.'],
    ['Wie staan er op de ranglijst?', 'Echte spelers, tussen rivalen die het spel zelf laat meespelen. Echte spelers hebben in de ranglijst het label SPELER.'],
    ['Lijkt het op Omerta?', 'Een beetje: je klimt in rang met klussen. Maar hier speel je de vluchtpartijen zelf, en het speelt zich af in Amsterdam.']];
}
function eerlijk(N) {
  const wel = ['Gratis spelen', 'Je voortgang op de server, op elk apparaat', 'Zonder download, ook als app op je beginscherm', `${N.crimes} klussen, ${N.ranks} rangen, ${N.fams} families`, 'Alleen een naam en wachtwoord, geen e-mail'];
  const niet = ['Geen echt geld: niet inzetten, niet winnen, niet uitbetalen', 'Nu niets te koop met echt geld; VIP en High roller komen later, vrijwillig', 'Geen echte personen of gebeurtenissen'];
  return `<section class="lp-sec lp-eerlijk" id="faq" aria-labelledby="h-eerlijk">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Eerlijk is eerlijk')}<h2 class="lp-h2" id="h-eerlijk">Wat je wel en niet krijgt.</h2></div>
  <div class="lp-welniet">
   <div class="kaart lp-wel" style="--w:var(--w-geld)"><h3>Wel</h3><ul>${wel.map(t => `<li>${ic('check')}<span>${t}</span></li>`).join('')}</ul></div>
   <div class="kaart lp-niet" style="--w:var(--deco)"><h3>Niet</h3><ul>${niet.map(t => `<li>${ic('cross')}<span>${t}</span></li>`).join('')}</ul></div>
  </div>
  <h2 class="lp-h2 lp-h2--b" id="h-faq">Vragen</h2>
  <div class="faq-list">${faqList(N).map((f, i) => `<details class="faq-q"><summary><span class="faq-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(f[0])}</b><i class="faq-x" aria-hidden="true"></i></summary><div class="faq-a"><p>${f[1]}</p></div></details>`).join('')}</div>
 </div>
</section>`;
}

/* ================= Slot-CTA ================= */
function slot(N) {
  return `<section class="lp-slot" aria-labelledby="h-slot">
 <div class="lp-wrap"><div class="lp-slot__in dossier">
  <div class="lp-slot__txt">
   <h2 class="lp-h2 lp-slot__h" id="h-slot" data-li="slotH">De stad <em>wacht niet.</em></h2>
   <p class="lp-lede">Je begint onder de brug. Waar je eindigt, bepaal jij.</p>
   <div data-li="slotCta"><a class="btn btn--lg" href="/start" data-auth="register" data-cta="slot">Speel gratis</a></div>
   <p class="lp-slot__klein">Gratis · ${age(16)} · Alleen spelgeld · Alleen een naam en wachtwoord, geen e-mail</p>
  </div>
  <div class="lp-slot__beeld" aria-hidden="true"><svg viewBox="0 0 300 260" class="lp-slot__route"><defs><linearGradient id="slr" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff7a1a"/><stop offset="1" stop-color="#f2c230"/></linearGradient></defs><polyline points="40,260 120,214 86,170 196,136 160,96 230,70" fill="none" stroke="url(#slr)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#565b64" stroke-width="2" stroke-linecap="round"><path d="M74 236l6 9M103 214l7 8M97 186l-8 6M140 160l3 10M182 140l3 10M175 110l-8 5M206 82l4 9"/></g></svg>
   ${img('/img/lp/woning-villa.svg' + V_IMG, '', 320, 200, ' class="lp-slot__villa"')}</div>
 </div></div>
</section>`;
}


/* ================= Lidmaatschap: VIP en High roller (lid-data.js) ================= */
// Nog zonder betaling: de knoppen openen alleen een melding "Binnenkort beschikbaar" (script hieronder). Prijzen VOORLOPIG (lid-data.js).
const LIDD = () => (typeof LID !== 'undefined' ? LID : (root.LID || null));
const lidTag = (t, i) => i === 2 ? '<i class="lp-tag lp-tag--hr">HIGH ROLLER</i>' : i === 1 ? '<i class="lp-tag lp-tag--vip">VIP</i>' : '<i class="lp-tag">GRATIS</i>';
function lidPlan(L, t, i, h) {
  const paid = i > 0;
  return `<article class="lp-plan lp-plan--${t.id}" data-tier="${i}">
  <span class="lp-plan__jij" hidden>Jouw lidmaatschap</span>
  <header>${lidTag(t, i)}<${h} class="lp-plan__n">${esc(t.n)}</${h}><p>${esc(t.line)}</p></header>
  <p class="lp-plan__prijs"><b>${L.eur(t.price)}</b> <span>${paid ? 'per maand' : 'voor altijd'}</span>${paid && L.PRICE_VOORLOPIG ? '<em>voorlopige prijs</em>' : ''}</p>
  <ul class="lp-plan__lijst">${i ? `<li class="lp-plan__alles">${ic('check')}<span>Alles van ${i === 2 ? 'VIP' : 'Gratis'}, plus:</span></li>` : ''}${t.key.map(k => `<li>${ic('check')}<span>${esc(k)}</span></li>`).join('')}</ul>
  <div class="lp-plan__voet">${paid ? `<button class="btn btn--block lp-plan__koop" type="button" data-lid-koop="${i}" data-naam="${esc(t.n)}" data-prijs="${L.eur(t.price)}">${i === 2 ? 'Word High roller' : 'Word VIP'}</button><small>Betalen komt eraan</small>` : `<a class="btn btn--block lp-plan__gratis" href="/start" data-auth="register" data-cta="lid">Speel gratis</a><small>Geen account met betaalgegevens nodig</small>`}</div>
 </article>`;
}
function lidScript() {
  return `<dialog class="lp-lid-dlg" id="lidDlg" aria-labelledby="lidDlgT"><form method="dialog"><p class="lp-kicker" id="lidDlgK"></p><h2 class="lp-h2 lp-h2--s" id="lidDlgT">Binnenkort beschikbaar</h2>
<p>Betalen komt eraan. Zodra het kan, neem je het lidmaatschap hier per maand. Tot die tijd gebeurt er niets: er wordt niets afgeschreven en je account blijft zoals hij is.</p><button class="btn btn--block" value="ok">Begrepen</button></form></dialog>
<script>(function(){var d=document.getElementById('lidDlg');document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-lid-koop]');if(!b)return;e.preventDefault();
document.getElementById('lidDlgK').textContent=b.getAttribute('data-naam')+' · '+b.getAttribute('data-prijs')+' per maand';d.className='lp-lid-dlg lp-lid-dlg--'+(b.getAttribute('data-lid-koop')==='2'?'hr':'vip');
if(d.showModal)d.showModal();else alert('Binnenkort beschikbaar. Betalen komt eraan.')});
d&&d.addEventListener('click',function(e){if(e.target===d)d.close()});
document.addEventListener('lp:me',function(e){var t=+((e.detail&&e.detail.tier)||0);[].forEach.call(document.querySelectorAll('.lp-plan'),function(p){var i=+p.getAttribute('data-tier'),j=p.querySelector('.lp-plan__jij'),k=p.querySelector('[data-lid-koop]');
if(i===t){p.classList.add('is-jij');j.hidden=false}if(k&&i<=t){k.disabled=true;k.textContent=i===t?'Dit heb je nu':'Inbegrepen';var s=k.nextElementSibling;if(s)s.hidden=true}});
var a=document.querySelector('.lp-plan--gratis .lp-plan__gratis');if(a){a.href='/game';a.removeAttribute('data-auth');a.textContent='Verder spelen'}})})()</script>`;
}
// op de voorpagina: rustig blok met de drie lidmaatschappen en een link naar alles
function lidTeaser(N) {
  const L = LIDD(); if (!L) return '';
  const top = { 0: ['Alle klussen, rangen en families', 'Alle minigames en het casino'], 1: ['Slaagkans ×1,15, +10% buit', 'Wachttijden 75%'], 2: ['Slaagkans ×1,4, +25% buit', 'Wachttijden 55%'] };
  return `<section class="lp-sec lp-lidblok" id="lidmaatschap" aria-labelledby="h-lid">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Lidmaatschap', 'jij')}<h2 class="lp-h2 lp-lidblok__h" id="h-lid">Gratis. <em>Of net iets meer.</em></h2>
   <p class="lp-lede">${esc(N.brand || 'Onderwereld')} is gratis en blijft gratis. Binnenkort kun je er VIP of High roller bij nemen: sneller vooruit, meer ruimte. Betalen kan nog niet.</p></div>
  <ul class="lp-lidrij">${L.TIERS.map((t, i) => `<li class="lp-lidmini lp-lidmini--${t.id}">${lidTag(t, i)}<b>${esc(t.n)}</b><span class="lp-lidmini__p">${L.eur(t.price)}<small>${i ? ' per maand' : ' voor altijd'}</small></span><ul>${top[i].map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}</ul>
  <p class="lp-lidblok__voet">${tlink('/lidmaatschap', 'Alle voordelen vergelijken')}<span class="lp-note">Prijzen voorlopig.</span></p>
 </div>
</section>`;
}
// eigen pagina /lidmaatschap (server-side, zelfde kop en voet als de voorpagina)
function lidPage(N) {
  const L = LIDD(); if (!L) return '';
  const B = esc(N.brand || 'Onderwereld');
  const vragen = [
    ['Moet ik betalen om te spelen?', `Nee. ${B} is gratis en blijft gratis. Alle ${N.crimes} klussen, ${N.ranks} rangen, ${N.fams} families en de minigames zijn zonder lidmaatschap te spelen, en je kunt elke rang gratis halen.`],
    ['Kan ik al betalen?', 'Nee, nog niet. De knoppen laten alleen zien hoe het straks werkt. Er wordt niets afgeschreven en er verandert niets aan je account. De prijzen zijn voorlopig.'],
    ['Wat geeft een lidmaatschap precies?', 'Voordelen in het spel: meer slaagkans en buit, kortere wachttijden, meer straatcredit, betere rente en meer ruimte bij de bank, en meer plek voor je zaken en woningen. In de tabel hierboven staat alles, met de echte getallen uit het spel.'],
    ['En in het casino?', 'Hogere inzetlimieten, langer spelen en cashback op je inzet. De kasten betalen gemiddeld iets meer terug (zie RTP in de tabel). Het casino is alleen spelgeld en voor 18+: je kunt niets winnen of uitbetalen, ook niet met een lidmaatschap.'],
    ['Speel ik met een lidmaatschap om echt geld?', 'Nee. Alles in het spel blijft virtueel spelgeld. Een lidmaatschap verandert daar niets aan.']];
  return `<section class="lp-lidhero" aria-labelledby="h1">
 <div class="lp-wrap">
  ${kicker('Lidmaatschap', 'jij')}
  <h1 class="lp-h1 lp-lidhero__h" id="h1"><span>Gratis spelen.</span> <span><em>Of net iets meer.</em></span></h1>
  <p class="lp-lede">${B} is gratis en blijft gratis. Wie wil, neemt straks VIP of High roller: alles gaat wat sneller en je hebt meer ruimte. Hieronder staat precies wat je krijgt.</p>
  <div class="lp-lidhero__cta"><a class="btn btn--lg" id="heroCta" href="/start" data-auth="register" data-cta="lid-hero">Speel gratis</a> <a class="tlink" href="#vergelijking">Alles naast elkaar${ic('arrow')}</a></div>
  <ul class="lp-feitjes" aria-label="In het kort"><li>Spel blijft gratis</li><li>Betalen kan nog niet</li><li>Alleen spelgeld</li><li>${age(16)}</li></ul>
 </div>
</section>
<section class="lp-sec lp-lidplans" aria-label="De drie lidmaatschappen">
 <div class="lp-wrap">
  <div class="lp-plans">${L.TIERS.map((t, i) => lidPlan(L, t, i, 'h2')).join('')}</div>
  <p class="lp-lidpay"><b>Betalen kan nog niet.</b> De prijzen zijn voorlopig, per maand en inclusief btw. Tik je op een knop, dan zie je alleen een melding.</p>
 </div>
</section>
<section class="lp-sec lp-lidcmp" id="vergelijking" aria-labelledby="h-cmp">
 <div class="lp-wrap">
  <div class="lp-sec__head">${kicker('Alles naast elkaar', 'jij')}<h2 class="lp-h2" id="h-cmp">${L.nRows()} voordelen. <em>Echte getallen.</em></h2>
   <p class="lp-lede">Rechtstreeks uit het spel: ${L.CATS.map(c => c.n.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' en $1')}.</p></div>
  <div class="lp-lidtab">${L.tableHtml({})}</div>
  <p class="lp-note">RTP = hoeveel van je inzet een kast gemiddeld teruggeeft, over heel veel spins. Het casino speelt alleen met spelgeld, is voor 18+ en blijft altijd onder 100%. “Nieuw” komt deze ronde in het spel.</p>
  <h2 class="lp-h2 lp-h2--b" id="h-lidfaq">Vragen</h2>
  <div class="faq-list">${vragen.map((f, i) => `<details class="faq-q"><summary><span class="faq-n">${String(i + 1).padStart(2, '0')}</span><b>${esc(f[0])}</b><i class="faq-x" aria-hidden="true"></i></summary><div class="faq-a"><p>${f[1]}</p></div></details>`).join('')}</div>
 </div>
</section>
${slot(N)}
${lidScript()}`;
}

function page(N, o) {
  o = o || {};
  return hero(N, o) + lus(N) + grind(N) + games(N) + loopbaan(N) + imperium(N) + casino(N) + lidTeaser(N) + eerlijk(N) + slot(N);
}

const LPV = { facts, page, lidPage, lidTeaser, hero, lus, grind, games, loopbaan, imperium, casino, eerlijk, slot, faqList, klimSvg, gangSvg, haltRows };
root.LPV = LPV;
if (typeof module !== 'undefined' && module.exports) module.exports = LPV;
})(typeof window !== 'undefined' ? window : this);
