import { query } from './db';

const COURSE_BASE = `
SELECT c.id, c.title, c.description, c.category_id, c.teacher_id,
  to_char(c.start_date, 'YYYY-MM-DD') AS start_date,
  to_char(c.end_date, 'YYYY-MM-DD')   AS end_date,
  cat.name AS category_name,
  t.username AS teacher_name,
  t.email AS teacher_email,
  COALESCE(pc.cnt, 0)::int AS student_count,
  (SELECT COUNT(*) FROM contents ct WHERE ct.course_id = c.id)::int AS total_contents,
  (e.id IS NOT NULL) AS enrolled,
  (SELECT COUNT(*) FROM contents ct
     WHERE ct.course_id = c.id AND ct.id = ANY(e.completed_content_ids))::int AS done_contents
FROM courses c
JOIN users t ON t.id = c.teacher_id
LEFT JOIN categories cat ON cat.id = c.category_id
LEFT JOIN (SELECT course_id, COUNT(*) AS cnt FROM enrollments GROUP BY course_id) pc ON pc.course_id = c.id
LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = $1`;

/**
 * Daftar kursus + jumlah siswa (JOIN & COUNT) + progres milik userId (jika ada).
 * popular=true mengurutkan berdasarkan jumlah siswa terbanyak.
 */
export async function getCourses({
  userId = null,
  search = '',
  categoryId = null,
  courseId = null,
  teacherId = null,
  popular = false,
  limit = null,
} = {}) {
  const params = [userId];
  const where = [];

  if (search) {
    params.push(`%${search}%`);
    const i = params.length;
    where.push(`(c.title ILIKE $${i} OR c.description ILIKE $${i} OR t.username ILIKE $${i})`);
  }
  if (Number.isInteger(categoryId) && categoryId > 0) {
    params.push(categoryId);
    where.push(`c.category_id = $${params.length}`);
  }
  if (Number.isInteger(courseId) && courseId > 0) {
    params.push(courseId);
    where.push(`c.id = $${params.length}`);
  }
  if (Number.isInteger(teacherId) && teacherId > 0) {
    params.push(teacherId);
    where.push(`c.teacher_id = $${params.length}`);
  }

  let sql = COURSE_BASE;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += popular
    ? ' ORDER BY COALESCE(pc.cnt, 0) DESC, c.created_at DESC'
    : ' ORDER BY c.created_at DESC';
  if (limit) {
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }
  return query(sql, params);
}

export function getCategories() {
  return query(
    `SELECT cat.id, cat.name, COUNT(c.id)::int AS course_count
     FROM categories cat LEFT JOIN courses c ON c.category_id = cat.id
     GROUP BY cat.id ORDER BY cat.name`
  );
}

export function getContents(courseId) {
  return query(
    `SELECT id, course_id, title, body, order_index
     FROM contents WHERE course_id = $1 ORDER BY order_index ASC, id ASC`,
    [courseId]
  );
}
