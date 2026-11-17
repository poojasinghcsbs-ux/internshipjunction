-- ─────────────────────────────────────────────────────────────
--  InternshipJunction — MySQL schema (reference / production target)
--  The app runs in-memory by default. Point DB_ENABLED=true and
--  run this file to persist data:  mysql -u root -p < schema.sql
-- ─────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS internshipjunction CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internshipjunction;

-- Users & auth -------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  phone         VARCHAR(30)  NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','mentor','admin','super_admin') NOT NULL DEFAULT 'student',
  headline      VARCHAR(160) NULL,
  avatar_url    VARCHAR(500) NULL,
  mentor_id     INT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Mentors ------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  role          VARCHAR(120) NOT NULL,
  company       VARCHAR(120) NOT NULL,
  avatar_url    VARCHAR(500) NULL,
  expertise     JSON NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  rating        DECIMAL(2,1) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  bio           TEXT NULL,
  linkedin      VARCHAR(300) NULL,
  availability  VARCHAR(120) NULL,
  is_featured   TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Catalog: courses --------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  slug             VARCHAR(190) NOT NULL UNIQUE,
  title            VARCHAR(200) NOT NULL,
  category         VARCHAR(80) NOT NULL,
  level            ENUM('Beginner','Intermediate','Advanced') NOT NULL,
  mode             ENUM('live','self-paced') NOT NULL DEFAULT 'self-paced',
  thumbnail        VARCHAR(500) NULL,
  price            DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price   DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating           DECIMAL(2,1) NOT NULL DEFAULT 0,
  reviews_count    INT NOT NULL DEFAULT 0,
  students_count   INT NOT NULL DEFAULT 0,
  duration         VARCHAR(60) NOT NULL,
  technologies     JSON NOT NULL,
  short_description VARCHAR(400) NOT NULL,
  overview         TEXT NULL,
  outcomes         JSON NOT NULL,
  prerequisites    JSON NOT NULL,
  audience         JSON NOT NULL,
  certification    VARCHAR(200) NULL,
  career_outcomes  JSON NOT NULL,
  mentor_id        INT NULL,
  is_featured      TINYINT(1) NOT NULL DEFAULT 0,
  status           ENUM('active','draft') NOT NULL DEFAULT 'active',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS course_modules (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title     VARCHAR(200) NOT NULL,
  position  INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lessons (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT NOT NULL,
  title     VARCHAR(200) NOT NULL,
  type      ENUM('video','reading','quiz','assignment','live') NOT NULL DEFAULT 'video',
  duration  VARCHAR(40) NULL,
  is_preview TINYINT(1) NOT NULL DEFAULT 0,
  position  INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_lesson_module FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Catalog: internships / fellowships / jobs -------------------
CREATE TABLE IF NOT EXISTS internships (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  slug               VARCHAR(190) NOT NULL UNIQUE,
  title              VARCHAR(200) NOT NULL,
  domain             VARCHAR(80) NOT NULL,
  level              ENUM('Beginner','Intermediate','Advanced') NOT NULL,
  mode               ENUM('remote','hybrid','onsite') NOT NULL DEFAULT 'remote',
  duration           VARCHAR(60) NOT NULL,
  stipend            VARCHAR(80) NULL,
  location           VARCHAR(120) NULL,
  thumbnail          VARCHAR(500) NULL,
  skills             JSON NOT NULL,
  short_description  VARCHAR(400) NOT NULL,
  overview           TEXT NULL,
  eligibility        JSON NOT NULL,
  roadmap            JSON NOT NULL,
  perks              JSON NOT NULL,
  certification      VARCHAR(200) NULL,
  application_deadline DATE NULL,
  status             ENUM('open','closed') NOT NULL DEFAULT 'open',
  openings           INT NOT NULL DEFAULT 0,
  applicants_count   INT NOT NULL DEFAULT 0,
  mentor_id          INT NULL,
  is_featured        TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_internship_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fellowships (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  slug              VARCHAR(190) NOT NULL UNIQUE,
  title             VARCHAR(200) NOT NULL,
  domain            VARCHAR(80) NOT NULL,
  cohort            VARCHAR(80) NULL,
  start_date        DATE NULL,
  duration          VARCHAR(60) NOT NULL,
  seats             INT NOT NULL DEFAULT 0,
  seats_left        INT NOT NULL DEFAULT 0,
  price             DECIMAL(10,2) NOT NULL DEFAULT 0,
  original_price    DECIMAL(10,2) NOT NULL DEFAULT 0,
  thumbnail         VARCHAR(500) NULL,
  short_description VARCHAR(400) NOT NULL,
  overview          TEXT NULL,
  highlights        JSON NOT NULL,
  curriculum        JSON NOT NULL,
  mentors           JSON NOT NULL,
  career_support    JSON NOT NULL,
  is_featured       TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(190) NOT NULL UNIQUE,
  title           VARCHAR(200) NOT NULL,
  company         VARCHAR(160) NOT NULL,
  company_logo    VARCHAR(500) NULL,
  location        VARCHAR(120) NULL,
  remote          TINYINT(1) NOT NULL DEFAULT 0,
  experience      VARCHAR(60) NULL,
  salary_min      DECIMAL(12,2) NOT NULL DEFAULT 0,
  salary_max      DECIMAL(12,2) NOT NULL DEFAULT 0,
  type            ENUM('Full-time','Part-time','Internship','Contract') NOT NULL DEFAULT 'Full-time',
  skills          JSON NOT NULL,
  description     TEXT NULL,
  responsibilities JSON NOT NULL,
  requirements    JSON NOT NULL,
  posted_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status          ENUM('open','closed') NOT NULL DEFAULT 'open',
  applicants_count INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS project_catalog (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  course_slug     VARCHAR(190) NULL,
  course_title    VARCHAR(200) NULL,
  difficulty      ENUM('Beginner','Intermediate','Advanced') NOT NULL DEFAULT 'Beginner',
  description     TEXT NULL,
  requirements    JSON NOT NULL,
  skills          JSON NOT NULL,
  estimated_hours INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- Enrollments, projects & applications ------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  program_type ENUM('course','internship','fellowship') NOT NULL,
  program_id   INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  thumbnail    VARCHAR(500) NULL,
  plan         ENUM('self-paced','pro','advanced') NOT NULL DEFAULT 'self-paced',
  progress     INT NOT NULL DEFAULT 0,
  status       ENUM('active','completed') NOT NULL DEFAULT 'active',
  enrolled_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enroll_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS lesson_progress (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  INT NOT NULL,
  lesson_id  INT NOT NULL,
  completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_progress (user_id, lesson_id),
  CONSTRAINT fk_lp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_projects (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  catalog_id     INT NULL,
  title          VARCHAR(200) NOT NULL,
  course_slug    VARCHAR(190) NULL,
  course_title   VARCHAR(200) NULL,
  difficulty     ENUM('Beginner','Intermediate','Advanced') NULL,
  description    TEXT NULL,
  requirements   JSON NULL,
  skills         JSON NULL,
  estimated_hours INT NULL,
  status         ENUM('not-started','in-progress','submitted','under-review','changes-requested','approved','completed') NOT NULL DEFAULT 'not-started',
  repo_url       VARCHAR(500) NULL,
  submission_url VARCHAR(500) NULL,
  feedback       TEXT NULL,
  score          INT NULL,
  submitted_at   DATETIME NULL,
  CONSTRAINT fk_proj_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS applications (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  application_number VARCHAR(40) NULL,
  user_id            INT NULL,
  kind               ENUM('internship','fellowship') NOT NULL,
  program_id         INT NOT NULL,
  slug               VARCHAR(190) NULL,
  applicant_name     VARCHAR(120) NULL,
  email              VARCHAR(190) NULL,
  phone              VARCHAR(30) NULL,
  college            VARCHAR(160) NULL,
  degree             VARCHAR(120) NULL,
  graduation_year    VARCHAR(20) NULL,
  duration           VARCHAR(60) NULL,
  linkedin_url       VARCHAR(500) NULL,
  status             ENUM('applied','shortlisted','interview','selected','rejected') NOT NULL DEFAULT 'applied',
  cover_letter       TEXT NULL,
  portfolio_url      VARCHAR(500) NULL,
  motivation         TEXT NULL,
  applied_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS job_applications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  job_id      INT NOT NULL,
  job_title   VARCHAR(200) NOT NULL,
  company     VARCHAR(160) NOT NULL,
  status      ENUM('applied','shortlisted','interview','selected','rejected') NOT NULL DEFAULT 'applied',
  resume_url  VARCHAR(500) NULL,
  cover_letter TEXT NULL,
  applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_job_app (user_id, job_id),
  CONSTRAINT fk_ja_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_jobs (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id  INT NOT NULL,
  UNIQUE KEY uq_saved (user_id, job_id),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Career tools ------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(160) NOT NULL,
  template   VARCHAR(60) NOT NULL DEFAULT 'modern',
  data       JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_resume_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ats_reports (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  file_name         VARCHAR(200) NULL,
  target_role       VARCHAR(160) NULL,
  overall_score     INT NOT NULL DEFAULT 0,
  sections          JSON NOT NULL,
  missing_keywords  JSON NOT NULL,
  recommended_skills JSON NOT NULL,
  suggestions       JSON NOT NULL,
  summary           TEXT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ats_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mock_interviews (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  role           VARCHAR(160) NOT NULL,
  technology     VARCHAR(120) NOT NULL,
  experience     VARCHAR(60) NULL,
  type           VARCHAR(60) NULL,
  interviewer    VARCHAR(120) NULL,
  score          INT NOT NULL DEFAULT 0,
  strengths      JSON NOT NULL,
  weaknesses     JSON NOT NULL,
  recommendation TEXT NULL,
  questions      JSON NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mock_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Certificates & payments -------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(60) NOT NULL UNIQUE,
  user_id        INT NOT NULL,
  student_name   VARCHAR(120) NOT NULL,
  program        VARCHAR(200) NOT NULL,
  program_type   ENUM('course','internship','fellowship') NOT NULL,
  grade          VARCHAR(20) NULL,
  status         ENUM('valid','revoked') NOT NULL DEFAULT 'valid',
  issued_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cert_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  program       VARCHAR(200) NOT NULL,
  program_type  ENUM('course','internship','fellowship') NULL,
  program_id    INT NULL,
  plan          ENUM('self-paced','pro','advanced') NULL,
  base_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
  coupon_code   VARCHAR(60) NULL,
  provider      VARCHAR(40) NOT NULL DEFAULT 'razorpay',
  provider_order_id VARCHAR(120) NULL,
  provider_payment_id VARCHAR(120) NULL,
  simulated     TINYINT(1) NOT NULL DEFAULT 0,
  status        ENUM('pending','paid','refunded','failed') NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS coupons (
  code        VARCHAR(60) PRIMARY KEY,
  type        ENUM('percent','flat') NOT NULL,
  value       DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  active      TINYINT(1) NOT NULL DEFAULT 1,
  description VARCHAR(200) NULL
) ENGINE=InnoDB;

-- Community, notifications, sessions, audit -------------------
CREATE TABLE IF NOT EXISTS community_posts (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  author         VARCHAR(120) NOT NULL,
  author_role    VARCHAR(30) NOT NULL,
  title          VARCHAR(200) NOT NULL,
  content        TEXT NOT NULL,
  tags           JSON NOT NULL,
  likes          INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_post_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS community_comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  post_id    INT NOT NULL,
  user_id    INT NOT NULL,
  author     VARCHAR(120) NOT NULL,
  author_role VARCHAR(30) NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS community_likes (
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(40) NOT NULL DEFAULT 'info',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mentor_sessions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id   INT NOT NULL,
  mentor_name VARCHAR(120) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status      ENUM('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  CONSTRAINT fk_session_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS class_sessions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(200) NOT NULL,
  course      VARCHAR(200) NOT NULL,
  mentor      VARCHAR(120) NULL,
  starts_at   DATETIME NOT NULL,
  join_url    VARCHAR(500) NULL,
  status      ENUM('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  CONSTRAINT fk_class_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assignments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  title        VARCHAR(200) NOT NULL,
  course       VARCHAR(200) NOT NULL,
  due_date     DATETIME NOT NULL,
  status       ENUM('pending','submitted','graded') NOT NULL DEFAULT 'pending',
  submitted_at DATETIME NULL,
  CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mentor_questions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  student_id   INT NULL,
  student_name VARCHAR(120) NOT NULL,
  mentor_id    INT NULL,
  course       VARCHAR(200) NULL,
  question     TEXT NOT NULL,
  answer       TEXT NULL,
  status       ENUM('open','answered') NOT NULL DEFAULT 'open',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at  DATETIME NULL,
  CONSTRAINT fk_question_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS messages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  sender_id    INT NULL,
  recipient_id INT NULL,
  mentor_id    INT NULL,
  sender_name  VARCHAR(120) NOT NULL,
  message      TEXT NOT NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS testimonials (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  author     VARCHAR(120) NOT NULL,
  role       VARCHAR(160) NULL,
  rating     INT NOT NULL DEFAULT 5,
  content    TEXT NOT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  action     VARCHAR(60) NOT NULL,
  entity     VARCHAR(60) NOT NULL,
  entity_id  VARCHAR(60) NULL,
  meta       JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Helpful indexes
CREATE INDEX idx_enroll_user ON enrollments (user_id);
CREATE INDEX idx_notif_user ON notifications (user_id, is_read);
CREATE INDEX idx_course_category ON courses (category);
CREATE INDEX idx_job_type ON jobs (type, status);
CREATE INDEX idx_order_status ON orders (status);
