-- =====================================================================
-- BELLAJAR - Skema PostgreSQL
-- Langkah pakai:
--   1) createdb db_bellajar      (atau: CREATE DATABASE db_bellajar;)
--   2) psql -U postgres -d db_bellajar -f database/db_bellajar.sql
--   3) npm run seed              (membuat akun admin & data contoh)
-- =====================================================================

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(50)  NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password       TEXT         NOT NULL,
  role           VARCHAR(10)  NOT NULL DEFAULT 'student'
                 CHECK (role IN ('admin', 'teacher', 'student')),
  teacher_status VARCHAR(10)  NOT NULL DEFAULT 'none'
                 CHECK (teacher_status IN ('none', 'pending', 'approved', 'rejected')),
  approved_at    TIMESTAMPTZ  NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  description TEXT         NOT NULL,
  category_id INT          REFERENCES categories(id) ON DELETE SET NULL,
  teacher_id  INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date  DATE         NULL,
  end_date    DATE         NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contents (
  id          SERIAL PRIMARY KEY,
  course_id   INT          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  body        TEXT         NOT NULL,
  order_index INT          NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  id                    SERIAL PRIMARY KEY,
  user_id               INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id             INT         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_content_ids INT[]       NOT NULL DEFAULT '{}',
  enrolled_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS discussions (
  id         SERIAL PRIMARY KEY,
  content_id INT         NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
  id               SERIAL PRIMARY KEY,
  user_id          INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id        INT         NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_code VARCHAR(30) NOT NULL UNIQUE,
  issued_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_courses_teacher     ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_category    ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_contents_course     ON contents(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_discussions_content ON discussions(content_id, created_at);

INSERT INTO categories (name) VALUES
  ('Matematika Seru'), ('Bahasa & Membaca'), ('Sains Cilik'), ('Seni & Kreativitas'), ('Coding untuk Anak')
ON CONFLICT (name) DO NOTHING;
