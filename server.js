// Onderwereld-server: serveert de frontend en biedt accounts, opslag en een ranglijst.
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

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
    const [rows] = await db.q('SELECT id,display,password_hash FROM users WHERE username=?', [username.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: 'Onbekende gebruiker of verkeerd wachtwoord' });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'Onbekende gebruiker of verkeerd wachtwoord' });
    res.json({ token: sign(rows[0]), username: rows[0].display });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Serverfout bij inloggen' }); }
});

app.get('/api/me', auth, async (req, res) => {
  const out = { username: req.user.u };
  if (db.state.ready) {
    try {
      const [rows] = await db.q('SELECT created_at FROM users WHERE id=?', [req.user.id]);
      if (rows.length) out.since = rows[0].created_at;
      const [red] = await db.q('SELECT code FROM redemptions WHERE user_id=?', [req.user.id]);
      out.redeemed = red.map(r => r.code);
    } catch (e) { console.error(e); }
  }
  res.json(out);
});

// Inwisselcodes: elke code één keer per account. Bedrag in euro (spelgeld).
const CODES = { lotto: 1500, welkom: 500, casino: 5000, vip: 20000 };
// Rangcodes: de naam van een rang, alleen in te wisselen als je die rang hebt bereikt (xp uit game_state).
const RANK_CODES = {
  straatschoffie: [150, 150], loopjongen: [500, 400], dief: [1200, 1000], boef: [2500, 2500],
  gangster: [5000, 6000], soldaat: [9000, 12000], huurmoordenaar: [15000, 25000], capo: [25000, 50000],
  onderbaas: [40000, 100000], consigliere: [65000, 200000], peetvader: [100000, 500000]
};
const ALIASES = { kapo: 'capo' };
app.post('/api/redeem', auth, limit, async (req, res) => {
  if (!db.state.ready) return need(res);
  let code = String((req.body && req.body.code) || '').trim().toLowerCase();
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

app.get('/api/state', auth, async (req, res) => {
  if (!db.state.ready) return need(res);
  try {
    const [rows] = await db.q('SELECT state FROM game_state WHERE user_id=?', [req.user.id]);
    res.json({ state: rows.length ? JSON.parse(rows[0].state) : null });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Kon voortgang niet laden' }); }
});

app.post('/api/state', auth, async (req, res) => {
  if (!db.state.ready) return need(res);
  const s = req.body && req.body.state;
  if (!s || typeof s !== 'object') return res.status(400).json({ error: 'Geen status meegegeven' });
  try {
    const json = JSON.stringify(s);
    const xp = +s.xp || 0;
    const networth = Math.floor((+s.cash || 0) + (+s.bank || 0));
    const rankname = String(s.rankname || 'Rookie').slice(0, 40);
    const day = +s.day || 1;
    await db.q(
      `INSERT INTO game_state(user_id,state,xp,networth,rankname,day) VALUES(?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE state=VALUES(state),xp=VALUES(xp),networth=VALUES(networth),rankname=VALUES(rankname),day=VALUES(day)`,
      [req.user.id, json, xp, networth, rankname, day]
    );
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Kon voortgang niet opslaan' }); }
});

app.get('/api/leaderboard', async (req, res) => {
  if (!db.state.ready) return res.json({ players: [] });
  try {
    const [rows] = await db.q(
      `SELECT u.display AS name, g.xp, g.networth, g.rankname, g.day,
         EXISTS(SELECT 1 FROM redemptions r WHERE r.user_id=u.id AND r.code='vip') AS vip
       FROM game_state g JOIN users u ON u.id=g.user_id
       ORDER BY g.xp DESC LIMIT 25`
    );
    res.json({ players: rows });
  } catch (e) { console.error(e); res.json({ players: [] }); }
});

// Frontend
app.use(express.static(PUBLIC, { extensions: ['html'] }));
app.get('*', (req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));

db.init()
  .catch(e => console.error('DB-init mislukt:', e.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`✓ Onderwereld draait op poort ${PORT}`));
  });
