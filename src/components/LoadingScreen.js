// Tampilan memuat halaman: titik-titik warna-warni yang memantul, senada dengan warna logo BELLAJAR.
const COLORS = ['#1ea7fd', '#ff5fb0', '#ffb81c', '#2fc47a', '#a15cf5'];

export default function LoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4" role="status" aria-live="polite">
      <div className="flex items-end gap-2.5" aria-hidden="true">
        {COLORS.map((c, i) => (
          <span key={c} className="loading-dot block h-5 w-5 rounded-full" style={{ background: c, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <p className="font-display text-lg font-semibold text-brand-700">Memuat halaman…</p>
    </div>
  );
}
