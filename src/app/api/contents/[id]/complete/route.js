import { queryOne, query } from '@/lib/db';
import { guard } from '@/lib/guard';
import { ok, fail, toId } from '@/lib/http';
import { accessStatus } from '@/lib/utils';
import { issueCertificate } from '@/lib/certificates';

export async function POST(_req, { params }) {
  const { user, res } = await guard();
  if (res) return res;
  const contentId = toId((await params).id);
  if (!contentId) return fail('ID materi tidak valid.');

  const content = await queryOne('SELECT id, course_id FROM contents WHERE id = $1', [contentId]);
  if (!content) return fail('Materi tidak ditemukan.', 404);

  const course = await queryOne(
    `SELECT is_finalized,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            to_char(end_date, 'YYYY-MM-DD') AS end_date
     FROM courses WHERE id = $1`,
    [content.course_id]
  );
  if (accessStatus(course) !== 'open') return fail('Masa akses kursus ini sedang tidak aktif.');

  const enrollment = await queryOne(
    'SELECT id, completed_content_ids FROM enrollments WHERE user_id = $1 AND course_id = $2',
    [user.id, content.course_id]
  );
  if (!enrollment) return fail('Ikuti kursus ini terlebih dahulu.', 403);

  const orderedContents = await query(
    'SELECT id FROM contents WHERE course_id = $1 ORDER BY order_index ASC, id ASC',
    [content.course_id]
  );
  const currentIndex = orderedContents.findIndex((c) => c.id === contentId);
  const completedSet = new Set(enrollment.completed_content_ids || []);
  const hasUnfinishedPrev = orderedContents
    .slice(0, currentIndex)
    .some((prev) => !completedSet.has(prev.id));

  if (hasUnfinishedPrev) {
    return fail('Tidak dapat menyelesaikan bab ini jika bab sebelumnya belum diselesaikan.', 400);
  }

  await query(
    `UPDATE enrollments
     SET completed_content_ids = array_append(completed_content_ids, $1::int)
     WHERE id = $2 AND NOT ($1::int = ANY(completed_content_ids))`,
    [contentId, enrollment.id]
  );

  const progress = await queryOne(
    `SELECT (SELECT COUNT(*) FROM contents WHERE course_id = $1)::int AS total,
            (SELECT COUNT(*) FROM contents ct
               WHERE ct.course_id = $1 AND ct.id = ANY(e.completed_content_ids))::int AS done
     FROM enrollments e WHERE e.id = $2`,
    [content.course_id, enrollment.id]
  );

  let certificateCode = null;
  if (course.is_finalized && progress.total > 0 && progress.done >= progress.total) {
    certificateCode = await issueCertificate(user.id, content.course_id);
  }
  return ok({ done: progress.done, total: progress.total, certificateCode });
}