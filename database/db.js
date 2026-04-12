const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'aabeethh',
  database: process.env.MYSQL_DATABASE || 'localconnect',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z'
};

const pool = mysql.createPool(config);

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await connection.end();

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'tourist',
      phone VARCHAR(50),
      address VARCHAR(255),
      profile_image VARCHAR(255),
      bio TEXT,
      linked_tourist_id INT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (linked_tourist_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS tourist_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      dob VARCHAR(100),
      nationality VARCHAR(100),
      emergency_contact VARCHAR(255),
      interests TEXT,
      profile_complete TINYINT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS guide_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT UNIQUE,
      district VARCHAR(255),
      languages VARCHAR(255),
      experience_years INT,
      specialization VARCHAR(255),
      bio TEXT,
      profile_complete TINYINT DEFAULT 0,
      rating DECIMAL(3,2) DEFAULT 0,
      total_tours INT DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS guide_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guide_id INT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      duration VARCHAR(100),
      price DECIMAL(10,2),
      max_people INT,
      includes TEXT,
      FOREIGN KEY (guide_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS places (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      district VARCHAR(255) NOT NULL,
      description TEXT,
      image VARCHAR(255),
      category VARCHAR(100),
      rating DECIMAL(3,2) DEFAULT 4.5
    )`,
    `CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tourist_id INT,
      guide_id INT,
      package_id INT,
      place_name VARCHAR(255),
      district VARCHAR(255),
      travel_date VARCHAR(100),
      num_people INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'pending',
      total_amount DECIMAL(10,2),
      payment_status VARCHAR(50) DEFAULT 'unpaid',
      tourist_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (guide_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES guide_packages(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS tourist_visits (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tourist_id INT,
      place_name VARCHAR(255),
      district VARCHAR(255),
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS guide_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      full_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      district VARCHAR(255),
      experience TEXT,
      languages VARCHAR(255),
      about TEXT,
      guide_email VARCHAR(255),
      guide_password_hash VARCHAR(255),
      approved_guide_user_id INT,
      status VARCHAR(50) DEFAULT 'pending',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (approved_guide_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT,
      tourist_id INT,
      guide_id INT,
      amount DECIMAL(10,2),
      payment_method VARCHAR(100),
      transaction_id VARCHAR(255),
      paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      FOREIGN KEY (tourist_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (guide_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const sql of statements) {
    await pool.execute(sql);
  }

  async function addColumnIfMissing(table, column, definition) {
    const [rows] = await pool.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [config.database, table, column]
    );
    if (rows.length === 0) {
      await pool.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  }

  await addColumnIfMissing('users', 'linked_tourist_id', 'INT');
  await addColumnIfMissing('guide_applications', 'guide_email', 'VARCHAR(255)');
  await addColumnIfMissing('guide_applications', 'guide_password_hash', 'VARCHAR(255)');
  await addColumnIfMissing('guide_applications', 'approved_guide_user_id', 'INT');

  const [adminRows] = await pool.execute(`SELECT id FROM users WHERE email = ?`, ['admin@localconnect.com']);
  if (adminRows.length === 0) {
    const adminPass = bcrypt.hashSync('admin123', 10);
    await pool.execute(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@localconnect.com', adminPass, 'admin']
    );
  }

  const [existingPlaces] = await pool.execute(`SELECT COUNT(*) as count FROM places`);
  
  if (existingPlaces[0].count === 0) {
    const places = [
      ['Munnar', 'Idukki', 'Famous hill station with tea gardens and misty valleys', 'munnar.jpg', 'Nature', 4.8],
      ['Alleppey Backwaters', 'Alappuzha', 'Iconic houseboat experience through lush backwaters', 'alleppey.jpg', 'Backwater', 4.9],
      ['Wayanad Wildlife Sanctuary', 'Wayanad', 'Rich biodiversity with elephants, tigers and lush forests', 'wayanad.jpg', 'Wildlife', 4.7],
      ['Fort Kochi', 'Ernakulam', 'Historic port city with colonial architecture and Chinese nets', 'kochi.jpg', 'Heritage', 4.6],
      ['Thekkady', 'Idukki', 'Periyar Tiger Reserve and spice plantations', 'thekkady.jpg', 'Wildlife', 4.7],
      ['Kovalam Beach', 'Thiruvananthapuram', 'Crescent-shaped beach with lighthouse and Ayurveda resorts', 'kovalam.jpg', 'Beach', 4.5],
      ['Varkala Cliff', 'Thiruvananthapuram', 'Stunning red cliff beach with natural springs', 'varkala.jpg', 'Beach', 4.6],
      ['Athirapally Falls', 'Thrissur', 'Majestic waterfall called the Niagara of India', 'athirapally.jpg', 'Nature', 4.8],
      ['Bekal Fort', 'Kasaragod', 'Largest fort in Kerala standing on a promontory over the sea', 'bekal.jpg', 'Heritage', 4.5],
      ['Kumarakom', 'Kottayam', 'Bird sanctuary and backwater village on Vembanad Lake', 'kumarakom.jpg', 'Backwater', 4.6],
      ['Vagamon', 'Idukki', 'Serene meadows and pine forests in the Western Ghats', 'vagamon.jpg', 'Nature', 4.7],
      ['Thrissur Pooram', 'Thrissur', 'Iconic temple festival known as the festival of festivals', 'thrissur.jpg', 'Culture', 4.9]
    ];

    for (const place of places) {
      await pool.execute(
        `INSERT INTO places (name, district, description, image, category, rating) VALUES (?, ?, ?, ?, ?, ?)`,
        place
      );
    }
  }
}

async function run(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return { lastID: result.insertId || 0, changes: result.affectedRows || 0 };
}

async function get(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

async function all(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows || [];
}

module.exports = {
  initDatabase,
  run,
  get,
  all
};
