"use client";

import { useState, useEffect } from "react";
import { DietType } from "@/types";

const DIET_TYPES: DietType[] = ["DIABETIC", "LOW_SODIUM", "POST_SURGERY", "RENAL", "REGULAR"];

interface PatientData {
  id?: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  isActive?: boolean;
}

interface Props {
  patient?: PatientData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PatientModal({ patient, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    bedNumber: "",
    ward: "",
    dietType: "REGULAR" as DietType,
    kcalTarget: "1800",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name,
        bedNumber: patient.bedNumber,
        ward: patient.ward,
        dietType: patient.dietType,
        kcalTarget: String(patient.kcalTarget),
      });
    }
  }, [patient]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name: form.name,
      bedNumber: form.bedNumber,
      ward: form.ward,
      dietType: form.dietType,
      kcalTarget: parseInt(form.kcalTarget),
    };

    const url = patient?.id ? `/api/admin/patients/${patient.id}` : "/api/admin/patients";
    const method = patient?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) { setError("Gagal menyimpan. / Failed to save."); return; }
    onSaved();
    onClose();
  }

  function input(label: string, key: keyof typeof form, type = "text") {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">
            {patient ? "Edit Pesakit / Edit Patient" : "Tambah Pesakit / Add Patient"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {input("Nama / Name", "name")}
          <div className="grid grid-cols-2 gap-3">
            {input("No. Katil / Bed No.", "bedNumber")}
            {input("Ward", "ward")}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Diet / Diet Type</label>
            <select
              value={form.dietType}
              onChange={(e) => setForm((f) => ({ ...f, dietType: e.target.value as DietType }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {DIET_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {input("Sasaran Kcal / Kcal Target", "kcalTarget", "number")}

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg">
              Batal / Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan / Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
