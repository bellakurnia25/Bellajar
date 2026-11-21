import { queryOne } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { guard } from '@/lib/guard';
import { ok, fail, readJson, toId } from '@/lib/http';

export async function POST(req, { params }) {
  const { res } = await guard(isAdmin);
  if (res) return res;
  const id = toId((await params).id);
  if (!id) return fail('ID tidak valid.');

  const b = await readJson(req);
  const action = b?.action;
  const note = String(b?.note || '').trim();

  let row;
  if (action === 'approve') {
    row = await queryOne(
      `UPDATE users
       SET role = 'teacher', teacher_status = 'approved',
           teacher_review_note = NULL,
           approved_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'student' AND teacher_status IN ('pending', 'rejected')
       RETURNING id`,
      [id]
    );
  } else if (action === 'pending') {
    if (note.length < 5) {
      return fail('Wajib mengisi catatan evaluasi saat menahan (pending) pendaftar.');
    }
    row = await queryOne(
      `UPDATE users
       SET teacher_status = 'pending', teacher_review_note = $2
       WHERE id = $1 AND role = 'student' AND teacher_status IN ('pending', 'rejected')
       RETURNING id`,
      [id, note]
    );
  } else if (action === 'reject') {
    if (note.length < 5) {
      return fail('Wajib mengisi alasan penolakan agar pendaftar dapat memperbaiki berkasnya.');
    }
    row = await queryOne(
      `UPDATE users
       SET teacher_status = 'rejected', teacher_review_note = $2
       WHERE id = $1 AND role = 'student' AND teacher_status IN ('pending', 'rejected')
       RETURNING id`,
      [id, note]
    );
  } else {
    return fail('Aksi tidak dikenal.');
  }

  if (!row) return fail('Pengguna tidak ditemukan atau statusnya sudah berubah.', 404);
  return ok();
}
