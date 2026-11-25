import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';
import { validatePassword } from '@/lib/validators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'teacher', 'student'];

export async function PUT(req, { params }) {
  try {
    const { res } = await guard(isAdmin);
    if (res) return res;

    const userId = toId((await params).id);
    if (!userId) return fail('ID pengguna tidak valid.', 400);

    const existing = await queryOne(
      'SELECT id, role, teacher_status, approved_at FROM users WHERE id = $1',
      [userId]
    );
    if (!existing) return fail('Pengguna tidak ditemukan.', 404);

    const b = await readJson(req);
    const username = String(b?.username || '').trim();
    const email = String(b?.email || '').trim().toLowerCase();
    const role = String(b?.role || existing.role);
    const password = String(b?.password || '');

    if (username.length < 3 || username.length > 50) {
      return fail('Nama harus 3–50 karakter.');
    }
    if (!EMAIL_RE.test(email) || email.length > 120) {
      return fail('Format email belum benar.');
    }
    if (!ROLES.includes(role)) {
      return fail('Peran tidak valid.');
    }

    const dup = await queryOne(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, userId]
    );
    if (dup) {
      return fail('Email tersebut sudah digunakan oleh pengguna lain.', 409);
    }

    let teacherStatus = existing.teacher_status;
    let shouldSetApprovedAt = false;
    if (role === 'teacher' && existing.role !== 'teacher') {
      teacherStatus = 'approved';
      shouldSetApprovedAt = true;
    } else if (role !== 'teacher' && existing.role === 'teacher') {
      teacherStatus = 'none';
    }

    if (password) {
      const pwError = validatePassword(password);
      if (pwError) return fail(pwError);
      const hash = await bcrypt.hash(password, 10);

      await queryOne(
        `UPDATE users
         SET username = $1,
             email = $2,
             role = $3,
             password = $4,
             teacher_status = $5,
             approved_at = CASE WHEN $6::boolean THEN CURRENT_TIMESTAMP ELSE approved_at END
         WHERE id = $7
         RETURNING id`,
        [username, email, role, hash, teacherStatus, shouldSetApprovedAt, userId]
      );
    } else {
      await queryOne(
        `UPDATE users
         SET username = $1,
             email = $2,
             role = $3,
             teacher_status = $4,
             approved_at = CASE WHEN $5::boolean THEN CURRENT_TIMESTAMP ELSE approved_at END
         WHERE id = $6
         RETURNING id`,
        [username, email, role, teacherStatus, shouldSetApprovedAt, userId]
      );
    }

    return ok({ updated: true });
  } catch (err) {
    console.error('Update user error:', err);
    return fail('Gagal memperbarui data pengguna.', 500);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { user: adminUser, res } = await guard(isAdmin);
    if (res) return res;

    const userId = toId((await params).id);
    if (!userId) return fail('ID pengguna tidak valid.', 400);

    if (userId === adminUser.id) {
      return fail('Tidak dapat menghapus akunmu sendiri.', 400);
    }

    const existing = await queryOne('SELECT id FROM users WHERE id = $1', [userId]);
    if (!existing) return fail('Pengguna tidak ditemukan.', 404);

    await queryOne('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    return ok({ deleted: true });
  } catch (err) {
    console.error('Delete user error:', err);
    return fail('Gagal menghapus pengguna.', 500);
  }
}