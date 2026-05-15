"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DietitianNavbar } from "@/components/dietitian/DietitianNavbar";
import { StatsCards } from "@/components/dietitian/StatsCards";
import { PatientTable } from "@/components/dietitian/PatientTable";
import { AlertsPanel } from "@/components/dietitian/AlertsPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DashboardPatient, AlertWithPatient } from "@/types";

interface DashboardData {
  patients: DashboardPatient[];
  unreadAlertCount: number;
  totalMealsToday: number;
  loggedMealsToday: number;
}

export default function DietitianDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<AlertWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [wardFilter, setWardFilter] = useState("all");
  const [showAlerts, setShowAlerts] = useState(false);

  async function fetchData() {
    const [dashRes, alertsRes] = await Promise.all([
      fetch("/api/dashboard/dietitian"),
      fetch("/api/alerts"),
    ]);
    const dashData = await dashRes.json();
    const alertsData = await alertsRes.json();
    setData(dashData);
    setAlerts(alertsData.alerts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleMarkRead(alertId: string) {
    await fetch(`/api/alerts/${alertId}`, { method: "PATCH" });
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
    setData((prev) =>
      prev
        ? { ...prev, unreadAlertCount: Math.max(0, prev.unreadAlertCount - 1) }
        : prev
    );
  }

  const wards = data
    ? ["all", ...Array.from(new Set(data.patients.map((p) => p.ward))).sort()]
    : ["all"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-gray-400">Loading dashboard…</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <DietitianNavbar
        nurseName={session?.user?.name ?? ""}
        unreadAlertCount={data?.unreadAlertCount ?? 0}
        onBellClick={() => setShowAlerts((s) => !s)}
      />

      <div className="max-w-7xl mx-auto px-6 py-6 animate-fade-in">
        {/* Hero header */}
        <div
          className="relative overflow-hidden rounded-3xl p-6 mb-6 text-white shadow-glow"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />

          <div className="relative flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
                Dietitian Dashboard
              </p>
              <h1 className="text-2xl font-bold mt-1 tracking-tight">
                Monitoring Dashboard
              </h1>
              <p className="text-sm text-white/80 mt-1">{today}</p>
            </div>

            {/* Ward filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={wardFilter}
                  onChange={(e) => setWardFilter(e.target.value)}
                  className="appearance-none bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl pl-3.5 pr-9 py-2 text-sm font-semibold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
                >
                  {wards.map((w) => (
                    <option key={w} value={w} className="text-gray-900">
                      {w === "all" ? "All Wards" : `Ward ${w}`}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {data && (
          <StatsCards
            patientCount={data.patients.length}
            loggedMeals={data.loggedMealsToday}
            totalMeals={data.totalMealsToday}
            activeAlerts={data.unreadAlertCount}
            highPriorityCount={data.patients.filter((p) => p.priority === "HIGH").length}
          />
        )}

        <div className={`grid gap-6 ${showAlerts ? "lg:grid-cols-3 grid-cols-1" : "grid-cols-1"}`}>
          <div className={showAlerts ? "lg:col-span-2" : "col-span-1"}>
            {data && (
              <PatientTable
                patients={data.patients}
                wardFilter={wardFilter}
              />
            )}
          </div>

          {showAlerts && (
            <div className="animate-fade-in">
              <AlertsPanel alerts={alerts} onMarkRead={handleMarkRead} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
