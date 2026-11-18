import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/http';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  const b = await readJson(req);
  const username = String(b?.username || '').trim();
  const email = String(b?.email || '').trim().toLowerCase();
  const password = String(b?.password || '');
  const asTeacher = b?.as === 'teacher';

  if (username.length < 3 || username.length > 50) return fail('Nama harus 3–50 karakter.');
  if (!EMAIL_RE.test(email) || email.length > 120) return fail('Format email belum benar.');
  if (password.length < 6) return fail('Kata sandi minimal 6 karakter.');

  const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (exists) return fail('Email ini sudah terdaftar. Coba masuk saja ya.', 409);

  const hash = await bcrypt.hash(password, 10);
  // Pendaftar Teacher tetap role 'student' dengan status 'pending' sampai disetujui Admin.
  const user = await queryOne(
    `INSERT INTO users (username, email, password, role, teacher_status)
     VALUES ($1, $2, $3, 'student', $4) RETURNING id`,
    [username, email, hash, asTeacher ? 'pending' : 'none']
  );
  await setSession(user.id);
  return ok({ pendingTeacher: asTeacher }, 201);
}
