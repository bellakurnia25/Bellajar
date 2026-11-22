import Link from 'next/link';
import { requireKind } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourses } from '@/lib/queries';
import { pct, formatDate } from '@/lib/utils';
import ProgressBar from '@/components/ProgressBar';
import ArtSlot from '@/components/ArtSlot';

export const metadata = { title: 'Siswa Saya – BELLAJAR' };

export default async function ManageStudentsPage() {
  const user = await requireKind(['teacher']);
  const [courses, rows] = await Promise.all([
    getCourses({ userId: user.id, teacherId: user.id }),
    query(
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
    ),
  ]);

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Siswa Saya</h1>
        <p className="text-stone-600">Pantau siswa yang mengikuti kursusmu beserta persentase progres masing-masing.</p>
      </div>

      {courses.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center text-stone-600">
          <ArtSlot name="empty-courses" emoji="📚" className="h-24 w-24" />
          <p>Kamu belum punya kursus. <Link href="/manage/courses" className="font-bold text-brand-700 hover:underline">Buat kursus</Link> untuk mulai mengajar.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {courses.map((c) => {
            const list = rows.filter((r) => r.course_id === c.id);
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-5 py-4">
                  <h2 className="text-lg">{c.title}</h2>
                  <span className="badge-stone">{list.length} siswa</span>
                </div>
                {list.length === 0 ? (
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
                        {list.map((r) => (
                          <tr key={r.user_id} className="border-t border-stone-100">
                            <td className="px-5 py-3">
                              <p className="font-bold">{r.username}</p>
                              <p className="text-xs text-stone-500">{r.email}</p>
                            </td>
                            <td className="px-5 py-3 text-stone-600">{formatDate(r.enrolled_at)}</td>
                            <td className="px-5 py-3"><ProgressBar value={pct(r.done, r.total)} label={`${r.done}/${r.total} bab`} /></td>
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
    </div>
  );
}
