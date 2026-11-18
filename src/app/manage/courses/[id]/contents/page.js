import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requirePageUser, canManageCourses } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { getContents } from '@/lib/queries';
import { toId } from '@/lib/http';
import ContentManager from '@/components/ContentManager';

export const metadata = { title: 'Kelola Materi – BELLAJAR' };

export default async function ManageContentsPage({ params }) {
  const user = await requirePageUser(canManageCourses);
  const courseId = toId((await params).id);
  if (!courseId) notFound();

  const course = await queryOne('SELECT id, title, teacher_id FROM courses WHERE id = $1', [courseId]);
  if (!course) notFound();
  if (user.role !== 'admin' && course.teacher_id !== user.id) redirect('/manage/courses');

  const contents = await getContents(courseId);

  return (
    <div className="page space-y-6">
      <div>
        <Link href="/manage/courses" className="text-sm font-bold text-orange-700 hover:underline">← Kembali ke daftar kursus</Link>
        <h1 className="mt-1 text-3xl">Materi: {course.title}</h1>
        <p className="text-stone-600">Atur urutan bab dengan kolom “Urutan”. Bab ditampilkan dari angka terkecil.</p>
      </div>
      <ContentManager courseId={course.id} contents={contents} />
    </div>
  );
}
