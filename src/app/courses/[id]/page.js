import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser, canEnrollCourses } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { getCourses, getContents } from '@/lib/queries';
import { toId } from '@/lib/http';
import { pct, accessStatus, accessLabel, formatDate } from '@/lib/utils';
import { toYoutubeEmbedUrl } from '@/lib/youtube';
import { issueCertificate } from '@/lib/certificates';
import ProgressBar from '@/components/ProgressBar';
import EnrollButton from '@/components/EnrollButton';
import MarkDoneButton from '@/components/MarkDoneButton';
import DiscussionForm from '@/components/DiscussionForm';

export default async function CoursePage({ params, searchParams }) {
  const courseId = toId((await params).id);
  if (!courseId) notFound();
  const sp = await searchParams;

  const user = await getCurrentUser();
  const [course] = await getCourses({ userId: user?.id ?? null, courseId });
  if (!course) notFound();

  const contents = await getContents(courseId);
  const isStaff = !!user && (user.role === 'admin' || course.teacher_id === user.id);
  const allowedToEnroll = canEnrollCourses(user);

  const enrollment =
    user && allowedToEnroll
      ? await queryOne(
          'SELECT id, completed_content_ids FROM enrollments WHERE user_id = $1 AND course_id = $2',
          [user.id, courseId]
        )
      : null;
  const status = accessStatus(course);
  const canRead = isStaff || (enrollment && status === 'open');

  /* ---------- Tampilan pratinjau ---------- */
  if (!canRead) {
    return (
      <div className="page grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {course.category_name && <span className="badge-amber">{course.category_name}</span>}
            <span className="badge-stone">{accessLabel(course)}</span>
            {!course.is_finalized && <span className="badge-amber">Materi Masih Berlanjut</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl">{course.title}</h1>
          <p className="mt-4 whitespace-pre-line text-stone-700">{course.description}</p>
          <p className="mt-4 text-sm text-stone-600">
            Pengajar: <span className="font-bold text-stone-800">{course.teacher_name}</span> · {course.student_count} siswa
          </p>

          <h2 className="mt-8 mb-3 text-xl">Isi kursus ({contents.length} bab)</h2>
          {contents.length === 0 ? (
            <p className="text-stone-600">Materi sedang disiapkan oleh pengajar.</p>
          ) : (
            <ol className="space-y-2">
              {contents.map((c, i) => (
                <li key={c.id} className="card flex items-center gap-3 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">{i + 1}</span>
                  <span className="font-semibold">{c.title}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="card h-fit space-y-4 p-6">
          {!allowedToEnroll ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
              Akun <strong>Pengajar</strong> atau <strong>Calon Pengajar</strong> tidak dapat mendaftar sebagai peserta kursus.
            </div>
          ) : enrollment && status !== 'open' ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-100 p-4 text-sm text-amber-800">
              {status === 'upcoming'
                ? `Kursus ini baru dibuka pada ${formatDate(course.start_date)}.`
                : `Masa akses kursus ini berakhir pada ${formatDate(course.end_date)}.`}
            </div>
          ) : status === 'open' ? (
            <>
              <p className="font-bold">Siap mulai belajar?</p>
              <EnrollButton courseId={course.id} loggedIn={!!user} />
            </>
          ) : (
            <div className="rounded-2xl border border-amber-300 bg-amber-100 p-4 text-sm text-amber-800">
              {status === 'upcoming'
                ? `Pendaftaran dibuka mulai ${formatDate(course.start_date)}.`
                : 'Masa akses kursus ini sudah berakhir.'}
            </div>
          )}

          {allowedToEnroll && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(course.teacher_email)}&su=${encodeURIComponent('Pertanyaan tentang kursus: ' + course.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full"
            >
              Hubungi Pengajar
            </a>
          )}
        </aside>
      </div>
    );
  }

  /* ---------- Halaman belajar ---------- */
  const completed = new Set(enrollment?.completed_content_ids ?? []);
  const doneCount = contents.filter((c) => completed.has(c.id)).length;
  const percent = pct(doneCount, contents.length);

  const wanted = toId(sp?.c);
  const active =
    contents.find((c) => c.id === wanted) ||
    contents.find((c) => !completed.has(c.id)) ||
    contents[0] ||
    null;
  const activeIndex = active ? contents.findIndex((c) => c.id === active.id) : -1;
  const nextContent = activeIndex >= 0 ? contents[activeIndex + 1] : null;
  const activeYoutubeEmbedUrl = active?.image_url ? toYoutubeEmbedUrl(active.image_url) : null;

  const isLocked =
    !!enrollment &&
    activeIndex > 0 &&
    contents.slice(0, activeIndex).some((prev) => !completed.has(prev.id));

  let certificate = null;
  if (enrollment && percent === 100 && course.is_finalized) {
    certificate = await queryOne(
      'SELECT certificate_code FROM certificates WHERE user_id = $1 AND course_id = $2',
      [user.id, courseId]
    );
    if (!certificate) {
      const code = await issueCertificate(user.id, courseId);
      if (code) certificate = { certificate_code: code };
    }
  }

  const discussions = active
    ? await query(
        `SELECT d.id, d.user_id, d.comment, d.created_at, u.username
         FROM discussions d JOIN users u ON u.id = d.user_id
         WHERE d.content_id = $1 ORDER BY d.created_at ASC`,
        [active.id]
      )
    : [];

  return (
    <div className="page space-y-6">
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 shadow-lg">
        <Link href={isStaff ? '/manage/courses' : '/courses'} className="text-sm font-semibold text-white hover:underline">
          ← {isStaff ? 'Kembali ke kelola kursus' : 'Semua kursus'}
        </Link>
        <h1 className="mt-1 text-2xl text-white sm:text-3xl">{course.title}</h1>
        <p className="text-sm font-medium text-white/95">Pengajar: {course.teacher_name}</p>
      </div>

      {enrollment && percent === 100 && !course.is_finalized && (
        <div className="rounded-3xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm text-amber-900 shadow-sm">
          <p className="font-bold">Kamu telah menyelesaikan semua bab yang tersedia saat ini.</p>
          <p className="mt-0.5">
            Pengajar masih menandai penyusunan materi kursus ini sebagai berlanjut. Sertifikat kelulusanmu akan otomatis aktif setelah pengajar memfiksasi seluruh daftar bab.
          </p>
        </div>
      )}

      {certificate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-emerald-300 bg-emerald-100 px-5 py-4 text-emerald-700 shadow-sm">
          <p className="font-bold">Hore! Kamu sudah menyelesaikan semua bab. Sertifikatmu siap.</p>
          <Link href={`/certificate/${certificate.certificate_code}`} className="btn-green">Lihat Sertifikat</Link>
        </div>
      )}

      {!enrollment && isStaff && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm text-amber-900">
          <div>
            <p className="font-bold">Mode Pratinjau Pengelola</p>
            <p>
              {allowedToEnroll
                ? 'Klik "Ikuti Kursus" jika ingin mengikuti kursus ini sebagai peserta agar progres belajar dan sertifikatmu tersimpan.'
                : 'Progres belajar hanya tersimpan untuk peserta yang terdaftar.'}
            </p>
          </div>
          {allowedToEnroll && status === 'open' && (
            <div className="shrink-0">
              <EnrollButton courseId={course.id} loggedIn={true} />
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar bab */}
        <aside className="card h-fit space-y-4 p-5">
          {enrollment && <ProgressBar value={percent} />}
          <h2 className="text-lg">Daftar bab</h2>
          {contents.length === 0 ? (
            <p className="text-sm text-stone-600">Materi belum tersedia.</p>
          ) : (
            <ol className="space-y-2">
              {contents.map((c, i) => {
                const done = completed.has(c.id);
                const isActive = active?.id === c.id;
                const stepLocked =
                  !!enrollment && i > 0 && contents.slice(0, i).some((prev) => !completed.has(prev.id));

                return (
                  <li key={c.id}>
                    <Link
                      href={`/courses/${course.id}?c=${c.id}`}
                      aria-current={isActive ? 'step' : undefined}
                      className={`flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-sm font-semibold ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-800'
                          : 'border-transparent hover:bg-stone-100'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? 'bg-emerald-600 text-white'
                            : isActive
                            ? 'bg-brand-600 text-white'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {done ? '✓' : stepLocked ? '!' : i + 1}
                      </span>
                      <span className="flex-1">{c.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>

        {/* Area baca */}
        <section className="space-y-6">
          {!active ? (
            <div className="card p-8 text-center text-stone-600">Pengajar belum menambahkan materi. Cek lagi nanti ya!</div>
          ) : (
            <>
              <article className="card p-6 sm:p-8">
                <p className="text-sm font-bold text-brand-700">Bab {activeIndex + 1} dari {contents.length}</p>
                <h2 className="mt-1 text-2xl sm:text-3xl">{active.title}</h2>

                {isLocked && (
                  <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    Tidak dapat menyelesaikan bab ini jika bab sebelumnya belum diselesaikan. Selesaikan bab secara berurutan mulai dari bab pertama.
                  </div>
                )}

                {active.image_url && (
                  activeYoutubeEmbedUrl ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border-2 border-brand-100 bg-black shadow-md">
                      <div className="aspect-video w-full">
                        <iframe
                          src={activeYoutubeEmbedUrl}
                          title={active.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-brand-100 bg-brand-50/30 p-3">
                      <img
                        src={active.image_url}
                        alt={active.title}
                        className="mx-auto max-h-80 w-auto rounded-xl object-contain"
                      />
                    </div>
                  )
                )}

                <div className="mt-5 whitespace-pre-line text-lg leading-relaxed text-stone-800">{active.body}</div>

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-6">
                  {enrollment && (
                    <MarkDoneButton contentId={active.id} done={completed.has(active.id)} locked={isLocked} />
                  )}
                  {nextContent ? (
                    <Link href={`/courses/${course.id}?c=${nextContent.id}`} className="btn-primary">Lanjutkan</Link>
                  ) : certificate ? (
                    <Link href={`/certificate/${certificate.certificate_code}`} className="btn-primary">Lihat Sertifikat</Link>
                  ) : null}
                </div>
              </article>

              {/* Forum diskusi */}
              <section className="card p-6 sm:p-8">
                <h3 className="text-xl">Forum Diskusi</h3>
                <p className="mb-5 text-sm text-stone-600">Bertanya dan berbagi cerita dengan teman serta pengajar di bab ini.</p>

                {discussions.length === 0 ? (
                  <p className="mb-6 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
                    Belum ada komentar. Jadilah yang pertama bertanya!
                  </p>
                ) : (
                  <ul className="mb-6 space-y-4">
                    {discussions.map((d) => (
                      <li key={d.id} className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                          {d.username.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex-1 rounded-2xl bg-stone-50 px-4 py-3">
                          <p className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-bold">{d.username}</span>
                            {d.user_id === course.teacher_id && <span className="badge-amber">Pengajar</span>}
                            <span className="text-xs text-stone-500">{formatDate(d.created_at)}</span>
                          </p>
                          <p className="mt-1 whitespace-pre-line text-stone-800">{d.comment}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <DiscussionForm contentId={active.id} />
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}