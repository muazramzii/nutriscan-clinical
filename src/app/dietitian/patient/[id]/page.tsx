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
  const [savingIntervention, setSavingIntervention] = useState(false);
  const [interventionError, setInterventionError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function safeJson(res: Response, fallback: unknown) {
      try { return res.ok ? await res.json() : fallback; }
      catch { return fallback; }
    }

    async function load() {
      try {
        const [dashRes, alertsRes, interRes] = await Promise.all([
          fetch("/api/dashboard/dietitian"),
          fetch("/api/alerts"),
          fetch(`/api/patients/${patientId}/interventions`),
        ]);

        const [dashData, alertsData, interData] = await Promise.all([
          safeJson(dashRes, { patients: [], unreadAlertCount: 0 }),
          safeJson(alertsRes, { alerts: [] }),
          safeJson(interRes, { interventions: [] }),
        ]);

        const found = (dashData as { patients?: DashboardPatient[] }).patients?.find(
          (p) => p.id === patientId
        );
        setPatient(found ?? null);
        setAlerts((alertsData as { alerts?: AlertWithPatient[] }).alerts ?? []);
        setInterventions((interData as { interventions?: Intervention[] }).interventions ?? []);
        setUnreadCount((dashData as { unreadAlertCount?: number }).unreadAlertCount ?? 0);
      } catch (err) {
        console.error("Patient detail load error:", err);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [patientId]);

  async function handleAddIntervention() {
    if (!newIntervention.trim()) return;
    setSavingIntervention(true);
    setInterventionError("");
    try {
      const res = await fetch(`/api/patients/${patientId}/interventions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newIntervention }),
      });
      if (res.ok) {
        const { intervention } = await res.json();
        setInterventions((prev) => [intervention, ...prev]);
        setNewIntervention("");
      } else {
        const err = await res.json().catch(() => ({}));
        setInterventionError(err.error ?? "Failed to save. Please try again.");
      }
    } catch {
      setInterventionError("Network error. Please try again.");
    } finally {
      setSavingIntervention(false);
    }
  }

  async function handleExportPDF() {
    if (!patient) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const dateStr = new Date().toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      const DIET_LABELS: Record<string, string> = { DIABETIC: "Diabetic", LOW_SODIUM: "Low Sodium", POST_SURGERY: "Post Surgery", RENAL: "Renal", REGULAR: "Regular" };
      const green: [number, number, number] = [29, 158, 117];

      // ── Header bar ──
      doc.setFillColor(...green);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("NutriScan Clinical — Patient Summary", 14, 10);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${dateStr}`, 14, 16);

      // ── Patient info block ──
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(patient.name, 14, 32);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`Bed ${patient.bedNumber}  ·  Ward ${patient.ward}  ·  ${DIET_LABELS[patient.dietType] ?? patient.dietType}`, 14, 38);
      doc.setTextColor(0);

      // Right-side kcal box
      doc.setFillColor(245, 250, 246);
      doc.roundedRect(pageW - 70, 26, 56, 18, 3, 3, "F");
      doc.setFontSize(8);
      doc.setTextColor(80);
      doc.text("KCAL TARGET", pageW - 67, 32);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...green);
      doc.text(`${patient.kcalTarget.toLocaleString()}`, pageW - 67, 40);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`Today: ${patient.todayKcal} kcal (${patient.percentageEaten}%)`, pageW - 67, 46);

      // ── Section: Today's Meals ──
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Today's Meals", 14, 56);
      const MEALS = ["BREAKFAST", "LUNCH", "DINNER"] as const;
      autoTable(doc, {
        startY: 59,
        head: [["Meal", "Status", "Kcal"]],
        body: MEALS.map((m) => {
          const status = patient.mealStatus[m] ?? null;
          const kcal = status === "COMPLETE" ? `${Math.round(patient.todayKcal / 3)} kcal` : "—";
          const label = m.charAt(0) + m.slice(1).toLowerCase();
          return [label, status === "COMPLETE" ? "Complete" : status === "PENDING_AFTER" ? "In progress" : "Not recorded", kcal];
        }),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 250, 246] },
        margin: { left: 14, right: 14 },
      });

      // ── Section: Nutrition Breakdown ──
      const afterMeals = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("Nutrition Breakdown", 14, afterMeals);
      const macroTarget = {
        carbs: Math.round((patient.kcalTarget * 0.55) / 4),
        protein: Math.round((patient.kcalTarget * 0.2) / 4),
        fat: Math.round((patient.kcalTarget * 0.25) / 9),
      };
      autoTable(doc, {
        startY: afterMeals + 3,
        head: [["Nutrient", "Actual", "Target", "% of Target"]],
        body: [
          ["Calories (kcal)", patient.todayKcal, patient.kcalTarget, `${patient.percentageEaten}%`],
          ["Carbohydrates (g)", patient.todayCarbs, macroTarget.carbs, patient.todayCarbs > 0 ? `${Math.round((patient.todayCarbs / macroTarget.carbs) * 100)}%` : "—"],
          ["Protein (g)", patient.todayProtein, macroTarget.protein, patient.todayProtein > 0 ? `${Math.round((patient.todayProtein / macroTarget.protein) * 100)}%` : "—"],
          ["Fat (g)", patient.todayFat, macroTarget.fat, patient.todayFat > 0 ? `${Math.round((patient.todayFat / macroTarget.fat) * 100)}%` : "—"],
        ],
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 250, 246] },
        margin: { left: 14, right: 14 },
      });

      // ── Section: 7-Day Trend ──
      const afterNutrition = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text("7-Day Intake Trend", 14, afterNutrition);
      autoTable(doc, {
        startY: afterNutrition + 3,
        head: [["Day", "Calories (kcal)", "Carbs (g)", "Protein (g)", "Fat (g)"]],
        body: patient.weeklyData.map((d) => [d.date, d.kcal, d.carbs, d.protein, d.fat]),
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 250, 246] },
        margin: { left: 14, right: 14 },
      });

      // ── Section: Alerts ──
      const patientAlerts = alerts.filter((a) => a.patientId === patientId);
      if (patientAlerts.length > 0) {
        const afterTrend = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Alerts", 14, afterTrend);
        autoTable(doc, {
          startY: afterTrend + 3,
          head: [["Type", "Message", "Status"]],
          body: patientAlerts.map((a) => [
            a.type === "CRITICAL_INTAKE" ? "Critical" : a.type === "LOW_INTAKE" ? "Low Intake" : "Info",
            a.message,
            a.isRead ? "Read" : "Unread",
          ]),
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
          headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [254, 242, 242] },
          columnStyles: { 1: { cellWidth: 110 } },
          margin: { left: 14, right: 14 },
        });
      }

      // ── Section: Interventions ──
      if (interventions.length > 0) {
        const afterAlerts = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text("Intervention Notes", 14, afterAlerts);
        autoTable(doc, {
          startY: afterAlerts + 3,
          head: [["Date", "Dietitian", "Note"]],
          body: interventions.map((i) => [
            new Date(i.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }),
            i.dietitian.name,
            i.content,
          ]),
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
          headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 250, 246] },
          columnStyles: { 2: { cellWidth: 110 } },
          margin: { left: 14, right: 14 },
        });
      }

      // ── Footer ──
      const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(160);
        doc.setFont("helvetica", "normal");
        doc.text(`NutriScan Clinical — Confidential`, 14, 290);
        doc.text(`Page ${i} of ${pageCount}`, pageW - 14, 290, { align: "right" });
      }

      doc.save(`clinical-summary-${patient.name.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteIntervention(interventionId: string) {
    const res = await fetch(`/api/patients/${patientId}/interventions/${interventionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setInterventions((prev) => prev.filter((i) => i.id !== interventionId));
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

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-sm font-semibold text-red-500">Failed to load patient data.</p>
        <button onClick={() => router.back()} className="text-xs text-primary underline">
          Go back
        </button>
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
                  {interventionError && (
                    <p className="text-xs text-red-500 font-medium">{interventionError}</p>
                  )}
                  <button
                    onClick={handleAddIntervention}
                    disabled={!newIntervention.trim() || savingIntervention}
                    className="w-full py-2.5 text-white text-xs font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm tap-scale transition-all"
                    style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                  >
                    {savingIntervention ? "Saving…" : "Log Intervention"}
                  </button>
                </div>

                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {interventions.map((item) => (
                    <div
                      key={item.id}
                      className="group border-l-2 border-primary pl-3 py-1.5"
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
                        <button
                          onClick={() => handleDeleteIntervention(item.id)}
                          className="ml-auto opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 text-white text-sm font-bold rounded-2xl shadow-glow-sm tap-scale disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              {exporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating PDF…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Clinical Summary
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
