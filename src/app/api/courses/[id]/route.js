import { queryOne } from '@/lib/db';
import { canManageCourses } from '@/lib/auth';
import { guard, getEditableCourse } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';
import { parseCourse } from '@/lib/validators';

export async function PUT(req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;
  const id = toId((await params).id);
  const { course, res: r2 } = await getEditableCourse(id, user);
  if (r2) return r2;

  const b = await readJson(req);
  const { data, error } = parseCourse(b);
  if (error) return fail(error);

  if (data.category_id) {
    const cat = await queryOne('SELECT id FROM categories WHERE id = $1', [data.category_id]);
    if (!cat) return fail('Kategori tidak ditemukan.');
  }

  let teacherId = course.teacher_id;
  if (user.role === 'admin' && b.teacher_id) {
    const t = await queryOne(
      `SELECT id FROM users WHERE id = $1 AND role IN ('teacher', 'admin')`,
      [Number(b.teacher_id)]
    );
    if (!t) return fail('Pengajar tidak valid.');
    teacherId = t.id;
  }

  await queryOne(
    `UPDATE courses
     SET title = $1, description = $2, category_id = $3, teacher_id = $4,
         start_date = $5::date, end_date = $6::date
     WHERE id = $7 RETURNING id`,
    [data.title, data.description, data.category_id, teacherId, data.start_date, data.end_date, id]
  );
  return ok();
}

export async function DELETE(_req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;
  const id = toId((await params).id);
  const { res: r2 } = await getEditableCourse(id, user);
  if (r2) return r2;

  await queryOne('DELETE FROM courses WHERE id = $1 RETURNING id', [id]);
  return ok();
}
