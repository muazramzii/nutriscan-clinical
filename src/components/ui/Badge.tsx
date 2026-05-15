import { DietType, AlertType, MealStatus, FoodCategory } from "@/types";

const baseClass =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight ring-1 ring-inset whitespace-nowrap";

const dietTypeMap: Record<DietType, { label: string; className: string }> = {
  DIABETIC: { label: "Diabetic", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  LOW_SODIUM: { label: "Low Sodium", className: "bg-purple-50 text-purple-700 ring-purple-200" },
  POST_SURGERY: { label: "Post Surgery", className: "bg-orange-50 text-orange-700 ring-orange-200" },
  RENAL: { label: "Renal", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  REGULAR: { label: "Regular", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

const alertTypeMap: Record<AlertType, { label: string; className: string }> = {
  LOW_INTAKE: { label: "Low Intake", className: "bg-warning-50 text-warning-600 ring-warning-100" },
  CRITICAL_INTAKE: { label: "Critical", className: "bg-danger-50 text-danger-600 ring-danger-100" },
  MISSED_MEAL: { label: "Missed Meal", className: "bg-gray-50 text-gray-700 ring-gray-200" },
};

const mealStatusMap: Record<MealStatus, { label: string; className: string }> = {
  PENDING_AFTER: { label: "Pending After", className: "bg-warning-50 text-warning-600 ring-warning-100" },
  COMPLETE: { label: "Complete", className: "bg-primary-50 text-primary-700 ring-primary-100" },
};

const categoryMap: Record<FoodCategory, { label: string; className: string }> = {
  STAPLE: { label: "Staple", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  PROTEIN: { label: "Protein", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  VEGETABLE: { label: "Vegetables", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  FRUIT: { label: "Fruits", className: "bg-pink-50 text-pink-700 ring-pink-200" },
  BEVERAGE: { label: "Beverages", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  OTHER: { label: "Other", className: "bg-gray-50 text-gray-700 ring-gray-200" },
};

export function DietTypeBadge({ type }: { type: DietType }) {
  const { label, className } = dietTypeMap[type] ?? dietTypeMap.REGULAR;
  return <span className={`${baseClass} ${className}`}>{label}</span>;
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const { label, className } = alertTypeMap[type] ?? alertTypeMap.MISSED_MEAL;
  return <span className={`${baseClass} ${className}`}>{label}</span>;
}

export function MealStatusBadge({ status }: { status: MealStatus }) {
  const { label, className } = mealStatusMap[status] ?? mealStatusMap.PENDING_AFTER;
  return <span className={`${baseClass} ${className}`}>{label}</span>;
}

export function CategoryBadge({ category }: { category: FoodCategory }) {
  const { label, className } = categoryMap[category] ?? categoryMap.OTHER;
  return <span className={`${baseClass} ${className}`}>{label}</span>;
}

export function StatusLabel({ status }: { status: string }) {
  let className = "bg-gray-50 text-gray-600 ring-gray-200";
  let dot = "bg-gray-400";
  let pulse = false;

  if (status.includes("Meeting") || status === "On track") {
    className = "bg-primary-50 text-primary-700 ring-primary-100";
    dot = "bg-primary";
  } else if (status.includes("Partial") || status === "Low intake") {
    className = "bg-warning-50 text-warning-600 ring-warning-100";
    dot = "bg-warning";
  } else if (status.includes("Critical")) {
    className = "bg-danger-50 text-danger-600 ring-danger-100";
    dot = "bg-danger";
  } else if (status.includes("Action")) {
    className = "bg-danger-50 text-danger-600 ring-danger-100";
    dot = "bg-danger";
    pulse = true;
  }

  return (
    <span className={`${baseClass} ${className} ${pulse ? "animate-pulse" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({
  priority,
}: {
  priority: "HIGH" | "MEDIUM" | "LOW" | "NONE";
}) {
  const map = {
    HIGH: { label: "High", className: "bg-danger text-white ring-danger" },
    MEDIUM: { label: "Medium", className: "bg-warning text-white ring-warning" },
    LOW: { label: "Stable", className: "bg-primary text-white ring-primary" },
    NONE: { label: "New", className: "bg-gray-400 text-white ring-gray-400" },
  };
  const { label, className } = map[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}
