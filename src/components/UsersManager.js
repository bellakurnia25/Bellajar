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

export default function UsersManager({ users, currentUserId }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // { user, action: 'reject' | 'pending', note: '' }
  const [detailModal, setDetailModal] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const applicantCount = users.filter(
    (u) => u.role === 'student' && (u.teacher_status === 'pending' || u.teacher_status === 'rejected')
  ).length;

  const shown =
    filter === 'pending'
      ? users.filter((u) => u.role === 'student' && (u.teacher_status === 'pending' || u.teacher_status === 'rejected'))
      : users;

  async function run(fn) {
    setBusy(true);
    setError('');
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const approve = (u) =>
    run(() => api(`/api/users/${u.id}/teacher`, 'POST', { action: 'approve' }));

  const submitReviewNote = (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    run(async () => {
      await api(`/api/users/${reviewModal.user.id}/teacher`, 'POST', {
        action: reviewModal.action,
        note: reviewModal.note,
      });
      setReviewModal(null);
    });
  };

  const remove = (u) => {
    if (!confirm(`Hapus pengguna "${u.username}"? Kursus, progres, dan sertifikat miliknya ikut terhapus.`)) return;
    run(() => api(`/api/users/${u.id}`, 'DELETE'));
  };

  async function save(e) {
    e.preventDefault();
    await run(async () => {
      await api(`/api/users/${editing.id}`, 'PUT', editing);
      setEditing(null);
    });
  }

  return (
    <div className="space-y-5">
      {error && <div className="alert-error">{error}</div>}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>
          Semua Pengguna ({users.length})
        </button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>
          Calon Pengajar ({applicantCount})
        </button>
      </div>

      {/* Modal Detail Berkas Calon Pengajar (Poin 16) */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-xl font-extrabold text-ink">Berkas Calon Pengajar</h2>
              <button type="button" onClick={() => setDetailModal(null)} className="rounded-full px-2.5 py-1 text-sm font-bold text-stone-500 hover:bg-stone-100">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold text-stone-500">Nama &amp; Email</p>
                <p className="font-semibold text-ink">{detailModal.username} ({detailModal.email})</p>
              </div>
              <div>
                <p className="font-bold text-stone-500">Bidang yang Dilamar</p>
                <p className="font-semibold text-brand-700">{detailModal.teacher_specialty || '-'}</p>
              </div>
              <div>
                <p className="font-bold text-stone-500">Biodata Singkat</p>
                <p className="whitespace-pre-line rounded-2xl bg-stone-50 p-3 text-stone-700">{detailModal.teacher_bio || '-'}</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                {detailModal.teacher_cv_url && (
                  <a href={detailModal.teacher_cv_url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                    Buka Berkas CV
                  </a>
                )}
                {detailModal.teacher_portfolio_url && (
                  <a href={detailModal.teacher_portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                    Buka Portofolio
                  </a>
                )}
              </div>
              {detailModal.teacher_review_note && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3">
                  <p className="font-bold text-amber-900">Catatan Evaluasi Sebelumnya:</p>
                  <p className="text-amber-800">{detailModal.teacher_review_note}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
              <button type="button" onClick={() => setDetailModal(null)} className="btn-ghost btn-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alasan Reject / Pending (Poin 22) */}
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
              <button type="button" onClick={() => setReviewModal(null)} className="btn-ghost">Batal</button>
              <button type="submit" disabled={busy} className={reviewModal.action === 'reject' ? 'btn-danger' : 'btn-primary'}>
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
              <input id="eu-name" className="input" required value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="eu-email">Email</label>
              <input id="eu-email" type="email" className="input" required value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="eu-role">Peran</label>
              <select id="eu-role" className="input" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                <option value="student">Siswa</option>
                <option value="teacher">Pengajar</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="eu-pass">Kata sandi baru (opsional)</label>
              <input id="eu-pass" type="password" minLength={6} className="input" value={editing.password || ''} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder="Kosongkan jika tidak diganti" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">Simpan perubahan</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Batal</button>
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
              <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-600">Tidak ada pengguna di daftar ini.</td></tr>
            )}
            {shown.map((u) => {
              const isApplicant = u.role === 'student' && (u.teacher_status === 'pending' || u.teacher_status === 'rejected');
              return (
                <tr key={u.id} className="border-t border-stone-100">
                  <td className="px-4 py-3">
                    <p className="font-bold">{u.username}{u.id === currentUserId && <span className="ml-2 text-xs text-stone-500">(kamu)</span>}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                    {u.teacher_specialty && <p className="mt-0.5 text-xs font-semibold text-brand-700">Bidang: {u.teacher_specialty}</p>}
                  </td>
                  <td className="px-4 py-3"><span className="badge-stone">{getDisplayRole(u)}</span></td>
                  <td className="px-4 py-3"><StatusBadge u={u} /></td>
                  <td className="px-4 py-3 text-stone-600">{u.created_label}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {isApplicant && (
                        <>
                          <button disabled={busy} onClick={() => setDetailModal(u)} className="btn-outline btn-sm">Lihat Berkas</button>
                          <button disabled={busy} onClick={() => approve(u)} className="btn-green btn-sm">Setujui</button>
                          <button disabled={busy} onClick={() => setReviewModal({ user: u, action: 'pending', note: u.teacher_review_note || '' })} className="btn-ghost btn-sm">Pending + Catatan</button>
                          <button disabled={busy} onClick={() => setReviewModal({ user: u, action: 'reject', note: u.teacher_review_note || '' })} className="btn-danger btn-sm">Tolak + Alasan</button>
                        </>
                      )}
                      <button disabled={busy} onClick={() => setEditing({ id: u.id, username: u.username, email: u.email, role: u.role, password: '' })} className="btn-ghost btn-sm">Edit</button>
                      {u.id !== currentUserId && (
                        <button disabled={busy} onClick={() => remove(u)} className="btn-danger btn-sm">Hapus</button>
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
