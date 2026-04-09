// database/db.js  –  MySQL version (mysql2)
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

// ─── 1. CONNECTION POOL ───────────────────────────────────────────────────────
// Edit these values to match your MySQL server.
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || 'aabeethh',          // ← your MySQL root password
  database: process.env.DB_NAME     || 'localconnect',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// ─── 2. PROMISIFY HELPERS ─────────────────────────────────────────────────────
// The rest of server.js uses the SQLite callback style: db.run / db.get / db.all
// These wrappers reproduce that same API so server.js needs zero changes.

const db = {
  // Executes INSERT / UPDATE / DELETE.
  // Calls back with (err, result) – result has .lastID and .changes like SQLite.
  run(sql, params = [], cb) {
    if (typeof params === 'function') { cb = params; params = []; }
    pool.execute(sql, params, (err, result) => {
      if (err) { if (cb) cb(err); return; }
      // Mimic SQLite's `this` context inside the callback
      const ctx = { lastID: result.insertId, changes: result.affectedRows };
      if (cb) cb.call(ctx, null);
    });
  },

  // Returns the first matching row (or undefined).
  get(sql, params = [], cb) {
    if (typeof params === 'function') { cb = params; params = []; }
    pool.execute(sql, params, (err, rows) => {
      if (cb) cb(err, rows && rows[0]);
    });
  },

  // Returns all matching rows as an array.
  all(sql, params = [], cb) {
    if (typeof params === 'function') { cb = params; params = []; }
    pool.execute(sql, params, (err, rows) => {
      if (cb) cb(err, rows || []);
    });
  },

  // Runs a block of SQL statements in sequence (used for schema setup).
  serialize(fn) { fn(); },

  // Prepared-statement shim – returns an object with .run() and .finalize().
  prepare(sql) {
    return {
      run(params) {
        pool.execute(sql, params, (err) => {
          if (err) console.error('Prepared statement error:', err);
        });
      },
      finalize() { /* no-op for MySQL */ },
    };
  },
};

// ─── 3. SCHEMA ────────────────────────────────────────────────────────────────
// MySQL differences from SQLite:
//   • AUTO_INCREMENT  instead of AUTOINCREMENT
//   • TEXT / VARCHAR  lengths are required for indexed/unique columns
//   • TINYINT(1)      instead of INTEGER for booleans
//   • NOW()           instead of CURRENT_TIMESTAMP for default values
//     (CURRENT_TIMESTAMP still works in MySQL 8 – kept for compatibility)

db.serialize(() => {

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  DEFAULT 'tourist',
    phone         VARCHAR(50),
    address       TEXT,
    profile_image TEXT,
    bio           TEXT,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tourist_profiles (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNIQUE,
    dob               TEXT,
    nationality       VARCHAR(100),
    emergency_contact VARCHAR(255),
    interests         TEXT,
    profile_complete  TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS guide_profiles (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNIQUE,
    district         VARCHAR(100),
    languages        TEXT,
    experience_years INT,
    specialization   TEXT,
    bio              TEXT,
    profile_complete TINYINT(1) DEFAULT 0,
    rating           DECIMAL(3,2) DEFAULT 0,
    total_tours      INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS guide_packages (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    guide_id    INT,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    duration    VARCHAR(100),
    price       DECIMAL(10,2),
    max_people  INT,
    includes    TEXT,
    FOREIGN KEY (guide_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS places (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    district    VARCHAR(100) NOT NULL,
    description TEXT,
    image       VARCHAR(255),
    category    VARCHAR(100),
    rating      DECIMAL(3,2) DEFAULT 4.5
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    tourist_id     INT,
    guide_id       INT,
    package_id     INT,
    place_name     VARCHAR(255),
    district       VARCHAR(100),
    travel_date    TEXT,
    num_people     INT         DEFAULT 1,
    status         VARCHAR(50) DEFAULT 'pending',
    total_amount   DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    tourist_message TEXT,
    created_at     DATETIME    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_id) REFERENCES users(id),
    FOREIGN KEY (guide_id)   REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS tourist_visits (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    tourist_id INT,
    place_name VARCHAR(255),
    district   VARCHAR(100),
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tourist_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS guide_applications (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    full_name   VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    district    VARCHAR(100),
    experience  TEXT,
    languages   TEXT,
    about       TEXT,
    id_proof    VARCHAR(255),
    status      VARCHAR(50) DEFAULT 'pending',
    applied_at  DATETIME    DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    booking_id     INT,
    tourist_id     INT,
    guide_id       INT,
    amount         DECIMAL(10,2),
    payment_method VARCHAR(100),
    transaction_id VARCHAR(100),
    paid_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
  )`);

  // ── Seed admin user (INSERT IGNORE = skip if email already exists) ──────────
  const adminPass = bcrypt.hashSync('admin123', 10);
  db.run(
    `INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    ['Admin', 'admin@localconnect.com', adminPass, 'admin']
  );

  // ── Seed Kerala places ────────────────────────────────────────────────────────
  const places = [
    ['Munnar',                'Idukki',              'Famous hill station with tea gardens and misty valleys',               'munnar.jpg',    'Nature',   4.8],
    ['Alleppey Backwaters',   'Alappuzha',           'Iconic houseboat experience through lush backwaters',                  'alleppey.jpg',  'Backwater',4.9],
    ['Wayanad Wildlife Sanctuary','Wayanad',         'Rich biodiversity with elephants, tigers and lush forests',            'wayanad.jpg',   'Wildlife', 4.7],
    ['Fort Kochi',            'Ernakulam',           'Historic port city with colonial architecture and Chinese nets',       'kochi.jpg',     'Heritage', 4.6],
    ['Thekkady',              'Idukki',              'Periyar Tiger Reserve and spice plantations',                          'thekkady.jpg',  'Wildlife', 4.7],
    ['Kovalam Beach',         'Thiruvananthapuram',  'Crescent-shaped beach with lighthouse and Ayurveda resorts',           'kovalam.jpg',   'Beach',    4.5],
    ['Varkala Cliff',         'Thiruvananthapuram',  'Stunning red cliff beach with natural springs',                        'varkala.jpg',   'Beach',    4.6],
    ['Athirapally Falls',     'Thrissur',            'Majestic waterfall called the Niagara of India',                       'athirapally.jpg','Nature',  4.8],
    ['Bekal Fort',            'Kasaragod',           'Largest fort in Kerala standing on a promontory over the sea',         'bekal.jpg',     'Heritage', 4.5],
    ['Kumarakom',             'Kottayam',            'Bird sanctuary and backwater village on Vembanad Lake',                'kumarakom.jpg', 'Backwater',4.6],
    ['Vagamon',               'Idukki',              'Serene meadows and pine forests in the Western Ghats',                 'vagamon.jpg',   'Nature',   4.7],
    ['Thrissur Pooram',       'Thrissur',            'Iconic temple festival known as the festival of festivals',            'thrissur.jpg',  'Culture',  4.9],
  ];

  const stmt = db.prepare(
    `INSERT IGNORE INTO places (name, district, description, image, category, rating) VALUES (?,?,?,?,?,?)`
  );
  places.forEach(p => stmt.run(p));
  stmt.finalize();
});

module.exports = db;