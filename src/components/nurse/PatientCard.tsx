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

function MealDot({
  label,
  status,
}: {
  label: string;
  status: MealStatus | null;
}) {
  let bg = "bg-gray-100 text-gray-400 border border-gray-200";
  let icon = (
    <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
    </svg>
  );

  if (status === "COMPLETE") {
    bg = "bg-primary text-white border border-primary";
    icon = (
      <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (status === "PENDING_AFTER") {
    bg = "bg-warning text-white border border-warning";
    icon = (
      <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" strokeWidth={2.5} />
      </svg>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <span className="text-[9px] font-medium text-gray-500">{label}</span>
    </div>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function PatientCard({
  id,
  name,
  bedNumber,
  dietType,
  mealStatus,
}: Props) {
  const completed = Object.values(mealStatus).filter((s) => s === "COMPLETE").length;
  const allDone = completed === 3;

  return (
    <Link
      href={`/nurse/log/${id}`}
      className="group block bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.99] transition-all"
    >
      {/* Top row: avatar + name + diet badge */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-[11px] flex-shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-[13px] leading-tight truncate">{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[11px] text-gray-500">Bed {bedNumber}</span>
          </div>
        </div>
        <DietTypeBadge type={dietType} />
      </div>

      {/* Meal status row */}
      <div className="flex items-center justify-between bg-gray-50/70 rounded-lg px-2.5 py-1.5">
        <div className="flex items-center gap-3">
          <MealDot label="Breakfast" status={mealStatus.BREAKFAST} />
          <MealDot label="Lunch" status={mealStatus.LUNCH} />
          <MealDot label="Dinner" status={mealStatus.DINNER} />
        </div>
        <div className="flex items-center gap-1">
          {allDone ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Complete
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
              Log
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
