import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getCourses, getCategories } from '@/lib/queries';
import { CHIP_COLORS } from '@/lib/ui';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';
import HeroKids from '@/components/HeroKids';


// file = nama gambar (tanpa ekstensi) di public/images/why/
const WHY = [
  { file: 'bab', emoji: '📖', title: 'Satu bab setiap hari', text: 'Materi dibagi per bab yang singkat, jadi mudah diikuti anak.', tone: 'bg-brand-100' },
  { file: 'progres', emoji: '🌱', title: 'Progres tersimpan', text: 'Lanjut belajar kapan saja dari bab terakhir yang dibuka.', tone: 'bg-emerald-100' },
  { file: 'sertifikat', emoji: '🏅', title: 'Sertifikat otomatis', text: 'Terbit saat semua bab selesai, siap dicetak dan dipajang.', tone: 'bg-amber-100' },
];

function findWhyImage(base) {
  for (const ext of ['png', 'webp', 'jpg', 'jpeg', 'svg']) {
    if (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'why', `${base}.${ext}`))) {
      return `/images/why/${base}.${ext}`;
    }
  }
  return null;
}

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? '').trim();
  const categoryId = sp?.category ? Number(sp.category) : null;
  const searching = Boolean(q || categoryId);

  const user = await getCurrentUser();
  const userId = user?.id ?? null;

  const [categories, popular, results] = await Promise.all([
    getCategories(),
    getCourses({ userId, popular: true, limit: 5 }),
    searching ? getCourses({ userId, search: q, categoryId }) : Promise.resolve([]),
  ]);

  const shadow = { textShadow: '0 2px 14px rgba(120, 40, 160, 0.35)' };
  const why = WHY.map((w) => ({ ...w, image: findWhyImage(w.file) }));

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <span aria-hidden="true" className="twinkle absolute left-[46%] top-[14%] text-2xl text-white">✦</span>
        <span aria-hidden="true" className="twinkle absolute left-[8%] top-[62%] text-lg text-white" style={{ animationDelay: '1s' }}>✦</span>
        <span aria-hidden="true" className="twinkle absolute right-[10%] top-[10%] text-xl text-yellow-200" style={{ animationDelay: '2s' }}>✦</span>

        <div className="mx-auto grid max-w-6xl items-end gap-2 px-4 sm:px-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="pb-8 pt-12 sm:pt-16 lg:pb-16">
            <h1 className="max-w-lg text-4xl font-bold leading-[1.2] text-white sm:text-5xl sm:leading-[1.2]" style={shadow}>              Belajar jadi petualangan, satu bab setiap hari.
            </h1>
            <p className="mt-2 max-w-md text-base font-medium text-white" style={shadow}>
              Kursus daring untuk anak usia 7–12 tahun. Materi singkat, progres tersimpan, dan sertifikat
              otomatis saat semua bab selesai.
            </p>
            <div className="mt-6 max-w-xl rounded-2xl bg-white p-3 shadow-lg">
              <SearchForm action="/" categories={categories} q={q} category={categoryId || ''} />
            </div>
          </div>
          <div className="self-end pb-0">
            <HeroKids />
          </div>
        </div>
      </section>

      <div className="page space-y-14">
        {/* Kategori */}
        {categories.length > 0 && (
          <section aria-labelledby="kategori">
            <h2 id="kategori" className="mb-4 text-xl">Mau belajar apa hari ini?</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/?category=${c.id}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${CHIP_COLORS[i % CHIP_COLORS.length]} ${
                    categoryId === c.id ? 'ring-2 ring-brand-600 ring-offset-2' : ''
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {searching && (
          <section>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl">Hasil pencarian ({results.length})</h2>
              <Link href="/" className="text-sm font-semibold text-brand-700 hover:underline">Hapus filter</Link>
            </div>
            {results.length === 0 ? (
              <div className="card p-8 text-center text-stone-600">
                Belum ada kursus yang cocok. Coba kata kunci lain atau pilih kategori yang berbeda.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((c) => <CourseCard key={c.id} course={c} loggedIn={!!user} />)}
              </div>
            )}
          </section>
        )}

        {/* Terpopuler */}
        <section>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl">5 Kursus Terpopuler</h2>
            <Link href="/courses" className="text-sm font-semibold text-brand-700 hover:underline">Lihat semua kursus →</Link>
          </div>
          {popular.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">Kursus pertama akan segera hadir. Nantikan ya!</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((c) => <CourseCard key={c.id} course={c} loggedIn={!!user} />)}
            </div>
          )}
        </section>

        {/* Kenapa BELLAJAR */}
        <section aria-labelledby="kenapa">
          <h2 id="kenapa" className="mb-5 text-2xl">Kenapa belajar di BELLAJAR?</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {why.map((w) => (
              <div key={w.title} className="card p-6">
                <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${w.tone}`}>
                  {w.image ? (
                    <img src={w.image} alt="" className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="text-3xl" aria-hidden="true">{w.emoji}</span>
                  )}
                </span>
                <h3 className="mt-4 text-lg">{w.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{w.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Orang tua */}
        <section className="soft-gradient grid gap-6 rounded-3xl p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-2xl">Halo Ayah &amp; Bunda!</h2>
            <p className="mt-2 max-w-2xl text-stone-700">
              Bantu si kecil membuat akun menggunakan email orang tua. Dengan begitu progres belajar dan
              sertifikatnya tersimpan dengan aman, dan Ayah &amp; Bunda bisa ikut memantau.
            </p>
          </div>
          {!user && <Link href="/register" className="btn-primary px-7 py-3">Buat Akun Si Kecil</Link>}
        </section>
      </div>
    </>
  );
}
