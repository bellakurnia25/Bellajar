import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, canManageCourses, isTeacherApplicant } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { getCourses, getCategories } from '@/lib/queries';
import { CHIP_COLORS } from '@/lib/ui';
import { pct, formatDate } from '@/lib/utils';
import CourseCard from '@/components/CourseCard';
import SearchForm from '@/components/SearchForm';
import HeroKids from '@/components/HeroKids';
import ProgressBar from '@/components/ProgressBar';
import ReapplyTeacherForm from '@/components/ReapplyTeacherForm';

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
  const user = await getCurrentUser();

  // Poin 17 & 13: Beranda sesuai tupoksi masing-masing user
  // 1. ADMIN -> langsung ke Dasbor Admin
  if (user?.role === 'admin') {
    redirect('/admin');
  }

  // 2. PENGAJAR AKTIF -> Beranda khusus Pengajar (tanpa katalog kursus siswa)
  if (canManageCourses(user)) {
    const teacherCourses = await getCourses({ userId: user.id, teacherId: user.id });
    const stats = await queryOne(
      `SELECT COUNT(DISTINCT c.id)::int AS total_courses,
              COUNT(DISTINCT e.id)::int AS total_students,
              (SELECT COUNT(*) FROM contents ct JOIN courses c2 ON c2.id = ct.course_id WHERE c2.teacher_id = $1)::int AS total_contents
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.teacher_id = $1`,
      [user.id]
    );

    const recentStudents = await query(
      `SELECT u.username, c.title AS course_title, e.enrolled_at,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id AND ct.id = ANY(e.completed_content_ids))::int AS done,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = e.user_id
       WHERE c.teacher_id = $1
       ORDER BY e.enrolled_at DESC LIMIT 8`,
      [user.id]
    );

    return (
      <div className="page space-y-8">
        <section className="hero-gradient rounded-3xl p-8 text-white shadow-lg">
          <p className="text-sm font-bold uppercase tracking-wider text-white/90">Dasbor Pengajar BELLAJAR</p>
          <h1 className="mt-1 text-3xl text-white sm:text-4xl">Halo, {user.username}! </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/95">
            Selamat datang di ruang pengajar. Kelola kurikulum, susun bab materi bergambar, dan pantau perkembangan belajar siswamu di sini.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/manage/courses" className="btn bg-white text-brand-700 shadow hover:bg-brand-50">
              + Kelola &amp; Buat Kursus
            </Link>
            <Link href="/profile" className="btn border border-white/60 bg-white/15 text-white hover:bg-white/25">
              Profil Pengajar
            </Link>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-6">
            <p className="text-3xl font-black text-brand-600">{stats?.total_courses || 0}</p>
            <p className="text-sm font-semibold text-stone-600">Kursus yang Diampu</p>
          </div>
          <div className="card p-6">
            <p className="text-3xl font-black text-sky-600">{stats?.total_contents || 0}</p>
            <p className="text-sm font-semibold text-stone-600">Total Bab Materi</p>
          </div>
          <div className="card p-6">
            <p className="text-3xl font-black text-emerald-600">{stats?.total_students || 0}</p>
            <p className="text-sm font-semibold text-stone-600">Siswa Terdaftar</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Kursus yang Kamu Ajar</h2>
            <Link href="/manage/courses" className="text-sm font-bold text-brand-700 hover:underline">Kelola semua →</Link>
          </div>
          {teacherCourses.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">
              Kamu belum membuat kursus. Klik tombol <strong>Kelola &amp; Buat Kursus</strong> di atas untuk memulai.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teacherCourses.map((c) => (
                <div key={c.id} className="card flex flex-col justify-between gap-4 p-5">
                  <div>
                    <span className="badge-amber">{c.category_name || 'Umum'}</span>
                    <h3 className="mt-2 text-lg">{c.title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{c.total_contents} bab · {c.student_count} siswa</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/manage/courses/${c.id}/contents`} className="btn-green btn-sm">Kelola Materi</Link>
                    <Link href={`/courses/${c.id}`} className="btn-outline btn-sm">Pratinjau</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl">Aktivitas Belajar Siswa Terbaru</h2>
          <div className="card overflow-x-auto">
            {recentStudents.length === 0 ? (
              <p className="p-6 text-center text-sm text-stone-600">Belum ada siswa yang mendaftar pada kursusmu.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-5 py-3 font-bold">Nama Siswa</th>
                    <th className="px-5 py-3 font-bold">Kursus</th>
                    <th className="px-5 py-3 font-bold">Bergabung</th>
                    <th className="w-56 px-5 py-3 font-bold">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((r, idx) => (
                    <tr key={idx} className="border-t border-stone-100">
                      <td className="px-5 py-3 font-bold">{r.username}</td>
                      <td className="px-5 py-3">{r.course_title}</td>
                      <td className="px-5 py-3 text-stone-500">{formatDate(r.enrolled_at)}</td>
                      <td className="px-5 py-3">
                        <ProgressBar value={pct(r.done, r.total)} label={`${r.done}/${r.total} bab`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    );
  }

  // 3. CALON PENGAJAR (pending / rejected) -> Halaman Status Pendaftaran & Evaluasi Admin (Poin 7, 8, 11, 22, 23)
  if (isTeacherApplicant(user)) {
    const isRejected = user.teacher_status === 'rejected';
    return (
      <div className="page max-w-3xl space-y-6">
        <div className="card p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className={isRejected ? 'badge-red' : 'badge-amber'}>
                {isRejected ? 'Status: Perlu Perbaikan / Ditolak' : 'Status: Calon Pengajar'}
              </span>
              <h1 className="mt-2 text-2xl sm:text-3xl">Halo, {user.username}! 👋</h1>
            </div>
            <Link href="/profile" className="btn-outline btn-sm">Lihat Profil</Link>
          </div>

          {!isRejected ? (
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-amber-900">
              <p className="text-base font-extrabold">Pendaftaranmu sebagai teacher sedang ditinjau.</p>
              <p className="mt-1 text-sm">
                Tim Admin sedang memeriksa biodata, CV, dan portofolio yang kamu kirimkan. Apabila terdapat catatan perbaikan, kamu dapat memperbarui berkas dan melakukan pendaftaran ulang di bawah ini.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-900">
              <p className="text-base font-extrabold">Pendaftaran Pengajar Belum Dapat Disetujui</p>
              <p className="mt-1 text-sm">
                Silakan periksa catatan evaluasi dari Admin di bawah ini, lalu lengkapi kembali berkasmu untuk mengajukan pendaftaran ulang.
              </p>
            </div>
          )}

          {user.teacher_review_note && (
            <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-800">
                Catatan / Alasan Evaluasi dari Admin:
              </p>
              <p className="mt-1.5 whitespace-pre-line text-sm font-medium text-ink">
                {user.teacher_review_note}
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-stone-50 p-4 text-sm space-y-2">
            <p><strong>Bidang yang Dilamar:</strong> {user.teacher_specialty || '-'}</p>
            <p><strong>Biodata:</strong> {user.teacher_bio || '-'}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              {user.teacher_cv_url && (
                <a href={user.teacher_cv_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-700 underline">
                  Lihat CV Terkirim
                </a>
              )}
              {user.teacher_portfolio_url && (
                <a href={user.teacher_portfolio_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-700 underline">
                  Lihat Portofolio Terkirim
                </a>
              )}
            </div>
          </div>

          <ReapplyTeacherForm user={user} />
        </div>
      </div>
    );
  }

  // 4. SISWA (student) & TAMU (guest)
  const sp = await searchParams;
  const q = String(sp?.q ?? '').trim();
  const categoryId = sp?.category ? Number(sp.category) : null;
  const searching = Boolean(q || categoryId);
  const userId = user?.id ?? null;

  const [categories, popular, results] = await Promise.all([
    getCategories(),
    getCourses({ userId, popular: true, limit: 5 }),
    searching ? getCourses({ userId, search: q, categoryId }) : Promise.resolve([]),
  ]);

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
          <div className="relative z-10 pb-8 pt-10 sm:pt-14 lg:pb-14">
            {/* Poin 24: Sapaan Hai/Halo user dipindahkan ke dashboard/beranda user */}
            {user && (
              <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-4 py-1.5 text-2xl font-extrabold text-brand-700 shadow-md">
                Halo, {user.username}! 
              </div>
            )}

            <h1
              className="max-w-2xl text-4xl font-extrabold leading-[1.2] text-white sm:text-5xl sm:leading-[1.2]"
              style={shadow3dTitle}
            >
              Belajar Jadi Petualangan, Satu Bab Setiap Hari.
            </h1>

            <p
              className="mt-2 max-w-2xl text-base font-medium text-white"
              style={shadow3dSubtitle}
            >
              Kursus daring untuk anak usia 5–11 tahun. Materi singkat, progres tersimpan, dan sertifikat
              otomatis saat semua bab selesai.
            </p>

            <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-3 shadow-lg">
              <SearchForm action="/" categories={categories} q={q} category={categoryId || ''} />
            </div>
          </div>

          <div className="w-full origin-bottom self-end pb-0 lg:translate-x-8 lg:scale-110">
            <HeroKids />
          </div>
        </div>
      </section>

      <div className="page !max-w-7xl space-y-14">
        {/* Kategori */}
        {categories.length > 0 && (
          <section aria-labelledby="kategori">
            <h2 id="kategori" className="mb-4 text-xl">Mau belajar apa hari ini?</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/?category=${c.id}`}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm transition-transform hover:-translate-y-0.5 ${CHIP_COLORS[i % CHIP_COLORS.length]} ${
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

        {/* Poin 25: Tambahan galeri petualangan belajar ceria dengan ruang gambar agar tampilan lebih ramai & menarik bagi anak */}
        <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 via-brand-50 to-amber-50 p-6 sm:p-8 shadow-md">
          <div className="mb-6 text-center">
            <h2 className="mt-2 text-2xl sm:text-3xl">Pilih Petualangan Favoritmu!</h2>
            <p className="mt-1 text-sm text-stone-600">Setiap tema punya gambar seru dan tantangan menyenangkan untuk anak.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { img: '/images/courses/matematika.png', title: 'Matematika' },
              { img: '/images/courses/bahasa.png', title: 'Bahasa' },
              { img: '/images/courses/sains.png', title: 'Sains Cilik' },
              { img: '/images/courses/seni.png', title: 'Seni & Warna' },
              { img: '/images/courses/logika.png', title: 'Logika' },
              { img: '/images/courses/keterampilan.png', title: 'Keterampilan' },
            ].map((item) => (
              <div key={item.title} className="card flex flex-col items-center p-4 text-center">
                <img src={item.img} alt={item.title} className="h-20 w-20 object-contain drop-shadow" />
                <p className="mt-2 text-xs font-extrabold text-ink">{item.title}</p>
              </div>
            ))}
          </div>
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

        {/* Poin 4: Bagian kotak pemberitahuan Halo Ayah Bunda berwarna cerah senada dengan background hero */}
        <section className="hero-gradient grid gap-6 rounded-3xl p-8 text-white shadow-xl md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="mt-2 text-2xl text-white sm:text-3xl" style={{ textShadow: '0 2px 8px rgba(45,15,85,0.4)' }}>
              Halo Ayah &amp; Bunda!
            </h2>
            <p className="mt-2 max-w-2xl text-white/95" style={{ textShadow: '0 1px 6px rgba(45,15,85,0.35)' }}>
              Bantu si kecil membuat akun menggunakan email orang tua. Dengan begitu progres belajar dan
              sertifikatnya tersimpan dengan aman, dan Ayah &amp; Bunda bisa ikut memantau.
            </p>
          </div>
          {!user && (
            <Link href="/register" className="btn bg-white px-7 py-3 text-brand-700 shadow-lg hover:bg-amber-50">
              Buat Akun Si Kecil
            </Link>
          )}
        </section>
      </div>
    </>
  );
}
