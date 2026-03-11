-- ============================================
-- AGROCARE POSTGRESQL DATABASE INITIALIZATION
-- ============================================
-- This script creates the complete database schema for the SQL database
-- Run this in PostgreSQL after creating the agrocare_db database

-- Create database if not exists
-- NOTE: Run this in the default 'postgres' database first
-- CREATE DATABASE agrocare_db;

-- Connect to agrocare_db before running the rest of this script

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'PATIENT',
    profile_picture VARCHAR(500),
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- DOCTOR_PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    medical_certificate VARCHAR(500),
    hospital_affiliation VARCHAR(200),
    years_of_experience INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_consultations INT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_doctor_specialization ON doctor_profiles(specialization);
CREATE INDEX idx_doctor_available ON doctor_profiles(is_available);
CREATE INDEX idx_doctor_rating ON doctor_profiles(rating);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    upvotes INT DEFAULT 0,
    answer_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    is_resolved BOOLEAN DEFAULT false,
    is_moderated BOOLEAN DEFAULT false,
    moderation_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_author ON questions(author_id);
CREATE INDEX idx_questions_resolved ON questions(is_resolved);
CREATE INDEX idx_questions_moderation ON questions(moderation_status);

-- ============================================
-- MEDICAL_CENTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_centers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(100),
    district VARCHAR(100),
    phone_number VARCHAR(20),
    email_address VARCHAR(100),
    website VARCHAR(200),
    image_url VARCHAR(500),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    operating_hours VARCHAR(255),
    services TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medical_centers_city ON medical_centers(city);
CREATE INDEX idx_medical_centers_district ON medical_centers(district);
CREATE INDEX idx_medical_centers_verified ON medical_centers(is_verified);
CREATE INDEX idx_medical_centers_rating ON medical_centers(rating);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 30,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================
-- SAMPLE DATA INSERTION (Optional)
-- ============================================

-- Insert sample users
INSERT INTO users (username, email, password, name, role, is_active, is_verified) 
VALUES 
    ('admin_user', 'admin@agrocare.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Admin User', 'ADMIN', true, true),
    ('doctor_smith', 'dr.smith@agrocare.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Dr. James Smith', 'DOCTOR', true, true),
    ('patient_francis', 'francis@example.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Murungi Francis', 'PATIENT', true, true),
    ('moderator_alice', 'alice@agrocare.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Alice Moderator', 'MODERATOR', true, true);

-- Insert sample doctor profile
INSERT INTO doctor_profiles (user_id, specialization, license_number, years_of_experience, is_available, rating)
VALUES (2, 'Pediatrics', 'LIC-12345-2024', 10, true, 4.8);

-- Insert sample questions
INSERT INTO questions (title, content, author_id, category, moderation_status)
VALUES 
    ('How to treat fever in children?', 'My child has high fever. What are the best home remedies?', 3, 'PEDIATRICS', 'APPROVED'),
    ('Pregnancy health tips', 'What are the essential vitamins during pregnancy?', 3, 'PREGNANCY', 'APPROVED');

-- Insert sample medical center
INSERT INTO medical_centers (name, address, city, district, phone_number, email_address, is_verified, rating)
VALUES 
    ('Central Medical Hospital', '123 Main Street', 'Colombo', 'Colombo', '+94-11-1234567', 'info@centralmedical.com', true, 4.5);

-- ============================================
-- VERIFY TABLES CREATED
-- ============================================
-- Run this query to verify all tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
