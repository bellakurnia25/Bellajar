'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/client-api';

export default function AuthForm({ mode, as = 'student', next = '/' }) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const isTeacher = as === 'teacher';
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api(isRegister ? '/api/auth/register' : '/api/auth/login', 'POST', {
        ...form,
        as,
      });
      router.push(isRegister && isTeacher ? '/profile' : next);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="alert-error" role="alert">{error}</div>}

      {isRegister && (
        <div>
          <label className="label" htmlFor="username">
            {isTeacher ? 'Nama lengkap pengajar' : 'Nama panggilan si kecil'}
          </label>
          <input id="username" required minLength={3} maxLength={50} className="input" value={form.username} onChange={set('username')} placeholder={isTeacher ? 'Contoh: Bu Sari Wulandari' : 'Contoh: Raka'} />
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">{isRegister && !isTeacher ? 'Email orang tua' : 'Email'}</label>
        <input id="email" type="email" required className="input" value={form.email} onChange={set('email')} placeholder="nama@email.com" />
      </div>

      <div>
        <label className="label" htmlFor="password">Kata sandi</label>
        <input id="password" type="password" required minLength={isRegister ? 6 : 1} className="input" value={form.password} onChange={set('password')} placeholder={isRegister ? 'Minimal 6 karakter' : 'Kata sandimu'} />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? 'Sebentar ya…' : isRegister ? (isTeacher ? 'Daftar sebagai Teacher' : 'Buat Akun') : 'Masuk'}
      </button>
    </form>
  );
}
