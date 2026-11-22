import Link from 'next/link';
import { query } from '@/lib/db';
import { getCourses, getCategories } from '@/lib/queries';
import { CHIP_COLORS } from '@/lib/ui';
import { getApplication } from '@/lib/applications';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';
import HeroKids from '@/components/HeroKids';
import ArtSlot from '@/components/ArtSlot';
import ParentCard from './ParentCard';
import { shadow3dTitle, shadow3dSubtitle } from './heroStyles';

export default async function StudentHome({ user, searchParams }) {
  const sp = await searchParams;
  const q = String(sp?.q ?? '').trim();
  const categoryId = sp?.category ? Number(sp.category) : null;
  const searching = Boolean(q || categoryId);

  const [categories, mine, popular, results, certs, application] = await Promise.all([
    getCategories(),
    getCourses({ userId: user.id }),
    getCourses({ userId: user.id, popular: true, limit: 5 }),
    searching ? getCourses({ userId: user.id, search: q, categoryId }) : Promise.resolve([]),
    query('SELECT COUNT(*)::int AS n FROM certificates WHERE user_id = $1', [user.id]),
    user.teacher_status === 'rejected' ? getApplication(user.id) : Promise.resolve(null),
  ]);

  const enrolled = mine.filter((c) => c.enrolled);
  const chaptersDone = enrolled.reduce((sum, c) => sum + c.done_contents, 0);
  const firstName = user.username.split(' ')[0];

  const stats = [
    ['📚', 'Kursus diikuti', enrolled.length],
    ['✅', 'Bab selesai', chaptersDone],
    ['🏅', 'Sertifikat', certs[0].n],
  ];

  return (
    <>
      <section className="hero-gradient relative overflow-hidden">
        <span aria-hidden="true" className="twinkle absolute left-[46%] top-[14%] text-2xl text-white">✦</span>
        <span aria-hidden="true" className="twinkle absolute right-[10%] top-[10%] text-xl text-yellow-200" style={{ animationDelay: '2s' }}>✦</span>
        <div className="mx-auto grid max-w-7xl items-end gap-2 px-4 sm:px-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative z-10 pb-8 pt-10 sm:pt-14 lg:pb-14">
            <p className="font-display text-2xl font-semibold text-yellow-300 sm:text-3xl" style={shadow3dSubtitle}>Hai, {firstName}!</p>
            <h1 className="mt-1 max-w-2xl text-4xl font-extrabold leading-[1.2] text-white sm:text-5xl sm:leading-[1.2]" style={shadow3dTitle}>
              Siap lanjut belajar hari ini?
            </h1>
            <p className="mt-2 max-w-2xl text-base font-medium text-white" style={shadow3dSubtitle}>
              Selesaikan satu bab setiap hari dan kumpulkan sertifikatmu.
            </p>
            <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-3 shadow-lg">
              <SearchForm action="/" categories={categories} q={q} category={categoryId || ''} />
            </div>
          </div>
          <div className="w-full origin-bottom self-end lg:translate-x-8 lg:scale-110">
            <HeroKids />
          </div>
        </div>
      </section>

      <div className="page space-y-12">
        {user.teacher_status === 'rejected' && (
          <section className="card space-y-2 border-amber-300 p-5">
            <h2 className="text-lg">Pendaftaranmu sebagai pengajar belum disetujui</h2>
            {application?.review_note && <p className="whitespace-pre-line text-sm text-stone-700">Catatan Admin: {application.review_note}</p>}
            <Link href="/teacher-application" className="btn-outline btn-sm">Perbaiki dan daftar ulang</Link>
          </section>
        )}

        <section aria-label="Ringkasan belajar" className="grid gap-4 sm:grid-cols-3">
          {stats.map(([emoji, label, value]) => (
            <div key={label} className="card flex items-center gap-4 p-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-3xl" aria-hidden="true">{emoji}</span>
              <div>
                <p className="text-3xl font-black text-brand-600">{value}</p>
                <p className="text-sm text-stone-600">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {categories.length > 0 && (
          <section aria-labelledby="kategori">
            <div className="mb-4 flex items-center gap-3">
              <ArtSlot name="home-categories" emoji="🎒" className="h-14 w-14 text-3xl" />
              <h2 id="kategori" className="text-xl">Mau belajar apa hari ini?</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <Link key={c.id} href={`/?category=${c.id}`} className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${CHIP_COLORS[i % CHIP_COLORS.length]} ${categoryId === c.id ? 'ring-2 ring-brand-600 ring-offset-2' : ''}`}>
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
              <div className="card p-8 text-center text-stone-600">Belum ada kursus yang cocok. Coba kata kunci lain atau pilih kategori yang berbeda.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((c) => <CourseCard key={c.id} course={c} loggedIn />)}
              </div>
            )}
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Lanjutkan Belajar</h2>
            {enrolled.length > 3 && <Link href="/my-courses" className="text-sm font-semibold text-brand-700 hover:underline">Lihat semua kursus saya →</Link>}
          </div>
          {enrolled.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-8 text-center text-stone-600">
              <ArtSlot name="empty-courses" emoji="📚" className="h-24 w-24" />
              <p>Kamu belum mengikuti kursus. <Link href="/courses" className="font-bold text-brand-700 hover:underline">Pilih kursus pertamamu</Link>.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrolled.slice(0, 3).map((c) => <CourseCard key={c.id} course={c} loggedIn />)}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <ArtSlot name="home-popular" emoji="🏆" className="h-14 w-14 text-3xl" />
              <h2 className="text-2xl">5 Kursus Terpopuler</h2>
            </div>
            <Link href="/courses" className="text-sm font-semibold text-brand-700 hover:underline">Jelajah semua kursus →</Link>
          </div>
          {popular.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">Kursus pertama akan segera hadir. Nantikan ya!</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {popular.map((c) => <CourseCard key={c.id} course={c} loggedIn />)}
            </div>
          )}
        </section>

        <ParentCard />
      </div>
    </>
  );
}
