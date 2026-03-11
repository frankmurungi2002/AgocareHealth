# 🗄️ AGROCARE DATABASE SETUP

Complete database initialization scripts for PostgreSQL and MongoDB.

## 📁 FILES IN THIS FOLDER

### 🚀 Setup Scripts
- **setup-databases.ps1** - PowerShell automation script (Recommended)
- **setup-databases.bat** - Windows batch file (Alternative)
- **init-postgresql.sql** - PostgreSQL database schema
- **init-mongodb.js** - MongoDB collections and indexes

### 📖 Documentation
- **DATABASE_SETUP_GUIDE.md** - Complete setup instructions
- **QUICK_REFERENCE.md** - Quick command reference
- **README.md** - This file

---

## ⚡ QUICK START (30 SECONDS)

### Option 1: PowerShell (Recommended)
```powershell
cd c:\Users\USER\Desktop\agrocare\database
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

### Option 2: Batch File
```cmd
cd c:\Users\USER\Desktop\agrocare\database
setup-databases.bat
```

### Option 3: Manual (See DATABASE_SETUP_GUIDE.md)

---

## 📋 WHAT GETS CREATED

### PostgreSQL Database (agrocare_db)
✅ 5 tables:
- users (user accounts)
- doctor_profiles (doctor information)
- questions (Q&A system)
- medical_centers (facility directory)
- appointments (appointment bookings)

✅ Indexes for optimal performance
✅ Sample data for testing
✅ Foreign key relationships

### MongoDB Database (agrocare_nosql)
✅ 4 collections:
- answers (flexible answer documents)
- comments (answer comments)
- activity_logs (user action tracking)
- reports (content moderation)

✅ Indexes for fast queries
✅ Document validation
✅ Sample data for testing

---

## 🔍 VERIFICATION

### Check PostgreSQL
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d agrocare_db -c "SELECT COUNT(*) FROM users;"
# Should return: 4 (sample users)
```

### Check MongoDB
```powershell
mongosh --eval "use agrocare_nosql; db.answers.countDocuments();"
# Should return: 1 (sample answer)
```

### Check Backend Connection
```powershell
curl http://localhost:8080/api/health
# Should return: {"status":"UP",...}
```

---

## 🔐 DEFAULT CREDENTIALS

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: agrocare_db
- **Username**: postgres
- **Password**: (set during installation)

### MongoDB
- **Host**: localhost
- **Port**: 27017
- **Database**: agrocare_nosql
- **Authentication**: None (default)

### Test User (PostgreSQL)
- **Username**: patient_francis
- **Email**: francis@example.com
- **Password**: (from database)

---

## 📊 DATABASE SCHEMA

### SQL Tables (PostgreSQL)

#### users
```
id (PRIMARY KEY)
├─ username (UNIQUE)
├─ email (UNIQUE)
├─ password (hashed)
├─ name
├─ role (PATIENT, DOCTOR, ADMIN, MODERATOR, HEALTH_WORKER)
├─ profile_picture
├─ bio
├─ is_active (BOOLEAN)
├─ is_verified (BOOLEAN)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

#### doctor_profiles
```
id (PRIMARY KEY)
├─ user_id (FOREIGN KEY → users.id)
├─ specialization
├─ license_number
├─ medical_certificate
├─ hospital_affiliation
├─ years_of_experience
├─ rating (0.0-5.0)
├─ total_consultations
├─ is_available (BOOLEAN)
├─ consultation_fee
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

#### questions
```
id (PRIMARY KEY)
├─ title
├─ content (TEXT)
├─ author_id (FOREIGN KEY → users.id)
├─ category (PEDIATRICS, PREGNANCY, INFECTIOUS, etc.)
├─ upvotes
├─ answer_count
├─ view_count
├─ is_resolved (BOOLEAN)
├─ is_moderated (BOOLEAN)
├─ moderation_status (PENDING, APPROVED, REJECTED)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

#### medical_centers
```
id (PRIMARY KEY)
├─ name
├─ description (TEXT)
├─ address
├─ city
├─ district
├─ phone_number
├─ email_address
├─ website
├─ image_url
├─ latitude/longitude (for location search)
├─ operating_hours
├─ services
├─ rating
├─ review_count
├─ is_verified (BOOLEAN)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

#### appointments
```
id (PRIMARY KEY)
├─ patient_id (FOREIGN KEY → users.id)
├─ doctor_id (FOREIGN KEY → users.id)
├─ appointment_date (TIMESTAMP)
├─ duration_minutes (default: 30)
├─ status (SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
├─ reason (TEXT)
├─ notes (TEXT)
├─ created_at (TIMESTAMP)
└─ updated_at (TIMESTAMP)
```

### NoSQL Collections (MongoDB)

#### answers
```json
{
  "_id": ObjectId,
  "questionId": Long,
  "authorId": Long,
  "authorName": String,
  "authorRole": String,
  "content": String,
  "upvotes": Integer,
  "downvotes": Integer,
  "isAccepted": Boolean,
  "isModerated": Boolean,
  "moderationStatus": String,
  "tags": [String],
  "helpfulCount": Integer,
  "comments": [Comment],
  "createdAt": Date,
  "updatedAt": Date
}
```

#### comments
```json
{
  "_id": ObjectId,
  "answerId": Long,
  "authorId": Long,
  "authorName": String,
  "content": String,
  "upvotes": Integer,
  "createdAt": Date,
  "updatedAt": Date,
  "isEdited": Boolean
}
```

#### activity_logs
```json
{
  "_id": ObjectId,
  "userId": Long,
  "username": String,
  "actionType": String,
  "actionTarget": String,
  "targetType": String,
  "targetId": Long,
  "ipAddress": String,
  "userAgent": String,
  "timestamp": Date,
  "isSuccessful": Boolean,
  "errorMessage": String,
  "status": String
}
```

#### reports
```json
{
  "_id": ObjectId,
  "reporterId": Long,
  "reporterUsername": String,
  "contentType": String,
  "contentId": Long,
  "reason": String,
  "description": String,
  "status": String,
  "resolution": String,
  "moderatorId": Long,
  "createdAt": Date,
  "resolvedAt": Date,
  "priority": Integer
}
```

---

## 🐛 TROUBLESHOOTING

### PostgreSQL Connection Error
```
Error: "psql: could not translate host name"
```
**Solution**: Start PostgreSQL service or check installation

### MongoDB Connection Error
```
Error: "MongoNetworkError: connect ECONNREFUSED"
```
**Solution**: Start MongoDB service or check installation

### Table Already Exists
```
Error: "relation already exists"
```
**Solution**: Drop and recreate database (see QUICK_REFERENCE.md)

### Permission Denied
```
Error: "permission denied"
```
**Solution**: Run PowerShell as Administrator

### Database Not Found
```
Error: "database does not exist"
```
**Solution**: Run `CREATE DATABASE agrocare_db;` first

---

## 🔄 COMMON OPERATIONS

### Backup Databases

**PostgreSQL**:
```powershell
$env:PGPASSWORD = "postgres"
pg_dump -h localhost -U postgres agrocare_db > backup.sql
```

**MongoDB**:
```powershell
mongodump --db agrocare_nosql --out ./backup
```

### Restore Databases

**PostgreSQL**:
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres agrocare_db < backup.sql
```

**MongoDB**:
```powershell
mongorestore --db agrocare_nosql ./backup/agrocare_nosql
```

### Reset Databases

See `QUICK_REFERENCE.md` for complete reset procedures

---

## 📚 DOCUMENTATION

1. **DATABASE_SETUP_GUIDE.md**
   - Detailed setup for both databases
   - Step-by-step instructions
   - Troubleshooting guide

2. **QUICK_REFERENCE.md**
   - Quick command reference
   - Common operations
   - Emergency procedures

3. This **README.md**
   - Overview and quick start
   - File descriptions
   - Schema reference

---

## ✅ CHECKLIST

After running the setup scripts:

- [ ] PostgreSQL is installed and running
- [ ] MongoDB is installed and running
- [ ] Database `agrocare_db` exists in PostgreSQL
- [ ] Database `agrocare_nosql` exists in MongoDB
- [ ] All 5 PostgreSQL tables created
- [ ] All 4 MongoDB collections created
- [ ] Sample data inserted
- [ ] Indexes created for performance
- [ ] Backend can connect to both databases
- [ ] API health endpoint returns "UP" status

---

## 🚀 NEXT STEPS

1. **Run setup scripts**
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-databases.ps1
   ```

2. **Build backend**
   ```powershell
   cd ../backend
   mvn clean install
   ```

3. **Start backend**
   ```powershell
   mvn spring-boot:run
   ```

4. **Test API**
   ```powershell
   curl http://localhost:8080/api/health
   ```

5. **Test frontend**
   - Open: `file:///c:\Users\USER\Desktop\agrocare\html\Login.html`
   - Login: `patient_francis`

---

## 📞 SUPPORT RESOURCES

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb)
- [JJWT (JWT Library)](https://github.com/jwtk/jjwt)

---

## 📝 FILE SIZES

- **init-postgresql.sql** (~5 KB) - PostgreSQL schema
- **init-mongodb.js** (~4 KB) - MongoDB schema
- **setup-databases.ps1** (~6 KB) - PowerShell automation
- **setup-databases.bat** (~3 KB) - Batch automation
- **DATABASE_SETUP_GUIDE.md** (~15 KB) - Complete guide
- **QUICK_REFERENCE.md** (~10 KB) - Command reference

**Total**: ~43 KB of database setup files

---

## ⚠️ IMPORTANT NOTES

1. **PostgreSQL Password**
   - Set during installation
   - Cannot be recovered if forgotten
   - Must match application.properties

2. **MongoDB Authentication**
   - Not enabled by default
   - Enable for production deployment
   - See DATABASE_SETUP_GUIDE.md for secure setup

3. **Sample Data**
   - Includes 4 test users
   - Includes 2 sample questions
   - Includes 1 sample doctor profile
   - Includes 1 sample medical center

4. **Change Before Production**
   - PostgreSQL password
   - JWT secret key (in application.properties)
   - CORS allowed origins
   - Enable MongoDB authentication

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: ✅ Production Ready  
**License**: MIT

---

**Need help?** Check `DATABASE_SETUP_GUIDE.md` for detailed instructions!
