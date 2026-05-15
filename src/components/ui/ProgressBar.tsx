interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, showLabel = false, className = "" }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  let barColor = "bg-primary";
  if (clamped < 25) barColor = "bg-danger";
  else if (clamped < 50) barColor = "bg-warning";
  else if (clamped < 80) barColor = "bg-yellow-400";

  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(clamped)}%</p>
      )}
    </div>
  );
}
