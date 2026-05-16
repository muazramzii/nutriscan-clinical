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
  {
    type: "BREAKFAST",
    label: "Breakfast",
    time: "06:00 — 09:00",
    description: "Morning meal log",
    gradient: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    type: "LUNCH",
    label: "Lunch",
    time: "12:00 — 14:00",
    description: "Midday meal log",
    gradient: "linear-gradient(135deg, #FBBF24 0%, #EA580C 100%)",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeWidth={1.8} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
  },
  {
    type: "DINNER",
    label: "Dinner",
    time: "18:00 — 20:00",
    description: "Evening meal log",
    gradient: "linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  },
];

function getMealStatus(
  mealLogs: Patient["mealLogs"],
  mealType: string
): MealStatus | null {
  return (mealLogs.find((l) => l.mealType === mealType)?.status as MealStatus) ?? null;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function PatientLogPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${patientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setPatient(data?.patient ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-gray-400">Loading patient…</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="px-4 pt-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-600">Patient not found</p>
        <Link
          href="/nurse"
          className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-4"
        >
          ← Back to patient list
        </Link>
      </div>
    );
  }

  const completed = patient.mealLogs.filter((l) => l.status === "COMPLETE").length;

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
            <p className="text-[9px] font-semibold uppercase tracking-widest text-primary">Patient</p>
            <p className="font-bold text-gray-900 text-[13px] leading-tight truncate">
              {patient.name}
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pb-6 animate-fade-in">
        {/* Patient hero card */}
        <div className="mt-3 mb-4 bg-white rounded-2xl shadow-card overflow-hidden">
          <div
            className="h-14 relative"
            style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
          >
            <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="px-4 pb-4 -mt-7 relative">
            <div className="flex items-end justify-between mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ring-[3px] ring-white"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                {getInitials(patient.name)}
              </div>
              <DietTypeBadge type={patient.dietType} />
            </div>
            <h1 className="font-bold text-gray-900 text-[15px] tracking-tight">{patient.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
              <span>Bed {patient.bedNumber}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Ward {patient.ward}</span>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Kcal Target</p>
                <p className="font-bold text-gray-900 mt-0.5 tabular-nums text-[13px]">
                  {patient.kcalTarget.toLocaleString()}
                </p>
              </div>
              <div className="bg-primary-50 rounded-lg px-2.5 py-1.5">
                <p className="text-[9px] uppercase tracking-widest text-primary-700 font-semibold">Today</p>
                <p className="font-bold text-primary-700 mt-0.5 tabular-nums text-[13px]">
                  {completed}<span className="text-[10px] font-medium text-primary/60">/3 meals</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Meal list */}
        <h2 className="text-[13px] font-bold text-gray-900 tracking-tight mb-2 px-1">Select a meal</h2>

        <div className="space-y-2">
          {MEALS.map((meal) => {
            const status = getMealStatus(patient.mealLogs, meal.type);
            const isComplete = status === "COMPLETE";
            const isPending = status === "PENDING_AFTER";

            return (
              <Link
                key={meal.type}
                href={`/nurse/log/${patientId}/${meal.type}`}
                className="group block bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-primary/30 tap-scale transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                    style={{ background: meal.gradient }}
                  >
                    <span className="scale-75">{meal.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-gray-900 text-[13px] tracking-tight">{meal.label}</p>
                      {isComplete && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-1 py-0.5 rounded-full">
                          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Done
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-warning-600 bg-warning-50 ring-1 ring-inset ring-warning-100 px-1 py-0.5 rounded-full">
                          <svg className="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <circle cx="12" cy="12" r="9" strokeWidth={2.5} />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{meal.time}</p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
