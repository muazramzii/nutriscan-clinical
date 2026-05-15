import { DietType, AlertType, MealStatus, FoodCategory } from "@/types";

const dietTypeMap: Record<DietType, { label: string; className: string }> = {
  DIABETIC: { label: "Diabetic", className: "bg-blue-100 text-blue-800" },
  LOW_SODIUM: { label: "Low Sodium", className: "bg-purple-100 text-purple-800" },
  POST_SURGERY: { label: "Post Surgery", className: "bg-orange-100 text-orange-800" },
  RENAL: { label: "Renal", className: "bg-yellow-100 text-yellow-800" },
  REGULAR: { label: "Regular", className: "bg-green-100 text-green-800" },
};

const alertTypeMap: Record<AlertType, { label: string; className: string }> = {
  LOW_INTAKE: { label: "Low Intake", className: "bg-warning-50 text-warning" },
  CRITICAL_INTAKE: { label: "Critical", className: "bg-danger-50 text-danger" },
  MISSED_MEAL: { label: "Missed Meal", className: "bg-gray-100 text-gray-700" },
};

const mealStatusMap: Record<MealStatus, { label: string; className: string }> = {
  PENDING_AFTER: { label: "Pending After", className: "bg-yellow-100 text-yellow-800" },
  COMPLETE: { label: "Complete", className: "bg-primary-50 text-primary" },
};

const categoryMap: Record<FoodCategory, { label: string; className: string }> = {
  STAPLE: { label: "Staple Food", className: "bg-amber-100 text-amber-800" },
  PROTEIN: { label: "Protein", className: "bg-red-100 text-red-800" },
  VEGETABLE: { label: "Vegetables", className: "bg-green-100 text-green-800" },
  FRUIT: { label: "Fruits", className: "bg-pink-100 text-pink-800" },
  BEVERAGE: { label: "Beverages", className: "bg-blue-100 text-blue-800" },
  OTHER: { label: "Others", className: "bg-gray-100 text-gray-700" },
};

export function DietTypeBadge({ type }: { type: DietType }) {
  const { label, className } = dietTypeMap[type] ?? dietTypeMap.REGULAR;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const { label, className } = alertTypeMap[type] ?? alertTypeMap.MISSED_MEAL;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function MealStatusBadge({ status }: { status: MealStatus }) {
  const { label, className } = mealStatusMap[status] ?? mealStatusMap.PENDING_AFTER;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: FoodCategory }) {
  const { label, className } = categoryMap[category] ?? categoryMap.OTHER;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function StatusLabel({
  status,
}: {
  status: "On track" | "Low intake" | "Critical" | "No data";
}) {
  const map = {
    "On track": "bg-primary-50 text-primary",
    "Low intake": "bg-warning-50 text-warning",
    Critical: "bg-danger-50 text-danger",
    "No data": "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status}
    </span>
  );
}
