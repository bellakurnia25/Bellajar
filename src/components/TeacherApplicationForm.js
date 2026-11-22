'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendForm } from '@/lib/client-api';
import PasswordHint from './PasswordHint';
import Spinner from './Spinner';

const EDUCATIONS = ['SMA/SMK sederajat', 'D3', 'S1', 'S2', 'S3'];

// mode "register": akun baru + berkas. mode "resubmit": pendaftar mengirim ulang / memperbaiki berkas.
export default function TeacherApplicationForm({ mode = 'register', categories = [], initial = {}, cvUserId = null }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [f, setF] = useState({
    username: '',
    email: '',
    password: '',
    phone: initial.phone || '',
    city: initial.city || '',
    education: initial.education || '',
    experience: initial.experience || '',
    applied_for: initial.applied_for || '',
    portfolio_url: initial.portfolio_url || '',
  });
  const [cv, setCv] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const educations = f.education && !EDUCATIONS.includes(f.education) ? [f.education, ...EDUCATIONS] : EDUCATIONS;

  function pickCv(e) {
    const file = e.target.files?.[0];
    setError('');
    if (!file) return setCv(null);
    if (file.type !== 'application/pdf') {
      setError('CV harus berupa file PDF.');
      e.target.value = '';
      return setCv(null);
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran CV maksimal 5 MB.');
      e.target.value = '';
      return setCv(null);
    }
    setCv(file);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (isRegister && !cv) return setError('Unggah CV dalam format PDF.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      if (cv) fd.append('cv', cv);
      await sendForm(isRegister ? '/api/auth/register-teacher' : '/api/teacher-application', fd);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  const section = 'space-y-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-4';

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="alert-error" role="alert">{error}</div>}

      {isRegister && (
        <fieldset className={section}>
          <legend className="px-1 text-sm font-bold text-brand-800">1. Akun</legend>
          <div>
            <label className="label" htmlFor="t-name">Nama lengkap</label>
            <input id="t-name" required minLength={3} maxLength={50} className="input" value={f.username} onChange={set('username')} placeholder="Contoh: Sari Wulandari" />
          </div>
          <div>
            <label className="label" htmlFor="t-email">Email</label>
            <input id="t-email" type="email" required className="input" value={f.email} onChange={set('email')} placeholder="nama@email.com" />
          </div>
          <div>
            <label className="label" htmlFor="t-pass">Kata sandi</label>
            <input id="t-pass" type="password" required minLength={6} className="input" value={f.password} onChange={set('password')} placeholder="Minimal 6 karakter" />
            <PasswordHint value={f.password} />
          </div>
        </fieldset>
      )}

      <fieldset className={section}>
        <legend className="px-1 text-sm font-bold text-brand-800">{isRegister ? '2. Biodata' : 'Biodata'}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="t-phone">Nomor HP / WhatsApp</label>
            <input id="t-phone" required inputMode="tel" className="input" value={f.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="label" htmlFor="t-city">Kota domisili</label>
            <input id="t-city" required maxLength={100} className="input" value={f.city} onChange={set('city')} placeholder="Contoh: Makassar" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="t-edu">Pendidikan terakhir</label>
          <select id="t-edu" required className="input" value={f.education} onChange={set('education')}>
            <option value="">Pilih pendidikan terakhir</option>
            {educations.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="t-exp">Tentang dirimu dan pengalaman mengajar</label>
          <textarea id="t-exp" required rows={5} maxLength={1500} className="input" value={f.experience} onChange={set('experience')} placeholder="Ceritakan singkat tentang dirimu, pengalaman mengajar atau bekerja dengan anak-anak, dan alasan ingin menjadi pengajar." />
          <p className={`mt-1 text-xs ${f.experience.length >= 30 ? 'text-emerald-700' : 'text-stone-500'}`}>
            {f.experience.length}/1500 karakter (minimal 30)
          </p>
        </div>
      </fieldset>

      <fieldset className={section}>
        <legend className="px-1 text-sm font-bold text-brand-800">{isRegister ? '3. Lamaran dan berkas' : 'Lamaran dan berkas'}</legend>
        <div>
          <label className="label" htmlFor="t-for">Melamar sebagai pengajar bidang</label>
          {categories.length > 0 ? (
            <select id="t-for" required className="input" value={f.applied_for} onChange={set('applied_for')}>
              <option value="">Pilih bidang yang kamu ajarkan</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input id="t-for" required maxLength={100} className="input" value={f.applied_for} onChange={set('applied_for')} placeholder="Contoh: Matematika" />
          )}
        </div>
        <div>
          <label className="label" htmlFor="t-cv">CV (PDF, maksimal 5 MB)</label>
          <input
            id="t-cv"
            type="file"
            accept="application/pdf"
            onChange={pickCv}
            className="block w-full text-sm text-stone-600 file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-brand-400 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-50"
          />
          {!isRegister && cvUserId && (
            <p className="mt-1 text-xs text-stone-600">
              CV sebelumnya sudah tersimpan (<a href={`/api/teacher-applications/${cvUserId}/cv`} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline">lihat</a>). Unggah file baru hanya jika ingin menggantinya.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="t-port">Tautan portofolio</label>
          <input id="t-port" type="url" required maxLength={300} className="input" value={f.portfolio_url} onChange={set('portfolio_url')} placeholder="https://drive.google.com/..." />
          <p className="mt-1 text-xs text-stone-500">Bisa berupa tautan Google Drive, YouTube, atau situs portofoliomu.</p>
        </div>
      </fieldset>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? (
          <>
            <Spinner /> Mengirim…
          </>
        ) : isRegister ? (
          'Kirim Pendaftaran'
        ) : (
          'Kirim Ulang Pendaftaran'
        )}
      </button>
      <p className="text-center text-xs text-stone-500">Pendaftaranmu akan ditinjau oleh Admin sebelum akun pengajarmu aktif.</p>
    </form>
  );
}
