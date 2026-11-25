'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null); // { id, name }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  const add = (e) => {
    e.preventDefault();
    run(async () => {
      await api('/api/categories', 'POST', { name });
      setName('');
    });
  };

  const rename = (e) => {
    e.preventDefault();
    run(async () => {
      await api(`/api/categories/${editing.id}`, 'PUT', { name: editing.name });
      setEditing(null);
    });
  };

  const remove = (c) => {
    if (!confirm(`Hapus kategori "${c.name}"? Kursus di dalamnya akan menjadi "Umum".`)) return;
    run(() => api(`/api/categories/${c.id}`, 'DELETE'));
  };

  return (
    <div className="space-y-5">
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={add} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label" htmlFor="cat-name">Tambah kategori baru</label>
          <input id="cat-name" required minLength={2} maxLength={60} className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Sains Cilik" />
        </div>
        <button type="submit" disabled={busy} className="btn-primary">Tambah Kategori</button>
      </form>

      <div className="card divide-y divide-stone-100">
        {categories.length === 0 && <p className="p-6 text-center text-stone-600">Belum ada kategori. Tambahkan yang pertama di atas.</p>}
        {categories.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            {editing?.id === c.id ? (
              <form onSubmit={rename} className="flex flex-1 flex-wrap items-center gap-2">
                <input required minLength={2} maxLength={60} aria-label="Nama kategori" className="input flex-1" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <button type="submit" disabled={busy} className="btn-primary btn-sm">Simpan</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost btn-sm">Batal</button>
              </form>
            ) : (
              <>
                <div>
                  <span className="badge-amber">{c.name}</span>
                  <span className="ml-3 text-sm text-stone-500">{c.course_count} kursus</span>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => setEditing({ id: c.id, name: c.name })} className="btn-ghost btn-sm">Edit</button>
                  <button disabled={busy} onClick={() => remove(c)} className="btn-danger btn-sm">Hapus</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
