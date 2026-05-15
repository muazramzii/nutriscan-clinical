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
  DIABETIC:     "bg-blue-100 text-blue-700",
  LOW_SODIUM:   "bg-purple-100 text-purple-700",
  POST_SURGERY: "bg-orange-100 text-orange-700",
  RENAL:        "bg-yellow-100 text-yellow-700",
  REGULAR:      "bg-green-100 text-green-700",
};

const DIET_LABELS: Record<DietType, string> = {
  DIABETIC: "Diabetic", LOW_SODIUM: "Low Sodium",
  POST_SURGERY: "Post Surgery", RENAL: "Renal", REGULAR: "Regular",
};

function AddWardModal({ onClose, onSave }: {
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Add Ward</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ward Name / Number</label>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. 5A, ICU, NICU"
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600">
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
      .then((data) => { setPatients(data.patients ?? []); setLoading(false); });

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
        pts.forEach((p) => { dietBreakdown[p.dietType] = (dietBreakdown[p.dietType] ?? 0) + 1; });
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
    return wardGroups.filter((w) =>
      w.ward.toLowerCase().includes(q) ||
      w.patients.some((p) =>
        p.name.toLowerCase().includes(q) || p.bedNumber.toLowerCase().includes(q)
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
    <div className="p-6">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wards</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage hospital wards and patient distribution</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Ward
        </button>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium">Total Wards</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{wardGroups.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{patients.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium">Active Patients</p>
            <p className="text-2xl font-bold text-primary mt-1">{totalActive}</p>
          </div>
        </div>
      )}

      {/* Search + controls */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by ward, patient or bed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button onClick={() => setExpanded(new Set(filtered.map((w) => w.ward)))}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          Expand All
        </button>
        <button onClick={() => setExpanded(new Set())}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          Collapse All
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm">No wards found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => {
            const isOpen = expanded.has(w.ward);
            const hasPatients = w.patients.length > 0;

            return (
              <div key={w.ward} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Ward badge */}
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{w.ward.slice(0, 3)}</span>
                  </div>

                  {/* Ward info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">Ward {w.ward}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{w.patients.length} patients</span>
                      {w.active > 0 && <span className="text-xs text-primary font-medium">{w.active} active</span>}
                      {w.inactive > 0 && <span className="text-xs text-gray-400">{w.inactive} inactive</span>}
                      {!hasPatients && <span className="text-xs text-amber-500">No patients assigned</span>}
                    </div>
                  </div>

                  {/* Diet breakdown */}
                  <div className="hidden md:flex flex-wrap gap-1 justify-end max-w-xs">
                    {(Object.entries(w.dietBreakdown) as [DietType, number][]).map(([diet, count]) => (
                      <span key={diet} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${DIET_COLORS[diet]}`}>
                        {DIET_LABELS[diet]} <strong>{count}</strong>
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!hasPatients && (
                      <button
                        onClick={() => removeWard(w.ward)}
                        className="text-xs text-red-400 border border-red-100 px-2 py-1 rounded-md hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                    {hasPatients && (
                      <button
                        onClick={() => toggleExpand(w.ward)}
                        className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {isOpen ? "Hide" : "View"} patients
                        <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded patient table */}
                {isOpen && hasPatients && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Bed</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Diet</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Kcal Target</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {w.patients.map((p) => (
                          <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? "opacity-50" : ""}`}>
                            <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                            <td className="px-4 py-3 text-gray-600">{p.bedNumber}</td>
                            <td className="px-4 py-3"><DietTypeBadge type={p.dietType} /></td>
                            <td className="px-4 py-3 text-right text-gray-700">{p.kcalTarget.toLocaleString()} kcal</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? "bg-primary-50 text-primary" : "bg-gray-100 text-gray-500"}`}>
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
        <AddWardModal
          onClose={() => setShowModal(false)}
          onSave={handleAddWard}
        />
      )}
    </div>
  );
}
