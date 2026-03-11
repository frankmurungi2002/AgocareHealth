# 🗄️ AGROCARE DATABASE FILES SUMMARY

## 📍 LOCATION
```
c:\Users\USER\Desktop\agrocare\database\
```

## 📋 ALL FILES IN DATABASE FOLDER

### 🚀 SETUP SCRIPTS (Run these first!)

| File | Type | Purpose | How to Run |
|------|------|---------|-----------|
| **setup-databases.ps1** | PowerShell | Automated setup for PostgreSQL & MongoDB | `powershell -ExecutionPolicy Bypass -File setup-databases.ps1` |
| **setup-databases.bat** | Batch | Windows batch alternative | `setup-databases.bat` |

### 📊 DATABASE SCHEMA FILES

| File | Database | Size | Contains |
|------|----------|------|----------|
| **init-postgresql.sql** | PostgreSQL | ~5 KB | 5 tables, 10+ indexes, sample data |
| **init-mongodb.js** | MongoDB | ~4 KB | 4 collections, 8+ indexes, sample data |
| **test-data.sql** | PostgreSQL | ~3 KB | Additional test users, questions, centers |

### 📖 DOCUMENTATION FILES

| File | Purpose | Read Time |
|------|---------|-----------|
| **START_HERE.md** | 👈 **START HERE** | 5 min |
| **README.md** | Overview of database setup | 10 min |
| **DATABASE_SETUP_GUIDE.md** | Complete setup guide | 20 min |
| **QUICK_REFERENCE.md** | Quick command reference | 5 min |
| **THIS FILE** | Summary of all files | 2 min |

---

## 🎯 QUICK START (Copy/Paste)

### For Windows PowerShell:
```powershell
cd c:\Users\USER\Desktop\agrocare\database
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

**Expected Output**:
```
======================================
AGROCARE DATABASE SETUP
======================================
[1/4] Checking prerequisites...
✓ PostgreSQL found
✓ MongoDB found

[2/4] Setting up PostgreSQL database...
✓ Database created/verified
✓ Tables and indexes created

[3/4] Setting up MongoDB database...
✓ MongoDB collections and indexes created

[4/4] Updating application configuration...
✓ Configuration verified

======================================
DATABASE SETUP COMPLETE!
======================================
```

---

## 📊 WHAT GETS CREATED

### PostgreSQL Database Structure
```
agrocare_db/
├── users (9 records)
│   ├── admin_user
│   ├── doctor_smith
│   ├── doctor_sarah
│   ├── doctor_kumar
│   ├── patient_francis
│   ├── patient_emma
│   ├── patient_mike
│   ├── moderator_alice
│   └── health_worker_1
│
├── doctor_profiles (3 records)
│   ├── Pediatrics (Dr. Smith)
│   ├── Pregnancy (Dr. Sarah)
│   └── Infectious Disease (Dr. Kumar)
│
├── questions (9 records)
│   ├── Pediatrics (2)
│   ├── Pregnancy (3)
│   ├── Infectious Disease (2)
│   ├── Mental Health (1)
│   └── Sexual Health (1)
│
├── medical_centers (6 records)
│   ├── Colombo Medical Center (verified)
│   ├── Kandy Health Hospital (verified)
│   ├── Galle District Medical Center (verified)
│   ├── Matara Wellness Clinic (not verified)
│   ├── Jaffna Teaching Hospital (verified)
│   └── Negombo Clinic (verified)
│
└── appointments (6 records)
    ├── 4 completed
    └── 2 scheduled
```

### MongoDB Database Structure
```
agrocare_nosql/
├── answers (1+ documents)
│   └── Sample answers with comments
│
├── comments (0+ documents)
│   └── Answer comments
│
├── activity_logs (2+ documents)
│   └── User action tracking
│
└── reports (0+ documents)
    └── Content moderation queue
```

---

## 🔐 TEST CREDENTIALS

### Admin Account
```
Username: admin_user
Email: admin@agrocare.com
Password: password123
Role: ADMIN
```

### Doctor Accounts
```
Username: doctor_smith
Email: dr.smith@agrocare.com
Specialization: Pediatrics
Rating: 4.8/5

Username: doctor_sarah
Email: dr.sarah@agrocare.com
Specialization: Pregnancy
Rating: 4.9/5

Username: doctor_kumar
Email: dr.kumar@agrocare.com
Specialization: Infectious Disease
Rating: 4.7/5
```

### Patient Accounts
```
Username: patient_francis
Email: francis@example.com
Password: password123

Username: patient_emma
Email: emma@example.com
Password: password123

Username: patient_mike
Email: mike@example.com
Password: password123
```

---

## 📋 FILE DETAILS

### setup-databases.ps1
**Type**: PowerShell Script  
**Size**: ~6 KB  
**Functions**:
- ✅ Check PostgreSQL installation
- ✅ Check MongoDB installation
- ✅ Create databases
- ✅ Run initialization scripts
- ✅ Insert sample data
- ✅ Verify setup

**Run**:
```powershell
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

### setup-databases.bat
**Type**: Windows Batch Script  
**Size**: ~3 KB  
**Functions**:
- ✅ Check prerequisites
- ✅ Create databases
- ✅ Run SQL/JS files
- ✅ Simple interface

**Run**:
```cmd
setup-databases.bat
```

### init-postgresql.sql
**Type**: SQL Script  
**Size**: ~5 KB  
**Contains**:
- 5 CREATE TABLE statements
- 10 CREATE INDEX statements
- 4 INSERT INTO users statements
- 1 INSERT INTO doctor_profiles statement
- 2 INSERT INTO questions statements
- 1 INSERT INTO medical_centers statement
- Comments and documentation

**Tables Created**:
- users
- doctor_profiles
- questions
- medical_centers
- appointments

### init-mongodb.js
**Type**: MongoDB JavaScript  
**Size**: ~4 KB  
**Contains**:
- 4 db.createCollection() statements
- Collection validation rules
- 8 createIndex() statements
- Sample document insertions
- Verification queries

**Collections Created**:
- answers
- comments
- activity_logs
- reports

### test-data.sql
**Type**: SQL Script  
**Size**: ~3 KB  
**Contains**:
- 5 additional user insertions
- 2 additional doctor profiles
- 8 additional questions
- 6 additional medical centers
- 6 additional appointments
- 8 SELECT queries for verification

**Use**: Run after init-postgresql.sql for more test data

### START_HERE.md
**Purpose**: Quick start guide  
**Sections**:
- What You Have
- Fastest Way to Run
- What Gets Created
- Next Steps
- Troubleshooting

### README.md
**Purpose**: Overview and file descriptions  
**Sections**:
- Files in this folder
- Quick start (30 seconds)
- What gets created
- Database schema
- Verification
- Common operations

### DATABASE_SETUP_GUIDE.md
**Purpose**: Complete setup instructions  
**Sections**:
- Quick start (3 options)
- Database architecture
- Prerequisite installation
- Manual setup steps
- Database credentials
- Tables/collections reference
- Testing procedures
- Configuration updates
- Troubleshooting
- Next steps
- Support resources

### QUICK_REFERENCE.md
**Purpose**: Command reference  
**Sections**:
- PostgreSQL commands
- MongoDB commands
- Verification procedures
- Common operations
- Backup/restore
- Reset procedures
- Password reference
- Emergency reset

---

## ⚡ EXECUTION FLOW

### Option 1: Automated (Recommended)
```
User runs: setup-databases.ps1
    ↓
Script checks prerequisites
    ↓
Script creates PostgreSQL database
    ↓
Script runs init-postgresql.sql
    ↓
Script creates MongoDB database
    ↓
Script runs init-mongodb.js
    ↓
✅ Databases ready!
```

### Option 2: Manual Steps
```
1. Create PostgreSQL database
   $ psql -U postgres -c "CREATE DATABASE agrocare_db;"

2. Run PostgreSQL schema
   $ psql -U postgres -d agrocare_db -f init-postgresql.sql

3. Initialize MongoDB
   $ mongosh < init-mongodb.js

4. (Optional) Add test data
   $ psql -U postgres -d agrocare_db -f test-data.sql

✅ Databases ready!
```

---

## 🧪 VERIFICATION COMMANDS

### Quick Health Check
```powershell
# Check PostgreSQL
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d agrocare_db -c "SELECT COUNT(*) FROM users;"

# Check MongoDB
mongosh --eval "use agrocare_nosql; db.answers.countDocuments();"

# Check Backend
curl http://localhost:8080/api/health
```

**Expected Results**:
- PostgreSQL: `4` (or more with test-data.sql)
- MongoDB: `1` (or more with test-data.sql)
- Backend: `{"status":"UP",...}`

---

## 📈 FILE SIZE REFERENCE

| File | Size | Purpose |
|------|------|---------|
| setup-databases.ps1 | 6 KB | PowerShell automation |
| setup-databases.bat | 3 KB | Batch automation |
| init-postgresql.sql | 5 KB | PostgreSQL schema |
| init-mongodb.js | 4 KB | MongoDB schema |
| test-data.sql | 3 KB | Extra test data |
| DATABASE_SETUP_GUIDE.md | 15 KB | Complete guide |
| QUICK_REFERENCE.md | 10 KB | Command reference |
| README.md | 12 KB | Overview |
| START_HERE.md | 8 KB | Quick start |
| **TOTAL** | **~66 KB** | **All database files** |

---

## 🎓 USAGE GUIDE

### I'm a Windows User
1. Read: **START_HERE.md**
2. Run: `setup-databases.ps1`
3. Check: **DATABASE_SETUP_GUIDE.md** if issues

### I Want to Manually Set Up
1. Read: **DATABASE_SETUP_GUIDE.md**
2. Follow "Manual Database Setup" section
3. Use: **QUICK_REFERENCE.md** for commands

### I Need Quick Commands
1. Check: **QUICK_REFERENCE.md**
2. Copy the command you need
3. Paste and run

### I'm Having Issues
1. Check: **DATABASE_SETUP_GUIDE.md** → Troubleshooting
2. Try: Emergency reset in **QUICK_REFERENCE.md**
3. Read: Specific section in **README.md**

---

## 🔒 SECURITY CHECKLIST

- [ ] PostgreSQL password set securely
- [ ] MongoDB authentication enabled (production)
- [ ] JWT secret changed in application.properties
- [ ] CORS origins updated for production
- [ ] Firewall allows only needed ports
- [ ] Database backups configured
- [ ] Unused accounts removed
- [ ] Database logs monitored

---

## 📞 QUICK HELP

### Setup Won't Run?
→ Check if PostgreSQL and MongoDB are installed  
→ See DATABASE_SETUP_GUIDE.md > Prerequisites

### Password Issues?
→ Check QUICK_REFERENCE.md > Password Reference  
→ Remember: Use `$env:PGPASSWORD = "..."`

### Need Test Data?
→ Run: `psql -U postgres -d agrocare_db -f test-data.sql`

### Want to Reset Everything?
→ See QUICK_REFERENCE.md > Reset Everything

### Database Won't Connect?
→ Check: Are services running?  
→ Check: Correct ports (5432, 27017)?  
→ Check: Credentials in application.properties?

---

## 🚀 READY TO START?

### The 3-Step Setup:

**Step 1**: Open PowerShell
```powershell
cd c:\Users\USER\Desktop\agrocare\database
```

**Step 2**: Run setup
```powershell
powershell -ExecutionPolicy Bypass -File setup-databases.ps1
```

**Step 3**: Wait for completion ✅

---

**That's it! You're ready to go!** 🎉

For detailed information, see the documentation files above.

---

**Version**: 1.0.0  
**Date**: December 2024  
**Status**: ✅ Production Ready
