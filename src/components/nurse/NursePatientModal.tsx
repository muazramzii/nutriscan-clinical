"use client";

import { useState, useEffect, useRef } from "react";
import { DietType } from "@/types";

const DIET_TYPES: { value: DietType; label: string; color: string }[] = [
  { value: "DIABETIC",     label: "Diabetic",     color: "bg-blue-100 text-blue-700" },
  { value: "LOW_SODIUM",   label: "Low Sodium",   color: "bg-purple-100 text-purple-700" },
  { value: "POST_SURGERY", label: "Post Surgery", color: "bg-orange-100 text-orange-700" },
  { value: "RENAL",        label: "Renal",        color: "bg-yellow-100 text-yellow-700" },
  { value: "REGULAR",      label: "Regular",      color: "bg-green-100 text-green-700" },
];

interface PatientData {
  id?: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
}

interface Props {
  patient?: PatientData | null;
  defaultWard?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function NursePatientModal({ patient, defaultWard = "", onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    bedNumber: "",
    ward: defaultWard,
    dietType: "REGULAR" as DietType,
    kcalTarget: "1800",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dietOpen, setDietOpen] = useState(false);
  const dietRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dietRef.current && !dietRef.current.contains(e.target as Node)) {
        setDietOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (!res.ok) { setError("Failed to save. Please try again."); return; }
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
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
    );
  }

  const selected = DIET_TYPES.find((d) => d.value === form.dietType)!;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div
          className="px-5 py-4 rounded-t-2xl flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
              {patient ? "Edit Patient" : "New Patient"}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              {patient ? patient.name : "Add to your ward"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {input("Full Name", "name")}

          <div className="grid grid-cols-2 gap-3">
            {input("Bed No.", "bedNumber")}
            {input("Ward", "ward")}
          </div>

          {/* Diet Type dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Diet Type</label>
            <div ref={dietRef} className="relative">
              <button
                type="button"
                onClick={() => setDietOpen((o) => !o)}
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selected.color}`}>
                  {selected.label}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dietOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dietOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {DIET_TYPES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, dietType: d.value })); setDietOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${form.dietType === d.value ? "bg-gray-50" : ""}`}
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${d.color}`}>{d.label}</span>
                      {form.dietType === d.value && (
                        <svg className="w-4 h-4 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {input("Kcal Target", "kcalTarget", "number")}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-all"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              {saving ? "Saving..." : patient ? "Save Changes" : "Add Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
