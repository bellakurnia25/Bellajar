import Link from 'next/link';
import { requirePageUser, canManageCourses } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourses } from '@/lib/queries';
import { pct, formatDate } from '@/lib/utils';
import ProgressBar from '@/components/ProgressBar';

export const metadata = { title: 'Profil Saya – BELLAJAR' };

export default async function ProfilePage() {
  const user = await requirePageUser();

  const allCourses = await getCourses({ userId: user.id });
  const enrolled = allCourses.filter((c) => c.enrolled);

  const certificates = await query(
    'SELECT course_id, certificate_code, issued_at FROM certificates WHERE user_id = $1',
    [user.id]
  );
  const certByCourse = new Map(certificates.map((c) => [c.course_id, c]));

  const isTeacher = canManageCourses(user) && user.role === 'teacher';
  let teacherCourses = [];
  let studentRows = [];
  if (isTeacher) {
    teacherCourses = await getCourses({ userId: user.id, teacherId: user.id });
    studentRows = await query(
      `SELECT c.id AS course_id, u.id AS user_id, u.username, u.email, e.enrolled_at,
              (SELECT COUNT(*) FROM contents ct
                 WHERE ct.course_id = c.id AND ct.id = ANY(e.completed_content_ids))::int AS done,
              (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total
       FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       JOIN users u ON u.id = e.user_id
       WHERE c.teacher_id = $1
       ORDER BY u.username`,
      [user.id]
    );
  }

  const justApproved =
    user.role === 'teacher' &&
    user.approved_at &&
    Date.now() - new Date(user.approved_at).getTime() < 24 * 60 * 60 * 1000;

  const roleLabel = { admin: 'Admin', teacher: 'Teacher', student: 'Student' }[user.role];

  return (
    <div className="page space-y-8">
      {justApproved && (
        <div className="rounded-3xl border border-emerald-300 bg-emerald-100 px-6 py-5 text-emerald-800">
          <p className="text-xl font-extrabold">Welcome Teacher!</p>
          <p>Akunmu sudah disetujui Admin. Sekarang kamu bisa membuat dan mengelola kursus sendiri.</p>
          <Link href="/manage/courses" className="btn-green mt-3">Buat Kursus Pertamamu</Link>
        </div>
      )}

      <section className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-black text-orange-700">
            {user.username.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl">{user.username}</h1>
            <p className="text-sm text-stone-600">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge-stone">{roleLabel}</span>
              {user.teacher_status === 'pending' && <span className="badge-amber">Pending Approval</span>}
              {user.teacher_status === 'rejected' && <span className="badge-red">Pendaftaran Teacher belum disetujui</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {canManageCourses(user) && <Link href="/manage/courses" className="btn-outline">Kelola Kursus</Link>}
          <Link href="/courses" className="btn-primary">Cari Kursus</Link>
        </div>
      </section>

      {user.teacher_status === 'pending' && (
        <div className="rounded-2xl border border-amber-300 bg-amber-100 px-5 py-4 text-sm text-amber-800">
          Pendaftaran Teacher-mu sedang ditinjau Admin. Sambil menunggu, kamu tetap bisa mengikuti kursus
          sebagai Student.
        </div>
      )}

      <section>
        <h2 className="mb-4 text-2xl">Kursus yang Kuikuti</h2>
        {enrolled.length === 0 ? (
          <div className="card p-8 text-center text-stone-600">
            Belum ada kursus yang diikuti. <Link href="/courses" className="font-bold text-orange-700 hover:underline">Pilih kursus pertamamu</Link>.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enrolled.map((c) => {
              const percent = pct(c.done_contents, c.total_contents);
              const cert = certByCourse.get(c.id);
              return (
                <div key={c.id} className="card space-y-3 p-5">
                  <h3 className="text-lg">{c.title}</h3>
                  <ProgressBar value={percent} />
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/courses/${c.id}`} className="btn-green btn-sm">Lanjutkan Belajar</Link>
                    {cert && <Link href={`/certificate/${cert.certificate_code}`} className="btn-outline btn-sm">Lihat Sertifikat</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isTeacher && (
        <section>
          <h2 className="mb-4 text-2xl">Monitoring Siswa</h2>
          {teacherCourses.length === 0 ? (
            <div className="card p-8 text-center text-stone-600">
              Kamu belum punya kursus. <Link href="/manage/courses" className="font-bold text-orange-700 hover:underline">Buat kursus</Link> untuk mulai mengajar.
            </div>
          ) : (
            <div className="space-y-5">
              {teacherCourses.map((c) => {
                const rows = studentRows.filter((r) => r.course_id === c.id);
                return (
                  <div key={c.id} className="card overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-4">
                      <h3 className="text-lg">{c.title}</h3>
                      <span className="badge-stone">{rows.length} siswa</span>
                    </div>
                    {rows.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-stone-600">Belum ada siswa yang mengikuti kursus ini.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-stone-50 text-stone-600">
                            <tr>
                              <th className="px-5 py-2.5 font-bold">Siswa</th>
                              <th className="px-5 py-2.5 font-bold">Bergabung</th>
                              <th className="w-64 px-5 py-2.5 font-bold">Progres</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r) => (
                              <tr key={r.user_id} className="border-t border-stone-100">
                                <td className="px-5 py-3">
                                  <p className="font-bold">{r.username}</p>
                                  <p className="text-xs text-stone-500">{r.email}</p>
                                </td>
                                <td className="px-5 py-3 text-stone-600">{formatDate(r.enrolled_at)}</td>
                                <td className="px-5 py-3">
                                  <ProgressBar value={pct(r.done, r.total)} label={`${r.done}/${r.total} bab`} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
