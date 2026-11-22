import { queryOne } from '@/lib/db';
import { guard } from '@/lib/guard';
import { ok, fail } from '@/lib/http';
import { parseApplication, saveApplication } from '@/lib/applications';
import { readPdfFile, saveCv, hasCv } from '@/lib/uploads';

// Pendaftar yang menunggu / perlu perbaikan / ditolak boleh mengirim ulang berkasnya.
export async function POST(req) {
  const { user, res } = await guard(
    (u) => u.role === 'student' && ['pending', 'rejected'].includes(u.teacher_status)
  );
  if (res) return res;

  let form;
  try {
    form = await req.formData();
  } catch {
    return fail('Data pendaftaran tidak valid.');
  }
  const get = (k) => String(form.get(k) ?? '').trim();

  const { data, error } = await parseApplication(get);
  if (error) return fail(error);

  const file = form.get('cv');
  const hasNewCv = file && typeof file !== 'string' && file.size > 0;
  let cv = null;
  if (hasNewCv) {
    cv = await readPdfFile(file);
    if (cv.error) return fail(cv.error);
  } else if (!hasCv(user.id)) {
    return fail('Unggah CV dalam format PDF.');
  }

  await saveApplication(user.id, data);
  if (cv) saveCv(user.id, cv.buffer);
  await queryOne(`UPDATE users SET teacher_status = 'pending' WHERE id = $1 RETURNING id`, [user.id]);
  return ok();
}
