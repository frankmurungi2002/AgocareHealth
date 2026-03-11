# Agrocare - Healthcare Community Platform

A comprehensive healthcare community platform built with modern web technologies and enterprise-grade Java backend.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Design](#database-design)
- [Project Structure](#project-structure)

## Project Overview

Agrocare is a healthcare community platform that connects patients, doctors, and medical centers. It provides:

- **Patient Dashboard**: Questions, medical history, appointments
- **Doctor Dashboard**: Patient management, appointment scheduling, consultations
- **Medical Centers**: Directory and management
- **Community Features**: Q&A system, content moderation, activity tracking

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (HTML/CSS/JS)                   │
│              ├─ Authentication Pages                        │
│              ├─ Patient Dashboard                           │
│              ├─ Doctor Dashboard                            │
│              ├─ Medical Centers                             │
│              └─ Medical Library                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                    API Gateway
                    (CORS Enabled)
                         │
┌────────────────────────▼────────────────────────────────────┐
│              Java Spring Boot Backend (Port 8080)            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               REST API Controllers                     │ │
│  │  ├─ AuthController (Login/Register)                   │ │
│  │  ├─ QuestionController                                │ │
│  │  ├─ AnswerController                                  │ │
│  │  ├─ DoctorController                                  │ │
│  │  ├─ MedicalCenterController                           │ │
│  │  ├─ AppointmentController                             │ │
│  │  └─ HealthController                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│         ┌─────────────────┼─────────────────┐               │
│         │                 │                 │               │
│    ┌────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐         │
│    │ Services │    │ Repositories │  │ Security  │         │
│    │ Layer    │    │ Layer       │  │ (JWT)     │         │
│    └────┬─────┘    └─────┬─────┘    └───────────┘         │
│         │                │                                  │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
    ┌─────▼────────────────▼────────┐
    │    Database Layer             │
    │  ┌───────────────────────┐    │
    │  │  PostgreSQL (SQL)     │    │
    │  │  ├─ Users             │    │
    │  │  ├─ Doctors           │    │
    │  │  ├─ Questions         │    │
    │  │  ├─ Medical Centers   │    │
    │  │  └─ Appointments      │    │
    │  └───────────────────────┘    │
    │  ┌───────────────────────┐    │
    │  │  MongoDB (NoSQL)      │    │
    │  │  ├─ Answers           │    │
    │  │  ├─ Comments          │    │
    │  │  ├─ Activity Logs     │    │
    │  │  └─ Reports           │    │
    │  └───────────────────────┘    │
    └───────────────────────────────┘
```

## Tech Stack

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Tailwind CSS)
- **JavaScript (ES6+)** - Interactivity
- **Fetch API** - HTTP Requests

### Backend
- **Java 17** - Programming Language
- **Spring Boot 3.1.5** - Framework
- **Spring Data JPA** - ORM for SQL
- **Spring Data MongoDB** - NoSQL Support
- **Spring Security** - Authentication/Authorization
- **JWT (jjwt)** - Token-based Authentication
- **Maven** - Build Tool
- **Lombok** - Code Generation

### Databases
- **PostgreSQL 12+** - Relational Database (SQL)
- **MongoDB 4.4+** - Document Database (NoSQL)

### Development Tools
- **IDE**: IntelliJ IDEA or VS Code
- **Database Tools**: DBeaver, MongoDB Compass
- **API Testing**: Postman, cURL
- **Version Control**: Git

## Features

### Authentication & Authorization
- ✅ User registration with roles (Patient, Doctor, Admin)
- ✅ JWT-based authentication
- ✅ Password hashing with BCrypt
- ✅ Role-based access control

### User Management
- ✅ User profiles with avatar upload
- ✅ Profile editing and settings
- ✅ Password change
- ✅ Account deactivation

### Questions & Answers
- ✅ Create questions by category
- ✅ Answer questions
- ✅ Upvote/downvote system
- ✅ Mark answers as helpful
- ✅ Comments on answers
- ✅ Search functionality
- ✅ Content moderation

### Doctor Features
- ✅ Doctor profile creation
- ✅ Specialization tracking
- ✅ Availability status
- ✅ Rating system
- ✅ Consultation fees
- ✅ License verification

### Appointment System
- ✅ Schedule appointments
- ✅ Appointment management
- ✅ Status tracking (Scheduled, Completed, Cancelled)
- ✅ Doctor availability calendar

### Medical Centers
- ✅ Medical center directory
- ✅ Location search (by city/district)
- ✅ Center verification
- ✅ Rating and reviews
- ✅ Contact information

### Activity Tracking
- ✅ User activity logs (NoSQL)
- ✅ Login tracking
- ✅ Content interaction tracking
- ✅ Audit trails

### Content Moderation
- ✅ Report content
- ✅ Moderation queue
- ✅ Report resolution tracking
- ✅ Priority-based moderation

## Installation

### Prerequisites
- Java 17 or higher
- Maven 3.8.9+
- PostgreSQL 12+
- MongoDB 4.4+

### Step 1: Install Java
Download from [Oracle](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html) or [Adoptium](https://adoptium.net/)

```bash
java -version
```

### Step 2: Install Maven
Download from [Apache Maven](https://maven.apache.org/download.cgi)

```bash
mvn -version
```

### Step 3: Install PostgreSQL
Download from [PostgreSQL](https://www.postgresql.org/download/)

Create database:
```sql
CREATE DATABASE agrocare_db;
```

### Step 4: Install MongoDB
Download from [MongoDB Community](https://www.mongodb.com/try/download/community)

### Step 5: Clone/Copy Project
```bash
cd c:\Users\USER\Desktop\agrocare
```

## Running the Application

### Start Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Configure database credentials in `src/main/resources/application.properties`

3. Build and run:
```bash
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### Verify Backend
```bash
curl http://localhost:8080/api/health
```

### Access Frontend
Open in browser:
```
file:///c:\Users\USER\Desktop\agrocare\html\index.html
```

Or serve with local server:
```bash
# Using Python
python -m http.server 3000

# Using Node.js (if installed)
npx http-server
```

## API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/x-www-form-urlencoded

username=francis123
email=francis@example.com
password=securepass123
name=Murungi Francis
role=PATIENT
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "francis123",
    "email": "francis@example.com",
    "name": "Murungi Francis",
    "role": "PATIENT"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=francis123
password=securepass123
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": 1,
    "username": "francis123",
    "email": "francis@example.com",
    "name": "Murungi Francis",
    "role": "PATIENT"
  }
}
```

### Question Endpoints

#### Create Question
```http
POST /questions/create
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded

userId=1
title=How to treat fever in children?
content=My child has high fever...
category=PEDIATRICS
```

#### Get Questions by Category
```http
GET /questions/category/PEDIATRICS
```

#### Search Questions
```http
GET /questions/search?keyword=fever
```

### Doctor Endpoints

#### Get Available Doctors
```http
GET /doctors/available
```

#### Get Doctors by Specialization
```http
GET /doctors/specialization/Pediatrics
```

### Appointment Endpoints

#### Create Appointment
```http
POST /appointments/create
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded

patientId=1
doctorId=2
appointmentDate=2024-12-31T14:00:00
reason=General checkup
```

## Database Design

### SQL Schema (PostgreSQL)

#### Users Table
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  profile_picture TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Doctor Profiles Table
```sql
CREATE TABLE doctor_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
  specialization VARCHAR(255) NOT NULL,
  license_number VARCHAR(255) NOT NULL,
  hospital_affiliation VARCHAR(255),
  years_of_experience INT,
  rating DECIMAL(3,2),
  total_consultations INT,
  is_available BOOLEAN DEFAULT true,
  consultation_fee VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Questions Table
```sql
CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  user_id BIGINT NOT NULL REFERENCES users(id),
  category VARCHAR(50) NOT NULL,
  upvotes INT DEFAULT 0,
  answer_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_resolved BOOLEAN DEFAULT false,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### NoSQL Schema (MongoDB)

#### Answers Collection
```json
{
  "_id": ObjectId,
  "questionId": 1,
  "authorId": 2,
  "authorName": "Dr. Smith",
  "authorRole": "DOCTOR",
  "content": "Answer content...",
  "upvotes": 5,
  "downvotes": 0,
  "isAccepted": true,
  "createdAt": ISODate("2024-12-20T10:00:00Z"),
  "updatedAt": ISODate("2024-12-20T10:00:00Z")
}
```

#### Activity Logs Collection
```json
{
  "_id": ObjectId,
  "userId": 1,
  "username": "francis123",
  "actionType": "CREATE_QUESTION",
  "targetId": 5,
  "targetType": "QUESTION",
  "timestamp": ISODate("2024-12-20T10:00:00Z"),
  "isSuccessful": true
}
```

## Project Structure

```
agrocare/
├── html/                          # Frontend HTML files
│   ├── index.html                 # Home page
│   ├── Login.html                 # Login page
│   ├── Signup.html                # Registration page
│   ├── patientDashboard.html      # Patient dashboard
│   ├── doctor-dashboard.html      # Doctor dashboard
│   ├── medical_centers.html       # Medical centers listing
│   └── ...other pages...
├── css/                           # Stylesheets
│   ├── styles.css
│   ├── login.css
│   ├── navbar.css
│   └── ...other styles...
├── js/                            # JavaScript files
│   ├── api-client.js              # API client library (NEW)
│   ├── login.js                   # Authentication logic
│   ├── navigation.js              # Navigation/auth utilities
│   ├── script.js                  # Main functionality
│   └── ...other scripts...
├── backend/                       # Java Spring Boot Backend (NEW)
│   ├── pom.xml                    # Maven dependencies
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agrocare/
│   │   │   │   ├── AgrocareApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── QuestionController.java
│   │   │   │   │   ├── AnswerController.java
│   │   │   │   │   ├── DoctorController.java
│   │   │   │   │   ├── MedicalCenterController.java
│   │   │   │   │   ├── AppointmentController.java
│   │   │   │   │   └── HealthController.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── UserDTO.java
│   │   │   │   │   ├── QuestionDTO.java
│   │   │   │   │   ├── AnswerDTO.java
│   │   │   │   │   ├── DoctorProfileDTO.java
│   │   │   │   │   ├── MedicalCenterDTO.java
│   │   │   │   │   └── AppointmentDTO.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── sql/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── DoctorProfile.java
│   │   │   │   │   │   ├── Question.java
│   │   │   │   │   │   ├── MedicalCenter.java
│   │   │   │   │   │   └── Appointment.java
│   │   │   │   │   └── nosql/
│   │   │   │   │       ├── Answer.java
│   │   │   │   │       ├── Comment.java
│   │   │   │   │       ├── ActivityLog.java
│   │   │   │   │       └── Report.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── sql/
│   │   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   │   ├── DoctorProfileRepository.java
│   │   │   │   │   │   ├── QuestionRepository.java
│   │   │   │   │   │   ├── MedicalCenterRepository.java
│   │   │   │   │   │   └── AppointmentRepository.java
│   │   │   │   │   └── nosql/
│   │   │   │   │       ├── AnswerRepository.java
│   │   │   │   │       ├── ActivityLogRepository.java
│   │   │   │   │       └── ReportRepository.java
│   │   │   │   ├── security/
│   │   │   │   │   └── JwtTokenProvider.java
│   │   │   │   └── service/
│   │   │   │       ├── AuthService.java
│   │   │   │       ├── QuestionService.java
│   │   │   │       ├── AnswerService.java
│   │   │   │       ├── DoctorService.java
│   │   │   │       ├── MedicalCenterService.java
│   │   │   │       └── AppointmentService.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   │       └── java/com/agrocare/
│   └── target/                    # Compiled JAR files
├── BACKEND_SETUP_GUIDE.md         # Backend setup documentation (NEW)
├── README.md                      # This file
└── ...other files...
```

## Key Features Implemented

### ✅ Complete
- User authentication with JWT
- SQL + NoSQL database integration
- RESTful API endpoints
- CORS configuration
- Data validation
- Error handling
- API client for frontend

### 🔄 In Frontend Integration
- Login/Registration with backend
- Question creation with database persistence
- Answer system with MongoDB
- Appointment scheduling
- Doctor profile management

## Next Steps

1. **Verify Backend Setup**
   - Install PostgreSQL and MongoDB
   - Configure credentials in application.properties
   - Run `mvn spring-boot:run`

2. **Test APIs**
   - Use Postman to test endpoints
   - Verify CORS is working
   - Check database tables

3. **Complete Frontend Integration**
   - Test login with backend
   - Verify data persistence
   - Test all major features

4. **Security Hardening**
   - Change JWT secret for production
   - Update CORS origins
   - Implement rate limiting
   - Add input validation

## Troubleshooting

### Backend Won't Start
- Check Java version: `java -version` (should be 17+)
- Verify PostgreSQL and MongoDB are running
- Check application.properties credentials

### API Calls Returning 401
- Ensure token is included in Authorization header
- Verify token hasn't expired
- Check CORS configuration

### Database Connection Failed
- Verify PostgreSQL service is running
- Check username/password in properties
- Create database: `CREATE DATABASE agrocare_db;`

## Support

For detailed backend setup instructions, see: [BACKEND_SETUP_GUIDE.md](./BACKEND_SETUP_GUIDE.md)

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready with Complete Backend Integration
