import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';
import Logo from '@/components/Logo';

export const metadata = { title: 'Masuk – BELLAJAR' };

export default async function LoginPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/');
  const sp = await searchParams;
  const raw = String(sp?.next ?? '');
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  return (
    <div className="soft-gradient px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="card p-8">
          <div className="mb-4 flex justify-center"><Logo size="lg" /></div>
          <h1 className="text-center text-2xl">Selamat datang kembali!</h1>
          <p className="mb-6 mt-1 text-center text-sm text-stone-600">Masuk untuk melanjutkan belajar.</p>

          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            <strong>Catatan untuk orang tua:</strong> mohon dampingi si kecil saat masuk dan belajar, ya.
            Gunakan akun yang didaftarkan dengan email orang tua.
          </div>

          <AuthForm mode="login" next={next} />

          <p className="mt-6 text-center text-sm text-stone-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">Daftar di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
