'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

function isValidUrlOrUploaded(value, isUploaded) {
  const v = String(value || '').trim();
  if (!v) return false;

  // Tolak path lokal Windows/Mac atau file URI
  if (/^[a-zA-Z]:\\|^file:\/\//i.test(v)) return false;

  // Terima jika benar-benar berasal dari tombol unggah resmi aplikasi
  if (isUploaded && v.startsWith('/uploads/')) return true;

  // Jika input tautan manual, wajib format URL http:// atau https:// dengan domain valid
  try {
    const parsed = new URL(v);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

export default function AuthForm({ mode, as = 'student', next = '/' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const isTeacher = as === 'teacher';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    teacher_specialty: '',
    teacher_bio: '',
    teacher_cv_url: '',
    teacher_portfolio_url: '',
  });
  const [uploadedFlags, setUploadedFlags] = useState({
    teacher_cv_url: false,
    teacher_portfolio_url: false,
  });
  const [uploadingField, setUploadingField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (k === 'teacher_cv_url' || k === 'teacher_portfolio_url') {
      setUploadedFlags((prev) => ({ ...prev, [k]: false }));
    }
  };

  function validateAccountFields() {
    if (form.username.trim().length < 3) {
      return isTeacher
        ? 'Nama lengkap pengajar minimal 3 karakter.'
        : 'Nama panggilan si kecil minimal 3 karakter.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Masukkan alamat email yang valid.';
    }
    if (form.password.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      return 'Kata sandi minimal 6 karakter dan wajib mengandung kombinasi huruf serta angka.';
    }
    if (form.password !== form.confirmPassword) {
      return 'Konfirmasi kata sandi tidak cocok dengan kata sandi.';
    }
    return '';
  }

  function handleNextStep() {
    const validationErr = validateAccountFields();
    if (validationErr) {
      setError(validationErr);
      return;
    }
    setError('');
    setStep(2);
  }

  async function handleFileUpload(field, file) {
    if (!file) return;
    setUploadingField(field);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'docs');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengunggah berkas.');
      setForm((prev) => ({ ...prev, [field]: data.url }));
      setUploadedFlags((prev) => ({ ...prev, [field]: true }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingField('');
    }
  }

  function clearUploadedFile(field) {
    setForm((prev) => ({ ...prev, [field]: '' }));
    setUploadedFlags((prev) => ({ ...prev, [field]: false }));
  }

  async function submit(e) {
    e.preventDefault();
    if (isRegister && isTeacher && step === 1) {
      handleNextStep();
      return;
    }

    setError('');

    if (isRegister) {
      const validationErr = validateAccountFields();
      if (validationErr) {
        setError(validationErr);
        return;
      }
    }

    if (isRegister && isTeacher) {
      if (!isValidUrlOrUploaded(form.teacher_cv_url, uploadedFlags.teacher_cv_url)) {
        setError('CV wajib berupa tautan URL yang valid (contoh: https://drive.google.com/...) atau diunggah melalui tombol Unggah Berkas CV.');
        return;
      }
      if (!isValidUrlOrUploaded(form.teacher_portfolio_url, uploadedFlags.teacher_portfolio_url)) {
        setError('Portofolio wajib berupa tautan URL yang valid (contoh: https://drive.google.com/...) atau diunggah melalui tombol Unggah Berkas Portofolio.');
        return;
      }
    }

    setLoading(true);
    try {
      await api(isRegister ? '/api/auth/register' : '/api/auth/login', 'POST', {
        ...form,
        teacher_cv_url: form.teacher_cv_url.trim(),
        teacher_portfolio_url: form.teacher_portfolio_url.trim(),
        as,
      });
      router.push(isRegister && isTeacher ? '/' : next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const showAccountFields = !(isRegister && isTeacher && step === 2);
  const hasConfirmInput = isRegister && form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error" role="alert">{error}</div>}

      {/* Indikator Langkah Khusus Pendaftaran Pengajar */}
      {isRegister && isTeacher && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-2.5 text-xs font-bold">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-brand-700' : 'text-stone-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === 1 ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
              1
            </span>
            <span>Data Akun</span>
          </div>
          <div className="h-px flex-1 bg-brand-200" />
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-brand-700' : 'text-stone-400'}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${step === 2 ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
              2
            </span>
            <span>Berkas Pengajar</span>
          </div>
        </div>
      )}

      {/* STEP 1: Data Akun */}
      {showAccountFields && (
        <>
          {isRegister && (
            <div>
              <label className="label" htmlFor="username">
                {isTeacher ? 'Nama lengkap pengajar' : 'Nama panggilan si kecil'}
              </label>
              <input
                id="username"
                required
                minLength={3}
                maxLength={50}
                className="input"
                value={form.username}
                onChange={set('username')}
                placeholder={isTeacher ? 'Contoh: Bu Sari Wulandari' : 'Contoh: Raka'}
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="email">{isRegister && !isTeacher ? 'Email orang tua' : 'Email'}</label>
            <input
              id="email"
              type="email"
              required
              className="input"
              value={form.email}
              onChange={set('email')}
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="label" htmlFor="password">Kata sandi</label>
            <input
              id="password"
              type="password"
              required
              minLength={isRegister ? 6 : 1}
              className="input"
              value={form.password}
              onChange={set('password')}
              placeholder={isRegister ? 'Contoh: Belajar123' : 'Masukkan kata sandi'}
            />
            {isRegister && (
              <p className="mt-1.5 text-xs text-stone-500">
                Syarat kata sandi: minimal 6 karakter dan wajib mengandung kombinasi huruf serta angka.
              </p>
            )}
          </div>

          {isRegister && (
            <div>
              <label className="label" htmlFor="confirmPassword">Konfirmasi kata sandi</label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                className="input"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Ketik ulang kata sandi"
              />
              {hasConfirmInput && (
                <p className={`mt-1.5 text-xs font-semibold ${passwordsMatch ? 'text-emerald-700' : 'text-red-600'}`}>
                  {passwordsMatch ? '✓ Kata sandi cocok' : '✕ Kata sandi belum cocok'}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* STEP 2: Kelengkapan Berkas Pengajar */}
      {isRegister && isTeacher && step === 2 && (
        <div className="space-y-4 rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
            Kelengkapan Berkas Calon Pengajar
          </p>

          <div>
            <label className="label" htmlFor="teacher_specialty">Melamar sebagai pengajar bidang apa? *</label>
            <input
              id="teacher_specialty"
              required
              minLength={3}
              maxLength={150}
              className="input"
              value={form.teacher_specialty}
              onChange={set('teacher_specialty')}
              placeholder="Contoh: Pengajar Matematika Dasar & Logika"
            />
          </div>

          <div>
            <label className="label" htmlFor="teacher_bio">Biodata singkat &amp; pengalaman mengajar *</label>
            <textarea
              id="teacher_bio"
              required
              minLength={15}
              rows={3}
              className="input break-words"
              value={form.teacher_bio}
              onChange={set('teacher_bio')}
              placeholder="Ceritakan latar belakang pendidikan dan pengalaman membimbing anak..."
            />
          </div>

          <div>
            <label className="label" htmlFor="teacher_cv_url">CV (Tautan URL / Unggah Berkas) *</label>
            <input
              id="teacher_cv_url"
              type="text"
              required
              readOnly={uploadedFlags.teacher_cv_url}
              className="input"
              value={form.teacher_cv_url}
              onChange={set('teacher_cv_url')}
              placeholder="Tempel tautan https://... atau unggah berkas di bawah"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label
                title="Unggah Berkas CV (PDF/Gambar)"
                aria-label="Unggah Berkas CV (PDF/Gambar)"
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-brand-600 bg-white text-brand-700 shadow-xs transition hover:bg-brand-50 active:scale-[0.98]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploadingField}
                  onChange={(e) => handleFileUpload('teacher_cv_url', e.target.files?.[0])}
                />
              </label>

              <span className="text-xs font-medium text-stone-600">
                {uploadingField === 'teacher_cv_url' ? 'Mengunggah CV...' : 'Unggah Berkas CV (PDF/Gambar)'}
              </span>

              {uploadedFlags.teacher_cv_url && (
                <button
                  type="button"
                  onClick={() => clearUploadedFile('teacher_cv_url')}
                  className="btn-ghost btn-sm text-xs"
                >
                  Ganti dengan Tautan URL
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="teacher_portfolio_url">Portofolio Karya / Materi (Tautan URL / Unggah Berkas) *</label>
            <input
              id="teacher_portfolio_url"
              type="text"
              required
              readOnly={uploadedFlags.teacher_portfolio_url}
              className="input"
              value={form.teacher_portfolio_url}
              onChange={set('teacher_portfolio_url')}
              placeholder="Tempel tautan https://... atau unggah berkas di bawah"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label
                title="Unggah Berkas Portofolio (PDF/Gambar)"
                aria-label="Unggah Berkas Portofolio (PDF/Gambar)"
                className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-brand-600 bg-white text-brand-700 shadow-xs transition hover:bg-brand-50 active:scale-[0.98]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploadingField}
                  onChange={(e) => handleFileUpload('teacher_portfolio_url', e.target.files?.[0])}
                />
              </label>

              <span className="text-xs font-medium text-stone-600">
                {uploadingField === 'teacher_portfolio_url' ? 'Mengunggah Portofolio...' : 'Unggah Berkas Portofolio (PDF/Gambar)'}
              </span>

              {uploadedFlags.teacher_portfolio_url && (
                <button
                  type="button"
                  onClick={() => clearUploadedFile('teacher_portfolio_url')}
                  className="btn-ghost btn-sm text-xs"
                >
                  Ganti dengan Tautan URL
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tombol Navigasi / Submit */}
      {isRegister && isTeacher ? (
        step === 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="btn-primary w-full py-3 text-base"
          >
            Lanjut ke Kelengkapan Berkas →
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setError(''); setStep(1); }}
              disabled={loading || !!uploadingField}
              className="btn-outline px-4 py-3 text-sm"
            >
              ← Kembali
            </button>
            <button
              type="submit"
              disabled={loading || !!uploadingField}
              className="btn-primary flex-1 py-3 text-base"
            >
              {loading ? 'Memproses...' : 'Kirim Pendaftaran Pengajar'}
            </button>
          </div>
        )
      ) : (
        <button type="submit" disabled={loading || !!uploadingField} className="btn-primary w-full py-3 text-base">
          {loading
            ? 'Memproses...'
            : isRegister
            ? 'Buat Akun Siswa'
            : 'Masuk'}
        </button>
      )}
    </form>
  );
}