'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function ContentManager({ courseId, contents }) {
  const router = useRouter();
  const nextOrder = contents.length ? Math.max(...contents.map((c) => c.order_index)) + 1 : 1;
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => {
    setError('');
    setForm({ id: null, title: '', body: '', order_index: String(nextOrder) });
  };
  const openEdit = (c) => {
    setError('');
    setForm({ id: c.id, title: c.title, body: c.body, order_index: String(c.order_index) });
  };

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { title: form.title, body: form.body, order_index: form.order_index };
      if (form.id) await api(`/api/contents/${form.id}`, 'PUT', payload);
      else await api(`/api/courses/${courseId}/contents`, 'POST', payload);
      setForm(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(c) {
    if (!confirm(`Hapus bab "${c.title}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/contents/${c.id}`, 'DELETE');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && !form && <div className="alert-error">{error}</div>}
      {!form && <button onClick={openNew} className="btn-primary">+ Bab Baru</button>}

      {form && (
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="text-xl">{form.id ? 'Edit bab' : 'Bab baru'}</h2>
          {error && <div className="alert-error">{error}</div>}
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <div>
              <label className="label" htmlFor="ct-title">Judul bab</label>
              <input id="ct-title" required minLength={2} maxLength={150} className="input" value={form.title} onChange={set('title')} placeholder="Contoh: Mengenal Angka" />
            </div>
            <div>
              <label className="label" htmlFor="ct-order">Urutan</label>
              <input id="ct-order" type="number" min={1} required className="input" value={form.order_index} onChange={set('order_index')} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="ct-body">Isi materi</label>
            <textarea id="ct-body" required rows={10} className="input" value={form.body} onChange={set('body')} placeholder="Tulis materi dengan bahasa yang sederhana dan ramah anak. Baris baru akan tampil apa adanya." />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Menyimpan…' : 'Simpan bab'}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-ghost">Batal</button>
          </div>
        </form>
      )}

      {contents.length === 0 ? (
        <div className="card p-8 text-center text-stone-600">Belum ada bab. Tambahkan bab pertama agar siswa bisa mulai belajar.</div>
      ) : (
        <ol className="space-y-3">
          {contents.map((c) => (
            <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">{c.order_index}</span>
                <div className="min-w-0">
                  <p className="font-bold">{c.title}</p>
                  <p className="truncate text-sm text-stone-500">{c.body}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button disabled={busy} onClick={() => openEdit(c)} className="btn-ghost btn-sm">Edit</button>
                <button disabled={busy} onClick={() => remove(c)} className="btn-danger btn-sm">Hapus</button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
