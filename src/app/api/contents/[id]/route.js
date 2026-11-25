import { queryOne, query } from '@/lib/db';
import { canManageCourses } from '@/lib/auth';
import { guard, getEditableCourse } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';
import { parseContent } from '@/lib/validators';

async function loadContent(id, user) {
  if (!id) return { res: fail('ID materi tidak valid.') };
  const content = await queryOne('SELECT id, course_id FROM contents WHERE id = $1', [id]);
  if (!content) return { res: fail('Materi tidak ditemukan.', 404) };
  const { course, res } = await getEditableCourse(content.course_id, user);
  if (res) return { res };
  return { content, course };
}

export async function PUT(req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;
  const id = toId((await params).id);
  const { content, res: r2 } = await loadContent(id, user);
  if (r2) return r2;

  const { data, error } = parseContent(await readJson(req));
  if (error) return fail(error);

  await queryOne(
    `UPDATE contents
     SET title = $1, body = $2, image_url = $3, order_index = COALESCE($4::int, order_index)
     WHERE id = $5 RETURNING id`,
    [data.title, data.body, data.image_url, data.order_index, content.id]
  );
  return ok();
}

export async function DELETE(_req, { params }) {
  const { user, res } = await guard(canManageCourses);
  if (res) return res;
  const id = toId((await params).id);
  const { content, course, res: r2 } = await loadContent(id, user);
  if (r2) return r2;

  if (course.is_finalized) {
    return fail('Daftar bab sudah difiksasi dan tidak dapat dihapus lagi.', 403);
  }

  await queryOne('DELETE FROM contents WHERE id = $1 RETURNING id', [content.id]);
  await query(
    'UPDATE enrollments SET completed_content_ids = array_remove(completed_content_ids, $1::int) WHERE course_id = $2',
    [content.id, content.course_id]
  );
  return ok();
}