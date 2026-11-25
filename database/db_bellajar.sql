-- ============================================================================
-- DATABASE BELLAJAR (PLATFORM KURSUS DARING ANAK USIA 5-12 TAHUN)
-- Tugas Final Praktikum Pemrograman Web 2026 - Universitas Hasanuddin
-- Skema PostgreSQL Lengkap (8 Tabel Relasional) + Dummy Data
-- ============================================================================

-- ============================================================================
-- 1. TABEL USERS (Admin, Teacher/Kakak Tutor, Student/Siswa Anak)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    teacher_status VARCHAR(20) NOT NULL DEFAULT 'none' CHECK (teacher_status IN ('none', 'pending', 'approved', 'rejected')),
    avatar VARCHAR(255) DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bellajar',
    bio TEXT NULL,
    teacher_bio TEXT NULL,
    teacher_specialty VARCHAR(150) NULL,
    teacher_experience VARCHAR(150) NULL,
    teacher_education VARCHAR(150) NULL,
    teacher_cv_url VARCHAR(255) NULL,
    teacher_portfolio_url VARCHAR(255) NULL,
    teacher_rejection_reason TEXT NULL,
    teacher_review_note TEXT NULL,
    reviewed_by INT NULL,
    teacher_applied_at TIMESTAMP NULL,
    reviewed_at TIMESTAMP NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. TABEL TEACHER_APPLICATIONS (Berkas Pengajuan & Verifikasi Calon Tutor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS teacher_applications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(30),
    city VARCHAR(100),
    education VARCHAR(100),
    experience TEXT,
    applied_for VARCHAR(100),
    portfolio_url VARCHAR(300),
    status VARCHAR(15) NOT NULL DEFAULT 'submitted'
           CHECK (status IN ('submitted', 'revision', 'rejected', 'approved')),
    review_note TEXT,
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. TABEL CATEGORIES (Master Data Kategori Kursus Anak)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. TABEL COURSES (Kelas Kursus Anak + Rentang Waktu Opsional / Lifetime)
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thumbnail VARCHAR(255) DEFAULT 'https://placehold.co/600x400?text=Kursus+Bellajar',
    image_url VARCHAR(255) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    is_finalized BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. TABEL CONTENTS (Materi Pembelajaran Berurutan dengan Order_Index)
-- ============================================================================
CREATE TABLE IF NOT EXISTS contents (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    video_url VARCHAR(255) NULL,
    image_url VARCHAR(255) NULL,
    order_index INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. TABEL ENROLLMENTS (Pendaftaran & Progres Belajar Student)
-- ============================================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_content_ids INT[] NOT NULL DEFAULT '{}',
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- ============================================================================
-- 7. TABEL DISCUSSIONS (Forum Diskusi / Komentar per Materi)
-- ============================================================================
CREATE TABLE IF NOT EXISTS discussions (
    id SERIAL PRIMARY KEY,
    content_id INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. TABEL CERTIFICATES (Auto-Generated Certificate Progres 100%)
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- ============================================================================
-- DUMMY DATA (SEEDING TEMA KURSUS ANAK USIA 5-12 TAHUN)
-- ============================================================================

-- 1. Dummy Users (Password plaintext contoh: 'password123')
INSERT INTO users (
    username, email, password, role, teacher_status, avatar,
    teacher_bio, teacher_specialty, teacher_education, teacher_cv_url, approved_at
) VALUES
(
    'Admin Bellajar',
    'admin@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin', 'none',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminBellajar',
    NULL, NULL, NULL, NULL, NULL
),
(
    'Kak Budi (Tutor Seni & Sains)',
    'budi.teacher@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'teacher', 'approved',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=KakBudi',
    'Tutor berpengalaman yang suka mengajar anak-anak dengan cara seru dan interaktif.',
    'Seni & Sains Dasar', 'S1 Pendidikan Seni Rupa',
    'https://example.com/cv-tutor-bellajar.pdf',
    CURRENT_TIMESTAMP - INTERVAL '10 days'
),
(
    'Kak Siti (Tutor Bahasa & Logika)',
    'siti.teacher@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'teacher', 'approved',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=KakSiti',
    'Tutor berpengalaman yang suka mengajar anak-anak dengan cara seru dan interaktif.',
    'Bahasa Inggris & Logika', 'S1 Sastra Inggris',
    'https://example.com/cv-tutor-bellajar.pdf',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
),
(
    'Kak Aris (Calon Tutor)',
    'aris.pending@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student', 'pending',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=KakAris',
    NULL, 'Matematika & Kreativitas', 'S1 Pendidikan Matematika',
    'https://example.com/cv-tutor-bellajar.pdf',
    NULL
),
(
    'Andi (Kelas 5 SD)',
    'andi.student@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student', 'none',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
    NULL, NULL, NULL, NULL, NULL
),
(
    'Nadia (Kelas 4 SD)',
    'nadia.student@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student', 'none',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia',
    NULL, NULL, NULL, NULL, NULL
),
(
    'Rizky (Kelas 6 SD)',
    'rizky.student@bellajar.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'student', 'none',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizky',
    NULL, NULL, NULL, NULL, NULL
)
ON CONFLICT (email) DO NOTHING;

-- 2. Dummy Teacher Applications
INSERT INTO teacher_applications (
    user_id, phone, city, education, experience, applied_for, portfolio_url, status
)
SELECT
    id, '081234567890', 'Makassar', COALESCE(teacher_education, 'S1'),
    'Calon tutor yang suka mengajar matematika dan kreativitas untuk anak-anak SD.',
    'Logika & Permainan', 'https://example.com/portofolio', 'submitted'
FROM users
WHERE email = 'aris.pending@bellajar.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Dummy Categories
INSERT INTO categories (name) VALUES
('Seni & Menggambar'),
('Sains Seru'),
('Bahasa & Cerita'),
('Logika & Permainan'),
('Keterampilan & Musik')
ON CONFLICT (name) DO NOTHING;

-- 4. Dummy Courses
INSERT INTO courses (
    title, description, category_id, teacher_id, thumbnail, image_url, start_date, end_date, is_finalized
) VALUES
(
    'Menggambar Karakter Kartun Lucu dari Bentuk Dasar',
    'Belajar menggambar wajah ekspresif, hewan lucu, dan tokoh kartun favoritmu hanya dari bentuk lingkaran dan segitiga!',
    1, 2,
    'https://placehold.co/600x400/FF9F43/FFFFFF?text=Menggambar+Kartun',
    'https://placehold.co/600x400/FF9F43/FFFFFF?text=Menggambar+Kartun',
    NULL, NULL, TRUE
),
(
    'Eksperimen Sains Seru di Dapur Rumah',
    'Mari menjadi ilmuwan cilik! Membuat gunung meletus dari soda kue, pelangi dalam gelas, dan tinta rahasia dengan bahan aman di rumah.',
    2, 2,
    'https://placehold.co/600x400/2ECC71/FFFFFF?text=Sains+Dapur',
    'https://placehold.co/600x400/2ECC71/FFFFFF?text=Sains+Dapur',
    '2026-11-01', '2026-12-31', TRUE
),
(
    'English Storytelling: Membaca & Bercerita Seru',
    'Belajar kosakata bahasa Inggris sehari-hari lewat dongeng petualangan interaktif dan latihan pengucapan yang menyenangkan.',
    3, 3,
    'https://placehold.co/600x400/3498DB/FFFFFF?text=English+Story',
    'https://placehold.co/600x400/3498DB/FFFFFF?text=English+Story',
    NULL, NULL, TRUE
),
(
    'Logika Pemrograman Dasar dengan Permainan Blok',
    'Melatih cara berpikir runtut dan memecahkan teka-teki logika layaknya membuat game sederhana tanpa rumus rumit.',
    4, 3,
    'https://placehold.co/600x400/9B59B6/FFFFFF?text=Logika+Blok',
    'https://placehold.co/600x400/9B59B6/FFFFFF?text=Logika+Blok',
    '2026-11-10', '2026-12-20', TRUE
),
(
    'Seni Melipat Kertas (Origami) Hewan & Pesawat',
    'Melatih ketelitian dan kreativitas tangan dengan membuat berbagai bentuk hewan, perahu, dan pesawat kertas yang bisa terbang jauh.',
    1, 2,
    'https://placehold.co/600x400/E74C3C/FFFFFF?text=Origami+Seru',
    'https://placehold.co/600x400/E74C3C/FFFFFF?text=Origami+Seru',
    NULL, NULL, TRUE
),
(
    'Public Speaking Cilik: Berani Tampil Bercerita',
    'Tips percaya diri saat maju ke depan kelas, mengatur suara agar jelas, dan menceritakan pengalaman seru di depan teman-teman.',
    5, 3,
    'https://placehold.co/600x400/1ABC9C/FFFFFF?text=Public+Speaking',
    'https://placehold.co/600x400/1ABC9C/FFFFFF?text=Public+Speaking',
    NULL, NULL, TRUE
);

-- 5. Dummy Contents
INSERT INTO contents (course_id, title, body, order_index) VALUES
(1, 'Bab 1: Menyiapkan Pensil, Kertas, dan Penghapus', 'Halo adik-adik! Sebelum mulai menggambar, siapkan pensil 2B, kertas gambar, dan penghapus yang bersih. Pegang pensil dengan santai agar garisnya lembut.', 1),
(1, 'Bab 2: Menggambar Wajah dari Bentuk Lingkaran', 'Mulailah dengan membuat lingkaran besar sebagai kepala. Tambahkan garis bantu tanda tambah (+) di tengah untuk menentukan posisi mata dan hidung.', 2),
(1, 'Bab 3: Membuat Ekspresi Senang, Kaget, dan Lucu', 'Ubah bentuk alis dan mulut karaktermu! Alis melengkung ke atas membuat wajah tampak senang, sedangkan mata bulat besar memberi kesan kaget.', 3),
(1, 'Bab 4: Mewarnai Karakter dengan Pensil Warna', 'Warnai bagian pinggir gambar terlebih dahulu agar tidak keluar garis, lalu arsir bagian tengah secara merata dari satu arah.', 4),
(2, 'Bab 1: Aturan Keamanan Ilmuwan Cilik', 'Pastikan selalu didampingi Ayah atau Bunda saat melakukan eksperimen di dapur, dan jangan mencicipi bahan percobaan ya!', 1),
(2, 'Bab 2: Eksperimen Gunung Meletus Soda Kue', 'Masukkan 2 sendok soda kue ke dalam gelas kecil, teteskan pewarna makanan merah, lalu tuangkan cuka dapur dan lihat busa lava meluap!', 2),
(2, 'Bab 3: Menulis Pesan Rahasia dengan Air Lemon', 'Celupkan cotton bud ke dalam air perasan lemon, tulis pesan di kertas putih, tunggu kering, lalu minta orang tua menghangatkannya di dekat lampu.', 3),
(3, 'Bab 1: Mengenal Nama Hewan di Hutan (Forest Animals)', 'Mari kenali bahasa Inggris dari hewan hutan: Rabbit (Kelinci), Owl (Burung Hantu), Deer (Rusa), dan Bear (Beruang). Ucapkan dengan lantang!', 1),
(3, 'Bab 2: Membaca Cerita Pendek "The Brave Little Rabbit"', 'Baca kisah kelinci kecil yang membantu teman-temannya menyeberangi sungai, lalu temukan 5 kata sifat baru di dalam cerita.', 2),
(4, 'Bab 1: Apa Itu Urutan Langkah (Algoritma)?', 'Bayangkan kamu memberi petunjuk kepada robot untuk menyikat gigi. Setiap langkah harus urut dari mengambil sikat hingga berkumur.', 1),
(4, 'Bab 2: Teka-Teki Mencari Jalan Keluar Labirin', 'Gunakan perintah Maju, Belok Kiri, dan Belok Kanan secara tepat untuk membantu karakter menemukan harta karun.', 2),
(5, 'Bab 1: Teknik Lipatan Dasar Segitiga dan Persegi', 'Pastikan setiap sudut kertas bertemu dengan rapi dan tekan lipatan menggunakan jari agar bentuk origami kokoh.', 1),
(6, 'Bab 1: Mengatasi Rasa Malu Sebelum Bercerita', 'Tarik napas dalam-dalam selama 3 detik, tersenyum kepada teman-teman, dan mulailah dengan sapaan yang ceria!', 1);

-- 6. Dummy Enrollments
INSERT INTO enrollments (user_id, course_id, completed_content_ids) VALUES
(5, 1, ARRAY[1, 2, 3, 4]),
(6, 1, ARRAY[1, 2]),
(7, 1, ARRAY[1]),
(4, 1, ARRAY[]::INT[]),
(5, 2, ARRAY[5]),
(6, 2, ARRAY[5, 6]),
(7, 2, ARRAY[]::INT[]),
(5, 3, ARRAY[8]),
(6, 3, ARRAY[]::INT[]),
(6, 4, ARRAY[10]),
(7, 4, ARRAY[]::INT[]),
(5, 5, ARRAY[]::INT[])
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 7. Dummy Discussions
INSERT INTO discussions (content_id, user_id, comment) VALUES
(1, 5, 'Kak Budi, aku pakai krayon untuk mewarnai gambarnya boleh tidak?'),
(1, 2, 'Boleh banget Andi! Kalau pakai krayon, warnai bagian yang kecil dengan hati-hati supaya tidak keluar garis ya.'),
(2, 6, 'Hore! Eksperimen gunung meletusnya berhasil dicoba bareng Bunda di rumah, busanya banyak sekali!'),
(2, 2, 'Wah keren Nadia! Jangan lupa rapikan kembali meja dapurnya setelah selesai eksperimen ya.'),
(8, 5, 'Cerita kelinci kecilnya seru Kak Siti, aku sudah hafal semua nama hewannya.');

-- 8. Dummy Certificate
INSERT INTO certificates (user_id, course_id, certificate_code) VALUES
(5, 1, 'BLJR-2026-8F92A1')
ON CONFLICT (user_id, course_id) DO NOTHING;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_finalized BOOLEAN NOT NULL DEFAULT FALSE;