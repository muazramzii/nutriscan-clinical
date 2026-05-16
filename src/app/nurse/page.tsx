"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { PatientCard } from "@/components/nurse/PatientCard";
import { NursePatientModal } from "@/components/nurse/NursePatientModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PatientWithMealStatus } from "@/types";

export default function NursePage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<PatientWithMealStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; patient?: PatientWithMealStatus | null }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<PatientWithMealStatus | null>(null);

  function fetchPatients() {
    fetch("/api/patients")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const mapped = (data.patients ?? []).map(
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
              BREAKFAST: p.mealLogs.find((l) => l.mealType === "BREAKFAST")?.status ?? null,
              LUNCH: p.mealLogs.find((l) => l.mealType === "LUNCH")?.status ?? null,
              DINNER: p.mealLogs.find((l) => l.mealType === "DINNER")?.status ?? null,
            },
          })
        );
        setPatients(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchPatients(); }, []);

  async function handleDelete(patient: PatientWithMealStatus) {
    await fetch(`/api/admin/patients/${patient.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchPatients();
  }

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedCount = patients.reduce((acc, p) => {
    const c = Object.values(p.mealStatus).filter((s) => s === "COMPLETE").length;
    return acc + c;
  }, 0);
  const totalMeals = patients.length * 3;
  const completionPct = totalMeals === 0 ? 0 : Math.round((completedCount / totalMeals) * 100);

  const nurseInitial = (session?.user?.name ?? "N").charAt(0).toUpperCase();

  return (
    <>
      {/* Sticky top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              <Image
                src="/logo.png"
                alt="NutriScan Clinical"
                fill
                priority
                sizes="32px"
                className="object-cover"
                style={{ objectPosition: "50% 38%", transform: "scale(1.55)" }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-gray-900 leading-tight tracking-tight">NutriScan</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 tracking-tight leading-none">
                Nurse Panel
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 text-[11px] text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-300 hover:text-gray-900 active:scale-[0.97] transition-all"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <div className="px-4 pb-6">
        {/* Date */}
        <p className="text-[11px] text-gray-500 mt-3 mb-2.5">{today}</p>

        {/* Hero profile card */}
        <div
          className="relative overflow-hidden rounded-2xl p-3.5 mb-4 text-white shadow-md shadow-primary/20"
          style={{ background: "linear-gradient(135deg, #1D9E75 0%, #116048 100%)" }}
        >
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/30">
              {nurseInitial}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-white/70">Nurse on duty</p>
              <p className="font-bold text-sm leading-tight truncate">{session?.user?.name ?? "—"}</p>
              <p className="text-[11px] text-white/80 mt-0.5">Ward {session?.user?.ward ?? "—"}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative grid grid-cols-3 gap-1.5">
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Patients</p>
              <p className="text-base font-bold leading-tight mt-0.5 tabular-nums">{patients.length}</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Meals</p>
              <p className="text-base font-bold leading-tight mt-0.5 tabular-nums">
                {completedCount}<span className="text-[10px] font-medium text-white/60">/{totalMeals}</span>
              </p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-white/70 font-semibold">Done</p>
              <p className="text-base font-bold leading-tight mt-0.5 tabular-nums">
                {completionPct}<span className="text-[10px] font-medium text-white/60">%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[13px] font-bold text-gray-900 tracking-tight">My Patients</h2>
          <div className="flex items-center gap-2">
            {!loading && patients.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary-50 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {patients.length} active
              </span>
            )}
            <button
              onClick={() => setModal({ open: true, patient: null })}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg tap-scale transition-all"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
        </div>

        {/* Patient list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-[11px] text-gray-400 mt-3">Loading patients…</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[13px] font-medium text-gray-600">No patients assigned</p>
            <p className="text-[11px] text-gray-400 mt-1">Patients will appear here once assigned</p>
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((p) => (
              <PatientCard
                key={p.id}
                {...p}
                onEdit={() => setModal({ open: true, patient: p })}
                onDelete={() => setDeleteTarget(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal.open && (
        <NursePatientModal
          patient={modal.patient}
          defaultWard={session?.user?.ward ?? ""}
          onClose={() => setModal({ open: false })}
          onSaved={fetchPatients}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900 text-center">Delete Patient?</p>
            <p className="text-xs text-gray-500 text-center mt-1">
              <span className="font-semibold text-gray-700">{deleteTarget.name}</span> will be permanently removed.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
