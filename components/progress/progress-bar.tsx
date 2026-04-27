export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full bg-slate-100 rounded-full h-2"
    >
      <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}
