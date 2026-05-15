import { useState } from "react";
import { DetectedFoodItem } from "@/types";

interface Props {
  items: DetectedFoodItem[];
  totalKcal: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  onConfirm: (updatedItems: DetectedFoodItem[]) => void;
  onRetake: () => void;
  confirmLabel?: string;
  loading?: boolean;
}

export function FoodAnalysisResult({
  items: initialItems,
  totalKcal: initialKcal,
  totalCarbs: initialCarbs,
  totalProtein: initialProtein,
  totalFat: initialFat,
  onConfirm,
  onRetake,
  confirmLabel = "Confirm",
  loading = false,
}: Props) {
  const [items, setItems] = useState<DetectedFoodItem[]>(initialItems);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateItem = (index: number, field: keyof DetectedFoodItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totals = items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + (Number(item.kcalTotal) || 0),
      carbs: acc.carbs + (Number(item.carbsG) || 0),
      protein: acc.protein + (Number(item.proteinG) || 0),
      fat: acc.fat + (Number(item.fatG) || 0),
    }),
    { kcal: 0, carbs: 0, protein: 0, fat: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">
          Food Detected
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {isEditing ? "Done Editing" : "Edit Items"}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 p-4 text-center">
            No food detected.
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex flex-col px-4 py-3 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.nameBM}
                      onChange={(e) => handleUpdateItem(i, "nameBM", e.target.value)}
                      className="w-full text-sm font-medium border-b border-primary-200 focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-800">{item.nameBM}</p>
                  )}
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                    {item.nameEN}
                  </p>
                </div>
                <div className="text-right">
                  {isEditing ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        value={item.kcalTotal}
                        onChange={(e) => handleUpdateItem(i, "kcalTotal", parseInt(e.target.value))}
                        className="w-16 text-right text-sm font-bold border-b border-primary-200 focus:outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-gray-400">kcal</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-900">
                      {Math.round(item.kcalTotal)} kcal
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                  <span className="font-semibold text-gray-400 uppercase">Weight:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.portionG}
                      onChange={(e) => handleUpdateItem(i, "portionG", parseInt(e.target.value))}
                      className="w-10 bg-transparent focus:outline-none"
                    />
                  ) : (
                    <span>{item.portionG}g</span>
                  )}
                </div>
                {item.confidence !== undefined && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span>{Math.round(item.confidence * 100)}% AI Confidence</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Totals row */}
        <div className="flex items-center justify-between px-4 py-4 bg-primary-50">
          <div>
            <p className="text-xs font-bold text-primary-900 uppercase tracking-wider">Estimated Total</p>
            <div className="flex gap-4 text-[11px] text-primary-700 mt-1 font-medium">
              <span>C: {Math.round(totals.carbs)}g</span>
              <span>P: {Math.round(totals.protein)}g</span>
              <span>F: {Math.round(totals.fat)}g</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-primary">
              {Math.round(totals.kcal)} <span className="text-xs font-bold">kcal</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetake}
          disabled={loading}
          className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 shadow-sm"
        >
          Retake Photo
        </button>
        <button
          type="button"
          onClick={() => onConfirm(items)}
          disabled={loading}
          className="flex-1 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : confirmLabel}
        </button>
      </div>
    </div>
  );
}
