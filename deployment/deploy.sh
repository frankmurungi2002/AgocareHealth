#!/bin/bash
# ============================================
# Agocare Health - Deployment Script
# Run this from your LOCAL machine to deploy
# ============================================

set -e

# Configuration - UPDATE THESE
SERVER_IP="YOUR_HOSTINGER_IP"
SERVER_USER="root"
DOMAIN="agocare.com"

echo "=========================================="
echo "  Agocare Health - Deploy to Hostinger"
echo "=========================================="

# Step 1: Build the backend JAR
echo "[1/4] Building backend JAR..."
cd backend
./mvnw clean package -DskipTests -Pprod
cd ..

# Step 2: Upload frontend files
echo "[2/4] Uploading frontend files..."
scp -r html/* ${SERVER_USER}@${SERVER_IP}:/var/www/agocare/frontend/
scp -r css/ ${SERVER_USER}@${SERVER_IP}:/var/www/agocare/frontend/
scp -r js/ ${SERVER_USER}@${SERVER_IP}:/var/www/agocare/frontend/

# Also upload the root index.html if it differs
scp index.html ${SERVER_USER}@${SERVER_IP}:/var/www/agocare/frontend/

echo "Frontend files uploaded."

# Step 3: Upload backend JAR
echo "[3/4] Uploading backend JAR..."
scp backend/target/agrocare-backend-1.0.0.jar ${SERVER_USER}@${SERVER_IP}:/var/www/agocare/backend/agrocare-backend.jar

echo "Backend JAR uploaded."

# Step 4: Restart the backend service
echo "[4/4] Restarting backend service..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl restart agocare-backend"

echo ""
echo "=========================================="
echo "  Deployment complete!"
echo "  Visit: https://${DOMAIN}"
echo "=========================================="
