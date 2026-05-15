"use client";

import { useEffect, useState } from "react";
import { DashboardPatient, AlertWithPatient } from "@/types";

type ReportType = "patient_intake" | "alerts_summary" | "ward_overview";

const REPORT_TYPES: { value: ReportType; label: string; icon: string; desc: string }[] = [
  { value: "patient_intake",  label: "Patient Daily Intake",  icon: "🍽️", desc: "Today's calorie intake per patient" },
  { value: "alerts_summary",  label: "Alerts Summary",        icon: "🔔", desc: "Low intake and critical alerts" },
  { value: "ward_overview",   label: "Ward Overview",         icon: "🏥", desc: "Aggregated stats grouped by ward" },
];

const INTAKE_COLS  = [
  { key: "name",     label: "Patient Name", always: true },
  { key: "bed",      label: "Bed No." },
  { key: "ward",     label: "Ward" },
  { key: "diet",     label: "Diet Type" },
  { key: "target",   label: "Target (kcal)" },
  { key: "actual",   label: "Actual (kcal)" },
  { key: "pct",      label: "% Eaten" },
  { key: "status",   label: "Status" },
  { key: "alerts",   label: "Alerts" },
];

const ALERT_COLS = [
  { key: "patient",  label: "Patient", always: true },
  { key: "bed",      label: "Bed No." },
  { key: "ward",     label: "Ward" },
  { key: "type",     label: "Alert Type" },
  { key: "message",  label: "Message" },
  { key: "time",     label: "Time" },
  { key: "read",     label: "Status" },
];

const WARD_COLS = [
  { key: "ward",     label: "Ward", always: true },
  { key: "patients", label: "Patients" },
  { key: "meals",    label: "Meals Logged" },
  { key: "avgPct",   label: "Avg % Eaten" },
  { key: "alerts",   label: "Active Alerts" },
];

const DIET_LABELS: Record<string, string> = {
  DIABETIC: "Diabetic", LOW_SODIUM: "Low Sodium",
  POST_SURGERY: "Post Surgery", RENAL: "Renal", REGULAR: "Regular",
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

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? []);
        setAlerts(data.alerts ?? []);
        setLoading(false);
      });
  }, []);

  // Reset columns when report type changes
  useEffect(() => {
    const cols =
      reportType === "patient_intake" ? INTAKE_COLS :
      reportType === "alerts_summary" ? ALERT_COLS : WARD_COLS;
    setActiveCols(new Set(cols.map((c) => c.key)));
    setWardFilter("all");
  }, [reportType]);

  const wards = ["all", ...Array.from(new Set(patients.map((p) => p.ward))).sort()];

  const filteredPatients = wardFilter === "all"
    ? patients
    : patients.filter((p) => p.ward === wardFilter);

  const filteredAlerts = wardFilter === "all"
    ? alerts
    : alerts.filter((a) => a.patient.ward === wardFilter);

  const wardRows: WardRow[] = Array.from(new Set(patients.map((p) => p.ward)))
    .sort()
    .filter((w) => wardFilter === "all" || w === wardFilter)
    .map((ward) => {
      const wPatients = patients.filter((p) => p.ward === ward);
      const meals = wPatients.filter(
        (p) => p.mealStatus.BREAKFAST === "COMPLETE" ||
               p.mealStatus.LUNCH === "COMPLETE" ||
               p.mealStatus.DINNER === "COMPLETE"
      ).length;
      const avgPct = wPatients.length
        ? Math.round(wPatients.reduce((s, p) => s + p.percentageEaten, 0) / wPatients.length)
        : 0;
      const activeAlerts = alerts.filter((a) => a.patient.ward === ward && !a.isRead).length;
      return { ward, patients: wPatients.length, meals, avgPct, alerts: activeAlerts };
    });

  const cols =
    reportType === "patient_intake" ? INTAKE_COLS :
    reportType === "alerts_summary" ? ALERT_COLS : WARD_COLS;

  function toggleCol(key: string) {
    setActiveCols((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
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
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });

      // Header
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
          if (activeCols.has("name"))   row.push(p.name);
          if (activeCols.has("bed"))    row.push(p.bedNumber);
          if (activeCols.has("ward"))   row.push(p.ward);
          if (activeCols.has("diet"))   row.push(DIET_LABELS[p.dietType] ?? p.dietType);
          if (activeCols.has("target")) row.push(`${p.kcalTarget.toLocaleString()}`);
          if (activeCols.has("actual")) row.push(`${Math.round(p.todayKcal).toLocaleString()}`);
          if (activeCols.has("pct"))    row.push(`${Math.round(p.percentageEaten)}%`);
          if (activeCols.has("status")) row.push(p.statusLabel);
          if (activeCols.has("alerts")) row.push(p.alertCount > 0 ? `⚠ ${p.alertCount}` : "—");
          return row;
        });
        autoTable(doc, {
          head: [head], body,
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
          if (activeCols.has("bed"))     row.push(a.patient.bedNumber);
          if (activeCols.has("ward"))    row.push(a.patient.ward);
          if (activeCols.has("type"))    row.push(formatAlertType(a.type));
          if (activeCols.has("message")) row.push(a.message);
          if (activeCols.has("time"))    row.push(timeAgo(a.createdAt));
          if (activeCols.has("read"))    row.push(a.isRead ? "Read" : "Unread");
          return row;
        });
        autoTable(doc, {
          head: [head], body,
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
          if (activeCols.has("ward"))     row.push(`Ward ${w.ward}`);
          if (activeCols.has("patients")) row.push(String(w.patients));
          if (activeCols.has("meals"))    row.push(String(w.meals));
          if (activeCols.has("avgPct"))   row.push(`${w.avgPct}%`);
          if (activeCols.has("alerts"))   row.push(w.alerts > 0 ? `⚠ ${w.alerts}` : "—");
          return row;
        });
        autoTable(doc, {
          head: [head], body,
          startY,
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [239, 246, 255] },
        });
      }

      const filename = `nutriscan-${reportType.replace("_", "-")}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Generate and export PDF reports</p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* ── Config panel ── */}
        <div className="col-span-1 space-y-5">

          {/* Report type */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Report Type</p>
            <div className="space-y-2">
              {REPORT_TYPES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReportType(r.value)}
                  className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                    reportType === r.value
                      ? "border-primary bg-primary-50 text-primary"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg mt-0.5">{r.icon}</span>
                  <div>
                    <p className="text-sm font-medium leading-tight">{r.label}</p>
                    <p className="text-xs text-gray-400 leading-tight mt-0.5">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ward filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filter by Ward</p>
            <div className="space-y-1">
              {wards.map((w) => (
                <button
                  key={w}
                  onClick={() => setWardFilter(w)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    wardFilter === w
                      ? "bg-primary-50 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {w === "all" ? "All Wards" : `Ward ${w}`}
                </button>
              ))}
            </div>
          </div>

          {/* Column toggles */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Columns</p>
            <div className="space-y-2">
              {cols.map((c) => (
                <label key={c.key} className={`flex items-center gap-2 text-sm ${c.always ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                  <input
                    type="checkbox"
                    checked={activeCols.has(c.key)}
                    disabled={c.always}
                    onChange={() => !c.always && toggleCol(c.key)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating PDF...
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
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Preview header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {REPORT_TYPES.find((r) => r.value === reportType)?.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date().toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" })}
                  {wardFilter !== "all" && ` · Ward ${wardFilter}`}
                </p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Preview</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-gray-400 text-sm">Loading data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {cols.filter((c) => activeCols.has(c.key)).map((c) => (
                        <th key={c.key} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reportType === "patient_intake" && filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        {activeCols.has("name")   && <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{p.name}</td>}
                        {activeCols.has("bed")    && <td className="px-4 py-3 text-gray-600">{p.bedNumber}</td>}
                        {activeCols.has("ward")   && <td className="px-4 py-3 text-gray-600">{p.ward}</td>}
                        {activeCols.has("diet")   && <td className="px-4 py-3 text-gray-600">{DIET_LABELS[p.dietType] ?? p.dietType}</td>}
                        {activeCols.has("target") && <td className="px-4 py-3 text-gray-700">{p.kcalTarget.toLocaleString()}</td>}
                        {activeCols.has("actual") && <td className="px-4 py-3 text-gray-700">{Math.round(p.todayKcal).toLocaleString()}</td>}
                        {activeCols.has("pct")    && (
                          <td className={`px-4 py-3 font-semibold ${
                            p.percentageEaten < 25 ? "text-red-600" :
                            p.percentageEaten < 50 ? "text-amber-600" : "text-green-600"
                          }`}>{Math.round(p.percentageEaten)}%</td>
                        )}
                        {activeCols.has("status") && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.statusLabel === "Critical" ? "bg-red-100 text-red-700" :
                              p.statusLabel === "Low intake" ? "bg-amber-100 text-amber-700" :
                              p.statusLabel === "On track" ? "bg-green-100 text-green-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>{p.statusLabel}</span>
                          </td>
                        )}
                        {activeCols.has("alerts") && (
                          <td className="px-4 py-3">
                            {p.alertCount > 0
                              ? <span className="text-red-600 font-medium">⚠ {p.alertCount}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                        )}
                      </tr>
                    ))}

                    {reportType === "alerts_summary" && filteredAlerts.map((a) => (
                      <tr key={a.id} className={`hover:bg-gray-50 ${a.isRead ? "opacity-60" : ""}`}>
                        {activeCols.has("patient") && <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{a.patient.name}</td>}
                        {activeCols.has("bed")     && <td className="px-4 py-3 text-gray-600">{a.patient.bedNumber}</td>}
                        {activeCols.has("ward")    && <td className="px-4 py-3 text-gray-600">{a.patient.ward}</td>}
                        {activeCols.has("type")    && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              a.type === "CRITICAL_INTAKE" ? "bg-red-100 text-red-700" :
                              a.type === "LOW_INTAKE" ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>{formatAlertType(a.type)}</span>
                          </td>
                        )}
                        {activeCols.has("message") && <td className="px-4 py-3 text-gray-600 max-w-sm whitespace-normal break-words">{a.message}</td>}
                        {activeCols.has("time")    && <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{timeAgo(a.createdAt)}</td>}
                        {activeCols.has("read")    && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${a.isRead ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
                              {a.isRead ? "Read" : "Unread"}
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}

                    {reportType === "ward_overview" && wardRows.map((w) => (
                      <tr key={w.ward} className="hover:bg-gray-50">
                        {activeCols.has("ward")     && <td className="px-4 py-3 font-semibold text-gray-900">Ward {w.ward}</td>}
                        {activeCols.has("patients") && <td className="px-4 py-3 text-gray-700">{w.patients}</td>}
                        {activeCols.has("meals")    && <td className="px-4 py-3 text-gray-700">{w.meals}</td>}
                        {activeCols.has("avgPct")   && (
                          <td className={`px-4 py-3 font-semibold ${
                            w.avgPct < 25 ? "text-red-600" : w.avgPct < 50 ? "text-amber-600" : "text-green-600"
                          }`}>{w.avgPct}%</td>
                        )}
                        {activeCols.has("alerts")   && (
                          <td className="px-4 py-3">
                            {w.alerts > 0
                              ? <span className="text-red-600 font-medium">⚠ {w.alerts}</span>
                              : <span className="text-gray-300">—</span>}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Empty state */}
                {(
                  (reportType === "patient_intake" && filteredPatients.length === 0) ||
                  (reportType === "alerts_summary" && filteredAlerts.length === 0) ||
                  (reportType === "ward_overview" && wardRows.length === 0)
                ) && (
                  <p className="text-center text-gray-400 py-10 text-sm">No data to display.</p>
                )}
              </div>
            )}

            {/* Row count footer */}
            {!loading && (
              <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
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
