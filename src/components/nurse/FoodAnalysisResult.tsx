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
    <div className="space-y-4 animate-fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-50 ring-1 ring-inset ring-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">Food Detected</h3>
            <p className="text-2xs text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""} identified by AI</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-3 py-1.5 rounded-full hover:bg-primary-100/60 tap-scale"
        >
          {isEditing ? (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </>
          )}
        </button>
      </div>

      {/* Items card */}
      <div className="bg-white border border-gray-100 rounded-3xl divide-y divide-gray-100 overflow-hidden shadow-card">
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 p-6 text-center">No food detected.</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.nameBM}
                      onChange={(e) => handleUpdateItem(i, "nameBM", e.target.value)}
                      className="w-full text-sm font-semibold text-gray-900 bg-gray-50 border border-primary-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 tracking-tight">{item.nameBM}</p>
                  )}
                  <p className="text-2xs text-gray-400 uppercase tracking-widest mt-0.5">
                    {item.nameEN}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {isEditing ? (
                    <div className="flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        value={item.kcalTotal}
                        onChange={(e) => handleUpdateItem(i, "kcalTotal", parseInt(e.target.value) || 0)}
                        className="w-16 text-right text-sm font-bold text-gray-900 bg-gray-50 border border-primary-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <span className="text-2xs text-gray-400 font-medium">kcal</span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                      {Math.round(item.kcalTotal)}
                      <span className="text-2xs font-medium text-gray-400 ml-1">kcal</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-2xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                  <span className="text-gray-400">Weight</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={item.portionG}
                      onChange={(e) => handleUpdateItem(i, "portionG", parseInt(e.target.value) || 0)}
                      className="w-10 bg-transparent focus:outline-none text-right tabular-nums"
                    />
                  ) : (
                    <span className="tabular-nums">{item.portionG}g</span>
                  )}
                </span>
                {item.confidence !== undefined && (
                  <span className="inline-flex items-center gap-1 text-2xs font-medium text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-2 py-0.5 rounded-md">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="6" />
                    </svg>
                    {Math.round(item.confidence * 100)}% confidence
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Totals row */}
        <div
          className="px-5 py-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-white/70">Total</p>
              <div className="flex gap-3 text-2xs mt-1.5 font-medium">
                <span className="text-white/90">
                  <span className="text-white/60">C</span> {Math.round(totals.carbs)}g
                </span>
                <span className="text-white/90">
                  <span className="text-white/60">P</span> {Math.round(totals.protein)}g
                </span>
                <span className="text-white/90">
                  <span className="text-white/60">F</span> {Math.round(totals.fat)}g
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white leading-none tabular-nums">
                {Math.round(totals.kcal)}
              </p>
              <p className="text-2xs font-bold text-white/70 uppercase tracking-wider mt-0.5">kcal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetake}
          disabled={loading}
          className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 shadow-card tap-scale transition-all"
        >
          Retake
        </button>
        <button
          type="button"
          onClick={() => onConfirm(items)}
          disabled={loading}
          className="flex-[1.5] py-3.5 text-white text-sm font-bold rounded-2xl disabled:opacity-60 shadow-glow tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" />
              <span>Saving…</span>
            </div>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </div>
  );
}
