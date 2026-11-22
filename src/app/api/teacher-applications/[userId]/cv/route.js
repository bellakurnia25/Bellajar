import fs from 'fs';
import { guard } from '@/lib/guard';
import { fail, toId } from '@/lib/http';
import { cvPath, hasCv } from '@/lib/uploads';

// CV hanya boleh dibuka oleh Admin atau pemilik CV.
export async function GET(_req, { params }) {
  const { user, res } = await guard();
  if (res) return res;
  const id = toId((await params).userId);
  if (!id || (user.role !== 'admin' && user.id !== id)) return fail('Kamu tidak punya akses ke berkas ini.', 403);
  if (!hasCv(id)) return fail('CV belum diunggah.', 404);

  return new Response(fs.readFileSync(cvPath(id)), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="cv-${id}.pdf"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    },
  });
}
