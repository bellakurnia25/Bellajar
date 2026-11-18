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

  let row;
  if (action === 'approve') {
    row = await queryOne(
      `UPDATE users
       SET role = 'teacher', teacher_status = 'approved', approved_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND role = 'student' AND teacher_status IN ('pending', 'rejected')
       RETURNING id`,
      [id]
    );
  } else if (action === 'reject') {
    row = await queryOne(
      `UPDATE users SET teacher_status = 'rejected'
       WHERE id = $1 AND role = 'student' AND teacher_status = 'pending'
       RETURNING id`,
      [id]
    );
  } else {
    return fail('Aksi tidak dikenal.');
  }
  if (!row) return fail('Pengguna tidak ditemukan atau statusnya sudah berubah.', 404);
  return ok();
}
