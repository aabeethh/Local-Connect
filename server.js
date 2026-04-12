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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: SECRET, resave: false, saveUninitialized: false }));

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.session.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

async function dbRun(sql, params = []) {
  return db.run(sql, params);
}

async function dbGet(sql, params = []) {
  return db.get(sql, params);
}

async function dbAll(sql, params = []) {
  return db.all(sql, params);
}

function signUser(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: '7d' }
  );
}

async function loadUserWithProfile(id) {
  const user = await dbGet(
    `SELECT id, name, email, role, phone, address, profile_image, bio, linked_tourist_id, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );
  if (!user) return null;

  if (user.role === 'guide') {
    const guide = await dbGet(
      `SELECT district, languages, experience_years, specialization, bio as guide_bio, rating, total_tours, profile_complete
       FROM guide_profiles
       WHERE user_id = ?`,
      [id]
    );
    return { ...user, ...(guide || {}), bio: guide?.guide_bio || user.bio };
  }

  const tourist = await dbGet(
    `SELECT dob, nationality, emergency_contact, interests, profile_complete
     FROM tourist_profiles
     WHERE user_id = ?`,
    [id]
  );
  return { ...user, ...(tourist || {}) };
}

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = await dbGet(`SELECT id FROM users WHERE email = ?`, [email.trim().toLowerCase()]);
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = bcrypt.hashSync(password, 10);
    const result = await dbRun(
      `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'tourist')`,
      [name.trim(), email.trim().toLowerCase(), hashed, phone?.trim() || '']
    );

    const user = { id: result.lastID, name: name.trim(), email: email.trim().toLowerCase(), role: 'tourist' };
    res.json({ token: signUser(user), role: user.role, name: user.name, id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email?.trim().toLowerCase()]);
    if (!user || !bcrypt.compareSync(password || '', user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ token: signUser(user), role: user.role, name: user.name, id: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', auth, async (req, res) => {
  try {
    const user = await loadUserWithProfile(req.user.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tourist/profile', auth, requireRole('tourist'), upload.single('profile_image'), async (req, res) => {
  try {
    const { name, phone, address, bio, dob, nationality, emergency_contact, interests } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const uid = req.user.id;

    if (image) {
      await dbRun(
        `UPDATE users SET name = ?, phone = ?, address = ?, bio = ?, profile_image = ? WHERE id = ?`,
        [name || '', phone || '', address || '', bio || '', image, uid]
      );
    } else {
      await dbRun(
        `UPDATE users SET name = ?, phone = ?, address = ?, bio = ? WHERE id = ?`,
        [name || '', phone || '', address || '', bio || '', uid]
      );
    }

    const existing = await dbGet(`SELECT id FROM tourist_profiles WHERE user_id = ?`, [uid]);
    if (existing) {
      await dbRun(
        `UPDATE tourist_profiles
         SET dob = ?, nationality = ?, emergency_contact = ?, interests = ?, profile_complete = 1
         WHERE user_id = ?`,
        [dob || '', nationality || '', emergency_contact || '', interests || '', uid]
      );
    } else {
      await dbRun(
        `INSERT INTO tourist_profiles (user_id, dob, nationality, emergency_contact, interests, profile_complete)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [uid, dob || '', nationality || '', emergency_contact || '', interests || '']
      );
    }

    res.json({ success: true, profile_image: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/guide/profile', auth, requireRole('guide'), upload.single('profile_image'), async (req, res) => {
  try {
    const { name, phone, address, bio, district, languages, experience_years, specialization } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const uid = req.user.id;

    if (image) {
      await dbRun(
        `UPDATE users SET name = ?, phone = ?, address = ?, bio = ?, profile_image = ? WHERE id = ?`,
        [name || '', phone || '', address || '', bio || '', image, uid]
      );
    } else {
      await dbRun(
        `UPDATE users SET name = ?, phone = ?, address = ?, bio = ? WHERE id = ?`,
        [name || '', phone || '', address || '', bio || '', uid]
      );
    }

    const existing = await dbGet(`SELECT id FROM guide_profiles WHERE user_id = ?`, [uid]);
    if (existing) {
      await dbRun(
        `UPDATE guide_profiles
         SET district = ?, languages = ?, experience_years = ?, specialization = ?, bio = ?, profile_complete = 1
         WHERE user_id = ?`,
        [district || '', languages || '', parseInt(experience_years, 10) || 0, specialization || '', bio || '', uid]
      );
    } else {
      await dbRun(
        `INSERT INTO guide_profiles (user_id, district, languages, experience_years, specialization, bio, profile_complete)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [uid, district || '', languages || '', parseInt(experience_years, 10) || 0, specialization || '', bio || '']
      );
    }

    res.json({ success: true, profile_image: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/places', async (req, res) => {
  try {
    const { district } = req.query;
    const rows = district
      ? await dbAll(`SELECT * FROM places WHERE district LIKE ? ORDER BY name`, [`%${district}%`])
      : await dbAll(`SELECT * FROM places ORDER BY name`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guides', async (req, res) => {
  try {
    const { district } = req.query;
    const rows = await dbAll(
      `SELECT u.id, u.name, u.email, u.profile_image, u.bio,
              g.district, g.languages, g.experience_years, g.specialization, g.rating, g.total_tours
       FROM users u
       JOIN guide_profiles g ON u.id = g.user_id
       WHERE u.role = 'guide'
         ${district ? 'AND g.district LIKE ?' : ''}
       ORDER BY u.name`,
      district ? [`%${district}%`] : []
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guides/:id/packages', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM guide_packages WHERE guide_id = ? ORDER BY id DESC`, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/guide/packages', auth, requireRole('guide'), async (req, res) => {
  try {
    const { title, description, duration, price, max_people, includes } = req.body;
    const result = await dbRun(
      `INSERT INTO guide_packages (guide_id, title, description, duration, price, max_people, includes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title || '',
        description || '',
        duration || '',
        parseFloat(price) || 0,
        parseInt(max_people, 10) || 0,
        includes || ''
      ]
    );
    res.json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/guide/packages/:id', auth, requireRole('guide'), async (req, res) => {
  try {
    await dbRun(`DELETE FROM guide_packages WHERE id = ? AND guide_id = ?`, [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', auth, requireRole('tourist'), async (req, res) => {
  try {
    const { guide_id, package_id, place_name, district, travel_date, num_people, total_amount, tourist_message } = req.body;
    const result = await dbRun(
      `INSERT INTO bookings (tourist_id, guide_id, package_id, place_name, district, travel_date, num_people, total_amount, tourist_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        guide_id,
        package_id,
        place_name || '',
        district || '',
        travel_date || '',
        parseInt(num_people, 10) || 1,
        parseFloat(total_amount) || 0,
        tourist_message || ''
      ]
    );
    res.json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tourist/bookings', auth, requireRole('tourist'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT b.*, u.name as guide_name, u.profile_image as guide_image, gp.title as package_title
       FROM bookings b
       JOIN users u ON b.guide_id = u.id
       LEFT JOIN guide_packages gp ON b.package_id = gp.id
       WHERE b.tourist_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guide/bookings', auth, requireRole('guide'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT b.*, u.name as tourist_name, u.email as tourist_email, u.phone as tourist_phone,
              u.profile_image as tourist_image, gp.title as package_title
       FROM bookings b
       JOIN users u ON b.tourist_id = u.id
       LEFT JOIN guide_packages gp ON b.package_id = gp.id
       WHERE b.guide_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/guide/bookings/:id', auth, requireRole('guide'), async (req, res) => {
  try {
    const { status } = req.body;
    await dbRun(`UPDATE bookings SET status = ? WHERE id = ? AND guide_id = ?`, [status, req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments', auth, requireRole('tourist'), async (req, res) => {
  try {
    const { booking_id, amount, payment_method } = req.body;
    const booking = await dbGet(
      `SELECT * FROM bookings WHERE id = ? AND tourist_id = ? AND status = 'accepted'`,
      [booking_id, req.user.id]
    );

    if (!booking) {
      return res.status(400).json({ error: 'Booking not found or not accepted' });
    }

    const txn = `TXN${Date.now()}`;
    await dbRun(
      `INSERT INTO payments (booking_id, tourist_id, guide_id, amount, payment_method, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, req.user.id, booking.guide_id, parseFloat(amount) || 0, payment_method || 'UPI', txn]
    );
    await dbRun(`UPDATE bookings SET payment_status = 'paid' WHERE id = ?`, [booking_id]);
    await dbRun(
      `INSERT INTO tourist_visits (tourist_id, place_name, district) VALUES (?, ?, ?)`,
      [req.user.id, booking.place_name, booking.district]
    );
    await dbRun(
      `UPDATE guide_profiles SET total_tours = COALESCE(total_tours, 0) + 1 WHERE user_id = ?`,
      [booking.guide_id]
    );

    res.json({ success: true, transaction_id: txn });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/guide-application', auth, requireRole('tourist'), async (req, res) => {
  try {
    const { full_name, email, phone, district, experience, languages, about, guide_email, guide_password } = req.body;
    if (!full_name || !phone || !district || !guide_email || !guide_password) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }
    if (guide_password.length < 6) {
      return res.status(400).json({ error: 'Guide password must be at least 6 characters' });
    }

    const desiredGuideEmail = guide_email.trim().toLowerCase();
    const existingGuideUser = await dbGet(`SELECT id FROM users WHERE email = ?`, [desiredGuideEmail]);
    if (existingGuideUser) {
      return res.status(400).json({ error: 'Guide login email already exists' });
    }

    const conflictingApplication = await dbGet(
      `SELECT id FROM guide_applications
       WHERE guide_email = ?
         AND user_id != ?
         AND status IN ('pending', 'approved')`,
      [desiredGuideEmail, req.user.id]
    );
    if (conflictingApplication) {
      return res.status(400).json({ error: 'Guide login email is already used in another application' });
    }

    const existing = await dbGet(`SELECT * FROM guide_applications WHERE user_id = ?`, [req.user.id]);
    const passwordHash = bcrypt.hashSync(guide_password, 10);

    if (existing?.status === 'approved') {
      return res.status(400).json({ error: 'Guide account already approved for this tourist profile' });
    }

    if (existing?.status === 'pending') {
      return res.status(400).json({ error: 'Application already submitted and waiting for review' });
    }

    if (existing?.status === 'rejected') {
      await dbRun(
        `UPDATE guide_applications
         SET full_name = ?, email = ?, phone = ?, district = ?, experience = ?, languages = ?, about = ?,
             guide_email = ?, guide_password_hash = ?, status = 'pending', applied_at = CURRENT_TIMESTAMP,
             reviewed_at = NULL, approved_guide_user_id = NULL
         WHERE id = ?`,
        [
          full_name,
          email,
          phone,
          district,
          experience || '',
          languages || '',
          about || '',
          desiredGuideEmail,
          passwordHash,
          existing.id
        ]
      );
      return res.json({ id: existing.id, message: 'Application resubmitted' });
    }

    const result = await dbRun(
      `INSERT INTO guide_applications
       (user_id, full_name, email, phone, district, experience, languages, about, guide_email, guide_password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        full_name,
        email,
        phone,
        district,
        experience || '',
        languages || '',
        about || '',
        desiredGuideEmail,
        passwordHash
      ]
    );

    res.json({ id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guide-application/status', auth, requireRole('tourist'), async (req, res) => {
  try {
    const row = await dbGet(
      `SELECT ga.*, gu.name as approved_guide_name, gu.email as approved_guide_email
       FROM guide_applications ga
       LEFT JOIN users gu ON ga.approved_guide_user_id = gu.id
       WHERE ga.user_id = ?`,
      [req.user.id]
    );
    res.json(row || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tourist/visits', auth, requireRole('tourist'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT * FROM tourist_visits WHERE tourist_id = ? ORDER BY visited_at DESC LIMIT 5`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tourist/profile', auth, requireRole('tourist'), async (req, res) => {
  try {
    const row = await dbGet(`SELECT * FROM tourist_profiles WHERE user_id = ?`, [req.user.id]);
    res.json(row || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guide/revenue', auth, requireRole('guide'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT p.*, b.place_name, b.travel_date, u.name as tourist_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN users u ON p.tourist_id = u.id
       WHERE p.guide_id = ?
       ORDER BY p.paid_at DESC`,
      [req.user.id]
    );
    const total = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
    res.json({ payments: rows, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/guide/profile-status', auth, requireRole('guide'), async (req, res) => {
  try {
    const row = await dbGet(`SELECT profile_complete FROM guide_profiles WHERE user_id = ?`, [req.user.id]);
    res.json({ complete: row ? row.profile_complete : 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const tourists = await dbGet(`SELECT COUNT(*) as total FROM users WHERE role = 'tourist'`);
    const guides = await dbGet(`SELECT COUNT(*) as total FROM users WHERE role = 'guide'`);
    const bookings = await dbGet(`SELECT COUNT(*) as total FROM bookings`);
    const apps = await dbGet(`SELECT COUNT(*) as total FROM guide_applications WHERE status = 'pending'`);
    const payments = await dbGet(`SELECT COALESCE(SUM(amount), 0) as total FROM payments`);

    res.json({
      tourists: tourists?.total || 0,
      guides: guides?.total || 0,
      bookings: bookings?.total || 0,
      pending_applications: apps?.total || 0,
      revenue: payments?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT id, name, email, role, phone, linked_tourist_id, created_at
       FROM users
       WHERE role != 'admin'
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/applications', auth, requireRole('admin'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT ga.*, u.name as tourist_name, u.email as tourist_email,
              gu.email as approved_guide_email_live
       FROM guide_applications ga
       JOIN users u ON ga.user_id = u.id
       LEFT JOIN users gu ON ga.approved_guide_user_id = gu.id
       ORDER BY ga.applied_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/applications/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const application = await dbGet(`SELECT * FROM guide_applications WHERE id = ?`, [req.params.id]);
    if (!application) return res.status(404).json({ error: 'Not found' });

    if (status === 'approved') {
      if (application.approved_guide_user_id) {
        await dbRun(
          `UPDATE guide_applications SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [req.params.id]
        );
        return res.json({ success: true });
      }

      // Check if the tourist (application.user_id) already has a guide account
      const existingGuideAccount = await dbGet(
        `SELECT id FROM users WHERE id = ? AND role = 'guide'`,
        [application.user_id]
      );

      if (existingGuideAccount) {
        // Tourist already has a guide account, just link it
        await dbRun(
          `UPDATE guide_applications
           SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, approved_guide_user_id = ?
           WHERE id = ?`,
          [application.user_id, req.params.id]
        );
        return res.json({ success: true });
      }

      // Check if required fields are present for creating a new guide account
      if (!application.guide_email || !application.guide_password_hash) {
        return res.status(400).json({ error: 'This application is missing guide login credentials. Please ask the applicant to re-submit their application.' });
      }

      const existingGuide = await dbGet(`SELECT id FROM users WHERE email = ?`, [application.guide_email]);
      if (existingGuide) {
        return res.status(400).json({ error: 'Guide login email already exists. Update the application and try again.' });
      }

      const guideUser = await dbRun(
        `INSERT INTO users (name, email, password, role, phone, linked_tourist_id)
         VALUES (?, ?, ?, 'guide', ?, ?)`,
        [
          application.full_name,
          application.guide_email,
          application.guide_password_hash,
          application.phone || '',
          application.user_id
        ]
      );

      await dbRun(
        `INSERT INTO guide_profiles (user_id, district, languages, experience_years, specialization, bio, profile_complete)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [
          guideUser.lastID,
          application.district || '',
          application.languages || '',
          parseInt(application.experience, 10) || 0,
          '',
          application.about || ''
        ]
      );

      await dbRun(
        `UPDATE guide_applications
         SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP, approved_guide_user_id = ?
         WHERE id = ?`,
        [guideUser.lastID, req.params.id]
      );

      return res.json({ success: true });
    }

    await dbRun(
      `UPDATE guide_applications
       SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, approved_guide_user_id = NULL
       WHERE id = ?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/guides', auth, requireRole('admin'), async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT u.id, u.name, u.email, u.phone, u.linked_tourist_id, gp.district, gp.rating, gp.total_tours
       FROM users u
       JOIN guide_profiles gp ON u.id = gp.user_id
       WHERE u.role = 'guide'
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

async function startServer() {
  try {
    await db.initDatabase();
    app.listen(3000, () => console.log('LocalConnect running on http://localhost:3000'));
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

startServer();
