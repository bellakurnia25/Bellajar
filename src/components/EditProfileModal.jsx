'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AVATARS, getAvatar } from '@/lib/avatars';

export default function EditProfileModal({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
  const [avatar, setAvatar] = useState(user.avatar || 'default');
  const [teacherSpecialty, setTeacherSpecialty] = useState(user.teacher_specialty || '');
  const [teacherBio, setTeacherBio] = useState(user.teacher_bio || '');
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'avatars');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal mengunggah gambar.');
      } else {
        setAvatar(data.url);
      }
    } catch {
      setError('Gagal mengunggah gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          avatar,
          teacher_specialty: teacherSpecialty,
          teacher_bio: teacherBio,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal memperbarui profil.');
      } else {
        setSuccess('Profil berhasil diperbarui!');
        setCurrentPassword('');
        setNewPassword('');
        router.refresh();
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch {
      setError('Gagal menyimpan perubahan profil.');
    } finally {
      setLoading(false);
    }
  };

  const isUploadedImage = avatar?.startsWith('/uploads/');
  const activePreset = getAvatar(avatar);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-outline">
        Edit Profil
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xl font-extrabold text-ink">Edit Profil</h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full px-2.5 py-1 text-sm font-bold text-stone-500 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && <div className="alert-error">{error}</div>}
              {success && (
                <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              {/* Pratinjau Foto & Unggah Avatar */}
              <div className="flex items-center gap-4 rounded-2xl bg-stone-50 p-3">
                {isUploadedImage ? (
                  <img
                    src={avatar}
                    alt="Pratinjau Avatar"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-brand-500"
                  />
                ) : (
                  <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl font-black ${activePreset.bg}`}>
                    {activePreset.emoji || (username.charAt(0) || 'U').toUpperCase()}
                  </span>
                )}

                <div className="flex-1">
                  <label className="btn-outline btn-sm inline-block cursor-pointer">
                    {uploading ? 'Mengunggah...' : 'Unggah Foto Sendiri'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-stone-500">
                    JPG, PNG, WEBP, GIF (Maks. 5MB) atau pilih karakter di bawah:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {AVATARS.map((item) => {
                  const selected = avatar === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAvatar(item.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-2 transition ${
                        selected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/30'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-black ${item.bg}`}>
                        {item.emoji || (username.charAt(0) || 'U').toUpperCase()}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-stone-600">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-stone-700">Nama Lengkap / Panggilan</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-stone-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                />
              </div>

              {user.role === 'teacher' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-stone-700">Bidang Keahlian</label>
                    <input
                      type="text"
                      value={teacherSpecialty}
                      onChange={(e) => setTeacherSpecialty(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-stone-700">Biodata Singkat</label>
                    <textarea
                      rows={3}
                      value={teacherBio}
                      onChange={(e) => setTeacherBio(e.target.value)}
                      className="input"
                    />
                  </div>
                </>
              )}

              <div className="border-t border-stone-100 pt-3">
                <label className="mb-1 block text-sm font-bold text-stone-700">
                  Kata Sandi Baru <span className="font-normal text-stone-400">(opsional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengganti"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                />
                <p className="mt-1 text-[11px] text-stone-500">
                  Syarat kata sandi: minimal 6 karakter kombinasi huruf dan angka.
                </p>
              </div>

              {newPassword.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">
                    Kata Sandi Lama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan kata sandi saat ini untuk konfirmasi"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={handleClose} className="btn-outline">
                  Batal
                </button>
                <button type="submit" disabled={loading || uploading} className="btn-primary">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
