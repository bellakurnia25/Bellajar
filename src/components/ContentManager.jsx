'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';
import { toYoutubeEmbedUrl, toYoutubeThumbnailUrl } from '@/lib/youtube';

export default function ContentManager({ courseId, contents, isFinalized: initialFinalized = false }) {
  const router = useRouter();
  const nextOrder = contents.length ? Math.max(...contents.map((c) => c.order_index)) + 1 : 1;
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [isFinalized, setIsFinalized] = useState(Boolean(initialFinalized));
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!showFinalizeModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !busy) {
        setShowFinalizeModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showFinalizeModal, busy]);

  const openNew = () => {
    if (isFinalized) return;
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
    if (isFinalized) return;
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

  async function confirmFinalize() {
    if (isFinalized || contents.length === 0) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/courses/${courseId}/finalize`, 'PATCH');
      setIsFinalized(true);
      setShowFinalizeModal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setShowFinalizeModal(false);
    } finally {
      setBusy(false);
    }
  }

  const previewEmbedUrl = form?.image_url ? toYoutubeEmbedUrl(form.image_url) : null;

  return (
    <div className="space-y-5">
      {/* Banner status penyusunan bab */}
      <div
        className={`card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center ${
          isFinalized
            ? 'border-emerald-300 bg-emerald-50/70'
            : 'border-amber-300 bg-amber-50/70'
        }`}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-stone-800">
              Status Penyusunan Bab:
            </h2>
            <span className={isFinalized ? 'badge-green' : 'badge-amber'}>
              {isFinalized ? 'Fiks / Selesai' : 'Masih Berlanjut (Draft)'}
            </span>
          </div>
          <p className="text-sm text-stone-600">
            {isFinalized
              ? 'Daftar bab sudah dikunci. Siswa yang menyelesaikan seluruh bab akan otomatis memperoleh sertifikat. Kamu masih dapat mengedit isi bab yang sudah ada.'
              : 'Selama berstatus Masih Berlanjut, sertifikat belum diterbitkan kepada siswa. Klik Fiksasi Daftar Bab apabila seluruh bab sudah lengkap.'}
          </p>
        </div>

        {!isFinalized && (
          <button
            type="button"
            disabled={busy || contents.length === 0}
            onClick={() => setShowFinalizeModal(true)}
            className="btn-green shrink-0"
          >
            Fiksasi Daftar Bab
          </button>
        )}
      </div>

      {/* Modal Konfirmasi Fiksasi */}
      {showFinalizeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs"
          onClick={() => !busy && setShowFinalizeModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="finalize-modal-title"
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-200/80 text-amber-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
                <div>
                  <span className="badge-amber mb-1">Konfirmasi Permanen</span>
                  <h3 id="finalize-modal-title" className="text-xl font-bold text-stone-900">
                    Fiksasi Daftar Bab Kursus?
                  </h3>
                </div>
              </div>
            </div>

            {/* Isi Modal */}
            <div className="space-y-4 px-6 py-5 text-sm text-stone-700">
              <p className="text-base font-medium leading-relaxed text-stone-800">
                Apakah kamu yakin seluruh bab pada kursus ini sudah selesai dan lengkap?
              </p>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 leading-relaxed text-stone-700">
                Setelah difiksasi, kamu <strong>tidak dapat menambah atau menghapus bab lagi</strong>, dan <strong>sertifikat kelulusan akan aktif</strong> bagi siswa yang menyelesaikan semua bab ({contents.length} bab).
              </div>
            </div>

            {/* Footer Tombol Aksi */}
            <div className="flex flex-col-reverse gap-2.5 border-t border-stone-100 bg-stone-50/70 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowFinalizeModal(false)}
                className="btn-ghost"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmFinalize}
                className="btn-green"
              >
                {busy ? 'Memfiksasi...' : 'Ya, Fiksasi Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && !form && <div className="alert-error">{error}</div>}
      {!form && !isFinalized && (
        <button onClick={openNew} className="btn-primary">+ Bab Baru</button>
      )}

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
                  {!isFinalized && (
                    <button disabled={busy} onClick={() => remove(c)} className="btn-danger btn-sm">Hapus</button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}