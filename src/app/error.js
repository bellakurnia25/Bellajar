'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card relative w-full max-w-xl overflow-hidden border-2 border-red-200 p-8 text-center sm:p-12">
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-red-100/60" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-100/60" />

        <div className="relative space-y-5">
          {/* Logo / Ilustrasi Kustom Error */}
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-red-50 p-3 shadow-inner ring-1 ring-red-100">
            <img
              src="/images/not-found.jpg"
              alt="Terjadi Gangguan – BELLAJAR"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="inline-block rounded-full bg-red-100 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-red-700">
            Terjadi Gangguan
          </div>

          <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
            Yah, Ada Kendala Sebentar
          </h1>

          <p className="mx-auto max-w-md text-base leading-relaxed text-stone-600">
            Sistem mengalami gangguan saat memuat halaman ini. Kamu bisa mencoba memuat ulang atau kembali ke halaman utama.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button type="button" onClick={() => reset()} className="btn-primary px-6">
              Coba Lagi
            </button>
            <Link href="/" className="btn-outline px-6">
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}