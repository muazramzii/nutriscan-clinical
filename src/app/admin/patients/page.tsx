"use client";

import { useEffect, useState, useMemo } from "react";
import { DietType } from "@/types";
import { DietTypeBadge } from "@/components/ui/Badge";
import { PatientModal } from "@/components/admin/PatientModal";

interface Patient {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  isActive: boolean;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; patient?: Patient | null }>({ open: false });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  async function fetchPatients() {
    const res = await fetch("/api/admin/patients");
    const data = await res.json();
    setPatients(data.patients ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  async function toggleActive(p: Patient) {
    await fetch(`/api/admin/patients/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPatients();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return patients.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.bedNumber.toLowerCase().includes(q) ||
        p.ward.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && p.isActive) ||
        (statusFilter === "inactive" && !p.isActive);
      return matchSearch && matchStatus;
    });
  }, [patients, search, statusFilter]);

  return (
    <div className="p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hospital patient records</p>
        </div>
        <button
          onClick={() => setModal({ open: true, patient: null })}
          className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-glow tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, bed or ward…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl text-sm">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 capitalize font-semibold rounded-lg transition-all ${
                statusFilter === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p className="text-2xs font-medium text-gray-400 mb-3 tabular-nums">
          {filtered.length} of {patients.length} patients
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Patient
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Bed
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Ward
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Diet
                  </th>
                  <th className="text-right px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Kcal Target
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-gray-50/60 transition-colors ${
                      !p.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                        >
                          {getInitials(p.name)}
                        </div>
                        <span className="font-semibold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium tabular-nums">{p.bedNumber}</td>
                    <td className="px-4 py-3 text-gray-600 font-medium">{p.ward}</td>
                    <td className="px-4 py-3">
                      <DietTypeBadge type={p.dietType} />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-semibold tabular-nums">
                      {p.kcalTarget.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-2xs font-semibold ring-1 ring-inset px-2 py-0.5 rounded-full ${
                          p.isActive
                            ? "bg-primary-50 text-primary-700 ring-primary-100"
                            : "bg-gray-100 text-gray-500 ring-gray-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.isActive ? "bg-primary" : "bg-gray-400"
                          }`}
                        />
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setModal({ open: true, patient: p })}
                          className="text-2xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-3 py-1.5 rounded-lg hover:bg-primary-100/60 tap-scale"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          className="text-2xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 tap-scale"
                        >
                          {p.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-gray-600">No patients match your search</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <PatientModal
          patient={modal.patient}
          onClose={() => setModal({ open: false })}
          onSaved={fetchPatients}
        />
      )}
    </div>
  );
}
