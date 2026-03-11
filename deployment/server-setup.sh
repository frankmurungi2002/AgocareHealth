#!/bin/bash
# ============================================
# Agocare Health - Hostinger Cloud Server Setup
# Run this script on your Hostinger Cloud VPS
# ============================================

set -e

echo "=========================================="
echo "  Agocare Health - Server Setup Script"
echo "=========================================="

# Update system
echo "[1/8] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Java 17
echo "[2/8] Installing Java 17..."
sudo apt install -y openjdk-17-jdk
java -version

# Install PostgreSQL
echo "[3/8] Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup PostgreSQL database
echo "[4/8] Setting up PostgreSQL database..."
read -sp "Enter a password for the PostgreSQL 'agrocare_user': " DB_PASS
echo
sudo -u postgres psql <<EOF
CREATE USER agrocare_user WITH PASSWORD '${DB_PASS}';
CREATE DATABASE agrocare_db OWNER agrocare_user;
GRANT ALL PRIVILEGES ON DATABASE agrocare_db TO agrocare_user;
\c agrocare_db
GRANT ALL ON SCHEMA public TO agrocare_user;
EOF
echo "PostgreSQL database created successfully."

# Install MongoDB
echo "[5/8] Installing MongoDB..."
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
echo "MongoDB installed successfully."

# Install Nginx
echo "[6/8] Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create application directories
echo "[7/8] Creating application directories..."
sudo mkdir -p /var/www/agocare/frontend
sudo mkdir -p /var/www/agocare/backend
sudo mkdir -p /var/www/agocare/uploads
sudo mkdir -p /var/log/agocare

# Set permissions
sudo chown -R $USER:$USER /var/www/agocare
sudo chown -R $USER:$USER /var/log/agocare

# Install Certbot for SSL
echo "[8/8] Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

echo ""
echo "=========================================="
echo "  Server setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Upload your project files (see deploy.sh)"
echo "  2. Configure Nginx (copy nginx config)"
echo "  3. Build and start the backend"
echo "  4. Setup SSL with: sudo certbot --nginx -d agocare.com -d www.agocare.com"
echo ""
