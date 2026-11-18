import crypto from 'crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { queryOne } from './db';

const COOKIE_NAME = 'bellajar_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari
const SECRET = process.env.SESSION_SECRET || 'dev-only-secret-ganti-di-produksi';

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(String(value)).digest('hex');
}

function readToken(token) {
  const [id, sig] = String(token || '').split('.');
  if (!id || !sig) return null;
  const expected = Buffer.from(sign(id));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  const n = Number(id);
  return Number.isInteger(n) ? n : null;
}

export async function setSession(userId) {
  const store = await cookies();
  store.set(COOKIE_NAME, `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Mengambil pengguna yang sedang masuk (data selalu segar dari database). */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const id = readToken(token);
  if (!id) return null;
  return queryOne(
    `SELECT id, username, email, role, teacher_status, approved_at, created_at
     FROM users WHERE id = $1`,
    [id]
  );
});

/** Admin, atau Teacher yang sudah di-approve, boleh mengelola kursus. */
export function canManageCourses(user) {
  return (
    !!user &&
    (user.role === 'admin' || (user.role === 'teacher' && user.teacher_status === 'approved'))
  );
}

export const isAdmin = (user) => !!user && user.role === 'admin';

/** Penjaga halaman (server component). */
export async function requirePageUser(check) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (check && !check(user)) redirect('/profile');
  return user;
}
