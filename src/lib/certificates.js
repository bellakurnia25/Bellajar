import crypto from 'crypto';
import { queryOne } from './db';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa karakter yang mirip (O/0, I/1)

function makeCode() {
  const bytes = crypto.randomBytes(6);
  let suffix = '';
  for (let i = 0; i < 6; i++) suffix += ALPHABET[bytes[i] % ALPHABET.length];
  return `BLJR-${new Date().getFullYear()}-${suffix}`;
}

/** Menerbitkan sertifikat (sekali per siswa per kursus) dan mengembalikan kodenya. */
export async function issueCertificate(userId, courseId) {
  const find = () =>
    queryOne('SELECT certificate_code FROM certificates WHERE user_id = $1 AND course_id = $2', [userId, courseId]);

  const existing = await find();
  if (existing) return existing.certificate_code;

  for (let i = 0; i < 5; i++) {
    const row = await queryOne(
      `INSERT INTO certificates (user_id, course_id, certificate_code)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING certificate_code`,
      [userId, courseId, makeCode()]
    );
    if (row) return row.certificate_code;
    const again = await find();
    if (again) return again.certificate_code;
  }
  return null;
}
