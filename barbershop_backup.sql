--
-- BarberShop PostgreSQL Database Backup
-- Database : barbershop
-- User     : postgres
-- Password : 123
--
-- How to restore on your Ubuntu server:
--   sudo -u postgres psql -c "CREATE DATABASE barbershop;"
--   sudo -u postgres psql -d barbershop -f barbershop_backup.sql
--

-- Drop existing tables
DROP TABLE IF EXISTS slot_blocks CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS barbers CASCADE;

-- ──────────────────────────────────────────────
-- TABLE: promotions
-- ──────────────────────────────────────────────
CREATE TABLE promotions (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  type        VARCHAR(50)  NOT NULL,
  url         TEXT         NOT NULL,
  description TEXT
);

-- ──────────────────────────────────────────────
-- TABLE: bookings
-- ──────────────────────────────────────────────
CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  phone           VARCHAR(50)  NOT NULL,
  service         VARCHAR(255) NOT NULL,
  date            VARCHAR(50)  NOT NULL,
  time            VARCHAR(50)  NOT NULL,
  barber          VARCHAR(255) DEFAULT 'Any Barber',
  transaction_ref VARCHAR(255) DEFAULT NULL,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO bookings (id, name, phone, service, date, time, barber, transaction_ref, created_at)
VALUES (1, 'sadfasd', '364564356', 'Haircut', '2026-10-15', '11:00 AM', 'John', NULL, '2026-10-03 14:24:16');

SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));

-- ──────────────────────────────────────────────
-- TABLE: messages
-- ──────────────────────────────────────────────
CREATE TABLE messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  message    TEXT         NOT NULL,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ──────────────────────────────────────────────
-- TABLE: services
-- ──────────────────────────────────────────────
CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  duration    INTEGER      NOT NULL,
  category    VARCHAR(100) NOT NULL,
  image_url   TEXT,
  price       VARCHAR(100) DEFAULT '0',
  description TEXT
);

INSERT INTO services (id, name, duration, category, image_url, price, description) VALUES
(1, 'VIP',                    60, 'PREMIUM',    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '3,500', 'for all hair cut styles'),
(2, 'Haircut',                30, 'HAIR',       'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '600',   'for all hair cut styles'),
(3, 'Hair Cut With Hair Wash',40, 'HAIRCARE',   'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '700',   'Refreshing wash and cut'),
(4, 'Finger coils (ከርል)',    45, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '900',   'Premium finger coils styling'),
(5, 'Hair Wash',              30, 'HAIRCARE',   'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '400',   'Refreshing wash, scalp massage, and towel dry.'),
(6, 'Hair cut + Finger coils',60, 'HAIR STYLE', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600', '1,400', 'ቁርጥ እና ከርል');

SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));

-- ──────────────────────────────────────────────
-- TABLE: barbers
-- ──────────────────────────────────────────────
CREATE TABLE barbers (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255)   NOT NULL,
  role      VARCHAR(255)   NOT NULL,
  initials  VARCHAR(10)    NOT NULL,
  rating    NUMERIC(3,1)   DEFAULT 9.0,
  years     VARCHAR(20)    DEFAULT '5+',
  photo_url TEXT,
  active    INTEGER        DEFAULT 1
);

INSERT INTO barbers (id, name, role, initials, rating, years, photo_url, active) VALUES
(1, 'John',    'Barber',                  'JO', 9.0, '7+',  'http://102.208.98.85:7901/uploads/1791103628018.jpg', 1),
(2, 'Michael', 'Barber',                  'MI', 9.5, '8+',  'http://102.208.98.85:7901/uploads/1791103661094.jpg', 1),
(3, 'David',   'Barber',                  'DA', 8.5, '6+',  'http://102.208.98.85:7901/uploads/1791103682731.jpg', 1),
(4, 'Tedi',    'Home Service Specialist', 'TE', 9.8, '12+', 'http://102.208.98.85:7901/uploads/1791103773195.jpg', 1),
(5, 'Hana',    'Barber',                  'HA', 9.0, '5+',  'http://102.208.98.85:7901/uploads/1791103811235.jpg', 1);

SELECT setval('barbers_id_seq', (SELECT MAX(id) FROM barbers));

-- ──────────────────────────────────────────────
-- TABLE: slot_blocks
-- ──────────────────────────────────────────────
CREATE TABLE slot_blocks (
  id   SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL
);
