# AGROCARE DATABASE SETUP GUIDE

## 🎯 QUICK START

### Option 1: Automated Setup (Recommended for Windows)
```powershell
cd c:\Users\USER\Desktop\agrocare\database
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

### Option 2: Manual Setup
Follow the sections below for your specific database.

---

## 📊 DATABASE ARCHITECTURE

### PostgreSQL (SQL Database)
- **Purpose**: Structured user data, transactions, relationships
- **Host**: localhost
- **Port**: 5432
- **Database**: agrocare_db
- **Username**: postgres (default)
- **Tables Created**:
  - users (core user accounts)
  - doctor_profiles (doctor information)
  - questions (Q&A questions)
  - medical_centers (medical facility directory)
  - appointments (appointment bookings)

### MongoDB (NoSQL Database)
- **Purpose**: Flexible content, activity logs, comments, reports
- **Host**: localhost
- **Port**: 27017
- **Database**: agrocare_nosql
- **Collections Created**:
  - answers (flexible answer documents)
  - comments (answer comments)
  - activity_logs (user action tracking)
  - reports (content moderation)

---

## 🔧 PREREQUISITE INSTALLATION

### PostgreSQL Installation

#### Windows:
1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for 'postgres' user
4. Accept all default settings
5. Complete installation

**Verify Installation**:
```powershell
psql --version
```

#### Start PostgreSQL Service (Windows):
- Service should auto-start
- Or: Services → PostgreSQL → Start

---

### MongoDB Installation

#### Windows:
1. Download from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. Complete installation

**Verify Installation**:
```powershell
mongosh --version
```

#### Start MongoDB Service (Windows):
- Service should auto-start
- Or: Services → MongoDB Server → Start

---

## 📝 MANUAL DATABASE SETUP

### Step 1: Create PostgreSQL Database

Open PowerShell and run:

```powershell
# Connect to PostgreSQL
$env:PGPASSWORD = "your_postgres_password"
psql -h localhost -U postgres

# In psql prompt, run:
CREATE DATABASE agrocare_db;
\q
```

### Step 2: Initialize PostgreSQL Schema

```powershell
# Run the initialization script
$env:PGPASSWORD = "your_postgres_password"
psql -h localhost -U postgres -d agrocare_db -f "C:\Users\USER\Desktop\agrocare\database\init-postgresql.sql"
```

**Expected Output**:
```
CREATE TABLE
CREATE INDEX
CREATE TABLE
CREATE INDEX
...
INSERT 0 1
```

### Step 3: Verify PostgreSQL Setup

```powershell
# Connect and check tables
$env:PGPASSWORD = "your_postgres_password"
psql -h localhost -U postgres -d agrocare_db

# In psql prompt:
\dt                    -- List all tables
SELECT COUNT(*) FROM users;  -- Should show 4 sample users
\q
```

### Step 4: Initialize MongoDB

```powershell
# Connect and run initialization
mongosh < "C:\Users\USER\Desktop\agrocare\database\init-mongodb.js"
```

**Expected Output**:
```
{ ok: 1 }
{ ok: 1 }
...
✓ MongoDB initialization complete!
```

### Step 5: Verify MongoDB Setup

```powershell
# Connect and check collections
mongosh

# In mongosh prompt:
use agrocare_nosql;
db.getCollectionNames();     -- Should show 4 collections
db.answers.countDocuments(); -- Should show sample answers
exit
```

---

## 🔐 DATABASE CREDENTIALS

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: agrocare_db
- **Username**: postgres
- **Password**: (what you set during installation)

### MongoDB
- **Connection String**: mongodb://localhost:27017/agrocare_nosql
- **Host**: localhost
- **Port**: 27017
- **Database**: agrocare_nosql
- **No Authentication** (default)

---

## 📋 TABLES AND COLLECTIONS REFERENCE

### PostgreSQL Tables

#### users
```sql
Columns: id, username, email, password, name, role, profile_picture, bio, is_active, is_verified, created_at, updated_at
Indexes: username, email, role
Sample Data: admin_user, doctor_smith, patient_francis, moderator_alice
```

#### doctor_profiles
```sql
Columns: id, user_id, specialization, license_number, medical_certificate, hospital_affiliation, years_of_experience, rating, total_consultations, is_available, consultation_fee, created_at, updated_at
Foreign Key: user_id → users.id
Indexes: specialization, is_available, rating
Sample Data: Doctor James Smith (Pediatrics specialist)
```

#### questions
```sql
Columns: id, title, content, author_id, category, upvotes, answer_count, view_count, is_resolved, is_moderated, moderation_status, created_at, updated_at
Foreign Key: author_id → users.id
Categories: PEDIATRICS, PREGNANCY, INFECTIOUS, SEXUAL_HEALTH, MENTAL_HEALTH, GENERAL
Indexes: category, author_id, is_resolved, moderation_status
Sample Data: 2 questions (fever treatment, pregnancy health)
```

#### medical_centers
```sql
Columns: id, name, description, address, city, district, phone_number, email_address, website, image_url, latitude, longitude, operating_hours, services, rating, review_count, is_verified, created_at, updated_at
No Foreign Keys (standalone)
Indexes: city, district, is_verified, rating
Sample Data: Central Medical Hospital (Colombo)
```

#### appointments
```sql
Columns: id, patient_id, doctor_id, appointment_date, duration_minutes, status, reason, notes, created_at, updated_at
Foreign Keys: patient_id → users.id, doctor_id → users.id
Status Values: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
Indexes: patient_id, doctor_id, appointment_date, status
Sample Data: (none - will be created during operation)
```

### MongoDB Collections

#### answers
```json
Fields: _id, questionId, authorId, authorName, authorRole, content, upvotes, downvotes, isAccepted, isModerated, moderationStatus, tags, helpfulCount, comments, createdAt, updatedAt
Indexes: questionId, authorId, isAccepted, createdAt
```

#### comments
```json
Fields: _id, answerId, authorId, authorName, content, upvotes, createdAt, updatedAt, isEdited
Indexes: answerId, authorId, createdAt
```

#### activity_logs
```json
Fields: _id, userId, username, actionType, actionTarget, targetType, targetId, ipAddress, userAgent, timestamp, isSuccessful, errorMessage, status
Indexes: userId, actionType, timestamp, status
```

#### reports
```json
Fields: _id, reporterId, reporterUsername, contentType, contentId, reason, description, status, resolution, moderatorId, createdAt, resolvedAt, priority
Indexes: reporterId, status, contentId, priority
```

---

## 🧪 TESTING THE DATABASE SETUP

### Test PostgreSQL Connection

```powershell
# From command line
$env:PGPASSWORD = "your_postgres_password"
psql -h localhost -U postgres -d agrocare_db -c "SELECT * FROM users LIMIT 1;"
```

Expected Output:
```
 id |  username   |       email        | ... | role    | ...
----+-------------+--------------------+-----+---------+----
  1 | admin_user  | admin@agrocare.com | ... | ADMIN   | ...
```

### Test MongoDB Connection

```powershell
# From command line
mongosh --eval "use agrocare_nosql; db.answers.findOne()"
```

Expected Output:
```
{
  _id: ObjectId("..."),
  questionId: 1,
  authorId: 2,
  authorName: 'Dr. James Smith',
  ...
}
```

### Test Backend Connection to Databases

After starting the backend:

```powershell
# Test if backend can connect to PostgreSQL
curl "http://localhost:8080/api/auth/users/DOCTOR"

# Test if backend can connect to MongoDB
curl "http://localhost:8080/api/answers/question/1"
```

---

## 🔄 UPDATING APPLICATION.PROPERTIES

Edit: `backend/src/main/resources/application.properties`

```properties
# PostgreSQL Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/agrocare_db
spring.datasource.username=postgres
spring.datasource.password=your_password_here

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/agrocare_nosql

# JWT Configuration
jwt.secret=your_super_secret_key_change_this_in_production
jwt.expiration=86400000

# CORS Configuration
cors.allowed-origins=http://localhost,file://,http://localhost:3000

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
```

**⚠️ IMPORTANT**: Change `jwt.secret` to a strong random string before production!

---

## 🆘 TROUBLESHOOTING

### PostgreSQL Connection Failed

**Error**: `psql: could not translate host name "localhost" to address`

**Solution**:
1. Verify PostgreSQL is running: `Services → PostgreSQL`
2. Check if listening on port 5432: `netstat -an | findstr 5432`
3. Restart PostgreSQL service

### MongoDB Connection Failed

**Error**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
1. Verify MongoDB is running: `Services → MongoDB Server`
2. Check if listening on port 27017: `netstat -an | findstr 27017`
3. Restart MongoDB service

### "Database agrocare_db does not exist"

**Solution**:
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -c "CREATE DATABASE agrocare_db;"
```

### Tables Not Created

**Solution**:
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d agrocare_db -f "init-postgresql.sql"
```

### Backend Can't Connect to Database

**Solution**:
1. Verify databases are running
2. Check application.properties credentials
3. Check firewall not blocking ports 5432, 27017
4. Verify JPA/MongoDB dependencies in pom.xml

---

## 🚀 NEXT STEPS

1. **Verify both databases are running**:
   ```powershell
   psql -h localhost -U postgres -c "SELECT version();"
   mongosh --eval "db.version()"
   ```

2. **Update application.properties** with your credentials

3. **Build the backend**:
   ```powershell
   cd backend
   mvn clean install
   ```

4. **Start the backend**:
   ```powershell
   mvn spring-boot:run
   ```

5. **Test the API**:
   ```powershell
   curl http://localhost:8080/api/health
   ```

6. **Test frontend**:
   - Open: `file:///c:\Users\USER\Desktop\agrocare\html\index.html`
   - Login with: `patient_francis` / `pass123`

---

## 📞 SUPPORT

- PostgreSQL Docs: https://www.postgresql.org/docs/
- MongoDB Docs: https://docs.mongodb.com/
- Spring Data JPA: https://spring.io/projects/spring-data-jpa
- Spring Data MongoDB: https://spring.io/projects/spring-data-mongodb

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Ready for Production
