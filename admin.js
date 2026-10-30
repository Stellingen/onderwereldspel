// Beheer: alleen voor beheerders (ADMIN_USERS in Railway of is_admin in de database).
// Elke aanpassing aan een speler wordt gelogd en zet de sessie van de speler op 'adm…', zodat zijn spel
// niet meer over de nieuwe stand heen kan opslaan: hij krijgt een melding en laadt opnieuw.
const crypto = require('crypto');

const ADMIN_USERS = () => String(process.env.ADMIN_USERS || '').toLowerCase().split(/[\s,;]+/).filter(Boolean);
const MAX_MONEY = 1e15;
const num = v => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? +v : NaN);
const fmt = v => '€' + Math.round(v).toLocaleString('nl-NL');
const TIER_NAME = ['Gewoon', 'VIP', 'High roller'];

module.exports = function mountAdmin(app, { auth, db, need, rankOf }) {
  // is deze gebruiker beheerder? (env-lijst of kolom is_admin)
  async function isAdmin(id) {
    const [rows] = await db.q('SELECT username, is_admin, banned FROM users WHERE id=?', [id]);
    if (!rows.length || rows[0].banned) return false;
    return !!rows[0].is_admin || ADMIN_USERS().includes(rows[0].username);
  }
  async function adminOnly(req, res, next) {
    if (!db.state.ready) return need(res);
    try { if (await isAdmin(req.user.id)) return next(); } catch (e) { console.error(e); }
    res.status(403).json({ error: 'Alleen voor beheerders' });
  }
  const log = (adminId, targetId, action, detail) =>
    db.q('INSERT INTO admin_log(admin_id,target_id,action,detail) VALUES(?,?,?,?)', [adminId, targetId, action, String(detail || '').slice(0, 500)]).catch(e => console.error(e));
  const kickSid = () => 'adm' + crypto.randomBytes(8).toString('hex');

  // effectief lidmaatschap: kolom tier, anders telt de oude VIP-code als VIP
  const TIER_SQL = `COALESCE(u.tier, EXISTS(SELECT 1 FROM redemptions r WHERE r.user_id=u.id AND r.code='vip'))`;

  // samenvatting van een opslag voor de lijst en het profiel
  function summary(st) {
    if (!st || typeof st !== 'object' || st.__reset) return null;
    const biz2 = st.biz2 || {};
    let units = 0; Object.values(biz2).forEach(a => { if (Array.isArray(a)) units += a.length; });
    const dep = Array.isArray(st.dep) ? st.dep.reduce((a, d) => a + (+d.amt || +d.a || 0), 0) : 0;
    return {
      name: st.name, cash: +st.cash || 0, bank: +st.bank || 0, bankExtra: +st.bankExtra || 0, xp: +st.xp || 0, cred: +st.cred || 0,
      heat: +st.heat || 0, energy: +st.energy || 0, hp: +st.hp || 0, family: st.family || null, famEer: st.fr && st.fr.id === st.family ? +st.fr.eer || 0 : 0,
      jailUntil: +st.jailUntil || 0, wanted: !!st.wanted, home: st.home || null, skills: st.skills || {}, units, dep,
      gear: Object.keys(st.gear || {}).length, cars: Array.isArray(st.cars) ? st.cars.length : 0, kas: +st.kas || 0,
      stats: st.stats || {}, savedAt: +st.savedAt || 0
    };
  }

  // Overzicht: aantallen en de rijkste en meest actieve spelers
  app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
    try {
      const [[c]] = await db.q(`SELECT COUNT(*) AS users,
          SUM(u.banned) AS banned,
          SUM(EXISTS(SELECT 1 FROM player_flags f WHERE f.user_id=u.id AND f.resolved=0)) AS flagged,
          SUM(${TIER_SQL}=1) AS vip, SUM(${TIER_SQL}=2) AS hr,
          SUM(u.created_at > NOW() - INTERVAL 1 DAY) AS new24
        FROM users u`);
      const [[g]] = await db.q(`SELECT COUNT(*) AS played, SUM(updated_at > NOW() - INTERVAL 15 MINUTE) AS online,
          SUM(updated_at > NOW() - INTERVAL 1 DAY) AS active24, COALESCE(SUM(networth),0) AS money FROM game_state`);
      const [rich] = await db.q(`SELECT u.id, u.display, g.networth, g.rankname FROM game_state g JOIN users u ON u.id=g.user_id ORDER BY g.networth DESC LIMIT 5`);
      const [recent] = await db.q(`SELECT u.id, u.display, g.updated_at, TIMESTAMPDIFF(SECOND, g.updated_at, NOW()) AS seen_s, g.rankname FROM game_state g JOIN users u ON u.id=g.user_id ORDER BY g.updated_at DESC LIMIT 6`);
      res.json({ counts: Object.assign({}, c, g), rich, recent });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Kon het overzicht niet laden' }); }
  });

  // Spelers zoeken: op naam, met filter en sortering
  app.get('/api/admin/players', auth, adminOnly, async (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase().slice(0, 32);
    const like = '%' + String(req.query.q || '').trim().toLowerCase().slice(0, 32).replace(/[%_\\]/g, '\\$&') + '%';
    const sort = { xp: 'g.xp DESC', geld: 'g.networth DESC', nieuw: 'u.created_at DESC', actief: 'g.updated_at DESC', naam: 'u.username ASC' }[req.query.sort] || 'g.updated_at DESC';
    const FLAGS = `(SELECT COUNT(*) FROM player_flags f WHERE f.user_id=u.id AND f.resolved=0)`;
    const filter = { vip: `${TIER_SQL}=1`, hr: `${TIER_SQL}=2`, banned: 'u.banned=1', admin: 'u.is_admin=1', flag: `${FLAGS}>0`, online: 'g.updated_at > NOW() - INTERVAL 5 MINUTE' }[req.query.f] || '1=1';
    const off = Math.max(0, Math.min(100000, parseInt(req.query.off, 10) || 0)), lim = 100;
    try {
      const [rows] = await db.q(
        `SELECT u.id, u.display, u.username, u.created_at, u.banned, u.is_admin, u.tier AS tier_raw, ${TIER_SQL} AS tier, ${FLAGS} AS flags,
           g.xp, g.networth, g.rankname, g.updated_at, TIMESTAMPDIFF(SECOND, g.updated_at, NOW()) AS seen_s
         FROM users u LEFT JOIN game_state g ON g.user_id=u.id
         WHERE u.username LIKE ? AND ${filter}
         ORDER BY ${sort.replace(/g\.(\w+) DESC/, 'g.$1 IS NULL, g.$1 DESC')} LIMIT ${lim} OFFSET ${off}`, [like]);
      const [[{ total }]] = await db.q(`SELECT COUNT(*) AS total FROM users u LEFT JOIN game_state g ON g.user_id=u.id WHERE u.username LIKE ? AND ${filter}`, [like]);
      const admins = ADMIN_USERS();
      res.json({ total: +total, off, players: rows.map(r => Object.assign(r, { tier: +r.tier || 0, flags: +r.flags || 0, admin: !!r.is_admin || admins.includes(r.username) })) });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Kon spelers niet laden' }); }
  });

  // Eén speler: account, lidmaatschap, opslag-samenvatting, gebruikte codes en zijn logboek
  app.get('/api/admin/player/:id', auth, adminOnly, async (req, res) => {
    const id = +req.params.id;
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Ongeldig id' });
    try {
      const [u] = await db.q(`SELECT u.id, u.display, u.username, u.created_at, u.banned, u.ban_reason, u.is_admin, u.tier AS tier_raw, ${TIER_SQL} AS tier FROM users u WHERE u.id=?`, [id]);
      if (!u.length) return res.status(404).json({ error: 'Speler niet gevonden' });
      const [g] = await db.q('SELECT state, xp, networth, rankname, updated_at, TIMESTAMPDIFF(SECOND, updated_at, NOW()) AS seen_s, rev, sid FROM game_state WHERE user_id=?', [id]);
      const [red] = await db.q('SELECT code, amount, created_at FROM redemptions WHERE user_id=? ORDER BY created_at DESC', [id]);
      const [lg] = await db.q(`SELECT l.action, l.detail, l.created_at, a.display AS admin FROM admin_log l LEFT JOIN users a ON a.id=l.admin_id WHERE l.target_id=? ORDER BY l.id DESC LIMIT 40`, [id]);
      const [fl] = await db.q(`SELECT kind, detail, count, first_at, last_at, resolved, TIMESTAMPDIFF(SECOND, last_at, NOW()) AS ago_s FROM player_flags WHERE user_id=? ORDER BY resolved, last_at DESC`, [id]);
      let st = null; try { st = g.length && g[0].state ? JSON.parse(g[0].state) : null; } catch (e) { st = null; }
      const p = u[0];
      res.json({
        player: Object.assign(p, { tier: +p.tier || 0, admin: !!p.is_admin || ADMIN_USERS().includes(p.username), envAdmin: ADMIN_USERS().includes(p.username) }),
        game: g.length ? { xp: g[0].xp, networth: g[0].networth, rankname: g[0].rankname, updated_at: g[0].updated_at, seen_s: g[0].seen_s, rev: g[0].rev, reset: !!(st && st.__reset), kicked: String(g[0].sid || '').startsWith('adm') } : null,
        s: summary(st), codes: red, log: lg, flags: fl
      });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Kon de speler niet laden' }); }
  });

  // Logboek van alle beheeracties
  app.get('/api/admin/log', auth, adminOnly, async (req, res) => {
    try {
      const [rows] = await db.q(`SELECT l.id, l.action, l.detail, l.created_at, a.display AS admin, t.display AS target, l.target_id
        FROM admin_log l LEFT JOIN users a ON a.id=l.admin_id LEFT JOIN users t ON t.id=l.target_id ORDER BY l.id DESC LIMIT 100`);
      res.json({ log: rows });
    } catch (e) { console.error(e); res.status(500).json({ error: 'Kon het logboek niet laden' }); }
  });

  // De opslag van een speler veilig aanpassen: lezen, wijzigen, terugschrijven met dezelfde versie (anders opnieuw proberen).
  async function editState(id, fn) {
    for (let i = 0; i < 4; i++) {
      const [g] = await db.q('SELECT state, rev FROM game_state WHERE user_id=?', [id]);
      if (!g.length || !g[0].state) throw Object.assign(new Error('Deze speler heeft nog geen opgeslagen spel'), { status: 409 });
      let st; try { st = JSON.parse(g[0].state); } catch (e) { throw Object.assign(new Error('Opslag van deze speler is onleesbaar'), { status: 500 }); }
      if (st.__reset) throw Object.assign(new Error('Dit account is net gereset; de speler moet eerst opnieuw inloggen'), { status: 409 });
      const detail = fn(st);
      st._admin = st._admin || {}; st._admin.at = Date.now(); st._dev = 'admin'; st.savedAt = Date.now();
      const networth = Math.floor((+st.cash || 0) + (+st.bank || 0) + Math.max(0, +st.bankExtra || 0));
      const xp = Math.floor(+st.xp || 0);
      const [r] = await db.q('UPDATE game_state SET state=?, xp=?, networth=?, rankname=?, rev=rev+1, sid=?, updated_at=updated_at WHERE user_id=? AND rev=?',
        [JSON.stringify(st), xp, networth, rankOf ? rankOf(xp) : String(st.rankname || 'Rookie'), kickSid(), id, g[0].rev]);
      if (r.affectedRows) return detail;
    }
    throw Object.assign(new Error('De speler slaat net op, probeer het nog eens'), { status: 409 });
  }
  const note = (st, t) => { st._admin = st._admin || {}; st._admin.notes = (st._admin.notes || []).concat([t]).slice(-5); };
  const kick = id => db.q("UPDATE game_state SET sid=?, updated_at=updated_at WHERE user_id=?", [kickSid(), id]);

  app.post('/api/admin/player/:id/action', auth, adminOnly, async (req, res) => {
    const id = +req.params.id, b = req.body || {}, type = String(b.type || '');
    if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Ongeldig id' });
    try {
      const [u] = await db.q('SELECT id, username, display FROM users WHERE id=?', [id]);
      if (!u.length) return res.status(404).json({ error: 'Speler niet gevonden' });
      let detail = '';
      if (type === 'money') {
        const field = b.field === 'bank' ? 'bank' : 'cash', mode = b.mode === 'set' ? 'set' : 'add', amt = Math.round(num(b.amount));
        if (!Number.isFinite(amt) || Math.abs(amt) > MAX_MONEY) return res.status(400).json({ error: 'Vul een geldig bedrag in' });
        if (mode === 'set' && amt < 0) return res.status(400).json({ error: 'Een saldo kan niet negatief zijn' });
        const label = field === 'bank' ? 'spaarrekening' : 'contant';
        detail = await editState(id, st => {
          const before = +st[field] || 0, after = Math.max(0, mode === 'set' ? amt : before + amt); st[field] = after;
          note(st, mode === 'set' ? `Je ${label} is door een beheerder op ${fmt(after)} gezet.` : `Een beheerder heeft ${amt >= 0 ? fmt(amt) + ' bijgeschreven op' : fmt(-amt) + ' afgeschreven van'} je ${label}.`);
          return `${label}: ${fmt(before)} → ${fmt(after)}`;
        });
      } else if (type === 'xp') {
        const mode = b.mode === 'set' ? 'set' : 'add', amt = Math.round(num(b.amount));
        if (!Number.isFinite(amt) || Math.abs(amt) > 1e9) return res.status(400).json({ error: 'Vul een geldig aantal XP in' });
        const rankName = String(b.rank || '').slice(0, 30);
        detail = await editState(id, st => {
          const before = +st.xp || 0, after = Math.max(0, mode === 'set' ? amt : before + amt); st.xp = after;
          note(st, rankName ? `Een beheerder heeft je rang op ${rankName} gezet.` : `Een beheerder heeft je XP aangepast (${Math.round(after).toLocaleString('nl-NL')} XP).`);
          return `${rankName ? 'rang ' + rankName + ', ' : ''}XP ${Math.round(before)} → ${Math.round(after)}`;
        });
      } else if (type === 'cred') {
        const mode = b.mode === 'set' ? 'set' : 'add', amt = Math.round(num(b.amount));
        if (!Number.isFinite(amt) || Math.abs(amt) > 1e9) return res.status(400).json({ error: 'Vul een geldig aantal in' });
        detail = await editState(id, st => {
          const before = +st.cred || 0, after = Math.max(0, mode === 'set' ? amt : before + amt); st.cred = after;
          note(st, `Een beheerder heeft je straatcredit aangepast (${after}).`);
          return `straatcredit ${before} → ${after}`;
        });
      } else if (type === 'fix') {
        // snelle hulp: uit de cel, energie/gezondheid vol, hitte weg, niet meer gezocht
        const what = ['jail', 'refill', 'heat'].filter(k => b[k]);
        if (!what.length) return res.status(400).json({ error: 'Kies wat je wilt herstellen' });
        detail = await editState(id, st => {
          const done = [];
          if (b.jail) { st.jailUntil = 0; st.pendingArrest = null; st.pendingHeist = null; st.wanted = false; done.push('uit de cel'); }
          if (b.refill) { st.hp = 100; st._admin = st._admin || {}; st._admin.refill = true; done.push('energie en gezondheid vol'); }
          if (b.heat) { st.heat = 0; done.push('hitte 0'); }
          note(st, 'Een beheerder heeft je geholpen: ' + done.join(', ') + '.');
          return done.join(', ');
        });
      } else if (type === 'tier') {
        const t = b.tier === null || b.tier === 'auto' ? null : Math.round(num(b.tier));
        if (t !== null && ![0, 1, 2].includes(t)) return res.status(400).json({ error: 'Ongeldig lidmaatschap' });
        await db.q('UPDATE users SET tier=? WHERE id=?', [t, id]);
        await kick(id);
        detail = t === null ? 'lidmaatschap automatisch (VIP-code telt)' : 'lidmaatschap ' + TIER_NAME[t];
      } else if (type === 'ban') {
        const on = !!b.on, reason = String(b.reason || '').slice(0, 200);
        if (id === req.user.id) return res.status(400).json({ error: 'Je kunt jezelf niet blokkeren' });
        await db.q('UPDATE users SET banned=?, ban_reason=? WHERE id=?', [on ? 1 : 0, on ? reason || null : null, id]);
        await kick(id);
        detail = on ? 'verbannen' + (reason ? ': ' + reason : '') : 'verbanning opgeheven';
      } else if (type === 'admin') {
        if (id === req.user.id) return res.status(400).json({ error: 'Je kunt je eigen beheerrechten niet aanpassen' });
        if (ADMIN_USERS().includes(u[0].username)) return res.status(400).json({ error: 'Deze beheerder staat vast in ADMIN_USERS (Railway)' });
        await db.q('UPDATE users SET is_admin=? WHERE id=?', [b.on ? 1 : 0, id]);
        detail = b.on ? 'beheerder gemaakt' : 'beheerrechten afgenomen';
      } else if (type === 'reset') {
        // alles terug naar het begin; de speler start bij het volgende openen opnieuw. Codes vrijgeven is optioneel.
        const [g] = await db.q('SELECT user_id FROM game_state WHERE user_id=?', [id]);
        const st = JSON.stringify({ __reset: Date.now() });
        if (g.length) await db.q("UPDATE game_state SET state=?, xp=0, networth=0, rankname='Rookie', day=1, rev=rev+1, sid=?, updated_at=updated_at WHERE user_id=?", [st, kickSid(), id]);
        if (b.codes) await db.q('DELETE FROM redemptions WHERE user_id=?', [id]);
        detail = 'account gereset' + (b.codes ? ', codes vrijgegeven' : '');
      } else if (type === 'flags') {
        // signalen afhandelen (blijven bewaard als 'afgehandeld'); een nieuwe melding opent ze weer
        await db.q('UPDATE player_flags SET resolved=1 WHERE user_id=? AND resolved=0', [id]);
        detail = 'signalen afgehandeld' + (b.note ? ': ' + String(b.note).slice(0, 200) : '');
      } else if (type === 'note') {
        const text = String(b.text || '').trim().slice(0, 300);
        if (!text) return res.status(400).json({ error: 'Schrijf wat je hebt gezien' });
        await db.q(`INSERT INTO player_flags(user_id,kind,detail,count,first_at,last_at,resolved) VALUES(?,?,?,1,NOW(),NOW(),0)
          ON DUPLICATE KEY UPDATE count=IF(resolved=1,1,count+1), first_at=IF(resolved=1,NOW(),first_at), detail=VALUES(detail), last_at=NOW(), resolved=0`, [id, 'notitie', text + ' (' + (req.user.u || 'beheer') + ')']);
        detail = 'signaal toegevoegd: ' + text;
      } else if (type === 'kick') {
        await kick(id); detail = 'uitgelogd op zijn apparaat';
      } else return res.status(400).json({ error: 'Onbekende actie' });
      log(req.user.id, id, type, detail);
      res.json({ ok: true, detail });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ error: e.message });
      console.error(e); res.status(500).json({ error: 'Actie mislukt' });
    }
  });

  return { isAdmin, ADMIN_USERS };
};
