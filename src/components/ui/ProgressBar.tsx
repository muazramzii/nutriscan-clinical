interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = false,
  size = "md",
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  let gradient = "linear-gradient(90deg, #1D9E75, #0E5A42)";
  if (clamped < 25) gradient = "linear-gradient(90deg, #E24B4A, #C73B3A)";
  else if (clamped < 50) gradient = "linear-gradient(90deg, #EF9F27, #D88714)";
  else if (clamped < 80) gradient = "linear-gradient(90deg, #FBBF24, #1D9E75)";

  const heightMap = { sm: "h-1.5", md: "h-2", lg: "h-3" };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${heightMap[size]}`}>
        <div
          className={`${heightMap[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%`, background: gradient }}
        />
      </div>
      {showLabel && (
        <p className="text-xs font-medium text-gray-500 mt-1.5 text-right tabular-nums">
          {Math.round(clamped)}%
        </p>
      )}
    </div>
  );
}
