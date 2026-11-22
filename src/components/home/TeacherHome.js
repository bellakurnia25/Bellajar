import Link from 'next/link';
import { query, queryOne } from '@/lib/db';
import { getCourses } from '@/lib/queries';
import { formatDate, pct, accessLabel } from '@/lib/utils';
import { imageUrl } from '@/lib/uploads';
import ProgressBar from '@/components/ProgressBar';
import ArtSlot from '@/components/ArtSlot';
import StaffHero from './StaffHero';

export default async function TeacherHome({ user }) {
  const [stats, courses, recent] = await Promise.all([
    queryOne(
      `SELECT (SELECT COUNT(*) FROM courses WHERE teacher_id = $1)::int AS courses,
              (SELECT COUNT(DISTINCT e.user_id) FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.teacher_id = $1)::int AS students,
              (SELECT COUNT(*) FROM contents ct JOIN courses c ON c.id = ct.course_id WHERE c.teacher_id = $1)::int AS chapters,
              (SELECT COUNT(*) FROM certificates ce JOIN courses c ON c.id = ce.course_id WHERE c.teacher_id = $1)::int AS certificates`,
      [user.id]
    ),
    getCourses({ userId: user.id, teacherId: user.id }),
    query(
      `SELECT u.username, c.title AS course_title, e.enrolled_at,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id AND ct.id = ANY(e.completed_content_ids))::int AS done,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total
       FROM enrollments e JOIN courses c ON c.id = e.course_id JOIN users u ON u.id = e.user_id
       WHERE c.teacher_id = $1 ORDER BY e.enrolled_at DESC LIMIT 5`,
      [user.id]
    ),
  ]);

  const justApproved = user.approved_at && Date.now() - new Date(user.approved_at).getTime() < 24 * 60 * 60 * 1000;
  const cards = [
    ['📚', 'Kursus saya', stats.courses],
    ['🧒', 'Siswa', stats.students],
    ['📖', 'Total bab', stats.chapters],
    ['🏅', 'Sertifikat terbit', stats.certificates],
  ];

  return (
    <>
      <StaffHero
        greeting={`Hai, ${user.username.split(' ')[0]}!`}
        title="Selamat mengajar hari ini!"
        text="Kelola kursus, susun bab materi, dan pantau perkembangan siswamu."
        art="teacher-hero"
        emoji="🧑‍🏫"
      >
        <Link href="/manage/courses" className="btn bg-white px-6 py-3 text-brand-700 shadow-md hover:bg-brand-50">+ Buat Kursus Baru</Link>
        <Link href="/manage/students" className="btn border-2 border-white px-6 py-3 text-white hover:bg-white/15">Lihat Siswa Saya</Link>
      </StaffHero>

      <div className="page space-y-10">
        {justApproved && (
          <div className="rounded-3xl border border-emerald-300 bg-emerald-100 px-6 py-5 text-emerald-700 shadow-sm">
            <p className="text-xl font-extrabold">Selamat Datang, Pengajar!</p>
            <p>Pendaftaranmu sudah disetujui Admin. Sekarang kamu bisa membuat dan mengelola kursus sendiri.</p>
          </div>
        )}

        <section aria-label="Ringkasan mengajar" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {cards.map(([emoji, label, value]) => (
            <div key={label} className="card p-5">
              <span className="text-3xl" aria-hidden="true">{emoji}</span>
              <p className="mt-2 text-3xl font-black text-brand-600">{value}</p>
              <p className="text-sm text-stone-600">{label}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Kursus Saya</h2>
            <Link href="/manage/courses" className="text-sm font-semibold text-brand-700 hover:underline">Kelola semua →</Link>
          </div>
          {courses.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-8 text-center text-stone-600">
              <ArtSlot name="empty-courses" emoji="📚" className="h-24 w-24" />
              <p>Kamu belum punya kursus. <Link href="/manage/courses" className="font-bold text-brand-700 hover:underline">Buat kursus pertamamu</Link>.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {courses.slice(0, 4).map((c) => {
                const cover = imageUrl('courses', c.id);
                return (
                  <div key={c.id} className="card flex gap-4 p-4">
                    {cover && <img src={cover} alt="" className="h-24 w-32 shrink-0 rounded-2xl object-cover shadow" />}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg">{c.title}</h3>
                      <p className="text-xs text-stone-500">{accessLabel(c)}</p>
                      <p className="mt-1 text-sm text-stone-600">{c.student_count} siswa · {c.total_contents} bab</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={`/manage/courses/${c.id}/contents`} className="btn-green btn-sm">Kelola Materi</Link>
                        <Link href={`/courses/${c.id}`} className="btn-ghost btn-sm">Lihat</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl">Siswa Terbaru</h2>
            <Link href="/manage/students" className="text-sm font-semibold text-brand-700 hover:underline">Lihat semua siswa →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">Belum ada siswa yang mengikuti kursusmu.</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="px-5 py-3 font-bold">Siswa</th>
                    <th className="px-5 py-3 font-bold">Kursus</th>
                    <th className="px-5 py-3 font-bold">Bergabung</th>
                    <th className="w-56 px-5 py-3 font-bold">Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={i} className="border-t border-stone-100">
                      <td className="px-5 py-3 font-bold">{r.username}</td>
                      <td className="px-5 py-3 text-stone-600">{r.course_title}</td>
                      <td className="px-5 py-3 text-stone-600">{formatDate(r.enrolled_at)}</td>
                      <td className="px-5 py-3"><ProgressBar value={pct(r.done, r.total)} label={`${r.done}/${r.total} bab`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
