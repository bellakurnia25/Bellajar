'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

const EMPTY = { id: null, title: '', description: '', category_id: '', start_date: '', end_date: '', teacher_id: '' };

export default function CourseManager({ courses, categories, teachers, isAdmin, currentUserId }) {
  const router = useRouter();
  const [form, setForm] = useState(null); // null = form tertutup
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function openNew() {
    setError('');
    setForm({ ...EMPTY, teacher_id: String(currentUserId) });
  }

  function openEdit(c) {
    setError('');
    setForm({
      id: c.id,
      title: c.title,
      description: c.description,
      category_id: c.category_id ? String(c.category_id) : '',
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      teacher_id: String(c.teacher_id),
    });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        teacher_id: isAdmin ? form.teacher_id : undefined,
      };
      if (form.id) await api(`/api/courses/${form.id}`, 'PUT', payload);
      else await api('/api/courses', 'POST', payload);
      setForm(null);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(c) {
    if (!confirm(`Hapus kursus "${c.title}"? Semua materi, progres siswa, dan diskusinya ikut terhapus.`)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/courses/${c.id}`, 'DELETE');
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

      {!form && <button onClick={openNew} className="btn-primary">+ Kursus Baru</button>}

      {form && (
        <form onSubmit={save} className="card space-y-4 p-6">
          <h2 className="text-xl">{form.id ? 'Edit kursus' : 'Kursus baru'}</h2>
          {error && <div className="alert-error">{error}</div>}

          <div>
            <label className="label" htmlFor="c-title">Judul kursus</label>
            <input id="c-title" required minLength={3} maxLength={150} className="input" value={form.title} onChange={set('title')} placeholder="Contoh: Berhitung Asyik untuk Kelas 2" />
          </div>
          <div>
            <label className="label" htmlFor="c-desc">Deskripsi</label>
            <textarea id="c-desc" required minLength={10} rows={4} className="input" value={form.description} onChange={set('description')} placeholder="Ceritakan apa yang akan dipelajari anak-anak di kursus ini." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-cat">Kategori</label>
              <select id="c-cat" className="input" value={form.category_id} onChange={set('category_id')}>
                <option value="">Tanpa kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {isAdmin && (
              <div>
                <label className="label" htmlFor="c-teacher">Pengajar</label>
                <select id="c-teacher" className="input" value={form.teacher_id} onChange={set('teacher_id')}>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.username} ({t.role})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="label" htmlFor="c-start">Tanggal mulai (opsional)</label>
              <input id="c-start" type="date" className="input" value={form.start_date} onChange={set('start_date')} />
            </div>
            <div>
              <label className="label" htmlFor="c-end">Tanggal selesai (opsional)</label>
              <input id="c-end" type="date" className="input" value={form.end_date} onChange={set('end_date')} />
            </div>
          </div>
          <p className="text-sm text-stone-600">Kosongkan kedua tanggal agar kursus ini berakses Lifetime.</p>

          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Menyimpan…' : 'Simpan kursus'}</button>
            <button type="button" onClick={() => setForm(null)} className="btn-ghost">Batal</button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="card p-8 text-center text-stone-600">Belum ada kursus. Klik “Kursus Baru” untuk mulai.</div>
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <div key={c.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-2">
                  {c.category_name ? <span className="badge-amber">{c.category_name}</span> : <span className="badge-stone">Umum</span>}
                  <span className="badge-stone">{c.access_label}</span>
                </div>
                <h3 className="text-lg">{c.title}</h3>
                <p className="text-sm text-stone-600">
                  {isAdmin && <>Pengajar: {c.teacher_name} · </>}{c.total_contents} bab · {c.student_count} siswa
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/manage/courses/${c.id}/contents`} className="btn-green btn-sm">Kelola Materi</Link>
                <Link href={`/courses/${c.id}`} className="btn-ghost btn-sm">Lihat</Link>
                <button disabled={busy} onClick={() => openEdit(c)} className="btn-ghost btn-sm">Edit</button>
                <button disabled={busy} onClick={() => remove(c)} className="btn-danger btn-sm">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
