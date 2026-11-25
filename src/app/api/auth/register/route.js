import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/http';
import { validatePassword } from '@/lib/validators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPLOADED_DOC_RE = /^\/uploads\/docs\/[a-zA-Z0-9._-]+$/;

function isValidUrlOrUploadedDoc(value) {
  const v = String(value || '').trim();
  if (!v) return false;

  // Tolak path lokal komputer (Windows/Mac/file URI)
  if (/^[a-zA-Z]:\\|^file:\/\//i.test(v)) return false;

  // Terima path resmi hasil upload aplikasi (/uploads/docs/namafile.ext)
  if (UPLOADED_DOC_RE.test(v)) return true;

  // Selain itu wajib format URL http:// atau https:// yang valid dan memiliki domain
  try {
    const parsed = new URL(v);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const b = await readJson(req);
    const username = String(b?.username || '').trim();
    const email = String(b?.email || '').trim().toLowerCase();
    const password = String(b?.password || '');
    const confirmPassword = String(b?.confirmPassword || '');
    const asTeacher = b?.as === 'teacher';

    const teacherSpecialty = String(b?.teacher_specialty || '').trim();
    const teacherBio = String(b?.teacher_bio || '').trim();
    const teacherCvUrl = String(b?.teacher_cv_url || '').trim();
    const teacherPortfolioUrl = String(b?.teacher_portfolio_url || '').trim();

    if (username.length < 3 || username.length > 50) return fail('Nama harus 3–50 karakter.');
    if (!EMAIL_RE.test(email) || email.length > 120) return fail('Format email belum benar.');

    const pwError = validatePassword(password);
    if (pwError) return fail(pwError);

    if (!confirmPassword) {
      return fail('Konfirmasi kata sandi wajib diisi.');
    }
    if (password !== confirmPassword) {
      return fail('Konfirmasi kata sandi tidak cocok.');
    }

    if (asTeacher) {
      if (teacherSpecialty.length < 3) {
        return fail('Bidang keahlian / posisi pengajar yang dilamar wajib diisi (minimal 3 karakter).');
      }
      if (teacherBio.length < 15) {
        return fail('Biodata singkat wajib diisi (minimal 15 karakter).');
      }
      if (!isValidUrlOrUploadedDoc(teacherCvUrl)) {
        return fail('CV wajib berupa tautan URL yang valid (https://...) atau unggahan berkas resmi.');
      }
      if (!isValidUrlOrUploadedDoc(teacherPortfolioUrl)) {
        return fail('Portofolio wajib berupa tautan URL yang valid (https://...) atau unggahan berkas resmi.');
      }
    }

    const exists = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (exists) return fail('Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.', 409);

    const hash = await bcrypt.hash(password, 10);
    // Pendaftar pengajar berstatus 'pending' sampai disetujui Admin
    const user = await queryOne(
      `INSERT INTO users (
         username, email, password, role, teacher_status,
         teacher_specialty, teacher_bio, teacher_cv_url, teacher_portfolio_url
       )
       VALUES ($1, $2, $3, 'student', $4, $5, $6, $7, $8) RETURNING id`,
      [
        username,
        email,
        hash,
        asTeacher ? 'pending' : 'none',
        asTeacher ? teacherSpecialty : null,
        asTeacher ? teacherBio : null,
        asTeacher ? teacherCvUrl : null,
        asTeacher ? teacherPortfolioUrl : null,
      ]
    );
    await setSession(user.id);
    return ok({ pendingTeacher: asTeacher }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return fail('Gagal membuat akun. Periksa kembali isian formulir.', 500);
  }
}