'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function AuthForm({ mode, as = 'student', next = '/' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const isTeacher = as === 'teacher';
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    teacher_specialty: '',
    teacher_bio: '',
    teacher_cv_url: '',
    teacher_portfolio_url: '',
  });
  const [uploadingField, setUploadingField] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function handleNextStep() {
    setError('');
    if (form.username.trim().length < 3) {
      setError('Nama lengkap pengajar minimal 3 karakter.');
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (form.password.length < 6 || !/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      setError('Kata sandi minimal 6 karakter dan wajib mengandung kombinasi huruf serta angka.');
      return;
    }
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
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingField('');
    }
  }

  async function submit(e) {
    e.preventDefault();
    // Jika pengajar menekan Enter di Step 1, arahkan ke Step 2
    if (isRegister && isTeacher && step === 1) {
      handleNextStep();
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api(isRegister ? '/api/auth/register' : '/api/auth/login', 'POST', {
        ...form,
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

      {/* STEP 1: Data Akun (Muncul untuk Login, Siswa, atau Pengajar Step 1) */}
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
            {/* Poin 12: Keterangan syarat kata sandi */}
            <p className="mt-1.5 text-xs text-stone-500">
              Syarat kata sandi: minimal 6 karakter dan wajib mengandung kombinasi huruf serta angka.
            </p>
          </div>
        </>
      )}

      {/* STEP 2: Kelengkapan Berkas Pengajar (Muncul khusus Pengajar Step 2) */}
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
              className="input"
              value={form.teacher_bio}
              onChange={set('teacher_bio')}
              placeholder="Ceritakan latar belakang pendidikan dan pengalaman membimbing anak..."
            />
          </div>

          <div>
            <label className="label" htmlFor="teacher_cv_url">CV (Tautan Google Drive / PDF) *</label>
            <input
              id="teacher_cv_url"
              required
              className="input"
              value={form.teacher_cv_url}
              onChange={set('teacher_cv_url')}
              placeholder="Tempel tautan CV atau unggah berkas di bawah"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <label className="btn-outline btn-sm cursor-pointer">
                {uploadingField === 'teacher_cv_url' ? 'Mengunggah CV...' : 'Unggah Berkas CV (PDF/Gambar)'}
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploadingField}
                  onChange={(e) => handleFileUpload('teacher_cv_url', e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="teacher_portfolio_url">Portofolio Karya / Materi *</label>
            <input
              id="teacher_portfolio_url"
              required
              className="input"
              value={form.teacher_portfolio_url}
              onChange={set('teacher_portfolio_url')}
              placeholder="Tempel tautan portofolio atau unggah berkas di bawah"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <label className="btn-outline btn-sm cursor-pointer">
                {uploadingField === 'teacher_portfolio_url' ? 'Mengunggah...' : 'Unggah Berkas Portofolio'}
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={!!uploadingField}
                  onChange={(e) => handleFileUpload('teacher_portfolio_url', e.target.files?.[0])}
                />
              </label>
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