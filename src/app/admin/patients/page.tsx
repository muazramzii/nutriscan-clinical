"use client";

import { useEffect, useState } from "react";
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

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; patient?: Patient | null }>({ open: false });

  async function fetchPatients() {
    const res = await fetch("/api/admin/patients");
    const data = await res.json();
    setPatients(data.patients ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchPatients(); }, []);

  async function toggleActive(p: Patient) {
    await fetch(`/api/admin/patients/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPatients();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Patients / Pesakit</h1>
          <p className="text-sm text-gray-500">Urus rekod pesakit hospital</p>
        </div>
        <button
          onClick={() => setModal({ open: true, patient: null })}
          className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-600"
        >
          + Tambah Pesakit
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Memuatkan...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nama / Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Katil / Bed</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ward</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Diet</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Kcal Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${!p.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.bedNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{p.ward}</td>
                  <td className="px-4 py-3"><DietTypeBadge type={p.dietType} /></td>
                  <td className="px-4 py-3 text-right text-gray-700">{p.kcalTarget.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isActive ? "bg-primary-50 text-primary" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setModal({ open: true, patient: p })}
                        className="text-xs text-primary border border-primary-100 px-2 py-1 rounded-md hover:bg-primary-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(p)}
                        className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50"
                      >
                        {p.isActive ? "Nyahaktif" : "Aktifkan"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
