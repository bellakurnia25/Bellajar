import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getCourses, getCategories } from '@/lib/queries';
import { CHIP_COLORS } from '@/lib/ui';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';
import HeroKids from '@/components/HeroKids';
import ArtSlot from '@/components/ArtSlot';
import ParentCard from './ParentCard';


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

export default async function GuestHome({ searchParams }) {
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

  // HAPUS kode `const shadow = ...` yang lama, GANTI dengan ini:
    const shadow3dTitle = {
      fontFamily: "'Nunito', sans-serif", 
      textShadow: `
        0 1px 0 #7b2cbf,
        0 2px 0 #5a189a,
        0 3px 0 #3c096c,
        0 6px 12px rgba(35, 10, 65, 0.45)
      `,
    };

    const shadow3dSubtitle = {
      textShadow: '0 2px 6px rgba(45, 15, 85, 0.75)',
    };
  const why = WHY.map((w) => ({ ...w, image: findWhyImage(w.file) }));

  return (
    <>

    {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <span aria-hidden="true" className="twinkle absolute left-[46%] top-[14%] text-2xl text-white">✦</span>
        <span aria-hidden="true" className="twinkle absolute left-[8%] top-[62%] text-lg text-white" style={{ animationDelay: '1s' }}>✦</span>
        <span aria-hidden="true" className="twinkle absolute right-[10%] top-[10%] text-xl text-yellow-200" style={{ animationDelay: '2s' }}>✦</span>

        <div className="mx-auto grid max-w-7xl items-end gap-2 px-4 sm:px-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10 pb-8 pt-12 sm:pt-16 lg:pb-16">
            {/* Lebar disamakan ke max-w-2xl agar sejajar dengan card pencarian */}
            <h1 
              className="max-w-2xl text-4xl font-extrabold leading-[1.2] text-white sm:text-5xl sm:leading-[1.2]" 
              style={shadow3dTitle}
            >             
              Belajar Jadi Petualangan, Satu Bab Setiap Hari.
            </h1>

            {/* Lebar disamakan ke max-w-2xl agar sejajar dengan card pencarian */}
            <p 
              className="mt-2 max-w-2xl text-base font-medium text-white" 
              style={shadow3dSubtitle}
            >
              Kursus daring untuk anak usia 5-11 tahun. Materi singkat, progres tersimpan, dan sertifikat
              otomatis saat semua bab selesai.
            </p>

            {/* Card pencarian */}
            <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-3 shadow-lg">
              <SearchForm action="/" categories={categories} q={q} category={categoryId || ''} />
            </div>
          </div>

          {/* Ditambahkan origin-bottom agar kaki gambar tidak terpotong saat di-scale */}
          <div className="w-full self-end pb-0 origin-bottom lg:translate-x-8 lg:scale-110">
            <HeroKids />
          </div>
        </div>
      </section>

      <div className="page space-y-14 page !max-w-7xl">
        {/* Kategori */}
        {categories.length > 0 && (
          <section aria-labelledby="kategori">
            <div className="mb-4 flex items-center gap-3">
              <ArtSlot name="home-categories" emoji="🎒" className="h-14 w-14 text-3xl" />
              <h2 id="kategori" className="text-xl">Mau belajar apa hari ini?</h2>
            </div>
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
            <div className="flex items-center gap-3">
              <ArtSlot name="home-popular" emoji="🏆" className="h-14 w-14 text-3xl" />
              <h2 className="text-2xl">5 Kursus Terpopuler</h2>
            </div>
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

        {/* Tempat gambar banner (opsional): public/images/slots/home-banner.png */}
        <ArtSlot name="home-banner" fallback="none" className="h-40 w-full" />

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
        <ParentCard showRegister={!user} />
      </div>
    </>
  );
}
