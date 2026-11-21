'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfileModal({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user.username || '');
  const [email, setEmail] = useState(user.email || '');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, currentPassword, newPassword }),
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
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline"
      >
        Edit Profil
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
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
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                  {success}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-bold text-stone-700">Nama Lengkap / Panggilan</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-stone-700">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="border-t border-stone-100 pt-3">
                <label className="mb-1 block text-sm font-bold text-stone-700">
                  Password Baru <span className="font-normal text-stone-400">(opsional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengganti"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Kolom Password Lama otomatis muncul saat Password Baru mulai diisi */}
              {newPassword.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-bold text-stone-700">
                    Password Lama <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password saat ini untuk konfirmasi"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-outline"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
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