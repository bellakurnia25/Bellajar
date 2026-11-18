import { queryOne } from '@/lib/db';
import { canManageCourses } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson } from '@/lib/http';
import { parseCourse } from '@/lib/validators';

export async function POST(req) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;

  const b = await readJson(req);
  const { data, error } = parseCourse(b);
  if (error) return fail(error);

  if (data.category_id) {
    const cat = await queryOne('SELECT id FROM categories WHERE id = $1', [data.category_id]);
    if (!cat) return fail('Kategori tidak ditemukan.');
  }

  // Teacher selalu menjadi pemilik kursusnya sendiri; Admin boleh memilih pengajar.
  let teacherId = user.id;
  if (user.role === 'admin' && b.teacher_id) {
    const t = await queryOne(
      `SELECT id FROM users WHERE id = $1 AND role IN ('teacher', 'admin')`,
      [Number(b.teacher_id)]
    );
    if (!t) return fail('Pengajar tidak valid.');
    teacherId = t.id;
  }

  const course = await queryOne(
    `INSERT INTO courses (title, description, category_id, teacher_id, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5::date, $6::date) RETURNING id`,
    [data.title, data.description, data.category_id, teacherId, data.start_date, data.end_date]
  );
  return ok({ id: course.id }, 201);
}
