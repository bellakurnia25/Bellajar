import { requirePageUser, canEnrollCourses } from '@/lib/auth';
import { query } from '@/lib/db';
import { getCourses } from '@/lib/queries';
import EnrolledCourses from '@/components/EnrolledCourses';

export const metadata = { title: 'Kursus Saya – BELLAJAR' };

export default async function MyCoursesPage() {
  const user = await requirePageUser(canEnrollCourses);
  const [all, certificates] = await Promise.all([
    getCourses({ userId: user.id }),
    query('SELECT course_id, certificate_code FROM certificates WHERE user_id = $1', [user.id]),
  ]);

  return (
    <div className="page space-y-6">
      <div>
        <h1 className="text-3xl">Kursus Saya</h1>
        <p className="text-stone-600">Semua kursus yang kamu ikuti beserta progres belajarnya.</p>
      </div>
      <EnrolledCourses courses={all.filter((c) => c.enrolled)} certificates={certificates} />
    </div>
  );
}