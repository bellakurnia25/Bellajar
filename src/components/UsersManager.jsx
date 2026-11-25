'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

function getDisplayRole(u) {
  if (u.role === 'admin') return 'Admin';
  if (u.role === 'teacher') return 'Pengajar';
  if (u.teacher_status === 'pending' || u.teacher_status === 'rejected') return 'Calon Pengajar';
  return 'Siswa';
}

function StatusBadge({ u }) {
  if (u.teacher_status === 'pending') return <span className="badge-amber">Menunggu Tinjauan</span>;
  if (u.teacher_status === 'approved') return <span className="badge-green">Disetujui</span>;
  if (u.teacher_status === 'rejected') return <span className="badge-red">Ditolak</span>;
  return <span className="text-stone-400">–</span>;
}

function isTeacherApplicantUser(u) {
  return u.role === 'student' && (u.teacher_status === 'pending' || u.teacher_status === 'rejected');
}

const EMPTY_CREATE_FORM = {
  username: '',
  email: '',
  password: '',
  role: 'student',
  teacher_specialty: '',
  teacher_bio: '',
};

/* Kumpulan Ikon Vektor SVG (bukan emoticon & bukan teks) */
function IconFile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function UsersManager({ users, currentUserId }) {
  const router = useRouter();
  const [filter, setFilter] = useState('fixed'); // 'fixed' | 'pending'
  const [creating, setCreating] = useState(null);
  const [editing, setEditing] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { user, action: 'reject' | 'pending', note: '' }
  const [detailModal, setDetailModal] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  // Kelompok 1: Pengguna Resmi (Admin, Siswa murni, dan Pengajar resmi - tanpa Calon Pengajar)
  const fixedUsers = users.filter((u) => !isTeacherApplicantUser(u));

  // Kelompok 2: Calon Pengajar (Pending / Rejected)
  const applicantUsers = users.filter((u) => isTeacherApplicantUser(u));

  const shown = filter === 'pending' ? applicantUsers : fixedUsers;

  async function run(fn, okMsg = '') {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await fn();
      if (okMsg) setSuccess(okMsg);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const approve = (u) =>
    run(() => api(`/api/users/${u.id}/teacher`, 'POST', { action: 'approve' }), `Akun "${u.username}" disetujui sebagai Pengajar.`);

  const submitReviewNote = (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    run(async () => {
      await api(`/api/users/${reviewModal.user.id}/teacher`, 'POST', {
        action: reviewModal.action,
        note: reviewModal.note,
      });
      setReviewModal(null);
    }, 'Catatan evaluasi berhasil dikirim.');
  };

  const remove = (u) => {
    if (!confirm(`Hapus pengguna "${u.username}"? Kursus, progres, dan sertifikat miliknya ikut terhapus.`)) return;
    run(() => api(`/api/users/${u.id}`, 'DELETE'), `Pengguna "${u.username}" berhasil dihapus.`);
  };

  async function create(e) {
    e.preventDefault();
    await run(async () => {
      await api('/api/users', 'POST', creating);
      setCreating(null);
      setFilter('fixed');
    }, 'Pengguna baru berhasil ditambahkan.');
  }

  async function save(e) {
    e.preventDefault();
    await run(async () => {
      await api(`/api/users/${editing.id}`, 'PUT', editing);
      setEditing(null);
    }, 'Perubahan pengguna berhasil disimpan.');
  }

  return (
    <div className="space-y-5">
      {error && <div className="alert-error">{error}</div>}
      {success && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-800">
          {success}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('fixed')}
            className={filter === 'fixed' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
          >
            Pengguna Resmi ({fixedUsers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
          >
            Calon Pengajar ({applicantUsers.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setError('');
            setSuccess('');
            setCreating(creating ? null : { ...EMPTY_CREATE_FORM });
          }}
          className="btn-green btn-sm"
        >
          {creating ? 'Tutup Form' : '+ Tambah Pengguna'}
        </button>
      </div>

      {/* Form Tambah Pengguna Baru */}
      {creating && (
        <form onSubmit={create} className="card space-y-4 border-2 border-emerald-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink">Tambah Pengguna Baru</h2>
            <span className="badge-green">Langsung Aktif</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cu-name">Nama Lengkap *</label>
              <input
                id="cu-name"
                className="input"
                required
                minLength={3}
                maxLength={50}
                value={creating.username}
                onChange={(e) => setCreating({ ...creating, username: e.target.value })}
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="label" htmlFor="cu-email">Email *</label>
              <input
                id="cu-email"
                type="email"
                className="input"
                required
                value={creating.email}
                onChange={(e) => setCreating({ ...creating, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label className="label" htmlFor="cu-role">Peran *</label>
              <select
                id="cu-role"
                className="input"
                value={creating.role}
                onChange={(e) => setCreating({ ...creating, role: e.target.value })}
              >
                <option value="student">Siswa</option>
                <option value="teacher">Pengajar (Langsung Disetujui)</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="cu-pass">Kata Sandi *</label>
              <input
                id="cu-pass"
                type="password"
                required
                minLength={6}
                className="input"
                value={creating.password}
                onChange={(e) => setCreating({ ...creating, password: e.target.value })}
                placeholder="Minimal 6 karakter"
              />
            </div>

            {creating.role === 'teacher' && (
              <>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="cu-spec">Bidang Keahlian Pengajar (opsional)</label>
                  <input
                    id="cu-spec"
                    className="input"
                    value={creating.teacher_specialty}
                    onChange={(e) => setCreating({ ...creating, teacher_specialty: e.target.value })}
                    placeholder="Contoh: Matematika Dasar, Pemrograman Anak"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="cu-bio">Biodata Singkat Pengajar (opsional)</label>
                  <textarea
                    id="cu-bio"
                    rows={3}
                    className="input"
                    value={creating.teacher_bio}
                    onChange={(e) => setCreating({ ...creating, teacher_bio: e.target.value })}
                    placeholder="Latar belakang singkat atau pengalaman mengajar..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={busy} className="btn-green">
              {busy ? 'Menyimpan...' : 'Buat Akun Pengguna'}
            </button>
            <button type="button" onClick={() => setCreating(null)} className="btn-ghost">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Modal Detail Berkas Calon Pengajar */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xl font-extrabold text-ink">Berkas Calon Pengajar</h2>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                aria-label="Tutup modal"
                className="rounded-full p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <IconX />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold text-stone-500">Nama &amp; Email</p>
                <p className="break-words font-semibold text-ink">
                  {detailModal.username} ({detailModal.email})
                </p>
              </div>
              <div>
                <p className="font-bold text-stone-500">Bidang yang Dilamar</p>
                <p className="break-words font-semibold text-brand-700">{detailModal.teacher_specialty || '-'}</p>
              </div>
              <div>
                <p className="font-bold text-stone-500">Biodata Singkat</p>
                <p className="mt-1 whitespace-pre-wrap break-all rounded-2xl bg-stone-50 p-3 text-stone-700">
                  {detailModal.teacher_bio || '-'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                {detailModal.teacher_cv_url && (
                  <a
                    href={detailModal.teacher_cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm"
                  >
                    Buka Berkas CV
                  </a>
                )}
                {detailModal.teacher_portfolio_url && (
                  <a
                    href={detailModal.teacher_portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline btn-sm"
                  >
                    Buka Portofolio
                  </a>
                )}
              </div>
              {detailModal.teacher_review_note && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3">
                  <p className="font-bold text-amber-900">Catatan Evaluasi Sebelumnya:</p>
                  <p className="whitespace-pre-wrap break-words text-amber-800">{detailModal.teacher_review_note}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
              <button type="button" onClick={() => setDetailModal(null)} className="btn-ghost btn-sm">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alasan Reject / Pending */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form onSubmit={submitReviewNote} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-extrabold text-ink">
              {reviewModal.action === 'reject' ? 'Tolak Pendaftaran Pengajar' : 'Tahan (Pending) & Minta Perbaikan'}
            </h2>
            <p className="text-sm text-stone-600">
              Berikan keterangan evaluasi untuk <strong>{reviewModal.user.username}</strong> agar pendaftar mengetahui kekurangannya dan dapat melakukan pendaftaran ulang.
            </p>
            <div>
              <label className="label" htmlFor="review-note">Alasan / Catatan Evaluasi *</label>
              <textarea
                id="review-note"
                required
                minLength={5}
                rows={4}
                className="input"
                value={reviewModal.note}
                onChange={(e) => setReviewModal({ ...reviewModal, note: e.target.value })}
                placeholder="Contoh: Tautan CV belum dapat diakses, mohon perbarui izin akses atau unggah ulang berkas CV."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReviewModal(null)} className="btn-ghost">
                Batal
              </button>
              <button
                type="submit"
                disabled={busy}
                className={reviewModal.action === 'reject' ? 'btn-danger' : 'btn-primary'}
              >
                {busy ? 'Menyimpan...' : 'Kirim Catatan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editing && (
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="text-lg">Edit pengguna</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="eu-name">Nama</label>
              <input
                id="eu-name"
                className="input"
                required
                value={editing.username}
                onChange={(e) => setEditing({ ...editing, username: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="eu-email">Email</label>
              <input
                id="eu-email"
                type="email"
                className="input"
                required
                value={editing.email}
                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="eu-role">Peran</label>
              <select
                id="eu-role"
                className="input"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              >
                <option value="student">Siswa</option>
                <option value="teacher">Pengajar</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="eu-pass">Kata sandi baru (opsional)</label>
              <input
                id="eu-pass"
                type="password"
                minLength={6}
                className="input"
                value={editing.password || ''}
                onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                placeholder="Kosongkan jika tidak diganti"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">
              Simpan perubahan
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost">
              Batal
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3 font-bold">Pengguna</th>
              <th className="px-4 py-3 font-bold">Peran</th>
              <th className="px-4 py-3 font-bold">Status Pengajar</th>
              <th className="px-4 py-3 font-bold">Bergabung</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-600">
                  {filter === 'pending'
                    ? 'Tidak ada calon pengajar yang menunggu peninjauan.'
                    : 'Tidak ada pengguna resmi di daftar ini.'}
                </td>
              </tr>
            )}
            {shown.map((u) => {
              const isApplicant = isTeacherApplicantUser(u);
              return (
                <tr key={u.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <p className="font-bold">
                      {u.username}
                      {u.id === currentUserId && <span className="ml-2 text-xs text-stone-500">(kamu)</span>}
                    </p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                    {u.teacher_specialty && (
                      <p className="mt-0.5 break-words text-xs font-semibold text-brand-700">Bidang: {u.teacher_specialty}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-stone">{getDisplayRole(u)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge u={u} />
                  </td>
                  <td className="px-4 py-3 text-stone-600">{u.created_label}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {isApplicant && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setDetailModal(u)}
                            title="Lihat Berkas"
                            aria-label="Lihat Berkas"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-brand-200 bg-white text-brand-700 transition hover:bg-brand-50 disabled:opacity-50"
                          >
                            <IconFile />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => approve(u)}
                            title="Setujui Pengajar"
                            aria-label="Setujui Pengajar"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <IconCheck />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setReviewModal({ user: u, action: 'pending', note: u.teacher_review_note || '' })
                            }
                            title="Pending + Catatan Evaluasi"
                            aria-label="Pending + Catatan Evaluasi"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-amber-300 bg-amber-50 text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            <IconClock />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              setReviewModal({ user: u, action: 'reject', note: u.teacher_review_note || '' })
                            }
                            title="Tolak + Alasan"
                            aria-label="Tolak + Alasan"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            <IconX />
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => {
                          setCreating(null);
                          setEditing({
                            id: u.id,
                            username: u.username,
                            email: u.email,
                            role: u.role,
                            password: '',
                          });
                        }}
                        title="Edit Pengguna"
                        aria-label="Edit Pengguna"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                      >
                        <IconPencil />
                      </button>
                      {u.id !== currentUserId && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => remove(u)}
                          title="Hapus Pengguna"
                          aria-label="Hapus Pengguna"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}