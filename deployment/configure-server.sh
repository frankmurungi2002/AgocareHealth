#!/bin/bash
# ============================================
# Agocare Health - Complete Server Configuration
# Run this AFTER server-setup.sh on your Hostinger VPS
# ============================================

set -e

echo "=========================================="
echo "  Agocare - Configuring Server"
echo "=========================================="

# Step 1: Copy Nginx config
echo "[1/5] Setting up Nginx..."
sudo cp /var/www/agocare/deployment/nginx-agocare.conf /etc/nginx/sites-available/agocare.com

# Remove default site and enable agocare
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/agocare.com /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t
sudo systemctl reload nginx
echo "Nginx configured."

# Step 2: Setup the systemd service for Spring Boot
echo "[2/5] Setting up backend service..."
sudo cp /var/www/agocare/deployment/agocare-backend.service /etc/systemd/system/
echo ""
echo "⚠️  IMPORTANT: Edit the service file to set your passwords!"
echo "   Run: sudo nano /etc/systemd/system/agocare-backend.service"
echo "   Update: DB_PASSWORD and JWT_SECRET"
echo ""
read -p "Press Enter after you've updated the passwords..."

sudo systemctl daemon-reload
sudo systemctl enable agocare-backend
echo "Backend service configured."

# Step 3: Set proper file permissions
echo "[3/5] Setting file permissions..."
sudo chown -R www-data:www-data /var/www/agocare/frontend
sudo chown -R www-data:www-data /var/www/agocare/uploads
sudo chown -R www-data:www-data /var/log/agocare
sudo chmod -R 755 /var/www/agocare/frontend
echo "Permissions set."

# Step 4: Initialize the database
echo "[4/5] Initializing database..."
if [ -f /var/www/agocare/database/init-postgresql.sql ]; then
    sudo -u postgres psql -d agrocare_db -f /var/www/agocare/database/init-postgresql.sql
    echo "PostgreSQL initialized."
fi

if [ -f /var/www/agocare/database/init-mongodb.js ]; then
    mongosh agrocare_nosql /var/www/agocare/database/init-mongodb.js
    echo "MongoDB initialized."
fi

# Step 5: Start the backend
echo "[5/5] Starting backend..."
sudo systemctl start agocare-backend

# Check status
sleep 5
if sudo systemctl is-active --quiet agocare-backend; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start. Check logs:"
    echo "   sudo journalctl -u agocare-backend -n 50"
fi

echo ""
echo "=========================================="
echo "  Server configuration complete!"
echo "=========================================="
echo ""
echo "Next: Setup SSL certificate"
echo "  sudo certbot --nginx -d agocare.com -d www.agocare.com"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status agocare-backend    # Check backend status"
echo "  sudo journalctl -u agocare-backend -f    # View live logs"
echo "  sudo systemctl restart agocare-backend   # Restart backend"
echo "  sudo systemctl restart nginx             # Restart nginx"
echo ""
