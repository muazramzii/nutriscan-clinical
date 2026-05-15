"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { PatientCard } from "@/components/nurse/PatientCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PatientWithMealStatus } from "@/types";

export default function NursePage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<PatientWithMealStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        const mapped = data.patients.map(
          (p: {
            id: string;
            name: string;
            bedNumber: string;
            ward: string;
            dietType: string;
            kcalTarget: number;
            isActive: boolean;
            mealLogs: Array<{ mealType: string; status: string }>;
          }) => ({
            ...p,
            mealStatus: {
              BREAKFAST:
                p.mealLogs.find((l) => l.mealType === "BREAKFAST")?.status ??
                null,
              LUNCH:
                p.mealLogs.find((l) => l.mealType === "LUNCH")?.status ?? null,
              DINNER:
                p.mealLogs.find((l) => l.mealType === "DINNER")?.status ?? null,
            },
          })
        );
        setPatients(mapped);
        setLoading(false);
      });
  }, []);

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="px-4 pb-8">
      {/* Header */}
      <div className="pt-6 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">NutriScan</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{today}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 border border-gray-200 px-3 py-1.5 rounded-lg"
        >
          Sign Out
        </button>
      </div>

      {/* Ward info */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-primary font-medium">NURSE</p>
        <p className="font-semibold text-gray-900">{session?.user?.name}</p>
        <p className="text-sm text-gray-600">
          Ward {session?.user?.ward} · {patients.length} patients
        </p>
      </div>

      {/* Patient list */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Patient List
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No patients found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((p) => (
            <PatientCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
