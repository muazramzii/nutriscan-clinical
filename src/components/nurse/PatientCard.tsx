import Link from "next/link";
import { DietTypeBadge } from "@/components/ui/Badge";
import { DietType, MealStatus } from "@/types";

interface Props {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  mealStatus: {
    BREAKFAST: MealStatus | null;
    LUNCH: MealStatus | null;
    DINNER: MealStatus | null;
  };
}

function MealChip({
  label,
  status,
}: {
  label: string;
  status: MealStatus | null;
}) {
  let bg = "bg-gray-100 text-gray-400";
  let icon = "—";
  if (status === "COMPLETE") {
    bg = "bg-primary-50 text-primary";
    icon = "✓";
  } else if (status === "PENDING_AFTER") {
    bg = "bg-warning-50 text-warning";
    icon = "⟳";
  }
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bg}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export function PatientCard({
  id,
  name,
  bedNumber,
  dietType,
  mealStatus,
}: Props) {
  return (
    <Link
      href={`/nurse/log/${id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 active:bg-gray-50 hover:border-primary-100 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900 text-base">{name}</p>
          <p className="text-sm text-gray-500">Bed {bedNumber}</p>
        </div>
        <DietTypeBadge type={dietType} />
      </div>
      <div className="flex gap-2 mt-3">
        <MealChip label="Breakfast" status={mealStatus.BREAKFAST} />
        <MealChip label="Lunch" status={mealStatus.LUNCH} />
        <MealChip label="Dinner" status={mealStatus.DINNER} />
      </div>
      <div className="flex justify-end mt-2">
        <span className="text-xs text-primary font-medium">Record Meal →</span>
      </div>
    </Link>
  );
}
