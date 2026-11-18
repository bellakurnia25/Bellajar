import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getCourses, getCategories } from '@/lib/queries';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';

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

  return (
    <>
      <section className="bg-orange-600">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="max-w-2xl text-4xl text-white sm:text-5xl">
            Belajar jadi petualangan, satu bab setiap hari.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-orange-50">
            Kursus daring untuk anak usia 7–12 tahun. Materi singkat, progres tersimpan, dan sertifikat
            otomatis saat semua bab selesai.
          </p>
          <div className="mt-8 rounded-3xl bg-white p-4 shadow-lg sm:p-5">
            <SearchForm action="/" categories={categories} q={q} category={categoryId || ''} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/?category=${c.id}`}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                  categoryId === c.id
                    ? 'border-white bg-white text-orange-700'
                    : 'border-orange-300 text-white hover:bg-orange-700'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="page space-y-12">
        {searching && (
          <section>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl">Hasil pencarian ({results.length})</h2>
              <Link href="/" className="text-sm font-bold text-orange-700 hover:underline">Hapus filter</Link>
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

        <section>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl">5 Kursus Terpopuler</h2>
            <Link href="/courses" className="text-sm font-bold text-orange-700 hover:underline">Lihat semua kursus</Link>
          </div>
          {popular.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">Kursus pertama akan segera hadir. Nantikan ya!</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((c) => <CourseCard key={c.id} course={c} loggedIn={!!user} />)}
            </div>
          )}
        </section>

        <section className="card grid gap-6 bg-amber-100 p-8 md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: '#fcd34d' }}>
          <div>
            <h2 className="text-2xl text-amber-800">Halo Ayah &amp; Bunda!</h2>
            <p className="mt-2 max-w-2xl text-amber-800">
              Bantu si kecil membuat akun menggunakan email orang tua. Dengan begitu progres belajar dan
              sertifikatnya tersimpan dengan aman, dan Ayah &amp; Bunda bisa ikut memantau.
            </p>
          </div>
          {!user && <Link href="/register" className="btn-primary">Buat Akun Si Kecil</Link>}
        </section>
      </div>
    </>
  );
}
