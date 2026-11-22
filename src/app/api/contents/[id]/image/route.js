import { canManageCourses } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { guard, getEditableCourse } from '@/lib/guard';
import { ok, fail, toId } from '@/lib/http';
import { readImageFile, saveImage, removeImage, imageUrl } from '@/lib/uploads';

async function authorize(params) {
  const { user, res } = await guard(canManageCourses);
  if (res) return { res };
  const id = toId((await params).id);
  const content = id ? await queryOne('SELECT id, course_id FROM contents WHERE id = $1', [id]) : null;
  if (!content) return { res: fail('Materi tidak ditemukan.', 404) };
  const { res: r2 } = await getEditableCourse(content.course_id, user);
  if (r2) return { res: r2 };
  return { id };
}

export async function POST(req, { params }) {
  const { id, res } = await authorize(params);
  if (res) return res;
  let form;
  try {
    form = await req.formData();
  } catch {
    return fail('Data unggahan tidak valid.');
  }
  const img = await readImageFile(form.get('image'));
  if (img.error) return fail(img.error);
  saveImage('contents', id, img.buffer, img.ext);
  return ok({ url: imageUrl('contents', id) });
}

export async function DELETE(_req, { params }) {
  const { id, res } = await authorize(params);
  if (res) return res;
  removeImage('contents', id);
  return ok();
}
