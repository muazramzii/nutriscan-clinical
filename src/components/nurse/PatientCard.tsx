import Link from "next/link";
import { DietTypeBadge } from "@/components/ui/Badge";
import { DietType, MealStatus } from "@/types";

interface Props {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  mealStatus: {
    BREAKFAST: MealStatus | null;
    LUNCH: MealStatus | null;
    DINNER: MealStatus | null;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

function MealChip({
  label,
  status,
  href,
}: {
  label: string;
  status: MealStatus | null;
  href: string;
}) {
  let chipStyle = "bg-gray-100 text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-200";
  let dot = <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />;

  if (status === "COMPLETE") {
    chipStyle = "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100";
    dot = (
      <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    );
  } else if (status === "PENDING_AFTER") {
    chipStyle = "bg-warning-50 text-warning-700 border border-warning-200 hover:bg-warning-100";
    dot = (
      <svg className="w-3 h-3 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    );
  }

  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${chipStyle}`}
    >
      {dot}
      {label}
    </Link>
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
  onEdit,
  onDelete,
}: Props) {

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
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <DietTypeBadge type={dietType} />
          {onEdit && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
              className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary transition-colors"
              title="Edit patient"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
              className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Delete patient"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Meal status row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <MealChip label="Breakfast" status={mealStatus.BREAKFAST} href={`/nurse/log/${id}/BREAKFAST`} />
        <MealChip label="Lunch" status={mealStatus.LUNCH} href={`/nurse/log/${id}/LUNCH`} />
        <MealChip label="Dinner" status={mealStatus.DINNER} href={`/nurse/log/${id}/DINNER`} />
      </div>
    </Link>
  );
}
