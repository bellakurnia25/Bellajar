import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth'; // sesuaikan jika nama helper API Anda berbeda
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs'; // sesuaikan dengan library hash password di auth.js Anda

export async function PATCH(request) {
  try {
    // Jika di lib/auth.js tidak ada requireApiUser, gunakan getCurrentUser() / requirePageUser()
    const user = await requireApiUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const newPassword = String(body.newPassword || '');

    if (!username || username.length < 2) {
      return NextResponse.json({ error: 'Nama minimal 2 karakter.' }, { status: 400 });
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    // Cek apakah email sudah dipakai akun lain
    const duplicate = await queryOne(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, user.id]
    );
    if (duplicate) {
      return NextResponse.json({ error: 'Email sudah digunakan oleh pengguna lain.' }, { status: 409 });
    }

    // Update dengan password baru jika diisi, atau hanya username & email jika kosong
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      await queryOne(
        'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING id',
        [username, email, hashed, user.id]
      );
    } else {
      await queryOne(
        'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id',
        [username, email, user.id]
      );
    }

    return NextResponse.json({ message: 'Profil berhasil diperbarui!' });
  } catch (err) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}