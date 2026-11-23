import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson } from '@/lib/http';
import { validatePassword } from '@/lib/validators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'teacher', 'student'];

export async function POST(req) {
  try {
    const { res } = await guard(isAdmin);
    if (res) return res;

    const b = await readJson(req);
    const username = String(b?.username || '').trim();
    const email = String(b?.email || '').trim().toLowerCase();
    const password = String(b?.password || '');
    const role = String(b?.role || 'student');
    const teacherSpecialty = String(b?.teacher_specialty || '').trim();
    const teacherBio = String(b?.teacher_bio || '').trim();

    if (username.length < 3 || username.length > 50) {
      return fail('Nama harus 3–50 karakter.');
    }
    if (!EMAIL_RE.test(email) || email.length > 120) {
      return fail('Format email belum benar.');
    }

    const pwError = validatePassword(password);
    if (pwError) return fail(pwError);

    if (!ROLES.includes(role)) {
      return fail('Peran tidak valid.');
    }

    const dup = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (dup) {
      return fail('Email tersebut sudah terdaftar.', 409);
    }

    const isTeacher = role === 'teacher';
    const teacherStatus = isTeacher ? 'approved' : 'none';
    const hash = await bcrypt.hash(password, 10);

    const created = await queryOne(
      `INSERT INTO users (
         username, email, password, role, teacher_status,
         teacher_specialty, teacher_bio, approved_at
       )
       VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         CASE WHEN $8::boolean THEN CURRENT_TIMESTAMP ELSE NULL END
       )
       RETURNING id`,
      [
        username,
        email,
        hash,
        role,
        teacherStatus,
        isTeacher && teacherSpecialty ? teacherSpecialty : null,
        isTeacher && teacherBio ? teacherBio : null,
        isTeacher,
      ]
    );

    return ok({ id: created.id }, 201);
  } catch (err) {
    console.error('Create user error:', err);
    return fail('Gagal membuat pengguna baru.', 500);
  }
}