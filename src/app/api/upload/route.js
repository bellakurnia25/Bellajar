import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const DOC_TYPES = [...IMAGE_TYPES, 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folderRaw = String(formData.get('folder') || 'avatars');
    const folder = ['avatars', 'materials', 'docs'].includes(folderRaw) ? folderRaw : 'avatars';

    // Untuk avatar & materi wajib login; untuk docs boleh saat pendaftaran calon pengajar
    const user = await getCurrentUser();
    if (folder !== 'docs' && !user) {
      return NextResponse.json({ error: 'Silakan masuk terlebih dahulu.' }, { status: 401 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Berkas tidak ditemukan.' }, { status: 400 });
    }

    const allowed = folder === 'docs' ? DOC_TYPES : IMAGE_TYPES;
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            folder === 'docs'
              ? 'Format berkas harus PDF, JPG, PNG, atau WEBP.'
              : 'Format gambar harus JPG, PNG, WEBP, atau GIF.',
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran berkas maksimal 5MB.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const prefix = user ? `u${user.id}` : 'guest';
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${folder}/${fileName}` });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Gagal mengunggah berkas.' }, { status: 500 });
  }
}
