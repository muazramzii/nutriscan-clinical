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

interface Intervention {
  id: string;
  content: string;
  createdAt: string;
  dietitian: { name: string };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<DashboardPatient | null>(null);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-gray-400">Loading patient…</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-gray-500">Patient not found.</div>
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
    protein: Math.round((patient.kcalTarget * 0.2) / 4),
    fat: Math.round((patient.kcalTarget * 0.25) / 9),
  };

  return (
    <div>
      <DietitianNavbar unreadAlertCount={unreadCount} onBellClick={() => {}} />

      <div className="max-w-5xl mx-auto px-6 py-6 animate-fade-in">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 mb-4 hover:text-gray-900 tap-scale"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Patient header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden mb-6">
          <div
            className="h-24 relative"
            style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
          >
            <div className="absolute -bottom-4 -right-4 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl ring-4 ring-white"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                {getInitials(patient.name)}
              </div>
              <DietTypeBadge type={patient.dietType} />
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{patient.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>Bed {patient.bedNumber}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Ward {patient.ward}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xs font-bold uppercase tracking-widest text-gray-500">
                  Kcal Target
                </p>
                <p className="text-2xl font-black text-gray-900 tabular-nums">
                  {patient.kcalTarget.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Today:{" "}
                  <span className="font-bold text-primary tabular-nums">
                    {patient.todayKcal.toLocaleString()} kcal
                  </span>{" "}
                  ({patient.percentageEaten}%)
                </p>
              </div>
            </div>

            <div className="mt-5">
              <ProgressBar value={patient.percentageEaten} showLabel />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Today's meals */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 text-sm tracking-tight mb-4">
                Today&apos;s Meals
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(MEAL_LABELS).map(([type, label]) => {
                  const mealData = todayMeals[type];
                  const status =
                    patient.mealStatus[type as keyof typeof patient.mealStatus];
                  const isComplete = status === "COMPLETE";
                  return (
                    <div
                      key={type}
                      className={`rounded-2xl p-4 transition-all ${
                        isComplete
                          ? "bg-primary-50 ring-1 ring-inset ring-primary-100"
                          : "bg-gray-50/70 ring-1 ring-inset ring-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-2xs font-bold uppercase tracking-widest text-gray-500">
                          {label}
                        </p>
                        {isComplete && (
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      {mealData ? (
                        <>
                          <p className="text-xl font-black text-gray-900 tabular-nums">
                            {mealData.kcal}
                            <span className="text-2xs font-bold text-gray-400 ml-1">kcal</span>
                          </p>
                          <p className="text-xs text-primary-700 font-semibold mt-0.5">
                            {mealData.pct}% eaten
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1 font-medium">
                          {status === "PENDING_AFTER" ? "Waiting…" : "Not recorded"}
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
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-card"
              style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
            >
              <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
              <h3 className="relative text-sm font-bold mb-3 flex items-center gap-2 tracking-tight">
                <div className="w-7 h-7 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Weekly Insight
              </h3>
              <div className="relative text-sm text-white/95 space-y-2">
                {(() => {
                  const insights = [];
                  const lowKcalDays = patient.weeklyData.filter(
                    (d) => d.kcal < patient.kcalTarget * 0.5
                  ).length;
                  const lowProteinDays = patient.weeklyData.filter(
                    (d) => d.protein < macroTarget.protein * 0.7
                  ).length;

                  if (lowKcalDays >= 3)
                    insights.push(
                      `Patient missed >50% calorie target on ${lowKcalDays} days this week.`
                    );
                  if (lowProteinDays >= 3)
                    insights.push(
                      `Consistent low protein intake detected (${lowProteinDays} days below 70% target).`
                    );
                  if (insights.length === 0)
                    insights.push(
                      "Patient intake trends are stable and meeting majority of clinical targets."
                    );

                  return insights.map((insight, idx) => (
                    <p key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                      {insight}
                    </p>
                  ));
                })()}
              </div>
            </div>

            {/* Nutrition breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="font-bold text-gray-900 text-sm tracking-tight mb-4">
                Nutrition Breakdown
              </h2>
              <div className="space-y-4">
                {[
                  {
                    label: "Calories",
                    unit: "kcal",
                    actual: patient.todayKcal,
                    target: patient.kcalTarget,
                  },
                  {
                    label: "Carbs",
                    unit: "g",
                    actual: patient.todayCarbs,
                    target: macroTarget.carbs,
                  },
                  {
                    label: "Protein",
                    unit: "g",
                    actual: patient.todayProtein,
                    target: macroTarget.protein,
                  },
                  {
                    label: "Fat",
                    unit: "g",
                    actual: patient.todayFat,
                    target: macroTarget.fat,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 font-medium">{item.label}</span>
                      <span className="font-bold text-gray-900 tabular-nums">
                        {item.actual} <span className="text-gray-400 font-medium">/ {item.target}</span>{" "}
                        <span className="text-2xs text-gray-400">{item.unit}</span>
                      </span>
                    </div>
                    <ProgressBar
                      value={
                        item.target > 0 ? (item.actual / item.target) * 100 : 0
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 text-sm tracking-tight mb-3">
                Patient Alerts
              </h3>
              <div className="space-y-2.5">
                {alerts
                  .filter((a) => a.patientId === patientId)
                  .slice(0, 10)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`text-xs rounded-xl p-3 ring-1 ring-inset ${
                        alert.type === "CRITICAL_INTAKE"
                          ? "bg-danger-50 text-danger-600 ring-danger-100"
                          : alert.type === "LOW_INTAKE"
                          ? "bg-warning-50 text-warning-600 ring-warning-100"
                          : "bg-gray-50 text-gray-600 ring-gray-200"
                      }`}
                    >
                      <p className="font-bold mb-1 text-2xs uppercase tracking-widest">
                        {alert.type === "CRITICAL_INTAKE"
                          ? "Critical"
                          : alert.type === "LOW_INTAKE"
                          ? "Low Intake"
                          : "Info"}
                      </p>
                      <p className="leading-relaxed">{alert.message}</p>
                      {!alert.isRead && (
                        <button
                          onClick={() => handleMarkRead(alert.id)}
                          className="mt-2 text-2xs font-semibold underline opacity-80 hover:opacity-100"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                {alerts.filter((a) => a.patientId === patientId).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-2">No alerts.</p>
                )}
              </div>
            </div>

            {/* Intervention Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h3 className="font-bold text-gray-900 text-sm tracking-tight mb-3 flex items-center justify-between">
                Interventions
                <span className="text-2xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {interventions.length} logged
                </span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <textarea
                    value={newIntervention}
                    onChange={(e) => setNewIntervention(e.target.value)}
                    placeholder="Record clinical intervention…"
                    className="w-full text-sm border border-gray-200 rounded-xl p-3 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[80px] resize-none transition-all"
                  />
                  <button
                    onClick={handleAddIntervention}
                    disabled={!newIntervention.trim()}
                    className="w-full py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm tap-scale transition-all"
                    style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                  >
                    Log Intervention
                  </button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {interventions.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-2 border-primary pl-3 py-1.5"
                    >
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-2xs font-bold text-gray-900">
                          {item.dietitian.name}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-2xs text-gray-400 font-medium">
                          {new Date(item.createdAt).toLocaleDateString("en-MY", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 shadow-card tap-scale transition-all"
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
  );
}
