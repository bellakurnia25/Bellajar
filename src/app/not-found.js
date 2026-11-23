import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export const metadata = { title: 'Halaman Tidak Ditemukan – BELLAJAR' };

export default async function NotFound() {
  const user = await getCurrentUser();
  const homeHref = user?.role === 'admin' ? '/admin' : '/';

  return (
    <div className="page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card relative w-full max-w-xl overflow-hidden border-2 border-brand-200 p-8 text-center sm:p-12">
        {/* Dekorasi latar lembut */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-brand-100/70" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100/70" />

        <div className="relative space-y-5">
          {/* Logo / Ilustrasi Kustom 404 */}
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-brand-50 p-3 shadow-inner ring-1 ring-brand-100">
            <img
              src="/images/not-found.jpg"
              alt="Halaman Tidak Ditemukan – BELLAJAR"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="inline-block rounded-full bg-amber-100 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-800">
            Error 404 · Halaman Tersesat
          </div>

          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Ups! Halamannya Tidak Ketemu
          </h1>

          <p className="mx-auto max-w-md text-base leading-relaxed text-stone-600">
            Sepertinya tautan yang kamu tuju sudah dipindahkan, dihapus, atau alamatnya salah ketik. Yuk, kembali ke jalur belajar yang benar!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link href={homeHref} className="btn-primary px-6">
              {user?.role === 'admin' ? 'Kembali ke Dasbor Admin' : 'Kembali ke Beranda'}
            </Link>
            <Link href="/courses" className="btn-outline px-6">
              Jelajahi Kursus
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}