// Databaselaag: MySQL-pool voor Railway. Leest de verbinding uit de omgevingsvariabelen.
const mysql = require('mysql2/promise');

let pool = null;
const state = { ready: false };

// Bouwt de verbindingsconfig uit Railway's variabelen (of losse DB_*-variabelen).
function config() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PRIVATE_URL || process.env.MYSQL_PUBLIC_URL;
  if (url) return url;
  const host = process.env.MYSQLHOST || process.env.DB_HOST;
  if (host) {
    return {
      host,
      port: +(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway'
    };
  }
  return null;
}

async function init() {
  const c = config();
  // Veilige diagnose: alleen namen, lengtes en de host, nooit wachtwoorden.
  const seen = Object.keys(process.env).filter(k => /MYSQL|DATABASE/.test(k));
  console.log('Database-variabelen:', seen.length ? seen.map(k => `${k}(${(process.env[k] || '').length} tekens)`).join(', ') : 'geen');
  if (process.env.MYSQLHOST) console.log('MySQL-host:', process.env.MYSQLHOST);
  if (seen.length && seen.every(k => !process.env[k])) console.warn('⚠  Alle database-variabelen zijn leeg. Controleer in Railway of de verwijzing ${{ MySQL.… }} naar de juiste servicenaam wijst.');
  if (!c) {
    console.warn('⚠  Geen MySQL-config gevonden. Zet in Railway bij de app-service de variabele MYSQL_URL = ${{ MySQL.MYSQL_URL }}. De site draait wel, maar inloggen werkt pas met database.');
    return;
  }
  const opts = typeof c === 'string'
    ? c
    : Object.assign({}, c, { waitForConnections: true, connectionLimit: 5, namedPlaceholders: false });
  pool = mysql.createPool(opts);
  for (let i = 1; i <= 10; i++) {
    try { await pool.query('SELECT 1'); break; }
    catch (e) { console.warn(`MySQL nog niet bereikbaar (poging ${i}/10): ${e.code || e.message}`); if (i === 10) throw e; await new Promise(r => setTimeout(r, 3000)); }
  }

  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(32) NOT NULL UNIQUE,
    display VARCHAR(32) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await pool.query(`CREATE TABLE IF NOT EXISTS game_state (
    user_id INT PRIMARY KEY,
    state LONGTEXT,
    xp INT DEFAULT 0,
    networth BIGINT DEFAULT 0,
    rankname VARCHAR(40) DEFAULT 'Rookie',
    day INT DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await pool.query(`CREATE TABLE IF NOT EXISTS redemptions (
    user_id INT NOT NULL,
    code VARCHAR(40) NOT NULL,
    amount INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, code),
    CONSTRAINT fk_red_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // één actief apparaat per account: sid = sessie van het apparaat dat als laatste het spel opende, rev = versie van de opslag
  // lidmaatschap (tier: NULL = oude VIP-code telt, 0 gewoon, 1 VIP, 2 High roller), beheerder en blokkade per account
  for (const sql of ['ALTER TABLE game_state ADD COLUMN rev INT NOT NULL DEFAULT 0', 'ALTER TABLE game_state ADD COLUMN sid VARCHAR(40) NULL',
    'ALTER TABLE users ADD COLUMN tier TINYINT NULL', 'ALTER TABLE users ADD COLUMN is_admin TINYINT NOT NULL DEFAULT 0',
    'ALTER TABLE users ADD COLUMN banned TINYINT NOT NULL DEFAULT 0', 'ALTER TABLE users ADD COLUMN ban_reason VARCHAR(200) NULL']) {
    try { await pool.query(sql); } catch (e) { if (e.code !== 'ER_DUP_FIELDNAME' && e.errno !== 1060) console.warn('Kolom toevoegen mislukt:', e.message); }
  }

  // signalen van mogelijk misbruik (autoclicker, onverklaarde sprongen): één regel per speler per soort
  await pool.query(`CREATE TABLE IF NOT EXISTS player_flags (
    user_id INT NOT NULL,
    kind VARCHAR(30) NOT NULL,
    detail VARCHAR(300) NULL,
    count INT NOT NULL DEFAULT 1,
    first_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, kind),
    CONSTRAINT fk_flag_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  // logboek van alles wat een beheerder aanpast
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    target_id INT NULL,
    action VARCHAR(40) NOT NULL,
    detail VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY k_target (target_id), KEY k_time (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  state.ready = true;
  console.log('✓ MySQL verbonden en tabellen klaar.');
}

function q(sql, params) {
  if (!pool) throw new Error('Database niet verbonden');
  return pool.query(sql, params);
}

module.exports = { init, q, state };
