import bcrypt from 'bcryptjs';
import { queryOne, query } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { ok, fail } from '@/lib/http';
import { parseApplication, saveApplication } from '@/lib/applications';
import { readPdfFile, saveCv, removeCv } from '@/lib/uploads';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pendaftaran PENGAJAR: akun + biodata + CV (PDF) + portofolio + bidang yang dilamar.
// Akun tersimpan sebagai role 'student' dengan teacher_status 'pending' sampai Admin menyetujui.
export async function POST(req) {
  let form;
  try {
    form = await req.formData();
  } catch {
    return fail('Data pendaftaran tidak valid.');
  }
  const get = (k) => String(form.get(k) ?? '').trim();

  const username = get('username');
  const email = get('email').toLowerCase();
  const password = String(form.get('password') || '');
  if (username.length < 3 || username.length > 50) return fail('Nama lengkap harus 3–50 karakter.');
  if (!EMAIL_RE.test(email) || email.length > 120) return fail('Format email belum benar.');
  if (password.length < 6) return fail('Kata sandi minimal 6 karakter.');

  const { data, error } = await parseApplication(get);
  if (error) return fail(error);
  const cv = await readPdfFile(form.get('cv'));
  if (cv.error) return fail(cv.error);

  const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
  if (exists) return fail('Email ini sudah terdaftar. Coba masuk saja ya.', 409);

  const hash = await bcrypt.hash(password, 10);
  const user = await queryOne(
    `INSERT INTO users (username, email, password, role, teacher_status)
     VALUES ($1, $2, $3, 'student', 'pending') RETURNING id`,
    [username, email, hash]
  );

  try {
    await saveApplication(user.id, data);
    saveCv(user.id, cv.buffer);
  } catch {
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    removeCv(user.id);
    return fail('Pendaftaran belum berhasil disimpan. Silakan coba lagi.', 500);
  }

  await setSession(user.id);
  return ok({}, 201);
}
