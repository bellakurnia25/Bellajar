import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-16 bg-white print:hidden">
      <div className="hero-gradient h-2" />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <Logo />
          <p className="mt-2 max-w-xl text-sm text-stone-600">Kursus daring yang ramah untuk anak usia 5-11 tahun.</p>
          <p className="mt-4 max-w-xl rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            <strong>Untuk Ayah &amp; Bunda:</strong> mohon dampingi si kecil saat belajar dan gunakan email orang
            tua saat mendaftar, agar progres dan sertifikatnya tersimpan dengan aman.
          </p>
        </div>
        <nav aria-label="Tautan footer" className="flex gap-3 text-sm font-semibold md:flex-col md:gap-2">
          <Link href="/" className="text-brand-700 hover:underline">Beranda</Link>
          <Link href="/courses" className="text-brand-700 hover:underline">Semua Kursus</Link>
          <Link href="/register" className="text-brand-700 hover:underline">Daftar</Link>
        </nav>
      </div>
      <p className="border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} BELLAJAR. Belajar jadi petualangan.
      </p>
    </footer>
  );
}
