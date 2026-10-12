#!/bin/bash
# =============================================================
#  BarberShop - Full Server Install Script
#  Run as root or with sudo: bash install.sh
#  Server IP : 102.208.98.85
#  Frontend  : http://102.208.98.85:7900  (/var/www/barbershop/build)
#  Backend   : http://102.208.98.85:7901  (/var/www/barbershop/Publish)
#  Database  : PostgreSQL  db=barbershop  user=postgres  pass=123
# =============================================================

set -e  # Exit immediately on any error

echo "============================================="
echo "  BarberShop Server Setup Starting..."
echo "============================================="

# ── 1. System update ─────────────────────────────────────────
echo ""
echo "[1/8] Updating system packages..."
apt update -y && apt upgrade -y

# ── 2. Install Node.js 20 ────────────────────────────────────
echo ""
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v

# Install 'serve' globally (used to host the frontend)
npm install -g serve

# ── 3. Install PostgreSQL ────────────────────────────────────
echo ""
echo "[3/8] Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Set postgres password and create database
echo ""
echo "[3b] Configuring PostgreSQL..."
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '123';" || true
sudo -u postgres psql -c "CREATE DATABASE barbershop;" || echo "Database already exists, skipping."

# Import the database schema and data
echo ""
echo "[3c] Importing barbershop database..."
sudo -u postgres psql -d barbershop -f "$SCRIPT_DIR/barbershop_postgres.sql"
echo "Database imported successfully."

# ── 4. Create deployment directories ────────────────────────
echo ""
echo "[4/8] Creating deployment directories..."
mkdir -p /var/www/barbershop/build
mkdir -p /var/www/barbershop/Publish/uploads
chown -R www-data:www-data /var/www/barbershop

# ── 5. Copy backend (Publish) files ─────────────────────────
echo ""
echo "[5/8] Deploying backend (Publish)..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copy all Publish files to /var/www/barbershop/Publish
cp -r "$SCRIPT_DIR"/. /var/www/barbershop/Publish/

# Install Node.js dependencies
cd /var/www/barbershop/Publish
npm install --production
echo "Backend dependencies installed."

# ── 6. Register systemd services ────────────────────────────
echo ""
echo "[6/8] Registering systemd services..."

# Backend API service
cp /var/www/barbershop/Publish/barbershop-api.service /etc/systemd/system/barbershop-api.service

# Frontend service
cp /var/www/barbershop/Publish/barbershop-frontend.service /etc/systemd/system/barbershop-frontend.service

# Reload systemd
systemctl daemon-reload

# ── 7. Start and enable services ────────────────────────────
echo ""
echo "[7/8] Starting services..."

systemctl enable barbershop-api
systemctl start barbershop-api
echo "Backend API started on port 7901."

systemctl enable barbershop-frontend
systemctl start barbershop-frontend
echo "Frontend started on port 7900."

# ── 8. Open firewall ports ───────────────────────────────────
echo ""
echo "[8/8] Configuring firewall..."
ufw allow OpenSSH
ufw allow 7900/tcp
ufw allow 7901/tcp
ufw --force enable
ufw status

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "============================================="
echo "  Installation Complete!"
echo "============================================="
echo ""
echo "  Frontend  : http://102.208.98.85:7900"
echo "  Backend   : http://102.208.98.85:7901"
echo ""
echo "  Check service status:"
echo "    systemctl status barbershop-api"
echo "    systemctl status barbershop-frontend"
echo ""
echo "  View logs:"
echo "    journalctl -u barbershop-api -f"
echo "    journalctl -u barbershop-frontend -f"
echo "============================================="
