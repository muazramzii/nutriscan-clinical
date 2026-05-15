import { DetectedFoodItem } from "@/types";

interface Props {
  items: DetectedFoodItem[];
  totalKcal: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  onConfirm: () => void;
  onRetake: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export function FoodAnalysisResult({
  items,
  totalKcal,
  totalCarbs,
  totalProtein,
  totalFat,
  onConfirm,
  onRetake,
  confirmLabel = "Confirm",
  loading = false,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-sm">
        Food Detected
      </h3>

      <div className="bg-gray-50 rounded-xl divide-y divide-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 text-center">
            No food detected.
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.nameBM}</p>
                <p className="text-xs text-gray-400">
                  {item.nameEN} · {item.portionG}g
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {Math.round(item.kcalTotal)} kcal
                </p>
                {item.confidence !== undefined && (
                  <p className="text-xs text-gray-400">
                    {Math.round(item.confidence * 100)}% confidence
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {/* Totals row */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary-50">
          <div>
            <p className="text-sm font-bold text-gray-900">TOTAL</p>
            <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
              <span>C: {Math.round(totalCarbs)}g</span>
              <span>P: {Math.round(totalProtein)}g</span>
              <span>F: {Math.round(totalFat)}g</span>
            </div>
          </div>
          <p className="text-lg font-bold text-primary">
            {Math.round(totalKcal)} kcal
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetake}
          disabled={loading}
          className="flex-1 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50"
        >
          Retake
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="flex-2 flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : confirmLabel}
        </button>
      </div>
    </div>
  );
}
