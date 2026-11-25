'use client';

// Keterangan syarat kata sandi; tanda centang muncul saat syaratnya terpenuhi.
export default function PasswordHint({ value = '' }) {
  const ok = value.length >= 6;
  return (
    <p className={`mt-1 flex items-center gap-1.5 text-xs ${ok ? 'font-semibold text-emerald-700' : 'text-stone-500'}`}>
      <span aria-hidden="true">{ok ? '✓' : '•'}</span>
      Syarat kata sandi: minimal 6 karakter.
    </p>
  );
}
