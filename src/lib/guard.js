import { getCurrentUser, canManageCourses } from './auth';
import { fail } from './http';
import { queryOne } from './db';

/** Penjaga API: mengembalikan { user } jika lolos, atau { res } (respons error) jika tidak. */
export async function guard(check) {
  const user = await getCurrentUser();
  if (!user) return { res: fail('Silakan masuk terlebih dahulu.', 401) };
  if (check && !check(user)) return { res: fail('Kamu tidak punya akses untuk aksi ini.', 403) };
  return { user };
}

/** Memastikan kursus ada dan boleh diubah oleh user (admin, atau teacher pemilik). */
export async function getEditableCourse(courseId, user) {
  if (!courseId) return { res: fail('ID kursus tidak valid.', 400) };
  const course = await queryOne('SELECT id, teacher_id FROM courses WHERE id = $1', [courseId]);
  if (!course) return { res: fail('Kursus tidak ditemukan.', 404) };
  const allowed =
    user.role === 'admin' || (canManageCourses(user) && course.teacher_id === user.id);
  if (!allowed) return { res: fail('Kamu tidak punya akses ke kursus ini.', 403) };
  return { course };
}
