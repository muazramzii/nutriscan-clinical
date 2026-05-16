"use client";

import { useEffect, useRef, useState } from "react";
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
  const [wardOpen, setWardOpen] = useState(false);
  const wardRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wardRef.current && !wardRef.current.contains(e.target as Node)) {
        setWardOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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
          className="relative overflow-hidden rounded-3xl p-6 mb-4 text-white shadow-glow"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #0E5A42 100%)" }}
        >
          <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-3xl" />

          <div className="relative">
            <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
              Dietitian Dashboard
            </p>
            <h1 className="text-2xl font-bold mt-1 tracking-tight">
              Monitoring Dashboard
            </h1>
            <p className="text-sm text-white/80 mt-1">{today}</p>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="flex items-center justify-end mb-5">
          <div className="relative" ref={wardRef}>
            <button
              type="button"
              onClick={() => setWardOpen((o) => !o)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl pl-3.5 pr-3 py-2 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              <span>{wardFilter === "all" ? "All Wards" : `Ward ${wardFilter}`}</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${wardOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {wardOpen && (
              <div className="absolute right-0 top-full mt-1.5 min-w-[160px] bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-fade-in">
                {wards.map((w) => {
                  const label = w === "all" ? "All Wards" : `Ward ${w}`;
                  const isSelected = wardFilter === w;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => { setWardFilter(w); setWardOpen(false); }}
                      className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors text-left ${
                        isSelected
                          ? "bg-primary-50 text-primary-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50 font-medium"
                      }`}
                    >
                      <span>{label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
