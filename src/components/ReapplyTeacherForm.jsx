'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

function isValidUrlOrUploaded(value, isUploaded) {
  const v = String(value || '').trim();
  if (!v) return false;

  // Tolak path lokal seperti C:\... atau file://
  if (/^[a-zA-Z]:\\|^file:\/\//i.test(v)) return false;

  // Jika berasal dari tombol unggah resmi aplikasi
  if (isUploaded && v.startsWith('/uploads/')) return true;

  // Jika tautan manual, wajib URL http/https dengan domain valid (mengandung titik)
  try {
    const parsed = new URL(v);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export default function ReapplyTeacherForm({ user }) {
  const router = useRouter();
  const [open, setOpen] = useState(user.teacher_status === 'rejected');
  const [specialty, setSpecialty] = useState(user.teacher_specialty || '');
  const [bio, setBio] = useState(user.teacher_bio || '');
  const [cvUrl, setCvUrl] = useState(user.teacher_cv_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(user.teacher_portfolio_url || '');

  const [cvUploaded, setCvUploaded] = useState(String(user.teacher_cv_url || '').startsWith('/uploads/'));
  const [portfolioUploaded, setPortfolioUploaded] = useState(String(user.teacher_portfolio_url || '').startsWith('/uploads/'));

  const [uploading, setUploading] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleUpload(setter, flagSetter, key, file) {
    if (!file) return;
    setUploading(key);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'docs');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah berkas.');
      setter(data.url);
      flagSetter(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading('');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isValidUrlOrUploaded(cvUrl, cvUploaded)) {
      setError('Berkas CV harus berupa tautan URL yang valid (contoh: https://drive.google.com/...) atau diunggah melalui tombol Unggah Ulang CV.');
      return;
    }

    if (!isValidUrlOrUploaded(portfolioUrl, portfolioUploaded)) {
      setError('Berkas Portofolio harus berupa tautan URL yang valid (contoh: https://drive.google.com/...) atau diunggah melalui tombol Unggah Ulang Portofolio.');
      return;
    }

    setBusy(true);
    try {
      await api('/api/profile', 'PATCH', {
        mode: 'reapply_teacher',
        teacher_specialty: specialty,
        teacher_bio: bio,
        teacher_cv_url: cvUrl.trim(),
        teacher_portfolio_url: portfolioUrl.trim(),
      });
      setSuccess('Pengajuan pendaftaran ulang berhasil dikirim! Admin akan segera meninjau berkasmu.');
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {success && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="btn-primary">
          Perbarui Berkas &amp; Daftar Ulang
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-ink">Formulir Pendaftaran Ulang Pengajar</h3>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost btn-sm">Tutup</button>
          </div>
          {error && <div className="alert-error">{error}</div>}

          <div>
            <label className="label">Melamar sebagai pengajar bidang apa? *</label>
            <input
              required
              minLength={3}
              className="input"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Biodata singkat *</label>
            <textarea
              required
              minLength={15}
              rows={3}
              className="input break-words"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Berkas / Tautan CV *</label>
            <input
              required
              type="text"
              placeholder="Tempel tautan https://... atau unggah berkas di bawah"
              className="input"
              value={cvUrl}
              readOnly={cvUploaded}
              onChange={(e) => {
                setCvUrl(e.target.value);
                setCvUploaded(false);
              }}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="btn-outline btn-sm inline-block cursor-pointer">
                {uploading === 'cv' ? 'Mengunggah CV...' : 'Unggah Ulang CV (PDF/Gambar)'}
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploading}
                  onChange={(e) => handleUpload(setCvUrl, setCvUploaded, 'cv', e.target.files?.[0])}
                />
              </label>
              {cvUploaded && (
                <button
                  type="button"
                  onClick={() => {
                    setCvUrl('');
                    setCvUploaded(false);
                  }}
                  className="btn-ghost btn-sm text-xs"
                >
                  Ganti dengan Tautan URL
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label">Berkas / Tautan Portofolio *</label>
            <input
              required
              type="text"
              placeholder="Tempel tautan https://... atau unggah berkas di bawah"
              className="input"
              value={portfolioUrl}
              readOnly={portfolioUploaded}
              onChange={(e) => {
                setPortfolioUrl(e.target.value);
                setPortfolioUploaded(false);
              }}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="btn-outline btn-sm inline-block cursor-pointer">
                {uploading === 'pf' ? 'Mengunggah Portofolio...' : 'Unggah Ulang Portofolio (PDF/Gambar)'}
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploading}
                  onChange={(e) => handleUpload(setPortfolioUrl, setPortfolioUploaded, 'pf', e.target.files?.[0])}
                />
              </label>
              {portfolioUploaded && (
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioUrl('');
                    setPortfolioUploaded(false);
                  }}
                  className="btn-ghost btn-sm text-xs"
                >
                  Ganti dengan Tautan URL
                </button>
              )}
            </div>
          </div>

          <button type="submit" disabled={busy || !!uploading} className="btn-primary">
            {busy ? 'Mengirim...' : 'Kirim Pendaftaran Ulang'}
          </button>
        </form>
      )}
    </div>
  );
}