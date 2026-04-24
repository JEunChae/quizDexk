export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full bg-gray-200 rounded-full h-2"
    >
      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${clamped}%` }} />
    </div>
  )
}
