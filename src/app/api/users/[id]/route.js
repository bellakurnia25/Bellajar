import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['admin', 'teacher', 'student'];

export async function PUT(req, { params }) {
  const { user: me, res } = await guard(isAdmin);
  if (res) return res;
  const id = toId((await params).id);
  if (!id) return fail('ID tidak valid.');

  const b = await readJson(req);
  const username = String(b?.username || '').trim();
  const email = String(b?.email || '').trim().toLowerCase();
  const role = String(b?.role || '');
  const password = String(b?.password || '');

  if (username.length < 3 || username.length > 50) return fail('Nama harus 3–50 karakter.');
  if (!EMAIL_RE.test(email)) return fail('Format email belum benar.');
  if (!ROLES.includes(role)) return fail('Peran tidak valid.');
  if (password && password.length < 6) return fail('Kata sandi baru minimal 6 karakter.');

  const target = await queryOne('SELECT id, teacher_status FROM users WHERE id = $1', [id]);
  if (!target) return fail('Pengguna tidak ditemukan.', 404);
  if (id === me.id && role !== 'admin') return fail('Kamu tidak bisa mengubah peran akunmu sendiri.');

  const dup = await queryOne('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id]);
  if (dup) return fail('Email itu sudah dipakai pengguna lain.', 409);

  // Jaga konsistensi peran dan status teacher.
  let status = target.teacher_status;
  if (role === 'teacher') status = 'approved';
  else if (role === 'admin') status = 'none';
  else if (status === 'approved') status = 'none';
  const approved = status === 'approved';
  const hash = password ? await bcrypt.hash(password, 10) : null;

  await queryOne(
    `UPDATE users
     SET username = $1, email = $2, role = $3, teacher_status = $4,
         approved_at = CASE WHEN $5::boolean THEN COALESCE(approved_at, CURRENT_TIMESTAMP) ELSE NULL END,
         password = COALESCE($6, password)
     WHERE id = $7 RETURNING id`,
    [username, email, role, status, approved, hash, id]
  );
  return ok();
}

export async function DELETE(_req, { params }) {
  const { user: me, res } = await guard(isAdmin);
  if (res) return res;
  const id = toId((await params).id);
  if (!id) return fail('ID tidak valid.');
  if (id === me.id) return fail('Kamu tidak bisa menghapus akunmu sendiri.');

  const row = await queryOne('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (!row) return fail('Pengguna tidak ditemukan.', 404);
  return ok();
}
