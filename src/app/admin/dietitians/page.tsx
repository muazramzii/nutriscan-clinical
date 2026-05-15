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

  useEffect(() => { fetchDietitians(); }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dietitians</h1>
          <p className="text-sm text-gray-500">Manage dietitian accounts</p>
        </div>
        <button
          onClick={() => setModal({ open: true, item: null })}
          className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-600"
        >
          + Add Dietitian
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assigned Ward</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Registered Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dietitians.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.email}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.ward ? `Ward ${d.ward}` : <span className="text-gray-400 italic">All wards</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(d.createdAt).toLocaleDateString("en-MY")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setModal({ open: true, item: d })}
                      className="text-xs text-primary border border-primary-100 px-2 py-1 rounded-md hover:bg-primary-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {dietitians.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No dietitians found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
