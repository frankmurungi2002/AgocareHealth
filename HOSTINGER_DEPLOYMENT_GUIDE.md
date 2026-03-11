# Agocare Health - Hostinger Cloud Deployment Guide

## Overview

This guide walks you through deploying Agocare Health on **Hostinger Cloud Hosting**.

**Tech Stack:**
- Frontend: HTML / CSS / JavaScript (static files)
- Backend: Java 17 + Spring Boot 3.1
- Databases: PostgreSQL + MongoDB
- Web Server: Nginx (reverse proxy)
- SSL: Let's Encrypt (free)

---

## Prerequisites

- Hostinger Cloud Hosting plan (active)
- Domain `agocare.com` pointed to your Hostinger server IP
- SSH access to your server
- Git installed locally

---

## Step-by-Step Deployment

### 1. Point Your Domain to Hostinger

In **Hostinger hPanel**:
1. Go to **Domains** → `agocare.com`
2. Set **DNS A Record**:
   - Type: `A`  
   - Name: `@`  
   - Points to: `YOUR_SERVER_IP`
3. Add another A record:
   - Type: `A`  
   - Name: `www`  
   - Points to: `YOUR_SERVER_IP`
4. Wait 5-30 minutes for DNS propagation

### 2. Connect to Your Server via SSH

```bash
ssh root@YOUR_SERVER_IP
```

If this is your first time, set up SSH keys:
```bash
# On your LOCAL machine (Windows PowerShell)
ssh-keygen -t rsa -b 4096
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@YOUR_SERVER_IP "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Upload Project Files to Server

From your **local machine** (in the project root):

```powershell
# Upload the entire project
scp -r . root@YOUR_SERVER_IP:/var/www/agocare/
```

Or use **Git** (recommended):

```bash
# On the SERVER
cd /var/www
git clone https://github.com/YOUR_USERNAME/AgocareHealth.git agocare
```

### 4. Run Server Setup Script

On the **server** via SSH:

```bash
cd /var/www/agocare
chmod +x deployment/*.sh
./deployment/server-setup.sh
```

This installs:
- Java 17
- PostgreSQL (creates database & user)
- MongoDB
- Nginx
- Certbot (SSL)

### 5. Build the Backend

On the **server**:

```bash
cd /var/www/agocare/backend

# Install Maven wrapper if not present
mvn -N io.takari:maven:wrapper

# Build the JAR
./mvnw clean package -DskipTests
```

Copy the JAR to the deployment location:
```bash
cp target/agrocare-backend-1.0.0.jar /var/www/agocare/backend/agrocare-backend.jar
```

### 6. Configure the Server

```bash
cd /var/www/agocare
./deployment/configure-server.sh
```

**IMPORTANT:** When prompted, edit the systemd service file to set your actual passwords:

```bash
sudo nano /etc/systemd/system/agocare-backend.service
```

Update these lines:
```ini
Environment="DB_PASSWORD=your_actual_database_password"
Environment="JWT_SECRET=a_random_string_at_least_32_characters_long"
```

### 7. Setup SSL Certificate

```bash
sudo certbot --nginx -d agocare.com -d www.agocare.com
```

Follow the prompts — select option to redirect HTTP to HTTPS.

### 8. Verify Everything Works

```bash
# Check backend status
sudo systemctl status agocare-backend

# Check nginx
sudo systemctl status nginx

# Test API
curl https://agocare.com/api/health

# View backend logs
sudo journalctl -u agocare-backend -f
```

Visit **https://agocare.com** in your browser!

---

## File Structure on Server

```
/var/www/agocare/
├── frontend/          # HTML, CSS, JS files (served by Nginx)
│   ├── index.html
│   ├── Login.html
│   ├── patientDashboard.html
│   ├── doctor-dashboard.html
│   ├── css/
│   └── js/
├── backend/
│   └── agrocare-backend.jar    # Spring Boot application
├── uploads/           # User-uploaded files
├── database/          # DB init scripts
└── deployment/        # Deployment configs
```

---

## Useful Server Commands

| Command | Description |
|---------|-------------|
| `sudo systemctl restart agocare-backend` | Restart the backend |
| `sudo systemctl restart nginx` | Restart the web server |
| `sudo journalctl -u agocare-backend -f` | Live backend logs |
| `sudo tail -f /var/log/agocare/error.log` | Error logs |
| `sudo certbot renew` | Renew SSL certificate |
| `sudo -u postgres psql -d agrocare_db` | Access PostgreSQL |
| `mongosh agrocare_nosql` | Access MongoDB |

---

## Updating the Site

After making changes locally:

### Option A: Using the deploy script
```bash
# Edit deployment/deploy.sh and set SERVER_IP
# Then run:
bash deployment/deploy.sh
```

### Option B: Using Git on server
```bash
# On the server
cd /var/www/agocare
git pull origin main

# Rebuild backend if Java code changed
cd backend
./mvnw clean package -DskipTests
cp target/agrocare-backend-1.0.0.jar /var/www/agocare/backend/agrocare-backend.jar
sudo systemctl restart agocare-backend
```

### Option C: Manual file upload
```powershell
# Upload specific files from your Windows machine
scp -r html/* root@YOUR_SERVER_IP:/var/www/agocare/frontend/
scp -r css/ root@YOUR_SERVER_IP:/var/www/agocare/frontend/
scp -r js/ root@YOUR_SERVER_IP:/var/www/agocare/frontend/
```

---

## Troubleshooting

### Backend won't start
```bash
sudo journalctl -u agocare-backend -n 100
# Check if ports are in use
sudo lsof -i :8080
```

### Nginx errors
```bash
sudo nginx -t              # Test config
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues
```bash
sudo systemctl status postgresql
sudo systemctl status mongod
sudo -u postgres psql -c "SELECT 1;"
```

### 502 Bad Gateway
The backend likely isn't running. Check:
```bash
sudo systemctl status agocare-backend
sudo systemctl restart agocare-backend
```

### SSL certificate renewal
Certbot auto-renews, but you can test:
```bash
sudo certbot renew --dry-run
```

---

## Security Checklist

- [ ] Changed default JWT secret to a strong random string
- [ ] Used a strong PostgreSQL password
- [ ] Enabled UFW firewall: `sudo ufw allow 22,80,443/tcp && sudo ufw enable`
- [ ] Disabled root SSH login (use key-based auth)
- [ ] SSL certificate is active
- [ ] `application-prod.properties` has `show-sql=false`
- [ ] No sensitive files committed to Git (check `.gitignore`)

---

## Cost Estimate (Hostinger Cloud)

| Component | Included |
|-----------|----------|
| Cloud Hosting | Your plan |
| SSL Certificate | Free (Let's Encrypt) |
| Domain | Already owned |
| PostgreSQL | Self-hosted (included) |
| MongoDB | Self-hosted (included) |
