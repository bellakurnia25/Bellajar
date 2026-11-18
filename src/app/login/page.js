import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Masuk – BELLAJAR' };

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/');
  const sp = await searchParams;
  const raw = String(sp?.next ?? '');
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl">Selamat datang kembali!</h1>
        <p className="mt-1 mb-6 text-stone-600">Masuk untuk melanjutkan belajar.</p>

        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
          <strong>Catatan untuk orang tua:</strong> mohon dampingi si kecil saat masuk dan belajar, ya.
          Gunakan akun yang didaftarkan dengan email orang tua.
        </div>

        <AuthForm mode="login" next={next} />

        <p className="mt-6 text-center text-sm text-stone-600">
          Belum punya akun?{' '}
          <Link href="/register" className="font-bold text-orange-700 hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
