"use client";

import { useEffect, useState, useMemo } from "react";
import { DietType } from "@/types";
import { DietTypeBadge } from "@/components/ui/Badge";

interface Patient {
  id: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  isActive: boolean;
}

interface WardGroup {
  ward: string;
  patients: Patient[];
  active: number;
  inactive: number;
  dietBreakdown: Partial<Record<DietType, number>>;
}

const DIET_COLORS: Record<DietType, string> = {
  DIABETIC: "bg-blue-50 text-blue-700 ring-blue-100",
  LOW_SODIUM: "bg-purple-50 text-purple-700 ring-purple-100",
  POST_SURGERY: "bg-orange-50 text-orange-700 ring-orange-100",
  RENAL: "bg-amber-50 text-amber-700 ring-amber-100",
  REGULAR: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const DIET_LABELS: Record<DietType, string> = {
  DIABETIC: "Diabetic",
  LOW_SODIUM: "Low Sodium",
  POST_SURGERY: "Post Surgery",
  RENAL: "Renal",
  REGULAR: "Regular",
};

function AddWardModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (ward: string) => void;
}) {
  const [ward, setWard] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ward.trim()) return;
    onSave(ward.trim().toUpperCase());
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900 text-lg tracking-tight">Add Ward</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Ward Name / Number
            </label>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. 5A, ICU, NICU"
              required
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 tap-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-glow-sm tap-scale"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              Add Ward
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WardsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [extraWards, setExtraWards] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/admin/patients")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? []);
        setLoading(false);
      });

    const saved = localStorage.getItem("nutriscan-extra-wards");
    if (saved) setExtraWards(JSON.parse(saved));
  }, []);

  function saveExtraWards(next: string[]) {
    setExtraWards(next);
    localStorage.setItem("nutriscan-extra-wards", JSON.stringify(next));
  }

  function handleAddWard(ward: string) {
    if (!extraWards.includes(ward)) saveExtraWards([...extraWards, ward]);
    setShowModal(false);
  }

  function removeWard(ward: string) {
    saveExtraWards(extraWards.filter((w) => w !== ward));
  }

  const wardGroups = useMemo<WardGroup[]>(() => {
    const allWards = new Set([...extraWards, ...patients.map((p) => p.ward)]);
    return Array.from(allWards)
      .sort((a, b) => a.localeCompare(b))
      .map((ward) => {
        const pts = patients
          .filter((p) => p.ward === ward)
          .sort((a, b) => a.bedNumber.localeCompare(b.bedNumber));
        const dietBreakdown: Partial<Record<DietType, number>> = {};
        pts.forEach((p) => {
          dietBreakdown[p.dietType] = (dietBreakdown[p.dietType] ?? 0) + 1;
        });
        return {
          ward,
          patients: pts,
          active: pts.filter((p) => p.isActive).length,
          inactive: pts.filter((p) => !p.isActive).length,
          dietBreakdown,
        };
      });
  }, [patients, extraWards]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return wardGroups;
    return wardGroups.filter(
      (w) =>
        w.ward.toLowerCase().includes(q) ||
        w.patients.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.bedNumber.toLowerCase().includes(q)
        )
    );
  }, [wardGroups, search]);

  function toggleExpand(ward: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(ward) ? next.delete(ward) : next.add(ward);
      return next;
    });
  }

  const totalActive = patients.filter((p) => p.isActive).length;

  return (
    <div className="p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Wards</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hospital wards and patient distribution</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-glow tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Ward
        </button>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-blue-50 blur-2xl opacity-60" />
            <div className="relative flex items-start justify-between mb-2">
              <p className="text-2xs font-bold uppercase tracking-widest text-gray-500">Total Wards</p>
              <div className="w-9 h-9 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="relative text-3xl font-black text-gray-900 tabular-nums">{wardGroups.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-50 blur-2xl opacity-60" />
            <div className="relative flex items-start justify-between mb-2">
              <p className="text-2xs font-bold uppercase tracking-widest text-gray-500">Total Patients</p>
              <div className="w-9 h-9 rounded-xl bg-amber-50 ring-1 ring-inset ring-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="relative text-3xl font-black text-gray-900 tabular-nums">{patients.length}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary-50 blur-2xl opacity-60" />
            <div className="relative flex items-start justify-between mb-2">
              <p className="text-2xs font-bold uppercase tracking-widest text-primary-700">Active Patients</p>
              <div className="w-9 h-9 rounded-xl bg-primary-50 ring-1 ring-inset ring-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="relative text-3xl font-black text-primary tabular-nums">{totalActive}</p>
          </div>
        </div>
      )}

      {/* Search + controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
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
            placeholder="Search by ward, patient or bed…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={() => setExpanded(new Set(filtered.map((w) => w.ward)))}
          className="text-2xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 tap-scale"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpanded(new Set())}
          className="text-2xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 tap-scale"
        >
          Collapse All
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <p className="text-sm font-medium text-gray-600">No wards found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => {
            const isOpen = expanded.has(w.ward);
            const hasPatients = w.patients.length > 0;

            return (
              <div
                key={w.ward}
                className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm"
                    style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                  >
                    {w.ward.slice(0, 3)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 tracking-tight">Ward {w.ward}</p>
                    <div className="flex items-center gap-3 mt-1 text-2xs font-medium flex-wrap">
                      <span className="text-gray-500">
                        {w.patients.length} patient{w.patients.length !== 1 ? "s" : ""}
                      </span>
                      {w.active > 0 && (
                        <span className="inline-flex items-center gap-1 text-primary-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {w.active} active
                        </span>
                      )}
                      {w.inactive > 0 && (
                        <span className="text-gray-400">{w.inactive} inactive</span>
                      )}
                      {!hasPatients && (
                        <span className="text-amber-600">No patients assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex flex-wrap gap-1 justify-end max-w-xs">
                    {(Object.entries(w.dietBreakdown) as [DietType, number][]).map(([diet, count]) => (
                      <span
                        key={diet}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold ring-1 ring-inset ${DIET_COLORS[diet]}`}
                      >
                        {DIET_LABELS[diet]} <strong className="tabular-nums">{count}</strong>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!hasPatients && (
                      <button
                        onClick={() => removeWard(w.ward)}
                        className="text-2xs font-semibold text-danger-600 bg-danger-50 ring-1 ring-inset ring-danger-100 px-2.5 py-1.5 rounded-lg hover:bg-danger-100/60 tap-scale"
                      >
                        Remove
                      </button>
                    )}
                    {hasPatients && (
                      <button
                        onClick={() => toggleExpand(w.ward)}
                        className="inline-flex items-center gap-1 text-2xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 tap-scale"
                      >
                        {isOpen ? "Hide" : "View"} patients
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && hasPatients && (
                  <div className="border-t border-gray-100 animate-fade-in overflow-x-auto">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            Patient
                          </th>
                          <th className="text-left px-4 py-2.5 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            Bed
                          </th>
                          <th className="text-left px-4 py-2.5 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            Diet
                          </th>
                          <th className="text-right px-4 py-2.5 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            Kcal Target
                          </th>
                          <th className="text-left px-4 py-2.5 text-2xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {w.patients.map((p) => (
                          <tr
                            key={p.id}
                            className={`hover:bg-gray-50/60 transition-colors ${
                              !p.isActive ? "opacity-50" : ""
                            }`}
                          >
                            <td className="px-5 py-3 font-semibold text-gray-900">{p.name}</td>
                            <td className="px-4 py-3 text-gray-600 tabular-nums">{p.bedNumber}</td>
                            <td className="px-4 py-3">
                              <DietTypeBadge type={p.dietType} />
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 font-semibold tabular-nums">
                              {p.kcalTarget.toLocaleString()}{" "}
                              <span className="text-2xs text-gray-400 font-normal">kcal</span>
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <AddWardModal onClose={() => setShowModal(false)} onSave={handleAddWard} />
      )}
    </div>
  );
}
