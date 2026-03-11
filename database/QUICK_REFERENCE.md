# QUICK DATABASE COMMANDS REFERENCE

## 🚀 FASTEST WAY TO SETUP

### Windows (One Command)
```powershell
cd c:\Users\USER\Desktop\agrocare\database
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

---

## 📦 POSTGRESQL COMMANDS

### Connect to PostgreSQL
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres
```

### Create Database
```sql
CREATE DATABASE agrocare_db;
```

### List All Databases
```sql
\l
```

### Switch to Database
```sql
\c agrocare_db
```

### Run SQL File
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d agrocare_db -f init-postgresql.sql
```

### Check Tables
```sql
\dt
```

### Check Specific Table
```sql
\d users
```

### Count Records
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM doctor_profiles;
SELECT COUNT(*) FROM questions;
SELECT COUNT(*) FROM medical_centers;
SELECT COUNT(*) FROM appointments;
```

### View Sample Users
```sql
SELECT id, username, email, role FROM users;
```

### View Sample Doctor
```sql
SELECT * FROM doctor_profiles;
```

### View Sample Questions
```sql
SELECT id, title, category, author_id FROM questions;
```

### Reset Database
```sql
-- Drop all tables
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS medical_centers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS doctor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### Exit PostgreSQL
```sql
\q
```

---

## 📚 MONGODB COMMANDS

### Connect to MongoDB
```powershell
mongosh
```

### Switch to Database
```javascript
use agrocare_nosql;
```

### List All Databases
```javascript
show dbs;
```

### List Collections
```javascript
db.getCollectionNames();
```

### Run JavaScript File
```powershell
mongosh < init-mongodb.js
```

### Count Documents
```javascript
db.answers.countDocuments();
db.comments.countDocuments();
db.activity_logs.countDocuments();
db.reports.countDocuments();
```

### View Sample Documents
```javascript
db.answers.findOne();
db.activity_logs.find().limit(5);
db.comments.findOne();
db.reports.findOne();
```

### View All Collections Info
```javascript
db.getCollectionInfos();
```

### Drop Collection
```javascript
db.answers.drop();
db.comments.drop();
db.activity_logs.drop();
db.reports.drop();
```

### Drop Database
```javascript
db.dropDatabase();
```

### Exit MongoDB
```javascript
exit
```

---

## 🔍 VERIFY SETUP

### Check PostgreSQL Running
```powershell
Get-Service postgresql-x64-15  # or version number
# Status should be "Running"
```

### Check MongoDB Running
```powershell
Get-Service MongoDB
# Status should be "Running"
```

### Test PostgreSQL Connection
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d agrocare_db -c "SELECT COUNT(*) FROM users;"
```

### Test MongoDB Connection
```powershell
mongosh --eval "use agrocare_nosql; db.answers.countDocuments();"
```

### Test Backend Connection
```powershell
# Start backend first
cd c:\Users\USER\Desktop\agrocare\backend
mvn spring-boot:run

# In another terminal:
curl http://localhost:8080/api/health
curl http://localhost:8080/api/auth/users/PATIENT
```

---

## 🔐 PASSWORD REFERENCE

### Default PostgreSQL Password
- Enter when prompted during setup
- Typically used for 'postgres' user

### Default MongoDB
- No authentication (no password)
- Connection string: `mongodb://localhost:27017/agrocare_nosql`

### Sample User Credentials (PostgreSQL)
```
Username: patient_francis
Password: (from database password hash)
Email: francis@example.com

Username: doctor_smith
Password: (from database password hash)
Email: dr.smith@agrocare.com

Username: admin_user
Password: (from database password hash)
Email: admin@agrocare.com
```

**Note**: To login via API, use the REST endpoint:
```
POST http://localhost:8080/api/auth/login
Params: username=patient_francis&password=<password>
```

---

## 🛠️ COMMON OPERATIONS

### Backup PostgreSQL Database
```powershell
$env:PGPASSWORD = "postgres"
pg_dump -h localhost -U postgres agrocare_db > agrocare_backup.sql
```

### Restore PostgreSQL Database
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres agrocare_db < agrocare_backup.sql
```

### Export MongoDB Collection
```powershell
mongoexport --db agrocare_nosql --collection answers --out answers.json
```

### Import MongoDB Collection
```powershell
mongoimport --db agrocare_nosql --collection answers --file answers.json
```

### Check PostgreSQL Port Usage
```powershell
netstat -ano | findstr :5432
```

### Check MongoDB Port Usage
```powershell
netstat -ano | findstr :27017
```

---

## 🔄 RESET EVERYTHING

### Completely Reset PostgreSQL
```powershell
# Drop database
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -c "DROP DATABASE agrocare_db;"

# Recreate database
psql -h localhost -U postgres -c "CREATE DATABASE agrocare_db;"

# Run initialization
psql -h localhost -U postgres -d agrocare_db -f init-postgresql.sql
```

### Completely Reset MongoDB
```powershell
# Connect and drop database
mongosh

# In mongosh:
use agrocare_nosql;
db.dropDatabase();
exit

# Recreate collections
mongosh < init-mongodb.js
```

### Reset Both Databases
```powershell
cd c:\Users\USER\Desktop\agrocare\database

# Reset PostgreSQL
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -c "DROP DATABASE agrocare_db;"
psql -h localhost -U postgres -c "CREATE DATABASE agrocare_db;"
psql -h localhost -U postgres -d agrocare_db -f init-postgresql.sql

# Reset MongoDB
mongosh < init-mongodb.js

Write-Host "Both databases reset!" -ForegroundColor Green
```

---

## 📊 DATABASE INFO

### PostgreSQL Tables
- **users** - User accounts and profiles
- **doctor_profiles** - Doctor-specific data
- **questions** - Q&A questions
- **medical_centers** - Medical facility directory
- **appointments** - Appointment bookings

### MongoDB Collections
- **answers** - Question answers
- **comments** - Answer comments
- **activity_logs** - User activity tracking
- **reports** - Content moderation

### Database Files Location
```
Windows Data:
C:\Program Files\PostgreSQL\15\data
C:\Program Files\MongoDB\Server\7.0\data
```

---

## ⚠️ IMPORTANT NOTES

1. **Default Credentials**
   - PostgreSQL user: `postgres`
   - PostgreSQL password: (set during installation)
   - MongoDB: No authentication by default

2. **Ports**
   - PostgreSQL: 5432
   - MongoDB: 27017

3. **Database Names**
   - PostgreSQL: `agrocare_db`
   - MongoDB: `agrocare_nosql`

4. **Change Before Production**
   - PostgreSQL password
   - JWT secret key
   - CORS allowed origins
   - Database usernames

5. **Backup Regularly**
   - PostgreSQL: `pg_dump`
   - MongoDB: `mongodump`

---

## 🆘 EMERGENCY RESET

If something goes wrong and you need to start fresh:

```powershell
# Stop all services
Stop-Service postgresql-x64-15
Stop-Service MongoDB

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start services again
Start-Service postgresql-x64-15
Start-Service MongoDB

# Run setup script
cd c:\Users\USER\Desktop\agrocare\database
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

---

**Last Updated**: December 2024
**Status**: Production Ready
