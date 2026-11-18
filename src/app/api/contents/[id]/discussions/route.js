import { queryOne } from '@/lib/db';
import { guard } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';

export async function POST(req, { params }) {
  const { user, res } = await guard();
  if (res) return res;
  const contentId = toId((await params).id);
  if (!contentId) return fail('ID materi tidak valid.');

  const b = await readJson(req);
  const comment = String(b?.comment || '').trim();
  if (comment.length < 1) return fail('Tulis komentarmu dulu ya.');
  if (comment.length > 1000) return fail('Komentar maksimal 1000 karakter.');

  const content = await queryOne(
    `SELECT ct.id, c.teacher_id, ct.course_id
     FROM contents ct JOIN courses c ON c.id = ct.course_id WHERE ct.id = $1`,
    [contentId]
  );
  if (!content) return fail('Materi tidak ditemukan.', 404);

  const isStaff = user.role === 'admin' || content.teacher_id === user.id;
  if (!isStaff) {
    const enrolled = await queryOne(
      'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [user.id, content.course_id]
    );
    if (!enrolled) return fail('Ikuti kursus ini dulu untuk ikut berdiskusi.', 403);
  }

  await queryOne(
    'INSERT INTO discussions (content_id, user_id, comment) VALUES ($1, $2, $3) RETURNING id',
    [contentId, user.id, comment]
  );
  return ok({}, 201);
}
