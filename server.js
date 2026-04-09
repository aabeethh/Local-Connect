const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = require('./database/db');
const SECRET = 'localconnect_secret_2024';

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use(session({ secret: SECRET, resave: false, saveUninitialized: false }));

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.session.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ========== AUTH ROUTES ==========
app.post('/api/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (name, email, password, phone, role) VALUES (?,?,?,?,?)`,
    [name, email, hashed, phone || '', 'tourist'],
    function(err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id: this.lastID, role: 'tourist', name, email }, SECRET, { expiresIn: '7d' });
      res.json({ token, role: 'tourist', name, id: this.lastID });
    });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, name: user.name, id: user.id });
  });
});

// ========== USER PROFILE ==========
app.get('/api/me', auth, (req, res) => {
  db.get(`SELECT u.id, u.name, u.email, u.role, u.phone, u.address, u.profile_image, u.bio, u.created_at,
    g.district, g.languages, g.experience_years, g.specialization, g.rating, g.total_tours
    FROM users u
    LEFT JOIN guide_profiles g ON u.id = g.user_id
    WHERE u.id = ?`,
    [req.user.id], (err, user) => {
      if (!user) return res.status(404).json({ error: 'Not found' });
      res.json(user);
    });
});

app.put('/api/tourist/profile', auth, upload.single('profile_image'), (req, res) => {
  const { name, phone, address, bio, dob, nationality, emergency_contact, interests } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const uid = req.user.id;
  const imgSql = image ? ', profile_image = ?' : '';
  const imgVal = image ? [name, phone, address, bio, image, uid] : [name, phone, address, bio, uid];
  db.run(`UPDATE users SET name=?, phone=?, address=?, bio=?${imgSql} WHERE id=?`, imgVal);
  db.run(
    `INSERT INTO tourist_profiles (user_id, dob, nationality, emergency_contact, interests, profile_complete)
     VALUES (?,?,?,?,?,1)
     ON DUPLICATE KEY UPDATE
       dob=VALUES(dob), nationality=VALUES(nationality),
       emergency_contact=VALUES(emergency_contact), interests=VALUES(interests),
       profile_complete=1`,
    [uid, dob, nationality, emergency_contact, interests],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      // Return the new profile_image path so the client can update the sidebar avatar immediately
      res.json({ success: true, profile_image: image });
    }
  );
});

app.put('/api/guide/profile', auth, upload.single('profile_image'), (req, res) => {
  const { name, phone, address, bio, district, languages, experience_years, specialization } = req.body;
  const image = req.file ? '/uploads/' + req.file.filename : null;
  const uid = req.user.id;
  const imgSql = image ? ', profile_image = ?' : '';
  const imgVal = image ? [name, phone, address, bio, image, uid] : [name, phone, address, bio, uid];
  db.run(`UPDATE users SET name=?, phone=?, address=?, bio=?${imgSql} WHERE id=?`, imgVal);
  db.run(
    `INSERT INTO guide_profiles (user_id, district, languages, experience_years, specialization, bio, profile_complete)
     VALUES (?,?,?,?,?,?,1)
     ON DUPLICATE KEY UPDATE
       district=VALUES(district), languages=VALUES(languages),
       experience_years=VALUES(experience_years), specialization=VALUES(specialization),
       bio=VALUES(bio), profile_complete=1`,
    [uid, district, languages, experience_years, specialization, bio],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      // Return the new profile_image path so the client can update the sidebar avatar immediately
      res.json({ success: true, profile_image: image });
    }
  );
});

// ========== PLACES ==========
app.get('/api/places', (req, res) => {
  const { district } = req.query;
  const sql = district ? `SELECT * FROM places WHERE district LIKE ?` : `SELECT * FROM places`;
  const params = district ? [`%${district}%`] : [];
  db.all(sql, params, (err, rows) => res.json(rows || []));
});

// ========== GUIDES ==========
app.get('/api/guides', (req, res) => {
  const { district } = req.query;
  const sql = `SELECT u.id, u.name, u.email, u.profile_image, u.bio,
    g.district, g.languages, g.experience_years, g.specialization, g.rating, g.total_tours
    FROM users u JOIN guide_profiles g ON u.id = g.user_id
    WHERE u.role = 'guide' AND g.profile_complete = 1 ${district ? 'AND g.district LIKE ?' : ''}`;
  const params = district ? [`%${district}%`] : [];
  db.all(sql, params, (err, rows) => res.json(rows || []));
});

app.get('/api/guides/:id/packages', (req, res) => {
  db.all(`SELECT * FROM guide_packages WHERE guide_id = ?`, [req.params.id], (err, rows) => res.json(rows || []));
});

app.post('/api/guide/packages', auth, (req, res) => {
  const { title, description, duration, price, max_people, includes } = req.body;
  db.run(`INSERT INTO guide_packages (guide_id, title, description, duration, price, max_people, includes)
    VALUES (?,?,?,?,?,?,?)`, [req.user.id, title, description, duration, price, max_people, includes], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.delete('/api/guide/packages/:id', auth, (req, res) => {
  db.run(`DELETE FROM guide_packages WHERE id=? AND guide_id=?`, [req.params.id, req.user.id], (err) => {
    res.json({ success: !err });
  });
});

// ========== BOOKINGS ==========
app.post('/api/bookings', auth, (req, res) => {
  const { guide_id, package_id, place_name, district, travel_date, num_people, total_amount, tourist_message } = req.body;
  db.run(`INSERT INTO bookings (tourist_id, guide_id, package_id, place_name, district, travel_date, num_people, total_amount, tourist_message)
    VALUES (?,?,?,?,?,?,?,?,?)`,
    [req.user.id, guide_id, package_id, place_name, district, travel_date, num_people, total_amount, tourist_message],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.get('/api/tourist/bookings', auth, (req, res) => {
  db.all(`SELECT b.*, u.name as guide_name, u.profile_image as guide_image, gp.title as package_title
    FROM bookings b
    JOIN users u ON b.guide_id = u.id
    LEFT JOIN guide_packages gp ON b.package_id = gp.id
    WHERE b.tourist_id = ? ORDER BY b.created_at DESC`, [req.user.id], (err, rows) => res.json(rows || []));
});

app.get('/api/guide/bookings', auth, (req, res) => {
  db.all(`SELECT b.*, u.name as tourist_name, u.email as tourist_email, u.phone as tourist_phone,
    u.profile_image as tourist_image, gp.title as package_title
    FROM bookings b
    JOIN users u ON b.tourist_id = u.id
    LEFT JOIN guide_packages gp ON b.package_id = gp.id
    WHERE b.guide_id = ? ORDER BY b.created_at DESC`, [req.user.id], (err, rows) => res.json(rows || []));
});

app.put('/api/guide/bookings/:id', auth, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE bookings SET status=? WHERE id=? AND guide_id=?`, [status, req.params.id, req.user.id], (err) => {
    res.json({ success: !err });
  });
});

// ========== PAYMENTS ==========
app.post('/api/payments', auth, (req, res) => {
  const { booking_id, amount, payment_method } = req.body;
  const txn = 'TXN' + Date.now();
  db.get(`SELECT * FROM bookings WHERE id=? AND tourist_id=? AND status='accepted'`, [booking_id, req.user.id], (err, booking) => {
    if (!booking) return res.status(400).json({ error: 'Booking not found or not accepted' });
    db.run(`INSERT INTO payments (booking_id, tourist_id, guide_id, amount, payment_method, transaction_id)
      VALUES (?,?,?,?,?,?)`, [booking_id, req.user.id, booking.guide_id, amount, payment_method, txn]);
    db.run(`UPDATE bookings SET payment_status='paid' WHERE id=?`, [booking_id]);
    // Record visit
    db.run(`INSERT INTO tourist_visits (tourist_id, place_name, district) VALUES (?,?,?)`,
      [req.user.id, booking.place_name, booking.district]);
    res.json({ success: true, transaction_id: txn });
  });
});

// ========== GUIDE APPLICATION ==========
app.post('/api/guide-application', auth, (req, res) => {
  const { full_name, email, phone, district, experience, languages, about } = req.body;
  db.get(`SELECT * FROM guide_applications WHERE user_id=?`, [req.user.id], (err, existing) => {
    if (existing) return res.status(400).json({ error: 'Application already submitted' });
    db.run(`INSERT INTO guide_applications (user_id, full_name, email, phone, district, experience, languages, about)
      VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.id, full_name, email, phone, district, experience, languages, about], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      });
  });
});

app.get('/api/guide-application/status', auth, (req, res) => {
  db.get(`SELECT * FROM guide_applications WHERE user_id=?`, [req.user.id], (err, row) => res.json(row || null));
});

// ========== TOURIST DASHBOARD ==========
app.get('/api/tourist/visits', auth, (req, res) => {
  db.all(`SELECT * FROM tourist_visits WHERE tourist_id=? ORDER BY visited_at DESC LIMIT 5`, [req.user.id], (err, rows) => res.json(rows || []));
});

app.get('/api/tourist/profile', auth, (req, res) => {
  db.get(`SELECT * FROM tourist_profiles WHERE user_id=?`, [req.user.id], (err, row) => res.json(row || null));
});

// ========== GUIDE REVENUE ==========
app.get('/api/guide/revenue', auth, (req, res) => {
  db.all(`SELECT p.*, b.place_name, b.travel_date, u.name as tourist_name
    FROM payments p JOIN bookings b ON p.booking_id = b.id JOIN users u ON p.tourist_id = u.id
    WHERE p.guide_id = ? ORDER BY p.paid_at DESC`, [req.user.id], (err, rows) => {
    const total = (rows || []).reduce((s, r) => s + r.amount, 0);
    res.json({ payments: rows || [], total });
  });
});

// ========== GUIDE DASHBOARD ==========
app.get('/api/guide/profile-status', auth, (req, res) => {
  db.get(`SELECT profile_complete FROM guide_profiles WHERE user_id=?`, [req.user.id], (err, row) => {
    res.json({ complete: row ? row.profile_complete : 0 });
  });
});

// ========== ADMIN ==========
app.get('/api/admin/stats', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.get(`SELECT COUNT(*) as total FROM users WHERE role='tourist'`, [], (err, t) => {
    db.get(`SELECT COUNT(*) as total FROM users WHERE role='guide'`, [], (err2, g) => {
      db.get(`SELECT COUNT(*) as total FROM bookings`, [], (err3, b) => {
        db.get(`SELECT COUNT(*) as total FROM guide_applications WHERE status='pending'`, [], (err4, a) => {
          db.get(`SELECT SUM(amount) as total FROM payments`, [], (err5, p) => {
            res.json({
              tourists: t?.total || 0,
              guides: g?.total || 0,
              bookings: b?.total || 0,
              pending_applications: a?.total || 0,
              revenue: p?.total || 0
            });
          });
        });
      });
    });
  });
});

app.get('/api/admin/users', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.all(`SELECT id, name, email, role, phone, created_at FROM users WHERE role != 'admin'`, [], (err, rows) => res.json(rows || []));
});

app.get('/api/admin/applications', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.all(`SELECT ga.*, u.name as user_name FROM guide_applications ga JOIN users u ON ga.user_id = u.id ORDER BY ga.applied_at DESC`, [], (err, rows) => res.json(rows || []));
});

app.put('/api/admin/applications/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  db.get(`SELECT * FROM guide_applications WHERE id=?`, [req.params.id], (err, app) => {
    if (!app) return res.status(404).json({ error: 'Not found' });
    db.run(`UPDATE guide_applications SET status=?, reviewed_at=CURRENT_TIMESTAMP WHERE id=?`, [status, req.params.id]);
    if (status === 'approved') {
      db.run(`UPDATE users SET role='guide' WHERE id=?`, [app.user_id]);
      db.run(`INSERT IGNORE INTO guide_profiles (user_id, district, languages, experience_years, profile_complete)
        VALUES (?,?,?,?,0)`, [app.user_id, app.district, app.languages, 0]);
    }
    res.json({ success: true });
  });
});

app.get('/api/admin/guides', auth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.all(`SELECT u.id, u.name, u.email, u.phone, gp.district, gp.rating, gp.total_tours
    FROM users u JOIN guide_profiles gp ON u.id = gp.user_id WHERE u.role='guide'`, [], (err, rows) => res.json(rows || []));
});

// Serve main page
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(3000, () => console.log('LocalConnect running on http://localhost:3000'));