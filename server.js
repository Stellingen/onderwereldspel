// Onderwereld-server: serveert de frontend en biedt accounts, opslag en een ranglijst.
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');
const mountAdmin = require('./admin');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'onderwereld-dev-secret-verander-mij';
const PUBLIC = path.join(__dirname, 'public');

function sign(user) {
  return jwt.sign({ id: user.id, u: user.display }, SECRET, { expiresIn: '30d' });
}
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: 'Niet ingelogd' });
  try { req.user = jwt.verify(t, SECRET); next(); }
  catch (e) { return res.status(401).json({ error: 'Sessie verlopen, log opnieuw in' }); }
}
function validName(u) { return typeof u === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(u); }
function validPass(p) { return typeof p === 'string' && p.length >= 6 && p.length <= 100; }
if (!process.env.JWT_SECRET) console.warn('⚠  Zet JWT_SECRET in Railway, anders kan iemand inlog-tokens nabootsen.');

// Eenvoudige rem tegen het raden van wachtwoorden: max 20 pogingen per 10 minuten per IP.
const hits = new Map();
function limit(req, res, next) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const nowT = Date.now(), h = (hits.get(ip) || []).filter(t => nowT - t < 600000);
  if (h.length >= 20) return res.status(429).json({ error: 'Te veel pogingen. Wacht een paar minuten.' });
  h.push(nowT); hits.set(ip, h); next();
}
const need = (res) => res.status(503).json({ error: 'Database is nog niet verbonden. Koppel de MySQL-variabelen in Railway.' });

app.get('/api/health', (req, res) => res.json({ ok: true, db: db.state.ready }));

app.post('/api/register', limit, async (req, res) => {
  if (!db.state.ready) return need(res);
  const { username, password } = req.body || {};
  if (!validName(username)) return res.status(400).json({ error: 'Gebruikersnaam: 3–20 letters, cijfers of _' });
  if (!validPass(password)) return res.status(400).json({ error: 'Wachtwoord moet minstens 6 tekens zijn' });
  try {
    const [ex] = await db.q('SELECT id FROM users WHERE username=?', [username.toLowerCase()]);
    if (ex.length) return res.status(409).json({ error: 'Die gebruikersnaam is al bezet' });
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.q('INSERT INTO users(username,display,password_hash) VALUES(?,?,?)', [username.toLowerCase(), username, hash]);
    const user = { id: r.insertId, display: username };
    res.json({ token: sign(user), username });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfout bij registreren' }); }
});

app.post('/api/login', limit, async (req, res) => {
  if (!db.state.ready) return need(res);
  const { username, password } = req.body || {};
  if (!validName(username) || typeof password !== 'string') return res.status(400).json({ error: 'Ongeldige invoer' });
  try {
    const [rows] = await db.q('SELECT id,display,password_hash,banned,ban_reason FROM users WHERE username=?', [username.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Onbekende gebruiker of verkeerd wachtwoord' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Onbekende gebruiker of verkeerd wachtwoord' });
    if (rows[0].banned) return res.status(403).json({ error: 'Dit profiel is verbannen' + (rows[0].ban_reason ? ' (' + rows[0].ban_reason + ')' : '') + '. Maak een nieuw profiel aan.', code: 'banned' });
    res.json({ token: sign(rows[0]), username: rows[0].display });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfout bij inloggen' }); }
});

app.get('/api/me', auth, async (req, res) => {
  const out = { username: req.user.u };
  if (db.state.ready) {
    try {
      const [rows] = await db.q('SELECT created_at, username, tier, is_admin, banned, ban_reason, public_profile FROM users WHERE id=?', [req.user.id]);
      if (!rows.length) return res.status(401).json({ error: 'Account bestaat niet meer' });
      if (rows[0].banned) return res.status(403).json({ error: 'Dit profiel is verbannen' + (rows[0].ban_reason ? ' (' + rows[0].ban_reason + ')' : '') + '. Maak een nieuw profiel aan.', code: 'banned', reason: rows[0].ban_reason || '' });
      out.since = rows[0].created_at;
      const [red] = await db.q('SELECT code FROM redemptions WHERE user_id=?', [req.user.id]);
      // alleen codes die nog bestaan (verwijderde codes zoals broke en tester verdwijnen uit 'gebruikte codes')
      out.redeemed = red.map(r => r.code).filter(c => CODES[c] || RANK_CODES[c]);
      // lidmaatschap: 0 gewoon, 1 VIP, 2 High roller (door de beheerder); zonder keuze telt de oude VIP-code
      out.tier = rows[0].tier != null ? +rows[0].tier : (out.redeemed.includes('vip') ? 1 : 0);
      out.admin = !!rows[0].is_admin || admin.ADMIN_USERS().includes(rows[0].username);
      out.pub = !!rows[0].public_profile;
    } catch (e) { console.error(e); }
  }
  res.json(out);
});

// Inwisselcodes: elke code één keer per account. Bedrag in euro (spelgeld).
const CODES = { lotto: 1500, welkom: 500, casino: 5000, vip: 20000, spinnetje: 25000, jackpot: 1000000, trainwreck: 3000000, highroller: 50000 };
// Rangcodes: de naam van een rang, alleen in te wisselen als je die rang hebt bereikt (xp uit game_state).
const RANK_CODES = {
  straatschoffie: [150, 150], loopjongen: [500, 400], dief: [1200, 1000], boef: [2500, 2500],
  gangster: [5000, 6000], soldaat: [9000, 12000], huurmoordenaar: [15000, 25000], capo: [25000, 50000],
  onderbaas: [40000, 100000], consigliere: [65000, 200000], peetvader: [100000, 500000]
};
// m1 t/m m9 bestaan niet meer; ze verdwijnen daardoor ook uit 'gebruikte codes'. Spaties en streepjes tellen niet mee (High Roller = highroller).
const ALIASES = { kapo: 'capo' };
app.post('/api/redeem', auth, limit, async (req, res) => {
  if (!db.state.ready) return need(res);
  let code = String((req.body && req.body.code) || '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  if (!code || code.length > 40) return res.status(400).json({ error: 'Vul een code in' });
  code = ALIASES[code] || code;
  let amount = CODES[code];
  if (!amount && RANK_CODES[code]) {
    const [need, pay] = RANK_CODES[code];
    try {
      const [rows] = await db.q('SELECT xp FROM game_state WHERE user_id=?', [req.user.id]);
      const xp = rows.length ? +rows[0].xp : 0;
      if (xp < need) return res.status(403).json({ error: 'Deze rangcode werkt pas als je die rang hebt bereikt' });
    } catch (e) { console.error(e); return res.status(500).json({ error: 'Kon je rang niet controleren' }); }
    amount = pay;
  }
  if (!amount) return res.status(404).json({ error: 'Deze code bestaat niet' });
  try {
    await db.q('INSERT INTO redemptions(user_id,code,amount) VALUES(?,?,?)', [req.user.id, code, amount]);
    res.json({ ok: true, code, amount });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Je hebt deze code al gebruikt' });
    console.error(e); res.status(500).json({ error: 'Kon de code niet inwisselen' });
  }
});

// Eén apparaat tegelijk: wie het spel opent, claimt de sessie (sid). Opslaan vanaf een ander (ouder) apparaat wordt geweigerd,
// zodat twee apparaten elkaars voortgang niet kunnen overschrijven of geld dubbel kunnen uitgeven.
const okSid = s => typeof s === 'string' && /^[a-f0-9]{16,40}$/.test(s);
async function isBanned(id) { const [r] = await db.q('SELECT banned FROM users WHERE id=?', [id]); return !r.length || !!r[0].banned; }
const banned = res => res.status(403).json({ error: 'Dit profiel is verbannen. Maak een nieuw profiel aan.', code: 'banned' });

// Signalen van mogelijk misbruik (alleen zichtbaar voor beheerders). Eén regel per speler per soort; nieuwe meldingen tellen op.
async function flag(uid, kind, detail) {
  try {
    await db.q(`INSERT INTO player_flags(user_id,kind,detail,count,first_at,last_at,resolved) VALUES(?,?,?,1,NOW(),NOW(),0)
      ON DUPLICATE KEY UPDATE count=IF(resolved=1,1,count+1), first_at=IF(resolved=1,NOW(),first_at), detail=VALUES(detail), last_at=NOW(), resolved=0`,
      [uid, kind, String(detail || '').slice(0, 300)]);
  } catch (e) { console.error('flag', e.message); }
}
const fmtE = v => '€' + Math.round(v).toLocaleString('nl-NL');
// opslaan vanaf een oud apparaat: vaak proberen kan op dubbel geld mikken
const staleSaves = new Map();
function noteStale(uid) {
  const t = Date.now(), a = (staleSaves.get(uid) || []).filter(x => t - x < 600000); a.push(t); staleSaves.set(uid, a);
  if (a.length === 25) flag(uid, 'apparaten', `${a.length} keer geprobeerd op te slaan vanaf een apparaat dat niet meer actief was (10 minuten)`);
}
// vergelijk de nieuwe opslag met de vorige: sprongen die het spel niet kan verklaren
function checkJump(uid, prev, s, dt) {
  try {
    const ps = prev.state ? JSON.parse(prev.state) : null; if (!ps || ps.__reset) return;
    const st = s.stats || {}, pst = ps.stats || {};
    const net = (+s.cash || 0) + (+s.bank || 0) + Math.max(0, +s.bankExtra || 0), pnet = +prev.networth || 0;
    const won = Math.max(0, (+st.won || 0) - (+pst.won || 0)), kas = Math.max(0, (+ps.kas || 0) - (+s.kas || 0));
    const unexplained = net - pnet - won - kas;
    if (unexplained > Math.max(75e6, pnet * 3) && !prev.recentCode)
      flag(uid, 'geld', `Vermogen ${fmtE(pnet)} → ${fmtE(net)} in ${dt} s; casino ${fmtE(won)} en bedrijven ${fmtE(kas)} verklaren daar ${fmtE(unexplained)} niet van`);
    const dxp = (+s.xp || 0) - (+prev.xp || 0);
    if (dxp > 8000) flag(uid, 'xp', `+${Math.round(dxp).toLocaleString('nl-NL')} XP in ${dt} s (één klus geeft hooguit ±2.300)`);
    if ((+s.energy || 0) > 600) flag(uid, 'energie', `Energie ${Math.round(+s.energy)} (normaal maximaal ±250)`);
    const dcr = (+st.crimes || 0) - (+pst.crimes || 0);
    if (dcr > 30 && dt < 20) flag(uid, 'klussen', `${dcr} klussen in ${dt} s`);
  } catch (e) { /* kapotte oude opslag: niets doen */ }
}
app.get('/api/state', auth, async (req, res) => {
  if (!db.state.ready) return need(res);
  try {
    if (await isBanned(req.user.id)) return banned(res);
    const sid = okSid(req.query.sid) ? req.query.sid : null;
    if (sid) await db.q('UPDATE game_state SET sid=? WHERE user_id=?', [sid, req.user.id]);
    const [rows] = await db.q('SELECT state, rev FROM game_state WHERE user_id=?', [req.user.id]);
    res.json({ state: rows.length ? JSON.parse(rows[0].state) : null, rev: rows.length ? rows[0].rev : 0 });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Kon voortgang niet laden' }); }
});
// Is dit apparaat nog het actieve? (bij terugkomen naar een tabblad)
app.get('/api/session', auth, async (req, res) => {
  if (!db.state.ready) return res.json({ active: true });
  try {
    const [rows] = await db.q('SELECT sid FROM game_state WHERE user_id=?', [req.user.id]);
    const sid = rows.length ? String(rows[0].sid || '') : '';
    res.json({ active: !sid || sid === req.query.sid, reason: sid.startsWith('adm') ? 'admin' : 'device' });
  } catch (e) { res.json({ active: true }); }
});

app.post('/api/state', auth, async (req, res) => {
  if (!db.state.ready) return need(res);
  const s = req.body && req.body.state, sid = okSid(req.body && req.body.sid) ? req.body.sid : null;
  if (!s || typeof s !== 'object') return res.status(400).json({ error: 'Geen status meegegeven' });
  try {
    if (await isBanned(req.user.id)) return banned(res);
    const [cur] = await db.q(`SELECT sid, rev, state, xp, networth, GREATEST(1,TIMESTAMPDIFF(SECOND, updated_at, NOW())) AS dt,
      EXISTS(SELECT 1 FROM redemptions r WHERE r.user_id=? AND r.created_at > NOW() - INTERVAL 3 MINUTE) AS recentCode
      FROM game_state WHERE user_id=?`, [req.user.id, req.user.id]);
    if (cur.length && cur[0].sid && cur[0].sid !== sid && !String(cur[0].sid).startsWith('adm')) noteStale(req.user.id);
    if (cur.length && cur[0].sid && cur[0].sid !== sid)
      return String(cur[0].sid).startsWith('adm')
        ? res.status(409).json({ error: 'Je account is bijgewerkt door een beheerder.', code: 'admin_update' })
        : res.status(409).json({ error: 'Je speelt op een ander apparaat verder.', code: 'other_device' });
    // een oudere stand van hetzelfde apparaat die later binnenkomt (twee opslagen tegelijk onderweg) mag een nieuwere niet overschrijven
    if (cur.length && cur[0].state && s._dev) {
      let ps = null; try { ps = JSON.parse(cur[0].state); } catch (e) {}
      if (ps && ps._dev === s._dev && (+s.savedAt || 0) < (+ps.savedAt || 0)) return res.json({ ok: true, rev: cur[0].rev, stale: true });
    }
    const rev = (cur.length ? cur[0].rev : 0) + 1;
    if (cur.length) checkJump(req.user.id, cur[0], s, +cur[0].dt || 1);
    const json = JSON.stringify(s);
    const xp = +s.xp || 0;
    const networth = Math.floor((+s.cash || 0) + (+s.bank || 0) + Math.max(0, +s.bankExtra || 0)); // bankExtra = deposito's + beleggingen
    const rankname = String(s.rankname || 'Rookie').slice(0, 40);
    const day = +s.day || 1;
    await db.q(
      `INSERT INTO game_state(user_id,state,xp,networth,rankname,day,rev,sid) VALUES(?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE state=VALUES(state),xp=VALUES(xp),networth=VALUES(networth),rankname=VALUES(rankname),day=VALUES(day),rev=VALUES(rev),sid=COALESCE(sid,VALUES(sid))`,
      [req.user.id, json, xp, networth, rankname, day, rev, sid]
    );
    res.json({ ok: true, rev });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Kon voortgang niet opslaan' }); }
});

// meldingen die alleen het spel zelf kan zien (zoals een autoclicker); hooguit één per soort per 2 minuten
const flagHits = new Map();
app.post('/api/flag', auth, async (req, res) => {
  if (!db.state.ready) return res.json({ ok: true });
  const kind = String((req.body && req.body.kind) || ''), detail = String((req.body && req.body.detail) || '').slice(0, 200);
  if (!['autoclick'].includes(kind)) return res.status(400).json({ error: 'Onbekend' });
  const k = req.user.id + ':' + kind, t = Date.now();
  if (t - (flagHits.get(k) || 0) < 120000) return res.json({ ok: true });
  flagHits.set(k, t); await flag(req.user.id, kind, detail); res.json({ ok: true });
});

app.get('/api/leaderboard', async (req, res) => {
  if (!db.state.ready) return res.json({ players: [] });
  try {
    const [rows] = await db.q(
      `SELECT u.display AS name, g.xp, g.networth, g.rankname, g.day, u.public_profile AS pub,
         COALESCE(u.tier, EXISTS(SELECT 1 FROM redemptions r WHERE r.user_id=u.id AND r.code='vip')) AS vip
       FROM game_state g JOIN users u ON u.id=g.user_id
       WHERE u.banned=0
       ORDER BY g.xp DESC LIMIT 25`
    );
    res.json({ players: rows });
  } catch (e) { console.error(e); res.json({ players: [] }); }
});

// Profielen: standaard privé. De speler kan zijn profiel openbaar zetten; dan zien anderen zijn vermogen, familie, outfit en
// prestaties. Een beheerder ziet elk profiel (ook privé), net als de speler zelf.
app.post('/api/profile/privacy', auth, async (req, res) => {
  if (!db.state.ready) return need(res);
  const pub = req.body && req.body.public ? 1 : 0;
  try { await db.q('UPDATE users SET public_profile=? WHERE id=?', [pub, req.user.id]); res.json({ ok: true, public: !!pub }); }
  catch (e) { console.error(e); res.status(500).json({ error: 'Kon de instelling niet opslaan' }); }
});
function profileOf(st) {
  if (!st || typeof st !== 'object' || st.__reset) return null;
  const n = v => Math.max(0, Math.floor(+v || 0)), stats = st.stats || {};
  let units = 0; Object.values(st.biz2 || {}).forEach(a => { if (Array.isArray(a)) units += a.length; });
  const wear = {}; if (st.fit && st.fit.wear && typeof st.fit.wear === 'object') for (const [k, v] of Object.entries(st.fit.wear)) if (/^[a-z]{2,12}$/.test(k) && /^[a-z]{2,16}$/.test(String(v))) wear[k] = String(v);
  return {
    cash: n(st.cash), bank: n(st.bank) + n(st.bankExtra), cred: n(st.cred), family: typeof st.family === 'string' ? st.family.slice(0, 20) : null,
    famEer: st.fr && st.fr.id === st.family ? n(st.fr.eer) : 0, famLead: st.fr && st.fr.id === st.family ? Math.min(2, n(st.fr.lead)) : 0, home: typeof st.home === 'string' ? st.home.slice(0, 20) : null,
    cars: Array.isArray(st.cars) ? st.cars.length : 0, units, wear,
    skills: Object.values(st.skills || {}).reduce((a, v) => a + n(v), 0),
    stats: { crimes: n(stats.crimes), fails: n(stats.fails), cars: n(stats.cars), hits: n(stats.hits), jacks: n(stats.jacks), won: n(stats.won), lost: n(stats.lost) },
    jail: n(st.jailUntil) > Date.now(), wanted: !!st.wanted
  };
}
app.get('/api/profile/:name', async (req, res) => {
  if (!db.state.ready) return res.status(503).json({ error: 'Even geen verbinding met de database' });
  const name = String(req.params.name || '').toLowerCase();
  if (!validName(name)) return res.status(400).json({ error: 'Onbekende speler' });
  let viewer = null; const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (t) { try { viewer = jwt.verify(t, SECRET); } catch (e) { viewer = null; } }
  try {
    const [rows] = await db.q(`SELECT u.id, u.display, u.created_at, u.public_profile, u.banned,
        COALESCE(u.tier, EXISTS(SELECT 1 FROM redemptions r WHERE r.user_id=u.id AND r.code='vip')) AS tier,
        g.state, g.xp, g.networth, TIMESTAMPDIFF(SECOND, g.updated_at, NOW()) AS seen_s
      FROM users u LEFT JOIN game_state g ON g.user_id=u.id WHERE u.username=?`, [name]);
    if (!rows.length || rows[0].banned) return res.status(404).json({ error: 'Deze speler bestaat niet (meer)' });
    const r = rows[0], own = !!viewer && viewer.id === r.id, isAdm = !!viewer && !own && await admin.isAdmin(viewer.id).catch(() => false);
    const base = { name: r.display, xp: +r.xp || 0, tier: +r.tier || 0, public: !!r.public_profile, own, admin: isAdm };
    if (!r.public_profile && !own && !isAdm) return res.json(Object.assign(base, { private: true }));
    let st = null; try { st = r.state ? JSON.parse(r.state) : null; } catch (e) { st = null; }
    res.json(Object.assign(base, { since: r.created_at, networth: +r.networth || 0, seen_s: r.seen_s == null ? null : +r.seen_s, p: profileOf(st) }));
  } catch (e) { console.error(e); res.status(500).json({ error: 'Kon het profiel niet laden' }); }
});

// Beheer (dashboard op /admin)
// rangnaam bij een aantal XP (zelfde drempels als de rangcodes)
const rankOf = xp => { let n = 'Rookie'; for (const [k, [needXp]] of Object.entries(RANK_CODES)) if (xp >= needXp) n = k[0].toUpperCase() + k.slice(1); return n; };
const admin = mountAdmin(app, { auth, db, need, rankOf });

// Frontend
app.use(express.static(PUBLIC, { extensions: ['html'] }));
app.get('*', (req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));

db.init()
  .catch(e => console.error('DB-init mislukt:', e.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`✓ Onderwereld draait op poort ${PORT}`));
  });
