'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import { toYoutubeEmbedUrl, toYoutubeThumbnailUrl } from '@/lib/youtube';

export default function ContentManager({ courseId, contents }) {
  const router = useRouter();
  const nextOrder = contents.length ? Math.max(...contents.map((c) => c.order_index)) + 1 : 1;
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const openNew = () => {
    setError('');
    setForm({ id: null, title: '', body: '', image_url: '', order_index: String(nextOrder) });
  };
  const openEdit = (c) => {
    setError('');
    setForm({
      id: c.id,
      title: c.title,
      body: c.body,
      image_url: c.image_url || '',
      order_index: String(c.order_index),
    });
  };

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'materials');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah gambar materi.');
      setForm((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        body: form.body,
        image_url: form.image_url || null,
        order_index: form.order_index,
      };
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

  const previewEmbedUrl = form?.image_url ? toYoutubeEmbedUrl(form.image_url) : null;

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

          {/* Media Materi: Gambar Ilustrasi atau Link Video YouTube */}
          <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-4">
            <label className="label" htmlFor="ct-image">Media Materi: Gambar atau Video YouTube (opsional)</label>
            <p className="mb-2 text-xs text-stone-600">
              Unggah gambar ilustrasi, tempel tautan gambar, atau tempel tautan video YouTube (misal: https://www.youtube.com/watch?v=...) agar langsung terputar di halaman belajar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="btn-outline btn-sm cursor-pointer">
                {uploading ? 'Mengunggah gambar...' : 'Unggah Gambar'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <input
                id="ct-image"
                type="text"
                className="input flex-1"
                value={form.image_url}
                onChange={set('image_url')}
                placeholder="Tempel link YouTube atau tautan gambar (https://...)"
              />
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image_url: '' })}
                  className="btn-danger btn-sm"
                >
                  Hapus Media
                </button>
              )}
            </div>

            {form.image_url && (
              <div className="mt-3">
                {previewEmbedUrl ? (
                  <div className="max-w-lg overflow-hidden rounded-2xl border border-brand-200 bg-black shadow-sm">
                    <div className="aspect-video w-full">
                      <iframe
                        src={previewEmbedUrl}
                        title="Pratinjau video YouTube"
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <img
                    src={form.image_url}
                    alt="Pratinjau gambar materi"
                    className="max-h-48 rounded-2xl border border-brand-200 object-contain bg-white p-2 shadow-sm"
                  />
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="ct-body">Isi materi</label>
            <textarea id="ct-body" required rows={10} className="input" value={form.body} onChange={set('body')} placeholder="Tulis materi dengan bahasa yang sederhana dan ramah anak. Baris baru akan tampil apa adanya." />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy || uploading} className="btn-primary">{busy ? 'Menyimpan...' : 'Simpan bab'}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-ghost">Batal</button>
          </div>
        </form>
      )}

      {contents.length === 0 ? (
        <div className="card p-8 text-center text-stone-600">Belum ada bab. Tambahkan bab pertama agar siswa bisa mulai belajar.</div>
      ) : (
        <ol className="space-y-3">
          {contents.map((c) => {
            const ytThumb = c.image_url ? toYoutubeThumbnailUrl(c.image_url) : null;
            return (
              <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">{c.order_index}</span>
                  {c.image_url && (
                    <img
                      src={ytThumb || c.image_url}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl border border-brand-100 object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">{c.title}</p>
                      {ytThumb && <span className="badge-amber">Video YouTube</span>}
                    </div>
                    <p className="truncate text-sm text-stone-500">{c.body}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy} onClick={() => openEdit(c)} className="btn-ghost btn-sm">Edit</button>
                  <button disabled={busy} onClick={() => remove(c)} className="btn-danger btn-sm">Hapus</button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}