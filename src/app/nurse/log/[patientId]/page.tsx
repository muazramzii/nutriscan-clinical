"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DietTypeBadge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DietType, MealStatus } from "@/types";

interface Patient {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  mealLogs: Array<{ mealType: string; status: string }>;
}

const MEALS = [
  { type: "BREAKFAST", label: "Breakfast", icon: "🌅", time: "6:00 - 9:00" },
  { type: "LUNCH", label: "Lunch", icon: "☀️", time: "12:00 - 14:00" },
  { type: "DINNER", label: "Dinner", icon: "🌙", time: "18:00 - 20:00" },
];

function getMealStatus(
  mealLogs: Patient["mealLogs"],
  mealType: string
): MealStatus | null {
  return (mealLogs.find((l) => l.mealType === mealType)?.status as MealStatus) ?? null;
}

export default function PatientLogPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        const found = data.patients.find(
          (p: Patient) => p.id === patientId
        );
        setPatient(found ?? null);
        setLoading(false);
      });
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Patient not found.</p>
        <Link href="/nurse" className="text-primary mt-4 block">
          ← Back
        </Link>
      </div>
    );
  }

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
          <h1 className="font-bold text-gray-900 text-lg">{patient.name}</h1>
          <p className="text-sm text-gray-500">Bed {patient.bedNumber} · Ward {patient.ward}</p>
        </div>
      </div>

      {/* Patient info */}
      <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Diet</p>
          <DietTypeBadge type={patient.dietType} />
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Calorie Target</p>
          <p className="font-semibold text-gray-900">{patient.kcalTarget.toLocaleString()} kcal</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Select Meal
      </h2>

      <div className="space-y-3">
        {MEALS.map((meal) => {
          const status = getMealStatus(patient.mealLogs, meal.type);
          const isComplete = status === "COMPLETE";
          const isPending = status === "PENDING_AFTER";

          return (
            <Link
              key={meal.type}
              href={`/nurse/log/${patientId}/${meal.type}`}
              className={`block bg-white rounded-xl border p-4 transition-colors ${
                isComplete
                  ? "border-primary-100 bg-primary-50"
                  : "border-gray-200 hover:border-primary-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{meal.label}</p>
                    <p className="text-xs text-gray-400">{meal.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                      ✓ Done
                    </span>
                  )}
                  {isPending && (
                    <span className="text-xs bg-warning text-white px-2 py-0.5 rounded-full">
                      ⟳ Pending
                    </span>
                  )}
                  {!status && (
                    <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                      Not Recorded
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
