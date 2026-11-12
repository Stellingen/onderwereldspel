// Voorpagina: gedrag bij de HTML die de server al heeft gemaakt (lp-views.js). Rendert niets opnieuw.
// Menu (focus binnen het menu, Escape), ingelogd/uitgelogd, venster voor registreren/inloggen (lp-auth.js, pas bij de eerste klik),
// sticky knop op de telefoon, pauzeknop en .calm in de hero, clips (één tegelijk, laden vlak voor ze in beeld komen), de live gang
// (jb-core.js uit het spel), de rangen-rail als slider en de teller bij de minigames.
(function () {
'use strict';
const q = (s, r) => (r || document).querySelector(s), qa = (s, r) => [...(r || document).querySelectorAll(s)];
const mm = s => !!(window.matchMedia && matchMedia(s).matches);
const reduce = mm('(prefers-reduced-motion: reduce)');
const conn = navigator.connection || {}, saveData = !!conn.saveData, slow = /(^|-)2g$/.test(conn.effectiveType || '');
const calm = saveData || (navigator.deviceMemory && navigator.deviceMemory <= 2);
const getTok = () => { try { return localStorage.getItem('ow_token'); } catch (e) { return null; } };
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = n => Math.round(+n).toLocaleString('nl-NL');
const ICP = { pause: '<path d="M8 5v14M16 5v14"/>', play: '<path d="M7 4.5v15l12-7.5z"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>' };
const ic = k => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICP[k]}</svg>`;
const app = q('#app'), ver = ((q('script[src*="lp-home.js"]') || {}).src || '').split('?v=')[1] || '';
const loaded = {};
function need(src) { if (loaded[src]) return loaded[src]; loaded[src] = new Promise(res => { const s = document.createElement('script'); s.src = src + (ver ? '?v=' + ver : ''); s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); }); return loaded[src]; }

/* ---------- mast ---------- */
const mast = q('#mast');
const onScroll = () => mast.classList.toggle('solid', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- menu (telefoon) ---------- */
const burger = q('#burger'), mnav = q('#mnav');
function menu(open) {
  if (open === !mnav.hidden) return;
  mnav.hidden = !open; burger.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('menu-open', open);
  if (open) { const a = q('a', mnav); a && a.focus({ preventScroll: true }); } else burger.focus({ preventScroll: true });
  sticky && sticky.upd();
}
burger.addEventListener('click', () => menu(mnav.hidden));
mnav.addEventListener('click', e => { if (e.target.closest('a')) { mnav.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); } });
document.addEventListener('keydown', e => {
  if (mnav.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); menu(false); return; }
  if (e.key === 'Tab') { // focus blijft in het menu (plus de burger om te sluiten)
    const f = [burger].concat(qa('a,button', mnav)); const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
});
addEventListener('resize', () => { if (innerWidth >= 900 && !mnav.hidden) menu(false); });

/* ---------- ingelogd ---------- */
let loggedIn = false, userName = '';
const startCash = () => +(app.dataset.startcash || 0);
function authUI() {
  const n = esc(userName), top = q('#topAuth'), mA = q('#mnavAuth');
  if (loggedIn) {
    top.innerHTML = `<span class="whoami">${n ? 'Ingelogd als <b>' + n + '</b>' : 'Ingelogd'}</span><button class="tlink topauth__in" type="button" data-logout>Uitloggen</button><a class="btn btn--sm" href="/game">Verder spelen</a>`;
    mA.innerHTML = `<a class="btn btn--lg btn--block" href="/game">Verder spelen</a><button class="tlink" type="button" data-logout>Uitloggen${n ? ' (' + n + ')' : ''}</button>`;
    const k = q('[data-li="kick"]'); if (k) k.textContent = 'Welkom terug' + (userName ? ', ' + userName : '');
    const l = q('[data-li="lede"]'); if (l) l.textContent = 'Je imperium staat waar je het hebt achtergelaten.';
    const c = q('[data-li="cta"]'); if (c) c.innerHTML = `<a class="btn btn--lg" id="heroCta" href="/game">Verder spelen</a> <a class="tlink" href="#loopbaan">Wat er nog te halen valt${ic('arrow')}</a>`;
    const h = q('[data-li="slotH"]'); if (h) h.innerHTML = 'Terug aan <em>het werk.</em>';
    const s = q('[data-li="slotCta"]'); if (s) s.innerHTML = '<a class="btn btn--lg" href="/game">Verder spelen</a>';
    qa('[data-play]').forEach(a => a.setAttribute('href', '/game'));
  }
  sticky && sticky.label();
}
document.addEventListener('click', e => { if (!e.target.closest('[data-logout]')) return; try { localStorage.removeItem('ow_token'); localStorage.removeItem('ow_lpname'); } catch (x) {} location.reload(); });
// Pixelstad-blok: leden gaan naar de stad, gratis spelers zien wat een lidmaatschap geeft
document.addEventListener('lp:me', e => {
  const d = e.detail || {}, c = q('[data-li="stadCta"]'); if (!c) return;
  c.innerHTML = (d.tier >= 1 || d.admin) ? `<a class="btn btn--lg" href="/stad">Naar de Pixelstad</a> <a class="tlink" href="/game">Naar het klikspel${ic('arrow')}</a>`
    : `<a class="btn btn--lg" href="/lidmaatschap#pixelstad">Bekijk VIP en High roller</a> <a class="tlink" href="/game">Verder spelen${ic('arrow')}</a>`;
});
function session() {
  const t = getTok(); if (!t) return Promise.resolve();
  loggedIn = true; try { userName = localStorage.getItem('ow_lpname') || ''; } catch (e) {} authUI();
  return fetch('/api/me', { headers: { Authorization: 'Bearer ' + t } }).then(r => {
    if (r.ok) return r.json().then(j => { try { document.dispatchEvent(new CustomEvent('lp:me', { detail: { tier: +j.tier || 0, admin: !!j.admin } })); } catch (e) {} const nm = String(j.username || ''); if (nm !== userName) { userName = nm; try { localStorage.setItem('ow_lpname', nm); } catch (e) {} authUI(); } });
    if (r.status === 401 || r.status === 403) { try { localStorage.removeItem('ow_token'); } catch (e) {} location.reload(); }
  }).catch(() => {});
}

/* ---------- venster registreren / inloggen ---------- */
function openAuth(mode, from, msg) {
  menu(false);
  return need('/js/lp-auth.js').then(ok => { if (ok && window.LPAuth) return LPAuth.open(mode, from, { startCash: startCash(), first: app.dataset.first || 'Rookie', msg }); location.href = mode === 'login' ? '/?login=1' : '/start'; });
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-auth]'); if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault(); if (loggedIn) { location.href = '/game'; return; } openAuth(a.dataset.auth, a);
});
document.addEventListener('lp:auth', () => sticky && sticky.upd());

/* ---------- sticky knop (alleen < 900 px, pas met JS in de DOM) ---------- */
let sticky = null;
function initSticky() {
  if (sticky || innerWidth >= 900) return;
  const el = document.createElement('div'); el.className = 'lp-sticky uit'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<p>Gratis · 16+ · Alleen spelgeld</p><a class="btn btn--block" href="/start" data-auth="register" data-cta="sticky" tabindex="-1">Speel gratis</a>';
  document.body.appendChild(el); document.body.classList.add('has-sticky');
  const seen = new Set(), hero = q('#heroCta');
  const io = new IntersectionObserver(es => { es.forEach(x => x.isIntersecting ? seen.add(x.target) : seen.delete(x.target)); upd(); }, { threshold: 0 });
  // verbergen zolang de hero-knop, een andere "Speel gratis", de slot-CTA of de footer in beeld is
  [hero, q('.lp-slot'), q('.lp-foot'), q('.lp-games__oefen')].filter(Boolean).forEach(x => io.observe(x));
  let heroPassed = false; const heroIo = new IntersectionObserver(es => { const r = es[0].boundingClientRect; heroPassed = !es[0].isIntersecting && r.top < 0; upd(); }); heroIo.observe(hero);
  const kb = () => window.visualViewport && visualViewport.height < innerHeight * .75;
  function upd() {
    const show = heroPassed && !seen.size && mnav.hidden && !(window.LPAuth && LPAuth.isOpen) && !kb();
    el.classList.toggle('uit', !show); document.body.classList.toggle('sticky-on', show);   // dan niet ook nog de knop in de kop
    el.setAttribute('aria-hidden', String(!show)); q('a', el).tabIndex = show ? 0 : -1;
  }
  window.visualViewport && visualViewport.addEventListener('resize', upd);
  sticky = { upd, label() { if (loggedIn) { const a = q('a', el); a.removeAttribute('data-auth'); a.href = '/game'; a.innerHTML = 'Verder spelen →'; } } };
  sticky.label();
}

/* ---------- hero: pauze, .calm, buiten beeld stil ---------- */
const heroS = q('.lp-hero'), pz = q('.lp-klim__pauze');
if (heroS) {
  if (calm) heroS.classList.add('calm');
  const ambient = !reduce && !calm;
  if (ambient && pz) {
    pz.hidden = false;
    const set = p => { heroS.classList.toggle('paused', p); pz.setAttribute('aria-pressed', String(p)); pz.textContent = p ? 'Beweging afspelen' : 'Beweging pauzeren'; try { sessionStorage.setItem('lp_pauze', p ? '1' : ''); } catch (e) {} };
    let p0 = false; try { p0 = sessionStorage.getItem('lp_pauze') === '1'; } catch (e) {} if (p0) set(true);
    pz.addEventListener('click', () => set(!heroS.classList.contains('paused')));
    addEventListener('load', () => { if ('IntersectionObserver' in window) new IntersectionObserver(es => heroS.classList.toggle('off', !es[0].isIntersecting)).observe(q('.lp-klim')); }, { once: true });
  }
}

/* ---------- clips en de live gang: er speelt er één tegelijk ---------- */
const auto = !reduce && !saveData && !slow;
const items = [];
function setBtn(it) {
  const b = it.btn; if (!b) return; b.hidden = false;
  const nm = it.name, playing = it.playing;
  if (!auto && !it.started) { b.dataset.mode = 'bekijk'; b.innerHTML = it.live ? 'Speel af' : 'Bekijk clip'; b.setAttribute('aria-label', it.live ? 'Speel af: gang van ' + nm : 'Bekijk clip van ' + nm); b.setAttribute('aria-pressed', 'false'); return; }
  delete b.dataset.mode; b.innerHTML = ic(playing ? 'pause' : 'play');
  b.setAttribute('aria-label', (it.live ? 'Gang van ' : 'Clip van ') + nm + ': ' + (playing ? 'pauzeren' : 'afspelen')); b.setAttribute('aria-pressed', String(!playing));
}
function loadVideo(v) { if (v.dataset.loaded) return; v.dataset.loaded = '1'; qa('source', v).forEach(s => { s.src = s.dataset.src; }); v.load(); }
qa('.lp-game').forEach(card => {
  const media = q('.lp-game__media', card), v = q('video', media), btn = q('.lp-game__pauze', media), name = (q('h3', card).textContent || '').replace('!', '');
  const it = { card, media, btn, name, ratio: 0, user: null, playing: false, started: false, live: !v };
  if (v) { it.play = () => { loadVideo(v); const p = v.play(); p && p.catch(() => {}); it.playing = true; it.started = true; setBtn(it); };
    it.pause = () => { v.pause(); it.playing = false; setBtn(it); }; it.prep = () => loadVideo(v); }
  else { it.play = () => { gang(media).then(g => { if (g) { g.play(); it.playing = true; it.started = true; setBtn(it); } }); }; it.pause = () => { if (gangApi) gangApi.pause(); it.playing = false; setBtn(it); }; it.prep = () => gang(media); }
  items.push(it); setBtn(it);
  btn && btn.addEventListener('click', () => {
    if (it.playing) { it.user = 'pause'; it.pause(); return; }
    it.user = 'play'; items.forEach(o => { if (o !== it && o.playing) o.pause(); }); it.play();
  });
});
function choose() {
  if (!auto || document.hidden) return;
  let best = null; items.forEach(it => { if (it.ratio >= .6 && it.user !== 'pause' && (!best || it.ratio > best.ratio)) best = it; });
  const manual = items.find(it => it.user === 'play' && it.playing && it.ratio > 0);
  if (manual) best = manual;
  items.forEach(it => { if (it !== best && it.playing) it.pause(); });
  if (best && !best.playing) best.play();
}
if ('IntersectionObserver' in window && items.length) {
  const pre = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const it = items.find(i => i.media === e.target); if (it && (auto || it.live)) it.prep(); } }), { rootMargin: '100% 0px' });
  const vis = new IntersectionObserver(es => { es.forEach(e => { const it = items.find(i => i.media === e.target); if (it) it.ratio = e.isIntersecting ? e.intersectionRatio : 0; if (it && !e.isIntersecting && it.user === 'play') it.user = null; }); choose(); }, { threshold: [0, .3, .6, .8, 1] });
  items.forEach(it => { pre.observe(it.media); vis.observe(it.media); });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) items.forEach(it => { if (it.playing) { it.pause(); it.wasOn = true; } }); else { items.forEach(it => { it.wasOn = false; }); choose(); } });

// live gang: dezelfde plattegrond, bewaker en camera als in het spel (jbGang uit jb-core.js); een bot sluipt erdoorheen
let gangP = null, gangApi = null;
function gang(media) {
  if (gangP) return gangP;
  gangP = need('/js/jb-core.js').then(ok => {
    if (!ok || typeof jbGang !== 'function') return null;
    const svg = q('svg.lp-gang', media); if (!svg) return null;
    const u = +svg.dataset.u, VW = +svg.dataset.view, d = +svg.dataset.d, seed = +svg.dataset.seed;
    const W = q('.lp-gang__w', svg), you = q('.lp-gang__you', svg), beam = q('.lp-gang__beam', svg), gd = q('.lp-gang__gd', svg), my = q('.lp-gang__my', svg), mb = q('.lp-gang__mb', svg), st = q('.lp-gang__st', svg), zl = q('.lp-gang__zl', svg), zr = q('.lp-gang__zr', svg);
    const youY = you.getAttribute('transform').split(' ')[1], gdT = gd.getAttribute('transform');
    let G, s, timer = null, hold = 0;
    const reset = () => { G = jbGang(d, seed); s = jbGangState(G); };
    const next = x => { const c = G.covers.find(c => c.x - c.w / 2 > x + .01); return c ? Math.min(c.x, G.safeFrom + .5) : G.exit; };
    const draw = () => {
      const camX = Math.max(0, Math.min(G.L - VW, s.x - VW * .38));
      W.setAttribute('transform', `translate(${(-camX * u).toFixed(1)} 0)`);
      you.setAttribute('transform', `translate(${(s.x * u).toFixed(1)} ${youY}`); you.style.opacity = jbGangHid(G, s.x) ? .45 : 1;
      const look = s.gs === 'look', turn = s.gs === 'turn';
      beam.setAttribute('fill-opacity', look ? .4 : turn ? .14 : 0); mb.setAttribute('fill-opacity', look ? .55 : turn ? .25 : .1);
      gd.setAttribute('transform', gdT + (look || turn ? ' scale(-1 1)' : ''));
      st.textContent = look ? 'KIJKT!' : turn ? 'DRAAIT OM' : 'KIJKT WEG'; st.setAttribute('fill', look ? '#ff6b7c' : turn ? '#ffd970' : '#3fe395');
      if (zl) { zl.setAttribute('fill-opacity', s.cs === 'L' ? .2 : .04); zr.setAttribute('fill-opacity', s.cs === 'R' ? .2 : .04); }
      my.setAttribute('cx', (18 + s.x * 3.24).toFixed(1));
    };
    const step = () => {
      if (hold) { hold--; if (!hold) reset(); draw(); return; }
      for (let i = 0; i < 3; i++) {
        let mv = 1;
        if (jbGangHid(G, s.x)) { const t = next(s.x), dd = t - s.x; for (let k = 0; k <= 20; k++) { const px = s.x + dd * k / 20; if (jbGangSafeFor(G, s, px) < (px - s.x) / G.v + .45) { mv = 0; break; } } }
        const r = jbGangTick(G, s, 1 / 60, mv); if (r || s.t > G.time) { hold = 30; break; }
      }
      draw();
    };
    reset();
    gangApi = { play() { if (!timer) timer = setInterval(step, 50); }, pause() { clearInterval(timer); timer = null; } };
    return gangApi;
  });
  return gangP;
}

/* ---------- minigames-rij: teller op de telefoon ---------- */
const rij = q('.lp-games__rij'), tel = q('[data-teller]');
if (rij && tel) { const n = rij.children.length; let raf = 0;
  rij.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const w = rij.children[0].getBoundingClientRect().width + 14; tel.textContent = Math.min(n, Math.round(rij.scrollLeft / w) + 1) + ' / ' + n; }); }, { passive: true }); }

/* ---------- loopbaan: de rail als slider ---------- */
(function rail() {
  const box = q('.lp-rail'), ol = q('.lp-rail__lijst'), list = q('.lp-rail__track'), dataEl = q('#lpRail'); if (!box || !list || !dataEl) return;
  let R; try { R = JSON.parse(dataEl.textContent); } catch (e) { return; }
  const n = R.length - 1, ticks = qa('.lp-rail__tick', ol), mid = q('#halteMid'), play = q('.lp-rail__play'), ctl = q('.lp-rail__ctl');
  box.classList.add('js'); ctl.hidden = false; ol.setAttribute('aria-hidden', 'true');   // de slider zelf vertelt de rang
  list.setAttribute('role', 'slider'); list.tabIndex = 0; list.setAttribute('aria-label', 'Kies een rang');
  list.setAttribute('aria-valuemin', '0'); list.setAttribute('aria-valuemax', String(n)); list.setAttribute('aria-orientation', 'horizontal');
  let cur = -1, timer = null;
  function set(i) {
    i = Math.max(0, Math.min(n, i)); if (i === cur) return; cur = i; const r = R[i];
    list.setAttribute('aria-valuenow', String(i)); list.setAttribute('aria-valuetext', r.n + ', ' + nl(r.xp) + ' XP');
    ol.style.setProperty('--fill', (n ? i / n * 100 : 0) + '%'); ticks.forEach((t, k) => { t.classList.toggle('on', k <= i); t.classList.toggle('cur', k === i); });
    q('[data-h-rang]', mid).innerHTML = 'Rang ' + (i + 1) + ' · <span class="num">' + nl(r.xp) + '</span> XP';
    q('[data-h-name]', mid).textContent = r.n;
    q('[data-h-rows]', mid).innerHTML = `<dl><div><dt>Klus</dt><dd>${esc(r.c[0])} · <span class="num">€${nl(r.c[1])}–€${nl(r.c[2])}</span></dd></div><div><dt>Je slaapt</dt><dd>${esc(r.h[0])} · ${esc(r.h[1])}</dd></div><div><dt>Je kleren</dt><dd>${esc(r.s)}</dd></div></dl>`;
    const im = q('[data-h-img]', mid), src = '/img/lp/woning-' + r.h[2] + '.svg?v=1'; if (im.getAttribute('src') !== src) im.setAttribute('src', src);
  }
  const fromX = x => { const b = list.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(1, (x - b.left) / b.width)) * n); };
  let drag = false;
  list.addEventListener('pointerdown', e => { if (e.button) return; stop(); drag = true; try { list.setPointerCapture(e.pointerId); } catch (x) {} set(fromX(e.clientX)); });
  list.addEventListener('pointermove', e => { if (drag) set(fromX(e.clientX)); });
  const end = () => { drag = false; }; list.addEventListener('pointerup', end); list.addEventListener('pointercancel', end);
  list.addEventListener('keydown', e => { const k = e.key; let i = cur;
    if (k === 'ArrowRight' || k === 'ArrowUp') i++; else if (k === 'ArrowLeft' || k === 'ArrowDown') i--; else if (k === 'Home') i = 0; else if (k === 'End') i = n;
    else if (k === 'PageUp') i += 5; else if (k === 'PageDown') i -= 5; else return; e.preventDefault(); stop(); set(i); });
  function stop() { if (timer) { clearInterval(timer); timer = null; play.textContent = 'Speel je carrière af'; } }
  play.addEventListener('click', () => { if (timer) { stop(); return; } if (cur >= n) set(0); play.textContent = 'Pauze';
    timer = setInterval(() => { if (cur >= n) { stop(); return; } set(cur + 1); }, reduce ? 1400 : 900); });
  set(+box.dataset.mid || 0);
})();

/* ---------- FAQ: uitleg "op je beginscherm" op de telefoon ---------- */
function initFaq() { const s = q('[data-faq-app]'); if (s && window.owInstall && owInstall.phone && !owInstall.standalone()) { s.innerHTML = ' <button class="tlink" type="button" data-faq-install>Zo zet je hem op je beginscherm</button>'; q('[data-faq-install]').onclick = () => owInstall.open(); } }
addEventListener('load', initFaq, { once: true });

/* ---------- start ---------- */
const mq = window.matchMedia ? matchMedia('(max-width:899px)') : null;
initSticky(); mq && mq.addEventListener && mq.addEventListener('change', initSticky);
session().then(() => {
  const s = location.search;
  if (loggedIn) { if (app.dataset.open) try { history.replaceState(null, '', '/'); } catch (e) {} return; }
  if (/[?&]verlopen=1/.test(s)) openAuth('login', null, 'Je bent uitgelogd. Log opnieuw in.');
  else if (/[?&]register=1/.test(s)) openAuth('register', null, /[?&]banned=1/.test(s) ? 'Je vorige profiel is verbannen. Maak hier een nieuw profiel aan en begin opnieuw.' : '');
  else if (/[?&]login=1/.test(s)) openAuth('login');
  else if (app.dataset.open === 'register' || location.hash === '#start') openAuth('register', q('#heroCta'));
});
})();
