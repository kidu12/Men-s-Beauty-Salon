#!/bin/bash
# =============================================================
#  BarberShop - Update/Redeploy Script
#  Run when you upload a new version of Publish or build
#  Usage: bash update.sh
# =============================================================

set -e

echo "============================================="
echo "  BarberShop - Updating..."
echo "============================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop services
echo "[1/4] Stopping services..."
systemctl stop barbershop-api || true
systemctl stop barbershop-frontend || true

# Copy new backend files
echo "[2/4] Deploying new backend..."
cp -r "$SCRIPT_DIR"/. /var/www/barbershop/Publish/
cd /var/www/barbershop/Publish
npm install --production

# Reload systemd and restart
echo "[3/4] Restarting services..."
systemctl daemon-reload
systemctl start barbershop-api
systemctl start barbershop-frontend

echo "[4/4] Done!"
echo ""
echo "  Frontend  : http://102.208.98.85:7900"
echo "  Backend   : http://102.208.98.85:7901"
echo ""
systemctl status barbershop-api --no-pager
systemctl status barbershop-frontend --no-pager
