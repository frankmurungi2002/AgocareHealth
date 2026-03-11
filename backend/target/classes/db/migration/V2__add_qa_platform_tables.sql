-- ============================================
-- V2: Q&A PLATFORM TABLES
-- Categories, Answers (SQL), Votes, Follows
-- ============================================

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    color_code VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    description TEXT,
    question_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============================================
-- ALTER QUESTIONS TABLE
-- Add category_id FK, downvote_count, medical_answer_count, is_anonymous, status
-- ============================================
ALTER TABLE questions ADD COLUMN IF NOT EXISTS category_id BIGINT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS downvote_count INT DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS medical_answer_count INT DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'OPEN';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS comment_count INT DEFAULT 0;

-- Make legacy columns nullable (new questions may only use category_id)
ALTER TABLE questions ALTER COLUMN category DROP NOT NULL;
ALTER TABLE questions ALTER COLUMN user_id DROP NOT NULL;

-- Add FK constraint (nullable for backward compatibility with existing rows)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_questions_category' AND table_name = 'questions'
    ) THEN
        ALTER TABLE questions ADD CONSTRAINT fk_questions_category 
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- ============================================
-- ALTER USERS TABLE
-- Add user_type and verification_badge fields
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(30) DEFAULT 'PATIENT';
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_badge BOOLEAN DEFAULT false;

-- ============================================
-- ANSWERS TABLE (SQL - replacing MongoDB answers)
-- ============================================
CREATE TABLE IF NOT EXISTS answers (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    upvote_count INT DEFAULT 0,
    downvote_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON answers(created_at DESC);

-- ============================================
-- VOTES TABLE (Polymorphic: question or answer)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    votable_type VARCHAR(20) NOT NULL,  -- 'QUESTION' or 'ANSWER'
    votable_id BIGINT NOT NULL,
    vote_type VARCHAR(10) NOT NULL,     -- 'UPVOTE' or 'DOWNVOTE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_votes_user_votable UNIQUE (user_id, votable_type, votable_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_votable ON votes(votable_type, votable_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);

-- ============================================
-- FOLLOWS TABLE (Polymorphic: user, question, category)
-- ============================================
CREATE TABLE IF NOT EXISTS follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    followable_type VARCHAR(20) NOT NULL,  -- 'USER', 'QUESTION', 'CATEGORY'
    followable_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_follows_follower_followable UNIQUE (follower_id, followable_type, followable_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followable ON follows(followable_type, followable_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
