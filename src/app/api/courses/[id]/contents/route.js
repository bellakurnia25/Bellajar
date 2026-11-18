import { queryOne } from '@/lib/db';
import { canManageCourses } from '@/lib/auth';
import { guard, getEditableCourse } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';
import { parseContent } from '@/lib/validators';

export async function POST(req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;
  const courseId = toId((await params).id);
  const { res: r2 } = await getEditableCourse(courseId, user);
  if (r2) return r2;

  const { data, error } = parseContent(await readJson(req));
  if (error) return fail(error);

  let order = data.order_index;
  if (!order) {
    const max = await queryOne('SELECT COALESCE(MAX(order_index), 0)::int AS m FROM contents WHERE course_id = $1', [courseId]);
    order = max.m + 1;
  }

  const row = await queryOne(
    `INSERT INTO contents (course_id, title, body, order_index)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [courseId, data.title, data.body, order]
  );
  return ok({ id: row.id }, 201);
}
