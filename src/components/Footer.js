import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-orange-100 bg-white print:hidden">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xl font-black text-orange-600">BELLAJAR</p>
          <p className="mt-1 max-w-xl text-sm text-stone-600">
            Kursus daring yang ramah untuk anak usia 7–12 tahun.
          </p>
          <p className="mt-3 max-w-xl rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
            Untuk Ayah &amp; Bunda: mohon dampingi si kecil saat belajar dan gunakan email orang tua
            saat mendaftar, agar progres dan sertifikatnya tersimpan dengan aman.
          </p>
        </div>
        <nav className="flex gap-4 text-sm font-bold text-stone-700 md:flex-col md:gap-2">
          <Link href="/" className="hover:text-orange-700">Beranda</Link>
          <Link href="/courses" className="hover:text-orange-700">Semua Kursus</Link>
          <Link href="/register" className="hover:text-orange-700">Daftar</Link>
        </nav>
      </div>
      <p className="border-t border-stone-100 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} BELLAJAR. Belajar jadi petualangan.
      </p>
    </footer>
  );
}
