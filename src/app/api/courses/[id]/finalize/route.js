import { queryOne } from '@/lib/db';
import { canManageCourses } from '@/lib/auth';
import { guard, getEditableCourse } from '@/lib/guard';
import { ok, fail, toId } from '@/lib/http';

export async function PATCH(_req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;

  const courseId = toId((await params).id);
  const { course, res: r2 } = await getEditableCourse(courseId, user);
  if (r2) return r2;

  if (course.is_finalized) {
    return fail('Daftar bab pada kursus ini sudah difiksasi sebelumnya.', 400);
  }

  const countRow = await queryOne(
    'SELECT COUNT(*)::int AS total FROM contents WHERE course_id = $1',
    [courseId]
  );

  if (!countRow || countRow.total === 0) {
    return fail('Minimal harus ada 1 bab sebelum daftar bab dapat difiksasi.', 400);
  }

  await queryOne(
    'UPDATE courses SET is_finalized = TRUE WHERE id = $1 RETURNING id',
    [courseId]
  );

  return ok({ is_finalized: true });
}