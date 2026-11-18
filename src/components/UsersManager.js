'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

const ROLE_LABEL = { admin: 'Admin', teacher: 'Teacher', student: 'Student' };

function StatusBadge({ u }) {
  if (u.teacher_status === 'pending') return <span className="badge-amber">Pending</span>;
  if (u.teacher_status === 'approved') return <span className="badge-green">Approved</span>;
  if (u.teacher_status === 'rejected') return <span className="badge-red">Rejected</span>;
  return <span className="text-stone-400">–</span>;
}

export default function UsersManager({ users, currentUserId }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const pendingCount = users.filter((u) => u.teacher_status === 'pending').length;
  const shown = filter === 'pending' ? users.filter((u) => u.teacher_status === 'pending') : users;

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

  const decide = (u, action) =>
    run(() => api(`/api/users/${u.id}/teacher`, 'POST', { action }));

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

      <div className="flex gap-2">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>Semua ({users.length})</button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}>Menunggu persetujuan ({pendingCount})</button>
      </div>

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
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
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
              <th className="px-4 py-3 font-bold">Status Teacher</th>
              <th className="px-4 py-3 font-bold">Bergabung</th>
              <th className="px-4 py-3 font-bold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-600">Tidak ada pengguna di daftar ini.</td></tr>
            )}
            {shown.map((u) => (
              <tr key={u.id} className="border-t border-stone-100">
                <td className="px-4 py-3">
                  <p className="font-bold">{u.username}{u.id === currentUserId && <span className="ml-2 text-xs text-stone-500">(kamu)</span>}</p>
                  <p className="text-xs text-stone-500">{u.email}</p>
                </td>
                <td className="px-4 py-3"><span className="badge-stone">{ROLE_LABEL[u.role]}</span></td>
                <td className="px-4 py-3"><StatusBadge u={u} /></td>
                <td className="px-4 py-3 text-stone-600">{u.created_label}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {(u.teacher_status === 'pending' || u.teacher_status === 'rejected') && u.role === 'student' && (
                      <button disabled={busy} onClick={() => decide(u, 'approve')} className="btn-green btn-sm">Approve</button>
                    )}
                    {u.teacher_status === 'pending' && (
                      <button disabled={busy} onClick={() => decide(u, 'reject')} className="btn-danger btn-sm">Reject</button>
                    )}
                    <button disabled={busy} onClick={() => setEditing({ id: u.id, username: u.username, email: u.email, role: u.role, password: '' })} className="btn-ghost btn-sm">Edit</button>
                    {u.id !== currentUserId && (
                      <button disabled={busy} onClick={() => remove(u)} className="btn-danger btn-sm">Hapus</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
