"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MealPhotoUploader } from "@/components/nurse/MealPhotoUploader";
import { FoodAnalysisResult } from "@/components/nurse/FoodAnalysisResult";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AnalysisResult } from "@/types";

type FlowState =
  | "upload-before"
  | "analyzing-before"
  | "confirm-before"
  | "upload-after"
  | "analyzing-after"
  | "confirm-after"
  | "success";

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
    <div className="flex items-center gap-2 mb-6">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        1
      </div>
      <div className="text-xs text-gray-400 font-medium">Before Meal</div>
      <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
        }`}
      >
        2
      </div>
      <div className="text-xs text-gray-400 font-medium">After Meal</div>
    </div>
  );
}

export default function MealLogFlowPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  const mealType = params.mealType as string;

  const [flowState, setFlowState] = useState<FlowState>("upload-before");
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

  return (
    <div className="px-4 pb-8">
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-gray-900">{mealLabel}</h1>
          <p className="text-xs text-gray-400">Meal Log</p>
        </div>
      </div>

      {flowState !== "success" && <StepIndicator step={step} />}

      {error && (
        <div className="mb-4 bg-danger-50 border border-danger-100 text-danger text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* STEP 1 — Before meal */}
      {flowState === "upload-before" && (
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-xl px-4 py-3 text-sm text-primary font-medium">
            Step 1: Snap meal tray BEFORE patient eats.
          </div>
          <MealPhotoUploader
            label="Snap meal tray"
            sublabel="Before patient eats"
            onImageSelected={handleBeforeSelected}
          />
        </div>
      )}

      {flowState === "analyzing-before" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600 font-medium">
            AI is analysing food...
          </p>
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
        <div className="space-y-4">
          <div className="bg-warning-50 border border-warning-100 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-gray-800">
              ⏳ Wait for patient to finish eating...
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Then snap the leftover food.
            </p>
          </div>
          <MealPhotoUploader
            label="Snap leftover food"
            sublabel="After patient eats"
            onImageSelected={handleAfterSelected}
          />
        </div>
      )}

      {flowState === "analyzing-after" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-600 font-medium">
            AI is analysing leftover food...
          </p>
        </div>
      )}

      {flowState === "confirm-after" && afterAnalysis && beforeAnalysis && (
        <div className="space-y-4">
          {/* Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Comparison
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Before</span>
                <span className="font-medium">{Math.round(beforeAnalysis.totalKcal)} kcal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Leftover</span>
                <span className="font-medium">{Math.round(afterAnalysis.totalKcal)} kcal</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-1">
                <span className="font-semibold text-gray-900">Actual Eaten</span>
                <span className="font-bold text-primary text-base">
                  {Math.round(Math.max(0, beforeAnalysis.totalKcal - afterAnalysis.totalKcal))} kcal
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Percentage</span>
                <span
                  className={`font-bold ${
                    beforeAnalysis.totalKcal > 0
                      ? ((beforeAnalysis.totalKcal - afterAnalysis.totalKcal) / beforeAnalysis.totalKcal) * 100 < 25
                        ? "text-danger"
                        : ((beforeAnalysis.totalKcal - afterAnalysis.totalKcal) / beforeAnalysis.totalKcal) * 100 < 50
                        ? "text-warning"
                        : "text-primary"
                      : "text-gray-900"
                  }`}
                >
                  {beforeAnalysis.totalKcal > 0
                    ? Math.round(
                        ((beforeAnalysis.totalKcal - afterAnalysis.totalKcal) /
                          beforeAnalysis.totalKcal) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
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
            confirmLabel="Confirm & Log Actual Intake"
            loading={saving}
          />
        </div>
      )}

      {/* SUCCESS */}
      {flowState === "success" && nutritionResult && (
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Success!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Meal intake has been saved.
            </p>
          </div>

          <div className="w-full bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Before</span>
                <span>{Math.round(nutritionResult.kcalBefore)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Leftover</span>
                <span>{Math.round(nutritionResult.kcalAfter)} kcal</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Actual Eaten</span>
                <span className="text-primary">
                  {Math.round(nutritionResult.kcalActual)} kcal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Percentage</span>
                <span
                  className={
                    nutritionResult.percentageEaten < 25
                      ? "text-danger font-bold"
                      : nutritionResult.percentageEaten < 50
                      ? "text-warning font-bold"
                      : "text-primary font-bold"
                  }
                >
                  {Math.round(nutritionResult.percentageEaten)}%
                </span>
              </div>
            </div>
            {nutritionResult.percentageEaten < 50 && (
              <div
                className={`rounded-lg px-3 py-2 text-xs ${
                  nutritionResult.percentageEaten < 25
                    ? "bg-danger-50 text-danger"
                    : "bg-warning-50 text-warning"
                }`}
              >
                {nutritionResult.percentageEaten < 25
                  ? "⚠️ CRITICAL: Alert sent to dietitian!"
                  : "⚠️ Low intake: Alert sent to dietitian!"}
              </div>
            )}
          </div>

          <div className="w-full flex gap-3">
            <button
              onClick={() => router.push(`/nurse/log/${patientId}`)}
              className="flex-1 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl"
            >
              Back to Patient
            </button>
            <button
              onClick={() => router.push("/nurse")}
              className="flex-1 py-3 bg-primary text-white text-sm font-semibold rounded-xl"
            >
              Patient List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
