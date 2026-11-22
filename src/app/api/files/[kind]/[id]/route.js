import fs from 'fs';
import { findImage, IMAGE_TYPES } from '@/lib/uploads';
import { toId } from '@/lib/http';

// Menampilkan gambar kursus/materi. kind dibatasi daftar putih dan id harus angka.
export async function GET(_req, { params }) {
  const { kind, id } = await params;
  const found = findImage(kind, toId(id));
  if (!found) return new Response('Gambar tidak ditemukan', { status: 404 });
  return new Response(fs.readFileSync(found.file), {
    headers: {
      'Content-Type': IMAGE_TYPES[found.ext],
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
