import { queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ok, fail, readJson, toId } from '@/lib/http';
import { parseCourse } from '@/lib/validators';

export async function PUT(req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      return fail('Akses ditolak.', 403);
    }

    const courseId = toId((await params).id);
    if (!courseId) return fail('ID kursus tidak valid.', 400);

    const existing = await queryOne('SELECT id, teacher_id FROM courses WHERE id = $1', [courseId]);
    if (!existing) return fail('Kursus tidak ditemukan.', 404);

    if (user.role !== 'admin' && existing.teacher_id !== user.id) {
      return fail('Kamu hanya dapat mengubah kursus milikmu sendiri.', 403);
    }

    const b = await readJson(req);
    const parsed = parseCourse(b);
    if (parsed.error) return fail(parsed.error);

    const { title, description, category_id, start_date, end_date } = parsed.data;

    let teacherId = existing.teacher_id;
    if (user.role === 'admin' && b?.teacher_id !== undefined && b?.teacher_id !== null && b?.teacher_id !== '') {
      const requestedTeacherId = Number(b.teacher_id);
      if (!Number.isInteger(requestedTeacherId) || requestedTeacherId < 1) {
        return fail('Pengajar tidak valid.');
      }
      const teacherUser = await queryOne(
        "SELECT id FROM users WHERE id = $1 AND role IN ('teacher', 'admin')",
        [requestedTeacherId]
      );
      if (!teacherUser) return fail('Pengajar yang dipilih tidak ditemukan.');
      teacherId = requestedTeacherId;
    }

    await queryOne(
      `UPDATE courses
       SET title = $1,
           description = $2,
           category_id = $3,
           teacher_id = $4,
           start_date = $5,
           end_date = $6
       WHERE id = $7
       RETURNING id`,
      [title, description, category_id, teacherId, start_date, end_date, courseId]
    );

    return ok({ updated: true });
  } catch (err) {
    console.error('Update course error:', err);
    return fail('Gagal memperbarui kursus.', 500);
  }
}

export async function DELETE(_req, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
      return fail('Akses ditolak.', 403);
    }

    const courseId = toId((await params).id);
    if (!courseId) return fail('ID kursus tidak valid.', 400);

    const existing = await queryOne('SELECT id, teacher_id FROM courses WHERE id = $1', [courseId]);
    if (!existing) return fail('Kursus tidak ditemukan.', 404);

    if (user.role !== 'admin' && existing.teacher_id !== user.id) {
      return fail('Kamu hanya dapat menghapus kursus milikmu sendiri.', 403);
    }

    await queryOne('DELETE FROM courses WHERE id = $1 RETURNING id', [courseId]);
    return ok({ deleted: true });
  } catch (err) {
    console.error('Delete course error:', err);
    return fail('Gagal menghapus kursus.', 500);
  }
}