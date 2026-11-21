import bcrypt from 'bcryptjs';
import { queryOne } from '@/lib/db';
import { setSession } from '@/lib/auth';
import { ok, fail, readJson } from '@/lib/http';

export async function POST(req) {
  try {
    const b = await readJson(req);
    const email = String(b?.email || '').trim().toLowerCase();
    const password = String(b?.password || '');
    if (!email || !password) return fail('Email dan kata sandi wajib diisi.', 400);

    const user = await queryOne('SELECT id, password FROM users WHERE email = $1', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return fail('Kata sandi atau email yang dimasukkan salah.', 401);
    }
    await setSession(user.id);
    return ok();
  } catch (err) {
    console.error('Login error:', err);
    return fail('Terjadi gangguan saat memproses login.', 500);
  }
}
