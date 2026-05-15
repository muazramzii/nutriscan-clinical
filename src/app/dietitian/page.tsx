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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <DietitianNavbar
        nurseName={session?.user?.name ?? ""}
        unreadAlertCount={data?.unreadAlertCount ?? 0}
        onBellClick={() => setShowAlerts((s) => !s)}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Monitoring Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-MY", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Ward filter */}
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {wards.map((w) => (
              <option key={w} value={w}>
                {w === "all" ? "All Wards" : `Ward ${w}`}
              </option>
            ))}
          </select>
        </div>

        {data && (
          <StatsCards
            patientCount={data.patients.length}
            loggedMeals={data.loggedMealsToday}
            totalMeals={data.totalMealsToday}
            activeAlerts={data.unreadAlertCount}
          />
        )}

        <div className={`grid gap-6 ${showAlerts ? "grid-cols-3" : "grid-cols-1"}`}>
          <div className={showAlerts ? "col-span-2" : "col-span-1"}>
            {data && (
              <PatientTable
                patients={data.patients}
                wardFilter={wardFilter}
              />
            )}
          </div>

          {showAlerts && (
            <div>
              <AlertsPanel alerts={alerts} onMarkRead={handleMarkRead} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
