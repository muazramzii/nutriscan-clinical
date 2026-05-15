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
  const [interventions, setInterventions] = useState<any[]>([]);
  const [newIntervention, setNewIntervention] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/dietitian").then((r) => r.json()),
      fetch("/api/alerts").then((r) => r.json()),
      fetch(`/api/patients/${patientId}/interventions`).then((r) => r.json()),
    ]).then(([dashData, alertsData, interData]) => {
      const found = dashData.patients.find(
        (p: DashboardPatient) => p.id === patientId
      );
      setPatient(found ?? null);
      setAlerts(alertsData.alerts ?? []);
      setInterventions(interData.interventions ?? []);
      setUnreadCount(dashData.unreadAlertCount ?? 0);
      setLoading(false);
    });
  }, [patientId]);

  async function handleAddIntervention() {
    if (!newIntervention.trim()) return;
    const res = await fetch(`/api/patients/${patientId}/interventions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newIntervention }),
    });
    if (res.ok) {
      const { intervention } = await res.json();
      setInterventions([intervention, ...interventions]);
      setNewIntervention("");
    }
  }

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

            {/* Weekly Macro Trends Analysis */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
              <h3 className="text-sm font-bold text-primary-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Weekly Insight
              </h3>
              <div className="text-sm text-primary-800 space-y-2">
                {(() => {
                  const insights = [];
                  const lowKcalDays = patient.weeklyData.filter(d => d.kcal < patient.kcalTarget * 0.5).length;
                  const lowProteinDays = patient.weeklyData.filter(d => d.protein < macroTarget.protein * 0.7).length;
                  
                  if (lowKcalDays >= 3) insights.push(`Patient missed >50% calorie target on ${lowKcalDays} days this week.`);
                  if (lowProteinDays >= 3) insights.push(`Consistent low protein intake detected (${lowProteinDays} days below 70% target).`);
                  if (insights.length === 0) insights.push("Patient intake trends are stable and meeting majority of clinical targets.");
                  
                  return insights.map((insight, idx) => (
                    <p key={idx} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {insight}
                    </p>
                  ));
                })()}
              </div>
            </div>

            {/* Nutrition breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Nutrition Breakdown
              </h2>
              <div className="space-y-4">
                {[
                  { label: "Calories", unit: "kcal", actual: patient.todayKcal, target: patient.kcalTarget },
                  { label: "Carbs", unit: "g", actual: patient.todayCarbs, target: macroTarget.carbs },
                  { label: "Protein", unit: "g", actual: patient.todayProtein, target: macroTarget.protein },
                  { label: "Fat", unit: "g", actual: patient.todayFat, target: macroTarget.fat },
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

            {/* Intervention Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                Interventions
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {interventions.length} logged
                </span>
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    value={newIntervention}
                    onChange={(e) => setNewIntervention(e.target.value)}
                    placeholder="Record clinical intervention..."
                    className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
                  />
                  <button
                    onClick={handleAddIntervention}
                    disabled={!newIntervention.trim()}
                    className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                  >
                    Log Intervention
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {interventions.map((item) => (
                    <div key={item.id} className="border-l-2 border-primary-200 pl-3 py-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{item.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-900">{item.dietitian.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString("en-MY", { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <button 
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Export Clinical Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
