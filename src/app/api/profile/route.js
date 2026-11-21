import bcrypt from 'bcryptjs';
import { guard } from '@/lib/guard';
import { queryOne } from '@/lib/db';
import { AVATARS } from '@/lib/avatars';
import { ok, fail, readJson } from '@/lib/http';
import { validatePassword } from '@/lib/validators';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(request) {
  try {
    const { user, res } = await guard();
    if (res) return res;

    const body = await readJson(request);
    if (!body) return fail('Data tidak valid.');

    // Mode khusus pendaftaran ulang calon pengajar (poin 23)
    if (body.mode === 'reapply_teacher') {
      if (user.role !== 'student' || !['pending', 'rejected'].includes(user.teacher_status)) {
        return fail('Akun ini tidak dalam status pendaftaran pengajar.', 400);
      }
      const specialty = String(body.teacher_specialty || '').trim();
      const bio = String(body.teacher_bio || '').trim();
      const cvUrl = String(body.teacher_cv_url || '').trim();
      const portfolioUrl = String(body.teacher_portfolio_url || '').trim();

      if (specialty.length < 3) return fail('Bidang keahlian pengajar minimal 3 karakter.');
      if (bio.length < 15) return fail('Biodata singkat minimal 15 karakter.');
      if (!cvUrl) return fail('Berkas atau tautan CV wajib diisi.');
      if (!portfolioUrl) return fail('Berkas atau tautan portofolio wajib diisi.');

      await queryOne(
        `UPDATE users
         SET teacher_status = 'pending',
             teacher_specialty = $1,
             teacher_bio = $2,
             teacher_cv_url = $3,
             teacher_portfolio_url = $4,
             teacher_review_note = NULL
         WHERE id = $5 RETURNING id`,
        [specialty, bio, cvUrl, portfolioUrl, user.id]
      );
      return ok({ message: 'Pengajuan pendaftaran ulang berhasil dikirim!' });
    }

    const username = String(body.username || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const rawAvatar = String(body.avatar || user.avatar || 'default');
    const isPreset = AVATARS.some((a) => a.id === rawAvatar);
    const isUploaded = rawAvatar.startsWith('/uploads/avatars/');
    const avatar = isPreset || isUploaded ? rawAvatar : 'default';

    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');
    const teacherBio = body.teacher_bio !== undefined ? String(body.teacher_bio || '').trim() : user.teacher_bio;
    const teacherSpecialty =
      body.teacher_specialty !== undefined ? String(body.teacher_specialty || '').trim() : user.teacher_specialty;

    if (username.length < 3 || username.length > 50) {
      return fail('Nama harus terdiri dari 3–50 karakter.');
    }
    if (!EMAIL_RE.test(email)) {
      return fail('Format email tidak valid.');
    }

    const duplicate = await queryOne(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, user.id]
    );
    if (duplicate) {
      return fail('Email sudah digunakan oleh pengguna lain.', 409);
    }

    if (newPassword) {
      if (!currentPassword) {
        return fail('Masukkan kata sandi lama terlebih dahulu.');
      }
      const pwErr = validatePassword(newPassword);
      if (pwErr) return fail(pwErr);

      const dbUser = await queryOne('SELECT password FROM users WHERE id = $1', [user.id]);
      if (!dbUser || !dbUser.password) {
        return fail('Data akun tidak ditemukan.', 404);
      }

      const isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isMatch) {
        return fail('Kata sandi lama yang dimasukkan salah.', 400);
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await queryOne(
        `UPDATE users
         SET username = $1, email = $2, avatar = $3, password = $4,
             teacher_bio = $5, teacher_specialty = $6
         WHERE id = $7 RETURNING id`,
        [username, email, avatar, hashed, teacherBio || null, teacherSpecialty || null, user.id]
      );
    } else {
      await queryOne(
        `UPDATE users
         SET username = $1, email = $2, avatar = $3,
             teacher_bio = $4, teacher_specialty = $5
         WHERE id = $6 RETURNING id`,
        [username, email, avatar, teacherBio || null, teacherSpecialty || null, user.id]
      );
    }

    return ok({ message: 'Profil berhasil diperbarui!' });
  } catch (err) {
    console.error('Update profile error:', err);
    return fail('Terjadi kesalahan saat menyimpan profil.', 500);
  }
}
