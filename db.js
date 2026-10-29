// Databaselaag: MySQL-pool voor Railway. Leest de verbinding uit de omgevingsvariabelen.
const mysql = require('mysql2/promise');

let pool = null;
const state = { ready: false };

// Bouwt de verbindingsconfig uit Railway's variabelen (of losse DB_*-variabelen).
function config() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQL_PUBLIC_URL;
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
  if (!c) {
    console.warn('⚠  Geen MySQL-config gevonden. Zet in Railway bij de app-service de variabele MYSQL_URL = ${{ MySQL.MYSQL_URL }}. De site draait wel, maar inloggen werkt pas met database.');
    return;
  }
  const opts = typeof c === 'string'
    ? c
    : Object.assign({}, c, { waitForConnections: true, connectionLimit: 5, namedPlaceholders: false });
  pool = mysql.createPool(opts);

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

  state.ready = true;
  console.log('✓ MySQL verbonden en tabellen klaar.');
}

function q(sql, params) {
  if (!pool) throw new Error('Database niet verbonden');
  return pool.query(sql, params);
}

module.exports = { init, q, state };
