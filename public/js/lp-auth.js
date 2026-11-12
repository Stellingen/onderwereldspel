// Venster "Begin je carrière" / "Welkom terug" voor de voorpagina en de subpagina's. Wordt pas bij de eerste klik geladen
// (lp-home.js of landing.js) en zet dan een <dialog> in de DOM (showModal: focus blijft binnen het venster, Escape sluit).
// Registreren: 2 velden + verplicht vinkje "Ik ben 16 jaar of ouder." (ook server-side gecontroleerd: /api/register eist age16:true).
// Fouten staan bij het veld (aria-invalid + aria-describedby + icoon); valideren bij blur en submit; focus naar het eerste foute veld.
// Terugknop: openen zet een history-stap (#start), terug sluit het venster in plaats van de pagina te verlaten.
(function () {
'use strict';
if (window.LPAuth) return;
const q = (s, r) => (r || document).querySelector(s);
const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const okName = v => /^[a-zA-Z0-9_]{3,20}$/.test(v);
const setTok = t => { try { localStorage.setItem('ow_token', t); } catch (e) {} };
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const I = { check: '<path d="M4 12.5l5 5L20 6.5"/>', warn: '<path d="M12 3l10 18H2zM12 10v5M12 18v.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>' };
const ic = k => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${I[k]}</svg>`;

// stijl apart laden (zelfde bestand op elke pagina)
let cssP = null;
function css() {
  if (cssP) return cssP;
  cssP = new Promise(res => { const v = (document.querySelector('script[src*="lp-auth.js"]') || {}).src || ''; const m = v.match(/\?v=([^&]+)/);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/css/lp-auth.css' + (m ? '?v=' + m[1] : ''); l.onload = l.onerror = () => res(); document.head.appendChild(l); });
  return cssP;
}

let dlg = null, mode = 'register', opener = null, pushed = false, opts = {};
function build() {
  const d = document.createElement('dialog'); d.className = 'lp-auth'; d.id = 'lpAuth'; d.setAttribute('aria-labelledby', 'authH');
  const no = String(Math.floor(100000 + Math.random() * 900000)), dt = new Date(), date = [dt.getDate(), dt.getMonth() + 1].map(n => String(n).padStart(2, '0')).join('-') + '-' + dt.getFullYear();
  d.innerHTML = `<div class="lp-auth__board" aria-hidden="true"><div class="lp-auth__placard"><div class="pl-top"><span>Politie · Eenheid Onderwereld</span><span>Nr. ${no}</span></div>
   <div class="pl-name" id="plName">ONBEKEND</div><div class="pl-rows"><div><span>Status</span><b id="plStatus">Nieuw dossier</b></div><div><span>Rang</span><b id="plRank">${esc(opts.first || 'Rookie')}</b></div><div><span>Datum</span><b>${date}</b></div></div></div></div>
  <div class="lp-auth__side">
   <button class="lp-auth__x" type="button" aria-label="Sluiten">${ic('x')}</button>
   <form class="lp-auth__form" id="authForm" method="post" action="/api/register" novalidate>
    <p class="lp-kicker lp-auth__kick" data-reg>Gratis · 16+ · Alleen spelgeld</p>
    <h2 class="lp-auth__h" id="authH" tabindex="-1">Begin je carrière</h2>
    <ul class="lp-auth__krijg" data-reg><li>${ic('check')}Je start als ${esc(opts.first || 'Rookie')} met €${(+opts.startCash || 0).toLocaleString('nl-NL')} spelgeld</li><li>${ic('check')}Je eigen karakter, met een gratis startoutfit</li><li>${ic('check')}Een korte rondleiding door de stad</li><li>${ic('check')}Je voortgang blijft bewaard, op elk apparaat</li></ul>
    <p class="lp-auth__msg" id="authMsg" role="status" hidden></p>
    <div class="lp-auth__fld"><label for="authUser">Gebruikersnaam</label>
     <input id="authUser" name="username" autocomplete="username" maxlength="20" spellcheck="false" autocapitalize="off" required aria-describedby="userHint">
     <p class="lp-auth__hint" id="userHint">3 tot 20 tekens: letters, cijfers of _</p></div>
    <div class="lp-auth__fld"><label for="authPass">Wachtwoord</label>
     <div class="lp-auth__pw"><input id="authPass" name="password" type="password" autocomplete="new-password" maxlength="100" required aria-describedby="passHint"><button type="button" class="lp-auth__peek" aria-pressed="false" aria-controls="authPass">Toon</button></div>
     <p class="lp-auth__hint" id="passHint">Minstens 6 tekens</p></div>
    <div class="lp-auth__fld" data-reg><label class="lp-auth__age"><input type="checkbox" id="authAge" name="age16" value="1" aria-describedby="ageHint"><span>Ik ben 16 jaar of ouder.</span></label>
     <p class="lp-auth__hint" id="ageHint" hidden></p></div>
    <div class="lp-auth__err" id="authErr" role="alert" hidden></div>
    <button class="btn btn--lg btn--block" id="authSubmit" type="submit">Account aanmaken</button>
    <p class="lp-auth__klein" data-reg>Geen e-mail nodig. Let op: je wachtwoord kun je nog niet herstellen. Laat je browser het bewaren.</p>
    <details class="lp-auth__vergeten" data-log><summary>Wachtwoord vergeten?</summary><p>Herstellen kan nog niet, omdat we geen e-mailadres vragen. Weet je het echt niet meer? Maak een nieuw account aan.</p></details>
    <p class="lp-auth__swap" id="authSwap"></p>
   </form></div>`;
  document.body.appendChild(d);
  const f = q('#authForm', d), U = q('#authUser', d), P = q('#authPass', d), A = q('#authAge', d);
  q('.lp-auth__x', d).addEventListener('click', () => close());
  d.addEventListener('cancel', e => { e.preventDefault(); close(); });
  d.addEventListener('click', e => { if (e.target === d) close(); });           // klik naast het venster
  d.addEventListener('click', e => { const m = e.target.closest('[data-mode]'); if (m) { e.preventDefault(); setMode(m.dataset.mode, true); } });
  const peek = q('.lp-auth__peek', d); peek.addEventListener('click', () => { const show = P.type === 'password'; P.type = show ? 'text' : 'password'; peek.textContent = show ? 'Verberg' : 'Toon'; peek.setAttribute('aria-pressed', String(show)); });
  U.addEventListener('input', () => { const pl = q('#plName', d); pl.textContent = U.value.trim() ? U.value.trim().toUpperCase() : 'ONBEKEND'; if (U.getAttribute('aria-invalid') === 'true') check(U); else if (mode === 'register' && okName(U.value.trim())) hint(U, 'Goede naam.', 'good'); });
  U.addEventListener('blur', () => { if (U.value) check(U); }); P.addEventListener('blur', () => { if (P.value) check(P); });
  P.addEventListener('input', () => { if (P.getAttribute('aria-invalid') === 'true') check(P); });
  A.addEventListener('change', () => { if (A.checked) check(A); });
  f.addEventListener('submit', submit);
  return d;
}
const HINT = { authUser: '3 tot 20 tekens: letters, cijfers of _', authPass: 'Minstens 6 tekens', authAge: '' };
function hint(el, msg, kind) {
  const h = q('#' + el.getAttribute('aria-describedby'), dlg); h.hidden = !msg;
  h.className = 'lp-auth__hint' + (kind ? ' ' + kind : ''); h.innerHTML = (kind === 'bad' ? ic('warn') : kind === 'good' ? ic('check') : '') + esc(msg || '');
  if (kind === 'bad') el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
}
// geeft een foutmelding terug (of '') en zet hem bij het veld
function check(el) {
  const v = el.type === 'checkbox' ? el.checked : el.value, reg = mode === 'register'; let m = '';
  if (el.id === 'authUser') { const u = String(v).trim(); m = !u ? 'Vul een gebruikersnaam in.' : okName(u) ? '' : !reg ? 'Een gebruikersnaam heeft 3 tot 20 tekens: letters, cijfers of _.' : u.length < 3 ? 'Te kort: minstens 3 tekens.' : u.length > 20 ? 'Te lang: hooguit 20 tekens.' : 'Alleen letters, cijfers en _ zijn toegestaan.'; }
  if (el.id === 'authPass') m = !v ? 'Vul een wachtwoord in.' : String(v).length < 6 ? 'Je wachtwoord moet minstens 6 tekens zijn.' : '';
  if (el.id === 'authAge') m = reg && !v ? 'Je moet 16 jaar of ouder zijn om te spelen.' : '';
  if (m) hint(el, m, 'bad'); else hint(el, el.id === 'authUser' && reg && String(v).trim() ? 'Goede naam.' : (reg ? HINT[el.id] : ''), el.id === 'authUser' && reg && String(v).trim() ? 'good' : '');
  return m;
}
function setMode(m, focus) {
  mode = m; const reg = m === 'register', d = dlg;
  d.querySelectorAll('[data-reg]').forEach(e => { e.hidden = !reg; }); d.querySelectorAll('[data-log]').forEach(e => { e.hidden = reg; });
  q('#authH', d).textContent = reg ? 'Begin je carrière' : 'Welkom terug';
  q('#authSubmit', d).textContent = reg ? 'Account aanmaken' : 'Inloggen';
  q('#authForm', d).setAttribute('action', reg ? '/api/register' : '/api/login');
  q('#authPass', d).setAttribute('autocomplete', reg ? 'new-password' : 'current-password');
  q('#plStatus', d).textContent = reg ? 'Nieuw dossier' : 'Bekende';
  q('#authSwap', d).innerHTML = reg ? 'Al een account? <button type="button" class="lp-auth__link" data-mode="login">Inloggen</button>' : 'Nog geen account? <button type="button" class="lp-auth__link" data-mode="register">Begin je carrière</button>';
  ['#authUser', '#authPass', '#authAge'].forEach(s => { const el = q(s, d); hint(el, reg ? HINT[el.id] : '', ''); });
  q('#authErr', d).hidden = true; d.classList.toggle('is-login', !reg);
  if (focus) focusFirst();
}
function focusFirst() {
  const wide = matchMedia('(min-width:900px)').matches;
  setTimeout(() => { (wide ? q('#authUser', dlg) : q('#authH', dlg)).focus({ preventScroll: !wide }); }, 30);
}
async function submit(e) {
  e.preventDefault(); const d = dlg, reg = mode === 'register', err = q('#authErr', d), msg = q('#authMsg', d);
  err.hidden = true; msg.hidden = true;
  const fields = [q('#authUser', d), q('#authPass', d)].concat(reg ? [q('#authAge', d)] : []);
  const bad = fields.filter(f => check(f));
  if (bad.length) { bad[0].focus(); return; }
  const username = q('#authUser', d).value.trim(), password = q('#authPass', d).value, btn = q('#authSubmit', d), label = btn.textContent;
  btn.disabled = true; btn.textContent = reg ? 'Dossier aanmaken…' : 'Controleren…';
  const fail = (html, field) => { btn.disabled = false; btn.textContent = label;
    if (field) { hint(field, html, 'bad'); field.focus(); return; }
    err.innerHTML = ic('warn') + '<span>' + html + '</span>'; err.hidden = false; };
  let r, j = {};
  try { r = await fetch('/api/' + (reg ? 'register' : 'login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reg ? { username, password, age16: q('#authAge', d).checked === true } : { username, password }) });
    try { j = await r.json(); } catch (x) {} }
  catch (x) { return fail('De server is niet bereikbaar. Controleer je verbinding en probeer het opnieuw.'); }
  if (!r.ok) {
    if (r.status === 409) return fail(`Kies een andere naam, bijvoorbeeld ${esc(username.slice(0, 17))}_7. Is dit jouw account? <button type="button" class="lp-auth__link" data-mode="login">Inloggen</button>`);
    if (r.status === 401) return fail('Onbekende gebruiker of verkeerd wachtwoord. <button type="button" class="lp-auth__link" data-vergeten>Wachtwoord vergeten?</button>');
    if (r.status === 429) return fail('Even wachten: je hebt het te vaak geprobeerd. Probeer het over een minuut opnieuw.');
    if (r.status === 400 && j.field === 'age16') return fail(esc(j.error), q('#authAge', d));
    if (j.code === 'banned') { setMode('register'); q('#authUser', d).value = ''; q('#authPass', d).value = ''; }
    return fail(esc(j.error || 'Er ging iets mis. Probeer het opnieuw.'));
  }
  setTok(j.token); try { localStorage.setItem('ow_lpname', String(j.username || username)); } catch (x) {}
  d.classList.add('ok'); q('#plStatus', d).textContent = 'Toegang'; q('#plName', d).textContent = String(j.username || username).toUpperCase();
  btn.textContent = reg ? 'Welkom in de onderwereld' : 'Welkom terug';
  // even wachten, zodat de browser het wachtwoord kan bewaren
  setTimeout(() => { location.href = '/game'; }, 700);
}
document.addEventListener('click', e => { if (e.target.closest('[data-vergeten]') && dlg) { const v = q('.lp-auth__vergeten', dlg); v.hidden = false; v.open = true; v.querySelector('summary').focus(); } });

function open(m, from, o) {
  opts = Object.assign(opts, o || {}); opener = from || document.activeElement;
  return css().then(() => {
    if (!dlg) dlg = build();
    setMode(m || 'register');
    const msg = q('#authMsg', dlg); msg.hidden = !opts.msg; msg.textContent = opts.msg || ''; opts.msg = '';
    if (!dlg.open) { dlg.showModal(); document.documentElement.classList.add('auth-open');
      try { history.pushState(Object.assign({}, history.state, { lpAuth: 1 }), '', location.pathname + location.search + '#start'); pushed = true; } catch (e) { pushed = false; } }
    focusFirst(); document.dispatchEvent(new CustomEvent('lp:auth', { detail: { open: true } }));
  });
}
function close(fromPop) {
  if (!dlg || !dlg.open) return;
  dlg.close(); document.documentElement.classList.remove('auth-open');
  if (pushed && !fromPop) { pushed = false; fixAfterPop = true; try { history.back(); } catch (e) { fixUrl(); } } else { pushed = false; fixUrl(); }
  if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('lp:auth', { detail: { open: false } }));
}
// na sluiten op /start of met ?login=1: het adres wordt /, zodat verversen het venster niet opnieuw opent
let fixAfterPop = false;
function fixUrl() { try { if (location.pathname === '/start' || /[?&](login|register|verlopen|banned)=/.test(location.search)) history.replaceState(history.state, '', '/' + location.hash.replace(/^#start$/, '')); } catch (e) {} }
addEventListener('popstate', () => { if (fixAfterPop) { fixAfterPop = false; fixUrl(); return; } if (dlg && dlg.open) close(true); });
window.LPAuth = { open, close, get isOpen() { return !!(dlg && dlg.open); }, get mode() { return mode; } };
})();
