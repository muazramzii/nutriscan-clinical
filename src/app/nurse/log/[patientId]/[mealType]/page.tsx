"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MealPhotoUploader } from "@/components/nurse/MealPhotoUploader";
import { FoodAnalysisResult } from "@/components/nurse/FoodAnalysisResult";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AnalysisResult } from "@/types";

type FlowState =
  | "loading"
  | "upload-before"
  | "analyzing-before"
  | "confirm-before"
  | "upload-after"
  | "analyzing-after"
  | "confirm-after"
  | "success";

interface PendingMealLogPhoto {
  type: "BEFORE" | "AFTER";
  imageUrl: string;
}

interface PendingMealFoodItem {
  nameEN: string;
  nameBM: string;
  portionG: number;
  kcalTotal: number;
}

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

async function analyzeImage(
  file: File
): Promise<{ analysis: AnalysisResult; imageUrl: string }> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/analyze-food", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return { analysis: data.analysis, imageUrl: data.imageUrl };
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5 mb-4 mt-3 animate-fade-in">
      <div
        className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
          step >= 1
            ? "text-white shadow-glow-sm"
            : "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200"
        }`}
        style={step >= 1 ? { background: "linear-gradient(135deg, #1D9E75, #0E5A42)" } : {}}
      >
        {step > 1 ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          "1"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-tight">Step 1</p>
        <p className="text-[11px] font-semibold text-gray-700 leading-tight">Before</p>
      </div>
      <div className="flex-1 h-0.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: step >= 2 ? "100%" : "0%",
            background: "linear-gradient(90deg, #1D9E75, #0E5A42)",
          }}
        />
      </div>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
          step >= 2
            ? "text-white shadow-glow-sm"
            : "bg-gray-100 text-gray-400 ring-1 ring-inset ring-gray-200"
        }`}
        style={step >= 2 ? { background: "linear-gradient(135deg, #1D9E75, #0E5A42)" } : {}}
      >
        2
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-tight">Step 2</p>
        <p className="text-[11px] font-semibold text-gray-700 leading-tight">After</p>
      </div>
    </div>
  );
}

export default function MealLogFlowPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const mealType = params.mealType as string;

  const [flowState, setFlowState] = useState<FlowState>("loading");
  const [beforeAnalysis, setBeforeAnalysis] = useState<AnalysisResult | null>(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState<string>("");
  const [afterAnalysis, setAfterAnalysis] = useState<AnalysisResult | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string>("");
  const [mealLogId, setMealLogId] = useState<string | null>(null);
  const [nutritionResult, setNutritionResult] = useState<{
    kcalBefore: number;
    kcalAfter: number;
    kcalActual: number;
    percentageEaten: number;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const mealLabel = MEAL_LABELS[mealType] ?? mealType;

  // Recover any pending meal log (e.g. nurse uploaded BEFORE photo, then page reloaded)
  useEffect(() => {
    async function recoverPendingMealLog() {
      try {
        const res = await fetch(
          `/api/meal-logs/check?patientId=${patientId}&mealType=${mealType}`
        );
        if (!res.ok) throw new Error("Failed to check pending meal log");
        const data = await res.json();

        if (data.mealLog) {
          setMealLogId(data.mealLog.id);

          const beforeItems: PendingMealFoodItem[] = data.mealLog.mealFoodItems || [];
          const beforePhoto = data.mealLog.photos?.find(
            (photo: PendingMealLogPhoto) => photo.type === "BEFORE"
          );

          if (beforeItems.length > 0 && beforePhoto) {
            const reconstructedAnalysis: AnalysisResult = {
              items: beforeItems.map((item) => ({
                nameEN: item.nameEN,
                nameBM: item.nameBM,
                portionG: item.portionG,
                kcalTotal: item.kcalTotal,
                carbsG: 0,
                proteinG: 0,
                fatG: 0,
              })),
              totalKcal: beforeItems.reduce(
                (sum, item) => sum + item.kcalTotal,
                0
              ),
              totalCarbs: 0,
              totalProtein: 0,
              totalFat: 0,
              confidence: 0,
            };
            setBeforeAnalysis(reconstructedAnalysis);
            setBeforeImageUrl(beforePhoto.imageUrl);
            setFlowState("upload-after");
          } else {
            setFlowState("upload-before");
          }
        } else {
          setFlowState("upload-before");
        }
      } catch (e) {
        console.error(e);
        setFlowState("upload-before");
      }
    }

    recoverPendingMealLog();
  }, [patientId, mealType]);

  async function handleBeforeSelected(file: File) {
    setFlowState("analyzing-before");
    setError("");
    try {
      const { analysis, imageUrl } = await analyzeImage(file);
      setBeforeAnalysis(analysis);
      setBeforeImageUrl(imageUrl);
      setFlowState("confirm-before");
    } catch {
      setError("Analysis failed. Please retry.");
      setFlowState("upload-before");
    }
  }

  async function handleConfirmBefore(updatedItems?: AnalysisResult["items"]) {
    if (!beforeAnalysis) return;
    setSaving(true);
    setError("");

    const finalAnalysis = updatedItems
      ? {
          ...beforeAnalysis,
          items: updatedItems,
          totalKcal: updatedItems.reduce((sum, item) => sum + item.kcalTotal, 0),
          totalCarbs: updatedItems.reduce((sum, item) => sum + item.carbsG, 0),
          totalProtein: updatedItems.reduce((sum, item) => sum + item.proteinG, 0),
          totalFat: updatedItems.reduce((sum, item) => sum + item.fatG, 0),
        }
      : beforeAnalysis;

    try {
      const res = await fetch("/api/meal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          mealType,
          imageUrl: beforeImageUrl,
          analysisResult: finalAnalysis,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setMealLogId(data.mealLogId);
      setFlowState("upload-after");
    } catch {
      setError("Failed to save. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAfterSelected(file: File) {
    setFlowState("analyzing-after");
    setError("");
    try {
      const { analysis, imageUrl } = await analyzeImage(file);
      setAfterAnalysis(analysis);
      setAfterImageUrl(imageUrl);
      setFlowState("confirm-after");
    } catch {
      setError("Analysis failed. Please retry.");
      setFlowState("upload-after");
    }
  }

  async function handleConfirmAfter(updatedItems?: AnalysisResult["items"]) {
    if (!afterAnalysis || !mealLogId) return;
    setSaving(true);
    setError("");

    const finalAnalysis = updatedItems
      ? {
          ...afterAnalysis,
          items: updatedItems,
          totalKcal: updatedItems.reduce((sum, item) => sum + item.kcalTotal, 0),
          totalCarbs: updatedItems.reduce((sum, item) => sum + item.carbsG, 0),
          totalProtein: updatedItems.reduce((sum, item) => sum + item.proteinG, 0),
          totalFat: updatedItems.reduce((sum, item) => sum + item.fatG, 0),
        }
      : afterAnalysis;

    try {
      const res = await fetch(`/api/meal-logs/${mealLogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: afterImageUrl,
          analysisResult: finalAnalysis,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setNutritionResult({
        kcalBefore: data.nutritionResult.kcalBefore,
        kcalAfter: data.nutritionResult.kcalAfter,
        kcalActual: data.nutritionResult.kcalActual,
        percentageEaten: data.nutritionResult.percentageEaten,
      });
      setFlowState("success");
    } catch {
      setError("Failed to save. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  const step: 1 | 2 =
    flowState === "upload-before" ||
    flowState === "analyzing-before" ||
    flowState === "confirm-before"
      ? 1
      : 2;

  const percentColor = (pct: number) =>
    pct < 25 ? "text-danger-600" : pct < 50 ? "text-warning-600" : "text-primary-700";

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-30 glass border-b border-gray-100">
        <div className="px-4 py-2.5 flex items-center gap-2.5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:text-gray-900 tap-scale shadow-sm"
            aria-label="Back"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-primary leading-tight">
              Meal Log
            </p>
            <p className="font-bold text-gray-900 text-[13px] leading-tight tracking-tight">
              {mealLabel}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pb-6">
        {flowState === "loading" ? (
          <div className="flex flex-col items-center justify-center py-20 gap-5 animate-fade-in">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-glow-sm"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900 tracking-tight">
                Recovering saved meal log…
              </p>
              <p className="text-2xs text-gray-500 mt-1">Checking for pending uploads</p>
            </div>
          </div>
        ) : (
          flowState !== "success" && <StepIndicator step={step} />
        )}

        {flowState !== "loading" && error && (
          <div className="mb-4 flex items-start gap-2 bg-danger-50 border border-danger-100 text-danger-600 text-sm px-4 py-3 rounded-2xl animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* STEP 1 — Before meal */}
        {flowState === "upload-before" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-primary-50 ring-1 ring-inset ring-primary-100 rounded-2xl px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-bold text-primary-800">Capture meal tray</p>
                <p className="text-xs text-primary-700/80 mt-0.5">
                  Take a clear photo BEFORE the patient eats.
                </p>
              </div>
            </div>
            <MealPhotoUploader
              label="Snap meal tray"
              sublabel="Before patient eats"
              onImageSelected={handleBeforeSelected}
            />
          </div>
        )}

        {(flowState === "analyzing-before" || flowState === "analyzing-after") && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse-ring" />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-glow"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 tracking-tight">
                AI is analysing food…
              </p>
              <p className="text-xs text-gray-500 mt-1">This usually takes a few seconds</p>
            </div>
          </div>
        )}

        {flowState === "confirm-before" && beforeAnalysis && (
          <FoodAnalysisResult
            items={beforeAnalysis.items}
            totalKcal={beforeAnalysis.totalKcal}
            totalCarbs={beforeAnalysis.totalCarbs}
            totalProtein={beforeAnalysis.totalProtein}
            totalFat={beforeAnalysis.totalFat}
            onConfirm={handleConfirmBefore}
            onRetake={() => {
              setBeforeAnalysis(null);
              setFlowState("upload-before");
            }}
            confirmLabel="Confirm Before Photo"
            loading={saving}
          />
        )}

        {/* STEP 2 — After meal */}
        {flowState === "upload-after" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-warning-50 ring-1 ring-inset ring-warning-100 rounded-2xl px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-warning text-white flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-bold text-warning-600">Capture leftovers</p>
                <p className="text-xs text-warning-600/80 mt-0.5">
                  Wait for the patient to finish, then photograph leftover food.
                </p>
              </div>
            </div>
            <MealPhotoUploader
              label="Snap leftover food"
              sublabel="After patient eats"
              onImageSelected={handleAfterSelected}
            />
          </div>
        )}

        {flowState === "confirm-after" && afterAnalysis && beforeAnalysis && (
          <div className="space-y-4 animate-fade-in">
            {/* Comparison card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 ring-1 ring-inset ring-primary-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm tracking-tight">Comparison</h3>
                </div>
              </div>
              <div className="px-5 py-3 space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Before</span>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {Math.round(beforeAnalysis.totalKcal)} kcal
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Leftover</span>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {Math.round(afterAnalysis.totalKcal)} kcal
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Actual Eaten</span>
                  <span className="font-black text-lg text-primary tabular-nums">
                    {Math.round(Math.max(0, beforeAnalysis.totalKcal - afterAnalysis.totalKcal))}
                    <span className="text-xs font-bold ml-1">kcal</span>
                  </span>
                </div>
              </div>
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
              >
                <span className="text-2xs font-bold uppercase tracking-widest text-white/70">Intake %</span>
                <span className="text-2xl font-black text-white tabular-nums">
                  {beforeAnalysis.totalKcal > 0
                    ? Math.round(
                        ((beforeAnalysis.totalKcal - afterAnalysis.totalKcal) /
                          beforeAnalysis.totalKcal) *
                          100
                      )
                    : 100}
                  <span className="text-sm font-bold">%</span>
                </span>
              </div>
            </div>

            <FoodAnalysisResult
              items={afterAnalysis.items}
              totalKcal={afterAnalysis.totalKcal}
              totalCarbs={afterAnalysis.totalCarbs}
              totalProtein={afterAnalysis.totalProtein}
              totalFat={afterAnalysis.totalFat}
              onConfirm={handleConfirmAfter}
              onRetake={() => {
                setAfterAnalysis(null);
                setFlowState("upload-after");
              }}
              confirmLabel="Confirm & Log Intake"
              loading={saving}
            />
          </div>
        )}

        {/* SUCCESS */}
        {flowState === "success" && nutritionResult && (
          <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-6 animate-scale-in">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-glow"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm">
                <span className="text-base">🎉</span>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">All done!</h2>
              <p className="text-sm text-gray-500 mt-1">Meal intake has been recorded</p>
            </div>

            <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
              <div className="px-5 pt-4 pb-3">
                <p className="text-2xs font-bold uppercase tracking-widest text-gray-500">Summary</p>
              </div>
              <div className="px-5 pb-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Before</span>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {Math.round(nutritionResult.kcalBefore)} kcal
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leftover</span>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {Math.round(nutritionResult.kcalAfter)} kcal
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Actual Eaten</span>
                  <span className={`font-black tabular-nums ${percentColor(nutritionResult.percentageEaten)}`}>
                    {Math.round(nutritionResult.kcalActual)} kcal
                  </span>
                </div>
              </div>
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
              >
                <span className="text-2xs font-bold uppercase tracking-widest text-white/80">Intake %</span>
                <span className="text-3xl font-black text-white tabular-nums">
                  {Math.round(nutritionResult.percentageEaten)}
                  <span className="text-base font-bold">%</span>
                </span>
              </div>
              {nutritionResult.percentageEaten < 50 && (
                <div
                  className={`px-5 py-3 flex items-center gap-2.5 text-sm font-medium ${
                    nutritionResult.percentageEaten < 25
                      ? "bg-danger-50 text-danger-600"
                      : "bg-warning-50 text-warning-600"
                  }`}
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>
                    {nutritionResult.percentageEaten < 25
                      ? "Critical intake — alert sent to dietitian"
                      : "Low intake — alert sent to dietitian"}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full flex gap-3 pt-1">
              <button
                onClick={() => router.push(`/nurse/log/${patientId}`)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 shadow-card tap-scale transition-all"
              >
                Back to Patient
              </button>
              <button
                onClick={() => router.push("/nurse")}
                className="flex-1 py-3.5 text-white text-sm font-bold rounded-2xl shadow-glow tap-scale transition-all"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                Patient List
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
