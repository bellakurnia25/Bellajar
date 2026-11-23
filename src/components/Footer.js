import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Footer() {
  const user = await getCurrentUser();
  const isAdminOrTeacher =
    user?.role === 'admin' ||
    user?.role === 'teacher' ||
    user?.teacher_status === 'pending' ||
    user?.teacher_status === 'rejected';

  return (
    <footer className="relative bg-gradient-to-b from-[#e8f8dc] via-[#f4fbf0] to-white border-t-4 border-[#6cc638] text-stone-700">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          {/* Kiri: Logo Asli & Deskripsi */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center">
              <img
                src="/images/logo.png"
                alt="BELLAJAR"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-stone-600">
              Platform pembelajaran daring interaktif untuk anak usia 5–11 tahun dengan materi bertahap per bab,
              pemantauan progres otomatis, dan sertifikat kelulusan.
            </p>
          </div>

          {/* Kanan: Kotak Panduan Orang Tua (Hanya tampil untuk Tamu & Siswa) */}
          {!isAdminOrTeacher && (
            <div className="rounded-3xl border-2 border-amber-300 bg-amber-50/90 p-5 shadow-sm">
              <p className="text-sm font-extrabold text-amber-900">Untuk Ayah &amp; Bunda</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Mohon dampingi si kecil saat belajar dan gunakan alamat email orang tua saat pendaftaran agar riwayat
                belajar serta sertifikat kelulusannya tersimpan dengan aman.
              </p>
            </div>
          )}
        </div>

        {/* Bawah: Copyright */}
        <div className="mt-8 border-t border-emerald-200/80 pt-5 text-center text-xs font-medium text-stone-500">
          © 2026 BELLAJAR. Belajar Jadi Petualangan, Satu Bab Setiap Hari.
        </div>
      </div>
    </footer>
  );
}