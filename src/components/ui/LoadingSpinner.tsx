interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function LoadingSpinner({ size = "md", color = "text-primary" }: LoadingSpinnerProps) {
  const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  const trackMap = { sm: "border-2", md: "border-[2.5px]", lg: "border-[3px]" };
  return (
    <span
      className={`inline-block ${sizeMap[size]} ${trackMap[size]} ${color} rounded-full border-current border-t-transparent animate-spin`}
      role="status"
      aria-label="Loading"
      style={{ borderTopColor: "transparent" }}
    />
  );
}
