// Tab: Lidmaatschap (#lid) — Gratis, VIP en High roller naast elkaar, met de volledige vergelijking uit lid-data.js.
// NOG ZONDER BETALING: de koopknoppen tonen alleen een melding "binnenkort". Er wordt niets gekocht, betaald of geactiveerd;
// het lidmaatschap blijft zoals de beheerder het geeft (Beheer → speler → Lidmaatschap). Prijzen in lid-data.js zijn VOORLOPIG.

// ---------- aanmelden bij menu, zoeken en de route (zonder de bestanden van ui.js om te gooien) ----------
(function () {
 if (!PAGES.find(p => p[0] === 'lid')) PAGES.push(['lid', 'Lidmaatschap']);
 ICONS.lid = '<path d="M3.5 8.5l4.6 3.6L12 5.5l3.9 6.6 4.6-3.6-1.8 10H5.3z"/><path d="M5.3 21h13.4"/>';
 if (!NAV_GROUPS[0][1].includes('lid')) NAV_GROUPS[0][1].push('lid');
 MS_PAGE_K.lid = 'vip high roller hr lidmaatschap abonnement premium voordelen perks kopen';
 MS_FIND.push(['VIP en High roller', 'Alle voordelen naast elkaar', 'lid', 'vip high roller hr lidmaatschap abonnement premium voordelen perks kopen']);
 // ondertitel in het menu op de telefoon
 const nh = navHint; navHint = k => k === 'lid' ? (typeof lidName === 'function' ? lidName() + ' · bekijk VIP en HR' : 'VIP en High roller') : nh(k);
 // het spel opent met #lid: ui.js kende de pagina toen nog niet
 if (location.hash === '#lid') page = 'lid';
})();

// Tik op je eigen VIP/HR-tag (menu, statusbalk, profiel, menu op de telefoon) = naar Lidmaatschap
document.addEventListener('click', e => {
 const t = e.target.closest && e.target.closest('.vipt'); if (!t) return;
 if (!t.closest('#nav .brand, .topbar, .pf-name, .ms-head, .ld-me')) return;
 e.preventDefault(); e.stopPropagation(); if (typeof mSheet === 'function') mSheet(false); location.hash = '#lid';
}, true);

let ldCmpOpen = false;
const ldCheck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l4.5 4.5L19.5 6.5"/></svg>';
function ldPlan(t, i, cur) {
 const own = i === cur, below = i < cur, paid = i > 0;
 const tag = i === 2 ? '<i class="vipt hr">HIGH ROLLER</i>' : i === 1 ? '<i class="vipt">VIP</i>' : '<i class="ld-free">GRATIS</i>';
 const btn = own ? `<button class="btn ld-buy" disabled>Dit heb je nu</button>`
  : below ? `<button class="btn ld-buy" disabled>Inbegrepen bij ${esc(TIER_NAME[cur])}</button>`
  : !paid ? `<button class="btn ld-buy" disabled>Altijd inbegrepen</button>`
  : `<button class="btn ld-buy" onclick="ldBuy(${i})">${i === 2 ? 'Word High roller' : 'Word VIP'}</button>`;
 return `<article class="ld-plan ld-${t.id}${own ? ' cur' : ''}" style="--lc:${t.col}">
  ${own ? '<span class="ld-you">Jouw lidmaatschap</span>' : ''}
  <header class="ld-ph">${tag}<h2>${esc(t.n)}</h2><p>${esc(t.line)}</p></header>
  <div class="ld-price"><b>${LID.eur(t.price)}</b><span>${paid ? 'per maand' : 'voor altijd'}</span>${paid && LID.PRICE_VOORLOPIG ? '<em>voorlopige prijs</em>' : ''}</div>
  <ul class="ld-key">${i ? `<li class="ld-all">${ldCheck}<span>Alles van ${i === 2 ? 'VIP' : 'Gratis'}, plus:</span></li>` : ''}${t.key.map(k => `<li>${ldCheck}<span>${esc(k)}</span></li>`).join('')}</ul>
  <div class="ld-foot">${btn}${paid && !own && !below ? '<small>Betalen komt eraan</small>' : ''}</div>
 </article>`;
}
V.lid = () => {
 const cur = typeof tier === 'function' ? tier() : 0, T = LID.TIERS;
 const me = cur ? `Je bent <b>${esc(TIER_NAME[cur])}</b>. Je voordelen staan hieronder ${cur === 2 ? 'in het paars' : 'in het goud'}.`
  : 'Je speelt gratis. Dat blijft zo: het hele klikspel is zonder lidmaatschap te spelen. De Pixelstad is voor VIP en High roller.';
 return `<div class="ld">
 <header class="ld-hero" id="pixelstad">
  <div class="ld-hero-t"><h1>Lidmaatschap</h1>
   <p class="sub">Het klikspel is en blijft gratis. Met VIP of High roller speel je ook in de Pixelstad, waar je zelf door de stad loopt, rijdt en kraakt. En in het klikspel gaat alles wat sneller: meer kans, meer buit, kortere wachttijden en hogere limieten.</p></div>
  <div class="ld-me" style="--lc:${T[cur].col}"><span class="label">Nu</span><div>${cur ? vipTag() : '<i class="ld-free">GRATIS</i>'}<p>${me}</p></div></div>
 </header>
 <div class="ld-plans">${T.map((t, i) => ldPlan(t, i, cur)).join('')}</div>
 <p class="ld-pay"><b>Betalen kan nog niet.</b> De prijzen zijn voorlopig (per maand, inclusief btw). Tik je op een knop, dan gebeurt er niets met je account en wordt er niets afgeschreven.</p>
 <details class="ld-cmp" ${ldCmpOpen ? 'open' : ''} ontoggle="ldCmpOpen=this.open">
  <summary><span><b>Volledige vergelijking</b><small>${LID.nRows()} voordelen · ${LID.CATS.map(c => c.n).join(', ')}</small></span><i class="ld-chev" aria-hidden="true"></i></summary>
  <div class="ld-tab">${LID.tableHtml({ cur })}</div>
  <p class="ld-fine">RTP = hoeveel van je inzet de kast gemiddeld teruggeeft, over heel veel spins. Het casino speelt alleen met spelgeld en blijft altijd onder 100%. “Nieuw” komt deze ronde in het spel.</p>
 </details>
 </div>`;
};
// Koopknop: alleen een melding. NIETS kopen of activeren.
function ldBuy(i) {
 const t = LID.TIERS[i]; if (!t) return; try { SFX.click(); } catch (e) {}
 ldClose(); const o = document.createElement('div'); o.id = 'ldOv'; o.className = 'ld-ov';
 o.innerHTML = `<div class="ld-box" role="dialog" aria-modal="true" aria-labelledby="ldT" style="--lc:${t.col}">
  <span class="label">${esc(t.n)} · ${LID.eur(t.price)} per maand</span><h2 id="ldT">Binnenkort beschikbaar</h2>
  <p>Betalen komt eraan. Zodra het kan, neem je hier ${i === 2 ? 'High roller' : 'VIP'} per maand. Tot die tijd verandert er niets: er wordt niets afgeschreven en je lidmaatschap blijft ${esc(LID.TIERS[tier()].n)}.</p>
  <button class="btn ld-ok" onclick="ldClose()">Begrepen</button></div>`;
 o.addEventListener('click', e => { if (e.target === o) ldClose(); });
 document.body.appendChild(o); document.addEventListener('keydown', ldKey);
 const b = o.querySelector('.ld-ok'); b && b.focus({ preventScroll: true });
}
function ldKey(e) { if (e.key === 'Escape') ldClose(); }
function ldClose() { const o = document.getElementById('ldOv'); if (o) o.remove(); document.removeEventListener('keydown', ldKey); }
window.addEventListener('hashchange', ldClose);

// Controle: kloppen de getallen in lid-data.js nog met de code? Geeft een lijst met verschillen (leeg = alles klopt).
function lidCheck() {
 const bad = [], pct = (x, d) => (x * 100).toLocaleString('nl-NL', { maximumFractionDigits: d == null ? 1 : d }) + '%';
 const eq = (id, want) => { const r = LID.row(id); if (!r) { bad.push(id + ': rij ontbreekt'); return; } want.forEach((w, i) => { if (w != null && r.v[i] !== w) bad.push(`${id}[${i}]: tabel "${r.v[i]}", code "${w}"`); }); };
 const k = TIER_K, plus = (x, d) => x ? '+' + pct(x, d) : '–', mul = x => '×' + x.toLocaleString('nl-NL', { maximumFractionDigits: 2 });
 try {
  eq('kans', k.map(x => mul(1 + x)));
  eq('buit', TIER_LOOT.map(x => plus(x)));
  if (typeof TIER_STAD !== 'undefined') eq('stadbuit', TIER_STAD.map(x => plus(x)));
  eq('wacht', TIER_WAIT.map(x => pct(x, 0)));
  eq('rust', TIER_WAIT.map(x => pct(x, 0)));
  eq('cred', k.map(x => plus(x)));
  eq('vlucht', k.map(x => plus(x)));
  eq('chase', k.map(x => plus(x * .6)));
  eq('bajes', k.map(x => pct(.35 * (1 + x), 0)));
  eq('hit', k.map(x => x ? '−' + pct(x * .5) + ' · +' + pct(x) : '–'));
  eq('zoek', SRCH_MAX.map((m, i) => m + ' · ' + SRCH_CD[i] + ' min'));
  eq('klusje', k.map(x => plus(x * .5)));
  eq('deal', k.map(x => x ? '+' + pct(x * .2) + ' · −' + pct(x * .3) : '–'));
  eq('spaar', BANK_T.map(x => (SAV_RATE * x * 100).toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'));
  eq('depo', DEP_TERMS[3].r.map(x => pct(x)));
  eq('depn', DEP_SLOTS_T.map(String));
  eq('inv', INV_CAP_T.map(x => x >= 1e6 ? '€' + (x / 1e6).toLocaleString('nl-NL') + ' mln.' : '€' + x.toLocaleString('nl-NL')));
  eq('fee', k.map(x => x ? '−' + pct(x) : '–'));
  eq('beslag', SEIZE_KEEP.map(x => '€' + x.toLocaleString('nl-NL')));
  eq('lim', [0, 1, 2].map(i => [CC_T.slot[i], CC_T.snel[i], CC_T.tafel[i]].map(mul).join(' · ')));
  eq('side', [0, 1, 2].map(i => [CC_T.side[i], CC_T.rin[i]].map(mul).join(' · ')));
  eq('sess', [0, 1, 2].map(i => [CC_T.sess[i], CC_T.cd[i]].map(mul).join(' · ')));
  eq('eye', [0, 1, 2].map(i => mul(CZ_TIER[i]) + ' · ' + CZ_BAN[i] + ' min'));
  eq('cb', TIER_CB.map(x => !x ? 'alleen kaart' : x === 1 ? '+ basis' : '+ ' + mul(x).slice(1) + '× basis'));
  eq('rtp_kk', KK_TIER.map(x => x.rtp + '%'));
  eq('rtp_vd', VD_TIER.map(x => x.rtp + '%'));
  eq('rtp_zb', ZB_TIER.map(x => x.rtp + '%'));
  eq('rtp_dr', DR_TIER.map(x => x.rtp + '%'));
  eq('famgesprek', TIER_WAIT.map(x => Math.round(FAM_INT_CD * x) + ' min'));
  const fit = id => OUTFITS.find(o => o.id === id) || {};
  if (!fit('klemv').vip || fit('klemv').inc !== .5) bad.push('klemv: VIP-geldklem in look.js veranderd');
  if (!fit('klem5').hr || fit('klem5').inc !== 1) bad.push('klemd: Diamanten geldklem in look.js veranderd');
  if (!fit('dob15').hr || fit('dob15').luck !== .25) bad.push('dob: gouden dobbelsteen in look.js veranderd');
  if (LID.row('vest').v[0] !== String(BIZ_MAX)) bad.push(`vest[0]: tabel "${LID.row('vest').v[0]}", code "${BIZ_MAX}"`);
 } catch (e) { bad.push('controle mislukt: ' + e.message); }
 return bad;
}
setTimeout(() => { try { const b = lidCheck(); if (b.length) console.warn('Lidmaatschap: tabel en code verschillen', b); } catch (e) {} }, 0);
