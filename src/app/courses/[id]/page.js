import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';
import { getCourses, getContents } from '@/lib/queries';
import { toId } from '@/lib/http';
import { pct, accessStatus, accessLabel, formatDate } from '@/lib/utils';
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
  const enrollment = user
    ? await queryOne(
        'SELECT id, completed_content_ids FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [user.id, courseId]
      )
    : null;
  const status = accessStatus(course);
  const canRead = isStaff || (enrollment && status === 'open');

  /* ---------- Tampilan pratinjau (belum terdaftar / akses tidak aktif) ---------- */
  if (!canRead) {
    return (
      <div className="page grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            {course.category_name && <span className="badge-amber">{course.category_name}</span>}
            <span className="badge-stone">{accessLabel(course)}</span>
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
          {enrollment && status !== 'open' ? (
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
        <a
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(course.teacher_email)}&su=${encodeURIComponent('Pertanyaan tentang kursus: ' + course.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline w-full"
        >
          Hubungi Teacher
        </a>
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

  const certificate =
    enrollment && percent === 100
      ? await queryOne('SELECT certificate_code FROM certificates WHERE user_id = $1 AND course_id = $2', [user.id, courseId])
      : null;

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
      <div className="hero-gradient rounded-3xl p-6 sm:p-8">
        <Link href="/courses" className="text-sm font-semibold text-white hover:underline" style={{ textShadow: '0 1px 8px rgba(120,40,160,.4)' }}>← Semua kursus</Link>
        <h1 className="mt-1 text-2xl text-white sm:text-3xl" style={{ textShadow: '0 2px 12px rgba(120,40,160,.4)' }}>{course.title}</h1>
        <p className="text-sm font-medium text-white" style={{ textShadow: '0 1px 8px rgba(120,40,160,.4)' }}>Pengajar: {course.teacher_name}</p>
      </div>

      {certificate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-emerald-300 bg-emerald-100 px-5 py-4 text-emerald-700">
          <p className="font-bold">Hore! Kamu sudah menyelesaikan semua bab. Sertifikatmu siap.</p>
          <Link href={`/certificate/${certificate.certificate_code}`} className="btn-green">Lihat Sertifikat</Link>
        </div>
      )}

      {!enrollment && isStaff && (
        <div className="rounded-2xl border border-amber-300 bg-amber-100 px-4 py-3 text-sm text-amber-800">
          Kamu melihat kursus ini sebagai pengelola. Progres belajar hanya tersimpan untuk siswa yang terdaftar.
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
                        {done ? '✓' : i + 1}
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
                <div className="mt-5 whitespace-pre-line text-lg leading-relaxed text-stone-800">{active.body}</div>

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-6">
                  {enrollment && <MarkDoneButton contentId={active.id} done={completed.has(active.id)} />}
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
