-- BarberShop PostgreSQL Database Export
-- Generated: 2026-10-05T13:58:12.175Z
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

-- No data found in table: promotions

-- Data for table: bookings
INSERT INTO bookings (id, name, phone, service, date, time, barber, transaction_ref, created_at) VALUES (1, 'sadfasd', '364564356', 'Haircut', '2026-10-15', '11:00 AM', 'John', NULL, '2026-10-03 14:24:16');
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- No data found in table: messages

-- Data for table: services
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (1, 'VIP', 60, 'PREMIUM', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (2, 'Haircut', 30, 'HAIR', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (3, 'Hair Cut With Hair Wash', 40, 'HAIRCARE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (4, 'Finger coils (ከርል)', 45, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (5, 'Hair Wash', 30, 'HAIRCARE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES (6, 'Hair cut + Finger coils', 60, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '0', NULL);
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- Data for table: barbers
INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES (1, 'John', 'Barber', 'JO', 9, '7+', 'http://102.208.98.85:7901/uploads/1791103628018.jpg', 1);
INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES (2, 'Michael', 'Barber', 'MI', 9.5, '8+', 'http://102.208.98.85:7901/uploads/1791103661094.jpg', 1);
INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES (3, 'David', 'Barber', 'DA', 8.5, '6+', 'http://102.208.98.85:7901/uploads/1791103682731.jpg', 1);
INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES (4, 'Tedi', 'Home Service Specialist', 'TE', 9.8, '12+', 'http://102.208.98.85:7901/uploads/1791103773195.jpg', 1);
INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES (5, 'Hana', 'Barber', 'HA', 9, '5+', 'http://102.208.98.85:7901/uploads/1791103811235.jpg', 1);
SELECT setval('barbers_id_seq', (SELECT MAX(id) FROM barbers));

-- No data found in table: slot_blocks

