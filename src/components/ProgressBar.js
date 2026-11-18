export default function ProgressBar({ value = 0, label = 'Progres belajar' }) {
  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs font-bold text-green-700">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
