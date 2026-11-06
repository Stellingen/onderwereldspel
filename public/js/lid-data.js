// Lidmaatschap: Gratis, VIP en High roller. Eén bron voor het spel (pages/lid.js) en de website (lp-views.js, /lidmaatschap).
// Alle getallen komen uit de code; pages/lid.js controleert ze in het spel tegen de echte constanten (lidCheck) en meldt
// verschillen in de console. Pas je een voordeel aan in de code, pas het dan hier ook aan.
// Bronnen: state.js (TIER_K, TIER_LOOT, TIER_WAIT, TIER_CB, CZ_TIER, CZ_BAN, escChance), flee.js, carchase.js, hits.js, werk.js,
// autos.js (SRCH_MAX/SRCH_CD), politie.js (SEIZE_KEEP), bank.js (BANK_T, DEP_TERMS, DEP_SLOTS_T, INV_CAP_T), caskaart.js (CC_T,
// CC_CAP), kluiskraker.js (KK_TIER), visdief.js (VD_TIER), zoetebuit.js (ZB_TIER), draak.js (DR_TIER, JPT), vlucht.js (README),
// look.js (geldklemmen, gouden dobbelsteen), data.js (BIZ_MAX). Nieuw deze ronde (collega's): woningen en zaken (zie `nieuw`).
// Puur gegevens en twee kleine helpers; geen DOM, werkt in de browser en in de vm van server.js.
(function (root) {
'use strict';
// VOORLOPIG: voorgestelde maandprijzen (incl. btw). Er is nog GEEN betaling: de knoppen tonen alleen "binnenkort".
const PRICE = { gratis: 0, vip: 4.99, hr: 9.99 };
const PRICE_VOORLOPIG = true;
const TIERS = [
  { id: 'gratis', n: 'Gratis', short: 'Gratis', tag: '', col: '#8a8f98', price: PRICE.gratis,
    line: 'Het hele spel, voor iedereen.',
    key: ['Alle klussen, rangen, families en spellen', 'Je voortgang op je account, op elk apparaat', 'Alle minigames: vluchten, achtervolgingen, ontsnappen', 'Je eigen casinokaart groeit mee met wat je speelt'] },
  { id: 'vip', n: 'VIP', short: 'VIP', tag: 'VIP', col: '#f2c230', price: PRICE.vip,
    line: 'Sneller vooruit, iets meer ruimte.',
    key: ['Slaagkans ×1,15 en +10% buit', 'Wachttijden 75% van normaal', '+15% straatcredit, betere rente', '5 depositoplekken, €300.000 beleggen', 'Hogere inzetlimieten in het casino', 'Zaken: tot 12 vestigingen · woningen +2 plekken', 'VIP-tag bij je naam'] },
  { id: 'hr', n: 'High roller', short: 'HR', tag: 'HIGH ROLLER', col: '#a855f7', price: PRICE.hr,
    line: 'Alles van VIP, en flink meer.',
    key: ['Slaagkans ×1,4 en +25% buit', 'Wachttijden 55% van normaal', '+40% straatcredit, de beste rente', '10 depositoplekken, €1 mln. beleggen', 'Hoogste inzetlimieten en de High roller-tafel', 'Zaken: tot 15 vestigingen · woningen +5 plekken', 'Diamanten geldklem en gouden dobbelsteen', 'HIGH ROLLER-tag bij je naam'] }
];
// Volledige vergelijking. Per rij: n = voordeel, v = [gratis, vip, hr], s = korte uitleg (optioneel),
// nieuw = komt deze ronde in het spel, rtp = casino-uitbetaling (feitelijk, zonder nadruk). '–' = niet.
const CATS = [
  { id: 'misdaad', n: 'Misdaad', rows: [
    { id: 'kans', n: 'Slaagkans klussen', s: 'Na alle andere bonussen, altijd hooguit 95%', v: ['×1', '×1,15', '×1,4'] },
    { id: 'buit', n: 'Buit per klus', v: ['–', '+10%', '+25%'] },
    { id: 'wacht', n: 'Wachttijden', s: "Klussen, auto's, werk en dealen, training, ontspannen, rusten, dokter, familie, huurmoorden", v: ['100%', '75%', '55%'] },
    { id: 'cred', n: 'Straatcredit', v: ['–', '+15%', '+40%'] },
    { id: 'vlucht', n: 'Vluchten te voet', s: 'Groter groen gat', v: ['–', '+15%', '+40%'] },
    { id: 'chase', n: 'Achtervolging met de auto', s: 'Meer ruimte en voorsprong', v: ['–', '+9%', '+24%'] },
    { id: 'bajes', n: 'Ontsnappen uit de bajes', s: 'Basiskans, vóór familie en outfit', v: ['35%', '40%', '49%'] },
    { id: 'hit', n: 'Huurmoorden', s: 'Rustiger vizier · meer tijd', v: ['–', '−7,5% · +15%', '−20% · +40%'] },
    { id: 'zoek', n: "Auto's zoeken op straat", s: 'Zoektochten achter elkaar · daarna rust', v: ['6 · 8 min', '10 · 6 min', '15 · 4 min'] }
  ] },
  { id: 'geld', n: 'Geld', rows: [
    { id: 'klusje', n: 'Loon voor klusjes', v: ['–', '+7,5%', '+20%'] },
    { id: 'deal', n: 'Dealen', s: 'Opbrengst · pakkans', v: ['–', '+3% · −4,5%', '+8% · −12%'] },
    { id: 'spaar', n: 'Spaarrente per uur', v: ['0,10%', '0,12%', '0,15%'] },
    { id: 'depo', n: 'Deposito, 3 speldagen', s: 'Andere looptijden in dezelfde verhouding', v: ['8%', '9,6%', '11,6%'] },
    { id: 'depn', n: 'Depositoplekken', v: ['2', '5', '10'] },
    { id: 'inv', n: 'Beleggen, maximaal', s: 'Keer (1 + je rang)', v: ['€100.000', '€300.000', '€1 mln.'] },
    { id: 'fee', n: 'Kosten bij beleggen', v: ['–', '−15%', '−40%'] },
    { id: 'beslag', n: 'Zwart geld dat je houdt bij beslag', v: ['€10.000', '€15.000', '€30.000'] }
  ] },
  { id: 'casino', n: 'Casino', note: 'Alleen spelgeld: je kunt niets winnen of uitbetalen. 18+.', rows: [
    { id: 'lim', n: 'Inzetlimieten bovenop je casinokaart', s: 'Slots · snel spel · tafels', v: ['×1 · ×1 · ×1', '×1,5 · ×2 · ×1,25', '×2 · ×4 · ×1,5'] },
    { id: 'side', n: 'Side bets en roulette per nummer', v: ['×1 · ×1', '×1,5 · ×1,33', '×2 · ×1,67'] },
    { id: 'hrtafel', n: 'High roller-tafel', s: 'Blackjack, Three Card Poker en Hold\'em, tot €500.000', v: ['–', '–', 'ja'] },
    { id: 'hrslot', n: 'Hoge inzetten in Kluiskraker', s: '€100.000 tot €500.000 per spin', v: ['–', '–', 'ja'] },
    { id: 'sess', n: 'Speeltijd per sessie · pauze', v: ['×1 · ×1', '×1,5 · ×0,8', '×2 · ×0,6'] },
    { id: 'cb', n: 'Cashback op elke inzet', s: 'Bovenop je casinokaart; bv. slots 0,5%, roulette 1%', v: ['alleen kaart', '+ basis', '+ 1,5× basis'] },
    { id: 'eye', n: 'Aandacht voor zwart geld · verbanning', v: ['×1 · 30 min', '×0,65 · 20 min', '×0,35 · 10 min'] },
    { id: 'rtp_kk', n: 'RTP Kluiskraker', rtp: true, v: ['92,5%', '94%', '95,5%'] },
    { id: 'rtp_vd', n: 'RTP Visdief', rtp: true, v: ['91,5%', '94%', '96,5%'] },
    { id: 'rtp_zb', n: 'RTP Suikerbaron', rtp: true, v: ['95%', '95,5%', '96%'] },
    { id: 'rtp_dr', n: 'RTP Gouden Draak', s: 'Jackpotmunten 30% / 60% vaker', rtp: true, v: ['92%', '93,5%', '95%'] },
    { id: 'rtp_av', n: 'RTP Hoogvlieger', rtp: true, v: ['88%', '91,5%', '96%'] }
  ] },
  { id: 'woning', n: 'Woning', rows: [
    { id: 'woon', n: 'Extra plekken bij woningen', nieuw: true, v: ['–', '+2', '+5'] },
    { id: 'rust', n: 'Rusten en dokter', s: 'Wachttijd', v: ['100%', '75%', '55%'] }
  ] },
  { id: 'zaken', n: 'Zaken', rows: [
    { id: 'vest', n: 'Vestigingen per zaak', nieuw: true, v: ['10', '12', '15'] },
    { id: 'klemv', n: 'VIP-geldklem', s: 'Inkomen ×1,5, 2 uur (€30 mln. in Outfit)', v: ['–', 'ja', 'ja'] },
    { id: 'klemd', n: 'Diamanten geldklem', s: 'Inkomen ×2, 2 uur (€75 mln. in Outfit)', v: ['–', '–', 'ja'] }
  ] },
  { id: 'overig', n: 'Overig', rows: [
    { id: 'tag', n: 'Tag bij je naam en in de ranglijst', v: ['–', 'VIP', 'HIGH ROLLER'] },
    { id: 'dob', n: 'Gouden dobbelsteen', s: '+25% op je slotwinst, 15 min (€5 mln. in Outfit)', v: ['–', '–', 'ja'] },
    { id: 'famgesprek', n: 'Opnieuw solliciteren bij een familie', v: ['15 min', '11 min', '8 min'] }
  ] }
];
const eur = p => p ? '€ ' + p.toFixed(2).replace('.', ',') : '€ 0';
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nRows = () => CATS.reduce((a, c) => a + c.rows.length, 0);
// De vergelijkingstabel (spel én website; opmaak in css/lid.css en css/lp-lid.css). cur = jouw lidmaatschap (0/1/2) of null.
// Op smalle schermen wordt elke rij een kaartje: het voordeel over de volle breedte, de drie waarden eronder met een klein label.
function tableHtml(o) {
  o = o || {}; const cur = o.cur == null ? null : +o.cur;
  const cell = (v, i) => { const t = TIERS[i], c = 'lt-v lt-' + t.id + (cur === i ? ' lt-cur' : '') + (v === '–' ? ' lt-no' : '');
    const val = v === '–' ? '<span class="lt-dash" aria-label="geen">–</span>' : v === 'ja' ? '<span class="lt-yes">ja</span>' : esc(v);
    return `<td class="${c}" data-l="${esc(t.short)}">${val}</td>`; };
  return `<table class="lt"><caption class="sr-only">Gratis, VIP en High roller vergeleken: ${nRows()} voordelen in ${CATS.length} categorieën</caption>
<thead><tr><th scope="col" class="lt-n">Voordeel</th>${TIERS.map((t, i) => `<th scope="col" class="lt-h lt-${t.id}${cur === i ? ' lt-cur' : ''}">${esc(t.n)}${cur === i ? '<small>jij</small>' : ''}</th>`).join('')}</tr></thead>
${CATS.map(c => `<tbody class="lt-cat lt-cat--${c.id}"><tr class="lt-ch"><th colspan="4" scope="colgroup"><span>${esc(c.n)}</span>${c.note ? `<small>${esc(c.note)}</small>` : ''}</th></tr>
${c.rows.map(r => `<tr class="lt-r${r.rtp ? ' lt-rtp' : ''}"><th scope="row" class="lt-n"><b>${esc(r.n)}</b>${r.nieuw ? '<em class="lt-new">nieuw</em>' : ''}${r.s ? `<small>${esc(r.s)}</small>` : ''}</th>${r.v.map(cell).join('')}</tr>`).join('\n')}</tbody>`).join('\n')}
</table>`;
}
const LID = { PRICE, PRICE_VOORLOPIG, TIERS, CATS, eur, esc, tableHtml, nRows,
  rows: () => CATS.reduce((a, c) => a.concat(c.rows), []),
  row: id => { for (const c of CATS) for (const r of c.rows) if (r.id === id) return r; return null; } };
root.LID = LID;
if (typeof module !== 'undefined' && module.exports) module.exports = LID;
})(typeof window !== 'undefined' ? window : this);
