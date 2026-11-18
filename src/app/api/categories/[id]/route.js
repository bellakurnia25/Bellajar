import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';

export async function PUT(req, { params }) {
  const { res } = await guard(isAdmin);
  if (res) return res;
  const id = toId((await params).id);
  if (!id) return fail('ID tidak valid.');

  const b = await readJson(req);
  const name = String(b?.name || '').trim();
  if (name.length < 2 || name.length > 60) return fail('Nama kategori harus 2–60 karakter.');

  const dup = await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2', [name, id]);
  if (dup) return fail('Kategori dengan nama itu sudah ada.', 409);

  const row = await queryOne('UPDATE categories SET name = $1 WHERE id = $2 RETURNING id', [name, id]);
  if (!row) return fail('Kategori tidak ditemukan.', 404);
  return ok();
}

export async function DELETE(_req, { params }) {
  const { res } = await guard(isAdmin);
  if (res) return res;
  const id = toId((await params).id);
  if (!id) return fail('ID tidak valid.');

  // Kursus yang memakai kategori ini otomatis menjadi "tanpa kategori" (ON DELETE SET NULL).
  const row = await queryOne('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  if (!row) return fail('Kategori tidak ditemukan.', 404);
  return ok();
}
