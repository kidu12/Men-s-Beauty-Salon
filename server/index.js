require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 7901;

function getFileUrl(req, filename) {
  if (process.env.BASE_URL) {
    return `${process.env.BASE_URL.replace(/\/$/, '')}/uploads/${filename}`;
  }
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// Email Configuration (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'kidus0947560155@gmail.com',
    pass: process.env.EMAIL_PASS || 'klgg qixw jjgk hbyx'
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// PostgreSQL connection pool
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME     || 'barbershop',
});

// Helper: run a parameterized query and return rows
async function dbQuery(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

// Initialize database tables
async function initDb() {
  // Ensure uploads directory exists
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
  }

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS promotions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        description TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        service VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        barber VARCHAR(255) DEFAULT 'Any Barber',
        transaction_ref VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add columns if missing (safe for re-runs)
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS barber VARCHAR(255) DEFAULT 'Any Barber'`);
    await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255) DEFAULT NULL`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        duration INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT,
        price VARCHAR(100) DEFAULT '0',
        description TEXT
      )
    `);
    await pool.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS price VARCHAR(100) DEFAULT '0'`);
    await pool.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS barbers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        initials VARCHAR(10) NOT NULL,
        rating NUMERIC(3,1) DEFAULT 9.0,
        years VARCHAR(20) DEFAULT '5+',
        photo_url TEXT,
        active INTEGER DEFAULT 1
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS slot_blocks (
        id SERIAL PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL
      )
    `);

    console.log('Successfully connected to PostgreSQL database: barbershop');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

initDb();

// ─── Promotions Routes ──────────────────────────────────────────────────────

app.get('/api/promotions', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM promotions ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promotions', upload.single('file'), async (req, res) => {
  try {
    const { title, type, description } = req.body;
    let url = req.body.url;
    if (req.file) {
      url = getFileUrl(req, req.file.filename);
    }
    const rows = await dbQuery(
      'INSERT INTO promotions (title, type, url, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, type, url, description]
    );
    res.json({ id: rows[0].id, title, type, url, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT url FROM promotions WHERE id = $1', [req.params.id]);
    if (rows.length > 0 && rows[0].url && rows[0].url.includes('/uploads/')) {
      const fileName = rows[0].url.split('/').pop();
      const filePath = path.join(__dirname, 'uploads', fileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await dbQuery('DELETE FROM promotions WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Bookings Routes ────────────────────────────────────────────────────────

app.get('/api/bookings', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM bookings ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { name, phone, service, date, time, barber, transaction_ref } = req.body;
    const barberValue = barber || 'Any Barber';
    const txRefValue = transaction_ref || null;

    const existing = await dbQuery(
      'SELECT * FROM bookings WHERE date = $1 AND time = $2',
      [date, time]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked. Please choose another.' });
    }

    const rows = await dbQuery(
      'INSERT INTO bookings (name, phone, service, date, time, barber, transaction_ref) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, phone, service, date, time, barberValue, txRefValue]
    );

    const mailOptions = {
      from: '"AfroBarberShop" <kidus0947560155@gmail.com>',
      to: 'teddykefale470@gmail.com',
      subject: "New Appointment Booking - AFRO MEN'S SALON",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C9915C; color: white; padding: 20px; text-align: center;">
            <h1>New Appointment Booking</h1>
          </div>
          <div style="background: #f5f5f0; padding: 30px;">
            <h2 style="color: #0f0f0f; margin-top: 0;">Booking Confirmation</h2>
            <div style="background: white; border-left: 4px solid #C9915C; padding: 20px; margin: 20px 0;">
              <p><strong style="color: #0f0f0f;">Client Name:</strong> <span style="color: #666;">${name}</span></p>
              <p><strong style="color: #0f0f0f;">Phone:</strong> <span style="color: #666;">${phone}</span></p>
              <p><strong style="color: #0f0f0f;">Service:</strong> <span style="color: #666;">${service}</span></p>
              <p><strong style="color: #0f0f0f;">Date:</strong> <span style="color: #666;">${date}</span></p>
              <p><strong style="color: #0f0f0f;">Time:</strong> <span style="color: #666;">${time}</span></p>
              <p><strong style="color: #0f0f0f;">Preferred Barber:</strong> <span style="color: #666;">${barberValue}</span></p>
              ${txRefValue ? `<p><strong style="color: #0f0f0f;">Transaction Ref:</strong> <span style="color: #666;">${txRefValue}</span></p>` : ''}
            </div>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;"><strong>Booking ID:</strong> #${rows[0].id}</p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">Please contact the client to confirm the appointment.</p>
          </div>
          <div style="background: #0f0f0f; color: #C9915C; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">AFRO MEN'S SALON | Ayat Tebel Condominium, Addis Ababa, Ethiopia</p>
            <p style="margin: 10px 0 0 0;">+251 91 310 1492</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email error:', err.message);
      else console.log('Email sent:', info.response);
    });

    res.json({ id: rows[0].id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await dbQuery('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Messages Routes ────────────────────────────────────────────────────────

app.get('/api/messages', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM messages ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const rows = await dbQuery(
      'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING id',
      [name, email, message]
    );

    const mailOptions = {
      from: '"AfroBarberShop" <kidus0947560155@gmail.com>',
      to: 'teddykefale470@gmail.com',
      subject: "New Contact Message - AFRO MEN'S SALON",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #C9915C; color: white; padding: 20px; text-align: center;">
            <h1>New Contact Message</h1>
          </div>
          <div style="background: #f5f5f0; padding: 30px;">
            <p><strong style="color: #0f0f0f;">Name:</strong> <span style="color: #666;">${name}</span></p>
            <p><strong style="color: #0f0f0f;">Email:</strong> <span style="color: #666;">${email}</span></p>
            <p><strong style="color: #0f0f0f;">Message:</strong></p>
            <p style="color: #666; background: white; padding: 15px; border-left: 4px solid #C9915C;">${message}</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.error('Email error:', err.message);
      else console.log('Contact message email sent:', info.response);
    });

    res.json({ id: rows[0].id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await dbQuery('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Services CRUD Routes ───────────────────────────────────────────────────

app.get('/api/services', async (req, res) => {
  try {
    let rows = await dbQuery('SELECT * FROM services ORDER BY id ASC');
    if (rows.length === 0) {
      const defaultServices = [
        ['VIP', 60, 'PREMIUM', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '3,500', 'for all hair cut styles'],
        ['Haircut', 30, 'HAIR', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '600', 'for all hair cut styles'],
        ['Hair Cut With Hair Wash', 40, 'HAIRCARE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '700', 'Refreshing wash and cut'],
        ['Finger coils (ከርል)', 45, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '900', 'Premium finger coils styling'],
        ['Hair Wash', 30, 'HAIRCARE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '400', 'Refreshing wash, scalp massage, and towel dry.'],
        ['Hair cut + Finger coils', 60, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '1,400', 'ቁርጥ እና ከርል']
      ];
      for (const s of defaultServices) {
        await dbQuery(
          'INSERT INTO services (name, duration, category, image_url, price, description) VALUES ($1, $2, $3, $4, $5, $6)',
          s
        );
      }
      rows = await dbQuery('SELECT * FROM services ORDER BY id ASC');
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', upload.single('image'), async (req, res) => {
  try {
    const { name, duration, category, price, description } = req.body;
    let image_url = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600';
    if (req.file) {
      image_url = getFileUrl(req, req.file.filename);
    }
    const rows = await dbQuery(
      'INSERT INTO services (name, duration, category, image_url, price, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, parseInt(duration), category, image_url, price || '0', description || '']
    );
    res.json({ id: rows[0].id, name, duration: parseInt(duration), category, image_url, price: price || '0', description: description || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, duration, category, price, description } = req.body;
    const rows = await dbQuery('SELECT * FROM services WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found' });

    let image_url = req.body.image_url || rows[0].image_url;
    if (req.file) {
      image_url = getFileUrl(req, req.file.filename);
    }

    await dbQuery(
      'UPDATE services SET name=$1, duration=$2, category=$3, image_url=$4, price=$5, description=$6 WHERE id=$7',
      [name, parseInt(duration), category, image_url, price || '0', description || '', req.params.id]
    );
    res.json({ id: parseInt(req.params.id), name, duration: parseInt(duration), category, image_url, price: price || '0', description: description || '' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    await dbQuery('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Barbers CRUD Routes ────────────────────────────────────────────────────

app.get('/api/barbers', async (req, res) => {
  try {
    let rows = await dbQuery('SELECT * FROM barbers ORDER BY id ASC');
    if (rows.length === 0) {
      const defaultBarbers = [
        ['John',    'Barber',                   'JO', 9.0, '5+', null, 1],
        ['Michael', 'Barber',                   'MI', 9.5, '8+', null, 1],
        ['David',   'Barber',                   'DA', 8.5, '6+', null, 1],
        ['Tedi',    'Home Service Specialist',  'TE', 9.8, '7+', null, 1]
      ];
      for (const b of defaultBarbers) {
        await dbQuery(
          'INSERT INTO barbers (name, role, initials, rating, years, photo_url, active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          b
        );
      }
      rows = await dbQuery('SELECT * FROM barbers ORDER BY id ASC');
    } else {
      const hasTedi = rows.some(b => b.name && b.name.toLowerCase() === 'tedi');
      if (!hasTedi) {
        await dbQuery(
          'INSERT INTO barbers (name, role, initials, rating, years, photo_url, active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          ['Tedi', 'Home Service Specialist', 'TE', 9.8, '7+', null, 1]
        );
        rows = await dbQuery('SELECT * FROM barbers ORDER BY id ASC');
      }
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/barbers', upload.single('photo'), async (req, res) => {
  try {
    const { name, role, initials, rating, years } = req.body;
    let photo_url = null;
    if (req.file) {
      photo_url = getFileUrl(req, req.file.filename);
    }
    const rows = await dbQuery(
      'INSERT INTO barbers (name, role, initials, rating, years, photo_url, active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [name, role, initials, parseFloat(rating) || 9.0, years || '5+', photo_url, 1]
    );
    res.json({ id: rows[0].id, name, role, initials, rating: parseFloat(rating) || 9.0, years: years || '5+', photo_url, active: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/barbers/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, role, initials, rating, years, active } = req.body;
    const rows = await dbQuery('SELECT * FROM barbers WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Barber not found' });

    let photo_url = req.body.photo_url || rows[0].photo_url;
    if (req.file) {
      photo_url = getFileUrl(req, req.file.filename);
    }

    const activeVal = active !== undefined ? parseInt(active) : rows[0].active;

    await dbQuery(
      'UPDATE barbers SET name=$1, role=$2, initials=$3, rating=$4, years=$5, photo_url=$6, active=$7 WHERE id=$8',
      [name, role, initials, parseFloat(rating) || 9.0, years || '5+', photo_url, activeVal, req.params.id]
    );
    res.json({ id: parseInt(req.params.id), name, role, initials, rating: parseFloat(rating) || 9.0, years: years || '5+', photo_url, active: activeVal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/barbers/:id', async (req, res) => {
  try {
    await dbQuery('DELETE FROM barbers WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Slot Blocks Routes ─────────────────────────────────────────────────────

app.get('/api/slot_blocks', async (req, res) => {
  try {
    const rows = await dbQuery('SELECT * FROM slot_blocks ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/slot_blocks', async (req, res) => {
  try {
    const { date, time } = req.body;
    const existing = await dbQuery(
      'SELECT * FROM slot_blocks WHERE date = $1 AND time = $2',
      [date, time]
    );
    if (existing.length > 0) {
      return res.json(existing[0]);
    }
    const rows = await dbQuery(
      'INSERT INTO slot_blocks (date, time) VALUES ($1, $2) RETURNING id',
      [date, time]
    );
    res.json({ id: rows[0].id, date, time });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/slot_blocks', async (req, res) => {
  try {
    const { date, time } = req.query;
    await dbQuery('DELETE FROM slot_blocks WHERE date = $1 AND time = $2', [date, time]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Auth ───────────────────────────────────────────────────────────────────

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ─── Start ──────────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
