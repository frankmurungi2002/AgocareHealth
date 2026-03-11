-- ============================================
-- V3: SEED DATA - Categories + Sample Data
-- ============================================

-- ============================================
-- SEED CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, icon, color_code, description, question_count) VALUES
    ('Infectious Diseases', 'infectious', '🦠', '#FFE5B4', 'Questions about infectious diseases, prevention, treatment, and transmission.', 0),
    ('Pregnancy Care', 'pregnancy', '🤰', '#FFB6C1', 'Prenatal care, pregnancy health, labor preparation, and postpartum recovery.', 0),
    ('Child Nutrition', 'nutrition', '🍎', '#90EE90', 'Childhood nutrition, feeding guidelines, dietary requirements, and healthy eating habits.', 0),
    ('Mental Wellness', 'mental-health', '🧠', '#87CEEB', 'Mental health support, anxiety, depression, stress management, and emotional well-being.', 0),
    ('Diabetes', 'diabetes', '💉', '#DDA0DD', 'Diabetes management, blood sugar control, insulin therapy, and lifestyle modifications.', 0),
    ('Pediatrics', 'pediatrics', '👶', '#FFD700', 'Child health, vaccinations, growth milestones, and common childhood conditions.', 0),
    ('Sexual Health', 'sexual-health', '🛡️', '#F0E68C', 'Sexual health education, STI prevention, reproductive health, and safe practices.', 0),
    ('General Health', 'general', '🏥', '#B0C4DE', 'General health questions that do not fall into a specific category.', 0),
    ('Hypertension', 'hypertension', '❤️', '#FF6B6B', 'Blood pressure management, cardiovascular health, and heart disease prevention.', 0)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SAMPLE USERS (if not already present)
-- Password for all: "password123"
-- BCrypt hash: $2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK
-- ============================================
INSERT INTO users (username, email, password, name, role, user_type, is_active, is_verified, verification_badge) VALUES
    ('john_mukisa', 'john.mukisa@example.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'John Mukisa', 'PATIENT', 'PATIENT', true, true, false),
    ('sarah_nambi', 'sarah.nambi@example.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Sarah Nambi', 'PATIENT', 'PATIENT', true, true, false),
    ('dr_okello', 'dr.okello@agocare.com', '$2a$10$Ry/4Gz8Q6BcGqKl7EW7Q..6U5E8JQHzYpQZ7dN5W6jq5p8mZ1cMrK', 'Dr. Peter Okello', 'DOCTOR', 'VERIFIED_DOCTOR', true, true, true)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- LINK EXISTING QUESTIONS TO CATEGORIES
-- ============================================
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'pediatrics') WHERE UPPER(category) = 'PEDIATRICS' AND category_id IS NULL;
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'pregnancy') WHERE UPPER(category) = 'PREGNANCY' AND category_id IS NULL;
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'infectious') WHERE UPPER(category) = 'INFECTIOUS' AND category_id IS NULL;
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'mental-health') WHERE UPPER(category) IN ('MENTAL_HEALTH', 'MENTAL HEALTH') AND category_id IS NULL;
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'sexual-health') WHERE UPPER(category) IN ('SEXUAL_HEALTH', 'SEXUAL HEALTH') AND category_id IS NULL;
UPDATE questions SET category_id = (SELECT id FROM categories WHERE slug = 'general') WHERE category_id IS NULL;

-- Set default status on existing questions
UPDATE questions SET status = 'OPEN' WHERE status IS NULL;

-- ============================================
-- SAMPLE QUESTIONS linked to categories
-- ============================================
INSERT INTO questions (title, content, user_id, category, category_id, status, moderation_status, upvotes, answer_count, view_count, is_anonymous)
SELECT 
    'What are the early warning signs of malaria in children?',
    'My 5-year-old has been having intermittent fevers for the past two days. The fever comes and goes, and he also has some body aches. Should I be concerned about malaria? What are the early signs I should watch for, and when should I take him to the hospital?',
    u.id,
    'INFECTIOUS',
    c.id,
    'OPEN',
    'APPROVED',
    24, 3, 156, false
FROM users u, categories c
WHERE u.username = 'john_mukisa' AND c.slug = 'infectious'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'What are the early warning signs of malaria in children?');

INSERT INTO questions (title, content, user_id, category, category_id, status, moderation_status, upvotes, answer_count, view_count, is_anonymous)
SELECT 
    'Safe exercises during the third trimester of pregnancy?',
    'I am currently in my 32nd week of pregnancy and I want to stay active. What exercises are safe during the third trimester? I used to do light jogging but my doctor suggested I switch to something else. Any recommendations from other moms or medical professionals?',
    u.id,
    'PREGNANCY',
    c.id,
    'OPEN',
    'APPROVED',
    45, 5, 312, false
FROM users u, categories c
WHERE u.username = 'sarah_nambi' AND c.slug = 'pregnancy'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'Safe exercises during the third trimester of pregnancy?');

INSERT INTO questions (title, content, user_id, category, category_id, status, moderation_status, upvotes, answer_count, view_count, is_anonymous)
SELECT 
    'How to manage anxiety without medication?',
    'I have been experiencing anxiety for the past few months. I would prefer to manage it without medication if possible. What are some effective natural remedies or lifestyle changes that can help with anxiety? Has anyone had success with meditation or breathing exercises?',
    u.id,
    'MENTAL_HEALTH',
    c.id,
    'OPEN',
    'APPROVED',
    67, 8, 534, false
FROM users u, categories c
WHERE u.username = 'john_mukisa' AND c.slug = 'mental-health'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'How to manage anxiety without medication?');

INSERT INTO questions (title, content, user_id, category, category_id, status, moderation_status, upvotes, answer_count, view_count, is_anonymous)
SELECT 
    'Recommended vaccination schedule for newborns in Uganda?',
    'I am a first-time parent and want to make sure my baby gets all the necessary vaccinations. What is the recommended vaccination schedule for newborns in Uganda? Are there any vaccines that are optional but recommended?',
    u.id,
    'PEDIATRICS',
    c.id,
    'OPEN',
    'APPROVED',
    38, 4, 245, false
FROM users u, categories c
WHERE u.username = 'sarah_nambi' AND c.slug = 'pediatrics'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'Recommended vaccination schedule for newborns in Uganda?');

INSERT INTO questions (title, content, user_id, category, category_id, status, moderation_status, upvotes, answer_count, view_count, is_anonymous)
SELECT 
    'Best diet plan for Type 2 Diabetes management?',
    'I was recently diagnosed with Type 2 Diabetes and I need help creating a diet plan. What foods should I avoid and what should I eat more of? Are there any specific Ugandan foods that are particularly good or bad for diabetes management?',
    u.id,
    'GENERAL',
    (SELECT id FROM categories WHERE slug = 'diabetes'),
    'OPEN',
    'APPROVED',
    52, 6, 423, false
FROM users u
WHERE u.username = 'john_mukisa'
AND NOT EXISTS (SELECT 1 FROM questions WHERE title = 'Best diet plan for Type 2 Diabetes management?');

-- ============================================
-- UPDATE CATEGORY QUESTION COUNTS
-- ============================================
UPDATE categories c SET question_count = (
    SELECT COUNT(*) FROM questions q WHERE q.category_id = c.id
);
