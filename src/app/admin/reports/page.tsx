"use client";

import { useEffect, useState } from "react";
import { DashboardPatient, AlertWithPatient } from "@/types";

type ReportType = "patient_intake" | "alerts_summary" | "ward_overview";

const REPORT_TYPES: {
  value: ReportType;
  label: string;
  desc: string;
  gradient: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "patient_intake",
    label: "Patient Daily Intake",
    desc: "Today's calorie intake per patient",
    gradient: "linear-gradient(135deg, #1D9E75, #0E5A42)",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    value: "alerts_summary",
    label: "Alerts Summary",
    desc: "Low intake and critical alerts",
    gradient: "linear-gradient(135deg, #E24B4A, #C73B3A)",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    value: "ward_overview",
    label: "Ward Overview",
    desc: "Aggregated stats grouped by ward",
    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

const INTAKE_COLS = [
  { key: "name", label: "Patient Name", always: true },
  { key: "bed", label: "Bed No." },
  { key: "ward", label: "Ward" },
  { key: "diet", label: "Diet Type" },
  { key: "target", label: "Target (kcal)" },
  { key: "actual", label: "Actual (kcal)" },
  { key: "pct", label: "% Eaten" },
  { key: "status", label: "Status" },
  { key: "alerts", label: "Alerts" },
];

const ALERT_COLS = [
  { key: "patient", label: "Patient", always: true },
  { key: "bed", label: "Bed No." },
  { key: "ward", label: "Ward" },
  { key: "type", label: "Alert Type" },
  { key: "message", label: "Message" },
  { key: "time", label: "Time" },
  { key: "read", label: "Status" },
];

const WARD_COLS = [
  { key: "ward", label: "Ward", always: true },
  { key: "patients", label: "Patients" },
  { key: "meals", label: "Meals Logged" },
  { key: "avgPct", label: "Avg % Eaten" },
  { key: "alerts", label: "Active Alerts" },
];

const DIET_LABELS: Record<string, string> = {
  DIABETIC: "Diabetic",
  LOW_SODIUM: "Low Sodium",
  POST_SURGERY: "Post Surgery",
  RENAL: "Renal",
  REGULAR: "Regular",
};

function formatAlertType(t: string) {
  if (t === "CRITICAL_INTAKE") return "Critical";
  if (t === "LOW_INTAKE") return "Low Intake";
  return "Missed Meal";
}

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface WardRow {
  ward: string;
  patients: number;
  meals: number;
  avgPct: number;
  alerts: number;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("patient_intake");
  const [wardFilter, setWardFilter] = useState("all");
  const [activeCols, setActiveCols] = useState<Set<string>>(
    new Set(INTAKE_COLS.map((c) => c.key))
  );
  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  function fetchData() {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? []);
        setAlerts(data.alerts ?? []);
        setLoading(false);
      });
  }

  useEffect(() => { fetchData(); }, []);

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    setDeleting(true);

    if (reportType === "alerts_summary") {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/alerts/${id}`, { method: "DELETE" })
        )
      );
    } else if (reportType === "patient_intake") {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`/api/admin/patients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      );
    } else if (reportType === "ward_overview") {
      const wardPatientIds = patients
        .filter((p) => selected.has(p.ward))
        .map((p) => p.id);
      await Promise.all(
        wardPatientIds.map((id) =>
          fetch(`/api/admin/patients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false }),
          })
        )
      );
    }

    setSelected(new Set());
    setDeleting(false);
    fetchData();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSelectAll() {
    const allIds =
      reportType === "alerts_summary"
        ? filteredAlerts.map((a) => a.id)
        : reportType === "patient_intake"
        ? filteredPatients.map((p) => p.id)
        : wardRows.map((w) => w.ward);
    if (selected.size === allIds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  useEffect(() => {
    const cols =
      reportType === "patient_intake"
        ? INTAKE_COLS
        : reportType === "alerts_summary"
        ? ALERT_COLS
        : WARD_COLS;
    setActiveCols(new Set(cols.map((c) => c.key)));
    setWardFilter("all");
    setSelected(new Set());
  }, [reportType]);

  const wards = ["all", ...Array.from(new Set(patients.map((p) => p.ward))).sort()];

  const filteredPatients =
    wardFilter === "all" ? patients : patients.filter((p) => p.ward === wardFilter);

  const filteredAlerts =
    wardFilter === "all" ? alerts : alerts.filter((a) => a.patient.ward === wardFilter);

  const wardRows: WardRow[] = Array.from(new Set(patients.map((p) => p.ward)))
    .sort()
    .filter((w) => wardFilter === "all" || w === wardFilter)
    .map((ward) => {
      const wPatients = patients.filter((p) => p.ward === ward);
      const meals = wPatients.filter(
        (p) =>
          p.mealStatus.BREAKFAST === "COMPLETE" ||
          p.mealStatus.LUNCH === "COMPLETE" ||
          p.mealStatus.DINNER === "COMPLETE"
      ).length;
      const avgPct = wPatients.length
        ? Math.round(
            wPatients.reduce((s, p) => s + p.percentageEaten, 0) / wPatients.length
          )
        : 0;
      const activeAlerts = alerts.filter(
        (a) => a.patient.ward === ward && !a.isRead
      ).length;
      return {
        ward,
        patients: wPatients.length,
        meals,
        avgPct,
        alerts: activeAlerts,
      };
    });

  const cols =
    reportType === "patient_intake"
      ? INTAKE_COLS
      : reportType === "alerts_summary"
      ? ALERT_COLS
      : WARD_COLS;

  function toggleCol(key: string) {
    setActiveCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");

      const doc = new jsPDF({ orientation: "landscape" });
      const reportLabel = REPORT_TYPES.find((r) => r.value === reportType)!.label;
      const dateStr = new Date().toLocaleDateString("en-MY", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(reportLabel, 14, 18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(`Generated: ${dateStr}`, 14, 25);
      if (wardFilter !== "all") doc.text(`Ward: ${wardFilter}`, 14, 31);
      doc.setTextColor(0);

      const startY = wardFilter !== "all" ? 37 : 32;

      if (reportType === "patient_intake") {
        const head = INTAKE_COLS.filter((c) => activeCols.has(c.key)).map((c) => c.label);
        const body = filteredPatients.map((p) => {
          const row: string[] = [];
          if (activeCols.has("name")) row.push(p.name);
          if (activeCols.has("bed")) row.push(p.bedNumber);
          if (activeCols.has("ward")) row.push(p.ward);
          if (activeCols.has("diet")) row.push(DIET_LABELS[p.dietType] ?? p.dietType);
          if (activeCols.has("target")) row.push(`${p.kcalTarget.toLocaleString()}`);
          if (activeCols.has("actual")) row.push(`${Math.round(p.todayKcal).toLocaleString()}`);
          if (activeCols.has("pct")) row.push(`${Math.round(p.percentageEaten)}%`);
          if (activeCols.has("status")) row.push(p.statusLabel);
          if (activeCols.has("alerts")) row.push(p.alertCount > 0 ? `⚠ ${p.alertCount}` : "—");
          return row;
        });
        autoTable(doc, {
          head: [head],
          body,
          startY,
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [245, 250, 246] },
          didParseCell: (data) => {
            if (data.section === "body") {
              const cell = data.cell.raw as string;
              if (cell === "Critical") data.cell.styles.textColor = [220, 38, 38];
              else if (cell === "Low intake") data.cell.styles.textColor = [217, 119, 6];
              else if (cell === "On track") data.cell.styles.textColor = [22, 163, 74];
            }
          },
        });
      } else if (reportType === "alerts_summary") {
        const head = ALERT_COLS.filter((c) => activeCols.has(c.key)).map((c) => c.label);
        const body = filteredAlerts.map((a) => {
          const row: string[] = [];
          if (activeCols.has("patient")) row.push(a.patient.name);
          if (activeCols.has("bed")) row.push(a.patient.bedNumber);
          if (activeCols.has("ward")) row.push(a.patient.ward);
          if (activeCols.has("type")) row.push(formatAlertType(a.type));
          if (activeCols.has("message")) row.push(a.message);
          if (activeCols.has("time")) row.push(timeAgo(a.createdAt));
          if (activeCols.has("read")) row.push(a.isRead ? "Read" : "Unread");
          return row;
        });
        autoTable(doc, {
          head: [head],
          body,
          startY,
          styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
          headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [254, 242, 242] },
          columnStyles: { 4: { cellWidth: 80 } },
        });
      } else {
        const head = WARD_COLS.filter((c) => activeCols.has(c.key)).map((c) => c.label);
        const body = wardRows.map((w) => {
          const row: string[] = [];
          if (activeCols.has("ward")) row.push(`Ward ${w.ward}`);
          if (activeCols.has("patients")) row.push(String(w.patients));
          if (activeCols.has("meals")) row.push(String(w.meals));
          if (activeCols.has("avgPct")) row.push(`${w.avgPct}%`);
          if (activeCols.has("alerts")) row.push(w.alerts > 0 ? `⚠ ${w.alerts}` : "—");
          return row;
        });
        autoTable(doc, {
          head: [head],
          body,
          startY,
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [239, 246, 255] },
        });
      }

      const filename = `nutriscan-${reportType.replace("_", "-")}-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate and export clinical PDF reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ── Config panel ── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Report type */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <p className="text-2xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Report Type
            </p>
            <div className="space-y-2">
              {REPORT_TYPES.map((r) => {
                const active = reportType === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => setReportType(r.value)}
                    className={`w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl border transition-all ${
                      active
                        ? "border-primary bg-primary-50/60 ring-1 ring-inset ring-primary-100"
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0`}
                      style={{ background: r.gradient }}
                    >
                      {r.icon}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold leading-tight tracking-tight ${active ? "text-primary-800" : "text-gray-900"}`}>
                        {r.label}
                      </p>
                      <p className="text-2xs text-gray-500 leading-tight mt-1">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ward filter */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <p className="text-2xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Filter by Ward
            </p>
            <div className="space-y-1">
              {wards.map((w) => (
                <button
                  key={w}
                  onClick={() => setWardFilter(w)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    wardFilter === w
                      ? "bg-primary-50 text-primary-700 font-bold ring-1 ring-inset ring-primary-100"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {w === "all" ? "All Wards" : `Ward ${w}`}
                </button>
              ))}
            </div>
          </div>

          {/* Column toggles */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
            <p className="text-2xs font-bold text-gray-500 uppercase tracking-widest mb-3">
              Columns
            </p>
            <div className="space-y-1.5">
              {cols.map((c) => (
                <label
                  key={c.key}
                  className={`flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-lg transition-colors ${
                    c.always ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={activeCols.has(c.key)}
                    disabled={c.always}
                    onChange={() => !c.always && toggleCol(c.key)}
                    className="rounded border-gray-300 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-gray-700 font-medium">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="w-full py-3 text-white text-sm font-bold rounded-2xl shadow-glow tap-scale disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
          >
            {exporting ? (
              <>
                <span className="w-4 h-4 border-[2.5px] border-white/40 border-t-white rounded-full animate-spin" />
                Generating PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                Export PDF
              </>
            )}
          </button>
        </div>

        {/* ── Preview panel ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-bold text-gray-900 text-sm tracking-tight">
                  {REPORT_TYPES.find((r) => r.value === reportType)?.label}
                </p>
                <p className="text-2xs text-gray-500 mt-0.5 font-medium">
                  {new Date().toLocaleDateString("en-MY", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {wardFilter !== "all" && ` · Ward ${wardFilter}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selected.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleting ? "Deleting..." : `Delete (${selected.size})`}
                  </button>
                )}
                <span className="text-2xs font-bold uppercase tracking-widest text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-2.5 py-1 rounded-full">
                  Preview
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading data…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            selected.size > 0 &&
                            selected.size ===
                              (reportType === "alerts_summary"
                                ? filteredAlerts.length
                                : reportType === "patient_intake"
                                ? filteredPatients.length
                                : wardRows.length)
                          }
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                        />
                      </th>
                      {cols
                        .filter((c) => activeCols.has(c.key))
                        .map((c) => (
                          <th
                            key={c.key}
                            className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap"
                          >
                            {c.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reportType === "patient_intake" &&
                      filteredPatients.map((p) => (
                        <tr key={p.id} className={`hover:bg-gray-50/60 transition-colors ${selected.has(p.id) ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-3 w-8">
                            <input
                              type="checkbox"
                              checked={selected.has(p.id)}
                              onChange={() => toggleSelect(p.id)}
                              className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                            />
                          </td>
                          {activeCols.has("name") && (
                            <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                              {p.name}
                            </td>
                          )}
                          {activeCols.has("bed") && (
                            <td className="px-4 py-3 text-gray-600 tabular-nums">{p.bedNumber}</td>
                          )}
                          {activeCols.has("ward") && (
                            <td className="px-4 py-3 text-gray-600">{p.ward}</td>
                          )}
                          {activeCols.has("diet") && (
                            <td className="px-4 py-3 text-gray-600">
                              {DIET_LABELS[p.dietType] ?? p.dietType}
                            </td>
                          )}
                          {activeCols.has("target") && (
                            <td className="px-4 py-3 text-gray-700 tabular-nums">
                              {p.kcalTarget.toLocaleString()}
                            </td>
                          )}
                          {activeCols.has("actual") && (
                            <td className="px-4 py-3 text-gray-700 tabular-nums">
                              {Math.round(p.todayKcal).toLocaleString()}
                            </td>
                          )}
                          {activeCols.has("pct") && (
                            <td
                              className={`px-4 py-3 font-bold tabular-nums ${
                                p.percentageEaten < 25
                                  ? "text-danger-600"
                                  : p.percentageEaten < 50
                                  ? "text-warning-600"
                                  : "text-primary-700"
                              }`}
                            >
                              {Math.round(p.percentageEaten)}%
                            </td>
                          )}
                          {activeCols.has("status") && (
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold ring-1 ring-inset ${
                                  p.statusLabel === "Critical"
                                    ? "bg-danger-50 text-danger-600 ring-danger-100"
                                    : p.statusLabel === "Low intake"
                                    ? "bg-warning-50 text-warning-600 ring-warning-100"
                                    : p.statusLabel === "On track"
                                    ? "bg-primary-50 text-primary-700 ring-primary-100"
                                    : "bg-gray-50 text-gray-600 ring-gray-200"
                                }`}
                              >
                                {p.statusLabel}
                              </span>
                            </td>
                          )}
                          {activeCols.has("alerts") && (
                            <td className="px-4 py-3">
                              {p.alertCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-2xs font-bold text-danger-600">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {p.alertCount}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}

                    {reportType === "alerts_summary" &&
                      filteredAlerts.map((a) => (
                        <tr
                          key={a.id}
                          className={`hover:bg-gray-50/60 transition-colors ${
                            a.isRead ? "opacity-60" : ""
                          } ${selected.has(a.id) ? "bg-red-50/40" : ""}`}
                        >
                          <td className="px-4 py-3 w-8">
                            <input
                              type="checkbox"
                              checked={selected.has(a.id)}
                              onChange={() => toggleSelect(a.id)}
                              className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                            />
                          </td>
                          {activeCols.has("patient") && (
                            <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                              {a.patient.name}
                            </td>
                          )}
                          {activeCols.has("bed") && (
                            <td className="px-4 py-3 text-gray-600 tabular-nums">{a.patient.bedNumber}</td>
                          )}
                          {activeCols.has("ward") && (
                            <td className="px-4 py-3 text-gray-600">{a.patient.ward}</td>
                          )}
                          {activeCols.has("type") && (
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ring-1 ring-inset ${
                                  a.type === "CRITICAL_INTAKE"
                                    ? "bg-danger-50 text-danger-600 ring-danger-100"
                                    : a.type === "LOW_INTAKE"
                                    ? "bg-warning-50 text-warning-600 ring-warning-100"
                                    : "bg-gray-50 text-gray-600 ring-gray-200"
                                }`}
                              >
                                {formatAlertType(a.type)}
                              </span>
                            </td>
                          )}
                          {activeCols.has("message") && (
                            <td className="px-4 py-3 text-gray-600 max-w-sm whitespace-normal break-words leading-relaxed">
                              {a.message}
                            </td>
                          )}
                          {activeCols.has("time") && (
                            <td className="px-4 py-3 text-2xs font-medium text-gray-400 whitespace-nowrap">
                              {timeAgo(a.createdAt)}
                            </td>
                          )}
                          {activeCols.has("read") && (
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold ring-1 ring-inset ${
                                  a.isRead
                                    ? "bg-gray-50 text-gray-500 ring-gray-200"
                                    : "bg-blue-50 text-blue-700 ring-blue-100"
                                }`}
                              >
                                {a.isRead ? "Read" : "Unread"}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))}

                    {reportType === "ward_overview" &&
                      wardRows.map((w) => (
                        <tr key={w.ward} className={`hover:bg-gray-50/60 transition-colors ${selected.has(w.ward) ? "bg-red-50/40" : ""}`}>
                          <td className="px-4 py-3 w-8">
                            <input
                              type="checkbox"
                              checked={selected.has(w.ward)}
                              onChange={() => toggleSelect(w.ward)}
                              className="rounded border-gray-300 text-red-500 focus:ring-red-400"
                            />
                          </td>
                          {activeCols.has("ward") && (
                            <td className="px-4 py-3 font-bold text-gray-900">Ward {w.ward}</td>
                          )}
                          {activeCols.has("patients") && (
                            <td className="px-4 py-3 text-gray-700 tabular-nums font-semibold">
                              {w.patients}
                            </td>
                          )}
                          {activeCols.has("meals") && (
                            <td className="px-4 py-3 text-gray-700 tabular-nums font-semibold">
                              {w.meals}
                            </td>
                          )}
                          {activeCols.has("avgPct") && (
                            <td
                              className={`px-4 py-3 font-bold tabular-nums ${
                                w.avgPct < 25
                                  ? "text-danger-600"
                                  : w.avgPct < 50
                                  ? "text-warning-600"
                                  : "text-primary-700"
                              }`}
                            >
                              {w.avgPct}%
                            </td>
                          )}
                          {activeCols.has("alerts") && (
                            <td className="px-4 py-3">
                              {w.alerts > 0 ? (
                                <span className="inline-flex items-center gap-1 text-2xs font-bold text-danger-600">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                  {w.alerts}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>
                </table>

                {((reportType === "patient_intake" && filteredPatients.length === 0) ||
                  (reportType === "alerts_summary" && filteredAlerts.length === 0) ||
                  (reportType === "ward_overview" && wardRows.length === 0)) && (
                  <p className="text-center text-gray-400 py-12 text-sm font-medium">
                    No data to display
                  </p>
                )}
              </div>
            )}

            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100 text-2xs font-medium text-gray-400 tabular-nums">
                {reportType === "patient_intake" && `${filteredPatients.length} patients`}
                {reportType === "alerts_summary" && `${filteredAlerts.length} alerts`}
                {reportType === "ward_overview" && `${wardRows.length} wards`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
