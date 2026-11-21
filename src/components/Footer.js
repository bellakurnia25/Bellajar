import { getCurrentUser } from '@/lib/auth';
import Logo from './Logo';

export default async function Footer() {
  const user = await getCurrentUser();
  const isStaffOrApplicant =
    user && (user.role === 'admin' || user.role === 'teacher' || user.teacher_status !== 'none');

  return (
    <footer className="mt-16 overflow-hidden bg-gradient-to-b from-white via-brand-50/60 to-sky-50/70 print:hidden">
      <div className="hero-gradient h-2" />

      {/* Poin 5 & 26: Navbar footer dihapus; desain lebih ramai & ceria sesuai tema dasar, dan berbeda untuk Admin/Pengajar */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Logo />
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                ✨ Belajar Ceria Setiap Hari
              </span>
            </div>
            <p className="max-w-xl text-sm text-stone-600">
              Platform pembelajaran daring interaktif untuk anak usia 5–11 tahun dengan materi bertahap per bab,
              pemantauan progres otomatis, dan sertifikat kelulusan.
            </p>

            {/* Dekorasi elemen ceria */}
            <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-brand-800">
              <span className="rounded-full border border-brand-200 bg-white px-3 py-1 shadow-sm">🚀 Petualangan Bab</span>
              <span className="rounded-full border border-sky-200 bg-white px-3 py-1 shadow-sm">🎨 Materi Kreatif</span>
              <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 shadow-sm">🏅 Sertifikat Kelulusan</span>
            </div>
          </div>

          {/* Kotak kanan menyesuaikan jenis user (Poin 26) */}
          {isStaffOrApplicant ? (
            <div className="rounded-3xl border-2 border-brand-200 bg-white p-5 shadow-md shadow-brand-100">
              <p className="text-sm font-extrabold text-brand-800">
                {user.role === 'admin' ? 'Panel Tata Kelola BELLAJAR' : 'Ruang Pengajar BELLAJAR'}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                {user.role === 'admin'
                  ? 'Pastikan setiap pengajuan pengajar dan kualitas materi kursus telah ditinjau demi kenyamanan belajar anak-anak.'
                  : 'Susun materi pembelajaran yang ringkas, jelas, dan ramah anak agar setiap bab mudah dipahami siswa.'}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-md shadow-amber-200/50">
              <p className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
                <span>👨‍👩‍👧‍👦</span> Untuk Ayah &amp; Bunda
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-800">
                Mohon dampingi si kecil saat belajar dan gunakan alamat email orang tua saat pendaftaran agar
                riwayat belajar serta sertifikat kelulusannya tersimpan dengan aman.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 pt-5 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} BELLAJAR. Belajar Jadi Petualangan, Satu Bab Setiap Hari.</p>
          <p className="font-semibold text-brand-700">✦ Cerdas · Kreatif · Ceria ✦</p>
        </div>
      </div>
    </footer>
  );
}
