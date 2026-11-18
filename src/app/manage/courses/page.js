import { requirePageUser, canManageCourses } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourses, getCategories } from '@/lib/queries';
import { accessLabel } from '@/lib/utils';
import CourseManager from '@/components/CourseManager';

export const metadata = { title: 'Kelola Kursus – BELLAJAR' };

export default async function ManageCoursesPage() {
  const user = await requirePageUser(canManageCourses);
  const admin = user.role === 'admin';

  const [courses, categories, teachers] = await Promise.all([
    getCourses({ userId: user.id, teacherId: admin ? null : user.id }),
    getCategories(),
    admin
      ? query(`SELECT id, username, role FROM users WHERE role IN ('teacher', 'admin') ORDER BY username`)
      : Promise.resolve([]),
  ]);

  const list = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    category_id: c.category_id,
    category_name: c.category_name,
    teacher_id: c.teacher_id,
    teacher_name: c.teacher_name,
    start_date: c.start_date,
    end_date: c.end_date,
    total_contents: c.total_contents,
    student_count: c.student_count,
    access_label: accessLabel(c),
  }));

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">{admin ? 'Manajemen Kursus' : 'Kursus Saya'}</h1>
        <p className="text-stone-600">
          {admin ? 'Kelola semua kursus di BELLAJAR.' : 'Buat kursus, atur materi, lalu pantau progres siswamu di halaman profil.'}
        </p>
      </div>
      <CourseManager courses={list} categories={categories} teachers={teachers} isAdmin={admin} currentUserId={user.id} />
    </div>
  );
}
