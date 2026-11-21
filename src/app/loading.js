export default function Loading() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-35"></span>
        <span className="relative flex h-14 w-14 animate-spin items-center justify-center rounded-full border-4 border-brand-200 border-t-brand-600 border-r-sky-400"></span>
      </div>
      <div className="text-center">
        <p className="font-display text-lg font-bold tracking-wide text-brand-700">BELLAJAR</p>
        <p className="text-xs font-medium text-stone-500">Menyiapkan halaman...</p>
      </div>
    </div>
  );
}
