export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className="w-full rounded-sm h-2.5 overflow-hidden"
      style={{ backgroundColor: '#e8e8e0', border: '1px solid #d0d0c8' }}
    >
      <div
        className="h-full transition-all"
        style={{ width: `${clamped}%`, backgroundColor: '#a8a89a' }}
      />
    </div>
  )
}
