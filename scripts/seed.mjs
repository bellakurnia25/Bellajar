// Membuat akun admin + data contoh. Jalankan: npm run seed
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function upsertUser(username, email, password, role, status) {
  const hash = await bcrypt.hash(password, 10);
  const approvedAt = role === 'teacher' ? new Date() : null;
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password, role, teacher_status, approved_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
     RETURNING id`,
    [username, email, hash, role, status, approvedAt]
  );
  return rows[0].id;
}

async function main() {
  await upsertUser('Admin BELLAJAR', 'admin@bellajar.id', 'admin123', 'admin', 'none');
  const teacherId = await upsertUser('Bu Sari', 'guru@bellajar.id', 'guru123', 'teacher', 'approved');
  await upsertUser('Raka (Siswa Contoh)', 'siswa@bellajar.id', 'siswa123', 'student', 'none');

  const cat = await pool.query(`SELECT id FROM categories WHERE name = $1`, ['Matematika Seru']);
  const categoryId = cat.rows[0]?.id ?? null;

  const exists = await pool.query(
    `SELECT id FROM courses WHERE title = $1 AND teacher_id = $2`,
    ['Berhitung Asyik: Penjumlahan & Pengurangan', teacherId]
  );
  if (exists.rowCount === 0) {
    const c = await pool.query(
      `INSERT INTO courses (title, description, category_id, teacher_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [
        'Berhitung Asyik: Penjumlahan & Pengurangan',
        'Belajar menjumlah dan mengurang dengan cerita sehari-hari, permainan angka, dan latihan singkat yang menyenangkan.',
        categoryId,
        teacherId,
      ]
    );
    const courseId = c.rows[0].id;
    const chapters = [
      ['Mengenal Angka dan Nilainya', 'Hai teman-teman!\n\nHari ini kita berkenalan dengan angka 1 sampai 100. Coba hitung benda di sekitarmu: berapa pensil di mejamu? Berapa buku di tasmu?\n\nTugas kecil: tuliskan 5 benda di rumah beserta jumlahnya.'],
      ['Menjumlah dengan Cerita', 'Bunga punya 5 apel, lalu Ibu memberi 3 apel lagi. Sekarang Bunga punya berapa apel?\n\n5 + 3 = 8\n\nMenjumlah artinya menggabungkan. Coba buat ceritamu sendiri dengan angka yang berbeda!'],
      ['Mengurang dengan Cerita', 'Ada 10 balon di taman. 4 balon terbang ke langit. Sisa balon di taman ada berapa?\n\n10 - 4 = 6\n\nMengurang artinya mengambil sebagian. Ayo latihan dengan 3 soal cerita buatanmu.'],
    ];
    for (let i = 0; i < chapters.length; i++) {
      await pool.query(
        `INSERT INTO contents (course_id, title, body, order_index) VALUES ($1, $2, $3, $4)`,
        [courseId, chapters[i][0], chapters[i][1], i + 1]
      );
    }
  }

  console.log('Seed selesai. Akun contoh:');
  console.log('  Admin   : admin@bellajar.id / admin123');
  console.log('  Teacher : guru@bellajar.id  / guru123');
  console.log('  Student : siswa@bellajar.id / siswa123');
  console.log('Segera ganti kata sandi ini jika dipakai di server publik.');
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
