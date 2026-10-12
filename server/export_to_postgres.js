// Script to export SQLite data to a PostgreSQL SQL file
const sqlite = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const db = new sqlite(path.join(__dirname, 'database.sqlite'));

let sql = '';

// ── Schema ────────────────────────────────────────────────────────────────

sql += `-- BarberShop PostgreSQL Database Export
-- Generated: ${new Date().toISOString()}
-- Run this on your Ubuntu server with:
--   sudo -u postgres psql -d barbershop -f barbershop_postgres.sql

-- Drop existing tables if any
DROP TABLE IF EXISTS slot_blocks CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;

-- ── Create Tables ─────────────────────────────────────────────────────────

CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  description TEXT
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  barber VARCHAR(255) DEFAULT 'Any Barber',
  transaction_ref VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  duration INTEGER NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  price VARCHAR(100) DEFAULT '0',
  description TEXT
);

CREATE TABLE barbers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  initials VARCHAR(10) NOT NULL,
  rating NUMERIC(3,1) DEFAULT 9.0,
  years VARCHAR(20) DEFAULT '5+',
  photo_url TEXT,
  active INTEGER DEFAULT 1
);

CREATE TABLE slot_blocks (
  id SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL
);

`;

// ── Helper: escape single quotes for SQL ─────────────────────────────────
function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return `'${String(val).replace(/'/g, "''")}'`;
}

// ── Export data from each table ──────────────────────────────────────────

const tables = [
  { name: 'promotions', cols: ['id','title','type','url','description'] },
  { name: 'bookings',   cols: ['id','name','phone','service','date','time','barber','transaction_ref','created_at'] },
  { name: 'messages',   cols: ['id','name','email','message','created_at'] },
  { name: 'services',   cols: ['id','name','duration','category','image_url','price','description'] },
  { name: 'barbers',    cols: ['id','name','role','initials','rating','years','photo_url','active'] },
  { name: 'slot_blocks',cols: ['id','date','time'] },
];

for (const table of tables) {
  let rows = [];
  try {
    rows = db.prepare(`SELECT * FROM ${table.name}`).all();
  } catch(e) {
    // table might not exist in sqlite yet
  }

  if (rows.length > 0) {
    sql += `-- Data for table: ${table.name}\n`;
    for (const row of rows) {
      const vals = table.cols.map(c => esc(row[c])).join(', ');
      sql += `INSERT INTO ${table.name} (${table.cols.join(', ')}) VALUES (${vals});\n`;
    }
    // Reset the sequence so next INSERT auto-id is correct
    sql += `SELECT setval('${table.name}_id_seq', (SELECT MAX(id) FROM ${table.name}));\n`;
    sql += '\n';
  } else {
    sql += `-- No data found in table: ${table.name}\n\n`;
  }
}

const outPath = path.join(__dirname, 'barbershop_postgres.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('✅ PostgreSQL SQL file generated: barbershop_postgres.sql');
console.log(`   Total size: ${sql.length} bytes`);
db.close();
