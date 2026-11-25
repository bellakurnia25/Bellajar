import fs from 'fs';
import path from 'path';

// Huruf-huruf berwarna ala logo BELLAJAR. Jika ada public/images/logo.png, gambar itu yang dipakai.
const LETTERS = [
  ['B', '#1ea7fd', -4],
  ['e', '#ff5fb0', 3],
  ['L', '#ffb81c', -2],
  ['L', '#2fc47a', 4],
  ['a', '#a15cf5', -3],
  ['j', '#ff7a3d', 3],
  ['a', '#1ea7fd', -2],
  ['R', '#ff4d6a', 4],
];

export default function Logo({ size = 'md' }) {
  const hasImage = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'logo.png'));
  const imgH = size === 'lg' ? 'h-14' : 'h-10';
  if (hasImage) {
    return <img src="/images/logo.png" alt="BELLAJAR" className={`${imgH} w-auto`} />;
  }
  const text = size === 'lg' ? 'text-5xl' : 'text-3xl';
  return (
    <span className={`font-display font-bold leading-none tracking-tight ${text}`} aria-label="BELLAJAR" role="img">
      {LETTERS.map(([ch, color, rot], i) => (
        <span key={i} aria-hidden="true" className="inline-block" style={{ color, transform: `rotate(${rot}deg)` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}
