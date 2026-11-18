import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';

export const metadata = { title: 'Daftar – BELLAJAR' };

export default async function RegisterPage({ searchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/');
  const sp = await searchParams;
  const as = sp?.as === 'teacher' ? 'teacher' : 'student';

  const tab = (active) =>
    `flex-1 rounded-full px-4 py-2 text-center text-sm font-bold ${
      active ? 'bg-orange-600 text-white' : 'text-stone-700 hover:bg-orange-50'
    }`;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="card p-8">
        <h1 className="text-3xl">Buat akun BELLAJAR</h1>

        <div className="mt-5 flex gap-1 rounded-full border border-stone-200 bg-stone-50 p-1">
          <Link href="/register?as=student" className={tab(as === 'student')}>Register as Student</Link>
          <Link href="/register?as=teacher" className={tab(as === 'teacher')}>Register as Teacher</Link>
        </div>

        {as === 'student' ? (
          <div className="my-6 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            <strong>Halo Ayah &amp; Bunda!</strong> Bantu si kecil membuat akun menggunakan email orang
            tua agar progres belajar dan sertifikatnya tersimpan dengan aman.
          </div>
        ) : (
          <div className="my-6 rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Pendaftaran Teacher perlu disetujui Admin. Selama menunggu, kamu tetap bisa mengikuti kursus
            sebagai Student.
          </div>
        )}

        <AuthForm key={as} mode="register" as={as} />

        <p className="mt-6 text-center text-sm text-stone-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-bold text-orange-700 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
