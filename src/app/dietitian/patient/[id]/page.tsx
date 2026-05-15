"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DietitianNavbar } from "@/components/dietitian/DietitianNavbar";
import { IntakeChart } from "@/components/dietitian/IntakeChart";
import { DietTypeBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardPatient, AlertWithPatient } from "@/types";

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<DashboardPatient | null>(null);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/dietitian").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
    ]).then(([dashData, alertsData]) => {
      const found = dashData.patients.find(
        (p: DashboardPatient) => p.id === patientId
      );
      setPatient(found ?? null);
      setAlerts(alertsData.alerts ?? []);
      setUnreadCount(dashData.unreadAlertCount ?? 0);
      setLoading(false);
    });
  }, [patientId]);

  async function handleMarkRead(alertId: string) {
    await fetch(`/api/alerts/${alertId}`, { method: "PATCH" });
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
    setUnreadCount((n) => Math.max(0, n - 1));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-gray-500">
        Patient not found.
      </div>
    );
  }

  const todayMeals: Record<string, { kcal: number; pct: number } | null> = {
    BREAKFAST: null,
    LUNCH: null,
    DINNER: null,
  };

  Object.keys(todayMeals).forEach((m) => {
    const status = patient.mealStatus[m as keyof typeof patient.mealStatus];
    if (status === "COMPLETE") {
      todayMeals[m] = {
        kcal: Math.round(patient.todayKcal / 3),
        pct: Math.round(patient.percentageEaten),
      };
    }
  });

  const macroTarget = {
    carbs: Math.round((patient.kcalTarget * 0.55) / 4),
    protein: Math.round((patient.kcalTarget * 0.20) / 4),
    fat: Math.round((patient.kcalTarget * 0.25) / 9),
  };

  return (
    <div>
      <DietitianNavbar
        unreadAlertCount={unreadCount}
        onBellClick={() => {}}
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 mb-4 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Patient header */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Bed {patient.bedNumber} · Ward {patient.ward}
              </p>
              <div className="mt-2">
                <DietTypeBadge type={patient.dietType} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Kcal Target</p>
              <p className="text-2xl font-bold text-gray-900">
                {patient.kcalTarget.toLocaleString()} kcal
              </p>
              <p className="text-sm text-gray-500">
                Today:{" "}
                <span className="font-semibold text-primary">
                  {patient.todayKcal.toLocaleString()} kcal
                </span>{" "}
                ({patient.percentageEaten}%)
              </p>
            </div>
          </div>

          <div className="mt-4">
            <ProgressBar value={patient.percentageEaten} showLabel />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Today's meals */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Today&apos;s Meals
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(MEAL_LABELS).map(([type, label]) => {
                  const mealData = todayMeals[type];
                  const status = patient.mealStatus[type as keyof typeof patient.mealStatus];
                  return (
                    <div
                      key={type}
                      className={`rounded-lg border p-3 ${
                        status === "COMPLETE"
                          ? "border-primary-100 bg-primary-50"
                          : "border-gray-200"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-500">{label}</p>
                      {mealData ? (
                        <>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {mealData.kcal} kcal
                          </p>
                          <p className="text-xs text-primary">{mealData.pct}% eaten</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">
                          {status === "PENDING_AFTER" ? "Waiting..." : "Not recorded"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7-day chart */}
            <IntakeChart data={patient.weeklyData} kcalTarget={patient.kcalTarget} />

            {/* Nutrition breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Nutrition Breakdown
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Calories", unit: "kcal", actual: patient.todayKcal, target: patient.kcalTarget },
                  { label: "Carbs", unit: "g", actual: Math.round(patient.todayKcal * 0.55 / 4), target: macroTarget.carbs },
                  { label: "Protein", unit: "g", actual: Math.round(patient.todayKcal * 0.2 / 4), target: macroTarget.protein },
                  { label: "Fat", unit: "g", actual: Math.round(patient.todayKcal * 0.25 / 9), target: macroTarget.fat },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">
                        {item.actual} / {item.target} {item.unit}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.target > 0 ? (item.actual / item.target) * 100 : 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Patient Alerts
              </h3>
              <div className="space-y-3">
                {alerts
                  .filter((a) => a.patientId === patientId)
                  .slice(0, 10)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`text-xs rounded-lg p-3 ${
                        alert.type === "CRITICAL_INTAKE"
                          ? "bg-danger-50 text-danger"
                          : alert.type === "LOW_INTAKE"
                          ? "bg-warning-50 text-warning"
                          : "bg-gray-50 text-gray-600"
                      }`}
                    >
                      <p className="font-semibold mb-1">
                        {alert.type === "CRITICAL_INTAKE"
                          ? "⚠️ CRITICAL"
                          : alert.type === "LOW_INTAKE"
                          ? "⚠ Low Intake"
                          : "ℹ Info"}
                      </p>
                      <p>{alert.message}</p>
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="mt-2 text-xs underline opacity-70"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                {alerts.filter((a) => a.patientId === patientId).length === 0 && (
                  <p className="text-sm text-gray-400">No alerts.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
