import { query, queryOne } from './db';

const PHONE_RE = /^[0-9+()\-\s]{8,20}$/;

/** Memvalidasi isian pendaftaran pengajar. `get(nama)` mengembalikan string terpangkas. */
export async function parseApplication(get) {
  const phone = get('phone');
  const city = get('city');
  const education = get('education');
  const experience = get('experience');
  const applied_for = get('applied_for');
  const portfolio_url = get('portfolio_url');

  if (!PHONE_RE.test(phone)) return { error: 'Nomor HP/WhatsApp belum benar (8–20 karakter angka).' };
  if (city.length < 2 || city.length > 100) return { error: 'Isi kota domisili.' };
  if (education.length < 2 || education.length > 100) return { error: 'Isi pendidikan terakhir.' };
  if (experience.length < 30) return { error: 'Ceritakan pengalaman atau tentang dirimu minimal 30 karakter.' };
  if (experience.length > 1500) return { error: 'Cerita tentang dirimu maksimal 1500 karakter.' };

  const categories = await query('SELECT name FROM categories');
  if (!applied_for) return { error: 'Pilih bidang yang kamu lamar sebagai pengajar.' };
  if (categories.length > 0 && !categories.some((c) => c.name === applied_for)) {
    return { error: 'Bidang yang dilamar tidak valid.' };
  }
  if (applied_for.length > 100) return { error: 'Nama bidang terlalu panjang.' };

  let url;
  try {
    url = new URL(portfolio_url);
  } catch {
    return { error: 'Tautan portofolio belum benar. Awali dengan https://' };
  }
  if (!['http:', 'https:'].includes(url.protocol) || portfolio_url.length > 300) {
    return { error: 'Tautan portofolio harus berawalan http:// atau https://' };
  }

  return { data: { phone, city, education, experience, applied_for, portfolio_url: url.toString() } };
}

/** Menyimpan pendaftaran (baru atau pendaftaran ulang) dengan status "menunggu tinjauan". */
export function saveApplication(userId, d) {
  return queryOne(
    `INSERT INTO teacher_applications
       (user_id, phone, city, education, experience, applied_for, portfolio_url, status, review_note)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', NULL)
     ON CONFLICT (user_id) DO UPDATE SET
       phone = EXCLUDED.phone, city = EXCLUDED.city, education = EXCLUDED.education,
       experience = EXCLUDED.experience, applied_for = EXCLUDED.applied_for,
       portfolio_url = EXCLUDED.portfolio_url, status = 'submitted', review_note = NULL,
       submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     RETURNING id`,
    [userId, d.phone, d.city, d.education, d.experience, d.applied_for, d.portfolio_url]
  );
}

export function getApplication(userId) {
  return queryOne('SELECT * FROM teacher_applications WHERE user_id = $1', [userId]);
}
