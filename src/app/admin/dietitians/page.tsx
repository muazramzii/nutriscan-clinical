"use client";

import { useEffect, useState } from "react";
import { DietitianModal } from "@/components/admin/DietitianModal";

interface Dietitian {
  id: string;
  name: string;
  email: string;
  ward: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AdminDietitiansPage() {
  const [dietitians, setDietitians] = useState<Dietitian[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Dietitian | null }>({ open: false });

  async function fetchDietitians() {
    const res = await fetch("/api/admin/dietitians");
    const data = await res.json();
    setDietitians(data.dietitians ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchDietitians();
  }, []);

  return (
    <div className="p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dietitians</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage dietitian accounts</p>
        </div>
        <button
          onClick={() => setModal({ open: true, item: null })}
          className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-glow tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Dietitian
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">All Dietitians</h3>
                <p className="text-2xs text-gray-500 mt-0.5">
                  {dietitians.length} account{dietitians.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Assigned Ward
                  </th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                    Registered
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dietitians.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                        >
                          {getInitials(d.name)}
                        </div>
                        <span className="font-semibold text-gray-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.email}</td>
                    <td className="px-4 py-3">
                      {d.ward ? (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-2 py-0.5 rounded-full">
                          Ward {d.ward}
                        </span>
                      ) : (
                        <span className="text-2xs font-medium text-gray-400 italic">All wards</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-2xs font-medium text-gray-500 tabular-nums">
                      {new Date(d.createdAt).toLocaleDateString("en-MY")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setModal({ open: true, item: d })}
                        className="text-2xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-3 py-1.5 rounded-lg hover:bg-primary-100/60 tap-scale"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {dietitians.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-gray-600">No dietitians found</p>
                      <p className="text-xs text-gray-400 mt-1">Add one to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <DietitianModal
          dietitian={modal.item}
          onClose={() => setModal({ open: false })}
          onSaved={fetchDietitians}
        />
      )}
    </div>
  );
}
