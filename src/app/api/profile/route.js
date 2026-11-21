import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PATCH(request) {
  try {
    const user = await requireApiUser();
    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const currentPassword = String(body.currentPassword || '');
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

    // Jika user mengisi password baru, wajib verifikasi password lama
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Masukkan password lama terlebih dahulu.' }, { status: 400 });
      }
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password baru minimal 6 karakter.' }, { status: 400 });
      }

      // Ambil password_hash dari database untuk dicocokkan
      const dbUser = await queryOne(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.id]
      );
      if (!dbUser || !dbUser.password_hash) {
        return NextResponse.json({ error: 'Data akun tidak ditemukan.' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, dbUser.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Password lama yang dimasukkan salah.' }, { status: 400 });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await queryOne(
        'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE id = $4 RETURNING id',
        [username, email, hashed, user.id]
      );
    } else {
      // Jika hanya mengubah username / email tanpa ganti password
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