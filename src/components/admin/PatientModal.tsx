"use client";

import { useState, useEffect } from "react";
import { DietType } from "@/types";

const DIET_TYPES: { value: DietType; label: string }[] = [
  { value: "REGULAR", label: "Regular" },
  { value: "DIABETIC", label: "Diabetic" },
  { value: "LOW_SODIUM", label: "Low Sodium" },
  { value: "POST_SURGERY", label: "Post Surgery" },
  { value: "RENAL", label: "Renal" },
];

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
    if (!res.ok) {
      setError("Failed to save.");
      return;
    }
    onSaved();
    onClose();
  }

  function inputField(label: string, key: keyof typeof form, type = "text") {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          required
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div
          className="relative px-6 py-5 text-white"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
                {patient ? "Edit" : "New"}
              </p>
              <h2 className="font-bold text-lg tracking-tight mt-0.5">
                {patient ? "Edit Patient" : "Add Patient"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/15 backdrop-blur-sm ring-1 ring-white/20 hover:bg-white/25 tap-scale"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {inputField("Name", "name")}
          <div className="grid grid-cols-2 gap-3">
            {inputField("Bed Number", "bedNumber")}
            {inputField("Ward", "ward")}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Diet Type</label>
            <select
              value={form.dietType}
              onChange={(e) =>
                setForm((f) => ({ ...f, dietType: e.target.value as DietType }))
              }
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
            >
              {DIET_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {inputField("Kcal Target", "kcalTarget", "number")}

          {error && (
            <div className="flex items-center gap-2 text-sm font-medium text-danger-600 bg-danger-50 ring-1 ring-inset ring-danger-100 px-3 py-2.5 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 tap-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-glow-sm tap-scale disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
