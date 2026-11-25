import fs from 'fs';
import path from 'path';

const EXTS = ['png', 'webp', 'jpg', 'jpeg', 'svg', 'gif'];

/** Mencari gambar di public/images/slots/<nama>.<ekstensi>. */
export function findSlot(name) {
  for (const ext of EXTS) {
    if (fs.existsSync(path.join(process.cwd(), 'public', 'images', 'slots', `${name}.${ext}`))) {
      return `/images/slots/${name}.${ext}`;
    }
  }
  return null;
}

/**
 * Tempat gambar dekoratif. Taruh file bernama <name>.png (atau webp/jpg/svg/gif) di
 * public/images/slots/ maka otomatis tampil di sini. Jika belum ada, tampil gelembung emoji.
 * `className` mengatur ukuran kotak (mis. "h-28 w-28").
 */
export default function ArtSlot({ name, emoji = '✨', alt = '', className = 'h-28 w-28', fallback = 'bubble' }) {
  const src = findSlot(name);
  if (src) {
    return (
      <div className={`shrink-0 ${className}`}>
        <img src={src} alt={alt} className="h-full w-full object-contain drop-shadow-md" />
      </div>
    );
  }
  if (fallback === 'none') return null;
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 via-violet-100 to-sky-100 text-5xl shadow-inner ${className}`}
    >
      {emoji}
    </div>
  );
}
