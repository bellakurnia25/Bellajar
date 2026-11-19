import fs from 'fs';
import path from 'path';

// Tema visual kartu kursus: gradien + gambar (atau emoji cadangan) berdasarkan kategori.
const GRADIENTS = [
  'from-brand-300 to-brand-500',
  'from-sky-300 to-violet-400',
  'from-amber-300 to-orange-400',
  'from-emerald-300 to-sky-400',
  'from-violet-300 to-brand-400',
];

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images', 'courses');
const EXTENSIONS = ['png', 'webp', 'jpg', 'jpeg', 'svg'];

// [pola nama kategori, nama file tanpa ekstensi, emoji cadangan]
const CATEGORY_IMAGES = [
  [/seni|gambar|menggambar/, 'seni', '🎨'],
  [/sains|ipa|alam/, 'sains', '🔬'],
  [/bahasa|baca|cerita/, 'bahasa', '📖'],
  [/logika|permainan|coding|program/, 'logika', '🧩'],
  [/keterampilan|musik|origami/, 'keterampilan', '🎵'],
  [/mate|hitung|angka/, 'matematika', '🧮'],
];

const cache = new Map();

function findImage(base) {
  if (cache.has(base)) return cache.get(base);
  let found = null;
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(IMAGE_DIR, `${base}.${ext}`))) {
      found = `/images/courses/${base}.${ext}`;
      break;
    }
  }
  // Di development jangan di-cache, supaya gambar baru langsung terbaca.
  if (process.env.NODE_ENV === 'production') cache.set(base, found);
  return found;
}

export function courseTheme(course) {
  const gradient = GRADIENTS[(course.id || 0) % GRADIENTS.length];
  const name = (course.category_name || '').toLowerCase();
  const match = CATEGORY_IMAGES.find(([re]) => re.test(name));

  // Urutan prioritas: gambar khusus kursus -> gambar kategori -> default -> emoji
  const image =
    findImage(`course-${course.id}`) ||
    (match && findImage(match[1])) ||
    findImage('default');

  return { gradient, image, emoji: match ? match[2] : '📚' };
}

export const CHIP_COLORS = [
  'border-brand-200 bg-brand-100 text-brand-700',
  'border-sky-200 bg-sky-100 text-sky-700',
  'border-amber-300 bg-amber-100 text-amber-800',
  'border-emerald-200 bg-emerald-100 text-emerald-700',
  'border-violet-200 bg-violet-100 text-violet-700',
];