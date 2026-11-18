import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson } from '@/lib/http';

export async function POST(req) {
  const { res } = await guard(isAdmin);
  if (res) return res;

  const b = await readJson(req);
  const name = String(b?.name || '').trim();
  if (name.length < 2 || name.length > 60) return fail('Nama kategori harus 2–60 karakter.');

  const dup = await queryOne('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [name]);
  if (dup) return fail('Kategori dengan nama itu sudah ada.', 409);

  const category = await queryOne('INSERT INTO categories (name) VALUES ($1) RETURNING id, name', [name]);
  return ok({ category }, 201);
}
