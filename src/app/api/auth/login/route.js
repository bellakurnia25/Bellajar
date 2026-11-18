import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/http';

export async function POST(req) {
  const b = await readJson(req);
  const email = String(b?.email || '').trim().toLowerCase();
  const password = String(b?.password || '');
  if (!email || !password) return fail('Email dan kata sandi wajib diisi.');

  const user = await queryOne('SELECT id, password FROM users WHERE email = $1', [email]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return fail('Email atau kata sandi belum cocok.', 401);
  }
  await setSession(user.id);
  return ok();
}
