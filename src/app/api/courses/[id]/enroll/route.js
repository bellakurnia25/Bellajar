import { queryOne } from '@/lib/db';
import { canEnrollCourses } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, toId } from '@/lib/http';
import { accessStatus } from '@/lib/utils';

export async function POST(_req, { params }) {
  const { user, res } = await guard();
  if (res) return res;

  if (!canEnrollCourses(user)) {
    return fail('Akun Admin, Pengajar, atau Calon Pengajar tidak dapat mendaftar sebagai peserta kursus.', 403);
  }

  const courseId = toId((await params).id);
  if (!courseId) return fail('ID kursus tidak valid.');

  const course = await queryOne(
    `SELECT id, to_char(start_date, 'YYYY-MM-DD') AS start_date, to_char(end_date, 'YYYY-MM-DD') AS end_date
     FROM courses WHERE id = $1`,
    [courseId]
  );
  if (!course) return fail('Kursus tidak ditemukan.', 404);

  const status = accessStatus(course);
  if (status === 'upcoming') return fail('Kursus ini belum dibuka.');
  if (status === 'ended') return fail('Masa akses kursus ini sudah berakhir.');

  await queryOne(
    `INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)
     ON CONFLICT (user_id, course_id) DO NOTHING RETURNING id`,
    [user.id, courseId]
  );
  return ok({}, 201);
}
