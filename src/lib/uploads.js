import fs from 'fs';
import path from 'path';

// Semua unggahan disimpan sebagai file di folder uploads/ (di luar public) dan dilayani lewat API,
// sehingga tidak perlu mengubah kolom database dan tidak butuh restart saat ada file baru.
const ROOT = path.join(process.cwd(), 'uploads');

export const IMAGE_TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
export const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_KINDS = ['courses', 'contents'];

/** Jenis gambar ditentukan dari isi file, bukan dari nama atau Content-Type yang bisa dipalsukan. */
export function detectImageType(buf) {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}

export const isPdf = (buf) => buf.length > 5 && buf.subarray(0, 5).toString('latin1') === '%PDF-';

const dir = (kind) => path.join(ROOT, kind);

/* ---------- Gambar (sampul kursus & gambar materi) ---------- */
export function findImage(kind, id) {
  if (!IMAGE_KINDS.includes(kind) || !Number.isInteger(id)) return null;
  for (const ext of Object.keys(IMAGE_TYPES)) {
    const file = path.join(dir(kind), `${id}.${ext}`);
    if (fs.existsSync(file)) return { file, ext };
  }
  return null;
}

/** URL gambar (dengan ?v= agar browser memuat ulang saat gambar diganti), atau null. */
export function imageUrl(kind, id) {
  const found = findImage(kind, id);
  if (!found) return null;
  return `/api/files/${kind}/${id}?v=${Math.floor(fs.statSync(found.file).mtimeMs)}`;
}

export function removeImage(kind, id) {
  for (const ext of Object.keys(IMAGE_TYPES)) {
    try {
      fs.unlinkSync(path.join(dir(kind), `${id}.${ext}`));
    } catch {}
  }
}

export function saveImage(kind, id, buffer, ext) {
  fs.mkdirSync(dir(kind), { recursive: true });
  removeImage(kind, id);
  fs.writeFileSync(path.join(dir(kind), `${id}.${ext}`), buffer);
}

/** Membaca & memvalidasi file gambar dari FormData. */
export async function readImageFile(file) {
  if (!file || typeof file === 'string' || !file.size) return { error: 'Pilih gambar terlebih dahulu.' };
  if (file.size > MAX_IMAGE_BYTES) return { error: 'Ukuran gambar maksimal 2 MB.' };
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectImageType(buffer);
  if (!ext) return { error: 'Format gambar harus PNG, JPG, atau WEBP.' };
  return { buffer, ext };
}

/* ---------- CV pendaftar pengajar (PDF) ---------- */
export const cvPath = (userId) => path.join(dir('cv'), `${userId}.pdf`);
export const hasCv = (userId) => Number.isInteger(userId) && fs.existsSync(cvPath(userId));
export const removeCv = (userId) => {
  try {
    fs.unlinkSync(cvPath(userId));
  } catch {}
};
export function saveCv(userId, buffer) {
  fs.mkdirSync(dir('cv'), { recursive: true });
  fs.writeFileSync(cvPath(userId), buffer);
}

export async function readPdfFile(file) {
  if (!file || typeof file === 'string' || !file.size) return { error: 'Unggah CV dalam format PDF.' };
  if (file.size > MAX_PDF_BYTES) return { error: 'Ukuran CV maksimal 5 MB.' };
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isPdf(buffer)) return { error: 'CV harus berupa file PDF.' };
  return { buffer };
}
